/**
 * Security Integration Service
 *
 * Integrates all security components into a unified security system with
 * healthcare compliance, monitoring, and comprehensive threat detection.
 *
 * Security: Critical - Unified security system integration
 * Compliance: OWASP Top 10, LGPD, ANVISA, CFM
 * @version 1.0.0
 */

import { Context, Next } from 'hono'
import { AuthenticationContext } from '../middleware/enhanced-authentication-middleware'
import { AuditEventType, AuditSeverity, AuditTrailService } from './audit-trail-service'
import {
  HealthcareSession,
  HealthcareSessionManagementService,
} from './healthcare-session-management-service'
import { JWTSecurityService, TokenValidationResult } from './jwt-security-service'
import { SecurityValidationResult, SecurityValidationService } from './security-validation-service'

/**
 * Security integration configuration
 */
export interface SecurityIntegrationConfig {
  enableJWTSecurity: boolean
  enableSessionManagement: boolean
  enableSecurityValidation: boolean
  enableAuditTrail: boolean
  enableHealthcareCompliance: boolean
  enableRealTimeMonitoring: boolean
  enableThreatDetection: boolean
  sessionTimeout: number
  maxConcurrentSessions: number
  mfaRequired: boolean
  healthcareDataProtection: boolean
  auditRetentionDays: number
  securityHeadersEnabled: boolean
  rateLimitingEnabled: boolean
  ipReputationEnabled: boolean
  deviceFingerprintingEnabled: boolean
}

/**
 * Integrated security context
 */
export interface IntegratedSecurityContext {
  isAuthenticated: boolean
  authenticationContext?: AuthenticationContext
  session?: HealthcareSession
  tokenValidation?: TokenValidationResult
  securityValidation?: SecurityValidationResult
  riskScore: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  complianceStatus: 'compliant' | 'warning' | 'violation'
  recommendations: string[]
  metadata: {
    requestTimestamp: Date
    processingTime: number
    securityChecksPerformed: string[]
    eventsLogged: string[]
  }
}

/**
 * Security metrics
 */
export interface SecurityMetrics {
  totalRequests: number
  authenticatedRequests: number
  blockedRequests: number
  failedAuthentications: number
  securityViolations: number
  complianceViolations: number
  averageRiskScore: number
  highRiskRequests: number
  threatDetectionEvents: number
  sessionCreations: number
  sessionTerminations: number
  dataAccessEvents: number
  authenticationEvents: {
    successes: number
    failures: number
    mfaSuccesses: number
    mfaFailures: number
  }
}

/**
 * Security Integration Service
 */
export class SecurityIntegrationService {
  private static readonly DEFAULT_CONFIG: SecurityIntegrationConfig = {
    enableJWTSecurity: true,
    enableSessionManagement: true,
    enableSecurityValidation: true,
    enableAuditTrail: true,
    enableHealthcareCompliance: true,
    enableRealTimeMonitoring: true,
    enableThreatDetection: true,
    sessionTimeout: 30,
    maxConcurrentSessions: 3,
    mfaRequired: false,
    healthcareDataProtection: true,
    auditRetentionDays: 365,
    securityHeadersEnabled: true,
    rateLimitingEnabled: true,
    ipReputationEnabled: true,
    deviceFingerprintingEnabled: true,
  }

  private static config: SecurityIntegrationConfig = { ...this.DEFAULT_CONFIG }
  private static metrics: SecurityMetrics = this.initializeMetrics()
  private static isInitialized = false

  /**
   * Initialize security integration
   */
  static async initialize(config: Partial<SecurityIntegrationConfig> = {}): Promise<void> {
    this.config = { ...this.DEFAULT_CONFIG, ...config }

    try {
      // Initialize audit trail service
      if (this.config.enableAuditTrail) {
        await AuditTrailService.initialize({
          logToFile: true,
          logToDatabase: true,
          retentionDays: this.config.auditRetentionDays,
          enableRealTimeAlerts: this.config.enableRealTimeMonitoring,
          sensitiveDataMasking: this.config.healthcareDataProtection,
        })
      }

      // Initialize session management
      if (this.config.enableSessionManagement) {
        HealthcareSessionManagementService.initializeCleanup()
      }

      // Initialize security validation
      if (this.config.enableSecurityValidation) {
        SecurityValidationService.initializeCleanup()
      }

      // Register security alerts
      this.registerSecurityAlerts()

      this.isInitialized = true

      // Log initialization
      await this.logSecurityEvent(
        AuditEventType.SYSTEM_STARTUP,
        'Security integration service initialized',
        {
          config: this.config,
        },
      )
    } catch (error) {
      await this.logSecurityEvent(
        AuditEventType.SYSTEM_ERROR,
        'Failed to initialize security integration service',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      )
      throw error
    }
  }

