'use client';

// Import our enhanced API client and helpers
import {
  ApiHelpers,
  type ApiResponse,
  apiClient,
} from '@neonpro/shared/api-client';
import {
  focusManager,
  MutationCache,
  onlineManager,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  defaultRealtimeConfig,
  useRealtimeQueryManager,
} from '@/lib/query/realtime-query-utils';
// Import Supabase client and realtime utilities
import { createClient } from '@/lib/supabase/client';
import { RealtimeProvider } from './realtime-provider';

// Import authentication hook (we'll create this in the next phase)
// import { useAuth } from '@/hooks/use-auth';

// Healthcare-specific query configurations
const HealthcareQueryConfig = {
  // Patient data - highly sensitive, shorter cache times
  patient: {
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 3, // 3 minutes
  },

  // Appointment data - medium sensitivity, moderate cache times
  appointment: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  },

  // Professional data - low sensitivity, longer cache times
  professional: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },

  // Service data - stable data, very long cache times
  service: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },

  // Audit/compliance data - read-only, moderate cache times
  audit: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  },

  // Default for other data
  default: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  },
};

// Query key factory for consistent key generation
export const QueryKeys = {
  // Authentication
  auth: {
    user: () => ['auth', 'user'],
    session: () => ['auth', 'session'],
    permissions: (userId: string) => ['auth', 'permissions', userId],
  },

  // Patients
  patients: {
    all: () => ['patients'],
    lists: () => [...QueryKeys.patients.all(), 'list'],
    list: (filters?: Record<string, unknown>) => [
      ...QueryKeys.patients.lists(),
      filters,
    ],
    details: () => [...QueryKeys.patients.all(), 'detail'],
    detail: (id: string) => [...QueryKeys.patients.details(), id],
    stats: () => [...QueryKeys.patients.all(), 'stats'],
  },

  // Appointments
  appointments: {
    all: () => ['appointments'],
    lists: () => [...QueryKeys.appointments.all(), 'list'],
    list: (filters?: Record<string, unknown>) => [
      ...QueryKeys.appointments.lists(),
      filters,
    ],
    details: () => [...QueryKeys.appointments.all(), 'detail'],
    detail: (id: string) => [...QueryKeys.appointments.details(), id],
    calendar: (date: string) => [
      ...QueryKeys.appointments.all(),
      'calendar',
      date,
    ],
    stats: () => [...QueryKeys.appointments.all(), 'stats'],
  },

  // Professionals
  professionals: {
    all: () => ['professionals'],
    lists: () => [...QueryKeys.professionals.all(), 'list'],
    list: (filters?: Record<string, unknown>) => [
      ...QueryKeys.professionals.lists(),
      filters,
    ],
    details: () => [...QueryKeys.professionals.all(), 'detail'],
    detail: (id: string) => [...QueryKeys.professionals.details(), id],
    schedule: (id: string, date: string) => [
      ...QueryKeys.professionals.detail(id),
      'schedule',
      date,
    ],
    stats: () => [...QueryKeys.professionals.all(), 'stats'],
  },

  // Services
  services: {
    all: () => ['services'],
    lists: () => [...QueryKeys.services.all(), 'list'],
    list: (filters?: Record<string, unknown>) => [
      ...QueryKeys.services.lists(),
      filters,
    ],
    details: () => [...QueryKeys.services.all(), 'detail'],
    detail: (id: string) => [...QueryKeys.services.details(), id],
    categories: () => [...QueryKeys.services.all(), 'categories'],
    stats: () => [...QueryKeys.services.all(), 'stats'],
  },

  // Compliance & Audit
  compliance: {
    all: () => ['compliance'],
    auditLogs: (filters?: Record<string, unknown>) => [
      ...QueryKeys.compliance.all(),
      'audit-logs',
      filters,
    ],
    consentRecords: (userId: string) => [
      ...QueryKeys.compliance.all(),
      'consent',
      userId,
    ],
    dataRequests: () => [...QueryKeys.compliance.all(), 'data-requests'],
    incidents: () => [...QueryKeys.compliance.all(), 'incidents'],
    reports: (period: string) => [
      ...QueryKeys.compliance.all(),
      'reports',
      period,
    ],
  },

  // Analytics
  analytics: {
    all: () => ['analytics'],
    dashboard: () => [...QueryKeys.analytics.all(), 'dashboard'],
    revenue: (period: string) => [
      ...QueryKeys.analytics.all(),
      'revenue',
      period,
    ],
    performance: (period: string) => [
      ...QueryKeys.analytics.all(),
      'performance',
      period,
    ],
  },
};

