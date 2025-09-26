/**
 * Enhanced Session Manager with Security Features
 *
 * Comprehensive session management with IP binding, fixation protection,
 * concurrent session limits, timeout controls, and anomaly detection.
 *
 * Security: Critical - Core session management with advanced security features
 * Compliance: OWASP Session Management Cheat Sheet, LGPD
 * @version 2.0.0
 */

import { SecurityUtils } from '@neonpro/security'
import { healthcareLogger } from '../logging/healthcare-logger'

// Security configuration
export interface SessionSecurityConfig {
  // IP Binding
  enableIPBinding: boolean
  allowMobileSubnetChanges: boolean

  // Session Fixation Protection
  regenerateSessionOnAuth: boolean
  sessionIdEntropyBits: number

  // Concurrent Sessions
  maxConcurrentSessions: number
  allowConcurrentNotification: boolean

  // Timeout Controls
  idleTimeout: number // milliseconds
  absoluteTimeout: number // milliseconds
  timeoutWarningThreshold: number // milliseconds before timeout

  // Anomaly Detection
  enableAnomalyDetection: boolean
  maxIPChangesPerHour: number
  enableGeolocationValidation: boolean

  // Cleanup
  cleanupInterval: number // milliseconds
}

// Enhanced session metadata with security features
export interface EnhancedSessionMetadata {
  // Basic session info
  sessionId: string
  _userId: string
  createdAt: Date
  lastActivity: Date

  // Security features
  ipAddress?: string
  originalIpAddress?: string
  userAgent?: string
  deviceFingerprint?: string

  // Session management
  isRealTimeSession: boolean
  permissions: string[]
  healthcareProfessional?: any
  lgpdConsent?: any

  // Security tracking
  securityLevel: 'normal' | 'elevated' | 'high'
  riskScore: number
  ipChangeCount: number
  lastIPChangeTime?: Date
  lastLocation?: string
  consecutiveFailures: number
  lastFailureTime?: Date

  // Timeout tracking
  lastWarningTime?: Date
  refreshCount: number
}

// IP validation result
export interface IPValidationResult {
  isValid: boolean
  action: 'allow' | 'warn' | 'block' | 'require_verification'
  reason?: string
  newIP?: string
}

// Anomaly detection result
export interface AnomalyDetectionResult {
  hasAnomaly: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  anomalies: string[]
  recommendedAction: 'allow' | 'warn' | 'block' | 'require_mfa'
  confidence: number
}

export class EnhancedSessionManager {
  private sessions = new Map<string, EnhancedSessionMetadata>()
  private userSessions = new Map<string, Set<string>>()
  private config: SessionSecurityConfig
  private cleanupInterval?: NodeJS.Timeout

  constructor(config: Partial<SessionSecurityConfig> = {}) {
    this.config = {
      // IP Binding
      enableIPBinding: true,
      allowMobileSubnetChanges: true,

      // Session Fixation Protection
      regenerateSessionOnAuth: true,
      sessionIdEntropyBits: 128,

      // Concurrent Sessions
      maxConcurrentSessions: 3,
      allowConcurrentNotification: true,

      // Timeout Controls
      idleTimeout: 30 * 60 * 1000, // 30 minutes
      absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours
      timeoutWarningThreshold: 5 * 60 * 1000, // 5 minutes

      // Anomaly Detection
      enableAnomalyDetection: true,
      maxIPChangesPerHour: 3,
      enableGeolocationValidation: false, // Disabled by default to avoid external dependencies

      // Cleanup
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      ...config,
    }

    // Start automatic cleanup
    this.startCleanup()
  }

  /**
   * Generate cryptographically secure session ID
   */
  private generateSecureSessionId(): string {
    // Use secure token generation from security utils
    return SecurityUtils.generateSecureToken(32)
  }

  /**
   * Generate secure session ID (async version for better randomness)
   */
  private async generateSecureSessionIdAsync(): Promise<string> {
    // Use secure token generation from security utils for async contexts
    return SecurityUtils.generateSecureToken(32)
  }

