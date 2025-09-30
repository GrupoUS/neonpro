import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Eye, EyeOff, Shield, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AccessibilityInput } from '@/components/ui/accessibility-input'

export interface DataSensitivityLevel {
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  label: string
  description: string
  color: string
  requiresConsent: boolean
  retentionPeriod?: number // days
}

export const dataSensitivityLevels: Record<string, DataSensitivityLevel> = {
  public: {
    level: 'public',
    label: 'Dados Públicos',
    description: 'Informações não sensíveis disponíveis publicamente',
    color: 'bg-green-100 text-green-800 border-green-300',
    requiresConsent: false,
  },
  internal: {
    level: 'internal',
    label: 'Dados Internos',
    description: 'Informações de uso interno da clínica',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    requiresConsent: false,
  },
  confidential: {
    level: 'confidential',
    label: 'Dados Confidenciais',
    description: 'Informações de pacientes que requerem proteção',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    requiresConsent: true,
    retentionPeriod: 3650, // 10 years
  },
  restricted: {
    level: 'restricted',
    label: 'Dados Restritos',
    description: 'Informações médicas altamente sensíveis',
    color: 'bg-red-100 text-red-800 border-red-300',
    requiresConsent: true,
    retentionPeriod: 5475, // 15 years
  },
}

export interface DataMaskingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  // Data masking configuration
  sensitivityLevel: keyof typeof dataSensitivityLevels
  maskType?: 'full' | 'partial' | 'email' | 'phone' | 'cpf' | 'custom'
  maskPattern?: string
  unmaskOnFocus?: boolean
  showToggle?: boolean
  // LGPD compliance
  requiresConsent?: boolean
  consentGiven?: boolean
  onConsentChange?: (consent: boolean) => void
  // Data retention
  retentionWarning?: boolean
  retentionDate?: Date
  onRetentionWarning?: () => void
  // Audit logging
  logAccess?: boolean
  accessReason?: string
  accessedBy?: string
  // Display options
  showSensitivity?: boolean
  showRetention?: boolean
  // Accessibility
  ariaDescribedBy?: string
}

interface MaskedValueState {
  masked: string
  unmasked: string
  isMasked: boolean
  lastUnmasked: Date | null
  accessCount: number
}

