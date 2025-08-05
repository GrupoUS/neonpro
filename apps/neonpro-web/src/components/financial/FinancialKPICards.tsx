"use client";

import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  PieChart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type React from "react";
import type { Badge } from "@/components/ui/badge";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { Skeleton } from "@/components/ui/skeleton";
import type { FinancialKPIs } from "@/lib/financial";

interface FinancialKPICardsProps {
  kpis: FinancialKPIs;
  timeframe: "day" | "week" | "month" | "quarter" | "year";
  loading?: boolean;
  className?: string;
}

interface KPICardData {
  title: string;
  value: string | number;
  change?: number;
  target?: number;
  icon: React.ReactNode;
  description: string;
  trend: "up" | "down" | "neutral";
  color: "green" | "red" | "blue" | "yellow" | "purple" | "gray";
  format: "currency" | "percentage" | "number" | "days";
}

export function FinancialKPICards({
  kpis,
  timeframe,
  loading = false,
  className = "",
}: FinancialKPICardsProps) {
  // Format value based on type
  const formatValue = (value: number, format: KPICardData["format"]): string => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "days":
        return `${value.toFixed(0)} dias`;
      case "number":
      default:
        return new Intl.NumberFormat("pt-BR").format(value);
    }
  };

  // Get trend direction
  const getTrend = (current: number, previous: number): "up" | "down" | "neutral" => {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "neutral";
  };

  // Calculate change percentage
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get timeframe label
  const getTimeframeLabel = (): string => {
    switch (timeframe) {
      case "day":
        return "hoje";
      case "week":
        return "esta semana";
      case "month":
        return "este mês";
      case "quarter":
        return "este trimestre";
      case "year":
        return "este ano";
      default:
        return timeframe;
    }
  };

  // Prepare KPI cards data
  const kpiCards: KPICardData[] = [
    {
      title: "Receita Total",
      value: kpis.total_revenue,
      change: calculateChange(kpis.total_revenue, kpis.previous_revenue || 0),
      target: kpis.revenue_target,
      icon: <DollarSign className="h-4 w-4" />,
      description: `Receita total ${getTimeframeLabel()}`,
      trend: getTrend(kpis.total_revenue, kpis.previous_revenue || 0),
      color: "green",
      format: "currency",
    },
    {
      title: "Margem de Lucro",
      value: kpis.profit_margin,
      change: calculateChange(kpis.profit_margin, kpis.previous_profit_margin || 0),
      target: kpis.profit_target,
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Margem de lucro líquida",
      trend: getTrend(kpis.profit_margin, kpis.previous_profit_margin || 0),
      color: "blue",
      format: "percentage",
    },
    {
      title: "Pacientes Ativos",
      value: kpis.active_patients,
      change: calculateChange(kpis.active_patients, kpis.previous_active_patients || 0),
      icon: <Users className="h-4 w-4" />,
      description: `Pacientes ativos ${getTimeframeLabel()}`,
      trend: getTrend(kpis.active_patients, kpis.previous_active_patients || 0),
      color: "purple",
      format: "number",
    },
    {
      title: "Taxa de Ocupação",
      value: kpis.appointment_utilization,
      change: calculateChange(kpis.appointment_utilization, kpis.previous_utilization || 0),
      target: 85, // Target 85% utilization
      icon: <Calendar className="h-4 w-4" />,
      description: "Utilização de agenda",
      trend: getTrend(kpis.appointment_utilization, kpis.previous_utilization || 0),
      color: "yellow",
      format: "percentage",
    },
    {
      title: "Fluxo de Caixa",
      value: kpis.cash_flow,
      change: calculateChange(kpis.cash_flow, kpis.previous_cash_flow || 0),
      icon: <Activity className="h-4 w-4" />,
      description: `Fluxo de caixa ${getTimeframeLabel()}`,
      trend: getTrend(kpis.cash_flow, kpis.previous_cash_flow || 0),
      color: kpis.cash_flow >= 0 ? "green" : "red",
      format: "currency",
    },
    {
      title: "Ticket Médio",
      value: kpis.average_treatment_value,
      change: calculateChange(kpis.average_treatment_value, kpis.previous_avg_treatment || 0),
      icon: <CreditCard className="h-4 w-4" />,
      description: "Valor médio por tratamento",
      trend: getTrend(kpis.average_treatment_value, kpis.previous_avg_treatment || 0),
      color: "blue",
      format: "currency",
    },
    {
      title: "Satisfação do Paciente",
      value: kpis.patient_satisfaction,
      change: calculateChange(kpis.patient_satisfaction, kpis.previous_satisfaction || 0),
      target: 4.5, // Target 4.5/5 satisfaction
      icon: <Target className="h-4 w-4" />,
      description: "Avaliação média (1-5)",
      trend: getTrend(kpis.patient_satisfaction, kpis.previous_satisfaction || 0),
      color:
        kpis.patient_satisfaction >= 4.0
          ? "green"
          : kpis.patient_satisfaction >= 3.0
            ? "yellow"
            : "red",
      format: "number",
    },
    {
      title: "Tempo Médio de Espera",
      value: kpis.average_wait_time,
      change: calculateChange(kpis.average_wait_time, kpis.previous_wait_time || 0),
      target: 15, // Target 15 minutes max
      icon: <Clock className="h-4 w-4" />,
      description: "Tempo médio de espera",
      trend: getTrend(kpis.previous_wait_time || 0, kpis.average_wait_time), // Inverted for wait time
      color:
        kpis.average_wait_time <= 15 ? "green" : kpis.average_wait_time <= 30 ? "yellow" : "red",
      format: "number",
    },
  ];

  // Render loading state
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get color classes
  const getColorClasses = (color: KPICardData["color"]) => {
    switch (color) {
      case "green":
        return {
          icon: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
        };
      case "red":
        return {
          icon: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
        };
      case "blue":
        return {
          icon: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
        };
      case "yellow":
        return {
          icon: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
        };
      case "purple":
        return {
          icon: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-200",
        };
      default:
        return {
          icon: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
        };
    }
  };

  // Get trend icon and color
  const getTrendDisplay = (trend: KPICardData["trend"], change: number) => {
    if (trend === "up") {
      return {
        icon: <TrendingUp className="h-3 w-3" />,
        color: "text-green-600",
        text: `+${Math.abs(change).toFixed(1)}%`,
      };
    } else if (trend === "down") {
      return {
        icon: <TrendingDown className="h-3 w-3" />,
        color: "text-red-600",
        text: `-${Math.abs(change).toFixed(1)}%`,
      };
    } else {
      return {
        icon: <Activity className="h-3 w-3" />,
        color: "text-gray-600",
        text: "0.0%",
      };
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {kpiCards.map((kpi, index) => {
        const colorClasses = getColorClasses(kpi.color);
        const trendDisplay = getTrendDisplay(kpi.trend, kpi.change || 0);
        const progressValue = kpi.target
          ? Math.min((Number(kpi.value) / kpi.target) * 100, 100)
          : undefined;

        return (
          <Card
            key={index}
            className={`transition-all duration-200 hover:shadow-md ${colorClasses.border}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${colorClasses.bg}`}>
                <div className={colorClasses.icon}>{kpi.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Main Value */}
                <div className="text-2xl font-bold">
                  {formatValue(Number(kpi.value), kpi.format)}
                </div>

                {/* Change Indicator */}
                {kpi.change !== undefined && (
                  <div className={`flex items-center gap-1 text-xs ${trendDisplay.color}`}>
                    {trendDisplay.icon}
                    <span>{trendDisplay.text}</span>
                    <span className="text-muted-foreground ml-1">vs período anterior</span>
                  </div>
                )}

                {/* Progress Bar for Targets */}
                {kpi.target && progressValue !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Meta</span>
                      <span className="font-medium">{formatValue(kpi.target, kpi.format)}</span>
                    </div>
                    <Progress value={progressValue} className="h-1.5" />
                    <div className="text-xs text-muted-foreground">
                      {progressValue.toFixed(0)}% da meta
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-muted-foreground">{kpi.description}</p>

                {/* Status Badge */}
                {kpi.target && (
                  <div className="flex justify-end">
                    {Number(kpi.value) >= kpi.target ? (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Meta atingida
                      </Badge>
                    ) : Number(kpi.value) >= kpi.target * 0.8 ? (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Próximo da meta
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Abaixo da meta
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default FinancialKPICards;
