/**
 * No-Show Prediction Service for Aesthetic Procedures
 * ML-powered prediction system for appointment no-shows with Brazilian behavior analysis
 * Specialized for aesthetic clinic patient behavior patterns
 */

export interface PatientBehaviorData {
  patientId: string
  age?: number
  gender?: string
  location?: string
  socioeconomicLevel?: string
  appointmentHistory: Array<{
    date: Date
    status: 'completed' | 'no_show' | 'cancelled' | 'rescheduled'
    procedureType: string
    leadTimeDays: number
    cost: number
  }>
  communicationPreferences: {
    email: boolean
    sms: boolean
    whatsapp: boolean
    phone: boolean
  }
  seasonalFactors?: {
    holidaySeason: boolean
    vacationPeriod: boolean
    weatherConditions?: string
  }
}

export interface NoShowPredictionFeatures {
  patientId: string
  appointmentTime: Date
  appointmentType: string
  leadTimeDays: number
  cost: number
  dayOfWeek: number
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  isHoliday: boolean
  weatherForecast?: string
  previousNoShowRate: number
  cancellationHistory: number
  rescheduleHistory: number
  communicationEffectiveness: number
  socioeconomicFactors: {
    incomeLevel: string
    education: string
    occupation: string
  }
  seasonalFactors: {
    holidaySeason: boolean
    vacationPeriod: boolean
    weatherImpact: number
  }
}

export interface NoShowPredictionResult {
  riskScore: number // 0-1, where 1 is highest risk
  confidence: number // 0-1, model confidence
  riskFactors: string[]
  preventionRecommendations: string[]
  modelVersion: string
  predictionDate: Date
  mitigationEffectiveness: {
    reminder: number
    deposit: number
    flexibleScheduling: number
    personalContact: number
  }
}

export class NoShowPredictionService {
  private modelVersion: string = '1.2.0'
  private patientDataCache: Map<string, PatientBehaviorData> = new Map()

  constructor() {
    this.initializeModel()
  }

  /**
   * Predict no-show probability for a specific appointment
   */
  async predictNoShow(
    patientId: string,
    appointmentTime: Date,
    procedureType: string,
    cost: number,
  ): Promise<NoShowPredictionResult> {
    // Get patient behavior data
    const patientData = await this.getPatientBehaviorData(patientId)

    // Extract features
    const features = this.extractFeatures(patientData, appointmentTime, procedureType, cost)

    // Make prediction
    const prediction = await this.makePrediction(features)

    // Generate recommendations
    const recommendations = this.generateRecommendations(features, prediction.riskScore)

    // Calculate mitigation effectiveness
    const mitigationEffectiveness = this.calculateMitigationEffectiveness(
      features,
      prediction.riskScore,
    )

    return {
      ...prediction,
      preventionRecommendations: recommendations,
      mitigationEffectiveness,
    }
  }

  /**
   * Batch prediction for multiple appointments
   */
  async batchPredictNoShow(
    appointments: Array<{
      patientId: string
      appointmentTime: Date
      procedureType: string
      cost: number
    }>,
  ): Promise<Map<string, NoShowPredictionResult>> {
    const results = new Map<string, NoShowPredictionResult>()

    for (const appointment of appointments) {
      const prediction = await this.predictNoShow(
        appointment.patientId,
        appointment.appointmentTime,
        appointment.procedureType,
        appointment.cost,
      )
      results.set(appointment.patientId, prediction)
    }

    return results
  }

  /**
   * Get patient behavior data from various sources
   */
  private async getPatientBehaviorData(patientId: string): Promise<PatientBehaviorData> {
    // Check cache first
    const cached = this.patientDataCache.get(patientId)
    if (cached) return cached

    // Mock implementation - would integrate with EHR and CRM systems
    const patientData: PatientBehaviorData = {
      patientId,
      age: 35,
      gender: 'female',
      location: 'São Paulo',
      socioeconomicLevel: 'B',
      appointmentHistory: [
        {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'completed',
          procedureType: 'botox',
          leadTimeDays: 14,
          cost: 1500,
        },
        {
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          status: 'no_show',
          procedureType: 'filler',
          leadTimeDays: 3,
          cost: 2000,
        },
      ],
      communicationPreferences: {
        email: true,
        sms: true,
        whatsapp: true,
        phone: false,
      },
    }

    // Cache the data
    this.patientDataCache.set(patientId, patientData)

    return patientData
  }

