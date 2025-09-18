import type { Database } from '@neonpro/database';
import type {
  MedicalDataClassification,
  RTCAuditLogEntry,
  RTCConsentManager,
} from '@neonpro/types';
import { createClient } from '@supabase/supabase-js';
import { BaseService } from './base.service';

// Types for consent management
export interface ConsentRequest {
  patientId: string;
  dataTypes: MedicalDataClassification[];
  purpose: 'telemedicine' | 'medical_treatment' | 'ai_assistance' | 'communication';
  sessionId?: string;
  expiresAt?: Date;
  clinicId: string;
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  clinicId: string;
  consentType: string;
  purpose: string;
  legalBasis: string;
  status: 'pending' | 'granted' | 'withdrawn' | 'expired';
  givenAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  collectionMethod: string;
  ipAddress?: string;
  userAgent?: string;
  evidence?: any;
  dataCategories: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * LGPD-compliant consent management service for telemedicine
 * Implements RTCConsentManager interface and LGPD requirements
 */
export class ConsentService extends BaseService implements RTCConsentManager {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabaseClient: ReturnType<typeof createClient<Database>>) {
    super();
    this.supabase = supabaseClient;
  }

  /**
   * Request consent for specific data processing
   * @param userId - Patient user ID
   * @param dataTypes - Types of medical data to process
   * @param purpose - Purpose for data processing
   * @param sessionId - Optional WebRTC session ID
   * @returns Promise<boolean> - True if consent was successfully requested
   */
  async requestConsent(
    userId: string,
    dataTypes: MedicalDataClassification[],
    purpose: string,
    sessionId: string,
  ): Promise<boolean> {
    try {
      // Get patient ID from user ID
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userId)
        .single();

      if (patientError || !patient) {
        throw new Error('Patient not found for user');
      }

      // Call Supabase function to request consent
      const { data, error } = await this.supabase.rpc('request_webrtc_consent', {
        p_patient_id: patient.id,
        p_data_types: dataTypes,
        p_purpose: purpose,
        p_session_id: sessionId,
        p_expires_at: null, // Default to no expiration
      });

      if (error) {
        console.error('Failed to request consent:', error);
        return false;
      }

      return !!data; // Return true if consent ID was created
    } catch (error) {
      console.error('ConsentService.requestConsent error:', error);
      return false;
    }
  }

  /**
   * Verify existing consent is valid
   * @param userId - Patient user ID
   * @param dataType - Type of medical data to verify
   * @param sessionId - WebRTC session ID
   * @returns Promise<boolean> - True if consent is valid
   */
  async verifyConsent(
    userId: string,
    dataType: MedicalDataClassification,
    sessionId: string,
  ): Promise<boolean> {
    try {
      // Get patient ID from user ID
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userId)
        .single();

      if (patientError || !patient) {
        return false;
      }

      // Call Supabase function to validate consent
      const { data, error } = await this.supabase.rpc('validate_webrtc_consent', {
        p_patient_id: patient.id,
        p_session_id: sessionId,
        p_data_types: [dataType],
        p_clinic_id: patient.clinic_id,
      });

      if (error) {
        console.error('Failed to verify consent:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('ConsentService.verifyConsent error:', error);
      return false;
    }
  }

  /**
   * Revoke consent for data processing
   * @param userId - Patient user ID
   * @param dataType - Type of medical data to revoke consent for
   * @param sessionId - WebRTC session ID
   * @param reason - Optional reason for revocation
   */
  async revokeConsent(
    userId: string,
    dataType: MedicalDataClassification,
    sessionId: string,
    reason?: string,
  ): Promise<void> {
    try {
      // Get patient ID from user ID
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userId)
        .single();

      if (patientError || !patient) {
        throw new Error('Patient not found for user');
      }

      // Update consent records to withdrawn status
      const { error } = await this.supabase
        .from('consent_records')
        .update({
          status: 'withdrawn',
          withdrawn_at: new Date().toISOString(),
          withdrawn_reason: reason || 'User revoked consent',
          updated_at: new Date().toISOString(),
        })
        .eq('patient_id', patient.id)
        .eq('session_id', sessionId)
        .contains('data_types', [dataType])
        .eq('status', 'granted');

      if (error) {
        throw new Error(`Failed to revoke consent: ${error.message}`);
      }

      // Create audit log for consent revocation
      await this.supabase.rpc('create_webrtc_audit_log', {
        p_session_id: sessionId,
        p_event_type: 'consent-revoked',
        p_user_id: userId,
        p_user_role: 'patient',
        p_data_classification: dataType,
        p_description: `Consent revoked for ${dataType}. Reason: ${reason || 'User request'}`,
        p_ip_address: null, // Will be set by RLS
        p_user_agent: null, // Will be set by RLS
        p_clinic_id: patient.clinic_id,
        p_metadata: { reason, dataType },
      });
    } catch (error) {
      console.error('ConsentService.revokeConsent error:', error);
      throw error;
    }
  }

  /**
   * Get consent history for audit purposes
   * @param userId - Patient user ID
   * @returns Promise<RTCAuditLogEntry[]> - Array of audit log entries
   */
  async getConsentHistory(userId: string): Promise<RTCAuditLogEntry[]> {
    try {
      // Get patient ID from user ID
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userId)
        .single();

      if (patientError || !patient) {
        return [];
      }

      // Get audit logs related to consent for this patient
      const { data: auditLogs, error } = await this.supabase
        .from('webrtc_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .in('event_type', ['consent-given', 'consent-revoked', 'data-access'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get consent history:', error);
        return [];
      }

      // Transform to RTCAuditLogEntry format
      return auditLogs.map(log => ({
        id: log.id,
        sessionId: log.session_id,
        eventType: log.event_type as any,
        timestamp: log.timestamp,
        userId: log.user_id,
        userRole: log.user_role as any,
        dataClassification: log.data_classification as MedicalDataClassification,
        description: log.description,
        ipAddress: log.ip_address?.toString() || 'unknown',
        userAgent: log.user_agent || 'unknown',
        clinicId: log.clinic_id,
        metadata: log.metadata || {},
        complianceCheck: {
          isCompliant: (log.compliance_check as any)?.isCompliant || true,
          violations: (log.compliance_check as any)?.violations || [],
          riskLevel: (log.compliance_check as any)?.riskLevel || 'low',
        },
      }));
    } catch (error) {
      console.error('ConsentService.getConsentHistory error:', error);
      return [];
    }
  }

  /**
   * Export user data for LGPD compliance (Right to Data Portability)
   * @param userId - Patient user ID
   * @returns Promise<any> - Exported user data
   */
  async exportUserData(userId: string): Promise<any> {
    try {
      // Get patient ID from user ID
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (patientError || !patient) {
        throw new Error('Patient not found for user');
      }

      // Get all consent records
      const { data: consentRecords } = await this.supabase
        .from('consent_records')
        .select('*')
        .eq('patient_id', patient.id);

      // Get audit logs for this user
      const { data: auditLogs } = await this.supabase
        .from('webrtc_audit_logs')
        .select('*')
        .eq('user_id', userId);

      // Get general audit logs
      const { data: generalAuditLogs } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId);

      return {
        exportDate: new Date().toISOString(),
        patient: patient,
        consentRecords: consentRecords || [],
        webrtcAuditLogs: auditLogs || [],
        generalAuditLogs: generalAuditLogs || [],
        note:
          'This export contains all personal data processed by NeonPro according to LGPD requirements.',
      };
    } catch (error) {
      console.error('ConsentService.exportUserData error:', error);
      throw error;
    }
  }

  /**
   * Delete user data (Right to Erasure)
   * @param userId - Patient user ID
   * @param sessionId - Optional specific session to delete
   */
  async deleteUserData(userId: string, sessionId?: string): Promise<void> {
    try {
      // Get patient ID from user ID
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userId)
        .single();

      if (patientError || !patient) {
        throw new Error('Patient not found for user');
      }

      if (sessionId) {
        // Delete specific session data
        await this.supabase
          .from('consent_records')
          .delete()
          .eq('patient_id', patient.id)
          .eq('session_id', sessionId);

        await this.supabase
          .from('webrtc_audit_logs')
          .delete()
          .eq('user_id', userId)
          .eq('session_id', sessionId);
      } else {
        // Delete all user data (complete erasure)
        await this.supabase
          .from('consent_records')
          .delete()
          .eq('patient_id', patient.id);

        await this.supabase
          .from('webrtc_audit_logs')
          .delete()
          .eq('user_id', userId);

        // Note: We might want to anonymize rather than delete audit logs
        // for legal compliance in some jurisdictions
      }

      // Create final audit log entry
      await this.supabase.rpc('create_webrtc_audit_log', {
        p_session_id: sessionId || 'data-deletion',
        p_event_type: 'data-access',
        p_user_id: userId,
        p_user_role: 'system',
        p_data_classification: 'general-medical',
        p_description: `User data deleted per LGPD Right to Erasure. Session: ${
          sessionId || 'all'
        }`,
        p_ip_address: null,
        p_user_agent: 'system',
        p_clinic_id: patient.clinic_id,
        p_metadata: { action: 'data_deletion', sessionId },
      });
    } catch (error) {
      console.error('ConsentService.deleteUserData error:', error);
      throw error;
    }
  }

  /**
   * Grant consent (called when user accepts consent dialog)
   * @param patientId - Patient ID
   * @param consentId - Consent record ID to update
   */
  async grantConsent(patientId: string, consentId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('consent_records')
        .update({
          status: 'granted',
          given_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', consentId)
        .eq('patient_id', patientId)
        .eq('status', 'pending');

      return !error;
    } catch (error) {
      console.error('ConsentService.grantConsent error:', error);
      return false;
    }
  }

  /**
   * Get pending consent requests for a patient
   * @param userId - Patient user ID
   * @returns Promise<ConsentRecord[]> - Pending consent records
   */
  async getPendingConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      const { data: patient } = await this.supabase
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!patient) return [];

      const { data: consents, error } = await this.supabase
        .from('consent_records')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) return [];

      return consents.map(consent => ({
        id: consent.id,
        patientId: consent.patient_id,
        clinicId: consent.clinic_id,
        consentType: consent.consent_type,
        purpose: consent.purpose,
        legalBasis: consent.legal_basis,
        status: consent.status as any,
        givenAt: consent.given_at ? new Date(consent.given_at) : undefined,
        withdrawnAt: consent.withdrawn_at ? new Date(consent.withdrawn_at) : undefined,
        expiresAt: consent.expires_at ? new Date(consent.expires_at) : undefined,
        collectionMethod: consent.collection_method,
        ipAddress: consent.ip_address,
        userAgent: consent.user_agent,
        evidence: consent.evidence,
        dataCategories: consent.data_categories || [],
        createdAt: consent.created_at ? new Date(consent.created_at) : undefined,
        updatedAt: consent.updated_at ? new Date(consent.updated_at) : undefined,
      }));
    } catch (error) {
      console.error('ConsentService.getPendingConsents error:', error);
      return [];
    }
  }
}

export default ConsentService;