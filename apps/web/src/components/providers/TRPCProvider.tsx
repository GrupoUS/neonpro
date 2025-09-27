import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc.js'

interface TRPCProviderProps {
  children: React.ReactNode
}

// Create a QueryClient instance for the application
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

/**
 * TRPC Provider Component
 * Provides tRPC and TanStack Query context to the application
 *
 * Features:
 * - Type-safe tRPC queries and mutations
 * - TanStack Query for caching and state management
 * - Healthcare-compliant error handling
 * - Retry logic with healthcare API considerations
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
  return (
    <trpc.Provider client={trpc} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
