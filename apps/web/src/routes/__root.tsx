import type { QueryClient, } from '@tanstack/react-query'
import { createRootRouteWithContext, Link, Outlet, } from '@tanstack/react-router'
import { TanStackRouterDevtools, } from '@tanstack/router-devtools'
import * as React from 'react'

// Import healthcare components (migrated from app/)
import { ClientInit, } from '../../components/ClientInit'
import { HealthcareErrorBoundary, } from '../../components/ErrorBoundary'
import { Toaster, } from '../../components/ui/toaster'
import { AuthProvider, useAuthContext, } from '../../contexts/auth-context'

// Healthcare root context type - updated for Supabase auth
export interface HealthcareRootContext {
  queryClient: QueryClient
  auth: {
    user: {
      id: string
      email: string
      role: string
      permissions: string[]
    } | null
    isLoading: boolean
    isAuthenticated: boolean
    session: any
  }
  healthcare: {
    clinicId: string | null
    isEmergencyMode: boolean
    complianceMode: 'strict' | 'emergency'
  }
}

// Root layout component for healthcare platform
function RootComponent() {
  return (
    <>
      {/* Healthcare Error Boundary */}
      <HealthcareErrorBoundary showDetails={false}>
        {/* Client Initialization */}
        <ClientInit>
          {/* Supabase Authentication Provider */}
          <AuthProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              {/* Main Application Content */}
              <Outlet />

              {/* Global Notifications */}
              <Toaster />

              {/* AI Agent Chat Placeholder */}
              <div className="fixed bottom-5 right-5 z-50">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-primary-foreground text-xs">🤖</span>
                </div>
              </div>
            </div>
          </AuthProvider>
        </ClientInit>
      </HealthcareErrorBoundary>

      {/* Development Tools */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
    </>
  )
}

// Not found component for healthcare context
function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          404 - Página Não Encontrada
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          A página solicitada não existe no sistema de saúde.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Voltar ao Início
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Ir para Dashboard
          </Link>
          <Link
            to="/emergency"
            className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90"
          >
            🚨 Acesso de Emergência
          </Link>
        </div>
      </div>
    </div>
  )
}

// Create and export the root route
export const Route = createRootRouteWithContext<HealthcareRootContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,

  // Global error component
  errorComponent: ({ error, },) => (
    <HealthcareErrorBoundary showDetails>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-destructive">
            Erro no Sistema de Saúde
          </h1>
          <p className="mb-4 text-lg text-muted-foreground">
            Ocorreu um erro inesperado. O suporte técnico foi notificado.
          </p>
          <details className="mb-8 text-left">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Detalhes técnicos
            </summary>
            <pre className="mt-2 overflow-auto rounded-md bg-muted p-4 text-xs">
              {error.message}
            </pre>
          </details>
          <div className="space-x-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Voltar ao Início
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Recarregar Página
            </button>
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90"
            >
              🚨 Acesso de Emergência
            </Link>
          </div>
        </div>
      </div>
    </HealthcareErrorBoundary>
  ),

  // Root level loading component
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent">
        </div>
        <p className="text-sm text-muted-foreground">
          Carregando Sistema de Saúde...
        </p>
      </div>
    </div>
  ),
},)
