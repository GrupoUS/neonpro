import { vi } from "vitest";

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

// Create a fetch mock
const mockFetch = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    // For API routes, return mock response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
      headers: new Headers({
        "content-type": "application/json",
      }),
    } as Response);
  },
);

// Add mock methods that tests expect
mockFetch.mockClear = vi.fn();
mockFetch.mockResolvedValue = vi.fn();
mockFetch.mockRejectedValue = vi.fn();

// Mock fetch
Object.defineProperty(global, "fetch", {
  value: mockFetch,
});

// Mock localStorage
if (typeof window !== "undefined") {
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
}
