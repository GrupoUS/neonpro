/**
 * Main Patients Route - Brazilian Healthcare UX Patterns
 * Implements comprehensive patient management with LGPD compliance and mobile-first design
 * Features: Real-time updates, accessibility, responsive design, error handling
 */

import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';
import { PatientDataTable } from '@/components/patients/PatientDataTable';
import { useAuth } from '@/hooks/useAuth';
import { usePatientStats } from '@/hooks/usePatientStats';
import { testSupabaseConnection } from '@/utils/supabase-test';
import { Card } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Activity } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

// Type-safe search params for filtering and pagination
const patientsSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(5).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.array(z.enum(['Active', 'Inactive', 'Pending'])).optional(),
  sortBy: z
    .enum(['fullName', 'createdAt', 'lastVisit'])
    .optional()
    .default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Route configuration with healthcare-specific patterns
export const Route = createFileRoute('/services/patients')({
  // Type-safe search parameter validation
  validateSearch: patientsSearchSchema,

  // Loading component with skeleton
  pendingComponent: () => (
    <div className='container mx-auto p-4 md:p-6 space-y-6'>
      <div className='animate-pulse'>
        <div className='h-8 bg-muted rounded w-1/4 mb-2'></div>
        <div className='h-4 bg-muted rounded w-1/2 mb-6'></div>

        {/* Statistics cards skeleton */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='h-24 bg-muted rounded-lg'></div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className='bg-card rounded-lg border'>
          <div className='h-12 bg-muted rounded-t-lg mb-4'></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='h-16 bg-muted/50 rounded mx-4 mb-2'></div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Error boundary for patient data
  errorComponent: ({ error, reset }) => (
    <div className='container mx-auto p-4 md:p-6'>
      <Card className='max-w-lg mx-auto text-center'>
        <CardHeader>
          <div className='mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4'>
            <AlertCircle className='w-6 h-6 text-destructive' />
          </div>
          <CardTitle className='text-destructive'>
            Erro ao Carregar Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            Não foi possível carregar a lista de pacientes. Verifique sua conexão e tente novamente.
          </p>
          <p className='text-sm text-muted-foreground font-mono bg-muted p-2 rounded'>
            {error.message}
          </p>
          <div className='flex gap-2 justify-center'>
            <Button onClick={reset} variant='outline'>
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
  const { profile } = useAuth();
  const [connectionTest, setConnectionTest] = useState<any>(null);
  // const search = Route.useSearch(); // Currently unused

  // Test Supabase connection on component mount
  useEffect(() => {
    const runConnectionTest = async () => {
      try {
        const result = await testSupabaseConnection();
        setConnectionTest(result);
        console.log('🔧 Connection test result:', result);
      } catch (error) {
        console.error('🔧 Connection test failed:', error);
        setConnectionTest({ success: false, error: 'Test failed to run' });
      }
    };

    runConnectionTest();
  }, []);

  // Get clinic ID from user profile (corrected to use profile instead of user metadata)
  const clinicId = profile?.clinicId || '89084c3a-9200-4058-a15a-b440d3c60687'; // Fallback clinic ID for development

  if (!clinicId) {
    return (
      <div className='container mx-auto p-4 md:p-6'>
        <Card className='max-w-lg mx-auto text-center'>
          <CardHeader>
            <div className='mx-auto w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mb-4'>
              <AlertCircle className='w-6 h-6 text-warning' />
            </div>
            <CardTitle>Clínica Não Identificada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>
              Não foi possível identificar sua clínica. Entre em contato com o suporte técnico.
            </p>
            <Button
              onClick={() => toast.error('Função de suporte ainda não implementada')}
              variant='outline'
            >
              Contatar Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 md:p-6 space-y-6'>
      {/* Page Header with Brazilian healthcare context */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-foreground'>
              Gestão de Pacientes
            </h1>
            <p className='text-muted-foreground text-sm md:text-base'>
              Administre os pacientes da sua clínica com segurança e conformidade LGPD
            </p>
          </div>

          {/* Quick actions - mobile responsive */}
          <div className='hidden sm:flex items-center gap-2'>
            <Badge variant='outline' className='text-xs'>
              🔒 LGPD Compliant
            </Badge>
          </div>
        </div>

        {/* Mobile badge */}
        <div className='flex sm:hidden'>
          <Badge variant='outline' className='text-xs'>
            🔒 Proteção de Dados LGPD
          </Badge>
        </div>
      </div>

      {/* Debug connection test info */}
      {connectionTest && (
        <Card
          className={connectionTest.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'}
        >
          <CardHeader>
            <CardTitle className='text-sm flex items-center gap-2'>
              🔧 Diagnóstico de Conexão Supabase
              {connectionTest.success ? '✅' : '❌'}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-xs space-y-1'>
            <p>
              <strong>Status:</strong> {connectionTest.success ? 'Sucesso' : 'Falha'}
            </p>
            {connectionTest.error && (
              <p>
                <strong>Erro:</strong> {connectionTest.error}
              </p>
            )}
            {connectionTest.session !== undefined && (
              <p>
                <strong>Autenticado:</strong> {connectionTest.session ? 'Sim' : 'Não'}
              </p>
            )}
            {connectionTest.basicConnectionWorking !== undefined && (
              <p>
                <strong>Conexão Básica:</strong>{' '}
                {connectionTest.basicConnectionWorking ? 'OK' : 'Falha'}
              </p>
            )}
            {connectionTest.patientsAccessWorking !== undefined && (
              <p>
                <strong>Acesso Pacientes:</strong>{' '}
                {connectionTest.patientsAccessWorking ? 'OK' : 'Falha'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview Cards - Brazilian healthcare metrics */}
      <PatientsStatistics clinicId={clinicId} />

      {/* Main Patients Table with Error Boundary */}
      <ErrorBoundary
        fallback={(_error: Error) => (
          <Card>
            <CardContent className='p-6 text-center'>
              <AlertCircle className='w-8 h-8 text-destructive mx-auto mb-2' />
              <h3 className='font-semibold text-destructive mb-2'>
                Erro na Tabela de Pacientes
              </h3>
              <p className='text-muted-foreground text-sm mb-4'>
                Ocorreu um erro ao carregar os dados.
              </p>
              <Button onClick={() => window.location.reload()} size='sm'>
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
      <Card className='bg-muted/30'>
        <CardContent className='p-4'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
            <span>
              Sistema em conformidade com a LGPD • Todos os acessos são auditados • Pacientes têm
              direito ao acesso, correção e exclusão de dados
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
function PatientsStatistics({ clinicId }: { clinicId: string }) {
  const { data: stats, isLoading, error } = usePatientStats(clinicId);

  if (error) {
    return (
      <Card className='bg-destructive/5 border-destructive'>
        <CardContent className='p-4 text-destructive text-sm'>
          Erro ao carregar estatísticas: {error.message}
        </CardContent>
      </Card>
    );
  }

  const fallback = {
    totalPatients: 0,
    activePatients: 0,
    newThisMonth: 0,
    upcomingAppointments: 0,
  };
  const resolved = stats ?? fallback;

  type StatCard = {
    title: string;
    value: string;
    icon: any;
    change?: string;
  };

  const statisticsCards: StatCard[] = [
    // all neutral styling; no conditional classes
    {
      title: 'Total de Pacientes',
      value: resolved.totalPatients.toLocaleString('pt-BR'),
      icon: Users,
      change: isLoading ? 'carregando…' : undefined,
    },
    {
      title: 'Pacientes Ativos',
      value: resolved.activePatients.toLocaleString('pt-BR'),
      icon: Activity,
      change: isLoading
        ? 'carregando…'
        : `${
          resolved.totalPatients > 0
            ? (
              (resolved.activePatients / resolved.totalPatients)
              * 100
            ).toFixed(1)
            : '0.0'
        }% do total`,
    },
    {
      title: 'Novos Pacientes',
      value: resolved.newThisMonth.toLocaleString('pt-BR'),
      icon: UserPlus,
      change: isLoading ? 'carregando…' : undefined,
    },
    {
      title: 'Próximas Consultas',
      value: resolved.upcomingAppointments.toLocaleString('pt-BR'),
      icon: Calendar,
      change: 'Próximos 7 dias',
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {statisticsCards.map((stat, _index) => (
        <Card key={index} className='relative overflow-hidden'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>
                  {stat.title}
                </p>
                <p className='text-2xl font-bold text-foreground'>
                  {stat.value}
                </p>
                <p className='text-xs text-muted-foreground'>{stat.change}</p>
              </div>
              <div className='p-3 bg-primary/10 rounded-full'>
                <stat.icon className='w-5 h-5 text-primary' />
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
        <div className='animate-pulse space-y-2'>
          <div className='h-6 bg-muted rounded w-1/4'></div>
          <div className='h-4 bg-muted rounded w-1/2'></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='animate-pulse space-y-4'>
          {/* Filters skeleton */}
          <div className='flex gap-2'>
            <div className='h-10 bg-muted rounded w-64'></div>
            <div className='h-10 bg-muted rounded w-24'></div>
            <div className='h-10 bg-muted rounded w-24'></div>
          </div>

          {/* Table skeleton */}
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-16 bg-muted/50 rounded'></div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className='flex justify-between items-center'>
            <div className='h-8 bg-muted rounded w-32'></div>
            <div className='flex gap-1'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='h-8 w-8 bg-muted rounded'></div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
