/**
 * Specific error classes for domain-specific error handling
 * Based on PR feedback to standardize error handling across repositories and services
 */

import { HealthcareError } from './healthcare-errors'

/**
 * Database-related errors (connection, query, constraint violations, etc.)
 */
export class DatabaseError extends HealthcareError {
  public readonly operation: string
  public readonly table?: string
  public readonly constraint?: string

  constructor(
    message: string,
    errorCode: string,
    operation: string,
    auditData: Record<string, any> = {},
    operationContext?: string,
    table?: string,
    constraint?: string,
  ) {
    super(message, errorCode, 'GENERAL', 'HIGH', auditData, operationContext)
    this.operation = operation
    this.table = table
    this.constraint = constraint
  }

  static fromPrismaError(
    error: any,
    operation: string,
    auditData: Record<string, any> = {},
  ): DatabaseError {
    // Handle Prisma-specific error codes
    if (error.code === 'P2002') {
      return new DatabaseError(
        `Unique constraint violation on ${error.meta?.target?.join(', ') || 'unknown field'}`,
        'DB_UNIQUE_CONSTRAINT_VIOLATION',
        operation,
        auditData,
        'Prisma unique constraint',
        error.meta?.table,
        error.meta?.target?.join(', '),
      )
    }

    if (error.code === 'P2025') {
      return new DatabaseError(
        'Record not found or operation failed',
        'DB_RECORD_NOT_FOUND',
        operation,
        auditData,
        'Prisma record not found',
        error.meta?.table,
      )
    }

    if (error.code === 'P2003') {
      return new DatabaseError(
        `Foreign key constraint violation: ${error.meta?.field_name || 'unknown field'}`,
        'DB_FOREIGN_KEY_VIOLATION',
        operation,
        auditData,
        'Prisma foreign key constraint',
        error.meta?.table,
        error.meta?.field_name,
      )
    }

    // Generic database error
    return new DatabaseError(
      error.message || 'Database operation failed',
      'DB_OPERATION_FAILED',
      operation,
      auditData,
      'Database operation',
    )
  }
}

/**
 * Validation errors for input data, business rules, and constraints
 */
export class ValidationError extends HealthcareError {
  public readonly field?: string
  public readonly value?: any
  public readonly constraints: string[]

  constructor(
    message: string,
    errorCode: string,
    constraints: string[] = [],
    auditData: Record<string, any> = {},
    operationContext?: string,
    field?: string,
    value?: any,
  ) {
    super(message, errorCode, 'GENERAL', 'MEDIUM', auditData, operationContext)
    this.field = field
    this.value = value
    this.constraints = constraints
  }

  static fieldValidation(
    field: string,
    value: any,
    constraints: string[],
    auditData: Record<string, any> = {},
  ): ValidationError {
    return new ValidationError(
      `Validation failed for field '${field}': ${constraints.join(', ')}`,
      'VALIDATION_FIELD_ERROR',
      constraints,
      auditData,
      'Field validation',
      field,
      value,
    )
  }

  static businessRule(
    rule: string,
    message: string,
    auditData: Record<string, any> = {},
  ): ValidationError {
    return new ValidationError(
      message,
      'VALIDATION_BUSINESS_RULE',
      [rule],
      auditData,
      'Business rule validation',
    )
  }
}

/**
 * Conflict errors for resource conflicts, concurrent modifications, etc.
 */
export class ConflictError extends HealthcareError {
  public readonly resourceType: string
  public readonly resourceId?: string
  public readonly conflictType: 'already_exists' | 'concurrent_modification' | 'state_conflict'

  constructor(
    message: string,
    errorCode: string,
    resourceType: string,
    conflictType: 'already_exists' | 'concurrent_modification' | 'state_conflict',
    auditData: Record<string, any> = {},
    operationContext?: string,
    resourceId?: string,
  ) {
    super(message, errorCode, 'GENERAL', 'MEDIUM', auditData, operationContext)
    this.resourceType = resourceType
    this.resourceId = resourceId
    this.conflictType = conflictType
  }

  static alreadyExists(
    resourceType: string,
    resourceId: string,
    auditData: Record<string, any> = {},
  ): ConflictError {
    return new ConflictError(
      `${resourceType} with ID '${resourceId}' already exists`,
      'CONFLICT_RESOURCE_EXISTS',
      resourceType,
      'already_exists',
      auditData,
      'Resource creation',
      resourceId,
    )
  }

  static concurrentModification(
    resourceType: string,
    resourceId: string,
    auditData: Record<string, any> = {},
  ): ConflictError {
    return new ConflictError(
      `${resourceType} with ID '${resourceId}' was modified by another process`,
      'CONFLICT_CONCURRENT_MODIFICATION',
      resourceType,
      'concurrent_modification',
      auditData,
      'Resource modification',
      resourceId,
    )
  }

