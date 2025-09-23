import { vi, describe, it, test, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { server } from "./test/mocks/handlers";

// Mock global APIs that might be used in components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
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

// Mock Web APIs
Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

// Mock crypto.randomUUID if not available
if (!window.crypto?.randomUUID) {
  Object.defineProperty(window.crypto, "randomUUID", {
    value: () => "test-uuid-" + Math.random().toString(36).substr(2, 9),
  });
}

// Mock fetch API for consistent testing
global.fetch = vi.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

// Mock performance API
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
};

// Mock WebSocket for AGUI protocol testing
global.WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Setup test globals
(globalThis as any).describe = describe;
(globalThis as any).it = it;
(globalThis as any).test = test;
(globalThis as any).expect = expect;
(globalThis as any).vi = vi;
(globalThis as any).beforeAll = beforeAll;
(globalThis as any).afterAll = afterAll;
(globalThis as any).beforeEach = beforeEach;
(globalThis as any).afterEach = afterEach;

// Setup MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Reset MSW handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up MSW server after all tests
afterAll(() => {
  server.close();
});

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Custom test utilities
(globalThis as any).testUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  createMockEvent: (type: string, data: any) => ({ type, data, preventDefault: vi.fn() }),
  createMockResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),
};

// Mock console methods in tests to reduce noise
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn((...args) => {
    if (process.env.DEBUG === "true") {
      originalConsole.log(...args);
    }
  });
  console.warn = vi.fn((...args) => {
    if (process.env.DEBUG === "true") {
      originalConsole.warn(...args);
    }
  });
  console.error = vi.fn((...args) => {
    if (process.env.DEBUG === "true") {
      originalConsole.error(...args);
    }
  });
});

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});