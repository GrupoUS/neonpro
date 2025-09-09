'use client'

/**
 * Client-side Environment Validation Component
 * Validates environment on client mount and handles errors gracefully
 */

import { useEffect, useState, } from 'react'
import { initializeGlobalErrorHandler, } from '../lib/global-error-handler'
import { initializeClient, } from '../lib/init'
import type { StartupValidationResult, } from '../lib/startup'

interface ClientInitProps {
  children: React.ReactNode
}

export function ClientInit({ children, }: ClientInitProps,) {
  const [initResult, setInitResult,] = useState<StartupValidationResult | null>(null,)
  const [hasError, setHasError,] = useState(false,)

  useEffect(() => {
    try {
      // Initialize global error handler first
      initializeGlobalErrorHandler()

      const result = initializeClient()
      setInitResult(result || null,)

      if (!result || !result.success) {
        setHasError(true,)
        console.error('🚨 Client initialization failed:', result?.errors || 'Unknown error',)
      }
    } catch (error) {
      setHasError(true,)
      console.error('🚨 Client initialization error:', error,)
    }
  }, [],)

  // Show loading state while initializing
  if (!initResult) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Inicializando NeonPro Healthcare...</p>
        </div>
      </div>
    )
  }

  // Show error state if initialization failed in production
  if (hasError && initResult?.environment?.isProduction) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-red-900 mb-4">
            Sistema Indisponível
          </h1>
          <p className="text-red-700 mb-4">
            O sistema está temporariamente indisponível devido a problemas de configuração.
          </p>
          <p className="text-sm text-red-600">
            Entre em contato com o suporte técnico.
          </p>
        </div>
      </div>
    )
  }

  // Show warnings in development mode
  if (hasError && initResult?.environment?.isDevelopment) {
    return (
      <div className="relative">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Aviso de Desenvolvimento:</strong>{' '}
                Problemas de configuração detectados. Verifique o console para detalhes.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    )
  }

  // Render normally if everything is ok
  return <>{children}</>
}
