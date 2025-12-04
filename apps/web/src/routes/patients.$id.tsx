/**
 * Patient Detail Page - Brazilian Healthcare UX Patterns
 * Comprehensive patient information view with LGPD compliance
 * Features: Patient info, medical history, appointments, consent management
 */

import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';
import { PatientDetailView } from '@/components/patients/PatientDetailView';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

// Route configuration
export const Route = createFileRoute('/patients/$id')({
  // Loading component with skeleton
  pendingComponent: () => (
    <div className='container mx-auto p-4 md:p-6 space-y-6'>
      <div className='animate-pulse'>
        {/* Back button skeleton */}
        <div className='h-10 w-32 bg-muted rounded mb-4'></div>

        {/* Header skeleton */}
        <div className='h-8 bg-muted rounded w-1/3 mb-2'></div>
        <div className='h-4 bg-muted rounded w-1/2 mb-6'></div>

        {/* Info cards skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='h-32 bg-muted rounded-lg'></div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className='h-12 bg-muted rounded mb-4'></div>

        {/* Content skeleton */}
        <div className='space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='h-24 bg-muted rounded'></div>
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
          <CardTitle className='text-destructive'>Erro ao Carregar Paciente</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            Não foi possível carregar as informações do paciente. Verifique sua conexão e tente novamente.
          </p>
          <p className='text-sm text-muted-foreground font-mono bg-muted p-2 rounded'>
            {error.message}
          </p>
          <div className='flex gap-2 justify-center'>
            <Button onClick={reset} variant='outline'>
              Tentar Novamente
            </Button>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  component: PatientDetailPage,
});

function PatientDetailPage() {
  const { id } = Route.useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Get clinic ID from user profile
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
            <Button onClick={() => navigate({ to: '/patients' })} variant='outline'>
              Voltar para Lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 md:p-6 space-y-6'>
      {/* Back Navigation */}
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate({ to: '/patients' })}
          className='gap-2'
        >
          <ArrowLeft className='w-4 h-4' />
          Voltar para Lista
        </Button>
      </div>

      {/* Patient Detail View with Error Boundary */}
      <ErrorBoundary
        fallback={(error: Error) => (
          <Card>
            <CardContent className='p-6 text-center'>
              <AlertCircle className='w-8 h-8 text-destructive mx-auto mb-2' />
              <h3 className='font-semibold text-destructive mb-2'>
                Erro ao Carregar Detalhes
              </h3>
              <p className='text-muted-foreground text-sm mb-4'>
                {error.message}
              </p>
              <Button onClick={() => window.location.reload()} size='sm'>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}
      >
        <Suspense fallback={<PatientDetailSkeleton />}>
          <PatientDetailView patientId={id} clinicId={clinicId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

/**
 * Loading skeleton for patient detail view
 */
function PatientDetailSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Card Skeleton */}
      <Card>
        <CardHeader>
          <div className='animate-pulse space-y-3'>
            <div className='flex items-start justify-between'>
              <div className='space-y-2 flex-1'>
                <div className='h-8 bg-muted rounded w-1/3'></div>
                <div className='h-4 bg-muted rounded w-1/4'></div>
              </div>
              <div className='flex gap-2'>
                <div className='h-10 w-24 bg-muted rounded'></div>
                <div className='h-10 w-24 bg-muted rounded'></div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='p-4'>
              <div className='animate-pulse space-y-2'>
                <div className='h-4 bg-muted rounded w-1/2'></div>
                <div className='h-6 bg-muted rounded w-1/3'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <Card>
        <CardHeader>
          <div className='animate-pulse flex gap-4'>
            <div className='h-10 w-32 bg-muted rounded'></div>
            <div className='h-10 w-32 bg-muted rounded'></div>
            <div className='h-10 w-32 bg-muted rounded'></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='h-20 bg-muted rounded'></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
