/**
 * Patient hooks with React Query integration
 * Implements healthcare-specific patterns with LGPD compliance
 */

import { useAuth } from '@/hooks/useAuth';
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
