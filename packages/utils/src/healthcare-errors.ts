/**
 * Healthcare Errors Module
 * Specialized error handling for healthcare applications with LGPD/ANVISA/CFM compliance
 *
 * Features:
 * - Healthcare-specific error categorization
 * - LGPD compliant error messages (no personal data exposure)
 * - Brazilian healthcare regulation compliance (ANVISA, CFM)
 * - Error sanitization and audit trail support
 * - Structured error handling with severity levels
 */

// Error severity levels
import { TRPCError } from "@trpc/server";
import type { TRPCError as TRPCErrorType } from "@trpc/server";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  BUSINESS_LOGIC = "business_logic",
  EXTERNAL_SERVICE = "external_service",
  DATABASE = "database",
  NETWORK = "network",
  SYSTEM = "system",
  LGPD_COMPLIANCE = "lgpd_compliance",
  HEALTHCARE_COMPLIANCE = "healthcare_compliance",
  AI_SERVICE = "ai_service",
}

// Personal data patterns for sanitization
const PERSONAL_DATA_PATTERNS = [
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF pattern
  /\b[\w.-]+@[\w.-]+\.\w+\b/g, // Email pattern
  /\(\d{2}\)\s?\d{4,5}-?\d{4}/g, // Phone pattern
  /\b\d{15}\b/g, // SUS card pattern
  /\b[A-Z]{2}\d{6}\b/g, // CRM pattern (UF + number)
];

/**
 * Base healthcare error class with compliance features
 */
export class HealthcareError extends Error {
  public readonly id: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly healthcareContext: boolean;
  public readonly lgpdCompliant: boolean;
  public readonly timestamp: Date;
  public readonly metadata?: Record<string, unknown>;
  public override readonly cause?: Error | undefined;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: {
      code?: string;
      metadata?: Record<string, unknown>;
      cause?: Error;
    } = {},
  ) {
    super(message);
    this.name = "HealthcareError";

    this.id = crypto.randomUUID();
    this.category = category;
    this.severity = severity;
    this.code = options.code || "HEALTHCARE_ERROR";
    this.healthcareContext = true;
    this.lgpdCompliant = this.checkLGPDCompliance(message);
    this.timestamp = new Date();
    this.metadata = options.metadata;
    this.cause = options.cause;
  }

  /**
   * Check if error message is LGPD compliant
   */
  private checkLGPDCompliance(message: string): boolean {
    return !PERSONAL_DATA_PATTERNS.some((pattern) => pattern.test(message));
  }

  /**
   * Get audit trail information
   */
  public getAuditInfo() {
    return {
      errorId: this.id,
      category: this.category,
      severity: this.severity,
      healthcareContext: this.healthcareContext,
      lgpdCompliant: this.lgpdCompliant,
      timestamp: this.timestamp,
      code: this.code,
    };
  }

  /**
   * Serialize error for logging
   */
  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      code: this.code,
      healthcareContext: this.healthcareContext,
      lgpdCompliant: this.lgpdCompliant,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}

/**
 * Healthcare validation error with detailed field information
 */
export class HealthcareValidationError extends HealthcareError {
  public readonly validationDetails: Array<{
    field: string;
    message: string;
    code: string;
  }>;

  constructor(
    message: string,
    validationDetails: Array<{
      field: string;
      message: string;
      code: string;
    }> = [],
  ) {
    super(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, {
      code: "VALIDATION_ERROR",
    });
    this.name = "HealthcareValidationError";
    this.validationDetails = validationDetails;
  }
}

/**
 * Healthcare authentication error
 */
export class HealthcareAuthenticationError extends HealthcareError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, {
      code: "AUTHENTICATION_FAILED",
      metadata,
    });
    this.name = "HealthcareAuthenticationError";
  }
}

/**
 * Healthcare authorization error
 */
export class HealthcareAuthorizationError extends HealthcareError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, ErrorCategory.AUTHORIZATION, ErrorSeverity.HIGH, {
      code: "INSUFFICIENT_PERMISSIONS_",
      metadata,
    });
    this.name = "HealthcareAuthorizationError";
  }
}

/**
 * Healthcare compliance error for regulatory violations
 */
export class HealthcareComplianceError extends HealthcareError {
  public readonly complianceFramework: "lgpd" | "anvisa" | "cfm";

  constructor(
    message: string,
    complianceFramework: "lgpd" | "anvisa" | "cfm",
    metadata?: Record<string, unknown>,
  ) {
    // Map compliance frameworks to specific error categories
    const category =
      complianceFramework === "lgpd"
        ? ErrorCategory.LGPD_COMPLIANCE
        : ErrorCategory.HEALTHCARE_COMPLIANCE;

    super(message, category, ErrorSeverity.CRITICAL, {
      code: `${complianceFramework.toUpperCase()}_VIOLATION`,
      metadata,
    });
    this.name = "HealthcareComplianceError";
    this.complianceFramework = complianceFramework;
  }
}

/**
 * Healthcare system error
 */
export class HealthcareSystemError extends HealthcareError {
  constructor(
    message: string,
    cause?: Error,
    metadata?: Record<string, unknown>,
  ) {
    super(message, ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL, {
      code: "SYSTEM_ERROR_",
      cause,
      metadata,
    });
    this.name = "HealthcareSystemError";
  }
}

/**
 * Create a healthcare error with proper defaults
 */
export function createHealthcareError(
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  options: {
    code?: string;
    metadata?: Record<string, unknown>;
    cause?: Error;
  } = {},
): HealthcareError {
  return new HealthcareError(message, category, severity, options);
}

