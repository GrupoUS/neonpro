/**
 * Unified Logging and Error Handling System
 * Healthcare-compliant logging with LGPD data protection
 */

import pino from "pino";
import { z } from "zod";

// Log level schema
const LogLevelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);
type LogLevel = z.infer<typeof LogLevelSchema>;

// Log context schema
const LogContextSchema = z.object({
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  traceId: z.string().optional(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  method: z.string().optional(),
  url: z.string().optional(),
  statusCode: z.number().optional(),
  duration: z.number().optional(),
  error: z.any().optional(),
  metadata: z.record(z.any()).optional(),
});

type LogContext = z.infer<typeof LogContextSchema>;

// Healthcare-specific log types
enum HealthcareLogType {
  PATIENT_ACCESS = "patient_access",
  MEDICAL_RECORD = "medical_record",
  PRESCRIPTION = "prescription",
  APPOINTMENT = "appointment",
  BILLING = "billing",
  AUDIT = "audit",
  SECURITY = "security",
  INTEGRATION = "integration",
  PERFORMANCE = "performance",
  ERROR = "error",
}

// LGPD compliance - sensitive data patterns
const SENSITIVE_PATTERNS = [
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
  /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, // CNPJ
  /\b\d{5}-?\d{3}\b/g, // CEP
  /\b[1-9]{2}9?\d{8}\b/g, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, // Email
  /\b4[0-9]{12}(?:[0-9]{3})?\b/g, // Credit card (Visa)
  /\b5[1-5][0-9]{14}\b/g, // Credit card (Mastercard)
  /password|senha|token|secret|key/gi, // Sensitive keywords
];

/**
 * Healthcare-compliant logger with LGPD data protection
 */
export class HealthcareLogger {
  private logger: pino.Logger;
  private logBuffer: any[] = [];
  private readonly bufferSize = 100;
  private readonly flushInterval = 5000; // 5 seconds

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || "info",

      // Production configuration
      ...(process.env.NODE_ENV === "production" && {
        redact: {
          paths: [
            "password",
            "senha",
            "token",
            "secret",
            "key",
            "authorization",
            "cookie",
            "x-api-key",
            "cpf",
            "cnpj",
            "email",
            "phone",
            "cep",
          ],
          censor: "[REDACTED]",
        },
        serializers: {
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
          err: pino.stdSerializers.err,
        },
      }),

      // Development configuration
      ...(process.env.NODE_ENV === "development" && {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }),

      formatters: {
        level: (label) => ({ level: label }),
        log: (object) => ({
          ...object,
          timestamp: new Date().toISOString(),
          service: "neonpro-api",
          version: process.env.APP_VERSION || "1.0.0",
        }),
      },
    });

    this.startBufferFlush();
  }

  /**
   * Log with healthcare context
   */
  log(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    type: HealthcareLogType = HealthcareLogType.AUDIT,
  ): void {
    const sanitizedContext = this.sanitizeContext(context);
    const logEntry = {
      level,
      message: this.sanitizeMessage(message),
      context: sanitizedContext,
      type,
      timestamp: new Date().toISOString(),
    };

    // Add to buffer for batch processing
    this.logBuffer.push(logEntry);

    // Immediate logging for errors and security events
    if (level === "error" || level === "fatal" || type === HealthcareLogType.SECURITY) {
      this.logger[level](logEntry);
    } else {
      this.logger[level](logEntry);
    }
  }

  /**
   * Healthcare-specific logging methods
   */

  // Patient data access logging (LGPD compliance)
  logPatientAccess(action: string, patientId: string, context: LogContext): void {
    this.log(
      "info",
      `Patient data access: ${action}`,
      {
        ...context,
        patientId: this.hashSensitiveData(patientId),
        metadata: { action, originalPatientId: patientId },
      },
      HealthcareLogType.PATIENT_ACCESS,
    );
  }

  // Medical record operations
  logMedicalRecord(action: string, recordId: string, context: LogContext): void {
    this.log(
      "info",
      `Medical record ${action}`,
      {
        ...context,
        recordId,
        metadata: { action },
      },
      HealthcareLogType.MEDICAL_RECORD,
    );
  }

  // Security events
  logSecurityEvent(
    event: string,
    severity: "low" | "medium" | "high" | "critical",
    context: LogContext,
  ): void {
    const level =
      severity === "critical"
        ? "fatal"
        : severity === "high"
          ? "error"
          : severity === "medium"
            ? "warn"
            : "info";

    this.log(
      level,
      `Security event: ${event}`,
      {
        ...context,
        metadata: { severity, event },
      },
      HealthcareLogType.SECURITY,
    );
  }

  // API request/response logging
  logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context: LogContext,
  ): void {
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    this.log(
      level,
      `${method} ${url} - ${statusCode}`,
      {
        ...context,
        method,
        url: this.sanitizeUrl(url),
        statusCode,
        duration,
        metadata: { apiCall: true },
      },
      HealthcareLogType.AUDIT,
    );
  }

  // Error logging with context
  logError(
    error: Error,
    context: LogContext = {},
    type: HealthcareLogType = HealthcareLogType.ERROR,
  ): void {
    this.log(
      "error",
      error.message,
      {
        ...context,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...("code" in error && { code: error.code }),
          ...("statusCode" in error && { statusCode: error.statusCode }),
        },
      },
      type,
    );
  }

  // Performance monitoring
  logPerformance(
    operation: string,
    duration: number,
    metadata: Record<string, any> = {},
    context: LogContext = {},
  ): void {
    const level = duration > 5000 ? "warn" : "info"; // Warn if >5 seconds

    this.log(
      level,
      `Performance: ${operation}`,
      {
        ...context,
        duration,
        metadata: { operation, ...metadata },
      },
      HealthcareLogType.PERFORMANCE,
    );
  }

  // Integration logging
  logIntegration(
    service: string,
    action: string,
    success: boolean,
    duration: number,
    context: LogContext = {},
  ): void {
    const level = success ? "info" : "error";

    this.log(
      level,
      `Integration ${service}: ${action}`,
      {
        ...context,
        duration,
        metadata: { service, action, success },
      },
      HealthcareLogType.INTEGRATION,
    );
  }

  /**
   * Get recent logs for monitoring
   */
  getRecentLogs(limit: number = 100): any[] {
    return this.logBuffer.slice(-limit);
  }

  /**
   * Export logs for compliance auditing
   */
  async exportLogs(
    startDate: Date,
    endDate: Date,
    tenantId?: string,
    type?: HealthcareLogType,
  ): Promise<any[]> {
    // In production, this would query a log storage system
    return this.logBuffer.filter((log) => {
      const logDate = new Date(log.timestamp);
      const inDateRange = logDate >= startDate && logDate <= endDate;
      const matchesTenant = !tenantId || log.context.tenantId === tenantId;
      const matchesType = !type || log.type === type;

      return inDateRange && matchesTenant && matchesType;
    });
  }

  // Private methods

  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };

    // Remove or hash sensitive data
    if (sanitized.userId) {
      sanitized.userId = this.hashSensitiveData(sanitized.userId);
    }

    if (sanitized.ip) {
      sanitized.ip = this.maskIpAddress(sanitized.ip);
    }

    if (sanitized.userAgent) {
      sanitized.userAgent = this.sanitizeUserAgent(sanitized.userAgent);
    }

    if (sanitized.metadata) {
      sanitized.metadata = this.sanitizeMetadata(sanitized.metadata);
    }

    return sanitized;
  }

  private sanitizeMessage(message: string): string {
    let sanitized = message;

    // Remove sensitive patterns
    SENSITIVE_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    });

    return sanitized;
  }

  private sanitizeUrl(url: string): string {
    // Remove query parameters that might contain sensitive data
    const urlObj = new URL(url, "http://localhost");
    const sensitiveParams = ["token", "key", "password", "cpf", "email"];

    sensitiveParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, "[REDACTED]");
      }
    });

    return urlObj.pathname + urlObj.search;
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized = { ...metadata };
    const sensitiveKeys = ["password", "token", "key", "secret", "cpf", "cnpj"];

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  private hashSensitiveData(data: string): string {
    // Simple hash for demonstration - use proper hashing in production
    return Buffer.from(data).toString("base64").substring(0, 8) + "***";
  }

  private maskIpAddress(ip: string): string {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return "xxx.xxx.xxx.xxx";
  }

  private sanitizeUserAgent(userAgent: string): string {
    // Keep browser info but remove detailed version numbers
    return userAgent.replace(/\d+\.\d+\.\d+/g, "x.x.x");
  }

  private startBufferFlush(): void {
    setInterval(() => {
      if (this.logBuffer.length > this.bufferSize) {
        // In production, flush to external log storage
        this.logBuffer = this.logBuffer.slice(-this.bufferSize);
      }
    }, this.flushInterval);
  }
}

