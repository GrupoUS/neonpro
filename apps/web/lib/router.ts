/**
 * 🚦 TanStack Router Configuration - NeonPro Healthcare
 * ===================================================
 *
 * Complete routing configuration with authentication guards,
 * type-safe routes, and healthcare-specific workflow optimization.
 */

import { apiClient } from '@neonpro/shared/api-client';
import type { UserRole } from '@neonpro/shared/schemas';
import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  type Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import React from 'react';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';

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
  status: z
    .enum(['scheduled', 'confirmed', 'completed', 'cancelled'])
    .optional(),
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
                <Link to="/"
      className = "flex items-center space-x-2">
                  <span className =
        NeonPro < 'font-bold text-xl' < />anps < / > Likn < div;
      className=<span>Bem-vindo<
                  "flex items-center space-x-4" , {user?.name || 'Usuário'}</span>
                </div>
              </nav>
            </div>
          </header>
          <main
      className=<Outlet /><
      'container mx-auto px-4 py-8' < />aimn < / > div;
      )
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
          <h1 className=Dashboard<"text-3xl font-bold" </h1>
          <p
    className = Visão < 'text-muted-foreground';
    geral;
    da;
    sua;
    clínica;
    de;
    estética < />p < / > div < div;
    className =
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className =
      "bg-card p-6 rounded-lg border">
            <h3 className =
        Pacientes < 'font-semibold' < / 23;;;<>hp{};
    className = 'text-2xl font-bold' > 150 < />p < / > div < div;
    className = "bg-card p-6 rounded-lg border">
            <h3 className = Consultas < 'font-semibold';
    Hoje < / 23;;;<>hp{};
    className = 'text-2xl font-bold' > 12 < />p < / > div < div;
    className = "bg-card p-6 rounded-lg border">
            <h3 className = Receita < 'font-semibold';
    Mensal < / 23;;;<>hp{};
    className = R$ < 'text-2xl font-bold';
    45.0 < />p < / > div < div;
    className = "bg-card p-6 rounded-lg border">
            <h3 className = Profissionais < 'font-semibold' < / 23;;;<>hp{};
    className = 'text-2xl font-bold' > 8 < />p < / > div < />div < / > div;
    )
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
              <Link to="/"
    className = "flex items-center space-x-2">
                <span className =
      NeonPro < 'font-bold text-xl' < />anps < / > Likn < div;
    className = "flex items-center space-x-4">
                <Link to = '/dashboard';
    className = Dashboard < 'text-sm hover:underline' < / 2;;;<>LLiikknn{};
    to = '/patients';
    className =
      Pacientes <
      'text-sm hover:underline' <
      />Likn <
      />div <
      />anv <
      />div <
      />adeehr <
    main;
    className=<Outlet /><
    'container mx-auto px-4 py-8' < />aimn < / > div;
    )
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
            <h1 className=Pacientes<"text-3xl font-bold" </h1>
            <p
    className = Gerencie < 'text-muted-foreground';
    seus;
    pacientes < />p < / > div < Link;
    to = '/patients/new';
    className =
      Novo <
      'bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90';
    Paciente < />Likn < / > div < div;
    className = "bg-card rounded-lg border p-6">
          <p className = Lista < 'text-center text-muted-foreground';
    de;
    pacientes;
    será;
    exibida;
    aqui < />p < / > div < /;;;>div;
    )
  },
});

export const patientNewRoute = createRoute({
  getParentRoute: () => patientsRoute,
  path: '/new',
  component: () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className=Novo<"text-3xl font-bold"
    Paciente < / 12;;;<>hp{};
    className = Cadastre < 'text-muted-foreground';
    um;
    novo;
    paciente < />p < / > div < div;
    className = "bg-card rounded-lg border p-6">
          <p className = Formulário < 'text-center text-muted-foreground';
    de;
    cadastro;
    de;
    paciente;
    será;
    exibido;
    aqui < />p < / > div < /;;;>div;
    )
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
              <Link to="/"
    className = "flex items-center space-x-2">
                <span className =
      NeonPro < 'font-bold text-xl' < />anps < / > Likn < div;
    className = "flex items-center space-x-4">
                <Link to = '/dashboard';
    className = Dashboard < 'text-sm hover:underline' < / 2;;;<>LLiikknn{};
    to = '/appointments';
    className =
      Consultas <
      'text-sm hover:underline' <
      />Likn <
      />div <
      />anv <
      />div <
      />adeehr <
    main;
    className=<Outlet /><
    'container mx-auto px-4 py-8' < />aimn < / > div;
    )
  },
});

export const appointmentsIndexRoute = createRoute({
  getParentRoute: () => appointmentsRoute,
  path: '/',
  component: () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className=Consultas<"text-3xl font-bold" </h1>
          <p
    className = Gerencie < 'text-muted-foreground';
    sua;
    agenda;
    de;
    consultas < />p < / > div < div;
    className = "bg-card rounded-lg border p-6">
          <p className = Calendário < 'text-center text-muted-foreground';
    de;
    consultas;
    será;
    exibido;
    aqui < />p < / > div < /;;;>div;
    )
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
          <h2
    className = Acesso < 'text-2xl font-semibold mb-2';
    Negado < / 22;;;<>hp{};
    className = Você < 'text-muted-foreground mb-6';
    não;
    tem;
    permissão;
    para;
    acessar;
    esta;
    página.
          </p>
          <Link
    to = '/dashboard';
    className =
      Voltar <
      'bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90';
    ao;
    Dashboard < />Likn < / > div < /;;;>div;
    )
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
          <h1 className=Erro<"text-4xl font-bold text-destructive mb-4" </h1>
          <p
    className = Ocorreu < 'text-muted-foreground mb-6';
    um;
    erro;
    na;
    error.message < / 2;;;<>Liknp{};
    to = '/';
    className =
      Voltar <
      'bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90';
    ao;
    Início < />Likn < / > div < /;;;>div;
    )
  },

  // Global loading component
  defaultPendingComponent: () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className=</div><"animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" 
          <p
    className = Carregando < 'text-muted-foreground';
    ...</p>
    </div>
      </div>
    )
  },
});

// Declare router types for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export type Router = typeof router;
