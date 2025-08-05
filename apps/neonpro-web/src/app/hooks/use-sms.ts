// SMS React Hooks for NeonPro
// Comprehensive React hooks for SMS integration with TanStack Query

import type { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { toast } from "sonner";
import type { smsService } from "@/app/lib/services/sms-service";
import type {
  SMSProvider,
  SMSProviderConfig,
  SMSMessage,
  SMSTemplate,
  SMSOptIn,
  BulkSMSRequest,
  BulkSMSResponse,
  SendSMSResponse,
  SMSAnalytics,
  SMSIntegrationStatus,
  SMSListParams,
  SMSListResponse,
} from "@/app/types/sms";

// ==================== QUERY KEYS ====================

export const SMS_QUERY_KEYS = {
  all: ["sms"] as const,
  providers: () => [...SMS_QUERY_KEYS.all, "providers"] as const,
  activeProvider: () => [...SMS_QUERY_KEYS.all, "activeProvider"] as const,
  messages: (params?: SMSListParams) => [...SMS_QUERY_KEYS.all, "messages", params] as const,
  message: (id: string) => [...SMS_QUERY_KEYS.all, "message", id] as const,
  templates: () => [...SMS_QUERY_KEYS.all, "templates"] as const,
  template: (id: string) => [...SMS_QUERY_KEYS.all, "template", id] as const,
  optIns: () => [...SMS_QUERY_KEYS.all, "optIns"] as const,
  optIn: (phone: string) => [...SMS_QUERY_KEYS.all, "optIn", phone] as const,
  analytics: (startDate: string, endDate: string, period?: string) =>
    [...SMS_QUERY_KEYS.all, "analytics", startDate, endDate, period] as const,
  integration: (provider: SMSProvider) => [...SMS_QUERY_KEYS.all, "integration", provider] as const,
} as const;

// ==================== PROVIDER HOOKS ====================

/**
 * Hook to fetch all SMS providers
 */
export function useSMSProviders() {
  return useQuery({
    queryKey: SMS_QUERY_KEYS.providers(),
    queryFn: () => smsService.getProviders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch active SMS provider
 */
export function useActiveSMSProvider() {
  return useQuery({
    queryKey: SMS_QUERY_KEYS.activeProvider(),
    queryFn: () => smsService.getActiveProvider(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create or update SMS provider
 */
export function useUpsertSMSProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Omit<SMSProviderConfig, "id" | "created_at" | "updated_at">) =>
      smsService.upsertProvider(config),
    onSuccess: (data) => {
      // Invalidate and refetch providers
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.providers() });
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.activeProvider() });

      toast.success(`Provedor SMS ${data.provider} configurado com sucesso!`);
    },
    onError: (error) => {
      console.error("Error upserting SMS provider:", error);
      toast.error(`Erro ao configurar provedor SMS: ${error.message}`);
    },
  });
}

/**
 * Hook to test SMS provider connection
 */
export function useTestSMSProvider() {
  return useMutation({
    mutationFn: ({ providerId, testPhone }: { providerId: string; testPhone: string }) =>
      smsService.testProvider(providerId, testPhone),
    onSuccess: (success, variables) => {
      if (success) {
        toast.success("Teste de conexão SMS realizado com sucesso!");
      } else {
        toast.error("Falha no teste de conexão SMS. Verifique as configurações.");
      }
    },
    onError: (error) => {
      console.error("Error testing SMS provider:", error);
      toast.error(`Erro no teste SMS: ${error.message}`);
    },
  });
}

// ==================== MESSAGE HOOKS ====================

/**
 * Hook to fetch SMS messages with filtering and pagination
 */
export function useSMSMessages(params: SMSListParams = {}) {
  return useQuery({
    queryKey: SMS_QUERY_KEYS.messages(params),
    queryFn: () => smsService.getMessages(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch single SMS message
 */
export function useSMSMessage(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: SMS_QUERY_KEYS.message(id),
    queryFn: () => smsService.getMessage(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to send individual SMS message
 */
export function useSendSMS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      provider_id: string;
      to: string;
      body: string;
      template_id?: string;
      variables?: Record<string, string>;
    }) => smsService.sendMessage(params),
    onSuccess: (data, variables) => {
      // Invalidate messages list to show new message
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.messages() });

      toast.success(`SMS enviado para ${variables.to} com sucesso!`);
    },
    onError: (error, variables) => {
      console.error("Error sending SMS:", error);
      toast.error(`Erro ao enviar SMS para ${variables.to}: ${error.message}`);
    },
  });
}

/**
 * Hook to send bulk SMS messages
 */
