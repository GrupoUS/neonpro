'use client'

import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Checkbox, } from '@/components/ui/checkbox'
import {
  AlertTriangle,
  BarChart3,
  Check,
  FileText,
  Info,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, } from 'react'

interface ConsentOption {
  id: string
  type: 'essential' | 'functional' | 'analytics' | 'marketing'
  title: string
  description: string
  required: boolean
  lawfulBasis: string
  examples: string[]
  enabled: boolean
}

interface ConsentBannerProps {
  isVisible: boolean
  onConsentComplete: (consents: Record<string, boolean>,) => void
  onConsentDeclined: () => void
}

export default function ConsentBanner({
  isVisible,
  onConsentComplete,
  onConsentDeclined,
}: ConsentBannerProps,) {
  const [consents, setConsents,] = useState<Record<string, boolean>>({},)
  const [step, setStep,] = useState<'banner' | 'detailed' | 'confirmation'>(
    'banner',
  )

  const consentOptions: ConsentOption[] = useMemo(() => [
    {
      id: 'essential',
      type: 'essential',
      title: 'Dados Essenciais para Prestação de Serviços Médicos',
      description:
        'Processamento de dados pessoais e de saúde necessários para prestação de cuidados médicos.',
      required: true,
      lawfulBasis: 'Cuidados de saúde (Art. 11, LGPD) + Execução de contrato (Art. 7, V)',
      examples: [
        'Nome completo, CPF, RG para identificação',
        'Dados de contato para comunicação médica',
        'Histórico médico e exames para diagnóstico',
        'Prescrições e tratamentos médicos',
        'Dados de emergência para contato',
      ],
      enabled: true,
    },
    {
      id: 'functional',
      type: 'functional',
      title: 'Funcionalidades do Sistema de Saúde',
      description:
        'Dados para melhorar funcionalidades do sistema como lembretes de consulta e histórico.',
      required: false,
      lawfulBasis: 'Legítimo interesse (Art. 7, IX) + Consentimento (Art. 7, I)',
      examples: [
        'Preferências de agendamento',
        'Histórico de consultas e procedimentos',
        'Configurações de notificação',
        'Lembretes de medicamentos',
        'Backup de configurações pessoais',
      ],
      enabled: false,
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
        'Indicadores de saúde populacional (sem identificação)',
      ],
      enabled: false,
    },
    {
      id: 'research',
      type: 'marketing',
      title: 'Pesquisa Médica e Acadêmica',
      description:
        'Participação opcional em pesquisas médicas e acadêmicas para avanço da medicina.',
      required: false,
      lawfulBasis: 'Consentimento específico (Art. 7, I)',
      examples: [
        'Participação em estudos clínicos (com consentimento específico)',
        'Dados anonimizados para pesquisa médica',
        'Estatísticas epidemiológicas (sem identificação)',
        'Desenvolvimento de novos tratamentos',
        'Publicações científicas (dados agregados)',
      ],
      enabled: false,
    },
  ], [],)

  useEffect(() => {
    // Initialize consents with required ones enabled
    const initialConsents: Record<string, boolean> = {}
    consentOptions.forEach((option,) => {
      initialConsents[option.id] = option.required
    },)
    setConsents(initialConsents,)
  }, [consentOptions,],)

  const handleConsentChange = (optionId: string, enabled: boolean,) => {
    if (consentOptions.find((opt,) => opt.id === optionId)?.required) {
      return // Cannot change required consents
    }
    setConsents((prev,) => ({ ...prev, [optionId]: enabled, }))
  }

  const handleAcceptAll = () => {
    const allConsents: Record<string, boolean> = {}
    consentOptions.forEach((option,) => {
      allConsents[option.id] = true
    },)
    setConsents(allConsents,)
    setStep('confirmation',)
  }

  const handleAcceptEssential = () => {
    const essentialConsents: Record<string, boolean> = {}
    consentOptions.forEach((option,) => {
      essentialConsents[option.id] = option.required
    },)
    setConsents(essentialConsents,)
    setStep('confirmation',)
  }

  const handleCustomizeConsents = () => {
    setStep('detailed',)
  }

  const handleFinalConfirmation = () => {
    onConsentComplete(consents,)
  }

  const getConsentIcon = (type: ConsentOption['type'],) => {
    switch (type) {
      case 'essential': {
        return <Shield className="h-5 w-5 text-red-500" />
      }
      case 'functional': {
        return <Settings className="h-5 w-5 text-blue-500" />
      }
      case 'analytics': {
        return <BarChart3 className="h-5 w-5 text-green-500" />
      }
      case 'marketing': {
        return <Users className="h-5 w-5 text-purple-500" />
      }
      default: {
        return <FileText className="h-5 w-5" />
      }
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-auto">
        {/* Initial Banner */}
        {step === 'banner' && (
          <>
            <CardHeader className="text-center">
              <div className="mb-4 flex items-center justify-center">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">
                Proteção dos Seus Dados Pessoais
              </CardTitle>
              <CardDescription className="text-base">
                Em conformidade com a{' '}
                <strong>Lei Geral de Proteção de Dados (LGPD)</strong>, precisamos do seu
                consentimento explícito para processar seus dados pessoais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start space-x-3">
                  <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="mb-2 font-semibold text-blue-900">
                      Seus Direitos LGPD
                    </h3>
                    <ul className="space-y-1 text-blue-800 text-sm">
                      <li>
                        • <strong>Acesso:</strong> Solicitar cópia dos seus dados
                      </li>
                      <li>
                        • <strong>Retificação:</strong> Corrigir dados incorretos
                      </li>
                      <li>
                        • <strong>Exclusão:</strong> Apagar dados desnecessários
                      </li>
                      <li>
                        • <strong>Portabilidade:</strong> Transferir dados para outro serviço
                      </li>
                      <li>
                        • <strong>Retirar consentimento:</strong> A qualquer momento
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div>
                    <h3 className="mb-2 font-semibold text-amber-900">
                      Dados Médicos
                    </h3>
                    <p className="text-amber-800 text-sm">
                      Como sistema de saúde, alguns dados são <strong>obrigatórios por lei</strong>
                      {' '}
                      para prestação de cuidados médicos e podem ter períodos de retenção
                      específicos conforme regulamentações sanitárias.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" onClick={handleAcceptAll} size="lg">
                  <Check className="mr-2 h-4 w-4" />
                  Aceitar Todos
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAcceptEssential}
                  size="lg"
                  variant="outline"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Apenas Essenciais
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCustomizeConsents}
                  size="lg"
                  variant="outline"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Personalizar
                </Button>
              </div>

              <div className="text-center">
                <Button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={onConsentDeclined}
                  size="sm"
                  variant="ghost"
                >
                  Não concordo - Sair do sistema
                </Button>
              </div>
            </CardContent>
          </>
        )} {/* Detailed Consent Selection */}
        {step === 'detailed' && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-6 w-6" />
                <span>Personalizar Consentimentos</span>
              </CardTitle>
              <CardDescription>
                Escolha exatamente quais dados você permite que processemos. Você pode alterar essas
                preferências a qualquer momento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {consentOptions.map((option,) => (
                <Card className="border-2" key={option.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getConsentIcon(option.type,)}
                        <div className="flex-1">
                          <CardTitle className="flex items-center space-x-2 text-lg">
                            <span>{option.title}</span>
                            {option.required && (
                              <span className="rounded bg-red-100 px-2 py-1 text-red-800 text-xs">
                                OBRIGATÓRIO
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {option.description}
                          </CardDescription>
                          <div className="mt-2 text-gray-600 text-xs">
                            <strong>Base legal:</strong> {option.lawfulBasis}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={consents[option.id]}
                          disabled={option.required}
                          id={option.id}
                          onCheckedChange={(checked,) =>
                            handleConsentChange(option.id, checked as boolean,)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="mb-2 font-semibold text-sm">
                        Exemplos de dados processados:
                      </h4>
                      <ul className="space-y-1 text-gray-600 text-sm">
                        {option.examples.map((example, idx,) => <li key={idx}>• {example}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  className="flex-1"
                  disabled={!consents.essential}
                  onClick={() => setStep('confirmation',)} // Must accept essential
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Seleção
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep('banner',)}
                  variant="outline"
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
              <div className="mb-4 flex items-center justify-center">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-xl">
                Confirmação de Consentimentos
              </CardTitle>
              <CardDescription>
                Revise suas escolhas antes da confirmação final
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="mb-3 font-semibold text-green-900">
                  Consentimentos Concedidos:
                </h3>
                <div className="space-y-2">
                  {consentOptions
                    .filter((option,) => consents[option.id])
                    .map((option,) => (
                      <div
                        className="flex items-center space-x-3 text-sm"
                        key={option.id}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-800">{option.title}</span>
                      </div>
                    ))}
                </div>
              </div>

              {consentOptions.some(
                (option,) => !(consents[option.id] || option.required),
              ) && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Consentimentos Negados:
                  </h3>
                  <div className="space-y-2">
                    {consentOptions
                      .filter(
                        (option,) => !(consents[option.id] || option.required),
                      )
                      .map((option,) => (
                        <div
                          className="flex items-center space-x-3 text-sm"
                          key={option.id}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{option.title}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start space-x-3">
                  <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="text-blue-800 text-sm">
                    <p className="mb-2">
                      <strong>Lembre-se:</strong>{' '}
                      Você pode alterar estes consentimentos a qualquer momento através do Painel de
                      Conformidade LGPD na sua conta.
                    </p>
                    <p>
                      <strong>Contato do DPO:</strong> dpo@neonpro.com.br | (11) 99999-9999
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={handleFinalConfirmation}
                  size="lg"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar e Continuar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep('detailed',)}
                  variant="outline"
                >
                  Alterar Seleção
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}

// Hook for consent management
export function useConsentBanner() {
  const [showBanner, setShowBanner,] = useState(false,)
  const [consentsGiven, setConsentsGiven,] = useState<Record<string, boolean>>(
    {},
  )

  useEffect(() => {
    // Check if user has already given consent
    const storedConsents = localStorage.getItem('lgpd_consents',)
    const consentTimestamp = localStorage.getItem('lgpd_consent_timestamp',)

    if (storedConsents && consentTimestamp) {
      // Check if consent is older than 1 year (need to re-confirm)
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
      if (Number.parseInt(consentTimestamp, 10,) < oneYearAgo) {
        setShowBanner(true,)
      } else {
        setConsentsGiven(JSON.parse(storedConsents,),)
      }
    } else {
      setShowBanner(true,)
    }
  }, [],)

  const handleConsentComplete = async (consents: Record<string, boolean>,) => {
    localStorage.setItem('lgpd_consents', JSON.stringify(consents,),)
    localStorage.setItem('lgpd_consent_timestamp', Date.now().toString(),)
    setConsentsGiven(consents,)
    setShowBanner(false,)

    // Send to API for backend storage and audit
    try {
      await fetch('/api/lgpd/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          consents,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ipAddress: undefined, // Will be detected server-side
        },),
      },)
    } catch (e) {
      console.error(e,)
    }
  }

  const handleConsentDeclined = () => {
    // Redirect to exit page or show information about essential services
    window.location.href = '/lgpd/consent-declined'
  }

  return {
    showBanner,
    consentsGiven,
    handleConsentComplete,
    handleConsentDeclined,
  }
}
