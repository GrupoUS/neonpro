/**
 * tRPC Provider Component
 *
 * Provides tRPC client integration with React Query and healthcare compliance
 * Handles authentication, audit logging, and healthcare-specific configurations
 *
 * @version 2.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM, WCAG 2.1 AA
 */

import { QueryClient } from '@tanstack/react-query'
import { createTRPCReact } from '@trpc/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'
import type { AppRouter } from '@neonpro/api'

// Import our tRPC client configuration
import { getTRPCClient, tRPCHealthcareUtils } from '@/lib/trpc'

// Import authentication context
import { useAuth } from '@/contexts/AuthContext'

// Import QueryClient from the existing provider
import { queryClient } from '@/components/providers/TanStackQueryProvider'

// Re-export the tRPC instance for convenience
export const trpc = createTRPCReact<AppRouter>()

interface TRPCProviderProps {
  children: React.ReactNode
}

/**
 * TRPC Provider Component
 *
 * Integrates tRPC with React Query and provides:
 * - Healthcare compliance headers
 * - Authentication integration
 * - LGPD audit logging
 * - Error handling for healthcare scenarios
 * - Development tools
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
  const { user, isAuthenticated, session } = useAuth()

  // Generate session ID for audit logging
  const sessionId = React.useMemo(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Store session ID for healthcare compliance
  React.useEffect(() => {
    if (sessionId) {
      localStorage.setItem('neonpro.sessionId', sessionId)
    }
  }, [sessionId])

  // Log authentication state changes for audit trail
  React.useEffect(() => {
    if (isAuthenticated && user) {
      tRPCHealthcareUtils.logOperation('AUTH_STATE_CHANGE', 'auth.authenticated', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      })
    }
  }, [isAuthenticated, user])

  // Configure tRPC client with healthcare compliance
  const client = React.useMemo(() => {
    return getTRPCClient(queryClient)
  }, [])

  // Enhanced query client for healthcare operations
  const enhancedQueryClient = React.useMemo(() => {
    // Create a new QueryClient with healthcare-specific defaults
    return new QueryClient({
      defaultOptions: {
        queries: {
          ...queryClient.getDefaultOptions().queries,
          // Healthcare-specific retry logic
          retry: (failureCount, error: any) => {
            // Don't retry on authentication errors
            if (error?.code === 'UNAUTHORIZED' || error?.status === 401) {
              return false
            }
            // Don't retry on validation errors
            if (error?.code === 'BAD_REQUEST' || error?.status === 400) {
              return false
            }
            // Don't retry on LGPD compliance errors
            if (error?.code === 'FORBIDDEN' && error?.message?.includes('LGPD')) {
              return false
            }
            // Retry up to 3 times for other errors
            return failureCount < 3
          },
          // Healthcare-specific cache settings
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 30, // 30 minutes
          // Enable refetch for real-time healthcare data
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
        },
        mutations: {
          ...queryClient.getDefaultOptions().mutations,
          // Healthcare-specific mutation retry logic
          retry: (failureCount, error: any) => {
            // Don't retry on authentication errors
            if (error?.code === 'UNAUTHORIZED' || error?.status === 401) {
              return false
            }
            // Don't retry on validation errors
            if (error?.code === 'BAD_REQUEST' || error?.status === 400) {
              return false
            }
            // Retry mutations up to 2 times for critical operations
            return failureCount < 2
          },
          // Cache mutations for audit purposes
          gcTime: 1000 * 60 * 10, // 10 minutes
        },
      },
    })
  }, [])

  // Create tRPC provider with enhanced configuration
  const trpcClient = React.useMemo(() => {
    return trpc.createClient({
      links: client.links,
      // Add healthcare-specific configuration
      transformer: client.transformer,
    })
  }, [client])

  return (
    <trpc.Provider client={trpcClient} queryClient={enhancedQueryClient}>
      {children}
      {/* Include React Query Devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </trpc.Provider>
  )
}

/**
 * Hook for healthcare-specific tRPC operations
 *
 * Provides utilities for:
 * - LGPD-compliant data handling
 * - Healthcare audit logging
 * - Authentication context
 * - Error handling with healthcare context
 */
