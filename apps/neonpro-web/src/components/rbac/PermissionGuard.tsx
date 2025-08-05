/**
 * Permission Guard Component for RBAC
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This component provides declarative permission-based access control for React components
 */

import React, { ReactNode, useEffect, useState } from "react";
import type { UserRole, Permission } from "@/types/rbac";
import type { usePermissions, useRole } from "@/hooks/usePermissions";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Skeleton } from "@/components/ui/skeleton";
import type { Shield, ShieldAlert, Lock } from "lucide-react";

/**
 * Permission Guard Props
 */
export interface PermissionGuardProps {
  /** Child components to render if access is granted */
  children: ReactNode;

  /** Required role (minimum role level) */
  requiredRole?: UserRole;

  /** Required permissions (user must have ALL) */
  requiredPermissions?: Permission[];

  /** Alternative permissions (user must have ANY) */
  anyPermissions?: Permission[];

  /** Resource ID for resource-specific permissions */
  resourceId?: string;

  /** Custom fallback component when access is denied */
  fallback?: ReactNode;

  /** Custom loading component */
  loadingComponent?: ReactNode;

  /** Show default access denied message */
  showAccessDenied?: boolean;

  /** Custom access denied message */
  accessDeniedMessage?: string;

  /** Render as fragment (no wrapper div) */
  asFragment?: boolean;

  /** Custom check function */
  customCheck?: () => Promise<boolean> | boolean;
}

/**
 * Default loading component
 */
const DefaultLoading: React.FC = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

/**
 * Default access denied component
 */
const DefaultAccessDenied: React.FC<{ message?: string }> = ({ message }) => (
  <Alert variant="destructive" className="border-red-200 bg-red-50">
    <ShieldAlert className="h-4 w-4" />
    <AlertDescription>
      {message || "You do not have permission to access this content."}
    </AlertDescription>
  </Alert>
);

/**
 * Permission Guard Component
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  anyPermissions = [],
  resourceId,
  fallback,
  loadingComponent,
  showAccessDenied = true,
  accessDeniedMessage,
  asFragment = false,
  customCheck,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasMinimumRole,
    isLoading: permissionsLoading,
    error: permissionsError,
  } = usePermissions();

  const { role, isLoading: roleLoading } = useRole();

  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [checkError, setCheckError] = useState<string | null>(null);

  /**
   * Check all access conditions
   */
  const checkAccess = async (): Promise<boolean> => {
    try {
      // Check role requirement
      if (requiredRole && !hasMinimumRole(requiredRole)) {
        return false;
      }

      // Check required permissions (ALL must be present)
      if (requiredPermissions.length > 0) {
        const hasRequired = await hasAllPermissions(requiredPermissions, resourceId);
        if (!hasRequired) {
          return false;
        }
      }

      // Check alternative permissions (ANY can be present)
      if (anyPermissions.length > 0) {
        const hasAny = await hasAnyPermission(anyPermissions, resourceId);
        if (!hasAny) {
          return false;
        }
      }

      // Run custom check if provided
      if (customCheck) {
        const customResult = await customCheck();
        if (!customResult) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Permission check failed:", error);
      setCheckError(error instanceof Error ? error.message : "Permission check failed");
      return false;
    }
  };

  /**
   * Effect to check permissions when dependencies change
   */
  useEffect(() => {
    let mounted = true;

    const performCheck = async () => {
      if (permissionsLoading || roleLoading) {
        return;
      }

      setIsChecking(true);
      setCheckError(null);

      try {
        const access = await checkAccess();
        if (mounted) {
          setHasAccess(access);
        }
      } catch (error) {
        console.error("Access check error:", error);
        if (mounted) {
          setHasAccess(false);
          setCheckError(error instanceof Error ? error.message : "Access check failed");
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    performCheck();

    return () => {
      mounted = false;
    };
  }, [
    permissionsLoading,
    roleLoading,
    role,
    requiredRole,
    requiredPermissions,
    anyPermissions,
    resourceId,
    customCheck,
  ]);

  /**
   * Show loading state
   */
  if (permissionsLoading || roleLoading || isChecking) {
    const LoadingComponent = loadingComponent || <DefaultLoading />;
    return asFragment ? <>{LoadingComponent}</> : <div>{LoadingComponent}</div>;
  }

  /**
   * Show error state
   */
  if (permissionsError || checkError) {
    const errorMessage = permissionsError || checkError;
    const ErrorComponent = (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>Permission check failed: {errorMessage}</AlertDescription>
      </Alert>
    );
    return asFragment ? <>{ErrorComponent}</> : <div>{ErrorComponent}</div>;
  }

  /**
   * Show access denied state
   */
  if (!hasAccess) {
    if (fallback) {
      return asFragment ? <>{fallback}</> : <div>{fallback}</div>;
    }

    if (showAccessDenied) {
      const AccessDeniedComponent = <DefaultAccessDenied message={accessDeniedMessage} />;
      return asFragment ? <>{AccessDeniedComponent}</> : <div>{AccessDeniedComponent}</div>;
    }

    return null;
  }

  /**
   * Render children if access is granted
   */
  return asFragment ? <>{children}</> : <div>{children}</div>;
};

/**
 * Role Guard Component (simplified role-based guard)
 */
export interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  showAccessDenied = true,
}) => {
  const { role } = useRole();

  if (!role || !allowedRoles.includes(role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAccessDenied) {
      return <DefaultAccessDenied message={`Access restricted to: ${allowedRoles.join(", ")}`} />;
    }

    return null;
  }

  return <>{children}</>;
};

/**
 * Feature Guard Component (feature-based access control)
 */
export interface FeatureGuardProps {
  children: ReactNode;
  feature: string;
  action?: "read" | "manage";
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  feature,
  action = "read",
  fallback,
  showAccessDenied = true,
}) => {
  const { canView, canManage } = usePermissions();

  const hasFeatureAccess = action === "manage" ? canManage(feature) : canView(feature);

  if (!hasFeatureAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAccessDenied) {
      return <DefaultAccessDenied message={`You don't have ${action} access to ${feature}`} />;
    }

    return null;
  }

  return <>{children}</>;
};

