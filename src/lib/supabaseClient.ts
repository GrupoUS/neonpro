import { createClient } from '@supabase/supabase-js'

// Access environment variables using import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error("VITE_SUPABASE_URL is not defined. Make sure it's set in your .env file and the server is restarted.")
  throw new Error("VITE_SUPABASE_URL is not defined in .env file")
}

if (!supabaseAnonKey) {
  console.error("VITE_SUPABASE_ANON_KEY is not defined. Make sure it's set in your .env file and the server is restarted.")
  throw new Error("VITE_SUPABASE_ANON_KEY is not defined in .env file")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
