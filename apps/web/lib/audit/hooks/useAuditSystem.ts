/**
 * NeonPro Audit System React Hooks
 *
 * Hooks para integração do sistema de auditoria com React,
 * fornecendo funcionalidades para consulta de logs, geração
 * de relatórios, monitoramento de alertas e estatísticas.
 *
 * Features:
 * - useAuditLogs: Consulta e filtros de logs
 * - useAuditReports: Geração e gestão de relatórios
 * - useSecurityAlerts: Monitoramento de alertas
 * - useAuditStatistics: Estatísticas e métricas
 * - useAuditLogger: Logging de eventos
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import {
  type AuditEvent,
  type AuditEventType,
  type AuditQueryFilters,
  type AuditReport,
  AuditSeverity,
  type AuditStatistics,
  auditSystem,
  logAuditEvent,
} from '../audit-system';

// =====================================================
// TYPES E INTERFACES
// =====================================================

type UseAuditLogsOptions = {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilters?: AuditQueryFilters;
};

type UseAuditLogsReturn = {
  logs: AuditEvent[];
  loading: boolean;
  error: string | null;
  filters: AuditQueryFilters;
  setFilters: (filters: AuditQueryFilters) => void;
  refresh: () => Promise<void>;
  exportLogs: (format: 'json' | 'csv') => Promise<void>;
  totalCount: number;
};

type SecurityAlert = {
  id: string;
  event_id: string;
  alert_type: string;
  severity: AuditSeverity;
  description: string;
  user_id?: string;
  ip_address?: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  actions_taken: string[];
  assigned_to?: string;
  created_at: Date;
  resolved_at?: Date;
  metadata: Record<string, any>;
};

type UseSecurityAlertsReturn = {
  alerts: SecurityAlert[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  refresh: () => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
  updateStatus: (
    alertId: string,
    status: SecurityAlert['status']
  ) => Promise<void>;
  assignAlert: (alertId: string, userId: string) => Promise<void>;
};

type UseAuditReportsReturn = {
  reports: AuditReport[];
  loading: boolean;
  error: string | null;
  generateReport: (
    title: string,
    description: string,
    filters: AuditQueryFilters
  ) => Promise<AuditReport | null>;
  deleteReport: (reportId: string) => Promise<void>;
  exportReport: (
    reportId: string,
    format: 'json' | 'csv' | 'pdf'
  ) => Promise<void>;
  refresh: () => Promise<void>;
};

type UseAuditStatisticsReturn = {
  statistics: AuditStatistics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  generateStats: (filters: Partial<AuditQueryFilters>) => Promise<void>;
};

type UseAuditLoggerReturn = {
  logEvent: (
    event: Omit<AuditEvent, 'id' | 'timestamp' | 'checksum'>
  ) => Promise<void>;
  logUserAction: (
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  logSecurityEvent: (
    eventType: AuditEventType,
    description: string,
    severity?: AuditSeverity
  ) => Promise<void>;
};

// =====================================================
// HOOK: useAuditLogs
// =====================================================

/**
 * Hook para consulta e gestão de logs de auditoria
 */
export function useAuditLogs(
  options: UseAuditLogsOptions = {}
): UseAuditLogsReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30_000,
    initialFilters = {},
  } = options;

  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditQueryFilters>(initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const events = await auditSystem.queryEvents(filters);
      setLogs(events);
      setTotalCount(events.length);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar logs';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  const exportLogs = useCallback(
    async (format: 'json' | 'csv') => {
      try {
        const events = await auditSystem.queryEvents(filters);

        if (format === 'json') {
          const dataStr = JSON.stringify(events, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
        } else if (format === 'csv') {
          const headers = [
            'Timestamp',
            'Event Type',
            'Severity',
            'User ID',
            'Description',
            'IP Address',
          ];
          const csvContent = [
            headers.join(','),
            ...events.map((event) =>
              [
                event.timestamp.toISOString(),
                event.event_type,
                event.severity,
                event.user_id || '',
                `"${event.description.replace(/"/g, '""')}"`,
                event.ip_address || '',
              ].join(',')
            ),
          ].join('\n');

          const dataBlob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        }

        toast({
          title: 'Sucesso',
          description: `Logs exportados em formato ${format.toUpperCase()}`,
        });
      } catch (_err) {
        toast({
          title: 'Erro',
          description: 'Erro ao exportar logs',
          variant: 'destructive',
        });
      }
    },
    [filters, toast]
  );

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchLogs]);

  // Initial load
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchLogs,
    exportLogs,
    totalCount,
  };
}

