/**
 * Healthcare-Specific Error Handling and Logging
 *
 * Comprehensive error handling system for healthcare operations including:
 * - Healthcare-specific error types and codes
 * - LGPD compliance error handling
 * - Brazilian regulatory compliance errors (ANVISA, CFM)
 * - Audit trail integration for errors
 * - Structured logging with PII sanitization
 * - Error monitoring and alerting integration
 */

import { type HealthcarePrismaClient } from "../clients/prisma";

// Healthcare error severity levels
export enum HealthcareErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Healthcare error categories
export enum HealthcareErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  COMPLIANCE = "compliance",
  DATA_INTEGRITY = "data_integrity",
  SYSTEM = "system",
  NETWORK = "network",
  EXTERNAL_SERVICE = "external_service",
}

// Base healthcare error interface
interface HealthcareErrorDetails {
  code: string;
  category: HealthcareErrorCategory;
  severity: HealthcareErrorSeverity;
  message: string;
  details?: Record<string, any>;
  userId?: string;
  clinicId?: string;
  patientId?: string;
  resourceType?: string;
  resourceId?: string;
  timestamp: Date;
  stackTrace?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Base healthcare error class
export class HealthcareError extends Error {
  public readonly code: string;
  public readonly category: HealthcareErrorCategory;
  public readonly severity: HealthcareErrorSeverity;
  public readonly details: Record<string, any>;
  public readonly userId?: string;
  public readonly clinicId?: string;
  public readonly patientId?: string;
  public readonly resourceType?: string;
  public readonly resourceId?: string;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;

  constructor(errorDetails: HealthcareErrorDetails) {
    super(errorDetails.message);
    this.name = "HealthcareError";
    this.code = errorDetails.code;
    this.category = errorDetails.category;
    this.severity = errorDetails.severity;
    this.details = errorDetails.details || {};
    this.userId = errorDetails.userId;
    this.clinicId = errorDetails.clinicId;
    this.patientId = errorDetails.patientId;
    this.resourceType = errorDetails.resourceType;
    this.resourceId = errorDetails.resourceId;
    this.timestamp = errorDetails.timestamp;
    this.requestId = errorDetails.requestId;
    this.ipAddress = errorDetails.ipAddress;
    this.userAgent = errorDetails.userAgent;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HealthcareError);
    }
  }

  /**
   * Converts error to JSON format for logging and API responses
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      severity: this.severity,
      message: this.message,
      details: this.details,
      userId: this.userId,
      clinicId: this.clinicId,
      patientId: this.patientId,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
      stack: this.stack,
    };
  }

  /**
   * Sanitizes error for external logging (removes PII)
   */
  toSanitizedJSON(): Record<string, any> {
    const sanitized = this.toJSON();

    // Remove PII from error details
    delete sanitized.userId;
    delete sanitized.patientId;
    delete sanitized.ipAddress;
    delete sanitized.userAgent;

    // Sanitize details object
    if (sanitized.details) {
      Object.keys(sanitized.details).forEach((key) => {
        if (
          key.toLowerCase().includes("email") ||
          key.toLowerCase().includes("phone") ||
          key.toLowerCase().includes("cpf") ||
          key.toLowerCase().includes("address")
        ) {
          sanitized.details[key] = "[SANITIZED]";
        }
      });
    }

    return sanitized;
  }
}

// Authentication errors
export class HealthcareAuthenticationError extends HealthcareError {
  constructor(
    message: string,
    details?: Record<string, any>,
    context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code: "HEALTHCARE_AUTH_ERROR",
      category: HealthcareErrorCategory.AUTHENTICATION,
      severity: HealthcareErrorSeverity.HIGH,
      message,
      details,
      timestamp: new Date(),
      ...context,
    });
    this.name = "HealthcareAuthenticationError";
  }
}

// Authorization errors
export class HealthcareAuthorizationError extends HealthcareError {
  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string,
    context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code: "HEALTHCARE_AUTHZ_ERROR",
      category: HealthcareErrorCategory.AUTHORIZATION,
      severity: HealthcareErrorSeverity.HIGH,
      message,
      resourceType,
      resourceId,
      timestamp: new Date(),
      ...context,
    });
    this.name = "HealthcareAuthorizationError";
  }
}

