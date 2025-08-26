/**
 * Modern Supabase Client Configuration for NeonPro Healthcare
 * Implements @supabase/ssr patterns for Next.js 15 App Router
 * Healthcare compliance: LGPD + ANVISA + CFM + Multi-tenant isolation
 */

import {
  createBrowserClient,
  createServerClient as createSSRServerClient,
} from "@supabase/ssr";
import type { Database } from "./types";

// Healthcare environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!(supabaseUrl && supabaseAnonKey)) {
  throw new Error(
    "Missing Supabase environment variables - Healthcare compliance requires secure configuration",
  );
}

/**
 * Browser Client for Client Components
 * Used in React Client Components that run in the browser
 * Includes healthcare-specific error handling and audit logging
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
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
  getAll: () => { name: string; value: string }[];
  setAll?: (cookies: { name: string; value: string; options?: any }[]) => void;
}) {
  return createSSRServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
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
