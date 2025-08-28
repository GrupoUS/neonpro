import { errorHandlingStrategies } from "./error-strategies";
import type { ErrorContext, HealthcareError } from "./healthcare-error-types";
import { ErrorCategory, ErrorSeverity } from "./healthcare-error-types";

/**
 * Generates a unique error ID for tracking
 */
export function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Categorizes errors based on their type and context
 */
export function categorizeError(
  error: Error,
  context?: ErrorContext,
): ErrorCategory {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || "";

  // Authentication errors
  if (
    message.includes("unauthorized")
    || message.includes("invalid token")
    || message.includes("authentication failed")
  ) {
    return ErrorCategory.AUTHENTICATION;
  }

  // Authorization errors
  if (
    message.includes("forbidden")
    || message.includes("permission denied")
    || message.includes("access denied")
  ) {
    return ErrorCategory.AUTHORIZATION;
  }

  // Database errors
  if (
    message.includes("connection")
    || message.includes("database")
    || message.includes("query")
    || stack.includes("supabase")
  ) {
    return ErrorCategory.DATABASE;
  }

  // Validation errors
  if (
    message.includes("validation")
    || message.includes("invalid")
    || message.includes("required")
    || stack.includes("zod")
  ) {
    return ErrorCategory.VALIDATION;
  }

  // Patient data errors (high priority for healthcare)
  if (
    context?.patientId
    || message.includes("patient")
    || message.includes("medical")
    || message.includes("clinical")
  ) {
    return ErrorCategory.PATIENT_DATA;
  }

  // LGPD compliance errors
  if (
    message.includes("lgpd")
    || message.includes("consent")
    || message.includes("gdpr")
    || message.includes("privacy")
  ) {
    return ErrorCategory.COMPLIANCE;
  }

  // External API errors
  if (
    message.includes("network")
    || message.includes("fetch")
    || message.includes("timeout")
    || message.includes("api")
  ) {
    return ErrorCategory.EXTERNAL_API;
  }

  // System errors
  if (
    message.includes("memory")
    || message.includes("cpu")
    || message.includes("disk")
    || message.includes("system")
  ) {
    return ErrorCategory.SYSTEM;
  }

  // Default to business logic
  return ErrorCategory.BUSINESS_LOGIC;
} /**
 * Assesses the severity of an error based on category and context
 */

export function assessSeverity(
  error: Error,
  category: ErrorCategory,
  context?: ErrorContext,
): ErrorSeverity {
  // Critical severity for certain categories
  if (
    category === ErrorCategory.COMPLIANCE
    || category === ErrorCategory.PATIENT_DATA
    || category === ErrorCategory.AUDIT_LOG
  ) {
    return ErrorSeverity.CRITICAL;
  }

  // High severity for system and authentication issues
  if (
    category === ErrorCategory.SYSTEM
    || category === ErrorCategory.AUTHENTICATION
    || category === ErrorCategory.AUTHORIZATION
  ) {
    return ErrorSeverity.HIGH;
  }

  // Medium severity for database and external API
  if (
    category === ErrorCategory.DATABASE
    || category === ErrorCategory.EXTERNAL_API
  ) {
    return ErrorSeverity.MEDIUM;
  }

  // Patient context increases severity
  if (context?.patientId) {
    return ErrorSeverity.HIGH;
  }

  // Default to low severity
  return ErrorSeverity.LOW;
}

/**
 * Checks if patient data is involved in the error
 */
export function checkPatientDataInvolvement(
  error: Error,
  context?: ErrorContext,
): boolean {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || "";

  return !!(
    context?.patientId
    || message.includes("patient")
    || message.includes("medical")
    || message.includes("clinical")
    || stack.includes("patient")
    || context?.endpoint?.includes("patient")
  );
}

/**
 * Creates a standardized healthcare error
 */
export function createHealthcareError(
  error: Error,
  context: ErrorContext = {},
): HealthcareError {
  const category = categorizeError(error, context);
  const severity = assessSeverity(error, category, context);
  const patientImpact = checkPatientDataInvolvement(error, context);
  const complianceRisk = category === ErrorCategory.COMPLIANCE
    || category === ErrorCategory.PATIENT_DATA
    || patientImpact;

  const healthcareError: HealthcareError = {
    id: generateErrorId(),
    category,
    severity,
    message: error.message,
    context,
    patientImpact,
    complianceRisk,
    recoverable: errorHandlingStrategies[category].retry,
    timestamp: new Date(),
    originalError: error,
  };

  if (error.stack) {
    healthcareError.stack = error.stack;
  }

  return healthcareError;
}
