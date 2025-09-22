// import React from 'react'; // Not needed in this component
import { Badge } from '@neonpro/ui';
import { Card } from '@neonpro/ui';
import { Link } from '@tanstack/react-router';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useConsent } from '../contexts/ConsentContext';

/**
 * LGPD-compliant consent banner component
 * Displays when user hasn't provided consent for data processing
 */
export function ConsentBanner() {
  const {
    hasConsent,
    acceptAll,
    rejectOptional,
    updatePreferences,
    isConsentBannerVisible,
  } = useConsent();

  // Don't render if consent already granted or banner hidden
  if (
    hasConsent('necessary')
    && hasConsent('analytics')
    && hasConsent('marketing')
  ) {
    return null;
  }

  if (!isConsentBannerVisible) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleAcceptEssential = () => {
    rejectOptional();
  };

  const [showDetailed, setShowDetailed] = useState(false);

  const handleCustomize = () => {
    // Toggle detailed settings view
    setShowDetailed(!showDetailed);
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-lg'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <Shield className='h-4 w-4 text-primary flex-shrink-0' />
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-foreground truncate'>
                🍪 LGPD - Utilizamos cookies para melhorar sua experiência
              </p>
              <p className='text-xs text-muted-foreground'>
                Conforme nossa{' '}
                <Button
                  asChild
                  variant='link'
                  className='p-0 h-auto text-primary'
                >
                  <Link to='/settings' className='hover:underline'>
                    Política de Privacidade
                  </Link>
                </Button>
              </p>
            </div>
          </div>

          {!showDetailed
            ? (
              // Simple consent view - compact buttons
              <div className='flex items-center gap-2 flex-shrink-0'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCustomize}
                  className='text-xs h-8 px-3'
                >
                  <Settings className='h-3 w-3 mr-1' />
                  Personalizar
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleAcceptEssential}
                  className='text-xs h-8 px-3'
                >
                  Apenas Essenciais
                </Button>
                <Button
                  size='sm'
                  onClick={handleAcceptAll}
                  className='bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 px-3'
                >
                  Aceitar Todos
                </Button>
              </div>
            )
            : ( // Detailed consent settings - expanded modal-like view
              <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]'>
                <Card className='w-full max-w-2xl max-h-[80vh] overflow-y-auto'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Shield className='h-5 w-5 text-primary' />
                        <CardTitle className='text-lg'>
                          Configurações de Privacidade - LGPD
                        </CardTitle>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setShowDetailed(false)}
                        className='h-8 w-8 p-0'
                      >
                        ✕
                      </Button>
                    </div>
                    <CardDescription>
                      Gerencie suas preferências de cookies e dados pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4'>
                      {/* Essential Cookies */}
                      <div className='space-y-2 p-4 border rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <label className='text-sm font-medium flex items-center gap-2'>
                            <CheckCircle className='h-4 w-4 text-green-600' />
                            Cookies Essenciais
                          </label>
                          <Badge variant='secondary' className='text-xs'>
                            Sempre Ativo
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Necessários para o funcionamento básico do site, incluindo autenticação e
                          segurança.
                        </p>
                      </div>

                      {/* Analytics Cookies */}
                      <div className='space-y-2 p-4 border rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <label className='text-sm font-medium flex items-center gap-2'>
                            <input
                              type='checkbox'
                              checked={hasConsent('analytics')}
                              onChange={e => {
                                updatePreferences({
                                  analytics: e.target.checked,
                                });
                              }}
                              className='h-4 w-4 rounded border-gray-300'
                            />
                            Cookies Analíticos
                          </label>
                          <Badge
                            variant={hasConsent('analytics') ? 'default' : 'outline'}
                            className='text-xs'
                          >
                            {hasConsent('analytics') ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Coletam dados sobre como você usa nosso site para melhorar a experiência
                          do usuário.
                        </p>
                      </div>

                      {/* Marketing Cookies */}
                      <div className='space-y-2 p-4 border rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <label className='text-sm font-medium flex items-center gap-2'>
                            <input
                              type='checkbox'
                              checked={hasConsent('marketing')}
                              onChange={e => {
                                updatePreferences({
                                  marketing: e.target.checked,
                                });
                              }}
                              className='h-4 w-4 rounded border-gray-300'
                            />
                            Cookies de Marketing
                          </label>
                          <Badge
                            variant={hasConsent('marketing') ? 'default' : 'outline'}
                            className='text-xs'
                          >
                            {hasConsent('marketing') ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Utilizados para personalização de anúncios e conteúdo baseado em seus
                          interesses.
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className='flex flex-col gap-2 pt-4 border-t sm:flex-row sm:justify-between sm:items-center'>
                      <div className='text-xs text-muted-foreground'>
                        Suas preferências podem ser alteradas a qualquer momento nas configurações.
                      </div>

                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setShowDetailed(false)}
                        >
                          Voltar
                        </Button>
                        <Button
                          size='sm'
                          onClick={() => {
                            // Save current consent settings and close banner
                            setShowDetailed(false);
                            // Note: bannerDismissed would be handled by parent component or context
                          }}
                          className='bg-primary text-primary-foreground hover:bg-primary/90'
                        >
                          Salvar Preferências
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact consent settings component for use in settings pages
 */
export function ConsentSettings() {
  const {
    hasConsent,
    consentHistory,
    updateConsentSettings: updateConsentSettings,
    updatePreferences,
  } = useConsent();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          Preferências de Privacidade
        </CardTitle>
        <CardDescription>
          Gerencie como seus dados são utilizados de acordo com a LGPD
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <div className='flex items-center justify-between p-3 border rounded-lg'>
            <div className='space-y-1'>
              <h4 className='font-medium'>Cookies Essenciais</h4>
              <p className='text-sm text-muted-foreground'>
                Necessários para funcionamento básico
              </p>
            </div>
            <Badge variant='secondary'>Sempre Ativo</Badge>
          </div>

          <div className='flex items-center justify-between p-3 border rounded-lg'>
            <div className='space-y-1'>
              <h4 className='font-medium'>Análise e Performance</h4>
              <p className='text-sm text-muted-foreground'>
                Dados sobre uso do site para melhorias
              </p>
            </div>
            <Button
              variant={hasConsent('analytics') ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                updatePreferences({ analytics: !hasConsent('analytics') });
              }}
            >
              {hasConsent('analytics') ? 'Ativo' : 'Ativar'}
            </Button>
          </div>

          <div className='flex items-center justify-between p-3 border rounded-lg'>
            <div className='space-y-1'>
              <h4 className='font-medium'>Marketing e Personalização</h4>
              <p className='text-sm text-muted-foreground'>
                Conteúdo personalizado baseado em interesses
              </p>
            </div>
            <Button
              variant={hasConsent('marketing') ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                updatePreferences({ marketing: !hasConsent('marketing') });
              }}
            >
              {hasConsent('marketing') ? 'Ativo' : 'Ativar'}
            </Button>
          </div>
        </div>

        {/* Consent history */}
        {consentHistory.length > 0 && (
          <div className='pt-4 border-t'>
            <h4 className='font-medium mb-2'>Histórico de Consentimento</h4>
            <div className='space-y-1 text-sm text-muted-foreground'>
              {consentHistory.slice(-3).map((entry: any, index: number) => (
                <div key={index} className='flex justify-between'>
                  <span>{entry.category}</span>
                  <span>
                    {entry.granted ? 'Concedido' : 'Revogado'} -{'  '}
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
