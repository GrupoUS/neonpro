"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var avatar_1 = require("@/components/ui/avatar");
var tabs_1 = require("@/components/ui/tabs");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var lucide_react_1 = require("lucide-react");
function DashboardPage() {
  var _this = this;
  var _a = (0, react_1.useState)(true),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)({
      totalPatients: 0,
      appointmentsToday: 0,
      monthlyRevenue: 0,
      activeConsultations: 0,
      pendingResults: 0,
      cancellationRate: 0,
    }),
    stats = _b[0],
    setStats = _b[1];
  var _c = (0, react_1.useState)([]),
    todayAppointments = _c[0],
    setTodayAppointments = _c[1];
  var _d = (0, react_1.useState)([]),
    revenueData = _d[0],
    setRevenueData = _d[1];
  (0, react_1.useEffect)(function () {
    // Simulate data loading
    var loadDashboardData = function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              // Simulate API calls
              return [
                4 /*yield*/,
                new Promise(function (resolve) {
                  return setTimeout(resolve, 1500);
                }),
              ];
            case 1:
              // Simulate API calls
              _a.sent();
              setStats({
                totalPatients: 1247,
                appointmentsToday: 12,
                monthlyRevenue: 85420,
                activeConsultations: 3,
                pendingResults: 8,
                cancellationRate: 2.3,
              });
              setTodayAppointments([
                {
                  id: "1",
                  patientName: "Ana Silva Santos",
                  time: "09:00",
                  type: "Consulta Geral",
                  status: "confirmed",
                  avatar: "/placeholder-avatar.jpg",
                },
                {
                  id: "2",
                  patientName: "Carlos Rodrigues",
                  time: "10:30",
                  type: "Retorno",
                  status: "completed",
                  avatar: "/placeholder-avatar.jpg",
                },
                {
                  id: "3",
                  patientName: "Maria Oliveira",
                  time: "14:00",
                  type: "Exames",
                  status: "pending",
                  avatar: "/placeholder-avatar.jpg",
                },
                {
                  id: "4",
                  patientName: "João Ferreira",
                  time: "15:30",
                  type: "Consulta Especializada",
                  status: "confirmed",
                  avatar: "/placeholder-avatar.jpg",
                },
              ]);
              setRevenueData([
                { month: "Jan", revenue: 72500, appointments: 156 },
                { month: "Fev", revenue: 68900, appointments: 142 },
                { month: "Mar", revenue: 79200, appointments: 168 },
                { month: "Abr", revenue: 83100, appointments: 174 },
                { month: "Mai", revenue: 85420, appointments: 181 },
              ]);
              setIsLoading(false);
              return [2 /*return*/];
          }
        });
      });
    };
    loadDashboardData();
  }, []);
  var getStatusColor = function (status) {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var getStatusText = function (status) {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <loading_spinner_1.LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <main className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard NEONPRO</h1>
          <p className="text-muted-foreground">Visão geral da sua clínica médica</p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.FileText className="w-4 h-4 mr-2" />
            Relatórios
          </button_1.Button>
          <button_1.Button size="sm" className="bg-neon-500 hover:bg-neon-600">
            <lucide_react_1.Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </button_1.Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card className="border-l-4 border-l-neon-500">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total de Pacientes</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-neon-500" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <lucide_react_1.TrendingUp className="w-3 h-3 inline mr-1" />
              +12% em relação ao mês anterior
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="border-l-4 border-l-blue-500">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Consultas Hoje</card_1.CardTitle>
            <lucide_react_1.Calendar className="h-4 w-4 text-blue-500" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              <lucide_react_1.Clock className="w-3 h-3 inline mr-1" />
              {stats.activeConsultations} consultas em andamento
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="border-l-4 border-l-green-500">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Receita Mensal</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-green-500" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <lucide_react_1.TrendingUp className="w-3 h-3 inline mr-1" />
              +8.2% em relação ao mês anterior
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="border-l-4 border-l-orange-500">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">
              Taxa de Cancelamento
            </card_1.CardTitle>
            <lucide_react_1.AlertCircle className="h-4 w-4 text-orange-500" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.cancellationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingResults} resultados pendentes
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <card_1.Card className="lg:col-span-2">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center">
              <lucide_react_1.Calendar className="w-5 h-5 mr-2 text-neon-500" />
              Consultas de Hoje
            </card_1.CardTitle>
            <card_1.CardDescription>
              Agenda do dia - {new Date().toLocaleDateString("pt-BR")}
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {todayAppointments.length === 0
              ? <div className="text-center py-8 text-muted-foreground">
                  <lucide_react_1.Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma consulta agendada para hoje</p>
                </div>
              : todayAppointments.map(function (appointment) {
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <avatar_1.Avatar>
                          <avatar_1.AvatarImage src={appointment.avatar} />
                          <avatar_1.AvatarFallback>
                            {appointment.patientName
                              .split(" ")
                              .map(function (n) {
                                return n[0];
                              })
                              .join("")}
                          </avatar_1.AvatarFallback>
                        </avatar_1.Avatar>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.time} • {appointment.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <badge_1.Badge
                          variant="outline"
                          className={getStatusColor(appointment.status)}
                        >
                          {getStatusText(appointment.status)}
                        </badge_1.Badge>
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Eye className="w-4 h-4" />
                        </button_1.Button>
                      </div>
                    </div>
                  );
                })}
          </card_1.CardContent>
        </card_1.Card>{" "}
        {/* Quick Actions & Analytics */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Ações Rápidas</card_1.CardTitle>
              <card_1.CardDescription>
                Acesso rápido às principais funcionalidades
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              <button_1.Button className="w-full justify-start" variant="outline">
                <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                Agendar Consulta
              </button_1.Button>
              <button_1.Button className="w-full justify-start" variant="outline">
                <lucide_react_1.Users className="w-4 h-4 mr-2" />
                Gerenciar Pacientes
              </button_1.Button>
              <button_1.Button className="w-full justify-start" variant="outline">
                <lucide_react_1.FileText className="w-4 h-4 mr-2" />
                Relatórios Financeiros
              </button_1.Button>
              <button_1.Button className="w-full justify-start" variant="outline">
                <lucide_react_1.Activity className="w-4 h-4 mr-2" />
                Histórico Médico
              </button_1.Button>
              <button_1.Button className="w-full justify-start" variant="outline">
                <lucide_react_1.Settings className="w-4 h-4 mr-2" />
                Configurações
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Performance Metrics */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-lg">Métricas de Performance</card_1.CardTitle>
              <card_1.CardDescription>Indicadores de performance da clínica</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Taxa de Ocupação</span>
                  <span className="font-medium">87%</span>
                </div>
                <progress_1.Progress value={87} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Satisfação do Paciente</span>
                  <span className="font-medium">94%</span>
                </div>
                <progress_1.Progress value={94} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tempo Médio de Espera</span>
                  <span className="font-medium">12 min</span>
                </div>
                <progress_1.Progress value={78} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Eficiência Operacional</span>
                  <span className="font-medium">91%</span>
                </div>
                <progress_1.Progress value={91} className="h-2" />
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>

      {/* Revenue Analytics */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.TrendingUp className="w-5 h-5 mr-2 text-neon-500" />
            Análise de Receita
          </card_1.CardTitle>
          <card_1.CardDescription>
            Evolução da receita e número de consultas nos últimos meses
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <tabs_1.Tabs defaultValue="revenue" className="w-full">
            <tabs_1.TabsList className="grid w-full grid-cols-2">
              <tabs_1.TabsTrigger value="revenue">Receita</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="appointments">Consultas</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="revenue" className="space-y-4">
              <div className="h-[300px] mt-4">
                {/* Placeholder for revenue chart */}
                <div className="w-full h-full bg-gradient-to-br from-neon-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-neon-200">
                  <div className="text-center">
                    <lucide_react_1.TrendingUp className="w-12 h-12 mx-auto mb-4 text-neon-500" />
                    <p className="text-lg font-medium text-neon-700">Gráfico de Receita</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {stats.monthlyRevenue.toLocaleString()} este mês
                    </p>
                  </div>
                </div>
              </div>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="appointments" className="space-y-4">
              <div className="h-[300px] mt-4">
                {/* Placeholder for appointments chart */}
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <div className="text-center">
                    <lucide_react_1.Activity className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <p className="text-lg font-medium text-blue-700">Gráfico de Consultas</p>
                    <p className="text-sm text-muted-foreground">181 consultas este mês</p>
                  </div>
                </div>
              </div>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>
    </main>
  );
}
