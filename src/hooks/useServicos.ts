
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface Servico {
  id: string;
  user_id: string;
  nome_servico: string;
  preco: number;
  created_at: string;
}

export const useServicos = () => {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServicos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        toast.error('Erro ao carregar serviços');
        return;
      }
      
      setServicos(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const createServico = async (servicoData: { nome_servico: string; preco: number }) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('servicos')
        .insert([{ ...servicoData, user_id: user.id }]);

      if (error) {
        console.error('Erro ao criar serviço:', error);
        toast.error('Erro ao criar serviço');
        return false;
      }
      
      toast.success('Serviço criado com sucesso!');
      await fetchServicos();
      return true;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast.error('Erro ao criar serviço');
      return false;
    }
  };

  const updateServico = async (id: string, servicoData: { nome_servico: string; preco: number }) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .update(servicoData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar serviço:', error);
        toast.error('Erro ao atualizar serviço');
        return false;
      }
      
      toast.success('Serviço atualizado com sucesso!');
      await fetchServicos();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('Erro ao atualizar serviço');
      return false;
    }
  };

  const deleteServico = async (id: string) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir serviço:', error);
        toast.error('Erro ao excluir serviço');
        return false;
      }
      
      toast.success('Serviço excluído com sucesso!');
      await fetchServicos();
      return true;
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro ao excluir serviço');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchServicos();
    }
  }, [user]);

  return {
    servicos,
    loading,
    fetchServicos,
    createServico,
    updateServico,
    deleteServico
  };
};
