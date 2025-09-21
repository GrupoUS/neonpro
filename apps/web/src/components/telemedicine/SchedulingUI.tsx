import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  // Avatar components not available in current UI library
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { addDays, format, isPast, isSameDay, isToday, startOfWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Monitor,
  Phone,
  Plus,
  Search,
  User,
  Video,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// Types for telemedicine appointments
interface TelemedicineAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  professionalId: string;
  professionalName: string;
  appointmentType: 'video' | 'phone' | 'hybrid';
  date: Date;
  duration: number; // in minutes
  status:
    | 'scheduled'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'no-show';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  notes?: string;
  technology: {
    platform: 'webrtc' | 'zoom' | 'teams' | 'custom';
    roomId?: string;
    accessCode?: string;
  };
  symptoms?: string[];
  preparationNotes?: string;
}
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  lastVisit?: Date;
  urgencyLevel: 'urgent' | 'high' | 'normal' | 'low';
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  isAvailable: boolean;
  nextAvailable?: Date;
}

interface _TimeSlot {
  time: Date;
  isAvailable: boolean;
  duration: number;
  professionalId: string;
}

interface SchedulingUIProps {
  appointments?: TelemedicineAppointment[];
  onAppointmentCreate?: (
    appointment: Omit<TelemedicineAppointment, 'id'>,
  ) => void;
  onAppointmentUpdate?: (appointment: TelemedicineAppointment) => void;
  onAppointmentCancel?: (appointmentId: string) => void;
  className?: string;
}

// Mock data for development
const generateMockPatients = (): Patient[] => [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-1234',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b5b25d77?w=150',
    lastVisit: new Date(2024, 0, 15),
    urgencyLevel: 'high',
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    phone: '(11) 99999-5678',
    lastVisit: new Date(2024, 0, 10),
    urgencyLevel: 'normal',
  },
];
const generateMockProfessionals = (): Professional[] => [
  {
    id: 'prof1',
    name: 'Dr. Ana Costa',
    specialty: 'Cardiologia',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    isAvailable: true,
    nextAvailable: new Date(),
  },
  {
    id: 'prof2',
    name: 'Dr. Carlos Lima',
    specialty: 'Dermatologia',
    isAvailable: false,
    nextAvailable: addDays(new Date(), 1),
  },
];

const generateMockAppointments = (): TelemedicineAppointment[] => [
  {
    id: 'apt1',
    patientId: '1',
    patientName: 'Maria Silva',
    patientAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b5b25d77?w=150',
    professionalId: 'prof1',
    professionalName: 'Dr. Ana Costa',
    appointmentType: 'video',
    date: addDays(new Date(), 1),
    duration: 30,
    status: 'scheduled',
    priority: 'high',
    notes: 'Follow-up consultation for hypertension',
    technology: {
      platform: 'webrtc',
      roomId: 'room-123',
    },
    symptoms: ['chest pain', 'shortness of breath'],
    preparationNotes: 'Please have your blood pressure readings ready',
  },
]; // Helper functions
const getStatusBadge = (status: TelemedicineAppointment['status']) => {
  const variants = {
    scheduled: {
      variant: 'secondary' as const,
      icon: Calendar,
      text: 'Agendado',
    },
    confirmed: {
      variant: 'default' as const,
      icon: CheckCircle,
      text: 'Confirmado',
    },
    'in-progress': {
      variant: 'default' as const,
      icon: Video,
      text: 'Em Andamento',
    },
    completed: {
      variant: 'outline' as const,
      icon: CheckCircle,
      text: 'Concluído',
    },
    cancelled: {
      variant: 'destructive' as const,
      icon: AlertCircle,
      text: 'Cancelado',
    },
    'no-show': {
      variant: 'destructive' as const,
      icon: AlertCircle,
      text: 'Faltou',
    },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className='flex items-center gap-1'>
      <Icon className='h-3 w-3' />
      {config.text}
    </Badge>
  );
};

