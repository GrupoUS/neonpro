/**
 * Patient Communication Hooks
 * React Query hooks for patient communication and notifications
 */

import { patientCommunicationService } from '@/services/patient-communication.service';
import type {
  CommunicationFilters,
  CommunicationSettings,
  CreateCommunicationTemplateRequest,
  PatientCommunicationPreferences,
  SendMessageRequest,
  UpdateCommunicationTemplateRequest,
} from '@/types/patient-communication';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query Keys
export const communicationKeys = {
  all: ['communication'] as const,
  templates: () => [...communicationKeys.all, 'templates'] as const,
  templatesList: (clinicId: string, filters?: any) =>
    [...communicationKeys.templates(), clinicId, filters] as const,
  messages: () => [...communicationKeys.all, 'messages'] as const,
  messagesList: (clinicId: string, filters?: CommunicationFilters) =>
    [...communicationKeys.messages(), clinicId, filters] as const,
  settings: (clinicId: string) => [...communicationKeys.all, 'settings', clinicId] as const,
  preferences: (patientId: string) => [...communicationKeys.all, 'preferences', patientId] as const,
  stats: (clinicId: string, startDate?: string, endDate?: string) =>
    [...communicationKeys.all, 'stats', clinicId, startDate, endDate] as const,
};

/**
 * Hook to get communication templates
 */
export function useCommunicationTemplates(
  clinicId: string,
  filters?: {
    message_type?: string;
    communication_type?: string;
    is_active?: boolean;
  },
) {
  return useQuery({
    queryKey: communicationKeys.templatesList(clinicId, filters),
    queryFn: () => patientCommunicationService.getCommunicationTemplates(clinicId, filters),
    enabled: !!clinicId,
  });
}

/**
 * Hook to create a communication template
 */
export function useCreateCommunicationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      request,
    }: {
      clinicId: string;
      request: CreateCommunicationTemplateRequest;
    }) =>
      patientCommunicationService.createCommunicationTemplate(
        clinicId,
        request,
      ),

    onSuccess: () => {
      // Invalidate templates list
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templates(),
      });

      toast.success('Template de comunicação criado com sucesso!');
    },

    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error creating communication template:', error);
      toast.error(`Erro ao criar template: ${error.message}`);
    },
  });
}

/**
 * Hook to update a communication template
 */
export function useUpdateCommunicationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateCommunicationTemplateRequest;
    }) => patientCommunicationService.updateCommunicationTemplate(id, request),

    onSuccess: () => {
      // Invalidate templates list
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templates(),
      });

      toast.success('Template de comunicação atualizado com sucesso!');
    },

    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error updating communication template:', error);
      toast.error(`Erro ao atualizar template: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a communication template
 */
export function useDeleteCommunicationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientCommunicationService.deleteCommunicationTemplate(id),

    onSuccess: () => {
      // Invalidate templates list
      queryClient.invalidateQueries({
        queryKey: communicationKeys.templates(),
      });

      toast.success('Template de comunicação excluído com sucesso!');
    },

    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error deleting communication template:', error);
      toast.error(`Erro ao excluir template: ${error.message}`);
    },
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      request,
    }: {
      clinicId: string;
      request: SendMessageRequest;
    }) => patientCommunicationService.sendMessage(clinicId, request),

    onSuccess: () => {
      // Invalidate messages list
      queryClient.invalidateQueries({
        queryKey: communicationKeys.messages(),
      });

      toast.success('Mensagem enviada com sucesso!');
    },

    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error sending message:', error);
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });
}

/**
 * Hook to get communication messages
 */
export function useCommunicationMessages(
  clinicId: string,
  filters?: CommunicationFilters,
) {
  return useQuery({
    queryKey: communicationKeys.messagesList(clinicId, filters),
    queryFn: () => patientCommunicationService.getCommunicationMessages(clinicId, filters),
    enabled: !!clinicId,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for status updates
  });
}

/**
 * Hook to get communication settings
 */
export function useCommunicationSettings(clinicId: string) {
  return useQuery({
    queryKey: communicationKeys.settings(clinicId),
    queryFn: () => patientCommunicationService.getCommunicationSettings(clinicId),
    enabled: !!clinicId,
  });
}

/**
 * Hook to update communication settings
 */
export function useUpdateCommunicationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      settings,
    }: {
      clinicId: string;
      settings: Partial<CommunicationSettings>;
    }) =>
      patientCommunicationService.updateCommunicationSettings(
        clinicId,
        settings,
      ),

    onSuccess: data => {
      // Update settings in cache
      queryClient.setQueryData(
        communicationKeys.settings(data.clinic_id),
        data,
      );

      toast.success('Configurações de comunicação atualizadas com sucesso!');
    },

    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error updating communication settings:', error);
      toast.error(`Erro ao atualizar configurações: ${error.message}`);
    },
  });
}

/**
 * Hook to get patient communication preferences
 */
export function usePatientCommunicationPreferences(patientId: string) {
  return useQuery({
    queryKey: communicationKeys.preferences(patientId),
    queryFn: () => patientCommunicationService.getPatientCommunicationPreferences(patientId),
    enabled: !!patientId,
  });
}

/**
 * Hook to update patient communication preferences
 */
export function useUpdatePatientCommunicationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      preferences,
    }: {
      patientId: string;
      preferences: Partial<PatientCommunicationPreferences>;
    }) =>
      patientCommunicationService.updatePatientCommunicationPreferences(
        patientId,
        preferences,
      ),

    onSuccess: data => {
      // Update preferences in cache
      queryClient.setQueryData(
        communicationKeys.preferences(data.patient_id),
        data,
      );

      toast.success('Preferências de comunicação atualizadas com sucesso!');
    },

    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error updating patient communication preferences:', error);
      toast.error(`Erro ao atualizar preferências: ${error.message}`);
    },
  });
}

/**
 * Hook to get communication statistics
 */
export function useCommunicationStats(
  clinicId: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: communicationKeys.stats(clinicId, startDate, endDate),
    queryFn: () =>
      patientCommunicationService.getCommunicationStats(
        clinicId,
        startDate,
        endDate,
      ),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to schedule appointment reminders
 */
export function useScheduleAppointmentReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      appointmentId,
    }: {
      clinicId: string;
      appointmentId: string;
    }) =>
      patientCommunicationService.scheduleAppointmentReminders(
        clinicId,
        appointmentId,
      ),

    onSuccess: data => {
      // Invalidate messages list to show new scheduled messages
      queryClient.invalidateQueries({
        queryKey: communicationKeys.messages(),
      });

      toast.success(`${data.scheduled_count} lembretes agendados com sucesso!`);
    },

    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error scheduling appointment reminders:', error);
      toast.error(`Erro ao agendar lembretes: ${error.message}`);
    },
  });
}

/**
 * Hook to cancel scheduled messages
 */
export function useCancelScheduledMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      messageTypes,
    }: {
      appointmentId: string;
      messageTypes?: string[];
    }) =>
      patientCommunicationService.cancelScheduledMessages(
        appointmentId,
        messageTypes,
      ),

    onSuccess: data => {
      // Invalidate messages list to reflect cancelled messages
      queryClient.invalidateQueries({
        queryKey: communicationKeys.messages(),
      });

      toast.success(
        `${data.cancelled_count} mensagens canceladas com sucesso!`,
      );
    },

    onError: (_error: [a-zA-Z][a-zA-Z]*) => {
      console.error('Error cancelling scheduled messages:', error);
      toast.error(`Erro ao cancelar mensagens: ${error.message}`);
    },
  });
}