// LGPD compliance errors
export class LGPDComplianceError extends HealthcareError {
  public readonly lgpdArticle?: string;
  public readonly dataCategory?: string;

  constructor(
    message: string,
    lgpdArticle?: string,
    dataCategory?: string,
    context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code: "LGPD_COMPLIANCE_ERROR",
      category: HealthcareErrorCategory.COMPLIANCE,
      severity: HealthcareErrorSeverity.CRITICAL,
      message,
      details: { lgpdArticle, dataCategory },
      timestamp: new Date(),
      ...context,
    });
    this.name = "LGPDComplianceError";
    this.lgpdArticle = lgpdArticle;
    this.dataCategory = dataCategory;
  }
}

// Brazilian healthcare regulatory errors
export class BrazilianRegulatoryError extends HealthcareError {
  public readonly regulatoryBody: "ANVISA" | "CFM" | "CFF" | "CREF";
  public readonly regulation?: string;

  constructor(
    message: string,
    regulatoryBody: "ANVISA" | "CFM" | "CFF" | "CREF",
    regulation?: string,
    context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code: `${regulatoryBody}_COMPLIANCE_ERROR`,
      category: HealthcareErrorCategory.COMPLIANCE,
      severity: HealthcareErrorSeverity.HIGH,
      message,
      details: { regulatoryBody, regulation },
      timestamp: new Date(),
      ...context,
    });
    this.name = "BrazilianRegulatoryError";
    this.regulatoryBody = regulatoryBody;
    this.regulation = regulation;
  }
}

// Patient data validation errors
export class PatientDataValidationError extends HealthcareError {
  public readonly validationErrors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;

  constructor(
    validationErrors: Array<{ field: string; message: string; value?: any }>,
    context?: Partial<HealthcareErrorDetails>,
  ) {
    const message = `Patient data validation failed: ${validationErrors
      .map((e) => e.field)
      .join(", ")}`;

    super({
      code: "PATIENT_DATA_VALIDATION_ERROR",
      category: HealthcareErrorCategory.VALIDATION,
      severity: HealthcareErrorSeverity.MEDIUM,
      message,
      details: { validationErrors },
      timestamp: new Date(),
      ...context,
    });
    this.name = "PatientDataValidationError";
    this.validationErrors = validationErrors;
  }
}

// Appointment scheduling errors
export class AppointmentSchedulingError extends HealthcareError {
  public readonly conflictType?:
    | "time_conflict"
    | "resource_unavailable"
    | "policy_violation";

  constructor(
    message: string,
    conflictType?:
      | "time_conflict"
      | "resource_unavailable"
      | "policy_violation",
    context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code: "APPOINTMENT_SCHEDULING_ERROR",
      category: HealthcareErrorCategory.VALIDATION,
      severity: HealthcareErrorSeverity.MEDIUM,
      message,
      details: { conflictType },
      timestamp: new Date(),
      ...context,
    });
    this.name = "AppointmentSchedulingError";
    this.conflictType = conflictType;
  }
}

// Database integrity errors
export class HealthcareDataIntegrityError extends HealthcareError {
  constructor(
    message: string,
    operation?: string,
    context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code: "HEALTHCARE_DATA_INTEGRITY_ERROR",
      category: HealthcareErrorCategory.DATA_INTEGRITY,
      severity: HealthcareErrorSeverity.HIGH,
      message,
      details: { operation },
      timestamp: new Date(),
      ...context,
    });
    this.name = "HealthcareDataIntegrityError";
  }
}

// External service errors (insurance, lab results, etc.)
export class ExternalHealthcareServiceError extends HealthcareError {
  public readonly serviceName: string;
  public readonly serviceResponse?: any;

  constructor(
    message: string,
    serviceName: string,
    serviceResponse?: any,
    context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code: "EXTERNAL_HEALTHCARE_SERVICE_ERROR",
      category: HealthcareErrorCategory.EXTERNAL_SERVICE,
      severity: HealthcareErrorSeverity.MEDIUM,
      message,
      details: { serviceName, serviceResponse },
      timestamp: new Date(),
      ...context,
    });
    this.name = "ExternalHealthcareServiceError";
    this.serviceName = serviceName;
    this.serviceResponse = serviceResponse;
  }
}

