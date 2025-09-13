/**
 * Appointment hooks with React Query integration
 * Implements healthcare-specific patterns with real-time updates and optimistic mutations
 */

import { appointmentService, type CalendarAppointment, type CreateAppointmentData, type UpdateAppointmentData } from '@/services/appointments.service';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';
import { addDays, startOfDay, endOfDay } from 'date-fns';

// Query keys for appointments
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (clinicId: string, filters?: any) => [...appointmentKeys.lists(), clinicId, filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  calendar: (clinicId: string, startDate?: Date, endDate?: Date) => 
    [...appointmentKeys.all, 'calendar', clinicId, startDate?.toISOString(), endDate?.toISOString()] as const,
};

/**
 * Hook to fetch appointments for calendar view
 */
export function useAppointments(
  clinicId: string,
  startDate?: Date,
  endDate?: Date,
  options?: Omit<UseQueryOptions<CalendarAppointment[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: appointmentKeys.calendar(clinicId, startDate, endDate),
    queryFn: () => appointmentService.getAppointments(clinicId, startDate, endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes - healthcare data should be fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!clinicId,
    ...options,
  });
}

/**
 * Hook to create new appointments with optimistic updates
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ data, clinicId }: { data: CreateAppointmentData; clinicId: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return appointmentService.createAppointment(data, clinicId, user.id);
    },

    onMutate: async ({ data, clinicId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentKeys.calendar(clinicId) });

      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(appointmentKeys.calendar(clinicId));

      // Optimistically add the new appointment
      const optimisticAppointment: CalendarAppointment = {
        id: `temp-${Date.now()}`,
        title: 'Novo Agendamento',
        start: data.startTime,
        end: data.endTime,
        color: '#3b82f6',
        description: 'Criando...',
        status: 'scheduled',
        patientName: 'Carregando...',
        serviceName: 'Carregando...',
        professionalName: 'Carregando...',
        notes: data.notes,
        priority: data.priority,
      };

      queryClient.setQueryData(
        appointmentKeys.calendar(clinicId),
        (old: CalendarAppointment[] = []) => [...old, optimisticAppointment]
      );

      return { previousAppointments, optimisticAppointment };
    },

    onSuccess: (newAppointment, { clinicId }) => {
      // Replace optimistic data with server data
      queryClient.setQueryData(
        appointmentKeys.calendar(clinicId),
        (old: CalendarAppointment[] = []) => 
          old.map(apt => apt.id.startsWith('temp-') ? newAppointment : apt)
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      toast.success('Agendamento criado com sucesso!');
    },

    onError: (error, { clinicId }, context) => {
      // Rollback optimistic update
      if (context?.previousAppointments) {
        queryClient.setQueryData(appointmentKeys.calendar(clinicId), context.previousAppointments);
      }

      console.error('Error creating appointment:', error);
      toast.error(error.message || 'Erro ao criar agendamento');
    },

    onSettled: (_, __, { clinicId }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: appointmentKeys.calendar(clinicId) });
    },
  });
}

/**
 * Hook to update appointments with optimistic updates
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      appointmentId, 
      updates, 
      clinicId 
    }: { 
      appointmentId: string; 
      updates: UpdateAppointmentData; 
      clinicId: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return appointmentService.updateAppointment(appointmentId, updates, user.id);
    },

    onMutate: async ({ appointmentId, updates, clinicId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentKeys.calendar(clinicId) });

      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(appointmentKeys.calendar(clinicId));

      // Optimistically update the appointment
      queryClient.setQueryData(
        appointmentKeys.calendar(clinicId),
        (old: CalendarAppointment[] = []) =>
          old.map(apt =>
            apt.id === appointmentId
              ? {
                  ...apt,
                  ...(updates.startTime && { start: updates.startTime }),
                  ...(updates.endTime && { end: updates.endTime }),
                  ...(updates.notes !== undefined && { notes: updates.notes }),
                  ...(updates.status && { status: updates.status }),
                }
              : apt
          )
      );

      return { previousAppointments };
    },

    onSuccess: (updatedAppointment, { clinicId }) => {
      // Replace optimistic data with server data
      queryClient.setQueryData(
        appointmentKeys.calendar(clinicId),
        (old: CalendarAppointment[] = []) =>
          old.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      toast.success('Agendamento atualizado com sucesso!');
    },

    onError: (error, { clinicId }, context) => {
      // Rollback optimistic update
      if (context?.previousAppointments) {
        queryClient.setQueryData(appointmentKeys.calendar(clinicId), context.previousAppointments);
      }

      console.error('Error updating appointment:', error);
      toast.error(error.message || 'Erro ao atualizar agendamento');
    },

    onSettled: (_, __, { clinicId }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: appointmentKeys.calendar(clinicId) });
    },
  });
}

/**
 * Hook to delete appointments
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      appointmentId, 
      clinicId, 
      reason 
    }: { 
      appointmentId: string; 
      clinicId: string; 
      reason?: string;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return appointmentService.deleteAppointment(appointmentId, user.id, reason);
    },

    onMutate: async ({ appointmentId, clinicId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentKeys.calendar(clinicId) });

      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(appointmentKeys.calendar(clinicId));

      // Optimistically remove the appointment
      queryClient.setQueryData(
        appointmentKeys.calendar(clinicId),
        (old: CalendarAppointment[] = []) =>
          old.filter(apt => apt.id !== appointmentId)
      );

      return { previousAppointments };
    },

    onSuccess: (_, { clinicId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      
      toast.success('Agendamento cancelado com sucesso!');
    },

    onError: (error, { clinicId }, context) => {
      // Rollback optimistic update
      if (context?.previousAppointments) {
        queryClient.setQueryData(appointmentKeys.calendar(clinicId), context.previousAppointments);
      }

      console.error('Error deleting appointment:', error);
      toast.error(error.message || 'Erro ao cancelar agendamento');
    },

    onSettled: (_, __, { clinicId }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: appointmentKeys.calendar(clinicId) });
    },
  });
}

/**
 * Hook for real-time appointment updates
 */
export function useAppointmentRealtime(clinicId: string) {
  const queryClient = useQueryClient();

  const handleRealtimeUpdate = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Update all relevant queries
    queryClient.invalidateQueries({ queryKey: appointmentKeys.calendar(clinicId) });
    queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });

    // Show notifications for changes made by other users
    if (eventType === 'INSERT') {
      toast.info('Novo agendamento criado por outro usuário');
    } else if (eventType === 'UPDATE') {
      toast.info('Agendamento atualizado por outro usuário');
    } else if (eventType === 'DELETE') {
      toast.info('Agendamento cancelado por outro usuário');
    }
  }, [queryClient, clinicId]);

  useEffect(() => {
    if (!clinicId) return;

    const subscription = supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`,
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [clinicId, handleRealtimeUpdate]);
}

/**
 * Hook to get current week appointments for quick access
 */
export function useCurrentWeekAppointments(clinicId: string) {
  const today = new Date();
  const startOfWeek = startOfDay(addDays(today, -today.getDay()));
  const endOfWeek = endOfDay(addDays(startOfWeek, 6));

  return useAppointments(clinicId, startOfWeek, endOfWeek, {
    staleTime: 1 * 60 * 1000, // 1 minute for current week
  });
}
