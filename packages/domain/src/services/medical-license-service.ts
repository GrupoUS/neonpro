/**
 * Medical License Verification Domain Service
 * Implements CFM Resolution 2314/2022 requirements for
 * verifying physician licenses and authorizations
 * 
 * This service contains the business logic that was previously in the database layer
 */

/**
 * CFM Registration interface
 */
export interface CFMRegistration {
  cfmNumber: string;
  state: string; // UF where the license is valid
  registrationStatus: "active" | "suspended" | "cancelled" | "expired";
  physicianName: string;
  specialty?: string;
  registrationDate: Date;
  expiryDate?: Date;
  restrictions?: string[];
  telemedicineAuthorized: boolean;
  lastVerification: Date;
  verificationSource: "cfm_api" | "manual" | "cached";
}

/**
 * Telemedicine Authorization interface
 */
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

/**
 * License Verification Result
 */
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

/**
 * State Regional Council interface
 */
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

/**
 * Verification Request interface
 */
export interface LicenseVerificationRequest {
  cfmNumber: string;
  physicianState: string;
  requestedSpecialty?: string;
  requestedStates?: string[]; // For multi-state telemedicine
  verificationContext?: {
    ipAddress?: string;
    userAgent?: string;
    clinicId?: string;
    sessionId?: string;
  };
}

/**
 * Domain Service for Medical License Verification
 */
export class MedicalLicenseDomainService {
  private licenseRepository: any;

