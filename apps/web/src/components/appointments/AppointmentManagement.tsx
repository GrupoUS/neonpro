/**
 * Real-Time Appointment Management Interface
 *
 * Features:
 * - Real-time appointment list with WebSocket updates
 * - No-show risk monitoring and intervention
 * - Multi-channel reminder management
 * - Appointment status updates with optimistic UI
 * - AI-powered analytics and insights
 * - Mobile-first Brazilian healthcare design
 */

import { format, isPast, isToday, isTomorrow } from 'date-fns';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  User,
  Video,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs } from '@/components/ui/tabs';

import {
  useAppointmentAnalytics,
  useAppointmentRealTimeUpdates,
  useAppointmentsList,
  useSendAppointmentReminder,
  useUpdateAppointmentStatus,
} from '@/hooks/use-appointments';
import { cn } from '@/lib/utils';

interface AppointmentManagementProps {
  view?: 'today' | 'week' | 'month';
  professionalId?: string;
  className?: string;
}

interface AppointmentCardProps {
  appointment: any;
  onStatusUpdate: (appointmentId: string, status: string) => void;
  onSendReminder: (appointmentId: string, channel: string) => void;
}

export function AppointmentManagement({
  view = 'today',
  professionalId,
  className,
}: AppointmentManagementProps) {
  const [selectedView, setSelectedView] = useState<'today' | 'week' | 'month'>(
    view,
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Real-time appointment data
  const { data: appointments, isLoading } = useAppointmentsList({
    professionalId,
    includeNoShowRisk: true,
    limit: 50,
  });

  // Real-time updates
  useAppointmentRealTimeUpdates({
    professionalId,
    enabled: true,
  });

  // Analytics data
  const { data: analytics } = useAppointmentAnalytics({
    professionalId,
    period: selectedView,
  });

  const updateStatus = useUpdateAppointmentStatus();
  const sendReminder = useSendAppointmentReminder();

  // Filter appointments based on view and status
  const filteredAppointments = appointments?.items?.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    const statusMatch = filterStatus === 'all' || appointment.status === filterStatus;

    switch (selectedView) {
      case 'today':
        return isToday(appointmentDate) && statusMatch;
      case 'week':
        return statusMatch; // Assume backend already filters by week
      case 'month':
        return statusMatch; // Assume backend already filters by month
      default:
        return statusMatch;
    }
  }) || [];

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ appointmentId, status });
    } catch (_error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleSendReminder = async (appointmentId: string, channel: string) => {
    try {
      await sendReminder.mutateAsync({ appointmentId, channel });
    } catch (_error) {
      console.error('Failed to send reminder:', error);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Gerenciamento de Consultas
            </div>
            <Badge variant='outline'>
              {filteredAppointments.length} consulta(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {analytics?.completed || 0}
              </div>
              <div className='text-sm text-muted-foreground'>Realizadas</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {analytics?.scheduled || 0}
              </div>
              <div className='text-sm text-muted-foreground'>Agendadas</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600'>
                {analytics?.rescheduled || 0}
              </div>
              <div className='text-sm text-muted-foreground'>Reagendadas</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {analytics?.noShow || 0}
              </div>
              <div className='text-sm text-muted-foreground'>Faltas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs and Filters */}
      <Card>
        <CardContent className='pt-6'>
          <Tabs
            value={selectedView}
            onValueChange={(value: any) => setSelectedView(value)}
          >
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
              <TabsList className='grid w-full sm:w-auto grid-cols-3'>
                <TabsTrigger value='today'>Hoje</TabsTrigger>
                <TabsTrigger value='week'>Semana</TabsTrigger>
                <TabsTrigger value='month'>Mês</TabsTrigger>
              </TabsList>

              <div className='flex gap-2'>
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setFilterStatus('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterStatus === 'scheduled' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setFilterStatus('scheduled')}
                >
                  Agendadas
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setFilterStatus('completed')}
                >
                  Realizadas
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className='space-y-4'>
        {isLoading
          ? (
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
          : filteredAppointments.length === 0
          ? (
            <Card>
              <CardContent className='pt-6'>
                <div className='text-center py-8'>
                  <Calendar className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                  <h3 className='text-lg font-medium'>
                    Nenhuma consulta encontrada
                  </h3>
                  <p className='text-muted-foreground'>
                    Não há consultas {selectedView === 'today' ? 'hoje' : `nesta ${selectedView}`}.
                  </p>
                </div>
              </CardContent>
            </Card>
          )
          : (
            filteredAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusUpdate={handleStatusUpdate}
                onSendReminder={handleSendReminder}
              />
            ))
          )}
      </div>

      {/* Real-time status indicator */}
      {(updateStatus.isPending || sendReminder.isPending) && (
        <Alert>
          <Clock className='h-4 w-4' />
          <AlertDescription>
            {updateStatus.isPending && 'Atualizando status da consulta...'}
            {sendReminder.isPending && 'Enviando lembrete...'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function AppointmentCard({
  appointment,
  onStatusUpdate,
  onSendReminder,
}: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.startTime);
  const isOverdue = isPast(appointmentDate) && appointment.status === 'scheduled';
  const riskLevel = appointment.noShowRisk?.level;

  const getStatusBadge = (_status: any) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant='default'>Agendada</Badge>;
      case 'confirmed':
        return <Badge variant='secondary'>Confirmada</Badge>;
      case 'completed':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-200'
          >
            Realizada
          </Badge>
        );
      case 'cancelled':
        return <Badge variant='destructive'>Cancelada</Badge>;
      case 'no-show':
        return <Badge variant='destructive'>Falta</Badge>;
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const getRiskBadge = (level?: string) => {
    if (!level) return null;

    switch (level) {
      case 'high':
        return (
          <Badge variant='destructive' className='text-xs'>
            <AlertTriangle className='h-3 w-3 mr-1' />
            Alto Risco
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant='default' className='text-xs'>
            <Clock className='h-3 w-3 mr-1' />
            Médio Risco
          </Badge>
        );
      case 'low':
        return (
          <Badge variant='secondary' className='text-xs'>
            <CheckCircle className='h-3 w-3 mr-1' />
            Baixo Risco
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isOverdue && 'border-red-200 bg-red-50',
        riskLevel === 'high' && 'border-l-4 border-l-red-500',
      )}
    >
      <CardContent className='pt-6'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 space-y-2'>
            {/* Time and Patient */}
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-muted-foreground' />
                <span className='font-medium'>
                  {format(appointmentDate, 'HH:mm')}
                </span>
                {isToday(appointmentDate) && (
                  <Badge variant='outline' className='text-xs'>
                    Hoje
                  </Badge>
                )}
                {isTomorrow(appointmentDate) && (
                  <Badge variant='outline' className='text-xs'>
                    Amanhã
                  </Badge>
                )}
              </div>

              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='font-medium'>{appointment.patientName}</span>
              </div>
            </div>

            {/* Service and Status */}
            <div className='flex items-center gap-4'>
              <span className='text-sm text-muted-foreground'>
                {appointment.serviceName || 'Consulta'}
              </span>
              {getStatusBadge(appointment.status)}
              {getRiskBadge(riskLevel)}
            </div>

            {/* No-show risk details */}
            {appointment.noShowRisk && riskLevel !== 'low' && (
              <div className='mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='h-4 w-4 text-yellow-600' />
                  <span className='text-sm font-medium text-yellow-800'>
                    Risco de Falta: {appointment.noShowRisk.score}%
                  </span>
                </div>
                {appointment.noShowRisk.factors && (
                  <div className='text-xs text-yellow-700'>
                    Fatores: {appointment.noShowRisk.factors.slice(0, 3).join(', ')}
                  </div>
                )}
                {appointment.noShowRisk.interventions && (
                  <div className='mt-2 flex gap-2'>
                    {appointment.noShowRisk.interventions
                      .slice(0, 2)
                      .map((intervention: string, index: number) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-xs'
                        >
                          {intervention}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <p className='text-sm text-muted-foreground mt-2'>
                {appointment.notes}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {/* Status Updates */}
              {appointment.status === 'scheduled' && (
                <>
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
                  >
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Confirmar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(appointment.id, 'completed')}
                  >
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Marcar como Realizada
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(appointment.id, 'no-show')}
                  >
                    <XCircle className='h-4 w-4 mr-2' />
                    Marcar como Falta
                  </DropdownMenuItem>
                </>
              )}

              {/* Reminders */}
              <DropdownMenuItem
                onClick={() => onSendReminder(appointment.id, 'whatsapp')}
              >
                <MessageSquare className='h-4 w-4 mr-2' />
                Lembrete WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSendReminder(appointment.id, 'sms')}
              >
                <Phone className='h-4 w-4 mr-2' />
                Lembrete SMS
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSendReminder(appointment.id, 'email')}
              >
                <Mail className='h-4 w-4 mr-2' />
                Lembrete E-mail
              </DropdownMenuItem>

              {/* Telemedicine */}
              {appointment.type === 'telemedicine' && (
                <DropdownMenuItem>
                  <Video className='h-4 w-4 mr-2' />
                  Iniciar Videochamada
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default AppointmentManagement;
