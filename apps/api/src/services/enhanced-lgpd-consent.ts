/**
 * Enhanced LGPD Consent Management Service
 * Comprehensive consent tracking with database integration and compliance automation
 */

import type { Database } from '../../../../packages/database/src/types/supabase';
import { createServerClient } from '../clients/supabase.js';

type ConsentRecord = Database['public']['Tables']['consent_records']['Row'];
type ConsentInsert = Database['public']['Tables']['consent_records']['Insert'];
type ConsentUpdate = Database['public']['Tables']['consent_records']['Update'];

export interface ConsentValidationResult {
  isValid: boolean;
  consentRecord?: ConsentRecord;
  reason?: string;
  expiresAt?: Date;
  renewalRequired?: boolean;
}

export interface ConsentCreationRequest {
  patientId: string;
  clinicId: string;
  consentType: 'basic' | 'explicit' | 'granular';
  purpose: string;
  dataCategories: string[];
  processingPurposes: string[];
  legalBasis: string;
  collectedBy: string;
  collectionMethod: 'digital' | 'paper' | 'verbal';
  ipAddress?: string;
  userAgent?: string;
  witnessedBy?: string;
  retentionPeriodDays?: number;
  metadata?: Record<string, any>;
}

export interface ConsentWithdrawalRequest {
  consentId: string;
  withdrawnBy: string;
  reason: string;
  effectiveDate?: Date;
}

export class EnhancedLGPDConsentService {
  private supabase;

  constructor() {
    this.supabase = createServerClient();
  }

  /**
   * Create a new consent record with comprehensive validation
   */
  async createConsent(
    request: ConsentCreationRequest,
  ): Promise<{ success: boolean; consentId?: string; error?: string }> {
    try {
      // Validate required fields
      if (!request.patientId || !request.clinicId || !request.purpose) {
        return { success: false, error: 'Missing required fields' };
      }

      // Check for existing active consent for the same purpose
      const existingConsent = await this.getActiveConsent(
        request.patientId,
        request.clinicId,
        request.purpose,
      );

      if (existingConsent.isValid) {
        return {
          success: false,
          error: 'Active consent already exists for this purpose',
          consentId: existingConsent.consentRecord?.id,
        };
      }

      // Calculate expiration date based on consent type and retention period
      const expiresAt = this.calculateExpirationDate(
        request.consentType,
        request.retentionPeriodDays,
      );

      // Prepare consent record
      const consentData: ConsentInsert = {
        patient_id: request.patientId,
        clinic_id: request.clinicId,
        consent_type: request.consentType,
        purpose: request.purpose,
        data_categories: request.dataCategories,
        processing_purposes: request.processingPurposes,
        legal_basis: request.legalBasis,
        collected_by: request.collectedBy,
        collection_method: request.collectionMethod,
        status: 'active',
        given_at: new Date().toISOString(),
        expires_at: expiresAt?.toISOString(),
        ip_address: request.ipAddress || null,
        user_agent: request.userAgent || null,
        witnessed_by: request.witnessedBy || null,
        metadata: request.metadata || null,
        privacy_policy_version: await this.getCurrentPrivacyPolicyVersion(),
        terms_version: await this.getCurrentTermsVersion(),
      };

      // Insert consent record
      const { data, error } = await this.supabase
        .from('consent_records')
        .insert(consentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating consent record:', error);
        return { success: false, error: 'Failed to create consent record' };
      }

      // Log consent creation for audit
      await this.logConsentAuditEvent('CONSENT_CREATED', {
        consentId: data.id,
        patientId: request.patientId,
        clinicId: request.clinicId,
        purpose: request.purpose,
        consentType: request.consentType,
        collectedBy: request.collectedBy,
      });

      return { success: true, consentId: data.id };
    } catch (error) {
      console.error('Error in createConsent:', error);
      return { success: false, error: 'Internal error creating consent' };
    }
  }

  /**
   * Validate consent for specific purpose and data categories
   */
  async validateConsent(
    patientId: string,
    clinicId: string,
    purpose: string,
    dataCategories: string[],
    minimumLevel: 'basic' | 'explicit' | 'granular' = 'basic',
  ): Promise<ConsentValidationResult> {
    try {
      const { data: consentRecords, error } = await this.supabase
        .from('consent_records')
        .select('*')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId)
        .eq('purpose', purpose)
        .eq('status', 'active')
        .overlaps('data_categories', dataCategories)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error validating consent:', error);
        return { isValid: false, reason: 'Database error' };
      }

