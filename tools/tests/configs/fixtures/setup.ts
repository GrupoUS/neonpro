/**
 * Vitest Setup File
 * 
 * Global setup for all tests including environment configuration,
 * mock setup, and test utilities.
 */

import { vi } from 'vitest'
import { beforeEach, afterEach } from 'vitest'

// Global test configuration
global.beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
  
  // Set up test environment variables
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing'
  process.env.SESSION_SECRET = 'test-session-secret-for-testing'
  process.env.JWT_PRIVATE_KEY = 'test-private-key-for-testing'
  process.env.JWT_PUBLIC_KEY = 'test-public-key-for-testing'
  
  // Ensure test environment is set
  console.log('🧪 Test environment set:', process.env.NODE_ENV)
})

global.afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks()
})

// Global mock utilities
global.createMockContext = (overrides = {}) => {
  const req = {
    header: vi.fn(),
    method: 'GET',
    path: '/api/test',
    url: 'http://localhost:3000/api/test',
  }

  const res = {
    status: 200,
    headers: new Map(),
  }

  return {
    req,
    res,
    header: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    ...overrides,
  }
}

global.createMockNext = () => {
  return vi.fn().mockResolvedValue(undefined)
}

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Setup global fetch mock if needed
if (typeof global.fetch === 'undefined') {
  global.fetch = vi.fn()
}

// Export test utilities
export const testUtils = {
  createMockContext: global.createMockContext,
  createMockNext: global.createMockNext,
  
  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock response helper
  createMockResponse: (data = {}, status = 200) => ({
    json: vi.fn().mockResolvedValue(data),
    status,
    ok: status >= 200 && status < 300,
  }),
}