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
  ArrowDown,
  ArrowUp,
  BarChart3,
  Brain,
  Calendar,
  DollarSign,
  Eye,
  Percent,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React from "react";

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  target?: number;
  format: "percentage" | "currency" | "number" | "decimal";
  trend: "up" | "down" | "stable";
  period: string;
  description?: string;
}

export interface MLModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confidenceScore: number;
  totalPredictions: number;
  correctPredictions: number;
  falsePositives: number;
  falseNegatives: number;
  lastUpdated: string;
  modelVersion: string;
}

export interface ROIMetrics {
  totalRevenue: number;
  revenueProtected: number;
  interventionCosts: number;
  netROI: number;
  roiPercentage: number;
  appointmentsProtected: number;
  interventionSuccessRate: number;
  averageAppointmentValue: number;
  costPerIntervention: number;
  monthlyTarget: number;
}

export interface NoShowMetrics {
  currentNoShowRate: number;
  previousNoShowRate: number;
  reductionPercentage: number;
  targetReduction: number;
  totalAppointments: number;
  noShowAppointments: number;
  interventionsExecuted: number;
  preventedNoShows: number;
  byRiskLevel: {
    low: { total: number; noShows: number; rate: number; };
    medium: { total: number; noShows: number; rate: number; };
    high: { total: number; noShows: number; rate: number; };
    critical: { total: number; noShows: number; rate: number; };
  };
}

export interface PerformanceMetricsProps {
  mlMetrics: MLModelMetrics;
  roiMetrics: ROIMetrics;
  noShowMetrics: NoShowMetrics;
  customMetrics: PerformanceMetric[];
  timeRange: "today" | "week" | "month" | "quarter" | "year";
  onTimeRangeChange: (range: string) => void;
  className?: string;
  isLoading?: boolean;
}

const formatValue = (value: number, format: PerformanceMetric["format"]) => {
  switch (format) {
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "currency":
      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    case "decimal":
      return value.toFixed(2);
    case "number":
    default:
      return value.toLocaleString("pt-BR");
  }
};

const getTrendIcon = (trend: "up" | "down" | "stable") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    case "stable":
    default:
      return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

