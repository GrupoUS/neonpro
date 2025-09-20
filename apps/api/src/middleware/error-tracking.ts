/**
 * Error Handling Middleware for NeonPro API
 *
 * Integrates with Hono.js to provide comprehensive error handling
 * with healthcare data protection and compliance logging.
 */

import {
  context as otelContext,
  SpanStatusCode,
  trace,
} from "@opentelemetry/api";
import * as Sentry from "@sentry/node";
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { extractHealthcareContext } from "../config/error-tracking";
import {
  errorTracker,
  HealthcareErrorContext,
} from "../services/error-tracking-bridge";

/**
 * Healthcare-specific error types
 */
export class HealthcareError extends Error {
  constructor(
    message: string,
    public readonly healthcareContext: {
      patientId?: string;
      appointmentId?: string;
      clinicId?: string;
      action?: string;
      severity: "low" | "medium" | "high" | "critical";
      lgpdViolation?: boolean;
      complianceIssue?: boolean;
    },
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "HealthcareError";
  }
}

/**
 * LGPD Compliance Error
 */
export class LGPDComplianceError extends HealthcareError {
  constructor(message: string, patientId?: string) {
    super(
      message,
      {
        patientId,
        severity: "critical",
        lgpdViolation: true,
        complianceIssue: true,
        action: "data_access_violation",
      },
      403,
    );
    this.name = "LGPDComplianceError";
  }
}

/**
 * Patient Data Access Error
 */
export class PatientDataAccessError extends HealthcareError {
  constructor(message: string, patientId: string, clinicId?: string) {
    super(
      message,
      {
        patientId,
        clinicId,
        severity: "high",
        action: "unauthorized_patient_access",
      },
      403,
    );
    this.name = "PatientDataAccessError";
  }
}

/**
 * Medical Data Validation Error
 */
export class MedicalDataValidationError extends HealthcareError {
  constructor(message: string, field: string) {
    super(
      message,
      {
        severity: "medium",
        action: "medical_data_validation",
      },
      400,
    );
    this.name = "MedicalDataValidationError";
  }
}

/**
 * Error tracking middleware for Hono.js
 */
export function errorTrackingMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestId =
      c.req.header("x-request-id") ||
      c.req.header("x-trace-id") ||
      crypto.randomUUID();

    // Set request ID in response headers
    c.res.headers.set("x-request-id", requestId);

    // Create healthcare context
    const healthcareContext = extractHealthcareContext(c.req, {
      requestId,
      userAgent: c.req.header("user-agent"),
      clientIp: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
    });

    // Start OpenTelemetry span
    const tracer = trace.getTracer("neonpro-api");
    const span = tracer.startSpan(`${c.req.method} ${c.req.path}`, {
      attributes: {
        "http.method": c.req.method,
        "http.url": c.req.url,
        "http.route": c.req.path,
        "request.id": requestId,
        "healthcare.clinic_id": healthcareContext.clinicId || "unknown",
        "healthcare.user_role": healthcareContext.userRole || "anonymous",
        "healthcare.lgpd_compliant": healthcareContext.lgpdCompliant,
      },
    });

    try {
      // Execute the request within the span context
      await otelContext.with(
        trace.setSpan(otelContext.active(), span),
        async () => {
          await next();
        },
      );

      // Record successful request metrics
      const duration = Date.now() - startTime;
      span.setAttributes({
        "http.status_code": c.res.status,
        "http.response_time_ms": duration,
      });

      // Log successful requests for audit trail
      if (c.res.status >= 200 && c.res.status < 300) {
        await errorTracker.logAuditEvent({
          type: "request_success",
          context: healthcareContext,
          details: {
            statusCode: c.res.status,
            duration,
            endpoint: c.req.path,
            method: c.req.method,
          },
        });
      }

      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle the error and track it
      await handleError(error, c, healthcareContext, span, duration);
    } finally {
      span.end();
    }
  };
}

/**
 * Comprehensive error handler
 */
