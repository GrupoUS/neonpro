import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/lib/supabase/types/database';

// Tipos para melhor type safety
type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

// Query options para listar pacientes com filtros
export const patientsQueryOptions = ({
  page = 1,
  pageSize = 10,
  search = '',
  status,
  sortBy = 'created_at',
  sortOrder = 'desc',
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) =>
  queryOptions({
    queryKey: ['patients', 'list', { page, pageSize, search, status, sortBy, sortOrder }],
    queryFn: async () => {
      let query = supabase.from('patients').select('*', { count: 'exact' });
      
      // Aplicar filtros
      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%,phone_primary.ilike.%${search}%`
        );
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      // Aplicar ordenação
      query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });
      
      // Aplicar paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        patients: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

// Query options para buscar um paciente específico
export const patientQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['patients', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          appointments:appointments(
            id,
            start_time,
            end_time,
            status,
            professional:professionals(*)
          ),
          consent_records:consent_records(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!id, // Só executar se tiver ID
  });

// Query options para buscar pacientes com LGPD compliance
export const patientsLGDPQueryOptions = () =>
  queryOptions({
    queryKey: ['patients', 'lgpd', 'compliance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, email, lgpd_consent_given, lgpd_consent_date')
        .eq('lgpd_consent_given', true);
      
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });

// Query options para estatísticas de pacientes
export const patientStatsQueryOptions = () =>
  queryOptions({
    queryKey: ['patients', 'stats'],
    queryFn: async () => {
      const [
        { count: totalPatients },
        { count: activePatients },
        { count: newThisMonth },
        { count: lgpdCompliant },
      ] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('lgpd_consent_given', true),
      ]);
      
      return {
        total: totalPatients || 0,
        active: activePatients || 0,
        newThisMonth: newThisMonth || 0,
        lgpdCompliant: lgpdCompliant || 0,
        lgpdComplianceRate: totalPatients ? ((lgpdCompliant || 0) / totalPatients) * 100 : 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

// Mutation options para criar paciente
export const createPatientMutationOptions = {
  mutationFn: async (patient: PatientInsert) => {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    // Invalidar queries relacionadas após sucesso
    const { invalidateSupabaseQueries } = require('@/lib/query-client');
    invalidateSupabaseQueries('patients');
  },
  onError: (error: any) => {
    console.error('Error creating patient:', error);
  },
};

// Mutation options para atualizar paciente
export const updatePatientMutationOptions = {
  mutationFn: async ({ id, ...patient }: PatientUpdate & { id: string }) => {
    const { data, error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  onSuccess: (_, variables) => {
    // Invalidar queries relacionadas após sucesso
    const { invalidateSupabaseQueries } = require('@/lib/query-client');
    invalidateSupabaseQueries('patients');
    invalidateSupabaseQueries('patients');
  },
  onError: (error: any) => {
    console.error('Error updating patient:', error);
  },
};

// Mutation options para deletar paciente
export const deletePatientMutationOptions = {
  mutationFn: async (id: string) => {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    
    if (error) throw error;
    return id;
  },
  onSuccess: () => {
    // Invalidar queries relacionadas após sucesso
    const { invalidateSupabaseQueries } = require('@/lib/query-client');
    invalidateSupabaseQueries('patients');
  },
  onError: (error: any) => {
    console.error('Error deleting patient:', error);
  },
};