'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Financeiro;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var NeonGradientCard_1 = require("@/components/ui/NeonGradientCard");
var CosmicGlowButton_1 = require("@/components/ui/CosmicGlowButton");
var utils_1 = require("@/lib/utils");
// Dados mock para financeiro
var financeiroData = {
    summary: {
        totalReceita: 127500.00,
        receitaMensal: 45200.00,
        contasReceber: 23800.00,
        contasPagar: 8900.00,
        margemLucro: 68.5,
        crescimentoMensal: 12.3
    },
    transactions: [
        {
            id: 1,
            type: 'receita',
            description: 'Consulta - Maria Silva',
            amount: 150.00,
            date: new Date('2024-01-15'),
            status: 'pago',
            category: 'Consultas',
            paymentMethod: 'Cartão de Crédito'
        },
        {
            id: 2,
            type: 'receita',
            description: 'Exame - João Santos',
            amount: 300.00,
            date: new Date('2024-01-14'),
            status: 'pendente',
            category: 'Exames',
            paymentMethod: 'PIX'
        },
        {
            id: 3,
            type: 'despesa',
            description: 'Equipamento Médico',
            amount: 2500.00,
            date: new Date('2024-01-13'),
            status: 'pago',
            category: 'Equipamentos',
            paymentMethod: 'Transferência'
        },
        {
            id: 4,
            type: 'receita',
            description: 'Cirurgia - Ana Costa',
            amount: 1200.00,
            date: new Date('2024-01-12'),
            status: 'pago',
            category: 'Cirurgias',
            paymentMethod: 'Dinheiro'
        },
        {
            id: 5,
            type: 'despesa',
            description: 'Aluguel Clínica',
            amount: 3500.00,
            date: new Date('2024-01-10'),
            status: 'vencido',
            category: 'Operacionais',
            paymentMethod: 'Boleto'
        }
    ],
    monthlyData: [
        { month: 'Jan', receita: 45200, despesa: 18500 },
        { month: 'Fev', receita: 42800, despesa: 16200 },
        { month: 'Mar', receita: 48600, despesa: 19800 },
        { month: 'Abr', receita: 51200, despesa: 21000 },
        { month: 'Mai', receita: 49800, despesa: 20200 },
        { month: 'Jun', receita: 53400, despesa: 22100 }
    ]
};
var statusConfig = {
    pago: {
        color: 'success',
        icon: lucide_react_1.CheckCircle,
        label: 'Pago',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/30',
        textColor: 'text-success'
    },
    pendente: {
        color: 'warning',
        icon: lucide_react_1.Clock,
        label: 'Pendente',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/30',
        textColor: 'text-warning'
    },
    vencido: {
        color: 'danger',
        icon: lucide_react_1.XCircle,
        label: 'Vencido',
        bgColor: 'bg-danger/10',
        borderColor: 'border-danger/30',
        textColor: 'text-danger'
    },
    cancelado: {
        color: 'danger',
        icon: lucide_react_1.AlertTriangle,
        label: 'Cancelado',
        bgColor: 'bg-danger/10',
        borderColor: 'border-danger/30',
        textColor: 'text-danger'
    }
};
var typeConfig = {
    receita: {
        color: 'success',
        gradient: 'success',
        icon: lucide_react_1.TrendingUp,
        label: 'Receita'
    },
    despesa: {
        color: 'danger',
        gradient: 'danger',
        icon: lucide_react_1.TrendingDown,
        label: 'Despesa'
    }
};
var TransactionCard = function (_a) {
    var transaction = _a.transaction, index = _a.index;
    var statusInfo = statusConfig[transaction.status];
    var typeInfo = typeConfig[transaction.type];
    var StatusIcon = statusInfo.icon;
    var TypeIcon = typeInfo.icon;
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{
            scale: 1.02,
            y: -5,
            transition: {
                duration: 0.2,
                type: 'spring',
                stiffness: 400,
                damping: 17
            }
        }}>
      <NeonGradientCard_1.NeonGradientCard gradient={typeInfo.gradient} className="group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={"w-12 h-12 rounded-full bg-".concat(typeInfo.color, "/20 flex items-center justify-center")}>
              <TypeIcon className={"h-6 w-6 text-".concat(typeInfo.color)}/>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{transaction.description}</h3>
              <p className="text-gray-400 text-sm">{transaction.category}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={"text-2xl font-bold ".concat(transaction.type === 'receita' ? 'text-success' : 'text-danger')}>
              {transaction.type === 'receita' ? '+' : '-'}{(0, utils_1.formatCurrency)(transaction.amount)}
            </p>
            <div className={"inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ".concat(statusInfo.bgColor, " ").concat(statusInfo.borderColor, " border")}>
              <StatusIcon className={"h-3 w-3 mr-1 ".concat(statusInfo.textColor)}/>
              <span className={statusInfo.textColor}>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <lucide_react_1.Calendar className="h-4 w-4 text-accent"/>
              <span className="text-sm">{(0, utils_1.formatDate)(transaction.date)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-300">
              <lucide_react_1.CreditCard className="h-4 w-4 text-accent"/>
              <span className="text-sm">{transaction.paymentMethod}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <CosmicGlowButton_1.CosmicGlowButton variant="primary" size="sm" className="flex-1">
            Detalhes
          </CosmicGlowButton_1.CosmicGlowButton>
          <CosmicGlowButton_1.CosmicGlowButton variant="secondary" size="sm" className="flex-1">
            Editar
          </CosmicGlowButton_1.CosmicGlowButton>
          {transaction.status === 'pendente' && (<CosmicGlowButton_1.CosmicGlowButton variant="success" size="sm" className="flex-1">
              Confirmar
            </CosmicGlowButton_1.CosmicGlowButton>)}
        </div>
      </NeonGradientCard_1.NeonGradientCard>
    </framer_motion_1.motion.div>);
};
var FinancialCard = function (_a) {
    var Icon = _a.icon, title = _a.title, value = _a.value, change = _a.change, gradient = _a.gradient, subtitle = _a.subtitle;
    return (<NeonGradientCard_1.NeonGradientCard gradient={gradient} className="group">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <framer_motion_1.motion.p className="text-3xl font-bold text-white" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
          {typeof value === 'number' ? (0, utils_1.formatCurrency)(value) : "".concat(value, "%")}
        </framer_motion_1.motion.p>
        {change && (<div className="flex items-center space-x-1">
            <lucide_react_1.TrendingUp className={"h-4 w-4 ".concat(change > 0 ? 'text-success' : 'text-danger')}/>
            <span className={"text-sm font-medium ".concat(change > 0 ? 'text-success' : 'text-danger')}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-gray-400 text-xs">este mês</span>
          </div>)}
        {subtitle && (<p className="text-gray-400 text-xs">{subtitle}</p>)}
      </div>
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
        <Icon className="h-8 w-8 text-accent"/>
      </div>
    </div>
  </NeonGradientCard_1.NeonGradientCard>);
};
function Financeiro() {
    var _a = (0, react_1.useState)('todos'), filterType = _a[0], setFilterType = _a[1];
    var _b = (0, react_1.useState)('todos'), filterStatus = _b[0], setFilterStatus = _b[1];
    var _c = (0, react_1.useState)('mes'), filterPeriod = _c[0], setFilterPeriod = _c[1];
    var filteredTransactions = financeiroData.transactions.filter(function (transaction) {
        var matchesType = filterType === 'todos' || transaction.type === filterType;
        var matchesStatus = filterStatus === 'todos' || transaction.status === filterStatus;
        return matchesType && matchesStatus;
    });
    var totalReceitas = filteredTransactions
        .filter(function (t) { return t.type === 'receita' && t.status === 'pago'; })
        .reduce(function (sum, t) { return sum + t.amount; }, 0);
    var totalDespesas = filteredTransactions
        .filter(function (t) { return t.type === 'despesa' && t.status === 'pago'; })
        .reduce(function (sum, t) { return sum + t.amount; }, 0);
    var saldoLiquido = totalReceitas - totalDespesas;
    return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-background-position-spin">
      <div className="container mx-auto px-6 py-8">
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Financeiro NEONPROV1
          </h1>
          <p className="text-gray-400">
            Controle financeiro completo da clínica
          </p>
        </framer_motion_1.motion.div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FinancialCard icon={lucide_react_1.DollarSign} title="Receita Total" value={financeiroData.summary.totalReceita} change={financeiroData.summary.crescimentoMensal} gradient="success"/>
          <FinancialCard icon={lucide_react_1.TrendingUp} title="Receita Mensal" value={financeiroData.summary.receitaMensal} change={8.5} gradient="primary"/>
          <FinancialCard icon={lucide_react_1.Receipt} title="Contas a Receber" value={financeiroData.summary.contasReceber} gradient="warning" subtitle="Valores pendentes"/>
          <FinancialCard icon={lucide_react_1.CreditCard} title="Contas a Pagar" value={financeiroData.summary.contasPagar} gradient="danger" subtitle="Valores em aberto"/>
        </div>

        {/* Saldo Líquido */}
        <div className="mb-8">
          <NeonGradientCard_1.NeonGradientCard gradient={saldoLiquido >= 0 ? 'success' : 'danger'} className="text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-4 rounded-full bg-white/10">
                <lucide_react_1.PieChart className="h-12 w-12 text-accent"/>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Saldo Líquido (Período Filtrado)</p>
                <framer_motion_1.motion.p className={"text-4xl font-bold ".concat(saldoLiquido >= 0 ? 'text-success' : 'text-danger')} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                  {(0, utils_1.formatCurrency)(saldoLiquido)}
                </framer_motion_1.motion.p>
                <p className="text-gray-400 text-sm">
                  Receitas: {(0, utils_1.formatCurrency)(totalReceitas)} | Despesas: {(0, utils_1.formatCurrency)(totalDespesas)}
                </p>
              </div>
            </div>
          </NeonGradientCard_1.NeonGradientCard>
        </div>

        {/* Controles de filtro */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <NeonGradientCard_1.NeonGradientCard gradient="primary">
            <div className="relative">
              <lucide_react_1.Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <select value={filterType} onChange={function (e) { return setFilterType(e.target.value); }} className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                <option value="todos">Todos os Tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>
          </NeonGradientCard_1.NeonGradientCard>

          <NeonGradientCard_1.NeonGradientCard gradient="secondary">
            <div className="relative">
              <lucide_react_1.CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <select value={filterStatus} onChange={function (e) { return setFilterStatus(e.target.value); }} className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                <option value="todos">Todos os Status</option>
                <option value="pago">Pagos</option>
                <option value="pendente">Pendentes</option>
                <option value="vencido">Vencidos</option>
              </select>
            </div>
          </NeonGradientCard_1.NeonGradientCard>

          <NeonGradientCard_1.NeonGradientCard gradient="accent">
            <div className="relative">
              <lucide_react_1.Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <select value={filterPeriod} onChange={function (e) { return setFilterPeriod(e.target.value); }} className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                <option value="mes">Este Mês</option>
                <option value="trimestre">Trimestre</option>
                <option value="ano">Este Ano</option>
                <option value="todos">Todos</option>
              </select>
            </div>
          </NeonGradientCard_1.NeonGradientCard>

          <CosmicGlowButton_1.CosmicGlowButton variant="success" className="h-full flex items-center justify-center">
            <lucide_react_1.Plus className="h-5 w-5 mr-2"/>
            Nova Transação
          </CosmicGlowButton_1.CosmicGlowButton>

          <CosmicGlowButton_1.CosmicGlowButton variant="warning" className="h-full flex items-center justify-center">
            <lucide_react_1.Download className="h-5 w-5 mr-2"/>
            Exportar
          </CosmicGlowButton_1.CosmicGlowButton>
        </div>

        {/* Lista de transações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <framer_motion_1.AnimatePresence>
            {filteredTransactions.map(function (transaction, index) { return (<TransactionCard key={transaction.id} transaction={transaction} index={index}/>); })}
          </framer_motion_1.AnimatePresence>
        </div>

        {filteredTransactions.length === 0 && (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <NeonGradientCard_1.NeonGradientCard gradient="primary" className="max-w-md mx-auto">
              <lucide_react_1.BarChart3 className="h-16 w-16 text-accent mx-auto mb-4"/>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-gray-400 mb-4">
                Não há transações que correspondam aos filtros selecionados.
              </p>
              <CosmicGlowButton_1.CosmicGlowButton variant="primary">
                Adicionar Transação
              </CosmicGlowButton_1.CosmicGlowButton>
            </NeonGradientCard_1.NeonGradientCard>
          </framer_motion_1.motion.div>)}
      </div>
    </div>);
}
