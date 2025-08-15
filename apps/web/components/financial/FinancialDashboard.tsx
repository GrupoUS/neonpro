/**
 * Financial Dashboard - Main Financial Dashboard Interface
 * NeonPro Healthcare System - Story 4.3 Architecture Alignment
 * 
 * Comprehensive financial dashboard with real-time KPIs, treatment profitability,
 * revenue analytics, and interactive data visualization for aesthetic clinics.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

// =================== TYPES ===================

interface FinancialKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  period: string;
  category: 'revenue' | 'costs' | 'profitability' | 'efficiency';
  format: 'currency' | 'percentage' | 'number';
  description: string;
}

interface TreatmentProfitability {
  treatmentType: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  profitMargin: number;
  roi: number;
  treatmentCount: number;
  averageRevenuePerTreatment: number;
  averageCostPerTreatment: number;
  recommendations: string[];
  trend: 'improving' | 'declining' | 'stable';
}

interface RevenueAnalytics {
  period: string;
  totalRevenue: number;
  revenueBySource: Record<string, number>;
  revenueByTreatment: Record<string, number>;
  growthRate: number;
  forecast: Array<{
    period: string;
    predicted: number;
    confidence: { lower: number; upper: number };
  }>;
}

interface DashboardData {
  kpis: FinancialKPI[];
  treatmentProfitability: TreatmentProfitability[];
  revenueAnalytics: RevenueAnalytics;
  lastUpdated: Date;
  isLoading: boolean;
}

// =================== HOOKS ===================

const useDashboardData = (dateRange: { start: Date; end: Date }) => {
  const [data, setData] = useState<DashboardData>({
    kpis: [],
    treatmentProfitability: [],
    revenueAnalytics: {
      period: 'monthly',
      totalRevenue: 0,
      revenueBySource: {},
      revenueByTreatment: {},
      growthRate: 0,
      forecast: [],
    },
    lastUpdated: new Date(),
    isLoading: true,
  });

  const fetchDashboardData = async () => {
    setData(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Fetch financial analytics data
      const response = await fetch('/api/financial/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          includeForecasting: true,
          includeProfitability: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const analyticsData = await response.json();
      
      setData({
        kpis: analyticsData.kpis || [],
        treatmentProfitability: analyticsData.treatmentProfitability || [],
        revenueAnalytics: analyticsData.revenueAnalytics || data.revenueAnalytics,
        lastUpdated: new Date(),
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  return { data, refreshData: fetchDashboardData };
};

// =================== COMPONENTS ===================

const KPICard: React.FC<{ kpi: FinancialKPI }> = ({ kpi }) => {
  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgressColor = (value: number, target: number): string => {
    const percentage = target > 0 ? (value / target) * 100 : 0;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressValue = kpi.target > 0 ? Math.min((kpi.value / kpi.target) * 100, 100) : 0;

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {kpi.name}
        </CardTitle>
        {getTrendIcon(kpi.trend)}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(kpi.value, kpi.format)}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>
            {kpi.changePercentage > 0 ? '+' : ''}{kpi.changePercentage.toFixed(1)}% vs período anterior
          </span>
          <Badge variant={kpi.trend === 'up' ? 'default' : kpi.trend === 'down' ? 'destructive' : 'secondary'}>
            {kpi.trend === 'up' ? 'Crescimento' : kpi.trend === 'down' ? 'Queda' : 'Estável'}
          </Badge>
        </div>
        
        {kpi.target > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso da Meta</span>
              <span>{formatValue(kpi.target, kpi.format)}</span>
            </div>
            <Progress 
              value={progressValue} 
              className={`h-2 ${getProgressColor(kpi.value, kpi.target)}`}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {progressValue.toFixed(0)}% da meta alcançada
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TreatmentProfitabilityCard: React.FC<{ treatment: TreatmentProfitability }> = ({ treatment }) => {
  const profitabilityColor = treatment.profitMargin >= 0.3 ? 'text-green-600' : 
                            treatment.profitMargin >= 0.15 ? 'text-yellow-600' : 'text-red-600';

  const roiColor = treatment.roi >= 0.25 ? 'text-green-600' : 
                   treatment.roi >= 0.15 ? 'text-yellow-600' : 'text-red-600';

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{treatment.treatmentType}</span>
          {getTrendIcon(treatment.trend)}
        </CardTitle>
        <CardDescription>
          {treatment.treatmentCount} procedimentos realizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(treatment.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Custos Totais</p>
            <p className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(treatment.totalCosts)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Margem de Lucro</p>
            <p className={`text-xl font-semibold ${profitabilityColor}`}>
              {(treatment.profitMargin * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ROI</p>
            <p className={`text-xl font-semibold ${roiColor}`}>
              {(treatment.roi * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Ticket Médio</p>
          <div className="text-lg">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(treatment.averageRevenuePerTreatment)}
          </div>
        </div>

        {treatment.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Recomendações
            </p>
            <ul className="space-y-1">
              {treatment.recommendations.slice(0, 2).map((rec, index) => (
                <li key={index} className="text-xs text-muted-foreground">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RevenueChart: React.FC<{ analytics: RevenueAnalytics }> = ({ analytics }) => {
  // This would integrate with a charting library like recharts or Chart.js
  // For now, showing a simplified representation
  
  const topTreatments = Object.entries(analytics.revenueByTreatment)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topSources = Object.entries(analytics.revenueBySource)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Top Tratamentos por Receita</h4>
        <div className="space-y-3">
          {topTreatments.map(([treatment, revenue]) => {
            const percentage = analytics.totalRevenue > 0 ? (revenue / analytics.totalRevenue) * 100 : 0;
            return (
              <div key={treatment} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{treatment}</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue)}</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  {percentage.toFixed(1)}% do total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Fontes de Receita</h4>
        <div className="space-y-3">
          {topSources.map(([source, revenue]) => {
            const percentage = analytics.totalRevenue > 0 ? (revenue / analytics.totalRevenue) * 100 : 0;
            return (
              <div key={source} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">{source}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {analytics.forecast.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Previsão de Receita</h4>
          <div className="space-y-2">
            {analytics.forecast.slice(0, 3).map((forecast) => (
              <div key={forecast.period} className="flex justify-between text-sm">
                <span>{forecast.period}</span>
                <div className="text-right">
                  <div>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(forecast.predicted)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ±{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      (forecast.confidence.upper - forecast.confidence.lower) / 2
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =================== MAIN COMPONENT ===================

export const FinancialDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const { data, refreshData } = useDashboardData(dateRange);

  const kpisByCategory = useMemo(() => {
    return {
      revenue: data.kpis.filter(kpi => kpi.category === 'revenue'),
      costs: data.kpis.filter(kpi => kpi.category === 'costs'),
      profitability: data.kpis.filter(kpi => kpi.category === 'profitability'),
      efficiency: data.kpis.filter(kpi => kpi.category === 'efficiency'),
    };
  }, [data.kpis]);

  const handleExportReport = async () => {
    try {
      const response = await fetch('/api/financial/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dateRange,
          format: 'pdf',
          sections: ['kpis', 'profitability', 'analytics'],
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Análise financeira completa da sua clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={data.isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${data.isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            Última atualização: {data.lastUpdated.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="profitability">Rentabilidade</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Indicadores Principais</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {kpisByCategory.revenue.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-4">Custos e Rentabilidade</h3>
              <div className="grid gap-4">
                {[...kpisByCategory.costs, ...kpisByCategory.profitability].map((kpi) => (
                  <KPICard key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Eficiência Operacional</h3>
              <div className="grid gap-4">
                {kpisByCategory.efficiency.map((kpi) => (
                  <KPICard key={kpi.id} kpi={kpi} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Análise de Rentabilidade por Tratamento</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.treatmentProfitability.map((treatment) => (
                <TreatmentProfitabilityCard key={treatment.treatmentType} treatment={treatment} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Receita</CardTitle>
                <CardDescription>
                  Distribuição e previsões de receita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart analytics={data.revenueAnalytics} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>
                  Indicadores de crescimento e eficiência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Crescimento</span>
                    <div className="flex items-center">
                      {data.revenueAnalytics.growthRate > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`font-medium ${data.revenueAnalytics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(data.revenueAnalytics.growthRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.abs(data.revenueAnalytics.growthRate) * 100} 
                    className={`h-2 ${data.revenueAnalytics.growthRate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Gere relatórios personalizados para análise detalhada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleExportReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório Completo (PDF)
                </Button>
                <p className="text-sm text-muted-foreground">
                  O relatório incluirá todos os KPIs, análise de rentabilidade e projeções para o período selecionado.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;