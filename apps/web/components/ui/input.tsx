import * as React from 'react'
import { forwardRef, useEffect, useRef, useState, } from 'react'
import { cn, } from '../../lib/utils'

interface HealthcareInputProps {
  /** Healthcare-specific input types for Brazilian medical data */
  healthcareType?:
    | 'cpf'
    | 'rg'
    | 'medical-record'
    | 'cns' // Cartão Nacional de Saúde
    | 'crm' // Conselho Regional de Medicina
    | 'phone-brazil'
    | 'cep'
    | 'medical-date'
    | 'patient-name'
    | 'medical-notes'

  /** Medical urgency level affects styling and validation */
  urgency?: 'low' | 'medium' | 'high' | 'critical'

  /** LGPD compliance features */
  lgpdSensitive?: boolean
  lgpdConsentRequired?: boolean

  /** Emergency mode compatibility */
  emergencyMode?: boolean

  /** Enhanced validation states for medical data */
  validationState?: 'valid' | 'invalid' | 'warning' | 'critical'

  /** Medical form context */
  medicalContext?: 'patient-registration' | 'consultation' | 'emergency' | 'prescription'

  /** Auto-formatting for Brazilian standards */
  autoFormat?: boolean

  /** Screen reader enhancements for medical terminology */
  medicalDescription?: string
}

// Brazilian format masks for healthcare data
const formatMasks = {
  cpf: (value: string,) => {
    return value
      .replace(/\D/g, '',)
      .replace(/(\d{3})(\d)/, '$1.$2',)
      .replace(/(\d{3})(\d)/, '$1.$2',)
      .replace(/(\d{3})(\d{1,2})/, '$1-$2',)
      .replace(/(-\d{2})\d+?$/, '$1',)
  },
  rg: (value: string,) => {
    return value
      .replace(/\D/g, '',)
      .replace(/(\d{2})(\d)/, '$1.$2',)
      .replace(/(\d{3})(\d)/, '$1.$2',)
      .replace(/(\d{3})(\d{1,2})/, '$1-$2',)
      .replace(/(-\d{2})\d+?$/, '$1',)
  },
  cns: (value: string,) => {
    return value
      .replace(/\D/g, '',)
      .replace(/(\d{3})(\d)/, '$1 $2',)
      .replace(/(\d{4})(\d)/, '$1 $2',)
      .replace(/(\d{4})(\d{1,4})/, '$1 $2',)
      .replace(/( \d{4})\d+?$/, '$1',)
  },
  'phone-brazil': (value: string,) => {
    return value
      .replace(/\D/g, '',)
      .replace(/(\d{2})(\d)/, '($1) $2',)
      .replace(/(\d{4,5})(\d{4})/, '$1-$2',)
      .replace(/(-\d{4})\d+?$/, '$1',)
  },
  cep: (value: string,) => {
    return value
      .replace(/\D/g, '',)
      .replace(/(\d{5})(\d)/, '$1-$2',)
      .replace(/(-\d{3})\d+?$/, '$1',)
  },
}

