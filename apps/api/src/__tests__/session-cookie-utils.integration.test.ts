/**
 * Comprehensive integration tests for session cookie utilities
 * Validates secure cookie generation, validation, and management for healthcare sessions
 * Security: Critical - Session cookie utilities integration tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SessionCookieUtils } from '../security/session-cookie-utils'
import { HealthcareSessionManagementService } from '../services/healthcare-session-management-service'
import { SecurityValidationService } from '../services/security-validation-service'

// Mock external dependencies
vi.mock('../services/healthcare-session-management-service', () => ({
  HealthcareSessionManagementService: {
    validateSession: vi.fn(),
    getSession: vi.fn(),
    createSession: vi.fn(),
  },
}))

vi.mock('../services/security-validation-service', () => ({
  SecurityValidationService: {
    validateRequestSecurity: vi.fn(),
    detectSessionHijacking: vi.fn(),
  },
}))

describe('Session Cookie Utils Integration Tests', () => {
  let cookieUtils: typeof SessionCookieUtils
  let sessionService: typeof HealthcareSessionManagementService
  let validationService: typeof SecurityValidationService

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()
    
    // Initialize services
    cookieUtils = SessionCookieUtils
    sessionService = HealthcareSessionManagementService
    validationService = SecurityValidationService

    // Set up environment variables
    vi.stubEnv('SESSION_SECRET', 'test-session-secret-for-healthcare-app')
    vi.stubEnv('COOKIE_DOMAIN', '.localhost')
    vi.stubEnv('COOKIE_SECURE', 'true')
    vi.stubEnv('COOKIE_SAMESITE', 'strict')
    vi.stubEnv('SESSION_TIMEOUT', '3600')
  })

  afterEach(() => {
    // Clean up environment
    vi.unstubAllEnvs()
  })

  describe('Cookie Generation', () => {
    it('should generate secure session cookies with proper attributes', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'physician',
        healthcareProvider: 'Hospital São Lucas',
        cfmLicense: 'CRM-12345-SP',
        lgpdConsent: true,
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      expect(cookie.value).toBeDefined()
      expect(cookie.signature).toBeDefined()
      expect(cookie.options).toBeDefined()
      expect(cookie.options.httpOnly).toBe(true)
      expect(cookie.options.secure).toBe(true)
      expect(cookie.options.sameSite).toBe('strict')
      expect(cookie.options.domain).toBe('.localhost')
      expect(cookie.options.maxAge).toBe(3600)
    })

    it('should include healthcare-specific data in cookies', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'radiologist',
        healthcareProvider: 'Hospital São Lucas',
        specialty: 'cardiology',
        anvisaCompliance: true,
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      const decodedPayload = await cookieUtils.decodeCookiePayload(cookie.value)
      
      expect(decodedPayload.sessionId).toBe('session-123')
      expect(decodedPayload.userRole).toBe('radiologist')
      expect(decodedPayload.healthcareProvider).toBe('Hospital São Lucas')
      expect(decodedPayload.specialty).toBe('cardiology')
      expect(decodedPayload.anvisaCompliance).toBe(true)
    })

    it('should generate cookies with LGPD compliance metadata', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        lgpdConsentVersion: '1.0',
        lgpdConsentDate: new Date().toISOString(),
        dataProcessingConsent: true,
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      const decodedPayload = await cookieUtils.decodeCookiePayload(cookie.value)
      
      expect(decodedPayload.lgpdConsentVersion).toBe('1.0')
      expect(decodedPayload.dataProcessingConsent).toBe(true)
      expect(decodedPayload.complianceMetadata).toBeDefined()
    })

    it('should handle cookie generation failures gracefully', async () => {
      const invalidSessionData = null

      await expect(
        cookieUtils.generateSessionCookie(invalidSessionData)
      ).rejects.toThrow('Invalid session data')
    })
  })

  describe('Cookie Validation', () => {
    it('should validate properly signed session cookies', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'physician',
      }

      // Generate cookie
      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          isActive: true,
        },
      })

      // Validate cookie
      const result = await cookieUtils.validateSessionCookie(cookie.value)

      expect(result.valid).toBe(true)
      expect(result.sessionId).toBe('session-123')
      expect(result.userId).toBe('user-123')
      expect(result.userRole).toBe('physician')
    })

    it('should reject cookies with invalid signatures', async () => {
      const validCookie = await cookieUtils.generateSessionCookie({
        sessionId: 'session-123',
        userId: 'user-123',
      })

      // Tamper with the signature
      const tamperedCookie = {
        ...validCookie,
        signature: 'invalid-signature',
      }

      const result = await cookieUtils.validateSessionCookie(tamperedCookie.value)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('invalid_signature')
    })

    it('should reject expired session cookies', async () => {
      const expiredSessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        expiry: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
      }

      const cookie = await cookieUtils.generateSessionCookie(expiredSessionData)

      const result = await cookieUtils.validateSessionCookie(cookie.value)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('session_expired')
    })

    it('should detect and reject tampered cookie data', async () => {
      const originalSessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'physician',
      }

      const cookie = await cookieUtils.generateSessionCookie(originalSessionData)

      // Attempt to tamper with cookie value
      const decoded = JSON.parse(Buffer.from(cookie.value.split('.')[0], 'base64').toString())
      decoded.userRole = 'system_administrator' // Privilege escalation attempt
      const tamperedValue = `${Buffer.from(JSON.stringify(decoded)).toString('base64')}.${cookie.value.split('.')[1]}`

      const result = await cookieUtils.validateSessionCookie(tamperedValue)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('signature_mismatch')
      expect(result.securityThreat).toBe(true)
    })
  })

  describe('Cookie Security Features', () => {
    it('should implement anti-tampering mechanisms', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'physician',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Verify cryptographic signature
      expect(cookie.signature).toBeDefined()
      expect(cookie.signature.length).toBeGreaterThan(32) // Reasonable signature length

      // Verify integrity protection
      const isValid = await cookieUtils.verifyCookieIntegrity(cookie.value, cookie.signature)
      expect(isValid).toBe(true)
    })

    it('should implement secure cookie attributes for production', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      // Test production environment
      vi.stubEnv('NODE_ENV', 'production')
      const productionCookie = await cookieUtils.generateSessionCookie(sessionData)

      expect(productionCookie.options.secure).toBe(true)
      expect(productionCookie.options.httpOnly).toBe(true)
      expect(productionCookie.options.sameSite).toBe('strict')
      expect(productionCookie.options.domain).toBeDefined()

      // Test development environment
      vi.stubEnv('NODE_ENV', 'development')
      const devCookie = await cookieUtils.generateSessionCookie(sessionData)

      expect(devCookie.options.secure).toBe(false) // Allow HTTP in development
      expect(devCookie.options.httpOnly).toBe(true)
      expect(devCookie.options.sameSite).toBe('lax')
    })

    it('should implement session binding security', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'physician',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)
      const decoded = await cookieUtils.decodeCookiePayload(cookie.value)

      expect(decoded.sessionBinding).toBeDefined()
      expect(decoded.sessionBinding.userAgentHash).toBeDefined()
      expect(decoded.sessionBinding.ipAddressHash).toBeDefined()
    })
  })

  describe('Session Management Integration', () => {
    it('should integrate with session service for validation', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'physician',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          isActive: true,
          lastAccessed: new Date(),
        },
      })

      const result = await cookieUtils.validateSessionCookie(cookie.value)

      expect(result.valid).toBe(true)
      expect(sessionService.validateSession).toHaveBeenCalledWith('session-123')
    })

    it('should handle session expiration gracefully', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Mock expired session
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: false,
        error: 'Session expired',
      })

      const result = await cookieUtils.validateSessionCookie(cookie.value)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('session_expired')
    })

    it('should update last accessed timestamp on validation', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Mock session service methods
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          isActive: true,
          lastAccessed: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        },
      })

      vi.spyOn(sessionService, 'getSession').mockResolvedValueOnce({
        id: 'session-123',
        userId: 'user-123',
        lastAccessed: new Date(),
      })

      const result = await cookieUtils.validateSessionCookie(cookie.value)

      expect(result.valid).toBe(true)
      expect(sessionService.getSession).toHaveBeenCalledWith('session-123')
    })
  })

  describe('Security Validation Integration', () => {
    it('should validate request security with cookies', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Mock security validation
      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: true,
        securityScore: 95,
        threats: [],
      })

      const mockRequest = {
        headers: {
          'user-agent': 'Mozilla/5.0 (Test Browser)',
          'x-forwarded-for': '192.168.1.1',
        },
        cookies: {
          sessionId: cookie.value,
        },
      }

      const result = await cookieUtils.validateRequestWithCookie(mockRequest)

      expect(result.authorized).toBe(true)
      expect(result.securityScore).toBe(95)
      expect(validationService.validateRequestSecurity).toHaveBeenCalled()
    })

    it('should detect session hijacking attempts', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'physician',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Mock session hijacking detection
      vi.spyOn(validationService, 'detectSessionHijacking').mockResolvedValueOnce({
        threatDetected: true,
        threatType: 'ip_address_mismatch',
        confidence: 0.85,
      })

      const mockRequest = {
        headers: {
          'user-agent': 'Different Browser/1.0',
          'x-forwarded-for': '10.0.0.1', // Different IP
        },
        cookies: {
          sessionId: cookie.value,
        },
      }

      const result = await cookieUtils.validateRequestWithCookie(mockRequest)

      expect(result.authorized).toBe(false)
      expect(result.threatDetected).toBe(true)
      expect(result.threatType).toBe('ip_address_mismatch')
    })

    it('should enforce concurrent session limits', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Mock multiple active sessions for same user
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          isActive: true,
          concurrentSessions: 3,
        },
      })

      const result = await cookieUtils.validateSessionCookie(cookie.value)

      expect(result.valid).toBe(true)
      expect(result.concurrentSessions).toBe(3)
      expect(result.warnings).toContain('multiple_active_sessions')
    })
  })

  describe('Performance and Scalability', () => {
    it('should generate cookies within acceptable time', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        userRole: 'physician',
      }

      const startTime = performance.now()
      const cookie = await cookieUtils.generateSessionCookie(sessionData)
      const endTime = performance.now()

      expect(cookie).toBeDefined()
      expect(endTime - startTime).toBeLessThan(10) // < 10ms
    })

    it('should validate cookies within acceptable time', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          isActive: true,
        },
      })

      const startTime = performance.now()
      const result = await cookieUtils.validateSessionCookie(cookie.value)
      const endTime = performance.now()

      expect(result.valid).toBe(true)
      expect(endTime - startTime).toBeLessThan(50) // < 50ms
    })

    it('should handle high volume of cookie operations', async () => {
      const operationCount = 100
      const operations = []

      for (let i = 0; i < operationCount; i++) {
        operations.push(
          cookieUtils.generateSessionCookie({
            sessionId: `session-${i}`,
            userId: `user-${i}`,
            userRole: 'physician',
          })
        )
      }

      const startTime = performance.now()
      const results = await Promise.allSettled(operations)
      const endTime = performance.now()

      const successfulResults = results.filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled'
      )

      expect(successfulResults.length).toBe(operationCount)
      expect(endTime - startTime).toBeLessThan(1000) // < 1 second for 100 operations
    })
  })

  describe('Cookie Lifecycle Management', () => {
    it('should generate expiration cookies for logout', async () => {
      const expirationCookie = await cookieUtils.generateExpirationCookie('session-123')

      expect(expirationCookie.value).toBe('')
      expect(expirationCookie.options.maxAge).toBe(0)
      expect(expirationCookie.options.expires).toBeInstanceOf(Date)
      expect(expirationCookie.name).toBe('sessionId')
    })

    it('should implement cookie rotation for security', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      const originalCookie = await cookieUtils.generateSessionCookie(sessionData)

      // Simulate time passing
      vi.advanceTimersByTime(30 * 60 * 1000) // 30 minutes

      const rotatedCookie = await cookieUtils.rotateSessionCookie(originalCookie)

      expect(rotatedCookie.value).not.toBe(originalCookie.value)
      expect(rotatedCookie.signature).not.toBe(originalCookie.signature)
      expect(rotatedCookie.sessionId).toBe(originalCookie.sessionId)
    })

    it('should handle cookie cleanup on session termination', async () => {
      const sessionId = 'session-123'

      // Mock session cleanup
      vi.spyOn(sessionService, 'getSession').mockResolvedValueOnce({
        id: sessionId,
        userId: 'user-123',
        isActive: false,
      })

      const cleanupResult = await cookieUtils.cleanupSessionCookies(sessionId)

      expect(cleanupResult.cookiesCleared).toBe(true)
      expect(cleanupResult.clearedCount).toBeGreaterThan(0)
      expect(cleanupResult.sessionId).toBe(sessionId)
    })
  })

  describe('Error Handling and Security', () => {
    it('should handle malformed cookie values gracefully', async () => {
      const malformedCookie = 'invalid-cookie-format'

      const result = await cookieUtils.validateSessionCookie(malformedCookie)

      expect(result.valid).toBe(false)
      expect(result.reason).toContain('malformed_cookie')
    })

    it('should prevent cookie replay attacks', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Mock replay detection
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: false,
        error: 'Session already used',
        replayDetected: true,
      })

      const result = await cookieUtils.validateSessionCookie(cookie.value)

      expect(result.valid).toBe(false)
      expect(result.replayDetected).toBe(true)
      expect(result.reason).toContain('replay_attack')
    })

    it('should validate cookie size limits', async () => {
      const largeSessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
        // Add excessive data to exceed cookie size limits
        extendedData: 'x'.repeat(4000), // 4KB of data
      }

      await expect(
        cookieUtils.generateSessionCookie(largeSessionData)
      ).rejects.toThrow('Cookie size exceeds limits')
    })

    it('should implement proper error logging for security events', async () => {
      const sessionData = {
        sessionId: 'session-123',
        userId: 'user-123',
      }

      const cookie = await cookieUtils.generateSessionCookie(sessionData)

      // Simulate security threat
      vi.spyOn(validationService, 'detectSessionHijacking').mockResolvedValueOnce({
        threatDetected: true,
        threatType: 'suspicious_activity',
        confidence: 0.9,
      })

      const mockRequest = {
        headers: {
          'user-agent': 'Suspicious Agent/1.0',
        },
        cookies: {
          sessionId: cookie.value,
        },
      }

      await cookieUtils.validateRequestWithCookie(mockRequest)

      // Verify security event was logged
      expect(validationService.detectSessionHijacking).toHaveBeenCalled()
    })
  })
})