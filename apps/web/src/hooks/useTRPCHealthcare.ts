/**
 * Healthcare-Specific tRPC Hooks
 *
 * Provides tRPC hooks with healthcare compliance, LGPD audit logging,
 * and authentication integration for the NeonPro platform
 *
 * @version 2.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM, WCAG 2.1 AA
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trpc } from '@/components/providers/TRPCProvider'
import { useAuth } from '@/contexts/AuthContext'
import { useTRPCHealthcare } from '@/components/providers/TRPCProvider'
import { useState, useEffect } from 'react'

/**
 * Hook for healthcare-compliant tRPC queries
 * Provides automatic audit logging and error handling
 */
export function useHealthcareQuery<T extends keyof trpc['query']>(
  queryKey: T,
  params: Parameters<trpc['query'][T]>[0],
  options?: {
    enabled?: boolean
    retry?: boolean
    staleTime?: number
    onSuccess?: (data: Awaited<ReturnType<trpc['query'][T]>>) => void
    onError?: (error: any) => void
  }
) {
  const { user, isAuthenticated } = useAuth()
  const { logOperation } = useTRPCHealthcare()
  const [isCompliant, setIsCompliant] = useState(true)

  // Check healthcare compliance before making query
  useEffect(() => {
    if (isAuthenticated && !user?.id) {
      console.warn('Healthcare compliance warning: User authenticated but no user ID')
      setIsCompliant(false)
    } else {
      setIsCompliant(true)
    }
  }, [isAuthenticated, user])

  // Log query operation for audit trail
  useEffect(() => {
    if (options?.enabled !== false && isCompliant) {
      logOperation('QUERY_START', String(queryKey), {
        params,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      })
    }
  }, [queryKey, params, options?.enabled, isCompliant, logOperation, user?.id])

  const result = useQuery({
    queryKey: [String(queryKey), params],
    queryFn: async () => {
      if (!isCompliant) {
        throw new Error('Healthcare compliance check failed')
      }

      try {
        // @ts-ignore - Dynamic query access
        const result = await trpc.query[queryKey](params)
        
        // Log successful query
        logOperation('QUERY_SUCCESS', String(queryKey), {
          params,
          userId: user?.id,
          timestamp: new Date().toISOString(),
          dataPoints: Array.isArray(result) ? result.length : 1,
        })

        return result
      } catch (error) {
        // Log query error
        logOperation('QUERY_ERROR', String(queryKey), {
          params,
          userId: user?.id,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        throw error
      }
    },
    enabled: (options?.enabled !== false) && isCompliant && isAuthenticated,
    retry: (failureCount, error: any) => {
      // Don't retry on compliance errors
      if (error.message?.includes('compliance')) return false
      // Don't retry on authentication errors
      if (error.code === 'UNAUTHORIZED') return false
      // Don't retry on LGPD errors
      if (error.message?.includes('LGPD')) return false
      
      return options?.retry !== false && failureCount < 3
    },
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes
    ...options,
  })

  return {
    ...result,
    isCompliant,
    complianceError: !isCompliant ? 'Healthcare compliance check failed' : null,
  }
}

/**
 * Hook for healthcare-compliant tRPC mutations
 * Provides automatic audit logging and error handling
 */
export function useHealthcareMutation<T extends keyof trpc['mutation']>(
  mutationKey: T,
  options?: {
    onSuccess?: (data: Awaited<ReturnType<trpc['mutation'][T]>>) => void
    onError?: (error: any) => void
    onSettled?: () => void
  }
) {
  const { user, isAuthenticated } = useAuth()
  const { logOperation, invalidateData } = useTRPCHealthcare()
  const queryClient = useQueryClient()
  const [isCompliant, setIsCompliant] = useState(true)

  // Check healthcare compliance before making mutation
  useEffect(() => {
    if (isAuthenticated && !user?.id) {
      console.warn('Healthcare compliance warning: User authenticated but no user ID')
      setIsCompliant(false)
    } else {
      setIsCompliant(true)
    }
  }, [isAuthenticated, user])

  const result = useMutation({
    mutationFn: async (params: Parameters<trpc['mutation'][T]>[0]) => {
      if (!isCompliant) {
        throw new Error('Healthcare compliance check failed')
      }

      if (!isAuthenticated) {
        throw new Error('Authentication required for this operation')
      }

      try {
        // Log mutation start
        logOperation('MUTATION_START', String(mutationKey), {
          params,
          userId: user?.id,
          timestamp: new Date().toISOString(),
        })

        // @ts-ignore - Dynamic mutation access
        const result = await trpc.mutation[mutationKey](params)

        // Log successful mutation
        logOperation('MUTATION_SUCCESS', String(mutationKey), {
          params,
          userId: user?.id,
          timestamp: new Date().toISOString(),
          success: true,
        })

        // Invalidate relevant healthcare data caches
        const invalidatePaths = getInvalidatePaths(String(mutationKey))
        if (invalidatePaths.length > 0) {
          invalidateData(invalidatePaths)
        }

        return result
      } catch (error) {
        // Log mutation error
        logOperation('MUTATION_ERROR', String(mutationKey), {
          params,
          userId: user?.id,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        throw error
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      const invalidatePaths = getInvalidatePaths(String(mutationKey))
      invalidatePaths.forEach(path => {
        queryClient.invalidateQueries({ queryKey: [path] })
      })

      options?.onSuccess?.(data)
    },
    retry: (failureCount, error: any) => {
      // Don't retry on compliance errors
      if (error.message?.includes('compliance')) return false
      // Don't retry on authentication errors
      if (error.code === 'UNAUTHORIZED') return false
      // Don't retry on validation errors
      if (error.code === 'BAD_REQUEST') return false
      // Don't retry on LGPD errors
      if (error.message?.includes('LGPD')) return false
      
      return failureCount < 2 // Retry mutations up to 2 times
    },
    ...options,
  })

  return {
    ...result,
    isCompliant,
    complianceError: !isCompliant ? 'Healthcare compliance check failed' : null,
  }
}

/**
 * Get paths to invalidate based on mutation key
 */
function getInvalidatePaths(mutationKey: string): string[] {
  const invalidateMap: Record<string, string[]> = {
    'patients.create': ['patients'],
    'patients.update': ['patients'],
    'patients.delete': ['patients'],
    'appointments.create': ['appointments', 'schedule'],
    'appointments.update': ['appointments', 'schedule'],
    'appointments.delete': ['appointments', 'schedule'],
    'aestheticClinic.createClient': ['aestheticClinic'],
    'aestheticClinic.updateClient': ['aestheticClinic'],
    'aestheticScheduling.create': ['aestheticScheduling', 'schedule'],
    'aestheticScheduling.update': ['aestheticScheduling', 'schedule'],
    'aiClinicalSupport.generateRecommendations': ['aiClinicalSupport'],
  }

  return invalidateMap[mutationKey] || []
}

/**
 * Hook for real-time healthcare data subscription
 */
export function useHealthcareSubscription<T extends keyof trpc['subscription']>(
  subscriptionKey: T,
  params: Parameters<trpc['subscription'][T]>[0],
  callback: (data: Awaited<ReturnType<trpc['subscription'][T]>>) => void
) {
  const { user, isAuthenticated } = useAuth()
  const { logOperation } = useTRPCHealthcare()
  const [isCompliant, setIsCompliant] = useState(true)

  // Check healthcare compliance
  useEffect(() => {
    if (isAuthenticated && !user?.id) {
      console.warn('Healthcare compliance warning: User authenticated but no user ID')
      setIsCompliant(false)
    } else {
      setIsCompliant(true)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!isCompliant || !isAuthenticated) return

    // Log subscription start
    logOperation('SUBSCRIPTION_START', String(subscriptionKey), {
      params,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    })

    // Setup subscription
    // @ts-ignore - Dynamic subscription access
    const subscription = trpc.subscription[subscriptionKey](params, {
      onData: (data) => {
        // Log subscription data
        logOperation('SUBSCRIPTION_DATA', String(subscriptionKey), {
          params,
          userId: user?.id,
          timestamp: new Date().toISOString(),
        })

        callback(data)
      },
      onError: (error) => {
        // Log subscription error
        logOperation('SUBSCRIPTION_ERROR', String(subscriptionKey), {
          params,
          userId: user?.id,
          timestamp: new Date().toISOString(),
          error: error.message,
        })
      },
    })

    return () => {
      subscription.unsubscribe()
      logOperation('SUBSCRIPTION_END', String(subscriptionKey), {
        params,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      })
    }
  }, [subscriptionKey, params, callback, isCompliant, isAuthenticated, logOperation, user?.id])

  return {
    isCompliant,
    complianceError: !isCompliant ? 'Healthcare compliance check failed' : null,
  }
}

/**
 * Hook for healthcare data prefetching
 */
export function useHealthcarePrefetch() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const prefetchHealthcareData = async (queries: Array<{
    key: string
    params?: any
    staleTime?: number
  }>) => {
    if (!isAuthenticated || !user?.id) return

    for (const query of queries) {
      try {
        await queryClient.prefetchQuery({
          queryKey: [query.key, query.params],
          queryFn: async () => {
            // @ts-ignore - Dynamic query access
            return await trpc.query[query.key as keyof trpc['query']](query.params || {})
          },
          staleTime: query.staleTime || 1000 * 60 * 5, // 5 minutes
        })
      } catch (error) {
        console.warn(`Failed to prefetch ${query.key}:`, error)
      }
    }
  }

  return { prefetchHealthcareData }
}

/**
 * Hook for healthcare data cache management
 */
export function useHealthcareCache() {
  const queryClient = useQueryClient()
  const { logOperation } = useTRPCHealthcare()

  const clearHealthcareData = (paths?: string[]) => {
    const healthPaths = paths || [
      'patients',
      'appointments', 
      'healthcareServices',
      'aestheticClinic',
      'aestheticScheduling',
      'aiClinicalSupport',
    ]

    healthPaths.forEach(path => {
      queryClient.removeQueries({ queryKey: [path] })
    })

    logOperation('CACHE_CLEAR', 'healthcare', {
      paths: healthPaths,
      timestamp: new Date().toISOString(),
    })
  }

  const invalidateHealthcareData = (paths: string[]) => {
    paths.forEach(path => {
      queryClient.invalidateQueries({ queryKey: [path] })
    })

    logOperation('CACHE_INVALIDATE', 'healthcare', {
      paths,
      timestamp: new Date().toISOString(),
    })
  }

  return {
    clearHealthcareData,
    invalidateHealthcareData,
  }
}