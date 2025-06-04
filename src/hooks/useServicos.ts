
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Database } from '../types/supabase';

type ServiceRow = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export const useServicos = () => {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServicos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
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

  const createServico = async (servicoData: { name: string; price: number; duration_minutes?: number; description?: string }) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    try {
      const insertData: ServiceInsert = {
        name: servicoData.name,
        price: servicoData.price,
        duration_minutes: servicoData.duration_minutes || 60,
        description: servicoData.description,
        user_id: user.id
      };

      const { error } = await supabase
        .from('services')
        .insert([insertData]);

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

  const updateServico = async (id: string, servicoData: { name: string; price: number; duration_minutes?: number; description?: string }) => {
    try {
      const updateData: ServiceUpdate = {
        name: servicoData.name,
        price: servicoData.price,
        duration_minutes: servicoData.duration_minutes,
        description: servicoData.description
      };

      const { error } = await supabase
        .from('services')
        .update(updateData)
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
        .from('services')
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
