/**
 * @deprecated Use @neonpro/tools-shared createLogger instead
 * Legacy logger wrapper for backward compatibility
 */

import { createLogger as createSharedLogger, LogLevel } from '@neonpro/tools-shared';

// Re-export from shared utilities for backward compatibility
export { LogLevel } from '@neonpro/tools-shared';
export type { LogContext } from '@neonpro/tools-shared';

// Legacy Logger class - use UnifiedLogger from @neonpro/tools-shared instead
export class Logger {
  private sharedLogger: ReturnType<typeof createSharedLogger>;

  constructor(context: string = 'TDDOrchestrator', logLevel: LogLevel = LogLevel.INFO) {
    this.sharedLogger = createSharedLogger(context, {
      level: logLevel,
      format: 'pretty',
      enableConstitutional: true,
      enablePerformance: true,
    });
  }

  debug(message: string, context?: any): void {
    this.sharedLogger.debug(message, context);
  }

  info(message: string, context?: any): void {
    this.sharedLogger.info(message, context);
  }

  warn(message: string, context?: any): void {
    this.sharedLogger.warn(message, context);
  }

  error(message: string, error?: Error | any): void {
    this.sharedLogger.error(message, error);
  }

  success(message: string, context?: any): void {
    this.sharedLogger.success(message, context);
  }

  createChild(childContext: string): Logger {
    return new Logger(`${this.sharedLogger.context}:${childContext}`, this.sharedLogger.level);
  }
}

// Default logger instance - migrated to shared logger
export const logger = createSharedLogger('TDDOrchestrator', {
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  format: 'pretty',
  enableConstitutional: true,
});

// Create specialized loggers using shared system
export const createLogger = (context: string, logLevel: LogLevel = LogLevel.INFO): Logger => {
  return new Logger(context, logLevel);
};