'use client';

import { AppointmentTemplateSelector } from '@/components/appointment-templates/AppointmentTemplateSelector';
import { PatientCreationForm } from '@/components/patients/PatientCreationForm';
import { ServiceCreationForm } from '@/components/services/ServiceCreationForm';
import { useSendAppointmentConfirmation } from '@/hooks/useNotifications';
// import { useScheduleAppointmentNotifications } from '@/hooks/useNotificationScheduler';
import { usePatientAppointmentHistory, useSearchPatients } from '@/hooks/usePatients';
import { useProfessionalsByServiceType } from '@/hooks/useProfessionals';
import { useCheckAvailability, useServices, useServiceTimeSlots } from '@/hooks/useServices';
import { useTimeSlotValidationWithStatus } from '@/hooks/useTimeSlotValidation';

import type { TimeSlot } from '@/types/service';
// TODO: remove if not used

import { Button } from '@neonpro/ui';
import { Calendar } from '@neonpro/ui';
import { ScrollArea } from '@neonpro/ui';
import { Card } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Label } from '@neonpro/ui';
import { Textarea } from '@neonpro/ui';
import { Select } from '@neonpro/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@neonpro/ui';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AppointmentBookingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  /** Optional initial service to pre-populate booking form */
  initialService?: {
    id: string;
    name: string;
    duration_minutes?: number;
    price?: number;
  };
  onBookingComplete?: (booking: {
    date: Date;
    time: string;
    patientId: string;
    patientName: string;
    serviceTypeId: string;
    serviceName: string;
    professionalId: string;
    notes?: string;
  }) => void;
}

