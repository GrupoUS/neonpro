"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  // Calendar, // Unused import
  Clock,
  DollarSign,
  Download,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  target?: number;
  category: "revenue" | "patients" | "efficiency" | "quality";
  trend: "up" | "down" | "stable";
  critical: boolean;
}

export interface PerformanceInsightsProps {
  userRole: "Admin" | "Professional" | "Assistant" | "Coordinator";
  timeRange: "today" | "week" | "month" | "quarter";
  onTimeRangeChange?: (range: string) => void;
  onExportData?: () => void;
  onRefreshData?: () => void;
  className?: string;
}

export function PerformanceInsights({
  userRole,
  timeRange,
  onTimeRangeChange,
  onExportData,
  onRefreshData,
  className,
}: PerformanceInsightsProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Generate realistic healthcare metrics based on user role
  const generateMetrics = useMemo((): PerformanceMetric[] => {
    const baseMetrics: PerformanceMetric[] = [
      {
        id: "daily-revenue",
        name: "Faturamento Diário",
        value: 15_750,
        previousValue: 14_200,
        unit: "R$",
        target: 18_000,
        category: "revenue",
        trend: "up",
        critical: false,
      },
      {
        id: "patients-attended",
        name: "Pacientes Atendidos",
        value: 42,
        previousValue: 38,
        unit: "pacientes",
        target: 50,
        category: "patients",
        trend: "up",
        critical: false,
      },
      {
        id: "avg-wait-time",
        name: "Tempo Médio de Espera",
        value: 18,
        previousValue: 22,
        unit: "minutos",
        target: 15,
        category: "efficiency",
        trend: "down",
        critical: true,
      },
      {
        id: "no-show-rate",
        name: "Taxa de No-Show",
        value: 12,
        previousValue: 15,
        unit: "%",
        target: 8,
        category: "efficiency",
        trend: "down",
        critical: false,
      },
      {
        id: "satisfaction-score",
        name: "Satisfação dos Pacientes",
        value: 4.7,
        previousValue: 4.5,
        unit: "/5",
        target: 4.8,
        category: "quality",
        trend: "up",
        critical: false,
      },
      {
        id: "procedure-efficiency",
        name: "Eficiência dos Procedimentos",
        value: 89,
        previousValue: 85,
        unit: "%",
        target: 95,
        category: "efficiency",
        trend: "up",
        critical: false,
      },
    ];

    // Filter metrics based on user role
    if (userRole === "Assistant") {
      return baseMetrics.filter(m => m.category !== "revenue");
    }

    if (userRole === "Professional") {
      return baseMetrics.filter(m =>
        m.category === "patients" || m.category === "quality" || m.category === "efficiency"
      );
    }

    return baseMetrics;
  }, [userRole]);

  useEffect(() => {
    setMetrics(generateMetrics);
  }, [generateMetrics, timeRange]);

  const handleRefresh = async () => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMetrics(generateMetrics);
    setLastUpdated(new Date());
    setIsLoading(false);

    onRefreshData?.();
  };

  const getMetricIcon = (category: string) => {
    const icons = {
      revenue: DollarSign,
      patients: Users,
      efficiency: Clock,
      quality: Activity,
    };
    return icons[category as keyof typeof icons] || Activity;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      revenue: "text-green-600 bg-green-50 border-green-200",
      patients: "text-blue-600 bg-blue-50 border-blue-200",
      efficiency: "text-orange-600 bg-orange-50 border-orange-200",
      quality: "text-purple-600 bg-purple-50 border-purple-200",
    };
    return colors[category as keyof typeof colors] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return TrendingUp;
    if (trend === "down") return TrendingDown;
    return Activity;
  };

  const calculateChangePercentage = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getProgressValue = (metric: PerformanceMetric): number => {
    if (!metric.target) return 0;
    return Math.min((metric.value / metric.target) * 100, 100);
  };

  const criticalMetrics = metrics.filter(m => m.critical);
  const totalMetrics = metrics.length;
  const averagePerformance = metrics.reduce((acc, m) => acc + getProgressValue(m), 0)
    / totalMetrics;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Performance Insights - {timeRange === "today"
              ? "Hoje"
              : timeRange === "week"
              ? "Esta Semana"
              : timeRange === "month"
              ? "Este Mês"
              : "Este Trimestre"}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Atualizado: {lastUpdated.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Atualizar
            </Button>

            {userRole === "Admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="p-3 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Performance Geral</p>
                <p className="text-2xl font-bold text-blue-900">
                  {Math.round(averagePerformance)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-3 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Métricas Ativas</p>
                <p className="text-2xl font-bold text-green-900">{totalMetrics}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card
            className={cn(
              "p-3",
              criticalMetrics.length > 0
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200",
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    criticalMetrics.length > 0 ? "text-red-600" : "text-yellow-600",
                  )}
                >
                  Atenção Requerida
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    criticalMetrics.length > 0 ? "text-red-900" : "text-yellow-900",
                  )}
                >
                  {criticalMetrics.length}
                </p>
              </div>
              <AlertTriangle
                className={cn(
                  "h-8 w-8",
                  criticalMetrics.length > 0 ? "text-red-600" : "text-yellow-600",
                )}
              />
            </div>
          </Card>
        </div>
      </CardHeader>

      <CardContent>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const IconComponent = getMetricIcon(metric.category);
            const TrendIcon = getTrendIcon(metric.trend);
            const changePercentage = calculateChangePercentage(metric.value, metric.previousValue);
            const progressValue = getProgressValue(metric);

            return (
              <Card
                key={metric.id}
                className={cn(
                  "p-4 transition-all hover:shadow-md",
                  metric.critical && "border-red-300 bg-red-50",
                )}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "p-2 rounded-lg border",
                          getCategoryColor(metric.category),
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{metric.name}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {metric.category}
                        </p>
                      </div>
                    </div>

                    {metric.critical && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>

                  {/* Value and Trend */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {metric.unit === "R$"
                          ? (
                            `R$ ${metric.value.toLocaleString("pt-BR")}`
                          )
                          : (
                            `${metric.value}${metric.unit}`
                          )}
                      </p>

                      {metric.target && (
                        <p className="text-xs text-gray-500">
                          Meta: {metric.unit === "R$"
                            ? `R$ ${metric.target.toLocaleString("pt-BR")}`
                            : `${metric.target}${metric.unit}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <TrendIcon
                        className={cn(
                          "h-4 w-4",
                          metric.trend === "up"
                            ? "text-green-600"
                            : metric.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          metric.trend === "up"
                            ? "text-green-600"
                            : metric.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600",
                        )}
                      >
                        {changePercentage > 0 ? "+" : ""}
                        {changePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {metric.target && (
                    <div className="space-y-1">
                      <Progress
                        value={progressValue}
                        className={cn(
                          "h-2",
                          progressValue >= 100
                            ? "bg-green-100"
                            : progressValue >= 75
                            ? "bg-yellow-100"
                            : "bg-red-100",
                        )}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progresso</span>
                        <span>{Math.round(progressValue)}% da meta</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Time Range Selector */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Período de Análise:</p>
            <div className="flex gap-1">
              {[
                { value: "today", label: "Hoje" },
                { value: "week", label: "Semana" },
                { value: "month", label: "Mês" },
                { value: "quarter", label: "Trimestre" },
              ].map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeRangeChange?.(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
