/**
 * Comprehensive integration tests for aesthetic clinic MFA service
 * Validates multi-factor authentication for aesthetic medicine professionals
 * Security: Critical - Aesthetic MFA service integration tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AestheticMFAService } from '../security/aesthetic-mfa-service'
import { HealthcareSessionManagementService } from '../services/healthcare-session-management-service'
import { SecurityValidationService } from '../services/security-validation-service'

// Mock external dependencies
vi.mock('../services/healthcare-session-management-service', () => ({
  HealthcareSessionManagementService: {
    validateSession: vi.fn(),
    updateSessionSecurity: vi.fn(),
    logSecurityEvent: vi.fn(),
  },
}))

vi.mock('../services/security-validation-service', () => ({
  SecurityValidationService: {
    validateMFAToken: vi.fn(),
    detectSuspiciousActivity: vi.fn(),
  },
}))

// Mock notification service
vi.mock('../services/notification-service', () => ({
  NotificationService: {
    sendNotification: vi.fn(),
  },
}))

describe('Aesthetic MFA Service Integration Tests', () => {
  let mfaService: typeof AestheticMFAService
  let sessionService: typeof HealthcareSessionManagementService
  let validationService: typeof SecurityValidationService

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks()

    // Initialize services
    mfaService = AestheticMFAService
    sessionService = HealthcareSessionManagementService
    validationService = SecurityValidationService

    // Set up environment variables
    vi.stubEnv('MFA_SECRET_KEY', 'test-mfa-secret-for-aesthetic-clinic')
    vi.stubEnv('MFA_BACKUP_CODES_ENABLED', 'true')
    vi.stubEnv('MFA_RATE_LIMIT', '5')
    vi.stubEnv('MFA_LOCKOUT_DURATION', '900') // 15 minutes
  })

  afterEach(() => {
    // Clean up environment
    vi.unstubAllEnvs()
  })

  describe('MFA Enrollment', () => {
    it('should enroll aesthetic professionals in MFA with proper verification', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          email: 'physician@clinic.com',
          phone: '+5511999999999',
          isActive: true,
        },
      })

      const enrollmentRequest = {
        method: 'totp', // Time-based OTP
        deviceType: 'mobile',
        deviceInfo: {
          name: 'iPhone 13 Pro',
          os: 'iOS 16.0',
          appVersion: 'Aesthetic Clinic App 2.0',
        },
      }

      const enrollmentResult = await mfaService.enrollMFA(
        enrollmentRequest,
        'session-123',
      )

      expect(enrollmentResult.success).toBe(true)
      expect(enrollmentResult.enrollmentId).toBeDefined()
      expect(enrollmentResult.qrCode).toBeDefined()
      expect(enrollmentResult.backupCodes).toBeDefined()
      expect(enrollmentResult.backupCodes.length).toBe(10)
      expect(enrollmentResult.setupComplete).toBe(false) // Requires verification
    })

    it('should verify MFA setup with proper token validation', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      // Mock token validation
      vi.spyOn(validationService, 'validateMFAToken').mockResolvedValueOnce({
        valid: true,
        method: 'totp',
        confidence: 0.99,
      })

      const verificationRequest = {
        enrollmentId: 'enrollment-123',
        verificationToken: '123456', // 6-digit TOTP token
        deviceInfo: {
          fingerprint: 'device-fingerprint-123',
        },
      }

      const verificationResult = await mfaService.verifyMFASetup(
        verificationRequest,
        'session-123',
      )

      expect(verificationResult.success).toBe(true)
      expect(verificationResult.verified).toBe(true)
      expect(verificationResult.mfaEnabled).toBe(true)
      expect(verificationResult.recoveryCodes).toBeDefined()
    })

    it('should enforce professional verification before MFA enrollment', async () => {
      // Mock session with unverified professional
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          professionalVerified: false, // Not yet verified
          isActive: true,
        },
      })

      const enrollmentRequest = {
        method: 'totp',
        deviceType: 'mobile',
      }

      const result = await mfaService.enrollMFA(enrollmentRequest, 'session-123')

      expect(result.success).toBe(false)
      expect(result.reason).toContain('professional_verification_required')
      expect(result.requiresVerification).toBe(true)
    })

    it('should support multiple MFA methods for aesthetic professionals', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          professionalVerified: true,
          isActive: true,
        },
      })

      const methods = ['totp', 'sms', 'email', 'biometric']
      const enrollmentResults = []

      for (const method of methods) {
        const enrollmentRequest = {
          method,
          deviceType: 'mobile',
        }

        const result = await mfaService.enrollMFA(enrollmentRequest, 'session-123')
        enrollmentResults.push(result)
      }

      expect(enrollmentResults).toHaveLength(4)
      enrollmentResults.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.method).toBeDefined()
        expect(result.enrollmentId).toBeDefined()
      })
    })
  })

  describe('MFA Authentication', () => {
    it('should authenticate aesthetic professionals with MFA token', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          mfaEnrolled: true,
          mfaMethods: ['totp', 'sms'],
          isActive: true,
        },
      })

      // Mock token validation
      vi.spyOn(validationService, 'validateMFAToken').mockResolvedValueOnce({
        valid: true,
        method: 'totp',
        confidence: 0.99,
        riskScore: 0.1,
      })

      const authRequest = {
        userId: 'user-123',
        mfaToken: '123456',
        method: 'totp',
        context: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Aesthetic Clinic App)',
          deviceFingerprint: 'device-fingerprint-123',
        },
      }

      const authResult = await mfaService.authenticateWithMFA(authRequest)

      expect(authResult.success).toBe(true)
      expect(authResult.authenticated).toBe(true)
      expect(authResult.sessionEnhanced).toBe(true)
      expect(authResult.riskScore).toBeLessThan(0.5)
    })

    it('should handle biometric authentication for mobile access', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          mfaEnrolled: true,
          mfaMethods: ['biometric'],
          isActive: true,
        },
      })

      // Mock biometric validation
      vi.spyOn(validationService, 'validateMFAToken').mockResolvedValueOnce({
        valid: true,
        method: 'biometric',
        biometricType: 'face_id',
        confidence: 0.98,
      })

      const biometricAuth = {
        userId: 'user-123',
        method: 'biometric',
        biometricData: {
          faceIdHash: 'encrypted-face-hash',
          livenessScore: 0.95,
        },
        context: {
          deviceType: 'mobile',
          appVersion: 'Aesthetic Clinic App 2.0',
        },
      }

      const result = await mfaService.authenticateWithMFA(biometricAuth)

      expect(result.success).toBe(true)
      expect(result.authenticated).toBe(true)
      expect(result.method).toBe('biometric')
      expect(result.livenessVerified).toBe(true)
    })

    it('should implement adaptive MFA based on risk assessment', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      // Mock suspicious activity detection
      vi.spyOn(validationService, 'detectSuspiciousActivity').mockResolvedValueOnce({
        suspicious: true,
        riskLevel: 'high',
        reasons: ['new_device', 'unusual_location'],
        score: 0.8,
      })

      const riskAssessment = await mfaService.assessAuthenticationRisk({
        userId: 'user-123',
        sessionId: 'session-123',
        context: {
          ipAddress: '192.168.1.1',
          userAgent: 'New Browser/1.0',
          location: 'Unknown',
        },
      })

      expect(riskAssessment.requiresMFA).toBe(true)
      expect(riskAssessment.riskLevel).toBe('high')
      expect(riskAssessment.recommendedMethods).toContain('totp')
      expect(riskAssessment.recommendedMethods).toContain('sms')
    })

    it('should validate professional credentials during MFA authentication', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          licenseExpiry: new Date('2024-12-31'),
          anvisaRegistration: 'REG-12345',
          isActive: true,
        },
      })

      const authRequest = {
        userId: 'user-123',
        mfaToken: '123456',
        method: 'totp',
        validateCredentials: true,
      }

      const result = await mfaService.authenticateWithMFA(authRequest)

      expect(result.credentialsValidated).toBe(true)
      expect(result.cfmLicenseValid).toBe(true)
      expect(result.anvisaRegistrationValid).toBe(true)
    })
  })

  describe('Backup and Recovery', () => {
    it('should generate and distribute backup codes securely', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      const backupRequest = {
        method: 'backup_codes',
        deliveryMethod: 'secure_email',
        reason: 'mfa_setup',
      }

      const backupResult = await mfaService.generateBackupCodes(backupRequest, 'session-123')

      expect(backupResult.success).toBe(true)
      expect(backupResult.backupCodes).toBeDefined()
      expect(backupResult.backupCodes.length).toBe(10)
      expect(backupResult.deliverySecure).toBe(true)
      expect(backupResult.expiryDate).toBeDefined()
    })

    it('should authenticate with backup codes in emergency situations', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          mfaEnrolled: true,
          isActive: true,
        },
      })

      const backupAuth = {
        userId: 'user-123',
        backupCode: 'ABCD-1234-EFGH-5678',
        emergencyReason: 'phone_lost',
        context: {
          ipAddress: '192.168.1.1',
        },
      }

      const result = await mfaService.authenticateWithBackupCode(backupAuth)

      expect(result.success).toBe(true)
      expect(result.authenticated).toBe(true)
      expect(result.emergencyAccess).toBe(true)
      expect(result.backupCodeConsumed).toBe(true)
    })

    it('should handle professional emergency access protocols', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          cfmLicense: 'CRM-12345-SP',
          isActive: true,
          emergencyContact: '+5511988888888',
        },
      })

      const emergencyRequest = {
        userId: 'user-123',
        emergencyType: 'patient_emergency',
        patientId: 'patient-456',
        reason: 'urgent_treatment_access',
        verificationMethod: 'phone_call',
      }

      const emergencyAccess = await mfaService.handleEmergencyAccess(emergencyRequest)

      expect(emergencyAccess.granted).toBe(true)
      expect(emergencyAccess.temporaryAccess).toBe(true)
      expect(emergencyAccess.accessDuration).toBe(3600) // 1 hour
      expect(emergencyAccess.auditRequired).toBe(true)
    })
  })

  describe('Security and Compliance', () => {
    it('should enforce CFM compliance for MFA in aesthetic practice', async () => {
      const complianceCheck = await mfaService.validateCFMCompliance({
        mfaEnabled: true,
        methods: ['totp', 'biometric'],
        professionalVerification: true,
        auditTrail: true,
        emergencyProcedures: true,
      })

      expect(complianceCheck.compliant).toBe(true)
      expect(complianceCheck.cfmStandardsMet).toBe(true)
      expect(complianceCheck.patientDataProtected).toBe(true)
    })

    it('should validate LGPD compliance for biometric data usage', async () => {
      const biometricValidation = await mfaService.validateBiometricCompliance({
        biometricType: 'face_id',
        purpose: 'authentication',
        consentObtained: true,
        dataRetention: 'minimal',
        encryptionEnabled: true,
      })

      expect(biometricValidation.compliant).toBe(true)
      expect(biometricValidation.consentValid).toBe(true)
      expect(biometricValidation.dataProtection).toBe('high')
    })

    it('should implement secure MFA key management', async () => {
      const keyManagement = await mfaService.validateKeySecurity({
        keyType: 'encryption',
        algorithm: 'AES-256-GCM',
        keyRotationSchedule: '90_days',
        backupStrategy: 'geodistributed',
        accessControls: 'multi_factor',
      })

      expect(keyManagement.secure).toBe(true)
      expect(keyManagement.encryptionStrong).toBe(true)
      expect(keyManagement.accessControlled).toBe(true)
      expect(keyManagement.backupRedundant).toBe(true)
    })
  })

  describe('Rate Limiting and Security', () => {
    it('should implement MFA attempt rate limiting', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValue({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      // Mock token validation failures
      vi.spyOn(validationService, 'validateMFAToken').mockResolvedValue({
        valid: false,
        reason: 'invalid_token',
      })

      const attempts = []
      for (let i = 0; i < 6; i++) {
        attempts.push(
          mfaService.authenticateWithMFA({
            userId: 'user-123',
            mfaToken: 'wrong-token',
            method: 'totp',
          }),
        )
      }

      const results = await Promise.allSettled(attempts)
      const failedAttempts = results.filter(r => r.status === 'fulfilled' && !r.value.success)

      expect(failedAttempts.length).toBeGreaterThan(0)

      // Last attempt should be rate limited
      const lastResult = results[results.length - 1]
      if (lastResult.status === 'fulfilled') {
        expect(lastResult.value.rateLimited).toBe(true)
      }
    })

    it('should detect and prevent MFA bypass attempts', async () => {
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      const suspiciousRequest = {
        userId: 'user-123',
        mfaToken: '',
        method: 'bypass',
        bypassReason: 'emergency',
      }

      const result = await mfaService.authenticateWithMFA(suspiciousRequest)

      expect(result.success).toBe(false)
      expect(result.securityViolation).toBe(true)
      expect(result.reason).toContain('bypass_attempt')
    })
  })

  describe('Performance and Scalability', () => {
    it('should validate MFA tokens within acceptable time', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValue({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      // Mock token validation
      vi.spyOn(validationService, 'validateMFAToken').mockResolvedValue({
        valid: true,
        method: 'totp',
        confidence: 0.99,
      })

      const authRequest = {
        userId: 'user-123',
        mfaToken: '123456',
        method: 'totp',
      }

      const startTime = performance.now()
      await mfaService.authenticateWithMFA(authRequest)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(200) // < 200ms
    })

    it('should handle concurrent MFA validation requests', async () => {
      const concurrentRequests = 10
      const requests = []

      vi.spyOn(sessionService, 'validateSession').mockResolvedValue({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      vi.spyOn(validationService, 'validateMFAToken').mockResolvedValue({
        valid: true,
        method: 'totp',
        confidence: 0.99,
      })

      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          mfaService.authenticateWithMFA({
            userId: 'user-123',
            mfaToken: '123456',
            method: 'totp',
          }),
        )
      }

      const results = await Promise.allSettled(requests)
      const successfulResults = results.filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled' && result.value.success,
      )

      expect(successfulResults.length).toBe(concurrentRequests)
    })
  })

  describe('Integration with Session Management', () => {
    it('should enhance session security after MFA authentication', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      // Mock token validation
      vi.spyOn(validationService, 'validateMFAToken').mockResolvedValueOnce({
        valid: true,
        method: 'totp',
        confidence: 0.99,
      })

      // Mock session security update
      vi.spyOn(sessionService, 'updateSessionSecurity').mockResolvedValueOnce({
        success: true,
        session: {
          id: 'session-123',
          securityLevel: 'enhanced',
          mfaVerified: true,
          lastActivity: new Date(),
        },
      })

      const authRequest = {
        userId: 'user-123',
        mfaToken: '123456',
        method: 'totp',
      }

      const result = await mfaService.authenticateWithMFA(authRequest)

      expect(result.sessionEnhanced).toBe(true)
      expect(sessionService.updateSessionSecurity).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          mfaVerified: true,
          securityLevel: 'enhanced',
        }),
      )
    })

    it('should log MFA security events for audit compliance', async () => {
      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'aesthetic_physician',
          isActive: true,
        },
      })

      const mfaEvent = {
        eventType: 'mfa_authentication',
        userId: 'user-123',
        method: 'totp',
        success: true,
        sessionId: 'session-123',
      }

      await mfaService.logSecurityEvent(mfaEvent)

      expect(sessionService.logSecurityEvent).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          eventType: 'mfa_authentication',
          method: 'totp',
          success: true,
          complianceContext: 'CFM',
        }),
      )
    })
  })
})
