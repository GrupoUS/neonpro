/**
 * Communication Service - Main orchestrator for all communication channels
 * Story 2.3: Automated Communication System
 */

import { supabase } from '../supabase';
import {
  CommunicationChannel,
  MessageType,
  CommunicationLog,
  MessageTemplate,
  PatientCommPreferences,
  TemplateVariables,
  CommunicationJob,
  NoShowPrediction
} from './types';
import { SMSProvider } from './providers/sms-provider';
import { EmailProvider } from './providers/email-provider';
import { WhatsAppProvider } from './providers/whatsapp-provider';
import { TemplateEngine } from './template-engine';
import { NoShowPredictor } from './no-show-predictor';
import { WaitlistManager } from './waitlist-manager';

export class CommunicationService {
  private smsProvider: SMSProvider;
  private emailProvider: EmailProvider;
  private whatsappProvider: WhatsAppProvider;
  private templateEngine: TemplateEngine;
  private noShowPredictor: NoShowPredictor;
  private waitlistManager: WaitlistManager;

  constructor() {
    this.smsProvider = new SMSProvider();
    this.emailProvider = new EmailProvider();
    this.whatsappProvider = new WhatsAppProvider();
    this.templateEngine = new TemplateEngine();
    this.noShowPredictor = new NoShowPredictor();
    this.waitlistManager = new WaitlistManager();
  }

  /**
   * Send a message through the appropriate channel
   */
  async sendMessage({
    patientId,
    clinicId,
    appointmentId,
    messageType,
    templateId,
    channel,
    variables,
    scheduledAt
  }: {
    patientId: string;
    clinicId: string;
    appointmentId?: string;
    messageType: MessageType;
    templateId: string;
    channel?: CommunicationChannel;
    variables: TemplateVariables;
    scheduledAt?: Date;
  }): Promise<CommunicationLog> {
    try {
      // Get patient communication preferences
      const preferences = await this.getPatientPreferences(patientId, clinicId);
      
      // Determine the best channel
      const selectedChannel = channel || preferences.preferred_channel;
      
      // Get and render template
      const template = await this.getTemplate(templateId, clinicId);
      const renderedContent = await this.templateEngine.render(template, variables);
      
      // Create communication log entry
      const logEntry = await this.createCommunicationLog({
        appointmentId,
        patientId,
        clinicId,
        channel: selectedChannel,
        messageType,
        templateId,
        content: renderedContent.content,
        status: 'pending'
      });

      // Schedule or send immediately
      if (scheduledAt && scheduledAt > new Date()) {
        await this.scheduleMessage(logEntry.id, scheduledAt);
      } else {
        await this.sendImmediately(logEntry, preferences, renderedContent);
      }

      return logEntry;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send appointment reminders based on patient preferences
   */
  async sendAppointmentReminders(appointmentId: string): Promise<void> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(*),
          professionals(*),
          services(*),
          clinics(*)
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const preferences = await this.getPatientPreferences(
        appointment.patient_id,
        appointment.clinic_id
      );

      if (!preferences.reminder_enabled) {
        return;
      }

      // Get reminder template
      const template = await this.getTemplateByType(
        appointment.clinic_id,
        'reminder',
        preferences.preferred_channel
      );

      const variables: TemplateVariables = {
        patient_name: appointment.patients.name,
        patient_first_name: appointment.patients.name.split(' ')[0],
        clinic_name: appointment.clinics.name,
        appointment_date: new Date(appointment.scheduled_at).toLocaleDateString(),
        appointment_time: new Date(appointment.scheduled_at).toLocaleTimeString(),
        professional_name: appointment.professionals.name,
        service_name: appointment.services.name,
        clinic_phone: appointment.clinics.phone,
        clinic_address: appointment.clinics.address,
        confirmation_link: `${process.env.NEXT_PUBLIC_APP_URL}/confirm/${appointmentId}`,
        reschedule_link: `${process.env.NEXT_PUBLIC_APP_URL}/reschedule/${appointmentId}`,
        cancel_link: `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${appointmentId}`
      };

      // Schedule reminders based on timing preferences
      for (const timing of preferences.reminder_timing) {
        const reminderTime = new Date(appointment.scheduled_at);
        reminderTime.setHours(reminderTime.getHours() - timing);

        if (reminderTime > new Date()) {
          await this.sendMessage({
            patientId: appointment.patient_id,
            clinicId: appointment.clinic_id,
            appointmentId,
            messageType: 'reminder',
            templateId: template.id,
            variables,
            scheduledAt: reminderTime
          });
        }
      }
    } catch (error) {
      console.error('Error sending appointment reminders:', error);
      throw error;
    }
  }

