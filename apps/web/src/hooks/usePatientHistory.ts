// @ts-nocheck
/**
 * Patient History Hooks
 * React Query hooks for advanced patient medical history and treatment tracking
 */

import { patientHistoryService } from '@/services/patient-history.service';
import type {
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  CreateTreatmentPlanRequest,
  UpdateTreatmentPlanRequest,
  CreateProgressNoteRequest,
  PatientHistoryFilters,
  PatientAllergy,
  PatientCondition,
} from '@/types/patient-history';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query Keys
export const patientHistoryKeys = {
  all: ['patientHistory'] as const,
  patient: (patientId: string) => [...patientHistoryKeys.all, patientId] as const,
  medicalRecords: (patientId: string, filters?: PatientHistoryFilters) => 
    [...patientHistoryKeys.patient(patientId), 'medicalRecords', filters] as const,
  treatmentPlans: (patientId: string) => 
    [...patientHistoryKeys.patient(patientId), 'treatmentPlans'] as const,
  progressNotes: (patientId: string, treatmentPlanId?: string) => 
    [...patientHistoryKeys.patient(patientId), 'progressNotes', treatmentPlanId] as const,
  allergies: (patientId: string) => 
    [...patientHistoryKeys.patient(patientId), 'allergies'] as const,
  conditions: (patientId: string) => 
    [...patientHistoryKeys.patient(patientId), 'conditions'] as const,
  timeline: (patientId: string) => 
    [...patientHistoryKeys.patient(patientId), 'timeline'] as const,
  summary: (patientId: string) => 
    [...patientHistoryKeys.patient(patientId), 'summary'] as const,
};

/**
 * Hook to get medical records for a patient
 */
export function useMedicalRecords(
  patientId: string,
  filters?: PatientHistoryFilters
) {
  return useQuery({
    queryKey: patientHistoryKeys.medicalRecords(patientId, filters),
    queryFn: () => patientHistoryService.getMedicalRecords(patientId, filters),
    enabled: !!patientId,
  });
}

/**
 * Hook to create a medical record
 */
export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, clinicId, request }: { 
      patientId: string; 
      clinicId: string;
      request: CreateMedicalRecordRequest 
    }) => patientHistoryService.createMedicalRecord(patientId, clinicId, request),
    
    onSuccess: (_data, variables) => {
      void _data;
      // Invalidate medical records for this patient
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.medicalRecords(variables.patientId) 
      });
      
      // Invalidate patient summary and timeline
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.summary(variables.patientId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.timeline(variables.patientId) 
      });
      
      toast.success('Registro médico criado com sucesso!');
    },
    
    onError: (error: Error) => {
      console.error('Error creating medical record:', error);
      toast.error(`Erro ao criar registro médico: ${error.message}`);
    },
  });
}

/**
 * Hook to update a medical record
 */
export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { 
      id: string; 
      request: UpdateMedicalRecordRequest 
    }) => patientHistoryService.updateMedicalRecord(id, request),
    
    onSuccess: (_data, variables) => {) => {
      void _data;
      // Broadly invalidate patient history queries after update
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.all 
      });
      
      toast.success('Registro médico atualizado com sucesso!');
    },
    
    onError: (error: Error) => {
      console.error('Error updating medical record:', error);
      toast.error(`Erro ao atualizar registro médico: ${error.message}`);
    },
  });
}

/**
 * Hook to get treatment plans for a patient
 */
export function useTreatmentPlans(patientId: string) {
  return useQuery({
    queryKey: patientHistoryKeys.treatmentPlans(patientId),
    queryFn: () => patientHistoryService.getTreatmentPlans(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to create a treatment plan
 */
export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, clinicId, request }: { 
      patientId: string; 
      clinicId: string;
      request: CreateTreatmentPlanRequest 
    }) => patientHistoryService.createTreatmentPlan(patientId, clinicId, request),
    
    onSuccess: (_data, variables) => {
      void _data;
      // Invalidate treatment plans for this patient
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.treatmentPlans(variables.patientId) 
      });
      
      // Invalidate patient summary
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.summary(variables.patientId) 
      });
      
      toast.success('Plano de tratamento criado com sucesso!');
    },
    
    onError: (error: Error) => {
      console.error('Error creating treatment plan:', error);
      toast.error(`Erro ao criar plano de tratamento: ${error.message}`);
    },
  });
}

/**
 * Hook to update a treatment plan
 */