export function useTRPCHealthcare() {
  const { user, isAuthenticated, session } = useAuth()
  const utils = trpc.useUtils()

  const logHealthcareOperation = React.useCallback(
    (operation: string, path: string, data?: any) => {
      tRPCHealthcareUtils.logOperation(operation, path, {
        ...data,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        isAuthenticated,
      })
    },
    [user, isAuthenticated]
  )

  const invalidateHealthcareData = React.useCallback(
    (paths: string[]) => {
      // Invalidate relevant healthcare data caches
      paths.forEach(path => {
        try {
          const [router, procedure] = path.split('.')
          if (router && procedure) {
            // @ts-ignore - Dynamic router access
            utils[router]?.invalidate()
          }
        } catch (error) {
          console.warn(`Failed to invalidate cache for ${path}:`, error)
        }
      })
    },
    [utils]
  )

  return {
    // User context
    user,
    isAuthenticated,
    session,

    // Healthcare compliance
    healthcareContext: {
      userId: user?.id,
      clinicId: user?.clinic || localStorage.getItem('neonpro.clinicId'),
      professionalId: user?.id,
      compliance: {
        lgpd: true,
        anvisa: true,
        cfm: true,
      },
    },

    // Audit logging
    logOperation: logHealthcareOperation,

    // Cache management
    invalidateData: invalidateHealthcareData,

    // tRPC utilities
    utils,
  }
}

/**
 * Error handling utilities for healthcare tRPC operations
 */
export const tRPHealthcareErrorHandler = {
  /**
   * Handle tRPC errors with healthcare context
   */
  handleError: (error: any, context?: string) => {
    console.error('tRPC Healthcare Error:', {
      message: error.message,
      code: error.data?.code,
      httpStatus: error.data?.httpStatus,
      path: error.path,
      context,
      timestamp: new Date().toISOString(),
      userImpact: error.data?.userImpact || 'unknown',
    })

    // Log to audit trail for healthcare compliance
    try {
      const auditEvent = {
        event: 'TRPC_HEALTHCARE_ERROR',
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          code: error.data?.code,
          path: error.path,
          context,
        },
        compliance: {
          lgpd: true,
          healthcare: true,
        },
      }

      const auditLogs = JSON.parse(localStorage.getItem('neonpro.auditLogs') || '[]')
      auditLogs.push(auditEvent)
      localStorage.setItem('neonpro.auditLogs', JSON.stringify(auditLogs))
    } catch (auditError) {
      console.warn('Failed to log healthcare error to audit trail:', auditError)
    }

    // Return user-friendly error message
    if (error.data?.code === 'UNAUTHORIZED') {
      return 'Sessão expirada. Por favor, faça login novamente.'
    }
    if (error.data?.code === 'FORBIDDEN') {
      return 'Você não tem permissão para realizar esta operação.'
    }
    if (error.data?.code === 'BAD_REQUEST') {
      return 'Dados inválidos. Por favor, verifique as informações e tente novamente.'
    }
    if (error.message?.includes('LGPD')) {
      return 'Operação não permitida pela política de LGPD.'
    }
    return 'Ocorreu um erro. Por favor, tente novamente.'
  },

  /**
   * Check if error is healthcare-related
   */
  isHealthcareError: (error: any) => {
    return (
      error.data?.code === 'UNAUTHORIZED' ||
      error.data?.code === 'FORBIDDEN' ||
      error.message?.includes('LGPD') ||
      error.message?.includes('ANVISA') ||
      error.message?.includes('CFM') ||
      error.path?.includes('healthcare') ||
      error.path?.includes('patients') ||
      error.path?.includes('appointments')
    )
  },
}

export default TRPCProvider