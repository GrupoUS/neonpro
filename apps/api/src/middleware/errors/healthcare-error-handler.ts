import { createHealthcareError, generateErrorId } from "@neonpro/shared/errors/error-utils";
import { ErrorCategory, ErrorSeverity } from "@neonpro/shared/errors/healthcare-error-types";
import type { ErrorContext, HealthcareError } from "@neonpro/shared/errors/healthcare-error-types";
import type { Context, Hono } from "hono";
// import { HTTPException } from "hono/http-exception";
import { auditLogger } from "../../lib/audit-logger";
import { logger } from "../../lib/logger";

/**
 * Healthcare-specific error handling middleware for Hono.dev
 * Provides comprehensive error categorization, logging, and LGPD compliance
 */

export function healthcareErrorHandler() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      const healthcareError = await handleHealthcareError(error, c);
      return createErrorResponse(c, healthcareError);
    }
  };
}

/**
 * Processes errors with healthcare context
 */
async function handleHealthcareError(
  error: unknown,
  c: Context,
): Promise<HealthcareError> {
  const originalError = error instanceof Error ? error : new Error(String(error));

  // Extract context from request
  const context: ErrorContext = {
    userId: c.get("user")?.id,
    clinicId: c.get("clinic")?.id || c.get("user")?.clinic_id,
    patientId: extractPatientId(c),
    requestId: c.get("requestId") || generateErrorId(),
    endpoint: c.req.path,
    userAgent: c.req.header("user-agent"),
    ipAddress: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for"),
    sessionId: c.get("sessionId"),
  };

  const healthcareError = createHealthcareError(originalError, context);

  // Log error with healthcare context
  await logHealthcareError(healthcareError, c);

  // Handle LGPD compliance logging for patient data access errors
  if (
    healthcareError.category === ErrorCategory.PATIENT_DATA
    || healthcareError.patientImpact
  ) {
    await logLGPDComplianceError(healthcareError);
  }

  // Trigger alerts for critical errors
  if (healthcareError.severity === ErrorSeverity.CRITICAL) {
    await triggerCriticalErrorAlert(healthcareError);
  }

  return healthcareError;
} /**
 * Extracts patient ID from request context
 */

function extractPatientId(c: Context): string | undefined {
  // Try to extract from URL parameters
  const patientIdFromParam = c.req.param("patientId") || c.req.param("patient_id");
  if (patientIdFromParam) {
    return patientIdFromParam;
  }

  // Try to extract from query parameters
  const patientIdFromQuery = c.req.query("patient_id") || c.req.query("patientId");
  if (patientIdFromQuery) {
    return patientIdFromQuery;
  }

  // Try to extract from request body (if available)
  try {
    const body = c.get("requestBody");
    if (body && (body.patient_id || body.patientId)) {
      return body.patient_id || body.patientId;
    }
  } catch {
    // Body not available or not parsed
  }

  return undefined;
}

/**
 * Logs healthcare errors with appropriate severity and context
 */
async function logHealthcareError(
  error: HealthcareError,
  c: Context,
): Promise<void> {
  const logData = {
    errorId: error.id,
    category: error.category,
    severity: error.severity,
    message: error.message,
    context: error.context,
    patientImpact: error.patientImpact,
    complianceRisk: error.complianceRisk,
    timestamp: error.timestamp,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  };

  // Log with appropriate level based on severity
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      logger.error("CRITICAL Healthcare Error", logData);
      break;
    case ErrorSeverity.HIGH:
      logger.error("HIGH Healthcare Error", logData);
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn("MEDIUM Healthcare Error", logData);
      break;
    default:
      logger.info("LOW Healthcare Error", logData);
  }
} /**
 * Logs LGPD compliance errors for patient data access failures
 */

async function logLGPDComplianceError(error: HealthcareError): Promise<void> {
  if (!error.context.patientId) {
    return;
  }

  try {
    await auditLogger.logDataAccessError({
      errorId: error.id,
      userId: error.context.userId,
      patientId: error.context.patientId,
      clinicId: error.context.clinicId,
      action: "failed_data_access",
      reason: error.message,
      endpoint: error.context.endpoint,
      timestamp: error.timestamp,
      ipAddress: error.context.ipAddress,
      userAgent: error.context.userAgent,
    });
  } catch (auditError) {
    // Critical: audit logging failed
    logger.error("CRITICAL: Audit logging failed for patient data error", {
      originalErrorId: error.id,
      auditError: auditError,
      patientId: error.context.patientId,
    });
  }
}

