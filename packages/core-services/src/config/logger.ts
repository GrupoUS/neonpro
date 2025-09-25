// T042: Enhanced logging and monitoring setup
import { HealthcareSecurityLogger } from '@neonpro/security'

// Global healthcare security logger instance
let healthcareLogger: HealthcareSecurityLogger | null = null

export function getHealthcareLogger(): HealthcareSecurityLogger {
  if (!healthcareLogger) {
    healthcareLogger = new HealthcareSecurityLogger({
      enableConsoleLogging: true,
      enableDatabaseLogging: false,
      enableFileLogging: false,
      enableAuditLogging: true,
      logLevel: 'info',
      sanitizeSensitiveData: true,
      complianceLevel: 'standard',
    })
  }
  return healthcareLogger
}

export interface LogLevel {
  DEBUG: 0
  INFO: 1
  WARN: 2
  ERROR: 3
  FATAL: 4
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
} as const

export type LogLevelName = keyof LogLevel

export interface LogEntry {
  timestamp: string
  level: LogLevelName
  message: string
  _context?: Record<string, any>
  sessionId?: string
  _userId?: string
  provider?: string
  model?: string
  requestId?: string
  error?: Error
  duration?: number
  tokens?: {
    input: number
    output: number
    total: number
  }
}

export interface LoggerConfig {
  level: LogLevelName
  enableConsole: boolean
  enableFile: boolean
  enableAudit: boolean
  filePath?: string
  maxFileSize?: number
  maxFiles?: number
  format: 'json' | 'text'
  includeStack: boolean
  redactPII: boolean
}

export class Logger {
  private config: LoggerConfig
  private logBatch: LogEntry[] = []
  private batchTimeout: NodeJS.Timeout | null = null
  private isProcessing: boolean = false
  private lgpdUtils: any

  constructor(config: LoggerConfig) {
    this.config = config
    this.initializeLGPDUtils()
  }

  private async initializeLGPDUtils(): Promise<void> {
    try {
      // Import LGPD utilities dynamically to avoid circular dependencies
      const lgpdModule = await import('@neonpro/utils')
      this.lgpdUtils = lgpdModule
    } catch (error) {
      // Fallback to basic PII redaction if LGPD utils are not available
      const logger = getHealthcareLogger()
      logger.warn('LGPD utilities not available, using basic PII redaction', { error: error?.message })
    }
  }

