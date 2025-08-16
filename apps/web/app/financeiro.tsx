'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Filter,
  PieChart,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { CosmicGlowButton } from '@/components/ui/CosmicGlowButton';
import { NeonGradientCard } from '@/components/ui/NeonGradientCard';
import { formatCurrency, formatDate } from '@/lib/utils';

// Dados mock para financeiro
const financeiroData = {
  summary: {
    totalReceita: 127_500.0,
    receitaMensal: 45_200.0,
    contasReceber: 23_800.0,
    contasPagar: 8900.0,
    margemLucro: 68.5,
    crescimentoMensal: 12.3,
  },
  transactions: [
    {
      id: 1,
      type: 'receita',
      description: 'Consulta - Maria Silva',
      amount: 150.0,
      date: new Date('2024-01-15'),
      status: 'pago',
      category: 'Consultas',
      paymentMethod: 'Cartão de Crédito',
    },
    {
      id: 2,
      type: 'receita',
      description: 'Exame - João Santos',
      amount: 300.0,
      date: new Date('2024-01-14'),
      status: 'pendente',
      category: 'Exames',
      paymentMethod: 'PIX',
    },
    {
      id: 3,
      type: 'despesa',
      description: 'Equipamento Médico',
      amount: 2500.0,
      date: new Date('2024-01-13'),
      status: 'pago',
      category: 'Equipamentos',
      paymentMethod: 'Transferência',
    },
    {
      id: 4,
      type: 'receita',
      description: 'Cirurgia - Ana Costa',
      amount: 1200.0,
      date: new Date('2024-01-12'),
      status: 'pago',
      category: 'Cirurgias',
      paymentMethod: 'Dinheiro',
    },
    {
      id: 5,
      type: 'despesa',
      description: 'Aluguel Clínica',
      amount: 3500.0,
      date: new Date('2024-01-10'),
      status: 'vencido',
      category: 'Operacionais',
      paymentMethod: 'Boleto',
    },
  ],
  monthlyData: [
    { month: 'Jan', receita: 45_200, despesa: 18_500 },
    { month: 'Fev', receita: 42_800, despesa: 16_200 },
    { month: 'Mar', receita: 48_600, despesa: 19_800 },
    { month: 'Abr', receita: 51_200, despesa: 21_000 },
    { month: 'Mai', receita: 49_800, despesa: 20_200 },
    { month: 'Jun', receita: 53_400, despesa: 22_100 },
  ],
};

const statusConfig = {
  pago: {
    color: 'success',
    icon: CheckCircle,
    label: 'Pago',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    textColor: 'text-success',
  },
  pendente: {
    color: 'warning',
    icon: Clock,
    label: 'Pendente',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    textColor: 'text-warning',
  },
  vencido: {
    color: 'danger',
    icon: XCircle,
    label: 'Vencido',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    textColor: 'text-danger',
  },
  cancelado: {
    color: 'danger',
    icon: AlertTriangle,
    label: 'Cancelado',
    bgColor: 'bg-danger/10',
    borderColor: 'border-danger/30',
    textColor: 'text-danger',
  },
};

const typeConfig = {
  receita: {
    color: 'success',
    gradient: 'success',
    icon: TrendingUp,
    label: 'Receita',
  },
  despesa: {
    color: 'danger',
    gradient: 'danger',
    icon: TrendingDown,
    label: 'Despesa',
  },
};

const TransactionCard = ({ transaction, index }) => {
  const statusInfo = statusConfig[transaction.status];
  const typeInfo = typeConfig[transaction.type];
  const StatusIcon = statusInfo.icon;
  const TypeIcon = typeInfo.icon;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: {
          duration: 0.2,
          type: 'spring',
          stiffness: 400,
          damping: 17,
        },
      }}
    >
      <NeonGradientCard className="group" gradient={typeInfo.gradient}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`h-12 w-12 rounded-full bg-${typeInfo.color}/20 flex items-center justify-center`}
            >
              <TypeIcon className={`h-6 w-6 text-${typeInfo.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                {transaction.description}
              </h3>
              <p className="text-gray-400 text-sm">{transaction.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-bold text-2xl ${transaction.type === 'receita' ? 'text-success' : 'text-danger'}`}
            >
              {transaction.type === 'receita' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
            <div
              className={`mt-1 inline-flex rounded-full px-2 py-1 font-medium text-xs ${statusInfo.bgColor} ${statusInfo.borderColor} border`}
            >
              <StatusIcon className={`mr-1 h-3 w-3 ${statusInfo.textColor}`} />
              <span className={statusInfo.textColor}>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <Calendar className="h-4 w-4 text-accent" />
              <span className="text-sm">{formatDate(transaction.date)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <CreditCard className="h-4 w-4 text-accent" />
              <span className="text-sm">{transaction.paymentMethod}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <CosmicGlowButton className="flex-1" size="sm" variant="primary">
            Detalhes
          </CosmicGlowButton>
          <CosmicGlowButton className="flex-1" size="sm" variant="secondary">
            Editar
          </CosmicGlowButton>
          {transaction.status === 'pendente' && (
            <CosmicGlowButton className="flex-1" size="sm" variant="success">
              Confirmar
            </CosmicGlowButton>
          )}
        </div>
      </NeonGradientCard>
    </motion.div>
  );
};

