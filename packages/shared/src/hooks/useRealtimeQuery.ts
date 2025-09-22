/**
 * Custom hook combining TanStack Query with Supabase real-time
 * Optimized for healthcare applications with intelligent caching
 */

import {
  RealtimeManager,
  RealtimeSubscriptionOptions,
} from "../realtime/realtime-manager";
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

export interface UseRealtimeQueryOptions<T>
  extends Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn"> {
  tableName: string;
  filter?: string;
  realtimeOptions?: RealtimeSubscriptionOptions<T>;
  enabled?: boolean;
}

export function useRealtimeQuery<T extends { id: string } = { id: string }>(
  queryKey: string[],
  queryFn: () => Promise<T[]>,
  options: UseRealtimeQueryOptions<T>,
): any {
  const queryClient = useQueryClient();
  const realtimeManager = useRef<RealtimeManager | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Initialize realtime manager
  if (!realtimeManager.current) {
    realtimeManager.current = new RealtimeManager(queryClient);
  }

  // TanStack Query with healthcare-optimized defaults
  const query = useQuery({
    queryKey,queryFn,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.gcTime ?? 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: options.enabled ?? true,
    ...options,
  });

  // Memoized subscription setup
  const setupSubscription = useCallback(() => {
    if (!realtimeManager.current || !options.enabled) return undefined;

    const subscription = realtimeManager.current.subscribeToTable(options.tableName, options.filter,
      {
        queryKeys: [queryKey],
        optimisticUpdates: true,
        rateLimitMs: 100, // Healthcare-appropriate rate limiting
        onInsert: (payload: T) => {
          console.log(`New ${options.tableName} inserted:`, payload);
          options.realtimeOptions?.onInsert?.(payload);
        },
        onUpdate: (payload: T) => {
          console.log(`${options.tableName} updated:`, payload);
          options.realtimeOptions?.onUpdate?.(payload);
        },
        onDelete: (payload: { old: T }) => {
          console.log(`${options.tableName} deleted:`, payload.old);
          options.realtimeOptions?.onDelete?.(payload);
        },
        ...options.realtimeOptions,
      },
    );

    subscriptionRef.current = subscription;
    return subscription;
  }, [
    queryKey,
    options.tableName,
    options.filter,
    options.enabled,
    options.realtimeOptions,
  ]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = setupSubscription();

    return () => {
      if (subscription && realtimeManager.current) {
        const channelName = `${options.tableName}-${options.filter || "all"}`;
        realtimeManager.current.unsubscribe(channelName);
      }
    };
  }, [setupSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeManager.current) {
        realtimeManager.current.unsubscribeAll();
      }
    };
  }, []);

  return {
    ...query,
    // Additional real-time specific properties
    connectionStatus: realtimeManager.current?.getConnectionStatus(),
    activeChannels: realtimeManager.current?.getActiveChannelsCount() ?? 0,
    resubscribe: setupSubscription,
  };
}

/**
 * Hook for real-time mutations with optimistic updates
 */
export function useRealtimeMutation<T extends { id: string }>(
  queryKey: string[],
) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    async (updatedItem: T) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<T[]>(queryKey);

      // Optimistically update
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        return (old?.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ) ?? []
        );
      });

      return { previousData };
    },
    [queryClient, queryKey],
  );

  const rollback = useCallback(
    (context: { previousData?: T[] }) => {
      if (context.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    [queryClient, queryKey],
  );

  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey }),
    [queryClient, queryKey],
  );

  return {
    optimisticUpdate,
    rollback,
    invalidate,
  };
}
