/**
 * Minimal Supabase Database Client
 * Simple re-export for core-services compatibility
 */

// Re-export SupabaseClient type for external use
export type { SupabaseClient } from '@supabase/supabase-js'

// Simple stub functions
export const createClient = () => null as any
export const createServiceClient = () => null as any
export const checkDatabaseHealth = async () => ({ healthy: true })
export const closeDatabaseConnections = async () => {/* no-op */}