export function PerformanceMetrics({
  mlMetrics,
  roiMetrics,
  noShowMetrics,
  customMetrics,
  timeRange,
  onTimeRangeChange,
  className,
  isLoading = false,
}: PerformanceMetricsProps) {
  // Calcular métricas derivadas
  const mlAccuracyTrend = mlMetrics.accuracy >= 85
    ? "up"
    : mlMetrics.accuracy >= 70
    ? "stable"
    : "down";
  const roiTrend = roiMetrics.roiPercentage > 0 ? "up" : "down";
  const noShowTrend = noShowMetrics.reductionPercentage > 0 ? "up" : "down";

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header com filtro de período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Métricas de Performance</h2>
          <p className="text-muted-foreground">
            Acompanhamento em tempo real do sistema anti-no-show
          </p>
        </div>

        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* No-Show Rate Reduction */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Redução No-Show
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-green-600">
                    {noShowMetrics.reductionPercentage.toFixed(1)}%
                  </span>
                  {getTrendIcon(noShowTrend)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Meta: {noShowMetrics.targetReduction}%
                  </span>
                  <Progress
                    value={Math.min(
                      (noShowMetrics.reductionPercentage / noShowMetrics.targetReduction) * 100,
                      100,
                    )}
                    className="w-16 h-1"
                  />
                </div>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* ML Model Accuracy */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Precisão do Modelo
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {mlMetrics.accuracy.toFixed(1)}%
                  </span>
                  {getTrendIcon(mlAccuracyTrend)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {mlMetrics.totalPredictions.toLocaleString()} predições
                </div>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ROI Total
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      roiMetrics.netROI >= 0 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {formatValue(roiMetrics.netROI, "currency")}
                  </span>
                  {getTrendIcon(roiTrend)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {roiMetrics.roiPercentage.toFixed(1)}% retorno
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Taxa de No-Show Atual */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Taxa No-Show Atual
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-orange-600">
                    {noShowMetrics.currentNoShowRate.toFixed(1)}%
                  </span>
                  <ArrowDown className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {noShowMetrics.noShowAppointments} de {noShowMetrics.totalAppointments}
                </div>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com métricas detalhadas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="ml-model">Modelo ML</TabsTrigger>
          <TabsTrigger value="roi-analysis">Análise ROI</TabsTrigger>
          <TabsTrigger value="risk-breakdown">Por Risco</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progresso das metas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progresso das Metas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Redução No-Show (Meta: 25%)</span>
                    <span>{noShowMetrics.reductionPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min((noShowMetrics.reductionPercentage / 25) * 100, 100)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Precisão ML (Meta: 90%)</span>
                    <span>{mlMetrics.accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={(mlMetrics.accuracy / 90) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ROI Mensal (Meta: R$ {roiMetrics.monthlyTarget.toLocaleString()})</span>
                    <span>{formatValue(roiMetrics.netROI, "currency")}</span>
                  </div>
                  <Progress
                    value={Math.min((roiMetrics.netROI / roiMetrics.monthlyTarget) * 100, 100)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Métricas customizadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Métricas Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customMetrics.slice(0, 5).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{metric.name}</div>
                        {metric.description && (
                          <div className="text-xs text-muted-foreground">
                            {metric.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">
                            {formatValue(metric.value, metric.format)}
                          </span>
                          {getTrendIcon(metric.trend)}
                        </div>
                        {metric.target && (
                          <div className="text-xs text-muted-foreground">
                            Meta: {formatValue(metric.target, metric.format)}
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

        {/* ML Model Tab */}
        <TabsContent value="ml-model" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas do modelo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Performance do Modelo ML
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-blue-600">
                      {mlMetrics.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Acurácia</div>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-600">
                      {mlMetrics.precision.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Precisão</div>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-orange-600">
                      {mlMetrics.recall.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Recall</div>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-purple-600">
                      {mlMetrics.f1Score.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">F1-Score</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confiança Média</span>
                    <span>{mlMetrics.confidenceScore.toFixed(1)}%</span>
                  </div>
                  <Progress value={mlMetrics.confidenceScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Matriz de confusão simulada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Análise de Erros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-xl font-bold text-green-700">
                      {mlMetrics.correctPredictions.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">Predições Corretas</div>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-xl font-bold text-red-700">
                      {mlMetrics.falsePositives.toLocaleString()}
                    </div>
                    <div className="text-sm text-red-600">Falsos Positivos</div>
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="text-xl font-bold text-orange-700">
                    {mlMetrics.falseNegatives.toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-600">Falsos Negativos</div>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  Versão do modelo: {mlMetrics.modelVersion}
                  <br />
                  Última atualização: {new Date(mlMetrics.lastUpdated).toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ROI Analysis Tab */}
        <TabsContent value="roi-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análise financeira */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Análise Financeira
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Receita Total</span>
                    <span className="font-semibold">
                      {formatValue(roiMetrics.totalRevenue, "currency")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Receita Protegida</span>
                    <span className="font-semibold text-green-600">
                      {formatValue(roiMetrics.revenueProtected, "currency")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Custo Intervenções</span>
                    <span className="font-semibold text-red-600">
                      -{formatValue(roiMetrics.interventionCosts, "currency")}
                    </span>
                  </div>

                  <hr />

                  <div className="flex justify-between">
                    <span className="font-medium">ROI Líquido</span>
                    <span
                      className={cn(
                        "font-bold text-lg",
                        roiMetrics.netROI >= 0 ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {formatValue(roiMetrics.netROI, "currency")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Percentual de ROI</span>
                    <span
                      className={cn(
                        "font-semibold",
                        roiMetrics.roiPercentage >= 0 ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {roiMetrics.roiPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas operacionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas Operacionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Consultas Protegidas</span>
                    <span className="font-semibold">
                      {roiMetrics.appointmentsProtected.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de Sucesso</span>
                    <span className="font-semibold text-green-600">
                      {roiMetrics.interventionSuccessRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Valor Médio Consulta</span>
                    <span className="font-semibold">
                      {formatValue(roiMetrics.averageAppointmentValue, "currency")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Custo por Intervenção</span>
                    <span className="font-semibold">
                      {formatValue(roiMetrics.costPerIntervention, "currency")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta Mensal</span>
                    <span>{formatValue(roiMetrics.monthlyTarget, "currency")}</span>
                  </div>
                  <Progress
                    value={Math.min((roiMetrics.netROI / roiMetrics.monthlyTarget) * 100, 100)}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Breakdown Tab */}
        <TabsContent value="risk-breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Performance por Nível de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(noShowMetrics.byRiskLevel).map(([level, data]) => {
                  const levelConfig = {
                    low: { label: "Baixo", color: "bg-green-100 text-green-800 border-green-200" },
                    medium: {
                      label: "Médio",
                      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    },
                    high: {
                      label: "Alto",
                      color: "bg-orange-100 text-orange-800 border-orange-200",
                    },
                    critical: { label: "Crítico", color: "bg-red-100 text-red-800 border-red-200" },
                  }[level as keyof typeof noShowMetrics.byRiskLevel];

                  return (
                    <div key={level} className="p-4 rounded-lg border">
                      <div className="text-center space-y-3">
                        <Badge
                          variant="outline"
                          className={cn("px-3 py-1", levelConfig?.color)}
                        >
                          Risco {levelConfig?.label}
                        </Badge>

                        <div>
                          <div className="text-2xl font-bold">
                            {data.rate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Taxa de No-Show
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {data.noShows} de {data.total} consultas
                        </div>

                        <Progress value={data.rate} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceMetrics;
