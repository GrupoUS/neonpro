/**
 * Enhanced Agent Session Service with CopilotKit Integration
 *
 * Extends the base AgentSessionService with CopilotKit integration,
 * improved security, and aesthetic clinic-specific session handling.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '../../types/database.js'
import { AestheticComplianceService } from '../agui-protocol/aesthetic-compliance-service.js'
import { AestheticDataHandlingService } from '../agui-protocol/aesthetic-data-handling.js'
import {
  AestheticAguiService,
  AestheticClientProfile,
  // AestheticAguiMessage,
  // AestheticAguiMessageType,
  // AestheticSessionContext,
  AestheticTreatmentData,
} from '../agui-protocol/aesthetic-service.js'

// Enhanced session types with CopilotKit integration
export interface EnhancedSessionConfig {
  defaultExpirationMs: number
  maxSessionLengthMs: number
  cleanupIntervalMs: number
  maxConcurrentSessions: number
  enableCopilotKit: boolean
  copilotKitEndpoint?: string
  enableAestheticFeatures: boolean
  securityLevel: 'standard' | 'enhanced' | 'strict'
  enableSessionAnalytics: boolean
  enableRealtimeCollaboration: boolean
}

export interface EnhancedSessionContext extends SessionContext {
  // CopilotKit integration
  copilotKitSessionId?: string
  copilotKitContext?: Record<string, any>

  // Aesthetic clinic specific
  aestheticData?: {
    currentTreatment?: AestheticTreatmentData
    clientProfile?: AestheticClientProfile
    treatmentPlan?: any[]
    skinAssessment?: any
    photos?: any[]
    consentRecords?: any[]
  }

  // Security and compliance
  securityContext?: {
    authenticationLevel: 'basic' | 'enhanced' | 'mfa'
    dataAccessLevel: 'standard' | 'sensitive' | 'critical'
    complianceMode: 'standard' | 'enhanced'
  }

  // Real-time collaboration
  collaborationContext?: {
    enabled: boolean
    participants: string[]
    sharedData: Record<string, any>
  }
}

export interface CopilotKitIntegration {
  sessionId: string
  endpoint: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: Date
  messageCount: number
  errorCount: number
  capabilities: string[]
}

export interface EnhancedSessionData extends SessionData {
  // Enhanced features
  enhancedContext: EnhancedSessionContext
  copilotKitIntegration?: CopilotKitIntegration

  // Analytics and metrics
  analytics?: {
    totalProcessingTime: number
    averageResponseTime: number
    featureUsage: Record<string, number>
    satisfactionScore?: number
    engagementMetrics: {
      messagesPerHour: number
      sessionDuration: number
      interactionDepth: number
    }
  }

  // Security and compliance
  securityMetadata?: {
    riskScore: number
    complianceFlags: string[]
    auditTrail: any[]
    dataEncryptionLevel: string
  }

  // Aesthetic specific
  aestheticMetadata?: {
    treatmentsDiscussed: number
    consultationsProvided: number
    photosAnalyzed: number
    recommendationsGenerated: number
  }
}

export interface SessionAnalytics {
  sessionId: string
  userId: string
  duration: number
  messageCount: number
  featureUsage: Record<string, number>
  performanceMetrics: {
    averageResponseTime: number
    totalProcessingTime: number
    errorRate: number
  }
  engagementScore: number
  satisfactionScore?: number
  conversionMetrics?: {
    treatmentsBooked: number
    consultationsScheduled: number
    revenueGenerated?: number
  }
  createdAt: Date
}

export class EnhancedAgentSessionService {
  private supabase: SupabaseClient<Database>
  private config: EnhancedSessionConfig
  private cleanupTimer?: NodeJS.Timeout
  private sessionCache: Map<string, EnhancedSessionData> = new Map()
  private cacheTimeout = 300000 // 5 minutes

  // Service integrations
  private aestheticService?: AestheticAguiService
  private dataHandlingService?: AestheticDataHandlingService
  private complianceService?: AestheticComplianceService

  // CopilotKit integration
  private copilotKitConnections: Map<string, CopilotKitIntegration> = new Map()

  // Analytics
  private sessionAnalytics: Map<string, SessionAnalytics[]> = new Map()

  constructor(
    supabaseUrl: string,
    supabaseServiceKey: string,
    config: Partial<EnhancedSessionConfig> = {},
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    this.config = {
      defaultExpirationMs: 24 * 60 * 60 * 1000, // 24 hours
      maxSessionLengthMs: 7 * 24 * 60 * 60 * 1000, // 7 days
      cleanupIntervalMs: 15 * 60 * 1000, // 15 minutes
      maxConcurrentSessions: 10,
      enableCopilotKit: true,
      enableAestheticFeatures: true,
      securityLevel: 'enhanced',
      enableSessionAnalytics: true,
      enableRealtimeCollaboration: false,
      ...config,
    }

    this.initializeServices()
    this.startCleanupTimer()
  }

  /**
   * Initialize service integrations
   */
  private initializeServices(): void {
    if (this.config.enableAestheticFeatures) {
      this.aestheticService = new AestheticAguiService(
        this.supabase.supabaseUrl,
        this.supabase.supabaseKey,
      )

      this.dataHandlingService = new AestheticDataHandlingService(
        this.supabase.supabaseUrl,
        this.supabase.supabaseKey,
      )

      this.complianceService = new AestheticComplianceService(
        this.supabase.supabaseUrl,
        this.supabase.supabaseKey,
      )
    }
  }

  /**
   * Create enhanced session with CopilotKit integration
   */
  async createEnhancedSession(
    userId: string,
    options: {
      title?: string
      context?: Partial<EnhancedSessionContext>
      metadata?: Record<string, any>
      enableCopilotKit?: boolean
      aestheticData?: any
      securityContext?: any
    } = {},
  ): Promise<EnhancedSessionData> {
    try {
      // Check concurrent session limit
      await this.validateConcurrentSessionLimit(userId)

      const sessionId = uuidv4()
      const now = new Date()
      const expirationMs = options.context?.expiresAt
        ? new Date(options.context.expiresAt).getTime() - now.getTime()
        : this.config.defaultExpirationMs
      const expiresAt = new Date(now.getTime() + expirationMs)

      // Build enhanced context
      const enhancedContext: EnhancedSessionContext = {
        userId,
        patientId: options.context?.patientId,
        userPreferences: options.context?.userPreferences || {},
        previousTopics: options.context?.previousTopics || [],
        clinicId: options.context?.clinicId,

        // CopilotKit integration
        copilotKitContext: options.context?.copilotKitContext || {},

        // Aesthetic features
        aestheticData: options.aestheticData || {},

        // Security context
        securityContext: options.securityContext || {
          authenticationLevel: 'enhanced',
          dataAccessLevel: 'standard',
          complianceMode: 'enhanced',
        },

        // Collaboration
        collaborationContext: options.context?.collaborationContext || {
          enabled: false,
          participants: [],
          sharedData: {},
        },
      }

      const sessionData: EnhancedSessionData = {
        id: sessionId,
        sessionId,
        userId,
        title: options.title || 'Enhanced AI Assistant Session',
        context: enhancedContext,
        enhancedContext,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        messageCount: 0,
        lastActivity: now.toISOString(),
        metadata: options.metadata || {},

        // Initialize analytics
        analytics: {
          totalProcessingTime: 0,
          averageResponseTime: 0,
          featureUsage: {},
          engagementMetrics: {
            messagesPerHour: 0,
            sessionDuration: 0,
            interactionDepth: 0,
          },
        },

        // Security metadata
        securityMetadata: {
          riskScore: 0,
          complianceFlags: [],
          auditTrail: [],
          dataEncryptionLevel: 'AES-256',
        },

        // Aesthetic metadata
        aestheticMetadata: {
          treatmentsDiscussed: 0,
          consultationsProvided: 0,
          photosAnalyzed: 0,
          recommendationsGenerated: 0,
        },
      }

      // Initialize CopilotKit integration if enabled
      if (this.config.enableCopilotKit && (options.enableCopilotKit !== false)) {
        sessionData.copilotKitIntegration = await this.initializeCopilotKitIntegration(
          sessionId,
          enhancedContext,
        )
      }

      // Store session in database
      await this.storeEnhancedSession(sessionData)

      // Cache session
      this.cacheEnhancedSession(sessionData)

      // Log session creation for compliance
      if (this.complianceService) {
        await this.complianceService.logDataAccess({
          dataType: 'session_creation',
          userId,
          sessionId,
          timestamp: now,
          purpose: 'enhanced_session_creation',
          dataFields: Object.keys(enhancedContext),
        })
      }

      return sessionData
    } catch {
      console.error('Error creating enhanced session:', error)
      throw new Error(
        `Failed to create enhanced session: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    }
  }

  /**
   * Initialize CopilotKit integration
   */
  private async initializeCopilotKitIntegration(
    sessionId: string,
    context: EnhancedSessionContext,
  ): Promise<CopilotKitIntegration> {
    try {
      const integration: CopilotKitIntegration = {
        sessionId,
        endpoint: this.config.copilotKitEndpoint || '/api/copilotkit',
        status: 'connected',
        lastSync: new Date(),
        messageCount: 0,
        errorCount: 0,
        capabilities: [
          'chat',
          'code_execution',
          'web_search',
          'file_analysis',
          'aesthetic_consultation',
        ],
      }

      // Store CopilotKit connection
      this.copilotKitConnections.set(sessionId, integration)

      // Initialize CopilotKit session context
      if (this.aestheticService) {
        await this.aestheticService.sendAestheticMessage({
          id: uuidv4(),
          type: 'session_update',
          timestamp: new Date().toISOString(),
          sessionId,
          payload: {
            action: 'copilotkit_integration_initialized',
            context: context.copilotKitContext,
            capabilities: integration.capabilities,
          },
          metadata: {
            userId: context.userId,
            sessionId,
            version: '1.0.0',
          },
        })
      }

      return integration
    } catch {
      console.error('Error initializing CopilotKit integration:', error)
      return {
        sessionId,
        endpoint: this.config.copilotKitEndpoint || '/api/copilotkit',
        status: 'error',
        lastSync: new Date(),
        messageCount: 0,
        errorCount: 1,
        capabilities: [],
      }
    }
  }

  /**
   * Get enhanced session by ID
   */
  async getEnhancedSession(sessionId: string): Promise<EnhancedSessionData | null> {
    try {
      // Check cache first
      const cached = this.sessionCache.get(sessionId)
      if (cached && cached.expiresAt > new Date().toISOString()) {
        return cached
      }

      // Retrieve from database
      const session = await this.retrieveEnhancedSession(sessionId)
      if (!session) {
        return null
      }

      // Validate session expiration
      if (new Date(session.expiresAt) <= new Date()) {
        await this.expireEnhancedSession(sessionId)
        return null
      }

      // Cache valid session
      this.cacheEnhancedSession(session)

      return session
    } catch {
      console.error('Error retrieving enhanced session:', error)
      return null
    }
  }

  /**
   * Update enhanced session with aesthetic data
   */
  async updateAestheticSessionData(
    sessionId: string,
    aestheticData: {
      currentTreatment?: AestheticTreatmentData
      clientProfile?: AestheticClientProfile
      treatmentPlan?: any[]
      skinAssessment?: any
      photos?: any[]
      consentRecords?: any[]
    },
  ): Promise<EnhancedSessionData | null> {
    try {
      const session = await this.getEnhancedSession(sessionId)
      if (!session) {
        return null
      }

      // Update aesthetic context
      session.enhancedContext.aestheticData = {
        ...session.enhancedContext.aestheticData,
        ...aestheticData,
      }

      // Update aesthetic metadata
      if (aestheticData.currentTreatment) {
        session.aestheticMetadata!.treatmentsDiscussed += 1
      }
      if (aestheticData.photos && aestheticData.photos.length > 0) {
        session.aestheticMetadata!.photosAnalyzed += aestheticData.photos.length
      }

      // Apply LGPD compliance if sensitive data is present
      if (this.dataHandlingService && aestheticData.clientProfile) {
        const encryptedProfile = await this.dataHandlingService.encryptSensitiveData(
          aestheticData.clientProfile,
        )
        session.enhancedContext.aestheticData!.clientProfile = encryptedProfile
      }

      session.updatedAt = new Date().toISOString()
      session.lastActivity = new Date().toISOString()

      // Store updated session
      await this.storeEnhancedSession(session)
      this.cacheEnhancedSession(session)

      return session
    } catch {
      console.error('Error updating aesthetic session data:', error)
      return null
    }
  }

  /**
   * Record message activity with analytics
   */
  async recordEnhancedActivity(
    sessionId: string,
    activity: {
      type: 'user_message' | 'assistant_message' | 'system_message' | 'copilotkit_message'
      content?: string
      processingTime?: number
      features?: string[]
      satisfaction?: number
    },
  ): Promise<void> {
    try {
      const session = await this.getEnhancedSession(sessionId)
      if (!session) {
        return
      }

      // Update basic metrics
      session.messageCount += 1
      session.lastActivity = new Date().toISOString()
      session.updatedAt = new Date().toISOString()

      // Update analytics
      if (session.analytics && activity.processingTime) {
        session.analytics.totalProcessingTime += activity.processingTime
        session.analytics.averageResponseTime = session.analytics.totalProcessingTime /
          session.messageCount
      }

      // Track feature usage
      if (activity.features && session.analytics) {
        activity.features.forEach(feature => {
          session.analytics!.featureUsage[feature] =
            (session.analytics!.featureUsage[feature] || 0) +
            1
        })
      }

      // Update satisfaction score
      if (activity.satisfaction !== undefined && session.analytics) {
        session.analytics.satisfactionScore = activity.satisfaction
      }

      // Update CopilotKit metrics
      if (activity.type === 'copilotkit_message' && session.copilotKitIntegration) {
        session.copilotKitIntegration.messageCount += 1
        session.copilotKitIntegration.lastSync = new Date()
      }

      // Calculate engagement metrics
      if (session.analytics) {
        const sessionDuration = new Date().getTime() - new Date(session.createdAt).getTime()
        session.analytics.engagementMetrics = {
          messagesPerHour: (session.messageCount / sessionDuration) * 3600000,
          sessionDuration,
          interactionDepth: Object.keys(session.analytics.featureUsage).length,
        }
      }

      // Store updated session
      await this.storeEnhancedSession(session)
      this.cacheEnhancedSession(session)

      // Log to compliance service if sensitive data
      if (this.complianceService && activity.content) {
        await this.complianceService.logDataAccess({
          dataType: 'message_activity',
          userId: session.userId,
          sessionId,
          timestamp: new Date(),
          purpose: 'session_activity_logging',
          dataFields: ['message_content'],
        })
      }
    } catch {
      console.error('Error recording enhanced activity:', error)
    }
  }

  /**
   * Get session analytics and insights
   */
  async getSessionAnalytics(
    sessionId: string,
    _timeRange?: { start: Date; end: Date },
  ): Promise<SessionAnalytics | null> {
    try {
      const session = await this.getEnhancedSession(sessionId)
      if (!session || !session.analytics) {
        return null
      }

      const analytics: SessionAnalytics = {
        sessionId,
        userId: session.userId,
        duration: new Date().getTime() - new Date(session.createdAt).getTime(),
        messageCount: session.messageCount,
        featureUsage: session.analytics.featureUsage,
        performanceMetrics: {
          averageResponseTime: session.analytics.averageResponseTime,
          totalProcessingTime: session.analytics.totalProcessingTime,
          errorRate: this.calculateErrorRate(sessionId),
        },
        engagementScore: this.calculateEngagementScore(session.analytics),
        satisfactionScore: session.analytics.satisfactionScore,
        conversionMetrics: session.aestheticMetadata
          ? {
            treatmentsBooked: session.aestheticMetadata.treatmentsDiscussed,
            consultationsScheduled: session.aestheticMetadata.consultationsProvided,
          }
          : undefined,
        createdAt: new Date(session.createdAt),
      }

      return analytics
    } catch {
      console.error('Error getting session analytics:', error)
      return null
    }
  }

  /**
   * Enhanced session expiration with cleanup
   */
  async expireEnhancedSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getEnhancedSession(sessionId)
      if (!session) {
        return false
      }

      // Cleanup CopilotKit integration
      if (session.copilotKitIntegration) {
        this.copilotKitConnections.delete(sessionId)
      }

      // Archive session analytics
      if (this.config.enableSessionAnalytics && session.analytics) {
        await this.archiveSessionAnalytics(sessionId, session.analytics)
      }

      // Perform compliance cleanup
      if (this.dataHandlingService) {
        await this.dataHandlingService.cleanupSessionData(sessionId)
      }

      // Mark session as expired
      await this.supabase
        .from('enhanced_agent_sessions')
        .update({
          is_active: false,
          expires_at: new Date().toISOString(),
          enhanced_context: session.enhancedContext,
          analytics: session.analytics,
          security_metadata: session.securityMetadata,
          aesthetic_metadata: session.aestheticMetadata,
        })
        .eq('session_id', sessionId)

      // Remove from cache
      this.sessionCache.delete(sessionId)

      return true
    } catch {
      console.error('Error expiring enhanced session:', error)
      return false
    }
  }

  /**
   * Security risk assessment for session
   */
  async assessSessionRisk(sessionId: string): Promise<{
    riskScore: number
    riskFactors: string[]
    recommendations: string[]
  }> {
    try {
      const session = await this.getEnhancedSession(sessionId)
      if (!session) {
        return { riskScore: 0, riskFactors: [], recommendations: [] }
      }

      const riskFactors: string[] = []
      let riskScore = 0

      // Analyze message patterns
      if (session.messageCount > 100) {
        riskFactors.push('high_message_volume')
        riskScore += 20
      }

      // Check for unusual activity patterns
      if (session.analytics && session.analytics.averageResponseTime > 10000) {
        riskFactors.push('slow_response_times')
        riskScore += 15
      }

      // Assess data access patterns
      if (
        session.enhancedContext.aestheticData &&
        Object.keys(session.enhancedContext.aestheticData).length > 10
      ) {
        riskFactors.push('extensive_data_access')
        riskScore += 25
      }

      // Check session duration
      const sessionDuration = new Date().getTime() - new Date(session.createdAt).getTime()
      if (sessionDuration > this.config.maxSessionLengthMs * 0.8) {
        riskFactors.push('long_session_duration')
        riskScore += 10
      }

      // Generate recommendations
      const recommendations: string[] = []
      if (riskScore > 50) {
        recommendations.push('Consider ending session and starting fresh')
        recommendations.push('Review data access patterns')
      }
      if (riskFactors.includes('high_message_volume')) {
        recommendations.push('Implement rate limiting')
      }

      // Update security metadata
      session.securityMetadata = {
        ...session.securityMetadata,
        riskScore,
        complianceFlags: riskFactors,
      }

      await this.storeEnhancedSession(session)

      return {
        riskScore,
        riskFactors,
        recommendations,
      }
    } catch {
      console.error('Error assessing session risk:', error)
      return { riskScore: 0, riskFactors: [], recommendations: [] }
    }
  }

  /**
   * Store enhanced session in database
   */
  private async storeEnhancedSession(session: EnhancedSessionData): Promise<void> {
    const { error } = await this.supabase.from('enhanced_agent_sessions').upsert({
      session_id: session.sessionId,
      user_id: session.userId,
      title: session.title,
      context: session.context,
      enhanced_context: session.enhancedContext,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
      expires_at: session.expiresAt,
      is_active: session.isActive,
      message_count: session.messageCount,
      last_activity: session.lastActivity,
      metadata: session.metadata,
      analytics: session.analytics,
      security_metadata: session.securityMetadata,
      aesthetic_metadata: session.aestheticMetadata,
      copilotkit_integration: session.copilotKitIntegration,
    })

    if (error) {
      throw error
    }
  }

  /**
   * Retrieve enhanced session from database
   */
  private async retrieveEnhancedSession(
    sessionId: string,
  ): Promise<EnhancedSessionData | null> {
    const { data, error } = await this.supabase
      .from('enhanced_agent_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error || !data) {
      return null
    }

    return this.mapEnhancedSessionRecord(data)
  }

  /**
   * Map database record to enhanced session data
   */
  private mapEnhancedSessionRecord(record: any): EnhancedSessionData {
    return {
      id: record.id,
      sessionId: record.session_id,
      userId: record.user_id,
      title: record.title,
      context: record.context,
      enhancedContext: record.enhanced_context,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      expiresAt: record.expires_at,
      isActive: record.is_active,
      messageCount: record.message_count,
      lastActivity: record.last_activity,
      metadata: record.metadata,
      analytics: record.analytics,
      securityMetadata: record.security_metadata,
      aestheticMetadata: record.aesthetic_metadata,
      copilotKitIntegration: record.copilotkit_integration,
    }
  }

  /**
   * Cache enhanced session
   */
  private cacheEnhancedSession(session: EnhancedSessionData): void {
    this.sessionCache.set(session.sessionId, session)

    // Set expiration for cache entry
    setTimeout(() => {
      this.sessionCache.delete(session.sessionId)
    }, this.cacheTimeout)
  }

  /**
   * Calculate error rate for session
   */
  private calculateErrorRate(sessionId: string): number {
    const integration = this.copilotKitConnections.get(sessionId)
    if (!integration || integration.messageCount === 0) {
      return 0
    }
    return integration.errorCount / integration.messageCount
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(analytics: any): number {
    const { featureUsage, engagementMetrics } = analytics
    const featureCount = Object.keys(featureUsage).length
    const messageRate = engagementMetrics.messagesPerHour

    // Simple scoring algorithm (can be enhanced)
    let score = Math.min(featureCount * 10, 30) // Max 30 points for features
    score += Math.min(messageRate * 2, 40) // Max 40 points for message rate
    score += Math.min(engagementMetrics.interactionDepth * 5, 30) // Max 30 points for depth

    return Math.min(score, 100)
  }

  /**
   * Archive session analytics
   */
  private async archiveSessionAnalytics(
    sessionId: string,
    analytics: any,
  ): Promise<void> {
    try {
      await this.supabase.from('session_analytics_archive').insert({
        session_id: sessionId,
        analytics_data: analytics,
        archived_at: new Date().toISOString(),
      })
    } catch {
      console.error('Error archiving session analytics:', error)
    }
  }

  /**
   * Validate concurrent session limit
   */
  private async validateConcurrentSessionLimit(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('enhanced_agent_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())

    if (error) {
      throw error
    }

    if ((data?.length || 0) >= this.config.maxConcurrentSessions) {
      throw new Error(
        `Maximum concurrent sessions (${this.config.maxConcurrentSessions}) exceeded`,
      )
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanupExpiredEnhancedSessions()
      } catch {
        console.error('Error in enhanced session cleanup:', error)
      }
    }, this.config.cleanupIntervalMs)
  }

  /**
   * Cleanup expired enhanced sessions
   */
  private async cleanupExpiredEnhancedSessions(): Promise<number> {
    try {
      // Find expired sessions
      const { data: expiredSessions, error } = await this.supabase
        .from('enhanced_agent_sessions')
        .select('session_id')
        .lte('expires_at', new Date().toISOString())
        .eq('is_active', true)

      if (error) {
        throw error
      }

      if (!expiredSessions || expiredSessions.length === 0) {
        return 0
      }

      // Clean up each expired session
      let cleanupCount = 0
      for (const session of expiredSessions) {
        const success = await this.expireEnhancedSession(session.session_id)
        if (success) {
          cleanupCount++
        }
      }

      return cleanupCount
    } catch {
      console.error('Error cleaning up expired enhanced sessions:', error)
      return 0
    }
  }

  /**
   * Shutdown enhanced session service
   */
  async shutdown(): Promise<void> {
    // Clear cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    // Clear cache
    this.sessionCache.clear()
    this.copilotKitConnections.clear()

    // Final cleanup
    try {
      await this.cleanupExpiredEnhancedSessions()
    } catch {
      console.error('Error in final enhanced cleanup:', error)
    }

    // Shutdown service integrations
    if (this.aestheticService) {
      await this.aestheticService.shutdown()
    }
    if (this.dataHandlingService) {
      await this.dataHandlingService.shutdown()
    }
    if (this.complianceService) {
      await this.complianceService.shutdown()
    }
  }
}
