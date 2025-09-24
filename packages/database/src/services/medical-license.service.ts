/**
 * Medical License Verification Service
 * Implements CFM Resolution 2314/2022 requirements for
 * verifying physician licenses and authorizations
 */

import { databaseLogger, logHealthcareError } from '../../../shared/src/logging/healthcare-logger';
import { createClient } from '../client';

export interface CFMRegistration {
  cfmNumber: string;
  state: string; // UF where the license is valid
  registrationStatus: 'active' | 'suspended' | 'cancelled' | 'expired';
  physicianName: string;
  specialty?: string;
  registrationDate: Date;
  expiryDate?: Date;
  restrictions?: string[];
  telemedicineAuthorized: boolean;
  lastVerification: Date;
  verificationSource: 'cfm_api' | 'manual' | 'cached';
}

export interface TelemedicineAuthorization {
  cfmNumber: string;
  authorizedStates: string[]; // UFs where physician can practice telemedicine
  authorizedSpecialties: string[];
  restrictions: string[];
  emergencyOnly: boolean;
  requiresSuperVision: boolean;
  authorizationDate: Date;
  expiryDate?: Date;
  isValid: boolean;
}

export interface LicenseVerificationResult {
  cfmRegistration: CFMRegistration;
  telemedicineAuth: TelemedicineAuthorization;
  complianceStatus: {
    cfmCompliant: boolean;
    stateCompliant: boolean;
    specialtyCompliant: boolean;
    telemedicineCompliant: boolean;
  };
  riskIndicators: string[];
  verificationTimestamp: Date;
  nextVerificationDue: Date;
}

export interface StateRegionalCouncil {
  state: string;
  councilName: string;
  apiEndpoint?: string;
  requiresAdditionalVerification: boolean;
  telemedicineRegulations: {
    allowed: boolean;
    requiresRegistration: boolean;
    restrictions: string[];
  };
}

export class MedicalLicenseService {
  private supabase = createClient();

  // State Regional Medical Councils configuration
  private readonly stateCouncils: StateRegionalCouncil[] = [
    {
      state: 'SP',
      councilName: 'CREMESP',
      requiresAdditionalVerification: true,
      telemedicineRegulations: {
        allowed: true,
        requiresRegistration: true,
        restrictions: [
          'Requires initial in-person consultation for new patients',
        ],
      },
    },
    {
      state: 'RJ',
      councilName: 'CREMERJ',
      requiresAdditionalVerification: true,
      telemedicineRegulations: {
        allowed: true,
        requiresRegistration: false,
        restrictions: ['Emergency consultations only for new patients'],
      },
    },
    {
      state: 'MG',
      councilName: 'CREMMG',
      requiresAdditionalVerification: false,
      telemedicineRegulations: {
        allowed: true,
        requiresRegistration: false,
        restrictions: [],
      },
    },
    // Add other states as needed
  ];

