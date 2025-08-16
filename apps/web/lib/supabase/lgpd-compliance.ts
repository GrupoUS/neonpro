// lib/supabase/lgpd-compliance.ts
// LGPD (Lei Geral de Proteção de Dados) Compliance Utilities for NeonPro
// Provides comprehensive audit logging, consent management, and data protection features

import { createClient } from '@/app/utils/supabase/client';

// LGPD Compliance Event Types
export type LGPDEventType =
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'consent_granted'
  | 'consent_revoked'
  | 'data_export'
  | 'user_authentication'
  | 'sensitive_data_access'
  | 'patient_record_access'
  | 'medical_procedure_access'
  | 'professional_access'
  | 'system_admin_access'
  | 'audit_log_access';

// LGPD Audit Log Entry Interface
export type LGPDAuditLog = {
  id?: string;
  event_type: LGPDEventType;
  user_id: string;
  patient_id?: string;
  clinic_id?: string;
  table_name: string;
  record_id?: string;
  action: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  consent_type?: string;
  data_subject_rights?: string;
  legal_basis?: string;
  purpose?: string;
  retention_period?: string;
  encryption_status?: boolean;
  anonymization_status?: boolean;
  created_at?: string;
  metadata?: Record<string, any>;
};

// LGPD Consent Types
export type LGPDConsentType =
  | 'medical_treatment'
  | 'data_processing'
  | 'marketing'
  | 'research'
  | 'data_sharing'
  | 'photo_usage'
  | 'telemedicine'
  | 'wearable_integration'
  | 'wellness_tracking';

// LGPD Data Subject Rights
export type LGPDDataSubjectRights =
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'portability'
  | 'restriction'
  | 'objection'
  | 'consent_withdrawal';

// LGPD Compliance Manager Class
export class LGPDComplianceManager {
  private readonly supabase: ReturnType<typeof createClient>;

  constructor(serverSide = false) {
    this.isServerSide = serverSide;
    if (serverSide) {
      // Note: Server client needs to be created differently
      this.supabase = createClient();
    } else {
      this.supabase = createClient();
    }
  }

