/**
 * Vitest Global Setup Configuration
 * Configures global test environment, mocks, and utilities
 */

import { vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Global test configuration
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

// Mock IntersectionObserver
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock ResizeObserver
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock fetch globally
Object.defineProperty(global, "fetch", {
  writable: true,
  value: vi.fn(),
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      containedBy: vi.fn().mockReturnThis(),
      rangeGt: vi.fn().mockReturnThis(),
      rangeLt: vi.fn().mockReturnThis(),
      rangeGte: vi.fn().mockReturnThis(),
      rangeLte: vi.fn().mockReturnThis(),
      rangeAdjacent: vi.fn().mockReturnThis(),
      overlaps: vi.fn().mockReturnThis(),
      textSearch: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

// Global test hooks
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset localStorage
  window.localStorage.clear();
  window.sessionStorage.clear();

  // Reset fetch mock
  global.fetch = vi.fn();
});

afterEach(() => {
  // Cleanup React Testing Library
  cleanup();

  // Clear all timers
  vi.clearAllTimers();

  // Restore all mocks
  vi.restoreAllMocks();
});

// Test utilities
export const createMockResponse = (data: unknown, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () =>
      Promise.resolve(data).catch((error) => {
        throw new Error(`Failed to parse JSON: ${error}`);
      }),
    text: () =>
      Promise.resolve(JSON.stringify(data)).catch((error) => {
        throw new Error(`Failed to stringify data: ${error}`);
      }),
  });
};

export const createMockSupabaseResponse = (
  data: unknown,
  error: unknown = null,
) => {
  return Promise.resolve({ data, error });
};

// Patient management test utilities
export const mockPatientData = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "João Silva",
  cpf: "123.456.789-00",
  email: "joao@example.com",
  phone: "(11) 99999-9999",
  birthDate: "1990-01-01",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

export const mockAppointmentData = {
  id: "456e7890-e89b-12d3-a456-426614174001",
  patientId: "123e4567-e89b-12d3-a456-426614174000",
  date: "2024-02-01T10:00:00Z",
  type: "consultation",
  status: "scheduled",
  notes: "Regular checkup",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

// Console error suppression for known issues
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
});