// =====================================================
// HOOK: useSecurityAlerts
// =====================================================

/**
 * Hook para monitoramento de alertas de segurança
 */
export function useSecurityAlerts(): UseSecurityAlertsReturn {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      const formattedAlerts: SecurityAlert[] =
        data?.map((alert) => ({
          ...alert,
          created_at: new Date(alert.created_at),
          resolved_at: alert.resolved_at
            ? new Date(alert.resolved_at)
            : undefined,
        })) || [];

      setAlerts(formattedAlerts);
      setUnreadCount(
        formattedAlerts.filter((alert) => alert.status === 'open').length
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar alertas';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  const markAsRead = useCallback(
    async (alertId: string) => {
      try {
        const { error } = await supabase
          .from('security_alerts')
          .update({ status: 'investigating' })
          .eq('id', alertId);

        if (error) {
          throw error;
        }

        await fetchAlerts();
      } catch (_err) {
        toast({
          title: 'Erro',
          description: 'Erro ao marcar alerta como lido',
          variant: 'destructive',
        });
      }
    },
    [supabase, fetchAlerts, toast]
  );

  const updateStatus = useCallback(
    async (alertId: string, status: SecurityAlert['status']) => {
      try {
        const updateData: any = { status };
        if (status === 'resolved') {
          updateData.resolved_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('security_alerts')
          .update(updateData)
          .eq('id', alertId);

        if (error) {
          throw error;
        }

        await fetchAlerts();

        toast({
          title: 'Sucesso',
          description: 'Status do alerta atualizado',
        });
      } catch (_err) {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar status do alerta',
          variant: 'destructive',
        });
      }
    },
    [supabase, fetchAlerts, toast]
  );

  const assignAlert = useCallback(
    async (alertId: string, userId: string) => {
      try {
        const { error } = await supabase
          .from('security_alerts')
          .update({ assigned_to: userId })
          .eq('id', alertId);

        if (error) {
          throw error;
        }

        await fetchAlerts();

        toast({
          title: 'Sucesso',
          description: 'Alerta atribuído com sucesso',
        });
      } catch (_err) {
        toast({
          title: 'Erro',
          description: 'Erro ao atribuir alerta',
          variant: 'destructive',
        });
      }
    },
    [supabase, fetchAlerts, toast]
  );

  useEffect(() => {
    fetchAlerts();

    // Configura real-time subscription
    const subscription = supabase
      .channel('security_alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_alerts',
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAlerts, supabase]);

  return {
    alerts,
    loading,
    error,
    unreadCount,
    refresh: fetchAlerts,
    markAsRead,
    updateStatus,
    assignAlert,
  };
}

// =====================================================
// HOOK: useAuditReports
// =====================================================

/**
 * Hook para geração e gestão de relatórios de auditoria
 */
