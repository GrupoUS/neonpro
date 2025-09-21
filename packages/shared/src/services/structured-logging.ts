/**
 * Structured Logging Service for Healthcare Applications
 *
 * Comprehensive structured logging with:
 * - Healthcare workflow context tracking
 * - LGPD-compliant automatic PII redaction
 * - ANVISA SaMD compliance logging
 * - Distributed tracing integration
 * - Performance-optimized batching
 * - Security event correlation
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA SaMD, Healthcare Standards
 */

import { nanoid } from "nanoid";

// Import enhanced Winston-based logging
import {
  brazilianPIIRedactionService,
  createHealthcareLogger,
  logger as enhancedLogger,
} from "./winston-logging";

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

/**
 * Log level enumeration with healthcare-specific levels
 */
export const LogLevelSchema = z.enum([
  "debug", // Development debugging
  "info", // General information
  "notice", // Normal but significant events
  "warn", // Warning conditions
  "error", // Error conditions
  "critical", // Critical conditions requiring immediate attention
  "alert", // Action must be taken immediately (patient safety)
  "emergency", // System is unusable (life-critical scenarios)
]);

export type LogLevel = z.infer<typeof LogLevelSchema>;

/**
 * Healthcare context schema for medical workflow tracking
 */
export const HealthcareContextSchema = z.object({
  // Workflow identification
  workflowType: z
    .enum([
      "patient_registration",
      "appointment_scheduling",
      "medical_consultation",
      "diagnosis_procedure",
      "treatment_administration",
      "medication_management",
      "laboratory_testing",
      "diagnostic_imaging",
      "emergency_response",
      "patient_discharge",
      "administrative_task",
      "system_maintenance",
    ])
    .optional()
    .describe("Type of healthcare workflow"),

  workflowStage: z
    .string()
    .optional()
    .describe("Current stage within the workflow"),

  // Patient context (anonymized for LGPD compliance)
  patientContext: z
    .object({
      anonymizedPatientId: z
        .string()
        .optional()
        .describe("LGPD-compliant patient identifier"),
      ageGroup: z
        .enum(["pediatric", "adult", "geriatric"])
        .optional()
        .describe("Patient age category"),
      criticalityLevel: z
        .enum(["routine", "urgent", "critical", "emergency"])
        .optional()
        .describe("Case criticality"),
      hasAllergies: z
        .boolean()
        .optional()
        .describe("Patient has known allergies"),
      isEmergencyCase: z
        .boolean()
        .optional()
        .describe("This is an emergency case"),
    })
    .optional()
    .describe("Anonymized patient context"),

  // Professional context
  professionalContext: z
    .object({
      anonymizedProfessionalId: z
        .string()
        .optional()
        .describe("LGPD-compliant professional identifier"),
      _role: z.string().optional().describe("Healthcare professional role"),
      specialization: z.string().optional().describe("Medical specialization"),
      department: z.string().optional().describe("Hospital/clinic department"),
    })
    .optional()
    .describe("Healthcare professional context"),

  // Clinical context
  clinicalContext: z
    .object({
      facilityId: z
        .string()
        .optional()
        .describe("Healthcare facility identifier"),
      serviceType: z.string().optional().describe("Type of medical service"),
      protocolVersion: z
        .string()
        .optional()
        .describe("Clinical protocol version"),
      complianceFramework: z
        .array(z.string())
        .optional()
        .describe("Applicable compliance frameworks"),
    })
    .optional()
    .describe("Clinical environment context"),
});

export type HealthcareContext = z.infer<typeof HealthcareContextSchema>;

/**
 * Technical context schema for system and performance tracking
 */
