/**
 * 🛡️ NEONPRO COMPLIANCE DASHBOARD
 * Comprehensive compliance monitoring interface for LGPD + ANVISA + CFM
 * Real-time metrics, alerts, and regulatory compliance tracking
 */

'use client';

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Database,
  Download,
  FileText,
  RefreshCw,
  Shield,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// =====================================================
// TYPES & INTERFACES
// =====================================================

type ComplianceMetrics = {
  overall_score: number;
  lgpd_compliance: LGPDMetrics;
  anvisa_compliance: ANVISAMetrics;
  data_retention: DataRetentionMetrics;
  audit_trail: AuditTrailMetrics;
  alerts: ComplianceAlert[];
  last_updated: string;
};

type LGPDMetrics = {
  consent_rate: number;
  data_requests_fulfilled: number;
  data_requests_pending: number;
  data_deletion_completed: number;
  privacy_policy_acceptance: number;
  breach_incidents: number;
  compliance_score: number;
};

type ANVISAMetrics = {
  product_registrations: number;
  adverse_events_reported: number;
  procedure_classifications: number;
  equipment_certifications: number;
  compliance_audits_passed: number;
  regulatory_submissions: number;
  compliance_score: number;
};

type DataRetentionMetrics = {
  total_records: number;
  records_scheduled_deletion: number;
  records_deleted_today: number;
  retention_policies_active: number;
  cleanup_jobs_successful: number;
  cleanup_jobs_failed: number;
  compliance_percentage: number;
};

type AuditTrailMetrics = {
  total_audit_entries: number;
  entries_today: number;
  critical_events: number;
  user_access_violations: number;
  data_modification_events: number;
  compliance_events: number;
  system_integrity_score: number;
};

type ComplianceAlert = {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'lgpd' | 'anvisa' | 'data_retention' | 'audit' | 'system';
  title: string;
  description: string;
  severity_score: number;
  created_at: string;
  resolved_at?: string;
  action_required: boolean;
  responsible_team: string;
};

