import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc, trpcClient } from '../../lib/trpc/client'

interface TRPCProviderProps {
  children: React.ReactNode
}

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false
        return failureCount < 3
      },
    },
  },
})

export function TRPCProvider({ children }: TRPCProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  )
}

// Export the QueryClient for use in other components if needed
export { queryClient }