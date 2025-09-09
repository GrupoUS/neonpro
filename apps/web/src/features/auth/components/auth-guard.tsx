import type { ReactNode, } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true, }: AuthGuardProps,) {
  // TODO: Implement actual auth logic
  const isAuthenticated = false // This should come from auth context

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
