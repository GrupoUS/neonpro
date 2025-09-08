import './lib/monitoring/gotrue-warning-monitor'
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { ReactQueryDevtools, } from '@tanstack/react-query-devtools'
import { createRouter, RouterProvider, } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'

// Import the generated route tree
import { routeTree, } from './routeTree.gen'
// Import the root context type
import type { HealthcareRootContext, } from './routes/__root'

// Import global styles
import './styles/globals.css'

// Type guards
function isErrorWithStatus(error: unknown,): error is { status?: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}

// Healthcare Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error,) => {
        // Don't retry on 4xx errors except 408, 429
        const status = isErrorWithStatus(error,) ? error.status : undefined
        if (status && status >= 400 && status < 500 && ![408, 429,].includes(status,)) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex,) => Math.min(1000 * 2 ** attemptIndex, 30_000,),
    },
    mutations: {
      retry: (failureCount, error,) => {
        const status = isErrorWithStatus(error,) ? error.status : undefined
        if (status && status >= 400 && status < 500) {
          return false
        }
        return failureCount < 2
      },
      retryDelay: (attemptIndex,) => Math.min(1000 * 2 ** attemptIndex, 30_000,),
    },
  },
},)

// Create a new router instance with proper context typing
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    // Healthcare context will be initialized by auth providers
    auth: {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    },
    healthcare: {
      clinicId: null,
      isEmergencyMode: false,
      complianceMode: 'strict' as const,
    },
  } satisfies HealthcareRootContext,
},)

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Healthcare application root
function HealthcareApp() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools
          buttonPosition="bottom-right"
          initialIsOpen={false}
        />
      </QueryClientProvider>
    </React.StrictMode>
  )
}

// Mount the healthcare application
const rootElement = document.getElementById('root',)
if (!rootElement) {
  throw new Error(
    'Failed to find the root element. Make sure there is a div with id="root" in your HTML.',
  )
}

ReactDOM.createRoot(rootElement,).render(<HealthcareApp />,)
