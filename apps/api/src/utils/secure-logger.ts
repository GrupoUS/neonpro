/**
 * 🔒 SECURE LOGGER - Enhanced LGPD Compliant Logging System
 *
 * Features:
 * - Automatic sensitive data masking with advanced pattern detection
 * - LGPD compliance built-in with audit trail integration
 * - Edge runtime compatible with performance optimization
 * - Environment-based log levels with granular control
 * - Audit trail support with structured logging
 * - Performance metrics and monitoring integration
 * - Context-aware logging with correlation IDs
 * - Structured output for better observability
 */

// LGPD Sensitive Data Patterns
const SENSITIVE_PATTERNS = {
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  cnpj: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+55\s?)?(?:\(\d{2}\)\s?)?\d{4,5}-?\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  password: /("password"|"senha"|"token"|"secret"|"key"):\s*"[^"]+"/gi,
  authorization: /("authorization"|"bearer"):\s*"[^"]+"/gi,
}

const SENSITIVE_KEYS = [
  'password',
  'senha',
  'token',
  'secret',
  'key',
  'authorization',
  'bearer',
  'cpf',
  'cnpj',
  'rg',
  'passport',
  'credit_card',
  'card_number',
  'cvv',
  'pin',
  'otp',
  'medical_record',
]

interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error' | 'silent'
  maskSensitiveData?: boolean
  lgpdCompliant?: boolean
  auditTrail?: boolean
  enableMetrics?: boolean
  enableStructuredOutput?: boolean
  enableCorrelationIds?: boolean
  _service?: string
  environment?: 'development' | 'staging' | 'production'
  version?: string
  enablePerformanceTracking?: boolean
}

interface LogContext {
  _userId?: string
  patientId?: string
  operation?: string
  endpoint?: string
  ip?: string
  userAgent?: string
  timestamp?: string
  correlationId?: string
  auditType?: string
  compliance?: string
  duration?: number
  memoryUsage?: number
  requestMethod?: string
  requestPath?: string
  statusCode?: number
  errorCode?: string
  performanceMetrics?: {
    responseTime?: number
    memoryUsed?: number
    cpuUsage?: number
  }
}

class SecureLogger {
  private config: Required<LoggerConfig>
  private metrics: {
    logsCount: number
    errorCount: number
    warningCount: number
    averageResponseTime: number
    memoryUsage: number[]
  }
  private performanceTracker: Map<string, number> = new Map()

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level ||
        (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
      maskSensitiveData: config.maskSensitiveData ?? true,
      lgpdCompliant: config.lgpdCompliant ?? true,
      auditTrail: config.auditTrail ?? true,
      enableMetrics: config.enableMetrics ?? true,
      enableStructuredOutput: config.enableStructuredOutput ?? true,
      enableCorrelationIds: config.enableCorrelationIds ?? true,
      _service: config._service || 'neonpro-api',
      environment: config.environment || process.env.NODE_ENV || 'development',
      version: config.version || '1.0.0',
      enablePerformanceTracking: config.enablePerformanceTracking ?? true,
    }

