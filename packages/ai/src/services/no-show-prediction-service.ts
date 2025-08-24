import { EnhancedAIService } from './enhanced-service-base'
import type { 
  AppointmentData,
  PatientBehaviorData,
  PredictionResult,
  RiskFactors,
  PreventionRecommendations 
} from '../types'

interface NoShowPredictionInput {
  appointmentId: string
  patientId: string
  clinicId: string
  appointmentData: AppointmentData
  patientBehavior?: PatientBehaviorData
  historicalData?: boolean
}

interface NoShowPredictionOutput {
  riskScore: number // 0-100 scale
  riskCategory: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  primaryRiskFactors: RiskFactors[]
  preventionRecommendations: PreventionRecommendations[]
  predictionId: string
  modelVersion: string
  processedAt: Date
}

interface AppointmentFeatures {
  // Temporal features
  dayOfWeek: number
  hourOfDay: number
  daysUntilAppointment: number
  appointmentDuration: number
  isFirstAppointment: boolean
  
  // Patient features
  patientAge: number
  patientGender: string
  previousNoShows: number
  previousCancellations: number
  averageTimeToConfirm: number
  hasPhoneNumber: boolean
  hasEmail: boolean
  
  // Clinic features  
  procedureType: string
  procedureCost: number
  doctorId: string
  roomType: string
  
  // Behavioral features
  avgResponseTime: number
  lastLoginDays: number
  appointmentSource: string
  paymentMethod: string
  
  // Contextual features
  weatherCondition?: string
  localHolidays: boolean
  seasonalFactor: number
}

export class NoShowPredictionService extends EnhancedAIService<NoShowPredictionInput, NoShowPredictionOutput> {
  protected serviceId = 'no-show-prediction'
  protected version = '2.1.0'
  protected description = 'ML-powered no-show prediction for healthcare appointments with Brazilian behavioral patterns'
  
  private modelWeights: Record<string, number> = {
    // Temporal weights
    daysUntilAppointment: 0.18,
    dayOfWeek: 0.12,
    hourOfDay: 0.08,
    
    // Historical behavior weights  
    previousNoShows: 0.25,
    previousCancellations: 0.15,
    avgResponseTime: 0.10,
    
    // Patient demographics
    patientAge: 0.05,
    isFirstAppointment: 0.12,
    
    // Procedure characteristics
    procedureCost: 0.08,
    procedureDuration: 0.06,
    
    // Contact & engagement
    hasPhoneNumber: 0.03,
    hasEmail: 0.03,
    lastLoginDays: 0.07,
    
    // External factors
    weatherCondition: 0.04,
    seasonalFactor: 0.03
  }

  constructor() {
    super({
      enableCaching: true,
      cacheTTL: 1800, // 30 minutes for prediction results
      enableRetry: true,
      maxRetries: 3,
      enableMetrics: true,
      enableCompliance: true,
      complianceLevel: 'healthcare',
      rateLimitConfig: {
        maxRequests: 200,
        windowMs: 60000 // 200 predictions per minute
      }
    })
  }

  async execute(input: NoShowPredictionInput): Promise<NoShowPredictionOutput> {
    const startTime = Date.now()
    
    try {
      // Input validation
      await this.validateInput(input)
      
      // Feature extraction
      const features = await this.extractFeatures(input)
      
      // Load patient behavioral data
      const behaviorData = await this.loadPatientBehaviorData(input.patientId, input.clinicId)
      
      // Enhance features with behavioral data
      const enhancedFeatures = await this.enhanceWithBehaviorData(features, behaviorData)
      
      // Run prediction model
      const prediction = await this.runPredictionModel(enhancedFeatures)
      
      // Calculate confidence and risk factors
      const analysis = await this.analyzeRiskFactors(enhancedFeatures, prediction)
      
      // Generate prevention recommendations
      const recommendations = await this.generatePreventionRecommendations(analysis)
      
      // Save prediction for model improvement
      await this.savePredictionResult(input, prediction, analysis)
      
      const result: NoShowPredictionOutput = {
        riskScore: prediction.riskScore,
        riskCategory: this.categorizeRisk(prediction.riskScore),
        confidence: prediction.confidence,
        primaryRiskFactors: analysis.primaryFactors,
        preventionRecommendations: recommendations,
        predictionId: this.generatePredictionId(),
        modelVersion: this.version,
        processedAt: new Date()
      }
      
      return result
      
    } catch (error) {
      await this.handlePredictionError(error, input)
      throw error
    } finally {
      await this.recordMetrics({
        operation: 'no_show_prediction',
        duration: Date.now() - startTime,
        patientId: input.patientId,
        clinicId: input.clinicId
      })
    }
  }

