// =====================================================
// Notification Service
// Story 1.4: Session Management & Security
// =====================================================

import type { SupabaseClient } from '@supabase/supabase-js';

// Types
export type NotificationType =
  | 'session_expiry_warning'
  | 'session_expired'
  | 'new_device_login'
  | 'suspicious_activity'
  | 'security_alert'
  | 'concurrent_session_limit'
  | 'password_change_required'
  | 'mfa_required';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface NotificationPreference {
  userId: string;
  type: NotificationType;
  channels: NotificationChannel[];
  enabled: boolean;
  quietHours?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
}

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  subject: string;
  body: string;
  data?: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  retryCount?: number;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  byType: Record<NotificationType, number>;
  byChannel: Record<NotificationChannel, number>;
  recentNotifications: Notification[];
}

// Notification Service
export class NotificationService {
  private readonly supabase: SupabaseClient;
  private readonly templates: Map<string, NotificationTemplate> = new Map();

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.loadTemplates();
  }

  // =====================================================
  // NOTIFICATION SENDING METHODS
  // =====================================================

  /**
   * Send a notification to a user
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any> = {},
    options: {
      priority?: NotificationPriority;
      scheduledAt?: Date;
      channels?: NotificationChannel[];
    } = {}
  ): Promise<Notification[]> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      const userPreference = preferences.find((p) => p.type === type);

      if (!userPreference?.enabled) {
        console.log(
          `Notifications disabled for user ${userId} and type ${type}`
        );
        return [];
      }

      // Determine channels to use
      const channels = options.channels ||
        userPreference.channels || ['in_app'];
      const notifications: Notification[] = [];

      // Check quiet hours
      if (this.isInQuietHours(userPreference.quietHours)) {
        console.log(
          `User ${userId} is in quiet hours, scheduling notification`
        );
        const scheduledAt = this.getNextAvailableTime(
          userPreference.quietHours
        );
        options.scheduledAt = scheduledAt;
      }

      // Create notifications for each channel
      for (const channel of channels) {
        const template = this.getTemplate(type, channel);
        if (!template) {
          console.warn(`No template found for ${type} on ${channel}`);
          continue;
        }

        const notification = await this.createNotification({
          userId,
          type,
          channel,
          priority: options.priority || 'normal',
          subject: this.renderTemplate(template.subject, data),
          body: this.renderTemplate(template.body, data),
          data,
          scheduledAt: options.scheduledAt,
          status: options.scheduledAt ? 'pending' : 'pending',
        });

        notifications.push(notification);

        // Send immediately if not scheduled
        if (!options.scheduledAt) {
          await this.deliverNotification(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    userIds: string[],
    type: NotificationType,
    data: Record<string, any> = {},
    options: {
      priority?: NotificationPriority;
      scheduledAt?: Date;
      channels?: NotificationChannel[];
    } = {}
  ): Promise<Notification[]> {
    try {
      const allNotifications: Notification[] = [];

      // Process in batches to avoid overwhelming the system
      const batchSize = 50;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const batchPromises = batch.map((userId) =>
          this.sendNotification(userId, type, data, options)
        );

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            allNotifications.push(...result.value);
          } else {
            console.error(
              `Failed to send notification to user ${batch[index]}:`,
              result.reason
            );
          }
        });
      }

      return allNotifications;
    } catch (error) {
      console.error('Send bulk notifications error:', error);
      throw error;
    }
  }

  /**
   * Send session expiry warning
   */
  async sendSessionExpiryWarning(
    userId: string,
    sessionId: string,
    expiresAt: Date
  ): Promise<Notification[]> {
    const minutesUntilExpiry = Math.floor(
      (expiresAt.getTime() - Date.now()) / (1000 * 60)
    );

    return this.sendNotification(
      userId,
      'session_expiry_warning',
      {
        sessionId,
        expiresAt: expiresAt.toISOString(),
        minutesUntilExpiry,
        extendUrl: `/auth/extend-session?session=${sessionId}`,
      },
      {
        priority: 'high',
      }
    );
  }

  /**
   * Send new device login notification
   */
  async sendNewDeviceNotification(
    userId: string,
    deviceInfo: {
      deviceName: string;
      location?: string;
      ipAddress: string;
      userAgent: string;
    }
  ): Promise<Notification[]> {
    return this.sendNotification(
      userId,
      'new_device_login',
      {
        deviceName: deviceInfo.deviceName,
        location: deviceInfo.location || 'Unknown location',
        ipAddress: deviceInfo.ipAddress,
        timestamp: new Date().toISOString(),
        securityUrl: '/auth/security',
      },
      {
        priority: 'high',
      }
    );
  }

  /**
   * Send security alert notification
   */
  async sendSecurityAlert(
    userId: string,
    alertType: string,
    details: Record<string, any>
  ): Promise<Notification[]> {
    return this.sendNotification(
      userId,
      'security_alert',
      {
        alertType,
        details,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        securityUrl: '/auth/security',
      },
      {
        priority: 'urgent',
      }
    );
  }

  // =====================================================
  // NOTIFICATION MANAGEMENT METHODS
  // =====================================================

  /**
   * Create a notification record
   */
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('session_notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          channel: notification.channel,
          priority: notification.priority,
          subject: notification.subject,
          body: notification.body,
          data: notification.data,
          scheduled_at: notification.scheduledAt?.toISOString(),
          status: notification.status,
          retry_count: notification.retryCount || 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      return this.mapNotification(data);
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<Notification[]> {
    try {
      let query = this.supabase
        .from('session_notifications')
        .select('*')
        .eq('user_id', userId);

      if (options.unreadOnly) {
        query = query.is('read_at', null);
      }

      if (options.type) {
        query = query.eq('type', options.type);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 50) - 1
        );
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get user notifications: ${error.message}`);
      }

      return data.map(this.mapNotification);
    } catch (error) {
      console.error('Get user notifications error:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('session_notifications')
        .update({
          read_at: new Date().toISOString(),
          status: 'read',
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to mark notification as read: ${error.message}`
        );
      }

      return this.mapNotification(data);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabase
        .from('session_notifications')
        .update({
          read_at: new Date().toISOString(),
          status: 'read',
        })
        .in('id', notificationIds)
        .select();

      if (error) {
        throw new Error(
          `Failed to mark notifications as read: ${error.message}`
        );
      }

      return data.map(this.mapNotification);
    } catch (error) {
      console.error('Mark multiple notifications as read error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('session_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw new Error(`Failed to delete notification: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  // =====================================================
  // PREFERENCE MANAGEMENT METHODS
  // =====================================================

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    try {
      const { data, error } = await this.supabase
        .from('session_notification_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to get user preferences: ${error.message}`);
      }

      return data.map((pref) => ({
        userId: pref.user_id,
        type: pref.type,
        channels: pref.channels,
        enabled: pref.enabled,
        quietHours: pref.quiet_hours,
      }));
    } catch (error) {
      console.error('Get user preferences error:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreference>[]
  ): Promise<NotificationPreference[]> {
    try {
      const updates = preferences.map((pref) => ({
        user_id: userId,
        type: pref.type,
        channels: pref.channels,
        enabled: pref.enabled,
        quiet_hours: pref.quietHours,
      }));

      const { data, error } = await this.supabase
        .from('session_notification_preferences')
        .upsert(updates, { onConflict: 'user_id,type' })
        .select();

      if (error) {
        throw new Error(`Failed to update user preferences: ${error.message}`);
      }

      return data.map((pref) => ({
        userId: pref.user_id,
        type: pref.type,
        channels: pref.channels,
        enabled: pref.enabled,
        quietHours: pref.quiet_hours,
      }));
    } catch (error) {
      console.error('Update user preferences error:', error);
      throw error;
    }
  }

  // =====================================================
  // DELIVERY METHODS
  // =====================================================

  /**
   * Deliver a notification through its specified channel
   */
  private async deliverNotification(notification: Notification): Promise<void> {
    try {
      let delivered = false;
      let errorMessage: string | undefined;

      switch (notification.channel) {
        case 'email':
          delivered = await this.sendEmail(notification);
          break;
        case 'sms':
          delivered = await this.sendSMS(notification);
          break;
        case 'push':
          delivered = await this.sendPushNotification(notification);
          break;
        case 'in_app':
          delivered = true; // In-app notifications are stored in database
          break;
        default:
          errorMessage = `Unsupported notification channel: ${notification.channel}`;
      }

      // Update notification status
      await this.updateNotificationStatus(
        notification.id!,
        delivered ? 'delivered' : 'failed',
        errorMessage
      );
    } catch (error) {
      console.error('Deliver notification error:', error);
      await this.updateNotificationStatus(
        notification.id!,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<boolean> {
    try {
      // In a real implementation, integrate with email service (SendGrid, AWS SES, etc.)
      console.log('Sending email notification:', {
        to: notification.userId,
        subject: notification.subject,
        body: notification.body,
      });

      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Send email error:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(notification: Notification): Promise<boolean> {
    try {
      // In a real implementation, integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log('Sending SMS notification:', {
        to: notification.userId,
        message: notification.body,
      });

      // Simulate SMS sending
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Send SMS error:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    notification: Notification
  ): Promise<boolean> {
    try {
      // In a real implementation, integrate with push service (FCM, APNs, etc.)
      console.log('Sending push notification:', {
        to: notification.userId,
        title: notification.subject,
        body: notification.body,
        data: notification.data,
      });

      // Simulate push notification sending
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Send push notification error:', error);
      return false;
    }
  }

  /**
   * Update notification status
   */
  private async updateNotificationStatus(
    notificationId: string,
    status: Notification['status'],
    errorMessage?: string
  ): Promise<void> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      } else if (status === 'sent') {
        updates.sent_at = new Date().toISOString();
      }

      if (errorMessage) {
        updates.error_message = errorMessage;
      }

      const { error } = await this.supabase
        .from('session_notifications')
        .update(updates)
        .eq('id', notificationId);

      if (error) {
        console.error('Update notification status error:', error);
      }
    } catch (error) {
      console.error('Update notification status error:', error);
    }
  }

  // =====================================================
  // TEMPLATE MANAGEMENT METHODS
  // =====================================================

  /**
   * Load notification templates
   */
  private async loadTemplates(): Promise<void> {
    // Default templates - in production, these would be loaded from database
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'session_expiry_warning_email',
        type: 'session_expiry_warning',
        channel: 'email',
        subject: 'Your session will expire soon',
        body: 'Your session will expire in {{minutesUntilExpiry}} minutes. Click here to extend: {{extendUrl}}',
        variables: ['minutesUntilExpiry', 'extendUrl'],
        isActive: true,
      },
      {
        id: 'new_device_login_email',
        type: 'new_device_login',
        channel: 'email',
        subject: 'New device login detected',
        body: "A new login was detected from {{deviceName}} at {{location}} ({{ipAddress}}) on {{timestamp}}. If this wasn't you, please secure your account immediately.",
        variables: ['deviceName', 'location', 'ipAddress', 'timestamp'],
        isActive: true,
      },
      {
        id: 'security_alert_email',
        type: 'security_alert',
        channel: 'email',
        subject: 'Security Alert: {{alertType}}',
        body: 'A security event has been detected on your account: {{alertType}}. Please review your account security settings.',
        variables: ['alertType'],
        isActive: true,
      },
    ];

    defaultTemplates.forEach((template) => {
      this.templates.set(`${template.type}_${template.channel}`, template);
    });
  }

  /**
   * Get template for notification type and channel
   */
  private getTemplate(
    type: NotificationType,
    channel: NotificationChannel
  ): NotificationTemplate | undefined {
    return this.templates.get(`${type}_${channel}`);
  }

  /**
   * Render template with data
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return rendered;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if current time is in user's quiet hours
   */
  private isInQuietHours(
    quietHours?: NotificationPreference['quietHours']
  ): boolean {
    if (!quietHours) {
      return false;
    }

    const now = new Date();
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: quietHours.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const [currentHour, currentMinute] = userTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
      // Same day range (e.g., 09:00 to 17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    // Overnight range (e.g., 22:00 to 06:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  /**
   * Get next available time outside quiet hours
   */
  private getNextAvailableTime(
    quietHours?: NotificationPreference['quietHours']
  ): Date {
    if (!quietHours) {
      return new Date();
    }

    const now = new Date();
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);

    const nextAvailable = new Date(now);
    nextAvailable.setHours(endHour, endMinute, 0, 0);

    // If end time is today but already passed, schedule for tomorrow
    if (nextAvailable <= now) {
      nextAvailable.setDate(nextAvailable.getDate() + 1);
    }

    return nextAvailable;
  }

  /**
   * Get default notification preferences for a user
   */
  private getDefaultPreferences(userId: string): NotificationPreference[] {
    const defaultTypes: NotificationType[] = [
      'session_expiry_warning',
      'session_expired',
      'new_device_login',
      'suspicious_activity',
      'security_alert',
      'concurrent_session_limit',
      'password_change_required',
      'mfa_required',
    ];

    return defaultTypes.map((type) => ({
      userId,
      type,
      channels: ['in_app', 'email'],
      enabled: true,
    }));
  }

  /**
   * Map database record to Notification
   */
  private mapNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      channel: data.channel,
      priority: data.priority,
      subject: data.subject,
      body: data.body,
      data: data.data,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
      readAt: data.read_at ? new Date(data.read_at) : undefined,
      status: data.status,
      retryCount: data.retry_count,
      errorMessage: data.error_message,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<NotificationStats> {
    try {
      const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();

      let query = this.supabase
        .from('session_notifications')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get notification stats: ${error.message}`);
      }

      const notifications = data.map(this.mapNotification);

      const totalSent = notifications.filter(
        (n) => n.status !== 'pending'
      ).length;
      const totalDelivered = notifications.filter(
        (n) => n.status === 'delivered' || n.status === 'read'
      ).length;
      const totalRead = notifications.filter((n) => n.status === 'read').length;
      const totalFailed = notifications.filter(
        (n) => n.status === 'failed'
      ).length;

      const byType: Record<NotificationType, number> = {
        session_expiry_warning: 0,
        session_expired: 0,
        new_device_login: 0,
        suspicious_activity: 0,
        security_alert: 0,
        concurrent_session_limit: 0,
        password_change_required: 0,
        mfa_required: 0,
      };

      const byChannel: Record<NotificationChannel, number> = {
        email: 0,
        sms: 0,
        push: 0,
        in_app: 0,
      };

      notifications.forEach((notification) => {
        byType[notification.type]++;
        byChannel[notification.channel]++;
      });

      return {
        totalSent,
        totalDelivered,
        totalRead,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
        byType,
        byChannel,
        recentNotifications: notifications.slice(0, 10),
      };
    } catch (error) {
      console.error('Get notification stats error:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        totalFailed: 0,
        deliveryRate: 0,
        readRate: 0,
        byType: {
          session_expiry_warning: 0,
          session_expired: 0,
          new_device_login: 0,
          suspicious_activity: 0,
          security_alert: 0,
          concurrent_session_limit: 0,
          password_change_required: 0,
          mfa_required: 0,
        },
        byChannel: {
          email: 0,
          sms: 0,
          push: 0,
          in_app: 0,
        },
        recentNotifications: [],
      };
    }
  }
}

export default NotificationService;
