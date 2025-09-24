import { createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Settings,
  UserPlus,
  Users,
  Video,
} from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/coordination/')({
  component: CoordinationDashboard,
})

interface CoordinationStats {
  totalTeams: number
  activeReferrals: number
  pendingSessions: number
  unreadMessages: number
  supervisionRequests: number
  protocolExecutions: number
}

interface Team {
  id: string
  name: string
  teamType: string
  memberCount: number
  isActive: boolean
  createdAt: string
}

interface Referral {
  id: string
  patientId: string
  patientName: string
  referringProfessional: string
  referredProfessional: string
  referralType: string
  urgencyLevel: string
  status: string
  createdAt: string
}

interface Session {
  id: string
  title: string
  patientName: string
  sessionType: string
  scheduledStart: string
  status: string
  teamName: string
}

interface Thread {
  id: string
  subject: string
  contextType: string
  priority: string
  messageCount: number
  lastMessage: string
  createdAt: string
}

function CoordinationDashboard() {
  const [stats, setStats] = useState<CoordinationStats>({
    totalTeams: 0,
    activeReferrals: 0,
    pendingSessions: 0,
    unreadMessages: 0,
    supervisionRequests: 0,
    protocolExecutions: 0,
  })

  const [teams, setTeams] = useState<Team[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setStats({
        totalTeams: 8,
        activeReferrals: 12,
        pendingSessions: 5,
        unreadMessages: 23,
        supervisionRequests: 3,
        protocolExecutions: 7,
      })

      setTeams([
        {
          id: '1',
          name: 'Equipe Multidisciplinar',
          teamType: 'multidisciplinary',
          memberCount: 6,
          isActive: true,
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Equipe de Emergência Estética',
          teamType: 'emergency',
          memberCount: 4,
          isActive: true,
          createdAt: '2024-02-01',
        },
        {
          id: '3',
          name: 'Especialistas em Preenchimento',
          teamType: 'specialized',
          memberCount: 3,
          isActive: true,
          createdAt: '2024-01-20',
        },
      ])

      setReferrals([
        {
          id: '1',
          patientId: '1',
          patientName: 'Ana Silva',
          referringProfessional: 'Dr. João Santos (CRM)',
          referredProfessional: 'Dra. Maria Oliveira (CRM)',
          referralType: 'consultation',
          urgencyLevel: 'medium',
          status: 'pending',
          createdAt: '2024-03-15',
        },
        {
          id: '2',
          patientId: '2',
          patientName: 'Carlos Santos',
          referringProfessional: 'Enfermeira Ana Costa (COREN)',
          referredProfessional: 'Dr. Pedro Lima (CRM)',
          referralType: 'treatment',
          urgencyLevel: 'high',
          status: 'accepted',
          createdAt: '2024-03-14',
        },
      ])

      setSessions([
        {
          id: '1',
          title: 'Planejamento de Tratamento Integrado',
          patientName: 'Maria Oliveira',
          sessionType: 'planning',
          scheduledStart: '2024-03-16T14:00:00',
          status: 'scheduled',
          teamName: 'Equipe Multidisciplinar',
        },
        {
          id: '2',
          title: 'Sessão de Botox Colaborativa',
          patientName: 'João Silva',
          sessionType: 'treatment',
          scheduledStart: '2024-03-16T10:00:00',
          status: 'in_progress',
          teamName: 'Especialistas em Preenchimento',
        },
      ])

      setThreads([
        {
          id: '1',
          subject: 'Coordenação de tratamento para paciente Maria',
          contextType: 'patient_care',
          priority: 'high',
          messageCount: 8,
          lastMessage: 'Precisamos agendar a sessão de preenchimento para próxima semana',
          createdAt: '2024-03-15',
        },
        {
          id: '2',
          subject: 'Atualização protocolo de emergência',
          contextType: 'administrative',
          priority: 'normal',
          messageCount: 3,
          lastMessage: 'O protocolo foi atualizado com as novas diretrizes',
          createdAt: '2024-03-14',
        },
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-100'
      case 'in_progress':
        return 'text-green-600 bg-green-100'
      case 'completed':
        return 'text-gray-600 bg-gray-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'accepted':
        return 'text-green-600 bg-green-100'
      case 'declined':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTeamTypeLabel = (type: string) => {
    switch (type) {
      case 'multidisciplinary':
        return 'Multidisciplinar'
      case 'specialized':
        return 'Especializada'
      case 'consultation':
        return 'Consulta'
      case 'emergency':
        return 'Emergência'
      default:
        return type
    }
  }

  const getReferralTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'Consulta'
      case 'treatment':
        return 'Tratamento'
      case 'assessment':
        return 'Avaliação'
      case 'supervision':
        return 'Supervisão'
      case 'second_opinion':
        return 'Segunda Opinião'
      default:
        return type
    }
  }

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'planning':
        return 'Planejamento'
      case 'treatment':
        return 'Tratamento'
      case 'assessment':
        return 'Avaliação'
      case 'follow_up':
        return 'Acompanhamento'
      case 'emergency':
        return 'Emergência'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <Users className='h-8 w-8 text-blue-600 mr-3' />
              <h1 className='text-2xl font-bold text-gray-900'>Coordenação Multiprofissional</h1>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='p-2 text-gray-400 hover:text-gray-500'>
                <Search className='h-5 w-5' />
              </button>
              <button className='p-2 text-gray-400 hover:text-gray-500'>
                <Bell className='h-5 w-5' />
              </button>
              <button className='p-2 text-gray-400 hover:text-gray-500'>
                <Settings className='h-5 w-5' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Users className='h-8 w-8 text-blue-600' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total de Equipes
                  </dt>
                  <dd className='text-2xl font-semibold text-gray-900'>
                    {stats.totalTeams}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <FileText className='h-8 w-8 text-green-600' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Encaminhamentos Ativos
                  </dt>
                  <dd className='text-2xl font-semibold text-gray-900'>
                    {stats.activeReferrals}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Calendar className='h-8 w-8 text-purple-600' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Sessões Pendentes
                  </dt>
                  <dd className='text-2xl font-semibold text-gray-900'>
                    {stats.pendingSessions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <MessageSquare className='h-8 w-8 text-orange-600' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Mensagens Não Lidas
                  </dt>
                  <dd className='text-2xl font-semibold text-gray-900'>
                    {stats.unreadMessages}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Eye className='h-8 w-8 text-indigo-600' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Supervisões
                  </dt>
                  <dd className='text-2xl font-semibold text-gray-900'>
                    {stats.supervisionRequests}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <BarChart3 className='h-8 w-8 text-red-600' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Protocolos Ativos
                  </dt>
                  <dd className='text-2xl font-semibold text-gray-900'>
                    {stats.protocolExecutions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-medium text-gray-900'>Ações Rápidas</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <button className='flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
              <Plus className='h-5 w-5 mr-2' />
              Nova Equipe
            </button>
            <button className='flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
              <UserPlus className='h-5 w-5 mr-2' />
              Novo Encaminhamento
            </button>
            <button className='flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
              <Video className='h-5 w-5 mr-2' />
              Nova Sessão
            </button>
            <button className='flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors'>
              <MessageSquare className='h-5 w-5 mr-2' />
              Nova Discussão
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className='border-b border-gray-200 mb-6'>
          <nav className='-mb-px flex space-x-8'>
            {['overview', 'teams', 'referrals', 'sessions', 'messages'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                {tab === 'overview' && 'Visão Geral'}
                {tab === 'teams' && 'Equipes'}
                {tab === 'referrals' && 'Encaminhamentos'}
                {tab === 'sessions' && 'Sessões'}
                {tab === 'messages' && 'Mensagens'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Recent Teams */}
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>Equipes Recentes</h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {teams.slice(0, 3).map(team => (
                  <div key={team.id} className='px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>{team.name}</p>
                        <p className='text-sm text-gray-500'>
                          {getTeamTypeLabel(team.teamType)} • {team.memberCount} membros
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          Ativa
                        </span>
                        <ChevronRight className='h-4 w-4 text-gray-400' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Referrals */}
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>Encaminhamentos Recentes</h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {referrals.slice(0, 3).map(referral => (
                  <div key={referral.id} className='px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>{referral.patientName}</p>
                        <p className='text-sm text-gray-500'>
                          {referral.referringProfessional} → {referral.referredProfessional}
                        </p>
                      </div>
                      <div className='text-right'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getUrgencyColor(referral.urgencyLevel)
                          }`}
                        >
                          {referral.urgencyLevel}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>
                          {getReferralTypeLabel(referral.referralType)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>Próximas Sessões</h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {sessions.slice(0, 3).map(session => (
                  <div key={session.id} className='px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>{session.title}</p>
                        <p className='text-sm text-gray-500'>
                          {session.patientName} • {session.teamName}
                        </p>
                      </div>
                      <div className='text-right'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(session.status)
                          }`}
                        >
                          {session.status}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>
                          {getSessionTypeLabel(session.sessionType)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Messages */}
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>Discussões Recentes</h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {threads.slice(0, 3).map(thread => (
                  <div key={thread.id} className='px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>{thread.subject}</p>
                        <p className='text-sm text-gray-500 truncate'>{thread.lastMessage}</p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {thread.messageCount}
                        </span>
                        <ChevronRight className='h-4 w-4 text-gray-400' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'teams' && (
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>Equipes Profissionais</h3>
              <button className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                <Plus className='h-4 w-4 mr-2' />
                Nova Equipe
              </button>
            </div>
            <div className='divide-y divide-gray-200'>
              {teams.map(team => (
                <div key={team.id} className='px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{team.name}</p>
                      <p className='text-sm text-gray-500'>
                        {getTeamTypeLabel(team.teamType)} • {team.memberCount} membros • Criada em
                        {' '}
                        {new Date(team.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                        Ativa
                      </span>
                      <button className='p-1 text-gray-400 hover:text-gray-500'>
                        <Eye className='h-4 w-4' />
                      </button>
                      <button className='p-1 text-gray-400 hover:text-gray-500'>
                        <Edit3 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'referrals' && (
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>Encaminhamentos Profissionais</h3>
              <button className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
                <Plus className='h-4 w-4 mr-2' />
                Novo Encaminhamento
              </button>
            </div>
            <div className='divide-y divide-gray-200'>
              {referrals.map(referral => (
                <div key={referral.id} className='px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{referral.patientName}</p>
                      <p className='text-sm text-gray-500'>
                        {referral.referringProfessional} → {referral.referredProfessional}
                      </p>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getUrgencyColor(referral.urgencyLevel)
                          }`}
                        >
                          {referral.urgencyLevel}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>
                          {getReferralTypeLabel(referral.referralType)}
                        </p>
                      </div>
                      <div className='text-right'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(referral.status)
                          }`}
                        >
                          {referral.status}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className='p-1 text-gray-400 hover:text-gray-500'>
                        <Eye className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'sessions' && (
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>Sessões Colaborativas</h3>
              <button className='flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
                <Plus className='h-4 w-4 mr-2' />
                Nova Sessão
              </button>
            </div>
            <div className='divide-y divide-gray-200'>
              {sessions.map(session => (
                <div key={session.id} className='px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{session.title}</p>
                      <p className='text-sm text-gray-500'>
                        {session.patientName} • {session.teamName}
                      </p>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(session.status)
                          }`}
                        >
                          {session.status}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>
                          {getSessionTypeLabel(session.sessionType)}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium text-gray-900'>
                          {new Date(session.scheduledStart).toLocaleDateString()}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {new Date(session.scheduledStart).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button className='p-1 text-gray-400 hover:text-gray-500'>
                        <Eye className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'messages' && (
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>Discussões de Coordenação</h3>
              <button className='flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors'>
                <Plus className='h-4 w-4 mr-2' />
                Nova Discussão
              </button>
            </div>
            <div className='divide-y divide-gray-200'>
              {threads.map(thread => (
                <div key={thread.id} className='px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>{thread.subject}</p>
                      <p className='text-sm text-gray-500 truncate'>{thread.lastMessage}</p>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            thread.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : thread.priority === 'normal'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {thread.priority}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>{thread.contextType}</p>
                      </div>
                      <div className='text-right'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {thread.messageCount}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>
                          {new Date(thread.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className='p-1 text-gray-400 hover:text-gray-500'>
                        <Eye className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
