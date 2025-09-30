/**
 * Realtime Cache Invalidation Service
 *
 * Handles Supabase realtime subscriptions for cache invalidation.
 * Ensures cache is invalidated when relevant data changes.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@neonpro/types'
import { invalidateCache, invalidateCacheByPattern } from '../middleware/cache'

interface RealtimeSubscription {
  table: string
  clinicId: string
  channel: any
  unsubscribe: () => void
}

class RealtimeCacheService {
  private subscriptions = new Map<string, RealtimeSubscription>()
  private supabase: ReturnType<typeof createClient<Database>>
  private isConnected = false

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }

  /**
   * Initialize realtime service
   */
  async initialize(): Promise<void> {
    try {
      // Enable realtime for tracked tables
      await this.supabase.realtime.setAuth('')
      this.isConnected = true
      console.log('Realtime cache service initialized')
    } catch (error) {
      console.error('Failed to initialize realtime cache service:', error)
      // Continue without realtime - cache will still work but won't auto-invalidate
    }
  }

  /**
   * Subscribe to table changes for a specific clinic
   */
  subscribeToTable(table: string, clinicId: string): void {
    if (!this.isConnected) {
      console.warn('Realtime service not connected, skipping subscription')
      return
    }

    const subscriptionKey = `${table}:${clinicId}`

    // Check if already subscribed
    if (this.subscriptions.has(subscriptionKey)) {
      return
    }

    try {
      const channel = this.supabase
        .channel(`cache-invalidation-${table}-${clinicId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `clinic_id=eq.${clinicId}`
          },
          (payload) => this.handleRealtimeEvent(table, clinicId, payload)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to ${table} changes for clinic ${clinicId}`)
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`Failed to subscribe to ${table} for clinic ${clinicId}`)
            this.unsubscribeFromTable(table, clinicId)
          }
        })

      const subscription: RealtimeSubscription = {
        table,
        clinicId,
        channel,
        unsubscribe: () => {
          channel.unsubscribe()
        }
      }

      this.subscriptions.set(subscriptionKey, subscription)
    } catch (error) {
      console.error(`Failed to subscribe to ${table} for clinic ${clinicId}:`, error)
    }
  }

  /**
   * Unsubscribe from table changes for a specific clinic
   */
  unsubscribeFromTable(table: string, clinicId: string): void {
    const subscriptionKey = `${table}:${clinicId}`
    const subscription = this.subscriptions.get(subscriptionKey)

    if (subscription) {
      try {
        subscription.unsubscribe()
        this.subscriptions.delete(subscriptionKey)
        console.log(`Unsubscribed from ${table} changes for clinic ${clinicId}`)
      } catch (error) {
        console.error(`Failed to unsubscribe from ${table} for clinic ${clinicId}:`, error)
      }
    }
  }

  /**
   * Subscribe to all tracked tables for a clinic
   */
  subscribeToClinic(clinicId: string): void {
    const trackedTables = [
      'architecture_configs',
      'performance_metrics',
      'compliance_status',
      'migration_states',
      'package_manager_configs'
    ]

    trackedTables.forEach(table => {
      this.subscribeToTable(table, clinicId)
    })
  }

  /**
   * Unsubscribe from all tables for a clinic
   */
  unsubscribeFromClinic(clinicId: string): void {
    const trackedTables = [
      'architecture_configs',
      'performance_metrics',
      'compliance_status',
      'migration_states',
      'package_manager_configs'
    ]

    trackedTables.forEach(table => {
      this.unsubscribeFromTable(table, clinicId)
    })
  }

  /**
   * Handle realtime events and invalidate cache
   */
  private handleRealtimeEvent(
    table: string,
    clinicId: string,
    payload: any
  ): void {
    try {
      const { event, new: newRecord, old: oldRecord } = payload

      console.log(`Realtime event: ${event} on ${table} for clinic ${clinicId}`)

      // Invalidate cache based on table and event
      switch (table) {
        case 'architecture_configs':
          this.invalidateArchitectureConfigCache(clinicId)
          break
        case 'performance_metrics':
          this.invalidatePerformanceMetricsCache(clinicId)
          break
        case 'compliance_status':
          this.invalidateComplianceStatusCache(clinicId)
          break
        case 'migration_states':
          this.invalidateMigrationStateCache(clinicId)
          break
        case 'package_manager_configs':
          this.invalidatePackageManagerConfigCache(clinicId)
          break
        default:
          // For unknown tables, invalidate by pattern
          invalidateCacheByPattern(table, clinicId)
      }

      // Log cache invalidation for audit
      console.log(`Cache invalidated for ${table} due to ${event} event`, {
        table,
        clinicId,
        event,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error(`Error handling realtime event for ${table}:`, error)
    }
  }

  /**
   * Invalidate architecture config cache
   */
  private invalidateArchitectureConfigCache(clinicId: string): void {
    invalidateCache('/architecture/config', clinicId)
  }

  /**
   * Invalidate performance metrics cache
   */
  private invalidatePerformanceMetricsCache(clinicId: string): void {
    invalidateCache('/performance/metrics', clinicId)
  }

  /**
   * Invalidate compliance status cache
   */
  private invalidateComplianceStatusCache(clinicId: string): void {
    invalidateCache('/compliance/status', clinicId)
  }

  /**
   * Invalidate migration state cache
   */
  private invalidateMigrationStateCache(clinicId: string): void {
    invalidateCache('/migration/state', clinicId)
  }

  /**
   * Invalidate package manager config cache
   */
  private invalidatePackageManagerConfigCache(clinicId: string): void {
    invalidateCache('/package-manager/config', clinicId)
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(): {
    isConnected: boolean
    subscriptionCount: number
    subscriptions: Array<{ table: string; clinicId: string }>
  } {
    const subscriptions = Array.from(this.subscriptions.values()).map(sub => ({
      table: sub.table,
      clinicId: sub.clinicId
    }))

    return {
      isConnected: this.isConnected,
      subscriptionCount: this.subscriptions.size,
      subscriptions
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    try {
      // Unsubscribe from all active subscriptions
      for (const subscription of this.subscriptions.values()) {
        subscription.unsubscribe()
      }

      this.subscriptions.clear()
      this.isConnected = false

      console.log('Realtime cache service cleaned up')
    } catch (error) {
      console.error('Error during realtime cache service cleanup:', error)
    }
  }
}

// Singleton instance for Edge runtime
let realtimeCacheService: RealtimeCacheService | null = null

/**
 * Get or create the realtime cache service singleton
 */
export const getRealtimeCacheService = (
  supabaseUrl: string,
  supabaseAnonKey: string
): RealtimeCacheService => {
  if (!realtimeCacheService) {
    realtimeCacheService = new RealtimeCacheService(supabaseUrl, supabaseAnonKey)
  }
  return realtimeCacheService
}

/**
 * Initialize realtime cache service with error handling
 */
export const initializeRealtimeCacheService = async (
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<RealtimeCacheService> => {
  const service = getRealtimeCacheService(supabaseUrl, supabaseAnonKey)
  await service.initialize()
  return service
}

export { RealtimeCacheService }
