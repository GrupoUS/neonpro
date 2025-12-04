import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../integrations/supabase/client'

// Types for our data
export interface Patient {
  id: string
  full_name: string
  email: string
  phone_primary: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  lgpd_consent_given: boolean
  created_at: string
  updated_at: string
}

export interface CreatePatientData {
  full_name: string
  email: string
  phone_primary: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  lgpd_consent_given: boolean
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  id: string
}

// Query keys for consistent caching
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...patientKeys.lists(), { filters }] as const,
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
        throw new Error(`Failed to fetch patient: ${error.message}`)
      }

      return data as Patient
    },
    enabled: !!id, // Only run query if ID is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Hook for creating a new patient
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patientData: CreatePatientData) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create patient: ${error.message}`)
      }

      return data as Patient
    },
    onSuccess: newPatient => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({
        queryKey: patientKeys.lists(),
      })

      // Add the new patient to the cache
      queryClient.setQueryData(
        patientKeys.detail(newPatient.id),
        newPatient,
      )
    },
    onError: error => {
      console.error('Error creating patient:', error)
    },
  })
}

// Hook for updating an existing patient
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patientData: UpdatePatientData) => {
      const { id, ...updateData } = patientData
      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update patient: ${error.message}`)
      }

      return data as Patient
    },
    onSuccess: updatedPatient => {
      // Update the patient in the cache
      queryClient.setQueryData(
        patientKeys.detail(updatedPatient.id),
        updatedPatient,
      )

      // Invalidate and refetch patients list
      queryClient.invalidateQueries({
        queryKey: patientKeys.lists(),
      })
    },
    onError: error => {
      console.error('Error updating patient:', error)
    },
  })
}

// Hook for deleting a patient
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Failed to delete patient: ${error.message}`)
      }

      return id
    },
    onSuccess: deletedId => {
      // Remove the patient from the cache
      queryClient.removeQueries({
        queryKey: patientKeys.detail(deletedId),
      })

      // Invalidate and refetch patients list
      queryClient.invalidateQueries({
        queryKey: patientKeys.lists(),
      })
    },
    onError: error => {
      console.error('Error deleting patient:', error)
    },
  })
}
