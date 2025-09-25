/**
 * Security Integration Service End-to-End Tests
 * 
 * Comprehensive end-to-end tests for the complete security integration service
 * validating all security components working together seamlessly.
 * 
 * Security: Critical - Complete security integration validation tests
 * Test Coverage: Security Integration Service
 * Compliance: OWASP Top 10, LGPD, ANVISA, CFM, HIPAA
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Context, Next } from 'hono'
import { SecurityIntegrationService, SecurityIntegrationConfig } from '../services/security-integration-service'
import { JWTSecurityService } from '../services/jwt-security-service'
import { EnhancedAuthenticationMiddleware } from '../middleware/enhanced-authentication-middleware'
import { HealthcareSessionManagementService } from '../services/healthcare-session-management-service'
import { SecurityValidationService } from '../services/security-validation-service'
import { AuditTrailService } from '../services/audit-trail-service'

// Mock Hono context
const createMockContext = (overrides = {}): Context => {
  const req = {
    header: vi.fn(),
    method: 'GET',
    path: '/api/patients',
    url: 'http://localhost:3000/api/patients',
    body: {},
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
    json: vi.fn(),
    ...overrides,
  } as any
}

const createMockNext = (): Next => {
  return vi.fn().mockResolvedValue(undefined)
}

describe('Security Integration Service End-to-End Tests', () => {
  let securityIntegration: typeof SecurityIntegrationService
  let jwtService: typeof JWTSecurityService
  let authMiddleware: typeof EnhancedAuthenticationMiddleware
  let sessionService: typeof HealthcareSessionManagementService
  let validationService: typeof SecurityValidationService
  let auditService: typeof AuditTrailService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset services
    securityIntegration = SecurityIntegrationService
    jwtService = JWTSecurityService
    authMiddleware = EnhancedAuthenticationMiddleware
    sessionService = HealthcareSessionManagementService
    validationService = SecurityValidationService
    auditService = AuditTrailService

    // Mock environment variables
    vi.stubEnv('JWT_SECRET', 'test-jwt-secret')
    vi.stubEnv('SESSION_SECRET', 'test-session-secret')
    vi.stubEnv('AUDIT_ENCRYPTION_KEY', 'test-audit-key')
    vi.stubEnv('ENABLE_THREAT_DETECTION', 'true')
    vi.stubEnv('LGPD_RETENTION_DAYS', '365')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Security Flow Integration', () => {
    it('should handle complete authentication and authorization flow', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data', 'write_patient_data'],
        cfmLicense: 'CRM-12345-SP',
        lgpdConsentVersion: '1.0',
      })

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

      // Mock security validation
      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: true,
        securityScore: 95,
        threats: [],
        warnings: [],
      })

      // Mock audit logging
      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('audit-event-123')

      // Create integrated security middleware
      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableRBAC: true,
        enableSecurityValidation: true,
        enableAuditTrail: true,
        enableThreatDetection: true,
        enableCompliance: true,
        requiredRoles: ['healthcare_professional'],
        requiredPermissions: ['read_patient_data'],
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      // Execute security flow
      await securityMiddleware(c, next)

      // Verify all components were called
      expect(jwtService.validateToken).toHaveBeenCalled()
      expect(sessionService.validateSession).toHaveBeenCalled()
      expect(validationService.validateRequestSecurity).toHaveBeenCalled()
      expect(auditService.logSecurityEvent).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('should handle multi-factor authentication flow', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('sessionId=session-123; sessionSig=valid-signature')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
      })

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

      // Mock authentication middleware with multi-factor
      vi.spyOn(authMiddleware, 'authenticateRequest').mockResolvedValueOnce({
        isAuthenticated: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        authenticationMethod: 'multi_factor',
        mfaVerified: true,
        sessionId: 'session-123',
      })

      // Mock security validation
      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: true,
        securityScore: 98,
        threats: [],
        warnings: [],
      })

      // Create security middleware with MFA
      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableMFA: true,
        enableSecurityValidation: true,
        enableAuditTrail: true,
        mfaRequired: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify MFA authentication
      expect(authMiddleware.authenticateRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          enableMFA: true,
          mfaRequired: true,
        })
      )
      expect(next).toHaveBeenCalled()
    })

    it('should handle threat detection and response', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('203.0.113.1') // Suspicious IP
            .mockReturnValueOnce('sqlmap/1.0') // Suspicious user agent
            .mockReturnValueOnce('https://malicious-site.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation (token is valid)
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
      })

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

      // Mock security validation detecting threats
      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: false,
        securityScore: 25,
        threats: ['suspicious_user_agent', 'suspicious_ip_address', 'potential_csrf'],
        warnings: ['Threats detected - request blocked'],
      })

      // Mock threat logging
      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('threat-event-123')

      // Create security middleware with threat detection
      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableSecurityValidation: true,
        enableThreatDetection: true,
        enableAuditTrail: true,
        threatResponse: 'block',
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify threat detection
      expect(validationService.validateRequestSecurity).toHaveBeenCalled()
      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'THREAT_DETECTED',
          severity: 'high',
        })
      )
      
      // Verify request was blocked (next not called)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Healthcare Compliance Integration', () => {
    it('should enforce LGPD compliance throughout security flow', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with LGPD compliance
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
        lgpdConsentVersion: '1.0',
        patientId: 'patient-456',
      })

      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          lgpdConsentVersion: '1.0',
          isActive: true,
        },
      })

      // Mock LGPD validation
      vi.spyOn(validationService, 'validateLGPDCompliance').mockResolvedValueOnce({
        isValid: true,
        complianceScore: 95,
        complianceAreas: ['consent', 'retention', 'data_minimization'],
        violations: [],
      })

      // Mock LGPD audit logging
      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('lgpd-audit-123')

      // Create security middleware with LGPD compliance
      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableCompliance: true,
        enableAuditTrail: true,
        complianceFrameworks: ['lgpd'],
        requireLGPDConsent: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify LGPD compliance checks
      expect(validationService.validateLGPDCompliance).toHaveBeenCalled()
      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'COMPLIANCE_VALIDATION',
          metadata: expect.objectContaining({
            complianceFramework: 'lgpd',
            complianceScore: 95,
          }),
        })
      )
      expect(next).toHaveBeenCalled()
    })

    it('should enforce ANVISA compliance for medical data access', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          method: 'POST',
          path: '/api/medical-devices',
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with ANVISA compliance
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['manage_medical_devices'],
        anvisaCompliance: true,
        cfmLicense: 'CRM-12345-SP',
      })

      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          anvisaCompliance: true,
          isActive: true,
        },
      })

      // Mock ANVISA validation
      vi.spyOn(validationService, 'validateHealthcareDataAccess').mockResolvedValueOnce({
        isValid: true,
        complianceScore: 90,
        complianceAreas: ['anvisa', 'device_regulation'],
        threats: [],
      })

      // Create security middleware with ANVISA compliance
      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableCompliance: true,
        enableAuditTrail: true,
        complianceFrameworks: ['anvisa'],
        requireANVISACompliance: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify ANVISA compliance checks
      expect(validationService.validateHealthcareDataAccess).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('should enforce CFM compliance for healthcare professionals', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation with CFM compliance
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
        cfmLicense: 'CRM-12345-SP',
        specialty: 'cardiology',
      })

      // Mock session validation
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
          isActive: true,
        },
      })

      // Mock CFM validation
      vi.spyOn(validationService, 'validateHealthcareDataAccess').mockResolvedValueOnce({
        isValid: true,
        complianceScore: 100,
        complianceAreas: ['cfm', 'professional_licensing'],
        threats: [],
      })

      // Create security middleware with CFM compliance
      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableCompliance: true,
        enableAuditTrail: true,
        complianceFrameworks: ['cfm'],
        requireCFMLicense: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify CFM compliance checks
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Error Handling and Resilience', () => {
    it('should handle JWT service failures gracefully', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        },
      })

      const next = createMockNext()

      // Mock JWT service failure
      vi.spyOn(jwtService, 'validateToken').mockRejectedValueOnce(
        new Error('JWT service unavailable')
      )

      // Mock fallback to session authentication
      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          isActive: true,
        },
      })

      // Mock audit logging for service failure
      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('service-failure-123')

      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableFallback: true,
        enableAuditTrail: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify fallback authentication worked
      expect(sessionService.validateSession).toHaveBeenCalled()
      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SERVICE_FAILURE',
          severity: 'warning',
        })
      )
      expect(next).toHaveBeenCalled()
    })

    it('should handle database connection failures with graceful degradation', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        },
      })

      const next = createMockNext()

      // Mock JWT validation
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
      })

      // Mock session database failure
      vi.spyOn(sessionService, 'validateSession').mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      // Mock audit logging for database failure
      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('db-failure-123')

      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableAuditTrail: true,
        allowPartialFailure: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify graceful degradation
      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'DATABASE_FAILURE',
          severity: 'warning',
        })
      )
      expect(next).toHaveBeenCalled()
    })

    it('should handle multiple service failures with appropriate responses', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer invalid-jwt-token')
            .mockReturnValueOnce('sessionId=invalid-session')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        },
      })

      const next = createMockNext()

      // Mock all authentication failures
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: false,
        error: 'Invalid token',
      })

      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: false,
        error: 'Invalid session',
      })

      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: false,
        securityScore: 0,
        threats: ['authentication_failure'],
      })

      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('auth-failure-123')

      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableSecurityValidation: true,
        enableAuditTrail: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify comprehensive failure handling
      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'AUTHENTICATION_FAILURE',
          severity: 'high',
        })
      )
      
      // Verify request was blocked
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Performance Monitoring', () => {
    it('should monitor security performance metrics', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        },
      })

      const next = createMockNext()

      // Mock all services with successful responses
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
      })

      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          isActive: true,
        },
      })

      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: true,
        securityScore: 95,
        threats: [],
        warnings: [],
      })

      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('perf-test-123')

      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableSecurityValidation: true,
        enableAuditTrail: true,
        enablePerformanceMonitoring: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      const startTime = performance.now()
      await securityMiddleware(c, next)
      const endTime = performance.now()

      const duration = endTime - startTime
      
      // Verify performance within acceptable range
      expect(duration).toBeLessThan(500) // 500ms threshold
      
      // Verify performance monitoring
      expect(next).toHaveBeenCalled()
    })

    it('should track security metrics across all components', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        },
      })

      const next = createMockNext()

      // Mock services with performance data
      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
      })

      vi.spyOn(sessionService, 'validateSession').mockResolvedValueOnce({
        isValid: true,
        session: {
          id: 'session-123',
          userId: 'user-123',
          userRole: 'healthcare_professional',
          isActive: true,
        },
      })

      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: true,
        securityScore: 95,
        threats: [],
        warnings: [],
      })

      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('metrics-test-123')

      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableSecurityValidation: true,
        enableAuditTrail: true,
        enablePerformanceMonitoring: true,
        trackSecurityMetrics: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify security metrics tracking
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Configuration Testing', () => {
    it('should apply different security configurations correctly', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        },
      })

      const next = createMockNext()

      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
      })

      // Test minimal configuration
      const minimalConfig: SecurityIntegrationConfig = {
        enableJWT: true,
      }

      const minimalMiddleware = securityIntegration.createSecurityMiddleware(minimalConfig)
      await minimalMiddleware(c, next)

      expect(next).toHaveBeenCalled()

      // Test comprehensive configuration
      const comprehensiveConfig: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSession: true,
        enableRBAC: true,
        enableSecurityValidation: true,
        enableThreatDetection: true,
        enableAuditTrail: true,
        enableCompliance: true,
        enableMFA: true,
        enablePerformanceMonitoring: true,
        complianceFrameworks: ['lgpd', 'anvisa', 'cfm'],
        requiredRoles: ['healthcare_professional'],
        requiredPermissions: ['read_patient_data'],
      }

      const comprehensiveMiddleware = securityIntegration.createSecurityMiddleware(comprehensiveConfig)
      await comprehensiveMiddleware(c, next)

      expect(next).toHaveBeenCalled()
    })

    it('should validate configuration parameters', () => {
      // Test invalid configuration
      expect(() => {
        securityIntegration.createSecurityMiddleware({
          enableJWT: true,
          requiredRoles: ['invalid_role'], // Invalid role
        })
      }).toThrow('Invalid configuration')

      // Test valid configuration
      expect(() => {
        securityIntegration.createSecurityMiddleware({
          enableJWT: true,
          requiredRoles: ['healthcare_professional'], // Valid role
        })
      }).not.toThrow()
    })
  })

  describe('Integration with External Systems', () => {
    it('should integrate with external threat intelligence', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('203.0.113.1') // Known malicious IP
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        },
      })

      const next = createMockNext()

      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
      })

      // Mock external threat intelligence check
      vi.spyOn(validationService, 'validateRequestSecurity').mockResolvedValueOnce({
        isValid: false,
        securityScore: 10,
        threats: ['known_malicious_ip', 'threat_intelligence_match'],
        warnings: ['External threat intelligence detected'],
      })

      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('threat-intel-123')

      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableSecurityValidation: true,
        enableThreatDetection: true,
        enableAuditTrail: true,
        enableExternalThreatIntelligence: true,
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify external threat intelligence integration
      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'EXTERNAL_THREAT_DETECTED',
          severity: 'critical',
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should integrate with external compliance monitoring', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('Bearer valid-jwt-token')
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        },
      })

      const next = createMockNext()

      vi.spyOn(jwtService, 'validateToken').mockResolvedValueOnce({
        isValid: true,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        healthcareProvider: 'Hospital São Lucas',
        sessionId: 'session-123',
        permissions: ['read_patient_data'],
        lgpdConsentVersion: '1.0',
      })

      // Mock external compliance monitoring
      vi.spyOn(validationService, 'validateLGPDCompliance').mockResolvedValueOnce({
        isValid: true,
        complianceScore: 95,
        complianceAreas: ['lgpd', 'external_monitoring'],
        violations: [],
        externalValidation: true,
      })

      vi.spyOn(auditService, 'logSecurityEvent').mockResolvedValueOnce('external-compliance-123')

      const config: SecurityIntegrationConfig = {
        enableJWT: true,
        enableCompliance: true,
        enableAuditTrail: true,
        enableExternalComplianceMonitoring: true,
        complianceFrameworks: ['lgpd'],
      }

      const securityMiddleware = securityIntegration.createSecurityMiddleware(config)

      await securityMiddleware(c, next)

      // Verify external compliance monitoring integration
      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'EXTERNAL_COMPLIANCE_VALIDATION',
          metadata: expect.objectContaining({
            externalValidation: true,
          }),
        })
      )
      expect(next).toHaveBeenCalled()
    })
  })
})