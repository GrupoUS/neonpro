/**
 * Healthcare-specific TanStack Query hooks with LGPD compliance and audit logging
 * Provides optimistic updates, error handling, and healthcare data patterns
 */

import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Healthcare-specific query keys factory
export const healthcareKeys = {
  all: ['healthcare'] as const,
  patients: () => [...healthcareKeys.all, 'patients'] as const,
  patient: (id: string) => [...healthcareKeys.patients(), id] as const,
  patientAppointments: (id: string) => [...healthcareKeys.patient(id), 'appointments'] as const,
  patientProcedures: (id: string) => [...healthcareKeys.patient(id), 'procedures'] as const,
  patientRisk: (id: string) => [...healthcareKeys.patient(id), 'risk'] as const,
  appointments: () => [...healthcareKeys.all, 'appointments'] as const,
  appointment: (id: string) => [...healthcareKeys.appointments(), id] as const,
  procedures: () => [...healthcareKeys.all, 'procedures'] as const,
  procedure: (id: string) => [...healthcareKeys.procedures(), id] as const,
  auditLogs: () => [...healthcareKeys.all, 'audit-logs'] as const,
};

// Healthcare audit logging utility
async function logHealthcareAction(
  action: string,
  resourceType: string,
  resourceId: string,
  userId?: string,
  details?: Record<string, any>
) {
  try {
    if (!userId) return; // ensure required field
    await supabase.from('audit_logs').insert({
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: userId,
      details,
    });
  } catch (error) {
    console.error('Failed to log healthcare action:', error);
  }
}

// Patient data query with LGPD compliance
export function usePatient(
  patientId: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: healthcareKeys.patient(patientId),
    queryFn: async () => {
      // Log data access for LGPD compliance
      await logHealthcareAction(
        'patient_data_accessed',
        'patient',
        patientId,
        user?.id,
        { access_type: 'query' }
      );
      
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          full_name,
          cpf,
          phone_primary,
          email,
          birth_date,
          created_at,
          updated_at,
          allergies,
          chronic_conditions,
          current_medications,
          patient_notes,
          lgpd_consent_given,
          data_consent_status
        `)
        .eq('id', patientId)
        .single();
      
      if (error) {
        throw new Error(`Failed to fetch patient: ${error.message}`);
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on permission errors
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

// Patient appointments query
export function usePatientAppointments(
  patientId: string,
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: healthcareKeys.patientAppointments(patientId),
    queryFn: async () => {
      await logHealthcareAction(
        'patient_appointments_accessed',
        'patient',
        patientId,
        user?.id
      );
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          status,
          procedure_type,
          notes,
          created_at,
          updated_at
        `)
        .eq('patient_id', patientId)
        .order('scheduled_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch appointments: ${error.message}`);
      }
      
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// Patient update mutation with optimistic updates
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ patientId, updates }: { patientId: string; updates: any }) => {
      // Log the update action
      await logHealthcareAction(
        'patient_data_updated',
        'patient',
        patientId,
        user?.id,
        { updated_fields: Object.keys(updates) }
      );
      
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update patient: ${error.message}`);
      }
      
      return data;
    },
    
    // Optimistic update
    onMutate: async ({ patientId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: healthcareKeys.patient(patientId) });
      
      // Snapshot previous value
      const previousPatient = queryClient.getQueryData(healthcareKeys.patient(patientId));
      
      // Optimistically update the cache
      queryClient.setQueryData(healthcareKeys.patient(patientId), (old: any) => ({
        ...old,
        ...updates,
        updated_at: new Date().toISOString(),
      }));
      
      return { previousPatient };
    },
    
    // On success, replace optimistic data with server data
    onSuccess: (data, { patientId }) => {
      queryClient.setQueryData(healthcareKeys.patient(patientId), data);
      toast.success('Dados do paciente atualizados com sucesso');
    },
    
    // On error, rollback to previous data
    onError: (error, { patientId }, context) => {
      if (context?.previousPatient) {
        queryClient.setQueryData(healthcareKeys.patient(patientId), context.previousPatient);
      }
      
      toast.error(`Erro ao atualizar paciente: ${error.message}`);
      console.error('Patient update error:', error);
    },
    
    // Always refetch after mutation
    onSettled: (data, error, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: healthcareKeys.patient(patientId) });
    },
  });
}

// Appointment creation mutation with healthcare-specific validation
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (appointmentData: {
      patient_id: string;
      scheduled_at: string;
      procedure_type: string;
      notes?: string;
      priority?: 'low' | 'medium' | 'high';
    }) => {
      // Healthcare-specific validation
      const scheduledDate = new Date(appointmentData.scheduled_at);
      const now = new Date();
      
      if (scheduledDate <= now) {
        throw new Error('Agendamento deve ser para uma data futura');
      }
      
      // Check for conflicts (simplified)
      const { data: conflicts } = await supabase
        .from('appointments')
        .select('id')
        .eq('scheduled_at', appointmentData.scheduled_at)
        .neq('status', 'cancelled');
      
      if (conflicts && conflicts.length > 0) {
        throw new Error('Já existe um agendamento para este horário');
      }
      
      // Log appointment creation
      await logHealthcareAction(
        'appointment_created',
        'appointment',
        'pending',
        user?.id,
        { 
          patient_id: appointmentData.patient_id,
          procedure_type: appointmentData.procedure_type,
          priority: appointmentData.priority 
        }
      );
      
      const { data, error } = await supabase
        .from('appointments')
        // Cast due to partial demo schema vs generated types
        .insert({
          ...appointmentData,
          status: 'scheduled',
          created_by: user?.id as string,
          // placeholders for required fields in typed schema
          clinic_id: (undefined as unknown) as string | undefined,
          start_time: (undefined as unknown) as string | undefined,
          end_time: (undefined as unknown) as string | undefined,
          professional_id: (undefined as unknown) as string | undefined,
          service_type_id: (undefined as unknown) as string | undefined,
        } as any)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Falha ao criar agendamento: ${error.message}`);
      }
      
      return data;
    },
    
    // Optimistic update for appointments list
    onMutate: async (newAppointment) => {
      const patientId = newAppointment.patient_id;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: healthcareKeys.patientAppointments(patientId) 
      });
      
      // Snapshot previous appointments
      const previousAppointments = queryClient.getQueryData(
        healthcareKeys.patientAppointments(patientId)
      );
      
      // Create optimistic appointment
      const optimisticAppointment = {
        id: `temp-${Date.now()}`,
        ...newAppointment,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Optimistically add to appointments list
      queryClient.setQueryData(
        healthcareKeys.patientAppointments(patientId),
        (old: any[]) => [optimisticAppointment, ...(old || [])]
      );
      
      return { previousAppointments, optimisticAppointment };
    },
    
    onSuccess: (data, variables, context) => {
      const patientId = variables.patient_id;
      
      // Replace optimistic appointment with real data
      queryClient.setQueryData(
        healthcareKeys.patientAppointments(patientId),
        (old: any[]) => 
          old?.map(appointment => 
            appointment.id === context?.optimisticAppointment.id 
              ? data 
              : appointment
          ) || [data]
      );
      
      toast.success('Agendamento criado com sucesso');
    },
    
    onError: (error, variables, context) => {
      const patientId = variables.patient_id;
      
      // Rollback optimistic update
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          healthcareKeys.patientAppointments(patientId),
          context.previousAppointments
        );
      }
      
      toast.error(`Erro ao criar agendamento: ${error.message}`);
    },
    
    onSettled: (data, error, variables) => {
      const patientId = variables.patient_id;
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: healthcareKeys.patientAppointments(patientId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: healthcareKeys.appointments() 
      });
    },
  });
}

