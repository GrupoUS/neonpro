'use client';

import {
  BarChart3,
  Check,
  Cookie,
  ExternalLink,
  FileText,
  Globe,
  Info,
  Lock,
  Mail,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useConsentBanner } from '@/hooks/useLGPD';

interface ConsentBannerProps {
  position?: 'top' | 'bottom';
  theme?: 'light' | 'dark';
  showLogo?: boolean;
  companyName?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export function ConsentBanner({
  position = 'bottom',
  theme = 'light',
  showLogo = true,
  companyName = 'NeonPro',
  privacyPolicyUrl = '/privacy-policy',
  termsOfServiceUrl = '/terms-of-service',
}: ConsentBannerProps) {
  const {
    purposes,
    userConsents,
    isVisible,
    isLoading,
    giveConsent,
    withdrawConsent,
    acceptAll,
    rejectAll,
    hideConsentBanner,
  } = useConsentBanner();

  const [selectedPurposes, setSelectedPurposes] = useState<
    Record<string, boolean>
  >({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Inicializar com consentimentos existentes
    const initialConsents: Record<string, boolean> = {};
    purposes?.forEach((purpose) => {
      const existingConsent = userConsents?.find(
        (c) => c.purpose_id === purpose.id
      );
      initialConsents[purpose.id] = existingConsent?.status === 'given';
    });
    setSelectedPurposes(initialConsents);
  }, [purposes, userConsents]);

  const handlePurposeToggle = (purposeId: string, checked: boolean) => {
    setSelectedPurposes((prev) => ({
      ...prev,
      [purposeId]: checked,
    }));
  };

  const handleSavePreferences = async () => {
    try {
      for (const [purposeId, granted] of Object.entries(selectedPurposes)) {
        if (granted) {
          await giveConsent(purposeId);
        } else {
          await withdrawConsent(purposeId);
        }
      }
      hideConsentBanner();
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  const handleAcceptAll = async () => {
    try {
      await acceptAll();
      hideConsentBanner();
    } catch (error) {
      console.error('Erro ao aceitar todos:', error);
    }
  };

  const handleRejectAll = async () => {
    try {
      await rejectAll();
      hideConsentBanner();
    } catch (error) {
      console.error('Erro ao rejeitar todos:', error);
    }
  };

  const getPurposeIcon = (category: string) => {
    switch (category) {
      case 'essential':
        return <Shield className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'marketing':
        return <Mail className="h-4 w-4" />;
      case 'personalization':
        return <Users className="h-4 w-4" />;
      case 'advertising':
        return <Globe className="h-4 w-4" />;
      default:
        return <Cookie className="h-4 w-4" />;
    }
  };

  const getPurposeColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-green-100 text-green-800';
      case 'analytics':
        return 'bg-blue-100 text-blue-800';
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      case 'personalization':
        return 'bg-orange-100 text-orange-800';
      case 'advertising':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isVisible || isLoading) {
    return null;
  }

  const essentialPurposes =
    purposes?.filter((p) => p.category === 'essential') || [];
  const optionalPurposes =
    purposes?.filter((p) => p.category !== 'essential') || [];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />

      {/* Banner */}
      <div
        className={`fixed right-0 left-0 z-50 ${
          position === 'top' ? 'top-0' : 'bottom-0'
        }`}
      >
        <Card
          className={`mx-4 mb-4 border-2 shadow-lg ${
            theme === 'dark'
              ? 'border-gray-700 bg-gray-900 text-white'
              : 'border-gray-200 bg-white'
          }`}
        >
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {showLogo && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-lg">
                    <Cookie className="h-5 w-5" />
                    Suas Preferências de Privacidade
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Respeitamos sua privacidade e seguimos a LGPD
                  </p>
                </div>
              </div>

              <Button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => hideConsentBanner()}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Resumo */}
              <div
                className={`rounded-lg border p-4 ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-800'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="text-sm leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar sua
                  experiência, personalizar conteúdo e analisar nosso tráfego.
                  Você pode escolher quais tipos de dados deseja compartilhar
                  conosco.
                </p>
              </div>

              {/* Cookies essenciais */}
              {essentialPurposes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">
                      Cookies Essenciais
                    </span>
                    <Badge
                      className="bg-green-100 text-green-800"
                      variant="secondary"
                    >
                      Sempre Ativo
                    </Badge>
                  </div>
                  <p className="ml-6 text-gray-600 text-xs">
                    Necessários para o funcionamento básico do site. Não podem
                    ser desabilitados.
                  </p>
                </div>
              )}

              {/* Cookies opcionais */}
              {optionalPurposes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      Cookies Opcionais
                    </span>
                  </div>

                  <div className="ml-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {optionalPurposes.map((purpose) => (
                      <div
                        className="flex items-center space-x-3"
                        key={purpose.id}
                      >
                        <Checkbox
                          checked={selectedPurposes[purpose.id]}
                          id={purpose.id}
                          onCheckedChange={(checked) =>
                            handlePurposeToggle(purpose.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getPurposeIcon(purpose.category)}
                            <label
                              className="cursor-pointer font-medium text-sm"
                              htmlFor={purpose.id}
                            >
                              {purpose.name}
                            </label>
                            <Badge
                              className={getPurposeColor(purpose.category)}
                              variant="outline"
                            >
                              {purpose.category}
                            </Badge>
                          </div>
                          <p className="mt-1 text-gray-600 text-xs">
                            {purpose.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links legais */}
              <div className="flex items-center gap-4 text-gray-600 text-xs">
                <a
                  className="flex items-center gap-1 transition-colors hover:text-blue-600"
                  href={privacyPolicyUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FileText className="h-3 w-3" />
                  Política de Privacidade
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  className="flex items-center gap-1 transition-colors hover:text-blue-600"
                  href={termsOfServiceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Lock className="h-3 w-3" />
                  Termos de Uso
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
                <div className="flex flex-1 gap-2">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                    onClick={handleAcceptAll}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Aceitar Todos
                  </Button>

                  <Button
                    disabled={isLoading}
                    onClick={handleRejectAll}
                    variant="outline"
                  >
                    Rejeitar Opcionais
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    disabled={isLoading}
                    onClick={handleSavePreferences}
                    variant="outline"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Salvar Preferências
                  </Button>

                  <Dialog onOpenChange={setShowDetails} open={showDetails}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Info className="mr-2 h-4 w-4" />
                        Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Detalhes sobre Cookies e Privacidade
                        </DialogTitle>
                        <DialogDescription>
                          Informações detalhadas sobre como utilizamos seus
                          dados
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        <Accordion className="w-full" collapsible type="single">
                          {purposes?.map((purpose) => (
                            <AccordionItem key={purpose.id} value={purpose.id}>
                              <AccordionTrigger className="text-left">
                                <div className="flex items-center gap-3">
                                  {getPurposeIcon(purpose.category)}
                                  <div>
                                    <div className="font-medium">
                                      {purpose.name}
                                    </div>
                                    <Badge
                                      className={`${getPurposeColor(purpose.category)} text-xs`}
                                      variant="outline"
                                    >
                                      {purpose.category}
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3">
                                <p className="text-gray-600 text-sm">
                                  {purpose.description}
                                </p>

                                {purpose.legal_basis && (
                                  <div>
                                    <h5 className="mb-1 font-medium text-sm">
                                      Base Legal:
                                    </h5>
                                    <p className="text-gray-600 text-sm">
                                      {purpose.legal_basis}
                                    </p>
                                  </div>
                                )}

                                {purpose.data_retention_days && (
                                  <div>
                                    <h5 className="mb-1 font-medium text-sm">
                                      Retenção de Dados:
                                    </h5>
                                    <p className="text-gray-600 text-sm">
                                      {purpose.data_retention_days} dias
                                    </p>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                  <span className="font-medium text-sm">
                                    Status:
                                  </span>
                                  {purpose.category === 'essential' ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Shield className="mr-1 h-3 w-3" />
                                      Sempre Ativo
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant={
                                        selectedPurposes[purpose.id]
                                          ? 'default'
                                          : 'outline'
                                      }
                                    >
                                      {selectedPurposes[purpose.id]
                                        ? 'Ativo'
                                        : 'Inativo'}
                                    </Badge>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>

                        <div className="rounded-lg bg-blue-50 p-4">
                          <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-900">
                            <Info className="h-4 w-4" />
                            Seus Direitos LGPD
                          </h4>
                          <ul className="space-y-1 text-blue-800 text-sm">
                            <li>• Acessar seus dados pessoais</li>
                            <li>• Corrigir dados incompletos ou incorretos</li>
                            <li>• Solicitar a exclusão de seus dados</li>
                            <li>• Revogar consentimento a qualquer momento</li>
                            <li>• Portabilidade de dados</li>
                            <li>• Informações sobre compartilhamento</li>
                          </ul>
                          <p className="mt-2 text-blue-700 text-xs">
                            Para exercer seus direitos, entre em contato conosco
                            através da página de privacidade.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
