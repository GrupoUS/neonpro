/**
 * LGPD Compliance Monitoring Dashboard Component
 *
 * Real-time compliance monitoring interface for healthcare administrators
 * with violations, alerts, metrics, and recommendations management.
 */

'use client';

import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  CheckCircle2,
  FileText,
  Info,
  Lightbulb,
  Play,
  RefreshCw,
  Shield,
  Square,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  ComplianceCategory,
  type ComplianceViolation,
  ViolationType,
} from '@/app/lib/lgpd/monitoring/compliance-monitoring';
import {
  useComplianceAlerts,
  useComplianceMetrics,
  useComplianceMonitoring,
  useComplianceRecommendations,
  useComplianceViolations,
} from '@/app/lib/lgpd/monitoring/use-compliance-monitoring';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type ComplianceMonitoringDashboardProps = {
  className?: string;
};

export function ComplianceMonitoringDashboard({
  className,
}: ComplianceMonitoringDashboardProps) {
  const {
    status,
    isLoading,
    isMonitoring,
    error,
    startMonitoring,
    stopMonitoring,
    refresh,
    reportViolation,
    resolveViolation,
    acknowledgeAlert,
    triggerAssessment,
  } = useComplianceMonitoring();

  const { metrics, getComplianceLevelColor, getComplianceLevelText } =
    useComplianceMetrics();

  const {
    violations,
    getViolationsByType,
    getCriticalViolations,
    getViolationTypeText,
    getSeverityColor,
  } = useComplianceViolations();

  const {
    alerts,
    getUnacknowledgedAlerts,
    getCriticalAlerts,
    getAlertSeverityColor,
  } = useComplianceAlerts();

  const { recommendations, getCriticalRecommendations, getPriorityColor } =
    useComplianceRecommendations();

  // Dialog states
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] =
    useState<ComplianceViolation | null>(null);

  // Form states
  const [violationForm, setViolationForm] = useState({
    type: '' as ViolationType | '',
    category: '' as ComplianceCategory | '',
    description: '',
    severity: 'medium',
    affectedData: '',
    potentialImpact: '',
  });

  const [resolutionForm, setResolutionForm] = useState({
    resolution: '',
    responsible: '',
  });

  // Start monitoring on component mount
  useEffect(() => {
    if (!(isMonitoring || isLoading)) {
      startMonitoring();
    }
  }, [isMonitoring, isLoading, startMonitoring]);

  // Handle violation reporting
  const handleReportViolation = async () => {
    if (
      !(
        violationForm.type &&
        violationForm.category &&
        violationForm.description
      )
    ) {
      return;
    }

    await reportViolation({
      type: violationForm.type as ViolationType,
      category: violationForm.category as ComplianceCategory,
      description: violationForm.description,
      severity: violationForm.severity,
      affectedData: violationForm.affectedData,
      potentialImpact: violationForm.potentialImpact,
    });

    setViolationForm({
      type: '',
      category: '',
      description: '',
      severity: 'medium',
      affectedData: '',
      potentialImpact: '',
    });
    setViolationDialogOpen(false);
  };

  // Handle violation resolution
  const handleResolveViolation = async () => {
    if (
      !(
        selectedViolation &&
        resolutionForm.resolution &&
        resolutionForm.responsible
      )
    ) {
      return;
    }

    await resolveViolation(
      selectedViolation.id,
      resolutionForm.resolution,
      resolutionForm.responsible,
    );

    setSelectedViolation(null);
    setResolutionForm({ resolution: '', responsible: '' });
    setResolveDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">
          Carregando monitoramento de conformidade...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro no Monitoramento</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const criticalViolations = getCriticalViolations();
  const unacknowledgedAlerts = getUnacknowledgedAlerts();
  const criticalAlerts = getCriticalAlerts();
  const criticalRecommendations = getCriticalRecommendations();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Monitoramento LGPD</h1>
          <p className="text-muted-foreground">
            Dashboard em tempo real para conformidade e monitoramento de dados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            disabled={isLoading}
            onClick={refresh}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
          <Button
            disabled={isLoading}
            onClick={triggerAssessment}
            size="sm"
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            Executar Avaliação
          </Button>
          {isMonitoring ? (
            <Button onClick={stopMonitoring} size="sm" variant="destructive">
              <Square className="mr-2 h-4 w-4" />
              Parar Monitoramento
            </Button>
          ) : (
            <Button onClick={startMonitoring} size="sm" variant="default">
              <Play className="mr-2 h-4 w-4" />
              Iniciar Monitoramento
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Status de Conformidade
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {metrics && (
                <span
                  className={getComplianceLevelColor(
                    metrics.overallComplianceLevel,
                  )}
                >
                  {getComplianceLevelText(metrics.overallComplianceLevel)}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Score: {metrics?.overallScore.toFixed(1)}%
            </p>
            {metrics && (
              <Progress className="mt-2" value={metrics.overallScore} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Violações Ativas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{violations.length}</div>
            <p className="text-muted-foreground text-xs">
              {criticalViolations.length} críticas
            </p>
            {criticalViolations.length > 0 && (
              <Badge className="mt-2" variant="destructive">
                Ação Imediata Necessária
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Alertas Não Confirmados
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {unacknowledgedAlerts.length}
            </div>
            <p className="text-muted-foreground text-xs">
              {criticalAlerts.length} críticos
            </p>
            {criticalAlerts.length > 0 && (
              <Badge className="mt-2" variant="destructive">
                Crítico
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Recomendações</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{recommendations.length}</div>
            <p className="text-muted-foreground text-xs">
              {criticalRecommendations.length} prioritárias
            </p>
            {criticalRecommendations.length > 0 && (
              <Badge className="mt-2" variant="secondary">
                Melhorias Disponíveis
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {(criticalViolations.length > 0 || criticalAlerts.length > 0) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção: Problemas Críticos Detectados</AlertTitle>
          <AlertDescription>
            Existem {criticalViolations.length} violações críticas e{' '}
            {criticalAlerts.length} alertas críticos que requerem atenção
            imediata. Verifique as abas correspondentes para mais detalhes.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs className="space-y-4" defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="violations">
            Violações
            {criticalViolations.length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {criticalViolations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {unacknowledgedAlerts.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>{' '}
        {/* Overview Tab */}
        <TabsContent className="space-y-4" value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Compliance Score Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento da Conformidade</CardTitle>
                <CardDescription>
                  Pontuação detalhada por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Consentimento</span>
                        <span>{metrics.consentScore.toFixed(1)}%</span>
                      </div>
                      <Progress className="mt-1" value={metrics.consentScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Acesso e Portabilidade</span>
                        <span>{metrics.accessScore.toFixed(1)}%</span>
                      </div>
                      <Progress className="mt-1" value={metrics.accessScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Retenção</span>
                        <span>{metrics.retentionScore.toFixed(1)}%</span>
                      </div>
                      <Progress
                        className="mt-1"
                        value={metrics.retentionScore}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Auditoria</span>
                        <span>{metrics.auditScore.toFixed(1)}%</span>
                      </div>
                      <Progress className="mt-1" value={metrics.auditScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Segurança</span>
                        <span>{metrics.securityScore.toFixed(1)}%</span>
                      </div>
                      <Progress
                        className="mt-1"
                        value={metrics.securityScore}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas violações e alertas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {violations.slice(0, 3).map((violation) => (
                    <div
                      className="flex items-start space-x-3"
                      key={violation.id}
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {getViolationTypeText(violation.type)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(violation.detectedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        className={getSeverityColor(violation.severity)}
                        variant="outline"
                      >
                        {violation.severity}
                      </Badge>
                    </div>
                  ))}
                  {alerts.slice(0, 2).map((alert) => (
                    <div className="flex items-start space-x-3" key={alert.id}>
                      <Bell className="mt-0.5 h-4 w-4 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {alert.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        className={getAlertSeverityColor(alert.severity)}
                        variant="outline"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Violations Tab */}
        <TabsContent className="space-y-4" value="violations">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Violações de Conformidade</h3>
            <Dialog
              onOpenChange={setViolationDialogOpen}
              open={violationDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reportar Violação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Reportar Nova Violação</DialogTitle>
                  <DialogDescription>
                    Registre uma nova violação de conformidade LGPD
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="violation-type">Tipo de Violação</Label>
                    <Select
                      onValueChange={(value) =>
                        setViolationForm((prev) => ({
                          ...prev,
                          type: value as ViolationType,
                        }))
                      }
                      value={violationForm.type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ViolationType.CONSENT_VIOLATION}>
                          Violação de Consentimento
                        </SelectItem>
                        <SelectItem value={ViolationType.DATA_ACCESS_VIOLATION}>
                          Violação de Acesso a Dados
                        </SelectItem>
                        <SelectItem value={ViolationType.RETENTION_VIOLATION}>
                          Violação de Retenção
                        </SelectItem>
                        <SelectItem value={ViolationType.AUDIT_VIOLATION}>
                          Violação de Auditoria
                        </SelectItem>
                        <SelectItem value={ViolationType.DISCLOSURE_VIOLATION}>
                          Violação de Divulgação
                        </SelectItem>
                        <SelectItem value={ViolationType.SECURITY_VIOLATION}>
                          Violação de Segurança
                        </SelectItem>
                        <SelectItem
                          value={ViolationType.RESPONSE_TIME_VIOLATION}
                        >
                          Violação de Prazo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="violation-category">Categoria</Label>
                    <Select
                      onValueChange={(value) =>
                        setViolationForm((prev) => ({
                          ...prev,
                          category: value as ComplianceCategory,
                        }))
                      }
                      value={violationForm.category}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ComplianceCategory.CONSENT}>
                          Consentimento
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.DATA_ACCESS}>
                          Acesso a Dados
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.DATA_RETENTION}>
                          Retenção de Dados
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.AUDIT_TRAIL}>
                          Trilha de Auditoria
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.SECURITY}>
                          Segurança
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.DISCLOSURE}>
                          Divulgação
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.RESPONSE_TIME}>
                          Tempo de Resposta
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="violation-severity">Severidade</Label>
                    <Select
                      onValueChange={(value) =>
                        setViolationForm((prev) => ({
                          ...prev,
                          severity: value,
                        }))
                      }
                      value={violationForm.severity}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="violation-description">Descrição</Label>
                    <Textarea
                      id="violation-description"
                      onChange={(e) =>
                        setViolationForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Descreva a violação..."
                      value={violationForm.description}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="affected-data">Dados Afetados</Label>
                    <Input
                      id="affected-data"
                      onChange={(e) =>
                        setViolationForm((prev) => ({
                          ...prev,
                          affectedData: e.target.value,
                        }))
                      }
                      placeholder="Quais dados foram afetados..."
                      value={violationForm.affectedData}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="potential-impact">Impacto Potencial</Label>
                    <Textarea
                      id="potential-impact"
                      onChange={(e) =>
                        setViolationForm((prev) => ({
                          ...prev,
                          potentialImpact: e.target.value,
                        }))
                      }
                      placeholder="Descreva o impacto potencial..."
                      value={violationForm.potentialImpact}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    disabled={
                      !(
                        violationForm.type &&
                        violationForm.category &&
                        violationForm.description
                      )
                    }
                    onClick={handleReportViolation}
                    type="submit"
                  >
                    Reportar Violação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {violations.map((violation) => (
              <Card className="relative" key={violation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {getViolationTypeText(violation.type)}
                      </CardTitle>
                      <CardDescription>
                        Detectada em{' '}
                        {new Date(violation.detectedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(violation.severity)}>
                        {violation.severity}
                      </Badge>
                      <Badge variant="outline">{violation.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {violation.description}
                  </p>
                  {violation.affectedData && (
                    <div className="mb-2">
                      <span className="font-medium text-sm">
                        Dados Afetados:{' '}
                      </span>
                      <span className="text-sm">{violation.affectedData}</span>
                    </div>
                  )}
                  {violation.potentialImpact && (
                    <div className="mb-3">
                      <span className="font-medium text-sm">
                        Impacto Potencial:{' '}
                      </span>
                      <span className="text-sm">
                        {violation.potentialImpact}
                      </span>
                    </div>
                  )}
                  {violation.status === 'pending' && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setSelectedViolation(violation);
                          setResolveDialogOpen(true);
                        }}
                        size="sm"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Resolver
                      </Button>
                    </div>
                  )}
                  {violation.status === 'resolved' && violation.resolution && (
                    <div className="mt-3 rounded-md bg-green-50 p-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 text-sm">
                            Resolução:
                          </p>
                          <p className="text-green-700 text-sm">
                            {violation.resolution}
                          </p>
                          {violation.resolvedBy && (
                            <p className="mt-1 text-green-600 text-xs">
                              Resolvido por: {violation.resolvedBy} em{' '}
                              {violation.resolvedAt &&
                                new Date(violation.resolvedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Alerts Tab */}
        <TabsContent className="space-y-4" value="alerts">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Alertas do Sistema</h3>
          </div>

          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card className="relative" key={alert.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {alert.severity === 'critical' && (
                        <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                      )}
                      {alert.severity === 'error' && (
                        <XCircle className="mt-0.5 h-5 w-5 text-orange-500" />
                      )}
                      {alert.severity === 'warning' && (
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-500" />
                      )}
                      {alert.severity === 'info' && (
                        <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <CardTitle className="text-base">
                          {alert.title}
                        </CardTitle>
                        <CardDescription>
                          {new Date(alert.timestamp).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getAlertSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="outline">Confirmado</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {alert.message}
                  </p>
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <div className="mb-3 rounded-md bg-gray-50 p-3">
                      <p className="mb-2 font-medium text-sm">Detalhes:</p>
                      <div className="space-y-1">
                        {Object.entries(alert.metadata).map(([key, value]) => (
                          <div
                            className="flex justify-between text-sm"
                            key={key}
                          >
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!alert.acknowledged && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => acknowledgeAlert(alert.id, 'Admin')}
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirmar
                      </Button>
                    </div>
                  )}
                  {alert.acknowledged && (
                    <div className="rounded-md bg-blue-50 p-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800 text-sm">
                            Alerta confirmado por: {alert.acknowledgedBy}
                          </p>
                          {alert.acknowledgedAt && (
                            <p className="text-blue-600 text-xs">
                              {new Date(alert.acknowledgedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>{' '}
        {/* Metrics Tab */}
        <TabsContent className="space-y-4" value="metrics">
          <h3 className="font-semibold text-lg">Métricas Detalhadas</h3>

          {metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conformidade Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 font-bold text-3xl">
                    {metrics.overallScore.toFixed(1)}%
                  </div>
                  <Progress className="mb-2" value={metrics.overallScore} />
                  <p className="text-muted-foreground text-sm">
                    Nível:{' '}
                    {getComplianceLevelText(metrics.overallComplianceLevel)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Consentimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 font-bold text-3xl">
                    {metrics.consentScore.toFixed(1)}%
                  </div>
                  <Progress className="mb-2" value={metrics.consentScore} />
                  <div className="space-y-1 text-xs">
                    <div>Válidos: {metrics.consentMetrics.validConsents}</div>
                    <div>
                      Expirados: {metrics.consentMetrics.expiredConsents}
                    </div>
                    <div>
                      Revogados: {metrics.consentMetrics.revokedConsents}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Acesso a Dados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 font-bold text-3xl">
                    {metrics.accessScore.toFixed(1)}%
                  </div>
                  <Progress className="mb-2" value={metrics.accessScore} />
                  <div className="space-y-1 text-xs">
                    <div>
                      Solicitações: {metrics.accessMetrics.totalRequests}
                    </div>
                    <div>
                      Processadas: {metrics.accessMetrics.processedRequests}
                    </div>
                    <div>No Prazo: {metrics.accessMetrics.timelyResponses}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Retenção</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 font-bold text-3xl">
                    {metrics.retentionScore.toFixed(1)}%
                  </div>
                  <Progress className="mb-2" value={metrics.retentionScore} />
                  <div className="space-y-1 text-xs">
                    <div>
                      Com Política: {metrics.retentionMetrics.recordsWithPolicy}
                    </div>
                    <div>
                      A Expirar: {metrics.retentionMetrics.recordsNearExpiry}
                    </div>
                    <div>
                      Expirados: {metrics.retentionMetrics.expiredRecords}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Auditoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 font-bold text-3xl">
                    {metrics.auditScore.toFixed(1)}%
                  </div>
                  <Progress className="mb-2" value={metrics.auditScore} />
                  <div className="space-y-1 text-xs">
                    <div>Eventos Hoje: {metrics.auditMetrics.eventsToday}</div>
                    <div>Falhas: {metrics.auditMetrics.failedEvents}</div>
                    <div>
                      Cobertura:{' '}
                      {(metrics.auditMetrics.coveragePercentage * 100).toFixed(
                        1,
                      )}
                      %
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 font-bold text-3xl">
                    {metrics.securityScore.toFixed(1)}%
                  </div>
                  <Progress className="mb-2" value={metrics.securityScore} />
                  <div className="space-y-1 text-xs">
                    <div>
                      Incidentes: {metrics.securityMetrics.securityIncidents}
                    </div>
                    <div>
                      Acessos Não Autorizados:{' '}
                      {metrics.securityMetrics.unauthorizedAccess}
                    </div>
                    <div>
                      Criptografia:{' '}
                      {(
                        metrics.securityMetrics.encryptionCoverage * 100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        {/* Recommendations Tab */}
        <TabsContent className="space-y-4" value="recommendations">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Recomendações de Melhoria</h3>
          </div>

          <div className="grid gap-4">
            {recommendations.map((recommendation) => (
              <Card className="relative" key={recommendation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="mt-0.5 h-5 w-5 text-yellow-500" />
                      <div>
                        <CardTitle className="text-base">
                          {recommendation.title}
                        </CardTitle>
                        <CardDescription>
                          Categoria: {recommendation.category}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={getPriorityColor(recommendation.priority)}
                    >
                      {recommendation.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-muted-foreground text-sm">
                    {recommendation.description}
                  </p>
                  {recommendation.actionItems.length > 0 && (
                    <div className="rounded-md bg-blue-50 p-3">
                      <p className="mb-2 font-medium text-blue-800 text-sm">
                        Ações Recomendadas:
                      </p>
                      <ul className="space-y-1 text-blue-700 text-sm">
                        {recommendation.actionItems.map((action, index) => (
                          <li
                            className="flex items-start space-x-2"
                            key={index}
                          >
                            <span className="text-blue-500">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recommendation.estimatedImpact && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-sm">
                        <span className="font-medium">Impacto Estimado: </span>
                        {recommendation.estimatedImpact}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Resolution Dialog */}
      <Dialog onOpenChange={setResolveDialogOpen} open={resolveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resolver Violação</DialogTitle>
            <DialogDescription>
              Registre a resolução da violação de conformidade
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resolution-description">
                Descrição da Resolução
              </Label>
              <Textarea
                id="resolution-description"
                onChange={(e) =>
                  setResolutionForm((prev) => ({
                    ...prev,
                    resolution: e.target.value,
                  }))
                }
                placeholder="Descreva como a violação foi resolvida..."
                value={resolutionForm.resolution}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsible-person">Responsável</Label>
              <Input
                id="responsible-person"
                onChange={(e) =>
                  setResolutionForm((prev) => ({
                    ...prev,
                    responsible: e.target.value,
                  }))
                }
                placeholder="Nome do responsável pela resolução"
                value={resolutionForm.responsible}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setResolveDialogOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              disabled={
                !(resolutionForm.resolution && resolutionForm.responsible)
              }
              onClick={handleResolveViolation}
            >
              Resolver Violação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ComplianceMonitoringDashboard;
