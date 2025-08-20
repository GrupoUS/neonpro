/**
 * 🔄 Real-time Query Utilities - NeonPro Healthcare
 * =================================================
 *
 * Enhanced TanStack Query utilities with real-time integration
 * Combines server state management with live data updates
 */

import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect } from 'react';
import { 
  usePatientRealtime, 
  useAppointmentRealtime, 
  useProfessionalRealtime,
  useDashboardRealtime,
} from '@neonpro/shared/hooks/use-healthcare-realtime';

// Enhanced query invalidation strategies
export type InvalidationStrategy = {
  immediate?: boolean;
  debounced?: boolean;
  debounceMs?: number;
  background?: boolean;
  optimistic?: boolean;
};

// Real-time query configuration
export interface RealtimeQueryConfig {
  enabled: boolean;
  invalidationStrategy: InvalidationStrategy;
  lgpdCompliance: boolean;
  auditLogging: boolean;
}

/**
 * Enhanced query client utilities for real-time integration
 */
export class RealtimeQueryManager {
  private queryClient: QueryClient;
  private supabaseClient: SupabaseClient;
  private debounceTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(queryClient: QueryClient, supabaseClient: SupabaseClient) {
    this.queryClient = queryClient;
    this.supabaseClient = supabaseClient;
  }

  /**
   * Smart invalidation with debouncing and strategies
   */
  invalidateWithStrategy(
    queryKey: string[],
    strategy: InvalidationStrategy = { immediate: true }
  ) {
    const key = queryKey.join(':');

    if (strategy.debounced && strategy.debounceMs) {
      // Clear existing timeout
      const existingTimeout = this.debounceTimeouts.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new debounced invalidation
      const timeout = setTimeout(() => {
        this.executeInvalidation(queryKey, strategy);
        this.debounceTimeouts.delete(key);
      }, strategy.debounceMs);

      this.debounceTimeouts.set(key, timeout);
    } else {
      this.executeInvalidation(queryKey, strategy);
    }
  }

  private executeInvalidation(queryKey: string[], strategy: InvalidationStrategy) {
    if (strategy.immediate) {
      this.queryClient.invalidateQueries({ queryKey });
    }

    if (strategy.background) {
      this.queryClient.refetchQueries({ queryKey, type: 'active' });
    }

    if (strategy.optimistic) {
      // Optimistic updates can be handled here
      // For now, we'll just ensure the query is marked as stale
      this.queryClient.setQueryData(queryKey, (oldData) => {
        if (oldData && typeof oldData === 'object') {
          return { ...oldData, _realtimeUpdate: Date.now() };
        }
        return oldData;
      });
    }
  }

  /**
   * Cleanup debounced timeouts
   */
  cleanup() {
    this.debounceTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.debounceTimeouts.clear();
  }
}

/**
 * Hook for managing real-time query invalidation
 */
export function useRealtimeQueryManager(supabaseClient: SupabaseClient) {
  const queryClient = useQueryClient();

  const manager = new RealtimeQueryManager(queryClient, supabaseClient);

  useEffect(() => {
    return () => {
      manager.cleanup();
    };
  }, [manager]);

  return manager;
}

/**
 * Enhanced patient queries with real-time integration
 */
export function useRealtimePatients(
  supabaseClient: SupabaseClient,
  options: {
    patientId?: string;
    clinicId?: string;
    config?: RealtimeQueryConfig;
  }
) {
  const manager = useRealtimeQueryManager(supabaseClient);

  const handlePatientUpdate = useCallback((patient: any) => {
    const strategy: InvalidationStrategy = {
      immediate: options.config?.invalidationStrategy?.immediate ?? true,
      debounced: options.config?.invalidationStrategy?.debounced ?? false,
      debounceMs: options.config?.invalidationStrategy?.debounceMs ?? 500,
      background: options.config?.invalidationStrategy?.background ?? true,
    };

    // Invalidate related queries
    manager.invalidateWithStrategy(['patients'], strategy);
    
    if (options.patientId) {
      manager.invalidateWithStrategy(['patients', options.patientId], strategy);
    }
    
    if (options.clinicId) {
      manager.invalidateWithStrategy(['patients', 'by-clinic', options.clinicId], strategy);
    }

    // Also invalidate dashboard metrics that depend on patient data
    manager.invalidateWithStrategy(['dashboard', 'metrics'], strategy);
    
    // Invalidate appointments for this patient
    if (patient?.id) {
      manager.invalidateWithStrategy(['appointments', 'by-patient', patient.id], strategy);
    }
  }, [manager, options.patientId, options.clinicId, options.config]);

  const realtime = usePatientRealtime(supabaseClient, {
    patientId: options.patientId,
    clinicId: options.clinicId,
    enabled: options.config?.enabled ?? true,
    onPatientUpdate: handlePatientUpdate,
  });

  return {
    realtime,
    manager,
  };
}

/**
 * Enhanced appointment queries with real-time integration
 */
