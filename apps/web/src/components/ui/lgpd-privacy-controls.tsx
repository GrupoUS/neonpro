import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../card'
import { Badge } from '../badge'
import { Button } from '../button'
import { Alert, AlertDescription } from '../alert'
import { MobileHealthcareButton } from '../mobile-healthcare-button'
import { AccessibilityInput } from '../accessibility-input'
import { cn } from '../../../lib/utils'

export interface LGPDPrivacyControlProps {
  patientId?: string
  onDataRequest?: (type: 'access' | 'deletion' | 'export' | 'correction') => void
  onConsentUpdate?: (consentType: string, granted: boolean) => void
  className?: string
  showDetailedControls?: boolean
}

export interface ConsentItem {
  id: string
  title: string
  description: string
  required: boolean
  granted: boolean
  lastUpdated?: string
  category: 'treatment' | 'marketing' | 'research' | 'emergency' | 'administrative'
}

export interface DataProcessingActivity {
  id: string
  purpose: string
  legalBasis: 'consent' | 'legitimate_interest' | 'legal_obligation' | 'vital_interest'
  dataCategories: string[]
  retentionPeriod: string
  thirdPartySharing: boolean
}

const LGPDPrivacyControls: React.FC<LGPDPrivacyControlProps> = ({
  patientId,
  onDataRequest,
  onConsentUpdate,
  className,
  showDetailedControls = false
}) => {
  const [selectedTab, setSelectedTab] = React.useState<'overview' | 'consents' | 'data' | 'requests'>('overview')
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Sample consent data - in real app, this would come from API
  const [consents, setConsents] = React.useState<ConsentItem[]>([
    {
      id: 'treatment_consent',
      title: 'Consentimento para Tratamento',
      description: 'Autorizo o uso de meus dados para fins de tratamento médico e procedimentos estéticos.',
      required: true,
      granted: true,
      lastUpdated: '2024-01-15',
      category: 'treatment'
    },
    {
      id: 'marketing_consent',
      title: 'Comunicação de Marketing',
      description: 'Autorizo o envio de informações sobre promoções e novos serviços.',
      required: false,
      granted: false,
      lastUpdated: '2024-01-10',
      category: 'marketing'
    },
    {
      id: 'research_consent',
      title: 'Pesquisa Científica',
      description: 'Autorizo o uso de dados anônimos para pesquisas e estudos científicos.',
      required: false,
      granted: true,
      lastUpdated: '2024-01-12',
      category: 'research'
    },
    {
      id: 'emergency_consent',
      title: 'Contato de Emergência',
      description: 'Autorizo o uso de meus dados para contato em situações de emergência médica.',
      required: true,
      granted: true,
      lastUpdated: '2024-01-15',
      category: 'emergency'
    }
  ])

  // Sample data processing activities
  const dataActivities: DataProcessingActivity[] = [
    {
      id: 'medical_records',
      purpose: 'Manutenção de prontuários médicos',
      legalBasis: 'legal_obligation',
      dataCategories: ['Dados de saúde', 'Informações pessoais', 'Histórico de tratamentos'],
      retentionPeriod: '20 anos após último tratamento',
      thirdPartySharing: false
    },
    {
      id: 'appointment_scheduling',
      purpose: 'Agendamento e gestão de consultas',
      legalBasis: 'consent',
      dataCategories: ['Dados de contato', 'Informações de agendamento'],
      retentionPeriod: '5 anos',
      thirdPartySharing: false
    },
    {
      id: 'billing',
      purpose: 'Processamento de pagamentos e faturamento',
      legalBasis: 'legitimate_interest',
      dataCategories: ['Dados financeiros', 'Informações de pagamento'],
      retentionPeriod: '10 anos',
      thirdPartySharing: true
    }
  ]

  const handleConsentToggle = (consentId: string, granted: boolean) => {
    setConsents(prev => prev.map(consent => 
      consent.id === consentId 
        ? { ...consent, granted, lastUpdated: new Date().toISOString().split('T')[0] }
        : consent
    ))
    onConsentUpdate?.(consentId, granted)
  }

  const handleDataRequest = async (type: 'access' | 'deletion' | 'export' | 'correction') => {
    setIsProcessing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    onDataRequest?.(type)
    setIsProcessing(false)

    // Announce to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    
    const messages = {
      access: 'Solicitação de acesso aos dados enviada com sucesso',
      deletion: 'Solicitação de exclusão de dados enviada com sucesso',
      export: 'Solicitação de exportação de dados enviada com sucesso',
      correction: 'Solicitação de correção de dados enviada com sucesso'
    }
    
    announcement.textContent = messages[type]
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 3000)
  }

  const getCategoryColor = (category: ConsentItem['category']) => {
    switch (category) {
      case 'treatment': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'marketing': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'research': return 'bg-green-100 text-green-800 border-green-300'
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300'
      case 'administrative': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getLegalBasisLabel = (basis: DataProcessingActivity['legalBasis']) => {
    switch (basis) {
      case 'consent': return 'Consentimento'
      case 'legitimate_interest': return 'Interesse Legítimo'
      case 'legal_obligation': return 'Obrigação Legal'
      case 'vital_interest': return 'Interesse Vital'
      default: return basis
    }
  }

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          🔒 Controles de Privacidade LGPD
          <Badge variant="outline" className="ml-2">
            Lei Geral de Proteção de Dados
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'consents', label: 'Consentimentos' },
            { id: 'data', label: 'Atividades de Dados' },
            { id: 'requests', label: 'Solicitações' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={cn(
                'px-4 py-2 font-medium transition-colors',
                selectedTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              aria-selected={selectedTab === tab.id}
              role="tab"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-4" role="tabpanel">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-900">
                <strong>Seus Direitos LGPD:</strong> Você tem direito de acessar, corrigir, excluir e portabilizar seus dados pessoais, 
                além de poder revogar consentimentos a qualquer momento.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">📊 Resumo de Consentimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Consentimentos:</span>
                      <span className="font-medium">{consents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ativos:</span>
                      <span className="font-medium text-green-600">
                        {consents.filter(c => c.granted).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Obrigatórios:</span>
                      <span className="font-medium text-red-600">
                        {consents.filter(c => c.required).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">🔒 Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <MobileHealthcareButton
                    variant="outline"
                    size="mobile"
                    onClick={() => handleDataRequest('access')}
                    disabled={isProcessing}
                    className="w-full justify-start"
                  >
                    📥 Acessar Meus Dados
                  </MobileHealthcareButton>
                  <MobileHealthcareButton
                    variant="outline"
                    size="mobile"
                    onClick={() => handleDataRequest('export')}
                    disabled={isProcessing}
                    className="w-full justify-start"
                  >
                    📤 Exportar Dados
                  </MobileHealthcareButton>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Consents Tab */}
        {selectedTab === 'consents' && (
          <div className="space-y-4" role="tabpanel">
            <Alert className="border-purple-200 bg-purple-50">
              <AlertDescription className="text-purple-900">
                <strong>Consentimentos:</strong> Gerencie quais atividades você autoriza a clínica a realizar com seus dados.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {consents.map(consent => (
                <Card key={consent.id} className="border-l-4 border-purple-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{consent.title}</h3>
                          <Badge className={getCategoryColor(consent.category)}>
                            {consent.category === 'treatment' && 'Tratamento'}
                            {consent.category === 'marketing' && 'Marketing'}
                            {consent.category === 'research' && 'Pesquisa'}
                            {consent.category === 'emergency' && 'Emergência'}
                            {consent.category === 'administrative' && 'Administrativo'}
                          </Badge>
                          {consent.required && (
                            <Badge variant="destructive">Obrigatório</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{consent.description}</p>
                        {consent.lastUpdated && (
                          <p className="text-xs text-gray-500">
                            Última atualização: {new Date(consent.lastUpdated).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consent.granted}
                            onChange={(e) => handleConsentToggle(consent.id, e.target.checked)}
                            disabled={consent.required}
                            className="sr-only peer"
                          />
                          <div className={cn(
                            "w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer",
                            "peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                            "after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all",
                            consent.granted ? "peer-checked:bg-blue-600" : "peer-disabled:opacity-50"
                          )}></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {consent.granted ? 'Autorizado' : 'Não autorizado'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Data Activities Tab */}
        {selectedTab === 'data' && (
          <div className="space-y-4" role="tabpanel">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-900">
                <strong>Atividades de Processamento:</strong> Detalhamento de como seus dados são utilizados pela clínica.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {dataActivities.map(activity => (
                <Card key={activity.id} className="border-green-200">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">{activity.purpose}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Base Legal:</span>
                          <p>{getLegalBasisLabel(activity.legalBasis)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Período de Retenção:</span>
                          <p>{activity.retentionPeriod}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">Categorias de Dados:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activity.dataCategories.map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activity.thirdPartySharing ? (
                          <Badge variant="destructive" className="text-xs">
                            Compartilhado com terceiros
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Não compartilhado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {selectedTab === 'requests' && (
          <div className="space-y-4" role="tabpanel">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-900">
                <strong>Solicitações de Dados:</strong> Exerça seus direitos de acesso, correção, exclusão e portabilidade dos seus dados.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MobileHealthcareButton
                variant="outline"
                size="mobile-lg"
                onClick={() => handleDataRequest('access')}
                disabled={isProcessing}
                lgpdAction="data_access"
                className="h-auto p-4 flex-col items-start"
              >
                <span className="font-semibold text-lg mb-2">📥 Acessar Dados</span>
                <span className="text-sm text-left text-gray-600">
                  Solicitar cópia de todos os seus dados pessoais armazenados
                </span>
              </MobileHealthcareButton>

              <MobileHealthcareButton
                variant="outline"
                size="mobile-lg"
                onClick={() => handleDataRequest('export')}
                disabled={isProcessing}
                lgpdAction="data_export"
                className="h-auto p-4 flex-col items-start"
              >
                <span className="font-semibold text-lg mb-2">📤 Exportar Dados</span>
                <span className="text-sm text-left text-gray-600">
                  Exportar seus dados em formato estruturado e portável
                </span>
              </MobileHealthcareButton>

              <MobileHealthcareButton
                variant="outline"
                size="mobile-lg"
                onClick={() => handleDataRequest('correction')}
                disabled={isProcessing}
                lgpdAction="data_correction"
                className="h-auto p-4 flex-col items-start"
              >
                <span className="font-semibold text-lg mb-2">✏️ Corrigir Dados</span>
                <span className="text-sm text-left text-gray-600">
                  Solicitar correção de dados imprecisos ou incompletos
                </span>
              </MobileHealthcareButton>

              <MobileHealthcareButton
                variant="destructive"
                size="mobile-lg"
                onClick={() => handleDataRequest('deletion')}
                disabled={isProcessing}
                lgpdAction="data_deletion"
                className="h-auto p-4 flex-col items-start"
              >
                <span className="font-semibold text-lg mb-2">🗑️ Excluir Dados</span>
                <span className="text-sm text-left text-gray-100">
                  Solicitar exclusão dos seus dados pessoais
                </span>
              </MobileHealthcareButton>
            </div>

            {isProcessing && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-900 flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                  Processando sua solicitação. Isso pode levar alguns instantes...
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

LGPDPrivacyControls.displayName = 'LGPDPrivacyControls'

export { LGPDPrivacyControls }