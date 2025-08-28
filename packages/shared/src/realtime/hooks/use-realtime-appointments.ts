/**
 * Enhanced React Hook para Real-time Appointment Updates
 * Integra Supabase Realtime com TanStack Query para mudanças de agendamentos
 * Crítico para ambiente healthcare com notificações urgentes
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { Database } from "../../types/database.types";
import { getRealtimeManager } from "../connection-manager";

// Explicitly use database appointment type (snake_case) not entities type (camelCase)
type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];

export interface RealtimeAppointmentPayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: AppointmentRow;
  old?: AppointmentRow;
  errors?: string[];
}

export interface UseRealtimeAppointmentsOptions {
  tenantId: string;
  patientId?: string;
  professionalId?: string;
  enabled?: boolean;
  onAppointmentChange?: (payload: RealtimeAppointmentPayload) => void;
  onUrgentChange?: (payload: RealtimeAppointmentPayload) => void; // Mudanças urgentes
  onError?: (error: Error) => void;
  queryKey?: string[];
}

export interface UseRealtimeAppointmentsReturn {
  isConnected: boolean;
  connectionHealth: number;
  lastUpdate: Date | null;
  totalUpdates: number;
  urgentUpdates: number;
  subscribe: () => void;
  unsubscribe: () => void;
}

/**
 * MANDATORY Real-time Appointment Hook
 * Especializado para mudanças críticas de agendamentos healthcare
 */
