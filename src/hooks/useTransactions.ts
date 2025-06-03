import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { Transacao, CreateTransacaoData, UpdateTransacaoData } from '@/types/transaction';

export const useTransactions = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Buscar todas as transações do usuário
  const fetchTransacoes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('data_transacao', { ascending: false });

      if (error) throw error;

      setTransacoes(data || []);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova transação
  const createTransacao = async (dados: CreateTransacaoData): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('transacoes')
        .insert([
          {
            ...dados,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setTransacoes(prev => [data, ...prev]);
      return true;
    } catch (err) {
      console.error('Erro ao criar transação:', err);
      setError('Erro ao criar transação');
      return false;
    }
  };

  // Atualizar transação
  const updateTransacao = async (id: string, dados: UpdateTransacaoData): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('transacoes')
        .update(dados)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setTransacoes(prev => 
        prev.map(transacao => 
          transacao.id === id ? data : transacao
        )
      );
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar transação:', err);
      setError('Erro ao atualizar transação');
      return false;
    }
  };

  // Deletar transação
  const deleteTransacao = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransacoes(prev => prev.filter(transacao => transacao.id !== id));
      return true;
    } catch (err) {
      console.error('Erro ao deletar transação:', err);
      setError('Erro ao excluir transação');
      return false;
    }
  };

  // Buscar transações por período
  const fetchTransacoesPorPeriodo = async (dataInicio: string, dataFim: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_transacao', dataInicio)
        .lte('data_transacao', dataFim)
        .order('data_transacao', { ascending: false });

      if (error) throw error;

      setTransacoes(data || []);
    } catch (err) {
      console.error('Erro ao buscar transações por período:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Buscar transações por categoria
  const fetchTransacoesPorCategoria = async (categoria: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .eq('categoria', categoria)
        .order('data_transacao', { ascending: false });

      if (error) throw error;

      setTransacoes(data || []);
    } catch (err) {
      console.error('Erro ao buscar transações por categoria:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas financeiras
  const calcularMetricas = () => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const transacoesMes = transacoes.filter(t => {
      const dataTransacao = new Date(t.data_transacao);
      return dataTransacao >= primeiroDiaMes && dataTransacao <= ultimoDiaMes;
    });

    const receitasMes = transacoesMes
      .filter(t => t.tipo === 'receita')
      .reduce((total, t) => total + Number(t.valor), 0);

    const despesasMes = transacoesMes
      .filter(t => t.tipo === 'despesa')
      .reduce((total, t) => total + Number(t.valor), 0);

    const lucroLiquido = receitasMes - despesasMes;
    const margemLucro = receitasMes > 0 ? (lucroLiquido / receitasMes) * 100 : 0;

    // Calcular distribuição por categoria
    const categorias = transacoesMes.reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + Number(t.valor);
      return acc;
    }, {} as Record<string, number>);

    return {
      receitasMes,
      despesasMes,
      lucroLiquido,
      margemLucro,
      totalTransacoes: transacoesMes.length,
      categorias
    };
  };

  // Effect para carregar transações quando o usuário muda
  useEffect(() => {
    if (user) {
      fetchTransacoes();
    }
  }, [user]);

  return {
    transacoes,
    loading,
    error,
    createTransacao,
    updateTransacao,
    deleteTransacao,
    fetchTransacoes,
    fetchTransacoesPorPeriodo,
    fetchTransacoesPorCategoria,
    calcularMetricas
  };
};
