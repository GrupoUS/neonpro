// lib/utils/logger.ts
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
};

export class Logger {
  static log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const _entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
    };
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
