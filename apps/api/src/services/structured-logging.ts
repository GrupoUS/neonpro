/**
 * Structured logging service for healthcare applications
 * Provides consistent, HIPAA-compliant logging with redaction capabilities
 */

// Define log levels that match common logging standards
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

// Define structured log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  requestId?: string;
  _userId?: string;
  clinicId?: string;
  patientId?: string;
  operationType?: string;
  endpoint?: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    type?: string;
    stack?: string;
  };
  healthcareCompliant: boolean;
}

// Healthcare data patterns that should be redacted
const HEALTHCARE_PATTERNS: Record<string, RegExp> = {
  cpf: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,
  cns: /\b\d{3}\s\d{4}\s\d{4}\s\d{4}\b/g,
  crm: /\bCRM\s*\d{4,6}\b/gi,
  patientName:
    /\b(patient\s+name|nome\s+do\s+paciente):\s*[A-Z][a-z]+\s+[A-Z][a-z]+\b/gi,
  medicalRecord: /\b(medical\s+record|prontuário):\s*[A-Z0-9-]+\b/gi,
  diagnosis: /\b(diagnosis|diagnóstico):\s*[^.,]+/gi,
  treatment: /\b(treatment|tratamento):\s*[^.,]+/gi,
};

/**
 * Redacts sensitive healthcare data from log messages
 */
function redactSensitiveData(text: string): {
  redacted: string;
  fields: string[];
} {
  let redactedText = text;
  const redactedFields: string[] = [];

  Object.entries(HEALTHCARE_PATTERNS).forEach(([field, _pattern]) => {
    if (pattern.test(redactedText)) {
      redactedFields.push(field);
      redactedText = redactedText.replace(
        pattern,
        `[REDACTED_${field.toUpperCase()}]`,
      );
    }
  });

  return { redacted: redactedText, fields: redactedFields };
}

/**
 * Redacts sensitive data from metadata objects recursively
 */
function redactMetadata(metadata: Record<string, any>): Record<string, any> {
  const redacted: Record<string, any> = {};

  Object.entries(metadata).forEach(([key, _value]) => {
    if (typeof value === "string") {
      const { redacted: redactedValue } = redactSensitiveData(value);
      redacted[key] = redactedValue;
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactMetadata(value);
    } else {
      redacted[key] = value;
    }
  });

  return redacted;
}

/**
 * Creates a structured log entry with proper redaction
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  _context: {
    requestId?: string;
    _userId?: string;
    clinicId?: string;
    patientId?: string;
    operationType?: string;
    endpoint?: string;
    metadata?: Record<string, any>;
    error?: Error;
  } = {},
): LogEntry {
  // Redact sensitive data from message
  const { redacted: redactedMessage, fields: redactedFields } =
    redactSensitiveData(message);

  // Process metadata if provided
  const processedMetadata = context.metadata
    ? redactMetadata(context.metadata)
    : undefined;

  // Create log entry
  const logEntry: LogEntry = {
    level,
    message: redactedMessage,
    timestamp: new Date(),
    requestId: context.requestId,
    _userId: context.userId,
    clinicId: context.clinicId,
    patientId: context.patientId ? `[REDACTED_PATIENT_ID]` : undefined,
    operationType: context.operationType,
    endpoint: context.endpoint,
    metadata: processedMetadata,
    healthcareCompliant: redactedFields.length > 0,
  };

  // Add error information if provided
  if (context.error) {
    const { redacted: redactedErrorMessage } = redactSensitiveData(
      context.error.message,
    );
    logEntry.error = {
      message: redactedErrorMessage,
      type: context.error.name,
      stack: context.error.stack,
    };
  }

  return logEntry;
}

/**
 * Core structured logger implementation
 */
class StructuredLogger {
  private static instance: StructuredLogger;
  private serviceName: string;
  private serviceVersion: string;

  private constructor(
    serviceName: string = "api",
    serviceVersion: string = "1.0.0",
  ) {
    this.serviceName = serviceName;
    this.serviceVersion = serviceVersion;
  }

  public static getInstance(
    serviceName?: string,
    serviceVersion?: string,
  ): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger(
        serviceName,
        serviceVersion,
      );
    }
    return StructuredLogger.instance;
  }

  /**
   * Logs a debug message
   */
  public debug(
    message: string,
    _context?: Parameters<typeof createLogEntry>[1],
  ): void {
    this.log(LogLevel.DEBUG, message, _context);
  }

  /**
   * Logs an info message
   */
  public info(
    message: string,
    _context?: Parameters<typeof createLogEntry>[1],
  ): void {
    this.log(LogLevel.INFO, message, _context);
  }

  /**
   * Logs a warning message
   */
  public warn(
    message: string,
    _context?: Parameters<typeof createLogEntry>[1],
  ): void {
    this.log(LogLevel.WARN, message, _context);
  }

  /**
   * Logs an error message
   */
  public error(
    message: string,
    _context?: Parameters<typeof createLogEntry>[1],
  ): void {
    this.log(LogLevel.ERROR, message, _context);
  }

  /**
   * Core logging method that outputs to console
   */
  private log(
    level: LogLevel,
    message: string,
    _context?: Parameters<typeof createLogEntry>[1],
  ): void {
    const logEntry = createLogEntry(level, message, _context);

    // Add service information
    const logOutput = {
      _service: this.serviceName,
      version: this.serviceVersion,
      ...logEntry,
    };

    // Convert to JSON string for structured logging
    const logJson = JSON.stringify(logOutput);

    // Output to appropriate console method based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logJson);
        break;
      case LogLevel.INFO:
        console.info(logJson);
        break;
      case LogLevel.WARN:
        console.warn(logJson);
        break;
      case LogLevel.ERROR:
        console.error(logJson);
        break;
    }
  }

  /**
   * Creates a child logger with additional context
   */
  public child(
    _context: Parameters<typeof createLogEntry>[1],
  ): StructuredLogger {
    const childLogger = Object.create(this);
    childLogger.context = context;
    return childLogger;
  }
}

// Export singleton instance
export const structuredLogger = StructuredLogger.getInstance(
  "neonpro-api",
  "1.0.0",
);

// Export types and utilities for external use
export type { LogEntry };
export { createLogEntry, LogLevel, redactMetadata, redactSensitiveData };
