// import React from 'react'; // Not needed in this component
import { useState } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Info, Shield, Settings } from 'lucide-react';

/**
 * LGPD-compliant consent banner component
 * Displays when user hasn't provided consent for data processing
 */
export function ConsentBanner() {
  const { 
    hasConsent,
    grantConsent,
    consentSettings: _consentSettings,
    updateConsentSettings: _updateConsentSettings,
    isConsentBannerVisible
  } = useConsent();

  // Don't render if consent already granted or banner hidden
  if (hasConsent('necessary') && hasConsent('analytics') && hasConsent('marketing')) {
    return null;
  }

  if (!isConsentBannerVisible) {
    return null;
  }

  const handleAcceptAll = () => {
    grantConsent('necessary');
    grantConsent('analytics');
    grantConsent('marketing');
  };

  const handleAcceptEssential = () => {
    grantConsent('necessary');
    // Keep others as false if not already granted
  };

  const [showDetailed, setShowDetailed] = useState(false);
  
  const handleCustomize = () => {
    // Toggle detailed settings view
    setShowDetailed(!showDetailed);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <Card className="mx-auto max-w-4xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Proteção de Dados Pessoais - LGPD
            </CardTitle>
          </div>
          <CardDescription className="text-sm">
            Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
            personalizar conteúdo e analisar o tráfego do site, conforme nossa{' '}
            <a href="/privacy" className="text-primary underline underline-offset-4">
              Política de Privacidade
            </a>{' '}
            e os termos da Lei Geral de Proteção de Dados (LGPD).
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {!showDetailed ? (
            // Simple consent view
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                Você tem o direito de aceitar ou recusar o processamento de seus dados.
              </div>
              
              <div className="flex gap-2 sm:flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomize}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Personalizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAcceptEssential}
                >
                  Apenas Essenciais
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Aceitar Todos
                </Button>
              </div>
            </div>
          ) : (
            // Detailed consent settings
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Essential Cookies */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Cookies Essenciais
                    </label>
                    <Badge variant="secondary" className="text-xs">
                      Sempre Ativo
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Necessários para o funcionamento básico do site, incluindo 
                    autenticação e segurança.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasConsent('analytics')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            grantConsent('analytics');
                          } else {
                            // Note: revokeConsent would be implemented in context
                            // For now, we'll handle this in the context
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Cookies Analíticos
                    </label>
                    <Badge variant={hasConsent('analytics') ? "default" : "outline"} className="text-xs">
                      {hasConsent('analytics') ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Coletam dados sobre como você usa nosso site para melhorar 
                    a experiência do usuário.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasConsent('marketing')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            grantConsent('marketing');
                          } else {
                            // Note: revokeConsent would be implemented in context
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Cookies de Marketing
                    </label>
                    <Badge variant={hasConsent('marketing') ? "default" : "outline"} className="text-xs">
                      {hasConsent('marketing') ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilizados para personalização de anúncios e conteúdo 
                    baseado em seus interesses.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-3 border-t sm:flex-row sm:justify-between sm:items-center">
                <div className="text-xs text-muted-foreground">
                  Suas preferências podem ser alteradas a qualquer momento nas configurações.
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCustomize}
                  >
                    Voltar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Save current consent settings and close banner
                      setShowDetailed(false);
                      // Note: bannerDismissed would be handled by parent component or context
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Salvar Preferências
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact consent settings component for use in settings pages
 */
export function ConsentSettings() {
  const { 
    hasConsent,
    grantConsent,
    consentHistory,
    updateConsentSettings: _updateConsentSettings 
  } = useConsent();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Preferências de Privacidade
        </CardTitle>
        <CardDescription>
          Gerencie como seus dados são utilizados de acordo com a LGPD
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">Cookies Essenciais</h4>
              <p className="text-sm text-muted-foreground">
                Necessários para funcionamento básico
              </p>
            </div>
            <Badge variant="secondary">Sempre Ativo</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">Análise e Performance</h4>
              <p className="text-sm text-muted-foreground">
                Dados sobre uso do site para melhorias
              </p>
            </div>
            <Button
              variant={hasConsent('analytics') ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (hasConsent('analytics')) {
                  // Handle revoke (to be implemented)
                } else {
                  grantConsent('analytics');
                }
              }}
            >
              {hasConsent('analytics') ? 'Ativo' : 'Ativar'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">Marketing e Personalização</h4>
              <p className="text-sm text-muted-foreground">
                Conteúdo personalizado baseado em interesses
              </p>
            </div>
            <Button
              variant={hasConsent('marketing') ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (hasConsent('marketing')) {
                  // Handle revoke (to be implemented)
                } else {
                  grantConsent('marketing');
                }
              }}
            >
              {hasConsent('marketing') ? 'Ativo' : 'Ativar'}
            </Button>
          </div>
        </div>

        {/* Consent history */}
        {consentHistory.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Histórico de Consentimento</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {consentHistory.slice(-3).map((entry: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{entry.category}</span>
                  <span>
                    {entry.granted ? 'Concedido' : 'Revogado'} - {' '}
                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}