  /**
   * Calculate entropy of a string for session ID validation
   */
  private calculateEntropy(str: string): number {
    const chars = str.split('')
    const charCounts: { [key: string]: number } = {}

    chars.forEach(char => {
      charCounts[char] = (charCounts[char] || 0) + 1
    })

    const entropy = Object.values(charCounts).reduce((sum, _count) => {
      const probability = count / chars.length
      return sum - probability * Math.log2(probability)
    }, 0)

    return entropy
  }

  /**
   * Validate session ID format and entropy
   */
  private validateSessionId(sessionId: string): boolean {
    // Check format (32 character hex string)
    if (!/^[a-f0-9]{32}$/i.test(sessionId)) {
      return false
    }

    // Check entropy
    const entropy = this.calculateEntropy(sessionId)
    const minEntropy = 3.5 // Minimum entropy threshold
    return entropy >= minEntropy
  }

  /**
   * Update session with validation result tracking
   */
  private updateSessionValidationResult(
    session: EnhancedSessionMetadata,
    isValid: boolean,
  ): void {
    if (isValid) {
      session.consecutiveFailures = 0
      session.refreshCount++
    } else {
      session.consecutiveFailures++
      session.lastFailureTime = new Date()
    }
  }

  /**
   * Extract IP subnet for mobile network tolerance
   */
  private extractIPSubnet(ip: string): string {
    if (!ip) return ''
    const parts = ip.split('.')
    if (parts.length !== 4) return ip
    return parts.slice(0, 3).join('.')
  }

  /**
   * Validate IP address binding with mobile network tolerance
   */
  private validateIPBinding(
    session: EnhancedSessionMetadata,
    currentIP: string,
  ): IPValidationResult {
    if (!this.config.enableIPBinding || !session.ipAddress) {
      return { isValid: true, action: 'allow' }
    }

    // Exact match
    if (session.ipAddress === currentIP) {
      return { isValid: true, action: 'allow' }
    }

    // Mobile network tolerance (same subnet)
    if (this.config.allowMobileSubnetChanges) {
      const originalSubnet = this.extractIPSubnet(session.ipAddress)
      const currentSubnet = this.extractIPSubnet(currentIP)

      if (originalSubnet && currentSubnet && originalSubnet === currentSubnet) {
        // Update IP for mobile networks
        session.ipAddress = currentIP
        session.ipChangeCount++
        session.lastIPChangeTime = new Date()

        return {
          isValid: true,
          action: 'warn',
          reason: 'Mobile network IP change detected',
          newIP: currentIP,
        }
      }
    }

    // Check IP change frequency
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentIPChanges = session.lastIPChangeTime && session.lastIPChangeTime > oneHourAgo
      ? session.ipChangeCount
      : 0

    if (recentIPChanges >= this.config.maxIPChangesPerHour) {
      return {
        isValid: false,
        action: 'block',
        reason: 'Too many IP changes in short period',
      }
    }

    // IP mismatch - potentially suspicious
    return {
      isValid: false,
      action: 'require_verification',
      reason: 'IP address mismatch detected',
    }
  }

