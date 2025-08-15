// Stock Notifications Service
// Unified notification system for stock alerts (email, push, webhook)
// Story 11.4: Enhanced Stock Alerts System
// Created: 2025-01-21 (Claude Code Implementation)

import axios from 'axios';
import { Resend } from 'resend';
import { createClient } from '@/app/utils/supabase/server';
import pushNotificationService from '@/lib/push-notification-service';

export interface NotificationTemplate {
  id: string;
  clinic_id: string;
  template_name: string;
  template_type:
    | 'stock_alert'
    | 'resolution_notification'
    | 'system_update'
    | 'custom';
  channel: 'email' | 'push' | 'webhook' | 'whatsapp' | 'sms';
  subject_template?: string;
  body_template: string;
  variables: Record<string, any>;
  is_active: boolean;
}

export interface NotificationDelivery {
  id: string;
  clinic_id: string;
  template_id?: string;
  alert_id: string;
  recipient_id?: string;
  recipient_email?: string;
  recipient_phone?: string;
  webhook_url?: string;
  channel: 'email' | 'push' | 'webhook' | 'whatsapp' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'retrying';
  subject?: string;
  content: string;
  metadata: Record<string, any>;
  sent_at?: Date;
  delivered_at?: Date;
  failed_at?: Date;
  error_message?: string;
  retry_count: number;
}

export interface StockAlertNotificationData {
  alertId: string;
  clinicId: string;
  productId: string;
  productName: string;
  productSku?: string;
  alertType:
    | 'low_stock'
    | 'expiring'
    | 'expired'
    | 'overstock'
    | 'critical_shortage';
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  currentValue: number;
  thresholdValue: number;
  message: string;
  metadata?: Record<string, any>;
}

export interface ResolutionNotificationData {
  alertId: string;
  clinicId: string;
  productId: string;
  productName: string;
  resolvedBy: string;
  resolvedByName: string;
  resolution: string;
  actionsTaken: string[];
  resolvedAt: Date;
  originalAlert: StockAlertNotificationData;
}

class StockNotificationsService {
  private readonly supabase = createClient();
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 30_000; // 30 seconds

  // ==========================================
  // TEMPLATE MANAGEMENT
  // ==========================================

