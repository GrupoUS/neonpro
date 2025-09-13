import { AppointmentBooking } from '@/components/appointment-booking';
import { type CalendarEvent, EventCalendar } from '@/components/event-calendar';
import {
  useAppointmentRealtime,
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import type { CreateAppointmentData, UpdateAppointmentData } from '@/services/appointments.service';
import { Card, CardContent } from '@neonpro/ui';
import { Button } from '@neonpro/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';

function AppointmentsPage() {
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const { user, profile, hasPermission, loading: authLoading } = useAuth();

  // Get clinic ID from user profile
  const clinicId = profile?.clinicId || '89084c3a-9200-4058-a15a-b440d3c60687'; // Fallback for testing

  // Check permissions
  const canViewAllAppointments = hasPermission('canViewAllAppointments');
  const canCreateAppointments = hasPermission('canCreateAppointments');
  const canEditAppointments = hasPermission('canEditAppointments');

  // Fetch appointments from database
  // For patients, we'll need to filter by patient_id in the future
  const { data: appointments, isLoading, error } = useAppointments(clinicId);

  // Set up real-time updates
  useAppointmentRealtime(clinicId);

  // Mutation hooks
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  const handleEventCreate = (event: Omit<CalendarEvent, 'id'>) => {
    // This would typically be handled by the AppointmentBooking component
    // For direct calendar creation, we'd need patient/service selection
    console.log('Creating new event:', event);
  };

  const handleEventUpdate = (eventId: string, updates: Partial<CalendarEvent>) => {
    const updateData: UpdateAppointmentData = {};

    if (updates.start) updateData.startTime = updates.start;
    if (updates.end) updateData.endTime = updates.end;
    if (updates.description) updateData.notes = updates.description;

    updateAppointmentMutation.mutate({
      appointmentId: eventId,
      updates: updateData,
      clinicId,
    });
  };

  const handleEventDelete = (eventId: string) => {
    deleteAppointmentMutation.mutate({
      appointmentId: eventId,
      clinicId,
      reason: 'Cancelled from calendar',
    });
  };

  const handleBookingComplete = (booking: {
    date: Date;
    time: string;
    patientId: string;
    patientName: string;
    serviceTypeId: string;
    serviceName: string;
    professionalId: string;
    notes?: string;
  }) => {
    // Parse time and create start/end dates
    const [hours, minutes] = booking.time.split(':').map(Number);
    const startTime = new Date(booking.date);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hours + 1, minutes, 0, 0); // Default 1 hour duration

    // In a real implementation, you'd need to:
    // 1. Look up patient ID by name or create new patient
    // 2. Look up service type ID by service name
    // 3. Get professional ID from current user or selection

    // Use the actual IDs from the booking form
    const appointmentData: CreateAppointmentData = {
      patientId: booking.patientId || 'placeholder-patient-id', // Will need patient creation if empty
      professionalId: booking.professionalId,
      serviceTypeId: booking.serviceTypeId,
      startTime,
      endTime,
      notes: booking.notes,
      status: 'scheduled',
    };

    createAppointmentMutation.mutate(
      { data: appointmentData, clinicId },
      {
        onSuccess: () => {
          setShowNewAppointment(false);
        },
      },
    );
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Agendamentos</h1>
          <p className='text-muted-foreground'>Gerencie suas consultas e compromissos</p>
        </div>
        {canCreateAppointments && (
          <Button onClick={() => setShowNewAppointment(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Nova Consulta
          </Button>
        )}
      </div>

      <Card>
        <CardContent className='p-6'>
          {(authLoading || isLoading) && (
            <div className='flex items-center justify-center h-96'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {authLoading ? 'Carregando perfil do usuário...' : 'Carregando agendamentos...'}
                </p>
              </div>
            </div>
          )}

          {!authLoading && !canViewAllAppointments && profile?.role !== 'patient' && (
            <div className='flex items-center justify-center h-96'>
              <div className='text-center'>
                <p className='text-lg font-semibold text-destructive'>Acesso Negado</p>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Você não tem permissão para visualizar agendamentos.
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className='flex items-center justify-center h-96'>
              <p className='text-sm text-red-500'>Erro ao carregar agendamentos.</p>
            </div>
          )}
          {!authLoading && !isLoading && !error && (canViewAllAppointments || profile?.role === 'patient') && (
            (appointments?.length ?? 0) === 0 ? (
              <p className='text-sm text-muted-foreground'>Nenhum agendamento encontrado</p>
            ) : (
              <EventCalendar
                events={(appointments || []).map(apt => ({
                  id: apt.id,
                  title: apt.title,
                  start: apt.start,
                  end: apt.end,
                  color: apt.color,
                  description: apt.description,
                }))}
                onEventCreate={handleEventCreate}
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
              />
            )
          )}
        </CardContent>
      </Card>

      <div className='mt-4'>
        <Link to='/dashboard' className='text-sm text-muted-foreground hover:underline'>
          ← Voltar ao Dashboard
        </Link>
      </div>

      {showNewAppointment && (
        <AppointmentBooking
          open={showNewAppointment}
          onOpenChange={setShowNewAppointment}
          clinicId={clinicId}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
});
