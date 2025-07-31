/**
 * AI-Powered Automatic Scheduling System
 * Story 2.3: AI-Powered Automatic Scheduling Implementation
 * 
 * This is the main entry point for the AI scheduling system that integrates:
 * - AI Scheduling Core Algorithm
 * - Advanced Optimization Engine
 * - Real-time Adaptive Scheduling
 * - Compliance and Rules Engine
 * 
 * Features:
 * - Intelligent appointment scheduling with AI optimization
 * - Real-time conflict resolution and adaptive rescheduling
 * - Comprehensive compliance validation (Brazilian healthcare regulations)
 * - Multi-objective optimization (patient satisfaction, revenue, efficiency)
 * - Predictive scheduling adjustments
 * - Emergency scheduling protocols
 */

import { createClient } from '@/lib/supabase/client'
import { AISchedulingCore, type SchedulingCriteria, type SchedulingRecommendation } from './ai-scheduling-core'
import { OptimizationEngine, type OptimizationResult } from './optimization-engine'
import { RealTimeAdaptiveScheduling } from './real-time-adaptive'
import { ComplianceRulesEngine, type ComplianceValidationResult } from './compliance-rules-engine'

// Main AI Scheduling System Configuration
interface AISchedulingConfig {
  enableRealTimeAdaptive: boolean
  enableComplianceValidation: boolean
  enableOptimization: boolean
  optimizationWeights: {
    patientSatisfaction: number
    revenueOptimization: number
    staffEfficiency: number
    resourceUtilization: number
  }
  realTimeSettings: {
    monitoringInterval: number
    conflictResolutionTimeout: number
    predictiveAdjustmentWindow: number
  }
  complianceSettings: {
    strictMode: boolean
    allowOverrides: boolean
    requireApprovals: boolean
  }
}

// Scheduling Request
interface SchedulingRequest {
  criteria: SchedulingCriteria
  preferences?: {
    preferredTimes?: Date[]
    avoidTimes?: Date[]
    preferredStaff?: string[]
    maxWaitTime?: number
    allowAlternatives?: boolean
  }
  context?: {
    isReschedule?: boolean
    originalAppointmentId?: string
    urgencyReason?: string
    specialRequirements?: string[]
  }
}

// Scheduling Response
interface SchedulingResponse {
  success: boolean
  recommendations: SchedulingRecommendation[]
  optimizationResult?: OptimizationResult
  complianceResult?: ComplianceValidationResult
  alternatives: SchedulingRecommendation[]
  warnings: string[]
  errors: string[]
  metadata: {
    processingTime: number
    algorithmsUsed: string[]
    confidenceScore: number
    nextAvailableSlot?: Date
  }
}

// Scheduling Status
type SchedulingStatus = 
  | 'pending'
  | 'processing'
  | 'optimizing'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'requires_approval'

// Scheduling Event
interface SchedulingEvent {
  id: string
  type: 'request' | 'recommendation' | 'conflict' | 'approval' | 'completion'
  status: SchedulingStatus
  timestamp: Date
  data: any
  userId?: string
}

class AISchedulingSystem {
  private supabase = createClient()
  private aiCore: AISchedulingCore
  private optimizationEngine: OptimizationEngine
  private realTimeAdaptive: RealTimeAdaptiveScheduling
  private complianceEngine: ComplianceRulesEngine
  private config: AISchedulingConfig
  private eventListeners: Map<string, Function[]> = new Map()

  constructor(config?: Partial<AISchedulingConfig>) {
    // Initialize with default configuration
    this.config = {
      enableRealTimeAdaptive: true,
      enableComplianceValidation: true,
      enableOptimization: true,
      optimizationWeights: {
        patientSatisfaction: 0.3,
        revenueOptimization: 0.25,
        staffEfficiency: 0.25,
        resourceUtilization: 0.2
      },
      realTimeSettings: {
        monitoringInterval: 30000, // 30 seconds
        conflictResolutionTimeout: 300000, // 5 minutes
        predictiveAdjustmentWindow: 3600000 // 1 hour
      },
      complianceSettings: {
        strictMode: true,
        allowOverrides: false,
        requireApprovals: true
      },
      ...config
    }

    // Initialize components
    this.aiCore = new AISchedulingCore()
    this.optimizationEngine = new OptimizationEngine()
    this.realTimeAdaptive = new RealTimeAdaptiveScheduling()
    this.complianceEngine = new ComplianceRulesEngine()

    // Setup event listeners
    this.setupEventListeners()
  }

