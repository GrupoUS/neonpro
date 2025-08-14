import { createClient } from '@/lib/supabase/client'
import { AnalyticsFilter } from './scheduling-analytics'

type SupabaseClient = ReturnType<typeof createClient>

// Performance Calculation Interfaces
export interface PerformanceMetrics {
  efficiency: EfficiencyMetrics
  productivity: ProductivityMetrics
  quality: QualityMetrics
  utilization: UtilizationMetrics
  satisfaction: SatisfactionMetrics
}

export interface EfficiencyMetrics {
  appointmentCompletionRate: number
  averageAppointmentDuration: number
  scheduledVsActualDuration: number
  timeUtilizationRate: number
  taskCompletionEfficiency: number
  resourceEfficiencyScore: number
}

export interface ProductivityMetrics {
  appointmentsPerHour: number
  appointmentsPerDay: number
  revenuePerHour: number
  revenuePerAppointment: number
  patientThroughput: number
  productivityTrend: number
}

export interface QualityMetrics {
  patientSatisfactionScore: number
  treatmentSuccessRate: number
  complicationRate: number
  followUpComplianceRate: number
  qualityScoreDistribution: { score: number; count: number }[]
  qualityTrend: number
}

export interface UtilizationMetrics {
  staffUtilizationRate: number
  equipmentUtilizationRate: number
  roomUtilizationRate: number
  capacityUtilizationRate: number
  peakUtilizationHours: string[]
  utilizationTrend: number
}

export interface SatisfactionMetrics {
  overallSatisfactionScore: number
  serviceQualityScore: number
  waitTimeScore: number
  staffInteractionScore: number
  facilityScore: number
  recommendationRate: number
  satisfactionTrend: number
}

export interface BenchmarkComparison {
  metric: string
  currentValue: number
  industryBenchmark: number
  percentileRank: number
  performanceGap: number
  improvementTarget: number
  achievabilityScore: number
}

export interface PerformanceAlert {
  id: string
  type: 'efficiency' | 'productivity' | 'quality' | 'utilization' | 'satisfaction'
  severity: 'low' | 'medium' | 'high' | 'critical'
  metric: string
  currentValue: number
  threshold: number
  trend: 'improving' | 'declining' | 'stable'
  impact: string
  recommendations: string[]
  priority: number
}

export interface OptimizationRecommendation {
  category: string
  title: string
  description: string
  expectedImpact: number
  implementationEffort: 'low' | 'medium' | 'high'
  timeframe: string
  priority: number
  metrics: string[]
  steps: string[]
}

/**
 * Advanced Performance Calculator
 * Calculates comprehensive performance metrics, benchmarks, and optimization recommendations
 */
export class PerformanceCalculator {
  private supabase: SupabaseClient
  private cache: Map<string, { data: any; timestamp: number }>
  private readonly CACHE_TTL = 10 * 60 * 1000 // 10 minutes

  // Industry benchmarks (these would typically come from external data sources)
  private readonly INDUSTRY_BENCHMARKS = {
    appointmentCompletionRate: 92,
    patientSatisfactionScore: 4.2,
    staffUtilizationRate: 75,
    revenuePerHour: 180,
    waitTimeMinutes: 15,
    noShowRate: 8,
    cancellationRate: 12
  }

  constructor() {
    this.supabase = createClient()
    this.cache = new Map()
  }

  /**
   * Calculate comprehensive performance metrics
   */
  async calculatePerformanceMetrics(filter: AnalyticsFilter): Promise<PerformanceMetrics> {
    const cacheKey = `performance_${JSON.stringify(filter)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const [efficiency, productivity, quality, utilization, satisfaction] = await Promise.all([
        this.calculateEfficiencyMetrics(filter),
        this.calculateProductivityMetrics(filter),
        this.calculateQualityMetrics(filter),
        this.calculateUtilizationMetrics(filter),
        this.calculateSatisfactionMetrics(filter)
      ])

      const result: PerformanceMetrics = {
        efficiency,
        productivity,
        quality,
        utilization,
        satisfaction
      }

      this.setCachedData(cacheKey, result)
      return result

    } catch (error) {
      console.error('Error calculating performance metrics:', error)
      throw new Error('Failed to calculate performance metrics')
    }
  }

  /**
   * Calculate efficiency metrics
   */
  private async calculateEfficiencyMetrics(filter: AnalyticsFilter): Promise<EfficiencyMetrics> {
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        services(duration, price),
        staff(id, name)
      `)
      .gte('scheduled_at', filter.startDate.toISOString())
      .lte('scheduled_at', filter.endDate.toISOString())

