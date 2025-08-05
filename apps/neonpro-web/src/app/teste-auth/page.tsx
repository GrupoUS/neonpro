import type { SignInButton, SignOutButton } from "@clerk/nextjs";
import type { auth, currentUser } from "@clerk/nextjs/server";
import type { redirect } from "next/navigation";

export default async function TesteAuthPage() {
  const { userId } = auth();
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            🧪 Teste de Autenticação Clerk
          </h1>

          {/* Authentication Status */}
          <div className="mb-8">
            {userId ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-emerald-900 mb-4">
                  ✅ Usuário Autenticado
                </h2>
                <div className="space-y-3 text-emerald-800">
                  <p>
                    <strong>User ID:</strong> {userId}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress || "N/A"}
                  </p>
                  <p>
                    <strong>Nome:</strong> {user?.firstName} {user?.lastName}
                  </p>
                  <p>
                    <strong>Criado em:</strong>{" "}
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>

                <div className="mt-6">
                  <SignOutButton>
                    <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      🚪 Sair da Conta
                    </button>
                  </SignOutButton>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-amber-900 mb-4">
                  ⚠️ Usuário Não Autenticado
                </h2>
                <p className="text-amber-800 mb-6">
                  Você precisa fazer login para acessar funcionalidades protegidas.
                </p>

                <div className="space-x-4">
                  <SignInButton mode="redirect" redirectUrl="/teste-auth">
                    <button className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      🔑 Fazer Login
                    </button>
                  </SignInButton>

                  <a
                    href="/auth/cadastrar"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
                  >
                    ➕ Criar Conta
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Middleware Tests */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">🛡️ Testes de Middleware</h3>
              <div className="space-y-3">
                <a
                  href="/dashboard"
                  className="block bg-blue-100 hover:bg-blue-200 text-blue-800 p-3 rounded-lg transition-colors"
                >
                  📊 Dashboard (Protegido)
                </a>
                <a
                  href="/admin"
                  className="block bg-purple-100 hover:bg-purple-200 text-purple-800 p-3 rounded-lg transition-colors"
                >
                  👑 Admin (Admin Only)
                </a>
                <a
                  href="/patients"
                  className="block bg-green-100 hover:bg-green-200 text-green-800 p-3 rounded-lg transition-colors"
                >
                  🏥 Pacientes (Healthcare)
                </a>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                🔍 Testes de Páginas Públicas
              </h3>
              <div className="space-y-3">
                <a
                  href="/"
                  className="block bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-lg transition-colors"
                >
                  🏠 Home (Público)
                </a>
                <a
                  href="/pricing"
                  className="block bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-3 rounded-lg transition-colors"
                >
                  💰 Pricing (Público)
                </a>
                <a
                  href="/demo"
                  className="block bg-cyan-100 hover:bg-cyan-200 text-cyan-800 p-3 rounded-lg transition-colors"
                >
                  🎯 Demo (Público)
                </a>
              </div>
            </div>
          </div>

          {/* Implementation Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Status da Implementação</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
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
  title: "Teste de Autenticação - NeonPro",
  description: "Página de teste para validar integração Clerk",
  robots: "noindex, nofollow",
};
