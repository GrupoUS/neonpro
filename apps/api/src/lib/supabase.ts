/**
 * Supabase Client Configuration
 * Constitutional healthcare database client for NeonPro
 */

import type { Database } from "@neonpro/types";
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ownkoxryswokcdanrdgj.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_ANON_KEY || "";

/**
 * Create Supabase client with service role key
 * Constitutional healthcare database access
 */
export function createSupabaseClient() {
  if (!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error(
      "Supabase URL and Service Role Key are required for constitutional healthcare compliance",
    );
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
  });
}

/**
 * Singleton Supabase client instance
 * For constitutional healthcare operations
 */
let supabaseClient: ReturnType<typeof createSupabaseClient> | null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

// Export singleton instance as 'supabase' for compatibility
export const supabase = getSupabaseClient();
