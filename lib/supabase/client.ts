import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Configuração real do Supabase usando environment variables
// Projeto GPUS: gfkskrkbnawkuppazkpt
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://gfkskrkbnawkuppazkpt.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdma3NrcmtibmF3a3VwcGF6a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTExMzUsImV4cCI6MjA2MzUyNzEzNX0.hpJNATAkIwxQt_Z2Q-hxcxHX4wXszvc7eV24Sfs30ic";

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "sb-auth-token",
    },
  });
}
