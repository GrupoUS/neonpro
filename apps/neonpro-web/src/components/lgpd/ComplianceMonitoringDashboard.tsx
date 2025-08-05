/**
 * LGPD Compliance Monitoring Dashboard Component
 *
 * Real-time compliance monitoring interface for healthcare administrators
 * with violations, alerts, metrics, and recommendations management.
 */

"use client";

import type {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileText,
  Info,
  Lightbulb,
  Lock,
  Play,
  RefreshCw,
  Shield,
  Square,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type {
  ComplianceCategory,
  ComplianceViolation,
  ViolationType,
} from "@/app/lib/lgpd/monitoring/compliance-monitoring";
import type {
  useComplianceAlerts,
  useComplianceMetrics,
  useComplianceMonitoring,
  useComplianceRecommendations,
  useComplianceViolations,
} from "@/app/lib/lgpd/monitoring/use-compliance-monitoring";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";

interface ComplianceMonitoringDashboardProps {
  className?: string;
}

export function ComplianceMonitoringDashboard({ className }: ComplianceMonitoringDashboardProps) {
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

  const { metrics, getComplianceLevelColor, getComplianceLevelText } = useComplianceMetrics();

  const {
    violations,
    getViolationsByType,
    getCriticalViolations,
    getViolationTypeText,
    getSeverityColor,
  } = useComplianceViolations();

  const { alerts, getUnacknowledgedAlerts, getCriticalAlerts, getAlertSeverityColor } =
    useComplianceAlerts();

  const { recommendations, getCriticalRecommendations, getPriorityColor } =
    useComplianceRecommendations();

  // Dialog states
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<ComplianceViolation | null>(null);

  // Form states
  const [violationForm, setViolationForm] = useState({
    type: "" as ViolationType | "",
    category: "" as ComplianceCategory | "",
    description: "",
    severity: "medium",
    affectedData: "",
    potentialImpact: "",
  });

  const [resolutionForm, setResolutionForm] = useState({
    resolution: "",
    responsible: "",
  });

  // Start monitoring on component mount
  useEffect(() => {
    if (!isMonitoring && !isLoading) {
      startMonitoring();
    }
  }, [isMonitoring, isLoading, startMonitoring]);

  // Handle violation reporting
  const handleReportViolation = async () => {
    if (!violationForm.type || !violationForm.category || !violationForm.description) {
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
      type: "",
      category: "",
      description: "",
      severity: "medium",
      affectedData: "",
      potentialImpact: "",
    });
    setViolationDialogOpen(false);
  };

  // Handle violation resolution
  const handleResolveViolation = async () => {
    if (!selectedViolation || !resolutionForm.resolution || !resolutionForm.responsible) {
      return;
    }

    await resolveViolation(
      selectedViolation.id,
      resolutionForm.resolution,
      resolutionForm.responsible,
    );

    setSelectedViolation(null);
    setResolutionForm({ resolution: "", responsible: "" });
    setResolveDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando monitoramento de conformidade...</span>
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
          <h1 className="text-3xl font-bold">Monitoramento LGPD</h1>
          <p className="text-muted-foreground">
            Dashboard em tempo real para conformidade e monitoramento de dados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={triggerAssessment} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            Executar Avaliação
          </Button>
          {isMonitoring ? (
            <Button variant="destructive" size="sm" onClick={stopMonitoring}>
              <Square className="h-4 w-4 mr-2" />
              Parar Monitoramento
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={startMonitoring}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Monitoramento
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status de Conformidade</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics && (
                <span className={getComplianceLevelColor(metrics.overallComplianceLevel)}>
                  {getComplianceLevelText(metrics.overallComplianceLevel)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Score: {metrics?.overallScore.toFixed(1)}%
            </p>
            {metrics && <Progress value={metrics.overallScore} className="mt-2" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violações Ativas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violations.length}</div>
            <p className="text-xs text-muted-foreground">{criticalViolations.length} críticas</p>
            {criticalViolations.length > 0 && (
              <Badge variant="destructive" className="mt-2">
                Ação Imediata Necessária
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Não Confirmados</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unacknowledgedAlerts.length}</div>
            <p className="text-xs text-muted-foreground">{criticalAlerts.length} críticos</p>
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="mt-2">
                Crítico
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalRecommendations.length} prioritárias
            </p>
            {criticalRecommendations.length > 0 && (
              <Badge variant="secondary" className="mt-2">
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
            Existem {criticalViolations.length} violações críticas e {criticalAlerts.length} alertas
            críticos que requerem atenção imediata. Verifique as abas correspondentes para mais
            detalhes.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="violations">
            Violações
            {criticalViolations.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {criticalViolations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>{" "}
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Compliance Score Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento da Conformidade</CardTitle>
                <CardDescription>Pontuação detalhada por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Consentimento</span>
                        <span>{metrics.consentScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.consentScore} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Acesso e Portabilidade</span>
                        <span>{metrics.accessScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.accessScore} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Retenção</span>
                        <span>{metrics.retentionScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.retentionScore} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Auditoria</span>
                        <span>{metrics.auditScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.auditScore} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Segurança</span>
                        <span>{metrics.securityScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.securityScore} className="mt-1" />
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
                    <div key={violation.id} className="flex items-start space-x-3">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getViolationTypeText(violation.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(violation.detectedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(violation.severity)}>
                        {violation.severity}
                      </Badge>
                    </div>
                  ))}
                  {alerts.slice(0, 2).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <Bell className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={getAlertSeverityColor(alert.severity)}>
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
        <TabsContent value="violations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Violações de Conformidade</h3>
            <Dialog open={violationDialogOpen} onOpenChange={setViolationDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <AlertTriangle className="h-4 w-4 mr-2" />
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
                      value={violationForm.type}
                      onValueChange={(value) =>
                        setViolationForm((prev) => ({ ...prev, type: value as ViolationType }))
                      }
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
                        <SelectItem value={ViolationType.RESPONSE_TIME_VIOLATION}>
                          Violação de Prazo
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="violation-category">Categoria</Label>
                    <Select
                      value={violationForm.category}
                      onValueChange={(value) =>
                        setViolationForm((prev) => ({
                          ...prev,
                          category: value as ComplianceCategory,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ComplianceCategory.CONSENT}>Consentimento</SelectItem>
                        <SelectItem value={ComplianceCategory.DATA_ACCESS}>
                          Acesso a Dados
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.DATA_RETENTION}>
                          Retenção de Dados
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.AUDIT_TRAIL}>
                          Trilha de Auditoria
                        </SelectItem>
                        <SelectItem value={ComplianceCategory.SECURITY}>Segurança</SelectItem>
                        <SelectItem value={ComplianceCategory.DISCLOSURE}>Divulgação</SelectItem>
                        <SelectItem value={ComplianceCategory.RESPONSE_TIME}>
                          Tempo de Resposta
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="violation-severity">Severidade</Label>
                    <Select
                      value={violationForm.severity}
                      onValueChange={(value) =>
                        setViolationForm((prev) => ({ ...prev, severity: value }))
                      }
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
                      placeholder="Descreva a violação..."
                      value={violationForm.description}
                      onChange={(e) =>
                        setViolationForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="affected-data">Dados Afetados</Label>
                    <Input
                      id="affected-data"
                      placeholder="Quais dados foram afetados..."
                      value={violationForm.affectedData}
                      onChange={(e) =>
                        setViolationForm((prev) => ({ ...prev, affectedData: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="potential-impact">Impacto Potencial</Label>
                    <Textarea
                      id="potential-impact"
                      placeholder="Descreva o impacto potencial..."
                      value={violationForm.potentialImpact}
                      onChange={(e) =>
                        setViolationForm((prev) => ({ ...prev, potentialImpact: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleReportViolation}
                    disabled={
                      !violationForm.type || !violationForm.category || !violationForm.description
                    }
                  >
                    Reportar Violação
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {violations.map((violation) => (
              <Card key={violation.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {getViolationTypeText(violation.type)}
                      </CardTitle>
                      <CardDescription>
                        Detectada em {new Date(violation.detectedAt).toLocaleString()}
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
                  <p className="text-sm text-muted-foreground mb-3">{violation.description}</p>
                  {violation.affectedData && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Dados Afetados: </span>
                      <span className="text-sm">{violation.affectedData}</span>
                    </div>
                  )}
                  {violation.potentialImpact && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Impacto Potencial: </span>
                      <span className="text-sm">{violation.potentialImpact}</span>
                    </div>
                  )}
                  {violation.status === "pending" && (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedViolation(violation);
                          setResolveDialogOpen(true);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Resolver
                      </Button>
                    </div>
                  )}
                  {violation.status === "resolved" && violation.resolution && (
                    <div className="bg-green-50 p-3 rounded-md mt-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Resolução:</p>
                          <p className="text-sm text-green-700">{violation.resolution}</p>
                          {violation.resolvedBy && (
                            <p className="text-xs text-green-600 mt-1">
                              Resolvido por: {violation.resolvedBy} em{" "}
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
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Alertas do Sistema</h3>
          </div>

          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {alert.severity === "critical" && (
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      {alert.severity === "error" && (
                        <XCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                      )}
                      {alert.severity === "warning" && (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )}
                      {alert.severity === "info" && (
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                      <div>
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                        <CardDescription>
                          {new Date(alert.timestamp).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getAlertSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {alert.acknowledged && <Badge variant="outline">Confirmado</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-sm font-medium mb-2">Detalhes:</p>
                      <div className="space-y-1">
                        {Object.entries(alert.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
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
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id, "Admin")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmar
                      </Button>
                    </div>
                  )}
                  {alert.acknowledged && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Alerta confirmado por: {alert.acknowledgedBy}
                          </p>
                          {alert.acknowledgedAt && (
                            <p className="text-xs text-blue-600">
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
        </TabsContent>{" "}
        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <h3 className="text-lg font-semibold">Métricas Detalhadas</h3>

          {metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conformidade Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{metrics.overallScore.toFixed(1)}%</div>
                  <Progress value={metrics.overallScore} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nível: {getComplianceLevelText(metrics.overallComplianceLevel)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Consentimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{metrics.consentScore.toFixed(1)}%</div>
                  <Progress value={metrics.consentScore} className="mb-2" />
                  <div className="text-xs space-y-1">
                    <div>Válidos: {metrics.consentMetrics.validConsents}</div>
                    <div>Expirados: {metrics.consentMetrics.expiredConsents}</div>
                    <div>Revogados: {metrics.consentMetrics.revokedConsents}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Acesso a Dados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{metrics.accessScore.toFixed(1)}%</div>
                  <Progress value={metrics.accessScore} className="mb-2" />
                  <div className="text-xs space-y-1">
                    <div>Solicitações: {metrics.accessMetrics.totalRequests}</div>
                    <div>Processadas: {metrics.accessMetrics.processedRequests}</div>
                    <div>No Prazo: {metrics.accessMetrics.timelyResponses}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Retenção</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.retentionScore.toFixed(1)}%
                  </div>
                  <Progress value={metrics.retentionScore} className="mb-2" />
                  <div className="text-xs space-y-1">
                    <div>Com Política: {metrics.retentionMetrics.recordsWithPolicy}</div>
                    <div>A Expirar: {metrics.retentionMetrics.recordsNearExpiry}</div>
                    <div>Expirados: {metrics.retentionMetrics.expiredRecords}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Auditoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{metrics.auditScore.toFixed(1)}%</div>
                  <Progress value={metrics.auditScore} className="mb-2" />
                  <div className="text-xs space-y-1">
                    <div>Eventos Hoje: {metrics.auditMetrics.eventsToday}</div>
                    <div>Falhas: {metrics.auditMetrics.failedEvents}</div>
                    <div>
                      Cobertura: {(metrics.auditMetrics.coveragePercentage * 100).toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{metrics.securityScore.toFixed(1)}%</div>
                  <Progress value={metrics.securityScore} className="mb-2" />
                  <div className="text-xs space-y-1">
                    <div>Incidentes: {metrics.securityMetrics.securityIncidents}</div>
                    <div>Acessos Não Autorizados: {metrics.securityMetrics.unauthorizedAccess}</div>
                    <div>
                      Criptografia: {(metrics.securityMetrics.encryptionCoverage * 100).toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recomendações de Melhoria</h3>
          </div>

          <div className="grid gap-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <CardTitle className="text-base">{recommendation.title}</CardTitle>
                        <CardDescription>Categoria: {recommendation.category}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
                  {recommendation.actionItems.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-blue-800 mb-2">Ações Recomendadas:</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {recommendation.actionItems.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {recommendation.estimatedImpact && (
                    <div className="mt-3 pt-3 border-t">
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
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resolver Violação</DialogTitle>
            <DialogDescription>Registre a resolução da violação de conformidade</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resolution-description">Descrição da Resolução</Label>
              <Textarea
                id="resolution-description"
                placeholder="Descreva como a violação foi resolvida..."
                value={resolutionForm.resolution}
                onChange={(e) =>
                  setResolutionForm((prev) => ({ ...prev, resolution: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsible-person">Responsável</Label>
              <Input
                id="responsible-person"
                placeholder="Nome do responsável pela resolução"
                value={resolutionForm.responsible}
                onChange={(e) =>
                  setResolutionForm((prev) => ({ ...prev, responsible: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleResolveViolation}
              disabled={!resolutionForm.resolution || !resolutionForm.responsible}
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
