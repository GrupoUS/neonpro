'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSendAppointmentConfirmation } from '@/hooks/useNotifications';
import { /* useCreatePatient, */ useSearchPatients } from '@/hooks/usePatients'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useProfessionalsByServiceType } from '@/hooks/useProfessionals';
import { useServiceTypes } from '@/hooks/useServiceTypes';
import { useTimeSlotValidationWithStatus } from '@/hooks/useTimeSlotValidation';
import { Button } from '@neonpro/ui';
import { Calendar } from '@neonpro/ui';
import { ScrollArea } from '@neonpro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Label } from '@neonpro/ui';
import { Textarea } from '@neonpro/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neonpro/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@neonpro/ui';
import { format } from 'date-fns';
import { Plus, Search, User } from 'lucide-react';
import { useState } from 'react';

interface AppointmentBookingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
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

export function AppointmentBooking(
  { open, onOpenChange, onBookingComplete, clinicId }: AppointmentBookingProps,
) {
  const {/* user */} = useAuth();
  const today = new Date();
  const [date, setDate] = useState<Date>(today);
  const [time, setTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [service, setService] = useState(''); // For backward compatibility
  const [professionalId, setProfessionalId] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch service types
  const { data: serviceTypes, isLoading: servicesLoading } = useServiceTypes(clinicId);

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

  // Create patient mutation

  // Notification mutations
  const sendConfirmationMutation = useSendAppointmentConfirmation();

  // Calculate appointment end time based on service duration
  const appointmentEndTime = time && serviceTypeId
    ? (() => {
      const selectedService = serviceTypes?.find(st => st.id === serviceTypeId);
      const duration = selectedService?.durationMinutes || 60;
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

  // Mock time slots data
  const timeSlots = [
    { time: '09:00', available: true },
    { time: '09:30', available: false },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: false },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: false },
    { time: '15:00', available: false },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true },
  ];

  const handleBooking = async () => {
    if (!date || !time || !patientName || !serviceTypeId || !professionalId) {
      return;
    }

    try {
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
      const selectedService = serviceTypes?.find(st => st.id === serviceTypeId);
      const selectedProfessional = professionals?.find(p => p.id === professionalId);

      if (selectedPatientId) {
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

  const isFormValid = date && time && patientName && serviceTypeId && professionalId
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
                          {timeSlots.map(({ time: timeSlot, available }) => (
                            <Button
                              key={timeSlot}
                              variant={time === timeSlot ? 'default' : 'outline'}
                              size='sm'
                              className='w-full'
                              onClick={() => setTime(timeSlot)}
                              disabled={!available}
                            >
                              {timeSlot}
                            </Button>
                          ))}
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
                    {validation.conflicts.map((conflict, index) => (
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
                    {validation.warnings.map((warning, index) => (
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

                {validation && validation.suggestedAlternatives
                  && validation.suggestedAlternatives.length > 0 && (
                  <div className='p-3 bg-blue-50 border border-blue-200 rounded-md'>
                    <p className='text-sm font-medium text-blue-800 mb-2'>
                      Horários alternativos sugeridos:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {validation.suggestedAlternatives.map((alternative, index) => (
                        <Button
                          key={index}
                          variant='outline'
                          size='sm'
                          className='text-xs'
                          onClick={() => {
                            const newDate = new Date(alternative.start);
                            const timeString = `${newDate.getHours().toString().padStart(2, '0')}:${
                              newDate.getMinutes().toString().padStart(2, '0')
                            }`;
                            setDate(newDate);
                            setTime(timeString);
                          }}
                        >
                          {format(alternative.start, 'dd/MM')} às{' '}
                          {format(alternative.start, 'HH:mm')}
                        </Button>
                      ))}
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
                {searchResults && searchResults.length > 0 && patientSearch.length >= 2 && (
                  <div className='mt-2 border rounded-md bg-white shadow-lg max-h-40 overflow-y-auto'>
                    {searchResults.map(patient => (
                      <button
                        key={patient.id}
                        type='button'
                        className='w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-2'
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setPatientName(patient.fullName);
                          setPatientSearch(patient.fullName);
                        }}
                      >
                        <User className='h-4 w-4 text-gray-400' />
                        <div>
                          <div className='font-medium'>{patient.fullName}</div>
                          <div className='text-sm text-gray-500'>{patient.phone}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchResults && searchResults.length === 0 && patientSearch.length >= 2
                  && !searchLoading && (
                  <div className='mt-2 p-3 border rounded-md bg-gray-50 text-center'>
                    <p className='text-sm text-gray-600 mb-2'>Nenhum paciente encontrado</p>
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
                  <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded-md'>
                    <p className='text-sm text-green-700'>
                      ✓ Paciente selecionado: <strong>{patientName}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor='service'>Serviço *</Label>
                <Select
                  value={serviceTypeId}
                  onValueChange={value => {
                    setServiceTypeId(value);
                    const selectedService = serviceTypes?.find(st => st.id === value);
                    setService(selectedService?.name || '');
                    setProfessionalId(''); // Reset professional when service changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o serviço' />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesLoading
                      ? <SelectItem value='loading' disabled>Carregando...</SelectItem>
                      : (
                        serviceTypes?.map(serviceType => (
                          <SelectItem key={serviceType.id} value={serviceType.id}>
                            {serviceType.name}
                          </SelectItem>
                        ))
                      )}
                  </SelectContent>
                </Select>
              </div>

              {/* Professional Selection */}
              {serviceTypeId && (
                <div>
                  <Label htmlFor='professional'>Profissional *</Label>
                  <Select value={professionalId} onValueChange={setProfessionalId}>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecione o profissional' />
                    </SelectTrigger>
                    <SelectContent>
                      {professionalsLoading
                        ? <SelectItem value='loading' disabled>Carregando...</SelectItem>
                        : professionals && professionals.length > 0
                        ? (
                          professionals.map(professional => (
                            <SelectItem key={professional.id} value={professional.id}>
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
                    <CardTitle className='text-base'>Resumo do Agendamento</CardTitle>
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
    </Dialog>
  );
}
