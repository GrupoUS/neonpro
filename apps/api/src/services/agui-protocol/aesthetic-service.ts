/**
 * Enhanced AG-UI Service for Aesthetic Clinics
 *
 * Provides high-level services for aesthetic clinic operations including
 * treatment management, appointment optimization, financial operations, and compliance.
 */

import { AestheticCacheService } from './aesthetic-cache-service'
import { AestheticComplianceService } from './aesthetic-compliance-service'
import { AestheticNotificationService } from './aesthetic-notification-service'
import { AestheticAguiProtocol } from './aesthetic-protocol'
import { AestheticRAGService } from './aesthetic-rag-service'
import {
  AestheticAnalytics,
  AestheticAppointment,
  AestheticAssessment,
  AestheticClientProfile,
  AestheticComplianceAudit,
  AestheticComplianceReport,
  AestheticEmergency,
  AestheticFinancialTransaction,
  AestheticInventory,
  AestheticPhotoConsent,
  AestheticRetentionAnalysis,
  AestheticScheduleOptimization,
  AestheticTreatment,
} from './aesthetic-types'
import { AguiMessage, AguiSession } from './types'

export interface AestheticServiceConfig {
  databaseUrl: string
  ragApiKey: string
  cacheRedisUrl: string
  notificationServiceConfig: {
    emailProvider: string
    smsProvider: string
    whatsappProvider: string
  }
  complianceConfig: {
    anvisaApiKey?: string
    lgpdEncryptionKey: string
    auditLogRetention: number
  }
  financialConfig: {
    paymentGateway: string
    bankIntegrations: string[]
    currency: string
  }
  analyticsConfig: {
    enableAdvancedAnalytics: boolean
    dataRetentionDays: number
    exportFormats: string[]
  }
}

export interface AestheticServiceMetrics {
  totalSessions: number
  activeTreatments: number
  completedTreatments: number
  revenueGenerated: number
  clientRetentionRate: number
  averageTreatmentTime: number
  scheduleEfficiency: number
  complianceScore: number
  patientSatisfaction: number
  inventoryTurnover: number
  staffUtilization: number
}

export class AestheticAguiService {
  private protocol: AestheticAguiProtocol
  private ragService: AestheticRAGService
  private cacheService: AestheticCacheService
  private complianceService: AestheticComplianceService
  private notificationService: AestheticNotificationService
  private config: AestheticServiceConfig
  private metrics: AestheticServiceMetrics
  private activeSessions: Map<string, AguiSession> = new Map()

  constructor(config: AestheticServiceConfig) {
    this.config = config
    this.metrics = this.initializeMetrics()
    this.initializeServices()
  }

  private initializeMetrics(): AestheticServiceMetrics {
    return {
      totalSessions: 0,
      activeTreatments: 0,
      completedTreatments: 0,
      revenueGenerated: 0,
      clientRetentionRate: 0,
      averageTreatmentTime: 0,
      scheduleEfficiency: 0,
      complianceScore: 100,
      patientSatisfaction: 0,
      inventoryTurnover: 0,
      staffUtilization: 0,
    }
  }

  private initializeServices(): void {
    // Initialize all service dependencies
    this.ragService = new AestheticRAGService({
      apiKey: this.config.ragApiKey,
      databaseUrl: this.config.databaseUrl,
      model: 'claude-3.5-sonnet-20241022',
      maxTokens: 4000,
      temperature: 0.1,
    })

    this.cacheService = new AestheticCacheService({
      redisUrl: this.config.cacheRedisUrl,
      defaultTtl: 300,
      compressionEnabled: true,
    })

    this.complianceService = new AestheticComplianceService({
      anvisaApiKey: this.config.complianceConfig.anvisaApiKey,
      lgpdEncryptionKey: this.config.complianceConfig.lgpdEncryptionKey,
      auditLogRetention: this.config.complianceConfig.auditLogRetention,
    })

    this.notificationService = new AestheticNotificationService({
      emailProvider: this.config.notificationServiceConfig.emailProvider,
      smsProvider: this.config.notificationServiceConfig.smsProvider,
      whatsappProvider: this.config.notificationServiceConfig.whatsappProvider,
    })

    this.protocol = new AestheticAguiProtocol({
      ragService: this.ragService,
      cacheService: this.cacheService,
      complianceService: this.complianceService,
      notificationService: this.notificationService,
      maxSessionDuration: 3600000, // 1 hour
      enableRateLimiting: true,
      rateLimitRequests: 100,
      enableCompression: true,
      enableEncryption: true,
      supportedLanguages: ['pt-BR', 'en-US'],
      anvisaReportingEnabled: true,
      lgpdComplianceLevel: 'strict',
    })
  }

