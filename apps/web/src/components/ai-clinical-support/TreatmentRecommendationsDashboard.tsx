'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js'
import { apiClient as api } from '@/lib/api.js'
import { TreatmentRecommendation } from '@/types/ai-clinical-support.js'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
// import { Progress } from '@/components/ui/progress.js';
// import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Lightbulb,
  Star,
  TrendingUp,
} from 'lucide-react'

interface TreatmentRecommendationsDashboardProps {
  patientId: string
  assessmentId?: string
  onTreatmentPlanCreate?: (recommendations: TreatmentRecommendation[]) => void
}

export function TreatmentRecommendationsDashboard({
  patientId,
  assessmentId,
  onTreatmentPlanCreate,
}: TreatmentRecommendationsDashboardProps) {
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('recommended')
  const [showAlternatives] = useState(false)

  // Fetch treatment recommendations - temporarily disabled for build stability
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['treatment-recommendations', patientId, assessmentId],
    queryFn: async () => {
      if (assessmentId) {
        // Note: API not yet implemented - returning mock data
        // return await api.aiClinicalSupport.generateTreatmentRecommendations({
        //   patientId,
        //   assessmentId,
        //   includeAlternatives: showAlternatives,
        //   evidenceThreshold: 'moderate',
        // })
        return { recommendations: [], metadata: {} }
      }
      return null
    },
    enabled: !!assessmentId,
  })

  // Fetch patient treatment history - temporarily disabled for build stability
  const { data: treatmentHistory } = useQuery({
    queryKey: ['patient-treatment-history', patientId],
    queryFn: async () => {
      // Note: API not yet implemented - returning mock data
      // return await api.aiClinicalSupport.getPatientTreatmentHistory({
      //   patientId,
      //   limit: 10,
      // })
      return { treatments: [] }
    },
    enabled: !!patientId,
  })

  const handleRecommendationToggle = (recommendationId: string) => {
    setSelectedRecommendations(prev =>
      prev.includes(recommendationId)
        ? prev.filter(id => id !== recommendationId)
        : [...prev, recommendationId]
    )
  }

  const handleCreateTreatmentPlan = async () => {
    if (selectedRecommendations.length === 0) return

    const selectedRecs = recommendations?.recommendations.filter((r: any) =>
      selectedRecommendations.includes(r.id)
    )

    if (selectedRecs && onTreatmentPlanCreate) {
      onTreatmentPlanCreate(selectedRecs)
    }
  }

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-orange-100 text-orange-800'
      case 'experimental':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600'
      case 'moderate':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
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
        <AlertTitle>Erro ao carregar recomendações</AlertTitle>
        <AlertDescription>
          Não foi possível gerar recomendações de tratamento. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    )
  }

  if (!recommendations) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>
            <Lightbulb className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Nenhuma avaliação encontrada
            </h3>
            <p className='text-gray-500 mb-4'>
              Complete a avaliação do paciente para gerar recomendações de tratamento
              personalizadas.
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
            Recomendações de Tratamento
          </h2>
          <p className='text-gray-600 mt-1'>
            Baseado em IA e evidências científicas para {recommendations.patientInfo?.name}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='flex items-center gap-1'>
            <Activity className='h-3 w-3' />
            {recommendations.recommendations.length} opções
          </Badge>
          <Badge variant='outline' className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            {format(new Date(recommendations.generatedAt), 'dd/MM/yyyy', { locale: ptBR })}
          </Badge>
        </div>
      </div>

      {/* Treatment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Resumo do Plano Recomendado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {recommendations.overallConfidenceScore}
              </div>
              <div className='text-sm text-gray-500'>Confiança Geral</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {recommendations.expectedImprovementScore}
              </div>
              <div className='text-sm text-gray-500'>Melhoria Esperada</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {recommendations.estimatedTotalSessions}
              </div>
              <div className='text-sm text-gray-500'>Sessões Estimadas</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(recommendations.estimatedTotalCost)}
              </div>
              <div className='text-sm text-gray-500'>Custo Estimado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='recommended'>Recomendados</TabsTrigger>
          <TabsTrigger value='alternatives'>Alternativas</TabsTrigger>
          <TabsTrigger value='timeline'>Cronograma</TabsTrigger>
          <TabsTrigger value='history'>Histórico</TabsTrigger>
        </TabsList>

        {/* Recommended Treatments */}
        <TabsContent value='recommended' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Selecione os procedimentos para incluir no plano de tratamento
            </p>
            {selectedRecommendations.length > 0 && (
              <Button onClick={handleCreateTreatmentPlan}>
                Criar Plano de Tratamento ({selectedRecommendations.length})
              </Button>
            )}
          </div>

          {recommendations.recommendations
            .filter((r: any) => r.priority === 'high' || r.priority === 'medium')
            .map((recommendation: any) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                isSelected={selectedRecommendations.includes(recommendation.id)}
                onToggle={handleRecommendationToggle}
                getEvidenceColor={getEvidenceColor}
                getConfidenceColor={getConfidenceColor}
                getRiskColor={getRiskColor}
              />
            ))}
        </TabsContent>

        {/* Alternative Treatments */}
        <TabsContent value='alternatives' className='space-y-4'>
          {recommendations.recommendations
            .filter((r: any) => r.priority === 'low' || r.priority === 'alternative')
            .map((recommendation: any) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                isSelected={selectedRecommendations.includes(recommendation.id)}
                onToggle={handleRecommendationToggle}
                getEvidenceColor={getEvidenceColor}
                getConfidenceColor={getConfidenceColor}
                getRiskColor={getRiskColor}
              />
            ))}
        </TabsContent>

        {/* Treatment Timeline */}
        <TabsContent value='timeline' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Cronograma Recomendado</CardTitle>
              <CardDescription>
                Sequência sugerida de procedimentos para resultados ótimos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recommendations.recommendations
                  .filter((r: any) => r.priority === 'high' || r.priority === 'medium')
                  .sort((a: any, b: any) => a.recommendedPhase - b.recommendedPhase)
                  .map((recommendation: any, index: number) => (
                    <div key={recommendation.id} className='flex items-start gap-4'>
                      <div className='flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-sm font-medium text-blue-600'>
                          {index + 1}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-medium'>{recommendation.procedureName}</h4>
                        <p className='text-sm text-gray-600'>
                          Fase {recommendation.recommendedPhase} •{' '}
                          {recommendation.sessionsRecommended} sessões
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment History */}
        <TabsContent value='history' className='space-y-4'>
          {treatmentHistory && treatmentHistory.treatments.length > 0
            ? (
              <div className='space-y-4'>
                {treatmentHistory.treatments.map(treatment => (
                  <Card key={treatment.id}>
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='font-medium'>{treatment.procedureName}</h4>
                          <p className='text-sm text-gray-600'>
                            {format(new Date(treatment.date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className='text-right'>
                          <Badge
                            variant={treatment.outcome === 'positive' ? 'default' : 'secondary'}
                          >
                            {treatment.outcome}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
            : (
              <Card>
                <CardContent className='p-6'>
                  <div className='text-center'>
                    <FileText className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Sem histórico de tratamentos
                    </h3>
                    <p className='text-gray-500'>
                      Este paciente não possui tratamentos anteriores registrados.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: TreatmentRecommendation
  isSelected: boolean
  onToggle: (id: string) => void
  getEvidenceColor: (level: string) => string
  getConfidenceColor: (score: number) => string
  getRiskColor: (level: string) => string
}

function RecommendationCard({
  recommendation,
  isSelected,
  onToggle,
  getEvidenceColor,
  getConfidenceColor,
  getRiskColor,
}: RecommendationCardProps) {
  return (
    <Card className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <input
                type='checkbox'
                checked={isSelected}
                onChange={() => onToggle(recommendation.id)}
                className='h-4 w-4 text-blue-600 rounded border-gray-300'
              />
              <CardTitle className='text-lg'>{recommendation.procedureName}</CardTitle>
              <Badge variant='outline' className={getEvidenceColor(recommendation.evidenceLevel)}>
                {recommendation.evidenceLevel}
              </Badge>
              {recommendation.priority === 'high' && (
                <Badge className='bg-red-100 text-red-800'>Prioridade</Badge>
              )}
            </div>
            <CardDescription>
              {recommendation.description}
            </CardDescription>
          </div>
          <div className='text-right ml-4'>
            <div
              className={`text-sm font-medium ${
                getConfidenceColor(recommendation.confidenceScore)
              }`}
            >
              {Math.round(recommendation.confidenceScore * 100)}% confiança
            </div>
            <div className='flex items-center gap-1 mt-1'>
              <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
              <span className='text-sm'>{recommendation.efficacyScore}/10 eficácia</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-gray-400' />
            <span className='text-sm'>{recommendation.sessionsRecommended} sessões</span>
          </div>
          <div className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4 text-gray-400' />
            <span className='text-sm'>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(recommendation.estimatedCostPerSession)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-gray-400' />
            <span className='text-sm'>{recommendation.recoveryTime} dias recuperação</span>
          </div>
        </div>

        <div className='space-y-3'>
          <div>
            <h4 className='font-medium text-sm mb-1'>Justificativa Clínica</h4>
            <p className='text-sm text-gray-600'>{recommendation.clinicalJustification}</p>
          </div>

          <div>
            <h4 className='font-medium text-sm mb-1'>Resultados Esperados</h4>
            <p className='text-sm text-gray-600'>{recommendation.expectedOutcome}</p>
          </div>

          {recommendation.contraindications.length > 0 && (
            <Alert>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Contraindicações Identificadas</AlertTitle>
              <AlertDescription>
                <ul className='list-disc list-inside text-sm'>
                  {recommendation.contraindications.map((contraindication, index) => (
                    <li key={index}>{contraindication}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {recommendation.riskFactors.length > 0 && (
            <div>
              <h4 className='font-medium text-sm mb-2'>Fatores de Risco</h4>
              <div className='space-y-1'>
                {recommendation.riskFactors.map((risk, index) => (
                  <div key={index} className='flex items-center justify-between text-sm'>
                    <span>{risk.factor}</span>
                    <span className={`font-medium ${getRiskColor(risk.level)}`}>
                      {risk.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