  /**
   * Detect session anomalies
   */
  private detectAnomalies(
    session: EnhancedSessionMetadata,
    currentIP: string,
    userAgent?: string,
  ): AnomalyDetectionResult {
    if (!this.config.enableAnomalyDetection) {
      return {
        hasAnomaly: false,
        riskLevel: 'low',
        anomalies: [],
        recommendedAction: 'allow',
        confidence: 1.0,
      }
    }

    const anomalies: string[] = []
    let riskScore = 0
    let confidence = 0.8

    // IP change detection
    if (session.ipAddress && session.ipAddress !== currentIP) {
      anomalies.push('IP address change detected')
      riskScore += 30
      confidence += 0.1
    }

    // User agent change detection
    if (session.userAgent && userAgent && session.userAgent !== userAgent) {
      anomalies.push('User agent change detected')
      riskScore += 40
      confidence += 0.15
    }

    // Rapid IP changes
    if (session.ipChangeCount > this.config.maxIPChangesPerHour) {
      anomalies.push('Excessive IP changes detected')
      riskScore += 50
      confidence += 0.2
    }

    // Consecutive failures
    if (session.consecutiveFailures > 3) {
      anomalies.push('Multiple consecutive authentication failures')
      riskScore += 60
      confidence += 0.25
    }

    // Determine risk level and action
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let recommendedAction: 'allow' | 'warn' | 'block' | 'require_mfa' = 'allow'

    if (riskScore >= 80) {
      riskLevel = 'critical'
      recommendedAction = 'block'
    } else if (riskScore >= 60) {
      riskLevel = 'high'
      recommendedAction = 'require_mfa'
    } else if (riskScore >= 30) {
      riskLevel = 'medium'
      recommendedAction = 'warn'
    }

    return {
      hasAnomaly: anomalies.length > 0,
      riskLevel,
      anomalies,
      recommendedAction,
      confidence: Math.min(confidence, 1.0),
    }
  }

