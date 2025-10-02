import * as React from 'react'

import { cn } from '@/lib/utils.ts'

export interface HealthcareFormGroupProps {
  children: React.ReactNode
  label: string
  required?: boolean
  error?: string
  helperText?: string
  healthcareContext?: 'patient' | 'medical' | 'administrative' | 'emergency'
  className?: string
  ariaLabel?: string
}

const HealthcareFormGroup: React.FC<HealthcareFormGroupProps> = ({
  children,
  label,
  required = false,
  error,
  helperText,
  healthcareContext = 'patient',
  className,
  ariaLabel,
}) => {
  const groupId = React.useId()
  const errorId = error ? `${groupId}-error` : undefined
  const helperId = helperText ? `${groupId}-helper` : undefined

  // Healthcare-specific context styling
  const contextStyles = {
    patient: 'border-l-4 border-blue-500 bg-blue-50/50',
    medical: 'border-l-4 border-red-500 bg-red-50/50',
    administrative: 'border-l-4 border-gray-500 bg-gray-50/50',
    emergency: 'border-l-4 border-orange-500 bg-orange-50/50',
  }

  return (
    <div 
      className={cn(
        'space-y-2 p-4 rounded-lg border',
        contextStyles[healthcareContext],
        className
      )}
      role="group"
      aria-labelledby={`${groupId}-label`}
      aria-describedby={cn(errorId, helperId)}
    >
      <div className="flex items-center justify-between">
        <label
          id={`${groupId}-label`}
          className={cn(
            'text-sm font-semibold',
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
          )}
        >
          {label}
        </label>
        
        {/* Healthcare context indicator */}
        <span className="text-xs px-2 py-1 rounded-full bg-white/80 text-gray-600">
          {healthcareContext === 'patient' && 'Paciente'}
          {healthcareContext === 'medical' && 'Médico'}
          {healthcareContext === 'administrative' && 'Administrativo'}
          {healthcareContext === 'emergency' && 'Emergência'}
        </span>
      </div>

      <div className="space-y-1">
        {children}
        
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
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </div>
        )}
      </div>
    </div>
  )
}

export { HealthcareFormGroup }