/**
 * Format healthcare error for user consumption
 */
export function formatHealthcareError(
  error: HealthcareError,
  options: {
    includeStack?: boolean;
    sanitizePersonalData?: boolean;
  } = {},
): {
  id: string;
  message: string;
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  stack?: string;
} {
  const { includeStack = false, sanitizePersonalData = true } = options;

  let message = error.message;
  if (sanitizePersonalData && !error.lgpdCompliant) {
    message = sanitizeErrorMessage(message);
  }

  const formatted: {
    id: string;
    message: string;
    code: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    timestamp: string;
    stack?: string;
  } = {
    id: error.id,
    message,
    code: error.code,
    category: error.category,
    severity: error.severity,
    timestamp: error.timestamp.toISOString(),
  };

  if (includeStack && error.stack) {
    formatted.stack = error.stack;
  }

  return formatted;
}

/**
 * Check if an error is a healthcare error
 */
export function isHealthcareError(error: unknown): error is HealthcareError {
  return error instanceof HealthcareError;
}

/**
 * Sanitize error message to remove personal data
 */
export function sanitizeErrorMessage(message: string): string {
  let sanitized = message;

  // Replace personal data patterns with placeholders
  PERSONAL_DATA_PATTERNS.forEach((pattern, index) => {
    sanitized = sanitized.replace(pattern, `[REDACTED_${index}]`);
  });

  return sanitized;
}

/**
 * Validate error compliance with specific framework
 */
export function validateErrorCompliance(
  error: HealthcareError,
  framework: "lgpd" | "anvisa" | "cfm",
): boolean {
  switch (framework) {
    case "lgpd":
      return error.lgpdCompliant;

    case "anvisa":
      // ANVISA compliance: check if error relates to medication/procedure standards
      return (
        error.category === ErrorCategory.HEALTHCARE_COMPLIANCE ||
        error.message.toLowerCase().includes("medication") ||
        error.message.toLowerCase().includes("procedure") ||
        error.message.toLowerCase().includes("protocol")
      );

    case "cfm":
      // CFM compliance: check if error relates to professional ethics
      return (
        error.category === ErrorCategory.HEALTHCARE_COMPLIANCE ||
        error.message.toLowerCase().includes("professional") ||
        error.message.toLowerCase().includes("ethics") ||
        error.message.toLowerCase().includes("conduct")
      );

    default:
      throw new Error(`Unknown compliance framework: ${framework}`);
  }
}

/**
 * Healthcare-specific error factory functions
 */
export const _HealthcareErrors = {
  patientNotFound: (patientId?: string) =>
    new HealthcareError(
      "Patient not found",
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.MEDIUM,
      { code: "PATIENT_NOT_FOUND_", metadata: { patientId } },
    ),

  appointmentConflict: (appointmentId?: string) =>
    new HealthcareError(
      "Appointment conflict detected",
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.MEDIUM,
      { code: "APPOINTMENT_CONFLICT_", metadata: { appointmentId } },
    ),

  medicalRecordAccessDenied: (recordId?: string) =>
    new HealthcareError(
      "Medical record access denied",
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.HIGH,
      { code: "RECORD_ACCESS_DENIED_", metadata: { recordId } },
    ),

  crmVerificationFailed: (crmNumber?: string) =>
    new HealthcareError(
      "CRM verification failed",
      ErrorCategory.HEALTHCARE_COMPLIANCE,
      ErrorSeverity.HIGH,
      { code: "INVALID_CRM_", metadata: { crmNumber } },
    ),

  lgpdConsentRequired: (dataType: string) =>
    new HealthcareComplianceError(
      "LGPD consent required for data processing",
      "lgpd",
      { dataType },
    ),

  anvisaRegulationViolation: (regulation: string, violation: string) =>
    new HealthcareComplianceError("ANVISA regulation violation", "anvisa", {
      regulation,
      violation,
    }),

  cfmEthicalViolation: (ethicalCode: string, violation: string) =>
    new HealthcareComplianceError("CFM ethical violation", "cfm", {
      ethicalCode,
      violation,
    }),
};
/**
 * Healthcare-specific tRPC error that combines TRPCError with healthcare compliance
 */
export class HealthcareTRPCError extends TRPCError {
  public readonly healthcareContext: boolean = true;
  public readonly lgpdCompliant: boolean;
  public readonly timestamp: Date;
  public readonly id: string;
  public readonly healthcareCode?: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    code: TRPCErrorType["code"],
    message: string,
    healthcareCode?: string,
    metadata?: Record<string, unknown>,
  ) {
    super({ code, message });

    this.id = crypto.randomUUID();
    this.timestamp = new Date();
    this.healthcareCode = healthcareCode;
    this.metadata = metadata;
    this.lgpdCompliant = this.checkLGPDCompliance(message);
  }

  /**
   * Get audit trail information
   */
  public getAuditInfo() {
    return {
      errorId: this.id,
      code: this.code,
      healthcareCode: this.healthcareCode,
      healthcareContext: this.healthcareContext,
      lgpdCompliant: this.lgpdCompliant,
      timestamp: this.timestamp,
      metadata: this.metadata,
    };
  }

  /**
   * Check if error message is LGPD compliant
   */
  private checkLGPDCompliance(message: string): boolean {
    return !PERSONAL_DATA_PATTERNS.some((pattern) => pattern.test(message));
  }

  /**
   * Serialize error for logging
   */
  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      code: this.code,
      healthcareCode: this.healthcareCode,
      healthcareContext: this.healthcareContext,
      lgpdCompliant: this.lgpdCompliant,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}
