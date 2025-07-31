'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message, CommunicationConversation } from '@/src/types/communication';
import { useToast } from './use-toast';

export interface UseCommunicationRealtimeProps {
  conversationId?: string;
  userId: string;
  autoConnect?: boolean;
}

export interface CommunicationRealtimeState {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  participants: string[];
  typingUsers: string[];
}

export function useCommunicationRealtime({
  conversationId,
  userId,
  autoConnect = true
}: UseCommunicationRealtimeProps) {
  const [state, setState] = useState<CommunicationRealtimeState>({
    messages: [],
    isConnected: false,
    isLoading: false,
    error: null,
    participants: [],
    typingUsers: []
  });

  const { toast } = useToast();
  const supabase = createClient();

  // Carregar mensagens iniciais
  const loadMessages = useCallback(async (convId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data: messages, error } = await supabase
        .from('communication_messages')
        .select(`
          *,
          sender:auth.users!sender_id(id, email, raw_user_meta_data),
          attachments:communication_attachments(*)
        `)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        messages: messages || [],
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar mensagens',
        isLoading: false
      }));
    }
  }, [supabase]);

  // Conectar ao canal de realtime
  const connect = useCallback((convId: string) => {
    try {
      const channel = supabase
        .channel(`conversation:${convId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'communication_messages',
            filter: `conversation_id=eq.${convId}`
          },
          async (payload) => {
            // Buscar dados completos da mensagem com relacionamentos
            const { data: fullMessage } = await supabase
              .from('communication_messages')
              .select(`
                *,
                sender:auth.users!sender_id(id, email, raw_user_meta_data),
                attachments:communication_attachments(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (fullMessage) {
              setState(prev => ({
                ...prev,
                messages: [...prev.messages, fullMessage as Message]
              }));
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'communication_messages',
            filter: `conversation_id=eq.${convId}`
          },
          async (payload) => {
            // Atualizar mensagem existente
            const { data: fullMessage } = await supabase
              .from('communication_messages')
              .select(`
                *,
                sender:auth.users!sender_id(id, email, raw_user_meta_data),
                attachments:communication_attachments(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (fullMessage) {
              setState(prev => ({
                ...prev,
                messages: prev.messages.map(msg => 
                  msg.id === fullMessage.id ? fullMessage as Message : msg
                )
              }));
            }
          }
        )
        .on('broadcast', { event: 'typing' }, (payload) => {
          if (payload.userId !== userId) {
            setState(prev => ({
              ...prev,
              typingUsers: payload.isTyping
                ? [...prev.typingUsers.filter(u => u !== payload.userId), payload.userId]
                : prev.typingUsers.filter(u => u !== payload.userId)
            }));
          }
        })
        .on('broadcast', { event: 'user_joined' }, (payload) => {
          setState(prev => ({
            ...prev,
            participants: [...new Set([...prev.participants, payload.userId])]
          }));
        })
        .on('broadcast', { event: 'user_left' }, (payload) => {
          setState(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p !== payload.userId)
          }));
        })
        .subscribe((status) => {
          setState(prev => ({
            ...prev,
            isConnected: status === 'SUBSCRIBED',
            error: status === 'CLOSED' ? 'Conexão perdida' : null
          }));
        });

      return channel;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao conectar',
        isConnected: false
      }));
      return null;
    }
  }, [supabase, userId]);

  // Enviar mensagem
  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'image' | 'document' | 'audio' = 'text',
    conversationId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!conversationId) {
      toast({
        title: 'Erro',
        description: 'ID da conversa é obrigatório',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data: message, error } = await supabase
        .from('communication_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content,
          type,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      return message;
    } catch (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    }
  }, [supabase, userId, toast]);

  // Marcar mensagem como lida
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('communication_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('conversation_id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  }, [supabase, conversationId]);

  // Broadcast de digitação
  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId) return;

    try {
      const channel = supabase.channel(`conversation:${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping }
      });
    } catch (error) {
      console.error('Erro ao enviar status de digitação:', error);
    }
  }, [supabase, conversationId, userId]);

  // Efeito principal
  useEffect(() => {
    if (!conversationId || !autoConnect) return;

    let channel: any = null;

    const setupConnection = async () => {
      // Carregar mensagens iniciais
      await loadMessages(conversationId);
      
      // Conectar ao realtime
      channel = connect(conversationId);
    };

    setupConnection();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, autoConnect, loadMessages, connect, supabase]);

  return {
    ...state,
    sendMessage,
    markAsRead,
    broadcastTyping,
    loadMessages,
    connect: (convId: string) => connect(convId)
  };
}