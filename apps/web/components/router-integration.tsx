/**
 * 🔗 Router Integration - NeonPro Healthcare
 * ========================================
 *
 * Integration component for TanStack Router with Next.js App Router
 * and existing authentication system.
 */

"use client";

import { useAuth } from "@/contexts/auth-context";
import { router } from "@/lib/router";
import { RouterProvider } from "@/providers/router-provider";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

interface RouterIntegrationProps {
  children?: React.ReactNode;
}

export function RouterIntegration({ children }: RouterIntegrationProps) {
  const queryClient = useQueryClient();
  const auth = useAuth();

  // Update router context when auth changes
  React.useEffect(() => {
    const updateRouterContext = () => {
      router.update({
        context: {
          queryClient,
          auth: {
            user: auth.user,
            isAuthenticated: Boolean(auth.user) && !auth.loading,
            hasRole: (roles) => {
              if (!auth.user) {
                return false;
              }
              const roleArray = Array.isArray(roles) ? roles : [roles];
              return roleArray.includes(auth.user.role);
            },
          },
        },
      });
    };

    updateRouterContext();
  }, [queryClient, auth.user, auth.loading]);

  // Show loading during initial auth check
  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider />
      {children}
    </>
  );
}

// Higher-order component for pages that need router integration
export function withRouterIntegration<T extends {}>(
  Component: React.ComponentType<T>,
) {
  const WrappedComponent = (props: T) => {
    return (
      <RouterIntegration>
        <Component {...props} />
      </RouterIntegration>
    );
  };

  WrappedComponent.displayName = `withRouterIntegration(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// Hook to check if we should use TanStack Router or Next.js routing
export function useRoutingMode() {
  const [useTanStackRouter, setUseTanStackRouter] = React.useState(false);

  React.useEffect(() => {
    // Check if we're in a protected route that should use TanStack Router
    const pathname = window.location.pathname;
    const protectedRoutes = [
      "/dashboard",
      "/patients",
      "/appointments",
      "/settings",
    ];

    const shouldUseTanStackRouter = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    setUseTanStackRouter(shouldUseTanStackRouter);
  }, []);

  return useTanStackRouter;
}

// Component to conditionally render based on routing mode
export function ConditionalRouter({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const useTanStackRouter = useRoutingMode();

  if (useTanStackRouter) {
    return <RouterIntegration>{children}</RouterIntegration>;
  }

  return <>{fallback || children}</>;
}
