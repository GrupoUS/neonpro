import type { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { LGPDComplianceManager } from '../LGPDComplianceManager';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface ConsentAutomationConfig {
  auto_renewal_enabled: boolean;
  renewal_notice_days: number;
  withdrawal_grace_period_hours: number;
  granular_tracking_enabled: boolean;
  consent_analytics_enabled: boolean;
  third_party_sync_enabled: boolean;
}

export interface ConsentChangeEvent {
  user_id: string;
  purpose_id: string;
  old_status: boolean | null;
  new_status: boolean;
  change_reason:
    | 'user_action'
    | 'policy_update'
    | 'expiration'
    | 'withdrawal'
    | 'renewal';
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface ConsentAnalytics {
  total_consents: number;
  consent_rate: number;
  withdrawal_rate: number;
  renewal_rate: number;
  consent_by_purpose: Record<string, number>;
  consent_trends: Array<{
    date: string;
    consents_given: number;
    consents_withdrawn: number;
  }>;
  user_consent_journey: Array<{
    user_id: string;
    consent_score: number;
    last_interaction: string;
  }>;
}

export interface ConsentRenewalTask {
  id: string;
  user_id: string;
  purpose_id: string;
  current_expiry: string;
  renewal_due: string;
  notification_sent: boolean;
  renewal_completed: boolean;
  created_at: string;
}

export class ConsentAutomationManager {
  private readonly supabase: SupabaseClient;
  private readonly complianceManager: LGPDComplianceManager;
  private readonly config: ConsentAutomationConfig;

  constructor(
    supabase: SupabaseClient,
    complianceManager: LGPDComplianceManager,
    config: ConsentAutomationConfig
  ) {
    this.supabase = supabase;
    this.complianceManager = complianceManager;
    this.config = config;
  }

  /**
   * Automated Consent Collection with Granular Tracking
   */
  async collectConsentWithTracking(
    userId: string,
    purposeId: string,
    granted: boolean,
    metadata: {
      ip_address?: string;
      user_agent?: string;
      collection_method: 'banner' | 'form' | 'api' | 'import';
      data_categories: string[];
      processing_activities: string[];
      legal_basis: string;
      retention_period?: string;
    }
  ): Promise<{ success: boolean; consent_id: string; tracking_id: string }> {
    try {
      // Start transaction for atomic consent collection
      const { data: consent, error: consentError } = await this.supabase
        .from('lgpd_user_consents')
        .upsert(
          {
            user_id: userId,
            purpose_id: purposeId,
            granted,
            ip_address: metadata.ip_address,
            user_agent: metadata.user_agent,
            legal_basis: metadata.legal_basis,
            expires_at: metadata.retention_period
              ? new Date(
                  Date.now() +
                    this.parseRetentionPeriod(metadata.retention_period)
                ).toISOString()
              : null,
            collection_method: metadata.collection_method,
            data_categories: metadata.data_categories,
            processing_activities: metadata.processing_activities,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,purpose_id',
          }
        )
        .select('id')
        .single();

      if (consentError) {
        throw consentError;
      }

      // Create granular tracking record
      const { data: tracking, error: trackingError } = await this.supabase
        .from('lgpd_consent_tracking')
        .insert({
          consent_id: consent.id,
          user_id: userId,
          purpose_id: purposeId,
          action: granted ? 'consent_given' : 'consent_withdrawn',
          previous_status: null, // Will be updated by trigger
          new_status: granted,
          change_reason: 'user_action',
          ip_address: metadata.ip_address,
          user_agent: metadata.user_agent,
          collection_context: {
            method: metadata.collection_method,
            data_categories: metadata.data_categories,
            processing_activities: metadata.processing_activities,
            legal_basis: metadata.legal_basis,
          },
        })
        .select('id')
        .single();

      if (trackingError) {
        throw trackingError;
      }

      // Schedule renewal if auto-renewal is enabled
      if (
        this.config.auto_renewal_enabled &&
        granted &&
        metadata.retention_period
      ) {
        await this.scheduleConsentRenewal(
          userId,
          purposeId,
          metadata.retention_period
        );
      }

      // Trigger consent analytics update
      if (this.config.consent_analytics_enabled) {
        await this.updateConsentAnalytics(userId, purposeId, granted);
      }

      // Sync with third-party systems if enabled
      if (this.config.third_party_sync_enabled) {
        await this.syncConsentWithThirdParties(
          userId,
          purposeId,
          granted,
          metadata
        );
      }

      // Log audit event
      await this.complianceManager.logAuditEvent({
        event_type: granted ? 'consent_given' : 'consent_withdrawn',
        user_id: userId,
        resource_type: 'consent',
        resource_id: consent.id,
        action: `consent_${granted ? 'granted' : 'withdrawn'}_for_${purposeId}`,
        details: {
          purpose_id: purposeId,
          collection_method: metadata.collection_method,
          legal_basis: metadata.legal_basis,
          data_categories: metadata.data_categories,
        },
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
      });

      return {
        success: true,
        consent_id: consent.id,
        tracking_id: tracking.id,
      };
    } catch (error) {
      console.error('Error in automated consent collection:', error);
      throw new Error(
        `Failed to collect consent with tracking: ${error.message}`
      );
    }
  }

  /**
   * Automated Consent Renewal System
   */
  async scheduleConsentRenewal(
    userId: string,
    purposeId: string,
    retentionPeriod: string
  ): Promise<string> {
    try {
      const expiryDate = new Date(
        Date.now() + this.parseRetentionPeriod(retentionPeriod)
      );
      const renewalDate = new Date(
        expiryDate.getTime() -
          this.config.renewal_notice_days * 24 * 60 * 60 * 1000
      );

      const { data: renewalTask, error } = await this.supabase
        .from('lgpd_consent_renewals')
        .insert({
          user_id: userId,
          purpose_id: purposeId,
          current_expiry: expiryDate.toISOString(),
          renewal_due: renewalDate.toISOString(),
          notification_sent: false,
          renewal_completed: false,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return renewalTask.id;
    } catch (error) {
      console.error('Error scheduling consent renewal:', error);
      throw new Error(`Failed to schedule consent renewal: ${error.message}`);
    }
  }

  /**
   * Process Pending Consent Renewals
   */
  async processPendingRenewals(): Promise<{
    processed: number;
    notifications_sent: number;
    renewals_completed: number;
    errors: string[];
  }> {
    try {
      const { data: pendingRenewals, error } = await this.supabase
        .from('lgpd_consent_renewals')
        .select(
          `
          *,
          lgpd_user_consents!inner(
            user_id,
            purpose_id,
            granted
          )
        `
        )
        .eq('renewal_completed', false)
        .lte('renewal_due', new Date().toISOString());

      if (error) {
        throw error;
      }

      let processed = 0;
      let notificationsSent = 0;
      let renewalsCompleted = 0;
      const errors: string[] = [];

      for (const renewal of pendingRenewals || []) {
        try {
          processed++;

          // Send renewal notification if not sent
          if (!renewal.notification_sent) {
            await this.sendConsentRenewalNotification(renewal);
            notificationsSent++;

            // Update notification status
            await this.supabase
              .from('lgpd_consent_renewals')
              .update({ notification_sent: true })
              .eq('id', renewal.id);
          }

          // Check if renewal period has passed
          const gracePeriodEnd = new Date(
            new Date(renewal.renewal_due).getTime() +
              this.config.withdrawal_grace_period_hours * 60 * 60 * 1000
          );

          if (new Date() > gracePeriodEnd) {
            // Auto-withdraw consent if no response
            await this.autoWithdrawExpiredConsent(renewal);
            renewalsCompleted++;

            // Mark renewal as completed
            await this.supabase
              .from('lgpd_consent_renewals')
              .update({ renewal_completed: true })
              .eq('id', renewal.id);
          }
        } catch (renewalError) {
          errors.push(`Renewal ${renewal.id}: ${renewalError.message}`);
        }
      }

      return {
        processed,
        notifications_sent: notificationsSent,
        renewals_completed: renewalsCompleted,
        errors,
      };
    } catch (error) {
      console.error('Error processing pending renewals:', error);
      throw new Error(`Failed to process pending renewals: ${error.message}`);
    }
  }

  /**
   * Automated Consent Withdrawal with Grace Period
   */
  async processConsentWithdrawal(
    userId: string,
    purposeId: string,
    withdrawalReason: string,
    metadata: {
      ip_address?: string;
      user_agent?: string;
      immediate: boolean;
    }
  ): Promise<{
    success: boolean;
    effective_date: string;
    grace_period_end?: string;
  }> {
    try {
      const effectiveDate = metadata.immediate
        ? new Date()
        : new Date(
            Date.now() +
              this.config.withdrawal_grace_period_hours * 60 * 60 * 1000
          );

      // Update consent status
      const { error: consentError } = await this.supabase
        .from('lgpd_user_consents')
        .update({
          granted: false,
          withdrawal_date: new Date().toISOString(),
          withdrawal_reason: withdrawalReason,
          effective_withdrawal_date: effectiveDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('purpose_id', purposeId);

      if (consentError) {
        throw consentError;
      }

      // Create tracking record
      await this.supabase.from('lgpd_consent_tracking').insert({
        user_id: userId,
        purpose_id: purposeId,
        action: 'consent_withdrawn',
        new_status: false,
        change_reason: 'user_action',
        withdrawal_reason: withdrawalReason,
        effective_date: effectiveDate.toISOString(),
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
      });

      // Schedule data processing cessation if not immediate
      if (metadata.immediate) {
        await this.immediateDataProcessingCessation(userId, purposeId);
      } else {
        await this.scheduleDataProcessingCessation(
          userId,
          purposeId,
          effectiveDate
        );
      }

      // Log audit event
      await this.complianceManager.logAuditEvent({
        event_type: 'consent_withdrawn',
        user_id: userId,
        resource_type: 'consent',
        resource_id: purposeId,
        action: `consent_withdrawn_${metadata.immediate ? 'immediate' : 'scheduled'}`,
        details: {
          purpose_id: purposeId,
          withdrawal_reason: withdrawalReason,
          effective_date: effectiveDate.toISOString(),
          immediate: metadata.immediate,
        },
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
      });

      return {
        success: true,
        effective_date: effectiveDate.toISOString(),
        grace_period_end: metadata.immediate
          ? undefined
          : effectiveDate.toISOString(),
      };
    } catch (error) {
      console.error('Error processing consent withdrawal:', error);
      throw new Error(`Failed to process consent withdrawal: ${error.message}`);
    }
  }

  /**
   * Generate Consent Analytics
   */
  async generateConsentAnalytics(dateRange: {
    start: string;
    end: string;
  }): Promise<ConsentAnalytics> {
    try {
      const { data: analytics, error } = await this.supabase.rpc(
        'generate_consent_analytics',
        {
          start_date: dateRange.start,
          end_date: dateRange.end,
        }
      );

      if (error) {
        throw error;
      }

      return analytics;
    } catch (error) {
      console.error('Error generating consent analytics:', error);
      throw new Error(`Failed to generate consent analytics: ${error.message}`);
    }
  }

  /**
   * Automated Consent Inheritance for Related Accounts
   */
  async processConsentInheritance(
    parentUserId: string,
    childUserIds: string[],
    inheritanceRules: {
      inherit_essential: boolean;
      inherit_analytics: boolean;
      inherit_marketing: boolean;
      inherit_communication: boolean;
    }
  ): Promise<{
    success: boolean;
    inherited_consents: number;
    errors: string[];
  }> {
    try {
      let inheritedConsents = 0;
      const errors: string[] = [];

      // Get parent consents
      const { data: parentConsents, error: parentError } = await this.supabase
        .from('lgpd_user_consents')
        .select('*')
        .eq('user_id', parentUserId)
        .eq('granted', true);

      if (parentError) {
        throw parentError;
      }

      for (const childUserId of childUserIds) {
        for (const parentConsent of parentConsents || []) {
          try {
            // Check inheritance rules
            const shouldInherit = this.shouldInheritConsent(
              parentConsent.purpose,
              inheritanceRules
            );

            if (shouldInherit) {
              await this.collectConsentWithTracking(
                childUserId,
                parentConsent.purpose_id,
                true,
                {
                  collection_method: 'inheritance',
                  data_categories: parentConsent.data_categories || [],
                  processing_activities:
                    parentConsent.processing_activities || [],
                  legal_basis: 'inherited_consent',
                  retention_period: parentConsent.retention_period,
                }
              );
              inheritedConsents++;
            }
          } catch (inheritError) {
            errors.push(
              `Child ${childUserId}, Purpose ${parentConsent.purpose_id}: ${inheritError.message}`
            );
          }
        }
      }

      return {
        success: true,
        inherited_consents: inheritedConsents,
        errors,
      };
    } catch (error) {
      console.error('Error processing consent inheritance:', error);
      throw new Error(
        `Failed to process consent inheritance: ${error.message}`
      );
    }
  }

  // Private helper methods
  private parseRetentionPeriod(period: string): number {
    // Parse retention period string (e.g., "1 year", "6 months", "30 days")
    const match = period.match(/(\d+)\s*(year|month|day)s?/i);
    if (!match) {
      return 365 * 24 * 60 * 60 * 1000; // Default 1 year
    }

    const [, amount, unit] = match;
    const multipliers = {
      day: 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };

    return Number.parseInt(amount, 10) * multipliers[unit.toLowerCase()];
  }

  private async sendConsentRenewalNotification(
    renewal: ConsentRenewalTask
  ): Promise<void> {
    // Implementation for sending renewal notifications
    // This would integrate with your notification system
    console.log(
      `Sending renewal notification for user ${renewal.user_id}, purpose ${renewal.purpose_id}`
    );
  }

  private async autoWithdrawExpiredConsent(
    renewal: ConsentRenewalTask
  ): Promise<void> {
    await this.processConsentWithdrawal(
      renewal.user_id,
      renewal.purpose_id,
      'automatic_expiry',
      { immediate: true }
    );
  }

  private async scheduleDataProcessingCessation(
    userId: string,
    purposeId: string,
    effectiveDate: Date
  ): Promise<void> {
    // Schedule data processing to stop at effective date
    await this.supabase.from('lgpd_data_processing_schedule').insert({
      user_id: userId,
      purpose_id: purposeId,
      action: 'cessation',
      scheduled_for: effectiveDate.toISOString(),
    });
  }

  private async immediateDataProcessingCessation(
    userId: string,
    purposeId: string
  ): Promise<void> {
    // Immediately stop data processing for this purpose
    await this.supabase.from('lgpd_data_processing_log').insert({
      user_id: userId,
      purpose_id: purposeId,
      action: 'immediate_cessation',
      executed_at: new Date().toISOString(),
    });
  }

  private async updateConsentAnalytics(
    userId: string,
    purposeId: string,
    granted: boolean
  ): Promise<void> {
    // Update real-time consent analytics
    await this.supabase.rpc('update_consent_analytics', {
      user_id: userId,
      purpose_id: purposeId,
      consent_granted: granted,
    });
  }

  private async syncConsentWithThirdParties(
    userId: string,
    purposeId: string,
    granted: boolean,
    _metadata: any
  ): Promise<void> {
    // Sync consent status with third-party systems
    console.log(
      `Syncing consent with third parties for user ${userId}, purpose ${purposeId}: ${granted}`
    );
  }

  private shouldInheritConsent(purpose: string, rules: any): boolean {
    const purposeRuleMap = {
      essential: rules.inherit_essential,
      analytics: rules.inherit_analytics,
      marketing: rules.inherit_marketing,
      communication: rules.inherit_communication,
    };

    return purposeRuleMap[purpose];
  }
}
