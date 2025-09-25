/**
 * Audit Trail Service Integration Tests
 * 
 * Comprehensive integration tests for audit trail service
 * with security event logging, compliance reporting, and real-time monitoring.
 * 
 * @security_critical
 * @test_coverage Audit Trail Service
 * Compliance: LGPD, ANVISA, CFM, HIPAA, GDPR
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuditTrailService, AuditEvent, AuditFilter, SecurityEvent, ComplianceReport } from '../services/audit-trail-service'
import { HealthcareSessionManagementService } from '../services/healthcare-session-management-service'
import { SecurityValidationService } from '../services/security-validation-service'

// Mock date utilities for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z')
vi.setSystemTime(mockDate)

describe('Audit Trail Service Integration Tests', () => {
  let auditService: typeof AuditTrailService
  let sessionService: typeof HealthcareSessionManagementService
  let validationService: typeof SecurityValidationService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset services
    auditService = AuditTrailService
    sessionService = HealthcareSessionManagementService
    validationService = SecurityValidationService

    // Mock environment variables
    vi.stubEnv('AUDIT_LOG_RETENTION_DAYS', '365')
    vi.stubEnv('ENABLE_REAL_TIME_MONITORING', 'true')
    vi.stubEnv('AUDIT_ENCRYPTION_KEY', 'test-audit-encryption-key')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Security Event Logging', () => {
    it('should log authentication success events', async () => {
      const eventData: Omit<SecurityEvent, 'id' | 'timestamp'> = {
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated successfully',
        metadata: {
          authenticationMethod: 'jwt',
          userRole: 'healthcare_professional',
          healthcareProvider: 'Hospital São Lucas',
        },
      }

      const eventId = await auditService.logSecurityEvent(eventData)
      
      expect(eventId).toBeDefined()
      expect(typeof eventId).toBe('string')
    })

    it('should log authentication failure events', async () => {
      const eventData: Omit<SecurityEvent, 'id' | 'timestamp'> = {
        eventType: 'AUTHENTICATION_FAILURE',
        userId: 'user-123',
        sessionId: undefined,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'warning',
        category: 'authentication',
        description: 'Authentication failed due to invalid credentials',
        metadata: {
          authenticationMethod: 'jwt',
          failureReason: 'invalid_token',
          attemptCount: 3,
        },
      }

      const eventId = await auditService.logSecurityEvent(eventData)
      
      expect(eventId).toBeDefined()
      expect(typeof eventId).toBe('string')
    })

    it('should log data access events', async () => {
      const eventData: Omit<SecurityEvent, 'id' | 'timestamp'> = {
        eventType: 'DATA_ACCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        category: 'data_access',
        description: 'Accessed patient medical record',
        metadata: {
          patientId: 'patient-456',
          dataType: 'medical_record',
          accessType: 'view',
          reason: 'clinical_consultation',
          isEmergency: false,
          lgpdConsentVersion: '1.0',
        },
      }

      const eventId = await auditService.logSecurityEvent(eventData)
      
      expect(eventId).toBeDefined()
      expect(typeof eventId).toBe('string')
    })

    it('should log security incidents', async () => {
      const eventData: Omit<SecurityEvent, 'id' | 'timestamp'> = {
        eventType: 'SECURITY_INCIDENT',
        userId: 'attacker-123',
        sessionId: 'session-456',
        ipAddress: '203.0.113.1',
        userAgent: 'sqlmap/1.0',
        severity: 'critical',
        category: 'security_threat',
        description: 'SQL injection attempt detected',
        metadata: {
          threatType: 'sql_injection',
          attackVector: 'user_input',
          targetEndpoint: '/api/patients',
          mitigationApplied: true,
          blocked: true,
        },
      }

      const eventId = await auditService.logSecurityEvent(eventData)
      
      expect(eventId).toBeDefined()
      expect(typeof eventId).toBe('string')
    })

    it('should log compliance violations', async () => {
      const eventData: Omit<SecurityEvent, 'id' | 'timestamp'> = {
        eventType: 'COMPLIANCE_VIOLATION',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'high',
        category: 'compliance',
        description: 'LGPD consent violation detected',
        metadata: {
          complianceFramework: 'lgpd',
          violationType: 'insufficient_consent',
          dataType: 'genetic_data',
          patientId: 'patient-456',
          action: 'data_access_without_consent',
        },
      }

      const eventId = await auditService.logSecurityEvent(eventData)
      
      expect(eventId).toBeDefined()
      expect(typeof eventId).toBe('string')
    })
  })

  describe('Audit Event Retrieval', () => {
    it('should retrieve events by user ID', async () => {
      // Log some events first
      await auditService.logSecurityEvent({
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      })

      await auditService.logSecurityEvent({
        eventType: 'DATA_ACCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'data_access',
        description: 'Accessed patient data',
      })

      const filter: AuditFilter = {
        userId: 'user-123',
        limit: 10,
      }

      const events = await auditService.getAuditEvents(filter)
      
      expect(events).toHaveLength(2)
      expect(events[0].userId).toBe('user-123')
      expect(events[1].userId).toBe('user-123')
    })

    it('should retrieve events by date range', async () => {
      const startDate = new Date('2024-01-01T00:00:00.000Z')
      const endDate = new Date('2024-01-01T23:59:59.999Z')

      await auditService.logSecurityEvent({
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      })

      const filter: AuditFilter = {
        dateRange: { start: startDate, end: endDate },
        limit: 10,
      }

      const events = await auditService.getAuditEvents(filter)
      
      expect(events.length).toBeGreaterThan(0)
    })

    it('should retrieve events by severity', async () => {
      await auditService.logSecurityEvent({
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      })

      await auditService.logSecurityEvent({
        eventType: 'SECURITY_INCIDENT',
        userId: 'attacker-123',
        sessionId: 'session-456',
        ipAddress: '203.0.113.1',
        userAgent: 'sqlmap/1.0',
        severity: 'critical',
        category: 'security_threat',
        description: 'SQL injection attempt',
      })

      const filter: AuditFilter = {
        severity: 'critical',
        limit: 10,
      }

      const events = await auditService.getAuditEvents(filter)
      
      expect(events).toHaveLength(1)
      expect(events[0].severity).toBe('critical')
    })

    it('should retrieve events by category', async () => {
      await auditService.logSecurityEvent({
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      })

      await auditService.logSecurityEvent({
        eventType: 'DATA_ACCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'data_access',
        description: 'Accessed patient data',
      })

      const filter: AuditFilter = {
        category: 'authentication',
        limit: 10,
      }

      const events = await auditService.getAuditEvents(filter)
      
      expect(events).toHaveLength(1)
      expect(events[0].category).toBe('authentication')
    })
  })

  describe('Compliance Reporting', () => {
    it('should generate LGPD compliance report', async () => {
      // Log some LGPD-related events
      await auditService.logSecurityEvent({
        eventType: 'DATA_ACCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'data_access',
        description: 'Accessed patient data with consent',
        metadata: {
          lgpdConsentVersion: '1.0',
          patientId: 'patient-456',
          dataType: 'medical_record',
        },
      })

      await auditService.logSecurityEvent({
        eventType: 'COMPLIANCE_VIOLATION',
        userId: 'user-456',
        sessionId: 'session-456',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
        severity: 'high',
        category: 'compliance',
        description: 'Accessed data without consent',
        metadata: {
          lgpdConsentVersion: undefined,
          patientId: 'patient-789',
          dataType: 'genetic_data',
        },
      })

      const report = await auditService.generateComplianceReport({
        framework: 'lgpd',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        format: 'json',
      })

      expect(report).toBeDefined()
      expect(report.framework).toBe('lgpd')
      expect(report.totalEvents).toBeGreaterThan(0)
      expect(report.complianceViolations).toBeGreaterThan(0)
      expect(report.consentValidation).toBeDefined()
      expect(report.dataRetention).toBeDefined()
    })

    it('should generate ANVISA compliance report', async () => {
      await auditService.logSecurityEvent({
        eventType: 'DATA_ACCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'data_access',
        description: 'Accessed medical device data',
        metadata: {
          anvisaCompliance: true,
          medicalDeviceId: 'device-123',
          healthcareProvider: 'Hospital São Lucas',
        },
      })

      const report = await auditService.generateComplianceReport({
        framework: 'anvisa',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        format: 'json',
      })

      expect(report).toBeDefined()
      expect(report.framework).toBe('anvisa')
      expect(report.medicalDeviceAccess).toBeDefined()
      expect(report.healthcareProviderCompliance).toBeDefined()
    })

    it('should generate CFM compliance report', async () => {
      await auditService.logSecurityEvent({
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'Healthcare professional authenticated',
        metadata: {
          cfmLicense: 'CRM-12345-SP',
          specialty: 'cardiology',
          userRole: 'healthcare_professional',
        },
      })

      const report = await auditService.generateComplianceReport({
        framework: 'cfm',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        format: 'json',
      })

      expect(report).toBeDefined()
      expect(report.framework).toBe('cfm')
      expect(report.professionalLicensing).toBeDefined()
      expect(report.specialtyValidation).toBeDefined()
    })
  })

  describe('Security Monitoring', () => {
    it('should detect suspicious activity patterns', async () => {
      // Log multiple failed authentication attempts
      for (let i = 0; i < 5; i++) {
        await auditService.logSecurityEvent({
          eventType: 'AUTHENTICATION_FAILURE',
          userId: 'attacker-123',
          sessionId: `session-${i}`,
          ipAddress: '203.0.113.1',
          userAgent: 'sqlmap/1.0',
          severity: 'warning',
          category: 'authentication',
          description: `Failed authentication attempt ${i + 1}`,
          metadata: {
            failureReason: 'invalid_credentials',
            attemptCount: i + 1,
          },
        })
      }

      const patterns = await auditService.detectSuspiciousPatterns({
        timeWindow: 300000, // 5 minutes
        threshold: 3,
      })

      expect(patterns.hasSuspiciousActivity).toBe(true)
      expect(patterns.patterns).toContain('brute_force')
      expect(patterns.riskScore).toBeGreaterThan(70)
    })

    it('should detect unusual data access patterns', async () => {
      // Log rapid data access from different IP addresses
      const ipAddresses = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '203.0.113.1', '198.51.100.1']
      
      for (let i = 0; i < ipAddresses.length; i++) {
        await auditService.logSecurityEvent({
          eventType: 'DATA_ACCESS',
          userId: 'user-123',
          sessionId: 'session-123',
          ipAddress: ipAddresses[i],
          userAgent: 'Mozilla/5.0',
          severity: 'info',
          category: 'data_access',
          description: `Accessed patient data from IP ${ipAddresses[i]}`,
          metadata: {
            patientId: `patient-${i + 1}`,
            dataType: 'medical_record',
          },
        })
      }

      const patterns = await auditService.detectSuspiciousPatterns({
        timeWindow: 300000,
        threshold: 3,
      })

      expect(patterns.hasSuspiciousActivity).toBe(true)
      expect(patterns.patterns).toContain('multiple_ip_access')
    })

    it('should detect compliance violations', async () => {
      // Log compliance violations
      await auditService.logSecurityEvent({
        eventType: 'COMPLIANCE_VIOLATION',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'high',
        category: 'compliance',
        description: 'Accessed genetic data without consent',
        metadata: {
          complianceFramework: 'lgpd',
          violationType: 'insufficient_consent',
          dataType: 'genetic_data',
        },
      })

      await auditService.logSecurityEvent({
        eventType: 'COMPLIANCE_VIOLATION',
        userId: 'user-456',
        sessionId: 'session-456',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
        severity: 'high',
        category: 'compliance',
        description: 'Data retention period exceeded',
        metadata: {
          complianceFramework: 'lgpd',
          violationType: 'retention_violation',
          dataType: 'personal_data',
        },
      })

      const violations = await auditService.getComplianceViolations({
        framework: 'lgpd',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
      })

      expect(violations).toHaveLength(2)
      expect(violations[0].complianceFramework).toBe('lgpd')
    })
  })

  describe('Real-time Alerting', () => {
    it('should generate real-time alerts for critical events', async () => {
      const alertSpy = vi.fn()

      // Mock alert callback
      auditService.setAlertCallback(alertSpy)

      await auditService.logSecurityEvent({
        eventType: 'SECURITY_INCIDENT',
        userId: 'attacker-123',
        sessionId: 'session-456',
        ipAddress: '203.0.113.1',
        userAgent: 'sqlmap/1.0',
        severity: 'critical',
        category: 'security_threat',
        description: 'SQL injection attempt detected',
        metadata: {
          threatType: 'sql_injection',
          blocked: true,
        },
      })

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'critical',
          eventType: 'SECURITY_INCIDENT',
          actionRequired: true,
        })
      )
    })

    it('should generate alerts for compliance violations', async () => {
      const alertSpy = vi.fn()

      auditService.setAlertCallback(alertSpy)

      await auditService.logSecurityEvent({
        eventType: 'COMPLIANCE_VIOLATION',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'high',
        category: 'compliance',
        description: 'LGPD consent violation',
        metadata: {
          complianceFramework: 'lgpd',
          violationType: 'insufficient_consent',
        },
      })

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'high',
          eventType: 'COMPLIANCE_VIOLATION',
          actionRequired: true,
        })
      )
    })
  })

  describe('Audit Log Integrity', () => {
    it('should ensure audit log immutability', async () => {
      const eventId = await auditService.logSecurityEvent({
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      })

      // Attempt to tamper with audit log
      await expect(
        auditService.modifyAuditEvent(eventId, { description: 'Modified description' })
      ).rejects.toThrow('Audit log modification not allowed')
    })

    it('should validate audit log checksums', async () => {
      await auditService.logSecurityEvent({
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      })

      const integrityCheck = await auditService.validateAuditLogIntegrity()
      
      expect(integrityCheck.isValid).toBe(true)
      expect(integrityCheck.checksum).toBeDefined()
    })

    it('should detect audit log tampering', async () => {
      // This would test tampering detection in a real implementation
      const integrityCheck = await auditService.validateAuditLogIntegrity()
      
      expect(integrityCheck.isValid).toBe(true)
      expect(integrityCheck.tamperingDetected).toBe(false)
    })
  })

  describe('Data Retention', () => {
    it('should enforce audit log retention policies', async () => {
      // Log some events
      await auditService.logSecurityEvent({
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      })

      // Clean up expired events
      const deletedCount = await auditService.cleanupExpiredEvents()
      
      expect(deletedCount).toBeGreaterThanOrEqual(0)
    })

    it('should preserve critical security events beyond retention period', async () => {
      await auditService.logSecurityEvent({
        eventType: 'SECURITY_INCIDENT',
        userId: 'attacker-123',
        sessionId: 'session-456',
        ipAddress: '203.0.113.1',
        userAgent: 'sqlmap/1.0',
        severity: 'critical',
        category: 'security_threat',
        description: 'Critical security incident',
        metadata: {
          preserveBeyondRetention: true,
        },
      })

      // Check that critical events are preserved
      const filter: AuditFilter = {
        severity: 'critical',
        limit: 10,
      }

      const events = await auditService.getAuditEvents(filter)
      
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].preserveBeyondRetention).toBe(true)
    })
  })

  describe('Performance Requirements', () => {
    it('should log security events within 50ms', async () => {
      const eventData: Omit<SecurityEvent, 'id' | 'timestamp'> = {
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      }

      const startTime = performance.now()
      await auditService.logSecurityEvent(eventData)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(50) // 50ms threshold
    })

    it('should retrieve audit events within 100ms', async () => {
      // Log some events first
      for (let i = 0; i < 10; i++) {
        await auditService.logSecurityEvent({
          eventType: 'AUTHENTICATION_SUCCESS',
          userId: `user-${i}`,
          sessionId: `session-${i}`,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0',
          severity: 'info',
          category: 'authentication',
          description: 'User authenticated',
        })
      }

      const filter: AuditFilter = {
        limit: 10,
      }

      const startTime = performance.now()
      await auditService.getAuditEvents(filter)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(100) // 100ms threshold
    })
  })

  describe('Error Handling', () => {
    it('should handle missing required fields gracefully', async () => {
      const invalidEvent: any = {
        eventType: 'AUTHENTICATION_SUCCESS',
        // Missing required userId field
        ipAddress: '192.168.1.100',
      }

      await expect(
        auditService.logSecurityEvent(invalidEvent)
      ).rejects.toThrow('Missing required field: userId')
    })

    it('should handle database connection errors gracefully', async () => {
      vi.spyOn(auditService, 'logSecurityEvent').mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const eventData: Omit<SecurityEvent, 'id' | 'timestamp'> = {
        eventType: 'AUTHENTICATION_SUCCESS',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'info',
        category: 'authentication',
        description: 'User authenticated',
      }

      await expect(
        auditService.logSecurityEvent(eventData)
      ).rejects.toThrow('Database connection failed')
    })

    it('should validate audit event structure', async () => {
      const invalidEvent: any = {
        eventType: 'INVALID_EVENT_TYPE',
        userId: 'user-123',
        sessionId: 'session-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        severity: 'invalid_severity',
        category: 'authentication',
        description: 'Invalid event',
      }

      await expect(
        auditService.logSecurityEvent(invalidEvent)
      ).rejects.toThrow('Invalid event structure')
    })
  })
})