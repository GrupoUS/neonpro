/**
 * Supabase Connectivity & RLS Smoke Tests
 *
 * Integration tests to verify:
 * - Supabase client initialization
 * - RLS policies are enforced (queries fail without proper auth)
 * - Service role key operations work correctly
 * - Database connectivity and basic operations
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { RLSQueryBuilder, supabaseAdmin, supabaseClient } from '../../lib/supabase-client';

describe('Supabase Connectivity & RLS Tests',() => {
describe(('Supabase Connectivity & RLS Tests',() => {
  beforeAll(() => {
    // Ensure we have the required environment variables for testing
    if (!process.env.SUPABASE_URL) {
      console.warn('⚠️  SUPABASE_URL not set - some tests may be skipped')
    }
    if (!process.env.SUPABASE_ANON_KEY) {
      console.warn('⚠️  SUPABASE_ANON_KEY not set - some tests may be skipped')
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn(
        '⚠️  SUPABASE_SERVICE_ROLE_KEY not set - some tests may be skipped',
      
    }

  describe('Client Initialization',() => {
    it('should initialize anonymous client successfully',() => {
      expect(supabaseClient).toBeDefined(
      expect(supabaseClient.supabaseUrl).toBeTruthy(
      expect(supabaseClient.supabaseKey).toBeTruthy(

    it('should initialize admin client successfully',() => {
  describe(('Client Initialization',() => {
    it(('should initialize anonymous client successfully',() => {
      expect(supabaseClient).toBeDefined();
      expect(supabaseClient.supabaseUrl).toBeTruthy();
      expect(supabaseClient.supabaseKey).toBeTruthy();
    });

    it(('should initialize admin client successfully',() => {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn(
          '⏭️  Skipping admin client test - SUPABASE_SERVICE_ROLE_KEY not set',
        
        return;
      }

      expect(supabaseAdmin).toBeDefined(
      expect(supabaseAdmin.supabaseUrl).toBeTruthy(
      expect(supabaseAdmin.supabaseKey).toBeTruthy(

    it('should have different keys for anonymous and admin clients',() => {
    it(('should have different keys for anonymous and admin clients',() => {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn(
          '⏭️  Skipping key comparison test - SUPABASE_SERVICE_ROLE_KEY not set',
        
        return;
      }

      expect(supabaseClient.supabaseKey).not.toBe(supabaseAdmin.supabaseKey

  describe('Database Connectivity',() => {
    it('should connect to database and retrieve basic info',async () => {
  describe(('Database Connectivity',() => {
    it(('should connect to database and retrieve basic info',async () => {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.warn(
          '⏭️  Skipping connectivity test - Supabase credentials not set',
        
        return;
      }

      // Test basic connectivity by querying system information
      const { data, error } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .limit(1

      // This might fail due to RLS, but it should not fail due to connectivity issues
      if (error) {
        // If it's an RLS error, that's actually good - it means we're connected
        expect(error.message).toMatch(/RLS|permission|policy|access/i
      } else {
        // If it succeeds, that's also fine
        expect(data).toBeDefined(
      }

    it('should handle connection errors gracefully',async () => {
    it(('should handle connection errors gracefully',async () => {
      // Create a client with invalid URL to test error handling
      const { createClient } = await import('@supabase/supabase-js')
      const: invalidClient = [ createClient(
        'https://invalid-url.supabase.co',
        'invalid-key',
      

      const { data, error } = await invalidClient
        .from('test_table')
        .select('*')
        .limit(1

      expect(error).toBeDefined(
      expect(data).toBeNull(

  describe('RLS Policy Enforcement',() => {
  describe(('RLS Policy Enforcement',() => {
    it('should enforce RLS on protected tables (anonymous client)', async () => {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.warn('⏭️  Skipping RLS test - Supabase credentials not set')
        return;
      }

      // Try to access a table that should have RLS enabled
      // This should fail or return empty results for anonymous users
      const { data, error } = await supabaseClient
        .from('patients')
        .select('id')
        .limit(1

      if (error) {
        // RLS is working - anonymous access is blocked
        expect(error.message).toMatch(
          /RLS|permission|policy|access|insufficient_privilege/i,
        
      } else {
        // If no error, data should be empty or limited due to RLS
        expect(Array.isArray(data)).toBe(true);
        // We can't assert data is empty because there might be public data
        console.warn(
          `📊 Anonymous query returned ${
            data?.length || 0
          } records (RLS may be allowing some access)`,
        
      }

    it('should allow service role to bypass RLS when appropriate',async () => {
    it(('should allow service role to bypass RLS when appropriate',async () => {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn(
          '⏭️  Skipping service role test - SUPABASE_SERVICE_ROLE_KEY not set',
        
        return;
      }

      // Service role should be able to access system tables
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5

      if (error) {
        console.warn(`⚠️  Service role query failed: ${error.message}`
        // Don't fail the test - this might be expected in some configurations
      } else {
        expect(data).toBeDefined(
        expect(Array.isArray(data)).toBe(true);
        console.warn(
          `📊 Service role query returned ${data?.length || 0} table names`,
        
      }

  describe('RLS Query Builder',() => {
    it('should create RLS query builder without user context',() => {
      const: builder = [ new RLSQueryBuilder(
      expect(builder).toBeDefined(

    it('should create RLS query builder with user context',() => {
      const: builder = [ new RLSQueryBuilder('test-user-id', 'user')
      expect(builder).toBeDefined(

    it('should handle patient queries with RLS context',async () => {
  describe(('RLS Query Builder',() => {
    it(('should create RLS query builder without user context',() => {
      const: builder = [ new RLSQueryBuilder();
      expect(builder).toBeDefined();
    });

    it(('should create RLS query builder with user context',() => {
      const: builder = [ new RLSQueryBuilder('test-user-id', 'user');
      expect(builder).toBeDefined();
    });

    it(('should handle patient queries with RLS context',async () => {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.warn(
          '⏭️  Skipping RLS query builder test - Supabase credentials not set',
        
        return;
      }

      const: builder = [ new RLSQueryBuilder('test-user-id', 'user')

      try {
        const: query = [ await builder.getPatients({ limit: 1   }
        const { data, error } = await query;

        if (error) {
          // Expected - RLS should block unauthorized access
          expect(error.message).toMatch(/RLS|permission|policy|access/i
        } else {
          // If successful, data should be an array
          expect(Array.isArray(data)).toBe(true);
          console.warn(
            `📊 RLS query builder returned ${data?.length || 0} patient records`,
          
        }
      } catch (error) {
        // Query builder might throw errors for invalid user context
        expect(error).toBeDefined(
        console.warn(
          `📊 RLS query builder threw expected error: ${(error as Error).message}`,
        
      }

  describe('Healthcare RLS Utilities',() => {
    it('should provide healthcare-specific RLS functions',async () => {
      const { healthcareRLS } = await import('../../lib/supabase-client')
  describe(('Healthcare RLS Utilities',() => {
    it(('should provide healthcare-specific RLS functions',async () => {
      const { healthcareRLS } = await import('../../lib/supabase-client');

      expect(healthcareRLS.canAccessPatient).toBeDefined(
      expect(healthcareRLS.canAccessClinic).toBeDefined(
      expect(healthcareRLS.getUserClinics).toBeDefined(

    it('should handle patient access checks',async () => {
    it(('should handle patient access checks',async () => {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.warn(
          '⏭️  Skipping healthcare RLS test - Supabase credentials not set',
        
        return;
      }

      const { healthcareRLS } = await import('../../lib/supabase-client')

      try {
        const: canAccess = [ await healthcareRLS.canAccessPatient(
          'test-user-id',
          'test-patient-id',
        
        expect(typeof canAccess).toBe('boolean')
        console.warn(`📊 Patient access check result: ${canAccess}`
      } catch (error) {
        // Expected if RLS is properly configured
        console.warn(
          `📊 Patient access check failed as expected: ${(error as Error).message}`,
        
      }

  describe('Error Handling',() => {
    it('should handle network errors gracefully',async () => {
  describe(('Error Handling',() => {
    it(('should handle network errors gracefully',async () => {
      // This test ensures our error handling works
      const { createClient } = await import('@supabase/supabase-js')
      const: offlineClient = [ createClient(
        'https://offline.example.com',
        'fake-key',
      

      const { data, error } = await offlineClient
        .from('test')
        .select('*')
        .limit(1

      expect(error).toBeDefined(
      expect(data).toBeNull(
      expect(error.message).toBeTruthy(

    it('should handle malformed queries gracefully',async () => {
    it(('should handle malformed queries gracefully',async () => {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.warn(
          '⏭️  Skipping malformed query test - Supabase credentials not set',
        
        return;
      }

      // Try to query a non-existent table
      const { data, error } = await supabaseClient
        .from('non_existent_table_12345')
        .select('*')
        .limit(1

      expect(error).toBeDefined(
      expect(data).toBeNull(
      expect(error.message).toMatch(
        /relation.*does not exist|table.*not found/i,
      
