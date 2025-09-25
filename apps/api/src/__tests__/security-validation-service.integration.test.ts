/**
 * Security Validation Service Integration Tests
 * 
 * Comprehensive integration tests for security validation service
 * with input validation, threat detection, and healthcare data protection.
 * 
 * @security_critical
 * @test_coverage Security Validation Service
 * Compliance: OWASP Top 10, LGPD, HIPAA, GDPR
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Context } from 'hono'
import { SecurityValidationService, SecurityValidationResult, InputValidationResult, ThreatDetectionResult } from '../services/security-validation-service'
import { HealthcareSessionManagementService } from '../services/healthcare-session-management-service'
import { AuditTrailService } from '../services/audit-trail-service'
import { z } from 'zod'

// Mock Hono context
const createMockContext = (overrides = {}): Context => {
  const req = {
    header: vi.fn(),
    method: 'POST',
    path: '/api/patients',
    url: 'http://localhost:3000/api/patients',
    body: {
      patientId: 'patient-123',
      name: 'John Doe',
      dateOfBirth: '1990-01-01',
    },
  } as any

  return {
    req,
    header: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    ...overrides,
  } as any
}

describe('Security Validation Service Integration Tests', () => {
  let validationService: typeof SecurityValidationService
  let sessionService: typeof HealthcareSessionManagementService
  let auditService: typeof AuditTrailService

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset services
    validationService = SecurityValidationService
    sessionService = HealthcareSessionManagementService
    auditService = AuditTrailService

    // Mock environment variables
    vi.stubEnv('MAX_REQUEST_SIZE', '10485760') // 10MB
    vi.stubEnv('ENABLE_THREAT_DETECTION', 'true')
    vi.stubEnv('RATE_LIMIT_THRESHOLD', '100')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Request Security Validation', () => {
    it('should validate secure request successfully', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'), // Content length
        },
      })

      const result = await validationService.validateRequestSecurity(c)
      
      expect(result.isValid).toBe(true)
      expect(result.securityScore).toBeGreaterThan(80)
      expect(result.threats).toHaveLength(0)
    })

    it('should detect suspicious user agent', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('sqlmap/1.0') // Suspicious user agent
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const result = await validationService.validateRequestSecurity(c)
      
      expect(result.isValid).toBe(false)
      expect(result.threats).toContain('suspicious_user_agent')
      expect(result.securityScore).toBeLessThan(50)
    })

    it('should detect missing security headers', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce(undefined) // Missing referer
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const result = await validationService.validateRequestSecurity(c)
      
      expect(result.warnings).toContain('Missing security headers')
      expect(result.securityScore).toBeLessThan(90)
    })

    it('should validate request size limits', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('15728640'), // 15MB - exceeds 10MB limit
        },
      })

      const result = await validationService.validateRequestSecurity(c)
      
      expect(result.isValid).toBe(false)
      expect(result.threats).toContain('request_size_exceeded')
    })

    it('should detect potential CSRF attacks', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          method: 'POST',
          header: vi.fn()
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('http://malicious-site.com') // Different origin
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const result = await validationService.validateRequestSecurity(c)
      
      expect(result.warnings).toContain('potential_csrf')
    })
  })

  describe('Input Validation with Schemas', () => {
    it('should validate valid patient data with schema', () => {
      const patientSchema = z.object({
        patientId: z.string().min(1).max(50),
        name: z.string().min(1).max(100),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        email: z.string().email().optional(),
        phone: z.string().regex(/^\+?[\d\s-]+$/).optional(),
      })

      const validData = {
        patientId: 'patient-123',
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        email: 'john.doe@example.com',
        phone: '+55 11 98765-4321',
      }

      const result = validationService.validateWithSchema(validData, patientSchema)
      
      expect(result.isValid).toBe(true)
      expect(result.data).toEqual(validData)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid patient data with schema', () => {
      const patientSchema = z.object({
        patientId: z.string().min(1).max(50),
        name: z.string().min(1).max(100),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        email: z.string().email().optional(),
        phone: z.string().regex(/^\+?[\d\s-]+$/).optional(),
      })

      const invalidData = {
        patientId: '', // Invalid: empty string
        name: 'John Doe',
        dateOfBirth: '1990-13-01', // Invalid: month 13
        email: 'invalid-email', // Invalid: not a valid email
        phone: '123', // Invalid: too short
      }

      const result = validationService.validateWithSchema(invalidData, patientSchema)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(4)
      expect(result.errors[0].path).toContain('patientId')
      expect(result.errors[1].path).toContain('dateOfBirth')
      expect(result.errors[2].path).toContain('email')
      expect(result.errors[3].path).toContain('phone')
    })

    it('should sanitize sensitive data in validation results', () => {
      const sensitiveSchema = z.object({
        patientId: z.string(),
        ssn: z.string(), // Social Security Number - sensitive
        creditCard: z.string(), // Credit Card - sensitive
      })

      const sensitiveData = {
        patientId: 'patient-123',
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111',
      }

      const result = validationService.validateWithSchema(sensitiveData, sensitiveSchema, {
        sanitizeSensitiveData: true,
        sensitiveFields: ['ssn', 'creditCard'],
      })
      
      expect(result.isValid).toBe(true)
      expect(result.data.patientId).toBe('patient-123')
      expect(result.data.ssn).toBe('***-**-****') // Sanitized
      expect(result.data.creditCard).toBe('****-****-****-****') // Sanitized
    })
  })

  describe('SQL Injection Detection', () => {
    it('should detect SQL injection attempts', () => {
      const maliciousInputs = [
        "SELECT * FROM users WHERE password = 'password'",
        "1; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1 UNION SELECT username, password FROM users",
        "'; EXEC xp_cmdshell('dir'); --",
      ]

      maliciousInputs.forEach(input => {
        const result = validationService.detectSQLInjection(input)
        expect(result.isDetected).toBe(true)
        expect(result.severity).toBe('high')
        expect(result.pattern).toBeDefined()
      })
    })

    it('should allow legitimate SQL-like inputs', () => {
      const legitimateInputs = [
        "The patient's condition improved",
        "It's a beautiful day",
        "John's medical record",
        "Patient's history shows",
        "The doctor's diagnosis",
      ]

      legitimateInputs.forEach(input => {
        const result = validationService.detectSQLInjection(input)
        expect(result.isDetected).toBe(false)
        expect(result.severity).toBe('none')
      })
    })

    it('should detect advanced SQL injection patterns', () => {
      const advancedPatterns = [
        "1 WAITFOR DELAY '0:0:5'--",
        "1 AND SLEEP(5)--",
        "1' AND (SELECT COUNT(*) FROM information_schema.tables)>0--",
        "1' OR 1=CHAR(74,65,76)--", // ASCII encoded
        "1' UNION ALL SELECT NULL, CONCAT(username,0x3a,password) FROM users--",
      ]

      advancedPatterns.forEach(input => {
        const result = validationService.detectSQLInjection(input)
        expect(result.isDetected).toBe(true)
        expect(result.severity).toBe('high')
      })
    })
  })

  describe('XSS Detection', () => {
    it('should detect XSS attempts', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        '<iframe src="javascript:alert(1)">',
        '<input onfocus="alert(1)" autofocus>',
        '<details open ontoggle="alert(1)">',
        '<style>@keyframes x{from{}to{left:0;}}x{animation:x}</style>',
      ]

      maliciousInputs.forEach(input => {
        const result = validationService.detectXSS(input)
        expect(result.isDetected).toBe(true)
        expect(result.severity).toBe('high')
      })
    })

    it('should allow legitimate HTML-like content', () => {
      const legitimateInputs = [
        'The patient has < 120 mg/dL cholesterol',
        'Temperature > 38.5°C indicates fever',
        'The dosage is 5-10mg per day',
        'Please review the <patient> records',
        'The <strong>positive</strong> test result',
      ]

      legitimateInputs.forEach(input => {
        const result = validationService.detectXSS(input)
        expect(result.isDetected).toBe(false)
        expect(result.severity).toBe('none')
      })
    })

    it('should detect encoded XSS attempts', () => {
      const encodedInputs = [
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        '%3Cscript%3Ealert(%22xss%22)%3C/script%3E',
        '&#60;script&#62;alert&#40;&#34;xss&#34;&#41;&#60;/script&#62;',
        'javascript&#x3A;alert&#x28;1&#x29;',
      ]

      encodedInputs.forEach(input => {
        const result = validationService.detectXSS(input)
        expect(result.isDetected).toBe(true)
        expect(result.severity).toBe('high')
      })
    })
  })

  describe('Healthcare Data Protection', () => {
    it('should validate healthcare data access patterns', () => {
      const legitimateAccess = {
        patientId: 'patient-123',
        action: 'view_medical_record',
        reason: 'clinical_consultation',
        accessedBy: 'doctor-123',
        accessedByRole: 'healthcare_professional',
      }

      const result = validationService.validateHealthcareDataAccess(legitimateAccess)
      
      expect(result.isValid).toBe(true)
      expect(result.complianceScore).toBeGreaterThan(90)
    })

    it('should detect suspicious healthcare data access', () => {
      const suspiciousAccess = {
        patientId: 'patient-123',
        action: 'view_medical_record',
        reason: 'data_theft', // Suspicious reason
        accessedBy: 'attacker-123',
        accessedByRole: 'unauthorized_role',
      }

      const result = validationService.validateHealthcareDataAccess(suspiciousAccess)
      
      expect(result.isValid).toBe(false)
      expect(result.threats).toContain('suspicious_access_pattern')
    })

    it('should validate LGPD compliance for data processing', () => {
      const compliantProcessing = {
        patientId: 'patient-123',
        dataType: 'medical_history',
        purpose: 'healthcare_treatment',
        legalBasis: 'consent',
        consentVersion: '1.0',
        retentionPeriod: 365,
      }

      const result = validationService.validateLGPDCompliance(compliantProcessing)
      
      expect(result.isValid).toBe(true)
      expect(result.complianceAreas).toContain('consent')
      expect(result.complianceAreas).toContain('retention')
    })

    it('should detect LGPD violations', () => {
      const nonCompliantProcessing = {
        patientId: 'patient-123',
        dataType: 'genetic_data', // Sensitive data
        purpose: 'marketing', // Not healthcare related
        legalBasis: 'legitimate_interest', // Insufficient for sensitive data
        consentVersion: '1.0',
        retentionPeriod: 365,
      }

      const result = validationService.validateLGPDCompliance(nonCompliantProcessing)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContain('insensitive_data_purpose_mismatch')
      expect(result.violations).toContain('inadequate_legal_basis')
    })
  })

  describe('Behavioral Analysis', () => {
    it('should detect unusual access patterns', async () => {
      const sessionId = 'session-123'
      
      // Simulate rapid access from different locations
      const accessPatterns = [
        { ipAddress: '192.168.1.100', userAgent: 'Chrome/90.0', timestamp: new Date() },
        { ipAddress: '10.0.0.1', userAgent: 'Chrome/90.0', timestamp: new Date(Date.now() + 1000) },
        { ipAddress: '172.16.0.1', userAgent: 'Chrome/90.0', timestamp: new Date(Date.now() + 2000) },
        { ipAddress: '203.0.113.1', userAgent: 'Chrome/90.0', timestamp: new Date(Date.now() + 3000) },
      ]

      const result = await validationService.analyzeAccessPattern(sessionId, accessPatterns)
      
      expect(result.isSuspicious).toBe(true)
      expect(result.threats).toContain('rapid_ip_change')
      expect(result.riskScore).toBeGreaterThan(70)
    })

    it('should detect brute force attempts', async () => {
      const sessionId = 'session-123'
      
      // Simulate rapid failed authentication attempts
      const authAttempts = [
        { success: false, timestamp: new Date() },
        { success: false, timestamp: new Date(Date.now() + 100) },
        { success: false, timestamp: new Date(Date.now() + 200) },
        { success: false, timestamp: new Date(Date.now() + 300) },
        { success: false, timestamp: new Date(Date.now() + 400) },
      ]

      const result = await validationService.detectBruteForce(sessionId, authAttempts)
      
      expect(result.isDetected).toBe(true)
      expect(result.threatType).toBe('brute_force')
      expect(result.severity).toBe('high')
    })

    it('should detect data exfiltration patterns', async () => {
      const sessionId = 'session-123'
      
      // Simulate large data access patterns
      const dataAccess = [
        { patientId: 'patient-1', dataSize: 1024, timestamp: new Date() },
        { patientId: 'patient-2', dataSize: 2048, timestamp: new Date(Date.now() + 1000) },
        { patientId: 'patient-3', dataSize: 4096, timestamp: new Date(Date.now() + 2000) },
        { patientId: 'patient-4', dataSize: 8192, timestamp: new Date(Date.now() + 3000) },
        { patientId: 'patient-5', dataSize: 16384, timestamp: new Date(Date.now() + 4000) },
      ]

      const result = await validationService.detectDataExfiltration(sessionId, dataAccess)
      
      expect(result.isDetected).toBe(true)
      expect(result.threatType).toBe('data_exfiltration')
      expect(result.totalDataAccessed).toBe(31744)
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits successfully', async () => {
      const clientId = 'client-123'
      const maxRequests = 5
      const windowMs = 60000 // 1 minute

      // Test within limits
      for (let i = 0; i < maxRequests; i++) {
        const result = await validationService.checkRateLimit(clientId, maxRequests, windowMs)
        expect(result.isAllowed).toBe(true)
        expect(result.remainingRequests).toBe(maxRequests - i - 1)
      }

      // Test exceeding limits
      const excessResult = await validationService.checkRateLimit(clientId, maxRequests, windowMs)
      expect(excessResult.isAllowed).toBe(false)
      expect(excessResult.remainingRequests).toBe(0)
    })

    it('should reset rate limits after window expires', async () => {
      const clientId = 'client-123'
      const maxRequests = 3
      const windowMs = 1000 // 1 second for testing

      // Use up all requests
      for (let i = 0; i < maxRequests; i++) {
        await validationService.checkRateLimit(clientId, maxRequests, windowMs)
      }

      // Should be blocked
      const blockedResult = await validationService.checkRateLimit(clientId, maxRequests, windowMs)
      expect(blockedResult.isAllowed).toBe(false)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Should be allowed again
      const resetResult = await validationService.checkRateLimit(clientId, maxRequests, windowMs)
      expect(resetResult.isAllowed).toBe(true)
    })
  })

  describe('Security Scoring', () => {
    it('should calculate comprehensive security score', async () => {
      const securityContext = {
        requestValidation: { score: 90, threats: [] },
        inputValidation: { score: 95, errors: 0 },
        threatDetection: { score: 85, threats: ['suspicious_user_agent'] },
        behavioralAnalysis: { score: 100, anomalies: 0 },
        complianceValidation: { score: 90, violations: 0 },
      }

      const score = await validationService.calculateSecurityScore(securityContext)
      
      expect(score).toBeGreaterThan(80) // Good score despite minor threats
      expect(score).toBeLessThan(95) // Not perfect due to suspicious user agent
    })

    it('should provide security recommendations', async () => {
      const securityContext = {
        requestValidation: { score: 70, threats: ['missing_security_headers'] },
        inputValidation: { score: 85, errors: 2 },
        threatDetection: { score: 90, threats: [] },
        behavioralAnalysis: { score: 80, anomalies: 1 },
        complianceValidation: { score: 75, violations: ['insufficient_encryption'] },
      }

      const recommendations = await validationService.getSecurityRecommendations(securityContext)
      
      expect(recommendations).toHaveLength(4)
      expect(recommendations[0].priority).toBe('high')
      expect(recommendations[0].category).toBe('request_security')
    })
  })

  describe('Performance Requirements', () => {
    it('should validate request security within 50ms', async () => {
      const c = createMockContext({
        req: {
          ...createMockContext().req,
          header: vi.fn()
            .mockReturnValueOnce('192.168.1.100')
            .mockReturnValueOnce('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            .mockReturnValueOnce('https://trusted-hospital.com')
            .mockReturnValueOnce('application/json')
            .mockReturnValueOnce('1024'),
        },
      })

      const startTime = performance.now()
      await validationService.validateRequestSecurity(c)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(50) // 50ms threshold
    })

    it('should validate input with schema within 10ms', () => {
      const patientSchema = z.object({
        patientId: z.string(),
        name: z.string(),
        email: z.string().email(),
      })

      const data = {
        patientId: 'patient-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
      }

      const startTime = performance.now()
      validationService.validateWithSchema(data, patientSchema)
      const endTime = performance.now()

      const duration = endTime - startTime
      expect(duration).toBeLessThan(10) // 10ms threshold
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed input gracefully', () => {
      const result = validationService.validateWithSchema(
        null, // Invalid input
        z.object({ name: z.string() })
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0].message).toContain('invalid input')
    })

    it('should handle schema validation errors gracefully', () => {
      const invalidSchema = null as any // Invalid schema
      
      const result = validationService.validateWithSchema(
        { name: 'test' },
        invalidSchema
      )
      
      expect(result.isValid).toBe(false)
      expect(result.errors[0].message).toContain('invalid schema')
    })

    it('should provide detailed error information', () => {
      const data = {
        patientId: '', // Required field empty
        email: 'invalid-email', // Invalid format
        age: -5, // Invalid range
      }

      const schema = z.object({
        patientId: z.string().min(1),
        email: z.string().email(),
        age: z.number().min(0),
      })

      const result = validationService.validateWithSchema(data, schema)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3)
      expect(result.errors[0]).toHaveProperty('path')
      expect(result.errors[0]).toHaveProperty('message')
      expect(result.errors[0]).toHaveProperty('code')
    })
  })
})