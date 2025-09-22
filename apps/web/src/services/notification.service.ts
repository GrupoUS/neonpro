/**
 * Notification Service
 * Handles email, SMS, and WhatsApp notifications with LGPD compliance
 */

import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Type definitions
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  appointmentReminders: boolean;
  appointmentConfirmations: boolean;
  appointmentCancellations: boolean;
  promotionalMessages: boolean;
  lgpdConsent: boolean;
  lgpdConsentDate: Date;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  content: string;
  variables: string[];
}

export type NotificationType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'appointment_cancellation'
  | 'appointment_rescheduled'
  | 'promotional'
  | 'welcome'
  | 'birthday';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

export interface NotificationData {
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentId?: string;
  appointmentDate?: Date;
  appointmentTime?: string;
  professionalName?: string;
  serviceName?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  customMessage?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  channel: NotificationChannel;
  sentAt: Date;
}

class NotificationService {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Send appointment confirmation notification
   */
  async sendAppointmentConfirmation(
    data: NotificationData,
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    try {
      // Get patient notification preferences
      const preferences = await this.getNotificationPreferences(data.patientId);

      if (!preferences.lgpdConsent) {
        throw new Error(
          'Patient has not provided LGPD consent for notifications',
        );
      }

      if (!preferences.appointmentConfirmations) {
        return []; // Patient opted out of confirmation notifications
      }

      // Send notifications based on preferences
      if (preferences.email && data.patientEmail) {
        const emailResult = await this.sendEmailNotification(
          'appointment_confirmation',
          data,
        );
        results.push(emailResult);
      }

      if (preferences.sms && data.patientPhone) {
        const smsResult = await this.sendSMSNotification(
          'appointment_confirmation',
          data,
        );
        results.push(smsResult);
      }

      if (preferences.whatsapp && data.patientPhone) {
        const whatsappResult = await this.sendWhatsAppNotification(
          'appointment_confirmation',
          data,
        );
        results.push(whatsappResult);
      }

      // Log notification activity
      await this.logNotificationActivity(
        data.patientId,
        'appointment_confirmation',
        results,
      );

      return results;
    } catch (_error) {
      console.error('Error sending appointment confirmation:', error);
      return [
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          channel: 'email',
          sentAt: new Date(),
        },
      ];
    }
  }

  /**
   * Send appointment reminder notification
   */
  async sendAppointmentReminder(
    data: NotificationData,
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    try {
      const preferences = await this.getNotificationPreferences(data.patientId);

      if (!preferences.lgpdConsent || !preferences.appointmentReminders) {
        return [];
      }

      // Send reminders via preferred channels
      if (preferences.whatsapp && data.patientPhone) {
        const whatsappResult = await this.sendWhatsAppNotification(
          'appointment_reminder',
          data,
        );
        results.push(whatsappResult);
      } else if (preferences.sms && data.patientPhone) {
        const smsResult = await this.sendSMSNotification(
          'appointment_reminder',
          data,
        );
        results.push(smsResult);
      }

      if (preferences.email && data.patientEmail) {
        const emailResult = await this.sendEmailNotification(
          'appointment_reminder',
          data,
        );
        results.push(emailResult);
      }

      await this.logNotificationActivity(
        data.patientId,
        'appointment_reminder',
        results,
      );
      return results;
    } catch (_error) {
      console.error('Error sending appointment reminder:', error);
      return [];
    }
  }

  /**
   * Send appointment cancellation notification
   */
  async sendAppointmentCancellation(
    data: NotificationData,
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    try {
      const preferences = await this.getNotificationPreferences(data.patientId);

      if (!preferences.lgpdConsent || !preferences.appointmentCancellations) {
        return [];
      }

      // Send cancellation notifications
      if (preferences.email && data.patientEmail) {
        const emailResult = await this.sendEmailNotification(
          'appointment_cancellation',
          data,
        );
        results.push(emailResult);
      }

      if (preferences.whatsapp && data.patientPhone) {
        const whatsappResult = await this.sendWhatsAppNotification(
          'appointment_cancellation',
          data,
        );
        results.push(whatsappResult);
      }

      await this.logNotificationActivity(
        data.patientId,
        'appointment_cancellation',
        results,
      );
      return results;
    } catch (_error) {
      console.error('Error sending appointment cancellation:', error);
      return [];
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    type: NotificationType,
    data: NotificationData,
  ): Promise<NotificationResult> {
    try {
      const template = this.getTemplate(type, 'email');
      const content = this.processTemplate(template.content, data);
      const subject = template.subject
        ? this.processTemplate(template.subject, data)
        : 'NeonPro - Notificação';

      // In a real implementation, you would integrate with an email service like:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Resend

      // For now, we'll simulate the email sending
      console.log('Sending email:', {
        to: data.patientEmail,
        subject,
        content,
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        messageId: `email_${Date.now()}`,
        channel: 'email',
        sentAt: new Date(),
      };
    } catch (_error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed',
        channel: 'email',
        sentAt: new Date(),
      };
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    type: NotificationType,
    data: NotificationData,
  ): Promise<NotificationResult> {
    try {
      const template = this.getTemplate(type, 'sms');
      const content = this.processTemplate(template.content, data);

      // In a real implementation, you would integrate with an SMS service like:
      // - Twilio
      // - AWS SNS
      // - Zenvia
      // - TotalVoice (Brazilian provider)

      console.log('Sending SMS:', {
        to: data.patientPhone,
        content,
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        messageId: `sms_${Date.now()}`,
        channel: 'sms',
        sentAt: new Date(),
      };
    } catch (_error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS sending failed',
        channel: 'sms',
        sentAt: new Date(),
      };
    }
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsAppNotification(
    type: NotificationType,
    data: NotificationData,
  ): Promise<NotificationResult> {
    try {
      const template = this.getTemplate(type, 'whatsapp');
      const content = this.processTemplate(template.content, data);

      // In a real implementation, you would integrate with WhatsApp Business API:
      // - Meta WhatsApp Business API
      // - Twilio WhatsApp API
      // - Zenvia WhatsApp
      // - ChatAPI

      console.log('Sending WhatsApp:', {
        to: data.patientPhone,
        content,
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        success: true,
        messageId: `whatsapp_${Date.now()}`,
        channel: 'whatsapp',
        sentAt: new Date(),
      };
    } catch (_error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WhatsApp sending failed',
        channel: 'whatsapp',
        sentAt: new Date(),
      };
    }
  }

  /**
   * Get notification preferences for a patient
   */
  private async getNotificationPreferences(
    patientId: string,
  ): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('patient_notification_preferences' as any)
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Not found error
        throw error;
      }

      // Return default preferences if none found
      if (!data) {
        return {
          email: true,
          sms: false,
          whatsapp: true, // WhatsApp is popular in Brazil
          appointmentReminders: true,
          appointmentConfirmations: true,
          appointmentCancellations: true,
          promotionalMessages: false,
          lgpdConsent: false, // Must be explicitly granted
          lgpdConsentDate: new Date(),
        };
      }

      const anyData = data as any;
      return {
        email: anyData.email_enabled || false,
        sms: anyData.sms_enabled || false,
        whatsapp: anyData.whatsapp_enabled || false,
        appointmentReminders: anyData.appointment_reminders || false,
        appointmentConfirmations: anyData.appointment_confirmations || false,
        appointmentCancellations: anyData.appointment_cancellations || false,
        promotionalMessages: anyData.promotional_messages || false,
        lgpdConsent: anyData.lgpd_consent || false,
        lgpdConsentDate: anyData.lgpd_consent_date
          ? new Date(anyData.lgpd_consent_date)
          : new Date(),
      };
    } catch (_error) {
      console.error('Error getting notification preferences:', error);
      // Return safe defaults
      return {
        email: false,
        sms: false,
        whatsapp: false,
        appointmentReminders: false,
        appointmentConfirmations: false,
        appointmentCancellations: false,
        promotionalMessages: false,
        lgpdConsent: false,
        lgpdConsentDate: new Date(),
      };
    }
  }

  /**
   * Initialize default notification templates
   */
  private initializeDefaultTemplates(): void {
    // Appointment Confirmation Templates
    this.templates.set('appointment_confirmation_email', {
      id: 'appointment_confirmation_email',
      type: 'appointment_confirmation',
      channel: 'email',
      subject: 'Confirmação de Agendamento - {{clinicName}}',
      content: `
        <h2>Agendamento Confirmado!</h2>
        <p>Olá {{patientName}},</p>
        <p>Seu agendamento foi confirmado com sucesso:</p>
        <ul>
          <li><strong>Data:</strong> {{appointmentDate}}</li>
          <li><strong>Horário:</strong> {{appointmentTime}}</li>
          <li><strong>Profissional:</strong> {{professionalName}}</li>
          <li><strong>Serviço:</strong> {{serviceName}}</li>
        </ul>
        <p>Local: {{clinicName}}<br>{{clinicAddress}}</p>
        <p>Em caso de dúvidas, entre em contato: {{clinicPhone}}</p>
        <p>Atenciosamente,<br>Equipe {{clinicName}}</p>
      `,
      variables: [
        'patientName',
        'appointmentDate',
        'appointmentTime',
        'professionalName',
        'serviceName',
        'clinicName',
        'clinicAddress',
        'clinicPhone',
      ],
    });

    this.templates.set('appointment_confirmation_sms', {
      id: 'appointment_confirmation_sms',
      type: 'appointment_confirmation',
      channel: 'sms',
      content:
        'Agendamento confirmado! {{patientName}}, sua consulta está marcada para {{appointmentDate}} às {{appointmentTime}} com {{professionalName}}. {{clinicName}} - {{clinicPhone}}',
      variables: [
        'patientName',
        'appointmentDate',
        'appointmentTime',
        'professionalName',
        'clinicName',
        'clinicPhone',
      ],
    });

    this.templates.set('appointment_confirmation_whatsapp', {
      id: 'appointment_confirmation_whatsapp',
      type: 'appointment_confirmation',
      channel: 'whatsapp',
      content: `🎉 *Agendamento Confirmado!*

Olá {{patientName}}! 

Seu agendamento foi confirmado:
📅 *Data:* {{appointmentDate}}
🕐 *Horário:* {{appointmentTime}}
👨‍⚕️ *Profissional:* {{professionalName}}
💆‍♀️ *Serviço:* {{serviceName}}

📍 *Local:* {{clinicName}}
{{clinicAddress}}

📞 Dúvidas? {{clinicPhone}}

Nos vemos em breve! ✨`,
      variables: [
        'patientName',
        'appointmentDate',
        'appointmentTime',
        'professionalName',
        'serviceName',
        'clinicName',
        'clinicAddress',
        'clinicPhone',
      ],
    });

    // Add more templates for reminders, cancellations, etc.
    // ... (additional templates would be added here)
  }

  /**
   * Get template by type and channel
   */
  private getTemplate(
    type: NotificationType,
    channel: NotificationChannel,
  ): NotificationTemplate {
    const templateKey = `${type}_${channel}`;
    const template = this.templates.get(templateKey);

    if (!template) {
      throw new Error(`Template not found: ${templateKey}`);
    }

    return template;
  }

  /**
   * Process template with data variables
   */
  private processTemplate(template: string, data: NotificationData): string {
    let processed = template;

    // Replace variables
    processed = processed.replace(/{{patientName}}/g, data.patientName || '');
    processed = processed.replace(
      /{{appointmentDate}}/g,
      data.appointmentDate
        ? format(data.appointmentDate, 'dd/MM/yyyy', { locale: ptBR })
        : '',
    );
    processed = processed.replace(
      /{{appointmentTime}}/g,
      data.appointmentTime || '',
    );
    processed = processed.replace(
      /{{professionalName}}/g,
      data.professionalName || '',
    );
    processed = processed.replace(/{{serviceName}}/g, data.serviceName || '');
    processed = processed.replace(/{{clinicName}}/g, data.clinicName || '');
    processed = processed.replace(
      /{{clinicAddress}}/g,
      data.clinicAddress || '',
    );
    processed = processed.replace(/{{clinicPhone}}/g, data.clinicPhone || '');
    processed = processed.replace(
      /{{customMessage}}/g,
      data.customMessage || '',
    );

    return processed;
  }

  /**
   * Log notification activity for audit purposes
   */
  private async logNotificationActivity(
    patientId: string,
    type: NotificationType,
    results: NotificationResult[],
  ): Promise<void> {
    try {
      const logEntries = results.map(result => ({
        patient_id: patientId,
        notification_type: type,
        channel: result.channel,
        success: result.success,
        message_id: result.messageId,
        error_message: result.error,
        sent_at: result.sentAt.toISOString(),
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('notification_logs' as any)
        .insert(logEntries as any);

      if (error) {
        console.error('Error logging notification activity:', error);
      }
    } catch (_error) {
      console.error('Error logging notification activity:', error);
    }
  }
}

export const notificationService = new NotificationService();