export function useRealtimeAppointments(
  supabaseClient: SupabaseClient,
  options: {
    appointmentId?: string;
    patientId?: string;
    professionalId?: string;
    clinicId?: string;
    dateRange?: { start: string; end: string };
    config?: RealtimeQueryConfig;
  }
) {
  const manager = useRealtimeQueryManager(supabaseClient);

  const handleAppointmentUpdate = useCallback((appointment: any) => {
    const strategy: InvalidationStrategy = {
      immediate: options.config?.invalidationStrategy?.immediate ?? true,
      debounced: options.config?.invalidationStrategy?.debounced ?? true,
      debounceMs: options.config?.invalidationStrategy?.debounceMs ?? 300,
      background: options.config?.invalidationStrategy?.background ?? true,
    };

    // Invalidate appointment queries
    manager.invalidateWithStrategy(['appointments'], strategy);
    
    if (options.appointmentId) {
      manager.invalidateWithStrategy(['appointments', options.appointmentId], strategy);
    }
    
    if (options.patientId) {
      manager.invalidateWithStrategy(['appointments', 'by-patient', options.patientId], strategy);
    }
    
    if (options.professionalId) {
      manager.invalidateWithStrategy(['appointments', 'by-professional', options.professionalId], strategy);
    }

    // Update calendar/schedule views
    manager.invalidateWithStrategy(['schedule'], strategy);
    manager.invalidateWithStrategy(['calendar'], strategy);
    
    // Update dashboard metrics
    manager.invalidateWithStrategy(['dashboard', 'appointments'], strategy);
  }, [manager, options, options.config]);

  const realtime = useAppointmentRealtime(supabaseClient, {
    appointmentId: options.appointmentId,
    patientId: options.patientId,
    professionalId: options.professionalId,
    clinicId: options.clinicId,
    dateRange: options.dateRange,
    enabled: options.config?.enabled ?? true,
    onAppointmentUpdate: handleAppointmentUpdate,
  });

  return {
    realtime,
    manager,
  };
}

/**
 * Enhanced professional queries with real-time integration
 */
export function useRealtimeProfessionals(
  supabaseClient: SupabaseClient,
  options: {
    professionalId?: string;
    clinicId?: string;
    specialty?: string;
    config?: RealtimeQueryConfig;
  }
) {
  const manager = useRealtimeQueryManager(supabaseClient);

  const handleProfessionalUpdate = useCallback((professional: any) => {
    const strategy: InvalidationStrategy = {
      immediate: options.config?.invalidationStrategy?.immediate ?? true,
      debounced: options.config?.invalidationStrategy?.debounced ?? false,
      background: options.config?.invalidationStrategy?.background ?? true,
    };

    // Invalidate professional queries
    manager.invalidateWithStrategy(['professionals'], strategy);
    
    if (options.professionalId) {
      manager.invalidateWithStrategy(['professionals', options.professionalId], strategy);
    }
    
    if (options.clinicId) {
      manager.invalidateWithStrategy(['professionals', 'by-clinic', options.clinicId], strategy);
    }
    
    if (options.specialty) {
      manager.invalidateWithStrategy(['professionals', 'by-specialty', options.specialty], strategy);
    }

    // Update related appointment availability
    manager.invalidateWithStrategy(['appointments', 'availability'], strategy);
    
    // Update dashboard metrics
    manager.invalidateWithStrategy(['dashboard', 'professionals'], strategy);
  }, [manager, options, options.config]);

  const realtime = useProfessionalRealtime(supabaseClient, {
    professionalId: options.professionalId,
    clinicId: options.clinicId,
    specialty: options.specialty,
    enabled: options.config?.enabled ?? true,
    onProfessionalUpdate: handleProfessionalUpdate,
  });

  return {
    realtime,
    manager,
  };
}

/**
 * Enhanced dashboard queries with comprehensive real-time integration
 */
export function useRealtimeDashboard(
  supabaseClient: SupabaseClient,
  options: {
    clinicId?: string;
    config?: RealtimeQueryConfig;
  }
) {
  const manager = useRealtimeQueryManager(supabaseClient);

  const handleDashboardUpdate = useCallback((data: any) => {
    const strategy: InvalidationStrategy = {
      immediate: false, // Dashboard updates can be less aggressive
      debounced: true,
      debounceMs: 1000, // 1 second debounce for dashboard
      background: true,
    };

    // Invalidate all dashboard-related queries
    manager.invalidateWithStrategy(['dashboard'], strategy);
    manager.invalidateWithStrategy(['dashboard', 'metrics'], strategy);
    manager.invalidateWithStrategy(['dashboard', 'analytics'], strategy);
    
    if (options.clinicId) {
      manager.invalidateWithStrategy(['dashboard', 'clinic', options.clinicId], strategy);
    }
  }, [manager, options.clinicId, options.config]);

  const realtime = useDashboardRealtime(supabaseClient, {
    clinicId: options.clinicId,
    enabled: options.config?.enabled ?? true,
    onMetricsUpdate: handleDashboardUpdate,
  });

  return {
    realtime,
    manager,
  };
}

/**
 * Default real-time configuration for healthcare applications
 */
export const defaultRealtimeConfig: RealtimeQueryConfig = {
  enabled: true,
  invalidationStrategy: {
    immediate: true,
    debounced: true,
    debounceMs: 500,
    background: true,
    optimistic: false,
  },
  lgpdCompliance: true,
  auditLogging: true,
};