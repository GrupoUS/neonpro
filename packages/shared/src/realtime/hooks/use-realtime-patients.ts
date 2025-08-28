/**
 * Enhanced React Hook para Real-time Patient Updates
 * Integra Supabase Realtime com TanStack Query para sincronização automática
 * Otimizado para ambiente healthcare com LGPD compliance
 */

import type { Database } from "../../types/database.types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getRealtimeManager } from "../connection-manager";

// Explicitly use database patient type (snake_case) not entities type (camelCase)
type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
// Remove unused imports for now until we align the types properly
// type PatientInsert = Database['public']['Tables']['patients']['Insert'];
// type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export interface RealtimePatientPayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: PatientRow;
  old?: PatientRow;
  errors?: string[];
}

export interface UseRealtimePatientsOptions {
  tenantId: string;
  enabled?: boolean;
  onPatientChange?: (payload: RealtimePatientPayload) => void;
  onError?: (error: Error) => void;
  queryKey?: string[];
}

export interface UseRealtimePatientsReturn {
  isConnected: boolean;
  connectionHealth: number;
  lastUpdate: Date | null;
  totalUpdates: number;
  subscribe: () => void;
  unsubscribe: () => void;
} /**
 * MANDATORY Real-time Patient Hook
 * Combina Supabase Realtime com TanStack Query cache management
 */

export function useRealtimePatients(
  options: UseRealtimePatientsOptions,
): UseRealtimePatientsReturn {
  const {
    tenantId,
    enabled = true,
    onPatientChange,
    onError,
    queryKey = ["patients", tenantId],
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);

  /**
   * Update TanStack Query cache based on realtime changes
   */
  const updateQueryCache = useCallback(
    (payload: RealtimePatientPayload) => {
      const { eventType, new: newData, old: oldData } = payload;

      // Update patients list cache
      queryClient.setQueryData(
        queryKey,
        (oldCache: PatientRow[] | undefined) => {
          if (!oldCache) {
            return oldCache;
          }

          switch (eventType) {
            case "INSERT": {
              if (newData && newData.clinic_id === tenantId) {
                return [...oldCache, newData];
              }
              return oldCache;
            }

            case "UPDATE": {
              if (newData) {
                return oldCache.map((patient) =>
                  patient.id === newData.id ? newData : patient,
                );
              }
              return oldCache;
            }

            case "DELETE": {
              if (oldData) {
                return oldCache.filter((patient) => patient.id !== oldData.id);
              }
              return oldCache;
            }

            default: {
              return oldCache;
            }
          }
        },
      );

      // Update individual patient cache
      if (newData) {
        queryClient.setQueryData(["patient", newData.id], newData);
      } else if (oldData && eventType === "DELETE") {
        queryClient.removeQueries({ queryKey: ["patient", oldData.id] });
      }

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["patient-analytics", tenantId],
      });
    },
    [queryClient, queryKey, tenantId],
  );

  /**
   * Handle realtime patient changes
   */
  const handlePatientChange = useCallback(
    (payload: unknown) => {
      try {
        const typedPayload = payload as any;
        const realtimePayload: RealtimePatientPayload = {
          eventType: typedPayload.eventType,
          new: typedPayload.new as PatientRow,
          old: typedPayload.old as PatientRow,
        };

        // Update metrics
        setLastUpdate(new Date());
        setTotalUpdates((prev) => prev + 1);

        // Update TanStack Query cache
        updateQueryCache(realtimePayload);

        // Call user callback
        if (onPatientChange) {
          onPatientChange(realtimePayload);
        }
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [
      onPatientChange,
      onError, // Update TanStack Query cache
      updateQueryCache,
    ],
  );

  /**
   * Subscribe to realtime patient updates
   */
  const subscribe = useCallback(() => {
    if (!enabled || unsubscribeFn) {
      return;
    }

    const realtimeManager = getRealtimeManager();

    const unsubscribe = realtimeManager.subscribe(
      `patients:clinic_id=eq.${tenantId}`,
      {
        table: "patients",
        filter: `clinic_id=eq.${tenantId}`,
      },
      handlePatientChange,
    );

    setUnsubscribeFn(() => unsubscribe);
  }, [enabled, tenantId, handlePatientChange, unsubscribeFn]); /**
   * Unsubscribe from realtime patient updates
   */

  const unsubscribe = useCallback(() => {
    if (unsubscribeFn) {
      unsubscribeFn();
      setUnsubscribeFn(null);
    }
  }, [unsubscribeFn]);

  /**
   * Monitor connection status
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const realtimeManager = getRealtimeManager();

    const unsubscribeStatus = realtimeManager.onStatusChange((status) => {
      setIsConnected(status.isConnected);
      setConnectionHealth(status.healthScore);
    });

    // Auto-subscribe if enabled
    if (enabled) {
      subscribe();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
      unsubscribeStatus();
    };
  }, [enabled, subscribe, unsubscribe]);

  return {
    isConnected,
    connectionHealth,
    lastUpdate,
    totalUpdates,
    subscribe,
    unsubscribe,
  };
}

/**
 * Hook para optimistic patient updates
 * Permite updates imediatos no UI antes da confirmação do servidor
 */
export function useOptimisticPatients(tenantId: string) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (patientId: string, updates: Partial<PatientRow>) => {
      // Update patients list optimistically
      queryClient.setQueryData(
        ["patients", tenantId],
        (oldCache: PatientRow[] | undefined) => {
          if (!oldCache) {
            return oldCache;
          }
          return oldCache.map((patient) =>
            patient.id === patientId ? { ...patient, ...updates } : patient,
          );
        },
      );

      // Update individual patient cache
      queryClient.setQueryData(
        ["patient", patientId],
        (oldData: PatientRow | undefined) => {
          if (!oldData) {
            return oldData;
          }
          return { ...oldData, ...updates };
        },
      );
    },
    [queryClient, tenantId],
  );

  const rollbackUpdate = useCallback(
    (patientId: string) => {
      // Invalidate caches to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["patients", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
    },
    [queryClient, tenantId],
  );

  return {
    optimisticUpdate,
    rollbackUpdate,
  };
}
