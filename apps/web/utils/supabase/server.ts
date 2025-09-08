/**
 * Secure Supabase Server Client
 * Uses centralized environment management with validation
 */

import { serverEnv, validateServerEnv, } from '@/lib/env'
import { type CookieOptions, createServerClient, } from '@supabase/ssr'
import { cookies, } from 'next/headers'

// In Next.js 15, cookies() can be async in some runtimes; type accordingly
// We will always await cookies() before using get/set to avoid TS2339.

// Validate environment on module load (server-side only)
try {
  validateServerEnv()
} catch (error) {
  console.error('🚨 Supabase Server Environment Validation Failed:', error,)
  throw error
}

export function createClient() {
  // Next.js 15 cookies() can be async in some runtimes; don’t hold a stale reference
  // We’ll resolve it inside each cookies method to satisfy typings and runtime.
  // const cookieStore = cookies();

  return createServerClient(
    serverEnv.supabase.url,
    serverEnv.supabase.anonKey,
    {
      cookies: {
        get: async (name: string,) => {
          const store = await cookies()
          const c = store.get(name,)
          return c?.value ?? null
        },
        set: async (name: string, value: string, options: CookieOptions,) => {
          try {
            const store = await cookies()
            store.set({ name, value, ...options, },)
          } catch (error) {
            // Called from a Server Component. Safe to ignore if middleware handles session refresh.
          }
        },
        remove: async (name: string, options: CookieOptions,) => {
          try {
            const store = await cookies()
            store.set({ name, value: '', ...options, },)
          } catch (error) {
            // Called from a Server Component. Safe to ignore if middleware handles session refresh.
          }
        },
      },
    },
  )
}

/**
 * Create admin client with service role key for server-side admin operations
 * ⚠️ WARNING: Only use for server-side admin operations - bypasses RLS!
 */
export function createAdminClient() {
  if (!serverEnv.supabase.serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for admin operations. '
        + 'Add it to your .env.local file for admin functionality.',
    )
  }

  return createServerClient(
    serverEnv.supabase.url,
    serverEnv.supabase.serviceRoleKey,
    {
      cookies: {
        get: async (name: string,) => {
          const store = await cookies()
          const c = store.get(name,)
          return c?.value ?? null
        },
        set: async (name: string, value: string, options: CookieOptions,) => {
          try {
            const store = await cookies()
            store.set({ name, value, ...options, },)
          } catch {}
        },
        remove: async (name: string, options: CookieOptions,) => {
          try {
            const store = await cookies()
            store.set({ name, value: '', ...options, },)
          } catch {}
        },
      },
    },
  )
}

export default createClient