  /**
   * Extract features for ML model
   */
  private extractFeatures(
    patientData: PatientBehaviorData,
    appointmentTime: Date,
    procedureType: string,
    cost: number,
  ): NoShowPredictionFeatures {
    const now = new Date()
    const leadTimeDays = Math.ceil(
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )

    // Calculate previous no-show rate
    const completedAppointments =
      patientData.appointmentHistory.filter(apt => apt.status === 'completed').length
    const noShowAppointments =
      patientData.appointmentHistory.filter(apt => apt.status === 'no_show').length
    const previousNoShowRate = completedAppointments > 0
      ? noShowAppointments / completedAppointments
      : 0

    // Determine time of day
    const hour = appointmentTime.getHours()
    const timeOfDay: 'morning' | 'afternoon' | 'evening' = hour < 12
      ? 'morning'
      : hour < 18
      ? 'afternoon'
      : 'evening'

    // Check if appointment is on a holiday
    const isHoliday = this.isBrazilianHoliday(appointmentTime)

    // Get seasonal factors
    const seasonalFactors = this.getSeasonalFactors(appointmentTime)

    return {
      patientId: patientData.patientId,
      appointmentTime,
      appointmentType: procedureType,
      leadTimeDays,
      cost,
      dayOfWeek: appointmentTime.getDay(),
      timeOfDay,
      isHoliday,
      previousNoShowRate,
      cancellationHistory:
        patientData.appointmentHistory.filter(apt => apt.status === 'cancelled').length,
      rescheduleHistory:
        patientData.appointmentHistory.filter(apt => apt.status === 'rescheduled').length,
      communicationEffectiveness: this.calculateCommunicationEffectiveness(patientData),
      socioeconomicFactors: {
        incomeLevel: patientData.socioeconomicLevel || 'B',
        education: 'bachelor', // Would come from patient data
        occupation: 'professional', // Would come from patient data
      },
      seasonalFactors,
    }
  }

  /**
   * Make prediction using ML model (simplified)
   */
  private async makePrediction(
    features: NoShowPredictionFeatures,
  ): Promise<
    Omit<NoShowPredictionResult, 'preventionRecommendations' | 'mitigationEffectiveness'>
  > {
    // Simplified prediction logic - in production, this would use a trained ML model
    let riskScore = 0.1 // Base risk

    // Lead time impact (shorter lead time = higher risk)
    if (features.leadTimeDays < 3) riskScore += 0.3
    else if (features.leadTimeDays < 7) riskScore += 0.15

    // Previous behavior impact
    riskScore += features.previousNoShowRate * 0.4

    // Cost impact (higher cost = slightly lower risk)
    if (features.cost > 2000) riskScore -= 0.1

    // Time of day impact
    if (features.timeOfDay === 'morning') riskScore += 0.1

    // Holiday impact
    if (features.isHoliday) riskScore += 0.2

    // Seasonal impact
    riskScore += features.seasonalFactors.weatherImpact * 0.15

    // Communication effectiveness
    riskScore -= features.communicationEffectiveness * 0.2

    // Clamp to 0-1 range
    riskScore = Math.max(0, Math.min(1, riskScore))

    // Calculate confidence based on data availability
    const dataPoints = features.appointmentType ? 1 : 0
    const confidence = Math.min(0.95, 0.5 + (dataPoints * 0.1))

    // Identify risk factors
    const riskFactors: string[] = []
    if (features.leadTimeDays < 3) riskFactors.push('Short lead time')
    if (features.previousNoShowRate > 0.3) riskFactors.push('History of no-shows')
    if (features.isHoliday) riskFactors.push('Holiday appointment')
    if (features.timeOfDay === 'morning') riskFactors.push('Morning appointment time')
    if (features.seasonalFactors.weatherImpact > 0.5) riskFactors.push('Adverse weather conditions')

    return {
      riskScore,
      confidence,
      riskFactors,
      modelVersion: this.modelVersion,
      predictionDate: new Date(),
    }
  }

  /**
   * Generate personalized prevention recommendations
   */
  private generateRecommendations(
    features: NoShowPredictionFeatures,
    riskScore: number,
  ): string[] {
    const recommendations: string[] = []

    if (riskScore < 0.3) {
      recommendations.push('Standard reminder 24 hours before appointment')
      recommendations.push('Email confirmation sufficient')
    } else if (riskScore < 0.6) {
      recommendations.push('Multiple reminders (72h, 48h, 24h before)')
      recommendations.push('WhatsApp confirmation preferred')
      recommendations.push('Personal follow-up call for high-value appointments')
    } else {
      recommendations.push('Require deposit or prepayment')
      recommendations.push('Multiple communication channels (SMS, WhatsApp, Phone)')
      recommendations.push('Personal phone call confirmation')
      recommendations.push('Consider flexible scheduling options')
      recommendations.push('Send educational content about procedure importance')
    }

    // Brazilian-specific recommendations
    if (features.seasonalFactors.holidaySeason) {
      recommendations.push('Consider holiday scheduling conflicts')
    }

    if (
      features.socioeconomicFactors.incomeLevel === 'C' ||
      features.socioeconomicFactors.incomeLevel === 'D'
    ) {
      recommendations.push('Offer flexible payment options')
      recommendations.push('Consider appointment time flexibility for work schedules')
    }

    return recommendations
  }

