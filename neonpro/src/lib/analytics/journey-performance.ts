/**
 * 📊 NeonPro Journey Performance Analytics
 * 
 * HEALTHCARE JOURNEY PERFORMANCE - Sistema de Análise de Performance da Jornada do Paciente
 * Sistema avançado de análise de performance de jornada com métricas KPI, otimização de conversão,
 * análise de tempo de conclusão e identificação de oportunidades de melhoria
 * em clínicas estéticas.
 * 
 * @fileoverview Sistema de análise de performance de jornada com KPIs, conversão,
 * eficiência e análise ROI para otimização contínua
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @since 2025-01-30
 * 
 * COMPLIANCE: LGPD, ANVISA, CFM
 * ARCHITECTURE: Performance-driven, Analytical, Real-time, Data-intensive
 * TESTING: Jest unit tests, Performance metrics validation, Analytics accuracy tests
 * 
 * FEATURES:
 * - Journey performance KPI calculation and tracking
 * - Conversion rate optimization across journey stages
 * - Time-to-completion analysis and optimization
 * - Journey efficiency metrics and improvement opportunities
 * - ROI analysis for experience improvements
 * - Performance benchmarking and trend analysis
 * - Bottleneck identification and resolution
 * - Performance forecasting and predictive analytics
 */

import { type Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { type JourneyStage, type JourneyEvent } from './journey-mapping-engine'
import { type TouchpointAnalysis } from './touchpoint-analyzer'
import { type SatisfactionMetrics } from './satisfaction-metrics'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Performance Metrics - Métricas de performance
 */
export interface PerformanceMetrics {
  // Core Performance Metrics
  conversionRate: number                    // Taxa de conversão geral
  averageJourneyTime: number               // Tempo médio de jornada (dias)
  completionRate: number                   // Taxa de conclusão
  dropoffRate: number                      // Taxa de abandono
  
  // Stage Performance
  stageConversions: Record<string, number> // Conversões por estágio
  stageDurations: Record<string, number>   // Durações por estágio
  stageDropoffs: Record<string, number>    // Abandonos por estágio
  
  // Efficiency Metrics
  efficiencyScore: number                  // Score de eficiência (0-100)
  timeToValue: number                      // Tempo para gerar valor (dias)
  resourceUtilization: number             // Utilização de recursos (%)
  
  // Financial Metrics
  revenuePerJourney: number               // Receita por jornada
  costPerAcquisition: number              // Custo por aquisição
  lifetimeValue: number                   // Valor de vida do cliente
  roi: number                             // Retorno sobre investimento
  
  // Quality Metrics
  satisfactionScore: number               // Score de satisfação médio
  npsScore: number                        // Net Promoter Score
  retentionRate: number                   // Taxa de retenção
  
  // Temporal Data
  calculatedAt: Date                      // Data do cálculo
  period: PerformancePeriod               // Período analisado
}

/**
 * Performance Period - Período de análise
 */
export type PerformancePeriod = 
  | 'daily'         // Diário
  | 'weekly'        // Semanal
  | 'monthly'       // Mensal
  | 'quarterly'     // Trimestral
  | 'yearly'        // Anual
  | 'custom'        // Personalizado

/**
 * KPI Definition - Definição de KPI
 */
export interface KPIDefinition {
  id: string                              // ID único do KPI
  name: string                            // Nome do KPI
  description: string                     // Descrição
  category: KPICategory                   // Categoria do KPI
  formula: string                         // Fórmula de cálculo
  target: number                          // Meta
  benchmark: number                       // Benchmark da indústria
  unit: string                            // Unidade (%, R$, dias, etc.)
  criticalThreshold: number               // Limite crítico
  warningThreshold: number                // Limite de aviso
  trend: 'up' | 'down' | 'stable'        // Tendência desejada
  weight: number                          // Peso na análise (0-1)
}

/**
 * KPI Category - Categoria de KPI
 */
export type KPICategory = 
  | 'conversion'      // Conversão
  | 'efficiency'      // Eficiência
  | 'satisfaction'    // Satisfação
  | 'financial'       // Financeiro
  | 'operational'     // Operacional
  | 'quality'         // Qualidade

/**
 * Performance Analysis - Análise de performance
 */
export interface PerformanceAnalysis {
  // Analysis ID
  id: string                              // ID único da análise
  patientId?: string                      // ID do paciente (opcional)
  clinicId: string                        // ID da clínica
  
  // Analysis Configuration
  period: PerformancePeriod               // Período analisado
  startDate: Date                         // Data inicial
  endDate: Date                           // Data final
  
  // Core Metrics
  metrics: PerformanceMetrics             // Métricas calculadas
  kpis: KPIResult[]                       // Resultados dos KPIs
  
  // Performance Insights
  bottlenecks: BottleneckAnalysis[]       // Gargalos identificados
  opportunities: ImprovementOpportunity[] // Oportunidades de melhoria
  trends: PerformanceTrend[]              // Tendências identificadas
  
  // Benchmarking
  benchmarkComparison: BenchmarkResult[] // Comparação com benchmarks
  industryPosition: IndustryPosition      // Posição na indústria
  
  // Forecasting
  forecast: PerformanceForecast           // Previsão de performance
  
  // Analysis Metadata
  confidence: number                      // Confiança da análise (0-100)
  dataQuality: DataQualityScore           // Qualidade dos dados
  calculatedAt: Date                      // Data do cálculo
  version: string                         // Versão da análise
}

/**
 * KPI Result - Resultado de KPI
 */
export interface KPIResult {
  kpi: KPIDefinition                      // Definição do KPI
  value: number                           // Valor atual
  previousValue: number                   // Valor anterior
  change: number                          // Mudança (%)
  changeDirection: 'up' | 'down' | 'stable' // Direção da mudança
  status: KPIStatus                       // Status do KPI
  achievementRate: number                 // Taxa de alcance da meta (%)
  trendData: number[]                     // Dados de tendência
  insights: string[]                      // Insights gerados
}

/**
 * KPI Status - Status do KPI
 */
export type KPIStatus = 
  | 'excellent'   // Excelente (acima da meta)
  | 'good'        // Bom (próximo da meta)
  | 'warning'     // Atenção (abaixo da meta)
  | 'critical'    // Crítico (muito abaixo)
  | 'unknown'     // Desconhecido

/**
 * Bottleneck Analysis - Análise de gargalos
 */
export interface BottleneckAnalysis {
  id: string                              // ID do gargalo
  location: JourneyStage                  // Localização na jornada
  type: BottleneckType                    // Tipo de gargalo
  severity: 'low' | 'medium' | 'high' | 'critical' // Severidade
  impact: BottleneckImpact                // Impacto
  rootCauses: string[]                    // Causas raiz
  affectedPatients: number                // Pacientes afetados
  timeImpact: number                      // Impacto no tempo (dias)
  revenueImpact: number                   // Impacto na receita (R$)
  recommendations: string[]               // Recomendações
  priority: number                        // Prioridade (1-10)
  estimatedResolutionTime: number         // Tempo estimado de resolução (horas)
  resolutionCost: number                  // Custo de resolução (R$)
  expectedROI: number                     // ROI esperado (%)
}

/**
 * Bottleneck Type - Tipo de gargalo
 */
export type BottleneckType = 
  | 'capacity'        // Capacidade
  | 'process'         // Processo
  | 'resource'        // Recurso
  | 'system'          // Sistema
  | 'communication'   // Comunicação
  | 'approval'        // Aprovação
  | 'scheduling'      // Agendamento
  | 'documentation'   // Documentação

/**
 * Bottleneck Impact - Impacto do gargalo
 */
export interface BottleneckImpact {
  conversionLoss: number                  // Perda de conversão (%)
  timeLoss: number                        // Perda de tempo (horas)
  revenueLoss: number                     // Perda de receita (R$)
  satisfactionImpact: number              // Impacto na satisfação (-100 a 100)
  operationalImpact: number               // Impacto operacional (-100 a 100)
}

/**
 * Improvement Opportunity - Oportunidade de melhoria
 */
export interface ImprovementOpportunity {
  id: string                              // ID da oportunidade
  title: string                           // Título
  description: string                     // Descrição
  category: OpportunityCategory           // Categoria
  impact: OpportunityImpact               // Impacto estimado
  effort: OpportunityEffort               // Esforço necessário
  priority: number                        // Prioridade (1-10)
  timeline: string                        // Timeline de implementação
  dependencies: string[]                  // Dependências
  risks: string[]                         // Riscos
  successMetrics: string[]                // Métricas de sucesso
  estimatedROI: number                    // ROI estimado (%)
  implementationCost: number              // Custo de implementação (R$)
  resourcesRequired: string[]             // Recursos necessários
}

/**
 * Opportunity Category - Categoria de oportunidade
 */
export type OpportunityCategory = 
  | 'process_optimization'    // Otimização de processo
  | 'technology_upgrade'      // Upgrade de tecnologia
  | 'staff_training'          // Treinamento de equipe
  | 'patient_experience'      // Experiência do paciente
  | 'automation'              // Automação
  | 'communication'           // Comunicação
  | 'scheduling'              // Agendamento
  | 'resource_allocation'     // Alocação de recursos

/**
 * Opportunity Impact - Impacto da oportunidade
 */
export interface OpportunityImpact {
  conversionIncrease: number              // Aumento de conversão (%)
  timeReduction: number                   // Redução de tempo (%)
  revenueIncrease: number                 // Aumento de receita (R$)
  satisfactionIncrease: number            // Aumento de satisfação (pontos)
  efficiencyGain: number                  // Ganho de eficiência (%)
}

/**
 * Opportunity Effort - Esforço da oportunidade
 */
export interface OpportunityEffort {
  duration: number                        // Duração (semanas)
  resources: number                       // Recursos necessários (pessoas)
  cost: number                            // Custo (R$)
  complexity: 'low' | 'medium' | 'high'  // Complexidade
  risk: 'low' | 'medium' | 'high'        // Risco
}

/**
 * Performance Trend - Tendência de performance
 */
export interface PerformanceTrend {
  metric: string                          // Métrica
  direction: 'up' | 'down' | 'stable'    // Direção
  strength: 'weak' | 'moderate' | 'strong' // Força da tendência
  velocity: number                        // Velocidade da mudança
  acceleration: number                    // Aceleração
  confidence: number                      // Confiança (0-100)
  seasonality: boolean                    // Sazonalidade detectada
  cyclePeriod?: number                    // Período do ciclo (dias)
  forecast: number[]                      // Previsão próximos períodos
  description: string                     // Descrição da tendência
}

/**
 * Benchmark Result - Resultado de benchmark
 */
export interface BenchmarkResult {
  metric: string                          // Métrica comparada
  currentValue: number                    // Valor atual
  benchmarkValue: number                  // Valor de benchmark
  difference: number                      // Diferença (%)
  percentile: number                      // Percentil (0-100)
  status: 'above' | 'at' | 'below'      // Status vs benchmark
  industryAverage: number                 // Média da indústria
  topPerformer: number                    // Melhor performance
  improvement: number                     // Melhoria necessária
}

/**
 * Industry Position - Posição na indústria
 */
export interface IndustryPosition {
  overallRanking: number                  // Ranking geral (percentil)
  categoryRankings: Record<string, number> // Rankings por categoria
  strengths: string[]                     // Pontos fortes
  weaknesses: string[]                    // Pontos fracos
  competitiveAdvantage: string[]          // Vantagens competitivas
  improvementAreas: string[]              // Áreas de melhoria
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche' // Posição no mercado
}

/**
 * Performance Forecast - Previsão de performance
 */
export interface PerformanceForecast {
  horizon: number                         // Horizonte (dias)
  confidence: number                      // Confiança (0-100)
  method: ForecastMethod                  // Método de previsão
  
  // Forecast Data
  predictions: Record<string, number[]>   // Previsões por métrica
  scenarios: ForecastScenario[]           // Cenários possíveis
  
  // Uncertainty
  uncertaintyBounds: Record<string, {     // Limites de incerteza
    upper: number[]
    lower: number[]
  }>
  
  // Assumptions
  assumptions: string[]                   // Premissas
  limitations: string[]                   // Limitações
  
  // Recommendations
  recommendations: string[]               // Recomendações baseadas na previsão
}

/**
 * Forecast Method - Método de previsão
 */
export type ForecastMethod = 
  | 'linear_regression'     // Regressão linear
  | 'exponential_smoothing' // Suavização exponencial
  | 'arima'                 // ARIMA
  | 'machine_learning'      // Machine Learning
  | 'ensemble'              // Ensemble de métodos

/**
 * Forecast Scenario - Cenário de previsão
 */
export interface ForecastScenario {
  name: string                            // Nome do cenário
  probability: number                     // Probabilidade (0-100)
  description: string                     // Descrição
  assumptions: string[]                   // Premissas específicas
  outcomes: Record<string, number>        // Resultados esperados
  risks: string[]                         // Riscos associados
  mitigation: string[]                    // Mitigações
}

/**
 * Data Quality Score - Score de qualidade dos dados
 */
export interface DataQualityScore {
  overall: number                         // Score geral (0-100)
  completeness: number                    // Completude (0-100)
  accuracy: number                        // Precisão (0-100)
  consistency: number                     // Consistência (0-100)
  timeliness: number                      // Pontualidade (0-100)
  validity: number                        // Validade (0-100)
  
  // Quality Issues
  missingData: number                     // Dados faltantes (%)
  inconsistencies: string[]               // Inconsistências encontradas
  outliers: number                        // Outliers detectados
  staleness: number                       // Dados antigos (horas)
  
  // Recommendations
  improvements: string[]                  // Melhorias recomendadas
}

/**
 * Performance Configuration - Configuração de performance
 */
export interface PerformanceConfig {
  // KPI Configuration
  enabledKPIs: string[]                   // KPIs habilitados
  customKPIs: KPIDefinition[]             // KPIs customizados
  
  // Analysis Settings
  defaultPeriod: PerformancePeriod        // Período padrão
  autoAnalysis: boolean                   // Análise automática
  analysisFrequency: number               // Frequência (horas)
  
  // Thresholds
  criticalThresholds: Record<string, number> // Limites críticos
  warningThresholds: Record<string, number>  // Limites de aviso
  
  // Notifications
  notificationSettings: {
    email: boolean                        // Notificações por email
    slack: boolean                        // Notificações no Slack
    dashboard: boolean                    // Notificações no dashboard
    criticalOnly: boolean                 // Apenas críticas
  }
  
  // Advanced Settings
  seasonalityDetection: boolean           // Detecção de sazonalidade
  trendAnalysis: boolean                  // Análise de tendências
  forecastEnabled: boolean                // Previsão habilitada
  benchmarkComparison: boolean            // Comparação com benchmarks
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default KPIs - KPIs padrão do sistema
 */
export const DEFAULT_KPIS: KPIDefinition[] = [
  {
    id: 'conversion_rate',
    name: 'Taxa de Conversão',
    description: 'Percentual de pacientes que completam a jornada',
    category: 'conversion',
    formula: '(Pacientes Convertidos / Total de Pacientes) * 100',
    target: 75,
    benchmark: 70,
    unit: '%',
    criticalThreshold: 50,
    warningThreshold: 60,
    trend: 'up',
    weight: 0.25
  },
  {
    id: 'average_journey_time',
    name: 'Tempo Médio de Jornada',
    description: 'Tempo médio para completar toda a jornada',
    category: 'efficiency',
    formula: 'Média(Data Fim - Data Início)',
    target: 14,
    benchmark: 21,
    unit: 'dias',
    criticalThreshold: 30,
    warningThreshold: 21,
    trend: 'down',
    weight: 0.20
  },
  {
    id: 'satisfaction_score',
    name: 'Score de Satisfação',
    description: 'Pontuação média de satisfação dos pacientes',
    category: 'satisfaction',
    formula: 'Média(Satisfaction Scores)',
    target: 4.5,
    benchmark: 4.2,
    unit: 'pontos',
    criticalThreshold: 3.5,
    warningThreshold: 4.0,
    trend: 'up',
    weight: 0.20
  },
  {
    id: 'revenue_per_journey',
    name: 'Receita por Jornada',
    description: 'Receita média gerada por jornada completa',
    category: 'financial',
    formula: 'Total de Receita / Jornadas Completas',
    target: 2500,
    benchmark: 2000,
    unit: 'R$',
    criticalThreshold: 1500,
    warningThreshold: 1800,
    trend: 'up',
    weight: 0.15
  },
  {
    id: 'time_to_value',
    name: 'Tempo para Valor',
    description: 'Tempo até o paciente perceber valor',
    category: 'operational',
    formula: 'Média(Primeiro Valor - Início)',
    target: 3,
    benchmark: 5,
    unit: 'dias',
    criticalThreshold: 10,
    warningThreshold: 7,
    trend: 'down',
    weight: 0.10
  },
  {
    id: 'nps_score',
    name: 'Net Promoter Score',
    description: 'Score de recomendação dos pacientes',
    category: 'quality',
    formula: '% Promotores - % Detratores',
    target: 70,
    benchmark: 50,
    unit: 'pontos',
    criticalThreshold: 20,
    warningThreshold: 40,
    trend: 'up',
    weight: 0.10
  }
]

/**
 * Performance Benchmarks - Benchmarks da indústria
 */
export const INDUSTRY_BENCHMARKS = {
  healthcare: {
    conversionRate: 70,
    averageJourneyTime: 21,
    satisfactionScore: 4.2,
    npsScore: 50,
    retentionRate: 85
  },
  aesthetics: {
    conversionRate: 75,
    averageJourneyTime: 14,
    satisfactionScore: 4.5,
    npsScore: 60,
    retentionRate: 90
  }
}

// ============================================================================
// MAIN CLASS
// ============================================================================

/**
 * Journey Performance Analytics Engine
 * 
 * Sistema principal de análise de performance da jornada do paciente
 */
export class JourneyPerformanceAnalytics {
  private supabase = createClient()
  private config: PerformanceConfig
  private kpis: Map<string, KPIDefinition> = new Map()

  constructor(config?: Partial<PerformanceConfig>) {
    this.config = {
      enabledKPIs: DEFAULT_KPIS.map(kpi => kpi.id),
      customKPIs: [],
      defaultPeriod: 'monthly',
      autoAnalysis: true,
      analysisFrequency: 24,
      criticalThresholds: {},
      warningThresholds: {},
      notificationSettings: {
        email: true,
        slack: false,
        dashboard: true,
        criticalOnly: false
      },
      seasonalityDetection: true,
      trendAnalysis: true,
      forecastEnabled: true,
      benchmarkComparison: true,
      ...config
    }

    this.initializeKPIs()
  }

  /**
   * Initialize KPIs - Inicializa KPIs
   */
  private initializeKPIs(): void {
    // Load default KPIs
    DEFAULT_KPIS.forEach(kpi => {
      if (this.config.enabledKPIs.includes(kpi.id)) {
        this.kpis.set(kpi.id, kpi)
      }
    })

    // Load custom KPIs
    this.config.customKPIs.forEach(kpi => {
      this.kpis.set(kpi.id, kpi)
    })

    logger.info('JourneyPerformanceAnalytics: KPIs initialized', {
      total: this.kpis.size,
      enabled: this.config.enabledKPIs.length,
      custom: this.config.customKPIs.length
    })
  }

  /**
   * Analyze Performance - Analisa performance da jornada
   */
  async analyzePerformance(
    clinicId: string,
    options: {
      period?: PerformancePeriod
      startDate?: Date
      endDate?: Date
      patientId?: string
      includeForecasting?: boolean
      includeBenchmarking?: boolean
    } = {}
  ): Promise<PerformanceAnalysis> {
    try {
      const {
        period = this.config.defaultPeriod,
        startDate = this.getDefaultStartDate(period),
        endDate = new Date(),
        patientId,
        includeForecasting = this.config.forecastEnabled,
        includeBenchmarking = this.config.benchmarkComparison
      } = options

      logger.info('JourneyPerformanceAnalytics: Starting performance analysis', {
        clinicId,
        period,
        startDate,
        endDate,
        patientId
      })

      // Calculate performance metrics
      const metrics = await this.calculatePerformanceMetrics(
        clinicId,
        startDate,
        endDate,
        patientId
      )

      // Calculate KPI results
      const kpis = await this.calculateKPIResults(
        clinicId,
        metrics,
        startDate,
        endDate
      )

      // Identify bottlenecks
      const bottlenecks = await this.identifyBottlenecks(
        clinicId,
        startDate,
        endDate,
        patientId
      )

      // Find improvement opportunities
      const opportunities = await this.findImprovementOpportunities(
        metrics,
        bottlenecks,
        kpis
      )

      // Analyze trends
      const trends = await this.analyzeTrends(
        clinicId,
        startDate,
        endDate,
        period
      )

      // Benchmark comparison (if enabled)
      const benchmarkComparison = includeBenchmarking 
        ? await this.performBenchmarkComparison(metrics, 'aesthetics')
        : []

      const industryPosition = includeBenchmarking
        ? await this.calculateIndustryPosition(metrics, benchmarkComparison)
        : this.getDefaultIndustryPosition()

      // Performance forecasting (if enabled)
      const forecast = includeForecasting
        ? await this.generatePerformanceForecast(clinicId, metrics, trends)
        : this.getDefaultForecast()

      // Assess data quality
      const dataQuality = await this.assessDataQuality(
        clinicId,
        startDate,
        endDate
      )

      const analysis: PerformanceAnalysis = {
        id: `perf_${clinicId}_${Date.now()}`,
        patientId,
        clinicId,
        period,
        startDate,
        endDate,
        metrics,
        kpis,
        bottlenecks,
        opportunities,
        trends,
        benchmarkComparison,
        industryPosition,
        forecast,
        confidence: this.calculateAnalysisConfidence(dataQuality, metrics),
        dataQuality,
        calculatedAt: new Date(),
        version: '1.0.0'
      }

      // Store analysis result
      await this.storeAnalysisResult(analysis)

      logger.info('JourneyPerformanceAnalytics: Analysis completed', {
        analysisId: analysis.id,
        confidence: analysis.confidence,
        kpiCount: kpis.length,
        bottleneckCount: bottlenecks.length,
        opportunityCount: opportunities.length
      })

      return analysis

    } catch (error) {
      logger.error('JourneyPerformanceAnalytics: Analysis failed', {
        error: error.message,
        clinicId,
        options
      })
      throw error
    }
  }

  /**
   * Calculate Performance Metrics - Calcula métricas de performance
   */
  private async calculatePerformanceMetrics(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    patientId?: string
  ): Promise<PerformanceMetrics> {
    try {
      // Base query
      let query = this.supabase
        .from('patient_journeys')
        .select(`
          *,
          patient:patients(*),
          stages:journey_stages(*),
          events:journey_events(*)
        `)
        .eq('clinic_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (patientId) {
        query = query.eq('patient_id', patientId)
      }

      const { data: journeys, error } = await query

      if (error) throw error

      // Calculate core metrics
      const totalJourneys = journeys?.length || 0
      const completedJourneys = journeys?.filter(j => j.status === 'completed').length || 0
      const droppedJourneys = journeys?.filter(j => j.status === 'dropped').length || 0

      const conversionRate = totalJourneys > 0 ? (completedJourneys / totalJourneys) * 100 : 0
      const completionRate = totalJourneys > 0 ? (completedJourneys / totalJourneys) * 100 : 0
      const dropoffRate = totalJourneys > 0 ? (droppedJourneys / totalJourneys) * 100 : 0

      // Calculate journey times
      const journeyTimes = journeys
        ?.filter(j => j.completed_at)
        .map(j => {
          const start = new Date(j.started_at)
          const end = new Date(j.completed_at)
          return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) // days
        }) || []

      const averageJourneyTime = journeyTimes.length > 0
        ? journeyTimes.reduce((sum, time) => sum + time, 0) / journeyTimes.length
        : 0

      // Calculate stage metrics
      const stageConversions: Record<string, number> = {}
      const stageDurations: Record<string, number> = {}
      const stageDropoffs: Record<string, number> = {}

      journeys?.forEach(journey => {
        journey.stages?.forEach((stage: any) => {
          const stageName = stage.stage_name
          
          // Conversions
          if (!stageConversions[stageName]) stageConversions[stageName] = 0
          if (stage.status === 'completed') stageConversions[stageName]++

          // Durations
          if (!stageDurations[stageName]) stageDurations[stageName] = 0
          if (stage.duration_minutes) {
            stageDurations[stageName] += stage.duration_minutes / (60 * 24) // days
          }

          // Dropoffs
          if (!stageDropoffs[stageName]) stageDropoffs[stageName] = 0
          if (stage.status === 'dropped') stageDropoffs[stageName]++
        })
      })

      // Calculate financial metrics
      const revenueData = await this.calculateRevenueMetrics(clinicId, startDate, endDate)
      const satisfactionData = await this.calculateSatisfactionMetrics(clinicId, startDate, endDate)

      const metrics: PerformanceMetrics = {
        // Core Performance
        conversionRate,
        averageJourneyTime,
        completionRate,
        dropoffRate,

        // Stage Performance
        stageConversions,
        stageDurations,
        stageDropoffs,

        // Efficiency Metrics
        efficiencyScore: this.calculateEfficiencyScore(conversionRate, averageJourneyTime),
        timeToValue: await this.calculateTimeToValue(clinicId, startDate, endDate),
        resourceUtilization: await this.calculateResourceUtilization(clinicId, startDate, endDate),

        // Financial Metrics
        revenuePerJourney: revenueData.revenuePerJourney,
        costPerAcquisition: revenueData.costPerAcquisition,
        lifetimeValue: revenueData.lifetimeValue,
        roi: revenueData.roi,

        // Quality Metrics
        satisfactionScore: satisfactionData.averageScore,
        npsScore: satisfactionData.npsScore,
        retentionRate: satisfactionData.retentionRate,

        // Temporal Data
        calculatedAt: new Date(),
        period: this.config.defaultPeriod
      }

      return metrics

    } catch (error) {
      logger.error('JourneyPerformanceAnalytics: Failed to calculate metrics', {
        error: error.message,
        clinicId
      })
      throw error
    }
  }

  /**
   * Calculate KPI Results - Calcula resultados dos KPIs
   */
  private async calculateKPIResults(
    clinicId: string,
    metrics: PerformanceMetrics,
    startDate: Date,
    endDate: Date
  ): Promise<KPIResult[]> {
    const results: KPIResult[] = []

    for (const [kpiId, kpi] of this.kpis) {
      try {
        const currentValue = this.extractMetricValue(metrics, kpiId)
        const previousValue = await this.getPreviousKPIValue(clinicId, kpiId, startDate)
        
        const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
        const changeDirection = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
        
        const status = this.determineKPIStatus(currentValue, kpi)
        const achievementRate = (currentValue / kpi.target) * 100
        
        const trendData = await this.getKPITrendData(clinicId, kpiId, 12) // last 12 periods
        const insights = this.generateKPIInsights(kpi, currentValue, change, status)

        results.push({
          kpi,
          value: currentValue,
          previousValue,
          change,
          changeDirection,
          status,
          achievementRate,
          trendData,
          insights
        })

      } catch (error) {
        logger.error('JourneyPerformanceAnalytics: Failed to calculate KPI', {
          kpiId,
          error: error.message
        })
      }
    }

    return results
  }

  /**
   * Identify Bottlenecks - Identifica gargalos
   */
  private async identifyBottlenecks(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    patientId?: string
  ): Promise<BottleneckAnalysis[]> {
    const bottlenecks: BottleneckAnalysis[] = []

    try {
      // Analyze stage performance for bottlenecks
      const stageAnalysis = await this.analyzeStageBottlenecks(clinicId, startDate, endDate)
      bottlenecks.push(...stageAnalysis)

      // Analyze resource bottlenecks
      const resourceAnalysis = await this.analyzeResourceBottlenecks(clinicId, startDate, endDate)
      bottlenecks.push(...resourceAnalysis)

      // Analyze process bottlenecks
      const processAnalysis = await this.analyzeProcessBottlenecks(clinicId, startDate, endDate)
      bottlenecks.push(...processAnalysis)

      // Sort by priority
      bottlenecks.sort((a, b) => b.priority - a.priority)

      return bottlenecks

    } catch (error) {
      logger.error('JourneyPerformanceAnalytics: Failed to identify bottlenecks', {
        error: error.message,
        clinicId
      })
      return []
    }
  }

  /**
   * Find Improvement Opportunities - Encontra oportunidades de melhoria
   */
  private async findImprovementOpportunities(
    metrics: PerformanceMetrics,
    bottlenecks: BottleneckAnalysis[],
    kpis: KPIResult[]
  ): Promise<ImprovementOpportunity[]> {
    const opportunities: ImprovementOpportunity[] = []

    try {
      // Opportunities from bottlenecks
      bottlenecks.forEach(bottleneck => {
        if (bottleneck.severity === 'high' || bottleneck.severity === 'critical') {
          opportunities.push(this.createBottleneckOpportunity(bottleneck))
        }
      })

      // Opportunities from underperforming KPIs
      kpis.forEach(kpi => {
        if (kpi.status === 'warning' || kpi.status === 'critical') {
          opportunities.push(this.createKPIOpportunity(kpi))
        }
      })

      // Opportunities from metric analysis
      const metricOpportunities = this.analyzeMetricOpportunities(metrics)
      opportunities.push(...metricOpportunities)

      // Sort by ROI and priority
      opportunities.sort((a, b) => {
        const aScore = a.estimatedROI * a.priority
        const bScore = b.estimatedROI * b.priority
        return bScore - aScore
      })

      return opportunities.slice(0, 10) // Top 10 opportunities

    } catch (error) {
      logger.error('JourneyPerformanceAnalytics: Failed to find opportunities', {
        error: error.message
      })
      return []
    }
  }

  /**
   * Analyze Trends - Analisa tendências
   */
  private async analyzeTrends(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    period: PerformancePeriod
  ): Promise<PerformanceTrend[]> {
    const trends: PerformanceTrend[] = []

    try {
      const metrics = ['conversion_rate', 'average_journey_time', 'satisfaction_score', 'revenue_per_journey']

      for (const metric of metrics) {
        const trendData = await this.getMetricTrendData(clinicId, metric, period, 24) // 24 periods
        
        if (trendData.length >= 3) {
          const trend = this.calculateTrend(trendData)
          trends.push(trend)
        }
      }

      return trends

    } catch (error) {
      logger.error('JourneyPerformanceAnalytics: Failed to analyze trends', {
        error: error.message,
        clinicId
      })
      return []
    }
  }

  /**
   * Perform Benchmark Comparison - Realiza comparação com benchmarks
   */
  private async performBenchmarkComparison(
    metrics: PerformanceMetrics,
    industry: 'healthcare' | 'aesthetics'
  ): Promise<BenchmarkResult[]> {
    const benchmarks = INDUSTRY_BENCHMARKS[industry]
    const results: BenchmarkResult[] = []

    const metricMappings = {
      conversionRate: 'conversionRate',
      averageJourneyTime: 'averageJourneyTime',
      satisfactionScore: 'satisfactionScore',
      npsScore: 'npsScore',
      retentionRate: 'retentionRate'
    }

    for (const [metricKey, benchmarkKey] of Object.entries(metricMappings)) {
      const currentValue = (metrics as any)[metricKey]
      const benchmarkValue = (benchmarks as any)[benchmarkKey]

      if (currentValue !== undefined && benchmarkValue !== undefined) {
        const difference = ((currentValue - benchmarkValue) / benchmarkValue) * 100
        const status = currentValue > benchmarkValue ? 'above' : 
                      currentValue === benchmarkValue ? 'at' : 'below'

        results.push({
          metric: metricKey,
          currentValue,
          benchmarkValue,
          difference,
          percentile: this.calculatePercentile(currentValue, benchmarkValue),
          status,
          industryAverage: benchmarkValue,
          topPerformer: benchmarkValue * 1.3, // Estimated top performer
          improvement: status === 'below' ? benchmarkValue - currentValue : 0
        })
      }
    }

    return results
  }

  /**
   * Generate Performance Forecast - Gera previsão de performance
   */
  private async generatePerformanceForecast(
    clinicId: string,
    metrics: PerformanceMetrics,
    trends: PerformanceTrend[]
  ): Promise<PerformanceForecast> {
    try {
      const horizon = 90 // 90 days
      const predictions: Record<string, number[]> = {}
      const uncertaintyBounds: Record<string, { upper: number[], lower: number[] }> = {}

      // Generate predictions for key metrics
      const keyMetrics = ['conversionRate', 'averageJourneyTime', 'satisfactionScore']
      
      for (const metric of keyMetrics) {
        const trend = trends.find(t => t.metric === metric)
        const currentValue = (metrics as any)[metric]
        
        if (trend && currentValue) {
          const forecast = this.generateMetricForecast(currentValue, trend, horizon)
          predictions[metric] = forecast.values
          uncertaintyBounds[metric] = forecast.bounds
        }
      }

      // Create scenarios
      const scenarios: ForecastScenario[] = [
        {
          name: 'Otimista',
          probability: 25,
          description: 'Cenário com melhorias significativas',
          assumptions: ['Implementação de todas as melhorias', 'Sem eventos disruptivos'],
          outcomes: {
            conversionRate: metrics.conversionRate * 1.15,
            satisfactionScore: Math.min(metrics.satisfactionScore * 1.1, 5.0)
          },
          risks: ['Sobre-expectativa', 'Recursos insuficientes'],
          mitigation: ['Planejamento realista', 'Monitoramento contínuo']
        },
        {
          name: 'Realista',
          probability: 50,
          description: 'Cenário mais provável baseado em tendências',
          assumptions: ['Manutenção das tendências atuais', 'Melhorias graduais'],
          outcomes: {
            conversionRate: metrics.conversionRate * 1.05,
            satisfactionScore: metrics.satisfactionScore * 1.02
          },
          risks: ['Estagnação', 'Concorrência'],
          mitigation: ['Inovação contínua', 'Foco no cliente']
        },
        {
          name: 'Pessimista',
          probability: 25,
          description: 'Cenário com desafios significativos',
          assumptions: ['Desafios econômicos', 'Aumento da concorrência'],
          outcomes: {
            conversionRate: metrics.conversionRate * 0.95,
            satisfactionScore: metrics.satisfactionScore * 0.98
          },
          risks: ['Perda de market share', 'Redução de receita'],
          mitigation: ['Diferenciação', 'Eficiência operacional']
        }
      ]

      return {
        horizon,
        confidence: this.calculateForecastConfidence(trends),
        method: 'ensemble',
        predictions,
        scenarios,
        uncertaintyBounds,
        assumptions: [
          'Manutenção das condições atuais de mercado',
          'Disponibilidade de recursos necessários',
          'Execução efetiva das melhorias planejadas'
        ],
        limitations: [
          'Eventos imprevisiveis não são considerados',
          'Mudanças regulatórias podem afetar previsões',
          'Precisão diminui com o tempo'
        ],
        recommendations: this.generateForecastRecommendations(scenarios, trends)
      }

    } catch (error) {
      logger.error('JourneyPerformanceAnalytics: Failed to generate forecast', {
        error: error.message,
        clinicId
      })
      return this.getDefaultForecast()
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get Default Start Date - Obtém data inicial padrão
   */
  private getDefaultStartDate(period: PerformancePeriod): Date {
    const now = new Date()
    const startDate = new Date(now)

    switch (period) {
      case 'daily':
        startDate.setDate(now.getDate() - 1)
        break
      case 'weekly':
        startDate.setDate(now.getDate() - 7)
        break
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarterly':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    return startDate
  }

  /**
   * Calculate Efficiency Score - Calcula score de eficiência
   */
  private calculateEfficiencyScore(conversionRate: number, averageJourneyTime: number): number {
    // Normalize metrics (0-100 scale)
    const normalizedConversion = Math.min(conversionRate, 100)
    const normalizedTime = Math.max(0, 100 - (averageJourneyTime / 30 * 100)) // 30 days as benchmark
    
    // Weighted average
    return (normalizedConversion * 0.6 + normalizedTime * 0.4)
  }

  /**
   * Extract Metric Value - Extrai valor da métrica
   */
  private extractMetricValue(metrics: PerformanceMetrics, kpiId: string): number {
    const metricMap: Record<string, keyof PerformanceMetrics> = {
      'conversion_rate': 'conversionRate',
      'average_journey_time': 'averageJourneyTime',
      'satisfaction_score': 'satisfactionScore',
      'revenue_per_journey': 'revenuePerJourney',
      'time_to_value': 'timeToValue',
      'nps_score': 'npsScore'
    }

    const metricKey = metricMap[kpiId]
    return metricKey ? metrics[metricKey] as number : 0
  }

  /**
   * Determine KPI Status - Determina status do KPI
   */
  private determineKPIStatus(value: number, kpi: KPIDefinition): KPIStatus {
    if (value >= kpi.target) return 'excellent'
    if (value >= kpi.warningThreshold) return 'good'
    if (value >= kpi.criticalThreshold) return 'warning'
    return 'critical'
  }

  /**
   * Generate KPI Insights - Gera insights do KPI
   */
  private generateKPIInsights(
    kpi: KPIDefinition,
    value: number,
    change: number,
    status: KPIStatus
  ): string[] {
    const insights: string[] = []

    // Status insights
    if (status === 'excellent') {
      insights.push(`${kpi.name} está superando a meta em ${((value / kpi.target - 1) * 100).toFixed(1)}%`)
    } else if (status === 'critical') {
      insights.push(`${kpi.name} está ${((1 - value / kpi.target) * 100).toFixed(1)}% abaixo da meta crítica`)
    }

    // Change insights
    if (Math.abs(change) > 10) {
      const direction = change > 0 ? 'aumento' : 'redução'
      insights.push(`${direction} significativo de ${Math.abs(change).toFixed(1)}% em relação ao período anterior`)
    }

    // Benchmark insights
    if (value < kpi.benchmark) {
      insights.push(`Abaixo do benchmark da indústria (${kpi.benchmark} ${kpi.unit})`)
    }

    return insights
  }

  /**
   * Calculate Analysis Confidence - Calcula confiança da análise
   */
  private calculateAnalysisConfidence(
    dataQuality: DataQualityScore,
    metrics: PerformanceMetrics
  ): number {
    // Base confidence from data quality
    let confidence = dataQuality.overall

    // Adjust based on data volume (more data = higher confidence)
    // This would need actual data volume metrics in a real implementation

    // Adjust based on metric consistency
    // This would check for outliers and inconsistencies

    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * Store Analysis Result - Armazena resultado da análise
   */
  private async storeAnalysisResult(analysis: PerformanceAnalysis): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('journey_performance_analyses')
        .insert({
          id: analysis.id,
          clinic_id: analysis.clinicId,
          patient_id: analysis.patientId,
          period: analysis.period,
          start_date: analysis.startDate.toISOString(),
          end_date: analysis.endDate.toISOString(),
          metrics: analysis.metrics,
          kpis: analysis.kpis,
          bottlenecks: analysis.bottlenecks,
          opportunities: analysis.opportunities,
          trends: analysis.trends,
          benchmark_comparison: analysis.benchmarkComparison,
          industry_position: analysis.industryPosition,
          forecast: analysis.forecast,
          confidence: analysis.confidence,
          data_quality: analysis.dataQuality,
          calculated_at: analysis.calculatedAt.toISOString(),
          version: analysis.version
        })

      if (error) throw error

    } catch (error) {
      logger.error('JourneyPerformanceAnalytics: Failed to store analysis', {
        error: error.message,
        analysisId: analysis.id
      })
    }
  }

  /**
   * Get Default Industry Position - Posição padrão na indústria
   */
  private getDefaultIndustryPosition(): IndustryPosition {
    return {
      overallRanking: 50,
      categoryRankings: {},
      strengths: [],
      weaknesses: [],
      competitiveAdvantage: [],
      improvementAreas: [],
      marketPosition: 'follower'
    }
  }

  /**
   * Get Default Forecast - Previsão padrão
   */
  private getDefaultForecast(): PerformanceForecast {
    return {
      horizon: 30,
      confidence: 50,
      method: 'linear_regression',
      predictions: {},
      scenarios: [],
      uncertaintyBounds: {},
      assumptions: [],
      limitations: [],
      recommendations: []
    }
  }

  // Additional helper methods would be implemented here for:
  // - calculateRevenueMetrics()
  // - calculateSatisfactionMetrics()
  // - calculateTimeToValue()
  // - calculateResourceUtilization()
  // - getPreviousKPIValue()
  // - getKPITrendData()
  // - analyzeStageBottlenecks()
  // - analyzeResourceBottlenecks()
  // - analyzeProcessBottlenecks()
  // - createBottleneckOpportunity()
  // - createKPIOpportunity()
  // - analyzeMetricOpportunities()
  // - getMetricTrendData()
  // - calculateTrend()
  // - calculatePercentile()
  // - calculateIndustryPosition()
  // - generateMetricForecast()
  // - calculateForecastConfidence()
  // - generateForecastRecommendations()
  // - assessDataQuality()

}

// ============================================================================
// EXPORTS
// ============================================================================

export default JourneyPerformanceAnalytics

/**
 * Create Journey Performance Analytics Instance
 */
export function createJourneyPerformanceAnalytics(
  config?: Partial<PerformanceConfig>
): JourneyPerformanceAnalytics {
  return new JourneyPerformanceAnalytics(config)
}

/**
 * Performance Analytics Utility Functions
 */
export const PerformanceUtils = {
  /**
   * Format Performance Metric
   */
  formatMetric: (value: number, unit: string): string => {
    switch (unit) {
      case '%':
        return `${value.toFixed(1)}%`
      case 'R$':
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      case 'dias':
        return `${value.toFixed(1)} dias`
      case 'pontos':
        return `${value.toFixed(1)} pontos`
      default:
        return value.toFixed(2)
    }
  },

  /**
   * Get KPI Status Color
   */
  getKPIStatusColor: (status: KPIStatus): string => {
    const colors = {
      excellent: '#10B981', // green
      good: '#3B82F6',      // blue
      warning: '#F59E0B',   // yellow
      critical: '#EF4444',  // red
      unknown: '#6B7280'    // gray
    }
    return colors[status]
  },

  /**
   * Calculate Improvement Priority
   */
  calculatePriority: (impact: number, effort: number): number => {
    // Priority = Impact / Effort (with some normalization)
    return Math.min(10, Math.max(1, (impact / effort) * 5))
  }
}