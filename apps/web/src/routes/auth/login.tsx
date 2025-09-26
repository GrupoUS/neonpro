import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth'
import { useAuthStatus } from '@/hooks/useAuth'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
  beforeLoad: ({ context }) => {
    // Redirecionar se já estiver logado
    // Esta lógica será implementada quando o context de auth estiver disponível
  },
})

function LoginPage() {
  const { isLoggedIn } = useAuthStatus()

  // Redirecionamento client-side se já estiver logado
  if (isLoggedIn) {
    window.location.href = '/dashboard'
    return null
  }

  const handleLoginSuccess = () => {
    // Redirecionar para dashboard após login bem-sucedido
    window.location.href = '/dashboard'
  }

  const handleSignUp = () => {
    // Navegar para página de cadastro
    window.location.href = '/auth/signup'
  }

  const handleForgotPassword = () => {
    // Navegar para página de recuperação de senha
    window.location.href = '/auth/forgot-password'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">NeonPro</h1>
          <p className="text-gray-600">Plataforma de Gestão para Clínicas de Estética</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSignUp={handleSignUp}
          onForgotPassword={handleForgotPassword}
        />
      </div>

      {/* LGPD Notice */}
      <div className="mt-8 text-center text-xs text-gray-500 max-w-md mx-auto">
        <p>
          Ao fazer login, você concorda com nossos{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Política de Privacidade
          </a>
          . Seus dados são protegidos conforme a LGPD.
        </p>
      </div>
    </div>
  )
}