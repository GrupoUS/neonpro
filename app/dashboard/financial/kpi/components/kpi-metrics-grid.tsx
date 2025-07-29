"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKPIData } from "@/hooks/analytics/use-kpi-data";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CreditCard,
  DollarSign,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";

type DateRange = "7d" | "30d" | "90d" | "12m" | "ytd";

interface KPIMetricsGridProps {
  dateRange: DateRange;
}

interface KPIMetric {
  title: string;
  value: string;
  previousValue: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: any;
  description: string;
  target?: string;
  unit?: string;
}

export function KPIMetricsGrid({ dateRange }: KPIMetricsGridProps) {
  const { kpis, loading, error, lastUpdated } = useKPIData({ dateRange });

  const kpiMetrics = useMemo(() => {
    if (!kpis.length) return getKPIDataFallback();

    // Transform real KPI data into display format
    const metrics: KPIMetric[] = [];

    kpis.forEach((kpi) => {
      let metric: KPIMetric | null = null;

      switch (kpi.kpi_name) {
        case "Total Revenue":
          metric = {
            title: "Receita Total",
            value: `R$ ${kpi.calculated_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            previousValue: `R$ ${kpi.previous_value?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}`,
            change: kpi.variance_percent || 0,
            trend:
              (kpi.variance_percent || 0) > 0
                ? "up"
                : (kpi.variance_percent || 0) < 0
                  ? "down"
                  : "neutral",
            icon: DollarSign,
            description: "Receita total no período selecionado",
            target: "R$ 50.000",
            unit: "R$",
          };
          break;

        case "Revenue Per Patient":
          metric = {
            title: "Ticket Médio",
            value: `R$ ${kpi.calculated_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            previousValue: `R$ ${kpi.previous_value?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}`,
            change: kpi.variance_percent || 0,
            trend:
              (kpi.variance_percent || 0) > 0
                ? "up"
                : (kpi.variance_percent || 0) < 0
                  ? "down"
                  : "neutral",
            icon: CreditCard,
            description: "Valor médio por cliente no período",
            target: "R$ 300",
            unit: "R$",
          };
          break;

        case "Gross Profit Margin":
          metric = {
            title: "Margem de Lucro",
            value: `${kpi.calculated_value.toFixed(1)}%`,
            previousValue: `${kpi.previous_value?.toFixed(1) || "0.0"}%`,
            change: kpi.variance_percent || 0,
            trend:
              (kpi.variance_percent || 0) > 0
                ? "up"
                : (kpi.variance_percent || 0) < 0
                  ? "down"
                  : "neutral",
            icon: Target,
            description: "Margem de lucro bruto",
            target: "40%",
            unit: "%",
          };
          break;

        case "Net Profit Margin":
          metric = {
            title: "Lucro Líquido",
            value: `${kpi.calculated_value.toFixed(1)}%`,
            previousValue: `${kpi.previous_value?.toFixed(1) || "0.0"}%`,
            change: kpi.variance_percent || 0,
            trend:
              (kpi.variance_percent || 0) > 0
                ? "up"
                : (kpi.variance_percent || 0) < 0
                  ? "down"
                  : "neutral",
            icon: Activity,
            description: "Margem de lucro líquido",
            target: "25%",
            unit: "%",
          };
          break;
      }

      if (metric) metrics.push(metric);
    });

    // Add fallback metrics if not enough real data
    if (metrics.length < 6) {
      const fallbackMetrics = getKPIDataFallback();
      const existingTitles = metrics.map((m) => m.title);

      fallbackMetrics.forEach((fallback) => {
        if (!existingTitles.includes(fallback.title)) {
          metrics.push(fallback);
        }
      });
    }

    return metrics.slice(0, 8); // Limit to 8 metrics
  }, [kpis]);

  // Fallback data for development/testing
  function getKPIDataFallback(): KPIMetric[] {
    return [
      {
        title: "Receita Total",
        value: "R$ 45.230,00",
        previousValue: "R$ 42.150,00",
        change: 7.3,
        trend: "up",
        icon: DollarSign,
        description: "Receita total no período selecionado",
        target: "R$ 50.000",
        unit: "R$",
      },
      {
        title: "Novos Clientes",
        value: "142",
        previousValue: "128",
        change: 10.9,
        trend: "up",
        icon: Users,
        description: "Novos clientes adquiridos",
        target: "150",
        unit: "clientes",
      },
      {
        title: "Ticket Médio",
        value: "R$ 318,73",
        previousValue: "R$ 329,30",
        change: -3.2,
        trend: "down",
        icon: CreditCard,
        description: "Valor médio por cliente",
        target: "R$ 300",
        unit: "R$",
      },
      {
        title: "Margem de Lucro",
        value: "42.5%",
        previousValue: "40.8%",
        change: 4.2,
        trend: "up",
        icon: Target,
        description: "Margem de lucro bruto",
        target: "40%",
        unit: "%",
      },
      {
        title: "Taxa de Conversão",
        value: "68.5%",
        previousValue: "65.2%",
        change: 5.1,
        trend: "up",
        icon: Activity,
        description: "Taxa de conversão de consultas",
        target: "70%",
        unit: "%",
      },
      {
        title: "Agendamentos",
        value: "237",
        previousValue: "221",
        change: 7.2,
        trend: "up",
        icon: Calendar,
        description: "Total de agendamentos no período",
        target: "250",
        unit: "agendamentos",
      },
    ];
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="col-span-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados dos KPIs: {error || "Erro desconhecido"}
          <br />
          <small className="text-gray-500">
            Usando dados de exemplo para demonstração.
          </small>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {lastUpdated && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Última atualização: {new Date(lastUpdated).toLocaleString("pt-BR")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {kpiMetrics.map((metric: KPIMetric, index: number) => {
          const IconComponent = metric.icon;
          const trendColor =
            metric.trend === "up"
              ? "text-green-600"
              : metric.trend === "down"
                ? "text-red-600"
                : "text-gray-600";
          const TrendIcon =
            metric.trend === "up"
              ? TrendingUp
              : metric.trend === "down"
                ? TrendingDown
                : Activity;

          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {metric.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <Badge
                    variant={
                      metric.trend === "up"
                        ? "default"
                        : metric.trend === "down"
                          ? "destructive"
                          : "secondary"
                    }
                    className="flex items-center gap-1"
                  >
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(metric.change).toFixed(1)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Anterior: {metric.previousValue}</span>
                  {metric.target && <span>Meta: {metric.target}</span>}
                </div>

                <CardDescription className="mt-2">
                  {metric.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
