import * as React from 'react'

import { cn } from '@/lib/utils'

export interface AccessibilityInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  ariaLabel?: string
  healthcareContext?: 'medical' | 'personal' | 'emergency' | 'administrative'
  validationState?: 'none' | 'valid' | 'invalid'
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
    ...props 
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${React.useId()}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined

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

    const healthcareProps = healthcareContext ? healthcarePatterns[healthcareContext] : {}

    // Validation state styling
    const validationStyles = {
      none: 'border-input',
      valid: 'border-green-500 focus:border-green-600',
      invalid: 'border-red-500 focus:border-red-600',
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </label>
        )}
        
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            validationStyles[validationState],
            // Mobile optimization for healthcare
            'touch-action-manipulation',
            // Healthcare-specific requirements
            healthcareContext === 'emergency' && 'font-semibold',
            className
          )}
          ref={ref}
          aria-label={ariaLabel || label}
          aria-invalid={validationState === 'invalid'}
          aria-describedby={cn(errorId, helperId)}
          aria-required={required}
          {...healthcareProps}
          {...props}
        />
        
        {error && (
          <div 
            id={errorId}
            className="text-sm text-red-600 font-medium"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div 
            id={helperId}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </div>
        )}
      </div>
    )
  },
)
AccessibilityInput.displayName = 'AccessibilityInput'

export { AccessibilityInput }