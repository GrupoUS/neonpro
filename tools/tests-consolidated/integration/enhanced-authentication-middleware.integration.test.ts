/**
 * Enhanced Authentication Middleware Integration Tests
 * 
 * Comprehensive integration tests for enhanced authentication middleware
 * with JWT validation, session management, RBAC, and healthcare compliance.
 * 
 * @security_critical
 * @test_coverage Enhanced Authentication Middleware
 * @compliance OWASP, LGPD, ANVISA, CFM
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Context, Next } from 'hono'
import { EnhancedAuthenticationMiddleware, AuthenticationContext, AuthenticationOptions } from '@api/middleware/enhanced-authentication-middleware'
import { JWTSecurityService } from '@api/services/jwt-security-service'
import {
  HealthcareSessionManagementService,
  SecurityValidationService,
  AuditTrailService
} from '@api/__tests__/mock-services'

// Mock Hono context
const createMockContext = (overrides = {}): Context => {
  const req = {
    header: vi.fn(),
    method: 'GET',
    path: '/api/test',
    url: 'http://localhost:3000/api/test',
  } as any

  const res = {
    status: 200,
    headers: new Map(),
  }

  return {
    req,
    res,
    header: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    ...overrides,
  } as any
}

const createMockNext = (): Next => {
  return vi.fn().mockResolvedValue(undefined)
}

describe('Enhanced Authentication Middleware Integration Tests', () => {
  let authMiddleware: typeof EnhancedAuthenticationMiddleware
  let jwtService: typeof JWTSecurityService
  let sessionService: typeof HealthcareSessionManagementService
  let validationService: typeof SecurityValidationService
  let auditService: typeof AuditTrailService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset services
    authMiddleware = EnhancedAuthenticationMiddleware
    jwtService = JWTSecurityService
    sessionService = HealthcareSessionManagementService
    validationService = SecurityValidationService
    auditService = AuditTrailService

    // Mock environment variables
    process.env.JWT_SECRET = 'test-jwt-secret'
    process.env.SESSION_SECRET = 'test-session-secret'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up environment variables
    delete process.env.JWT_SECRET
    delete process.env.SESSION_SECRET
  })

  describe('JWT Authentication Flow', () => {
    it('should authenticate successfully with valid JWT', async () => {
      // Create test context with JWT header
      const testContext = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer custom-test-token')
            .mockReturnValueOnce('192.168.1.1')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      // Mock the JWT service to return a valid response
      // Use a custom token that doesn't trigger the built-in test handling
      const jwtMock = vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        payload: {
          sub: 'user-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          healthcareProvider: 'test-hospital',
          permissions: ['read_patient_data'],
          sessionId: 'session-123',
          cfmLicense: 'CRM-12345-SP',
          anvisaCompliance: true,
          lgpdConsentVersion: '1.0'
        },
      })

      // Call the authentication method
      const result = await EnhancedAuthenticationMiddleware.authenticateRequest(testContext, {
        requireAuth: true,
        methods: ['jwt'],
      })

      // Assert the result
      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(true)
      expect(result.userId).toBe('user-123')
      expect(result.userRole).toBe('healthcare_professional')
      expect(result.healthcareProvider).toBe('test-hospital')
      expect(result.permissions).toEqual(['read_patient_data'])
      expect(result.sessionId).toBe('session-123')
      expect(result.cfmLicense).toBe('CRM-12345-SP')
      expect(result.anvisaCompliance).toBe(true)
      expect(result.lgpdConsentVersion).toBe('1.0')

      // Verify the mock was called
      expect(jwtMock).toHaveBeenCalledWith('custom-test-token')
    })

    it('should reject authentication with invalid JWT', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer invalid-jwt-token')
            .mockReturnValueOnce('192.168.1.1')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      // Mock the JWT service to return an invalid response
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: false,
        error: 'Invalid token signature',
        errorCode: 'INVALID_SIGNATURE'
      })

      // Call the authentication method
      const result = await EnhancedAuthenticationMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
      })

      // Assert the result
      expect(result.isAuthenticated).toBe(false)
      expect(result.isAuthorized).toBe(false)
      expect(result.error).toBe('Invalid token signature')
    })

    it('should reject authentication with invalid JWT', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer invalid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation failure
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: false,
        error: 'Invalid token signature',
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
      })

      expect(result.isAuthenticated).toBe(false)
      expect(result.error).toContain('Invalid token signature')
    })

    it('should reject authentication with expired JWT', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer expired-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with expired token
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: false,
        error: 'Token expired',
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
      })

      expect(result.isAuthenticated).toBe(false)
      expect(result.error).toContain('Token expired')
    })
  })

  describe('Session Authentication Flow', () => {
    it('should authenticate successfully with valid session', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('sessionId=session-123; sessionSig=valid-signature')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          isActive: true,
        },
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['session'],
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.userId).toBe('user-123')
      expect(result.userRole).toBe('healthcare_professional')
      expect(result.sessionId).toBe('session-123')
    })

    it('should reject authentication with invalid session', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('sessionId=invalid-session')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock session validation failure
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: false,
        error: 'Session not found',
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['session'],
      })

      expect(result.isAuthenticated).toBe(false)
      expect(result.error).toContain('Session not found')
    })
  })

  describe('Multi-Method Authentication', () => {
    it('should try JWT first, then session if JWT fails', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer invalid-jwt-token')
            .mockReturnValueOnce('sessionId=session-123; sessionSig=valid-signature')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation failure
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: false,
        error: 'Invalid JWT',
      })

      // Mock session validation success
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          isActive: true,
        },
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt', 'session'],
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.userId).toBe('user-123')
      expect(result.authenticationMethod).toBe('session')
    })

    it('should fail if all authentication methods fail', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer invalid-jwt-token')
            .mockReturnValueOnce('sessionId=invalid-session')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock both JWT and session validation failures
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: false,
        error: 'Invalid JWT',
      })

      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: false,
        error: 'Invalid session',
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt', 'session'],
      })

      expect(result.isAuthenticated).toBe(false)
      expect(result.error).toContain('All authentication methods failed')
    })
  })

  describe('Role-Based Access Control (RBAC)', () => {
    it('should grant access for authorized role', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with admin role
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'admin',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
        permissions: ['manage_users'],
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
        requiredRoles: ['admin', 'healthcare_professional'],
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(true)
      expect(result.userRole).toBe('admin')
    })

    it('should deny access for unauthorized role', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with basic user role
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'patient',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
        permissions: ['view_own_data'],
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
        requiredRoles: ['admin', 'healthcare_professional'],
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(false)
      expect(result.error).toContain('Insufficient permissions')
    })
  })

  describe('Permission-Based Access Control', () => {
    it('should grant access with required permissions', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with required permissions
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
        permissions: ['read_patient_data', 'write_patient_data'],
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
        requiredPermissions: ['read_patient_data'],
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(true)
      expect(result.hasPermission('read_patient_data')).toBe(true)
    })

    it('should deny access without required permissions', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation without required permissions
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
        permissions: ['view_own_data'],
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
        requiredPermissions: ['read_patient_data'],
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(false)
      expect(result.error).toContain('Insufficient permissions')
    })
  })

  describe('Healthcare Compliance Features', () => {
    it('should validate healthcare provider access', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with healthcare provider
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
        cfmLicense: 'CRM-12345-SP',
        anvisaCompliance: true,
        lgpdConsentVersion: '1.0',
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
        requireHealthcareProvider: true,
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(true)
      expect(result.healthcareProvider).toBe('test-hospital')
      expect(result.cfmLicense).toBe('CRM-12345-SP')
      expect(result.anvisaCompliance).toBe(true)
      expect(result.lgpdConsentVersion).toBe('1.0')
    })

    it('should enforce LGPD consent validation', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation without LGPD consent
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
        requireLGPDConsent: true,
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(false)
      expect(result.error).toContain('LGPD consent required')
    })
  })

  describe('Security Features', () => {
    it('should validate request security', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      })

      // Mock security validation
      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: true,
        securityScore: 95,
        threats: [],
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
        enableSecurityValidation: true,
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(true)
      expect(result.securityScore).toBe(95)
    })

    it('should reject requests with security threats', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      })

      // Mock security validation with threats
      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: false,
        securityScore: 25,
        threats: ['suspicious_user_agent', 'rate_limit_exceeded'],
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
        enableSecurityValidation: true,
      })

      expect(result.isAuthenticated).toBe(true)
      expect(result.isAuthorized).toBe(false)
      expect(result.error).toContain('Security validation failed')
    })

    it('should log authentication attempts for audit trail', async () => {
      const spy = vi.spyOn(auditService, 'logSecurityEvent')

      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      })

      await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
      })

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTHENTICATION_SUCCESS',
          userId: 'user-123',
          metadata: expect.objectContaining({
            authenticationMethod: 'jwt',
            userRole: 'healthcare_professional',
          }),
        })
      )
    })
  })

  describe('Performance Requirements', () => {
    it('should authenticate within 500ms', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      })

      const startTime = performance.now()
      await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
      })
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(500) // 500ms threshold
    })
  })

  describe('Error Handling', () => {
    it('should handle missing authentication gracefully', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn().mockReturnValueOnce(''),
        },
      })

      const next = createMockNext()

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt', 'session'],
      })

      expect(result.isAuthenticated).toBe(false)
      expect(result.error).toContain('No authentication provided')
    })

    it('should handle service failures gracefully', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT service failure
      vi.spyOn(jwtService, 'validateToken').mockRejectedValueOnce(
        new Error('JWT service unavailable')
      )

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
      })

      expect(result.isAuthenticated).toBe(false)
      expect(result.error).toContain('Authentication service unavailable')
    })

    it('should provide detailed error information for debugging', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer invalid-jwt-token')
            .mockReturnValueOnce('localhost')
            .mockReturnValueOnce('test-user-agent'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with detailed error
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: false,
        error: 'Invalid token signature: verification failed',
        errorCode: 'INVALID_SIGNATURE',
      })

      const result = await authMiddleware.authenticateRequest(c, {
        requireAuth: true,
        methods: ['jwt'],
      })

      expect(result.isAuthenticated).toBe(false)
      expect(result.error).toBe('Invalid token signature: verification failed')
      expect(result.errorCode).toBe('INVALID_SIGNATURE')
    })
  })
})