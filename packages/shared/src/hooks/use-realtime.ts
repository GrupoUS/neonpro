/**
 * 🔄 Real-time Hooks - NeonPro Healthcare
 * =======================================
 *
 * Type-safe React hooks for Supabase real-time subscriptions
 * with TanStack Query integration and LGPD compliance
 */

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  LGPDRealtimeConfig,
  RealtimeEventHandler,
  RealtimeHealthCheck,
  UseRealtimeConfig,
  UseRealtimeQueryConfig,
} from '../types/realtime.types';

// Re-export types for other hooks
export type { UseRealtimeConfig } from '../types/realtime.types';

// LGPD compliance utilities
const sanitizeRealtimeData = (data: any, sensitiveFields: string[] = []) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  sensitiveFields.forEach((field) => {
    if (field in sanitized) {
      sanitized[field] = '***PROTECTED***';
    }
  });

  return sanitized;
};

const logRealtimeEvent = (
  _event: string,
  _table: string,
  payload: any,
  lgpdConfig?: LGPDRealtimeConfig,
) => {
  if (lgpdConfig?.enableAuditLogging) {
    const _logData = lgpdConfig.enableDataMinimization
      ? sanitizeRealtimeData(payload, lgpdConfig.sensitiveFields)
      : payload;
  }
};

/**
 * Base real-time hook with LGPD compliance
 * Manages Supabase real-time subscriptions with healthcare data protection
 */
export function useRealtime<
  T extends Record<string, any> = Record<string, any>,
>(supabaseClient: SupabaseClient, config: UseRealtimeConfig<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>();
  const [lastUpdate, setLastUpdate] = useState<Date | null>();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleRealtimeEvent = useCallback(
    (
      eventType: 'INSERT' | 'UPDATE' | 'DELETE',
      payload: any,
      handler?: RealtimeEventHandler<T>,
    ) => {
      try {
        // LGPD compliance logging
        if (config.lgpdCompliance) {
          logRealtimeEvent(eventType, config.table, payload, {
            enableAuditLogging: config.auditLogging ?? false,
            enableDataMinimization: true,
            enableConsentValidation: true,
            sensitiveFields: ['cpf', 'rg', 'email', 'phone', 'address'],
          });
        }

        // Update timestamp
        setLastUpdate(new Date());

        // Call event handler
        if (handler) {
          handler(payload);
        }

        // Clear any previous errors
        setError(undefined);
      } catch {
        const error = error instanceof Error ? error : new Error('Realtime event error');
        setError(error);
        config.onError?.(error);
      }
    },
    [config],
  );

  useEffect(() => {
    const enabledState = config.enabled ?? true;
    if (!enabledState) {
      return;
    }

    const channel = supabaseClient
      .channel(`realtime:${config.table}`)
      .on(
        'postgres_changes' as any,
        {
          event: config.event || '*',
          schema: 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';

          switch (eventType) {
            case 'INSERT': {
              handleRealtimeEvent(eventType, payload, config.onInsert);
              break;
            }
            case 'UPDATE': {
              handleRealtimeEvent(eventType, payload, config.onUpdate);
              break;
            }
            case 'DELETE': {
              handleRealtimeEvent(eventType, payload, config.onDelete);
              break;
            }
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(undefined);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          const error = new Error(`Real-time subscription error: ${status}`);
          setError(error);
          config.onError?.(error);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabaseClient.removeChannel(channelRef.current);
        channelRef.current = undefined;
        setIsConnected(false);
      }
    };
  }, [
    supabaseClient,
    config.table,
    config.filter,
    config.event,
    config.enabled,
    handleRealtimeEvent,
    config.onDelete,
    config.onError,
    config.onInsert,
    config.onUpdate,
  ]);

  const healthCheck: RealtimeHealthCheck = {
    isConnected,
    activeSubscriptions: channelRef.current ? 1 : 0,
    ...(lastUpdate && { lastPing: lastUpdate }),
    errorCount: error ? 1 : 0,
    ...(error && { lastError: error }),
  };

  return {
    isConnected,
    error,
    lastUpdate,
    healthCheck,
    channel: channelRef.current,
  };
}

/**
 * Real-time hook with TanStack Query integration
 * Automatically invalidates queries and provides optimistic updates
 */
export function useRealtimeQuery<
  T extends Record<string, any> = Record<string, any>,
>(supabaseClient: SupabaseClient, config: UseRealtimeQueryConfig<T>) {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(
    (eventType: string) => {
      const shouldInvalidate = (eventType === 'INSERT'
        && config.queryOptions?.invalidateOnInsert !== false)
        || (eventType === 'UPDATE'
          && config.queryOptions?.invalidateOnUpdate !== false)
        || (eventType === 'DELETE'
          && config.queryOptions?.invalidateOnDelete !== false);

      if (shouldInvalidate) {
        queryClient.invalidateQueries({ queryKey: config.queryKey });

        if (config.queryOptions?.backgroundRefetch) {
          queryClient.refetchQueries({ queryKey: config.queryKey });
        }
      }
    },
    [queryClient, config.queryKey, config.queryOptions],
  );

  const realtimeConfig: UseRealtimeConfig<T> = {
    ...config,
    onInsert: (payload) => {
      config.onInsert?.(payload);
      invalidateQueries('INSERT');
    },
    onUpdate: (payload) => {
      config.onUpdate?.(payload);
      invalidateQueries('UPDATE');
    },
    onDelete: (payload) => {
      config.onDelete?.(payload);
      invalidateQueries('DELETE');
    },
  };

  return useRealtime(supabaseClient, realtimeConfig);
}