  private async validateInput(input: NoShowPredictionInput): Promise<void> {
    if (!input.appointmentId || !input.patientId || !input.clinicId) {
      throw new Error('PREDICTION_MISSING_IDS: Appointment, patient, and clinic IDs are required')
    }
    
    if (!input.appointmentData) {
      throw new Error('PREDICTION_MISSING_DATA: Appointment data is required')
    }
    
    if (new Date(input.appointmentData.scheduledDateTime) < new Date()) {
      throw new Error('PREDICTION_PAST_APPOINTMENT: Cannot predict for past appointments')
    }
  }

  private async extractFeatures(input: NoShowPredictionInput): Promise<AppointmentFeatures> {
    const appointment = input.appointmentData
    const appointmentDate = new Date(appointment.scheduledDateTime)
    const now = new Date()
    
    // Get patient historical data
    const patientHistory = await this.getPatientHistory(input.patientId, input.clinicId)
    
    // Calculate temporal features
    const daysUntilAppointment = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const dayOfWeek = appointmentDate.getDay() // 0 = Sunday
    const hourOfDay = appointmentDate.getHours()
    
    // Extract patient demographics
    const patient = await this.getPatientData(input.patientId)
    
    const features: AppointmentFeatures = {
      // Temporal
      dayOfWeek,
      hourOfDay,
      daysUntilAppointment,
      appointmentDuration: appointment.duration || 60,
      isFirstAppointment: patientHistory.totalAppointments === 0,
      
      // Patient demographics
      patientAge: this.calculateAge(patient.birthDate),
      patientGender: patient.gender,
      previousNoShows: patientHistory.noShows,
      previousCancellations: patientHistory.cancellations,
      averageTimeToConfirm: patientHistory.avgConfirmationTime || 0,
      hasPhoneNumber: !!patient.phone,
      hasEmail: !!patient.email,
      
      // Procedure details
      procedureType: appointment.procedureType,
      procedureCost: appointment.cost || 0,
      doctorId: appointment.doctorId,
      roomType: appointment.roomType || 'standard',
      
      // Behavioral
      avgResponseTime: patientHistory.avgResponseTime || 0,
      lastLoginDays: this.calculateDaysSinceLastLogin(patient.lastLoginAt),
      appointmentSource: appointment.source || 'web',
      paymentMethod: appointment.paymentMethod || 'unknown',
      
      // Contextual
      localHolidays: await this.checkLocalHolidays(appointmentDate),
      seasonalFactor: this.calculateSeasonalFactor(appointmentDate)
    }
    
    return features
  }

  private async loadPatientBehaviorData(patientId: string, clinicId: string): Promise<PatientBehaviorData | null> {
    const cacheKey = `patient_behavior:${patientId}:${clinicId}`
    let behaviorData = await this.cache.get<PatientBehaviorData>(cacheKey)
    
    if (!behaviorData) {
      behaviorData = await this.database.patientBehavior.findFirst({
        where: { patientId, clinicId }
      })
      
      if (behaviorData) {
        await this.cache.set(cacheKey, behaviorData, 3600) // Cache for 1 hour
      }
    }
    
    return behaviorData
  }

  private async enhanceWithBehaviorData(
    features: AppointmentFeatures, 
    behaviorData: PatientBehaviorData | null
  ): Promise<AppointmentFeatures> {
    if (!behaviorData) {
      return features
    }
    
    return {
      ...features,
      avgResponseTime: behaviorData.avgResponseTime,
      lastLoginDays: behaviorData.daysSinceLastEngagement,
      // Add behavioral patterns
      preferredTimeSlots: behaviorData.preferredTimeSlots,
      communicationPreference: behaviorData.communicationPreference,
      punctualityScore: behaviorData.punctualityScore
    } as AppointmentFeatures & any
  }

