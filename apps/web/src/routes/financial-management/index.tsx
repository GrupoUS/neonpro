import { createFileRoute, Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  Plus,
  Settings,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

export const Route = createFileRoute('/financial-management/')({
  component: FinancialManagementDashboard,
});

function FinancialManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Faturamento Mensal',
      value: 'R$ 156.890',
      change: '+23%',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Despesas',
      value: 'R$ 89.450',
      change: '+12%',
      icon: Building2,
      color: 'text-red-600',
    },
    {
      title: 'Lucro Líquido',
      value: 'R$ 67.440',
      change: '+35%',
      icon: DollarSign,
      color: 'text-blue-600',
    },
    {
      title: 'Faturas Pendentes',
      value: '24',
      change: '-8%',
      icon: FileText,
      color: 'text-orange-600',
    },
  ];

  const quickActions = [
    {
      title: 'Nova Fatura',
      description: 'Criar fatura para serviços',
      icon: FileText,
      href: '/financial-management/invoices/create',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Novo Pagamento',
      description: 'Registrar pagamento recebido',
      icon: CreditCard,
      href: '/financial-management/payments/create',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Preços',
      description: 'Gerenciar preços dos serviços',
      icon: Package,
      href: '/financial-management/pricing',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Metas',
      description: 'Definir metas financeiras',
      icon: Target,
      href: '/financial-management/goals',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const recentInvoices = [
    {
      id: '1',
      number: 'INV-000123',
      patient: 'Ana Silva',
      amount: 'R$ 2.500',
      status: 'paid',
      date: '2024-01-15',
    },
    {
      id: '2',
      number: 'INV-000124',
      patient: 'Carlos Santos',
      amount: 'R$ 1.800',
      status: 'pending',
      date: '2024-01-16',
    },
    {
      id: '3',
      number: 'INV-000125',
      patient: 'Maria Oliveira',
      amount: 'R$ 3.200',
      status: 'overdue',
      date: '2024-01-14',
    },
    {
      id: '4',
      number: 'INV-000126',
      patient: 'João Costa',
      amount: 'R$ 950',
      status: 'paid',
      date: '2024-01-17',
    },
  ];

  const topServices = [
    {
      name: 'Botox',
      revenue: 'R$ 45.200',
      count: 18,
      growth: '+12%',
    },
    {
      name: 'Preenchimento',
      revenue: 'R$ 38.900',
      count: 15,
      growth: '+8%',
    },
    {
      name: 'Limpeza de Pele',
      revenue: 'R$ 22.100',
      count: 25,
      growth: '+15%',
    },
    {
      name: 'Ácido Hialurônico',
      revenue: 'R$ 28.500',
      count: 12,
      growth: '+22%',
    },
  ];

  const financialGoals = [
    {
      name: 'Meta de Faturamento',
      target: 'R$ 180.000',
      current: 'R$ 156.890',
      progress: 87,
      status: 'active',
    },
    {
      name: 'Novos Pacientes',
      target: '50',
      current: '42',
      progress: 84,
      status: 'active',
    },
    {
      name: 'Ticket Médio',
      target: 'R$ 2.500',
      current: 'R$ 2.180',
      progress: 87,
      status: 'active',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Pago
          </span>
        );
      case 'pending':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            <Clock className='w-3 h-3 mr-1' />
            Pendente
          </span>
        );
      case 'overdue':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            <AlertTriangle className='w-3 h-3 mr-1' />
            Vencido
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            {status}
          </span>
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <DollarSign className='h-8 w-8 text-blue-600 mr-3' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Gestão Financeira
                </h1>
                <p className='text-sm text-gray-500'>
                  Controle financeiro completo para clínicas estéticas
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <Link
                to='/financial-management/settings'
                className='p-2 text-gray-400 hover:text-gray-500'
              >
                <Settings className='h-6 w-6' />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='bg-white border-b border-gray-200'>
        <nav className='px-4 sm:px-6 lg:px-8'>
          <div className='flex space-x-8'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <Link
              to='/financial-management/invoices'
              className='py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300'
            >
              Faturas
            </Link>
            <Link
              to='/financial-management/payments'
              className='py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300'
            >
              Pagamentos
            </Link>
            <Link
              to='/financial-management/pricing'
              className='py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300'
            >
              Preços
            </Link>
            <Link
              to='/financial-management/packages'
              className='py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300'
            >
              Pacotes
            </Link>
            <Link
              to='/financial-management/commissions'
              className='py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300'
            >
              Comissões
            </Link>
            <Link
              to='/financial-management/reports'
              className='py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300'
            >
              Relatórios
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className='p-6'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {stats.map((stat, index) => (
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

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Quick Actions */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Ações Rápidas
                </h3>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.href}
                      className='flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}
                      >
                        <action.icon className='h-5 w-5' />
                      </div>
                      <div className='ml-4 flex-1'>
                        <h4 className='text-sm font-medium text-gray-900'>
                          {action.title}
                        </h4>
                        <p className='text-sm text-gray-500'>
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className='h-5 w-5 text-gray-400' />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Goals */}
            <div className='bg-white rounded-lg shadow mt-6'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Metas Financeiras
                </h3>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {financialGoals.map((goal, index) => (
                    <div key={index}>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='text-sm font-medium text-gray-900'>
                          {goal.name}
                        </h4>
                        <span className='text-sm text-gray-500'>
                          {goal.progress}%
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
                        <div
                          className={`h-2 rounded-full ${
                            goal.progress >= 90
                              ? 'bg-green-600'
                              : goal.progress >= 70
                              ? 'bg-blue-600'
                              : 'bg-orange-600'
                          }`}
                          style={{ width: `${goal.progress}%` }}
                        >
                        </div>
                      </div>
                      <div className='flex justify-between text-xs text-gray-500'>
                        <span>{goal.current}</span>
                        <span>{goal.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices and Top Services */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Recent Invoices */}
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Faturas Recentes
                </h3>
                <Link
                  to='/financial-management/invoices'
                  className='text-sm text-blue-600 hover:text-blue-500'
                >
                  Ver todas
                </Link>
              </div>
              <div className='overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Número
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Paciente
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Valor
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {recentInvoices.map(invoice => (
                      <tr key={invoice.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {invoice.number}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {invoice.patient}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {invoice.amount}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm'>
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {invoice.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Services */}
            <div className='bg-white rounded-lg shadow'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Serviços Mais Rentáveis
                </h3>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {topServices.map((service, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0'>
                          <div className='h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center'>
                            <Package className='h-5 w-5 text-purple-600' />
                          </div>
                        </div>
                        <div className='ml-4'>
                          <h4 className='text-sm font-medium text-gray-900'>
                            {service.name}
                          </h4>
                          <p className='text-sm text-gray-500'>
                            {service.count} procedimentos
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium text-gray-900'>
                          {service.revenue}
                        </p>
                        <p className='text-sm text-green-600'>
                          {service.growth}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
