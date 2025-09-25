import * as React from 'react'
import { useTranslation } from '@/lib/i18n/use-translation'
import { cn } from '@/lib/utils'

export interface HealthcareLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'skeleton' | 'progress' | 'pulse'
  text?: string
  className?: string
  progress?: number
  accessible?: boolean
}

export const HealthcareLoading: React.FC<HealthcareLoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  progress,
  accessible = true,
}) => {
  const { t } = useTranslation()

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  const loadingText = text || t('accessibility.loading')

  const commonProps = {
    className: cn(
      'inline-flex items-center justify-center',
      accessible && 'sr-only',
      className
    ),
    role: accessible ? 'status' : undefined,
    'aria-live': accessible ? 'polite' : undefined,
    'aria-busy': accessible ? 'true' : undefined,
  }

  switch (variant) {
    case 'spinner':
      return (
        <div {...commonProps}>
          <svg
            className={cn(
              'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
              sizeClasses[size]
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            {accessible && (
              <title className="sr-only">{loadingText}</title>
            )}
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {text && (
            <span className={cn('ml-2', textClasses[size], !accessible && 'block')}>
              {loadingText}
            </span>
          )}
        </div>
      )

    case 'skeleton':
      return (
        <div {...commonProps}>
          <div
            className={cn(
              'animate-pulse bg-gray-300 rounded',
              size === 'sm' && 'h-4 w-16',
              size === 'md' && 'h-6 w-24',
              size === 'lg' && 'h-8 w-32',
              size === 'xl' && 'h-12 w-48'
            )}
          >
            {accessible && <span className="sr-only">{loadingText}</span>}
          </div>
        </div>
      )

    case 'progress':
      return (
        <div {...commonProps}>
          <div
            className={cn(
              'w-full bg-gray-200 rounded-full h-2.5',
              size === 'sm' && 'h-1',
              size === 'lg' && 'h-3',
              size === 'xl' && 'h-4'
            )}
            role="progressbar"
            aria-valuenow={progress || 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                'bg-blue-600 h-2.5 rounded-full transition-all duration-300',
                size === 'sm' && 'h-1',
                size === 'lg' && 'h-3',
                size === 'xl' && 'h-4'
              )}
              style={{ width: `${progress || 0}%` }}
            >
              {accessible && (
                <span className="sr-only">
                  {loadingText} - {progress || 0}%
                </span>
              )}
            </div>
          </div>
          {text && (
            <span className={cn('ml-2', textClasses[size], !accessible && 'block')}>
              {loadingText} ({progress || 0}%)
            </span>
          )}
        </div>
      )

    case 'pulse':
      return (
        <div {...commonProps}>
          <div
            className={cn(
              'animate-pulse rounded-full bg-blue-600',
              sizeClasses[size]
            )}
          >
            {accessible && <span className="sr-only">{loadingText}</span>}
          </div>
          {text && (
            <span className={cn('ml-2', textClasses[size], !accessible && 'block')}>
              {loadingText}
            </span>
          )}
        </div>
      )

    default:
      return null
  }
}

// Healthcare-specific loading overlay for forms
export const HealthcareFormLoading: React.FC<{
  message?: string
  submessage?: string
  className?: string
}> = ({ message, submessage, className }) => {
  const { t } = useTranslation()

  return (
    <div className={cn('fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50', className)}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
        <HealthcareLoading size="lg" variant="spinner" text={message || t('loading.processing')} />
        {submessage && (
          <p className="text-sm text-gray-600 mt-2">
            {submessage}
          </p>
        )}
      </div>
    </div>
  )
}

// Page-level loading component
export const HealthcarePageLoading: React.FC<{
  message?: string
  className?: string
}> = ({ message, className }) => {
  const { t } = useTranslation()

  return (
    <div className={cn('min-h-screen flex items-center justify-center', className)}>
      <div className="text-center">
        <HealthcareLoading size="xl" variant="spinner" />
        <p className="mt-4 text-lg text-gray-600">
          {message || t('loading.loadingData')}
        </p>
      </div>
    </div>
  )
}

// Skeleton loader for healthcare cards
export const HealthcareCardSkeleton: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className }) => {
  return (
    <div className={cn('bg-white rounded-lg p-4 space-y-3', className)}>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3 bg-gray-300 rounded',
              i === lines - 1 ? 'w-1/2' : 'w-full'
            )}
          ></div>
        ))}
      </div>
    </div>
  )
}

// Table skeleton loader
export const HealthcareTableSkeleton: React.FC<{
  rows?: number
  columns?: number
  className?: string
}> = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="animate-pulse flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                'h-4 bg-gray-300 rounded flex-1',
                colIndex === 0 && 'w-1/4',
                colIndex === columns - 1 && 'w-1/6'
              )}
            ></div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Healthcare-specific loading states
export const HealthcareLoadingStates = {
  // Patient registration
  patientRegistration: {
    message: 'Registrando paciente...',
    submessage: 'Isso pode levar alguns segundos',
  },
  
  // Appointment scheduling
  appointmentScheduling: {
    message: 'Agendando consulta...',
    submessage: 'Verificando disponibilidade',
  },
  
  // Medical records
  medicalRecordsLoading: {
    message: 'Carregando prontuário...',
    submessage: 'Buscando histórico médico',
  },
  
  // Data processing
  dataProcessing: {
    message: 'Processando dados...',
    submessage: 'Por favor, aguarde',
  },
  
  // Uploading documents
  uploadingDocuments: {
    message: 'Enviando documentos...',
    submessage: 'Processando OCR e validando',
  },
  
  // Searching
  searching: {
    message: 'Buscando...',
    submessage: 'Analisando resultados',
  },
}

// Hook for managing loading states
export const useHealthcareLoading = () => {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({})
  const [loadingMessages, setLoadingMessages] = React.useState<Record<string, string>>({})

  const setLoading = React.useCallback((key: string, isLoading: boolean, message?: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }))
    if (message) {
      setLoadingMessages(prev => ({ ...prev, [key]: message }))
    }
  }, [])

  const isLoading = React.useCallback((key?: string) => {
    if (key) {
      return loadingStates[key] || false
    }
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  const getLoadingMessage = React.useCallback((key: string) => {
    return loadingMessages[key] || 'Carregando...'
  }, [loadingMessages])

  return {
    setLoading,
    isLoading,
    getLoadingMessage,
    loadingStates,
  }
}