  /**
   * Create integrated security middleware
   */
  static createSecurityMiddleware(config: Partial<SecurityIntegrationConfig> = {}) {
    return async (c: Context, next: Next) => {
      const startTime = Date.now()
      const integrationConfig = { ...this.config, ...config }

      try {
        // Perform comprehensive security validation
        const securityContext = await this.performSecurityValidation(c, integrationConfig)

        // Attach security context to request
        c.set('securityContext', securityContext)

        // Handle security violations
        if (
          securityContext.threatLevel === 'critical' ||
          (securityContext.threatLevel === 'high' && securityContext.riskScore > 80)
        ) {
          return this.handleSecurityViolation(c, securityContext)
        }

        // Log security event
        if (integrationConfig.enableAuditTrail) {
          await this.logSecurityAccessEvent(c, securityContext)
        }

        // Update metrics
        this.updateMetrics(securityContext)

        // Add security headers
        if (integrationConfig.securityHeadersEnabled) {
          this.addSecurityHeaders(c)
        }

        await next()

        // Process response time
        const processingTime = Date.now() - startTime
        securityContext.metadata.processingTime = processingTime
      } catch (error) {
        const processingTime = Date.now() - startTime

        // Log security error
        await this.logSecurityError(c, error instanceof Error ? error.message : 'Unknown error', {
          processingTime,
        })

        throw error
      }
    }
  }

  /**
   * Perform comprehensive security validation
   */
  private static async performSecurityValidation(
    c: Context,
    config: SecurityIntegrationConfig,
  ): Promise<IntegratedSecurityContext> {
    const startTime = Date.now()
    const securityChecksPerformed: string[] = []
    const eventsLogged: string[] = []
    let riskScore = 0
    const recommendations: string[] = []

    // Initialize security context
    const securityContext: IntegratedSecurityContext = {
      isAuthenticated: false,
      riskScore: 0,
      threatLevel: 'low',
      complianceStatus: 'compliant',
      recommendations: [],
      metadata: {
        requestTimestamp: new Date(),
        processingTime: 0,
        securityChecksPerformed: [],
        eventsLogged: [],
      },
    }

    try {
      // 1. Security Validation
      if (config.enableSecurityValidation) {
        const securityValidation = await SecurityValidationService.validateRequestSecurity(c, {
          enableRateLimiting: config.rateLimitingEnabled,
          enableIPReputation: config.ipReputationEnabled,
          enableDeviceFingerprinting: config.deviceFingerprintingEnabled,
          healthcareDataProtection: config.healthcareDataProtection,
        })

        securityContext.securityValidation = securityValidation
        securityChecksPerformed.push('security_validation')

        if (!securityValidation.isValid) {
          riskScore += (100 - securityValidation.score) / 2
          recommendations.push(...securityValidation.recommendations)
        }
      }

      // 2. Authentication Validation
      if (config.enableJWTSecurity || config.enableSessionManagement) {
        const authContext = await this.performAuthentication(c, config)
        securityContext.authenticationContext = authContext
        securityContext.isAuthenticated = authContext.isAuthenticated
        securityChecksPerformed.push('authentication')

        if (authContext.isAuthenticated) {
          // Validate token if JWT authentication
          if (authContext.authMethod === 'jwt' && authContext.tokenPayload) {
            const tokenValidation = await JWTSecurityService.validateToken(
              c.req.header('authorization')?.replace('Bearer ', '') || '',
            )

            securityContext.tokenValidation = tokenValidation
            securityChecksPerformed.push('jwt_validation')

            if (!tokenValidation.isValid) {
              riskScore += 30
              recommendations.push('Token validation failed')
            }
          }

          // Get session if session authentication
          if (authContext.sessionId && config.enableSessionManagement) {
            const session = HealthcareSessionManagementService.getSession(authContext.sessionId)
            securityContext.session = session || undefined
            securityChecksPerformed.push('session_validation')
          }
        } else {
          riskScore += 20
          recommendations.push('Authentication required')
        }
      }

      // 3. Healthcare Compliance Validation
      if (config.enableHealthcareCompliance && securityContext.isAuthenticated) {
        const complianceValidation = await this.performHealthcareComplianceValidation(
          c,
          securityContext,
        )

        if (complianceValidation.hasViolations) {
          securityContext.complianceStatus = 'violation'
          riskScore += 40
          recommendations.push(...complianceValidation.violations)
        } else if (complianceValidation.hasWarnings) {
          securityContext.complianceStatus = 'warning'
          riskScore += 10
          recommendations.push(...complianceValidation.warnings)
        }

        securityChecksPerformed.push('healthcare_compliance')
      }

      // 4. Threat Detection
      if (config.enableThreatDetection) {
        const threatDetection = await this.performThreatDetection(c, securityContext)
        securityChecksPerformed.push('threat_detection')

        if (threatDetection.hasThreats) {
          riskScore += threatDetection.threatScore
          recommendations.push(...threatDetection.recommendations)
        }
      }

      // Calculate final risk score and threat level
      securityContext.riskScore = Math.min(100, Math.max(0, riskScore))
      securityContext.threatLevel = this.calculateThreatLevel(securityContext.riskScore)
      securityContext.recommendations = recommendations

      // Update metadata
      securityContext.metadata.securityChecksPerformed = securityChecksPerformed
      securityContext.metadata.eventsLogged = eventsLogged

      return securityContext
    } catch (error) {
      // Log security validation error through audit trail
      // Note: Using console.error here as this is a critical security validation failure
      // that occurs before audit trail service is guaranteed to be available

      // Fallback security context for errors
      return {
        ...securityContext,
        riskScore: 90, // High risk due to validation error
        threatLevel: 'critical',
        complianceStatus: 'violation',
        recommendations: ['Security validation error occurred'],
        metadata: {
          requestTimestamp: new Date(),
          processingTime: Date.now() - startTime,
          securityChecksPerformed: securityChecksPerformed,
          eventsLogged,
        },
      }
    }
  }

