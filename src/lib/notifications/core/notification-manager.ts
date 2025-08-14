// NeonPro Notification System - Core Manager
// Story 1.7: Sistema de Notificações Avançado
// File: src/lib/notifications/core/notification-manager.ts

import { createClient } from '@/app/utils/supabase/client';
import { Database } from '@/types/database';

type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';
type NotificationStatus = 'pending' | 'processing' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'cancelled';
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface NotificationPayload {
  profileId: string;
  notificationType: string;
  channel: NotificationChannel;
  recipientAddress: string;
  subject?: string;
  messageBody: string;
  templateId?: string;
  urgencyLevel?: string;
  relatedResourceType?: string;
  relatedResourceId?: string;
  metadata?: Record<string, any>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  channel: NotificationChannel;
  subjectTemplate?: string;
  contentTemplate: string;
  variables: string[];
  status: 'draft' | 'active' | 'archived';
}

interface NotificationPreferences {
  profileId: string;
  notificationType: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  emailAddress?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  pushDeviceTokens?: string[];
  advanceNoticeDays?: number;
  reminderFrequencyDays?: number;
  businessHoursOnly?: boolean;
  severityThreshold?: string;
  isActive: boolean;
}

interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  avgDeliveryTime?: string;
  channelBreakdown: Record<string, any>;
}

export class NotificationManager {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Send a notification through the specified channel
   */
  async sendNotification(payload: NotificationPayload): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      // Validate recipient preferences
      const preferences = await this.getUserPreferences(payload.profileId, payload.notificationType);
      if (!preferences || !this.isChannelEnabled(preferences, payload.channel)) {
        return {
          success: false,
          error: `Channel ${payload.channel} is disabled for user ${payload.profileId}`
        };
      }

