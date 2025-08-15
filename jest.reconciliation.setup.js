/**
 * NEONPRO RECONCILIATION TEST SETUP
 * Healthcare-Grade Test Environment Configuration
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test-supabase-url.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock console methods to reduce noise in tests
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Warning') || args[0]?.includes?.('deprecated')) {
    return; // Suppress warnings
  }
  originalError.apply(console, args);
};

// Global test utilities
global.testUtils = {
  mockUser: {
    id: 'test-user-123',
    email: 'test@neonpro.clinic',
    role: 'admin',
  },
  mockClinic: {
    id: 'clinic-123',
    name: 'Test Clinic',
    cpf_cnpj: '12345678000199',
  },
  mockTransaction: {
    id: 'txn-123',
    amount: 1000.0,
    description: 'Test Transaction',
    date: new Date('2024-01-15'),
    type: 'credit',
  },
};

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: global.testUtils.mockUser },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: global.testUtils.mockUser } },
        error: null,
      }),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  })),
}));

// Mock Next.js modules commonly used
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Extend Jest matchers for healthcare testing
expect.extend({
  toBeHealthcareCompliant(received) {
    const isCompliant =
      received &&
      typeof received.lgpdCompliant === 'boolean' &&
      typeof received.auditTrail === 'object' &&
      typeof received.dataClassification === 'string';

    return {
      message: () => `expected ${received} to be healthcare compliant`,
      pass: isCompliant,
    };
  },

  toHaveValidAuditTrail(received) {
    const hasValidAudit =
      received?.auditTrail &&
      typeof received.auditTrail.userId === 'string' &&
      received.auditTrail.timestamp instanceof Date &&
      typeof received.auditTrail.action === 'string';

    return {
      message: () => `expected ${received} to have valid audit trail`,
      pass: hasValidAudit,
    };
  },
});

console.log('✅ NeonPro Reconciliation Test Environment Initialized');
console.log('📋 Healthcare-Grade Test Setup Complete');
