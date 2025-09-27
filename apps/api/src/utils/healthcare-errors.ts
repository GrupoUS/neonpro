/**
 * Healthcare-Specific Error Handling and Logging
 *
 * Comprehensive error handling system for healthcare operations including:
 * - Healthcare-specific error types and codes
 * - LGPD compliance error handling
 * - Brazilian regulatory compliance errors (ANVISA, CFM)
 * - Audit trail integration for errors
 * - Structured logging with PII sanitization
 * - Error monitoring and alerting integration
 */

import { type HealthcarePrismaClient } from '../clients/prisma.js'
import { HealthcareLogger } from '../logging/healthcare-logger.js'

// Healthcare error severity levels
export enum HealthcareErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Healthcare error categories
export enum HealthcareErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  COMPLIANCE = 'compliance',
  DATA_INTEGRITY = 'data_integrity',
  SYSTEM = 'system',
  NETWORK = 'network',
  EXTERNAL_SERVICE = 'external_service',
}

// Base healthcare error interface
export interface HealthcareErrorDetails {
  code: string
  category: HealthcareErrorCategory
  severity: HealthcareErrorSeverity
  message: string
  details?: Record<string, unknown>
  _userId?: string
  clinicId?: string
  patientId?: string
  resourceType?: string
  resourceId?: string
  timestamp: Date
  stackTrace?: string
  requestId?: string
  ipAddress?: string
  userAgent?: string
}

// Base healthcare error class
export class HealthcareError extends Error {
  public readonly code: string
  public readonly category: HealthcareErrorCategory
  public readonly severity: HealthcareErrorSeverity
  public readonly details?: Record<string, unknown>
  public readonly _userId?: string
  public readonly clinicId?: string
  public readonly patientId?: string
  public readonly resourceType?: string
  public readonly resourceId?: string
  public readonly timestamp: Date
  public readonly requestId?: string
  public readonly ipAddress?: string
  public readonly userAgent?: string

  constructor(
    code: string,
    category: string,
    severity: string,
    message: string,
    details?: Record<string, unknown>,
    _context?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'HealthcareError'
    this.code = code
    this.category = category
    this.severity = severity
    this.details = details
    this.timestamp = new Date()
    if (_context) {
      this._userId = _context._userId
      this.clinicId = _context.clinicId
      this.patientId = _context.patientId
      this.resourceType = _context.resourceType
      this.resourceId = _context.resourceId
      this.requestId = _context.requestId
      this.ipAddress = _context.ipAddress
      this.userAgent = _context.userAgent
    }
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HealthcareError)
    }
  }

  private isSensitiveField(key: string): boolean {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'cpf',
      'cnpj',
      'email',
      'phone',
      'address',
      'ssn',
    ]
    return sensitiveFields.some(field => key.toLowerCase().includes(field))
  }

  private sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(details)) {
      if (typeof value === 'string' && this.isSensitiveField(key)) {
        sanitized[key] = '[SANITIZED]'
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      severity: this.severity,
      message: this.message,
      details: this.details,
      _userId: this._userId,
      clinicId: this.clinicId,
      patientId: this.patientId,
      resourceType: this.resourceType,
      resourceId: this.resourceId,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
      stack: this.stack,
    }
  }

  public toSanitizedJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp,
      requestId: this.requestId,
      details: this.sanitizeDetails(this.details || {}),
    }
  }
}

// Authentication errors
export class HealthcareAuthenticationError extends HealthcareError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    _context?: Record<string, unknown>,
  ) {
    super(
      'HEALTHCARE_AUTH_ERROR',
      HealthcareErrorCategory.AUTHENTICATION,
      HealthcareErrorSeverity.HIGH,
      message,
      details,
      _context,
    )
    this.name = 'HealthcareAuthenticationError'
  }
}

// Authorization errors
export class HealthcareAuthorizationError extends HealthcareError {
  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string,
    _context?: Record<string, unknown>,
  ) {
    super(
      'HEALTHCARE_AUTHZ_ERROR',
      HealthcareErrorCategory.AUTHORIZATION,
      HealthcareErrorSeverity.HIGH,
      message,
      { resourceType, resourceId },
      _context,
    )
    this.name = 'HealthcareAuthorizationError'
  }
}

