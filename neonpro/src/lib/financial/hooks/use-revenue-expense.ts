/**
 * Revenue & Expense Integration Hooks for NeonPro
 * React hooks para gestão integrada de receitas e despesas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  RevenueStreamManager, 
  ExpenseManager, 
  ProfitabilityAnalyzer 
} from '../revenue-expense-integration';
import { 
  FinancialPeriod,
  RevenueStream,
  ExpenseCategory,
  RevenueAnalytics,
  ExpenseAnalytics,
  ProfitabilityAnalysis
} from '../types/cash-flow';

// ====================================================================
// REVENUE STREAM HOOKS
// ====================================================================

/**
 * Hook para análise de streams de receita
 */
export function useRevenueAnalytics(
  period: FinancialPeriod,
  categoryFilter?: string[]
) {
  const [revenueManager] = useState(() => new RevenueStreamManager());

  const revenueQuery = useQuery({
    queryKey: ['revenueAnalytics', period, categoryFilter],
    queryFn: async (): Promise<RevenueAnalytics> => {
      const response = await revenueManager.analyzeRevenueStreams(period, categoryFilter);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    revenueAnalytics: revenueQuery.data,
    isLoading: revenueQuery.isLoading,
    error: revenueQuery.error,
    refetch: revenueQuery.refetch,
  };
}

/**
 * Hook para criação de streams de receita
 */
export function useRevenueStreamCreation() {
  const [revenueManager] = useState(() => new RevenueStreamManager());
  const queryClient = useQueryClient();

  const createStreamMutation = useMutation({
    mutationFn: async (stream: Omit<RevenueStream, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await revenueManager.createRevenueStream(stream);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['revenueAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['profitabilityAnalysis'] });
      
      toast.success(`Stream "${data.name}" criado com sucesso`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar stream: ${error.message}`);
    }
  });

  return {
    createStream: createStreamMutation.mutate,
    isCreating: createStreamMutation.isPending,
    createError: createStreamMutation.error,
  };
}

/**
 * Hook para otimização de receitas
 */
export function useRevenueOptimization(userId: string) {
  const [revenueManager] = useState(() => new RevenueStreamManager());
  const [optimization, setOptimization] = useState<{
    recommendations: string[];
    optimization_score: number;
    potential_increase: number;
  } | null>(null);

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await revenueManager.optimizeRevenueStreams(userId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (data) => {
      setOptimization(data);
      toast.success('Análise de otimização concluída');
    },
    onError: (error: Error) => {
      toast.error(`Erro na otimização: ${error.message}`);
    }
  });

  return {
    optimization,
    optimizeRevenue: optimizeMutation.mutate,
    isOptimizing: optimizeMutation.isPending,
    optimizeError: optimizeMutation.error,
  };
}

// ====================================================================
// EXPENSE MANAGEMENT HOOKS
// ====================================================================

/**
 * Hook para análise de padrões de despesa
 */
export function useExpenseAnalytics(
  period: FinancialPeriod,
  categoryFilter?: string[]
) {
  const [expenseManager] = useState(() => new ExpenseManager());

  const expenseQuery = useQuery({
    queryKey: ['expenseAnalytics', period, categoryFilter],
    queryFn: async (): Promise<ExpenseAnalytics> => {
      const response = await expenseManager.analyzeExpensePatterns(period, categoryFilter);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    expenseAnalytics: expenseQuery.data,
    isLoading: expenseQuery.isLoading,
    error: expenseQuery.error,
    refetch: expenseQuery.refetch,
  };
}

/**
 * Hook para criação de categorias de despesa
 */
export function useExpenseCategoryCreation() {
  const [expenseManager] = useState(() => new ExpenseManager());
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (category: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await expenseManager.createExpenseCategory(category);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['expenseAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['profitabilityAnalysis'] });
      
      toast.success(`Categoria "${data.name}" criada com sucesso`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar categoria: ${error.message}`);
    }
  });

  return {
    createCategory: createCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    createError: createCategoryMutation.error,
  };
}

// ====================================================================
// PROFITABILITY ANALYSIS HOOKS
// ====================================================================

/**
 * Hook para análise de rentabilidade
 */
export function useProfitabilityAnalysis(period: FinancialPeriod) {
  const [profitabilityAnalyzer] = useState(() => new ProfitabilityAnalyzer());

  const profitabilityQuery = useQuery({
    queryKey: ['profitabilityAnalysis', period],
    queryFn: async (): Promise<ProfitabilityAnalysis> => {
      const response = await profitabilityAnalyzer.analyzeProfitability(period);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });

  return {
    profitabilityAnalysis: profitabilityQuery.data,
    isLoading: profitabilityQuery.isLoading,
    error: profitabilityQuery.error,
    refetch: profitabilityQuery.refetch,
  };
}

/**
 * Hook para comparação de rentabilidade entre períodos
 */
export function useProfitabilityComparison(
  currentPeriod: FinancialPeriod,
  previousPeriod: FinancialPeriod
) {
  const { profitabilityAnalysis: current, isLoading: isCurrentLoading } = 
    useProfitabilityAnalysis(currentPeriod);
  const { profitabilityAnalysis: previous, isLoading: isPreviousLoading } = 
    useProfitabilityAnalysis(previousPeriod);

  const comparison = {
    profit_change: current && previous ? 
      current.gross_profit - previous.gross_profit : 0,
    profit_change_percentage: current && previous && previous.gross_profit > 0 ? 
      ((current.gross_profit - previous.gross_profit) / previous.gross_profit) * 100 : 0,
    margin_change: current && previous ? 
      current.profit_margin - previous.profit_margin : 0,
    revenue_change: current && previous ? 
      current.revenue_data.total_revenue - previous.revenue_data.total_revenue : 0,
    expense_change: current && previous ? 
      current.expense_data.total_expenses - previous.expense_data.total_expenses : 0,
  };

  return {
    current,
    previous,
    comparison,
    isLoading: isCurrentLoading || isPreviousLoading,
  };
}

// ====================================================================
// INTEGRATED ANALYTICS HOOKS
// ====================================================================

/**
 * Hook para analytics integrados de receita e despesa
 */
export function useIntegratedFinancialAnalytics(period: FinancialPeriod) {
  const { revenueAnalytics, isLoading: isRevenueLoading } = useRevenueAnalytics(period);
  const { expenseAnalytics, isLoading: isExpenseLoading } = useExpenseAnalytics(period);
  const { profitabilityAnalysis, isLoading: isProfitabilityLoading } = useProfitabilityAnalysis(period);

  const integratedMetrics = {
    // Métricas financeiras básicas
    grossProfit: profitabilityAnalysis?.gross_profit || 0,
    profitMargin: profitabilityAnalysis?.profit_margin || 0,
    
    // Eficiência operacional
    costRatio: revenueAnalytics && expenseAnalytics ? 
      expenseAnalytics.total_expenses / Math.max(revenueAnalytics.total_revenue, 1) : 0,
    
    // Performance de receita
    revenueGrowth: revenueAnalytics?.growth_metrics.trend_analysis || 'stable',
    revenueConsistency: revenueAnalytics?.performance_indicators.consistency_score || 0,
    revenueDiversification: revenueAnalytics?.performance_indicators.diversification_index || 0,
    
    // Controle de despesas
    expenseGrowth: expenseAnalytics?.expense_efficiency.trend_analysis || 'stable',
    expenseOptimization: expenseAnalytics?.optimization_opportunities.length || 0,
    
    // Indicadores de saúde financeira
    breakEvenDays: profitabilityAnalysis?.efficiency_metrics.break_even_point || Infinity,
    dailyProfitability: profitabilityAnalysis?.efficiency_metrics.profit_per_day || 0,
  };

  return {
    revenueAnalytics,
    expenseAnalytics,
    profitabilityAnalysis,
    integratedMetrics,
    isLoading: isRevenueLoading || isExpenseLoading || isProfitabilityLoading,
  };
}

/**
 * Hook para filtros financeiros
 */
export function useFinancialFilters() {
  const [filters, setFilters] = useState({
    period: {
      start_date: '',
      end_date: ''
    } as FinancialPeriod,
    revenueCategories: [] as string[],
    expenseCategories: [] as string[],
    comparisonPeriod: null as FinancialPeriod | null,
  });

  const updatePeriod = useCallback((period: FinancialPeriod) => {
    setFilters(prev => ({ ...prev, period }));
  }, []);

  const updateRevenueCategories = useCallback((categories: string[]) => {
    setFilters(prev => ({ ...prev, revenueCategories: categories }));
  }, []);

  const updateExpenseCategories = useCallback((categories: string[]) => {
    setFilters(prev => ({ ...prev, expenseCategories: categories }));
  }, []);

  const setComparisonPeriod = useCallback((period: FinancialPeriod | null) => {
    setFilters(prev => ({ ...prev, comparisonPeriod: period }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      period: { start_date: '', end_date: '' },
      revenueCategories: [],
      expenseCategories: [],
      comparisonPeriod: null,
    });
  }, []);

  return {
    filters,
    updatePeriod,
    updateRevenueCategories,
    updateExpenseCategories,
    setComparisonPeriod,
    resetFilters,
  };
}

/**
 * Hook para presets de período
 */
export function usePeriodPresets() {
  const getPreset = useCallback((preset: string): FinancialPeriod => {
    const now = new Date();
    const startDate = new Date();

    switch (preset) {
      case 'today':
        return {
          start_date: now.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      
      case 'week':
        startDate.setDate(now.getDate() - 7);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
      
      default:
        return {
          start_date: startDate.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0]
        };
    }
  }, []);

  const presets = [
    { label: 'Hoje', value: 'today' },
    { label: 'Última Semana', value: 'week' },
    { label: 'Último Mês', value: 'month' },
    { label: 'Último Trimestre', value: 'quarter' },
    { label: 'Último Ano', value: 'year' },
  ];

  return {
    presets,
    getPreset,
  };
}

/**
 * Hook para dashboards financeiros
 */
export function useFinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<FinancialPeriod>({
    start_date: '',
    end_date: ''
  });

  const { integratedMetrics, isLoading } = useIntegratedFinancialAnalytics(selectedPeriod);
  const { getPreset } = usePeriodPresets();

  // Initialize with current month
  useEffect(() => {
    setSelectedPeriod(getPreset('month'));
  }, [getPreset]);

  const dashboardData = {
    summary: {
      revenue: integratedMetrics.revenueAnalytics?.total_revenue || 0,
      expenses: integratedMetrics.expenseAnalytics?.total_expenses || 0,
      profit: integratedMetrics.grossProfit,
      margin: integratedMetrics.profitMargin,
    },
    performance: {
      revenueGrowth: integratedMetrics.revenueGrowth,
      expenseControl: integratedMetrics.expenseGrowth,
      profitability: integratedMetrics.dailyProfitability,
      efficiency: 1 - integratedMetrics.costRatio,
    },
    health: {
      consistency: integratedMetrics.revenueConsistency,
      diversification: integratedMetrics.revenueDiversification,
      breakEven: integratedMetrics.breakEvenDays,
      optimization: integratedMetrics.expenseOptimization,
    }
  };

  return {
    dashboardData,
    selectedPeriod,
    setSelectedPeriod,
    isLoading,
  };
}