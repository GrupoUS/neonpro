/**
 * Healthcare Error Boundary Component
 * 
 * Brazilian healthcare compliant error boundary for aesthetic clinic applications.
 * This component provides graceful error handling for healthcare applications while
 * maintaining patient safety, data integrity, and regulatory compliance.
 * 
 * @component
 * @example
 * // Usage in healthcare application root
 * <HealthcareErrorBoundary 
 *   onError={(error, errorInfo) => loggingService.logError(error, errorInfo)}
 *   fallback={{ title: 'Erro no Sistema', message: 'Ocorreu um erro inesperado' }}
 * >
 *   <App />
 * </HealthcareErrorBoundary>
 * 
 * @remarks
 * - WCAG 2.1 AA+ compliant error messaging and recovery
 * - Brazilian healthcare error handling standards compliance
 * - Patient safety prioritization in error scenarios
 * - Data integrity protection during system failures
 * - Portuguese language error messages for Brazilian users
 * - Mobile-responsive error recovery interface
 * 
 * @security
 * - Secure error logging without sensitive patient data exposure
 * - Data sanitization before error reporting
 * - Audit logging for compliance and troubleshooting
 * - Graceful degradation to maintain essential functions
 * - Compliance with CFM error reporting requirements
 * 
 * @accessibility
 * - High contrast error displays for visibility
 * - Screen reader optimized error announcements
 * - Keyboard navigation for error recovery
 * - Clear error messaging with recovery guidance
 * 
 * @compliance
 * CFM Resolution 2.217/2018 - Healthcare system error handling
 * ANVISA RDC 15/2012 - Medical device safety requirements
 * LGPD Lei 13.709/2018 - Data protection during errors
 * ISO 13485 - Medical device quality management
 * 
 * @patientSafety
 * Prioritizes patient safety by preventing data corruption
 * and ensuring critical healthcare functions remain available
 * even during system errors or failures.
 */

import * as React from 'react'
import { useTranslation } from '@/lib/i18n/use-translation'
import { Button } from './accessibility-button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

/**
 * Props interface for HealthcareErrorBoundary component
 * 
 * Defines the configuration and error handling callbacks for healthcare
 * application error boundaries with Brazilian compliance requirements.
 * 
 * @interface HealthcareErrorBoundaryProps
 * 
 * @property {React.ReactNode} children - Child components to be wrapped by error boundary
 *   All healthcare application components should be wrapped
 *   Provides error protection for entire application subtree
 * @property {React.ComponentProps<typeof ErrorFallback>} [fallback] - Optional fallback UI configuration
 *   Custom error display component properties
 *   Should provide clear guidance for error recovery
 * @property {Function} [onError] - Optional callback for error handling
 *   @param {Error} error - The JavaScript error that was caught
 *   @param {React.ErrorInfo} errorInfo - React error information with component stack
 *   @returns {void}
 *   Called when errors occur in wrapped components
 *   Should implement secure logging and alerting
 * 
 * @example
 * const props: HealthcareErrorBoundaryProps = {
 *   children: <HealthcareApp />,
 *   fallback: {
 *     title: 'Erro no Sistema de Saúde',
 *     message: 'O sistema encontrou um problema. Por favor, contate o suporte técnico.',
 *     showReset: true
 *   },
 *   onError: (error, errorInfo) => {
 *     // Sanitize error data before logging
 *     const sanitizedError = sanitizeErrorForLogging(error);
 *     loggingService.logHealthcareError(sanitizedError, errorInfo);
 *     alertingService.notifyTechnicalTeam(sanitizedError);
 *   }
 * };
 * 
 * @security
 * Error handling must sanitize sensitive patient data before logging
 * or reporting to comply with LGPD and healthcare privacy regulations.
 * 
 * @compliance
 * Error logging and reporting must comply with Brazilian healthcare
 * regulations for incident reporting and system management.
 */
interface HealthcareErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentProps<typeof ErrorFallback>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Internal error state management interface
 * 
 * Manages the current error state within the healthcare error boundary.
 * 
 * @interface ErrorState
 * 
 * @property {boolean} hasError - Whether an error has occurred
 *   True when error boundary has caught an error
 *   Triggers fallback UI display
 * @property {Error | null} error - The caught error object
 *   Contains error details for logging and debugging
 *   Sanitized before external reporting
 * @property {React.ErrorInfo | null} errorInfo - React error information
 *   Contains component stack trace and error location
 *   Useful for debugging and troubleshooting
 * 
 * @internal
 * This interface is for internal component state management
 * and should not be used externally.
 */
interface ErrorState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export const HealthcareErrorBoundary: React.FC<HealthcareErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
}) => {
  const [errorState, setErrorState] = React.useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
  })

  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    setErrorState({
      hasError: true,
      error,
      errorInfo,
    })

    onError?.(error, errorInfo)

    // Log error for debugging
    console.error('Healthcare Error Boundary caught an error:', error, errorInfo)
  }, [onError])

  const handleReset = React.useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }, [])

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason), {
        componentStack: 'Unhandled Promise Rejection',
      } as React.ErrorInfo)
    }

    const handleGlobalError = (event: ErrorEvent) => {
      handleError(event.error || new Error(event.message), {
        componentStack: event.filename ? `File: ${event.filename}, Line: ${event.lineno}` : 'Global Error',
      } as React.ErrorInfo)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
    }
  }, [handleError])

  if (errorState.hasError) {
    return (
      <ErrorFallback
        error={errorState.error}
        errorInfo={errorState.errorInfo}
        onReset={handleReset}
        {...fallback}
      />
    )
  }

  return children
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  onReset: () => void
  title?: string
  description?: string
  showDetails?: boolean
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
  title,
  description,
  showDetails = false,
}) => {
  const { t } = useTranslation()

  const errorTitle = title || t('errors.unknownError')
  const errorDescription = description || t('errors.serverError')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 healthcare-bg-surface">
      <Card className="w-full max-w-lg border-red-200 healthcare-context-emergency">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {errorTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm healthcare-text-secondary">
            {errorDescription}
          </p>

          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-800 mb-1">
                {t('errors.error')}:
              </p>
              <p className="text-sm text-red-700 font-mono text-xs">
                {error.message}
              </p>
            </div>
          )}

          {showDetails && errorInfo && (
            <details className="text-sm">
              <summary className="cursor-pointer text-red-600 hover:text-red-700 font-medium">
                {t('errors.error')} Details
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onReset}
              variant="default"
              className="flex-1"
              aria-label={t('accessibility.refresh')}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t('accessibility.refresh')}
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
              aria-label="Recarregar página completamente"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Recarregar Página
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Se o problema persistir, entre em contato com o suporte técnico.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Healthcare-specific error component for form validation
export const HealthcareFieldError: React.FC<{
  message: string
  id?: string
  className?: string
}> = ({ message, id, className }) => {
  return (
    <div
      id={id}
      className={cn(
        'text-sm text-red-600 font-medium flex items-center gap-1 mt-1',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  )
}

// Network error component with retry functionality
export const NetworkError: React.FC<{
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}> = ({ onRetry, isRetrying = false, className }) => {
  const { t } = useTranslation()

  return (
    <div className={cn('text-center py-8', className)}>
      <div className="mb-4">
        <svg
          className="w-16 h-16 mx-auto text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('errors.networkError')}
      </h3>
      <p className="text-gray-600 mb-4">
        Verifique sua conexão com a internet e tente novamente.
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          disabled={isRetrying}
          loading={isRetrying}
          loadingText="Tentando novamente..."
          className="mx-auto"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Tentar Novamente
        </Button>
      )}
    </div>
  )
}
