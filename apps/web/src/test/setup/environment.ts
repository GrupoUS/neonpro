import { JSDOM } from 'jsdom'

/**
 * Consolidated DOM Environment Setup for Tests
 * Merged from dom-environment.ts and environment.ts
 * Following tools/tests patterns for consistency
 */

console.warn('🔧 DOM environment setup starting...')

// Initialize JSDOM environment with healthcare-specific configuration
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8080',
  pretendToBeVisual: true,
  resources: 'usable',
  runScripts: 'dangerously',
})

console.warn('🔧 JSDOM created successfully')

// Comprehensive DOM object assignment for both global and globalThis
const domObjects = {
  document: dom.window.document,
  window: dom.window,
  navigator: dom.window.navigator,
  location: dom.window.location,
  history: dom.window.history,
  URL: dom.window.URL,
  URLSearchParams: dom.window.URLSearchParams,
  Blob: dom.window.Blob,
  File: dom.window.File,
  FileReader: dom.window.FileReader,
  FormData: dom.window.FormData,
  XMLHttpRequest: dom.window.XMLHttpRequest,
  Event: dom.window.Event,
  CustomEvent: dom.window.CustomEvent,
  Storage: dom.window.Storage,
  localStorage: dom.window.localStorage,
  sessionStorage: dom.window.sessionStorage,
  Image: dom.window.Image,
  HTMLCanvasElement: dom.window.HTMLCanvasElement,
  CanvasRenderingContext2D: dom.window.CanvasRenderingContext2D,
  Request: dom.window.Request,
  Response: dom.window.Response,
  Headers: dom.window.Headers,
  FetchEvent: dom.window.FetchEvent,
  ServiceWorkerGlobalScope: dom.window.ServiceWorkerGlobalScope,
  WorkerGlobalScope: dom.window.WorkerGlobalScope,
}

// Assign to global scope with proper handling of read-only properties
if (typeof global !== 'undefined') {
  console.warn('🔧 Setting up global scope...')
  
  // Use Object.defineProperty for read-only properties
  Object.defineProperty(global, 'navigator', {
    value: domObjects.navigator,
    writable: false,
    configurable: true,
  })
  
  Object.defineProperty(global, 'location', {
    value: domObjects.location,
    writable: false,
    configurable: true,
  })
  
  Object.defineProperty(global, 'localStorage', {
    value: domObjects.localStorage,
    writable: false,
    configurable: true,
  })
  
  Object.defineProperty(global, 'sessionStorage', {
    value: domObjects.sessionStorage,
    writable: false,
    configurable: true,
  })
  
  // Direct assignment for writable properties
  global.document = domObjects.document
  global.window = domObjects.window
  global.history = domObjects.history
  global.URL = domObjects.URL
  global.URLSearchParams = domObjects.URLSearchParams
  global.Blob = domObjects.Blob
  global.File = domObjects.File
  global.FileReader = domObjects.FileReader
  global.FormData = domObjects.FormData
  global.XMLHttpRequest = domObjects.XMLHttpRequest
  global.Event = domObjects.Event
  global.CustomEvent = domObjects.CustomEvent
  global.Storage = domObjects.Storage
  global.Image = domObjects.Image
  global.HTMLCanvasElement = domObjects.HTMLCanvasElement
  global.CanvasRenderingContext2D = domObjects.CanvasRenderingContext2D
  global.Request = domObjects.Request
  global.Response = domObjects.Response
  global.Headers = domObjects.Headers
  global.FetchEvent = domObjects.FetchEvent
  global.ServiceWorkerGlobalScope = domObjects.ServiceWorkerGlobalScope
  global.WorkerGlobalScope = domObjects.WorkerGlobalScope
  
  console.warn('🔧 Global scope setup complete')
}

// Assign to globalThis scope
if (typeof globalThis !== 'undefined') {
  console.warn('🔧 Setting up globalThis scope...')
  
  // Use Object.defineProperty for read-only properties
  Object.defineProperty(globalThis, 'navigator', {
    value: domObjects.navigator,
    writable: false,
    configurable: true,
  })
  
  Object.defineProperty(globalThis, 'location', {
    value: domObjects.location,
    writable: false,
    configurable: true,
  })
  
  Object.defineProperty(globalThis, 'localStorage', {
    value: domObjects.localStorage,
    writable: false,
    configurable: true,
  })
  
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: domObjects.sessionStorage,
    writable: false,
    configurable: true,
  })
  
  // Direct assignment for writable properties
  globalThis.document = domObjects.document
  globalThis.window = domObjects.window
  globalThis.history = domObjects.history
  globalThis.URL = domObjects.URL
  globalThis.URLSearchParams = domObjects.URLSearchParams
  globalThis.Blob = domObjects.Blob
  globalThis.File = domObjects.File
  globalThis.FileReader = domObjects.FileReader
  globalThis.FormData = domObjects.FormData
  globalThis.XMLHttpRequest = domObjects.XMLHttpRequest
  globalThis.Event = domObjects.Event
  globalThis.CustomEvent = domObjects.CustomEvent
  globalThis.Storage = domObjects.Storage
  globalThis.Image = domObjects.Image
  globalThis.HTMLCanvasElement = domObjects.HTMLCanvasElement
  globalThis.CanvasRenderingContext2D = domObjects.CanvasRenderingContext2D
  globalThis.Request = domObjects.Request
  globalThis.Response = domObjects.Response
  globalThis.Headers = domObjects.Headers
  globalThis.FetchEvent = domObjects.FetchEvent
  globalThis.ServiceWorkerGlobalScope = domObjects.ServiceWorkerGlobalScope
  globalThis.WorkerGlobalScope = domObjects.WorkerGlobalScope
  
  console.warn('🔧 globalThis scope setup complete')
}

// Mock missing APIs that are commonly used in healthcare applications
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

if (!global.WebSocket) {
  global.WebSocket = require('ws')
}

// Mock performance API for healthcare timing measurements
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  }
}

// Mock crypto API for healthcare data encryption
if (!global.crypto) {
  global.crypto = {
    getRandomValues: vi.fn(arr => arr),
    subtle: {
      digest: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
  }
}

console.warn('🔧 DOM environment setup complete')

// Export for testing utilities
export { dom }
export { domObjects as windowObjects }

// Export setup function for reuse
export const setupDOMEnvironment = () => {
  console.warn('🔧 DOM environment setup complete')
  return { dom, domObjects }
}

// Export cleanup function
export const cleanupDOMEnvironment = () => {
  console.warn('🔧 DOM environment cleanup complete')
}