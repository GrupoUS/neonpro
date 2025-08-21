/**
 * 🚦 TanStack Router Configuration - NeonPro Healthcare
 * ===================================================
 * 
 * Complete routing configuration with authentication guards,
 * type-safe routes, and healthcare-specific workflow optimization.
 */

import { 
  createRouter, 
  createRootRoute, 
  createRoute,
  redirect,
  Outlet,
  Link,
  useNavigate
} from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { UserRole } from '@neonpro/shared/schemas';
import { apiClient } from '@neonpro/shared/api-client';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';

// Router context type with authentication and query client
interface RouterContext {
  queryClient: QueryClient;
  auth: {
    user: any | null;
    isAuthenticated: boolean;
    hasRole: (role: UserRole | UserRole[]) => boolean;
  };
}

// Search params validation schemas
export const DashboardSearchSchema = z.object({
  tab: z.enum(['overview', 'analytics', 'recent']).optional(),
  date: z.string().optional(),
});

export const PatientsSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const AppointmentsSearchSchema = z.object({
  date: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
  professional: z.string().optional(),
  search: z.string().optional(),
});

// Authentication guard utilities
export const requireAuth = async (context: RouterContext) => {
  if (!context.auth.isAuthenticated) {
    throw redirect({
      to: '/login',
      search: { redirect: window.location.pathname },
    });
  }
};

export const requireRole = (roles: UserRole | UserRole[]) => {
  return async (context: RouterContext) => {
    await requireAuth(context);
    
    if (!context.auth.hasRole(roles)) {
      throw redirect({
        to: '/unauthorized',
        search: { required: Array.isArray(roles) ? roles.join(',') : roles },
      });
    }
  };
};

export const requireGuest = async (context: RouterContext) => {
  if (context.auth.isAuthenticated) {
    throw redirect({ to: '/dashboard' });
  }
};

// Root route configuration
export const rootRoute = createRootRoute({
  component: () => <Outlet />,
  beforeLoad: async ({ location }) => {
    // Validate authentication state
    const isAuthenticated = apiClient.auth.isAuthenticated();
    const user = apiClient.auth.getUser();
    
    return {
      auth: {
        user,
        isAuthenticated,
        hasRole: (roles: UserRole | UserRole[]) => {
          if (!user) return false;
          const roleArray = Array.isArray(roles) ? roles : [roles];
          return roleArray.includes(user.role);
        },
      },
    };
  },
});

// Public routes
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const HomePage = React.lazy(() => import('../app/page'));
    return (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <HomePage />
      </React.Suspense>
    );
  },
});

// Authentication routes
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: requireGuest,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: () => {
    const LoginPage = React.lazy(() => import('../app/login/page'));
    return (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <LoginPage />
      </React.Suspense>
    );
  },
});

// Dashboard routes
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  validateSearch: DashboardSearchSchema,
  component: () => {
    // Dashboard Layout Component
    const DashboardLayout = () => {
      const { user } = useAuth();
      
      return (
        <div className="min-h-screen bg-background">
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                  <span className="font-bold text-xl">NeonPro</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <span>Bem-vindo, {user?.name || 'Usuário'}</span>
                </div>
              </nav>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <Outlet />
          </main>
        </div>
      );
    };
    
    return <DashboardLayout />;
  },
});

export const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica de estética
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold">Pacientes</h3>
            <p className="text-2xl font-bold">150</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold">Consultas Hoje</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold">Receita Mensal</h3>
            <p className="text-2xl font-bold">R$ 45.000</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="font-semibold">Profissionais</h3>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>
      </div>
    );
  },
});

// Patients routes
export const patientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patients',
  beforeLoad: requireRole(['clinic_owner', 'clinic_manager', 'professional']),
  validateSearch: PatientsSearchSchema,
  component: () => {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <span className="font-bold text-xl">NeonPro</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-sm hover:underline">
                  Dashboard
                </Link>
                <Link to="/patients" className="text-sm hover:underline">
                  Pacientes
                </Link>
              </div>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    );
  },
});

export const patientsIndexRoute = createRoute({
  getParentRoute: () => patientsRoute,
  path: '/',
  component: () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Pacientes</h1>
            <p className="text-muted-foreground">
              Gerencie seus pacientes
            </p>
          </div>
          <Link 
            to="/patients/new" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Novo Paciente
          </Link>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <p className="text-center text-muted-foreground">
            Lista de pacientes será exibida aqui
          </p>
        </div>
      </div>
    );
  },
});

export const patientNewRoute = createRoute({
  getParentRoute: () => patientsRoute,
  path: '/new',
  component: () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Novo Paciente</h1>
          <p className="text-muted-foreground">
            Cadastre um novo paciente
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <p className="text-center text-muted-foreground">
            Formulário de cadastro de paciente será exibido aqui
          </p>
        </div>
      </div>
    );
  },
});

// Appointments routes
export const appointmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/appointments',
  beforeLoad: requireAuth,
  validateSearch: AppointmentsSearchSchema,
  component: () => {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <span className="font-bold text-xl">NeonPro</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-sm hover:underline">
                  Dashboard
                </Link>
                <Link to="/appointments" className="text-sm hover:underline">
                  Consultas
                </Link>
              </div>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    );
  },
});

export const appointmentsIndexRoute = createRoute({
  getParentRoute: () => appointmentsRoute,
  path: '/',
  component: () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Consultas</h1>
          <p className="text-muted-foreground">
            Gerencie sua agenda de consultas
          </p>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <p className="text-center text-muted-foreground">
            Calendário de consultas será exibido aqui
          </p>
        </div>
      </div>
    );
  },
});

// Error routes
export const unauthorizedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unauthorized',
  validateSearch: z.object({
    required: z.string().optional(),
  }),
  component: () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-destructive mb-4">403</h1>
          <h2 className="text-2xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <Link 
            to="/dashboard" 
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  },
});

// Route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute.addChildren([dashboardIndexRoute]),
  patientsRoute.addChildren([patientsIndexRoute, patientNewRoute]),
  appointmentsRoute.addChildren([appointmentsIndexRoute]),
  unauthorizedRoute,
]);

// Create and configure router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  
  context: {
    queryClient: undefined!, // Will be set by provider
    auth: {
      user: null,
      isAuthenticated: false,
      hasRole: () => false,
    },
  },
  
  // Global error handling
  defaultErrorComponent: ({ error }) => {
    console.error('Router error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground mb-6">
            Ocorreu um erro na navegação: {error.message}
          </p>
          <Link 
            to="/" 
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  },
  
  // Global loading component
  defaultPendingComponent: () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  },
});

// Declare router types for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export type Router = typeof router;