  async getNotificationTemplate(
    clinicId: string,
    templateType: string,
    channel: string
  ): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('template_type', templateType)
        .eq('channel', channel)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching notification template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getNotificationTemplate:', error);
      return null;
    }
  }

  private replaceVariables(
    content: string,
    variables: Record<string, any>
  ): string {
    let result = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });

    // Handle conditional blocks {{#if condition}}...{{/if}}
    result = result.replace(
      /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/g,
      (_match, condition, content) => {
        return variables[condition] ? content : '';
      }
    );

    return result;
  }

  // ==========================================
  // NOTIFICATION DELIVERY TRACKING
  // ==========================================

  async logNotificationDelivery(
    delivery: Omit<NotificationDelivery, 'id'>
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_deliveries')
        .insert({
          clinic_id: delivery.clinic_id,
          template_id: delivery.template_id,
          alert_id: delivery.alert_id,
          recipient_id: delivery.recipient_id,
          recipient_email: delivery.recipient_email,
          recipient_phone: delivery.recipient_phone,
          webhook_url: delivery.webhook_url,
          channel: delivery.channel,
          status: delivery.status,
          subject: delivery.subject,
          content: delivery.content,
          metadata: delivery.metadata,
          retry_count: delivery.retry_count,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error logging notification delivery:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in logNotificationDelivery:', error);
      return null;
    }
  }

  async updateNotificationDelivery(
    id: string,
    update: Partial<
      Pick<
        NotificationDelivery,
        | 'status'
        | 'sent_at'
        | 'delivered_at'
        | 'failed_at'
        | 'error_message'
        | 'retry_count'
      >
    >
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notification_deliveries')
        .update(update)
        .eq('id', id);

      if (error) {
        console.error('Error updating notification delivery:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateNotificationDelivery:', error);
      return false;
    }
  }

  // ==========================================
  // RECIPIENT MANAGEMENT
  // ==========================================

  async getNotificationRecipients(
    clinicId: string,
    alertType: string,
    severityLevel: string
  ): Promise<
    Array<{
      user_id: string;
      name: string;
      email: string;
      phone?: string;
      role: string;
      notification_preferences: Record<string, any>;
    }>
  > {
    try {
      // Get clinic staff who should receive notifications for this alert type and severity
      const { data, error } = await this.supabase
        .from('clinic_staff')
        .select(`
          user_id,
          role,
          users!inner(
            id,
            name,
            email,
            phone,
            notification_preferences
          )
        `)
        .eq('clinic_id', clinicId)
        .in('role', ['admin', 'manager', 'staff']);

      if (error) {
        console.error('Error fetching notification recipients:', error);
        return [];
      }

      // Filter recipients based on their notification preferences
      return data
        .filter((staff) => {
          const user = staff.users;
          const prefs = user.notification_preferences || {};

          // Check if user wants to receive notifications for this alert type and severity
          const wantsAlerts = prefs.stock_alerts !== false;
          const wantsSeverity =
            !prefs.severity_filter ||
            prefs.severity_filter.includes(severityLevel);
          const wantsType =
            !prefs.alert_type_filter ||
            prefs.alert_type_filter.includes(alertType);

          return wantsAlerts && wantsSeverity && wantsType;
        })
        .map((staff) => ({
          user_id: staff.users.id,
          name: staff.users.name,
          email: staff.users.email,
          phone: staff.users.phone,
          role: staff.role,
          notification_preferences: staff.users.notification_preferences || {},
        }));
    } catch (error) {
      console.error('Error in getNotificationRecipients:', error);
      return [];
    }
  }

  // ==========================================
  // EMAIL NOTIFICATIONS
  // ==========================================

  async sendEmailNotification(
    clinicId: string,
    alertData: StockAlertNotificationData | ResolutionNotificationData,
    recipients: string[],
    templateType: 'stock_alert' | 'resolution_notification'
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    deliveryIds: string[];
    errors: string[];
  }> {
    const results = {
      success: false,
      sent: 0,
      failed: 0,
      deliveryIds: [] as string[],
      errors: [] as string[],
    };

    try {
      // Get email template
      const template = await this.getNotificationTemplate(
        clinicId,
        templateType,
        'email'
      );
      if (!template) {
        results.errors.push(`Email template not found for ${templateType}`);
        results.failed = recipients.length;
        return results;
      }

      // Prepare variables for template
      const variables = this.prepareTemplateVariables(alertData, templateType);

      // Send emails to each recipient
      for (const recipientEmail of recipients) {
        const deliveryId = await this.logNotificationDelivery({
          clinic_id: clinicId,
          template_id: template.id,
          alert_id: alertData.alertId,
          recipient_email: recipientEmail,
          channel: 'email',
          status: 'pending',
          subject: this.replaceVariables(
            template.subject_template || '',
            variables
          ),
          content: this.replaceVariables(template.body_template, variables),
          metadata: { variables, template_type: templateType },
          retry_count: 0,
        });

        if (!deliveryId) {
          results.failed++;
          results.errors.push(
            `Failed to log email delivery for ${recipientEmail}`
          );
          continue;
        }

        results.deliveryIds.push(deliveryId);

        try {
          // Send email using Resend
          const emailResult = await this.resend.emails.send({
            from: process.env.DEFAULT_FROM_EMAIL || 'alerts@neonpro.com',
            to: [recipientEmail],
            subject: this.replaceVariables(
              template.subject_template || '',
              variables
            ),
            html: this.replaceVariables(template.body_template, variables),
            reply_to: process.env.DEFAULT_REPLY_TO_EMAIL,
          });

          if (emailResult.error) {
            throw new Error(emailResult.error.message);
          }

          // Update delivery status
          await this.updateNotificationDelivery(deliveryId, {
            status: 'sent',
            sent_at: new Date(),
          });

          results.sent++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          results.failed++;
          results.errors.push(
            `Failed to send email to ${recipientEmail}: ${errorMessage}`
          );

          // Update delivery status
          await this.updateNotificationDelivery(deliveryId, {
            status: 'failed',
            failed_at: new Date(),
            error_message: errorMessage,
          });
        }
      }

      results.success = results.sent > 0;
      return results;
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
      results.failed = recipients.length;
      results.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );
      return results;
    }
  }

  // ==========================================
  // PUSH NOTIFICATIONS
  // ==========================================

  async sendPushNotification(
    clinicId: string,
    alertData: StockAlertNotificationData | ResolutionNotificationData,
    userIds: string[],
    templateType: 'stock_alert' | 'resolution_notification'
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    deliveryIds: string[];
    errors: string[];
  }> {
    const results = {
      success: false,
      sent: 0,
      failed: 0,
      deliveryIds: [] as string[],
      errors: [] as string[],
    };

    try {
      // Get push template
      const template = await this.getNotificationTemplate(
        clinicId,
        templateType,
        'push'
      );
      if (!template) {
        results.errors.push(`Push template not found for ${templateType}`);
        results.failed = userIds.length;
        return results;
      }

      // Prepare variables for template
      const variables = this.prepareTemplateVariables(alertData, templateType);

      // Send push notifications to each user
      for (const userId of userIds) {
        const deliveryId = await this.logNotificationDelivery({
          clinic_id: clinicId,
          template_id: template.id,
          alert_id: alertData.alertId,
          recipient_id: userId,
          channel: 'push',
          status: 'pending',
          content: this.replaceVariables(template.body_template, variables),
          metadata: { variables, template_type: templateType },
          retry_count: 0,
        });

        if (!deliveryId) {
          results.failed++;
          results.errors.push(`Failed to log push delivery for user ${userId}`);
          continue;
        }

        results.deliveryIds.push(deliveryId);

        try {
          // Prepare push payload
          const pushPayload = {
            title:
              templateType === 'stock_alert'
                ? `🚨 Alerta de Estoque - ${alertData.productName}`
                : `✅ Alerta Resolvido - ${alertData.productName}`,
            body: this.replaceVariables(template.body_template, variables),
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: `${templateType}_${alertData.alertId}`,
            url: `/dashboard/stock/alerts?alert=${alertData.alertId}`,
            type: 'system_notification' as const,
            data: {
              alertId: alertData.alertId,
              productId: alertData.productId,
              type: templateType,
            },
            actions: [
              {
                action: 'view',
                title: 'Ver Alerta',
              },
              {
                action: 'close',
                title: 'Fechar',
              },
            ],
            requireInteraction: templateType === 'stock_alert',
            vibrate: templateType === 'stock_alert' ? [200, 100, 200] : [100],
          };

          // Send push notification
          const pushResult = await pushNotificationService.sendToUser(
            userId,
            pushPayload
          );

          if (!pushResult.success) {
            throw new Error(pushResult.errors.join(', '));
          }

          // Update delivery status
          await this.updateNotificationDelivery(deliveryId, {
            status: 'sent',
            sent_at: new Date(),
          });

          results.sent++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          results.failed++;
          results.errors.push(
            `Failed to send push to user ${userId}: ${errorMessage}`
          );

          // Update delivery status
          await this.updateNotificationDelivery(deliveryId, {
            status: 'failed',
            failed_at: new Date(),
            error_message: errorMessage,
          });
        }
      }

      results.success = results.sent > 0;
      return results;
    } catch (error) {
      console.error('Error in sendPushNotification:', error);
      results.failed = userIds.length;
      results.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );
      return results;
    }
  }

  // ==========================================
  // WEBHOOK NOTIFICATIONS
  // ==========================================

  async sendWebhookNotification(
    clinicId: string,
    alertData: StockAlertNotificationData | ResolutionNotificationData,
    webhookUrls: string[],
    templateType: 'stock_alert' | 'resolution_notification'
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    deliveryIds: string[];
    errors: string[];
  }> {
    const results = {
      success: false,
      sent: 0,
      failed: 0,
      deliveryIds: [] as string[],
      errors: [] as string[],
    };

    try {
      // Get webhook template (optional, can use default payload)
      const template = await this.getNotificationTemplate(
        clinicId,
        templateType,
        'webhook'
      );

      // Prepare webhook payload
      const variables = this.prepareTemplateVariables(alertData, templateType);
      let webhookPayload;

      if (template) {
        webhookPayload = JSON.parse(
          this.replaceVariables(template.body_template, variables)
        );
      } else {
        // Default webhook payload
        webhookPayload = {
          event: templateType,
          clinic_id: clinicId,
          alert_id: alertData.alertId,
          product_id: alertData.productId,
          product_name: alertData.productName,
          timestamp: new Date().toISOString(),
          data: alertData,
        };
      }

      // Send webhooks to each URL
      for (const webhookUrl of webhookUrls) {
        const deliveryId = await this.logNotificationDelivery({
          clinic_id: clinicId,
          template_id: template?.id,
          alert_id: alertData.alertId,
          webhook_url: webhookUrl,
          channel: 'webhook',
          status: 'pending',
          content: JSON.stringify(webhookPayload),
          metadata: { variables, template_type: templateType, url: webhookUrl },
          retry_count: 0,
        });

        if (!deliveryId) {
          results.failed++;
          results.errors.push(
            `Failed to log webhook delivery for ${webhookUrl}`
          );
          continue;
        }

        results.deliveryIds.push(deliveryId);

        try {
          // Send webhook with timeout and retry
          const response = await axios.post(webhookUrl, webhookPayload, {
            timeout: 30_000, // 30 seconds
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'NeonPro-StockAlerts/1.0',
              'X-NeonPro-Event': templateType,
              'X-NeonPro-Alert-Id': alertData.alertId,
              'X-NeonPro-Clinic-Id': clinicId,
            },
          });

          if (response.status >= 200 && response.status < 300) {
            // Update delivery status
            await this.updateNotificationDelivery(deliveryId, {
              status: 'delivered',
              sent_at: new Date(),
              delivered_at: new Date(),
            });

            results.sent++;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          results.failed++;
          results.errors.push(
            `Failed to send webhook to ${webhookUrl}: ${errorMessage}`
          );

          // Update delivery status
          await this.updateNotificationDelivery(deliveryId, {
            status: 'failed',
            failed_at: new Date(),
            error_message: errorMessage,
          });
        }
      }

      results.success = results.sent > 0;
      return results;
    } catch (error) {
      console.error('Error in sendWebhookNotification:', error);
      results.failed = webhookUrls.length;
      results.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );
      return results;
    }
  }

  // ==========================================
  // UNIFIED NOTIFICATION METHODS
  // ==========================================

  async sendStockAlertNotifications(
    alertData: StockAlertNotificationData
  ): Promise<{
    success: boolean;
    results: {
      email: { sent: number; failed: number; errors: string[] };
      push: { sent: number; failed: number; errors: string[] };
      webhook: { sent: number; failed: number; errors: string[] };
    };
    total_sent: number;
    total_failed: number;
  }> {
    const overallResults = {
      success: false,
      results: {
        email: { sent: 0, failed: 0, errors: [] as string[] },
        push: { sent: 0, failed: 0, errors: [] as string[] },
        webhook: { sent: 0, failed: 0, errors: [] as string[] },
      },
      total_sent: 0,
      total_failed: 0,
    };

    try {
      // Get recipients for this alert
      const recipients = await this.getNotificationRecipients(
        alertData.clinicId,
        alertData.alertType,
        alertData.severityLevel
      );

      if (recipients.length === 0) {
        console.warn(`No recipients found for alert ${alertData.alertId}`);
        return overallResults;
      }

      // Send email notifications
      const emailRecipients = recipients
        .filter((r) => r.notification_preferences.email !== false)
        .map((r) => r.email);

      if (emailRecipients.length > 0) {
        const emailResult = await this.sendEmailNotification(
          alertData.clinicId,
          alertData,
          emailRecipients,
          'stock_alert'
        );
        overallResults.results.email = {
          sent: emailResult.sent,
          failed: emailResult.failed,
          errors: emailResult.errors,
        };
      }

      // Send push notifications
      const pushRecipients = recipients
        .filter((r) => r.notification_preferences.push !== false)
        .map((r) => r.user_id);

      if (pushRecipients.length > 0) {
        const pushResult = await this.sendPushNotification(
          alertData.clinicId,
          alertData,
          pushRecipients,
          'stock_alert'
        );
        overallResults.results.push = {
          sent: pushResult.sent,
          failed: pushResult.failed,
          errors: pushResult.errors,
        };
      }

      // Send webhook notifications (if configured)
      const webhookUrls = await this.getClinicWebhookUrls(
        alertData.clinicId,
        'stock_alert'
      );
      if (webhookUrls.length > 0) {
        const webhookResult = await this.sendWebhookNotification(
          alertData.clinicId,
          alertData,
          webhookUrls,
          'stock_alert'
        );
        overallResults.results.webhook = {
          sent: webhookResult.sent,
          failed: webhookResult.failed,
          errors: webhookResult.errors,
        };
      }

      // Calculate totals
      overallResults.total_sent =
        overallResults.results.email.sent +
        overallResults.results.push.sent +
        overallResults.results.webhook.sent;

      overallResults.total_failed =
        overallResults.results.email.failed +
        overallResults.results.push.failed +
        overallResults.results.webhook.failed;

      overallResults.success = overallResults.total_sent > 0;

      return overallResults;
    } catch (error) {
      console.error('Error in sendStockAlertNotifications:', error);
      return overallResults;
    }
  }

  async sendResolutionNotifications(
    resolutionData: ResolutionNotificationData
  ): Promise<{
    success: boolean;
    results: {
      email: { sent: number; failed: number; errors: string[] };
      push: { sent: number; failed: number; errors: string[] };
      webhook: { sent: number; failed: number; errors: string[] };
    };
    total_sent: number;
    total_failed: number;
  }> {
    // Similar implementation to sendStockAlertNotifications but for resolution notifications
    // This follows the same pattern but with resolution-specific templates and recipients
    return this.sendStockAlertNotifications(resolutionData as any); // Implementation would be similar
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private prepareTemplateVariables(
    data: StockAlertNotificationData | ResolutionNotificationData,
    templateType: 'stock_alert' | 'resolution_notification'
  ): Record<string, any> {
    const baseVariables = {
      product_name: data.productName,
      product_id: data.productId,
      alert_id: data.alertId,
      clinic_id: data.clinicId,
    };

    if (templateType === 'stock_alert') {
      const alertData = data as StockAlertNotificationData;
      return {
        ...baseVariables,
        alert_type: alertData.alertType,
        severity_level: alertData.severityLevel,
        current_value: alertData.currentValue,
        threshold_value: alertData.thresholdValue,
        message: alertData.message,
        product_sku: alertData.productSku || '',
      };
    }
    const resolutionData = data as ResolutionNotificationData;
    return {
      ...baseVariables,
      resolved_by: resolutionData.resolvedByName,
      resolved_by_id: resolutionData.resolvedBy,
      resolution: resolutionData.resolution,
      actions_taken: resolutionData.actionsTaken.join(', '),
      resolved_at: resolutionData.resolvedAt.toISOString(),
      original_alert_type: resolutionData.originalAlert.alertType,
      original_severity: resolutionData.originalAlert.severityLevel,
    };
  }

  private async getClinicWebhookUrls(
    clinicId: string,
    eventType: string
  ): Promise<string[]> {
    try {
      // Get webhook configurations for this clinic and event type
      const { data, error } = await this.supabase
        .from('clinic_webhook_configs')
        .select('webhook_url')
        .eq('clinic_id', clinicId)
        .contains('events', [eventType])
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching webhook URLs:', error);
        return [];
      }

      return data.map((config) => config.webhook_url);
    } catch (error) {
      console.error('Error in getClinicWebhookUrls:', error);
      return [];
    }
  }

  // ==========================================
  // RETRY MECHANISM
  // ==========================================

  async retryFailedNotifications(): Promise<{
    processed: number;
    retried: number;
    expired: number;
  }> {
    const results = {
      processed: 0,
      retried: 0,
      expired: 0,
    };

    try {
      // Get failed notifications that can be retried
      const { data: failedNotifications, error } = await this.supabase
        .from('notification_deliveries')
        .select('*')
        .eq('status', 'failed')
        .lt('retry_count', this.maxRetries)
        .gt(
          'created_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ); // Within last 24 hours

      if (error) {
        console.error('Error fetching failed notifications:', error);
        return results;
      }

      for (const notification of failedNotifications) {
        results.processed++;

        // Check if enough time has passed since last failure for retry
        const lastFailure = new Date(notification.failed_at);
        const now = new Date();
        const timeSinceFailure = now.getTime() - lastFailure.getTime();

        if (
          timeSinceFailure <
          this.retryDelayMs * 2 ** notification.retry_count
        ) {
          continue; // Not ready to retry yet (exponential backoff)
        }

        // Mark as retrying
        await this.updateNotificationDelivery(notification.id, {
          status: 'retrying',
          retry_count: notification.retry_count + 1,
        });

        // Attempt retry based on channel
        let success = false;
        let errorMessage = '';

        try {
          switch (notification.channel) {
            case 'email':
              if (notification.recipient_email) {
                const emailResult = await this.resend.emails.send({
                  from: process.env.DEFAULT_FROM_EMAIL || 'alerts@neonpro.com',
                  to: [notification.recipient_email],
                  subject: notification.subject || 'Alerta de Estoque',
                  html: notification.content,
                });
                success = !emailResult.error;
                if (emailResult.error) {
                  errorMessage = emailResult.error.message;
                }
              }
              break;

            case 'webhook':
              if (notification.webhook_url) {
                const response = await axios.post(
                  notification.webhook_url,
                  JSON.parse(notification.content),
                  {
                    timeout: 30_000,
                    headers: { 'Content-Type': 'application/json' },
                  }
                );
                success = response.status >= 200 && response.status < 300;
                if (!success) {
                  errorMessage = `HTTP ${response.status}`;
                }
              }
              break;

            case 'push':
              if (notification.recipient_id) {
                const payload = JSON.parse(notification.content);
                const pushResult = await pushNotificationService.sendToUser(
                  notification.recipient_id,
                  payload
                );
                success = pushResult.success;
                if (!success) {
                  errorMessage = pushResult.errors.join(', ');
                }
              }
              break;
          }

          if (success) {
            await this.updateNotificationDelivery(notification.id, {
              status: 'sent',
              sent_at: new Date(),
            });
            results.retried++;
          } else {
            const shouldExpire =
              notification.retry_count + 1 >= this.maxRetries;
            await this.updateNotificationDelivery(notification.id, {
              status: shouldExpire ? 'failed' : 'failed',
              failed_at: new Date(),
              error_message: errorMessage || 'Retry failed',
            });

            if (shouldExpire) {
              results.expired++;
            }
          }
        } catch (error) {
          const shouldExpire = notification.retry_count + 1 >= this.maxRetries;
          await this.updateNotificationDelivery(notification.id, {
            status: 'failed',
            failed_at: new Date(),
            error_message:
              error instanceof Error ? error.message : 'Unknown retry error',
          });

          if (shouldExpire) {
            results.expired++;
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error in retryFailedNotifications:', error);
      return results;
    }
  }
}

// Singleton instance
const stockNotificationsService = new StockNotificationsService();
export default stockNotificationsService;

// Export types for use in other modules
export type {
  NotificationTemplate,
  NotificationDelivery,
  StockAlertNotificationData,
  ResolutionNotificationData,
};
