'use client'

import { Alert, AlertDescription, } from '@/components/ui/alert'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import type { ErrorInfo, ReactNode, } from 'react'
import type React from 'react'
import { Component, } from 'react'
import { cn, } from '../../lib/utils'

// AI-specific error types for healthcare contexts
export enum AIErrorType {
  API_UNAVAILABLE = 'api_unavailable',
  TIMEOUT = 'timeout',
  LOW_CONFIDENCE = 'low_confidence',
  PROCESSING_ERROR = 'processing_error',
  CONTEXT_LOST = 'context_lost',
  RATE_LIMIT = 'rate_limit',
  VALIDATION_ERROR = 'validation_error',
  SAFETY_FILTER = 'safety_filter',
  UNKNOWN = 'unknown',
}

// AI error classification with healthcare-specific context
export const AIErrorClassification = {
  [AIErrorType.API_UNAVAILABLE]: {
    severity: 'critical' as const,
    title: 'IA Temporariamente Indisponível',
    description: 'O sistema de inteligência artificial está temporariamente offline.',
    icon: '🔌',
    color: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    fallbackEnabled: true,
    medicalImpact: 'Alto - Funcionalidades críticas podem estar limitadas',
  },
  [AIErrorType.TIMEOUT]: {
    severity: 'medium' as const,
    title: 'Tempo Limite Excedido',
    description: 'A análise da IA demorou mais que o esperado.',
    icon: '⏱️',
    color: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    fallbackEnabled: true,
    medicalImpact: 'Médio - Resultados podem estar incompletos',
  },
  [AIErrorType.LOW_CONFIDENCE]: {
    severity: 'low' as const,
    title: 'Baixa Confiança da IA',
    description: 'A IA não conseguiu analisar com confiança suficiente.',
    icon: '⚠️',
    color: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    fallbackEnabled: true,
    medicalImpact: 'Médio - Requer validação profissional obrigatória',
  },
  [AIErrorType.PROCESSING_ERROR]: {
    severity: 'medium' as const,
    title: 'Erro no Processamento',
    description: 'Ocorreu um erro durante o processamento dos dados pela IA.',
    icon: '⚙️',
    color: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    fallbackEnabled: true,
    medicalImpact: 'Médio - Análise precisa ser refeita',
  },
  [AIErrorType.CONTEXT_LOST]: {
    severity: 'medium' as const,
    title: 'Contexto Perdido',
    description: 'A IA perdeu o contexto da conversa ou análise atual.',
    icon: '💭',
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    fallbackEnabled: true,
    medicalImpact: 'Médio - Informações do paciente podem precisar ser reinseridas',
  },
  [AIErrorType.RATE_LIMIT]: {
    severity: 'low' as const,
    title: 'Limite de Uso Atingido',
    description: 'Muitas solicitações em pouco tempo. Aguarde alguns momentos.',
    icon: '🚦',
    color: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    fallbackEnabled: false,
    medicalImpact: 'Baixo - Aguarde alguns minutos antes de tentar novamente',
  },
  [AIErrorType.VALIDATION_ERROR]: {
    severity: 'medium' as const,
    title: 'Dados Inválidos',
    description: 'Os dados fornecidos não puderam ser processados pela IA.',
    icon: '📋',
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    fallbackEnabled: true,
    medicalImpact: 'Médio - Verifique a qualidade e formato dos dados',
  },
  [AIErrorType.SAFETY_FILTER]: {
    severity: 'medium' as const,
    title: 'Filtro de Segurança Ativado',
    description: 'A solicitação foi bloqueada por medidas de segurança.',
    icon: '🛡️',
    color: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    fallbackEnabled: false,
    medicalImpact: 'Médio - Revise o conteúdo para garantir conformidade',
  },
  [AIErrorType.UNKNOWN]: {
    severity: 'critical' as const,
    title: 'Erro Desconhecido da IA',
    description: 'Ocorreu um erro inesperado no sistema de IA.',
    icon: '❓',
    color: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    fallbackEnabled: true,
    medicalImpact: 'Alto - Contate o suporte técnico',
  },
} as const

