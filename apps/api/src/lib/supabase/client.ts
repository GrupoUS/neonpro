/**
 * Supabase Client Configuration for API Server
 *
 * Server-side Supabase client implementations following best practices
 * from docs/rules/supabase-best-practices.md
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  throw new Error('Missing required environment variable: SUPABASE_URL');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variable: SUPABASE_ANON_KEY');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY - admin operations will not be available');
}

/**
 * Create a Supabase client for server-side operations
 * Uses anon key with RLS enabled
 */
export function createServerClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Create a Supabase admin client that bypasses RLS
 * Use with caution - only for trusted server-side operations
 */
export function createAdminClient(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Create a Supabase client for a specific user
 * Injects user's JWT token for proper RLS enforcement
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

// Singleton instances for common use cases
export const supabaseClient = createServerClient();
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : null;

/**
 * RLS Query Builder Helper
 * Ensures queries respect Row Level Security policies
 */
export class RLSQueryBuilder<T = any> {
  private client: SupabaseClient;
  private table: string;

  constructor(client: SupabaseClient, table: string) {
    this.client = client;
    this.table = table;
  }

  /**
   * Select with RLS enforcement
   */
  select(columns = '*') {
    return this.client.from(this.table).select(columns);
  }

  /**
   * Insert with RLS enforcement
   */
  insert(data: Partial<T> | Partial<T>[]) {
    return this.client.from(this.table).insert(data);
  }

  /**
   * Update with RLS enforcement
   */
  update(data: Partial<T>) {
    return this.client.from(this.table).update(data);
  }

  /**
   * Delete with RLS enforcement
   */
  delete() {
    return this.client.from(this.table).delete();
  }
}

/**
 * Healthcare-specific RLS helper
 * For LGPD-compliant patient data access
 */
export function healthcareRLS<T = any>(
  table: string,
  userToken?: string,
): RLSQueryBuilder<T> {
  const client = userToken ? createUserClient(userToken) : createServerClient();
  return new RLSQueryBuilder<T>(client, table);
}
