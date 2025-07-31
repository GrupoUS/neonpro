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
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { dashboardLayoutEngine } from '@/lib/dashboard/executive/dashboard-layout-engine';
import { kpiCalculationService } from '@/lib/dashboard/executive/kpi-calculation-service';
import { widgetService } from '@/lib/dashboard/executive/widget-service';
import { alertSystem } from '@/lib/dashboard/executive/alert-system';
import { reportSystem } from '@/lib/dashboard/executive/report-system';
import type { 
  DashboardLayout, 
  WidgetConfig, 
  KPIValue, 
  AlertInstance,
  ReportInstance
} from '@/lib/dashboard/executive/types';

interface ExecutiveDashboardProps {
  clinicId: string;
  userId: string;
  className?: string;
}

interface DashboardState {
  layout: DashboardLayout | null;
  widgets: WidgetConfig[];
  kpis: KPIValue[];
  alerts: AlertInstance[];
  reports: ReportInstance[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface FilterState {
  dateRange: {
    from: Date;
    to: Date;
  };
  department: string;
  service: string;
}

export function ExecutiveDashboard({ clinicId, userId, className }: ExecutiveDashboardProps) {
  const { toast } = useToast();
  
  // State management
  const [state, setState] = useState<DashboardState>({
    layout: null,
    widgets: [],
    kpis: [],
    alerts: [],
    reports: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      to: new Date()
    },
    department: 'all',
    service: 'all'
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);

  /**
   * Load dashboard data
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load dashboard layout
      const layout = await dashboardLayoutEngine.getDashboardLayout(clinicId, userId);
      if (!layout) {
        // Create default layout if none exists
        const defaultLayout = dashboardLayoutEngine.getDefaultLayout();
        await dashboardLayoutEngine.createDashboardLayout({
          ...defaultLayout,
          clinicId,
          userId
        });
      }

      // Load widgets
      const widgets = await widgetService.getWidgets(clinicId);

      // Load KPIs
      const kpis = await kpiCalculationService.calculateClinicKPIs(
        clinicId,
        filters.dateRange.from,
        filters.dateRange.to
      );

      // Load alerts
      const alerts = await alertSystem.getActiveAlerts(clinicId);

      // Load recent reports
      const reports = await reportSystem.getReportInstances(clinicId, 10);

      setState({
        layout: layout || dashboardLayoutEngine.getDefaultLayout(),
        widgets,
        kpis,
        alerts,
        reports,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dashboard'
      }));
      
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do dashboard',
        variant: 'destructive'
      });
    }
  }, [clinicId, userId, filters.dateRange, toast]);

  /**
   * Refresh dashboard data
   */
  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
    
    toast({
      title: 'Dashboard atualizado',
      description: 'Dados atualizados com sucesso'
    });
  }, [loadDashboardData, toast]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Generate report
   */
  const handleGenerateReport = useCallback(async (templateId: string, format: 'pdf' | 'excel') => {
    try {
      const reportInstance = await reportSystem.generateReport(
        templateId,
        format,
        {
          periodStart: filters.dateRange.from.toISOString(),
          periodEnd: filters.dateRange.to.toISOString(),
          department: filters.department !== 'all' ? filters.department : undefined,
          service: filters.service !== 'all' ? filters.service : undefined
        },
        userId
      );

      if (reportInstance) {
        toast({
          title: 'Relatório em geração',
          description: 'Você será notificado quando estiver pronto'
        });
        
        // Refresh reports list
        const reports = await reportSystem.getReportInstances(clinicId, 10);
        setState(prev => ({ ...prev, reports }));
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar relatório',
        variant: 'destructive'
      });
    }
  }, [filters, userId, clinicId, toast]);

