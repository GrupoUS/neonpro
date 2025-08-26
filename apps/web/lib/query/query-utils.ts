/**
 * 🎨 TanStack Query Utilities - NeonPro Healthcare
 * ================================================
 *
 * Utility functions, custom hooks, and helpers for TanStack Query
 * optimized for healthcare data management with LGPD compliance.
 */

// Import our enhanced API client and schemas
import { apiClient, ApiHelpers } from '@neonpro/shared/api-client';
import type { ApiClient, ApiResponse } from '@neonpro/shared/api-client';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData, QueryClient, QueryKey, UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { toast } from "sonner";
// Import query keys and config from provider
import { HealthcareQueryConfig, QueryKeys } from "@/providers/query-provider";

// Types for paginated responses
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  summary?: Record<string, unknown>;
}

// Generic query options with healthcare-specific defaults
export interface HealthcareQueryOptions<TData, TError = unknown>
  extends Omit<
    UseQueryOptions<ApiResponse<TData>, TError, TData>,
    "queryKey" | "queryFn"
  > {
  // Healthcare-specific options
  enableAuditLogging?: boolean;
  sensitiveData?: boolean;
  lgpdCompliant?: boolean;
}

// Generic mutation options with healthcare-specific features
export interface HealthcareMutationOptions<
  TData,
  TError,
  TVariables,
  TContext = unknown,
> extends Omit<
    UseMutationOptions<ApiResponse<TData>, TError, TVariables, TContext>,
    "mutationFn"
  > {
  // Healthcare-specific options
  enableAuditLogging?: boolean;
  requiresConsent?: boolean;
  lgpdCompliant?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;

  // Custom success message
  successMessage?: string;

  // Data invalidation patterns
  invalidateQueries?: QueryKey[];
  refetchQueries?: QueryKey[];
}

// Query utility class with healthcare-specific methods
export class HealthcareQueryUtils {
  private readonly queryClient: QueryClient;
  private readonly apiClient: ApiClient;

  constructor(queryClient: QueryClient, apiClient: ApiClient) {
    this.queryClient = queryClient;
    this.apiClient = apiClient;
  }

  // Generic query wrapper with validation and audit logging
  createQuery<TData>({
    queryKey,
    queryFn,
    validator,
    enableAuditLogging = true,
    sensitiveData = false,
    lgpdCompliant = true,
    ...options
  }: {
    queryKey: QueryKey;
    queryFn: () => Promise<ApiResponse<TData>>;
    validator?: (data: unknown) => TData;
    enableAuditLogging?: boolean;
    sensitiveData?: boolean;
    lgpdCompliant?: boolean;
  } & Omit<
    UseQueryOptions<ApiResponse<TData>, unknown, TData>,
    "queryKey" | "queryFn"
  >) {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const startTime = Date.now();

        try {
          const response = await queryFn();

          // Validate response if validator provided
          if (validator && response.data) {
            response.data = validator(response.data);
          }

          // Audit logging for sensitive data
          if (enableAuditLogging && sensitiveData) {
            this.apiClient.audit.log({
              timestamp: new Date().toISOString(),
              userId: this.apiClient.auth.getUser()?.id,
              sessionId: this.apiClient.auth.getSessionId() || undefined,
              action: "read",
              resource_type: String(queryKey[0]),
              ip_address: this.apiClient.utils.getClientIP(),
              user_agent: this.apiClient.utils.getUserAgent(),
              success: response.success,
              request_duration: Date.now() - startTime,
            });
          }

          if (!response.success) {
            throw new Error(response.message || "Query failed");
          }

          return response.data!;
        } catch (error) {
          // Audit logging for failed queries on sensitive data
          if (enableAuditLogging && sensitiveData) {
            this.apiClient.audit.log({
              timestamp: new Date().toISOString(),
              userId: this.apiClient.auth.getUser()?.id,
              sessionId: this.apiClient.auth.getSessionId() || undefined,
              action: "read",
              resource_type: String(queryKey[0]),
              ip_address: this.apiClient.utils.getClientIP(),
              user_agent: this.apiClient.utils.getUserAgent(),
              success: false,
              error_message:
                error instanceof Error ? error.message : "Unknown error",
              request_duration: Date.now() - startTime,
            });
          }

          throw error;
        }
      },

