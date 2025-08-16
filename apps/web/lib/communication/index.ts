/**
 * Communication System - Automated Communication Hub
 * Story 2.3: Automated Communication System
 *
 * This module provides a comprehensive automated communication system for NeonPro,
 * including multi-channel messaging, appointment reminders, no-show prediction,
 * waitlist management, and detailed analytics.
 */

export type {
  CampaignAnalytics,
  ChannelPerformance,
  CommunicationMetrics,
  PatientEngagementScore,
} from './analytics';
// Analytics and insights
export { CommunicationAnalytics } from './analytics';
// Main communication service
export { CommunicationService } from './communication-service';
// No-show prediction
export { NoShowPredictor } from './no-show-predictor';
export { EmailProvider } from './providers/email-provider';
// Communication providers
export { SMSProvider } from './providers/sms-provider';
export { WhatsAppProvider } from './providers/whatsapp-provider';
// Template engine
export { TemplateEngine } from './template-engine';
// Re-export specific types for convenience
export type {
  CommunicationAnalytics as CommunicationAnalyticsType,
  CommunicationCampaign,
  CommunicationChannel,
  CommunicationJob,
  CommunicationLog,
  MessageTemplate,
  MessageType,
  NoShowPrediction,
  PatientCommPreferences,
  ProviderConfig,
  TemplateVariables,
  WaitlistEntry,
} from './types';
// Core types
export * from './types';
export type { WaitlistNotificationResult } from './waitlist-manager';
// Waitlist management
export { WaitlistManager } from './waitlist-manager';

/**
 * Main communication system factory
 * Creates and configures the complete communication system
 */
export class CommunicationSystem {
  public readonly service: CommunicationService;
  public readonly analytics: CommunicationAnalytics;
  public readonly waitlistManager: WaitlistManager;
  public readonly templateEngine: TemplateEngine;
  public readonly noShowPredictor: NoShowPredictor;

  constructor() {
    this.service = new CommunicationService();
    this.analytics = new CommunicationAnalytics();
    this.waitlistManager = new WaitlistManager();
    this.templateEngine = new TemplateEngine();
    this.noShowPredictor = new NoShowPredictor();
  }

  /**
   * Initialize the communication system
   * Sets up providers, templates, and background jobs
   */
  async initialize(): Promise<void> {
    // Initialize template engine with default templates
    await this.templateEngine.initializeDefaultTemplates();
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<string, boolean>;
    lastProcessed: Date;
    errors: string[];
  }> {
    try {
      const errors: string[] = [];
      const providers: Record<string, boolean> = {};

      // Check provider health (simplified)
      providers.sms = true; // Would check Twilio API
      providers.email = true; // Would check SendGrid API
      providers.whatsapp = true; // Would check WhatsApp API

      const allProvidersHealthy = Object.values(providers).every(Boolean);
      const status = allProvidersHealthy ? 'healthy' : 'degraded';

      return {
        status,
        providers,
        lastProcessed: new Date(),
        errors,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        providers: {},
        lastProcessed: new Date(),
        errors: [error.message],
      };
    }
  }

  /**
   * Process scheduled communications
   * Should be called by a background job scheduler
   */
  async processScheduledCommunications(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const results = await this.service.processScheduledJobs();
      return {
        processed: results.length,
        failed: results.filter((r) => !r.success).length,
        errors: results
          .filter((r) => !r.success)
          .map((r) => r.error || 'Unknown error'),
      };
    } catch (error) {
      return {
        processed: 0,
        failed: 1,
        errors: [error.message],
      };
    }
  }

  /**
   * Process waitlist notifications
   * Should be called periodically to notify patients of available slots
   */
  async processWaitlistNotifications(): Promise<{
    notified: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const results = await this.waitlistManager.processNotifications();
      return {
        notified: results.filter((r) => r.notification_sent).length,
        failed: results.filter((r) => !r.notification_sent).length,
        errors: results
          .filter((r) => !r.notification_sent)
          .map((r) => r.error || 'Unknown error'),
      };
    } catch (error) {
      return {
        notified: 0,
        failed: 1,
        errors: [error.message],
      };
    }
  }

  /**
   * Update no-show predictions
   * Should be called daily to update ML model predictions
   */
  async updateNoShowPredictions(): Promise<{
    updated: number;
    errors: string[];
  }> {
    try {
      // Get upcoming appointments for next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const results = await this.noShowPredictor.batchPredict({
        startDate: new Date(),
        endDate: sevenDaysFromNow,
      });

      return {
        updated: results.length,
        errors: [],
      };
    } catch (error) {
      return {
        updated: 0,
        errors: [error.message],
      };
    }
  }
}

// Export singleton instance
export const communicationSystem = new CommunicationSystem();

// Export default
export default CommunicationSystem;