// Custom error handler for healthcare context
const handleQueryError = (error: unknown, query?: { queryKey: unknown[] }) => {
  const errorMessage = ApiHelpers.formatError(error);
  const queryKeyStr = query?.queryKey
    ? JSON.stringify(query.queryKey)
    : 'unknown';

  console.error(`Query error [${queryKeyStr}]:`, error);

  // Handle different types of errors appropriately
  if (ApiHelpers.isAuthError(error)) {
    // Don't show toast for auth errors - let auth system handle
    console.warn('Authentication error in query:', errorMessage);
    // Could trigger logout or token refresh here
    return;
  }

  if (ApiHelpers.isNetworkError(error)) {
    toast.error('Problema de conexão', {
      description: 'Verifique sua conexão com a internet e tente novamente.',
      action: {
        label: 'Tentar novamente',
        onClick: () => window.location.reload(),
      },
    });
    return;
  }

  if (ApiHelpers.isValidationError(error)) {
    toast.error('Dados inválidos', {
      description: errorMessage,
    });
    return;
  }

  if (ApiHelpers.isRateLimitError(error)) {
    toast.error('Muitas tentativas', {
      description: 'Aguarde alguns momentos antes de tentar novamente.',
    });
    return;
  }

  // Generic error
  toast.error('Erro interno', {
    description: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
  });
};

// Custom mutation success handler
const handleMutationSuccess = (
  data: unknown,
  variables: unknown,
  context: unknown,
  mutation?: { options?: { mutationKey?: unknown[] } }
) => {
  const mutationKeyStr = mutation?.options?.mutationKey
    ? JSON.stringify(mutation.options.mutationKey)
    : 'unknown';

  console.debug(`Mutation succeeded [${mutationKeyStr}]:`, { data, variables });

  // Extract success message if available
  const response = data as ApiResponse<unknown>;
  if (response?.success && response?.message) {
    toast.success(response.message);
  }
};

// Custom mutation error handler
const handleMutationError = (
  error: unknown,
  variables: unknown,
  context: unknown,
  mutation?: { options?: { mutationKey?: unknown[] } }
) => {
  const errorMessage = ApiHelpers.formatError(error);
  const mutationKeyStr = mutation?.options?.mutationKey
    ? JSON.stringify(mutation.options.mutationKey)
    : 'unknown';

  console.error(`Mutation error [${mutationKeyStr}]:`, { error, variables });

  // Handle different types of errors
  if (ApiHelpers.isAuthError(error)) {
    toast.error('Sessão expirada', {
      description: 'Faça login novamente para continuar.',
    });
    return;
  }

  if (ApiHelpers.isValidationError(error)) {
    toast.error('Dados inválidos', {
      description: errorMessage,
    });
    return;
  }

  if (ApiHelpers.isNetworkError(error)) {
    toast.error('Erro de conexão', {
      description: 'Verifique sua internet. A operação não foi concluída.',
    });
    return;
  }

  // Generic mutation error
  toast.error('Operação falhou', {
    description: errorMessage || 'Não foi possível completar a operação.',
  });
};

