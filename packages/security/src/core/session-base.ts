/**
 * Unified Session Management Base
 *
 * Provides common session management functionality extracted from
 * EnhancedSessionManager to reduce duplication and improve maintainability.
 *
 * @version 2.0.0
 */

import { SecurityValidator, SecurityRateLimiter, SecurityConfig, SecurityResult, ValidationContext, SecurityEventLogger } from './security-base'

// Common session interfaces
export interface SessionMetadata {
  sessionId: string
  userId: string
  createdAt: Date
  lastActivity: Date
  ipAddress?: string
  userAgent?: string
  securityLevel: 'normal' | 'elevated' | 'high'
  riskScore: number
}

export interface SessionConfig {
  idleTimeout: number // milliseconds
  absoluteTimeout: number // milliseconds
  timeoutWarningThreshold: number // milliseconds
  maxConcurrentSessions: number
  enableIPBinding: boolean
  allowMobileSubnetChanges: boolean
  enableAnomalyDetection: boolean
  maxIPChangesPerHour: number
}

export interface ValidationResult {
  isValid: boolean
  session?: SessionMetadata
  action: 'allow' | 'warn' | 'block' | 'require_verification'
  reason?: string
  warnings?: string[]
  timeoutWarning?: number
}

// Base session manager with common functionality
export class BaseSessionManager {
  protected sessions = new Map<string, SessionMetadata>()
  protected userSessions = new Map<string, Set<string>>()
  protected config: SessionConfig
  protected rateLimiter: SecurityRateLimiter
  protected securityConfig: SecurityConfig

  constructor(
    sessionConfig: Partial<SessionConfig> = {},
    securityConfig: Partial<SecurityConfig> = {}
  ) {
    this.config = {
      idleTimeout: 30 * 60 * 1000, // 30 minutes
      absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours
      timeoutWarningThreshold: 5 * 60 * 1000, // 5 minutes
      maxConcurrentSessions: 3,
      enableIPBinding: true,
      allowMobileSubnetChanges: true,
      enableAnomalyDetection: true,
      maxIPChangesPerHour: 3,
      ...sessionConfig,
    }

    this.securityConfig = {
      environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      enableRateLimiting: true,
      maxAuthAttempts: 100,
      rateLimitWindowMs: 60000,
      enableAuditLogging: true,
      strictMode: false,
      ...securityConfig,
    }

    this.rateLimiter = new SecurityRateLimiter(this.securityConfig)
  }

  /**
   * Generate secure session ID
   * @returns A cryptographically secure 32-character session ID
   */
  protected generateSessionId(): string {
    return SecurityValidator.generateSecureToken(32)
  }

  /**
   * Validate session ID format
   * @param sessionId - The session ID to validate
   * @returns SecurityResult indicating validation success/failure
   */
  protected validateSessionId(sessionId: string): SecurityResult {
    return SecurityValidator.validateSessionId(sessionId)
  }

  /**
   * Check session timeouts
   * @param session - The session metadata to check for timeouts
   * @returns Object containing expiration status, reason, time remaining, and warning status
   */
  protected checkSessionTimeouts(session: SessionMetadata): {
    isExpired: boolean
    reason?: string
    timeRemaining?: number
    shouldWarn: boolean
  } {
    const now = Date.now()
    const sessionAge = now - session.createdAt.getTime()
    const idleTime = now - session.lastActivity.getTime()

    // Check absolute timeout
    if (sessionAge >= this.config.absoluteTimeout) {
      return {
        isExpired: true,
        reason: 'Session exceeded maximum duration',
        shouldWarn: false,
      }
    }

    // Check idle timeout
    if (idleTime >= this.config.idleTimeout) {
      return {
        isExpired: true,
        reason: 'Session expired due to inactivity',
        shouldWarn: false,
      }
    }

    // Check if timeout warning should be sent
    const absoluteTimeRemaining = this.config.absoluteTimeout - sessionAge
    const idleTimeRemaining = this.config.idleTimeout - idleTime
    const timeRemaining = Math.min(absoluteTimeRemaining, idleTimeRemaining)

    const shouldWarn = timeRemaining <= this.config.timeoutWarningThreshold

    return {
      isExpired: false,
      timeRemaining,
      shouldWarn,
    }
  }

  /**
   * Validate IP binding with mobile network tolerance
   * @param session - The session metadata containing original IP
   * @param currentIP - The current IP address to validate against
   * @returns SecurityResult indicating IP validation success/failure
   */
  protected validateIPBinding(
    session: SessionMetadata,
    currentIP: string,
  ): SecurityResult {
    if (!this.config.enableIPBinding || !session.ipAddress) {
      return { success: true, severity: 'low' }
    }

    // Exact match
    if (session.ipAddress === currentIP) {
      return { success: true, severity: 'low' }
    }

    // Mobile network tolerance (same subnet)
    if (this.config.allowMobileSubnetChanges) {
      const originalSubnet = SecurityValidator.extractIPSubnet(session.ipAddress)
      const currentSubnet = SecurityValidator.extractIPSubnet(currentIP)

      if (originalSubnet && currentSubnet && originalSubnet === currentSubnet) {
        return {
          success: true,
          severity: 'low',
          metadata: {
            action: 'mobile_network_change',
            newIP: currentIP,
          },
        }
      }
    }

    return {
      success: false,
      error: 'IP address mismatch detected',
      errorCode: 'IP_MISMATCH',
      severity: 'medium',
    }
  }

