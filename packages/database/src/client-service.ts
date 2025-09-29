import { createClient } from '@supabase/supabase-js';
import { Database } from '@neonpro/types';

export const createServiceClient = (supabaseUrl: string, serviceRoleKey: string) => {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Runtime': 'node',
        'X-Service-Role': 'true'
      }
    }
  });
};