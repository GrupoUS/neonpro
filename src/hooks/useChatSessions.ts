
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { ChatSession, ChatMessage } from '@/types/chatbot';
import { toast } from 'sonner';

export const useChatSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sessões:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (titulo?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: user.id,
          titulo: titulo || 'Nova Conversa',
          contexto: {},
          configuracoes: {},
          status: 'ativo',
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sessão:', error);
        toast.error('Erro ao criar nova conversa');
        return;
      }

      setSessions(prev => [data, ...prev]);
      setActiveSession(data);
      setMessages([]);
      return data;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast.error('Erro ao criar nova conversa');
    }
  };

  const selectSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setActiveSession(session);
    await fetchMessages(sessionId);
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const addMessage = async (sessionId: string, tipo: 'user' | 'assistant' | 'system', conteudo: string, metadata = {}) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          user_id: user.id,
          tipo,
          conteudo,
          metadata,
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar mensagem:', error);
        return;
      }

      setMessages(prev => [...prev, data]);
      
      // Atualizar last_message_at da sessão
      await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', sessionId);

      return data;
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Erro ao deletar sessão:', error);
        toast.error('Erro ao deletar conversa');
        return;
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }

      toast.success('Conversa deletada com sucesso');
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      toast.error('Erro ao deletar conversa');
    }
  };

  const updateSessionTitle = async (sessionId: string, titulo: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ titulo })
        .eq('id', sessionId);

      if (error) {
        console.error('Erro ao atualizar título:', error);
        return;
      }

      setSessions(prev => 
        prev.map(s => s.id === sessionId ? { ...s, titulo } : s)
      );

      if (activeSession?.id === sessionId) {
        setActiveSession(prev => prev ? { ...prev, titulo } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    activeSession,
    messages,
    isLoading,
    createSession,
    selectSession,
    addMessage,
    deleteSession,
    updateSessionTitle,
    refreshSessions: fetchSessions,
  };
};
