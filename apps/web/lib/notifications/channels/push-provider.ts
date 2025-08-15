/**
 * Push Notification Provider - NeonPro System
 * Implementa provedores de push notifications com FCM
 * Compliance: LGPD + device privacy + healthcare standards
 */

import type {
  HealthcareNotificationContext,
  LGPDCompliantData,
  NotificationChannel,
  NotificationMetadata,
  NotificationProvider,
  NotificationResult,
} from '../types/notifications';

// Push-specific types
export interface PushProvider extends NotificationProvider {
  type: 'push';
  sendPush(params: PushParams): Promise<NotificationResult>;
  sendBulkPush(params: BulkPushParams): Promise<NotificationResult[]>;
  subscribeDevice(params: DeviceSubscriptionParams): Promise<boolean>;
  unsubscribeDevice(deviceToken: string): Promise<boolean>;
  validateDevice(deviceToken: string): Promise<boolean>;
}

export interface PushParams {
  deviceTokens: string | string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  clickAction?: string;
  sound?: string;
  badge?: number;
  priority?: 'normal' | 'high';
  ttl?: number; // Time to live in seconds
  collapseKey?: string;
  metadata: NotificationMetadata & {
    patientId?: string;
    clinicId: string;
    medicalContext?: HealthcareNotificationContext;
    lgpdConsent: LGPDCompliantData;
    deviceInfo?: DeviceInfo;
  };
}

export interface BulkPushParams {
  notifications: Array<{
    deviceTokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    metadata: PushParams['metadata'];
  }>;
  batchSize?: number;
}

export interface DeviceSubscriptionParams {
  deviceToken: string;
  userId: string;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  deviceInfo: DeviceInfo;
  lgpdConsent: LGPDCompliantData;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion?: string;
  appVersion: string;
  deviceModel?: string;
  locale?: string;
  timezone?: string;
}

export interface PushProviderConfig {
  fcm: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
    databaseURL?: string;
  };
  apns?: {
    keyId: string;
    teamId: string;
    bundleId: string;
    privateKey: string;
    production: boolean;
  };
  webPush?: {
    vapidPublicKey: string;
    vapidPrivateKey: string;
    subject: string;
  };
  defaults: {
    ttl: number;
    priority: 'normal' | 'high';
    sound: string;
    icon: string;
  };
  compliance: {
    lgpdRequired: boolean;
    deviceConsentRequired: boolean;
    dataRetentionDays: number;
  };
}

/**
 * Firebase Cloud Messaging Provider
 * Primary push notification provider for NeonPro
 */
class FCMPushProvider implements PushProvider {
  public readonly id = 'fcm';
  public readonly name = 'Firebase Cloud Messaging';
  public readonly type = 'push' as const;
  public readonly channel: NotificationChannel = 'push';
  public readonly priority = 1;