/**
 * Global error handler for unhandled errors
 */
export class GlobalErrorHandler {
  private logger: HealthcareLogger;

  constructor(logger: HealthcareLogger) {
    this.logger = logger;
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers(): void {
    // Unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      this.logger.logError(
        new Error(`Unhandled Promise Rejection: ${reason}`),
        { metadata: { promise: promise.toString() } },
        HealthcareLogType.ERROR,
      );
    });

    // Uncaught exceptions
    process.on("uncaughtException", (error) => {
      this.logger.logError(error, { metadata: { uncaught: true } }, HealthcareLogType.ERROR);

      // Graceful shutdown
      process.exit(1);
    });

    // SIGTERM and SIGINT handlers
    process.on("SIGTERM", () => {
      this.logger.log("info", "Received SIGTERM, shutting down gracefully");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      this.logger.log("info", "Received SIGINT, shutting down gracefully");
      process.exit(0);
    });
  }
}

// Create singleton instances
export const healthcareLogger = new HealthcareLogger();
export const globalErrorHandler = new GlobalErrorHandler(healthcareLogger);

// Fastify plugin
export async function registerLogging(fastify: any) {
  // Add logger to fastify instance
  fastify.decorate("logger", healthcareLogger);

  // Request logging hook
  fastify.addHook("onRequest", async (request: any) => {
    request.startTime = Date.now();
    request.id = request.id || Math.random().toString(36).substring(7);
  });

  // Response logging hook
  fastify.addHook("onResponse", async (request: any, reply: any) => {
    const duration = Date.now() - (request.startTime || Date.now());

    healthcareLogger.logApiRequest(request.method, request.url, reply.statusCode, duration, {
      requestId: request.id,
      tenantId: request.headers["x-tenant-id"],
      userId: request.user?.id,
      userAgent: request.headers["user-agent"],
      ip: request.ip,
    });
  });

  // Error handling hook
  fastify.setErrorHandler(async (error: any, request: any, reply: any) => {
    healthcareLogger.logError(error, {
      requestId: request.id,
      tenantId: request.headers["x-tenant-id"],
      userId: request.user?.id,
      method: request.method,
      url: request.url,
      userAgent: request.headers["user-agent"],
      ip: request.ip,
    });

    // Return appropriate error response
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? "Internal Server Error" : error.message;

    reply.status(statusCode).send({
      error: {
        message,
        statusCode,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    });
  });
}
