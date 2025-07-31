'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { ExecutiveDashboard } from '@/components/dashboard/executive-dashboard';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, Users, DollarSign, Calendar, Download, Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  department?: string;
  service?: string;
}

interface QuickStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface RecentReport {
  id: string;
  name: string;
  type: string;
  format: string;
  status: 'completed' | 'generating' | 'failed';
  completedAt?: string;
  downloadUrl?: string;
}

export default function ExecutiveDashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    }
  });
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load quick stats (KPIs)
      const kpiResponse = await fetch('/api/dashboard/executive/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: {
            start: filters.dateRange.from.toISOString(),
            end: filters.dateRange.to.toISOString()
          },
          categories: ['financial', 'operational', 'patients', 'staff']
        })
      });

      if (kpiResponse.ok) {
        const { results } = await kpiResponse.json();
        const stats = results.map((kpi: any) => ({
          title: kpi.definition.name,
          value: formatKPIValue(kpi.value, kpi.definition.format),
          change: kpi.trend ? `${kpi.trend > 0 ? '+' : ''}${kpi.trend.toFixed(1)}%` : 'N/A',
          trend: kpi.trend > 0 ? 'up' : kpi.trend < 0 ? 'down' : 'neutral',
          icon: getKPIIcon(kpi.definition.category)
        }));
        setQuickStats(stats.slice(0, 4)); // Show top 4 KPIs
      }

      // Load recent alerts
      const alertsResponse = await fetch('/api/dashboard/executive/alerts?limit=5');
      if (alertsResponse.ok) {
        const { instances } = await alertsResponse.json();
        setAlerts(instances);
      }

      // Load recent reports
      const reportsResponse = await fetch('/api/dashboard/executive/reports?limit=5');
      if (reportsResponse.ok) {
        const { instances } = await reportsResponse.json();
        setRecentReports(instances);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: 'Atualizado',
      description: 'Dashboard atualizado com sucesso'
    });
  };

  // Generate report
  const generateReport = async () => {
    try {
      const response = await fetch('/api/dashboard/executive/reports?action=generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: 'default-executive-template', // This should come from templates
          name: `Relatório Executivo - ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
          format: 'pdf',
          parameters: {
            dateRange: {
              start: filters.dateRange.from.toISOString(),
              end: filters.dateRange.to.toISOString()
            },
            includeCharts: true,
            includeTables: true,
            includeKPIs: true
          }
        })
      });

      if (response.ok) {
        toast({
          title: 'Relatório Gerado',
          description: 'O relatório está sendo gerado e estará disponível em breve'
        });
        // Refresh reports list
        loadDashboardData();
      } else {
        throw new Error('Erro ao gerar relatório');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar relatório',
        variant: 'destructive'
      });
    }
  };

  // Format KPI value based on format type
  const formatKPIValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${Math.round(value)}min`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  // Get icon for KPI category
  const getKPIIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'operational':
        return <Activity className="h-4 w-4" />;
      case 'patients':
        return <Users className="h-4 w-4" />;
      case 'staff':
        return <Users className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get report status color
  const getReportStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'generating':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão geral dos principais indicadores e métricas da clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDashboard}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => {
                  if (dateRange?.from && dateRange?.to) {
                    setFilters(prev => ({
                      ...prev,
                      dateRange: { from: dateRange.from!, to: dateRange.to! }
                    }));
                  }
                }}
              />
            </div>
            <Select
              value={filters.department || ''}
              onValueChange={(value) => setFilters(prev => ({ ...prev, department: value || undefined }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os departamentos</SelectItem>
                <SelectItem value="clinico">Clínico</SelectItem>
                <SelectItem value="cirurgico">Cirúrgico</SelectItem>
                <SelectItem value="diagnostico">Diagnóstico</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.service || ''}
              onValueChange={(value) => setFilters(prev => ({ ...prev, service: value || undefined }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os serviços</SelectItem>
                <SelectItem value="consulta">Consultas</SelectItem>
                <SelectItem value="exame">Exames</SelectItem>
                <SelectItem value="procedimento">Procedimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ExecutiveDashboard filters={filters} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Recentes</CardTitle>
              <CardDescription>
                Alertas e notificações importantes do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum alerta ativo no momento
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(alert.triggeredAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getAlertSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
              <CardDescription>
                Histórico de relatórios gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum relatório gerado recentemente
                  </p>
                ) : (
                  recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {report.type} • {report.format.toUpperCase()}
                          </p>
                          {report.completedAt && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(report.completedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getReportStatusColor(report.status) as any}>
                          {report.status}
                        </Badge>
                        {report.downloadUrl && report.status === 'completed' && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={report.downloadUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}