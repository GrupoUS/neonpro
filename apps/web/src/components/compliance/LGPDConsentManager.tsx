// LGPD Patient Consent Management Dashboard
// Complete dashboard for managing patient data consent according to Brazilian LGPD

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Shield, Users, FileText, AlertTriangle, Check, X, Clock, 
  Download, Eye, Trash2, Edit, Plus, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

import { 
  lgpdManager, 
  getPurposeDescription, 
  getDataCategoryDescription, 
  getLegalBasisDescription 
} from "@/lib/compliance/lgpd-consent-management";
import type {
  LGPDConsent,
  DataSubjectRequest,
  ConsentPurpose,
  DataCategory,
  LGPDLegalBasis,
} from "@/types/compliance";

// =============================================================================
// INTERFACE DEFINITIONS
// =============================================================================

interface LGPDConsentManagerProps {
  className?: string;
  clinicId: string;
  currentUserId: string;
  userRole: 'admin' | 'staff' | 'dpo'; // Data Protection Officer
  onAlert?: (alert: { type: string; message: string; severity: 'low' | 'medium' | 'high' }) => void;
  compactView?: boolean;
}

interface ConsentFormData {
  patientId: string;
  purpose: ConsentPurpose;
  dataCategories: DataCategory[];
  legalBasis: LGPDLegalBasis;
  retentionPeriod: number;
  customConsentText: string;
  thirdPartySharing: boolean;
  internationalTransfer: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LGPDConsentManager({
  className = "",
  clinicId,
  currentUserId,
  userRole,
  onAlert,
  compactView = false,
}: LGPDConsentManagerProps) {
  // State management
  const [activeTab, setActiveTab] = useState("consents");
  const [consents, setConsents] = useState<LGPDConsent[]>([]);
  const [dataSubjectRequests, setDataSubjectRequests] = useState<DataSubjectRequest[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [consentForm, setConsentForm] = useState<ConsentFormData>({
    patientId: "",
    purpose: "medical_treatment",
    dataCategories: ["personal_identification", "health_data"],
    legalBasis: "consent",
    retentionPeriod: 365,
    customConsentText: "",
    thirdPartySharing: false,
    internationalTransfer: false,
  });

  // Load data on mount
  useEffect(() => {
    if (selectedPatientId) {
      loadPatientData();
    }
    loadComplianceReport();
  }, [selectedPatientId]);

  // =============================================================================
  // DATA LOADING FUNCTIONS
  // =============================================================================

  const loadPatientData = useCallback(() => {
    if (!selectedPatientId) return;

    try {
      const patientConsents = lgpdManager.getPatientConsents(selectedPatientId, {
        includeWithdrawn: true,
      });
      setConsents(patientConsents);

      const patientRequests = lgpdManager.getDataSubjectRequests(selectedPatientId);
      setDataSubjectRequests(patientRequests);
    } catch (error) {
      console.error("Error loading patient data:", error);
    }
  }, [selectedPatientId]);

  const loadComplianceReport = useCallback(async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

      const report = lgpdManager.generateComplianceReport({
        startDate,
        endDate,
      }, clinicId);

      setComplianceReport(report);

      // Emit alerts based on compliance score
      if (onAlert && report.complianceScore < 80) {
        onAlert({
          type: "compliance_score_low",
          message: `Score de compliance LGPD baixo: ${report.complianceScore}%`,
          severity: report.complianceScore < 60 ? "high" : "medium",
        });
      }
    } catch (error) {
      console.error("Error loading compliance report:", error);
    }
  }, [clinicId, onAlert]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleCreateConsent = async () => {
    if (!consentForm.patientId || consentForm.dataCategories.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await lgpdManager.requestConsent(
        consentForm.patientId,
        consentForm.purpose,
        consentForm.dataCategories,
        consentForm.legalBasis,
        consentForm.retentionPeriod,
        {
          consentText: consentForm.customConsentText || undefined,
          thirdPartySharing: consentForm.thirdPartySharing,
          internationalTransfer: consentForm.internationalTransfer,
          dataMinimization: true,
        }
      );

      if (result.success) {
        setShowConsentDialog(false);
        resetConsentForm();
        loadPatientData();
        
        onAlert?.({
          type: "consent_created",
          message: "Solicitação de consentimento criada com sucesso",
          severity: "low",
        });
      } else {
        console.error("Failed to create consent:", result.errors);
      }
    } catch (error) {
      console.error("Error creating consent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantConsent = async (consentId: string) => {
    try {
      const result = await lgpdManager.grantConsent(
        consentId,
        'digital_signature',
        currentUserId
      );

      if (result.success) {
        loadPatientData();
        onAlert?.({
          type: "consent_granted",
          message: "Consentimento concedido com sucesso",
          severity: "low",
        });
      }
    } catch (error) {
      console.error("Error granting consent:", error);
    }
  };

  const handleWithdrawConsent = async (consentId: string, reason: string) => {
    try {
      const result = await lgpdManager.withdrawConsent(
        consentId,
        reason,
        currentUserId
      );

      if (result.success) {
        loadPatientData();
        
        if (result.dataToDelete && result.dataToDelete.length > 0) {
          onAlert?.({
            type: "data_deletion_required",
            message: `Consentimento retirado. ${result.dataToDelete.length} registros precisam ser excluídos`,
            severity: "high",
          });
        } else {
          onAlert?.({
            type: "consent_withdrawn",
            message: "Consentimento retirado com sucesso",
            severity: "medium",
          });
        }
      }
    } catch (error) {
      console.error("Error withdrawing consent:", error);
    }
  };

  const handleCreateDataSubjectRequest = async (
    requestType: DataSubjectRequest['requestType'],
    description: string
  ) => {
    if (!selectedPatientId) return;

    try {
      const result = await lgpdManager.createDataSubjectRequest(
        selectedPatientId,
        requestType,
        description,
        currentUserId
      );

      if (result.success) {
        loadPatientData();
        onAlert?.({
          type: "data_subject_request_created",
          message: "Solicitação do titular criada com sucesso",
          severity: "low",
        });
      }
    } catch (error) {
      console.error("Error creating data subject request:", error);
    }
  };

  const resetConsentForm = () => {
    setConsentForm({
      patientId: "",
      purpose: "medical_treatment",
      dataCategories: ["personal_identification", "health_data"],
      legalBasis: "consent",
      retentionPeriod: 365,
      customConsentText: "",
      thirdPartySharing: false,
      internationalTransfer: false,
    });
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderConsentCard = (consent: LGPDConsent) => {
    const isActive = consent.consentGiven && !consent.withdrawalDate;
    const isExpired = consent.consentGiven && 
      (Date.now() - new Date(consent.consentDate).getTime()) > (consent.retentionPeriod * 24 * 60 * 60 * 1000);

    return (
      <Card key={consent.id} className={`${isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{getPurposeDescription(consent.purpose)}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant={isActive ? "default" : consent.withdrawalDate ? "destructive" : "secondary"}
              >
                {isActive ? "Ativo" : consent.withdrawalDate ? "Retirado" : "Pendente"}
              </Badge>
              {isExpired && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  Expirado
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            {getLegalBasisDescription(consent.legalBasis)} • 
            Retenção: {consent.retentionPeriod} dias
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categorias de Dados:</p>
            <div className="flex flex-wrap gap-2">
              {consent.dataCategories.map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {getDataCategoryDescription(category)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Data do consentimento:</strong> {new Date(consent.consentDate).toLocaleDateString("pt-BR")}</p>
            {consent.withdrawalDate && (
              <p><strong>Data da retirada:</strong> {new Date(consent.withdrawalDate).toLocaleDateString("pt-BR")}</p>
            )}
            <p><strong>Método:</strong> {consent.consentMethod}</p>
          </div>

          {(userRole === 'admin' || userRole === 'dpo') && (
            <div className="flex gap-2 pt-2 border-t">
              {!consent.consentGiven && (
                <Button 
                  size="sm" 
                  onClick={() => handleGrantConsent(consent.id)}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Conceder
                </Button>
              )}
              
              {isActive && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleWithdrawConsent(consent.id, "Solicitação do usuário")}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Retirar
                </Button>
              )}

              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {/* View details */}}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Detalhes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDataSubjectRequestCard = (request: DataSubjectRequest) => {
    const statusColors = {
      pending: "border-yellow-500 bg-yellow-50",
      processing: "border-blue-500 bg-blue-50",
      completed: "border-green-500 bg-green-50",
      rejected: "border-red-500 bg-red-50",
    };

    const statusLabels = {
      pending: "Pendente",
      processing: "Processando",
      completed: "Concluído",
      rejected: "Rejeitado",
    };

    const requestTypeLabels = {
      access: "Acesso aos Dados",
      rectification: "Correção",
      erasure: "Exclusão",
      portability: "Portabilidade",
      restriction: "Restrição",
      objection: "Oposição",
    };

    return (
      <Card key={request.id} className={statusColors[request.status]}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium">{requestTypeLabels[request.requestType]}</h4>
              <p className="text-sm text-gray-600">
                {new Date(request.requestDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <Badge variant="outline">
              {statusLabels[request.status]}
            </Badge>
          </div>

          <p className="text-sm text-gray-700 mb-3">
            {request.requestDescription}
          </p>

          {request.responseDate && (
            <div className="text-xs text-gray-600 mb-3">
              <p><strong>Processado em:</strong> {new Date(request.responseDate).toLocaleDateString("pt-BR")}</p>
              <p><strong>Processado por:</strong> {request.processedBy}</p>
            </div>
          )}

          {(userRole === 'admin' || userRole === 'dpo') && request.status === 'pending' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button 
                size="sm"
                onClick={() => {/* Process request */}}
                className="text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Processar
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Edit className="w-3 h-3 mr-1" />
                Detalhes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderComplianceOverview = () => {
    if (!complianceReport) {
      return (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Carregando relatório de compliance...</p>
        </div>
      );
    }

    const scoreColor = complianceReport.complianceScore >= 80 ? "text-green-600" : 
                     complianceReport.complianceScore >= 60 ? "text-yellow-600" : "text-red-600";

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{complianceReport.summary.totalConsents}</p>
                  <p className="text-sm text-gray-600">Total de Consentimentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Check className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{complianceReport.summary.activeConsents}</p>
                  <p className="text-sm text-gray-600">Consentimentos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{complianceReport.summary.dataSubjectRequests}</p>
                  <p className="text-sm text-gray-600">Solicitações do Titular</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{complianceReport.summary.averageResponseTime}h</p>
                  <p className="text-sm text-gray-600">Tempo Médio de Resposta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Score de Compliance LGPD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={complianceReport.complianceScore} className="h-3" />
                </div>
                <div className={`text-3xl font-bold ${scoreColor}`}>
                  {complianceReport.complianceScore}%
                </div>
              </div>

              {complianceReport.violations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-700">Violações Identificadas:</h4>
                  {complianceReport.violations.map((violation: any, index: number) => (
                    <Alert key={index} className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <strong>{violation.description}</strong>
                        <br />
                        <span className="text-sm">
                          Gravidade: {violation.severity} • 
                          Registros afetados: {violation.affectedRecords}
                        </span>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {complianceReport.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-700">Recomendações:</h4>
                  <ul className="space-y-1">
                    {complianceReport.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (compactView) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            LGPD Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complianceReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Score de Compliance:</span>
                <Badge 
                  variant={complianceReport.complianceScore >= 80 ? "default" : "destructive"}
                >
                  {complianceReport.complianceScore}%
                </Badge>
              </div>
              <Progress value={complianceReport.complianceScore} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            LGPD - Gestão de Consentimentos
          </CardTitle>
          <CardDescription>
            Sistema completo para gerenciamento de consentimentos e direitos dos titulares de dados
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o ID do paciente para buscar..."
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              />
            </div>
            {(userRole === 'admin' || userRole === 'dpo') && (
              <Button onClick={() => setShowConsentDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Novo Consentimento
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="consents">Consentimentos</TabsTrigger>
              <TabsTrigger value="requests">Solicitações</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="consents" className="mt-4">
              <div className="space-y-4">
                {consents.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {consents.map(renderConsentCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3" />
                    <p>Nenhum consentimento encontrado</p>
                    <p className="text-sm">Digite o ID do paciente para buscar consentimentos</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="requests" className="mt-4">
              <div className="space-y-4">
                {dataSubjectRequests.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dataSubjectRequests.map(renderDataSubjectRequestCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3" />
                    <p>Nenhuma solicitação encontrada</p>
                    <p className="text-sm">Solicitações dos titulares de dados aparecerão aqui</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="mt-4">
              {renderComplianceOverview()}
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <Download className="w-12 h-12 mx-auto mb-3" />
                <p>Relatórios LGPD</p>
                <p className="text-sm">Funcionalidade em desenvolvimento</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Consent Creation Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Consentimento LGPD</DialogTitle>
            <DialogDescription>
              Criar solicitação de consentimento para processamento de dados pessoais
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ID do Paciente *</label>
              <Input
                value={consentForm.patientId}
                onChange={(e) => setConsentForm(prev => ({ ...prev, patientId: e.target.value }))}
                placeholder="Digite o ID do paciente"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Finalidade *</label>
              <Select 
                value={consentForm.purpose} 
                onValueChange={(value) => setConsentForm(prev => ({ ...prev, purpose: value as ConsentPurpose }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_treatment">Tratamento Médico</SelectItem>
                  <SelectItem value="appointment_scheduling">Agendamento</SelectItem>
                  <SelectItem value="financial_processing">Processamento Financeiro</SelectItem>
                  <SelectItem value="marketing_communication">Marketing</SelectItem>
                  <SelectItem value="service_improvement">Melhoria do Serviço</SelectItem>
                  <SelectItem value="emergency_access">Acesso de Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categorias de Dados *</label>
              <div className="space-y-2">
                {[
                  { value: "personal_identification", label: "Identificação Pessoal" },
                  { value: "health_data", label: "Dados de Saúde" },
                  { value: "financial_data", label: "Dados Financeiros" },
                  { value: "contact_information", label: "Informações de Contato" },
                ].map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={consentForm.dataCategories.includes(category.value as DataCategory)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConsentForm(prev => ({
                            ...prev,
                            dataCategories: [...prev.dataCategories, category.value as DataCategory],
                          }));
                        } else {
                          setConsentForm(prev => ({
                            ...prev,
                            dataCategories: prev.dataCategories.filter(c => c !== category.value),
                          }));
                        }
                      }}
                    />
                    <label htmlFor={category.value} className="text-sm">
                      {category.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreateConsent}
                disabled={isLoading || !consentForm.patientId || consentForm.dataCategories.length === 0}
                className="flex-1"
              >
                {isLoading ? "Criando..." : "Criar Consentimento"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConsentDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LGPDConsentManager;