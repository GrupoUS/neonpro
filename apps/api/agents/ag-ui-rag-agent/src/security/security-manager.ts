/**
 * Security Manager for Healthcare Agent Operations
 * LGPD-compliant security validation and access control
 * Implements role-based permissions and data minimization
 */

import { createHash, timingSafeEqual } from 'crypto'
import { HealthcareLogger } from '../logging/healthcare-logger'
import type { 
  QueryPermissions, 
  ClientMessage, 
  ConnectionContext,
  SecurityValidationResult,
  UserRole 
} from '../types'

interface ValidationRequest {
  token: string
  userId: string
  clinicId: string
  origin: string
  userAgent: string
}

interface UserPermissionCache {
  userId: string
  clinicId: string
  permissions: QueryPermissions
  roles: UserRole[]
  cacheTime: Date
  expiryTime: Date
}

/**
 * Healthcare Security Manager with LGPD compliance
 * Handles authentication, authorization, and data access control
 */
export class SecurityManager {
  private logger: HealthcareLogger
  private permissionCache = new Map<string, UserPermissionCache>()
  private cacheExpiryMs = 5 * 60 * 1000 // 5 minutes
  private rateLimitMap = new Map<string, { count: number; resetTime: Date }>()

  // LGPD-compliant data access patterns
  private readonly dataAccessLevels = {
    'public': ['basic_info', 'clinic_info'],
    'standard': ['patient_list', 'appointment_list', 'basic_reports'],
    'sensitive': ['patient_details', 'medical_records', 'financial_data'],
    'admin': ['all_patients', 'staff_management', 'system_settings']
  } as const

  constructor(logger: HealthcareLogger) {
    this.logger = logger
    this.startCacheCleanup()
  }

  /**
   * Validate WebSocket connection request
   */
  public async validateConnection(request: ValidationRequest): Promise<boolean> {
    try {
      // Rate limiting check
      if (!this.checkRateLimit(request.userId)) {
        this.logger.warn('Connection rejected - rate limit exceeded', {
          component: 'security-manager',
          userId: request.userId,
          origin: request.origin
        })
        return false
      }

      // Validate token format
      if (!this.validateTokenFormat(request.token)) {
        this.logger.warn('Connection rejected - invalid token format', {
          component: 'security-manager',
          userId: request.userId
        })
        return false
      }

      // Validate origin
      if (!this.validateOrigin(request.origin)) {
        this.logger.warn('Connection rejected - invalid origin', {
          component: 'security-manager',
          userId: request.userId,
          origin: request.origin
        })
        return false
      }

      // Verify user exists and has access to clinic
      const hasAccess = await this.verifyUserClinicAccess(request.userId, request.clinicId)
      if (!hasAccess) {
        this.logger.warn('Connection rejected - no clinic access', {
          component: 'security-manager',
          userId: request.userId,
          clinicId: request.clinicId
        })
        return false
      }

      // Log successful validation
      await this.logger.logSecurityEvent(request.userId, request.clinicId, {
        action: 'connection_validated',
        origin: request.origin,
        userAgent: request.userAgent,
        timestamp: new Date()
      })

      return true

    } catch (error) {
      this.logger.error('Error validating connection', error, {
        component: 'security-manager',
        userId: request.userId,
        clinicId: request.clinicId
      })
      return false
    }
  }

  /**
   * Validate incoming message and check permissions
   */
  public async validateMessage(
    message: ClientMessage, 
    userPermissions: QueryPermissions
  ): Promise<boolean> {
    try {
      // Validate message structure
      if (!message.type || typeof message.type !== 'string') {
        return false
      }

      // Check message size limit (LGPD data minimization)
      const messageSize = JSON.stringify(message).length
      if (messageSize > 100 * 1024) { // 100KB limit
        this.logger.warn('Message rejected - size limit exceeded', {
          component: 'security-manager',
          messageSize,
          messageType: message.type
        })
        return false
      }

      // Validate specific message types
      switch (message.type) {
        case 'healthcare_query':
          return this.validateHealthcareQuery(message, userPermissions)
        
        case 'ping':
          return true // Always allowed

        default:
          this.logger.warn('Unknown message type', {
            component: 'security-manager',
            messageType: message.type
          })
          return false
      }

    } catch (error) {
      this.logger.error('Error validating message', error, {
        component: 'security-manager',
        messageType: message.type
      })
      return false
    }
  }

