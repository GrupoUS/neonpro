/**
 * 🔗 API Hooks Export Index - NeonPro Healthcare
 * ===============================================
 *
 * Centralização de exports para todos os hooks da API
 * com TanStack Query e Hono RPC integration.
 */

// Appointment hooks
export * from "./useAppointments";
export {
  APPOINTMENT_QUERY_KEYS,
  useAppointment,
  useAppointments,
  useAppointmentStats,
  useAppointmentUtils,
  useAvailability,
  useCalendarAppointments,
  useCancelAppointment,
  useCreateAppointment,
  useRescheduleAppointment,
  useUpdateAppointment,
} from "./useAppointments";
// Authentication hooks
export * from "./useAuth";
export {
  AUTH_QUERY_KEYS,
  useAuthStatus,
  useAuthUtils,
  useChangePassword,
  useForgotPassword,
  useLogin,
  useLogout,
  useProfile,
  useRefreshToken,
  useRegister,
  useResetPassword,
} from "./useAuth";
// Patient hooks
export * from "./usePatients";
export {
  PATIENT_QUERY_KEYS,
  useCreatePatient,
  useDeletePatient,
  useExportPatients,
  usePatient,
  usePatients,
  usePatientsInfinite,
  usePatientsStats,
  usePatientUtils,
  useSearchPatients,
  useUpdatePatient,
} from "./usePatients";

// Common query key patterns for easy invalidation
export const ALL_QUERY_KEYS = {
  auth: AUTH_QUERY_KEYS,
  patients: PATIENT_QUERY_KEYS,
  appointments: APPOINTMENT_QUERY_KEYS,
} as const;

// Utility functions for working with multiple hooks
export const queryUtils = {
  // Invalidate all data (useful for logout or major updates)
  invalidateAll: (queryClient: any) => {
    queryClient.invalidateQueries();
  },

  // Invalidate specific domain data
  invalidateAuth: (queryClient: any) => {
    queryClient.invalidateQueries({
      queryKey: AUTH_QUERY_KEYS.all,
    });
  },

  invalidatePatients: (queryClient: any) => {
    queryClient.invalidateQueries({
      queryKey: PATIENT_QUERY_KEYS.all,
    });
  },

  invalidateAppointments: (queryClient: any) => {
    queryClient.invalidateQueries({
      queryKey: APPOINTMENT_QUERY_KEYS.all,
    });
  },

  // Clear all cached data
  clearAll: (queryClient: any) => {
    queryClient.clear();
  },

  // Prefetch common data (useful for app initialization)
  prefetchCommonData: async (queryClient: any) => {
    const promises = [
      // Prefetch user profile
      queryClient.prefetchQuery({
        queryKey: AUTH_QUERY_KEYS.profile,
        staleTime: 1000 * 60 * 5,
      }),

      // Prefetch recent patients
      queryClient.prefetchQuery({
        queryKey: PATIENT_QUERY_KEYS.list({ page: 1, limit: 10 }),
        staleTime: 1000 * 60 * 2,
      }),

      // Prefetch today's appointments
      queryClient.prefetchQuery({
        queryKey: APPOINTMENT_QUERY_KEYS.calendar({
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        }),
        staleTime: 1000 * 30,
      }),
    ];

    await Promise.allSettled(promises);
  },
};

// Type helpers for hooks
export type QueryKeyType =
  | (typeof AUTH_QUERY_KEYS)[keyof typeof AUTH_QUERY_KEYS]
  | (typeof PATIENT_QUERY_KEYS)[keyof typeof PATIENT_QUERY_KEYS]
  | (typeof APPOINTMENT_QUERY_KEYS)[keyof typeof APPOINTMENT_QUERY_KEYS];

// Hook status helpers
export interface UseQueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refetch: () => void;
}

export interface UseMutationState<T, V> {
  mutate: (variables: V) => void;
  mutateAsync: (variables: V) => Promise<T>;
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  reset: () => void;
}

// Common error messages for hooks
export const HOOK_ERROR_MESSAGES = {
  NETWORK_ERROR: "Erro de conexão. Verifique sua internet.",
  UNAUTHORIZED: "Sessão expirada. Faça login novamente.",
  FORBIDDEN: "Você não tem permissão para esta ação.",
  NOT_FOUND: "Recurso não encontrado.",
  VALIDATION_ERROR: "Dados inválidos. Verifique os campos.",
  SERVER_ERROR: "Erro interno do servidor. Tente novamente.",
  UNKNOWN_ERROR: "Erro desconhecido. Tente novamente.",
} as const;

// Hook configuration defaults
export const HOOK_DEFAULTS = {
  STALE_TIME: {
    SHORT: 1000 * 30, // 30 seconds
    MEDIUM: 1000 * 60 * 2, // 2 minutes
    LONG: 1000 * 60 * 5, // 5 minutes
  },
  GC_TIME: {
    SHORT: 1000 * 60, // 1 minute
    MEDIUM: 1000 * 60 * 5, // 5 minutes
    LONG: 1000 * 60 * 10, // 10 minutes
  },
  RETRY: {
    DEFAULT: 2,
    AUTH: 1, // Don't retry auth failures
    NETWORK: 3, // Retry network issues more
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
} as const;
