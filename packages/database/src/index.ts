/**
 * Minimal database exports for monorepo sharing
 * Only exports essential types to avoid compilation issues
 */

// Core database clients - factory functions
export { createClient, createServiceClient } from './client.js'

// Database types - only what core-services needs
export type { SupabaseClient } from './client.js'

// Health check utilities
export { checkDatabaseHealth, closeDatabaseConnections } from './client.js'
