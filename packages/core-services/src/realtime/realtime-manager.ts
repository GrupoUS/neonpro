/**
 * Enhanced Real-time Manager with TanStack Query Synchronization
 * Optimized for healthcare applications with intelligent caching
 */

import {
  createClient,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { QueryClient } from "@tanstack/react-query";
import { logHealthcareError, realtimeLogger } from '../../../shared/src/logging/healthcare-logger';

export interface RealtimeSubscriptionOptions<T = any> {
  onInsert?: (_payload: T) => void;
  onUpdate?: (_payload: T) => void;
  onDelete?: (_payload: { old: T }) => void;
  queryKeys?: string[][];
  optimisticUpdates?: boolean;
  rateLimitMs?: number;
}

export class RealtimeManager {
  private channels = new Map<string, RealtimeChannel>();
  private queryClient: QueryClient;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10, // Healthcare-appropriate rate limiting
        },
      },
    },
  );
  private rateLimitMap = new Map<string, number>();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Subscribe to table changes with healthcare-optimized settings
   */
  subscribeToTable<T extends { id: string } = { id: string }>(
    tableName: string,
    filter?: string,
    options: RealtimeSubscriptionOptions<T> = {},
  ): RealtimeChannel {
    const channelName = `${tableName}-${filter || "all"}`;

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter,
        },
        async (
          payload: RealtimePostgresChangesPayload<Record<string, any>>,
        ) => {
          // Rate limiting for healthcare data
          if (this.shouldRateLimit(channelName, options.rateLimitMs || 100)) {
            return;
          }

          await this.handleRealtimeEvent(payload, tableName, options);
        },
      )
      .subscribe((status) => {
        realtimeLogger.info(`Realtime subscription status update`, {
          channelName,
          status,
          timestamp: new Date().toISOString()
        });

        if (status === "SUBSCRIBED") {
          realtimeLogger.info(`Successfully subscribed to realtime changes`, {
            tableName,
            channelName,
            timestamp: new Date().toISOString()
          });
        } else if (status === "CHANNEL_ERROR") {
          realtimeLogger.error(`Error subscribing to realtime changes`, {
            tableName,
            channelName,
            timestamp: new Date().toISOString()
          });
          // Implement retry logic
          setTimeout(() => {
            this.retrySubscription(tableName, filter, options);
          }, 5000);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  private shouldRateLimit(channelName: string, rateLimitMs: number): boolean {
    const now = Date.now();
    const lastUpdate = this.rateLimitMap.get(channelName) || 0;

    if (now - lastUpdate < rateLimitMs) {
      return true;
    }

    this.rateLimitMap.set(channelName, now);
    return false;
  }

  private async handleRealtimeEvent<T extends { id: string }>(
    _payload: RealtimePostgresChangesPayload<Record<string, any>>,
    tableName: string,
    options: RealtimeSubscriptionOptions<T>,
  ) {
    try {
      switch (payload.eventType) {
        case "INSERT":
          options.onInsert?.(payload.new as T);
          if (options.optimisticUpdates !== false) {
            await this.optimisticInsert(tableName, payload.new as T);
          }
          break;
        case "UPDATE":
          options.onUpdate?.(payload.new as T);
          if (options.optimisticUpdates !== false) {
            await this.optimisticUpdate(tableName, payload.new as T);
          }
          break;
        case "DELETE":
          options.onDelete?.({ old: payload.old as T });
          if (options.optimisticUpdates !== false) {
            await this.optimisticDelete(tableName, payload.old as T);
          }
          break;
      }

      // Invalidate related queries for data consistency
      if (options.queryKeys) {
        await Promise.all(
          options.queryKeys.map((queryKey) =>
            this.queryClient.invalidateQueries({ queryKey }),
          ),
        );
      }
    } catch (error) {
      logHealthcareError('realtime', error, { method: 'handleRealtimeEvent', tableName });
    }
  }
  private async optimisticInsert<T extends { id: string }>(
    tableName: string,
    newRecord: T,
  ) {
    // Cancel outgoing refetches to prevent race conditions
    await this.queryClient.cancelQueries({ queryKey: [tableName] });

    // Optimistically update cache with new record
    this.queryClient.setQueryData([tableName], (old: T[] | undefined) => {
      return old ? [...old, newRecord] : [newRecord];
    });

    // Update specific record cache if it exists
    this.queryClient.setQueryData([tableName, newRecord.id], newRecord);
  }

  private async optimisticUpdate<T extends { id: string }>(
    tableName: string,
    updatedRecord: T,
  ) {
    await this.queryClient.cancelQueries({ queryKey: [tableName] });

    // Update list cache
    this.queryClient.setQueryData([tableName], (old: T[] | undefined) => {
      return (
        old?.map((item) =>
          item.id === updatedRecord.id ? updatedRecord : item,
        ) || []
      );
    });

    // Update specific record cache
    this.queryClient.setQueryData([tableName, updatedRecord.id], updatedRecord);
  }

  private async optimisticDelete<T extends { id: string }>(
    tableName: string,
    deletedRecord: T,
  ) {
    await this.queryClient.cancelQueries({ queryKey: [tableName] });

    // Remove from list cache
    this.queryClient.setQueryData([tableName], (old: T[] | undefined) => {
      return old?.filter((item) => item.id !== deletedRecord.id) || [];
    });

    // Remove specific record cache
    this.queryClient.removeQueries({ queryKey: [tableName, deletedRecord.id] });
  }

  private async retrySubscription<T extends { id: string }>(
    tableName: string,
    filter?: string,
    options: RealtimeSubscriptionOptions<T> = {},
    retryCount = 0,
  ) {
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      realtimeLogger.error(`Max retries reached for subscription`, {
        tableName,
        retryCount,
        maxRetries: 3,
        timestamp: new Date().toISOString()
      });
      return;
    }

    realtimeLogger.info(`Retrying subscription`, {
      tableName,
      retryCount: retryCount + 1,
      timestamp: new Date().toISOString()
    });

    // Remove failed channel
    const channelName = `${tableName}-${filter || "all"}`;
    const existingChannel = this.channels.get(channelName);
    if (existingChannel) {
      this.supabase.removeChannel(existingChannel);
      this.channels.delete(channelName);
    }

    // Wait before retry with exponential backoff
    await new Promise((resolve) =>
      setTimeout(resolve, Math.pow(2, retryCount) * 1000),
    );

    // Retry subscription
    this.subscribeToTable(tableName, filter, options);
  }

  /**
   * Subscribe to presence changes for collaborative features
   */
  subscribeToPresence(
    channelName: string,
    initialState: Record<string, any> = {},
  ): RealtimeChannel {
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = this.supabase
      .channel(channelName)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        realtimeLogger.info(`Presence sync`, {
          state,
          channelName,
          timestamp: new Date().toISOString()
        });
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        realtimeLogger.info(`User joined presence channel`, {
          key,
          newPresences,
          channelName,
          timestamp: new Date().toISOString()
        });
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        realtimeLogger.info(`User left presence channel`, {
          key,
          leftPresences,
          channelName,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(initialState);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribe from specific channel
   */
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.rateLimitMap.delete(channelName);
      realtimeLogger.info(`Unsubscribed from realtime channel`, {
        channelName,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      this.supabase.removeChannel(channel);
      realtimeLogger.info(`Unsubscribed from all realtime channels`, {
        channelName: name,
        timestamp: new Date().toISOString()
      });
    });
    this.channels.clear();
    this.rateLimitMap.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): string {
    // Note: connection property may not be available in all versions
    return "connected"; // Simplified for now
  }

  /**
   * Get active channels count
   */
  getActiveChannelsCount(): number {
    return this.channels.size;
  }
}
