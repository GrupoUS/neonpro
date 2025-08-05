/**
 * Push Notifications System for Mobile API
 * Handles push notification delivery, device management, and notification analytics
 */

import { createClient } from '@supabase/supabase-js';
import {
  PushNotificationConfig,
  PushNotificationPayload,
  DeviceRegistration,
  NotificationTemplate,
  NotificationAnalytics,
  NotificationStatus,
  NotificationPriority,
  NotificationCategory,
  PushNotificationResult,
  NotificationBatch,
  NotificationSchedule,
  DevicePreferences,
  NotificationMetrics
} from './types';

/**
 * Push Notifications Manager
 * Comprehensive push notification system for mobile devices
 */
export class PushNotificationsManager {
  private supabase: any;
  private config: PushNotificationConfig;
  private fcmServerKey: string;
  private apnsConfig: any;
  private deviceRegistry: Map<string, DeviceRegistration> = new Map();
  private notificationQueue: NotificationBatch[] = [];
  private analytics: NotificationAnalytics;
  private isInitialized = false;

  constructor(config: PushNotificationConfig) {
    this.config = config;
    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseKey
    );
    this.fcmServerKey = config.fcmServerKey;
    this.apnsConfig = config.apnsConfig;
    this.analytics = {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      deliveryRate: 0,
      averageDeliveryTime: 0,
      deviceMetrics: new Map(),
      categoryMetrics: new Map(),
      hourlyMetrics: []
    };
  }

  /**
   * Initialize push notification system
   */
  async initialize(): Promise<void> {
    try {
      // Load device registrations
      await this.loadDeviceRegistrations();
      
      // Initialize notification templates
      await this.loadNotificationTemplates();
      
      // Setup analytics
      await this.initializeAnalytics();
      
      // Start background processes
      this.startNotificationProcessor();
      this.startAnalyticsCollector();
      
      this.isInitialized = true;
      console.log('Push notifications system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(registration: DeviceRegistration): Promise<boolean> {
    try {
      // Validate device token
      if (!this.validateDeviceToken(registration.deviceToken, registration.platform)) {
        throw new Error('Invalid device token format');
      }

      // Store in database
      const { error } = await this.supabase
        .from('device_registrations')
        .upsert({
          device_id: registration.deviceId,
          user_id: registration.userId,
          device_token: registration.deviceToken,
          platform: registration.platform,
          app_version: registration.appVersion,
          os_version: registration.osVersion,
          preferences: registration.preferences,
          timezone: registration.timezone,
          language: registration.language,
          is_active: true,
          registered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local registry
      this.deviceRegistry.set(registration.deviceId, registration);

      console.log(`Device registered: ${registration.deviceId}`);
      return true;
    } catch (error) {
      console.error('Device registration failed:', error);
      return false;
    }
  }

  /**
   * Send push notification to single device
   */
  async sendNotification(
    deviceId: string,
    payload: PushNotificationPayload
  ): Promise<PushNotificationResult> {
    try {
      const device = this.deviceRegistry.get(deviceId);
      if (!device) {
        throw new Error(`Device not found: ${deviceId}`);
      }

      // Check device preferences
      if (!this.shouldSendNotification(device, payload)) {
        return {
          success: false,
          messageId: '',
          error: 'Notification blocked by user preferences',
          deliveredAt: new Date()
        };
      }

      // Send based on platform
      let result: PushNotificationResult;
      if (device.platform === 'ios') {
        result = await this.sendAPNSNotification(device, payload);
      } else {
        result = await this.sendFCMNotification(device, payload);
      }

      // Store notification record
      await this.storeNotificationRecord(deviceId, payload, result);

      // Update analytics
      this.updateAnalytics(result, payload.category);

      return result;
    } catch (error) {
      console.error('Send notification failed:', error);
      return {
        success: false,
        messageId: '',
        error: error.message,
        deliveredAt: new Date()
      };
    }
  }

  /**
   * Send batch notifications
   */
  async sendBatchNotifications(
    batch: NotificationBatch
  ): Promise<PushNotificationResult[]> {
    const results: PushNotificationResult[] = [];
    const batchSize = this.config.batchSize || 100;

    try {
      // Process in chunks
      for (let i = 0; i < batch.deviceIds.length; i += batchSize) {
        const chunk = batch.deviceIds.slice(i, i + batchSize);
        const chunkPromises = chunk.map(deviceId => 
          this.sendNotification(deviceId, batch.payload)
        );

        const chunkResults = await Promise.allSettled(chunkPromises);
        
        chunkResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({
              success: false,
              messageId: '',
              error: result.reason.message,
              deliveredAt: new Date()
            });
          }
        });

        // Rate limiting delay
        if (i + batchSize < batch.deviceIds.length) {
          await this.delay(this.config.rateLimitDelay || 100);
        }
      }

      return results;
    } catch (error) {
      console.error('Batch notification failed:', error);
      throw error;
    }
  }

  /**
   * Schedule notification for later delivery
   */
  async scheduleNotification(
    schedule: NotificationSchedule
  ): Promise<string> {
    try {
      const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error } = await this.supabase
        .from('notification_schedules')
        .insert({
          schedule_id: scheduleId,
          device_ids: schedule.deviceIds,
          payload: schedule.payload,
          scheduled_for: schedule.scheduledFor.toISOString(),
          timezone: schedule.timezone,
          repeat_pattern: schedule.repeatPattern,
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log(`Notification scheduled: ${scheduleId}`);
      return scheduleId;
    } catch (error) {
      console.error('Schedule notification failed:', error);
      throw error;
    }
  }

  /**
   * Update device preferences
   */
  async updateDevicePreferences(
    deviceId: string,
    preferences: DevicePreferences
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('device_registrations')
        .update({
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq('device_id', deviceId);

      if (error) throw error;

      // Update local registry
      const device = this.deviceRegistry.get(deviceId);
      if (device) {
        device.preferences = preferences;
        this.deviceRegistry.set(deviceId, device);
      }

      return true;
    } catch (error) {
      console.error('Update preferences failed:', error);
      return false;
    }
  }

  /**
   * Get notification analytics
   */
  getAnalytics(): NotificationAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get device metrics
   */
  async getDeviceMetrics(deviceId: string): Promise<NotificationMetrics | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_analytics')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get device metrics failed:', error);
      return null;
    }
  }

  /**
   * Send FCM notification
   */
  private async sendFCMNotification(
    device: DeviceRegistration,
    payload: PushNotificationPayload
  ): Promise<PushNotificationResult> {
    try {
      const fcmPayload = {
        to: device.deviceToken,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon,
          sound: payload.sound || 'default'
        },
        data: {
          ...payload.data,
          category: payload.category,
          priority: payload.priority.toString()
        },
        priority: payload.priority === NotificationPriority.HIGH ? 'high' : 'normal',
        time_to_live: payload.ttl || 3600
      };

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${this.fcmServerKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fcmPayload)
      });

      const result = await response.json();

      if (result.success === 1) {
        return {
          success: true,
          messageId: result.results[0].message_id,
          deliveredAt: new Date()
        };
      } else {
        throw new Error(result.results[0].error || 'FCM delivery failed');
      }
    } catch (error) {
      throw new Error(`FCM notification failed: ${error.message}`);
    }
  }

  /**
   * Send APNS notification
   */
  private async sendAPNSNotification(
    device: DeviceRegistration,
    payload: PushNotificationPayload
  ): Promise<PushNotificationResult> {
    try {
      // This would integrate with APNS library
      // For now, simulating the call
      const apnsPayload = {
        aps: {
          alert: {
            title: payload.title,
            body: payload.body
          },
          sound: payload.sound || 'default',
          badge: payload.badge,
          'content-available': 1
        },
        data: payload.data,
        category: payload.category
      };

      // Simulate APNS call
      await this.delay(100);

      return {
        success: true,
        messageId: `apns_${Date.now()}`,
        deliveredAt: new Date()
      };
    } catch (error) {
      throw new Error(`APNS notification failed: ${error.message}`);
    }
  }

  /**
   * Validate device token format
   */
  private validateDeviceToken(token: string, platform: string): boolean {
    if (platform === 'ios') {
      // APNS token validation (64 hex characters)
      return /^[a-fA-F0-9]{64}$/.test(token);
    } else {
      // FCM token validation (basic length check)
      return token.length > 100 && token.length < 200;
    }
  }

  /**
   * Check if notification should be sent based on preferences
   */
  private shouldSendNotification(
    device: DeviceRegistration,
    payload: PushNotificationPayload
  ): boolean {
    const prefs = device.preferences;
    
    // Check if notifications are enabled
    if (!prefs.notificationsEnabled) return false;
    
    // Check category preferences
    if (prefs.categoryPreferences) {
      const categoryEnabled = prefs.categoryPreferences[payload.category];
      if (categoryEnabled === false) return false;
    }
    
    // Check quiet hours
    if (prefs.quietHours) {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= prefs.quietHours.start || currentHour < prefs.quietHours.end) {
        // Allow high priority notifications during quiet hours
        return payload.priority === NotificationPriority.HIGH;
      }
    }
    
    return true;
  }

  /**
   * Load device registrations from database
   */
  private async loadDeviceRegistrations(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('device_registrations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      data?.forEach((device: any) => {
        this.deviceRegistry.set(device.device_id, {
          deviceId: device.device_id,
          userId: device.user_id,
          deviceToken: device.device_token,
          platform: device.platform,
          appVersion: device.app_version,
          osVersion: device.os_version,
          preferences: device.preferences,
          timezone: device.timezone,
          language: device.language,
          registeredAt: new Date(device.registered_at)
        });
      });

      console.log(`Loaded ${this.deviceRegistry.size} device registrations`);
    } catch (error) {
      console.error('Failed to load device registrations:', error);
    }
  }

  /**
   * Load notification templates
   */
  private async loadNotificationTemplates(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      console.log(`Loaded ${data?.length || 0} notification templates`);
    } catch (error) {
      console.error('Failed to load notification templates:', error);
    }
  }

  /**
   * Initialize analytics system
   */
  private async initializeAnalytics(): Promise<void> {
    try {
      // Load recent analytics data
      const { data, error } = await this.supabase
        .from('notification_analytics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Process analytics data
      if (data) {
        this.processAnalyticsData(data);
      }

      console.log('Analytics system initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Process analytics data
   */
  private processAnalyticsData(data: any[]): void {
    let totalSent = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalDeliveryTime = 0;
    let deliveryCount = 0;

    data.forEach(record => {
      totalSent += record.sent_count || 0;
      totalDelivered += record.delivered_count || 0;
      totalFailed += record.failed_count || 0;
      
      if (record.average_delivery_time) {
        totalDeliveryTime += record.average_delivery_time;
        deliveryCount++;
      }
    });

    this.analytics.totalSent = totalSent;
    this.analytics.totalDelivered = totalDelivered;
    this.analytics.totalFailed = totalFailed;
    this.analytics.deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    this.analytics.averageDeliveryTime = deliveryCount > 0 ? totalDeliveryTime / deliveryCount : 0;
  }

  /**
   * Store notification record
   */
  private async storeNotificationRecord(
    deviceId: string,
    payload: PushNotificationPayload,
    result: PushNotificationResult
  ): Promise<void> {
    try {
      await this.supabase
        .from('notification_logs')
        .insert({
          device_id: deviceId,
          title: payload.title,
          body: payload.body,
          category: payload.category,
          priority: payload.priority,
          success: result.success,
          message_id: result.messageId,
          error_message: result.error,
          delivered_at: result.deliveredAt.toISOString(),
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store notification record:', error);
    }
  }

  /**
   * Update analytics
   */
  private updateAnalytics(result: PushNotificationResult, category: NotificationCategory): void {
    this.analytics.totalSent++;
    
    if (result.success) {
      this.analytics.totalDelivered++;
    } else {
      this.analytics.totalFailed++;
    }
    
    this.analytics.deliveryRate = (this.analytics.totalDelivered / this.analytics.totalSent) * 100;
    
    // Update category metrics
    const categoryStats = this.analytics.categoryMetrics.get(category) || { sent: 0, delivered: 0, failed: 0 };
    categoryStats.sent++;
    if (result.success) {
      categoryStats.delivered++;
    } else {
      categoryStats.failed++;
    }
    this.analytics.categoryMetrics.set(category, categoryStats);
  }

  /**
   * Start notification processor
   */
  private startNotificationProcessor(): void {
    setInterval(async () => {
      if (this.notificationQueue.length > 0) {
        const batch = this.notificationQueue.shift();
        if (batch) {
          try {
            await this.sendBatchNotifications(batch);
          } catch (error) {
            console.error('Batch processing failed:', error);
          }
        }
      }
    }, this.config.processingInterval || 5000);
  }

  /**
   * Start analytics collector
   */
  private startAnalyticsCollector(): void {
    setInterval(async () => {
      try {
        await this.collectAndStoreAnalytics();
      } catch (error) {
        console.error('Analytics collection failed:', error);
      }
    }, this.config.analyticsInterval || 60000);
  }

  /**
   * Collect and store analytics
   */
  private async collectAndStoreAnalytics(): Promise<void> {
    try {
      const analytics = this.getAnalytics();
      
      await this.supabase
        .from('notification_analytics')
        .insert({
          total_sent: analytics.totalSent,
          total_delivered: analytics.totalDelivered,
          total_failed: analytics.totalFailed,
          delivery_rate: analytics.deliveryRate,
          average_delivery_time: analytics.averageDeliveryTime,
          device_count: this.deviceRegistry.size,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store analytics:', error);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create push notifications manager instance
 */
export function createPushNotificationsManager(
  config: PushNotificationConfig
): PushNotificationsManager {
  return new PushNotificationsManager(config);
}

/**
 * Default notification templates
 */
export const defaultNotificationTemplates: Record<NotificationCategory, NotificationTemplate> = {
  [NotificationCategory.APPOINTMENT]: {
    id: 'appointment_reminder',
    category: NotificationCategory.APPOINTMENT,
    title: 'Lembrete de Consulta',
    body: 'Você tem uma consulta agendada para {{time}} com {{doctor}}',
    icon: 'appointment',
    sound: 'default',
    priority: NotificationPriority.HIGH,
    data: {
      type: 'appointment_reminder',
      action: 'view_appointment'
    }
  },
  [NotificationCategory.MEDICATION]: {
    id: 'medication_reminder',
    category: NotificationCategory.MEDICATION,
    title: 'Hora do Medicamento',
    body: 'Está na hora de tomar {{medication}}',
    icon: 'medication',
    sound: 'medication',
    priority: NotificationPriority.HIGH,
    data: {
      type: 'medication_reminder',
      action: 'mark_taken'
    }
  },
  [NotificationCategory.RESULTS]: {
    id: 'results_available',
    category: NotificationCategory.RESULTS,
    title: 'Resultados Disponíveis',
    body: 'Seus resultados de exame estão prontos',
    icon: 'results',
    sound: 'default',
    priority: NotificationPriority.MEDIUM,
    data: {
      type: 'results_available',
      action: 'view_results'
    }
  },
  [NotificationCategory.SYSTEM]: {
    id: 'system_update',
    category: NotificationCategory.SYSTEM,
    title: 'Atualização do Sistema',
    body: '{{message}}',
    icon: 'system',
    sound: 'default',
    priority: NotificationPriority.LOW,
    data: {
      type: 'system_update',
      action: 'update_app'
    }
  }
};

export default PushNotificationsManager;
