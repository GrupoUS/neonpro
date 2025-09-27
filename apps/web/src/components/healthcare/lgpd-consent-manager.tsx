import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { AccessibilityButton } from '@/components/ui/accessibility-button'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { AccessibilityInput } from '@/components/ui/accessibility-input'

import type { 
  PatientData, 
  LGPDConsentRecord,
  LGPDConsent,
  HealthcareContext 
} from '@/types/healthcare'

interface LGPDConsentManagerProps {
  patient: PatientData
  consentRecords: LGPDConsentRecord[]
  onUpdateConsent: (consent: LGPDConsent) => void
  onGenerateReport?: (patientId: string) => void
  onRequestRectification?: (patientId: string, fields: string[]) => void
  onRequestDataPortability?: (patientId: string) => void
  onRequestOpposition?: (patientId: string, purpose: string) => void
  className?: string
  healthcareContext?: HealthcareContext
}

interface ConsentPurpose {
  id: string
  title: string
  description: string
  required: boolean
  retentionPeriod: string
  legalBasis: string
}

const consentPurposes: ConsentPurpose[] = [
  {
    id: 'treatment',
    title: 'Realização de Tratamentos Estéticos',
    description: 'Utilização de dados para agendamento, execução e acompanhamento de tratamentos estéticos.',
    required: true,
    retentionPeriod: '10 anos',
    legalBasis: 'Execução de contrato'
  },
  {
    id: 'medical_records',
    title: 'Manutenção de Prontuário Médico',
    description: 'Armazenamento de informações médicas e histórico de tratamentos para continuidade do cuidado.',
    required: true,
    retentionPeriod: '20 anos',
    legalBasis: 'Obrigação legal'
  },
  {
    id: 'communication',
    title: 'Comunicação e Lembretes',
    description: 'Envio de mensagens sobre agendamentos, confirmações e informações relevantes sobre tratamentos.',
    required: false,
    retentionPeriod: 'Enquanto ativo',
    legalBasis: 'Consentimento'
  },
  {
    id: 'marketing',
    title: 'Marketing e Promoções',
    description: 'Envio de informações sobre novos tratamentos, promoções e conteúdos exclusivos.',
    required: false,
    retentionPeriod: 'Enquanto ativo',
    legalBasis: 'Consentimento'
  },
  {
    id: 'research',
    title: 'Pesquisa e Desenvolvimento',
    description: 'Utilização de dados anônimos para pesquisa e melhoria de tratamentos estéticos.',
    required: false,
    retentionPeriod: 'Indeterminado',
    legalBasis: 'Interesse legítimo'
  }
]

interface ConsentFormState {
  selectedPurposes: string[]
  retentionPeriod: string
  dataSharing: boolean
  internationalTransfer: boolean
  automatedDecision: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  whatsappNotifications: boolean
  signatureMethod: 'electronic' | 'biometric' | 'manual'
  customRetention?: string
  additionalComments?: string
}

