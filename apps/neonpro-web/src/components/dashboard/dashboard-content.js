"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardContent = DashboardContent;
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
function DashboardContent(_a) {
    var _b, _c;
    var user = _a.user;
    // Mock data - em produção, estes dados viriam de uma API
    var stats = {
        totalPatients: 1247,
        todayAppointments: 12,
        monthlyRevenue: 45680,
        activePatients: 892,
        pendingAppointments: 5,
        completedToday: 7,
    };
    var recentAppointments = [
        {
            id: 1,
            patient: "João Silva",
            time: "09:00",
            type: "Consulta",
            status: "confirmed",
        },
        {
            id: 2,
            patient: "Maria Santos",
            time: "10:30",
            type: "Retorno",
            status: "completed",
        },
        {
            id: 3,
            patient: "Pedro Costa",
            time: "14:00",
            type: "Consulta",
            status: "pending",
        },
        {
            id: 4,
            patient: "Ana Oliveira",
            time: "15:30",
            type: "Exame",
            status: "confirmed",
        },
    ];
    var getStatusBadge = function (status) {
        switch (status) {
            case "confirmed":
                return <badge_1.Badge variant="default">Confirmado</badge_1.Badge>;
            case "completed":
                return <badge_1.Badge variant="secondary">Concluído</badge_1.Badge>;
            case "pending":
                return <badge_1.Badge variant="outline">Pendente</badge_1.Badge>;
            default:
                return <badge_1.Badge variant="outline">{status}</badge_1.Badge>;
        }
    };
    return (<div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Olá, {((_b = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _b === void 0 ? void 0 : _b.full_name) || ((_c = user === null || user === void 0 ? void 0 : user.email) === null || _c === void 0 ? void 0 : _c.split('@')[0])}!
          </h2>
          <p className="text-muted-foreground">
            Aqui está um resumo da sua clínica hoje.
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button>
            <lucide_react_1.CalendarPlus className="mr-2 h-4 w-4"/>
            Nova Consulta
          </button_1.Button>
          <button_1.Button variant="outline">
            <lucide_react_1.UserPlus className="mr-2 h-4 w-4"/>
            Novo Paciente
          </button_1.Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Total de Pacientes
            </card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> em relação ao mês passado
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Consultas Hoje
            </card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedToday} concluídas, {stats.pendingAppointments} pendentes
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Receita Mensal
            </card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> em relação ao mês passado
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Pacientes Ativos
            </card_1.CardTitle>
            <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.activePatients}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes com consultas nos últimos 30 dias
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Appointments Today */}
        <card_1.Card className="col-span-4">
          <card_1.CardHeader>
            <card_1.CardTitle>Agendamentos de Hoje</card_1.CardTitle>
            <card_1.CardDescription>
              Suas consultas programadas para hoje
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {recentAppointments.map(function (appointment) { return (<div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <lucide_react_1.Clock className="h-4 w-4 text-primary"/>
                    </div>
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(appointment.status)}
                  </div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Quick Stats */}
        <card_1.Card className="col-span-3">
          <card_1.CardHeader>
            <card_1.CardTitle>Resumo Rápido</card_1.CardTitle>
            <card_1.CardDescription>
              Estatísticas importantes
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>
                  <span className="text-sm">Taxa de Ocupação</span>
                </div>
                <span className="font-medium">87%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Users className="h-4 w-4 text-blue-600"/>
                  <span className="text-sm">Novos Pacientes</span>
                </div>
                <span className="font-medium">+23 esta semana</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.Calendar className="h-4 w-4 text-purple-600"/>
                  <span className="text-sm">Próxima Consulta</span>
                </div>
                <span className="font-medium">Em 30 min</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <lucide_react_1.DollarSign className="h-4 w-4 text-green-600"/>
                  <span className="text-sm">Receita Hoje</span>
                </div>
                <span className="font-medium">R$ 1.250</span>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Quick Actions */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Ações Rápidas</card_1.CardTitle>
          <card_1.CardDescription>
            Acesso rápido às funcionalidades mais utilizadas
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button_1.Button variant="outline" className="h-20 flex-col gap-2">
              <lucide_react_1.CalendarPlus className="h-6 w-6"/>
              <span>Agendar Consulta</span>
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex-col gap-2">
              <lucide_react_1.UserPlus className="h-6 w-6"/>
              <span>Cadastrar Paciente</span>
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex-col gap-2">
              <lucide_react_1.Activity className="h-6 w-6"/>
              <span>Ver Relatórios</span>
            </button_1.Button>
            <button_1.Button variant="outline" className="h-20 flex-col gap-2">
              <lucide_react_1.DollarSign className="h-6 w-6"/>
              <span>Financeiro</span>
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
