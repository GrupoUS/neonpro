/**
 * Global Test Setup Configuration
 * NeonPro Testing Suite
 */

import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });
config({ path: '.env.local' });
config({ path: '.env' });

// Global test timeout
jest.setTimeout(30_000);

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  // Suppress console.log in tests unless explicitly needed
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Global test utilities
global.testUtils = {
  // Mock Supabase client
  mockSupabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },

  // Mock Next.js router
  mockRouter: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  },

  // Test data factories
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  createMockPatient: (overrides = {}) => ({
    id: 'test-patient-id',
    name: 'Test Patient',
    email: 'patient@example.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    birth_date: '1990-01-01',
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  createMockAppointment: (overrides = {}) => ({
    id: 'test-appointment-id',
    patient_id: 'test-patient-id',
    procedure_id: 'test-procedure-id',
    scheduled_at: new Date(Date.now() + 86_400_000).toISOString(), // Tomorrow
    status: 'scheduled',
    notes: 'Test appointment',
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  // Performance testing utilities
  measurePerformance: async (fn: () => Promise<any>, _label = 'Operation') => {
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
    const xssPatterns = [/<script[^>]*>.*?<\/script>/gi, /javascript:/gi, /on\w+\s*=/gi];

    return xssPatterns.some((pattern) => pattern.test(input));
  },
};

// Global type declarations
declare global {
  namespace NodeJS {
    type Global = {
      testUtils: typeof global.testUtils;
    };
  }

  var testUtils: typeof global.testUtils;
}

// Setup and teardown hooks
beforeAll(async () => {});

afterAll(async () => {});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});
