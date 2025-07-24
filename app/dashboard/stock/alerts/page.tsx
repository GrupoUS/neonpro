// Stock Alerts Dashboard Page
// Story 11.4: Alertas e Relatórios de Estoque
// Dashboard principal de alertas e KPIs

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign,
  Calendar,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  StockDashboardData,
  StockKPIs,
  StockAlertWithProduct,
  AlertStatus,
  SeverityLevel,
  ALERT_TYPE_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS
} from '@/app/lib/types/stock-alerts';

// =====================================================
// TYPES AND INTERFACES
// =====================================================

interface DashboardFilters {
  severity?: SeverityLevel;
  status?: AlertStatus;
  days: number;
}

interface LoadingState {
  dashboard: boolean;
  alerts: boolean;
  acknowledging: Record<string, boolean>;
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

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getSeverityColor = (severity: SeverityLevel): string => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  return colors[severity] || colors.medium;
};

const getSeverityIcon = (severity: SeverityLevel) => {
  const iconProps = { className: "h-4 w-4" };
  switch (severity) {
    case 'critical':
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-red-500" />;
    case 'high':
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-orange-500" />;
    case 'medium':
      return <Clock {...iconProps} className="h-4 w-4 text-yellow-500" />;
    case 'low':
      return <Bell {...iconProps} className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell {...iconProps} />;
  }
};

// =====================================================
// KPI CARDS COMPONENT
// =====================================================

interface KPICardsProps {
  kpis: StockKPIs;
  loading: boolean;
}

const KPICards: React.FC<KPICardsProps> = ({ kpis, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(kpis.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Giro: {kpis.turnoverRate.toFixed(1)}x/ano
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.daysCoverage} dias</div>
          <p className="text-xs text-muted-foreground">
            Precisão: {kpis.accuracyPercentage.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activeAlerts}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.criticalAlerts} críticos
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Desperdício</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.wastePercentage.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(kpis.wasteValue)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// =====================================================
// ALERT CARD COMPONENT
// =====================================================

interface AlertCardProps {
  alert: StockAlertWithProduct;
  onAcknowledge: (alertId: string) => Promise<void>;
  acknowledging: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, acknowledging }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSeverityIcon(alert.severityLevel)}
            <Badge className={getSeverityColor(alert.severityLevel)}>
              {SEVERITY_LABELS[alert.severityLevel]}
            </Badge>
            <Badge variant="outline">
              {ALERT_TYPE_LABELS[alert.alertType]}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {alert.createdAt ? formatDate(alert.createdAt) : '-'}
          </div>
        </div>
        <CardTitle className="text-base">
          {alert.product?.name || 'Produto não identificado'}
        </CardTitle>
        {alert.product?.sku && (
          <CardDescription>SKU: {alert.product.sku}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{alert.message}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>Atual: {alert.currentValue}</span>
          <span>Limite: {alert.thresholdValue}</span>
        </div>
        
        {alert.status === AlertStatus.ACTIVE && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAcknowledge(alert.id!)}
              disabled={acknowledging}
              className="flex-1"
            >
              {acknowledging ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Reconhecendo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Reconhecer
                </>
              )}
            </Button>
          </div>
        )}
        
        {alert.status === AlertStatus.ACKNOWLEDGED && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            Reconhecido
            {alert.acknowledgedAt && (
              <span className="text-muted-foreground ml-1">
                - {formatDate(alert.acknowledgedAt)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// =====================================================
// MAIN DASHBOARD COMPONENT
// =====================================================

const StockAlertsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<StockDashboardData | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({ days: 30 });
  const [loading, setLoading] = useState<LoadingState>({
    dashboard: true,
    alerts: false,
    acknowledging: {}
  });
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // =====================================================
  // DATA FETCHING FUNCTIONS
  // =====================================================

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      setError(null);

      const params = new URLSearchParams({
        days: filters.days.toString()
      });

      const response = await fetch(`/api/stock/dashboard?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setDashboardData(result.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, [filters.days]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      setLoading(prev => ({ 
        ...prev, 
        acknowledging: { ...prev.acknowledging, [alertId]: true }
      }));

      const response = await fetch('/api/stock/alerts/acknowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          note: 'Reconhecido via dashboard'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to acknowledge alert');
      }

      // Refresh dashboard data to reflect changes
      await fetchDashboardData();
    } catch (err) {
      console.error('Acknowledge error:', err);
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        acknowledging: { ...prev.acknowledging, [alertId]: false }
      }));
    }
  }, [fetchDashboardData]);

  // =====================================================
  // EFFECTS
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // =====================================================
  // FILTERED DATA
  // =====================================================

  const filteredAlerts = dashboardData?.alerts.filter(alert => {
    if (filters.severity && alert.severityLevel !== filters.severity) return false;
    if (filters.status && alert.status !== filters.status) return false;
    return true;
  }) || [];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alertas de Estoque</h2>
          <p className="text-muted-foreground">
            Monitore e gerencie alertas de estoque em tempo real
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading.dashboard}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading.dashboard ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <KPICards 
        kpis={dashboardData?.kpis || {
          totalValue: 0,
          turnoverRate: 0,
          daysCoverage: 0,
          accuracyPercentage: 0,
          activeAlerts: 0,
          criticalAlerts: 0,
          wasteValue: 0,
          wastePercentage: 0
        }} 
        loading={loading.dashboard} 
      />

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            Alertas Ativos ({filteredAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="recommendations">
            Recomendações ({dashboardData?.recommendations.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Período:</label>
                  <select 
                    value={filters.days}
                    onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value={7}>Últimos 7 dias</option>
                    <option value={15}>Últimos 15 dias</option>
                    <option value={30}>Últimos 30 dias</option>
                    <option value={60}>Últimos 60 dias</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Severidade:</label>
                  <select 
                    value={filters.severity || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      severity: e.target.value as SeverityLevel || undefined 
                    }))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="">Todas</option>
                    <option value="critical">Crítica</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Grid */}
          {loading.dashboard ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                  acknowledging={loading.acknowledging[alert.id!] || false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum alerta encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Não há alertas ativos que correspondam aos filtros selecionados.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gráficos e Análises</CardTitle>
              <CardDescription>
                Visualizações detalhadas dos dados de estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gráficos interativos serão implementados na próxima fase.
                Dados disponíveis: tendência de consumo, top produtos, análise de desperdício.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {dashboardData?.recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                    <CardTitle className="text-base">{rec.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{rec.message}</p>
                {rec.actions && rec.actions.length > 0 && (
                  <div className="flex gap-2">
                    {rec.actions.map((action, index) => (
                      <Button key={index} size="sm" variant="outline">
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma recomendação</h3>
                <p className="text-muted-foreground text-center">
                  Seu estoque está bem gerenciado. Continuaremos monitorando.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground text-center">
        Última atualização: {lastRefresh ? formatDate(lastRefresh) : '-'}
      </div>
    </div>
  );
};

export default StockAlertsDashboard;