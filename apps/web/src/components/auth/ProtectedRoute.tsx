import React from 'react'
import { useAuthStatus } from '@/hooks/useAuth'
import type { ProtectedRouteProps } from '@neonpro/types'

// Componente de loading para autenticação
export const AuthLoading: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Verificando autenticação...</p>
    </div>
  </div>
)

// Componente de acesso negado
export const AccessDenied: React.FC<{ reason?: string }> = ({ reason }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center max-w-md">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
      <p className="text-gray-600 mb-6">
        {reason || 'Você não tem permissão para acessar esta página.'}
      </p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Voltar
      </button>
    </div>
  </div>
)

// Componente para proteger rotas
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireEmailVerification = false,
  allowedProfessions,
  fallback,
}) => {
  const { 
    isLoggedIn, 
    isEmailVerified, 
    isLoading, 
    user 
  } = useAuthStatus()

  // Mostrar loading durante verificação
  if (isLoading) {
    return fallback || <AuthLoading />
  }

  // Verificar se usuário está logado
  if (!isLoggedIn) {
    return <AccessDenied reason="Você precisa fazer login para acessar esta página." />
  }

  // Verificar verificação de email se necessário
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <AccessDenied reason="Você precisa verificar seu email para acessar esta página." />
    )
  }

  // Verificar profissões permitidas
  if (allowedProfessions && user?.profession) {
    if (!allowedProfessions.includes(user.profession)) {
      return (
        <AccessDenied reason="Você não tem o perfil profissional necessário para acessar esta página." />
      )
    }
  }

  return <>{children}</>
}