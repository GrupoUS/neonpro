/**
 * Enhanced React Hook para Real-time Patient Updates
 * Integra Supabase Realtime com TanStack Query para sincronização automática
 * Otimizado para ambiente healthcare com LGPD compliance
 */

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getRealtimeManager } from '../connection-manager';
import type { Database } from '@neonpro/types';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export interface RealtimePatientPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Patient;
  old?: Patient;
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
}/**
 * MANDATORY Real-time Patient Hook
 * Combina Supabase Realtime com TanStack Query cache management
 */
export function useRealtimePatients(
  options: UseRealtimePatientsOptions
): UseRealtimePatientsReturn {
  const {
    tenantId,
    enabled = true,
    onPatientChange,
    onError,
    queryKey = ['patients', tenantId]
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);

  /**
   * Handle realtime patient changes
   */
  const handlePatientChange = useCallback((payload: any) => {
    try {
      const realtimePayload: RealtimePatientPayload = {
        eventType: payload.eventType,
        new: payload.new as Patient,
        old: payload.old as Patient
      };

      // Update metrics
      setLastUpdate(new Date());
      setTotalUpdates(prev => prev + 1);

      // Update TanStack Query cache
      updateQueryCache(realtimePayload);

      // Call user callback
      if (onPatientChange) {
        onPatientChange(realtimePayload);
      }

      // Log for healthcare audit trail
      console.log(`[RealtimePatients] ${payload.eventType} event:`, {
        patientId: realtimePayload.new?.id || realtimePayload.old?.id,
        tenantId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[RealtimePatients] Payload processing error:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [onPatientChange, onError, tenantId]);  /**
   * Update TanStack Query cache based on realtime changes
   */
  const updateQueryCache = useCallback((payload: RealtimePatientPayload) => {
    const { eventType, new: newData, old: oldData } = payload;

    // Update patients list cache
    queryClient.setQueryData(queryKey, (oldCache: Patient[] | undefined) => {
      if (!oldCache) return oldCache;

      switch (eventType) {
        case 'INSERT':
          if (newData && newData.tenant_id === tenantId) {
            return [...oldCache, newData];
          }
          return oldCache;

        case 'UPDATE':
          if (newData) {
            return oldCache.map(patient => 
              patient.id === newData.id ? newData : patient
            );
          }
          return oldCache;

        case 'DELETE':
          if (oldData) {
            return oldCache.filter(patient => patient.id !== oldData.id);
          }
          return oldCache;

        default:
          return oldCache;
      }
    });

    // Update individual patient cache if exists
    if (newData) {
      queryClient.setQueryData(['patient', newData.id], newData);
    } else if (oldData && eventType === 'DELETE') {
      queryClient.removeQueries(['patient', oldData.id]);
    }

    // Invalidate related queries for fresh data
    queryClient.invalidateQueries(['patient-analytics', tenantId]);
    queryClient.invalidateQueries(['patient-stats', tenantId]);
  }, [queryClient, queryKey, tenantId]);

  /**
   * Subscribe to realtime patient updates
   */
  const subscribe = useCallback(() => {
    if (!enabled || unsubscribeFn) return;

    const realtimeManager = getRealtimeManager();
    
    const unsubscribe = realtimeManager.subscribe(
      `patients:tenant_id=eq.${tenantId}`,
      {
        event: 'postgres_changes',
        schema: 'public',
        table: 'patients',
        filter: `tenant_id=eq.${tenantId}`
      },
      handlePatientChange
    );

    setUnsubscribeFn(() => unsubscribe);
  }, [enabled, tenantId, handlePatientChange, unsubscribeFn]);  /**
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
    if (!enabled) return;

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
    unsubscribe
  };
}

/**
 * Hook para optimistic patient updates
 * Permite updates imediatos no UI antes da confirmação do servidor
 */
export function useOptimisticPatients(tenantId: string) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (patientId: string, updates: Partial<Patient>) => {
      // Update patients list optimistically
      queryClient.setQueryData(['patients', tenantId], (oldCache: Patient[] | undefined) => {
        if (!oldCache) return oldCache;
        return oldCache.map(patient =>
          patient.id === patientId ? { ...patient, ...updates } : patient
        );
      });

      // Update individual patient cache
      queryClient.setQueryData(['patient', patientId], (oldData: Patient | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...updates };
      });
    },
    [queryClient, tenantId]
  );

  const rollbackUpdate = useCallback(
    (patientId: string) => {
      // Invalidate caches to fetch fresh data
      queryClient.invalidateQueries(['patients', tenantId]);
      queryClient.invalidateQueries(['patient', patientId]);
    },
    [queryClient, tenantId]
  );

  return {
    optimisticUpdate,
    rollbackUpdate
  };
}