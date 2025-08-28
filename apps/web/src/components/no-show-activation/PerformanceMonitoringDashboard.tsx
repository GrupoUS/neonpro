"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

// Types for performance data
export interface PerformanceMetrics {
  period: {
    startDate: string;
    endDate: string;
    periodType: "day" | "week" | "month" | "quarter";
  };
  predictions: {
    totalPredictions: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    modelConfidence: number;
  };
  interventions: {
    totalSent: number;
    smsCount: number;
    emailCount: number;
    phoneCallCount: number;
    responseRate: number;
    successRate: number;
  };
  appointments: {
    totalScheduled: number;
    actualNoShows: number;
    predictedNoShows: number;
    preventedNoShows: number;
    noShowRateBefore: number;
    noShowRateAfter: number;
    reductionPercentage: number;
  };
  financial: {
    totalCosts: number;
    interventionCosts: number;
    preventionSavings: number;
    netROI: number;
    costPerPrevention: number;
    projectedAnnualROI: number;
  };
  staff: {
    totalAlerts: number;
    averageResponseTime: number;
    alertsAcknowledged: number;
    staffEngagementRate: number;
    workflowEfficiency: number;
  };
  trends: {
    weeklyMetrics: WeeklyMetric[];
    monthlyROI: MonthlyROI[];
    interventionSuccess: InterventionTrend[];
  };
}

export interface WeeklyMetric {
  week: string;
  predictions: number;
  interventions: number;
  successRate: number;
  roi: number;
}

export interface MonthlyROI {
  month: string;
  roi: number;
  target: number;
  savings: number;
  costs: number;
}

export interface InterventionTrend {
  date: string;
  type: "sms" | "email" | "phone";
  count: number;
  successRate: number;
  cost: number;
}

export interface PerformanceMonitoringDashboardProps {
  metrics: PerformanceMetrics;
  loading?: boolean;
  onRefresh?: () => void;
  onExportReport?: (format: "pdf" | "excel", period: string) => void;
  onPeriodChange?: (period: "day" | "week" | "month" | "quarter") => void;
  className?: string;
}

// Performance targets for Brazil
const PERFORMANCE_TARGETS = {
  accuracy: 0.87, // Target ML accuracy
  noShowReduction: 0.25, // Target 25% reduction
  responseRate: 0.6, // Target 60% patient response rate
  staffResponseTime: 300, // Target 5 minutes in seconds
  annualROI: 150_000, // Target R$ 150,000 annual savings
  interventionCost: 2.5, // Target R$ 2.50 per intervention
};

