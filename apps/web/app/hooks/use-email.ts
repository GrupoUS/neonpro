import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BulkEmailResponse,
  EmailAnalytics,
  EmailDeliveryReport,
  EmailMessage,
  EmailPreview,
  EmailProviderConfig,
  EmailServiceResponse,
  EmailSettings,
  EmailTemplate,
  EmailValidationResult,
} from '@/app/types/email';
import { useToast } from '@/components/ui/use-toast';

// =======================================
// EMAIL TEMPLATE HOOKS
// =======================================

export function useEmailTemplates(filters?: {
  category?: string;
  isActive?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ['email-templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`/api/email/templates?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch email templates');
      }
      return response.json() as Promise<EmailTemplate[]>;
    },
  });
}

export function useEmailTemplate(id: string) {
  return useQuery({
    queryKey: ['email-template', id],
    queryFn: async () => {
      const response = await fetch(`/api/email/templates/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch email template');
      }
      return response.json() as Promise<EmailTemplate>;
    },
    enabled: Boolean(id),
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error('Failed to create email template');
      }

      return response.json() as Promise<EmailTemplate>;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Template criado',
        description: `Template "${template.name}" foi criado com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar template',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<EmailTemplate>;
    }) => {
      const response = await fetch(`/api/email/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update email template');
      }

      return response.json() as Promise<EmailTemplate>;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({
        queryKey: ['email-template', template.id],
      });
      toast({
        title: 'Template atualizado',
        description: `Template "${template.name}" foi atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar template',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/email/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete email template');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Template excluído',
        description: 'Template foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir template',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

// =======================================
// EMAIL SENDING HOOKS
// =======================================

export function useSendEmail() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (message: EmailMessage) => {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      return response.json() as Promise<EmailServiceResponse>;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Email enviado',
          description: 'Email foi enviado com sucesso.',
        });
      } else {
        toast({
          title: 'Falha no envio',
          description: result.error || 'Erro desconhecido ao enviar email',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar email',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useSendBulkEmail() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      messages,
      batchSize = 10,
    }: {
      messages: EmailMessage[];
      batchSize?: number;
    }) => {
      const response = await fetch('/api/email/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, batchSize }),
      });

      if (!response.ok) {
        throw new Error('Failed to send bulk emails');
      }

      return response.json() as Promise<BulkEmailResponse>;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Emails enviados',
          description: `${result.totalSent} emails enviados com sucesso. ${result.totalFailed} falharam.`,
        });
      } else {
        toast({
          title: 'Falha no envio em lote',
          description: `Todos os ${result.totalFailed} emails falharam.`,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar emails em lote',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

// =======================================
// EMAIL PREVIEW & VALIDATION HOOKS
// =======================================

export function useEmailPreview() {
  return useMutation({
    mutationFn: async ({
      templateId,
      variables,
    }: {
      templateId: string;
      variables: Record<string, any>;
    }) => {
      const response = await fetch('/api/email/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, variables }),
      });

      if (!response.ok) {
        throw new Error('Failed to preview email');
      }

      return response.json() as Promise<EmailPreview>;
    },
  });
}

export function useValidateEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/email/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate email');
      }

      return response.json() as Promise<EmailValidationResult>;
    },
  });
}

// =======================================
// EMAIL ANALYTICS HOOKS
// =======================================