export const DataMaskingInput = forwardRef<HTMLInputElement, DataMaskingInputProps>(
  ({
    sensitivityLevel,
    maskType = 'full',
    maskPattern,
    unmaskOnFocus = true,
    showToggle = true,
    requiresConsent,
    consentGiven = false,
    onConsentChange,
    retentionWarning = false,
    retentionDate,
    onRetentionWarning,
    logAccess = true,
    accessReason,
    accessedBy,
    showSensitivity = true,
    showRetention = true,
    className,
    id,
    value,
    onChange,
    onFocus,
    onBlur,
    ariaDescribedBy,
    ...props
  }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null)
    const [state, setState] = useState<MaskedValueState>({
      masked: '',
      unmasked: '',
      isMasked: true,
      lastUnmasked: null,
      accessCount: 0,
    })
    const [showConsentDialog, setShowConsentDialog] = useState(false)
    const [showRetentionDialog, setShowRetentionDialog] = useState(false)

    // Merge refs
    useImperativeHandle(ref, () => internalRef.current as HTMLInputElement)

    // Masking functions
    const maskValue = (value: string): string => {
      if (!value) return ''

      switch (maskType) {
        case 'email':
          return value.replace(/(.{2}).*(@.*)/, '$1***$2')
        
        case 'phone':
          return value.replace(/(\d{2})\s(\d{4,5})-(\d{4})/, '$1 ****-$3')
        
        case 'cpf':
          return value.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '$1.***.***-$4')
        
        case 'partial':
          return value.slice(0, 2) + '*'.repeat(Math.max(0, value.length - 4)) + value.slice(-2)
        
        case 'custom':
          if (maskPattern) {
            return maskPattern.replace(/./g, (char, index) => {
              if (char === '*') return '*'
              if (index < value.length) return value[index]
              return ''
            })
          }
          return '*'.repeat(value.length)
        
        case 'full':
        default:
          return '*'.repeat(value.length)
      }
    }

    const unmaskValue = (): void => {
      setState(prev => ({
        ...prev,
        isMasked: false,
        lastUnmasked: new Date(),
        accessCount: prev.accessCount + 1,
      }))

      // Log access for audit trail
      if (logAccess) {
        logDataAccess('unmask', {
          field: props.name || 'unknown',
          sensitivityLevel,
          accessReason: accessReason || 'User requested unmask',
          accessedBy: accessedBy || 'unknown',
        })
      }
    }

    const maskValueAgain = (): void => {
      setState(prev => ({
        ...prev,
        isMasked: true,
      }))
    }

    // Consent management
    const handleConsentRequest = (): void => {
      setShowConsentDialog(true)
    }

    const handleConsentGranted = (): void => {
      onConsentChange?.(true)
      setShowConsentDialog(false)
      unmaskValue()
      
      logDataAccess('consent_granted', {
        field: props.name || 'unknown',
        sensitivityLevel,
        accessReason: 'User granted consent',
        accessedBy: accessedBy || 'unknown',
      })
    }

    // Retention warning
    const handleRetentionWarning = (): void => {
      setShowRetentionDialog(true)
      onRetentionWarning?.()
    }

    // Focus handling
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
      // Check consent requirement
      if (requiresConsent && !consentGiven) {
        handleConsentRequest()
        e.preventDefault()
        return
      }

      // Check retention warning
      if (retentionWarning && retentionDate && new Date() > retentionDate) {
        handleRetentionWarning()
        return
      }

      // Unmask on focus if enabled
      if (unmaskOnFocus && state.isMasked) {
        unmaskValue()
      }

      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
      if (unmaskOnFocus && !state.isMasked) {
        maskValueAgain()
      }
      onBlur?.(e)
    }

    // Toggle masking
    const toggleMasking = (): void => {
      if (state.isMasked) {
        if (requiresConsent && !consentGiven) {
          handleConsentRequest()
          return
        }
        unmaskValue()
      } else {
        maskValueAgain()
      }
    }

    // Audit logging
    const logDataAccess = (action: string, details: Record<string, unknown>): void => {
      if (!logAccess) return

      const auditLog = {
        timestamp: new Date().toISOString(),
        action,
        field: props.name || 'unknown',
        sensitivityLevel,
        details: {
          ...details,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }

      // In a real implementation, this would be sent to a logging service
      console.log('LGPD Audit Log:', auditLog)

      // Dispatch event for external handlers
      window.dispatchEvent(new CustomEvent('lgpd-audit-log', { detail: auditLog }))
    }

    // Update masked value when prop value changes
    useEffect(() => {
      if (value !== undefined) {
        const stringValue = String(value)
        setState(prev => ({
          ...prev,
          masked: maskValue(stringValue),
          unmasked: stringValue,
        }))
      }
    }, [value, maskType, maskPattern])

    // Check retention status
    useEffect(() => {
      if (retentionDate && new Date() > retentionDate) {
        logDataAccess('retention_expired', {
          field: props.name || 'unknown',
          sensitivityLevel,
          retentionDate: retentionDate?.toISOString(),
        })
      }
    }, [retentionDate])

    const sensitivity = dataSensitivityLevels[sensitivityLevel]
    const currentValue = state.isMasked ? state.masked : state.unmasked
    const inputId = id || `masked-input-${React.useId()}`
    const consentId = `${inputId}-consent`
    const retentionId = `${inputId}-retention`

    return (
      <div className={cn('space-y-2', className)}>
        {/* Sensitivity indicator */}
        {showSensitivity && (
          <div className="flex items-center gap-2">
            <div className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border',
              sensitivity.color
            )}>
              <Shield className="h-3 w-3" />
              <span>{sensitivity.label}</span>
            </div>
            {sensitivity.requiresConsent && !consentGiven && (
              <div className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Consentimento necessário</span>
              </div>
            )}
          </div>
        )}

        {/* Retention warning */}
        {showRetention && retentionDate && (
          <div className={cn(
            'text-xs flex items-center gap-1',
            retentionWarning && new Date() > retentionDate
              ? 'text-red-600 font-medium'
              : 'text-gray-600'
          )}>
            <Info className="h-3 w-3" />
            <span>
              Retenção até {retentionDate.toLocaleDateString('pt-BR')}
              {retentionWarning && new Date() > retentionDate && ' (expirado)'}
            </span>
          </div>
        )}

        {/* Input field */}
        <div className="relative">
          <AccessibilityInput
            ref={internalRef}
            type="text"
            id={inputId}
            value={currentValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            sensitive={sensitivity.requiresConsent}
            healthcare={true}
            dataMasking={true}
            className={cn(
              'pr-10',
              sensitivity.requiresConsent && !consentGiven && 'bg-amber-50 border-amber-300',
              retentionWarning && new Date() > retentionDate && 'bg-red-50 border-red-300'
            )}
            aria-describedby={cn(
              ariaDescribedBy,
              requiresConsent && !consentGiven && consentId,
              retentionWarning && retentionId
            )}
            {...props}
          />

          {/* Toggle button */}
          {showToggle && (
            <button
              type="button"
              onClick={toggleMasking}
              className={cn(
                'absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                sensitivity.requiresConsent && !consentGiven && 'cursor-not-allowed opacity-50'
              )}
              disabled={sensitivity.requiresConsent && !consentGiven}
              aria-label={state.isMasked ? 'Mostrar dados' : 'Ocultar dados'}
              aria-pressed={!state.isMasked}
            >
              {state.isMasked ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* ARIA descriptions */}
        {requiresConsent && !consentGiven && (
          <div id={consentId} className="text-xs text-amber-600">
            Campo requer consentimento LGPD para visualização
          </div>
        )}

        {retentionWarning && new Date() > retentionDate && (
          <div id={retentionId} className="text-xs text-red-600">
            Período de retenção expirado - acesso requer justificativa
          </div>
        )}

        {/* Consent dialog */}
        {showConsentDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Consentimento LGPD</h3>
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600">
                  Este campo contém {sensitivity.label.toLowerCase()}. De acordo com a Lei Geral de Proteção de Dados (LGPD), precisamos do seu consentimento para acessar estas informações.
                </p>
                <div className={cn(
                  'p-3 rounded-md text-sm',
                  sensitivity.color
                )}>
                  <strong>{sensitivity.label}:</strong> {sensitivity.description}
                </div>
                <p className="text-xs text-gray-500">
                  Este acesso será registrado para fins de auditoria.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConsentDialog(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConsentGranted}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Concordar e Acessar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Retention warning dialog */}
        {showRetentionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Aviso de Retenção
              </h3>
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600">
                  O período de retenção para estes dados expirou em {retentionDate?.toLocaleDateString('pt-BR')}.
                </p>
                <p className="text-sm text-gray-600">
                  De acordo com a LGPD, o acesso a dados expirados requer justificativa documentada.
                </p>
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                  <strong>Motivo do acesso:</strong> {accessReason || 'Não especificado'}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRetentionDialog(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowRetentionDialog(false)
                    unmaskValue()
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Continuar com Acesso
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DataMaskingInput.displayName = 'DataMaskingInput'

// Hook for managing data masking state
export const useDataMasking = () => {
  const [maskedFields, setMaskedFields] = useState<Set<string>>(new Set())

  const maskField = (fieldId: string): void => {
    setMaskedFields(prev => new Set(prev).add(fieldId))
  }

  const unmaskField = (fieldId: string): void => {
    setMaskedFields(prev => {
      const newSet = new Set(prev)
      newSet.delete(fieldId)
      return newSet
    })
  }

  const isFieldMasked = (fieldId: string): boolean => {
    return maskedFields.has(fieldId)
  }

  const getMaskedFields = (): string[] => {
    return Array.from(maskedFields)
  }

  return {
    maskField,
    unmaskField,
    isFieldMasked,
    getMaskedFields,
  }
}

export type { DataMaskingInputProps, DataSensitivityLevel }
export { dataSensitivityLevels }
export default DataMaskingInput