  // Load data on mount and filter changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.isLoading) {
        loadDashboardData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadDashboardData, state.isLoading]);

  if (state.isLoading && !state.layout) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={cn('space-y-6', className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão geral dos principais indicadores da clínica
            {state.lastUpdated && (
              <span className="ml-2 text-xs">
                Atualizado em {state.lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDashboard}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Atualizar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleGenerateReport('executive_summary', 'pdf')}>
                Relatório Executivo (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateReport('executive_summary', 'excel')}>
                Relatório Executivo (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateReport('financial_report', 'pdf')}>
                Relatório Financeiro (PDF)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm">Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Período:</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range) => handleFilterChange({ dateRange: range })}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Departamento:</label>
              <Select
                value={filters.department}
                onValueChange={(value) => handleFilterChange({ department: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="medical">Médico</SelectItem>
                  <SelectItem value="dental">Odontológico</SelectItem>
                  <SelectItem value="aesthetic">Estético</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Serviço:</label>
              <Select
                value={filters.service}
                onValueChange={(value) => handleFilterChange({ service: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="consultation">Consulta</SelectItem>
                  <SelectItem value="procedure">Procedimento</SelectItem>
                  <SelectItem value="surgery">Cirurgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {state.alerts.length > 0 && (
        <div className="space-y-2">
          {state.alerts.slice(0, 3).map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.severity === 'critical' ? 'Crítico' : 
                     alert.severity === 'warning' ? 'Atenção' : 'Info'}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {state.kpis.slice(0, 8).map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {state.widgets.slice(0, 4).map((widget) => (
              <WidgetCard 
                key={widget.id} 
                widget={widget}
                onEdit={() => setSelectedWidget(widget)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.kpis.filter(kpi => kpi.kpi.category === 'financial').map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {state.widgets.filter(w => w.category === 'financial').map((widget) => (
              <WidgetCard 
                key={widget.id} 
                widget={widget}
                onEdit={() => setSelectedWidget(widget)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.kpis.filter(kpi => kpi.kpi.category === 'operational').map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {state.widgets.filter(w => w.category === 'operational').map((widget) => (
              <WidgetCard 
                key={widget.id} 
                widget={widget}
                onEdit={() => setSelectedWidget(widget)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Relatórios Recentes</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
          
          <div className="space-y-4">
            {state.reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Widget Edit Dialog */}
      {selectedWidget && (
        <Dialog open={!!selectedWidget} onOpenChange={() => setSelectedWidget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Widget</DialogTitle>
              <DialogDescription>
                Configurar widget: {selectedWidget.title}
              </DialogDescription>
            </DialogHeader>
            {/* Widget configuration form would go here */}
            <div className="p-4 text-center text-muted-foreground">
              Configuração de widget em desenvolvimento
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/**
 * KPI Card Component
 */
interface KPICardProps {
  kpi: KPIValue;
}

function KPICard({ kpi }: KPICardProps) {
  const getIcon = () => {
    switch (kpi.kpi.category) {
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'patients':
        return <Users className="h-4 w-4" />;
      case 'operational':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTrendIcon = () => {
    if (!kpi.trend || kpi.trend === 0) return null;
    return kpi.trend > 0 ? 
      <TrendingUp className="h-3 w-3 text-green-500" /> : 
      <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const formatValue = (value: number) => {
    switch (kpi.kpi.format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
      default:
        return value.toString();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {kpi.kpi.name}
        </CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(kpi.value)}</div>
        {kpi.trend !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            {getTrendIcon()}
            <span className="ml-1">
              {kpi.trend > 0 ? '+' : ''}{kpi.trend.toFixed(1)}% vs período anterior
            </span>
          </div>
        )}
        {kpi.kpi.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {kpi.kpi.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Widget Card Component
 */
interface WidgetCardProps {
  widget: WidgetConfig;
  onEdit: () => void;
}

function WidgetCard({ widget, onEdit }: WidgetCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          {widget.description && (
            <CardDescription className="text-xs">
              {widget.description}
            </CardDescription>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-center justify-center bg-muted rounded">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Gráfico: {widget.type}</p>
            <p className="text-xs">Dados: {widget.dataSource.type}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Report Card Component
 */
interface ReportCardProps {
  report: ReportInstance;
}

function ReportCard({ report }: ReportCardProps) {
  const getStatusBadge = () => {
    switch (report.status) {
      case 'completed':
        return <Badge variant="default">Concluído</Badge>;
      case 'generating':
        return <Badge variant="secondary">Gerando</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">{report.status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-semibold">{report.name}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(report.startedAt).toLocaleDateString('pt-BR')}
              <Clock className="h-3 w-3 ml-2" />
              {new Date(report.startedAt).toLocaleTimeString('pt-BR')}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {report.status === 'completed' && (
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}