  /**
   * Detect basic anomalies
   */
  protected detectAnomalies(
    session: SessionMetadata,
    context: ValidationContext,
  ): SecurityResult {
    if (!this.config.enableAnomalyDetection) {
      return { success: true, severity: 'low' }
    }

    const anomalies: string[] = []
    let riskScore = 0

    // IP change detection
    if (session.ipAddress && context.ipAddress && session.ipAddress !== context.ipAddress) {
      anomalies.push('IP address change detected')
      riskScore += 30
    }

    // User agent change detection
    if (session.userAgent && context.userAgent && session.userAgent !== context.userAgent) {
      anomalies.push('User agent change detected')
      riskScore += 40
    }

    // Determine risk level
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (riskScore >= 80) severity = 'critical'
    else if (riskScore >= 60) severity = 'high'
    else if (riskScore >= 30) severity = 'medium'

    return {
      success: anomalies.length === 0,
      error: anomalies.length > 0 ? anomalies.join(', ') : undefined,
      errorCode: anomalies.length > 0 ? 'ANOMALY_DETECTED' : undefined,
      severity,
      metadata: {
        anomalies,
        riskScore,
      },
    }
  }

  /**
   * Manage concurrent sessions
   */
  protected manageConcurrentSessions(
    userId: string,
    currentSessionId: string,
  ): SecurityResult {
    const userSessionIds = this.userSessions.get(userId) || new Set()
    const userSessions = Array.from(userSessionIds)
      .map(id => this.sessions.get(id))
      .filter(Boolean) as SessionMetadata[]

    if (userSessions.length < this.config.maxConcurrentSessions) {
      return { success: true, severity: 'low' }
    }

    // Find oldest session
    const oldestSession = userSessions.reduce((oldest, current) =>
      current.createdAt < oldest.createdAt ? current : oldest
    )

    if (oldestSession.sessionId === currentSessionId) {
      return { success: true, severity: 'low' }
    }

    // Remove oldest session
    this.removeSession(oldestSession.sessionId)

    return {
      success: true,
      severity: 'low',
      metadata: {
        action: 'removed_oldest_session',
        removedSession: oldestSession.sessionId,
      },
    }
  }

  /**
   * Create basic session
   */
  protected createBaseSession(
    userId: string,
    context: ValidationContext,
  ): SessionMetadata {
    const sessionId = this.generateSessionId()

    // Manage concurrent sessions
    const concurrentResult = this.manageConcurrentSessions(userId, sessionId)
    if (concurrentResult.metadata?.removedSession) {
      const logger = SecurityEventLogger.getInstance()
      logger.logEvent('session_limit_enforcement', 'warn', {
        userId,
        sessionId,
        action: 'removed_oldest_session',
        resource: 'session_manager',
        result: 'success',
        reason: 'concurrent_session_limit_exceeded',
        metadata: {
          removedSession: concurrentResult.metadata.removedSession,
          maxSessions: this.config.maxConcurrentSessions
        }
      })
    }

    const session: SessionMetadata = {
      sessionId,
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      securityLevel: 'normal',
      riskScore: 0,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    }

    this.sessions.set(sessionId, session)

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set())
    }
    this.userSessions.get(userId)!.add(sessionId)

    return session
  }

  /**
   * Remove session
   */
  protected removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      // Remove from user sessions
      const userSessions = this.userSessions.get(session.userId)
      if (userSessions) {
        userSessions.delete(sessionId)
        if (userSessions.size === 0) {
          this.userSessions.delete(session.userId)
        }
      }

      this.sessions.delete(sessionId)
      return true
    }
    return false
  }

  /**
   * Get session
   */
  getSession(sessionId: string): SessionMetadata | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Get user sessions
   */
  getUserSessions(userId: string): SessionMetadata[] {
    const sessionIds = this.userSessions.get(userId) || new Set()
    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter(Boolean) as SessionMetadata[]
  }

  /**
   * Clean expired sessions
   */
  cleanExpiredSessions(maxInactiveHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - maxInactiveHours * 60 * 60 * 1000)
    const toRemove: string[] = []

    for (const [sessionId, session] of this.sessions) {
      if (session.lastActivity < cutoffTime) {
        toRemove.push(sessionId)
      }
    }

    for (const sessionId of toRemove) {
      this.removeSession(sessionId)
    }

    return toRemove.length
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number
    activeUsers: number
    sessionsBySecurityLevel: Record<string, number>
    averageRiskScore: number
  } {
    const totalSessions = this.sessions.size
    const activeUsers = this.userSessions.size

    const sessionsBySecurityLevel: Record<string, number> = {}
    let totalRiskScore = 0

    for (const session of this.sessions.values()) {
      sessionsBySecurityLevel[session.securityLevel] =
        (sessionsBySecurityLevel[session.securityLevel] || 0) + 1
      totalRiskScore += session.riskScore
    }

    return {
      totalSessions,
      activeUsers,
      sessionsBySecurityLevel,
      averageRiskScore: totalSessions > 0 ? totalRiskScore / totalSessions : 0,
    }
  }
}