// Database service for API
import { createClient } from '@supabase/supabase-js';

// Server-only runtime guard - prevent client-side bundling
if (typeof window !== 'undefined') {
  throw new Error('Database service can only be imported in server-side environments (Node.js/Edge Runtime)');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-only Supabase client with service role key
const serverSupabaseClient = createClient(supabaseUrl, supabaseKey);

export interface DatabaseHealthCheck {
  connected: boolean;
  timestamp: string;
  latency?: number;
  error?: string;
}

export const db = {
  async healthCheck(): Promise<DatabaseHealthCheck> {
    try {
      const start = Date.now();
      const { error } = await serverSupabaseClient.from('_health_check').select('*', { head: true });
      const latency = Date.now() - start;
      
      return {
        connected: !error,
        timestamp: new Date().toISOString(),
        latency,
        error: error?.message,
      };
    } catch (error) {
      return {
        connected: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Server-only client getter - prevents accidental client-side usage
  get client() {
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be accessed in browser environments');
    }
    return serverSupabaseClient;
  },
};

// Server-only named export - use this instead of direct client access
export const getServerSupabaseClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Server-only Supabase client cannot be accessed in browser environments');
  }
  return serverSupabaseClient;
};

export default db;