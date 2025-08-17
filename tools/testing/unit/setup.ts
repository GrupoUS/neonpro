import { afterAll, afterEach, beforeAll } from 'vitest';

// Global test setup
beforeAll(() => {});

afterAll(() => {});

afterEach(() => {
  // Cleanup after each test
  // Reset mocks, clear timers, etc.
});

// Mock console methods in test environment
if (typeof global !== 'undefined') {
  // Suppress console.log in tests unless needed
  global.console = {
    ...console,
    log: process.env.NODE_ENV === 'test' ? () => {} : console.log,
  };
}
