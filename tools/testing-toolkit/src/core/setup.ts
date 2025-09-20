/**
 * Test Setup Configuration
 *
 * Global test setup for the NeonPro testing toolkit.
 * Configures testing environment, mocks, and utilities.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { handlers } from '../fixtures/api-handlers';

// MSW server for API mocking
export const server = setupServer(...handlers);

// Global test setup
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  // Setup environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.SUPABASE_URL = 'http://localhost:54321';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';

  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Global test utilities
declare global {
  var testUtils: {
    mockConsole: typeof console;
    server: typeof server;
  };
}

globalThis.testUtils = {
  mockConsole: global.console,
  server,
};

// Custom matchers for healthcare compliance
expect.extend({
  toBeCompliantWithLGPD(received: any) {
    const pass = received
      && typeof received.consentGiven === 'boolean'
      && typeof received.dataProcessingPurpose === 'string'
      && Array.isArray(received.auditTrail);

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be LGPD compliant`
          : `Expected ${received} to be LGPD compliant (missing consent, purpose, or audit trail)`,
      pass,
    };
  },

  toHaveAuditTrail(received: any) {
    const pass = received
      && Array.isArray(received.auditTrail)
      && received.auditTrail.length > 0;

    return {
      message: () =>
        pass
          ? `Expected ${received} not to have audit trail`
          : `Expected ${received} to have audit trail`,
      pass,
    };
  },
});

// Type declarations for custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeCompliantWithLGPD(): T;
    toHaveAuditTrail(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeCompliantWithLGPD(): any;
    toHaveAuditTrail(): any;
  }
}
