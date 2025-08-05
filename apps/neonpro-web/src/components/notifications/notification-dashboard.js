/**
 * NeonPro Notification System - Dashboard Component
 * Story 1.7: Sistema de Notificações
 *
 * Dashboard React para gerenciamento de notificações
 * Suporte a visualização, configuração e monitoramento
 */
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
exports.NotificationDashboard = NotificationDashboard;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var label_1 = require("@/components/ui/label");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var types_1 = require("@/lib/notifications/types");
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function NotificationDashboard() {
  var _this = this;
  // Estados
  var _a = (0, react_1.useState)("overview"),
    activeTab = _a[0],
    setActiveTab = _a[1];
  var _b = (0, react_1.useState)(null),
    stats = _b[0],
    setStats = _b[1];
  var _c = (0, react_1.useState)([]),
    channelStatus = _c[0],
    setChannelStatus = _c[1];
  var _d = (0, react_1.useState)([]),
    templates = _d[0],
    setTemplates = _d[1];
  var _e = (0, react_1.useState)([]),
    deliveries = _e[0],
    setDeliveries = _e[1];
  var _f = (0, react_1.useState)([]),
    automationRules = _f[0],
    setAutomationRules = _f[1];
  var _g = (0, react_1.useState)(true),
    loading = _g[0],
    setLoading = _g[1];
  var _h = (0, react_1.useState)(""),
    searchTerm = _h[0],
    setSearchTerm = _h[1];
  var _j = (0, react_1.useState)("all"),
    filterChannel = _j[0],
    setFilterChannel = _j[1];
  var _k = (0, react_1.useState)("all"),
    filterStatus = _k[0],
    setFilterStatus = _k[1];
  // ============================================================================
  // EFFECTS
  // ============================================================================
  (0, react_1.useEffect)(function () {
    loadDashboardData();
  }, []);
  // ============================================================================
  // DATA LOADING
  // ============================================================================
  var loadDashboardData = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // Simular carregamento de dados
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 1000);
              }),
            ];
          case 2:
            // Simular carregamento de dados
            _a.sent();
            // Mock data
            setStats({
              total: 15420,
              sent: 14890,
              delivered: 14235,
              failed: 185,
              pending: 530,
              channels: {
                email: 8450,
                sms: 3210,
                push: 2890,
                inApp: 870,
              },
              types: {
                appointment: 6780,
                payment: 2340,
                reminder: 3450,
                alert: 890,
                marketing: 1560,
                system: 400,
              },
            });
            setChannelStatus([
              {
                channel: types_1.NotificationChannel.EMAIL,
                enabled: true,
                healthy: true,
                lastCheck: new Date(),
                errorCount: 12,
                successRate: 98.5,
              },
              {
                channel: types_1.NotificationChannel.SMS,
                enabled: true,
                healthy: true,
                lastCheck: new Date(),
                errorCount: 5,
                successRate: 99.2,
              },
              {
                channel: types_1.NotificationChannel.PUSH,
                enabled: true,
                healthy: false,
                lastCheck: new Date(Date.now() - 300000),
                errorCount: 45,
                successRate: 94.8,
              },
              {
                channel: types_1.NotificationChannel.IN_APP,
                enabled: true,
                healthy: true,
                lastCheck: new Date(),
                errorCount: 2,
                successRate: 99.8,
              },
            ]);
            // Mock templates
            setTemplates([
              {
                id: "welcome",
                name: "Boas-vindas",
                description: "Template de boas-vindas para novos usuários",
                type: types_1.NotificationType.SYSTEM,
                channels: [types_1.NotificationChannel.EMAIL, types_1.NotificationChannel.IN_APP],
                subject: "Bem-vindo ao NeonPro!",
                content: "Olá {{user.firstName}}, bem-vindo ao NeonPro!",
                variables: ["user.firstName", "user.email"],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              {
                id: "appointment-reminder",
                name: "Lembrete de Consulta",
                description: "Lembrete de consulta agendada",
                type: types_1.NotificationType.APPOINTMENT,
                channels: [types_1.NotificationChannel.SMS, types_1.NotificationChannel.PUSH],
                subject: "Lembrete: Consulta amanhã",
                content:
                  "Olá {{patient.firstName}}, lembre-se da sua consulta amanhã às {{appointment.time}}.",
                variables: ["patient.firstName", "appointment.time", "appointment.date"],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Erro ao carregar dados do dashboard:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  var getChannelIcon = function (channel) {
    switch (channel) {
      case types_1.NotificationChannel.EMAIL:
        return <lucide_react_1.Mail className="h-4 w-4" />;
      case types_1.NotificationChannel.SMS:
        return <lucide_react_1.MessageSquare className="h-4 w-4" />;
      case types_1.NotificationChannel.PUSH:
        return <lucide_react_1.Smartphone className="h-4 w-4" />;
      case types_1.NotificationChannel.IN_APP:
        return <lucide_react_1.Monitor className="h-4 w-4" />;
      default:
        return <lucide_react_1.Bell className="h-4 w-4" />;
    }
  };
  var getChannelName = function (channel) {
    switch (channel) {
      case types_1.NotificationChannel.EMAIL:
        return "Email";
      case types_1.NotificationChannel.SMS:
        return "SMS";
      case types_1.NotificationChannel.PUSH:
        return "Push";
      case types_1.NotificationChannel.IN_APP:
        return "In-App";
      default:
        return "Desconhecido";
    }
  };
  var getStatusBadge = function (status) {
    switch (status) {
      case types_1.DeliveryStatus.SENT:
        return (
          <badge_1.Badge variant="outline" className="text-blue-600">
            Enviado
          </badge_1.Badge>
        );
      case types_1.DeliveryStatus.DELIVERED:
        return (
          <badge_1.Badge variant="outline" className="text-green-600">
            Entregue
          </badge_1.Badge>
        );
      case types_1.DeliveryStatus.FAILED:
        return <badge_1.Badge variant="destructive">Falhou</badge_1.Badge>;
      case types_1.DeliveryStatus.PENDING:
        return <badge_1.Badge variant="secondary">Pendente</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="outline">Desconhecido</badge_1.Badge>;
    }
  };
  var getPriorityBadge = function (priority) {
    switch (priority) {
      case types_1.NotificationPriority.URGENT:
        return <badge_1.Badge variant="destructive">Urgente</badge_1.Badge>;
      case types_1.NotificationPriority.HIGH:
        return <badge_1.Badge className="bg-orange-500">Alta</badge_1.Badge>;
      case types_1.NotificationPriority.MEDIUM:
        return <badge_1.Badge variant="secondary">Média</badge_1.Badge>;
      case types_1.NotificationPriority.LOW:
        return <badge_1.Badge variant="outline">Baixa</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="outline">Normal</badge_1.Badge>;
    }
  };
  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================
  var renderOverview = function () {
    return (
      <div className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Total Enviadas</card_1.CardTitle>
              <lucide_react_1.Send className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {stats === null || stats === void 0 ? void 0 : stats.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Taxa de Entrega</card_1.CardTitle>
              <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {stats ? ((stats.delivered / stats.sent) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">+2.1% em relação ao mês anterior</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Falhas</card_1.CardTitle>
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats === null || stats === void 0 ? void 0 : stats.failed}
              </div>
              <p className="text-xs text-muted-foreground">-5% em relação ao mês anterior</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Pendentes</card_1.CardTitle>
              <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats === null || stats === void 0 ? void 0 : stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">Processando...</p>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Status dos Canais */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Status dos Canais</card_1.CardTitle>
            <card_1.CardDescription>
              Monitoramento em tempo real dos canais de notificação
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {channelStatus.map(function (channel) {
                return (
                  <div
                    key={channel.channel}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getChannelIcon(channel.channel)}
                      <div>
                        <div className="font-medium">{getChannelName(channel.channel)}</div>
                        <div className="text-sm text-muted-foreground">
                          Última verificação: {channel.lastCheck.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{channel.successRate}% sucesso</div>
                        <div className="text-xs text-muted-foreground">
                          {channel.errorCount} erros
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <switch_1.Switch checked={channel.enabled} />
                        <div
                          className={"w-3 h-3 rounded-full ".concat(
                            channel.healthy ? "bg-green-500" : "bg-red-500",
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Distribuição por Canal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Distribuição por Canal</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {stats &&
                  Object.entries(stats.channels).map(function (_a) {
                    var channel = _a[0],
                      count = _a[1];
                    var percentage = (count / stats.total) * 100;
                    return (
                      <div key={channel} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{channel}</span>
                          <span>
                            {count.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <progress_1.Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Distribuição por Tipo</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {stats &&
                  Object.entries(stats.types).map(function (_a) {
                    var type = _a[0],
                      count = _a[1];
                    var percentage = (count / stats.total) * 100;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <span>
                            {count.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <progress_1.Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    );
  };
  var renderTemplates = function () {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Templates de Notificação</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie templates para diferentes tipos de notificação
            </p>
          </div>
          <button_1.Button>
            <lucide_react_1.Plus className="h-4 w-4 mr-2" />
            Novo Template
          </button_1.Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(function (template) {
            return (
              <card_1.Card key={template.id}>
                <card_1.CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <card_1.CardTitle className="text-base">{template.name}</card_1.CardTitle>
                      <card_1.CardDescription>{template.description}</card_1.CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Edit className="h-4 w-4" />
                      </button_1.Button>
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Trash2 className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <div>
                      <label_1.Label className="text-xs text-muted-foreground">
                        CANAIS
                      </label_1.Label>
                      <div className="flex space-x-1 mt-1">
                        {template.channels.map(function (channel) {
                          return (
                            <badge_1.Badge key={channel} variant="outline" className="text-xs">
                              {getChannelName(channel)}
                            </badge_1.Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label_1.Label className="text-xs text-muted-foreground">
                        ASSUNTO
                      </label_1.Label>
                      <p className="text-sm mt-1 truncate">{template.subject}</p>
                    </div>

                    <div>
                      <label_1.Label className="text-xs text-muted-foreground">
                        VARIÁVEIS
                      </label_1.Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.variables.length} variáveis disponíveis
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <switch_1.Switch checked={template.isActive} />
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </button_1.Button>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      </div>
    );
  };
  var renderDeliveries = function () {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Histórico de Entregas</h3>
            <p className="text-sm text-muted-foreground">
              Acompanhe o status das notificações enviadas
            </p>
          </div>
          <div className="flex space-x-2">
            <button_1.Button variant="outline">
              <lucide_react_1.Download className="h-4 w-4 mr-2" />
              Exportar
            </button_1.Button>
            <button_1.Button variant="outline">
              <lucide_react_1.Filter className="h-4 w-4 mr-2" />
              Filtros
            </button_1.Button>
          </div>
        </div>

        <div className="flex space-x-4">
          <input_1.Input
            placeholder="Buscar por destinatário..."
            value={searchTerm}
            onChange={function (e) {
              return setSearchTerm(e.target.value);
            }}
            className="max-w-sm"
          />
          <select_1.Select value={filterChannel} onValueChange={setFilterChannel}>
            <select_1.SelectTrigger className="w-40">
              <select_1.SelectValue placeholder="Canal" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os canais</select_1.SelectItem>
              <select_1.SelectItem value="email">Email</select_1.SelectItem>
              <select_1.SelectItem value="sms">SMS</select_1.SelectItem>
              <select_1.SelectItem value="push">Push</select_1.SelectItem>
              <select_1.SelectItem value="inapp">In-App</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
            <select_1.SelectTrigger className="w-40">
              <select_1.SelectValue placeholder="Status" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
              <select_1.SelectItem value="sent">Enviado</select_1.SelectItem>
              <select_1.SelectItem value="delivered">Entregue</select_1.SelectItem>
              <select_1.SelectItem value="failed">Falhou</select_1.SelectItem>
              <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        <card_1.Card>
          <card_1.CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Destinatário</th>
                    <th className="p-4 font-medium">Canal</th>
                    <th className="p-4 font-medium">Tipo</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Enviado em</th>
                    <th className="p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mock data - em produção viria do estado deliveries */}
                  <tr className="border-b">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">João Silva</div>
                        <div className="text-sm text-muted-foreground">joao@email.com</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <lucide_react_1.Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <badge_1.Badge variant="outline">Lembrete</badge_1.Badge>
                    </td>
                    <td className="p-4">{getStatusBadge(types_1.DeliveryStatus.DELIVERED)}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date().toLocaleDateString()}
                        <br />
                        <span className="text-muted-foreground">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button_1.Button variant="ghost" size="sm">
                        <lucide_react_1.Eye className="h-4 w-4" />
                      </button_1.Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  };
  var renderAutomation = function () {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Automação</h3>
            <p className="text-sm text-muted-foreground">
              Configure regras automáticas para notificações
            </p>
          </div>
          <button_1.Button>
            <lucide_react_1.Plus className="h-4 w-4 mr-2" />
            Nova Regra
          </button_1.Button>
        </div>

        <alert_1.Alert>
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
            O sistema de automação está em desenvolvimento. Em breve você poderá criar regras
            automáticas baseadas em eventos do sistema.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      </div>
    );
  };
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todas as notificações do sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <button_1.Button variant="outline">
            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
            Configurações
          </button_1.Button>
          <button_1.Button>
            <lucide_react_1.Send className="h-4 w-4 mr-2" />
            Enviar Notificação
          </button_1.Button>
        </div>
      </div>

      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="deliveries">Entregas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="automation">Automação</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview">{renderOverview()}</tabs_1.TabsContent>
        <tabs_1.TabsContent value="templates">{renderTemplates()}</tabs_1.TabsContent>
        <tabs_1.TabsContent value="deliveries">{renderDeliveries()}</tabs_1.TabsContent>
        <tabs_1.TabsContent value="automation">{renderAutomation()}</tabs_1.TabsContent>
        <tabs_1.TabsContent value="analytics">
          <div className="text-center py-12">
            <lucide_react_1.BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              Relatórios detalhados e métricas avançadas estarão disponíveis em breve.
            </p>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
exports.default = NotificationDashboard;
