'use client';

import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Database,
  Download,
  Edit,
  Eye,
  FileText,
  Info,
  Shield,
  Trash2,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type ComplianceReport,
  type ConsentRecord,
  ConsentStatus,
  type DataSubjectRequest,
  DataSubjectRight,
  type LGPDConfig,
  RequestStatus,
} from '@/types/lgpd';

type LGPDTransparencyPortalProps = {
  userId: string;
  clinicId: string;
};

export default function LGPDTransparencyPortal({
  userId,
  clinicId,
}: LGPDTransparencyPortalProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [config, setConfig] = useState<LGPDConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const loadPortalData = async () => {
    try {
      setLoading(true);

      // Carregar dados do portal
      const [consentsData, requestsData, reportsData, configData] =
        await Promise.all([
          fetchUserConsents(),
          fetchUserRequests(),
          fetchComplianceReports(),
          fetchLGPDConfig(),
        ]);

      setConsents(consentsData);
      setRequests(requestsData);
      setReports(reportsData);
      setConfig(configData);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConsents = async (): Promise<ConsentRecord[]> => {
    // Implementar chamada à API
    return [];
  };

  const fetchUserRequests = async (): Promise<DataSubjectRequest[]> => {
    // Implementar chamada à API
    return [];
  };

  const fetchComplianceReports = async (): Promise<ComplianceReport[]> => {
    // Implementar chamada à API
    return [];
  };

  const fetchLGPDConfig = async (): Promise<LGPDConfig> => {
    // Implementar chamada à API
    return {
      clinicId,
      dataRetentionPeriods: {},
      consentExpirationDays: 365,
      automaticAnonymization: true,
      auditLogRetentionDays: 2555, // 7 anos
      encryptionEnabled: true,
      dataProcessingPurposes: [],
      legalBases: [],
      thirdPartySharing: false,
      internationalTransfers: false,
      dpoContact: {
        name: 'Data Protection Officer',
        email: 'dpo@clinic.com',
        phone: '(11) 99999-9999',
      },
      lastUpdated: new Date(),
    };
  };

  const handleConsentAction = async (
    _consentId: string,
    _action: 'grant' | 'withdraw'
  ) => {
    try {
      await loadPortalData(); // Recarregar dados
    } catch (_error) {}
  };

  const handleDataRequest = async (_requestType: DataSubjectRight) => {
    try {
      await loadPortalData(); // Recarregar dados
    } catch (_error) {}
  };

  const downloadData = async (_format: 'json' | 'csv' | 'pdf') => {
    try {
    } catch (_error) {}
  };

  const getConsentStatusIcon = (status: ConsentStatus) => {
    switch (status) {
      case ConsentStatus.GRANTED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ConsentStatus.WITHDRAWN:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case ConsentStatus.EXPIRED:
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getRequestStatusBadge = (status: RequestStatus) => {
    const variants = {
      [RequestStatus.PENDING]: 'secondary',
      [RequestStatus.IN_PROGRESS]: 'default',
      [RequestStatus.COMPLETED]: 'default',
      [RequestStatus.REJECTED]: 'destructive',
    } as const;

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const calculateComplianceScore = (): number => {
    const activeConsents = consents.filter(
      (c) => c.status === ConsentStatus.GRANTED
    ).length;
    const totalConsents = consents.length;
    const completedRequests = requests.filter(
      (r) => r.status === RequestStatus.COMPLETED
    ).length;
    const totalRequests = requests.length;

    if (totalConsents === 0 && totalRequests === 0) {
      return 100;
    }

    const consentScore =
      totalConsents > 0 ? (activeConsents / totalConsents) * 50 : 50;
    const requestScore =
      totalRequests > 0 ? (completedRequests / totalRequests) * 50 : 50;

    return Math.round(consentScore + requestScore);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-gray-900">
            Portal de Transparência LGPD
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie seus dados pessoais e direitos de privacidade
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <Badge className="text-sm" variant="outline">
            Compliance Score: {calculateComplianceScore()}%
          </Badge>
        </div>
      </div>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Visão Geral de Compliance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="font-bold text-2xl text-green-600">
                {
                  consents.filter((c) => c.status === ConsentStatus.GRANTED)
                    .length
                }
              </div>
              <div className="text-gray-600 text-sm">Consentimentos Ativos</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-blue-600">
                {requests.length}
              </div>
              <div className="text-gray-600 text-sm">
                Solicitações Realizadas
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-purple-600">
                {reports.length}
              </div>
              <div className="text-gray-600 text-sm">
                Relatórios Disponíveis
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-orange-600">
                {calculateComplianceScore()}%
              </div>
              <div className="text-gray-600 text-sm">Score de Compliance</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-gray-600 text-sm">
              <span>Nível de Compliance</span>
              <span>{calculateComplianceScore()}%</span>
            </div>
            <Progress className="h-2" value={calculateComplianceScore()} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="requests">Meus Direitos</TabsTrigger>
          <TabsTrigger value="data">Meus Dados</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent className="space-y-4" value="overview">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Status dos Consentimentos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consents.slice(0, 3).map((consent) => (
                    <div
                      className="flex items-center justify-between"
                      key={consent.id}
                    >
                      <div className="flex items-center space-x-2">
                        {getConsentStatusIcon(consent.status)}
                        <span className="text-sm">{consent.consentType}</span>
                      </div>
                      <Badge className="text-xs" variant="outline">
                        {consent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {consents.length > 3 && (
                  <Button
                    className="mt-2 h-auto p-0"
                    onClick={() => setActiveTab('consents')}
                    variant="link"
                  >
                    Ver todos os consentimentos
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Solicitações Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requests.slice(0, 3).map((request) => (
                    <div
                      className="flex items-center justify-between"
                      key={request.id}
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {request.requestType}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {getRequestStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
                {requests.length > 3 && (
                  <Button
                    className="mt-2 h-auto p-0"
                    onClick={() => setActiveTab('requests')}
                    variant="link"
                  >
                    Ver todas as solicitações
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Gerencie seus dados e direitos de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Button
                  className="h-20 flex-col space-y-2"
                  onClick={() => handleDataRequest(DataSubjectRight.ACCESS)}
                  variant="outline"
                >
                  <Eye className="h-6 w-6" />
                  <span className="text-xs">Acessar Dados</span>
                </Button>
                <Button
                  className="h-20 flex-col space-y-2"
                  onClick={() => downloadData('json')}
                  variant="outline"
                >
                  <Download className="h-6 w-6" />
                  <span className="text-xs">Baixar Dados</span>
                </Button>
                <Button
                  className="h-20 flex-col space-y-2"
                  onClick={() =>
                    handleDataRequest(DataSubjectRight.RECTIFICATION)
                  }
                  variant="outline"
                >
                  <Edit className="h-6 w-6" />
                  <span className="text-xs">Corrigir Dados</span>
                </Button>
                <Button
                  className="h-20 flex-col space-y-2"
                  onClick={() => handleDataRequest(DataSubjectRight.ERASURE)}
                  variant="outline"
                >
                  <Trash2 className="h-6 w-6" />
                  <span className="text-xs">Excluir Dados</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>{' '}
        {/* Consents Tab */}
        <TabsContent className="space-y-4" value="consents">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Consentimentos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os seus consentimentos de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consents.map((consent) => (
                  <div className="rounded-lg border p-4" key={consent.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getConsentStatusIcon(consent.status)}
                        <h3 className="font-medium">{consent.consentType}</h3>
                      </div>
                      <Badge variant="outline">{consent.status}</Badge>
                    </div>

                    <p className="mb-3 text-gray-600 text-sm">
                      {consent.purpose}
                    </p>

                    <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Concedido em:</span>
                        <div>
                          {new Date(consent.grantedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Expira em:</span>
                        <div>
                          {consent.expiresAt
                            ? new Date(consent.expiresAt).toLocaleDateString()
                            : 'Nunca'}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {consent.status === ConsentStatus.GRANTED ? (
                        <Button
                          onClick={() =>
                            handleConsentAction(consent.id, 'withdraw')
                          }
                          size="sm"
                          variant="destructive"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Retirar Consentimento
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            handleConsentAction(consent.id, 'grant')
                          }
                          size="sm"
                          variant="default"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Conceder Consentimento
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Info className="mr-1 h-4 w-4" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}

                {consents.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <UserCheck className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Nenhum consentimento encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Data Subject Rights Tab */}
        <TabsContent className="space-y-4" value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Meus Direitos como Titular de Dados</CardTitle>
              <CardDescription>
                Exercite seus direitos garantidos pela LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Rights Actions */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Eye className="h-5 w-5" />
                      <span>Direito de Acesso</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600 text-sm">
                      Solicite acesso aos seus dados pessoais que processamos
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => handleDataRequest(DataSubjectRight.ACCESS)}
                    >
                      Solicitar Acesso
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Download className="h-5 w-5" />
                      <span>Portabilidade</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600 text-sm">
                      Baixe seus dados em formato estruturado
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleDataRequest(DataSubjectRight.PORTABILITY)
                      }
                    >
                      Solicitar Portabilidade
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Edit className="h-5 w-5" />
                      <span>Retificação</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600 text-sm">
                      Solicite correção de dados incorretos ou incompletos
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleDataRequest(DataSubjectRight.RECTIFICATION)
                      }
                    >
                      Solicitar Correção
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Trash2 className="h-5 w-5" />
                      <span>Eliminação</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-gray-600 text-sm">
                      Solicite a exclusão dos seus dados pessoais
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleDataRequest(DataSubjectRight.ERASURE)
                      }
                      variant="destructive"
                    >
                      Solicitar Exclusão
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Request History */}
              <div>
                <h3 className="mb-4 font-medium text-lg">
                  Histórico de Solicitações
                </h3>
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div className="rounded-lg border p-4" key={request.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium">{request.requestType}</h4>
                        {getRequestStatusBadge(request.status)}
                      </div>

                      <p className="mb-2 text-gray-600 text-sm">
                        {request.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Solicitado em:</span>
                          <div>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Prazo:</span>
                          <div>
                            {new Date(request.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {request.response && (
                        <div className="mt-3 rounded bg-gray-50 p-3">
                          <span className="font-medium text-sm">Resposta:</span>
                          <p className="mt-1 text-sm">{request.response}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {requests.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                      <p>Nenhuma solicitação encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* My Data Tab */}
        <TabsContent className="space-y-4" value="data">
          <Card>
            <CardHeader>
              <CardTitle>Meus Dados Pessoais</CardTitle>
              <CardDescription>
                Visualize e gerencie seus dados pessoais armazenados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Data Categories */}
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center space-x-2 font-medium">
                      <Database className="h-5 w-5" />
                      <span>Dados de Identificação</span>
                    </h3>
                    <Badge variant="outline">Criptografado</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipos de dados:</span>
                      <div>Nome, CPF, RG, Data de nascimento</div>
                    </div>
                    <div>
                      <span className="font-medium">Finalidade:</span>
                      <div>Identificação e cadastro</div>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center space-x-2 font-medium">
                      <Database className="h-5 w-5" />
                      <span>Dados de Contato</span>
                    </h3>
                    <Badge variant="outline">Criptografado</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipos de dados:</span>
                      <div>Email, Telefone, Endereço</div>
                    </div>
                    <div>
                      <span className="font-medium">Finalidade:</span>
                      <div>Comunicação e localização</div>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center space-x-2 font-medium">
                      <Database className="h-5 w-5" />
                      <span>Dados Médicos</span>
                    </h3>
                    <Badge variant="outline">Altamente Sensível</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipos de dados:</span>
                      <div>Histórico médico, Exames, Prescrições</div>
                    </div>
                    <div>
                      <span className="font-medium">Finalidade:</span>
                      <div>Prestação de cuidados médicos</div>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Data Export Options */}
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <h3 className="mb-3 font-medium">Exportar Todos os Dados</h3>
                <p className="mb-4 text-gray-600 text-sm">
                  Baixe todos os seus dados pessoais em formato estruturado
                </p>
                <div className="flex space-x-2">
                  <Button onClick={() => downloadData('json')}>
                    <Download className="mr-1 h-4 w-4" />
                    JSON
                  </Button>
                  <Button onClick={() => downloadData('csv')} variant="outline">
                    <Download className="mr-1 h-4 w-4" />
                    CSV
                  </Button>
                  <Button onClick={() => downloadData('pdf')} variant="outline">
                    <Download className="mr-1 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Reports Tab */}
        <TabsContent className="space-y-4" value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Transparência</CardTitle>
              <CardDescription>
                Acesse relatórios sobre o processamento dos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div className="rounded-lg border p-4" key={report.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">{report.title}</h3>
                      <Badge variant="outline">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </Badge>
                    </div>

                    <p className="mb-3 text-gray-600 text-sm">
                      {report.description}
                    </p>

                    <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Período:</span>
                        <div>
                          {new Date(
                            report.period.startDate
                          ).toLocaleDateString()}{' '}
                          -
                          {new Date(report.period.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span>
                        <div>{report.reportType}</div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-4 w-4" />
                      Baixar Relatório
                    </Button>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Nenhum relatório disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer with DPO Contact */}
      {config?.dpoContact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Contato do Encarregado de Dados (DPO)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <span className="font-medium">Nome:</span>
                <div>{config.dpoContact.name}</div>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <div>{config.dpoContact.email}</div>
              </div>
              <div>
                <span className="font-medium">Telefone:</span>
                <div>{config.dpoContact.phone}</div>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Para dúvidas sobre privacidade e proteção de dados, entre em
                contato com nosso DPO. Responderemos em até 15 dias úteis
                conforme estabelecido pela LGPD.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
