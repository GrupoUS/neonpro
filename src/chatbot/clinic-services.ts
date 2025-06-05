
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

// Tipos de Profile (adaptado para o contexto clínico)
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Tipos de Insert (adaptados para o contexto clínico)
export type AppointmentInsert = Database['public']['Tables']['agendamentos']['Insert'];
export type PatientInsert = Database['public']['Tables']['pacientes']['Insert'];
export type ServiceInsert = Database['public']['Tables']['servicos']['Insert'];

// --- Serviços de Dados Clínicos ---

// Serviço para obter contexto clínico completo do usuário
export const clinicDataService = {
  async getUserClinicContext(userId: string) {
    try {
      // Obter perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        // Não throw error aqui, continue com profile null
      }

      // Obter agendamentos do usuário
      const { data: appointments, error: appointmentsError } = await supabase
        .from('agendamentos')
        .select(`
          *,
          pacientes(nome),
          servicos(nome_servico, preco)
        `)
        .eq('user_id', userId)
        .order('data_hora', { ascending: true });

      if (appointmentsError) {
        console.error('Erro ao buscar agendamentos:', appointmentsError);
      }

      // Obter pacientes do usuário
      const { data: patients, error: patientsError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('user_id', userId);

      if (patientsError) {
        console.error('Erro ao buscar pacientes:', patientsError);
      }

      // Obter serviços do usuário
      const { data: services, error: servicesError } = await supabase
        .from('servicos')
        .select('*')
        .eq('user_id', userId);

      if (servicesError) {
        console.error('Erro ao buscar serviços:', servicesError);
      }

      // Calcular resumo clínico
      const totalAppointments = appointments?.length || 0;
      const totalPatients = patients?.length || 0;
      const totalRevenue = 0; // Placeholder - calcular baseado nos agendamentos quando necessário

      const summary = {
        totalAppointments,
        totalPatients,
        totalRevenue,
      };

      return {
        profile: profile || null,
        appointments: appointments || [],
        patients: patients || [],
        services: services || [],
        summary,
      };
    } catch (error) {
      console.error('Erro ao obter contexto clínico:', error);
      return {
        profile: null,
        appointments: [],
        patients: [],
        services: [],
        summary: {
          totalAppointments: 0,
          totalPatients: 0,
          totalRevenue: 0,
        },
      };
    }
  },
};

// Serviço para agendamentos
export const appointmentService = {
  async create(appointment: AppointmentInsert) {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert(appointment)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        pacientes(nome),
        servicos(nome_servico, preco)
      `)
      .eq('user_id', userId)
      .order('data_hora', { ascending: true });
    if (error) throw error;
    return { data };
  },
  async delete(id: string) {
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { error: null };
  },
};

// Serviço para pacientes
export const patientService = {
  async create(patient: PatientInsert) {
    const { data, error } = await supabase
      .from('pacientes')
      .insert(patient)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('user_id', userId)
      .order('nome', { ascending: true });
    if (error) throw error;
    return { data };
  },
  async delete(id: string) {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { error: null };
  },
};

// Serviço para serviços (procedimentos)
export const serviceService = {
  async create(service: ServiceInsert) {
    const { data, error } = await supabase
      .from('servicos')
      .insert(service)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('user_id', userId)
      .order('nome_servico', { ascending: true });
    if (error) throw error;
    return { data };
  },
  async delete(id: string) {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { error: null };
  },
};

// Serviço de análise (placeholder, adaptar conforme necessário)
export const analyticsService = {
  async getClinicSummary(userId: string) {
    // Implementar lógica para obter resumo clínico
    return {
      totalAppointments: 0,
      totalPatients: 0,
      totalRevenue: 0,
    };
  },
};
