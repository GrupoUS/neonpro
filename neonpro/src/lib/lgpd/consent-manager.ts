/**
 * LGPD Consent Management System
 * Automated consent handling with cryptographic verification
 * NeonPro Health Platform - LGPD Compliance Module
 */

import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';

// =====================================================
// TYPE DEFINITIONS & SCHEMAS
// =====================================================

export const ConsentTypeSchema = z.enum([
  'data_processing',
  'marketing', 
  'analytics',
  'research',
  'third_party_sharing',
  'automated_decision_making'
]);

export const LegalBasisSchema = z.enum([
  'consent',
  'legitimate_interest', 
  'legal_obligation',
  'vital_interests',
  'public_task',
  'contract_performance'
]);

export const ConsentRecordSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  consentType: ConsentTypeSchema,
  purpose: z.string().min(10).max(500),
  grantedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  withdrawnAt: z.date().optional(),
  consentVersion: z.string().default('1.0'),
  legalBasis: LegalBasisSchema,
  dataCategories: z.array(z.string()),
  processingActivities: z.array(z.string()),
  thirdPartySharing: z.boolean().default(false),
  thirdPartyDetails: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceFingerprint: z.string().optional(),
  geolocation: z.record(z.any()).optional()
});

export const ConsentRequestSchema = z.object({
  consentType: ConsentTypeSchema,
  purpose: z.string().min(10).max(500),
  dataCategories: z.array(z.string()),
  processingActivities: z.array(z.string()),
  legalBasis: LegalBasisSchema.default('consent'),
  expiresAt: z.date().optional(),
  thirdPartySharing: z.boolean().default(false),
  thirdPartyDetails: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

export type ConsentType = z.infer<typeof ConsentTypeSchema>;
export type LegalBasis = z.infer<typeof LegalBasisSchema>;
export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;
export type ConsentRequest = z.infer<typeof ConsentRequestSchema>;

// =====================================================
// CONSENT MANAGER CLASS
// =====================================================

export class LGPDConsentManager {
  private supabase: any;
  private auditLogger: LGPDAuditLogger;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = new LGPDAuditLogger(this.supabase);
  }

  /**
   * Grant consent with cryptographic verification
   */
  async grantConsent(
    userId: string,
    consentRequest: ConsentRequest,
    requestMetadata: {
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      geolocation?: any;
    } = {}
  ): Promise<{ success: boolean; consentId?: string; error?: string }> {
    try {
      // Validate input
      const validatedRequest = ConsentRequestSchema.parse(consentRequest);
      
      // Check for existing active consent
      const existingConsent = await this.getActiveConsent(userId, validatedRequest.consentType);
      if (existingConsent) {
        // Withdraw existing consent first
        await this.withdrawConsent(userId, validatedRequest.consentType, 'superseded');
      }

      // Create consent record
      const consentRecord: Partial<ConsentRecord> = {
        userId,
        consentType: validatedRequest.consentType,
        purpose: validatedRequest.purpose,
        grantedAt: new Date(),
        expiresAt: validatedRequest.expiresAt,
        legalBasis: validatedRequest.legalBasis,
        dataCategories: validatedRequest.dataCategories,
        processingActivities: validatedRequest.processingActivities,
        thirdPartySharing: validatedRequest.thirdPartySharing,
        thirdPartyDetails: validatedRequest.thirdPartyDetails || {},
        ipAddress: requestMetadata.ipAddress,
        userAgent: requestMetadata.userAgent,
        deviceFingerprint: requestMetadata.deviceFingerprint,
        geolocation: requestMetadata.geolocation
      };

      // Generate cryptographic hash for verification
      const consentHash = this.generateConsentHash(consentRecord);
      
      // Insert consent record
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .insert({
          ...consentRecord,
          consent_hash: consentHash,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to grant consent: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.logEvent({
        eventType: 'consent_granted',
        userId,
        resourceType: 'consent_record',
        resourceId: data.id,
        action: 'create',
        newValues: consentRecord,
        ipAddress: requestMetadata.ipAddress,
        userAgent: requestMetadata.userAgent,
        legalBasis: validatedRequest.legalBasis,
        purpose: validatedRequest.purpose
      });

      return { success: true, consentId: data.id };
    } catch (error) {
      console.error('Error granting consent:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Withdraw consent with audit trail
   */
  async withdrawConsent(
    userId: string,
    consentType: ConsentType,
    reason: string = 'user_request'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find active consent
      const activeConsent = await this.getActiveConsent(userId, consentType);
      if (!activeConsent) {
        return { success: false, error: 'No active consent found' };
      }

      // Update consent record
      const { error } = await this.supabase
        .from('lgpd_consent_records')
        .update({
          withdrawn_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', activeConsent.id);

      if (error) {
        throw new Error(`Failed to withdraw consent: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.logEvent({
        eventType: 'consent_withdrawn',
        userId,
        resourceType: 'consent_record',
        resourceId: activeConsent.id,
        action: 'update',
        oldValues: { is_active: true },
        newValues: { is_active: false, withdrawn_at: new Date(), reason },
        purpose: `Consent withdrawal: ${reason}`
      });

      // Trigger data processing halt if required
      await this.triggerDataProcessingHalt(userId, consentType);

      return { success: true };
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get user's consent status for specific type
   */
  async getConsentStatus(
    userId: string,
    consentType: ConsentType
  ): Promise<{
    hasConsent: boolean;
    consentRecord?: ConsentRecord;
    expiresAt?: Date;
    isExpired?: boolean;
  }> {
    try {
      const activeConsent = await this.getActiveConsent(userId, consentType);
      
      if (!activeConsent) {
        return { hasConsent: false };
      }

      const isExpired = activeConsent.expires_at ? 
        new Date(activeConsent.expires_at) < new Date() : false;

      return {
        hasConsent: !isExpired,
        consentRecord: this.mapDatabaseToConsentRecord(activeConsent),
        expiresAt: activeConsent.expires_at ? new Date(activeConsent.expires_at) : undefined,
        isExpired
      };
    } catch (error) {
      console.error('Error getting consent status:', error);
      return { hasConsent: false };
    }
  }

  /**
   * Get all user consents with status
   */
  async getUserConsents(userId: string): Promise<{
    consents: Array<ConsentRecord & { isExpired: boolean; status: string }>;
    summary: {
      total: number;
      active: number;
      expired: number;
      withdrawn: number;
    };
  }> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get user consents: ${error.message}`);
      }

      const consents = data.map((record: any) => {
        const consent = this.mapDatabaseToConsentRecord(record);
        const isExpired = record.expires_at ? 
          new Date(record.expires_at) < new Date() : false;
        const isWithdrawn = !!record.withdrawn_at;
        
        let status = 'active';
        if (isWithdrawn) status = 'withdrawn';
        else if (isExpired) status = 'expired';
        
        return { ...consent, isExpired, status };
      });

      const summary = {
        total: consents.length,
        active: consents.filter(c => c.status === 'active').length,
        expired: consents.filter(c => c.status === 'expired').length,
        withdrawn: consents.filter(c => c.status === 'withdrawn').length
      };

      return { consents, summary };
    } catch (error) {
      console.error('Error getting user consents:', error);
      return { 
        consents: [], 
        summary: { total: 0, active: 0, expired: 0, withdrawn: 0 } 
      };
    }
  }

  /**
   * Verify consent integrity using cryptographic hash
   */
  async verifyConsentIntegrity(consentId: string): Promise<{
    isValid: boolean;
    originalHash?: string;
    computedHash?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('id', consentId)
        .single();

      if (error || !data) {
        return { isValid: false, error: 'Consent record not found' };
      }

      const consentRecord = this.mapDatabaseToConsentRecord(data);
      const computedHash = this.generateConsentHash(consentRecord);
      const originalHash = data.consent_hash;

      return {
        isValid: computedHash === originalHash,
        originalHash,
        computedHash
      };
    } catch (error) {
      console.error('Error verifying consent integrity:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if user has valid consent for specific processing activity
   */
  async hasValidConsentForActivity(
    userId: string,
    activity: string,
    dataCategories: string[] = []
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .or(`withdrawn_at.is.null,withdrawn_at.gt.${new Date().toISOString()}`);

      if (error || !data) {
        return false;
      }

      // Check if any active consent covers the activity and data categories
      return data.some((consent: any) => {
        const isNotExpired = !consent.expires_at || 
          new Date(consent.expires_at) > new Date();
        const hasActivity = consent.processing_activities?.includes(activity);
        const hasDataCategories = dataCategories.length === 0 || 
          dataCategories.every(cat => consent.data_categories?.includes(cat));
        
        return isNotExpired && hasActivity && hasDataCategories;
      });
    } catch (error) {
      console.error('Error checking consent for activity:', error);
      return false;
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private async getActiveConsent(userId: string, consentType: ConsentType) {
    const { data, error } = await this.supabase
      .from('lgpd_consent_records')
      .select('*')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .eq('is_active', true)
      .is('withdrawn_at', null)
      .single();

    return error ? null : data;
  }

  private generateConsentHash(consentRecord: Partial<ConsentRecord>): string {
    const hashData = {
      userId: consentRecord.userId,
      consentType: consentRecord.consentType,
      purpose: consentRecord.purpose,
      grantedAt: consentRecord.grantedAt?.toISOString(),
      legalBasis: consentRecord.legalBasis,
      dataCategories: consentRecord.dataCategories?.sort(),
      processingActivities: consentRecord.processingActivities?.sort(),
      thirdPartySharing: consentRecord.thirdPartySharing
    };

    return createHash('sha256')
      .update(JSON.stringify(hashData))
      .digest('hex');
  }

  private mapDatabaseToConsentRecord(dbRecord: any): ConsentRecord {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      consentType: dbRecord.consent_type,
      purpose: dbRecord.purpose,
      grantedAt: new Date(dbRecord.granted_at),
      expiresAt: dbRecord.expires_at ? new Date(dbRecord.expires_at) : undefined,
      withdrawnAt: dbRecord.withdrawn_at ? new Date(dbRecord.withdrawn_at) : undefined,
      consentVersion: dbRecord.consent_version,
      legalBasis: dbRecord.legal_basis,
      dataCategories: dbRecord.data_categories || [],
      processingActivities: dbRecord.processing_activities || [],
      thirdPartySharing: dbRecord.third_party_sharing || false,
      thirdPartyDetails: dbRecord.third_party_details || {},
      ipAddress: dbRecord.ip_address,
      userAgent: dbRecord.user_agent,
      deviceFingerprint: dbRecord.device_fingerprint,
      geolocation: dbRecord.geolocation
    };
  }

  private async triggerDataProcessingHalt(userId: string, consentType: ConsentType) {
    // Implement data processing halt logic based on consent type
    // This would integrate with other system components
    console.log(`Triggering data processing halt for user ${userId}, consent type: ${consentType}`);
    
    // Example: Stop marketing emails, analytics tracking, etc.
    // This would be implemented based on specific business requirements
  }
}

// =====================================================
// AUDIT LOGGER CLASS
// =====================================================

export class LGPDAuditLogger {
  private supabase: any;
  private lastHash: string | null = null;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async logEvent(event: {
    eventType: string;
    userId?: string;
    actorId?: string;
    resourceType: string;
    resourceId?: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    legalBasis?: string;
    purpose?: string;
    riskScore?: number;
    automatedAction?: boolean;
  }): Promise<void> {
    try {
      // Get the last hash for chaining
      if (!this.lastHash) {
        await this.initializeHashChain();
      }

      // Create event hash
      const eventData = {
        ...event,
        timestamp: new Date().toISOString(),
        previousHash: this.lastHash
      };

      const eventHash = createHash('sha256')
        .update(JSON.stringify(eventData))
        .digest('hex');

      // Insert audit log entry
      const { error } = await this.supabase
        .from('lgpd_audit_log')
        .insert({
          event_type: event.eventType,
          user_id: event.userId,
          actor_id: event.actorId || event.userId,
          resource_type: event.resourceType,
          resource_id: event.resourceId,
          action: event.action,
          old_values: event.oldValues,
          new_values: event.newValues,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          session_id: event.sessionId,
          legal_basis: event.legalBasis,
          purpose: event.purpose,
          event_hash: eventHash,
          previous_hash: this.lastHash,
          risk_score: event.riskScore || 0,
          automated_action: event.automatedAction || false,
          compliance_flags: {}
        });

      if (error) {
        throw new Error(`Failed to log audit event: ${error.message}`);
      }

      // Update last hash for next event
      this.lastHash = eventHash;
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw - audit logging should not break main functionality
    }
  }

  private async initializeHashChain(): Promise<void> {
    const { data, error } = await this.supabase
      .from('lgpd_audit_log')
      .select('event_hash')
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single();

    this.lastHash = (error || !data) ? null : data.event_hash;
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Generate device fingerprint for consent tracking
 */
export function generateDeviceFingerprint(userAgent: string, additionalData: any = {}): string {
  const fingerprintData = {
    userAgent,
    ...additionalData,
    timestamp: Date.now()
  };

  return createHash('sha256')
    .update(JSON.stringify(fingerprintData))
    .digest('hex')
    .substring(0, 16); // Shortened for storage efficiency
}

/**
 * Validate LGPD consent requirements
 */
export function validateLGPDConsent(consentRequest: ConsentRequest): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check purpose clarity
  if (consentRequest.purpose.length < 20) {
    errors.push('Purpose description must be at least 20 characters for LGPD compliance');
  }

  // Check data categories
  if (consentRequest.dataCategories.length === 0) {
    errors.push('At least one data category must be specified');
  }

  // Check sensitive data handling
  const sensitiveCategories = ['health_data', 'biometric_data', 'genetic_data'];
  const hasSensitiveData = consentRequest.dataCategories.some(cat => 
    sensitiveCategories.includes(cat)
  );
  
  if (hasSensitiveData && consentRequest.legalBasis !== 'consent') {
    errors.push('Sensitive data processing requires explicit consent as legal basis');
  }

  // Check third-party sharing
  if (consentRequest.thirdPartySharing && !consentRequest.thirdPartyDetails) {
    warnings.push('Third-party sharing enabled but no details provided');
  }

  // Check expiration for marketing consent
  if (consentRequest.consentType === 'marketing' && !consentRequest.expiresAt) {
    warnings.push('Marketing consent should have expiration date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export default LGPDConsentManager;