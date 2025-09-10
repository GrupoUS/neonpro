// Governance Service Provider
// Configures and provides the governance service instance

import { SupabaseGovernanceService } from './supabase-governance.service'
import { GovernanceService } from '@neonpro/types/governance.types'

// Service instance (singleton)
let governanceServiceInstance: GovernanceService | null = null

/**
 * Get or create the governance service instance
 */
export function getGovernanceService(): GovernanceService {
  if (!governanceServiceInstance) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_ANON_KEY required')
    }

    governanceServiceInstance = new SupabaseGovernanceService(supabaseUrl, supabaseKey)
  }

  return governanceServiceInstance
}

/**
 * Reset service instance (useful for testing)
 */
export function resetGovernanceService(): void {
  governanceServiceInstance = null
}

/**
 * Set custom governance service instance (useful for testing)
 */
export function setGovernanceService(service: GovernanceService): void {
  governanceServiceInstance = service
}