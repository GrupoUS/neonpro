'use client'

import { Alert, AlertDescription, AlertTitle, } from '@/components/ui/alert'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
// import {
//   createHealthcareError,
//   ErrorCategory,
//   ErrorSeverity,
// } from "@neonpro/shared/errors/error-utils";
// import type { ErrorContext, HealthcareError } from "@neonpro/shared/errors/healthcare-error-types";

// Mock types and enums for MVP (runtime + type safety)
export const ErrorCategory = {
  SYSTEM: 'SYSTEM',
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  BUSINESS: 'BUSINESS',
  COMPLIANCE: 'COMPLIANCE',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  DATABASE: 'DATABASE',
} as const
export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory]

export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const
export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity]

type ErrorContext = Record<string, unknown>

interface HealthcareError {
  category: ErrorCategory
  severity: ErrorSeverity
  context?: ErrorContext
  message: string
  patientImpact?: string
}

const createHealthcareError = (
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  context?: ErrorContext,
): HealthcareError => ({
  message,
  category,
  severity,
  context,
})
import { AlertTriangle, Phone, RefreshCw, } from 'lucide-react'
import type { ErrorInfo, ReactNode, } from 'react'
import React, { Component, } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: HealthcareError,) => void
  context?: ErrorContext
}

interface State {
  hasError: boolean
  healthcareError?: HealthcareError
}

export class HealthcareErrorBoundary extends Component<Props, State> {
  constructor(props: Props,) {
    super(props,)
    this.state = { hasError: false, }
  }

  static getDerivedStateFromError(_error: Error,): State {
    return { hasError: true, }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo,) {
    const healthcareError: HealthcareError = createHealthcareError(
      error.message,
      ErrorCategory.SYSTEM,
      ErrorSeverity.HIGH,
      {
        ...this.props.context,
        endpoint: typeof window !== 'undefined' ? window.location.pathname : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
    )

    this.setState({ healthcareError, },)

    // Best-effort logging hooks (MVP)
    this.logToComplianceSystem(healthcareError, errorInfo,)
    this.props.onError?.(healthcareError,)

    // Optional UX notification event
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('healthcare-error-reported', {
          detail: {
            message:
              'Erro reportado para a equipe técnica. Aguarde resolução ou entre em contato com o suporte.',
          },
        },),
      )
    }
  }

  private async logToComplianceSystem(error: HealthcareError, _errorInfo: ErrorInfo,) {
    // Placeholder for compliance logging
    console.log('Error logged for compliance:', error.message,)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, healthcareError: undefined, },)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleEscalation = async () => {
    const error = this.state.healthcareError
    if (!error) return
    console.log('Support escalation requested:', error.message,)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <HealthcareErrorFallback
          error={this.state.healthcareError}
          onRetry={this.handleRetry}
          onEscalate={this.handleEscalation}
        />
      )
    }

    return this.props.children
  }
} /**
 * Healthcare Error Fallback Component
 * Displays user-friendly error messages with appropriate actions
 */

interface HealthcareErrorFallbackProps {
  error?: HealthcareError
  onRetry: () => void
  onEscalate: () => void
}

function HealthcareErrorFallback({
  error,
  onRetry,
  onEscalate,
}: HealthcareErrorFallbackProps,) {
  const getSeverityColor = (severity?: ErrorSeverity,) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'border-red-500 bg-red-50'
      case ErrorSeverity.HIGH:
        return 'border-orange-500 bg-orange-50'
      case ErrorSeverity.MEDIUM:
        return 'border-yellow-500 bg-yellow-50'
      default:
        return 'border-blue-500 bg-blue-50'
    }
  }

  const getErrorMessage = (error?: HealthcareError,) => {
    if (!error) {
      return 'Ocorreu um erro inesperado no sistema.'
    }

    // Patient impact check not implemented for MVP

    if (error.category === ErrorCategory.COMPLIANCE) {
      return 'Erro de conformidade LGPD detectado. O responsável pela proteção de dados foi notificado.'
    }

    if (
      error.category === ErrorCategory.AUTHENTICATION
      || error.category === ErrorCategory.AUTHORIZATION
    ) {
      return 'Problema de autenticação detectado. Por favor, faça login novamente.'
    }

    if (error.category === ErrorCategory.DATABASE) {
      return 'Problema de conectividade com o banco de dados. Tentando reconectar automaticamente.'
    }

    return 'Ocorreu um erro no sistema. Nossa equipe foi notificada e está trabalhando na resolução.'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={`max-w-md w-full ${getSeverityColor(error?.severity,)}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Sistema Indisponível</CardTitle>
          </div>
          <CardDescription>{getErrorMessage(error,)}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Detalhes Técnicos</AlertTitle>
              <AlertDescription>
                <div className="text-sm space-y-1 mt-2">
                  <p>
                    <strong>ID do Erro:</strong> ERR_MVP_001
                  </p>
                  <p>
                    <strong>Categoria:</strong> {error.category}
                  </p>
                  <p>
                    <strong>Horário:</strong> {new Date().toLocaleString('pt-BR',)}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 flex-col sm:flex-row">
            <Button onClick={onRetry} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>

            {error?.severity === ErrorSeverity.CRITICAL && (
              <Button
                onClick={onEscalate}
                variant="destructive"
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Reportar Erro Crítico
              </Button>
            )}
          </div>

          {error?.patientImpact && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-800">
                Aviso de Segurança
              </AlertTitle>
              <AlertDescription className="text-red-700">
                Este erro pode ter afetado dados de pacientes. A equipe de segurança foi notificada
                automaticamente e está investigando. Se você estava acessando informações sensíveis,
                por favor documente as ações realizadas.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
