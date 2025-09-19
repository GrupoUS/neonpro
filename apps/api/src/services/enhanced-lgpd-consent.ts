/**
 * Enhanced LGPD Consent Management Service
 * Critical Enhancement: Granular consent versioning, tracking, and patient privacy controls
 * Implements LGPD Articles 7º, 11º, 18º with Brazilian healthcare compliance
 */

import { z } from 'zod';
import { createAdminClient } from '../clients/supabase';
import { LGPDDataCategory, LGPDLegalBasis } from '../middleware/lgpd-compliance';

// ============================================================================
// Enhanced Consent Types & Schemas
// ============================================================================

export enum ConsentVersion {
  V1_0 = '1.0', // Basic consent
  V2_0 = '2.0', // Granular consent with data categories
  V3_0 = '3.0', // Enhanced with withdrawal tracking and purpose limitation
}

export enum ConsentStatus {
  ACTIVE = 'active',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export enum WithdrawalMethod {
  ELECTRONIC = 'electronic',
  WRITTEN = 'written',
  VERBAL = 'verbal',
  AUTOMATED = 'automated',
}

export interface ConsentGranularity {
  dataCategories: LGPDDataCategory[];
  processingPurposes: string[];
  thirdPartySharing: boolean;
  automatedDecisionMaking: boolean;
  internationalTransfer: boolean;
  retentionPeriod: number;
  specificConditions?: Record<string, any>;
}

export interface ConsentVersionMetadata {
  version: ConsentVersion;
  effectiveDate: Date;
  deprecatedDate?: Date;
  migrationRequired: boolean;
  migrationDeadline?: Date;
  changes: string[];
  legalBasisUpdates?: LGPDLegalBasis[];
}

export interface ConsentWithdrawalRecord {
  id: string;
  consentId: string;
  withdrawalDate: Date;
  method: WithdrawalMethod;
  reason: string;
  requestedBy: 'patient' | 'guardian' | 'legal_representative';
  ipAddress?: string;
  userAgent?: string;
  processedAt: Date;
  dataAction: 'immediate_deletion' | 'anonymization' | 'retention_until_expiry';
  affectedDataCategories: LGPDDataCategory[];
  confirmationSent: boolean;
  confirmationDate?: Date;
}

export interface DataRetentionPolicy {
  id: string;
  dataCategory: LGPDDataCategory;
  retentionPeriod: number; // days
  legalBasis: LGPDLegalBasis;
  automatedCleanup: boolean;
  cleanupSchedule: 'daily' | 'weekly' | 'monthly' | 'yearly';
  archivalPeriod?: number; // days before deletion
  requiresExplicitConsentForExtension: boolean;
}

export interface ConsentAuditTrail {
  id: string;
  consentId: string;
  action: 'created' | 'updated' | 'withdrawn' | 'expired' | 'version_migrated';
  timestamp: Date;
  performedBy: string;
  performedByRole: string;
  previousState?: any;
  newState: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  legalBasis: LGPDLegalBasis;
}

// Enhanced Consent Schema with Versioning
export const EnhancedConsentRecordSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  version: z.nativeEnum(ConsentVersion),
  status: z.nativeEnum(ConsentStatus),

  // Granular consent details
  granularity: z.object({
    dataCategories: z.array(z.nativeEnum(LGPDDataCategory)),
    processingPurposes: z.array(z.string()),
    thirdPartySharing: z.boolean(),
    automatedDecisionMaking: z.boolean(),
    internationalTransfer: z.boolean(),
    retentionPeriod: z.number(),
    specificConditions: z.record(z.any()).optional(),
  }),

  // Consent lifecycle
  consentDate: z.date(),
  expiryDate: z.date().optional(),
  lastModifiedDate: z.date(),
  method: z.enum(['electronic', 'written', 'verbal', 'digital_signature']),
  channel: z.enum(['web', 'mobile', 'in_person', 'phone', 'email']),

  // Version tracking
  previousVersionId: z.string().optional(),
  nextVersionId: z.string().optional(),
  migrationFromVersion: z.nativeEnum(ConsentVersion).optional(),

  // Legal basis
  legalBasis: z.array(z.nativeEnum(LGPDLegalBasis)),
  primaryLegalBasis: z.nativeEnum(LGPDLegalBasis),