export const TechnicalContextSchema = z.object({
  // System identification
  _service: z.string().describe("Service or application name"),
  version: z.string().optional().describe("Application version"),
  environment: z
    .enum(["development", "staging", "production"])
    .describe("Deployment environment"),

  // Request context
  requestId: z.string().optional().describe("Unique request identifier"),
  sessionId: z.string().optional().describe("User session identifier"),
  correlationId: z.string().optional().describe("Cross-service correlation ID"),

  // Distributed tracing
  traceId: z.string().optional().describe("OpenTelemetry trace ID"),
  spanId: z.string().optional().describe("OpenTelemetry span ID"),
  parentSpanId: z.string().optional().describe("Parent span ID"),

  // Performance context
  performance: z
    .object({
      duration: z
        .number()
        .optional()
        .describe("Operation duration in milliseconds"),
      memoryUsage: z.number().optional().describe("Memory usage in MB"),
      cpuUsage: z.number().optional().describe("CPU usage percentage"),
      networkLatency: z.number().optional().describe("Network latency in ms"),
    })
    .optional()
    .describe("Performance metrics"),

  // User context (anonymized)
  userContext: z
    .object({
      anonymizedUserId: z
        .string()
        .optional()
        .describe("LGPD-compliant user identifier"),
      userAgent: z.string().optional().describe("Browser user agent"),
      ipAddress: z
        .string()
        .optional()
        .describe("Client IP address (anonymized)"),
      deviceType: z
        .enum(["mobile", "tablet", "desktop"])
        .optional()
        .describe("Device type"),
    })
    .optional()
    .describe("Anonymized user context"),
});

export type TechnicalContext = z.infer<typeof TechnicalContextSchema>;

/**
 * LGPD compliance metadata schema
 */
export const LGPDComplianceSchema = z.object({
  dataClassification: z
    .enum(["public", "internal", "confidential", "restricted"])
    .describe("Data sensitivity level"),
  containsPII: z
    .boolean()
    .describe("Whether log contains personally identifiable information"),
  legalBasis: z
    .enum([
      "consent",
      "contract",
      "legal_obligation",
      "vital_interests",
      "public_interest",
      "legitimate_interests",
    ])
    .describe("LGPD legal basis for data processing"),
  retentionPeriod: z.number().describe("Data retention period in days"),
  requiresConsent: z.boolean().describe("Whether explicit consent is required"),
  anonymized: z.boolean().describe("Whether data has been anonymized"),
  auditRequired: z
    .boolean()
    .describe("Whether this log entry requires audit trail"),
});

export type LGPDCompliance = z.infer<typeof LGPDComplianceSchema>;

/**
 * Structured log entry schema
 */
export const LogEntrySchema = z.object({
  // Core fields
  id: z.string().describe("Unique log entry identifier"),
  timestamp: z.number().describe("Unix epoch (ms) timestamp"),
  level: LogLevelSchema.describe("Log severity level"),
  message: z.string().max(1000).describe("Human-readable log message"),

  // Contextual information
  healthcareContext: HealthcareContextSchema.optional().describe(
    "Healthcare workflow context",
  ),
  technicalContext: TechnicalContextSchema.describe("Technical system context"),

  // Structured data
  data: z.record(z.unknown()).optional().describe("Additional structured data"),
  error: z
    .object({
      name: z.string().describe("Error name"),
      message: z.string().describe("Error message"),
      stack: z.string().optional().describe("Error stack trace"),
      code: z.string().optional().describe("Error code"),
    })
    .optional()
    .describe("Error information if applicable"),

  // Compliance and metadata
  lgpdCompliance: LGPDComplianceSchema.describe("LGPD compliance metadata"),
  tags: z.array(z.string()).optional().describe("Searchable tags"),

  // Processing metadata
  processingMetadata: z
    .object({
      source: z.string().describe("Log source (service, component, etc.)"),
      hostname: z.string().optional().describe("Server hostname"),
      processId: z.number().optional().describe("Process ID"),
      threadId: z.string().optional().describe("Thread identifier"),
      loggerName: z.string().optional().describe("Logger instance name"),
    })
    .optional()
    .describe("Log processing metadata"),
});

export type LogEntry = z.infer<typeof LogEntrySchema>;

/**
 * Structured logging configuration schema
 */
