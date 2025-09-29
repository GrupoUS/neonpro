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

// Mock healthcare compliance services
globalThis.healthcareCompliance = {
  validateANVISA(data: any): boolean {
    if (!data || typeof data !== 'object') return false
    const requiredFields = ['id', 'createdAt', 'createdBy']
    return requiredFields.every(field => field in data)
  },
  
  sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data
    
    const sanitized = { ...data }
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
  validateConsent(consentData: any): boolean {
    if (!consentData || typeof consentData !== 'object') return false
    
    const requiredFields = ['version', 'grantedAt', 'purpose', 'dataSubjectId']
    return requiredFields.every(field => field in consentData)
  },
  
  anonymizeData(data: any): any {
    if (!data || typeof data !== 'object') return data
    
    const anonymized = { ...data }
    const personalFields = ['name', 'email', 'phone', 'address']
    personalFields.forEach(field => {
      if (field in anonymized) {
        anonymized[field] = `ANONYMIZED_${field.toUpperCase()}`
      }
    })
    
    return anonymized
  },
  
  validateRetention(data: any): boolean {
    if (!data || !data.createdAt) return false
    
    const createdAt = new Date(data.createdAt)
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
  
  generateAuditLog(action: string, userId: string, dataType: string): any {
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
  
  validateHealthcareCompliance(data: any): boolean {
    if (!data || typeof data !== 'object') return false
    if (!data.auditTrail) return false
    if (data.patientId && !data.consentVersion) return false
    return true
  },
}

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
  mark: (name: string) => {
    if (process.env.TEST_DEBUG === 'true') {
      console.log(`[PERF] Mark: ${name}`)
    }
  },
  measure: (name: string, startMark?: string, endMark?: string) => {
    if (process.env.TEST_DEBUG === 'true') {
      console.log(`[PERF] Measure: ${name}`)
    }
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
  const healthcareCompliance: {
    validateANVISA(data: any): boolean
    sanitizeData(data: any): any
    validateProfessionalLicense(license: string): boolean
    generateHealthcareTimestamp(): string
  }
  
  const lgpdValidation: {
    validateConsent(consentData: any): boolean
    anonymizeData(data: any): any
    validateRetention(data: any): boolean
  }
  
  const securityContext: {
    encrypt(data: string): string
    decrypt(encryptedData: string): string
    validateAccess(userRole: string, dataType: string): boolean
    generateAuditLog(action: string, userId: string, dataType: string): any
  }
  
  const testUtils: {
    wait(ms: number): Promise<void>
    createMockPatientData(): any
    createMockAppointmentData(): any
    validateHealthcareCompliance(data: any): boolean
  }
  
  const cleanup: () => void
}

console.log('[BUN TEST SETUP] Healthcare compliance test environment loaded')