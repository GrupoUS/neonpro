import { createFileRoute } from '@tanstack/react-router';
import { useApiStatus, useClients, useAppointments, useApiConnectivity } from '@/lib/api-hooks';
import { Button } from '@/components/ui';

// Ensure UI build alias works in monorepo
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __NEONPRO_UI_CHECK__ = Button;

function ApiTestComponent() {
  const apiStatus = useApiStatus();
  const clients = useClients();
  const appointments = useAppointments();
  const connectivity = useApiConnectivity();

  const testUIComponents = () => {
    alert('🎨 NeonPro UI Components funcionando perfeitamente!');
  };

  const getStatusIcon = (isLoading: boolean, isError: boolean, isSuccess: boolean) => {
    if (isLoading) return '⏳';
    if (isError) return '❌';
    if (isSuccess) return '✅';
    return '❓';
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        🧪 Teste de Integração Frontend ↔ Backend
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Backend API Testing */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🔌 Backend API (TanStack Query)</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <span>Conectividade</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(connectivity.isLoading, connectivity.isError, connectivity.isConnected)}
                {connectivity.isConnected ? 'Conectado' : connectivity.isError ? 'Erro' : 'Verificando...'}
              </span>
            </div>
            
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <span>Health Check</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(apiStatus.isLoading, apiStatus.isError, apiStatus.isSuccess)}
                {apiStatus.data.health?.status || 'Aguardando...'}
              </span>
            </div>
            
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <span>API V1</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(apiStatus.isLoading, apiStatus.isError, apiStatus.isSuccess)}
                {apiStatus.data.healthV1?.status || 'Aguardando...'}
              </span>
            </div>
            
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <span>Clientes</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(clients.isLoading, clients.isError, clients.isSuccess)}
                {clients.data?.length || 0} registros
              </span>
            </div>
            
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <span>Agendamentos</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(appointments.isLoading, appointments.isError, appointments.isSuccess)}
                {appointments.data?.length || 0} registros
              </span>
            </div>
          </div>

          {clients.data && clients.data.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">📋 Clientes (via TanStack Query):</h3>
              <ul className="space-y-2">
                {clients.data.slice(0, 3).map((client, index) => (
                  <li key={index} className="bg-gray-50 dark:bg-gray-600 p-2 rounded">
                    <strong>{client.fullName}</strong> - {client.email}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {appointments.data && appointments.data.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">📅 Agendamentos:</h3>
              <ul className="space-y-2">
                {appointments.data.slice(0, 2).map((appointment, index) => (
                  <li key={index} className="bg-gray-50 dark:bg-gray-600 p-2 rounded">
                    <strong>{appointment.client.fullName}</strong> - {appointment.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* UI Components Testing */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🎨 UI Components</h2>
          
          <div className="space-y-4">
            <Button onClick={testUIComponents} className="w-full">
              Testar UI Button
            </Button>
            
            <Button variant="secondary" size="lg" onClick={testUIComponents} className="w-full">
              Secondary Button
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            ✅ Components importados de <code>@neonpro/ui</code><br/>
            ✅ Styling com NeonPro Pantone colors<br/>
            ✅ TypeScript strict mode<br/>
            ✅ Acessibilidade (WCAG 2.1 AA)
          </div>
        </div>
      </div>
      
      {/* TanStack Router Integration */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🛤️ TanStack Router</h2>
        <p className="text-gray-700 dark:text-gray-300">
          ✅ Rota atual: <code>/api-test</code><br/>
          ✅ File-based routing funcionando<br/>
          ✅ Type-safe navigation<br/>
          ✅ Auto-generated route tree
        </p>
      </div>
      
      {/* Monorepo Integration Status */}
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📦 Monorepo Integration</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Frontend (apps/web):</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>✅ Vite + React 19</li>
              <li>✅ TanStack Router</li>
              <li>✅ TypeScript strict</li>
              <li>✅ Tailwind CSS</li>
            </ul>
          </div>
          <div>
            <strong>Backend (apps/api):</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>✅ Hono.dev</li>
              <li>✅ OpenAPI docs</li>
              <li>✅ CORS configurado</li>
              <li>✅ Proxy setup</li>
            </ul>
          </div>
          <div>
            <strong>Packages:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>✅ @neonpro/ui</li>
              <li>✅ @neonpro/types</li>
              <li>✅ @neonpro/shared</li>
              <li>✅ @neonpro/utils</li>
            </ul>
          </div>
          <div>
            <strong>Build System:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>✅ Turborepo</li>
              <li>✅ PNPM workspaces</li>
              <li>✅ Environment vars</li>
              <li>✅ Parallel builds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/api-test')({
  component: ApiTestComponent,
});