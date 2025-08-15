import { SignInButton, SignOutButton } from '@clerk/nextjs';
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function TesteAuthPage() {
  const { userId } = auth();
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="mb-6 text-center font-bold text-3xl text-slate-900">
            🧪 Teste de Autenticação Clerk
          </h1>

          {/* Authentication Status */}
          <div className="mb-8">
            {userId ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                <h2 className="mb-4 font-semibold text-emerald-900 text-xl">
                  ✅ Usuário Autenticado
                </h2>
                <div className="space-y-3 text-emerald-800">
                  <p>
                    <strong>User ID:</strong> {userId}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {user?.emailAddresses[0]?.emailAddress || 'N/A'}
                  </p>
                  <p>
                    <strong>Nome:</strong> {user?.firstName} {user?.lastName}
                  </p>
                  <p>
                    <strong>Criado em:</strong>{' '}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </p>
                </div>

                <div className="mt-6">
                  <SignOutButton>
                    <button className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600">
                      🚪 Sair da Conta
                    </button>
                  </SignOutButton>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="mb-4 font-semibold text-amber-900 text-xl">
                  ⚠️ Usuário Não Autenticado
                </h2>
                <p className="mb-6 text-amber-800">
                  Você precisa fazer login para acessar funcionalidades
                  protegidas.
                </p>

                <div className="space-x-4">
                  <SignInButton mode="redirect" redirectUrl="/teste-auth">
                    <button className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-white transition-colors hover:bg-sky-600">
                      🔑 Fazer Login
                    </button>
                  </SignInButton>

                  <a
                    className="inline-block rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600"
                    href="/auth/cadastrar"
                  >
                    ➕ Criar Conta
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Middleware Tests */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-6">
              <h3 className="mb-4 font-semibold text-lg text-slate-900">
                🛡️ Testes de Middleware
              </h3>
              <div className="space-y-3">
                <a
                  className="block rounded-lg bg-blue-100 p-3 text-blue-800 transition-colors hover:bg-blue-200"
                  href="/dashboard"
                >
                  📊 Dashboard (Protegido)
                </a>
                <a
                  className="block rounded-lg bg-purple-100 p-3 text-purple-800 transition-colors hover:bg-purple-200"
                  href="/admin"
                >
                  👑 Admin (Admin Only)
                </a>
                <a
                  className="block rounded-lg bg-green-100 p-3 text-green-800 transition-colors hover:bg-green-200"
                  href="/patients"
                >
                  🏥 Pacientes (Healthcare)
                </a>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-6">
              <h3 className="mb-4 font-semibold text-lg text-slate-900">
                🔍 Testes de Páginas Públicas
              </h3>
              <div className="space-y-3">
                <a
                  className="block rounded-lg bg-gray-100 p-3 text-gray-800 transition-colors hover:bg-gray-200"
                  href="/"
                >
                  🏠 Home (Público)
                </a>
                <a
                  className="block rounded-lg bg-yellow-100 p-3 text-yellow-800 transition-colors hover:bg-yellow-200"
                  href="/pricing"
                >
                  💰 Pricing (Público)
                </a>
                <a
                  className="block rounded-lg bg-cyan-100 p-3 text-cyan-800 transition-colors hover:bg-cyan-200"
                  href="/demo"
                >
                  🎯 Demo (Público)
                </a>
              </div>
            </div>
          </div>

          {/* Implementation Status */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-4 font-semibold text-blue-900 text-lg">
              📋 Status da Implementação
            </h3>
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600">✅</span>
                  <span>Clerk Provider configurado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600">✅</span>
                  <span>Middleware clerkMiddleware ativo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600">✅</span>
                  <span>Páginas de autenticação em português</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600">✅</span>
                  <span>Headers de segurança LGPD</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600">🔄</span>
                  <span>Integração com subscription middleware</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600">🔄</span>
                  <span>Integração com RBAC middleware</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600">🔄</span>
                  <span>Audit logging integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">⏳</span>
                  <span>Testes automatizados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Teste de Autenticação - NeonPro',
  description: 'Página de teste para validar integração Clerk',
  robots: 'noindex, nofollow',
};
