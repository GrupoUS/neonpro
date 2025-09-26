/**
 * useRealtimeMutation Hook
 * Integrates TanStack Mutation with Supabase Realtime for optimistic updates
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface RealtimeMutationOptions<TData, TError, TVariables, TContext> 
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  /**
   * Query keys to invalidate after successful mutation
   */
  invalidateQueries?: string[][]
  /**
   * Whether to broadcast the mutation result via Supabase realtime
   */
  broadcastUpdate?: boolean
  /**
   * Custom broadcast channel name
   */
  broadcastChannel?: string
  /**
   * Custom broadcast event name
   */
  broadcastEvent?: string
}

/**
 * Enhanced useMutation hook with automatic query invalidation and realtime broadcasting
 * 
 * @example
 * ```typescript
 * const createAppointment = useRealtimeMutation({
 *   mutationFn: (data) => trpc.appointments.create.mutate(data),
 *   invalidateQueries: [['appointments'], ['appointments', 'calendar']],
 *   broadcastUpdate: true,
 *   broadcastChannel: 'appointments',
 *   broadcastEvent: 'appointment-created',
 * })
 * ```
 */
export function useRealtimeMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: RealtimeMutationOptions<TData, TError, TVariables, TContext>
) {
  const queryClient = useQueryClient()
  
  const {
    invalidateQueries = [],
    broadcastUpdate = false,
    broadcastChannel = 'mutations',
    broadcastEvent = 'data-updated',
    onSuccess,
    ...mutationOptions
  } = options

  const mutation = useMutation({
    ...mutationOptions,
    onSuccess: useCallback(async (data, variables, context) => {
      // Invalidate specified queries
      for (const queryKey of invalidateQueries) {
        await queryClient.invalidateQueries({ queryKey })
      }

      // Broadcast update via Supabase realtime if enabled
      if (broadcastUpdate) {
        try {
          await supabase
            .channel(broadcastChannel)
            .send({
              type: 'broadcast',
              event: broadcastEvent,
              payload: {
                data,
                variables,
                timestamp: new Date().toISOString(),
              },
            })
        } catch (error) {
          console.warn('Failed to broadcast realtime update:', error)
        }
      }

      // Call original onSuccess if provided
      if (onSuccess) {
        onSuccess(data, variables, context)
      }
    }, [queryClient, invalidateQueries, broadcastUpdate, broadcastChannel, broadcastEvent, onSuccess]),
  })

  return mutation
}