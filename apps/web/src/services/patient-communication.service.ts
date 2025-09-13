// @ts-nocheck
/**
 * Patient Communication Service
 * Service layer for SMS/Email notifications and patient communication
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  CommunicationTemplate,
  CommunicationMessage,
  CommunicationSettings,
  PatientCommunicationPreferences,
  CreateCommunicationTemplateRequest,
  UpdateCommunicationTemplateRequest,
  SendMessageRequest,
  CommunicationFilters,
  CommunicationStats,
} from '@/types/patient-communication';

export class PatientCommunicationService {
  private static sb: any = supabase;
  /**
   * Get all communication templates for a clinic
   */
  static async getCommunicationTemplates(
    clinicId: string,
    filters?: { message_type?: string; communication_type?: string; is_active?: boolean }
  ): Promise<CommunicationTemplate[]> {
    let query = this.sb
      .from('communication_templates')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (filters?.message_type) {
      query = query.eq('message_type', filters.message_type);
    }

    if (filters?.communication_type) {
      query = query.eq('communication_type', filters.communication_type);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching communication templates:', error);
      throw new Error(`Failed to fetch communication templates: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new communication template
   */
  static async createCommunicationTemplate(
    clinicId: string,
    request: CreateCommunicationTemplateRequest
  ): Promise<CommunicationTemplate> {
    const { data, error } = await this.sb
      .from('communication_templates')
      .insert({
        clinic_id: clinicId,
        ...request,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating communication template:', error);
      throw new Error(`Failed to create communication template: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a communication template
   */
  static async updateCommunicationTemplate(
    id: string,
    request: UpdateCommunicationTemplateRequest
  ): Promise<CommunicationTemplate> {
    const { data, error } = await this.sb
      .from('communication_templates')
      .update({
        ...request,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating communication template:', error);
      throw new Error(`Failed to update communication template: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a communication template
   */
  static async deleteCommunicationTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('communication_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting communication template:', error);
      throw new Error(`Failed to delete communication template: ${error.message}`);
    }
  }

  /**
   * Send a message to a patient
   */
  static async sendMessage(
    clinicId: string,
    request: SendMessageRequest
  ): Promise<CommunicationMessage> {
    const { data, error } = await this.sb.rpc('send_patient_message', {
      p_clinic_id: clinicId,
      p_patient_id: request.patient_id,
      p_appointment_id: request.appointment_id,
      p_template_id: request.template_id,
      p_message_type: request.message_type,
      p_communication_type: request.communication_type,
      p_subject: request.subject,
      p_content: request.content,
      p_scheduled_at: request.scheduled_at,
      p_variables: request.variables,
    });

    if (error) {
      console.error('Error sending message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }

    return data;
  }

  /**
   * Get communication messages with filters
   */
  static async getCommunicationMessages(
    clinicId: string,
    filters?: CommunicationFilters
  ): Promise<CommunicationMessage[]> {
    let query = this.sb
      .from('communication_messages')
      .select(`
        *,
        patient:patients(name, phone, email),
        appointment:appointments(appointment_date, service_type:service_types(name))
      `)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (filters?.message_type) {
      query = query.eq('message_type', filters.message_type);
    }

    if (filters?.communication_type) {
      query = query.eq('communication_type', filters.communication_type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }

    if (filters?.appointment_id) {
      query = query.eq('appointment_id', filters.appointment_id);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    if (filters?.search) {
      query = query.or(`recipient_name.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching communication messages:', error);
      throw new Error(`Failed to fetch communication messages: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get communication settings for a clinic
   */
  static async getCommunicationSettings(clinicId: string): Promise<CommunicationSettings | null> {
    const { data, error } = await this.sb
      .from('communication_settings')
      .select('*')
      .eq('clinic_id', clinicId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching communication settings:', error);
      throw new Error(`Failed to fetch communication settings: ${error.message}`);
    }

    return data;
  }

  /**
   * Update communication settings
   */
  static async updateCommunicationSettings(
    clinicId: string,
    settings: Partial<CommunicationSettings>
  ): Promise<CommunicationSettings> {
    const { data, error } = await this.sb
      .from('communication_settings')
      .upsert({
        clinic_id: clinicId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating communication settings:', error);
      throw new Error(`Failed to update communication settings: ${error.message}`);
    }

    return data;
  }

  /**
   * Get patient communication preferences
   */
  static async getPatientCommunicationPreferences(
    patientId: string
  ): Promise<PatientCommunicationPreferences | null> {
    const { data, error } = await this.sb
      .from('patient_communication_preferences')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching patient communication preferences:', error);
      throw new Error(`Failed to fetch patient communication preferences: ${error.message}`);
    }

    return data;
  }

  /**
   * Update patient communication preferences
   */
  static async updatePatientCommunicationPreferences(
    patientId: string,
    preferences: Partial<PatientCommunicationPreferences>
  ): Promise<PatientCommunicationPreferences> {
    const { data, error } = await this.sb
      .from('patient_communication_preferences')
      .upsert({
        patient_id: patientId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating patient communication preferences:', error);
      throw new Error(`Failed to update patient communication preferences: ${error.message}`);
    }

    return data;
  }

  /**
   * Get communication statistics
   */
  static async getCommunicationStats(
    clinicId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CommunicationStats> {
    const { data, error } = await this.sb.rpc('get_communication_stats', {
      p_clinic_id: clinicId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error fetching communication stats:', error);
      throw new Error(`Failed to fetch communication stats: ${error.message}`);
    }

    return data || {
      clinic_id: clinicId,
      period_start: startDate || new Date().toISOString(),
      period_end: endDate || new Date().toISOString(),
      total_messages: 0,
      messages_sent: 0,
      messages_delivered: 0,
      messages_read: 0,
      messages_failed: 0,
      stats_by_type: [],
      stats_by_channel: [],
      total_cost: 0,
      cost_by_channel: [],
      avg_delivery_time: 0,
      avg_read_time: 0,
      opt_out_rate: 0,
    };
  }

  /**
   * Schedule appointment reminders
   */
  static async scheduleAppointmentReminders(
    clinicId: string,
    appointmentId: string
  ): Promise<{ scheduled_count: number }> {
    const { data, error } = await this.sb.rpc('schedule_appointment_reminders', {
      p_clinic_id: clinicId,
      p_appointment_id: appointmentId,
    });

    if (error) {
      console.error('Error scheduling appointment reminders:', error);
      throw new Error(`Failed to schedule appointment reminders: ${error.message}`);
    }

    return data || { scheduled_count: 0 };
  }

  /**
   * Cancel scheduled messages
   */
  static async cancelScheduledMessages(
    appointmentId: string,
    messageTypes?: string[]
  ): Promise<{ cancelled_count: number }> {
    const { data, error } = await this.sb.rpc('cancel_scheduled_messages', {
      p_appointment_id: appointmentId,
      p_message_types: messageTypes,
    });

    if (error) {
      console.error('Error cancelling scheduled messages:', error);
      throw new Error(`Failed to cancel scheduled messages: ${error.message}`);
    }

    return data || { cancelled_count: 0 };
  }
}

export const patientCommunicationService = PatientCommunicationService;
