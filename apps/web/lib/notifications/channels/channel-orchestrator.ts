/**
 * Notification Channel Orchestrator - NeonPro System
 * Orquestra e gerencia todos os canais de notificação com fallback inteligente
 * Integração: Email, Push, SMS, WhatsApp, In-App
 * Compliance: LGPD + ANVISA + CFM + Brazilian regulations
 */

import type {
  HealthcareNotificationContext,
  LGPDCompliantData,
  NotificationChannel,
  NotificationMetadata,
  NotificationPreferences,
  NotificationResult,
} from '../types/notifications';

// Import all channel providers
import {
  type EmailParams,
  type EmailProviderConfig,
  EmailProviderFactory,
} from './email-provider';
import {
  type PushParams,
  type PushProviderConfig,
  PushProviderFactory,
} from './push-provider';
import {
  type SMSParams,
  type SMSProviderConfig,
  SMSProviderFactory,
} from './sms-provider';
import {
  type WhatsAppParams,
  type WhatsAppProviderConfig,
  WhatsAppProviderFactory,
} from './whatsapp-provider';

// Channel orchestrator types
export interface ChannelOrchestratorConfig {
  email: EmailProviderConfig;
  push: PushProviderConfig;
  sms: SMSProviderConfig;
  whatsapp: WhatsAppProviderConfig;
  fallback: {
    enabled: boolean;
    strategy: 'sequential' | 'parallel' | 'smart';
    maxRetries: number;
    retryDelayMs: number;
    channelPriority: NotificationChannel[];
  };
  routing: {
    urgencyMapping: {
      [key in 'low' | 'medium' | 'high' | 'critical']: NotificationChannel[];
    };
    timeBasedRouting: {
      businessHours: NotificationChannel[];
      afterHours: NotificationChannel[];
      weekends: NotificationChannel[];
    };
    geographicRouting?: {
      [countryCode: string]: NotificationChannel[];
    };
  };
  analytics: {
    enabled: boolean;
    trackDelivery: boolean;
    trackEngagement: boolean;
    retentionDays: number;
  };
}

export interface MultiChannelNotificationParams {
  channels: NotificationChannel[];
  fallbackChannels?: NotificationChannel[];
  content: {
    email?: EmailParams;
    push?: PushParams;
    sms?: SMSParams;
    whatsapp?: WhatsAppParams;
    inApp?: InAppNotificationParams;
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  metadata: NotificationMetadata & {
    patientId?: string;
    clinicId: string;
    medicalContext?: HealthcareNotificationContext;
    lgpdConsent: LGPDCompliantData;
    userPreferences?: NotificationPreferences;
  };
  options?: {
    allowFallback?: boolean;
    maxDeliveryTime?: number; // seconds
    requireDeliveryConfirmation?: boolean;
    respectQuietHours?: boolean;
    respectFrequencyLimits?: boolean;
  };
}

export interface InAppNotificationParams {
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  expiresAt?: Date;
  persistent?: boolean;
}

export interface MultiChannelResult {
  success: boolean;
  results: Array<{
    channel: NotificationChannel;
    result: NotificationResult;
    attemptNumber: number;
  }>;
  fallbackUsed: boolean;
  totalDuration: number;
  deliveredChannels: NotificationChannel[];
  failedChannels: NotificationChannel[];
  metadata: NotificationMetadata;
}

export interface ChannelHealthStatus {
  channel: NotificationChannel;
  healthy: boolean;
  latency?: number;
  errorRate?: number;
  lastCheck: Date;
  provider: string;
}

/**
 * Notification Channel Orchestrator
 * Central hub for managing all notification channels with intelligent routing
 */
class NotificationChannelOrchestrator {
  private readonly emailFactory: EmailProviderFactory;
  private readonly pushFactory: PushProviderFactory;
  private readonly smsFactory: SMSProviderFactory;
  private readonly whatsappFactory: WhatsAppProviderFactory;
  private readonly config: ChannelOrchestratorConfig;
  private readonly healthCache: Map<NotificationChannel, ChannelHealthStatus> =
    new Map();
  private lastHealthCheck: Date = new Date(0);

  constructor(config: ChannelOrchestratorConfig) {
    this.config = config;
    this.emailFactory = new EmailProviderFactory(config.email);
    this.pushFactory = new PushProviderFactory(config.push);
    this.smsFactory = new SMSProviderFactory(config.sms);
    this.whatsappFactory = new WhatsAppProviderFactory(config.whatsapp);
  }

