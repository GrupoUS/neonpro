import { ProtectedRoute } from '@/components/auth/ProtectedRoute.js'
import { useAuth } from '@/contexts/AuthContext.js'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <ProtectedRoute requireEmailVerification={false}>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    const result = await signOut()
    if (!result.error) {
      window.location.href = '/auth/login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard - NeonPro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.firstName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Bem-vindo ao NeonPro!
              </h2>
              <p className="text-gray-600 mb-6">
                Autenticação configurada com sucesso! Você está logado e pode acessar o sistema.
              </p>

              {/* Informações do usuário */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Seus Dados</h3>
                <div className="space-y-2 text-sm text-left">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Nome:</strong> {user?.firstName} {user?.lastName}</p>
                  <p><strong>Profissão:</strong> {user?.profession}</p>
                  {user?.license && <p><strong>Registro:</strong> {user.license}</p>}
                  <p><strong>Email Verificado:</strong> {user?.emailVerified ? '✅ Sim' : '❌ Não'}</p>
                  <p><strong>Criado em:</strong> {user?.createdAt?.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-green-800 font-medium">✅ Sistema de Autenticação</h4>
                  <p className="text-green-700 text-sm">
                    Login/Logout, proteção de rotas e gerenciamento de sessão funcionando!
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-yellow-800 font-medium">🚧 Próximos Passos</h4>
                  <p className="text-yellow-700 text-sm">
                    Implementar OAuth (Google), recuperação de senha e verificação de email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
