/**
 * NeonPro Audit System - Constitutional Logger
 *
 * Production-grade logging system with constitutional compliance tracking.
 * Supports structured logging, rotation, and healthcare audit trails.
 */

import * as fs from 'fs'
import * as path from 'path'
import { EventEmitter } from 'events'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  component: string
  correlationId?: string
  metadata?: Record<string, any>
  constitutional?: {
    compliance: boolean
    requirement?: string
    impact?: string
  }
}

export interface LoggerConfig {
  level: LogLevel
  format: 'json' | 'human'
  outputs: ('console' | 'file')[]
  rotation?: {
    enabled: boolean
    maxFiles?: number
    maxSize?: string
  }
  paths?: {
    audit?: string
    performance?: string
    error?: string
  }
}

export class Logger extends EventEmitter {
  private static instance: Logger
  private config: LoggerConfig
  private fileStreams: Map<string, fs.WriteStream> = new Map()

  private constructor(config: LoggerConfig) {
    super()
    this.config = config
    this.initializeStreams()
  }

  /**
   * Get logger instance (singleton)
   */
  static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance && config) {
      Logger.instance = new Logger(config)
    }
    return Logger.instance
  }

  /**
   * Initialize file streams
   */
  private initializeStreams(): void {
    if (this.config.outputs.includes('file') && this.config.paths) {
      Object.entries(this.config.paths).forEach(([type, logPath]) => {
        if (logPath) {
          const dir = path.dirname(logPath)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }
          
          const stream = fs.createWriteStream(logPath, { flags: 'a' })
          this.fileStreams.set(type, stream)
        }
      })
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, component: string, metadata?: Record<string, any>): void {
    this.log('debug', message, component, metadata)
  }

  /**
   * Log info message
   */
  info(message: string, component: string, metadata?: Record<string, any>): void {
    this.log('info', message, component, metadata)
  }

  /**
   * Log warning message
   */
  warn(message: string, component: string, metadata?: Record<string, any>): void {
    this.log('warn', message, component, metadata)
  }

  /**
   * Log error message
   */
  error(message: string, component: string, metadata?: Record<string, any>): void {
    this.log('error', message, component, metadata)
  }

  /**
   * Log critical message
   */
  critical(message: string, component: string, metadata?: Record<string, any>): void {
    this.log('critical', message, component, metadata)
  }

  /**
   * Log constitutional compliance event
   */
  constitutional(
    level: LogLevel,
    message: string,
    component: string,
    compliance: boolean,
    requirement?: string,
    impact?: string,
    metadata?: Record<string, any>
  ): void {
    this.log(level, message, component, {
      ...metadata,
      constitutional: {
        compliance,
        requirement,
        impact
      }
    })
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, component: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component,
      correlationId: this.generateCorrelationId(),
      metadata
    }

    // Extract constitutional data if present
    if (metadata?.constitutional) {
      entry.constitutional = metadata.constitutional
      delete metadata.constitutional
    }

    this.writeLog(entry)
    this.emit('log:created', entry)
  }

  /**
   * Check if message should be logged based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4
    }

    return levels[level] >= levels[this.config.level]
  }

  /**
   * Write log entry to configured outputs
   */
  private writeLog(entry: LogEntry): void {
    const formattedMessage = this.formatMessage(entry)

    // Console output
    if (this.config.outputs.includes('console')) {
      const consoleMethod = this.getConsoleMethod(entry.level)
      consoleMethod(formattedMessage)
    }

    // File output
    if (this.config.outputs.includes('file')) {
      this.writeToFile(entry, formattedMessage)
    }
  }

  /**
   * Format log message based on configuration
   */
  private formatMessage(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry)
    }

    // Human-readable format
    const timestamp = entry.timestamp
    const level = entry.level.toUpperCase().padEnd(8)
    const component = entry.component.padEnd(20)
    const constitutional = entry.constitutional 
      ? ` [${entry.constitutional.compliance ? '✅' : '❌'} CONST]`
      : ''

    return `${timestamp} ${level} ${component} ${entry.message}${constitutional}`
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): Function {
    switch (level) {
      case 'debug':
        return console.debug
      case 'info':
        return console.info
      case 'warn':
        return console.warn
      case 'error':
      case 'critical':
        return console.error
      default:
        return console.log
    }
  }

  /**
   * Write to file streams
   */
  private writeToFile(entry: LogEntry, formattedMessage: string): void {
    // Determine which file to write to
    let streamType = 'audit'
    if (entry.level === 'error' || entry.level === 'critical') {
      streamType = 'error'
    } else if (entry.component.includes('performance') || entry.metadata?.benchmark) {
      streamType = 'performance'
    }

    const stream = this.fileStreams.get(streamType) || this.fileStreams.get('audit')
    if (stream) {
      stream.write(formattedMessage + '\n')
    }
  }

  /**
   * Generate correlation ID for request tracking
   */
  private generateCorrelationId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Flush all streams
   */
  flush(): Promise<void> {
    return new Promise((resolve) => {
      const streams = Array.from(this.fileStreams.values())
      if (streams.length === 0) {
        resolve()
        return
      }

      let pending = streams.length
      streams.forEach(stream => {
        stream.end(() => {
          pending--
          if (pending === 0) {
            resolve()
          }
        })
      })
    })
  }

  /**
   * Close logger and cleanup resources
   */
  async close(): Promise<void> {
    await this.flush()
    this.fileStreams.clear()
    this.removeAllListeners()
  }
}

// Export singleton instance creation helper
export function createLogger(config: LoggerConfig): Logger {
  return Logger.getInstance(config)
}

export default Logger