export const LGPDConsentManager: React.FC<LGPDConsentManagerProps> = ({
  patient,
  consentRecords,
  onUpdateConsent,
  onGenerateReport,
  onRequestRectification,
  onRequestDataPortability,
  onRequestOpposition,
  className,
  healthcareContext = 'administrative'
}) => {
  const [consentForm, setConsentForm] = React.useState<ConsentFormState>({
    selectedPurposes: [],
    retentionPeriod: 'standard',
    dataSharing: false,
    internationalTransfer: false,
    automatedDecision: false,
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
    signatureMethod: 'electronic'
  })

  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false)
  const [auditLog, setAuditLog] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const addToAuditLog = React.useCallback((action: string) => {
    const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss')
    setAuditLog(prev => [...prev, `[${timestamp}] ${action}`])
  }, [])

  const handlePurposeToggle = (purposeId: string) => {
    setConsentForm(prev => ({
      ...prev,
      selectedPurposes: prev.selectedPurposes.includes(purposeId)
        ? prev.selectedPurposes.filter(id => id !== purposeId)
        : [...prev.selectedPurposes, purposeId]
    }))

    addToAuditLog(`Propósito ${purposeId} ${consentForm.selectedPurposes.includes(purposeId) ? 'removido' : 'adicionado'}`)
  }

  const handleSubmitConsent = async () => {
    setIsSubmitting(true)
    
    // Validate required purposes
    const requiredPurposes = consentPurposes.filter(p => p.required).map(p => p.id)
    const missingRequired = requiredPurposes.filter(id => !consentForm.selectedPurposes.includes(id))
    
    if (missingRequired.length > 0) {
      alert('É necessário consentir com todos os termos obrigatórios para continuar.')
      setIsSubmitting(false)
      return
    }

    const newConsent: LGPDConsent = {
      hasConsented: true,
      consentDate: new Date().toISOString(),
      version: '2.0',
      purposes: consentForm.selectedPurposes,
      retentionPeriod: consentForm.customRetention || consentForm.retentionPeriod,
      dataSharing: consentForm.dataSharing,
      internationalTransfer: consentForm.internationalTransfer,
      automatedDecision: consentForm.automatedDecision,
      preferences: {
        emailNotifications: consentForm.emailNotifications,
        smsNotifications: consentForm.smsNotifications,
        whatsappNotifications: consentForm.whatsappNotifications
      },
      signatureMethod: consentForm.signatureMethod,
      ipAddress: '127.0.0.1', // Would be captured from request
      userAgent: navigator.userAgent,
      additionalComments: consentForm.additionalComments
    }

    try {
      await onUpdateConsent(newConsent)
      addToAuditLog('Novo termo de consentimento registrado com sucesso')
      
      // Reset form
      setConsentForm({
        selectedPurposes: [],
        retentionPeriod: 'standard',
        dataSharing: false,
        internationalTransfer: false,
        automatedDecision: false,
        emailNotifications: true,
        smsNotifications: false,
        whatsappNotifications: false,
        signatureMethod: 'electronic'
      })
    } catch (error) {
      addToAuditLog(`Erro ao registrar consentimento: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateReport = () => {
    onGenerateReport?.(patient.personalInfo.cpf)
    addToAuditLog('Relatório de dados gerado')
  }

  const handleDataRectification = () => {
    const fields = prompt('Quais campos deseja retificar? (separados por vírgula)')
    if (fields) {
      onRequestRectification?.(patient.personalInfo.cpf, fields.split(',').map(f => f.trim()))
      addToAuditLog(`Solicitação de retificação de dados: ${fields}`)
    }
  }

  const handleDataPortability = () => {
    onRequestDataPortability?.(patient.personalInfo.cpf)
    addToAuditLog('Solicitação de portabilidade de dados')
  }

  const handleOpposition = () => {
    const purpose = prompt('Para qual finalidade se opõe ao tratamento de dados?')
    if (purpose) {
      onRequestOpposition?.(patient.personalInfo.cpf, purpose)
      addToAuditLog(`Oposição ao tratamento de dados: ${purpose}`)
    }
  }

  // Check if all required purposes are selected
  const requiredPurposes = consentPurposes.filter(p => p.required)
  const allRequiredSelected = requiredPurposes.every(p => consentForm.selectedPurposes.includes(p.id))

  const latestConsent = consentRecords.length > 0 
    ? consentRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Gerenciador de Consentimento LGPD
            <Badge variant="secondary">v2.0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Gerencie o consentimento de tratamento de dados do paciente conforme a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). 
              Todas as operações são registradas para auditoria.
            </AlertDescription>
          </Alert>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-lg font-bold ${patient.consent.hasConsented ? 'text-green-600' : 'text-red-600'}`}>
                {patient.consent.hasConsented ? 'Consentido' : 'Pendente'}
              </div>
              <div className="text-sm text-muted-foreground">Status Atual</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {consentRecords.length}
              </div>
              <div className="text-sm text-muted-foreground">Registros de Consentimento</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {consentForm.selectedPurposes.length}
              </div>
              <div className="text-sm text-muted-foreground">Propósitos Selecionados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Consent Status */}
      {latestConsent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consentimento Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Data do Consentimento</p>
                <p className="font-medium">
                  {format(parseISO(latestConsent.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Versão</p>
                <p className="font-medium">{latestConsent.consentVersion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Método de Assinatura</p>
                <p className="font-medium">{latestConsent.signatureMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Período de Retenção</p>
                <p className="font-medium">{latestConsent.retentionPeriod}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Propósitos Consentidos</p>
              <div className="flex flex-wrap gap-2">
                {latestConsent.purposes.map(purpose => {
                  const purposeInfo = consentPurposes.find(p => p.id === purpose)
                  return (
                    <Badge key={purpose} variant="secondary">
                      {purposeInfo?.title || purpose}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consent Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Novo Termo de Consentimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Purposes */}
          <HealthcareFormGroup
            label="Termos Obrigatórios"
            healthcareContext="administrative"
            required
          >
            <div className="space-y-3">
              {consentPurposes.filter(p => p.required).map(purpose => (
                <Card 
                  key={purpose.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    consentForm.selectedPurposes.includes(purpose.id) 
                      ? 'ring-2 ring-green-500 bg-green-50' 
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => handlePurposeToggle(purpose.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                        consentForm.selectedPurposes.includes(purpose.id)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      )}>
                        {consentForm.selectedPurposes.includes(purpose.id) && '✓'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{purpose.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{purpose.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Base legal: {purpose.legalBasis}</span>
                          <span>Retenção: {purpose.retentionPeriod}</span>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Obrigatório
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </HealthcareFormGroup>

          {/* Optional Purposes */}
          <HealthcareFormGroup
            label="Termos Opcionais"
            healthcareContext="administrative"
          >
            <div className="space-y-3">
              {consentPurposes.filter(p => !p.required).map(purpose => (
                <Card 
                  key={purpose.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    consentForm.selectedPurposes.includes(purpose.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => handlePurposeToggle(purpose.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                        consentForm.selectedPurposes.includes(purpose.id)
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300'
                      )}>
                        {consentForm.selectedPurposes.includes(purpose.id) && '✓'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{purpose.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{purpose.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Base legal: {purpose.legalBasis}</span>
                          <span>Retenção: {purpose.retentionPeriod}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </HealthcareFormGroup>

          {/* Advanced Options */}
          <div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="mb-4"
            >
              {showAdvancedOptions ? 'Ocultar' : 'Exibir'} Opções Avançadas
            </Button>

            {showAdvancedOptions && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AccessibilityInput
                    label="Período de Retenção Personalizado"
                    placeholder="Ex: 5 anos, 1 mês, etc."
                    value={consentForm.customRetention || ''}
                    onChange={(e) => setConsentForm(prev => ({ ...prev, customRetention: e.target.value }))}
                    healthcareContext="administrative"
                  />

                  <div className="space-y-3">
                    <h4 className="font-medium">Preferências de Notificação</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consentForm.emailNotifications}
                          onChange={(e) => setConsentForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        />
                        <span className="text-sm">Notificações por Email</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consentForm.smsNotifications}
                          onChange={(e) => setConsentForm(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                        />
                        <span className="text-sm">Notificações por SMS</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consentForm.whatsappNotifications}
                          onChange={(e) => setConsentForm(prev => ({ ...prev, whatsappNotifications: e.target.checked }))}
                        />
                        <span className="text-sm">Notificações por WhatsApp</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Opções de Dados</h4>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={consentForm.dataSharing}
                        onChange={(e) => setConsentForm(prev => ({ ...prev, dataSharing: e.target.checked }))}
                      />
                      <span className="text-sm">Permitir compartilhamento de dados com parceiros</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={consentForm.internationalTransfer}
                        onChange={(e) => setConsentForm(prev => ({ ...prev, internationalTransfer: e.target.checked }))}
                      />
                      <span className="text-sm">Permitir transferência internacional de dados</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={consentForm.automatedDecision}
                        onChange={(e) => setConsentForm(prev => ({ ...prev, automatedDecision: e.target.checked }))}
                      />
                      <span className="text-sm">Permitir decisões automatizadas</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Método de Assinatura</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="signatureMethod"
                          value="electronic"
                          checked={consentForm.signatureMethod === 'electronic'}
                          onChange={() => setConsentForm(prev => ({ ...prev, signatureMethod: 'electronic' }))}
                        />
                        <span className="text-sm">Assinatura Eletrônica</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="signatureMethod"
                          value="biometric"
                          checked={consentForm.signatureMethod === 'biometric'}
                          onChange={() => setConsentForm(prev => ({ ...prev, signatureMethod: 'biometric' }))}
                        />
                        <span className="text-sm">Assinatura Biométrica</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="signatureMethod"
                          value="manual"
                          checked={consentForm.signatureMethod === 'manual'}
                          onChange={() => setConsentForm(prev => ({ ...prev, signatureMethod: 'manual' }))}
                        />
                        <span className="text-sm">Assinatura Manual</span>
                      </label>
                    </div>
                  </div>
                </div>

                <AccessibilityInput
                  label="Comentários Adicionais"
                  placeholder="Informações adicionais ou restrições específicas..."
                  value={consentForm.additionalComments || ''}
                  onChange={(e) => setConsentForm(prev => ({ ...prev, additionalComments: e.target.value }))}
                  healthcareContext="personal"
                  multiline
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <AccessibilityButton
            onClick={handleSubmitConsent}
            disabled={!allRequiredSelected || isSubmitting}
            healthcareContext="administrative"
            className="w-full"
            lgpdAction="data_consent"
          >
            {isSubmitting ? 'Registrando Consentimento...' : 'Registrar Novo Consentimento'}
          </AccessibilityButton>
        </CardContent>
      </Card>

      {/* LGPD Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Direitos LGPD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Direitos do Titular</h4>
              <div className="space-y-2">
                <AccessibilityButton
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateReport}
                  lgpdAction="data_access"
                  className="w-full justify-start"
                >
                  📋 Acessar Dados Pessoais
                </AccessibilityButton>
                <AccessibilityButton
                  variant="outline"
                  size="sm"
                  onClick={handleDataRectification}
                  lgpdAction="data_consent"
                  className="w-full justify-start"
                >
                  ✏️ Retificar Dados
                </AccessibilityButton>
                <AccessibilityButton
                  variant="outline"
                  size="sm"
                  onClick={handleDataPortability}
                  lgpdAction="data_export"
                  className="w-full justify-start"
                >
                  📤 Portabilidade de Dados
                </AccessibilityButton>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Controle de Dados</h4>
              <div className="space-y-2">
                <AccessibilityButton
                  variant="outline"
                  size="sm"
                  onClick={handleOpposition}
                  lgpdAction="data_consent"
                  className="w-full justify-start"
                >
                  🚫 Opor-se ao Tratamento
                </AccessibilityButton>
                <AccessibilityButton
                  variant="outline"
                  size="sm"
                  onClick={() => {}} // Implementar exclusão
                  lgpdAction="data_deletion"
                  className="w-full justify-start"
                >
                  🗑️ Solicitar Exclusão
                </AccessibilityButton>
                <AccessibilityButton
                  variant="outline"
                  size="sm"
                  onClick={() => {}} // Implementar revisão
                  lgpdAction="data_access"
                  className="w-full justify-start"
                >
                  🔍 Revisar Decisões Automatizadas
                </AccessibilityButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registro de Auditoria LGPD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-40 overflow-y-auto text-sm font-mono">
            {auditLog.length > 0 ? (
              auditLog.map((entry, index) => (
                <div key={index} className="text-muted-foreground">
                  {entry}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-4">
                Nenhuma atividade registrada nesta sessão.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

LGPDConsentManager.displayName = 'LGPDConsentManager'