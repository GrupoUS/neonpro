/**
 * Audit Trail Service
 *
 * Provides comprehensive audit trail functionality for authentication events,
 * data access, security incidents, and compliance monitoring with healthcare-specific features.
 *
 * @security_critical
 * Compliance: LGPD, ANVISA, CFM, HIPAA, OWASP Logging
 * @version 1.0.0
 */

import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication events
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  AUTH_MFA_SUCCESS = 'auth_mfa_success',
  AUTH_MFA_FAILURE = 'auth_mfa_failure',
  AUTH_LOGOUT = 'auth_logout',
  AUTH_SESSION_EXPIRED = 'auth_session_expired',
  AUTH_TOKEN_REFRESH = 'auth_token_refresh',
  AUTH_PASSWORD_CHANGE = 'auth_password_change',
  AUTH_ACCOUNT_LOCKED = 'auth_account_locked',
  AUTH_ACCOUNT_UNLOCKED = 'auth_account_unlocked',
  
  // Data access events
  DATA_ACCESS = 'data_access',
  DATA_CREATE = 'data_create',
  DATA_UPDATE = 'data_update',
  DATA_DELETE = 'data_delete',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_SEARCH = 'data_search',
  DATA_PRINT = 'data_print',
  DATA_SHARE = 'data_share',
  
  // Security events
  SECURITY_VIOLATION = 'security_violation',
  SECURITY_ALERT = 'security_alert',
  SECURITY_INCIDENT = 'security_incident',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  BLOCKED_ACCESS = 'blocked_access',
  MALWARE_DETECTED = 'malware_detected',
  INTRUSION_ATTEMPT = 'intrusion_attempt',
  
  // Compliance events
  COMPLIANCE_CHECK = 'compliance_check',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_REVOKED = 'consent_revoked',
  CONSENT_UPDATED = 'consent_updated',
  DATA_BREACH = 'data_breach',
  PRIVACY_VIOLATION = 'privacy_violation',
  
  // System events
  SYSTEM_STARTUP = 'system_startup',
  SYSTEM_SHUTDOWN = 'system_shutdown',
  SYSTEM_ERROR = 'system_error',
  SYSTEM_CONFIG_CHANGE = 'system_config_change',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
  
  // Healthcare specific events
  PATIENT_REGISTRATION = 'patient_registration',
  PATIENT_DISCHARGE = 'patient_discharge',
  PRESCRIPTION_ISSUED = 'prescription_issued',
  PRESCRIPTION_MODIFIED = 'prescription_modified',
  MEDICAL_RECORD_ACCESS = 'medical_record_access',
  TELEMEDICINE_SESSION = 'telemedicine_session',
  EMERGENCY_ACCESS = 'emergency_access',
  CONSENT_MANAGEMENT = 'consent_management'
}

/**
 * Audit severity levels
 */
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Audit event structure
 */
export interface AuditEvent {
  id: string
  timestamp: Date
  eventType: AuditEventType
  severity: AuditSeverity
  category: 'authentication' | 'data_access' | 'security' | 'compliance' | 'system' | 'healthcare'
  userId?: string
  sessionId?: string
  patientId?: string
  healthcareProvider?: string
  action: string
  resource?: string
  resourceId?: string
  description: string
  outcome: 'success' | 'failure' | 'error' | 'blocked'
  ipAddress: string
  userAgent?: string
  deviceFingerprint?: string
  location?: {
    country: string
    region: string
    city: string
  }
  metadata?: Record<string, any>
  complianceData?: {
    legalBasis?: string
    consentId?: string
    retentionPolicy?: string
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
    gdprSensitive?: boolean
  }
  riskScore?: number
  relatedEvents?: string[]
}

/**
 * Audit filter options
 */
export interface AuditFilter {
  eventType?: AuditEventType | AuditEventType[]
  severity?: AuditSeverity | AuditSeverity[]
  category?: string | string[]
  userId?: string
  sessionId?: string
  patientId?: string
  healthcareProvider?: string
  startDate?: Date
  endDate?: Date
  outcome?: string | string[]
  ipAddress?: string
  resource?: string
  minRiskScore?: number
  maxRiskScore?: number
  limit?: number
  offset?: number
}

/**
 * Audit statistics
 */
