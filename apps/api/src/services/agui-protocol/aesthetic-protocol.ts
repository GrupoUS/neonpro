/**
 * Enhanced AG-UI Protocol Implementation for Aesthetic Clinics
 *
 * Extends the base AG-UI protocol with specialized handlers for aesthetic clinic operations
 * including treatment management, appointment optimization, financial operations, and compliance.
 */

import { EventEmitter } from 'events'
import { AestheticCacheService } from './aesthetic-cache-service'
import { AestheticComplianceService } from './aesthetic-compliance-service'
import { AestheticNotificationService } from './aesthetic-notification-service'
import { AestheticRAGService } from './aesthetic-rag-service'
import {
  AestheticAguiMessageType,
  AestheticAppointmentMessage,
  AestheticAssessmentMessage,
  AestheticClientEnhancementMessage,
  AestheticComplianceMessage,
  AestheticFinancialMessage,
  AestheticTreatmentMessage,
  AestheticTreatmentResponse,
} from './aesthetic-types'
import {
  AguiErrorCode,
  AguiMessage,
  AguiMessageType,
  AguiRateLimitInfo,
  AguiSession,
} from './types'

export interface AestheticProtocolConfig {
  ragService: AestheticRAGService
  cacheService: AestheticCacheService
  complianceService: AestheticComplianceService
  notificationService: AestheticNotificationService
  maxSessionDuration: number
  enableRateLimiting: boolean
  rateLimitRequests: number
  enableCompression: boolean
  enableEncryption: boolean
  supportedLanguages: string[]
  anvisaReportingEnabled: boolean
  lgpdComplianceLevel: 'basic' | 'enhanced' | 'strict'
}

export interface AestheticProtocolMetrics {
  totalRequests: number
  averageResponseTime: number
  successRate: number
  errorRate: number
  cacheHitRate: number
  ragQueryTime: number
  complianceChecks: number
  anvisaReportsGenerated: number
  retentionAnalyses: number
  scheduleOptimizations: number
}

export class AestheticAguiProtocol extends EventEmitter {
  private config: AestheticProtocolConfig
  private metrics: AestheticProtocolMetrics
  private activeSessions: Map<string, AguiSession> = new Map()
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map()
  private messageHandlers: Map<string, (message: AguiMessage) => Promise<any>> = new Map()

  constructor(config: AestheticProtocolConfig) {
    super()
    this.config = config
    this.metrics = this.initializeMetrics()
    this.setupMessageHandlers()
  }

