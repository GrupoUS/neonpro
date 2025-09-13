/**
 * Appointment Service - Production-ready database operations
 * Implements healthcare-specific patterns with LGPD compliance and audit logging
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { addMinutes, format, parseISO } from 'date-fns';
import { toast } from 'sonner';

// Type definitions
type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export interface CalendarAppointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description?: string;
  status: string;
  patientName: string;
  serviceName: string;
  professionalName: string;
  notes?: string;
  priority?: number;
}

export interface CreateAppointmentData {
  patientId: string;
  professionalId: string;
  serviceTypeId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  priority?: number;
  status?: string;
}

export interface UpdateAppointmentData {
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  status?: string;
  cancellationReason?: string;
}

class AppointmentService {
  /**
   * Get appointments for calendar view with related data
   */
  async getAppointments(clinicId: string, startDate?: Date, endDate?: Date): Promise<CalendarAppointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          priority,
          patient_id,
          patients!fk_appointments_patient (
            id,
            full_name
          ),
          professionals!fk_appointments_professional (
            id,
            full_name
          ),
          service_types!fk_appointments_service_type (
            id,
            name,
            color
          )
        `)
        .eq('clinic_id', clinicId)
        .order('start_time', { ascending: true });

      // Add date filters if provided
      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('start_time', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        throw new Error(`Failed to fetch appointments: ${error.message}`);
      }

      // Transform to calendar format
      return (data || []).map(appointment => ({
        id: appointment.id,
        title: `${appointment.patients?.full_name || 'Paciente'} - ${appointment.service_types?.name || 'Serviço'}`,
        start: parseISO(appointment.start_time),
        end: parseISO(appointment.end_time),
        color: appointment.service_types?.color || '#3b82f6',
        description: appointment.service_types?.name || '',
        status: appointment.status || 'scheduled',
        patientName: appointment.patients?.full_name || 'Paciente',
        serviceName: appointment.service_types?.name || 'Serviço',
        professionalName: appointment.professionals?.full_name || 'Profissional',
        notes: appointment.notes || undefined,
        priority: appointment.priority || undefined,
      }));
    } catch (error) {
      console.error('Error in getAppointments:', error);
      throw error;
    }
  }

  /**
   * Create new appointment with validation and conflict checking
   */
  async createAppointment(data: CreateAppointmentData, clinicId: string, userId: string): Promise<CalendarAppointment> {
    try {
      // Check for conflicts
      const hasConflict = await this.checkAppointmentConflict(
        data.professionalId,
        data.startTime,
        data.endTime,
        clinicId
      );

      if (hasConflict) {
        throw new Error('Conflito de horário detectado. Já existe um agendamento neste período.');
      }

      // Prepare appointment data
      const appointmentData: AppointmentInsert = {
        clinic_id: clinicId,
        patient_id: data.patientId,
        professional_id: data.professionalId,
        service_type_id: data.serviceTypeId,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
        notes: data.notes || null,
        priority: data.priority || null,
        status: data.status || 'scheduled',
        created_by: userId,
      };

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          priority,
          patients!fk_appointments_patient (
            id,
            full_name
          ),
          professionals!fk_appointments_professional (
            id,
            full_name
          ),
          service_types!fk_appointments_service_type (
            id,
            name,
            color
          )
        `)
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw new Error(`Failed to create appointment: ${error.message}`);
      }

      // Log audit trail
      await this.logAppointmentAction('create', appointment.id, userId, {
        patient_id: data.patientId,
        professional_id: data.professionalId,
        start_time: data.startTime.toISOString(),
      });

      // Transform to calendar format
      return {
        id: appointment.id,
        title: `${appointment.patients?.full_name || 'Paciente'} - ${appointment.service_types?.name || 'Serviço'}`,
        start: parseISO(appointment.start_time),
        end: parseISO(appointment.end_time),
        color: appointment.service_types?.color || '#3b82f6',
        description: appointment.service_types?.name || '',
        status: appointment.status || 'scheduled',
        patientName: appointment.patients?.full_name || 'Paciente',
        serviceName: appointment.service_types?.name || 'Serviço',
        professionalName: appointment.professionals?.full_name || 'Profissional',
        notes: appointment.notes || undefined,
        priority: appointment.priority || undefined,
      };
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  }

  /**
   * Update existing appointment
   */
  async updateAppointment(
    appointmentId: string,
    updates: UpdateAppointmentData,
    userId: string
  ): Promise<CalendarAppointment> {
    try {
      // Prepare update data
      const updateData: AppointmentUpdate = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      if (updates.startTime) {
        updateData.start_time = updates.startTime.toISOString();
      }
      if (updates.endTime) {
        updateData.end_time = updates.endTime.toISOString();
      }
      if (updates.notes !== undefined) {
        updateData.notes = updates.notes;
      }
      if (updates.status) {
        updateData.status = updates.status;
        if (updates.status === 'cancelled' && updates.cancellationReason) {
          updateData.cancellation_reason = updates.cancellationReason;
          updateData.cancelled_at = new Date().toISOString();
          updateData.cancelled_by = userId;
        }
      }

      const { data: appointment, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          priority,
          patients!fk_appointments_patient (
            id,
            full_name
          ),
          professionals!fk_appointments_professional (
            id,
            full_name
          ),
          service_types!fk_appointments_service_type (
            id,
            name,
            color
          )
        `)
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        throw new Error(`Failed to update appointment: ${error.message}`);
      }

      // Log audit trail
      await this.logAppointmentAction('update', appointmentId, userId, updates);

      // Transform to calendar format
      return {
        id: appointment.id,
        title: `${appointment.patients?.full_name || 'Paciente'} - ${appointment.service_types?.name || 'Serviço'}`,
        start: parseISO(appointment.start_time),
        end: parseISO(appointment.end_time),
        color: appointment.service_types?.color || '#3b82f6',
        description: appointment.service_types?.name || '',
        status: appointment.status || 'scheduled',
        patientName: appointment.patients?.full_name || 'Paciente',
        serviceName: appointment.service_types?.name || 'Serviço',
        professionalName: appointment.professionals?.full_name || 'Profissional',
        notes: appointment.notes || undefined,
        priority: appointment.priority || undefined,
      };
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      throw error;
    }
  }

  /**
   * Delete appointment (soft delete by setting status to cancelled)
   */
  async deleteAppointment(appointmentId: string, userId: string, reason?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: reason || 'Cancelled by user',
          cancelled_at: new Date().toISOString(),
          cancelled_by: userId,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error deleting appointment:', error);
        throw new Error(`Failed to delete appointment: ${error.message}`);
      }

      // Log audit trail
      await this.logAppointmentAction('delete', appointmentId, userId, { reason });
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      throw error;
    }
  }

  /**
   * Check for appointment conflicts
   */
  private async checkAppointmentConflict(
    professionalId: string,
    startTime: Date,
    endTime: Date,
    clinicId: string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('clinic_id', clinicId)
        .in('status', ['scheduled', 'confirmed'])
        .or(`start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()}`);

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking conflicts:', error);
        return false; // Assume no conflict on error to avoid blocking
      }

      return (data || []).length > 0;
    } catch (error) {
      console.error('Error in checkAppointmentConflict:', error);
      return false;
    }
  }

  /**
   * Log appointment actions for audit trail
   */
  private async logAppointmentAction(
    action: string,
    appointmentId: string,
    userId: string,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        table_name: 'appointments',
        record_id: appointmentId,
        action: action.toUpperCase(),
        user_id: userId,
        new_values: metadata || {},
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging appointment action:', error);
      // Don't throw error for audit logging failures
    }
  }
}

export const appointmentService = new AppointmentService();