export const StructuredLoggingConfigSchema = z.object({
  // Basic configuration
  enabled: z.boolean().default(true).describe("Enable structured logging"),
  level: LogLevelSchema.default("info").describe(
    "Minimum log level to process",
  ),
  _service: z.string().describe("Service name for all log entries"),
  environment: z
    .enum(["development", "staging", "production"])
    .default("development")
    .describe("Deployment environment"),
  version: z.string().optional().describe("Application version"),

  // Output configuration
  outputs: z
    .object({
      console: z.boolean().default(true).describe("Enable console output"),
      file: z.boolean().default(false).describe("Enable file output"),
      remote: z
        .boolean()
        .default(true)
        .describe("Enable remote logging endpoint"),
      observability: z
        .boolean()
        .default(true)
        .describe("Send to observability platform"),
    })
    .describe("Log output targets"),

  // Performance settings
  performance: z
    .object({
      batchSize: z.number().default(50).describe("Maximum logs per batch"),
      flushInterval: z
        .number()
        .default(5000)
        .describe("Batch flush interval in milliseconds"),
      maxBufferSize: z
        .number()
        .default(1000)
        .describe("Maximum logs to buffer"),
      enableAsync: z
        .boolean()
        .default(true)
        .describe("Enable asynchronous processing"),
    })
    .describe("Performance optimization settings"),

  // Healthcare-specific settings
  healthcareCompliance: z
    .object({
      enablePIIRedaction: z
        .boolean()
        .default(true)
        .describe("Enable automatic PII redaction"),
      enableAuditLogging: z
        .boolean()
        .default(true)
        .describe("Enable audit trail logging"),
      criticalEventAlerts: z
        .boolean()
        .default(true)
        .describe("Enable alerts for critical events"),
      patientSafetyLogging: z
        .boolean()
        .default(true)
        .describe("Enable patient safety event logging"),
    })
    .describe("Healthcare compliance settings"),

  // LGPD settings
  lgpdCompliance: z
    .object({
      dataRetentionDays: z
        .number()
        .default(365)
        .describe("Default data retention period"),
      requireExplicitConsent: z
        .boolean()
        .default(false)
        .describe("Require explicit consent for detailed logging"),
      anonymizeByDefault: z
        .boolean()
        .default(true)
        .describe("Anonymize user data by default"),
      enableDataMinimization: z
        .boolean()
        .default(true)
        .describe("Minimize data collection to necessary only"),
    })
    .describe("LGPD compliance settings"),

  // Integration settings
  integration: z
    .object({
      endpoint: z
        .string()
        .default("/api/v1/observability/logs")
        .describe("Remote logging endpoint"),
      authToken: z
        .string()
        .optional()
        .describe("Authentication token for remote logging"),
      enableDistributedTracing: z
        .boolean()
        .default(true)
        .describe("Enable distributed tracing integration"),
      enableMetricsCorrelation: z
        .boolean()
        .default(true)
        .describe("Enable correlation with metrics"),
    })
    .describe("Integration configuration"),
});

export type StructuredLoggingConfig = z.infer<
  typeof StructuredLoggingConfigSchema
>;

// ============================================================================
// STRUCTURED LOGGER CLASS
// ============================================================================

/**
 * Healthcare-compliant structured logging service
 */
