/**
 * Intelligent Appointment Form Component
 * NeonPro Scheduling System
 * 
 * Smart appointment booking form with conflict detection,
 * auto-suggestions, and real-time validation
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  CalendarIcon, 
  Clock, 
  User, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarSchedule,
  Plus,
  Search,
  X
} from 'lucide-react';
import { format, addMinutes, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import ConflictDetection from './conflict-detection';

// Validation Schema
const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  professional_id: z.string().min(1, 'Selecione um profissional'),
  service_type_id: z.string().min(1, 'Selecione um tipo de serviço'),
  date: z.date({
    required_error: 'Selecione uma data',
  }),
  time: z.string().min(1, 'Selecione um horário'),
  duration_minutes: z.number().min(15, 'Duração mínima de 15 minutos'),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  priority: z.number().min(1).max(5).default(1),
  room_id: z.string().optional(),
  reminder_preferences: z.object({
    whatsapp: z.boolean().default(true),
    sms: z.boolean().default(false),
    email: z.boolean().default(true),
    hours_before: z.number().default(24),
  }).optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

// Types
interface Patient {
  id: string;
  full_name: string;
  phone_primary?: string;
  email?: string;
  medical_record_number: string;
}

interface Professional {
  id: string;
  full_name: string;
  specialization?: string;
  color: string;
  is_active: boolean;
  service_type_ids?: string[];
}

interface ServiceType {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  color: string;
  price?: number;
  requires_room: boolean;
}

interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  conflicts?: string[];
}

interface AppointmentFormProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedProfessional?: string;
  patientId?: string;
  onSuccess?: (appointmentId: string) => void;
  onCancel?: () => void;
  editingAppointment?: {
    id: string;
    patient_id: string;
    professional_id: string;
    service_type_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
    internal_notes?: string;
    priority: number;
    room_id?: string;
  };
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedDate,
  selectedTime,
  selectedProfessional,
  patientId,
  onSuccess,
  onCancel,
  editingAppointment
}) => {
  const [patientSearch, setPatientSearch] = useState('');
  const [showConflictDetection, setShowConflictDetection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: patientId || editingAppointment?.patient_id || '',
      professional_id: selectedProfessional || editingAppointment?.professional_id || '',
      service_type_id: editingAppointment?.service_type_id || '',
      date: selectedDate || (editingAppointment ? new Date(editingAppointment.start_time) : new Date()),
      time: selectedTime || (editingAppointment ? format(new Date(editingAppointment.start_time), 'HH:mm') : ''),
      duration_minutes: 30,
      notes: editingAppointment?.notes || '',
      internal_notes: editingAppointment?.internal_notes || '',
      priority: editingAppointment?.priority || 1,
      room_id: editingAppointment?.room_id || '',
      reminder_preferences: {
        whatsapp: true,
        sms: false,
        email: true,
        hours_before: 24,
      },
    },
  });

  const watchedValues = form.watch();
  const { date, time, professional_id, service_type_id, duration_minutes } = watchedValues;

  // Calculate appointment end time
  const appointmentStartTime = useMemo(() => {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    return startTime;
  }, [date, time]);

  const appointmentEndTime = useMemo(() => {
    if (!appointmentStartTime || !duration_minutes) return null;
    return addMinutes(appointmentStartTime, duration_minutes);
  }, [appointmentStartTime, duration_minutes]);

  // Fetch patients with search
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients', patientSearch],
    queryFn: async () => {
      if (patientSearch.length < 2) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone_primary, email, medical_record_number')
        .or(`full_name.ilike.%${patientSearch}%,phone_primary.ilike.%${patientSearch}%,medical_record_number.ilike.%${patientSearch}%`)
        .eq('is_active', true)
        .limit(10);
      
      if (error) throw error;
      return data as Patient[];
    },
    enabled: patientSearch.length >= 2,
  });

  // Fetch professionals
  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data as Professional[];
    },
  });

  // Fetch service types
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ['service_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as ServiceType[];
    },
  });

  // Fetch rooms (if needed)
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Room[];
    },
  });

  // Get available time slots
  const { data: availableSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['available_slots', professional_id, date, duration_minutes],
    queryFn: async () => {
      if (!professional_id || !date) return [];
      
      const response = await fetch('/api/appointments/available-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id,
          date: format(date, 'yyyy-MM-dd'),
          duration_minutes: duration_minutes || 30,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch available slots');
      return response.json();
    },
    enabled: !!professional_id && !!date,
  });

  // Filter service types by professional
  const availableServiceTypes = useMemo(() => {
    const selectedProfessional = professionals.find(p => p.id === professional_id);
    if (!selectedProfessional?.service_type_ids) return serviceTypes;
    
    return serviceTypes.filter(st => 
      selectedProfessional.service_type_ids?.includes(st.id)
    );
  }, [serviceTypes, professionals, professional_id]);

  // Update duration when service type changes
  useEffect(() => {
    const selectedServiceType = serviceTypes.find(st => st.id === service_type_id);
    if (selectedServiceType) {
      form.setValue('duration_minutes', selectedServiceType.duration_minutes);
    }
  }, [service_type_id, serviceTypes, form]);

  // Show conflict detection when key fields are filled
  useEffect(() => {
    const shouldShow = !!(appointmentStartTime && appointmentEndTime && professional_id && service_type_id);
    setShowConflictDetection(shouldShow);
  }, [appointmentStartTime, appointmentEndTime, professional_id, service_type_id]);

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const startDateTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = addMinutes(startDateTime, data.duration_minutes);

      const appointmentData = {
        patient_id: data.patient_id,
        professional_id: data.professional_id,
        service_type_id: data.service_type_id,
        start_time: startDateTime,
        end_time: endDateTime,
        notes: data.notes,
        internal_notes: data.internal_notes,
        priority: data.priority,
        room_id: data.room_id || null,
      };

      const response = await fetch('/api/appointments', {
        method: editingAppointment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...appointmentData,
          ...(editingAppointment && { id: editingAppointment.id }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_message || 'Failed to create appointment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onSuccess?.(data.appointment_id);
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      await createAppointmentMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots for selection
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = availableSlots.some((slot: TimeSlot) => 
          slot.time === timeString && slot.available
        );
        slots.push({ time: timeString, available: isAvailable });
      }
    }
    return slots;
  }, [availableSlots]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarSchedule className="w-5 h-5" />
          {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </CardTitle>
        <CardDescription>
          Preencha os dados para criar um novo agendamento com detecção automática de conflitos
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            
            {/* Patient Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Paciente
              </Label>
              
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar paciente por nome, telefone ou prontuário..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {patientsLoading && patientSearch.length >= 2 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando pacientes...
                  </div>
                )}

                {patients.length > 0 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {patients.map(patient => (
                      <div
                        key={patient.id}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0",
                          selectedPatient?.id === patient.id && "bg-blue-50 border-blue-200"
                        )}
                        onClick={() => {
                          setSelectedPatient(patient);
                          form.setValue('patient_id', patient.id);
                          setPatientSearch(patient.full_name);
                        }}
                      >
                        <div className="font-medium">{patient.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.medical_record_number} • {patient.phone_primary} • {patient.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="patient_id"
                  render={() => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Professional and Service Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="professional_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Profissional
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {professionals.map(professional => (
                          <SelectItem key={professional.id} value={professional.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: professional.color }}
                              />
                              <span>{professional.full_name}</span>
                              {professional.specialization && (
                                <span className="text-gray-500 text-sm">
                                  - {professional.specialization}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Tipo de Serviço
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableServiceTypes.map(serviceType => (
                          <SelectItem key={serviceType.id} value={serviceType.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{serviceType.name}</span>
                              <div className="flex items-center gap-2 ml-2">
                                <Badge variant="outline" className="text-xs">
                                  {serviceType.duration_minutes}min
                                </Badge>
                                {serviceType.price && (
                                  <Badge variant="outline" className="text-xs">
                                    R$ {serviceType.price.toFixed(2)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {service_type_id && availableServiceTypes.find(st => st.id === service_type_id)?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Data do Agendamento
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => isBefore(date, startOfDay(new Date()))}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horário
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-48">
                        {slotsLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Carregando horários...
                          </div>
                        ) : (
                          timeSlots.map(({ time, available }) => (
                            <SelectItem 
                              key={time} 
                              value={time}
                              disabled={!available}
                              className={available ? '' : 'opacity-50'}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{time}</span>
                                {!available && (
                                  <Badge variant="destructive" className="text-xs ml-2">
                                    Ocupado
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="15" 
                        max="480" 
                        step="15"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Baixa</SelectItem>
                        <SelectItem value="2">2 - Normal</SelectItem>
                        <SelectItem value="3">3 - Média</SelectItem>
                        <SelectItem value="4">4 - Alta</SelectItem>
                        <SelectItem value="5">5 - Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {rooms.length > 0 && (
                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Sala
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma sala" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhuma sala específica</SelectItem>
                          {rooms.map(room => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name} (Cap: {room.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações do Paciente</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações visíveis para o paciente..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Internas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações internas da equipe..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Estas observações são visíveis apenas para a equipe da clínica
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conflict Detection */}
            {showConflictDetection && appointmentStartTime && appointmentEndTime && (
              <div className="space-y-4">
                <Separator />
                <ConflictDetection
                  appointmentStart={appointmentStartTime}
                  appointmentEnd={appointmentEndTime}
                  professionalId={professional_id}
                  treatmentType={service_type_id}
                  roomId={watchedValues.room_id}
                  autoDetect={true}
                />
              </div>
            )}

          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || createAppointmentMutation.isPending}
            >
              {(isSubmitting || createAppointmentMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingAppointment ? 'Atualizar Agendamento' : 'Criar Agendamento'}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {/* Error Display */}
      {createAppointmentMutation.error && (
        <Alert variant="destructive" className="mx-6 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao criar agendamento</AlertTitle>
          <AlertDescription>
            {createAppointmentMutation.error.message}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default AppointmentForm;
