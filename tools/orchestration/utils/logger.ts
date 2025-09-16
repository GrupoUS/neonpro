/**
 * Simple logging utility for TDD Orchestration Framework
 * Provides structured logging with different levels for development and production
 */

export interface LogContext {
  [key: string]: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export class Logger {
  private context: string;
  private logLevel: LogLevel;

  constructor(context: string = 'TDDOrchestrator', logLevel: LogLevel = 'info') {
    this.context = context;
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'success'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = this.getLevelPrefix(level);
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${timestamp} ${prefix} [${this.context}] ${message}${contextStr}`;
  }

  private getLevelPrefix(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🐛';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | LogContext): void {
    if (this.shouldLog('error')) {
      const context = error instanceof Error 
        ? { error: error.message, stack: error.stack }
        : error;
      console.error(this.formatMessage('error', message, context));
    }
  }

  success(message: string, context?: LogContext): void {
    if (this.shouldLog('success')) {
      console.log(this.formatMessage('success', message, context));
    }
  }

  createChild(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`, this.logLevel);
  }
}

// Default logger instance
export const logger = new Logger('TDDOrchestrator', 
  process.env.NODE_ENV === 'development' ? 'debug' : 'info'
);

// Create specialized loggers for different components
export const createLogger = (context: string, logLevel?: LogLevel): Logger => {
  return new Logger(context, logLevel);
};