// =====================================================
// COMPLIANCE DASHBOARD COMPONENT
// =====================================================

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // 📊 Fetch compliance metrics
  const fetchMetrics = async (period = selectedPeriod) => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `/api/compliance/metrics?period=${period}&detailed=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch compliance metrics');
      }

      setMetrics(result.data.metrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 Auto-refresh every 5 minutes
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(() => fetchMetrics(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // 📈 Get score color for UI
  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return 'text-green-600';
    }
    if (score >= 80) {
      return 'text-yellow-600';
    }
    if (score >= 70) {
      return 'text-orange-600';
    }
    return 'text-red-600';
  };

  // 🎨 Get badge variant for alert type
  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // 📊 Export metrics to CSV
  const exportMetrics = async () => {
    try {
      const response = await fetch('/api/compliance/metrics?format=csv');
      const csvData = await response.text();

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-metrics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (_error) {}
  };

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">
            Calculando métricas de compliance...
          </p>
        </div>
      </div>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <Alert className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Compliance</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            className="ml-4"
            onClick={() => fetchMetrics()}
            size="sm"
            variant="outline"
          >
            Tentar Novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return null;
  }

  // 📊 Prepare chart data
  const overviewChartData = [
    {
      name: 'LGPD',
      score: metrics.lgpd_compliance.compliance_score,
      color: '#3b82f6',
    },
    {
      name: 'ANVISA',
      score: metrics.anvisa_compliance.compliance_score,
      color: '#10b981',
    },
    {
      name: 'Retenção',
      score: metrics.data_retention.compliance_percentage,
      color: '#f59e0b',
    },
    {
      name: 'Auditoria',
      score: metrics.audit_trail.system_integrity_score,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de conformidade LGPD + ANVISA + CFM
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <select
            className="rounded-md border bg-background px-3 py-2"
            onChange={(e) => setSelectedPeriod(e.target.value)}
            value={selectedPeriod}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>

          {/* Action buttons */}
          <Button
            disabled={refreshing}
            onClick={() => fetchMetrics()}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>

          <Button onClick={exportMetrics} size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Score Geral de Compliance
          </CardTitle>
          <CardDescription>
            Atualizado em{' '}
            {new Date(metrics.last_updated).toLocaleString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div
                className={`font-bold text-4xl ${getScoreColor(metrics.overall_score)}`}
              >
                {metrics.overall_score}%
              </div>
              <p className="text-muted-foreground text-sm">Score Overall</p>
            </div>

            <div className="flex-1">
              <Progress className="h-3" value={metrics.overall_score} />
            </div>

            <div className="text-right">
              <Badge
                variant={
                  metrics.overall_score >= 80 ? 'default' : 'destructive'
                }
              >
                {metrics.overall_score >= 90
                  ? 'Excelente'
                  : metrics.overall_score >= 80
                    ? 'Bom'
                    : metrics.overall_score >= 70
                      ? 'Aceitável'
                      : 'Atenção Necessária'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Panel */}
      {metrics.alerts && metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertas de Compliance ({metrics.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.alerts.slice(0, 5).map((alert) => (
                <Alert className="relative" key={alert.id}>
                  <div className="flex items-start gap-3">
                    <Badge
                      className="mt-1"
                      variant={getAlertVariant(alert.type)}
                    >
                      {alert.type.toUpperCase()}
                    </Badge>
                    <div className="flex-1">
                      <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                      <AlertDescription className="text-xs">
                        {alert.description}
                      </AlertDescription>
                      <div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
                        <span>{alert.responsible_team}</span>
                        <span>•</span>
                        <span>
                          {new Date(alert.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                        {alert.action_required && (
                          <>
                            <span>•</span>
                            <Badge className="text-xs" variant="outline">
                              Ação Necessária
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Tabs */}
      <Tabs className="space-y-4" defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="lgpd">LGPD</TabsTrigger>
          <TabsTrigger value="anvisa">ANVISA</TabsTrigger>
          <TabsTrigger value="retention">Retenção de Dados</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent className="space-y-6" value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Compliance Scores Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Scores por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={overviewChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-bold text-2xl">
                        {metrics.lgpd_compliance.consent_rate}%
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Taxa de Consentimento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-bold text-2xl">
                        {metrics.anvisa_compliance.product_registrations}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Produtos Registrados
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-bold text-2xl">
                        {metrics.data_retention.cleanup_jobs_successful}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Jobs de Limpeza OK
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-bold text-2xl">
                        {metrics.audit_trail.entries_today}
                      </p>
                      <p className="text-muted-foreground text-sm">Logs Hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* LGPD Tab */}
        <TabsContent className="space-y-6" value="lgpd">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consentimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Taxa de Consentimento</span>
                    <span className="font-semibold">
                      {metrics.lgpd_compliance.consent_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Política de Privacidade</span>
                    <span className="font-semibold">
                      {metrics.lgpd_compliance.privacy_policy_acceptance}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Direitos dos Titulares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Solicitações Atendidas</span>
                    <span className="font-semibold">
                      {metrics.lgpd_compliance.data_requests_fulfilled}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solicitações Pendentes</span>
                    <span className="font-semibold text-yellow-600">
                      {metrics.lgpd_compliance.data_requests_pending}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deleções Concluídas</span>
                    <span className="font-semibold">
                      {metrics.lgpd_compliance.data_deletion_completed}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Incidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Vazamentos de Dados</span>
                    <span
                      className={`font-semibold ${metrics.lgpd_compliance.breach_incidents === 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metrics.lgpd_compliance.breach_incidents}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score LGPD</span>
                    <span
                      className={`font-semibold ${getScoreColor(metrics.lgpd_compliance.compliance_score)}`}
                    >
                      {metrics.lgpd_compliance.compliance_score}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ANVISA Tab */}
        <TabsContent className="space-y-6" value="anvisa">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Registros e Certificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Produtos Registrados</span>
                    <span className="font-semibold">
                      {metrics.anvisa_compliance.product_registrations}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipamentos Certificados</span>
                    <span className="font-semibold">
                      {metrics.anvisa_compliance.equipment_certifications}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Classificações de Procedimentos</span>
                    <span className="font-semibold">
                      {metrics.anvisa_compliance.procedure_classifications}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Auditoria e Submissões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Auditorias Aprovadas</span>
                    <span className="font-semibold text-green-600">
                      {metrics.anvisa_compliance.compliance_audits_passed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eventos Adversos Reportados</span>
                    <span className="font-semibold">
                      {metrics.anvisa_compliance.adverse_events_reported}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score ANVISA</span>
                    <span
                      className={`font-semibold ${getScoreColor(metrics.anvisa_compliance.compliance_score)}`}
                    >
                      {metrics.anvisa_compliance.compliance_score}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Retention Tab */}
        <TabsContent className="space-y-6" value="retention">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status de Retenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total de Registros</span>
                    <span className="font-semibold">
                      {metrics.data_retention.total_records.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agendados para Deleção</span>
                    <span className="font-semibold">
                      {metrics.data_retention.records_scheduled_deletion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deletados Hoje</span>
                    <span className="font-semibold text-green-600">
                      {metrics.data_retention.records_deleted_today}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Políticas Ativas</span>
                    <span className="font-semibold">
                      {metrics.data_retention.retention_policies_active}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Jobs de Limpeza</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Jobs Bem-sucedidos</span>
                    <span className="font-semibold text-green-600">
                      {metrics.data_retention.cleanup_jobs_successful}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jobs Falhou</span>
                    <span
                      className={`font-semibold ${metrics.data_retention.cleanup_jobs_failed === 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metrics.data_retention.cleanup_jobs_failed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>% de Compliance</span>
                    <span
                      className={`font-semibold ${getScoreColor(metrics.data_retention.compliance_percentage)}`}
                    >
                      {metrics.data_retention.compliance_percentage}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent className="space-y-6" value="audit">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Atividade de Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total de Logs</span>
                    <span className="font-semibold">
                      {metrics.audit_trail.total_audit_entries.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logs Hoje</span>
                    <span className="font-semibold">
                      {metrics.audit_trail.entries_today}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eventos Críticos</span>
                    <span
                      className={`font-semibold ${metrics.audit_trail.critical_events === 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metrics.audit_trail.critical_events}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Integridade do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Violações de Acesso</span>
                    <span
                      className={`font-semibold ${metrics.audit_trail.user_access_violations === 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metrics.audit_trail.user_access_violations}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modificações de Dados</span>
                    <span className="font-semibold">
                      {metrics.audit_trail.data_modification_events}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score de Integridade</span>
                    <span
                      className={`font-semibold ${getScoreColor(metrics.audit_trail.system_integrity_score)}`}
                    >
                      {metrics.audit_trail.system_integrity_score}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
