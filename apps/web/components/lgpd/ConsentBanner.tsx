'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  Shield, 
  Cookie, 
  Eye, 
  Settings, 
  X, 
  Check,
  Info,
  ExternalLink,
  FileText,
  Lock,
  Users,
  BarChart3,
  Mail,
  Globe
} from 'lucide-react'
import { useConsentBanner } from '@/hooks/useLGPD'
import { ConsentPurpose } from '@/types/lgpd'

interface ConsentBannerProps {
  position?: 'top' | 'bottom'
  theme?: 'light' | 'dark'
  showLogo?: boolean
  companyName?: string
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
}

export function ConsentBanner({ 
  position = 'bottom',
  theme = 'light',
  showLogo = true,
  companyName = 'NeonPro',
  privacyPolicyUrl = '/privacy-policy',
  termsOfServiceUrl = '/terms-of-service'
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
    hideConsentBanner
  } = useConsentBanner()

  const [selectedPurposes, setSelectedPurposes] = useState<Record<string, boolean>>({})
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Inicializar com consentimentos existentes
    const initialConsents: Record<string, boolean> = {}
    purposes?.forEach(purpose => {
      const existingConsent = userConsents?.find(c => c.purpose_id === purpose.id)
      initialConsents[purpose.id] = existingConsent?.status === 'given'
    })
    setSelectedPurposes(initialConsents)
  }, [purposes, userConsents])

  const handlePurposeToggle = (purposeId: string, checked: boolean) => {
    setSelectedPurposes(prev => ({
      ...prev,
      [purposeId]: checked
    }))
  }

  const handleSavePreferences = async () => {
    try {
      for (const [purposeId, granted] of Object.entries(selectedPurposes)) {
        if (granted) {
          await giveConsent(purposeId)
        } else {
          await withdrawConsent(purposeId)
        }
      }
      hideConsentBanner()
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
    }
  }

  const handleAcceptAll = async () => {
    try {
      await acceptAll()
      hideConsentBanner()
    } catch (error) {
      console.error('Erro ao aceitar todos:', error)
    }
  }

  const handleRejectAll = async () => {
    try {
      await rejectAll()
      hideConsentBanner()
    } catch (error) {
      console.error('Erro ao rejeitar todos:', error)
    }
  }

  const getPurposeIcon = (category: string) => {
    switch (category) {
      case 'essential':
        return <Shield className="h-4 w-4" />
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />
      case 'marketing':
        return <Mail className="h-4 w-4" />
      case 'personalization':
        return <Users className="h-4 w-4" />
      case 'advertising':
        return <Globe className="h-4 w-4" />
      default:
        return <Cookie className="h-4 w-4" />
    }
  }

  const getPurposeColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-green-100 text-green-800'
      case 'analytics':
        return 'bg-blue-100 text-blue-800'
      case 'marketing':
        return 'bg-purple-100 text-purple-800'
      case 'personalization':
        return 'bg-orange-100 text-orange-800'
      case 'advertising':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isVisible || isLoading) {
    return null
  }

  const essentialPurposes = purposes?.filter(p => p.category === 'essential') || []
  const optionalPurposes = purposes?.filter(p => p.category !== 'essential') || []

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      
      {/* Banner */}
      <div className={`fixed left-0 right-0 z-50 ${
        position === 'top' ? 'top-0' : 'bottom-0'
      }`}>
        <Card className={`mx-4 mb-4 shadow-lg border-2 ${
          theme === 'dark' 
            ? 'bg-gray-900 border-gray-700 text-white' 
            : 'bg-white border-gray-200'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {showLogo && (
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Cookie className="h-5 w-5" />
                    Suas Preferências de Privacidade
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Respeitamos sua privacidade e seguimos a LGPD
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => hideConsentBanner()}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Resumo */}
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <p className="text-sm leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
                  personalizar conteúdo e analisar nosso tráfego. Você pode escolher quais 
                  tipos de dados deseja compartilhar conosco.
                </p>
              </div>

              {/* Cookies essenciais */}
              {essentialPurposes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Cookies Essenciais</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Sempre Ativo
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Necessários para o funcionamento básico do site. Não podem ser desabilitados.
                  </p>
                </div>
              )}

              {/* Cookies opcionais */}
              {optionalPurposes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Cookies Opcionais</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                    {optionalPurposes.map((purpose) => (
                      <div key={purpose.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={purpose.id}
                          checked={selectedPurposes[purpose.id] || false}
                          onCheckedChange={(checked) => 
                            handlePurposeToggle(purpose.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getPurposeIcon(purpose.category)}
                            <label 
                              htmlFor={purpose.id} 
                              className="text-sm font-medium cursor-pointer"
                            >
                              {purpose.name}
                            </label>
                            <Badge 
                              variant="outline" 
                              className={getPurposeColor(purpose.category)}
                            >
                              {purpose.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {purpose.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links legais */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <a 
                  href={privacyPolicyUrl} 
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-3 w-3" />
                  Política de Privacidade
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a 
                  href={termsOfServiceUrl} 
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Lock className="h-3 w-3" />
                  Termos de Uso
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <div className="flex gap-2 flex-1">
                  <Button 
                    onClick={handleAcceptAll}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aceitar Todos
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleRejectAll}
                    disabled={isLoading}
                  >
                    Rejeitar Opcionais
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </Button>
                  
                  <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Detalhes sobre Cookies e Privacidade
                        </DialogTitle>
                        <DialogDescription>
                          Informações detalhadas sobre como utilizamos seus dados
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <Accordion type="single" collapsible className="w-full">
                          {purposes?.map((purpose) => (
                            <AccordionItem key={purpose.id} value={purpose.id}>
                              <AccordionTrigger className="text-left">
                                <div className="flex items-center gap-3">
                                  {getPurposeIcon(purpose.category)}
                                  <div>
                                    <div className="font-medium">{purpose.name}</div>
                                    <Badge 
                                      variant="outline" 
                                      className={`${getPurposeColor(purpose.category)} text-xs`}
                                    >
                                      {purpose.category}
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-3">
                                <p className="text-sm text-gray-600">
                                  {purpose.description}
                                </p>
                                
                                {purpose.legal_basis && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Base Legal:</h5>
                                    <p className="text-sm text-gray-600">{purpose.legal_basis}</p>
                                  </div>
                                )}
                                
                                {purpose.data_retention_days && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Retenção de Dados:</h5>
                                    <p className="text-sm text-gray-600">
                                      {purpose.data_retention_days} dias
                                    </p>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2 pt-2">
                                  <span className="text-sm font-medium">Status:</span>
                                  {purpose.category === 'essential' ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Sempre Ativo
                                    </Badge>
                                  ) : (
                                    <Badge variant={selectedPurposes[purpose.id] ? "default" : "outline"}>
                                      {selectedPurposes[purpose.id] ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Seus Direitos LGPD
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Acessar seus dados pessoais</li>
                            <li>• Corrigir dados incompletos ou incorretos</li>
                            <li>• Solicitar a exclusão de seus dados</li>
                            <li>• Revogar consentimento a qualquer momento</li>
                            <li>• Portabilidade de dados</li>
                            <li>• Informações sobre compartilhamento</li>
                          </ul>
                          <p className="text-xs text-blue-700 mt-2">
                            Para exercer seus direitos, entre em contato conosco através da página de privacidade.
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
  )
}