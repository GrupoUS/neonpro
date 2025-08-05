// WhatsApp React Hooks for NeonPro
// Provides React integration for WhatsApp Business API

import type { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { whatsAppService } from "@/app/lib/services/whatsapp-service";
import type {
  WhatsAppConfig,
  WhatsAppTemplate,
  WhatsAppMessage,
  WhatsAppAnalytics,
  WhatsAppConfigForm,
  WhatsAppTemplateForm,
  SendBulkMessageForm,
  WhatsAppMessageType,
} from "@/app/types/whatsapp";
import type { toast } from "react-hot-toast";

// Configuration hooks
export function useWhatsAppConfig() {
  return useQuery({
    queryKey: ["whatsapp-config"],
    queryFn: () => whatsAppService.getConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateWhatsAppConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: WhatsAppConfigForm) => whatsAppService.updateConfig(config),
    onSuccess: (data) => {
      queryClient.setQueryData(["whatsapp-config"], data);
      toast.success("Configuração do WhatsApp atualizada com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Error updating WhatsApp config:", error);
      toast.error(`Erro ao atualizar configuração: ${error.message}`);
    },
  });
}

// Template hooks
export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: () => whatsAppService.getTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useWhatsAppTemplate(name: string) {
  return useQuery({
    queryKey: ["whatsapp-template", name],
    queryFn: () => whatsAppService.getTemplate(name),
    enabled: !!name,
    staleTime: 10 * 60 * 1000,
  });
}

// Message hooks
export function useSendWhatsAppMessage() {
  return useMutation({
    mutationFn: async ({
      phoneNumber,
      content,
      type = WhatsAppMessageType.TEXT,
      patientId,
      templateName,
    }: {
      phoneNumber: string;
      content: string;
      type?: WhatsAppMessageType;
      patientId?: string;
      templateName?: string;
    }) => {
      return whatsAppService.sendMessage(phoneNumber, content, type, patientId, templateName);
    },
    onSuccess: () => {
      toast.success("Mensagem WhatsApp enviada com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Error sending WhatsApp message:", error);
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });
}

export function useSendWhatsAppTemplate() {
  return useMutation({
    mutationFn: async ({
      phoneNumber,
      templateName,
      parameters = {},
      patientId,
    }: {
      phoneNumber: string;
      templateName: string;
      parameters?: Record<string, string>;
      patientId?: string;
    }) => {
      return whatsAppService.sendTemplateMessage(phoneNumber, templateName, parameters, patientId);
    },
    onSuccess: () => {
      toast.success("Template WhatsApp enviado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Error sending WhatsApp template:", error);
      toast.error(`Erro ao enviar template: ${error.message}`);
    },
  });
}

export function useSendBulkWhatsAppMessages() {
  return useMutation({
    mutationFn: async ({
      phoneNumbers,
      templateName,
      parameters = {},
    }: {
      phoneNumbers: string[];
      templateName: string;
      parameters?: Record<string, string>;
    }) => {
      return whatsAppService.sendBulkMessages(phoneNumbers, templateName, parameters);
    },
    onSuccess: (results) => {
      toast.success(
        `Envio em massa concluído: ${results.sent} enviadas, ${results.failed} falharam`,
      );
    },
    onError: (error: Error) => {
      console.error("Error sending bulk WhatsApp messages:", error);
      toast.error(`Erro no envio em massa: ${error.message}`);
    },
  });
}

// Opt-in hooks
export function useCheckWhatsAppOptIn(phoneNumber: string) {
  return useQuery({
    queryKey: ["whatsapp-opt-in", phoneNumber],
    queryFn: () => whatsAppService.checkOptIn(phoneNumber),
    enabled: !!phoneNumber,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecordWhatsAppOptIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      phoneNumber,
      source = "manual",
      consentMessage,
    }: {
      patientId: string;
      phoneNumber: string;
      source?: string;
      consentMessage?: string;
    }) => {
      return whatsAppService.recordOptIn(patientId, phoneNumber, source, consentMessage);
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["whatsapp-opt-in", variables.phoneNumber], true);
      toast.success("Consentimento WhatsApp registrado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Error recording WhatsApp opt-in:", error);
      toast.error(`Erro ao registrar consentimento: ${error.message}`);
    },
  });
}

