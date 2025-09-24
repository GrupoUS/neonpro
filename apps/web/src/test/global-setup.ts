import { JSDOM } from 'jsdom'
import { setupServer } from 'msw/node'
import { beforeAll, vi } from 'vitest'
import { handlers } from './mocks/handlers'

// Setup JSDOM environment for global setup
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8080',
})

// Set global DOM objects before any tests run (with proper handling of read-only properties)
global.document = dom.window.document
global.window = dom.window

// Use Object.defineProperty for read-only properties
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'localStorage', {
  value: dom.window.localStorage,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'sessionStorage', {
  value: dom.window.sessionStorage,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'location', {
  value: dom.window.location,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'history', {
  value: dom.window.history,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'URL', {
  value: dom.window.URL,
  writable: false,
  configurable: true,
})

// Setup MSW server for API mocking
export const server = setupServer(...handlers)

beforeAll(() => {
  // Enable API mocking before all tests
  server.listen({ onUnhandledRequest: 'error' })

  // Setup global test configurations
  console.warn('🧪 Test environment setup complete')

  // Mock global APIs for consistent testing
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

  // Mock performance API
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now()),
  }
})

// Mock vi if not available
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
