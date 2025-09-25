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
import * as React from 'react'
import { useState } from 'react'

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
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        >
          <div className='fixed inset-0 bg-gray-600 bg-opacity-75'></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex items-center justify-between h-16 px-4 border-b'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <Activity className='h-5 w-5 text-white' />
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-900'>NeonPro</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className='lg:hidden'>
            <X className='h-6 w-6 text-gray-400' />
          </button>
        </div>

        <nav className='mt-8 px-2'>
          <div className='space-y-1'>
            {menuItems.map(item => (
              <Link
                key={item.label}
                to={item.href}
                className='group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
        <header className='bg-white shadow-sm border-b border-gray-200'>
          <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
            <div className='flex items-center'>
              <button
                onClick={() => setSidebarOpen(true)}
                className='lg:hidden'
              >
                <Menu className='h-6 w-6 text-gray-400' />
              </button>
            </div>

            <div className='flex items-center space-x-4'>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <Search className='h-6 w-6' />
              </button>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <Bell className='h-6 w-6' />
              </button>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <Settings className='h-6 w-6' />
              </button>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <LogOut className='h-6 w-6' />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className='p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Visão Geral</h1>
            <p className='text-gray-600'>Bem-vindo ao seu painel de controle</p>
          </div>

          {/* Stats cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {stats.map(stat => (
              <div key={stat.title} className='bg-white rounded-lg shadow p-6'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className='ml-5 w-0 flex-1'>
                    <dl>
                      <dt className='text-sm font-medium text-gray-500 truncate'>
                        {stat.title}
                      </dt>
                      <dd className='flex items-baseline'>
                        <div className='text-2xl font-semibold text-gray-900'>
                          {stat.value}
                        </div>
                        <div className='ml-2 flex items-baseline text-sm font-semibold text-green-600'>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent appointments */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Consultas de Hoje
                </h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {recentAppointments.map(appointment => (
                  <div key={`${appointment.name}-${appointment.time}`} className='px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {appointment.name}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {appointment.service}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium text-gray-900'>
                          {appointment.time}
                        </p>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Atividade Recente
                </h3>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <div className='h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center'>
                        <Users className='h-4 w-4 text-blue-600' />
                      </div>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        Novo paciente cadastrado
                      </p>
                      <p className='text-sm text-gray-500'>Há 2 minutos</p>
                    </div>
                  </div>

                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <div className='h-8 w-8 bg-green-100 rounded-full flex items-center justify-center'>
                        <DollarSign className='h-4 w-4 text-green-600' />
                      </div>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        Pagamento confirmado
                      </p>
                      <p className='text-sm text-gray-500'>Há 15 minutos</p>
                    </div>
                  </div>

                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <div className='h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center'>
                        <Calendar className='h-4 w-4 text-purple-600' />
                      </div>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        Agendamento cancelado
                      </p>
                      <p className='text-sm text-gray-500'>Há 1 hora</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
