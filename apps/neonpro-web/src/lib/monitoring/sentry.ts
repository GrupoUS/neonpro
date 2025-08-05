/**
 * Sentry Configuration for Healthcare Error Tracking
 * LGPD-compliant error monitoring
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Healthcare-specific configuration
    beforeSend(event) {
      // Remove sensitive healthcare data from errors
      if (event.request?.data) {
        // Remove patient PII
        delete event.request.data.cpf;
        delete event.request.data.patient_id;
        delete event.request.data.medical_record;
      }

      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      return event;
    },

    // Filter out non-critical errors
    beforeSendTransaction(event) {
      // Don't track health check endpoints
      if (event.transaction?.includes("/api/health")) {
        return null;
      }
      return event;
    },

    integrations: [
      new Sentry.BrowserTracing({
        // Don't track sensitive routes
        tracingOrigins: ["localhost", process.env.NEXTAUTH_URL || ""],
        routingInstrumentation: Sentry.nextRouterInstrumentation({
          instrumentNavigation: false, // Disable for privacy
        }),
      }),
    ],
  });
}

// Healthcare-specific error contexts
export function addHealthcareContext(context: {
  user_role?: string;
  department?: string;
  feature_used?: string;
}) {
  Sentry.setContext("healthcare", {
    user_role: context.user_role,
    department: context.department,
    feature_used: context.feature_used,
    timestamp: new Date().toISOString(),
  });
}

// LGPD-compliant error reporting
export function reportHealthcareError(
  error: Error,
  context?: {
    action?: string;
    module?: string;
    severity?: "low" | "medium" | "high" | "critical";
  },
) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setTag("healthcare_module", context.module);
      scope.setTag("healthcare_action", context.action);
      scope.setLevel(
        context.severity === "critical"
          ? "fatal"
          : context.severity === "high"
            ? "error"
            : context.severity === "medium"
              ? "warning"
              : "info",
      );
    }

    // Don't include user PII in error context
    scope.setUser({
      id: "healthcare_user", // Generic ID for privacy
    });

    Sentry.captureException(error);
  });
}
