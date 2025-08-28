import type { ErrorHandlingStrategy } from "./healthcare-error-types";
import { ErrorCategory } from "./healthcare-error-types";

/**
 * Error handling strategies for each error category
 * Defines how different types of errors should be handled in healthcare context
 */
export const errorHandlingStrategies: Record<
  ErrorCategory,
  ErrorHandlingStrategy
> = {
  [ErrorCategory.VALIDATION]: {
    strategy: "immediate_user_feedback",
    retry: false,
    logging: "info",
    notification: "user_only",
  },

  [ErrorCategory.AUTHENTICATION]: {
    strategy: "immediate_user_feedback",
    retry: false,
    logging: "warn",
    notification: "user_only",
    auditTrail: true,
  },

  [ErrorCategory.AUTHORIZATION]: {
    strategy: "immediate_escalation",
    retry: false,
    logging: "error",
    notification: "admin_alert",
    auditTrail: true,
  },

  [ErrorCategory.DATABASE]: {
    strategy: "exponential_backoff_retry",
    retry: true,
    maxRetries: 3,
    logging: "error",
    notification: "admin_alert",
    fallback: "cache_or_offline_mode",
  },

  [ErrorCategory.EXTERNAL_API]: {
    strategy: "exponential_backoff_retry",
    retry: true,
    maxRetries: 5,
    logging: "warn",
    notification: "admin_alert",
    fallback: "graceful_degradation",
  },
  [ErrorCategory.BUSINESS_LOGIC]: {
    strategy: "immediate_user_feedback",
    retry: false,
    logging: "warn",
    notification: "user_only",
  },

  [ErrorCategory.SYSTEM]: {
    strategy: "immediate_escalation",
    retry: false,
    logging: "critical",
    notification: "admin_alert",
  },

  [ErrorCategory.COMPLIANCE]: {
    strategy: "immediate_escalation",
    retry: false,
    logging: "critical",
    notification: "compliance_officer",
    auditTrail: true,
  },

  [ErrorCategory.PATIENT_DATA]: {
    strategy: "immediate_escalation",
    retry: false,
    logging: "critical",
    notification: "security_team",
    auditTrail: true,
  },

  [ErrorCategory.AUDIT_LOG]: {
    strategy: "immediate_escalation",
    retry: false,
    logging: "critical",
    notification: "compliance_officer",
    auditTrail: true,
  },
};
