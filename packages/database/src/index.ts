/**
 * NeonPro Database Package
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

// Export models
// Use namespace exports for model modules that have overlapping named exports
export * as architectureConfig from './models/architecture-config'
export * from './models/compliance-status'
export * from './models/migration-state'
export * as packageManagerConfig from './models/package-manager-config'
export * as performanceMetrics from './models/performance-metrics'

// Export client
export * from './client'

// Export client service
export { createSupabaseAdminClient, loadDatabaseConfig } from './client-service'
export type { DatabaseConfig } from './client-service'

// Export types
export * from './types'
