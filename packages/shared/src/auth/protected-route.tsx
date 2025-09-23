/**
 * ProtectedRoute - Componente para proteger rotas que requerem autenticação
 * DISABLED: Using TanStack Router authentication instead
 * This component is kept for backward compatibility but not used in current app
 */

"use client";

// NOTE: Using TanStack Router for protected routes
// import { useRouter, } from 'next/navigation'
import type React from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { auditLogger } from '../logging/healthcare-logger';

const authLogger = auditLogger.child({ component: 'protected-route' });

export interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requiredRole?: string;
  requiredPermissions?: string[];
}

/**
 * Loading component padrão
 */
function DefaultLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
    </div>
  );
}

/**
 * Unauthorized component padrão
 */
function DefaultUnauthorizedFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 font-bold text-2xl text-gray-900">Acesso Negado</h1>
        <p className="text-gray-600">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    </div>
  );
}

/**
 * Componente de proteção de rotas
 */
export function ProtectedRoute({
  children,
  fallback = <DefaultLoadingFallback />,
  redirectTo = "/login",
  requireAuth = true,
  requiredRole,
  requiredPermissions = [],
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  // DISABLED: Using TanStack Router authentication instead
  // const router = useRouter()

  // Legacy component - return children directly for backward compatibility
  // TanStack Router handles route protection natively

  // Ainda carregando
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Não requer autenticação
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Não autenticado - redirecionar
  if (!(isAuthenticated && user)) {
    // NOTE: Using TanStack Router for protected routes router
    // router.push(redirectTo,)
    authLogger.warn("User not authenticated, redirect to", {
      component: 'protected-route',
      action: 'authentication_redirect',
      redirectTo,
      timestamp: new Date().toISOString()
    });
    return <>{fallback}</>;
  }

  // Verificar role obrigatória
  if (requiredRole && user._role !== requiredRole) {
    return <DefaultUnauthorizedFallback />;
  }

  // Verificar permissões (implementação básica - pode ser expandida)
  if (requiredPermissions.length > 0) {
    // TODO: Implementar sistema de permissões mais robusto
    // Por enquanto, apenas verifica se é admin para qualquer permissão especial
    const hasPermissions =
      user._role === "admin" ||
      requiredPermissions.every((permission) => {
        // Lógica de permissões específica pode ser implementada aqui
        return true; // Placeholder
      });

    if (!hasPermissions) {
      return <DefaultUnauthorizedFallback />;
    }
  }

  // Usuário autorizado
  return <>{children}</>;
}

/**
 * HOC para proteger componentes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, "children">,
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook para verificar permissões
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (requiredRole: string): boolean => {
    return user?._role === requiredRole;
  };

  const hasPermission = (permission: string): boolean => {
    // TODO: Implementar lógica de permissões mais sofisticada
    // Por enquanto, admin tem todas as permissões
    if (user?._role === "admin") {
      return true;
    }

    // Implementar verificação específica de permissões aqui
    return false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: hasRole("admin"),
    isUser: hasRole("user"),
    isHealthcareProfessional: hasRole("healthcare_professional"),
  };
}