    if (error) throw error

    const totalAppointments = appointments?.length || 0
    const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0
    
    // Appointment completion rate
    const appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0

    // Average appointment duration
    const totalDuration = appointments?.reduce((sum, a) => sum + (a.actual_duration || a.scheduled_duration || 0), 0) || 0
    const averageAppointmentDuration = totalAppointments > 0 ? totalDuration / totalAppointments : 0

    // Scheduled vs actual duration accuracy
    const durationAccuracy = appointments?.filter(a => a.actual_duration && a.scheduled_duration)
      .map(a => {
        const variance = Math.abs(a.actual_duration - a.scheduled_duration) / a.scheduled_duration
        return Math.max(0, 1 - variance) * 100
      }) || []
    const scheduledVsActualDuration = durationAccuracy.length > 0 ? 
      durationAccuracy.reduce((sum, acc) => sum + acc, 0) / durationAccuracy.length : 0

    // Time utilization rate
    const scheduledTime = appointments?.reduce((sum, a) => sum + (a.scheduled_duration || 0), 0) || 0
    const actualTime = appointments?.reduce((sum, a) => sum + (a.actual_duration || a.scheduled_duration || 0), 0) || 0
    const timeUtilizationRate = scheduledTime > 0 ? (actualTime / scheduledTime) * 100 : 0

    // Task completion efficiency (completed on time)
    const onTimeCompletions = appointments?.filter(a => {
      if (!a.actual_duration || !a.scheduled_duration) return false
      return a.actual_duration <= a.scheduled_duration * 1.1 // 10% tolerance
    }).length || 0
    const taskCompletionEfficiency = completedAppointments > 0 ? (onTimeCompletions / completedAppointments) * 100 : 0

    // Resource efficiency score (composite metric)
    const resourceEfficiencyScore = (
      appointmentCompletionRate * 0.3 +
      scheduledVsActualDuration * 0.25 +
      timeUtilizationRate * 0.25 +
      taskCompletionEfficiency * 0.2
    )

