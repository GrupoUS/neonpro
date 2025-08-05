"use client";

import React, { useEffect, useState } from "react";
import type { useAuth } from "@/contexts/auth-context";
import type { permissionValidator } from "@/lib/auth/permission-validator";
import type { securityAuditLogger } from "@/lib/auth/security-audit-logger";
import type { sessionManager } from "@/lib/auth/session/SessionManager";

interface AuditLog {
  id: string;
  event_type: string;
  severity: string;
  timestamp: string;
  details: any;
}

interface PermissionCheck {
  resource: string;
  action: string;
  granted: boolean;
}

export default function EnhancedOAuthDemo() {
  const { user, session, signInWithGoogle, signOut, checkPermission, getUserPermissions, hasRole } =
    useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [permissions, setPermissions] = useState<any>(null);
  const [permissionChecks, setPermissionChecks] = useState<PermissionCheck[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load audit logs
  const loadAuditLogs = async () => {
    if (!user) return;

    try {
      const logs = await securityAuditLogger.getAuditLogs({
        userId: user.id,
        limit: 10,
        eventTypes: [
          "oauth_attempt",
          "oauth_success",
          "oauth_error",
          "session_created",
          "session_logout",
        ],
      });
      setAuditLogs(logs);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    }
  };

  // Load user permissions
  const loadPermissions = async () => {
    if (!user) return;

    try {
      const userPerms = await getUserPermissions();
      setPermissions(userPerms);
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  };

  // Load session information
  const loadSessionInfo = async () => {
    if (!session) return;

    try {
      const info = await sessionManager.getActiveSessions(user.id);
      setSessionInfo(info);
    } catch (error) {
      console.error("Error loading session info:", error);
    }
  };

  // Test permission checks
  const testPermissions = async () => {
    if (!user) return;

    const tests = [
      { resource: "patients", action: "read" },
      { resource: "patients", action: "write" },
      { resource: "appointments", action: "create" },
      { resource: "reports", action: "generate" },
      { resource: "admin", action: "manage" },
    ];

    const results: PermissionCheck[] = [];

    for (const test of tests) {
      try {
        const granted = await checkPermission(test.resource, test.action);
        results.push({ ...test, granted });
      } catch (error) {
        console.error(`Error checking permission ${test.resource}:${test.action}:`, error);
        results.push({ ...test, granted: false });
      }
    }

    setPermissionChecks(results);
  };

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        console.error("OAuth error:", result.error);
      }
    } catch (error) {
      console.error("Unexpected OAuth error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      setAuditLogs([]);
      setPermissions(null);
      setPermissionChecks([]);
      setSessionInfo(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user && session) {
      loadAuditLogs();
      loadPermissions();
      loadSessionInfo();
      testPermissions();
    }
  }, [user, session]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Enhanced OAuth Google Integration Demo
        </h2>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Demonstra as funcionalidades aprimoradas de OAuth, incluindo:
          </p>

          <ul className="text-left text-gray-700 mb-8 space-y-2">
            <li>• 🔐 Autenticação Google OAuth otimizada</li>
            <li>• 📊 Auditoria de segurança em tempo real</li>
            <li>• 🛡️ Sistema de permissões granular</li>
            <li>• ⚡ Gerenciamento de sessão aprimorado</li>
            <li>• 🚨 Tratamento inteligente de erros</li>
            <li>• 📋 Conformidade com LGPD</li>
          </ul>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {loading ? "Conectando..." : "Entrar com Google"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Enhanced OAuth Dashboard</h2>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? "Saindo..." : "Sair"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Usuário Autenticado</h3>
            <p className="text-green-700">Email: {user.email}</p>
            <p className="text-green-700">ID: {user.id}</p>
            <p className="text-green-700">Nome: {user.user_metadata?.name || "N/A"}</p>
          </div>

          {sessionInfo && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Informações da Sessão</h3>
              <p className="text-blue-700">
                Criada: {new Date(sessionInfo.created_at).toLocaleString()}
              </p>
              <p className="text-blue-700">
                Última atividade: {new Date(sessionInfo.last_activity).toLocaleString()}
              </p>
              <p className="text-blue-700">IP: {sessionInfo.ip_address || "N/A"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Permissions Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Sistema de Permissões</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Permissões do Usuário</h4>
            {permissions ? (
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Roles:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {permissions.roles?.map((role: any, index: number) => (
                      <li key={index}>
                        {role.name} - {role.description}
                      </li>
                    )) || <li>Nenhuma role encontrada</li>}
                  </ul>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Permissões Diretas:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {permissions.directPermissions?.map((perm: any, index: number) => (
                      <li key={index}>
                        {perm.resource}:{perm.action}
                      </li>
                    )) || <li>Nenhuma permissão direta</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Carregando permissões...</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Teste de Permissões</h4>
            <div className="space-y-2">
              {permissionChecks.map((check, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    check.granted ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  <span className={check.granted ? "✅" : "❌"}></span> {check.resource}:
                  {check.action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Logs de Auditoria de Segurança</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Timestamp</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Evento</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Severidade
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">{log.event_type}</td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        log.severity === "high"
                          ? "bg-red-100 text-red-800"
                          : log.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {JSON.stringify(log.details, null, 2).substring(0, 100)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {auditLogs.length === 0 && (
            <p className="text-center text-gray-500 py-4">Nenhum log de auditoria encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
