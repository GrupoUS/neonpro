"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { CashFlowChart } from "./cash-flow-chart";
import { DashboardBuilder } from "./dashboard-builder";
import { DrillDownAnalysis } from "./drill-down-analysis";
import { ExpensesChart } from "./expenses-chart";
import { KPIAlerts } from "./kpi-alerts";
import { KPIMetricsGrid } from "./kpi-metrics-grid";
import { ProfitabilityChart } from "./profitability-chart";
import { RevenueChart } from "./revenue-chart";

type DateRange = "7d" | "30d" | "90d" | "12m" | "ytd";

interface FinancialKPIDashboardProps {
  className?: string;
}

export function FinancialKPIDashboard({
  className,
}: FinancialKPIDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const getDateRangeLabel = (range: DateRange) => {
    switch (range) {
      case "7d":
        return "Últimos 7 dias";
      case "30d":
        return "Últimos 30 dias";
      case "90d":
        return "Últimos 90 dias";
      case "12m":
        return "Últimos 12 meses";
      case "ytd":
        return "Ano até agora";
      default:
        return "Últimos 30 dias";
    }
  };

  return (
    <div className={className}>
      {/* Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Período:</span>
        </div>
        <Select
          value={dateRange}
          onValueChange={(value) => setDateRange(value as DateRange)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="12m">Últimos 12 meses</SelectItem>
            <SelectItem value="ytd">Ano até agora</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Metrics Grid */}
      <KPIMetricsGrid dateRange={dateRange} />

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="profitability">Lucratividade</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="drilldown">Análise Detalhada</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart dateRange={dateRange} />
            <ProfitabilityChart dateRange={dateRange} />
          </div>
          <div className="mt-6">
            <DashboardBuilder
              onLayoutChange={(layout) =>
                console.log("Layout changed:", layout)
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueChart dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="profitability" className="mt-6">
          <ProfitabilityChart dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <CashFlowChart dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpensesChart dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="drilldown" className="mt-6">
          <div className="space-y-6">
            <DrillDownAnalysis
              kpiId="total_revenue"
              kpiName="Receita Total"
              initialValue={125000}
              unit="currency"
              onClose={() => {}}
            />
            <DrillDownAnalysis
              kpiId="gross_margin"
              kpiName="Margem Bruta"
              initialValue={72.5}
              unit="percentage"
              onClose={() => {}}
            />
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <KPIAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
