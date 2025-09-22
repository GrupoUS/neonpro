import * as React from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TRPCProvider } from '../components/providers/TRPCProvider'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider>
        <div className="min-h-screen bg-gray-50">
          <Outlet />
          <Toaster />
        </div>
      </TRPCProvider>
    </QueryClientProvider>
  ),
})