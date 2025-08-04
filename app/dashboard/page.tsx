/**
 * Example Dashboard Component
 * Demonstrates the new Clerk authentication integration
 */

import { requireAuth, hasRole, HealthcareRoles } from '@/lib/auth';
import { UserButton, SignedIn } from '@/lib/auth';

export default async function DashboardPage() {
  // Require authentication for this page
  const auth = await requireAuth();
  
  // Check if user has admin role
  const isAdmin = await hasRole(HealthcareRoles.ADMIN);
  const isDoctor = await hasRole(HealthcareRoles.DOCTOR);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-900">
                NeonPro Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignedIn>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    Bem-vindo, {auth.user?.firstName}
                  </span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic dashboard card */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Pacientes
            </h3>
            <p className="text-sm text-slate-600">
              Gerencie os dados dos seus pacientes
            </p>
          </div>

          {/* Admin-only card */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Administração
              </h3>
              <p className="text-sm text-slate-600">
                Configurações do sistema (apenas admins)
              </p>
            </div>
          )}

          {/* Doctor-only card */}
          {isDoctor && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Prontuários
              </h3>
              <p className="text-sm text-slate-600">
                Acesso aos prontuários médicos
              </p>
            </div>
          )}
        </div>

        {/* User info section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Informações da Sessão
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">ID do Usuário</dt>
              <dd className="text-sm text-slate-900 font-mono">{auth.userId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">ID da Sessão</dt>
              <dd className="text-sm text-slate-900 font-mono">{auth.sessionId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="text-sm text-slate-900">{auth.user?.emailAddresses[0]?.emailAddress}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Último Login</dt>
              <dd className="text-sm text-slate-900">
                {auth.user?.lastSignInAt ? new Date(auth.user.lastSignInAt).toLocaleString('pt-BR') : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}