"use client";

/**
 * AnalyticsDashboard - Advanced Healthcare Analytics Dashboard
 *
 * Real-time patient insights with AI-powered predictive analytics for Brazilian healthcare.
 * Features comprehensive monitoring, compliance tracking, and intelligent decision support.
 *
 * @version 1.0.0
 * @author NeonPro Healthcare AI Team
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Brain,
  Zap,
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Stethoscope,
  Heart,
  RefreshCw,
  Download,
  Filter,
  Search,
  Bell,
  Settings,
  ChevronRight,
  ChevronDown,
  Eye,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AnalyticsDashboardProps,
  HealthcareAnalytics,
  MetricCard,
  AIInsight,
  AIRecommendation,
  CriticalAlert,
  ComplianceAnalytics,
  BrazilianHealthcareIntelligence,
} from "@/types/analytics";

// ====== MOCK DATA FOR DEMONSTRATION ======
const mockAnalyticsData: HealthcareAnalytics = {
  patientId: "patient-123",
  clinicId: "clinic-456",
  generatedAt: new Date(),
  analytics: {
    patientOutcomePrediction: {
      treatmentId: "treatment-789",
      outcomeScore: 85,
      predictionAccuracy: 92,
      factors: [],
      timeline: {
        phases: [],
        totalDuration: 30,
        criticalMilestones: [],
        flexibilityScore: 75,
      },
      alternatives: [],
      riskFactors: ["Diabetes", "Hypertension"],
      confidenceInterval: [78, 92],
    },
    riskAssessment: {
      patientId: "patient-123",
      assessmentDate: new Date(),
      overallRisk: "medium",
      riskFactors: [],
      complicationProbability: 0.15,
      recommendedActions: [],
      reassessmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      escalationTriggers: [],
    },
    treatmentEffectiveness: {
      treatmentType: "Laser Treatment",
      successRate: 89,
      patientSatisfaction: 94,
      complicationRate: 3,
      recoveryTime: { average: 14, median: 12, range: [7, 28] },
      costEffectiveness: 87,
      professionalPerformance: {} as any,
      benchmarkComparison: {} as any,
    },
    complianceMetrics: {
      cfmCompliance: {
        overallScore: 95,
        licenseValidation: 100,
        professionalEthics: 92,
        continuingEducation: 88,
        patientSafety: 97,
        lastAudit: new Date(),
        nextAudit: new Date(),
        violations: [],
      },
      anvisaCompliance: {
        overallScore: 91,
        controlledSubstances: 95,
        sanitaryLicense: 90,
        equipmentValidation: 88,
        adverseEventReporting: 92,
        lastInspection: new Date(),
        nextInspection: new Date(),
        violations: [],
      },
      lgpdCompliance: {
        overallScore: 88,
        dataProcessing: 90,
        consentManagement: 85,
        dataSubjectRights: 92,
        securityMeasures: 87,
        incidentResponse: 83,
        lastAssessment: new Date(),
        nextAssessment: new Date(),
        violations: [],
      },
      overallScore: 91,
      violations: [],
      auditReadiness: 93,
      lastAuditDate: new Date(),
      nextAuditDue: new Date(),
    },
    emergencyIndicators: {
      criticalAlerts: [],
      abnormalPatterns: [],
      escalationRequired: false,
      emergencyProtocols: [],
      responseTime: 5,
      autoNotifications: [],
    },
  },
  insights: [
    {
      id: "insight-1",
      type: "trend",
      priority: "high",
      title: "Aumento na Taxa de Sucesso",
      description:
        "Taxa de sucesso dos tratamentos a laser aumentou 12% no último mês",
      confidence: 0.89,
      actionRequired: false,
      relatedData: ["laser-treatments"],
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "insight-2",
      type: "anomaly",
      priority: "critical",
      title: "Padrão Anômalo de No-Show",
      description:
        "Aumento significativo de faltas em consultas às quintas-feiras",
      confidence: 0.94,
      actionRequired: true,
      relatedData: ["appointments", "no-show"],
      generatedAt: new Date(),
    },
  ],
  recommendations: [
    {
      id: "rec-1",
      category: "optimization",
      title: "Otimizar Agendamento de Quinta-feira",
      description:
        "Implementar lembretes personalizados para reduzir no-show às quintas",
      expectedOutcome: "Redução de 25% no no-show",
      confidenceLevel: 0.87,
      evidenceLevel: "B",
      implementation: {
        difficulty: "easy",
        timeRequired: 2,
        resources: ["SMS API"],
        dependencies: [],
      },
      metrics: { expectedImprovement: 25, costImpact: -500, riskReduction: 15 },
    },
  ],
  trends: [],
  confidence: 0.91,
};

const dashboardMetrics: MetricCard[] = [
  {
    id: "total-patients",
    title: "Pacientes Ativos",
    value: "2,347",
    previousValue: "2,180",
    change: 7.7,
    changeDirection: "up",
    trend: [65, 70, 68, 72, 75, 73, 78, 82, 85, 89],
    unit: "",
    format: "number",
    status: "good",
    icon: Users,
    color: "#16a34a",
    target: 2500,
    benchmark: 2200,
  },
  {
    id: "success-rate",
    title: "Taxa de Sucesso",
    value: "89.2",
    previousValue: "87.1",
    change: 2.4,
    changeDirection: "up",
    trend: [85, 86, 87, 88, 87, 89, 90, 89, 91, 89],
    unit: "%",
    format: "percentage",
    status: "good",
    icon: Target,
    color: "#059669",
    target: 90,
    benchmark: 85,
  },
  {
    id: "revenue",
    title: "Receita Mensal",
    value: "R$ 245.690",
    previousValue: "R$ 221.340",
    change: 11,
    changeDirection: "up",
    trend: [180, 190, 195, 210, 205, 220, 235, 240, 238, 245],
    unit: "BRL",
    format: "currency",
    status: "good",
    icon: TrendingUp,
    color: "#16a34a",
    target: 250_000,
    benchmark: 230_000,
  },
  {
    id: "compliance-score",
    title: "Score de Compliance",
    value: "91.2",
    previousValue: "88.7",
    change: 2.8,
    changeDirection: "up",
    trend: [85, 87, 86, 88, 89, 90, 91, 90, 92, 91],
    unit: "%",
    format: "percentage",
    status: "good",
    icon: Shield,
    color: "#059669",
    target: 95,
    benchmark: 85,
  },
];

export default function AnalyticsDashboard({
  clinicId,
  dateRange,
  refreshInterval = 5,
  realTimeEnabled = true,
  exportEnabled = true,
  customFilters = [],
  permissions = [],
}: AnalyticsDashboardProps) {
  // ====== STATE MANAGEMENT ======
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] =
    useState<HealthcareAnalytics>(mockAnalyticsData);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
  const [activeTab, setActiveTab] = useState("overview");
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [expandedInsights, setExpandedInsights] = useState<string[]>([]);
  const [realTimeData, setRealTimeData] = useState(realTimeEnabled);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // ====== REAL-TIME DATA SUBSCRIPTION ======
  useEffect(() => {
    if (!realTimeData || !refreshInterval) {
      return;
    }

    const interval = setInterval(
      () => {
        // Simulate real-time data updates
        setLastRefresh(new Date());
        // In real implementation, fetch fresh data here
      },
      refreshInterval * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [refreshInterval, realTimeData]);

  // ====== DATA HANDLERS ======
  const handleRefreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
      // In real implementation, fetch fresh analytics data
    } catch (error) {
      console.error("Failed to refresh analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExportData = useCallback(() => {
    // Export functionality
    const dataToExport = {
      analytics,
      metrics: dashboardMetrics,
      exportedAt: new Date(),
      dateRange: selectedDateRange,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `healthcare-analytics-${clinicId}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analytics, clinicId, selectedDateRange]);

  const toggleInsightExpansion = useCallback((insightId: string) => {
    setExpandedInsights((prev) =>
      prev.includes(insightId)
        ? prev.filter((id) => id !== insightId)
        : [...prev, insightId],
    );
  }, []);

  // ====== COMPUTED VALUES ======
  const criticalInsights = useMemo(
    () =>
      analytics.insights.filter((insight) => insight.priority === "critical"),
    [analytics.insights],
  );

  const overallHealthScore = useMemo(() => {
    const metrics = dashboardMetrics.map((m) =>
      parseFloat(String(m.value).replace(/[^\d.]/g, "")),
    );
    return Math.round(
      metrics.reduce((sum, val) => sum + val, 0) / metrics.length,
    );
  }, []);

  const complianceStatus = useMemo(() => {
    const score = analytics.analytics.complianceMetrics.overallScore;
    if (score >= 95) {
      return { status: "excellent", color: "#059669" };
    }
    if (score >= 85) {
      return { status: "good", color: "#16a34a" };
    }
    if (score >= 70) {
      return { status: "warning", color: "#f59e0b" };
    }
    return { status: "critical", color: "#dc2626" };
  }, [analytics.analytics.complianceMetrics.overallScore]);

  // ====== RENDER COMPONENTS ======
  const renderMetricCard = (metric: MetricCard) => (
    <Card key={metric.id} className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {metric.icon && (
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          )}
          {metric.status && (
            <Badge
              variant={metric.status === "good" ? "default" : "destructive"}
              className="h-5"
            >
              {metric.status === "good" ? "Bom" : "Atenção"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {metric.format === "currency"
                ? metric.value
                : metric.format === "percentage"
                  ? `${metric.value}%`
                  : metric.value}
            </div>
            {metric.change !== undefined && (
              <div className="flex items-center space-x-2 text-sm">
                {metric.changeDirection === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : metric.changeDirection === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null}
                <span
                  className={cn(
                    "font-medium",
                    metric.changeDirection === "up"
                      ? "text-green-600"
                      : metric.changeDirection === "down"
                        ? "text-red-600"
                        : "text-muted-foreground",
                  )}
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs mês anterior</span>
              </div>
            )}
          </div>
          {metric.trend && (
            <div className="h-16 w-24">
              {/* Simplified sparkline representation */}
              <div className="flex h-full items-end space-x-1">
                {metric.trend.map((value, index) => (
                  <div
                    key={index}
                    className="bg-primary/20 rounded-sm"
                    style={{
                      height: `${(value / Math.max(...metric.trend!)) * 100}%`,
                      width: "8px",
                      backgroundColor: metric.color || "#3b82f6",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        {metric.target && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Meta</span>
              <span>
                {metric.format === "currency"
                  ? `R$ ${metric.target.toLocaleString()}`
                  : metric.target}
              </span>
            </div>
            <Progress
              value={
                (parseFloat(String(metric.value).replace(/[^\d.]/g, "")) /
                  metric.target) *
                100
              }
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderInsightCard = (insight: AIInsight) => (
    <Card
      key={insight.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader
        className="pb-2"
        onClick={() => toggleInsightExpansion(insight.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "p-2 rounded-full",
                insight.priority === "critical"
                  ? "bg-red-100 text-red-600"
                  : insight.priority === "high"
                    ? "bg-orange-100 text-orange-600"
                    : insight.priority === "medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-blue-100 text-blue-600",
              )}
            >
              {insight.type === "trend" ? (
                <TrendingUp className="h-4 w-4" />
              ) : insight.type === "anomaly" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : insight.type === "prediction" ? (
                <Brain className="h-4 w-4" />
              ) : (
                <Target className="h-4 w-4" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{insight.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={
                    insight.priority === "critical"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {insight.priority === "critical"
                    ? "Crítico"
                    : insight.priority === "high"
                      ? "Alto"
                      : insight.priority === "medium"
                        ? "Médio"
                        : "Baixo"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Confiança: {(insight.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {insight.actionRequired && (
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-200"
              >
                Ação Necessária
              </Badge>
            )}
            {expandedInsights.includes(insight.id) ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {expandedInsights.includes(insight.id) && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3">
            {insight.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Gerado: {insight.generatedAt.toLocaleDateString("pt-BR")}
            </span>
            {insight.validUntil && (
              <span className="text-muted-foreground">
                Válido até: {insight.validUntil.toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderRecommendationCard = (recommendation: AIRecommendation) => (
    <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{recommendation.title}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">
                {recommendation.category === "treatment"
                  ? "Tratamento"
                  : recommendation.category === "prevention"
                    ? "Prevenção"
                    : recommendation.category === "optimization"
                      ? "Otimização"
                      : "Compliance"}
              </Badge>
              <Badge variant="outline">
                Nível {recommendation.evidenceLevel}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-green-600">
              +{recommendation.metrics.expectedImprovement}%
            </div>
            <div className="text-xs text-muted-foreground">
              Confiança: {(recommendation.confidenceLevel * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {recommendation.description}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Resultado Esperado:</span>
            <span className="font-medium">
              {recommendation.expectedOutcome}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dificuldade:</span>
            <Badge
              variant={
                recommendation.implementation.difficulty === "easy"
                  ? "default"
                  : recommendation.implementation.difficulty === "moderate"
                    ? "secondary"
                    : "destructive"
              }
            >
              {recommendation.implementation.difficulty === "easy"
                ? "Fácil"
                : recommendation.implementation.difficulty === "moderate"
                  ? "Moderada"
                  : "Difícil"}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tempo Necessário:</span>
            <span>{recommendation.implementation.timeRequired}h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Impacto no Custo:</span>
            <span
              className={cn(
                "font-medium",
                recommendation.metrics.costImpact < 0
                  ? "text-green-600"
                  : "text-red-600",
              )}
            >
              R$ {Math.abs(recommendation.metrics.costImpact).toLocaleString()}
            </span>
          </div>
        </div>
        <Button size="sm" className="w-full mt-3">
          Implementar Recomendação
        </Button>
      </CardContent>
    </Card>
  );

  // ====== MAIN RENDER ======
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics de Saúde Inteligente
          </h1>
          <p className="text-muted-foreground">
            Análise preditiva avançada com IA para clínicas brasileiras
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select
            value={selectedDateRange.preset}
            onValueChange={(value) => {
              // Handle date range change
              console.log("Date range changed:", value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            Atualizar
          </Button>

          {exportEnabled && (
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Status and Alerts Bar */}
      {realTimeData && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-blue-500">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Sistema Ativo</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Última atualização: {lastRefresh.toLocaleTimeString("pt-BR")}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                Score Geral:{" "}
                <span className="font-bold text-green-600">
                  {overallHealthScore}/100
                </span>
              </div>
              <Badge
                className={cn(
                  "text-white",
                  complianceStatus.status === "excellent"
                    ? "bg-green-600"
                    : complianceStatus.status === "good"
                      ? "bg-blue-600"
                      : complianceStatus.status === "warning"
                        ? "bg-yellow-600"
                        : "bg-red-600",
                )}
              >
                Compliance: {analytics.analytics.complianceMetrics.overallScore}
                %
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardMetrics.map(renderMetricCard)}
      </div>

      {/* Critical Insights Alert */}
      {criticalInsights.length > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">
                Insights Críticos Requerem Atenção
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{insight.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {insight.description}
                    </div>
                  </div>
                  <Button size="sm" variant="destructive">
                    Revisar Agora
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger
            value="predictions"
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>Predições</span>
          </TabsTrigger>
          <TabsTrigger
            value="monitoring"
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Monitoramento</span>
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            className="flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Insights IA</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Treatment Effectiveness Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Efetividade dos Tratamentos</CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p>Gráfico de efetividade será implementado aqui</p>
                </div>
              </CardContent>
            </Card>

            {/* Patient Satisfaction Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Satisfação</CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Gráfico de tendências será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: "14:30",
                    action: "Nova consulta agendada",
                    patient: "Maria Silva",
                    type: "appointment",
                  },
                  {
                    time: "14:15",
                    action: "Tratamento finalizado",
                    patient: "João Santos",
                    type: "treatment",
                  },
                  {
                    time: "13:45",
                    action: "Resultado de exame disponível",
                    patient: "Ana Costa",
                    type: "result",
                  },
                  {
                    time: "13:20",
                    action: "Pagamento processado",
                    patient: "Carlos Lima",
                    type: "payment",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        activity.type === "appointment"
                          ? "bg-blue-100 text-blue-600"
                          : activity.type === "treatment"
                            ? "bg-green-100 text-green-600"
                            : activity.type === "result"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-yellow-100 text-yellow-600",
                      )}
                    >
                      {activity.type === "appointment" ? (
                        <Calendar className="h-4 w-4" />
                      ) : activity.type === "treatment" ? (
                        <Stethoscope className="h-4 w-4" />
                      ) : activity.type === "result" ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">
                        Paciente: {activity.patient}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">
              Predições IA em Desenvolvimento
            </h3>
            <p className="text-muted-foreground">
              Sistema de predições inteligentes será implementado na próxima
              fase
            </p>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">Monitoramento em Tempo Real</h3>
            <p className="text-muted-foreground">
              Sistema de monitoramento avançado será implementado na próxima
              fase
            </p>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CFM Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Compliance CFM</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {
                        analytics.analytics.complianceMetrics.cfmCompliance
                          .overallScore
                      }
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score Geral
                    </div>
                  </div>
                  <Progress
                    value={
                      analytics.analytics.complianceMetrics.cfmCompliance
                        .overallScore
                    }
                    className="h-2"
                  />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Validação CRM</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.cfmCompliance
                            .licenseValidation
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ética Profissional</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.cfmCompliance
                            .professionalEthics
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Educação Continuada</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.cfmCompliance
                            .continuingEducation
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ANVISA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Compliance ANVISA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {
                        analytics.analytics.complianceMetrics.anvisaCompliance
                          .overallScore
                      }
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score Geral
                    </div>
                  </div>
                  <Progress
                    value={
                      analytics.analytics.complianceMetrics.anvisaCompliance
                        .overallScore
                    }
                    className="h-2"
                  />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Substâncias Controladas</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.anvisaCompliance
                            .controlledSubstances
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Licença Sanitária</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.anvisaCompliance
                            .sanitaryLicense
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Validação Equipamentos</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.anvisaCompliance
                            .equipmentValidation
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LGPD Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Compliance LGPD</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {
                        analytics.analytics.complianceMetrics.lgpdCompliance
                          .overallScore
                      }
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score Geral
                    </div>
                  </div>
                  <Progress
                    value={
                      analytics.analytics.complianceMetrics.lgpdCompliance
                        .overallScore
                    }
                    className="h-2"
                  />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Processamento Dados</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.lgpdCompliance
                            .dataProcessing
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gestão Consentimento</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.lgpdCompliance
                            .consentManagement
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medidas Segurança</span>
                      <span className="font-medium">
                        {
                          analytics.analytics.complianceMetrics.lgpdCompliance
                            .securityMeasures
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Insights de IA</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Análises automatizadas e descobertas inteligentes
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.insights.map(renderInsightCard)}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendações IA</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sugestões inteligentes para otimização
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recommendations.map(renderRecommendationCard)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
