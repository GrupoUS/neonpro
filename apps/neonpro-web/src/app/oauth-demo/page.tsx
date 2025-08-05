import type { Metadata } from "next";
import EnhancedOAuthDemo from "@/components/auth/enhanced-oauth-demo";

export const metadata: Metadata = {
  title: "Enhanced OAuth Demo - NeonPro",
  description: "Demonstração das funcionalidades aprimoradas de OAuth Google Integration",
};

export default function OAuthDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced OAuth Google Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Demonstração completa das funcionalidades aprimoradas de autenticação OAuth, incluindo
            auditoria de segurança, sistema de permissões granular, gerenciamento de sessão avançado
            e conformidade com LGPD.
          </p>
        </div>

        <EnhancedOAuthDemo />

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Funcionalidades Implementadas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🔐 OAuth Aprimorado</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Popup otimizado ≤3s</li>
                <li>• Tratamento inteligente de erros</li>
                <li>• Fallback automático</li>
                <li>• Performance tracking</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🛡️ Sistema de Permissões</h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Validação granular</li>
                <li>• Roles hierárquicas</li>
                <li>• Permissões condicionais</li>
                <li>• Cache inteligente</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">📊 Auditoria de Segurança</h3>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Logs em tempo real</li>
                <li>• Conformidade LGPD</li>
                <li>• Relatórios automáticos</li>
                <li>• Alertas de segurança</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">⚡ Sessão Aprimorada</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Timeout inteligente</li>
                <li>• Monitoramento de atividade</li>
                <li>• Logout seguro</li>
                <li>• Prevenção de hijacking</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">🚨 Tratamento de Erros</h3>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Classificação automática</li>
                <li>• Mensagens amigáveis</li>
                <li>• Ações de recuperação</li>
                <li>• Logging detalhado</li>
              </ul>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-800 mb-2">📋 Conformidade LGPD</h3>
              <ul className="text-indigo-700 text-sm space-y-1">
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
