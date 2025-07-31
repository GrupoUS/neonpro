/**
 * Real-time Cash Flow Hooks for NeonPro
 * Custom React hooks para integração com o Cash Flow Monitoring Engine
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CashFlowMonitoringEngine } from '../cash-flow-monitor';
import { 
  CashFlowEntry, 
  CashFlowSummary, 
  CashFlowAccount, 
  CashFlowTrend,
  CashFlowType,
  CashFlowCategory,
  FinancialAPIResponse
} from '../types/cash-flow';

// ====================================================================
// CUSTOM HOOKS FOR CASH FLOW MANAGEMENT
// ====================================================================

/**
 * Hook para monitoramento em tempo real do cash flow
 */
export function useCashFlowMonitor(
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'monthly',
  startDate?: Date,
  endDate?: Date
) {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const queryClient = useQueryClient();

  // Initialize monitoring engine
  const [engine] = useState(() => new CashFlowMonitoringEngine());

  // Query for cash flow summary
  const summaryQuery = useQuery({
    queryKey: ['cashFlowSummary', periodType, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async (): Promise<CashFlowSummary> => {
      const response = await engine.getCashFlowSummary(periodType, startDate, endDate);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    refetchInterval: isRealTimeEnabled ? 30000 : false, // Refetch every 30 seconds if real-time enabled
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  // Query for account balances
  const accountsQuery = useQuery({
    queryKey: ['cashFlowAccounts'],
    queryFn: async (): Promise<CashFlowAccount[]> => {
      const response = await engine.getAccountBalances();
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    refetchInterval: isRealTimeEnabled ? 60000 : false, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Mutation for recording new cash flow entry
  const recordEntryMutation = useMutation({
    mutationFn: async (entry: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await engine.recordCashFlowEntry(entry);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['cashFlowSummary'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowTrend'] });
      
      setLastUpdate(new Date());
      toast.success('Movimento financeiro registrado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar movimento: ${error.message}`);
    }
  });

  // Function to toggle real-time monitoring
  const toggleRealTime = useCallback((enabled: boolean) => {
    setIsRealTimeEnabled(enabled);
    if (enabled) {
      // Force refresh when enabling real-time
      queryClient.invalidateQueries({ queryKey: ['cashFlowSummary'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlowAccounts'] });
    }
  }, [queryClient]);

  // Function to force refresh all data
  const forceRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['cashFlowSummary'] });
    queryClient.invalidateQueries({ queryKey: ['cashFlowAccounts'] });
    queryClient.invalidateQueries({ queryKey: ['cashFlowTrend'] });
    setLastUpdate(new Date());
  }, [queryClient]);

  return {
    // Data
    summary: summaryQuery.data,
    accounts: accountsQuery.data,
    
    // Loading states
    isLoadingSummary: summaryQuery.isLoading,
    isLoadingAccounts: accountsQuery.isLoading,
    isRecordingEntry: recordEntryMutation.isPending,
    
    // Error states
    summaryError: summaryQuery.error,
    accountsError: accountsQuery.error,
    recordError: recordEntryMutation.error,
    
    // Actions
    recordEntry: recordEntryMutation.mutate,
    toggleRealTime,
    forceRefresh,
    
    // State
    isRealTimeEnabled,
    lastUpdate,
    
    // Refetch functions
    refetchSummary: summaryQuery.refetch,
    refetchAccounts: accountsQuery.refetch
  };
}

/**
 * Hook para análise de tendências do cash flow
 */
export function useCashFlowTrend(days: number = 30, accountId?: string) {
  const [engine] = useState(() => new CashFlowMonitoringEngine());

  const trendQuery = useQuery({
    queryKey: ['cashFlowTrend', days, accountId],
    queryFn: async (): Promise<CashFlowTrend[]> => {
      const response = await engine.getCashFlowTrend(days, accountId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  return {
    data: trendQuery.data,
    isLoading: trendQuery.isLoading,
    error: trendQuery.error,
    refetch: trendQuery.refetch,
  };
}

/**
 * Hook para análise de cash flow por categoria
 */
export function useCashFlowByCategory(
  startDate: Date,
  endDate: Date,
  type?: CashFlowType
) {
  const [engine] = useState(() => new CashFlowMonitoringEngine());

  const categoryQuery = useQuery({
    queryKey: ['cashFlowByCategory', startDate.toISOString(), endDate.toISOString(), type],
    queryFn: async (): Promise<Record<CashFlowCategory, number>> => {
      const response = await engine.getCashFlowByCategory(startDate, endDate, type);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: categoryQuery.data,
    isLoading: categoryQuery.isLoading,
    error: categoryQuery.error,
    refetch: categoryQuery.refetch,
  };
}

/**
 * Hook para sincronização de contas bancárias
 */
export function useAccountSync() {
  const [engine] = useState(() => new CashFlowMonitoringEngine());
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await engine.syncAccountBalance(accountId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update the account in the cache
      queryClient.setQueryData(['cashFlowAccounts'], (old: CashFlowAccount[] | undefined) => {
        if (!old) return [data];
        return old.map(account => 
          account.id === data.id ? data : account
        );
      });
      
      // Invalidate summary to reflect updated balance
      queryClient.invalidateQueries({ queryKey: ['cashFlowSummary'] });
      
      toast.success(`Conta ${data.name} sincronizada com sucesso`);
    },
    onError: (error: Error) => {
      toast.error(`Erro na sincronização: ${error.message}`);
    }
  });

  return {
    syncAccount: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
  };
}

/**
 * Hook para métricas em tempo real do dashboard
 */
export function useCashFlowMetrics() {
  const [metrics, setMetrics] = useState({
    totalBalance: 0,
    monthlyInflow: 0,
    monthlyOutflow: 0,
    netCashFlow: 0,
    trendDirection: 'stable' as 'up' | 'down' | 'stable',
    lastUpdate: new Date()
  });

  const { summary, accounts, isLoadingSummary, isLoadingAccounts } = useCashFlowMonitor('monthly');

  // Update metrics when data changes
  useEffect(() => {
    if (summary && accounts) {
      const totalBalance = accounts.reduce((sum, account) => sum + account.current_balance, 0);
      
      setMetrics({
        totalBalance,
        monthlyInflow: summary.total_inflow,
        monthlyOutflow: summary.total_outflow,
        netCashFlow: summary.net_cash_flow,
        trendDirection: summary.trend_direction,
        lastUpdate: new Date()
      });
    }
  }, [summary, accounts]);

  return {
    metrics,
    isLoading: isLoadingSummary || isLoadingAccounts,
  };
}

/**
 * Hook para alertas de cash flow
 */
export function useCashFlowAlerts() {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'critical' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  const { summary, accounts } = useCashFlowMonitor();

  // Check for alert conditions
  useEffect(() => {
    if (!summary || !accounts) return;

    const newAlerts: typeof alerts = [];

    // Low balance alerts
    accounts.forEach(account => {
      if (account.current_balance < account.minimum_balance) {
        newAlerts.push({
          id: `low-balance-${account.id}`,
          type: 'warning',
          message: `Saldo baixo na conta ${account.name}: R$ ${account.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          timestamp: new Date()
        });
      }
    });

    // Negative cash flow alert
    if (summary.net_cash_flow < 0) {
      newAlerts.push({
        id: 'negative-cash-flow',
        type: 'critical',
        message: `Cash flow negativo: R$ ${summary.net_cash_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        timestamp: new Date()
      });
    }

    // Declining trend alert
    if (summary.trend_direction === 'down' && summary.trend_percentage > 20) {
      newAlerts.push({
        id: 'declining-trend',
        type: 'warning',
        message: `Tendência de queda significativa: ${summary.trend_percentage.toFixed(1)}%`,
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts);
  }, [summary, accounts]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return {
    alerts,
    dismissAlert,
    hasAlerts: alerts.length > 0,
  };
}

/**
 * Hook para estatísticas rápidas do cash flow
 */
export function useCashFlowStats() {
  const { summary, accounts } = useCashFlowMonitor('monthly');
  
  const stats = {
    totalAccounts: accounts?.length || 0,
    activeAccounts: accounts?.filter(acc => acc.is_active).length || 0,
    totalBalance: accounts?.reduce((sum, acc) => sum + acc.current_balance, 0) || 0,
    monthlyInflow: summary?.total_inflow || 0,
    monthlyOutflow: summary?.total_outflow || 0,
    netCashFlow: summary?.net_cash_flow || 0,
    dailyAverage: summary?.daily_average || 0,
    trendPercentage: summary?.trend_percentage || 0,
    isPositiveTrend: summary?.trend_direction === 'up',
    isNegativeTrend: summary?.trend_direction === 'down',
  };

  return stats;
}