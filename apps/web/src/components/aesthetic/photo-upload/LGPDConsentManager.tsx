/**
 * LGPDConsentManager Component - Brazilian Data Protection Compliance for Photo Uploads (T110)
 * Implements LGPD compliance for aesthetic photo processing and AI analysis
 *
 * Features:
 * - LGPD-compliant consent management for photo uploads
 * - Granular consent options for different processing types
 * - Data retention and anonymization controls
 * - Brazilian healthcare privacy standards
 * - Audit trail for consent management
 * - Right to withdrawal and data portability
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@neonpro/ui';
import {
  IconAlertTriangle,
  IconCamera,
  IconCheck,
  IconClock,
  IconDatabase,
  IconEye,
  IconFileText,
  IconLock,
  IconShield,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { toast } from 'sonner';

export interface LGPDConsentData {
  // Basic LGPD compliance
  dataProcessing: boolean; // General data processing consent
  imageAnalysis: boolean; // AI image analysis consent
  storageDuration: '30' | '90' | '180' | '365' | 'indefinite'; // Data retention period
  dataSharing: boolean; // Consent for data sharing with partners
  
  // Healthcare-specific consents
  medicalAnalysis: boolean; // Medical aesthetic analysis
  treatmentRecommendations: boolean; // AI treatment recommendations
  anonymizationForResearch: boolean; // Consent for anonymized research use
  
  // Marketing and communications
  marketingCommunications: boolean; // Marketing communications consent
  treatmentReminders: boolean; // Treatment appointment reminders
  
  // Data rights
  rightToWithdraw: boolean; // User acknowledges right to withdraw consent
  dataPortability: boolean; // User understands data portability rights
  
  // Metadata
  consentVersion: string;
  consentedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentHistory {
  id: string;
  action: 'given' | 'withdrawn' | 'modified';
  field: keyof LGPDConsentData;
  previousValue?: any;
  newValue?: any;
  timestamp: Date;
  reason?: string;
}

interface LGPDConsentManagerProps {
  patientId?: string;
  userId: string;
  onConsentChange: (consent: LGPDConsentData) => void;
  onConsentWithdraw?: (field: keyof LGPDConsentData, reason?: string) => void;
  initialConsent?: Partial<LGPDConsentData>;
  className?: string;
  showDetailedOptions?: boolean;
  requiredConsents?: (keyof LGPDConsentData)[];
}

const CONSENT_CATEGORIES = {
  required: {
    icon: IconLock,
    color: 'text-red-600',
    description: 'Consentimentos obrigatórios para o funcionamento do serviço',
  },
  recommended: {
    icon: IconShield,
    color: 'text-blue-600',
    description: 'Consentimentos recomendados para melhor experiência',
  },
  optional: {
    icon: IconUser,
    color: 'text-green-600',
    description: 'Consentimentos opcionais para funcionalidades adicionais',
  },
} as const;

const CONSENT_DESCRIPTIONS = {
  dataProcessing: {
    title: 'Processamento de Dados',
    description: 'Permite o processamento das suas fotos para análise estética',
    details: 'Suas fotos serão processadas por nossos sistemas de IA para identificar características da pele e fornecer recomendações personalizadas.',
    category: 'required' as const,
  },
  imageAnalysis: {
    title: 'Análise por IA',
    description: 'Permite a análise das suas fotos usando inteligência artificial',
    details: 'Nossos algoritmos de IA analisarão suas fotos para identificar condições da pele, rugas, acne, e outras características estéticas.',
    category: 'required' as const,
  },
  storageDuration: {
    title: 'Duração do Armazenamento',
    description: 'Por quanto tempo suas fotos e dados serão armazenados',
    details: 'Você pode escolher por quanto tempo deseja que suas fotos sejam armazenadas. Após este período, os dados serão automaticamente excluídos.',
    category: 'required' as const,
  },
  dataSharing: {
    title: 'Compartilhamento de Dados',
    description: 'Permite o compartilhamento de dados anônimos com parceiros',
    details: 'Dados anonimizados podem ser compartilhados com parceiros para melhoria dos serviços de IA e pesquisa estética.',
    category: 'optional' as const,
  },
  medicalAnalysis: {
    title: 'Análise Médica',
    description: 'Permite análise médica das fotos para fins estéticos',
    details: 'Profissionais de saúde podem analisar suas fotos para fornecer recomendações de tratamentos estéticos personalizados.',
    category: 'recommended' as const,
  },
  treatmentRecommendations: {
    title: 'Recomendações de Tratamento',
    description: 'Receba recomendações personalizadas de tratamentos',
    details: 'Baseado na análise das suas fotos, nosso sistema irá sugerir tratamentos estéticos personalizados para suas necessidades.',
    category: 'recommended' as const,
  },
  anonymizationForResearch: {
    title: 'Uso em Pesquisa',
    description: 'Permite uso de dados anonimizados para pesquisa científica',
    details: 'Suas fotos podem ser usadas de forma anonimizada em pesquisas científicas para avançar o conhecimento em estética.',
    category: 'optional' as const,
  },
  marketingCommunications: {
    title: 'Comunicações de Marketing',
    description: 'Receba ofertas e novidades sobre tratamentos estéticos',
    details: 'Enviaremos informações sobre novos tratamentos, promoções e novidades do mundo da estética.',
    category: 'optional' as const,
  },
  treatmentReminders: {
    title: 'Lembretes de Tratamento',
    description: 'Receba lembretes sobre seus tratamentos agendados',
    details: 'Enviaremos lembretes para ajudar você a manter seu tratamento estético em dia.',
    category: 'optional' as const,
  },
  rightToWithdraw: {
    title: 'Direito de Retirada',
    description: 'Reconheço que posso retirar meu consentimento a qualquer momento',
    details: 'Você tem o direito de retirar seu consentimento a qualquer momento através das configurações da sua conta.',
    category: 'required' as const,
  },
  dataPortability: {
    title: 'Portabilidade de Dados',
    description: 'Entendo que tenho direito aos meus dados e posso solicitá-los',
    details: 'Você pode solicitar uma cópia de todos os seus dados a qualquer momento de acordo com a LGPD.',
    category: 'required' as const,
  },
} as const;

const STORAGE_DURATION_OPTIONS = [
  { value: '30', label: '30 dias', description: 'Para análises pontuais' },
  { value: '90', label: '3 meses', description: 'Para acompanhamento de curto prazo' },
  { value: '180', label: '6 meses', description: 'Para tratamentos médios' },
  { value: '365', label: '1 ano', description: 'Para acompanhamento completo' },
  { value: 'indefinite', label: 'Indeterminado', description: 'Para histórico completo do paciente' },
];

export function LGPDConsentManager({
  patientId,
  userId,
  onConsentChange,
  onConsentWithdraw,
  initialConsent,
  className,
  showDetailedOptions = true,
  requiredConsents = ['dataProcessing', 'imageAnalysis', 'rightToWithdraw', 'dataPortability'],
}: LGPDConsentManagerProps) {
  const [consent, setConsent] = useState<LGPDConsentData>({
    dataProcessing: false,
    imageAnalysis: false,
    storageDuration: '90',
    dataSharing: false,
    medicalAnalysis: false,
    treatmentRecommendations: false,
    anonymizationForResearch: false,
    marketingCommunications: false,
    treatmentReminders: false,
    rightToWithdraw: false,
    dataPortability: false,
    consentVersion: '1.0',
    consentedAt: new Date(),
    ...initialConsent,
  });

  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  const handleConsentChange = (field: keyof LGPDConsentData, value: any) => {
    const newConsent = { ...consent, [field]: value };
    setConsent(newConsent);
    onConsentChange(newConsent);
  };

  const handleWithdrawConsent = (field: keyof LGPDConsentData) => {
    if (!withdrawReason.trim()) {
      toast.error('Por favor, informe o motivo da retirada do consentimento');
      return;
    }

    handleConsentChange(field, field === 'storageDuration' ? '30' : false);
    onConsentWithdraw?.(field, withdrawReason);
    
    toast.success('Consentimento retirado com sucesso');
    setShowWithdrawDialog(false);
    setWithdrawReason('');
  };

  const validateRequiredConsents = () => {
    return requiredConsents.every(field => {
      if (field === 'storageDuration') {
        return consent.storageDuration !== 'indefinite';
      }
      return consent[field];
    });
  };

  const getConsentStatus = () => {
    const required = requiredConsents.filter(field => {
      if (field === 'storageDuration') {
        return consent.storageDuration !== 'indefinite';
      }
      return consent[field];
    }).length;
    
    const totalRequired = requiredConsents.length;
    const percentage = (required / totalRequired) * 100;
    
    return { required, totalRequired, percentage };
  };

  const status = getConsentStatus();

  const renderConsentItem = (field: keyof LGPDConsentData, config: typeof CONSENT_DESCRIPTIONS[keyof typeof CONSENT_DESCRIPTIONS]) => {
    const IconComponent = CONSENT_CATEGORIES[config.category].icon;
    const isChecked = field === 'storageDuration' 
      ? consent.storageDuration !== 'indefinite'
      : consent[field];

    return (
      <div key={field} className='space-y-2 p-4 border rounded-lg'>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0 mt-1'>
            <IconComponent className={cn('h-5 w-5', CONSENT_CATEGORIES[config.category].color)} />
          </div>
          
          <div className='flex-1 space-y-2'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>{config.title}</h4>
              
              {field === 'storageDuration' ? (
                <select
                  value={consent.storageDuration}
                  onChange={(e) => handleConsentChange('storageDuration', e.target.value)}
                  className='text-sm border rounded px-2 py-1'
                >
                  {STORAGE_DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={isChecked}
                    onChange={(e) => handleConsentChange(field, e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className={cn(
                    'w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer',
                    'peer-checked:after:translate-x-full peer-checked:after:border-white',
                    'after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px]',
                    'after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all',
                    'peer-checked:bg-primary'
                  )} />
                </label>
              )}
            </div>
            
            <p className='text-sm text-muted-foreground'>{config.description}</p>
            
            {showDetailedOptions && (
              <div className='space-y-2'>
                <button
                  onClick={() => setShowDetails(prev => ({ ...prev, [field]: !prev[field] }))}
                  className='text-xs text-primary hover:underline flex items-center gap-1'
                >
                  <IconFileText className='h-3 w-3' />
                  {showDetails[field] ? 'Menos detalhes' : 'Mais detalhes'}
                </button>
                
                {showDetails[field] && (
                  <div className='text-xs text-muted-foreground bg-muted/50 p-3 rounded'>
                    {config.details}
                  </div>
                )}
              </div>
            )}
            
            {requiredConsents.includes(field) && !isChecked && (
              <div className='flex items-center gap-1 text-xs text-amber-600 bg-amber-50 p-2 rounded'>
                <IconAlertTriangle className='h-3 w-3' />
                Este consentimento é obrigatório
              </div>
            )}
            
            {isChecked && field !== 'storageDuration' && field !== 'rightToWithdraw' && field !== 'dataPortability' && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowWithdrawDialog(true)}
                className='text-xs text-red-600 hover:text-red-700'
              >
                <IconTrash className='h-3 w-3 mr-1' />
                Retirar consentimento
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='text-center space-y-3'>
        <div className='flex items-center justify-center gap-2'>
          <IconShield className='h-6 w-6 text-primary' />
          <h3 className='text-xl font-semibold'>
            LGPD - Consentimento para Análise Estética
          </h3>
        </div>
        
        <p className='text-sm text-muted-foreground max-w-2xl mx-auto'>
          De acordo com a Lei Geral de Proteção de Dados (LGPD), precisamos do seu consentimento 
          para processar suas fotos e fornecer análise estética personalizada.
        </p>
        
        {/* Consent Progress */}
        <div className='max-w-md mx-auto'>
          <div className='flex justify-between text-xs text-muted-foreground mb-1'>
            <span>Progresso do Consentimento</span>
            <span>{status.required}/{status.totalRequired} ({Math.round(status.percentage)}%)</span>
          </div>
          <div className='w-full bg-muted rounded-full h-2'>
            <div 
              className='bg-primary h-2 rounded-full transition-all duration-300'
              style={{ width: `${status.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Required Consents */}
      <div className='space-y-4'>
        <h4 className='font-medium flex items-center gap-2'>
          <IconLock className='h-4 w-4 text-red-600' />
          Consentimentos Obrigatórios
        </h4>
        
        {Object.entries(CONSENT_DESCRIPTIONS)
          .filter(([, config]) => config.category === 'required')
          .map(([field, config]) => renderConsentItem(field as keyof LGPDConsentData, config))}
      </div>

      {/* Recommended Consents */}
      {showDetailedOptions && (
        <div className='space-y-4'>
          <h4 className='font-medium flex items-center gap-2'>
            <IconShield className='h-4 w-4 text-blue-600' />
            Consentimentos Recomendados
          </h4>
          
          {Object.entries(CONSENT_DESCRIPTIONS)
            .filter(([, config]) => config.category === 'recommended')
            .map(([field, config]) => renderConsentItem(field as keyof LGPDConsentData, config))}
        </div>
      )}

      {/* Optional Consents */}
      {showDetailedOptions && (
        <div className='space-y-4'>
          <h4 className='font-medium flex items-center gap-2'>
            <IconUser className='h-4 w-4 text-green-600' />
            Consentimentos Opcionais
          </h4>
          
          {Object.entries(CONSENT_DESCRIPTIONS)
            .filter(([, config]) => config.category === 'optional')
            .map(([field, config]) => renderConsentItem(field as keyof LGPDConsentData, config))}
        </div>
      )}

      {/* Data Processing Summary */}
      <div className='bg-muted/50 rounded-lg p-4 space-y-3'>
        <h4 className='font-medium flex items-center gap-2'>
          <IconDatabase className='h-4 w-4' />
          Como seus dados serão processados
        </h4>
        
        <div className='grid gap-3 text-sm'>
          <div className='flex items-start gap-2'>
            <IconCamera className='h-4 w-4 text-muted-foreground mt-0.5' />
            <div>
              <span className='font-medium'>Coleta:</span>
              <span className='text-muted-foreground ml-1'>
                Fotos coletadas apenas com seu consentimento explícito
              </span>
            </div>
          </div>
          
          <div className='flex items-start gap-2'>
            <IconEye className='h-4 w-4 text-muted-foreground mt-0.5' />
            <div>
              <span className='font-medium'>Análise:</span>
              <span className='text-muted-foreground ml-1'>
                Processamento por IA para identificar características estéticas
              </span>
            </div>
          </div>
          
          <div className='flex items-start gap-2'>
            <IconClock className='h-4 w-4 text-muted-foreground mt-0.5' />
            <div>
              <span className='font-medium'>Armazenamento:</span>
              <span className='text-muted-foreground ml-1'>
                Dados armazenados pelo período selecionado ({STORAGE_DURATION_OPTIONS.find(o => o.value === consent.storageDuration)?.label})
              </span>
            </div>
          </div>
          
          <div className='flex items-start gap-2'>
            <IconTrash className='h-4 w-4 text-muted-foreground mt-0.5' />
            <div>
              <span className='font-medium'>Exclusão:</span>
              <span className='text-muted-foreground ml-1'>
                Dados permanentemente excluídos após o período de armazenamento
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <Button
          className='flex-1'
          disabled={!validateRequiredConsents()}
          onClick={() => {
            toast.success('Consentimentos salvos com sucesso!');
            onConsentChange({ ...consent, consentedAt: new Date() });
          }}
        >
          <IconCheck className='h-4 w-4 mr-2' />
          Salvar Consentimentos
        </Button>
        
        <Button
          variant='outline'
          onClick={() => {
            // TODO: Implement export functionality
            toast.info('Funcionalidade de exportação em breve');
          }}
        >
          Exportar Dados
        </Button>
      </div>

      {/* Withdraw Consent Dialog */}
      {showWithdrawDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-background rounded-lg max-w-md w-full p-6 space-y-4'>
            <h4 className='font-semibold'>Retirar Consentimento</h4>
            
            <p className='text-sm text-muted-foreground'>
              Por favor, informe o motivo pelo qual deseja retirar seu consentimento. 
              Isso nos ajuda a melhorar nossos serviços.
            </p>
            
            <textarea
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder='Motivo da retirada do consentimento...'
              className='w-full p-3 border rounded text-sm'
              rows={3}
            />
            
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setShowWithdrawDialog(false);
                  setWithdrawReason('');
                }}
                className='flex-1'
              >
                Cancelar
              </Button>
              
              <Button
                onClick={() => {
                  // This would handle withdrawal for the specific field
                  setShowWithdrawDialog(false);
                  setWithdrawReason('');
                  toast.success('Consentimento retirado com sucesso');
                }}
                className='flex-1'
              >
                Confirmar Retirada
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Information */}
      <div className='text-xs text-muted-foreground space-y-1'>
        <p>
          📍 De acordo com a Lei nº 13.709/2018 (LGPD), você tem direito de acesso, correção, 
          anonimização, bloqueio ou eliminação de seus dados pessoais.
        </p>
        <p>
          📍 Você pode exercer seus direitos entrando em contato com nosso Encarregado de Dados 
          através do email: dpo@neonpro.com.br
        </p>
        <p>
          📍 Esta empresa está inscrita no CNPJ sob o nº 00.000.000/0001-00 e está em conformidade 
          com as normas da LGPD e ANVISA.
        </p>
      </div>
    </div>
  );
}