// Governance Service Provider
// Configures and provides the governance service instance

// Minimal GovernanceService interface
interface GovernanceService {
  // Methods would be defined as needed
  healthCheck(): Promise<boolean>
}
import { SupabaseGovernanceService } from './supabase-governance.service'

// Service instance (singleton)
let governanceServiceInstance: GovernanceService | null = null

/**
 * Get or create the governance service instance
 * @returns The singleton GovernanceService instance
 */
export function getGovernanceService(): GovernanceService {
  if (!governanceServiceInstance) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase configuration missing: SUPABASE_URL and SUPABASE_ANON_KEY required',
      )
    }

    governanceServiceInstance = new SupabaseGovernanceService(
      supabaseUrl,
      supabaseKey,
    )
  }

  if (!governanceServiceInstance) {
    throw new Error('Failed to initialize governance service')
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
 * @param _service - The custom GovernanceService instance to use
 */
export function setGovernanceService(_service: GovernanceService): void {
  governanceServiceInstance = _service
}