  static stateConflict(
    resourceType: string,
    currentState: string,
    requiredState: string,
    auditData: Record<string, any> = {},
    resourceId?: string,
  ): ConflictError {
    return new ConflictError(
      `${resourceType} is in state '${currentState}' but operation requires '${requiredState}'`,
      'CONFLICT_STATE_MISMATCH',
      resourceType,
      'state_conflict',
      auditData,
      'State validation',
      resourceId,
    )
  }
}

/**
 * Not found errors for missing resources
 */
export class NotFoundError extends HealthcareError {
  public readonly resourceType: string
  public readonly resourceId?: string
  public readonly searchCriteria?: Record<string, any>

  constructor(
    message: string,
    errorCode: string,
    resourceType: string,
    auditData: Record<string, any> = {},
    operationContext?: string,
    resourceId?: string,
    searchCriteria?: Record<string, any>,
  ) {
    super(message, errorCode, 'GENERAL', 'LOW', auditData, operationContext)
    this.resourceType = resourceType
    this.resourceId = resourceId
    this.searchCriteria = searchCriteria
  }

  static byId(
    resourceType: string,
    resourceId: string,
    auditData: Record<string, any> = {},
  ): NotFoundError {
    return new NotFoundError(
      `${resourceType} with ID '${resourceId}' not found`,
      'NOT_FOUND_BY_ID',
      resourceType,
      auditData,
      'Resource lookup by ID',
      resourceId,
    )
  }

  static byCriteria(
    resourceType: string,
    searchCriteria: Record<string, any>,
    auditData: Record<string, any> = {},
  ): NotFoundError {
    return new NotFoundError(
      `${resourceType} not found with criteria: ${JSON.stringify(searchCriteria)}`,
      'NOT_FOUND_BY_CRITERIA',
      resourceType,
      auditData,
      'Resource lookup by criteria',
      undefined,
      searchCriteria,
    )
  }
}

/**
 * Compliance errors for LGPD, ANVISA, CFM, and other regulatory violations
 */
export class ComplianceError extends HealthcareError {
  public readonly regulatoryFramework: 'LGPD' | 'ANVISA' | 'CFM' | 'GENERAL'
  public readonly violationType: string
  public readonly requiredAction?: string

  constructor(
    message: string,
    errorCode: string,
    regulatoryFramework: 'LGPD' | 'ANVISA' | 'CFM' | 'GENERAL',
    violationType: string,
    auditData: Record<string, any> = {},
    operationContext?: string,
    requiredAction?: string,
  ) {
    super(message, errorCode, regulatoryFramework, 'CRITICAL', auditData, operationContext)
    this.regulatoryFramework = regulatoryFramework
    this.violationType = violationType
    this.requiredAction = requiredAction
  }

  static lgpdViolation(
    violationType: string,
    message: string,
    auditData: Record<string, any> = {},
    requiredAction?: string,
  ): ComplianceError {
    return new ComplianceError(
      message,
      'COMPLIANCE_LGPD_VIOLATION',
      'LGPD',
      violationType,
      auditData,
      'LGPD compliance check',
      requiredAction,
    )
  }

  static anvisaViolation(
    violationType: string,
    message: string,
    auditData: Record<string, any> = {},
    requiredAction?: string,
  ): ComplianceError {
    return new ComplianceError(
      message,
      'COMPLIANCE_ANVISA_VIOLATION',
      'ANVISA',
      violationType,
      auditData,
      'ANVISA compliance check',
      requiredAction,
    )
  }

  static cfmViolation(
    violationType: string,
    message: string,
    auditData: Record<string, any> = {},
    requiredAction?: string,
  ): ComplianceError {
    return new ComplianceError(
      message,
      'COMPLIANCE_CFM_VIOLATION',
      'CFM',
      violationType,
      auditData,
      'CFM compliance check',
      requiredAction,
    )
  }

  static dataRetention(
    message: string,
    auditData: Record<string, any> = {},
    requiredAction?: string,
  ): ComplianceError {
    return new ComplianceError(
      message,
      'COMPLIANCE_DATA_RETENTION',
      'LGPD',
      'data_retention_violation',
      auditData,
      'Data retention policy check',
      requiredAction,
    )
  }

  static consentRequired(
    dataType: string,
    auditData: Record<string, any> = {},
  ): ComplianceError {
    return new ComplianceError(
      `User consent required for processing ${dataType}`,
      'COMPLIANCE_CONSENT_REQUIRED',
      'LGPD',
      'missing_consent',
      auditData,
      'Consent validation',
      'Obtain user consent',
    )
  }
}

// Re-export all error types for convenience
export {
  HealthcareError,
  GeneralHealthcareError,
  LGPDComplianceError,
  HealthcareErrorHandler,
} from './healthcare-errors'