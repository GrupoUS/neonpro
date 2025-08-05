/**
 * LGPD Compliance Framework - Consent Manager Component
 * Interface para gerenciamento de consentimentos LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º
 */

"use client";

import React, { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Switch } from "@/components/ui/switch";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Separator } from "@/components/ui/separator";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Download,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
} from "lucide-react";
import type { useLGPD } from "@/hooks/useLGPD";
import type { ConsentType, ConsentStatus, LegalBasis, ConsentRecord } from "@/types/lgpd";

// ============================================================================
// TYPES
// ============================================================================

interface ConsentManagerProps {
  clinicId: string;
  userId?: string;
  className?: string;
  onConsentChange?: (consent: ConsentRecord) => void;
}

interface ConsentDefinition {
  type: ConsentType;
  title: string;
  description: string;
  purpose: string;
  required: boolean;
  category: "essential" | "functional" | "analytics" | "marketing";
  legalBasis: LegalBasis;
}

// ============================================================================
// CONSENT DEFINITIONS
// ============================================================================

const CONSENT_DEFINITIONS: ConsentDefinition[] = [
  {
    type: ConsentType.PERSONAL_DATA,
    title: "Dados Pessoais Básicos",
    description: "Processamento de dados pessoais básicos (nome, email, telefone)",
    purpose: "Prestação de serviços médicos e comunicação",
    required: true,
    category: "essential",
    legalBasis: LegalBasis.CONTRACT,
  },
  {
    type: ConsentType.SENSITIVE_DATA,
    title: "Dados Pessoais Sensíveis",
    description: "Processamento de dados sensíveis (CPF, RG, dados biométricos)",
    purpose: "Identificação e segurança",
    required: true,
    category: "essential",
    legalBasis: LegalBasis.CONSENT,
  },
  {
    type: ConsentType.MEDICAL_DATA,
    title: "Dados Médicos",
    description: "Armazenamento e processamento de dados de saúde",
    purpose: "Prestação de cuidados médicos e acompanhamento",
    required: true,
    category: "essential",
    legalBasis: LegalBasis.VITAL_INTERESTS,
  },
  {
    type: ConsentType.MARKETING,
    title: "Comunicações de Marketing",
    description: "Envio de ofertas, promoções e comunicações comerciais",
    purpose: "Marketing direto e comunicação promocional",
    required: false,
    category: "marketing",
    legalBasis: LegalBasis.CONSENT,
  },
  {
    type: ConsentType.ANALYTICS,
    title: "Análise e Métricas",
    description: "Coleta de dados para análise de uso e melhorias",
    purpose: "Análise de performance e otimização de serviços",
    required: false,
    category: "analytics",
    legalBasis: LegalBasis.LEGITIMATE_INTERESTS,
  },
  {
    type: ConsentType.THIRD_PARTY_SHARING,
    title: "Compartilhamento com Terceiros",
    description: "Compartilhamento de dados com parceiros e fornecedores",
    purpose: "Integração com serviços externos e parceiros",
    required: false,
    category: "functional",
    legalBasis: LegalBasis.CONSENT,
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusIcon = (status: ConsentStatus) => {
  switch (status) {
    case ConsentStatus.GRANTED:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case ConsentStatus.DENIED:
      return <XCircle className="h-4 w-4 text-red-500" />;
    case ConsentStatus.WITHDRAWN:
      return <XCircle className="h-4 w-4 text-orange-500" />;
    case ConsentStatus.EXPIRED:
      return <Clock className="h-4 w-4 text-gray-500" />;
    case ConsentStatus.PENDING:
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: ConsentStatus) => {
  switch (status) {
    case ConsentStatus.GRANTED:
      return "bg-green-100 text-green-800";
    case ConsentStatus.DENIED:
      return "bg-red-100 text-red-800";
    case ConsentStatus.WITHDRAWN:
      return "bg-orange-100 text-orange-800";
    case ConsentStatus.EXPIRED:
      return "bg-gray-100 text-gray-800";
    case ConsentStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "essential":
      return "bg-blue-100 text-blue-800";
    case "functional":
      return "bg-purple-100 text-purple-800";
    case "analytics":
      return "bg-green-100 text-green-800";
    case "marketing":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ConsentManager({
  clinicId,
  userId,
  className = "",
  onConsentChange,
}: ConsentManagerProps) {
  const {
    consents,
    activeConsents,
    loading,
    error,
    grantConsent,
    withdrawConsent,
    hasValidConsent,
    getConsentByType,
    clearError,
  } = useLGPD({
    clinicId,
    onConsentChange,
  });

  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConsentToggle = async (definition: ConsentDefinition, granted: boolean) => {
    try {
      const existingConsent = getConsentByType(definition.type);

      if (granted) {
        await grantConsent(definition.type, {
          purpose: definition.purpose,
          description: definition.description,
          legalBasis: definition.legalBasis,
        });
      } else if (existingConsent) {
        await withdrawConsent(existingConsent.id);
      }
    } catch (error) {
      console.error("Failed to toggle consent:", error);
    }
  };

  const handleViewDetails = (consent: ConsentRecord) => {
    setSelectedConsent(consent);
    setIsDetailsOpen(true);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderConsentItem = (definition: ConsentDefinition) => {
    const existingConsent = getConsentByType(definition.type);
    const isGranted = hasValidConsent(definition.type);
    const isExpired =
      existingConsent?.expiresAt && new Date(existingConsent.expiresAt) < new Date();

    return (
      <Card key={definition.type} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-sm">{definition.title}</h3>
                <Badge variant="outline" className={getCategoryColor(definition.category)}>
                  {definition.category}
                </Badge>
                {definition.required && (
                  <Badge variant="destructive" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
              </div>

              <p className="text-xs text-gray-600 mb-2">{definition.description}</p>

              <p className="text-xs text-gray-500">
                <strong>Finalidade:</strong> {definition.purpose}
              </p>

              {existingConsent && (
                <div className="flex items-center gap-2 mt-2">
                  {getStatusIcon(existingConsent.status)}
                  <Badge className={getStatusColor(existingConsent.status)}>
                    {existingConsent.status}
                  </Badge>
                  {existingConsent.grantedAt && (
                    <span className="text-xs text-gray-500">
                      Concedido em {new Date(existingConsent.grantedAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      Expirado
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              {existingConsent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(existingConsent)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}

              <Switch
                checked={isGranted && !isExpired}
                onCheckedChange={(checked) => handleConsentToggle(definition, checked)}
                disabled={loading || (definition.required && isGranted)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConsentDetails = () => {
    if (!selectedConsent) return null;

    const definition = CONSENT_DEFINITIONS.find((d) => d.type === selectedConsent.consentType);

    return (
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detalhes do Consentimento
            </DialogTitle>
            <DialogDescription>Informações detalhadas sobre o consentimento LGPD</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Informações Básicas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <p>{definition?.title || selectedConsent.consentType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedConsent.status)}
                    <Badge className={getStatusColor(selectedConsent.status)}>
                      {selectedConsent.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Base Legal:</span>
                  <p>{selectedConsent.legalBasis}</p>
                </div>
                <div>
                  <span className="text-gray-500">Versão:</span>
                  <p>{selectedConsent.version}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Finalidade</h4>
              <p className="text-sm text-gray-600">{selectedConsent.purpose}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Descrição</h4>
              <p className="text-sm text-gray-600">{selectedConsent.description}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Histórico</h4>
              <div className="space-y-2 text-sm">
                {selectedConsent.grantedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Concedido em:</span>
                    <span>{new Date(selectedConsent.grantedAt).toLocaleString("pt-BR")}</span>
                  </div>
                )}
                {selectedConsent.withdrawnAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revogado em:</span>
                    <span>{new Date(selectedConsent.withdrawnAt).toLocaleString("pt-BR")}</span>
                  </div>
                )}
                {selectedConsent.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expira em:</span>
                    <span>{new Date(selectedConsent.expiresAt).toLocaleString("pt-BR")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Criado em:</span>
                  <span>{new Date(selectedConsent.createdAt).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Informações Técnicas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">IP Address:</span>
                  <span className="font-mono">{selectedConsent.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User Agent:</span>
                  <span className="font-mono text-xs truncate max-w-xs">
                    {selectedConsent.userAgent}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Consentimentos LGPD
          </CardTitle>
          <CardDescription>
            Gerencie seus consentimentos de acordo com a Lei Geral de Proteção de Dados
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button variant="link" size="sm" onClick={clearError} className="ml-2 p-0 h-auto">
                  Dispensar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Status dos Consentimentos</h3>
              <Badge variant="outline">
                {activeConsents.length} de {CONSENT_DEFINITIONS.length} ativos
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium text-green-700">
                  {consents.filter((c) => c.status === ConsentStatus.GRANTED).length}
                </div>
                <div className="text-green-600">Concedidos</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-medium text-red-700">
                  {consents.filter((c) => c.status === ConsentStatus.WITHDRAWN).length}
                </div>
                <div className="text-red-600">Revogados</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-medium text-gray-700">
                  {consents.filter((c) => c.status === ConsentStatus.EXPIRED).length}
                </div>
                <div className="text-gray-600">Expirados</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-700">
                  {consents.filter((c) => c.status === ConsentStatus.PENDING).length}
                </div>
                <div className="text-yellow-600">Pendentes</div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <ScrollArea className="h-96">
            <div className="space-y-2">{CONSENT_DEFINITIONS.map(renderConsentItem)}</div>
          </ScrollArea>
        </CardContent>
      </Card>

      {renderConsentDetails()}
    </div>
  );
}

export default ConsentManager;