  /**
   * Send notification across multiple channels with intelligent routing and fallback
   */
  async sendMultiChannel(
    params: MultiChannelNotificationParams
  ): Promise<MultiChannelResult> {
    const startTime = Date.now();
    const results: MultiChannelResult['results'] = [];
    const deliveredChannels: NotificationChannel[] = [];
    const failedChannels: NotificationChannel[] = [];
    let fallbackUsed = false;

    try {
      // Determine optimal channels based on urgency, preferences, and health
      const optimalChannels = await this.determineOptimalChannels(params);

      // Apply user preferences and compliance filters
      const filteredChannels = await this.applyUserPreferences(
        optimalChannels,
        params
      );

      // Primary channel attempts
      const primaryResults = await this.attemptChannels(
        filteredChannels,
        params,
        results
      );

      // Determine if fallback is needed
      const needsFallback = this.shouldUseFallback(primaryResults, params);

      if (needsFallback && params.options?.allowFallback !== false) {
        fallbackUsed = true;
        const fallbackChannels = await this.determineFallbackChannels(
          params,
          failedChannels
        );
        await this.attemptChannels(fallbackChannels, params, results);
      }

      // Categorize results
      results.forEach((result) => {
        if (result.result.success) {
          deliveredChannels.push(result.channel);
        } else {
          failedChannels.push(result.channel);
        }
      });

      const totalDuration = Date.now() - startTime;
      const success = deliveredChannels.length > 0;

      // Analytics tracking
      if (this.config.analytics.enabled) {
        await this.trackAnalytics(params, results, totalDuration);
      }

      return {
        success,
        results,
        fallbackUsed,
        totalDuration,
        deliveredChannels,
        failedChannels,
        metadata: {
          ...params.metadata,
          duration: totalDuration,
          channelsAttempted: results.length,
          deliveryRate: deliveredChannels.length / results.length,
        },
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;

      return {
        success: false,
        results,
        fallbackUsed,
        totalDuration,
        deliveredChannels,
        failedChannels,
        metadata: {
          ...params.metadata,
          duration: totalDuration,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Send notification to specific channel
   */
  async sendToChannel(
    channel: NotificationChannel,
    params: MultiChannelNotificationParams
  ): Promise<NotificationResult> {
    try {
      switch (channel) {
        case 'email':
          if (!params.content.email) {
            throw new Error('Email content not provided');
          }
          return await this.emailFactory.sendWithFallback(params.content.email);

        case 'push':
          if (!params.content.push) {
            throw new Error('Push content not provided');
          }
          return await this.pushFactory.sendPush(params.content.push);

        case 'sms':
          if (!params.content.sms) {
            throw new Error('SMS content not provided');
          }
          return await this.smsFactory.sendSMS(params.content.sms);

        case 'whatsapp':
          if (!params.content.whatsapp) {
            throw new Error('WhatsApp content not provided');
          }
          return await this.whatsappFactory.sendWhatsApp(
            params.content.whatsapp
          );

        case 'in_app':
          if (!params.content.inApp) {
            throw new Error('In-app content not provided');
          }
          return await this.sendInAppNotification(
            params.content.inApp,
            params.metadata
          );

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        providerId: `${channel}-orchestrator`,
        channel,
        timestamp: new Date(),
        metadata: params.metadata,
      };
    }
  }

  /**
   * Check health status of all channels
   */
  async checkChannelHealth(): Promise<ChannelHealthStatus[]> {
    const now = new Date();

    // Cache health checks for 1 minute
    if (
      now.getTime() - this.lastHealthCheck.getTime() < 60_000 &&
      this.healthCache.size > 0
    ) {
      return Array.from(this.healthCache.values());
    }

    const healthChecks = await Promise.allSettled([
      this.checkEmailHealth(),
      this.checkPushHealth(),
      this.checkSMSHealth(),
      this.checkWhatsAppHealth(),
    ]);

    const healthStatuses: ChannelHealthStatus[] = [];

    healthChecks.forEach((result, index) => {
      const channels: NotificationChannel[] = [
        'email',
        'push',
        'sms',
        'whatsapp',
      ];
      const channel = channels[index];

      if (result.status === 'fulfilled') {
        healthStatuses.push(result.value);
        this.healthCache.set(channel, result.value);
      } else {
        const errorStatus: ChannelHealthStatus = {
          channel,
          healthy: false,
          lastCheck: now,
          provider: 'unknown',
        };
        healthStatuses.push(errorStatus);
        this.healthCache.set(channel, errorStatus);
      }
    });

    this.lastHealthCheck = now;
    return healthStatuses;
  }

  /**
   * Get channel analytics and performance metrics
   */
  async getChannelAnalytics(_timeRange: { start: Date; end: Date }): Promise<{
    [channel in NotificationChannel]?: {
      sent: number;
      delivered: number;
      failed: number;
      deliveryRate: number;
      avgLatency: number;
      costAnalysis?: {
        totalCost: number;
        costPerMessage: number;
        currency: string;
      };
    };
  }> {
    // This would typically query analytics database
    // For now, return mock data structure
    return {
      email: {
        sent: 0,
        delivered: 0,
        failed: 0,
        deliveryRate: 0,
        avgLatency: 0,
      },
      push: {
        sent: 0,
        delivered: 0,
        failed: 0,
        deliveryRate: 0,
        avgLatency: 0,
      },
      sms: {
        sent: 0,
        delivered: 0,
        failed: 0,
        deliveryRate: 0,
        avgLatency: 0,
      },
      whatsapp: {
        sent: 0,
        delivered: 0,
        failed: 0,
        deliveryRate: 0,
        avgLatency: 0,
      },
    };
  }

  // Private methods for internal orchestration

  private async determineOptimalChannels(
    params: MultiChannelNotificationParams
  ): Promise<NotificationChannel[]> {
    // Start with requested channels
    let channels = [...params.channels];

    // Apply urgency-based routing
    if (this.config.routing.urgencyMapping[params.urgency]) {
      const urgencyChannels =
        this.config.routing.urgencyMapping[params.urgency];
      channels = channels.filter((ch) => urgencyChannels.includes(ch));
    }

    // Apply time-based routing
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isBusinessHours = hour >= 8 && hour < 18 && !isWeekend;

    if (isBusinessHours) {
      channels = channels.filter((ch) =>
        this.config.routing.timeBasedRouting.businessHours.includes(ch)
      );
    } else if (isWeekend) {
      channels = channels.filter((ch) =>
        this.config.routing.timeBasedRouting.weekends.includes(ch)
      );
    } else {
      channels = channels.filter((ch) =>
        this.config.routing.timeBasedRouting.afterHours.includes(ch)
      );
    }

    // Check channel health
    const healthStatuses = await this.checkChannelHealth();
    channels = channels.filter((ch) => {
      const health = healthStatuses.find((h) => h.channel === ch);
      return health?.healthy !== false;
    });

    return channels;
  }

  private async applyUserPreferences(
    channels: NotificationChannel[],
    params: MultiChannelNotificationParams
  ): Promise<NotificationChannel[]> {
    if (!params.metadata.userPreferences) {
      return channels;
    }

    const prefs = params.metadata.userPreferences;

    // Filter by enabled channels
    let filteredChannels = channels.filter((ch) => {
      switch (ch) {
        case 'email':
          return prefs.email.enabled;
        case 'push':
          return prefs.push.enabled;
        case 'sms':
          return prefs.sms.enabled;
        case 'whatsapp':
          return prefs.whatsapp.enabled;
        case 'in_app':
          return prefs.inApp.enabled;
        default:
          return true;
      }
    });

    // Apply quiet hours
    if (params.options?.respectQuietHours !== false) {
      const now = new Date();
      const currentHour = now.getHours();

      filteredChannels = filteredChannels.filter((ch) => {
        const channelPrefs = prefs[ch as keyof NotificationPreferences] as any;
        if (channelPrefs?.quietHours) {
          const { start, end } = channelPrefs.quietHours;
          const startHour = Number.parseInt(start.split(':')[0], 10);
          const endHour = Number.parseInt(end.split(':')[0], 10);

          if (startHour <= endHour) {
            return currentHour < startHour || currentHour >= endHour;
          }
          return currentHour >= endHour && currentHour < startHour;
        }
        return true;
      });
    }

    return filteredChannels;
  }

  private async attemptChannels(
    channels: NotificationChannel[],
    params: MultiChannelNotificationParams,
    results: MultiChannelResult['results']
  ): Promise<void> {
    for (const channel of channels) {
      const attemptNumber =
        results.filter((r) => r.channel === channel).length + 1;

      if (attemptNumber > this.config.fallback.maxRetries) {
        continue;
      }

      const result = await this.sendToChannel(channel, params);

      results.push({
        channel,
        result,
        attemptNumber,
      });

      // If successful, continue to next channel
      if (result.success) {
        continue;
      }

      // If failed and retries are configured, wait and retry
      if (attemptNumber < this.config.fallback.maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.fallback.retryDelayMs)
        );
      }
    }
  }

  private shouldUseFallback(
    results: MultiChannelResult['results'],
    params: MultiChannelNotificationParams
  ): boolean {
    if (!this.config.fallback.enabled) {
      return false;
    }

    // Use fallback if no channels were successful
    const successfulChannels = results.filter((r) => r.result.success);
    if (successfulChannels.length === 0) {
      return true;
    }

    // Use fallback for critical messages if primary channels failed
    if (
      params.urgency === 'critical' &&
      successfulChannels.length < params.channels.length
    ) {
      return true;
    }

    return false;
  }

  private async determineFallbackChannels(
    params: MultiChannelNotificationParams,
    failedChannels: NotificationChannel[]
  ): Promise<NotificationChannel[]> {
    const fallbackChannels =
      params.fallbackChannels || this.config.fallback.channelPriority;

    // Exclude channels that already failed
    return fallbackChannels.filter((ch) => !failedChannels.includes(ch));
  }

  private async sendInAppNotification(
    _params: InAppNotificationParams,
    metadata: NotificationMetadata
  ): Promise<NotificationResult> {
    try {
      // This would typically save to database and push via WebSocket/SSE
      // For now, simulate success

      return {
        success: true,
        messageId: `in-app-${Date.now()}`,
        providerId: 'in-app-provider',
        channel: 'in_app',
        timestamp: new Date(),
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'In-app notification failed',
        providerId: 'in-app-provider',
        channel: 'in_app',
        timestamp: new Date(),
        metadata,
      };
    }
  }

  private async checkEmailHealth(): Promise<ChannelHealthStatus> {
    const startTime = Date.now();
    try {
      const provider = await this.emailFactory.getHealthyProvider();
      const healthy = await provider.isHealthy();
      return {
        channel: 'email',
        healthy,
        latency: Date.now() - startTime,
        lastCheck: new Date(),
        provider: provider.id,
      };
    } catch (_error) {
      return {
        channel: 'email',
        healthy: false,
        lastCheck: new Date(),
        provider: 'email-factory',
      };
    }
  }

  private async checkPushHealth(): Promise<ChannelHealthStatus> {
    const startTime = Date.now();
    try {
      const provider = await this.pushFactory.getProvider();
      const healthy = await provider.isHealthy();
      return {
        channel: 'push',
        healthy,
        latency: Date.now() - startTime,
        lastCheck: new Date(),
        provider: provider.id,
      };
    } catch (_error) {
      return {
        channel: 'push',
        healthy: false,
        lastCheck: new Date(),
        provider: 'push-factory',
      };
    }
  }

  private async checkSMSHealth(): Promise<ChannelHealthStatus> {
    const startTime = Date.now();
    try {
      const provider = await this.smsFactory.getProvider();
      const healthy = await provider.isHealthy();
      return {
        channel: 'sms',
        healthy,
        latency: Date.now() - startTime,
        lastCheck: new Date(),
        provider: provider.id,
      };
    } catch (_error) {
      return {
        channel: 'sms',
        healthy: false,
        lastCheck: new Date(),
        provider: 'sms-factory',
      };
    }
  }

  private async checkWhatsAppHealth(): Promise<ChannelHealthStatus> {
    const startTime = Date.now();
    try {
      const provider = await this.whatsappFactory.getProvider();
      const healthy = await provider.isHealthy();
      return {
        channel: 'whatsapp',
        healthy,
        latency: Date.now() - startTime,
        lastCheck: new Date(),
        provider: provider.id,
      };
    } catch (_error) {
      return {
        channel: 'whatsapp',
        healthy: false,
        lastCheck: new Date(),
        provider: 'whatsapp-factory',
      };
    }
  }

  private async trackAnalytics(
    params: MultiChannelNotificationParams,
    results: MultiChannelResult['results'],
    duration: number
  ): Promise<void> {
    // This would typically save analytics to database
    // For now, just log the data
    if (this.config.analytics.trackDelivery) {
      console.log('[Analytics] Notification delivery tracked:', {
        urgency: params.urgency,
        channels: params.channels,
        results: results.map((r) => ({
          channel: r.channel,
          success: r.result.success,
        })),
        duration,
        timestamp: new Date(),
      });
    }
  }
}

// Export types and orchestrator
export type {
  ChannelOrchestratorConfig,
  MultiChannelNotificationParams,
  MultiChannelResult,
  ChannelHealthStatus,
  InAppNotificationParams,
};
export { NotificationChannelOrchestrator };
