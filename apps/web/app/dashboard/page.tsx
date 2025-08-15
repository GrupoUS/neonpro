'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Heart,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// NeonGradientCard Component
const NeonGradientCard = ({
  children,
  className = '',
  gradient = 'from-blue-600/20 via-purple-600/20 to-pink-600/20',
  glowColor = 'blue',
}) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${gradient}backdrop-blur-xl group shadow-2xl before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 ${className}
      `}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
    >
      <div
        className={`-inset-px absolute rounded-xl bg-gradient-to-r from-${glowColor}-500/50 to-purple-500/50 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100`}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

// CosmicGlowButton Component
const CosmicGlowButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25',
    secondary:
      'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg shadow-gray-500/25',
    success:
      'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-500/25',
    warning:
      'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25',
    danger:
      'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg shadow-red-500/25',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      className={`relative overflow-hidden rounded-lg font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100 disabled:cursor-not-allowed disabled:opacity-50`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </span>
      <div className="absolute inset-0 translate-x-[-100%] rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-700 group-hover:translate-x-[100%]" />
    </motion.button>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', active: true },
    { icon: Users, label: 'Pacientes' },
    { icon: Calendar, label: 'Agendamentos' },
    { icon: Sparkles, label: 'Procedimentos' },
    { icon: FileText, label: 'Relatórios' },
    { icon: DollarSign, label: 'Financeiro' },
    { icon: Settings, label: 'Configurações' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            animate={{ x: 0 }}
            className="fixed top-0 left-0 z-50 h-full w-70 border-white/10 border-r bg-gray-900/95 backdrop-blur-xl lg:relative lg:translate-x-0"
            exit={{ x: -280 }}
            initial={{ x: -280 }}
          >
            <div className="flex items-center justify-between border-white/10 border-b p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-bold text-transparent text-xl">
                  NEONPROV1
                </span>
              </div>
              <button
                className="text-gray-400 hover:text-white lg:hidden"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2 p-4">
              {menuItems.map((item, index) => (
                <motion.button
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                    item.active
                      ? 'border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  key={item.label}
                  transition={{ delay: index * 0.1 }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            <div className="absolute right-4 bottom-6 left-4">
              <div className="rounded-lg border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                    <span className="font-bold text-sm text-white">DR</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">
                      Dr. Estética
                    </p>
                    <p className="text-gray-400 text-xs">Administrador</p>
                  </div>
                </div>
                <CosmicGlowButton
                  className="w-full"
                  icon={LogOut}
                  size="sm"
                  variant="danger"
                >
                  Sair
                </CosmicGlowButton>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: 'Pacientes Ativos',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      gradient: 'from-blue-600/20 via-blue-500/20 to-cyan-600/20',
      glowColor: 'blue',
    },
    {
      title: 'Procedimentos Hoje',
      value: '47',
      change: '+8.2%',
      changeType: 'positive',
      icon: Sparkles,
      gradient: 'from-purple-600/20 via-pink-500/20 to-purple-600/20',
      glowColor: 'purple',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 187.5K',
      change: '+15.3%',
      changeType: 'positive',
      icon: DollarSign,
      gradient: 'from-emerald-600/20 via-green-500/20 to-emerald-600/20',
      glowColor: 'emerald',
    },
    {
      title: 'Satisfação Cliente',
      value: '98.7%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Heart,
      gradient: 'from-pink-600/20 via-rose-500/20 to-pink-600/20',
      glowColor: 'pink',
    },
  ];

  const recentPatients = [
    {
      name: 'Ana Silva',
      procedure: 'Harmonização Facial',
      time: '14:30',
      status: 'completed',
      satisfaction: 5,
    },
    {
      name: 'Marina Costa',
      procedure: 'Botox Preventivo',
      time: '15:15',
      status: 'in-progress',
      satisfaction: null,
    },
    {
      name: 'Julia Santos',
      procedure: 'Preenchimento Labial',
      time: '16:00',
      status: 'scheduled',
      satisfaction: null,
    },
    {
      name: 'Carla Oliveira',
      procedure: 'Limpeza de Pele',
      time: '16:45',
      status: 'scheduled',
      satisfaction: null,
    },
  ];

  const quickActions = [
    { icon: Calendar, label: 'Agendar Procedimento', variant: 'primary' },
    { icon: Plus, label: 'Novo Paciente', variant: 'success' },
    { icon: FileText, label: 'Relatório Financeiro', variant: 'warning' },
    { icon: Star, label: 'Avaliar Resultado', variant: 'secondary' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-purple-950/20">
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="-top-1/2 -left-1/2 absolute h-full w-full animate-background-position-spin bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="-bottom-1/2 -right-1/2 absolute h-full w-full animate-background-position-spin bg-gradient-to-tl from-emerald-600/5 via-cyan-600/5 to-blue-600/5" />

        {/* Floating particles */}
        {[...new Array(20)].map((_, i) => (
          <motion.div
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            className="absolute h-1 w-1 rounded-full bg-blue-400/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            key={i}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="border-white/10 border-b bg-gray-900/50 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="font-bold text-2xl text-white">Dashboard</h1>
                  <p className="text-gray-400 text-sm">
                    {time.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                  <input
                    className="rounded-lg border border-white/10 bg-gray-800/50 py-2 pr-4 pl-10 text-white placeholder-gray-400 transition-all focus:border-blue-500/50 focus:bg-gray-800/70 focus:outline-none"
                    placeholder="Buscar pacientes..."
                    type="text"
                  />
                </div>

                <motion.button
                  className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5" />
                  <span className="-top-1 -right-1 absolute h-2 w-2 animate-glow-scale rounded-full bg-red-500" />
                </motion.button>

                <div className="text-right">
                  <p className="font-medium text-sm text-white">
                    {time.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-gray-400 text-xs">Sistema Online</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    key={stat.title}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NeonGradientCard
                      className="p-6"
                      glowColor={stat.glowColor}
                      gradient={stat.gradient}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div
                          className={`rounded-lg bg-gradient-to-br p-3 from-${stat.glowColor}-600/20 to-${stat.glowColor}-700/20`}
                        >
                          <stat.icon
                            className={`h-6 w-6 text-${stat.glowColor}-400`}
                          />
                        </div>
                        <span
                          className={`font-medium text-sm ${
                            stat.changeType === 'positive'
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <h3 className="mb-1 font-bold text-2xl text-white">
                          {stat.value}
                        </h3>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                      </div>
                    </NeonGradientCard>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Recent Patients */}
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-2"
                  initial={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.4 }}
                >
                  <NeonGradientCard className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="font-bold text-white text-xl">
                        Pacientes Recentes
                      </h2>
                      <CosmicGlowButton size="sm" variant="secondary">
                        Ver Todos
                      </CosmicGlowButton>
                    </div>

                    <div className="space-y-4">
                      {recentPatients.map((patient, index) => (
                        <motion.div
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                          initial={{ opacity: 0, x: -10 }}
                          key={patient.name}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500">
                              <span className="font-bold text-sm text-white">
                                {patient.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {patient.name}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {patient.procedure}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="mb-1 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300 text-sm">
                                {patient.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-1 font-medium text-xs ${
                                  patient.status === 'completed'
                                    ? 'bg-emerald-600/20 text-emerald-400'
                                    : patient.status === 'in-progress'
                                      ? 'bg-blue-600/20 text-blue-400'
                                      : 'bg-gray-600/20 text-gray-400'
                                }`}
                              >
                                {patient.status === 'completed'
                                  ? 'Concluído'
                                  : patient.status === 'in-progress'
                                    ? 'Em Andamento'
                                    : 'Agendado'}
                              </span>
                              {patient.satisfaction && (
                                <div className="flex">
                                  {[...new Array(patient.satisfaction)].map(
                                    (_, i) => (
                                      <Star
                                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                        key={i}
                                      />
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </NeonGradientCard>
                </motion.div>

                {/* Quick Actions & System Status */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.6 }}
                  >
                    <NeonGradientCard className="p-6">
                      <h2 className="mb-6 font-bold text-white text-xl">
                        Ações Rápidas
                      </h2>
                      <div className="space-y-3">
                        {quickActions.map((action, index) => (
                          <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            initial={{ opacity: 0, y: 10 }}
                            key={action.label}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <CosmicGlowButton
                              className="w-full justify-start"
                              icon={action.icon}
                              variant={action.variant}
                            >
                              {action.label}
                            </CosmicGlowButton>
                          </motion.div>
                        ))}
                      </div>
                    </NeonGradientCard>
                  </motion.div>

                  {/* System Status */}
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.8 }}
                  >
                    <NeonGradientCard className="p-6">
                      <h2 className="mb-6 font-bold text-white text-xl">
                        Status do Sistema
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">
                            Servidor Principal
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 animate-glow-scale rounded-full bg-emerald-400" />
                            <span className="text-emerald-400 text-sm">
                              Online
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">
                            Backup Automático
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 animate-glow-scale rounded-full bg-emerald-400" />
                            <span className="text-emerald-400 text-sm">
                              Ativo
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">
                            Última Atualização
                          </span>
                          <span className="text-gray-400 text-sm">
                            Há 2 minutos
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Uptime</span>
                          <span className="text-gray-400 text-sm">99.9%</span>
                        </div>
                      </div>
                    </NeonGradientCard>
                  </motion.div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
