'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@neonpro/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@neonpro/ui/card';
import { Badge } from '@neonpro/ui/badge';
import { Switch } from '@neonpro/ui/switch';
import { Alert, AlertDescription } from '@neonpro/ui/alert';
import { toast } from 'sonner';
import { Shield, Check, X, Clock, AlertTriangle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ConsentPurpose {
  purpose: string;
  description: string;
  category: string;
  required: boolean;
  granted: boolean;
  grantedAt: string | null;
  version: string | null;
}

interface ConsentData {
  consents: ConsentPurpose[];
}

// ============================================================================
// CONSENT MANAGEMENT COMPONENT
// ============================================================================

export function ConsentManager() {
  const [consents, setConsents] = useState<ConsentPurpose[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadConsentStatus();
  }, []);

  const loadConsentStatus = async () => {
    try {
      const response = await fetch('/api/lgpd/consent/status');
      if (!response.ok) {
        throw new Error('Failed to load consent status');
      }

      const data: ConsentData = await response.json();
      setConsents(data.consents);
    } catch (error) {
      console.error('Load consent status error:', error);
      toast.error('Erro ao carregar status de consentimento');
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (purposeName: string, granted: boolean) => {
    setUpdating(purposeName);

    try {
      const response = await fetch('/api/lgpd/consent/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purposeName,
          granted,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update consent');
      }

      // Reload consent status
      await loadConsentStatus();

      toast.success(
        granted
          ? `Consentimento concedido para ${purposeName}`
          : `Consentimento negado para ${purposeName}`
      );
    } catch (error) {
      console.error('Update consent error:', error);
      toast.error('Erro ao atualizar consentimento');
    } finally {
      setUpdating(null);
    }
  };

  const withdrawConsent = async (purposeName: string) => {
    try {
      const response = await fetch('/api/lgpd/consent/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purposeName,
          reason: 'User withdrawal via interface',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to withdraw consent');
      }

      await loadConsentStatus();
      toast.success(`Consentimento retirado para ${purposeName}`);
    } catch (error) {
      console.error('Withdraw consent error:', error);
      toast.error('Erro ao retirar consentimento');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'essential':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'functional':
        return <Check className="w-4 h-4 text-blue-600" />;
      case 'analytics':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'marketing':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'essential':
        return 'bg-green-100 text-green-800';
      case 'functional':
        return 'bg-blue-100 text-blue-800';
      case 'analytics':
        return 'bg-yellow-100 text-yellow-800';
      case 'marketing':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gerenciamento de Consentimento
          </CardTitle>
          <CardDescription>
            Carregando suas preferências de privacidade...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg" />
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
            <Shield className="w-5 h-5" />
            Gerenciamento de Consentimento - LGPD
          </CardTitle>
          <CardDescription>
            Gerencie suas preferências de privacidade e consentimentos de acordo
            com a LGPD
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!allRequiredGranted && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Alguns consentimentos obrigatórios não foram concedidos. Isso
                pode afetar o funcionamento completo da plataforma.
              </AlertDescription>
            </Alert>
          )}

          {/* Required Consents */}
          {requiredConsents.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-red-600">
                Consentimentos Obrigatórios
              </h3>
              <div className="space-y-4">
                {requiredConsents.map((consent) => (
                  <ConsentCard
                    key={consent.purpose}
                    consent={consent}
                    updating={updating === consent.purpose}
                    onUpdate={updateConsent}
                    onWithdraw={withdrawConsent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional Consents */}
          {optionalConsents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-600">
                Consentimentos Opcionais
              </h3>
              <div className="space-y-4">
                {optionalConsents.map((consent) => (
                  <ConsentCard
                    key={consent.purpose}
                    consent={consent}
                    updating={updating === consent.purpose}
                    onUpdate={updateConsent}
                    onWithdraw={withdrawConsent}
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

interface ConsentCardProps {
  consent: ConsentPurpose;
  updating: boolean;
  onUpdate: (purposeName: string, granted: boolean) => Promise<void>;
  onWithdraw: (purposeName: string) => Promise<void>;
}

function ConsentCard({
  consent,
  updating,
  onUpdate,
  onWithdraw,
}: ConsentCardProps) {
  return (
    <Card
      className={`transition-all duration-200 ${
        consent.granted ? 'border-green-200 bg-green-50' : 'border-gray-200'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                {consent.granted ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <X className="w-4 h-4 text-red-600" />
                )}
                <h4 className="font-medium">{consent.purpose}</h4>
              </div>
              <Badge className={getCategoryColor(consent.category)}>
                {consent.category}
              </Badge>
              {consent.required && (
                <Badge variant="destructive" className="text-xs">
                  Obrigatório
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-3">{consent.description}</p>

            {consent.granted && consent.grantedAt && (
              <p className="text-xs text-gray-500">
                Consentido em:{' '}
                {new Date(consent.grantedAt).toLocaleString('pt-BR')}
                {consent.version && ` (v${consent.version})`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Switch
              checked={consent.granted}
              onCheckedChange={(checked) => onUpdate(consent.purpose, checked)}
              disabled={updating}
            />

            {consent.granted && !consent.required && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWithdraw(consent.purpose)}
                disabled={updating}
                className="text-red-600 hover:text-red-700"
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
    case 'essential':
      return 'bg-green-100 text-green-800';
    case 'functional':
      return 'bg-blue-100 text-blue-800';
    case 'analytics':
      return 'bg-yellow-100 text-yellow-800';
    case 'marketing':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}