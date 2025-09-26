/**
 * Healthcare Session Management Service
 *
 * Provides secure session management with healthcare compliance features including
 * patient data access controls, consent management, and audit trails.
 *
 * Security: Critical - Healthcare session management with compliance features
 * Compliance: LGPD, ANVISA, CFM, OWASP Session Management
 * @version 1.0.0
 */

import crypto from 'crypto'
import { SessionCookieUtils } from '../security/session-cookie-utils'
import { EnhancedSessionManager } from '../security/enhanced-session-manager'
import { createCryptographyManager, type CryptographyManager } from '../utils/security/cryptography'

/**
 * Healthcare session data with compliance tracking
 */
export interface HealthcareSession {
  sessionId: string
  userId: string
  userRole: string
  permissions: string[]
  healthcareProvider: string
  patientId?: string
  consentLevel: 'none' | 'basic' | 'full'
  sessionType: 'standard' | 'telemedicine' | 'emergency'
  mfaVerified: boolean
  createdAt: Date
  lastAccessedAt: Date
  expiresAt: Date
  ipAddress: string
  userAgent: string
  deviceFingerprint?: string
  location?: {
    country: string
    region: string
    city: string
  }
  dataAccessLog: DataAccessEntry[]
  complianceFlags: ComplianceFlags
}

/**
 * Data access log entry for audit trail
 */
export interface DataAccessEntry {
  timestamp: Date
  action: 'view' | 'create' | 'update' | 'delete' | 'export'
  resourceType: 'patient' | 'medical-record' | 'prescription' | 'appointment' | 'lab-result'
  resourceId: string
  purpose: string
  legalBasis: 'consent' | 'treatment' | 'emergency' | 'public-health'
  consentId?: string
}

/**
 * Healthcare compliance flags
 */
export interface ComplianceFlags {
  lgpdCompliant: boolean
  anonymizationRequired: boolean
  dataMinimizationApplied: boolean
  retentionPolicyApplied: boolean
  encryptionApplied: boolean
  accessControlApplied: boolean
  auditTrailEnabled: boolean
  breachNotificationRequired: boolean
}

/**
 * Session management options
 */
export interface SessionManagementOptions {
  sessionTimeout: number // in minutes
  absoluteTimeout: number // in minutes
  concurrentSessions: number
  mfaRequired: boolean
  geoRestriction?: string[]
  deviceRestriction?: boolean
  ipWhitelist?: string[]
  requireConsent: boolean
  auditLevel: 'basic' | 'detailed' | 'comprehensive'
}

/**
 * Healthcare Session Management Service
 */
export class HealthcareSessionManagementService {
  private static readonly DEFAULT_OPTIONS: SessionManagementOptions = {
    sessionTimeout: 30, // 30 minutes inactivity
    absoluteTimeout: 480, // 8 hours maximum
    concurrentSessions: 3,
    mfaRequired: false,
    deviceRestriction: true,
    requireConsent: true,
    auditLevel: 'comprehensive'
  }

  // Initialize cryptography manager
  private static cryptoManager: CryptographyManager;
  private static initializeCrypto() {
    if (!HealthcareSessionManagementService.cryptoManager) {
      HealthcareSessionManagementService.cryptoManager = createCryptographyManager();
      if (!HealthcareSessionManagementService.cryptoManager) {
        throw new Error('CryptographyManager initialization failed');
      }
    }
  }

