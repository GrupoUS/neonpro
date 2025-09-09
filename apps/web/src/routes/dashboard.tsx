import { SidebarInset, SidebarProvider, } from '@/components/ui/sidebar'
import { createFileRoute, Outlet, redirect, } from '@tanstack/react-router'
import * as React from 'react'

// Import healthcare dashboard components (migrated from app/)
import { HealthcareSidebar, } from '@/components/healthcare-sidebar'
import { Header, } from '@/components/layouts/header'
import { QueryKeys, } from '../../providers/query-provider'
import { authGuards } from '../lib/auth-utils'

// Dashboard Layout Component
function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <HealthcareSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

// Create and export the dashboard layout route
export const Route = createFileRoute('/dashboard',)({
  component: DashboardLayout,

  // Dashboard-level data loading
  loader: async ({ context, },) => {
    const { queryClient, auth, healthcare, } = context
    const userId = auth.user?.id || 'current'
    const clinicId = healthcare.clinicId || 'current'

    // Preload critical dashboard data
    const preloadResults = await Promise.allSettled([
      // Dashboard metrics
      queryClient.ensureQueryData({
        queryKey: QueryKeys.analytics.dashboard(userId,),
        queryFn: () => Promise.resolve({ metrics: [], charts: [], },),
        staleTime: 5 * 60 * 1000, // 5 minutes
      },),
      // User permissions
      queryClient.ensureQueryData({
        queryKey: QueryKeys.auth.permissions(userId,),
        queryFn: () => Promise.resolve({ permissions: [], role: 'user', },),
        staleTime: 10 * 60 * 1000, // 10 minutes
      },),
      // Clinic information
      queryClient.ensureQueryData({
        queryKey: QueryKeys.clinics.detail(clinicId,),
        queryFn: () => Promise.resolve({ name: 'Healthcare Clinic', settings: {}, },),
        staleTime: 15 * 60 * 1000, // 15 minutes
      },),
    ],)

    // Log any preload failures for monitoring
    preloadResults.forEach((result, index,) => {
      if (result.status === 'rejected') {
        const queryTypes = ['analytics.dashboard', 'auth.permissions', 'clinics.detail',]
        console.warn(`Failed to preload ${queryTypes[index]}:`, result.reason,)
      }
    },)

    const successfulPreloads = preloadResults.filter(r => r.status === 'fulfilled').length
    console.log(
      `Dashboard preloading: ${successfulPreloads}/${preloadResults.length} queries successful`,
    )

    return { preloadResults, }
  },

  // Dashboard error handling
  errorComponent: ({ error, },) => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-destructive">
          Erro no Dashboard
        </h1>
        <p className="mb-4 text-lg text-muted-foreground">
          Não foi possível carregar o painel administrativo.
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
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Recarregar Dashboard
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Voltar ao Início
          </a>
          <a
            href="/emergency"
            className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90"
          >
            🚨 Acesso de Emergência
          </a>
        </div>
      </div>
    </div>
  ),

  // Dashboard loading state
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent">
        </div>
        <p className="text-sm text-muted-foreground">
          Carregando painel administrativo...
        </p>
      </div>
    </div>
  ),

  // Authentication requirement using TanStack Router auth guards
  beforeLoad: authGuards.requireAuth,

  // SEO and meta
  meta: () => [
    {
      title: 'Dashboard - NeonPro Healthcare',
    },
    {
      name: 'description',
      content: 'Painel administrativo do sistema de gestão em saúde',
    },
  ],
},)
