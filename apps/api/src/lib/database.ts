// Database service for API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
      const { error } = await supabase.from('_health_check').select('1').limit(1);
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

  // Export supabase client for direct use
  client: supabase,
};

export default db;