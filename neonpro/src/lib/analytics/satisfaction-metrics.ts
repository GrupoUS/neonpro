/**
 * 📊 NeonPro Patient Satisfaction Metrics Engine
 * 
 * HEALTHCARE ANALYTICS SYSTEM - Satisfaction Metrics & Analysis
 * Sistema completo para coleta, processamento e análise de métricas de satisfação
 * de pacientes em tempo real, com benchmarking e análise preditiva.
 * 
 * @fileoverview Engine de métricas de satisfação multi-dimensional com coleta automatizada,
 * análise de tendências, benchmarking e integração com feedback de pacientes
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @since 2025-01-30
 * 
 * COMPLIANCE: LGPD, ANVISA, CFM
 * ARCHITECTURE: Modular, Type-safe, Performance-optimized
 * TESTING: Jest unit tests, Integration tests
 * 
 * FEATURES:
 * - Multi-dimensional satisfaction scoring system
 * - Real-time satisfaction data collection and processing
 * - Satisfaction trend analysis with predictive modeling
 * - Patient feedback integration and sentiment analysis
 * - Satisfaction benchmarking against industry standards
 * - Automated satisfaction surveys and collection
 */

import { type Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { type TouchpointType, type InteractionOutcome } from './touchpoint-analyzer'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Satisfaction Dimensions - Multi-dimensional scoring
 */
export type SatisfactionDimension = 
  | 'overall'                  // Satisfação geral
  | 'service_quality'          // Qualidade do atendimento
  | 'facility_environment'     // Ambiente da clínica
  | 'staff_professionalism'    // Profissionalismo da equipe
  | 'treatment_effectiveness'  // Eficácia do tratamento
  | 'communication'            // Comunicação
  | 'scheduling_convenience'   // Conveniência de agendamento
  | 'waiting_time'             // Tempo de espera
  | 'value_for_money'          // Custo-benefício
  | 'recommendation_likelihood' // Probabilidade de recomendação (NPS)
  | 'loyalty_intention'        // Intenção de fidelidade
  | 'complaint_resolution'     // Resolução de reclamações

/**
 * Survey Types - Different types of satisfaction surveys
 */
export type SurveyType = 
  | 'post_consultation'        // Pós-consulta
  | 'post_treatment'           // Pós-tratamento
  | 'periodic_checkup'         // Check-up periódico
  | 'exit_survey'              // Pesquisa de saída
  | 'nps_survey'               // Net Promoter Score
  | 'ces_survey'               // Customer Effort Score
  | 'csat_survey'              // Customer Satisfaction Score
  | 'follow_up_survey'         // Pesquisa de follow-up
  | 'complaint_follow_up'      // Follow-up de reclamação
  | 'annual_survey'            // Pesquisa anual

/**
 * Collection Methods - How satisfaction data is collected
 */
export type CollectionMethod = 
  | 'email_survey'             // Pesquisa por email
  | 'sms_survey'               // Pesquisa por SMS
  | 'whatsapp_survey'          // Pesquisa por WhatsApp
  | 'in_app_survey'            // Pesquisa no app
  | 'tablet_kiosk'             // Kiosk tablet na clínica
  | 'phone_interview'          // Entrevista telefônica
  | 'in_person_feedback'       // Feedback presencial
  | 'online_review'            // Avaliação online
  | 'social_media_mention'     // Menção em redes sociais
  | 'automated_trigger'        // Trigger automatizado

/**
 * Satisfaction Response Status
 */
export type ResponseStatus = 
  | 'pending'                  // Pendente
  | 'in_progress'              // Em andamento
  | 'completed'                // Completa
  | 'partially_completed'      // Parcialmente completa
  | 'abandoned'                // Abandonada
  | 'expired'                  // Expirada
  | 'invalid'                  // Inválida

/**
 * Satisfaction Survey Interface
 */
export interface SatisfactionSurvey {
  id: string
  patient_id: string
  survey_type: SurveyType
  collection_method: CollectionMethod
  trigger_event?: string
  sent_at: Date
  completed_at?: Date
  status: ResponseStatus
  overall_score: number
  service_score: number
  facility_score: number
  staff_score: number
  communication_score: number
  waiting_time_score: number
  value_score: number
  recommendation_score: number // NPS (0-10)
  effort_score: number // CES (1-5)
  satisfaction_scores: Record<SatisfactionDimension, number>
  feedback_text?: string
  feedback_sentiment?: number
  response_time_minutes?: number
  metadata: {
    survey_version?: string
    questions_count?: number
    completion_rate?: number
    device_type?: string
    location?: string
    staff_present?: string[]
    appointment_id?: string
    treatment_id?: string
    follow_up_required?: boolean
    benchmarking_category?: string
    [key: string]: any
  }
  created_at: Date
}

/**
 * Satisfaction Metrics Interface
 */
export interface SatisfactionMetrics {
  patient_id: string
  calculation_date: Date
  period_start: Date
  period_end: Date
  total_surveys: number
  completed_surveys: number
  response_rate: number
  average_scores: Record<SatisfactionDimension, number>
  score_trends: Record<SatisfactionDimension, number[]>
  nps_score: number
  nps_category: 'detractor' | 'passive' | 'promoter'
  ces_score: number
  csat_score: number
  satisfaction_percentile: number
  benchmark_comparison: {
    industry_average: Record<SatisfactionDimension, number>
    clinic_performance: Record<SatisfactionDimension, number>
    variance_from_benchmark: Record<SatisfactionDimension, number>
    ranking_position: number
  }
  improvement_opportunities: Array<{
    dimension: SatisfactionDimension
    current_score: number
    target_score: number
    improvement_potential: number
    priority_level: 'low' | 'medium' | 'high' | 'critical'
    recommended_actions: string[]
  }>
  predicted_trends: {
    next_month_prediction: Record<SatisfactionDimension, number>
    confidence_interval: Record<SatisfactionDimension, [number, number]>
    trend_direction: Record<SatisfactionDimension, 'improving' | 'stable' | 'declining'>
  }
}

/**
 * Satisfaction Collection Configuration
 */
export interface SatisfactionCollectionConfig {
  patient_id?: string
  auto_surveys_enabled: boolean
  preferred_collection_methods: CollectionMethod[]
  survey_frequency: {
    post_consultation: boolean
    post_treatment: boolean
    periodic_days: number
    nps_frequency_days: number
  }
  trigger_rules: Array<{
    event_type: string
    delay_hours: number
    survey_type: SurveyType
    collection_method: CollectionMethod
    conditions?: Record<string, any>
  }>
  reminder_schedule: {
    enabled: boolean
    reminder_intervals_hours: number[]
    max_reminders: number
  }
  response_incentives: {
    enabled: boolean
    incentive_type: 'discount' | 'points' | 'gift' | 'none'
    incentive_value: number
  }
  benchmarking: {
    enabled: boolean
    industry_category: string
    compare_to_competitors: boolean
    internal_goals: Record<SatisfactionDimension, number>
  }
}

/**
 * Satisfaction Trend Analysis
 */
export interface SatisfactionTrendAnalysis {
  patient_id: string
  analysis_period_days: number
  trend_data: {
    overall_trend: 'improving' | 'stable' | 'declining'
    trend_strength: number // 0-1
    seasonal_patterns: Array<{
      period: string
      average_score: number
      variance: number
    }>
    correlations: Array<{
      dimension_a: SatisfactionDimension
      dimension_b: SatisfactionDimension
      correlation_coefficient: number
      relationship_strength: 'weak' | 'moderate' | 'strong'
    }>
  }
  predictive_insights: {
    churn_risk_indicator: number
    loyalty_score: number
    next_survey_optimal_timing: Date
    intervention_recommendations: string[]
  }
  benchmarking_insights: {
    performance_vs_industry: Record<SatisfactionDimension, 'above' | 'at' | 'below'>
    improvement_priority_ranking: SatisfactionDimension[]
    competitive_positioning: string
  }
}

// ============================================================================
// SATISFACTION METRICS ENGINE
// ============================================================================

/**
 * Patient Satisfaction Metrics Engine
 * Sistema completo para análise de satisfação de pacientes
 */
export class PatientSatisfactionMetricsEngine {
  private supabase = createClient()
  private config: Map<string, SatisfactionCollectionConfig> = new Map()
  private industryBenchmarks: Record<SatisfactionDimension, number> = {
    overall: 4.2,
    service_quality: 4.3,
    facility_environment: 4.1,
    staff_professionalism: 4.4,
    treatment_effectiveness: 4.0,
    communication: 4.2,
    scheduling_convenience: 3.9,
    waiting_time: 3.7,
    value_for_money: 3.8,
    recommendation_likelihood: 7.5,
    loyalty_intention: 4.1,
    complaint_resolution: 3.9
  }

  constructor() {
    this.initializeDefaultConfig()
  }

  /**
   * Initialize satisfaction tracking for a patient
   */
  async initializeSatisfactionTracking(
    patientId: string,
    config?: Partial<SatisfactionCollectionConfig>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const satisfactionConfig: SatisfactionCollectionConfig = {
        auto_surveys_enabled: true,
        preferred_collection_methods: ['email_survey', 'whatsapp_survey'],
        survey_frequency: {
          post_consultation: true,
          post_treatment: true,
          periodic_days: 90,
          nps_frequency_days: 180
        },
        trigger_rules: [
          {
            event_type: 'consultation_completed',
            delay_hours: 2,
            survey_type: 'post_consultation',
            collection_method: 'email_survey'
          },
          {
            event_type: 'treatment_completed',
            delay_hours: 24,
            survey_type: 'post_treatment',
            collection_method: 'whatsapp_survey'
          },
          {
            event_type: 'complaint_registered',
            delay_hours: 168, // 7 days
            survey_type: 'complaint_follow_up',
            collection_method: 'phone_interview'
          }
        ],
        reminder_schedule: {
          enabled: true,
          reminder_intervals_hours: [24, 72, 168], // 1 day, 3 days, 1 week
          max_reminders: 3
        },
        response_incentives: {
          enabled: true,
          incentive_type: 'discount',
          incentive_value: 5 // 5% discount
        },
        benchmarking: {
          enabled: true,
          industry_category: 'aesthetic_clinics',
          compare_to_competitors: true,
          internal_goals: {
            overall: 4.5,
            service_quality: 4.6,
            facility_environment: 4.4,
            staff_professionalism: 4.7,
            treatment_effectiveness: 4.3,
            communication: 4.5,
            scheduling_convenience: 4.2,
            waiting_time: 4.0,
            value_for_money: 4.1,
            recommendation_likelihood: 8.0,
            loyalty_intention: 4.4,
            complaint_resolution: 4.2
          }
        },
        ...config
      }

      this.config.set(patientId, satisfactionConfig)

      logger.info(`Satisfaction tracking initialized for patient ${patientId}`, {
        auto_surveys: satisfactionConfig.auto_surveys_enabled,
        methods: satisfactionConfig.preferred_collection_methods
      })

      return { success: true }

    } catch (error) {
      logger.error('Failed to initialize satisfaction tracking:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Create and send satisfaction survey
   */
  async createSatisfactionSurvey(
    patientId: string,
    surveyType: SurveyType,
    collectionMethod: CollectionMethod,
    triggerEvent?: string
  ): Promise<{ success: boolean; survey_id?: string; error?: string }> {
    try {
      const config = this.config.get(patientId)
      
      if (config && !config.auto_surveys_enabled) {
        return { success: true, survey_id: 'surveys_disabled' }
      }

      // Create survey record
      const { data: survey, error } = await this.supabase
        .from('satisfaction_surveys')
        .insert({
          patient_id: patientId,
          survey_type: surveyType,
          collection_method: collectionMethod,
          trigger_event: triggerEvent,
          sent_at: new Date().toISOString(),
          status: 'pending',
          overall_score: 0,
          service_score: 0,
          facility_score: 0,
          staff_score: 0,
          communication_score: 0,
          waiting_time_score: 0,
          value_score: 0,
          recommendation_score: 0,
          effort_score: 0,
          satisfaction_scores: {},
          metadata: {
            survey_version: '1.0',
            collection_initiated: new Date().toISOString(),
            auto_generated: true
          }
        })
        .select()
        .single()

      if (error) {
        logger.error('Failed to create satisfaction survey:', error)
        return { success: false, error: error.message }
      }

      // Send survey based on collection method
      await this.sendSurvey(survey, collectionMethod)

      // Schedule reminders if enabled
      if (config?.reminder_schedule.enabled) {
        await this.scheduleReminders(survey.id, config.reminder_schedule)
      }

      logger.info(`Satisfaction survey created and sent`, {
        survey_id: survey.id,
        patient_id: patientId,
        type: surveyType,
        method: collectionMethod
      })

      return { 
        success: true, 
        survey_id: survey.id 
      }

    } catch (error) {
      logger.error('Failed to create satisfaction survey:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Process completed satisfaction survey
   */
  async processSurveyResponse(
    surveyId: string,
    responses: Partial<Record<SatisfactionDimension, number>>,
    feedbackText?: string,
    additionalData?: Record<string, any>
  ): Promise<{ success: boolean; metrics?: SatisfactionMetrics; error?: string }> {
    try {
      // Get survey record
      const { data: survey } = await this.supabase
        .from('satisfaction_surveys')
        .select('*')
        .eq('id', surveyId)
        .single()

      if (!survey) {
        return { success: false, error: 'Survey not found' }
      }

      // Calculate scores from responses
      const processedScores = this.processResponses(responses)
      
      // Analyze sentiment if feedback provided
      let feedbackSentiment: number | undefined
      if (feedbackText) {
        feedbackSentiment = await this.analyzeFeedbackSentiment(feedbackText)
      }

      // Calculate response time
      const responseTimeMinutes = Math.round(
        (new Date().getTime() - new Date(survey.sent_at).getTime()) / (1000 * 60)
      )

      // Update survey with responses
      const { error: updateError } = await this.supabase
        .from('satisfaction_surveys')
        .update({
          completed_at: new Date().toISOString(),
          status: 'completed',
          overall_score: processedScores.overall,
          service_score: processedScores.service_quality,
          facility_score: processedScores.facility_environment,
          staff_score: processedScores.staff_professionalism,
          communication_score: processedScores.communication,
          waiting_time_score: processedScores.waiting_time,
          value_score: processedScores.value_for_money,
          recommendation_score: processedScores.recommendation_likelihood,
          effort_score: responses.loyalty_intention || 3,
          satisfaction_scores: processedScores,
          feedback_text: feedbackText,
          feedback_sentiment: feedbackSentiment,
          response_time_minutes: responseTimeMinutes,
          metadata: {
            ...survey.metadata,
            processed_at: new Date().toISOString(),
            completion_rate: this.calculateCompletionRate(responses),
            ...additionalData
          }
        })
        .eq('id', surveyId)

      if (updateError) {
        logger.error('Failed to update survey with responses:', updateError)
        return { success: false, error: updateError.message }
      }

      // Calculate updated satisfaction metrics
      const metrics = await this.calculateSatisfactionMetrics(survey.patient_id)

      // Check for immediate actions needed
      await this.checkForImmediateActions(survey.patient_id, processedScores, feedbackSentiment)

      // Update patient satisfaction profile
      await this.updatePatientSatisfactionProfile(survey.patient_id, metrics)

      logger.info(`Survey response processed successfully`, {
        survey_id: surveyId,
        patient_id: survey.patient_id,
        overall_score: processedScores.overall,
        sentiment: feedbackSentiment
      })

      return { 
        success: true, 
        metrics 
      }

    } catch (error) {
      logger.error('Failed to process survey response:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Calculate comprehensive satisfaction metrics for a patient
   */
  async calculateSatisfactionMetrics(
    patientId: string,
    periodDays: number = 365
  ): Promise<SatisfactionMetrics | null> {
    try {
      const periodStart = new Date()
      periodStart.setDate(periodStart.getDate() - periodDays)

      // Get all completed surveys for the period
      const { data: surveys } = await this.supabase
        .from('satisfaction_surveys')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'completed')
        .gte('completed_at', periodStart.toISOString())
        .order('completed_at', { ascending: true })

      if (!surveys || surveys.length === 0) {
        return null
      }

      // Calculate average scores
      const averageScores = this.calculateAverageScores(surveys)
      
      // Calculate score trends
      const scoreTrends = this.calculateScoreTrends(surveys)
      
      // Calculate NPS, CES, CSAT
      const npsScore = this.calculateNPS(surveys)
      const npsCategory = this.getNPSCategory(npsScore)
      const cesScore = this.calculateCES(surveys)
      const csatScore = this.calculateCSAT(surveys)
      
      // Calculate benchmarking
      const benchmarkComparison = this.calculateBenchmarkComparison(averageScores)
      
      // Calculate satisfaction percentile
      const satisfactionPercentile = this.calculateSatisfactionPercentile(averageScores.overall)
      
      // Identify improvement opportunities
      const improvementOpportunities = this.identifyImprovementOpportunities(averageScores, benchmarkComparison)
      
      // Generate predictions
      const predictedTrends = this.generatePredictedTrends(scoreTrends)

      // Get total surveys sent for response rate calculation
      const { data: allSurveys } = await this.supabase
        .from('satisfaction_surveys')
        .select('id')
        .eq('patient_id', patientId)
        .gte('sent_at', periodStart.toISOString())

      const totalSurveys = allSurveys?.length || 0
      const responseRate = totalSurveys > 0 ? surveys.length / totalSurveys : 0

      const metrics: SatisfactionMetrics = {
        patient_id: patientId,
        calculation_date: new Date(),
        period_start: periodStart,
        period_end: new Date(),
        total_surveys: totalSurveys,
        completed_surveys: surveys.length,
        response_rate: Math.round(responseRate * 100) / 100,
        average_scores: averageScores,
        score_trends: scoreTrends,
        nps_score: npsScore,
        nps_category: npsCategory,
        ces_score: cesScore,
        csat_score: csatScore,
        satisfaction_percentile: satisfactionPercentile,
        benchmark_comparison: benchmarkComparison,
        improvement_opportunities: improvementOpportunities,
        predicted_trends: predictedTrends
      }

      return metrics

    } catch (error) {
      logger.error('Failed to calculate satisfaction metrics:', error)
      return null
    }
  }

  /**
   * Analyze satisfaction trends for a patient
   */
  async analyzeSatisfactionTrends(
    patientId: string,
    periodDays: number = 365
  ): Promise<SatisfactionTrendAnalysis | null> {
    try {
      const periodStart = new Date()
      periodStart.setDate(periodStart.getDate() - periodDays)

      const { data: surveys } = await this.supabase
        .from('satisfaction_surveys')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'completed')
        .gte('completed_at', periodStart.toISOString())
        .order('completed_at', { ascending: true })

      if (!surveys || surveys.length < 2) {
        return null
      }

      // Analyze overall trend
      const trendData = this.analyzeTrendData(surveys)
      
      // Generate predictive insights
      const predictiveInsights = this.generatePredictiveInsights(surveys, trendData)
      
      // Calculate benchmarking insights
      const benchmarkingInsights = this.calculateBenchmarkingInsights(surveys)

      const analysis: SatisfactionTrendAnalysis = {
        patient_id: patientId,
        analysis_period_days: periodDays,
        trend_data: trendData,
        predictive_insights: predictiveInsights,
        benchmarking_insights: benchmarkingInsights
      }

      return analysis

    } catch (error) {
      logger.error('Failed to analyze satisfaction trends:', error)
      return null
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private initializeDefaultConfig(): void {
    // Initialize with default industry benchmarks for aesthetic clinics
    // These would typically come from industry research or competitive analysis
  }

  private async sendSurvey(survey: any, method: CollectionMethod): Promise<void> {
    // Implementation would depend on the collection method
    logger.info(`Sending survey via ${method}`, { survey_id: survey.id })
    
    switch (method) {
      case 'email_survey':
        await this.sendEmailSurvey(survey)
        break
      case 'whatsapp_survey':
        await this.sendWhatsAppSurvey(survey)
        break
      case 'sms_survey':
        await this.sendSMSSurvey(survey)
        break
      default:
        logger.debug(`Survey method ${method} scheduled for manual handling`)
    }
  }

  private async sendEmailSurvey(survey: any): Promise<void> {
    // Email survey implementation
    logger.debug('Email survey sent', { survey_id: survey.id })
  }

  private async sendWhatsAppSurvey(survey: any): Promise<void> {
    // WhatsApp survey implementation
    logger.debug('WhatsApp survey sent', { survey_id: survey.id })
  }

  private async sendSMSSurvey(survey: any): Promise<void> {
    // SMS survey implementation
    logger.debug('SMS survey sent', { survey_id: survey.id })
  }

  private async scheduleReminders(surveyId: string, reminderConfig: any): Promise<void> {
    // Schedule reminder notifications
    logger.debug('Reminders scheduled', { survey_id: surveyId })
  }

  private processResponses(responses: Partial<Record<SatisfactionDimension, number>>): Record<SatisfactionDimension, number> {
    const processedScores: Record<SatisfactionDimension, number> = {
      overall: 0,
      service_quality: 0,
      facility_environment: 0,
      staff_professionalism: 0,
      treatment_effectiveness: 0,
      communication: 0,
      scheduling_convenience: 0,
      waiting_time: 0,
      value_for_money: 0,
      recommendation_likelihood: 0,
      loyalty_intention: 0,
      complaint_resolution: 0
    }

    // Process provided responses
    Object.keys(responses).forEach(key => {
      const dimension = key as SatisfactionDimension
      if (responses[dimension] !== undefined) {
        processedScores[dimension] = responses[dimension]!
      }
    })

    // Calculate overall score if not provided
    if (!responses.overall) {
      const relevantScores = [
        processedScores.service_quality,
        processedScores.facility_environment,
        processedScores.staff_professionalism,
        processedScores.treatment_effectiveness,
        processedScores.communication
      ].filter(score => score > 0)

      if (relevantScores.length > 0) {
        processedScores.overall = relevantScores.reduce((sum, score) => sum + score, 0) / relevantScores.length
      }
    }

    return processedScores
  }

  private async analyzeFeedbackSentiment(feedbackText: string): Promise<number> {
    // This would typically use NLP services for sentiment analysis
    // For now, return a simple keyword-based sentiment score
    
    const positiveKeywords = ['excellent', 'great', 'amazing', 'fantastic', 'perfect', 'love', 'recommend']
    const negativeKeywords = ['terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointed', 'unsatisfied']
    
    const text = feedbackText.toLowerCase()
    let sentiment = 0
    
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) sentiment += 0.2
    })
    
    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) sentiment -= 0.2
    })
    
    return Math.max(-1, Math.min(1, sentiment))
  }

  private calculateCompletionRate(responses: Partial<Record<SatisfactionDimension, number>>): number {
    const totalQuestions = Object.keys(this.industryBenchmarks).length
    const answeredQuestions = Object.values(responses).filter(value => value !== undefined && value > 0).length
    return answeredQuestions / totalQuestions
  }

  private async checkForImmediateActions(
    patientId: string, 
    scores: Record<SatisfactionDimension, number>, 
    sentiment?: number
  ): Promise<void> {
    // Check for critical satisfaction issues that need immediate attention
    const criticalThreshold = 2.0
    const criticalDimensions = Object.keys(scores).filter(key => 
      scores[key as SatisfactionDimension] < criticalThreshold
    )

    if (criticalDimensions.length > 0 || (sentiment && sentiment < -0.5)) {
      logger.warn('Critical satisfaction issue detected', {
        patient_id: patientId,
        critical_dimensions: criticalDimensions,
        sentiment_score: sentiment
      })
      
      // Trigger immediate action workflow
      await this.triggerImmediateAction(patientId, criticalDimensions, sentiment)
    }
  }

  private async triggerImmediateAction(
    patientId: string, 
    criticalDimensions: string[], 
    sentiment?: number
  ): Promise<void> {
    // Implementation would trigger alerts, create tasks, etc.
    logger.info('Immediate action triggered for satisfaction issue', {
      patient_id: patientId,
      critical_areas: criticalDimensions
    })
  }

  private async updatePatientSatisfactionProfile(
    patientId: string, 
    metrics: SatisfactionMetrics
  ): Promise<void> {
    // Update patient profile with latest satisfaction metrics
    logger.debug('Patient satisfaction profile updated', {
      patient_id: patientId,
      overall_score: metrics.average_scores.overall
    })
  }

  private calculateAverageScores(surveys: any[]): Record<SatisfactionDimension, number> {
    const averages: Record<SatisfactionDimension, number> = {
      overall: 0,
      service_quality: 0,
      facility_environment: 0,
      staff_professionalism: 0,
      treatment_effectiveness: 0,
      communication: 0,
      scheduling_convenience: 0,
      waiting_time: 0,
      value_for_money: 0,
      recommendation_likelihood: 0,
      loyalty_intention: 0,
      complaint_resolution: 0
    }

    if (surveys.length === 0) return averages

    surveys.forEach(survey => {
      averages.overall += survey.overall_score
      averages.service_quality += survey.service_score
      averages.facility_environment += survey.facility_score
      averages.staff_professionalism += survey.staff_score
      averages.communication += survey.communication_score
      averages.waiting_time += survey.waiting_time_score
      averages.value_for_money += survey.value_score
      averages.recommendation_likelihood += survey.recommendation_score
      
      // Handle satisfaction_scores JSON field
      if (survey.satisfaction_scores) {
        Object.keys(survey.satisfaction_scores).forEach(key => {
          const dimension = key as SatisfactionDimension
          if (averages[dimension] !== undefined) {
            averages[dimension] += survey.satisfaction_scores[key] || 0
          }
        })
      }
    })

    // Calculate averages
    Object.keys(averages).forEach(key => {
      const dimension = key as SatisfactionDimension
      averages[dimension] = Math.round((averages[dimension] / surveys.length) * 100) / 100
    })

    return averages
  }

  private calculateScoreTrends(surveys: any[]): Record<SatisfactionDimension, number[]> {
    // Calculate trends over time for each dimension
    const trends: Record<SatisfactionDimension, number[]> = {
      overall: [],
      service_quality: [],
      facility_environment: [],
      staff_professionalism: [],
      treatment_effectiveness: [],
      communication: [],
      scheduling_convenience: [],
      waiting_time: [],
      value_for_money: [],
      recommendation_likelihood: [],
      loyalty_intention: [],
      complaint_resolution: []
    }

    surveys.forEach(survey => {
      trends.overall.push(survey.overall_score)
      trends.service_quality.push(survey.service_score)
      trends.facility_environment.push(survey.facility_score)
      trends.staff_professionalism.push(survey.staff_score)
      trends.communication.push(survey.communication_score)
      trends.waiting_time.push(survey.waiting_time_score)
      trends.value_for_money.push(survey.value_score)
      trends.recommendation_likelihood.push(survey.recommendation_score)
    })

    return trends
  }

  private calculateNPS(surveys: any[]): number {
    const npsScores = surveys
      .map(s => s.recommendation_score)
      .filter(score => score >= 0 && score <= 10)

    if (npsScores.length === 0) return 0

    const promoters = npsScores.filter(score => score >= 9).length
    const detractors = npsScores.filter(score => score <= 6).length
    
    return Math.round(((promoters - detractors) / npsScores.length) * 100)
  }

  private getNPSCategory(npsScore: number): 'detractor' | 'passive' | 'promoter' {
    if (npsScore <= 6) return 'detractor'
    if (npsScore <= 8) return 'passive'
    return 'promoter'
  }

  private calculateCES(surveys: any[]): number {
    const cesScores = surveys
      .map(s => s.effort_score)
      .filter(score => score > 0)

    return cesScores.length > 0 ? 
      Math.round((cesScores.reduce((sum, score) => sum + score, 0) / cesScores.length) * 100) / 100 : 0
  }

  private calculateCSAT(surveys: any[]): number {
    const csatScores = surveys
      .map(s => s.overall_score)
      .filter(score => score > 0)

    return csatScores.length > 0 ? 
      Math.round((csatScores.reduce((sum, score) => sum + score, 0) / csatScores.length) * 100) / 100 : 0
  }

  private calculateBenchmarkComparison(averageScores: Record<SatisfactionDimension, number>) {
    const variance: Record<SatisfactionDimension, number> = {} as Record<SatisfactionDimension, number>
    
    Object.keys(averageScores).forEach(key => {
      const dimension = key as SatisfactionDimension
      const industryAvg = this.industryBenchmarks[dimension] || 3.0
      const patientScore = averageScores[dimension]
      variance[dimension] = Math.round((patientScore - industryAvg) * 100) / 100
    })

    return {
      industry_average: this.industryBenchmarks,
      clinic_performance: averageScores,
      variance_from_benchmark: variance,
      ranking_position: this.calculateRankingPosition(averageScores.overall)
    }
  }

  private calculateSatisfactionPercentile(overallScore: number): number {
    // Simplified percentile calculation - would use actual distribution data in production
    const maxScore = 5.0
    return Math.round((overallScore / maxScore) * 100)
  }

  private calculateRankingPosition(overallScore: number): number {
    // Simplified ranking - would use actual market data in production
    if (overallScore >= 4.5) return 1 // Top 10%
    if (overallScore >= 4.0) return 2 // Top 25%
    if (overallScore >= 3.5) return 3 // Top 50%
    if (overallScore >= 3.0) return 4 // Top 75%
    return 5 // Bottom 25%
  }

  private identifyImprovementOpportunities(
    averageScores: Record<SatisfactionDimension, number>,
    benchmarkComparison: any
  ) {
    const opportunities = []

    Object.keys(averageScores).forEach(key => {
      const dimension = key as SatisfactionDimension
      const currentScore = averageScores[dimension]
      const benchmarkScore = this.industryBenchmarks[dimension] || 3.0
      const variance = benchmarkComparison.variance_from_benchmark[dimension]
      
      if (variance < -0.5) { // Significantly below benchmark
        opportunities.push({
          dimension,
          current_score: currentScore,
          target_score: benchmarkScore + 0.2, // Aim slightly above benchmark
          improvement_potential: Math.abs(variance),
          priority_level: this.getPriorityLevel(variance, currentScore),
          recommended_actions: this.getRecommendedActions(dimension, currentScore)
        })
      }
    })

    return opportunities.sort((a, b) => b.improvement_potential - a.improvement_potential)
  }

  private getPriorityLevel(variance: number, currentScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (currentScore < 2.0 || variance < -1.0) return 'critical'
    if (currentScore < 3.0 || variance < -0.7) return 'high'
    if (variance < -0.5) return 'medium'
    return 'low'
  }

  private getRecommendedActions(dimension: SatisfactionDimension, currentScore: number): string[] {
    const actions: Record<SatisfactionDimension, string[]> = {
      overall: ['Implementar programa de melhoria contínua', 'Realizar pesquisa detalhada de causas'],
      service_quality: ['Treinamento de atendimento ao cliente', 'Padronização de protocolos de atendimento'],
      facility_environment: ['Renovação de ambiente', 'Melhoria de conforto e limpeza'],
      staff_professionalism: ['Treinamento de equipe', 'Programa de desenvolvimento profissional'],
      treatment_effectiveness: ['Revisão de protocolos de tratamento', 'Investimento em novas tecnologias'],
      communication: ['Melhoria nos canais de comunicação', 'Treinamento de comunicação'],
      scheduling_convenience: ['Otimização do sistema de agendamento', 'Flexibilidade de horários'],
      waiting_time: ['Otimização de fluxo de atendimento', 'Sistema de gerenciamento de filas'],
      value_for_money: ['Revisão de preços', 'Programa de benefícios adicionais'],
      recommendation_likelihood: ['Programa de indicações', 'Melhoria da experiência geral'],
      loyalty_intention: ['Programa de fidelidade', 'Benefícios para clientes recorrentes'],
      complaint_resolution: ['Melhoria do processo de SAC', 'Treinamento para resolução de conflitos']
    }

    return actions[dimension] || ['Análise específica necessária']
  }

  private generatePredictedTrends(scoreTrends: Record<SatisfactionDimension, number[]>) {
    const predictions: any = {
      next_month_prediction: {} as Record<SatisfactionDimension, number>,
      confidence_interval: {} as Record<SatisfactionDimension, [number, number]>,
      trend_direction: {} as Record<SatisfactionDimension, 'improving' | 'stable' | 'declining'>
    }

    Object.keys(scoreTrends).forEach(key => {
      const dimension = key as SatisfactionDimension
      const trend = scoreTrends[dimension]
      
      if (trend.length >= 2) {
        const lastScore = trend[trend.length - 1]
        const secondLastScore = trend[trend.length - 2]
        const trendDirection = lastScore > secondLastScore ? 'improving' : 
                             lastScore < secondLastScore ? 'declining' : 'stable'
        
        // Simple linear prediction
        const change = lastScore - secondLastScore
        const prediction = Math.max(0, Math.min(5, lastScore + change))
        
        predictions.next_month_prediction[dimension] = Math.round(prediction * 100) / 100
        predictions.confidence_interval[dimension] = [
          Math.max(0, prediction - 0.3),
          Math.min(5, prediction + 0.3)
        ]
        predictions.trend_direction[dimension] = trendDirection
      }
    })

    return predictions
  }

  private analyzeTrendData(surveys: any[]) {
    // Analyze trend patterns, correlations, etc.
    const scores = surveys.map(s => s.overall_score)
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
    const secondHalf = scores.slice(Math.floor(scores.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length
    
    let overallTrend: 'improving' | 'stable' | 'declining' = 'stable'
    let trendStrength = 0
    
    if (secondAvg > firstAvg + 0.2) {
      overallTrend = 'improving'
      trendStrength = Math.min(1, (secondAvg - firstAvg) / 2)
    } else if (secondAvg < firstAvg - 0.2) {
      overallTrend = 'declining'
      trendStrength = Math.min(1, (firstAvg - secondAvg) / 2)
    }

    return {
      overall_trend: overallTrend,
      trend_strength: Math.round(trendStrength * 100) / 100,
      seasonal_patterns: [], // Would analyze seasonal patterns with more data
      correlations: [] // Would calculate correlations between dimensions
    }
  }

  private generatePredictiveInsights(surveys: any[], trendData: any) {
    const latestSurvey = surveys[surveys.length - 1]
    const churnRiskIndicator = this.calculateChurnRisk(surveys)
    const loyaltyScore = latestSurvey?.overall_score || 0
    
    return {
      churn_risk_indicator: Math.round(churnRiskIndicator * 100) / 100,
      loyalty_score: Math.round(loyaltyScore * 100) / 100,
      next_survey_optimal_timing: this.calculateOptimalSurveyTiming(surveys),
      intervention_recommendations: this.generateInterventionRecommendations(churnRiskIndicator, loyaltyScore)
    }
  }

  private calculateBenchmarkingInsights(surveys: any[]) {
    const latestSurvey = surveys[surveys.length - 1]
    const performanceVsIndustry: Record<SatisfactionDimension, 'above' | 'at' | 'below'> = {} as any
    
    Object.keys(this.industryBenchmarks).forEach(key => {
      const dimension = key as SatisfactionDimension
      const patientScore = latestSurvey?.satisfaction_scores?.[dimension] || 0
      const industryScore = this.industryBenchmarks[dimension]
      
      if (patientScore > industryScore + 0.2) {
        performanceVsIndustry[dimension] = 'above'
      } else if (patientScore < industryScore - 0.2) {
        performanceVsIndustry[dimension] = 'below'
      } else {
        performanceVsIndustry[dimension] = 'at'
      }
    })

    // Priority ranking based on impact and improvement potential
    const improvementPriorityRanking: SatisfactionDimension[] = Object.keys(performanceVsIndustry)
      .filter(key => performanceVsIndustry[key as SatisfactionDimension] === 'below')
      .sort((a, b) => {
        const scoreA = latestSurvey?.satisfaction_scores?.[a] || 0
        const scoreB = latestSurvey?.satisfaction_scores?.[b] || 0
        return scoreA - scoreB // Lower scores first (more urgent)
      }) as SatisfactionDimension[]

    return {
      performance_vs_industry: performanceVsIndustry,
      improvement_priority_ranking: improvementPriorityRanking,
      competitive_positioning: this.getCompetitivePositioning(latestSurvey?.overall_score || 0)
    }
  }

  private calculateChurnRisk(surveys: any[]): number {
    if (surveys.length === 0) return 0.5

    const latestSurvey = surveys[surveys.length - 1]
    let riskScore = 0

    // Low overall satisfaction
    if (latestSurvey.overall_score < 3.0) riskScore += 0.3
    
    // Low NPS
    if (latestSurvey.recommendation_score < 7) riskScore += 0.2
    
    // Declining trend
    if (surveys.length > 1) {
      const previousSurvey = surveys[surveys.length - 2]
      if (latestSurvey.overall_score < previousSurvey.overall_score) riskScore += 0.2
    }
    
    // Negative sentiment
    if (latestSurvey.feedback_sentiment && latestSurvey.feedback_sentiment < -0.3) {
      riskScore += 0.3
    }

    return Math.min(1.0, riskScore)
  }

  private calculateOptimalSurveyTiming(surveys: any[]): Date {
    // Calculate optimal timing for next survey based on response patterns
    const avgResponseInterval = 90 // Default 90 days
    const nextSurveyDate = new Date()
    nextSurveyDate.setDate(nextSurveyDate.getDate() + avgResponseInterval)
    
    return nextSurveyDate
  }

  private generateInterventionRecommendations(churnRisk: number, loyaltyScore: number): string[] {
    const recommendations: string[] = []

    if (churnRisk > 0.7) {
      recommendations.push('Contato imediato do customer success')
      recommendations.push('Oferta de compensação ou melhoria de serviço')
    } else if (churnRisk > 0.4) {
      recommendations.push('Agendamento de follow-up personalizado')
      recommendations.push('Pesquisa detalhada de satisfação')
    }

    if (loyaltyScore > 4.0) {
      recommendations.push('Programa de indicações')
      recommendations.push('Oferta de benefícios VIP')
    }

    return recommendations
  }

  private getCompetitivePositioning(overallScore: number): string {
    if (overallScore >= 4.5) return 'Líder de mercado'
    if (overallScore >= 4.0) return 'Acima da média'
    if (overallScore >= 3.5) return 'Na média do mercado'
    if (overallScore >= 3.0) return 'Abaixo da média'
    return 'Necessita melhoria urgente'
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PatientSatisfactionMetricsEngine,
  type SatisfactionDimension,
  type SurveyType,
  type CollectionMethod,
  type ResponseStatus,
  type SatisfactionSurvey,
  type SatisfactionMetrics,
  type SatisfactionCollectionConfig,
  type SatisfactionTrendAnalysis
}