/**
 * Conditional Render based on permissions
 */
export interface ConditionalRenderProps {
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  condition,
  children,
  fallback,
}) => {
  return condition ? <>{children}</> : <>{fallback || null}</>;
};

/**
 * Permission Button Component
 */
export interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  requiredPermissions?: Permission[];
  anyPermissions?: Permission[];
  requiredRole?: UserRole;
  resourceId?: string;
  children: ReactNode;
  disabledFallback?: ReactNode;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  requiredPermissions = [],
  anyPermissions = [],
  requiredRole,
  resourceId,
  children,
  disabledFallback,
  disabled,
  ...buttonProps
}) => {
  return (
    <PermissionGuard
      requiredPermissions={requiredPermissions}
      anyPermissions={anyPermissions}
      requiredRole={requiredRole}
      resourceId={resourceId}
      showAccessDenied={false}
      fallback={disabledFallback}
      asFragment
    >
      <button {...buttonProps} disabled={disabled}>
        {children}
      </button>
    </PermissionGuard>
  );
};

/**
 * Permission Link Component
 */
export interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  requiredPermissions?: Permission[];
  anyPermissions?: Permission[];
  requiredRole?: UserRole;
  resourceId?: string;
  children: ReactNode;
  disabledFallback?: ReactNode;
}

export const PermissionLink: React.FC<PermissionLinkProps> = ({
  requiredPermissions = [],
  anyPermissions = [],
  requiredRole,
  resourceId,
  children,
  disabledFallback,
  ...linkProps
}) => {
  return (
    <PermissionGuard
      requiredPermissions={requiredPermissions}
      anyPermissions={anyPermissions}
      requiredRole={requiredRole}
      resourceId={resourceId}
      showAccessDenied={false}
      fallback={disabledFallback}
      asFragment
    >
      <a {...linkProps}>{children}</a>
    </PermissionGuard>
  );
};

export default PermissionGuard;
