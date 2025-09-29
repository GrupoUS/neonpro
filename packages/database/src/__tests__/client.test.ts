import { describe, it, expect, vi } from 'vitest';
import { createSupabaseClient, createSupabaseAdminClient, resetSupabaseClient } from '../lib/simple-client.js';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis()
  }))
}));

describe('Database Client', () => {
  const mockConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-anon-key'
  };

  describe('createSupabaseClient', () => {
    it('should create a Supabase client with correct configuration', () => {
      const client = createSupabaseClient(mockConfig);
      expect(client).toBeDefined();
      expect(typeof client.from).toBe('function');
    });

    it('should include healthcare application headers', () => {
      const { createClient } = require('@supabase/supabase-js');
      
      createSupabaseClient(mockConfig);
      
      expect(createClient).toHaveBeenCalledWith(
        mockConfig.supabaseUrl,
        mockConfig.supabaseKey,
        expect.objectContaining({
          global: expect.objectContaining({
            headers: expect.objectContaining({
              'x-application-name': 'neonpro-healthcare'
            })
          })
        })
      );
    });
  });

  describe('createSupabaseAdminClient', () => {
    it('should create admin client with service role configuration', () => {
      const serviceConfig = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-service-role-key'
      };

      const client = createSupabaseAdminClient(serviceConfig);
      expect(client).toBeDefined();
    });
  });

  describe('resetSupabaseClient', () => {
    it('should reset global client instance', () => {
      // This test ensures the reset function exists and can be called
      expect(() => resetSupabaseClient()).not.toThrow();
    });
  });
});