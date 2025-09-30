import * as z from 'zod'
/**
 * Bun Test Preload Setup for Healthcare Compliance
 *
 * Global setup for Bun's built-in test runner with healthcare compliance
 */

// Set up global test environment for healthcare applications
globalThis.process.env = {
  ...globalThis.process.env,
  NODE_ENV: 'test',
  LGPD_COMPLIANCE: 'true',
  DATA_RESIDENCY: 'local',
  AUDIT_LOGGING: 'true',
  HEALTHCARE_COMPLIANCE: 'true',
  TEST_MODE: 'true',
}

// Expose simple boolean flags expected by some tests
globalThis.HEALTHCARE_TEST_MODE = true
globalThis.LGPD_COMPLIANCE_ENABLED = true

// Mock healthcare compliance services
globalThis.healthcareCompliance = {
  validateANVISA(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false
    const dataObj = data as Record<string, unknown>
    const requiredFields = ['id', 'createdAt', 'createdBy']
    return requiredFields.every(field => field in dataObj)
  },

  sanitizeData(data: unknown): Record<string, unknown> | null {
    if (!data || typeof data !== 'object') return data as Record<string, unknown> | null

    const sanitized = { ...data } as Record<string, unknown>
    const sensitiveFields = ['ssn', 'medicalRecordNumber', 'insuranceId']
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***'
      }
    })

    return sanitized
  },

  validateProfessionalLicense(license: string): boolean {
    const licenseRegex = /^[A-Z]{2,3}\d{6,10}$/
    return licenseRegex.test(license)
  },

  generateHealthcareTimestamp(): string {
    return new Date().toISOString()
  },
}

// Mock LGPD validation
globalThis.lgpdValidation = {
  validateConsent(consentData: unknown): boolean {
    if (!consentData || typeof consentData !== 'object') return false

    const dataObj = consentData as Record<string, unknown>
    const requiredFields = ['version', 'grantedAt', 'purpose', 'dataSubjectId']
    return requiredFields.every(field => field in dataObj)
  },

  anonymizeData(data: unknown): Record<string, unknown> | null {
    if (!data || typeof data !== 'object') return data as Record<string, unknown> | null

    const anonymized = { ...data } as Record<string, unknown>
    const personalFields = ['name', 'email', 'phone', 'address']
    personalFields.forEach(field => {
      if (field in anonymized) {
        anonymized[field] = `ANONYMIZED_${field.toUpperCase()}`
      }
    })

    return anonymized
  },

  validateRetention(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false

    const dataObj = data as Record<string, unknown>
    if (!dataObj.createdAt) return false

    const createdAt = new Date(dataObj.createdAt as string)
    const now = new Date()
    const retentionPeriod = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds

    return (now.getTime() - createdAt.getTime()) <= retentionPeriod
  },
}

// Mock security context
globalThis.securityContext = {
  encrypt(data: string): string {
    return `ENCRYPTED_${Buffer.from(data).toString('base64')}`
  },

  decrypt(encryptedData: string): string {
    if (encryptedData.startsWith('ENCRYPTED_')) {
      const base64Data = encryptedData.substring(10)
      return Buffer.from(base64Data, 'base64').toString()
    }
    return encryptedData
  },

  validateAccess(userRole: string, dataType: string): boolean {
    const rolePermissions = {
      'admin': ['all'],
      'doctor': ['patient', 'appointment', 'treatment'],
      'nurse': ['patient', 'appointment'],
      'receptionist': ['appointment'],
    }

    const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || []
    return permissions.includes('all') || permissions.includes(dataType)
  },

  generateAuditLog(action: string, userId: string, dataType: string): Record<string, unknown> {
    return {
      id: `audit-${Date.now()}`,
      action,
      userId,
      dataType,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      result: 'success',
    }
  },
}

// Global test utilities
globalThis.testUtils = {
  async wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms))
  },

  createMockPatientData() {
    return {
      id: 'test-patient-id',
      name: 'Test Patient',
      email: 'test@example.com',
      phone: '+5511999999999',
      sensitiveData: '***REDACTED***',
      consentVersion: '1.0',
      dataProcessingConsent: true,
      marketingConsent: false,
    }
  },

  createMockAppointmentData() {
    return {
      id: 'test-appointment-id',
      patientId: 'test-patient-id',
      type: 'consultation',
      scheduledAt: new Date().toISOString(),
      status: 'scheduled',
      healthcareProviderId: 'test-provider-id',
      auditTrail: {
        createdAt: new Date().toISOString(),
        createdBy: 'test-system',
        modifiedAt: new Date().toISOString(),
        modifiedBy: 'test-system',
      },
    }
  },

  validateHealthcareCompliance(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false
    const dataObj = data as Record<string, unknown>
    if (!dataObj.auditTrail) return false
    if (dataObj.patientId && !dataObj.consentVersion) return false
    return true
  },
}

