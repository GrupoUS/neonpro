// CFM Professional Registration Validator Component
// React interface for Brazilian healthcare professional validation

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, AlertCircle, CheckCircle, Clock, User, Shield, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cfmValidator, generateCRMSummary, validateBrazilianCPF } from "@/lib/compliance/cfm-professional-validation";
import type {
  CFMRegistration,
  ProfessionalValidationRequest,
  ProfessionalValidationResponse,
  BrazilianState,
  MedicalSpecialty,
} from "@/types/compliance";

// =============================================================================
// INTERFACE DEFINITIONS
// =============================================================================

interface CFMValidatorProps {
  className?: string;
  onValidationComplete?: (result: ProfessionalValidationResponse) => void;
  autoValidate?: boolean;
  showRenewalAlerts?: boolean;
  compactView?: boolean;
}

interface ValidationFormData {
  crm: string;
  state: BrazilianState | "";
  doctorName: string;
  validateSpecialties: boolean;
  checkEmergencyQualification: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CFMValidator({
  className = "",
  onValidationComplete,
  autoValidate = false,
  showRenewalAlerts = true,
  compactView = false,
}: CFMValidatorProps) {
  // State management
  const [formData, setFormData] = useState<ValidationFormData>({
    crm: "",
    state: "",
    doctorName: "",
    validateSpecialties: true,
    checkEmergencyQualification: true,
  });

  const [validationResult, setValidationResult] = useState<ProfessionalValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [searchResults, setSearchResults] = useState<CFMRegistration[]>([]);
  const [renewalAlerts, setRenewalAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("validate");

  // Auto-validation effect
  useEffect(() => {
    if (autoValidate && formData.crm && formData.state) {
      handleValidation();
    }
  }, [formData.crm, formData.state, autoValidate]);

  // Load renewal alerts
  useEffect(() => {
    if (showRenewalAlerts) {
      loadRenewalAlerts();
    }
  }, [showRenewalAlerts]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleValidation = useCallback(async () => {
    if (!formData.crm || !formData.state) {
      setValidationResult({
        valid: false,
        errors: ["CRM e Estado são obrigatórios"],
        confidence: 0,
        validatedAt: new Date().toISOString(),
        nextValidationDate: new Date().toISOString(),
      });
      return;
    }

    setIsValidating(true);

    try {
      const request: ProfessionalValidationRequest = {
        crm: formData.crm,
        state: formData.state as BrazilianState,
        doctorName: formData.doctorName || undefined,
        validateSpecialties: formData.validateSpecialties,
        checkEmergencyQualification: formData.checkEmergencyQualification,
      };

      const result = await cfmValidator.validateProfessionalRegistration(request);
      
      setValidationResult(result);
      onValidationComplete?.(result);

    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({
        valid: false,
        errors: [`Erro na validação: ${error.message}`],
        confidence: 0,
        validatedAt: new Date().toISOString(),
        nextValidationDate: new Date().toISOString(),
      });
    } finally {
      setIsValidating(false);
    }
  }, [formData, onValidationComplete]);

  const handleSearch = useCallback(async () => {
    if (!formData.doctorName && !formData.state) return;

    setIsValidating(true);

    try {
      const results = await cfmValidator.searchProfessionals({
        name: formData.doctorName || undefined,
        state: formData.state as BrazilianState || undefined,
        activeOnly: true,
      });

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsValidating(false);
    }
  }, [formData.doctorName, formData.state]);

  const handleFormChange = (field: keyof ValidationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation result when form changes
    if (field === "crm" || field === "state") {
      setValidationResult(null);
    }
  };

  const loadRenewalAlerts = async () => {
    try {
      // In production, this would load from current registrations
      const mockRegistrations = ["CRM-SP-123456", "CRM-RJ-789012"];
      const alerts = await cfmValidator.getRenewalAlerts(mockRegistrations);
      setRenewalAlerts(alerts);
    } catch (error) {
      console.error("Error loading renewal alerts:", error);
      setRenewalAlerts([]);
    }
  };

  const selectProfessional = (registration: CFMRegistration) => {
    setFormData(prev => ({
      ...prev,
      crm: registration.crm,
      state: registration.state,
      doctorName: registration.doctorName,
    }));
    setActiveTab("validate");
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderValidationForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            CRM *
          </label>
          <Input
            placeholder="CRM-SP-123456"
            value={formData.crm}
            onChange={(e) => handleFormChange("crm", e.target.value.toUpperCase())}
            className="font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Estado *
          </label>
          <Select 
            value={formData.state} 
            onValueChange={(value) => handleFormChange("state", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SP">São Paulo (SP)</SelectItem>
              <SelectItem value="RJ">Rio de Janeiro (RJ)</SelectItem>
              <SelectItem value="MG">Minas Gerais (MG)</SelectItem>
              <SelectItem value="RS">Rio Grande do Sul (RS)</SelectItem>
              <SelectItem value="PR">Paraná (PR)</SelectItem>
              <SelectItem value="SC">Santa Catarina (SC)</SelectItem>
              <SelectItem value="BA">Bahia (BA)</SelectItem>
              <SelectItem value="GO">Goiás (GO)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Nome do Médico (opcional)
        </label>
        <Input
          placeholder="Dr. João Silva Santos"
          value={formData.doctorName}
          onChange={(e) => handleFormChange("doctorName", e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.validateSpecialties}
            onChange={(e) => handleFormChange("validateSpecialties", e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Validar especialidades</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.checkEmergencyQualification}
            onChange={(e) => handleFormChange("checkEmergencyQualification", e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Verificar qualificação emergencial</span>
        </label>
      </div>

      <Button 
        onClick={handleValidation} 
        disabled={isValidating || !formData.crm || !formData.state}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isValidating ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Validando...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Validar Registro CFM
          </>
        )}
      </Button>
    </div>
  );

  const renderValidationResult = () => {
    if (!validationResult) return null;

    const { valid, registration, errors, confidence } = validationResult;

    if (!valid) {
      return (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Validação Falhou:</strong>
            <ul className="mt-2 space-y-1">
              {errors?.map((error, index) => (
                <li key={index} className="text-sm">• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      );
    }

    if (!registration) return null;

    const summary = generateCRMSummary(registration);

    return (
      <Card className="mt-4 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Registro Validado</CardTitle>
            </div>
            <Badge 
              variant="outline"
              className={`${summary.statusBadge.color === 'green' ? 'border-green-500 text-green-700' : 
                         summary.statusBadge.color === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                         summary.statusBadge.color === 'red' ? 'border-red-500 text-red-700' : 
                         'border-gray-500 text-gray-700'}`}
            >
              {summary.statusBadge.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Informações Gerais</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Nome:</strong> {summary.displayName}</p>
                <p><strong>CRM:</strong> {summary.registrationInfo}</p>
                <p><strong>CPF:</strong> {registration.cpf}</p>
                <p><strong>Confiança:</strong> {Math.round(confidence * 100)}%</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Qualificações</h4>
              <div className="space-y-2">
                {summary.emergencyQualified && (
                  <Badge variant="outline" className="border-red-500 text-red-700">
                    <Shield className="w-3 h-3 mr-1" />
                    Emergência Qualificado
                  </Badge>
                )}
                
                {summary.prescriptionRights.controlled && (
                  <Badge variant="outline" className="border-blue-500 text-blue-700">
                    <FileText className="w-3 h-3 mr-1" />
                    Prescrição Controlada
                  </Badge>
                )}
              </div>

              {summary.prescriptionRights.controlled && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">Classes permitidas:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {registration.prescriptionRights.classes.map((cls) => (
                      <Badge key={cls} variant="secondary" className="text-xs">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Especialidades</h4>
            <div className="flex flex-wrap gap-2">
              {summary.specialties.map((specialty) => (
                <Badge key={specialty.code} variant="outline">
                  {specialty.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Renovação: {new Date(registration.renewalDate).toLocaleDateString("pt-BR")}</span>
            </div>
            
            {summary.renewalStatus.urgent && (
              <Badge variant="destructive" className="text-xs">
                Renovação Urgente
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSearchForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Nome do Profissional
          </label>
          <Input
            placeholder="Digite o nome do médico"
            value={formData.doctorName}
            onChange={(e) => handleFormChange("doctorName", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Estado (opcional)
          </label>
          <Select 
            value={formData.state} 
            onValueChange={(value) => handleFormChange("state", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os estados</SelectItem>
              <SelectItem value="SP">São Paulo (SP)</SelectItem>
              <SelectItem value="RJ">Rio de Janeiro (RJ)</SelectItem>
              <SelectItem value="MG">Minas Gerais (MG)</SelectItem>
              <SelectItem value="RS">Rio Grande do Sul (RS)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleSearch} 
        disabled={isValidating || !formData.doctorName}
        className="w-full"
        variant="outline"
      >
        {isValidating ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Buscando...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Buscar Profissionais
          </>
        )}
      </Button>

      {searchResults.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-700">Resultados da Busca</h4>
          {searchResults.map((professional) => (
            <Card 
              key={professional.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => selectProfessional(professional)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium">{professional.doctorName}</h5>
                    <p className="text-sm text-gray-600">{professional.crm}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={professional.status === "active" ? "border-green-500 text-green-700" : ""}
                  >
                    {professional.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderRenewalAlerts = () => (
    <div className="space-y-3">
      {renewalAlerts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nenhum alerta de renovação no momento.
        </p>
      ) : (
        renewalAlerts.map((alert) => (
          <Alert 
            key={alert.crm}
            className={`${
              alert.urgency === "critical" ? "border-red-500 bg-red-50" :
              alert.urgency === "high" ? "border-orange-500 bg-orange-50" :
              alert.urgency === "medium" ? "border-yellow-500 bg-yellow-50" :
              "border-blue-500 bg-blue-50"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{alert.doctorName}</p>
                  <p className="text-sm text-gray-600">{alert.crm}</p>
                  <p className="text-sm">
                    Renovação em {alert.daysUntilRenewal} dias
                    ({new Date(alert.renewalDate).toLocaleDateString("pt-BR")})
                  </p>
                </div>
                <Badge 
                  variant={alert.urgency === "critical" ? "destructive" : "secondary"}
                >
                  {alert.urgency === "critical" ? "Vencida" :
                   alert.urgency === "high" ? "Urgente" :
                   alert.urgency === "medium" ? "Atenção" : "Aviso"}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        ))
      )}
    </div>
  );

  // =============================================================================
  // RENDER
  // =============================================================================

  if (compactView) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Validação CFM
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderValidationForm()}
          {renderValidationResult()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Validador CFM - Registros Profissionais
        </CardTitle>
        <CardDescription>
          Sistema de validação de registros profissionais brasileiros (CFM, COREN, CRF)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="validate">Validar CRM</TabsTrigger>
            <TabsTrigger value="search">Buscar Profissional</TabsTrigger>
            <TabsTrigger value="alerts">Alertas de Renovação</TabsTrigger>
          </TabsList>

          <TabsContent value="validate" className="mt-4">
            {renderValidationForm()}
            {renderValidationResult()}
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            {renderSearchForm()}
          </TabsContent>

          <TabsContent value="alerts" className="mt-4">
            {renderRenewalAlerts()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CFMValidator;