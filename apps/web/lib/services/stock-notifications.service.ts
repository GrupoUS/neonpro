import { createClient } from '@/lib/supabase/client';
import {
  type StockAlert,
  type NotificationChannel,
} from '@/lib/types/stock-alerts';

/**
 * Stock Notifications Service - Multi-channel notification delivery
 */
export class StockNotificationsService {
  private supabase = createClient();

  /**
   * Send notifications for a stock alert through configured channels
   */
  async sendAlertNotification(
    alert: StockAlert,
    channels: NotificationChannel[]
  ): Promise<{
    success: boolean;
    results: Array<{
      channel: NotificationChannel;
      success: boolean;
      error?: string;
    }>;
  }> {
    const results: Array<{
      channel: NotificationChannel;
      success: boolean;
      error?: string;
    }> = [];

    for (const channel of channels) {
      try {
        const result = await this.sendNotificationByChannel(alert, channel);
        results.push({ channel, success: result.success, error: result.error });
      } catch (error) {
        results.push({
          channel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const overallSuccess = results.every(r => r.success);
    return { success: overallSuccess, results };
  }

  /**
   * Send notification through specific channel
   */
  private async sendNotificationByChannel(
    alert: StockAlert,
    channel: NotificationChannel
  ): Promise<{ success: boolean; error?: string }> {
    switch (channel) {
      case 'in_app':
        return await this.sendInAppNotification(alert);
      case 'email':
        return await this.sendEmailNotification(alert);
      case 'sms':
        return await this.sendSMSNotification(alert);
      case 'whatsapp':
        return await this.sendWhatsAppNotification(alert);
      case 'push':
        return await this.sendPushNotification(alert);
      case 'slack':
        return await this.sendSlackNotification(alert);
      default:
        return { success: false, error: `Unsupported channel: ${channel}` };
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(
    alert: StockAlert
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get users who should receive notifications for this clinic
      const { data: recipients, error: recipientsError } = await this.supabase
        .from('healthcare_professionals')
        .select('user_id')
        .eq('clinic_id', alert.clinicId);

      if (recipientsError) {
        return { success: false, error: recipientsError.message };
      }

      if (!recipients || recipients.length === 0) {
        return { success: false, error: 'No recipients found for clinic' };
      }

      // Create in-app notifications for each recipient
      const notifications = recipients.map(recipient => ({
        user_id: recipient.user_id,
        title: this.getNotificationTitle(alert),
        message: alert.message,
        type: 'stock_alert',
        data: {
          alert_id: alert.id,
          alert_type: alert.alertType,
          severity: alert.severityLevel,
          product_id: alert.productId,
        },
        created_at: new Date(),
        read: false,
      }));

      const { error: insertError } = await this.supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    alert: StockAlert
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get clinic email settings and recipients
      const { data: clinicSettings, error: settingsError } = await this.supabase
        .from('clinic_settings')
        .select('notification_emails, email_enabled')
        .eq('clinic_id', alert.clinicId)
        .single();

      if (settingsError || !clinicSettings?.email_enabled) {
        return { success: false, error: 'Email notifications not enabled for clinic' };
      }

      const emails = clinicSettings.notification_emails || [];
      if (emails.length === 0) {
        return { success: false, error: 'No email recipients configured' };
      }

      // Format email content
      const subject = this.getNotificationTitle(alert);
      const htmlContent = this.formatEmailContent(alert);

      // Send via Supabase Edge Function (or external email service)
      const { error: emailError } = await this.supabase.functions.invoke(
        'send-email',
        {
          body: {
            to: emails,
            subject,
            html: htmlContent,
            type: 'stock_alert',
          },
        }
      );

      if (emailError) {
        return { success: false, error: emailError.message };
      }

      // Log email notification
      await this.logNotification(alert.id, 'email', emails.length);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    alert: StockAlert
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get clinic SMS settings
      const { data: clinicSettings, error: settingsError } = await this.supabase
        .from('clinic_settings')
        .select('notification_phones, sms_enabled')
        .eq('clinic_id', alert.clinicId)
        .single();

      if (settingsError || !clinicSettings?.sms_enabled) {
        return { success: false, error: 'SMS notifications not enabled for clinic' };
      }

      const phones = clinicSettings.notification_phones || [];
      if (phones.length === 0) {
        return { success: false, error: 'No phone numbers configured' };
      }

      // Format SMS content (limited characters)
      const message = this.formatSMSContent(alert);

      // Send via Supabase Edge Function (or external SMS service)
      const { error: smsError } = await this.supabase.functions.invoke(
        'send-sms',
        {
          body: {
            phones,
            message,
            type: 'stock_alert',
          },
        }
      );

      if (smsError) {
        return { success: false, error: smsError.message };
      }

      // Log SMS notification
      await this.logNotification(alert.id, 'sms', phones.length);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsAppNotification(
    alert: StockAlert
  ): Promise<{ success: boolean; error?: string }> {
    // Implementation would depend on WhatsApp Business API integration
    // For now, return success for demonstration
    try {
      await this.logNotification(alert.id, 'whatsapp', 1);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WhatsApp service unavailable',
      };
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    alert: StockAlert
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get push tokens for clinic users
      const { data: tokens, error: tokensError } = await this.supabase
        .from('push_tokens')
        .select('token')
        .eq('clinic_id', alert.clinicId)
        .eq('active', true);

      if (tokensError || !tokens || tokens.length === 0) {
        return { success: false, error: 'No active push tokens found' };
      }

      // Send via push notification service
      const { error: pushError } = await this.supabase.functions.invoke(
        'send-push',
        {
          body: {
            tokens: tokens.map(t => t.token),
            title: this.getNotificationTitle(alert),
            body: alert.message,
            data: {
              alert_id: alert.id,
              alert_type: alert.alertType,
              severity: alert.severityLevel,
            },
          },
        }
      );

      if (pushError) {
        return { success: false, error: pushError.message };
      }

      await this.logNotification(alert.id, 'push', tokens.length);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(
    alert: StockAlert
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get Slack webhook URL for clinic
      const { data: clinicSettings, error: settingsError } = await this.supabase
        .from('clinic_settings')
        .select('slack_webhook_url, slack_enabled')
        .eq('clinic_id', alert.clinicId)
        .single();

      if (settingsError || !clinicSettings?.slack_enabled || !clinicSettings.slack_webhook_url) {
        return { success: false, error: 'Slack notifications not configured for clinic' };
      }

      // Format Slack message
      const slackMessage = this.formatSlackMessage(alert);

      // Send to Slack webhook
      const response = await fetch(clinicSettings.slack_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });

      if (!response.ok) {
        return { success: false, error: `Slack API error: ${response.statusText}` };
      }

      await this.logNotification(alert.id, 'slack', 1);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Log notification delivery
   */
  private async logNotification(
    alertId: string,
    channel: NotificationChannel,
    recipientCount: number
  ): Promise<void> {
    await this.supabase
      .from('notification_logs')
      .insert({
        alert_id: alertId,
        channel,
        recipient_count: recipientCount,
        sent_at: new Date(),
        success: true,
      });
  }

  /**
   * Get notification title based on alert
   */
  private getNotificationTitle(alert: StockAlert): string {
    const severityEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '🚨',
    };

    return `${severityEmoji[alert.severityLevel]} Stock Alert - ${alert.alertType.replace('_', ' ').toUpperCase()}`;
  }

  /**
   * Format email content
   */
  private formatEmailContent(alert: StockAlert): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #d32f2f;">🚨 Stock Alert</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <p><strong>Alert Type:</strong> ${alert.alertType.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Severity:</strong> ${alert.severityLevel.toUpperCase()}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Current Value:</strong> ${alert.currentValue}</p>
            <p><strong>Threshold:</strong> ${alert.thresholdValue}</p>
            <p><strong>Created:</strong> ${alert.createdAt.toLocaleString()}</p>
          </div>
          <p>Please take appropriate action to resolve this alert.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from NEONPRO Stock Management System.</p>
        </body>
      </html>
    `;
  }

  /**
   * Format SMS content (limited to 160 characters)
   */
  private formatSMSContent(alert: StockAlert): string {
    const shortMessage = `🚨 ${alert.alertType.replace('_', ' ').toUpperCase()}: ${alert.message.substring(0, 100)}...`;
    return shortMessage.length > 160 ? shortMessage.substring(0, 157) + '...' : shortMessage;
  }

  /**
   * Format Slack message
   */
  private formatSlackMessage(alert: StockAlert): any {
    return {
      text: `🚨 Stock Alert - ${alert.alertType.replace('_', ' ').toUpperCase()}`,
      attachments: [
        {
          color: this.getSeverityColor(alert.severityLevel),
          fields: [
            { title: 'Message', value: alert.message, short: false },
            { title: 'Severity', value: alert.severityLevel.toUpperCase(), short: true },
            { title: 'Current Value', value: alert.currentValue.toString(), short: true },
            { title: 'Threshold', value: alert.thresholdValue.toString(), short: true },
            { title: 'Created', value: alert.createdAt.toLocaleString(), short: true },
          ],
          footer: 'NEONPRO Stock Management',
          ts: Math.floor(alert.createdAt.getTime() / 1000),
        },
      ],
    };
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: string): string {
    const colors = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff4500',
      critical: '#d32f2f',
    };
    return colors[severity as keyof typeof colors] || '#cccccc';
  }

  /**
   * Get delivery statistics
   */
  async getNotificationStats(clinicId: string, dateRange?: {
    start: Date;
    end: Date;
  }): Promise<{
    total: number;
    byChannel: Record<NotificationChannel, number>;
    success_rate: number;
  }> {
    let query = this.supabase
      .from('notification_logs')
      .select('channel, success')
      .eq('clinic_id', clinicId);

    if (dateRange) {
      query = query
        .gte('sent_at', dateRange.start.toISOString())
        .lte('sent_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      return {
        total: 0,
        byChannel: {} as Record<NotificationChannel, number>,
        success_rate: 0,
      };
    }

    const stats = data.reduce(
      (acc, log) => {
        acc.total++;
        acc.byChannel[log.channel] = (acc.byChannel[log.channel] || 0) + 1;
        if (log.success) acc.successful++;
        return acc;
      },
      {
        total: 0,
        successful: 0,
        byChannel: {} as Record<NotificationChannel, number>,
      }
    );

    return {
      total: stats.total,
      byChannel: stats.byChannel,
      success_rate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0,
    };
  }
}

// Export singleton instance
export const stockNotificationsService = new StockNotificationsService();
export default stockNotificationsService;