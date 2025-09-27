/**
 * @file Protected Route Component
 * 
 * Route protection wrapper that redirects unauthenticated users to login
 * Uses AuthContext to check authentication status
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 */

import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useLocation } from '@tanstack/react-router'
import { ReactNode, useEffect } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireEmailVerification?: boolean
}

export function ProtectedRoute({ 
  children, 
  requireEmailVerification = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isEmailVerified, user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading) {
      console.log('[ProtectedRoute] Auth status:', {
        isAuthenticated,
        isEmailVerified,
        user: user?.email,
        currentPath: location.pathname
      })
    }
  }, [isAuthenticated, isLoading, isEmailVerified, user, location])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to login - not authenticated')
    return <Navigate to="/auth/login" search={{ redirect: location.pathname }} />
  }

  // Redirect to email verification if required and not verified
  if (requireEmailVerification && !isEmailVerified) {
    console.log('[ProtectedRoute] Redirecting to email verification - email not verified')
    return <Navigate to="/auth/verify-email" />
  }

  // Render protected content
  return <>{children}</>
}