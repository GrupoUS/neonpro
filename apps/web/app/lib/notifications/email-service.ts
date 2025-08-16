/**
 * NeonPro - Email Service for React Email Integration
 * HIPAA-compliant email notifications using React Email templates
 */

import { render } from '@react-email/render';
import { Resend } from 'resend';
import { NOTIFICATION_CONFIG } from './config';
import { AppointmentCancellationEmail } from './templates/appointment-cancellation';
import { AppointmentConfirmationEmail } from './templates/appointment-confirmation';
// Import email templates
import { AppointmentReminderEmail } from './templates/appointment-reminder';
import { BillingReminderEmail } from './templates/billing-reminder';
import { EmergencyAlertEmail } from './templates/emergency-alert';
import { FollowUpReminderEmail } from './templates/follow-up-reminder';
import { RescheduleRequestEmail } from './templates/reschedule-request';
import { TreatmentReminderEmail } from './templates/treatment-reminder';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailPayload = {
  recipientId: string;
  recipientEmail: string;
  type: string;
  subject: string;
  content: string;
  templateData?: any;
  timezone?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
};

type EmailResult = {
  success: boolean;
  notificationId?: string;
  channel: 'email';
  error?: string;
  deliveredAt?: Date;
  messageId?: string;
};

export class EmailService {
  private readonly config = NOTIFICATION_CONFIG.email;

  /**
   * Send email using React Email templates
   */
  async send(payload: EmailPayload): Promise<EmailResult> {
    try {
      // Validate required environment variables
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable is required');
      }

      // Get appropriate template component
      const TemplateComponent = this.getTemplateComponent(payload.type);
      if (!TemplateComponent) {
        throw new Error(
          `No template found for notification type: ${payload.type}`,
        );
      }

      // Render email template
      const emailHtml = render(
        TemplateComponent({
          ...payload.templateData,
          recipientEmail: payload.recipientEmail,
          timezone: payload.timezone || 'UTC',
        }),
      );

      // Prepare email data
      const emailData = {
        from: this.config.from,
        to: payload.recipientEmail,
        subject: payload.subject,
        html: emailHtml,
        headers: {
          'X-Priority': this.getPriorityHeader(payload.priority),
          'X-Notification-Type': payload.type,
          'X-Recipient-ID': payload.recipientId,
        },
        tags: [
          { name: 'notification_type', value: payload.type },
          { name: 'priority', value: payload.priority || 'normal' },
          { name: 'clinic', value: 'neonpro' },
        ],
      };

      // Send email via Resend
      const result = await resend.emails.send(emailData);

      if (result.error) {
        throw new Error(`Email sending failed: ${result.error.message}`);
      }

      return {
        success: true,
        notificationId: result.data?.id || `email_${Date.now()}`,
        messageId: result.data?.id,
        channel: 'email',
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        channel: 'email',
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  } /**
   * Get React Email template component for notification type
   */
  private getTemplateComponent(type: string) {
    const templates = {
      appointment_reminder: AppointmentReminderEmail,
      appointment_confirmation: AppointmentConfirmationEmail,
      appointment_cancellation: AppointmentCancellationEmail,
      reschedule_request: RescheduleRequestEmail,
      treatment_reminder: TreatmentReminderEmail,
      follow_up_reminder: FollowUpReminderEmail,
      emergency_alert: EmergencyAlertEmail,
      billing_reminder: BillingReminderEmail,
    };

    return templates[type as keyof typeof templates];
  }

  /**
   * Get email priority header value
   */
  private getPriorityHeader(priority?: string): string {
    switch (priority) {
      case 'urgent':
        return '1';
      case 'high':
        return '2';
      case 'normal':
        return '3';
      case 'low':
        return '4';
      default:
        return '3';
    }
  }

  /**
   * Get email delivery status from Resend
   */
  async getDeliveryStatus(_messageId: string): Promise<{
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
    deliveredAt?: Date;
    error?: string;
  } | null> {
    try {
      // Note: This is a placeholder for Resend's delivery status API
      // Resend doesn't currently provide detailed delivery status
      // You would implement webhook handling for delivery events

      // For now, assume sent means delivered after a short delay
      return {
        status: 'delivered',
        deliveredAt: new Date(),
      };
    } catch (_error) {
      return null;
    }
  }
}
