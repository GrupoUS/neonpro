'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Lightbulb, 
  TrendingUp, 
  Target,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react'
import { 
  MarketingOptimizationRecommendation, 
  MarketingOptimizationPriority,
  MarketingOptimizationStrategy 
} from '@/app/types/marketing-roi'

interface RecommendationsTabProps {
  recommendations: MarketingOptimizationRecommendation[]
  isLoading?: boolean
  onImplement?: (recommendationId: string) => void
  onDismiss?: (recommendationId: string) => void
  onViewDetails?: (recommendationId: string) => void
}

export function RecommendationsTab({ 
  recommendations, 
  isLoading = false,
  onImplement,
  onDismiss,
  onViewDetails
}: RecommendationsTabProps) {
  const [selectedPriority, setSelectedPriority] = useState<MarketingOptimizationPriority | 'all'>('all')
  const [selectedStrategy, setSelectedStrategy] = useState<MarketingOptimizationStrategy | 'all'>('all')

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getPriorityIcon = (priority: MarketingOptimizationPriority) => {
    switch (priority) {
      case 'high': return <Target className="h-4 w-4 text-red-600" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const getPriorityColor = (priority: MarketingOptimizationPriority) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
    }
  }

  const getStrategyIcon = (strategy: MarketingOptimizationStrategy) => {
    switch (strategy) {
      case 'cost_reduction': return <DollarSign className="h-4 w-4" />
      case 'conversion_optimization': return <TrendingUp className="h-4 w-4" />
      case 'audience_expansion': return <Users className="h-4 w-4" />
      case 'budget_reallocation': return <Target className="h-4 w-4" />
    }
  }

  const getStrategyLabel = (strategy: MarketingOptimizationStrategy) => {
    switch (strategy) {
      case 'cost_reduction': return 'Redução de Custos'
      case 'conversion_optimization': return 'Otimização de Conversão'
      case 'audience_expansion': return 'Expansão de Audiência'
      case 'budget_reallocation': return 'Realocação de Orçamento'
    }
  }

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false
    if (selectedStrategy !== 'all' && rec.strategy !== selectedStrategy) return false
    return true
  })

  // Group recommendations by priority
  const groupedRecommendations = {
    high: filteredRecommendations.filter(r => r.priority === 'high'),
    medium: filteredRecommendations.filter(r => r.priority === 'medium'),
    low: filteredRecommendations.filter(r => r.priority === 'low')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Tabs value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as any)}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="high">Alta Prioridade</TabsTrigger>
            <TabsTrigger value="medium">Média Prioridade</TabsTrigger>
            <TabsTrigger value="low">Baixa Prioridade</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={selectedStrategy} onValueChange={(value) => setSelectedStrategy(value as any)}>
          <TabsList>
            <TabsTrigger value="all">Todas Estratégias</TabsTrigger>
            <TabsTrigger value="cost_reduction">Redução de Custos</TabsTrigger>
            <TabsTrigger value="conversion_optimization">Conversão</TabsTrigger>
            <TabsTrigger value="audience_expansion">Audiência</TabsTrigger>
            <TabsTrigger value="budget_reallocation">Orçamento</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Resumo das Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{groupedRecommendations.high.length}</div>
              <div className="text-sm text-muted-foreground">Alta Prioridade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{groupedRecommendations.medium.length}</div>
              <div className="text-sm text-muted-foreground">Média Prioridade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{groupedRecommendations.low.length}</div>
              <div className="text-sm text-muted-foreground">Baixa Prioridade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatPercentage(
                  filteredRecommendations.reduce((sum, r) => sum + r.expectedImpact, 0) / 
                  filteredRecommendations.length || 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Impacto Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Priority Recommendations */}
      {groupedRecommendations.high.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Recomendações de Alta Prioridade
          </h3>
          <div className="space-y-4">
            {groupedRecommendations.high.map(recommendation => (
              <Alert key={recommendation.id} className="border-red-200">
                <AlertDescription>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityIcon(recommendation.priority)}
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <Badge variant={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority === 'high' ? 'Alta' : 
                             recommendation.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                          <Badge variant="outline">
                            {getStrategyIcon(recommendation.strategy)}
                            {getStrategyLabel(recommendation.strategy)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {recommendation.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600 font-medium">
                            Impacto: {formatPercentage(recommendation.expectedImpact)}
                          </span>
                          {recommendation.implementationCost && (
                            <span className="text-blue-600">
                              Custo: {formatCurrency(recommendation.implementationCost)}
                            </span>
                          )}
                          {recommendation.timeframe && (
                            <span className="text-purple-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {recommendation.timeframe} dias
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => onViewDetails?.(recommendation.id)}
                        >
                          Detalhes
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onImplement?.(recommendation.id)}
                        >
                          Implementar
                        </Button>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Other Recommendations */}
      {(groupedRecommendations.medium.length > 0 || groupedRecommendations.low.length > 0) && (
        <div className="space-y-4">
          {['medium', 'low'].map(priority => {
            const recs = groupedRecommendations[priority as keyof typeof groupedRecommendations]
            if (recs.length === 0) return null

            return (
              <div key={priority}>
                <h3 className="text-lg font-semibold mb-4">
                  Recomendações de {priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {recs.map(recommendation => (
                    <Card key={recommendation.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getPriorityIcon(recommendation.priority)}
                          {recommendation.title}
                          <Badge variant={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {recommendation.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          {getStrategyIcon(recommendation.strategy)}
                          <span className="text-sm">{getStrategyLabel(recommendation.strategy)}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="text-green-600">
                            Impacto esperado: {formatPercentage(recommendation.expectedImpact)}
                          </div>
                          {recommendation.implementationCost && (
                            <div className="text-blue-600">
                              Custo de implementação: {formatCurrency(recommendation.implementationCost)}
                            </div>
                          )}
                          {recommendation.timeframe && (
                            <div className="text-purple-600">
                              Prazo: {recommendation.timeframe} dias
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails?.(recommendation.id)}
                          >
                            Ver Detalhes
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onImplement?.(recommendation.id)}
                          >
                            Implementar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDismiss?.(recommendation.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma recomendação encontrada</h3>
            <p className="text-muted-foreground">
              Suas campanhas estão otimizadas ou não há dados suficientes para gerar recomendações.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}