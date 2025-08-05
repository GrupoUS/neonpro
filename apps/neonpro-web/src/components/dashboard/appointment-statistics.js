'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStatistics = AppointmentStatistics;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function AppointmentStatistics(_a) {
    var appointments = _a.appointments, _b = _a.previousPeriodAppointments, previousPeriodAppointments = _b === void 0 ? [] : _b, className = _a.className;
    var statistics = (0, react_1.useMemo)(function () {
        // Current period stats
        var total = appointments.length;
        var completed = appointments.filter(function (apt) { return apt.status === 'completed'; }).length;
        var cancelled = appointments.filter(function (apt) { return apt.status === 'cancelled'; }).length;
        var noShow = appointments.filter(function (apt) { return apt.status === 'no_show'; }).length;
        var pending = appointments.filter(function (apt) { return apt.status === 'pending'; }).length;
        var confirmed = appointments.filter(function (apt) { return apt.status === 'confirmed'; }).length;
        // Revenue calculation
        var revenue = appointments
            .filter(function (apt) { return apt.status === 'completed'; })
            .reduce(function (sum, apt) { return sum + (apt.service.price || 0); }, 0);
        // Success rate
        var totalFinished = completed + cancelled + noShow;
        var successRate = totalFinished > 0 ? (completed / totalFinished) * 100 : 0;
        // No-show rate
        var noShowRate = totalFinished > 0 ? (noShow / totalFinished) * 100 : 0;
        // Previous period comparison
        var prevTotal = previousPeriodAppointments.length;
        var prevCompleted = previousPeriodAppointments.filter(function (apt) { return apt.status === 'completed'; }).length;
        var prevRevenue = previousPeriodAppointments
            .filter(function (apt) { return apt.status === 'completed'; })
            .reduce(function (sum, apt) { return sum + (apt.service.price || 0); }, 0);
        // Calculate trends
        var totalTrend = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
        var completedTrend = prevCompleted > 0 ? ((completed - prevCompleted) / prevCompleted) * 100 : 0;
        var revenueTrend = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
        return {
            total: total,
            completed: completed,
            cancelled: cancelled,
            noShow: noShow,
            pending: pending,
            confirmed: confirmed,
            revenue: revenue,
            successRate: successRate,
            noShowRate: noShowRate,
            trends: {
                total: totalTrend,
                completed: completedTrend,
                revenue: revenueTrend
            }
        };
    }, [appointments, previousPeriodAppointments]);
    var statCards = [
        {
            title: 'Total de Agendamentos',
            value: statistics.total,
            icon: lucide_react_1.Calendar,
            color: 'text-blue-600',
            trend: {
                value: Math.abs(statistics.trends.total),
                isPositive: statistics.trends.total >= 0,
                label: 'vs período anterior'
            },
            description: 'Agendamentos no período'
        },
        {
            title: 'Agendamentos Concluídos',
            value: statistics.completed,
            icon: lucide_react_1.CheckCircle,
            color: 'text-green-600',
            trend: {
                value: Math.abs(statistics.trends.completed),
                isPositive: statistics.trends.completed >= 0,
                label: 'vs período anterior'
            },
            description: 'Atendimentos realizados'
        },
        {
            title: 'Receita Gerada',
            value: "R$ ".concat(statistics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })),
            icon: lucide_react_1.DollarSign,
            color: 'text-green-600',
            trend: {
                value: Math.abs(statistics.trends.revenue),
                isPositive: statistics.trends.revenue >= 0,
                label: 'vs período anterior'
            },
            description: 'Receita dos atendimentos'
        },
        {
            title: 'Taxa de Sucesso',
            value: "".concat(statistics.successRate.toFixed(1), "%"),
            icon: lucide_react_1.Target,
            color: statistics.successRate >= 80 ? 'text-green-600' : statistics.successRate >= 60 ? 'text-yellow-600' : 'text-red-600',
            description: 'Atendimentos realizados com sucesso'
        },
        {
            title: 'Taxa de Não Comparecimento',
            value: "".concat(statistics.noShowRate.toFixed(1), "%"),
            icon: lucide_react_1.AlertTriangle,
            color: statistics.noShowRate <= 10 ? 'text-green-600' : statistics.noShowRate <= 20 ? 'text-yellow-600' : 'text-red-600',
            description: 'Pacientes que não compareceram'
        },
        {
            title: 'Pendentes de Confirmação',
            value: statistics.pending,
            icon: lucide_react_1.Clock,
            color: 'text-yellow-600',
            description: 'Aguardando confirmação'
        }
    ];
    var statusDistribution = [
        { status: 'completed', label: 'Concluídos', value: statistics.completed, color: 'bg-green-500' },
        { status: 'confirmed', label: 'Confirmados', value: statistics.confirmed, color: 'bg-blue-500' },
        { status: 'pending', label: 'Pendentes', value: statistics.pending, color: 'bg-yellow-500' },
        { status: 'cancelled', label: 'Cancelados', value: statistics.cancelled, color: 'bg-red-500' },
        { status: 'no_show', label: 'Não Compareceram', value: statistics.noShow, color: 'bg-red-400' }
    ].filter(function (item) { return item.value > 0; });
    return (<div className={(0, utils_1.cn)('space-y-6', className)}>
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(function (stat, index) {
            var Icon = stat.icon;
            return (<card_1.Card key={index}>
              <card_1.CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className={(0, utils_1.cn)('text-2xl font-bold', stat.color)}>
                      {stat.value}
                    </p>
                    {stat.description && (<p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>)}
                  </div>
                  <Icon className={(0, utils_1.cn)('h-8 w-8', stat.color)}/>
                </div>
                
                {stat.trend && (<div className="mt-4 flex items-center space-x-1">
                    {stat.trend.isPositive ? (<lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>) : (<lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>)}
                    <span className={(0, utils_1.cn)('text-sm font-medium', stat.trend.isPositive ? 'text-green-600' : 'text-red-600')}>
                      {stat.trend.isPositive ? '+' : '-'}{stat.trend.value.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stat.trend.label}
                    </span>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>);
        })}
      </div>

      {/* Status Distribution and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.PieChart className="h-5 w-5"/>
              Distribuição por Status
            </card_1.CardTitle>
            <card_1.CardDescription>
              Breakdown dos agendamentos por status atual
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {statusDistribution.map(function (item) { return (<div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={(0, utils_1.cn)('w-3 h-3 rounded-full', item.color)}/>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.value}</span>
                      <badge_1.Badge variant="outline">
                        {statistics.total > 0 ? ((item.value / statistics.total) * 100).toFixed(1) : 0}%
                      </badge_1.Badge>
                    </div>
                  </div>
                  <progress_1.Progress value={statistics.total > 0 ? (item.value / statistics.total) * 100 : 0} className="h-2"/>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Performance Metrics */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BarChart3 className="h-5 w-5"/>
              Métricas de Performance
            </card_1.CardTitle>
            <card_1.CardDescription>
              Indicadores de qualidade do atendimento
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-6">
              {/* Success Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Sucesso</span>
                  <span className="text-sm font-bold text-green-600">
                    {statistics.successRate.toFixed(1)}%
                  </span>
                </div>
                <progress_1.Progress value={statistics.successRate} className="h-2"/>
                <p className="text-xs text-muted-foreground">
                  Meta: ≥ 80% (
                  {statistics.successRate >= 80 ? (<span className="text-green-600">Atingida ✓</span>) : (<span className="text-red-600">
                      Faltam {(80 - statistics.successRate).toFixed(1)}%
                    </span>)}
                  )
                </p>
              </div>

              {/* No-Show Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Faltas</span>
                  <span className={(0, utils_1.cn)('text-sm font-bold', statistics.noShowRate <= 10 ? 'text-green-600' : 'text-red-600')}>
                    {statistics.noShowRate.toFixed(1)}%
                  </span>
                </div>
                <progress_1.Progress value={statistics.noShowRate} className="h-2"/>
                <p className="text-xs text-muted-foreground">
                  Meta: ≤ 10% (
                  {statistics.noShowRate <= 10 ? (<span className="text-green-600">Atingida ✓</span>) : (<span className="text-red-600">
                      Acima em {(statistics.noShowRate - 10).toFixed(1)}%
                    </span>)}
                  )
                </p>
              </div>

              {/* Confirmation Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Confirmação</span>
                  <span className="text-sm font-bold text-blue-600">
                    {statistics.total > 0 ? (((statistics.confirmed + statistics.completed) / statistics.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <progress_1.Progress value={statistics.total > 0 ? ((statistics.confirmed + statistics.completed) / statistics.total) * 100 : 0} className="h-2"/>
                <p className="text-xs text-muted-foreground">
                  {statistics.pending > 0 ? (<>
                      {statistics.pending} agendamento{statistics.pending !== 1 ? 's' : ''} pendente{statistics.pending !== 1 ? 's' : ''}
                    </>) : ('Todos os agendamentos confirmados')}
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
