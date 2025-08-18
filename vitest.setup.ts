import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Make React available globally in tests
Object.defineProperty(globalThis, 'React', {
  value: React,
  writable: false,
});

// Mock console for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_ENVIRONMENT: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
};

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
    getRandomValues: (arr: Uint8Array) => arr,
  },
});

// Mock fetch for API testing
Object.defineProperty(global, 'fetch', {
  value: vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  ),
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Basic vitest globals setup
Object.defineProperty(globalThis, 'vi', { value: vi });
Object.defineProperty(globalThis, 'expect', {
  value: (await import('vitest')).expect,
});
Object.defineProperty(globalThis, 'describe', {
  value: (await import('vitest')).describe,
});
Object.defineProperty(globalThis, 'it', {
  value: (await import('vitest')).it,
});
Object.defineProperty(globalThis, 'test', {
  value: (await import('vitest')).test,
});
Object.defineProperty(globalThis, 'beforeAll', {
  value: (await import('vitest')).beforeAll,
});
Object.defineProperty(globalThis, 'beforeEach', {
  value: (await import('vitest')).beforeEach,
});
Object.defineProperty(globalThis, 'afterAll', {
  value: (await import('vitest')).afterAll,
});
Object.defineProperty(globalThis, 'afterEach', {
  value: (await import('vitest')).afterEach,
});
