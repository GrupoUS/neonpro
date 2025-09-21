/**
 * AI Agent Hook
 * Custom hook for interacting with the AI agent service
 */

'use client';

import { AgentAction } from '@neonpro/types';
import { useCallback, useState } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

interface UseAIAgentOptions {
  initialContext?: {
    domain?: string;
    professionalId?: string;
  };
}

interface UseAIAgentReturn {
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  messages: ChatMessage[];
  clearChat: () => void;
  exportData: (payload: any) => Promise<void>;
}

export function useAIAgent(options: UseAIAgentOptions = {}): UseAIAgentReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Send message to AI agent
  const sendMessage = useCallback(
    async (_message: any) => {
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      try {
        const request: DataAgentRequest = {
          query: message,
          context: {
            userId: user.id,
            userRole: user.role,
            domain: options.initialContext?.domain,
          },
        };

        const response = await fetch('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify(request),
        });

        const data: DataAgentResponse = await response.json();

        if (!data.success) {
          throw new Error(
            data.error?.message || 'Falha ao processar solicitação',
          );
        }

        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.response!.message,
          timestamp: new Date().toISOString(),
          data: data.response!.data,
          actions: data.response!.actions,
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Handle actions if any
        if (data.response?.actions && data.response.actions.length > 0) {
          handleActions(data.response.actions);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(errorMessage);

        // Add error message to chat
        const errorMessageObj: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content:
            'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, errorMessageObj]);

        toast({
          title: 'Erro no assistente',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, options.initialContext, toast],
  );

  // Handle agent actions
  const handleActions = useCallback((actions: AgentAction[]) => {
    actions.forEach(_action => {
      switch (action.type) {
        case 'view_details':
          if (action.payload?.clientId) {
            window.location.href = `/pacientes/${action.payload.clientId}`;
          }
          break;
        case 'create_appointment':
          window.location.href = '/agendamentos/novo';
          break;
        case 'navigate':
          if (action.payload?.path) {
            window.location.href = action.payload.path;
          }
          break;
        case 'export_data':
          exportData(action.payload);
          break;
        case 'refresh':
          window.location.reload();
          break;
      }
    });
  }, []);

  // Export data functionality
  const exportData = useCallback(
    async (_payload: any) => {
      try {
        const response = await fetch('/api/ai/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user?.getIdToken()}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `relatorio-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          toast({
            title: 'Exportação concluída',
            description: 'Seu relatório foi baixado com sucesso',
          });
        }
      } catch (_error) {
        toast({
          title: 'Erro de exportação',
          description: 'Não foi possível exportar os dados',
          variant: 'destructive',
        });
      }
    },
    [user, toast],
  );

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    messages,
    clearChat,
    exportData,
  };
}

// Hook for AI agent configuration
export function useAIAgentConfig() {
  const [context, setContext] = useState<{
    domain?: string;
    professionalId?: string;
  }>({});

  const updateContext = useCallback((newContext: Partial<typeof context>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  }, []);

  const clearContext = useCallback(() => {
    setContext({});
  }, []);

  return {
    context,
    updateContext,
    clearContext,
  };
}

// Hook for AI agent suggestions
export function useAIAgentSuggestions(query: string): string[] {
  const suggestions = [
    'Quais meus agendamentos para hoje?',
    'Buscar paciente João Silva',
    'Resumo financeiro deste mês',
    'Agendar nova consulta',
    'Ver próximos horários disponíveis',
  ];

  // Filter suggestions based on query
  const filtered = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.slice(0, 3);
}
