/**
 * AI Agent Chat Component
 * Healthcare professional conversational interface using CopilotKit
 */

'use client';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { CopilotChat } from '@copilotkit/react-ui';
import { AgentAction } from '@neonpro/types';
import React, { useCallback, useRef, useState } from 'react';

interface AIChatProps {
  className?: string;
  initialContext?: {
    domain?: string;
    professionalId?: string;
  };
}

export function AIChat({ className, initialContext }: AIChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    context: {
      userId: user?.id || '',
      userRole: user?.role || '',
      domain: initialContext?.domain,
    },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom instructions for healthcare context
  const instructions = `
    Você é um assistente de IA especializado em gestão de clínicas estéticas no Brasil.
    
    Suas responsabilidades:
    1. Ajudar profissionais de saúde a encontrar informações sobre pacientes
    2. Consultar agendamentos e horários
    3. Fornecer resumos financeiros
    4. Manter conformidade com LGPD (Lei Geral de Proteção de Dados)
    5. Nunca compartilhar informações de pacientes sensíveis sem consentimento
    
    REGRAS IMPORTANTES:
    - Sempre verifique o consentimento LGPD antes de acessar dados de pacientes
    - Use linguagem profissional e respeitosa
    - Mantenha o foco em informações relevantes para atendimento clínico
    - Quando não tiver certeza, peça esclarecimentos
    - Para dados sensíveis, use "paciente" em vez de nomes completos
    
    EXEMPLOS DE INTERAÇÃO:
    - Usuário: "Quais meus agendamentos para hoje?"
    - IA: [Busca agendamentos do profissional para hoje]
    
    - Usuário: "Buscar paciente João Silva"
    - IA: [Verifica consentimento LGPD e busca informações básicas]
  `;

  // Handle message submission
  const handleSubmit = useCallback(
    async (_message: any) => {
      if (!user) {
        toast({
          title: 'Erro de autenticação',
          description: 'Por favor, faça login para usar o assistente',
          variant: 'destructive',
        });
        return;
      }

      setChatState(prev => ({ ...prev, isLoading: true }));

      try {
        const response = await fetch('/api/ai/data-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
          body: JSON.stringify({
            query: message,
            context: {
              userId: user.id,
              userRole: user.role,
              domain: initialContext?.domain,
            },
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error?.message || 'Falha ao processar sua solicitação',
          );
        }

        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: data.response.message,
          timestamp: new Date().toISOString(),
          data: data.response.data,
          actions: data.response.actions,
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));

        // Handle actions if any
        if (data.response.actions && data.response.actions.length > 0) {
          handleActions(data.response.actions);
        }
      } catch (error) {
        console.error('Chat error:', _error);
        toast({
          title: 'Erro',
          description: error instanceof Error
            ? error.message
            : 'Falha ao processar mensagem',
          variant: 'destructive',
        });

        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content:
            'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
          timestamp: new Date().toISOString(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
          isLoading: false,
        }));
      }
    },
    [user, initialContext, toast],
  );

  // Handle agent actions
  const handleActions = useCallback((actions: AgentAction[]) => {
    actions.forEach(_action => {
      switch (action.type) {
        case 'view_details':
          if (action.payload?.clientId) {
            // Navigate to patient details
            window.location.href = `/pacientes/${action.payload.clientId}`;
          }
          break;
        case 'create_appointment':
          // Navigate to appointment creation
          window.location.href = '/agendamentos/novo';
          break;
        case 'navigate':
          if (action.payload?.path) {
            window.location.href = action.payload.path;
          }
          break;
        case 'export_data':
          handleExportData(action.payload);
          break;
        case 'refresh':
          // Refresh current view
          window.location.reload();
          break;
      }
    });
  }, []);

  // Handle data export
  const handleExportData = useCallback(
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
      } catch {
        toast({
          title: 'Erro de exportação',
          description: 'Não foi possível exportar os dados',
          variant: 'destructive',
        });
      }
    },
    [user, toast],
  );

  // Custom message renderer
  const renderMessage = useCallback(
    (_message: any) => {
      if (message.role === 'system') return null;

      return (
        <div
          key={message.id}
          className={cn(
            'flex gap-3 p-4 rounded-lg',
            message.role === 'user'
              ? 'bg-primary/5 ml-auto max-w-[80%]'
              : 'bg-muted/50 mr-auto max-w-[85%]',
          )}
        >
          <div className='flex-1 space-y-2'>
            <p className='text-sm leading-relaxed'>{message.content}</p>

            {/* Render structured data */}
            {message.data && (
              <div className='mt-3 space-y-2'>
                {message.data.clients && (
                  <div className='bg-white rounded-md p-3 border'>
                    <h4 className='font-medium text-sm mb-2'>
                      Pacientes encontrados:
                    </h4>
                    <ul className='space-y-1'>
                      {message.data.clients.slice(0, 5).map((client: any) => (
                        <li
                          key={client.id}
                          className='text-sm text-muted-foreground'
                        >
                          {client.name} - {client.phone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.data.appointments && (
                  <div className='bg-white rounded-md p-3 border'>
                    <h4 className='font-medium text-sm mb-2'>Agendamentos:</h4>
                    <ul className='space-y-1'>
                      {message.data.appointments.slice(0, 5).map((apt: any) => (
                        <li
                          key={apt.id}
                          className='text-sm text-muted-foreground'
                        >
                          {new Date(apt.scheduledAt).toLocaleString('pt-BR')} - {apt.clientName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.data.financial && (
                  <div className='bg-white rounded-md p-3 border'>
                    <h4 className='font-medium text-sm mb-2'>
                      Resumo Financeiro:
                    </h4>
                    <p className='text-sm'>
                      Total: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(message.data.summary?.total || 0)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Render action buttons */}
            {message.actions && message.actions.length > 0 && (
              <div className='flex gap-2 mt-3'>
                {message.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleActions([action])}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-md transition-colors',
                      action.primary
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <p className='text-xs text-muted-foreground mt-2'>
              {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      );
    },
    [handleActions],
  );

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Custom CopilotKit UI with healthcare styling */}
      <CopilotChat
        instructions={instructions}
        labels={{
          initial: 'Olá! Como posso ajudar você hoje?',
          placeholder: 'Ex: Quais meus agendamentos para hoje?',
          title: 'Assistente NeonPro',
        }}
        className='h-full'
        sendMessage={handleSubmit}
        renderMessages={() => (
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {chatState.messages.map(renderMessage)}
            {chatState.isLoading && (
              <div className='flex gap-3 p-4'>
                <div className='bg-muted/50 rounded-lg p-3'>
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'>
                    </div>
                    <span className='text-sm'>Processando...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      />
    </div>
  );
}

export default AIChat;