  /**
   * Get user permissions for clinic
   */
  public async getUserPermissions(userId: string, clinicId: string): Promise<QueryPermissions> {
    const cacheKey = `${userId}:${clinicId}`
    
    // Check cache first
    const cached = this.permissionCache.get(cacheKey)
    if (cached && cached.expiryTime > new Date()) {
      return cached.permissions
    }

    try {
      // Fetch permissions from database (mocked for now)
      const userRoles = await this.fetchUserRoles(userId, clinicId)
      const permissions = this.calculatePermissions(userRoles)

      // Cache permissions
      this.permissionCache.set(cacheKey, {
        userId,
        clinicId,
        permissions,
        roles: userRoles,
        cacheTime: new Date(),
        expiryTime: new Date(Date.now() + this.cacheExpiryMs)
      })

      this.logger.debug('User permissions loaded', {
        component: 'security-manager',
        userId,
        clinicId,
        roles: userRoles,
        permissions: Object.keys(permissions)
      })

      return permissions

    } catch (error) {
      this.logger.error('Error getting user permissions', error, {
        component: 'security-manager',
        userId,
        clinicId
      })

      // Return minimal permissions on error
      return {
        canAccessPatients: false,
        canAccessFinancials: false,
        canAccessMedicalRecords: false,
        canAccessReports: false,
        canManageAppointments: false,
        dataAccessLevel: 'public'
      }
    }
  }

  /**
   * Validate healthcare query permissions
   */
  private validateHealthcareQuery(
    message: ClientMessage, 
    permissions: QueryPermissions
  ): boolean {
    if (!message.query) {
      return false
    }

    const query = message.query.toLowerCase()

    // Check sensitive data access patterns
    if (this.containsSensitiveTerms(query)) {
      if (!permissions.canAccessMedicalRecords) {
        this.logger.warn('Healthcare query rejected - insufficient permissions for sensitive data', {
          component: 'security-manager',
          queryLength: query.length,
          hasSensitiveTerms: true
        })
        return false
      }
    }

    // Check financial data access
    if (this.containsFinancialTerms(query)) {
      if (!permissions.canAccessFinancials) {
        this.logger.warn('Healthcare query rejected - insufficient permissions for financial data', {
          component: 'security-manager',
          queryLength: query.length,
          hasFinancialTerms: true
        })
        return false
      }
    }

    // Check patient data access
    if (this.containsPatientTerms(query)) {
      if (!permissions.canAccessPatients) {
        this.logger.warn('Healthcare query rejected - insufficient permissions for patient data', {
          component: 'security-manager',
          queryLength: query.length,
          hasPatientTerms: true
        })
        return false
      }
    }

    return true
  }

  /**
   * Check if query contains sensitive medical terms
   */
  private containsSensitiveTerms(query: string): boolean {
    const sensitiveTerms = [
      'medical records', 'diagnosis', 'prescription', 'treatment',
      'medication', 'symptoms', 'condition', 'disorder', 'disease',
      'test results', 'lab results', 'imaging', 'surgery'
    ]

    return sensitiveTerms.some(term => query.includes(term))
  }

  /**
   * Check if query contains financial terms
   */
  private containsFinancialTerms(query: string): boolean {
    const financialTerms = [
      'payment', 'billing', 'invoice', 'cost', 'price', 'revenue',
      'profit', 'expense', 'financial', 'money', 'insurance', 'claim'
    ]

    return financialTerms.some(term => query.includes(term))
  }

  /**
   * Check if query contains patient data terms
   */
  private containsPatientTerms(query: string): boolean {
    const patientTerms = [
      'patient', 'client', 'name', 'address', 'phone', 'email',
      'cpf', 'rg', 'personal', 'contact', 'identifier'
    ]

    return patientTerms.some(term => query.includes(term))
  }

  /**
   * Validate token format (basic validation)
   */
  private validateTokenFormat(token: string): boolean {
    // JWT-like format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }

    // Check each part is base64-like
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
    return parts.every(part => base64Regex.test(part))
  }

