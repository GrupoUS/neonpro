import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Bell,
  Calendar,
  Download,
  Eye,
  Filter,
  Gift,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

export const Route = (createFileRoute as any)('/patient-engagement')({
  component: PatientEngagementDashboard,
})

function PatientEngagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { icon: TrendingUp, label: 'Visão Geral', href: '/dashboard' },
    { icon: Users, label: 'Pacientes', href: '/patients' },
    { icon: Calendar, label: 'Agendamentos', href: '/appointments' },
    { icon: MessageSquare, label: 'Engajamento', href: '/patient-engagement' },
    { icon: Calendar, label: 'Agendamento Estético', href: '/aesthetic-scheduling' },
    { icon: TrendingUp, label: 'Suporte Clínico IA', href: '/ai-clinical-support' },
  ]

  const engagementStats = [
    {
      title: 'Pacientes Ativos',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Taxa de Engajamento',
      value: '78%',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Mensagens Enviadas',
      value: '3,426',
      change: '+23%',
      icon: MessageSquare,
      color: 'text-purple-600',
    },
    {
      title: 'Satisfação Média',
      value: '4.6',
      change: '+0.3',
      icon: Star,
      color: 'text-orange-600',
    },
  ]

  const recentCommunications = [
    {
      patient: 'Ana Silva',
      type: 'Lembrete de Agendamento',
      channel: 'WhatsApp',
      status: 'Enviado',
      time: 'Há 2 horas',
    },
    {
      patient: 'Carlos Santos',
      type: 'Follow-up Pós-Tratamento',
      channel: 'Email',
      status: 'Aberto',
      time: 'Há 3 horas',
    },
    {
      patient: 'Maria Oliveira',
      type: 'Saudação de Aniversário',
      channel: 'SMS',
      status: 'Entregue',
      time: 'Há 5 horas',
    },
    {
      patient: 'João Costa',
      type: 'Pesquisa de Satisfação',
      channel: 'Email',
      status: 'Pendente',
      time: 'Há 1 dia',
    },
  ]

  const loyaltyPrograms = [
    {
      name: 'Programa Beleza Eterna',
      members: 423,
      activeCampaigns: 3,
      pointsIssued: '12,450',
    },
    {
      name: 'Clube VIP Estético',
      members: 156,
      activeCampaigns: 2,
      pointsIssued: '8,230',
    },
  ]

  const atRiskPatients = [
    {
      name: 'Patricia Lima',
      lastVisit: '90 dias',
      riskLevel: 'Alto',
      reason: 'Sem agendamentos recentes',
    },
    {
      name: 'Roberto Almeida',
      lastVisit: '60 dias',
      riskLevel: 'Médio',
      reason: 'Engajamento reduzido',
    },
    {
      name: 'Fernanda Costa',
      lastVisit: '45 dias',
      riskLevel: 'Baixo',
      reason: 'Follow-up necessário',
    },
  ]

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'communications', label: 'Comunicações', icon: MessageSquare },
    { id: 'loyalty', label: 'Programa Fidelidade', icon: Gift },
    { id: 'surveys', label: 'Pesquisas', icon: Star },
    { id: 'campaigns', label: 'Campanhas', icon: Bell },
    { id: 'analytics', label: 'Análise', icon: Eye },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enviado':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'aberto':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'entregue':
        return 'bg-purple-100 text-purple-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'alto':
        return 'bg-red-100 text-red-800'
      case 'médio':
        return 'bg-orange-100 text-orange-800'
      case 'baixo':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
                <MessageSquare className='h-5 w-5 text-white' />
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
              <div className='ml-4'>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Engajamento de Pacientes
                </h1>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <Filter className='h-6 w-6' />
              </button>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <Download className='h-6 w-6' />
              </button>
              <button className='p-1 text-gray-400 hover:text-gray-500'>
                <Settings className='h-6 w-6' />
              </button>
            </div>
          </div>
        </header>

        {/* Tab navigation */}
        <div className='bg-white border-b border-gray-200'>
          <nav className='px-4 sm:px-6 lg:px-8'>
            <div className='flex space-x-8'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className='mr-2 h-4 w-4' />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Dashboard content */}
        <main className='p-6'>
          {/* Stats cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {engagementStats.map((stat, index) => (
              <div key={index} className='bg-white rounded-lg shadow p-6'>
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

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Recent Communications */}
              <div className='bg-white rounded-lg shadow'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Comunicações Recentes
                    </h3>
                    <button className='text-blue-600 hover:text-blue-700'>
                      Ver todas
                    </button>
                  </div>
                </div>
                <div className='divide-y divide-gray-200'>
                  {recentCommunications.map((comm, index) => (
                    <div key={index} className='px-6 py-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center justify-between'>
                            <p className='text-sm font-medium text-gray-900'>
                              {comm.patient}
                            </p>
                            <span className='text-xs text-gray-500'>{comm.time}</span>
                          </div>
                          <p className='text-sm text-gray-500 mt-1'>
                            {comm.type}
                          </p>
                          <div className='flex items-center mt-2'>
                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                              {comm.channel}
                            </span>
                            <span
                              className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                getStatusColor(
                                  comm.status,
                                )
                              }`}
                            >
                              {comm.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* At-Risk Patients */}
              <div className='bg-white rounded-lg shadow'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Pacientes em Risco
                    </h3>
                    <AlertTriangle className='h-5 w-5 text-orange-500' />
                  </div>
                </div>
                <div className='divide-y divide-gray-200'>
                  {atRiskPatients.map((patient, index) => (
                    <div key={index} className='px-6 py-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {patient.name}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Última visita: {patient.lastVisit}
                          </p>
                          <p className='text-sm text-gray-500 mt-1'>
                            {patient.reason}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            getRiskColor(
                              patient.riskLevel,
                            )
                          }`}
                        >
                          {patient.riskLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loyalty Programs */}
              <div className='bg-white rounded-lg shadow'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Programas de Fidelidade
                    </h3>
                    <button className='text-blue-600 hover:text-blue-700'>
                      Gerenciar
                    </button>
                  </div>
                </div>
                <div className='divide-y divide-gray-200'>
                  {loyaltyPrograms.map((program, index) => (
                    <div key={index} className='px-6 py-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {program.name}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {program.members} membros ativos
                          </p>
                          <p className='text-sm text-gray-500'>
                            {program.activeCampaigns} campanhas ativas
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-medium text-gray-900'>
                            {program.pointsIssued} pontos
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className='bg-white rounded-lg shadow'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Ações Rápidas
                  </h3>
                </div>
                <div className='p-6'>
                  <div className='grid grid-cols-2 gap-4'>
                    <button className='flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50'>
                      <Send className='h-8 w-8 text-blue-600 mb-2' />
                      <span className='text-sm font-medium text-gray-900'>
                        Enviar Comunicação
                      </span>
                    </button>
                    <button className='flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50'>
                      <Plus className='h-8 w-8 text-green-600 mb-2' />
                      <span className='text-sm font-medium text-gray-900'>
                        Criar Campanha
                      </span>
                    </button>
                    <button className='flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50'>
                      <Gift className='h-8 w-8 text-purple-600 mb-2' />
                      <span className='text-sm font-medium text-gray-900'>
                        Programa Fidelidade
                      </span>
                    </button>
                    <button className='flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50'>
                      <Star className='h-8 w-8 text-orange-600 mb-2' />
                      <span className='text-sm font-medium text-gray-900'>
                        Criar Pesquisa
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Gerenciar Comunicações
                  </h3>
                  <button className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'>
                    Nova Comunicação
                  </button>
                </div>
              </div>
              <div className='p-6'>
                <p className='text-gray-500'>
                  Painel de gerenciamento de comunicações em desenvolvimento...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Programas de Fidelidade
                  </h3>
                  <button className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'>
                    Novo Programa
                  </button>
                </div>
              </div>
              <div className='p-6'>
                <p className='text-gray-500'>
                  Painel de programas de fidelidade em desenvolvimento...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'surveys' && (
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Pesquisas e Feedback
                  </h3>
                  <button className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'>
                    Nova Pesquisa
                  </button>
                </div>
              </div>
              <div className='p-6'>
                <p className='text-gray-500'>
                  Painel de pesquisas e feedback em desenvolvimento...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Campanhas de Engajamento
                  </h3>
                  <button className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'>
                    Nova Campanha
                  </button>
                </div>
              </div>
              <div className='p-6'>
                <p className='text-gray-500'>
                  Painel de campanhas de engajamento em desenvolvimento...
                </p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Análise de Engajamento
                  </h3>
                  <button className='text-blue-600 hover:text-blue-700'>
                    Exportar Relatório
                  </button>
                </div>
              </div>
              <div className='p-6'>
                <p className='text-gray-500'>
                  Painel de análise de engajamento em desenvolvimento...
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