  /**
   * Check session timeouts
   */
  private checkSessionTimeouts(session: EnhancedSessionMetadata): {
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
      }
    }

    // Check idle timeout
    if (idleTime >= this.config.idleTimeout) {
      return {
        isExpired: true,
        reason: 'Session expired due to inactivity',
      }
    }

    // Check if timeout warning should be sent
    const absoluteTimeRemaining = this.config.absoluteTimeout - sessionAge
    const idleTimeRemaining = this.config.idleTimeout - idleTime
    const timeRemaining = Math.min(absoluteTimeRemaining, idleTimeRemaining)

    const shouldWarn = timeRemaining <= this.config.timeoutWarningThreshold &&
      (!session.lastWarningTime ||
        now - session.lastWarningTime.getTime() > 60 * 1000) // Don't warn more than once per minute

    return {
      isExpired: false,
      timeRemaining,
      shouldWarn,
    }
  }

  /**
   * Manage concurrent sessions
   */
  private manageConcurrentSessions(
    _userId: string,
    currentSessionId: string,
  ): {
    action: 'allow' | 'remove_oldest' | 'notify'
    removedSession?: string
  } {
    const userSessionIds = this.userSessions.get(userId) || new Set()
    const userSessions = Array.from(userSessionIds)
      .map(id => this.sessions.get(id))
      .filter(Boolean) as EnhancedSessionMetadata[]

    if (userSessions.length < this.config.maxConcurrentSessions) {
      return { action: 'allow' }
    }

    if (userSessions.length === this.config.maxConcurrentSessions) {
      // Check if current session already exists
      const existingSession = userSessions.find(
        s => s.sessionId === currentSessionId,
      )
      if (existingSession) {
        return { action: 'allow' } // Session already exists, allow it
      }
    }

    // Find oldest session
    const oldestSession = userSessions.reduce((oldest, _current) =>
      current.createdAt < oldest.createdAt ? current : oldest
    )

    if (oldestSession.sessionId === currentSessionId) {
      return { action: 'allow' } // Current session is the oldest, keep it
    }

    // Remove oldest session
    this.removeSession(oldestSession.sessionId)

    return {
      action: 'remove_oldest',
      removedSession: oldestSession.sessionId,
    }
  }

  /**
   * Create new enhanced session
   */
  createSession(
    _userId: string,
    metadata: Partial<EnhancedSessionMetadata> = {},
  ): string {
    // Generate secure session ID
    const sessionId = this.generateSecureSessionId()

    // Manage concurrent sessions
    const concurrentResult = this.manageConcurrentSessions(userId, sessionId)
    if (
      concurrentResult.action === 'remove_oldest' &&
      concurrentResult.removedSession
    ) {
      healthcareLogger.warn('Removed oldest session due to concurrent session limit', {
        removedSession: concurrentResult.removedSession,
        userId,
        maxSessions: this.config.maxConcurrentSessions,
        severity: 'low'
      })
    }

    // Create enhanced session
    const session: EnhancedSessionMetadata = {
      sessionId,
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      securityLevel: 'normal',
      riskScore: 0,
      ipChangeCount: 0,
      consecutiveFailures: 0,
      refreshCount: 0,
      permissions: [],
      isRealTimeSession: false,
      ...metadata,
    }

    // Store original IP for binding
    if (metadata.ipAddress) {
      session.originalIpAddress = metadata.ipAddress
    }

    this.sessions.set(sessionId, session)

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set())
    }
    this.userSessions.get(userId)!.add(sessionId)

    return sessionId
  }

  /**
   * Regenerate session ID (for fixation protection)
   */
  regenerateSession(oldSessionId: string): string | null {
    const oldSession = this.sessions.get(oldSessionId)
    if (!oldSession) {
      return null
    }

    // Remove old session
    this.removeSession(oldSessionId)

    // Create new session with same metadata but new ID
    const { sessionId: _, ...metadata } = oldSession
    return this.createSession(oldSession.userId, metadata)
  }

  /**
   * Validate and update session
   */
  validateAndUpdateSession(
    sessionId: string,
    currentIP?: string,
    userAgent?: string,
  ): {
    isValid: boolean
    session?: EnhancedSessionMetadata
    action: 'allow' | 'warn' | 'block' | 'require_verification' | 'require_mfa'
    reason?: string
    warnings?: string[]
    timeoutWarning?: number
  } {
    // Validate session ID format first
    if (!this.validateSessionId(sessionId)) {
      return {
        isValid: false,
        action: 'block',
        reason: 'Invalid session ID format',
      }
    }

    const session = this.sessions.get(sessionId)
    if (!session) {
      return {
        isValid: false,
        action: 'block',
        reason: 'Session not found',
      }
    }

    // Check timeouts
    const timeoutCheck = this.checkSessionTimeouts(session)
    if (timeoutCheck.isExpired) {
      this.removeSession(sessionId)
      return {
        isValid: false,
        action: 'block',
        reason: timeoutCheck.reason,
      }
    }

    const warnings: string[] = []
    let finalAction:
      | 'allow'
      | 'warn'
      | 'block'
      | 'require_verification'
      | 'require_mfa' = 'allow'

    // IP binding validation
    if (currentIP) {
      const ipValidation = this.validateIPBinding(session, currentIP)
      if (!ipValidation.isValid) {
        // Track failure before returning
        session.consecutiveFailures++
        session.lastFailureTime = new Date()
        return {
          isValid: false,
          action: ipValidation.action,
          reason: ipValidation.reason,
        }
      }

      if (ipValidation.action === 'warn') {
        warnings.push(ipValidation.reason || 'IP change detected')
        finalAction = 'warn'

        // Update IP if this was a mobile network change
        if (ipValidation.newIP) {
          session.ipAddress = ipValidation.newIP
          session.ipChangeCount++
          session.lastIPChangeTime = new Date()
        }
      }
    }

    // Anomaly detection
    const anomalyResult = this.detectAnomalies(
      session,
      currentIP || '',
      userAgent,
    )
    if (anomalyResult.hasAnomaly) {
      warnings.push(...anomalyResult.anomalies)

      // Escalate action based on anomaly severity
      if (anomalyResult.recommendedAction === 'block') {
        // Track failure before returning
        session.consecutiveFailures++
        session.lastFailureTime = new Date()
        return {
          isValid: false,
          action: 'block',
          reason: `Security anomaly detected: ${anomalyResult.anomalies.join(', ')}`,
        }
      } else if (anomalyResult.recommendedAction === 'require_mfa') {
        finalAction = 'require_mfa'
      } else if (
        anomalyResult.recommendedAction === 'warn' &&
        finalAction === 'allow'
      ) {
        finalAction = 'warn'
      }

      // Update session security level and risk score
      session.securityLevel = anomalyResult.riskLevel === 'critical'
        ? 'high'
        : anomalyResult.riskLevel === 'high'
        ? 'high'
        : anomalyResult.riskLevel === 'medium'
        ? 'elevated'
        : session.securityLevel

      session.riskScore = anomalyResult.riskLevel === 'critical'
        ? 100
        : anomalyResult.riskLevel === 'high'
        ? 80
        : anomalyResult.riskLevel === 'medium'
        ? 50
        : session.riskScore
    }

    // Update session activity and track validation
    session.lastActivity = new Date()
    if (currentIP) {
      session.ipAddress = currentIP
    }
    if (userAgent) {
      session.userAgent = userAgent
    }

    // Track successful validation
    session.refreshCount++
    session.consecutiveFailures = 0

    // Update last warning time if warning was sent
    if (timeoutCheck.shouldWarn) {
      session.lastWarningTime = new Date()
    }

    return {
      isValid: true,
      session,
      action: finalAction,
      warnings: warnings.length > 0 ? warnings : undefined,
      timeoutWarning: timeoutCheck.timeRemaining,
    }
  }

  /**
   * Get session
   */
  getSession(sessionId: string): EnhancedSessionMetadata | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Remove session
   */
  removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (session) {
      // Remove from user sessions
      const userSessions = this.userSessions.get(session._userId)
      if (userSessions) {
        userSessions.delete(sessionId)
        if (userSessions.size === 0) {
          this.userSessions.delete(session._userId)
        }
      }

      this.sessions.delete(sessionId)
      return true
    }
    return false
  }

  /**
   * Get user sessions
   */
  getUserSessions(_userId: string): EnhancedSessionMetadata[] {
    const sessionIds = this.userSessions.get(userId) || new Set()
    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter(Boolean) as EnhancedSessionMetadata[]
  }

  /**
   * Remove all user sessions
   */
  removeAllUserSessions(_userId: string): number {
    const userSessionIds = this.userSessions.get(userId) || new Set()
    const removedCount = userSessionIds.size

    userSessionIds.forEach(sessionId => {
      this.removeSession(sessionId)
    })

    return removedCount
  }

  /**
   * Clean expired sessions
   */
  cleanExpiredSessions(maxInactiveHours?: number): number {
    const cutoffTime = new Date(
      Date.now() - (maxInactiveHours || 24) * 60 * 60 * 1000,
    )
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

  /**
   * Start automatic cleanup
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(() => {
      const cleanedCount = this.cleanExpiredSessions()
      if (cleanedCount > 0) {
        healthcareLogger.info('Cleaned expired sessions from session manager', {
          cleanedCount,
          totalSessions: this.sessions.size,
          severity: 'low'
        })
      }
    }, this.config.cleanupInterval)
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
  }

  /**
   * Destroy session manager and cleanup
   */
  destroy(): void {
    this.stopCleanup()
    this.sessions.clear()
    this.userSessions.clear()
  }

  /**
   * Validate session with timeout handling
   */
  async validateSessionWithTimeout(
    sessionId: string, 
    options: {
      timeoutWarning?: number
      autoExtend?: boolean
    } = {}
  ): Promise<{
    isValid: boolean
    isNearTimeout?: boolean
    timeRemaining?: number
    session?: EnhancedSessionMetadata
    warnings?: string[]
  }> {
    const session = this.sessions.get(sessionId)
    const now = new Date()

    if (!session) {
      return { isValid: false }
    }

    const timeRemaining = session.lastActivity.getTime() + this.config.idleTimeout - now.getTime()
    const timeoutWarningThreshold = options.timeoutWarning || this.config.timeoutWarningThreshold
    const isNearTimeout = timeRemaining <= timeoutWarningThreshold && timeRemaining > 0

    const warnings: string[] = []
    if (isNearTimeout) {
      warnings.push('Session approaching timeout')
    }

    // Auto-extend if requested and session is near timeout
    if (options.autoExtend && isNearTimeout) {
      session.lastActivity = now
      warnings.push('Session auto-extended')
    }

    return {
      isValid: timeRemaining > 0,
      isNearTimeout,
      timeRemaining: Math.max(0, timeRemaining),
      session: timeRemaining > 0 ? session : undefined,
      warnings
    }
  }

  /**
   * Extend session lifetime
   */
  async extendSessionLifetime(
    sessionId: string,
    options: {
      extensionMinutes?: number
      requireReauthentication?: boolean
    } = {}
  ): Promise<{
    success: boolean
    session?: EnhancedSessionMetadata
    extensionApplied?: boolean
    error?: string
  }> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    const extensionMinutes = options.extensionMinutes || 30
    const extensionMs = extensionMinutes * 60 * 1000

    // Require reauthentication for sensitive extensions
    if (options.requireReauthentication && session.securityLevel === 'high') {
      return { 
        success: false, 
        error: 'Reauthentication required for session extension' 
      }
    }

    session.lastActivity = new Date(session.lastActivity.getTime() + extensionMs)
    
    return {
      success: true,
      session,
      extensionApplied: true
    }
  }

  /**
   * Create enhanced session with comprehensive security
   */
  async createEnhancedSession(options: {
    userId: string
    userRole: string
    healthcareProvider: string
    patientId?: string
    requestContext: {
      ipAddress: string
      userAgent: string
    }
    sessionType?: 'standard' | 'telemedicine'
  }): Promise<EnhancedSessionMetadata> {
    const sessionId = await this.generateSecureSessionIdAsync()
    const now = new Date()

    const session: EnhancedSessionMetadata = {
      sessionId,
      _userId: options.userId,
      createdAt: now,
      lastActivity: now,
      ipAddress: options.requestContext.ipAddress,
      originalIpAddress: options.requestContext.ipAddress,
      userAgent: options.requestContext.userAgent,
      isRealTimeSession: options.sessionType === 'telemedicine',
      permissions: this.getDefaultPermissions(options.userRole),
      healthcareProfessional: {
        role: options.userRole,
        provider: options.healthcareProvider
      },
      securityLevel: options.sessionType === 'telemedicine' ? 'high' : 'normal',
      riskScore: 0,
      ipChangeCount: 0,
      consecutiveFailures: 0,
      refreshCount: 0
    }

    // Enforce concurrent session limits
    this.enforceConcurrentSessionLimit(options.userId, sessionId)

    this.sessions.set(sessionId, session)
    
    const userSessions = this.userSessions.get(options.userId) || new Set()
    userSessions.add(sessionId)
    this.userSessions.set(options.userId, userSessions)

    healthcareLogger.info('Enhanced session created', {
      sessionId,
      userId: options.userId,
      userRole: options.userRole,
      healthcareProvider: options.healthcareProvider,
      sessionType: options.sessionType,
      securityLevel: session.securityLevel,
      severity: 'low'
    })

    return session
  }

  /**
   * Detect session hijacking attempts
   */
  async detectSessionHijacking(attempt: {
    sessionId: string
    ipAddress: string
    userAgent: string
  }): Promise<{
    isHijackAttempt: boolean
    confidence: number
    evidence: string[]
    action: 'allow' | 'terminate_session' | 'require_mfa'
    alertGenerated: boolean
  }> {
    const session = this.sessions.get(attempt.sessionId)
    
    if (!session) {
      return {
        isHijackAttempt: false,
        confidence: 0,
        evidence: [],
        action: 'allow',
        alertGenerated: false
      }
    }

    const evidence: string[] = []
    let confidence = 0

    // IP address mismatch
    if (session.ipAddress !== attempt.ipAddress) {
      evidence.push('ip_address_mismatch')
      confidence += 40
      
      // Check if IP change is within mobile subnet tolerance
      if (!this.isMobileSubnetChange(session.ipAddress, attempt.ipAddress)) {
        confidence += 30
      }
    }

    // User agent mismatch
    if (session.userAgent !== attempt.userAgent) {
      evidence.push('user_agent_mismatch')
      confidence += 30
    }

    // Geographic location anomaly (if enabled)
    if (this.config.enableGeolocationValidation) {
      // Would implement geolocation check here
    }

    const isHijackAttempt = confidence >= 70
    const action = isHijackAttempt ? 
      (confidence >= 90 ? 'terminate_session' : 'require_mfa') : 'allow'

    if (isHijackAttempt) {
      healthcareLogger.warn('Potential session hijacking detected', {
        sessionId: attempt.sessionId,
        userId: session._userId,
        evidence,
        confidence,
        action,
        severity: 'high'
      })
    }

    return {
      isHijackAttempt,
      confidence,
      evidence,
      action,
      alertGenerated: isHijackAttempt
    }
  }

  /**
   * Validate session security parameters
   */
  async validateSessionSecurity(
    sessionId: string,
    options: {
      checkIPReputation?: boolean
      checkDeviceFingerprint?: boolean
      checkGeoLocation?: boolean
    } = {}
  ): Promise<{
    isValid: boolean
    securityScore: number
    threats: string[]
    recommendations: string[]
  }> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return {
        isValid: false,
        securityScore: 0,
        threats: ['session_not_found'],
        recommendations: ['Session does not exist or has expired']
      }
    }

    const threats: string[] = []
    const recommendations: string[] = []
    let securityScore = 100

    // Check IP reputation
    if (options.checkIPReputation && session.ipAddress) {
      const isSuspiciousIP = this.isSuspiciousIP(session.ipAddress)
      if (isSuspiciousIP) {
        threats.push('suspicious_ip_address')
        securityScore -= 30
        recommendations.push('Review IP address reputation')
      }
    }

    // Check device fingerprint
    if (options.checkDeviceFingerprint && !session.deviceFingerprint) {
      threats.push('missing_device_fingerprint')
      securityScore -= 15
      recommendations.push('Enable device fingerprinting for enhanced security')
    }

    // Check risk score
    if (session.riskScore > 50) {
      threats.push('high_risk_session')
      securityScore -= 25
      recommendations.push('Review session activity for anomalies')
    }

    // Check consecutive failures
    if (session.consecutiveFailures > 3) {
      threats.push('multiple_authentication_failures')
      securityScore -= 20
      recommendations.push('Enable additional authentication factors')
    }

    return {
      isValid: securityScore >= 70,
      securityScore: Math.max(0, securityScore),
      threats,
      recommendations
    }
  }

  /**
   * Validate MFA requirements for sensitive operations
   */
  async validateMFARequirements(
    sessionId: string,
    operation: {
      operationType: string
      sensitivityLevel: 'low' | 'medium' | 'high'
    }
  ): Promise<{
    mfaRequired: boolean
    mfaVerified: boolean
    isValid: boolean
    recommendations: string[]
  }> {
    const session = this.sessions.get(sessionId)
    
    if (!session) {
      return {
        mfaRequired: false,
        mfaVerified: false,
        isValid: false,
        recommendations: ['Session not found']
      }
    }

    const isTelemedicineSession = session.isRealTimeSession
    const isHighSensitivity = operation.sensitivityLevel === 'high'
    const mfaRequired = isTelemedicineSession || isHighSensitivity

    // Check if MFA is verified (would be stored in session metadata)
    const mfaVerified = session.securityLevel === 'high' || session.riskScore < 30

    const isValid = !mfaRequired || mfaVerified
    const recommendations: string[] = []

    if (mfaRequired && !mfaVerified) {
      if (isTelemedicineSession) {
        recommendations.push('MFA verification required for telemedicine sessions')
      }
      if (isHighSensitivity) {
        recommendations.push('MFA verification required for high-sensitivity operations')
      }
      recommendations.push('Complete MFA challenge before accessing sensitive data')
    }

    return {
      mfaRequired,
      mfaVerified,
      isValid,
      recommendations
    }
  }

  /**
   * Get comprehensive session metrics
   */
  getSessionMetrics(): {
    totalSessions: number
    activeSessions: number
    expiredSessions: number
    terminatedSessions: number
    averageSessionDuration: number
    securityEvents: number
    complianceViolations: number
    performanceMetrics: {
      averageValidationTime: number
      timeoutEvents: number
      extensionRequests: number
    }
    healthcareMetrics: {
      telemedicineSessions: number
      mfaVerifiedSessions: number
      consentLevelDistribution: Record<string, number>
    }
  } {
    const now = new Date()
    let totalDuration = 0
    let activeSessions = 0
    let expiredSessions = 0
    let securityEvents = 0
    let telemedicineSessions = 0
    let mfaVerifiedSessions = 0
    let timeoutEvents = 0
    let extensionRequests = 0

    const consentLevelDistribution: Record<string, number> = {}

    for (const session of this.sessions.values()) {
      const duration = now.getTime() - session.createdAt.getTime()
      totalDuration += duration

      if (session.lastActivity.getTime() + this.config.idleTimeout > now.getTime()) {
        activeSessions++
      } else {
        expiredSessions++
      }

      if (session.isRealTimeSession) {
        telemedicineSessions++
      }

      if (session.securityLevel === 'high') {
        mfaVerifiedSessions++
      }

      if (session.consecutiveFailures > 0) {
        securityEvents += session.consecutiveFailures
      }

      if (session.lastWarningTime) {
        timeoutEvents++
      }

      extensionRequests += session.refreshCount
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      expiredSessions,
      terminatedSessions: 0, // Would track terminated sessions
      averageSessionDuration: this.sessions.size > 0 ? totalDuration / this.sessions.size : 0,
      securityEvents,
      complianceViolations: 0, // Would track compliance violations
      performanceMetrics: {
        averageValidationTime: 0, // Would track actual validation times
        timeoutEvents,
        extensionRequests
      },
      healthcareMetrics: {
        telemedicineSessions,
        mfaVerifiedSessions,
        consentLevelDistribution
      }
    }
  }

  /**
   * Get default permissions based on user role
   */
  private getDefaultPermissions(userRole: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'healthcare_professional': [
        'read_patient_data',
        'write_patient_data',
        'view_medical_records',
        'create_appointments'
      ],
      'admin': [
        'read_patient_data',
        'write_patient_data',
        'manage_users',
        'view_audit_logs'
      ],
      'nurse': [
        'read_patient_data',
        'update_vitals',
        'view_medical_records'
      ]
    }

    return rolePermissions[userRole] || []
  }

  /**
   * Enforce concurrent session limit
   */
  private enforceConcurrentSessionLimit(userId: string, newSessionId: string): void {
    const userSessionIds = this.userSessions.get(userId) || new Set()
    const sessionIds = Array.from(userSessionIds)

    if (sessionIds.length >= this.config.maxConcurrentSessions) {
      // Remove oldest sessions to enforce limit
      const sessionsToRemove = sessionIds
        .map(id => this.sessions.get(id))
        .filter(session => session)
        .sort((a, b) => a!.lastActivity.getTime() - b!.lastActivity.getTime())
        .slice(0, sessionIds.length - this.config.maxConcurrentSessions + 1)

      sessionsToRemove.forEach(session => {
        if (session) {
          this.removeSession(session.sessionId)
        }
      })
    }
  }

  /**
   * Check if IP change is within mobile subnet tolerance
   */
  private isMobileSubnetChange(oldIP: string, newIP: string): boolean {
    if (!this.config.allowMobileSubnetChanges) {
      return false
    }

    // Simple implementation - check if first two octets match (mobile carrier subnet)
    const oldParts = oldIP.split('.')
    const newParts = newIP.split('.')
    
    return oldParts[0] === newParts[0] && oldParts[1] === newParts[1]
  }

  /**
   * Check if IP address is suspicious
   */
  private isSuspiciousIP(ipAddress: string): boolean {
    // Simple implementation - check against known suspicious patterns
    const suspiciousPatterns = [
      /^192\.168\.1\.1$/, // Common router IP (potential spoofing)
      /^10\.0\.0\./,     // Private network suspicious usage
      /^172\.(16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)\./ // VPN ranges
    ]

    return suspiciousPatterns.some(pattern => pattern.test(ipAddress))
  }
}