    // Initialize metrics tracking
    this.metrics = {
      logsCount: 0,
      errorCount: 0,
      warningCount: 0,
      averageResponseTime: 0,
      memoryUsage: [],
    }
  }

  private formatLog(
    level: string,
    message: string,
    _context?: LogContext,
  ): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      _service: this.config._service,
      environment: process.env.NODE_ENV || 'development',
      message: this.config.maskSensitiveData
        ? this.maskSensitiveData(message)
        : message,
      ...this.maskObjectData(_context || {}),
    }

    const formattedMessage = JSON.stringify(logEntry)

    switch (level) {
      case 'debug':
        console.warn(formattedMessage)
        break
      case 'info':
        console.warn(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
      default:
        console.warn(formattedMessage)
    }
  }

  private maskSensitiveData(text: string): string {
    if (!this.config.maskSensitiveData || typeof text !== 'string') {
      return text
    }

    let maskedText = text

    // Apply pattern-based masking
    Object.entries(SENSITIVE_PATTERNS).forEach(([, pattern]) => {
      maskedText = maskedText.replace(pattern, match => {
        const visibleChars = Math.min(3, Math.floor(match.length * 0.3))
        return (
          match.substring(0, visibleChars) +
          '*'.repeat(match.length - visibleChars)
        )
      })
    })

    return maskedText
  }

  private maskObjectData(obj: any): any {
    if (!this.config.maskSensitiveData || !obj || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.maskObjectData(item))
    }

    const masked: any = {}

    Object.entries(obj).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase()

      if (
        SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey))
      ) {
        masked[key] = this.maskValue(value)
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskObjectData(value)
      } else if (typeof value === 'string') {
        masked[key] = this.maskSensitiveData(value)
      } else {
        masked[key] = value
      }
    })

    return masked
  }

  private maskValue(value: any): string {
    if (typeof value !== 'string') {
      return '[MASKED]'
    }

    if (value.length <= 3) {
      return '*'.repeat(value.length)
    }

    const visibleChars = Math.min(3, Math.floor(value.length * 0.3))
    return (
      value.substring(0, visibleChars) + '*'.repeat(value.length - visibleChars)
    )
  }

  // Public logging methods
  debug(message: string, _context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.formatLog('debug', message, this.enrichContext(_context))
    }
  }

  info(message: string, _context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.formatLog('info', message, this.enrichContext(_context))
    }
  }

  warn(message: string, _context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.formatLog('warn', message, this.enrichContext(_context))
    }
  }

  error(message: string, error?: Error, _context?: LogContext): void {
    const enrichedContext = this.enrichContext(_context)

    if (error) {
      ;(enrichedContext as any).error = {
        name: error.name,
        message: this.config.maskSensitiveData
          ? this.maskSensitiveData(error.message)
          : error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    }

    this.formatLog('error', message, enrichedContext)
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  /**
   * Enhanced logging with performance tracking and metrics
   */
  logWithMetrics(level: string, message: string, _context?: LogContext & { duration?: number }): void {
    if (!this.shouldLog(level)) return

    const enrichedContext = this.enrichContext(_context)
    const startTime = this.performanceTracker.get(message) || Date.now()

    if (enrichedContext.duration) {
      this.updateResponseTimeMetrics(enrichedContext.duration)
    }

    // Add performance metrics
    if (this.config.enablePerformanceTracking) {
      enrichedContext.performanceMetrics = {
        responseTime: enrichedContext.duration,
        memoryUsed: process.memoryUsage ? process.memoryUsage().heapUsed : 0,
        cpuUsage: this.getCPUUsage(),
      }
    }

    this.formatLog(level, message, enrichedContext)
    this.updateMetrics(level)
  }

  /**
   * Start tracking operation performance
   */
  startTracking(operation: string): string {
    const trackingId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.performanceTracker.set(trackingId, Date.now())
    return trackingId
  }

  /**
   * End tracking and log performance metrics
   */
  endTracking(trackingId: string, level: string = 'info', context?: LogContext): void {
    const startTime = this.performanceTracker.get(trackingId)
    if (!startTime) return

    const duration = Date.now() - startTime
    this.performanceTracker.delete(trackingId)

    this.logWithMetrics(level, `Operation completed`, {
      ...context,
      duration,
      operation: trackingId.split('_')[0],
    })
  }

  /**
   * Log HTTP request with enhanced metrics
   */
  logHttpRequest(_context: {
    method: string
    path: string
    statusCode: number
    duration: number
    _userId?: string
    userAgent?: string
    ip?: string
    responseSize?: number
  }): void {
    const level = this.getHttpLogLevel(_context.statusCode)
    const message = `${_context.method} ${_context.path} - ${_context.statusCode}`

    this.logWithMetrics(level, message, {
      _userId: _context._userId,
      requestMethod: _context.method,
      requestPath: _context.path,
      statusCode: _context.statusCode,
      duration: _context.duration,
      userAgent: _context.userAgent,
      ip: _context.ip,
      performanceMetrics: {
        responseTime: _context.duration,
        memoryUsed: process.memoryUsage ? process.memoryUsage().heapUsed : 0,
      },
    })
  }

  /**
   * Log database operations with performance tracking
   */
  logDatabaseOperation(operation: string, query: string, duration: number, context?: LogContext): void {
    this.logWithMetrics(duration > 1000 ? 'warn' : 'info', `Database ${operation}`, {
      ...context,
      operation,
      duration,
      query: this.config.maskSensitiveData ? this.maskSensitiveData(query) : query,
    })
  }

  /**
   * Get current logger metrics
   */
  getMetrics(): {
    logsCount: number
    errorCount: number
    warningCount: number
    averageResponseTime: number
    memoryUsage: {
      current: number
      average: number
      max: number
    }
    uptime: number
  } {
    return {
      logsCount: this.metrics.logsCount,
      errorCount: this.metrics.errorCount,
      warningCount: this.metrics.warningCount,
      averageResponseTime: this.metrics.averageResponseTime,
      memoryUsage: {
        current: process.memoryUsage ? process.memoryUsage().heapUsed : 0,
        average: this.metrics.memoryUsage.length > 0
          ? this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length
          : 0,
        max: this.metrics.memoryUsage.length > 0 ? Math.max(...this.metrics.memoryUsage) : 0,
      },
      uptime: process.uptime ? process.uptime() : 0,
    }
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      logsCount: 0,
      errorCount: 0,
      warningCount: 0,
      averageResponseTime: 0,
      memoryUsage: [],
    }
    this.performanceTracker.clear()
  }

  // Private helper methods
  private updateMetrics(level: string): void {
    this.metrics.logsCount++

    if (level === 'error') this.metrics.errorCount++
    if (level === 'warn') this.metrics.warningCount++

    // Track memory usage
    if (process.memoryUsage) {
      const memoryUsed = process.memoryUsage().heapUsed
      this.metrics.memoryUsage.push(memoryUsed)

      // Keep only last 100 measurements
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100)
      }
    }
  }

  private updateResponseTimeMetrics(duration: number): void {
    const current = this.metrics.averageResponseTime
    this.metrics.averageResponseTime = current === 0 ? duration : (current + duration) / 2
  }

  private getHttpLogLevel(statusCode: number): string {
    if (statusCode >= 500) return 'error'
    if (statusCode >= 400) return 'warn'
    if (statusCode >= 300) return 'info'
    return 'debug'
  }

  private getCPUUsage(): number {
    // Simple CPU usage estimation
    const usage = process.cpuUsage ? process.cpuUsage() : { user: 0, system: 0 }
    return usage.user + usage.system
  }

  // LGPD Compliance Methods
  auditDataAccess(_context: {
    _userId: string
    patientId?: string
    operation: string
    dataType: string
    endpoint: string
    ip: string
    userAgent: string
  }): void {
    if (!this.config.auditTrail) return

    this.formatLog('info', 'LGPD_DATA_ACCESS_AUDIT', {
      ...context,
      auditType: 'data_access',
      timestamp: new Date().toISOString(),
      compliance: 'LGPD',
    })
  }

  auditDataModification(_context: {
    _userId: string
    patientId?: string
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
    dataType: string
    recordId?: string
    changes?: string[]
  }): void {
    if (!this.config.auditTrail) return

    this.formatLog('info', 'LGPD_DATA_MODIFICATION_AUDIT', {
      ...context,
      auditType: 'data_modification',
      timestamp: new Date().toISOString(),
      compliance: 'LGPD',
    })
  }

  auditConsentChange(_context: {
    patientId: string
    consentType: string
    previousValue: boolean
    newValue: boolean
    changedBy: string
  }): void {
    if (!this.config.auditTrail) return

    this.formatLog('info', 'LGPD_CONSENT_CHANGE_AUDIT', {
      ...context,
      auditType: 'consent_change',
      timestamp: new Date().toISOString(),
      compliance: 'LGPD',
    })
  }

  private enrichContext(_context?: LogContext): LogContext {
    return {
      ..._context,
      timestamp: new Date().toISOString(),
      correlationId: _context?.correlationId || this.generateCorrelationId(),
    }
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Factory function for creating logger instances
export function createLogger(config?: LoggerConfig): SecureLogger {
  return new SecureLogger(config)
}

// Default logger instance
export const logger = createLogger({
  _service: 'neonpro-api',
  maskSensitiveData: true,
  lgpdCompliant: true,
  auditTrail: true,
})

// Export with alternative name for compatibility
export const secureLogger = logger

// Export types for TypeScript support
export type { LogContext, LoggerConfig }
export { SecureLogger }
