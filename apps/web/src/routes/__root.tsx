import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { TRPCProvider } from '../components/stubs/TRPCProvider'
import { UnifiedAgentProvider } from '../components/copilotkit/UnifiedAgentProvider'

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <TRPCProvider>
        <UnifiedAgentProvider
          config={{
            clinicId: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLINIC_ID) || 'default-clinic',
            userId: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_USER_ID) || 'default-user',
            userRole: 'admin', // Would be determined by auth in real app
            language: 'pt-BR',
            compliance: {
              lgpdEnabled: true,
              auditLogging: true,
              dataRetention: 90,
            },
          }}
          runtimeUrl="/api/v2/ai/copilot"
        >
          <div className='min-h-screen bg-gray-50'>
            <Outlet />
            <Toaster />
          </div>
        </UnifiedAgentProvider>
      </TRPCProvider>
    </ErrorBoundary>
  ),
})