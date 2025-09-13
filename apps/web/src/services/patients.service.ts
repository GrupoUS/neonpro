/**
 * Patient Service - Database operations for patient management
 * Implements healthcare-specific patterns with LGPD compliance
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type PatientRow = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];

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
      const patientData: PatientInsert = {
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
   * Log patient actions for audit trail
   */
  private async logPatientAction(
    action: string,
    patientId: string,
    userId: string,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        table_name: 'patients',
        record_id: patientId,
        action: action.toUpperCase(),
        user_id: userId,
        new_values: metadata || {},
        phi_accessed: true, // Patient data is PHI
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging patient action:', error);
      // Don't throw error for audit logging failures
    }
  }
}

export const patientService = new PatientService();
