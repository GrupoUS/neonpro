"use client";

import type { useState, useEffect } from "react";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { CalendarIcon, Download, RefreshCw } from "lucide-react";
import type { KPICard, InteractiveLineChart } from "@/components/charts";
import type { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import type { ptBR } from "date-fns/locale";

interface KPIData {
  metric_name: string;
  metric_value: number;
  metric_formatted: string;
  previous_value: number;
  percentage_change: number;
  trend: "up" | "down" | "stable";
}

interface TrendData {
  period_date: string;
  period_label: string;
  revenue?: number;
  transactions_count?: number;
  avg_transaction_value?: number;
  total_appointments?: number;
  completed_appointments?: number;
  canceled_appointments?: number;
  completion_rate?: number;
}

export function AnalyticsDashboard() {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<TrendData[]>([]);
  const [appointmentTrends, setAppointmentTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subDays(new Date(), 30)), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch KPIs
      const kpiResponse = await fetch(
        `/api/analytics/dashboard?start_date=${dateRange.start}&end_date=${dateRange.end}`,
      );
      if (kpiResponse.ok) {
        const kpiData = await kpiResponse.json();
        setKpis(kpiData.kpis || []);
      }

      // Fetch revenue trends
      const revenueResponse = await fetch(
        `/api/analytics/trends?type=revenue&period=monthly&start_date=${dateRange.start}&end_date=${dateRange.end}`,
      );
      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueTrends(revenueData.trends || []);
      }

      // Fetch appointment trends
      const appointmentResponse = await fetch(
        `/api/analytics/trends?type=appointments&period=monthly&start_date=${dateRange.start}&end_date=${dateRange.end}`,
      );
      if (appointmentResponse.ok) {
        const appointmentData = await appointmentResponse.json();
        setAppointmentTrends(appointmentData.trends || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const revenueChartData = revenueTrends.map((trend) => ({
    name: trend.period_label,
    Receita: trend.revenue || 0,
    Transações: trend.transactions_count || 0,
  }));

  const appointmentChartData = appointmentTrends.map((trend) => ({
    name: trend.period_label,
    "Total de Agendamentos": trend.total_appointments || 0,
    "Agendamentos Concluídos": trend.completed_appointments || 0,
    "Taxa de Conclusão": trend.completion_rate || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Analytics</h1>
          <p className="text-muted-foreground">Visão geral das métricas e performance da clínica</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KPICard
              key={kpi.metric_name}
              title={kpi.metric_name}
              value={kpi.metric_value}
              formattedValue={kpi.metric_formatted}
              previousValue={kpi.previous_value}
              percentageChange={kpi.percentage_change}
              trend={kpi.trend}
              description="em relação ao período anterior"
            />
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {revenueChartData.length > 0 && (
          <InteractiveLineChart
            title="Tendência de Receita"
            data={revenueChartData}
            lines={[
              {
                dataKey: "Receita",
                name: "Receita",
                color: "#8884d8",
              },
            ]}
            height={300}
          />
        )}

        {appointmentChartData.length > 0 && (
          <InteractiveLineChart
            title="Tendência de Agendamentos"
            data={appointmentChartData}
            lines={[
              {
                dataKey: "Total de Agendamentos",
                name: "Total",
                color: "#82ca9d",
              },
              {
                dataKey: "Agendamentos Concluídos",
                name: "Concluídos",
                color: "#ffc658",
              },
            ]}
            height={300}
          />
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
