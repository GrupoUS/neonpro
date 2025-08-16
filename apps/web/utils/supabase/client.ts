import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

// Create a single supabase client for interacting with your database
export const supabase = createBrowserSupabaseClient<Database>();

// Alternative client creation for client-side usage
export function createClient() {
  return createBrowserSupabaseClient<Database>();
}

// Export default client
export default supabase;
