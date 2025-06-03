
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('chatbot_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar configuração:', error);
        return;
      }

      setConfig(data);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<ChatbotConfig>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_config')
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar configuração:', error);
        toast.error('Erro ao salvar configurações');
        return;
      }

      setConfig(data);
      toast.success('Configurações salvas com sucesso!');
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
