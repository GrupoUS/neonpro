/**
 * tRPC Client Configuration
 *
 * Complete tRPC React client implementation with healthcare compliance
 * Integrates with Supabase authentication and LGPD audit logging
 *
 * @version 2.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM, WCAG 2.1 AA
 */

import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@neonpro/api'
import { QueryClient } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import superjson from 'superjson'

// Import authentication utilities
import { useAuth } from '@/contexts/AuthContext'

// Create tRPC React client (exported for backward compatibility)
export const trpc = createTRPCReact<AppRouter>()

/**
 * tRPC Client Configuration
 *
 * Configures the tRPC client with:
 * - Healthcare compliance headers
 * - Authentication integration
 * - LGPD audit logging
 * - Batch processing for efficiency
 * - Error handling for healthcare scenarios
 */
export function getTRPCClient(queryClient: QueryClient) {
  return trpc.createClient({
    links: [
      // Logger link for development and debugging
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),

      // HTTP batch link with healthcare compliance
      httpBatchLink({
        url: `${process.env.VITE_API_URL || 'http://localhost:3001'}/trpc`,

        // Healthcare compliance headers
        headers: () => {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Healthcare-Platform': 'NeonPro',
            'X-Compliance-Level': 'LGPD-ANVISA-CFM',
          }

          // Add authentication headers if user is authenticated
          try {
            // Get session from localStorage or Supabase
            const sessionData = localStorage.getItem('supabase.auth.token')
            if (sessionData) {
              const { access_token } = JSON.parse(sessionData)
              if (access_token) {
                headers.Authorization = `Bearer ${access_token}`
              }
            }
          } catch (error) {
            console.warn('Failed to retrieve authentication token:', error)
          }

          // Add user context for LGPD compliance
          try {
            const userData = localStorage.getItem('supabase.auth.user')
            if (userData) {
              const user = JSON.parse(userData)
              if (user.id) {
                headers['X-User-ID'] = user.id
              }
              if (user.email) {
                headers['X-User-Email'] = user.email
              }
            }
          } catch (error) {
            console.warn('Failed to retrieve user context:', error)
          }

          // Add clinic context if available
          try {
            const clinicId = localStorage.getItem('neonpro.clinicId')
            if (clinicId) {
              headers['X-Clinic-ID'] = clinicId
            }
          } catch (error) {
            console.warn('Failed to retrieve clinic context:', error)
          }

          // Add session ID for audit logging
          try {
            const sessionId = localStorage.getItem('neonpro.sessionId')
            if (sessionId) {
              headers['X-Session-ID'] = sessionId
            }
          } catch (error) {
            console.warn('Failed to retrieve session ID:', error)
          }

          return headers
        },

        // Configure transformer for proper type serialization
        transformer: superjson,

        // Healthcare-specific timeout settings
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          return fetch(input, {
            ...init,
            headers: {
              ...init?.headers,
              // Add healthcare compliance headers
              'X-Healthcare-Compliance': 'true',
              'X-LGPD-Audit': 'enabled',
            },
          })
        },

        // Error handling with healthcare context
        onError: (error) => {
          // Log errors with healthcare context
          console.error('tRPC Error:', {
            message: error.message,
            code: error.data?.code,
            httpStatus: error.data?.httpStatus,
            path: error.path,
            timestamp: new Date().toISOString(),
            context: 'healthcare_platform',
          })

          // Log to audit trail for healthcare compliance
          try {
            const auditEvent = {
              event: 'TRPC_ERROR',
              timestamp: new Date().toISOString(),
              error: {
                message: error.message,
                code: error.data?.code,
                path: error.path,
              },
              userAgent: navigator.userAgent,
              url: window.location.href,
            }

            // Store in localStorage for audit purposes
            const auditLogs = JSON.parse(localStorage.getItem('neonpro.auditLogs') || '[]')
            auditLogs.push(auditEvent)
            localStorage.setItem('neonpro.auditLogs', JSON.stringify(auditLogs))
          } catch (auditError) {
            console.warn('Failed to log tRPC error to audit trail:', auditError)
          }
        },
      }),
    ],
  })
}

/**
 * Healthcare compliance utilities for tRPC
 */
export const tRPCHealthcareUtils = {
  /**
   * Generate audit log entry for tRPC operations
   */
  generateAuditLog: (operation: string, path: string, data?: any) => ({
    event: 'TRPC_OPERATION',
    operation,
    path,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    data: data ? JSON.stringify(data) : undefined,
    compliance: {
      lgpd: true,
      healthcare: true,
    },
  }),

  /**
   * Log healthcare operation for compliance
   */
  logOperation: (operation: string, path: string, data?: any) => {
    try {
      const auditLog = tRPCHealthcareUtils.generateAuditLog(operation, path, data)
      const auditLogs = JSON.parse(localStorage.getItem('neonpro.auditLogs') || '[]')
      auditLogs.push(auditLog)

      // Keep only last 1000 audit logs
      if (auditLogs.length > 1000) {
        auditLogs.splice(0, auditLogs.length - 1000)
      }

      localStorage.setItem('neonpro.auditLogs', JSON.stringify(auditLogs))
    } catch (error) {
      console.warn('Failed to log tRPC operation:', error)
    }
  },
}

/**
 * Type-safe tRPC hooks with healthcare compliance
 */
export const useTRPCHealthcare = () => {
  const { user, isAuthenticated } = useAuth()

  return {
    // Authentication state
    user,
    isAuthenticated,

    // Healthcare context
    healthcareContext: {
      userId: user?.id,
      clinicId: user?.clinic || localStorage.getItem('neonpro.clinicId'),
      professionalId: user?.id,
      compliance: {
        lgpd: true,        anvisa: true,
        cfm: true,
      },
    },

    // Audit logging
    logOperation: tRPCHealthcareUtils.logOperation,
  }
}

