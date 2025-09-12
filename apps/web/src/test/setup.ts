import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import React from 'react'; // Expose React globally to fix "React is not defined" errors
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Set up fake-indexeddb BEFORE any imports that might use indexedDB
import 'fake-indexeddb/auto';

// Set up React globally
(globalThis as any).React = React;
(global as any).React = React;

// Use real timers to avoid interfering with RTL async utilities
beforeAll(() => {
  vi.useRealTimers();
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.useRealTimers();
});

// Mock environment variables
Object.assign(process.env, {
  NODE_ENV: 'test',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Supabase client broadly for tests
vi.mock('@supabase/supabase-js', () => {
  const channelMock = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockImplementation((cb?: (status: string) => void) => {
      if (cb) cb('SUBSCRIBED');
      return Promise.resolve(channelMock);
    }),
    unsubscribe: vi.fn().mockResolvedValue(true),
    send: vi.fn().mockResolvedValue({}),
    track: vi.fn().mockResolvedValue({}),
    presenceState: vi.fn().mockReturnValue({}),
    removeAllListeners: vi.fn(),
  };
  const queryBuilder = () => {
    // Create a chainable, thenable query builder to mimic Supabase Postgrest behavior
    const baseResponse = { data: [], error: null, count: 0 } as any;

    const qb: any = {
      // Chainable filters/operators
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),

      // Modifiers
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),

      // Data methods return this for chaining
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),

      // Thenable to allow `await qb` pattern
      then: (resolve: (v: any) => any) => resolve(baseResponse),
      catch: vi.fn().mockImplementation(() => Promise.resolve(baseResponse)),
      finally: vi.fn().mockImplementation((cb?: () => void) => {
        cb && cb();
        return Promise.resolve(baseResponse);
      }),
    };

    return qb;
  };
  const clientMock = {
    from: vi.fn().mockImplementation(() => queryBuilder()),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test' } } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test' } } },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test' } }, error: null }),
      onAuthStateChange: vi.fn().mockImplementation((cb?: (event: string, session: any) => void) => {
        // Simulate a signed-in session by default so dashboard/pages render
        if (cb) cb('SIGNED_IN', { user: { id: 'test' } });
        return {
          data: {
            subscription: { unsubscribe: vi.fn() },
          },
        };
      }),
    },
    channel: vi.fn().mockReturnValue(channelMock),
    removeChannel: vi.fn().mockResolvedValue(true),
    removeAllChannels: vi.fn().mockResolvedValue(true),
    getChannels: vi.fn().mockReturnValue([channelMock]),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
  };
  (globalThis as any).mockSupabaseClient = clientMock;
  return { createClient: vi.fn(() => clientMock) };
});

// Polyfill: jsdom doesn't implement HTMLFormElement.requestSubmit
if (!(HTMLFormElement.prototype as any).requestSubmit) {
  (HTMLFormElement.prototype as any).requestSubmit = function(submitter?: HTMLButtonElement) {
    if (submitter) {
      submitter.click();
      return;
    }
    const event = new Event('submit', { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
  };
}

// Mock only the AnimatedThemeToggler while preserving other exports
vi.mock('@neonpro/ui', async () => {
  const actual = await vi.importActual<any>('@neonpro/ui');
  return {
    ...actual,
    AnimatedThemeToggler: () => null,
  } as any;
});

// Silence analytics during tests
vi.mock('@/lib/analytics', async () => {
  const noop = () => undefined;
  return {
    analytics: {
      initialize: () => Promise.resolve(),
      cleanup: noop,
      trackPageView: noop,
      trackEvent: noop,
      trackInteraction: noop,
      setUserId: noop,
      exportUserData: vi.fn().mockResolvedValue({}),
      deleteUserData: vi.fn().mockResolvedValue(undefined),
    },
  } as any;
});