export function useAuditReports(): UseAuditReportsReturn {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const supabase = createClient();
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('audit_reports')
        .select('*')
        .order('generated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedReports: AuditReport[] =
        data?.map((report) => ({
          ...report,
          generated_at: new Date(report.generated_at),
          events: [], // Events são carregados sob demanda
        })) || [];

      setReports(formattedReports);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar relatórios';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  const generateReport = useCallback(
    async (
      title: string,
      description: string,
      filters: AuditQueryFilters
    ): Promise<AuditReport | null> => {
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive',
        });
        return null;
      }

      try {
        setLoading(true);

        const report = await auditSystem.generateReport(
          title,
          description,
          filters,
          user.id
        );

        await fetchReports();

        toast({
          title: 'Sucesso',
          description: 'Relatório gerado com sucesso',
        });

        return report;
      } catch (_err) {
        toast({
          title: 'Erro',
          description: 'Erro ao gerar relatório',
          variant: 'destructive',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchReports, toast]
  );

  const deleteReport = useCallback(
    async (reportId: string) => {
      try {
        const { error } = await supabase
          .from('audit_reports')
          .delete()
          .eq('id', reportId);

        if (error) {
          throw error;
        }

        await fetchReports();

        toast({
          title: 'Sucesso',
          description: 'Relatório excluído com sucesso',
        });
      } catch (_err) {
        toast({
          title: 'Erro',
          description: 'Erro ao excluir relatório',
          variant: 'destructive',
        });
      }
    },
    [supabase, fetchReports, toast]
  );

  const exportReport = useCallback(
    async (_reportId: string, _format: 'json' | 'csv' | 'pdf') => {
      try {
        // TODO: Implementar exportação de relatórios
        toast({
          title: 'Info',
          description: 'Funcionalidade de exportação em desenvolvimento',
        });
      } catch (_err) {
        toast({
          title: 'Erro',
          description: 'Erro ao exportar relatório',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    generateReport,
    deleteReport,
    exportReport,
    refresh: fetchReports,
  };
}

// =====================================================
// HOOK: useAuditStatistics
// =====================================================

/**
 * Hook para estatísticas de auditoria
 */
export function useAuditStatistics(): UseAuditStatisticsReturn {
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateStats = useCallback(
    async (filters: Partial<AuditQueryFilters>) => {
      try {
        setLoading(true);
        setError(null);

        const stats = await auditSystem.getStatistics(filters);
        setStatistics(stats);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao gerar estatísticas';
        setError(errorMessage);
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const refresh = useCallback(async () => {
    const defaultFilters = {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
      end_date: new Date(),
    };
    await generateStats(defaultFilters);
  }, [generateStats]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    statistics,
    loading,
    error,
    refresh,
    generateStats,
  };
}

// =====================================================
// HOOK: useAuditLogger
// =====================================================

/**
 * Hook para logging de eventos de auditoria
 */
export function useAuditLogger(): UseAuditLoggerReturn {
  const { user } = useUser();
  const { toast } = useToast();

  const logEvent = useCallback(
    async (event: Omit<AuditEvent, 'id' | 'timestamp' | 'checksum'>) => {
      try {
        await logAuditEvent({
          ...event,
          user_id: event.user_id || user?.id,
          ip_address: event.ip_address || (await getClientIP()),
          user_agent: event.user_agent || navigator.userAgent,
        });
      } catch (_err) {
        // Não mostra toast para não interferir na UX
      }
    },
    [user]
  );

  const logUserAction = useCallback(
    async (
      action: string,
      resourceType?: string,
      resourceId?: string,
      metadata?: Record<string, any>
    ) => {
      await logEvent({
        event_type: `user.${action}` as AuditEventType,
        severity: AuditSeverity.LOW,
        description: `Usuário executou ação: ${action}`,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata,
      });
    },
    [logEvent]
  );

  const logSecurityEvent = useCallback(
    async (
      eventType: AuditEventType,
      description: string,
      severity: AuditSeverity = AuditSeverity.MEDIUM
    ) => {
      await logEvent({
        event_type: eventType,
        severity,
        description,
      });
    },
    [logEvent]
  );

  return {
    logEvent,
    logUserAction,
    logSecurityEvent,
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Obtém o IP do cliente
 */
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

/**
 * Hook combinado para uso geral do sistema de auditoria
 */
export function useAudit() {
  const logs = useAuditLogs();
  const alerts = useSecurityAlerts();
  const reports = useAuditReports();
  const statistics = useAuditStatistics();
  const logger = useAuditLogger();

  return {
    logs,
    alerts,
    reports,
    statistics,
    logger,
  };
}