// Analytics hooks
export function useWhatsAppAnalytics(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["whatsapp-analytics", startDate.toISOString(), endDate.toISOString()],
    queryFn: () => whatsAppService.getAnalytics(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 60 * 1000, // 1 minute for analytics
  });
}

// Utility hooks
export function useWhatsAppStatus() {
  const { data: config, isLoading: configLoading } = useWhatsAppConfig();
  const { data: templates, isLoading: templatesLoading } = useWhatsAppTemplates();

  const isConfigured = !!(
    config?.phoneNumberId &&
    config?.accessToken &&
    config?.webhookVerifyToken &&
    config?.isActive
  );

  const hasTemplates = !!(templates && templates.length > 0);

  const isReady = isConfigured && hasTemplates;

  return {
    isConfigured,
    hasTemplates,
    isReady,
    isLoading: configLoading || templatesLoading,
    config,
    templates,
  };
}

// Form validation hooks (for use with react-hook-form)
export function useWhatsAppConfigValidation() {
  return {
    phoneNumberId: {
      required: "Phone Number ID é obrigatório",
      pattern: {
        value: /^\d+$/,
        message: "Phone Number ID deve conter apenas números",
      },
    },
    accessToken: {
      required: "Access Token é obrigatório",
      minLength: {
        value: 50,
        message: "Access Token deve ter pelo menos 50 caracteres",
      },
    },
    webhookVerifyToken: {
      required: "Webhook Verify Token é obrigatório",
      minLength: {
        value: 8,
        message: "Webhook Verify Token deve ter pelo menos 8 caracteres",
      },
    },
    businessName: {
      required: "Nome do negócio é obrigatório",
      maxLength: {
        value: 100,
        message: "Nome do negócio deve ter no máximo 100 caracteres",
      },
    },
  };
}

export function useWhatsAppTemplateValidation() {
  return {
    name: {
      required: "Nome do template é obrigatório",
      pattern: {
        value: /^[a-z0-9_]+$/,
        message: "Nome deve conter apenas letras minúsculas, números e underscore",
      },
    },
    bodyText: {
      required: "Texto do corpo é obrigatório",
      maxLength: {
        value: 1024,
        message: "Texto do corpo deve ter no máximo 1024 caracteres",
      },
    },
    headerText: {
      maxLength: {
        value: 60,
        message: "Texto do cabeçalho deve ter no máximo 60 caracteres",
      },
    },
    footerText: {
      maxLength: {
        value: 60,
        message: "Texto do rodapé deve ter no máximo 60 caracteres",
      },
    },
  };
}

// Custom hook for automatic WhatsApp notifications based on appointments
export function useWhatsAppNotifications() {
  const sendTemplate = useSendWhatsAppTemplate();
  const checkOptIn = useCheckWhatsAppOptIn;

  const sendAppointmentReminder = async (
    patientId: string,
    phoneNumber: string,
    appointmentDate: string,
    appointmentTime: string,
    doctorName: string,
  ) => {
    try {
      const isOptedIn = await whatsAppService.checkOptIn(phoneNumber);
      if (!isOptedIn) {
        throw new Error("Paciente não autorizou mensagens WhatsApp");
      }

      await sendTemplate.mutateAsync({
        phoneNumber,
        templateName: "appointment_reminder",
        parameters: {
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          doctor_name: doctorName,
        },
        patientId,
      });
    } catch (error) {
      console.error("Error sending appointment reminder:", error);
      throw error;
    }
  };

  const sendTreatmentFollowup = async (
    patientId: string,
    phoneNumber: string,
    treatmentName: string,
    doctorName: string,
    daysAfterTreatment: number,
  ) => {
    try {
      const isOptedIn = await whatsAppService.checkOptIn(phoneNumber);
      if (!isOptedIn) {
        throw new Error("Paciente não autorizou mensagens WhatsApp");
      }

      await sendTemplate.mutateAsync({
        phoneNumber,
        templateName: "treatment_followup",
        parameters: {
          treatment_name: treatmentName,
          doctor_name: doctorName,
          days_after: daysAfterTreatment.toString(),
        },
        patientId,
      });
    } catch (error) {
      console.error("Error sending treatment followup:", error);
      throw error;
    }
  };

  return {
    sendAppointmentReminder,
    sendTreatmentFollowup,
    isLoading: sendTemplate.isPending,
  };
}
