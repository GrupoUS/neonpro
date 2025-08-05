"use client";

import React, { useState, useEffect } from "react";
import type { Check, X, AlertCircle, Clock, Shield } from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Switch } from "@/components/ui/switch";
import type { Separator } from "@/components/ui/separator";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CommunicationConsent } from "@/types/communication";
import type { createClient } from "@/lib/supabase/client";
import type { useToast } from "@/hooks/use-toast";
import type { formatDistanceToNow } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { cn } from "@/lib/utils";

export interface ConsentManagerProps {
  patientId: string;
  consents: CommunicationConsent[];
  onConsentUpdate: (consent: CommunicationConsent) => void;
  className?: string;
}

interface ConsentType {
  key: string;
  label: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
  category: "communication" | "marketing" | "analytics";
}

const CONSENT_TYPES: ConsentType[] = [
  {
    key: "email",
    label: "Comunicação por Email",
    description: "Receber lembretes de consultas, resultados e informações importantes por email",
    required: true,
    icon: <Shield className="w-4 h-4" />,
    category: "communication",
  },
  {
    key: "sms",
    label: "Mensagens SMS",
    description: "Receber notificações urgentes e lembretes por SMS",
    required: true,
    icon: <Shield className="w-4 h-4" />,
    category: "communication",
  },
  {
    key: "push",
    label: "Notificações Push",
    description: "Receber notificações no aplicativo e navegador",
    required: false,
    icon: <Shield className="w-4 h-4" />,
    category: "communication",
  },
  {
    key: "marketing",
    label: "Marketing e Promoções",
    description: "Receber informações sobre novos tratamentos, promoções e eventos",
    required: false,
    icon: <Shield className="w-4 h-4" />,
    category: "marketing",
  },
  {
    key: "analytics",
    label: "Análise de Comportamento",
    description: "Permitir análise anônima para melhorar nossos serviços",
    required: false,
    icon: <Shield className="w-4 h-4" />,
    category: "analytics",
  },
];

export function ConsentManager({
  patientId,
  consents,
  onConsentUpdate,
  className,
}: ConsentManagerProps) {
  const [loading, setLoading] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // Obter status de consentimento para um tipo específico
  const getConsentStatus = (consentType: string) => {
    return consents.find((c) => c.consent_type === consentType);
  };

  // Atualizar consentimento
  const updateConsent = async (consentType: string, consented: boolean, reason?: string) => {
    setLoading(true);

    try {
      const existingConsent = getConsentStatus(consentType);
      const now = new Date().toISOString();

      const consentData = {
        patient_id: patientId,
        consent_type: consentType,
        consented,
        consented_at: consented ? now : null,
        revoked_at: !consented ? now : null,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        metadata: {
          reason,
          updated_by: "patient_portal",
          timestamp: now,
        },
      };

      let response;

      if (existingConsent) {
        // Atualizar consentimento existente
        response = await supabase
          .from("communication_consents")
          .update({
            ...consentData,
            updated_at: now,
          })
          .eq("id", existingConsent.id)
          .select()
          .single();
      } else {
        // Criar novo consentimento
        response = await supabase
          .from("communication_consents")
          .insert(consentData)
          .select()
          .single();
      }

      if (response.error) throw response.error;

      // Log de auditoria
      await supabase.from("communication_audit_logs").insert({
        entity_type: "consent",
        entity_id: response.data.id,
        action: consented ? "consent_granted" : "consent_revoked",
        user_id: patientId,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        details: {
          consent_type: consentType,
          previous_status: existingConsent?.consented,
          new_status: consented,
          reason,
        },
      });

      onConsentUpdate(response.data);

      toast({
        title: consented ? "Consentimento concedido" : "Consentimento revogado",
        description: `${CONSENT_TYPES.find((t) => t.key === consentType)?.label} ${
          consented ? "ativado" : "desativado"
        } com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar consentimento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowRevokeDialog(null);
    }
  };

  // Obter IP do cliente (simulado - em produção usar serviço real)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return "0.0.0.0";
    }
  };

  // Renderizar item de consentimento
  const renderConsentItem = (consentType: ConsentType) => {
    const consent = getConsentStatus(consentType.key);
    const isConsented = consent?.consented || false;
    const isRequired = consentType.required;

    return (
      <div key={consentType.key} className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {consentType.icon}
              <h4 className="font-medium">{consentType.label}</h4>
              {isRequired && (
                <Badge variant="destructive" className="text-xs">
                  Obrigatório
                </Badge>
              )}
              <Badge variant={isConsented ? "default" : "secondary"} className="text-xs">
                {isConsented ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{consentType.description}</p>

            {consent && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isConsented ? "Concedido" : "Revogado"}{" "}
                  {formatDistanceToNow(
                    new Date(isConsented ? consent.consented_at! : consent.revoked_at!),
                    { addSuffix: true, locale: ptBR },
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isRequired && !isConsented && <AlertCircle className="w-4 h-4 text-destructive" />}

            {isConsented ? (
              <Dialog
                open={showRevokeDialog === consentType.key}
                onOpenChange={(open) => setShowRevokeDialog(open ? consentType.key : null)}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={loading}>
                    <X className="w-3 h-3 mr-1" />
                    Revogar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Revogar Consentimento</DialogTitle>
                    <DialogDescription>
                      Você está prestes a revogar o consentimento para{" "}
                      <strong>{consentType.label}</strong>.
                      {isRequired && (
                        <Alert className="mt-3">
                          <AlertCircle className="w-4 h-4" />
                          <AlertDescription>
                            <strong>Atenção:</strong> Este consentimento é obrigatório para o
                            funcionamento adequado dos nossos serviços. Revogar pode afetar sua
                            experiência.
                          </AlertDescription>
                        </Alert>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRevokeDialog(null)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateConsent(consentType.key, false)}
                      disabled={loading}
                    >
                      Confirmar Revogação
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                size="sm"
                onClick={() => updateConsent(consentType.key, true)}
                disabled={loading}
              >
                <Check className="w-3 h-3 mr-1" />
                Conceder
              </Button>
            )}
          </div>
        </div>
        <Separator />
      </div>
    );
  };

  // Agrupar consentimentos por categoria
  const groupedConsents = CONSENT_TYPES.reduce(
    (acc, consentType) => {
      if (!acc[consentType.category]) {
        acc[consentType.category] = [];
      }
      acc[consentType.category].push(consentType);
      return acc;
    },
    {} as Record<string, ConsentType[]>,
  );

  const categoryLabels = {
    communication: "Comunicação Essencial",
    marketing: "Marketing e Promoções",
    analytics: "Análise e Melhorias",
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Gerenciamento de Consentimentos
        </CardTitle>
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>LGPD - Lei Geral de Proteção de Dados:</strong> Você tem o direito de controlar
            como seus dados são utilizados. Pode revogar consentimentos a qualquer momento.
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.entries(groupedConsents).map(([category, types]) => (
          <div key={category} className="space-y-4">
            <h3 className="font-semibold text-lg">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-4">{types.map(renderConsentItem)}</div>
          </div>
        ))}

        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-xs">
            <strong>Importante:</strong> Todas as ações de consentimento são registradas para fins
            de auditoria e compliance. Os dados são armazenados de forma segura conforme as normas
            da LGPD.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