// Recovery actions for different error types
export const RecoveryActions = {
  [AIErrorType.API_UNAVAILABLE]: [
    { label: 'Usar Modo Manual', action: 'fallback', primary: true, },
    { label: 'Tentar Novamente', action: 'retry', primary: false, },
    { label: 'Reportar Problema', action: 'report', primary: false, },
  ],
  [AIErrorType.TIMEOUT]: [
    { label: 'Tentar com Dados Simplificados', action: 'simplify', primary: true, },
    { label: 'Tentar Novamente', action: 'retry', primary: false, },
    { label: 'Continuar Sem IA', action: 'fallback', primary: false, },
  ],
  [AIErrorType.LOW_CONFIDENCE]: [
    { label: 'Validação Profissional', action: 'human_review', primary: true, },
    { label: 'Refinar Dados', action: 'refine', primary: false, },
    { label: 'Continuar com Cautela', action: 'proceed_cautious', primary: false, },
  ],
  [AIErrorType.PROCESSING_ERROR]: [
    { label: 'Tentar Novamente', action: 'retry', primary: true, },
    { label: 'Usar Modo Manual', action: 'fallback', primary: false, },
    { label: 'Reportar Bug', action: 'report', primary: false, },
  ],
  [AIErrorType.CONTEXT_LOST]: [
    { label: 'Reiniciar Sessão', action: 'restart', primary: true, },
    { label: 'Fornecer Contexto', action: 'provide_context', primary: false, },
    { label: 'Continuar Sem Contexto', action: 'proceed', primary: false, },
  ],
  [AIErrorType.RATE_LIMIT]: [
    { label: 'Aguardar e Tentar', action: 'wait_retry', primary: true, },
    { label: 'Usar Modo Manual', action: 'fallback', primary: false, },
  ],
  [AIErrorType.VALIDATION_ERROR]: [
    { label: 'Corrigir Dados', action: 'fix_data', primary: true, },
    { label: 'Verificar Formato', action: 'check_format', primary: false, },
    { label: 'Pular Validação', action: 'skip_validation', primary: false, },
  ],
  [AIErrorType.SAFETY_FILTER]: [
    { label: 'Revisar Conteúdo', action: 'review_content', primary: true, },
    { label: 'Usar Termos Alternativos', action: 'rephrase', primary: false, },
  ],
  [AIErrorType.UNKNOWN]: [
    { label: 'Tentar Novamente', action: 'retry', primary: true, },
    { label: 'Usar Modo Manual', action: 'fallback', primary: false, },
    { label: 'Contatar Suporte', action: 'support', primary: false, },
  ],
} as const

// AI Error detection and classification
export function classifyAIError(error: Error,): AIErrorType {
  const message = error.message.toLowerCase()

  if (message.includes('network',) || message.includes('fetch',)) {
    return AIErrorType.API_UNAVAILABLE
  } else if (message.includes('timeout',) || message.includes('time',)) {
    return AIErrorType.TIMEOUT
  } else if (message.includes('confidence',) || message.includes('uncertain',)) {
    return AIErrorType.LOW_CONFIDENCE
  } else if (message.includes('rate',) || message.includes('limit',)) {
    return AIErrorType.RATE_LIMIT
  } else if (message.includes('context',) || message.includes('session',)) {
    return AIErrorType.CONTEXT_LOST
  } else if (message.includes('validation',) || message.includes('invalid',)) {
    return AIErrorType.VALIDATION_ERROR
  } else if (message.includes('safety',) || message.includes('filter',)) {
    return AIErrorType.SAFETY_FILTER
  } else if (message.includes('processing',) || message.includes('analysis',)) {
    return AIErrorType.PROCESSING_ERROR
  }

  return AIErrorType.UNKNOWN
}

// AI Error Boundary state
interface AIErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorType?: AIErrorType
  retryCount: number
  lastRetryTime?: number
}

// AI Error Boundary props
interface AIErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorType: AIErrorType,) => void
  onRecovery?: (action: string,) => void
  enableFallback?: boolean
  enableRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  context?: string // Healthcare context (e.g., "Análise de Paciente", "Agendamento")
  className?: string
}

