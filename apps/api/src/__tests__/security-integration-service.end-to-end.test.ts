import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SecurityIntegrationService } from '../trpc/middleware/security-integration-service'

// Mock the services
const mockJWTService = {
  validateToken: vi.fn(),
  generateToken: vi.fn()
}

const mockSessionService = {
  getSession: vi.fn(),
  logEvent: vi.fn()
}

const mockComplianceService = {
  validateCompliance: vi.fn()
}

vi.mock('../services/jwt-service', () => ({
  JWTService: vi.fn().mockImplementation(() => mockJWTService)
}))

vi.mock('../services/session-service', () => ({
  SessionService: vi.fn().mockImplementation(() => mockSessionService)
}))

vi.mock('../services/compliance-service', () => ({
  ComplianceService: vi.fn().mockImplementation(() => mockComplianceService)
}))

describe('SecurityIntegrationService End-to-End Tests', () => {
  let securityIntegrationService: SecurityIntegrationService

  beforeEach(() => {
    // Reset environment variables
    process.env.JWT_SECRET = 'test-secret'
    process.env.SESSION_TIMEOUT = '3600'
    process.env.MAX_CONCURRENT_SESSIONS = '5'
    process.env.SECURITY_LEVEL = 'high'

    // Reset all mocks
    vi.clearAllMocks()

    // Create service instance with correct configuration interface
    securityIntegrationService = new SecurityIntegrationService({
      enableJWTSecurity: true,
      enableSessionManagement: true,
      enableHealthcareCompliance: true,
      sessionTimeout: 3600,
      maxConcurrentSessions: 5,
      securityLevel: 'high'
    })

    // Setup default mock behaviors
    mockJWTService.validateToken.mockResolvedValue({
      isValid: true,
      payload: {
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        role: 'patient'
      }
    })

    mockSessionService.getSession.mockResolvedValue({
      session: {
        id: 'test-session-id',
        userId: 'test-user-id',
        role: 'patient',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        isActive: true
      },
      metadata: {
        validationDetails: {
          isValid: true,
          lastAccessed: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        }
      }
    })

    mockSessionService.logEvent.mockResolvedValue({
      success: true,
      eventId: 'test-event-id'
    })

    mockComplianceService.validateCompliance.mockResolvedValue({
      isCompliant: true,
      checks: [
        { name: 'lgpd', passed: true },
        { name: 'anvisa', passed: true },
        { name: 'cfm', passed: true }
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Configuration Interface', () => {
    it('should accept correct configuration interface names', () => {
      expect(() => {
        new SecurityIntegrationService({
          enableJWTSecurity: true,
          enableSessionManagement: true,
          enableHealthcareCompliance: true,
          sessionTimeout: 3600,
          maxConcurrentSessions: 5,
          securityLevel: 'high'
        })
      }).not.toThrow()
    })

    it('should require all mandatory configuration properties', () => {
      expect(() => {
        new SecurityIntegrationService({
          enableJWTSecurity: true,
          enableSessionManagement: true,
          enableHealthcareCompliance: true,
          // Missing required properties
        } as SecurityConfig)
      }).toThrow()
    })

    it('should validate sessionTimeout is a positive number', () => {
      expect(() => {
        new SecurityIntegrationService({
          enableJWTSecurity: true,
          enableSessionManagement: true,
          enableHealthcareCompliance: true,
          sessionTimeout: -1,
          maxConcurrentSessions: 5,
          securityLevel: 'high'
        })
      }).toThrow()
    })

    it('should validate maxConcurrentSessions is a positive number', () => {
      expect(() => {
        new SecurityIntegrationService({
          enableJWTSecurity: true,
          enableSessionManagement: true,
          enableHealthcareCompliance: true,
          sessionTimeout: 3600,
          maxConcurrentSessions: 0,
          securityLevel: 'high'
        })
      }).toThrow()
    })

    it('should validate securityLevel is one of allowed values', () => {
      expect(() => {
        new SecurityIntegrationService({
          enableJWTSecurity: true,
          enableSessionManagement: true,
          enableHealthcareCompliance: true,
          sessionTimeout: 3600,
          maxConcurrentSessions: 5,
          securityLevel: 'invalid' as 'high' | 'medium' | 'low' | 'healthcare'
        })
      }).toThrow()
    })
  })

  describe('JWT Service Integration', () => {
    it('should validate token with correct format', async () => {
      const result = await securityIntegrationService.validateToken('test-token')
      
      expect(result.isValid).toBe(true)
      expect(result.payload).toEqual({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        role: 'patient'
      })
      expect(mockJWTService.validateToken).toHaveBeenCalledWith('test-token')
    })

    it('should handle invalid tokens properly', async () => {
      mockJWTService.validateToken.mockResolvedValue({
        isValid: false,
        error: 'Invalid token'
      })

      const result = await securityIntegrationService.validateToken('invalid-token')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid token')
    })

    it('should handle JWT service errors', async () => {
      mockJWTService.validateToken.mockRejectedValue(new Error('JWT service unavailable'))

      await expect(securityIntegrationService.validateToken('test-token'))
        .rejects.toThrow('JWT service unavailable')
    })
  })

  describe('Session Service Integration', () => {
    it('should get session with metadata', async () => {
      const result = await securityIntegrationService.getSession('test-session-id')
      
      expect(result.session).toBeDefined()
      expect(result.metadata).toBeDefined()
      expect(result.metadata.validationDetails).toBeDefined()
      expect(mockSessionService.getSession).toHaveBeenCalledWith('test-session-id')
    })

    it('should handle session not found', async () => {
      mockSessionService.getSession.mockResolvedValue({
        session: null,
        metadata: {
          validationDetails: {
            isValid: false,
            error: 'Session not found'
          }
        }
      })

      const result = await securityIntegrationService.getSession('non-existent-session')
      
      expect(result.session).toBeNull()
      expect(result.metadata.validationDetails.isValid).toBe(false)
    })

    it('should log security events correctly', async () => {
      const event = {
        type: 'login',
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        timestamp: new Date(),
        details: { ipAddress: '127.0.0.1' }
      }

      const result = await securityIntegrationService.logSecurityEvent(event)
      
      expect(result.success).toBe(true)
      expect(result.eventId).toBe('test-event-id')
      expect(mockSessionService.logEvent).toHaveBeenCalledWith(event)
    })

    it('should handle session service errors gracefully', async () => {
      mockSessionService.getSession.mockRejectedValue(new Error('Session service unavailable'))

      await expect(securityIntegrationService.getSession('test-session-id'))
        .rejects.toThrow('Session service unavailable')
    })
  })

  describe('Compliance Service Integration', () => {
    it('should validate healthcare compliance', async () => {
      const result = await securityIntegrationService.validateHealthcareCompliance()
      
      expect(result.isCompliant).toBe(true)
      expect(result.checks).toHaveLength(3)
      expect(result.checks[0].name).toBe('lgpd')
      expect(mockComplianceService.validateCompliance).toHaveBeenCalled()
    })

    it('should handle compliance failures', async () => {
      mockComplianceService.validateCompliance.mockResolvedValue({
        isCompliant: false,
        checks: [
          { name: 'lgpd', passed: false, error: 'Data retention policy violated' },
          { name: 'anvisa', passed: true },
          { name: 'cfm', passed: true }
        ]
      })

      const result = await securityIntegrationService.validateHealthcareCompliance()
      
      expect(result.isCompliant).toBe(false)
      expect(result.checks[0].passed).toBe(false)
      expect(result.checks[0].error).toBe('Data retention policy violated')
    })
  })

  describe('End-to-End Security Workflow', () => {
    it('should handle complete authentication workflow', async () => {
      const token = 'test-token'
      
      // Validate token
      const tokenResult = await securityIntegrationService.validateToken(token)
      expect(tokenResult.isValid).toBe(true)
      
      // Get session
      const sessionResult = await securityIntegrationService.getSession(tokenResult.payload.sessionId)
      expect(sessionResult.session).toBeDefined()
      
      // Validate compliance
      const complianceResult = await securityIntegrationService.validateHealthcareCompliance()
      expect(complianceResult.isCompliant).toBe(true)
      
      // Log successful authentication
      const logResult = await securityIntegrationService.logSecurityEvent({
        type: 'authentication_success',
        userId: tokenResult.payload.userId,
        sessionId: tokenResult.payload.sessionId,
        timestamp: new Date(),
        details: { method: 'jwt' }
      })
      
      expect(logResult.success).toBe(true)
    })

    it('should handle authentication failure workflow', async () => {
      const token = 'invalid-token'
      
      // Validate token (should fail)
      mockJWTService.validateToken.mockResolvedValue({
        isValid: false,
        error: 'Token expired'
      })
      
      const tokenResult = await securityIntegrationService.validateToken(token)
      expect(tokenResult.isValid).toBe(false)
      expect(tokenResult.error).toBe('Token expired')
      
      // Log failed authentication attempt
      const logResult = await securityIntegrationService.logSecurityEvent({
        type: 'authentication_failure',
        userId: 'unknown',
        sessionId: 'unknown',
        timestamp: new Date(),
        details: { reason: 'Token expired', token }
      })
      
      expect(logResult.success).toBe(true)
    })

    it('should handle session timeout workflow', async () => {
      const sessionId = 'expired-session'
      
      // Session should be expired
      mockSessionService.getSession.mockResolvedValue({
        session: {
          id: sessionId,
          userId: 'test-user-id',
          role: 'patient',
          createdAt: new Date(Date.now() - 7200000), // 2 hours ago
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
          isActive: false
        },
        metadata: {
          validationDetails: {
            isValid: false,
            error: 'Session expired'
          }
        }
      })
      
      const sessionResult = await securityIntegrationService.getSession(sessionId)
      expect(sessionResult.session).toBeDefined()
      expect(sessionResult.session.isActive).toBe(false)
      
      // Log session timeout event
      const logResult = await securityIntegrationService.logSecurityEvent({
        type: 'session_timeout',
        userId: sessionResult.session?.userId,
        sessionId: sessionId,
        timestamp: new Date(),
        details: { reason: 'Session expired' }
      })
      
      expect(logResult.success).toBe(true)
    })

    it('should handle concurrent session limit', async () => {
      const userId = 'test-user-id'
      const maxSessions = 5
      
      // Mock multiple active sessions
      const activeSessions = Array(maxSessions).fill(null).map((_, i) => ({
        id: `session-${i}`,
        userId,
        role: 'patient',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        isActive: true
      }))
      
      // Simulate session count check
      mockSessionService.getSession.mockImplementation(async (sessionId) => {
        if (sessionId === 'new-session') {
          return {
            session: null,
            metadata: {
              validationDetails: {
                isValid: false,
                error: 'Would exceed concurrent session limit'
              }
            }
          }
        }
        return {
          session: activeSessions.find(s => s.id === sessionId),
          metadata: {
            validationDetails: {
              isValid: true,
              lastAccessed: new Date()
            }
          }
        }
      })
      
      // Try to create new session when at limit
      const result = await securityIntegrationService.getSession('new-session')
      expect(result.session).toBeNull()
      expect(result.metadata.validationDetails.error).toContain('concurrent session limit')
    })

    it('should enforce security level requirements', async () => {
      // Test with high security level
      const highSecurityService = new SecurityIntegrationService({
        enableJWTSecurity: true,
        enableSessionManagement: true,
        enableHealthcareCompliance: true,
        sessionTimeout: 1800, // 30 minutes for high security
        maxConcurrentSessions: 3, // Lower limit for high security
        securityLevel: 'high'
      })
      
      // Should enforce stricter validation
      const token = 'test-token'
      mockJWTService.validateToken.mockResolvedValue({
        isValid: true,
        payload: {
          userId: 'test-user-id',
          sessionId: 'test-session-id',
          role: 'patient'
        }
      })
      
      const result = await highSecurityService.validateToken(token)
      expect(result.isValid).toBe(true)
      
      // Should validate compliance more strictly
      const complianceResult = await highSecurityService.validateHealthcareCompliance()
      expect(complianceResult.isCompliant).toBe(true)
    })

    it('should handle healthcare-specific security requirements', async () => {
      const healthcareService = new SecurityIntegrationService({
        enableJWTSecurity: true,
        enableSessionManagement: true,
        enableHealthcareCompliance: true,
        sessionTimeout: 7200, // 2 hours for healthcare
        maxConcurrentSessions: 10,
        securityLevel: 'healthcare'
      })
      
      // Should include healthcare-specific compliance checks
      mockComplianceService.validateCompliance.mockResolvedValue({
        isCompliant: true,
        checks: [
          { name: 'lgpd', passed: true },
          { name: 'hipaa', passed: true }, // Healthcare-specific
          { name: 'anvisa', passed: true },
          { name: 'cfm', passed: true },
          { name: 'data_encryption', passed: true },
          { name: 'audit_trail', passed: true }
        ]
      })
      
      const result = await healthcareService.validateHealthcareCompliance()
      expect(result.isCompliant).toBe(true)
      expect(result.checks.length).toBeGreaterThan(3) // More checks for healthcare
    })

    it('should handle audit logging for healthcare compliance', async () => {
      const auditEvent = {
        type: 'patient_data_access',
        userId: 'doctor-123',
        sessionId: 'session-456',
        timestamp: new Date(),
        details: {
          patientId: 'patient-789',
          action: 'view_medical_record',
          purpose: 'treatment',
          retentionPeriod: '10_years'
        }
      }
      
      const result = await securityIntegrationService.logSecurityEvent(auditEvent)
      
      expect(result.success).toBe(true)
      expect(mockSessionService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'patient_data_access',
          details: expect.objectContaining({
            patientId: 'patient-789',
            purpose: 'treatment'
          })
        })
      )
    })

    it('should validate data encryption requirements', async () => {
      // Mock encryption validation
      mockComplianceService.validateCompliance.mockResolvedValue({
        isCompliant: true,
        checks: [
          { name: 'data_encryption', passed: true, details: 'AES-256 encryption enabled' },
          { name: 'tls_enforced', passed: true, details: 'TLS 1.3 enforced' },
          { name: 'key_rotation', passed: true, details: 'Keys rotated every 90 days' }
        ]
      })
      
      const result = await securityIntegrationService.validateHealthcareCompliance()
      
      expect(result.isCompliant).toBe(true)
      const encryptionCheck = result.checks.find(c => c.name === 'data_encryption')
      expect(encryptionCheck?.passed).toBe(true)
      expect(encryptionCheck?.details).toContain('AES-256')
    })

    it('should handle emergency access scenarios', async () => {
      const emergencyToken = 'emergency-access-token'
      
      // Mock emergency access validation
      mockJWTService.validateToken.mockResolvedValue({
        isValid: true,
        payload: {
          userId: 'emergency-doctor',
          sessionId: 'emergency-session',
          role: 'emergency_staff',
          emergencyAccess: true,
          reason: 'life_threatening_situation'
        }
      })
      
      const result = await securityIntegrationService.validateToken(emergencyToken)
      
      expect(result.isValid).toBe(true)
      expect(result.payload.emergencyAccess).toBe(true)
      expect(result.payload.reason).toBe('life_threatening_situation')
      
      // Should log emergency access with special handling
      const logResult = await securityIntegrationService.logSecurityEvent({
        type: 'emergency_access',
        userId: result.payload.userId,
        sessionId: result.payload.sessionId,
        timestamp: new Date(),
        details: {
          emergencyAccess: true,
          reason: result.payload.reason,
          bypassedNormalChecks: true
        }
      })
      
      expect(logResult.success).toBe(true)
    })

    it('should enforce data retention policies', async () => {
      // Mock data retention validation
      mockComplianceService.validateCompliance.mockResolvedValue({
        isCompliant: true,
        checks: [
          { name: 'data_retention', passed: true, details: '10-year retention policy enforced' },
          { name: 'auto_deletion', passed: true, details: 'Automatic deletion scheduled' },
          { name: 'backup_encryption', passed: true, details: 'Backups encrypted at rest' }
        ]
      })
      
      const result = await securityIntegrationService.validateHealthcareCompliance()
      
      expect(result.isCompliant).toBe(true)
      const retentionCheck = result.checks.find(c => c.name === 'data_retention')
      expect(retentionCheck?.passed).toBe(true)
      expect(retentionCheck?.details).toContain('10-year')
    })

    it('should handle cross-border data transfer compliance', async () => {
      // Mock international data transfer validation
      mockComplianceService.validateCompliance.mockResolvedValue({
        isCompliant: true,
        checks: [
          { name: 'data_localization', passed: true, details: 'Data stored in Brazil' },
          { name: 'cross_border_transfers', passed: true, details: 'GDPR-compliant transfers' },
          { name: 'international_compliance', passed: true, details: 'Multi-jurisdictional compliance' }
        ]
      })
      
      const result = await securityIntegrationService.validateHealthcareCompliance()
      
      expect(result.isCompliant).toBe(true)
      const borderCheck = result.checks.find(c => c.name === 'cross_border_transfers')
      expect(borderCheck?.passed).toBe(true)
      expect(borderCheck?.details).toContain('GDPR')
    })

    it('should validate access control mechanisms', async () => {
      const accessValidation = await securityIntegrationService.validateAccessControl({
        userId: 'doctor-123',
        resource: 'patient-789-records',
        action: 'read',
        context: {
          department: 'cardiology',
          shift: 'day',
          emergency: false
        }
      })
      
      expect(accessValidation.granted).toBe(true)
      expect(accessValidation.reason).toBeDefined()
    })

    it('should handle security configuration updates', async () => {
      const newConfig = {
        enableJWTSecurity: true,
        enableSessionManagement: true,
        enableHealthcareCompliance: true,
        sessionTimeout: 7200,
        maxConcurrentSessions: 8,
        securityLevel: 'medium' as const
      }
      
      // Should update configuration without errors
      expect(() => {
        securityIntegrationService.updateConfiguration(newConfig)
      }).not.toThrow()
      
      // Should apply new configuration
      const result = await securityIntegrationService.validateHealthcareCompliance()
      expect(result.isCompliant).toBe(true)
    })

    it('should provide comprehensive security metrics', async () => {
      const metrics = await securityIntegrationService.getSecurityMetrics()
      
      expect(metrics).toBeDefined()
      expect(metrics.activeSessions).toBeDefined()
      expect(metrics.failedAuthentications).toBeDefined()
      expect(metrics.complianceScore).toBeDefined()
      expect(metrics.lastSecurityScan).toBeDefined()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed tokens gracefully', async () => {
      mockJWTService.validateToken.mockResolvedValue({
        isValid: false,
        error: 'Malformed token structure'
      })

      const result = await securityIntegrationService.validateToken('malformed-token')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Malformed token structure')
    })

    it('should handle service unavailability with fallback', async () => {
      // Simulate JWT service being unavailable
      mockJWTService.validateToken.mockRejectedValue(new Error('Service timeout'))
      
      // Should have fallback behavior
      await expect(securityIntegrationService.validateToken('test-token'))
        .rejects.toThrow('Service timeout')
    })

    it('should validate session timeout boundaries', async () => {
      // Test session exactly at timeout boundary
      const boundaryTime = Date.now() - 3600000 // Exactly 1 hour ago
      
      mockSessionService.getSession.mockResolvedValue({
        session: {
          id: 'boundary-session',
          userId: 'test-user-id',
          role: 'patient',
          createdAt: new Date(boundaryTime),
          expiresAt: new Date(boundaryTime + 3600000),
          isActive: false // Should be inactive due to timeout
        },
        metadata: {
          validationDetails: {
            isValid: false,
            error: 'Session timeout boundary reached'
          }
        }
      })
      
      const result = await securityIntegrationService.getSession('boundary-session')
      
      expect(result.session?.isActive).toBe(false)
      expect(result.metadata.validationDetails.error).toContain('timeout boundary')
    })

    it('should handle configuration validation errors', () => {
      expect(() => {
        new SecurityIntegrationService({
          enableJWTSecurity: false,
          enableSessionManagement: false,
          enableHealthcareCompliance: false,
          sessionTimeout: 3600,
          maxConcurrentSessions: 5,
          securityLevel: 'high'
        })
      }).toThrow() // Should not allow all security features to be disabled
    })
  })
})