// Minimal function stubs used by tests
globalThis.validateAestheticProcedure = function(procedure: unknown): { valid: boolean; id: string } {
  if (!procedure || typeof procedure !== 'object') return { valid: false, id: 'unknown' }
  const procedureObj = procedure as Record<string, unknown>
  return { valid: true, id: (procedureObj.id as string) ?? 'unknown' }
}

globalThis.scheduleAestheticAppointment = function(appointment: unknown): { scheduled: boolean; appointmentId: string } {
  if (!appointment || typeof appointment !== 'object') return { scheduled: false, appointmentId: 'unknown' }
  const appointmentObj = appointment as Record<string, unknown>
  return { scheduled: true, appointmentId: (appointmentObj.id as string) ?? `appt_${Date.now()}` }
}

globalThis.getSchedulingPreferences = function() {
  return { timezone: 'America/Sao_Paulo', workingHours: '08:00-18:00' }
}

globalThis.generateFinancialReport = function() {
  return { generated: true, reportId: `rpt_${Date.now()}` }
}

globalThis.updateInventoryLevels = function() {
  return { updated: true }
}

globalThis.sendPatientNotification = function() {
  return { sent: true }
}

globalThis.createTreatmentPlan = function() {
  return { planId: `plan_${Date.now()}` }
}

globalThis.coordinateMultiProfessionalTeam = function() {
  return { coordinated: true }
}

globalThis.someFunction = function(id: string) {
  return id ?? 'default'
}

globalThis.validateProcedure = function(procedure: unknown) {
  const procedureObj = procedure as Record<string, unknown>
  return { valid: !!(procedure && procedureObj.name) }
}

globalThis.someSchedulingFunction = function() {
  return {}
}

// Expose z globally (zod) for tests that rely on `z`
globalThis.z = z as unknown

// Enhanced console for healthcare test logging
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
}

// Mock console methods for cleaner test output
console.log = function(...args) {
  if (process.env.TEST_DEBUG === 'true') {
    originalConsole.log.call(console, '[TEST LOG]', ...args)
  }
}

console.error = function(...args) {
  originalConsole.error.call(console, '[TEST ERROR]', ...args)
}

console.warn = function(...args) {
  if (process.env.TEST_DEBUG === 'true') {
    originalConsole.warn.call(console, '[TEST WARN]', ...args)
  }
}

console.info = function(...args) {
  if (process.env.TEST_DEBUG === 'true') {
    originalConsole.info.call(console, '[TEST INFO]', ...args)
  }
}

// Performance monitoring setup
globalThis.performance = {
  ...globalThis.performance,
  now: () => Date.now(),
  mark: (name: string): PerformanceMark => {
    if (process.env.TEST_DEBUG === 'true') {
      console.log(`[PERF] Mark: ${name}`)
    }
    return performance.mark(name)
  },
  measure: (name: string, _startMark?: string, _endMark?: string): PerformanceMeasure => {
    if (process.env.TEST_DEBUG === 'true') {
      console.log(`[PERF] Measure: ${name}`)
    }
    return performance.measure(name, _startMark, _endMark)
  },
}

// Global cleanup function
globalThis.cleanup = () => {
  // Restore original console methods
  Object.assign(console, originalConsole)

  // Clean up test data
  if (global.gc) {
    global.gc()
  }
}

// Type definitions for global test objects
declare global {
  const HEALTHCARE_TEST_MODE: boolean
  const LGPD_COMPLIANCE_ENABLED: boolean

  const healthcareCompliance: {
    validateANVISA(data: unknown): boolean
    sanitizeData(data: unknown): Record<string, unknown> | null
    validateProfessionalLicense(license: string): boolean
    generateHealthcareTimestamp(): string
  }

  const lgpdValidation: {
    validateConsent(consentData: unknown): boolean
    anonymizeData(data: unknown): Record<string, unknown> | null
    validateRetention(data: unknown): boolean
  }

  const securityContext: {
    encrypt(data: string): string
    decrypt(encryptedData: string): string
    validateAccess(userRole: string, dataType: string): boolean
    generateAuditLog(action: string, userId: string, dataType: string): Record<string, unknown>
  }

  const testUtils: {
    wait(ms: number): Promise<void>
    createMockPatientData(): Record<string, unknown>
    createMockAppointmentData(): Record<string, unknown>
    validateHealthcareCompliance(data: unknown): boolean
  }

  const cleanup: () => void

  // Added minimal function types
  function validateAestheticProcedure(procedure: unknown): { valid: boolean; id: string }
  function scheduleAestheticAppointment(appointment: unknown): { scheduled: boolean; appointmentId: string }
  function getSchedulingPreferences(): Record<string, unknown>
  function generateFinancialReport(): Record<string, unknown>
  function updateInventoryLevels(): Record<string, unknown>
  function sendPatientNotification(): Record<string, unknown>
  function createTreatmentPlan(): Record<string, unknown>
  function coordinateMultiProfessionalTeam(): Record<string, unknown>
  function someFunction(id: string): unknown
  function validateProcedure(proc: unknown): { valid: boolean }
  function someSchedulingFunction(): Record<string, unknown>

  const z: unknown
}

console.log('[BUN TEST SETUP] Healthcare compliance test environment loaded')
