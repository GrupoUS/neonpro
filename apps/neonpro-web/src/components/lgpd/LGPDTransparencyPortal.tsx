"use client";

import type {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  Edit,
  Eye,
  FileText,
  Info,
  Lock,
  Shield,
  Trash2,
  Unlock,
  UserCheck,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ComplianceReport,
  ConsentRecord,
  ConsentStatus,
  DataSubjectRequest,
  DataSubjectRight,
  LGPDConfig,
  RequestStatus,
} from "@/types/lgpd";

interface LGPDTransparencyPortalProps {
  userId: string;
  clinicId: string;
}

export default function LGPDTransparencyPortal({ userId, clinicId }: LGPDTransparencyPortalProps) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [config, setConfig] = useState<LGPDConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadPortalData();
  }, [userId, clinicId]);

  const loadPortalData = async () => {
    try {
      setLoading(true);

      // Carregar dados do portal
      const [consentsData, requestsData, reportsData, configData] = await Promise.all([
        fetchUserConsents(),
        fetchUserRequests(),
        fetchComplianceReports(),
        fetchLGPDConfig(),
      ]);

      setConsents(consentsData);
      setRequests(requestsData);
      setReports(reportsData);
      setConfig(configData);
    } catch (error) {
      console.error("Error loading portal data:", error);
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
        name: "Data Protection Officer",
        email: "dpo@clinic.com",
        phone: "(11) 99999-9999",
      },
      lastUpdated: new Date(),
    };
  };

  const handleConsentAction = async (consentId: string, action: "grant" | "withdraw") => {
    try {
      // Implementar ação de consentimento
      console.log(`${action} consent:`, consentId);
      await loadPortalData(); // Recarregar dados
    } catch (error) {
      console.error("Error handling consent action:", error);
    }
  };

  const handleDataRequest = async (requestType: DataSubjectRight) => {
    try {
      // Implementar solicitação de direito do titular
      console.log("Data request:", requestType);
      await loadPortalData(); // Recarregar dados
    } catch (error) {
      console.error("Error handling data request:", error);
    }
  };

  const downloadData = async (format: "json" | "csv" | "pdf") => {
    try {
      // Implementar download de dados
      console.log("Download data:", format);
    } catch (error) {
      console.error("Error downloading data:", error);
    }
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
      [RequestStatus.PENDING]: "secondary",
      [RequestStatus.IN_PROGRESS]: "default",
      [RequestStatus.COMPLETED]: "default",
      [RequestStatus.REJECTED]: "destructive",
    } as const;

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const calculateComplianceScore = (): number => {
    const activeConsents = consents.filter((c) => c.status === ConsentStatus.GRANTED).length;
    const totalConsents = consents.length;
    const completedRequests = requests.filter((r) => r.status === RequestStatus.COMPLETED).length;
    const totalRequests = requests.length;

    if (totalConsents === 0 && totalRequests === 0) return 100;

    const consentScore = totalConsents > 0 ? (activeConsents / totalConsents) * 50 : 50;
    const requestScore = totalRequests > 0 ? (completedRequests / totalRequests) * 50 : 50;

    return Math.round(consentScore + requestScore);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal de Transparência LGPD</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus dados pessoais e direitos de privacidade
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <Badge variant="outline" className="text-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {consents.filter((c) => c.status === ConsentStatus.GRANTED).length}
              </div>
              <div className="text-sm text-gray-600">Consentimentos Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
              <div className="text-sm text-gray-600">Solicitações Realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reports.length}</div>
              <div className="text-sm text-gray-600">Relatórios Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {calculateComplianceScore()}%
              </div>
              <div className="text-sm text-gray-600">Score de Compliance</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Nível de Compliance</span>
              <span>{calculateComplianceScore()}%</span>
            </div>
            <Progress value={calculateComplianceScore()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="requests">Meus Direitos</TabsTrigger>
          <TabsTrigger value="data">Meus Dados</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div key={consent.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getConsentStatusIcon(consent.status)}
                        <span className="text-sm">{consent.consentType}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {consent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {consents.length > 3 && (
                  <Button
                    variant="link"
                    className="mt-2 p-0 h-auto"
                    onClick={() => setActiveTab("consents")}
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
                    <div key={request.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{request.requestType}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {getRequestStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
                {requests.length > 3 && (
                  <Button
                    variant="link"
                    className="mt-2 p-0 h-auto"
                    onClick={() => setActiveTab("requests")}
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
              <CardDescription>Gerencie seus dados e direitos de privacidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => handleDataRequest(DataSubjectRight.ACCESS)}
                >
                  <Eye className="h-6 w-6" />
                  <span className="text-xs">Acessar Dados</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => downloadData("json")}
                >
                  <Download className="h-6 w-6" />
                  <span className="text-xs">Baixar Dados</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => handleDataRequest(DataSubjectRight.RECTIFICATION)}
                >
                  <Edit className="h-6 w-6" />
                  <span className="text-xs">Corrigir Dados</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => handleDataRequest(DataSubjectRight.ERASURE)}
                >
                  <Trash2 className="h-6 w-6" />
                  <span className="text-xs">Excluir Dados</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>{" "}
        {/* Consents Tab */}
        <TabsContent value="consents" className="space-y-4">
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
                  <div key={consent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getConsentStatusIcon(consent.status)}
                        <h3 className="font-medium">{consent.consentType}</h3>
                      </div>
                      <Badge variant="outline">{consent.status}</Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{consent.purpose}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Concedido em:</span>
                        <div>{new Date(consent.grantedAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Expira em:</span>
                        <div>
                          {consent.expiresAt
                            ? new Date(consent.expiresAt).toLocaleDateString()
                            : "Nunca"}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {consent.status === ConsentStatus.GRANTED ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleConsentAction(consent.id, "withdraw")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Retirar Consentimento
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConsentAction(consent.id, "grant")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Conceder Consentimento
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Info className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}

                {consents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum consentimento encontrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Data Subject Rights Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Direitos como Titular de Dados</CardTitle>
              <CardDescription>Exercite seus direitos garantidos pela LGPD</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Rights Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <span>Direito de Acesso</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Solicite acesso aos seus dados pessoais que processamos
                    </p>
                    <Button
                      onClick={() => handleDataRequest(DataSubjectRight.ACCESS)}
                      className="w-full"
                    >
                      Solicitar Acesso
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Portabilidade</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Baixe seus dados em formato estruturado
                    </p>
                    <Button
                      onClick={() => handleDataRequest(DataSubjectRight.PORTABILITY)}
                      className="w-full"
                    >
                      Solicitar Portabilidade
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Edit className="h-5 w-5" />
                      <span>Retificação</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Solicite correção de dados incorretos ou incompletos
                    </p>
                    <Button
                      onClick={() => handleDataRequest(DataSubjectRight.RECTIFICATION)}
                      className="w-full"
                    >
                      Solicitar Correção
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Trash2 className="h-5 w-5" />
                      <span>Eliminação</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Solicite a exclusão dos seus dados pessoais
                    </p>
                    <Button
                      onClick={() => handleDataRequest(DataSubjectRight.ERASURE)}
                      variant="destructive"
                      className="w-full"
                    >
                      Solicitar Exclusão
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Request History */}
              <div>
                <h3 className="text-lg font-medium mb-4">Histórico de Solicitações</h3>
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{request.requestType}</h4>
                        {getRequestStatusBadge(request.status)}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{request.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Solicitado em:</span>
                          <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="font-medium">Prazo:</span>
                          <div>{new Date(request.dueDate).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {request.response && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <span className="font-medium text-sm">Resposta:</span>
                          <p className="text-sm mt-1">{request.response}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {requests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma solicitação encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* My Data Tab */}
        <TabsContent value="data" className="space-y-4">
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
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center space-x-2">
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
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center space-x-2">
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
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center space-x-2">
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
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Data Export Options */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-3">Exportar Todos os Dados</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Baixe todos os seus dados pessoais em formato estruturado
                </p>
                <div className="flex space-x-2">
                  <Button onClick={() => downloadData("json")}>
                    <Download className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button onClick={() => downloadData("csv")} variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button onClick={() => downloadData("pdf")} variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
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
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{report.title}</h3>
                      <Badge variant="outline">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Período:</span>
                        <div>
                          {new Date(report.period.startDate).toLocaleDateString()} -
                          {new Date(report.period.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span>
                        <div>{report.reportType}</div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar Relatório
                    </Button>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Para dúvidas sobre privacidade e proteção de dados, entre em contato com nosso DPO.
                Responderemos em até 15 dias úteis conforme estabelecido pela LGPD.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