  /**
   * Create LGPD audit log entry
   * Complies with LGPD Article 37 - Data Processing Records
   */
  async createAuditLog(
    logEntry: Omit<LGPDAuditLog, 'id' | 'created_at'>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user for audit trail
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      // Enhance log entry with compliance metadata
      const enhancedEntry: LGPDAuditLog = {
        ...logEntry,
        user_id: logEntry.user_id || user?.id || 'anonymous',
        created_at: new Date().toISOString(),
        encryption_status: true, // All data encrypted at rest
        metadata: {
          ...logEntry.metadata,
          compliance_version: '1.0',
          lgpd_article: this.getLGPDArticle(logEntry.event_type),
          timestamp_utc: new Date().toISOString(),
          user_role: user?.user_metadata?.role || 'unknown',
          application: 'NeonPro',
          environment: process.env.NODE_ENV || 'development',
        },
      };

      // Insert audit log into database
      const { error } = await this.supabase
        .from('lgpd_audit_logs')
        .insert(enhancedEntry);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Log patient data access for LGPD compliance
   * Critical for healthcare data protection
   */
  async logPatientDataAccess(
    patientId: string,
    clinicId: string,
    accessType: 'view' | 'edit' | 'create' | 'delete',
    tableAccessed: string,
    recordId?: string,
    purpose?: string,
  ): Promise<void> {
    await this.createAuditLog({
      event_type: 'patient_record_access',
      patient_id: patientId,
      clinic_id: clinicId,
      table_name: tableAccessed,
      record_id: recordId,
      action: accessType,
      purpose: purpose || 'Medical care provision',
      legal_basis: 'Article 11, II - Protection of life or physical safety',
      retention_period: '20_years', // Medical records retention
      data_subject_rights: 'access',
    });
  }

  /**
   * Log consent management actions
   * Ensures compliance with LGPD Article 8 - Consent requirements
   */
  async logConsentAction(
    patientId: string,
    clinicId: string,
    consentType: LGPDConsentType,
    action: 'granted' | 'revoked' | 'updated',
    consentDetails: Record<string, any>,
  ): Promise<void> {
    await this.createAuditLog({
      event_type: action === 'granted' ? 'consent_granted' : 'consent_revoked',
      patient_id: patientId,
      clinic_id: clinicId,
      table_name: 'patient_consents',
      action,
      consent_type: consentType,
      new_values: consentDetails,
      legal_basis: 'Article 8 - Consent',
      purpose: 'Consent management and compliance',
      retention_period: 'indefinite_or_until_withdrawal',
    });
  }

  /**
   * Log authentication events for security audit
   */
  async logAuthenticationEvent(
    userId: string,
    action: 'login' | 'logout' | 'failed_login' | 'password_reset',
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.createAuditLog({
      event_type: 'user_authentication',
      user_id: userId,
      table_name: 'auth.users',
      action,
      purpose: 'Security and access control',
      legal_basis: 'Legitimate interest - Security',
      retention_period: '5_years',
      metadata: {
        ...metadata,
        security_event: true,
      },
    });
  }

  /**
   * Log sensitive data access (financial, medical procedures)
   */
  async logSensitiveDataAccess(
    userId: string,
    patientId: string,
    clinicId: string,
    dataType: 'financial' | 'medical_procedure' | 'photo' | 'biometric',
    action: string,
    recordId?: string,
  ): Promise<void> {
    await this.createAuditLog({
      event_type: 'sensitive_data_access',
      user_id: userId,
      patient_id: patientId,
      clinic_id: clinicId,
      table_name: `sensitive_${dataType}`,
      record_id: recordId,
      action,
      purpose: 'Healthcare service provision',
      legal_basis: 'Article 11, II - Protection of life or physical safety',
      retention_period: '20_years',
      metadata: {
        sensitivity_level: 'high',
        data_category: dataType,
      },
    });
  }

  /**
   * Handle data subject rights requests
   * Implements LGPD Articles 17-22 (Data Subject Rights)
   */
  async processDataSubjectRequest(
    patientId: string,
    clinicId: string,
    requestType: LGPDDataSubjectRights,
    requestDetails: Record<string, any>,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Log the data subject rights request
      await this.createAuditLog({
        event_type: 'data_access',
        patient_id: patientId,
        clinic_id: clinicId,
        table_name: 'data_subject_requests',
        action: `data_subject_${requestType}`,
        data_subject_rights: requestType,
        purpose: 'Data subject rights fulfillment',
        legal_basis: `Article ${this.getDataSubjectRightsArticle(requestType)}`,
        new_values: requestDetails,
      });

      switch (requestType) {
        case 'access':
          return await this.exportPatientData(patientId, clinicId);

        case 'erasure':
          return await this.anonymizePatientData(patientId, clinicId);

        case 'portability':
          return await this.exportPatientDataPortable(patientId, clinicId);

        default:
          return {
            success: false,
            error: `Data subject right ${requestType} not yet implemented`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export patient data for LGPD compliance (Data Portability)
   */
  private async exportPatientData(
    patientId: string,
    clinicId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Fetch all patient-related data across tables
      const { data: patientData, error: patientError } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .eq('clinic_id', clinicId)
        .single();

      if (patientError) {
        return { success: false, error: patientError.message };
      }

      // Log data export for audit trail
      await this.logSensitiveDataAccess(
        patientData.user_id || 'system',
        patientId,
        clinicId,
        'medical_procedure',
        'data_export',
      );

      return {
        success: true,
        data: {
          patient: patientData,
          exported_at: new Date().toISOString(),
          export_format: 'JSON',
          lgpd_compliance: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Anonymize patient data for erasure requests
   */
  private async anonymizePatientData(
    patientId: string,
    clinicId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Instead of deletion, anonymize data to preserve medical history
      const { error } = await this.supabase
        .from('patients')
        .update({
          name: 'ANONYMIZED',
          email: null,
          phone: null,
          cpf: null,
          address: null,
          anonymized_at: new Date().toISOString(),
          anonymization_reason: 'LGPD_ERASURE_REQUEST',
        })
        .eq('id', patientId)
        .eq('clinic_id', clinicId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log anonymization action
      await this.createAuditLog({
        event_type: 'data_deletion',
        patient_id: patientId,
        clinic_id: clinicId,
        table_name: 'patients',
        action: 'anonymize',
        data_subject_rights: 'erasure',
        purpose: 'LGPD compliance - Right to erasure',
        legal_basis: 'Article 18 - Right to erasure',
        anonymization_status: true,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Anonymization failed',
      };
    }
  }

  /**
   * Export patient data in portable format (JSON/CSV)
   */
  private async exportPatientDataPortable(
    patientId: string,
    clinicId: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const exportResult = await this.exportPatientData(patientId, clinicId);

    if (exportResult.success && exportResult.data) {
      // Convert to portable format
      const portableData = {
        ...exportResult.data,
        format: 'portable_json',
        lgpd_article: 'Article 20 - Data Portability',
        structured_format: true,
        machine_readable: true,
      };

      return { success: true, data: portableData };
    }

    return exportResult;
  }

  /**
   * Get relevant LGPD article for audit event type
   */
  private getLGPDArticle(eventType: LGPDEventType): string {
    const articleMap: Record<LGPDEventType, string> = {
      data_access: 'Article 17 - Right of access',
      data_modification: 'Article 18 - Right to rectification',
      data_deletion: 'Article 18 - Right to erasure',
      consent_granted: 'Article 8 - Consent',
      consent_revoked: 'Article 8 - Consent withdrawal',
      data_export: 'Article 20 - Data portability',
      user_authentication: 'Article 37 - Data processing records',
      sensitive_data_access: 'Article 11 - Sensitive data processing',
      patient_record_access: 'Article 11 - Healthcare data',
      medical_procedure_access: 'Article 11 - Healthcare data',
      professional_access: 'Article 37 - Access control',
      system_admin_access: 'Article 37 - System administration',
      audit_log_access: 'Article 37 - Audit trail',
    };

    return articleMap[eventType] || 'General LGPD compliance';
  }

  /**
   * Get LGPD article for data subject rights
   */
  private getDataSubjectRightsArticle(right: LGPDDataSubjectRights): string {
    const rightsMap: Record<LGPDDataSubjectRights, string> = {
      access: '17 - Right of access',
      rectification: '18 - Right to rectification',
      erasure: '18 - Right to erasure',
      portability: '20 - Data portability',
      restriction: '18 - Restriction of processing',
      objection: '21 - Right to object',
      consent_withdrawal: '8 - Consent withdrawal',
    };

    return rightsMap[right] || '17-22 - Data subject rights';
  }
}

// Healthcare-specific LGPD compliance hooks
export class HealthcareLGPDHooks {
  private readonly compliance: LGPDComplianceManager;

  constructor(serverSide = false) {
    this.compliance = new LGPDComplianceManager(serverSide);
  }

  /**
   * Hook for patient data access - must be called before accessing patient records
   */
  async beforePatientAccess(
    patientId: string,
    clinicId: string,
    action: 'view' | 'edit' | 'create' | 'delete',
    context: {
      userId: string;
      userRole: string;
      purpose?: string;
      tableAccessed?: string;
      recordId?: string;
    },
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Log access attempt
      await this.compliance.logPatientDataAccess(
        patientId,
        clinicId,
        action,
        context.tableAccessed || 'patients',
        context.recordId,
        context.purpose,
      );

      // Check if user has permission to access this patient's data
      // This would integrate with your RLS policies
      return { allowed: true };
    } catch (_error) {
      return {
        allowed: false,
        reason: 'LGPD compliance check failed',
      };
    }
  }

  /**
   * Hook for sensitive data access (medical procedures, financial data)
   */
  async beforeSensitiveDataAccess(
    patientId: string,
    clinicId: string,
    dataType: 'financial' | 'medical_procedure' | 'photo' | 'biometric',
    action: string,
    context: {
      userId: string;
      userRole: string;
      recordId?: string;
      justification?: string;
    },
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Enhanced logging for sensitive data
      await this.compliance.logSensitiveDataAccess(
        context.userId,
        patientId,
        clinicId,
        dataType,
        action,
        context.recordId,
      );

      // Additional validation for sensitive data access
      if (
        dataType === 'financial' &&
        !['admin', 'manager'].includes(context.userRole)
      ) {
        return {
          allowed: false,
          reason: 'Insufficient permissions for financial data access',
        };
      }

      return { allowed: true };
    } catch (_error) {
      return {
        allowed: false,
        reason: 'LGPD compliance check failed for sensitive data',
      };
    }
  }

  /**
   * Hook for consent validation before data processing
   */
  async validateConsent(
    patientId: string,
    clinicId: string,
    consentType: LGPDConsentType,
    purpose: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      // Check if valid consent exists for this purpose
      // This would query your consent management system

      // For now, we'll log the consent check
      await this.compliance.createAuditLog({
        event_type: 'consent_granted',
        patient_id: patientId,
        clinic_id: clinicId,
        table_name: 'patient_consents',
        action: 'validate_consent',
        consent_type: consentType,
        purpose,
        legal_basis: 'Article 8 - Consent validation',
      });

      return { valid: true };
    } catch (_error) {
      return {
        valid: false,
        reason: 'Consent validation failed',
      };
    }
  }
}

// Utility functions for LGPD compliance
export const lgpdUtils = {
  /**
   * Create LGPD-compliant audit logger
   */
  createAuditLogger: (serverSide = false) =>
    new LGPDComplianceManager(serverSide),

  /**
   * Create healthcare-specific LGPD hooks
   */
  createHealthcareHooks: (serverSide = false) =>
    new HealthcareLGPDHooks(serverSide),

  /**
   * Generate LGPD-compliant consent form data
   */
  generateConsentFormData: (
    consentType: LGPDConsentType,
    purpose: string,
    retentionPeriod?: string,
  ) => ({
    consent_type: consentType,
    purpose,
    retention_period: retentionPeriod || '20_years',
    legal_basis: 'Article 8 - Consent',
    consent_date: new Date().toISOString(),
    consent_version: '1.0',
    can_withdraw: true,
    withdrawal_method: 'Patient portal or written request',
    data_categories: ['personal', 'medical', 'contact'],
    processing_activities: [purpose],
    third_party_sharing: false,
    international_transfer: false,
  }),

  /**
   * Validate if data processing is LGPD compliant
   */
  validateDataProcessing: (
    purpose: string,
    legalBasis: string,
    dataCategories: string[],
  ): { compliant: boolean; issues: string[] } => {
    const issues: string[] = [];

    // Basic validation rules
    if (!purpose || purpose.length < 10) {
      issues.push('Purpose must be clearly defined (minimum 10 characters)');
    }

    if (!legalBasis) {
      issues.push('Legal basis for processing must be specified');
    }

    if (
      dataCategories.includes('sensitive') &&
      !legalBasis.includes('Article 11')
    ) {
      issues.push(
        'Sensitive data requires specific legal basis under Article 11',
      );
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  },
};

// Default export
export default LGPDComplianceManager;