  constructor(licenseRepository?: any) {
    this.licenseRepository = licenseRepository;
  }
  // State Regional Medical Councils configuration
  private readonly stateCouncils: StateRegionalCouncil[] = [
    {
      state: "SP",
      councilName: "CREMESP",
      requiresAdditionalVerification: true,
      telemedicineRegulations: {
        allowed: true,
        requiresRegistration: true,
        restrictions: [
          "Requires initial in-person consultation for new patients",
        ],
      },
    },
    {
      state: "RJ",
      councilName: "CREMERJ",
      requiresAdditionalVerification: true,
      telemedicineRegulations: {
        allowed: true,
        requiresRegistration: false,
        restrictions: ["Emergency consultations only for new patients"],
      },
    },
    {
      state: "MG",
      councilName: "CREMMG",
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
   * @param request License verification request
   * @returns License verification result
   */
  async verifyMedicalLicense(_request: LicenseVerificationRequest): Promise<LicenseVerificationResult> {
    try {
      // Validate request
      this.validateVerificationRequest(_request);

      // Get CFM registration data
      const cfmRegistration = await this.getCFMRegistration(
        _request.cfmNumber,
        _request.physicianState,
      );

      // Get telemedicine authorization
      const telemedicineAuth = await this.getTelemedicineAuthorization(
        _request.cfmNumber,
        _request.physicianState,
        _request.requestedStates || [_request.physicianState],
      );

      // Perform compliance checks
      const complianceStatus = this.checkComplianceStatus(
        cfmRegistration,
        telemedicineAuth,
        _request.physicianState,
        _request.requestedSpecialty,
        _request.requestedStates,
      );

      // Identify risk indicators
      const riskIndicators = this.identifyRiskIndicators(
        cfmRegistration,
        telemedicineAuth,
        _request.physicianState,
        _request.requestedSpecialty,
        _request.requestedStates,
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
      await this.storeVerificationRecord(result, _request);

      return result;
    } catch (error) {
      console.error("Error verifying medical license:", error);
      throw new Error(
        `License verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Validates verification request
   * @param request Verification request
   */
  private validateVerificationRequest(request: LicenseVerificationRequest): void {
    if (!request.cfmNumber || !request.cfmNumber.trim()) {
      throw new Error("CFM number is required");
    }

    if (!_request.physicianState || !_request.physicianState.trim()) {
      throw new Error("Physician state is required");
    }

    // Validate CFM number format
    if (!this.validateCFMNumberFormat(_request.cfmNumber)) {
      throw new Error("Invalid CFM number format");
    }

    // Validate state
    if (!this.isValidState(_request.physicianState)) {
      throw new Error(`Unsupported state: ${_request.physicianState}`);
    }

    // Validate requested states if provided
    if (_request.requestedStates) {
      for (const state of _request.requestedStates) {
        if (!this.isValidState(state)) {
          throw new Error(`Unsupported requested state: ${state}`);
        }
      }
    }
  }

  /**
   * Gets CFM registration data from official sources
   * @param cfmNumber CFM registration number
   * @param state Physician's state
   * @returns CFM registration data
   */
  private async getCFMRegistration(cfmNumber: string, state: string): Promise<CFMRegistration> {
    try {
      // First, try to get from cache if recent
      const cached = await this.getCachedRegistration(cfmNumber, state);
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
      console.error("Error getting CFM registration:", error);
      throw new Error(
        `Failed to retrieve CFM registration: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Fetches registration data from CFM API
   * @param cfmNumber CFM registration number
   * @param state Physician's state
   * @returns CFM registration data or null if API unavailable
   */
  private async fetchFromCFMAPI(cfmNumber: string, state: string): Promise<CFMRegistration | null> {
    try {
      // This would be the actual CFM API call
      // In production, this would make an HTTP request to CFM's official API
      // const response = await fetch(`https://api.cfm.org.br/medicos/${cfmNumber}`);

      // For demonstration, simulate API response
      const simulatedResponse = {
        cfm_number: cfmNumber,
        state: state,
        status: "active",
        physician_name: "Dr. Example Physician",
        specialty: "Clínica Médica",
        registration_date: "2010-01-15",
        telemedicine_authorized: true,
      };

      const registration: CFMRegistration = {
        cfmNumber: simulatedResponse.cfm_number,
        state: simulatedResponse.state,
        registrationStatus: simulatedResponse.status as
          | "active"
          | "suspended"
          | "cancelled"
          | "expired",
        physicianName: simulatedResponse.physician_name,
        specialty: simulatedResponse.specialty,
        registrationDate: new Date(simulatedResponse.registration_date),
        telemedicineAuthorized: simulatedResponse.telemedicine_authorized,
        lastVerification: new Date(),
        verificationSource: "cfm_api",
      };

      return registration;
    } catch (error) {
      console.error("Error fetching from CFM API:", error);
      return null; // Fall back to manual verification
    }
  }

  /**
   * Performs manual verification when API is not available
   * @param cfmNumber CFM registration number
   * @param state Physician's state
   * @returns CFM registration data
   */
  private async performManualVerification(cfmNumber: string, state: string): Promise<CFMRegistration> {
    try {
      // Implement manual verification using repository
      const manualData = await this.licenseRepository.getManualVerification(cfmNumber, state);

      // For now, create a pending verification record
      const pendingRegistration: CFMRegistration = {
        cfmNumber,
        state,
        registrationStatus: "active", // Default, requires manual verification
        physicianName: "PENDING VERIFICATION",
        registrationDate: new Date(),
        telemedicineAuthorized: false, // Conservative default
        lastVerification: new Date(),
        verificationSource: "manual",
      };

      // Flag for manual review
      await this.flagForManualReview(cfmNumber, state);

      return pendingRegistration;
    } catch (error) {
      console.error("Error in manual verification:", error);
      throw new Error("Manual verification failed");
    }
  }

  /**
   * Gets telemedicine authorization for the physician
   * @param cfmNumber CFM registration number
   * @param state Physician's state
   * @param requestedStates States where telemedicine is requested
   * @returns Telemedicine authorization
   */
  private async getTelemedicineAuthorization(
    cfmNumber: string,
    state: string,
    requestedStates: string[]
  ): Promise<TelemedicineAuthorization> {
    try {
      // Check state-specific telemedicine regulations
      const stateCouncil = this.stateCouncils.find((council) => council.state === state,
      );

      if (!stateCouncil) {
        throw new Error(`Unsupported state: ${state}`);
      }

      // Get physician's telemedicine authorization data from repository
      let authData = await this.licenseRepository.getTelemedicineAuthorization(cfmNumber);

      let authorization: TelemedicineAuthorization;

      // if (!authData) {
        // Create default authorization based on CFM Resolution 2314/2022
        authorization = {
          cfmNumber,
          authorizedStates: this.calculateAuthorizedStates(state, requestedStates),
          authorizedSpecialties: ["Clínica Médica"], // Default specialty
          restrictions: this.calculateAuthorizationRestrictions(state, requestedStates),
          emergencyOnly: this.isEmergencyOnly(state, requestedStates),
          requiresSuperVision: this.requiresSupervision(state, requestedStates),
          authorizationDate: new Date(),
          isValid: stateCouncil.telemedicineRegulations.allowed,
        };

        // Store the default authorization
        // await this.licenseRepository.storeTelemedicineAuthorization(authorization);
      // } else {
      //   authorization = this.mapToTelemedicineAuthorization(authData);
      // }

      return authorization;
    } catch (error) {
      console.error("Error getting telemedicine authorization:", error);
      throw new Error("Failed to get telemedicine authorization");
    }
  }

  /**
   * Checks compliance status across all requirements
   * @param cfmRegistration CFM registration
   * @param telemedicineAuth Telemedicine authorization
   * @param state Physician's state
   * @param requestedSpecialty Requested specialty
   * @param requestedStates Requested states for telemedicine
   * @returns Compliance status
   */
  private checkComplianceStatus(
    cfmRegistration: CFMRegistration,
    telemedicineAuth: TelemedicineAuthorization,
    state: string,
    requestedSpecialty?: string,
    requestedStates?: string[]
  ): {
    cfmCompliant: boolean;
    stateCompliant: boolean;
    specialtyCompliant: boolean;
    telemedicineCompliant: boolean;
  } {
    // CFM compliance: Active registration
    const cfmCompliant =
      cfmRegistration.registrationStatus === "active" &&
      (!cfmRegistration.expiryDate || cfmRegistration.expiryDate > new Date());

    // State compliance: Authorized in the requested states
    const requestedStatesList = requestedStates || [state];
    const stateCompliant = requestedStatesList.every(requestedState =>
      telemedicineAuth.authorizedStates.includes(requestedState)
    );

    // Specialty compliance: Authorized for the requested specialty
    const specialtyCompliant =
      !requestedSpecialty ||
      telemedicineAuth.authorizedSpecialties.includes(requestedSpecialty) ||
      telemedicineAuth.authorizedSpecialties.includes("Clínica Médica");

    // Telemedicine compliance: Valid authorization and no blocking restrictions
    const telemedicineCompliant =
      telemedicineAuth.isValid &&
      cfmRegistration.telemedicineAuthorized &&
      !telemedicineAuth.emergencyOnly;

    return {
      cfmCompliant,
      stateCompliant,
      specialtyCompliant,
      telemedicineCompliant,
    };
  }

  /**
   * Identifies risk indicators that may affect the consultation
   * @param cfmRegistration CFM registration
   * @param telemedicineAuth Telemedicine authorization
   * @param state Physician's state
   * @param requestedSpecialty Requested specialty
   * @param requestedStates Requested states for telemedicine
   * @returns Array of risk indicators
   */
  private identifyRiskIndicators(
    cfmRegistration: CFMRegistration,
    telemedicineAuth: TelemedicineAuthorization,
    state: string,
    requestedSpecialty?: string,
    requestedStates?: string[]
  ): string[] {
    const indicators: string[] = [];

    // Registration status risks
    if (cfmRegistration.registrationStatus !== "active") {
      indicators.push(
        `CFM registration status: ${cfmRegistration.registrationStatus}`,
      );
    }

    // Expiry risks
    if (
      cfmRegistration.expiryDate &&
      cfmRegistration.expiryDate <= new Date()
    ) {
      indicators.push("CFM registration has expired");
    }

    // Telemedicine authorization risks
    if (!telemedicineAuth.isValid) {
      indicators.push("Telemedicine authorization is invalid or expired");
    }

    if (telemedicineAuth.emergencyOnly) {
      indicators.push(
        "Physician is authorized for emergency telemedicine only",
      );
    }

    if (telemedicineAuth.requiresSuperVision) {
      indicators.push("Telemedicine requires supervision by senior physician");
    }

    // State authorization risks
    const requestedStatesList = requestedStates || [state];
    const unauthorizedStates = requestedStatesList.filter(s => 
      !telemedicineAuth.authorizedStates.includes(s)
    );
    
    if (unauthorizedStates.length > 0) {
      indicators.push(`Not authorized for telemedicine in states: ${unauthorizedStates.join(', ')}`);
    }

    // Specialty authorization risks
    if (requestedSpecialty && !telemedicineAuth.authorizedSpecialties.includes(requestedSpecialty)) {
      indicators.push(`Not authorized for specialty: ${requestedSpecialty}`);
    }

    // Verification freshness risks
    const daysSinceVerification = Math.floor(
      (new Date().getTime() - cfmRegistration.lastVerification.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysSinceVerification > 30) {
      indicators.push(
        `License verification is ${daysSinceVerification} days old`,
      );
    }

    // Restrictions
    if (
      cfmRegistration.restrictions &&
      cfmRegistration.restrictions.length > 0
    ) {
      indicators.push(
        `CFM restrictions: ${cfmRegistration.restrictions.join(", ")}`,
      );
    }

    if (telemedicineAuth.restrictions.length > 0) {
      indicators.push(
        `Telemedicine restrictions: ${telemedicineAuth.restrictions.join(", ")}`,
      );
    }

    return indicators;
  }

  /**
   * Calculates when the next verification should be performed
   * @param cfmRegistration CFM registration
   * @returns Next verification date
   */
  private calculateNextVerificationDate(cfmRegistration: CFMRegistration): Date {
    const lastVerification = cfmRegistration.lastVerification;
    const nextVerification = new Date(lastVerification);

    // Verification frequency based on source and status
    let daysToAdd = 30; // Default: monthly verification

    if (cfmRegistration.verificationSource === "cfm_api") {
      daysToAdd = 7; // Weekly for API verifications
    } else if (cfmRegistration.registrationStatus !== "active") {
      daysToAdd = 1; // Daily for non-active registrations
    }

    nextVerification.setDate(nextVerification.getDate() + daysToAdd);
    return nextVerification;
  }

  /**
   * Validates CFM number format
   * @param cfmNumber CFM registration number
   * @returns True if format is valid
   */
  private validateCFMNumberFormat(cfmNumber: string): boolean {
    // Remove non-numeric characters
    const cleanCFM = cfmNumber.replace(/\D/g, "");

    // CFM should have 5-6 digits depending on the state
    if (cleanCFM.length < 5 || cleanCFM.length > 6) return false;

    // Basic format validation
    return /^\d{5,6}$/.test(cleanCFM);
  }

  /**
   * Checks if state is supported
   * @param state State code
   * @returns True if state is supported
   */
  private isValidState(state: string): boolean {
    return this.stateCouncils.some(council => council.state === state.toUpperCase());
  }

  /**
   * Calculates authorized states for telemedicine
   * @param state Physician's registered state
   * @param requestedStates Requested states
   * @returns Authorized states
   */
  private calculateAuthorizedStates(state: string, _requestedStates: string[]): string[] {
    const stateCouncil = this.stateCouncils.find(council => council.state === state.toUpperCase());
    
    if (!stateCouncil || !stateCouncil.telemedicineRegulations.allowed) {
      return [];
    }

    // By default, authorize only the registered state
    // Some states may have reciprocity agreements
    const authorizedStates = [state.toUpperCase()];

    // Implement reciprocity logic based on state regulations
    // This would check for interstate telemedicine agreements
    // For now, return the authorized states without reciprocity

    return authorizedStates;
  }

  /**
   * Calculates authorization restrictions
   * @param state Physician's state
   * @param requestedStates Requested states
   * @returns Authorization restrictions
   */
  private calculateAuthorizationRestrictions(state: string, requestedStates: string[]): string[] {
    const stateCouncil = this.stateCouncils.find(council => council.state === state.toUpperCase());
    
    if (!stateCouncil) {
      return ["State not supported"];
    }

    const restrictions = [...stateCouncil.telemedicineRegulations.restrictions];

    // Add restrictions for interstate practice
    const requestedStatesList = requestedStates || [state];
    const unauthorizedStates = requestedStatesList.filter(s => s.toUpperCase() !== state.toUpperCase());
    
    if (unauthorizedStates.length > 0) {
      restrictions.push(`Not authorized for practice in: ${unauthorizedStates.join(', ')}`);
    }

    return restrictions;
  }

  /**
   * Checks if telemedicine is emergency-only
   * @param state Physician's state
   * @param requestedStates Requested states
   * @returns True if emergency-only
   */
  private isEmergencyOnly(state: string, requestedStates: string[]): boolean {
    // Check if any requested state has emergency-only restrictions
    const requestedStatesList = requestedStates || [state];
    
    return requestedStatesList.some(requestedState => {
      const stateCouncil = this.stateCouncils.find(council => 
        council.state === requestedState.toUpperCase()
      );
      
      return stateCouncil?.telemedicineRegulations.restrictions.some(restriction =>
        restriction.toLowerCase().includes("emergency")
      );
    });
  }

  /**
   * Checks if supervision is required
   * @param state Physician's state
   * @param requestedStates Requested states
   * @returns True if supervision is required
   */
  private requiresSupervision(_state: string, _requestedStates: string[]): boolean {
    // This would be based on state regulations and physician experience
    // For now, return false as default
    return false;
  }

  /**
   * Gets cached registration data
   * @param cfmNumber CFM registration number
   * @param state Physician's state
   * @returns Cached registration data or null
   */
  private async getCachedRegistration(cfmNumber: string, state: string): Promise<CFMRegistration | null> {
    if (!this.licenseRepository?.getCachedRegistration) {
      console.warn('License repository not available for cached registration lookup');
      return null;
    }
    
    try {
      return await this.licenseRepository.getCachedRegistration(cfmNumber, state);
    } catch (error) {
      console.warn(`Failed to get cached registration for ${cfmNumber}:`, error);
      return null;
    }
  }

  /**
   * Checks if cache is still valid
   * @param lastVerification Last verification timestamp
   * @returns True if cache is valid
   */
  private isCacheValid(lastVerification: Date): boolean {
    const cacheValidityHours = 24; // Cache is valid for 24 hours
    const now = new Date();
    const diffHours = (now.getTime() - lastVerification.getTime()) / (1000 * 60 * 60);
    return diffHours < cacheValidityHours;
  }

  /**
   * Updates registration cache
   * @param registration CFM registration data
   */
  private async updateRegistrationCache(registration: CFMRegistration): Promise<void> {
    if (!this.licenseRepository?.updateRegistrationCache) {
      console.warn('License repository not available for cache update');
      return;
    }
    
    try {
      await this.licenseRepository.updateRegistrationCache(registration);
    } catch (error) {
      console.warn(`Failed to update cache for ${registration.cfmNumber}:`, error);
    }
  }

  /**
   * Flags verification for manual review
   * @param cfmNumber CFM registration number
   * @param state Physician's state
   */
  private async flagForManualReview(cfmNumber: string, state: string): Promise<void> {
    if (!this.licenseRepository?.flagForManualReview) {
      console.warn('License repository not available for manual review flag');
      return;
    }
    
    try {
      await this.licenseRepository.flagForManualReview(cfmNumber, state);
    } catch (error) {
      console.warn(`Failed to flag for manual review ${cfmNumber}:`, error);
    }
  }

  /**
   * Public method to check if a physician is authorized for telemedicine
   * @param request License verification request
   * @returns Authorization status
   */
  async isAuthorizedForTelemedicine(_request: LicenseVerificationRequest): Promise<{
    authorized: boolean;
    restrictions: string[];
    requiresSupervision: boolean;
    emergencyOnly: boolean;
    complianceDetails: {
      cfmCompliant: boolean;
      stateCompliant: boolean;
      specialtyCompliant: boolean;
      telemedicineCompliant: boolean;
    };
  }> {
    try {
      const verification = await this.verifyMedicalLicense(_request);

      const authorized =
        verification.complianceStatus.cfmCompliant &&
        verification.complianceStatus.stateCompliant &&
        verification.complianceStatus.specialtyCompliant &&
        verification.complianceStatus.telemedicineCompliant;

      return {
        authorized,
        restrictions: verification.telemedicineAuth.restrictions,
        requiresSupervision: verification.telemedicineAuth.requiresSuperVision,
        emergencyOnly: verification.telemedicineAuth.emergencyOnly,
        complianceDetails: verification.complianceStatus
      };
    } catch (error) {
      console.error("Error checking telemedicine authorization:", error);
      return {
        authorized: false,
        restrictions: ["Verification failed"],
        requiresSupervision: true,
        emergencyOnly: true,
        complianceDetails: {
          cfmCompliant: false,
          stateCompliant: false,
          specialtyCompliant: false,
          telemedicineCompliant: false
        }
      };
    }
  }

  /**
   * Gets physician specialties from CFM registration
   * @param cfmNumber CFM registration number
   * @param state Physician's state
   * @returns Array of specialties
   */
  async getPhysicianSpecialties(cfmNumber: string, state: string): Promise<string[]> {
    try {
      const registration = await this.getCFMRegistration(cfmNumber, state);
      
      // Get additional specialties from repository
      const additionalSpecialties = await this.licenseRepository.getPhysicianSpecialties(cfmNumber, state);
      
      const specialties = registration.specialty ? [registration.specialty] : [];
      
      return [...specialties, ...additionalSpecialties];
    } catch (error) {
      console.error("Error getting physician specialties:", error);
      return [];
    }
  }
}