// Emergency detection mutation for healthcare safety
export function useEmergencyDetection() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      patientId, 
      severity, 
      description, 
      symptoms 
    }: {
      patientId: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      symptoms: string[];
    }) => {
      // Log emergency detection
      await logHealthcareAction(
        'emergency_detected',
        'patient',
        patientId,
        user?.id,
        { severity, description, symptoms }
      );
      
      // Create emergency record
      const { data, error } = await supabase
        // Table may not exist in generated types in some envs; keep flexible
        .from('emergency_alerts' as any)
        .insert({
          patient_id: patientId,
          severity,
          description,
          symptoms,
          detected_by: user?.id as string,
          status: 'active',
        } as any)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to record emergency: ${error.message}`);
      }
      
      // For critical emergencies, trigger immediate notifications
      if (severity === 'critical') {
        // This would integrate with notification system
        console.log('CRITICAL EMERGENCY DETECTED - IMMEDIATE ATTENTION REQUIRED');
      }
      
      return data;
    },
    
    onSuccess: (data: any) => {
      toast.error(`Emergência detectada: ${String((data as any)?.severity ?? 'ALTA').toUpperCase()}`, {
        duration: 10000,
        action: {
          label: 'Ver Detalhes',
          onClick: () => {
            // Navigate to emergency details
            console.log('Navigate to emergency details:', (data as any)?.id ?? 'unknown');
          },
        },
      });
    },
    
    onError: (error) => {
      toast.error(`Erro ao registrar emergência: ${error.message}`);
      console.error('Emergency detection error:', error);
    },
  });
}

// Healthcare data prefetching utility
export function usePrefetchHealthcareData() {
  const queryClient = useQueryClient();
  
  const prefetchPatient = (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: healthcareKeys.patient(patientId),
      queryFn: async () => {
        const { data } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchPatientAppointments = (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: healthcareKeys.patientAppointments(patientId),
      queryFn: async () => {
        const { data } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', patientId)
          .order('scheduled_at', { ascending: false });
        return data || [];
      },
      staleTime: 2 * 60 * 1000,
    });
  };
  
  return {
    prefetchPatient,
    prefetchPatientAppointments,
  };
}