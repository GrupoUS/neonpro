/**
 * @file Authentication Guards and Route Protection
 * 
 * TanStack Router integration with Supabase authentication
 * Implements guard patterns from supabase-auth-guidelines.md
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM, ISO 27001
 */

'use client'

import { useSupabaseAuth } from '@/lib/auth/client.ts'
import { redirect } from '@tanstack/react-router'
import React from 'react'

export interface AuthOptions {
  requireAuth?: boolean
  requireRole?: string | string[]
  requirePermission?: string | string[]
  redirectTo?: string
}

/**
 * Hook para guards de autenticação
 * Compatível com TanStack Router beforeLoad
 */
export function useAuthGuard(options: AuthOptions = {}) {
  const { session, user, loading } = useSupabaseAuth()
  
  const {
    requireAuth = true,
    requireRole,
    requirePermission,
    redirectTo = '/auth/login'
  } = options
  
  // Loading state
  if (loading) {
    return { 
      isLoading: true, 
      isAuthenticated: false, 
      user: null,
      session: null
    }
  }
  
  // Authentication check
  if (requireAuth && (!session || !user)) {
    throw redirect({ to: redirectTo })
  }
  
  // Role-based authorization (simplified for client-side)
  // Note: Role verification should be done server-side for security
  if (requireRole && user) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole]
    const userRole = user.user_metadata?.role || 'user'
    
    if (!roles.includes(userRole)) {
      throw redirect({ to: '/unauthorized' })
    }
  }
  
  // Permission-based authorization (simplified for client-side)
  // Note: Permission verification should be done server-side for security
  if (requirePermission && user) {
    const permissions = Array.isArray(requirePermission) ? requirePermission : [requirePermission]
    const userPermissions = user.user_metadata?.permissions || []
    
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    )
    
    if (!hasPermission) {
      throw redirect({ to: '/unauthorized' })
    }
  }
  
  return {
    isLoading: false,
    isAuthenticated: !!session?.user,
    user,
    session
  }
}

/**
 * Factory para criar beforeLoad function para TanStack Router
 */
export function createAuthGuard(options: AuthOptions = {}) {
  return () => {
    return useAuthGuard(options)
  }
}

/**
 * Componente de rota protegida
 */
export function ProtectedRoute({ 
  children, 
  fallback,
  ...options 
}: AuthOptions & { 
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isLoading, isAuthenticated } = useAuthGuard(options)
  
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    // Redirect já foi executado no hook
    return null
  }
  
  return <>{children}</>
}

/**
 * Guard para verificar role específica
 */
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback 
}: {
  allowedRoles: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user, isLoading } = useSupabaseAuth()
  
  if (isLoading) {
    return fallback || (
      <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
    )
  }
  
  if (!user) {
    return fallback || (
      <div className="text-center py-4">
        <p className="text-gray-600">Acesso negado. Faça login primeiro.</p>
      </div>
    )
  }
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  const userRole = user.user_metadata?.role || 'user'
  
  if (!roles.includes(userRole)) {
    return fallback || (
      <div className="text-center py-4">
        <p className="text-gray-600">Acesso negado. Permissão insuficiente.</p>
      </div>
    )
  }
  
  return <>{children}</>
}

/**
 * Guard para verificar permissão específica
 */
export function PermissionGuard({ 
  requiredPermissions, 
  children, 
  fallback 
}: {
  requiredPermissions: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user, isLoading } = useSupabaseAuth()
  
  if (isLoading) {
    return fallback || (
      <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
    )
  }
  
  if (!user) {
    return fallback || (
      <div className="text-center py-4">
        <p className="text-gray-600">Acesso negado. Faça login primeiro.</p>
      </div>
    )
  }
  
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]
  const userPermissions = user.user_metadata?.permissions || []
  
  const hasPermission = permissions.some(permission => 
    userPermissions.includes(permission)
  )
  
  if (!hasPermission) {
    return fallback || (
      <div className="text-center py-4">
        <p className="text-gray-600">Acesso negado. Permissão insuficiente.</p>
      </div>
    )
  }
  
  return <>{children}</>
}

/**
 * Hook para verificar se usuário tem permissão específica
 */
export function useHasPermission(permission: string | string[]) {
  const { user } = useSupabaseAuth()
  
  if (!user) return false
  
  const permissions = Array.isArray(permission) ? permission : [permission]
  const userPermissions = user.user_metadata?.permissions || []
  
  return permissions.some(p => userPermissions.includes(p))
}

/**
 * Hook para verificar se usuário tem role específica
 */
export function useHasRole(role: string | string[]) {
  const { user } = useSupabaseAuth()
  
  if (!user) return false
  
  const roles = Array.isArray(role) ? role : [role]
  const userRole = user.user_metadata?.role || 'user'
  
  return roles.includes(userRole)
}