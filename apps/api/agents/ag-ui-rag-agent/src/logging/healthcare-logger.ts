/**
 * Healthcare Logger for LGPD-Compliant Audit Logging
 * Specialized logging for healthcare data access and agent operations
 * Implements data minimization and privacy-by-design principles
 */

import { createHash } from 'crypto'

interface LogEntry {
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  component: string
  action: string
  userId?: string
  clinicId?: string
  sessionId?: string
  message: string
  data?: Record<string, any>
  metadata?: Record<string, any>
}

interface DataAccessLog {
  userId: string
  clinicId: string
  action: string
  query?: string
  dataType?: string
  resultCount?: number
  sessionId?: string
  timestamp: Date
}

interface SecurityEventLog {
  userId: string
  clinicId: string
  action: string
  origin?: string
  userAgent?: string
  ipAddress?: string
  success: boolean
  timestamp: Date
}

interface AuditTrail {
  id: string
  userId: string
  clinicId: string
  category: 'data_access' | 'security' | 'system' | 'compliance'
  action: string
  details: Record<string, any>
  timestamp: Date
  hash: string
}

/**
 * LGPD-Compliant Healthcare Logger
 * Provides specialized logging for healthcare operations with privacy protection
 */
export class HealthcareLogger {
  private auditTrail: AuditTrail[] = []
  private dataAccessLogs: DataAccessLog[] = []
  private securityEventLogs: SecurityEventLog[] = []
  private maxAuditEntries = 10000
  private logRetentionDays = 365 // LGPD requirement: 1 year minimum

  constructor() {
    this.startLogCleanup()
  }

  /**
   * Log general information with healthcare context
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log('info', 'healthcare-agent', 'info', message, context)
  }

  /**
   * Log debug information
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log('debug', 'healthcare-agent', 'debug', message, context)
  }

  /**
   * Log warning messages
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log('warn', 'healthcare-agent', 'warning', message, context)
  }

  /**
   * Log error messages with optional error object
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    const errorContext = error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ...context
    } : context

    this.log('error', 'healthcare-agent', 'error', message, errorContext)
  }

  /**
   * Log healthcare data access (LGPD compliance)
   */
  public async logDataAccess(
    userId: string, 
    clinicId: string, 
    access: {
      action: string
      query?: string
      dataType?: string
      resultCount?: number
      sessionId?: string
      timestamp: Date
    }
  ): Promise<void> {
    const logEntry: DataAccessLog = {
      userId,
      clinicId,
      action: access.action,
      query: this.sanitizeQuery(access.query),
      dataType: access.dataType,
      resultCount: access.resultCount,
      sessionId: access.sessionId,
      timestamp: access.timestamp
    }

    this.dataAccessLogs.push(logEntry)

    // Create audit trail entry
    await this.createAuditTrail(userId, clinicId, 'data_access', access.action, {
      dataType: access.dataType,
      queryHash: access.query ? this.hashSensitiveData(access.query) : undefined,
      resultCount: access.resultCount,
      sessionId: access.sessionId
    })

    // Log to console/file (sanitized)
    this.info('Healthcare data accessed', {
      userId,
      clinicId,
      action: access.action,
      dataType: access.dataType,
      resultCount: access.resultCount,
      sessionId: access.sessionId
    })
  }

  /**
   * Log security events
   */
  public async logSecurityEvent(
    userId: string,
    clinicId: string,
    event: {
      action: string
      origin?: string
      userAgent?: string
      ipAddress?: string
      success?: boolean
      timestamp: Date
    }
  ): Promise<void> {
    const logEntry: SecurityEventLog = {
      userId,
      clinicId,
      action: event.action,
      origin: event.origin,
      userAgent: this.sanitizeUserAgent(event.userAgent),
      ipAddress: this.anonymizeIP(event.ipAddress),
      success: event.success ?? true,
      timestamp: event.timestamp
    }

    this.securityEventLogs.push(logEntry)

    // Create audit trail entry
    await this.createAuditTrail(userId, clinicId, 'security', event.action, {
      origin: event.origin,
      userAgentHash: event.userAgent ? this.hashSensitiveData(event.userAgent) : undefined,
      ipHash: event.ipAddress ? this.hashSensitiveData(event.ipAddress) : undefined,
      success: event.success ?? true
    })

    // Log to console/file
    const logLevel = event.success === false ? 'warn' : 'info'
    this[logLevel]('Security event logged', {
      userId,
      clinicId,
      action: event.action,
      success: event.success ?? true
    })
  }

