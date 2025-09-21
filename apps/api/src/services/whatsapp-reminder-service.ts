/**
 * WhatsApp Reminder Service for Healthcare Appointments
 *
 * Implements LGPD-compliant WhatsApp messaging for Brazilian healthcare clinics
 * with multi-channel fallback and comprehensive audit logging.
 *
 * Features:
 * - WhatsApp Business API integration
 * - LGPD consent validation
 * - Multi-language support (Portuguese/English)
 * - Delivery status tracking
 * - Fallback to SMS/Email
 * - Comprehensive audit logging
 * - Brazilian healthcare compliance
 */

import { createClient } from '@supabase/supabase-js';

// Types for WhatsApp messaging
export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: any[];
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: any;
  };
}

export interface AppointmentReminder {
  appointmentId: string;
  patientId: string;
  clinicId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
  clinicAddress: string;
  patientName: string;
  patientPhone: string;
  reminderType: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'follow_up';
  language: 'pt-BR' | 'en-US';
  consentGiven: boolean;
  preferredChannel: 'whatsapp' | 'sms' | 'email';
}

export interface DeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'rejected';
  timestamp: string;
  errorCode?: string;
  errorMessage?: string;
  fallbackUsed?: boolean;
  channel: 'whatsapp' | 'sms' | 'email';
}

export interface LgpdConsentRecord {
  patientId: string;
  clinicId: string;
  consentType: 'whatsapp_messaging' | 'sms_messaging' | 'email_messaging';
  consentGiven: boolean;
  consentDate: string;
  ipAddress?: string;
  userAgent?: string;
  consentVersion: string;
}

// Brazilian healthcare message templates
const HEALTHCARE_TEMPLATES = {
  'pt-BR': {
    appointment_confirmation: {
      subject: '📅 Confirmação de Consulta - {clinicName}',
      body: `Olá {patientName}! 👋

🏥 *{clinicName}*
📅 Data: {appointmentDate}
🕐 Horário: {appointmentTime}
👨‍⚕️ Médico(a): Dr(a). {doctorName}
📍 Local: {clinicAddress}

Para confirmar sua presença, responda:
✅ *CONFIRMAR* - Para confirmar
❌ *CANCELAR* - Para cancelar
📞 *REAGENDAR* - Para reagendar

⚠️ Chegue 15 minutos antes do horário.
📋 Traga documento com foto e carteirinha do convênio.

Dúvidas? Entre em contato conosco.

_Esta é uma mensagem automática conforme sua autorização LGPD._`,
      buttons: [
        { id: 'confirm', title: '✅ Confirmar' },
        { id: 'cancel', title: '❌ Cancelar' },
        { id: 'reschedule', title: '📞 Reagendar' },
      ],
    },
    reminder_24h: {
      subject: '⏰ Lembrete: Consulta amanhã - {clinicName}',
      body: `Olá {patientName}! 👋

🔔 *Lembrete de consulta*

📅 *Amanhã* - {appointmentDate}
🕐 {appointmentTime}
👨‍⚕️ Dr(a). {doctorName}
🏥 {clinicName}
📍 {clinicAddress}

✅ *Orientações importantes:*
• Chegue 15 min antes
• Traga documentos e carteirinha
• Use máscara
• Jejum necessário? Verifique orientações médicas

❓ Precisa cancelar ou reagendar?
📞 Entre em contato conosco.

_Mensagem automática - LGPD._`,
    },
    reminder_2h: {
      subject: '🚨 Consulta em 2 horas - {clinicName}',
      body: `{patientName}, sua consulta é em 2 horas! ⏰

🏥 {clinicName}
👨‍⚕️ Dr(a). {doctorName}
🕐 {appointmentTime}
📍 {clinicAddress}

🚗 *Tempo de deslocamento estimado:*
• Carro: ~20-30 min
• Transporte público: ~45-60 min

✅ *Checklist:*
• [ ] Documento com foto
• [ ] Carteirinha do convênio
• [ ] Exames anteriores
• [ ] Lista de medicamentos

Boa consulta! 🩺`,
    },
    follow_up: {
      subject: '💊 Acompanhamento Pós-Consulta - {clinicName}',
      body: `Olá {patientName}! 👋

Como você está se sentindo após a consulta com Dr(a). {doctorName}?

📋 *Lembretes importantes:*
• Siga o tratamento prescrito
• Tome os medicamentos nos horários corretos
• Retorne nas datas agendadas

🆘 *Em caso de emergência:*
• Sintomas graves: procure pronto-socorro
• Dúvidas: entre em contato conosco

💬 Responda como está se sentindo:
1️⃣ Muito bem
2️⃣ Bem
3️⃣ Regular
4️⃣ Não muito bem
5️⃣ Precisando de ajuda

Estamos aqui para cuidar de você! 💙`,
    },
  },
  'en-US': {
    appointment_confirmation: {
      subject: '📅 Appointment Confirmation - {clinicName}',
      body: `Hello {patientName}! 👋

🏥 *{clinicName}*
📅 Date: {appointmentDate}
🕐 Time: {appointmentTime}
👨‍⚕️ Doctor: Dr. {doctorName}
📍 Location: {clinicAddress}

To confirm your attendance, reply:
✅ *CONFIRM* - To confirm
❌ *CANCEL* - To cancel
📞 *RESCHEDULE* - To reschedule

⚠️ Please arrive 15 minutes early.
📋 Bring photo ID and insurance card.

Questions? Contact us.

_This is an automated message per your LGPD authorization._`,
    },
    // ... other English templates
  },
};

