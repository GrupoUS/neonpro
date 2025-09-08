'use client'

import { Progress, } from '@/components/ui/progress'
import { Skeleton, } from '@/components/ui/skeleton'
import React, { useEffect, useState, } from 'react'
import { cn, } from '../../lib/utils'

// AI-specific loading states for healthcare workflows
interface AILoadingStatesProps {
  className?: string
  variant?:
    | 'patient-analysis'
    | 'medical-query'
    | 'diagnosis-assistance'
    | 'treatment-suggestion'
    | 'voice-processing'
    | 'document-analysis'
    | 'compliance-check'
    | 'default'
  showProgress?: boolean
  showConfidenceEstimation?: boolean
  showTimeEstimate?: boolean
  estimatedSeconds?: number
  processingSteps?: string[]
  onComplete?: () => void
}

// Healthcare-specific AI processing messages in Portuguese
const ProcessingMessages = {
  'patient-analysis': [
    'Analisando histórico do paciente...',
    'Processando dados médicos...',
    'Calculando fatores de risco...',
    'Gerando insights clínicos...',
  ],
  'medical-query': [
    'Interpretando consulta médica...',
    'Buscando informações relevantes...',
    'Processando terminologia médica...',
    'Preparando resposta...',
  ],
  'diagnosis-assistance': [
    'Analisando sintomas reportados...',
    'Comparando com base de dados médica...',
    'Calculando probabilidades diagnósticas...',
    'Formatando sugestões...',
  ],
  'treatment-suggestion': [
    'Avaliando protocolo de tratamento...',
    'Verificando contraindicações...',
    'Personalizando recomendações...',
    'Validando segurança...',
  ],
  'voice-processing': [
    'Processando áudio em português...',
    'Reconhecendo terminologia médica...',
    'Convertendo para texto...',
    'Aplicando contexto clínico...',
  ],
  'document-analysis': [
    'Lendo documento médico...',
    'Extraindo informações relevantes...',
    'Validando conformidade LGPD...',
    'Organizando resultados...',
  ],
  'compliance-check': [
    'Verificando conformidade regulatória...',
    'Analisando requisitos ANVISA/CFM...',
    'Validando proteção de dados...',
    'Gerando relatório...',
  ],
  'default': [
    'Processando solicitação...',
    'Aplicando inteligência artificial...',
    'Analisando dados...',
    'Preparando resultados...',
  ],
} as const

// Confidence estimation patterns for different AI operations
const ConfidencePatterns = {
  'patient-analysis': { min: 85, max: 95, label: 'Análise do Paciente', },
  'medical-query': { min: 80, max: 92, label: 'Consulta Médica', },
  'diagnosis-assistance': { min: 75, max: 88, label: 'Assistência Diagnóstica', },
  'treatment-suggestion': { min: 82, max: 94, label: 'Sugestão de Tratamento', },
  'voice-processing': { min: 88, max: 96, label: 'Processamento de Voz', },
  'document-analysis': { min: 90, max: 98, label: 'Análise Documental', },
  'compliance-check': { min: 95, max: 99, label: 'Verificação de Conformidade', },
  'default': { min: 80, max: 90, label: 'Processamento IA', },
} as const