export interface AuditStatistics {
  totalEvents: number
  eventsByType: Record<AuditEventType, number>
  eventsBySeverity: Record<AuditSeverity, number>
  eventsByCategory: Record<string, number>
  eventsByUser: Record<string, number>
  eventsByIP: Record<string, number>
  timeDistribution: {
    hour: number[]
    day: number[]
    week: number[]
  }
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  complianceMetrics: {
    consentEvents: number
    dataAccessEvents: number
    securityViolations: number
    privacyViolations: number
  }
}

/**
 * Audit configuration
 */
export interface AuditConfiguration {
  logToFile: boolean
  logToDatabase: boolean
  logToConsole: boolean
  enableRealTimeAlerts: boolean
  retentionDays: number
  backupEnabled: boolean
  backupIntervalHours: number
  encryptionEnabled: boolean
  compressionEnabled: boolean
  sensitiveDataMasking: boolean
  includeStackTraces: boolean
  maxBatchSize: number
  flushIntervalMs: number
  alertThresholds: {
    eventsPerMinute: number
    failureRate: number
    riskScore: number
  }
}

/**
 * Audit Trail Service
 */
export class AuditTrailService {
  private static readonly DEFAULT_CONFIG: AuditConfiguration = {
    logToFile: true,
    logToDatabase: true,
    logToConsole: false,
    enableRealTimeAlerts: true,
    retentionDays: 365,
    backupEnabled: true,
    backupIntervalHours: 24,
    encryptionEnabled: true,
    compressionEnabled: true,
    sensitiveDataMasking: true,
    includeStackTraces: false,
    maxBatchSize: 100,
    flushIntervalMs: 5000,
    alertThresholds: {
      eventsPerMinute: 1000,
      failureRate: 0.1,
      riskScore: 70
    }
  }

  private static eventBuffer: AuditEvent[] = []
  private static flushTimer: NodeJS.Timeout | null = null
  private static statistics = this.initializeStatistics()
  private static alertHooks = new Map<string, (event: AuditEvent) => void>()
  private static config: AuditConfiguration = { ...this.DEFAULT_CONFIG }

  /**
   * Initialize audit trail service
   */
  static async initialize(config: Partial<AuditConfiguration> = {}): Promise<void> {
    this.config = { ...this.DEFAULT_CONFIG, ...config }
    
    // Ensure log directory exists
    if (this.config.logToFile) {
      await this.ensureLogDirectory()
    }
    
    // Start flush timer
    this.startFlushTimer()
    
    // Start backup timer
    if (this.config.backupEnabled) {
      this.startBackupTimer()
    }
    
    // Log service initialization
    await this.logEvent({
      eventType: AuditEventType.SYSTEM_STARTUP,
      severity: AuditSeverity.LOW,
      category: 'system',
      action: 'audit_service_initialized',
      description: 'Audit trail service initialized',
      outcome: 'success',
      ipAddress: 'localhost',
      metadata: { config: this.config }
    })
  }

  /**
   * Log an audit event
   */
  static async logEvent(eventData: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const event: AuditEvent = {
      ...eventData,
      id: this.generateEventId(),
      timestamp: new Date()
    }

    // Calculate risk score
    event.riskScore = this.calculateRiskScore(event)

    // Add to buffer
    this.eventBuffer.push(event)
    
    // Update statistics
    this.updateStatistics(event)

    // Check alert conditions
    await this.checkAlertConditions(event)

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.config.maxBatchSize) {
      await this.flushBuffer()
    }