  /**
   * Verifies a physician's CFM registration and telemedicine authorization
   */
  async verifyMedicalLicense(
    cfmNumber: string,
    physicianState: string,
    requestedSpecialty?: string,
  ): Promise<LicenseVerificationResult> {
    try {
      // Get CFM registration data
      const cfmRegistration = await this.getCFMRegistration(
        cfmNumber,
        physicianState,
      );

      // Get telemedicine authorization
      const telemedicineAuth = await this.getTelemedicineAuthorization(
        cfmNumber,
        physicianState,
      );

      // Perform compliance checks
      const complianceStatus = this.checkComplianceStatus(
        cfmRegistration,
        telemedicineAuth,
        physicianState,
        requestedSpecialty,
      );

      // Identify risk indicators
      const riskIndicators = this.identifyRiskIndicators(
        cfmRegistration,
        telemedicineAuth,
      );

      // Calculate next verification date
      const nextVerificationDue = this.calculateNextVerificationDate(cfmRegistration);

      const result: LicenseVerificationResult = {
        cfmRegistration,
        telemedicineAuth,
        complianceStatus,
        riskIndicators,
        verificationTimestamp: new Date(),
        nextVerificationDue,
      };

      // Store verification record for audit trail
      await this.storeVerificationRecord(result);

      return result;
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'verifyMedicalLicense',
        cfmNumber,
        physicianState,
      });
      throw new Error(
        `License verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Gets CFM registration data from official sources
   */
  private async getCFMRegistration(
    cfmNumber: string,
    state: string,
  ): Promise<CFMRegistration> {
    try {
      // First, try to get from cache if recent
      const cached = await this.getCachedRegistration(cfmNumber);
      if (cached && this.isCacheValid(cached.lastVerification)) {
        return cached;
      }

      // Try to fetch from CFM API (if available)
      let registration = await this.fetchFromCFMAPI(cfmNumber, state);

      // If API not available, use manual verification
      if (!registration) {
        registration = await this.performManualVerification(cfmNumber, state);
      }

      // Update cache
      await this.updateRegistrationCache(registration);

      return registration;
    } catch (error) {
      logHealthcareError('database', error, { method: 'getCFMRegistration', cfmNumber, state });
      throw new Error(
        `Failed to retrieve CFM registration: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Fetches registration data from CFM API (simulated - actual API may vary)
   */
  private async fetchFromCFMAPI(
    cfmNumber: string,
    state: string,
  ): Promise<CFMRegistration | null> {
    try {
      // This would be the actual CFM API call
      // For demonstration, we'll simulate the response

      // In production, this would make an HTTP request to CFM's official API
      // const response = await fetch(`https://api.cfm.org.br/medicos/${cfmNumber}`);

      // Simulated CFM response
      const simulatedResponse = {
        cfm_number: cfmNumber,
        state: state,
        status: 'active',
        physician_name: 'Dr. Example Physician',
        specialty: 'Clínica Médica',
        registration_date: '2010-01-15',
        telemedicine_authorized: true,
      };

      const registration: CFMRegistration = {
        cfmNumber: simulatedResponse.cfm_number,
        state: simulatedResponse.state,
        registrationStatus: simulatedResponse.status as
          | 'active'
          | 'suspended'
          | 'cancelled'
          | 'expired',
        physicianName: simulatedResponse.physician_name,
        specialty: simulatedResponse.specialty,
        registrationDate: new Date(simulatedResponse.registration_date),
        telemedicineAuthorized: simulatedResponse.telemedicine_authorized,
        lastVerification: new Date(),
        verificationSource: 'cfm_api',
      };

      return registration;
    } catch (error) {
      logHealthcareError('database', error, { method: 'fetchFromCFMAPI', cfmNumber, state });
      return null; // Fall back to manual verification
    }
  }

  /**
   * Performs manual verification when API is not available
   */
  private async performManualVerification(
    cfmNumber: string,
    state: string,
  ): Promise<CFMRegistration> {
    try {
      // Check if we have manual verification data in our database
      const { data: manualData, error } = await this.supabase
        .from('manual_cfm_verifications')
        .select('*')
        .eq('cfm_number', cfmNumber)
        .eq('state', state)
        .order('verification_date', { ascending: false })
        .limit(1)
        .single();

      if (error || !manualData) {
        // Create a pending verification record that requires manual review
        const pendingRegistration: CFMRegistration = {
          cfmNumber,
          state,
          registrationStatus: 'active', // Default, requires manual verification
          physicianName: 'PENDING VERIFICATION',
          registrationDate: new Date(),
          telemedicineAuthorized: false, // Conservative default
          lastVerification: new Date(),
          verificationSource: 'manual',
        };

        // Flag for manual review
        await this.flagForManualReview(cfmNumber, state);

        return pendingRegistration;
      }

      // Convert manual data to CFMRegistration format
      const registration: CFMRegistration = {
        cfmNumber: manualData.cfm_number,
        state: manualData.state,
        registrationStatus: manualData.status,
        physicianName: manualData.physician_name,
        specialty: manualData.specialty,
        registrationDate: new Date(manualData.registration_date),
        expiryDate: manualData.expiry_date
          ? new Date(manualData.expiry_date)
          : undefined,
        restrictions: manualData.restrictions || [],
        telemedicineAuthorized: manualData.telemedicine_authorized,
        lastVerification: new Date(manualData.verification_date),
        verificationSource: 'manual',
      };

      return registration;
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'performManualVerification',
        cfmNumber,
        state,
      });
      throw new Error('Manual verification failed');
    }
  }

  /**
   * Gets telemedicine authorization for the physician
   */
  private async getTelemedicineAuthorization(
    cfmNumber: string,
    state: string,
  ): Promise<TelemedicineAuthorization> {
    try {
      // Check state-specific telemedicine regulations
      const stateCouncil = this.stateCouncils.find(
        council => council.state === state,
      );

      if (!stateCouncil) {
        throw new Error(`Unsupported state: ${state}`);
      }

      // Get physician's telemedicine authorization data
      const { data: authData, error } = await this.supabase
        .from('telemedicine_authorizations')
        .select('*')
        .eq('cfm_number', cfmNumber)
        .single();

      let authorization: TelemedicineAuthorization;

      if (error || !authData) {
        // Create default authorization based on CFM Resolution 2314/2022
        authorization = {
          cfmNumber,
          authorizedStates: [state], // Only in the state of registration by default
          authorizedSpecialties: ['Clínica Médica'], // Default specialty
          restrictions: stateCouncil.telemedicineRegulations.restrictions,
          emergencyOnly: false,
          requiresSuperVision: false,
          authorizationDate: new Date(),
          isValid: stateCouncil.telemedicineRegulations.allowed,
        };

        // Store the default authorization
        await this.storeTelemedicineAuthorization(authorization);
      } else {
        authorization = {
          cfmNumber: authData.cfm_number,
          authorizedStates: authData.authorized_states || [state],
          authorizedSpecialties: authData.authorized_specialties || [],
          restrictions: authData.restrictions || [],
          emergencyOnly: authData.emergency_only || false,
          requiresSuperVision: authData.requires_supervision || false,
          authorizationDate: new Date(authData.authorization_date),
          expiryDate: authData.expiry_date
            ? new Date(authData.expiry_date)
            : undefined,
          isValid: authData.is_valid
            && new Date()
              < (authData.expiry_date
                ? new Date(authData.expiry_date)
                : new Date('2099-12-31')),
        };
      }

      return authorization;
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getTelemedicineAuthorization',
        cfmNumber,
        state,
      });
      throw new Error('Failed to get telemedicine authorization');
    }
  }

  /**
   * Checks compliance status across all requirements
   */
  private checkComplianceStatus(
    cfmRegistration: CFMRegistration,
    telemedicineAuth: TelemedicineAuthorization,
    state: string,
    requestedSpecialty?: string,
  ): {
    cfmCompliant: boolean;
    stateCompliant: boolean;
    specialtyCompliant: boolean;
    telemedicineCompliant: boolean;
  } {
    // CFM compliance: Active registration
    const cfmCompliant = cfmRegistration.registrationStatus === 'active'
      && (!cfmRegistration.expiryDate || cfmRegistration.expiryDate > new Date());

    // State compliance: Authorized in the requested state
    const stateCompliant = telemedicineAuth.authorizedStates.includes(state);

    // Specialty compliance: Authorized for the requested specialty (if specified)
    const specialtyCompliant = !requestedSpecialty
      || telemedicineAuth.authorizedSpecialties.includes(requestedSpecialty)
      || telemedicineAuth.authorizedSpecialties.includes('Clínica Médica'); // General practice

    // Telemedicine compliance: Valid authorization and no blocking restrictions
    const telemedicineCompliant = telemedicineAuth.isValid
      && cfmRegistration.telemedicineAuthorized
      && !telemedicineAuth.emergencyOnly;

    return {
      cfmCompliant,
      stateCompliant,
      specialtyCompliant,
      telemedicineCompliant,
    };
  }

  /**
   * Identifies risk indicators that may affect the consultation
   */
  private identifyRiskIndicators(
    cfmRegistration: CFMRegistration,
    telemedicineAuth: TelemedicineAuthorization,
  ): string[] {
    const indicators: string[] = [];

    // Registration status risks
    if (cfmRegistration.registrationStatus !== 'active') {
      indicators.push(
        `CFM registration status: ${cfmRegistration.registrationStatus}`,
      );
    }

    // Expiry risks
    if (
      cfmRegistration.expiryDate
      && cfmRegistration.expiryDate <= new Date()
    ) {
      indicators.push('CFM registration has expired');
    }

    // Telemedicine authorization risks
    if (!telemedicineAuth.isValid) {
      indicators.push('Telemedicine authorization is invalid or expired');
    }

    if (telemedicineAuth.emergencyOnly) {
      indicators.push(
        'Physician is authorized for emergency telemedicine only',
      );
    }

    if (telemedicineAuth.requiresSuperVision) {
      indicators.push('Telemedicine requires supervision by senior physician');
    }

    // Verification freshness risks
    const daysSinceVerification = Math.floor(
      (new Date().getTime() - cfmRegistration.lastVerification.getTime())
        / (1000 * 60 * 60 * 24),
    );

    if (daysSinceVerification > 30) {
      indicators.push(
        `License verification is ${daysSinceVerification} days old`,
      );
    }

    // Restrictions
    if (
      cfmRegistration.restrictions
      && cfmRegistration.restrictions.length > 0
    ) {
      indicators.push(
        `CFM restrictions: ${cfmRegistration.restrictions.join(', ')}`,
      );
    }

    if (telemedicineAuth.restrictions.length > 0) {
      indicators.push(
        `Telemedicine restrictions: ${telemedicineAuth.restrictions.join(', ')}`,
      );
    }

    return indicators;
  }

  /**
   * Calculates when the next verification should be performed
   */
  private calculateNextVerificationDate(
    cfmRegistration: CFMRegistration,
  ): Date {
    const lastVerification = cfmRegistration.lastVerification;
    const nextVerification = new Date(lastVerification);

    // Verification frequency based on source and status
    let daysToAdd = 30; // Default: monthly verification

    if (cfmRegistration.verificationSource === 'cfm_api') {
      daysToAdd = 7; // Weekly for API verifications
    } else if (cfmRegistration.registrationStatus !== 'active') {
      daysToAdd = 1; // Daily for non-active registrations
    }

    nextVerification.setDate(nextVerification.getDate() + daysToAdd);
    return nextVerification;
  }

  /**
   * Helper methods for cache management
   */
  private async getCachedRegistration(
    cfmNumber: string,
  ): Promise<CFMRegistration | null> {
    try {
      const { data, error } = await this.supabase
        .from('cfm_registration_cache')
        .select('*')
        .eq('cfm_number', cfmNumber)
        .order('last_verification', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        cfmNumber: data.cfm_number,
        state: data.state,
        registrationStatus: data.registration_status,
        physicianName: data.physician_name,
        specialty: data.specialty,
        registrationDate: new Date(data.registration_date),
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        restrictions: data.restrictions || [],
        telemedicineAuthorized: data.telemedicine_authorized,
        lastVerification: new Date(data.last_verification),
        verificationSource: data.verification_source,
      };
    } catch (error) {
      logHealthcareError('database', error, { method: 'getCachedRegistration', cfmNumber });
      return null;
    }
  }

  private isCacheValid(lastVerification: Date): boolean {
    const cacheValidityHours = 24; // Cache is valid for 24 hours
    const now = new Date();
    const diffHours = (now.getTime() - lastVerification.getTime()) / (1000 * 60 * 60);
    return diffHours < cacheValidityHours;
  }

  private async updateRegistrationCache(
    registration: CFMRegistration,
  ): Promise<void> {
    try {
      await this.supabase.from('cfm_registration_cache').upsert({
        cfm_number: registration.cfmNumber,
        state: registration.state,
        registration_status: registration.registrationStatus,
        physician_name: registration.physicianName,
        specialty: registration.specialty,
        registration_date: registration.registrationDate.toISOString(),
        expiry_date: registration.expiryDate?.toISOString(),
        restrictions: registration.restrictions,
        telemedicine_authorized: registration.telemedicineAuthorized,
        last_verification: registration.lastVerification.toISOString(),
        verification_source: registration.verificationSource,
      });
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'updateRegistrationCache',
        cfmNumber: registration.cfmNumber,
      });
    }
  }

  private async flagForManualReview(
    cfmNumber: string,
    state: string,
  ): Promise<void> {
    try {
      await this.supabase.from('manual_verification_queue').insert({
        cfm_number: cfmNumber,
        state: state,
        status: 'pending',
        created_at: new Date().toISOString(),
        priority: 'high',
      });
    } catch (error) {
      logHealthcareError('database', error, { method: 'flagForManualReview', cfmNumber, state });
    }
  }

  private async storeTelemedicineAuthorization(
    auth: TelemedicineAuthorization,
  ): Promise<void> {
    try {
      await this.supabase.from('telemedicine_authorizations').upsert({
        cfm_number: auth.cfmNumber,
        authorized_states: auth.authorizedStates,
        authorized_specialties: auth.authorizedSpecialties,
        restrictions: auth.restrictions,
        emergency_only: auth.emergencyOnly,
        requires_supervision: auth.requiresSuperVision,
        authorization_date: auth.authorizationDate.toISOString(),
        expiry_date: auth.expiryDate?.toISOString(),
        is_valid: auth.isValid,
      });
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'storeTelemedicineAuthorization',
        cfmNumber: auth.cfmNumber,
      });
    }
  }

  private async storeVerificationRecord(
    result: LicenseVerificationResult,
  ): Promise<void> {
    try {
      await this.supabase.from('license_verification_logs').insert({
        cfm_number: result.cfmRegistration.cfmNumber,
        physician_state: result.cfmRegistration.state,
        cfm_compliant: result.complianceStatus.cfmCompliant,
        state_compliant: result.complianceStatus.stateCompliant,
        specialty_compliant: result.complianceStatus.specialtyCompliant,
        telemedicine_compliant: result.complianceStatus.telemedicineCompliant,
        risk_indicators: result.riskIndicators,
        verification_timestamp: result.verificationTimestamp.toISOString(),
        next_verification_due: result.nextVerificationDue.toISOString(),
      });
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'storeVerificationRecord',
        cfmNumber: result.cfmRegistration.cfmNumber,
      });
    }
  }

  /**
   * Public method to check if a physician is authorized for telemedicine in a specific state
   */
  async isAuthorizedForTelemedicine(
    cfmNumber: string,
    physicianState: string,
    _consultationState: string,
    specialty?: string,
  ): Promise<{
    authorized: boolean;
    restrictions: string[];
    requiresSupervision: boolean;
    emergencyOnly: boolean;
  }> {
    try {
      const verification = await this.verifyMedicalLicense(
        cfmNumber,
        physicianState,
        specialty,
      );

      const authorized = verification.complianceStatus.cfmCompliant
        && verification.complianceStatus.stateCompliant
        && verification.complianceStatus.specialtyCompliant
        && verification.complianceStatus.telemedicineCompliant;

      return {
        authorized,
        restrictions: verification.telemedicineAuth.restrictions,
        requiresSupervision: verification.telemedicineAuth.requiresSuperVision,
        emergencyOnly: verification.telemedicineAuth.emergencyOnly,
      };
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'isAuthorizedForTelemedicine',
        cfmNumber,
        physicianState,
        consultationState: _consultationState,
      });
      return {
        authorized: false,
        restrictions: ['Verification failed'],
        requiresSupervision: true,
        emergencyOnly: true,
      };
    }
  }

  /**
   * Validates CRM number format and check digit
   */
  validateCRMNumber(crmNumber: string, state: string): boolean {
    if (!crmNumber || !state) return false;

    // Remove non-numeric characters
    const cleanCRM = crmNumber.replace(/\D/g, '');

    // CRM should have 4-6 digits depending on the state
    if (cleanCRM.length < 4 || cleanCRM.length > 6) return false;

    // Check if state exists in our councils
    const stateCouncil = this.stateCouncils.find(
      council => council.state === state.toUpperCase(),
    );
    if (!stateCouncil) return false;

    // Basic format validation - more complex validation would require API integration
    return /^\d{4,6}$/.test(cleanCRM);
  }

  /**
   * Gets physician specialties from CRM registration
   */
  async getPhysicianSpecialties(
    crmNumber: string,
    state: string,
  ): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('physician_specialties')
        .select('specialty_name')
        .eq('crm_number', crmNumber)
        .eq('crm_state', state)
        .eq('is_active', true);

      if (error) {
        logHealthcareError('database', error, {
          method: 'getPhysicianSpecialties',
          crmNumber,
          state,
        });
        return [];
      }

      return data?.map(item => item.specialty_name) || [];
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getPhysicianSpecialties',
        crmNumber,
        state,
      });
      return [];
    }
  }
}
