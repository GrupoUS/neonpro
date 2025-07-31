'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  RefreshCw,
  Eye,
  UserCheck,
  Database,
  Lock,
  Activity
} from 'lucide-react';
import {
  useLGPDDashboard,
  useConsentManagement,
  useDataSubjectRights,
  useComplianceAssessment,
  useBreachManagement
} from '@/hooks/useLGPD';
import { ConsentManagementPanel } from './ConsentManagementPanel';
import { DataSubjectRightsPanel } from './DataSubjectRightsPanel';
import { ComplianceAssessmentPanel } from './ComplianceAssessmentPanel';
import { BreachManagementPanel } from './BreachManagementPanel';
import { AuditTrailPanel } from './AuditTrailPanel';

/**
 * LGPD Compliance Dashboard
 * 
 * Comprehensive dashboard for LGPD compliance management including:
 * - Real-time compliance metrics
 * - Consent management overview
 * - Data subject rights tracking
 * - Breach incident monitoring
 * - Audit trail visualization
 * - Compliance assessment results
 */
export function LGPDDashboard() {
  const { metrics, loading: metricsLoading, error: metricsError, loadMetrics } = useLGPDDashboard();
  const { runAssessment, loading: assessmentLoading } = useComplianceAssessment();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh metrics every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadMetrics();
      setLastUpdated(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadMetrics]);

  const handleRunAssessment = async () => {
    try {
      await runAssessment();
      await loadMetrics(); // Refresh metrics after assessment
    } catch (error) {
      console.error('Error running compliance assessment:', error);
    }
  };

  const getComplianceStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatusBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 80) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Bom</Badge>;
    if (score >= 70) return <Badge variant="default" className="bg-orange-100 text-orange-800">Atenção</Badge>;
    return <Badge variant="destructive">Crítico</Badge>;
  };

  if (metricsLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando métricas LGPD...</span>
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dashboard LGPD</AlertTitle>
        <AlertDescription>{metricsError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard LGPD</h1>
          <p className="text-muted-foreground">
            Monitoramento e gestão de conformidade com a Lei Geral de Proteção de Dados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMetrics}
            disabled={metricsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={handleRunAssessment}
            disabled={assessmentLoading}
          >
            <Activity className={`h-4 w-4 mr-2 ${assessmentLoading ? 'animate-spin' : ''}`} />
            {assessmentLoading ? 'Executando...' : 'Executar Avaliação'}
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-muted-foreground">
        Última atualização: {lastUpdated.toLocaleString('pt-BR')}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="consent">Consentimentos</TabsTrigger>
          <TabsTrigger value="rights">Direitos dos Titulares</TabsTrigger>
          <TabsTrigger value="assessment">Avaliações</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Compliance Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Score de Conformidade LGPD</span>
              </CardTitle>
              <CardDescription>
                Pontuação geral de conformidade baseada na última avaliação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className={`text-4xl font-bold ${getComplianceStatusColor(metrics?.complianceScore || 0)}`}>
                    {metrics?.complianceScore || 0}%
                  </div>
                  {getComplianceStatusBadge(metrics?.complianceScore || 0)}
                </div>
                <div className="w-32">
                  <Progress value={metrics?.complianceScore || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consentimentos Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeConsents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total: {metrics?.totalConsents || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.pendingDataSubjectRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Atendidas: {metrics?.fulfilledDataSubjectRequests || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incidentes de Segurança</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.breachIncidents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Violações recentes: {metrics?.recentViolations || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conformidade de Retenção</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.retentionPolicyCompliance || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Logs de auditoria: {metrics?.auditLogEntries || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Alerts */}
          {metrics && (
            <div className="space-y-2">
              {metrics.complianceScore < 80 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Score de Conformidade Baixo</AlertTitle>
                  <AlertDescription>
                    Seu score de conformidade está abaixo do recomendado (80%). Execute uma avaliação completa para identificar áreas de melhoria.
                  </AlertDescription>
                </Alert>
              )}
              
              {metrics.pendingDataSubjectRequests > 5 && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Muitas Solicitações Pendentes</AlertTitle>
                  <AlertDescription>
                    Você tem {metrics.pendingDataSubjectRequests} solicitações de titulares de dados pendentes. Processe-as dentro do prazo legal de 30 dias.
                  </AlertDescription>
                </Alert>
              )}
              
              {metrics.breachIncidents > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Incidentes de Segurança Detectados</AlertTitle>
                  <AlertDescription>
                    {metrics.breachIncidents} incidente(s) de segurança foram reportados. Verifique se as autoridades foram notificadas conforme exigido.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('consent')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Consentimentos
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('rights')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Direitos dos Titulares
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('assessment')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Executar Avaliação
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => setActiveTab('audit')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Trilha de Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent">
          <ConsentManagementPanel />
        </TabsContent>

        <TabsContent value="rights">
          <DataSubjectRightsPanel />
        </TabsContent>

        <TabsContent value="assessment">
          <ComplianceAssessmentPanel />
        </TabsContent>

        <TabsContent value="incidents">
          <BreachManagementPanel />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrailPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
