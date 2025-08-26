/**
 * Centralized logging utility for NeonPro API
 * Replaces console.* calls with structured logging
 */

export interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  [key: string]: unknown;
}

export interface Logger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (
    message: string,
    error?: Error | unknown,
    context?: LogContext,
  ) => void;
  debug: (message: string, context?: LogContext) => void;
}

class NeonProLogger implements Logger {
  private formatMessage(
    level: string,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage("info", message, context);
    if (process.env.NODE_ENV === "production") {
      // In production, send to logging service (Sentry, DataDog, etc.)
      // For now, use console.info as fallback
      // biome-ignore lint/suspicious/noConsole: Centralized logging utility
      console.info(formatted);
    } else {
      // biome-ignore lint/suspicious/noConsole: Development logging
      console.info(formatted);
    }
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage("warn", message, context);
    if (process.env.NODE_ENV === "production") {
      // In production, send to logging service
      // biome-ignore lint/suspicious/noConsole: Centralized logging utility
      console.warn(formatted);
    } else {
      // biome-ignore lint/suspicious/noConsole: Development logging
      console.warn(formatted);
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext =
      error instanceof Error
        ? { ...context, error: error.message, stack: error.stack }
        : { ...context, error: String(error) };

    const formatted = this.formatMessage("error", message, errorContext);

    if (process.env.NODE_ENV === "production") {
      // In production, send to error tracking service
      // biome-ignore lint/suspicious/noConsole: Centralized logging utility
      console.error(formatted);
    } else {
      // biome-ignore lint/suspicious/noConsole: Development logging
      console.error(formatted);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      const formatted = this.formatMessage("debug", message, context);
      // biome-ignore lint/suspicious/noConsole: Development debugging
      console.debug(formatted);
    }
  }
}

// Export singleton logger instance
export const logger: Logger = new NeonProLogger();

// Legacy compatibility - can be removed once all console.* are replaced
export const createContextLogger = (baseContext: LogContext) => {
  return {
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      logger.warn(message, { ...baseContext, ...context }),
    error: (message: string, error?: Error | unknown, context?: LogContext) =>
      logger.error(message, error, { ...baseContext, ...context }),
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...baseContext, ...context }),
  };
};
