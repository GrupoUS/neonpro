/**
 * 🔒 SECURE LOGGER - LGPD Compliant Logging System
 *
 * Features:
 * - Automatic sensitive data masking
 * - LGPD compliance built-in
 * - Edge runtime compatible
 * - Environment-based log levels
 * - Audit trail support
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
  level?: string
  maskSensitiveData?: boolean
  lgpdCompliant?: boolean
  auditTrail?: boolean
  _service?: string
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
}

class SecureLogger {
  private config: Required<LoggerConfig>

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level
        || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
      maskSensitiveData: config.maskSensitiveData ?? true,
      lgpdCompliant: config.lgpdCompliant ?? true,
      auditTrail: config.auditTrail ?? true,
      _service: config._service || 'neonpro-api',
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
        console.debug(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
      default:
        console.log(formattedMessage)
    }
  }

  private maskSensitiveData(text: string): string {
    if (!this.config.maskSensitiveData || typeof text !== 'string') {
      return text
    }

    let maskedText = text

    // Apply pattern-based masking
    Object.entries(SENSITIVE_PATTERNS).forEach(([, pattern]) => {
      maskedText = maskedText.replace(pattern, (match) => {
        const visibleChars = Math.min(3, Math.floor(match.length * 0.3))
        return (
          match.substring(0, visibleChars)
          + '*'.repeat(match.length - visibleChars)
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
      return obj.map((item) => this.maskObjectData(item))
    }

    const masked: any = {}

    Object.entries(obj).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase()

      if (
        SENSITIVE_KEYS.some((sensitiveKey) => lowerKey.includes(sensitiveKey))
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
