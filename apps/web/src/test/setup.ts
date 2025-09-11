import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import React from 'react'; // Expose React globally to fix "React is not defined" errors
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Set up fake-indexeddb BEFORE any imports that might use indexedDB
import 'fake-indexeddb/auto';

// Set up React globally
(globalThis as any).React = React;
(global as any).React = React;

beforeAll(() => {
  vi.useFakeTimers();
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
    const qb = {
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockResolvedValue({ data: [], error: null }),
      upsert: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
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
