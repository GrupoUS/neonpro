'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, Edit, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
}

interface Appointment {
  id: string;
  professional: Professional;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface TimeSlot {
  time: string;
  duration: number;
  available: boolean;
}

interface AppointmentListProps {
  onNewAppointment?: () => void;
}

export function AppointmentList({ onNewAppointment }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    appointment: Appointment | null;
    selectedDate: string;
    selectedTime: string;
    availableSlots: TimeSlot[];
    loadingSlots: boolean;
    notes: string;
  }>({
    open: false,
    appointment: null,
    selectedDate: '',
    selectedTime: '',
    availableSlots: [],
    loadingSlots: false,
    notes: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/patient-portal/appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load appointments');
      }

      setAppointments(data.appointments || []);

    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Não foi possível carregar seus agendamentos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setActionLoading(appointmentId);

      const response = await fetch(`/api/patient-portal/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel appointment');
      }

      toast({
        title: "Consulta cancelada",
        description: data.message || "Sua consulta foi cancelada com sucesso.",
      });

      // Refresh appointments list
      loadAppointments();

    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Erro ao cancelar",
        description: error.message || "Não foi possível cancelar a consulta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    setRescheduleDialog({
      open: true,
      appointment,
      selectedDate: '',
      selectedTime: '',
      availableSlots: [],
      loadingSlots: false,
      notes: appointment.notes || ''
    });
  };

  const closeRescheduleDialog = () => {
    setRescheduleDialog({
      open: false,
      appointment: null,
      selectedDate: '',
      selectedTime: '',
      availableSlots: [],
      loadingSlots: false,
      notes: ''
    });
  };

  const loadRescheduleSlots = async (date: string) => {
    if (!rescheduleDialog.appointment) return;

    try {
      setRescheduleDialog(prev => ({ ...prev, loadingSlots: true, availableSlots: [] }));

      const response = await fetch(
        `/api/patient-portal/availability?date=${date}&professional_id=${rescheduleDialog.appointment.professional.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load availability');
      }

      setRescheduleDialog(prev => ({
        ...prev,
        availableSlots: data.availableSlots || [],
        loadingSlots: false
      }));

    } catch (error) {
      console.error('Error loading reschedule slots:', error);
      setRescheduleDialog(prev => ({ ...prev, loadingSlots: false }));
      toast({
        title: "Erro ao carregar horários",
        description: "Não foi possível carregar os horários disponíveis.",
        variant: "destructive",
      });
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDialog.appointment || !rescheduleDialog.selectedDate || !rescheduleDialog.selectedTime) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione uma nova data e horário.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading('reschedule');

      const response = await fetch(`/api/patient-portal/appointments/${rescheduleDialog.appointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_date: rescheduleDialog.selectedDate,
          appointment_time: rescheduleDialog.selectedTime,
          notes: rescheduleDialog.notes.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule appointment');
      }

      toast({
        title: "Consulta reagendada",
        description: data.message || "Sua consulta foi reagendada com sucesso.",
      });

      closeRescheduleDialog();
      loadAppointments();

    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Erro ao reagendar",
        description: error.message || "Não foi possível reagendar a consulta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
          })
        });
      }
    }
    
    return dates;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'rescheduled':
        return 'Reagendado';
      default:
        return status;
    }
  };

  const canModifyAppointment = (appointment: Appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment > 2 && !['cancelled', 'completed'].includes(appointment.status);
  };

  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
    const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-gray-600">Carregando agendamentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Meus Agendamentos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize e gerencie suas consultas
          </p>
        </div>
        
        {onNewAppointment && (
          <Button onClick={onNewAppointment}>
            Novo Agendamento
          </Button>
        )}
      </div>

      {/* Appointments List */}
      {sortedAppointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você ainda não possui consultas agendadas.
            </p>
            {onNewAppointment && (
              <Button onClick={onNewAppointment}>
                Agendar Primera Consulta
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Professional Info */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {appointment.professional.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {appointment.professional.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{formatDate(appointment.appointment_date)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{formatTime(appointment.appointment_time)} ({appointment.duration_minutes}min)</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    {(appointment.professional.email || appointment.professional.phone) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {appointment.professional.email && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{appointment.professional.email}</span>
                          </div>
                        )}
                        {appointment.professional.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{appointment.professional.phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Observações:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end space-y-3">
                    <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
                      {getStatusLabel(appointment.status)}
                    </Badge>

                    {canModifyAppointment(appointment) && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRescheduleDialog(appointment)}
                          disabled={actionLoading === appointment.id}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reagendar
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === appointment.id}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza de que deseja cancelar esta consulta com {appointment.professional.name}?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Manter Consulta</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sim, Cancelar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                    {!canModifyAppointment(appointment) && !['cancelled', 'completed'].includes(appointment.status) && (
                      <div className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Não é possível modificar</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={closeRescheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reagendar Consulta</DialogTitle>
            <DialogDescription>
              Selecione uma nova data e horário para sua consulta com{' '}
              {rescheduleDialog.appointment?.professional.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date Selection */}
            <div>
              <Label>Nova Data</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {generateAvailableDates().slice(0, 12).map((date) => (
                  <Button
                    key={date.value}
                    variant={rescheduleDialog.selectedDate === date.value ? "default" : "outline"}
                    size="sm"
                    className="h-auto p-2 flex flex-col"
                    onClick={() => {
                      setRescheduleDialog(prev => ({
                        ...prev,
                        selectedDate: date.value,
                        selectedTime: '',
                        availableSlots: []
                      }));
                      loadRescheduleSlots(date.value);
                    }}
                  >
                    <span className="text-xs">{date.label.split(' ')[0]}</span>
                    <span className="text-sm">{date.label.split(' ')[1]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {rescheduleDialog.selectedDate && (
              <div>
                <Label>Novo Horário</Label>
                {rescheduleDialog.loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm">Carregando horários...</span>
                  </div>
                ) : rescheduleDialog.availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {rescheduleDialog.availableSlots.map((slot, index) => (
                      <Button
                        key={`${slot.time}-${index}`}
                        variant={rescheduleDialog.selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRescheduleDialog(prev => ({ ...prev, selectedTime: slot.time }))}
                      >
                        {formatTime(slot.time)}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mt-2">
                    Nenhum horário disponível para esta data.
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="reschedule-notes">Observações</Label>
              <Textarea
                id="reschedule-notes"
                value={rescheduleDialog.notes}
                onChange={(e) => setRescheduleDialog(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre a consulta..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRescheduleDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={
                !rescheduleDialog.selectedDate ||
                !rescheduleDialog.selectedTime ||
                actionLoading === 'reschedule'
              }
            >
              {actionLoading === 'reschedule' ? 'Reagendando...' : 'Confirmar Reagendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}