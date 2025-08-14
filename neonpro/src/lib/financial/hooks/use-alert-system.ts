/**
 * Financial Alert Hooks for NeonPro
 * React hooks para integração com o Financial Alert System
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FinancialAlertSystem } from '../alert-system';
import { 
  FinancialAlert,
  AlertRule,
  AlertSeverity,
  AlertType,
  AlertChannel,
  AlertEscalation
} from '../types/cash-flow';

// ====================================================================
// FINANCIAL ALERT HOOKS
// ====================================================================

/**
 * Hook para alertas financeiros ativos
 */
export function useFinancialAlerts(
  severity?: AlertSeverity,
  type?: AlertType
) {
  const [alertSystem] = useState(() => new FinancialAlertSystem());

  const alertsQuery = useQuery({
    queryKey: ['financialAlerts', severity, type],
    queryFn: async (): Promise<FinancialAlert[]> => {
      const response = await alertSystem.getActiveAlerts(severity, type);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  return {
    alerts: alertsQuery.data || [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    refetch: alertsQuery.refetch,
  };
}

/**
 * Hook para resolução de alertas
 */
export function useAlertResolution() {
  const [alertSystem] = useState(() => new FinancialAlertSystem());
  const queryClient = useQueryClient();

  const resolveMutation = useMutation({
    mutationFn: async ({ 
      alertId, 
      resolution, 
      userId 
    }: { 
      alertId: string; 
      resolution: string; 
      userId: string; 
    }) => {
      const response = await alertSystem.resolveAlert(alertId, resolution, userId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate alerts queries
      queryClient.invalidateQueries({ queryKey: ['financialAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['alertStatistics'] });
      
      toast.success(`Alerta "${data.title}" resolvido com sucesso`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao resolver alerta: ${error.message}`);
    }
  });

  return {
    resolveAlert: resolveMutation.mutate,
    isResolving: resolveMutation.isPending,
    resolveError: resolveMutation.error,
  };
}

/**
 * Hook para criação de regras de alerta
 */
export function useAlertRuleCreation() {
  const [alertSystem] = useState(() => new FinancialAlertSystem());
  const queryClient = useQueryClient();

  const createRuleMutation = useMutation({
    mutationFn: async (rule: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await alertSystem.createAlertRule(rule);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['alertRules'] });
      
      toast.success(`Regra "${data.name}" criada com sucesso`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar regra: ${error.message}`);
    }
  });

  return {
    createRule: createRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    createError: createRuleMutation.error,
  };
}

/**
 * Hook para verificação de condições de alerta
 */
export function useAlertConditionChecker() {
  const [alertSystem] = useState(() => new FinancialAlertSystem());
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConditions = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await alertSystem.checkAlertConditions();
      if (response.success && response.data.length > 0) {
        toast.info(`${response.data.length} novo(s) alerta(s) detectado(s)`);
      }
      setLastCheck(new Date());
    } catch (error) {
      console.error('Failed to check alert conditions:', error);
      toast.error('Erro na verificação de alertas');
    } finally {
      setIsChecking(false);
    }
  }, [alertSystem]);

  // Auto-check every 5 minutes
  useEffect(() => {
    const interval = setInterval(checkConditions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkConditions]);

  return {
    checkConditions,
    isChecking,
    lastCheck,
  };
}

/**
 * Hook para estatísticas de alertas
 */
export function useAlertStatistics(days: number = 30) {
  const [alertSystem] = useState(() => new FinancialAlertSystem());

  const statsQuery = useQuery({
    queryKey: ['alertStatistics', days],
    queryFn: async () => {
      const response = await alertSystem.getAlertStatistics(days);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    statistics: statsQuery.data,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
}

/**
 * Hook para configuração de escalação
 */
export function useAlertEscalation() {
  const [alertSystem] = useState(() => new FinancialAlertSystem());
  const queryClient = useQueryClient();

  const configureEscalationMutation = useMutation({
    mutationFn: async ({ 
      ruleId, 
      escalation 
    }: { 
      ruleId: string; 
      escalation: AlertEscalation; 
    }) => {
      const response = await alertSystem.configureEscalation(ruleId, escalation);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alertRules'] });
      toast.success(`Escalação configurada para "${data.name}"`);
    },
    onError: (error: Error) => {
      toast.error(`Erro na configuração: ${error.message}`);
    }
  });

  return {
    configureEscalation: configureEscalationMutation.mutate,
    isConfiguring: configureEscalationMutation.isPending,
    configureError: configureEscalationMutation.error,
  };
}

/**
 * Hook para alertas em tempo real
 */
export function useRealTimeAlerts() {
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { alerts: currentAlerts } = useFinancialAlerts();

  // Update alerts and unread count
  useEffect(() => {
    if (currentAlerts) {
      setAlerts(currentAlerts);
      setUnreadCount(currentAlerts.filter(alert => !alert.is_resolved).length);
    }
  }, [currentAlerts]);

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_read: true }
          : alert
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
    setUnreadCount(0);
  }, []);

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    hasUnreadAlerts: unreadCount > 0,
  };
}

/**
 * Hook para filtros de alerta
 */
export function useAlertFilters() {
  const [filters, setFilters] = useState({
    severity: undefined as AlertSeverity | undefined,
    type: undefined as AlertType | undefined,
    resolved: undefined as boolean | undefined,
    dateRange: {
      start: undefined as Date | undefined,
      end: undefined as Date | undefined,
    }
  });

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      severity: undefined,
      type: undefined,
      resolved: undefined,
      dateRange: { start: undefined, end: undefined }
    });
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: Object.values(filters).some(value => 
      value !== undefined && value !== null
    ),
  };
}

/**
 * Hook para configurações de canal de alerta
 */
export function useAlertChannelConfig() {
  const [config, setConfig] = useState({
    email: {
      enabled: true,
      addresses: [] as string[],
      severityThreshold: 'warning' as AlertSeverity
    },
    sms: {
      enabled: false,
      numbers: [] as string[],
      severityThreshold: 'critical' as AlertSeverity
    },
    webhook: {
      enabled: false,
      url: '',
      severityThreshold: 'warning' as AlertSeverity
    },
    dashboard: {
      enabled: true,
      autoRefresh: true,
      soundAlerts: true
    }
  });

  const updateChannelConfig = useCallback((
    channel: keyof typeof config,
    updates: Partial<typeof config[keyof typeof config]>
  ) => {
    setConfig(prev => ({
      ...prev,
      [channel]: { ...prev[channel], ...updates }
    }));

    // Save to localStorage
    const updatedConfig = {
      ...config,
      [channel]: { ...config[channel], ...updates }
    };
    localStorage.setItem('neonpro-alert-channel-config', JSON.stringify(updatedConfig));
  }, [config]);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('neonpro-alert-channel-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load alert channel config:', error);
      }
    }
  }, []);

  return {
    config,
    updateChannelConfig,
  };
}

