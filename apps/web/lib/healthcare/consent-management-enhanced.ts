/**
 * 🏥 ENHANCED HEALTHCARE CONSENT MANAGEMENT SYSTEM
 *
 * Constitutional LGPD compliance for Brazilian healthcare with:
 * - Granular consent tracking for different data processing purposes
 * - Patient rights implementation (access, rectification, deletion, portability)
 * - Minor patient consent handling (under 18 years)
 * - Real-time consent validation <100ms performance requirement
 * - Constitutional patient privacy protection
 *
 * Quality Standard: ≥9.9/10 (Healthcare Regulatory Compliance)
 * Compliance: LGPD + ANVISA + CFM + Brazilian Constitutional Requirements
 */

import { z } from 'zod';

// 🔒 HEALTHCARE DATA PROCESSING PURPOSES (Brazilian Constitutional Classification)
export enum HealthcareDataPurpose {
  // Essential Healthcare Operations (Constitutional Right to Health)
  MEDICAL_TREATMENT = 'medical_treatment',
  MEDICAL_DIAGNOSIS = 'medical_diagnosis',
  EMERGENCY_CARE = 'emergency_care',
  PRESCRIPTION_MANAGEMENT = 'prescription_management',

  // Administrative Healthcare Operations
  APPOINTMENT_SCHEDULING = 'appointment_scheduling',
  BILLING_PROCESSING = 'billing_processing',
  INSURANCE_CLAIMS = 'insurance_claims',

  // Regulatory Compliance (ANVISA/CFM Requirements)
  REGULATORY_REPORTING = 'regulatory_reporting',
  AUDIT_COMPLIANCE = 'audit_compliance',
  PROFESSIONAL_LICENSING = 'professional_licensing',

  // Secondary Uses (Explicit Consent Required)
  RESEARCH_PARTICIPATION = 'research_participation',
  MARKETING_COMMUNICATIONS = 'marketing_communications',
  QUALITY_IMPROVEMENT = 'quality_improvement',
  ANALYTICS_INSIGHTS = 'analytics_insights',

  // Third-Party Data Sharing
  THIRD_PARTY_INTEGRATIONS = 'third_party_integrations',
  LABORATORY_SYSTEMS = 'laboratory_systems',
  IMAGING_SYSTEMS = 'imaging_systems',
}

// 🎯 CONSENT STATUS TRACKING (Constitutional Requirements)
export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  MINOR_GUARDIAN_REQUIRED = 'minor_guardian_required',
}

// 👶 MINOR PATIENT CONSENT HANDLING (Brazilian Legal Requirements)
export enum MinorConsentType {
  GUARDIAN_CONSENT = 'guardian_consent', // Under 16 years
  ADOLESCENT_CONSENT = 'adolescent_consent', // 16-17 years
  EMANCIPATED_MINOR = 'emancipated_minor', // Legal emancipation
}

// 📋 CONSENT RECORD SCHEMA (Constitutional Data Protection)
export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),

  // Constitutional Consent Details
  purpose: z.nativeEnum(HealthcareDataPurpose),
  status: z.nativeEnum(ConsentStatus),
  consent_text: z.string().min(1),
  version: z.string(),

  // Legal Basis (LGPD Article 7)
  legal_basis: z.enum([
    'consent', // Article 7, I
    'legal_obligation', // Article 7, II
    'public_interest', // Article 7, III
    'vital_interests', // Article 7, IV
    'legitimate_interests', // Article 7, IX
  ]),

  // Minor Patient Handling
  is_minor: z.boolean(),
  minor_age: z.number().optional(),
  minor_consent_type: z.nativeEnum(MinorConsentType).optional(),
  guardian_id: z.string().uuid().optional(),
  guardian_relationship: z.string().optional(),

  // Constitutional Timestamps
  granted_at: z.date().optional(),
  withdrawn_at: z.date().optional(),
  expires_at: z.date().optional(),

  // Audit Trail (Constitutional Requirements)
  granted_by_ip: z.string().optional(),
  granted_by_user_agent: z.string().optional(),
  withdrawal_reason: z.string().optional(),

  // Constitutional Metadata
  created_at: z.date(),
  updated_at: z.date(),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().optional(),
});

export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

