import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

// Tipos para facilitar o uso no contexto da clínica
export type Patient = Tables<'clients'>; // Alterado de 'patients' para 'clients'
export type Appointment = Tables<'appointments'>;
export type MedicalDocument = Tables<'medical_documents'>; // Alterado de 'medical_histories' para 'medical_documents'
export type Profile = Tables<'profiles'>;

export type PatientInsert = TablesInsert<'clients'>; // Alterado de 'patients' para 'clients'
export type AppointmentInsert = TablesInsert<'appointments'>;
export type MedicalDocumentInsert = TablesInsert<'medical_documents'>; // Alterado de 'medical_histories' para 'medical_documents'

// Serviços para Pacientes (clients)
export const patientService = {
  async getAll(userId: string, filters?: { name?: string; phone?: string }) {
    let query = supabase
      .from('clients') // Alterado de 'patients' para 'clients'
      .select('*')
      .eq('user_id', userId)
      .order('full_name', { ascending: true }); // Alterado de 'name' para 'full_name'

    if (filters?.name) {
      query = query.ilike('full_name', `%${filters.name}%`); // Alterado de 'name' para 'full_name'
    }
    if (filters?.phone) {
      query = query.ilike('phone', `%${filters.phone}%`);
    }

    return query;
  },

  async create(patient: PatientInsert) {
    return supabase
      .from('clients') // Alterado de 'patients' para 'clients'
      .insert(patient)
      .select()
      .single();
  },

  async update(id: string, updates: TablesUpdate<'clients'>) { // Alterado de 'patients' para 'clients'
    return supabase
      .from('clients') // Alterado de 'patients' para 'clients'
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    return supabase
      .from('clients') // Alterado de 'patients' para 'clients'
      .delete()
      .eq('id', id);
  },
};

// Serviços para Agendamentos (appointments)
export const appointmentService = {
  async getAll(userId: string, filters?: { date?: string; status?: string; patientId?: string }) {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        clients (
          id,
          full_name
        ),
        services (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Usando created_at para ordenação inicial
      .order('start_time', { ascending: false }); // Usando start_time para ordenação

    if (filters?.date) {
      query = query.eq('start_time', filters.date);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.patientId) {
      query = query.eq('client_id', filters.patientId);
    }

    return query;
  },

  async create(appointment: AppointmentInsert) {
    return supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
  },

  async update(id: string, updates: TablesUpdate<'appointments'>) {
    return supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    return supabase
      .from('appointments')
      .delete()
      .eq('id', id);
  },
};

// Serviços para Documentos Médicos (medical_documents)
export const medicalHistoryService = { // Renomeado para manter consistência com ClinicAIAssistant
  async getAll(userId: string, patientId?: string) {
    let query = supabase
      .from('medical_documents') // Alterado de 'medical_histories' para 'medical_documents'
      .select('*')
      .eq('client_id', userId) // Assumindo que user_id na tabela medical_documents é client_id
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('client_id', patientId); // Assumindo que patientId é client_id
    }

    return query;
  },

  async create(medicalDocument: MedicalDocumentInsert) { // Alterado o tipo
    return supabase
      .from('medical_documents') // Alterado de 'medical_histories' para 'medical_documents'
      .insert(medicalDocument)
      .select()
      .single();
  },

  async update(id: string, updates: TablesUpdate<'medical_documents'>) { // Alterado o tipo
    return supabase
      .from('medical_documents') // Alterado de 'medical_histories' para 'medical_documents'
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
    return supabase
      .from('medical_documents') // Alterado de 'medical_histories' para 'medical_documents'
      .delete()
      .eq('id', id);
  },
};

// Serviços para Análises da Clínica
export const clinicAnalyticsService = {
  async getClinicSummary(userId: string) {
    const { data: patients } = await patientService.getAll(userId); // patientService agora usa 'clients'
    const { data: appointments } = await appointmentService.getAll(userId);

    return {
      totalPatients: patients?.length || 0,
      totalAppointments: appointments?.length || 0,
      pendingAppointments: appointments?.filter(a => a.status === 'pending').length || 0,
      completedAppointments: appointments?.filter(a => a.status === 'completed').length || 0,
    };
  },

  async getAppointmentsByService(userId: string, startDate: string, endDate: string) {
    const { data } = await supabase
      .from('appointments')
      .select('service_id') // Alterado de 'service' para 'service_id'
      .eq('user_id', userId)
      .gte('created_at', startDate) // Usando created_at para data
      .lte('created_at', endDate); // Usando created_at para data

    if (!data) return [];

    const serviceCounts = data.reduce((acc, app) => {
      const serviceName = app.service_id || 'Outro'; // Alterado de 'service' para 'service_id'
      acc[serviceName] = (acc[serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(serviceCounts).map(([service, count]) => ({
      service,
      count
    }));
  },
};

// Serviço para o Chat AI acessar dados da clínica
export const clinicDataService = {
  async getUserClinicContext(userId: string) {
    const [
      profileResult,
      patientsResult,
      appointmentsResult,
      medicalDocumentsResult, // Alterado de medicalHistoriesResult
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(), // profiles.id é o user_id
      patientService.getAll(userId),
      appointmentService.getAll(userId),
      medicalHistoryService.getAll(userId), // medicalHistoryService agora usa 'medical_documents'
    ]);

    const summary = await clinicAnalyticsService.getClinicSummary(userId);

    return {
      profile: profileResult.data,
      patients: patientsResult.data || [],
      appointments: appointmentsResult.data || [],
      medicalDocuments: medicalDocumentsResult.data || [], // Alterado de medicalHistories
      summary
    };
  }
};
