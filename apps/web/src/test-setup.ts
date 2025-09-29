// Note: vitest imports removed to prevent context issues
// Test globals will be available through vitest global setup
import '@testing-library/jest-dom'
import { JSDOM } from 'jsdom'
import { vi } from 'vitest'

// Setup JSDOM environment before all tests - only if not already set by vitest
let dom: JSDOM | null = null
if (typeof global.document === 'undefined') {
  dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:8080',
  })

  // Set global DOM objects with proper type assertions
  global.document = dom.window.document as any
  global.window = dom.window as any

  // Also set on globalThis for React Testing Library
  globalThis.document = dom.window.document as any
  globalThis.window = dom.window as any

  // Use Object.defineProperty for read-only properties
  Object.defineProperty(global, 'navigator', {
    value: dom.window.navigator,
    writable: false,
    configurable: true,
  })
}

// Define DOM properties only if DOM is available
if (dom) {
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
}

// Mock global APIs that might be used in components
if (typeof window !== 'undefined') {
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
} else if (typeof global !== 'undefined') {
  // Fallback for Node.js environment
  Object.defineProperty(global, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })
}

// Mock ResizeObserver with complete interface
global.ResizeObserver = class ResizeObserver {
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = () => []
}

// Mock IntersectionObserver with complete interface
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null
  rootMargin: string = '0px'
  thresholds: ReadonlyArray<number> = []
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = () => []
}

// Mock Web APIs
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    value: () => {},
    writable: true,
  })
}

// Mock crypto.randomUUID if not available
if (typeof window !== 'undefined' && !window.crypto?.randomUUID) {
  Object.defineProperty(window.crypto, 'randomUUID', {
    value: () => {
      // Generate a more realistic UUID format for testing
      const hex = Math.random().toString(16).substr(2, 8)
      return `test-${hex}-${Date.now().toString(16)}`
    },
    writable: false,
    configurable: true,
  })
} else if (typeof global !== 'undefined' && !(global as any).crypto?.randomUUID) {
  // Fallback for Node.js environment
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => {
        const hex = Math.random().toString(16).substr(2, 8)
        return `test-${hex}-${Date.now().toString(16)}`
      }
    },
    writable: false,
    configurable: true,
  })
}

// Mock fetch API for consistent testing
global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  // Default mock response
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: async () => ({}),
    text: async () => '',
    blob: async () => new Blob(),
    arrayBuffer: async () => new ArrayBuffer(0),
    clone: () => global.fetch(input, init),
    bodyUsed: false,
    body: null,
    url,
    redirected: false,
    type: 'basic',
  })
}) as any

// Mock URL with simplified approach
if (typeof global !== 'undefined') {
  if (!global.URL) {
    // Use a more complete URL mock
    global.URL = class URL {
      static createObjectURL(obj: Blob | MediaSource): string {
        return 'mock-url'
      }
      static revokeObjectURL(url: string): void {
        // Mock implementation
      }
      static canParse(url: string | URL, base?: string | URL): boolean {
        try {
          new URL(url, base)
          return true
        } catch {
          return false
        }
      }
      static parse(url: string | URL, base?: string | URL): URL {
        return new URL(url, base)
      }
      // Instance properties
      hash = ''
      host = ''
      hostname = ''
      href = ''
      origin = ''
      password = ''
      pathname = ''
      port = ''
      protocol = ''
      search = ''
      searchParams = new URLSearchParams()
      username = ''
      constructor(url: string | URL, base?: string | URL) {
        // Mock constructor
      }
      toJSON(): string {
        return this.href
      }
      toString(): string {
        return this.href
      }
    }
  }
}

// Mock performance API with complete interface
if (typeof global !== 'undefined') {
  const performance = global.performance || {}
  global.performance = {
    ...performance,
    now: () => Date.now(),
    clearMarks: () => {},
    clearMeasures: () => {},
    mark: (markName: string, markOptions?: PerformanceMarkOptions) => {
      return { name: markName, entryType: 'mark', startTime: Date.now(), duration: 0 } as PerformanceMark
    },
    measure: (measureName: string, _startMark?: string, _endMark?: string) => {
      return { name: measureName, entryType: 'measure', startTime: Date.now(), duration: 0 } as PerformanceMeasure
    },
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    getEntries: () => [],
    setResourceTimingBufferSize: () => {},
    toJSON: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    timeOrigin: Date.now(),
    onresourcetimingbufferfull: null,
    clearResourceTimings: () => {},
    eventCounts: new Map(),
  } as Performance
}

// Mock WebSocket for AGUI protocol testing
global.WebSocket = class MockWebSocket {
  url: string
  protocol: string
  binaryType: BinaryType = 'blob'
  bufferedAmount: number = 0
  extensions: string = ''
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null
  onerror: ((this: WebSocket, ev: Event) => any) | null = null
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null
  onopen: ((this: WebSocket, ev: Event) => any) | null = null
  readyState: number = 1

  // WebSocket state constants
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3
  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSING = 2
  readonly CLOSED = 3

  constructor(url: string | URL, protocols?: string | string[]) {
    this.url = url.toString()
    this.protocol = typeof protocols === 'string' ? protocols : protocols?.[0] ?? ''
    // Simulate connection opening
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 0)
  }

  send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    // Mock send method
  }

  close = (code?: number, reason?: string) => {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }))
    }
  }

  // Required WebSocket methods for interface compliance
  addEventListener(type: string, listener: EventListener): void {
    // Mock addEventListener
  }

  removeEventListener(type: string, listener: EventListener): void {
    // Mock removeEventListener
  }

  dispatchEvent(event: Event): boolean {
    // Mock dispatchEvent
    return true
  }
}

// localStorage and sessionStorage are already set up by JSDOM above
// Setup test globals will be handled by vitest automatically
// MSW server setup will be handled by individual test files

// Custom test utilities

;(globalThis as any).testUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  createMockEvent: (type: string, data: any = {}) => ({
    type,
    data,
    preventDefault: () => {},
    stopPropagation: () => {},
    bubbles: true,
    cancelable: true,
  }),
  createMockResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(JSON.stringify(data)).buffer
    }
    // Fallback for environments without TextEncoder
    const str = JSON.stringify(data)
    const buffer = new ArrayBuffer(str.length * 2)
    const view = new Uint16Array(buffer)
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      view[i] = str.charCodeAt(i)
    }
    return buffer
  },
    headers: new Headers(),
    url: 'http://localhost:3000/api/test',
    redirected: false,
    type: 'basic',
  }),
  createMockWebSocket: (url: string) => {
    const ws = new (global as any).WebSocket(url)
    return ws
  },
  createMockLocalStorage: () => {
    const store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { Object.keys(store).forEach(key => delete store[key]) },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    }
  },
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
