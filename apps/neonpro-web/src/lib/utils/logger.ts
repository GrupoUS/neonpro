// lib/utils/logger.ts
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class Logger {
  static log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
    };

    console.log(JSON.stringify(entry));
  }

  static error(message: string, metadata?: Record<string, any>) {
    Logger.log(LogLevel.ERROR, message, metadata);
  }

  static warn(message: string, metadata?: Record<string, any>) {
    Logger.log(LogLevel.WARN, message, metadata);
  }

  static info(message: string, metadata?: Record<string, any>) {
    Logger.log(LogLevel.INFO, message, metadata);
  }

  static debug(message: string, metadata?: Record<string, any>) {
    Logger.log(LogLevel.DEBUG, message, metadata);
  }
}

// Export a default instance that matches the expected interface
export const logger = {
  error: (message: string, metadata?: Record<string, any>) => Logger.error(message, metadata),
  warn: (message: string, metadata?: Record<string, any>) => Logger.warn(message, metadata),
  info: (message: string, metadata?: Record<string, any>) => Logger.info(message, metadata),
  debug: (message: string, metadata?: Record<string, any>) => Logger.debug(message, metadata),
};