const FinancialCard = ({
  icon: Icon,
  title,
  value,
  change,
  gradient,
  subtitle,
}) => (
  <NeonGradientCard className="group" gradient={gradient}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="font-medium text-gray-400 text-sm">{title}</p>
        <motion.p
          animate={{ scale: 1 }}
          className="font-bold text-3xl text-white"
          initial={{ scale: 0.8 }}
          transition={{ delay: 0.2 }}
        >
          {typeof value === 'number' ? formatCurrency(value) : `${value}%`}
        </motion.p>
        {change && (
          <div className="flex items-center space-x-1">
            <TrendingUp
              className={`h-4 w-4 ${change > 0 ? 'text-success' : 'text-danger'}`}
            />
            <span
              className={`font-medium text-sm ${change > 0 ? 'text-success' : 'text-danger'}`}
            >
              {change > 0 ? '+' : ''}
              {change}%
            </span>
            <span className="text-gray-400 text-xs">este mês</span>
          </div>
        )}
        {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
      </div>
      <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
        <Icon className="h-8 w-8 text-accent" />
      </div>
    </div>
  </NeonGradientCard>
);

export default function Financeiro() {
  const [filterType, setFilterType] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPeriod, setFilterPeriod] = useState('mes');

  const filteredTransactions = financeiroData.transactions.filter(
    (transaction) => {
      const matchesType =
        filterType === 'todos' || transaction.type === filterType;
      const matchesStatus =
        filterStatus === 'todos' || transaction.status === filterStatus;
      return matchesType && matchesStatus;
    },
  );

  const totalReceitas = filteredTransactions
    .filter((t) => t.type === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = filteredTransactions
    .filter((t) => t.type === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  return (
    <div className="min-h-screen animate-background-position-spin bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
        >
          <h1 className="mb-2 font-bold text-4xl text-white">
            Financeiro NEONPROV1
          </h1>
          <p className="text-gray-400">
            Controle financeiro completo da clínica
          </p>
        </motion.div>

        {/* Resumo Financeiro */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FinancialCard
            change={financeiroData.summary.crescimentoMensal}
            gradient="success"
            icon={DollarSign}
            title="Receita Total"
            value={financeiroData.summary.totalReceita}
          />
          <FinancialCard
            change={8.5}
            gradient="primary"
            icon={TrendingUp}
            title="Receita Mensal"
            value={financeiroData.summary.receitaMensal}
          />
          <FinancialCard
            gradient="warning"
            icon={Receipt}
            subtitle="Valores pendentes"
            title="Contas a Receber"
            value={financeiroData.summary.contasReceber}
          />
          <FinancialCard
            gradient="danger"
            icon={CreditCard}
            subtitle="Valores em aberto"
            title="Contas a Pagar"
            value={financeiroData.summary.contasPagar}
          />
        </div>

        {/* Saldo Líquido */}
        <div className="mb-8">
          <NeonGradientCard
            className="text-center"
            gradient={saldoLiquido >= 0 ? 'success' : 'danger'}
          >
            <div className="flex items-center justify-center space-x-4">
              <div className="rounded-full bg-white/10 p-4">
                <PieChart className="h-12 w-12 text-accent" />
              </div>
              <div>
                <p className="mb-1 text-gray-400 text-sm">
                  Saldo Líquido (Período Filtrado)
                </p>
                <motion.p
                  animate={{ scale: 1 }}
                  className={`font-bold text-4xl ${saldoLiquido >= 0 ? 'text-success' : 'text-danger'}`}
                  initial={{ scale: 0.8 }}
                  transition={{ delay: 0.3 }}
                >
                  {formatCurrency(saldoLiquido)}
                </motion.p>
                <p className="text-gray-400 text-sm">
                  Receitas: {formatCurrency(totalReceitas)} | Despesas:{' '}
                  {formatCurrency(totalDespesas)}
                </p>
              </div>
            </div>
          </NeonGradientCard>
        </div>

        {/* Controles de filtro */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
          <NeonGradientCard gradient="primary">
            <div className="relative">
              <Filter className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <select
                className="w-full appearance-none rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                onChange={(e) => setFilterType(e.target.value)}
                value={filterType}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>
          </NeonGradientCard>

          <NeonGradientCard gradient="secondary">
            <div className="relative">
              <CheckCircle className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <select
                className="w-full appearance-none rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                onChange={(e) => setFilterStatus(e.target.value)}
                value={filterStatus}
              >
                <option value="todos">Todos os Status</option>
                <option value="pago">Pagos</option>
                <option value="pendente">Pendentes</option>
                <option value="vencido">Vencidos</option>
              </select>
            </div>
          </NeonGradientCard>

          <NeonGradientCard gradient="accent">
            <div className="relative">
              <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <select
                className="w-full appearance-none rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                onChange={(e) => setFilterPeriod(e.target.value)}
                value={filterPeriod}
              >
                <option value="mes">Este Mês</option>
                <option value="trimestre">Trimestre</option>
                <option value="ano">Este Ano</option>
                <option value="todos">Todos</option>
              </select>
            </div>
          </NeonGradientCard>

          <CosmicGlowButton
            className="flex h-full items-center justify-center"
            variant="success"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova Transação
          </CosmicGlowButton>

          <CosmicGlowButton
            className="flex h-full items-center justify-center"
            variant="warning"
          >
            <Download className="mr-2 h-5 w-5" />
            Exportar
          </CosmicGlowButton>
        </div>

        {/* Lista de transações */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => (
              <TransactionCard
                index={index}
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredTransactions.length === 0 && (
          <motion.div
            animate={{ opacity: 1 }}
            className="py-12 text-center"
            initial={{ opacity: 0 }}
          >
            <NeonGradientCard className="mx-auto max-w-md" gradient="primary">
              <BarChart3 className="mx-auto mb-4 h-16 w-16 text-accent" />
              <h3 className="mb-2 font-semibold text-white text-xl">
                Nenhuma transação encontrada
              </h3>
              <p className="mb-4 text-gray-400">
                Não há transações que correspondam aos filtros selecionados.
              </p>
              <CosmicGlowButton variant="primary">
                Adicionar Transação
              </CosmicGlowButton>
            </NeonGradientCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
