// Stock Dashboard Client Component
// Story 11.4: Alertas e Relatórios de Estoque
// Cliente para dashboard de performance de estoque

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  DollarSign,
  Activity,
  Target,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { StockDashboardData } from '@/app/lib/types/stock';

// Extract the KPIs type from StockDashboardData
type StockKPIs = StockDashboardData['kpis'];

// Define Recommendation type locally since it's not exported
interface Recommendation {
  type: 'reorder' | 'optimize' | 'attention';
  priority: 'high' | 'medium' | 'low';
  message: string;
  actionable: boolean;
  productId?: string;
  actions?: Array<{
    action: string;
    parameters?: Record<string, any>;
  }>;
}

// =====================================================
// TYPES AND INTERFACES
// =====================================================

interface DashboardState {
  data: StockDashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const getKPIIcon = (metric: string) => {
  const iconProps = { className: "h-4 w-4" };
  switch (metric) {
    case 'totalValue':
      return <DollarSign {...iconProps} />;
    case 'turnoverRate':
      return <Activity {...iconProps} />;
    case 'daysCoverage':
      return <Calendar {...iconProps} />;
    case 'accuracyPercentage':
      return <Target {...iconProps} />;
    case 'activeAlerts':
      return <AlertTriangle {...iconProps} />;
    case 'criticalAlerts':
      return <Zap {...iconProps} />;
    case 'wasteValue':
      return <Package {...iconProps} />;
    default:
      return <TrendingUp {...iconProps} />;
  }
};

const getSeverityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const StockDashboardClient: React.FC = () => {
  const router = useRouter();

  // =====================================================
  // STATE MANAGEMENT
  // =====================================================

  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const fetchDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/stock/dashboard?days=${selectedPeriod}`, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao carregar dados do dashboard');
      }

      const result = await response.json();

      setState(prev => ({
        ...prev,
        data: result.data,
        loading: false,
        lastUpdated: new Date()
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [selectedPeriod]);

  // Initial data load and period changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleRecommendationAction = (recommendation: Recommendation) => {
    if (!recommendation.actionable || !recommendation.actions?.length) return;

    const action = recommendation.actions[0];
    if (action.action === 'navigate' && action.parameters?.route) {
      router.push(action.parameters.route);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/stock/reports?type=performance&period=${selectedPeriod}d&format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar dados",
        variant: "destructive",
      });
    }
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const renderKPICards = (kpis: StockKPIs) => {
    const kpiItems = [
      { key: 'totalValue', label: 'Valor Total', value: formatCurrency(kpis.totalValue), change: null },
      { key: 'turnoverRate', label: 'Taxa de Rotatividade', value: `${kpis.turnoverRate}x`, change: null },
      { key: 'daysCoverage', label: 'Dias de Cobertura', value: `${kpis.daysCoverage} dias`, change: null },
      { key: 'accuracyPercentage', label: 'Precisão', value: formatPercentage(kpis.accuracyPercentage), change: null },
      { key: 'activeAlerts', label: 'Alertas Ativos', value: kpis.activeAlerts.toString(), change: null },
      { key: 'criticalAlerts', label: 'Alertas Críticos', value: kpis.criticalAlerts.toString(), change: null }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((item) => (
          <Card key={item.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              {getKPIIcon(item.key)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              {item.change && (
                <p className={`text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                  {item.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(item.change)}% em relação ao período anterior
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderConsumptionTrend = () => {
    if (!state.data?.charts.consumptionTrend?.length) return null;

    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Tendência de Consumo</CardTitle>
          <CardDescription>Consumo de estoque ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={state.data.charts.consumptionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                formatter={(value: number) => [value, 'Consumo']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderTopProducts = () => {
    if (!state.data?.charts.topProducts?.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Principais</CardTitle>
          <CardDescription>Produtos com maior valor em estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {state.data.charts.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {product.productId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(product.value)}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.consumption} unidades
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlertsByType = () => {
    if (!state.data?.charts.alertsByType?.length) return null;

    const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas por Tipo</CardTitle>
          <CardDescription>Distribuição dos alertas ativos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={state.data.charts.alertsByType}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ type, percentage }) => `${type}: ${percentage}%`}
              >
                {state.data.charts.alertsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderRecommendations = () => {
    if (!state.data?.recommendations?.length) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recomendações
          </CardTitle>
          <CardDescription>Ações sugeridas para otimizar seu estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {state.data.recommendations.map((recommendation, index) => (
              <div
                key={`recommendation-${index}`}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                  recommendation.priority === 'high' ? 'text-red-500' :
                  recommendation.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}</h4>
                    <Badge className={getSeverityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendation.message}</p>
                </div>
                {recommendation.actionable && (
                  <Button
                    size="sm"
                    onClick={() => handleRecommendationAction(recommendation)}
                  >
                    Ação
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-600 mb-2">Erro ao carregar dashboard</h3>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <Button onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (state.loading || !state.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Estoque</h1>
          <p className="text-muted-foreground">
            Acompanhe métricas de performance e alertas em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={fetchDashboardData}>
            <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {state.lastUpdated && (
        <p className="text-sm text-muted-foreground">
          Última atualização: {state.lastUpdated.toLocaleString('pt-BR')}
        </p>
      )}

      {/* KPI Cards */}
      {renderKPICards(state.data.kpis)}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderConsumptionTrend()}
        {renderTopProducts()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAlertsByType()}
        {renderRecommendations()}
      </div>
    </div>
  );
};

export default StockDashboardClient;