/**
 * Comprehensive Test Setup for Database Package
 * 
 * Provides proper test environment configuration, fixtures, and utilities
 * for all database-related tests including healthcare compliance testing.
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
beforeAll(() => {
  // Set NODE_ENV first to ensure test environment is detected
  process.env.NODE_ENV = 'test';
  
  // Load .env.test file for test environment
  const envPath = path.resolve(__dirname, '../.env.test');
  dotenv.config({ path: envPath });
  
  // Set default test environment variables if not provided
  setDefaultTestEnvVars();
  
  // Mock external services for testing
  mockExternalServices();
});

afterAll(() => {
  // Clean up any global mocks or connections
  cleanupTestEnvironment();
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Reset test environment state
  resetTestState();
});

afterEach(() => {
  // Clean up after each test
  cleanupTestConnections();
});

/**
 * Set default test environment variables
 */
function setDefaultTestEnvVars() {
  const defaults = {
    // Supabase configuration
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    SUPABASE_JWT_SECRET: 'test-jwt-secret',
    SUPABASE_PROJECT_ID: 'test-project',
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_ANON_KEY: 'test-anon-key',
    
    // Database configuration
    DATABASE_URL: 'postgresql://postgres:test@localhost:5432/neonpro_test',
    SUPABASE_DB_URL: 'postgresql://postgres:test@localhost:5432/neonpro_test',
    
    // JWT configuration
    JWT_SECRET: 'test-jwt-secret-for-testing-only',
    JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-for-testing-only',
    
    // API configuration
    API_URL: 'http://localhost:3000',
    PORT: '3000',
    
    // Healthcare compliance
    LGPD_ENABLED: 'true',
    ANVISA_COMPLIANCE: 'true',
    CFM_VALIDATION_ENABLED: 'true',
    
    // Logging configuration for tests
    LOG_LEVEL: 'error', // Only log errors in tests
    STRUCTURED_LOGGING: 'true',
    SANITIZE_LOGS: 'true',
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

/**
 * Mock external services for isolated testing
 */
function mockExternalServices() {
  // Mock console methods to capture logging output
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  
  // Mock external API calls
  vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(),
  }));

  vi.mock('@supabase/ssr', () => ({
    createBrowserClient: vi.fn(),
    createServerClient: vi.fn(),
  }));
  
  // Mock database connections
  vi.mock('../src/client', () => ({
    createClient: vi.fn(() => ({
      from: vi.fn(),
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      rpc: vi.fn(),
    })),
    createAdminClient: vi.fn(() => ({
      from: vi.fn(),
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      rpc: vi.fn(),
    })),
  }));
}

/**
 * Clean up test environment
 */
function cleanupTestEnvironment() {
  // Restore all mocks
  vi.restoreAllMocks();
}

/**
 * Reset test state before each test
 */
function resetTestState() {
  // Clear any stored state
  globalThis.__TEST_STATE__ = {};
}

/**
 * Clean up test connections after each test
 */
function cleanupTestConnections() {
  // Close any database connections
  // Clear caches
  // Reset connection pools
}

/**
 * Test fixtures for healthcare data testing
 */
export const healthcareFixtures = {
  /**
   * Mock patient data for testing (sanitized)
   */
  patientData: {
    id: 'test-patient-123',
    name: 'Test Patient',
    email: 'test.patient@example.com',
    phone: '+55 11 99999-9999',
    date_of_birth: '1990-01-01',
    address: {
      street: 'Test Street',
      number: '123',
      neighborhood: 'Test Neighborhood',
      city: 'Test City',
      state: 'TS',
      postal_code: '12345-678',
    },
  },

  /**
   * Mock medical record data for testing (sanitized)
   */
  medicalRecordData: {
    id: 'test-record-123',
    patient_id: 'test-patient-123',
    record_type: 'consultation',
    diagnosis: 'Test Diagnosis',
    treatment: 'Test Treatment',
    notes: 'Test medical notes',
  },

  /**
   * Mock appointment data for testing
   */
  appointmentData: {
    id: 'test-appointment-123',
    patient_id: 'test-patient-123',
    professional_id: 'test-professional-123',
    clinic_id: 'test-clinic-123',
    appointment_time: '2024-01-15T10:00:00Z',
    duration: 30,
    status: 'scheduled',
    type: 'consultation',
  },

  /**
   * Mock professional data for testing
   */
  professionalData: {
    id: 'test-professional-123',
    name: 'Dr. Test Professional',
    email: 'dr.test@example.com',
    specialty: 'Test Specialty',
    license_number: 'TEST-12345',
    clinic_id: 'test-clinic-123',
  },
};

