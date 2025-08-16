// Simple logger utility for the application

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
};

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: Record<string, any>): void {
    const _formatted = this.formatMessage('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    const _formatted = this.formatMessage('warn', message, context);
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, any>
  ): void {
    const errorContext =
      error instanceof Error
        ? { ...context, error: error.message, stack: error.stack }
        : { ...context, error };

    const _formatted = this.formatMessage('error', message, errorContext);
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      const _formatted = this.formatMessage('debug', message, context);
    }
  }

  // Create a child logger with additional context
  child(defaultContext: Record<string, any>) {
    return {
      info: (message: string, context?: Record<string, any>) =>
        this.info(message, { ...defaultContext, ...context }),
      warn: (message: string, context?: Record<string, any>) =>
        this.warn(message, { ...defaultContext, ...context }),
      error: (
        message: string,
        error?: Error | unknown,
        context?: Record<string, any>
      ) => this.error(message, error, { ...defaultContext, ...context }),
      debug: (message: string, context?: Record<string, any>) =>
        this.debug(message, { ...defaultContext, ...context }),
    };
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export the Logger class for custom instances if needed
export { Logger };

// Export types
export type { LogLevel, LogEntry };
