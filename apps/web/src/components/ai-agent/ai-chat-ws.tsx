/**
 * AI Agent Chat Component with WebSocket support
 * Healthcare professional conversational interface using AG-UI protocol
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useWebSocketAgent } from '@/services/websocket-agent-service';
import { AgentAction, AgentResponse, ChatMessage, ChatState } from '@neonpro/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface AIChatProps {
  className?: string;
  initialContext?: {
    domain?: string;
    professionalId?: string;
  };
}

export function AIChatWS({ className, initialContext }: AIChatProps) {
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

  const {
    isConnected,
    lastMessage,
    sendQuery,
    sendAction,
    sendFeedback,
  } = useWebSocketAgent({
    url: process.env.NEXT_PUBLIC_AI_AGENT_WS_URL,
  });

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'data_response':
      case 'response':
        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: lastMessage.content || lastMessage.message || '',
          timestamp: lastMessage.timestamp || new Date().toISOString(),
          data: lastMessage.data,
          actions: lastMessage.actions,
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));

        // Handle actions if any
        if (lastMessage.actions && lastMessage.actions.length > 0) {
          handleActions(lastMessage.actions);
        }
        break;

      case 'error':
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: lastMessage.message || 'Ocorreu um erro ao processar sua solicitação',
          timestamp: lastMessage.timestamp || new Date().toISOString(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
          isLoading: false,
        }));

        toast({
          title: 'Erro',
          description: lastMessage.message || 'Falha ao processar mensagem',
          variant: 'destructive',
        });
        break;

      case 'connection_established':
        // Connection established
        setChatState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `msg_${Date.now()}_system`,
              role: 'system',
              content: 'Conectado ao assistente NeonPro',
              timestamp: new Date().toISOString(),
            },
          ],
        }));
        break;
    }
  }, [lastMessage, toast]);

  // Handle message submission
  const handleSubmit = useCallback(
    async (message: string) => {
      if (!user) {
        toast({
          title: 'Erro de autenticação',
          description: 'Por favor, faça login para usar o assistente',
          variant: 'destructive',
        });
        return;
      }

      if (!isConnected) {
        toast({
          title: 'Conexão perdida',
          description: 'Aguardando reconexão com o assistente...',
          variant: 'warning',
        });
        return;
      }

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
      }));

      try {
        // Send query via WebSocket
        await sendQuery(message, {
          userId: user.id,
          userRole: user.role,
          domain: initialContext?.domain,
          professionalId: initialContext?.professionalId,
        });
      } catch (error) {
        console.error('WebSocket error:', error);

        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.',
          timestamp: new Date().toISOString(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
          isLoading: false,
        }));

        toast({
          title: 'Erro de conexão',
          description: 'Não foi possível enviar sua mensagem',
          variant: 'destructive',
        });
      }
    },
    [user, initialContext, toast, isConnected, sendQuery],
  );

  // Handle agent actions
  const handleActions = useCallback((actions: AgentAction[]) => {
    actions.forEach(action => {
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
    async (payload: any) => {
      try {
        // Send export action via WebSocket
        await sendAction('export_data', payload);

        toast({
          title: 'Exportação iniciada',
          description: 'Seu relatório está sendo gerado...',
        });
      } catch (error) {
        toast({
          title: 'Erro de exportação',
          description: 'Não foi possível iniciar a exportação',
          variant: 'destructive',
        });
      }
    },
    [sendAction, toast],
  );

  // Custom message renderer
  const renderMessage = useCallback(
    (message: ChatMessage) => {
      if (message.role === 'system') {
        return (
          <div key={message.id} className='text-center py-2'>
            <span className='text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded'>
              {message.content}
            </span>
          </div>
        );
      }

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
                          {new Date(apt.scheduled_at).toLocaleString('pt-BR')} - {apt.professional}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.data.data_type === 'financial' && (
                  <div className='bg-white rounded-md p-3 border'>
                    <h4 className='font-medium text-sm mb-2'>
                      Resumo Financeiro:
                    </h4>
                    {message.data.statistics && (
                      <div className='space-y-1 text-sm'>
                        <p>
                          Total gasto: {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(message.data.statistics.total_spent || 0)}
                        </p>
                        <p>
                          Pagamentos pendentes: {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(message.data.statistics.pending_payments || 0)}
                        </p>
                      </div>
                    )}
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
      {/* Connection status */}
      <div className='flex items-center justify-between p-2 border-b'>
        <div className='flex items-center gap-2'>
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-red-500',
            )}
          />
          <span className='text-xs text-muted-foreground'>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <span className='text-xs text-muted-foreground'>
          Assistente NeonPro
        </span>
      </div>

      {/* Messages container */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {chatState.messages.length === 0 && (
          <div className='text-center py-8'>
            <p className='text-muted-foreground'>
              Olá! Como posso ajudar você hoje?
            </p>
            <p className='text-sm text-muted-foreground mt-1'>
              Ex: Quais meus agendamentos para hoje?
            </p>
          </div>
        )}

        {chatState.messages.map(renderMessage)}

        {chatState.isLoading && (
          <div className='flex gap-3 p-4'>
            <div className='bg-muted/50 rounded-lg p-3'>
              <div className='flex items-center gap-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                <span className='text-sm'>Processando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area (you can integrate with your preferred input component) */}
      <div className='p-4 border-t'>
        <form
          onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const message = formData.get('message') as string;
            if (message?.trim()) {
              handleSubmit(message);
              e.currentTarget.reset();
            }
          }}
          className='flex gap-2'
        >
          <input
            type='text'
            name='message'
            placeholder='Digite sua mensagem...'
            className='flex-1 px-3 py-2 border rounded-md text-sm'
            disabled={!isConnected || chatState.isLoading}
          />
          <button
            type='submit'
            disabled={!isConnected || chatState.isLoading}
            className='px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50'
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIChatWS;