const Input = forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & HealthcareInputProps
>(({
  className,
  type,
  healthcareType,
  urgency,
  lgpdSensitive,
  lgpdConsentRequired,
  emergencyMode,
  validationState,
  medicalContext,
  autoFormat = true,
  medicalDescription,
  onChange,
  value,
  ...props
}, ref,) => {
  const [internalValue, setInternalValue,] = useState(value || '',)
  const [isFocused, setIsFocused,] = useState(false,)
  const inputRef = useRef<HTMLInputElement>(null,)

  // Combine refs
  const combinedRef = (node: HTMLInputElement,) => {
    if (inputRef) {
      inputRef.current = node
    }
    if (typeof ref === 'function') {
      ref(node,)
    } else if (ref) {
      ref.current = node
    }
  }

  // Auto-format based on healthcare type
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>,) => {
    let formattedValue = e.target.value

    if (autoFormat && healthcareType && formatMasks[healthcareType]) {
      formattedValue = formatMasks[healthcareType](e.target.value,)
    }

    // Patient name formatting (title case for Portuguese names)
    if (healthcareType === 'patient-name' && autoFormat) {
      formattedValue = formattedValue
        .toLowerCase()
        .split(' ',)
        .map(word =>
          word.length > 2
            ? word.charAt(0,).toUpperCase() + word.slice(1,)
            : word
        )
        .join(' ',)
    }

    setInternalValue(formattedValue,)

    // Create synthetic event with formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue,
      },
    }

    if (onChange) {
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>,)
    }
  }

  // Determine input type based on healthcare type
  const getInputType = () => {
    if (type) return type

    switch (healthcareType) {
      case 'medical-date':
        return 'date'
      case 'phone-brazil':
        return 'tel'
      case 'medical-notes':
        return 'text'
      default:
        return 'text'
    }
  }

  // Get appropriate inputMode for mobile keyboards
  const getInputMode = (): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
    switch (healthcareType) {
      case 'cpf':
      case 'rg':
      case 'cns':
      case 'medical-record':
      case 'phone-brazil':
      case 'cep':
        return 'numeric'
      case 'patient-name':
        return 'text'
      default:
        return undefined
    }
  }

  // Get appropriate pattern for validation
  const getPattern = () => {
    switch (healthcareType) {
      case 'cpf':
        return '[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}'
      case 'phone-brazil':
        return '\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}'
      case 'cep':
        return '[0-9]{5}-[0-9]{3}'
      case 'cns':
        return '[0-9]{3} [0-9]{4} [0-9]{4} [0-9]{4}'
      default:
        return
    }
  }

  // Enhanced placeholder text for healthcare contexts
  const getPlaceholder = () => {
    if (props.placeholder) return props.placeholder

    switch (healthcareType) {
      case 'cpf':
        return '000.000.000-00'
      case 'rg':
        return '00.000.000-0'
      case 'cns':
        return '000 0000 0000 0000'
      case 'crm':
        return 'CRM/UF 000000'
      case 'phone-brazil':
        return '(00) 00000-0000'
      case 'cep':
        return '00000-000'
      case 'medical-record':
        return 'Número do prontuário'
      case 'patient-name':
        return 'Nome completo do paciente'
      case 'medical-notes':
        return 'Observações médicas...'
      default:
        return
    }
  }

  // LGPD consent validation
  useEffect(() => {
    if (lgpdConsentRequired && value && !lgpdSensitive) {
      console.warn('LGPD: Consent required for sensitive medical data',)
    }
  }, [lgpdConsentRequired, lgpdSensitive, value,],)

  return (
    <div className="relative">
      <input
        ref={combinedRef}
        className={cn(
          // Base styling
          'flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          // Background and border based on context
          medicalContext === 'emergency'
            ? 'bg-background border-status-urgent/50'
            : 'bg-transparent border-input dark:bg-input/30',
          // Focus states with healthcare enhancements
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          emergencyMode
            && 'focus-visible:ring-status-critical focus-visible:border-status-critical',
          // Validation states
          validationState === 'invalid' && 'border-destructive aria-invalid:ring-destructive/20',
          validationState === 'valid' && 'border-success',
          validationState === 'warning' && 'border-warning',
          validationState === 'critical' && 'border-status-critical ring-2 ring-status-critical/20',
          // Urgency-based styling
          urgency === 'high' && 'border-warning/60 bg-warning/5',
          urgency === 'critical' && 'border-status-critical/60 bg-status-critical/5 font-medium',
          // LGPD sensitive data styling
          lgpdSensitive && 'border-lgpd-compliant/40 bg-lgpd-compliant/5',
          // Emergency mode styling
          emergencyMode && 'min-h-[44px] text-base font-medium border-2',
          // High contrast mode
          'high-contrast:border-2 high-contrast:border-current',
          // File input styling
          'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
          className,
        )}
        data-slot="input"
        data-healthcare-type={healthcareType}
        data-urgency={urgency}
        data-medical-context={medicalContext}
        data-lgpd-sensitive={lgpdSensitive}
        data-emergency-mode={emergencyMode}
        type={getInputType()}
        inputMode={getInputMode()}
        pattern={getPattern()}
        placeholder={getPlaceholder()}
        value={internalValue}
        onChange={handleInputChange}
        onFocus={(e,) => {
          setIsFocused(true,)
          props.onFocus?.(e,)
        }}
        onBlur={(e,) => {
          setIsFocused(false,)
          props.onBlur?.(e,)
        }}
        // Enhanced accessibility for medical contexts
        aria-describedby={medicalDescription
          ? `${props.id || 'input'}-medical-description`
          : props['aria-describedby']}
        aria-invalid={validationState === 'invalid' || validationState === 'critical'}
        aria-required={lgpdConsentRequired || props.required}
        {...props}
      />

      {/* Medical description for screen readers */}
      {medicalDescription && (
        <div
          id={`${props.id || 'input'}-medical-description`}
          className="sr-only"
        >
          {medicalDescription}
        </div>
      )}

      {/* LGPD consent indicator */}
      {lgpdSensitive && (
        <div
          className="absolute -top-1 -right-1 w-2 h-2 bg-lgpd-compliant rounded-full"
          title="Dado sensível protegido pela LGPD"
          aria-label="Dado médico sensível"
        />
      )}

      {/* Critical validation indicator */}
      {validationState === 'critical' && (
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-status-critical rounded-full animate-pulse"
          title="Atenção: Validação crítica necessária"
          aria-label="Validação crítica"
        />
      )}
    </div>
  )
},)

Input.displayName = 'Input'

export { type HealthcareInputProps, Input, }
