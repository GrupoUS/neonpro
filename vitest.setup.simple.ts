import { vi } from "vitest";
import "@testing-library/jest-dom";

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
  NODE_ENV: "test",
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_ANON_KEY: "test-key",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  JWT_SECRET: "test-secret",
};

// Mock crypto
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "test-uuid",
    getRandomValues: (arr: Uint8Array) => arr,
  },
});

// Mock fetch for simple tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  } as Response)
);

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
});