async function handleError(
  error: unknown,
  c: Context,
  healthcareContext: HealthcareErrorContext,
  span: any,
  duration: number,
): Promise<void> {
  let statusCode = 500;
  let errorMessage = "Internal server error";
  let errorType = "UnknownError";
  let severity: "low" | "medium" | "high" | "critical" = "medium";

  // Determine error type and status code
  if (error instanceof HealthcareError) {
    statusCode = error.statusCode;
    errorMessage = error.message;
    errorType = error.name;
    severity = error.healthcareContext.severity;

    // Add healthcare-specific context to span
    span.setAttributes({
      "healthcare.error.type": errorType,
      "healthcare.error.severity": severity,
      "healthcare.error.lgpd_violation":
        error.healthcareContext.lgpdViolation || false,
      "healthcare.error.compliance_issue":
        error.healthcareContext.complianceIssue || false,
    });
  } else if (error instanceof HTTPException) {
    statusCode = error.status;
    errorMessage = error.message;
    errorType = "HTTPException";
    severity = statusCode >= 500 ? "high" : "low";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorType = error.name;
    severity = "medium";
  } else {
    errorMessage = String(error);
    errorType = "UnknownError";
    severity = "medium";
  }

  // Set span status and attributes
  span.recordException(error as Error);
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: errorMessage,
  });
  span.setAttributes({
    "http.status_code": statusCode,
    "http.response_time_ms": duration,
    "error.type": errorType,
    "error.message": errorMessage,
  });

  // Track the error with our error tracking service
  try {
    await errorTracker.trackError(error as Error, {
      ...healthcareContext,
      severity,
      statusCode,
      duration,
      errorType,
    });
  } catch (trackingError) {
    // If error tracking fails, log to console as fallback
    console.error("Error tracking failed:", trackingError);
    console.error("Original error:", error);
  }

  // Send error to Sentry with healthcare context
  Sentry.withScope((scope) => {
    scope.setTag("component", "api");
    scope.setTag("errorType", errorType);
    scope.setTag("severity", severity);
    scope.setLevel(severity === "critical" ? "fatal" : (severity as any));

    // Add healthcare context (without sensitive data)
    scope.setContext("healthcare", {
      clinicId: healthcareContext.clinicId,
      userRole: healthcareContext.userRole,
      lgpdCompliant: healthcareContext.lgpdCompliant,
      endpoint: healthcareContext.endpoint,
      method: healthcareContext.method,
    });

    scope.setContext("request", {
      requestId: healthcareContext.requestId,
      endpoint: healthcareContext.endpoint,
      method: healthcareContext.method,
      duration,
    });

    Sentry.captureException(error);
  });

  // Prepare error response
  const errorResponse = {
    error: {
      type: errorType,
      message: errorMessage,
      requestId: healthcareContext.requestId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === "development" && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
  };

  // Add compliance information for LGPD violations
  if (error instanceof LGPDComplianceError) {
    errorResponse.error = {
      ...errorResponse.error,
      compliance: {
        type: "LGPD_VIOLATION",
        message: "This action violates LGPD data protection requirements",
        reportingRequired: true,
      },
    };
  }

  // Set response status and return error
  c.status(statusCode as any);
  await c.json(errorResponse);
}

/**
 * Global error handler for uncaught exceptions
 */
export function setupGlobalErrorHandlers(): void {
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);

    Sentry.withScope((scope) => {
      scope.setTag("component", "global");
      scope.setTag("errorType", "UncaughtException");
      scope.setLevel("fatal");
      Sentry.captureException(error);
    });

    // Give Sentry time to send the error
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error(
      "Unhandled Promise Rejection at:",
      promise,
      "reason:",
      reason,
    );

    Sentry.withScope((scope) => {
      scope.setTag("component", "global");
      scope.setTag("errorType", "UnhandledRejection");
      scope.setLevel("error");
      Sentry.captureException(reason as Error);
    });
  });
}

/**
 * Express error handler for compatibility
 */
export function expressErrorHandler() {
  return (error: Error, req: any, res: any, next: any) => {
    const healthcareContext = extractHealthcareContext(req);

    errorTracker.trackError(error, {
      ...healthcareContext,
      severity: "medium",
      statusCode: 500,
    });

    res.status(500).json({
      error: {
        type: error.name,
        message: error.message,
        requestId: healthcareContext.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  };
}

/**
 * Global error handler for Hono.js app.onError
 */
export function globalErrorHandler() {
  return async (err: Error, c: Context) => {
    const startTime = Date.now();
    const requestId =
      c.req.header("x-request-id") ||
      c.req.header("x-trace-id") ||
      crypto.randomUUID();

    // Extract healthcare context from the request
    const healthcareContext = {
      requestId,
      patientId: c.req.query("patientId") || c.req.param("patientId"),
      appointmentId:
        c.req.query("appointmentId") || c.req.param("appointmentId"),
      clinicId: c.req.query("clinicId") || c.req.param("clinicId"),
      userId: c.req.query("userId") || c.req.param("userId"),
      userAgent: c.req.header("user-agent"),
      ipAddress: c.req.header("x-forwarded-for") || "unknown",
      method: c.req.method,
      path: c.req.url,
      severity: "high" as const,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    };

    // Track the error with healthcare context
    errorTracker.trackError(err, healthcareContext);

    // Determine status code based on error type
    let statusCode = 500;
    if (err instanceof HealthcareError) {
      switch (err.healthcareContext.severity) {
        case "low":
          statusCode = 400;
          break;
        case "medium":
          statusCode = 422;
          break;
        case "high":
          statusCode = 500;
          break;
        case "critical":
          statusCode = 503;
          break;
        default:
          statusCode = 500;
      }
    }

    // Create error response
    const errorResponse = {
      error: {
        type: err.name,
        message: err.message,
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    return c.json(errorResponse, statusCode);
  };
}