export function PerformanceMonitoringDashboard({
  metrics,
  loading = false,
  onRefresh,
  onExportReport,
  onPeriodChange,
  className = "",
}: PerformanceMonitoringDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  // Calculate performance indicators
  const performanceIndicators = useMemo(() => {
    return {
      accuracyStatus:
        metrics.predictions.accuracy >= PERFORMANCE_TARGETS.accuracy
          ? "success"
          : "warning",
      reductionStatus:
        metrics.appointments.reductionPercentage >=
        PERFORMANCE_TARGETS.noShowReduction
          ? "success"
          : "warning",
      responseStatus:
        metrics.interventions.responseRate >= PERFORMANCE_TARGETS.responseRate
          ? "success"
          : "warning",
      roiStatus:
        metrics.financial.projectedAnnualROI >= PERFORMANCE_TARGETS.annualROI
          ? "success"
          : "warning",
      staffStatus:
        metrics.staff.averageResponseTime <=
        PERFORMANCE_TARGETS.staffResponseTime
          ? "success"
          : "warning",
    };
  }, [metrics]);

  // Format Brazilian currency
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  }, []);

  // Format percentage
  const formatPercentage = useCallback(
    (value: number, decimals: number = 1): string => {
      return new Intl.NumberFormat("pt-BR", {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    },
    [],
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [onRefresh]);

  // Handle export
  const handleExport = useCallback(
    (format: "pdf" | "excel") => {
      if (onExportReport) {
        onExportReport(format, metrics.period.periodType);
      }
    },
    [onExportReport, metrics.period.periodType],
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monitoramento de Performance - Anti-No-Show
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={metrics.period.periodType}
                onValueChange={(value) => onPeriodChange?.(value as any)}
              >
                <SelectTrigger className="w-[120px]">
                  <Calendar className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport("excel")}
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport("pdf")}
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>

              <Button
                size="sm"
                disabled={loading || refreshing}
                onClick={handleRefresh}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 mr-1",
                    (loading || refreshing) && "animate-spin",
                  )}
                />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="interventions">Intervenções</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card
              className={cn(
                "border-l-4",
                performanceIndicators.accuracyStatus === "success"
                  ? "border-l-green-500"
                  : "border-l-yellow-500",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Precisão do Modelo
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(metrics.predictions.accuracy)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  <Progress
                    value={metrics.predictions.accuracy * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta: {formatPercentage(PERFORMANCE_TARGETS.accuracy)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border-l-4",
                performanceIndicators.reductionStatus === "success"
                  ? "border-l-green-500"
                  : "border-l-yellow-500",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Redução de Faltas
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(
                        metrics.appointments.reductionPercentage,
                      )}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2">
                  <Progress
                    value={metrics.appointments.reductionPercentage * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta:{" "}
                    {formatPercentage(PERFORMANCE_TARGETS.noShowReduction)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border-l-4",
                performanceIndicators.responseStatus === "success"
                  ? "border-l-green-500"
                  : "border-l-yellow-500",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Taxa de Resposta
                    </p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(metrics.interventions.responseRate)}
                    </p>
                  </div>
                  <Phone className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  <Progress
                    value={metrics.interventions.responseRate * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta: {formatPercentage(PERFORMANCE_TARGETS.responseRate)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border-l-4",
                performanceIndicators.roiStatus === "success"
                  ? "border-l-green-500"
                  : "border-l-yellow-500",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      ROI Projetado
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(metrics.financial.projectedAnnualROI)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2">
                  <Progress
                    value={Math.min(
                      100,
                      (metrics.financial.projectedAnnualROI /
                        PERFORMANCE_TARGETS.annualROI) *
                        100,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta: {formatCurrency(PERFORMANCE_TARGETS.annualROI)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border-l-4",
                performanceIndicators.staffStatus === "success"
                  ? "border-l-green-500"
                  : "border-l-yellow-500",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Resposta da Equipe
                    </p>
                    <p className="text-2xl font-bold">
                      {Math.round(metrics.staff.averageResponseTime / 60)}min
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  <Progress
                    value={Math.max(
                      0,
                      100 -
                        (metrics.staff.averageResponseTime /
                          PERFORMANCE_TARGETS.staffResponseTime) *
                          100,
                    )}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta:{" "}
                    {Math.round(PERFORMANCE_TARGETS.staffResponseTime / 60)}min
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Consultas Analisadas
                    </p>
                    <p className="text-xl font-bold">
                      {metrics.appointments.totalScheduled.toLocaleString(
                        "pt-BR",
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Intervenções Enviadas
                    </p>
                    <p className="text-xl font-bold">
                      {metrics.interventions.totalSent.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Faltas Prevenidas
                    </p>
                    <p className="text-xl font-bold">
                      {metrics.appointments.preventedNoShows.toLocaleString(
                        "pt-BR",
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Alertas da Equipe
                    </p>
                    <p className="text-xl font-bold">
                      {metrics.staff.totalAlerts.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas do Modelo ML</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Precisão (Accuracy)
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={metrics.predictions.accuracy * 100}
                      className="w-20 h-2"
                    />
                    <span className="text-sm font-bold">
                      {formatPercentage(metrics.predictions.accuracy)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Precisão (Precision)
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={metrics.predictions.precision * 100}
                      className="w-20 h-2"
                    />
                    <span className="text-sm font-bold">
                      {formatPercentage(metrics.predictions.precision)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recall</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={metrics.predictions.recall * 100}
                      className="w-20 h-2"
                    />
                    <span className="text-sm font-bold">
                      {formatPercentage(metrics.predictions.recall)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">F1-Score</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={metrics.predictions.f1Score * 100}
                      className="w-20 h-2"
                    />
                    <span className="text-sm font-bold">
                      {formatPercentage(metrics.predictions.f1Score)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confiança Média</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={metrics.predictions.modelConfidence * 100}
                      className="w-20 h-2"
                    />
                    <span className="text-sm font-bold">
                      {formatPercentage(metrics.predictions.modelConfidence)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efetividade das Predições</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics.appointments.preventedNoShows}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Faltas Prevenidas
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
                      {formatPercentage(metrics.appointments.noShowRateBefore)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Taxa Antes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {formatPercentage(metrics.appointments.noShowRateAfter)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Taxa Depois
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Redução de{" "}
                      {formatPercentage(
                        metrics.appointments.reductionPercentage,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.interventions.smsCount.toLocaleString("pt-BR")}
                </div>
                <p className="text-sm text-muted-foreground">Enviados</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Taxa de Sucesso</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="mt-1 h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.interventions.emailCount.toLocaleString("pt-BR")}
                </div>
                <p className="text-sm text-muted-foreground">Enviados</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Taxa de Sucesso</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <Progress value={72} className="mt-1 h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Ligações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.interventions.phoneCallCount.toLocaleString("pt-BR")}
                </div>
                <p className="text-sm text-muted-foreground">Realizadas</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Taxa de Sucesso</span>
                    <span className="font-medium">91%</span>
                  </div>
                  <Progress value={91} className="mt-1 h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Retorno do Investimento (ROI)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(metrics.financial.netROI)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ROI Líquido no Período
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Economia com Prevenção:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(metrics.financial.preventionSavings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Custos de Intervenção:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(metrics.financial.interventionCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Custo por Prevenção:</span>
                    <span className="font-medium">
                      {formatCurrency(metrics.financial.costPerPrevention)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projeção Anual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(metrics.financial.projectedAnnualROI)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ROI Projetado (12 meses)
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progresso para Meta Anual</span>
                    <span className="font-medium">
                      {Math.round(
                        (metrics.financial.projectedAnnualROI /
                          PERFORMANCE_TARGETS.annualROI) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      (metrics.financial.projectedAnnualROI /
                        PERFORMANCE_TARGETS.annualROI) *
                        100,
                    )}
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta: {formatCurrency(PERFORMANCE_TARGETS.annualROI)}
                  </p>
                </div>

                {metrics.financial.projectedAnnualROI >=
                  PERFORMANCE_TARGETS.annualROI && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Meta anual atingida!
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceMonitoringDashboard;
