// Simple structured logging service for testing
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFile: boolean;
  enableAudit: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  _context?: any;
  correlationId?: string;
}

export class SimpleStructuredLogger {
  private config: LoggerConfig;
  private correlationId: string;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.correlationId = this.generateCorrelationId();
  }

  private generateCorrelationId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public getCorrelationId(): string {
    return this.correlationId;
  }

  public setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  private createLogEntry(level: string, message: string, data?: any, _context?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
      correlationId: this.correlationId
    };
  }

  public debug(message: string, data?: any, _context?: any): void {
    if (this.config.enableConsole) {
      const entry = this.createLogEntry('debug', message, data, _context);
      console.log('[DEBUG]', entry);
    }
  }

  public info(message: string, data?: any, _context?: any): void {
    if (this.config.enableConsole) {
      const entry = this.createLogEntry('info', message, data, _context);
      console.log('[INFO]', entry);
    }
  }

  public warn(message: string, data?: any, _context?: any): void {
    if (this.config.enableConsole) {
      const entry = this.createLogEntry('warn', message, data, _context);
      console.warn('[WARN]', entry);
    }
  }

  public error(message: string, data?: any, _context?: any): void {
    if (this.config.enableConsole) {
      const entry = this.createLogEntry('error', message, data, _context);
      console.error('[ERROR]', entry);
    }
  }

  public async shutdown(): Promise<void> {
    // Cleanup logic if needed
  }
}

// Default logger instance
export const _defaultLogger = new SimpleStructuredLogger({
  level: 'info',
  enableConsole: true,
  enableFile: false,
  enableAudit: false
});

export default SimpleStructuredLogger;