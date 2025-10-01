import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@neonpro/types';

/**
 * Database configuration interface with partial optional fields
 * Supports secure loading from environment variables
 */
export interface DatabaseConfig {
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
}

/**
 * Load database configuration from environment variables
 * Validates required keys in non-development environments
 * Ensures LGPD compliance by not logging sensitive data
 */
export const loadDatabaseConfig = (): Partial<DatabaseConfig> => {
  const config: Partial<DatabaseConfig> = {};
  
  // Load URL
  if (process.env['SUPABASE_URL']) {
    config.url = process.env['SUPABASE_URL'];
  }
  
  // Load anon key
  if (process.env['SUPABASE_ANON_KEY']) {
    config.anonKey = process.env['SUPABASE_ANON_KEY'];
  }
  
  // Load service role key (server-only)
  if (process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    config.serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  }
  
  // Validate required keys in non-development environments
  const isDev = process.env['NODE_ENV'] === 'development';
  if (!isDev) {
    if (!config.url) {
      throw new Error('SUPABASE_URL is required in production environment');
    }
    if (!config.anonKey && !config.serviceRoleKey) {
      throw new Error('Either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is required in production environment');
    }
  }
  
  // Audit log without sensitive data (LGPD compliance)
  console.warn('Database configuration loaded', {
    hasUrl: !!config.url,
    hasAnonKey: !!config.anonKey,
    hasServiceRoleKey: !!config.serviceRoleKey,
    environment: process.env['NODE_ENV'] || 'development',
    timestamp: new Date().toISOString()
  });
  
  return config;
};

/**
 * Create Supabase admin client with service role key for server-only operations
 * Enforces server-only runtime and includes audit logging
 */
export const createSupabaseAdminClient = (config?: Partial<DatabaseConfig>): SupabaseClient<Database> => {
  // Enforce server-only runtime
  const isServer = typeof window === 'undefined' &&
                  (typeof process !== 'undefined' ||
                   (typeof globalThis !== 'undefined' && 'process' in globalThis));
  
  if (!isServer) {
    throw new Error('createSupabaseAdminClient can only be used in server environments');
  }
  
  // Load default configuration from environment
  const defaultConfig = loadDatabaseConfig();
  
  // Merge with provided config
  const finalConfig = { ...defaultConfig, ...config };
  
  // Validate required configuration
  if (!finalConfig.url) {
    throw new Error('Database URL is required for admin client');
  }
  
  // Service role key is required for admin operations
  const serviceRoleKey = finalConfig.serviceRoleKey || process.env['SUPABASE_SERVICE_ROLE_KEY'];
  
  if (!serviceRoleKey) {
    throw new Error('Service role key is required for admin client');
  }
  
  // Audit log without sensitive data (LGPD compliance)
  console.warn('Supabase admin client created', {
    hasUrl: !!finalConfig.url,
    hasServiceRoleKey: !!serviceRoleKey,
    environment: process.env['NODE_ENV'] || 'development',
    timestamp: new Date().toISOString(),
    userAgent: process.env['USER_AGENT'] || 'server'
  });
  
  return createClient<Database>(finalConfig.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Runtime': 'node',
        'X-Service-Role': 'true',
        'X-Admin-Client': 'true'
      }
    }
  });
};

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