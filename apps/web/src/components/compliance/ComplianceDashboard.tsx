import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
import { ComplianceMetrics, ComplianceReport, ConsentStats } from '@/types/compliance';
import { useHealthcareQuery, useHealthcareMutation } from '@/hooks/useTRPCHealthcare';

interface ComplianceDashboardProps {
  clinicId: string;
  onRefresh?: () => void;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  clinicId,
  onRefresh
}) => {
  // Use tRPC queries for compliance data with healthcare compliance
  const { data: metrics, isLoading: metricsLoading, complianceError: metricsError } = useHealthcareQuery(
    'compliance.getMetrics',
    { clinicId }
  );

  const { data: consentStats, isLoading: statsLoading, complianceError: statsError } = useHealthcareQuery(
    'compliance.getConsentStats',
    { clinicId }
  );

  // Use tRPC mutation for report generation
  const { mutate: generateReport, isLoading: reportLoading, complianceError: reportError } = useHealthcareMutation(
    'compliance.generateReport',
    {
      onSuccess: (reportData: any) => {
        // Download report
        const blob = new Blob([reportData.content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-compliance-${clinicId}-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  );

  const loading = metricsLoading || statsLoading || reportLoading;
  const lastUpdated = new Date();

  const handleReportGeneration = () => {
    generateReport({
      clinicId,
      format: 'pdf',
      includeAudit: true,
      includeMetrics: true,
      period: 'monthly'
    });
  };

  // Show compliance errors
  const complianceErrors = [metricsError, statsError, reportError].filter(Boolean);
  if (complianceErrors.length > 0) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {complianceErrors[0]}
        </AlertDescription>
      </Alert>
    );
  }

  const getComplianceStatus = (score: number) => {
    if (score >= 95) return { status: 'Excelente', color: 'bg-green-500', icon: CheckCircle };
    if (score >= 85) return { status: 'Bom', color: 'bg-yellow-500', icon: AlertTriangle };
    return { status: 'Atenção', color: 'bg-red-500', icon: AlertTriangle };
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: 'default',
      partial: 'secondary',
      non_compliant: 'destructive',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'compliant' && 'Conforme'}
        {status === 'partial' && 'Parcial'}
        {status === 'non_compliant' && 'Não Conforme'}
        {status === 'pending' && 'Pendente'}
      </Badge>
    );
  };

  if (!metrics || !consentStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando dados de compliance...</p>
        </div>
      </div>
    );
  }

  const complianceStatus = getComplianceStatus(metrics.overallScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Compliance LGPD</h1>
          <p className="text-gray-600">
            Última atualização: {lastUpdated.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadComplianceData}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={generateReport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Compliance Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Pontuação de Compliance Geral
          </CardTitle>
          <CardDescription>
            Avaliação do nível de conformidade com LGPD e regulamentos de saúde
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="text-4xl font-bold">{metrics.overallScore}%</div>
                <div className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${complianceStatus.color}`} />
              </div>
              <div>
                <div className="text-lg font-semibold">{complianceStatus.status}</div>
                <Progress value={metrics.overallScore} className="w-48 mt-2" />
              </div>
            </div>
            <complianceStatus.icon className={`h-12 w-12 ${complianceStatus.color.replace('bg-', 'text-')}`} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatórios</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{consentStats.activePatients}</div>
                <p className="text-xs text-muted-foreground">
                  {consentStats.totalPatients} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Consentimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{consentStats.consentRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {consentStats.consentedPatients} consentiram
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Direitos do titular
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Incidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.incidentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Regulatory Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Conformidade Regulatória</CardTitle>
              <CardDescription>
                Status perante órgãos reguladores brasileiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.regulatoryCompliance.map((reg) => (
                  <div key={reg.regulator} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{reg.regulator}</div>
                        <div className="text-sm text-gray-600">{reg.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={reg.score} className="w-24" />
                      <span className="text-sm font-medium">{reg.score}%</span>
                      {getStatusBadge(reg.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Consentimento</CardTitle>
              <CardDescription>
                Análise detalhada dos consentimentos por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentStats.byCategory.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-gray-600">
                          {category.consented} de {category.total} pacientes
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(category.consented / category.total) * 100} className="w-24" />
                      <span className="text-sm font-medium">
                        {Math.round((category.consented / category.total) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consentStats.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{activity.description}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisitos LGPD</CardTitle>
              <CardDescription>
                Monitoramento dos artigos e requisitos da LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.lgpdRequirements.map((req) => (
                  <div key={req.article} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Artigo {req.article}</div>
                      <div className="text-sm text-gray-600">{req.description}</div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.securityValidations.map((validation) => (
                  <div key={validation.check} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{validation.check}</div>
                      <div className="text-sm text-gray-600">{validation.details}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {validation.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trilha de Auditoria</CardTitle>
              <CardDescription>
                Registro completo de atividades de compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.auditTrail.map((audit) => (
                  <div key={audit.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{audit.action}</div>
                        <div className="text-sm text-gray-600">
                          {audit.user} - {audit.details}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{audit.timestamp}</div>
                        {getStatusBadge(audit.complianceStatus)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Todos os registros de auditoria são armazenados com verificação blockchain 
              e criptografia de ponta a ponta para garantir integridade e conformidade.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceDashboard;