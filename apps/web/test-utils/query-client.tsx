/**
 * Test Utilities for TanStack Query
 * Healthcare-optimized testing setup for NeonPro platform
 */

import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import React, { ReactNode, } from 'react'
import { healthcareQueryConfig, } from '../lib/config/healthcare-query-config'

/**
 * Create a test query client with healthcare-optimized settings
 * Optimized for testing with faster cache times and no retries
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries in tests for faster execution
        retry: false,

        // Shorter cache times for testing
        staleTime: 0,
        gcTime: 1000, // 1 second

        // Disable background refetching in tests
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        // Disable retries in tests
        retry: false,
      },
    },

    // Suppress console logs in tests
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  },)
}

/**
 * Create a test query client with healthcare-specific configuration
 * Uses actual healthcare cache times for integration testing
 */
export function createHealthcareTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Use healthcare-specific cache times
        staleTime: healthcareQueryConfig.patient.staleTime,
        gcTime: healthcareQueryConfig.patient.gcTime,

        // Disable retries for predictable testing
        retry: false,

        // Disable background refetching
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },

    // Suppress console logs in tests
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  },)
}

/**
 * Query wrapper component for testing
 * Provides QueryClient context to test components
 */
export function createQueryWrapper(queryClient: QueryClient,) {
  return function QueryWrapper({ children, }: { children: ReactNode },) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

// Alias for compatibility
export const createWrapper = createQueryWrapper

/**
 * Healthcare-specific query wrapper
 * Uses healthcare cache configuration for realistic testing
 */
export function createHealthcareQueryWrapper() {
  const queryClient = createHealthcareTestQueryClient()

  return function HealthcareQueryWrapper({ children, }: { children: ReactNode },) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

/**
 * Mock query client for unit testing
 * Provides complete isolation for unit tests
 */
export function createMockQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },

    // Completely silent for unit tests
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  },)
}

/**
 * Test utilities for query state management
 */
export const queryTestUtils = {
  /**
   * Wait for query to settle (success or error)
   */
  waitForQuery: async (queryClient: QueryClient, queryKey: unknown[], timeout = 5000,) => {
    return new Promise((resolve, reject,) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Query ${JSON.stringify(queryKey,)} did not settle within ${timeout}ms`,),)
      }, timeout,)

      const unsubscribe = queryClient.getQueryCache().subscribe((event,) => {
        if (
          event?.query?.queryKey
          && JSON.stringify(event.query.queryKey,) === JSON.stringify(queryKey,)
        ) {
          if (event.query.state.status === 'success' || event.query.state.status === 'error') {
            clearTimeout(timeoutId,)
            unsubscribe()
            resolve(event.query.state,)
          }
        }
      },)
    },)
  },

  /**
   * Clear all queries from test client
   */
  clearAllQueries: (queryClient: QueryClient,) => {
    queryClient.clear()
  },

  /**
   * Get query state for testing
   */
  getQueryState: (queryClient: QueryClient, queryKey: unknown[],) => {
    return queryClient.getQueryState(queryKey,)
  },

  /**
   * Set mock query data for testing
   */
  setMockQueryData: (queryClient: QueryClient, queryKey: unknown[], data: unknown,) => {
    queryClient.setQueryData(queryKey, data,)
  },

  /**
   * Invalidate queries for testing
   */
  invalidateQueries: async (queryClient: QueryClient, queryKey: unknown[],) => {
    await queryClient.invalidateQueries({ queryKey, },)
  },
}

/**
 * Healthcare-specific test data factories
 */
export const healthcareTestData = {
  /**
   * Create mock patient data
   */
  createMockPatient: (overrides: Partial<any> = {},) => ({
    id: 'patient-test-123',
    name: 'Test Patient',
    cpf: '12345678901',
    email: 'test.patient@example.com',
    phone: '+5511999999999',
    birthDate: '1990-01-01',
    gender: 'male' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * Create mock appointment data
   */
  createMockAppointment: (overrides: Partial<any> = {},) => ({
    id: 'appointment-test-123',
    patientId: 'patient-test-123',
    professionalId: 'professional-test-123',
    serviceId: 'service-test-123',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000,).toISOString(), // Tomorrow
    duration: 60,
    status: 'scheduled' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * Create mock professional data
   */
  createMockProfessional: (overrides: Partial<any> = {},) => ({
    id: 'professional-test-123',
    name: 'Dr. Test Professional',
    email: 'test.professional@example.com',
    phone: '+5511888888888',
    specialization: 'Dermatology',
    license: 'CRM123456',
    clinicId: 'clinic-test-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),
}

/**
 * Performance testing utilities
 */
export const performanceTestUtils = {
  /**
   * Measure query execution time
   */
  measureQueryTime: async (queryClient: QueryClient, queryKey: unknown[],) => {
    const startTime = performance.now()

    await queryClient.fetchQuery({
      queryKey,
      queryFn: () => Promise.resolve({},),
    },)

    const endTime = performance.now()
    return endTime - startTime
  },

  /**
   * Measure cache hit rate
   */
  measureCacheHitRate: (queryClient: QueryClient,) => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()

    const totalQueries = queries.length
    const cachedQueries = queries.filter(query => query.state.data !== undefined).length

    return totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0
  },
}
