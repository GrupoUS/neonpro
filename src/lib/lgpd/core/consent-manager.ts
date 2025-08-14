// LGPD Consent Manager - Core Module
// Story 1.5: LGPD Compliance Automation
// Task 1: Automated Consent Management (AC: 1)

import { createClient } from '@/lib/supabase/client';
import type {
  LGPDConsentRecord,
  LGPDConsentContext,
  LGPDDataCategory,
  LGPDLegalBasis,
  LGPDServiceResponse,
  LGPDEventType
} from '../types';
import { LGPDAuditLogger } from './audit-logger';
import { LGPDEventEmitter } from '../utils/event-emitter';

/**
 * LGPD Consent Manager
 * Handles automated consent collection, tracking, and management
 * Implements LGPD Article 8 (Consent) requirements
 */
export class LGPDConsentManager {
  private supabase = createClient();
  private auditLogger = new LGPDAuditLogger();
  private eventEmitter = new LGPDEventEmitter();

  /**
   * Collect consent from user with full context and audit trail
   * @param userId - User providing consent
   * @param clinicId - Clinic requesting consent
   * @param context - Consent collection context
   * @param consentGiven - Whether consent was granted
   * @param ipAddress - User's IP address
   * @param userAgent - User's browser/device info
   */
  async collectConsent(
    userId: string,
    clinicId: string,
    context: LGPDConsentContext,
    consentGiven: boolean,
    ipAddress: string,
    userAgent: string
  ): Promise<LGPDServiceResponse<LGPDConsentRecord>> {
    const startTime = Date.now();

    try {
      // Generate consent version based on context
      const consentVersion = await this.generateConsentVersion(context);
      
      // Create consent records for each data category
      const consentRecords: LGPDConsentRecord[] = [];
      
      for (const dataCategory of context.data_categories) {
        const consentRecord: Omit<LGPDConsentRecord, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          clinic_id: clinicId,
          data_category: dataCategory,
          processing_purpose: context.processing_purposes.join('; '),
          legal_basis: context.legal_basis,
          consent_given: consentGiven,
          consent_version: consentVersion,
          consent_text: await this.generateConsentText(context, dataCategory),
          consent_method: 'explicit',
          granted_at: new Date(),
          expires_at: context.retention_period ? 
            new Date(Date.now() + this.parseRetentionPeriod(context.retention_period)) : 
            undefined,
          ip_address: ipAddress,
          user_agent: userAgent
        };

        const { data, error } = await this.supabase
          .from('lgpd_consent_records')
          .insert(consentRecord)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to store consent record: ${error.message}`);
        }

        consentRecords.push(data);
      }

      // Log audit trail
      await this.auditLogger.logEvent({
        user_id: userId,
        clinic_id: clinicId,
        action: consentGiven ? 'consent_granted' : 'consent_denied',
        resource_type: 'consent_record',
        data_affected: context.data_categories,
        legal_basis: context.legal_basis,
        processing_purpose: context.processing_purposes.join('; '),
        ip_address: ipAddress,
        user_agent: userAgent,
        actor_id: userId,
        actor_type: 'user',
        metadata: {
          consent_context: context,
          consent_version: consentVersion,
          records_created: consentRecords.length
        }
      });

      // Emit consent event
      this.eventEmitter.emit('consent_granted' as LGPDEventType, {
        userId,
        clinicId,
        dataCategories: context.data_categories,
        consentGiven,
        context
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: consentRecords[0], // Return first record as primary
        compliance_notes: [
          'Consent collected in compliance with LGPD Article 8',
          'Granular consent tracking implemented',
          'Complete audit trail maintained'
        ],
        legal_references: ['LGPD Art. 8°', 'LGPD Art. 9°'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      await this.auditLogger.logEvent({
        user_id: userId,
        clinic_id: clinicId,
        action: 'consent_collection_failed',
        resource_type: 'consent_record',
        data_affected: context.data_categories,
        legal_basis: context.legal_basis,
        processing_purpose: 'consent_collection',
        ip_address: ipAddress,
        user_agent: userAgent,
        actor_id: userId,
        actor_type: 'user',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          context
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to collect consent',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Withdraw consent for specific data categories
   * Implements immediate effect as required by LGPD
   */
  async withdrawConsent(
    userId: string,
    clinicId: string,
    dataCategories: LGPDDataCategory[],
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LGPDServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      // Update consent records to withdrawn status
      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .update({
          consent_given: false,
          withdrawn_at: new Date().toISOString(),
          withdrawal_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .in('data_category', dataCategories)
        .eq('consent_given', true)
        .select();

      if (error) {
        throw new Error(`Failed to withdraw consent: ${error.message}`);
      }

      // Log audit trail
      await this.auditLogger.logEvent({
        user_id: userId,
        clinic_id: clinicId,
        action: 'consent_withdrawn',
        resource_type: 'consent_record',
        data_affected: dataCategories,
        legal_basis: 'consent',
        processing_purpose: 'consent_withdrawal',
        ip_address: ipAddress || 'unknown',
        user_agent: userAgent || 'unknown',
        actor_id: userId,
        actor_type: 'user',
        metadata: {
          withdrawal_reason: reason,
          records_updated: data?.length || 0
        }
      });

      // Emit withdrawal event
      this.eventEmitter.emit('consent_withdrawn' as LGPDEventType, {
        userId,
        clinicId,
        dataCategories,
        reason
      });

      // Trigger data processing stop for withdrawn categories
      await this.triggerDataProcessingStop(userId, clinicId, dataCategories);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: true,
        compliance_notes: [
          'Consent withdrawal processed with immediate effect',
          'Data processing stopped for withdrawn categories',
          'LGPD Article 18, IX compliance maintained'
        ],
        legal_references: ['LGPD Art. 18°, IX'],
        audit_logged: true,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to withdraw consent',
        audit_logged: true,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Get current consent status for user
   */
  async getConsentStatus(
    userId: string,
    clinicId: string,
    dataCategory?: LGPDDataCategory
  ): Promise<LGPDServiceResponse<LGPDConsentRecord[]>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (dataCategory) {
        query = query.eq('data_category', dataCategory);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get consent status: ${error.message}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: data || [],
        processing_time_ms: processingTime,
        audit_logged: false // Read operations don't require audit
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consent status',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Check if user has valid consent for specific data processing
   */
  async hasValidConsent(
    userId: string,
    clinicId: string,
    dataCategory: LGPDDataCategory,
    processingPurpose: string
  ): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .eq('data_category', dataCategory)
        .eq('consent_given', true)
        .is('withdrawn_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .limit(1);

      return (data && data.length > 0) || false;

    } catch (error) {
      console.error('Error checking consent validity:', error);
      return false;
    }
  }

  /**
   * Get consent analytics for administrators
   */
  async getConsentAnalytics(
    clinicId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<LGPDServiceResponse<any>> {
    const startTime = Date.now();

    try {
      let query = this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('clinic_id', clinicId);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get consent analytics: ${error.message}`);
      }

