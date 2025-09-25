// Simple structured logging service for testing
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  enableConsole: boolean
  enableFile: boolean
  enableAudit: boolean
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: any
  _context?: any
  correlationId?: string
}

export class SimpleStructuredLogger {
  private config: LoggerConfig
  private correlationId: string
  private logger: any // Fallback logger
  private fallbackLogger: any // Healthcare-compliant fallback

  constructor(config: LoggerConfig) {
    this.config = config
    this.correlationId = this.generateCorrelationId()
    // Initialize fallback logger
    this.logger = console
    // Initialize healthcare-compliant fallback logger
    this.initializeFallbackLogger()
  }

  private initializeFallbackLogger(): void {
    // Try to use healthcare logger, fallback to console
    try {
      // Simple fallback implementation with structured output
      this.fallbackLogger = {
        log: (level: string, entry: any) => {
          // Structured output to console as fallback
          process.stdout.write(JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            fallback: true,
            ...entry
          }) + '\n')
        },
        warn: (level: string, entry: any) => {
          process.stderr.write(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'warn',
            fallback: true,
            ...entry
          }) + '\n')
        },
        error: (level: string, entry: any) => {
          process.stderr.write(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'error',
            fallback: true,
            ...entry
          }) + '\n')
        }
      }
    } catch {
      this.fallbackLogger = this.logger
    }
  }

  private generateCorrelationId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  public getCorrelationId(): string {
    return this.correlationId
  }

  public setCorrelationId(id: string): void {
    this.correlationId = id
  }

  private createLogEntry(
    level: string,
    message: string,
    data?: any,
    _context?: any,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      // _context: _context, // Temporarily disabled - field not in LogEntry interface
      correlationId: this.correlationId,
    }
  }

  public debug(message: string, data?: any, _context?: any): void {
    if (this.config.enableConsole) {
      const entry = this.createLogEntry('debug', message, data, _context)
      // Use structured fallback logger instead of console.log
      this.fallbackLogger.log('debug', entry)
    }
  }

  public info(message: string, data?: any, _context?: any): void {
    if (this.config.enableConsole) {
      const entry = this.createLogEntry('info', message, data, _context)
      // Use structured fallback logger instead of console.log
      this.fallbackLogger.log('info', entry)
    }
  }

  public warn(message: string, data?: any, _context?: any): void {
    if (this.config.enableConsole) {
      const entry = this.createLogEntry('warn', message, data, _context)
      // Use structured fallback logger instead of console.warn
      this.fallbackLogger.warn('warn', entry)
    }
  }

  public error(message: string, data?: any, _context?: any): void {
    if (this.config.enableConsole) {
      const entry = this.createLogEntry('error', message, data, _context)
      // Use structured fallback logger instead of console.error
      this.fallbackLogger.error('error', entry)
    }
  }

  public async shutdown(): Promise<void> {
    // Cleanup logic if needed
  }
}

// Default logger instance
export const defaultLogger = new SimpleStructuredLogger({
  level: 'info',
  enableConsole: true,
  enableFile: false,
  enableAudit: false,
})

export default SimpleStructuredLogger
