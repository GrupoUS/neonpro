/**
 * Bulk Operations Security Service
 * Safe bulk operations with LGPD compliance and audit trails
 *
 * Features:
 * - Bulk operations safety mechanisms
 * - LGPD-compliant consent validation
 * - Comprehensive audit logging
 * - Retry and circuit breaker patterns
 * - Rate limiting for healthcare data
 * - Brazilian healthcare compliance
 */

import { logger } from '@/utils/secure-logger'
import { createAdminClient } from '../clients/supabase'

export interface BulkOperationRequest {
  operationType:
    | 'activate'
    | 'deactivate'
    | 'update'
    | 'delete'
    | 'export'
    | 'assign_tag'
  entityType: 'patient' | 'appointment' | 'professional' | 'service'
  entityIds: string[]
  data?: Record<string, any>
  requesterUserId: string
  clinicId: string
  reason?: string
  confirmationToken?: string
}

export interface BulkOperationResult {
  success: boolean
  processed: number
  failed: number
  errors: Array<{
    entityId: string
    error: string
    code: string
  }>
  auditTrailId: string
  undoToken?: string
  processingTimeMs: number
}

export interface SafetyConfiguration {
  maxBatchSize: number
  requireConfirmation: boolean
  requireReason: boolean
  enableUndo: boolean
  undoWindowMs: number
  rateLimitPerMinute: number
  allowedRoles: string[]
}

// Default safety configurations by operation type
const SAFETY_CONFIGURATIONS: Record<string, SafetyConfiguration> = {
  delete: {
    maxBatchSize: 10,
    requireConfirmation: true,
    requireReason: true,
    enableUndo: true,
    undoWindowMs: 30 * 60 * 1000, // 30 minutes
    rateLimitPerMinute: 5,
    allowedRoles: ['admin', 'manager', 'healthcare_professional'],
  },
  deactivate: {
    maxBatchSize: 50,
    requireConfirmation: true,
    requireReason: true,
    enableUndo: true,
    undoWindowMs: 60 * 60 * 1000, // 1 hour
    rateLimitPerMinute: 10,
    allowedRoles: ['admin', 'manager', 'healthcare_professional'],
  },
  update: {
    maxBatchSize: 100,
    requireConfirmation: false,
    requireReason: false,
    enableUndo: true,
    undoWindowMs: 24 * 60 * 60 * 1000, // 24 hours
    rateLimitPerMinute: 20,
    allowedRoles: ['admin', 'manager', 'healthcare_professional', 'staff'],
  },
  activate: {
    maxBatchSize: 100,
    requireConfirmation: false,
    requireReason: false,
    enableUndo: true,
    undoWindowMs: 60 * 60 * 1000, // 1 hour
    rateLimitPerMinute: 15,
    allowedRoles: ['admin', 'manager', 'healthcare_professional'],
  },
  export: {
    maxBatchSize: 1000,
    requireConfirmation: true,
    requireReason: true,
    enableUndo: false,
    undoWindowMs: 0,
    rateLimitPerMinute: 3,
    allowedRoles: ['admin', 'manager'],
  },
  assign_tag: {
    maxBatchSize: 200,
    requireConfirmation: false,
    requireReason: false,
    enableUndo: true,
    undoWindowMs: 24 * 60 * 60 * 1000, // 24 hours
    rateLimitPerMinute: 30,
    allowedRoles: ['admin', 'manager', 'healthcare_professional', 'staff'],
  },
}

export class BulkOperationsService {
  private rateLimitMap: Map<string, Array<number>> = new Map()
  private undoOperations: Map<string, any> = new Map()

