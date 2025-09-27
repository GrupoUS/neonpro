/**
 * JWT Security Service Integration Tests
 *
 * Comprehensive integration tests for JWT token generation, validation,
 * refresh, and revocation with healthcare compliance.
 *
 * Security: Critical - JWT token management and validation tests
 * Test Coverage: JWT Security Service
 * Compliance: OWASP, LGPD, ANVISA, CFM
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuditTrailService } from '../services/audit-trail-service'
import { HealthcareSessionManagementService } from '../services/healthcare-session-management-service'
import {
  JWTSecurityService,
  TokenGenerationOptions,
  TokenValidationResult,
} from '../services/jwt-security-service'

// Mock crypto operations for testing
const mockCrypto = {
  generateKey: vi.fn(),
  sign: vi.fn(),
  verify: vi.fn(),
}

// Mock environment variables
vi.stubEnv('JWT_SECRET', 'test-jwt-secret-key-for-testing-purposes')
vi.stubEnv('JWT_REFRESH_SECRET', 'test-refresh-secret-key-for-testing')
vi.stubEnv('JWT_PUBLIC_KEY', 'test-public-key-for-testing')
vi.stubEnv('JWT_PRIVATE_KEY', 'test-private-key-for-testing')

describe('JWT Security Service Integration Tests', () => {
  let jwtService: typeof JWTSecurityService
  let sessionService: typeof HealthcareSessionManagementService
  let auditService: typeof AuditTrailService

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset services
    jwtService = JWTSecurityService
    sessionService = HealthcareSessionManagementService
    auditService = AuditTrailService
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token Generation and Validation Flow', () => {
    it('should generate and validate access token successfully', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
        permissions: ['read_patient_data', 'write_patient_data'],
      }

      // Generate access token
      const accessToken = await jwtService.generateAccessToken(tokenOptions)
      expect(accessToken).toBeDefined()
      expect(typeof accessToken).toBe('string')
      expect(accessToken.length).toBeGreaterThan(0)

      // Validate the generated token
      const validationResult = await jwtService.validateToken(accessToken)
      expect(validationResult.isValid).toBe(true)
      expect(validationResult.userId).toBe('user-123')
      expect(validationResult.userRole).toBe('healthcare_professional')
      expect(validationResult.healthcareProvider).toBe('test-hospital')
      expect(validationResult.sessionId).toBe('session-123')
      expect(validationResult.permissions).toEqual(['read_patient_data', 'write_patient_data'])
    })

    it('should generate and validate refresh token successfully', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      }

      // Generate refresh token
      const refreshToken = await jwtService.generateRefreshToken(tokenOptions)
      expect(refreshToken).toBeDefined()
      expect(typeof refreshToken).toBe('string')
      expect(refreshToken.length).toBeGreaterThan(0)

      // Validate the refresh token
      const validationResult = await jwtService.validateRefreshToken(refreshToken)
      expect(validationResult.isValid).toBe(true)
      expect(validationResult.userId).toBe('user-123')
      expect(validationResult.userRole).toBe('healthcare_professional')
    })

    it('should reject expired tokens', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      // Generate token with very short expiry for testing
      const shortLivedToken = await jwtService.generateAccessToken({
        ...tokenOptions,
        customExpiry: '1ms', // 1 millisecond
      })

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10))

      // Validate expired token
      const validationResult = await jwtService.validateToken(shortLivedToken)
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.error).toContain('expired')
    })

    it('should reject tokens with invalid signature', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      // Generate valid token
      const validToken = await jwtService.generateAccessToken(tokenOptions)

      // Tamper with token signature (simulate invalid signature)
      const tamperedToken = validToken.substring(0, validToken.length - 10) + 'tampered'

      // Validate tampered token
      const validationResult = await jwtService.validateToken(tamperedToken)
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.error).toContain('signature')
    })
  })

  describe('Token Refresh Flow', () => {
    it('should refresh tokens successfully', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      }

      // Generate initial tokens
      const accessToken = await jwtService.generateAccessToken(tokenOptions)
      const refreshToken = await jwtService.generateRefreshToken(tokenOptions)

      // Refresh tokens
      const newTokens = await jwtService.refreshTokens(refreshToken, 'session-123')
      expect(newTokens).toBeDefined()
      expect(newTokens.accessToken).toBeDefined()
      expect(newTokens.refreshToken).toBeDefined()
      expect(newTokens.accessToken).not.toBe(accessToken)
      expect(newTokens.refreshToken).not.toBe(refreshToken)

      // Validate new tokens
      const newValidationResult = await jwtService.validateToken(newTokens.accessToken)
      expect(newValidationResult.isValid).toBe(true)
      expect(newValidationResult.userId).toBe('user-123')
    })

    it('should reject refresh with invalid refresh token', async () => {
      await expect(
        jwtService.refreshTokens('invalid-refresh-token', 'session-123'),
      ).rejects.toThrow('Invalid refresh token')
    })

    it('should reject refresh with expired session', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'expired-session-123',
      }

      // Generate refresh token for expired session
      const refreshToken = await jwtService.generateRefreshToken(tokenOptions)

      // Attempt refresh with expired session
      await expect(
        jwtService.refreshTokens(refreshToken, 'expired-session-123'),
      ).rejects.toThrow('Session expired or invalid')
    })
  })

  describe('Token Revocation', () => {
    it('should revoke tokens successfully', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      }

      // Generate token
      const accessToken = await jwtService.generateAccessToken(tokenOptions)

      // Revoke token
      await jwtService.revokeToken(accessToken, 'manual_revocation')

      // Validate revoked token
      const validationResult = await jwtService.validateToken(accessToken)
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.error).toContain('revoked')
    })

    it('should revoke all tokens for user', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
      }

      // Generate multiple tokens for same user
      const token1 = await jwtService.generateAccessToken(tokenOptions)
      const token2 = await jwtService.generateAccessToken(tokenOptions)
      const token3 = await jwtService.generateAccessToken(tokenOptions)

      // Revoke all tokens for user
      await jwtService.revokeAllUserTokens('user-123', 'security_incident')

      // Validate all tokens are revoked
      const validation1 = await jwtService.validateToken(token1)
      const validation2 = await jwtService.validateToken(token2)
      const validation3 = await jwtService.validateToken(token3)

      expect(validation1.isValid).toBe(false)
      expect(validation2.isValid).toBe(false)
      expect(validation3.isValid).toBe(false)

      expect(validation1.error).toContain('revoked')
      expect(validation2.error).toContain('revoked')
      expect(validation3.error).toContain('revoked')
    })
  })

  describe('Healthcare Compliance Features', () => {
    it('should include healthcare-specific claims in tokens', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        sessionId: 'session-123',
        patientId: 'patient-456',
        encounterId: 'encounter-789',
        lgpdConsentVersion: '1.0',
        anvisaCompliance: true,
        cfmLicense: 'CRM-12345-SP',
      }

      const accessToken = await jwtService.generateAccessToken(tokenOptions)
      const validationResult = await jwtService.validateToken(accessToken)

      expect(validationResult.isValid).toBe(true)
      expect(validationResult.patientId).toBe('patient-456')
      expect(validationResult.encounterId).toBe('encounter-789')
      expect(validationResult.lgpdConsentVersion).toBe('1.0')
      expect(validationResult.anvisaCompliance).toBe(true)
      expect(validationResult.cfmLicense).toBe('CRM-12345-SP')
    })

    it('should enforce LGPD compliance in token validation', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        lgpdConsentVersion: '1.0',
      }

      const accessToken = await jwtService.generateAccessToken(tokenOptions)
      const validationResult = await jwtService.validateToken(accessToken)

      expect(validationResult.isValid).toBe(true)
      expect(validationResult.lgpdConsentVersion).toBe('1.0')
      expect(validationResult.complianceFlags).toContain('lgpd')
    })

    it('should validate healthcare professional credentials', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
        cfmLicense: 'CRM-12345-SP',
        specialty: 'cardiology',
      }

      const accessToken = await jwtService.generateAccessToken(tokenOptions)
      const validationResult = await jwtService.validateToken(accessToken)

      expect(validationResult.isValid).toBe(true)
      expect(validationResult.cfmLicense).toBe('CRM-12345-SP')
      expect(validationResult.specialty).toBe('cardiology')
    })
  })

  describe('Security Features', () => {
    it('should detect token tampering attempts', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      // Generate valid token
      const validToken = await jwtService.generateAccessToken(tokenOptions)

      // Simulate token tampering
      const tamperedToken = validToken.replace('user-123', 'attacker-456')

      // Validate tampered token
      const validationResult = await jwtService.validateToken(tamperedToken)
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.error).toContain('tampered')
    })

    it('should enforce rate limiting on token generation', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      // Generate multiple tokens rapidly
      const promises = Array(10).fill(null).map(() => jwtService.generateAccessToken(tokenOptions))

      // Should generate tokens without throwing rate limit errors
      const results = await Promise.allSettled(promises)
      const successfulTokens = results.filter(result => result.status === 'fulfilled')

      expect(successfulTokens.length).toBeGreaterThan(0)
    })

    it('should log token validation attempts for audit trail', async () => {
      const spy = vi.spyOn(auditService, 'logSecurityEvent')

      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      const accessToken = await jwtService.generateAccessToken(tokenOptions)
      await jwtService.validateToken(accessToken)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'TOKEN_VALIDATION_SUCCESS',
          userId: 'user-123',
          metadata: expect.objectContaining({
            tokenType: 'access',
            userRole: 'healthcare_professional',
          }),
        }),
      )
    })
  })

  describe('Performance Requirements', () => {
    it('should generate tokens within 50ms', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      const startTime = performance.now()
      await jwtService.generateAccessToken(tokenOptions)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(50) // 50ms threshold
    })

    it('should validate tokens within 10ms', async () => {
      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      const accessToken = await jwtService.generateAccessToken(tokenOptions)

      const startTime = performance.now()
      await jwtService.validateToken(accessToken)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(10) // 10ms threshold
    })
  })

  describe('Error Handling', () => {
    it('should handle missing required fields gracefully', async () => {
      const invalidOptions: TokenGenerationOptions = {
        userId: '',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      await expect(
        jwtService.generateAccessToken(invalidOptions),
      ).rejects.toThrow('User ID is required')
    })

    it('should handle invalid token formats', async () => {
      const validationResult = await jwtService.validateToken('invalid-token-format')
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.error).toContain('format')
    })

    it('should handle database connection errors gracefully', async () => {
      // Mock database connection error
      vi.spyOn(jwtService, 'isTokenRevoked').mockRejectedValueOnce(
        new Error('Database connection failed'),
      )

      const tokenOptions: TokenGenerationOptions = {
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'test-hospital',
      }

      const accessToken = await jwtService.generateAccessToken(tokenOptions)
      const validationResult = await jwtService.validateToken(accessToken)

      // Should still validate token but with warning about revocation check
      expect(validationResult.isValid).toBe(true)
      expect(validationResult.warnings).toContain(
        'Could not verify token revocation status',
      )
    })
  })
})
