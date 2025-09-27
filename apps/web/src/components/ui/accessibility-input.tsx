import * as React from 'react'

import { cn } from '@/lib/utils.js'

export interface AccessibilityInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  ariaLabel?: string
  healthcareContext?: 'medical' | 'personal' | 'emergency' | 'administrative'
  validationState?: 'none' | 'valid' | 'invalid' | 'warning'
}

export interface BrazilianHealthcareInputProps extends AccessibilityInputProps {
  // Brazilian format validation
  brazilianFormat?: 'cpf' | 'phone' | 'cep' | 'cnpj' | 'date'
  
  // Healthcare-specific validation
  healthcareValidation?: {
    minAge?: number
    maxAge?: number
    bloodType?: boolean
    emergencyContact?: boolean
  }
  
  // LGPD compliance
  lgpdSensitive?: boolean
  dataPurpose?: string
  
  // Accessibility enhancements
  screenReaderInstructions?: string
  voiceOverSupport?: boolean
}

const AccessibilityInput = React.forwardRef<HTMLInputElement, AccessibilityInputProps>(
  ({ 
    className, 
    type, 
    label,
    error,
    helperText,
    required = false,
    ariaLabel,
    healthcareContext,
    validationState = 'none',
    id,
    brazilianFormat,
    healthcareValidation,
    lgpdSensitive = false,
    dataPurpose,
    screenReaderInstructions,
    voiceOverSupport = false,
    ...props 
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${React.useId()}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined
    const instructionsId = screenReaderInstructions ? `${inputId}-instructions` : undefined

    // Healthcare-specific validation patterns
    const healthcarePatterns = {
      medical: {
        pattern: healthcareContext === 'medical' ? '[A-Za-z0-9\\s\\-\\.,]{1,100}' : undefined,
        inputMode: healthcareContext === 'medical' ? 'text' : undefined,
      },
      personal: {
        pattern: healthcareContext === 'personal' ? '[A-Za-zÀ-ÿ\\s]{1,100}' : undefined,
        inputMode: healthcareContext === 'personal' ? 'text' : undefined,
      },
      emergency: {
        inputMode: healthcareContext === 'emergency' ? 'tel' : undefined,
      },
    }

    // Brazilian format patterns
    const brazilianPatterns = {
      cpf: {
        pattern: '^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$',
        placeholder: '000.000.000-00',
        maxLength: 14,
        inputMode: 'numeric' as const,
      },
      phone: {
        pattern: '^\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}$',
        placeholder: '(11) 99999-9999',
        maxLength: 15,
        inputMode: 'tel' as const,
      },
      cep: {
        pattern: '^[0-9]{5}-[0-9]{3}$',
        placeholder: '00000-000',
        maxLength: 9,
        inputMode: 'numeric' as const,
      },
      cnpj: {
        pattern: '^[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}/[0-9]{4}-[0-9]{2}$',
        placeholder: '00.000.000/0001-00',
        maxLength: 18,
        inputMode: 'numeric' as const,
      },
      date: {
        pattern: '^[0-9]{2}/[0-9]{2}/[0-9]{4}$',
        placeholder: 'DD/MM/AAAA',
        maxLength: 10,
        inputMode: 'numeric' as const,
      },
    }

    const healthcareProps = healthcareContext ? healthcarePatterns[healthcareContext] : {}
    const brazilianProps = brazilianFormat ? brazilianPatterns[brazilianFormat] : {}

    // Format input value for Brazilian formats
    const formatInputValue = (value: string, format: string): string => {
      if (!format || !value) return value

      const cleanValue = value.replace(/\D/g, '')
      
      switch (format) {
        case 'cpf':
          if (cleanValue.length <= 3) return cleanValue
          if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`
          if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`
          return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`
        
        case 'phone':
          if (cleanValue.length <= 2) return cleanValue
          if (cleanValue.length <= 6) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`
          return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`
        
        case 'cep':
          if (cleanValue.length <= 5) return cleanValue
          return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`
        
        case 'cnpj':
          if (cleanValue.length <= 2) return cleanValue
          if (cleanValue.length <= 5) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2)}`
          if (cleanValue.length <= 8) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5)}`
          if (cleanValue.length <= 12) return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8)}`
          return `${cleanValue.slice(0, 2)}.${cleanValue.slice(2, 5)}.${cleanValue.slice(5, 8)}/${cleanValue.slice(8, 12)}-${cleanValue.slice(12, 14)}`
        
        case 'date':
          if (cleanValue.length <= 2) return cleanValue
          if (cleanValue.length <= 4) return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`
          return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`
        
        default:
          return value
      }
    }

    // Handle input change with formatting
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { onChange } = props
      if (onChange && brazilianFormat) {
        const formattedValue = formatInputValue(e.target.value, brazilianFormat)
        e.target.value = formattedValue
      }
      onChange?.(e)
    }

    // Validation state styling
    const validationStyles = {
      none: 'border-input',
      valid: 'border-green-500 focus:border-green-600',
      invalid: 'border-red-500 focus:border-red-600',
      warning: 'border-yellow-500 focus:border-yellow-600',
    }

    // LGPD compliance styling
    const lgpdStyles = lgpdSensitive ? 'border-l-4 border-purple-500' : ''

    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500",
              lgpdSensitive && "text-purple-700 font-semibold"
            )}
          >
            {label}
            {lgpdSensitive && (
              <span className="ml-1 text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                LGPD
              </span>
            )}
          </label>
        )}
        
        {screenReaderInstructions && (
          <div 
            id={instructionsId}
            className="sr-only"
          >
            {screenReaderInstructions}
          </div>
        )}
        
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            validationStyles[validationState],
            lgpdStyles,
            // Mobile optimization for healthcare
            'touch-action-manipulation',
            // Healthcare-specific requirements
            healthcareContext === 'emergency' && 'font-semibold',
            // VoiceOver support
            voiceOverSupport && 'speak-punctuation',
            className
          )}
          ref={ref}
          aria-label={ariaLabel || label}
          aria-invalid={validationState === 'invalid'}
          aria-describedby={cn(errorId, helperId, instructionsId)}
          aria-required={required}
          placeholder={brazilianProps.placeholder || props.placeholder}
          maxLength={brazilianProps.maxLength || props.maxLength}
          inputMode={brazilianProps.inputMode || healthcareProps.inputMode || props.inputMode}
          pattern={brazilianProps.pattern || healthcareProps.pattern || props.pattern}
          onChange={handleInputChange}
          {...healthcareProps}
          {...brazilianProps}
          {...props}
        />
        
        {error && (
          <div 
            id={errorId}
            className="text-sm text-red-600 font-medium flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center font-bold">
              !
            </span>
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div 
            id={helperId}
            className={cn(
              "text-sm text-muted-foreground",
              lgpdSensitive && "text-purple-600 italic"
            )}
          >
            {helperText}
            {lgpdSensitive && (
              <span className="ml-1 text-xs text-purple-500">
                (Dados sensíveis LGPD)
              </span>
            )}
          </div>
        )}
      </div>
    )
  },
)
AccessibilityInput.displayName = 'AccessibilityInput'

export { AccessibilityInput }