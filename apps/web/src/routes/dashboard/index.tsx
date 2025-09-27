import { ProtectedRoute } from '@/components/auth/ProtectedRoute.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card } from '@/components/ui/card.js'
import { useAuth } from '@/contexts/AuthContext.js'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Activity,
    Bell,
    Calendar,
    DollarSign,
    LogOut,
    Menu,
    Search,
    Settings,
    TrendingUp,
    Users,
    X,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <ProtectedRoute requireEmailVerification={false}>
      <Dashboard />
    </ProtectedRoute>
  )
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    const result = await signOut()
    if (!result.error) {
      window.location.href = '/auth/login'
    }
  }

  const menuItems = [
    { icon: TrendingUp, label: 'Visão Geral', href: '/dashboard/' },
    { icon: Users, label: 'Pacientes', href: '/patient-engagement/' },
    { icon: Calendar, label: 'Agendamentos', href: '/aesthetic-scheduling/' },
    { icon: DollarSign, label: 'Financeiro', href: '/financial-management/' },
    { icon: Activity, label: 'Prontuários', href: '/ai-clinical-support/' },
    { icon: Calendar, label: 'Coordenação', href: '/coordination/' },
    { icon: Activity, label: 'Analytics', href: '/analytics/' },
  ]

  const stats = [
    {
      title: 'Pacientes Ativos',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Consultas Hoje',
      value: '24',
      change: '+8%',
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Faturamento Mês',
      value: 'R$ 89.450',
      change: '+23%',
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      title: 'Taxa Ocupação',
      value: '87%',
      change: '+5%',
      icon: Activity,
      color: 'text-orange-600',
    },
  ]

  const recentAppointments = [
    {
      name: 'Ana Silva',
      time: '09:00',
      service: 'Botox',
      status: 'Confirmado',
    },
    {
      name: 'Carlos Santos',
      time: '10:30',
      service: 'Preenchimento',
      status: 'Confirmado',
    },
    {
      name: 'Maria Oliveira',
      time: '14:00',
      service: 'Limpeza',
      status: 'Aguardando',
    },
    {
      name: 'João Costa',
      time: '15:30',
      service: 'Ácido',
      status: 'Confirmado',
    },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  }

  return (
    <div className="min-h-screen bg-neonpro-background">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-neonpro-deep-blue bg-opacity-75"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white neonpro-neumorphic lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-neonpro-neutral/30">
          <motion.div
            className="flex items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-neonpro-primary rounded-lg flex items-center justify-center neonpro-neumorphic">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neonpro-deep-blue">NeonPro</p>
            </div>
          </motion.div>
          <Button
            onClick={() => setSidebarOpen(false)}
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <X className="h-6 w-6 text-neonpro-deep-blue/60" />
          </Button>
        </div>

        <nav className="mt-8 px-2">
          <motion.div
            className="space-y-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-neonpro-deep-blue/70 hover:bg-neonpro-primary/10 hover:text-neonpro-primary transition-colors healthcare-focus-ring"
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <motion.header
          className="bg-white neonpro-neumorphic border-b border-neonpro-neutral/30"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="ghost"
                size="icon"
                className="lg:hidden"
              >
                <Menu className="h-6 w-6 text-neonpro-deep-blue/60" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-neonpro-deep-blue/70 mr-4">
                Olá, {user?.firstName || user?.email || 'Usuário'}
              </span>
              <Button variant="ghost" size="icon">
                <Search className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Dashboard content */}
        <motion.main
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-neonpro-deep-blue">Visão Geral</h1>
            <p className="text-neonpro-deep-blue/70">Bem-vindo ao seu painel de controle</p>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden border border-neonpro-neutral/30 bg-white neonpro-neumorphic">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-neonpro-deep-blue/70 truncate">
                            {stat.title}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-neonpro-deep-blue">
                              {stat.value}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              {stat.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent appointments */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card variant="neonpro">
                <div className="px-6 py-4 border-b border-neonpro-neutral/30">
                  <h3 className="text-lg font-medium text-neonpro-deep-blue">
                    Consultas de Hoje
                  </h3>
                </div>
                <div className="p-0">
                  <div className="divide-y divide-neonpro-neutral/30">
                    {recentAppointments.map((appointment, index) => (
                      <motion.div
                        key={`${appointment.name}-${appointment.time}`}
                        className="px-6 py-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ backgroundColor: 'rgba(172, 148, 105, 0.05)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neonpro-deep-blue">
                              {appointment.name}
                            </p>
                            <p className="text-sm text-neonpro-deep-blue/60">
                              {appointment.service}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <p className="text-sm font-medium text-neonpro-deep-blue">
                              {appointment.time}
                            </p>
                            <Badge className="bg-neonpro-primary/10 text-neonpro-primary border-neonpro-primary/20">
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card variant="neonpro">
                <div className="px-6 py-4 border-b border-neonpro-neutral/30">
                  <h3 className="text-lg font-medium text-neonpro-deep-blue">
                    Atividade Recente
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <motion.div
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-neonpro-primary/20 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-neonpro-primary" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neonpro-deep-blue">
                          Novo paciente cadastrado
                        </p>
                        <p className="text-sm text-neonpro-deep-blue/60">Há 2 minutos</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neonpro-deep-blue">
                          Pagamento confirmado
                        </p>
                        <p className="text-sm text-neonpro-deep-blue/60">Há 15 minutos</p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-neonpro-accent/20 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-neonpro-accent" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-neonpro-deep-blue">
                          Agendamento cancelado
                        </p>
                        <p className="text-sm text-neonpro-deep-blue/60">Há 1 hora</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
}
