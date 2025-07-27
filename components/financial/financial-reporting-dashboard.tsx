// =====================================================================================
// Financial Reporting Dashboard - Real-time Analytics
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Settings,
  Target,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import {
  FinancialDashboardData,
  KPICalculation,
  PerformanceMetrics,
  ReportParameters,
  DASHBOARD_REFRESH_INTERVALS
} from '@/lib/types/financial-reporting';
import { FinancialAnalyticsCore } from '@/lib/financial/analytics-core';

interface FinancialReportingDashboardProps {
  clinicId: string;
  className?: string;
}

export default function FinancialReportingDashboard({ 
  clinicId, 
  className = '' 
}: FinancialReportingDashboardProps) {
  // =====================================================================================
  // STATE MANAGEMENT
  // =====================================================================================
  
  const [dashboardData, setDashboardData] = useState<FinancialDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [analyticsCore] = useState(() => new FinancialAnalyticsCore());

  // =====================================================================================
  // DATA FETCHING AND REFRESH LOGIC
  // =====================================================================================

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);

      const data = await analyticsCore.generateDashboardData(clinicId);
      setDashboardData(data);
      setLastUpdated(new Date());

      if (!showLoading) {
        toast.success('Dashboard atualizado com sucesso');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clinicId, analyticsCore]);

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData(false);
      }, DASHBOARD_REFRESH_INTERVALS.FINANCIAL_OVERVIEW);

      return () => clearInterval(interval);
    }
  }, [fetchDashboardData, autoRefresh]);

  // =====================================================================================
  // UTILITY FUNCTIONS
  // =====================================================================================

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', color: string) => {
    if (trend === 'stable') return 'text-muted-foreground';
    return color === 'green' ? 'text-green-600' : 'text-red-600';
  };

  // =====================================================================================
  // COMPONENT RENDERING
  // =====================================================================================

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
            <p className="text-muted-foreground">
              Análise avançada e insights em tempo real
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`space-y-8 ${className}`}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Dados</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados do dashboard. Tente novamente.
          </AlertDescription>
        </Alert>
        <Button onClick={() => fetchDashboardData()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Análise avançada e insights em tempo real
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Atualizado em {lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês Atual</SelectItem>
              <SelectItem value="last_month">Mês Anterior</SelectItem>
              <SelectItem value="current_quarter">Trimestre Atual</SelectItem>
              <SelectItem value="current_year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`mr-2 h-4 w-4 ${autoRefresh ? 'text-green-600' : 'text-muted-foreground'}`} />
            Auto
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Financial Alerts */}
      {dashboardData.alerts && dashboardData.alerts.length > 0 && (
        <div className="space-y-2">
          {dashboardData.alerts.map((alert, index) => (
            <Alert 
              key={index} 
              variant={alert.type === 'danger' ? 'destructive' : 'default'}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.total_revenue.value)}
            </div>
            <div className={`flex items-center text-xs ${getTrendColor(
              dashboardData.summary_cards.total_revenue.trend,
              dashboardData.summary_cards.total_revenue.color
            )}`}>
              {getTrendIcon(dashboardData.summary_cards.total_revenue.trend)}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.summary_cards.total_revenue.change_from_previous))} vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.total_expenses.value)}
            </div>
            <div className={`flex items-center text-xs ${getTrendColor(
              dashboardData.summary_cards.total_expenses.trend,
              dashboardData.summary_cards.total_expenses.color
            )}`}>
              {getTrendIcon(dashboardData.summary_cards.total_expenses.trend)}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.summary_cards.total_expenses.change_from_previous))} vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.net_profit.value)}
            </div>
            <div className={`flex items-center text-xs ${getTrendColor(
              dashboardData.summary_cards.net_profit.trend,
              dashboardData.summary_cards.net_profit.color
            )}`}>
              {getTrendIcon(dashboardData.summary_cards.net_profit.trend)}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.summary_cards.net_profit.change_from_previous))} vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.cash_flow.value)}
            </div>
            <div className={`flex items-center text-xs ${getTrendColor(
              dashboardData.summary_cards.cash_flow.trend,
              dashboardData.summary_cards.cash_flow.color
            )}`}>
              {getTrendIcon(dashboardData.summary_cards.cash_flow.trend)}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.summary_cards.cash_flow.change_from_previous))} vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Patient Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(dashboardData.summary_cards.patient_count.value)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1" />
              <span>Estável este mês</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Transaction Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary_cards.avg_transaction_value.value)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1" />
              <span>Por consulta</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Performance (KPIs)</CardTitle>
          <CardDescription>
            Principais métricas financeiras e operacionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profitability KPIs */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Rentabilidade</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Margem Bruta</span>
                  <span className="text-xs font-medium">
                    {formatPercentage(dashboardData.charts_data.kpi_dashboard.gross_margin)}
                  </span>
                </div>
                <Progress value={dashboardData.charts_data.kpi_dashboard.gross_margin} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Margem Operacional</span>
                  <span className="text-xs font-medium">
                    {formatPercentage(dashboardData.charts_data.kpi_dashboard.operating_margin)}
                  </span>
                </div>
                <Progress value={Math.max(0, dashboardData.charts_data.kpi_dashboard.operating_margin)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Margem Líquida</span>
                  <span className="text-xs font-medium">
                    {formatPercentage(dashboardData.charts_data.kpi_dashboard.net_margin)}
                  </span>
                </div>
                <Progress value={Math.max(0, dashboardData.charts_data.kpi_dashboard.net_margin)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Liquidity and Leverage KPIs */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Liquidez e Alavancagem</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Liquidez Corrente</span>
                  <span className="text-xs font-medium">
                    {dashboardData.charts_data.kpi_dashboard.current_ratio.toFixed(2)}
                  </span>
                </div>
                <Progress value={Math.min(100, dashboardData.charts_data.kpi_dashboard.current_ratio * 50)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Endividamento</span>
                  <span className="text-xs font-medium">
                    {formatPercentage(dashboardData.charts_data.kpi_dashboard.debt_ratio * 100)}
                  </span>
                </div>
                <Progress value={dashboardData.charts_data.kpi_dashboard.debt_ratio * 100} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {dashboardData.recommendations && dashboardData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
            <CardDescription>
              Sugestões baseadas em análise financeira avançada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{rec.title}</h4>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
                <p className="text-xs font-medium text-green-600">{rec.expected_impact}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}