  /**
   * Perform authentication validation
   */
  private static async performAuthentication(
    c: Context,
    config: SecurityIntegrationConfig,
  ): Promise<AuthenticationContext> {
    const baseContext: AuthenticationContext = {
      isAuthenticated: false,
      authMethod: 'none',
      clientIP: this.getClientIP(c),
      userAgent: c.req.header('user-agent'),
    }

    // Try JWT authentication
    if (config.enableJWTSecurity) {
      const authHeader = c.req.header('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7)
          const validationResult = await JWTSecurityService.validateToken(token)

          if (validationResult.isValid && validationResult.payload) {
            return {
              ...baseContext,
              isAuthenticated: true,
              authMethod: 'jwt',
              userId: validationResult.payload.sub,
              userRole: validationResult.payload.role,
              permissions: validationResult.payload.permissions,
              healthcareProvider: validationResult.payload.healthcareProvider,
              patientId: validationResult.payload.patientId,
              consentLevel: validationResult.payload.consentLevel,
              sessionType: validationResult.payload.sessionType,
              mfaVerified: validationResult.payload.mfaVerified,
              tokenPayload: validationResult.payload,
            }
          }
        } catch (error) {
          await this.logSecurityEvent(AuditEventType.AUTH_FAILURE, 'JWT authentication failed', {
            error,
          })
        }
      }
    }

    // Try session authentication
    if (config.enableSessionManagement) {
      const cookieHeader = c.req.header('cookie')
      if (cookieHeader) {
        try {
          // Simplified session validation
          // In production, use the session cookie utils
          const sessionId = this.extractSessionId(cookieHeader)
          if (sessionId) {
            const session = HealthcareSessionManagementService.getSession(sessionId)
            if (session) {
              return {
                ...baseContext,
                isAuthenticated: true,
                authMethod: 'session',
                userId: session.userId,
                userRole: session.userRole,
                permissions: session.permissions,
                healthcareProvider: session.healthcareProvider,
                patientId: session.patientId,
                consentLevel: session.consentLevel,
                sessionId: session.sessionId,
                mfaVerified: session.mfaVerified,
              }
            }
          }
        } catch (error) {
          await this.logSecurityEvent(
            AuditEventType.AUTH_FAILURE,
            'Session authentication failed',
            { error },
          )
        }
      }
    }

