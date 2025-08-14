// app/utils/supabase/client.ts
// Updated client with proper error handling
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Supabase configuration is missing')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Legacy support
export { createClient as createLegacyClient }

// Simplified optimized client for now
export function createOptimizedClient(clinicId: string) {
  return createClient()
}