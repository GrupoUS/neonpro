import { createFileRoute } from '@tanstack/react-router'
import { Navigate } from "@tanstack/react-router"
import { SignUpForm } from '@/components/auth/index.js'
import { useAuthStatus } from '@/hooks/useAuth.js'

export const Route = createFileRoute('/auth/signup')({
  component: SignUpPage,
})

function SignUpPage() {
  const { isAuthenticated } = useAuthStatus()

  // Redirecionamento se já estiver logado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const handleSignUpSuccess = () => {
    // Redirecionar para página de login após cadastro bem-sucedido
    window.location.href = '/auth/login?registered=true'
  }

  const handleSignIn = () => {
    // Navegar para página de login
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">NeonPro</h1>
          <p className="text-gray-600">Crie sua conta na plataforma mais completa para clínicas</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SignUpForm
          onSuccess={handleSignUpSuccess}
          onSignIn={handleSignIn}
        />
      </div>

      {/* Informações adicionais sobre LGPD e segurança */}
      <div className="mt-8 text-center text-xs text-gray-500 max-w-2xl mx-auto px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">🔒 Segurança e Privacidade</h3>
          <p className="text-blue-700">
            Seus dados são criptografados e protegidos conforme as normas da LGPD. 
            Utilizamos as melhores práticas de segurança para proteger informações médicas e pessoais.
          </p>
        </div>
        
        <p>
          Já tem uma conta?{' '}
          <button
            onClick={handleSignIn}
            className="text-blue-600 hover:underline font-medium"
          >
            Faça login aqui
          </button>
        </p>
      </div>
    </div>
  )
}