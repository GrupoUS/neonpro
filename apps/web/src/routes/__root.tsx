import * as React from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { TRPCProvider } from '../components/providers/TRPCProvider'
import { ErrorBoundary } from '../components/ErrorBoundary'

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <TRPCProvider>
        <div className="min-h-screen bg-gray-50">
          <Outlet />
          <Toaster />
        </div>
      </TRPCProvider>
    </ErrorBoundary>
  ),
})