export function useRealtimeAppointments(
  options: UseRealtimeAppointmentsOptions,
): UseRealtimeAppointmentsReturn {
  const {
    tenantId,
    patientId,
    professionalId,
    enabled = true,
    onAppointmentChange,
    onUrgentChange,
    onError,
    queryKey = ["appointments", tenantId],
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [totalUpdates, setTotalUpdates] = useState(0);
  const [urgentUpdates, setUrgentUpdates] = useState(0);
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);

  /**
   * Detect urgent appointment changes
   */
  const detectUrgentChange = useCallback(
    (payload: RealtimeAppointmentPayload): boolean => {
      const { eventType, new: newData, old: oldData } = payload;

      // Critical scenarios for healthcare
      if (eventType === "DELETE") {
        return true; // Appointment cancellation
      }

      if (eventType === "UPDATE" && newData && oldData) {
        // Status changes to cancelled
        if (newData.status === "cancelled" && oldData.status !== "cancelled") {
          return true;
        }
        // Urgent status changes
        if (newData.status === "confirmed" && oldData.status === "scheduled") {
          return true;
        }

        // Date/time changes within 24 hours
        const scheduledDate = new Date(newData.appointment_date);
        const now = new Date();
        const hoursDifference = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (
          hoursDifference <= 24
          && newData.appointment_date !== oldData.appointment_date
        ) {
          return true;
        }

        // Professional changes
        if (newData.professional_id !== oldData.professional_id) {
          return true;
        }
      }

      if (eventType === "INSERT" && newData) {
        // New confirmed appointments (urgent)
        if (newData.status === "confirmed") {
          return true;
        }

        // Same-day appointments
        const scheduledDate = new Date(newData.appointment_date);
        const today = new Date();
        if (scheduledDate.toDateString() === today.toDateString()) {
          return true;
        }
      }

      return false;
    },
    [],
  );

  /**
   * Update TanStack Query cache para appointments
   */
  const updateAppointmentCache = useCallback(
    (payload: RealtimeAppointmentPayload) => {
      const { eventType, new: newData, old: oldData } = payload;

      // Update appointments list cache
      queryClient.setQueryData(
        queryKey,
        (oldCache: AppointmentRow[] | undefined) => {
          if (!oldCache) {
            return oldCache;
          }

          switch (eventType) {
            case "INSERT": {
              if (newData && newData.clinic_id === tenantId) {
                // Insert em ordem cronológica
                const newCache = [...oldCache, newData];
                return newCache.sort(
                  (a, b) =>
                    new Date(a.appointment_date).getTime()
                    - new Date(b.appointment_date).getTime(),
                );
              }
              return oldCache;
            }

            case "UPDATE": {
              if (newData) {
                const updatedCache = oldCache.map((appointment) =>
                  appointment.id === newData.id ? newData : appointment
                );
                // Re-sort after update
                return updatedCache.sort(
                  (a, b) =>
                    new Date(a.appointment_date).getTime()
                    - new Date(b.appointment_date).getTime(),
                );
              }
              return oldCache;
            }

            case "DELETE": {
              if (oldData) {
                return oldCache.filter(
                  (appointment) => appointment.id !== oldData.id,
                );
              }
              return oldCache;
            }

            default: {
              return oldCache;
            }
          }
        },
      );

      // Update individual appointment cache
      if (newData) {
        queryClient.setQueryData(["appointment", newData.id], newData);
      } else if (oldData && eventType === "DELETE") {
        queryClient.removeQueries({ queryKey: ["appointment", oldData.id] });
      }

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["appointment-analytics", tenantId],
      });
      if (patientId) {
        queryClient.invalidateQueries({
          queryKey: ["patient-appointments", patientId],
        });
      }
      if (professionalId) {
        queryClient.invalidateQueries({
          queryKey: ["professional-schedule", professionalId],
        });
      }
    },
    [queryClient, queryKey, tenantId, patientId, professionalId],
  );

  /**
   * Handle realtime appointment changes com urgency detection
   */
  const handleAppointmentChange = useCallback(
    (payload: unknown) => {
      try {
        const typedPayload = payload as any;
        const realtimePayload: RealtimeAppointmentPayload = {
          eventType: typedPayload.eventType,
          new: typedPayload.new as AppointmentRow,
          old: typedPayload.old as AppointmentRow,
        };

        // Update metrics
        setLastUpdate(new Date());
        setTotalUpdates((prev) => prev + 1);

        // Detect urgent changes
        const isUrgent = detectUrgentChange(realtimePayload);
        if (isUrgent) {
          setUrgentUpdates((prev) => prev + 1);
          if (onUrgentChange) {
            onUrgentChange(realtimePayload);
          }
        }

        // Update TanStack Query cache
        updateAppointmentCache(realtimePayload);

        // Call user callback
        if (onAppointmentChange) {
          onAppointmentChange(realtimePayload);
        }
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [
      onAppointmentChange,
      onUrgentChange,
      onError,
      detectUrgentChange, // Update TanStack Query cache
      updateAppointmentCache,
    ],
  );

  /**
   * Subscribe to realtime appointment updates
   */
  const subscribe = useCallback(() => {
    if (!enabled || unsubscribeFn) {
      return;
    }

    const realtimeManager = getRealtimeManager();

    // Build filter based on options
    let filter = `tenant_id=eq.${tenantId}`;
    if (patientId) {
      filter += `,patient_id=eq.${patientId}`;
    }
    if (professionalId) {
      filter += `,professional_id=eq.${professionalId}`;
    }

    const unsubscribe = realtimeManager.subscribe(
      `appointments:${filter}`,
      {
        table: "appointments",
        filter,
      },
      handleAppointmentChange,
    );

    setUnsubscribeFn(() => unsubscribe);
  }, [
    enabled,
    tenantId,
    patientId,
    professionalId,
    handleAppointmentChange,
    unsubscribeFn,
  ]); /**
   * Unsubscribe from realtime appointment updates
   */

  const unsubscribe = useCallback(() => {
    if (unsubscribeFn) {
      unsubscribeFn();
      setUnsubscribeFn(null);
    }
  }, [unsubscribeFn]);

  /**
   * Monitor connection status and auto-subscribe
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
    urgentUpdates,
    subscribe,
    unsubscribe,
  };
}

/**
 * Hook para optimistic appointment updates
 * Critical para UX em mudanças de agendamentos
 */
export function useOptimisticAppointments(tenantId: string) {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    (appointmentId: string, updates: Partial<AppointmentRow>) => {
      // Update appointments list optimistically
      queryClient.setQueryData(
        ["appointments", tenantId],
        (oldCache: AppointmentRow[] | undefined) => {
          if (!oldCache) {
            return oldCache;
          }
          const updatedCache = oldCache.map((appointment) =>
            appointment.id === appointmentId
              ? { ...appointment, ...updates }
              : appointment
          );
          // Re-sort if date changed
          if (updates.appointment_date) {
            return updatedCache.sort(
              (a, b) =>
                new Date(a.appointment_date).getTime()
                - new Date(b.appointment_date).getTime(),
            );
          }
          return updatedCache;
        },
      );

      // Update individual appointment cache
      queryClient.setQueryData(
        ["appointment", appointmentId],
        (oldData: AppointmentRow | undefined) => {
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
    (appointmentId: string) => {
      // Invalidate caches to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["appointments", tenantId] });
      queryClient.invalidateQueries({
        queryKey: ["appointment", appointmentId],
      });
    },
    [queryClient, tenantId],
  );

  return {
    optimisticUpdate,
    rollbackUpdate,
  };
}