      // Create notification record
      const { data: notification, error: insertError } = await this.supabase
        .from('notification_log')
        .insert({
          profile_id: payload.profileId,
          template_id: payload.templateId,
          notification_type: payload.notificationType,
          channel: payload.channel,
          recipient_address: payload.recipientAddress,
          subject: payload.subject,
          message_body: payload.messageBody,
          status: 'pending',
          urgency_level: payload.urgencyLevel || 'normal',
          related_resource_type: payload.relatedResourceType,
          related_resource_id: payload.relatedResourceId,
          delivery_attempts: 0,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Failed to create notification record: ${insertError.message}`);
      }

      // Process notification based on channel
      const processingResult = await this.processNotification(notification.id, payload);
      
      return {
        success: processingResult.success,
        notificationId: notification.id,
        error: processingResult.error
      };

    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications: NotificationPayload[]): Promise<{
    successful: string[];
    failed: Array<{ payload: NotificationPayload; error: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ payload: NotificationPayload; error: string }> = [];

    for (const notification of notifications) {
      const result = await this.sendNotification(notification);
      if (result.success && result.notificationId) {
        successful.push(result.notificationId);
      } else {
        failed.push({
          payload: notification,
          error: result.error || 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(profileId: string, notificationType: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .select('*')
        .eq('profile_id', profileId)
        .eq('notification_type', notificationType)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(profileId: string, preferences: Partial<NotificationPreferences>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('notification_settings')
        .upsert({
          profile_id: profileId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get notification templates
   */
  async getTemplates(category?: string, channel?: NotificationChannel): Promise<NotificationTemplate[]> {
    try {
      let query = this.supabase
        .from('notification_templates')
        .select('*')
        .eq('status', 'active');

      if (category) {
        query = query.eq('category', category);
      }
      if (channel) {
        query = query.eq('channel', channel);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    Object.keys(variables).forEach(key => {
      const placeholder = `{${key}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), variables[key] || '');
    });

    return rendered;
  }

  /**
   * Get notification metrics
   */
  async getNotificationMetrics(
    profileId?: string,
    startDate?: Date,
    endDate?: Date,
    channel?: NotificationChannel
  ): Promise<NotificationMetrics | null> {
    try {
      let query = this.supabase
        .from('notification_log')
        .select('channel, status, sent_at, delivered_at, created_at');

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      if (channel) {
        query = query.eq('channel', channel);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch metrics: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalFailed: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          channelBreakdown: {}
        };
      }

      // Calculate metrics
      const totalSent = data.length;
      const totalDelivered = data.filter(n => n.status === 'delivered' || n.status === 'opened' || n.status === 'clicked').length;
      const totalOpened = data.filter(n => n.status === 'opened' || n.status === 'clicked').length;
      const totalClicked = data.filter(n => n.status === 'clicked').length;
      const totalFailed = data.filter(n => n.status === 'failed').length;

      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

      // Channel breakdown
      const channelBreakdown: Record<string, any> = {};
      data.forEach(notification => {
        if (!channelBreakdown[notification.channel]) {
          channelBreakdown[notification.channel] = {
            sent: 0,
            delivered: 0,
            failed: 0
          };
        }
        channelBreakdown[notification.channel].sent++;
        if (notification.status === 'delivered' || notification.status === 'opened' || notification.status === 'clicked') {
          channelBreakdown[notification.channel].delivered++;
        }
        if (notification.status === 'failed') {
          channelBreakdown[notification.channel].failed++;
        }
      });

      return {
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalFailed,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        channelBreakdown
      };

    } catch (error) {
      console.error('Error getting notification metrics:', error);
      return null;
    }
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(
    profileId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('notification_log')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch notification history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  /**
   * Check if channel is enabled for user
   */
  private isChannelEnabled(preferences: NotificationPreferences, channel: NotificationChannel): boolean {
    if (!preferences.isActive) return false;

    switch (channel) {
      case 'email':
        return preferences.emailEnabled && !!preferences.emailAddress;
      case 'sms':
        return preferences.smsEnabled && !!preferences.phoneNumber;
      case 'whatsapp':
        return preferences.whatsappEnabled && !!preferences.whatsappNumber;
      case 'push':
        return preferences.pushEnabled && !!preferences.pushDeviceTokens?.length;
      case 'in_app':
        return preferences.inAppEnabled;
      default:
        return false;
    }
  }

  /**
   * Process notification based on channel
   */
  private async processNotification(notificationId: string, payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    try {
      // Update status to processing
      await this.updateNotificationStatus(notificationId, 'processing');

      // Here we would integrate with actual providers (SendGrid, Twilio, etc.)
      // For now, we'll simulate the processing
      
      switch (payload.channel) {
        case 'email':
          return await this.processEmailNotification(notificationId, payload);
        case 'sms':
          return await this.processSMSNotification(notificationId, payload);
        case 'whatsapp':
          return await this.processWhatsAppNotification(notificationId, payload);
        case 'push':
          return await this.processPushNotification(notificationId, payload);
        case 'in_app':
          return await this.processInAppNotification(notificationId, payload);
        default:
          throw new Error(`Unsupported channel: ${payload.channel}`);
      }
    } catch (error) {
      await this.updateNotificationStatus(notificationId, 'failed', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update notification status
   */
  private async updateNotificationStatus(
    notificationId: string, 
    status: NotificationStatus, 
    errorMessage?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      last_attempt: new Date().toISOString()
    };

    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await this.supabase
      .from('notification_log')
      .update(updateData)
      .eq('id', notificationId);
  }

  /**
   * Process email notification
   */
  private async processEmailNotification(notificationId: string, payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    // TODO: Integrate with email provider (SendGrid, AWS SES, etc.)
    // For now, simulate success
    await this.updateNotificationStatus(notificationId, 'sent');
    
    // Simulate delivery after a short delay
    setTimeout(async () => {
      await this.updateNotificationStatus(notificationId, 'delivered');
    }, 1000);

    return { success: true };
  }

  /**
   * Process SMS notification
   */
  private async processSMSNotification(notificationId: string, payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    // For now, simulate success
    await this.updateNotificationStatus(notificationId, 'sent');
    
    // Simulate delivery after a short delay
    setTimeout(async () => {
      await this.updateNotificationStatus(notificationId, 'delivered');
    }, 2000);

    return { success: true };
  }

  /**
   * Process WhatsApp notification
   */
  private async processWhatsAppNotification(notificationId: string, payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    // TODO: Integrate with WhatsApp Business API
    // For now, simulate success
    await this.updateNotificationStatus(notificationId, 'sent');
    
    // Simulate delivery after a short delay
    setTimeout(async () => {
      await this.updateNotificationStatus(notificationId, 'delivered');
    }, 3000);

    return { success: true };
  }

  /**
   * Process push notification
   */
  private async processPushNotification(notificationId: string, payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    // TODO: Integrate with push notification service (Firebase, APNs, etc.)
    // For now, simulate success
    await this.updateNotificationStatus(notificationId, 'sent');
    
    // Simulate delivery after a short delay
    setTimeout(async () => {
      await this.updateNotificationStatus(notificationId, 'delivered');
    }, 500);

    return { success: true };
  }

  /**
   * Process in-app notification
   */
  private async processInAppNotification(notificationId: string, payload: NotificationPayload): Promise<{ success: boolean; error?: string }> {
    // In-app notifications are immediately available
    await this.updateNotificationStatus(notificationId, 'sent');
    await this.updateNotificationStatus(notificationId, 'delivered');

    return { success: true };
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();

// Export types
export type {
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
  NotificationPayload,
  NotificationTemplate,
  NotificationPreferences,
  NotificationMetrics
};