  /**
   * Send appointment confirmation request
   */
  async sendConfirmationRequest(appointmentId: string): Promise<void> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(*),
          professionals(*),
          services(*),
          clinics(*)
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const preferences = await this.getPatientPreferences(
        appointment.patient_id,
        appointment.clinic_id
      );

      if (!preferences.confirmation_enabled) {
        return;
      }

      const template = await this.getTemplateByType(
        appointment.clinic_id,
        'confirmation',
        preferences.preferred_channel
      );

      const variables: TemplateVariables = {
        patient_name: appointment.patients.name,
        patient_first_name: appointment.patients.name.split(' ')[0],
        clinic_name: appointment.clinics.name,
        appointment_date: new Date(appointment.scheduled_at).toLocaleDateString(),
        appointment_time: new Date(appointment.scheduled_at).toLocaleTimeString(),
        professional_name: appointment.professionals.name,
        service_name: appointment.services.name,
        clinic_phone: appointment.clinics.phone,
        clinic_address: appointment.clinics.address,
        confirmation_link: `${process.env.NEXT_PUBLIC_APP_URL}/confirm/${appointmentId}`,
        reschedule_link: `${process.env.NEXT_PUBLIC_APP_URL}/reschedule/${appointmentId}`,
        cancel_link: `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${appointmentId}`
      };