// Get query configuration based on query key
const getQueryConfig = (queryKey: readonly unknown[]) => {
  if (!queryKey || queryKey.length === 0) return HealthcareQueryConfig.default;

  const firstKey = String(queryKey[0]).toLowerCase();

  if (firstKey.includes('patient')) return HealthcareQueryConfig.patient;
  if (firstKey.includes('appointment'))
    return HealthcareQueryConfig.appointment;
  if (firstKey.includes('professional'))
    return HealthcareQueryConfig.professional;
  if (firstKey.includes('service')) return HealthcareQueryConfig.service;
  if (firstKey.includes('audit') || firstKey.includes('compliance'))
    return HealthcareQueryConfig.audit;

  return HealthcareQueryConfig.default;
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create query client with enhanced healthcare-specific configuration
  const [queryClient] = useState(() => {
    // Create custom query cache with error handling
    const queryCache = new QueryCache({
      onError: handleQueryError,
      onSuccess: (data, query) => {
        // Log successful queries for audit (in production, this could go to audit system)
        if (process.env.NODE_ENV === 'development') {
          console.debug(
            `Query succeeded [${JSON.stringify(query.queryKey)}]:`,
            data
          );
        }
      },
    });

    // Create custom mutation cache with error handling
    const mutationCache = new MutationCache({
      onError: handleMutationError,
      onSuccess: handleMutationSuccess,
    });

    return new QueryClient({
      queryCache,
      mutationCache,

      defaultOptions: {
        queries: {
          // Dynamic configuration based on query key
          staleTime: (query) => getQueryConfig(query.queryKey).staleTime,
          gcTime: (query) => getQueryConfig(query.queryKey).gcTime,

          // Refetch behavior optimized for healthcare apps
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
          refetchOnMount: true,

          // Enhanced retry logic with smart error handling
          retry: (failureCount, error, query) => {
            // Don't retry auth errors - let auth system handle
            if (ApiHelpers.isAuthError(error)) {
              return false;
            }

            // Don't retry validation errors (4xx except 401/403)
            if (ApiHelpers.isValidationError(error)) {
              return false;
            }

            // For patient data, be more conservative with retries
            const queryKeyStr = JSON.stringify(query.queryKey);
            if (queryKeyStr.includes('patient') && failureCount >= 1) {
              return false;
            }

            // Retry network errors more aggressively
            if (ApiHelpers.isNetworkError(error)) {
              return failureCount < 3;
            }

            // Don't retry rate limit errors immediately
            if (ApiHelpers.isRateLimitError(error)) {
              return failureCount < 1; // Only retry once after a delay
            }

            // Default retry for server errors
            return failureCount < 2;
          },

          // Enhanced retry delay with healthcare-specific considerations
          retryDelay: (attemptIndex, error) => {
            // Longer delay for rate limit errors
            if (ApiHelpers.isRateLimitError(error)) {
              return Math.min(5000 * 2 ** attemptIndex, 60_000); // 5s, 10s, 20s, up to 60s
            }

            // Standard exponential backoff for other errors
            return Math.min(1000 * 2 ** attemptIndex, 30_000); // 1s, 2s, 4s, up to 30s
          },

          // Network mode handling for offline scenarios
          networkMode: 'online',

          // Placeholder function handling
          placeholderData: undefined,

          // Select function for data transformation
          select: undefined,
        },

        mutations: {
          // Don't retry mutations by default (user should decide)
          retry: false,

          // Network mode for mutations
          networkMode: 'online',

          // Use error boundaries for critical mutations
          useErrorBoundary: false,
        },
      },
    });
  });

  // Setup online/offline detection
  useEffect(() => {
    // Enhanced online/offline detection
    const handleOnline = () => {
      console.log('Connection restored');
      toast.success('Conexão restaurada', {
        description: 'Sincronizando dados...',
      });
      onlineManager.setOnline(true);
    };

    const handleOffline = () => {
      console.log('Connection lost');
      toast.warning('Sem conexão', {
        description: 'Alguns recursos podem estar limitados.',
        duration: 5000,
      });
      onlineManager.setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Setup focus management for better UX
  useEffect(() => {
    const handleVisibilityChange = () => {
      focusManager.setFocused(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Cleanup function for when component unmounts
  useEffect(() => {
    return () => {
      // Clear any sensitive data from query cache on unmount
      queryClient.removeQueries({
        predicate: (query) => {
          const queryKeyStr = JSON.stringify(query.queryKey);
          return (
            queryKeyStr.includes('patient') ||
            queryKeyStr.includes('appointment') ||
            queryKeyStr.includes('auth')
          );
        },
      });
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider config={defaultRealtimeConfig}>
        {children}
      </RealtimeProvider>

      {/* React Query Devtools - enhanced for healthcare development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          closeButtonProps={{
            style: {
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
            },
          }}
          initialIsOpen={false}
          panelProps={{
            style: {
              fontSize: '13px',
              maxHeight: '60vh',
            },
          }}
          position="bottom-right"
          toggleButtonProps={{
            style: {
              marginLeft: '5px',
              transform: 'scale(0.9)',
              transformOrigin: 'bottom right',
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
          }}
        />
      )}
    </QueryClientProvider>
  );
}

// Export query keys and utilities for use in hooks
export { HealthcareQueryConfig };

// Export utility functions for advanced usage
export const QueryUtils = {
  // Invalidate all patient data
  invalidatePatientData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.patients.all() });
  },
  
  // Invalidate all appointment data
  invalidateAppointmentData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.appointments.all() });
  },
  
  // Clear sensitive data (for logout)
  clearSensitiveData: (queryClient: QueryClient) => {
    queryClient.removeQueries({
      predicate: (query) => {
        const queryKeyStr = JSON.stringify(query.queryKey);
        return queryKeyStr.includes('patient') || 
               queryKeyStr.includes('appointment') ||
               queryKeyStr.includes('auth') ||
               queryKeyStr.includes('compliance');
      }
    });
  },
  
  // Prefetch critical data for better UX
  prefetchCriticalData: async (queryClient: QueryClient) => {
    // Only prefetch if user is authenticated
    if (apiClient.auth.isAuthenticated()) {
      try {
        // Prefetch user data
        await queryClient.prefetchQuery({
          queryKey: QueryKeys.auth.user(),
          staleTime: HealthcareQueryConfig.default.staleTime,
        });
        
        // Prefetch today's appointments if user has permission
        const today = new Date().toISOString().split('T')[0];
        await queryClient.prefetchQuery({
          queryKey: QueryKeys.appointments.calendar(today),
          staleTime: HealthcareQueryConfig.appointment.staleTime,
        });
      } catch (error) {
        console.warn('Failed to prefetch critical data:', error);
      }
    }
  },
  
  // Get query config for a specific query key
  getQueryConfig,
  
  // Helper to create optimistic updates
  createOptimisticUpdate: function<T>(
    queryKey: readonly unknown[],
    updateFn: (oldData: T | undefined) => T
  ) {
    return {
      queryKey,
      updater: updateFn
    };
  },
};
