/**
 * Predictive Client Analytics and Retention Assessment Service
 *
 * AI-powered analytics service for predicting client retention risk,
 * identifying churn factors, and generating actionable insights
 * for healthcare clinics.
 */

import { createClient } from '@supabase/supabase-js'
import {
  AguiClientAnalyticsMessage,
  AguiClientRetentionPredictionMessage,
  /* AISuggestion, */
  AnalyticsData,
  RetentionFeatures,
  RetentionRecommendation,
} from './agui-protocol/types'

export interface AnalyticsConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  aiServiceUrl?: string
  modelVersion: string
  predictionThreshold: number // 0-1
  enableRealtimeUpdates: boolean
  historicalDataDays: number
}

export interface RetentionPrediction {
  clientId: string
  riskLevel: 'low' | 'medium' | 'high'
  riskScore: number // 0-1
  confidence: number // 0-1
  factors: Array<{
    factor: string
    impact: 'positive' | 'negative'
    weight: number
    description: string
    value: any
    threshold?: number
  }>
  trend: 'improving' | 'stable' | 'declining'
  predictedOutcome: 'retain' | 'at_risk' | 'likely_to_churn'
  timeframe: string // e.g., "30 days", "90 days"
  recommendations: RetentionRecommendation[]
  lastUpdated: string
  modelVersion: string
}

export interface ClientEngagementMetrics {
  clientId: string
  appointmentFrequency: number // appointments per month
  noShowRate: number // 0-1
  cancellationRate: number // 0-1
  rescheduleRate: number // 0-1
  responseRate: number // 0-1
  averageResponseTime: number // hours
  communicationPreference: 'whatsapp' | 'sms' | 'email' | 'phone'
  lastAppointmentDate?: string
  nextAppointmentDate?: string
  engagementScore: number // 0-100
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface FinancialBehavior {
  clientId: string
  totalPayments: number
  missedPayments: number
  averagePaymentAmount: number
  paymentDelayDays: number
  outstandingBalance: number
  paymentConsistency: number // 0-1
  preferredPaymentMethod: string
  lastPaymentDate?: string
  financialRisk: 'low' | 'medium' | 'high'
  spendingTrend: 'increasing' | 'stable' | 'decreasing'
}

export interface TreatmentProgress {
  clientId: string
  totalSessions: number
  completedSessions: number
  scheduledSessions: number
  adherenceRate: number // 0-1
  satisfactionScore?: number // 1-5
  progressScore: number // 0-100
  treatmentEfficacy: number // 0-1
  riskFactors: string[]
  lastTreatmentDate?: string
  nextTreatmentDate?: string
  estimatedCompletionDate?: string
  dropoutRisk: number // 0-1
}

export interface AnalyticsSummary {
  totalClients: number
  retentionRate: number // 0-1
  churnRate: number // 0-1
  averageRiskScore: number // 0-1
  highRiskClients: number
  mediumRiskClients: number
  lowRiskClients: number
  riskDistribution: {
    low: number // percentage
    medium: number // percentage
    high: number // percentage
  }
  keyRiskFactors: Array<{
    factor: string
    prevalence: number // 0-1
    impact: number // 0-1
  }>
  topRecommendations: RetentionRecommendation[]
  lastUpdated: string
}

export class PredictiveClientAnalyticsService {
  private supabase: any
  private config: AnalyticsConfig
  private predictionsCache: Map<string, RetentionPrediction> = new Map()
  private lastCacheUpdate: Date = new Date(0)

  constructor(config: AnalyticsConfig) {
    this.config = config
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)
  }

  // Main prediction endpoint
  async predictClientRetention(
    message: AguiClientRetentionPredictionMessage,
  ): Promise<{
    success: boolean
    prediction?: RetentionPrediction
    error?: string
  }> {
    try {
      // Check cache first
      const cached = this.predictionsCache.get(message.clientId)
      if (cached && this.isCacheValid(cached)) {
        return { success: true, prediction: cached }
      }

      // Gather client data
      const clientData = await this.gatherClientData(message.clientId)
      if (!clientData) {
        return { success: false, error: 'Cliente não encontrado' }
      }

      // Extract features
      const features = message.features
        || (await this.extractFeatures(message.clientId, clientData))

      // Generate prediction
      const prediction = await this.generateRetentionPrediction(
        message.clientId,
        features,
      )

      // Cache the result
      this.predictionsCache.set(message.clientId, prediction)

      return { success: true, prediction }
    } catch {
      console.error('Error predicting client retention:', error)
      return { success: false, error: error.message }
    }
  }