      // Apply healthcare-specific configuration based on data type
      staleTime: this.getQueryConfig(queryKey).staleTime,
      // Enhanced options
      ...options,

      // LGPD compliance: automatic cleanup for sensitive data
      gcTime: sensitiveData
        ? Math.min(options.gcTime || 0, HealthcareQueryConfig.patient.gcTime)
        : options.gcTime || this.getQueryConfig(queryKey).gcTime,
    });
  }

  // Generic mutation wrapper with validation and audit logging
  createMutation<TData, TVariables>({
    mutationFn,
    validator,
    enableAuditLogging = true,
    requiresConsent = false,
    lgpdCompliant = true,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage,
    invalidateQueries = [],
    refetchQueries = [],
    ...options
  }: {
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>;
    validator?: (data: unknown) => TData;
  } & HealthcareMutationOptions<TData, unknown, TVariables>) {
    return useMutation({
      mutationFn: async (variables: TVariables) => {
        const startTime = Date.now();

        // Check consent requirement
        if (requiresConsent && lgpdCompliant) {
          const user = this.apiClient.auth.getUser();
          if (!user?.lgpd_consent_date) {
            throw new Error("LGPD consent required for this operation");
          }
        }

        try {
          const response = await mutationFn(variables);

          // Validate response if validator provided
          if (validator && response.data) {
            response.data = validator(response.data);
          }

          // Audit logging
          if (enableAuditLogging) {
            this.apiClient.audit.log({
              timestamp: new Date().toISOString(),
              userId: this.apiClient.auth.getUser()?.id,
              sessionId: this.apiClient.auth.getSessionId() || undefined,
              action: "create", // This could be determined from mutation key
              resource_type: "mutation",
              ip_address: this.apiClient.utils.getClientIP(),
              user_agent: this.apiClient.utils.getUserAgent(),
              success: response.success,
              request_duration: Date.now() - startTime,
            });
          }

          if (!response.success) {
            throw new Error(response.message || "Mutation failed");
          }

          return response;
        } catch (error) {
          // Audit logging for failed mutations
          if (enableAuditLogging) {
            this.apiClient.audit.log({
              timestamp: new Date().toISOString(),
              userId: this.apiClient.auth.getUser()?.id,
              sessionId: this.apiClient.auth.getSessionId() || undefined,
              action: "create",
              resource_type: "mutation",
              ip_address: this.apiClient.utils.getClientIP(),
              user_agent: this.apiClient.utils.getUserAgent(),
              success: false,
              error_message:
                error instanceof Error ? error.message : "Unknown error",
              request_duration: Date.now() - startTime,
            });
          }

          throw error;
        }
      },

      onSuccess: (data, variables, context) => {
        // Show success toast
        if (showSuccessToast) {
          toast.success(
            successMessage || data.message || "Operação realizada com sucesso",
          );
        }

        // Invalidate specified queries
        invalidateQueries.forEach((queryKey) => {
          this.queryClient.invalidateQueries({ queryKey });
        });

        // Refetch specified queries
        refetchQueries.forEach((queryKey) => {
          this.queryClient.refetchQueries({ queryKey });
        });

        // Call custom onSuccess
        options.onSuccess?.(data, variables, context);
      },

      onError: (error, variables, context) => {
        // Show error toast
        if (showErrorToast) {
          const errorMessage = ApiHelpers.formatError(error);
          toast.error("Erro na operação", {
            description: errorMessage,
          });
        }

        // Call custom onError
        options.onError?.(error, variables, context);
      },

      ...options,
    });
  }

  // Create infinite query for paginated data
  createInfiniteQuery<TData>({
    queryKey,
    queryFn,
    validator,
    enableAuditLogging = true,
    ...options
  }: {
    queryKey: QueryKey;
    queryFn: ({
      pageParam,
    }: {
      pageParam: number;
    }) => Promise<ApiResponse<PaginatedResponse<TData>>>;
    validator?: (data: unknown) => TData[];
  } & Omit<
    UseInfiniteQueryOptions<
      ApiResponse<PaginatedResponse<TData>>,
      unknown,
      InfiniteData<TData[]>
    >,
    "queryKey" | "queryFn" | "getNextPageParam"
  >) {
    return useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam = 1 }) => {
        const startTime = Date.now();

        try {
          const response = await queryFn({ pageParam });

          // Validate response if validator provided
          if (validator && response.data?.items) {
            response.data.items = response.data.items.map((item) =>
              validator(item),
            );
          }

          // Audit logging
          if (enableAuditLogging) {
            this.apiClient.audit.log({
              timestamp: new Date().toISOString(),
              userId: this.apiClient.auth.getUser()?.id,
              sessionId: this.apiClient.auth.getSessionId() || undefined,
              action: "read",
              resource_type: `${String(queryKey[0])}_paginated`,
              ip_address: this.apiClient.utils.getClientIP(),
              user_agent: this.apiClient.utils.getUserAgent(),
              success: response.success,
              request_duration: Date.now() - startTime,
            });
          }

          if (!response.success) {
            throw new Error(response.message || "Infinite query failed");
          }

          return response.data?.items;
        } catch (error) {
          if (enableAuditLogging) {
            this.apiClient.audit.log({
              timestamp: new Date().toISOString(),
              userId: this.apiClient.auth.getUser()?.id,
              sessionId: this.apiClient.auth.getSessionId() || undefined,
              action: "read",
              resource_type: `${String(queryKey[0])}_paginated`,
              ip_address: this.apiClient.utils.getClientIP(),
              user_agent: this.apiClient.utils.getUserAgent(),
              success: false,
              error_message:
                error instanceof Error ? error.message : "Unknown error",
              request_duration: Date.now() - startTime,
            });
          }

          throw error;
        }
      },

      getNextPageParam: (lastPage, _allPages, lastPageParam) => {
        // This would be implemented based on your pagination response structure
        // For now, assuming the response tells us if there's a next page
        return lastPage && lastPage.length > 0 ? lastPageParam + 1 : undefined;
      },

      initialPageParam: 1,

      // Apply configuration
      staleTime: this.getQueryConfig(queryKey).staleTime,
      gcTime: this.getQueryConfig(queryKey).gcTime,

      ...options,
    });
  }

  // Optimistic update helper
  createOptimisticUpdate<T>(
    queryKey: QueryKey,
    updateFn: (oldData: T | undefined) => T,
    rollbackFn?: (error: unknown, variables: unknown, context: unknown) => void,
  ) {
    return {
      onMutate: async (_variables: unknown) => {
        // Cancel outgoing refetches
        await this.queryClient.cancelQueries({ queryKey });

        // Snapshot previous value
        const previousData = this.queryClient.getQueryData<T>(queryKey);

        // Optimistically update
        this.queryClient.setQueryData<T>(queryKey, updateFn);

        // Return context with snapshot
        return { previousData };
      },

      onError: (
        error: unknown,
        variables: unknown,
        context: { previousData?: T },
      ) => {
        // Rollback on error
        if (context?.previousData) {
          this.queryClient.setQueryData<T>(queryKey, context.previousData);
        }

        // Call custom rollback
        rollbackFn?.(error, variables, context);
      },

      onSettled: () => {
        // Refetch after mutation
        this.queryClient.invalidateQueries({ queryKey });
      },
    };
  }

  // Get query configuration based on query key
  private getQueryConfig(queryKey: QueryKey) {
    if (!queryKey || queryKey.length === 0) {
      return HealthcareQueryConfig.default;
    }

    const firstKey = String(queryKey[0]).toLowerCase();

    if (firstKey.includes("patient")) {
      return HealthcareQueryConfig.patient;
    }
    if (firstKey.includes("appointment")) {
      return HealthcareQueryConfig.appointment;
    }
    if (firstKey.includes("professional")) {
      return HealthcareQueryConfig.professional;
    }
    if (firstKey.includes("service")) {
      return HealthcareQueryConfig.service;
    }
    if (firstKey.includes("audit") || firstKey.includes("compliance")) {
      return HealthcareQueryConfig.audit;
    }

    return HealthcareQueryConfig.default;
  }

  // LGPD compliance utilities
  clearSensitiveUserData(userId: string) {
    // Clear all queries related to specific user
    this.queryClient.removeQueries({
      predicate: (query) => {
        const queryKeyStr = JSON.stringify(query.queryKey);
        return queryKeyStr.includes(userId);
      },
    });
  }

  // Data export utilities for LGPD compliance
  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const userData: Record<string, unknown> = {
      userId,
      exportedAt: new Date().toISOString(),
      data: {},
    };

    // Extract cached data for the user
    this.queryClient
      .getQueriesData({
        predicate: (query) => {
          const queryKeyStr = JSON.stringify(query.queryKey);
          return queryKeyStr.includes(userId);
        },
      })
      .forEach(([queryKey, data]) => {
        userData[JSON.stringify(queryKey)] = data;
      });

    return userData;
  }

  // Audit log retrieval
  getAuditLogs() {
    return this.apiClient.audit.getLogs();
  }

  // Clear all audit logs (for testing or privacy)
  clearAuditLogs() {
    this.apiClient.audit.clearLogs();
  }
}

