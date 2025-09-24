// T042: Enhanced logging and monitoring setup
export interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
  FATAL: 4;
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
} as const;

export type LogLevelName = keyof LogLevel;

export interface LogEntry {
  timestamp: string;
  level: LogLevelName;
  message: string;
  _context?: Record<string, any>;
  sessionId?: string;
  _userId?: string;
  provider?: string;
  model?: string;
  requestId?: string;
  error?: Error;
  duration?: number;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
}

export interface LoggerConfig {
  level: LogLevelName;
  enableConsole: boolean;
  enableFile: boolean;
  enableAudit: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  format: "json" | "text";
  includeStack: boolean;
  redactPII: boolean;
}

export class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private shouldLog(level: LogLevelName): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.config.format === "json") {
      return JSON.stringify({
        ...entry,
        error: entry.error
          ? {
              name: entry.error.name,
              message: entry.error.message,
              stack: this.config.includeStack ? entry.error.stack : undefined,
            }
          : undefined,
      });
    }

    // Text format
    const parts = [entry.timestamp, `[${entry.level}]`, entry.message];

    if (entry._context && Object.keys(entry._context).length > 0) {
      parts.push(`Context: ${JSON.stringify(entry._context)}`);
    }

    if (entry.error) {
      parts.push(`Error: ${entry.error.message}`);
      if (this.config.includeStack && entry.error.stack) {
        parts.push(`Stack: ${entry.error.stack}`);
      }
    }

    return parts.join(" ");
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    const formattedLog = this.formatLogEntry(entry);

    if (this.config.enableConsole) {
      console.log(formattedLog);
    }

    // File logging would be implemented here
    // if (this.config.enableFile && this.config.filePath) {
    //   await appendFile(this.config.filePath, formattedLog + '\n');
    // }
  }

  private redactPII(obj: any): any {
    if (!this.config.redactPII) return obj;

    // Simple PII redaction - can be enhanced
    const piiFields = [
      "email",
      "phone",
      "ssn",
      "credit_card",
      "password",
      "token",
    ];

    if (typeof obj === "string") {
      // Redact email patterns
      return obj.replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        "[EMAIL_REDACTED]",
      );
    }

    if (typeof obj === "object" && obj !== null) {
      const redacted = { ...obj };
      for (const key of Object.keys(redacted)) {
        if (
          piiFields.some((field: string) => key.toLowerCase().includes(field))
        ) {
          redacted[key] = "[REDACTED]";
        } else if (typeof redacted[key] === "object") {
          redacted[key] = this.redactPII(redacted[key]);
        }
      }
      return redacted;
    }

    return obj;
  }

  private createLogEntry(
    level: LogLevelName,
    message: string,
    _context?: Record<string, any>,
    error?: Error,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      _context: _context ? this.redactPII(_context) : undefined,
      error,
    };
  }

  debug(message: string, _context?: Record<string, any>): void {
    if (!this.shouldLog("DEBUG")) return;
    const entry = this.createLogEntry("DEBUG", message, _context);
    this.writeLog(entry);
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog("INFO")) return;
    const entry = this.createLogEntry("INFO", message, context);
    this.writeLog(entry);
  }

  warn(message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog("WARN")) return;
    const entry = this.createLogEntry("WARN", message, context, error);
    this.writeLog(entry);
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog("ERROR")) return;
    const entry = this.createLogEntry("ERROR", message, context, error);
    this.writeLog(entry);
  }

  fatal(message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog("FATAL")) return;
    const entry = this.createLogEntry("FATAL", message, context, error);
    this.writeLog(entry);
  }

  // Specialized logging methods for AI operations
  logAIRequest(context: {
    sessionId: string;
    _userId: string;
    provider: string;
    model: string;
    requestId: string;
    prompt?: string;
  }): void {
    this.info("AI request initiated", {
      sessionId: context.sessionId,
      _userId: context._userId,
      provider: context.provider,
      model: context.model,
      requestId: context.requestId,
      promptLength: context.prompt?.length,
    });
  }

  logAIResponse(context: {
    sessionId: string;
    _userId: string;
    provider: string;
    model: string;
    requestId: string;
    duration: number;
    tokens?: { input: number; output: number; total: number };
    success: boolean;
    error?: Error;
  }): void {
    const level = context.success ? "INFO" : "ERROR";
    const message = context.success
      ? "AI request completed"
      : "AI request failed";

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      _context: {
        sessionId: context.sessionId,
        _userId: context._userId,
        provider: context.provider,
        model: context.model,
        requestId: context.requestId,
        success: context.success,
      },
      duration: context.duration,
      tokens: context.tokens,
      error: context.error,
    };

    this.writeLog(entry);
  }

  logRateLimit(_context: {
    provider: string;
    limit: string;
    current: number;
    max: number;
  }): void {
    this.warn("Rate limit approached", _context);
  }

  logSecurityEvent(context: {
    event: string;
    sessionId?: string;
    _userId?: string;
    severity: "low" | "medium" | "high" | "critical";
    details: Record<string, any>;
  }): void {
    const level =
      context.severity === "critical"
        ? "FATAL"
        : context.severity === "high"
          ? "ERROR"
          : "WARN";

    this.writeLog({
      timestamp: new Date().toISOString(),
      level,
      message: `Security event: ${context.event}`,
      _context: {
        event: context.event,
        sessionId: context.sessionId,
        _userId: context._userId,
        severity: context.severity,
        details: this.redactPII(context.details),
      },
    });
  }
}

// Default logger configuration
export function createLoggerConfig(): LoggerConfig {
  return {
    level: (process.env.LOG_LEVEL as LogLevelName) || "INFO",
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== "false",
    enableFile: process.env.LOG_ENABLE_FILE === "true",
    enableAudit: process.env.LOG_ENABLE_AUDIT !== "false",
    filePath: process.env.LOG_FILE_PATH || "./logs/app.log",
    maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || "10485760"), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || "5"),
    format: (process.env.LOG_FORMAT as "json" | "text") || "json",
    includeStack: process.env.LOG_INCLUDE_STACK !== "false",
    redactPII: process.env.LOG_REDACT_PII !== "false",
  };
}

// Global logger instance
let loggerInstance: Logger | null = null;

export function createLogger(config?: LoggerConfig): Logger {
  const loggerConfig = config || createLoggerConfig();
  loggerInstance = new Logger(loggerConfig);
  return loggerInstance;
}

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
}