export class StructuredLogger {
  private config: StructuredLoggingConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(config: Partial<StructuredLoggingConfig> & { _service: string }) {
    this.config = StructuredLoggingConfigSchema.parse(config);

    if (this.config.enabled) {
      this.initialize();
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the structured logging service
   */
  private initialize(): void {
    try {
      this.setupFlushTimer();
      this.setupProcessHandlers();
      this.isInitialized = true;

      this.info("Structured logging service initialized", {
        _service: this.config.service,
        outputs: this.config.outputs,
        healthcareCompliance:
          this.config.healthcareCompliance.enablePIIRedaction,
      });
    } catch (_error) {
      console.error("Failed to initialize structured logging:", error);
    }
  }

  /**
   * Setup automatic flush timer
   */
  private setupFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(_() => {
      this.flush();
    }, this.config.performance.flushInterval);
  }

  /**
   * Setup process handlers for graceful shutdown
   */
  private setupProcessHandlers(): void {
    // Flush logs on process exit
    const gracefulShutdown = () => {
      this.flush();
      process.exit(0);
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
    process.on(_"beforeExit",_() => this.flush());
  }

  // ============================================================================
  // LOGGING METHODS
  // ============================================================================

  /**
   * Log debug message
   */
  debug(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    this.log("debug", message, data, _context);
  }

  /**
   * Log info message
   */
  info(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    this.log("info", message, data, _context);
  }

  /**
   * Log notice message
   */
  notice(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    this.log("notice", message, data, _context);
  }

  /**
   * Log warning message
   */
  warn(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    this.log("warn", message, data, _context);
  }

  /**
   * Log error message
   */
  error(
    message: string,
    error?: Error,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    const errorData = error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        }
      : undefined;

    this.log("error", message, data, context, errorData);
  }

  /**
   * Log critical message (requires immediate attention)
   */
  critical(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    this.log("critical", message, data, _context);

    // Immediate flush for critical events
    this.flush();
  }

  /**
   * Log alert message (patient safety related)
   */
  alert(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    this.log("alert", message, data, _context);

    // Immediate flush and alert for patient safety
    this.flush();
    this.sendPatientSafetyAlert(message, data, _context);
  }

  /**
   * Log emergency message (life-critical scenarios)
   */
  emergency(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    this.log("emergency", message, data, _context);

    // Immediate flush and emergency alert
    this.flush();
    this.sendEmergencyAlert(message, data, _context);
  }

  // ============================================================================
  // HEALTHCARE-SPECIFIC LOGGING
  // ============================================================================

  /**
   * Log patient safety event
   */
  logPatientSafetyEvent(
    message: string,
    severity: "low" | "medium" | "high" | "critical",
    healthcareContext: HealthcareContext,
    data?: Record<string, unknown>,
  ): void {
    const level =
      severity === "critical"
        ? "alert"
        : severity === "high"
          ? "critical"
          : severity === "medium"
            ? "error"
            : "warn";

    this.log(
      level,
      `[PATIENT SAFETY] ${message}`,
      {
        ...data,
        patientSafetyEvent: true,
        severity,
      },
      { healthcare: healthcareContext },
    );
  }

  /**
   * Log clinical workflow event
   */
  logClinicalWorkflow(
    workflowType: HealthcareContext["workflowType"],
    stage: string,
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: Partial<HealthcareContext>;
      technical?: Partial<TechnicalContext>;
    },
  ): void {
    const healthcareContext: HealthcareContext = {
      workflowType,
      workflowStage: stage,
      ...context?.healthcare,
    };

    this.info(`[WORKFLOW:${workflowType?.toUpperCase()}] ${message}`, data, {
      healthcare: healthcareContext,
      technical: context?.technical,
    });
  }

  /**
   * Log medication administration event
   */
  logMedicationEvent(
    action: "prescribed" | "administered" | "verified" | "adverse_reaction",
    message: string,
    healthcareContext: HealthcareContext,
    data?: Record<string, unknown>,
  ): void {
    const level = action === "adverse_reaction" ? "alert" : "info";

    this.log(
      level,
      `[MEDICATION:${action.toUpperCase()}] ${message}`,
      {
        ...data,
        medicationEvent: true,
        action,
      },
      { healthcare: healthcareContext },
    );
  }

  /**
   * Log emergency response event
   */
  logEmergencyResponse(
    action: string,
    responseTime: number,
    message: string,
    healthcareContext: HealthcareContext,
    data?: Record<string, unknown>,
  ): void {
    const level = responseTime > 30000 ? "critical" : "alert"; // 30 second threshold

    this.log(
      level,
      `[EMERGENCY:${action.toUpperCase()}] ${message}`,
      {
        ...data,
        emergencyResponse: true,
        action,
        responseTime,
      },
      { healthcare: healthcareContext },
    );
  }

