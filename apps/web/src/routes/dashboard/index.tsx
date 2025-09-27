import { createFileRoute, Link } from '@tanstack/react-router'
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
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@neonpro/ui'

export const Route = createFileRoute('/dashboard/')({
  component: Dashboard,
})

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { icon: TrendingUp, label: 'Visão Geral', href: '/dashboard' },
    { icon: Users, label: 'Pacientes', href: '/patients' },
    { icon: Calendar, label: 'Agendamentos', href: '/appointments' },
    { icon: DollarSign, label: 'Financeiro', href: '/financial' },
    { icon: Activity, label: 'Prontuários', href: '/records' },
    { icon: Calendar, label: 'Agendamento Estético', href: '/aesthetic-scheduling' },
    { icon: Activity, label: 'Suporte Clínico IA', href: '/ai-clinical-support' },
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

  return (
    <div className='min-h-screen bg-neonpro-background'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        >
          <div className='fixed inset-0 bg-neonpro-deep-blue bg-opacity-75'></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white neonpro-neumorphic transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex items-center justify-between h-16 px-4 border-b border-neonpro-neutral/30'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-8 w-8 bg-neonpro-primary rounded-lg flex items-center justify-center neonpro-neumorphic'>
                <Activity className='h-5 w-5 text-white' />
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-neonpro-deep-blue'>NeonPro</p>
            </div>
          </div>
          <Button 
            onClick={() => setSidebarOpen(false)} 
            variant="ghost" 
            size="icon"
            className='lg:hidden'
          >
            <X className='h-6 w-6 text-neonpro-deep-blue/60' />
          </Button>
        </div>

        <nav className='mt-8 px-2'>
          <div className='space-y-1'>
            {menuItems.map(item => (
              <Link
                key={item.label}
                to={item.href}
                className='group flex items-center px-2 py-2 text-base font-medium rounded-md text-neonpro-deep-blue/70 hover:bg-neonpro-primary/10 hover:text-neonpro-primary transition-colors healthcare-focus-ring'
              >
                <item.icon className='mr-4 h-6 w-6' />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className='lg:pl-64'>
        {/* Top navigation */}
        <header className='bg-white neonpro-neumorphic border-b border-neonpro-neutral/30'>
          <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
            <div className='flex items-center'>
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="ghost"
                size="icon"
                className='lg:hidden'
              >
                <Menu className='h-6 w-6 text-neonpro-deep-blue/60' />
              </Button>
            </div>

            <div className='flex items-center space-x-2'>
              <Button variant="ghost" size="icon">
                <Search className='h-6 w-6' />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className='h-6 w-6' />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className='h-6 w-6' />
              </Button>
              <Button variant="ghost" size="icon">
                <LogOut className='h-6 w-6' />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className='p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-neonpro-deep-blue'>Visão Geral</h1>
            <p className='text-neonpro-deep-blue/70'>Bem-vindo ao seu painel de controle</p>
          </div>

          {/* Stats cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {stats.map(stat => (
              <Card key={stat.title} variant="neonpro">
                <CardContent className="p-6">
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-neonpro-deep-blue/70 truncate'>
                          {stat.title}
                        </dt>
                        <dd className='flex items-baseline'>
                          <div className='text-2xl font-semibold text-neonpro-deep-blue'>
                            {stat.value}
                          </div>
                          <div className='ml-2 flex items-baseline text-sm font-semibold text-green-600'>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent appointments */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card variant="neonpro">
              <CardHeader>
                <CardTitle className='text-lg font-medium text-neonpro-deep-blue'>
                  Consultas de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className='divide-y divide-neonpro-neutral/30'>
                  {recentAppointments.map(appointment => (
                    <div key={`${appointment.name}-${appointment.time}`} className='px-6 py-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-neonpro-deep-blue'>
                            {appointment.name}
                          </p>
                          <p className='text-sm text-neonpro-deep-blue/60'>
                            {appointment.service}
                          </p>
                        </div>
                        <div className='text-right flex flex-col items-end gap-2'>
                          <p className='text-sm font-medium text-neonpro-deep-blue'>
                            {appointment.time}
                          </p>
                          <Badge variant="neonpro">
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="neonpro">
              <CardHeader>
                <CardTitle className='text-lg font-medium text-neonpro-deep-blue'>
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <div className='h-8 w-8 bg-neonpro-primary/20 rounded-full flex items-center justify-center'>
                        <Users className='h-4 w-4 text-neonpro-primary' />
                      </div>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-neonpro-deep-blue'>
                        Novo paciente cadastrado
                      </p>
                      <p className='text-sm text-neonpro-deep-blue/60'>Há 2 minutos</p>
                    </div>
                  </div>

                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <div className='h-8 w-8 bg-green-100 rounded-full flex items-center justify-center'>
                        <DollarSign className='h-4 w-4 text-green-600' />
                      </div>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-neonpro-deep-blue'>
                        Pagamento confirmado
                      </p>
                      <p className='text-sm text-neonpro-deep-blue/60'>Há 15 minutos</p>
                    </div>
                  </div>

                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <div className='h-8 w-8 bg-neonpro-accent/20 rounded-full flex items-center justify-center'>
                        <Calendar className='h-4 w-4 text-neonpro-accent' />
                      </div>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-neonpro-deep-blue'>
                        Agendamento cancelado
                      </p>
                      <p className='text-sm text-neonpro-deep-blue/60'>Há 1 hora</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
