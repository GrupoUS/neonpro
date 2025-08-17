import { vi } from 'vitest';

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
    getRandomValues: (arr: any) => arr,
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
