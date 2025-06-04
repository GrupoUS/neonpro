
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Interface baseada na tabela 'agendamentos' existente no Supabase
export interface AgendamentoSimplificado {
  id: string;
  user_id: string;
  paciente_id: string | null;
  servico_id: string | null;
  profissional_id: string | null;
  data_hora: string;
  duracao: number | null;
  status: string | null;
  observacoes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Interface para criação de agendamentos
export interface CreateAgendamentoData {
  paciente_id: string;
  servico_id?: string;
  profissional_id?: string;
  data_hora: string;
  duracao?: number;
  status?: string;
  observacoes?: string;
}

export const useAppointments = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<AgendamentoSimplificado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar agendamentos
  const fetchAgendamentos = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('user_id', user.id)
        .order('data_hora', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        setError('Erro ao carregar agendamentos');
        return;
      }

      setAgendamentos(data || []);
    } catch (err) {
      console.error('Erro na busca de agendamentos:', err);
      setError('Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  };

  // Criar agendamento
  const createAgendamento = async (data: CreateAgendamentoData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const agendamentoData = {
        ...data,
        user_id: user.id,
        status: data.status || 'agendado',
        duracao: data.duracao || 60,
      };

      const { data: result, error } = await supabase
        .from('agendamentos')
        .insert(agendamentoData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar agendamento:', error);
        toast.error('Erro ao criar agendamento');
        return null;
      }

      toast.success('Agendamento criado com sucesso!');
      
      // Atualizar a lista local
      setAgendamentos(prev => [...prev, result]);
      
      return result;
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      toast.error('Erro ao criar agendamento');
      return null;
    }
  };

  // Atualizar agendamento
  const updateAgendamento = async (id: string, updates: Partial<CreateAgendamentoData>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar agendamento:', error);
        toast.error('Erro ao atualizar agendamento');
        return null;
      }

      toast.success('Agendamento atualizado com sucesso!');
      
      // Atualizar a lista local
      setAgendamentos(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
      
      return data;
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);
      toast.error('Erro ao atualizar agendamento');
      return null;
    }
  };

  // Deletar agendamento
  const deleteAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Erro ao deletar agendamento:', error);
        toast.error('Erro ao deletar agendamento');
        return false;
      }

      toast.success('Agendamento deletado com sucesso!');
      
      // Remover da lista local
      setAgendamentos(prev => prev.filter(item => item.id !== id));
      
      return true;
    } catch (err) {
      console.error('Erro ao deletar agendamento:', err);
      toast.error('Erro ao deletar agendamento');
      return false;
    }
  };

  // Carregar agendamentos quando o usuário mudar
  useEffect(() => {
    fetchAgendamentos();
  }, [user]);

  return {
    agendamentos,
    isLoading,
    error,
    fetchAgendamentos,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
  };
};