// LGPD compliance errors
export class LGPDComplianceError extends HealthcareError {
  public readonly lgpdArticle?: string
  public readonly dataCategory?: string

  constructor(
    message: string,
    lgpdArticle?: string,
    dataCategory?: string,
    _context?: Record<string, unknown>,
  ) {
    super(
      'LGPD_COMPLIANCE_ERROR',
      HealthcareErrorCategory.COMPLIANCE,
      HealthcareErrorSeverity.CRITICAL,
      message,
      { lgpdArticle, dataCategory },
      _context,
    )
    this.name = 'LGPDComplianceError'
    this.lgpdArticle = lgpdArticle
    this.dataCategory = dataCategory
  }
}

// Brazilian healthcare regulatory errors
export class BrazilianRegulatoryError extends HealthcareError {
  public readonly regulatoryBody: 'ANVISA' | 'CFM' | 'CFF' | 'CREF'
  public readonly regulation?: string

  constructor(
    message: string,
    regulatoryBody: 'ANVISA' | 'CFM' | 'CFF' | 'CREF',
    regulation?: string,
    _context?: Record<string, unknown>,
  ) {
    super(
      `${regulatoryBody}_COMPLIANCE_ERROR`,
      HealthcareErrorCategory.COMPLIANCE,
      HealthcareErrorSeverity.HIGH,
      message,
      { regulatoryBody, regulation },
      _context,
    )
    this.name = 'BrazilianRegulatoryError'
    this.regulatoryBody = regulatoryBody
    this.regulation = regulation
  }
}

// Patient data validation errors
export class PatientDataValidationError extends HealthcareError {
  public readonly validationErrors: Array<{
    field: string
    message: string
    value?: unknown
  }>

  constructor(
    validationErrors: Array<{ field: string; message: string; value?: unknown }>,
    _context?: Record<string, unknown>,
  ) {
    const message = `Patient data validation failed: ${
      validationErrors.map(e => e.field).join(', ')
    }`
    super(
      'PATIENT_DATA_VALIDATION_ERROR',
      HealthcareErrorCategory.VALIDATION,
      HealthcareErrorSeverity.MEDIUM,
      message,
      { validationErrors },
      _context,
    )
    this.name = 'PatientDataValidationError'
    this.validationErrors = validationErrors
  }
}

// Appointment scheduling errors
export class AppointmentSchedulingError extends HealthcareError {
  public readonly conflictType?: 'time_conflict' | 'resource_unavailable' | 'policy_violation'

  constructor(
    message: string,
    conflictType?: 'time_conflict' | 'resource_unavailable' | 'policy_violation',
    _context?: Record<string, unknown>,
  ) {
    super(
      'APPOINTMENT_SCHEDULING_ERROR',
      HealthcareErrorCategory.VALIDATION,
      HealthcareErrorSeverity.MEDIUM,
      message,
      { conflictType },
      _context,
    )
    this.name = 'AppointmentSchedulingError'
    this.conflictType = conflictType
  }
}

// Database integrity errors
export class HealthcareDataIntegrityError extends HealthcareError {
  constructor(message: string, operation?: string, _context?: Record<string, unknown>) {
    super(
      'HEALTHCARE_DATA_INTEGRITY_ERROR',
      HealthcareErrorCategory.DATA_INTEGRITY,
      HealthcareErrorSeverity.HIGH,
      message,
      { operation },
      _context,
    )
    this.name = 'HealthcareDataIntegrityError'
  }
}

// External service errors (insurance, lab results, etc.)
export class ExternalHealthcareServiceError extends HealthcareError {
  public readonly serviceName: string
  public readonly serviceResponse?: unknown

  constructor(
    message: string,
    serviceName: string,
    serviceResponse?: unknown,
    _context?: Record<string, unknown>,
  ) {
    super(
      'EXTERNAL_HEALTHCARE_SERVICE_ERROR',
      HealthcareErrorCategory.EXTERNAL_SERVICE,
      HealthcareErrorSeverity.MEDIUM,
      message,
      { serviceName, serviceResponse },
      _context,
    )
    this.name = 'ExternalHealthcareServiceError'
    this.serviceName = serviceName
    this.serviceResponse = serviceResponse
  }
}

