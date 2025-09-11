// Database package exports - Supabase integration

// Export Supabase client factory functions
export { createClient, createServiceClient } from './client';

// Export database types
export type { Database } from './types/supabase';

// Export utility functions
export { validateSchema, checkTablesExist } from './utils/validation';
export { migrateData, backupData } from './utils/migration';

// Re-export Supabase types for convenience
export type {
  SupabaseClient,
  PostgrestResponse,
  PostgrestError,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
