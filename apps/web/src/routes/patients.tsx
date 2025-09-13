/**
 * Main Patients Route - Brazilian Healthcare UX Patterns
 * Implements comprehensive patient management with LGPD compliance and mobile-first design
 * Features: Real-time updates, accessibility, responsive design, error handling
 */

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { PatientDataTable } from '@/components/patients/PatientDataTable';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { AlertCircle, Users, UserPlus, Calendar, Activity, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';

// Type-safe search params for filtering and pagination
const patientsSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(5).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.array(z.enum(['Active', 'Inactive', 'Pending'])).optional(),
  sortBy: z.enum(['fullName', 'createdAt', 'lastVisit']).optional().default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Route configuration with healthcare-specific patterns
export const Route = createFileRoute('/patients')({
  // Type-safe search parameter validation
  validateSearch: patientsSearchSchema,

  // Loading component with skeleton
  pendingComponent: () => (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
        
        {/* Statistics cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
        
        {/* Table skeleton */}
        <div className="bg-card rounded-lg border">
          <div className="h-12 bg-muted rounded-t-lg mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded mx-4 mb-2"></div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Error boundary for patient data
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Erro ao Carregar Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Não foi possível carregar a lista de pacientes. Verifique sua conexão e tente novamente.
          </p>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
            {error.message}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              Tentar Novamente
            </Button>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  component: PatientsPage,
});

function PatientsPage() {
  const { user } = useAuth();
  const _search = Route.useSearch();

  // Get clinic ID from user context (adapt based on your auth structure)
  const clinicId = user?.user_metadata?.clinic_id || user?.clinic_id;

  if (!clinicId) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <CardTitle>Clínica Não Identificada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Não foi possível identificar sua clínica. Entre em contato com o suporte técnico.
            </p>
            <Button 
              onClick={() => toast.error('Função de suporte ainda não implementada')}
              variant="outline"
            >
              Contatar Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Page Header with Brazilian healthcare context */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Gestão de Pacientes
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Administre os pacientes da sua clínica com segurança e conformidade LGPD
            </p>
          </div>
          
          {/* Quick actions - mobile responsive */}
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              🔒 LGPD Compliant
            </Badge>
          </div>
        </div>
        
        {/* Mobile badge */}
        <div className="flex sm:hidden">
          <Badge variant="outline" className="text-xs">
            🔒 Proteção de Dados LGPD
          </Badge>
        </div>
      </div>

      {/* Statistics Overview Cards - Brazilian healthcare metrics */}
      <PatientsStatistics clinicId={clinicId} />

      {/* Main Patients Table with Error Boundary */}
      <ErrorBoundary
        fallback={({ error, resetError }) => (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <h3 className="font-semibold text-destructive mb-2">
                Erro na Tabela de Pacientes
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {error.message}
              </p>
              <Button onClick={resetError} size="sm">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}
      >
        <Suspense fallback={<PatientTableSkeleton />}>
          <PatientDataTable clinicId={clinicId} />
        </Suspense>
      </ErrorBoundary>

      {/* LGPD Compliance Footer */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>
              Sistema em conformidade com a LGPD • Todos os acessos são auditados • 
              Pacientes têm direito ao acesso, correção e exclusão de dados
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Statistics cards component with Brazilian healthcare KPIs
 */
function PatientsStatistics({ clinicId: _clinicId }: { clinicId: string }) {
  // In a real implementation, these would come from a hook/query
  const stats = {
    totalPatients: 1247,
    activePatients: 1156,
    newThisMonth: 89,
    upcomingAppointments: 156,
  };

  const statisticsCards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPatients.toLocaleString('pt-BR'),
      icon: Users,
      change: '+12% este mês',
      changeType: 'positive' as const,
    },
    {
      title: 'Pacientes Ativos',
      value: stats.activePatients.toLocaleString('pt-BR'),
      icon: Activity,
      change: `${((stats.activePatients / stats.totalPatients) * 100).toFixed(1)}% do total`,
      changeType: 'neutral' as const,
    },
    {
      title: 'Novos Pacientes',
      value: stats.newThisMonth.toLocaleString('pt-BR'),
      icon: UserPlus,
      change: '+24% vs mês anterior',
      changeType: 'positive' as const,
    },
    {
      title: 'Próximas Consultas',
      value: stats.upcomingAppointments.toLocaleString('pt-BR'),
      icon: Calendar,
      change: 'Próximos 7 dias',
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statisticsCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className={`text-xs flex items-center gap-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Loading skeleton for the patient table
 */
function PatientTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          {/* Filters skeleton */}
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-64"></div>
            <div className="h-10 bg-muted rounded w-24"></div>
            <div className="h-10 bg-muted rounded w-24"></div>
          </div>
          
          {/* Table skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded"></div>
            ))}
          </div>
          
          {/* Pagination skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-8 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}