export class WhatsAppReminderService {
  private supabase: any;
  private whatsappApiUrl: string;
  private whatsappToken: string;
  private whatsappPhoneId: string;
  private webhookVerifyToken: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // WhatsApp Business API configuration
    this.whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!;
  }

  /**
   * Send appointment reminder via WhatsApp with LGPD compliance
   */
  async sendAppointmentReminder(reminder: AppointmentReminder): Promise<{
    success: boolean;
    messageId?: string;
    deliveryStatus: DeliveryStatus;
    fallbackUsed: boolean;
  }> {
    const startTime = Date.now();

    try {
      // 1. Validate LGPD consent
      const consentValid = await this.validateLgpdConsent(
        reminder.patientId,
        reminder.clinicId,
        'whatsapp_messaging',
      );

      if (!consentValid) {
        throw new Error('LGPD consent not given for WhatsApp messaging');
      }

      // 2. Format phone number for WhatsApp
      const formattedPhone = this.formatBrazilianPhoneNumber(
        reminder.patientPhone,
      );

      // 3. Generate message content
      const messageContent = this.generateMessageContent(reminder);

      // 4. Send WhatsApp message
      let deliveryStatus: DeliveryStatus;
      let fallbackUsed = false;
      let messageId: string | undefined;

      try {
        const whatsappResult = await this.sendWhatsAppMessage({
          to: formattedPhone,
          type: 'text',
          text: {
            body: messageContent.body,
          },
        });

        messageId = whatsappResult.messageId;
        deliveryStatus = {
          messageId: messageId!,
          status: 'sent',
          timestamp: new Date().toISOString(),
          channel: 'whatsapp',
        };
      } catch (_whatsappError) {
        console.warn(
          'WhatsApp delivery failed, attempting fallback:',
          whatsappError,
        );

        // 5. Fallback to SMS if WhatsApp fails
        if (
          reminder.preferredChannel === 'sms'
          || reminder.preferredChannel === 'whatsapp'
        ) {
          try {
            const smsResult = await this.sendSmsMessage(
              formattedPhone,
              messageContent.body,
            );
            messageId = smsResult.messageId;
            fallbackUsed = true;
            deliveryStatus = {
              messageId: messageId!,
              status: 'sent',
              timestamp: new Date().toISOString(),
              channel: 'sms',
              fallbackUsed: true,
            };
          } catch {
            // 6. Final fallback to email
            const emailResult = await this.sendEmailMessage(
              reminder,
              messageContent,
            );
            messageId = emailResult.messageId;
            fallbackUsed = true;
            deliveryStatus = {
              messageId: messageId!,
              status: 'sent',
              timestamp: new Date().toISOString(),
              channel: 'email',
              fallbackUsed: true,
            };
          }
        } else {
          throw whatsappError;
        }
      }

      // 7. Log delivery attempt
      await this.logDeliveryAttempt(
        reminder,
        deliveryStatus,
        Date.now() - startTime,
      );

      // 8. Store audit record
      await this.createAuditRecord({
        appointmentId: reminder.appointmentId,
        patientId: reminder.patientId,
        clinicId: reminder.clinicId,
        action: 'reminder_sent',
        channel: deliveryStatus.channel,
        messageId: messageId!,
        consentValidated: true,
        processingTime: Date.now() - startTime,
        fallbackUsed,
      });

      return {
        success: true,
        messageId,
        deliveryStatus,
        fallbackUsed,
      };
    } catch (_error) {
      console.error('WhatsApp reminder service error:', error);

      const errorDeliveryStatus: DeliveryStatus = {
        messageId: '',
        status: 'failed',
        timestamp: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        channel: 'whatsapp',
      };

      // Log failed delivery attempt
      await this.logDeliveryAttempt(
        reminder,
        errorDeliveryStatus,
        Date.now() - startTime,
      );

      return {
        success: false,
        deliveryStatus: errorDeliveryStatus,
        fallbackUsed: false,
      };
    }
  }

  /**
   * Validate LGPD consent for messaging
   */
  private async validateLgpdConsent(
    patientId: string,
    clinicId: string,
    consentType: 'whatsapp_messaging' | 'sms_messaging' | 'email_messaging',
  ): Promise<boolean> {
    try {
      const { data: consent, error } = await this.supabase
        .from('patient_consent')
        .select('*')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId)
        .eq('consent_type', consentType)
        .eq('consent_given', true)
        .order('consent_date', { ascending: false })
        .limit(1)
        .single();

      if (error || !consent) {
        console.warn(
          `LGPD consent not found for patient ${patientId}, consent type: ${consentType}`,
        );
        return false;
      }

      // Check if consent is still valid (not revoked)
      const consentDate = new Date(consent.consent_date);
      const _now = new Date();
      const monthsSinceConsent = (now.getTime() - consentDate.getTime())
        / (1000 * 60 * 60 * 24 * 30);

      // LGPD requires periodic consent revalidation for marketing communications
      // For healthcare reminders, consent is generally valid until explicitly revoked
      if (monthsSinceConsent > 24) {
        // 2 years
        console.warn(`LGPD consent may be stale for patient ${patientId}`);
        return false;
      }

      return true;
    } catch (_error) {
      console.error('Error validating LGPD consent:', error);
      return false;
    }
  } /**
   * Format Brazilian phone number for WhatsApp
   */

  private formatBrazilianPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Brazilian phone number validation and formatting
    if (cleanPhone.length === 11 && cleanPhone.startsWith('55')) {
      // Already has country code
      return cleanPhone;
    } else if (cleanPhone.length === 11) {
      // Mobile number without country code
      return `55${cleanPhone}`;
    } else if (cleanPhone.length === 10) {
      // Landline without country code
      return `55${cleanPhone}`;
    } else if (cleanPhone.length === 9) {
      // Mobile number without area code and country code (São Paulo)
      return `5511${cleanPhone}`;
    } else if (cleanPhone.length === 8) {
      // Landline without area code and country code (São Paulo)
      return `5511${cleanPhone}`;
    }

    // If format is unclear, assume it's a mobile number and add São Paulo area code
    return `5511${cleanPhone}`;
  }

  /**
   * Generate message content based on reminder type and language
   */
  private generateMessageContent(reminder: AppointmentReminder): {
    subject: string;
    body: string;
    buttons?: any[];
  } {
    const templates = HEALTHCARE_TEMPLATES[reminder.language] || HEALTHCARE_TEMPLATES['pt-BR'];
    const template = templates[reminder.reminderType];

    if (!template) {
      throw new Error(
        `Template not found for reminder type: ${reminder.reminderType}`,
      );
    }

    // Replace placeholders in template
    const replacements = {
      '{patientName}': reminder.patientName,
      '{clinicName}': reminder.clinicName,
      '{doctorName}': reminder.doctorName,
      '{appointmentDate}': this.formatBrazilianDate(reminder.appointmentDate),
      '{appointmentTime}': reminder.appointmentTime,
      '{clinicAddress}': reminder.clinicAddress,
    };

    let subject = template.subject;
    let body = template.body;

    Object.entries(replacements).forEach(_([placeholder,_value]) => {
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    return {
      subject,
      body,
      buttons: template.buttons,
    };
  }

  /**
   * Send WhatsApp message via Business API
   */
  private async sendWhatsAppMessage(
    message: WhatsAppMessage,
  ): Promise<{ messageId: string }> {
    try {
      const response = await fetch(
        `${this.whatsappApiUrl}/${this.whatsappPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: message.to,
            type: message.type,
            text: message.text,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `WhatsApp API error: ${errorData.error?.message || response.statusText}`,
        );
      }

      const result = await response.json();
      return { messageId: result.messages[0].id };
    } catch (_error) {
      console.error('WhatsApp message send error:', error);
      throw error;
    }
  }

  /**
   * Send SMS message as fallback
   */
  private async sendSmsMessage(
    phone: string,
    message: string,
  ): Promise<{ messageId: string }> {
    // Integration with Brazilian SMS provider (e.g., Zenvia, TotalVoice)
    try {
      const response = await fetch(process.env.SMS_API_URL!, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SMS_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          text: message,
          from: process.env.SMS_SENDER_ID || 'NEONPRO',
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS API error: ${response.statusText}`);
      }

      const result = await response.json();
      return { messageId: result.id || result.messageId };
    } catch (_error) {
      console.error('SMS send error:', error);
      throw error;
    }
  }

  /**
   * Send email message as final fallback
   */
  private async sendEmailMessage(
    reminder: AppointmentReminder,
    content: { subject: string; body: string },
  ): Promise<{ messageId: string }> {
    try {
      // Get patient email from database
      const { data: patient, error } = await this.supabase
        .from('patients')
        .select('email')
        .eq('id', reminder.patientId)
        .eq('clinic_id', reminder.clinicId)
        .single();

      if (error || !patient?.email) {
        throw new Error('Patient email not found for fallback delivery');
      }

      // Send via email service (e.g., SendGrid, Amazon SES)
      const response = await fetch(process.env.EMAIL_API_URL!, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EMAIL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: patient.email, name: reminder.patientName }],
              subject: content.subject,
            },
          ],
          from: {
            email: process.env.EMAIL_FROM_ADDRESS || 'noreply@neonpro.com.br',
            name: reminder.clinicName,
          },
          content: [
            {
              type: 'text/plain',
              value: content.body,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.statusText}`);
      }

      const result = await response.json();
      return { messageId: result.messageId || 'email-' + Date.now() };
    } catch (_error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * Log delivery attempt for monitoring and compliance
   */
  private async logDeliveryAttempt(
    reminder: AppointmentReminder,
    deliveryStatus: DeliveryStatus,
    processingTime: number,
  ): Promise<void> {
    try {
      await this.supabase.from('message_delivery_log').insert({
        appointment_id: reminder.appointmentId,
        patient_id: reminder.patientId,
        clinic_id: reminder.clinicId,
        message_id: deliveryStatus.messageId,
        channel: deliveryStatus.channel,
        status: deliveryStatus.status,
        reminder_type: reminder.reminderType,
        processing_time_ms: processingTime,
        fallback_used: deliveryStatus.fallbackUsed || false,
        error_message: deliveryStatus.errorMessage,
        sent_at: deliveryStatus.timestamp,
        created_at: new Date().toISOString(),
      });
    } catch (_error) {
      console.error('Failed to log delivery attempt:', error);
    }
  }

  /**
   * Create audit record for LGPD compliance
   */
  private async createAuditRecord(audit: {
    appointmentId: string;
    patientId: string;
    clinicId: string;
    action: string;
    channel: string;
    messageId: string;
    consentValidated: boolean;
    processingTime: number;
    fallbackUsed: boolean;
  }): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        patient_id: audit.patientId,
        clinic_id: audit.clinicId,
        action: audit.action,
        resource_type: 'appointment_reminder',
        resource_id: audit.appointmentId,
        metadata: {
          channel: audit.channel,
          messageId: audit.messageId,
          consentValidated: audit.consentValidated,
          processingTime: audit.processingTime,
          fallbackUsed: audit.fallbackUsed,
        },
        ip_address: '0.0.0.0', // Edge function IP
        user_agent: 'NeonPro-WhatsApp-Service/1.0',
        created_at: new Date().toISOString(),
      });
    } catch (_error) {
      console.error('Failed to create audit record:', error);
    }
  }

  /**
   * Handle WhatsApp webhook for delivery status updates
   */
  async handleWebhook(webhookData: any): Promise<{
    success: boolean;
    processed: number;
  }> {
    try {
      let processed = 0;

      // Verify webhook authenticity
      if (!this.verifyWebhookSignature(webhookData)) {
        throw new Error('Invalid webhook signature');
      }

      // Process webhook entries
      for (const entry of webhookData.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const messages = change.value.messages || [];
            const statuses = change.value.statuses || [];

            // Process incoming messages (patient replies)
            for (const message of messages) {
              await this.processIncomingMessage(message);
              processed++;
            }

            // Process delivery status updates
            for (const status of statuses) {
              await this.processDeliveryStatus(status);
              processed++;
            }
          }
        }
      }

      return { success: true, processed };
    } catch (_error) {
      console.error('Webhook processing error:', error);
      return { success: false, processed: 0 };
    }
  }

  /**
   * Process incoming WhatsApp message (patient reply)
   */
  private async processIncomingMessage(message: any): Promise<void> {
    try {
      const fromPhone = message.from;
      const messageText = message.text?.body?.toLowerCase() || '';
      const messageId = message.id;

      // Find appointment based on recent reminders sent to this phone
      const { data: recentReminder, error } = await this.supabase
        .from('message_delivery_log')
        .select(
          `
          appointment_id,
          patient_id,
          clinic_id,
          appointments!inner(*)
        `,
        )
        .eq('channel', 'whatsapp')
        .ilike('patient_phone', `%${fromPhone.slice(-9)}%`) // Match last 9 digits
        .gte(
          'sent_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ) // Last 7 days
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !recentReminder) {
        console.warn('No recent appointment found for phone:', fromPhone);
        return;
      }

      // Process appointment confirmation responses
      let responseAction = null;
      if (
        messageText.includes('confirmar')
        || messageText.includes('confirm')
      ) {
        responseAction = 'confirmed';
      } else if (
        messageText.includes('cancelar')
        || messageText.includes('cancel')
      ) {
        responseAction = 'cancelled';
      } else if (
        messageText.includes('reagendar')
        || messageText.includes('reschedule')
      ) {
        responseAction = 'reschedule_requested';
      }

      if (responseAction) {
        // Update appointment status
        await this.supabase
          .from('appointments')
          .update({
            status: responseAction === 'confirmed'
              ? 'confirmed'
              : responseAction === 'cancelled'
              ? 'cancelled'
              : 'reschedule_requested',
            updated_at: new Date().toISOString(),
          })
          .eq('id', recentReminder.appointment_id);

        // Log patient response
        await this.supabase.from('patient_responses').insert({
          appointment_id: recentReminder.appointment_id,
          patient_id: recentReminder.patient_id,
          clinic_id: recentReminder.clinic_id,
          message_id: messageId,
          response_text: messageText,
          response_action: responseAction,
          channel: 'whatsapp',
          received_at: new Date().toISOString(),
        });

        // Send confirmation message
        await this.sendConfirmationResponse(fromPhone, responseAction);
      }
    } catch (_error) {
      console.error('Error processing incoming message:', error);
    }
  }

  /**
   * Process delivery status update
   */
  private async processDeliveryStatus(status: any): Promise<void> {
    try {
      const messageId = status.id;
      const deliveryStatus = status.status; // sent, delivered, read, failed

      // Update delivery status in database
      await this.supabase
        .from('message_delivery_log')
        .update({
          status: deliveryStatus,
          delivered_at: deliveryStatus === 'delivered' ? new Date().toISOString() : null,
          read_at: deliveryStatus === 'read' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('message_id', messageId);
    } catch (_error) {
      console.error('Error processing delivery status:', error);
    }
  }

  /**
   * Send confirmation response to patient
   */
  private async sendConfirmationResponse(
    phone: string,
    action: string,
  ): Promise<void> {
    const confirmationMessages = {
      confirmed:
        'Perfeito! ✅ Sua consulta foi confirmada. Aguardamos você no horário marcado. Até breve! 👋',
      cancelled:
        'Consulta cancelada. ❌ Entre em contato conosco para reagendar quando possível. 📞',
      reschedule_requested:
        'Entendido! 📞 Nossa equipe entrará em contato em breve para reagendarmos sua consulta.',
    };

    const message = confirmationMessages[action as keyof typeof confirmationMessages];

    if (message) {
      try {
        await this.sendWhatsAppMessage({
          to: phone,
          type: 'text',
          text: { body: message },
        });
      } catch (_error) {
        console.error('Failed to send confirmation response:', error);
      }
    }
  }

  /**
   * Verify webhook signature for security
   */
  private verifyWebhookSignature(_data: any): boolean {
    // Implement signature verification based on WhatsApp webhook security
    // This is a simplified version - implement proper signature verification in production
    return true;
  }

  /**
   * Format date for Brazilian locale
   */
  private formatBrazilianDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Batch send reminders for multiple appointments
   */
  async sendBatchReminders(reminders: AppointmentReminder[]): Promise<{
    success: number;
    failed: number;
    results: any[];
  }> {
    const results = [];
    let success = 0;
    let failed = 0;

    // Process reminders in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < reminders.length; i += batchSize) {
      const batch = reminders.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map(reminder => this.sendAppointmentReminder(reminder)),
      );

      batchResults.forEach(_(result,_index) => {
        if (result.status === 'fulfilled') {
          success++;
          results.push({
            appointmentId: batch[index].appointmentId,
            success: true,
            ...result.value,
          });
        } else {
          failed++;
          results.push({
            appointmentId: batch[index].appointmentId,
            success: false,
            error: result.reason.message,
          });
        }
      });

      // Rate limiting: wait between batches
      if (i + batchSize < reminders.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    return { success, failed, results };
  }

  /**
   * Send bulk reminders with enhanced error handling and metrics
   * Alias for sendBatchReminders with additional logging and monitoring
   */
  async sendBulkReminders(reminders: AppointmentReminder[]): Promise<{
    success: number;
    failed: number;
    results: any[];
    totalProcessed: number;
    processingTime: number;
    averageProcessingTimePerReminder: number;
  }> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!Array.isArray(reminders) || reminders.length === 0) {
        throw new Error('Invalid reminders array provided');
      }

      // Log bulk operation start
      console.log(
        `Starting bulk reminder processing for ${reminders.length} reminders`,
      );

      // Use existing batch processing logic
      const batchResult = await this.sendBatchReminders(reminders);

      const processingTime = Date.now() - startTime;
      const averageProcessingTimePerReminder = processingTime / reminders.length;

      // Enhanced logging for monitoring
      console.log(`Bulk reminder processing completed:`, {
        totalProcessed: reminders.length,
        successful: batchResult.success,
        failed: batchResult.failed,
        processingTime: `${processingTime}ms`,
        averagePerReminder: `${averageProcessingTimePerReminder.toFixed(2)}ms`,
      });

      // Create audit log for bulk operation
      try {
        await this.supabase.from('audit_logs').insert({
          action: 'bulk_reminder_sent',
          entity_type: 'appointment_reminders',
          entity_id: `bulk_${Date.now()}`,
          details: {
            total_reminders: reminders.length,
            successful: batchResult.success,
            failed: batchResult.failed,
            processing_time_ms: processingTime,
            clinic_ids: [...new Set(reminders.map(r => r.clinicId))],
          },
          created_at: new Date().toISOString(),
        });
      } catch (_auditError) {
        console.warn(
          'Failed to create audit log for bulk operation:',
          auditError,
        );
      }

      return {
        ...batchResult,
        totalProcessed: reminders.length,
        processingTime,
        averageProcessingTimePerReminder,
      };
    } catch (_error) {
      const processingTime = Date.now() - startTime;

      console.error('Bulk reminder processing failed:', error);

      // Log error for monitoring
      try {
        await this.supabase.from('audit_logs').insert({
          action: 'bulk_reminder_failed',
          entity_type: 'appointment_reminders',
          entity_id: `bulk_error_${Date.now()}`,
          details: {
            error_message: error instanceof Error ? error.message : 'Unknown error',
            total_reminders: reminders?.length || 0,
            processing_time_ms: processingTime,
          },
          created_at: new Date().toISOString(),
        });
      } catch (_auditError) {
        console.warn('Failed to create error audit log:', auditError);
      }

      throw error;
    }
  }

  /**
   * Get delivery statistics for clinic
   */
  async getDeliveryStatistics(
    clinicId: string,
    days = 30,
  ): Promise<{
    totalSent: number;
    deliveryRate: number;
    readRate: number;
    responseRate: number;
    channelBreakdown: Record<string, number>;
    fallbackRate: number;
  }> {
    try {
      const since = new Date(
        Date.now() - days * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: logs, error } = await this.supabase
        .from('message_delivery_log')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('sent_at', since);

      if (error) throw error;

      const totalSent = logs.length;
      const delivered = logs.filter(
        log => log.status === 'delivered' || log.status === 'read',
      ).length;
      const read = logs.filter(log => log.status === 'read').length;
      const fallbackUsed = logs.filter(log => log.fallback_used).length;

      // Get response count
      const { data: responses, error: _responseError } = await this.supabase
        .from('patient_responses')
        .select('appointment_id')
        .eq('clinic_id', clinicId)
        .gte('received_at', since);

      const responseCount = responses?.length || 0;

      // Channel breakdown
      const channelBreakdown = logs.reduce(_(acc,_log) => {
          acc[log.channel] = (acc[log.channel] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        totalSent,
        deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        readRate: totalSent > 0 ? (read / totalSent) * 100 : 0,
        responseRate: totalSent > 0 ? (responseCount / totalSent) * 100 : 0,
        channelBreakdown,
        fallbackRate: totalSent > 0 ? (fallbackUsed / totalSent) * 100 : 0,
      };
    } catch (_error) {
      console.error('Error getting delivery statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const _whatsappReminderService = new WhatsAppReminderService();

// Export types for use in other modules
export type { AppointmentReminder, DeliveryStatus, LgpdConsentRecord, WhatsAppMessage };
