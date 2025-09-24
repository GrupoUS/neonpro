/**
 * Logger utility for orchestration tools
 * Provides typed logging functionality with different log levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface Logger {
  log(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  constitutional(level: LogLevel, message: string, metadata?: Record<string, any>): void;
}

export function createLogger(name: string, level: LogLevel = LogLevel.INFO): Logger {
  const logger: Logger = {
    log(message: string, ...args: any[]) {
      if (level <= LogLevel.DEBUG) {
        console.log(`[${name}] ${message}`, ...args);
      }
    },

    info(message: string, ...args: any[]) {
      if (level <= LogLevel.INFO) {
        console.info(`[${name}] ${message}`, ...args);
      }
    },

    warn(message: string, ...args: any[]) {
      if (level <= LogLevel.WARN) {
        console.warn(`[${name}] ${message}`, ...args);
      }
    },

    error(message: string, ...args: any[]) {
      if (level <= LogLevel.ERROR) {
        console.error(`[${name}] ${message}`, ...args);
      }
    },

    constitutional(level: LogLevel, message: string, metadata?: Record<string, any>): void {
      const logMessage = `[${name}] [CONSTITUTIONAL] ${message}`;
      if (metadata) {
        logger.log(logMessage, metadata);
      } else {
        logger.log(logMessage);
      }
    },
  };

  return logger;
}