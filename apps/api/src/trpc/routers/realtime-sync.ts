/**
 * Real-time Synchronization API Router
 * 
 * Backend API for real-time data synchronization across the platform
 * Features:
 * - Supabase Realtime subscriptions management
 * - Live updates for appointments, chat messages, clinical data
 * - Cross-device synchronization
 * - Offline support with conflict resolution
 * - Healthcare-compliant real-time notifications
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { router, procedure } from '../trpc-factory'
import { rlsGuard } from '../middleware/rls-guard'

// Types
export interface RealtimeSubscription {
  id: string
  userId: string
  clinicId: string
  resourceType: 'appointments' | 'chat_sessions' | 'clinical_data' | 'compliance_alerts' | 'system_notifications'
  resourceId?: string
  filters: Record<string, any>
  isActive: boolean
  createdAt: Date
  lastActivity: Date
  metadata: {
    userAgent?: string
    deviceId?: string
    subscriptionToken?: string
  }
}

export interface SyncEvent {
  id: string
  type: 'create' | 'update' | 'delete' | 'sync_request'
  resourceType: string
  resourceId: string
  data: Record<string, any>
  timestamp: Date
  userId: string
  clinicId: string
  metadata: {
    source: 'user_action' | 'system' | 'external_api' | 'sync_conflict'
    version: number
    checksum?: string
  }
}

export interface ConflictResolution {
  id: string
  conflictType: 'data_conflict' | 'version_conflict' | 'business_rule_conflict'
  resourceType: string
  resourceId: string
  localData: Record<string, any>
  remoteData: Record<string, any>
  resolution: 'local_wins' | 'remote_wins' | 'manual_review'
  resolvedBy?: string
  resolvedAt?: Date
  createdAt: Date
}

export interface OfflineQueue {
  id: string
  userId: string
  deviceId: string
  operations: Array<{
    id: string
    type: 'create' | 'update' | 'delete'
    resourceType: string
    resourceId?: string
    data: Record<string, any>
    timestamp: Date
    retryCount: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
  }>
  lastSyncAt: Date
  createdAt: Date
}

// Input schemas
const SubscribeToRealtimeSchema = z.object({
  resourceType: z.enum(['appointments', 'chat_sessions', 'clinical_data', 'compliance_alerts', 'system_notifications']),
  resourceId: z.string().uuid().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  deviceId: z.string().optional(),
});

const UnsubscribeFromRealtimeSchema = z.object({
  subscriptionId: z.string().uuid(),
});

const SyncDataSchema = z.object({
  resourceType: z.string(),
  resourceId: z.string().uuid(),
  data: z.record(z.string(), z.any()),
  version: z.number().optional(),
  checksum: z.string().optional(),
});

const ResolveConflictSchema = z.object({
  conflictId: z.string().uuid(),
  resolution: z.enum(['local_wins', 'remote_wins', 'manual_review']),
  customData: z.record(z.string(), z.any()).optional(),
});

const GetOfflineQueueSchema = z.object({
  deviceId: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

export const realtimeSyncRouter = router({
  // Subscribe to real-time updates
  subscribeToRealtime: procedure
    .input(SubscribeToRealtimeSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      const supabase = ctx.supabase as SupabaseClient<any>
      try {
        const subscriptionId = crypto.randomUUID()
        
        // Create subscription record
        const subscription: RealtimeSubscription = {
          id: subscriptionId,
          userId: ctx.session?.id || 'anonymous',
          clinicId: ctx.clinicId,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          filters: input.filters || {},
          isActive: true,
          createdAt: new Date(),
          lastActivity: new Date(),
          metadata: {
            userAgent: 'unknown',
            deviceId: input.deviceId,
          },
        }

        // Store subscription
        const { data: savedSubscription, error: saveError } = await supabase
          .from('realtime_subscriptions')
          .insert({
            id: subscriptionId,
            user_id: subscription.userId,
            clinic_id: ctx.clinicId,
            resource_type: input.resourceType,
            resource_id: input.resourceId,
            filters: input.filters,
            is_active: true,
            created_at: subscription.createdAt.toISOString(),
            last_activity: subscription.lastActivity.toISOString(),
            metadata: subscription.metadata,
          })
          .select()
          .single()

        if (saveError) throw saveError

        // Generate Supabase Realtime token
        const realtimeToken = await generateRealtimeToken(supabase, {
          userId: subscription.userId,
          clinicId: ctx.clinicId,
          resourceType: input.resourceType,
          permissions: ['read'],
        })

        // Log subscription creation
        await supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'realtime_subscription_created',
            resource_type: 'realtime_sync',
            resource_id: subscriptionId,
            details: {
              resource_type: input.resourceType,
              resource_id: input.resourceId,
              has_filters: Object.keys(input.filters || {}).length > 0,
              device_id: input.deviceId,
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          subscription: savedSubscription,
          realtimeToken,
          channel: `${ctx.clinicId}:${input.resourceType}${input.resourceId ? `:${input.resourceId}` : ''}`,
        }
      } catch (error) {
        console.error('Failed to create realtime subscription:', error)
        throw new Error('Failed to create realtime subscription')
      }
    }),

  // Unsubscribe from real-time updates
  unsubscribeFromRealtime: procedure
    .input(UnsubscribeFromRealtimeSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      const supabase = ctx.supabase as SupabaseClient<any>
      try {
        // Deactivate subscription
        const { error } = await supabase
          .from('realtime_subscriptions')
          .update({ 
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.subscriptionId)
          .eq('clinic_id', ctx.clinicId)

        if (error) throw error

        // Log unsubscription
        await supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'realtime_subscription_ended',
            resource_type: 'realtime_sync',
            resource_id: input.subscriptionId,
            details: {
              subscription_id: input.subscriptionId,
              reason: 'user_unsubscribed',
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          unsubscribedAt: new Date().toISOString(),
        }
      } catch (error) {
        console.error('Failed to unsubscribe from realtime:', error)
        throw new Error('Failed to unsubscribe from realtime')
      }
    }),

  // Get active subscriptions
  getActiveSubscriptions: procedure
    .input(z.object({
      resourceType: z.enum(['appointments', 'chat_sessions', 'clinical_data', 'compliance_alerts', 'system_notifications']).optional(),
      userId: z.string().uuid().optional(),
    }))
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      const supabase = ctx.supabase as SupabaseClient<any>
      try {
        let query = supabase
          .from('realtime_subscriptions')
          .select('*')
          .eq('clinic_id', ctx.clinicId)
          .eq('is_active', true)

        if (input.resourceType) {
          query = query.eq('resource_type', input.resourceType)
        }

        if (input.userId) {
          query = query.eq('user_id', input.userId)
        }

        const { data: subscriptions, error } = await query
          .order('created_at', { ascending: false })

        if (error) throw error

        return {
          success: true,
          subscriptions: subscriptions || [],
          count: subscriptions?.length || 0,
        }
      } catch (error) {
        console.error('Failed to get active subscriptions:', error)
        throw new Error('Failed to get active subscriptions')
      }
    }),

  // Sync data (handle offline sync)
  syncData: procedure
    .input(SyncDataSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      const supabase = ctx.supabase as SupabaseClient<any>
      try {
        const syncEvent: SyncEvent = {
          id: crypto.randomUUID(),
          type: 'sync_request',
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          data: input.data,
          timestamp: new Date(),
          userId: ctx.session?.id || 'anonymous',
          clinicId: ctx.clinicId,
          metadata: {
            source: 'user_action',
            version: input.version || 1,
            checksum: input.checksum,
          },
        }

        // Check for conflicts
        const conflict = await checkForSyncConflict(supabase, syncEvent)

        if (conflict) {
          // Create conflict resolution record
          const conflictId = crypto.randomUUID()
          await supabase
            .from('sync_conflicts')
            .insert({
              id: conflictId,
              conflict_type: 'data_conflict',
              resource_type: input.resourceType,
              resource_id: input.resourceId,
              local_data: input.data,
              remote_data: conflict.remoteData,
              resolution: 'manual_review',
              created_at: new Date().toISOString(),
            })

          return {
            success: false,
            conflictDetected: true,
            conflictId,
            localData: input.data,
            remoteData: conflict.remoteData,
            requiresManualResolution: true,
          }
        }

        // Apply sync changes
        const result = await applySyncChanges(supabase, syncEvent)

        // Log sync event
        await supabase
          .from('sync_events')
          .insert({
            id: syncEvent.id,
            type: syncEvent.type,
            resource_type: input.resourceType,
            resource_id: input.resourceId,
            data: input.data,
            timestamp: syncEvent.timestamp.toISOString(),
            user_id: syncEvent.userId,
            clinic_id: ctx.clinicId,
            metadata: syncEvent.metadata,
          })

        return {
          success: true,
          synced: result,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        console.error('Failed to sync data:', error)
        throw new Error('Failed to sync data')
      }
    }),

  // Get sync conflicts
  getSyncConflicts: procedure
    .input(z.object({
      resourceType: z.string().optional(),
      status: z.enum(['pending', 'resolved']).optional(),
    }))
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      const supabase = ctx.supabase as SupabaseClient<any>
      try {
        let query = supabase
          .from('sync_conflicts')
          .select('*')
          .eq('clinic_id', ctx.clinicId)

        if (input.resourceType) {
          query = query.eq('resource_type', input.resourceType)
        }

        if (input.status === 'pending') {
          query = query.is('resolution', 'manual_review')
        } else if (input.status === 'resolved') {
          query = query.neq('resolution', 'manual_review')
        }

        query = query.order('created_at', { ascending: false })

        const { data: conflicts, error } = await query

        if (error) throw error

        return {
          success: true,
          conflicts: conflicts || [],
          pendingCount: conflicts?.filter(c => c.resolution === 'manual_review').length || 0,
        }
      } catch (error) {
        console.error('Failed to get sync conflicts:', error)
        throw new Error('Failed to get sync conflicts')
      }
    }),

  // Resolve sync conflict
  resolveSyncConflict: procedure
    .input(ResolveConflictSchema)
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      const supabase = ctx.supabase as SupabaseClient<any>
      try {
        // Get conflict details
        const { data: conflict, error: conflictError } = await supabase
          .from('sync_conflicts')
          .select('*')
          .eq('id', input.conflictId)
          .eq('clinic_id', ctx.clinicId)
          .single()

        if (conflictError || !conflict) {
          throw new Error('Conflict not found or access denied')
        }

        // Apply resolution
        let finalData
        if (input.resolution === 'local_wins') {
          finalData = conflict.local_data
        } else if (input.resolution === 'remote_wins') {
          finalData = conflict.remote_data
        } else if (input.resolution === 'manual_review' && input.customData) {
          finalData = input.customData
        } else {
          throw new Error('Invalid resolution or missing custom data')
        }

        // Update the resource with resolved data
        await updateResourceWithResolvedData(supabase, {
          resourceType: conflict.resource_type,
          resourceId: conflict.resource_id,
          data: finalData,
        })

        // Update conflict record
        const { error: updateError } = await supabase
          .from('sync_conflicts')
          .update({
            resolution: input.resolution,
            resolved_by: ctx.session?.id,
            resolved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.conflictId)

        if (updateError) throw updateError

        // Log conflict resolution
        await supabase
          .from('audit_logs')
          .insert({
            id: crypto.randomUUID(),
            clinic_id: ctx.clinicId,
            user_id: ctx.session?.id || 'system',
            action: 'sync_conflict_resolved',
            resource_type: 'realtime_sync',
            resource_id: input.conflictId,
            details: {
              conflict_type: conflict.conflict_type,
              resource_type: conflict.resource_type,
              resolution: input.resolution,
              resolved_by: ctx.session?.id,
            },
            created_at: new Date().toISOString(),
          })

        return {
          success: true,
          resolvedAt: new Date().toISOString(),
          resolution: input.resolution,
        }
      } catch (error) {
        console.error('Failed to resolve sync conflict:', error)
        throw new Error('Failed to resolve sync conflict')
      }
    }),

  // Get offline queue
  getOfflineQueue: procedure
    .input(GetOfflineQueueSchema)
    .use(rlsGuard)
    .query(async ({ ctx, input }) => {
      const supabase = ctx.supabase as SupabaseClient<any>
      try {
        let query = supabase
          .from('offline_queues')
          .select('*')
          .eq('user_id', ctx.session?.id || 'anonymous')

        if (input.deviceId) {
          query = query.eq('device_id', input.deviceId)
        }

        const { data: queues, error } = await query
          .order('created_at', { ascending: false })

        if (error) throw error

        const typedQueues = (queues ?? []) as Array<OfflineQueue>
        const operations: OfflineQueue['operations'] = []

        for (const queue of typedQueues) {
          const filtered = queue.operations.filter(op => !input.status || op.status === input.status)
          operations.push(...filtered)
        }

        return {
          success: true,
          operations,
          totalQueues: typedQueues.length,
          pendingOperations: operations.filter(op => op.status === 'pending').length,
        }
      } catch (error) {
        console.error('Failed to get offline queue:', error)
        throw new Error('Failed to get offline queue')
      }
    }),

  // Process offline queue
  processOfflineQueue: procedure
    .input(z.object({
      deviceId: z.string(),
      operationIds: z.array(z.string()).optional(),
    }))
    .use(rlsGuard)
    .mutation(async ({ ctx, input }) => {
      const supabase = ctx.supabase as SupabaseClient<any>
      try {
        // Get pending operations
        const { data: queues, error: queueError } = await supabase
          .from('offline_queues')
          .select('*')
          .eq('user_id', ctx.session?.id || 'anonymous')
          .eq('device_id', input.deviceId)

        if (queueError) throw queueError

        const typedQueues = (queues ?? []) as Array<OfflineQueue>
        const operationsToProcess: OfflineQueue['operations'] = []

        for (const queue of typedQueues) {
          const pendingOperations = queue.operations.filter(operation =>
            operation.status === 'pending' &&
            (!input.operationIds || input.operationIds.includes(operation.id))
          )
          operationsToProcess.push(...pendingOperations)
        }

        const results: Array<{
          operationId: string
          success: boolean
          result?: unknown
          error?: string
        }> = []
        for (const operation of operationsToProcess) {
          try {
            // Process the operation
            const result = await processOfflineOperation(supabase, operation)
            results.push({
              operationId: operation.id,
              success: true,
              result,
            })

            // Update operation status
            await updateOperationStatus(supabase, operation.id, 'completed')
          } catch (error) {
            results.push({
              operationId: operation.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            })

            // Update operation status with retry logic
            const retryCount = (operation.retryCount ?? 0) + 1
            if (retryCount < 3) {
              await updateOperationStatus(supabase, operation.id, 'pending', retryCount)
            } else {
              await updateOperationStatus(supabase, operation.id, 'failed', retryCount)
            }
          }
        }

        // Update last sync timestamp
        if (typedQueues.length > 0) {
          await supabase
            .from('offline_queues')
            .update({ 
              last_sync_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('device_id', input.deviceId)
            .eq('user_id', ctx.session?.id || 'anonymous')
        }

        return {
          success: true,
          processedCount: results.length,
          results,
          processedAt: new Date().toISOString(),
        }
      } catch (error) {
        console.error('Failed to process offline queue:', error)
        throw new Error('Failed to process offline queue')
      }
    }),
})

// Helper functions
async function generateRealtimeToken(_supabase: any, _payload: any): Promise<string> {
  // Generate a token for Supabase Realtime
  // In production, this would use proper JWT signing
  return crypto.randomUUID()
}

async function checkForSyncConflict(
  supabase: any, 
  syncEvent: SyncEvent
): Promise<{ remoteData: any } | null> {
  // Check if there's a conflicting version
  const { data: existing, error } = await supabase
    .from(syncEvent.resourceType)
    .select('*')
    .eq('id', syncEvent.resourceId)
    .single()

  if (error || !existing) {
    return null
  }

  // Simple conflict detection based on version
  if (syncEvent.metadata.version && existing.version && syncEvent.metadata.version < existing.version) {
    return {
      remoteData: existing,
    }
  }

  return null
}

async function applySyncChanges(supabase: any, syncEvent: SyncEvent): Promise<any> {
  // Apply the sync changes to the database
  const { data, error } = await supabase
    .from(syncEvent.resourceType)
    .upsert({
      ...syncEvent.data,
      id: syncEvent.resourceId,
      updated_at: new Date().toISOString(),
      sync_version: (syncEvent.metadata.version || 1) + 1,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function updateResourceWithResolvedData(
  supabase: any,
  { resourceType, resourceId, data }: any
): Promise<void> {
  const { error } = await supabase
    .from(resourceType)
    .update({
      ...data,
      updated_at: new Date().toISOString(),
      sync_resolved_at: new Date().toISOString(),
    })
    .eq('id', resourceId)

  if (error) throw error
}

async function processOfflineOperation(supabase: any, operation: any): Promise<any> {
  switch (operation.type) {
    case 'create':
      return await supabase
        .from(operation.resourceType)
        .insert(operation.data)
        .select()
        .single()
    
    case 'update':
      return await supabase
        .from(operation.resourceType)
        .update(operation.data)
        .eq('id', operation.resourceId)
        .select()
        .single()
    
    case 'delete':
      return await supabase
        .from(operation.resourceType)
        .delete()
        .eq('id', operation.resourceId)
    
    default:
      throw new Error(`Unknown operation type: ${operation.type}`)
  }
}

async function updateOperationStatus(
  _supabase: any,
  operationId: string,
  status: string,
  _retryCount?: number
): Promise<void> {
  // This would update the operation status in the queue
  // Implementation depends on the actual queue structure
  console.log(`Updating operation ${operationId} to status: ${status}`)
}