  /**
   * Execute bulk operation with safety mechanisms
   */
  async executeBulkOperation(
    _request: BulkOperationRequest,
  ): Promise<BulkOperationResult> {
    const startTime = Date.now()
    const auditTrailId = this.generateAuditId()

    try {
      // 1. Validate request
      await this.validateBulkRequest(_request)

      // 2. Check rate limits
      this.enforceRateLimit(_request.requesterUserId, _request.operationType)

      // 3. Get safety configuration
      const config = SAFETY_CONFIGURATIONS[_request.operationType]

      // 4. Validate batch size
      if (_request.entityIds.length > config.maxBatchSize) {
        throw new Error(
          `Batch size ${_request.entityIds.length} exceeds maximum ${config.maxBatchSize} for ${_request.operationType}`,
        )
      }

      // 5. Validate confirmation if required
      if (config.requireConfirmation && !_request.confirmationToken) {
        throw new Error('Confirmation token required for this operation')
      }

      // 6. Validate reason if required
      if (config.requireReason && !_request.reason) {
        throw new Error('Reason required for this operation')
      }

      // 7. Log operation start
      await this.logOperationStart(_request, auditTrailId)

      // 8. Execute operation with retry logic
      const result = await this.executeWithRetry(_request, auditTrailId)

      // 9. Store undo information if enabled
      if (config.enableUndo && result.success) {
        const undoToken = this.generateUndoToken()
        await this.storeUndoInformation(
          undoToken,
          _request,
          config.undoWindowMs,
        )
        result.undoToken = undoToken
      }

      // 10. Log operation completion
      await this.logOperationCompletion(_request, result, auditTrailId)

      result.processingTimeMs = Date.now() - startTime
      return result
    } catch {
      void _error
      // Log error
      await this.logOperationError(request, error, auditTrailId)

      throw new Error(`Bulk operation failed: ${error.message}`)
    }
  }

  /**
   * Undo bulk operation within the allowed window
   */
  async undoBulkOperation(
    undoToken: string,
    requesterUserId: string,
  ): Promise<boolean> {
    const undoInfo = this.undoOperations.get(undoToken)

    if (!undoInfo) {
      throw new Error('Undo token not found or expired')
    }

    if (undoInfo.requesterUserId !== requesterUserId) {
      throw new Error('Unauthorized undo attempt')
    }

    if (Date.now() > undoInfo.expiresAt) {
      this.undoOperations.delete(undoToken)
      throw new Error('Undo window has expired')
    }

    try {
      // Execute reverse operation based on original type
      const reverseRequest = this.createReverseOperation(
        undoInfo.originalRequest,
        undoInfo.originalData,
      )
      await this.executeBulkOperation(reverseRequest)

      // Remove undo information
      this.undoOperations.delete(undoToken)

      // Log undo operation
      logger.info('Bulk operation undone', { undoToken, requesterUserId })

      return true
    } catch {
      void _error
      logger.error('Failed to undo bulk operation', { undoToken, error })
      return false
    }
  }

  /**
   * Get operation status and progress
   */
  async getOperationStatus(auditTrailId: string): Promise<any> {
    // Mock implementation - in real application, query audit trail
    return {
      id: auditTrailId,
      status: 'completed',
      progress: 100,
      processed: 0,
      failed: 0,
      errors: [],
    }
  }

  // Private helper methods

  private async validateBulkRequest(
    _request: BulkOperationRequest,
  ): Promise<void> {
    // Validate required fields
    if (
      !_request.operationType
      || !_request.entityType
      || !_request.entityIds?.length
    ) {
      throw new Error(
        'Invalid bulk operation _request: missing required fields',
      )
    }

    // Validate operation type
    if (!SAFETY_CONFIGURATIONS[_request.operationType]) {
      throw new Error(`Unsupported operation type: ${_request.operationType}`)
    }

    // Validate entity IDs format (basic UUID check)
    const invalidIds = _request.entityIds.filter(
      (id) => !id || typeof id !== 'string' || id.length < 10,
    )
    if (invalidIds.length > 0) {
      throw new Error(`Invalid entity IDs: ${invalidIds.join(', ')}`)
    }

    // Validate user permissions against allowedRoles
    await this.validateUserPermissions(_request)

    // Validate clinic access permissions
    await this.validateClinicAccess(request)

    // Validate LGPD consent for data operations
    await this.validateLGPDConsent(request)
  }

  private enforceRateLimit(_userId: string, operationType: string): void {
    const key = `${userId}:${operationType}`
    const now = Date.now()
    const oneMinute = 60 * 1000
    const config = SAFETY_CONFIGURATIONS[operationType]

    // Get or initialize rate limit tracking
    const timestamps = this.rateLimitMap.get(key) || []

    // Remove timestamps older than 1 minute
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < oneMinute,
    )

    // Check if rate limit exceeded
    if (recentTimestamps.length >= config.rateLimitPerMinute) {
      throw new Error(
        `Rate limit exceeded: ${recentTimestamps.length}/${config.rateLimitPerMinute} operations per minute for ${operationType}`,
      )
    }

