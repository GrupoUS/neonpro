// ================================================
// COMPLIANCE AUTOMATION DASHBOARD - ENHANCED
// Advanced compliance automation dashboard with React hooks
// ================================================

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui/card';
import { Button } from '@neonpro/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@neonpro/ui/alert';
import { Badge } from '@neonpro/ui/badge';
import { Progress } from '@neonpro/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@neonpro/ui/tabs';
import { RefreshCw, Shield, AlertCircle, CheckCircle, FileText, Download, Settings, Activity } from 'lucide-react';
import { 
  useComplianceStatus, 
  useDataClassification, 
  useDataSubjectRequests,
  useSoftwareValidation,
  useProfessionalValidation,
  useComplianceAlerts,
  useComplianceReport
} from '@neonpro/domain';

// ================================================
// TYPES AND INTERFACES
// ================================================

interface ComplianceAutomationDashboardProps {
  clinicId?: string;
}

interface StatusCardProps {
  title: string;
  value: number;
  status: string;
  icon: React.ReactNode;
  color: 'success' | 'warning' | 'error' | 'info';
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'compliant':
    case 'active':
    case 'completed':
      return 'bg-green-500';
    case 'warning':
    case 'pending':
      return 'bg-yellow-500';
    case 'non_compliant':
    case 'error':
    case 'failed':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Data inválida';
  }
};

// ================================================
// STATUS CARD COMPONENT
// ================================================

