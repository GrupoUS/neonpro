import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'

// Import tRPC integration
import { trpc } from './TRPCProvider.tsx'

// Create a single QueryClient instance with healthcare-optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time - reduces unnecessary refetches
      staleTime: 1000 * 60 * 5,
      // Healthcare-specific retry logic
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.code === 'UNAUTHORIZED' || error?.status === 401) return false
        // Don't retry on validation errors
        if (error?.code === 'BAD_REQUEST' || error?.status === 400) return false
        // Don't retry on LGPD compliance errors
        if (error?.code === 'FORBIDDEN' && error?.message?.includes('LGPD')) return false
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      // Cache time - keep data in cache for 30 minutes
      gcTime: 1000 * 60 * 30,
      // Enable refetch on window focus for real-time updates
      refetchOnWindowFocus: true,
      // Refetch on reconnect for offline resilience
      refetchOnReconnect: true,
    },
    mutations: {
      // Healthcare-specific mutation retry logic
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.code === 'UNAUTHORIZED' || error?.status === 401) return false
        // Don't retry on validation errors
        if (error?.code === 'BAD_REQUEST' || error?.status === 400) return false
        // Retry mutations up to 2 times for critical operations
        return failureCount < 2
      },
      // Cache mutations for audit purposes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

/**
 * Healthcare-specific query client utilities
 */
export const healthcareQueryClient = {
  /**
   * Invalidate healthcare-related queries
   */
  invalidateHealthcareData: (paths: string[]) => {
    paths.forEach(path => {
      try {
        const [router, procedure] = path.split('.')
        if (router && procedure) {
          // Invalidate the specific query
          queryClient.invalidateQueries({ queryKey: [router, procedure] })
        }
      } catch (error) {
        console.warn(`Failed to invalidate cache for ${path}:`, error)
      }
    })
  },

  /**
   * Prefetch healthcare data for better UX
   */
  prefetchHealthcareData: async (paths: string[]) => {
    for (const path of paths) {
      try {
        const [router, procedure] = path.split('.')
        if (router && procedure) {
          // Prefetch the data
          await queryClient.prefetchQuery({
            queryKey: [router, procedure],
            queryFn: async () => {
              // This would be replaced with actual tRPC calls
              return null
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
          })
        }
      } catch (error) {
        console.warn(`Failed to prefetch data for ${path}:`, error)
      }
    }
  },

  /**
   * Clear healthcare data for compliance
   */
  clearHealthcareData: () => {
    // Clear all healthcare-related queries
    const healthcarePaths = [
      'patients',
      'appointments',
      'healthcareServices',
      'aestheticClinic',
      'aestheticScheduling',
      'aiClinicalSupport',
    ]

    healthcarePaths.forEach(path => {
      queryClient.removeQueries({ queryKey: [path] })
    })
  },
}

interface TanStackQueryProviderProps {
  children: React.ReactNode
}

export function TanStackQueryProvider({ children }: TanStackQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Include React Query Devtools in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

// Export the QueryClient for use in other components if needed
export { queryClient }

// Export hooks for common patterns
export const useTanStackQuery = () => {
  return queryClient
}
