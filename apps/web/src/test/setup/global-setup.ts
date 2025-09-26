import { beforeAll, vi } from 'vitest'
import { setupDOMEnvironment } from './environment'

// Setup DOM environment for global tests
const { dom } = setupDOMEnvironment()

beforeAll(() => {
  // Setup global test configurations for healthcare compliance
  console.warn('🧪 Test environment setup complete - Healthcare compliance enabled')

  // Mock global APIs for consistent testing in healthcare context
  Object.defineProperty(global.window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock performance API for healthcare timing measurements
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  }

  // Mock crypto API for healthcare data encryption
  global.crypto = {
    ...global.crypto,
    getRandomValues: vi.fn(arr => arr),
    subtle: {
      digest: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
  }

  // Setup healthcare-specific global mocks
  global.HEALTHCARE_TEST_MODE = true
  global.LGPD_COMPLIANCE_ENABLED = true
  
  // Mock healthcare-specific APIs
  global.HealthcareDataEncoder = vi.fn((data) => JSON.stringify(data))
  global.HealthcareDataDecoder = vi.fn((encoded) => JSON.parse(encoded))
  
  // Mock healthcare audit trail
  global.AuditTrail = {
    log: vi.fn((event) => {
      console.warn(`🏥 Audit: ${event.type} - ${event.timestamp}`)
    }),
    getEvents: vi.fn(() => []),
    clear: vi.fn(),
  }

  // Mock vi if not available (fallback for edge cases)
  if (typeof vi === 'undefined') {
    global.vi = {
      fn: (impl?: Function) => {
        const mockFn = impl || (() => {})
        mockFn.mock = {
          calls: [],
          instances: [],
          invocationCallOrder: [],
          results: [],
          reset: () => {
            mockFn.mock.calls = []
            mockFn.mock.instances = []
            mockFn.mock.invocationCallOrder = []
            mockFn.mock.results = []
          },
          mockClear: () => {
            mockFn.mock.calls = []
            mockFn.mock.instances = []
          },
          mockImplementation: (newImpl: Function) => {
            return Object.assign(mockFn, newImpl)
          },
          mockReturnValue: (value: any) => {
            return Object.assign(mockFn, () => value)
          },
          mockResolvedValue: (value: any) => {
            return Object.assign(mockFn, async () => value)
          },
          mockRejectedValue: (value: any) => {
            return Object.assign(mockFn, async () => {
              throw value
            })
          },
        }
        return mockFn
      },
      clearAllMocks: () => {},
      resetAllMocks: () => {},
      restoreAllMocks: () => {},
      spyOn: () => vi.fn(),
    }
  }

  // Setup global test timeout for healthcare operations in vitest config instead
  // vi.setConfig is not allowed in global setup

  console.warn('🧪 Global setup complete - Healthcare test environment ready')
})

// Export for use in other setup files
export { dom }