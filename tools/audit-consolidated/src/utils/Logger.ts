import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogContext {
  component?: string;
  operation?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration?: number;
    memoryUsage?: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
  };
  tags?: string[];
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logDirectory: string;
  maxFileSize: number; // in bytes
  maxFiles: number;
  enablePerformanceLogging: boolean;
  enableStructuredLogging: boolean;
  format: 'json' | 'text' | 'pretty';
  includeStackTrace: boolean;
}

export class Logger {
  private config: LoggerConfig;
  private contextStack: LogContext[] = [];
  private performanceMarkers: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      logDirectory: './logs',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      enablePerformanceLogging: true,
      enableStructuredLogging: true,
      format: 'json',
      includeStackTrace: true,
      ...config,
    };

    this.initializeLogDirectory();
  }

  private initializeLogDirectory(): void {
    if (this.config.enableFile && !existsSync(this.config.logDirectory)) {
      mkdirSync(this.config.logDirectory, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private getCurrentContext(): LogContext {
    return this.contextStack.reduce(
      (acc, context) => ({
        ...acc,
        ...context,
      }),
      {},
    );
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.getCurrentContext(), ...context },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.config.includeStackTrace ? error.stack : undefined,
        code: (error as any).code,
      };
    }

    if (this.config.enablePerformanceLogging) {
      entry.performance = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      };
    }

    return entry;
  }

  private formatLogEntry(entry: LogEntry): string {
    switch (this.config.format) {
      case 'json':
        return JSON.stringify(entry);

      case 'text': {
        const timestamp = entry.timestamp;
        const level = LogLevel[entry.level];
        const component = entry.context.component || 'UNKNOWN';
        const operation = entry.context.operation || '';
        const prefix = operation ? `[${component}:${operation}]` : `[${component}]`;
        return `${timestamp} ${level.padEnd(5)} ${prefix} ${entry.message}`;
      }

      case 'pretty':
        return this.prettyFormatLogEntry(entry);

      default:
        return JSON.stringify(entry);
    }
  }
  private prettyFormatLogEntry(entry: LogEntry): string {
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.INFO]: '\x1b[36m', // Cyan
      [LogLevel.DEBUG]: '\x1b[35m', // Magenta
      [LogLevel.TRACE]: '\x1b[37m', // White
    };

    const resetColor = '\x1b[0m';
    const color = colors[entry.level] || resetColor;
    const levelName = LogLevel[entry.level].padEnd(5);

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const component = entry.context.component || 'UNKNOWN';
    const operation = entry.context.operation || '';
    const prefix = operation ? `${component}:${operation}` : component;

    let result = `${color}${timestamp} ${levelName}${resetColor} [${prefix}] ${entry.message}`;

    if (entry.error) {
      result += `\n  ${color}Error:${resetColor} ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && this.config.includeStackTrace) {
        const stackLines = entry.error.stack.split('\n').slice(1, 4); // First 3 stack frames
        stackLines.forEach(line => {
          result += `\n    ${line.trim()}`;
        });
      }
    }

    if (entry.context.metadata && Object.keys(entry.context.metadata).length > 0) {
      result += `\n  Metadata: ${JSON.stringify(entry.context.metadata, null, 2)}`;
    }

    if (entry.performance && this.config.enablePerformanceLogging) {
      if (entry.performance.duration) {
        result += `\n  Duration: ${entry.performance.duration.toFixed(2)}ms`;
      }
      if (entry.performance.memoryUsage) {
        const memory = entry.performance.memoryUsage;
        result += `\n  Memory: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB heap`;
      }
    }

    return result;
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.config.enableFile) {
      return;
    }

    const logFileName = `audit-tool-${new Date().toISOString().split('T')[0]}.log`;
    const logFilePath = path.join(this.config.logDirectory, logFileName);
    const formattedEntry = this.formatLogEntry(entry) + '\n';

    try {
      appendFileSync(logFilePath, formattedEntry, 'utf8');
      this.rotateLogsIfNeeded(logFilePath);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
  private rotateLogsIfNeeded(logFilePath: string): void {
    try {
      const stats = require('fs').statSync(logFilePath);
      if (stats.size > this.config.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = logFilePath.replace('.log', `-${timestamp}.log`);
        require('fs').renameSync(logFilePath, rotatedPath);

        // Clean up old log files
        this.cleanupOldLogs();
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  private cleanupOldLogs(): void {
    try {
      const fs = require('fs');
      const files = fs
        .readdirSync(this.config.logDirectory)
        .filter((file: string) => file.endsWith('.log'))
        .map((file: string) => ({
          name: file,
          path: path.join(this.config.logDirectory, file),
          stats: fs.statSync(path.join(this.config.logDirectory, file)),
        }))
        .sort((a: any, b: any) => b.stats.mtime - a.stats.mtime);

      if (files.length > this.config.maxFiles) {
        const filesToDelete = files.slice(this.config.maxFiles);
        filesToDelete.forEach((file: any) => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) {
      return;
    }

    const formattedEntry = this.formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedEntry);
        break;
      case LogLevel.WARN:
        console.warn(formattedEntry);
        break;
      case LogLevel.INFO:
        console.info(formattedEntry);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(formattedEntry);
        break;
    }
  }
  private log(level: LogLevel, message: string, context: LogContext = {}, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, error);

    this.writeToConsole(entry);
    this.writeToFile(entry);
  }

  // Public logging methods
  error(message: string, context: LogContext = {}, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  trace(message: string, context: LogContext = {}): void {
    this.log(LogLevel.TRACE, message, context);
  }

  // Context management
  pushContext(context: LogContext): void {
    this.contextStack.push(context);
  }

  popContext(): LogContext | undefined {
    return this.contextStack.pop();
  }

  withContext<T>(context: LogContext, fn: () => T): T {
    this.pushContext(context);
    try {
      return fn();
    } finally {
      this.popContext();
    }
  }
  async withContextAsync<T>(context: LogContext, fn: () => Promise<T>): Promise<T> {
    this.pushContext(context);
    try {
      return await fn();
    } finally {
      this.popContext();
    }
  }

  // Performance logging
  startPerformanceTimer(name: string): void {
    this.performanceMarkers.set(name, performance.now());
  }

  endPerformanceTimer(name: string, context: LogContext = {}): number {
    const startTime = this.performanceMarkers.get(name);
    if (!startTime) {
      this.warn(`Performance timer '${name}' not found`, context);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.performanceMarkers.delete(name);

    this.info(`Performance: ${name}`, {
      ...context,
      metadata: { duration: `${duration.toFixed(2)}ms` },
    });

    return duration;
  }

  // Structured logging helpers
  logOperation(operation: string, component: string, fn: () => void): void;
  logOperation(operation: string, component: string, fn: () => Promise<void>): Promise<void>;
  logOperation(
    operation: string,
    component: string,
    fn: () => void | Promise<void>,
  ): void | Promise<void> {
    const context: LogContext = { operation, component };
    const timerName = `${component}.${operation}`;

    this.info(`Starting ${operation}`, context);
    this.startPerformanceTimer(timerName);

    const result = fn();

    if (result instanceof Promise) {
      return result
        .then(() => {
          this.endPerformanceTimer(timerName, context);
          this.info(`Completed ${operation}`, context);
        })
        .catch(error => {
          this.endPerformanceTimer(timerName, context);
          this.error(`Failed ${operation}`, context, error);
          throw error;
        });
    } else {
      this.endPerformanceTimer(timerName, context);
      this.info(`Completed ${operation}`, context);
    }
  } // Configuration methods
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setFormat(format: 'json' | 'text' | 'pretty'): void {
    this.config.format = format;
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Utility methods
  createChildLogger(context: LogContext): Logger {
    const childLogger = new Logger(this.config);
    childLogger.pushContext(context);
    return childLogger;
  }
}

// Default logger instance
export const defaultLogger = new Logger();

// Convenience functions
export const logger = {
  error: (message: string, context?: LogContext, error?: Error) =>
    defaultLogger.error(message, context, error),
  warn: (message: string, context?: LogContext) => defaultLogger.warn(message, context),
  info: (message: string, context?: LogContext) => defaultLogger.info(message, context),
  debug: (message: string, context?: LogContext) => defaultLogger.debug(message, context),
  trace: (message: string, context?: LogContext) => defaultLogger.trace(message, context),
  withContext: <T>(context: LogContext, fn: () => T) => defaultLogger.withContext(context, fn),
  withContextAsync: <T>(context: LogContext, fn: () => Promise<T>) =>
    defaultLogger.withContextAsync(context, fn),
  createChildLogger: (context: LogContext) => defaultLogger.createChildLogger(context),
  setLevel: (level: LogLevel) => defaultLogger.setLevel(level),
  setFormat: (format: 'json' | 'text' | 'pretty') => defaultLogger.setFormat(format),
};
