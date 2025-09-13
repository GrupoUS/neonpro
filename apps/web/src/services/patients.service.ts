/**
 * Patient Service - Database operations for patient management
 * Implements healthcare-specific patterns with LGPD compliance
 */

import { supabase } from '@/integrations/supabase/client';
// import type { Database } from '@/integrations/supabase/types';

// // type PatientRow = Database['public']['Tables']['patients']['Row'];
// type PatientInsert = Database['public']['Tables']['patients']['Insert'];

export interface Patient {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  createdAt: string;
}

export interface CreatePatientData {
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
}

export interface PatientAppointmentHistory {
  id: string;
  date: string;
  serviceName: string;
  professionalName: string;
  status: string;
  notes?: string;
}

class PatientService {
  /**
   * Search patients by name or phone
   */
  async searchPatients(clinicId: string, query: string, limit = 10): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          full_name,
          email,
          phone_primary,
          birth_date,
          cpf,
          created_at
        `)
        .eq('clinic_id', clinicId)
        .or(`full_name.ilike.%${query}%,phone_primary.ilike.%${query}%`)
        .limit(limit)
        .order('full_name');

      if (error) {
        console.error('Error searching patients:', error);
        throw new Error(`Failed to search patients: ${error.message}`);
      }

      return (data || []).map(patient => ({
        id: patient.id,
        fullName: patient.full_name,
        email: patient.email || undefined,
        phone: patient.phone_primary || undefined,
        birthDate: patient.birth_date || undefined,
        cpf: patient.cpf || undefined,
        createdAt: patient.created_at || '',
      }));
    } catch (error) {
      console.error('Error in searchPatients:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(patientId: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          full_name,
          email,
          phone_primary,
          birth_date,
          cpf,
          created_at
        `)
        .eq('id', patientId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Patient not found
        }
        console.error('Error getting patient:', error);
        throw new Error(`Failed to get patient: ${error.message}`);
      }

      return {
        id: data.id,
        fullName: data.full_name,
        email: data.email || undefined,
        phone: data.phone_primary || undefined,
        birthDate: data.birth_date || undefined,
        cpf: data.cpf || undefined,
        createdAt: data.created_at || '',
      };
    } catch (error) {
      console.error('Error in getPatient:', error);
      throw error;
    }
  }

  /**
   * Create new patient
   */
  async createPatient(data: CreatePatientData, clinicId: string, userId: string): Promise<Patient> {
    try {
      // Note: Some fields may be optional in current schema; casting to PatientInsert for flexibility
      const patientData: any = {
        clinic_id: clinicId,
        full_name: data.fullName,
        email: data.email || null,
        phone_primary: data.phone || null,
        birth_date: data.birthDate || null,
        cpf: data.cpf || null,
        created_by: userId,
        lgpd_consent_given: true, // Assume consent given during creation
        data_consent_status: 'granted',
      };

      const { data: patient, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select(`
          id,
          full_name,
          email,
          phone_primary,
          birth_date,
          cpf,
          created_at
        `)
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        throw new Error(`Failed to create patient: ${error.message}`);
      }

      // Log audit trail
      await this.logPatientAction('create', patient.id, userId, data);

      return {
        id: patient.id,
        fullName: patient.full_name,
        email: patient.email || undefined,
        phone: patient.phone_primary || undefined,
        birthDate: patient.birth_date || undefined,
        cpf: patient.cpf || undefined,
        createdAt: patient.created_at || '',
      };
    } catch (error) {
      console.error('Error in createPatient:', error);
      throw error;
    }
  }

  /**
   * Get patient appointment history
   */
  async getPatientAppointmentHistory(
    patientId: string,
    limit = 10,
  ): Promise<PatientAppointmentHistory[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          status,
          notes,
          service_types (
            name
          ),
          professionals (
            full_name
          )
        `)
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting patient appointment history:', error);
        throw new Error(`Failed to get patient appointment history: ${error.message}`);
      }

      return (data || []).map(appointment => ({
        id: appointment.id,
        date: appointment.start_time,
        serviceName: appointment.service_types?.name || 'Serviço não especificado',
        professionalName: appointment.professionals?.full_name || 'Profissional não especificado',
        status: appointment.status || 'scheduled',
        notes: appointment.notes || undefined,
      }));
    } catch (error) {
      console.error('Error in getPatientAppointmentHistory:', error);
      throw error;
    }
  }

  /**
   * Log patient actions for audit trail
   */
  private async logPatientAction(
    action: string,
    patientId: string,
    userId: string,
    metadata?: any,
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        // table_name removed: not part of current type
        record_id: patientId,
        action: action.toUpperCase(),
        user_id: userId,
        new_values: metadata || {},
        phi_accessed: true, // Patient data is PHI
        created_at: new Date().toISOString(),
      } as any);
    } catch (error) {
      console.error('Error logging patient action:', error);
      // Don't throw error for audit logging failures
    }
  }
}

export const patientService = new PatientService();
