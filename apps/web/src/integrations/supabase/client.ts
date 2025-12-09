/**
 * Supabase Client - Clean Implementation
 * Simplified version without external dependencies issues
 */

// Import using default export to avoid ESM/CommonJS issues
import supabaseLib from '@supabase/supabase-js'
import type { Database } from './types'

// Extract createClient from default export
const { createClient } = supabaseLib as any

// Environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Validate environment variables
if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('[Supabase] Using placeholder URL - set VITE_SUPABASE_URL')
}

if (supabaseAnonKey === 'placeholder-key') {
  console.warn('[Supabase] Using placeholder key - set VITE_SUPABASE_ANON_KEY')
}

/**
 * Supabase client instance
 * Clean, simple implementation that works in all environments
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'x-application-name': 'neonpro'
    }
  }
})

// Export client for backwards compatibility
export default supabase

console.log('[Supabase] Client initialized successfully')