export function useEmailAnalytics(filters?: {
  startDate?: Date;
  endDate?: Date;
  templateId?: string;
  campaignId?: string;
}) {
  return useQuery({
    queryKey: ['email-analytics', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      if (filters?.templateId) {
        params.append('templateId', filters.templateId);
      }
      if (filters?.campaignId) {
        params.append('campaignId', filters.campaignId);
      }

      const response = await fetch(`/api/email/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch email analytics');
      }
      return response.json() as Promise<EmailAnalytics>;
    },
  });
}

export function useEmailDeliveryReport(messageId: string) {
  return useQuery({
    queryKey: ['email-delivery-report', messageId],
    queryFn: async () => {
      const response = await fetch(`/api/email/delivery/${messageId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch delivery report');
      }
      return response.json() as Promise<EmailDeliveryReport>;
    },
    enabled: Boolean(messageId),
  });
}

export function useEmailEvents(filters?: {
  startDate?: Date;
  endDate?: Date;
  messageId?: string;
  event?: string;
}) {
  return useQuery({
    queryKey: ['email-events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      if (filters?.messageId) {
        params.append('messageId', filters.messageId);
      }
      if (filters?.event) {
        params.append('event', filters.event);
      }

      const response = await fetch(`/api/email/events?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch email events');
      }
      return response.json();
    },
  });
}

// =======================================
// EMAIL SETTINGS HOOKS
// =======================================

export function useEmailSettings() {
  return useQuery({
    queryKey: ['email-settings'],
    queryFn: async () => {
      const response = await fetch('/api/email/settings');
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch email settings');
      }
      return response.json() as Promise<EmailSettings>;
    },
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<EmailSettings>) => {
      const response = await fetch('/api/email/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update email settings');
      }

      return response.json() as Promise<EmailSettings>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      toast({
        title: 'Configurações atualizadas',
        description: 'Configurações de email foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar configurações',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

// =======================================
// EMAIL PROVIDER HOOKS
// =======================================

export function useEmailProviders() {
  return useQuery({
    queryKey: ['email-providers'],
    queryFn: async () => {
      const response = await fetch('/api/email/providers');
      if (!response.ok) {
        throw new Error('Failed to fetch email providers');
      }
      return response.json() as Promise<EmailProviderConfig[]>;
    },
  });
}

export function useCreateEmailProvider() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (provider: Omit<EmailProviderConfig, 'id'>) => {
      const response = await fetch('/api/email/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider),
      });

      if (!response.ok) {
        throw new Error('Failed to create email provider');
      }

      return response.json() as Promise<EmailProviderConfig>;
    },
    onSuccess: (provider) => {
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
      toast({
        title: 'Provedor criado',
        description: `Provedor "${provider.name}" foi criado com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar provedor',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEmailProvider() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<EmailProviderConfig>;
    }) => {
      const response = await fetch(`/api/email/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update email provider');
      }

      return response.json() as Promise<EmailProviderConfig>;
    },
    onSuccess: (provider) => {
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
      toast({
        title: 'Provedor atualizado',
        description: `Provedor "${provider.name}" foi atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar provedor',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEmailProvider() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/email/providers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete email provider');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
      toast({
        title: 'Provedor excluído',
        description: 'Provedor foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir provedor',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useTestEmailProvider() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/email/providers/${id}/test`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to test email provider');
      }

      return response.json() as Promise<{ success: boolean; message: string }>;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Teste bem-sucedido',
          description: result.message || 'Provedor testado com sucesso.',
        });
      } else {
        toast({
          title: 'Teste falhou',
          description: result.message || 'Teste do provedor falhou.',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro ao testar provedor',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

// =======================================
// EMAIL SUPPRESSION HOOKS
// =======================================

export function useEmailSuppressions() {
  return useQuery({
    queryKey: ['email-suppressions'],
    queryFn: async () => {
      const response = await fetch('/api/email/suppressions');
      if (!response.ok) {
        throw new Error('Failed to fetch email suppressions');
      }
      return response.json();
    },
  });
}

export function useAddEmailSuppression() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      email,
      reason,
    }: {
      email: string;
      reason: string;
    }) => {
      const response = await fetch('/api/email/suppressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to add email suppression');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-suppressions'] });
      toast({
        title: 'Email suprimido',
        description: 'Email foi adicionado à lista de supressão.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao suprimir email',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveEmailSuppression() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(
        `/api/email/suppressions/${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to remove email suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-suppressions'] });
      toast({
        title: 'Supressão removida',
        description: 'Email foi removido da lista de supressão.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover supressão',
        description:
          error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });
}

// =======================================
// UTILITY HOOKS
// =======================================

export function useEmailQuota() {
  return useQuery({
    queryKey: ['email-quota'],
    queryFn: async () => {
      const response = await fetch('/api/email/quota');
      if (!response.ok) {
        throw new Error('Failed to fetch email quota');
      }
      return response.json() as Promise<{
        used: number;
        limit: number;
        resetDate?: Date;
        provider: string;
      }>;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useEmailHealth() {
  return useQuery({
    queryKey: ['email-health'],
    queryFn: async () => {
      const response = await fetch('/api/email/health');
      if (!response.ok) {
        throw new Error('Failed to fetch email health');
      }
      return response.json() as Promise<{
        providers: Array<{
          name: string;
          provider: string;
          status: 'healthy' | 'degraded' | 'down';
          lastChecked: Date;
          responseTime?: number;
        }>;
        overall: 'healthy' | 'degraded' | 'down';
      }>;
    },
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

// =======================================
// EXPORT ALL HOOKS
// =======================================

export {
  // Template hooks
  useEmailTemplates,
  useEmailTemplate,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  // Sending hooks
  useSendEmail,
  useSendBulkEmail,
  // Preview & validation hooks
  useEmailPreview,
  useValidateEmail,
  // Analytics hooks
  useEmailAnalytics,
  useEmailDeliveryReport,
  useEmailEvents,
  // Settings hooks
  useEmailSettings,
  useUpdateEmailSettings,
  // Provider hooks
  useEmailProviders,
  useCreateEmailProvider,
  useUpdateEmailProvider,
  useDeleteEmailProvider,
  useTestEmailProvider,
  // Suppression hooks
  useEmailSuppressions,
  useAddEmailSuppression,
  useRemoveEmailSuppression,
  // Utility hooks
  useEmailQuota,
  useEmailHealth,
};