export function useSendBulkSMS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkSMSRequest) => smsService.sendBulkMessages(request),
    onSuccess: (data) => {
      // Invalidate messages list to show new messages
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.messages() });

      const successRate = ((data.queued_messages / data.total_messages) * 100).toFixed(1);
      toast.success(
        `Envio em lote concluído: ${data.queued_messages}/${data.total_messages} mensagens enviadas (${successRate}%)`,
      );

      if (data.failed_messages > 0) {
        toast.warning(`${data.failed_messages} mensagens falharam no envio.`);
      }
    },
    onError: (error) => {
      console.error("Error sending bulk SMS:", error);
      toast.error(`Erro no envio em lote: ${error.message}`);
    },
  });
}

// ==================== TEMPLATE HOOKS ====================

/**
 * Hook to fetch SMS templates
 */
export function useSMSTemplates() {
  return useQuery({
    queryKey: SMS_QUERY_KEYS.templates(),
    queryFn: () => smsService.getTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create or update SMS template
 */
export function useUpsertSMSTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: Omit<SMSTemplate, "id" | "created_at" | "updated_at">) =>
      smsService.upsertTemplate(template),
    onSuccess: (data) => {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.templates() });

      toast.success(`Template SMS "${data.name}" salvo com sucesso!`);
    },
    onError: (error) => {
      console.error("Error upserting SMS template:", error);
      toast.error(`Erro ao salvar template SMS: ${error.message}`);
    },
  });
}

/**
 * Hook to delete SMS template
 */
export function useDeleteSMSTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await smsService["supabase"].from("sms_templates").delete().eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.templates() });

      toast.success("Template SMS removido com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting SMS template:", error);
      toast.error(`Erro ao remover template SMS: ${error.message}`);
    },
  });
}

// ==================== OPT-IN HOOKS ====================

/**
 * Hook to check opt-in status for phone number
 */
export function useSMSOptInStatus(phoneNumber: string, enabled: boolean = true) {
  return useQuery({
    queryKey: SMS_QUERY_KEYS.optIn(phoneNumber),
    queryFn: () => smsService.checkOptInStatus(phoneNumber),
    enabled: enabled && !!phoneNumber,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update opt-in status
 */
export function useUpdateSMSOptIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      phoneNumber: string;
      status: "opted_in" | "opted_out";
      source?: string;
      patientId?: string;
    }) =>
      smsService.updateOptInStatus(
        params.phoneNumber,
        params.status,
        params.source,
        params.patientId,
      ),
    onSuccess: (data, variables) => {
      // Invalidate opt-in queries
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.optIn(variables.phoneNumber) });
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.optIns() });

      const statusText = variables.status === "opted_in" ? "autorizado" : "removido";
      toast.success(`Contato ${variables.phoneNumber} ${statusText} para SMS!`);
    },
    onError: (error, variables) => {
      console.error("Error updating SMS opt-in:", error);
      toast.error(
        `Erro ao atualizar autorização SMS para ${variables.phoneNumber}: ${error.message}`,
      );
    },
  });
}

// ==================== ANALYTICS HOOKS ====================

/**
 * Hook to fetch SMS analytics
 */
export function useSMSAnalytics(
  startDate: string,
  endDate: string,
  period: "day" | "week" | "month" = "day",
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: SMS_QUERY_KEYS.analytics(startDate, endDate, period),
    queryFn: () => smsService.getAnalytics(startDate, endDate, period),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== WEBHOOK HOOKS ====================

/**
 * Hook to process SMS webhook
 */
export function useProcessSMSWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { provider: SMSProvider; payload: any }) =>
      smsService.processWebhook(params.provider, params.payload),
    onSuccess: () => {
      // Invalidate messages to refresh status
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.messages() });
    },
    onError: (error) => {
      console.error("Error processing SMS webhook:", error);
      toast.error(`Erro ao processar webhook SMS: ${error.message}`);
    },
  });
}

// ==================== INTEGRATION STATUS HOOKS ====================

/**
 * Hook to get SMS provider integration status
 */
