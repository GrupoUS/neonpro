import { createClient } from '@supabase/supabase-js';
import { Database } from '@neonpro/types';

export const createEdgeClient = (supabaseUrl: string, supabaseAnonKey: string) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Runtime': 'edge'
      }
    }
  });
};

export const createAnonClient = createEdgeClient; // Alias for backward compatibility