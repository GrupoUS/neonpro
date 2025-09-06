/**
 * Secure Supabase Server Client
 * Uses centralized environment management with validation
 */

import { serverEnv, validateServerEnv } from "@/lib/env";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Validate environment on module load (server-side only)
try {
  validateServerEnv();
} catch (error) {
  console.error("🚨 Supabase Server Environment Validation Failed:", error);
  throw error;
}

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    serverEnv.supabase.url,
    serverEnv.supabase.anonKey,
    {
      cookies: {
        get: (name: string) => {
          const c = cookieStore.get(name);
          return c?.value ?? null;
        },
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Called from a Server Component. Safe to ignore if middleware handles session refresh.
          }
        },
        remove: (name: string, options: CookieOptions) => {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Called from a Server Component. Safe to ignore if middleware handles session refresh.
          }
        },
      },
    },
  );
}

/**
 * Create admin client with service role key for server-side admin operations
 * ⚠️ WARNING: Only use for server-side admin operations - bypasses RLS!
 */
export function createAdminClient() {
  if (!serverEnv.supabase.serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations. "
        + "Add it to your .env.local file for admin functionality.",
    );
  }

  return createServerClient(
    serverEnv.supabase.url,
    serverEnv.supabase.serviceRoleKey,
    {
      cookies: {
        get: (name: string) => {
          const c = cookies().get(name);
          return c?.value ?? null;
        },
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            cookies().set({ name, value, ...options });
          } catch {}
        },
        remove: (name: string, options: CookieOptions) => {
          try {
            cookies().set({ name, value: "", ...options });
          } catch {}
        },
      },
    },
  );
}

export default createClient;
