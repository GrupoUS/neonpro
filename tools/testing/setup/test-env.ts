/**
 * Test Environment Configuration
 * Centralized environment setup for NeonPro Healthcare System tests
 */

// Set up comprehensive test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock all Next.js 15 edge runtime and server functions
const mockAsyncLocalStorage = {
  getStore: () => ({
    cookies: new Map(),
    headers: new Map(),
    url: 'http://localhost:3000/test',
    request: {
      url: 'http://localhost:3000/test',
      method: 'GET',
      headers: new Map(),
    },
  }),
  run: (_store: unknown, fn: () => unknown) => fn(),
};

// Mock Next.js server context to prevent "outside request scope" errors
jest.mock('next/dist/server/app-render/work-unit-async-storage.external', () => ({
  workUnitAsyncStorage: mockAsyncLocalStorage,
}));

jest.mock('next/dist/server/web/spec-extension/adapters/request-cookies', () => ({
  RequestCookies: jest.fn().mockImplementation(() => ({
    get: jest.fn(() => ({ name: 'test', value: 'test-value' })),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(() => false),
    getAll: jest.fn(() => []),
    toString: jest.fn(() => ''),
  })),
}));

// Mock the entire Next.js cache system
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn),
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

// Import the singleton mock from the dedicated setup file
import { mockSupabaseClient } from './supabase-mock';

export { mockSupabaseClient, mockAsyncLocalStorage };
