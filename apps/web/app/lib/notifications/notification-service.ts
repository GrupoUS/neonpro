/**
 * NeonPro - Core Notification Service
 * Manages email, SMS, and in-app notifications with HIPAA compliance
 */

import { z } from 'zod';
import { supabase } from '@/app/utils/supabase/client';
import { AuditService } from './audit-service';
import type {
  NotificationChannel,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
} from './config';
import { EmailService } from './email-service';
import { SchedulingService } from './scheduling-service';
import { SMSService } from './sms-service';

// Notification payload schema
const NotificationPayloadSchema = z.object({
  recipientId: z.string().uuid(),
  type: z.enum([
    'appointment_reminder',
    'appointment_confirmation',
    'appointment_cancellation',
    'reschedule_request',
    'treatment_reminder',
    'follow_up_reminder',
    'emergency_alert',
    'billing_reminder',
  ]),
  channel: z.enum(['email', 'sms', 'in_app']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  templateData: z.record(z.any()).optional(),
  scheduledFor: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

export type NotificationResult = {
  success: boolean;
  notificationId?: string;
  channel: NotificationChannel;
  error?: string;
  deliveredAt?: Date;
};
export class NotificationService {
  private readonly emailService: EmailService;
  private readonly smsService: SMSService;
  private readonly schedulingService: SchedulingService;
  private readonly auditService: AuditService;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.schedulingService = new SchedulingService();
    this.auditService = new AuditService();
  }

  /**
   * Send notification through appropriate channel(s)
   * Respects user preferences and HIPAA compliance requirements
   */
  async sendNotification(
    payload: NotificationPayload
  ): Promise<NotificationResult[]> {
    try {
      // Validate payload
      const validPayload = NotificationPayloadSchema.parse(payload);

      // Get user preferences
      const preferences = await this.getUserPreferences(
        validPayload.recipientId
      );
      if (!preferences) {
        throw new Error('User preferences not found');
      }

      // Check if user has consented to receive notifications
      if (!preferences.consentGranted) {
        await this.auditService.log({
          action: 'notification_blocked',
          recipientId: validPayload.recipientId,
          reason: 'consent_not_granted',
          notificationType: validPayload.type,
        });
        return [
          {
            success: false,
            channel: 'email',
            error: 'User has not granted consent for notifications',
          },
        ];
      }

      // Determine channels to use
      const channels = this.determineChannels(validPayload, preferences);
      if (channels.length === 0) {
        await this.auditService.log({
          action: 'notification_blocked',
          recipientId: validPayload.recipientId,
          reason: 'no_enabled_channels',
          notificationType: validPayload.type,
        });
        return [
          {
            success: false,
            channel: 'email',
            error: 'No enabled notification channels for user',
          },
        ];
      }

      // Schedule or send immediately
      if (validPayload.scheduledFor && validPayload.scheduledFor > new Date()) {
        return await this.scheduleNotification(
          validPayload,
          channels,
          preferences
        );
      }

      return await this.sendImmediately(validPayload, channels, preferences);
    } catch (error) {
      await this.auditService.log({
        action: 'notification_error',
        recipientId: payload.recipientId,
        error: error instanceof Error ? error.message : 'Unknown error',
        notificationType: payload.type,
      });

      return [
        {
          success: false,
          channel: 'email',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to send notification',
        },
      ];
    }
  } /**
   * Schedule notification for future delivery
   */
  private async scheduleNotification(
    payload: NotificationPayload,
    channels: NotificationChannel[],
    preferences: NotificationPreferences
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const channel of channels) {
      try {
        const scheduledId = await this.schedulingService.scheduleNotification({
          recipientId: payload.recipientId,
          type: payload.type,
          channel,
          payload,
          scheduledFor: payload.scheduledFor!,
          preferences,
        });

        results.push({
          success: true,
          notificationId: scheduledId,
          channel,
        });

        await this.auditService.log({
          action: 'notification_scheduled',
          recipientId: payload.recipientId,
          notificationId: scheduledId,
          channel,
          scheduledFor: payload.scheduledFor,
          notificationType: payload.type,
        });
      } catch (error) {
        results.push({
          success: false,
          channel,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to schedule notification',
        });
      }
    }

    return results;
  }

  /**
   * Send notification immediately through specified channels
   */
  private async sendImmediately(
    payload: NotificationPayload,
    channels: NotificationChannel[],
    preferences: NotificationPreferences
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const channel of channels) {
      try {
        let result: NotificationResult;

        switch (channel) {
          case 'email':
            result = await this.emailService.send({
              ...payload,
              recipientEmail: preferences.email,
              timezone: preferences.timezone,
            });
            break;

          case 'sms':
            result = await this.smsService.send({
              ...payload,
              recipientPhone: preferences.phone,
              timezone: preferences.timezone,
            });
            break;

          case 'in_app':
            result = await this.sendInAppNotification(payload);
            break;

          default:
            throw new Error(`Unsupported channel: ${channel}`);
        }

        results.push(result);

        await this.auditService.log({
          action: 'notification_sent',
          recipientId: payload.recipientId,
          notificationId: result.notificationId,
          channel,
          success: result.success,
          deliveredAt: result.deliveredAt,
          notificationType: payload.type,
        });
      } catch (error) {
        results.push({
          success: false,
          channel,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to send notification',
        });
      }
    }

    return results;
  } /**
   * Get user notification preferences from database
   */
  private async getUserPreferences(
    userId: string
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Determine which channels to use based on payload and user preferences
   */
  private determineChannels(
    payload: NotificationPayload,
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // If specific channel requested, use that (if enabled)
    if (payload.channel) {
      const channelEnabled = this.isChannelEnabled(
        payload.channel,
        payload.type,
        preferences
      );
      if (channelEnabled) {
        channels.push(payload.channel);
      }
      return channels;
    }

    // Otherwise, use all enabled channels based on priority and type
    const priorityChannels = this.getChannelsForPriority(payload.priority);
    const typeChannels = this.getChannelsForType(payload.type, preferences);

    // Intersect priority and type channels
    for (const channel of priorityChannels) {
      if (
        typeChannels.includes(channel) &&
        this.isChannelEnabled(channel, payload.type, preferences)
      ) {
        channels.push(channel);
      }
    }

    return channels;
  }

  /**
   * Check if a specific channel is enabled for a notification type
   */
  private isChannelEnabled(
    channel: NotificationChannel,
    type: NotificationType,
    preferences: NotificationPreferences
  ): boolean {
    const channelPrefs = preferences.channels[channel];
    if (!channelPrefs?.enabled) {
      return false;
    }

    // Check if this notification type is enabled for this channel
    return channelPrefs.enabledTypes.includes(type);
  }

  /**
   * Get channels appropriate for notification priority
   */
  private getChannelsForPriority(
    priority: NotificationPriority
  ): NotificationChannel[] {
    switch (priority) {
      case 'urgent':
        return ['sms', 'in_app', 'email'];
      case 'high':
        return ['sms', 'email', 'in_app'];
      case 'normal':
        return ['email', 'in_app'];
      case 'low':
        return ['in_app', 'email'];
      default:
        return ['email'];
    }
  } /**
   * Get channels enabled for specific notification type
   */
  private getChannelsForType(
    type: NotificationType,
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // Check each channel to see if it supports this notification type
    Object.entries(preferences.channels).forEach(
      ([channelKey, channelPrefs]) => {
        if (channelPrefs.enabled && channelPrefs.enabledTypes.includes(type)) {
          channels.push(channelKey as NotificationChannel);
        }
      }
    );

    return channels;
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    try {
      // Store notification in database for in-app display
      const { data, error } = await supabase
        .from('in_app_notifications')
        .insert({
          user_id: payload.recipientId,
          type: payload.type,
          title: payload.subject,
          content: payload.content,
          priority: payload.priority,
          metadata: payload.metadata,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(
          `Failed to create in-app notification: ${error.message}`
        );
      }

      return {
        success: true,
        notificationId: data.id,
        channel: 'in_app',
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        channel: 'in_app',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send in-app notification',
      };
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    try {
      const success =
        await this.schedulingService.cancelNotification(notificationId);

      if (success) {
        await this.auditService.log({
          action: 'notification_cancelled',
          notificationId,
        });
      }

      return success;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get notification delivery status
   */
  async getNotificationStatus(notificationId: string): Promise<{
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
    deliveredAt?: Date;
    error?: string;
  } | null> {
    try {
      // Check scheduled notifications
      const scheduledStatus =
        await this.schedulingService.getNotificationStatus(notificationId);
      if (scheduledStatus) {
        return scheduledStatus;
      }

      // Check delivery status from services
      const emailStatus =
        await this.emailService.getDeliveryStatus(notificationId);
      if (emailStatus) {
        return emailStatus;
      }

      const smsStatus = await this.smsService.getDeliveryStatus(notificationId);
      if (smsStatus) {
        return smsStatus;
      }

      return null;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('notification_preferences').upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`);
      }

      await this.auditService.log({
        action: 'preferences_updated',
        recipientId: userId,
        metadata: { preferences },
      });

      return true;
    } catch (_error) {
      return false;
    }
  }
}
