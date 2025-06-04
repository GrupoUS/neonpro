
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { ChatbotConfig } from '@/types/chatbot';
import { toast } from 'sonner';

export const useChatbotConfig = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = async () => {
    if (!user) return;

    try {
      // TODO: Implementar quando a tabela chatbot_config for criada no banco de dados
      console.log('Chatbot config não implementado - tabela não existe no banco de dados');
      setConfig(null);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<ChatbotConfig>) => {
    if (!user) return;

    try {
      // TODO: Implementar quando a tabela chatbot_config for criada no banco de dados
      console.log('Update config não implementado - tabela não existe no banco de dados');
      toast.error('Funcionalidade de configuração ainda não implementada');
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const hasApiKey = () => {
    return config?.openrouter_api_key && config.openrouter_api_key.length > 0;
  };

  useEffect(() => {
    fetchConfig();
  }, [user]);

  return {
    config,
    isLoading,
    updateConfig,
    hasApiKey,
    refreshConfig: fetchConfig,
  };
};