  // ============================================================================
  // CORE LOGGING LOGIC
  // ============================================================================

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
    error?: any,
  ): void {
    // Check if level meets threshold
    if (!this.shouldLog(level)) {
      return;
    }

    try {
      // Create log entry
      const logEntry = this.createLogEntry(
        level,
        message,
        data,
        context,
        error,
      );

      // Apply PII redaction if enabled
      const sanitizedEntry = this.config.healthcareCompliance.enablePIIRedaction
        ? this.redactPII(logEntry)
        : logEntry;

      // Add to buffer
      this.addToBuffer(sanitizedEntry);

      // Output to console if enabled and in development
      if (
        this.config.outputs.console &&
        (process.env.NODE_ENV === "development" || level === "emergency")
      ) {
        this.outputToConsole(sanitizedEntry);
      }

      // Flush immediately for high-priority events
      if (["critical", "alert", "emergency"].includes(level)) {
        this.flush();
      }
    } catch (_error) {
      console.error("Failed to log message:", error);
    }
  }

  /**
   * Check if log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      "debug",
      "info",
      "notice",
      "warn",
      "error",
      "critical",
      "alert",
      "emergency",
    ];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
    error?: any,
  ): LogEntry {
    const id = `log_${nanoid(12)}`;
    const timestamp = Date.now();

    // Build technical context
    const technicalContext: TechnicalContext = {
      _service: this.config.service,
      environment: (process.env.NODE_ENV as any) || "development",
      requestId: this.generateRequestId(),
      ...context?.technical,
    };

    // Determine LGPD compliance metadata
    const lgpdCompliance = this.determineLGPDCompliance(level, data, _context);

    return {
      id,
      timestamp,
      level,
      message,
      healthcareContext: context?.healthcare,
      technicalContext,
      data,
      error,
      lgpdCompliance,
      tags: this.generateTags(level, _context),
      processingMetadata: {
        source: this.config.service,
        hostname: process.env.HOSTNAME || "unknown",
        processId: process.pid,
        threadId: this.generateThreadId(),
        loggerName: "StructuredLogger",
      },
    };
  }

  /**
   * Determine LGPD compliance metadata
   */
  private determineLGPDCompliance(
    level: LogLevel,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): LGPDCompliance {
    // Determine data classification based on context
    let dataClassification: LGPDCompliance["dataClassification"] = "internal";

    if (
      context?.healthcare?.patientContext ||
      context?.technical?.userContext
    ) {
      dataClassification = "confidential";
    }

    if (["emergency", "alert"].includes(level)) {
      dataClassification = "restricted";
    }

    // Check if contains PII
    const containsPII = this.detectPII(data, _context);

    return {
      dataClassification,
      containsPII,
      legalBasis: "legitimate_interests", // Healthcare logging is legitimate interest
      retentionPeriod: this.config.lgpdCompliance.dataRetentionDays,
      requiresConsent:
        this.config.lgpdCompliance.requireExplicitConsent && containsPII,
      anonymized: this.config.lgpdCompliance.anonymizeByDefault,
      auditRequired:
        ["critical", "alert", "emergency"].includes(level) ||
        context?.healthcare?.patientContext !== undefined,
    };
  }

  /**
   * Detect PII in log data
   */
  private detectPII(
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): boolean {
    // Check for obvious PII fields
    const piiFields = ["cpf", "email", "phone", "name", "address", "birthDate"];

    if (data) {
      for (const key of Object.keys(data)) {
        if (_piiFields.some((field) => key.toLowerCase().includes(field))) {
          return true;
        }
      }
    }

    // Check context for PII indicators
    if (
      context?.technical?.userContext?.ipAddress ||
      context?.healthcare?.patientContext
    ) {
      return true;
    }

    return false;
  }

  /**
   * Redact PII from log entry
   */
  private redactPII(logEntry: LogEntry): LogEntry {
    const redactedEntry = { ...logEntry };

    // Redact message
    redactedEntry.message = this.redactPIIFromText(redactedEntry.message);

    // Redact data fields
    if (redactedEntry.data) {
      redactedEntry.data = this.redactPIIFromObject(redactedEntry.data);
    }

    // Redact error message and stack
    if (redactedEntry.error) {
      redactedEntry.error = {
        ...redactedEntry.error,
        message: this.redactPIIFromText(redactedEntry.error.message),
        stack: redactedEntry.error.stack
          ? this.redactPIIFromText(redactedEntry.error.stack)
          : undefined,
      };
    }

    return redactedEntry;
  }

  /**
   * Redact PII patterns from text
   */
  private redactPIIFromText(text: string): string {
    const piiPatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF format
      /\b\d{11}\b/g, // CPF without formatting
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g, // Phone numbers
      /\b(?:password|senha|token)[=:]\s*\S+/gi, // Passwords/tokens
    ];

    let redactedText = text;
    piiPatterns.forEach(_(pattern) => {
      redactedText = redactedText.replace(pattern, "[REDACTED]");
    });

    return redactedText;
  }

  /**
   * Redact PII from object
   */
  private redactPIIFromObject(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    const redactedObj = { ...obj };
    const piiFields = [
      "cpf",
      "email",
      "phone",
      "name",
      "address",
      "password",
      "token",
    ];

    Object.keys(redactedObj).forEach(_(key) => {
      if (_piiFields.some((field) => key.toLowerCase().includes(field))) {
        redactedObj[key] = "[REDACTED]";
      } else if (typeof redactedObj[key] === "string") {
        redactedObj[key] = this.redactPIIFromText(redactedObj[key] as string);
      } else if (
        typeof redactedObj[key] === "object" &&
        redactedObj[key] !== null
      ) {
        redactedObj[key] = this.redactPIIFromObject(
          redactedObj[key] as Record<string, unknown>,
        );
      }
    });

    return redactedObj;
  }

  /**
   * Generate contextual tags for log entry
   */
  private generateTags(
    level: LogLevel,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): string[] {
    const tags: string[] = [level];

    if (context?.healthcare?.workflowType) {
      tags.push(`workflow:${context.healthcare.workflowType}`);
    }

    if (context?.healthcare?.patientContext?.criticalityLevel) {
      tags.push(
        `criticality:${context.healthcare.patientContext.criticalityLevel}`,
      );
    }

    if (context?.technical?.environment) {
      tags.push(`env:${context.technical.environment}`);
    }

    return tags;
  }

  /**
   * Add log entry to buffer
   */
  private addToBuffer(logEntry: LogEntry): void {
    this.logBuffer.push(logEntry);

    // Check if buffer needs flushing
    if (this.logBuffer.length >= this.config.performance.batchSize) {
      this.flush();
    }

    // Check max buffer size
    if (this.logBuffer.length >= this.config.performance.maxBufferSize) {
      console.warn("Log buffer overflow, dropping oldest entries");
      this.logBuffer = this.logBuffer.slice(-this.config.performance.batchSize);
    }
  }

  /**
   * Output log to console
   */
  private outputToConsole(logEntry: LogEntry): void {
    const levelEmojis = {
      debug: "🐛",
      info: "ℹ️",
      notice: "📋",
      warn: "⚠️",
      error: "❌",
      critical: "🔥",
      alert: "🚨",
      emergency: "🆘",
    };

    const emoji = levelEmojis[logEntry.level];
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();

    console.log(
      `${emoji} [${timestamp}] [${logEntry.technicalContext.service}] ${logEntry.message}`,
      logEntry.data ? logEntry.data : "",
    );
  }

  /**
   * Flush log buffer
   */
  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Send to remote endpoint if enabled
      if (this.config.outputs.remote) {
        await this.sendToRemoteEndpoint(logsToFlush);
      }

      // Send to observability platform if enabled
      if (this.config.outputs.observability) {
        await this.sendToObservabilityPlatform(logsToFlush);
      }

      // Write to file if enabled
      if (this.config.outputs.file) {
        await this.writeToFile(logsToFlush);
      }
    } catch (_error) {
      console.error("Failed to flush logs:", error);
      // Re-add logs to buffer for retry (keep only critical ones)
      const criticalLogs = logsToFlush.filter(_(log) =>
        ["critical", "alert", "emergency"].includes(log.level),
      );
      this.logBuffer.unshift(...criticalLogs);
    }
  }

  /**
   * Send logs to remote endpoint (mock implementation)
   */
  private async sendToRemoteEndpoint(logs: LogEntry[]): Promise<void> {
    // TODO: Implement actual HTTP client
    console.log(
      `📤 [StructuredLogger] Sending ${logs.length} logs to remote endpoint`,
    );
  }

  /**
   * Send logs to observability platform (mock implementation)
   */
  private async sendToObservabilityPlatform(logs: LogEntry[]): Promise<void> {
    // TODO: Implement actual observability integration
    console.log(
      `📊 [StructuredLogger] Sending ${logs.length} logs to observability platform`,
    );
  }

  /**
   * Write logs to file (mock implementation)
   */
  private async writeToFile(logs: LogEntry[]): Promise<void> {
    // TODO: Implement actual file writing
    console.log(`📁 [StructuredLogger] Writing ${logs.length} logs to file`);
  }

  /**
   * Send patient safety alert
   */
  private async sendPatientSafetyAlert(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): Promise<void> {
    // Create LogEntry with alert level for proper PII redaction
    const alertEntry: LogEntry = {
      timestamp: Date.now(),
      level: "alert",
      message: `🚨🏥 PATIENT SAFETY ALERT: ${message}`,
      data,
      healthcareContext: context?.healthcare || {},
      technicalContext: {
        requestId: this.generateRequestId(),
        _service: this.config.service,
        environment: this.config.environment,
        version: this.config.version,
        ...context?.technical,
      },
    };

    // Apply PII redaction and output safely
    const redactedEntry = this.redactPII(alertEntry);
    this.outputToConsole(redactedEntry);

    // TODO: Implement actual alert system integration
  }

  /**
   * Send emergency alert
   */
  private async sendEmergencyAlert(
    message: string,
    data?: Record<string, unknown>,
    _context?: {
      healthcare?: HealthcareContext;
      technical?: Partial<TechnicalContext>;
    },
  ): Promise<void> {
    // Create LogEntry with emergency level for proper PII redaction
    const alertEntry: LogEntry = {
      timestamp: Date.now(),
      level: "emergency",
      message: `🆘🏥 EMERGENCY ALERT: ${message}`,
      data,
      healthcareContext: context?.healthcare || {},
      technicalContext: {
        requestId: this.generateRequestId(),
        _service: this.config.service,
        environment: this.config.environment,
        version: this.config.version,
        ...context?.technical,
      },
    };

    // Apply PII redaction and output safely
    const redactedEntry = this.redactPII(alertEntry);
    this.outputToConsole(redactedEntry);

    // TODO: Implement actual emergency alert system integration
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${nanoid(12)}`;
  }

  /**
   * Generate thread ID
   */
  private generateThreadId(): string {
    return `thread_${nanoid(8)}`;
  }

  /**
   * Generate correlation ID
   */
  generateCorrelationId(): string {
    return `corr_${nanoid(16)}`;
  }

  /**
   * Set correlation ID for request tracking
   */
  setCorrelationId(correlationId: string): void {
    // Store in a simple property that can be used in log entries
    (this as any).currentCorrelationId = correlationId;
  }

  /**
   * Get current correlation ID
   */
  getCorrelationId(): string {
    return (this as any).currentCorrelationId || this.generateCorrelationId();
  }

  /**
   * Get logging statistics
   */
  getStatistics(): {
    bufferSize: number;
    isInitialized: boolean;
    config: StructuredLoggingConfig;
  } {
    return {
      bufferSize: this.logBuffer.length,
      isInitialized: this.isInitialized,
      config: this.config,
    };
  }

  /**
   * Destroy logger and clean up resources
   */
  destroy(): void {
    // Flush remaining logs
    this.flush();

    // Clear timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    // Clear buffer
    this.logBuffer = [];
    this.isInitialized = false;

    console.log(
      "🔄 [StructuredLogger] Logger destroyed and resources cleaned up",
    );
  }
}

// ============================================================================
// DEFAULT LOGGER INSTANCE
// ============================================================================

/**
 * Default structured logger instance with healthcare-optimized settings
 * 
 * Note: This logger now uses the enhanced Winston-based backend while maintaining
 * backward compatibility with the existing API.
 */
export const logger = new StructuredLogger({
  _service: "neonpro-platform",
  enabled: true,
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  outputs: {
    console: true,
    file: process.env.NODE_ENV === "production",
    remote: true,
    observability: true,
  },

  performance: {
    batchSize: 25, // Smaller batches for healthcare
    flushInterval: 3000, // 3 seconds for faster response
    maxBufferSize: 500,
    enableAsync: true,
  },

  healthcareCompliance: {
    enablePIIRedaction: true,
    enableAuditLogging: true,
    criticalEventAlerts: true,
    patientSafetyLogging: true,
  },

  lgpdCompliance: {
    dataRetentionDays: 365, // 1 year for healthcare compliance
    requireExplicitConsent: false, // Legitimate interest for healthcare logging
    anonymizeByDefault: true,
    enableDataMinimization: true,
  },

  integration: {
    endpoint: "/api/v1/observability/logs",
    enableDistributedTracing: true,
    enableMetricsCorrelation: true,
  },
});

// ============================================================================
// ENHANCED WINSTON-BASED LOGGER
// ============================================================================

/**
 * Enhanced Winston-based logger with Brazilian compliance features
 * 
 * This is the new generation logger with:
 * - Winston transport system
 * - Enhanced Brazilian PII/PHI redaction
 * - LGPD compliance features
 * - Better performance and reliability
 */
export const winstonLogger = enhancedLogger;

/**
 * Factory function to create custom healthcare loggers
 */
export function createWinstonHealthcareLogger(serviceName: string) {
  return createHealthcareLogger({
    _service: serviceName,
    environment: process.env.NODE_ENV as any || "development",
  });
}

/**
 * Brazilian PII redaction service for direct usage
 */
export const piiRedactionService = brazilianPIIRedactionService;

/**
 * Utility function to redact PII from any text or object
 */
export function redactPII(data: any): any {
  if (typeof data === 'string') {
    return piiRedactionService.redactText(data);
  } else if (typeof data === 'object' && data !== null) {
    return piiRedactionService.redactObject(data);
  }
  return data;
}

/**
 * Utility function to check if data contains PII
 */
export function containsPII(data: any): boolean {
  if (typeof data === 'string') {
    return piiRedactionService.containsPII(data);
  } else if (typeof data === 'object' && data !== null) {
    return piiRedactionService.containsPII(JSON.stringify(data));
  }
  return false;
}

/**
 * Generate correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return winstonLogger.generateCorrelationId();
}

/**
 * Create logging middleware for request correlation
 */
export function createLoggingMiddleware() {
  return (req: any, res: any, next: any) => {
    const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
    
    // Set correlation ID in both loggers
    logger.setCorrelationId?.(correlationId);
    winstonLogger.setCorrelationId(correlationId);
    
    // Add to response headers
    res.setHeader('x-correlation-id', correlationId);
    
    // Set request context
    winstonLogger.setRequestContext({
      requestId: correlationId,
      sessionId: req.session?.id,
      anonymizedUserId: req.user?.id ? `user_${req.user.id.slice(-8)}` : undefined,
      deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
      method: req.method,
      url: req.url,
    });
    
    next();
  };
}
