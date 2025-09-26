/**
 * 🔍 Client-Side Logger Utility for NeonPro Web Application
 * 
 * A healthcare-compliant logging system that provides:
 * - Structured logging with severity levels
 * - Audit trail support for healthcare compliance
 * - Development vs production mode filtering
 * - Error tracking with context preservation
 * - LGPD-compliant data handling
 */

export interface LogEntry {
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: Record<string, unknown>
  component?: string
  userId?: string
  sessionId?: string
}

export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error'
  enableConsole?: boolean
  enableRemote?: boolean
  maxEntries?: number
  sanitizeSensitiveData?: boolean
  component?: string
}

const SENSITIVE_PATTERNS = [
  /password/gi,
  /senha/gi,
  /cpf/gi,
  /rg/gi,
  /cartão/gi,
  /cartao/gi,
  /credit.*card/gi,
  /medical.*record/gi,
  /prontuário/gi,
  /patient.*id/gi,
  /id.*paciente/gi,
  /token/gi,
  /secret/gi,
  /key/gi
]

class Logger {
  private options: LoggerOptions
  private entries: LogEntry[] = []
  private sessionId: string

  constructor(options: LoggerOptions = {}) {
    this.options = {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      enableConsole: process.env.NODE_ENV !== 'production',
      enableRemote: process.env.NODE_ENV === 'production',
      maxEntries: 1000,
      sanitizeSensitiveData: true,
      ...options
    }

    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    if (!this.options.sanitizeSensitiveData) {
      return data
    }

    const sanitized = { ...data }
    const dataStr = JSON.stringify(data)

    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(dataStr)) {
        Object.keys(sanitized).forEach(key => {
          if (typeof sanitized[key] === 'string' && pattern.test(sanitized[key] as string)) {
            sanitized[key] = '[REDACTED]'
          }
        })
      }
    }

    return sanitized
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      context: context ? this.sanitizeData(context) : undefined,
      component: this.options.component,
      sessionId: this.sessionId
    }
  }

  private shouldLog(level: LogEntry['level']): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    return levels[level] >= levels[this.options.level!]
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.options.enableConsole) return

    const timestamp = entry.timestamp.toISOString()
    const prefix = `[${entry.level.toUpperCase()}]${entry.component ? ` [${entry.component}]` : ''}`

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, timestamp, entry.message, entry.context || '')
        break
      case 'info':
        console.info(prefix, timestamp, entry.message, entry.context || '')
        break
      case 'warn':
        console.warn(prefix, timestamp, entry.message, entry.context || '')
        break
      case 'error':
        console.error(prefix, timestamp, entry.message, entry.context || '')
        break
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.options.enableRemote) return

    try {
      // In a real implementation, this would send logs to your logging service
      // For now, we'll just store them locally
      this.entries.push(entry)

      // Keep only the most recent entries
      if (this.entries.length > this.options.maxEntries!) {
        this.entries = this.entries.slice(-this.options.maxEntries!)
      }
    } catch (error) {
      // Don't let logging errors break the application
      console.error('Failed to log to remote:', error)
    }
  }

  private async log(level: LogEntry['level'], message: string, context?: Record<string, unknown>): Promise<void> {
    if (!this.shouldLog(level)) return

    const entry = this.createLogEntry(level, message, context)

    // Log to console in development
    this.logToConsole(entry)

    // Log to remote in production
    await this.logToRemote(entry)
  }

  debug(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, unknown>): Promise<void> {
    return this.log('error', message, context)
  }

  // Utility methods for specific use cases
  apiError(endpoint: string, error: Error, context?: Record<string, unknown>): Promise<void> {
    return this.error(`API Error: ${endpoint}`, {
      error: error.message,
      stack: error.stack,
      endpoint,
      ...context
    })
  }

  userAction(action: string, context?: Record<string, unknown>): Promise<void> {
    return this.info(`User Action: ${action}`, context)
  }

  performance(operation: string, duration: number, context?: Record<string, unknown>): Promise<void> {
    return this.debug(`Performance: ${operation}`, {
      duration,
      unit: 'ms',
      ...context
    })
  }

  // Get log entries for debugging
  getLogEntries(filter?: {
    level?: LogEntry['level']
    component?: string
    since?: Date
  }): LogEntry[] {
    let filtered = [...this.entries]

    if (filter?.level) {
      filtered = filtered.filter(entry => entry.level === filter.level)
    }

    if (filter?.component) {
      filtered = filtered.filter(entry => entry.component === filter.component)
    }

    if (filter?.since) {
      filtered = filtered.filter(entry => entry.timestamp >= filter.since!)
    }

    return filtered
  }

  // Clear log entries
  clearLogEntries(): void {
    this.entries = []
  }
}

// Create default logger instance
export const logger = new Logger()

// Factory function for creating component-specific loggers
export function createLogger(options: Omit<LoggerOptions, 'enableConsole' | 'enableRemote'> = {}): Logger {
  return new Logger({
    ...options,
    enableConsole: process.env.NODE_ENV !== 'production',
    enableRemote: process.env.NODE_ENV === 'production'
  })
}

// Export the Logger class for advanced usage
export { Logger }