      if (!consentRecords || consentRecords.length === 0) {
        return { isValid: false, reason: 'No consent found' };
      }

      const mostRecentConsent = consentRecords[0];

      // Check expiration
      if (mostRecentConsent.expires_at && new Date(mostRecentConsent.expires_at) < new Date()) {
        return {
          isValid: false,
          reason: 'Consent expired',
          renewalRequired: true,
          expiresAt: new Date(mostRecentConsent.expires_at),
        };
      }

      // Check withdrawal
      if (mostRecentConsent.withdrawn_at) {
        return { isValid: false, reason: 'Consent withdrawn' };
      }

      // Validate consent level
      const levelHierarchy = { basic: 1, explicit: 2, granular: 3 };
      const currentLevel =
        levelHierarchy[mostRecentConsent.consent_type as keyof typeof levelHierarchy] || 1;
      const requiredLevel = levelHierarchy[minimumLevel];

      if (currentLevel < requiredLevel) {
        return {
          isValid: false,
          reason:
            `Insufficient consent level. Required: ${minimumLevel}, Current: ${mostRecentConsent.consent_type}`,
        };
      }

      return {
        isValid: true,
        consentRecord: mostRecentConsent,
        expiresAt: mostRecentConsent.expires_at
          ? new Date(mostRecentConsent.expires_at)
          : undefined,
      };
    } catch (error) {
      console.error('Error in validateConsent:', error);
      return { isValid: false, reason: 'Internal validation error' };
    }
  }

  /**
   * Get active consent for a specific purpose
   */
  async getActiveConsent(
    patientId: string,
    clinicId: string,
    purpose: string,
  ): Promise<ConsentValidationResult> {
    try {
      const { data, error } = await this.supabase
        .from('consent_records')
        .select('*')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId)
        .eq('purpose', purpose)
        .eq('status', 'active')
        .is('withdrawn_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error getting active consent:', error);
        return { isValid: false, reason: 'Database error' };
      }

      if (!data) {
        return { isValid: false, reason: 'No active consent found' };
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return {
          isValid: false,
          reason: 'Consent expired',
          renewalRequired: true,
          expiresAt: new Date(data.expires_at),
        };
      }

      return {
        isValid: true,
        consentRecord: data,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      };
    } catch (error) {
      console.error('Error in getActiveConsent:', error);
      return { isValid: false, reason: 'Internal error' };
    }
  }

  /**
   * Withdraw consent with proper audit trail
   */
  async withdrawConsent(
    request: ConsentWithdrawalRequest,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const effectiveDate = request.effectiveDate || new Date();

      const { data, error } = await this.supabase
        .from('consent_records')
        .update({
          status: 'withdrawn',
          withdrawn_at: effectiveDate.toISOString(),
          notes: request.reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.consentId)
        .select()
        .single();

      if (error) {
        console.error('Error withdrawing consent:', error);
        return { success: false, error: 'Failed to withdraw consent' };
      }

      // Log withdrawal for audit
      await this.logConsentAuditEvent('CONSENT_WITHDRAWN', {
        consentId: request.consentId,
        withdrawnBy: request.withdrawnBy,
        reason: request.reason,
        effectiveDate: effectiveDate.toISOString(),
        patientId: data.patient_id,
        clinicId: data.clinic_id,
      });

      return { success: true };
    } catch (error) {
      console.error('Error in withdrawConsent:', error);
      return { success: false, error: 'Internal error withdrawing consent' };
    }
  }

  /**
   * Get consent history for a patient
   */
  async getConsentHistory(
    patientId: string,
    clinicId: string,
    limit: number = 50,
  ): Promise<{ success: boolean; consents?: ConsentRecord[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('consent_records')
        .select('*')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting consent history:', error);
        return { success: false, error: 'Failed to retrieve consent history' };
      }

      return { success: true, consents: data };
    } catch (error) {
      console.error('Error in getConsentHistory:', error);
      return { success: false, error: 'Internal error' };
    }
  }

  /**
   * Check for consents requiring renewal
   */
  async getConsentsRequiringRenewal(
    clinicId: string,
    daysBeforeExpiration: number = 30,
  ): Promise<{ success: boolean; consents?: ConsentRecord[]; error?: string }> {
    try {
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + daysBeforeExpiration);

      const { data, error } = await this.supabase
        .from('consent_records')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .is('withdrawn_at', null)
        .lte('expires_at', renewalDate.toISOString())
        .order('expires_at', { ascending: true });

      if (error) {
        console.error('Error getting consents requiring renewal:', error);
        return { success: false, error: 'Failed to retrieve renewal list' };
      }

      return { success: true, consents: data };
    } catch (error) {
      console.error('Error in getConsentsRequiringRenewal:', error);
      return { success: false, error: 'Internal error' };
    }
  }

  /**
   * Generate consent receipt for patient records
   */
  async generateConsentReceipt(
    consentId: string,
  ): Promise<{ success: boolean; receipt?: any; error?: string }> {
    try {
      const { data: consent, error } = await this.supabase
        .from('consent_records')
        .select(`
          *,
          patients!inner(name, email),
          clinics!inner(name, address)
        `)
        .eq('id', consentId)
        .single();

      if (error) {
        console.error('Error generating consent receipt:', error);
        return { success: false, error: 'Consent not found' };
      }

      const receipt = {
        consentId: consent.id,
        patient: {
          name: consent.patients?.name,
          email: consent.patients?.email,
        },
        clinic: {
          name: consent.clinics?.name,
          address: consent.clinics?.address,
        },
        consentDetails: {
          type: consent.consent_type,
          purpose: consent.purpose,
          dataCategories: consent.data_categories,
          processingPurposes: consent.processing_purposes,
          legalBasis: consent.legal_basis,
          givenAt: consent.given_at,
          expiresAt: consent.expires_at,
          collectionMethod: consent.collection_method,
        },
        compliance: {
          privacyPolicyVersion: consent.privacy_policy_version,
          termsVersion: consent.terms_version,
          lgpdCompliant: true,
        },
        generatedAt: new Date().toISOString(),
      };

      return { success: true, receipt };
    } catch (error) {
      console.error('Error in generateConsentReceipt:', error);
      return { success: false, error: 'Internal error' };
    }
  }

  // Private helper methods

  private calculateExpirationDate(consentType: string, retentionPeriodDays?: number): Date | null {
    if (!retentionPeriodDays) {
      // Default retention periods based on Brazilian healthcare regulations
      const defaultRetentions = {
        basic: 365 * 2, // 2 years for basic data
        explicit: 365 * 5, // 5 years for medical records
        granular: 365 * 20, // 20 years for aesthetic procedures
      };
      retentionPeriodDays = defaultRetentions[consentType as keyof typeof defaultRetentions] || 365;
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + retentionPeriodDays);
    return expirationDate;
  }

  private async getCurrentPrivacyPolicyVersion(): Promise<string> {
    try {
      // Fetch the current privacy policy version from configuration table
      const { data, error } = await this.supabase
        .from('configurations')
        .select('value')
        .eq('key', 'privacy_policy_version')
        .single();

      if (error || !data) {
        console.warn('Privacy policy version not found in configuration, using default');
        return '2024.1';
      }

      return data.value;
    } catch (error) {
      console.error('Error fetching privacy policy version:', error);
      return '2024.1'; // Fallback to default
    }
  }

  private async getCurrentTermsVersion(): Promise<string> {
    try {
      // Fetch the current terms version from configuration table
      const { data, error } = await this.supabase
        .from('configurations')
        .select('value')
        .eq('key', 'terms_version')
        .single();

      if (error || !data) {
        console.warn('Terms version not found in configuration, using default');
        return '2024.1';
      }

      return data.value;
    } catch (error) {
      console.error('Error fetching terms version:', error);
      return '2024.1'; // Fallback to default
    }
  }

  private async logConsentAuditEvent(eventType: string, eventData: any): Promise<void> {
    try {
      const auditEntry = {
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString(),
        user_id: eventData.patientId || eventData.collectedBy,
        clinic_id: eventData.clinicId,
        compliance_flags: {
          lgpd_compliant: true,
          event_category: 'consent_management',
        },
      };

      // Insert into audit_logs table
      const { error } = await this.supabase
        .from('audit_logs')
        .insert(auditEntry);

      if (error) {
        console.error('Failed to insert audit log:', error);
        // Fallback to console logging if database insert fails
        console.log(`[LGPD CONSENT AUDIT] ${eventType}`, auditEntry);
      }
    } catch (error) {
      console.error('Error logging consent audit event:', error);
      // Fallback to console logging if database operation fails
      console.log(`[LGPD CONSENT AUDIT] ${eventType}`, eventData);
    }
  }
}

// Export singleton instance
export const enhancedLGPDConsentService = new EnhancedLGPDConsentService();