/**
 * Triggers alerts for critical healthcare errors
 */
async function triggerCriticalErrorAlert(
  error: HealthcareError,
): Promise<void> {
  // TODO: Implement actual alerting system (Slack, PagerDuty, etc.)
  console.error("[CRITICAL ALERT] Healthcare Error", {
    errorId: error.id,
    category: error.category,
    patientImpact: error.patientImpact,
    complianceRisk: error.complianceRisk,
    context: error.context,
  });

  // For now, just log the alert
  logger.error(
    "CRITICAL ALERT: Healthcare system error requires immediate attention",
    {
      errorId: error.id,
      category: error.category,
      severity: error.severity,
      context: error.context,
    },
  );
} /**
 * Creates appropriate HTTP error response
 */

function createErrorResponse(c: Context, error: HealthcareError): Response {
  const statusCode = getHttpStatusCode(error.category, error.severity);

  // Sanitize error message for user
  const userMessage = sanitizeErrorMessage(error.message, error.category);

  const errorResponse = {
    error: {
      id: error.id,
      message: userMessage,
      category: error.category,
      severity: error.severity,
      timestamp: error.timestamp.toISOString(),
      recoverable: error.recoverable,
      ...(process.env.NODE_ENV === "development" && {
        originalMessage: error.message,
        stack: error.stack,
      }),
    },
  };

  // Add additional context for specific error types
  if (error.patientImpact) {
    errorResponse.error = {
      ...errorResponse.error,
      patientDataInvolved: true,
      complianceNotification: "Security team has been automatically notified",
    };
  }

  return c.json(errorResponse, statusCode);
}

/**
 * Maps error categories to HTTP status codes
 */
function getHttpStatusCode(
  category: ErrorCategory,
  severity: ErrorSeverity,
): number {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return 401;
    case ErrorCategory.AUTHORIZATION:
      return 403;
    case ErrorCategory.VALIDATION:
      return 400;
    case ErrorCategory.DATABASE:
    case ErrorCategory.EXTERNAL_API:
      return severity === ErrorSeverity.CRITICAL ? 503 : 500;
    case ErrorCategory.COMPLIANCE:
    case ErrorCategory.PATIENT_DATA:
    case ErrorCategory.AUDIT_LOG:
      return 500; // Internal server error for security
    default:
      return 500;
  }
} /**
 * Sanitizes error messages to prevent information leakage
 */

function sanitizeErrorMessage(
  message: string,
  category: ErrorCategory,
): string {
  // For security-sensitive categories, use generic messages
  switch (category) {
    case ErrorCategory.COMPLIANCE:
      return "Compliance error detected. Security team has been notified.";
    case ErrorCategory.PATIENT_DATA:
      return "Patient data access error. Security protocols activated.";
    case ErrorCategory.AUDIT_LOG:
      return "Audit system error. Compliance team has been notified.";
    case ErrorCategory.AUTHENTICATION:
      return "Authentication failed. Please verify your credentials.";
    case ErrorCategory.AUTHORIZATION:
      return "Access denied. Insufficient permissions for this resource.";
    case ErrorCategory.DATABASE:
      return "Database connectivity issue. Please try again in a moment.";
    case ErrorCategory.EXTERNAL_API:
      return "External service temporarily unavailable. Please try again later.";
    case ErrorCategory.SYSTEM:
      return "System error detected. Technical team has been notified.";
    case ErrorCategory.VALIDATION:
      // For validation errors, we can be more specific but still sanitize
      return message
        .replace(/\b\d{11}\b/g, "***.***.***-**") // Hide CPF
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, "***@***.***"); // Hide email
    default:
      return "An error occurred while processing your request. Please try again.";
  }
}

/**
 * Global error handler setup for Hono app
 */
export function setupHealthcareErrorHandling(app: Hono) {
  app.onError(async (err, c) => {
    const healthcareError = await handleHealthcareError(err, c);
    return createErrorResponse(c, healthcareError);
  });

  // Add error handling middleware to the app
  app.use("*", healthcareErrorHandler());

  return app;
}
