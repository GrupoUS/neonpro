import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey);

// Create a convenience export for the client
export const createSupabaseClient = () => supabase;
// Back-compat named export expected by components
export const createClient = createSupabaseClient;
