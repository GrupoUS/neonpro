/**
 * Jest Setup File - Global Test Configuration
 * NeonPro Healthcare System Test Setup
 */

import '@testing-library/jest-dom';

// Polyfill for Web APIs in Node.js environment
import { ReadableStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';

// Add Web APIs to global scope
if (!globalThis.Request) {
  const { Request, Response, Headers, fetch } = require('undici');
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.Headers = Headers;
  globalThis.fetch = fetch;
}

if (!globalThis.ReadableStream) {
  globalThis.ReadableStream = ReadableStream;
}

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder;
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
  withRouter: (Component: any) => Component,
}));

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock Next.js 15 server functions to prevent "outside request scope" errors
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ name: 'test', value: 'test-value' })),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(() => false),
    getAll: jest.fn(() => []),
    toString: jest.fn(() => ''),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(() => 'test-header-value'),
    has: jest.fn(() => false),
    forEach: jest.fn(),
    keys: jest.fn(() => []),
    values: jest.fn(() => []),
    entries: jest.fn(() => []),
  })),
}));

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => (fn: any) => {
  const Component = fn();
  Component.displayName = 'DynamicComponent';
  return Component;
});

// Mock server-side rendering context to prevent async local storage errors
const mockRequestContext = {
  cookies: new Map(),
  headers: new Map(),
  url: 'http://localhost:3000/test',
};

// Mock Next.js async local storage
jest.mock(
  'next/dist/server/app-render/work-unit-async-storage.external',
  () => ({
    workUnitAsyncStorage: {
      getStore: () => mockRequestContext,
      run: (_store: any, fn: any) => fn(),
    },
  })
);

// Mock Next.js request context APIs
Object.defineProperty(global, 'Request', {
  value: class MockRequest {
    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.method = init?.method || 'GET';
    }
    url: string;
    method: string;
    headers = new Map();
    json = jest.fn();
    text = jest.fn();
  },
});

Object.defineProperty(global, 'Response', {
  value: class MockResponse {
    constructor(_body?: BodyInit, init?: ResponseInit) {
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.ok = this.status >= 200 && this.status < 300;
    }
    status: number;
    statusText: string;
    ok: boolean;
    headers = new Map();
    json = jest.fn();
    text = jest.fn();
  },
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver for components that use it
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock fetch for API tests
global.fetch = jest.fn();

// Suppress console logs during tests (uncomment if needed)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Set default timeout for all tests
jest.setTimeout(30_000);

// Global test environment configuration
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
