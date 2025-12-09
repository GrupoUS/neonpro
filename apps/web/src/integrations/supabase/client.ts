/**
 * Supabase Client - DISABLED FOR TESTING
 * Temporary mock to isolate the build issue
 */

console.log('[Supabase] MOCK CLIENT - Supabase completely removed for testing')

// Mock client that does nothing but satisfies TypeScript
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signIn: async () => ({ data: null, error: new Error('Supabase disabled') }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  })
}

export default supabase

export type Database = any