  private async runPredictionModel(features: AppointmentFeatures): Promise<{ riskScore: number; confidence: number }> {
    // Normalize features to 0-1 scale
    const normalizedFeatures = await this.normalizeFeatures(features)
    
    // Calculate weighted risk score
    let riskScore = 0
    let totalWeight = 0
    
    for (const [feature, value] of Object.entries(normalizedFeatures)) {
      const weight = this.modelWeights[feature] || 0
      if (weight > 0 && typeof value === 'number' && !isNaN(value)) {
        riskScore += value * weight
        totalWeight += weight
      }
    }
    
    // Normalize to 0-100 scale
    riskScore = (riskScore / totalWeight) * 100
    
    // Apply Brazilian healthcare behavioral adjustments
    riskScore = await this.applyBrazilianAdjustments(riskScore, features)
    
    // Calculate confidence based on data completeness
    const confidence = this.calculatePredictionConfidence(features)
    
    return {
      riskScore: Math.min(Math.max(riskScore, 0), 100),
      confidence
    }
  }

  private async normalizeFeatures(features: AppointmentFeatures): Promise<Record<string, number>> {
    return {
      // Temporal normalization
      daysUntilAppointment: Math.min(features.daysUntilAppointment / 30, 1), // 30 days max
      dayOfWeek: features.dayOfWeek / 6, // 0-6 scale
      hourOfDay: features.hourOfDay / 23, // 0-23 scale
      appointmentDuration: Math.min(features.appointmentDuration / 240, 1), // 4 hours max
      
      // Historical behavior normalization
      previousNoShows: Math.min(features.previousNoShows / 10, 1), // 10 no-shows max for normalization
      previousCancellations: Math.min(features.previousCancellations / 15, 1),
      avgResponseTime: Math.min(features.avgResponseTime / 1440, 1), // 24 hours in minutes
      
      // Patient demographics
      patientAge: features.patientAge / 100, // Normalize age
      isFirstAppointment: features.isFirstAppointment ? 1 : 0,
      
      // Cost normalization (Brazilian healthcare context)
      procedureCost: Math.min(features.procedureCost / 5000, 1), // R$ 5,000 normalization ceiling
      
      // Contact availability
      hasPhoneNumber: features.hasPhoneNumber ? 0 : 1, // Inverted - no phone = higher risk
      hasEmail: features.hasEmail ? 0 : 1,
      
      // Engagement
      lastLoginDays: Math.min(features.lastLoginDays / 90, 1), // 90 days max
      
      // Contextual
      seasonalFactor: features.seasonalFactor,
      localHolidays: features.localHolidays ? 1 : 0
    }
  }

  private async applyBrazilianAdjustments(riskScore: number, features: AppointmentFeatures): Promise<number> {
    let adjustedScore = riskScore
    
    // Friday afternoon appointments have higher no-show rates in Brazil
    if (features.dayOfWeek === 5 && features.hourOfDay >= 14) {
      adjustedScore += 8
    }
    
    // Monday morning appointments have lower no-show rates
    if (features.dayOfWeek === 1 && features.hourOfDay <= 10) {
      adjustedScore -= 5
    }
    
    // Carnival/Holiday season adjustments
    if (features.seasonalFactor > 0.8) {
      adjustedScore += 12
    }
    
    // First appointments in aesthetic clinics have higher completion rates
    if (features.isFirstAppointment && features.procedureType.includes('aesthetic')) {
      adjustedScore -= 10
    }
    
    // High-cost procedures have lower no-show rates (patient investment)
    if (features.procedureCost > 2000) {
      adjustedScore -= 7
    }
    
    return Math.min(Math.max(adjustedScore, 0), 100)
  }

