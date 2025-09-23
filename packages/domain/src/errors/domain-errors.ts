/**
 * Base domain error class
 */
export class DomainError extends Error {
  protected _code: string;
  protected _statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this._code = code;
    this._statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  get code(): string {
    return this._code;
  }

  get statusCode(): number {
    return this._statusCode;
  }
}

/**
 * Patient domain errors
 */
export class PatientNotFoundError extends DomainError {
  constructor(patientId: string) {
    super(`Patient with ID ${patientId} not found`, "PATIENT_NOT_FOUND", 404);
  }
}

export class PatientValidationError extends DomainError {
  constructor(validationErrors: string[]) {
    super(
      `Patient validation failed: ${validationErrors.join(", ")}`,
      "PATIENT_VALIDATION_ERROR",
      400,
    );
  }
}

export class PatientAlreadyExistsError extends DomainError {
  constructor(
    identifier: string,
    identifierType: "id" | "medicalRecordNumber" | "cpf",
  ) {
    super(
      `Patient with ${identifierType} ${identifier} already exists`,
      "PATIENT_ALREADY_EXISTS",
      409,
    );
  }
}

/**
 * Appointment domain errors
 */
export class AppointmentNotFoundError extends DomainError {
  constructor(appointmentId: string) {
    super(
      `Appointment with ID ${appointmentId} not found`,
      "APPOINTMENT_NOT_FOUND",
      404,
    );
  }
}

export class AppointmentValidationError extends DomainError {
  constructor(validationErrors: string[]) {
    super(
      `Appointment validation failed: ${validationErrors.join(", ")}`,
      "APPOINTMENT_VALIDATION_ERROR",
      400,
    );
  }
}

export class AppointmentTimeConflictError extends DomainError {
  constructor(professionalId: string, startTime: string, endTime: string) {
    super(
      `Time conflict detected for professional ${professionalId} between ${startTime} and ${endTime}`,
      "APPOINTMENT_TIME_CONFLICT",
      409,
    );
  }
}

export class AppointmentAlreadyCancelledError extends DomainError {
  constructor(appointmentId: string) {
    super(
      `Appointment ${appointmentId} is already cancelled`,
      "APPOINTMENT_ALREADY_CANCELLED",
      400,
    );
  }
}

export class AppointmentInPastError extends DomainError {
  constructor(startTime: string) {
    super(
      `Cannot create or modify appointment in the past: ${startTime}`,
      "APPOINTMENT_IN_PAST",
      400,
    );
  }
}

/**
 * Consent domain errors
 */
export class ConsentNotFoundError extends DomainError {
  constructor(consentId: string) {
    super(`Consent with ID ${consentId} not found`, "CONSENT_NOT_FOUND", 404);
  }
}

export class ConsentValidationError extends DomainError {
  constructor(validationErrors: string[]) {
    super(
      `Consent validation failed: ${validationErrors.join(", ")}`,
      "CONSENT_VALIDATION_ERROR",
      400,
    );
  }
}

export class ConsentAlreadyRevokedError extends DomainError {
  constructor(consentId: string) {
    super(
      `Consent ${consentId} is already revoked`,
      "CONSENT_ALREADY_REVOKED",
      400,
    );
  }
}

export class ConsentExpiredError extends DomainError {
  constructor(consentId: string) {
    super(`Consent ${consentId} has expired`, "CONSENT_EXPIRED", 400);
  }
}

export class ConsentAlreadyExistsError extends DomainError {
  constructor(patientId: string, consentType: string) {
    super(
      `Patient ${patientId} already has active consent of type ${consentType}`,
      "CONSENT_ALREADY_EXISTS",
      409,
    );
  }
}

export class InsufficientConsentError extends DomainError {
  constructor(patientId: string, requiredDataTypes: string[]) {
    super(
      `Patient ${patientId} does not have sufficient consent for data types: ${requiredDataTypes.join(", ")}`,
      "INSUFFICIENT_CONSENT",
      403,
    );
  }
}

/**
 * Compliance domain errors
 */
export class ComplianceViolationError extends DomainError {
  constructor(violations: string[]) {
    super(
      `Compliance violations detected: ${violations.join(", ")}`,
      "COMPLIANCE_VIOLATION",
      403,
    );
  }
}

export class LGPDComplianceError extends DomainError {
  constructor(message: string) {
    super(`LGPD compliance error: ${message}`, "LGPD_COMPLIANCE_ERROR", 403);
  }
}

/**
 * Repository domain errors
 */
export class RepositoryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Repository error: ${message}`, "REPOSITORY_ERROR", 500);
    this.cause = originalError;
  }

  override get code(): string {
    return "REPOSITORY_ERROR";
  }
}

export class DatabaseConnectionError extends RepositoryError {
  constructor(originalError?: Error) {
    super("Database connection failed", originalError);
  }

  override get code(): string {
    return "DATABASE_CONNECTION_ERROR";
  }
}

export class QueryTimeoutError extends RepositoryError {
  constructor(query: string, timeoutMs: number) {
    super(`Query timeout after ${timeoutMs}ms: ${query}`);
  }

  override get code(): string {
    return "QUERY_TIMEOUT_ERROR";
  }
}

export class ConstraintViolationError extends RepositoryError {
  constructor(constraint: string, table: string) {
    super(`Constraint violation on ${table}: ${constraint}`);
  }

  override get code(): string {
    return "CONSTRAINT_VIOLATION_ERROR";
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends DomainError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTHENTICATION_ERROR", 401);
  }
}

export class AuthorizationError extends DomainError {
  constructor(message: string = "Authorization failed") {
    super(message, "AUTHORIZATION_ERROR", 403);
  }

  override get code(): string {
    return "AUTHORIZATION_ERROR";
  }
}

export class PermissionDeniedError extends AuthorizationError {
  constructor(permission: string, resource: string) {
    super(`Permission denied: ${permission} required for ${resource}`);
  }

  override get code(): string {
    return "PERMISSION_DENIED";
  }
}

/**
 * Validation utility for domain errors
 */
export class ValidationError extends DomainError {
  constructor(
    public readonly field: string,
    override readonly message: string,
    public readonly value?: any,
  ) {
    super(
      `Validation failed for field '${field}': ${message}`,
      "VALIDATION_ERROR",
      400,
    );
  }
}

/**
 * Aggregate validation errors
 */
export class AggregateValidationError extends DomainError {
  constructor(public readonly errors: ValidationError[]) {
    super(
      `Validation failed with ${errors.length} error(s): ${errors.map((e) => e.message).join(", ")}`,
      "AGGREGATE_VALIDATION_ERROR",
      400,
    );
  }
}

/**
 * Business rule violation errors
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string, message: string) {
    super(
      `Business rule violation: ${rule} - ${message}`,
      "BUSINESS_RULE_VIOLATION",
      400,
    );
  }
}
