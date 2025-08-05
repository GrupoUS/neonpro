// Stock Alert List Component
// Story 11.4: Alertas e Relatórios de Estoque
// Lista e gerenciamento de configurações de alertas
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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var switch_1 = require("@/components/ui/switch");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var stock_1 = require("@/app/lib/types/stock");
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
var getSeverityColor = function (severity) {
  switch (severity) {
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
var getAlertTypeIcon = function (alertType) {
  var iconProps = { className: "h-4 w-4" };
  switch (alertType) {
    case "low_stock":
      return <lucide_react_1.AlertTriangle {...iconProps} />;
    case "expiring":
      return <lucide_react_1.Bell {...iconProps} />;
    case "expired":
      return <lucide_react_1.AlertTriangle {...iconProps} className="h-4 w-4 text-red-500" />;
    case "overstock":
      return <lucide_react_1.AlertTriangle {...iconProps} className="h-4 w-4 text-orange-500" />;
    default:
      return <lucide_react_1.Bell {...iconProps} />;
  }
};
// =====================================================
// MAIN COMPONENT
// =====================================================
var AlertList = function (_a) {
  var configs = _a.configs,
    alerts = _a.alerts,
    onCreateNew = _a.onCreateNew,
    onEdit = _a.onEdit,
    onDelete = _a.onDelete,
    onToggleActive = _a.onToggleActive,
    onAcknowledge = _a.onAcknowledge,
    onRefresh = _a.onRefresh,
    _b = _a.loading,
    loading = _b === void 0 ? false : _b;
  var _c = (0, react_1.useState)(null),
    actionError = _c[0],
    setActionError = _c[1];
  var _d = (0, react_1.useState)(null),
    actionLoading = _d[0],
    setActionLoading = _d[1];
  // =====================================================
  // ACTION HANDLERS
  // =====================================================
  var handleToggleActive = function (configId, isActive) {
    return __awaiter(void 0, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setActionError(null);
            setActionLoading(configId);
            return [4 /*yield*/, onToggleActive(configId, isActive)];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            if (error_1 instanceof stock_1.StockAlertError) {
              setActionError(error_1.message);
            } else {
              setActionError("Falha ao atualizar status do alerta");
            }
            return [3 /*break*/, 4];
          case 3:
            setActionLoading(null);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleDelete = function (configId) {
    return __awaiter(void 0, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!confirm("Tem certeza que deseja excluir esta configuração de alerta?")) {
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setActionError(null);
            setActionLoading(configId);
            return [4 /*yield*/, onDelete(configId)];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            if (error_2 instanceof stock_1.StockAlertError) {
              setActionError(error_2.message);
            } else {
              setActionError("Falha ao excluir configuração de alerta");
            }
            return [3 /*break*/, 5];
          case 4:
            setActionLoading(null);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleAcknowledge = function (alertId) {
    return __awaiter(void 0, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setActionError(null);
            setActionLoading(alertId);
            return [4 /*yield*/, onAcknowledge(alertId)];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            error_3 = _a.sent();
            if (error_3 instanceof stock_1.StockAlertError) {
              setActionError(error_3.message);
            } else {
              setActionError("Falha ao confirmar alerta");
            }
            return [3 /*break*/, 4];
          case 3:
            setActionLoading(null);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // =====================================================
  // COMPUTED VALUES
  // =====================================================
  var activeAlerts = alerts.filter(function (alert) {
    return !alert.acknowledgedAt;
  });
  var criticalAlerts = activeAlerts.filter(function (alert) {
    return alert.severityLevel === "critical";
  });
  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alertas de Estoque</h2>
          <p className="text-muted-foreground">
            Gerencie configurações de alertas e monitore notificações ativas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(loading ? "animate-spin" : "")}
            />
            Atualizar
          </button_1.Button>
          <button_1.Button onClick={onCreateNew}>
            <lucide_react_1.Plus className="h-4 w-4 mr-2" />
            Nova Configuração
          </button_1.Button>
        </div>
      </div>

      {/* Error Alert */}
      {actionError && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>{actionError}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Alertas Ativos</card_1.CardTitle>
            <lucide_react_1.Bell className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">{criticalAlerts.length} críticos</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Configurações</card_1.CardTitle>
            <lucide_react_1.Filter className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                configs.filter(function (c) {
                  return c.isActive;
                }).length
              }{" "}
              ativas
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Taxa de Resposta</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {alerts.length > 0
                ? Math.round(
                    (alerts.filter(function (a) {
                      return a.acknowledgedAt;
                    }).length /
                      alerts.length) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">alertas confirmados</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Bell className="h-5 w-5" />
              Alertas Pendentes
            </card_1.CardTitle>
            <card_1.CardDescription>Alertas que requerem atenção imediata</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {activeAlerts.map(function (alert) {
                return (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getAlertTypeIcon(alert.alertType)}
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(alert.triggeredAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <badge_1.Badge className={getSeverityColor(alert.severityLevel)}>
                        {stock_1.SEVERITY_LABELS[alert.severityLevel]}
                      </badge_1.Badge>
                      <button_1.Button
                        size="sm"
                        variant="outline"
                        onClick={function () {
                          return handleAcknowledge(alert.id);
                        }}
                        disabled={actionLoading === alert.id}
                      >
                        Confirmar
                      </button_1.Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Alert Configurations */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Configurações de Alertas</card_1.CardTitle>
          <card_1.CardDescription>
            Gerencie as regras de alertas automáticos para seu estoque
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {configs.length === 0
            ? <div className="text-center py-8">
                <lucide_react_1.AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma configuração encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira configuração de alerta para começar a monitorar seu estoque
                </p>
                <button_1.Button onClick={onCreateNew}>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Configuração
                </button_1.Button>
              </div>
            : <div className="space-y-4">
                {configs.map(function (config) {
                  return (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getAlertTypeIcon(config.alertType)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {stock_1.ALERT_TYPE_LABELS[config.alertType]}
                            </h4>
                            <badge_1.Badge className={getSeverityColor(config.severityLevel)}>
                              {stock_1.SEVERITY_LABELS[config.severityLevel]}
                            </badge_1.Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Limite: {config.thresholdValue}{" "}
                            {config.thresholdUnit === "quantity"
                              ? "unidades"
                              : config.thresholdUnit === "days"
                                ? "dias"
                                : "%"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Canais: {config.notificationChannels.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Ativo</span>
                          <switch_1.Switch
                            checked={config.isActive}
                            onCheckedChange={function (checked) {
                              return handleToggleActive(config.id, checked);
                            }}
                            disabled={actionLoading === config.id}
                          />
                        </div>
                        <dropdown_menu_1.DropdownMenu>
                          <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.MoreVertical className="h-4 w-4" />
                            </button_1.Button>
                          </dropdown_menu_1.DropdownMenuTrigger>
                          <dropdown_menu_1.DropdownMenuContent align="end">
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={function () {
                                return onEdit(config);
                              }}
                            >
                              <lucide_react_1.Edit className="h-4 w-4 mr-2" />
                              Editar
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={function () {
                                return handleDelete(config.id);
                              }}
                              className="text-red-600"
                            >
                              <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </dropdown_menu_1.DropdownMenuItem>
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
};
exports.default = AlertList;