    return event.id
  }

  /**
   * Log authentication event
   */
  static async logAuthEvent(
    eventType: AuditEventType,
    userId: string,
    outcome: 'success' | 'failure' | 'error' | 'blocked',
    requestContext: {
      ipAddress: string
      userAgent?: string
      sessionId?: string
      deviceFingerprint?: string
      location?: { country: string; region: string; city: string }
    },
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      eventType,
      severity: this.getSeverityForEventType(eventType, outcome),
      category: 'authentication',
      userId,
      sessionId: requestContext.sessionId,
      action: this.getActionForEventType(eventType),
      description: this.getDescriptionForEventType(eventType, outcome),
      outcome,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
      deviceFingerprint: requestContext.deviceFingerprint,
      location: requestContext.location,
      metadata
    })
  }

  /**
   * Log data access event
   */
  static async logDataAccess(
    action: string,
    userId: string,
    resource: string,
    resourceId: string,
    patientId?: string,
    healthcareProvider?: string,
    requestContext: {
      ipAddress: string
      userAgent?: string
      sessionId?: string
    },
    complianceData?: AuditEvent['complianceData'],
    outcome: 'success' | 'failure' | 'error' = 'success'
  ): Promise<string> {
    return this.logEvent({
      eventType: AuditEventType.DATA_ACCESS,
      severity: AuditSeverity.MEDIUM,
      category: 'data_access',
      userId,
      patientId,
      healthcareProvider,
      action,
      resource,
      resourceId,
      description: `${action} access to ${resource} ${resourceId}`,
      outcome,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
      sessionId: requestContext.sessionId,
      complianceData
    })
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    description: string,
    requestContext: {
      ipAddress: string
      userAgent?: string
      userId?: string
      sessionId?: string
    },
    metadata?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      eventType,
      severity,
      category: 'security',
      userId: requestContext.userId,
      sessionId: requestContext.sessionId,
      action: 'security_event',
      description,
      outcome: 'success',
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
      metadata
    })
  }

  /**
   * Log compliance event
   */
  static async logComplianceEvent(
    eventType: AuditEventType,
    description: string,
    userId?: string,
    patientId?: string,
    healthcareProvider?: string,
    complianceData?: AuditEvent['complianceData'],
    requestContext?: {
      ipAddress: string
      userAgent?: string
      sessionId?: string
    }
  ): Promise<string> {
    return this.logEvent({
      eventType,
      severity: AuditSeverity.HIGH,
      category: 'compliance',
      userId,
      patientId,
      healthcareProvider,
      action: 'compliance_event',
      description,
      outcome: 'success',
      ipAddress: requestContext?.ipAddress || 'system',
      userAgent: requestContext?.userAgent,
      sessionId: requestContext?.sessionId,
      complianceData
    })
  }

  /**
   * Query audit events
   */
  static async queryEvents(filter: AuditFilter): Promise<{ events: AuditEvent[]; total: number }> {
    // This is a simplified implementation
    // In production, you'd query a database or log files
    const events = this.eventBuffer.filter(event => this.matchesFilter(event, filter))
    
    const total = events.length
    const startIndex = filter.offset || 0
    const endIndex = startIndex + (filter.limit || 100)
    
    return {
      events: events.slice(startIndex, endIndex),
      total
    }
  }

  /**
   * Get audit statistics
   */
  static async getStatistics(filter?: AuditFilter): Promise<AuditStatistics> {
    // This is a simplified implementation
    // In production, you'd calculate this from stored events
    return { ...this.statistics }
  }

  /**
   * Generate audit report
   */
  static async generateReport(
    filter: AuditFilter,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<{ content: string; filename: string }> {
    const { events, total } = await this.queryEvents(filter)
    
    switch (format) {
      case 'json':
        return {
          content: JSON.stringify({ events, total, generatedAt: new Date() }, null, 2),
          filename: `audit-report-${Date.now()}.json`
        }
      
      case 'csv':
        const csvHeaders = [
          'id', 'timestamp', 'eventType', 'severity', 'category', 'userId',
          'action', 'resource', 'outcome', 'ipAddress', 'description'
        ]
        const csvRows = events.map(event => [
          event.id,
          event.timestamp.toISOString(),
          event.eventType,
          event.severity,
          event.category,
          event.userId || '',
          event.action,
          event.resource || '',
          event.outcome,
          event.ipAddress,
          event.description
        ])
        
        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')
        
        return {
          content: csvContent,
          filename: `audit-report-${Date.now()}.csv`
        }
      
      case 'pdf':
        // PDF generation would require a PDF library
        return {
          content: JSON.stringify({ events, total, generatedAt: new Date() }, null, 2),
          filename: `audit-report-${Date.now()}.json`
        }
      
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Register alert hook
   */
  static registerAlertHook(eventType: string, callback: (event: AuditEvent) => void): void {
    this.alertHooks.set(eventType, callback)
  }

  /**
   * Check for suspicious patterns
   */
  static async detectSuspiciousPatterns(timeWindowMinutes: number = 60): Promise<{
    suspiciousIPs: string[]
    suspiciousUsers: string[]
    patterns: Array<{ type: string; description: string; count: number }>
  }> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000)
    const recentEvents = this.eventBuffer.filter(event => event.timestamp > cutoffTime)
    
    const ipCounts = new Map<string, number>()
    const userCounts = new Map<string, number>()
    const patterns: Array<{ type: string; description: string; count: number }> = []
    
    recentEvents.forEach(event => {
      // Count by IP
      ipCounts.set(event.ipAddress, (ipCounts.get(event.ipAddress) || 0) + 1)
      
      // Count by user
      if (event.userId) {
        userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1)
      }
    })
    
    // Detect suspicious IPs
    const suspiciousIPs = Array.from(ipCounts.entries())
      .filter(([_, count]) => count > 100) // More than 100 events in time window
      .map(([ip]) => ip)
    
    // Detect suspicious users
    const suspiciousUsers = Array.from(userCounts.entries())
      .filter(([_, count]) => count > 50) // More than 50 events in time window
      .map(([user]) => user)
    
    // Detect patterns
    const failedAuths = recentEvents.filter(e => 
      e.eventType === AuditEventType.AUTH_FAILURE
    )
    
    if (failedAuths.length > 20) {
      patterns.push({
        type: 'brute_force',
        description: 'High number of authentication failures',
        count: failedAuths.length
      })
    }
    
    const dataExports = recentEvents.filter(e => 
      e.eventType === AuditEventType.DATA_EXPORT
    )
    
    if (dataExports.length > 10) {
      patterns.push({
        type: 'data_exfiltration',
        description: 'High number of data export events',
        count: dataExports.length
      })
    }
    
    return {
      suspiciousIPs,
      suspiciousUsers,
      patterns
    }
  }

  /**
   * Flush event buffer to storage
   */
  private static async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return
    }

    const events = [...this.eventBuffer]
    this.eventBuffer = []

    try {
      // Write to file
      if (this.config.logToFile) {
        await this.writeToFile(events)
      }
      
      // Write to database (simplified)
      if (this.config.logToDatabase) {
        await this.writeToDatabase(events)
      }
      
      // Log to console
      if (this.config.logToConsole) {
        events.forEach(event => {
          console.log('[AUDIT]', JSON.stringify(event))
        })
      }
    } catch (error) {
      console.error('Failed to flush audit buffer:', error)
      // Put events back in buffer for retry
      this.eventBuffer.unshift(...events)
    }
  }

  /**
   * Write events to file
   */
  private static async writeToFile(events: AuditEvent[]): Promise<void> {
    const dateStr = new Date().toISOString().split('T')[0]
    const filePath = path.join('logs', `audit-${dateStr}.json`)
    
    const logData = events.map(event => ({
      ...event,
      // Mask sensitive data if enabled
      ...(this.config.sensitiveDataMasking && this.maskSensitiveData(event))
    }))
    
    const content = JSON.stringify(logData, null, 2) + '\n'
    
    await fs.appendFile(filePath, content)
  }

  /**
   * Write events to database (simplified)
   */
  private static async writeToDatabase(events: AuditEvent[]): Promise<void> {
    // In production, this would write to a proper database
    // For now, we'll just acknowledge the operation
    console.log(`[AUDIT_DB] Writing ${events.length} events to database`)
  }

  /**
   * Calculate risk score for event
   */
  private static calculateRiskScore(event: AuditEvent): number {
    let score = 0
    
    // Base score by severity
    switch (event.severity) {
      case AuditSeverity.CRITICAL:
        score += 80
        break
      case AuditSeverity.HIGH:
        score += 60
        break
      case AuditSeverity.MEDIUM:
        score += 40
        break
      case AuditSeverity.LOW:
        score += 20
        break
    }
    
    // Adjust by outcome
    if (event.outcome === 'failure') score += 10
    if (event.outcome === 'error') score += 15
    if (event.outcome === 'blocked') score += 20
    
    // Adjust by category
    if (event.category === 'security') score += 10
    if (event.category === 'compliance') score += 15
    
    // Adjust by event type
    switch (event.eventType) {
      case AuditEventType.SECURITY_VIOLATION:
        score += 30
        break
      case AuditEventType.DATA_BREACH:
        score += 50
        break
      case AuditEventType.PRIVACY_VIOLATION:
        score += 40
        break
      case AuditEventType.INTRUSION_ATTEMPT:
        score += 35
        break
    }
    
    return Math.min(100, score)
  }

  /**
   * Update statistics
   */
  private static updateStatistics(event: AuditEvent): void {
    // Update total events
    this.statistics.totalEvents++
    
    // Update by type
    this.statistics.eventsByType[event.eventType] = 
      (this.statistics.eventsByType[event.eventType] || 0) + 1
    
    // Update by severity
    this.statistics.eventsBySeverity[event.severity] = 
      (this.statistics.eventsBySeverity[event.severity] || 0) + 1
    
    // Update by category
    this.statistics.eventsByCategory[event.category] = 
      (this.statistics.eventsByCategory[event.category] || 0) + 1
    
    // Update by user
    if (event.userId) {
      this.statistics.eventsByUser[event.userId] = 
        (this.statistics.eventsByUser[event.userId] || 0) + 1
    }
    
    // Update by IP
    this.statistics.eventsByIP[event.ipAddress] = 
      (this.statistics.eventsByIP[event.ipAddress] || 0) + 1
    
    // Update time distribution
    const hour = event.timestamp.getHours()
    this.statistics.timeDistribution.hour[hour]++
    
    // Update risk distribution
    if (event.riskScore !== undefined) {
      if (event.riskScore <= 25) {
        this.statistics.riskDistribution.low++
      } else if (event.riskScore <= 50) {
        this.statistics.riskDistribution.medium++
      } else if (event.riskScore <= 75) {
        this.statistics.riskDistribution.high++
      } else {
        this.statistics.riskDistribution.critical++
      }
    }
    
    // Update compliance metrics
    if (event.eventType === AuditEventType.CONSENT_GRANTED ||
        event.eventType === AuditEventType.CONSENT_REVOKED ||
        event.eventType === AuditEventType.CONSENT_UPDATED) {
      this.statistics.complianceMetrics.consentEvents++
    }
    
    if (event.category === 'data_access') {
      this.statistics.complianceMetrics.dataAccessEvents++
    }
    
    if (event.category === 'security') {
      this.statistics.complianceMetrics.securityViolations++
    }
    
    if (event.category === 'compliance' && event.outcome === 'failure') {
      this.statistics.complianceMetrics.privacyViolations++
    }
  }

  /**
   * Check alert conditions
   */
  private static async checkAlertConditions(event: AuditEvent): Promise<void> {
    // Check severity threshold
    if (event.riskScore && event.riskScore >= this.config.alertThresholds.riskScore) {
      await this.triggerAlert(event)
    }
    
    // Check event type specific alerts
    const hook = this.alertHooks.get(event.eventType)
    if (hook) {
      hook(event)
    }
  }

  /**
   * Trigger alert
   */
  private static async triggerAlert(event: AuditEvent): Promise<void> {
    const alert = {
      timestamp: new Date(),
      eventId: event.id,
      severity: event.severity,
      riskScore: event.riskScore,
      message: `High-risk event detected: ${event.description}`,
      event
    }
    
    console.warn('[ALERT]', JSON.stringify(alert))
    
    // In production, this would send alerts to monitoring systems
    // email, SMS, Slack, etc.
  }

  /**
   * Generate event ID
   */
  private static generateEventId(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * Ensure log directory exists
   */
  private static async ensureLogDirectory(): Promise<void> {
    try {
      await fs.mkdir('logs', { recursive: true })
    } catch (error) {
      if (error instanceof Error && (error as any).code !== 'EEXIST') {
        throw error
      }
    }
  }

  /**
   * Start flush timer
   */
  private static startFlushTimer(): void {
    if (this.flushTimer) {
      return
    }
    
    this.flushTimer = setInterval(() => {
      this.flushBuffer()
    }, this.config.flushIntervalMs)
  }

  /**
   * Start backup timer
   */
  private static startBackupTimer(): void {
    setInterval(() => {
      this.createBackup()
    }, this.config.backupIntervalHours * 60 * 60 * 1000)
  }

  /**
   * Create backup
   */
  private static async createBackup(): Promise<void> {
    // Simplified backup implementation
    console.log('[AUDIT] Creating backup...')
  }

  /**
   * Match event against filter
   */
  private static matchesFilter(event: AuditEvent, filter: AuditFilter): boolean {
    if (filter.eventType) {
      const eventTypes = Array.isArray(filter.eventType) ? filter.eventType : [filter.eventType]
      if (!eventTypes.includes(event.eventType)) return false
    }
    
    if (filter.severity) {
      const severities = Array.isArray(filter.severity) ? filter.severity : [filter.severity]
      if (!severities.includes(event.severity)) return false
    }
    
    if (filter.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category]
      if (!categories.includes(event.category)) return false
    }
    
    if (filter.userId && event.userId !== filter.userId) return false
    if (filter.sessionId && event.sessionId !== filter.sessionId) return false
    if (filter.patientId && event.patientId !== filter.patientId) return false
    if (filter.healthcareProvider && event.healthcareProvider !== filter.healthcareProvider) return false
    
    if (filter.startDate && event.timestamp < filter.startDate) return false
    if (filter.endDate && event.timestamp > filter.endDate) return false
    
    if (filter.outcome) {
      const outcomes = Array.isArray(filter.outcome) ? filter.outcome : [filter.outcome]
      if (!outcomes.includes(event.outcome)) return false
    }
    
    if (filter.ipAddress && event.ipAddress !== filter.ipAddress) return false
    if (filter.resource && event.resource !== filter.resource) return false
    
    if (filter.minRiskScore && (!event.riskScore || event.riskScore < filter.minRiskScore)) return false
    if (filter.maxRiskScore && (!event.riskScore || event.riskScore > filter.maxRiskScore)) return false
    
    return true
  }

  /**
   * Get severity for event type
   */
  private static getSeverityForEventType(eventType: AuditEventType, outcome: string): AuditSeverity {
    const severityMap: Record<AuditEventType, AuditSeverity> = {
      [AuditEventType.AUTH_SUCCESS]: AuditSeverity.LOW,
      [AuditEventType.AUTH_FAILURE]: AuditSeverity.MEDIUM,
      [AuditEventType.AUTH_MFA_SUCCESS]: AuditSeverity.LOW,
      [AuditEventType.AUTH_MFA_FAILURE]: AuditSeverity.HIGH,
      [AuditEventType.AUTH_LOGOUT]: AuditSeverity.LOW,
      [AuditEventType.AUTH_SESSION_EXPIRED]: AuditSeverity.LOW,
      [AuditEventType.AUTH_TOKEN_REFRESH]: AuditSeverity.LOW,
      [AuditEventType.AUTH_PASSWORD_CHANGE]: AuditSeverity.MEDIUM,
      [AuditEventType.AUTH_ACCOUNT_LOCKED]: AuditSeverity.HIGH,
      [AuditEventType.AUTH_ACCOUNT_UNLOCKED]: AuditSeverity.MEDIUM,
      [AuditEventType.DATA_ACCESS]: AuditSeverity.MEDIUM,
      [AuditEventType.DATA_CREATE]: AuditSeverity.MEDIUM,
      [AuditEventType.DATA_UPDATE]: AuditSeverity.MEDIUM,
      [AuditEventType.DATA_DELETE]: AuditSeverity.HIGH,
      [AuditEventType.DATA_EXPORT]: AuditSeverity.HIGH,
      [AuditEventType.DATA_IMPORT]: AuditSeverity.MEDIUM,
      [AuditEventType.DATA_SEARCH]: AuditSeverity.LOW,
      [AuditEventType.DATA_PRINT]: AuditSeverity.MEDIUM,
      [AuditEventType.DATA_SHARE]: AuditSeverity.HIGH,
      [AuditEventType.SECURITY_VIOLATION]: AuditSeverity.CRITICAL,
      [AuditEventType.SECURITY_ALERT]: AuditSeverity.HIGH,
      [AuditEventType.SECURITY_INCIDENT]: AuditSeverity.CRITICAL,
      [AuditEventType.SUSPICIOUS_ACTIVITY]: AuditSeverity.HIGH,
      [AuditEventType.RATE_LIMIT_EXCEEDED]: AuditSeverity.MEDIUM,
      [AuditEventType.BLOCKED_ACCESS]: AuditSeverity.MEDIUM,
      [AuditEventType.MALWARE_DETECTED]: AuditSeverity.CRITICAL,
      [AuditEventType.INTRUSION_ATTEMPT]: AuditSeverity.CRITICAL,
      [AuditEventType.COMPLIANCE_CHECK]: AuditSeverity.LOW,
      [AuditEventType.COMPLIANCE_VIOLATION]: AuditSeverity.HIGH,
      [AuditEventType.CONSENT_GRANTED]: AuditSeverity.LOW,
      [AuditEventType.CONSENT_REVOKED]: AuditSeverity.MEDIUM,
      [AuditEventType.CONSENT_UPDATED]: AuditSeverity.LOW,
      [AuditEventType.DATA_BREACH]: AuditSeverity.CRITICAL,
      [AuditEventType.PRIVACY_VIOLATION]: AuditSeverity.HIGH,
      [AuditEventType.SYSTEM_STARTUP]: AuditSeverity.LOW,
      [AuditEventType.SYSTEM_SHUTDOWN]: AuditSeverity.MEDIUM,
      [AuditEventType.SYSTEM_ERROR]: AuditSeverity.MEDIUM,
      [AuditEventType.SYSTEM_CONFIG_CHANGE]: AuditSeverity.MEDIUM,
      [AuditEventType.BACKUP_CREATED]: AuditSeverity.LOW,
      [AuditEventType.BACKUP_RESTORED]: AuditSeverity.MEDIUM,
      [AuditEventType.PATIENT_REGISTRATION]: AuditSeverity.MEDIUM,
      [AuditEventType.PATIENT_DISCHARGE]: AuditSeverity.MEDIUM,
      [AuditEventType.PRESCRIPTION_ISSUED]: AuditSeverity.MEDIUM,
      [AuditEventType.PRESCRIPTION_MODIFIED]: AuditSeverity.MEDIUM,
      [AuditEventType.MEDICAL_RECORD_ACCESS]: AuditSeverity.HIGH,
      [AuditEventType.TELEMEDICINE_SESSION]: AuditSeverity.HIGH,
      [AuditEventType.EMERGENCY_ACCESS]: AuditSeverity.CRITICAL,
      [AuditEventType.CONSENT_MANAGEMENT]: AuditSeverity.MEDIUM
    }
    
    return severityMap[eventType] || AuditSeverity.LOW
  }

  /**
   * Get action for event type
   */
  private static getActionForEventType(eventType: AuditEventType): string {
    return eventType.replace(/_/g, ' ').toLowerCase()
  }

  /**
   * Get description for event type
   */
  private static getDescriptionForEventType(eventType: AuditEventType, outcome: string): string {
    const action = this.getActionForEventType(eventType)
    return `${action} - ${outcome}`
  }

  /**
   * Mask sensitive data
   */
  private static maskSensitiveData(event: AuditEvent): Partial<AuditEvent> {
    const masked: Partial<AuditEvent> = {}
    
    // Mask user agent for privacy
    if (event.userAgent) {
      masked.userAgent = this.maskUserAgent(event.userAgent)
    }
    
    // Mask IP address if needed
    if (event.ipAddress && event.category === 'healthcare') {
      masked.ipAddress = this.maskIPAddress(event.ipAddress)
    }
    
    return masked
  }

  /**
   * Mask user agent
   */
  private static maskUserAgent(userAgent: string): string {
    // Remove version numbers and specific identifiers
    return userAgent.replace(/\/[\d.]+/g, '/X.X.X')
      .replace(/\([^)]*\)/g, '(masked)')
  }

  /**
   * Mask IP address
   */
  private static maskIPAddress(ipAddress: string): string {
    // Mask last octet of IPv4 or last segment of IPv6
    if (ipAddress.includes('.')) {
      return ipAddress.replace(/\.\d+$/, '.XXX')
    } else {
      return ipAddress.replace(/:[^:]+$/, ':XXXX')
    }
  }

  /**
   * Initialize statistics
   */
  private static initializeStatistics(): AuditStatistics {
    return {
      totalEvents: 0,
      eventsByType: {} as Record<AuditEventType, number>,
      eventsBySeverity: {} as Record<AuditSeverity, number>,
      eventsByCategory: {},
      eventsByUser: {},
      eventsByIP: {},
      timeDistribution: {
        hour: new Array(24).fill(0),
        day: new Array(7).fill(0),
        week: new Array(52).fill(0)
      },
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      complianceMetrics: {
        consentEvents: 0,
        dataAccessEvents: 0,
        securityViolations: 0,
        privacyViolations: 0
      }
    }
  }
}