export function AILoadingStates({
  className,
  variant = 'default',
  showProgress = true,
  showConfidenceEstimation = true,
  showTimeEstimate = true,
  estimatedSeconds = 3,
  processingSteps,
  onComplete,
}: AILoadingStatesProps,) {
  const [currentStep, setCurrentStep,] = useState(0,)
  const [progress, setProgress,] = useState(0,)
  const [confidence, setConfidence,] = useState(0,)
  const [timeRemaining, setTimeRemaining,] = useState(estimatedSeconds,)

  const messages = processingSteps || ProcessingMessages[variant]
  const confidencePattern = ConfidencePatterns[variant]

  useEffect(() => {
    const stepDuration = (estimatedSeconds * 1000) / messages.length
    const progressIncrement = 100 / messages.length
    const confidenceIncrement = (confidencePattern.max - confidencePattern.min) / messages.length

    const interval = setInterval(() => {
      setCurrentStep((prev,) => {
        if (prev < messages.length - 1) {
          return prev + 1
        }
        clearInterval(interval,)
        onComplete?.()
        return prev
      },)

      setProgress((prev,) => Math.min(prev + progressIncrement, 100,))
      setConfidence((prev,) => Math.min(prev + confidenceIncrement, confidencePattern.max,))
      setTimeRemaining((prev,) => Math.max(prev - (stepDuration / 1000), 0,))
    }, stepDuration,)

    // Initialize confidence
    setConfidence(confidencePattern.min,)

    return () => clearInterval(interval,)
  }, [estimatedSeconds, messages.length, confidencePattern, onComplete,],)

  const getSkeletonLayout = () => {
    switch (variant) {
      case 'patient-analysis':
        return (
          <div className="space-y-4">
            {/* Patient info header skeleton */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            {/* Analysis sections */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-16 w-full rounded" />
              </div>
            </div>

            {/* Risk factors */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              {Array(3,).fill(0,).map((_, i,) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        )

      case 'medical-query':
        return (
          <div className="space-y-4">
            {/* Query input replica */}
            <div className="p-4 bg-green-50 rounded-lg">
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>

            {/* Response sections */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>

            {/* Medical references */}
            <div className="border-t pt-4">
              <Skeleton className="h-4 w-28 mb-3" />
              {Array(2,).fill(0,).map((_, i,) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <Skeleton className="h-4 w-4 rounded mt-1" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ))}
            </div>
          </div>
        )

      case 'voice-processing':
        return (
          <div className="space-y-4 text-center">
            {/* Microphone visual */}
            <div className="flex justify-center">
              <div className="relative">
                <Skeleton className="h-20 w-20 rounded-full animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping" />
              </div>
            </div>

            {/* Sound waves */}
            <div className="flex justify-center items-center gap-1">
              {Array(7,).fill(0,).map((_, i,) => (
                <Skeleton
                  key={i}
                  className={cn(
                    'w-1 animate-pulse',
                    i % 2 === 0 ? 'h-8' : 'h-12',
                  )}
                  style={{ animationDelay: `${i * 0.1}s`, }}
                />
              ))}
            </div>

            {/* Transcription preview */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <Skeleton className="h-4 w-40 mx-auto mb-2" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full animate-spin" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        )
    }
  }

  return (
    <div
      className={cn('space-y-4 p-6', className,)}
      role="status"
      aria-live="polite"
      aria-label="Processando com inteligência artificial"
    >
      {/* Main skeleton content */}
      {getSkeletonLayout()}

      {/* Current processing step */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              {messages[currentStep]}
            </span>
          </div>

          {/* Time estimate */}
          {showTimeEstimate && (
            <span className="text-xs text-gray-500">
              ~{Math.ceil(timeRemaining,)}s restantes
            </span>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Etapa {currentStep + 1} de {messages.length}</span>
              <span>{Math.round(progress,)}% completo</span>
            </div>
          </div>
        )}

        {/* Confidence estimation */}
        {showConfidenceEstimation && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confiança da IA:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    confidence >= 90
                      ? 'bg-green-500'
                      : confidence >= 80
                      ? 'bg-yellow-500'
                      : 'bg-red-500',
                  )}
                />
                <span className="font-medium">
                  {Math.round(confidence,)}%
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {confidencePattern.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only">
        Processando {confidencePattern.label} com {Math.round(confidence,)}% de confiança. Etapa
        {' '}
        {currentStep + 1} de {messages.length}: {messages[currentStep]}
      </div>
    </div>
  )
}

// Specialized AI loading components for common healthcare scenarios
export function PatientAnalysisLoading(
  { className, ...props }: Omit<AILoadingStatesProps, 'variant'>,
) {
  return (
    <AILoadingStates
      variant="patient-analysis"
      className={className}
      {...props}
    />
  )
}

export function MedicalQueryLoading(
  { className, ...props }: Omit<AILoadingStatesProps, 'variant'>,
) {
  return (
    <AILoadingStates
      variant="medical-query"
      className={className}
      {...props}
    />
  )
}

export function VoiceProcessingLoading(
  { className, ...props }: Omit<AILoadingStatesProps, 'variant'>,
) {
  return (
    <AILoadingStates
      variant="voice-processing"
      className={className}
      {...props}
    />
  )
}

// Hook for managing AI loading states
export function useAILoadingState(
  variant: AILoadingStatesProps['variant'] = 'default',
  _estimatedSeconds: number = 3,
) {
  const [isLoading, setIsLoading,] = useState(false,)
  const [progress, setProgress,] = useState(0,)
  const [currentStep, setCurrentStep,] = useState(0,)

  const startLoading = () => {
    setIsLoading(true,)
    setProgress(0,)
    setCurrentStep(0,)
  }

  const stopLoading = () => {
    setIsLoading(false,)
    setProgress(100,)
  }

  const updateProgress = (newProgress: number,) => {
    setProgress(Math.min(Math.max(newProgress, 0,), 100,),)
  }

  return {
    isLoading,
    progress,
    currentStep,
    startLoading,
    stopLoading,
    updateProgress,
    LoadingComponent: (props: Omit<AILoadingStatesProps, 'variant'>,) => (
      <AILoadingStates variant={variant} {...props} />
    ),
  }
}

export default AILoadingStates
