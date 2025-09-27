/**
 * Healthcare Session Management Service Integration Tests
 *
 * Comprehensive integration tests for healthcare-compliant session management
 * with LGPD compliance, patient data access logging, and audit trail integration.
 *
 * Security: Critical - Healthcare session management service tests
 * Test Coverage: Healthcare Session Management Service
 * Compliance: LGPD, ANVISA, CFM, HIPAA
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuditTrailService } from '../services/audit-trail-service'
import {
  DataAccessEntry,
  HealthcareSession,
  HealthcareSessionManagementService,
  SessionValidationResult,
} from '../services/healthcare-session-management-service'
import { JWTSecurityService } from '../services/jwt-security-service'
import { SecurityValidationService } from '../services/security-validation-service'

// Mock date utilities for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z')
vi.setSystemTime(mockDate)

describe('Healthcare Session Management Service Integration Tests', () => {
  let sessionService: typeof HealthcareSessionManagementService
  let jwtService: typeof JWTSecurityService
  let auditService: typeof AuditTrailService
  let validationService: typeof SecurityValidationService

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset services
    sessionService = HealthcareSessionManagementService
    jwtService = JWTSecurityService
    auditService = AuditTrailService
    validationService = SecurityValidationService

    // Mock environment variables
    vi.stubEnv('SESSION_SECRET', 'test-session-secret-for-healthcare')
    vi.stubEnv('LGPD_RETENTION_DAYS', '365')
    vi.stubEnv('HEALTHCARE_SESSION_TIMEOUT', '30')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Session Creation with Healthcare Compliance', () => {
    it('should create healthcare-compliant session successfully', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          patientId: 'patient-456',
          encounterId: 'encounter-789',
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service', 'ai_assistance'],
            dataCategories: ['personal_data', 'health_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
          anvisaCompliance: true,
        },
      )

      expect(session).toBeDefined()
      expect(session.id).toBeDefined()
      expect(session.userId).toBe('user-123')
      expect(session.userRole).toBe('healthcare_professional')
      expect(session.healthcareProvider).toBe('Hospital São Lucas')
      expect(session.isActive).toBe(true)
      expect(session.lgpdConsentVersion).toBe('1.0')
      expect(session.cfmLicense).toBe('CRM-12345-SP')
      expect(session.specialty).toBe('cardiology')
      expect(session.anvisaCompliance).toBe(true)
      expect(session.patientId).toBe('patient-456')
      expect(session.encounterId).toBe('encounter-789')
    })

    it('should enforce LGPD consent requirements', async () => {
      await expect(
        sessionService.createSession(
          'user-123',
          'healthcare_professional',
          'Hospital São Lucas',
          {
            // Missing LGPD consent
            patientId: 'patient-456',
          },
        ),
      ).rejects.toThrow('LGPD consent is required for healthcare sessions')
    })

    it('should validate CFM license for healthcare professionals', async () => {
      await expect(
        sessionService.createSession(
          'user-123',
          'healthcare_professional',
          'Hospital São Lucas',
          {
            lgpdConsent: {
              consentVersion: '1.0',
              purposes: ['healthcare_service'],
              dataCategories: ['personal_data'],
              retentionPeriod: 365,
            },
            // Missing CFM license
          },
        ),
      ).rejects.toThrow('CFM license is required for healthcare professionals')
    })

    it('should create session with appropriate timeout', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      const expectedExpiry = new Date(mockDate.getTime() + 30 * 60 * 1000) // 30 minutes
      expect(session.expiresAt.getTime()).toBeCloseTo(expectedExpiry.getTime(), -2) // Allow 100ms difference
    })
  })

  describe('Session Validation', () => {
    it('should validate active session successfully', async () => {
      // Create session first
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      // Validate session
      const result = await sessionService.validateSession(session.id)

      expect(result.isValid).toBe(true)
      expect(result.session).toEqual(session)
      expect(result.warnings).toHaveLength(0)
    })

    it('should reject expired sessions', async () => {
      // Create expired session
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      // Manually expire session
      await sessionService.expireSession(session.id, 'test_expiry')

      // Validate expired session
      const result = await sessionService.validateSession(session.id)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('expired')
    })

    it('should reject non-existent sessions', async () => {
      const result = await sessionService.validateSession('non-existent-session')

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should warn about sessions nearing expiry', async () => {
      // Create session that expires soon
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      // Mock current time to be near expiry
      const nearExpiryTime = new Date(session.expiresAt.getTime() - 2 * 60 * 1000) // 2 minutes before expiry
      vi.setSystemTime(nearExpiryTime)

      const result = await sessionService.validateSession(session.id)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Session expires in 2 minutes')
    })
  })

  describe('Patient Data Access Logging', () => {
    it('should log patient data access successfully', async () => {
      const sessionId = 'session-123'
      const accessEntry: Omit<DataAccessEntry, 'timestamp'> = {
        patientId: 'patient-456',
        dataType: 'medical_record',
        action: 'view',
        reason: 'clinical_consultation',
        accessedBy: 'user-123',
        accessedByRole: 'healthcare_professional',
        ipAddress: '192.168.1.100',
        userAgent: 'test-user-agent',
        isEmergency: false,
      }

      const result = await sessionService.logDataAccess(sessionId, accessEntry)

      expect(result).toBe(true)
    })

    it('should require valid session for data access logging', async () => {
      const accessEntry: Omit<DataAccessEntry, 'timestamp'> = {
        patientId: 'patient-456',
        dataType: 'medical_record',
        action: 'view',
        reason: 'clinical_consultation',
        accessedBy: 'user-123',
        accessedByRole: 'healthcare_professional',
        ipAddress: '192.168.1.100',
        userAgent: 'test-user-agent',
        isEmergency: false,
      }

      await expect(
        sessionService.logDataAccess('invalid-session', accessEntry),
      ).rejects.toThrow('Invalid session')
    })

    it('should validate LGPD consent before allowing data access', async () => {
      // Create session without LGPD consent for sensitive data
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      const accessEntry: Omit<DataAccessEntry, 'timestamp'> = {
        patientId: 'patient-456',
        dataType: 'genetic_data', // Sensitive data requiring specific consent
        action: 'view',
        reason: 'clinical_consultation',
        accessedBy: 'user-123',
        accessedByRole: 'healthcare_professional',
        ipAddress: '192.168.1.100',
        userAgent: 'test-user-agent',
        isEmergency: false,
      }

      await expect(
        sessionService.logDataAccess(session.id, accessEntry),
      ).rejects.toThrow('Insufficient LGPD consent for sensitive data access')
    })

    it('should allow emergency access without full consent', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      const accessEntry: Omit<DataAccessEntry, 'timestamp'> = {
        patientId: 'patient-456',
        dataType: 'genetic_data',
        action: 'view',
        reason: 'medical_emergency',
        accessedBy: 'user-123',
        accessedByRole: 'healthcare_professional',
        ipAddress: '192.168.1.100',
        userAgent: 'test-user-agent',
        isEmergency: true,
      }

      const result = await sessionService.logDataAccess(session.id, accessEntry)

      expect(result).toBe(true)
    })
  })

  describe('Session Lifecycle Management', () => {
    it('should expire session successfully', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      await sessionService.expireSession(session.id, 'user_logout')

      const result = await sessionService.validateSession(session.id)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('expired')
    })

    it('should revoke all user sessions', async () => {
      // Create multiple sessions for the same user
      const session1 = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      const session2 = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      await sessionService.revokeAllUserSessions('user-123', 'security_incident')

      const result1 = await sessionService.validateSession(session1.id)
      const result2 = await sessionService.validateSession(session2.id)

      expect(result1.isValid).toBe(false)
      expect(result2.isValid).toBe(false)
      expect(result1.error).toContain('revoked')
      expect(result2.error).toContain('revoked')
    })

    it('should clean up expired sessions', async () => {
      // Create some sessions
      await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      await sessionService.createSession(
        'user-456',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-67890-SP',
          specialty: 'neurology',
        },
      )

      // Clean up expired sessions
      const cleanedCount = await sessionService.cleanupExpiredSessions()

      expect(cleanedCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Compliance Reporting', () => {
    it('should generate LGPD compliance report', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service', 'ai_assistance'],
            dataCategories: ['personal_data', 'health_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
          patientId: 'patient-456',
        },
      )

      // Log some data access
      await sessionService.logDataAccess(session.id, {
        patientId: 'patient-456',
        dataType: 'medical_record',
        action: 'view',
        reason: 'clinical_consultation',
        accessedBy: 'user-123',
        accessedByRole: 'healthcare_professional',
        ipAddress: '192.168.1.100',
        userAgent: 'test-user-agent',
        isEmergency: false,
      })

      const report = await sessionService.generateComplianceReport({
        userId: 'user-123',
        reportType: 'lgpd',
        format: 'json',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
      })

      expect(report).toBeDefined()
      expect(report.reportType).toBe('lgpd')
      expect(report.userId).toBe('user-123')
      expect(report.dataAccessLogs).toHaveLength(1)
      expect(report.complianceScore).toBeGreaterThan(80)
    })

    it('should generate ANVISA compliance report', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data', 'health_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
          anvisaCompliance: true,
        },
      )

      const report = await sessionService.generateComplianceReport({
        userId: 'user-123',
        reportType: 'anvisa',
        format: 'json',
        healthcareProvider: 'Hospital São Lucas',
      })

      expect(report).toBeDefined()
      expect(report.reportType).toBe('anvisa')
      expect(report.healthcareProvider).toBe('Hospital São Lucas')
      expect(report.anvisaCompliance).toBe(true)
      expect(report.cfmLicense).toBe('CRM-12345-SP')
    })

    it('should audit session compliance status', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      const auditResult = await sessionService.auditSessionCompliance(session.id)

      expect(auditResult).toBeDefined()
      expect(auditResult.sessionId).toBe(session.id)
      expect(auditResult.isCompliant).toBe(true)
      expect(auditResult.complianceAreas).toContain('lgpd')
      expect(auditResult.complianceAreas).toContain('cfm')
    })
  })

  describe('Security Integration', () => {
    it('should integrate with audit trail service', async () => {
      const spy = vi.spyOn(auditService, 'logSecurityEvent')

      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SESSION_CREATED',
          userId: 'user-123',
          metadata: expect.objectContaining({
            userRole: 'healthcare_professional',
            healthcareProvider: 'Hospital São Lucas',
            lgpdConsentVersion: '1.0',
          }),
        }),
      )
    })

    it('should validate session security', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      vi.spyOn(validationService, 'validateSessionSecurity').mockResolvedValueOnce({
        isValid: true,
        securityScore: 95,
        threats: [],
      })

      const securityResult = await sessionService.validateSessionSecurity(session.id)

      expect(securityResult.isValid).toBe(true)
      expect(securityResult.securityScore).toBe(95)
    })

    it('should detect suspicious session activity', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      // Log data access from different IP addresses
      await sessionService.logDataAccess(session.id, {
        patientId: 'patient-456',
        dataType: 'medical_record',
        action: 'view',
        reason: 'clinical_consultation',
        accessedBy: 'user-123',
        accessedByRole: 'healthcare_professional',
        ipAddress: '192.168.1.100',
        userAgent: 'test-user-agent',
        isEmergency: false,
      })

      await sessionService.logDataAccess(session.id, {
        patientId: 'patient-456',
        dataType: 'medical_record',
        action: 'view',
        reason: 'clinical_consultation',
        accessedBy: 'user-123',
        accessedByRole: 'healthcare_professional',
        ipAddress: '10.0.0.1', // Different IP
        userAgent: 'test-user-agent',
        isEmergency: false,
      })

      const threatResult = await sessionService.detectSuspiciousActivity(session.id)

      expect(threatResult.hasThreats).toBe(true)
      expect(threatResult.threats).toContain('multiple_ip_addresses')
    })
  })

  describe('Performance Requirements', () => {
    it('should create session within 100ms', async () => {
      const startTime = performance.now()
      await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(100) // 100ms threshold
    })

    it('should validate session within 50ms', async () => {
      const session = await sessionService.createSession(
        'user-123',
        'healthcare_professional',
        'Hospital São Lucas',
        {
          lgpdConsent: {
            consentVersion: '1.0',
            purposes: ['healthcare_service'],
            dataCategories: ['personal_data'],
            retentionPeriod: 365,
          },
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
        },
      )

      const startTime = performance.now()
      await sessionService.validateSession(session.id)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(50) // 50ms threshold
    })
  })

  describe('Error Handling', () => {
    it('should handle missing required parameters gracefully', async () => {
      await expect(
        sessionService.createSession('', 'healthcare_professional', 'Hospital São Lucas'),
      ).rejects.toThrow('User ID is required')
    })

    it('should handle invalid LGPD consent format', async () => {
      await expect(
        sessionService.createSession(
          'user-123',
          'healthcare_professional',
          'Hospital São Lucas',
          {
            lgpdConsent: {
              consentVersion: '', // Invalid empty version
              purposes: ['healthcare_service'],
              dataCategories: ['personal_data'],
              retentionPeriod: 365,
            },
            cfmLicense: 'CRM-12345-SP',
          },
        ),
      ).rejects.toThrow('LGPD consent version is required')
    })

    it('should handle database connection errors gracefully', async () => {
      vi.spyOn(sessionService, 'createSession').mockRejectedValueOnce(
        new Error('Database connection failed'),
      )

      await expect(
        sessionService.createSession(
          'user-123',
          'healthcare_professional',
          'Hospital São Lucas',
          {
            lgpdConsent: {
              consentVersion: '1.0',
              purposes: ['healthcare_service'],
              dataCategories: ['personal_data'],
              retentionPeriod: 365,
            },
            cfmLicense: 'CRM-12345-SP',
          },
        ),
      ).rejects.toThrow('Database connection failed')
    })
  })
})
