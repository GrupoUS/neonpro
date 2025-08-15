'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  Edit,
  Eye,
  FileText,
  Filter,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { CosmicGlowButton } from '@/components/ui/CosmicGlowButton';
import { NeonGradientCard } from '@/components/ui/NeonGradientCard';
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
      gender: 'Feminino',
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
      gender: 'Masculino',
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
      gender: 'Feminino',
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
      gender: 'Masculino',
    },
  ],
  stats: {
    total: 1247,
    active: 1156,
    inactive: 91,
    newThisMonth: 23,
  },
};

const statusConfig = {
  ativo: {
    color: 'success',
    label: 'Ativo',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success',
  },
  inativo: {
    color: 'danger',
    label: 'Inativo',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    textColor: 'text-danger',
  },
};

const planConfig = {
  Básico: { color: 'secondary', gradient: 'secondary' },
  Standard: { color: 'accent', gradient: 'accent' },
  Premium: { color: 'warning', gradient: 'warning' },
};

const PatientCard = ({ patient, index }) => {
  const statusInfo = statusConfig[patient.status];
  const planInfo = planConfig[patient.plan];
  const age = new Date().getFullYear() - patient.birthDate.getFullYear();

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
      <NeonGradientCard className="group" gradient={planInfo.gradient}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-xl">
                {patient.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {patient.gender} • {age} anos
              </p>
              <div
                className={`mt-1 inline-flex rounded-full px-2 py-1 font-medium text-xs ${statusInfo.bgColor} ${statusInfo.borderColor} border`}
              >
                <span className={statusInfo.textColor}>{statusInfo.label}</span>
              </div>
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 bg-${planInfo.color}/20 border border-${planInfo.color}/30`}
          >
            <span className={`font-medium text-sm text-${planInfo.color}`}>
              {patient.plan}
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <span className="text-sm">
                Última visita: {formatDate(patient.lastVisit)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Activity className="h-4 w-4 text-accent" />
              <span className="text-sm">{patient.consultations} consultas</span>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-gray-400 text-sm">Endereço</span>
          </div>
          <p className="text-sm text-white">{patient.address}</p>
        </div>

        <div className="flex space-x-2">
          <CosmicGlowButton
            className="flex flex-1 items-center justify-center"
            size="sm"
            variant="primary"
          >
            <Eye className="mr-1 h-4 w-4" />
            Visualizar
          </CosmicGlowButton>
          <CosmicGlowButton
            className="flex flex-1 items-center justify-center"
            size="sm"
            variant="secondary"
          >
            <Edit className="mr-1 h-4 w-4" />
            Editar
          </CosmicGlowButton>
          <CosmicGlowButton
            className="flex flex-1 items-center justify-center"
            size="sm"
            variant="success"
          >
            <Calendar className="mr-1 h-4 w-4" />
            Agendar
          </CosmicGlowButton>
        </div>
      </NeonGradientCard>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, title, value, gradient, subtitle }) => (
  <NeonGradientCard className="group" gradient={gradient}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="font-medium text-gray-400 text-sm">{title}</p>
        <motion.p
          animate={{ scale: 1 }}
          className="font-bold text-3xl text-white"
          initial={{ scale: 0.8 }}
          transition={{ delay: 0.2 }}
        >
          {value}
        </motion.p>
        {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
      </div>
      <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
        <Icon className="h-8 w-8 text-accent" />
      </div>
    </div>
  </NeonGradientCard>
);

export default function Pacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPlan, setFilterPlan] = useState('todos');

  const filteredPatients = pacientesData.patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    const matchesStatus =
      filterStatus === 'todos' || patient.status === filterStatus;
    const matchesPlan = filterPlan === 'todos' || patient.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
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
            Pacientes NEONPROV1
          </h1>
          <p className="text-gray-400">Gerencie informações dos pacientes</p>
        </motion.div>

        {/* Estatísticas */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            gradient="primary"
            icon={Users}
            subtitle="Registrados no sistema"
            title="Total de Pacientes"
            value={pacientesData.stats.total}
          />
          <StatCard
            gradient="success"
            icon={UserPlus}
            subtitle="Com consultas recentes"
            title="Pacientes Ativos"
            value={pacientesData.stats.active}
          />
          <StatCard
            gradient="danger"
            icon={Activity}
            subtitle="Sem consultas há 3+ meses"
            title="Pacientes Inativos"
            value={pacientesData.stats.inactive}
          />
          <StatCard
            gradient="accent"
            icon={Calendar}
            subtitle="Cadastrados em janeiro"
            title="Novos Este Mês"
            value={pacientesData.stats.newThisMonth}
          />
        </div>

        {/* Controles de filtro */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <NeonGradientCard gradient="secondary">
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                <input
                  className="w-full rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, email ou telefone..."
                  type="text"
                  value={searchTerm}
                />
              </div>
            </NeonGradientCard>
          </div>

          <NeonGradientCard gradient="accent">
            <div className="relative">
              <Filter className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <select
                className="w-full appearance-none rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                onChange={(e) => setFilterStatus(e.target.value)}
                value={filterStatus}
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </NeonGradientCard>

          <NeonGradientCard gradient="warning">
            <div className="relative">
              <FileText className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <select
                className="w-full appearance-none rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                onChange={(e) => setFilterPlan(e.target.value)}
                value={filterPlan}
              >
                <option value="todos">Todos os Planos</option>
                <option value="Básico">Básico</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </NeonGradientCard>

          <CosmicGlowButton
            className="flex h-full items-center justify-center"
            variant="success"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Paciente
          </CosmicGlowButton>
        </div>

        {/* Lista de pacientes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatePresence>
            {filteredPatients.map((patient, index) => (
              <PatientCard index={index} key={patient.id} patient={patient} />
            ))}
          </AnimatePresence>
        </div>

        {filteredPatients.length === 0 && (
          <motion.div
            animate={{ opacity: 1 }}
            className="py-12 text-center"
            initial={{ opacity: 0 }}
          >
            <NeonGradientCard className="mx-auto max-w-md" gradient="primary">
              <Users className="mx-auto mb-4 h-16 w-16 text-accent" />
              <h3 className="mb-2 font-semibold text-white text-xl">
                Nenhum paciente encontrado
              </h3>
              <p className="mb-4 text-gray-400">
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