  private config: PushProviderConfig['fcm'];
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: PushProviderConfig['fcm']) {
    this.config = config;
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      console.error(`[${this.id}] Health check failed:`, error);
      return false;
    }
  }

  async sendPush(params: PushParams): Promise<NotificationResult> {
    const startTime = Date.now();

    try {
      // Validate LGPD compliance
      await this.validateLGPDCompliance(params.metadata.lgpdConsent);

      const accessToken = await this.getAccessToken();
      const deviceTokens = Array.isArray(params.deviceTokens)
        ? params.deviceTokens
        : [params.deviceTokens];

      // Prepare FCM payload
      const fcmPayload = {
        message: {
          tokens: deviceTokens,
          notification: {
            title: params.title,
            body: params.body,
            image: params.imageUrl,
          },
          data: {
            ...params.data,
            // Healthcare context for compliance
            clinicId: params.metadata.clinicId,
            ...(params.metadata.patientId && {
              patientId: params.metadata.patientId,
            }),
            notificationId: params.metadata.id,
          },
          android: {
            priority: params.priority || 'normal',
            ttl: params.ttl ? `${params.ttl}s` : '86400s', // 24h default
            notification: {
              icon: 'ic_notification',
              sound: params.sound || 'default',
              click_action: params.clickAction,
              channel_id: 'neonpro_notifications',
            },
            data: {
              collapse_key: params.collapseKey,
            },
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title: params.title,
                  body: params.body,
                },
                sound: params.sound || 'default',
                badge: params.badge,
                'thread-id': params.collapseKey,
              },
            },
            headers: {
              'apns-priority': params.priority === 'high' ? '10' : '5',
              'apns-expiration': params.ttl
                ? String(Math.floor(Date.now() / 1000) + params.ttl)
                : '0',
            },
          },
          webpush: {
            notification: {
              title: params.title,
              body: params.body,
              icon: '/icons/notification-icon.png',
              image: params.imageUrl,
              badge: '/icons/badge-icon.png',
              tag: params.collapseKey,
              requireInteraction: params.priority === 'high',
            },
            fcm_options: {
              link: params.clickAction,
            },
          },
        },
      };

      // Send to FCM
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${this.config.projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fcmPayload),
        }
      );

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(
          `FCM API error: ${responseData.error?.message || response.statusText}`
        );
      }

      return {
        success: true,
        messageId: responseData.name || `fcm-${Date.now()}`,
        providerId: this.id,
        channel: this.channel,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          duration,
          response: responseData,
          deviceCount: deviceTokens.length,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        providerId: this.id,
        channel: this.channel,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          duration,
          error,
        },
      };
    }
  }

  async sendBulkPush(params: BulkPushParams): Promise<NotificationResult[]> {
    const batchSize = params.batchSize || 500; // FCM limit
    const results: NotificationResult[] = [];

    // Process in batches
    for (let i = 0; i < params.notifications.length; i += batchSize) {
      const batch = params.notifications.slice(i, i + batchSize);

      const batchPromises = batch.map((notification) =>
        this.sendPush({
          deviceTokens: notification.deviceTokens,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          metadata: notification.metadata,
        })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Batch processing error',
            providerId: this.id,
            channel: this.channel,
            timestamp: new Date(),
            metadata: batch[index].metadata,
          });
        }
      });

      // Rate limiting between batches
      if (i + batchSize < params.notifications.length) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
      }
    }

    return results;
  }

  async subscribeDevice(params: DeviceSubscriptionParams): Promise<boolean> {
    try {
      // Validate LGPD compliance for device registration
      await this.validateLGPDCompliance(params.lgpdConsent);

      // Validate device token with FCM
      const isValid = await this.validateDevice(params.deviceToken);
      if (!isValid) {
        throw new Error('Invalid device token');
      }

      // Store device subscription in database
      // This would typically involve storing in Supabase
      // For now, we'll return success if validation passes

      return true;
    } catch (error) {
      console.error(`[${this.id}] Device subscription failed:`, error);
      return false;
    }
  }

  async unsubscribeDevice(_deviceToken: string): Promise<boolean> {
    try {
      // Remove device from topic subscriptions
      // This would typically involve database cleanup

      return true;
    } catch (error) {
      console.error(`[${this.id}] Device unsubscription failed:`, error);
      return false;
    }
  }

  async validateDevice(deviceToken: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();

      // Test send to validate token
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${this.config.projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token: deviceToken,
              data: {
                test: 'validation',
              },
              dry_run: true, // Validation without sending
            },
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error(`[${this.id}] Device validation failed:`, error);
      return false;
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Create JWT for OAuth2
      const jwt = await this.createJWT();

      // Exchange JWT for access token
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `OAuth2 error: ${data.error_description || response.statusText}`
        );
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000 - 60_000); // 1 min buffer

      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error}`);
    }
  }

  private async createJWT(): Promise<string> {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.config.clientEmail,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour
      iat: now,
    };

    // For production, you'd use a proper JWT library
    // This is a simplified implementation
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = await this.signJWT(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private async signJWT(_data: string): Promise<string> {
    // Simplified JWT signing - in production use proper crypto library
    // This would typically use the private key to sign the data
    return btoa('signature'); // Placeholder
  }

  private async validateLGPDCompliance(
    lgpdData: LGPDCompliantData
  ): Promise<void> {
    if (!lgpdData.consentGiven) {
      throw new Error('LGPD: Push notification consent not provided');
    }

    if (lgpdData.consentExpiry && new Date() > lgpdData.consentExpiry) {
      throw new Error('LGPD: Push notification consent expired');
    }

    if (!lgpdData.purposes.includes('notifications')) {
      throw new Error('LGPD: Push notification purpose not authorized');
    }
  }
}

/**
 * Push Provider Factory
 * Manages push notification providers and device management
 */
class PushProviderFactory {
  private fcmProvider: FCMPushProvider;

  constructor(config: PushProviderConfig) {
    this.config = config;
    this.fcmProvider = new FCMPushProvider(config.fcm);
  }

  async getProvider(): Promise<PushProvider> {
    if (await this.fcmProvider.isHealthy()) {
      return this.fcmProvider;
    }

    throw new Error('Push notification provider is unhealthy');
  }

  async sendPush(params: PushParams): Promise<NotificationResult> {
    try {
      const provider = await this.getProvider();
      return await provider.sendPush(params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push provider failed',
        providerId: 'push-factory',
        channel: 'push',
        timestamp: new Date(),
        metadata: params.metadata,
      };
    }
  }

  async sendBulkPush(params: BulkPushParams): Promise<NotificationResult[]> {
    try {
      const provider = await this.getProvider();
      return await provider.sendBulkPush(params);
    } catch (error) {
      return params.notifications.map((notification) => ({
        success: false,
        error: error instanceof Error ? error.message : 'Push provider failed',
        providerId: 'push-factory',
        channel: 'push',
        timestamp: new Date(),
        metadata: notification.metadata,
      }));
    }
  }

  async subscribeDevice(params: DeviceSubscriptionParams): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      return await provider.subscribeDevice(params);
    } catch (error) {
      console.error('Device subscription failed:', error);
      return false;
    }
  }

  async unsubscribeDevice(deviceToken: string): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      return await provider.unsubscribeDevice(deviceToken);
    } catch (error) {
      console.error('Device unsubscription failed:', error);
      return false;
    }
  }
}

// Export types and implementations
export type {
  PushProvider,
  PushParams,
  BulkPushParams,
  DeviceSubscriptionParams,
  DeviceInfo,
  PushProviderConfig,
};
export { FCMPushProvider, PushProviderFactory };
