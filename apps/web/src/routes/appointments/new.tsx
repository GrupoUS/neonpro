import { AppointmentBooking } from '@/components/appointment-booking';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@neonpro/ui';
import { Card } from '@neonpro/ui';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

function NewAppointmentPage() {
  const navigate = useNavigate();
  const { profile, hasPermission, loading: authLoading } = useAuth();
  const search = useSearch({ from: '/appointments/new' }) as {
    serviceId?: string;
    name?: string;
    duration?: number;
    price?: number;
  };
  const [showBookingDialog, setShowBookingDialog] = useState(
    !!search?.serviceId,
  );

  // Get clinic ID from user profile
  const clinicId = profile?.clinicId || '89084c3a-9200-4058-a15a-b440d3c60687'; // Fallback for testing

  // Check permissions
  const canCreateAppointments = hasPermission('canCreateAppointments');

  const handleBookingComplete = (_booking: [a-zA-Z][a-zA-Z]*) => {
    console.log('Booking completed:', booking);
    // Navigate back to appointments page after successful booking
    navigate({ to: '/appointments' });
  };

  if (authLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center h-96'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'>
            </div>
            <p className='text-sm text-muted-foreground'>
              Carregando perfil do usuário...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!canCreateAppointments) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate({ to: '/appointments' })}
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Button>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                Nova Consulta
              </h1>
              <p className='text-muted-foreground'>Agendar novo atendimento</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-center h-96'>
              <div className='text-center'>
                <p className='text-lg font-semibold text-destructive'>
                  Acesso Negado
                </p>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Você não tem permissão para criar agendamentos.
                </p>
                <Button
                  variant='outline'
                  className='mt-4'
                  onClick={() => navigate({ to: '/appointments' })}
                >
                  Voltar aos Agendamentos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/appointments' })}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Nova Consulta</h1>
            <p className='text-muted-foreground'>Agendar novo atendimento</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Calendar className='h-5 w-5 text-primary' />
              Agendamento Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              Use o formulário completo para agendar uma nova consulta com todos os detalhes.
            </p>
            <Button
              onClick={() => setShowBookingDialog(true)}
              className='w-full'
            >
              Agendar Consulta
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Clock className='h-5 w-5 text-blue-500' />
              Horários Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              Visualize os horários disponíveis para hoje e os próximos dias.
            </p>
            <Button variant='outline' className='w-full' disabled>
              Em Breve
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <User className='h-5 w-5 text-green-500' />
              Pacientes Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              Agende rapidamente para pacientes que já foram atendidos.
            </p>
            <Button variant='outline' className='w-full' disabled>
              Em Breve
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Instruções de Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h4 className='font-semibold mb-2'>Como agendar uma consulta:</h4>
              <ol className='list-decimal list-inside space-y-2 text-sm text-muted-foreground'>
                <li>Clique em "Agendar Consulta" no cartão acima</li>
                <li>Selecione a data e horário desejados</li>
                <li>Escolha ou cadastre o paciente</li>
                <li>Selecione o tipo de serviço</li>
                <li>Escolha o profissional responsável</li>
                <li>Adicione observações se necessário</li>
                <li>Confirme o agendamento</li>
              </ol>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Dicas importantes:</h4>
              <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground'>
                <li>Verifique sempre a disponibilidade do profissional</li>
                <li>Confirme os dados do paciente antes de finalizar</li>
                <li>Adicione observações relevantes sobre o procedimento</li>
                <li>
                  O sistema verificará automaticamente conflitos de horário
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='mt-6'>
        <Link
          to='/appointments'
          className='text-sm text-muted-foreground hover:underline'
        >
          ← Voltar aos Agendamentos
        </Link>
      </div>

      {showBookingDialog && (
        <AppointmentBooking
          open={showBookingDialog}
          onOpenChange={setShowBookingDialog}
          clinicId={clinicId}
          initialService={search?.serviceId
            ? {
              id: search.serviceId,
              name: search.name ?? '',
              duration_minutes: typeof search.duration === 'number'
                ? search.duration
                : undefined,
              price: typeof search.price === 'number' ? search.price : undefined,
            }
            : undefined}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/appointments/new')({
  component: NewAppointmentPage,
});