  /**
   * Main scheduling method - processes a scheduling request
   */
  async scheduleAppointment(request: SchedulingRequest): Promise<SchedulingResponse> {
    const startTime = Date.now()
    const algorithmsUsed: string[] = []
    const warnings: string[] = []
    const errors: string[] = []

    try {
      // Emit scheduling start event
      this.emitEvent({
        id: `schedule-${Date.now()}`,
        type: 'request',
        status: 'processing',
        timestamp: new Date(),
        data: request
      })

      // Step 1: Generate initial recommendations using AI Core
      algorithmsUsed.push('AI Core Algorithm')
      const initialRecommendations = await this.aiCore.generateRecommendations(
        request.criteria,
        request.preferences
      )

      if (initialRecommendations.length === 0) {
        return {
          success: false,
          recommendations: [],
          alternatives: [],
          warnings: ['No available time slots found for the specified criteria'],
          errors: [],
          metadata: {
            processingTime: Date.now() - startTime,
            algorithmsUsed,
            confidenceScore: 0
          }
        }
      }

      // Step 2: Apply optimization if enabled
      let optimizedRecommendations = initialRecommendations
      let optimizationResult: OptimizationResult | undefined

      if (this.config.enableOptimization) {
        algorithmsUsed.push('Multi-Objective Optimization')
        optimizationResult = await this.optimizationEngine.optimizeSchedule(
          initialRecommendations,
          request.criteria,
          this.config.optimizationWeights
        )
        optimizedRecommendations = optimizationResult.optimizedRecommendations
      }

      // Step 3: Validate compliance if enabled
      let complianceResult: ComplianceValidationResult | undefined
      let compliantRecommendations = optimizedRecommendations

      if (this.config.enableComplianceValidation) {
        algorithmsUsed.push('Compliance Validation')
        
        // Validate each recommendation
        const validatedRecommendations: SchedulingRecommendation[] = []
        
        for (const recommendation of optimizedRecommendations) {
          const validation = await this.complianceEngine.validateCompliance(
            recommendation,
            request.criteria,
            request.context
          )

          if (validation.isCompliant || !this.config.complianceSettings.strictMode) {
            validatedRecommendations.push(recommendation)
          } else {
            warnings.push(`Recommendation excluded due to compliance violations: ${validation.violations.map(v => v.description).join(', ')}`)
          }

          // Store the first compliance result for response
          if (!complianceResult) {
            complianceResult = validation
          }
        }

        compliantRecommendations = validatedRecommendations
      }

      // Step 4: Generate alternatives
      const alternatives = await this.generateAlternatives(
        request,
        compliantRecommendations
      )

      // Step 5: Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        compliantRecommendations,
        optimizationResult,
        complianceResult
      )

      // Step 6: Setup real-time monitoring if enabled
      if (this.config.enableRealTimeAdaptive && compliantRecommendations.length > 0) {
        algorithmsUsed.push('Real-time Adaptive Monitoring')
        await this.setupRealTimeMonitoring(compliantRecommendations[0], request)
      }

      // Prepare response
      const response: SchedulingResponse = {
        success: compliantRecommendations.length > 0,
        recommendations: compliantRecommendations,
        optimizationResult,
        complianceResult,
        alternatives,
        warnings,
        errors,
        metadata: {
          processingTime: Date.now() - startTime,
          algorithmsUsed,
          confidenceScore,
          nextAvailableSlot: alternatives.length > 0 ? alternatives[0].timeSlot.startTime : undefined
        }
      }

      // Emit completion event
      this.emitEvent({
        id: `schedule-${Date.now()}`,
        type: 'completion',
        status: response.success ? 'completed' : 'failed',
        timestamp: new Date(),
        data: response
      })

      return response
    } catch (error) {
      console.error('Error in AI scheduling system:', error)
      errors.push(`System error: ${error instanceof Error ? error.message : 'Unknown error'}`)

      return {
        success: false,
        recommendations: [],
        alternatives: [],
        warnings,
        errors,
        metadata: {
          processingTime: Date.now() - startTime,
          algorithmsUsed,
          confidenceScore: 0
        }
      }
    }
  }

  /**
   * Reschedule an existing appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newCriteria: Partial<SchedulingCriteria>,
    reason?: string
  ): Promise<SchedulingResponse> {
    try {
      // Get existing appointment
      const { data: appointment } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      if (!appointment) {
        throw new Error('Appointment not found')
      }

      // Create reschedule request
      const request: SchedulingRequest = {
        criteria: {
          patientId: appointment.patient_id,
          treatmentId: appointment.treatment_id,
          preferredDate: newCriteria.preferredDate || new Date(appointment.scheduled_date),
          urgencyLevel: newCriteria.urgencyLevel || appointment.urgency_level,
          duration: newCriteria.duration || appointment.duration_minutes,
          isFollowUp: newCriteria.isFollowUp || appointment.is_follow_up,
          specialRequirements: newCriteria.specialRequirements || appointment.special_requirements
        },
        context: {
          isReschedule: true,
          originalAppointmentId: appointmentId,
          urgencyReason: reason
        }
      }

      // Process reschedule
      const response = await this.scheduleAppointment(request)

      // If successful, update the original appointment
      if (response.success && response.recommendations.length > 0) {
        const newRecommendation = response.recommendations[0]
        
        await this.supabase
          .from('appointments')
          .update({
            scheduled_date: newRecommendation.timeSlot.startTime.toISOString(),
            staff_id: newRecommendation.staffId,
            room_id: newRecommendation.roomId,
            updated_at: new Date().toISOString(),
            reschedule_reason: reason
          })
          .eq('id', appointmentId)
      }

      return response
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      throw new Error('Failed to reschedule appointment')
    }
  }

  /**
   * Cancel an appointment and handle real-time adjustments
   */
  async cancelAppointment(
    appointmentId: string,
    reason: string,
    notifyPatient: boolean = true
  ): Promise<void> {
    try {
      // Get appointment details
      const { data: appointment } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      if (!appointment) {
        throw new Error('Appointment not found')
      }

      // Update appointment status
      await this.supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      // Trigger real-time adaptive adjustments
      if (this.config.enableRealTimeAdaptive) {
        await this.realTimeAdaptive.handleAppointmentCancellation({
          appointmentId,
          scheduledTime: new Date(appointment.scheduled_date),
          staffId: appointment.staff_id,
          roomId: appointment.room_id,
          reason
        })
      }

      // Notify patient if requested
      if (notifyPatient) {
        await this.notifyPatientCancellation(appointment.patient_id, appointmentId, reason)
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      throw new Error('Failed to cancel appointment')
    }
  }

  /**
   * Get scheduling analytics and insights
   */
  async getSchedulingAnalytics(dateRange: { start: Date; end: Date }): Promise<{
    totalAppointments: number
    successfulSchedules: number
    rescheduledAppointments: number
    cancelledAppointments: number
    averageProcessingTime: number
    complianceScore: number
    optimizationMetrics: {
      patientSatisfactionScore: number
      revenueOptimization: number
      staffEfficiencyScore: number
      resourceUtilizationScore: number
    }
    topViolations: Array<{ rule: string; count: number }>
    recommendations: string[]
  }> {
    try {
      // Get appointment statistics
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())

      // Get compliance validations
      const { data: validations } = await this.supabase
        .from('compliance_validations')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())

      // Calculate metrics
      const totalAppointments = appointments?.length || 0
      const successfulSchedules = appointments?.filter(a => a.status === 'scheduled').length || 0
      const rescheduledAppointments = appointments?.filter(a => a.reschedule_reason).length || 0
      const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0

      const averageComplianceScore = validations?.reduce((sum, v) => sum + (v.compliance_score || 0), 0) / (validations?.length || 1)

      // Generate recommendations based on analytics
      const recommendations = this.generateAnalyticsRecommendations({
        totalAppointments,
        successfulSchedules,
        rescheduledAppointments,
        cancelledAppointments,
        averageComplianceScore
      })

      return {
        totalAppointments,
        successfulSchedules,
        rescheduledAppointments,
        cancelledAppointments,
        averageProcessingTime: 2500, // Placeholder - would be calculated from actual data
        complianceScore: averageComplianceScore,
        optimizationMetrics: {
          patientSatisfactionScore: 85, // Placeholder - would be calculated from patient feedback
          revenueOptimization: 78, // Placeholder - would be calculated from revenue data
          staffEfficiencyScore: 82, // Placeholder - would be calculated from staff utilization
          resourceUtilizationScore: 76 // Placeholder - would be calculated from resource usage
        },
        topViolations: [], // Placeholder - would be calculated from compliance data
        recommendations
      }
    } catch (error) {
      console.error('Error getting scheduling analytics:', error)
      throw new Error('Failed to get scheduling analytics')
    }
  }

  /**
   * Generate alternatives for scheduling
   */
  private async generateAlternatives(
    request: SchedulingRequest,
    primaryRecommendations: SchedulingRecommendation[]
  ): Promise<SchedulingRecommendation[]> {
    try {
      // If we have primary recommendations, generate alternatives around them
      if (primaryRecommendations.length > 0) {
        const alternativeCriteria: SchedulingCriteria = {
          ...request.criteria,
          preferredDate: new Date(request.criteria.preferredDate.getTime() + 24 * 60 * 60 * 1000) // Next day
        }

        const alternatives = await this.aiCore.generateRecommendations(
          alternativeCriteria,
          request.preferences
        )

        return alternatives.slice(0, 3) // Return top 3 alternatives
      }

      // If no primary recommendations, try with relaxed criteria
      const relaxedCriteria: SchedulingCriteria = {
        ...request.criteria,
        urgencyLevel: 'normal', // Relax urgency
        duration: Math.max(30, request.criteria.duration - 15) // Reduce duration slightly
      }

      const alternatives = await this.aiCore.generateRecommendations(
        relaxedCriteria,
        {
          ...request.preferences,
          allowAlternatives: true
        }
      )

      return alternatives.slice(0, 5) // Return top 5 alternatives
    } catch (error) {
      console.error('Error generating alternatives:', error)
      return []
    }
  }

  /**
   * Calculate confidence score for recommendations
   */
  private calculateConfidenceScore(
    recommendations: SchedulingRecommendation[],
    optimizationResult?: OptimizationResult,
    complianceResult?: ComplianceValidationResult
  ): number {
    if (recommendations.length === 0) return 0

    let score = 70 // Base score

    // Add points for optimization
    if (optimizationResult) {
      score += optimizationResult.improvementPercentage * 0.2
    }

    // Add points for compliance
    if (complianceResult) {
      score += complianceResult.complianceScore * 0.3
    }

    // Add points for recommendation quality
    const avgRecommendationScore = recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length
    score += avgRecommendationScore * 0.1

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Setup real-time monitoring for a scheduled appointment
   */
  private async setupRealTimeMonitoring(
    recommendation: SchedulingRecommendation,
    request: SchedulingRequest
  ): Promise<void> {
    try {
      await this.realTimeAdaptive.monitorAppointment({
        appointmentId: `temp-${Date.now()}`, // Would be actual appointment ID
        scheduledTime: recommendation.timeSlot.startTime,
        staffId: recommendation.staffId,
        roomId: recommendation.roomId,
        patientId: request.criteria.patientId,
        treatmentId: request.criteria.treatmentId
      })
    } catch (error) {
      console.error('Error setting up real-time monitoring:', error)
    }
  }

  /**
   * Setup event listeners for system components
   */
  private setupEventListeners(): void {
    // Listen for real-time adaptive events
    this.realTimeAdaptive.on('conflict_detected', (data) => {
      this.emitEvent({
        id: `conflict-${Date.now()}`,
        type: 'conflict',
        status: 'processing',
        timestamp: new Date(),
        data
      })
    })

    this.realTimeAdaptive.on('auto_rescheduled', (data) => {
      this.emitEvent({
        id: `reschedule-${Date.now()}`,
        type: 'recommendation',
        status: 'completed',
        timestamp: new Date(),
        data
      })
    })
  }

  /**
   * Emit scheduling event
   */
  private emitEvent(event: SchedulingEvent): void {
    const listeners = this.eventListeners.get(event.type) || []
    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  /**
   * Add event listener
   */
  on(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  /**
   * Remove event listener
   */
  off(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Notify patient of cancellation
   */
  private async notifyPatientCancellation(
    patientId: string,
    appointmentId: string,
    reason: string
  ): Promise<void> {
    try {
      // This would integrate with notification system
      console.log(`Notifying patient ${patientId} of appointment ${appointmentId} cancellation: ${reason}`)
      
      // Could send email, SMS, push notification, etc.
      // await notificationService.sendCancellationNotification(patientId, appointmentId, reason)
    } catch (error) {
      console.error('Error notifying patient:', error)
    }
  }

  /**
   * Generate analytics recommendations
   */
  private generateAnalyticsRecommendations(metrics: {
    totalAppointments: number
    successfulSchedules: number
    rescheduledAppointments: number
    cancelledAppointments: number
    averageComplianceScore: number
  }): string[] {
    const recommendations: string[] = []

    const successRate = metrics.successfulSchedules / metrics.totalAppointments
    const rescheduleRate = metrics.rescheduledAppointments / metrics.totalAppointments
    const cancellationRate = metrics.cancelledAppointments / metrics.totalAppointments

    if (successRate < 0.8) {
      recommendations.push('Consider adjusting scheduling criteria to improve success rate')
    }

    if (rescheduleRate > 0.15) {
      recommendations.push('High reschedule rate detected - review scheduling accuracy')
    }

    if (cancellationRate > 0.1) {
      recommendations.push('High cancellation rate - consider implementing confirmation reminders')
    }

    if (metrics.averageComplianceScore < 85) {
      recommendations.push('Compliance score below target - review and update compliance rules')
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is optimal - continue current practices')
    }

    return recommendations
  }

  /**
   * Start the AI scheduling system
   */
  async start(): Promise<void> {
    try {
      console.log('Starting AI Scheduling System...')
      
      // Start real-time monitoring if enabled
      if (this.config.enableRealTimeAdaptive) {
        await this.realTimeAdaptive.startMonitoring()
        console.log('Real-time adaptive scheduling started')
      }
      
      console.log('AI Scheduling System started successfully')
    } catch (error) {
      console.error('Error starting AI Scheduling System:', error)
      throw new Error('Failed to start AI Scheduling System')
    }
  }

  /**
   * Stop the AI scheduling system
   */
  async stop(): Promise<void> {
    try {
      console.log('Stopping AI Scheduling System...')
      
      // Stop real-time monitoring
      if (this.config.enableRealTimeAdaptive) {
        await this.realTimeAdaptive.stopMonitoring()
        console.log('Real-time adaptive scheduling stopped')
      }
      
      console.log('AI Scheduling System stopped successfully')
    } catch (error) {
      console.error('Error stopping AI Scheduling System:', error)
      throw new Error('Failed to stop AI Scheduling System')
    }
  }

  /**
   * Get system configuration
   */
  getConfig(): AISchedulingConfig {
    return { ...this.config }
  }

  /**
   * Update system configuration
   */
  updateConfig(updates: Partial<AISchedulingConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}

// Export main class and types
export {
  AISchedulingSystem,
  type AISchedulingConfig,
  type SchedulingRequest,
  type SchedulingResponse,
  type SchedulingEvent,
  type SchedulingStatus
}

// Export component types for external use
export {
  type SchedulingCriteria,
  type SchedulingRecommendation
} from './ai-scheduling-core'

export {
  type OptimizationResult
} from './optimization-engine'

export {
  type ComplianceValidationResult,
  type RuleViolation,
  type RuleWarning
} from './compliance-rules-engine'

// Default export
export default AISchedulingSystem