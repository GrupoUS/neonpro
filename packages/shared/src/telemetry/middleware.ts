/**
 * Healthcare-compliant telemetry middleware for API routes
 * Integrates with Hono.js for automatic tracing and monitoring
 */

import type { Context, Next } from "hono";
import { getGlobalTelemetryManager, HealthcareOperations } from "./index";
import {
  DataClassification,
  ComplianceLevel,
  HealthcareOperationType,
} from "./types";

// Extract healthcare context from request
function extractHealthcareContext(
  c: Context,
): Record<string, string | number | boolean> {
  const headers = c.req.header();
  const url = c.req.url;
  const method = c.req.method;

  // Determine if this is a patient data operation
  const isPatientDataInvolved =
    url.includes("/patient") ||
    url.includes("/medical-record") ||
    url.includes("/appointment") ||
    url.includes("/prescription");

  // Determine compliance level based on route
  let complianceLevel: ComplianceLevel = ComplianceLevel.PUBLIC;
  if (url.includes("/admin") || url.includes("/internal")) {
    complianceLevel = ComplianceLevel.INTERNAL;
  }
  if (isPatientDataInvolved || url.includes("/sensitive")) {
    complianceLevel = ComplianceLevel.SENSITIVE;
  }

  // Determine operation type
  let operationType: HealthcareOperationType = HealthcareOperationType.READ;
  switch (method.toUpperCase()) {
    case "POST":
      operationType = HealthcareOperationType.WRITE;
      break;
    case "PUT":
    case "PATCH":
      operationType = HealthcareOperationType.UPDATE;
      break;
    case "DELETE":
      operationType = HealthcareOperationType.DELETE;
      break;
    case "GET":
    default:
      operationType = HealthcareOperationType.READ;
      break;
  }

  return {
    "healthcare.clinic_id": headers["x-clinic-id"] || "unknown",
    "healthcare.user_id": headers["x-user-id"] || "anonymous",
    "healthcare.feature": extractFeatureFromUrl(url),
    "healthcare.patient_data_involved": isPatientDataInvolved,
    "healthcare.compliance_level": complianceLevel,
    "healthcare.operation_type": operationType,
    "healthcare.data_classification": isPatientDataInvolved
      ? "medical"
      : "personal",
  };
}

// Extract feature name from URL
function extractFeatureFromUrl(url: string): string {
  const path = new URL(url).pathname;
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return "home";

  // Map API endpoints to features
  const featureMap: Record<string, string> = {
    patient: "patient_management",
    appointment: "appointment_scheduling",
    "medical-record": "medical_records",
    prescription: "prescription_management",
    clinic: "clinic_management",
    user: "user_management",
    auth: "authentication",
    dashboard: "dashboard",
    reports: "reporting",
    billing: "billing",
    admin: "administration",
  };

  return featureMap[segments[0]] || segments[0];
}

// Healthcare-aware telemetry middleware
export function healthcareTelemetryMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const url = c.req.url;
    const method = c.req.method;
    const healthcareContext = extractHealthcareContext(c);

    try {
      // Trace the API operation
      const telemetryManager = getGlobalTelemetryManager();
      if (telemetryManager) {
        const span = telemetryManager.createHealthcareSpan(
          url,
          HealthcareOperations.PATIENT_DATA_READ,
          healthcareContext,
        );
        try {
          await next();
          span.end();
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({
            code: 2,
            message: error instanceof Error ? error.message : "Unknown error",
          });
          span.end();
          throw error;
        }
      } else {
        // Fallback if telemetry is not initialized
        await next();
      }

      // Record metrics
      const duration = Date.now() - startTime;
      recordApiMetrics(c, duration, healthcareContext);
    } catch (error) {
      // Record error metrics
      const duration = Date.now() - startTime;
      recordApiError(c, error as Error, duration, healthcareContext);
      throw error;
    }
  };
}

