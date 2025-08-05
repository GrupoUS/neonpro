'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Cookie, 
  Eye, 
  Settings, 
  Save,
  RefreshCw,
  Download,
  Trash2,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Lock,
  Users,
  BarChart3,
  Mail,
  Globe,
  AlertTriangle
} from 'lucide-react'
import { useConsentBanner } from '@/hooks/useLGPD'
import { ConsentPurpose, ConsentRecord } from '@/types/lgpd'

interface PrivacyPreferencesProps {
  userId?: string
  showHeader?: boolean
  className?: string
}

export function PrivacyPreferences({ 
  userId,
  showHeader = true,
  className 
}: PrivacyPreferencesProps) {
  const {
    purposes,
    userConsents,
    isLoading,
    error,
    giveConsent,
    withdrawConsent,
    refreshData
  } = useConsentBanner()

  const [preferences, setPreferences] = useState<Record<string, boolean>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    // Inicializar preferências com consentimentos existentes
    const initialPreferences: Record<string, boolean> = {}
    purposes?.forEach(purpose => {
      const existingConsent = userConsents?.find(c => c.purpose_id === purpose.id)
      initialPreferences[purpose.id] = existingConsent?.status === 'given'
    })
    setPreferences(initialPreferences)
    setHasChanges(false)
  }, [purposes, userConsents])

  const handlePreferenceChange = (purposeId: string, enabled: boolean) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [purposeId]: enabled }
      
      // Verificar se há mudanças
      const hasChanges = purposes?.some(purpose => {
        const existingConsent = userConsents?.find(c => c.purpose_id === purpose.id)
        const currentStatus = existingConsent?.status === 'given'
        return newPreferences[purpose.id] !== currentStatus
      }) || false
      
      setHasChanges(hasChanges)
      return newPreferences
    })
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      for (const [purposeId, enabled] of Object.entries(preferences)) {
        const existingConsent = userConsents?.find(c => c.purpose_id === purposeId)
        const currentStatus = existingConsent?.status === 'given'
        
        if (enabled !== currentStatus) {
          if (enabled) {
            await giveConsent(purposeId)
          } else {
            await withdrawConsent(purposeId)
          }
        }
      }
      
      setSaveMessage('Preferências salvas com sucesso!')
      setHasChanges(false)
      await refreshData()
    } catch (error) {
      setSaveMessage('Erro ao salvar preferências. Tente novamente.')
      console.error('Erro ao salvar preferências:', error)
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleResetPreferences = () => {
    const resetPreferences: Record<string, boolean> = {}
    purposes?.forEach(purpose => {
      const existingConsent = userConsents?.find(c => c.purpose_id === purpose.id)
      resetPreferences[purpose.id] = existingConsent?.status === 'given'
    })
    setPreferences(resetPreferences)
    setHasChanges(false)
  }

  const getPurposeIcon = (category: string) => {
    switch (category) {
      case 'essential':
        return <Shield className="h-5 w-5" />
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />
      case 'marketing':
        return <Mail className="h-5 w-5" />
      case 'personalization':
        return <Users className="h-5 w-5" />
      case 'advertising':
        return <Globe className="h-5 w-5" />
      default:
        return <Cookie className="h-5 w-5" />
    }
  }

  const getPurposeColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'analytics':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'marketing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'personalization':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'advertising':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConsentHistory = (purposeId: string): ConsentRecord[] => {
    return userConsents?.filter(c => c.purpose_id === purposeId) || []
  }

  const essentialPurposes = purposes?.filter(p => p.category === 'essential') || []
  const optionalPurposes = purposes?.filter(p => p.category !== 'essential') || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando preferências...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar preferências: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Preferências de Privacidade
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie como seus dados são utilizados de acordo com a LGPD
          </p>
        </div>
      )}

      {saveMessage && (
        <Alert className={`mb-4 ${
          saveMessage.includes('sucesso') 
            ? 'border-green-200 bg-green-50 text-green-800' 
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {saveMessage.includes('sucesso') ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="rights">Meus Direitos</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          {/* Cookies Essenciais */}
          {essentialPurposes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Cookies Essenciais
                </CardTitle>
                <CardDescription>
                  Necessários para o funcionamento básico do site. Não podem ser desabilitados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {essentialPurposes.map((purpose) => (
                  <div key={purpose.id} className="flex items-start justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex items-start gap-3 flex-1">
                      {getPurposeIcon(purpose.category)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{purpose.name}</h4>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Sempre Ativo
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{purpose.description}</p>
                        {purpose.legal_basis && (
                          <p className="text-xs text-gray-500">
                            <strong>Base Legal:</strong> {purpose.legal_basis}
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch checked={true} disabled className="mt-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Cookies Opcionais */}
          {optionalPurposes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Cookies Opcionais
                </CardTitle>
                <CardDescription>
                  Você pode escolher quais tipos de dados deseja compartilhar conosco.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {optionalPurposes.map((purpose) => (
                  <div key={purpose.id} className={`p-4 border rounded-lg transition-colors ${
                    preferences[purpose.id] ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getPurposeIcon(purpose.category)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{purpose.name}</h4>
                            <Badge 
                              variant="outline" 
                              className={getPurposeColor(purpose.category)}
                            >
                              {purpose.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{purpose.description}</p>
                          
                          <div className="space-y-1 text-xs text-gray-500">
                            {purpose.legal_basis && (
                              <p><strong>Base Legal:</strong> {purpose.legal_basis}</p>
                            )}
                            {purpose.data_retention_days && (
                              <p><strong>Retenção:</strong> {purpose.data_retention_days} dias</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`switch-${purpose.id}`} className="text-sm">
                          {preferences[purpose.id] ? 'Ativo' : 'Inativo'}
                        </Label>
                        <Switch
                          id={`switch-${purpose.id}`}
                          checked={preferences[purpose.id] || false}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(purpose.id, checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Botões de ação */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleResetPreferences}
              disabled={!hasChanges || isSaving}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
            
            <Button 
              onClick={handleSavePreferences}
              disabled={!hasChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Preferências'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Consentimentos
              </CardTitle>
              <CardDescription>
                Visualize o histórico de suas decisões de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purposes?.map((purpose) => {
                  const history = getConsentHistory(purpose.id)
                  const currentConsent = history.find(c => c.status === 'given')
                  
                  return (
                    <div key={purpose.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getPurposeIcon(purpose.category)}
                          <h4 className="font-medium">{purpose.name}</h4>
                          <Badge 
                            variant={currentConsent ? "default" : "outline"}
                            className={currentConsent ? "bg-green-100 text-green-800" : ""}
                          >
                            {currentConsent ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      
                      {history.length > 0 ? (
                        <div className="space-y-2">
                          {history.slice(0, 3).map((consent, index) => (
                            <div key={consent.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <div className="flex items-center gap-2">
                                {consent.status === 'given' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span>
                                  {consent.status === 'given' ? 'Consentimento dado' : 'Consentimento retirado'}
                                </span>
                              </div>
                              <span className="text-gray-500">
                                {new Date(consent.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          ))}
                          {history.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{history.length - 3} registros anteriores
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum histórico disponível</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Seus Direitos LGPD
              </CardTitle>
              <CardDescription>
                Conheça e exerça seus direitos de proteção de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Acesso aos Dados</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Solicite uma cópia de todos os dados pessoais que temos sobre você.
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Solicitar Dados
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Correção de Dados</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Solicite a correção de dados pessoais incompletos ou incorretos.
                  </p>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Corrigir Dados
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium">Exclusão de Dados</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Solicite a exclusão de seus dados pessoais quando aplicável.
                  </p>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Dados
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Portabilidade</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Receba seus dados em formato estruturado e legível.
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Como exercer seus direitos
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Para exercer qualquer um dos seus direitos LGPD, entre em contato conosco através 
                  dos canais oficiais. Responderemos sua solicitação em até 15 dias úteis.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Contato
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Política de Privacidade
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
