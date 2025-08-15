'use client';

import React, { Suspense, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  Shield,
  FileText,
  Activity,
  Stethoscope,
  Clock,
  Target,
} from 'lucide-react';

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
  const canGenerateReports = hasPermission('analytics.reports.generate');
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
        <Alert variant="destructive" data-testid="unauthorized-alert">
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
        <Alert variant="destructive" data-testid="permission-denied-alert">
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

  const handleExportData = async (format: 'pdf' | 'excel') => {
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
      className="container mx-auto p-6 space-y-6"
      data-testid="analytics-dashboard"
    >
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
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
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              data-testid="refresh-button"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
            {canExportData && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportData('excel')}
                  disabled={isExporting}
                  data-testid="export-excel-button"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportData('pdf')}
                  disabled={isExporting}
                  data-testid="export-pdf-button"
                >
                  <FileText className="h-4 w-4 mr-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <DatePickerWithRange
                date={selectedDateRange}
                onDateChange={setSelectedDateRange}
                data-testid="date-range-picker"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Dados</label>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
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
              <label className="text-sm font-medium">Profissional</label>
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
        defaultValue="overview"
        className="w-full"
        data-testid="analytics-tabs"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="overview-tab">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="patients" data-testid="patients-tab">
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="procedures" data-testid="procedures-tab">
            Procedimentos
          </TabsTrigger>
          <TabsTrigger value="financial" data-testid="financial-tab">
            Financeiro
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent
          value="overview"
          className="space-y-6"
          data-testid="overview-content"
        >
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="kpi-patients">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pacientes Ativos
                    </p>
                    <p className="text-2xl font-bold">1,247</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
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
                    <p className="text-sm font-medium text-muted-foreground">
                      Agendamentos
                    </p>
                    <p className="text-2xl font-bold">89</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
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
                    <p className="text-sm font-medium text-muted-foreground">
                      Procedimentos
                    </p>
                    <p className="text-2xl font-bold">156</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
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
                    <p className="text-sm font-medium text-muted-foreground">
                      Receita
                    </p>
                    <p className="text-2xl font-bold">R$ 89.4k</p>
                    <div className="flex items-center gap-1 text-xs text-green-600">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="h-64 flex items-center justify-center bg-muted rounded">
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
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{procedure.name}</p>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${procedure.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium">{procedure.count}</p>
                        <p className="text-xs text-muted-foreground">
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
          value="patients"
          className="space-y-6"
          data-testid="patients-content"
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
                <div className="h-64 flex items-center justify-center bg-muted rounded">
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
          value="procedures"
          className="space-y-6"
          data-testid="procedures-content"
        >
          <Card data-testid="procedures-analytics">
            <CardHeader>
              <CardTitle>Análise de Procedimentos</CardTitle>
              <CardDescription>
                Performance e eficácia dos tratamentos estéticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded">
                <p className="text-muted-foreground">
                  Analytics de procedimentos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent
          value="financial"
          className="space-y-6"
          data-testid="financial-content"
        >
          <Card data-testid="financial-analytics">
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
              <CardDescription>
                Receitas, custos e rentabilidade da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded">
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
