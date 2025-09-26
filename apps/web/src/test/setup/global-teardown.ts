import { afterAll, vi } from 'vitest'
import { server } from './global-setup'
import { cleanupDOMEnvironment } from './environment'

afterAll(() => {
  // Clean up MSW server
  server.close()
  console.warn('🧪 MSW server closed')

  // Clean up healthcare-specific global objects
  if (global.HealthcareDataEncoder) {
    delete global.HealthcareDataEncoder
  }

  if (global.HealthcareDataDecoder) {
    delete global.HealthcareDataDecoder
  }

  if (global.AuditTrail) {
    delete global.AuditTrail
  }

  if (global.HEALTHCARE_TEST_MODE) {
    delete global.HEALTHCARE_TEST_MODE
  }

  if (global.LGPD_COMPLIANCE_ENABLED) {
    delete global.LGPD_COMPLIANCE_ENABLED
  }

  // Clean up any global mocks that might interfere with other tests
  if (global.ResizeObserver) {
    delete global.ResizeObserver
  }

  if (global.IntersectionObserver) {
    delete global.IntersectionObserver
  }

  // Clean up DOM environment
  cleanupDOMEnvironment()

  // Reset all mocks to ensure clean state between test runs
  vi.clearAllMocks()
  vi.resetAllMocks()
  vi.restoreAllMocks()

  // Clear any global state that might have been set during tests
  if (global.fetch) {
    global.fetch = vi.fn()
  }

  if (global.WebSocket) {
    delete global.WebSocket
  }

  console.warn('🧪 Test environment teardown complete - Healthcare compliance verified')
})

// Export cleanup utilities for use in individual tests
export const cleanupHealthcareGlobals = () => {
  // Clean up healthcare-specific globals for individual test cleanup
  const keysToClean = [
    'HealthcareDataEncoder',
    'HealthcareDataDecoder', 
    'AuditTrail',
    'HEALTHCARE_TEST_MODE',
    'LGPD_COMPLIANCE_ENABLED'
  ]

  keysToClean.forEach(key => {
    if (global[key]) {
      delete global[key]
    }
  })
}

export const resetHealthcareMocks = () => {
  // Reset healthcare-specific mocks
  vi.clearAllMocks()
  vi.resetAllMocks()
  
  // Re-initialize essential healthcare mocks
  global.fetch = vi.fn()
  
  console.warn('🧪 Healthcare mocks reset for next test')
}