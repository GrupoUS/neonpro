"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
import {
  // Select,
  // SelectContent,
  // SelectItem,
  // SelectTrigger,
  // SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { cn } from "@/lib/utils";
import type { ExportOptions, PerformanceKPI } from "@/types/performance-monitoring";
import { KPI_LABELS_PT } from "@/types/performance-monitoring";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  BarChart3,
  Clock,
  DollarSign,
  Download,
  LineChart,
  PieChart,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface PerformanceDashboardProps {
  clinicId?: string;
  departmentIds?: string[];
  staffMemberId?: string;
  compactMode?: boolean;
}

/**
 * Performance Monitoring Dashboard - Real-time KPI tracking and ROI visualization
 * Brazilian healthcare compliance with LGPD audit trails
 */
export function PerformanceDashboard({
  clinicId,
  departmentIds = [],
  staffMemberId: _staffMemberId,
  compactMode: _compactMode = false,
}: PerformanceDashboardProps) {
  const {
    metrics,
    kpis,
    staffReports,
    roiCalculation,
    isLoading,
    lastUpdated,
    filters,
    refreshData,
    exportReport,
  } = usePerformanceMonitoring({
    clinicId,
    departmentIds,
    realTimeUpdates: true,
    autoRefresh: true,
    refreshInterval: 300_000, // 5 minutes
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    setIsExporting(true);
    try {
      const exportOptions: ExportOptions = {
        format,
        dateRange: filters.dateRange,
        includedSections: ["kpis", "metrics", "staff", "roi"],
        title: `Relatório de Performance - ${new Date().toLocaleDateString("pt-BR")}`,
        includeCharts: true,
        includeRawData: format === "excel",
      };

      await exportReport(exportOptions);
    } catch (err) {
      console.error("Error exporting report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const getKPIIcon = (category: string) => {
    switch (category) {
      case "prediction":
        return <Target className="h-4 w-4" />;
      case "intervention":
        return <Activity className="h-4 w-4" />;
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "operational":
        return <Clock className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatKPIValue = (kpi: PerformanceKPI) => {
    switch (kpi.unit) {
      case "percentage":
        return `${kpi.value.toFixed(1)}%`;
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(kpi.value);
      case "count":
        return kpi.value.toLocaleString("pt-BR");
      case "time":
        return `${Math.round(kpi.value)}min`;
      case "ratio":
        return `${kpi.value.toFixed(2)}:1`;
      default:
        return kpi.value.toString();
    }
  };

  const getTrendIcon = (kpi: PerformanceKPI) => {
    const isPositive = kpi.isGoodTrend === (kpi.trend === "up");

    if (kpi.trend === "stable") {
      return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }

    return kpi.trend === "up"
      ? (
        <TrendingUp
          className={cn(
            "h-4 w-4",
            isPositive ? "text-green-500" : "text-red-500",
          )}
        />
      )
      : (
        <TrendingDown
          className={cn(
            "h-4 w-4",
            isPositive ? "text-green-500" : "text-red-500",
          )}
        />
      );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento de Performance</h1>
          <p className="text-muted-foreground">
            KPIs em tempo real e análise de ROI anti-no-show
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            Atualizar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Formato do Relatório</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                PDF - Relatório Executivo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                Excel - Dados Detalhados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                CSV - Dados Brutos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Atualizado {formatDistanceToNow(lastUpdated, {
                addSuffix: true,
                locale: ptBR,
              })}
            </Badge>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.slice(0, 8).map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {KPI_LABELS_PT[kpi.name as keyof typeof KPI_LABELS_PT]
                  || kpi.displayName}
              </CardTitle>
              <div
                className={cn(
                  "p-1 rounded-full",
                  kpi.category === "prediction"
                    ? "bg-blue-100"
                    : kpi.category === "intervention"
                    ? "bg-green-100"
                    : kpi.category === "financial"
                    ? "bg-yellow-100"
                    : "bg-purple-100",
                )}
              >
                {getKPIIcon(kpi.category)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatKPIValue(kpi)}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getTrendIcon(kpi)}
                <span>
                  {Math.abs(kpi.trendPercentage).toFixed(1)}% em relação ao período anterior
                </span>
              </div>
              {kpi.target && (
                <div className="mt-2 text-xs">
                  Meta: {formatKPIValue({ ...kpi, value: kpi.target })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="staff">Equipe</TabsTrigger>
          <TabsTrigger value="roi">ROI</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* ROI Quick Summary */}
          {roiCalculation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(roiCalculation.totalReturns)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Retorno Total
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(roiCalculation.totalInvestment)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Investimento
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {roiCalculation.roi.toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">ROI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {roiCalculation.paybackPeriod.toFixed(1)} meses
                    </p>
                    <p className="text-sm text-muted-foreground">Payback</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de No-Show</CardTitle>
                <CardDescription>Evolução da taxa de faltas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-green-600">
                    {metrics.length > 0
                      ? metrics[0].noShowRate.toFixed(1)
                      : "0.0"}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {metrics.length > 0
                      && metrics[0].noShowRateImprovement > 0 && (
                      <span className="text-green-600">
                        ↓ {metrics[0].noShowRateImprovement.toFixed(1)}% melhoria
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficácia das Intervenções</CardTitle>
                <CardDescription>
                  Taxa de sucesso das ações preventivas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-blue-600">
                    {metrics.length > 0
                      ? metrics[0].interventionSuccessRate.toFixed(1)
                      : "0.0"}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {metrics.length > 0 && (
                      <span>
                        {metrics[0].interventionsSuccessful} de {metrics[0].interventionsAttempted}
                        {" "}
                        intervenções
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance da Equipe</CardTitle>
              <CardDescription>
                Indicadores individuais de performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffReports.slice(0, 10).map((report) => (
                  <div
                    key={report.staffId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-semibold">{report.staffName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.department} - {report.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">
                          {report.interventionSuccessRate.toFixed(0)}%
                        </p>
                        <p className="text-muted-foreground">Sucesso</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">
                          {Math.round(report.avgResponseTime)}min
                        </p>
                        <p className="text-muted-foreground">Resposta</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">
                          {report.appointmentsProtected}
                        </p>
                        <p className="text-muted-foreground">Protegidas</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">
                          {report.performanceScore}
                        </p>
                        <p className="text-muted-foreground">Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          {roiCalculation && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Investimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Custos do Sistema:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(roiCalculation.systemCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custos de Pessoal:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(roiCalculation.staffCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custos de Intervenção:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(roiCalculation.interventionCosts)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Investimento Total:</span>
                      <span className="text-red-600">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(roiCalculation.totalInvestment)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retorno do Investimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Receita Protegida:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(roiCalculation.revenueProtected)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ganhos de Eficiência:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(roiCalculation.efficiencyGains)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor de Reputação:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(roiCalculation.reputationValue)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Retorno Total:</span>
                      <span className="text-green-600">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(roiCalculation.totalReturns)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-700">
                        {roiCalculation.roi.toFixed(0)}%
                      </p>
                      <p className="text-sm text-green-600">
                        Retorno sobre Investimento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>
                Exporte relatórios detalhados para análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col"
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting}
                >
                  <BarChart3 className="h-8 w-8 mb-2" />
                  <span>Relatório Executivo PDF</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col"
                  onClick={() => handleExport("excel")}
                  disabled={isExporting}
                >
                  <LineChart className="h-8 w-8 mb-2" />
                  <span>Planilha Excel Detalhada</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col"
                  onClick={() => handleExport("csv")}
                  disabled={isExporting}
                >
                  <PieChart className="h-8 w-8 mb-2" />
                  <span>Dados CSV Brutos</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
