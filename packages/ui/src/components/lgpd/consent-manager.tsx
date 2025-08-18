"use client";

import { AlertTriangle, Check, Clock, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";
import { Switch } from "../Switch";

// ============================================================================
// TYPES
// ============================================================================

type ConsentPurpose = {
  purpose: string;
  description: string;
  category: string;
  required: boolean;
  granted: boolean;
  grantedAt: string | null;
  version: string | null;
};

type ConsentData = {
  consents: ConsentPurpose[];
};

// ============================================================================
// CONSENT MANAGEMENT COMPONENT
// ============================================================================

export function ConsentManager() {
  const [consents, setConsents] = useState<ConsentPurpose[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadConsentStatus = async () => {
    try {
      const response = await fetch("/api/lgpd/consent/status");
      if (!response.ok) {
        throw new Error("Failed to load consent status");
      }

      const data: ConsentData = await response.json();
      setConsents(data.consents);
    } catch (_error) {
      toast.error("Erro ao carregar status de consentimento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsentStatus();
  }, [loadConsentStatus]);

  const updateConsent = async (purposeName: string, granted: boolean) => {
    setUpdating(purposeName);

    try {
      const response = await fetch("/api/lgpd/consent/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purposeName,
          granted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update consent");
      }

      // Reload consent status
      await loadConsentStatus();

      toast.success(
        granted
          ? `Consentimento concedido para ${purposeName}`
          : `Consentimento negado para ${purposeName}`,
      );
    } catch (_error) {
      toast.error("Erro ao atualizar consentimento");
    } finally {
      setUpdating(null);
    }
  };

  const withdrawConsent = async (purposeName: string) => {
    try {
      const response = await fetch("/api/lgpd/consent/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purposeName,
          reason: "User withdrawal via interface",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to withdraw consent");
      }

      await loadConsentStatus();
      toast.success(`Consentimento retirado para ${purposeName}`);
    } catch (_error) {
      toast.error("Erro ao retirar consentimento");
    }
  };

  const _getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "essential":
        return <Shield className="h-4 w-4 text-green-600" />;
      case "functional":
        return <Check className="h-4 w-4 text-blue-600" />;
      case "analytics":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "marketing":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const _getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "essential":
        return "bg-green-100 text-green-800";
      case "functional":
        return "bg-blue-100 text-blue-800";
      case "analytics":
        return "bg-yellow-100 text-yellow-800";
      case "marketing":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Consentimento
          </CardTitle>
          <CardDescription>Carregando suas preferências de privacidade...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div className="h-20 rounded-lg bg-gray-200" key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const requiredConsents = consents.filter((c) => c.required);
  const optionalConsents = consents.filter((c) => !c.required);
  const allRequiredGranted = requiredConsents.every((c) => c.granted);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Consentimento - LGPD
          </CardTitle>
          <CardDescription>
            Gerencie suas preferências de privacidade e consentimentos de acordo com a LGPD
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!allRequiredGranted && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Alguns consentimentos obrigatórios não foram concedidos. Isso pode afetar o
                funcionamento completo da plataforma.
              </AlertDescription>
            </Alert>
          )}

          {/* Required Consents */}
          {requiredConsents.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 font-semibold text-lg text-red-600">
                Consentimentos Obrigatórios
              </h3>
              <div className="space-y-4">
                {requiredConsents.map((consent) => (
                  <ConsentCard
                    consent={consent}
                    key={consent.purpose}
                    onUpdate={updateConsent}
                    onWithdraw={withdrawConsent}
                    updating={updating === consent.purpose}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional Consents */}
          {optionalConsents.length > 0 && (
            <div>
              <h3 className="mb-4 font-semibold text-blue-600 text-lg">Consentimentos Opcionais</h3>
              <div className="space-y-4">
                {optionalConsents.map((consent) => (
                  <ConsentCard
                    consent={consent}
                    key={consent.purpose}
                    onUpdate={updateConsent}
                    onWithdraw={withdrawConsent}
                    updating={updating === consent.purpose}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// CONSENT CARD COMPONENT
// ============================================================================

type ConsentCardProps = {
  consent: ConsentPurpose;
  updating: boolean;
  onUpdate: (purposeName: string, granted: boolean) => Promise<void>;
  onWithdraw: (purposeName: string) => Promise<void>;
};

function ConsentCard({ consent, updating, onUpdate, onWithdraw }: ConsentCardProps) {
  return (
    <Card
      className={`transition-all duration-200 ${
        consent.granted ? "border-green-200 bg-green-50" : "border-gray-200"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                {consent.granted ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
                <h4 className="font-medium">{consent.purpose}</h4>
              </div>
              <Badge className={getCategoryColor(consent.category)}>{consent.category}</Badge>
              {consent.required && (
                <Badge className="text-xs" variant="destructive">
                  Obrigatório
                </Badge>
              )}
            </div>

            <p className="mb-3 text-gray-600 text-sm">{consent.description}</p>

            {consent.granted && consent.grantedAt && (
              <p className="text-gray-500 text-xs">
                Consentido em: {new Date(consent.grantedAt).toLocaleString("pt-BR")}
                {consent.version && ` (v${consent.version})`}
              </p>
            )}
          </div>

          <div className="ml-4 flex items-center gap-2">
            <Switch
              checked={consent.granted}
              disabled={updating}
              onCheckedChange={(checked: boolean) => onUpdate(consent.purpose, checked)}
            />

            {consent.granted && !consent.required && (
              <Button
                className="text-red-600 hover:text-red-700"
                disabled={updating}
                onClick={() => onWithdraw(consent.purpose)}
                size="sm"
                variant="outline"
              >
                Retirar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case "essential":
      return "bg-green-100 text-green-800";
    case "functional":
      return "bg-blue-100 text-blue-800";
    case "analytics":
      return "bg-yellow-100 text-yellow-800";
    case "marketing":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