  /**
   * Create LGPD-compliant audit trail entry
   */
  private async createAuditTrail(
    userId: string,
    clinicId: string,
    category: AuditTrail['category'],
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    const id = this.generateAuditId()
    const timestamp = new Date()
    
    // Create hash for integrity verification
    const hashInput = `${id}:${userId}:${clinicId}:${category}:${action}:${timestamp.toISOString()}`
    const hash = createHash('sha256').update(hashInput).digest('hex')

    const auditEntry: AuditTrail = {
      id,
      userId,
      clinicId,
      category,
      action,
      details: this.sanitizeAuditDetails(details),
      timestamp,
      hash
    }

    this.auditTrail.push(auditEntry)

    // Trim audit trail if too large
    if (this.auditTrail.length > this.maxAuditEntries) {
      this.auditTrail = this.auditTrail.slice(-this.maxAuditEntries)
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogEntry['level'],
    component: string,
    action: string,
    message: string,
    data?: Record<string, any>,
    metadata?: Record<string, any>
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      component,
      action,
      message,
      data: data ? this.sanitizeLogData(data) : undefined,
      metadata
    }

    // Output to console (in development) or structured logging system
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2))
    } else {
      // In production, this would integrate with your logging infrastructure
      // (e.g., Winston, structured logging service, etc.)
      this.writeToLogSystem(logEntry)
    }
  }

  /**
   * Sanitize query to remove sensitive information
   */
  private sanitizeQuery(query?: string): string | undefined {
    if (!query) return undefined

    // Remove potential PII patterns
    return query
      .replace(/cpf[:\s]?\d{11}/gi, 'cpf:***')
      .replace(/rg[:\s]?\d+/gi, 'rg:***')
      .replace(/\b\d{11}\b/g, '***') // CPF numbers
      .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '***') // CNPJ
      .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '***@***.***') // Email addresses
      .replace(/\b\d{4,5}-?\d{4}\b/g, '***-***') // Phone numbers
      .substring(0, 500) // Limit length
  }

  /**
   * Sanitize user agent string
   */
  private sanitizeUserAgent(userAgent?: string): string | undefined {
    if (!userAgent) return undefined

    // Keep only browser type and version, remove detailed system info
    const sanitized = userAgent
      .replace(/\([^)]*\)/g, '(system-info-removed)')
      .substring(0, 200)

    return sanitized
  }

  /**
   * Anonymize IP address for privacy
   */
  private anonymizeIP(ipAddress?: string): string | undefined {
    if (!ipAddress) return undefined

    // For IPv4, zero out last octet
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipAddress)) {
      return ipAddress.replace(/\.\d{1,3}$/, '.0')
    }

    // For IPv6, keep only first 64 bits
    if (ipAddress.includes(':')) {
      const parts = ipAddress.split(':')
      return parts.slice(0, 4).join(':') + '::0'
    }

    return 'anonymized'
  }

  /**
   * Hash sensitive data for audit trails
   */
  private hashSensitiveData(data: string): string {
    return createHash('sha256').update(data).digest('hex').substring(0, 16)
  }

  /**
   * Sanitize log data to remove PII
   */
  private sanitizeLogData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data }

    // Remove or hash sensitive fields
    const sensitiveFields = ['password', 'token', 'cpf', 'rg', 'email', 'phone']
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***'
      }
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeLogData(value)
      }
    }

    return sanitized
  }

  /**
   * Sanitize audit details
   */
  private sanitizeAuditDetails(details: Record<string, any>): Record<string, any> {
    return this.sanitizeLogData(details)
  }

  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2)
    return `audit_${timestamp}_${random}`
  }

  /**
   * Write to logging system (placeholder)
   */
  private writeToLogSystem(logEntry: LogEntry): void {
    // In production, this would integrate with your logging infrastructure
    // For now, just write to stdout in JSON format
    console.log(JSON.stringify(logEntry))
  }

  /**
   * Start log cleanup process (LGPD compliance)
   */
  private startLogCleanup(): void {
    setInterval(() => {
      this.cleanupOldLogs()
    }, 24 * 60 * 60 * 1000) // Daily cleanup
  }

  /**
   * Clean up logs older than retention period
   */
  private cleanupOldLogs(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.logRetentionDays)

    // Clean audit trail
    this.auditTrail = this.auditTrail.filter(entry => entry.timestamp > cutoffDate)

    // Clean data access logs
    this.dataAccessLogs = this.dataAccessLogs.filter(entry => entry.timestamp > cutoffDate)

    // Clean security event logs
    this.securityEventLogs = this.securityEventLogs.filter(entry => entry.timestamp > cutoffDate)

    this.info('Log cleanup completed', {
      cutoffDate: cutoffDate.toISOString(),
      remainingAuditEntries: this.auditTrail.length,
      remainingDataAccessLogs: this.dataAccessLogs.length,
      remainingSecurityLogs: this.securityEventLogs.length
    })
  }

  /**
   * Get audit trail for specific user/clinic (LGPD data subject rights)
   */
  public getAuditTrail(userId: string, clinicId: string, startDate?: Date, endDate?: Date): AuditTrail[] {
    let filtered = this.auditTrail.filter(entry => 
      entry.userId === userId && entry.clinicId === clinicId
    )

    if (startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= endDate)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get data access logs for compliance reporting
   */
  public getDataAccessLogs(userId: string, clinicId: string, days: number = 30): DataAccessLog[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return this.dataAccessLogs
      .filter(entry => 
        entry.userId === userId && 
        entry.clinicId === clinicId && 
        entry.timestamp > cutoffDate
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get security events for monitoring
   */
  public getSecurityEvents(clinicId: string, days: number = 7): SecurityEventLog[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return this.securityEventLogs
      .filter(entry => 
        entry.clinicId === clinicId && 
        entry.timestamp > cutoffDate
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Get logging statistics
   */
  public getStats() {
    return {
      auditTrailEntries: this.auditTrail.length,
      dataAccessLogs: this.dataAccessLogs.length,
      securityEventLogs: this.securityEventLogs.length,
      retentionDays: this.logRetentionDays,
      maxAuditEntries: this.maxAuditEntries
    }
  }

  /**
   * Export audit data for LGPD compliance (data portability)
   */
  public exportUserData(userId: string, clinicId: string): {
    auditTrail: AuditTrail[]
    dataAccessLogs: DataAccessLog[]
    securityEvents: SecurityEventLog[]
    exportDate: Date
  } {
    return {
      auditTrail: this.getAuditTrail(userId, clinicId),
      dataAccessLogs: this.getDataAccessLogs(userId, clinicId, 365), // Full year
      securityEvents: this.getSecurityEvents(clinicId, 365).filter(event => event.userId === userId),
      exportDate: new Date()
    }
  }

  /**
   * Delete user data for LGPD compliance (right to erasure)
   */
  public deleteUserData(userId: string, clinicId: string): void {
    // Remove audit trail entries
    this.auditTrail = this.auditTrail.filter(entry => 
      !(entry.userId === userId && entry.clinicId === clinicId)
    )

    // Remove data access logs
    this.dataAccessLogs = this.dataAccessLogs.filter(entry => 
      !(entry.userId === userId && entry.clinicId === clinicId)
    )

    // Remove security event logs
    this.securityEventLogs = this.securityEventLogs.filter(entry => 
      !(entry.userId === userId && entry.clinicId === clinicId)
    )

    this.info('User data deleted from logs', {
      userId,
      clinicId,
      deletionDate: new Date().toISOString()
    })
  }
}