  // Client analytics endpoint
  async generateClientAnalytics(
    message: AguiClientAnalyticsMessage,
  ): Promise<{ success: boolean; analytics?: AnalyticsData; error?: string }> {
    try {
      const clientId = message.clientId

      // Gather comprehensive analytics data
      const [engagement, financial, treatment, retention] = await Promise.all([
        this.calculateEngagementMetrics(clientId),
        this.calculateFinancialBehavior(clientId),
        this.calculateTreatmentProgress(clientId),
        this.predictClientRetention({
          clientId,
        } as AguiClientRetentionPredictionMessage),
      ])

      if (!retention.prediction) {
        return { success: false, error: 'Não foi possível gerar análises' }
      }

      // Generate insights
      const _insights = await this.generateInsights({
        engagement,
        financial,
        treatment,
        retention: retention.prediction,
      })

      // Generate recommendations
      const _recommendations = await this.generateRecommendations({
        engagement,
        financial,
        treatment,
        retention: retention.prediction,
      })

      const analytics: AnalyticsData = {
        metrics: {
          totalClients: 1,
          retentionRate: retention.prediction.riskScore < 0.3 ? 1 : 0.7,
          engagementScore: engagement.engagementScore,
          satisfactionScore: treatment.satisfactionScore || 0,
          financialHealth: financial.paymentConsistency,
          riskScore: retention.prediction.riskScore,
        },
        trends: [
          {
            date: new Date().toISOString().split('T')[0],
            value: retention.prediction.riskScore,
            label: 'Risk Score',
          },
        ],
        comparisons: {
          current: retention.prediction.riskScore,
          previous: Math.max(0, retention.prediction.riskScore - 0.1),
          change: -0.1,
          changePercent: -10,
        },
      }

      return { success: true, analytics }
    } catch {
      console.error('Error generating client analytics:', error)
      return { success: false, error: error.message }
    }
  }

  // Batch analytics for all clients
  async generateBatchAnalytics(): Promise<{
    success: boolean
    summary?: AnalyticsSummary
    errors?: string[]
  }> {
    try {
      // Get all clients
      const { data: clients, error } = await this.supabase
        .from('patients')
        .select('id')
        .eq('lgpd_consent_given', true)

      if (error) throw error

      const errors: string[] = []
      const predictions: RetentionPrediction[] = []

      // Process in batches
      const batchSize = 50
      for (let i = 0; i < clients.length; i += batchSize) {
        const batch = clients.slice(i, i + batchSize)

        const batchPromises = batch.map(async (client) => {
          try {
            const result = await this.predictClientRetention({
              clientId: client.id,
            })
            if (result.success && result.prediction) {
              predictions.push(result.prediction)
            }
          } catch {
            errors.push(
              `Erro ao processar cliente ${client.id}: ${error.message}`,
            )
          }
        })

        await Promise.allSettled(batchPromises)
      }

      // Generate summary
      const summary = this.generateAnalyticsSummary(predictions)

      return { success: true, summary, errors }
    } catch {
      console.error('Error generating batch analytics:', error)
      return { success: false, errors: [error.message] }
    }
  }