/**
 * Hook para métricas de performance dos alertas
 */
export function useAlertPerformanceMetrics() {
  const { statistics } = useAlertStatistics(30);
  const { alerts } = useFinancialAlerts();

  const metrics = {
    totalActiveAlerts: alerts?.length || 0,
    criticalAlerts: alerts?.filter(a => a.severity === 'critical').length || 0,
    averageResolutionTime: statistics?.average_resolution_time || 0,
    resolutionRate: statistics ? 
      (statistics.resolved_alerts / Math.max(statistics.total_alerts, 1)) * 100 : 0,
    mostCommonAlertType: statistics?.top_alert_types[0]?.type || 'none',
    alertTrend: statistics ? 
      statistics.total_alerts > 0 ? 'increasing' : 'stable' : 'stable'
  };

  return metrics;
}

/**
 * Hook para templates de regras de alerta
 */
export function useAlertRuleTemplates() {
  const templates = [
    {
      id: 'low-balance',
      name: 'Saldo Baixo',
      description: 'Alerta quando o saldo da conta fica abaixo do mínimo',
      template: {
        type: 'low_balance' as AlertType,
        severity: 'warning' as AlertSeverity,
        condition: {
          metric: 'account_balance',
          operator: 'less_than',
          threshold: 5000
        },
        channels: ['dashboard', 'email'] as AlertChannel[]
      }
    },
    {
      id: 'negative-cashflow',
      name: 'Cash Flow Negativo',
      description: 'Alerta quando o cash flow diário fica negativo',
      template: {
        type: 'negative_cash_flow' as AlertType,
        severity: 'critical' as AlertSeverity,
        condition: {
          metric: 'daily_cash_flow',
          operator: 'less_than',
          threshold: 0
        },
        channels: ['dashboard', 'email', 'sms'] as AlertChannel[]
      }
    },
    {
      id: 'high-expenses',
      name: 'Despesas Altas',
      description: 'Alerta quando as despesas diárias excedem o normal',
      template: {
        type: 'high_expenses' as AlertType,
        severity: 'warning' as AlertSeverity,
        condition: {
          metric: 'daily_expenses',
          operator: 'greater_than',
          threshold: 10000
        },
        channels: ['dashboard', 'email'] as AlertChannel[]
      }
    }
  ];

  const createFromTemplate = useCallback((templateId: string, customizations?: any) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    return {
      ...template.template,
      name: template.name,
      description: template.description,
      is_active: true,
      escalation_config: { levels: [] },
      ...customizations
    };
  }, []);

  return {
    templates,
    createFromTemplate,
  };
}