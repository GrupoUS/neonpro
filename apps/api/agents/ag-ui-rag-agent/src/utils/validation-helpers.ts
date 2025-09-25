/**
 * Validation Helpers for Healthcare AI Agent
 * Consolidates common validation patterns across the application
 * T061: Consolidate validation logic where applicable
 */

import { HealthcareLogger } from '../logging/healthcare-logger'
import { SupabaseConnector } from '../database/supabase-connector'
import { SessionManager } from '../session/session-manager'
import { ConversationRequest } from '../conversation/conversation-service'
import { logErrorWithContext, ErrorContext } from './error-handling'

/**
 * Common validation results
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
  details?: any
}

/**
 * Session validation parameters
 */
export interface SessionValidationParams {
  sessionId: string
  userId: string
  clinicId: string
  requiredRole?: string
}

/**
 * Data access validation parameters
 */
export interface DataAccessValidationParams {
  userId: string
  clinicId: string
  action: 'read' | 'write' | 'delete'
  resource: string
  resourceId?: string
  patientId?: string
}

/**
 * Conversation validation parameters
 */
export interface ConversationValidationParams {
  conversationId?: string
  userId: string
  clinicId: string
  sessionId?: string
  patientId?: string
  action: 'create' | 'read' | 'update' | 'delete'
}

/**
 * Centralized validation service
 */
export class ValidationService {
  private supabaseConnector: SupabaseConnector
  private sessionManager: SessionManager
  private logger: HealthcareLogger

  constructor(
    supabaseConnector: SupabaseConnector,
    sessionManager: SessionManager,
    logger: HealthcareLogger,
  ) {
    this.supabaseConnector = supabaseConnector
    this.sessionManager = sessionManager
    this.logger = logger
  }

  /**
   * Validate user session with comprehensive checks
   */
  async validateSession(params: SessionValidationParams): Promise<ValidationResult> {
    try {
      // Check if session exists and is active
      const session = await this.sessionManager.getSession(params.sessionId)
      if (!session) {
        return {
          isValid: false,
          error: 'Session not found',
          details: { sessionId: params.sessionId },
        }
      }

      // Verify user ownership
      if (session.userId !== params.userId) {
        return {
          isValid: false,
          error: 'Session user mismatch',
          details: { sessionUserId: session.userId, requestUserId: params.userId },
        }
      }

      // Verify clinic access
      if (session.clinicId !== params.clinicId) {
        return {
          isValid: false,
          error: 'Clinic access denied',
          details: { sessionClinicId: session.clinicId, requestClinicId: params.clinicId },
        }
      }

      // Check role requirements if specified
      if (params.requiredRole && session.userRole !== params.requiredRole) {
        return {
          isValid: false,
          error: 'Insufficient role permissions',
          details: { requiredRole: params.requiredRole, userRole: session.userRole },
        }
      }

      // Update session activity
      await this.sessionManager.updateActivity(params.sessionId)

      return { isValid: true }
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'session_validation_error',
        error,
        ErrorContext.session(params.sessionId, params.userId, params.clinicId, {
          validation: 'session',
          params,
        }),
      )

      return {
        isValid: false,
        error: 'Session validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      }
    }
  }

  /**
   * Validate data access with role-based permissions
   */
  async validateDataAccess(params: DataAccessValidationParams): Promise<ValidationResult> {
    try {
      const hasAccess = await this.supabaseConnector.validateDataAccess({
        userId: params.userId,
        clinicId: params.clinicId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
      })

      if (!hasAccess) {
        return {
          isValid: false,
          error: 'Insufficient permissions',
          details: {
            userId: params.userId,
            clinicId: params.clinicId,
            action: params.action,
            resource: params.resource,
          },
        }
      }

      return { isValid: true }
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'data_access_validation_error',
        error,
        ErrorContext.dataAccess(params.userId, params.clinicId, params.resource, 'validate_access'),
      )

      return {
        isValid: false,
        error: 'Data access validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      }
    }
  }

