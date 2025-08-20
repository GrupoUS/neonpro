'use client';

import { Button, Card } from '@neonpro/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { formatDate, formatTime } from '@/lib/utils';

// Dados mock para a agenda
const agendaData = {
  appointments: [
    {
      id: '1',
      patient: 'Maria Silva',
      phone: '(11) 99999-9999',
      date: '2024-01-15T09:00:00',
      title: 'Consulta Inicial',
      type: 'Consulta Inicial',
      status: 'confirmado' as const,
      room: 'Sala 01',
      doctor: 'Dr. João Oliveira',
      professional: 'Dr. João Oliveira',
      duration: '60 min',
    },
    {
      id: '2',
      patient: 'Carlos Santos',
      phone: '(11) 88888-8888',
      date: '2024-01-15T10:30:00',
      title: 'Retorno',
      type: 'Retorno',
      status: 'pendente' as const,
      room: 'Sala 02',
      doctor: 'Dra. Ana Costa',
      professional: 'Dra. Ana Costa',
      duration: '45 min',
    },
    {
      id: '3',
      patient: 'Fernanda Lima',
      phone: '(11) 77777-7777',
      date: '2024-01-15T14:00:00',
      title: 'Exame',
      type: 'Exame',
      status: 'confirmado' as const,
      room: 'Sala 03',
      doctor: 'Dr. Pedro Silva',
      professional: 'Dr. Pedro Silva',
      duration: '30 min',
    },
    {
      id: '4',
      patient: 'Roberto Costa',
      phone: '(11) 66666-6666',
      date: '2024-01-15T15:30:00',
      title: 'Consulta',
      type: 'Consulta',
      status: 'cancelado' as const,
      room: 'Sala 01',
      doctor: 'Dr. João Oliveira',
      professional: 'Dr. João Oliveira',
      duration: '60 min',
    },
  ],
  timeSlots: [
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
  ],
};

const statusConfig = {
  confirmado: {
    color: 'success',
    icon: CheckCircle,
    label: 'Confirmado',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success',
  },
  pendente: {
    color: 'warning',
    icon: AlertCircle,
    label: 'Pendente',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    textColor: 'text-warning',
  },
  cancelado: {
    color: 'danger',
    icon: XCircle,
    label: 'Cancelado',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    textColor: 'text-danger',
  },
};

type AppointmentType = {
  id: string;
  date: string;
  title: string;
  patient: string;
  phone: string;
  status: keyof typeof statusConfig;
  room: string;
  duration: string;
  type: string;
  doctor: string;
  professional: string;
  notes?: string;
};

type AppointmentCardProps = {
  appointment: AppointmentType;
  index: number;
};

const AppointmentCard = ({ appointment, index }: AppointmentCardProps) => {
  const statusInfo = statusConfig[appointment.status];
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: {
          duration: 0.2,
          type: 'spring',
          stiffness: 400,
          damping: 17,
        },
      }}
    >
      <Card
        className={`group border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} p-6 shadow-lg transition-all duration-300 hover:shadow-xl`}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                {appointment.patient}
              </h3>
              <p className="flex items-center text-gray-400 text-sm">
                <Phone className="mr-1 h-4 w-4" />
                {appointment.phone}
              </p>
            </div>
          </div>
          <div
            className={`rounded-full border px-3 py-1 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
          >
            <div className="flex items-center space-x-1">
              <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
              <span className={`font-medium text-sm ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-sm">
              {formatTime(new Date(appointment.date))}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-sm">{appointment.room}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Tipo de Consulta</p>
            <p className="font-medium text-white">{appointment.type}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Médico Responsável</p>
            <p className="font-medium text-accent">{appointment.doctor}</p>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <Button className="flex-1" size="sm" variant="default">
            Editar
          </Button>
          <Button className="flex-1" size="sm" variant="default">
            Confirmar
          </Button>
          <Button className="flex-1" size="sm" variant="destructive">
            Cancelar
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default function Agenda() {
  const [selectedDate, _setSelectedDate] = useState(new Date());
  const [_viewMode, _setViewMode] = useState('list');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = agendaData.appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'todos' || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen animate-background-position-spin bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
        >
          <h1 className="mb-2 font-bold text-4xl text-white">
            Agenda NEONPROV1
          </h1>
          <p className="text-gray-400">Gerencie consultas e horários médicos</p>
        </motion.div>

        {/* Controles superiores */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <p className="text-gray-400 text-sm">Data Selecionada</p>
                <p className="font-semibold text-white">
                  {formatDate(selectedDate)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-secondary/20 to-secondary/10 p-4">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar paciente..."
                type="text"
                value={searchTerm}
              />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-accent/20 to-accent/10 p-4">
            <div className="relative">
              <Filter className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <select
                className="w-full appearance-none rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                onChange={(e) => setFilterStatus(e.target.value)}
                value={filterStatus}
              >
                <option value="todos">Todos os Status</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendente">Pendentes</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </Card>

          <Button
            className="flex h-full items-center justify-center"
            variant="default"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova Consulta
          </Button>
        </div>

        {/* Lista de consultas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatePresence>
            {filteredAppointments.map((appointment, index) => (
              <AppointmentCard
                appointment={appointment}
                index={index}
                key={appointment.id}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredAppointments.length === 0 && (
          <motion.div
            animate={{ opacity: 1 }}
            className="py-12 text-center"
            initial={{ opacity: 0 }}
          >
            <Card className="mx-auto max-w-md bg-gradient-to-r from-primary/20 to-primary/10 p-6">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-accent" />
              <h3 className="mb-2 font-semibold text-white text-xl">
                Nenhuma consulta encontrada
              </h3>
              <p className="mb-4 text-gray-400">
                Não há consultas que correspondam aos filtros selecionados.
              </p>
              <Button variant="default">Agendar Nova Consulta</Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
