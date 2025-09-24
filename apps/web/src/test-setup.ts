// Note: vitest imports removed to prevent context issues
// Test globals will be available through vitest global setup
import '@testing-library/jest-dom'
import { JSDOM } from 'jsdom'

// Setup JSDOM environment before all tests - only if not already set by vitest
if (typeof global.document === 'undefined') {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:8080',
  })

  // Set global DOM objects (with proper handling of read-only properties)
  global.document = dom.window.document
  global.window = dom.window

  // Also set on globalThis for React Testing Library
  globalThis.document = dom.window.document
  globalThis.window = dom.window

  // Use Object.defineProperty for read-only properties
  Object.defineProperty(global, 'navigator', {
    value: dom.window.navigator,
    writable: false,
    configurable: true,
  })
}

// Define DOM properties only if DOM is available
if (typeof dom !== 'undefined') {
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

  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    writable: false,
    configurable: true,
  })

  Object.defineProperty(globalThis, 'localStorage', {
    value: dom.window.localStorage,
    writable: false,
    configurable: true,
  })

  Object.defineProperty(globalThis, 'sessionStorage', {
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

  Object.defineProperty(globalThis, 'location', {
    value: dom.window.location,
    writable: false,
    configurable: true,
  })

  Object.defineProperty(globalThis, 'history', {
    value: dom.window.history,
    writable: false,
    configurable: true,
  })

  Object.defineProperty(globalThis, 'URL', {
    value: dom.window.URL,
    writable: false,
    configurable: true,
  })
}

// Mock global APIs that might be used in components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
}

// Mock Web APIs
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
})

// Mock crypto.randomUUID if not available
if (!window.crypto?.randomUUID) {
  Object.defineProperty(window.crypto, 'randomUUID', {
    value: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  })
}

// Mock fetch API for consistent testing
global.fetch = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })

// Mock URL.createObjectURL
global.URL.createObjectURL = () => 'mock-url'
global.URL.revokeObjectURL = () => {}

// Mock performance API
global.performance = {
  ...global.performance,
  now: () => Date.now(),
}

// Mock WebSocket for AGUI protocol testing
global.WebSocket = class WebSocket {
  send = () => {}
  close = () => {}
  addEventListener = () => {}
  removeEventListener = () => {}
  readyState = 1
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
}

// Mock localStorage and sessionStorage with proper JSDOM implementation
if (typeof dom !== 'undefined') {
  const localStorageMock = dom.window.localStorage
  const sessionStorageMock = dom.window.sessionStorage
  global.localStorage = localStorageMock
  global.sessionStorage = sessionStorageMock
} // Setup test globals will be handled by vitest automatically
// MSW server setup will be handled by individual test files

// Custom test utilities

;(globalThis as any).testUtils = {
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  createMockEvent: (type: string, data: any) => ({ type, data, preventDefault: () => {} }),
  createMockResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),
}

// Mock console methods in tests to reduce noise
const originalConsole = { ...console }
beforeAll(() => {
  console.log = (...args) => {
    if (process.env.DEBUG === 'true') {
      originalConsole.log(...args)
    }
  }
  console.warn = (...args) => {
    if (process.env.DEBUG === 'true') {
      originalConsole.warn(...args)
    }
  }
  console.error = (...args) => {
    if (process.env.DEBUG === 'true') {
      originalConsole.error(...args)
    }
  }
})

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole)
})