const StatusCard: React.FC<StatusCardProps> = ({ title, value, status, icon, color }) => {
  const colorClasses = {
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50'
  };

  return (
    <Card className={`${colorClasses[color]} transition-all hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="h-4 w-4 text-gray-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}%</div>
        <p className="text-xs text-gray-500 mt-1">
          Status: <span className="font-medium">{status}</span>
        </p>
      </CardContent>
    </Card>
  );
};

// ================================================
// MAIN COMPONENT
// ================================================

export const ComplianceAutomationDashboard: React.FC<ComplianceAutomationDashboardProps> = ({ 
  clinicId 
}) => {
  // Hooks for compliance status and operations
  const { status, alerts, loading, error, lastRefresh, refresh } = useComplianceStatus(clinicId, true);
  const { classifyData, loading: classifyLoading } = useDataClassification();
  const { createRequest, loading: requestLoading } = useDataSubjectRequests();
  const { validateSoftware, loading: softwareLoading } = useSoftwareValidation();
  const { validateProfessional, loading: professionalLoading } = useProfessionalValidation();
  const { createAlert, loading: alertLoading } = useComplianceAlerts();
  const { generateReport, loading: reportLoading } = useComplianceReport();

  // ================================================
  // EVENT HANDLERS
  // ================================================

  const handleQuickDataClassification = async () => {
    try {
      await classifyData({
        tableName: 'patients',
        columnName: 'cpf',
        overrideClassification: {
          category: 'sensitive',
          sensitivity: 5,
          encryptionRequired: true,
          retentionDays: 2555 // 7 years
        }
      });
      
      await refresh(); // Refresh status after operation
    } catch (err) {
      console.error('Failed to classify data:', err);
    }
  };

  const handleQuickSoftwareValidation = async () => {
    try {
      await validateSoftware({
        softwareItemName: 'NeonPro Core System',
        softwareVersion: '1.0.0',
        changeDescription: 'Initial system deployment',
        safetyClassification: 'B',
        riskAssessmentRequired: true
      });
      
      await refresh(); // Refresh status after operation
    } catch (err) {
      console.error('Failed to validate software:', err);
    }
  };

  const handleCreateTestAlert = async () => {
    try {
      await createAlert({
        alertType: 'system_test',
        severity: 'low',
        clinicId,
        description: 'Teste do sistema de alertas de compliance',
        affectedSystems: ['dashboard'],
        autoResolve: true
      });
      
      await refresh(); // Refresh status after operation
    } catch (err) {
      console.error('Failed to create test alert:', err);
    }
  };

  const handleGenerateComprehensiveReport = async () => {
    try {
      await generateReport('comprehensive', clinicId);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  // ================================================
  // LOADING AND ERROR STATES
  // ================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg text-gray-600">Carregando status de compliance...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro no Sistema de Compliance</AlertTitle>
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhum Dado de Compliance</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados de compliance. Verifique a configuração do sistema.
        </AlertDescription>
      </Alert>
    );
  }

  // ================================================
  // RENDER DASHBOARD
  // ================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Compliance Automation Dashboard
          </h1>
          <p className="text-gray-500">
            Monitoramento automatizado de compliance LGPD, ANVISA e CFM
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Última atualização: {formatDate(lastRefresh.toISOString())}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Compliance Geral"
          value={status.overall_score}
          status={status.overall_status}
          icon={<Shield />}
          color={status.overall_score >= 80 ? 'success' : status.overall_score >= 60 ? 'warning' : 'error'}
        />
        <StatusCard
          title="LGPD"
          value={status.lgpd_score}
          status="Monitorado"
          icon={<Shield />}
          color={status.lgpd_score >= 80 ? 'success' : status.lgpd_score >= 60 ? 'warning' : 'error'}
        />
        <StatusCard
          title="ANVISA"
          value={status.anvisa_score}
          status="Ativo"
          icon={<Activity />}
          color={status.anvisa_score >= 80 ? 'success' : status.anvisa_score >= 60 ? 'warning' : 'error'}
        />
        <StatusCard
          title="CFM"
          value={status.cfm_score}
          status="Validado"
          icon={<CheckCircle />}
          color={status.cfm_score >= 80 ? 'success' : status.cfm_score >= 60 ? 'warning' : 'error'}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Execute validações e operações de compliance rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              onClick={handleQuickDataClassification}
              disabled={classifyLoading}
              className="w-full"
            >
              {classifyLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Classificar Dados
            </Button>
            <Button
              variant="outline"
              onClick={handleQuickSoftwareValidation}
              disabled={softwareLoading}
              className="w-full"
            >
              {softwareLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Validar Software
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateTestAlert}
              disabled={alertLoading}
              className="w-full"
            >
              {alertLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              Teste de Alerta
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateComprehensiveReport}
              disabled={reportLoading}
              className="w-full"
            >
              {reportLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Status Details */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Alertas Recentes</TabsTrigger>
          <TabsTrigger value="status">Detalhes do Status</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Alertas de Compliance ({alerts.length})
              </CardTitle>
              <CardDescription>
                Alertas críticos e avisos do sistema de compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum alerta ativo no momento</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{alert.alert_type}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(alert.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{alert.description}</p>
                      {alert.affected_systems.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Sistemas afetados:</span>
                          {alert.affected_systems.map((system) => (
                            <Badge key={system} variant="outline" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>LGPD Compliance</span>
                    <span>{status.lgpd_score}%</span>
                  </div>
                  <Progress value={status.lgpd_score} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ANVISA Compliance</span>
                    <span>{status.anvisa_score}%</span>
                  </div>
                  <Progress value={status.anvisa_score} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CFM Compliance</span>
                    <span>{status.cfm_score}%</span>
                  </div>
                  <Progress value={status.cfm_score} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Alertas Críticos:</span>
                  <Badge variant={status.critical_alerts > 0 ? "destructive" : "outline"}>
                    {status.critical_alerts}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Solicitações Pendentes:</span>
                  <Badge variant={status.pending_requests > 0 ? "secondary" : "outline"}>
                    {status.pending_requests}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requer Atenção:</span>
                  <Badge variant={status.requires_attention ? "destructive" : "outline"}>
                    {status.requires_attention ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Avaliação:</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(status.assessed_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Relatórios de Compliance
              </CardTitle>
              <CardDescription>
                Gere relatórios detalhados de compliance para auditoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  onClick={() => generateReport('lgpd', clinicId)}
                  disabled={reportLoading}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório LGPD
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateReport('anvisa', clinicId)}
                  disabled={reportLoading}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório ANVISA
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateReport('cfm', clinicId)}
                  disabled={reportLoading}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório CFM
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateReport('comprehensive', clinicId)}
                  disabled={reportLoading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Relatório Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};