'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LGPDComplianceManager } from '@/lib/lgpd/LGPDComplianceManager';
import type {
  BreachIncident,
  ComplianceAssessment,
  ConsentRecord,
  DataSubjectRequest,
  LGPDMetrics,
} from '@/types/lgpd';

type UseLGPDDashboardReturn = {
  // Data
  metrics: LGPDMetrics | null;
  recentConsents: ConsentRecord[];
  pendingRequests: DataSubjectRequest[];
  activeIncidents: BreachIncident[];
  recentAssessments: ComplianceAssessment[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Actions
  refreshDashboard: () => Promise<void>;
  exportMetrics: () => Promise<void>;

  // Error handling
  error: string | null;
};

export function useLGPDDashboard(): UseLGPDDashboardReturn {
  const [metrics, setMetrics] = useState<LGPDMetrics | null>(null);
  const [recentConsents, setRecentConsents] = useState<ConsentRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DataSubjectRequest[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<BreachIncident[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<ComplianceAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const complianceManager = new LGPDComplianceManager();

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);

      // Load metrics
      const metricsData = await complianceManager.getDashboardMetrics();
      setMetrics(metricsData);

      // Load recent consents (last 10)
      const consentsData = await complianceManager.getConsents({
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setRecentConsents(consentsData.data);

      // Load pending requests
      const requestsData = await complianceManager.getDataSubjectRequests({
        status: 'pending',
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setPendingRequests(requestsData.data);

      // Load active incidents
      const incidentsData = await complianceManager.getBreachIncidents({
        status: 'active',
        limit: 5,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setActiveIncidents(incidentsData.data);

      // Load recent assessments
      const assessmentsData = await complianceManager.getComplianceAssessments({
        limit: 5,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setRecentAssessments(assessmentsData.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [complianceManager, toast]);

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);

    toast({
      title: 'Dashboard atualizado',
      description: 'Dados do dashboard LGPD foram atualizados com sucesso.',
    });
  }, [loadDashboardData, toast]);

  const exportMetrics = useCallback(async () => {
    try {
      if (!metrics) {
        toast({
          title: 'Erro',
          description: 'Nenhuma métrica disponível para exportação.',
          variant: 'destructive',
        });
        return;
      }

      // Create CSV content
      const csvContent = [
        'Métrica,Valor,Data de Geração',
        `Conformidade Geral,${metrics.overallCompliance}%,${new Date().toISOString()}`,
        `Consentimentos Ativos,${metrics.activeConsents},${new Date().toISOString()}`,
        `Solicitações Pendentes,${metrics.pendingRequests},${new Date().toISOString()}`,
        `Incidentes Ativos,${metrics.activeIncidents},${new Date().toISOString()}`,
        `Avaliações Concluídas,${metrics.completedAssessments},${new Date().toISOString()}`,
        `Pontuação Média,${metrics.averageScore},${new Date().toISOString()}`,
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lgpd-metrics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Exportação concluída',
        description: 'Métricas LGPD exportadas com sucesso.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar métricas';
      toast({
        title: 'Erro na exportação',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [metrics, toast]);

  // Initial load
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      await loadDashboardData();
      setIsLoading(false);
    };

    initializeDashboard();
  }, [loadDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!isRefreshing) {
          loadDashboardData();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [loadDashboardData, isRefreshing]);

  return {
    // Data
    metrics,
    recentConsents,
    pendingRequests,
    activeIncidents,
    recentAssessments,

    // Loading states
    isLoading,
    isRefreshing,

    // Actions
    refreshDashboard,
    exportMetrics,

    // Error handling
    error,
  };
}