// Healthcare logger class
export class HealthcareLogger {
  private prisma?: HealthcarePrismaClient;

  constructor(prisma?: HealthcarePrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Logs healthcare error with audit trail
   */
  async logError(error: HealthcareError): Promise<void> {
    try {
      // Console logging with structured format
      console.error("Healthcare Error:", {
        timestamp: error.timestamp.toISOString(),
        code: error.code,
        category: error.category,
        severity: error.severity,
        message: error.message,
        resourceType: error.resourceType,
        resourceId: error.resourceId,
        clinicId: error.clinicId,
        requestId: error.requestId,
      });

      // Log to database audit trail if Prisma client available
      if (this.prisma && error.userId) {
        await this.prisma.createAuditLog(
          "ERROR",
          error.resourceType || "SYSTEM",
          error.resourceId || "unknown",
          {
            errorCode: error.code,
            errorCategory: error.category,
            errorSeverity: error.severity,
            errorMessage: error.message,
            errorDetails: error.details,
            stackTrace: this.sanitizeStackTrace(error.stack),
            requestId: error.requestId,
          },
        );
      }

      // Send to external monitoring services (Sentry, etc.)
      await this.sendToMonitoring(error);

      // Send alerts for critical errors
      if (error.severity === HealthcareErrorSeverity.CRITICAL) {
        await this.sendCriticalAlert(error);
      }
    } catch (loggingError) {
      console.error("Failed to log healthcare error:", loggingError);
    }
  }

  /**
   * Logs successful healthcare operations
   */
  async logSuccess(
    operation: string,
    resourceType: string,
    resourceId: string,
    context?: {
      userId?: string;
      clinicId?: string;
      details?: Record<string, any>;
      duration?: number;
    },
  ): Promise<void> {
    try {
      console.info("Healthcare Operation Success:", {
        timestamp: new Date().toISOString(),
        operation,
        resourceType,
        resourceId,
        clinicId: context?.clinicId,
        duration: context?.duration,
      });

      if (this.prisma && context?.userId) {
        await this.prisma.createAuditLog("SUCCESS", resourceType, resourceId, {
          operation,
          duration: context.duration,
          details: context.details,
        });
      }
    } catch (loggingError) {
      console.error("Failed to log healthcare success:", loggingError);
    }
  }

  /**
   * Sanitizes stack trace for logging (removes sensitive paths)
   */
  private sanitizeStackTrace(stackTrace?: string): string {
    if (!stackTrace) return "";

    return stackTrace
      .replace(/\/home\/[^/]+/g, "/home/[USER]")
      .replace(/\/Users\/[^/]+/g, "/Users/[USER]")
      .replace(/C:\\Users\\[^\\]+/g, "C:\\Users\\[USER]");
  }

  /**
   * Sends error to external monitoring services
   */
  private async sendToMonitoring(error: HealthcareError): Promise<void> {
    try {
      // Integration with Sentry, DataDog, or other monitoring services
      // This would be implemented based on your monitoring setup

      if (process.env.SENTRY_DSN) {
        // Log the error for future monitoring implementation
        console.warn("Monitoring integration not yet implemented for error:", {
          code: error.code,
          category: error.category,
          severity: error.severity,
          sanitized: error.toSanitizedJSON(),
        });
        // Sentry integration would go here
        // Sentry.captureException(error, {
        //   tags: {
        //     category: error.category,
        //     severity: error.severity,
        //     code: error.code,
        //   },
        //   extra: error.toSanitizedJSON(),
        // });
      }
    } catch (monitoringError) {
      console.error("Failed to send to monitoring:", monitoringError);
    }
  }

  /**
   * Sends critical alerts (email, Slack, etc.)
   */
  private async sendCriticalAlert(error: HealthcareError): Promise<void> {
    try {
      // Implementation for critical alerts
      // This could integrate with email services, Slack, PagerDuty, etc.

      const alertMessage = `
CRITICAL HEALTHCARE ERROR
========================
Code: ${error.code}
Message: ${error.message}
Clinic: ${error.clinicId}
Resource: ${error.resourceType}:${error.resourceId}
Time: ${error.timestamp.toISOString()}
`;

      console.error("CRITICAL ALERT:", alertMessage);

      // Email/Slack notification would be implemented here
    } catch (alertError) {
      console.error("Failed to send critical alert:", alertError);
    }
  }
}

// Error handler factory
export class HealthcareErrorHandler {
  private logger: HealthcareLogger;

