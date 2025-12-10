/**
 * Patient hooks with React Query integration
 * Implements healthcare-specific patterns with LGPD compliance
 * Enhanced with real-time subscriptions and comprehensive CRUD operations
 */

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { type CreatePatientData, type Patient, patientService } from '@/services/patients.service';
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

// Query keys for patients
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (clinicId: string, filters?: any) => [...patientKeys.lists(), clinicId, filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  search: (clinicId: string, query: string) =>
    [...patientKeys.all, 'search', clinicId, query] as const,
  history: (patientId: string) => [...patientKeys.all, 'history', patientId] as const,
};

/**
 * Hook to search patients by name or phone
 */
export function useSearchPatients(
  clinicId: string,
  query: string,
  options?: Omit<UseQueryOptions<Patient[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: patientKeys.search(clinicId, query),
    queryFn: () => patientService.searchPatients(clinicId, query),
    staleTime: 30 * 1000, // 30 seconds - patient search should be fresh
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!clinicId && query.length >= 2, // Only search with 2+ characters
    ...options,
  });
}

/**
 * Hook to get patient by ID
 */
export function usePatient(
  patientId: string,
  options?: Omit<UseQueryOptions<Patient | null, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => patientService.getPatient(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!patientId,
    ...options,
  });
}

/**
 * Alias for usePatient - more semantic name for detail views
 */
export function usePatientDetail(patientId: string) {
  return usePatient(patientId);
}

/**
 * Hook to create new patients
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ data, clinicId }: { data: CreatePatientData; clinicId: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return patientService.createPatient(data, clinicId, user.id);
    },

    onSuccess: (newPatient, { clinicId }) => {
      // Invalidate patient lists and searches
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.search(clinicId, '') });

      // Add to cache
      queryClient.setQueryData(patientKeys.detail(newPatient.id), newPatient);

      toast.success('Paciente criado com sucesso!');
    },

    onError: error => {
      console.error('Error creating patient:', error);
      toast.error(error.message || 'Erro ao criar paciente');
    },
  });
}

/**
 * Hook for patient search with debouncing
 */
export function useDebouncedPatientSearch(clinicId: string, query: string, delay = 300) {
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return useSearchPatients(clinicId, debouncedQuery, {
    enabled: debouncedQuery.length >= 2,
  });
}

/**
 * Hook to prefetch patient data
 */
export function usePrefetchPatients() {
  const queryClient = useQueryClient();

  const prefetchPatient = (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: patientKeys.detail(patientId),
      queryFn: () => patientService.getPatient(patientId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchPatientSearch = (clinicId: string, query: string) => {
    if (query.length >= 2) {
      queryClient.prefetchQuery({
        queryKey: patientKeys.search(clinicId, query),
        queryFn: () => patientService.searchPatients(clinicId, query),
        staleTime: 30 * 1000,
      });
    }
  };

  return {
    prefetchPatient,
    prefetchPatientSearch,
  };
}

/**
 * Hook to get patient appointment history
 */
export function usePatientAppointmentHistory(
  patientId: string,
  options?: Omit<
    UseQueryOptions<
      ReturnType<typeof patientService.getPatientAppointmentHistory> extends Promise<infer R> ? R
        : never,
      Error
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: patientKeys.history(patientId),
    queryFn: () => patientService.getPatientAppointmentHistory(patientId),
    staleTime: 2 * 60 * 1000, // 2 minutes - appointment history should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!patientId,
    ...options,
  });
}

/**
 * Enhanced Patient interface for data table
 */
export interface PatientTableData extends Patient {
  status: 'Active' | 'Inactive' | 'Pending';
  lastVisit?: string;
  nextAppointment?: string;
  totalAppointments: number;
  contactMethod: string;
  age?: number;
}

/**
 * Hook to get paginated patients list with real-time updates
 */
