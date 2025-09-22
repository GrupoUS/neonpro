/**
 * Appointment Scheduling System (T058)
 * Brazilian healthcare appointment scheduling with real-time availability
 *
 * Features:
 * - Real-time calendar with healthcare provider availability
 * - Brazilian appointment types and durations
 * - Mobile-first responsive design
 * - LGPD-compliant patient data handling
 * - Automated reminder system integration
 * - WCAG 2.1 AA+ accessibility compliance
 * - Portuguese localization
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  addDays,
  addWeeks,
  format,
  isToday,
  isWeekend,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Calendar, CheckCircle, Clock, MapPin, Phone, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HealthcareButton } from '@/components/ui/healthcare/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare/healthcare-input';
import { HealthcareLoading } from '@/components/ui/healthcare/healthcare-loading';
import { useScreenReaderAnnouncer } from '@/hooks/accessibility/use-focus-management';
import { useMobileOptimization } from '@/hooks/accessibility/use-mobile-optimization';
import { cn } from '@/lib/utils';

// Brazilian appointment types with durations and pricing
const brazilianAppointmentTypes = [
  {
    id: 'consultation',
    name: 'Consulta Inicial',
    duration: 60,
    price: 250,
    category: 'consultation',
  },
  {
    id: 'followup',
    name: 'Consulta de Retorno',
    duration: 30,
    price: 180,
    category: 'consultation',
  },
  { id: 'botox', name: 'Aplicação de Botox', duration: 45, price: 800, category: 'treatment' },
  { id: 'filler', name: 'Preenchimento Facial', duration: 60, price: 1200, category: 'treatment' },
  { id: 'laser', name: 'Tratamento a Laser', duration: 90, price: 600, category: 'treatment' },
  { id: 'peeling', name: 'Peeling Químico', duration: 45, price: 350, category: 'treatment' },
  { id: 'hydra', name: 'Hydra Facial', duration: 60, price: 280, category: 'treatment' },
  {
    id: 'evaluation',
    name: 'Avaliação Corporal',
    duration: 90,
    price: 320,
    category: 'evaluation',
  },
];

// Healthcare providers schedule
const healthcareProviders = [
  {
    id: 'dr-silva',
    name: 'Dra. Ana Silva',
    specialty: 'Dermatologia Estética',
    availability: generateWeeklyAvailability(),
    phone: '(11) 98765-4321',
  },
  {
    id: 'dr-santos',
    name: 'Dr. Carlos Santos',
    specialty: 'Medicina Estética',
    availability: generateWeeklyAvailability(),
    phone: '(11) 91234-5678',
  },
  {
    id: 'dr-costa',
    name: 'Dra. Maria Costa',
    specialty: 'Cosmiatria',
    availability: generateWeeklyAvailability(),
    phone: '(11) 99876-5432',
  },
];

// Time slots for appointments
const timeSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
];

// Generate mock weekly availability
function generateWeeklyAvailability() {
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days.reduce((acc, day) => {
    acc[day] = {
      morning: day !== 'Sábado',
      afternoon: day !== 'Sábado',
      evening: day !== 'Sábado' && day !== 'Sexta',
    };
    return acc;
  }, {} as Record<string, { morning: boolean; afternoon: boolean; evening: boolean }>);
}

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Selecione um paciente'),
  providerId: z.string().min(1, 'Selecione um profissional'),
  appointmentType: z.string().min(1, 'Selecione o tipo de consulta'),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione um horário'),
  duration: z.number().min(15, 'Duração mínima de 15 minutos'),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  notes: z.string().optional(),
  sendReminder: z.boolean().default(true),
  reminderType: z.enum(['sms', 'email', 'both']).default('both'),
});

type AppointmentData = z.infer<typeof appointmentSchema>;

interface AppointmentSchedulingSystemProps {
  patients: Array<{ id: string; name: string; phone: string; email: string }>;
  onSchedule: (appointment: AppointmentData) => Promise<void>;
  onCancel?: () => void;
  existingAppointments?: Array<{
    date: string;
    time: string;
    providerId: string;
    duration: number;
  }>;
  className?: string;
  testId?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  isAvailable: boolean;
}

export const AppointmentSchedulingSystem: React.FC<AppointmentSchedulingSystemProps> = ({
  patients,onSchedule, onCancel, existingAppointments = [],className, testId = 'appointment-scheduling-system', }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { announcePolite } = useScreenReaderAnnouncer();
  const { touchTargetSize } = useMobileOptimization();

  const form = useForm<AppointmentData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      providerId: '',
      appointmentType: '',
      date: '',
      time: '',
      duration: 60,
      price: 0,
      notes: '',
      sendReminder: true,
      reminderType: 'both',
    },
  });

  // Watch form values for real-time updates
  const watchedValues = form.watch(['providerId', 'appointmentType', 'date']);

  // Update available slots when provider, appointment type, or date changes
  useEffect(() => {
    const [providerId, appointmentType, date] = watchedValues;
    if (providerId && appointmentType && date) {
      calculateAvailableSlots(providerId, date, appointmentType);
    } else {
      setAvailableSlots([]);
      setSelectedTime(null);
    }
  }, [watchedValues, existingAppointments]);

  // Calculate available time slots
  const calculateAvailableSlots = useCallback((
    providerId: string,
    date: string,
    appointmentType: string,
  ) => {
    const appointmentTypeData = brazilianAppointmentTypes.find(type => type.id === appointmentType);
    if (!appointmentTypeData) return;

    const provider = healthcareProviders.find(p => p.id === providerId);
    if (!provider) return;

    const selectedDate = parseISO(date);
    const dayOfWeek = format(selectedDate, 'EEEE', { locale: ptBR });
    const dayName = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

    const dayAvailability = provider.availability[dayName];
    if (!dayAvailability) {
      setAvailableSlots([]);
      return;
    }

    const slots: string[] = [];
    const bookedSlots = existingAppointments
      .filter(apt => apt.date === date && apt.providerId === providerId)
      .map(apt => ({
        time: apt.time,
        duration: apt.duration,
      }));

    timeSlots.forEach(timeSlot => {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotTime = setMinutes(setHours(selectedDate, hours), minutes);

      // Check if time is within available periods
      const isMorning = hours >= 8 && hours < 12;
      const isAfternoon = hours >= 14 && hours < 18;
      const isEvening = hours >= 18 && hours < 20;

      let isTimeAvailable = false;
      if (isMorning && dayAvailability.morning) isTimeAvailable = true;
      if (isAfternoon && dayAvailability.afternoon) isTimeAvailable = true;
      if (isEvening && dayAvailability.evening) isTimeAvailable = true;

      // Check if slot conflicts with existing appointments
      const hasConflict = bookedSlots.some(booked => {
        const [bookedHours, bookedMinutes] = booked.time.split(':').map(Number);
        const bookedTime = setMinutes(setHours(selectedDate, bookedHours), bookedMinutes);
        const bookedEnd = new Date(bookedTime.getTime() + booked.duration * 60000);
        const slotEnd = new Date(slotTime.getTime() + appointmentTypeData.duration * 60000);

        return slotTime < bookedEnd && slotEnd > bookedTime;
      });

      if (isTimeAvailable && !hasConflict) {
        slots.push(timeSlot);
      }
    });

    setAvailableSlots(slots);
    setSelectedTime(null);
  }, [existingAppointments]);

  // Generate calendar days
  const generateCalendarDays = useCallback((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: isToday(currentDate),
        isSelected: selectedDate
          ? currentDate.toDateString() === selectedDate.toDateString()
          : false,
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        isAvailable: currentDate >= new Date() && !isWeekend(currentDate),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth, selectedDate]);

  const handleDateSelect = useCallback((date: Date) => {
    if (date < new Date() || isWeekend(date)) return;

    setSelectedDate(date);
    form.setValue('date', format(date, 'yyyy-MM-dd'));
    setSelectedTime(null);

    announcePolite(
      `Data selecionada: ${format(date, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}`,
    );
  }, [form, announcePolite]);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    form.setValue('time', time);

    const timeFormatted = time.replace(':', 'h');
    announcePolite(`Horário selecionado: ${timeFormatted}`);
  }, [form, announcePolite]);

  const handleProviderSelect = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
    form.setValue('providerId', providerId);

    const provider = healthcareProviders.find(p => p.id === providerId);
    if (provider) {
      announcePolite(`Profissional selecionado: ${provider.name}`);
    }
  }, [form, announcePolite]);

  const handleAppointmentTypeSelect = useCallback((typeId: string) => {
    setSelectedAppointmentType(typeId);
    form.setValue('appointmentType', typeId);

    const appointmentType = brazilianAppointmentTypes.find(t => t.id === typeId);
    if (appointmentType) {
      form.setValue('duration', appointmentType.duration);
      form.setValue('price', appointmentType.price);
      announcePolite(`Tipo de consulta selecionado: ${appointmentType.name}`);
    }
  }, [form, announcePolite]);

  const handleSubmit = useCallback(async (data: AppointmentData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      announcePolite('Agendando consulta...');
      await onSchedule(data);
      setSuccess(true);
      announcePolite('Consulta agendada com sucesso');

      // Reset form after successful submission
      setTimeout(() => {
        form.reset();
        setSelectedDate(null);
        setSelectedTime(null);
        setSelectedProvider(null);
        setSelectedAppointmentType(null);
        setSuccess(false);
        if (onCancel) onCancel();
      }, 3000);
    } catch (_err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao agendar consulta';
      setError(errorMessage);
      announcePolite(`Erro no agendamento: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSchedule, form, announcePolite, onCancel]);

  const handleShowConfirmation = useCallback(() => {
    setShowConfirmation(true);
    announcePolite('Confirmação de agendamento');
  }, [announcePolite]);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmation(false);
    announcePolite('Confirmação cancelada');
  }, [announcePolite]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? addWeeks(prev, -1) : addWeeks(prev, 1));
  }, []);

  if (success) {
    return (
      <div
        className={cn('w-full max-w-2xl mx-auto p-6 text-center', className)}
        data-testid={testId}
      >
        <div className='bg-green-50 border border-green-200 rounded-lg p-8'>
          <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-green-900 mb-2'>
            Consulta Agendada com Sucesso!
          </h2>
          <p className='text-green-700 mb-6'>
            Você receberá uma confirmação por e-mail e SMS.
          </p>
          <HealthcareButton
            onClick={() => onCancel?.()}
            healthcareContext='appointment-scheduling'
            accessibilityAction='close'
          >
            Fechar
          </HealthcareButton>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    const values = form.getValues();
    const appointmentType = brazilianAppointmentTypes.find(t => t.id === values.appointmentType);
    const provider = healthcareProviders.find(p => p.id === values.providerId);
    const patient = patients.find(p => p.id === values.patientId);

    return (
      <div
        className={cn('w-full max-w-2xl mx-auto p-6', className)}
        data-testid={`${testId}-confirmation`}
      >
        <div className='bg-white border rounded-lg p-6'>
          <h2 className='text-2xl font-bold mb-6'>Confirmar Agendamento</h2>

          <div className='space-y-4 mb-6'>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium mb-2'>Paciente</h3>
              <p className='text-sm'>{patient?.name}</p>
            </div>

            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium mb-2'>Profissional</h3>
              <p className='text-sm'>{provider?.name} - {provider?.specialty}</p>
            </div>

            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium mb-2'>Tipo de Consulta</h3>
              <p className='text-sm'>{appointmentType?.name}</p>
              <p className='text-sm text-muted-foreground'>
                Duração: {appointmentType?.duration} minutos
              </p>
              <p className='text-sm text-muted-foreground'>
                Valor: R$ {appointmentType?.price?.toFixed(2)}
              </p>
            </div>

            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium mb-2'>Data e Horário</h3>
              <p className='text-sm'>
                {selectedDate
                  && format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
              </p>
              <p className='text-sm'>às {selectedTime?.replace(':', 'h')}</p>
            </div>
          </div>

          <div className='flex space-x-3'>
            <HealthcareButton
              variant='outline'
              onClick={handleCancelConfirmation}
              healthcareContext='appointment-scheduling'
              accessibilityAction='cancel'
              className='flex-1'
            >
              Voltar
            </HealthcareButton>
            <HealthcareButton
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSubmitting}
              healthcareContext='appointment-scheduling'
              accessibilityAction='confirm'
              className='flex-1'
            >
              {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
            </HealthcareButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-6xl mx-auto p-6', className)} data-testid={testId}>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold mb-2'>Agendamento de Consultas</h1>
        <p className='text-muted-foreground'>
          Agende sua consulta de forma rápida e segura
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className='mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg'
          role='alert'
        >
          <p className='text-sm text-destructive font-medium'>{error}</p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(handleShowConfirmation)} className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Patient and Service Selection */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Patient Selection */}
            <div>
              <label htmlFor='patientId' className='block text-sm font-medium mb-2'>
                Selecione o Paciente *
              </label>
              <HealthcareInput
                id='patientId'
                {...form.register('patientId')}
                type='select'
                options={patients.map(patient => ({
                  value: patient.id,
                  label: patient.name,
                }))}
                placeholder='Escolha um paciente...'
                healthcareContext='appointment-scheduling'
                accessibilityAction='select'
                aria-required='true'
              />
              {form.formState.errors.patientId && (
                <p className='text-sm text-destructive mt-1'>
                  {form.formState.errors.patientId.message}
                </p>
              )}
            </div>

            {/* Provider Selection */}
            <div>
              <label htmlFor='providerId' className='block text-sm font-medium mb-2'>
                Profissional de Saúde *
              </label>
              <div className='grid grid-cols-1 gap-2'>
                {healthcareProviders.map(provider => (
                  <button
                    key={provider.id}
                    type='button'
                    onClick={() => handleProviderSelect(provider.id)}
                    className={cn(
                      'p-3 border rounded-lg text-left transition-colors',
                      selectedProvider === provider.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    <div className='flex items-center space-x-3'>
                      <User className='h-5 w-5 text-muted-foreground' />
                      <div>
                        <p className='font-medium text-sm'>{provider.name}</p>
                        <p className='text-xs text-muted-foreground'>{provider.specialty}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {form.formState.errors.providerId && (
                <p className='text-sm text-destructive mt-1'>
                  {form.formState.errors.providerId.message}
                </p>
              )}
            </div>

            {/* Appointment Type Selection */}
            <div>
              <label htmlFor='appointmentType' className='block text-sm font-medium mb-2'>
                Tipo de Consulta *
              </label>
              <div className='grid grid-cols-1 gap-2'>
                {brazilianAppointmentTypes.map(type => (
                  <button
                    key={type.id}
                    type='button'
                    onClick={() => handleAppointmentTypeSelect(type.id)}
                    className={cn(
                      'p-3 border rounded-lg text-left transition-colors',
                      selectedAppointmentType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    <div>
                      <p className='font-medium text-sm'>{type.name}</p>
                      <div className='flex items-center space-x-2 text-xs text-muted-foreground mt-1'>
                        <Clock className='h-3 w-3' />
                        <span>{type.duration} min</span>
                        <span>•</span>
                        <span>R$ {type.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {form.formState.errors.appointmentType && (
                <p className='text-sm text-destructive mt-1'>
                  {form.formState.errors.appointmentType.message}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Calendar and Time Selection */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Calendar */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold'>Selecione uma Data</h3>
                <div className='flex space-x-2'>
                  <HealthcareButton
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => navigateMonth('prev')}
                    healthcareContext='appointment-scheduling'
                    accessibilityAction='previous'
                  >
                    Anterior
                  </HealthcareButton>
                  <HealthcareButton
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => navigateMonth('next')}
                    healthcareContext='appointment-scheduling'
                    accessibilityAction='next'
                  >
                    Próximo
                  </HealthcareButton>
                </div>
              </div>

              <div className='bg-white border rounded-lg p-4'>
                {/* Month and Year Header */}
                <div className='text-center mb-4'>
                  <h4 className='text-lg font-semibold'>
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </h4>
                </div>

                {/* Calendar Grid */}
                <div className='grid grid-cols-7 gap-1'>
                  {/* Day Headers */}
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div
                      key={day}
                      className='text-center text-xs font-medium text-muted-foreground py-2'
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {generateCalendarDays().map((day, index) => (<button
                      key={index}
                      type='button'
                      onClick={() => handleDateSelect(day.date)}
                      disabled={!day.isAvailable}
                      className={cn(
                        'h-10 w-10 rounded-lg text-sm font-medium transition-colors',
                        !day.isCurrentMonth && 'text-muted-foreground',
                        day.isToday && 'bg-blue-100 text-blue-900',
                        day.isSelected && 'bg-primary text-primary-foreground',
                        !day.isAvailable && 'opacity-50 cursor-not-allowed',
                        day.isAvailable && !day.isSelected && 'hover:bg-gray-100',
                      )}
                      aria-label={day.isAvailable
                        ? `${format(day.date, 'dd \'de\' MMMM', { locale: ptBR })} - ${
                          day.isToday ? 'Hoje, ' : ''
                        }Clique para selecionar`
                        : `Data não disponível - ${
                          format(day.date, 'dd \'de\' MMMM', { locale: ptBR })
                        }`}
                      aria-disabled={!day.isAvailable}
                    >
                      {format(day.date, 'd')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className='text-lg font-semibold mb-4'>Selecione um Horário</h3>
                <div className='bg-white border rounded-lg p-4'>
                  {availableSlots.length > 0
                    ? (
                      <div className='grid grid-cols-3 md:grid-cols-6 gap-2'>
                        {availableSlots.map(time => (
                          <button
                            key={time}
                            type='button'
                            onClick={() => handleTimeSelect(time)}
                            className={cn(
                              'p-2 border rounded-lg text-sm font-medium transition-colors',
                              selectedTime === time
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50',
                              touchTargetSize === 'large' && 'h-12',
                            )}
                          >
                            {time.replace(':', 'h')}
                          </button>
                        ))}
                      </div>
                    )
                    : (
                      <div className='text-center py-8'>
                        <AlertTriangle className='h-8 w-8 text-yellow-500 mx-auto mb-2' />
                        <p className='text-sm text-muted-foreground'>
                          Nenhum horário disponível para esta data
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Additional Options */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Opções Adicionais</h3>
              <div className='bg-white border rounded-lg p-4 space-y-4'>
                <div>
                  <label htmlFor='notes' className='block text-sm font-medium mb-2'>
                    Observações
                  </label>
                  <HealthcareInput
                    id='notes'
                    {...form.register('notes')}
                    type='textarea'
                    placeholder='Alguma informação adicional para a consulta...'
                    healthcareContext='appointment-scheduling'
                    accessibilityAction='input'
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='sendReminder'
                    {...form.register('sendReminder')}
                    className='rounded border-gray-300'
                  />
                  <label htmlFor='sendReminder' className='text-sm font-medium cursor-pointer'>
                    Enviar lembrete por SMS e E-mail
                  </label>
                </div>

                {form.watch('sendReminder') && (
                  <div>
                    <label htmlFor='reminderType' className='block text-sm font-medium mb-2'>
                      Tipo de Lembrete
                    </label>
                    <HealthcareInput
                      id='reminderType'
                      {...form.register('reminderType')}
                      type='select'
                      options={[
                        { value: 'sms', label: 'SMS' },
                        { value: 'email', label: 'E-mail' },
                        { value: 'both', label: 'SMS e E-mail' },
                      ]}
                      healthcareContext='appointment-scheduling'
                      accessibilityAction='select'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-between'>
          {onCancel && (
            <HealthcareButton
              type='button'
              variant='outline'
              onClick={onCancel}
              healthcareContext='appointment-scheduling'
              accessibilityAction='cancel'
              className={cn(
                touchTargetSize === 'large' && 'h-12 px-6',
              )}
            >
              Cancelar
            </HealthcareButton>
          )}

          <div className='flex space-x-3 ml-auto'>
            <HealthcareButton
              type='submit'
              disabled={!selectedDate || !selectedTime || !selectedProvider
                || !selectedAppointmentType || isSubmitting}
              healthcareContext='appointment-scheduling'
              accessibilityAction='submit'
              className={cn(
                touchTargetSize === 'large' && 'h-12 px-6',
              )}
            >
              {isSubmitting
                ? (
                  <HealthcareLoading
                    variant='spinner'
                    size='sm'
                    text='Agendando...'
                    healthcareContext='appointment-scheduling'
                  />
                )
                : (
                  'Agendar Consulta'
                )}
            </HealthcareButton>
          </div>
        </div>
      </form>
    </div>
  );
};

AppointmentSchedulingSystem.displayName = 'AppointmentSchedulingSystem';

export default AppointmentSchedulingSystem;