const getPriorityBadge = (priority: TelemedicineAppointment['priority']) => {
  const variants = {
    urgent: { variant: 'destructive' as const, text: 'Urgente' },
    high: { variant: 'default' as const, text: 'Alta' },
    normal: { variant: 'secondary' as const, text: 'Normal' },
    low: { variant: 'outline' as const, text: 'Baixa' },
  };

  const config = variants[priority];
  return (
    <Badge variant={config.variant} className='text-xs'>
      {config.text}
    </Badge>
  );
};

const getAppointmentTypeIcon = (
  type: TelemedicineAppointment['appointmentType'],
) => {
  const icons = {
    video: Video,
    phone: Phone,
    hybrid: Monitor,
  };
  return icons[type];
};
export function SchedulingUI({
  appointments = generateMockAppointments(),
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentCancel,
  className,
}: SchedulingUIProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  // Mock data
  const patients = generateMockPatients();
  const professionals = generateMockProfessionals();

  // Filter appointments based on search and filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
        || appointment.professionalName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  // Get appointments for selected date
  const dailyAppointments = useMemo(() => {
    return filteredAppointments.filter(appointment => isSameDay(appointment.date, selectedDate));
  }, [filteredAppointments, selectedDate]);

  // Generate week view data
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDateSelect = (_date: [a-zA-Z][a-zA-Z]*) => {
    setSelectedDate(date);
  };
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Agendamento de Telemedicina
          </h2>
          <p className='text-muted-foreground'>
            Gerencie consultas virtuais e presenciais
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className='h-4 w-4 mr-2' />
            Calendário
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('list')}
          >
            <Clock className='h-4 w-4 mr-2' />
            Lista
          </Button>

          <Dialog
            open={isNewAppointmentOpen}
            onOpenChange={setIsNewAppointmentOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Nova Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Agendar Nova Consulta de Telemedicina</DialogTitle>
              </DialogHeader>
              <NewAppointmentForm
                patients={patients}
                professionals={professionals}
                onSave={appointment => {
                  onAppointmentCreate?.(appointment);
                  setIsNewAppointmentOpen(false);
                }}
                onCancel={() => setIsNewAppointmentOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>{' '}
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por paciente ou profissional...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[180px]'>
                <Filter className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Filtrar por status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos os Status</SelectItem>
                <SelectItem value='scheduled'>Agendado</SelectItem>
                <SelectItem value='confirmed'>Confirmado</SelectItem>
                <SelectItem value='in-progress'>Em Andamento</SelectItem>
                <SelectItem value='completed'>Concluído</SelectItem>
                <SelectItem value='cancelled'>Cancelado</SelectItem>
                <SelectItem value='no-show'>Faltou</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>{' '}
      {/* Calendar or List View */}
      {viewMode === 'calendar'
        ? (
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            {/* Calendar Navigation */}
            <div className='lg:col-span-1'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span className='text-sm'>
                      {format(selectedDate, 'MMMM yyyy', { locale: pt })}
                    </span>
                    <div className='flex gap-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                      >
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-7 gap-1 text-center text-sm'>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(
                      day => (
                        <div
                          key={day}
                          className='py-2 font-medium text-muted-foreground'
                        >
                          {day}
                        </div>
                      ),
                    )}
                    {weekDays.map(date => {
                      const dayAppointments = filteredAppointments.filter(apt =>
                        isSameDay(apt.date, date)
                      );

                      return (
                        <Button
                          key={date.toISOString()}
                          variant={isSameDay(date, selectedDate) ? 'default' : 'ghost'}
                          size='sm'
                          className={cn(
                            'h-12 p-1 flex flex-col items-center justify-center relative',
                            isPast(date)
                              && !isToday(date)
                              && 'text-muted-foreground',
                            isToday(date) && 'ring-2 ring-primary',
                          )}
                          onClick={() => handleDateSelect(date)}
                        >
                          <span className='text-xs'>{format(date, 'd')}</span>
                          {dayAppointments.length > 0 && (
                            <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2'>
                              <div className='h-1 w-1 bg-primary rounded-full'></div>
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>{' '}
            {/* Daily Schedule */}
            <div className='lg:col-span-3'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='h-5 w-5' />
                    {format(selectedDate, 'EEEE, d \'de\' MMMM', { locale: pt })}
                    <Badge variant='secondary' className='ml-auto'>
                      {dailyAppointments.length} consulta(s)
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyAppointments.length === 0
                    ? (
                      <div className='text-center py-12'>
                        <Calendar className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                        <p className='text-muted-foreground'>
                          Nenhuma consulta agendada para este dia
                        </p>
                        <Button
                          variant='outline'
                          className='mt-4'
                          onClick={() => setIsNewAppointmentOpen(true)}
                        >
                          <Plus className='h-4 w-4 mr-2' />
                          Agendar Consulta
                        </Button>
                      </div>
                    )
                    : (
                      <div className='space-y-4'>
                        {dailyAppointments
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .map(appointment => (
                            <AppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              onUpdate={onAppointmentUpdate}
                              onCancel={onAppointmentCancel}
                            />
                          ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
        : (
          // List View
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                Todas as Consultas
                <Badge variant='secondary' className='ml-auto'>
                  {filteredAppointments.length} consulta(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {filteredAppointments.length === 0
                  ? (
                    <div className='text-center py-12'>
                      <Clock className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                      <p className='text-muted-foreground'>
                        Nenhuma consulta encontrada com os filtros aplicados
                      </p>
                    </div>
                  )
                  : (
                    filteredAppointments
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map(appointment => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onUpdate={onAppointmentUpdate}
                          onCancel={onAppointmentCancel}
                          showDate
                        />
                      ))
                  )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
} // AppointmentCard Component
interface AppointmentCardProps {
  appointment: TelemedicineAppointment;
  onUpdate?: (appointment: TelemedicineAppointment) => void;
  onCancel?: (appointmentId: string) => void;
  showDate?: boolean;
}

function AppointmentCard({
  appointment,
  onUpdate: _onUpdate,
  onCancel,
  showDate = false,
}: AppointmentCardProps) {
  const TypeIcon = getAppointmentTypeIcon(appointment.appointmentType);

  return (
    <div className='border rounded-lg p-4 hover:bg-accent/50 transition-colors'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-start gap-3 flex-1'>
          <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
            <User className='h-5 w-5 text-blue-600' />
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <h4 className='font-medium'>{appointment.patientName}</h4>
              {getPriorityBadge(appointment.priority)}
            </div>

            <div className='flex items-center gap-4 text-sm text-muted-foreground mb-2'>
              <div className='flex items-center gap-1'>
                <User className='h-3 w-3' />
                <span>{appointment.professionalName}</span>
              </div>

              <div className='flex items-center gap-1'>
                <TypeIcon className='h-3 w-3' />
                <span className='capitalize'>
                  {appointment.appointmentType}
                </span>
              </div>

              <div className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                <span>{appointment.duration} min</span>
              </div>

              {showDate && (
                <div className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  <span>{format(appointment.date, 'dd/MM/yyyy')}</span>
                </div>
              )}
            </div>

            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
              <Clock className='h-3 w-3' />
              <span>{format(appointment.date, 'HH:mm')}</span>
            </div>

            {appointment.notes && (
              <p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
                {appointment.notes}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {getStatusBadge(appointment.status)}

          <Button
            variant='outline'
            size='sm'
            onClick={() => console.log('Edit appointment:', appointment.id)}
          >
            Editar
          </Button>

          {appointment.status === 'scheduled' && (
            <Button
              variant='destructive'
              size='sm'
              onClick={() => onCancel?.(appointment.id)}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} // NewAppointmentForm Component
interface NewAppointmentFormProps {
  patients: Patient[];
  professionals: Professional[];
  onSave: (appointment: Omit<TelemedicineAppointment, 'id'>) => void;
  onCancel: () => void;
}

function NewAppointmentForm({
  patients,
  professionals,
  onSave,
  onCancel,
}: NewAppointmentFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<
    'video' | 'phone' | 'hybrid'
  >('video');
  const [date, setDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number>(30);
  const [priority, setPriority] = useState<
    'urgent' | 'high' | 'normal' | 'low'
  >('normal');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const patient = patients.find(p => p.id === selectedPatient);
    const professional = professionals.find(
      p => p.id === selectedProfessional,
    );

    if (!patient || !professional) return;

    const appointment: Omit<TelemedicineAppointment, 'id'> = {
      patientId: patient.id,
      patientName: patient.name,
      patientAvatar: patient.avatar,
      professionalId: professional.id,
      professionalName: professional.name,
      appointmentType,
      date,
      duration,
      status: 'scheduled',
      priority,
      notes: notes || undefined,
      technology: {
        platform: 'webrtc',
        roomId: `room-${Date.now()}`,
      },
    };

    onSave(appointment);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Patient Selection */}
      <div>
        <label className='text-sm font-medium mb-2 block'>Paciente</label>
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger>
            <SelectValue placeholder='Selecione um paciente' />
          </SelectTrigger>
          <SelectContent>
            {patients.map(patient => (
              <SelectItem key={patient.id} value={patient.id}>
                <div className='flex items-center gap-2'>
                  <div className='h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center'>
                    <User className='h-3 w-3 text-blue-600' />
                  </div>
                  <span>{patient.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Professional Selection */}
      <div>
        <label className='text-sm font-medium mb-2 block'>Profissional</label>
        <Select
          value={selectedProfessional}
          onValueChange={setSelectedProfessional}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecione um profissional' />
          </SelectTrigger>
          <SelectContent>
            {professionals.map(professional => (
              <SelectItem key={professional.id} value={professional.id}>
                <div className='flex items-center gap-2'>
                  <div className='h-6 w-6 rounded-full bg-green-100 flex items-center justify-center'>
                    <User className='h-3 w-3 text-green-600' />
                  </div>
                  <div>
                    <div className='font-medium'>{professional.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {professional.specialty}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>{' '}
      {/* Appointment Type */}
      <div>
        <label className='text-sm font-medium mb-2 block'>
          Tipo de Consulta
        </label>
        <Select
          value={appointmentType}
          onValueChange={(value: any) => setAppointmentType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Selecione o tipo' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='video'>
              <div className='flex items-center gap-2'>
                <Video className='h-4 w-4' />
                <span>Videochamada</span>
              </div>
            </SelectItem>
            <SelectItem value='phone'>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4' />
                <span>Telefone</span>
              </div>
            </SelectItem>
            <SelectItem value='hybrid'>
              <div className='flex items-center gap-2'>
                <Monitor className='h-4 w-4' />
                <span>Híbrido</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Date and Time */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium mb-2 block'>Data</label>
          <Input
            type='date'
            value={format(date, 'yyyy-MM-dd')}
            onChange={e => setDate(new Date(e.target.value))}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
        <div>
          <label className='text-sm font-medium mb-2 block'>Horário</label>
          <Input
            type='time'
            value={format(date, 'HH:mm')}
            onChange={e => {
              const [hours, minutes] = e.target.value.split(':');
              const newDate = new Date(date);
              newDate.setHours(parseInt(hours), parseInt(minutes));
              setDate(newDate);
            }}
          />
        </div>
      </div>
      {/* Duration and Priority */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium mb-2 block'>
            Duração (minutos)
          </label>
          <Select
            value={duration.toString()}
            onValueChange={value => setDuration(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='15'>15 minutos</SelectItem>
              <SelectItem value='30'>30 minutos</SelectItem>
              <SelectItem value='45'>45 minutos</SelectItem>
              <SelectItem value='60'>1 hora</SelectItem>
              <SelectItem value='90'>1 hora e 30 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className='text-sm font-medium mb-2 block'>Prioridade</label>
          <Select
            value={priority}
            onValueChange={(value: any) => setPriority(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='urgent'>Urgente</SelectItem>
              <SelectItem value='high'>Alta</SelectItem>
              <SelectItem value='normal'>Normal</SelectItem>
              <SelectItem value='low'>Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>{' '}
      {/* Notes */}
      <div>
        <label className='text-sm font-medium mb-2 block'>Observações</label>
        <textarea
          className='w-full p-3 border rounded-md resize-none'
          rows={3}
          placeholder='Adicione observações sobre a consulta...'
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      {/* Form Actions */}
      <div className='flex justify-end gap-3 pt-4 border-t'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type='submit'
          disabled={!selectedPatient || !selectedProfessional}
        >
          Agendar Consulta
        </Button>
      </div>
    </form>
  );
}
