import { supabase } from '@/integrations/supabase/client';
// import type { Database } from '@/lib/supabase/types/database';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Hook genérico para queries do Supabase
import { patientService } from '@/services/patients.service';

export function useSupabaseQuery<T = any>(
  queryKey: string[],
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options = {},
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await queryFn();
      if (result.error) throw result.error;
      return result.data;
    },
    ...options,
  });
}

// Hook genérico para queries com real-time
export function useSupabaseRealTimeQuery<T = any>(
  queryKey: string[],
  table: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options = {},
) {
  const queryClient = useQueryClient();

  // Configurar real-time subscription
  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        () => {
          // Invalidar query quando houver mudanças
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const query = useSupabaseQuery<T>(queryKey, queryFn, {
    ...options,
    // Configurar refetch baseado em real-time
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return { ...query, setupRealTimeSubscription };
}

// Hook para queries de pacientes
export function usePatients(options = {}) {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const result = await patientService.listPatients({
        page: 1,
        limit: 100, // Get more patients by default
        sortBy: 'name',
        sortOrder: 'asc',
      });

      return result.patients;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Hook para queries de agendamentos
export function useAppointments(options = {}): any {
  return useSupabaseQuery(
    ['appointments'],
    async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          patient:patients(*),
          professional:professionals(*),
          service:services(*)
        `,
        )
        .order('start_time', { ascending: true });

      return { data, error };
    },
    {
      staleTime: 2 * 60 * 1000,
      ...options,
    },
  );
}

// Hook para agendamentos do dia com real-time
export function useTodayAppointments(professionalId: string | undefined): any {
  return useSupabaseRealTimeQuery(
    ['appointments', 'today', professionalId ?? 'all'],
    'appointments',
    async () => {
      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('appointments')
        .select(
          `
          *,
          patient:patients(*),
          professional:professionals(*),
          service:services(*)
        `,
        )
        .gte('start_time', `${today}T00:00:00`)
        .lte('start_time', `${today}T23:59:59`)
        .order('start_time', { ascending: true });

      if (professionalId) {
        query = query.eq('professional_id', professionalId);
      }

      const { data, error } = await query;

      return { data, error };
    },
    {
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
    },
  );
}

// Hook para estatísticas com real-time
export function useStats() {
  return useSupabaseRealTimeQuery(
    ['stats'],
    'patients',
    async () => {
      const [
        { count: totalPatients },
        { count: totalAppointments },
        { count: todayAppointments },
      ] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte(
            'start_time',
            new Date().toISOString().split('T')[0] + 'T00:00:00',
          ),
      ]);

      return {
        data: {
          totalPatients: totalPatients || 0,
          totalAppointments: totalAppointments || 0,
          todayAppointments: todayAppointments || 0,
        },
        error: null,
      };
    },
    {
      staleTime: 5 * 60 * 1000,
    },
  );
}

// Hook genérico para mutations do Supabase
export function useSupabaseMutation(
  table: string,
  options: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    invalidateQueries?: string[][];
  } = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      id,
      action,
    }: {
      data?: any;
      id?: string;
      action: 'create' | 'update' | 'delete';
    }) => {
      let result;

      switch (action) {
        case 'create':
          result = await (supabase as any)
            .from(table)
            .insert([data])
            .select()
            .single();
          break;
        case 'update':
          if (!id) throw new Error('ID is required for update');
          result = await (supabase as any)
            .from(table)
            .update(data)
            .eq('id', id)
            .select()
            .single();
          break;
        case 'delete':
          if (!id) throw new Error('ID is required for delete');
          result = await (supabase as any).from(table).delete().eq('id', id);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(_queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Mostrar toast de sucesso
      if (variables.action === 'create') {
        toast.success('Registro criado com sucesso!');
      } else if (variables.action === 'update') {
        toast.success('Registro atualizado com sucesso!');
      } else if (variables.action === 'delete') {
        toast.success('Registro excluído com sucesso!');
      }

      options.onSuccess?.(data);
    },
    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error(`Error in ${table} mutation:`, error);

      // Mostrar toast de erro
      if (error.code === 'PGRST116') {
        toast.error(
          'Erro de permissão. Você não tem acesso para esta operação.',
        );
      } else if (error.code === 'PGRST301') {
        toast.error(
          'Erro de restrição de linha. Verifique as políticas de acesso.',
        );
      } else {
        toast.error(`Erro: ${error.message || 'Ocorreu um erro inesperado'}`);
      }

      options.onError?.(error);
    },
  });
}

// Hook específico para mutations de pacientes
export function usePatientMutation(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      action: 'create' | 'update' | 'delete';
      patientData?: any;
      patientId?: string;
    }) => {
      switch (data.action) {
        case 'create':
          if (!data.patientData) {
            throw new Error('Patient data required for creation');
          }
          return await patientService.createPatient(
            data.patientData,
            'current-clinic-id',
            'current-user-id',
          );

        case 'update':
          if (!data.patientId || !data.patientData) {
            throw new Error('Patient ID and data required for update');
          }
          return await patientService.updatePatient(
            data.patientId,
            data.patientData,
          );

        case 'delete':
          if (!data.patientId) {
            throw new Error('Patient ID required for deletion');
          }
          await patientService.deletePatient(data.patientId);
          return { success: true };

        default:
          throw new Error(`Unknown action: ${data.action}`);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch patient queries
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    ...options,
  });
}

// Hook específico para mutations de agendamentos
export function useAppointmentMutation(options = {}) {
  return useSupabaseMutation('appointments', {
    invalidateQueries: [['appointments'], ['stats'], ['appointments', 'today']],
    ...options,
  });
}

// Hook para real-time subscriptions genéricas
export function useRealTimeSubscription(
  table: string,
  callbacks: {
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
  },
  filters?: Record<string, any>,
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-subscription`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table as any,
          ...filters,
        },
        payload => {
          console.log(`Real-time update on ${table}:`, payload);

          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onInsert?.(payload);
              break;
            case 'UPDATE':
              callbacks.onUpdate?.(payload);
              break;
            case 'DELETE':
              callbacks.onDelete?.(payload);
              break;
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callbacks, filters]);
}

// Hook para prefetch de dados
export function useSupabasePrefetch() {
  const queryClient = useQueryClient();

  const prefetchPatients = () => {
    return queryClient.prefetchQuery({
      queryKey: ['patients'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchAppointments = () => {
    return queryClient.prefetchQuery({
      queryKey: ['appointments'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('appointments')
          .select(
            `
            *,
            patient:patients(*),
            professional:professionals(*)
          `,
          )
          .order('start_time', { ascending: true });

        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    prefetchPatients,
    prefetchAppointments,
  };
}