  /**
   * Calculate effectiveness of mitigation strategies
   */
  private calculateMitigationEffectiveness(
    features: NoShowPredictionFeatures,
    _riskScore: number,
  ): NoShowPredictionResult['mitigationEffectiveness'] {
    const baseEffectiveness = {
      reminder: 0.3,
      deposit: 0.6,
      flexibleScheduling: 0.4,
      personalContact: 0.7,
    }

    // Adjust based on patient characteristics
    let reminderEffect = baseEffectiveness.reminder
    let depositEffect = baseEffectiveness.deposit
    let schedulingEffect = baseEffectiveness.flexibleScheduling
    let contactEffect = baseEffectiveness.personalContact

    // Communication preferences affect reminder effectiveness
    if (features.communicationEffectiveness > 0.8) {
      reminderEffect += 0.2
    }

    // Cost affects deposit effectiveness
    if (features.cost > 3000) {
      depositEffect += 0.2
    }

    // Socioeconomic factors affect scheduling flexibility
    if (
      features.socioeconomicFactors.incomeLevel === 'C' ||
      features.socioeconomicFactors.incomeLevel === 'D'
    ) {
      schedulingEffect += 0.3
    }

    // Previous no-show history affects personal contact effectiveness
    if (features.previousNoShowRate > 0.4) {
      contactEffect += 0.2
    }

    return {
      reminder: Math.min(1, reminderEffect),
      deposit: Math.min(1, depositEffect),
      flexibleScheduling: Math.min(1, schedulingEffect),
      personalContact: Math.min(1, contactEffect),
    }
  }

  /**
   * Check if date is a Brazilian holiday
   */
  private isBrazilianHoliday(date: Date): boolean {
    // Simplified - would use comprehensive holiday library
    const brazilianHolidays = [
      '01-01', // New Year
      '04-21', // Tiradentes
      '05-01', // Labor Day
      '09-07', // Independence Day
      '10-12', // Our Lady of Aparecida
      '11-02', // All Souls' Day
      '12-25', // Christmas
    ]

    const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${
      String(date.getDate()).padStart(2, '0')
    }`
    return brazilianHolidays.includes(dateStr) || date.getDay() === 0 // Sunday
  }

  /**
   * Get seasonal factors for prediction
   */
  private getSeasonalFactors(date: Date): {
    holidaySeason: boolean
    vacationPeriod: boolean
    weatherImpact: number
  } {
    const month = date.getMonth() + 1
    // const day = date.getDate() // Unused for now

    // Holiday season (November - December)
    const holidaySeason = month === 10 || month === 11

    // Vacation periods (January, July)
    const vacationPeriod = month === 0 || month === 6

    // Weather impact (simplified - would integrate with weather API)
    // Summer (Dec-Feb) and Winter (Jun-Aug) have higher impact
    let weatherImpact = 0
    if ((month >= 11 || month <= 1) || (month >= 5 && month <= 7)) {
      weatherImpact = 0.6 // Higher weather impact in summer/winter
    } else {
      weatherImpact = 0.3 // Lower weather impact in spring/fall
    }

    return {
      holidaySeason,
      vacationPeriod,
      weatherImpact,
    }
  }

  /**
   * Calculate communication effectiveness score
   */
  private calculateCommunicationEffectiveness(patientData: PatientBehaviorData): number {
    const preferences = patientData.communicationPreferences
    let score = 0

    // WhatsApp is most effective in Brazil
    if (preferences.whatsapp) score += 0.4
    if (preferences.sms) score += 0.3
    if (preferences.email) score += 0.2
    if (preferences.phone) score += 0.1

    return Math.min(1, score)
  }

  /**
   * Update patient behavior data after appointment
   */
  async updatePatientBehavior(
    patientId: string,
    appointmentData: {
      date: Date
      status: 'completed' | 'no_show' | 'cancelled' | 'rescheduled'
      procedureType: string
      leadTimeDays: number
      cost: number
    },
  ): Promise<void> {
    const patientData = await this.getPatientBehaviorData(patientId)
    patientData.appointmentHistory.push(appointmentData)

    // Update cache
    this.patientDataCache.set(patientId, patientData)
  }

  /**
   * Get global no-show statistics
   */
  async getGlobalNoShowStats(): Promise<{
    overallRate: number
    byProcedureType: Record<string, number>
    byTimeOfDay: Record<string, number>
    seasonalTrends: Array<{ month: number; rate: number }>
  }> {
    // Mock implementation - would aggregate from database
    return {
      overallRate: 0.15, // 15% average no-show rate
      byProcedureType: {
        botox: 0.12,
        filler: 0.18,
        laser: 0.10,
        facial: 0.08,
        surgical: 0.05,
      },
      byTimeOfDay: {
        morning: 0.18,
        afternoon: 0.12,
        evening: 0.15,
      },
      seasonalTrends: [
        { month: 0, rate: 0.20 }, // January (vacation)
        { month: 6, rate: 0.18 }, // July (vacation)
        { month: 11, rate: 0.25 }, // December (holidays)
      ],
    }
  }

  private initializeModel(): void {
    // Initialize ML model with trained weights
    // This would load model parameters from storage
  }
}