    // Add current timestamp
    recentTimestamps.push(now)
    this.rateLimitMap.set(key, recentTimestamps)
  }

  private async executeWithRetry(
    _request: BulkOperationRequest,
    auditTrailId: string,
    maxRetries: number = 3,
  ): Promise<BulkOperationResult> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeBulkOperationCore(request, auditTrailId)
      } catch {
        void _error
        lastError = error

        // Don't retry validation errors or auth errors
        if (
          error.message.includes('validation')
          || error.message.includes('unauthorized')
        ) {
          throw error
        }

        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, delay))
          logger.warn('Bulk operation attempt failed, retrying', {
            attempt,
            delay,
            error: error.message,
          })
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  private async executeBulkOperationCore(
    _request: BulkOperationRequest,
    auditTrailId: string,
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: false,
      processed: 0,
      failed: 0,
      errors: [],
      auditTrailId,
      processingTimeMs: 0,
    }

    // Process entities in batches to avoid memory issues
    const batchSize = Math.min(_request.entityIds.length, 10)
    const originalData: Record<string, any> = {}

    for (let i = 0; i < _request.entityIds.length; i += batchSize) {
      const batch = _request.entityIds.slice(i, i + batchSize)

      for (const entityId of batch) {
        try {
          // Store original data for undo functionality
          const originalEntityData = await this.getEntityData(
            _request.entityType,
            entityId,
          )
          originalData[entityId] = originalEntityData

          // Execute the operation
          await this.executeEntityOperation(request, entityId)

          result.processed++
        } catch {
          void _error
          result.failed++
          result.errors.push({
            entityId,
            error: error.message,
            code: error.code || 'UNKNOWN_ERROR',
          })

          logger.error('Failed to process entity', { entityId, error })
        }
      }
    }

    result.success = result.failed === 0

    // Store original data for undo if any entities were processed
    if (result.processed > 0) {
      // In a real implementation, this would be stored in the database
      logger.info('Bulk operation processed entities', {
        processed: result.processed,
        failed: result.failed,
      })
    }

    return result
  }

  private async getEntityData(
    entityType: string,
    entityId: string,
  ): Promise<any> {
    // Mock implementation - in real application, query database
    return { id: entityId, type: entityType, status: 'active' }
  }

  private async executeEntityOperation(
    _request: BulkOperationRequest,
    entityId: string,
  ): Promise<void> {
    // Mock implementation - in real application, execute actual operation
    switch (_request.operationType) {
      case 'activate':
        logger.info('Activating entity', {
          entityType: request.entityType,
          entityId,
        })
        break
      case 'deactivate':
        logger.info('Deactivating entity', {
          entityType: request.entityType,
          entityId,
        })
        break
      case 'delete':
        logger.info('Deleting entity', {
          entityType: request.entityType,
          entityId,
        })
        break
      case 'update':
        logger.info('Updating entity', {
          entityType: request.entityType,
          entityId,
        })
        break
      case 'assign_tag':
        logger.info('Assigning tag to entity', {
          entityType: request.entityType,
          entityId,
        })
        break
      case 'export':
        logger.info('Exporting entity', {
          entityType: request.entityType,
          entityId,
        })
        break
      default:
        throw new Error(`Unsupported operation: ${_request.operationType}`)
    }

    // Simulate processing time and potential failures
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))

    // Simulate random failures for testing
    if (Math.random() < 0.05) {
      // 5% failure rate
      throw new Error('Simulated processing error')
    }
  }

  private createReverseOperation(
    originalRequest: BulkOperationRequest,
    originalData: Record<string, any>,
  ): BulkOperationRequest {
    const reverseOperations: Record<string, string> = {
      activate: 'deactivate',
      deactivate: 'activate',
      delete: 'restore', // Would need special handling
      update: 'update', // Restore original values
    }

    return {
      ...originalRequest,
      operationType: reverseOperations[originalRequest.operationType] as any,
      data: originalData,
      reason: `Undo operation for ${originalRequest.operationType}`,
    }
  }

  private async storeUndoInformation(
    undoToken: string,
    originalRequest: BulkOperationRequest,
    undoWindowMs: number,
  ): Promise<void> {
    const undoInfo = {
      undoToken,
      originalRequest,
      originalData: {}, // Would be populated with actual data
      requesterUserId: originalRequest.requesterUserId,
      createdAt: Date.now(),
      expiresAt: Date.now() + undoWindowMs,
    }

    this.undoOperations.set(undoToken, undoInfo)

    // Clean up expired undo operations
    setTimeout(() => {
      this.undoOperations.delete(undoToken)
    }, undoWindowMs)
  }

  private async logOperationStart(
    _request: BulkOperationRequest,
    auditTrailId: string,
  ): Promise<void> {
    logger.info('Bulk operation started', {
      auditTrailId,
      operation: request.operationType,
      entityType: request.entityType,
      count: request.entityIds.length,
      user: request.requesterUserId,
      clinic: request.clinicId,
    })
  }

  private async logOperationCompletion(
    _request: BulkOperationRequest,
    result: BulkOperationResult,
    auditTrailId: string,
  ): Promise<void> {
    logger.info('Bulk operation completed', {
      auditTrailId,
      success: result.success,
      processed: result.processed,
      failed: result.failed,
      processingTime: result.processingTimeMs,
    })
  }

  private async logOperationError(
    _request: BulkOperationRequest,
    error: Error,
    auditTrailId: string,
  ): Promise<void> {
    logger.error('Bulk operation failed', {
      auditTrailId,
      operation: request.operationType,
      entityType: request.entityType,
      user: request.requesterUserId,
      error: error.message,
    })
  }

  private generateAuditId(): string {
    return `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateUndoToken(): string {
    return `undo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get safety configuration for operation type
   */
  getSafetyConfiguration(operationType: string): SafetyConfiguration | null {
    return SAFETY_CONFIGURATIONS[operationType] || null
  }

  /**
   * Validate user permissions against allowed roles for the operation
   */
  private async validateUserPermissions(
    _request: BulkOperationRequest,
  ): Promise<void> {
    try {
      const supabase = createAdminClient()
      const config = SAFETY_CONFIGURATIONS[_request.operationType]

      // Get user details including role
      const { data: user, error } = await supabase
        .from('users')
        .select('id, role, clinic_id')
        .eq('id', _request.requesterUserId)
        .single()

      if (error || !user) {
        throw new Error(`User not found: ${_request.requesterUserId}`)
      }

      // Check if user role is allowed for this operation
      if (!config.allowedRoles.includes(user._role)) {
        throw new Error(
          `User role '${user.role}' is not authorized for ${_request.operationType} operations. `
            + `Allowed roles: ${config.allowedRoles.join(', ')}`,
        )
      }

      logger.debug('User permissions validated', {
        _userId: request.requesterUserId,
        _role: user.role,
        operationType: request.operationType,
        allowedRoles: config.allowedRoles,
      })
    } catch {
      logger.error('User permission validation failed', {
        _userId: request.requesterUserId,
        operationType: request.operationType,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Validate clinic access permissions
   */
  private async validateClinicAccess(
    _request: BulkOperationRequest,
  ): Promise<void> {
    try {
      const supabase = createAdminClient()

      // Verify user belongs to the specified clinic
      const { data: userClinic, error } = await supabase
        .from('users')
        .select('clinic_id')
        .eq('id', _request.requesterUserId)
        .single()

      if (error || !userClinic) {
        throw new Error(
          `User clinic assignment not found: ${_request.requesterUserId}`,
        )
      }

      // Validate clinic access
      if (userClinic.clinic_id !== _request.clinicId) {
        throw new Error(
          `User does not have access to clinic ${_request.clinicId}. `
            + `User's clinic: ${userClinic.clinic_id}`,
        )
      }

      // For patient-specific operations, validate patient belongs to clinic
      if (_request.entityType === 'patient' && _request.entityIds.length > 0) {
        const { data: patients, error: patientError } = await supabase
          .from('patients')
          .select('id, clinic_id')
          .in('id', _request.entityIds.slice(0, 100)) // Limit to 100 for performance
          .eq('clinic_id', _request.clinicId)

        if (patientError) {
          throw new Error(
            `Failed to validate patient clinic access: ${patientError.message}`,
          )
        }

        const accessiblePatients = patients?.map((p) => p.id) || []
        const inaccessiblePatients = _request.entityIds.filter(
          (id) => !accessiblePatients.includes(id),
        )

        if (inaccessiblePatients.length > 0) {
          throw new Error(
            `Access denied to ${inaccessiblePatients.length} patients that don't belong to the specified clinic`,
          )
        }
      }

      logger.debug('Clinic access validated', {
        _userId: request.requesterUserId,
        clinicId: request.clinicId,
        entityType: request.entityType,
        entityCount: request.entityIds.length,
      })
    } catch {
      logger.error('Clinic access validation failed', {
        _userId: request.requesterUserId,
        clinicId: request.clinicId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Validate LGPD consent for data operations
   */
  private async validateLGPDConsent(
    _request: BulkOperationRequest,
  ): Promise<void> {
    try {
      // Skip LGPD validation for certain operation types that are legal obligations
      const exemptOperations = ['activate', 'deactivate']
      if (exemptOperations.includes(_request.operationType)) {
        return
      }

      const supabase = createAdminClient()

      // For patient data operations, validate patient consent
      if (_request.entityType === 'patient' && _request.entityIds.length > 0) {
        const { data: consents, error } = await supabase
          .from('lgpd_consents')
          .select('*')
          .in('patient_id', _request.entityIds.slice(0, 50)) // Limit for performance
          .eq('status', 'granted')
          .gt('expires_at', new Date().toISOString())

        if (error) {
          throw new Error(`Failed to validate LGPD consent: ${error.message}`)
        }

        const patientsWithConsent = new Set(
          consents?.map((c) => c.patient_id) || [],
        )
        const patientsWithoutConsent = _request.entityIds.filter(
          (id) => !patientsWithConsent.has(id),
        )

        if (patientsWithoutConsent.length > 0) {
          throw new Error(
            `LGPD compliance error: ${patientsWithoutConsent.length} patients lack valid consent for bulk ${_request.operationType} operation`,
          )
        }

        // Log consent validation for audit purposes
        logger.info('LGPD consent validated for bulk operation', {
          _userId: request.requesterUserId,
          operationType: request.operationType,
          entityType: request.entityType,
          entityCount: request.entityIds.length,
          patientsWithConsent: patientsWithConsent.size,
        })
      }

      // For appointment operations, validate through patient consent
      if (
        _request.entityType === 'appointment'
        && _request.entityIds.length > 0
      ) {
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('patient_id')
          .in('id', _request.entityIds.slice(0, 100))

        if (error) {
          throw new Error(
            `Failed to validate appointment consent: ${error.message}`,
          )
        }

        const patientIds = [
          ...new Set(appointments?.map((a) => a.patient_id) || []),
        ]

        if (patientIds.length > 0) {
          const { data: patientConsents, error: consentError } = await supabase
            .from('lgpd_consents')
            .select('patient_id')
            .in('patient_id', patientIds)
            .eq('status', 'granted')
            .gt('expires_at', new Date().toISOString())

          if (consentError) {
            throw new Error(
              `Failed to validate patient consent for appointments: ${consentError.message}`,
            )
          }

          const patientsWithConsent = new Set(
            patientConsents?.map((c) => c.patient_id) || [],
          )
          const patientsWithoutConsent = patientIds.filter(
            (id) => !patientsWithConsent.has(id),
          )

          if (patientsWithoutConsent.length > 0) {
            throw new Error(
              `LGPD compliance error: ${patientsWithoutConsent.length} patients lack valid consent for appointment bulk operations`,
            )
          }
        }
      }
    } catch {
      logger.error('LGPD consent validation failed', {
        _userId: request.requesterUserId,
        operationType: request.operationType,
        entityType: request.entityType,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Cleanup expired rate limits and undo operations
   */
  cleanup(): void {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    // Clean up rate limits older than 1 hour
    this.rateLimitMap.forEach((timestamps, _key) => {
      const recentTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < oneHour,
      )
      if (recentTimestamps.length === 0) {
        this.rateLimitMap.delete(key)
      } else {
        this.rateLimitMap.set(key, recentTimestamps)
      }
    })

    // Clean up expired undo operations
    this.undoOperations.forEach((undoInfo, _token) => {
      if (now > undoInfo.expiresAt) {
        this.undoOperations.delete(token)
      }
    })
  }
}

// Export singleton instance
export const bulkOperationsService = new BulkOperationsService()

// Start cleanup interval (run every 15 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      bulkOperationsService.cleanup()
    },
    15 * 60 * 1000,
  )
}
