/**
 * Global Test Setup Configuration
 * NeonPro Testing Suite
 */

import { config } from "dotenv";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

// Load environment variables for testing
config({ path: ".env.test" });
config({ path: ".env.local" });
config({ path: ".env" });

// Global test timeout is handled by vitest.config.ts

// Mock console methods in test environment
if (process.env.NODE_ENV === "test") {
  // Suppress console.log in tests unless explicitly needed
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

// Global test utilities
global.testUtils = {
  // Mock Supabase client
  mockSupabaseClient: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },

  // Mock Next.js router
  mockRouter: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  },

  // Test data factories
  createMockUser: (overrides = {}) => ({
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  createMockPatient: (overrides = {}) => ({
    id: "test-patient-id",
    name: "Test Patient",
    email: "patient@example.com",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00",
    birth_date: "1990-01-01",
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  createMockAppointment: (overrides = {}) => ({
    id: "test-appointment-id",
    patient_id: "test-patient-id",
    procedure_id: "test-procedure-id",
    scheduled_at: new Date(Date.now() + 86_400_000).toISOString(), // Tomorrow
    status: "scheduled",
    notes: "Test appointment",
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  // Performance testing utilities
  measurePerformance: async (
    fn: () => Promise<unknown>,
    _label = "Operation",
  ) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;

    return { result, duration };
  },

  // Accessibility testing utilities
  checkAccessibility: async (_element: HTMLElement) => {
    // Mock axe-core for accessibility testing
    return {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
    };
  },

  // Security testing utilities
  testSQLInjection: (input: string) => {
    const sqlPatterns = [
      /('|(--)|(;)|(\|)|(\*)|(%))/i,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  },

  testXSS: (input: string) => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  },
};

// Global type declarations
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: typeof global.testUtils;
    }
  }

  const testUtils: typeof global.testUtils;
}

// Setup and teardown hooks
beforeAll(async () => {});

afterAll(async () => {});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});
