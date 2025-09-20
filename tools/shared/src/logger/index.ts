/**
 * Unified Logger System for NeonPro Tools
 *
 * Combines the best features from all existing loggers:
 * - Performance tracking (from monorepo-audit Logger)
 * - Constitutional compliance (from audit Logger)
 * - Simple emoji formatting (from orchestration Logger)
 * - Structured logging with context management
 * - File rotation and multiple outputs
 * - Healthcare audit trail support
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  statSync,
  renameSync,
  readdirSync,
  unlinkSync,
} from "fs";
import { join } from "path";
import { performance } from "perf_hooks";
import { EventEmitter } from "events";
import {
  LogLevel,
  LogContext,
  LogEntry,
  ConstitutionalContext,
  ErrorInfo,
  Result,
} from "../types";

export interface LoggerConfig {
  level: LogLevel;
  name: string;
  enableConsole: boolean;
  enableFile: boolean;
  enablePerformance: boolean;
  enableConstitutional: boolean;
  logDirectory: string;
  maxFileSize: number; // in bytes
  maxFiles: number;
  format: "json" | "text" | "pretty";
  includeStackTrace: boolean;
  rotateDaily: boolean;
  outputs: {
    console: boolean;
    file: boolean;
    audit?: string;
    performance?: string;
    error?: string;
  };
}

export class UnifiedLogger extends EventEmitter {
  private config: LoggerConfig;
  private contextStack: LogContext[] = [];
  private performanceMarkers: Map<string, number> = new Map();
  private static instances: Map<string, UnifiedLogger> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    super();

    this.config = {
      level: LogLevel.INFO,
      name: config.name || "Tool",
      enableConsole: true,
      enableFile: true,
      enablePerformance: true,
      enableConstitutional: true,
      logDirectory: "./logs",
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      format: "pretty",
      includeStackTrace: true,
      rotateDaily: true,
      outputs: {
        console: true,
        file: true,
        audit: undefined,
        performance: undefined,
        error: undefined,
      },
      ...config,
    };

    this.initializeLogDirectory();
  }

  /**
   * Get or create logger instance (factory pattern)
   */
  static getInstance(
    name: string,
    config?: Partial<LoggerConfig>,
  ): UnifiedLogger {
    if (!UnifiedLogger.instances.has(name)) {
      UnifiedLogger.instances.set(name, new UnifiedLogger({ ...config, name }));
    }
    return UnifiedLogger.instances.get(name)!;
  }

  /**
   * Create child logger with inherited context
   */
  createChild(context: LogContext): UnifiedLogger {
    const childConfig = {
      ...this.config,
      name: `${this.config.name}:${context.component || "Child"}`,
    };
    const child = new UnifiedLogger(childConfig);
    child.pushContext(context);
    return child;
  }

  private initializeLogDirectory(): void {
    if (this.config.enableFile && !existsSync(this.config.logDirectory)) {
      mkdirSync(this.config.logDirectory, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private getCurrentContext(): LogContext {
    return this.contextStack.reduce(
      (acc, context) => ({ ...acc, ...context }),
      { component: this.config.name },
    );
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error,
    constitutional?: ConstitutionalContext,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.getCurrentContext(), ...context },
    };

    if (error) {
      entry.error = this.formatError(error);
    }

    if (constitutional && this.config.enableConstitutional) {
      entry.constitutional = constitutional;
    }

    if (this.config.enablePerformance) {
      entry.performance = {
        timestamp: performance.now(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      };
    }

    return entry;
  }

  private formatError(error: Error): ErrorInfo {
    return {
      name: error.name,
      message: error.message,
      stack: this.config.includeStackTrace ? error.stack : undefined,
      code: (error as any).code,
      cause: (error as any).cause
        ? this.formatError((error as any).cause)
        : undefined,
    };
  }

  private formatLogEntry(entry: LogEntry): string {
    switch (this.config.format) {
      case "json":
        return JSON.stringify(entry);
      case "text":
        return this.formatTextEntry(entry);
      case "pretty":
        return this.formatPrettyEntry(entry);
      default:
        return JSON.stringify(entry);
    }
  }

  private formatTextEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = LogLevel[entry.level];
    const component = entry.context.component || "UNKNOWN";
    const operation = entry.context.operation || "";
    const prefix = operation ? `[${component}:${operation}]` : `[${component}]`;
    const constitutional = entry.constitutional
      ? ` [${entry.constitutional.compliance ? "✅" : "❌"} ${entry.constitutional.standard || "CONST"}]`
      : "";

    return `${timestamp} ${level.padEnd(8)} ${prefix} ${entry.message}${constitutional}`;
  }

  private formatPrettyEntry(entry: LogEntry): string {
    // Color codes and emoji prefixes
    const colors = {
      [LogLevel.TRACE]: "\x1b[37m", // White
      [LogLevel.DEBUG]: "\x1b[35m", // Magenta
      [LogLevel.INFO]: "\x1b[36m", // Cyan
      [LogLevel.WARN]: "\x1b[33m", // Yellow
      [LogLevel.ERROR]: "\x1b[31m", // Red
      [LogLevel.CRITICAL]: "\x1b[41m", // Red background
    };

    const emojis = {
      [LogLevel.TRACE]: "🔍",
      [LogLevel.DEBUG]: "🐛",
      [LogLevel.INFO]: "ℹ️",
      [LogLevel.WARN]: "⚠️",
      [LogLevel.ERROR]: "❌",
      [LogLevel.CRITICAL]: "🚨",
    };

    const resetColor = "\x1b[0m";
    const color = colors[entry.level] || resetColor;
    const emoji = emojis[entry.level] || "ℹ️";
    const levelName = LogLevel[entry.level].padEnd(8);

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const component = entry.context.component || "UNKNOWN";
    const operation = entry.context.operation || "";
    const prefix = operation ? `${component}:${operation}` : component;

    let result = `${color}${timestamp} ${emoji} ${levelName}${resetColor} [${prefix}] ${entry.message}`;

    // Constitutional compliance indicator
    if (entry.constitutional) {
      const complianceIcon = entry.constitutional.compliance ? "✅" : "❌";
      const standard = entry.constitutional.standard || "CONST";
      result += ` ${complianceIcon} ${standard}`;
    }

    // Error details
    if (entry.error) {
      result += `\n  ${color}Error:${resetColor} ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && this.config.includeStackTrace) {
        const stackLines = entry.error.stack.split("\n").slice(1, 4);
        stackLines.forEach((line) => {
          result += `\n    ${line.trim()}`;
        });
      }
    }

    // Metadata
    if (
      entry.context.metadata &&
      Object.keys(entry.context.metadata).length > 0
    ) {
      result += `\n  📋 Metadata: ${JSON.stringify(entry.context.metadata, null, 2)}`;
    }

    // Performance metrics
    if (entry.performance && this.config.enablePerformance) {
      if (entry.performance.duration) {
        result += `\n  ⏱️  Duration: ${entry.performance.duration.toFixed(2)}ms`;
      }
      if (entry.performance.memoryUsage) {
        const memory = entry.performance.memoryUsage;
        result += `\n  💾 Memory: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB heap`;
      }
    }

    return result;
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.config.outputs.console) return;

    const formattedEntry = this.formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.CRITICAL:
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

  private writeToFile(entry: LogEntry): void {
    if (!this.config.outputs.file) return;

    const logFileName = this.config.rotateDaily
      ? `${this.config.name}-${new Date().toISOString().split("T")[0]}.log`
      : `${this.config.name}.log`;

    const logFilePath = join(this.config.logDirectory, logFileName);
    const formattedEntry = this.formatLogEntry(entry) + "\n";

    try {
      appendFileSync(logFilePath, formattedEntry, "utf8");
      this.rotateLogsIfNeeded(logFilePath);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }

    // Write to specialized log files
    this.writeToSpecializedFiles(entry);
  }

  private writeToSpecializedFiles(entry: LogEntry): void {
    const { audit, performance, error } = this.config.outputs;

    // Error log
    if (
      error &&
      (entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL)
    ) {
      const errorPath = join(this.config.logDirectory, error);
      try {
        appendFileSync(errorPath, this.formatLogEntry(entry) + "\n", "utf8");
      } catch (err) {
        console.error("Failed to write to error log:", err);
      }
    }

    // Performance log
    if (performance && entry.performance) {
      const perfPath = join(this.config.logDirectory, performance);
      try {
        appendFileSync(perfPath, this.formatLogEntry(entry) + "\n", "utf8");
      } catch (err) {
        console.error("Failed to write to performance log:", err);
      }
    }

    // Audit log (constitutional compliance)
    if (audit && entry.constitutional) {
      const auditPath = join(this.config.logDirectory, audit);
      try {
        appendFileSync(auditPath, this.formatLogEntry(entry) + "\n", "utf8");
      } catch (err) {
        console.error("Failed to write to audit log:", err);
      }
    }
  }

  private rotateLogsIfNeeded(logFilePath: string): void {
    try {
      const stats = statSync(logFilePath);
      if (stats.size > this.config.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const rotatedPath = logFilePath.replace(".log", `-${timestamp}.log`);
        renameSync(logFilePath, rotatedPath);
        this.cleanupOldLogs();
      }
    } catch (error) {
      console.error("Failed to rotate logs:", error);
    }
  }

  private cleanupOldLogs(): void {
    try {
      const files = readdirSync(this.config.logDirectory)
        .filter(
          (file) => file.endsWith(".log") && file.startsWith(this.config.name),
        )
        .map((file) => ({
          name: file,
          path: join(this.config.logDirectory, file),
          stats: statSync(join(this.config.logDirectory, file)),
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      if (files.length > this.config.maxFiles) {
        const filesToDelete = files.slice(this.config.maxFiles);
        filesToDelete.forEach((file) => {
          unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error("Failed to cleanup old logs:", error);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error,
    constitutional?: ConstitutionalContext,
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(
      level,
      message,
      context,
      error,
      constitutional,
    );

    this.writeToConsole(entry);
    this.writeToFile(entry);
    this.emit("log", entry);
  }

  // Public logging methods
  trace(message: string, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  success(message: string, context?: LogContext): void {
    // Use info level with success indicator
    this.log(LogLevel.INFO, `✅ ${message}`, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  critical(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.CRITICAL, message, context, error);
  }

  // Constitutional compliance logging
  constitutional(
    level: LogLevel,
    message: string,
    compliance: ConstitutionalContext,
    context?: LogContext,
  ): void {
    this.log(level, message, context, undefined, compliance);
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

  async withContextAsync<T>(
    context: LogContext,
    fn: () => Promise<T>,
  ): Promise<T> {
    this.pushContext(context);
    try {
      return await fn();
    } finally {
      this.popContext();
    }
  }

  // Performance tracking
  startTimer(name: string): void {
    this.performanceMarkers.set(name, performance.now());
  }

  endTimer(name: string, context?: LogContext): number {
    const startTime = this.performanceMarkers.get(name);
    if (!startTime) {
      this.warn(`Performance timer '${name}' not found`, context);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.performanceMarkers.delete(name);

    this.info(`⏱️ Performance: ${name} completed in ${duration.toFixed(2)}ms`, {
      ...context,
      metadata: { duration, operation: name },
    });

    return duration;
  }

  // Operation logging with automatic timing
  async logOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext,
  ): Promise<Result<T>> {
    const timerName = `${this.config.name}.${operation}`;
    const fullContext = { ...context, operation };

    this.info(`🚀 Starting ${operation}`, fullContext);
    this.startTimer(timerName);

    try {
      const result = await fn();
      this.endTimer(timerName, fullContext);
      this.success(`Completed ${operation}`, fullContext);

      return {
        success: true,
        data: result,
        message: `${operation} completed successfully`,
      };
    } catch (error) {
      this.endTimer(timerName, fullContext);
      this.error(`Failed ${operation}`, fullContext, error as Error);

      return {
        success: false,
        error: error as Error,
        message: `${operation} failed: ${(error as Error).message}`,
      };
    }
  }

  // Configuration methods
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setFormat(format: "json" | "text" | "pretty"): void {
    this.config.format = format;
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Cleanup
  async close(): Promise<void> {
    this.removeAllListeners();
  }
}

// Default logger instance
export const createLogger = (
  name: string,
  config?: Partial<LoggerConfig>,
): UnifiedLogger => {
  return UnifiedLogger.getInstance(name, config);
};

// Convenience logger for quick use
export const logger = createLogger("DefaultTool", {
  format: "pretty",
  level:
    process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO,
});

// Export everything
export * from "../types";
export default UnifiedLogger;
