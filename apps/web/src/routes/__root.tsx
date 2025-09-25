import { createRootRoute, Outlet } from '@tanstack/react-router'
import * as React from 'react'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { TRPCProvider } from '../components/stubs/TRPCProvider'
import { NeonProChatProvider } from '../components/chat/NeonProChatProvider'

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <TRPCProvider>
        <NeonProChatProvider>
          <div className='min-h-screen bg-gray-50'>
            <Outlet />
            <Toaster />
          </div>
        </NeonProChatProvider>
      </TRPCProvider>
    </ErrorBoundary>
  ),
})