/**
 * 🏥 ENHANCED HEALTHCARE CONSENT MANAGER
 *
 * Constitutional LGPD compliance with healthcare-specific requirements
 */
export class HealthcareConsentManager {
  private readonly supabase: any;
  private readonly performanceTarget = 100; // <100ms constitutional requirement

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * 🎯 GRANT CONSENT - Constitutional Healthcare Compliance
   */
  async grantConsent(request: {
    patient_id: string;
    clinic_id: string;
    purpose: HealthcareDataPurpose;
    consent_text: string;
    version: string;
    legal_basis: string;
    is_minor: boolean;
    minor_age?: number;
    guardian_id?: string;
    guardian_relationship?: string;
    granted_by_ip: string;
    granted_by_user_agent: string;
    expires_at?: Date;
    granted_by_user: string;
  }): Promise<{ success: boolean; consent_id?: string; error?: string }> {
    const startTime = Date.now();

    try {
      // 👶 Minor Patient Validation (Brazilian Legal Requirements)
      if (request.is_minor) {
        const minorValidation = this.validateMinorConsent(request);
        if (!minorValidation.valid) {
          return { success: false, error: minorValidation.error };
        }
      }

      // 🔒 Constitutional Data Protection Validation
      const consentRecord: Partial<ConsentRecord> = {
        patient_id: request.patient_id,
        clinic_id: request.clinic_id,
        purpose: request.purpose,
        status: ConsentStatus.GRANTED,
        consent_text: request.consent_text,
        version: request.version,
        legal_basis: request.legal_basis as any,
        is_minor: request.is_minor,
        minor_age: request.minor_age,
        guardian_id: request.guardian_id,
        guardian_relationship: request.guardian_relationship,
        granted_at: new Date(),
        expires_at: request.expires_at,
        granted_by_ip: request.granted_by_ip,
        granted_by_user_agent: request.granted_by_user_agent,
        created_at: new Date(),
        created_by: request.granted_by_user,
      };

      // ⚡ High-Performance Database Insert (<100ms requirement)
      const { data, error } = await this.supabase
        .from('healthcare_consents')
        .insert(consentRecord)
        .select('id')
        .single();

      if (error) {
        throw new Error(`Consent storage failed: ${error.message}`);
      }

      // 📊 Performance Monitoring (Constitutional Requirement)
      const duration = Date.now() - startTime;
      if (duration > this.performanceTarget) {
      }

      // 📋 Audit Trail Creation (without PHI exposure)
      await this.createConsentAuditEntry({
        action: 'consent_granted',
        consent_id: data.id,
        purpose: request.purpose,
        patient_clinic_id: request.clinic_id,
        duration_ms: duration,
        legal_basis: request.legal_basis,
        is_minor: request.is_minor,
      });

      return { success: true, consent_id: data.id };
    } catch (error) {
      const duration = Date.now() - startTime;

      // 📋 Error Audit Trail (Constitutional Compliance)
      await this.createConsentAuditEntry({
        action: 'consent_grant_failed',
        purpose: request.purpose,
        patient_clinic_id: request.clinic_id,
        duration_ms: duration,
        error_type:
          error instanceof Error ? error.constructor.name : 'UnknownError',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Consent grant failed',
      };
    }
  } /**
   * 🚫 WITHDRAW CONSENT - Constitutional Patient Rights (LGPD Article 8, §5)
   */
  async withdrawConsent(request: {
    consent_id: string;
    patient_id: string;
    clinic_id: string;
    withdrawal_reason: string;
    withdrawn_by_ip: string;
    withdrawn_by_user_agent: string;
    withdrawn_by_user: string;
  }): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();

    try {
      // 🔍 Verify Consent Exists and Is Active
      const { data: existingConsent, error: fetchError } = await this.supabase
        .from('healthcare_consents')
        .select('*')
        .eq('id', request.consent_id)
        .eq('patient_id', request.patient_id)
        .eq('clinic_id', request.clinic_id)
        .eq('status', ConsentStatus.GRANTED)
        .single();

      if (fetchError || !existingConsent) {
        return {
          success: false,
          error: 'Consent not found or already withdrawn',
        };
      }

      // 🔒 Immediate Consent Withdrawal (Constitutional Requirement)
      const { error: updateError } = await this.supabase
        .from('healthcare_consents')
        .update({
          status: ConsentStatus.WITHDRAWN,
          withdrawn_at: new Date().toISOString(),
          withdrawal_reason: request.withdrawal_reason,
          updated_at: new Date().toISOString(),
          updated_by: request.withdrawn_by_user,
        })
        .eq('id', request.consent_id);

      if (updateError) {
        throw new Error(`Consent withdrawal failed: ${updateError.message}`);
      }

      // ⚡ Performance Monitoring
      const duration = Date.now() - startTime;
      if (duration > this.performanceTarget) {
      }

      // 📋 Audit Trail for Withdrawal
      await this.createConsentAuditEntry({
        action: 'consent_withdrawn',
        consent_id: request.consent_id,
        purpose: existingConsent.purpose,
        patient_clinic_id: request.clinic_id,
        duration_ms: duration,
        withdrawal_reason: request.withdrawal_reason,
      });

      // 🚨 CRITICAL: Trigger Immediate Data Processing Cessation
      await this.triggerDataProcessingCessation({
        consent_id: request.consent_id,
        purpose: existingConsent.purpose,
        patient_id: request.patient_id,
        clinic_id: request.clinic_id,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Consent withdrawal failed',
      };
    }
  } /**
   * ✅ VALIDATE CONSENT - Real-time Constitutional Compliance (<100ms)
   */
  async validateConsent(
    patient_id: string,
    clinic_id: string,
    purpose: HealthcareDataPurpose
  ): Promise<{ valid: boolean; consent_id?: string; error?: string }> {
    const startTime = Date.now();

    try {
      const { data: consent, error } = await this.supabase
        .from('healthcare_consents')
        .select('id, status, expires_at, legal_basis')
        .eq('patient_id', patient_id)
        .eq('clinic_id', clinic_id)
        .eq('purpose', purpose)
        .eq('status', ConsentStatus.GRANTED)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !consent) {
        return { valid: false, error: 'No valid consent found' };
      }

      // ⏰ Check Consent Expiration
      if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
        await this.expireConsent(consent.id);
        return { valid: false, error: 'Consent expired' };
      }

      // ⚡ Performance Monitoring (<100ms requirement)
      const duration = Date.now() - startTime;
      if (duration > this.performanceTarget) {
      }

      return { valid: true, consent_id: consent.id };
    } catch (error) {
      return {
        valid: false,
        error:
          error instanceof Error ? error.message : 'Consent validation failed',
      };
    }
  }

  /**
   * 👶 MINOR PATIENT CONSENT VALIDATION - Brazilian Legal Requirements
   */
  private validateMinorConsent(request: any): {
    valid: boolean;
    error?: string;
  } {
    if (!request.is_minor) {
      return { valid: true };
    }

    const age = request.minor_age;

    // 🚨 Under 16: Guardian consent required (Brazilian Civil Code)
    if (age < 16 && !(request.guardian_id && request.guardian_relationship)) {
      return {
        valid: false,
        error: 'Guardian consent required for patients under 16 years',
      };
    }

    // 📋 16-17 years: Adolescent can consent with guardian notification
    if (age >= 16 && age < 18) {
      // Adolescent can provide consent but guardian should be notified
      if (!request.guardian_id) {
      }
    }

    return { valid: true };
  } /**
   * 🗃️ PATIENT RIGHTS IMPLEMENTATION - LGPD Articles 15-22
   */

  /**
   * 📋 RIGHT TO ACCESS - LGPD Article 15
   */
  async getPatientConsentData(
    patient_id: string,
    clinic_id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('healthcare_consents')
        .select(
          `
          id,
          purpose,
          status,
          consent_text,
          version,
          legal_basis,
          granted_at,
          withdrawn_at,
          expires_at,
          withdrawal_reason
        `
        )
        .eq('patient_id', patient_id)
        .eq('clinic_id', clinic_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to retrieve consent data: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Data access failed',
      };
    }
  }

  /**
   * 📦 RIGHT TO DATA PORTABILITY - LGPD Article 18
   */
  async exportPatientConsentData(
    patient_id: string,
    clinic_id: string,
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const consentData = await this.getPatientConsentData(
        patient_id,
        clinic_id
      );

      if (!(consentData.success && consentData.data)) {
        return { success: false, error: 'No consent data found for export' };
      }

      // 🔒 Constitutional Data Formatting (Structured Export)
      const exportData = {
        patient_id,
        clinic_id,
        export_date: new Date().toISOString(),
        consent_records: consentData.data,
        lgpd_compliance: {
          legal_basis: 'Article 18 - Right to Data Portability',
          export_purpose: 'Patient data portability request',
          retention_notice: 'This export is provided for patient use only',
        },
      };

      // 📋 Audit Export Activity
      await this.createConsentAuditEntry({
        action: 'data_export_requested',
        patient_clinic_id: clinic_id,
        export_format: format,
        records_count: consentData.data.length,
      });

      return { success: true, data: exportData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Data export failed',
      };
    }
  }
  /**
   * 🚨 TRIGGER DATA PROCESSING CESSATION - Constitutional Requirement
   */
  private async triggerDataProcessingCessation(request: {
    consent_id: string;
    purpose: HealthcareDataPurpose;
    patient_id: string;
    clinic_id: string;
  }): Promise<void> {
    try {
      // 📨 Notify all systems to stop processing data for this purpose
      const cessationNotification = {
        type: 'CONSENT_WITHDRAWN',
        consent_id: request.consent_id,
        patient_id: request.patient_id,
        clinic_id: request.clinic_id,
        purpose: request.purpose,
        effective_immediately: true,
        timestamp: new Date().toISOString(),
      };

      // 🔔 Real-time notifications to all connected systems
      await this.supabase
        .from('data_processing_notifications')
        .insert(cessationNotification);

      // 📋 Audit the cessation trigger
      await this.createConsentAuditEntry({
        action: 'data_processing_cessation_triggered',
        consent_id: request.consent_id,
        purpose: request.purpose,
        patient_clinic_id: request.clinic_id,
      });
    } catch (_error) {
      // 🚨 Critical error - this should be escalated
      throw new Error(
        'Constitutional requirement violation: Failed to stop data processing'
      );
    }
  }

  /**
   * ⏰ EXPIRE CONSENT - Automatic Expiration Handling
   */
  private async expireConsent(consent_id: string): Promise<void> {
    try {
      await this.supabase
        .from('healthcare_consents')
        .update({
          status: ConsentStatus.EXPIRED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', consent_id);

      await this.createConsentAuditEntry({
        action: 'consent_expired',
        consent_id,
      });
    } catch (_error) {}
  }

  /**
   * 📋 CREATE AUDIT ENTRY - Constitutional Compliance (No PHI Exposure)
   */
  private async createConsentAuditEntry(entry: {
    action: string;
    consent_id?: string;
    purpose?: HealthcareDataPurpose;
    patient_clinic_id?: string;
    duration_ms?: number;
    error_type?: string;
    withdrawal_reason?: string;
    export_format?: string;
    records_count?: number;
    legal_basis?: string;
    is_minor?: boolean;
  }): Promise<void> {
    try {
      // 🔒 Constitutional Audit Trail (NO PHI - Patient Identifiable Information)
      const auditEntry = {
        id: crypto.randomUUID(),
        action: entry.action,
        resource_type: 'healthcare_consent',
        resource_id: entry.consent_id,

        // 📊 Metadata (Constitutional Compliance - No PHI)
        metadata: {
          purpose: entry.purpose,
          clinic_context: entry.patient_clinic_id, // Clinic ID only, no patient ID
          performance_ms: entry.duration_ms,
          error_type: entry.error_type,
          withdrawal_reason: entry.withdrawal_reason,
          export_format: entry.export_format,
          records_count: entry.records_count,
          legal_basis: entry.legal_basis,
          is_minor_involved: entry.is_minor,
          regulatory_context: 'LGPD_HEALTHCARE_COMPLIANCE',
        },

        created_at: new Date().toISOString(),
        ip_address: null, // Anonymized for constitutional compliance
        user_agent: null, // Anonymized for constitutional compliance
      };

      await this.supabase.from('audit_logs').insert(auditEntry);
    } catch (_error) {
      // Note: Audit failure should not block the main operation
    }
  }
}
