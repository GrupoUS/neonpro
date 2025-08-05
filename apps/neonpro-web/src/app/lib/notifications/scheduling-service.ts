/**
 * NeonPro - Scheduling Service for Future Notifications
 * Manages scheduled notifications with timezone support and retry logic
 */

import { supabase } from '@/lib/supabase/client';
import { NotificationType, NotificationChannel, NotificationPreferences } from './config';
import { z } from 'zod';

interface ScheduleNotificationPayload {
  recipientId: string;
  type: NotificationType;
  channel: NotificationChannel;
  payload: any;
  scheduledFor: Date;
  preferences: NotificationPreferences;
  metadata?: Record<string, any>;
}

interface ScheduledNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  channel: NotificationChannel;
  payload: any;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SchedulingService {
  private maxRetries = 3;
  private retryIntervals = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000]; // 5min, 15min, 1hour

  /**
   * Schedule a notification for future delivery
   */
  async scheduleNotification(payload: ScheduleNotificationPayload): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .insert({
          recipient_id: payload.recipientId,
          notification_type: payload.type,
          channel: payload.channel,
          payload: payload.payload,
          scheduled_for: payload.scheduledFor.toISOString(),
          status: 'pending',
          retry_count: 0,
          max_retries: this.maxRetries,
          metadata: {
            preferences: payload.preferences,
            ...payload.metadata
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to schedule notification: ${error.message}`);
      }

      return data.id;

    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Get due notifications that need to be sent
   */
  async getDueNotifications(): Promise<ScheduledNotification[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', now)
        .order('scheduled_for', { ascending: true })
        .limit(100); // Process in batches

      if (error) {
        throw new Error(`Failed to get due notifications: ${error.message}`);
      }

      return data.map(this.mapDatabaseToModel);

    } catch (error) {
      console.error('Error getting due notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as sent successfully
   */
  async markNotificationSent(notificationId: string, deliveryDetails?: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          delivery_details: deliveryDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error(`Failed to mark notification as sent: ${error.message}`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error marking notification as sent:', error);
      return false;
    }
  }

  /**
   * Mark notification as failed and handle retry logic
   */
  async markNotificationFailed(notificationId: string, errorMessage: string): Promise<boolean> {
    try {
      // Get current notification state
      const { data: current, error: fetchError } = await supabase
        .from('scheduled_notifications')
        .select('retry_count, max_retries')
        .eq('id', notificationId)
        .single();

      if (fetchError) {
        console.error(`Failed to fetch notification for retry: ${fetchError.message}`);
        return false;
      }

      const newRetryCount = (current.retry_count || 0) + 1;
      const shouldRetry = newRetryCount <= (current.max_retries || this.maxRetries);

      const updateData: any = {
        last_error: errorMessage,
        retry_count: newRetryCount,
        updated_at: new Date().toISOString()
      };

      if (shouldRetry) {
        // Schedule retry with exponential backoff
        const retryDelay = this.retryIntervals[Math.min(newRetryCount - 1, this.retryIntervals.length - 1)];
        const nextRetry = new Date(Date.now() + retryDelay);
        
        updateData.scheduled_for = nextRetry.toISOString();
        updateData.status = 'pending';
      } else {
        // Max retries reached, mark as failed
        updateData.status = 'failed';
        updateData.failed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('scheduled_notifications')
        .update(updateData)
        .eq('id', notificationId);

      if (error) {
        console.error(`Failed to mark notification as failed: ${error.message}`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error marking notification as failed:', error);
      return false;
    }
  }  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('status', 'pending'); // Only allow cancelling pending notifications

      if (error) {
        console.error(`Failed to cancel notification: ${error.message}`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  }

  /**
   * Get notification status
   */
  async getNotificationStatus(notificationId: string): Promise<{
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
    deliveredAt?: Date;
    error?: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('status, sent_at, failed_at, cancelled_at, last_error')
        .eq('id', notificationId)
        .single();

      if (error) {
        console.error(`Failed to get notification status: ${error.message}`);
        return null;
      }

      const statusMap: Record<string, 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled'> = {
        'pending': 'pending',
        'sent': 'delivered', // Assume sent means delivered for scheduled notifications
        'failed': 'failed',
        'cancelled': 'cancelled'
      };

      const deliveredAt = data.sent_at ? new Date(data.sent_at) : 
                          data.failed_at ? new Date(data.failed_at) :
                          data.cancelled_at ? new Date(data.cancelled_at) : undefined;

      return {
        status: statusMap[data.status] || 'failed',
        deliveredAt,
        error: data.last_error || undefined
      };

    } catch (error) {
      console.error('Error getting notification status:', error);
      return null;
    }
  }

  /**
   * Reschedule a pending notification
   */
  async rescheduleNotification(notificationId: string, newScheduledTime: Date): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({
          scheduled_for: newScheduledTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('status', 'pending'); // Only allow rescheduling pending notifications

      if (error) {
        console.error(`Failed to reschedule notification: ${error.message}`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error rescheduling notification:', error);
      return false;
    }
  }

  /**
   * Schedule appointment reminder notifications based on user preferences
   */
  async scheduleAppointmentReminders(
    appointmentId: string, 
    appointmentDate: Date, 
    patientId: string
  ): Promise<string[]> {
    try {
      // Get patient notification preferences
      const { data: preferences, error: prefError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', patientId)
        .single();

      if (prefError || !preferences) {
        console.error('Failed to get patient preferences:', prefError);
        return [];
      }

      const scheduledIds: string[] = [];

      // Schedule reminders based on user preferences
      for (const interval of preferences.reminderIntervals || [24, 2]) { // Default: 24h and 2h before
        const reminderTime = new Date(appointmentDate.getTime() - (interval * 60 * 60 * 1000));
        
        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
          // Schedule for enabled channels
          for (const [channel, channelPrefs] of Object.entries(preferences.channels)) {
            if (channelPrefs.enabled && channelPrefs.enabledTypes.includes('appointment_reminder')) {
              try {
                const scheduledId = await this.scheduleNotification({
                  recipientId: patientId,
                  type: 'appointment_reminder',
                  channel: channel as NotificationChannel,
                  payload: {
                    appointmentId,
                    appointmentDate: appointmentDate.toISOString(),
                    interval: `${interval}h`
                  },
                  scheduledFor: reminderTime,
                  preferences,
                  metadata: {
                    appointmentId,
                    reminderInterval: interval
                  }
                });
                
                scheduledIds.push(scheduledId);
              } catch (error) {
                console.error(`Failed to schedule ${channel} reminder:`, error);
              }
            }
          }
        }
      }

      return scheduledIds;

    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
      return [];
    }
  }

  /**
   * Cancel all scheduled notifications for an appointment
   */
  async cancelAppointmentNotifications(appointmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('status', 'pending')
        .contains('metadata', { appointmentId });

      if (error) {
        console.error(`Failed to cancel appointment notifications: ${error.message}`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error cancelling appointment notifications:', error);
      return false;
    }
  }

  /**
   * Map database record to model
   */
  private mapDatabaseToModel(dbRecord: any): ScheduledNotification {
    return {
      id: dbRecord.id,
      recipientId: dbRecord.recipient_id,
      type: dbRecord.notification_type,
      channel: dbRecord.channel,
      payload: dbRecord.payload,
      scheduledFor: new Date(dbRecord.scheduled_for),
      status: dbRecord.status,
      retryCount: dbRecord.retry_count || 0,
      maxRetries: dbRecord.max_retries || this.maxRetries,
      lastError: dbRecord.last_error,
      createdAt: new Date(dbRecord.created_at),
      updatedAt: new Date(dbRecord.updated_at)
    };
  }

  /**
   * Clean up old completed/failed notifications (maintenance task)
   */
  async cleanupOldNotifications(olderThanDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data, error } = await supabase
        .from('scheduled_notifications')
        .delete()
        .in('status', ['sent', 'failed', 'cancelled'])
        .lt('updated_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error(`Failed to cleanup old notifications: ${error.message}`);
        return 0;
      }

      return data?.length || 0;

    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }
}
