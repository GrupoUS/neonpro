/**
 * Patient History Service
 * Service layer for advanced patient medical history and treatment tracking
 */

import { supabase } from '@/lib/supabase';
import type {
  MedicalRecord,
  TreatmentPlan,
  ProgressNote,
  PatientAllergy,
  PatientCondition,
  PatientTimeline,
  PatientSummary,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  CreateTreatmentPlanRequest,
  UpdateTreatmentPlanRequest,
  CreateProgressNoteRequest,
  PatientHistoryFilters,
} from '@/types/patient-history';

export class PatientHistoryService {
  /**
   * Get medical records for a patient
   */
  static async getMedicalRecords(
    patientId: string,
    filters?: PatientHistoryFilters
  ): Promise<MedicalRecord[]> {
    let query = supabase
      .from('medical_records')
      .select(`
        *,
        professional:profiles!medical_records_professional_id_fkey(name),
        appointment:appointments(appointment_date, service_type:service_types(name))
      `)
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false });

    if (filters?.record_type) {
      query = query.eq('record_type', filters.record_type);
    }

    if (filters?.professional_id) {
      query = query.eq('professional_id', filters.professional_id);
    }

    if (filters?.start_date) {
      query = query.gte('record_date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('record_date', filters.end_date);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching medical records:', error);
      throw new Error(`Failed to fetch medical records: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new medical record
   */
  static async createMedicalRecord(
    patientId: string,
    clinicId: string,
    request: CreateMedicalRecordRequest
  ): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: patientId,
        clinic_id: clinicId,
        ...request,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating medical record:', error);
      throw new Error(`Failed to create medical record: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a medical record
   */
  static async updateMedicalRecord(
    id: string,
    request: UpdateMedicalRecordRequest
  ): Promise<MedicalRecord> {
    const { data, error } = await supabase
      .from('medical_records')
      .update({
        ...request,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating medical record:', error);
      throw new Error(`Failed to update medical record: ${error.message}`);
    }

    return data;
  }

  /**
   * Get treatment plans for a patient
   */
  static async getTreatmentPlans(patientId: string): Promise<TreatmentPlan[]> {
    const { data, error } = await supabase
      .from('treatment_plans')
      .select(`
        *,
        professional:profiles!treatment_plans_professional_id_fkey(name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching treatment plans:', error);
      throw new Error(`Failed to fetch treatment plans: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new treatment plan
   */
  static async createTreatmentPlan(
    patientId: string,
    clinicId: string,
    request: CreateTreatmentPlanRequest
  ): Promise<TreatmentPlan> {
    const { data, error } = await supabase
      .from('treatment_plans')
      .insert({
        patient_id: patientId,
        clinic_id: clinicId,
        overall_status: 'planned',
        progress_percentage: 0,
        ...request,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating treatment plan:', error);
      throw new Error(`Failed to create treatment plan: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a treatment plan
   */
  static async updateTreatmentPlan(
    id: string,
    request: UpdateTreatmentPlanRequest
  ): Promise<TreatmentPlan> {
    const { data, error } = await supabase
      .from('treatment_plans')
      .update({
        ...request,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating treatment plan:', error);
      throw new Error(`Failed to update treatment plan: ${error.message}`);
    }

    return data;
  }

  /**
   * Get progress notes for a patient
   */
  static async getProgressNotes(
    patientId: string,
    treatmentPlanId?: string
  ): Promise<ProgressNote[]> {
    let query = supabase
      .from('progress_notes')
      .select(`
        *,
        professional:profiles!progress_notes_professional_id_fkey(name),
        treatment_plan:treatment_plans(name)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (treatmentPlanId) {
      query = query.eq('treatment_plan_id', treatmentPlanId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching progress notes:', error);
      throw new Error(`Failed to fetch progress notes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new progress note
   */
  static async createProgressNote(
    patientId: string,
    request: CreateProgressNoteRequest
  ): Promise<ProgressNote> {
    const { data, error } = await supabase
      .from('progress_notes')
      .insert({
        patient_id: patientId,
        ...request,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating progress note:', error);
      throw new Error(`Failed to create progress note: ${error.message}`);
    }

    return data;
  }

  /**
   * Get patient allergies
   */
  static async getPatientAllergies(patientId: string): Promise<PatientAllergy[]> {
    const { data, error } = await supabase
      .from('patient_allergies')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patient allergies:', error);
      throw new Error(`Failed to fetch patient allergies: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Add patient allergy
   */
  static async addPatientAllergy(
    patientId: string,
    allergy: Omit<PatientAllergy, 'id' | 'patient_id' | 'created_at' | 'updated_at'>
  ): Promise<PatientAllergy> {
    const { data, error } = await supabase
      .from('patient_allergies')
      .insert({
        patient_id: patientId,
        ...allergy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding patient allergy:', error);
      throw new Error(`Failed to add patient allergy: ${error.message}`);
    }

    return data;
  }

  /**
   * Get patient conditions
   */
  static async getPatientConditions(patientId: string): Promise<PatientCondition[]> {
    const { data, error } = await supabase
      .from('patient_conditions')
      .select('*')
      .eq('patient_id', patientId)
      .order('diagnosis_date', { ascending: false });

    if (error) {
      console.error('Error fetching patient conditions:', error);
      throw new Error(`Failed to fetch patient conditions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Add patient condition
   */
  static async addPatientCondition(
    patientId: string,
    condition: Omit<PatientCondition, 'id' | 'patient_id' | 'created_at' | 'updated_at'>
  ): Promise<PatientCondition> {
    const { data, error } = await supabase
      .from('patient_conditions')
      .insert({
        patient_id: patientId,
        ...condition,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding patient condition:', error);
      throw new Error(`Failed to add patient condition: ${error.message}`);
    }

    return data;
  }

  /**
   * Get patient timeline
   */
  static async getPatientTimeline(patientId: string): Promise<PatientTimeline> {
    const { data, error } = await supabase.rpc('get_patient_timeline', {
      p_patient_id: patientId,
    });

    if (error) {
      console.error('Error fetching patient timeline:', error);
      throw new Error(`Failed to fetch patient timeline: ${error.message}`);
    }

    return data || { patient_id: patientId, events: [] };
  }

  /**
   * Get patient summary
   */
  static async getPatientSummary(patientId: string): Promise<PatientSummary> {
    const { data, error } = await supabase.rpc('get_patient_summary', {
      p_patient_id: patientId,
    });

    if (error) {
      console.error('Error fetching patient summary:', error);
      throw new Error(`Failed to fetch patient summary: ${error.message}`);
    }

    return data || {
      patient_id: patientId,
      name: '',
      age: 0,
      gender: '',
      active_conditions: [],
      active_allergies: [],
      current_medications: [],
      active_treatments: [],
      recent_appointments: [],
      overall_progress: 'satisfactory',
      risk_factors: [],
      total_appointments: 0,
      total_treatments: 0,
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Upload medical record attachment
   */
  static async uploadAttachment(
    recordId: string,
    file: File,
    description?: string
  ): Promise<{ id: string; url: string }> {
    // Upload file to storage
    const fileName = `medical-records/${recordId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('medical-attachments')
      .getPublicUrl(fileName);

    // Save attachment record
    const { data, error } = await supabase
      .from('medical_record_attachments')
      .insert({
        medical_record_id: recordId,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        url: urlData.publicUrl,
        description: description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving attachment record:', error);
      throw new Error(`Failed to save attachment record: ${error.message}`);
    }

    return { id: data.id, url: urlData.publicUrl };
  }
}

export const patientHistoryService = PatientHistoryService;
