/**
 * Common Error Handling Utilities for Healthcare Agent
 * T058: Configure session management with standardized error handling
 * Provides consistent error handling patterns across all services
 */

export interface AppError extends Error {
  code: string
  statusCode?: number
  context?: Record<string, any>
  timestamp: string
}

export interface ErrorContext {
  userId?: string
  clinicId?: string
  sessionId?: string
  resource?: string
  action?: string
  metadata?: Record<string, any>
}

/**
 * Create a standardized application error
 */
export function createAppError(
  message: string,
  code: string,
  statusCode = 500,
  context?: ErrorContext
): AppError {
  const error = new Error(message) as AppError
  error.code = code
  error.statusCode = statusCode
  error.context = context
  error.timestamp = new Date().toISOString()
  error.name = 'AppError'
  return error
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return 'Unknown error'
}

/**
 * Safely extract error code from unknown error type
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    return String(error.code)
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code)
  }
  
  return 'UNKNOWN_ERROR'
}

/**
 * Standardized error logging helper
 */
export function logErrorWithContext(
  logger: any,
  errorType: string,
  error: unknown,
  context?: ErrorContext
): void {
  const errorMessage = getErrorMessage(error)
  const errorCode = getErrorCode(error)
  
  const logContext = {
    error: errorMessage,
    errorCode,
    timestamp: new Date().toISOString(),
    ...context
  }

  if (logger?.logError) {
    logger.logError(errorType, logContext)
  } else if (logger?.error) {
    logger.error(`${errorType}: ${errorMessage}`, error as Error, logContext)
  } else {
    console.error(`[${errorType}]`, errorMessage, logContext)
  }
}

/**
 * Wrap async operations with standardized error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorType: string,
  logger?: any,
  context?: ErrorContext
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logErrorWithContext(logger, errorType, error, context)
    throw error
  }
}

/**
 * Create validation error with standardized format
 */
export function createValidationError(
  message: string,
  field?: string,
  context?: ErrorContext
): AppError {
  return createAppError(
    message,
    'VALIDATION_ERROR',
    400,
    {
      ...context,
      field,
      validation: true
    }
  )
}

/**
 * Create permission error with standardized format
 */
export function createPermissionError(
  message: string,
  requiredPermission?: string,
  context?: ErrorContext
): AppError {
  return createAppError(
    message,
    'PERMISSION_ERROR',
    403,
    {
      ...context,
      requiredPermission,
      permission: true
    }
  )
}

/**
 * Create not found error with standardized format
 */
export function createNotFoundError(
  resource: string,
  id?: string,
  context?: ErrorContext
): AppError {
  return createAppError(
    `${resource}${id ? ` with ID ${id}` : ''} not found`,
    'NOT_FOUND',
    404,
    {
      ...context,
      resource,
      resourceId: id,
      notFound: true
    }
  )
}

/**
 * Common error codes and their meanings
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_INPUT: 'INVALID_INPUT',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

/**
 * Error context helper functions
 */
export const ErrorContext = {
  /**
   * Create audit logging context
   */
  audit: (userId: string, clinicId: string, sessionId: string, action: string): ErrorContext => ({
    userId,
    clinicId,
    sessionId,
    action,
    resource: 'audit'
  }),

  /**
   * Create data access context
   */
  dataAccess: (userId: string, clinicId: string, resource: string, action: string): ErrorContext => ({
    userId,
    clinicId,
    resource,
    action
  }),

  /**
   * Create session context
   */
  session: (sessionId: string, userId?: string, clinicId?: string): ErrorContext => ({
    sessionId,
    userId,
    clinicId,
    resource: 'session'
  }),

  /**
   * Create conversation context
   */
  conversation: (conversationId: string, userId: string, clinicId: string): ErrorContext => ({
    userId,
    clinicId,
    resource: 'conversation',
    action: 'conversation_operation',
    metadata: { conversationId }
  })
}