/**
 * useRealtimeQuery Hook
 * Integrates TanStack Query with Supabase Realtime for automatic data synchronization
 */

import { useQuery, useQueryClient, type QueryKey, type UseQueryOptions } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface RealtimeQueryOptions<TData, TError = Error> extends UseQueryOptions<TData, TError> {
  /**
   * Supabase table to subscribe to for real-time updates
   */
  table: string
  /**
   * Database schema (default: 'public')
   */
  schema?: string
  /**
   * Filter for real-time events (e.g., 'id=eq.123')
   */
  filter?: string
  /**
   * Whether to invalidate queries on all events or just specific ones
   */
  invalidateOn?: ('INSERT' | 'UPDATE' | 'DELETE')[]
  /**
   * Custom handler for real-time events
   */
  onRealtimeEvent?: (payload: RealtimePostgresChangesPayload<any>) => void
  /**
   * Whether to enable optimistic updates
   */
  enableOptimisticUpdates?: boolean
}

/**
 * Enhanced useQuery hook with automatic Supabase Realtime integration
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useRealtimeQuery({
 *   queryKey: ['appointments'],
 *   queryFn: () => trpc.appointments.list.query(),
 *   table: 'appointments',
 *   schema: 'clinic',
 *   invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
 * })
 * ```
 */
export function useRealtimeQuery<TData = unknown, TError = Error>(
  options: RealtimeQueryOptions<TData, TError>
) {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  
  const {
    table,
    schema = 'public',
    filter,
    invalidateOn = ['INSERT', 'UPDATE', 'DELETE'],
    onRealtimeEvent,
    enableOptimisticUpdates = false,
    ...queryOptions
  } = options

  // Standard TanStack Query
  const query = useQuery(queryOptions)

  // Set up Supabase realtime subscription
  useEffect(() => {
    if (!table || !queryOptions.queryKey) return

    const channelName = `realtime-${table}-${JSON.stringify(queryOptions.queryKey)}`
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
          ...(filter && { filter }),
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Call custom event handler if provided
          if (onRealtimeEvent) {
            onRealtimeEvent(payload)
          }

          // Handle different event types
          if (invalidateOn.includes(payload.eventType)) {
            // Invalidate queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: queryOptions.queryKey })
          }

          // Optimistic updates for specific operations
          if (enableOptimisticUpdates && payload.eventType === 'INSERT' && payload.new) {
            queryClient.setQueryData(queryOptions.queryKey, (oldData: any) => {
              if (Array.isArray(oldData)) {
                return [payload.new, ...oldData]
              }
              return oldData
            })
          }

          if (enableOptimisticUpdates && payload.eventType === 'UPDATE' && payload.new) {
            queryClient.setQueryData(queryOptions.queryKey, (oldData: any) => {
              if (Array.isArray(oldData)) {
                return oldData.map((item: any) => 
                  item.id === payload.new?.id ? payload.new : item
                )
              }
              return oldData
            })
          }

          if (enableOptimisticUpdates && payload.eventType === 'DELETE' && payload.old) {
            queryClient.setQueryData(queryOptions.queryKey, (oldData: any) => {
              if (Array.isArray(oldData)) {
                return oldData.filter((item: any) => item.id !== payload.old?.id)
              }
              return oldData
            })
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, schema, filter, queryOptions.queryKey, invalidateOn, onRealtimeEvent, enableOptimisticUpdates, queryClient])

  return query
}