export class AIErrorBoundary extends Component<AIErrorBoundaryProps, AIErrorBoundaryState> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: AIErrorBoundaryProps,) {
    super(props,)
    this.state = { hasError: false, retryCount: 0, }
  }

  static getDerivedStateFromError(error: Error,): Partial<AIErrorBoundaryState> {
    const errorType = classifyAIError(error,)
    return {
      hasError: true,
      error,
      errorType,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo,) {
    const errorType = classifyAIError(error,)
    this.props.onError?.(error, errorType,)

    // Log AI errors for analytics
    console.group(`🤖 AI Error: ${errorType}`,)
    console.error('Error:', error,)
    console.error('Error Info:', errorInfo,)
    console.groupEnd()
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout,)
    }
  }

  private handleRecoveryAction = (action: string,) => {
    const { onRecovery, maxRetries = 3, retryDelay = 2000, } = this.props
    const { retryCount, } = this.state

    switch (action) {
      case 'retry':
        if (retryCount < maxRetries) {
          this.setState({
            retryCount: retryCount + 1,
            lastRetryTime: Date.now(),
          },)

          this.retryTimeout = setTimeout(() => {
            this.setState({
              hasError: false,
              error: undefined,
              errorType: undefined,
            },)
          }, retryDelay,)
        }
        break

      case 'fallback':
        // Switch to manual mode
        onRecovery?.('switch_to_manual',)
        break

      case 'restart':
        // Clear all state and restart
        this.setState({
          hasError: false,
          error: undefined,
          errorType: undefined,
          retryCount: 0,
        },)
        onRecovery?.('restart_session',)
        break

      default:
        onRecovery?.(action,)
        break
    }
  }

  render() {
    if (!this.state.hasError || !this.state.errorType) {
      return this.props.children
    }

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback
    }

    const errorInfo = AIErrorClassification[this.state.errorType]
    const recoveryActions = RecoveryActions[this.state.errorType]
    const { retryCount, lastRetryTime, } = this.state
    const { maxRetries = 3, context, } = this.props

    const canRetry = this.props.enableRetry && retryCount < maxRetries
    const isRetrying = lastRetryTime && (Date.now() - lastRetryTime) < 3000

    return (
      <Card
        className={cn(
          'max-w-2xl mx-auto m-4',
          errorInfo.color,
          errorInfo.borderColor,
          'border-2',
          this.props.className,
        )}
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="text-2xl" role="img" aria-label="Error icon">
              {errorInfo.icon}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className={cn('text-lg', errorInfo.textColor,)}>
                  {errorInfo.title}
                </CardTitle>
                <Badge
                  variant={errorInfo.severity === 'critical'
                    ? 'destructive'
                    : errorInfo.severity === 'medium'
                    ? 'secondary'
                    : 'outline'}
                >
                  {errorInfo.severity === 'critical'
                    ? 'Crítico'
                    : errorInfo.severity === 'medium'
                    ? 'Moderado'
                    : 'Baixo'}
                </Badge>
              </div>

              {context && (
                <CardDescription className="text-sm font-medium mb-2">
                  Contexto: {context}
                </CardDescription>
              )}

              <CardDescription className={errorInfo.textColor}>
                {errorInfo.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Medical Impact Alert */}
          <Alert>
            <AlertDescription>
              <strong>Impacto Clínico:</strong> {errorInfo.medicalImpact}
            </AlertDescription>
          </Alert>

          {/* Technical Details (collapsible) */}
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Detalhes Técnicos
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-1">
              <div>
                <strong>Erro:</strong> {this.state.error?.message}
              </div>
              <div>
                <strong>Tipo:</strong> {this.state.errorType}
              </div>
              <div>
                <strong>Tentativas:</strong> {retryCount}/{maxRetries}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date().toISOString()}
              </div>
            </div>
          </details>

          {/* Recovery Actions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">
              Ações de Recuperação:
            </h4>

            <div className="grid gap-2">
              {recoveryActions.map((recoveryAction, index,) => (
                <Button
                  key={index}
                  variant={recoveryAction.primary ? 'default' : 'outline'}
                  size="sm"
                  disabled={isRetrying
                    || (recoveryAction.action === 'retry' && !canRetry)}
                  onClick={() => this.handleRecoveryAction(recoveryAction.action,)}
                  className="justify-start"
                >
                  {isRetrying && recoveryAction.action === 'retry'
                    ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Tentando novamente...
                      </>
                    )
                    : (
                      recoveryAction.label
                    )}
                </Button>
              ))}
            </div>

            {!canRetry && retryCount >= maxRetries && (
              <Alert>
                <AlertDescription>
                  Máximo de tentativas atingido. Use uma das opções alternativas acima.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Fallback Option */}
          {this.props.enableFallback && errorInfo.fallbackEnabled && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Modo Alternativo:
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Continue sem IA utilizando controles manuais. Funcionalidade completa disponível,
                sem análise automatizada.
              </p>
              <Button
                variant="secondary"
                onClick={() => this.handleRecoveryAction('fallback',)}
              >
                🔧 Alternar para Modo Manual
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
}

// Higher-order component for wrapping with AI error boundary
export function withAIErrorBoundary<P extends object,>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<AIErrorBoundaryProps, 'children'>,
) {
  const WithAIErrorBoundaryComponent = (props: P,) => (
    <AIErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </AIErrorBoundary>
  )

  WithAIErrorBoundaryComponent.displayName = `withAIErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`

  return WithAIErrorBoundaryComponent
}

export default AIErrorBoundary
