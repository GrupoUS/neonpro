/**
 * Compliance Dashboard Route
 * CFM, LGPD, and ANVISA compliance monitoring and reporting
 */

import { createFileRoute } from '@tanstack/react-router';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Gavel,
  Lock,
  Server,
  Shield,
  Users,
} from 'lucide-react';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs } from '@/components/ui/tabs';

export const Route = createFileRoute('/telemedicine/compliance')({
  component: ComplianceDashboard,
});

function ComplianceDashboard() {
  // Mock compliance data - will be replaced with real tRPC calls
  const complianceOverview = {
    cfm: {
      status: 'compliant',
      lastAudit: '2025-01-28T10:00:00Z',
      score: 98,
      sessionsToday: 12,
      violationsThisMonth: 0,
    },
    lgpd: {
      status: 'compliant',
      lastAudit: '2025-01-28T10:00:00Z',
      score: 96,
      consentsToday: 23,
      dataRequestsThisMonth: 2,
    },
    anvisa: {
      status: 'compliant',
      lastAudit: '2025-01-28T10:00:00Z',
      score: 100,
      devicesValidated: 15,
      certificatesExpiring: 0,
    },
  };

  const auditLogs = [
    {
      id: 'audit-1',
      timestamp: '2025-01-28T14:30:00Z',
      type: 'cfm',
      action: 'session_started',
      user: 'Dr. João Mendes',
      details: 'Consulta iniciada com verificação de identidade CFM',
      status: 'success',
    },
    {
      id: 'audit-2',
      timestamp: '2025-01-28T14:25:00Z',
      type: 'lgpd',
      action: 'consent_signed',
      user: 'Maria Silva',
      details: 'Termo de consentimento LGPD assinado digitalmente',
      status: 'success',
    },
    {
      id: 'audit-3',
      timestamp: '2025-01-28T14:20:00Z',
      type: 'anvisa',
      action: 'device_validated',
      user: 'Sistema',
      details: 'Dispositivo médico validado conforme ANVISA',
      status: 'success',
    },
    {
      id: 'audit-4',
      timestamp: '2025-01-28T14:15:00Z',
      type: 'cfm',
      action: 'identity_verified',
      user: 'Dr. João Mendes',
      details: 'Identidade profissional verificada via CRM',
      status: 'success',
    },
  ];

  const getStatusColor = (_status: any) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'violation':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (_status: any) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className='h-5 w-5 text-green-600' />;
      case 'warning':
        return <AlertTriangle className='h-5 w-5 text-yellow-600' />;
      case 'violation':
        return <AlertTriangle className='h-5 w-5 text-red-600' />;
      default:
        return <Clock className='h-5 w-5 text-gray-600' />;
    }
  };

  const formatDateTime = (_dateString: any) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Compliance e Conformidade</h1>
          <p className='text-muted-foreground'>
            Monitoramento de conformidade CFM, LGPD e ANVISA para telemedicina
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Exportar Relatório
          </Button>
          <Button size='sm'>
            <Eye className='h-4 w-4 mr-2' />
            Auditoria Completa
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* CFM Compliance */}
        <Card>
          <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              CFM 2.314/2022
            </CardTitle>
            <Gavel className='h-4 w-4 ml-auto text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                {getStatusIcon(complianceOverview.cfm.status)}
                <Badge variant='outline' className='bg-green-50 text-green-700'>
                  Conforme
                </Badge>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Score de Compliance</span>
                  <span>{complianceOverview.cfm.score}%</span>
                </div>
                <Progress
                  value={complianceOverview.cfm.score}
                  className='h-2'
                />
              </div>

              <div className='text-sm text-muted-foreground space-y-1'>
                <div>Sessões hoje: {complianceOverview.cfm.sessionsToday}</div>
                <div>
                  Violações este mês: {complianceOverview.cfm.violationsThisMonth}
                </div>
                <div>
                  Última auditoria: {formatDateTime(complianceOverview.cfm.lastAudit)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LGPD Compliance */}
        <Card>
          <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>LGPD</CardTitle>
            <Lock className='h-4 w-4 ml-auto text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                {getStatusIcon(complianceOverview.lgpd.status)}
                <Badge variant='outline' className='bg-green-50 text-green-700'>
                  Conforme
                </Badge>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Score de Compliance</span>
                  <span>{complianceOverview.lgpd.score}%</span>
                </div>
                <Progress
                  value={complianceOverview.lgpd.score}
                  className='h-2'
                />
              </div>

              <div className='text-sm text-muted-foreground space-y-1'>
                <div>
                  Consentimentos hoje: {complianceOverview.lgpd.consentsToday}
                </div>
                <div>
                  Solicitações este mês: {complianceOverview.lgpd.dataRequestsThisMonth}
                </div>
                <div>
                  Última auditoria: {formatDateTime(complianceOverview.lgpd.lastAudit)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ANVISA Compliance */}
        <Card>
          <CardHeader className='flex flex-row items-center space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>ANVISA</CardTitle>
            <Server className='h-4 w-4 ml-auto text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                {getStatusIcon(complianceOverview.anvisa.status)}
                <Badge variant='outline' className='bg-green-50 text-green-700'>
                  Conforme
                </Badge>
              </div>

              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Score de Compliance</span>
                  <span>{complianceOverview.anvisa.score}%</span>
                </div>
                <Progress
                  value={complianceOverview.anvisa.score}
                  className='h-2'
                />
              </div>

              <div className='text-sm text-muted-foreground space-y-1'>
                <div>
                  Dispositivos validados: {complianceOverview.anvisa.devicesValidated}
                </div>
                <div>
                  Certificados vencendo: {complianceOverview.anvisa.certificatesExpiring}
                </div>
                <div>
                  Última auditoria: {formatDateTime(complianceOverview.anvisa.lastAudit)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Compliance Tabs */}
      <Tabs defaultValue='cfm' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='cfm'>CFM 2.314/2022</TabsTrigger>
          <TabsTrigger value='lgpd'>LGPD</TabsTrigger>
          <TabsTrigger value='anvisa'>ANVISA</TabsTrigger>
          <TabsTrigger value='audit'>Logs de Auditoria</TabsTrigger>
        </TabsList>

        {/* CFM Tab */}
        <TabsContent value='cfm' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Requisitos CFM</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Identificação do médico</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Verificação de CRM</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Registro da consulta</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Consentimento informado</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Tecnologia adequada</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Estatísticas CFM</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {complianceOverview.cfm.sessionsToday}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Consultas Hoje
                  </div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>100%</div>
                  <div className='text-xs text-muted-foreground'>
                    Taxa de Conformidade
                  </div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {complianceOverview.cfm.violationsThisMonth}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Violações Este Mês
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LGPD Tab */}
        <TabsContent value='lgpd' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Requisitos LGPD</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Base legal definida</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Consentimento explícito</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Finalidade específica</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Direito de portabilidade</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Minimização de dados</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Estatísticas LGPD</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {complianceOverview.lgpd.consentsToday}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Consentimentos Hoje
                  </div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>96%</div>
                  <div className='text-xs text-muted-foreground'>
                    Taxa de Conformidade
                  </div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {complianceOverview.lgpd.dataRequestsThisMonth}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Solicitações Este Mês
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ANVISA Tab */}
        <TabsContent value='anvisa' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Requisitos ANVISA</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Dispositivos registrados</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Certificação de qualidade</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Rastreabilidade</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Validação técnica</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Documentação completa</span>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Estatísticas ANVISA</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {complianceOverview.anvisa.devicesValidated}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Dispositivos Validados
                  </div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>100%</div>
                  <div className='text-xs text-muted-foreground'>
                    Taxa de Conformidade
                  </div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {complianceOverview.anvisa.certificatesExpiring}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Certificados Vencendo
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value='audit' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <FileText className='h-5 w-5 mr-2' />
                Logs de Auditoria Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    className='flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800'
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`p-2 rounded-full ${
                          log.type === 'cfm'
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : log.type === 'lgpd'
                            ? 'bg-purple-100 dark:bg-purple-900'
                            : 'bg-orange-100 dark:bg-orange-900'
                        }`}
                      >
                        {log.type === 'cfm' && <Gavel className='h-4 w-4 text-blue-600' />}
                        {log.type === 'lgpd' && <Lock className='h-4 w-4 text-purple-600' />}
                        {log.type === 'anvisa' && <Server className='h-4 w-4 text-orange-600' />}
                      </div>

                      <div>
                        <div className='font-medium text-sm'>{log.details}</div>
                        <div className='text-xs text-muted-foreground'>
                          {log.user} • {formatDateTime(log.timestamp)}
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={log.status === 'success' ? 'outline' : 'destructive'}
                      className={log.status === 'success'
                        ? 'bg-green-50 text-green-700'
                        : ''}
                    >
                      {log.status === 'success' ? 'Sucesso' : 'Falha'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
