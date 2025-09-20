/**
/**
 * Error tracking middleware for Hono
 * Integrates error tracking service with request handling
 * Enhanced with Sentry integration for advanced monitoring
 */

import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "../lib/logger";
import { errorTracker } from "../lib/sentry.js";

/**
 * Global error handler middleware
 * Catches all unhandled errors and reports them to error tracking service
 */
export function errorTrackingMiddleware() {
  return async (c: Context, next: Next): Promise<Response | undefined> => {
    try {
      await next();
      return; // Explicit return when no error
    } catch (error) {
      const context = errorTracker.extractContextFromHono(c);

      // Handle different error types
      if (error instanceof HTTPException) {
        // HTTP exceptions are usually expected (4xx) - log but don't track as errors
        const isClientError = error.status >= 400 && error.status < 500;
        const isServerError = error.status >= 500;

        if (isServerError) {
          // Server errors should be tracked
          errorTracker.captureException(error, {
            ...context,
            extra: {
              httpStatus: error.status,
              httpMessage: error.message,
            },
          });
        } else if (isClientError) {
          // Client errors are logged but not tracked as exceptions
          errorTracker.captureMessage(
            `Client error: ${error.status} - ${error.message}`,
            "warning",
            context,
          );
        }

        // Return appropriate error response
        return c.json(
          {
            error: {
              message: error.message,
              status: error.status,
              requestId: context.requestId,
            },
          },
          { status: error.status },
        );
      }

      // For all other errors (unexpected errors)
      errorTracker.captureException(error as Error, context);

      // Log error locally as well
      logger.error("Unhandled error caught by error tracking middleware", {
        ...context,
        error: {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      });

      // Return generic error response for security
      return c.json(
        {
          error: {
            message:
              process.env.NODE_ENV === "production"
                ? "Internal server error"
                : (error as Error).message,
            status: 500,
            requestId: context.requestId,
          },
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Request context middleware
 * Adds breadcrumbs and context for error tracking
 */
export function requestContextMiddleware() {
  return async (c: Context, next: Next) => {
    const context = errorTracker.extractContextFromHono(c);

    // Add breadcrumb for request start
    errorTracker.addBreadcrumb(
      `Request started: ${context.method} ${context.endpoint}`,
      "request",
      {
        method: context.method,
        endpoint: context.endpoint,
        userAgent: context.userAgent,
        ip: context.ip,
      },
    );

    try {
      await next();

      // Add breadcrumb for successful completion
      errorTracker.addBreadcrumb(
        `Request completed: ${context.method} ${context.endpoint}`,
        "request",
        {
          status: c.res.status,
          method: context.method,
          endpoint: context.endpoint,
        },
      );
    } catch {
      // Add breadcrumb for error
      errorTracker.addBreadcrumb(
        `Request failed: ${context.method} ${context.endpoint}`,
        "error",
        {
          error: (error as Error).message,
          method: context.method,
          endpoint: context.endpoint,
        },
      );

      throw error;
    }
  };
}

/**
 * Performance monitoring middleware
 * Tracks slow requests and performance issues
 */
export function performanceTrackingMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const context = errorTracker.extractContextFromHono(c);

    try {
      await next();

      const duration = Date.now() - startTime;
      const status = c.res.status;

      // Track slow requests as warnings
      if (duration > 5000) {
        errorTracker.captureMessage(
          `Slow request detected: ${context.method} ${context.endpoint}`,
          "warning",
          {
            ...context,
            extra: {
              duration,
              threshold: 5000,
              status,
            },
          },
        );
      }

      // Track very slow requests as errors
      if (duration > 30000) {
        errorTracker.captureMessage(
          `Very slow request: ${context.method} ${context.endpoint}`,
          "error",
          {
            ...context,
            extra: {
              duration,
              threshold: 30000,
              status,
            },
          },
        );
      }
    } catch (error) {
      // Log the error for observability
      logger.error("Error in performanceTrackingMiddleware:", error);
      errorTracker.captureException?.(error, {
        context: {
          ...context,
          middleware: "performanceTrackingMiddleware",
        },
      });
      throw error;
    }
  };
}

/**
 * Healthcare audit tracking middleware
 * Tracks healthcare-specific operations for compliance
 */
export function healthcareAuditTrackingMiddleware() {
  return async (c: Context, next: Next) => {
    const context = errorTracker.extractContextFromHono(c);

    // Check if this is a healthcare-related endpoint
    const isHealthcareEndpoint =
      context.endpoint.includes("/patients") ||
      context.endpoint.includes("/appointments") ||
      context.endpoint.includes("/medical-records") ||
      context.patientId ||
      context.clinicId;

    if (isHealthcareEndpoint) {
      // Add healthcare audit breadcrumb
      errorTracker.addBreadcrumb(
        `Healthcare operation: ${context.method} ${context.endpoint}`,
        "healthcare",
        {
          method: context.method,
          endpoint: context.endpoint,
          patientId: context.patientId ? "[PATIENT_ID]" : undefined, // Redacted for privacy
          clinicId: context.clinicId,
          userId: context.userId,
        },
      );

      // Track healthcare operations (for audit purposes)
      if (context.method !== "GET") {
        errorTracker.captureMessage(
          `Healthcare data operation: ${context.method} ${context.endpoint}`,
          "info",
          {
            ...context,
            extra: {
              operationType: context.method,
              hasPatientData: !!context.patientId,
              hasClinicData: !!context.clinicId,
            },
          },
        );
      }
    }

    await next();
  };
}

/**
 * Security event tracking middleware
 * Tracks security-related events and potential threats
 */
export function securityEventTrackingMiddleware() {
  return async (c: Context, next: Next) => {
    const context = errorTracker.extractContextFromHono(c);

    // Check for suspicious patterns
    const suspiciousPatterns = [
      { pattern: /\.\./g, name: "path_traversal" },
      { pattern: /<script/gi, name: "xss_attempt" },
      { pattern: /union.*select/gi, name: "sql_injection" },
      { pattern: /drop.*table/gi, name: "sql_injection" },
      { pattern: /\bor\b.*\b1\s*=\s*1\b/gi, name: "sql_injection" },
      { pattern: /javascript:/gi, name: "javascript_injection" },
      { pattern: /vbscript:/gi, name: "vbscript_injection" },
    ];

    const path = context.endpoint;
    const query = c.req.url.split("?")[1] || "";
    const userAgent = context.userAgent || "";

    for (const { pattern, name } of suspiciousPatterns) {
      if (
        pattern.test(path) ||
        pattern.test(query) ||
        pattern.test(userAgent)
      ) {
        // Track security event
        errorTracker.captureMessage(
          `Security threat detected: ${name}`,
          "warning",
          {
            ...context,
            extra: {
              threatType: name,
              pattern: pattern.toString(),
              suspiciousContent: {
                path: path.replace(pattern, "[REDACTED]"),
                query: query.replace(pattern, "[REDACTED]"),
                userAgent: userAgent.replace(pattern, "[REDACTED]"),
              },
            },
          },
        );

        // Add security breadcrumb
        errorTracker.addBreadcrumb(
          `Security threat detected: ${name}`,
          "security",
          {
            threatType: name,
            endpoint: context.endpoint,
            method: context.method,
          },
        );

        break;
      }
    }

    // Track failed authentication attempts
    if (context.endpoint.includes("/auth/") && c.res?.status === 401) {
      errorTracker.captureMessage("Failed authentication attempt", "warning", {
        ...context,
        extra: {
          endpoint: context.endpoint,
          ip: context.ip,
          userAgent: context.userAgent,
        },
      });
    }

    await next();
  };
}

/**
 * Error response formatter
 * Creates consistent error responses with tracking information
 */
export function formatErrorResponse(
  error: Error | HTTPException,
  requestId: string,
  isProduction: boolean = false,
) {
  if (error instanceof HTTPException) {
    return {
      error: {
        message: error.message,
        status: error.status,
        requestId,
        ...(isProduction ? {} : { cause: (error as any).cause || null }),
      },
    };
  }

  return {
    error: {
      message: isProduction ? "Internal server error" : error.message,
      status: 500,
      requestId,
      ...(isProduction
        ? {}
        : {
            name: error.name,
            stack: error.stack?.split("\n").slice(0, 3), // Limit stack trace
          }),
    },
  };
}

/**
 * Initialize error tracking middleware stack
 * Returns middleware array in correct order
 */
export function getErrorTrackingMiddlewareStack() {
  return [
    requestContextMiddleware(),
    performanceTrackingMiddleware(),
    healthcareAuditTrackingMiddleware(),
    securityEventTrackingMiddleware(),
    errorTrackingMiddleware(), // Should be last to catch all errors
  ];
}