    return baseContext
  }

  /**
   * Perform healthcare compliance validation
   */
  private static async performHealthcareComplianceValidation(
    c: Context,
    securityContext: IntegratedSecurityContext,
  ): Promise<
    { hasViolations: boolean; hasWarnings: boolean; violations: string[]; warnings: string[] }
  > {
    const violations: string[] = []
    const warnings: string[] = []

    // Check for HTTPS in production
    if (process.env.NODE_ENV === 'production' && !this.isSecureRequest(c)) {
      violations.push('HTTPS required for healthcare data')
    }

    // Check consent requirements
    if (
      securityContext.authenticationContext?.patientId &&
      !securityContext.authenticationContext.consentLevel
    ) {
      violations.push('Patient data access requires consent')
    }

    // Check MFA requirements for sensitive operations
    if (
      securityContext.authenticationContext?.sessionType === 'telemedicine' &&
      !securityContext.authenticationContext.mfaVerified
    ) {
      violations.push('MFA required for telemedicine sessions')
    }

    // Check data access patterns
    if (c.req.path.includes('/patients') && !securityContext.isAuthenticated) {
      violations.push('Authentication required for patient data access')
    }

    return {
      hasViolations: violations.length > 0,
      hasWarnings: warnings.length > 0,
      violations,
      warnings,
    }
  }

  /**
   * Perform threat detection
   */
  private static async performThreatDetection(
    c: Context,
    securityContext: IntegratedSecurityContext,
  ): Promise<{ hasThreats: boolean; threatScore: number; recommendations: string[] }> {
    const recommendations: string[] = []
    let threatScore = 0

    // Check for suspicious user agents
    const userAgent = c.req.header('user-agent') || ''
    const suspiciousAgents = [
      'sqlmap',
      'nikto',
      'nmap',
      'masscan',
      'zgrab',
      'curl',
      'wget',
      'python-requests',
      'bot',
      'spider',
    ]

    if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      threatScore += 25
      recommendations.push('Suspicious user agent detected')
    }

    // Check for high-frequency requests
    const clientIP = this.getClientIP(c)
    if (this.isHighFrequencyIP(clientIP)) {
      threatScore += 30
      recommendations.push('High request frequency detected')
    }

    // Check for authentication failures
    if (securityContext.authenticationContext && !securityContext.isAuthenticated) {
      if (this.isHighFailureRateIP(clientIP)) {
        threatScore += 40
        recommendations.push('High authentication failure rate detected')
      }
    }

    // Check for suspicious patterns in query parameters
    const query = c.req.query()
    const suspiciousPatterns = [
      /union.*select/i,
      /<script[^>]*>/i,
      /javascript:/i,
      /\.\.\//i,
    ]

    for (const [_key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            threatScore += 35
            recommendations.push('Suspicious query pattern detected')
            break
          }
        }
      }
    }

    return {
      hasThreats: threatScore > 0,
      threatScore,
      recommendations,
    }
  }

  /**
   * Handle security violation
   */
  private static handleSecurityViolation(c: Context, securityContext: IntegratedSecurityContext) {
    const errorResponse = {
      success: false,
      error: {
        code: 'SECURITY_VIOLATION',
        message: 'Security violation detected',
        threatLevel: securityContext.threatLevel,
        riskScore: securityContext.riskScore,
        recommendations: securityContext.recommendations,
      },
    }

    // Log security violation
    this.logSecurityEvent(AuditEventType.SECURITY_VIOLATION, 'Security violation detected', {
      threatLevel: securityContext.threatLevel,
      riskScore: securityContext.riskScore,
      recommendations: securityContext.recommendations,
    })

    // Update metrics
    this.metrics.blockedRequests++
    this.metrics.securityViolations++

    return c.json(errorResponse, 403)
  }

  /**
   * Log security access event
   */
  private static async logSecurityAccessEvent(
    c: Context,
    securityContext: IntegratedSecurityContext,
  ): Promise<void> {
    const eventType = securityContext.isAuthenticated
      ? AuditEventType.AUTH_SUCCESS
      : AuditEventType.AUTH_FAILURE
    const severity = this.getSeverityForThreatLevel(securityContext.threatLevel)

    await AuditTrailService.logEvent({
      eventType,
      severity,
      category: 'security',
      userId: securityContext.authenticationContext?.userId,
      sessionId: securityContext.authenticationContext?.sessionId,
      patientId: securityContext.authenticationContext?.patientId,
      healthcareProvider: securityContext.authenticationContext?.healthcareProvider,
      action: 'security_validation',
      description: `Security validation completed - ${securityContext.threatLevel} threat level`,
      outcome: securityContext.threatLevel === 'critical' ? 'blocked' : 'success',
      ipAddress: this.getClientIP(c),
      userAgent: c.req.header('user-agent'),
      metadata: {
        riskScore: securityContext.riskScore,
        complianceStatus: securityContext.complianceStatus,
        threatLevel: securityContext.threatLevel,
        recommendations: securityContext.recommendations,
        securityChecksPerformed: securityContext.metadata.securityChecksPerformed,
      },
    })
  }

  /**
   * Log security event
   */
  private static async logSecurityEvent(
    eventType: AuditEventType,
    description: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    await AuditTrailService.logEvent({
      eventType,
      severity: AuditSeverity.MEDIUM,
      category: 'security',
      action: 'security_event',
      description,
      outcome: 'success',
      ipAddress: 'system',
      metadata,
    })
  }

  /**
   * Log security error
   */
  private static async logSecurityError(
    c: Context,
    errorMessage: string,
    additionalData: Record<string, any>,
  ): Promise<void> {
    await AuditTrailService.logEvent({
      eventType: AuditEventType.SYSTEM_ERROR,
      severity: AuditSeverity.HIGH,
      category: 'security',
      action: 'security_error',
      description: `Security validation error: ${errorMessage}`,
      outcome: 'error',
      ipAddress: this.getClientIP(c),
      userAgent: c.req.header('user-agent'),
      metadata: {
        error: errorMessage,
        ...additionalData,
      },
    })
  }

  /**
   * Add security headers
   */
  private static addSecurityHeaders(c: Context): void {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-Security-Metrics': JSON.stringify({
        riskScore: c.get('securityContext')?.riskScore || 0,
        threatLevel: c.get('securityContext')?.threatLevel || 'low',
        complianceStatus: c.get('securityContext')?.complianceStatus || 'compliant',
      }),
    }

    Object.entries(securityHeaders).forEach(([key, value]) => {
      c.header(key, value)
    })
  }

  /**
   * Update security metrics
   */
  private static updateMetrics(securityContext: IntegratedSecurityContext): void {
    this.metrics.totalRequests++

    if (securityContext.isAuthenticated) {
      this.metrics.authenticatedRequests++
    }

    if (securityContext.threatLevel === 'critical') {
      this.metrics.blockedRequests++
    }

    if (
      !securityContext.isAuthenticated &&
      securityContext.authenticationContext?.authMethod !== 'none'
    ) {
      this.metrics.failedAuthentications++
    }

    if (securityContext.complianceStatus === 'violation') {
      this.metrics.complianceViolations++
    }

    if (securityContext.riskScore > 70) {
      this.metrics.highRiskRequests++
    }
  }

  /**
   * Get security metrics
   */
  static getSecurityMetrics(): SecurityMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset security metrics
   */
  static resetSecurityMetrics(): void {
    this.metrics = this.initializeMetrics()
  }

  /**
   * Perform security health check
   */
  static async performSecurityHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    components: {
      jwtSecurity: 'healthy' | 'warning' | 'critical'
      sessionManagement: 'healthy' | 'warning' | 'critical'
      securityValidation: 'healthy' | 'warning' | 'critical'
      auditTrail: 'healthy' | 'warning' | 'critical'
      healthcareCompliance: 'healthy' | 'warning' | 'critical'
    }
    issues: string[]
    recommendations: string[]
  }> {
    const components = {
      jwtSecurity: 'healthy' as const,
      sessionManagement: 'healthy' as const,
      securityValidation: 'healthy' as const,
      auditTrail: 'healthy' as const,
      healthcareCompliance: 'healthy' as const,
    }

    const issues: string[] = []
    const recommendations: string[] = []

    // Check JWT security
    try {
      if (!process.env.JWT_PRIVATE_KEY || !process.env.JWT_PUBLIC_KEY) {
        components.jwtSecurity = 'critical'
        issues.push('JWT keys not configured')
        recommendations.push('Configure JWT_PRIVATE_KEY and JWT_PUBLIC_KEY environment variables')
      }
    } catch (_error) {
      components.jwtSecurity = 'critical'
      issues.push('JWT security validation failed')
    }

    // Check session management
    try {
      const sessionCount = HealthcareSessionManagementService.cleanupExpiredSessions()
      if (sessionCount > 100) {
        components.sessionManagement = 'warning'
        issues.push('High number of expired sessions detected')
        recommendations.push('Review session timeout settings')
      }
    } catch (_error) {
      components.sessionManagement = 'critical'
      issues.push('Session management validation failed')
    }

    // Check security validation
    try {
      // Simplified health check
      if (this.metrics.highRiskRequests > this.metrics.totalRequests * 0.1) {
        components.securityValidation = 'warning'
        issues.push('High number of high-risk requests detected')
        recommendations.push('Review security validation rules')
      }
    } catch (_error) {
      components.securityValidation = 'critical'
      issues.push('Security validation service failed')
    }

    // Check audit trail
    try {
      if (!this.isInitialized) {
        components.auditTrail = 'critical'
        issues.push('Audit trail service not initialized')
        recommendations.push('Initialize audit trail service')
      }
    } catch (_error) {
      components.auditTrail = 'critical'
      issues.push('Audit trail service failed')
    }

    // Determine overall status
    const hasCritical = Object.values(components).some(status => status === 'critical')
    const hasWarning = Object.values(components).some(status => status === 'warning')

    const status = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy'

    return {
      status,
      components,
      issues,
      recommendations,
    }
  }

  /**
   * Register security alerts
   */
  private static registerSecurityAlerts(): void {
    // Register authentication failure alert
    AuditTrailService.registerAlertHook(AuditEventType.AUTH_FAILURE, event => {
      // Security-critical console output for real-time alerting
      // These console statements are intentional for security monitoring
      console.warn('[SECURITY_ALERT] Authentication failure detected:', event)
    })

    // Register security violation alert
    AuditTrailService.registerAlertHook(AuditEventType.SECURITY_VIOLATION, event => {
      // Security-critical console output for real-time alerting
      // These console statements are intentional for security monitoring
      console.error('[SECURITY_ALERT] Security violation detected:', event)
    })

    // Register data breach alert
    AuditTrailService.registerAlertHook(AuditEventType.DATA_BREACH, event => {
      // Security-critical console output for real-time alerting
      // These console statements are intentional for security monitoring
      console.error('[SECURITY_ALERT] Data breach detected:', event)
    })
  }

  /**
   * Helper methods
   */
  private static getClientIP(c: Context): string {
    return c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      'unknown'
  }

  private static isSecureRequest(c: Context): boolean {
    return c.req.header('x-forwarded-proto') === 'https' ||
      c.req.header('cf-visitor')?.includes('https') ||
      process.env.NODE_ENV !== 'production'
  }

  private static extractSessionId(cookieHeader: string): string | null {
    const cookies = cookieHeader.split(';').map(cookie => cookie.trim())
    const sessionCookie = cookies.find(cookie => cookie.startsWith('sessionId='))
    return sessionCookie ? sessionCookie.split('=')[1] : null
  }

  private static calculateThreatLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical'
    if (riskScore >= 60) return 'high'
    if (riskScore >= 30) return 'medium'
    return 'low'
  }

  private static getSeverityForThreatLevel(threatLevel: string): AuditSeverity {
    switch (threatLevel) {
      case 'critical':
        return AuditSeverity.CRITICAL
      case 'high':
        return AuditSeverity.HIGH
      case 'medium':
        return AuditSeverity.MEDIUM
      case 'low':
        return AuditSeverity.LOW
      default:
        return AuditSeverity.LOW
    }
  }

  private static isHighFrequencyIP(_ipAddress: string): boolean {
    // Simplified frequency check
    // In production, use a proper rate limiting service
    return false
  }

  private static isHighFailureRateIP(_ipAddress: string): boolean {
    // Simplified failure rate check
    // In production, use a proper failure tracking service
    return false
  }

  private static initializeMetrics(): SecurityMetrics {
    return {
      totalRequests: 0,
      authenticatedRequests: 0,
      blockedRequests: 0,
      failedAuthentications: 0,
      securityViolations: 0,
      complianceViolations: 0,
      averageRiskScore: 0,
      highRiskRequests: 0,
      threatDetectionEvents: 0,
      sessionCreations: 0,
      sessionTerminations: 0,
      dataAccessEvents: 0,
      authenticationEvents: {
        successes: 0,
        failures: 0,
        mfaSuccesses: 0,
        mfaFailures: 0,
      },
    }
  }
}
