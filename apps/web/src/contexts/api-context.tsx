"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { createContext, useContext } from "react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes
      staleTime: 1000 * 60 * 5,
      // 10 minutes
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error: unknown) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on 400-499 errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

interface ApiContextType {
  queryClient: QueryClient;
  invalidateQueries: (queryKey: string[]) => Promise<void>;
  resetQueries: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const invalidateQueries = async (queryKey: string[]) => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const resetQueries = () => {
    queryClient.clear();
  };

  const value: ApiContextType = {
    queryClient,
    invalidateQueries,
    resetQueries,
  };

  return (
    <ApiContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApiContext must be used within an ApiProvider");
  }
  return context;
}

/**
 * Common query keys for consistent cache management
 */
export const QueryKeys = {
  // Auth queries
  auth: ["auth"] as const,
  user: (id: string) => ["user", id] as const,

  // Patients queries
  patients: ["patients"] as const,
  patientsList: (filters?: Record<string, unknown>) =>
    ["patients", "list", filters] as const,
  patient: (id: string) => ["patients", id] as const,
  patientAppointments: (id: string) =>
    ["patients", id, "appointments"] as const,

  // Appointments queries
  appointments: ["appointments"] as const,
  appointmentsList: (filters?: Record<string, unknown>) =>
    ["appointments", "list", filters] as const,
  appointment: (id: string) => ["appointments", id] as const,
  appointmentsByDate: (date: string) => ["appointments", "date", date] as const,

  // Healthcare queries
  services: ["services"] as const,
  professionals: ["professionals"] as const,
  compliance: ["compliance"] as const,
  lgpdConsents: (patientId: string) => ["lgpd", "consents", patientId] as const,

  // Analytics queries
  analytics: ["analytics"] as const,
  dashboardStats: ["analytics", "dashboard"] as const,
  appointmentStats: (period: string) =>
    ["analytics", "appointments", period] as const,

  // System queries
  health: ["health"] as const,
  notifications: ["notifications"] as const,
} as const;