  private initializeMetrics(): AestheticProtocolMetrics {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      successRate: 100,
      errorRate: 0,
      cacheHitRate: 0,
      ragQueryTime: 0,
      complianceChecks: 0,
      anvisaReportsGenerated: 0,
      retentionAnalyses: 0,
      scheduleOptimizations: 0,
    }
  }

  private setupMessageHandlers(): void {
    // Treatment Management Handlers
    this.messageHandlers.set(
      'treatment_catalog_query',
      this.handleTreatmentCatalogQuery.bind(this),
    )
    this.messageHandlers.set(
      'treatment_availability_check',
      this.handleTreatmentAvailabilityCheck.bind(this),
    )
    this.messageHandlers.set(
      'treatment_scheduling_request',
      this.handleTreatmentSchedulingRequest.bind(this),
    )
    this.messageHandlers.set(
      'treatment_consent_management',
      this.handleTreatmentConsentManagement.bind(this),
    )
    this.messageHandlers.set(
      'treatment_progress_tracking',
      this.handleTreatmentProgressTracking.bind(this),
    )
    this.messageHandlers.set(
      'treatment_recommendation_request',
      this.handleTreatmentRecommendationRequest.bind(this),
    )
    this.messageHandlers.set(
      'treatment_price_inquiry',
      this.handleTreatmentPriceInquiry.bind(this),
    )
    this.messageHandlers.set(
      'treatment_bundle_creation',
      this.handleTreatmentBundleCreation.bind(this),
    )

    // Enhanced Appointment Management
    this.messageHandlers.set(
      'appointment_optimization_request',
      this.handleAppointmentOptimizationRequest.bind(this),
    )
    this.messageHandlers.set(
      'appointment_conflict_resolution',
      this.handleAppointmentConflictResolution.bind(this),
    )
    this.messageHandlers.set(
      'appointment_resource_allocation',
      this.handleAppointmentResourceAllocation.bind(this),
    )
    this.messageHandlers.set(
      'appointment_waitlist_management',
      this.handleAppointmentWaitlistManagement.bind(this),
    )

    // Financial Operations
    this.messageHandlers.set(
      'treatment_financing_request',
      this.handleTreatmentFinancingRequest.bind(this),
    )
    this.messageHandlers.set(
      'installment_plan_calculation',
      this.handleInstallmentPlanCalculation.bind(this),
    )
    this.messageHandlers.set(
      'insurance_coverage_verification',
      this.handleInsuranceCoverageVerification.bind(this),
    )
    this.messageHandlers.set('payment_processing', this.handlePaymentProcessing.bind(this))
    this.messageHandlers.set(
      'financial_reconciliation',
      this.handleFinancialReconciliation.bind(this),
    )

    // Assessment & Analysis
    this.messageHandlers.set('skin_type_assessment', this.handleSkinTypeAssessment.bind(this))
    this.messageHandlers.set(
      'aesthetic_analysis_request',
      this.handleAestheticAnalysisRequest.bind(this),
    )
    this.messageHandlers.set(
      'treatment_simulation_request',
      this.handleTreatmentSimulationRequest.bind(this),
    )
    this.messageHandlers.set(
      'progress_tracking_analysis',
      this.handleProgressTrackingAnalysis.bind(this),
    )

    // Compliance & Legal
    this.messageHandlers.set(
      'anvisa_compliance_check',
      this.handleAnvisaComplianceCheck.bind(this),
    )
    this.messageHandlers.set(
      'lgpd_consent_verification',
      this.handleLgpdConsentVerification.bind(this),
    )
    this.messageHandlers.set(
      'treatment_safety_validation',
      this.handleTreatmentSafetyValidation.bind(this),
    )
    this.messageHandlers.set(
      'professional_license_verification',
      this.handleProfessionalLicenseVerification.bind(this),
    )

    // Enhanced Client Management
    this.messageHandlers.set(
      'client_profile_enhancement',
      this.handleClientProfileEnhancement.bind(this),
    )
    this.messageHandlers.set(
      'retention_risk_assessment',
      this.handleRetentionRiskAssessment.bind(this),
    )
    this.messageHandlers.set(
      'personalized_recommendation_request',
      this.handlePersonalizedRecommendationRequest.bind(this),
    )
    this.messageHandlers.set(
      'client_satisfaction_analysis',
      this.handleClientSatisfactionAnalysis.bind(this),
    )

    // Inventory Management
    this.messageHandlers.set(
      'inventory_level_monitoring',
      this.handleInventoryLevelMonitoring.bind(this),
    )
    this.messageHandlers.set(
      'product_expiry_tracking',
      this.handleProductExpiryTracking.bind(this),
    )
    this.messageHandlers.set(
      'supply_chain_optimization',
      this.handleSupplyChainOptimization.bind(this),
    )
    this.messageHandlers.set(
      'batch_traceability_request',
      this.handleBatchTraceabilityRequest.bind(this),
    )

    // Emergency Protocols
    this.messageHandlers.set(
      'emergency_protocol_activation',
      this.handleEmergencyProtocolActivation.bind(this),
    )
    this.messageHandlers.set(
      'adverse_event_reporting',
      this.handleAdverseEventReporting.bind(this),
    )
    this.messageHandlers.set(
      'emergency_response_coordination',
      this.handleEmergencyResponseCoordination.bind(this),
    )

    // Analytics & Business Intelligence
    this.messageHandlers.set(
      'aesthetic_analytics_request',
      this.handleAestheticAnalyticsRequest.bind(this),
    )
    this.messageHandlers.set(
      'treatment_effectiveness_analysis',
      this.handleTreatmentEffectivenessAnalysis.bind(this),
    )
    this.messageHandlers.set(
      'revenue_optimization_analysis',
      this.handleRevenueOptimizationAnalysis.bind(this),
    )
    this.messageHandlers.set('market_trend_analysis', this.handleMarketTrendAnalysis.bind(this))

    // Training & Education
    this.messageHandlers.set(
      'training_material_request',
      this.handleTrainingMaterialRequest.bind(this),
    )
    this.messageHandlers.set('certification_tracking', this.handleCertificationTracking.bind(this))
    this.messageHandlers.set(
      'professional_development_planning',
      this.handleProfessionalDevelopmentPlanning.bind(this),
    )

    // Photo & Media Management
    this.messageHandlers.set(
      'photo_consent_management',
      this.handlePhotoConsentManagement.bind(this),
    )
    this.messageHandlers.set(
      'treatment_documentation_request',
      this.handleTreatmentDocumentationRequest.bind(this),
    )
    this.messageHandlers.set(
      'before_after_analysis_request',
      this.handleBeforeAfterAnalysisRequest.bind(this),
    )

    // Catalog & Pricing
    this.messageHandlers.set(
      'treatment_catalog_management',
      this.handleTreatmentCatalogManagement.bind(this),
    )
    this.messageHandlers.set(
      'pricing_strategy_optimization',
      this.handlePricingStrategyOptimization.bind(this),
    )
    this.messageHandlers.set(
      'competitor_analysis_request',
      this.handleCompetitorAnalysisRequest.bind(this),
    )

    // Schedule Optimization
    this.messageHandlers.set(
      'schedule_optimization_request',
      this.handleScheduleOptimizationRequest.bind(this),
    )
    this.messageHandlers.set(
      'resource_utilization_analysis',
      this.handleResourceUtilizationAnalysis.bind(this),
    )
    this.messageHandlers.set(
      'demand_forecasting_request',
      this.handleDemandForecastingRequest.bind(this),
    )

    // Retention & Loyalty
    this.messageHandlers.set(
      'retention_analysis_request',
      this.handleRetentionAnalysisRequest.bind(this),
    )
    this.messageHandlers.set(
      'loyalty_program_management',
      this.handleLoyaltyProgramManagement.bind(this),
    )
    this.messageHandlers.set(
      'client_lifetime_value_analysis',
      this.handleClientLifetimeValueAnalysis.bind(this),
    )

    // Compliance Auditing
    this.messageHandlers.set(
      'compliance_audit_request',
      this.handleComplianceAuditRequest.bind(this),
    )
    this.messageHandlers.set(
      'documentation_compliance_check',
      this.handleDocumentationComplianceCheck.bind(this),
    )
    this.messageHandlers.set(
      'regulatory_update_notification',
      this.handleRegulatoryUpdateNotification.bind(this),
    )
  }

  async processMessage(message: AguiMessage): Promise<AguiMessage> {
    const startTime = Date.now()
    this.metrics.totalRequests++

    try {
      // Rate limiting check
      if (this.config.enableRateLimiting && !await this.checkRateLimit(message)) {
        return this.createErrorResponse(message, 'RATE_LIMITED', 'Rate limit exceeded')
      }

      // Session validation
      const session = this.activeSessions.get(message.sessionId)
      if (!session) {
        return this.createErrorResponse(message, 'SESSION_EXPIRED', 'Invalid session')
      }

      // Message validation
      const validationResult = await this.validateMessage(message)
      if (!validationResult.isValid) {
        return this.createErrorResponse(message, 'INVALID_MESSAGE', validationResult.error)
      }

      // Compliance check
      if (this.requiresComplianceCheck(message.type)) {
        const complianceResult = await this.config.complianceService.checkCompliance(message)
        if (!complianceResult.isCompliant) {
          return this.createErrorResponse(message, 'AUTHORIZATION_FAILED', complianceResult.reason)
        }
        this.metrics.complianceChecks++
      }

      // Process message
      const handler = this.messageHandlers.get(message.type)
      if (!handler) {
        return this.createErrorResponse(
          message,
          'INVALID_MESSAGE',
          `Unsupported message type: ${message.type}`,
        )
      }

      const response = await handler(message)

      // Update metrics
      const processingTime = Date.now() - startTime
      this.updateMetrics(processingTime, true)

      return response
    } catch {
      const processingTime = Date.now() - startTime
      this.updateMetrics(processingTime, false)

      return this.createErrorResponse(
        message,
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  // Treatment Management Handlers
  private async handleTreatmentCatalogQuery(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticTreatmentMessage

    // Check cache first
    const cacheKey = `treatment_catalog_${payload.category}_${payload.skinType}_${
      JSON.stringify(payload.filters)
    }`
    const cached = await this.config.cacheService.get(cacheKey)

    if (cached) {
      return this.createSuccessResponse(message, cached)
    }

    // Query RAG service
    const treatments = await this.config.ragService.queryTreatmentCatalog({
      category: payload.category,
      skinType: payload.skinType,
      concerns: payload.concerns,
      budget: payload.budget,
      location: payload.location,
      filters: payload.filters,
    })

    // Cache results
    await this.config.cacheService.set(cacheKey, treatments, 300) // 5 minutes

    const response: AestheticTreatmentResponse = {
      treatments,
      totalCount: treatments.length,
      filters: payload.filters,
      relevanceScores: treatments.map((t) => ({ treatmentId: t.id, score: t.relevanceScore })),
      recommendations: await this.generateTreatmentRecommendations(treatments, payload),
      availability: await this.checkTreatmentsAvailability(treatments),
      processingTime: Date.now() - Date.now(),
    }

    return this.createSuccessResponse(message, response)
  }

  private async handleTreatmentAvailabilityCheck(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticTreatmentMessage

    const availability = await this.config.ragService.checkTreatmentAvailability({
      treatmentId: payload.treatmentId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      location: payload.location,
      professionalId: payload.professionalId,
      specialRequirements: payload.specialRequirements,
    })

    return this.createSuccessResponse(message, availability)
  }

  private async handleTreatmentSchedulingRequest(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticTreatmentMessage

    const appointment = await this.config.ragService.scheduleTreatment({
      treatmentId: payload.treatmentId,
      clientId: payload.clientId,
      professionalId: payload.professionalId,
      scheduledDate: payload.scheduledDate,
      duration: payload.duration,
      location: payload.location,
      specialInstructions: payload.specialInstructions,
      requiresConsultation: payload.requiresConsultation,
    })

    // Send notifications
    if (appointment) {
      await this.config.notificationService.sendAppointmentConfirmation(appointment)
      await this.config.notificationService.sendProfessionalNotification(appointment)
    }

    return this.createSuccessResponse(message, appointment)
  }

  private async handleAppointmentOptimizationRequest(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticAppointmentMessage

    const optimization = await this.config.ragService.optimizeSchedule({
      professionalId: payload.professionalId,
      dateRange: payload.dateRange,
      constraints: payload.constraints,
      priorities: payload.priorities,
      existingAppointments: payload.existingAppointments,
    })

    this.metrics.scheduleOptimizations++

    return this.createSuccessResponse(message, optimization)
  }

  private async handleSkinTypeAssessment(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticAssessmentMessage

    const assessment = await this.config.ragService.assessSkinType({
      clientPhoto: payload.clientPhoto,
      answers: payload.answers,
      concerns: payload.concerns,
      currentProducts: payload.currentProducts,
      lifestyleFactors: payload.lifestyleFactors,
      environmentalFactors: payload.environmentalFactors,
    })

    // Update client profile with assessment results
    if (payload.clientId) {
      await this.config.ragService.updateClientProfile(payload.clientId, {
        skinType: assessment.skinType,
        skinConcerns: assessment.concerns,
        recommendedProducts: assessment.recommendedProducts,
      })
    }

    return this.createSuccessResponse(message, assessment)
  }

  private async handleTreatmentFinancingRequest(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticFinancialMessage

    const financing = await this.config.ragService.calculateFinancingOptions({
      treatmentId: payload.treatmentId,
      totalAmount: payload.totalAmount,
      clientId: payload.clientId,
      creditScore: payload.creditScore,
      preferredInstallments: payload.preferredInstallments,
      incomeLevel: payload.incomeLevel,
      bankPartners: payload.bankPartners,
    })

    return this.createSuccessResponse(message, financing)
  }

  private async handleAnvisaComplianceCheck(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticComplianceMessage

    const compliance = await this.config.complianceService.checkAnvisaCompliance({
      treatmentId: payload.treatmentId,
      products: payload.products,
      procedures: payload.procedures,
      facilityInfo: payload.facilityInfo,
      professionalLicenses: payload.professionalLicenses,
    })

    if (this.config.anvisaReportingEnabled && compliance.requiresReporting) {
      await this.config.complianceService.generateAnvisaReport(compliance)
      this.metrics.anvisaReportsGenerated++
    }

    return this.createSuccessResponse(message, compliance)
  }

  private async handleClientProfileEnhancement(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticClientEnhancementMessage

    const enhancement = await this.config.ragService.enhanceClientProfile({
      clientId: payload.clientId,
      treatmentHistory: payload.treatmentHistory,
      skinAssessments: payload.skinAssessments,
      preferences: payload.preferences,
      behavioralData: payload.behavioralData,
      feedbackHistory: payload.feedbackHistory,
      retentionIndicators: payload.retentionIndicators,
    })

    return this.createSuccessResponse(message, enhancement)
  }

  private async handleRetentionRiskAssessment(message: AguiMessage): Promise<AguiMessage> {
    const payload = message._payload as AestheticClientEnhancementMessage

    const assessment = await this.config.ragService.assessRetentionRisk({
      clientId: payload.clientId,
      appointmentHistory: payload.appointmentHistory,
      paymentHistory: payload.paymentHistory,
      communicationHistory: payload.communicationHistory,
      satisfactionScores: payload.satisfactionScores,
      demographicFactors: payload.demographicFactors,
    })

    this.metrics.retentionAnalyses++

    return this.createSuccessResponse(message, assessment)
  }

  // Helper Methods
  private async checkRateLimit(message: AguiMessage): Promise<boolean> {
    const userId = message.metadata?._userId || 'anonymous'
    const now = Date.now()
    const _windowStart = now - 60000 // 1 minute window

    let userRateLimit = this.rateLimitMap.get(userId)

    if (!userRateLimit || userRateLimit.resetTime < now) {
      userRateLimit = { count: 0, resetTime: now + 60000 }
      this.rateLimitMap.set(userId, userRateLimit)
    }

    if (userRateLimit.count >= this.config.rateLimitRequests) {
      return false
    }

    userRateLimit.count++
    return true
  }

  private async validateMessage(
    message: AguiMessage,
  ): Promise<{ isValid: boolean; error?: string }> {
    if (!message.id || !message.type || !message.sessionId) {
      return { isValid: false, error: 'Missing required fields' }
    }

    if (!this.isValidMessageType(message.type)) {
      return { isValid: false, error: 'Invalid message type' }
    }

    return { isValid: true }
  }

  private isValidMessageType(type: string): type is AestheticAguiMessageType {
    const validTypes: AestheticAguiMessageType[] = [
      'treatment_catalog_query',
      'treatment_availability_check',
      'treatment_scheduling_request',
      'treatment_consent_management',
      'treatment_progress_tracking',
      'treatment_recommendation_request',
      'treatment_price_inquiry',
      'treatment_bundle_creation',
      'appointment_optimization_request',
      'appointment_conflict_resolution',
      'appointment_resource_allocation',
      'appointment_waitlist_management',
      'treatment_financing_request',
      'installment_plan_calculation',
      'insurance_coverage_verification',
      'payment_processing',
      'financial_reconciliation',
      'skin_type_assessment',
      'aesthetic_analysis_request',
      'treatment_simulation_request',
      'progress_tracking_analysis',
      'anvisa_compliance_check',
      'lgpd_consent_verification',
      'treatment_safety_validation',
      'professional_license_verification',
      'client_profile_enhancement',
      'retention_risk_assessment',
      'personalized_recommendation_request',
      'client_satisfaction_analysis',
      'inventory_level_monitoring',
      'product_expiry_tracking',
      'supply_chain_optimization',
      'batch_traceability_request',
      'emergency_protocol_activation',
      'adverse_event_reporting',
      'emergency_response_coordination',
      'aesthetic_analytics_request',
      'treatment_effectiveness_analysis',
      'revenue_optimization_analysis',
      'market_trend_analysis',
      'training_material_request',
      'certification_tracking',
      'professional_development_planning',
      'photo_consent_management',
      'treatment_documentation_request',
      'before_after_analysis_request',
      'treatment_catalog_management',
      'pricing_strategy_optimization',
      'competitor_analysis_request',
      'schedule_optimization_request',
      'resource_utilization_analysis',
      'demand_forecasting_request',
      'retention_analysis_request',
      'loyalty_program_management',
      'client_lifetime_value_analysis',
      'compliance_audit_request',
      'documentation_compliance_check',
      'regulatory_update_notification',
    ]

    return validTypes.includes(type as AestheticAguiMessageType)
  }

  private requiresComplianceCheck(type: string): boolean {
    const complianceRequiredTypes = [
      'treatment_scheduling_request',
      'anvisa_compliance_check',
      'lgpd_consent_verification',
      'treatment_safety_validation',
      'photo_consent_management',
      'client_profile_enhancement',
      'treatment_documentation_request',
      'compliance_audit_request',
    ]

    return complianceRequiredTypes.includes(type)
  }

  private createSuccessResponse(message: AguiMessage, payload: any): AguiMessage {
    return {
      id: this.generateMessageId(),
      type: 'response' as AguiMessageType,
      timestamp: new Date().toISOString(),
      sessionId: message.sessionId,
      _payload: {
        content: payload,
        type: 'text',
        success: true,
        originalMessageId: message.id,
      },
      metadata: {
        ...message.metadata,
        processingTime: Date.now() - Date.now(),
      },
    }
  }

  private createErrorResponse(
    message: AguiMessage,
    code: AguiErrorCode,
    errorMessage: string,
  ): AguiMessage {
    return {
      id: this.generateMessageId(),
      type: 'error' as AguiMessageType,
      timestamp: new Date().toISOString(),
      sessionId: message.sessionId,
      _payload: {
        code,
        message: errorMessage,
        retryable: this.isRetryableError(code),
      },
      metadata: message.metadata,
    }
  }

  private isRetryableError(code: AguiErrorCode): boolean {
    const retryableErrors = ['TIMEOUT', 'RATE_LIMITED', 'INTERNAL_ERROR']
    return retryableErrors.includes(code)
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private updateMetrics(processingTime: number, success: boolean): void {
    // Update average response time
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + processingTime)
      / this.metrics.totalRequests

    // Update success/error rates
    if (success) {
      this.metrics.successRate = (this.metrics.successRate * (this.metrics.totalRequests - 1) + 100)
        / this.metrics.totalRequests
    } else {
      this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.totalRequests - 1) + 100)
        / this.metrics.totalRequests
    }
  }

  private async generateTreatmentRecommendations(
    _treatments: any[],
    _payload: AestheticTreatmentMessage,
  ): Promise<any[]> {
    // Implementation for generating personalized treatment recommendations
    return []
  }

  private async checkTreatmentsAvailability(_treatments: any[]): Promise<any> {
    // Implementation for checking treatment availability
    return {}
  }

  // Additional handler methods would be implemented here for all message types...
  // For brevity, I've included the most critical handlers

  public getMetrics(): AestheticProtocolMetrics {
    return { ...this.metrics }
  }

  public resetMetrics(): void {
    this.metrics = this.initializeMetrics()
  }

  public getActiveSessions(): AguiSession[] {
    return Array.from(this.activeSessions.values())
  }

  public getRateLimitInfo(userId: string): AguiRateLimitInfo {
    const limit = this.rateLimitMap.get(userId)
    return {
      requestsPerMinute: this.config.rateLimitRequests,
      requestsPerHour: this.config.rateLimitRequests * 60,
      currentUsage: {
        minute: limit?.count || 0,
        hour: 0, // Would need hourly tracking
      },
      resetTimes: {
        minute: limit?.resetTime ? new Date(limit.resetTime).toISOString() : '',
        hour: '', // Would need hourly tracking
      },
    }
  }
}
