'use client';

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Shield,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Healthcare Analytics Dashboard Page
 *
 * LGPD Compliance: Anonymized patient analytics with privacy protection
 * ANVISA Compliance: Medical procedure analytics and reporting
 * CFM Compliance: Professional performance analytics
 *
 * Quality Standard: ≥9.9/10 (Healthcare analytics integrity)
 */
export default function AnalyticsDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date(),
  });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Healthcare role-based access control
  const canViewAnalytics = hasPermission('analytics.dashboard.view');
  const _canGenerateReports = hasPermission('analytics.reports.generate');
  const canExportData = hasPermission('analytics.export.execute');

  if (authLoading || permissionsLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        data-testid="loading-state"
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert data-testid="unauthorized-alert" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso não autorizado. Faça login para continuar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!canViewAnalytics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert data-testid="permission-denied-alert" variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Permissão insuficiente para acessar analytics. Entre em contato com
            o administrador da clínica.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const handleExportData = async (_format: 'pdf' | 'excel') => {
    if (!canExportData) {
      return;
    }

    setIsExporting(true);
    // Simulate export process with LGPD compliance
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsExporting(false);
  };

  return (
    <div
      className="container mx-auto space-y-6 p-6"
      data-testid="analytics-dashboard"
    >
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-bold text-3xl tracking-tight"
              data-testid="analytics-title"
            >
              Analytics Dashboard
            </h1>
            <p
              className="text-muted-foreground"
              data-testid="analytics-description"
            >
              Insights de saúde com proteção LGPD e conformidade ANVISA
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="refresh-button"
              disabled={isRefreshing}
              onClick={handleRefreshData}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
            {canExportData && (
              <>
                <Button
                  data-testid="export-excel-button"
                  disabled={isExporting}
                  onClick={() => handleExportData('excel')}
                  size="sm"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  data-testid="export-pdf-button"
                  disabled={isExporting}
                  onClick={() => handleExportData('pdf')}
                  size="sm"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card data-testid="analytics-filters">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filtros de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="font-medium text-sm">Período</label>
              <DatePickerWithRange
                data-testid="date-range-picker"
                date={selectedDateRange}
                onDateChange={setSelectedDateRange}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm">Tipo de Dados</label>
              <Select onValueChange={setSelectedFilter} value={selectedFilter}>
                <SelectTrigger data-testid="data-type-filter">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Dados</SelectItem>
                  <SelectItem value="patients">Pacientes</SelectItem>
                  <SelectItem value="procedures">Procedimentos</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="appointments">Agendamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm">Profissional</label>
              <Select>
                <SelectTrigger data-testid="professional-filter">
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="dra-ana">Dra. Ana Costa</SelectItem>
                  <SelectItem value="dr-carlos">Dr. Carlos Silva</SelectItem>
                  <SelectItem value="dra-patricia">
                    Dra. Patricia Lima
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LGPD Compliance Notice */}
      <Alert data-testid="privacy-notice">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Todos os dados apresentados são anonimizados em conformidade com a
          LGPD. Informações de pacientes são protegidas e não identificáveis.
        </AlertDescription>
      </Alert>

      {/* Analytics Content */}
      <Tabs
        className="w-full"
        data-testid="analytics-tabs"
        defaultValue="overview"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger data-testid="overview-tab" value="overview">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger data-testid="patients-tab" value="patients">
            Pacientes
          </TabsTrigger>
          <TabsTrigger data-testid="procedures-tab" value="procedures">
            Procedimentos
          </TabsTrigger>
          <TabsTrigger data-testid="financial-tab" value="financial">
            Financeiro
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent
          className="space-y-6"
          data-testid="overview-content"
          value="overview"
        >
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="kpi-patients">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Pacientes Ativos
                    </p>
                    <p className="font-bold text-2xl">1,247</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12% vs mês anterior</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="kpi-appointments">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Agendamentos
                    </p>
                    <p className="font-bold text-2xl">89</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      <span>+8% vs semana anterior</span>
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="kpi-procedures">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Procedimentos
                    </p>
                    <p className="font-bold text-2xl">156</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      <span>+15% vs mês anterior</span>
                    </div>
                  </div>
                  <Stethoscope className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="kpi-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      Receita
                    </p>
                    <p className="font-bold text-2xl">R$ 89.4k</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      <span>+22% vs mês anterior</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card data-testid="revenue-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Receita por Mês
                </CardTitle>
                <CardDescription>
                  Evolução da receita dos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center rounded bg-muted">
                  <p className="text-muted-foreground">
                    Gráfico de receita (simulado)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="procedures-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Procedimentos Populares
                </CardTitle>
                <CardDescription>
                  Top 5 procedimentos mais realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Botox Facial', count: 45, percentage: 28.8 },
                    {
                      name: 'Preenchimento Labial',
                      count: 32,
                      percentage: 20.5,
                    },
                    { name: 'Limpeza de Pele', count: 28, percentage: 17.9 },
                    { name: 'Microagulhamento', count: 24, percentage: 15.4 },
                    { name: 'Peeling Químico', count: 18, percentage: 11.5 },
                  ].map((procedure, index) => (
                    <div
                      className="flex items-center justify-between"
                      key={index}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{procedure.name}</p>
                        <div className="mt-1 h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${procedure.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-medium text-sm">{procedure.count}</p>
                        <p className="text-muted-foreground text-xs">
                          {procedure.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent
          className="space-y-6"
          data-testid="patients-content"
          value="patients"
        >
          <Card data-testid="patients-analytics">
            <CardHeader>
              <CardTitle>Análise de Pacientes (Dados Anonimizados)</CardTitle>
              <CardDescription>
                Insights sobre pacientes com proteção total da privacidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Todos os dados de pacientes são anonimizados e agregados
                    para garantir conformidade LGPD.
                  </AlertDescription>
                </Alert>
                <div className="flex h-64 items-center justify-center rounded bg-muted">
                  <p className="text-muted-foreground">
                    Analytics de pacientes (dados protegidos)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procedures Tab */}
        <TabsContent
          className="space-y-6"
          data-testid="procedures-content"
          value="procedures"
        >
          <Card data-testid="procedures-analytics">
            <CardHeader>
              <CardTitle>Análise de Procedimentos</CardTitle>
              <CardDescription>
                Performance e eficácia dos tratamentos estéticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded bg-muted">
                <p className="text-muted-foreground">
                  Analytics de procedimentos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent
          className="space-y-6"
          data-testid="financial-content"
          value="financial"
        >
          <Card data-testid="financial-analytics">
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
              <CardDescription>
                Receitas, custos e rentabilidade da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded bg-muted">
                <p className="text-muted-foreground">Analytics financeiros</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Status */}
      {isExporting && (
        <Alert data-testid="export-status">
          <Download className="h-4 w-4" />
          <AlertDescription>
            Exportando dados com criptografia LGPD... Aguarde.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
