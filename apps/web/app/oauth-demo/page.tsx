import type { Metadata } from 'next';
import EnhancedOAuthDemo from '@/components/auth/enhanced-oauth-demo';

export const metadata: Metadata = {
  title: 'Enhanced OAuth Demo - NeonPro',
  description:
    'Demonstração das funcionalidades aprimoradas de OAuth Google Integration',
};

export default function OAuthDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-bold text-4xl text-gray-900">
            Enhanced OAuth Google Integration
          </h1>
          <p className="mx-auto max-w-3xl text-gray-600 text-xl">
            Demonstração completa das funcionalidades aprimoradas de
            autenticação OAuth, incluindo auditoria de segurança, sistema de
            permissões granular, gerenciamento de sessão avançado e conformidade
            com LGPD.
          </p>
        </div>

        <EnhancedOAuthDemo />

        <div className="mt-12 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 font-bold text-2xl text-gray-800">
            Funcionalidades Implementadas
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-800">
                🔐 OAuth Aprimorado
              </h3>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• Popup otimizado ≤3s</li>
                <li>• Tratamento inteligente de erros</li>
                <li>• Fallback automático</li>
                <li>• Performance tracking</li>
              </ul>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-800">
                🛡️ Sistema de Permissões
              </h3>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Validação granular</li>
                <li>• Roles hierárquicas</li>
                <li>• Permissões condicionais</li>
                <li>• Cache inteligente</li>
              </ul>
            </div>

            <div className="rounded-lg bg-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-purple-800">
                📊 Auditoria de Segurança
              </h3>
              <ul className="space-y-1 text-purple-700 text-sm">
                <li>• Logs em tempo real</li>
                <li>• Conformidade LGPD</li>
                <li>• Relatórios automáticos</li>
                <li>• Alertas de segurança</li>
              </ul>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4">
              <h3 className="mb-2 font-semibold text-yellow-800">
                ⚡ Sessão Aprimorada
              </h3>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Timeout inteligente</li>
                <li>• Monitoramento de atividade</li>
                <li>• Logout seguro</li>
                <li>• Prevenção de hijacking</li>
              </ul>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-800">
                🚨 Tratamento de Erros
              </h3>
              <ul className="space-y-1 text-red-700 text-sm">
                <li>• Classificação automática</li>
                <li>• Mensagens amigáveis</li>
                <li>• Ações de recuperação</li>
                <li>• Logging detalhado</li>
              </ul>
            </div>

            <div className="rounded-lg bg-indigo-50 p-4">
              <h3 className="mb-2 font-semibold text-indigo-800">
                📋 Conformidade LGPD
              </h3>
              <ul className="space-y-1 text-indigo-700 text-sm">
                <li>• Consentimento granular</li>
                <li>• Auditoria de acesso</li>
                <li>• Relatórios de compliance</li>
                <li>• Direitos do titular</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
