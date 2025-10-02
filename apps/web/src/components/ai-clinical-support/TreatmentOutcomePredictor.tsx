/**
 * Treatment Outcome Predictor Component
 * 
 * AI-powered treatment outcome prediction system for aesthetic medicine with Brazilian
 * healthcare compliance. This component provides evidence-based predictions of treatment
 * results, timelines, and patient satisfaction using machine learning models trained
 * on clinical data while adhering to CFM and ANVISA regulations.
 * 
 * @component
 * @example
 * // Usage in treatment planning workflow
 * <TreatmentOutcomePredictor 
 *   patientId="patient-123"
 *   treatmentPlanId="plan-456"
 *   procedureIds={['proc-789', 'proc-790']}
 *   onPredictionUpdate={handlePredictionUpdate}
 * />
 * 
 * @remarks
 * - WCAG 2.1 AA+ compliant for healthcare provider accessibility
 * - Brazilian medical ethics compliance (CFM Resolution 2.227/2018)
 * - AI predictions with confidence intervals and clinical validation
 * - Integration with patient history and treatment databases
 * - Portuguese language interface optimized for Brazilian healthcare professionals
 * - Mobile-responsive for clinical consultation support
 * 
 * @security
 * - Encrypted AI model communication and patient data processing
 * - Anonymized data processing for model training and predictions
 * - Audit logging of prediction requests and clinical usage
 * - Compliance with LGPD for AI-processed health data
 * - Clinical oversight requirements for prediction interpretation
 * 
 * @accessibility
 * - High contrast display for clinical environments
 * - Screen reader optimized for complex prediction data
 * - Clear confidence indicators and risk communication
 * - Keyboard navigation support for clinical workflows
 * 
 * @compliance
 * CFM Resolution 2.227/2018 - Telemedicine and AI in clinical practice
 * ANVISA RDC 15/2012 - Medical device and treatment safety
 * LGPD Lei 13.709/2018 - AI data processing and patient rights
 * ISO 13485 - Medical device quality management for AI systems
 * 
 * @aiEthics
 * - Human oversight requirement for all AI predictions
 * - Explainable AI with clinical reasoning transparency
 * - Risk mitigation and safety communication protocols
 * - Continuous monitoring of prediction accuracy and safety
 * - Clear communication of prediction limitations and uncertainties
 */

'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Progress } from '@/components/ui/progress.js'
import { Separator } from '@/components/ui/separator.js'
import { Slider } from '@/components/ui/slider.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js'
import { apiClient as api } from '@/lib/api.ts'
import { TreatmentOutcomePrediction } from '@/types/ai-clinical-support.js'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  Clock,
  Frown,
  Meh,
  PieChart,
  RefreshCw,
  Smile,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

/**
 * Props interface for TreatmentOutcomePredictor component
 * 
 * Defines the configuration and callback handlers for AI-powered treatment
 * outcome prediction system with Brazilian healthcare compliance requirements.
 * 
 * @interface TreatmentOutcomePredictorProps
 * 
 * @property {string} patientId - Unique patient identifier
 *   Used for fetching patient data and personalizing AI predictions
 *   Must be a valid patient record from the electronic health system
 * @property {string} [treatmentPlanId] - Optional treatment plan identifier
 *   Links predictions to specific treatment plans and protocols
 *   Provides context for comprehensive outcome analysis
 * @property {string[]} [procedureIds] - Optional array of procedure identifiers
 *   Specific aesthetic procedures for outcome prediction
 *   Allows for detailed analysis of individual treatment components
 * @property {Function} [onPredictionUpdate] - Optional callback for prediction updates
 *   @param {TreatmentOutcomePrediction} prediction - AI-generated outcome prediction
 *   @returns {void}
 *   Called when prediction models generate new or updated forecasts
 * 
 * @example
 * const props: TreatmentOutcomePredictorProps = {
 *   patientId: 'patient-123',
 *   treatmentPlanId: 'plan-456',
 *   procedureIds: ['botox', 'filler'],
 *   onPredictionUpdate: (prediction) => {
 *     treatmentService.updateOutcomePrediction(patientId, prediction);
 *   }
 * };
 * 
 * @security
 * Patient identifiers must be validated and authorized according to
 * healthcare data access regulations and CFM standards.
 * 
 * @compliance
 * All AI predictions must be reviewed and interpreted by licensed
 * healthcare professionals before clinical decision-making, as required by
 * CFM Resolution 2.227/2018 for AI-assisted clinical predictions.
 * 
 * @clinicalUsage
 * Predictions are for informational and planning purposes only.
 * Final treatment decisions must consider patient-specific factors
 * and professional clinical judgment.
 */
