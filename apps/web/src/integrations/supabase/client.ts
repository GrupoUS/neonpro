import { createClient as supabaseCreateClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey);

// Create a convenience export for the client
export const createSupabaseClient = () => supabase;
