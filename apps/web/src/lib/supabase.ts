/**
 * @file Legacy Supabase Client (Deprecated)
 * 
 * @deprecated Use @/lib/supabase/client.ts or @/lib/supabase/server.ts instead
 * This file is kept for backward compatibility only
 * 
 * NEW IMPLEMENTATIONS SHOULD USE:
 * - Client components: import { createSupabaseClient } from '@/lib/supabase/client.ts'
 * - Server components: import { createSupabaseServerClient } from '@/lib/supabase/server.ts'
 */

// Re-export from new structure for backward compatibility
export { 
  supabase,
  createSupabaseClient,
  isSupabaseConfigured,
  getSupabaseConfig,
  type SupabaseClient
} from './supabase/client'

// Mark as deprecated in console when used
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.warn(
    '⚠️ DEPRECATED: @/lib/supabase.ts is deprecated. ' +
    'Use @/lib/supabase/client.ts or @/lib/supabase/server.ts instead.'
  )
}