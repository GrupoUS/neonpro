'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Info,
  Settings,
  Eye,
  X,
  Check,
  AlertCircle,
  Cookie,
  Database,
  Share,
  Bell,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock
} from 'lucide-react';
import { useConsentBanner } from '@/hooks/useLGPD';
import { ConsentPurpose, ConsentStatus } from '@/types/lgpd';

/**
 * Consent Banner Component
 * 
 * LGPD-compliant consent banner for collecting and managing user consent including:
 * - Initial consent collection
 * - Granular purpose selection
 * - Consent withdrawal options
 * - Privacy policy integration
 * - Cookie consent management
 * - Data processing transparency
 */
export function ConsentBanner() {
  const {
    showBanner,
    consents,
    purposes,
    loading,
    giveConsent,
    withdrawConsent,
    updateConsent,
    dismissBanner
  } = useConsentBanner();

  const [showDetails, setShowDetails] = useState(false);
  const [selectedPurposes, setSelectedPurposes] = useState<Record<string, boolean>>({});
  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    // Initialize selected purposes based on current consents
    const initialPurposes: Record<string, boolean> = {};
    purposes.forEach(purpose => {
      const existingConsent = consents.find(c => c.purpose === purpose.id);
      initialPurposes[purpose.id] = existingConsent?.status === 'given' || purpose.required;
    });
    setSelectedPurposes(initialPurposes);
  }, [purposes, consents]);

  const handleAcceptAll = async () => {
    try {
      const allPurposes = purposes.map(p => p.id);
      await giveConsent(allPurposes);
      await dismissBanner();
    } catch (error) {
      console.error('Error accepting all consents:', error);
    }
  };

  const handleAcceptSelected = async () => {
    try {
      const acceptedPurposes = Object.entries(selectedPurposes)
        .filter(([_, accepted]) => accepted)
        .map(([purposeId]) => purposeId);
      
      await giveConsent(acceptedPurposes);
      
      // Withdraw consent for unselected optional purposes
      const rejectedPurposes = Object.entries(selectedPurposes)
        .filter(([purposeId, accepted]) => {
          const purpose = purposes.find(p => p.id === purposeId);
          return !accepted && !purpose?.required;
        })
        .map(([purposeId]) => purposeId);
      
      if (rejectedPurposes.length > 0) {
        await withdrawConsent(rejectedPurposes);
      }
      
      await dismissBanner();
      setShowCustomization(false);
    } catch (error) {
      console.error('Error updating consents:', error);
    }
  };

  const handleRejectOptional = async () => {
    try {
      // Only accept required purposes
      const requiredPurposes = purposes
        .filter(p => p.required)
        .map(p => p.id);
      
      await giveConsent(requiredPurposes);
      
      // Withdraw consent for all optional purposes
      const optionalPurposes = purposes
        .filter(p => !p.required)
        .map(p => p.id);
      
      if (optionalPurposes.length > 0) {
        await withdrawConsent(optionalPurposes);
      }
      
      await dismissBanner();
    } catch (error) {
      console.error('Error rejecting optional consents:', error);
    }
  };

  const getPurposeIcon = (purposeId: string) => {
    switch (purposeId) {
      case 'essential':
        return <Lock className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'marketing':
        return <Mail className="h-4 w-4" />;
      case 'personalization':
        return <Settings className="h-4 w-4" />;
      case 'communication':
        return <Bell className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'sharing':
        return <Share className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getPurposeDescription = (purpose: ConsentPurpose) => {
    const descriptions: Record<string, string> = {
      'essential': 'Necessário para o funcionamento básico da plataforma, incluindo autenticação e segurança.',
      'analytics': 'Coleta de dados de uso para melhorar a experiência e performance da plataforma.',
      'marketing': 'Envio de comunicações promocionais e ofertas personalizadas por email.',
      'personalization': 'Personalização de conteúdo e funcionalidades baseada no seu perfil.',
      'communication': 'Notificações sobre atualizações, mudanças e informações importantes.',
      'location': 'Uso de dados de localização para funcionalidades baseadas em geografia.',
      'sharing': 'Compartilhamento de dados com parceiros para melhorar nossos serviços.'
    };
    return descriptions[purpose.id] || purpose.description;
  };

  const getDataTypes = (purpose: ConsentPurpose) => {
    const dataTypes: Record<string, string[]> = {
      'essential': ['Email', 'Nome', 'Dados de autenticação'],
      'analytics': ['Páginas visitadas', 'Tempo de sessão', 'Dispositivo usado'],
      'marketing': ['Email', 'Preferências', 'Histórico de compras'],
      'personalization': ['Preferências', 'Comportamento', 'Configurações'],
      'communication': ['Email', 'Telefone', 'Preferências de notificação'],
      'location': ['Localização aproximada', 'Fuso horário'],
      'sharing': ['Dados agregados', 'Métricas de uso']
    };
    return dataTypes[purpose.id] || ['Dados relacionados ao propósito'];
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Main Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">
                Proteção de Dados Pessoais - LGPD
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Respeitamos sua privacidade. Utilizamos cookies e coletamos dados pessoais para melhorar sua experiência, 
                personalizar conteúdo e analisar o uso da plataforma. Você pode gerenciar suas preferências a qualquer momento.
              </p>
              
              <div className="flex items-center space-x-2 mt-3">
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="outline"
                  size="sm"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Política de Privacidade
                </Button>
                
                <Button
                  onClick={() => setShowCustomization(true)}
                  variant="outline"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
              </div>
            </div>
            
            <div className="flex-shrink-0 space-x-2">
              <Button
                onClick={handleRejectOptional}
                variant="outline"
                disabled={loading}
              >
                Apenas Essenciais
              </Button>
              
              <Button
                onClick={handleAcceptAll}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-2" />
                Aceitar Todos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Política de Privacidade e Proteção de Dados</span>
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre como coletamos, usamos e protegemos seus dados pessoais
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Finalidades do Tratamento de Dados</h3>
              <div className="space-y-4">
                {purposes.map((purpose) => (
                  <Card key={purpose.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        {getPurposeIcon(purpose.id)}
                        <span>{purpose.name}</span>
                        {purpose.required && (
                          <Badge variant="secondary">Obrigatório</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        {getPurposeDescription(purpose)}
                      </p>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Tipos de Dados:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {getDataTypes(purpose).map((dataType, index) => (
                              <li key={index} className="flex items-center space-x-1">
                                <Database className="h-3 w-3" />
                                <span>{dataType}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-2">Base Legal:</h5>
                          <p className="text-xs text-gray-600">
                            {purpose.legalBasis || 'Consentimento do titular'}
                          </p>
                          
                          <h5 className="font-medium text-sm mb-2 mt-3">Retenção:</h5>
                          <p className="text-xs text-gray-600">
                            {purpose.retentionPeriod || 'Até a retirada do consentimento'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Seus Direitos</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Acesso aos Dados</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Solicitar informações sobre quais dados pessoais possuímos sobre você.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Correção</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Corrigir dados pessoais incompletos, inexatos ou desatualizados.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Exclusão</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Solicitar a exclusão de dados pessoais desnecessários ou tratados em desconformidade.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Share className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Portabilidade</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">
                    Solicitar a portabilidade dos dados para outro fornecedor de serviço.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Contato</h3>
              <p className="text-sm text-gray-600">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais, 
                entre em contato conosco através do email: <strong>privacidade@neonpro.com.br</strong>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Consent Customization Dialog */}
      <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Personalizar Consentimentos</span>
            </DialogTitle>
            <DialogDescription>
              Escolha quais finalidades você autoriza para o tratamento dos seus dados pessoais
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {purposes.map((purpose) => {
              const isSelected = selectedPurposes[purpose.id];
              const isRequired = purpose.required;
              
              return (
                <Card key={purpose.id} className={isRequired ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={purpose.id}
                        checked={isSelected}
                        disabled={isRequired}
                        onCheckedChange={(checked) => {
                          if (!isRequired) {
                            setSelectedPurposes({
                              ...selectedPurposes,
                              [purpose.id]: checked as boolean
                            });
                          }
                        }}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <label 
                          htmlFor={purpose.id} 
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          {getPurposeIcon(purpose.id)}
                          <span className="font-medium">{purpose.name}</span>
                          {isRequired && (
                            <Badge variant="secondary" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </label>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {getPurposeDescription(purpose)}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Dados: {getDataTypes(purpose).join(', ')}</span>
                        </div>
                        
                        {isRequired && (
                          <div className="flex items-center space-x-1 mt-2">
                            <AlertCircle className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600">
                              Este consentimento é necessário para o funcionamento da plataforma
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCustomization(false)}
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleAcceptSelected}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-2" />
                Salvar Preferências
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
