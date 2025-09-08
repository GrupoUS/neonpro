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
  // Ensure a single GoTrueClient instance in the browser (avoids multi-instance warnings)
  const globalForSupabase = globalThis as unknown as {
    supabaseBrowserClient?: ReturnType<typeof createBrowserClient>;
  };

  if (!globalForSupabase.supabaseBrowserClient) {
    globalForSupabase.supabaseBrowserClient = createBrowserClient(
      clientEnv.supabase.url,
      clientEnv.supabase.anonKey,
    );
  }

  return globalForSupabase.supabaseBrowserClient;
}

export default createClient;
