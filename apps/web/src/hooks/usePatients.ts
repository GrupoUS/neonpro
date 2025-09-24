import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

// Types for our data
export interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone_primary: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  lgpd_consent_given: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientData {
  full_name: string;
  email: string;
  phone_primary: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  lgpd_consent_given: boolean;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  id: string;
}

// Query keys for consistent caching
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

// Hook for fetching all patients with optional filters
export function usePatients(filters?: Record<string, any>) {
  return useQuery({
    queryKey: patientKeys.list(filters || {}),
    queryFn: async () => {
      let query = supabase.from('patients').select('*');

      // Apply filters if provided
      if (filters?.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch patients: ${error.message}`);
      }

      return data as Patient[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Hook for fetching a single patient by ID
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch patient: ${error.message}`);
      }

      return data as Patient;
    },
    enabled: !!id, // Only run query if ID is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Hook for creating a new patient
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData: CreatePatientData) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create patient: ${error.message}`);
      }

      return data as Patient;
    },
    onSuccess: newPatient => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({
        queryKey: patientKeys.lists(),
      });

      // Add the new patient to the cache
      queryClient.setQueryData(
        patientKeys.detail(newPatient.id),
        newPatient,
      );
    },
    onError: error => {
      console.error('Error creating patient:', error);
    },
  });
}

// Hook for updating an existing patient
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData: UpdatePatientData) => {
      const { id, ...updateData } = patientData;
      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update patient: ${error.message}`);
      }

      return data as Patient;
    },
    onSuccess: updatedPatient => {
      // Update the patient in the cache
      queryClient.setQueryData(
        patientKeys.detail(updatedPatient.id),
        updatedPatient,
      );

      // Invalidate and refetch patients list
      queryClient.invalidateQueries({
        queryKey: patientKeys.lists(),
      });
    },
    onError: error => {
      console.error('Error updating patient:', error);
    },
  });
}

// Hook for deleting a patient
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete patient: ${error.message}`);
      }

      return id;
    },
    onSuccess: deletedId => {
      // Remove the patient from the cache
      queryClient.removeQueries({
        queryKey: patientKeys.detail(deletedId),
      });

      // Invalidate and refetch patients list
      queryClient.invalidateQueries({
        queryKey: patientKeys.lists(),
      });
    },
    onError: error => {
      console.error('Error deleting patient:', error);
    },
  });
}
