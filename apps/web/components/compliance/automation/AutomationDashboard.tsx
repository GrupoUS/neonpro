'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  FileText,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface AutomationStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'completed';
  lastExecution: string;
  nextExecution: string;
  successRate: number;
  totalExecutions: number;
  errorCount: number;
}

interface DashboardMetrics {
  totalAutomations: number;
  activeAutomations: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  dataProcessed: number;
  complianceScore: number;
}

const mockAutomations: AutomationStatus[] = [
  {
    id: '1',
    name: 'Gestão de Consentimento',
    status: 'running',
    lastExecution: '2024-01-15T10:30:00Z',
    nextExecution: '2024-01-15T16:30:00Z',
    successRate: 98.5,
    totalExecutions: 1247,
    errorCount: 18,
  },
  {
    id: '2',
    name: 'Processamento de Direitos',
    status: 'completed',
    lastExecution: '2024-01-15T09:00:00Z',
    nextExecution: '2024-01-15T13:00:00Z',
    successRate: 95.2,
    totalExecutions: 892,
    errorCount: 43,
  },
  {
    id: '3',
    name: 'Relatórios de Auditoria',
    status: 'error',
    lastExecution: '2024-01-15T08:15:00Z',
    nextExecution: '2024-01-15T14:15:00Z',
    successRate: 87.3,
    totalExecutions: 654,
    errorCount: 83,
  },
  {
    id: '4',
    name: 'Monitoramento em Tempo Real',
    status: 'running',
    lastExecution: '2024-01-15T11:00:00Z',
    nextExecution: '2024-01-15T11:05:00Z',
    successRate: 99.1,
    totalExecutions: 2156,
    errorCount: 19,
  },
];

const mockMetrics: DashboardMetrics = {
  totalAutomations: 4,
  activeAutomations: 2,
  successfulExecutions: 4949,
  failedExecutions: 163,
  averageExecutionTime: 2.3,
  dataProcessed: 1247893,
  complianceScore: 94.7,
};

export default function AutomationDashboard() {
  const [automations, setAutomations] = useState<AutomationStatus[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAutomations(mockAutomations);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleAutomation = async (id: string, action: 'start' | 'stop') => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAutomations((prev) =>
        prev.map((automation) =>
          automation.id === id
            ? {
                ...automation,
                status: action === 'start' ? 'running' : 'stopped',
              }
            : automation,
        ),
      );

      toast({
        title: 'Sucesso',
        description: `Automação ${action === 'start' ? 'iniciada' : 'parada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status da automação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status da automação.',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'stopped':
        return <Pause className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default">Em Execução</Badge>;
      case 'completed':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'stopped':
        return <Badge variant="outline">Parado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Automação LGPD
          </h1>
          <p className="text-muted-foreground">
            Monitore e gerencie suas automações de conformidade em tempo real
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Automações
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalAutomations}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.activeAutomations} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Sucesso
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  (metrics.successfulExecutions /
                    (metrics.successfulExecutions + metrics.failedExecutions)) *
                  100
                ).toFixed(1)}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.successfulExecutions} sucessos,{' '}
                {metrics.failedExecutions} falhas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dados Processados
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.dataProcessed / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                registros processados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Score de Conformidade
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.complianceScore}%
              </div>
              <Progress value={metrics.complianceScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="automations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automations">Automações</TabsTrigger>
          <TabsTrigger value="logs">Logs de Execução</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="automations">
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(automation.status)}
                      <CardTitle className="text-lg">
                        {automation.name}
                      </CardTitle>
                      {getStatusBadge(automation.status)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {automation.status === 'running' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleAutomation(automation.id, 'stop')
                          }
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Parar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            toggleAutomation(automation.id, 'start')
                          }
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Última Execução</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(automation.lastExecution)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Próxima Execução</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(automation.nextExecution)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Taxa de Sucesso</p>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={automation.successRate}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {automation.successRate}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Execuções</p>
                      <p className="text-sm text-muted-foreground">
                        {automation.totalExecutions} total,{' '}
                        {automation.errorCount} erros
                      </p>
                    </div>
                  </div>

                  {automation.status === 'error' && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Esta automação encontrou erros na última execução.
                        Verifique os logs para mais detalhes.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Logs de Execução
              </CardTitle>
              <CardDescription>
                Histórico detalhado das execuções das automações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Os logs de execução serão implementados em uma versão
                    futura.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análise de Performance
              </CardTitle>
              <CardDescription>
                Métricas detalhadas de performance das automações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    As métricas de performance serão implementadas em uma versão
                    futura.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
