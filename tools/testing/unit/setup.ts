import { afterAll, afterEach, beforeAll } from 'vitest';

// Global test setup
beforeAll(() => {
  // Setup global test environment
  console.log('🧪 Vitest test environment initialized');
});

afterAll(() => {
  // Cleanup after all tests
  console.log('🧪 Vitest test environment cleaned up');
});

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
