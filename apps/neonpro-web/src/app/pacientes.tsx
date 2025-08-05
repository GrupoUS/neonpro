'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Activity
} from 'lucide-react';
import { NeonGradientCard } from '@/components/ui/NeonGradientCard';
import { CosmicGlowButton } from '@/components/ui/CosmicGlowButton';
import { formatDate } from '@/lib/utils';

// Dados mock para pacientes
const pacientesData = {
  patients: [
    {
      id: 1,
      name: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      birthDate: new Date('1985-03-15'),
      address: 'Rua das Flores, 123 - São Paulo, SP',
      lastVisit: new Date('2024-01-10'),
      status: 'ativo',
      plan: 'Premium',
      consultations: 15,
      gender: 'Feminino'
    },
    {
      id: 2,
      name: 'João Carlos Oliveira',
      email: 'joao.oliveira@email.com',
      phone: '(11) 88888-8888',
      cpf: '987.654.321-00',
      birthDate: new Date('1978-07-22'),
      address: 'Av. Paulista, 456 - São Paulo, SP',
      lastVisit: new Date('2024-01-08'),
      status: 'ativo',
      plan: 'Básico',
      consultations: 8,
      gender: 'Masculino'
    },
    {
      id: 3,
      name: 'Ana Paula Costa',
      email: 'ana.costa@email.com',
      phone: '(11) 77777-7777',
      cpf: '456.789.123-00',
      birthDate: new Date('1992-11-30'),
      address: 'Rua Augusta, 789 - São Paulo, SP',
      lastVisit: new Date('2023-12-20'),
      status: 'inativo',
      plan: 'Standard',
      consultations: 3,
      gender: 'Feminino'
    },
    {
      id: 4,
      name: 'Pedro Henrique Lima',
      email: 'pedro.lima@email.com',
      phone: '(11) 66666-6666',
      cpf: '789.123.456-00',
      birthDate: new Date('1988-09-12'),
      address: 'Rua Oscar Freire, 321 - São Paulo, SP',
      lastVisit: new Date('2024-01-12'),
      status: 'ativo',
      plan: 'Premium',
      consultations: 22,
      gender: 'Masculino'
    }
  ],
  stats: {
    total: 1247,
    active: 1156,
    inactive: 91,
    newThisMonth: 23
  }
};

const statusConfig = {
  ativo: {
    color: 'success',
    label: 'Ativo',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success'
  },
  inativo: {
    color: 'danger',
    label: 'Inativo',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    textColor: 'text-danger'
  }
};

const planConfig = {
  'Básico': { color: 'secondary', gradient: 'secondary' },
  'Standard': { color: 'accent', gradient: 'accent' },
  'Premium': { color: 'warning', gradient: 'warning' }
};

const PatientCard = ({ patient, index }) => {
  const statusInfo = statusConfig[patient.status];
  const planInfo = planConfig[patient.plan];
  const age = new Date().getFullYear() - patient.birthDate.getFullYear();

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
      <NeonGradientCard gradient={planInfo.gradient} className="group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{patient.name}</h3>
              <p className="text-gray-400 text-sm">{patient.gender} • {age} anos</p>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                <span className={statusInfo.textColor}>{statusInfo.label}</span>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full bg-${planInfo.color}/20 border border-${planInfo.color}/30`}>
            <span className={`text-sm font-medium text-${planInfo.color}`}>
              {patient.plan}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <Mail className="h-4 w-4 text-accent" />
              <span className="text-sm">{patient.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Phone className="h-4 w-4 text-accent" />
              <span className="text-sm">{patient.phone}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <Calendar className="h-4 w-4 text-accent" />
              <span className="text-sm">Última visita: {formatDate(patient.lastVisit)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Activity className="h-4 w-4 text-accent" />
              <span className="text-sm">{patient.consultations} consultas</span>
            </div>
          </div>
        </div>

        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-gray-400 text-sm">Endereço</span>
          </div>
          <p className="text-white text-sm">{patient.address}</p>
        </div>

        <div className="flex space-x-2">
          <CosmicGlowButton variant="primary" size="sm" className="flex-1 flex items-center justify-center">
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </CosmicGlowButton>
          <CosmicGlowButton variant="secondary" size="sm" className="flex-1 flex items-center justify-center">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </CosmicGlowButton>
          <CosmicGlowButton variant="success" size="sm" className="flex-1 flex items-center justify-center">
            <Calendar className="h-4 w-4 mr-1" />
            Agendar
          </CosmicGlowButton>
        </div>
      </NeonGradientCard>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, title, value, gradient, subtitle }) => (
  <NeonGradientCard gradient={gradient} className="group">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <motion.p 
          className="text-3xl font-bold text-white"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {value}
        </motion.p>
        {subtitle && (
          <p className="text-gray-400 text-xs">{subtitle}</p>
        )}
      </div>
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
        <Icon className="h-8 w-8 text-accent" />
      </div>
    </div>
  </NeonGradientCard>
);

export default function Pacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPlan, setFilterPlan] = useState('todos');

  const filteredPatients = pacientesData.patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'todos' || patient.status === filterStatus;
    const matchesPlan = filterPlan === 'todos' || patient.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
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
            Pacientes NEONPROV1
          </h1>
          <p className="text-gray-400">
            Gerencie informações dos pacientes
          </p>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total de Pacientes"
            value={pacientesData.stats.total}
            gradient="primary"
            subtitle="Registrados no sistema"
          />
          <StatCard
            icon={UserPlus}
            title="Pacientes Ativos"
            value={pacientesData.stats.active}
            gradient="success"
            subtitle="Com consultas recentes"
          />
          <StatCard
            icon={Activity}
            title="Pacientes Inativos"
            value={pacientesData.stats.inactive}
            gradient="danger"
            subtitle="Sem consultas há 3+ meses"
          />
          <StatCard
            icon={Calendar}
            title="Novos Este Mês"
            value={pacientesData.stats.newThisMonth}
            gradient="accent"
            subtitle="Cadastrados em janeiro"
          />
        </div>

        {/* Controles de filtro */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="md:col-span-2">
            <NeonGradientCard gradient="secondary">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </NeonGradientCard>
          </div>

          <NeonGradientCard gradient="accent">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </NeonGradientCard>

          <NeonGradientCard gradient="warning">
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
              >
                <option value="todos">Todos os Planos</option>
                <option value="Básico">Básico</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </NeonGradientCard>

          <CosmicGlowButton variant="success" className="h-full flex items-center justify-center">
            <Plus className="h-5 w-5 mr-2" />
            Novo Paciente
          </CosmicGlowButton>
        </div>

        {/* Lista de pacientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredPatients.map((patient, index) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredPatients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <NeonGradientCard gradient="primary" className="max-w-md mx-auto">
              <Users className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum paciente encontrado
              </h3>
              <p className="text-gray-400 mb-4">
                Não há pacientes que correspondam aos filtros selecionados.
              </p>
              <CosmicGlowButton variant="primary">
                Cadastrar Novo Paciente
              </CosmicGlowButton>
            </NeonGradientCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
