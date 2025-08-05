/**
 * NeonPro - Audit Service for HIPAA Compliance
 * Comprehensive logging for notification activities and compliance tracking
 */

import { supabase } from '@/lib/supabase/client';
import { NotificationType, NotificationChannel } from './config';

interface AuditLogEntry {
  action: 'notification_sent' | 'notification_scheduled' | 'notification_cancelled' | 'notification_failed' | 'notification_blocked' | 'preferences_updated' | 'consent_granted' | 'consent_revoked' | 'notification_error';
  recipientId?: string;
  notificationId?: string;
  notificationType?: NotificationType;
  channel?: NotificationChannel;
  success?: boolean;
  error?: string;
  reason?: string;
  deliveredAt?: Date;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export class AuditService {
  /**
   * Log notification activity for HIPAA compliance
   */
  async log(entry: AuditLogEntry): Promise<boolean> {
    try {
      // Prepare audit log data
      const auditData = {
        action: entry.action,
        recipient_id: entry.recipientId,
        notification_id: entry.notificationId,
        notification_type: entry.notificationType,
        channel: entry.channel,
        success: entry.success,
        error_message: entry.error,
        reason: entry.reason,
        delivered_at: entry.deliveredAt?.toISOString(),
        scheduled_for: entry.scheduledFor?.toISOString(),
        metadata: entry.metadata,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        session_id: entry.sessionId,
        timestamp: new Date().toISOString()
      };

      // Insert into audit log table
      const { error } = await supabase
        .from('notification_audit_log')
        .insert(auditData);

      if (error) {
        console.error('Failed to write audit log:', error);
        // Don't throw error - logging failure shouldn't break notification flow
        return false;
      }

      return true;

    } catch (error) {
      console.error('Audit service error:', error);
      return false;
    }
  }

  /**
   * Log successful notification delivery
   */
  async logDelivery(
    notificationId: string,
    recipientId: string,
    channel: NotificationChannel,
    type: NotificationType,
    deliveredAt?: Date
  ): Promise<void> {
    await this.log({
      action: 'notification_sent',
      notificationId,
      recipientId,
      channel,
      notificationType: type,
      success: true,
      deliveredAt: deliveredAt || new Date()
    });
  }

  /**
   * Log notification failure
   */
  async logFailure(
    notificationId: string,
    recipientId: string,
    channel: NotificationChannel,
    type: NotificationType,
    error: string
  ): Promise<void> {
    await this.log({
      action: 'notification_failed',
      notificationId,
      recipientId,
      channel,
      notificationType: type,
      success: false,
      error
    });
  }

  /**
   * Log notification scheduling
   */
  async logScheduling(
    notificationId: string,
    recipientId: string,
    channel: NotificationChannel,
    type: NotificationType,
    scheduledFor: Date
  ): Promise<void> {
    await this.log({
      action: 'notification_scheduled',
      notificationId,
      recipientId,
      channel,
      notificationType: type,
      scheduledFor
    });
  }

  /**
   * Log notification cancellation
   */
  async logCancellation(
    notificationId: string,
    recipientId?: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      action: 'notification_cancelled',
      notificationId,
      recipientId,
      reason
    });
  }

  /**
   * Log consent changes
   */
  async logConsentChange(
    recipientId: string,
    action: 'consent_granted' | 'consent_revoked',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      recipientId,
      metadata
    });
  }

  /**
   * Log preferences update
   */
  async logPreferencesUpdate(
    recipientId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: 'preferences_updated',
      recipientId,
      metadata
    });
  }  /**
   * Get audit trail for specific notification
   */
  async getNotificationAuditTrail(notificationId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notification_audit_log')
        .select('*')
        .eq('notification_id', notificationId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Failed to get audit trail:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Error getting audit trail:', error);
      return [];
    }
  }

  /**
   * Get audit trail for specific recipient (with HIPAA access controls)
   */
  async getRecipientAuditTrail(
    recipientId: string, 
    startDate?: Date, 
    endDate?: Date,
    limit: number = 100
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('notification_audit_log')
        .select('*')
        .eq('recipient_id', recipientId);

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get recipient audit trail:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Error getting recipient audit trail:', error);
      return [];
    }
  }

  /**
   * Generate compliance report for specific time period
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<{
    totalNotifications: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    cancelledNotifications: number;
    consentChanges: number;
    deliveryRate: number;
    channelBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('notification_audit_log')
        .select('action, channel, notification_type, success')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) {
        console.error('Failed to generate compliance report:', error);
        return this.getEmptyReport();
      }

      const logs = data || [];
      
      // Calculate metrics
      const sent = logs.filter(l => l.action === 'notification_sent');
      const successful = sent.filter(l => l.success === true).length;
      const failed = sent.filter(l => l.success === false).length;
      const cancelled = logs.filter(l => l.action === 'notification_cancelled').length;
      const consentChanges = logs.filter(l => 
        l.action === 'consent_granted' || l.action === 'consent_revoked'
      ).length;

      // Channel breakdown
      const channelBreakdown: Record<string, number> = {};
      sent.forEach(log => {
        if (log.channel) {
          channelBreakdown[log.channel] = (channelBreakdown[log.channel] || 0) + 1;
        }
      });

      // Type breakdown
      const typeBreakdown: Record<string, number> = {};
      sent.forEach(log => {
        if (log.notification_type) {
          typeBreakdown[log.notification_type] = (typeBreakdown[log.notification_type] || 0) + 1;
        }
      });

      return {
        totalNotifications: sent.length,
        successfulDeliveries: successful,
        failedDeliveries: failed,
        cancelledNotifications: cancelled,
        consentChanges,
        deliveryRate: sent.length > 0 ? (successful / sent.length) * 100 : 0,
        channelBreakdown,
        typeBreakdown
      };

    } catch (error) {
      console.error('Error generating compliance report:', error);
      return this.getEmptyReport();
    }
  }

  /**
   * Archive old audit logs (HIPAA requires 7-year retention)
   */
  async archiveOldLogs(olderThanYears: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - olderThanYears);

      // In a real implementation, you would move to cold storage rather than delete
      // For now, we'll just mark as archived
      const { data, error } = await supabase
        .from('notification_audit_log')
        .update({ 
          archived: true,
          archived_at: new Date().toISOString()
        })
        .lt('timestamp', cutoffDate.toISOString())
        .is('archived', false)
        .select('id');

      if (error) {
        console.error('Failed to archive old logs:', error);
        return 0;
      }

      return data?.length || 0;

    } catch (error) {
      console.error('Error archiving old logs:', error);
      return 0;
    }
  }

  /**
   * Get delivery statistics for dashboard
   */
  async getDeliveryStatistics(days: number = 30): Promise<{
    dailyStats: Array<{
      date: string;
      sent: number;
      delivered: number;
      failed: number;
    }>;
    channelStats: Record<string, {
      sent: number;
      delivered: number;
      deliveryRate: number;
    }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('notification_audit_log')
        .select('timestamp, action, channel, success')
        .eq('action', 'notification_sent')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Failed to get delivery statistics:', error);
        return { dailyStats: [], channelStats: {} };
      }

      const logs = data || [];
      
      // Group by date
      const dailyGroups: Record<string, any[]> = {};
      const channelGroups: Record<string, any[]> = {};

      logs.forEach(log => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        
        // Daily stats
        if (!dailyGroups[date]) dailyGroups[date] = [];
        dailyGroups[date].push(log);

        // Channel stats
        if (log.channel) {
          if (!channelGroups[log.channel]) channelGroups[log.channel] = [];
          channelGroups[log.channel].push(log);
        }
      });

      // Calculate daily stats
      const dailyStats = Object.entries(dailyGroups).map(([date, logs]) => ({
        date,
        sent: logs.length,
        delivered: logs.filter(l => l.success === true).length,
        failed: logs.filter(l => l.success === false).length
      }));

      // Calculate channel stats
      const channelStats: Record<string, any> = {};
      Object.entries(channelGroups).forEach(([channel, logs]) => {
        const delivered = logs.filter(l => l.success === true).length;
        channelStats[channel] = {
          sent: logs.length,
          delivered,
          deliveryRate: logs.length > 0 ? (delivered / logs.length) * 100 : 0
        };
      });

      return { dailyStats, channelStats };

    } catch (error) {
      console.error('Error getting delivery statistics:', error);
      return { dailyStats: [], channelStats: {} };
    }
  }

  private getEmptyReport() {
    return {
      totalNotifications: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      cancelledNotifications: 0,
      consentChanges: 0,
      deliveryRate: 0,
      channelBreakdown: {},
      typeBreakdown: {}
    };
  }
}
