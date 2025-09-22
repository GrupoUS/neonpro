/**
 * Notification Scheduler Hooks
 * React Query hooks for managing scheduled notifications
 */

import {
  notificationSchedulerService,
  type ReminderSettings,
} from '@/services/notification-scheduler.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to schedule notifications for an appointment
 */
export function useScheduleAppointmentNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,appointmentDate, patientId,settings,
    }: {
      appointmentId: string;
      appointmentDate: Date;
      patientId: string;
      settings?: ReminderSettings;
    }) => {
      return notificationSchedulerService.scheduleAppointmentNotifications(
        appointmentId,
        appointmentDate,
        patientId,
        settings,
      );
    },
    onSuccess: () => {
      toast.success('Notificações agendadas com sucesso');
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
    },
    onError: error => {
      console.error('Error scheduling notifications:', error);
      toast.error('Erro ao agendar notificações');
    },
  });
}

/**
 * Hook to process pending notifications manually
 */
export function useProcessPendingNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationSchedulerService.processPendingNotifications(),
    onSuccess: () => {
      toast.success('Notificações pendentes processadas');
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
    },
    onError: error => {
      console.error('Error processing pending notifications:', error);
      toast.error('Erro ao processar notificações pendentes');
    },
  });
}

/**
 * Hook to cancel notifications for an appointment
 */
export function useCancelAppointmentNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      notificationSchedulerService.cancelAppointmentNotifications(
        appointmentId,
      ),
    onSuccess: () => {
      toast.success('Notificações canceladas');
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
    },
    onError: error => {
      console.error('Error cancelling notifications:', error);
      toast.error('Erro ao cancelar notificações');
    },
  });
}

/**
 * Hook to get notification statistics
 */
export function useNotificationStats(clinicId?: string) {
  return useQuery({
    queryKey: ['notification-stats', clinicId],
    queryFn: () => notificationSchedulerService.getNotificationStats(clinicId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Hook to get scheduled notifications for an appointment
 */
export function useScheduledNotifications(appointmentId?: string) {
  return useQuery({
    queryKey: ['scheduled-notifications', appointmentId],
    queryFn: async () => {
      // This would fetch from the scheduled_notifications table
      // For now, return empty array as placeholder
      return [];
    },
    enabled: !!appointmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get all scheduled notifications with filters
 */
export function useAllScheduledNotifications(filters?: {
  status?: 'pending' | 'sent' | 'failed' | 'cancelled';
  clinicId?: string;
  patientId?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['all-scheduled-notifications', filters],
    queryFn: async () => {
      // This would fetch from the scheduled_notifications table with filters
      // For now, return empty array as placeholder
      return [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for automatic notification processing (background job simulation)
 */
export function useNotificationProcessor(enabled: boolean = false) {
  return useQuery({
    queryKey: ['notification-processor'],
    queryFn: async () => {
      if (!enabled) return null;

      try {
        await notificationSchedulerService.processPendingNotifications();
        return { lastProcessed: new Date(), success: true } as const;
      } catch {
        // ignore error for UX
        console.error('Background notification processing failed');
        return { lastProcessed: new Date(), success: false } as const;
      }
    },
    enabled,
    refetchInterval: 5 * 60 * 1000, // Process every 5 minutes
    refetchIntervalInBackground: true,
    retry: false,
  });
}
