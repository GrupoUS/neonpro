/**
 * Exemplo de Uso Completo do Sistema de Autenticação NeonPro
 * Demonstra integração de todos os componentes implementados
 */

'use client';

import React from 'react';
import { AuthProvider, useAuth, ProtectedRoute, withAuth } from './index';

// === 1. CONFIGURAÇÃO DO PROVIDER NO ROOT LAYOUT ===
export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Faça login em sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email"
            />
          </div>
          
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Senha"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">NeonPro Healthcare</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Olá, {user?.name || user?.email}
            </span>
            <span className="text-xs text-gray-500">
              {user?.role && `(${user.role})`}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
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
          'Authorization': `Bearer ${token}`,
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Dashboard - {user?.tenantId}
        </h1>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Carregando dados...</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Dados Protegidos
                </h3>
                <pre className="bg-gray-100 p-4 rounded text-sm">
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
          requiredRole="admin"
          fallback={
            <div className="text-center p-8">
              <p>Acesso restrito a administradores</p>
            </div>
          }
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

  const apiCall = React.useCallback(async (
    url: string, 
    options: RequestInit = {}
  ) => {
    const authHeader = await getAuthHeader();
    
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
        ...options.headers,
      },
    });
  }, [getAuthHeader]);

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