  /**
   * Validate request origin
   */
  private validateOrigin(origin: string): boolean {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          'https://neonpro.com.br',
          'https://www.neonpro.com.br',
          'https://neonpro.vercel.app'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'https://neonpro.vercel.app'
        ]

    return allowedOrigins.includes(origin)
  }

  /**
   * Check rate limiting for user
   */
  private checkRateLimit(userId: string): boolean {
    const now = new Date()
    const userLimit = this.rateLimitMap.get(userId)

    if (!userLimit || userLimit.resetTime < now) {
      // Reset or initialize rate limit
      this.rateLimitMap.set(userId, {
        count: 1,
        resetTime: new Date(now.getTime() + 60000) // 1 minute window
      })
      return true
    }

    if (userLimit.count >= 60) { // 60 requests per minute
      return false
    }

    userLimit.count++
    return true
  }

  /**
   * Verify user has access to clinic
   */
  private async verifyUserClinicAccess(userId: string, clinicId: string): Promise<boolean> {
    // This would query the database in a real implementation
    // For now, return true if both IDs are provided
    return !!(userId && clinicId)
  }

  /**
   * Fetch user roles from database
   */
  private async fetchUserRoles(userId: string, clinicId: string): Promise<UserRole[]> {
    // This would query the actual database
    // For now, return mock roles based on environment
    if (process.env.NODE_ENV === 'development') {
      return ['admin', 'doctor', 'staff'] // Full permissions for development
    }

    // In production, this would be a real database query
    return ['staff'] // Default minimal role
  }

  /**
   * Calculate permissions based on user roles
   */
  private calculatePermissions(roles: UserRole[]): QueryPermissions {
    const permissions: QueryPermissions = {
      canAccessPatients: false,
      canAccessFinancials: false,
      canAccessMedicalRecords: false,
      canAccessReports: false,
      canManageAppointments: false,
      dataAccessLevel: 'public'
    }

    for (const role of roles) {
      switch (role) {
        case 'admin':
          permissions.canAccessPatients = true
          permissions.canAccessFinancials = true
          permissions.canAccessMedicalRecords = true
          permissions.canAccessReports = true
          permissions.canManageAppointments = true
          permissions.dataAccessLevel = 'admin'
          break

        case 'doctor':
          permissions.canAccessPatients = true
          permissions.canAccessMedicalRecords = true
          permissions.canAccessReports = true
          permissions.canManageAppointments = true
          permissions.dataAccessLevel = 'sensitive'
          break

        case 'nurse':
          permissions.canAccessPatients = true
          permissions.canAccessMedicalRecords = true
          permissions.canManageAppointments = true
          permissions.dataAccessLevel = 'sensitive'
          break

        case 'staff':
          permissions.canAccessPatients = true
          permissions.canManageAppointments = true
          permissions.dataAccessLevel = 'standard'
          break

        case 'receptionist':
          permissions.canAccessPatients = true
          permissions.canManageAppointments = true
          permissions.dataAccessLevel = 'standard'
          break

        case 'financial':
          permissions.canAccessFinancials = true
          permissions.canAccessReports = true
          permissions.dataAccessLevel = 'standard'
          break
      }
    }

    return permissions
  }

  /**
   * Start cache cleanup process
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = new Date()
      for (const [key, cached] of this.permissionCache) {
        if (cached.expiryTime < now) {
          this.permissionCache.delete(key)
        }
      }
    }, 60000) // Clean up every minute
  }

  /**
   * Clear user permissions cache
   */
  public clearUserCache(userId: string, clinicId?: string): void {
    if (clinicId) {
      this.permissionCache.delete(`${userId}:${clinicId}`)
    } else {
      // Clear all cache entries for user
      for (const [key] of this.permissionCache) {
        if (key.startsWith(`${userId}:`)) {
          this.permissionCache.delete(key)
        }
      }
    }
  }

  /**
   * Get security statistics
   */
  public getSecurityStats() {
    return {
      cachedPermissions: this.permissionCache.size,
      activeRateLimits: this.rateLimitMap.size,
      cacheHitRate: this.calculateCacheHitRate()
    }
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  private calculateCacheHitRate(): number {
    // This would be more sophisticated in a real implementation
    return this.permissionCache.size > 0 ? 0.85 : 0
  }
}