/**
 * Test utilities for database operations
 */
export const testUtils = {
  /**
   * Create mock database response
   */
  createMockResponse: <T>(data: T | null, error: any = null) => ({
    data,
    error,
    count: data ? (Array.isArray(data) ? data.length : 1) : 0,
    status: error ? 'error' : 'success',
  }),

  /**
   * Create mock Supabase client
   */
  createMockClient: () => ({
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  }),

  /**
   * Generate test correlation ID
   */
  generateCorrelationId: () => `test-corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Sanitize sensitive data for testing
   */
  sanitizeData: (data: any) => {
    const sensitiveFields = ['cpf', 'rg', 'password', 'secret', 'token'];
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  },
};

/**
 * Logging test utilities
 */
export const loggingTestUtils = {
  /**
   * Capture console output for testing
   */
  captureConsoleOutput: () => {
    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => logs.push(JSON.stringify(args));
    console.error = (...args) => errors.push(JSON.stringify(args));
    console.warn = (...args) => warnings.push(JSON.stringify(args));
    console.info = (...args) => info.push(JSON.stringify(args));

    return {
      getOutput: () => ({ logs, errors, warnings, info }),
      restore: () => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        console.info = originalInfo;
      },
    };
  },

  /**
   * Check if output contains sensitive data patterns
   */
  containsSensitiveData: (output: string[], patterns: string[] = []) => {
    const sensitivePatterns = [
      ...patterns,
      '\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}', // CPF pattern
      '\\d{11}', // 11-digit numbers (potential CPF)
      'password',
      'secret',
      'token',
      'key',
      'localhost:\\d{4,5}', // Localhost with port
    ];

    return output.some(log => 
      sensitivePatterns.some(pattern => 
        new RegExp(pattern, 'i').test(log)
      )
    );
  },

  /**
   * Check if output uses structured logging
   */
  hasStructuredLogging: (output: string[]) => {
    return output.some(log => {
      try {
        const parsed = JSON.parse(log);
        return parsed.correlationId || 
               parsed.timestamp || 
               parsed.level ||
               parsed.structured;
      } catch {
        return false;
      }
    });
  },
};

/**
 * Healthcare compliance test utilities
 */
export const complianceTestUtils = {
  /**
   * Generate LGPD-compliant test data
   */
  generateLGPDCompliantData: () => ({
    userId: 'test-user-123',
    purpose: 'healthcare_analysis',
    legalBasis: 'legitimate_interest',
    retentionPeriod: 365,
    dataClassification: 'sensitive',
  }),

  /**
   * Check if data handling follows LGPD principles
   */
  validatesLGPDCompliance: (data: any, operation: string) => {
    const checks = {
      hasConsent: data.consent !== undefined,
      hasPurpose: data.purpose !== undefined,
      hasLegalBasis: data.legalBasis !== undefined,
      hasRetention: data.retentionPeriod !== undefined,
      isAnonymized: !data.cpf && !data.rg,
      hasAuditTrail: data.auditId !== undefined,
    };

    return {
      compliant: Object.values(checks).every(Boolean),
      checks,
      operation,
    };
  },
};

/**
 * Database test utilities
 */
export const databaseTestUtils = {
  /**
   * Create test database schema
   */
  createTestSchema: async () => {
    // Implementation would create test tables
    // This is a placeholder for actual schema creation
  },

  /**
   * Clean test database
   */
  cleanTestDatabase: async () => {
    // Implementation would clean test tables
    // This is a placeholder for actual cleanup
  },

  /**
   * Seed test data
   */
  seedTestData: async () => {
    // Implementation would seed test data
    // This is a placeholder for actual seeding
  },

  /**
   * Mock database errors
   */
  createDatabaseError: (message: string, code: string = 'DB_ERROR') => ({
    message,
    code,
    hint: 'Test error hint',
    details: 'Test error details',
  }),
};

/**
 * Export global test setup functions
 */
globalThis.__TEST_UTILS__ = {
  healthcareFixtures,
  testUtils,
  loggingTestUtils,
  complianceTestUtils,
  databaseTestUtils,
};