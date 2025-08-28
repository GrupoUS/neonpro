"use client";

import { useCallback, useEffect, useState } from "react";

// Mock toast function since sonner is not available
const toast = (_options: { title: string; description: string }) => {};

// Mock types based on the LGPD types found in the project
export interface LGPDMetrics {
  compliance_percentage: number;
  active_consents: number;
  pending_requests: number;
  active_breaches: number;
  total_users: number;
  consent_rate: number;
  avg_response_time: number;
  last_assessment: string | null;
  overallCompliance?: number;
  activeConsents?: number;
  pendingRequests?: number;
  activeIncidents?: number;
  completedAssessments?: number;
  averageScore?: number;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  purpose_id: string;
  purpose_name: string;
  purpose_description: string;
  granted: boolean;
  granted_at: string | null;
  withdrawn_at: string | null;
  expires_at: string | null;
  version: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataSubjectRequest {
  id: string;
  user_id: string;
  request_type:
    | "access"
    | "rectification"
    | "erasure"
    | "portability"
    | "restriction"
    | "objection";
  status: "pending" | "in_progress" | "completed" | "rejected";
  description: string | null;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  response_data: unknown | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BreachIncident {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "investigating" | "resolved" | "closed";
  affected_users: number;
  data_types: string[];
  discovered_at: string;
  reported_by: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceAssessment {
  id: string;
  assessment_type: string;
  score: number;
  status: "pending" | "in_progress" | "completed";
  findings: string[];
  recommendations: string[];
  assessed_by: string;
  created_at: string;
  updated_at: string;
}

// Mock LGPDComplianceManager
class LGPDComplianceManager {
  async getDashboardMetrics(): Promise<LGPDMetrics> {
    // Mock implementation
    return {
      compliance_percentage: 85,
      active_consents: 150,
      pending_requests: 5,
      active_breaches: 0,
      total_users: 200,
      consent_rate: 0.75,
      avg_response_time: 24,
      last_assessment: new Date().toISOString(),
      overallCompliance: 85,
      activeConsents: 150,
      pendingRequests: 5,
      activeIncidents: 0,
      completedAssessments: 12,
      averageScore: 8.5,
    };
  }

  async getConsents(_options: {
    limit: number;
    sortBy: string;
    sortOrder: string;
  }): Promise<{ data: ConsentRecord[] }> {
    // Mock implementation
    return {
      data: [],
    };
  }

  async getDataSubjectRequests(_options: {
    status: string;
    limit: number;
    sortBy: string;
    sortOrder: string;
  }): Promise<{ data: DataSubjectRequest[] }> {
    // Mock implementation
    return {
      data: [],
    };
  }

  async getBreachIncidents(_options: {
    status: string;
    limit: number;
    sortBy: string;
    sortOrder: string;
  }): Promise<{ data: BreachIncident[] }> {
    // Mock implementation
    return {
      data: [],
    };
  }

  async getComplianceAssessments(_options: {
    limit: number;
    sortBy: string;
    sortOrder: string;
  }): Promise<{ data: ComplianceAssessment[] }> {
    // Mock implementation
    return {
      data: [],
    };
  }
}

interface UseLGPDDashboardReturn {
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
}

export function useLGPDDashboard(): UseLGPDDashboardReturn {
  const [metrics, setMetrics] = useState<LGPDMetrics | null>();
  const [recentConsents, setRecentConsents] = useState<ConsentRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DataSubjectRequest[]>(
    [],
  );
  const [activeIncidents, setActiveIncidents] = useState<BreachIncident[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<
    ComplianceAssessment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>();

  const complianceManager = new LGPDComplianceManager();

  const loadDashboardData = useCallback(async () => {
    try {
      setError(undefined);

      // Load metrics
      const metricsData = await complianceManager.getDashboardMetrics();
      setMetrics(metricsData);

      // Load recent consents (last 10)
      const consentsData = await complianceManager.getConsents({
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setRecentConsents(consentsData.data);

      // Load pending requests
      const requestsData = await complianceManager.getDataSubjectRequests({
        status: "pending",
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setPendingRequests(requestsData.data);

      // Load active incidents
      const incidentsData = await complianceManager.getBreachIncidents({
        status: "active",
        limit: 5,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setActiveIncidents(incidentsData.data);

      // Load recent assessments
      const assessmentsData = await complianceManager.getComplianceAssessments({
        limit: 5,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setRecentAssessments(assessmentsData.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao carregar dados do dashboard";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
      });
    }
  }, [complianceManager]);

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);

    toast({
      title: "Dashboard atualizado",
      description: "Dados do dashboard LGPD foram atualizados com sucesso.",
    });
  }, [loadDashboardData]);

  const exportMetrics = useCallback(async () => {
    try {
      if (!metrics) {
        toast({
          title: "Erro",
          description: "Nenhuma métrica disponível para exportação.",
        });
        return;
      }

      // Create CSV content
      const csvContent = [
        "Métrica,Valor,Data de Geração",
        `Conformidade Geral,${metrics.overallCompliance || metrics.compliance_percentage}%,${new Date().toISOString()}`,
        `Consentimentos Ativos,${metrics.activeConsents || metrics.active_consents},${new Date().toISOString()}`,
        `Solicitações Pendentes,${metrics.pendingRequests || metrics.pending_requests},${new Date().toISOString()}`,
        `Incidentes Ativos,${metrics.activeIncidents || metrics.active_breaches},${new Date().toISOString()}`,
        `Avaliações Concluídas,${metrics.completedAssessments || 0},${new Date().toISOString()}`,
        `Pontuação Média,${metrics.averageScore || 0},${new Date().toISOString()}`,
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `lgpd-metrics-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.append(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: "Métricas LGPD exportadas com sucesso.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao exportar métricas";
      toast({
        title: "Erro na exportação",
        description: errorMessage,
      });
    }
  }, [metrics]);

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
      5 * 60 * 1000,
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