  /**
   * Validate conversation permissions and access
   */
  async validateConversation(params: ConversationValidationParams): Promise<ValidationResult> {
    try {
      // Validate basic data access
      const dataAccessResult = await this.validateDataAccess({
        userId: params.userId,
        clinicId: params.clinicId,
        action: params.action,
        resource: 'ai_conversation_contexts',
        resourceId: params.conversationId,
      })

      if (!dataAccessResult.isValid) {
        return dataAccessResult
      }

      // For read/update/delete operations, validate session if provided
      if (params.sessionId && params.action !== 'create') {
        const sessionResult = await this.validateSession({
          sessionId: params.sessionId,
          userId: params.userId,
          clinicId: params.clinicId,
        })

        if (!sessionResult.isValid) {
          return sessionResult
        }
      }

      // Additional patient-specific validation for LGPD compliance
      if (params.patientId) {
        const patientAccessResult = await this.validatePatientAccess(
          params.userId,
          params.patientId,
          params.clinicId,
        )

        if (!patientAccessResult.isValid) {
          return patientAccessResult
        }
      }

      return { isValid: true }
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'conversation_validation_error',
        error,
        ErrorContext.conversation(params.conversationId || 'unknown', params.userId, params.clinicId, {
          action: params.action,
          patientId: params.patientId,
        }),
      )

      return {
        isValid: false,
        error: 'Conversation validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      }
    }
  }

  /**
   * Validate patient-specific access for LGPD compliance
   */
  private async validatePatientAccess(
    userId: string,
    patientId: string,
    clinicId: string,
  ): Promise<ValidationResult> {
    try {
      // This delegates to the SupabaseConnector's patient access validation
      // which checks clinic ownership and LGPD consent
      const hasAccess = await this.supabaseConnector.validateDataAccess({
        userId,
        clinicId,
        action: 'read',
        resource: 'patient',
        resourceId: patientId,
        patientId,
      })

      if (!hasAccess) {
        return {
          isValid: false,
          error: 'Patient access denied',
          details: { userId, patientId, clinicId },
        }
      }

      return { isValid: true }
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'patient_access_validation_error',
        error,
        ErrorContext.dataAccess(userId, clinicId, 'patient', 'validate_patient_access'),
      )

      return {
        isValid: false,
        error: 'Patient access validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      }
    }
  }

  /**
   * Validate conversation request parameters
   */
  async validateConversationRequest(request: ConversationRequest): Promise<ValidationResult> {
    try {
      // Check required fields
      if (!request.sessionId) {
        return { isValid: false, error: 'Session ID is required' }
      }
      if (!request.userId) {
        return { isValid: false, error: 'User ID is required' }
      }
      if (!request.clinicId) {
        return { isValid: false, error: 'Clinic ID is required' }
      }
      if (!request.message || request.message.trim().length === 0) {
        return { isValid: false, error: 'Message is required' }
      }

      // Validate message length
      if (request.message.length > 10000) {
        return { isValid: false, error: 'Message too long (max 10000 characters)' }
      }

      // Validate session and permissions
      const sessionResult = await this.validateSession({
        sessionId: request.sessionId,
        userId: request.userId,
        clinicId: request.clinicId,
      })

      if (!sessionResult.isValid) {
        return sessionResult
      }

      // Validate data access permissions
      const dataAccessResult = await this.validateDataAccess({
        userId: request.userId,
        clinicId: request.clinicId,
        action: 'create',
        resource: 'ai_conversation_contexts',
        patientId: request.patientId,
      })

      if (!dataAccessResult.isValid) {
        return dataAccessResult
      }

      return { isValid: true }
    } catch (error) {
      logErrorWithContext(
        this.logger,
        'conversation_request_validation_error',
        error,
        ErrorContext.conversation('temp', request.userId, request.clinicId, {
          request: { sessionId: request.sessionId, messageLength: request.message.length },
        }),
      )

      return {
        isValid: false,
        error: 'Conversation request validation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      }
    }
  }

  /**
   * Utility to throw validation errors
   */
  static throwIfInvalid(result: ValidationResult): void {
    if (!result.isValid) {
      throw new Error(result.error || 'Validation failed')
    }
  }

  /**
   * Utility to validate and throw in one operation
   */
  async validateAndThrow<T>(
    validator: () => Promise<ValidationResult>,
    context?: string,
  ): Promise<T> {
    const result = await validator()
    ValidationService.throwIfInvalid(result)
    return undefined as T // Type assertion handled by caller
  }
}

/**
 * Validation utility functions
 */
export const ValidationUtils = {
  /**
   * Validate string is not empty
   */
  isNonEmptyString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0
  },

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate phone format (simplified)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  },

  /**
   * Validate date format (YYYY-MM-DD)
   */
  isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateString)) return false
    
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  },

  /**
   * Validate UUID format
   */
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  /**
   * Validate object has required fields
   */
  hasRequiredFields(obj: any, requiredFields: string[]): boolean {
    if (!obj || typeof obj !== 'object') return false
    
    return requiredFields.every(field => {
      const value = obj[field]
      return value !== undefined && value !== null && value !== ''
    })
  },
}