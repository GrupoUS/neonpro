import type { Database } from '../types/supabase';
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
    sessionId?: string,
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

      // Create consent record directly in database
      const { data: consentData, error: consentError } = await this.supabase
        .from('consent_records')
        .insert({
          patient_id: patient.id,
          clinic_id: patient.clinic_id,
          consent_type: 'webrtc',
          purpose: purpose,
          legal_basis: 'consent', // Default legal basis
          status: 'pending',
          data_categories: dataTypes,
          processing_purposes: [purpose],
          collection_method: 'digital',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            session_id: sessionId,
            requested_at: new Date().toISOString()
          }
        })
        .select('id')
        .single();

      if (consentError) {
        console.error('Failed to request consent:', consentError);
        return false;
      }

      return !!consentData; // Return true if consent ID was created
    } catch (error) {
      console.error('ConsentService.requestConsent error:', error);
      return false;
    }
  }

  /**
   * Verify existing consent is valid
   * @param userId - Patient user ID
   * @param dataType - Type of medical data to verify
   * @returns Promise<boolean> - True if consent is valid
   */
  async verifyConsent(
    userId: string,
    dataType: MedicalDataClassification
  ): Promise<boolean> {
    try {
      // Get patient by user ID
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('id, clinic_id')
        .eq('user_id', userId)
        .single();

      if (patientError || !patient) {
        return false;
      }

      // Check for valid consent directly from the consent_records table
      // Query for valid consents (either no expiry or future expiry)
      const currentTime = new Date().toISOString();
      
      // Split the query into two parts to avoid .or() issues
      let query = this.supabase
        .from('consent_records')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('status', 'granted')
        .contains('data_categories', [dataType]);
      
      // Add the expiry condition using or
      query = query.or(`expires_at.is.null,expires_at.gt.${currentTime}`);
      
      const { data: consents, error } = await query
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Failed to verify consent:', error);
        return false;
      }

      return consents && consents.length > 0;
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
          updated_at: new Date().toISOString(),
          metadata: {
            withdrawn_reason: reason || 'User revoked consent',
            withdrawn_session_id: sessionId
          }
        })
        .eq('patient_id', patient.id)
        .contains('data_categories', [dataType])
        .eq('status', 'granted');

      if (error) {
        throw new Error(`Failed to revoke consent: ${error.message}`);
      }

      // Create audit log for consent revocation in main audit_logs table
      await this.supabase.from('audit_logs').insert({
        action: 'consent-revoked',
        user_id: userId,
        resource_id: sessionId,
        resource_type: 'consent',
        clinic_id: patient.clinic_id,
        lgpd_basis: 'consent',
        old_values: { status: 'granted', data_type: dataType },
        new_values: { status: 'withdrawn', reason: reason || 'User request' }
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

      // Get audit logs related to consent for this patient from main audit_logs table
      const { data: auditLogs, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .in('action', ['consent-given', 'consent-revoked', 'data-access'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get consent history:', error);
        return [];
      }

      // Transform to RTCAuditLogEntry format
      return auditLogs.map(log => ({
        id: log.id,
        sessionId: log.resource_id || 'unknown',
        eventType: log.action as any,
        timestamp: log.created_at || new Date().toISOString(),
        userId: log.user_id,
        userRole: 'patient' as any, // Default role
        dataClassification: 'internal' as MedicalDataClassification,
        description: log.resource_type || 'Consent audit log entry',
        ipAddress: log.ip_address as string || 'unknown',
        userAgent: log.user_agent || 'unknown',
        clinicId: log.clinic_id || 'unknown',
        metadata: {
          lgpd_basis: log.lgpd_basis,
          old_values: log.old_values,
          new_values: log.new_values
        },
        complianceCheck: {
          isCompliant: true,
          violations: [],
          riskLevel: 'low',
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
        .from('audit_logs')
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
        // Delete specific session data (by session ID in metadata)
        await this.supabase
          .from('consent_records')
          .delete()
          .eq('patient_id', patient.id)
          .contains('metadata', { session_id: sessionId });

        await this.supabase
          .from('audit_logs')
          .delete()
          .eq('user_id', userId)
          .eq('resource_id', sessionId);
      } else {
        // Delete all user data (complete erasure)
        await this.supabase
          .from('consent_records')
          .delete()
          .eq('patient_id', patient.id);

        await this.supabase
          .from('audit_logs')
          .delete()
          .eq('user_id', userId);
      }

      // Create final audit log entry
      await this.supabase.from('audit_logs').insert({
        action: 'data-deletion',
        user_id: userId,
        resource_id: sessionId || 'complete-erasure',
        resource_type: 'lgpd-erasure',
        clinic_id: patient.clinic_id,
        lgpd_basis: 'legal_obligation',
        old_values: { 
          data_existed: true,
          session_id: sessionId || 'all_sessions'
        },
        new_values: { 
          data_deleted: true,
          deletion_timestamp: new Date().toISOString()
        }
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
        status: consent.status as 'pending' | 'granted' | 'withdrawn' | 'expired',
        givenAt: consent.given_at ? new Date(consent.given_at) : undefined,
        withdrawnAt: consent.withdrawn_at ? new Date(consent.withdrawn_at) : undefined,
        expiresAt: consent.expires_at ? new Date(consent.expires_at) : undefined,
        collectionMethod: consent.collection_method,
        ipAddress: consent.ip_address as string | undefined,
        userAgent: consent.user_agent as string | undefined,
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