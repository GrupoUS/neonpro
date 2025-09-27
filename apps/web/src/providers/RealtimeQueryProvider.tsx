/**
 * TanStack Query + Supabase Realtime Provider
 * Integrates TanStack Query with Supabase Realtime for the NeonPro healthcare platform
 */

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RealtimeProvider } from '../hooks/realtime/useRealtimeProvider'

// Configure QueryClient with healthcare-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Healthcare data should be kept fresh
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Retry strategy for healthcare reliability
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      // Enable background refetching for critical healthcare data
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      // Network error handling
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations for healthcare reliability
      retry: (failureCount, error: any) => {
        // Don't retry on validation or authorization errors
        if (error?.status === 400 || error?.status === 401 || error?.status === 403) {
          return false
        }
        // Retry once for network errors
        return failureCount < 1
      },
    },
  },
})

interface RealtimeQueryProviderProps {
  children: ReactNode
}

/**
 * Combined provider for TanStack Query + Supabase Realtime
 * Provides healthcare-optimized query management with real-time data synchronization
 */
export function RealtimeQueryProvider({ children }: RealtimeQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false}
            position="bottom-right"
          />
        )}
      </RealtimeProvider>
    </QueryClientProvider>
  )
}

// Export the query client for use in other parts of the application
export { queryClient }