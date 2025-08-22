'use client';

/**
 * Query Provider - With QueryKeys Structure
 * Includes QueryKeys and HealthcareQueryConfig for proper test execution
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useState } from 'react';

// Healthcare-specific query configuration
export const HealthcareQueryConfig = {
  // Default configuration
  default: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // Patient data - more frequent updates for safety
  patient: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (LGPD compliance)
  },

  // Appointment data - frequent updates
  appointment: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // Professional data - less frequent updates
  professional: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },

  // Service data - infrequent updates
  service: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },

  // Audit data - minimal caching for compliance
  audit: {
    staleTime: 0, // Always fresh
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
};

// Query Keys Structure - Hierarchical organization for cache management
export const QueryKeys = {
  // Authentication queries
  auth: {
    all: () => ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    session: () => ['auth', 'session'] as const,
    permissions: (userId: string) => ['auth', 'permissions', userId] as const,
  },

  // Patient queries
  patients: {
    all: () => ['patients'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['patients', 'list', filters] as const,
    detail: (id: string) => ['patients', 'detail', id] as const,
    search: (query: string) => ['patients', 'search', query] as const,
    stats: () => ['patients', 'stats'] as const,
    appointments: (patientId: string) =>
      ['patients', patientId, 'appointments'] as const,
    medical_records: (patientId: string) =>
      ['patients', patientId, 'medical_records'] as const,
  },

  // Appointment queries
  appointments: {
    all: () => ['appointments'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['appointments', 'list', filters] as const,
    detail: (id: string) => ['appointments', 'detail', id] as const,
    calendar: (date: string) => ['appointments', 'calendar', date] as const,
    upcoming: (userId: string) =>
      ['appointments', 'upcoming', userId] as const,
    patient: (patientId: string) =>
      ['appointments', 'patient', patientId] as const,
    professional: (professionalId: string) =>
      ['appointments', 'professional', professionalId] as const,
  },

  // Professional queries
  professionals: {
    all: () => ['professionals'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['professionals', 'list', filters] as const,
    detail: (id: string) => ['professionals', 'detail', id] as const,
    schedule: (professionalId: string) =>
      ['professionals', professionalId, 'schedule'] as const,
    availability: (professionalId: string, date: string) =>
      ['professionals', professionalId, 'availability', date] as const,
  },

  // Service queries
  services: {
    all: () => ['services'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['services', 'list', filters] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
    clinic: (clinicId: string) => ['services', 'clinic', clinicId] as const,
    professional: (professionalId: string) =>
      ['services', 'professional', professionalId] as const,
  },

  // Analytics and reporting queries
  analytics: {
    all: () => ['analytics'] as const,
    dashboard: (userId: string) => ['analytics', 'dashboard', userId] as const,
    reports: (type: string, filters?: Record<string, unknown>) =>
      ['analytics', 'reports', type, filters] as const,
    performance: (timeRange: string) =>
      ['analytics', 'performance', timeRange] as const,
  },

  // Clinic management queries
  clinics: {
    all: () => ['clinics'] as const,
    detail: (id: string) => ['clinics', 'detail', id] as const,
    professionals: (clinicId: string) =>
      ['clinics', clinicId, 'professionals'] as const,
    services: (clinicId: string) => ['clinics', clinicId, 'services'] as const,
    settings: (clinicId: string) => ['clinics', clinicId, 'settings'] as const,
  },

  // Medical records queries
  medical_records: {
    all: () => ['medical_records'] as const,
    patient: (patientId: string) =>
      ['medical_records', 'patient', patientId] as const,
    detail: (id: string) => ['medical_records', 'detail', id] as const,
    history: (patientId: string) =>
      ['medical_records', 'history', patientId] as const,
  },

  // Compliance and audit queries
  compliance: {
    all: () => ['compliance'] as const,
    audit_logs: (filters?: Record<string, unknown>) =>
      ['compliance', 'audit_logs', filters] as const,
    lgpd_status: (userId: string) =>
      ['compliance', 'lgpd_status', userId] as const,
    consent: (userId: string) => ['compliance', 'consent', userId] as const,
  },

  // Notification queries
  notifications: {
    all: () => ['notifications'] as const,
    user: (userId: string) => ['notifications', 'user', userId] as const,
    unread: (userId: string) => ['notifications', 'unread', userId] as const,
  },
} as const;

// Default query client configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: HealthcareQueryConfig.default.staleTime,
        gcTime: HealthcareQueryConfig.default.gcTime,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors except 408, 429
          const status = (error as any)?.status;
          if (status >= 400 && status < 500 && ![408, 429].includes(status)) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30_000),
      },
      mutations: {
        retry: (failureCount, error) => {
          const status = (error as any)?.status;
          if (status >= 400 && status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30_000),
      },
    },
  });
};

/**
 * Query Provider Component
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-right" initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default QueryProvider;
