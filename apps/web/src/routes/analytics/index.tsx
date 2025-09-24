/**
 * Advanced Analytics and Business Intelligence Dashboard
 * Comprehensive analytics interface for aesthetic clinic business intelligence
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  Filter,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Target,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { api } from '~/lib/api'

export const Route = createFileRoute('/analytics/')({
  component: AnalyticsDashboard,
})

function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    revenueTotal: 0,
    appointmentCount: 0,
    newPatients: 0,
    noShowRate: 0,
  })
  const [dashboardData, setDashboardData] = useState<any>(null)

  // Mock data for demonstration
  const kpis = [
    {
      name: 'Receita Total',
      value: 'R$ 45.230',
      change: '+23%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    { name: 'Consultas Hoje', value: '24', change: '+8%', icon: Clock, color: 'text-blue-600' },
    { name: 'Novos Pacientes', value: '12', change: '+15%', icon: Users, color: 'text-purple-600' },
    {
      name: 'Taxa de Comparecimento',
      value: '92%',
      change: '+5%',
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
    { name: 'Satisfação', value: '4.8', change: '+2%', icon: Target, color: 'text-indigo-600' },
    { name: 'Ocupação', value: '87%', change: '+3%', icon: Activity, color: 'text-orange-600' },
  ]

  const alerts = [
    {
      id: 1,
      name: 'Alta Taxa de Não Comparecimento',
      type: 'threshold',
      severity: 'high',
      triggered: '2 horas atrás',
    },
    {
      id: 2,
      name: 'Receita Abaixo do Esperado',
      type: 'trend',
      severity: 'medium',
      triggered: '1 dia atrás',
    },
    {
      id: 3,
      name: 'Estoque Baixo - Botox',
      type: 'anomaly',
      severity: 'critical',
      triggered: '30 minutos atrás',
    },
  ]

  const reports = [
    {
      id: 1,
      name: 'Relatório Financeiro Mensal',
      type: 'financial',
      lastRun: 'Hoje, 09:00',
      nextRun: 'Amanhã, 09:00',
    },
    {
      id: 2,
      name: 'Análise de Desempenho',
      type: 'operational',
      lastRun: 'Ontem, 18:00',
      nextRun: 'Sexta, 18:00',
    },
    {
      id: 3,
      name: 'Relatório de Satisfação',
      type: 'patient',
      lastRun: 'Segunda, 10:00',
      nextRun: 'Próxima Segunda',
    },
  ]

  const models = [
    {
      id: 1,
      name: 'Previsão de Não Comparecimento',
      type: 'no_show_prediction',
      accuracy: 0.87,
      lastTrained: 'Hoje',
    },
    {
      id: 2,
      name: 'Previsão de Receita',
      type: 'revenue_forecast',
      accuracy: 0.92,
      lastTrained: 'Ontem',
    },
    {
      id: 3,
      name: 'Demanda de Estoque',
      type: 'inventory_demand',
      accuracy: 0.78,
      lastTrained: '2 dias atrás',
    },
  ]

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalyticsData = async () => {
      setLoading(true)
      // In a real implementation, this would fetch from the API
      setTimeout(() => {
        setRealtimeMetrics({
          revenueTotal: 45230,
          appointmentCount: 24,
          newPatients: 12,
          noShowRate: 8,
        })
        setLoading(false)
      }, 1500)
    }

    loadAnalyticsData()
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className='h-4 w-4' />
      case 'high':
        return <AlertTriangle className='h-4 w-4' />
      case 'medium':
        return <AlertTriangle className='h-4 w-4' />
      default:
        return <CheckCircle className='h-4 w-4' />
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <BarChart3 className='h-8 w-8 text-blue-600' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Analytics e Business Intelligence
                </h1>
                <p className='text-sm text-gray-600'>
                  Insights e métricas para sua clínica estética
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={handleRefresh}
                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <Link
                to='/analytics/dashboard/new'
                className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <Plus className='h-4 w-4 mr-2' />
                Novo Dashboard
              </Link>
              <button className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                <Download className='h-4 w-4 mr-2' />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='bg-white border-b border-gray-200'>
        <nav className='px-6' aria-label='Tabs'>
          <div className='flex space-x-8'>
            {[
              { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
              { id: 'dashboards', name: 'Dashboards', icon: PieChart },
              { id: 'kpis', name: 'KPIs', icon: Target },
              { id: 'alerts', name: 'Alertas', icon: AlertTriangle },
              { id: 'reports', name: 'Relatórios', icon: Download },
              { id: 'predictions', name: 'Previsões', icon: Brain },
              { id: 'exports', name: 'Exportações', icon: Download },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <tab.icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {tab.name}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className='p-6'>
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            {/* Real-time Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
              {kpis.map((kpi, index) => (
                <div key={index} className='bg-white rounded-lg shadow p-6'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          {kpi.name}
                        </dt>
                        <dd className='flex items-baseline'>
                          <div className='text-2xl font-semibold text-gray-900'>
                            {kpi.value}
                          </div>
                          <div className='ml-2 flex items-baseline text-sm font-semibold text-green-600'>
                            {kpi.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Revenue Trend */}
              <div className='bg-white rounded-lg shadow'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-medium text-gray-900'>Tendência de Receita</h3>
                </div>
                <div className='p-6'>
                  <div className='h-64 bg-gray-50 rounded-lg flex items-center justify-center'>
                    <div className='text-center'>
                      <TrendingUp className='h-12 w-12 text-gray-400 mx-auto mb-2' />
                      <p className='text-gray-500'>Gráfico de tendência de receita</p>
                      <p className='text-sm text-gray-400'>Dados dos últimos 30 dias</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Distribution */}
              <div className='bg-white rounded-lg shadow'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-medium text-gray-900'>Distribuição de Consultas</h3>
                </div>
                <div className='p-6'>
                  <div className='h-64 bg-gray-50 rounded-lg flex items-center justify-center'>
                    <div className='text-center'>
                      <PieChart className='h-12 w-12 text-gray-400 mx-auto mb-2' />
                      <p className='text-gray-500'>
                        Gráfico de distribuição por tipo de procedimento
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>Alertas Recentes</h3>
                <Link to='/analytics/alerts' className='text-sm text-blue-600 hover:text-blue-500'>
                  Ver todos
                </Link>
              </div>
              <div className='divide-y divide-gray-200'>
                {alerts.map((alert) => (
                  <div key={alert.id} className='px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        {getSeverityIcon(alert.severity)}
                        <div className='ml-3'>
                          <p className='text-sm font-medium text-gray-900'>{alert.name}</p>
                          <p className='text-sm text-gray-500'>{alert.type} • {alert.triggered}</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getSeverityColor(alert.severity)
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <button className='text-gray-400 hover:text-gray-600'>
                          <Settings className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboards' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>Dashboards</h2>
              <div className='flex items-center space-x-3'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <input
                    type='text'
                    placeholder='Buscar dashboards...'
                    className='pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>
                <Filter className='h-5 w-5 text-gray-400 cursor-pointer' />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Dashboard Cards */}
              {[
                {
                  id: 1,
                  name: 'Dashboard Principal',
                  description: 'Visão geral completa da clínica',
                  widgets: 8,
                  lastUpdated: '2 horas atrás',
                  isPublic: true,
                },
                {
                  id: 2,
                  name: 'Análise Financeira',
                  description: 'Métricas financeiras detalhadas',
                  widgets: 12,
                  lastUpdated: '1 hora atrás',
                  isPublic: false,
                },
                {
                  id: 3,
                  name: 'Desempenho Clínico',
                  description: 'Resultados e satisfação dos pacientes',
                  widgets: 10,
                  lastUpdated: '3 horas atrás',
                  isPublic: false,
                },
              ].map((dashboard) => (
                <div
                  key={dashboard.id}
                  className='bg-white rounded-lg shadow hover:shadow-md transition-shadow'
                >
                  <div className='p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='text-lg font-medium text-gray-900'>{dashboard.name}</h3>
                      <div className='flex items-center space-x-2'>
                        {dashboard.isPublic && (
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            Público
                          </span>
                        )}
                        <button className='text-gray-400 hover:text-gray-600'>
                          <Edit className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                    <p className='text-sm text-gray-600 mb-4'>{dashboard.description}</p>
                    <div className='flex items-center justify-between text-sm text-gray-500'>
                      <span>{dashboard.widgets} widgets</span>
                      <span>Atualizado {dashboard.lastUpdated}</span>
                    </div>
                    <div className='mt-4 flex space-x-2'>
                      <Link
                        to={`/analytics/dashboard/${dashboard.id}`}
                        className='flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                      >
                        <Eye className='h-4 w-4 mr-2' />
                        Visualizar
                      </Link>
                      <button className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                        <Settings className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>KPIs e Métricas</h2>
              <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
                <Plus className='h-4 w-4 mr-2' />
                Nova KPI
              </button>
            </div>

            <div className='bg-white shadow rounded-lg'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center space-x-4'>
                  <select className='border border-gray-300 rounded-md px-3 py-2 text-sm'>
                    <option value='all'>Todas Categorias</option>
                    <option value='financial'>Financeiro</option>
                    <option value='operational'>Operacional</option>
                    <option value='patient'>Paciente</option>
                    <option value='clinical'>Clínico</option>
                  </select>
                  <select className='border border-gray-300 rounded-md px-3 py-2 text-sm'>
                    <option value='all'>Todos Status</option>
                    <option value='active'>Ativos</option>
                    <option value='inactive'>Inativos</option>
                  </select>
                </div>
              </div>
              <div className='divide-y divide-gray-200'>
                {[
                  {
                    id: 1,
                    name: 'Receita Total',
                    category: 'financial',
                    currentValue: 45230,
                    targetValue: 50000,
                    change: '+23%',
                    frequency: 'Diário',
                    isActive: true,
                  },
                  {
                    id: 2,
                    name: 'Taxa de Satisfação',
                    category: 'patient',
                    currentValue: 4.8,
                    targetValue: 4.5,
                    change: '+2%',
                    frequency: 'Semanal',
                    isActive: true,
                  },
                  {
                    id: 3,
                    name: 'Ocupação de Agenda',
                    category: 'operational',
                    currentValue: 87,
                    targetValue: 85,
                    change: '+5%',
                    frequency: 'Diário',
                    isActive: true,
                  },
                ].map((kpi) => (
                  <div key={kpi.id} className='px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center'>
                          <Target className='h-5 w-5 text-gray-400' />
                          <div className='ml-3'>
                            <p className='text-sm font-medium text-gray-900'>{kpi.name}</p>
                            <p className='text-sm text-gray-500'>
                              {kpi.category} • {kpi.frequency}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-medium text-gray-900'>
                            {kpi.currentValue} {kpi.name.includes('Receita')
                              ? 'R$'
                              : kpi.name.includes('Taxa')
                              ? ''
                              : '%'}
                          </p>
                          <p className='text-sm text-gray-500'>Meta: {kpi.targetValue}</p>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            {kpi.change}
                          </span>
                          {kpi.isActive
                            ? <CheckCircle className='h-4 w-4 text-green-500' />
                            : <XCircle className='h-4 w-4 text-red-500' />}
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button className='text-gray-400 hover:text-gray-600'>
                          <Edit className='h-4 w-4' />
                        </button>
                        <button className='text-gray-400 hover:text-red-600'>
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>Alertas e Notificações</h2>
              <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
                <Plus className='h-4 w-4 mr-2' />
                Novo Alerta
              </button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Alert Stats */}
              <div className='bg-white rounded-lg shadow p-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Status dos Alertas</h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Ativos</span>
                    <span className='text-sm font-medium text-gray-900'>24</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Disparados Hoje</span>
                    <span className='text-sm font-medium text-orange-600'>8</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Críticos</span>
                    <span className='text-sm font-medium text-red-600'>3</span>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className='lg:col-span-2 bg-white rounded-lg shadow'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-medium text-gray-900'>Alertas Recentes</h3>
                </div>
                <div className='divide-y divide-gray-200'>
                  {alerts.map((alert) => (
                    <div key={alert.id} className='px-6 py-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          {getSeverityIcon(alert.severity)}
                          <div className='ml-3'>
                            <p className='text-sm font-medium text-gray-900'>{alert.name}</p>
                            <p className='text-sm text-gray-500'>{alert.triggered}</p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getSeverityColor(alert.severity)
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <Settings className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>Relatórios Agendados</h2>
              <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
                <Plus className='h-4 w-4 mr-2' />
                Novo Relatório
              </button>
            </div>

            <div className='bg-white shadow rounded-lg'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <select className='border border-gray-300 rounded-md px-3 py-2 text-sm'>
                      <option value='all'>Todos Tipos</option>
                      <option value='financial'>Financeiro</option>
                      <option value='operational'>Operacional</option>
                      <option value='patient'>Paciente</option>
                    </select>
                    <select className='border border-gray-300 rounded-md px-3 py-2 text-sm'>
                      <option value='all'>Todos Status</option>
                      <option value='active'>Ativos</option>
                      <option value='inactive'>Inativos</option>
                    </select>
                  </div>
                  <button className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Atualizar
                  </button>
                </div>
              </div>
              <div className='divide-y divide-gray-200'>
                {reports.map((report) => (
                  <div key={report.id} className='px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center'>
                          <Download className='h-5 w-5 text-gray-400' />
                          <div className='ml-3'>
                            <p className='text-sm font-medium text-gray-900'>{report.name}</p>
                            <p className='text-sm text-gray-500'>{report.type}</p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm text-gray-600'>Última execução: {report.lastRun}</p>
                          <p className='text-sm text-gray-600'>Próxima: {report.nextRun}</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                          <Eye className='h-4 w-4 mr-2' />
                          Visualizar
                        </button>
                        <button className='text-gray-400 hover:text-gray-600'>
                          <Settings className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>Modelos Preditivos</h2>
              <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
                <Plus className='h-4 w-4 mr-2' />
                Novo Modelo
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {models.map((model) => (
                <div
                  key={model.id}
                  className='bg-white rounded-lg shadow hover:shadow-md transition-shadow'
                >
                  <div className='p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center'>
                        <Brain className='h-8 w-8 text-purple-600' />
                        <div className='ml-3'>
                          <h3 className='text-lg font-medium text-gray-900'>{model.name}</h3>
                          <p className='text-sm text-gray-500'>{model.type}</p>
                        </div>
                      </div>
                      <button className='text-gray-400 hover:text-gray-600'>
                        <Settings className='h-4 w-4' />
                      </button>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Acurácia</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {(model.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600'>Último Treinamento</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {model.lastTrained}
                        </span>
                      </div>
                    </div>
                    <div className='mt-4 flex space-x-2'>
                      <button className='flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700'>
                        <Zap className='h-4 w-4 mr-2' />
                        Prever
                      </button>
                      <button className='inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
                        <RefreshCw className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Predictions Section */}
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>Previsões em Destaque</h3>
              </div>
              <div className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='border border-gray-200 rounded-lg p-4'>
                    <h4 className='text-sm font-medium text-gray-900 mb-2'>
                      Previsão de Receita - Próximos 7 dias
                    </h4>
                    <div className='text-2xl font-bold text-green-600'>R$ 48.500</div>
                    <p className='text-sm text-gray-500'>+12% em relação à semana anterior</p>
                  </div>
                  <div className='border border-gray-200 rounded-lg p-4'>
                    <h4 className='text-sm font-medium text-gray-900 mb-2'>
                      Risco de Não Comparecimento - Amanhã
                    </h4>
                    <div className='text-2xl font-bold text-orange-600'>15%</div>
                    <p className='text-sm text-gray-500'>4 pacientes em risco</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exports' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>Exportação de Dados</h2>
              <button className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
                <Plus className='h-4 w-4 mr-2' />
                Nova Exportação
              </button>
            </div>

            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>Exportações Recentes</h3>
              </div>
              <div className='p-6'>
                <div className='text-center py-12'>
                  <Download className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Nenhuma exportação recente
                  </h3>
                  <p className='text-gray-500 mb-4'>
                    Crie sua primeira exportação de dados analytics
                  </p>
                  <button className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700'>
                    <Plus className='h-4 w-4 mr-2' />
                    Nova Exportação
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