interface TreatmentOutcomePredictorProps {
  patientId: string
  treatmentPlanId?: string
  procedureIds?: string[]
  onPredictionUpdate?: (prediction: TreatmentOutcomePrediction) => void
}

export function TreatmentOutcomePredictor({
  patientId,
  treatmentPlanId,
  procedureIds,
  onPredictionUpdate,
}: TreatmentOutcomePredictorProps) {
  const [timeHorizon, setTimeHorizon] = useState([6]) // months
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.7])
  const [_selectedMetric, _setSelectedMetric] = useState('overall')
  const [activeTab, setActiveTab] = useState('predictions')

  // Fetch treatment outcome predictions
  const { data: prediction, isLoading, error, refetch } = useQuery({
    queryKey: [
      'treatment-outcome-prediction',
      patientId,
      treatmentPlanId,
      procedureIds,
      timeHorizon[0],
    ],
    queryFn: async () => {
      return await api.aiClinicalSupport.predictTreatmentOutcomes({
        patientId,
        treatmentPlanId,
        procedureIds,
        timeHorizonMonths: timeHorizon[0],
        includeDetailedAnalysis: true,
        confidenceThreshold: confidenceThreshold[0],
      })
    },
    enabled: !!patientId && (treatmentPlanId || procedureIds),
  })

  useEffect(() => {
    if (prediction && onPredictionUpdate) {
      onPredictionUpdate(prediction)
    }
  }, [prediction, onPredictionUpdate])

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.8) return <ThumbsUp className='h-4 w-4' />
    if (score >= 0.6) return <Meh className='h-4 w-4' />
    return <ThumbsDown className='h-4 w-4' />
  }

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'excellent':
        return <Star className='h-4 w-4 text-yellow-500' />
      case 'good':
        return <Smile className='h-4 w-4 text-green-500' />
      case 'moderate':
        return <Meh className='h-4 w-4 text-yellow-500' />
      case 'poor':
        return <Frown className='h-4 w-4 text-red-500' />
      default:
        return <Activity className='h-4 w-4' />
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'excellent':
        return 'bg-yellow-100 text-yellow-800'
      case 'good':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const _formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-4'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Erro na predição de resultados</AlertTitle>
        <AlertDescription>
          Não foi possível gerar predições de tratamento. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    )
  }

  if (!prediction) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>
            <BarChart3 className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Predição de Resultados
            </h3>
            <p className='text-gray-500 mb-4'>
              Selecione um plano de tratamento ou procedimentos para analisar resultados esperados.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Predição de Resultados
          </h2>
          <p className='text-gray-600 mt-1'>
            Análise preditiva baseada em IA para {(prediction as any)?.patientInfo?.name || 'Paciente'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => refetch()}
            className='flex items-center gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5' />
            Parâmetros de Predição
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <label className='text-sm font-medium mb-2 block'>
              Horizonte de Tempo: {timeHorizon[0]} meses
            </label>
            <Slider
              value={timeHorizon}
              onValueChange={setTimeHorizon}
              max={24}
              min={1}
              step={1}
              className='w-full'
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-2 block'>
              Limiar de Confiança: {(confidenceThreshold[0] * 100).toFixed(0)}%
            </label>
            <Slider
              value={confidenceThreshold}
              onValueChange={setConfidenceThreshold}
              max={1}
              min={0.5}
              step={0.05}
              className='w-full'
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-green-500' />
              <div>
                <div className='text-sm text-gray-500'>Taxa de Sucesso</div>
                <div className='text-lg font-bold text-green-600'>
                  {((prediction as any)?.overallSuccessRate * 100 || 0).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 text-yellow-500' />
              <div>
                <div className='text-sm text-gray-500'>Satisfação Esperada</div>
                <div className='text-lg font-bold text-yellow-600'>
                  {(prediction as any)?.expectedSatisfactionScore || 0}/10
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-blue-500' />
              <div>
                <div className='text-sm text-gray-500'>Tempo para Resultados</div>
                <div className='text-lg font-bold text-blue-600'>
                  {(prediction as any)?.timeToVisibleResults || 0} semanas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Award className='h-4 w-4 text-purple-500' />
              <div>
                <div className='text-sm text-gray-500'>Confiança da Predição</div>
                <div
                  className={`text-lg font-bold ${
                    getConfidenceColor((prediction as any)?.predictionConfidence || 0)
                  }`}
                >
                  {((prediction as any)?.predictionConfidence * 100 || 0).toFixed(0)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning for Low Confidence */}
      {((prediction as any)?.predictionConfidence || 1) < confidenceThreshold[0] && (
        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Baixa Confiança na Predição</AlertTitle>
          <AlertDescription>
            A predição atual tem baixa confiança devido a limitações nos dados ou alta variabilidade
            nos resultados. Considere aumentar o limiar de confiança ou coletar mais informações do
            paciente.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='predictions'>Predições</TabsTrigger>
          <TabsTrigger value='timeline'>Timeline</TabsTrigger>
          <TabsTrigger value='factors'>Fatores de Influência</TabsTrigger>
          <TabsTrigger value='comparisons'>Comparações</TabsTrigger>
        </TabsList>

        {/* Predictions */}
        <TabsContent value='predictions' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-5 w-5' />
                  Distribuição de Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {((prediction as any)?.outcomeProbabilities || []).map((outcome: any) => (
                    <div key={outcome.outcome} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          {getOutcomeIcon(outcome.outcome)}
                          <span className='text-sm font-medium capitalize'>
                            {outcome.outcome === 'excellent'
                              ? 'Excelente'
                              : outcome.outcome === 'good'
                              ? 'Bom'
                              : outcome.outcome === 'moderate'
                              ? 'Moderado'
                              : outcome.outcome === 'poor'
                              ? 'Ruim'
                              : outcome.outcome}
                          </span>
                        </div>
                        <span className='text-sm font-medium'>
                          {(outcome.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={outcome.probability * 100} className='h-2' />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Métricas de Resultado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {((prediction as any)?.metrics || []).map((metric: any) => (
                    <div key={metric.name} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>{metric.name}</span>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm'>{metric.predictedValue}{metric.unit}</span>
                          {getConfidenceIcon(metric.confidence)}
                        </div>
                      </div>
                      <div className='text-xs text-gray-500'>
                        {metric.minValue}
                        {metric.unit} - {metric.maxValue}
                        {metric.unit}
                      </div>
                      <Progress value={metric.confidence * 100} className='h-1' />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value='timeline' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Timeline de Resultados Esperados
              </CardTitle>
              <CardDescription>
                Progressão esperada dos resultados ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {((prediction as any)?.timeline || []).map((phase: any, index: number) => (
                  <TimelinePhase key={index} phase={phase} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Influencing Factors */}
        <TabsContent value='factors' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Fatores Positivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {((prediction as any)?.influencingFactors || [])
                    .filter((f: any) => f.impact === 'positive')
                    .map((factor: any, index: number) => (
                      <div key={index} className='flex items-start gap-3'>
                        <ThumbsUp className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>{factor.name}</div>
                          <div className='text-xs text-gray-600'>{factor.description}</div>
                          <div className='text-xs text-green-600'>
                            Impacto: +{Math.round(factor.weight * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingDown className='h-5 w-5' />
                  Fatores de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {((prediction as any)?.influencingFactors || [])
                    .filter((f: any) => f.impact === 'negative')
                    .map((factor: any, index: number) => (
                      <div key={index} className='flex items-start gap-3'>
                        <ThumbsDown className='h-4 w-4 text-red-500 mt-0.5 flex-shrink-0' />
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>{factor.name}</div>
                          <div className='text-xs text-gray-600'>{factor.description}</div>
                          <div className='text-xs text-red-600'>
                            Impacto: -{Math.round(factor.weight * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparisons */}
        <TabsContent value='comparisons' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                Comparações e Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div>
                  <h4 className='font-medium mb-3'>Comparação com Média de Pacientes</h4>
                  <div className='space-y-3'>
                    {((prediction as any)?.benchmarks || []).map((benchmark: any, index: number) => (
                      <div key={index} className='grid grid-cols-3 gap-4 items-center'>
                        <span className='text-sm font-medium'>{benchmark.metric}</span>
                        <div className='text-center'>
                          <div className='text-sm text-gray-600'>Média Geral</div>
                          <div className='font-medium'>
                            {benchmark.averageValue}
                            {benchmark.unit}
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-sm text-gray-600'>Predição</div>
                          <div
                            className={`font-medium ${
                              benchmark.predictedValue > benchmark.averageValue
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {benchmark.predictedValue}
                            {benchmark.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className='font-medium mb-3'>Alternativas de Tratamento</h4>
                  <div className='space-y-3'>
                    {((prediction as any)?.alternativeScenarios || []).map((scenario: any, index: number) => (
                      <div key={index} className='border rounded-lg p-3'>
                        <div className='flex items-center justify-between mb-2'>
                          <h5 className='font-medium'>{scenario.scenarioName}</h5>
                          <Badge
                            variant='outline'
                            className={getOutcomeColor(scenario.expectedOutcome)}
                          >
                            {scenario.expectedOutcome === 'excellent'
                              ? 'Excelente'
                              : scenario.expectedOutcome === 'good'
                              ? 'Bom'
                              : scenario.expectedOutcome === 'moderate'
                              ? 'Moderado'
                              : scenario.expectedOutcome === 'poor'
                              ? 'Ruim'
                              : scenario.expectedOutcome}
                          </Badge>
                        </div>
                        <div className='text-sm text-gray-600 mb-2'>{scenario.description}</div>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div>
                            <span className='text-gray-500'>Sucesso:</span>
                            <span className='font-medium'>
                              {(scenario.successRate * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className='text-gray-500'>Custo:</span>
                            <span className='font-medium'>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(scenario.estimatedCost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TimelinePhaseProps {
  phase: PredictionTimeline
  index: number
}

function TimelinePhase({ phase, index }: TimelinePhaseProps) {
  return (
    <div className='flex items-start gap-4'>
      <div className='flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
        <span className='text-sm font-medium text-blue-600'>{index + 1}</span>
      </div>
      <div className='flex-1'>
        <div className='flex items-center gap-2 mb-1'>
          <h4 className='font-medium'>{phase.phase}</h4>
          <Badge variant='outline'>{phase.timeframe}</Badge>
        </div>
        <p className='text-sm text-gray-600 mb-2'>{phase.description}</p>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-sm'>
          <div>
            <span className='text-gray-500'>Resultado:</span>
            <div className='font-medium'>{phase.expectedResult}</div>
          </div>
          <div>
            <span className='text-gray-500'>Confiança:</span>
            <div className='font-medium'>{(phase.confidence * 100).toFixed(0)}%</div>
          </div>
          <div>
            <span className='text-gray-500'>Métricas:</span>
            <div className='font-medium'>{phase.keyMetrics.length}</div>
          </div>
          <div>
            <span className='text-gray-500'>Riscos:</span>
            <div className='font-medium'>{phase.potentialRisks.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
