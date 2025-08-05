'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock,
  AlertTriangle,
  Download,
  Settings,
  RefreshCw,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types from service layer
interface KPIValue {
  id: string;
  clinic_id: string;
  kpi_name: string;
  kpi_value: number;
  unit?: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  calculation_method?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface DashboardAlert {
  id: string;
  clinic_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold_value?: number;
  current_value?: number;
  kpi_name?: string;
  is_active: boolean;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

interface DashboardWidget {
  id: string;
  clinic_id: string;
  user_id: string;
  widget_type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  configuration?: Record<string, any>;
  is_visible: boolean;
}

interface DashboardReport {
  id: string;
  clinic_id: string;
  report_name: string;
  report_type: string;
  period_type: string;
  period_start: string;
  period_end: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_path?: string;
  created_at: string;
}

interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

interface ExecutiveDashboardData {
  kpis: KPIValue[];
  alerts: DashboardAlert[];
  widgets: DashboardWidget[];
  reports: DashboardReport[];
  periodComparisons: Record<string, PeriodComparison>;
}

interface ExecutiveDashboardProps {
  clinicId: string;
  userId: string;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ 
  clinicId, 
  userId 
}) => {
  const { toast } = useToast();
  
  // State management
  const [dashboardData, setDashboardData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<string>('monthly');
  const [refreshing, setRefreshing] = useState(false);
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/executive-dashboard?clinic_id=${clinicId}&period_type=${periodType}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setDashboardData(result.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: 'Erro ao carregar dashboard',
        description: 'Não foi possível carregar os dados do dashboard executivo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [clinicId, periodType, toast]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    
    toast({
      title: 'Dashboard atualizado',
      description: 'Os dados do dashboard foram atualizados com sucesso.',
    });
  }, [fetchDashboardData, toast]);

  // Handle alert actions
  const handleAlertAction = async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      const response = await fetch(`/api/executive-dashboard/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update alert');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update alert');
      }

      // Update local state
      if (dashboardData) {
        const updatedAlerts = dashboardData.alerts.map(alert => 
          alert.id === alertId ? result.data : alert
        );
        setDashboardData({
          ...dashboardData,
          alerts: updatedAlerts
        });
      }

      toast({
        title: `Alerta ${action === 'acknowledge' ? 'reconhecido' : 'resolvido'}`,
        description: `O alerta foi ${action === 'acknowledge' ? 'reconhecido' : 'resolvido'} com sucesso.`,
      });

    } catch (err) {
      console.error('Error updating alert:', err);
      toast({
        title: 'Erro ao atualizar alerta',
        description: 'Não foi possível atualizar o alerta.',
        variant: 'destructive',
      });
    }
  };

  // Generate report
  const generateReport = async (
    reportName: string,
    reportType: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ) => {
    try {
      const response = await fetch('/api/executive-dashboard/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinic_id: clinicId,
          report_name: reportName,
          report_type: reportType,
          period_type: periodType,
          period_start: new Date().toISOString().split('T')[0],
          period_end: new Date().toISOString().split('T')[0],
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to request report');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to request report');
      }

      toast({
        title: 'Relatório solicitado',
        description: 'O relatório está sendo gerado. Você será notificado quando estiver pronto.',
      });

      // Refresh reports list
      await refreshData();

    } catch (err) {
      console.error('Error generating report:', err);
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Não foi possível solicitar a geração do relatório.',
        variant: 'destructive',
      });
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  // Get trend icon and color
  const getTrendDisplay = (trend: 'up' | 'down' | 'stable', changePercent: number) => {
    if (trend === 'up') {
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    } else if (trend === 'down') {
      return {
        icon: <TrendingDown className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    } else {
      return {
        icon: <BarChart3 className="h-4 w-4" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50'
      };
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Effect to fetch data on component mount and period change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Nenhum dado encontrado para o dashboard executivo.
        </AlertDescription>
      </Alert>
    );
  }

  const { kpis, alerts, widgets, reports, periodComparisons } = dashboardData;  // Get key KPIs for display
  const keyKPIs = [
    { name: 'total_revenue', label: 'Receita Total', icon: DollarSign, formatter: formatCurrency },
    { name: 'total_appointments', label: 'Consultas Totais', icon: Calendar, formatter: (value: number) => value.toString() },
    { name: 'new_patients', label: 'Novos Pacientes', icon: Users, formatter: (value: number) => value.toString() },
    { name: 'patient_satisfaction', label: 'Satisfação', icon: BarChart3, formatter: formatPercentage }
  ];

  // Active alerts count by severity
  const activeAlerts = alerts.filter(alert => alert.is_active);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão geral dos principais indicadores da clínica
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Period Type Selector */}
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Atualizar
          </Button>

          {/* Report Generation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Relatórios
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => generateReport('Resumo Executivo', 'executive_summary', 'pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Resumo Executivo (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generateReport('Análise de KPIs', 'kpi_analysis', 'excel')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Análise de KPIs (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generateReport('Análise de Tendências', 'trend_analysis', 'pdf')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Análise de Tendências (PDF)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alerts Summary */}
      {activeAlerts.length > 0 && (
        <Alert className={cn(
          "border-l-4",
          criticalAlerts.length > 0 ? "border-l-red-500 bg-red-50" : 
          highAlerts.length > 0 ? "border-l-orange-500 bg-orange-50" : 
          "border-l-yellow-500 bg-yellow-50"
        )}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {criticalAlerts.length > 0 && (
                  <span className="text-red-700 font-medium">
                    {criticalAlerts.length} alerta(s) crítico(s)
                  </span>
                )}
                {criticalAlerts.length > 0 && highAlerts.length > 0 && ' • '}
                {highAlerts.length > 0 && (
                  <span className="text-orange-700 font-medium">
                    {highAlerts.length} alerta(s) importante(s)
                  </span>
                )}
                {activeAlerts.length - criticalAlerts.length - highAlerts.length > 0 && (
                  <span className="text-yellow-700">
                    {' • '}{activeAlerts.length - criticalAlerts.length - highAlerts.length} outro(s)
                  </span>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlertsExpanded(!alertsExpanded)}
              >
                {alertsExpanded ? 'Ocultar' : 'Ver todos'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyKPIs.map((kpi) => {
          const comparison = periodComparisons[kpi.name];
          const trendDisplay = getTrendDisplay(comparison.trend, comparison.changePercent);
          
          return (
            <Card key={kpi.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpi.formatter(comparison.current)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full",
                    trendDisplay.color,
                    trendDisplay.bgColor
                  )}>
                    {trendDisplay.icon}
                    <span className="font-medium">
                      {comparison.changePercent > 0 ? '+' : ''}{comparison.changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <span>vs período anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Receita</CardTitle>
                <CardDescription>
                  Evolução da receita nos últimos períodos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Gráfico de tendência será implementado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
                <CardDescription>
                  Distribuição de consultas por status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Gráfico de agendamentos será implementado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional KPIs */}
          <Card>
            <CardHeader>
              <CardTitle>Indicadores Adicionais</CardTitle>
              <CardDescription>
                Outros indicadores importantes para acompanhamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpis.filter(kpi => !keyKPIs.some(k => k.name === kpi.kpi_name)).map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{kpi.kpi_name.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-2xl font-bold">{kpi.kpi_value}{kpi.unit}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(kpi.period_start), 'dd/MM', { locale: ptBR })} - {format(new Date(kpi.period_end), 'dd/MM', { locale: ptBR })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-4">
            {activeAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-lg font-medium">Nenhum alerta ativo</p>
                    <p className="text-sm text-muted-foreground">Todos os indicadores estão dentro dos parâmetros normais</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              activeAlerts.map((alert) => (
                <Card key={alert.id} className={cn("border-l-4", {
                  'border-l-red-500': alert.severity === 'critical',
                  'border-l-orange-500': alert.severity === 'high',
                  'border-l-yellow-500': alert.severity === 'medium',
                  'border-l-blue-500': alert.severity === 'low',
                })}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>{alert.message}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {!alert.acknowledged_at && (
                            <DropdownMenuItem 
                              onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Reconhecer
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleAlertAction(alert.id, 'resolve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Criado em {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                      {alert.acknowledged_at && (
                        <span className="text-blue-600">Reconhecido</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Relatórios Recentes</h3>
              <Button onClick={() => generateReport('Relatório Personalizado', 'custom', 'pdf')}>
                <Plus className="h-4 w-4 mr-2" />
                Gerar Novo Relatório
              </Button>
            </div>
            
            {reports.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Download className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-lg font-medium">Nenhum relatório gerado</p>
                    <p className="text-sm text-muted-foreground">Clique em "Gerar Novo Relatório" para começar</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{report.report_name}</CardTitle>
                        <CardDescription>
                          {report.report_type} • {report.format.toUpperCase()} • 
                          {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        report.status === 'completed' ? 'default' :
                        report.status === 'generating' ? 'secondary' :
                        report.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {report.status === 'completed' ? 'Concluído' :
                         report.status === 'generating' ? 'Gerando...' :
                         report.status === 'failed' ? 'Falhou' : 'Pendente'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Período: {format(new Date(report.period_start), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(report.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      {report.status === 'completed' && report.file_path && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Dashboard</CardTitle>
              <CardDescription>
                Personalize a exibição e configurações do dashboard executivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  As configurações de widgets e layouts personalizados serão implementadas em uma próxima versão.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Layout dos Widgets</h4>
                    <p className="text-sm text-muted-foreground">Arrastar e soltar widgets para reorganizar o dashboard</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Alertas Personalizados</h4>
                    <p className="text-sm text-muted-foreground">Configurar thresholds e condições para alertas automáticos</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Relatórios Agendados</h4>
                    <p className="text-sm text-muted-foreground">Agendar geração automática de relatórios</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Notificações</h4>
                    <p className="text-sm text-muted-foreground">Configurar notificações por email e dentro do sistema</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { ExecutiveDashboard };
export default ExecutiveDashboard;
