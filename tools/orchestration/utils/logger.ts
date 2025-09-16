/**
 * Local Logger Utility for TDD Orchestration
 * Simplified logger without external dependencies
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerOptions {
  level?: LogLevel;
  format?: 'simple' | 'pretty' | 'json';
  enableConsole?: boolean;
  enableConstitutional?: boolean;
  enablePerformance?: boolean;
}

export interface ConstitutionalLogData {
  compliance: boolean;
  requirement: string;
  standard: string;
}

export class Logger {
  private level: LogLevel;
  private format: 'simple' | 'pretty' | 'json';
  private enableConsole: boolean;
  private enableConstitutional: boolean;
  private enablePerformance: boolean;
  private context: string;

  constructor(context: string = 'TDDOrchestrator', logLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.level = logLevel;
    this.format = 'pretty';
    this.enableConsole = true;
    this.enableConstitutional = true;
    this.enablePerformance = true;
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }

  success(message: string, data?: any): void {
    this.log(LogLevel.INFO, `✅ ${message}`, data);
  }

  constitutional(level: LogLevel, message: string, data: ConstitutionalLogData): void {
    if (!this.enableConstitutional) {
      return this.log(level, message, data);
    }

    const complianceIcon = data.compliance ? '✅' : '❌';
    const enhancedMessage = `${complianceIcon} [${data.standard}] ${message}`;

    this.log(level, enhancedMessage, {
      ...data,
      constitutional: true,
    });
  }

  performance(message: string, duration: number, threshold?: number): void {
    if (!this.enablePerformance) {
      return;
    }

    const status = threshold && duration > threshold ? '🐌' : '⚡';
    const enhancedMessage = `${status} [${duration}ms] ${message}`;

    this.log(LogLevel.INFO, enhancedMessage, { duration, threshold });
  }

  createChild(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`, this.level);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    if (!this.enableConsole) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelColors = {
      [LogLevel.DEBUG]: '\x1b[36m', // cyan
      [LogLevel.INFO]: '\x1b[32m',  // green
      [LogLevel.WARN]: '\x1b[33m',  // yellow
      [LogLevel.ERROR]: '\x1b[31m', // red
    };
    const resetColor = '\x1b[0m';

    const levelNames = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
    };

    let formattedMessage: string;

    if (this.format === 'json') {
      formattedMessage = JSON.stringify({
        timestamp,
        level: levelNames[level],
        context: this.context,
        message,
        data,
      });
    } else if (this.format === 'pretty') {
      const color = levelColors[level];
      const levelStr = levelNames[level].padEnd(5);
      formattedMessage = `${color}[${timestamp}] ${levelStr} [${this.context}]${resetColor} ${message}`;

      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else if (data) {
        formattedMessage += ` ${data}`;
      }
    } else {
      formattedMessage = `[${timestamp}] ${levelNames[level]} [${this.context}] ${message}`;
      if (data) {
        formattedMessage += ` ${JSON.stringify(data)}`;
      }
    }

    const logMethod = level === LogLevel.ERROR ? console.error :
                     level === LogLevel.WARN ? console.warn :
                     level === LogLevel.DEBUG ? console.debug : console.log;

    logMethod(formattedMessage);
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }
}

// Default logger instance
export const logger = new Logger('TDDOrchestrator',
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

// Create specialized loggers
export const createLogger = (context: string, logLevel: LogLevel = LogLevel.INFO): Logger => {
  return new Logger(context, logLevel);
};