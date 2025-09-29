/**
 * Healthcare-Optimized Bun Test Setup
 * 
 * Provides comprehensive test environment setup for healthcare compliance testing with Bun runtime
 */

import { vi, beforeEach, afterEach } from 'vitest'
import { setupHealthcareCompliance } from './healthcare-compliance'
import { setupLGPDValidation } from './lgpd-validation'
import { setupSecurityContext } from './security-context'

// Global test timeout for healthcare operations
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 })

// Mock console methods in test environment to reduce noise
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(async () => {
  // Setup healthcare compliance environment
  await setupHealthcareCompliance()
  
  // Setup LGPD validation context
  await setupLGPDValidation()
  
  // Setup security context for healthcare data
  await setupSecurityContext()
  
  // Mock console methods for cleaner test output
  console.log = vi.fn()
  console.error = vi.fn()
  console.warn = vi.fn()
  
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.LGPD_COMPLIANCE = 'true'
  process.env.DATA_RESIDENCY = 'local'
  process.env.AUDIT_LOGGING = 'true'
  
  // Performance monitoring setup
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
  } as Performance
})

afterEach(() => {
  // Restore original console methods
  console.log = originalConsoleLog
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  
  // Clean up test data
  if (global.gc) {
    global.gc()
  }
  
  // Clear all mocks
  vi.clearAllMocks()
  
  // Reset performance monitoring
  if (global.performance) {
    global.performance.mark = vi.fn()
    global.performance.measure = vi.fn()
  }
})

// Global test utilities for healthcare applications
global.testUtils = {
  /**
   * Wait for a specified time with healthcare test considerations
   */
  async wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms))
  },
  
  /**
   * Create mock patient data with LGPD compliance
   */
  createMockPatientData() {
    return {
      id: 'test-patient-id',
      name: 'Test Patient',
      email: 'test@example.com',
      phone: '+5511999999999',
      // LGPD-compliant masked data
      sensitiveData: '***REDACTED***',
      consentVersion: '1.0',
      dataProcessingConsent: true,
      marketingConsent: false,
    }
  },
  
  /**
   * Create mock healthcare appointment data
   */
  createMockAppointmentData() {
    return {
      id: 'test-appointment-id',
      patientId: 'test-patient-id',
      type: 'consultation',
      scheduledAt: new Date().toISOString(),
      status: 'scheduled',
      healthcareProviderId: 'test-provider-id',
      // Compliance metadata
      auditTrail: {
        createdAt: new Date().toISOString(),
        createdBy: 'test-system',
        modifiedAt: new Date().toISOString(),
        modifiedBy: 'test-system',
      },
    }
  },
  
  /**
   * Validate healthcare data compliance in tests
   */
  validateHealthcareCompliance(data: any): boolean {
    // Basic validation for healthcare data structure
    if (!data || typeof data !== 'object') return false
    
    // Check for required audit trail
    if (!data.auditTrail) return false
    
    // Check for consent data if applicable
    if (data.patientId && !data.consentVersion) return false
    
    return true
  },
}

// Type definitions for global test utilities
declare global {
  const testUtils: {
    wait(ms: number): Promise<void>
    createMockPatientData(): any
    createMockAppointmentData(): any
    validateHealthcareCompliance(data: any): boolean
  }
}

export {}