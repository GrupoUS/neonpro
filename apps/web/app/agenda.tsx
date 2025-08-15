'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone,
  MapPin,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { NeonGradientCard } from '@/components/ui/NeonGradientCard';
import { CosmicGlowButton } from '@/components/ui/CosmicGlowButton';
import { formatDate, formatTime } from '@/lib/utils';

// Dados mock para a agenda
const agendaData = {
  appointments: [
    {
      id: 1,
      patient: 'Maria Silva',
      phone: '(11) 99999-9999',
      date: new Date('2024-01-15T09:00:00'),
      type: 'Consulta Inicial',
      status: 'confirmado',
      room: 'Sala 01',
      doctor: 'Dr. João Oliveira'
    },
    {
      id: 2,
      patient: 'Carlos Santos',
      phone: '(11) 88888-8888',
      date: new Date('2024-01-15T10:30:00'),
      type: 'Retorno',
      status: 'pendente',
      room: 'Sala 02',
      doctor: 'Dra. Ana Costa'
    },
    {
      id: 3,
      patient: 'Fernanda Lima',
      phone: '(11) 77777-7777',
      date: new Date('2024-01-15T14:00:00'),
      type: 'Exame',
      status: 'confirmado',
      room: 'Sala 03',
      doctor: 'Dr. Pedro Silva'
    },
    {
      id: 4,
      patient: 'Roberto Costa',
      phone: '(11) 66666-6666',
      date: new Date('2024-01-15T15:30:00'),
      type: 'Consulta',
      status: 'cancelado',
      room: 'Sala 01',
      doctor: 'Dr. João Oliveira'
    }
  ],
  timeSlots: [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]
};

const statusConfig = {
  confirmado: {
    color: 'success',
    icon: CheckCircle,
    label: 'Confirmado',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success'
  },
  pendente: {
    color: 'warning',
    icon: AlertCircle,
    label: 'Pendente',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    textColor: 'text-warning'
  },
  cancelado: {
    color: 'danger',
    icon: XCircle,
    label: 'Cancelado',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    textColor: 'text-danger'
  }
};

const AppointmentCard = ({ appointment, index }) => {
  const statusInfo = statusConfig[appointment.status];
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { 
          duration: 0.2, 
          type: 'spring', 
          stiffness: 400, 
          damping: 17 
        }
      }}
    >
      <NeonGradientCard gradient={statusInfo.color} className="group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{appointment.patient}</h3>
              <p className="text-gray-400 text-sm flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {appointment.phone}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <div className="flex items-center space-x-1">
              <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
              <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-sm">{formatTime(appointment.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-sm">{appointment.room}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Tipo de Consulta</p>
            <p className="text-white font-medium">{appointment.type}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Médico Responsável</p>
            <p className="text-accent font-medium">{appointment.doctor}</p>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <CosmicGlowButton variant="primary" size="sm" className="flex-1">
            Editar
          </CosmicGlowButton>
          <CosmicGlowButton variant="success" size="sm" className="flex-1">
            Confirmar
          </CosmicGlowButton>
          <CosmicGlowButton variant="danger" size="sm" className="flex-1">
            Cancelar
          </CosmicGlowButton>
        </div>
      </NeonGradientCard>
    </motion.div>
  );
};

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = agendaData.appointments.filter(appointment => {
    const matchesSearch = appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || appointment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-background-position-spin">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Agenda NEONPROV1
          </h1>
          <p className="text-gray-400">
            Gerencie consultas e horários médicos
          </p>
        </motion.div>

        {/* Controles superiores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <NeonGradientCard gradient="primary">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <p className="text-gray-400 text-sm">Data Selecionada</p>
                <p className="text-white font-semibold">{formatDate(selectedDate)}</p>
              </div>
            </div>
          </NeonGradientCard>

          <NeonGradientCard gradient="secondary">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </NeonGradientCard>

          <NeonGradientCard gradient="accent">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendente">Pendentes</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </NeonGradientCard>

          <CosmicGlowButton variant="success" className="h-full flex items-center justify-center">
            <Plus className="h-5 w-5 mr-2" />
            Nova Consulta
          </CosmicGlowButton>
        </div>

        {/* Lista de consultas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredAppointments.map((appointment, index) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredAppointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <NeonGradientCard gradient="primary" className="max-w-md mx-auto">
              <Calendar className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-gray-400 mb-4">
                Não há consultas que correspondam aos filtros selecionados.
              </p>
              <CosmicGlowButton variant="primary">
                Agendar Nova Consulta
              </CosmicGlowButton>
            </NeonGradientCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}