  // Withdrawal tracking
  withdrawalRecord: z.object({
    withdrawnAt: z.date().optional(),
    withdrawalMethod: z.nativeEnum(WithdrawalMethod).optional(),
    withdrawalReason: z.string().optional(),
    dataAction: z.enum(['immediate_deletion', 'anonymization', 'retention_until_expiry'])
      .optional(),
  }).optional(),

  // Metadata
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
  location: z.object({
    country: z.string(),
    state: z.string().optional(),
    city: z.string().optional(),
  }).optional(),

  // Healthcare specific
  healthcareContext: z.object({
    clinicId: z.string().optional(),
    professionalId: z.string().optional(),
    emergencyAccess: z.boolean().default(false),
    treatmentContext: z.string().optional(),
  }).optional(),

  // Compliance tracking
  dataProcessingActivities: z.array(z.object({
    activity: z.string(),
    lastProcessed: z.date(),
    processingCount: z.number(),
  })).default([]),

  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
});

export type EnhancedConsentRecord = z.infer<typeof EnhancedConsentRecordSchema>;

// ============================================================================
// Enhanced LGPD Consent Service
// ============================================================================

export class EnhancedLGPDConsentService {
  private supabase = createAdminClient();

  // Version management
  private readonly consentVersions: Record<ConsentVersion, ConsentVersionMetadata> = {
    [ConsentVersion.V1_0]: {
      version: ConsentVersion.V1_0,
      effectiveDate: new Date('2023-01-01'),
      deprecatedDate: new Date('2024-06-01'),
      migrationRequired: true,
      migrationDeadline: new Date('2024-12-31'),
      changes: ['Basic consent implementation', 'Limited data categories'],
      legalBasisUpdates: [LGPDLegalBasis.CONSENT],
    },
    [ConsentVersion.V2_0]: {
      version: ConsentVersion.V2_0,
      effectiveDate: new Date('2024-06-01'),
      migrationRequired: false,
      changes: [
        'Granular data category selection',
        'Purpose limitation',
        'Third-party sharing controls',
        'Automated decision-making consent',
      ],
      legalBasisUpdates: [LGPDLegalBasis.CONSENT, LGPDLegalBasis.LEGITIMATE_INTERESTS],
    },
    [ConsentVersion.V3_0]: {
      version: ConsentVersion.V3_0,
      effectiveDate: new Date('2025-01-01'),
      migrationRequired: false,
      changes: [
        'Enhanced withdrawal mechanisms',
        'Detailed audit trail',
        'Data retention automation',
        'International transfer controls',
        'Patient privacy dashboard integration',
      ],
      legalBasisUpdates: [LGPDLegalBasis.CONSENT, LGPDLegalBasis.LEGAL_OBLIGATION],
    },
  };

  /**
   * Create enhanced consent record with granular permissions
   */
  async createConsent(
    consentData: Omit<EnhancedConsentRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ): Promise<EnhancedConsentRecord> {
    try {
      // Validate consent data
      const validatedData = EnhancedConsentRecordSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      }).parse(consentData);

      // Check if patient already has active consent for similar purposes
      const existingConsents = await this.getPatientActiveConsents(consentData.patientId);

      // Check for overlapping consent purposes
      const overlappingPurposes = validatedData.granularity.processingPurposes.filter(purpose =>
        existingConsents.some(consent =>
          consent.granularity.processingPurposes.includes(purpose)
          && consent.status === ConsentStatus.ACTIVE
        )
      );

      if (overlappingPurposes.length > 0) {
        throw new Error(
          `Active consent already exists for purposes: ${overlappingPurposes.join(', ')}`,
        );
      }

