/**
 * Secure Supabase Browser Client
 * Uses centralized environment management with validation
 */

import { clientEnv, validateClientEnv } from "@/lib/env";
import { createBrowserClient } from "@supabase/ssr";

// Validate environment on module load
try {
  validateClientEnv();
} catch (error) {
  console.error("🚨 Supabase Client Environment Validation Failed:", error);
  throw error;
}

export function createClient() {
  return createBrowserClient(
    clientEnv.supabase.url,
    clientEnv.supabase.anonKey,
  );
}

export default createClient;
