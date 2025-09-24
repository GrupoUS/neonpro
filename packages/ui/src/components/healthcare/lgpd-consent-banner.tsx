/**
 * LGPD Consent Banner Component
 *
 * Enhanced consent management banner with healthcare-specific LGPD compliance,
 * granular consent options, accessibility features, and audit trail.
 *
 * @fileoverview LGPD-compliant consent banner for healthcare applications
 */

'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
// import { z } from 'zod'; // TODO: Add Zod validation for consent data
import { cn } from '../../lib/utils'
import {
  lgpdConsentSchema,
  // TODO: Implement healthcareValidationMessages usage
  // healthcareValidationMessages
} from '../../utils/healthcare-validation'
import { useHealthcareTheme } from '../healthcare/healthcare-theme-provider'

// Define LGPD enums locally since utils does not export them yet
export enum ConsentType {
  ESSENTIAL = 'essential',
  FUNCTIONAL = 'functional',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  RESEARCH = 'research',
}

export enum HealthcareDataType {
  PERSONAL = 'personal',
  MEDICAL = 'medical',
  SENSITIVE = 'sensitive',
  BIOMETRIC = 'biometric',
  GENETIC = 'genetic',
}

export enum DataProcessingPurpose {
  TREATMENT = 'treatment',
  PREVENTION = 'prevention',
  RESEARCH = 'research',
  ADMINISTRATION = 'administration',
  LEGAL = 'legal',
  EMERGENCY = 'emergency',
}
import {
  announceToScreenReader,
  HealthcarePriority,
  // TODO: Implement generateAccessibleId usage
  // generateAccessibleId
} from '../../utils/accessibility'

// Consent banner props
export interface LGPDConsentBannerProps {
  // Display settings
  variant?: 'banner' | 'modal' | 'inline'
  position?: 'top' | 'bottom' | 'center'

  // Consent configuration
  requiredConsents: ConsentType[]
  optionalConsents?: ConsentType[]
  dataTypes: HealthcareDataType[]
  processingPurposes: DataProcessingPurpose[]

  // Content customization
  title?: string
  description?: string
  privacyPolicyUrl?: string
  dataProcessingUrl?: string
  contactEmail?: string

  // Behavior
  allowGranular?: boolean
  showOnce?: boolean
  autoShow?: boolean
  persistConsent?: boolean

  // Event handlers
  onConsentGiven?: (consents: Record<ConsentType, boolean>) => void
  onConsentWithdrawn?: (consentType: ConsentType) => void
  onPrivacyPolicyView?: () => void
  onDataProcessingView?: () => void

  // Styling
  className?: string
}

// Consent status type
type ConsentStatus = Record<ConsentType, boolean>

// Stored consent data interface
interface StoredConsentData {
  consents: ConsentStatus
  timestamp: string
  version: string
  dataTypes: HealthcareDataType[]
  processingPurposes: DataProcessingPurpose[]
}

// Consent descriptions for each type
const consentDescriptions: Record<
  ConsentType,
  { title: string; description: string; required?: boolean }
> = {
  [ConsentType.ESSENTIAL]: {
    title: 'Cookies e Dados Essenciais',
    description:
      'Necessários para o funcionamento básico da plataforma de saúde e segurança dos dados.',
    required: true,
  },
  [ConsentType.FUNCTIONAL]: {
    title: 'Funcionalidades Melhoradas',
    description:
      'Permitem funcionalidades avançadas como salvamento de preferências e configurações médicas.',
  },
  [ConsentType.ANALYTICS]: {
    title: 'Análise e Melhoria',
    description: 'Ajudam a melhorar nossos serviços de saúde através de análises anônimas de uso.',
  },
  [ConsentType.MARKETING]: {
    title: 'Comunicação e Marketing',
    description: 'Permitem envio de comunicações sobre serviços de saúde e promoções relevantes.',
  },
  [ConsentType.RESEARCH]: {
    title: 'Pesquisa Médica',
    description: 'Dados anonimizados para pesquisas científicas e desenvolvimento de tratamentos.',
  },
}

// Data type descriptions
const dataTypeDescriptions: Record<HealthcareDataType, string> = {
  [HealthcareDataType.PERSONAL]: 'Dados pessoais básicos (nome, e-mail, telefone)',
  [HealthcareDataType.MEDICAL]: 'Dados médicos e de saúde',
  [HealthcareDataType.SENSITIVE]: 'Dados sensíveis de saúde (diagnósticos, exames)',
  [HealthcareDataType.BIOMETRIC]: 'Dados biométricos',
  [HealthcareDataType.GENETIC]: 'Dados genéticos',
}

