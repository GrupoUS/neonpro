"use strict";
/**
 * Sentry Configuration for Healthcare Error Tracking
 * LGPD-compliant error monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSentry = initSentry;
exports.addHealthcareContext = addHealthcareContext;
exports.reportHealthcareError = reportHealthcareError;
var Sentry = require("@sentry/nextjs");
var SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured");
    return;
  }
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Healthcare-specific configuration
    beforeSend: function (event) {
      var _a, _b;
      // Remove sensitive healthcare data from errors
      if ((_a = event.request) === null || _a === void 0 ? void 0 : _a.data) {
        // Remove patient PII
        delete event.request.data.cpf;
        delete event.request.data.patient_id;
        delete event.request.data.medical_record;
      }
      // Remove sensitive headers
      if ((_b = event.request) === null || _b === void 0 ? void 0 : _b.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
    // Filter out non-critical errors
    beforeSendTransaction: function (event) {
      var _a;
      // Don't track health check endpoints
      if (
        (_a = event.transaction) === null || _a === void 0 ? void 0 : _a.includes("/api/health")
      ) {
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
function addHealthcareContext(context) {
  Sentry.setContext("healthcare", {
    user_role: context.user_role,
    department: context.department,
    feature_used: context.feature_used,
    timestamp: new Date().toISOString(),
  });
}
// LGPD-compliant error reporting
function reportHealthcareError(error, context) {
  Sentry.withScope(function (scope) {
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
