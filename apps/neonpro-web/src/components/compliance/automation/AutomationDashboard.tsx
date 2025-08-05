"use client";

import type {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Eye,
  FileText,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { useToast } from "@/components/ui/use-toast";

interface AutomationMetrics {
  consent: {
    total: number;
    active: number;
    revoked: number;
    expired: number;
  };
  audit: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  dataSubjectRequests: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

interface AutomationAlert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  status: "active" | "resolved" | "dismissed";
  created_at: string;
}

interface AutomationStatus {
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  status: "running" | "idle" | "error";
  features: {
    autoConsentManagement: boolean;
    autoDataSubjectRights: boolean;
    autoAuditReporting: boolean;
    autoAnonymization: boolean;
    realTimeMonitoring: boolean;
  };
}

export default function AutomationDashboard() {
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [alerts, setAlerts] = useState<AutomationAlert[]>([]);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [complianceScore, setComplianceScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // Carregar dados de monitoramento
      const monitoringResponse = await fetch("/api/compliance/automation/monitoring");
      if (monitoringResponse.ok) {
        const monitoringData = await monitoringResponse.json();
        setMetrics(monitoringData.data.metrics);
        setComplianceScore(monitoringData.data.complianceScore);
      }

      // Carregar status da automação
      const statusResponse = await fetch("/api/compliance/automation");
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setAutomationStatus(statusData.data.status);
      }

      // Carregar alertas ativos
      const alertsResponse = await fetch(
        "/api/compliance/automation/alerts?status=active&limit=10",
      );
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data.alerts);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automação LGPD</h1>
          <p className="text-muted-foreground">
            Monitoramento e controle da conformidade automatizada
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>
      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Conformidade</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getComplianceScoreColor(complianceScore)}>
                {complianceScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={complianceScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {complianceScore >= 90
                ? "Excelente"
                : complianceScore >= 70
                  ? "Bom"
                  : "Requer atenção"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.consent.active || 0}</div>
            <p className="text-xs text-muted-foreground">{metrics?.consent.total || 0} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.dataSubjectRequests.byStatus?.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.dataSubjectRequests.total || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter((a) => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter((a) => a.severity === "critical").length} críticos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status da Automação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Status da Automação
          </CardTitle>
          <CardDescription>Controle e monitoramento dos processos automatizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Automação Geral</span>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      automationStatus?.status === "running"
                        ? "default"
                        : automationStatus?.status === "error"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {automationStatus?.status === "running"
                      ? "Ativo"
                      : automationStatus?.status === "error"
                        ? "Erro"
                        : "Inativo"}
                  </Badge>
                  <Switch checked={automationStatus?.enabled || false} disabled />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Última execução:{" "}
                  {automationStatus?.lastRun
                    ? new Date(automationStatus.lastRun).toLocaleString("pt-BR")
                    : "Nunca"}
                </p>
                <p>
                  Próxima execução:{" "}
                  {automationStatus?.nextRun
                    ? new Date(automationStatus.nextRun).toLocaleString("pt-BR")
                    : "Não agendada"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recursos Habilitados</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gestão de Consentimentos</span>
                  <Switch
                    checked={automationStatus?.features.autoConsentManagement || false}
                    disabled
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Direitos dos Titulares</span>
                  <Switch
                    checked={automationStatus?.features.autoDataSubjectRights || false}
                    disabled
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Relatórios de Auditoria</span>
                  <Switch
                    checked={automationStatus?.features.autoAuditReporting || false}
                    disabled
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anonimização</span>
                  <Switch
                    checked={automationStatus?.features.autoAnonymization || false}
                    disabled
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monitoramento em Tempo Real</span>
                  <Switch
                    checked={automationStatus?.features.realTimeMonitoring || false}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Tabs com Detalhes */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="metrics">Métricas Detalhadas</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Conformidade</CardTitle>
              <CardDescription>Alertas ativos que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum alerta ativo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <Alert key={alert.id} className="border-l-4 border-l-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>{alert.title}</span>
                        <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">{alert.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Categoria: {alert.category}</span>
                          <span>{new Date(alert.created_at).toLocaleString("pt-BR")}</span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações de Automação</CardTitle>
              <CardDescription>Execute ações manuais de conformidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 flex-col">
                  <Play className="h-6 w-6 mb-2" />
                  <span>Executar Automação Completa</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Processar Consentimentos</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Processar Solicitações</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <Database className="h-6 w-6 mb-2" />
                  <span>Executar Anonimização</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <Eye className="h-6 w-6 mb-2" />
                  <span>Auditoria Manual</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Gerar Relatórios</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Consentimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{metrics?.consent.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ativos:</span>
                    <span className="font-medium text-green-600">
                      {metrics?.consent.active || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revogados:</span>
                    <span className="font-medium text-red-600">
                      {metrics?.consent.revoked || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expirados:</span>
                    <span className="font-medium text-yellow-600">
                      {metrics?.consent.expired || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Auditoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de Eventos:</span>
                    <span className="font-medium">{metrics?.audit.total || 0}</span>
                  </div>
                  {metrics?.audit.bySeverity &&
                    Object.entries(metrics.audit.bySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex justify-between">
                        <span className="capitalize">{severity}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