// Processing purpose descriptions
const purposeDescriptions: Record<DataProcessingPurpose, string> = {
  [DataProcessingPurpose.TREATMENT]: 'Prestação de cuidados médicos',
  [DataProcessingPurpose.PREVENTION]: 'Prevenção de doenças e promoção da saúde',
  [DataProcessingPurpose.RESEARCH]: 'Pesquisa científica e desenvolvimento',
  [DataProcessingPurpose.ADMINISTRATION]: 'Administração de serviços de saúde',
  [DataProcessingPurpose.LEGAL]: 'Cumprimento de obrigações legais',
  [DataProcessingPurpose.EMERGENCY]: 'Atendimento de emergências médicas',
}

/**
 * LGPD Consent Banner Component
 *
 * Provides comprehensive LGPD consent management with healthcare-specific
 * consent types, granular control, and accessibility compliance.
 */
export const LGPDConsentBanner: React.FC<LGPDConsentBannerProps> = ({
  variant = 'banner',
  position = 'bottom',
  requiredConsents,
  optionalConsents = [],
  dataTypes,
  processingPurposes,
  title = 'Consentimento para Dados de Saúde',
  description =
    'Para oferecer os melhores cuidados de saúde, precisamos do seu consentimento para processar seus dados conforme a LGPD.',
  privacyPolicyUrl,
  dataProcessingUrl,
  contactEmail = 'privacidade@neonpro.health',
  allowGranular = true,
  showOnce = true,
  autoShow = true,
  persistConsent = true,
  onConsentGiven,
  // TODO: Re-enable when onConsentWithdrawn is actually used
  // onConsentWithdrawn,
  onPrivacyPolicyView,
  onDataProcessingView,
  className,
}) => {
  // Context and theme
  const { theme } = useHealthcareTheme()
  // TODO: Implement accessibility features
  // const { theme, accessibility } = useHealthcareTheme();

  // Local state
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(() => {
    const initialStatus: ConsentStatus = {} as ConsentStatus

    // Set required consents to true by default
    requiredConsents.forEach(consent => {
      initialStatus[consent] = true
    })

    // Set optional consents to false by default
    optionalConsents.forEach(consent => {
      initialStatus[consent] = false
    })

    return initialStatus
  })

  // All consent types
  const allConsents = useMemo(
    () => [...requiredConsents, ...optionalConsents],
    [requiredConsents, optionalConsents],
  )

  // Check if consent was already given
  const checkExistingConsent = useCallback(() => {
    if (!persistConsent) return false

    try {
      const stored = localStorage.getItem('lgpd-healthcare-consent')
      if (stored) {
        const parsed = JSON.parse(stored)
        const consentData = lgpdConsentSchema.parse(parsed)

        // Check if all required consents are given
        // Map schema properties to consent types
        const schemaToConsent = {
          dataProcessingConsent: ConsentType.ESSENTIAL,
          marketingConsent: ConsentType.MARKETING,
          analyticsConsent: ConsentType.ANALYTICS,
        }

        const hasAllRequired = requiredConsents.every(consent => {
          // Find matching schema property for this consent type
          const schemaKey = Object.entries(schemaToConsent).find(
            ([, consentType]) => consentType === consent,
          )?.[0]
          return schemaKey
            ? consentData[schemaKey as keyof typeof consentData] === true
            : false
        })

        if (hasAllRequired) {
          // Convert schema data back to consent status for state
          const consentStatus: ConsentStatus = {} as ConsentStatus
          Object.entries(schemaToConsent).forEach(
            ([schemaKey, consentType]) => {
              consentStatus[consentType] = Boolean(
                consentData[schemaKey as keyof typeof consentData],
              )
            },
          )
          setConsentStatus(consentStatus)
          return true
        }
      }
    } catch (error) {
      console.warn('Error reading stored consent:', error)
    }

    return false
  }, [requiredConsents, persistConsent])

  // Show banner logic
  useEffect(() => {
    if (autoShow) {
      const hasConsent = checkExistingConsent()

      if (!hasConsent || !showOnce) {
        setIsVisible(true)

        // Announce to screen readers
        announceToScreenReader(
          'Banner de consentimento LGPD para dados de saúde exibido',
          HealthcarePriority.MEDIUM,
        )
      }
    }
  }, [autoShow, checkExistingConsent, showOnce])

  // Handle consent change
  const handleConsentChange = (consentType: ConsentType, granted: boolean) => {
    // Required consents cannot be disabled
    if (requiredConsents.includes(consentType) && !granted) {
      announceToScreenReader(
        'Este consentimento é obrigatório para o funcionamento da plataforma',
        HealthcarePriority.HIGH,
      )
      return
    }

    setConsentStatus(prev => ({
      ...prev,
      [consentType]: granted,
    }))

    // Announce change
    const description = consentDescriptions[consentType]?.title || consentType
    announceToScreenReader(
      `Consentimento ${description} ${granted ? 'concedido' : 'retirado'}`,
      HealthcarePriority.MEDIUM,
    )
  }

  // Handle accept all
  const handleAcceptAll = () => {
    const allAccepted: ConsentStatus = {} as ConsentStatus
    allConsents.forEach(consent => {
      allAccepted[consent] = true
    })

    setConsentStatus(allAccepted)
    saveConsent(allAccepted)
  }

  // Handle accept required only
  const handleAcceptRequired = () => {
    const requiredOnly: ConsentStatus = {} as ConsentStatus

    // Accept required
    requiredConsents.forEach(consent => {
      requiredOnly[consent] = true
    })

    // Reject optional
    optionalConsents.forEach(consent => {
      requiredOnly[consent] = false
    })

    setConsentStatus(requiredOnly)
    saveConsent(requiredOnly)
  }

  // Save consent
  const saveConsent = (consents: ConsentStatus) => {
    const consentData = {
      dataProcessingConsent: !!consents[ConsentType.ESSENTIAL],
      marketingConsent: !!consents[ConsentType.MARKETING],
      analyticsConsent: !!consents[ConsentType.ANALYTICS],
      consentTimestamp: new Date().toISOString(),
      consentVersion: '1.0',
      userAgent: navigator.userAgent,
      ipAddress: '', // Will be filled by backend
    }

    try {
      // Validate consent data (shape expected by schema)
      lgpdConsentSchema.parse(consentData)

      // Store locally if enabled (persist original map plus validated data)
      if (persistConsent) {
        localStorage.setItem(
          'lgpd-healthcare-consent',
          JSON.stringify({ consents, ...consentData }),
        )
      }

      // Notify parent
      onConsentGiven?.(consents)

      // Hide banner
      setIsVisible(false)

      // Announce success
      announceToScreenReader(
        'Consentimentos salvos com sucesso',
        HealthcarePriority.LOW,
      )
    } catch (error) {
      console.error('Error saving consent:', error)
      announceToScreenReader(
        'Erro ao salvar consentimentos. Tente novamente.',
        HealthcarePriority.HIGH,
      )
    }
  }

  // Handle withdraw consent (currently unused but kept for future functionality)
  // const handleWithdrawConsent = (consentType: ConsentType) => {
  //   if (requiredConsents.includes(consentType)) {
  //     announceToScreenReader(
  //       'Consentimentos obrigatórios não podem ser retirados',
  //       HealthcarePriority.HIGH
  //     );
  //     return;
  //   }
  //
  //   handleConsentChange(consentType, false);
  //   onConsentWithdrawn?.(consentType);
  // };

  // Don't render if not visible
  if (!isVisible) return null

  const bannerClasses = cn(
    'lgpd-consent-banner bg-background border shadow-lg',
    {
      // Variant styles
      'fixed left-0 right-0 z-50 border-x-0': variant === 'banner',
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm': variant === 'modal',
      'relative border rounded-lg': variant === 'inline',

      // Position styles (for banner variant)
      'top-0 border-b': variant === 'banner' && position === 'top',
      'bottom-0 border-t': variant === 'banner' && position === 'bottom',

      // Emergency mode
      'border-warning bg-warning/5': theme.emergencyMode,
    },
    className,
  )

  const contentClasses = cn('p-4 max-w-4xl mx-auto', {
    'p-6': variant === 'modal',
    'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-background border rounded-lg shadow-xl':
      variant === 'modal',
  })

  return (
    <div
      className={bannerClasses}
      role='banner'
      aria-label='Consentimento LGPD'
    >
      <div className={contentClasses}>
        {/* Header */}
        <div className='mb-4'>
          <h2 className='text-lg font-semibold mb-2 flex items-center gap-2'>
            <span role='img' aria-label='Privacidade'>
              🔒
            </span>
            {title}
          </h2>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>

        {/* Data types and purposes info */}
        <div className='mb-4 p-3 bg-muted rounded-md'>
          <h3 className='text-sm font-medium mb-2'>
            Tipos de Dados Processados:
          </h3>
          <ul className='text-xs text-muted-foreground space-y-1'>
            {dataTypes.map(dataType => (
              <li key={dataType} className='flex items-start gap-2'>
                <span>•</span>
                <span>{dataTypeDescriptions[dataType]}</span>
              </li>
            ))}
          </ul>

          <h3 className='text-sm font-medium mt-3 mb-2'>
            Finalidades do Tratamento:
          </h3>
          <ul className='text-xs text-muted-foreground space-y-1'>
            {processingPurposes.map(purpose => (
              <li key={purpose} className='flex items-start gap-2'>
                <span>•</span>
                <span>{purposeDescriptions[purpose]}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Granular consent options */}
        {allowGranular && (
          <div className='mb-4'>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className='text-sm text-primary hover:underline mb-3 flex items-center gap-1'
              aria-expanded={showDetails}
            >
              {showDetails ? '▼' : '▶'} Configurações Detalhadas de Consentimento
            </button>

            {showDetails && (
              <div className='space-y-3 border rounded-md p-3'>
                {allConsents.map(consentType => {
                  const info = consentDescriptions[consentType]
                  const isRequired = requiredConsents.includes(consentType)

                  return (
                    <div key={consentType} className='flex items-start gap-3'>
                      <input
                        type='checkbox'
                        id={`consent-${consentType}`}
                        checked={consentStatus[consentType]}
                        disabled={isRequired}
                        onChange={e => handleConsentChange(consentType, e.target.checked)}
                        className='mt-1'
                        aria-describedby={`consent-${consentType}-desc`}
                      />
                      <div className='flex-1'>
                        <label
                          htmlFor={`consent-${consentType}`}
                          className={cn('text-sm font-medium cursor-pointer', {
                            'cursor-not-allowed opacity-70': isRequired,
                          })}
                        >
                          {info?.title || consentType}
                          {isRequired && <span className='text-destructive ml-1'>*</span>}
                        </label>
                        <p
                          id={`consent-${consentType}-desc`}
                          className='text-xs text-muted-foreground mt-1'
                        >
                          {info?.description ||
                            'Consentimento para processamento de dados'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className='flex flex-col sm:flex-row gap-3 mb-4'>
          <button
            onClick={handleAcceptAll}
            className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium'
          >
            Aceitar Todos
          </button>

          <button
            onClick={handleAcceptRequired}
            className='px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors'
          >
            Apenas Necessários
          </button>

          {allowGranular && (
            <button
              onClick={() => saveConsent(consentStatus)}
              className='px-4 py-2 border border-input rounded-md hover:bg-accent transition-colors'
            >
              Salvar Preferências
            </button>
          )}
        </div>

        {/* Footer links */}
        <div className='text-xs text-muted-foreground space-y-1'>
          <div className='flex flex-wrap gap-4'>
            {privacyPolicyUrl && (
              <a
                href={privacyPolicyUrl}
                target='blank'
                rel='noopener noreferrer'
                onClick={e => {
                  e.preventDefault()
                  onPrivacyPolicyView?.()
                }}
                className='hover:underline'
              >
                Política de Privacidade
              </a>
            )}

            {dataProcessingUrl && (
              <a
                href={dataProcessingUrl}
                target='blank'
                rel='noopener noreferrer'
                onClick={e => {
                  e.preventDefault()
                  onDataProcessingView?.()
                }}
                className='hover:underline'
              >
                Como Processamos seus Dados
              </a>
            )}

            <span>
              Dúvidas? Entre em contato:{' '}
              <a href={`mailto:${contactEmail}`} className='hover:underline'>
                {contactEmail}
              </a>
            </span>
          </div>

          <p className='mt-2'>
            Seus dados são protegidos conforme a Lei Geral de Proteção de Dados (LGPD). Você pode
            alterar ou retirar seus consentimentos a qualquer momento.
          </p>
        </div>

        {/* Close button for modal */}
        {variant === 'modal' && (
          <button
            onClick={() => setIsVisible(false)}
            className='absolute top-4 right-4 text-muted-foreground hover:text-foreground'
            aria-label='Fechar'
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

// Hook for consent management
export const useLGPDConsent = () => {
  const [hasConsent, setHasConsent] = useState(false)
  const [consentData, setConsentData] = useState<StoredConsentData | null>(
    null,
  )

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lgpd-healthcare-consent')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Support older shape (consents map) by extracting into ConsentStatus if present
        const status: ConsentStatus = parsed.consents || {}
        setConsentData(parsed)
        setHasConsent(Boolean(status[ConsentType.ESSENTIAL]))
      }
    } catch (error) {
      console.warn('Error reading stored consent:', error)
    }
  }, [])

  const withdrawConsent = (consentType: ConsentType) => {
    if (consentData) {
      const updatedConsents = {
        ...consentData.consents,
        [consentType]: false,
      } as ConsentStatus

      const updatedData = {
        ...consentData,
        consents: updatedConsents,
        consentTimestamp: new Date().toISOString(),
      }

      localStorage.setItem(
        'lgpd-healthcare-consent',
        JSON.stringify(updatedData),
      )
      setConsentData(updatedData)
    }
  }

  const hasConsentFor = (consentType: ConsentType) => {
    return consentData?.consents[consentType] || false
  }

  return {
    hasConsent,
    consentData,
    withdrawConsent,
    hasConsentFor,
  }
}