  private shouldLog(level: LogLevelName): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify({
        ...entry,
        error: entry.error
          ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: this.config.includeStack ? entry.error.stack : undefined,
          }
          : undefined,
      })
    }

    // Text format optimized for performance
    const parts = [entry.timestamp, `[${entry.level}]`, entry.message]

    if (entry._context && Object.keys(entry._context).length > 0) {
      parts.push(`Context: ${JSON.stringify(entry._context)}`)
    }

    if (entry.error) {
      parts.push(`Error: ${entry.error.message}`)
      if (this.config.includeStack && entry.error.stack) {
        parts.push(`Stack: ${entry.error.stack}`)
      }
    }

    return parts.join(' ')
  }

  private async writeToLog(entry: LogEntry): Promise<void> {
    const formattedLog = this.formatLogEntry(entry)

    if (this.config.enableConsole) {
      const logger = getHealthcareLogger()
      logger.info('Console log output', { formattedLog, level: entry.level })
    }

    // Enhanced file logging with error handling
    if (this.config.enableFile && this.config.filePath) {
      try {
        const fs = await import('fs')
        const path = await import('path')

        // Ensure log directory exists
        const logDir = path.dirname(this.config.filePath)
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true })
        }

        await fs.promises.appendFile(this.config.filePath, formattedLog + '\n')
      } catch (error) {
        const logger = getHealthcareLogger()
        logger.error('Failed to write to log file', { error: error?.message, filePath: this.config.filePath })
      }
    }
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.logBatch.length === 0) return

    this.isProcessing = true
    const batch = [...this.logBatch]
    this.logBatch = []

    try {
      await Promise.all(batch.map(entry => this.writeToLog(entry)))
    } catch (error) {
      const logger = getHealthcareLogger()
      logger.error('Failed to process log batch', { error: error?.message, batchSize: batch.length })
      // Re-add failed entries to the batch for retry
      this.logBatch.unshift(...batch)
    } finally {
      this.isProcessing = false
    }
  }

  private scheduleBatchProcessing(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch()
    }, 1000) // Process batch every second
  }

  private redactPII(data: any): any {
    if (!this.config.redactPII) return data

    // Use LGPD utilities if available
    if (this.lgpdUtils && this.lgpdUtils.redactPII) {
      return this.lgpdUtils.redactPII(data)
    }

    // Fallback to basic PII redaction
    return this.basicPIIRedaction(data)
  }

  private basicPIIRedaction(obj: any): any {
    const piiFields = [
      'email',
      'phone',
      'cpf',
      'cnpj',
      'rg',
      'ssn',
      'credit_card',
      'password',
      'token',
      'secret',
      'key',
    ]

    if (typeof obj === 'string') {
      // Enhanced Brazilian PII patterns
      return obj
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
        .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF_REDACTED]')
        .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ_REDACTED]')
        .replace(/\b\(\d{2}\)\s*\d{4,5}-\d{4}\b/g, '[PHONE_REDACTED]')
    }

    if (typeof obj === 'object' && obj !== null) {
      const redacted = Array.isArray(obj) ? [...obj] : { ...obj }

      for (const key of Object.keys(redacted)) {
        if (piiFields.some((field: string) => key.toLowerCase().includes(field))) {
          redacted[key] = '[REDACTED]'
        } else if (typeof redacted[key] === 'object') {
          redacted[key] = this.basicPIIRedaction(redacted[key])
        }
      }
      return redacted
    }

    return obj
  }

  private createLogEntry(
    level: LogLevelName,
    message: string,
    _context?: Record<string, any>,
    error?: Error,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      _context: _context ? this.redactPII(_context) : undefined,
      sessionId: _context?.sessionId,
      _userId: _context?._userId,
      provider: _context?.provider,
      model: _context?.model,
      requestId: _context?.requestId,
      error,
      duration: _context?.duration,
      tokens: _context?.tokens,
    }
  }

  private async logEntry(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) return

    // Use batching for better performance
    if (this.config.enableFile) {
      this.logBatch.push(entry)
      this.scheduleBatchProcessing()
    } else {
      // Direct write for console-only logging
      await this.writeToLog(entry)
    }
  }

  // Standard logging methods with async support
  async debug(message: string, _context?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry('DEBUG', message, _context)
    await this.logEntry(entry)
  }

  async info(message: string, context?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry('INFO', message, context)
    await this.logEntry(entry)
  }

  async warn(message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    const entry = this.createLogEntry('WARN', message, context, error)
    await this.logEntry(entry)
  }

  async error(message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    const entry = this.createLogEntry('ERROR', message, context, error)
    await this.logEntry(entry)
  }

  async fatal(message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    const entry = this.createLogEntry('FATAL', message, context, error)
    await this.logEntry(entry)
  }

  // Legacy synchronous methods for backward compatibility (deprecated)
  debugSync(message: string, _context?: Record<string, any>): void {
    this.debug(message, _context).catch(error => {
      console.error('Failed to log debug message:', error)
    })
  }

  infoSync(message: string, context?: Record<string, any>): void {
    this.info(message, context).catch(error => {
      console.error('Failed to log info message:', error)
    })
  }

  warnSync(message: string, context?: Record<string, any>, error?: Error): void {
    this.warn(message, context, error).catch(err => {
      console.error('Failed to log warn message:', err)
    })
  }

  errorSync(message: string, context?: Record<string, any>, error?: Error): void {
    this.error(message, context, error).catch(err => {
      console.error('Failed to log error message:', err)
    })
  }

  fatalSync(message: string, context?: Record<string, any>, error?: Error): void {
    this.fatal(message, context, error).catch(err => {
      console.error('Failed to log fatal message:', err)
    })
  }

  // Specialized healthcare logging methods
  async logHealthcareEvent(context: {
    event: string
    patientId?: string
    professionalId?: string
    procedure?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details: Record<string, any>
  }): Promise<void> {
    const level = context.severity === 'critical'
      ? 'FATAL'
      : context.severity === 'high'
      ? 'ERROR'
      : 'WARN'

    const entry = this.createLogEntry(level, `Healthcare event: ${context.event}`, {
      ...context.details,
      patientId: context.patientId ? this.redactPII(context.patientId) : undefined,
      professionalId: context.professionalId,
      procedure: context.procedure,
      eventType: context.event,
      severity: context.severity,
    })

    await this.logEntry(entry)
  }

  async logAuditTrail(context: {
    action: string
    resource: string
    userId?: string
    resourceId?: string
    outcome: 'success' | 'failure' | 'denied'
    metadata?: Record<string, any>
  }): Promise<void> {
    const entry = this.createLogEntry('INFO', `Audit: ${context.action}`, {
      auditAction: context.action,
      auditResource: context.resource,
      userId: context.userId,
      resourceId: context.resourceId,
      auditOutcome: context.outcome,
      ...context.metadata,
    })

    await this.logEntry(entry)
  }

  async logPerformance(context: {
    operation: string
    duration: number
    service: string
    success: boolean
    metadata?: Record<string, any>
  }): Promise<void> {
    const level = context.success ? 'INFO' : 'WARN'

    const entry = this.createLogEntry(level, `Performance: ${context.operation}`, {
      operation: context.operation,
      durationMs: context.duration,
      service: context.service,
      success: context.success,
      ...context.metadata,
    })

    await this.logEntry(entry)
  }

  // Enhanced AI operation logging
  async logAIRequest(context: {
    sessionId: string
    _userId: string
    provider: string
    model: string
    requestId: string
    prompt?: string
  }): Promise<void> {
    const entry = this.createLogEntry('INFO', 'AI request initiated', {
      sessionId: context.sessionId,
      _userId: context._userId,
      provider: context.provider,
      model: context.model,
      requestId: context.requestId,
      promptLength: context.prompt?.length,
    })

    await this.logEntry(entry)
  }

  async logAIResponse(context: {
    sessionId: string
    _userId: string
    provider: string
    model: string
    requestId: string
    duration: number
    tokens?: { input: number; output: number; total: number }
    success: boolean
    error?: Error
  }): Promise<void> {
    const level = context.success ? 'INFO' : 'ERROR'
    const message = context.success ? 'AI request completed' : 'AI request failed'

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      _context: {
        sessionId: context.sessionId,
        _userId: context._userId,
        provider: context.provider,
        model: context.model,
        requestId: context.requestId,
        success: context.success,
      },
      duration: context.duration,
      tokens: context.tokens,
      error: context.error,
    }

    await this.logEntry(entry)
  }

  async logRateLimit(_context: {
    provider: string
    limit: string
    current: number
    max: number
  }): Promise<void> {
    const entry = this.createLogEntry('WARN', 'Rate limit approached', _context)
    await this.logEntry(entry)
  }

  async logSecurityEvent(context: {
    event: string
    sessionId?: string
    _userId?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details: Record<string, any>
  }): Promise<void> {
    const level = context.severity === 'critical'
      ? 'FATAL'
      : context.severity === 'high'
      ? 'ERROR'
      : 'WARN'

    const entry = this.createLogEntry(level, `Security event: ${context.event}`, {
      securityEvent: context.event,
      sessionId: context.sessionId,
      _userId: context._userId,
      securitySeverity: context.severity,
      details: this.redactPII(context.details),
    })

    await this.logEntry(entry)
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    // Process remaining logs
    await this.processBatch()
  }
}

// Default logger configuration
export function createLoggerConfig(): LoggerConfig {
  return {
    level: (process.env.LOG_LEVEL as LogLevelName) || 'INFO',
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    enableAudit: process.env.LOG_ENABLE_AUDIT !== 'false',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
    maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760'), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
    format: (process.env.LOG_FORMAT as 'json' | 'text') || 'json',
    includeStack: process.env.LOG_INCLUDE_STACK !== 'false',
    redactPII: process.env.LOG_REDACT_PII !== 'false',
  }
}

// Global logger instance
let loggerInstance: Logger | null = null

export function createLogger(config?: LoggerConfig): Logger {
  const loggerConfig = config || createLoggerConfig()
  loggerInstance = new Logger(loggerConfig)
  return loggerInstance
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = createLogger()
  }
  return loggerInstance
}
