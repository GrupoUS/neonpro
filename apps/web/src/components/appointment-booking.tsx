'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCreatePatient, useSearchPatients } from '@/hooks/usePatients';
import { useServiceTypes } from '@/hooks/useServiceTypes';
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
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    notes?: string;
  }) => void;
}

export function AppointmentBooking(
  { open, onOpenChange, onBookingComplete, clinicId }: AppointmentBookingProps,
) {
  const { user } = useAuth();
  const today = new Date();
  const [date, setDate] = useState<Date>(today);
  const [time, setTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch service types
  const { data: serviceTypes, isLoading: servicesLoading } = useServiceTypes(clinicId);

  // Search patients when typing
  const { data: searchResults, isLoading: searchLoading } = useSearchPatients(
    clinicId,
    patientSearch,
    { enabled: patientSearch.length >= 2 },
  );

  // Create patient mutation
  const createPatientMutation = useCreatePatient();

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

  const services = [
    'Limpeza de Pele',
    'Botox',
    'Preenchimento',
    'Harmonização Facial',
    'Peeling',
    'Microagulhamento',
    'Laser',
    'Consulta Inicial',
  ];

  const handleBooking = () => {
    if (!date || !time || !patientName || !service) {
      return;
    }

    onBookingComplete?.({
      date,
      time,
      patientName,
      service,
      notes,
    });

    // Reset form
    setDate(today);
    setTime(null);
    setPatientName('');
    setService('');
    setNotes('');
    onOpenChange(false);
  };

  const isFormValid = date && time && patientName && service;

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
                            {format(date, 'EEEE, d')}
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
          </div>

          {/* Patient Information */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Dados do Paciente</h3>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='patientName'>Nome do Paciente *</Label>
                <Input
                  id='patientName'
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder='Digite o nome completo'
                />
              </div>

              <div>
                <Label htmlFor='service'>Serviço *</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o serviço' />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(serviceOption => (
                      <SelectItem key={serviceOption} value={serviceOption}>
                        {serviceOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
