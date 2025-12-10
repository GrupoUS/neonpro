/**
 * TanStack Query Client Configuration
 * Optimized for healthcare applications with LGPD compliance
 */

import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Global Query Client Configuration
 * Configured for healthcare data with appropriate stale times and retry logic
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Healthcare data should be fresh but not too aggressive
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)

      // Retry configuration for healthcare reliability
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for 5xx errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for real-time healthcare data
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,

      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once on network errors
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',

      // Global mutation error handler
      onError: (error: any) => {
        const message = error?.message || 'Ocorreu um erro ao processar sua solicitação';
        toast.error(message);
        console.error('Mutation error:', error);
      },
    },
  },
});

/**
 * Setup global query error handling
 * Handles authentication errors, network errors, and healthcare-specific errors
 */
export function setupQueryErrorHandling() {
  // Global error handler for queries
  queryClient.getQueryCache().config.onError = (error: any, query) => {
    // Don't show errors for background refetches
    if (query.state.data !== undefined) {
      return;
    }

    // Authentication errors
    if (error?.status === 401 || error?.message?.includes('JWT')) {
      toast.error('Sessão expirada. Por favor, faça login novamente.', {
        duration: 5000,
      });
      // Redirect to login or clear auth state
      window.location.href = '/login';
      return;
    }

    // Network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      toast.error('Erro de conexão. Verifique sua internet.', {
        duration: 4000,
      });
      return;
    }

    // LGPD / Permission errors
    if (error?.status === 403) {
      toast.error('Você não tem permissão para acessar esses dados.', {
        duration: 4000,
      });
      return;
    }

    // Healthcare-specific: RLS policy violations
    if (error?.message?.includes('RLS') || error?.message?.includes('policy')) {
      toast.error('Acesso negado: dados protegidos por política de segurança.', {
        duration: 5000,
      });
      console.error('RLS Policy Violation:', error);
      return;
    }

    // Generic error
    const message = error?.message || 'Erro ao carregar dados';
    toast.error(message, {
      duration: 3000,
    });
    console.error('Query error:', error);
  };

  // Setup mutation error cache
  queryClient.getMutationCache().config.onError = (error: any) => {
    // Already handled in mutation defaultOptions
    console.error('Mutation cache error:', error);
  };
}

/**
 * Healthcare-specific query invalidation helpers
 */
export const invalidateHealthcareQueries = {
  patients: () => queryClient.invalidateQueries({ queryKey: ['healthcare', 'patients'] }),
  patient: (id: string) => queryClient.invalidateQueries({ queryKey: ['healthcare', 'patients', id] }),
  appointments: () => queryClient.invalidateQueries({ queryKey: ['healthcare', 'appointments'] }),
  appointment: (id: string) => queryClient.invalidateQueries({ queryKey: ['healthcare', 'appointments', id] }),
  procedures: () => queryClient.invalidateQueries({ queryKey: ['healthcare', 'procedures'] }),
  auditLogs: () => queryClient.invalidateQueries({ queryKey: ['healthcare', 'audit-logs'] }),
  all: () => queryClient.invalidateQueries({ queryKey: ['healthcare'] }),
};

/**
 * Prefetch helper for healthcare routes
 */
export const prefetchHealthcareData = {
  patients: async () => {
    // Implementation would call the actual API
    console.log('Prefetching patients data...');
  },
  appointments: async () => {
    console.log('Prefetching appointments data...');
  },
};
