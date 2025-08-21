'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  Info, 
  AlertTriangle,
  Check,
  X,
  FileText,
  Settings,
  BarChart3,
  Users
} from 'lucide-react';

interface ConsentOption {
  id: string;
  type: 'essential' | 'functional' | 'analytics' | 'marketing';
  title: string;
  description: string;
  required: boolean;
  lawfulBasis: string;
  examples: string[];
  enabled: boolean;
}

interface ConsentBannerProps {
  isVisible: boolean;
  onConsentComplete: (consents: Record<string, boolean>) => void;
  onConsentDeclined: () => void;
}

export default function ConsentBanner({ 
  isVisible, 
  onConsentComplete, 
  onConsentDeclined 
}: ConsentBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<'banner' | 'detailed' | 'confirmation'>('banner');

  const consentOptions: ConsentOption[] = [
    {
      id: 'essential',
      type: 'essential',
      title: 'Dados Essenciais para Prestação de Serviços Médicos',
      description: 'Processamento de dados pessoais e de saúde necessários para prestação de cuidados médicos.',
      required: true,
      lawfulBasis: 'Cuidados de saúde (Art. 11, LGPD) + Execução de contrato (Art. 7, V)',
      examples: [
        'Nome completo, CPF, RG para identificação',
        'Dados de contato para comunicação médica',
        'Histórico médico e exames para diagnóstico',
        'Prescrições e tratamentos médicos',
        'Dados de emergência para contato'
      ],
      enabled: true
    },
    {
      id: 'functional',
      type: 'functional',
      title: 'Funcionalidades do Sistema de Saúde',
      description: 'Dados para melhorar funcionalidades do sistema como lembretes de consulta e histórico.',
      required: false,
      lawfulBasis: 'Legítimo interesse (Art. 7, IX) + Consentimento (Art. 7, I)',
      examples: [
        'Preferências de agendamento',
        'Histórico de consultas e procedimentos',
        'Configurações de notificação',
        'Lembretes de medicamentos',
        'Backup de configurações pessoais'
      ],
      enabled: false
    },
    {
      id: 'analytics',
      type: 'analytics', 
      title: 'Analytics e Melhoria dos Serviços Médicos',
      description: 'Análise agregada e anônima para melhorar qualidade dos cuidados médicos.',
      required: false,
      lawfulBasis: 'Consentimento (Art. 7, I)',
      examples: [
        'Estatísticas agregadas de uso do sistema',
        'Análise de eficácia de tratamentos (anonimizada)',
        'Padrões de agendamento para otimização',
        'Métricas de qualidade de atendimento',
        'Indicadores de saúde populacional (sem identificação)'
      ],
      enabled: false
    },
    {
      id: 'research',
      type: 'marketing',
      title: 'Pesquisa Médica e Acadêmica',
      description: 'Participação opcional em pesquisas médicas e acadêmicas para avanço da medicina.',
      required: false,
      lawfulBasis: 'Consentimento específico (Art. 7, I)',
      examples: [
        'Participação em estudos clínicos (com consentimento específico)',
        'Dados anonimizados para pesquisa médica',
        'Estatísticas epidemiológicas (sem identificação)',
        'Desenvolvimento de novos tratamentos',
        'Publicações científicas (dados agregados)'
      ],
      enabled: false
    }
  ];

  useEffect(() => {
    // Initialize consents with required ones enabled
    const initialConsents: Record<string, boolean> = {};
    consentOptions.forEach(option => {
      initialConsents[option.id] = option.required;
    });
    setConsents(initialConsents);
  }, []);

  const handleConsentChange = (optionId: string, enabled: boolean) => {
    if (consentOptions.find(opt => opt.id === optionId)?.required) {
      return; // Cannot change required consents
    }
    setConsents(prev => ({ ...prev, [optionId]: enabled }));
  };

  const handleAcceptAll = () => {
    const allConsents: Record<string, boolean> = {};
    consentOptions.forEach(option => {
      allConsents[option.id] = true;
    });
    setConsents(allConsents);
    setStep('confirmation');
  };

  const handleAcceptEssential = () => {
    const essentialConsents: Record<string, boolean> = {};
    consentOptions.forEach(option => {
      essentialConsents[option.id] = option.required;
    });
    setConsents(essentialConsents);
    setStep('confirmation');
  };

  const handleCustomizeConsents = () => {
    setStep('detailed');
  };

  const handleFinalConfirmation = () => {
    onConsentComplete(consents);
  };

  const getConsentIcon = (type: ConsentOption['type']) => {
    switch (type) {
      case 'essential': return <Shield className="h-5 w-5 text-red-500" />;
      case 'functional': return <Settings className="h-5 w-5 text-blue-500" />;
      case 'analytics': return <BarChart3 className="h-5 w-5 text-green-500" />;
      case 'marketing': return <Users className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Initial Banner */}
        {step === 'banner' && (
          <>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Proteção dos Seus Dados Pessoais</CardTitle>
              <CardDescription className="text-base">
                Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>, 
                precisamos do seu consentimento explícito para processar seus dados pessoais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Seus Direitos LGPD</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Acesso:</strong> Solicitar cópia dos seus dados</li>
                      <li>• <strong>Retificação:</strong> Corrigir dados incorretos</li>
                      <li>• <strong>Exclusão:</strong> Apagar dados desnecessários</li>
                      <li>• <strong>Portabilidade:</strong> Transferir dados para outro serviço</li>
                      <li>• <strong>Retirar consentimento:</strong> A qualquer momento</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Dados Médicos</h3>
                    <p className="text-sm text-amber-800">
                      Como sistema de saúde, alguns dados são <strong>obrigatórios por lei</strong> para 
                      prestação de cuidados médicos e podem ter períodos de retenção específicos 
                      conforme regulamentações sanitárias.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="flex-1"
                  size="lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aceitar Todos
                </Button>
                <Button 
                  onClick={handleAcceptEssential}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Apenas Essenciais
                </Button>
                <Button 
                  onClick={handleCustomizeConsents}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
              </div>

              <div className="text-center">
                <Button 
                  onClick={onConsentDeclined}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Não concordo - Sair do sistema
                </Button>
              </div>
            </CardContent>
          </>
        )}        {/* Detailed Consent Selection */}
        {step === 'detailed' && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-6 w-6" />
                <span>Personalizar Consentimentos</span>
              </CardTitle>
              <CardDescription>
                Escolha exatamente quais dados você permite que processemos. 
                Você pode alterar essas preferências a qualquer momento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {consentOptions.map((option) => (
                <Card key={option.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getConsentIcon(option.type)}
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{option.title}</span>
                            {option.required && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                OBRIGATÓRIO
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {option.description}
                          </CardDescription>
                          <div className="mt-2 text-xs text-gray-600">
                            <strong>Base legal:</strong> {option.lawfulBasis}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={consents[option.id] || false}
                          onCheckedChange={(checked) => 
                            handleConsentChange(option.id, checked as boolean)
                          }
                          disabled={option.required}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Exemplos de dados processados:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {option.examples.map((example, idx) => (
                          <li key={idx}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => setStep('confirmation')}
                  className="flex-1"
                  disabled={!consents.essential} // Must accept essential
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Seleção
                </Button>
                <Button 
                  onClick={() => setStep('banner')}
                  variant="outline"
                  className="flex-1"
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Final Confirmation */}
        {step === 'confirmation' && (
          <>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-xl">Confirmação de Consentimentos</CardTitle>
              <CardDescription>
                Revise suas escolhas antes da confirmação final
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">Consentimentos Concedidos:</h3>
                <div className="space-y-2">
                  {consentOptions
                    .filter(option => consents[option.id])
                    .map(option => (
                      <div key={option.id} className="flex items-center space-x-3 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-800">{option.title}</span>
                      </div>
                    ))}
                </div>
              </div>

              {consentOptions.some(option => !consents[option.id] && !option.required) && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Consentimentos Negados:</h3>
                  <div className="space-y-2">
                    {consentOptions
                      .filter(option => !consents[option.id] && !option.required)
                      .map(option => (
                        <div key={option.id} className="flex items-center space-x-3 text-sm">
                          <X className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{option.title}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="mb-2">
                      <strong>Lembre-se:</strong> Você pode alterar estes consentimentos a qualquer momento 
                      através do Painel de Conformidade LGPD na sua conta.
                    </p>
                    <p>
                      <strong>Contato do DPO:</strong> dpo@neonpro.com.br | (11) 99999-9999
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleFinalConfirmation}
                  className="flex-1"
                  size="lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar e Continuar
                </Button>
                <Button 
                  onClick={() => setStep('detailed')}
                  variant="outline"
                  className="flex-1"
                >
                  Alterar Seleção
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

// Hook for consent management
export function useConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [consentsGiven, setConsentsGiven] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check if user has already given consent
    const storedConsents = localStorage.getItem('lgpd_consents');
    const consentTimestamp = localStorage.getItem('lgpd_consent_timestamp');
    
    if (!storedConsents || !consentTimestamp) {
      setShowBanner(true);
    } else {
      // Check if consent is older than 1 year (need to re-confirm)
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      if (parseInt(consentTimestamp) < oneYearAgo) {
        setShowBanner(true);
      } else {
        setConsentsGiven(JSON.parse(storedConsents));
      }
    }
  }, []);

  const handleConsentComplete = (consents: Record<string, boolean>) => {
    localStorage.setItem('lgpd_consents', JSON.stringify(consents));
    localStorage.setItem('lgpd_consent_timestamp', Date.now().toString());
    setConsentsGiven(consents);
    setShowBanner(false);

    // Send to API for backend storage and audit
    fetch('/api/lgpd/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consents,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: null // Will be detected server-side
      })
    }).catch(console.error);
  };

  const handleConsentDeclined = () => {
    // Redirect to exit page or show information about essential services
    window.location.href = '/lgpd/consent-declined';
  };

  return {
    showBanner,
    consentsGiven,
    handleConsentComplete,
    handleConsentDeclined
  };
}