  constructor(prisma?: HealthcarePrismaClient) {
    this.logger = new HealthcareLogger(prisma);
  }

  /**
   * Handles and logs healthcare errors
   */
  async handleError(
    error: unknown,
    context?: Partial<HealthcareErrorDetails>,
  ): Promise<HealthcareError> {
    let healthcareError: HealthcareError;

    if (error instanceof HealthcareError) {
      healthcareError = error;
    } else if (error instanceof Error) {
      // Convert generic errors to healthcare errors
      healthcareError = new HealthcareError({
        code: "UNKNOWN_ERROR",
        category: HealthcareErrorCategory.SYSTEM,
        severity: HealthcareErrorSeverity.MEDIUM,
        message: error.message,
        stackTrace: error.stack,
        timestamp: new Date(),
        ...context,
      });
    } else {
      // Handle non-Error objects
      healthcareError = new HealthcareError({
        code: "UNKNOWN_ERROR",
        category: HealthcareErrorCategory.SYSTEM,
        severity: HealthcareErrorSeverity.MEDIUM,
        message: String(error),
        timestamp: new Date(),
        ...context,
      });
    }

    await this.logger.logError(healthcareError);
    return healthcareError;
  }

  /**
   * Creates error response for API endpoints
   */
  createErrorResponse(error: HealthcareError): {
    error: {
      code: string;
      message: string;
      category: string;
      severity: string;
      timestamp: string;
      requestId?: string;
    };
    status: number;
  } {
    const statusMap = {
      [HealthcareErrorCategory.AUTHENTICATION]: 401,
      [HealthcareErrorCategory.AUTHORIZATION]: 403,
      [HealthcareErrorCategory.VALIDATION]: 400,
      [HealthcareErrorCategory.COMPLIANCE]: 403,
      [HealthcareErrorCategory.DATA_INTEGRITY]: 422,
      [HealthcareErrorCategory.SYSTEM]: 500,
      [HealthcareErrorCategory.NETWORK]: 502,
      [HealthcareErrorCategory.EXTERNAL_SERVICE]: 503,
    };

    return {
      error: {
        code: error.code,
        message: error.message,
        category: error.category,
        severity: error.severity,
        timestamp: error.timestamp.toISOString(),
        requestId: error.requestId,
      },
      status: statusMap[error.category] || 500,
    };
  }
}

// Export singleton instance
export const healthcareErrorHandler = new HealthcareErrorHandler();

/**
 * tRPC-specific healthcare error class
 * Extends HealthcareError with tRPC-compatible properties
 */
export class HealthcareTRPCError extends HealthcareError {
  constructor(
    code: string,
    message: string,
    category: HealthcareErrorCategory = HealthcareErrorCategory.SYSTEM,
    severity: HealthcareErrorSeverity = HealthcareErrorSeverity.MEDIUM,
    context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code,
      message,
      category,
      severity,
      timestamp: new Date(),
      ...context,
    });
  }

  /**
   * Convert to tRPC error format
   */
  toTRPCError(): {
    code: string;
    message: string;
    data: {
      category: string;
      severity: string;
      timestamp: string;
      requestId?: string;
      userId?: string;
      clinicId?: string;
      patientId?: string;
    };
  } {
    return {
      code: this.code,
      message: this.message,
      data: {
        category: this.category,
        severity: this.severity,
        timestamp: this.timestamp.toISOString(),
        requestId: this.requestId,
        userId: this.userId,
        clinicId: this.clinicId,
        patientId: this.patientId,
      },
    };
  }
}

// Export all error types and utilities
export { type HealthcareErrorDetails, HealthcareLogger };