export function useUpdateTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { 
      id: string; 
      request: UpdateTreatmentPlanRequest 
    }) => patientHistoryService.updateTreatmentPlan(id, request),
    
    onSuccess: (_data, variables) => {) => {
      void _data;
      // Broadly invalidate patient history queries after update
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.all 
      });
      
      toast.success('Plano de tratamento atualizado com sucesso!');
    },
    
    onError: (error: Error) => {
      console.error('Error updating treatment plan:', error);
      toast.error(`Erro ao atualizar plano de tratamento: ${error.message}`);
    },
  });
}

/**
 * Hook to get progress notes for a patient
 */
export function useProgressNotes(patientId: string, treatmentPlanId?: string) {
  return useQuery({
    queryKey: patientHistoryKeys.progressNotes(patientId, treatmentPlanId),
    queryFn: () => patientHistoryService.getProgressNotes(patientId, treatmentPlanId),
    enabled: !!patientId,
  });
}

/**
 * Hook to create a progress note
 */
export function useCreateProgressNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, request }: { 
      patientId: string; 
      request: CreateProgressNoteRequest 
    }) => patientHistoryService.createProgressNote(patientId, request),
    
    onSuccess: (_data, variables) => {
      void _data;
      // Invalidate progress notes for this patient
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.progressNotes(variables.patientId) 
      });
      
      // Invalidate patient timeline
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.timeline(variables.patientId) 
      });
      
      toast.success('Nota de progresso criada com sucesso!');
    },
    
    onError: (error: Error) => {
      console.error('Error creating progress note:', error);
      toast.error(`Erro ao criar nota de progresso: ${error.message}`);
    },
  });
}

/**
 * Hook to get patient allergies
 */
export function usePatientAllergies(patientId: string) {
  return useQuery({
    queryKey: patientHistoryKeys.allergies(patientId),
    queryFn: () => patientHistoryService.getPatientAllergies(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to add patient allergy
 */
export function useAddPatientAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, allergy }: { 
      patientId: string; 
      allergy: Omit<PatientAllergy, 'id' | 'patient_id' | 'created_at' | 'updated_at'>
    }) => patientHistoryService.addPatientAllergy(patientId, allergy),
    
    onSuccess: (_data, variables) => {
      void _data;
      // Invalidate allergies for this patient
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.allergies(variables.patientId) 
      });
      
      // Invalidate patient summary
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.summary(variables.patientId) 
      });
      
      toast.success('Alergia adicionada com sucesso!');
    },
    
    onError: (error: Error) => {
      console.error('Error adding patient allergy:', error);
      toast.error(`Erro ao adicionar alergia: ${error.message}`);
    },
  });
}

/**
 * Hook to get patient conditions
 */
export function usePatientConditions(patientId: string) {
  return useQuery({
    queryKey: patientHistoryKeys.conditions(patientId),
    queryFn: () => patientHistoryService.getPatientConditions(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to add patient condition
 */
export function useAddPatientCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, condition }: { 
      patientId: string; 
      condition: Omit<PatientCondition, 'id' | 'patient_id' | 'created_at' | 'updated_at'>
    }) => patientHistoryService.addPatientCondition(patientId, condition),
    
    onSuccess: (_data, variables) => {
      void _data;
      // Invalidate conditions for this patient
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.conditions(variables.patientId) 
      });
      
      // Invalidate patient summary
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.summary(variables.patientId) 
      });
      
      toast.success('Condição médica adicionada com sucesso!');
    },
    
    onError: (error: Error) => {
      console.error('Error adding patient condition:', error);
      toast.error(`Erro ao adicionar condição médica: ${error.message}`);
    },
  });
}

/**
 * Hook to get patient timeline
 */
export function usePatientTimeline(patientId: string) {
  return useQuery({
    queryKey: patientHistoryKeys.timeline(patientId),
    queryFn: () => patientHistoryService.getPatientTimeline(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get patient summary
 */
export function usePatientSummary(patientId: string) {
  return useQuery({
    queryKey: patientHistoryKeys.summary(patientId),
    queryFn: () => patientHistoryService.getPatientSummary(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to upload medical record attachment
 */
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, file, description }: { 
      recordId: string; 
      file: File;
      description?: string;
    }) => patientHistoryService.uploadAttachment(recordId, file, description),
    
    onSuccess: () => {
      // Invalidate medical records to refresh attachments
      queryClient.invalidateQueries({ 
        queryKey: patientHistoryKeys.all 
      });
      
      toast.success('Anexo enviado com sucesso!');
    },
    
    onError: (error: Error) => {
      console.error('Error uploading attachment:', error);
      toast.error(`Erro ao enviar anexo: ${error.message}`);
    },
  });
}
