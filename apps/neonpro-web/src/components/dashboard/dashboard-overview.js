"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardOverview = DashboardOverview;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var utils_1 = require("@/lib/utils");
function KPICard(_a) {
  var title = _a.title,
    value = _a.value,
    change = _a.change,
    Icon = _a.icon,
    description = _a.description;
  return (
    <card_1.Card className="medical-card">
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">{title}</card_1.CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {change.type === "increase"
              ? <lucide_react_1.TrendingUp className="h-3 w-3 text-green-500" />
              : <lucide_react_1.TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={change.type === "increase" ? "text-green-600" : "text-red-600"}>
              {change.value}
            </span>
            {change.period}
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </card_1.CardContent>
    </card_1.Card>
  );
}
function DashboardOverview() {
  var _a = (0, react_1.useState)("7d"),
    selectedPeriod = _a[0],
    setSelectedPeriod = _a[1];
  // Mock data - replace with real API calls
  var kpiData = {
    totalPatients: 1247,
    monthlyRevenue: 89750,
    todayAppointments: 12,
    patientSatisfaction: 4.8,
    averageTicket: 435,
    conversionRate: 78,
  };
  var recentActivities = [
    {
      id: "1",
      type: "appointment",
      title: "Nova consulta agendada",
      description: "Maria Silva - Botox facial - 14:30",
      time: "5 min atrás",
      status: "pending",
    },
    {
      id: "2",
      type: "payment",
      title: "Pagamento recebido",
      description: "João Costa - R$ 890,00 - Preenchimento labial",
      time: "15 min atrás",
      status: "completed",
    },
    {
      id: "3",
      type: "patient",
      title: "Novo paciente cadastrado",
      description: "Ana Rodrigues - 28 anos - Indicação de paciente",
      time: "32 min atrás",
    },
    {
      id: "4",
      type: "alert",
      title: "Estoque baixo",
      description: "Ácido hialurônico - Restam apenas 3 unidades",
      time: "1h atrás",
    },
  ];
  var upcomingAppointments = [
    {
      id: "1",
      patient_name: "Maria Silva",
      service: "Botox facial",
      time: "14:30",
      status: "confirmed",
      is_new_patient: false,
    },
    {
      id: "2",
      patient_name: "Carlos Oliveira",
      service: "Preenchimento labial",
      time: "15:15",
      status: "confirmed",
      is_new_patient: true,
    },
    {
      id: "3",
      patient_name: "Ana Rodrigues",
      service: "Consulta avaliação",
      time: "16:00",
      status: "pending",
      is_new_patient: true,
    },
    {
      id: "4",
      patient_name: "Patricia Lima",
      service: "Limpeza de pele",
      time: "16:45",
      status: "confirmed",
      is_new_patient: false,
    },
  ];
  var getActivityIcon = function (type, status) {
    switch (type) {
      case "appointment":
        return status === "completed" ? lucide_react_1.CheckCircle2 : lucide_react_1.Calendar;
      case "payment":
        return lucide_react_1.DollarSign;
      case "patient":
        return lucide_react_1.Users;
      case "alert":
        return lucide_react_1.AlertCircle;
      default:
        return lucide_react_1.Activity;
    }
  };
  var getStatusBadge = function (status) {
    switch (status) {
      case "confirmed":
        return (
          <badge_1.Badge variant="default" className="bg-green-100 text-green-800">
            Confirmado
          </badge_1.Badge>
        );
      case "pending":
        return <badge_1.Badge variant="secondary">Pendente</badge_1.Badge>;
      case "cancelled":
        return <badge_1.Badge variant="destructive">Cancelado</badge_1.Badge>;
      default:
        return null;
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica estética - {(0, utils_1.formatDate)(new Date())}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select_1.Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <select_1.SelectTrigger className="w-32">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="1d">Hoje</select_1.SelectItem>
              <select_1.SelectItem value="7d">7 dias</select_1.SelectItem>
              <select_1.SelectItem value="30d">30 dias</select_1.SelectItem>
              <select_1.SelectItem value="90d">90 dias</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <button_1.Button>
            <lucide_react_1.Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </button_1.Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Pacientes"
          value={kpiData.totalPatients.toLocaleString("pt-BR")}
          change={{
            type: "increase",
            value: "+12%",
            period: "vs. mês anterior",
          }}
          icon={lucide_react_1.Users}
          description="Pacientes ativos na base"
        />

        <KPICard
          title="Receita Mensal"
          value={(0, utils_1.formatCurrency)(kpiData.monthlyRevenue)}
          change={{
            type: "increase",
            value: "+8.2%",
            period: "vs. mês anterior",
          }}
          icon={lucide_react_1.DollarSign}
          description="Faturamento do mês atual"
        />

        <KPICard
          title="Agendamentos Hoje"
          value={kpiData.todayAppointments}
          icon={lucide_react_1.Calendar}
          description="Consultas e procedimentos"
        />

        <KPICard
          title="Satisfação"
          value={"".concat(kpiData.patientSatisfaction, "/5.0")}
          change={{
            type: "increase",
            value: "+0.2",
            period: "vs. mês anterior",
          }}
          icon={lucide_react_1.Star}
          description="Avaliação média dos pacientes"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <card_1.Card className="medical-card">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-sm font-medium">Ticket Médio</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(0, utils_1.formatCurrency)(kpiData.averageTicket)}
            </div>
            <div className="mt-2">
              <progress_1.Progress value={72} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Meta mensal: {(0, utils_1.formatCurrency)(600)}
              </p>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="medical-card">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-sm font-medium">Taxa de Conversão</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{kpiData.conversionRate}%</div>
            <div className="mt-2">
              <progress_1.Progress value={kpiData.conversionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Consultas → Procedimentos</p>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="medical-card">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-sm font-medium">Ocupação Agenda</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="mt-2">
              <progress_1.Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Horários preenchidos esta semana</p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <card_1.Card className="medical-card">
            <card_1.CardHeader className="flex flex-row items-center justify-between">
              <div>
                <card_1.CardTitle>Atividades Recentes</card_1.CardTitle>
                <card_1.CardDescription>Últimas movimentações da clínica</card_1.CardDescription>
              </div>
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Filter className="w-4 h-4 mr-2" />
                Filtrar
              </button_1.Button>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {recentActivities.map(function (activity) {
                var IconComponent = getActivityIcon(activity.type, activity.status);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    {activity.status && (
                      <div className="flex-shrink-0">{getStatusBadge(activity.status)}</div>
                    )}
                  </div>
                );
              })}
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Today's Appointments */}
        <div>
          <card_1.Card className="medical-card">
            <card_1.CardHeader className="flex flex-row items-center justify-between">
              <div>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Clock className="w-4 h-4" />
                  Agenda de Hoje
                </card_1.CardTitle>
                <card_1.CardDescription>
                  {upcomingAppointments.length} agendamentos
                </card_1.CardDescription>
              </div>
              <button_1.Button variant="outline" size="sm">
                Ver Todos
              </button_1.Button>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              {upcomingAppointments.map(function (appointment) {
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {appointment.patient_name}
                        </p>
                        {appointment.is_new_patient && (
                          <badge_1.Badge variant="secondary" className="text-xs">
                            Novo
                          </badge_1.Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                      <p className="text-xs text-muted-foreground">{appointment.time}</p>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(appointment.status)}</div>
                  </div>
                );
              })}

              <div className="pt-4 border-t">
                <button_1.Button variant="outline" className="w-full" size="sm">
                  <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>

      {/* Quick Actions */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <card_1.CardTitle>Ações Rápidas</card_1.CardTitle>
          <card_1.CardDescription>
            Acesso rápido às funcionalidades mais utilizadas
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button_1.Button variant="outline" className="h-20 flex-col gap-2">
              <lucide_react_1.Users className="w-6 h-6" />
              <span className="text-sm">Novo Paciente</span>
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex-col gap-2">
              <lucide_react_1.Calendar className="w-6 h-6" />
              <span className="text-sm">Agendar Consulta</span>
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex-col gap-2">
              <lucide_react_1.Activity className="w-6 h-6" />
              <span className="text-sm">Novo Prontuário</span>
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex-col gap-2">
              <lucide_react_1.DollarSign className="w-6 h-6" />
              <span className="text-sm">Registrar Pagamento</span>
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
