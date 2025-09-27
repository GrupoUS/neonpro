import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Bell,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Menu,
  Search,
  Settings,
  TrendingUp,
  X,
  Shield,
  MessageSquare,
  Brain,
  FileText,
  Zap
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/')({ 
  component: Dashboard,
})

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Pacientes', href: '/patients' },
    { icon: Calendar, label: 'Agendamentos', href: '/appointments' },
    { icon: MessageSquare, label: 'Engajamento', href: '/patient-engagement' },
    { icon: Calendar, label: 'Agendamento Estético', href: '/aesthetic-scheduling' },
    { icon: Brain, label: 'Suporte Clínico IA', href: '/ai-clinical-support' },
    { icon: DollarSign, label: 'Financeiro', href: '/financial-management' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Shield, label: 'Compliance', href: '/compliance' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ]

  const dashboardStats = [
    {
      title: 'Total de Pacientes',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Agendamentos Hoje',
      value: '23',
      change: '+8%',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 157.420',
      change: '+15%',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Taxa de Ocupação',
      value: '87%',
      change: '+3%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className='fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75'
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSidebarOpen(false)
          }}
          role="button"
          tabIndex={0}
          aria-label="Fechar sidebar"
        >
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
                <Zap className='h-5 w-5 text-white' />
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-gray-900'>NeonPro</p>
              <p className='text-xs text-gray-500'>Clínica Estética</p>
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
                key={`menu-${item.label}`}
                to={item.href}
                className='group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                activeProps={{
                  className: 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                }}
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
              <h1 className='ml-4 text-xl font-semibold text-gray-900'>
                Dashboard Principal
              </h1>
            </div>

            <div className='flex items-center space-x-4'>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <Search className='h-6 w-6' />
              </button>
              <button className='p-1 text-gray-400 hover:text-gray-500 relative'>
                <Bell className='h-6 w-6' />
                <span className='absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>3</span>
              </button>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <Settings className='h-6 w-6' />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className='p-6'>
          {/* Welcome section */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Bem-vindo ao NeonPro!</h2>
            <p className='text-gray-600'>Aqui está o resumo da sua clínica estética hoje.</p>
          </div>

          {/* Stats cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {dashboardStats.map((stat) => (
              <div key={`stat-${stat.title}`} className='bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className={`h-10 w-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
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

          {/* Dashboard Cards Layout */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {/* Appointments Card */}
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  Próximos Agendamentos
                </h3>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                  <div>
                    <p className='font-medium text-sm'>Maria Silva</p>
                    <p className='text-xs text-gray-500'>Botox - 14:30</p>
                  </div>
                  <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>Confirmado</span>
                </div>
                <div className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                  <div>
                    <p className='font-medium text-sm'>João Santos</p>
                    <p className='text-xs text-gray-500'>Preenchimento - 15:00</p>
                  </div>
                  <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>Pendente</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <Zap className='h-5 w-5' />
                  Ações Rápidas
                </h3>
              </div>
              <div className='space-y-2'>
                <button className='w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'>
                  <Users className='h-4 w-4 mr-2' />
                  Novo Paciente
                </button>
                <button className='w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'>
                  <Calendar className='h-4 w-4 mr-2' />
                  Agendar Consulta
                </button>
                <button className='w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'>
                  <FileText className='h-4 w-4 mr-2' />
                  Relatório Diário
                </button>
              </div>
            </div>

            {/* Revenue Card */}
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                  <DollarSign className='h-5 w-5' />
                  Receita do Mês
                </h3>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600 mb-2'>R$ 157.420</div>
                <div className='text-sm text-gray-500 mb-4'>Meta: R$ 150.000</div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div className='bg-green-600 h-2 rounded-full' style={{ width: '105%' }}></div>
                </div>
                <p className='text-xs text-green-600 mt-2'>+5% acima da meta</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Atividade Recente</h3>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <div className='h-2 w-2 bg-green-500 rounded-full'></div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Nova consulta agendada</p>
                  <p className='text-xs text-gray-500'>Maria Silva - Botox - há 5 minutos</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='h-2 w-2 bg-blue-500 rounded-full'></div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Pagamento recebido</p>
                  <p className='text-xs text-gray-500'>R$ 1.200,00 - João Santos - há 15 minutos</p>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='h-2 w-2 bg-yellow-500 rounded-full'></div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Lembrete automático enviado</p>
                  <p className='text-xs text-gray-500'>Ana Costa - consulta amanhã - há 30 minutos</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}