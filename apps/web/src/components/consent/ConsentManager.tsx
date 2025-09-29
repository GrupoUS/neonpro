/**
 * LGPD Granular Consent Management Component
 * Comprehensive interface for managing patient consents with Brazilian healthcare compliance
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Eye,
  Settings,
  Smartphone,
  Mail,
  Phone,
  User,
  Calendar,
  FileText
} from 'lucide-react'

import { 
  lgpdConsentManager, 
  ConsentCategory, 
  GranularConsent,
  ConsentWithdrawalRequest 
} from '@neonpro/security'

interface ConsentManagerProps {
  patientId: string
  clinicId: string
  language?: 'pt-BR' | 'en-US'
}

interface ConsentCategoryDisplay extends ConsentCategory {
  selected: boolean
  required: boolean
  healthcareSpecific: boolean
}

export function ConsentManager({ patientId, clinicId, language = 'pt-BR' }: ConsentManagerProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [withdrawalReason, setWithdrawalReason] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showWithdrawalConfirm, setShowWithdrawalConfirm] = useState(false)
  const [consentVersion, setConsentVersion] = useState('2.0')

  const queryClient = useQueryClient()

  // Fetch current consents
  const { data: currentConsents, isLoading: loadingConsents } = useQuery({
    queryKey: ['patient-consents', patientId, clinicId],
    queryFn: async () => {
      // Mock API call - replace with actual implementation
      return [] as GranularConsent[]
    }
  })

  // Fetch consent categories
  const { data: categories = [] as ConsentCategory[] } = useQuery({
    queryKey: ['consent-categories'],
    queryFn: async () => {
      return lgpdConsentManager.getConsentCategories()
    }
  })

  // Update consent mutation
  const updateConsentMutation = useMutation({
    mutationFn: async (data: {
      selectedCategoryIds: string[]
      consentText: string
    }) => {
      return lgpdConsentManager.createGranularConsent(
        patientId,
        clinicId,
        data.selectedCategoryIds,
        data.consentText,
        { version: consentVersion }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patient-consents'])
      setActiveTab('overview')
    }
  })

  // Withdraw consent mutation
  const withdrawConsentMutation = useMutation({
    mutationFn: async (request: ConsentWithdrawalRequest) => {
      // Mock API call - replace with actual implementation
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patient-consents'])
      setShowWithdrawalConfirm(false)
      setWithdrawalReason('')
    }
  })

  // Initialize selected categories from current consents
  useEffect(() => {
    if (currentConsents && currentConsents.length > 0) {
      const activeConsent = currentConsents.find(c => c.status === 'active')
      if (activeConsent) {
        setSelectedCategories(activeConsent.categories.map(cat => cat.id))
      }
    }
  }, [currentConsents])

  const handleCategoryToggle = (categoryId: string, isRequired: boolean) => {
    if (isRequired) return // Required categories cannot be deselected
    
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleConsentSubmit = async () => {
    const requiredCategories = categories.filter(cat => cat.required).map(cat => cat.id)
    const allRequiredSelected = requiredCategories.every(id => selectedCategories.includes(id))
    
    if (!allRequiredSelected) {
      alert('Por favor, selecione todas as categorias obrigatórias')
      return
    }

    const consentText = generateConsentText(selectedCategories)
    
    await updateConsentMutation.mutateAsync({
      selectedCategoryIds: selectedCategories,
      consentText
    })
  }

  const handleWithdrawalSubmit = async () => {
    if (!withdrawalReason.trim()) {
      alert('Por favor, informe o motivo da revogação')
      return
    }

    const activeConsent = currentConsents?.find(c => c.status === 'active')
    if (!activeConsent) return

    const request: ConsentWithdrawalRequest = {
      patientId,
      clinicId,
      consentId: activeConsent.id,
      categories: selectedCategories,
      reason: withdrawalReason,
      method: 'web',
      requestedAt: new Date(),
      effectiveImmediately: true
    }

    await withdrawConsentMutation.mutateAsync(request)
  }

  const generateConsentText = (categoryIds: string[]): string => {
    const selectedCats = categories.filter(cat => categoryIds.includes(cat.id))
    const requiredCats = selectedCats.filter(cat => cat.required)
    const optionalCats = selectedCats.filter(cat => !cat.required)

    let text = `TERMOS DE CONSENTIMENTO - NEONPRO\\n\\n`
    text += `Data: ${new Date().toLocaleDateString('pt-BR')}\\n`
    text += `Versão: ${consentVersion}\\n\\n`

    if (requiredCats.length > 0) {
      text += `CATEGORIAS OBRIGATÓRIAS:\\n`
      requiredCats.forEach(cat => {
        text += `• ${cat.name}: ${cat.description}\\n`
        text += `  Finalidade: ${cat.purpose}\\n`
        text += `  Retenção: ${cat.retentionPeriod} dias\\n\\n`
      })
    }

    if (optionalCats.length > 0) {
      text += `CATEGORIAS OPCIONAIS:\\n`
      optionalCats.forEach(cat => {
        text += `• ${cat.name}: ${cat.description}\\n`
        text += `  Finalidade: ${cat.purpose}\\n`
        text += `  Retenção: ${cat.retentionPeriod} dias\\n\\n`
      })
    }

    text += `DIREITOS DO TITULAR:\\n`
    text += `• Acessar seus dados a qualquer momento\\n`
    text += `• Corrigir informações incorretas\\n`
    text += `• Solicitar exclusão de dados (direito ao esquecimento)\\n`
    text += `• Revogar este consentimento a qualquer momento\\n`
    text += `• Solicitar portabilidade de seus dados\\n\\n`

    text += `EM CASO DE EMERGÊNCIA:\\n`
    text += `Dados essenciais para atendimento médico de emergência permanecerão acessíveis mesmo após revogação, conforme Art. 8º, VII da LGPD.\\n\\n`

    text += `CONTATO:\\n`
    text += `Para exercer seus direitos, entre em contato com:\\n`
    text += `Email: privacidade@neonpro.com.br\\n`
    text += `Telefone: (11) 9999-9999\\n`

    return text
  }

  const getConsentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'withdrawn': return 'bg-red-100 text-red-800 border-red-200'
      case 'expired': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConsentStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'withdrawn': return <XCircle className="h-4 w-4" />
      case 'expired': return <Clock className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'genetic':
      case 'biometric':
        return <User className="h-4 w-4" />
      case 'medical':
        return <FileText className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const activeConsent = currentConsents?.find(c => c.status === 'active')
  const healthcareCategories = categories.filter(cat => cat.healthcareSpecific)
  const requiredCategories = categories.filter(cat => cat.required)
  const selectedRequiredCount = selectedCategories.filter(id => 
    requiredCategories.some(req => req.id === id)
  ).length

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Consentimento LGPD
          </h1>
          <p className="text-gray-600 mt-2">
            Controle granular sobre o uso de seus dados de saúde conforme Lei Geral de Proteção de Dados
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          LGPD Compliant
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="consent">Gerenciar Consentimento</TabsTrigger>
          <TabsTrigger value="withdrawal">Revogar Acesso</TabsTrigger>
          <TabsTrigger value="rights">Meus Direitos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Consent Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Status do Consentimento Atual
              </CardTitle>
              <CardDescription>
                Visão geral dos seus consentimentos ativos e histórico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeConsent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Consentimento Ativo</p>
                        <p className="text-sm text-green-600">
                          Válido desde {activeConsent.givenAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge className={getConsentStatusColor(activeConsent.status)}>
                      {activeConsent.status === 'active' ? 'Ativo' : activeConsent.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Categorias Consentidas ({activeConsent.categories.length})</h4>
                      <ScrollArea className="h-32 border rounded-md p-2">
                        {activeConsent.categories.map(category => (
                          <div key={category.id} className="flex items-center gap-2 py-1">
                            {getDataTypeIcon(category.dataType)}
                            <span className="text-sm">{category.name}</span>
                            {category.required && (
                              <Badge variant="secondary" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Informações do Consentimento</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Versão:</span>
                          <span>{activeConsent.consentVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Data de concessão:</span>
                          <span>{activeConsent.givenAt.toLocaleDateString('pt-BR')}</span>
                        </div>
                        {activeConsent.expiresAt && (
                          <div className="flex justify-between">
                            <span>Expira em:</span>
                            <span>{activeConsent.expiresAt.toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sem Consentimento Ativo</AlertTitle>
                  <AlertDescription>
                    Você não possui um consentimento ativo. Por favor, acesse a aba "Gerenciar Consentimento" para configurar suas preferências.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Healthcare-Specific Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Específicas de Saúde
              </CardTitle>
              <CardDescription>
                Categorias de consentimento específicas para dados de saúde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthcareCategories.map(category => (
                  <div key={category.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getDataTypeIcon(category.dataType)}
                      <span className="font-medium">{category.name}</span>
                      <Badge variant={category.required ? "default" : "secondary"}>
                        {category.required ? "Obrigatório" : "Opcional"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="text-xs text-gray-500">
                      Retenção: {category.retentionPeriod} dias
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Consentimento</CardTitle>
              <CardDescription>
                Selecione as categorias de dados para as quais você dá consentimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Categorias obrigatórias selecionadas</span>
                  <span>{selectedRequiredCount} de {requiredCategories.length}</span>
                </div>
                <Progress 
                  value={(selectedRequiredCount / requiredCategories.length) * 100} 
                  className="h-2"
                />
              </div>

              {/* Required Categories */}
              {requiredCategories.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 text-red-700">Categorias Obrigatórias</h3>
                  <div className="space-y-3">
                    {requiredCategories.map(category => (
                      <div key={category.id} className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id, category.required)}
                          disabled={category.required}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{category.name}</span>
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Finalidade: {category.purpose} • Retenção: {category.retentionPeriod} dias
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consent Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Pré-visualização do Consentimento</h4>
                <ScrollArea className="h-32 border rounded-md p-2 bg-white">
                  <pre className="text-xs whitespace-pre-wrap">
                    {generateConsentText(selectedCategories)}
                  </pre>
                </ScrollArea>
              </div>

              <Button 
                onClick={handleConsentSubmit}
                disabled={updateConsentMutation.isPending || selectedRequiredCount < requiredCategories.length}
                className="w-full"
              >
                {updateConsentMutation.isPending ? 'Salvando...' : 'Salvar Consentimento'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revogar Consentimento</CardTitle>
              <CardDescription>
                Revogue o consentimento para categorias específicas de processamento de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!activeConsent ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Nenhum Consentimento Ativo</AlertTitle>
                  <AlertDescription>
                    Não há consentimento ativo para revogar.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      A revogação do consentimento pode afetar serviços essenciais. Dados de emergência permanecerão acessíveis conforme Art. 8º, VII da LGPD.
                    </AlertDescription>
                  </Alert>

                  {/* Categories to Withdraw */}
                  <div>
                    <h3 className="font-medium mb-3">Selecione as categorias para revogar:</h3>
                    <div className="space-y-3">
                      {activeConsent.categories
                        .filter(cat => cat.id !== 'emergency_services') // Emergency services cannot be fully withdrawn
                        .map(category => (
                          <div key={category.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={() => handleCategoryToggle(category.id, false)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{category.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {category.withdrawalImpact === 'immediate' ? 'Efeito imediato' : 'Efeito gradual'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{category.description}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Withdrawal Reason */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Motivo da revogação (obrigatório):
                    </label>
                    <textarea
                      value={withdrawalReason}
                      onChange={(e) => setWithdrawalReason(e.target.value)}
                      placeholder="Por favor, informe o motivo da revogação do consentimento..."
                      className="w-full p-3 border rounded-md resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowWithdrawalConfirm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowWithdrawalConfirm(true)}
                      disabled={selectedCategories.length === 0 || !withdrawalReason.trim() || withdrawConsentMutation.isPending}
                    >
                      {withdrawConsentMutation.isPending ? 'Processando...' : 'Revogar Consentimento'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seus Direitos LGPD</CardTitle>
              <CardDescription>
                Conheça seus direitos como titular de dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Direito de Acesso
                  </h4>
                  <p className="text-sm text-gray-600">
                    Solicitar confirmação da existência de tratamento e acesso aos seus dados.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Direito de Correção
                  </h4>
                  <p className="text-sm text-gray-600">
                    Solicitar correção de dados incompletos, inexatos ou desatualizados.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Direito de Eliminação
                  </h4>
                  <p className="text-sm text-gray-600">
                    Solicitar a exclusão de seus dados (direito ao esquecimento).
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Direito de Portabilidade
                  </h4>
                  <p className="text-sm text-gray-600">
                    Solicitar seus dados em formato estruturado e interoperável.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Direito de Informação
                  </h4>
                  <p className="text-sm text-gray-600">
                    Ser informado sobre compartilhamento de dados com terceiros.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Direito de Revogação
                  </h4>
                  <p className="text-sm text-gray-600">
                    Revogar o consentimento a qualquer momento.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Como exercer seus direitos:</h4>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>Email: privacidade@neonpro.com.br</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>Telefone: (11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Smartphone className="h-4 w-4" />
                  <span>Aplicativo: Menu de Privacidade</span>
                </div>
              </div>

              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertTitle>Prazo de Resposta</AlertTitle>
                <AlertDescription>
                  Teremos até 15 dias corridos para responder às suas solicitações, conforme Art. 18 da LGPD.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}