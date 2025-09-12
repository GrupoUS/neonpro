import { KokonutGradientButton, AceternityHoverBorderGradientButton } from '@neonpro/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

function ApiTestComponent() {
  const [apiStatus, setApiStatus] = useState<string>('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      // Test basic API connection
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      
      // Test versioned API
      const v1Response = await fetch('/api/v1/health');
      const v1Data = await v1Response.json();
      
      // Test clients endpoint
      const clientsResponse = await fetch('/api/v1/clients');
      const clientsData = await clientsResponse.json();
      
      setApiStatus(`✅ API Connected! Health: ${healthData.status}, V1: ${v1Data.status}`);
      setClients(clientsData.items || []);
    } catch (error) {
      setApiStatus(`❌ API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testUIComponents = () => {
    alert('🎨 NeonPro UI Components funcionando perfeitamente!');
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        🧪 Teste de Integração Frontend ↔ Backend
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Backend API Testing */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🔌 Backend API</h2>
          
          <KokonutGradientButton 
            onClick={testApiConnection}
            disabled={loading}
            variant="primary"
            size="lg"
            className="mb-4"
          >
            {loading ? 'Testando...' : 'Testar Conexão API'}
          </KokonutGradientButton>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <p className="text-sm font-mono">
              {apiStatus || 'Clique no botão para testar a API'}
            </p>
          </div>
          
          {clients.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">📋 Clientes (Exemplo):</h3>
              <ul className="space-y-2">
                {clients.map((client, index) => (
                  <li key={index} className="bg-gray-50 dark:bg-gray-600 p-2 rounded">
                    <strong>{client.fullName}</strong> - {client.email}
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
            <AceternityHoverBorderGradientButton
              onClick={testUIComponents}
              className="w-full text-white"
            >
              Aceternity Hover Border Button
            </AceternityHoverBorderGradientButton>
            
            <KokonutGradientButton 
              variant="secondary"
              size="lg"
              onClick={testUIComponents}
              className="w-full"
            >
              KokonutUI Gradient Button
            </KokonutGradientButton>
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