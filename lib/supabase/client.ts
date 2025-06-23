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
  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    throw new Error("Supabase configuration is incomplete");
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Use default storage for better compatibility
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      // Enhanced security settings
      flowType: "pkce",
      debug: process.env.NODE_ENV === "development",
    },
    // Global configuration
    global: {
      headers: {
        "X-Client-Info": "neonpro-web",
      },
    },
    // Database configuration
    db: {
      schema: "public",
    },
    // Realtime configuration
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}
