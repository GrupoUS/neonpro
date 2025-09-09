// Router-Auth Integration Provider
// Integrates Supabase AuthContext with TanStack Router context
import { createContext, useContext, useEffect, useState, } from 'react'
import type { ReactNode, } from 'react'
import { useAuthContext, } from '../../contexts/auth-context'
import type { AuthContextType, } from '../lib/auth-utils'

// Enhanced auth context for router integration
interface RouterAuthContextType extends AuthContextType {
  isReady: boolean
}

const RouterAuthContext = createContext<RouterAuthContextType | undefined>(undefined,)

interface RouterAuthProviderProps {
  children: ReactNode
}

// Provider that makes auth available to router context
export function RouterAuthProvider({ children, }: RouterAuthProviderProps,) {
  const auth = useAuthContext()
  const [isReady, setIsReady,] = useState(false,)

  // Mark auth as ready when loading completes
  useEffect(() => {
    if (!auth.loading) {
      setIsReady(true,)
    }
  }, [auth.loading,],)

  const routerAuthValue: RouterAuthContextType = {
    ...auth,
    isReady,
  }

  return (
    <RouterAuthContext.Provider value={routerAuthValue}>
      {children}
    </RouterAuthContext.Provider>
  )
}

// Hook to use router auth context
export function useRouterAuth(): RouterAuthContextType {
  const context = useContext(RouterAuthContext,)
  if (context === undefined) {
    throw new Error('useRouterAuth must be used within a RouterAuthProvider',)
  }
  return context
}

// Transform auth context to router context format
export function createRouterContext(auth: RouterAuthContextType,) {
  return {
    auth: {
      user: auth.user
        ? {
          id: auth.user.id,
          email: auth.user.email || '',
          role: auth.user.user_metadata?.role || 'user',
          permissions: auth.user.user_metadata?.permissions || [],
        }
        : null,
      isLoading: auth.loading,
      isAuthenticated: !!auth.user && !!auth.session,
      session: auth.session,
    },
    healthcare: {
      clinicId: auth.user?.user_metadata?.clinic_id || null,
      isEmergencyMode: false,
      complianceMode: 'strict' as const,
    },
  }
}