  private categorizeRisk(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore <= 25) return 'low'
    if (riskScore <= 50) return 'medium'
    if (riskScore <= 75) return 'high'
    return 'critical'
  }

  private async analyzeRiskFactors(features: AppointmentFeatures, prediction: any): Promise<{ primaryFactors: RiskFactors[] }> {
    const factors: RiskFactors[] = []
    
    if (features.previousNoShows > 2) {
      factors.push({
        factor: 'historical_no_shows',
        impact: 'high',
        description: `Patient has ${features.previousNoShows} previous no-shows`,
        weight: 0.25
      })
    }
    
    if (features.daysUntilAppointment > 14) {
      factors.push({
        factor: 'advance_booking',
        impact: 'medium',
        description: `Appointment scheduled ${features.daysUntilAppointment} days in advance`,
        weight: 0.18
      })
    }
    
    if (features.dayOfWeek === 5 && features.hourOfDay >= 14) {
      factors.push({
        factor: 'friday_afternoon',
        impact: 'medium',
        description: 'Friday afternoon appointments have higher no-show rates',
        weight: 0.12
      })
    }
    
    if (!features.hasPhoneNumber && !features.hasEmail) {
      factors.push({
        factor: 'no_contact_info',
        impact: 'high',
        description: 'Patient has no phone or email for reminders',
        weight: 0.15
      })
    }
    
    return { primaryFactors: factors.slice(0, 5) } // Return top 5 factors
  }

  private async generatePreventionRecommendations(analysis: any): Promise<PreventionRecommendations[]> {
    const recommendations: PreventionRecommendations[] = []
    
    recommendations.push({
      type: 'automated_reminder',
      priority: 'high',
      description: 'Send SMS reminder 24 hours before appointment',
      estimatedImpact: 15 // 15% reduction in no-show probability
    })
    
    recommendations.push({
      type: 'phone_confirmation',
      priority: 'medium',
      description: 'Call patient 48 hours before to confirm',
      estimatedImpact: 20
    })
    
    recommendations.push({
      type: 'flexible_rescheduling',
      priority: 'low',
      description: 'Offer easy rescheduling options via app/website',
      estimatedImpact: 10
    })
    
    if (analysis.primaryFactors.some(f => f.factor === 'advance_booking')) {
      recommendations.push({
        type: 'mid_point_reminder',
        priority: 'medium',
        description: 'Send reminder email at midpoint between booking and appointment',
        estimatedImpact: 12
      })
    }
    
    return recommendations
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  private calculateDaysSinceLastLogin(lastLoginAt: Date | null): number {
    if (!lastLoginAt) return 9999 // Very high value for never logged in
    
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastLoginAt.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  private async checkLocalHolidays(date: Date): Promise<boolean> {
    // Implement Brazilian holiday checking logic
    const brazilianHolidays = [
      '01-01', // New Year
      '04-21', // Tiradentes  
      '05-01', // Labor Day
      '09-07', // Independence Day
      '10-12', // Our Lady of Aparecida
      '11-02', // All Souls Day
      '11-15', // Proclamation of Republic
      '12-25'  // Christmas
    ]
    
    const dateString = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return brazilianHolidays.includes(dateString)
  }

  private calculateSeasonalFactor(date: Date): number {
    // Brazilian seasonal patterns - higher no-shows during Carnival, December holidays
    const month = date.getMonth() + 1
    
    if (month === 2 || month === 3) return 0.9 // Carnival season
    if (month === 12) return 0.85 // December holidays
    if (month === 1) return 0.8 // January vacation period
    if (month >= 6 && month <= 8) return 0.7 // Winter - better attendance
    
    return 0.5 // Normal periods
  }

  private calculatePredictionConfidence(features: AppointmentFeatures): number {
    let confidence = 0.6 // Base confidence
    
    // Increase confidence based on available data
    if (features.previousNoShows >= 0) confidence += 0.1
    if (features.hasPhoneNumber) confidence += 0.05
    if (features.hasEmail) confidence += 0.05
    if (features.avgResponseTime > 0) confidence += 0.1
    if (features.procedureCost > 0) confidence += 0.05
    if (!features.isFirstAppointment) confidence += 0.1 // Historical data available
    
    return Math.min(confidence, 1.0)
  }

  private async getPatientHistory(patientId: string, clinicId: string): Promise<any> {
    return await this.database.patients.findFirst({
      where: { id: patientId, clinicId },
      include: {
        appointments: {
          select: {
            status: true,
            scheduledDateTime: true,
            confirmedAt: true,
            createdAt: true
          }
        }
      }
    })
  }

  private async getPatientData(patientId: string): Promise<any> {
    return await this.database.patients.findUnique({
      where: { id: patientId },
      select: {
        birthDate: true,
        gender: true,
        phone: true,
        email: true,
        lastLoginAt: true
      }
    })
  }

  private async savePredictionResult(
    input: NoShowPredictionInput,
    prediction: any,
    analysis: any
  ): Promise<void> {
    await this.database.appointmentPredictions.create({
      data: {
        appointmentId: input.appointmentId,
        patientId: input.patientId,
        clinicId: input.clinicId,
        riskScore: prediction.riskScore,
        confidence: prediction.confidence,
        primaryFactors: analysis.primaryFactors,
        modelVersion: this.version,
        predictedAt: new Date()
      }
    })
  }

  private async handlePredictionError(error: any, input: NoShowPredictionInput): Promise<void> {
    await this.logger.error('No-show prediction error', {
      error: error.message,
      appointmentId: input.appointmentId,
      patientId: input.patientId,
      clinicId: input.clinicId
    })
  }

  private generatePredictionId(): string {
    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}