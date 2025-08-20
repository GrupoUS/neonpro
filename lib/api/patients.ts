import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from './client';

// Patient types - these should match the backend
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  gender: 'M' | 'F' | 'O';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_history?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    notes?: string;
  };
  consent: {
    data_processing: boolean;
    marketing: boolean;
    photography: boolean;
  };
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  gender: 'M' | 'F' | 'O';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_history?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    notes?: string;
  };
  consent: {
    data_processing: boolean;
    marketing: boolean;
    photography: boolean;
  };
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: string;
}

// API service functions using Hono RPC client
export const patientApi = {
  // Get all patients
  getPatients: async (): Promise<Patient[]> => {
    const response = await apiClient.api.v1.patients.$get();
    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.status}`);
    }
    const data = await response.json();
    return data.patients || [];
  },

  // Get patient by ID
  getPatient: async (id: string): Promise<Patient> => {
    const response = await apiClient.api.v1.patients[':id'].$get({
      param: { id }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch patient: ${response.status}`);
    }
    const data = await response.json();
    return data.patient;
  },

  // Create new patient
  createPatient: async (data: CreatePatientRequest): Promise<Patient> => {
    const response = await apiClient.api.v1.patients.$post({
      json: data
    });
    if (!response.ok) {
      throw new Error(`Failed to create patient: ${response.status}`);
    }
    const result = await response.json();
    return result.patient;
  },

  // Update patient
  updatePatient: async (data: UpdatePatientRequest): Promise<Patient> => {
    const { id, ...updateData } = data;
    const response = await apiClient.api.v1.patients[':id'].$put({
      param: { id },
      json: updateData
    });
    if (!response.ok) {
      throw new Error(`Failed to update patient: ${response.status}`);
    }
    const result = await response.json();
    return result.patient;
  },

  // Delete patient
  deletePatient: async (id: string): Promise<void> => {
    const response = await apiClient.api.v1.patients[':id'].$delete({
      param: { id }
    });
    if (!response.ok) {
      throw new Error(`Failed to delete patient: ${response.status}`);
    }
  },
};

// Query keys for caching
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: string) => [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

// React Query hooks for patient management
export function usePatients() {
  return useQuery({
    queryKey: patientKeys.lists(),
    queryFn: patientApi.getPatients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientApi.getPatient(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: patientApi.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      toast.success('Paciente criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar paciente: ${error.message}`);
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: patientApi.updatePatient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(data.id) });
      toast.success('Paciente atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar paciente: ${error.message}`);
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: patientApi.deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      toast.success('Paciente removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover paciente: ${error.message}`);
    },
  });
}