  // Session Management
  async createSession(userId: string, clientInfo?: any): Promise<AguiSession> {
    const sessionId = this.generateSessionId()
    const session: AguiSession = {
      id: sessionId,
      _userId: userId,
      title: clientInfo?.title || 'Aesthetic Clinic Session',
      _context: {
        clientInfo,
        startTime: new Date().toISOString(),
        platform: 'web',
        version: '1.0.0',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      messageCount: 0,
      lastActivity: new Date().toISOString(),
    }

    this.activeSessions.set(sessionId, session)
    this.metrics.totalSessions++

    return session
  }

  async getSession(sessionId: string): Promise<AguiSession | null> {
    return this.activeSessions.get(sessionId) || null
  }

  async updateSession(sessionId: string, updates: Partial<AguiSession>): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      Object.assign(session, updates, { updatedAt: new Date().toISOString() })
      this.activeSessions.set(sessionId, session)
    }
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (session) {
      session.isActive = false
      session.expiresAt = new Date().toISOString()
      this.activeSessions.delete(sessionId)
    }
  }

  // Treatment Management
  async getTreatmentCatalog(filters?: {
    category?: string
    skinType?: string
    concerns?: string[]
    budget?: { min: number; max: number }
    location?: string
  }): Promise<AestheticTreatment[]> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'treatment_catalog_query',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: {
        category: filters?.category,
        skinType: filters?.skinType,
        concerns: filters?.concerns,
        budget: filters?.budget,
        location: filters?.location,
        filters,
      },
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content.treatments || []
  }

  async checkTreatmentAvailability(
    treatmentId: string,
    startDate: string,
    endDate: string,
    location?: string,
  ): Promise<any> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'treatment_availability_check',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: {
        treatmentId,
        startDate,
        endDate,
        location,
      },
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  async scheduleTreatment(appointmentData: {
    treatmentId: string
    clientId: string
    professionalId: string
    scheduledDate: string
    duration: number
    location: string
    specialInstructions?: string
    requiresConsultation: boolean
  }): Promise<AestheticAppointment> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'treatment_scheduling_request',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: appointmentData,
    }

    const response = await this.protocol.processMessage(message)
    const appointment = response._payload.content

    if (appointment) {
      this.metrics.activeTreatments++
    }

    return appointment
  }

  // Appointment Optimization
  async optimizeSchedule(
    professionalId: string,
    dateRange: { start: string; end: string },
  ): Promise<AestheticScheduleOptimization> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'schedule_optimization_request',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: {
        professionalId,
        dateRange,
        constraints: {},
        priorities: ['efficiency', 'patient_satisfaction', 'staff_preference'],
        existingAppointments: [],
      },
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  // Assessment Services
  async performSkinAssessment(assessmentData: {
    clientPhoto?: string
    answers: Record<string, any>
    concerns: string[]
    currentProducts?: string[]
    lifestyleFactors?: Record<string, any>
    environmentalFactors?: Record<string, any>
    clientId?: string
  }): Promise<AestheticAssessment> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'skin_type_assessment',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: assessmentData,
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  // Financial Services
  async calculateFinancingOptions(financingData: {
    treatmentId: string
    totalAmount: number
    clientId: string
    creditScore?: number
    preferredInstallments?: number
    incomeLevel?: string
    bankPartners?: string[]
  }): Promise<any> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'treatment_financing_request',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: financingData,
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  async processPayment(paymentData: {
    appointmentId: string
    amount: number
    paymentMethod: string
    installments?: number
    cardToken?: string
    clientId: string
  }): Promise<AestheticFinancialTransaction> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'payment_processing',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: paymentData,
    }

    const response = await this.protocol.processMessage(message)
    const transaction = response._payload.content

    if (transaction && transaction.status === 'completed') {
      this.metrics.revenueGenerated += transaction.amount
    }

    return transaction
  }

  // Client Management
  async enhanceClientProfile(clientId: string, enhancementData: {
    treatmentHistory?: any[]
    skinAssessments?: AestheticAssessment[]
    preferences?: Record<string, any>
    behavioralData?: Record<string, any>
    feedbackHistory?: any[]
    retentionIndicators?: Record<string, any>
  }): Promise<AestheticClientProfile> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'client_profile_enhancement',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: {
        clientId,
        ...enhancementData,
      },
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  async assessRetentionRisk(clientId: string): Promise<AestheticRetentionAnalysis> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'retention_risk_assessment',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: {
        clientId,
      },
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  // Compliance Services
  async performAnvisaComplianceCheck(complianceData: {
    treatmentId: string
    products: any[]
    procedures: any[]
    facilityInfo: any
    professionalLicenses: any[]
  }): Promise<AestheticComplianceReport> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'anvisa_compliance_check',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: complianceData,
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  async performComplianceAudit(auditData: {
    scope: string[]
    timeframe: { start: string; end: string }
    deepDive?: boolean
    generateReport?: boolean
  }): Promise<AestheticComplianceAudit> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'compliance_audit_request',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: auditData,
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  // Analytics Services
  async getAestheticAnalytics(analyticsData: {
    type: string
    timeframe?: { start: string; end: string }
    filters?: Record<string, any>
    clientId?: string
    treatmentId?: string
  }): Promise<AestheticAnalytics> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'aesthetic_analytics_request',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: analyticsData,
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  // Inventory Management
  async getInventoryLevels(filters?: {
    category?: string
    location?: string
    lowStockOnly?: boolean
    expiringSoon?: boolean
  }): Promise<AestheticInventory[]> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'inventory_level_monitoring',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: { filters },
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content.inventory || []
  }

  // Emergency Services
  async handleEmergency(emergencyData: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    clientId?: string
    treatmentId?: string
    description: string
    requiredActions: string[]
  }): Promise<AestheticEmergency> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'emergency_protocol_activation',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: emergencyData,
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  // Photo Consent Management
  async managePhotoConsent(consentData: {
    clientId: string
    treatmentId: string
    photoType: 'before' | 'after' | 'during' | 'progress'
    consentLevel: 'private' | 'clinical' | 'marketing' | 'research'
    expiration?: string
    usageRestrictions?: string[]
  }): Promise<AestheticPhotoConsent> {
    const message: AguiMessage = {
      id: this.generateMessageId(),
      type: 'photo_consent_management',
      timestamp: new Date().toISOString(),
      sessionId: 'system',
      _payload: consentData,
    }

    const response = await this.protocol.processMessage(message)
    return response._payload.content
  }

  // Message Processing (for WebSocket/Real-time communication)
  async processMessage(message: AguiMessage): Promise<AguiMessage> {
    return await this.protocol.processMessage(message)
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    services: {
      protocol: boolean
      rag: boolean
      cache: boolean
      compliance: boolean
      notifications: boolean
    }
    metrics: AestheticServiceMetrics
  }> {
    const services = {
      protocol: this.protocol !== undefined,
      rag: await this.ragService.healthCheck(),
      cache: await this.cacheService.healthCheck(),
      compliance: await this.complianceService.healthCheck(),
      notifications: await this.notificationService.healthCheck(),
    }

    const allHealthy = Object.values(services).every(status => status)

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      services,
      metrics: this.metrics,
    }
  }

  // Metrics & Analytics
  getMetrics(): AestheticServiceMetrics {
    return { ...this.metrics }
  }

  getDetailedMetrics(): {
    service: AestheticServiceMetrics
    protocol: any
    sessions: AguiSession[]
  } {
    return {
      service: this.metrics,
      protocol: this.protocol.getMetrics(),
      sessions: Array.from(this.activeSessions.values()),
    }
  }

  updateMetrics(updates: Partial<AestheticServiceMetrics>): void {
    Object.assign(this.metrics, updates)
  }

  // Utility Methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Cleanup
  async cleanup(): Promise<void> {
    // End all active sessions
    for (const [sessionId] of this.activeSessions) {
      await this.endSession(sessionId)
    }

    // Cleanup services
    await this.ragService.cleanup()
    await this.cacheService.cleanup()
    await this.complianceService.cleanup()
    await this.notificationService.cleanup()
  }
}
