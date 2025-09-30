import { useAuth } from '@/contexts/AuthContext'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { isAuthenticated, isLoading } = useAuth()

  // Security: Auth timeout fallback - redirect if auth check takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        window.location.href = '/dashboard/'
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isLoading])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600'>
        <div className='text-center text-white'>
          <div className='animate-spin rounded-full h-12 w-12 border-white/30 border-t-white mx-auto mb-4'></div>
          <div className='mx-auto h-16 w-16 bg-white/20 rounded-lg flex items-center justify-center mb-4'>
            <Building2 className='h-10 w-10 text-white' />
          </div>
          <h1 className='text-4xl font-bold mb-4'>
            🏥 NeonPro
          </h1>
          <p className='text-xl mb-4'>
            Healthcare Platform for Brazilian Aesthetic Clinics
          </p>
          <p className='text-sm opacity-75'>
            Verificando autenticação...
          </p>
          <p className='text-xs opacity-50 mt-2'>
            (Redirecionando automaticamente em breve...)
          </p>
        </div>
      </div>
    )
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  } else {
    return <Navigate to="/auth/login" />
  }
}