export function useSMSIntegrationStatus(provider: SMSProvider, enabled: boolean = true) {
  return useQuery({
    queryKey: SMS_QUERY_KEYS.integration(provider),
    queryFn: async (): Promise<SMSIntegrationStatus> => {
      // This would be implemented as a service method
      // For now, return a mock status
      return {
        provider,
        status: "connected",
        last_test: new Date().toISOString(),
        webhook_status: "active",
        features: {
          supports_delivery_reports: true,
          supports_two_way: true,
          supports_bulk: true,
          supports_scheduling: false,
          supports_templates: true,
          max_message_length: 1600,
          max_bulk_size: 1000,
          rate_limit_per_second: 1,
          supported_countries: ["BR"],
        },
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook to format phone numbers for Brazilian format
 */
export function useFormatPhoneNumber() {
  return {
    formatToInternational: (phone: string): string => {
      // Remove all non-digits
      const digits = phone.replace(/\D/g, "");

      // Handle different formats
      if (digits.length === 11 && digits.startsWith("55")) {
        // Already has country code
        return `+${digits}`;
      } else if (digits.length === 11) {
        // Mobile number without country code
        return `+55${digits}`;
      } else if (digits.length === 10) {
        // Landline without country code
        return `+55${digits}`;
      } else if (digits.length === 9) {
        // Mobile without area code (assume São Paulo 11)
        return `+5511${digits}`;
      }

      return phone; // Return as-is if can't format
    },

    formatToDisplay: (phone: string): string => {
      const digits = phone.replace(/\D/g, "");

      if (digits.length === 13 && digits.startsWith("55")) {
        // +55 11 99999-9999
        return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
      } else if (digits.length === 11) {
        // (11) 99999-9999
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length === 10) {
        // (11) 9999-9999
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      }

      return phone;
    },

    isValidBrazilianPhone: (phone: string): boolean => {
      const digits = phone.replace(/\D/g, "");

      // Check various valid formats
      if (digits.length === 13 && digits.startsWith("55")) {
        return true; // +55 format
      } else if (digits.length === 11 || digits.length === 10) {
        return true; // National format
      } else if (digits.length === 9) {
        return true; // Mobile without area code
      }

      return false;
    },
  };
}

/**
 * Hook to calculate SMS message statistics
 */
export function useSMSMessageStats(messages: SMSMessage[]) {
  return {
    totalMessages: messages.length,
    sentMessages: messages.filter((m) => m.status === "sent" || m.status === "delivered").length,
    deliveredMessages: messages.filter((m) => m.status === "delivered").length,
    failedMessages: messages.filter((m) => m.status === "failed" || m.status === "undelivered")
      .length,
    deliveryRate:
      messages.length > 0
        ? (messages.filter((m) => m.status === "delivered").length / messages.length) * 100
        : 0,
    totalCost: messages.reduce((sum, m) => sum + (m.cost || 0), 0),
    averageCostPerMessage:
      messages.length > 0
        ? messages.reduce((sum, m) => sum + (m.cost || 0), 0) / messages.length
        : 0,
    messagesByProvider: messages.reduce(
      (acc, m) => {
        acc[m.provider] = (acc[m.provider] || 0) + 1;
        return acc;
      },
      {} as Record<SMSProvider, number>,
    ),
    messagesByStatus: messages.reduce(
      (acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };
}

/**
 * Hook to validate SMS message content
 */
export function useSMSValidation() {
  return {
    validateMessage: (body: string): { isValid: boolean; errors: string[]; warnings: string[] } => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!body.trim()) {
        errors.push("Mensagem não pode estar vazia");
      }

      if (body.length > 1600) {
        errors.push("Mensagem muito longa (máximo 1600 caracteres)");
      }

      if (body.length > 160) {
        const parts = Math.ceil(body.length / 160);
        warnings.push(`Mensagem será enviada em ${parts} partes`);
      }

      // Check for common issues
      if (body.includes("{{") && body.includes("}}")) {
        warnings.push("Mensagem contém variáveis. Certifique-se de usar um template.");
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },

    estimateCost: (
      messageLength: number,
      recipients: number,
      costPerMessage: number = 0.05,
    ): number => {
      const parts = Math.ceil(messageLength / 160);
      return recipients * parts * costPerMessage;
    },

    extractVariables: (template: string): string[] => {
      const matches = template.match(/\{\{\s*([^}]+)\s*\}\}/g);
      return matches ? matches.map((match) => match.replace(/[{}]/g, "").trim()) : [];
    },
  };
}

// ==================== REAL-TIME HOOKS ====================

/**
 * Hook for real-time SMS message updates
 */
export function useRealtimeSMSMessages() {
  const queryClient = useQueryClient();

  // This would be implemented with Supabase real-time subscriptions
  // For now, we'll use polling as a fallback
  return useQuery({
    queryKey: ["sms", "realtime"],
    queryFn: async () => {
      // Poll for recent messages
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      return smsService.getMessages({
        filters: { date_from: fiveMinutesAgo },
        limit: 100,
      });
    },
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
    onSuccess: () => {
      // Invalidate main messages query to update UI
      queryClient.invalidateQueries({ queryKey: SMS_QUERY_KEYS.messages() });
    },
  });
}

/**
 * Hook to manage SMS configuration wizard state
 */
export function useSMSConfigurationWizard() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [providerType, setProviderType] = React.useState<SMSProvider | null>(null);
  const [configuration, setConfiguration] = React.useState<any>({});

  const steps = [
    "Escolher Provedor",
    "Configurar Credenciais",
    "Testar Conexão",
    "Confirmar Configuração",
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const resetWizard = () => {
    setCurrentStep(0);
    setProviderType(null);
    setConfiguration({});
  };

  return {
    currentStep,
    totalSteps: steps.length,
    stepTitle: steps[currentStep],
    providerType,
    setProviderType,
    configuration,
    setConfiguration,
    nextStep,
    prevStep,
    resetWizard,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
  };
}

// React import for hooks that need it
import React from "react";