      // Create consent record
      const consentRecord: EnhancedConsentRecord = {
        ...validatedData,
        id: crypto.randomUUID(),
        status: ConsentStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in database
      const { data, error } = await this.supabase
        .from('lgpd_enhanced_consents')
        .insert(consentRecord)
        .select()
        .single();

      if (error) {
        console.error('Error creating consent record:', error);
        throw new Error('Failed to create consent record');
      }

      // Log consent creation
      await this.logConsentActivity('created', data.id, consentRecord);

      // Schedule automated cleanup if retention period is set
      if (validatedData.granularity.retentionPeriod > 0) {
        await this.scheduleDataCleanup(data.id, validatedData.granularity.retentionPeriod);
      }

      return data;
    } catch (error) {
      console.error('Error in createConsent:', error);
      throw error;
    }
  }

  /**
   * Withdraw consent with comprehensive audit trail
   */
  async withdrawConsent(
    consentId: string,
    withdrawalData: {
      method: WithdrawalMethod;
      reason: string;
      requestedBy: 'patient' | 'guardian' | 'legal_representative';
      dataAction: 'immediate_deletion' | 'anonymization' | 'retention_until_expiry';
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<ConsentWithdrawalRecord> {
    try {
      // Get current consent record
      const { data: consent, error: fetchError } = await this.supabase
        .from('lgpd_enhanced_consents')
        .select('*')
        .eq('id', consentId)
        .single();

      if (fetchError || !consent) {
        throw new Error('Consent record not found');
      }

      if (consent.status === ConsentStatus.WITHDRAWN) {
        throw new Error('Consent already withdrawn');
      }

      // Create withdrawal record
      const withdrawalRecord: ConsentWithdrawalRecord = {
        id: crypto.randomUUID(),
        consentId,
        withdrawalDate: new Date(),
        method: withdrawalData.method,
        reason: withdrawalData.reason,
        requestedBy: withdrawalData.requestedBy,
        ipAddress: withdrawalData.ipAddress,
        userAgent: withdrawalData.userAgent,
        processedAt: new Date(),
        dataAction: withdrawalData.dataAction,
        affectedDataCategories: consent.granularity.dataCategories,
        confirmationSent: false,
      };

      // Update consent status
      const { error: updateError } = await this.supabase
        .from('lgpd_enhanced_consents')
        .update({
          status: ConsentStatus.WITHDRAWN,
          withdrawalRecord: {
            withdrawnAt: withdrawalRecord.withdrawalDate,
            withdrawalMethod: withdrawalRecord.method,
            withdrawalReason: withdrawalRecord.reason,
            dataAction: withdrawalData.dataAction,
          },
          updatedAt: new Date(),
        })
        .eq('id', consentId);

      if (updateError) {
        throw new Error('Failed to update consent status');
      }

      // Store withdrawal record
      const { data: withdrawal, error: withdrawalError } = await this.supabase
        .from('lgpd_consent_withdrawals')
        .insert(withdrawalRecord)
        .select()
        .single();

      if (withdrawalError) {
        throw new Error('Failed to create withdrawal record');
      }

      // Execute data action
      await this.executeDataAction(consent, withdrawalData.dataAction);

      // Log withdrawal activity
      await this.logConsentActivity('withdrawn', consentId, {
        previousState: consent,
        newState: { ...consent, status: ConsentStatus.WITHDRAWN },
        reason: withdrawalData.reason,
      });

      // Send confirmation to patient
      await this.sendWithdrawalConfirmation(consent.patientId, withdrawalRecord);

      return withdrawal;
    } catch (error) {
      console.error('Error in withdrawConsent:', error);
      throw error;
    }
  }

  /**
   * Migrate consent to newer version
   */
  async migrateConsentVersion(
    consentId: string,
    targetVersion: ConsentVersion,
    migrationData: {
      updatedGranularity?: Partial<ConsentGranularity>;
      migrationReason: string;
      performedBy: string;
      performedByRole: string;
    },
  ): Promise<EnhancedConsentRecord> {
    try {
      const currentConsent = await this.getConsentById(consentId);
      const targetVersionMeta = this.consentVersions[targetVersion];

      if (!targetVersionMeta) {
        throw new Error(`Invalid target version: ${targetVersion}`);
      }

      if (currentConsent.version === targetVersion) {
        throw new Error('Consent already at target version');
      }

      // Create new consent record with updated version
      const newConsent: Omit<EnhancedConsentRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        ...currentConsent,
        version: targetVersion,
        previousVersionId: consentId,
        granularity: {
          ...currentConsent.granularity,
          ...migrationData.updatedGranularity,
        },
        consentDate: new Date(),
        lastModifiedDate: new Date(),
        migrationFromVersion: currentConsent.version,
      };

      // Create new consent record
      const migratedConsent = await this.createConsent(newConsent);

      // Update old consent to point to new version
      await this.supabase
        .from('lgpd_enhanced_consents')
        .update({ nextVersionId: migratedConsent.id })
        .eq('id', consentId);

      // Log version migration
      await this.logConsentActivity('version_migrated', consentId, {
        previousState: currentConsent,
        newState: migratedConsent,
        reason: migrationData.migrationReason,
      });

      return migratedConsent;
    } catch (error) {
      console.error('Error in migrateConsentVersion:', error);
      throw error;
    }
  }

  /**
   * Get patient's active consents with detailed information
   */
  async getPatientActiveConsents(patientId: string): Promise<EnhancedConsentRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_enhanced_consents')
        .select('*')
        .eq('patientId', patientId)
        .eq('status', ConsentStatus.ACTIVE)
        .order('createdAt', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch patient consents');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPatientActiveConsents:', error);
      throw error;
    }
  }

  /**
   * Get consent by ID with full details
   */
  async getConsentById(consentId: string): Promise<EnhancedConsentRecord> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_enhanced_consents')
        .select('*')
        .eq('id', consentId)
        .single();

      if (error || !data) {
        throw new Error('Consent record not found');
      }

      return data;
    } catch (error) {
      console.error('Error in getConsentById:', error);
      throw error;
    }
  }

  /**
   * Check if specific data processing is consented
   */
  async isProcessingConsented(
    patientId: string,
    requiredCategories: LGPDDataCategory[],
    purposes: string[],
  ): Promise<{ consented: boolean; consentId?: string; missingRequirements?: string[] }> {
    try {
      const activeConsents = await this.getPatientActiveConsents(patientId);

      for (const consent of activeConsents) {
        // Check if all required data categories are covered
        const hasAllCategories = requiredCategories.every(category =>
          consent.granularity.dataCategories.includes(category)
        );

        // Check if all required purposes are covered
        const hasAllPurposes = purposes.every(purpose =>
          consent.granularity.processingPurposes.includes(purpose)
        );

        if (hasAllCategories && hasAllPurposes) {
          return { consented: true, consentId: consent.id };
        }
      }

      // Identify missing requirements
      const missingCategories: string[] = [];
      const missingPurposes: string[] = [];

      requiredCategories.forEach(category => {
        if (
          !activeConsents.some(consent => consent.granularity.dataCategories.includes(category))
        ) {
          missingCategories.push(category);
        }
      });

      purposes.forEach(purpose => {
        if (
          !activeConsents.some(consent => consent.granularity.processingPurposes.includes(purpose))
        ) {
          missingPurposes.push(purpose);
        }
      });

      const missingRequirements = [
        ...missingCategories.map(cat => `Data category: ${cat}`),
        ...missingPurposes.map(purpose => `Purpose: ${purpose}`),
      ];

      return {
        consented: false,
        missingRequirements,
      };
    } catch (error) {
      console.error('Error in isProcessingConsented:', error);
      throw error;
    }
  }

  /**
   * Execute data action after consent withdrawal
   */
  private async executeDataAction(
    consent: EnhancedConsentRecord,
    action: 'immediate_deletion' | 'anonymization' | 'retention_until_expiry',
  ): Promise<void> {
    try {
      switch (action) {
        case 'immediate_deletion':
          await this.immediateDataDeletion(consent);
          break;
        case 'anonymization':
          await this.anonymizeData(consent);
          break;
        case 'retention_until_expiry':
          await this.scheduleRetentionPeriodDeletion(consent);
          break;
      }
    } catch (error) {
      console.error('Error executing data action:', error);
      throw error;
    }
  }

  /**
   * Immediate data deletion for withdrawn consent
   */
  private async immediateDataDeletion(consent: EnhancedConsentRecord): Promise<void> {
    // This would integrate with your data deletion service
    console.log(`Executing immediate deletion for consent ${consent.id}`);

    // Log deletion activity
    await this.logConsentActivity('data_deleted', consent.id, {
      reason: 'Immediate deletion per consent withdrawal',
      dataCategories: consent.granularity.dataCategories,
    });
  }

  /**
   * Anonymize data for withdrawn consent
   */
  private async anonymizeData(consent: EnhancedConsentRecord): Promise<void> {
    // This would integrate with your data anonymization service
    console.log(`Executing data anonymization for consent ${consent.id}`);

    // Log anonymization activity
    await this.logConsentActivity('data_anonymized', consent.id, {
      reason: 'Data anonymization per consent withdrawal',
      dataCategories: consent.granularity.dataCategories,
    });
  }

  /**
   * Schedule data deletion for retention period
   */
  private async scheduleRetentionPeriodDeletion(consent: EnhancedConsentRecord): Promise<void> {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + consent.granularity.retentionPeriod);

    // This would create a scheduled job for data deletion
    console.log(`Scheduling deletion for consent ${consent.id} at ${deletionDate}`);

    // Log scheduling activity
    await this.logConsentActivity('deletion_scheduled', consent.id, {
      reason: `Retention period deletion scheduled for ${deletionDate}`,
      dataCategories: consent.granularity.dataCategories,
    });
  }

  /**
   * Schedule automated data cleanup
   */
  private async scheduleDataCleanup(consentId: string, retentionPeriod: number): Promise<void> {
    const cleanupDate = new Date();
    cleanupDate.setDate(cleanupDate.getDate() + retentionPeriod);

    // This would integrate with your job scheduling system
    console.log(`Scheduled cleanup for consent ${consentId} at ${cleanupDate}`);
  }

  /**
   * Log consent activity
   */
  private async logConsentActivity(
    action: ConsentAuditTrail['action'],
    consentId: string,
    details: {
      previousState?: any;
      newState?: any;
      reason?: string;
      dataCategories?: LGPDDataCategory[];
    },
  ): Promise<void> {
    try {
      const auditTrail: ConsentAuditTrail = {
        id: crypto.randomUUID(),
        consentId,
        action,
        timestamp: new Date(),
        performedBy: 'system', // Would be actual user in real implementation
        performedByRole: 'system',
        previousState: details.previousState,
        newState: details.newState,
        reason: details.reason,
        legalBasis: LGPDLegalBasis.LEGAL_OBLIGATION,
      };

      await this.supabase
        .from('lgpd_consent_audit_trail')
        .insert(auditTrail);
    } catch (error) {
      console.error('Error logging consent activity:', error);
    }
  }

  /**
   * Send withdrawal confirmation to patient
   */
  private async sendWithdrawalConfirmation(
    patientId: string,
    withdrawal: ConsentWithdrawalRecord,
  ): Promise<void> {
    // This would integrate with your notification service
    console.log(`Sending withdrawal confirmation to patient ${patientId}`);

    // Update confirmation status
    await this.supabase
      .from('lgpd_consent_withdrawals')
      .update({
        confirmationSent: true,
        confirmationDate: new Date(),
      })
      .eq('id', withdrawal.id);
  }

  /**
   * Get consent audit trail
   */
  async getConsentAuditTrail(consentId: string): Promise<ConsentAuditTrail[]> {
    try {
      const { data, error } = await this.supabase
        .from('lgpd_consent_audit_trail')
        .select('*')
        .eq('consentId', consentId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch audit trail');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConsentAuditTrail:', error);
      throw error;
    }
  }

  /**
   * Get consent statistics for dashboard
   */
  async getConsentStatistics(patientId?: string): Promise<{
    totalConsents: number;
    activeConsents: number;
    withdrawnConsents: number;
    expiredConsents: number;
    versionDistribution: Record<ConsentVersion, number>;
    dataCategoryDistribution: Record<LGPDDataCategory, number>;
  }> {
    try {
      let query = this.supabase.from('lgpd_enhanced_consents').select('*');

      if (patientId) {
        query = query.eq('patientId', patientId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error('Failed to fetch consent statistics');
      }

      const consents = data || [];

      const statistics = {
        totalConsents: consents.length,
        activeConsents: consents.filter(c => c.status === ConsentStatus.ACTIVE).length,
        withdrawnConsents: consents.filter(c => c.status === ConsentStatus.WITHDRAWN).length,
        expiredConsents: consents.filter(c => c.status === ConsentStatus.EXPIRED).length,
        versionDistribution: {} as Record<ConsentVersion, number>,
        dataCategoryDistribution: {} as Record<LGPDDataCategory, number>,
      };

      // Calculate version distribution
      consents.forEach(consent => {
        statistics.versionDistribution[consent.version] =
          (statistics.versionDistribution[consent.version] || 0) + 1;
      });

      // Calculate data category distribution
      consents.forEach(consent => {
        consent.granularity.dataCategories.forEach(category => {
          statistics.dataCategoryDistribution[category] =
            (statistics.dataCategoryDistribution[category] || 0) + 1;
        });
      });

      return statistics;
    } catch (error) {
      console.error('Error in getConsentStatistics:', error);
      throw error;
    }
  }
}

export default EnhancedLGPDConsentService;