// Error handler factory
export class HealthcareErrorHandler {
  private logger: HealthcareLogger

  constructor(prisma?: HealthcarePrismaClient) {
    this.logger = new HealthcareLogger(prisma)
  }

  /**
   * Handles and logs healthcare errors
   */
  async handleError(
    error: unknown,
    _context?: Partial<HealthcareErrorDetails>,
  ): Promise<HealthcareError> {
    let healthcareError: HealthcareError

    if (error instanceof HealthcareError) {
      healthcareError = error
    } else if (error instanceof Error) {
      // Convert generic errors to healthcare errors
      healthcareError = new HealthcareError({
        code: 'UNKNOWN_ERROR',
        category: HealthcareErrorCategory.SYSTEM,
        severity: HealthcareErrorSeverity.MEDIUM,
        message: error.message,
        stackTrace: error.stack,
        timestamp: new Date(),
        ..._context,
      })
    } else {
      // Handle non-Error objects
      healthcareError = new HealthcareError({
        code: 'UNKNOWN_ERROR',
        category: HealthcareErrorCategory.SYSTEM,
        severity: HealthcareErrorSeverity.MEDIUM,
        message: String(error),
        timestamp: new Date(),
        ..._context,
      })
    }

    await this.logger.logError(healthcareError)
    return healthcareError
  }

  /**
   * Creates error response for API endpoints
   */
  createErrorResponse(error: HealthcareError): {
    error: {
      code: string
      message: string
      category: string
      severity: string
      timestamp: string
      requestId?: string
    }
    status: number
  } {
    const statusMap = {
      [HealthcareErrorCategory.AUTHENTICATION]: 401,
      [HealthcareErrorCategory.AUTHORIZATION]: 403,
      [HealthcareErrorCategory.VALIDATION]: 400,
      [HealthcareErrorCategory.COMPLIANCE]: 403,
      [HealthcareErrorCategory.DATA_INTEGRITY]: 422,
      [HealthcareErrorCategory.SYSTEM]: 500,
      [HealthcareErrorCategory.NETWORK]: 502,
      [HealthcareErrorCategory.EXTERNAL_SERVICE]: 503,
    }

    return {
      error: {
        code: error.code,
        message: error.message,
        category: error.category,
        severity: error.severity,
        timestamp: error.timestamp.toISOString(),
        requestId: error.requestId,
      },
      status: statusMap[error.category] || 500,
    }
  }
}

// Export singleton instance
export const healthcareErrorHandler = new HealthcareErrorHandler()

// Export logger instance for middleware usage
export const logger = {
  info: (message: string, context?: Record<string, any>) => console.log('INFO:', message, context),
  error: (message: string, error?: Error, context?: Record<string, any>) =>
    console.error('ERROR:', message, error, context),
  warn: (message: string, context?: Record<string, any>) => console.warn('WARN:', message, context),
}

/**
 * tRPC-specific healthcare error class
 * Extends HealthcareError with tRPC-compatible properties
 */
export class HealthcareTRPCError extends HealthcareError {
  constructor(
    code: string,
    message: string,
    category: HealthcareErrorCategory = HealthcareErrorCategory.SYSTEM,
    severity: HealthcareErrorSeverity = HealthcareErrorSeverity.MEDIUM,
    _context?: Partial<HealthcareErrorDetails>,
  ) {
    super({
      code,
      message,
      category,
      severity,
      timestamp: new Date(),
      ..._context,
    })
  }

  /**
   * Convert to tRPC error format
   */
  toTRPCError(): {
    code: string
    message: string
    data: {
      category: string
      severity: string
      timestamp: string
      requestId?: string
      _userId?: string
      clinicId?: string
      patientId?: string
    }
  } {
    return {
      code: this.code,
      message: this.message,
      data: {
        category: this.category,
        severity: this.severity,
        timestamp: this.timestamp.toISOString(),
        requestId: this.requestId,
        _userId: this._userId,
        clinicId: this.clinicId,
        patientId: this.patientId,
      },
    }
  }
}

// Export all error types and utilities
export { type HealthcareErrorDetails }
