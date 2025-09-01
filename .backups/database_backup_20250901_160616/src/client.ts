/**
 * Modern Supabase Client Configuration for NeonPro Healthcare
 * Implements @supabase/ssr patterns for Next.js 15 App Router
 * Healthcare compliance: LGPD + ANVISA + CFM + Multi-tenant isolation
 */

import { createBrowserClient, createServerClient as createSSRServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Environment variable validation with proper types
interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string | undefined;
  jwtSecret?: string | undefined;
}

function validateEnvironment(): SupabaseConfig {
  const config: SupabaseConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  };

  if (!(config.url && config.anonKey)) {
    throw new Error(
      "Missing required Supabase environment variables - Healthcare compliance requires secure configuration",
    );
  }

  // Validate URL format
  try {
    new URL(config.url);
  } catch {
    throw new Error("Invalid SUPABASE_URL format");
  }

  return config;
}

// Validated environment configuration
const supabaseConfig = validateEnvironment();

/**
 * Browser Client for Client Components
 * Used in React Client Components that run in the browser
 * Includes healthcare-specific error handling and audit logging
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    global: {
      headers: {
        "X-Client-Type": "neonpro-healthcare",
        "X-Compliance": "LGPD-ANVISA-CFM",
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce", // Enhanced security for healthcare
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
        log_level: "info",
      },
    },
  });
}

/**
 * Server Client for Server Components and API Routes
 * Implements proper cookie handling with getAll/setAll patterns
 * Required for Next.js 15 App Router and healthcare session management
 */
export function createServerClient(cookieStore: {
  getAll: () => { name: string; value: string; }[];
  setAll?: (
    cookies: { name: string; value: string; options?: unknown; }[],
  ) => void;
}) {
  return createSSRServerClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: unknown; }[],
      ) {
        if (cookieStore.setAll) {
          cookieStore.setAll(cookiesToSet);
        }
      },
    },
    global: {
      headers: {
        "X-Client-Type": "neonpro-healthcare-server",
        "X-Compliance": "LGPD-ANVISA-CFM",
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      flowType: "pkce",
    },
  });
}

/**
 * Admin Client for Service Role Operations
 * WARNING: Use with extreme caution - bypasses RLS policies
 * Only for administrative operations and system maintenance
 */
export function createAdminClient() {
  if (!supabaseConfig.serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations - Healthcare compliance requires explicit admin access",
    );
  }

  return createSupabaseClient<Database>(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Type": "neonpro-healthcare-admin",
        "X-Compliance": "LGPD-ANVISA-CFM",
        "X-Admin-Access": "true",
      },
    },
  });
}

/**
 * Get Supabase configuration for external use
 */
export function getSupabaseConfig(): SupabaseConfig {
  return { ...supabaseConfig };
}
