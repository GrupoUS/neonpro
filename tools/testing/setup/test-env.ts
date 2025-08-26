/**
 * Test Environment Configuration
 * Centralized environment setup for NeonPro Healthcare System tests
 */

import { vi } from "vitest";

// Set up comprehensive test environment variables
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

// Mock all Next.js 15 edge runtime and server functions
const mockAsyncLocalStorage = {
  getStore: () => ({
    cookies: new Map(),
    headers: new Map(),
    url: "http://localhost:3000/test",
    request: {
      url: "http://localhost:3000/test",
      method: "GET",
      headers: new Map(),
    },
  }),
  run: (_store: unknown, fn: () => unknown) => fn(),
};

// Mock Next.js server context to prevent "outside request scope" errors
vi.mock<
  typeof import("next/dist/server/app-render/work-unit-async-storage.external")
>("next/dist/server/app-render/work-unit-async-storage.external", () => ({
  workUnitAsyncStorage: mockAsyncLocalStorage,
}));

vi.mock<
  typeof import("next/dist/server/web/spec-extension/adapters/request-cookies")
>("next/dist/server/web/spec-extension/adapters/request-cookies", () => ({
  RequestCookies: vi.fn().mockImplementation(() => ({
    get: vi.fn(() => ({ name: "test", value: "test-value" })),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(() => false),
    getAll: vi.fn(() => []),
    toString: vi.fn(() => ""),
  })),
}));

// Mock the entire Next.js cache system
vi.mock<typeof import("next/cache")>("next/cache", () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

// Import the singleton mock from the dedicated setup file
import { mockSupabaseClient } from "./supabase-mock";

export { mockAsyncLocalStorage, mockSupabaseClient };
