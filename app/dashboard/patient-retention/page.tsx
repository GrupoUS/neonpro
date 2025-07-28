"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

// Types
interface RetentionMetrics {
  retention_rate: number;
  churn_rate: number;
  net_retention_rate: number;
  patient_ltv_avg: number;
  total_patients: number;
  retained_patients: number;
  churned_patients: number;
  improvement_percentage: number;
  target_retention_rate: number;
}

interface PatientRetentionAnalytics {
  id: string;
  patient_id: string;
  retention_score: number;
  churn_risk_level: "low" | "medium" | "high" | "critical";
  churn_probability: number;
  lifetime_value: number;
  predicted_ltv: number;
  retention_segment: string;
  last_visit_date: string;
  visit_frequency_score: number;
  engagement_score: number;
  satisfaction_score: number;
  financial_score: number;
  risk_factors: string[];
  patients: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

interface ChurnPrediction {
  id: string;
  patient_id: string;
  churn_probability: number;
  risk_level: "low" | "medium" | "high" | "critical";
  predicted_churn_date: string;
  confidence_score: number;
  is_active: boolean;
  patients: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface RetentionIntervention {
  id: string;
  patient_id: string;
  intervention_type: string;
  channel: string;
  status: string;
  scheduled_date: string;
  executed_date: string;
  effectiveness_score: number;
  roi: number;
  patients: {
    first_name: string;
    last_name: string;
  };
}

interface DashboardSummary {
  retentionMetrics: RetentionMetrics;
  highRiskPatients: number;
  criticalRiskPatients: number;
  churnRiskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentInterventions: RetentionIntervention[];
}

export default function PatientRetentionDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
    null
  );
  const [retentionAnalytics, setRetentionAnalytics] = useState<
    PatientRetentionAnalytics[]
  >([]);
  const [churnPredictions, setChurnPredictions] = useState<ChurnPrediction[]>(
    []
  );
  const [interventions, setInterventions] = useState<RetentionIntervention[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  useEffect(() => {
    fetchDashboardData();
    fetchRetentionAnalytics();
    fetchChurnPredictions();
    fetchInterventions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/retention/dashboard");
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error("Dashboard fetch error:", err);
    }
  };

  const fetchRetentionAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        limit: "50",
        sort_by: "churn_probability",
        sort_order: "desc",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (riskFilter !== "all") params.append("risk_level", riskFilter);
      if (segmentFilter !== "all") params.append("segment", segmentFilter);

      const response = await fetch(
        `/api/retention/analytics?${params.toString()}`
      );
      const result = await response.json();

      if (result.success) {
        setRetentionAnalytics(result.data);
      } else {
        setError(result.error || "Failed to fetch retention analytics");
      }
    } catch (err) {
      setError("Failed to fetch retention analytics");
      console.error("Analytics fetch error:", err);
    }
  };

  const fetchChurnPredictions = async () => {
    try {
      const response = await fetch(
        "/api/retention/churn-predictions?limit=20&is_active=true"
      );
      const result = await response.json();

      if (result.success) {
        setChurnPredictions(result.data);
      } else {
        setError(result.error || "Failed to fetch churn predictions");
      }
    } catch (err) {
      setError("Failed to fetch churn predictions");
      console.error("Churn predictions fetch error:", err);
    }
  };

  const fetchInterventions = async () => {
    try {
      const response = await fetch(
        "/api/retention/interventions?limit=20&sort_by=created_at&sort_order=desc"
      );
      const result = await response.json();

      if (result.success) {
        setInterventions(result.data);
      } else {
        setError(result.error || "Failed to fetch interventions");
      }
    } catch (err) {
      setError("Failed to fetch interventions");
      console.error("Interventions fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetchDashboardData();
    fetchRetentionAnalytics();
    fetchChurnPredictions();
    fetchInterventions();
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "executed":
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "planned":
      case "scheduled":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Carregando análise de retenção...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Análise de Retenção de Pacientes
          </h1>
          <p className="text-muted-foreground mt-2">
            Analytics avançados com predições de churn e intervenções
            personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {dashboardData?.retentionMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Retenção
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardData.retentionMetrics.retention_rate * 100).toFixed(
                  1
                )}
                %
              </div>
              <Progress
                value={dashboardData.retentionMetrics.retention_rate * 100}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Meta:{" "}
                {(
                  dashboardData.retentionMetrics.target_retention_rate * 100
                ).toFixed(0)}
                %
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">LTV Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R${" "}
                {dashboardData.retentionMetrics.patient_ltv_avg.toLocaleString(
                  "pt-BR"
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {dashboardData.retentionMetrics.improvement_percentage > 0
                  ? "+"
                  : ""}
                {dashboardData.retentionMetrics.improvement_percentage.toFixed(
                  1
                )}
                % vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Alto Risco
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {dashboardData.highRiskPatients}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Necessitam intervenção imediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Risco Crítico
              </CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {dashboardData.criticalRiskPatients}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Intervenção urgente necessária
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="interventions">Intervenções</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Risco de Churn</CardTitle>
                <CardDescription>
                  Análise da distribuição de pacientes por nível de risco
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.churnRiskDistribution && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Baixo Risco</span>
                      <Badge className="bg-green-500 text-white">
                        {dashboardData.churnRiskDistribution.low}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Médio Risco</span>
                      <Badge className="bg-yellow-500 text-black">
                        {dashboardData.churnRiskDistribution.medium}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alto Risco</span>
                      <Badge className="bg-orange-500 text-white">
                        {dashboardData.churnRiskDistribution.high}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risco Crítico</span>
                      <Badge className="bg-red-500 text-white">
                        {dashboardData.churnRiskDistribution.critical}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Interventions */}
            <Card>
              <CardHeader>
                <CardTitle>Intervenções Recentes</CardTitle>
                <CardDescription>
                  Últimas ações de retenção executadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentInterventions
                    ?.slice(0, 5)
                    .map((intervention) => (
                      <div
                        key={intervention.id}
                        className="flex items-center space-x-3"
                      >
                        {getStatusIcon(intervention.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {intervention.patients.first_name}{" "}
                            {intervention.patients.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {intervention.intervention_type} via{" "}
                            {intervention.channel}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {intervention.scheduled_date &&
                              format(
                                new Date(intervention.scheduled_date),
                                "dd/MM",
                                { locale: ptBR }
                              )}
                          </div>
                          {intervention.effectiveness_score && (
                            <div className="text-xs">
                              {(intervention.effectiveness_score * 100).toFixed(
                                0
                              )}
                              % eficácia
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pacientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nível de Risco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Riscos</SelectItem>
                    <SelectItem value="low">Baixo Risco</SelectItem>
                    <SelectItem value="medium">Médio Risco</SelectItem>
                    <SelectItem value="high">Alto Risco</SelectItem>
                    <SelectItem value="critical">Risco Crítico</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Segmentos</SelectItem>
                    <SelectItem value="high_value">Alto Valor</SelectItem>
                    <SelectItem value="frequent">Frequente</SelectItem>
                    <SelectItem value="standard">Padrão</SelectItem>
                    <SelectItem value="at_risk">Em Risco</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchRetentionAnalytics}>
                  <Filter className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Retenção por Paciente</CardTitle>
              <CardDescription>
                Scores de retenção e fatores de risco detalhados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionAnalytics.map((analytics) => (
                  <div key={analytics.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">
                          {analytics.patients.first_name}{" "}
                          {analytics.patients.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {analytics.patients.email}
                        </p>
                      </div>
                      <Badge
                        className={getRiskBadgeColor(
                          analytics.churn_risk_level
                        )}
                      >
                        {analytics.churn_risk_level.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Score de Retenção
                        </span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={analytics.retention_score * 100}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {(analytics.retention_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">
                          Prob. de Churn
                        </span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={analytics.churn_probability * 100}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {(analytics.churn_probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">
                          LTV Atual
                        </span>
                        <div className="text-sm font-medium">
                          R$ {analytics.lifetime_value.toLocaleString("pt-BR")}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">
                          LTV Previsto
                        </span>
                        <div className="text-sm font-medium">
                          R$ {analytics.predicted_ltv.toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>

                    {analytics.risk_factors.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Fatores de Risco:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analytics.risk_factors.map((factor, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predições de Churn Ativas</CardTitle>
              <CardDescription>
                Modelos de IA para predição de abandono de pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnPredictions.map((prediction) => (
                  <div key={prediction.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">
                          {prediction.patients.first_name}{" "}
                          {prediction.patients.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {prediction.patients.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={getRiskBadgeColor(prediction.risk_level)}
                        >
                          {prediction.risk_level.toUpperCase()}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Confiança:{" "}
                          {(prediction.confidence_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Probabilidade de Churn
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress
                            value={prediction.churn_probability * 100}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {(prediction.churn_probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">
                          Data Prevista
                        </span>
                        <div className="text-sm font-medium">
                          {prediction.predicted_churn_date
                            ? format(
                                new Date(prediction.predicted_churn_date),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )
                            : "Não definida"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">
                          Status
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          {prediction.is_active ? (
                            <Badge className="bg-green-500 text-white">
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="outline">Inativa</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas de Retenção</CardTitle>
              <CardDescription>
                Intervenções personalizadas para retenção de pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interventions.map((intervention) => (
                  <div key={intervention.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">
                          {intervention.patients.first_name}{" "}
                          {intervention.patients.last_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {intervention.intervention_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(intervention.status)}
                          <Badge variant="outline">{intervention.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          via {intervention.channel}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Data Agendada
                        </span>
                        <div className="text-sm font-medium">
                          {intervention.scheduled_date
                            ? format(
                                new Date(intervention.scheduled_date),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR }
                              )
                            : "Não agendada"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">
                          Data Execução
                        </span>
                        <div className="text-sm font-medium">
                          {intervention.executed_date
                            ? format(
                                new Date(intervention.executed_date),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR }
                              )
                            : "Não executada"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">
                          Eficácia
                        </span>
                        <div className="text-sm font-medium">
                          {intervention.effectiveness_score
                            ? `${(intervention.effectiveness_score * 100).toFixed(0)}%`
                            : "Não avaliada"}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">
                          ROI
                        </span>
                        <div className="text-sm font-medium">
                          {intervention.roi !== null
                            ? `R$ ${intervention.roi.toLocaleString("pt-BR")}`
                            : "Não calculado"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights Baseados em IA</CardTitle>
              <CardDescription>
                Recomendações inteligentes para otimização da retenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Padrões Identificados</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>
                      • Pacientes com gaps de mais de 60 dias entre consultas
                      têm 45% mais chance de churn
                    </li>
                    <li>
                      • Intervenções via WhatsApp têm 23% mais eficácia que
                      email
                    </li>
                    <li>
                      • Pacientes com satisfação &lt; 7.0 devem receber
                      follow-up em até 48h
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">Recomendações de Ação</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>
                      • Implementar campanha automática para pacientes sem
                      agendamento há 30+ dias
                    </li>
                    <li>
                      • Personalizar ofertas baseadas no histórico de
                      tratamentos
                    </li>
                    <li>
                      • Criar programa de fidelidade para pacientes de alto
                      valor
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-medium">Oportunidades de Melhoria</h4>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>• Aumentar frequência de pesquisas de satisfação</li>
                    <li>• Desenvolver conteúdo educativo personalizado</li>
                    <li>• Implementar sistema de alertas proativos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
