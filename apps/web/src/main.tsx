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
// Import auth providers
import { AuthProvider, } from '../contexts/auth-context'
import {
  createRouterContext,
  RouterAuthProvider,
  useRouterAuth,
} from './providers/RouterAuthProvider'

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

// Router wrapper component that provides auth context
function RouterWithAuth() {
  const routerAuth = useRouterAuth()
  const routerContext = createRouterContext(routerAuth,)

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      ...routerContext,
    } satisfies HealthcareRootContext,
  },)

  return <RouterProvider router={router} />
}

// Router type safety will be handled by individual router instances

// Healthcare application root
function HealthcareApp() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterAuthProvider>
            <RouterWithAuth />
            <ReactQueryDevtools
              buttonPosition="bottom-right"
              initialIsOpen={false}
            />
          </RouterAuthProvider>
        </AuthProvider>
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
