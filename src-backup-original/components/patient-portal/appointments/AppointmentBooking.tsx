'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Professional {
  id: string;
  name: string;
  specialty: string;
}

interface TimeSlot {
  time: string;
  duration: number;
  available: boolean;
  professional: Professional;
}

interface AppointmentBookingProps {
  clinicId: string;
  onSuccess?: (appointment: any) => void;
  onCancel?: () => void;
}

export function AppointmentBooking({ 
  clinicId, 
  onSuccess, 
  onCancel 
}: AppointmentBookingProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { toast } = useToast();

  // Generate next 30 days for date selection
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (0 = Sunday)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
          }),
          fullDate: date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        });
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      setAvailableSlots([]);
      setSelectedSlot(null);

      const response = await fetch(
        `/api/patient-portal/availability?date=${date}`,
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

      setAvailableSlots(data.availableSlots || []);

      if (data.availableSlots?.length === 0) {
        toast({
          title: "Nenhum horário disponível",
          description: "Não há horários disponíveis para esta data. Tente outra data ou entre na lista de espera.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error loading slots:', error);
      toast({
        title: "Erro ao carregar horários",
        description: "Não foi possível carregar os horários disponíveis. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      toast({
        title: "Selecione um horário",
        description: "Por favor, selecione um horário disponível para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/patient-portal/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: selectedSlot.professional.id,
          appointment_date: selectedDate,
          appointment_time: selectedSlot.time,
          duration_minutes: selectedSlot.duration,
          notes: notes.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      toast({
        title: "Agendamento realizado!",
        description: data.message || "Sua consulta foi agendada com sucesso.",
      });

      onSuccess?.(data.appointment);

    } catch (error: any) {
      console.error('Error booking appointment:', error);
      
      if (error.message.includes('no longer available')) {
        // Refresh slots if conflict
        loadAvailableSlots(selectedDate);
      }

      toast({
        title: "Erro no agendamento",
        description: error.message || "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedDate) {
      toast({
        title: "Selecione uma data",
        description: "Por favor, selecione uma data para entrar na lista de espera.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/patient-portal/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: selectedSlot?.professional?.id,
          preferred_date: selectedDate,
          preferred_time_start: '09:00',
          preferred_time_end: '18:00',
          notes: notes.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      toast({
        title: "Adicionado à lista de espera",
        description: data.message || "Você foi adicionado à lista de espera. Notificaremos quando houver disponibilidade.",
      });

    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Erro na lista de espera",
        description: error.message || "Não foi possível adicionar à lista de espera. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const groupSlotsByProfessional = (slots: TimeSlot[]) => {
    const grouped = slots.reduce((acc, slot) => {
      const key = slot.professional.id;
      if (!acc[key]) {
        acc[key] = {
          professional: slot.professional,
          slots: []
        };
      }
      acc[key].slots.push(slot);
      return acc;
    }, {} as Record<string, { professional: Professional; slots: TimeSlot[] }>);

    return Object.values(grouped);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Agendar Consulta
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Escolha a data e horário de sua preferência
        </p>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Selecione a Data
          </CardTitle>
          <CardDescription>
            Escolha uma data disponível para agendamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {availableDates.map((date) => (
              <Button
                key={date.value}
                variant={selectedDate === date.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-auto p-3 flex flex-col items-center",
                  selectedDate === date.value && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSelectedDate(date.value)}
              >
                <span className="text-xs font-medium">{date.label.split(' ')[0]}</span>
                <span className="text-sm">{date.label.split(' ')[1]}</span>
                <span className="text-xs">{date.label.split(' ')[2]}</span>
              </Button>
            ))}
          </div>
          
          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Data selecionada: {availableDates.find(d => d.value === selectedDate)?.fullDate}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horários Disponíveis
            </CardTitle>
            <CardDescription>
              Selecione o profissional e horário desejado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-gray-600">Carregando horários...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="space-y-6">
                {groupSlotsByProfessional(availableSlots).map((group) => (
                  <div key={group.professional.id}>
                    <div className="flex items-center mb-3">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {group.professional.name}
                      </h4>
                      <Badge variant="secondary" className="ml-2">
                        {group.professional.specialty}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {group.slots.map((slot, index) => (
                        <Button
                          key={`${slot.professional.id}-${slot.time}-${index}`}
                          variant={
                            selectedSlot?.time === slot.time && 
                            selectedSlot?.professional.id === slot.professional.id
                              ? "default" 
                              : "outline"
                          }
                          size="sm"
                          className="h-12 flex flex-col"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <span className="font-medium">{formatTime(slot.time)}</span>
                          <span className="text-xs text-gray-500">
                            {slot.duration}min
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhum horário disponível
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Não há horários disponíveis para esta data.
                </p>
                <Button
                  variant="outline"
                  onClick={handleJoinWaitlist}
                  disabled={loading}
                >
                  Entrar na Lista de Espera
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Appointment Summary */}
      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Resumo do Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">{selectedSlot.professional.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedSlot.professional.specialty}
                  </p>
                </div>
                <Badge variant="secondary">
                  {selectedSlot.duration} minutos
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">
                    {availableDates.find(d => d.value === selectedDate)?.fullDate}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium">
                    {formatTime(selectedSlot.time)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Descreva brevemente o motivo da consulta ou observações importantes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleBookAppointment}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
              
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}