      await this.sendMessage({
        patientId: appointment.patient_id,
        clinicId: appointment.clinic_id,
        appointmentId,
        messageType: 'confirmation',
        templateId: template.id,
        variables
      });
    } catch (error) {
      console.error('Error sending confirmation request:', error);
      throw error;
    }
  }

  /**
   * Process no-show predictions and send preventive communications
   */
  async processNoShowPrevention(): Promise<void> {
    try {
      // Get appointments for the next 48 hours
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);

      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(*),
          professionals(*),
          services(*),
          clinics(*)
        `)
        .gte('scheduled_at', new Date().toISOString())
        .lte('scheduled_at', tomorrow.toISOString())
        .eq('status', 'scheduled');

      if (!appointments) return;

      for (const appointment of appointments) {
        // Get no-show prediction
        const prediction = await this.noShowPredictor.predict(appointment.id);
        
        // If high risk, send additional communication
        if (prediction.risk_score > 0.7) {
          const preferences = await this.getPatientPreferences(
            appointment.patient_id,
            appointment.clinic_id
          );

          const template = await this.getTemplateByType(
            appointment.clinic_id,
            'reminder',
            preferences.backup_channel || preferences.preferred_channel
          );

          const variables: TemplateVariables = {
            patient_name: appointment.patients.name,
            patient_first_name: appointment.patients.name.split(' ')[0],
            clinic_name: appointment.clinics.name,
            appointment_date: new Date(appointment.scheduled_at).toLocaleDateString(),
            appointment_time: new Date(appointment.scheduled_at).toLocaleTimeString(),
            professional_name: appointment.professionals.name,
            service_name: appointment.services.name,
            clinic_phone: appointment.clinics.phone,
            clinic_address: appointment.clinics.address,
            confirmation_link: `${process.env.NEXT_PUBLIC_APP_URL}/confirm/${appointment.id}`,
            custom_message: 'Por favor, confirme sua presença ou reagende se necessário.'
          };

          await this.sendMessage({
            patientId: appointment.patient_id,
            clinicId: appointment.clinic_id,
            appointmentId: appointment.id,
            messageType: 'reminder',
            templateId: template.id,
            channel: preferences.backup_channel,
            variables
          });
        }
      }
    } catch (error) {
      console.error('Error processing no-show prevention:', error);
      throw error;
    }
  }

  /**
   * Process waitlist notifications
   */
  async processWaitlistNotifications(): Promise<void> {
    try {
      await this.waitlistManager.processNotifications();
    } catch (error) {
      console.error('Error processing waitlist notifications:', error);
      throw error;
    }
  }

  // Private helper methods
  private async sendImmediately(
    logEntry: CommunicationLog,
    preferences: PatientCommPreferences,
    renderedContent: { content: string; subject?: string }
  ): Promise<void> {
    try {
      let result;
      
      switch (logEntry.channel) {
        case 'sms':
          result = await this.smsProvider.send(
            preferences.phone_number!,
            renderedContent.content
          );
          break;
        case 'email':
          result = await this.emailProvider.send(
            preferences.email!,
            renderedContent.subject || 'Notificação da Clínica',
            renderedContent.content
          );
          break;
        case 'whatsapp':
          result = await this.whatsappProvider.send(
            preferences.whatsapp_number!,
            renderedContent.content
          );
          break;
      }

      // Update log entry with result
      await this.updateCommunicationLog(logEntry.id, {
        status: result.success ? 'sent' : 'failed',
        external_id: result.messageId,
        error_message: result.error,
        sent_at: new Date()
      });
    } catch (error) {
      await this.updateCommunicationLog(logEntry.id, {
        status: 'failed',
        error_message: error.message,
        sent_at: new Date()
      });
      throw error;
    }
  }

  private async getPatientPreferences(
    patientId: string,
    clinicId: string
  ): Promise<PatientCommPreferences> {
    const { data } = await supabase
      .from('patient_communication_preferences')
      .select('*')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .single();

    if (!data) {
      // Return default preferences
      return {
        id: '',
        patient_id: patientId,
        clinic_id: clinicId,
        preferred_channel: 'sms',
        reminder_enabled: true,
        reminder_timing: [24, 2],
        confirmation_enabled: true,
        waitlist_notifications: true,
        language: 'pt-BR',
        consent_given: false,
        consent_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
    }

    return data;
  }

  private async getTemplate(
    templateId: string,
    clinicId: string
  ): Promise<MessageTemplate> {
    const { data } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .eq('clinic_id', clinicId)
      .eq('active', true)
      .single();

    if (!data) {
      throw new Error('Template not found');
    }

    return data;
  }

  private async getTemplateByType(
    clinicId: string,
    type: MessageType,
    channel: CommunicationChannel
  ): Promise<MessageTemplate> {
    const { data } = await supabase
      .from('message_templates')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('type', type)
      .eq('channel', channel)
      .eq('active', true)
      .limit(1)
      .single();

    if (!data) {
      throw new Error(`Template not found for type ${type} and channel ${channel}`);
    }

    return data;
  }

  private async createCommunicationLog(data: Partial<CommunicationLog>): Promise<CommunicationLog> {
    const { data: log, error } = await supabase
      .from('communication_logs')
      .insert({
        ...data,
        retry_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;
    return log;
  }

  private async updateCommunicationLog(
    id: string,
    updates: Partial<CommunicationLog>
  ): Promise<void> {
    const { error } = await supabase
      .from('communication_logs')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
  }

  private async scheduleMessage(logId: string, scheduledAt: Date): Promise<void> {
    // This would integrate with a job queue system like Bull/BullMQ
    // For now, we'll store it in the database and process via cron
    const { error } = await supabase
      .from('communication_jobs')
      .insert({
        type: 'send_message',
        data: { log_id: logId },
        status: 'pending',
        scheduled_at: scheduledAt,
        created_at: new Date()
      });

    if (error) throw error;
  }
}
