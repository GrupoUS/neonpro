import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../packages/types/src/database.types';

interface SupabaseTestConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

describe('Supabase Connectivity Tests', () => {
  let supabase: ReturnType<typeof createClient<Database>>;
  let adminSupabase: ReturnType<typeof createClient<Database>>;

  beforeAll(async () => {
    const config: SupabaseTestConfig = {
      url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    };

    if (!config.url || !config.anonKey) {
      throw new Error('Missing Supabase configuration for tests');
    }

    supabase = createClient<Database>(config.url, config.anonKey);
    
    if (config.serviceRoleKey) {
      adminSupabase = createClient<Database>(config.url, config.serviceRoleKey);
    }
  });

  describe('Basic Connection', () => {
    it('should establish connection to Supabase', async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('count', { count: 'exact', head: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should connect with service role key', async () => {
      if (!adminSupabase) {
        console.warn('Skipping service role test - no service role key configured');
        return;
      }

      const { data, error } = await adminSupabase
        .from('clinics')
        .select('count', { count: 'exact', head: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have valid database schema', async () => {
      // Test critical tables exist
      const tables = ['clinics', 'patients', 'appointments', 'professionals'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table as any)
          .select('*', { count: 'exact', head: true });
        
        expect(error).toBeNull();
      }
    });
  });

  describe('Database Operations', () => {
    it('should handle SELECT operations', async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, created_at')
        .limit(1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle INSERT operations', async () => {
      if (!adminSupabase) {
        console.warn('Skipping INSERT test - requires service role access');
        return;
      }

      const testClinic = {
        name: `Test Clinic ${Date.now()}`,
        contact_email: 'test@example.com',
        contact_phone: '+55 11 99999-9999',
        address: 'Test Address',
        created_at: new Date().toISOString()
      };

      const { data, error } = await adminSupabase
        .from('clinics')
        .insert(testClinic)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.name).toBe(testClinic.name);

      // Cleanup
      if (data?.id) {
        await adminSupabase
          .from('clinics')
          .delete()
          .eq('id', data.id);
      }
    });
  });

  describe('Connection Performance', () => {
    it('should complete queries within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name')
        .limit(10);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid table queries gracefully', async () => {
      const { data, error } = await supabase
        .from('nonexistent_table' as any)
        .select('*');

      expect(error).toBeDefined();
      expect(data).toBeNull();
      expect(error?.message).toContain('relation');
    });
  });
});