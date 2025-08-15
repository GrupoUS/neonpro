'use client';

import { addDays, format, isAfter, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, CalendarIcon, Clock, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PatientAppointment } from '@/hooks/patient/usePatientAppointments';
import { cn } from '@/lib/utils';

/**
 * Reschedule Request Dialog for NeonPro
 *
 * Based on VIBECODE MCP Research:
 * - Context7: React calendar and form patterns
 * - Tavily: Healthcare rescheduling best practices (48h minimum)
 * - Exa: Advanced rescheduling workflows and availability checking
 */

interface RescheduleRequestProps {
  appointmentId: string;
  appointment: PatientAppointment | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    appointmentId: string,
    newDate: string,
    newTime: string,
    reason: string
  ) => Promise<void>;
}

// Common rescheduling reasons based on Exa research
const RESCHEDULE_REASONS = [
  'Conflito de agenda',
  'Problema de transporte',
  'Compromisso profissional',
  'Viagem imprevista',
  'Questões de saúde',
  'Preferência de horário',
  'Outro motivo',
] as const;

// Available time slots (would come from API in real implementation)
const TIME_SLOTS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
] as const;

export function RescheduleRequest({
  appointmentId,
  appointment,
  open,
  onOpenChange,
  onConfirm,
}: RescheduleRequestProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  if (!appointment) {
    return null;
  }

  const canReschedule = appointment.can_reschedule;
  const hoursUntil = appointment.hours_until_appointment;

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate && appointment.service_id) {
      setLoadingSlots(true);
      // Simulate API call to get available slots
      setTimeout(() => {
        // In real implementation, this would check professional availability
        const mockAvailableSlots = TIME_SLOTS.filter(
          (_, _index) => Math.random() > 0.3
        );
        setAvailableSlots(mockAvailableSlots);
        setLoadingSlots(false);
      }, 500);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, appointment.service_id]);

  const formatAppointmentDateTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}`);
      return {
        date: format(dateTime, 'EEEE, dd MMMM yyyy', { locale: ptBR }),
        time: format(dateTime, 'HH:mm', { locale: ptBR }),
      };
    } catch (_error) {
      return { date, time };
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleConfirm = async () => {
    if (!(selectedDate && selectedTime && (selectedReason || customReason))) {
      return;
    }

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const finalReason = customReason.trim() || selectedReason;

    setIsSubmitting(true);
    try {
      await onConfirm(appointmentId, formattedDate, selectedTime, finalReason);

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedReason('');
      setCustomReason('');
    } catch (error) {
      console.error('Error confirming reschedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedReason('');
    setCustomReason('');
    onOpenChange(false);
  };

  // Date constraints: minimum 48h in advance, maximum 90 days
  const minDate = addDays(new Date(), 2); // 48h minimum
  const maxDate = addDays(new Date(), 90);

  // Disable Sundays (common for clinics)
  const isDateDisabled = (date: Date) => {
    return (
      date.getDay() === 0 || !isAfter(date, startOfDay(addDays(new Date(), 1)))
    );
  };

  const { date, time } = formatAppointmentDateTime(
    appointment.appointment_date,
    appointment.appointment_time
  );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-500" />
            Solicitar Reagendamento
          </DialogTitle>
          <DialogDescription>
            Solicite uma nova data e horário para seu agendamento. A solicitação
            será analisada pela clínica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment Details */}
          <div className="space-y-2 rounded-lg bg-muted/30 p-4">
            <h3 className="font-semibold text-muted-foreground text-sm">
              Agendamento atual:
            </h3>
            <div className="font-semibold">{appointment.service_name}</div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{time}</span>
              </div>
            </div>
            {appointment.professional_name && (
              <div className="text-muted-foreground text-sm">
                Profissional: {appointment.professional_name}
              </div>
            )}
          </div>

          {/* Policy Check */}
          {canReschedule ? (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div>
                  <strong>Reagendamento permitido</strong>
                </div>
                <div className="mt-1 text-sm">
                  Você pode solicitar reagendamento até 48h antes do horário
                  agendado.
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <strong>Reagendamento não permitido</strong>
                </div>
                <div className="mt-1 text-sm">
                  Solicitações de reagendamento devem ser feitas com pelo menos
                  48h de antecedência. Restam apenas {hoursUntil}h para seu
                  agendamento.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {canReschedule && (
            <>
              {/* New Date Selection */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="font-medium text-sm">Nova data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground'
                        )}
                        variant="outline"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, 'PPP', { locale: ptBR })
                          : 'Selecione uma data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        disabled={isDateDisabled}
                        fromDate={minDate}
                        initialFocus
                        locale={ptBR}
                        mode="single"
                        onSelect={handleDateSelect}
                        selected={selectedDate}
                        toDate={maxDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="text-muted-foreground text-xs">
                    • Mínimo: 48h de antecedência
                    <br />• Domingos indisponíveis
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-3">
                  <Label className="font-medium text-sm">Novo horário *</Label>
                  <Select
                    disabled={!selectedDate}
                    onValueChange={setSelectedTime}
                    value={selectedTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSlots ? (
                        <SelectItem disabled value="loading">
                          Carregando horários...
                        </SelectItem>
                      ) : availableSlots.length === 0 ? (
                        <SelectItem disabled value="none">
                          {selectedDate
                            ? 'Nenhum horário disponível'
                            : 'Selecione uma data primeiro'}
                        </SelectItem>
                      ) : (
                        availableSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-muted-foreground text-xs">
                    Duração: {appointment.service_duration} min
                  </div>
                </div>
              </div>

              {/* Reason Selection */}
              <div className="space-y-3">
                <Label className="font-medium text-sm">
                  Motivo do reagendamento *
                </Label>
                <Select
                  onValueChange={setSelectedReason}
                  value={selectedReason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESCHEDULE_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom reason field */}
                {(selectedReason === 'Outro motivo' ||
                  selectedReason === '') && (
                  <div className="space-y-2">
                    <Label className="text-sm" htmlFor="customReason">
                      {selectedReason === 'Outro motivo'
                        ? 'Especifique o motivo:'
                        : 'Ou descreva o motivo:'}
                    </Label>
                    <Textarea
                      id="customReason"
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Descreva o motivo do reagendamento..."
                      rows={3}
                      value={customReason}
                    />
                  </div>
                )}
              </div>

              {/* Request info */}
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div>
                    <strong>Processo de reagendamento:</strong>
                  </div>
                  <div className="mt-1 space-y-1 text-sm">
                    <div>• Sua solicitação será analisada em até 24h</div>
                    <div>• Você receberá confirmação por email e WhatsApp</div>
                    <div>
                      • Se aprovada, seu agendamento atual será automaticamente
                      cancelado
                    </div>
                    <div>
                      • Se não houver disponibilidade, você receberá opções
                      alternativas
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={handleCancel}
            variant="outline"
          >
            Cancelar
          </Button>
          {canReschedule && (
            <Button
              className="w-full sm:w-auto"
              disabled={
                !(
                  selectedDate &&
                  selectedTime &&
                  (selectedReason || customReason.trim())
                ) || isSubmitting
              }
              onClick={handleConfirm}
            >
              {isSubmitting ? 'Enviando...' : 'Solicitar Reagendamento'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
