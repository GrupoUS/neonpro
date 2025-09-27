/**
 * Factory function to create healthcare errors with proper severity and category
 * This module provides the missing createHealthcareError export
 */

import { ErrorSeverity } from '../types/error-severity.js'
import { HealthcareErrorType } from './error-tracking'

// Define ErrorCategory enum to match the expected export
export enum ErrorCategory {
  SYSTEM = 'system',
  VALIDATION = 'validation',
  COMPLIANCE = 'compliance',
  SECURITY = 'security',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  CONFIGURATION = 'configuration',
}

// Re-export ErrorSeverity for convenience
export { ErrorSeverity }

/**
 * Creates a healthcare error with the specified parameters
 * @param message - Error message
 * @param category - Error category
 * @param severity - Error severity
 * @param statusCode - HTTP status code
 * @param options - Additional error options
 * @returns A properly formatted healthcare error
 */
export function createHealthcareError(
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  statusCode: number,
  options: {
    metadata?: Record<string, any>
    cause?: Error
    type?: HealthcareErrorType
  } = {},
): Error {
  const error = new Error(message) // Add healthcare-specific properties
  ;(error as any).category = category
  ;(error as any).severity = severity
  ;(error as any).statusCode = statusCode
  ;(error as any).metadata = options.metadata || {}
  ;(error as any).type = options.type || 'business_logic_error'

  // Add cause if provided
  if (options.cause) {
    ;(error as any).cause = options.cause
  }

  return error
}

/**
 * Creates a validation error
 */
export function createValidationError(
  message: string,
  field?: string,
  metadata?: Record<string, any>,
): Error {
  return createHealthcareError(
    message,
    ErrorCategory.VALIDATION,
    ErrorSeverity.MEDIUM,
    422,
    {
      metadata: { ...metadata, field },
      type: 'validation_error',
    },
  )
}

/**
 * Creates a compliance error (LGPD, etc.)
 */
export function createComplianceError(
  message: string,
  regulation?: string,
  metadata?: Record<string, any>,
): Error {
  return createHealthcareError(
    message,
    ErrorCategory.COMPLIANCE,
    ErrorSeverity.CRITICAL,
    400,
    {
      metadata: { ...metadata, regulation },
      type: 'lgpd_compliance_issue',
    },
  )
}

/**
 * Creates a security error
 */
export function createSecurityError(
  message: string,
  metadata?: Record<string, any>,
): Error {
  return createHealthcareError(
    message,
    ErrorCategory.SECURITY,
    ErrorSeverity.HIGH,
    403,
    {
      metadata,
      type: 'unauthorized_access',
    },
  )
}

/**
 * Creates a database error
 */
export function createDatabaseError(
  message: string,
  metadata?: Record<string, any>,
): Error {
  return createHealthcareError(
    message,
    ErrorCategory.DATABASE,
    ErrorSeverity.HIGH,
    500,
    {
      metadata,
      type: 'database_error',
    },
  )
}
