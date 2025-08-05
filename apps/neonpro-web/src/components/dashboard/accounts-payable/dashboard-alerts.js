"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.DashboardAlerts = DashboardAlerts;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_1 = require("react");
// Mock data - substituir por dados reais do Supabase
var mockDashboardAlerts = [
  {
    id: "1",
    title: "Pagamento em atraso - Fornecedor Gamma",
    message: "Conta de R$ 3.200,00 está 3 dias em atraso",
    alert_type: "overdue",
    priority: "urgent",
    is_read: false,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/payables?id=3",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Pagamento vence hoje - Fornecedor Beta",
    message: "Conta de R$ 8.500,00 vence hoje",
    alert_type: "due_today",
    priority: "high",
    is_read: false,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/payables?id=2",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Pagamento crítico em atraso - Fornecedor Epsilon",
    message: "Conta de R$ 12.000,00 está 10 dias em atraso",
    alert_type: "overdue",
    priority: "urgent",
    is_read: true,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/payables?id=5",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Aprovação pendente - Fornecedor Zeta",
    message: "Pagamento de R$ 5.800,00 aguarda aprovação do gerente",
    alert_type: "approval_needed",
    priority: "medium",
    is_read: false,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/approvals?id=6",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Pagamento próximo do vencimento - Fornecedor Alpha",
    message: "Conta de R$ 15.000,00 vence amanhã",
    alert_type: "due_soon",
    priority: "medium",
    is_read: true,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/payables?id=1",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
function DashboardAlerts(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    _b = _a.limit,
    limit = _b === void 0 ? 5 : _b,
    _c = _a.showTitle,
    showTitle = _c === void 0 ? true : _c;
  var _d = (0, react_1.useState)([]),
    alerts = _d[0],
    setAlerts = _d[1];
  var _e = (0, react_1.useState)(true),
    loading = _e[0],
    setLoading = _e[1];
  (0, react_1.useEffect)(
    function () {
      loadAlerts();
    },
    [clinicId],
  );
  var loadAlerts = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          setLoading(true);
          // TODO: Implementar chamada real para o serviço
          // const data = await notificationService.getDashboardAlerts(clinicId, limit)
          // Usando dados mock por enquanto
          setTimeout(function () {
            var limitedAlerts = mockDashboardAlerts
              .filter(function (alert) {
                return !alert.is_dismissed;
              })
              .slice(0, limit);
            setAlerts(limitedAlerts);
            setLoading(false);
          }, 300);
        } catch (error) {
          console.error("Error loading alerts:", error);
          setLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var markAsRead = function (alertId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // TODO: Implementar chamada real
          // await notificationService.markAlertAsRead(alertId)
          setAlerts(function (prev) {
            return prev.map(function (alert) {
              return alert.id === alertId
                ? __assign(__assign({}, alert), { is_read: true })
                : alert;
            });
          });
        } catch (error) {
          console.error("Error marking alert as read:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  var dismissAlert = function (alertId) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // TODO: Implementar chamada real
          // await notificationService.dismissAlert(alertId)
          setAlerts(function (prev) {
            return prev.filter(function (alert) {
              return alert.id !== alertId;
            });
          });
        } catch (error) {
          console.error("Error dismissing alert:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  var getPriorityIcon = function (priority) {
    switch (priority) {
      case "urgent":
        return <lucide_react_1.Zap className="h-4 w-4 text-red-500" />;
      case "high":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <lucide_react_1.TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <lucide_react_1.Clock className="h-4 w-4 text-blue-500" />;
    }
  };
  var getPriorityBadgeColor = function (priority) {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };
  var getAlertTypeBadgeColor = function (alertType) {
    switch (alertType) {
      case "overdue":
        return "destructive";
      case "due_today":
        return "destructive";
      case "approval_needed":
        return "secondary";
      case "due_soon":
        return "outline";
      case "high_priority":
        return "destructive";
      default:
        return "outline";
    }
  };
  var getAlertTypeLabel = function (alertType) {
    switch (alertType) {
      case "overdue":
        return "Em Atraso";
      case "due_today":
        return "Vence Hoje";
      case "approval_needed":
        return "Aprovação";
      case "due_soon":
        return "Próximo";
      case "high_priority":
        return "Alta Prioridade";
      default:
        return "Info";
    }
  };
  var formatTimeAgo = function (dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return "".concat(diffInMinutes, "m atr\u00E1s");
    } else if (diffInMinutes < 1440) {
      // menos de 24h
      return "".concat(Math.floor(diffInMinutes / 60), "h atr\u00E1s");
    } else {
      return "".concat(Math.floor(diffInMinutes / 1440), "d atr\u00E1s");
    }
  };
  var unreadCount = alerts.filter(function (alert) {
    return !alert.is_read;
  }).length;
  if (loading) {
    return (
      <card_1.Card>
        {showTitle && (
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Bell className="h-5 w-5" />
              Alertas
            </card_1.CardTitle>
          </card_1.CardHeader>
        )}
        <card_1.CardContent className="space-y-3">
          {[1, 2, 3].map(function (i) {
            return (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (alerts.length === 0) {
    return (
      <card_1.Card>
        {showTitle && (
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Bell className="h-5 w-5" />
              Alertas
            </card_1.CardTitle>
          </card_1.CardHeader>
        )}
        <card_1.CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <lucide_react_1.Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
            <p className="text-xs text-muted-foreground mt-1">
              Você será notificado sobre pagamentos importantes
            </p>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      {showTitle && (
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Bell className="h-5 w-5" />
              Alertas
              {unreadCount > 0 && (
                <badge_1.Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </badge_1.Badge>
              )}
            </card_1.CardTitle>
            <link_1.default href="/dashboard/accounts-payable/alerts">
              <button_1.Button variant="outline" size="sm">
                Ver todos
                <lucide_react_1.ChevronRight className="h-4 w-4 ml-1" />
              </button_1.Button>
            </link_1.default>
          </div>
          <card_1.CardDescription>
            Notificações importantes sobre contas a pagar
          </card_1.CardDescription>
        </card_1.CardHeader>
      )}
      <card_1.CardContent className="space-y-3">
        {alerts.map(function (alert) {
          return (
            <div
              key={alert.id}
              className={"flex items-start gap-3 p-3 rounded-lg border ".concat(
                alert.is_read ? "bg-muted/20 border-muted" : "bg-background border-border",
                " hover:bg-muted/30 transition-colors",
              )}
            >
              <div className="mt-0.5">{getPriorityIcon(alert.priority)}</div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4
                      className={"text-sm font-medium leading-none ".concat(
                        alert.is_read ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {alert.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <badge_1.Badge
                      variant={getAlertTypeBadgeColor(alert.alert_type)}
                      className="text-xs"
                    >
                      {getAlertTypeLabel(alert.alert_type)}
                    </badge_1.Badge>
                    <badge_1.Badge
                      variant={getPriorityBadgeColor(alert.priority)}
                      className="text-xs"
                    >
                      {alert.priority === "urgent"
                        ? "Urgente"
                        : alert.priority === "high"
                          ? "Alta"
                          : alert.priority === "medium"
                            ? "Média"
                            : "Baixa"}
                    </badge_1.Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(alert.created_at)}
                  </span>

                  <div className="flex items-center gap-1">
                    {alert.action_url && (
                      <link_1.default href={alert.action_url}>
                        <button_1.Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={function () {
                            return !alert.is_read && markAsRead(alert.id);
                          }}
                        >
                          <lucide_react_1.Eye className="h-3 w-3" />
                        </button_1.Button>
                      </link_1.default>
                    )}

                    {!alert.is_read && (
                      <button_1.Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={function () {
                          return markAsRead(alert.id);
                        }}
                      >
                        <lucide_react_1.Check className="h-3 w-3" />
                      </button_1.Button>
                    )}

                    <button_1.Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={function () {
                        return dismissAlert(alert.id);
                      }}
                    >
                      <lucide_react_1.X className="h-3 w-3" />
                    </button_1.Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {alerts.length === limit && (
          <div className="text-center pt-2">
            <link_1.default href="/dashboard/accounts-payable/alerts">
              <button_1.Button variant="outline" size="sm" className="w-full">
                Ver todos os alertas
                <lucide_react_1.ChevronRight className="h-4 w-4 ml-1" />
              </button_1.Button>
            </link_1.default>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
