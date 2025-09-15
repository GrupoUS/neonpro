/**
 * Notification Hooks
 * React Query hooks for notification management
 */

import {
  type NotificationData,
  type NotificationResult,
  notificationService,
} from '@/services/notification.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to send appointment confirmation notification
 */
export function useSendAppointmentConfirmation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationData) => notificationService.sendAppointmentConfirmation(data),
    onSuccess: (results: NotificationResult[]) => {
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      if (successCount === totalCount && totalCount > 0) {
        toast.success(
          `Confirmação enviada com sucesso via ${results.map(r => r.channel).join(', ')}`,
        );
      } else if (successCount > 0) {
        toast.warning(`Confirmação enviada parcialmente (${successCount}/${totalCount})`);
      } else if (totalCount > 0) {
        toast.error('Falha ao enviar confirmação');
      }

      // Invalidate notification logs
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
    },
    onError: error => {
      console.error('Error sending appointment confirmation:', error);
      toast.error('Erro ao enviar confirmação de agendamento');
    },
  });
}

/**
 * Hook to send appointment reminder notification
 */
export function useSendAppointmentReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationData) => notificationService.sendAppointmentReminder(data),
    onSuccess: (results: NotificationResult[]) => {
      const successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        toast.success(`Lembrete enviado com sucesso`);
      }

      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
    },
    onError: error => {
      console.error('Error sending appointment reminder:', error);
      toast.error('Erro ao enviar lembrete');
    },
  });
}

/**
 * Hook to send appointment cancellation notification
 */
export function useSendAppointmentCancellation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationData) => notificationService.sendAppointmentCancellation(data),
    onSuccess: (results: NotificationResult[]) => {
      const successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        toast.success('Notificação de cancelamento enviada');
      }

      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
    },
    onError: error => {
      console.error('Error sending appointment cancellation:', error);
      toast.error('Erro ao enviar notificação de cancelamento');
    },
  });
}

/**
 * Hook to get notification logs for a patient
 */
export function useNotificationLogs(patientId: string) {
  return useQuery({
    queryKey: ['notification-logs', patientId],
    queryFn: async () => {
      // This would fetch from the notification_logs table
      // For now, return empty array as placeholder
      return [];
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get notification preferences for a patient
 */
export function useNotificationPreferences(patientId: string) {
  return useQuery({
    queryKey: ['notification-preferences', patientId],
    queryFn: async () => {
      // This would fetch from the patient_notification_preferences table
      // For now, return default preferences
      return {
        email: true,
        sms: false,
        whatsapp: true,
        appointmentReminders: true,
        appointmentConfirmations: true,
        appointmentCancellations: true,
        promotionalMessages: false,
        lgpdConsent: false,
        lgpdConsentDate: new Date(),
      };
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, preferences }: {
      patientId: string;
      preferences: any;
    }) => {
      // This would update the patient_notification_preferences table
      // For now, just simulate the update
      console.log('Updating notification preferences:', { patientId, preferences });
      return preferences;
    },
    onSuccess: (_, { patientId }) => {
      toast.success('Preferências de notificação atualizadas');
      queryClient.invalidateQueries({
        queryKey: ['notification-preferences', patientId],
      });
    },
    onError: error => {
      console.error('Error updating notification preferences:', error);
      toast.error('Erro ao atualizar preferências');
    },
  });
}