  // Data gathering methods
  private async gatherClientData(clientId: string): Promise<any> {
    try {
      // Get client basic info
      const { data: client, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (error || !client) return null

      // Get appointments
      const { data: appointments, error: aptError } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', clientId)
        .order('scheduled_date', { ascending: false })
        .limit(100)

      if (aptError) throw aptError

      // Get consents
      const { data: consents, error: consentError } = await this.supabase
        .from('lgpd_consents')
        .select('*')
        .eq('patient_id', clientId)

      if (consentError) throw consentError

      return {
        client,
        appointments: appointments || [],
        consents: consents || [],
      }
    } catch {
      console.error('Error gathering client data:', error)
      return null
    }
  }

  private async extractFeatures(
    clientId: string,
    clientData: any,
  ): Promise<RetentionFeatures> {
    const { client, appointments, consents: _consents } = clientData

    // Calculate appointment history features
    const appointmentHistory = this.calculateAppointmentHistory(appointments)

    // Calculate communication features
    const communicationHistory = await this.calculateCommunicationHistory(clientId)

    // Calculate financial features
    const paymentHistory = await this.calculatePaymentHistory(clientId)

    // Calculate treatment progress
    const treatmentProgress = this.calculateTreatmentProgressFromAppointments(appointments)

    // Calculate demographic features
    const demographics = this.calculateDemographics(client)

    return {
      appointmentHistory,
      communicationHistory,
      paymentHistory,
      treatmentProgress,
      demographicData: demographics,
    }
  }

  private calculateAppointmentHistory(
    appointments: any[],
  ): RetentionFeatures['AppointmentHistory'] {
    const totalAppointments = appointments.length
    const noShowCount = appointments.filter(
      (apt) => apt.status === 'NO_SHOW',
    ).length
    const cancellationCount = appointments.filter(
      (apt) => apt.status === 'CANCELLED',
    ).length
    const rescheduleCount = appointments.filter(
      (apt) => apt.status === 'RESCHEDULED',
    ).length

    // Calculate time between appointments
    const sortedAppointments = appointments
      .filter((apt) => apt.status === 'COMPLETED')
      .sort(
        (a, b) =>
          new Date(a.scheduled_date).getTime()
          - new Date(b.scheduled_date).getTime(),
      )

    let timeBetweenAppointments = 0
    if (sortedAppointments.length > 1) {
      const intervals = []
      for (let i = 1; i < sortedAppointments.length; i++) {
        const days = Math.abs(
          (new Date(sortedAppointments[i].scheduled_date).getTime()
            - new Date(sortedAppointments[i - 1].scheduled_date).getTime())
            / (1000 * 60 * 60 * 24),
        )
        intervals.push(days)
      }
      timeBetweenAppointments = intervals.reduce((sum, interval) => sum + interval, 0)
        / intervals.length
    }

    const lastAppointment = sortedAppointments[sortedAppointments.length - 1]
    const nextAppointment = appointments.find(
      (apt) =>
        new Date(apt.scheduled_date) > new Date()
        && ['SCHEDULED', 'CONFIRMED'].includes(apt.status),
    )

    return {
      totalAppointments,
      noShowCount,
      cancellationCount,
      rescheduleCount,
      averageTimeBetweenAppointments: timeBetweenAppointments,
      lastAppointmentDate: lastAppointment?.scheduled_date,
      nextAppointmentDate: nextAppointment?.scheduled_date,
    }
  }

  private async calculateCommunicationHistory(
    clientId: string,
  ): Promise<RetentionFeatures['CommunicationHistory']> {
    // This would integrate with communication logs
    // For now, we'll simulate based on appointment patterns
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('scheduled_date, status')
      .eq('patient_id', clientId)
      .order('scheduled_date', { ascending: false })
      .limit(50)

    const totalMessages = (appointments?.length || 0) * 2 // Assume 2 messages per appointment
    const responseRate = 0.73 // Simulated
    const averageResponseTime = 2.4 // hours

    return {
      totalMessages,
      responseRate,
      averageResponseTime,
      preferredChannel: 'whatsapp',
      lastCommunicationDate: appointments?.[0]?.scheduled_date,
    }
  }

  private async calculatePaymentHistory(
    clientId: string,
  ): Promise<RetentionFeatures['PaymentHistory']> {
    // This would integrate with payment systems
    // For now, we'll simulate based on appointment completion
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('status, scheduled_date')
      .eq('patient_id', clientId)
      .eq('status', 'COMPLETED')

    const totalPayments = appointments?.length || 0
    const missedPayments = Math.floor(totalPayments * 0.05) // 5% missed payment rate
    const averagePaymentAmount = 150 // Simulated
    const lastPaymentDate = appointments?.[0]?.scheduled_date

    return {
      totalPayments,
      missedPayments,
      averagePaymentAmount,
      lastPaymentDate,
      outstandingBalance: missedPayments * averagePaymentAmount,
    }
  }

  private calculateTreatmentProgressFromAppointments(
    appointments: any[],
  ): RetentionFeatures['TreatmentProgress'] {
    const completedTreatments = appointments.filter(
      (apt) => apt.status === 'COMPLETED',
    ).length
    const scheduledTreatments =
      appointments.filter((apt) => ['SCHEDULED', 'CONFIRMED'].includes(apt.status)).length

    const treatmentPlanAdherence = completedTreatments
      / Math.max(1, completedTreatments + scheduledTreatments)

    return {
      completedTreatments,
      scheduledTreatments,
      treatmentPlanAdherence,
      lastTreatmentDate: appointments.find((apt) => apt.status === 'COMPLETED')
        ?.scheduled_date,
    }
  }

  private calculateDemographics(
    client: any,
  ): RetentionFeatures['ClientDemographics'] {
    const age = this.calculateAge(client.date_of_birth)
    return {
      age,
      gender: 'unknown', // Would be extracted from data
      location: client.address?.city || 'unknown',
      socioeconomicIndicator: 'medium', // Would be calculated from address and other factors
    }
  }

  // Prediction generation
  private async generateRetentionPrediction(
    clientId: string,
    features: RetentionFeatures,
  ): Promise<RetentionPrediction> {
    // Calculate individual risk scores
    const appointmentRisk = this.calculateAppointmentRisk(
      features.appointmentHistory,
    )
    const communicationRisk = this.calculateCommunicationRisk(
      features.communicationHistory,
    )
    const paymentRisk = this.calculatePaymentRisk(features.paymentHistory)
    const treatmentRisk = this.calculateTreatmentRisk(
      features.treatmentProgress,
    )
    const demographicRisk = this.calculateDemographicRisk(
      features.demographicData,
    )

    // Weighted combination of risk factors
    const weights = {
      appointment: 0.3,
      communication: 0.25,
      payment: 0.2,
      treatment: 0.15,
      demographic: 0.1,
    }

    const riskScore = appointmentRisk.score * weights.appointment
      + communicationRisk.score * weights.communication
      + paymentRisk.score * weights.payment
      + treatmentRisk.score * weights.treatment
      + demographicRisk.score * weights.demographic

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high'
    if (riskScore < 0.3) riskLevel = 'low'
    else if (riskScore < 0.7) riskLevel = 'medium'
    else riskLevel = 'high'

    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(features)

    // Generate factors
    const factors = [
      { ...appointmentRisk, factor: 'appointment_history' },
      { ...communicationRisk, factor: 'communication_engagement' },
      { ...paymentRisk, factor: 'payment_behavior' },
      { ...treatmentRisk, factor: 'treatment_adherence' },
      { ...demographicRisk, factor: 'demographic_profile' },
    ]

    // Determine trend
    const trend = this.calculateTrend(features)

    // Predict outcome
    const predictedOutcome = this.predictOutcome(riskScore, trend)

    // Generate recommendations
    const recommendations = await this.generateRiskBasedRecommendations(
      riskLevel,
      factors,
    )

    return {
      clientId,
      riskLevel,
      riskScore,
      confidence,
      factors,
      trend,
      predictedOutcome,
      timeframe: '90 days',
      recommendations,
      lastUpdated: new Date().toISOString(),
      modelVersion: this.config.modelVersion,
    }
  }

  private calculateAppointmentRisk(
    history: RetentionFeatures['AppointmentHistory'],
  ): any {
    const noShowRate = history.totalAppointments > 0
      ? history.noShowCount / history.totalAppointments
      : 0
    const cancellationRate = history.totalAppointments > 0
      ? history.cancellationCount / history.totalAppointments
      : 0

    let score = 0
    if (noShowRate > 0.2) score += 0.3
    if (cancellationRate > 0.3) score += 0.2
    if (history.totalAppointments < 3) score += 0.1
    if (!history.nextAppointmentDate) score += 0.2

    return {
      impact: score > 0.3 ? 'negative' : 'positive',
      weight: 0.3,
      description: `Taxa de não comparecimento: ${(noShowRate * 100).toFixed(1)}%`,
      value: { noShowRate, cancellationRate },
      threshold: 0.15,
      score: Math.min(score, 1),
    }
  }

  private calculateCommunicationRisk(
    communication: RetentionFeatures['CommunicationHistory'],
  ): any {
    const responseScore = 1 - communication.responseRate
    const timeScore = Math.min(communication.averageResponseTime / 24, 1) // Normalize to 24h

    const score = responseScore * 0.7 + timeScore * 0.3

    return {
      impact: score > 0.4 ? 'negative' : 'positive',
      weight: 0.25,
      description: `Taxa de resposta: ${(communication.responseRate * 100).toFixed(1)}%`,
      value: {
        responseRate: communication.responseRate,
        averageResponseTime: communication.averageResponseTime,
      },
      threshold: 0.3,
      score,
    }
  }

  private calculatePaymentRisk(
    payment: RetentionFeatures['PaymentHistory'],
  ): any {
    const missedRate = payment.totalPayments > 0
      ? payment.missedPayments / payment.totalPayments
      : 0
    const hasOutstandingBalance = payment.outstandingBalance > 0

    let score = missedRate
    if (hasOutstandingBalance) score += 0.2

    return {
      impact: score > 0.1 ? 'negative' : 'positive',
      weight: 0.2,
      description: `Pagamentos pendentes: ${payment.missedPayments}`,
      value: { missedRate, outstandingBalance: payment.outstandingBalance },
      threshold: 0.05,
      score: Math.min(score, 1),
    }
  }

  private calculateTreatmentRisk(
    treatment: RetentionFeatures['TreatmentProgress'],
  ): any {
    const adherenceRisk = 1 - treatment.treatmentPlanAdherence
    const hasScheduledTreatments = treatment.scheduledTreatments > 0

    let score = adherenceRisk * 0.5
    if (!hasScheduledTreatments) score += 0.3

    return {
      impact: score > 0.3 ? 'negative' : 'positive',
      weight: 0.15,
      description: `Adesão ao tratamento: ${(treatment.treatmentPlanAdherence * 100).toFixed(1)}%`,
      value: {
        adherenceRate: treatment.treatmentPlanAdherence,
        scheduledTreatments: treatment.scheduledTreatments,
      },
      threshold: 0.2,
      score,
    }
  }

  private calculateDemographicRisk(
    demographics: RetentionFeatures['ClientDemographics'],
  ): any {
    let score = 0

    // Age-based risk (very young or very old clients may have higher retention challenges)
    if (demographics.age && (demographics.age < 25 || demographics.age > 65)) {
      score += 0.1
    }

    // Location-based risk (would use actual location data)
    if (demographics.location === 'unknown') {
      score += 0.05
    }

    return {
      impact: score > 0.1 ? 'negative' : 'positive',
      weight: 0.1,
      description: `Perfil demográfico: ${demographics.age || 'unknown'} anos`,
      value: demographics,
      threshold: 0.15,
      score,
    }
  }

  private calculatePredictionConfidence(features: RetentionFeatures): number {
    let confidence = 0.5 // Base confidence

    // More appointments = higher confidence
    if (features.appointmentHistory.totalAppointments > 10) confidence += 0.2
    else if (features.appointmentHistory.totalAppointments > 5) {
      confidence += 0.1
    } else if (features.appointmentHistory.totalAppointments > 0) {
      confidence += 0.05
    }

    // Recent activity = higher confidence
    if (features.appointmentHistory.lastAppointmentDate) {
      const daysSinceLastAppointment = Math.abs(
        (new Date().getTime()
          - new Date(features.appointmentHistory.lastAppointmentDate).getTime())
          / (1000 * 60 * 60 * 24),
      )
      if (daysSinceLastAppointment < 30) confidence += 0.2
      else if (daysSinceLastAppointment < 90) confidence += 0.1
    }

    return Math.min(confidence, 0.95)
  }

  private calculateTrend(
    features: RetentionFeatures,
  ): 'improving' | 'stable' | 'declining' {
    // This would analyze historical patterns
    // For now, we'll use simple heuristics
    const hasRecentAppointment = features.appointmentHistory.lastAppointmentDate
      && Math.abs(
          (new Date().getTime()
            - new Date(features.appointmentHistory.lastAppointmentDate).getTime())
            / (1000 * 60 * 60 * 24),
        ) < 30

    const hasUpcomingAppointment = !!features.appointmentHistory.nextAppointmentDate
    const goodCommunication = features.communicationHistory.responseRate > 0.7

    if (hasRecentAppointment && hasUpcomingAppointment && goodCommunication) {
      return 'improving'
    } else if (!hasRecentAppointment && !hasUpcomingAppointment) {
      return 'declining'
    } else {
      return 'stable'
    }
  }

  private predictOutcome(
    riskScore: number,
    trend: 'improving' | 'stable' | 'declining',
  ): 'retain' | 'at_risk' | 'likely_to_churn' {
    if (riskScore < 0.3) return 'retain'
    if (riskScore < 0.7) {
      return trend === 'declining' ? 'at_risk' : 'retain'
    }
    return trend === 'improving' ? 'at_risk' : 'likely_to_churn'
  }

  private async generateRiskBasedRecommendations(
    riskLevel: 'low' | 'medium' | 'high',
    factors: any[],
  ): Promise<RetentionRecommendation[]> {
    const recommendations: RetentionRecommendation[] = []

    // High-risk recommendations
    if (riskLevel === 'high') {
      recommendations.push({
        id: 'rec-high-1',
        type: 'intervention',
        priority: 'high',
        title: 'Intervenção Imediata',
        description: 'Contato pessoal para entender razões do desengajamento',
        actionItems: [
          'Ligar para cliente em 24 horas',
          'Agendar reunião de feedback',
          'Oferecer incentivos para retorno',
          'Revisar plano de tratamento',
        ],
        expectedImpact: 'Redução significativa no risco de churn',
        timeline: '1-3 dias',
      })

      const appointmentFactor = factors.find(
        (f) => f.factor === 'appointment_history',
      )
      if (appointmentFactor && appointmentFactor.impact === 'negative') {
        recommendations.push({
          id: 'rec-high-2',
          type: 'communication',
          priority: 'high',
          title: 'Melhorar Comunicação',
          description: 'Implementar lembretes personalizados e confirmações',
          actionItems: [
            'Configurar lembretes via WhatsApp',
            'Enviar confirmações de agendamento',
            'Oferecer re-agendamento flexível',
            'Personalizar comunicações',
          ],
          expectedImpact: 'Redução de 40% em não comparecimentos',
          timeline: 'Implementar em 1 semana',
        })
      }
    }

    // Medium-risk recommendations
    if (riskLevel === 'medium') {
      recommendations.push({
        id: 'rec-medium-1',
        type: 'follow_up',
        priority: 'medium',
        title: 'Follow-up Proativo',
        description: 'Contato regular para manter engajamento',
        actionItems: [
          'Agendar contato mensal',
          'Enviar atualizações de tratamento',
          'Coletar feedback regular',
          'Oferecer benefícios exclusivos',
        ],
        expectedImpact: 'Melhoria de 25% na retenção',
        timeline: 'Contato em 7 dias',
      })
    }

    // Low-risk recommendations (preventive)
    if (riskLevel === 'low') {
      recommendations.push({
        id: 'rec-low-1',
        type: 'incentive',
        priority: 'low',
        title: 'Programa de Fidelidade',
        description: 'Recompensar engajamento contínuo',
        actionItems: [
          'Criar programa de pontos',
          'Oferecer descontos progressivos',
          'Eventos exclusivos',
          'Benefícios VIP',
        ],
        expectedImpact: 'Aumento de 15% na lealdade',
        timeline: 'Implementar em 30 dias',
      })
    }

    return recommendations
  }

  // Analytics calculation methods
  private async calculateEngagementMetrics(
    clientId: string,
  ): Promise<ClientEngagementMetrics> {
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', clientId)
      .order('scheduled_date', { ascending: false })

    if (!appointments || appointments.length === 0) {
      return {
        clientId,
        appointmentFrequency: 0,
        noShowRate: 0,
        cancellationRate: 0,
        rescheduleRate: 0,
        responseRate: 0,
        averageResponseTime: 0,
        communicationPreference: 'whatsapp',
        engagementScore: 0,
        trend: 'stable',
      }
    }

    const totalAppointments = appointments.length
    const noShowCount = appointments.filter(
      (apt) => apt.status === 'NO_SHOW',
    ).length
    const cancellationCount = appointments.filter(
      (apt) => apt.status === 'CANCELLED',
    ).length
    const rescheduleCount = appointments.filter(
      (apt) => apt.status === 'RESCHEDULED',
    ).length

    // Calculate frequency (appointments per month)
    const firstAppointment = new Date(
      appointments[appointments.length - 1].scheduled_date,
    )
    const lastAppointment = new Date(appointments[0].scheduled_date)
    const monthsDiff = Math.max(
      1,
      (lastAppointment.getTime() - firstAppointment.getTime())
        / (1000 * 60 * 60 * 24 * 30),
    )
    const appointmentFrequency = totalAppointments / monthsDiff

    return {
      clientId,
      appointmentFrequency,
      noShowRate: noShowCount / totalAppointments,
      cancellationRate: cancellationCount / totalAppointments,
      rescheduleRate: rescheduleCount / totalAppointments,
      responseRate: 0.73, // Simulated
      averageResponseTime: 2.4, // Simulated
      communicationPreference: 'whatsapp',
      lastAppointmentDate: appointments.find(
        (apt) => apt.status === 'COMPLETED',
      )?.scheduled_date,
      nextAppointmentDate: appointments.find(
        (apt) =>
          new Date(apt.scheduled_date) > new Date()
          && ['SCHEDULED', 'CONFIRMED'].includes(apt.status),
      )?.scheduled_date,
      engagementScore: Math.max(
        0,
        100 - (noShowRate * 100 + cancellationRate * 50),
      ),
      trend: 'stable',
    }
  }

  private async calculateFinancialBehavior(
    clientId: string,
  ): Promise<FinancialBehavior> {
    // Simulated financial data
    return {
      clientId,
      totalPayments: 12,
      missedPayments: 1,
      averagePaymentAmount: 150,
      paymentDelayDays: 3,
      outstandingBalance: 0,
      paymentConsistency: 0.92,
      preferredPaymentMethod: 'credit_card',
      lastPaymentDate: new Date(
        Date.now() - 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      financialRisk: 'low',
      spendingTrend: 'stable',
    }
  }

  private async calculateTreatmentProgress(
    clientId: string,
  ): Promise<TreatmentProgress> {
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', clientId)

    if (!appointments || appointments.length === 0) {
      return {
        clientId,
        totalSessions: 0,
        completedSessions: 0,
        scheduledSessions: 0,
        adherenceRate: 0,
        progressScore: 0,
        treatmentEfficacy: 0,
        riskFactors: [],
        dropoutRisk: 0.5,
      }
    }

    const completedSessions = appointments.filter(
      (apt) => apt.status === 'COMPLETED',
    ).length
    const scheduledSessions =
      appointments.filter((apt) => ['SCHEDULED', 'CONFIRMED'].includes(apt.status)).length
    const totalSessions = appointments.length

    return {
      clientId,
      totalSessions,
      completedSessions,
      scheduledSessions,
      adherenceRate: completedSessions / Math.max(1, totalSessions),
      satisfactionScore: 4.2, // Simulated
      progressScore: (completedSessions / Math.max(1, totalSessions)) * 100,
      treatmentEfficacy: 0.85, // Simulated
      riskFactors: [],
      lastTreatmentDate: appointments.find((apt) => apt.status === 'COMPLETED')
        ?.scheduled_date,
      nextTreatmentDate: appointments.find(
        (apt) =>
          new Date(apt.scheduled_date) > new Date()
          && ['SCHEDULED', 'CONFIRMED'].includes(apt.status),
      )?.scheduled_date,
      dropoutRisk: 0.15, // Simulated
    }
  }

  private async generateInsights(data: any): Promise<string[]> {
    const insights: string[] = []

    // Engagement insights
    if (data.engagement.engagementScore < 50) {
      insights.push('Baixo engajamento detectado - considerar intervenção')
    }

    // Financial insights
    if (data.financial.financialRisk === 'high') {
      insights.push('Risco financeiro elevado - revisar opções de pagamento')
    }

    // Treatment insights
    if (data.treatment.adherenceRate < 0.7) {
      insights.push('Baixa adesão ao tratamento - investigar causas')
    }

    // Retention insights
    if (data.retention.riskLevel === 'high') {
      insights.push('Alto risco de churn - ação imediata recomendada')
    }

    return insights
  }

  private async generateRecommendations(
    data: any,
  ): Promise<RetentionRecommendation[]> {
    return data.retention.recommendations || []
  }

  private generateAnalyticsSummary(
    predictions: RetentionPrediction[],
  ): AnalyticsSummary {
    const totalClients = predictions.length
    const highRiskClients = predictions.filter(
      (p) => p.riskLevel === 'high',
    ).length
    const mediumRiskClients = predictions.filter(
      (p) => p.riskLevel === 'medium',
    ).length
    const lowRiskClients = predictions.filter(
      (p) => p.riskLevel === 'low',
    ).length

    const averageRiskScore = predictions.reduce((sum, p) => sum + p.riskScore, 0) / totalClients
    const churnRate = highRiskClients / totalClients
    const retentionRate = 1 - churnRate

    // Analyze key risk factors
    const factorFrequency = new Map<
      string,
      { count: number; totalImpact: number }
    >()
    predictions.forEach((prediction) => {
      prediction.factors.forEach((factor) => {
        if (factor.impact === 'negative') {
          const current = factorFrequency.get(factor.factor) || {
            count: 0,
            totalImpact: 0,
          }
          factorFrequency.set(factor.factor, {
            count: current.count + 1,
            totalImpact: current.totalImpact + factor.weight,
          })
        }
      })
    })

    const keyRiskFactors = Array.from(factorFrequency.entries())
      .map(([factor, stats]) => ({
        factor,
        prevalence: stats.count / totalClients,
        impact: stats.totalImpact / stats.count,
      }))
      .sort((a, b) => b.prevalence * b.impact - a.prevalence * a.impact)
      .slice(0, 5)

    // Generate top recommendations
    const topRecommendations = this.generateTopRecommendations(keyRiskFactors)

    return {
      totalClients,
      retentionRate,
      churnRate,
      averageRiskScore,
      highRiskClients,
      mediumRiskClients,
      lowRiskClients,
      riskDistribution: {
        low: lowRiskClients / totalClients,
        medium: mediumRiskClients / totalClients,
        high: highRiskClients / totalClients,
      },
      keyRiskFactors,
      topRecommendations,
      lastUpdated: new Date().toISOString(),
    }
  }

  private generateTopRecommendations(
    keyRiskFactors: any[],
  ): RetentionRecommendation[] {
    const recommendations: RetentionRecommendation[] = []

    keyRiskFactors.slice(0, 3).forEach((factor, index) => {
      switch (factor.factor) {
        case 'appointment_history':
          recommendations.push({
            id: `rec-summary-${index}`,
            type: 'communication',
            priority: 'high',
            title: 'Otimizar Sistema de Agendamento',
            description: 'Implementar lembretes inteligentes e confirmações automáticas',
            actionItems: [
              'Configurar notificações via WhatsApp',
              'Implementar sistema de confirmação dupla',
              'Oferecer re-agendamento fácil',
              'Monitorar taxas de não comparecimento',
            ],
            expectedImpact: 'Redução de 30% em não comparecimentos',
            timeline: 'Implementar em 2 semanas',
          })
          break

        case 'communication_engagement':
          recommendations.push({
            id: `rec-summary-${index}`,
            type: 'communication',
            priority: 'medium',
            title: 'Melhorar Engajamento',
            description: 'Personalizar comunicação e aumentar taxa de resposta',
            actionItems: [
              'Segmentar clientes por preferência',
              'Personalizar mensagens',
              'Testar diferentes canais',
              'Monitorar métricas de engajamento',
            ],
            expectedImpact: 'Aumento de 25% na taxa de resposta',
            timeline: 'Implementar em 1 mês',
          })
          break

        case 'payment_behavior':
          recommendations.push({
            id: `rec-summary-${index}`,
            type: 'incentive',
            priority: 'medium',
            title: 'Otimizar Pagamentos',
            description: 'Reduzir inadimplência com opções flexíveis',
            actionItems: [
              'Oferecer planos de pagamento',
              'Enviar lembretes automáticos',
              'Implementar multas descontos',
              'Diversificar formas de pagamento',
            ],
            expectedImpact: 'Redução de 40% em pagamentos atrasados',
            timeline: 'Implementar em 3 semanas',
          })
          break
      }
    })

    return recommendations
  }

  // Utility methods
  private calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (
      monthDiff < 0
      || (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--
    }

    return age
  }

  private isCacheValid(prediction: RetentionPrediction): boolean {
    const cacheAge = Date.now() - new Date(prediction.lastUpdated).getTime()
    const maxCacheAge = 24 * 60 * 60 * 1000 // 24 hours
    return cacheAge < maxCacheAge
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    details: any
  }> {
    try {
      const checks = await Promise.allSettled([
        this.checkDatabaseConnection(),
        this.checkModelAvailability(),
        this.checkCacheHealth(),
      ])

      const passedChecks = checks.filter(
        (check) => check.status === 'fulfilled' && check.value,
      ).length
      const totalChecks = checks.length

      return {
        status: passedChecks === totalChecks
          ? 'healthy'
          : passedChecks > 0
          ? 'degraded'
          : 'unhealthy',
        details: {
          totalChecks,
          passedChecks,
          failedChecks: totalChecks - passedChecks,
          cacheSize: this.predictionsCache.size,
          modelVersion: this.config.modelVersion,
          threshold: this.config.predictionThreshold,
        },
      }
    } catch {
      return {
        status: 'unhealthy',
        details: { error: error.message },
      }
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      const { data: _data, error } = await this.supabase
        .from('patients')
        .select('count')
        .limit(1)

      return !error
    } catch {
      return false
    }
  }

  private async checkModelAvailability(): Promise<boolean> {
    // Check if AI service is available
    if (!this.config.aiServiceUrl) return false

    try {
      const response = await fetch(`${this.config.aiServiceUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async checkCacheHealth(): Promise<boolean> {
    // Simple cache health check
    try {
      return this.predictionsCache.size < 10000 // Reasonable cache size limit
    } catch {
      return false
    }
  }

  // Public utility methods
  getPrediction(clientId: string): RetentionPrediction | undefined {
    return this.predictionsCache.get(clientId)
  }

  clearCache(): void {
    this.predictionsCache.clear()
    this.lastCacheUpdate = new Date()
  }

  async refreshPredictions(): Promise<{
    success: boolean
    processed: number
    errors: string[]
  }> {
    this.clearCache()

    const result = await this.generateBatchAnalytics()
    return {
      success: result.success,
      processed: result.summary?.totalClients || 0,
      errors: result.errors || [],
    }
  }
}
