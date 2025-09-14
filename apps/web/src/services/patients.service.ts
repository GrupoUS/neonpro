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
   * Generate unique medical record number
   */
  private async generateMedicalRecordNumber(clinicId: string): Promise<string> {
    try {
      // Get the clinic's prefix or use a default
      const { data: clinic } = await supabase
        .from('clinics')
        .select('clinic_name')
        .eq('id', clinicId)
        .single();

      const prefix = clinic?.clinic_name?.substring(0, 3).toUpperCase() || 'NP';
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

      return `${prefix}${timestamp}${random}`;
    } catch (error) {
      console.error('Error generating medical record number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now().toString().slice(-8);
      return `NP${timestamp}`;
    }
  }

  /**
   * Parse full name into given names and family name
   */
  private parseFullName(fullName: string): { givenNames: string[]; familyName: string } {
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);

    if (nameParts.length === 0) {
      throw new Error('Nome completo é obrigatório');
    }

    if (nameParts.length === 1) {
      return {
        givenNames: [nameParts[0]],
        familyName: nameParts[0], // Use same name as family name if only one name provided
      };
    }

    // Last name is family name, rest are given names
    const familyName = nameParts[nameParts.length - 1];
    const givenNames = nameParts.slice(0, -1);

    return { givenNames, familyName };
  }

  /**
   * Create new patient
   */
  async createPatient(data: CreatePatientData, clinicId: string, userId: string): Promise<Patient> {
    try {
      // Parse full name into required format
      const { givenNames, familyName } = this.parseFullName(data.fullName);

      // Generate medical record number
      const medicalRecordNumber = await this.generateMedicalRecordNumber(clinicId);

      // Prepare patient data according to database schema
      const patientData: any = {
        clinic_id: clinicId,
        medical_record_number: medicalRecordNumber,
        given_names: givenNames,
        family_name: familyName,
        full_name: data.fullName.trim(),
        email: data.email || null,
        phone_primary: data.phone || null,
        birth_date: data.birthDate || null,
        cpf: data.cpf || null,
        created_by: userId,
        lgpd_consent_given: true, // Assume consent given during creation
        data_consent_status: 'granted',
        is_active: true,
        patient_status: 'active',
        registration_source: 'manual',
      };

      console.log('🔧 Creating patient with data:', patientData);

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
        console.error('❌ Error creating patient:', error);
        throw new Error(`Failed to create patient: ${error.message}`);
      }

      console.log('✅ Patient created successfully:', patient);

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
        date: appointment.start_time || new Date().toISOString(),
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