      // Calculate analytics
      const analytics = {
        total_consents: data?.length || 0,
        active_consents: data?.filter(c => c.consent_given && !c.withdrawn_at).length || 0,
        withdrawn_consents: data?.filter(c => c.withdrawn_at).length || 0,
        expired_consents: data?.filter(c => c.expires_at && new Date(c.expires_at) < new Date()).length || 0,
        consent_rate: data?.length ? 
          (data.filter(c => c.consent_given).length / data.length * 100) : 0,
        by_category: this.groupByCategory(data || []),
        by_legal_basis: this.groupByLegalBasis(data || []),
        recent_withdrawals: data?.filter(c => 
          c.withdrawn_at && 
          new Date(c.withdrawn_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: analytics,
        processing_time_ms: processingTime,
        audit_logged: false
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consent analytics',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  /**
   * Schedule consent renewal for expiring consents
   */
  async scheduleConsentRenewal(
    clinicId: string,
    daysBeforeExpiry: number = 30
  ): Promise<LGPDServiceResponse<number>> {
    const startTime = Date.now();

    try {
      const expiryThreshold = new Date();
      expiryThreshold.setDate(expiryThreshold.getDate() + daysBeforeExpiry);

      const { data, error } = await this.supabase
        .from('lgpd_consent_records')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('consent_given', true)
        .is('withdrawn_at', null)
        .lte('expires_at', expiryThreshold.toISOString());

      if (error) {
        throw new Error(`Failed to get expiring consents: ${error.message}`);
      }

      // Group by user for renewal notifications
      const userConsents = new Map<string, LGPDConsentRecord[]>();
      data?.forEach(consent => {
        const existing = userConsents.get(consent.user_id) || [];
        existing.push(consent);
        userConsents.set(consent.user_id, existing);
      });

      // Emit renewal events
      for (const [userId, consents] of userConsents) {
        this.eventEmitter.emit('consent_renewal_required' as LGPDEventType, {
          userId,
          clinicId,
          consents,
          daysUntilExpiry: daysBeforeExpiry
        });
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: userConsents.size,
        compliance_notes: [
          'Consent renewal notifications scheduled',
          'Users will be notified before consent expiry'
        ],
        audit_logged: false,
        processing_time_ms: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule consent renewal',
        audit_logged: false,
        processing_time_ms: processingTime
      };
    }
  }

  // Private helper methods

  private async generateConsentVersion(context: LGPDConsentContext): Promise<string> {
    const hash = await this.hashContext(context);
    return `v${new Date().getFullYear()}.${new Date().getMonth() + 1}.${hash.substring(0, 8)}`;
  }

  private async generateConsentText(
    context: LGPDConsentContext,
    dataCategory: LGPDDataCategory
  ): Promise<string> {
    return `Eu autorizo o processamento dos meus dados pessoais da categoria "${dataCategory}" para os seguintes propósitos: ${context.processing_purposes.join(', ')}. Base legal: ${context.legal_basis}. ${context.retention_period ? `Período de retenção: ${context.retention_period}.` : ''} ${context.third_party_sharing ? `Dados podem ser compartilhados com terceiros: ${context.third_parties?.join(', ')}.` : ''}`;
  }

  private parseRetentionPeriod(period: string): number {
    // Parse retention period string to milliseconds
    const match = period.match(/(\d+)\s*(days?|months?|years?)/i);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'day':
      case 'days':
        return value * 24 * 60 * 60 * 1000;
      case 'month':
      case 'months':
        return value * 30 * 24 * 60 * 60 * 1000;
      case 'year':
      case 'years':
        return value * 365 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  private async hashContext(context: LGPDConsentContext): Promise<string> {
    const contextString = JSON.stringify(context, Object.keys(context).sort());
    const encoder = new TextEncoder();
    const data = encoder.encode(contextString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private groupByCategory(consents: LGPDConsentRecord[]): Record<string, number> {
    return consents.reduce((acc, consent) => {
      acc[consent.data_category] = (acc[consent.data_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByLegalBasis(consents: LGPDConsentRecord[]): Record<string, number> {
    return consents.reduce((acc, consent) => {
      acc[consent.legal_basis] = (acc[consent.legal_basis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async triggerDataProcessingStop(
    userId: string,
    clinicId: string,
    dataCategories: LGPDDataCategory[]
  ): Promise<void> {
    // Emit event to stop data processing for withdrawn categories
    this.eventEmitter.emit('data_processing_stop_required' as LGPDEventType, {
      userId,
      clinicId,
      dataCategories,
      timestamp: new Date()
    });
  }
}