// Record API metrics
function recordApiMetrics(
  c: Context,
  duration: number,
  _context: Record<string, string | number | boolean>,
) {
  // Only record metrics in production or when enabled
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_METRICS !== "true"
  ) {
    return;
  }

  try {
    const { metrics } = require("@opentelemetry/api");
    const meter = metrics.getMeter("healthcare-api-metrics");

    // Request duration histogram
    const requestDuration = meter.createHistogram("api_request_duration_ms", {
      description: "API request duration in milliseconds",
      unit: "ms",
    });

    // Request counter
    const requestTotal = meter.createCounter("api_requests_total", {
      description: "Total number of API requests",
    });

    // Labels for metrics
    const labels = {
      method: c.req.method,
      status_code: c.res.status.toString(),
      feature: _context["healthcare.feature"] || "unknown",
      compliance_level: _context["healthcare.compliance_level"] || "public",
      patient_data_involved:
        _context["healthcare.patient_data_involved"]?.toString() || "false",
    };

    requestDuration.record(duration, labels);
    requestTotal.add(1, labels);

    // Healthcare-specific metrics
    if (_context["healthcare.patient_data_involved"]) {
      const patientDataAccess = meter.createCounter(
        "patient_data_access_total",
        {
          description: "Total patient data access operations",
        },
      );
      patientDataAccess.add(1, {
        operation_type: _context["healthcare.operation_type"] || "read",
        clinic_id: _context["healthcare.clinic_id"] || "unknown",
      });
    }
  } catch (error) {
    // Silently fail metric recording to not impact application
    console.warn("Failed to record telemetry metrics:", error);
  }
}

// Record API errors
function recordApiError(
  c: Context,
  error: Error,
  duration: number,
  _context: Record<string, string | number | boolean>,
) {
  try {
    const { metrics } = require("@opentelemetry/api");
    const meter = metrics.getMeter("healthcare-api-metrics");

    // Error counter
    const errorTotal = meter.createCounter("api_errors_total", {
      description: "Total number of API errors",
    });

    const labels = {
      method: c.req.method,
      feature: _context["healthcare.feature"] || "unknown",
      error_type: error.constructor.name,
      compliance_level: _context["healthcare.compliance_level"] || "public",
    };

    errorTotal.add(1, labels);
  } catch (metricError) {
    console.warn("Failed to record error metrics:", metricError);
  }
}

// Middleware for compliance audit logging
export function complianceAuditMiddleware() {
  return async (c: Context, next: Next) => {
    const healthcareContext = extractHealthcareContext(c);

    // Only audit sensitive operations
    if (
      healthcareContext["healthcare.compliance_level"] === "sensitive" ||
      healthcareContext["healthcare.patient_data_involved"]
    ) {
      const auditEvent = {
        timestamp: new Date().toISOString(),
        method: c.req.method,
        url: sanitizeUrlForAudit(c.req.url),
        user_id: healthcareContext["healthcare.user_id"] || "anonymous",
        clinic_id: healthcareContext["healthcare.clinic_id"] || "unknown",
        operation_type: healthcareContext["healthcare.operation_type"],
        data_classification:
          healthcareContext["healthcare.data_classification"],
        user_agent: c.req.header("user-agent"),
        ip_address: getClientIp(c),
      };

      // Log audit event (this would typically go to a secure audit log system)
      console.log("[HEALTHCARE_AUDIT]", JSON.stringify(auditEvent));
    }

    await next();
  };
}

// Sanitize URL for audit logging
function sanitizeUrlForAudit(url: string): string {
  return url
    .replace(/\/patient\/[a-zA-Z0-9-]+/g, "/patient/[ID]")
    .replace(/\/clinic\/[a-zA-Z0-9-]+/g, "/clinic/[ID]")
    .replace(/\/appointment\/[a-zA-Z0-9-]+/g, "/appointment/[ID]")
    .replace(/\/medical-record\/[a-zA-Z0-9-]+/g, "/medical-record/[ID]")
    .replace(/[?&](cpf|rg|email|phone)=[^&]*/gi, "&$1=[REDACTED]");
}

// Get client IP address
function getClientIp(c: Context): string {
  return (
    c.req.header("x-forwarded-for") ||
    c.req.header("x-real-ip") ||
    c.req.header("cf-connecting-ip") ||
    "unknown"
  );
}

// Export middleware functions
export {
  extractHealthcareContext,
  extractFeatureFromUrl,
  recordApiMetrics,
  recordApiError,
};
