"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Activity,
  Bell,
  Search,
  Plus,
  FileText,
  Star,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Heart,
  Smile,
  Zap
} from 'lucide-react'

// NeonGradientCard Component
const NeonGradientCard = ({ 
  children, 
  className = "", 
  gradient = "from-blue-600/20 via-purple-600/20 to-pink-600/20",
  glowColor = "blue"
}) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl border border-white/10 
        bg-gradient-to-br ${gradient}
        backdrop-blur-xl shadow-2xl
        before:absolute before:inset-0 before:rounded-xl
        before:bg-gradient-to-br before:from-white/5 before:to-transparent
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        group ${className}
      `}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`absolute -inset-px rounded-xl bg-gradient-to-r from-${glowColor}-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`} />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  )
}

// CosmicGlowButton Component
const CosmicGlowButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md",
  className = "",
  icon: Icon,
  ...props 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg shadow-gray-500/25",
    success: "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-500/25",
    warning: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25",
    danger: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg shadow-red-500/25"
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        ${variants[variant]} ${sizes[size]} ${className}
        before:absolute before:inset-0 before:rounded-lg
        before:bg-gradient-to-r before:from-white/20 before:to-transparent
        before:opacity-0 hover:before:opacity-100 before:transition-opacity
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </span>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
    </motion.button>
  )
}

// Sidebar Component
const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', active: true },
    { icon: Users, label: 'Pacientes' },
    { icon: Calendar, label: 'Agendamentos' },
    { icon: Sparkles, label: 'Procedimentos' },
    { icon: FileText, label: 'Relatórios' },
    { icon: DollarSign, label: 'Financeiro' },
    { icon: Settings, label: 'Configurações' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed left-0 top-0 h-full w-70 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-50 lg:relative lg:translate-x-0"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NEONPROV1
                </span>
              </div>
              <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${item.active 
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            <div className="absolute bottom-6 left-4 right-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">DR</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Dr. Estética</p>
                    <p className="text-xs text-gray-400">Administrador</p>
                  </div>
                </div>
                <CosmicGlowButton variant="danger" size="sm" icon={LogOut} className="w-full">
                  Sair
                </CosmicGlowButton>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// Main Dashboard Component
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const stats = [
    {
      title: 'Pacientes Ativos',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      gradient: 'from-blue-600/20 via-blue-500/20 to-cyan-600/20',
      glowColor: 'blue'
    },
    {
      title: 'Procedimentos Hoje',
      value: '47',
      change: '+8.2%',
      changeType: 'positive',
      icon: Sparkles,
      gradient: 'from-purple-600/20 via-pink-500/20 to-purple-600/20',
      glowColor: 'purple'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 187.5K',
      change: '+15.3%',
      changeType: 'positive',
      icon: DollarSign,
      gradient: 'from-emerald-600/20 via-green-500/20 to-emerald-600/20',
      glowColor: 'emerald'
    },
    {
      title: 'Satisfação Cliente',
      value: '98.7%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Heart,
      gradient: 'from-pink-600/20 via-rose-500/20 to-pink-600/20',
      glowColor: 'pink'
    }
  ]

  const recentPatients = [
    {
      name: 'Ana Silva',
      procedure: 'Harmonização Facial',
      time: '14:30',
      status: 'completed',
      satisfaction: 5
    },
    {
      name: 'Marina Costa',
      procedure: 'Botox Preventivo',
      time: '15:15',
      status: 'in-progress',
      satisfaction: null
    },
    {
      name: 'Julia Santos',
      procedure: 'Preenchimento Labial',
      time: '16:00',
      status: 'scheduled',
      satisfaction: null
    },
    {
      name: 'Carla Oliveira',
      procedure: 'Limpeza de Pele',
      time: '16:45',
      status: 'scheduled',
      satisfaction: null
    }
  ]

  const quickActions = [
    { icon: Calendar, label: 'Agendar Procedimento', variant: 'primary' },
    { icon: Plus, label: 'Novo Paciente', variant: 'success' },
    { icon: FileText, label: 'Relatório Financeiro', variant: 'warning' },
    { icon: Star, label: 'Avaliar Resultado', variant: 'secondary' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/20 to-purple-950/20">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 animate-background-position-spin" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-600/5 via-cyan-600/5 to-blue-600/5 animate-background-position-spin" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="flex h-screen relative z-10">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-gray-400 text-sm">
                    {time.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar pacientes..."
                    className="pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all"
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-glow-scale" />
                </motion.button>

                <div className="text-right">
                  <p className="text-sm text-white font-medium">
                    {time.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-xs text-gray-400">Sistema Online</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NeonGradientCard 
                      gradient={stat.gradient}
                      glowColor={stat.glowColor}
                      className="p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br from-${stat.glowColor}-600/20 to-${stat.glowColor}-700/20`}>
                          <stat.icon className={`w-6 h-6 text-${stat.glowColor}-400`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                      </div>
                    </NeonGradientCard>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Patients */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="lg:col-span-2"
                >
                  <NeonGradientCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">Pacientes Recentes</h2>
                      <CosmicGlowButton size="sm" variant="secondary">
                        Ver Todos
                      </CosmicGlowButton>
                    </div>
                    
                    <div className="space-y-4">
                      {recentPatients.map((patient, index) => (
                        <motion.div
                          key={patient.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{patient.name}</p>
                              <p className="text-sm text-gray-400">{patient.procedure}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-300">{patient.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                patient.status === 'completed' ? 'bg-emerald-600/20 text-emerald-400' :
                                patient.status === 'in-progress' ? 'bg-blue-600/20 text-blue-400' :
                                'bg-gray-600/20 text-gray-400'
                              }`}>
                                {patient.status === 'completed' ? 'Concluído' :
                                 patient.status === 'in-progress' ? 'Em Andamento' : 'Agendado'}
                              </span>
                              {patient.satisfaction && (
                                <div className="flex">
                                  {[...Array(patient.satisfaction)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  ))}
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <NeonGradientCard className="p-6">
                      <h2 className="text-xl font-bold text-white mb-6">Ações Rápidas</h2>
                      <div className="space-y-3">
                        {quickActions.map((action, index) => (
                          <motion.div
                            key={action.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <CosmicGlowButton
                              variant={action.variant}
                              icon={action.icon}
                              className="w-full justify-start"
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <NeonGradientCard className="p-6">
                      <h2 className="text-xl font-bold text-white mb-6">Status do Sistema</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Servidor Principal</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-glow-scale" />
                            <span className="text-emerald-400 text-sm">Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Backup Automático</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-glow-scale" />
                            <span className="text-emerald-400 text-sm">Ativo</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Última Atualização</span>
                          <span className="text-gray-400 text-sm">Há 2 minutos</span>
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
  )
}

export default Dashboard