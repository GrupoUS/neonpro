
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Database } from '../types/supabase';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

// Interface para compatibilidade com o componente existente
export interface Transacao {
  id: string;
  user_id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data_transacao: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransacaoData {
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data_transacao: string;
  observacoes?: string;
}

export interface UpdateTransacaoData {
  descricao?: string;
  valor?: number;
  tipo?: 'receita' | 'despesa';
  categoria?: string;
  data_transacao?: string;
  observacoes?: string;
}

// Função para converter da estrutura do banco para a interface do componente
const convertToTransacao = (transaction: TransactionRow): Transacao => ({
  id: transaction.id,
  user_id: transaction.user_id,
  descricao: transaction.description,
  valor: Number(transaction.amount),
  tipo: transaction.type as 'receita' | 'despesa',
  categoria: transaction.category,
  data_transacao: transaction.transaction_date,
  observacoes: null, // transactions table doesn't have this field
  created_at: transaction.created_at,
  updated_at: transaction.updated_at,
});

// Função para converter da interface do componente para a estrutura do banco
const convertToTransaction = (transacao: CreateTransacaoData): TransactionInsert => ({
  description: transacao.descricao,
  amount: transacao.valor,
  type: transacao.tipo,
  category: transacao.categoria,
  transaction_date: transacao.data_transacao,
  user_id: '', // Will be set in the function
});

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
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const convertedData = (data || []).map(convertToTransacao);
      setTransacoes(convertedData);
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
      const transactionData = convertToTransaction(dados);
      transactionData.user_id = user.id;

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;

      const convertedData = convertToTransacao(data);
      setTransacoes(prev => [convertedData, ...prev]);
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
      const updateData: TransactionUpdate = {
        description: dados.descricao,
        amount: dados.valor,
        type: dados.tipo,
        category: dados.categoria,
        transaction_date: dados.data_transacao,
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const convertedData = convertToTransacao(data);
      setTransacoes(prev => 
        prev.map(transacao => 
          transacao.id === id ? convertedData : transacao
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
        .from('transactions')
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
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', dataInicio)
        .lte('transaction_date', dataFim)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const convertedData = (data || []).map(convertToTransacao);
      setTransacoes(convertedData);
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
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', categoria)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const convertedData = (data || []).map(convertToTransacao);
      setTransacoes(convertedData);
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
