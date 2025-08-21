/**
 * Exemplo de Uso Completo do Sistema de Autenticação NeonPro
 * Demonstra integração de todos os componentes implementados
 */

'use client';

import React from 'react';
import { AuthProvider, ProtectedRoute, useAuth, withAuth } from './index';

// === 1. CONFIGURAÇÃO DO PROVIDER NO ROOT LAYOUT ===
export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

// === 2. COMPONENTE DE LOGIN ===
function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login({ email, password });

    if (result.success) {
      // Redirecionamento será feito automaticamente pelo AuthProvider
      console.log('Login realizado com sucesso!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center font-extrabold text-3xl text-gray-900">
            Faça login em sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div>
            <input
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <input
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              type="password"
              value={password}
            />
          </div>

          <div>
            <button
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// === 3. NAVBAR COM INFORMAÇÕES DO USUÁRIO ===
function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    // Redirecionamento será feito automaticamente
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <h1 className="font-semibold text-xl">NeonPro Healthcare</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm">
              Olá, {user?.name || user?.email}
            </span>
            <span className="text-gray-500 text-xs">
              {user?.role && `(${user.role})`}
            </span>
            <button
              className="text-gray-500 text-sm hover:text-gray-700"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// === 4. PÁGINA PROTEGIDA - DASHBOARD ===
function DashboardPage() {
  const { user, getValidToken } = useAuth();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const fetchProtectedData = async () => {
    setLoading(true);
    try {
      const token = await getValidToken();

      const response = await fetch('/api/v1/patients', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProtectedData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="mb-6 font-bold text-2xl text-gray-900">
          Dashboard - {user?.tenantId}
        </h1>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-indigo-600 border-b-2" />
                <p className="mt-2 text-gray-500 text-sm">
                  Carregando dados...
                </p>
              </div>
            ) : (
              <div>
                <h3 className="mb-4 font-medium text-gray-900 text-lg">
                  Dados Protegidos
                </h3>
                <pre className="rounded bg-gray-100 p-4 text-sm">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Versão protegida do Dashboard usando HOC
const ProtectedDashboard = withAuth(DashboardPage, {
  requiredRole: 'healthcare_professional',
});

// === 5. PÁGINA ADMINISTRATIVA (APENAS ADMINS) ===
function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <h1 className="font-bold text-2xl text-gray-900">
        Painel Administrativo
      </h1>
      <p className="mt-2 text-gray-600">
        Esta página é acessível apenas para administradores.
      </p>
    </div>
  );
}

// === 6. ESTRUTURA PRINCIPAL DA APLICAÇÃO ===
export function AppExample() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-indigo-600 border-b-2" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        {/* Dashboard - Requer autenticação */}
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>

        {/* Área administrativa - Requer role admin */}
        <ProtectedRoute
          fallback={
            <div className="p-8 text-center">
              <p>Acesso restrito a administradores</p>
            </div>
          }
          requiredRole="admin"
        >
          <AdminPage />
        </ProtectedRoute>
      </main>
    </div>
  );
}

// === 7. EXEMPLO DE USO EM COMPONENT SERVER (NEXT.JS) ===
export async function ServerComponentExample() {
  return (
    <AuthProvider>
      <AppExample />
    </AuthProvider>
  );
}

// === 8. HOOK PERSONALIZADO PARA API CALLS ===
export function useApiCall() {
  const { getAuthHeader } = useAuth();

  const apiCall = React.useCallback(
    async (url: string, options: RequestInit = {}) => {
      const authHeader = await getAuthHeader();

      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
          ...options.headers,
        },
      });
    },
    [getAuthHeader]
  );

  return { apiCall };
}

// === 9. EXEMPLO DE TESTE E VALIDAÇÃO ===
export async function validateAuthSystem() {
  const { runAllAuthTests } = await import('./auth-e2e-test');

  const testCredentials = {
    email: 'admin@neonpro.com.br',
    password: 'test123',
  };

  const results = await runAllAuthTests(testCredentials);

  console.log('Resultados dos testes de autenticação:', results);

  return results.overallSuccess;
}