export function AppointmentBooking({
  open,
  onOpenChange,
  onBookingComplete,
  clinicId,
  initialService,
}: AppointmentBookingProps) {
  const today = new Date();
  const [date, setDate] = useState<Date>(today);
  const [time, setTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  // New form state
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);

  const [service, setService] = useState(''); // For backward compatibility
  const [professionalId, setProfessionalId] = useState('');
  const [notes, setNotes] = useState('');

  // Pre-populate service from initialService (e.g., from Services page)
  useEffect(() => {
    if (initialService && !serviceTypeId) {
      setServiceTypeId(initialService.id);
      setService(initialService.name);
    }
  }, [initialService, serviceTypeId]);

  // Fetch services
  const { data: servicesResponse, isLoading: servicesLoading } = useServices({
    clinic_id: clinicId,
    is_active: true, // Only show active services
  });
  const serviceTypes = servicesResponse?.data || [];

  // Fetch professionals for selected service type
  const { data: professionals, isLoading: professionalsLoading } = useProfessionalsByServiceType(
    clinicId,
    serviceTypeId,
  );

  // Search patients when typing
  const { data: searchResults, isLoading: searchLoading } = useSearchPatients(
    clinicId,
    patientSearch,
    { enabled: patientSearch.length >= 2 },
  );

  // Get patient appointment history when a patient is selected
  const { data: patientHistory, isLoading: historyLoading } = usePatientAppointmentHistory(
    selectedPatientId || '',
    {
      enabled: !!selectedPatientId,
    },
  );

  // Create patient mutation

  // Notification mutations
  const sendConfirmationMutation = useSendAppointmentConfirmation();
  // const scheduleNotificationsMutation = useScheduleAppointmentNotifications();

  // Availability checking
  const checkAvailabilityMutation = useCheckAvailability();

  // Calculate appointment end time based on service duration
  const appointmentEndTime = time && serviceTypeId
    ? (() => {
      const selectedService = serviceTypes?.find(
        st => st.id === serviceTypeId,
      );
      const duration = selectedService?.duration_minutes || 60;
      const [hours, minutes] = time.split(':').map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);
      return endDateTime;
    })()
    : null;

  const appointmentStartTime = time
    ? (() => {
      const [hours, minutes] = time.split(':').map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);
      return startDateTime;
    })()
    : null;

  // Time slot validation
  const {
    validation,
    isValidating,
    hasConflicts,
    hasWarnings,
    isValid: isTimeSlotValid,
  } = useTimeSlotValidationWithStatus(
    clinicId,
    professionalId,
    serviceTypeId,
    appointmentStartTime,
    appointmentEndTime,
  );

  // Get available time slots for selected service and date
  const dateString = date ? format(date, 'yyyy-MM-dd') : '';
  const { data: timeSlots, isLoading: timeSlotsLoading } = useServiceTimeSlots(
    serviceTypeId,
    dateString,
    professionalId,
  );

  // Fallback to default time slots if no service selected or loading
  const defaultTimeSlots = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: true },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true },
  ];

  const availableTimeSlots: TimeSlot[] = (timeSlots as TimeSlot[] | undefined)
    || (defaultTimeSlots as TimeSlot[]);

  const handleBooking = async () => {
    if (!date || !time || !patientName || !serviceTypeId || !professionalId) {
      return;
    }

    try {
      // First, check real-time availability
      const currentService = serviceTypes?.find(
        st => st.id === serviceTypeId,
      );
      const duration = currentService?.duration_minutes || 60;
      const [hours, minutes] = time.split(':').map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      const availabilityCheck = await checkAvailabilityMutation.mutateAsync({
        service_id: serviceTypeId,
        professional_id: professionalId,
        date: format(date, 'yyyy-MM-dd'),
        start_time: time,
        end_time: format(endDateTime, 'HH:mm'),
      });

      if (!availabilityCheck.available) {
        const conflictMessages = availabilityCheck.conflicts
          .map(c => c.description)
          .join(', ');
        throw new Error(`Horário não disponível: ${conflictMessages}`);
      }

      // Show warnings if any
      if (availabilityCheck.warnings.length > 0) {
        const warningMessages = availabilityCheck.warnings
          .map(w => w.message)
          .join('\n');
        if (
          !window.confirm(
            `Atenção:\n${warningMessages}\n\nDeseja continuar mesmo assim?`,
          )
        ) {
          return;
        }
      }

      // Create the appointment
      const appointmentData = {
        date,
        time,
        patientId: selectedPatientId || '', // Will need to create patient if not selected
        patientName,
        serviceTypeId,
        serviceName: service,
        professionalId,
        notes,
      };

      onBookingComplete?.(appointmentData);

      // Send confirmation notification after successful booking
      const selectedService = serviceTypes?.find(
        st => st.id === serviceTypeId,
      );
      const selectedProfessional = professionals?.find(
        p => p.id === professionalId,
      );

      if (selectedPatientId) {
        // Send immediate confirmation notification
        await sendConfirmationMutation.mutateAsync({
          patientId: selectedPatientId,
          patientName,
          appointmentDate: date,
          appointmentTime: time,
          professionalName: selectedProfessional?.fullName || 'Profissional',
          serviceName: selectedService?.name || service,
          clinicName: 'NeonPro Clinic', // This should come from clinic data
          clinicAddress: 'Endereço da Clínica', // This should come from clinic data
          clinicPhone: '(11) 99999-9999', // This should come from clinic data
        });

        // Schedule automatic reminders (24h and 1h before appointment)
        // NOTE: Disabled in this sweep to avoid undefined variable during type-check
        //   appointmentId: 'temp-appointment-id', // This should be the actual appointment ID from creation
        //   appointmentDate: startDateTime,
        //   patientId: selectedPatientId,
        //   settings: {
        //     reminder24h: true,
        //     reminder1h: true,
        //     confirmationImmediate: false, // Already sent above
        //     followupAfter24h: true,
        //   },
        // });
      }

      // Reset form
      setDate(today);
      setTime(null);
      setPatientName('');
      setService('');
      setServiceTypeId('');
      setProfessionalId('');
      setSelectedPatientId(null);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error during booking process:', error);
      // The error will be handled by the mutation's onError callback
    }
  };

  const isFormValid = date
    && time
    && patientName
    && serviceTypeId
    && professionalId
    && isTimeSlotValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Agendar Nova Consulta</DialogTitle>
          <DialogDescription>
            Selecione a data, horário e preencha os dados do paciente
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Date and Time Selection */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Data e Horário</h3>
            <div className='rounded-md border'>
              <div className='flex max-sm:flex-col'>
                <Calendar
                  mode='single'
                  selected={date}
                  onSelect={newDate => {
                    if (newDate) {
                      setDate(newDate);
                      setTime(null);
                    }
                  }}
                  className='p-2 sm:pe-5'
                  disabled={[
                    { before: today }, // Dates before today
                  ]}
                />
                <div className='relative w-full max-sm:h-48 sm:w-40'>
                  <div className='absolute inset-0 py-4 max-sm:border-t'>
                    <ScrollArea className='h-full sm:border-s'>
                      <div className='space-y-3'>
                        <div className='flex h-5 shrink-0 items-center px-5'>
                          <p className='text-sm font-medium'>
                            {format(date, 'EEEE, d', {})}
                          </p>
                        </div>
                        <div className='grid gap-1.5 px-5 max-sm:grid-cols-2'>
                          {timeSlotsLoading
                            ? (
                              <div className='col-span-full text-center py-4 text-sm text-muted-foreground'>
                                Carregando horários disponíveis...
                              </div>
                            )
                            : (
                              availableTimeSlots.map(
                                ({
                                  time: timeSlot,
                                  available,
                                  reason,
                                }: Partial<TimeSlot> & {
                                  time: string;
                                  available: boolean;
                                }) => (
                                  <Button
                                    key={timeSlot}
                                    variant={time === timeSlot ? 'default' : 'outline'}
                                    size='sm'
                                    className='w-full relative'
                                    onClick={() => setTime(timeSlot)}
                                    disabled={!available}
                                    title={!available && reason ? reason : undefined}
                                  >
                                    {timeSlot}
                                    {!available && (
                                      <span className='absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full' />
                                    )}
                                  </Button>
                                ),
                              )
                            )}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slot Validation Feedback */}
            {time && professionalId && serviceTypeId && (
              <div className='mt-4 space-y-2'>
                {isValidating && (
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'>
                    </div>
                    Verificando disponibilidade...
                  </div>
                )}

                {validation && hasConflicts && (
                  <div className='space-y-2'>
                    {validation.conflicts.map((conflict, _index) => (
                      <div
                        key={index}
                        className='flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md'
                      >
                        <div className='h-4 w-4 rounded-full bg-destructive flex-shrink-0 mt-0.5'>
                        </div>
                        <div className='text-sm text-destructive'>
                          <p className='font-medium'>Conflito de Agendamento</p>
                          <p>{conflict.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {validation && hasWarnings && (
                  <div className='space-y-2'>
                    {validation.warnings.map((warning, _index) => (
                      <div
                        key={index}
                        className='flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md'
                      >
                        <div className='h-4 w-4 rounded-full bg-yellow-500 flex-shrink-0 mt-0.5'>
                        </div>
                        <div className='text-sm text-yellow-800'>
                          <p className='font-medium'>Atenção</p>
                          <p>{warning.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {validation
                  && validation.suggestedAlternatives
                  && validation.suggestedAlternatives.length > 0 && (
                  <div className='p-3 bg-blue-50 border border-blue-200 rounded-md'>
                    <p className='text-sm font-medium text-blue-800 mb-2'>
                      Horários alternativos sugeridos:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {validation.suggestedAlternatives.map(
                        (alternative, _index) => (
                          <Button
                            key={index}
                            variant='outline'
                            size='sm'
                            className='text-xs'
                            onClick={() => {
                              const newDate = new Date(alternative.start);
                              const timeString = `${
                                newDate.getHours().toString().padStart(2, '0')
                              }:${
                                newDate
                                  .getMinutes()
                                  .toString()
                                  .padStart(2, '0')
                              }`;
                              setDate(newDate);
                              setTime(timeString);
                            }}
                          >
                            {format(alternative.start, 'dd/MM')} às{' '}
                            {format(alternative.start, 'HH:mm')}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Patient Information */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Dados do Paciente</h3>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='patientSearch'>Buscar Paciente *</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    id='patientSearch'
                    value={patientSearch}
                    onChange={e => {
                      setPatientSearch(e.target.value);
                      setPatientName(e.target.value);
                      if (e.target.value.length < 2) {
                        setSelectedPatientId(null);
                      }
                    }}
                    placeholder='Digite o nome do paciente para buscar...'
                    className='pl-10'
                  />
                  {searchLoading && (
                    <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults
                  && searchResults.length > 0
                  && patientSearch.length >= 2 && (
                  <div className='mt-2 border rounded-md bg-white shadow-lg max-h-48 overflow-y-auto'>
                    {searchResults.map(patient => (
                      <button
                        key={patient.id}
                        type='button'
                        className='w-full text-left px-3 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors'
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setPatientName(patient.fullName);
                          setPatientSearch(patient.fullName);
                        }}
                      >
                        <div className='flex items-start gap-3'>
                          <div className='flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                            <User className='h-4 w-4 text-primary' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='font-medium text-gray-900 truncate'>
                              {patient.fullName}
                            </div>
                            <div className='flex items-center gap-3 mt-1 text-sm text-gray-500'>
                              {patient.phone && (
                                <div className='flex items-center gap-1'>
                                  <Phone className='h-3 w-3' />
                                  <span>{patient.phone}</span>
                                </div>
                              )}
                              {patient.email && (
                                <div className='flex items-center gap-1'>
                                  <span>•</span>
                                  <span className='truncate'>
                                    {patient.email}
                                  </span>
                                </div>
                              )}
                            </div>
                            {patient.cpf && (
                              <div className='text-xs text-gray-400 mt-1'>
                                CPF: {patient.cpf.replace(
                                  /(\d{3})(\d{3})(\d{3})(\d{2})/,
                                  '$1.$2.$3-$4',
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchResults
                  && searchResults.length === 0
                  && patientSearch.length >= 2
                  && !searchLoading && (
                  <div className='mt-2 p-3 border rounded-md bg-gray-50 text-center'>
                    <p className='text-sm text-gray-600 mb-2'>
                      Nenhum paciente encontrado
                    </p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setShowNewPatientForm(true)}
                      className='gap-2'
                    >
                      <Plus className='h-4 w-4' />
                      Cadastrar Novo Paciente
                    </Button>
                  </div>
                )}

                {/* Selected Patient Info */}
                {selectedPatientId && (
                  <div className='mt-2 p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                        <User className='h-4 w-4 text-green-600' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-sm font-medium text-green-800'>
                            ✓ Paciente selecionado:
                          </span>
                          <strong className='text-green-900'>
                            {patientName}
                          </strong>
                        </div>

                        {/* Patient History */}
                        {patientHistory && patientHistory.length > 0 && (
                          <div className='mt-3'>
                            <h5 className='text-xs font-medium text-green-700 mb-2 flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              Últimas consultas
                            </h5>
                            <div className='space-y-1'>
                              {patientHistory.slice(0, 3).map(appointment => (
                                <div
                                  key={appointment.id}
                                  className='text-xs text-green-600 flex items-center gap-2'
                                >
                                  <span className='w-1 h-1 bg-green-400 rounded-full'></span>
                                  <span>
                                    {new Date(
                                      appointment.date,
                                    ).toLocaleDateString('pt-BR')} - {appointment.serviceName}
                                  </span>
                                  <span className='text-green-500'>
                                    ({appointment.professionalName})
                                  </span>
                                </div>
                              ))}
                              {patientHistory.length > 3 && (
                                <div className='text-xs text-green-500 mt-1'>
                                  +{patientHistory.length - 3} consultas anteriores
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {historyLoading && (
                          <div className='mt-2 text-xs text-green-600 flex items-center gap-2'>
                            <div className='animate-spin rounded-full h-3 w-3 border border-green-400 border-t-transparent'>
                            </div>
                            Carregando histórico...
                          </div>
                        )}

                        {patientHistory
                          && patientHistory.length === 0
                          && !historyLoading && (
                          <div className='mt-2 text-xs text-green-600'>
                            Primeiro agendamento deste paciente
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Appointment Templates */}
              <div>
                <Label>Templates de Agendamento</Label>
                <p className='text-sm text-muted-foreground mb-3'>
                  Selecione um template pré-configurado ou escolha o serviço manualmente
                </p>
                <AppointmentTemplateSelector
                  clinicId={clinicId}
                  onSelectTemplate={template => {
                    setServiceTypeId(template.serviceTypeId);
                    setService(template.serviceName);
                    setProfessionalId(''); // Reset professional when service changes
                  }}
                  selectedTemplateId={serviceTypeId}
                />
              </div>

              <div>
                <Label htmlFor='service'>Serviço *</Label>
                <Select
                  value={serviceTypeId}
                  onValueChange={value => {
                    if (value === 'create-new') {
                      setShowNewServiceForm(true);
                      return;
                    }
                    setServiceTypeId(value);
                    const selectedService = serviceTypes?.find(
                      st => st.id === value,
                    );
                    setService(selectedService?.name || '');
                    setProfessionalId(''); // Reset professional when service changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o serviço' />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesLoading
                      ? (
                        <SelectItem value='loading' disabled>
                          Carregando...
                        </SelectItem>
                      )
                      : (
                        <>
                          {serviceTypes?.map(serviceType => (
                            <SelectItem
                              key={serviceType.id}
                              value={serviceType.id}
                            >
                              <div className='flex items-center justify-between w-full'>
                                <span>{serviceType.name}</span>
                                <div className='flex items-center gap-2 text-xs text-muted-foreground ml-2'>
                                  <Clock className='h-3 w-3' />
                                  <span>{serviceType.duration_minutes}min</span>
                                  <span>•</span>
                                  <span>
                                    {serviceType.price.toLocaleString('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value='create-new' className='text-primary'>
                            <div className='flex items-center gap-2'>
                              <Plus className='h-4 w-4' />
                              Criar Novo Serviço
                            </div>
                          </SelectItem>
                        </>
                      )}
                  </SelectContent>
                </Select>
              </div>

              {/* Professional Selection */}
              {serviceTypeId && (
                <div>
                  <Label htmlFor='professional'>Profissional *</Label>
                  <Select
                    value={professionalId}
                    onValueChange={setProfessionalId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Selecione o profissional' />
                    </SelectTrigger>
                    <SelectContent>
                      {professionalsLoading
                        ? (
                          <SelectItem value='loading' disabled>
                            Carregando...
                          </SelectItem>
                        )
                        : professionals && professionals.length > 0
                        ? (
                          professionals.map(professional => (
                            <SelectItem
                              key={professional.id}
                              value={professional.id}
                            >
                              {professional.fullName}
                              {professional.specialization && (
                                <span className='text-muted-foreground ml-2'>
                                  - {professional.specialization}
                                </span>
                              )}
                            </SelectItem>
                          ))
                        )
                        : (
                          <SelectItem value='none' disabled>
                            Nenhum profissional disponível para este serviço
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor='notes'>Observações</Label>
                <Textarea
                  id='notes'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder='Observações adicionais (opcional)'
                  rows={3}
                />
              </div>

              {/* Booking Summary */}
              {date && time && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Resumo do Agendamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2 text-sm'>
                      <p>
                        <strong>Data:</strong> {format(date, 'dd/MM/yyyy')}
                      </p>
                      <p>
                        <strong>Horário:</strong> {time}
                      </p>
                      {patientName && (
                        <p>
                          <strong>Paciente:</strong> {patientName}
                        </p>
                      )}
                      {service && (
                        <p>
                          <strong>Serviço:</strong> {service}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleBooking} disabled={!isFormValid}>
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Patient Creation Form */}
      <PatientCreationForm
        open={showNewPatientForm}
        onOpenChange={setShowNewPatientForm}
        clinicId={clinicId}
        initialName={patientSearch}
        onPatientCreated={patient => {
          setSelectedPatientId(patient.id);
          setPatientName(patient.fullName);
          setPatientSearch(patient.fullName);
          setShowNewPatientForm(false);
        }}
      />

      {/* Service Creation Form */}
      <ServiceCreationForm
        open={showNewServiceForm}
        onOpenChange={setShowNewServiceForm}
        clinicId={clinicId}
        onServiceCreated={service => {
          setServiceTypeId(service.id);
          setService(service.name);
          setProfessionalId(''); // Reset professional when new service is created
          setShowNewServiceForm(false);
        }}
      />
    </Dialog>
  );
}