    return {
      appointmentCompletionRate,
      averageAppointmentDuration,
      scheduledVsActualDuration,
      timeUtilizationRate,
      taskCompletionEfficiency,
      resourceEfficiencyScore
    }
  }

  /**
   * Calculate productivity metrics
   */
  private async calculateProductivityMetrics(filter: AnalyticsFilter): Promise<ProductivityMetrics> {
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        services(price),
        staff(id)
      `)
      .gte('scheduled_at', filter.startDate.toISOString())
      .lte('scheduled_at', filter.endDate.toISOString())
      .eq('status', 'completed')

    if (error) throw error

    const totalAppointments = appointments?.length || 0
    const totalRevenue = appointments?.reduce((sum, a) => sum + (a.services?.price || 0), 0) || 0
    
    // Calculate time periods
    const diffTime = filter.endDate.getTime() - filter.startDate.getTime()
    const totalHours = diffTime / (1000 * 60 * 60)
    const totalDays = diffTime / (1000 * 60 * 60 * 24)
    const workingHours = totalDays * 8 // Assuming 8-hour workdays

    // Productivity calculations
    const appointmentsPerHour = workingHours > 0 ? totalAppointments / workingHours : 0
    const appointmentsPerDay = totalDays > 0 ? totalAppointments / totalDays : 0
    const revenuePerHour = workingHours > 0 ? totalRevenue / workingHours : 0
    const revenuePerAppointment = totalAppointments > 0 ? totalRevenue / totalAppointments : 0

    // Patient throughput (unique patients served)
    const uniquePatients = new Set(appointments?.map(a => a.patient_id)).size
    const patientThroughput = totalDays > 0 ? uniquePatients / totalDays : 0

    // Productivity trend (compare with previous period)
    const productivityTrend = await this.calculateProductivityTrend(filter)

    return {
      appointmentsPerHour,
      appointmentsPerDay,
      revenuePerHour,
      revenuePerAppointment,
      patientThroughput,
      productivityTrend
    }
  }

  /**
   * Calculate quality metrics
   */
  private async calculateQualityMetrics(filter: AnalyticsFilter): Promise<QualityMetrics> {
    // Get patient feedback data
    const { data: feedback, error: feedbackError } = await this.supabase
      .from('patient_feedback')
      .select(`
        *,
        appointments(scheduled_at, status)
      `)
      .gte('appointments.scheduled_at', filter.startDate.toISOString())
      .lte('appointments.scheduled_at', filter.endDate.toISOString())

    if (feedbackError) throw feedbackError

    // Calculate satisfaction score
    const ratings = feedback?.map(f => f.rating).filter(r => r !== null) || []
    const patientSatisfactionScore = ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0

    // Treatment success rate (based on follow-up outcomes)
    const { data: treatments, error: treatmentError } = await this.supabase
      .from('appointments')
      .select(`
        *,
        treatment_outcomes(success, complications)
      `)
      .gte('scheduled_at', filter.startDate.toISOString())
      .lte('scheduled_at', filter.endDate.toISOString())
      .eq('status', 'completed')

    if (treatmentError) throw treatmentError

    const treatmentsWithOutcomes = treatments?.filter(t => t.treatment_outcomes) || []
    const successfulTreatments = treatmentsWithOutcomes.filter(t => t.treatment_outcomes?.success) || []
    const treatmentSuccessRate = treatmentsWithOutcomes.length > 0 ? 
      (successfulTreatments.length / treatmentsWithOutcomes.length) * 100 : 0

    // Complication rate
    const complicatedTreatments = treatmentsWithOutcomes.filter(t => t.treatment_outcomes?.complications) || []
    const complicationRate = treatmentsWithOutcomes.length > 0 ? 
      (complicatedTreatments.length / treatmentsWithOutcomes.length) * 100 : 0

    // Follow-up compliance rate
    const { data: followUps, error: followUpError } = await this.supabase
      .from('follow_up_appointments')
      .select('*')
      .gte('scheduled_date', filter.startDate.toISOString())
      .lte('scheduled_date', filter.endDate.toISOString())

    if (followUpError) throw followUpError

    const totalFollowUps = followUps?.length || 0
    const completedFollowUps = followUps?.filter(f => f.status === 'completed').length || 0
    const followUpComplianceRate = totalFollowUps > 0 ? (completedFollowUps / totalFollowUps) * 100 : 0

    // Quality score distribution
    const scoreRanges = [1, 2, 3, 4, 5]
    const qualityScoreDistribution = scoreRanges.map(score => ({
      score,
      count: ratings.filter(r => Math.floor(r) === score).length
    }))

    // Quality trend
    const qualityTrend = await this.calculateQualityTrend(filter)

    return {
      patientSatisfactionScore,
      treatmentSuccessRate,
      complicationRate,
      followUpComplianceRate,
      qualityScoreDistribution,
      qualityTrend
    }
  }

  /**
   * Calculate utilization metrics
   */
  private async calculateUtilizationMetrics(filter: AnalyticsFilter): Promise<UtilizationMetrics> {
    // Staff utilization
    const { data: staffSchedules, error: staffError } = await this.supabase
      .from('staff_schedules')
      .select(`
        *,
        staff(id, name),
        appointments(id, actual_duration, scheduled_duration)
      `)
      .gte('date', filter.startDate.toISOString().split('T')[0])
      .lte('date', filter.endDate.toISOString().split('T')[0])

    if (staffError) throw staffError

    const totalScheduledHours = staffSchedules?.reduce((sum, s) => {
      const start = new Date(`${s.date}T${s.start_time}`)
      const end = new Date(`${s.date}T${s.end_time}`)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0) || 0

    const totalWorkedHours = staffSchedules?.reduce((sum, s) => {
      return sum + (s.appointments?.reduce((appointmentSum: number, a: any) => {
        return appointmentSum + ((a.actual_duration || a.scheduled_duration || 0) / 60)
      }, 0) || 0)
    }, 0) || 0

    const staffUtilizationRate = totalScheduledHours > 0 ? (totalWorkedHours / totalScheduledHours) * 100 : 0

    // Equipment utilization (placeholder - would need equipment tracking)
    const equipmentUtilizationRate = 75 // Placeholder

    // Room utilization
    const { data: roomBookings, error: roomError } = await this.supabase
      .from('appointments')
      .select('room_id, scheduled_duration, actual_duration')
      .gte('scheduled_at', filter.startDate.toISOString())
      .lte('scheduled_at', filter.endDate.toISOString())
      .not('room_id', 'is', null)

    if (roomError) throw roomError

    const roomUsageHours = roomBookings?.reduce((sum, booking) => {
      return sum + ((booking.actual_duration || booking.scheduled_duration || 0) / 60)
    }, 0) || 0

    // Assuming 8 hours per day per room, calculate total available room hours
    const uniqueRooms = new Set(roomBookings?.map(b => b.room_id)).size
    const diffDays = (filter.endDate.getTime() - filter.startDate.getTime()) / (1000 * 60 * 60 * 24)
    const totalRoomHours = uniqueRooms * diffDays * 8

    const roomUtilizationRate = totalRoomHours > 0 ? (roomUsageHours / totalRoomHours) * 100 : 0

    // Overall capacity utilization
    const capacityUtilizationRate = (staffUtilizationRate + equipmentUtilizationRate + roomUtilizationRate) / 3

    // Peak utilization hours
    const peakUtilizationHours = await this.identifyPeakUtilizationHours(filter)

    // Utilization trend
    const utilizationTrend = await this.calculateUtilizationTrend(filter)

    return {
      staffUtilizationRate,
      equipmentUtilizationRate,
      roomUtilizationRate,
      capacityUtilizationRate,
      peakUtilizationHours,
      utilizationTrend
    }
  }

  /**
   * Calculate satisfaction metrics
   */
  private async calculateSatisfactionMetrics(filter: AnalyticsFilter): Promise<SatisfactionMetrics> {
    const { data: feedback, error } = await this.supabase
      .from('patient_feedback')
      .select(`
        *,
        appointments(scheduled_at)
      `)
      .gte('appointments.scheduled_at', filter.startDate.toISOString())
      .lte('appointments.scheduled_at', filter.endDate.toISOString())

    if (error) throw error

    const feedbackData = feedback || []

    // Overall satisfaction score
    const overallRatings = feedbackData.map(f => f.overall_rating).filter(r => r !== null)
    const overallSatisfactionScore = overallRatings.length > 0 ? 
      overallRatings.reduce((sum, r) => sum + r, 0) / overallRatings.length : 0

    // Service quality score
    const serviceRatings = feedbackData.map(f => f.service_quality_rating).filter(r => r !== null)
    const serviceQualityScore = serviceRatings.length > 0 ? 
      serviceRatings.reduce((sum, r) => sum + r, 0) / serviceRatings.length : 0

    // Wait time score
    const waitTimeRatings = feedbackData.map(f => f.wait_time_rating).filter(r => r !== null)
    const waitTimeScore = waitTimeRatings.length > 0 ? 
      waitTimeRatings.reduce((sum, r) => sum + r, 0) / waitTimeRatings.length : 0

    // Staff interaction score
    const staffRatings = feedbackData.map(f => f.staff_interaction_rating).filter(r => r !== null)
    const staffInteractionScore = staffRatings.length > 0 ? 
      staffRatings.reduce((sum, r) => sum + r, 0) / staffRatings.length : 0

    // Facility score
    const facilityRatings = feedbackData.map(f => f.facility_rating).filter(r => r !== null)
    const facilityScore = facilityRatings.length > 0 ? 
      facilityRatings.reduce((sum, r) => sum + r, 0) / facilityRatings.length : 0

    // Recommendation rate (percentage who would recommend)
    const recommendations = feedbackData.filter(f => f.would_recommend === true).length
    const recommendationRate = feedbackData.length > 0 ? (recommendations / feedbackData.length) * 100 : 0

    // Satisfaction trend
    const satisfactionTrend = await this.calculateSatisfactionTrend(filter)

    return {
      overallSatisfactionScore,
      serviceQualityScore,
      waitTimeScore,
      staffInteractionScore,
      facilityScore,
      recommendationRate,
      satisfactionTrend
    }
  }

  /**
   * Generate benchmark comparisons
   */
  async generateBenchmarkComparisons(metrics: PerformanceMetrics): Promise<BenchmarkComparison[]> {
    const comparisons: BenchmarkComparison[] = [
      {
        metric: 'Appointment Completion Rate',
        currentValue: metrics.efficiency.appointmentCompletionRate,
        industryBenchmark: this.INDUSTRY_BENCHMARKS.appointmentCompletionRate,
        percentileRank: this.calculatePercentileRank(metrics.efficiency.appointmentCompletionRate, this.INDUSTRY_BENCHMARKS.appointmentCompletionRate),
        performanceGap: metrics.efficiency.appointmentCompletionRate - this.INDUSTRY_BENCHMARKS.appointmentCompletionRate,
        improvementTarget: Math.max(this.INDUSTRY_BENCHMARKS.appointmentCompletionRate, metrics.efficiency.appointmentCompletionRate * 1.05),
        achievabilityScore: this.calculateAchievabilityScore(metrics.efficiency.appointmentCompletionRate, this.INDUSTRY_BENCHMARKS.appointmentCompletionRate)
      },
      {
        metric: 'Patient Satisfaction Score',
        currentValue: metrics.satisfaction.overallSatisfactionScore,
        industryBenchmark: this.INDUSTRY_BENCHMARKS.patientSatisfactionScore,
        percentileRank: this.calculatePercentileRank(metrics.satisfaction.overallSatisfactionScore, this.INDUSTRY_BENCHMARKS.patientSatisfactionScore),
        performanceGap: metrics.satisfaction.overallSatisfactionScore - this.INDUSTRY_BENCHMARKS.patientSatisfactionScore,
        improvementTarget: Math.max(this.INDUSTRY_BENCHMARKS.patientSatisfactionScore, metrics.satisfaction.overallSatisfactionScore * 1.1),
        achievabilityScore: this.calculateAchievabilityScore(metrics.satisfaction.overallSatisfactionScore, this.INDUSTRY_BENCHMARKS.patientSatisfactionScore)
      },
      {
        metric: 'Staff Utilization Rate',
        currentValue: metrics.utilization.staffUtilizationRate,
        industryBenchmark: this.INDUSTRY_BENCHMARKS.staffUtilizationRate,
        percentileRank: this.calculatePercentileRank(metrics.utilization.staffUtilizationRate, this.INDUSTRY_BENCHMARKS.staffUtilizationRate),
        performanceGap: metrics.utilization.staffUtilizationRate - this.INDUSTRY_BENCHMARKS.staffUtilizationRate,
        improvementTarget: Math.max(this.INDUSTRY_BENCHMARKS.staffUtilizationRate, metrics.utilization.staffUtilizationRate * 1.05),
        achievabilityScore: this.calculateAchievabilityScore(metrics.utilization.staffUtilizationRate, this.INDUSTRY_BENCHMARKS.staffUtilizationRate)
      },
      {
        metric: 'Revenue Per Hour',
        currentValue: metrics.productivity.revenuePerHour,
        industryBenchmark: this.INDUSTRY_BENCHMARKS.revenuePerHour,
        percentileRank: this.calculatePercentileRank(metrics.productivity.revenuePerHour, this.INDUSTRY_BENCHMARKS.revenuePerHour),
        performanceGap: metrics.productivity.revenuePerHour - this.INDUSTRY_BENCHMARKS.revenuePerHour,
        improvementTarget: Math.max(this.INDUSTRY_BENCHMARKS.revenuePerHour, metrics.productivity.revenuePerHour * 1.1),
        achievabilityScore: this.calculateAchievabilityScore(metrics.productivity.revenuePerHour, this.INDUSTRY_BENCHMARKS.revenuePerHour)
      }
    ]

    return comparisons
  }

  // Helper methods
  private getCachedData(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private calculatePercentileRank(currentValue: number, benchmark: number): number {
    // Simplified percentile calculation
    if (currentValue >= benchmark) {
      return Math.min(95, 50 + (currentValue - benchmark) / benchmark * 45)
    } else {
      return Math.max(5, 50 - (benchmark - currentValue) / benchmark * 45)
    }
  }

  private calculateAchievabilityScore(currentValue: number, benchmark: number): number {
    const gap = Math.abs(currentValue - benchmark)
    const relativeGap = gap / benchmark
    
    if (relativeGap <= 0.05) return 95 // Very achievable
    if (relativeGap <= 0.1) return 85  // Achievable
    if (relativeGap <= 0.2) return 70  // Moderately achievable
    if (relativeGap <= 0.3) return 50  // Challenging
    return 30 // Very challenging
  }

  // Placeholder methods for trend calculations
  private async calculateProductivityTrend(filter: AnalyticsFilter): Promise<number> {
    // Implementation would compare current period with previous period
    return 0 // Placeholder
  }

  private async calculateQualityTrend(filter: AnalyticsFilter): Promise<number> {
    // Implementation would compare current period with previous period
    return 0 // Placeholder
  }

  private async calculateUtilizationTrend(filter: AnalyticsFilter): Promise<number> {
    // Implementation would compare current period with previous period
    return 0 // Placeholder
  }

  private async calculateSatisfactionTrend(filter: AnalyticsFilter): Promise<number> {
    // Implementation would compare current period with previous period
    return 0 // Placeholder
  }

  private async identifyPeakUtilizationHours(filter: AnalyticsFilter): Promise<string[]> {
    // Implementation would analyze hourly utilization patterns
    return [] // Placeholder
  }
}

export default PerformanceCalculator