export function usePatientsTable(
  clinicId: string,
  options?: {
    pageIndex?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: {
      search?: string;
      status?: string[];
    };
  },
) {
  const queryClient = useQueryClient();
  const { pageIndex = 0, pageSize = 10, sortBy = 'full_name', sortOrder = 'asc', filters } = options
    || {};

  // Set up real-time subscription
  React.useEffect(() => {
    if (!clinicId) return;

    const channel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `clinic_id=eq.${clinicId}`,
        },
        payload => {
          console.log('Patient real-time update:', payload);

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: patientKeys.lists() });

          // Show toast notification for changes
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('Novo paciente adicionado');
              break;
            case 'UPDATE':
              toast.info('Dados do paciente atualizados');
              break;
            case 'DELETE':
              toast.info('Paciente removido');
              break;
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId, queryClient]);

  return useQuery({
    queryKey: patientKeys.list(clinicId, { pageIndex, pageSize, sortBy, sortOrder, filters }),
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select(
          `
          id,
          full_name,
          email,
          phone_primary,
          birth_date,
          cpf,
          patient_status,
          last_visit_date,
          next_appointment_date,
          total_appointments,
          preferred_contact_method,
          created_at,
          is_active
        `,
          { count: 'exact' },
        )
        .eq('clinic_id', clinicId);

      // Apply search filter
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_primary.ilike.%${filters.search}%`,
        );
      }

      // Apply status filter
      if (filters?.status && filters.status.length > 0) {
        query = query.in('patient_status', filters.status);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch patients: ${error.message}`);
      }

      const patients: PatientTableData[] = (data || []).map(patient => {
        const birthDate = patient.birth_date ? new Date(patient.birth_date) : null;
        const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : undefined;

        return {
          id: patient.id,
          fullName: patient.full_name,
          email: patient.email || undefined,
          phone: patient.phone_primary || undefined,
          birthDate: patient.birth_date || undefined,
          cpf: patient.cpf || undefined,
          createdAt: patient.created_at || '',
          status: patient.is_active
            ? (patient.patient_status === 'active' ? 'Active' : 'Pending')
            : 'Inactive',
          lastVisit: patient.last_visit_date || undefined,
          nextAppointment: patient.next_appointment_date || undefined,
          totalAppointments: patient.total_appointments || 0,
          contactMethod: patient.preferred_contact_method || 'phone',
          age,
        };
      });

      return {
        data: patients,
        count: count || 0,
        pageCount: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!clinicId,
  });
}

/**
 * Hook to update patient
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ patientId, data, clinicId }: {
      patientId: string;
      data: Partial<CreatePatientData>;
      clinicId: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const updateData: any = {
        ...(data.fullName && { full_name: data.fullName }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone_primary: data.phone || null }),
        ...(data.birthDate !== undefined && { birth_date: data.birthDate || null }),
        ...(data.cpf !== undefined && { cpf: data.cpf || null }),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      };

      const { data: patient, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patientId)
        .eq('clinic_id', clinicId)
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
        throw new Error(`Failed to update patient: ${error.message}`);
      }

      return {
        id: patient.id,
        fullName: patient.full_name,
        email: patient.email || undefined,
        phone: patient.phone_primary || undefined,
        birthDate: patient.birth_date || undefined,
        cpf: patient.cpf || undefined,
        createdAt: patient.created_at || '',
      };
    },

    onSuccess: (updatedPatient, { clinicId }) => {
      // Update cache
      queryClient.setQueryData(patientKeys.detail(updatedPatient.id), updatedPatient);

      // Invalidate lists to refresh data
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.search(clinicId, '') });

      toast.success('Paciente atualizado com sucesso!');
    },

    onError: error => {
      console.error('Error updating patient:', error);
      toast.error(error.message || 'Erro ao atualizar paciente');
    },
  });
}

/**
 * Hook to delete patient
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ patientId, clinicId }: { patientId: string; clinicId: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('patients')
        .update({
          is_active: false,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patientId)
        .eq('clinic_id', clinicId);

      if (error) {
        throw new Error(`Failed to delete patient: ${error.message}`);
      }

      return { patientId };
    },

    onSuccess: (_, { patientId, clinicId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: patientKeys.detail(patientId) });

      // Invalidate lists to refresh data
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.search(clinicId, '') });

      toast.success('Paciente removido com sucesso!');
    },

    onError: error => {
      console.error('Error deleting patient:', error);
      toast.error(error.message || 'Erro ao remover paciente');
    },
  });
}

/**
 * Hook to bulk delete patients
 */
export function useBulkDeletePatients() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ patientIds, clinicId }: { patientIds: string[]; clinicId: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('patients')
        .update({
          is_active: false,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .in('id', patientIds)
        .eq('clinic_id', clinicId);

      if (error) {
        throw new Error(`Failed to delete patients: ${error.message}`);
      }

      return { patientIds };
    },

    onSuccess: (_, { patientIds, clinicId }) => {
      // Remove from cache
      patientIds.forEach(id => {
        queryClient.removeQueries({ queryKey: patientKeys.detail(id) });
      });

      // Invalidate lists to refresh data
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.search(clinicId, '') });

      toast.success(`${patientIds.length} paciente(s) removido(s) com sucesso!`);
    },

    onError: error => {
      console.error('Error bulk deleting patients:', error);
      toast.error(error.message || 'Erro ao remover pacientes');
    },
  });
}
