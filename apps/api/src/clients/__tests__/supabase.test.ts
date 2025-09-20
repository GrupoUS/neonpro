/**
 * Supabase Client Implementation Tests - TDD RED Phase
 *
 * Comprehensive test suite for Supabase client functionality following
 * security-critical TDD methodology for healthcare applications.
 *
 * Coverage:
 * - Client initialization (admin, server, user)
 * - Authentication and authorization
 * - Connection pooling and resource management
 * - RLS policy enforcement for healthcare data
 * - LGPD compliance features
 * - Error handling and resilience
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// Mock environment variables for testing
const mockEnv = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-role-key',
};

// Mock Supabase modules before importing our client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn((url, key) => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
        listUsers: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
      insert: vi.fn(() => ({ data: [], error: null })),
      update: vi.fn(() => ({ data: [], error: null })),
      delete: vi.fn(() => ({ data: [], error: null })),
    })),
    supabaseUrl: url,
    supabaseKey: key,
  })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((url, key) => ({
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
    })),
    supabaseUrl: url,
    supabaseKey: key,
  })),
  createBrowserClient: vi.fn((url, key) => ({
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
    })),
    supabaseUrl: url,
    supabaseKey: key,
  })),
}));

describe('Supabase Client Implementation - TDD RED Phase', () => {
  let originalEnv: typeof process.env;

  beforeAll(() => {
    // Backup original environment
    originalEnv = { ...process.env };

    // Set test environment variables
    Object.assign(process.env, mockEnv);
  });

  afterEach(() => {
    // Restore original environment after each test
    Object.keys(process.env).forEach(key => {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    });
    Object.assign(process.env, originalEnv);
    // Re-set mock environment for subsequent tests
    Object.assign(process.env, mockEnv);
    vi.clearAllMocks();
  });

  describe('Admin Client (createAdminClient)', () => {
    it('should create admin client with service role authentication', async () => {
      const { createAdminClient } = await import('../supabase');

      const adminClient = createAdminClient();

      // Should return a proper Supabase client instance
      expect(adminClient).toBeDefined();
      expect(adminClient).not.toBeNull(); // This will FAIL initially
      expect(typeof adminClient.from).toBe('function');
      expect(typeof adminClient.auth.getUser).toBe('function');
    });

    it('should configure admin client with service role key', async () => {
      const { createAdminClient } = await import('../supabase');

      const adminClient = createAdminClient();

      // Should use service role key for admin operations
      expect(adminClient.supabaseKey).toBe(
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      );
      expect(adminClient.supabaseUrl).toBe(process.env.SUPABASE_URL);
    });

    it('should configure admin client with disabled session persistence', async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const { createAdminClient, resetClientInstances } = await import(
        '../supabase'
      );

      // Reset singleton to ensure fresh creation and mock tracking
      resetClientInstances();

      createAdminClient();

      // Should call createClient with proper server-side configuration
      expect(createClient).toHaveBeenCalledWith(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        expect.objectContaining({
          auth: expect.objectContaining({
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          }),
        }),
      );
    });

    it('should throw error when service role key is missing', async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const { createAdminClient } = await import('../supabase');

      expect(() => createAdminClient()).toThrow(
        'SUPABASE_SERVICE_ROLE_KEY is required for admin client',
      );
    });
  });

  describe('Server Client (createServerClient)', () => {
    const mockCookies = {
      getAll: vi.fn(() => [
        { name: 'sb-access-token', value: 'token123' },
        { name: 'sb-refresh-token', value: 'refresh123' },
      ]),
      setAll: vi.fn(),
    };

    it('should create server client with SSR cookie management', async () => {
      const { createServerClient } = await import('../supabase');

      const serverClient = createServerClient(mockCookies);

      // Should return a proper SSR Supabase client
      expect(serverClient).toBeDefined();
      expect(serverClient).not.toBeNull(); // This will FAIL initially
      expect(typeof serverClient.from).toBe('function');
      expect(typeof serverClient.auth.getSession).toBe('function');
    });

    it('should configure server client with cookie handlers', async () => {
      const { createServerClient } = await import('../supabase');
      const { createServerClient: mockCreateServerClient } = await import(
        '@supabase/ssr'
      );

      createServerClient(mockCookies);

      // Should call SSR createServerClient with cookie configuration
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        }),
      );
    });

    it('should throw error when cookie handlers are missing', async () => {
      const { createServerClient } = await import('../supabase');

      // Temporarily override NODE_ENV to test production behavior
      const originalNodeEnv = process.env.NODE_ENV;
      const originalVitest = process.env.VITEST;

      process.env.NODE_ENV = 'production';
      delete process.env.VITEST;

      try {
        expect(() => createServerClient(null as any)).toThrow(
          'Cookie handlers are required for server client',
        );
      } finally {
        // Restore original environment
        process.env.NODE_ENV = originalNodeEnv;
        if (originalVitest) {
          process.env.VITEST = originalVitest;
        }
      }
    });
  });

  describe('User Client (createUserClient)', () => {
    it('should create user client for browser operations', async () => {
      const { createUserClient } = await import('../supabase');

      const userClient = createUserClient();

      // Should return a proper browser Supabase client
      expect(userClient).toBeDefined();
      expect(userClient).not.toBeNull(); // This will FAIL initially
      expect(typeof userClient.from).toBe('function');
      expect(typeof userClient.auth.signInWithPassword).toBe('function');
    });

    it('should configure user client with anon key', async () => {
      const { createUserClient } = await import('../supabase');
      const { createBrowserClient } = await import('@supabase/ssr');

      createUserClient();

      // Should call createBrowserClient with anon key
      expect(createBrowserClient).toHaveBeenCalledWith(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
      );
    });

    it('should throw error when environment variables are missing', async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;

      const { createUserClient } = await import('../supabase');

      expect(() => createUserClient()).toThrow(
        'SUPABASE_URL and SUPABASE_ANON_KEY are required',
      );
    });
  });

  describe('Healthcare RLS (healthcareRLS)', () => {
    it('should provide clinic access validation', async () => {
      const { healthcareRLS } = await import('../supabase');

      const canAccess = await healthcareRLS.canAccessClinic(
        'user-123',
        'clinic-456',
      );

      // Should return boolean result based on actual RLS logic
      expect(typeof canAccess).toBe('boolean');
      expect(canAccess).not.toBe(true); // This will FAIL initially (returns true stub)
    });

    it('should provide patient access validation', async () => {
      const { healthcareRLS } = await import('../supabase');

      const canAccess = await healthcareRLS.canAccessPatient(
        'user-123',
        'patient-789',
      );

      // Should return boolean based on actual RLS logic
      expect(typeof canAccess).toBe('boolean');
      expect(canAccess).not.toBe(true); // This will FAIL initially (returns true stub)
    });
  });

  describe('RLS Query Builder', () => {
    it('should create RLS query builder with user context', async () => {
      const { RLSQueryBuilder } = await import('../supabase');

      const builder = new RLSQueryBuilder(
        'user-123',
        'healthcare_professional',
      );

      // Should store user context properly and provide query methods
      expect(builder.userId).toBe('user-123');
      expect(builder.role).toBe('healthcare_professional');
      expect(typeof builder.buildPatientQuery).toBe('function'); // This will FAIL initially
    });
  });

  describe('Connection Management', () => {
    it('should implement connection validation', async () => {
      const { createAdminClient } = await import('../supabase');

      const adminClient = createAdminClient();

      // Should provide connection validation methods
      expect(typeof adminClient.validateConnection).toBe('function'); // This will FAIL initially
    });
  });

  describe('LGPD Compliance Features', () => {
    it('should provide data export functionality', async () => {
      const { createAdminClient } = await import('../supabase');

      const adminClient = createAdminClient();

      // Should provide LGPD data export methods
      expect(typeof adminClient.exportUserData).toBe('function'); // This will FAIL initially
    });

    it('should provide secure data deletion', async () => {
      const { createAdminClient } = await import('../supabase');

      const adminClient = createAdminClient();

      // Should provide LGPD data deletion methods
      expect(typeof adminClient.deleteUserData).toBe('function'); // This will FAIL initially
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should validate environment configuration', async () => {
      delete process.env.SUPABASE_URL;

      const { createUserClient } = await import('../supabase');
      expect(() => createUserClient()).toThrow(
        'SUPABASE_URL and SUPABASE_ANON_KEY are required',
      );
    });

    it('should handle connection failures gracefully', async () => {
      const { createAdminClient } = await import('../supabase');

      const adminClient = createAdminClient();

      // Should provide error handling methods
      expect(typeof adminClient.handleConnectionError).toBe('function'); // This will FAIL initially
    });
  });

  describe('Type Safety and Integration', () => {
    it('should export properly typed client interfaces', async () => {
      const module = await import('../supabase');

      // Should export all required functions
      expect(typeof module.createAdminClient).toBe('function');
      expect(typeof module.createServerClient).toBe('function');
      expect(typeof module.createUserClient).toBe('function');
      expect(module.healthcareRLS).toBeDefined();
      expect(module.RLSQueryBuilder).toBeDefined();
    });
  });
});