  private static sessions = new Map<string, HealthcareSession>()
  private static userSessionMap = new Map<string, Set<string>>()
  private static cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.cryptoManager = createCryptographyManager()
    if (!this.cryptoManager) {
      throw new Error('CryptographyManager initialization failed')
    }
  }

  private cryptoManager: CryptographyManager

  /**
   * Create a new healthcare session
   */
  static async createSession(
    userId: string,
    userRole: string,
    healthcareProvider: string,
    options: Partial<SessionManagementOptions> = {},
    requestContext: {
      ipAddress: string
      userAgent: string
      deviceFingerprint?: string
      location?: { country: string; region: string; city: string }
    }
  ): Promise<HealthcareSession> {
    HealthcareSessionManagementService.initializeCrypto();
    const config = { ...this.DEFAULT_OPTIONS, ...options }

    // Check concurrent session limit
    await this.enforceConcurrentSessionLimit(userId, config.concurrentSessions)

    // Generate secure session ID
    const sessionId = this.generateSecureSessionId()

    // Validate geo restrictions
    if (config.geoRestriction && requestContext.location) {
      this.validateGeoRestriction(requestContext.location, config.geoRestriction)
    }

    // Validate IP whitelist
    if (config.ipWhitelist) {
      this.validateIPWhitelist(requestContext.ipAddress, config.ipWhitelist)
    }

    // Create session
    const session: HealthcareSession = {
      sessionId,
      userId,
      userRole,
      permissions: this.getDefaultPermissions(userRole),
      healthcareProvider,
      consentLevel: 'none', // Will be updated based on consent
      sessionType: 'standard',
      mfaVerified: !config.mfaRequired, // If MFA not required, mark as verified
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      expiresAt: new Date(Date.now() + config.absoluteTimeout * 60 * 1000),
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
      deviceFingerprint: requestContext.deviceFingerprint || '',
      location: requestContext.location || { country: '', region: '', city: '' },
      dataAccessLog: [],
      complianceFlags: this.initializeComplianceFlags()
    }

    // Store session
    this.sessions.set(sessionId, session)

    // Update user session map
    if (!this.userSessionMap.has(userId)) {
      this.userSessionMap.set(userId, new Set())
    }
    this.userSessionMap.get(userId)!.add(sessionId)

    // Log session creation
    await this.logSessionEvent('session_created', session, {
      concurrentSessions: this.userSessionMap.get(userId)!.size,
      mfaRequired: config.mfaRequired
    })

    return session
  }

  /**
   * Get session by ID
   */
  static getSession(sessionId: string): HealthcareSession | null {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return null
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.destroySession(sessionId)
      return null
    }

    // Update last accessed time
    session.lastAccessedAt = new Date()

    return session
  }

  /**
   * Update session with patient context and consent
   */
  static async updateSessionContext(
    sessionId: string,
    updates: {
      patientId?: string
      consentLevel?: 'none' | 'basic' | 'full'
      sessionType?: 'standard' | 'telemedicine' | 'emergency'
      mfaVerified?: boolean
    }
  ): Promise<boolean> {
    const session = this.getSession(sessionId)

    if (!session) {
      return false
    }

    // Validate consent requirements
    if (updates.patientId && updates.consentLevel === 'none') {
      throw new Error('Patient data access requires consent')
    }

    // Validate session type requirements
    if (updates.sessionType === 'telemedicine' && !updates.mfaVerified) {
      throw new Error('Telemedicine sessions require MFA verification')
    }

    // Update session
    Object.assign(session, updates)

    // Log context update
    await this.logSessionEvent('session_context_updated', session, updates)

    return true
  }

  /**
   * Log data access for audit trail
   */
  static async logDataAccess(
    sessionId: string,
    accessEntry: Omit<DataAccessEntry, 'timestamp'>
  ): Promise<boolean> {
    const session = this.getSession(sessionId)

    if (!session) {
      return false
    }

    // Validate access permissions
    if (!this.validateDataAccess(session, accessEntry)) {
      throw new Error('Unauthorized data access attempt')
    }

    // Create audit entry
    const auditEntry: DataAccessEntry = {
      ...accessEntry,
      timestamp: new Date()
    }

    // Add to session log
    session.dataAccessLog.push(auditEntry)

    // Update compliance flags
    this.updateComplianceFlags(session, auditEntry)

    // Log data access event
    await this.logSessionEvent('data_access', session, auditEntry)

    return true
  }

  /**
   * Validate session for healthcare data access
   */
  static validateSessionForAccess(
    sessionId: string,
    requiredConsentLevel: 'none' | 'basic' | 'full' = 'none',
    requiredSessionType: 'standard' | 'telemedicine' | 'emergency' | 'all' = 'all'
  ): { isValid: boolean; session?: HealthcareSession; error?: string } {
    const session = this.getSession(sessionId)

    if (!session) {
      return { isValid: false, error: 'Session not found or expired' }
    }

    // Check consent level
    const consentLevels = ['none', 'basic', 'full']
    const requiredLevelIndex = consentLevels.indexOf(requiredConsentLevel)
    const currentLevelIndex = consentLevels.indexOf(session.consentLevel)

    if (currentLevelIndex < requiredLevelIndex) {
      return { isValid: false, error: 'Insufficient consent level' }
    }

    // Check session type
    if (requiredSessionType !== 'all' && session.sessionType !== requiredSessionType) {
      return { isValid: false, error: 'Invalid session type for this access' }
    }

    // Check MFA requirement for sensitive operations
    if (requiredConsentLevel !== 'none' && !session.mfaVerified) {
      return { isValid: false, error: 'MFA verification required for this access level' }
    }

    return { isValid: true, session }
  }

  /**
   * Destroy session
   */
  static destroySession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return false
    }

    // Log session destruction
    this.logSessionEvent('session_destroyed', session, {
      sessionDuration: Date.now() - session.createdAt.getTime(),
      dataAccessCount: session.dataAccessLog.length
    })

    // Remove from sessions map
    this.sessions.delete(sessionId)

    // Remove from user session map
    const userSessions = this.userSessionMap.get(session.userId)
    if (userSessions) {
      userSessions.delete(sessionId)
      if (userSessions.size === 0) {
        this.userSessionMap.delete(session.userId)
      }
    }

    return true
  }

  /**
   * Destroy all sessions for a user
   */
  static destroyUserSessions(userId: string): number {
    const userSessions = this.userSessionMap.get(userId)
    if (!userSessions) {
      return 0
    }

    let destroyedCount = 0
    for (const sessionId of userSessions) {
      if (this.destroySession(sessionId)) {
        destroyedCount++
      }
    }

    return destroyedCount
  }

  /**
   * Get active sessions for user
   */
  static getUserSessions(userId: string): HealthcareSession[] {
    const userSessionIds = this.userSessionMap.get(userId)
    if (!userSessionIds) {
      return []
    }

    return Array.from(userSessionIds)
      .map(sessionId => this.getSession(sessionId))
      .filter(session => session !== null) as HealthcareSession[]
  }

  /**
   * Cleanup expired sessions
   */
  static cleanupExpiredSessions(): number {
    let cleanedCount = 0
    const now = new Date()

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.destroySession(sessionId)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * Generate session compliance report
   */
  static generateComplianceReport(userId?: string): {
    totalSessions: number
    activeSessions: number
    expiredSessions: number
    complianceMetrics: {
      lgpdCompliant: number
      mfaVerified: number
      consentRequired: number
      auditTrailComplete: number
    }
    riskIndicators: {
      concurrentSessions: number[]
      unusualAccess: string[]
      expiredSessions: string[]
    }
  } {
    const sessions = userId
      ? this.getUserSessions(userId)
      : Array.from(this.sessions.values())

    const now = new Date()
    const activeSessions = sessions.filter(s => s.expiresAt > now)
    const expiredSessions = sessions.filter(s => s.expiresAt <= now)

    const complianceMetrics = {
      lgpdCompliant: sessions.filter(s => s.complianceFlags.lgpdCompliant).length,
      mfaVerified: sessions.filter(s => s.mfaVerified).length,
      consentRequired: sessions.filter(s => s.consentLevel !== 'none').length,
      auditTrailComplete: sessions.filter(s => s.complianceFlags.auditTrailEnabled).length
    }

    const riskIndicators = {
      concurrentSessions: Array.from(this.userSessionMap.values())
        .map(sessions => sessions.size)
        .filter(count => count > 3),
      unusualAccess: sessions
        .filter(s => s.dataAccessLog.length > 100)
        .map(s => s.sessionId),
      expiredSessions: expiredSessions.map(s => s.sessionId)
    }

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      complianceMetrics,
      riskIndicators
    }
  }

  /**
   * Initialize session cleanup
   */
  static initializeCleanup(): void {
    if (this.cleanupInterval) {
      return
    }

    // Cleanup expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions()
    }, 5 * 60 * 1000)
  }

  /**
   * Generate secure session ID
   */
  private static generateSecureSessionId(): string {
    return HealthcareSessionManagementService.cryptoManager.generateSecureBytes(32).toString('hex')
  }

  /**
   * Get default permissions for role
   */
  private static getDefaultPermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'admin': ['*'],
      'doctor': ['patient:read', 'patient:write', 'medical-record:read', 'prescription:write'],
      'nurse': ['patient:read', 'medical-record:read', 'vital-signs:write'],
      'specialist': ['patient:read', 'medical-record:read', 'specialist-reports:write'],
      'emergency-medical-staff': ['patient:read', 'emergency-access:write'],
      'receptionist': ['patient:read:basic', 'appointment:write'],
      'medical-staff': ['patient:read:basic']
    }

    return rolePermissions[role] || []
  }

  /**
   * Enforce concurrent session limit
   */
  private static async enforceConcurrentSessionLimit(userId: string, limit: number): Promise<void> {
    const userSessions = this.getUserSessions(userId)

    if (userSessions.length >= limit) {
      // Destroy oldest session
      const oldestSession = userSessions.reduce((oldest, session) =>
        session.createdAt < oldest.createdAt ? session : oldest
      )

      this.destroySession(oldestSession.sessionId)

      await this.logSessionEvent('session_limit_exceeded', oldestSession, {
        limit,
        activeSessions: userSessions.length
      })
    }
  }

  /**
   * Validate geo restriction
   */
  private static validateGeoRestriction(
    location: { country: string; region: string; city: string },
    allowedCountries: string[]
  ): void {
    if (!allowedCountries.includes(location.country)) {
      throw new Error(`Access denied from location: ${location.country}`)
    }
  }

  /**
   * Validate IP whitelist
   */
  private static validateIPWhitelist(ipAddress: string, whitelist: string[]): void {
    if (!whitelist.includes(ipAddress)) {
      throw new Error(`Access denied from IP: ${ipAddress}`)
    }
  }

  /**
   * Validate data access permissions
   */
  private static validateDataAccess(session: HealthcareSession, access: Omit<DataAccessEntry, 'timestamp'>): boolean {
    // Check if user has required permissions
    const permissionMap: Record<string, string> = {
      'patient': 'patient:read',
      'medical-record': 'medical-record:read',
      'prescription': 'prescription:write',
      'appointment': 'appointment:write',
      'lab-result': 'medical-record:read'
    }

    const requiredPermission = permissionMap[access.resourceType]
    if (!requiredPermission || !session.permissions.includes(requiredPermission)) {
      return false
    }

    // Check consent level for patient data
    if (access.resourceType === 'patient' && session.consentLevel === 'none') {
      return false
    }

    // Check emergency access
    if (access.legalBasis === 'emergency' && session.sessionType !== 'emergency') {
      return false
    }

    return true
  }

  /**
   * Initialize compliance flags
   */
  private static initializeComplianceFlags(): ComplianceFlags {
    return {
      lgpdCompliant: true,
      anonymizationRequired: false,
      dataMinimizationApplied: true,
      retentionPolicyApplied: true,
      encryptionApplied: true,
      accessControlApplied: true,
      auditTrailEnabled: true,
      breachNotificationRequired: false
    }
  }

  /**
   * Update compliance flags based on data access
   */
  private static updateComplianceFlags(session: HealthcareSession, access: DataAccessEntry): void {
    // Update flags based on access patterns
    if (access.action === 'export') {
      session.complianceFlags.anonymizationRequired = true
    }

    if (access.resourceType === 'patient' && access.purpose.includes('research')) {
      session.complianceFlags.dataMinimizationApplied = true
    }
  }

  /**
   * Validate session with comprehensive checks
   */
  static async validateSession(sessionId: string): Promise<{
    isValid: boolean;
    session?: HealthcareSession;
    error?: string;
    metadata?: {
      validationTimestamp: Date;
      securityChecksPerformed: string[];
      riskScore: number;
      recommendations: string[];
    };
  }> {
    try {
      // Validate input
      if (!sessionId || sessionId.trim() === '') {
        return {
          isValid: false,
          error: 'Invalid session ID'
        }
      }

      const session = this.sessions.get(sessionId)
      const now = new Date()

      // Check if session exists
      if (!session) {
        return {
          isValid: false,
          session: undefined,
          error: 'Session not found or expired'
        }
      }

      // Check if session is expired
      if (session.expiresAt <= now) {
        // Clean up expired session
        this.sessions.delete(sessionId)
        const userSessions = this.userSessionMap.get(session.userId)
        if (userSessions) {
          userSessions.delete(sessionId)
        }

        return {
          isValid: false,
          session: undefined,
          error: 'Session not found or expired'
        }
      }

      // MFA validation for sensitive session types
      if (session.sessionType === 'telemedicine' && !session.mfaVerified) {
        return {
          isValid: false,
          session: undefined,
          error: 'MFA verification required for telemedicine sessions'
        }
      }

      // Update last accessed time for valid sessions
      session.lastAccessedAt = now

      // Calculate risk score based on various factors
      let riskScore = 0
      const securityChecksPerformed: string[] = []
      const recommendations: string[] = []

      // Session age risk
      const sessionAge = now.getTime() - session.createdAt.getTime()
      if (sessionAge > 24 * 60 * 60 * 1000) { // Older than 24 hours
        riskScore += 20
        recommendations.push('Consider session renewal for extended access')
      }
      securityChecksPerformed.push('session_age_validation')

      // Expiration proximity check
      const timeToExpiry = session.expiresAt.getTime() - now.getTime()
      if (timeToExpiry < 5 * 60 * 1000) { // Less than 5 minutes
        riskScore += 30
        recommendations.push('Session approaching expiration - renew soon')
      }
      securityChecksPerformed.push('expiration_proximity_check')

      // Compliance validation
      if (!session.complianceFlags.lgpdCompliant) {
        riskScore += 40
        recommendations.push('Session not LGPD compliant - immediate attention required')
      }
      securityChecksPerformed.push('compliance_validation')

      // Data access pattern analysis
      const recentAccessCount = session.dataAccessLog.filter(
        entry => now.getTime() - entry.timestamp.getTime() < 60 * 60 * 1000
      ).length
      if (recentAccessCount > 100) {
        riskScore += 25
        recommendations.push('High data access frequency detected - review activity')
      }
      securityChecksPerformed.push('access_pattern_analysis')

      securityChecksPerformed.push('session_existence')
      securityChecksPerformed.push('session_expiration')
      securityChecksPerformed.push('mfa_verification')

      await this.logSessionEvent('SESSION_VALIDATION', session, {
        isValid: true,
        riskScore,
        securityChecksPerformed
      })

      return {
        isValid: true,
        session,
        metadata: {
          validationTimestamp: now,
          securityChecksPerformed,
          riskScore,
          recommendations
        }
      }
    } catch (error) {
      console.error('Session validation error:', error)
      return {
        isValid: false,
        error: 'Session validation failed'
      }
    }
  }

  /**
   * Log session event
   */
  private static async logSessionEvent(
    eventType: string,
    session: HealthcareSession,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        sessionId: session.sessionId,
        userId: session.userId,
        userRole: session.userRole,
        healthcareProvider: session.healthcareProvider,
        patientId: session.patientId,
        sessionType: session.sessionType,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        details
      }

      console.info('[SESSION_EVENT]', JSON.stringify(logEntry))
    } catch (error) {
      console.error('Failed to log session event:', error)
    }
  }
}

// Initialize cleanup when module loads
HealthcareSessionManagementService.initializeCleanup()