// Custom hook to access healthcare query utils
export function useHealthcareQueryUtils() {
  const queryClient = useQueryClient();
  return new HealthcareQueryUtils(queryClient, apiClient);
}

// Query invalidation helpers
export const InvalidationHelpers = {
  // Patient-related invalidations
  invalidatePatientData: (queryClient: QueryClient, patientId?: string) => {
    if (patientId) {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.patients.detail(patientId),
      });
    } else {
      queryClient.invalidateQueries({ queryKey: QueryKeys.patients.all() });
    }
  },

  // Appointment-related invalidations
  invalidateAppointmentData: (
    queryClient: QueryClient,
    appointmentId?: string,
  ) => {
    if (appointmentId) {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.appointments.detail(appointmentId),
      });
    } else {
      queryClient.invalidateQueries({ queryKey: QueryKeys.appointments.all() });
    }
  },

  // Professional-related invalidations
  invalidateProfessionalData: (
    queryClient: QueryClient,
    professionalId?: string,
  ) => {
    if (professionalId) {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.professionals.detail(professionalId),
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.professionals.all(),
      });
    }
  },

  // Service-related invalidations
  invalidateServiceData: (queryClient: QueryClient, serviceId?: string) => {
    if (serviceId) {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.services.detail(serviceId),
      });
    } else {
      queryClient.invalidateQueries({ queryKey: QueryKeys.services.all() });
    }
  },

  // Invalidate all dashboard data
  invalidateDashboardData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.analytics.all() });
  },
};

// Cache warming helpers
export const CacheWarming = {
  // Prefetch today's appointments
  prefetchTodayAppointments: async (queryClient: QueryClient) => {
    const today = new Date().toISOString().split("T")[0];
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.appointments.calendar(today),
      staleTime: HealthcareQueryConfig.appointment.staleTime,
    });
  },

  // Prefetch user's patients
  prefetchUserPatients: async (queryClient: QueryClient, userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.patients.list({ professional_id: userId }),
      staleTime: HealthcareQueryConfig.patient.staleTime,
    });
  },

  // Prefetch services for a clinic
  prefetchClinicServices: async (
    queryClient: QueryClient,
    clinicId: string,
  ) => {
    await queryClient.prefetchQuery({
      queryKey: QueryKeys.services.list({ clinic_id: clinicId }),
      staleTime: HealthcareQueryConfig.service.staleTime,
    });
  },
};

// Export everything for use in hooks
export {
  type HealthcareMutationOptions,
  HealthcareQueryConfig,
  type HealthcareQueryOptions,
  type PaginatedResponse,
  QueryKeys,
};
