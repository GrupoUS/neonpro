import { api } from '@/lib/api'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

export const Route = (createFileRoute as any)('/treatment-plans')({
  component: TreatmentPlansDashboard,
})

interface TreatmentPlan {
  id: string
  plan_name: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled'
  priority_level: 'low' | 'medium' | 'high' | 'urgent'
  progress_percentage: number
  start_date: string
  target_completion_date: string
  patient: {
    name: string
    email: string
    phone: string
  }
  professional: {
    name: string
    professional_license: string
    council_type: string
  }
  estimated_sessions: number
  total_estimated_cost: number
  created_at: string
  updated_at: string
}

interface TreatmentPlansStats {
  total: number
  draft: number
  active: number
  completed: number
  paused: number
  cancelled: number
}

function TreatmentPlansDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [stats, setStats] = useState<TreatmentPlansStats>({
    total: 0,
    draft: 0,
    active: 0,
    completed: 0,
    paused: 0,
    cancelled: 0,
  })
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    loadTreatmentPlansData()
  }, [])

  const loadTreatmentPlansData = async () => {
    try {
      const [plansResponse, statsResponse] = await Promise.all([
        api.treatmentPlans.getTreatmentPlansByClinic.query({}),
        api.treatmentPlans.getTreatmentPlanStats.query({}),
      ])

      setPlans(plansResponse)
      setStats(statsResponse)
    } catch (error) {
      console.error('Error loading treatment plans data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.professional.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || plan.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || plan.priority_level === selectedPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusIcon = (status: TreatmentPlan['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className='h-4 w-4' />
      case 'active':
        return <TrendingUp className='h-4 w-4' />
      case 'completed':
        return <CheckCircle className='h-4 w-4' />
      case 'paused':
        return <Pause className='h-4 w-4' />
      case 'cancelled':
        return <XCircle className='h-4 w-4' />
      default:
        return <FileText className='h-4 w-4' />
    }
  }

  const getStatusColor = (status: TreatmentPlan['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: TreatmentPlan['status']) => {
    switch (status) {
      case 'draft':
        return 'Rascunho'
      case 'active':
        return 'Ativo'
      case 'completed':
        return 'Concluído'
      case 'paused':
        return 'Pausado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: TreatmentPlan['priority_level']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: TreatmentPlan['priority_level']) => {
    switch (priority) {
      case 'low':
        return 'Baixa'
      case 'medium':
        return 'Média'
      case 'high':
        return 'Alta'
      case 'urgent':
        return 'Urgente'
      default:
        return priority
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <FileText className='h-8 w-8 text-blue-600' />
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Total de Planos
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  {stats.total}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Clock className='h-8 w-8 text-gray-600' />
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Rascunhos
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  {stats.draft}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <TrendingUp className='h-8 w-8 text-green-600' />
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Ativos
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  {stats.active}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <CheckCircle className='h-8 w-8 text-blue-600' />
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Concluídos
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  {stats.completed}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <AlertTriangle className='h-8 w-8 text-yellow-600' />
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Urgentes
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  {plans.filter(p => p.priority_level === 'urgent').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900'>Ações Rápidas</h3>
          <Link
            to='/dashboard'
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            <Plus className='h-4 w-4 mr-2' />
            Novo Plano
          </Link>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <button className='flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
            <Calendar className='h-4 w-4 mr-2' />
            Agendar Sessão
          </button>
          <button className='flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
            <Target className='h-4 w-4 mr-2' />
            Criar Avaliação
          </button>
          <button className='flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
            <FileText className='h-4 w-4 mr-2' />
            Gerar Relatório
          </button>
          <button className='flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
            <AlertTriangle className='h-4 w-4 mr-2' />
            Ver Alertas
          </button>
        </div>
      </div>

      {/* Treatment Plans Table */}
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium text-gray-900'>Planos de Tratamento</h3>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Search className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  placeholder='Buscar planos...'
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className='relative'>
                <select
                  className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value='all'>Todos Status</option>
                  <option value='draft'>Rascunho</option>
                  <option value='active'>Ativo</option>
                  <option value='completed'>Concluído</option>
                  <option value='paused'>Pausado</option>
                  <option value='cancelled'>Cancelado</option>
                </select>
              </div>
              <div className='relative'>
                <select
                  className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value)}
                >
                  <option value='all'>Todas Prioridades</option>
                  <option value='low'>Baixa</option>
                  <option value='medium'>Média</option>
                  <option value='high'>Alta</option>
                  <option value='urgent'>Urgente</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className='divide-y divide-gray-200'>
          {filteredPlans.map(plan => (
            <div key={plan.id} className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-3 mb-2'>
                      <h3 className='text-sm font-medium text-gray-900'>{plan.plan_name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(plan.status)
                        }`}
                      >
                        {getStatusIcon(plan.status)}
                        <span className='ml-1'>{getStatusText(plan.status)}</span>
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getPriorityColor(plan.priority_level)
                        }`}
                      >
                        {getPriorityText(plan.priority_level)}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>{plan.description}</p>
                    <div className='flex items-center space-x-6 text-sm text-gray-500'>
                      <div className='flex items-center'>
                        <User className='h-4 w-4 mr-1' />
                        <span>{plan.patient.name}</span>
                      </div>
                      <div className='flex items-center'>
                        <Calendar className='h-4 w-4 mr-1' />
                        <span>{new Date(plan.start_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className='flex items-center'>
                        <Target className='h-4 w-4 mr-1' />
                        <span>{plan.estimated_sessions} sessões</span>
                      </div>
                      <div className='flex items-center'>
                        <TrendingUp className='h-4 w-4 mr-1' />
                        <span>R$ {plan.total_estimated_cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='text-right'>
                    <div className='flex items-center justify-end space-x-2 mb-1'>
                      <div className='w-24 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{ width: `${plan.progress_percentage}%` }}
                        >
                        </div>
                      </div>
                      <span className='text-sm text-gray-600'>
                        {plan.progress_percentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className='text-sm text-gray-500'>
                      {plan.professional.name} - {plan.professional.council_type}
                    </p>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Link
                      to='/dashboard'
                      className='p-2 text-gray-400 hover:text-gray-600'
                    >
                      <Eye className='h-4 w-4' />
                    </Link>
                    <Link
                      to='/dashboard'
                      className='p-2 text-gray-400 hover:text-gray-600'
                    >
                      <Edit className='h-4 w-4' />
                    </Link>
                    <button className='p-2 text-red-400 hover:text-red-600'>
                      <Trash2 className='h-4 w-4' />
                    </button>
                    <button className='p-2 text-gray-400 hover:text-gray-600'>
                      <MoreHorizontal className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
