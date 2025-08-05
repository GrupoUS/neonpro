// =====================================================================================
// EQUIPMENT MAINTENANCE DASHBOARD COMPONENT
// Epic 6 - Story 6.4: Comprehensive equipment maintenance management with scheduling and alerts
// =====================================================================================
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var use_toast_1 = require("@/components/ui/use-toast");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var SummaryCards = function (_a) {
  var summary = _a.summary;
  if (!summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {__spreadArray([], Array(4), true).map(function (_, i) {
          return (
            <card_1.Card key={i} className="animate-pulse">
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Equipment */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Total de Equipamentos</card_1.CardTitle>
          <lucide_react_1.Settings className="h-4 w-4 text-muted-foreground" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold">{summary.totalEquipment}</div>
          <p className="text-xs text-muted-foreground">
            Ativos: {summary.equipmentByStatus.active || 0}
          </p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Active Alerts */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Alertas Ativos</card_1.CardTitle>
          <lucide_react_1.AlertTriangle className="h-4 w-4 text-destructive" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold text-destructive">{summary.activeAlerts}</div>
          <p className="text-xs text-muted-foreground">
            Críticos: {summary.alertsBySeverity.critical || 0}
          </p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Overdue Maintenances */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Manutenções Atrasadas</card_1.CardTitle>
          <lucide_react_1.Clock className="h-4 w-4 text-warning" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold text-warning">{summary.overdueMaintenances}</div>
          <p className="text-xs text-muted-foreground">Requer atenção imediata</p>
        </card_1.CardContent>
      </card_1.Card>

      {/* Upcoming Maintenances */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Próximas Manutenções</card_1.CardTitle>
          <lucide_react_1.Calendar className="h-4 w-4 text-blue-600" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold text-blue-600">{summary.upcomingMaintenances}</div>
          <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
};
var EquipmentList = function (_a) {
  var clinicId = _a.clinicId;
  var _b = (0, react_1.useState)([]),
    equipment = _b[0],
    setEquipment = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(""),
    searchTerm = _d[0],
    setSearchTerm = _d[1];
  var _e = (0, react_1.useState)(""),
    statusFilter = _e[0],
    setStatusFilter = _e[1];
  var _f = (0, react_1.useState)(1),
    page = _f[0],
    setPage = _f[1];
  var _g = (0, react_1.useState)(0),
    total = _g[0],
    setTotal = _g[1];
  var fetchEquipment = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var queryParams, response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            queryParams = new URLSearchParams({
              clinic_id: clinicId,
              page: page.toString(),
              limit: "20",
            });
            if (searchTerm) queryParams.append("search", searchTerm);
            if (statusFilter) queryParams.append("status", statusFilter);
            return [4 /*yield*/, fetch("/api/maintenance/equipment?".concat(queryParams))];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch equipment");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setEquipment(data.equipment);
            setTotal(data.total);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching equipment:", error_1);
            (0, use_toast_1.toast)({
              title: "Erro",
              description: "Falha ao carregar equipamentos",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  (0, react_1.useEffect)(
    function () {
      fetchEquipment();
    },
    [clinicId, page, searchTerm, statusFilter],
  );
  var getStatusBadge = function (status) {
    var statusMap = {
      active: { label: "Ativo", className: "bg-green-100 text-green-800" },
      maintenance: {
        label: "Manutenção",
        className: "bg-yellow-100 text-yellow-800",
      },
      out_of_service: {
        label: "Fora de Serviço",
        className: "bg-red-100 text-red-800",
      },
      decommissioned: {
        label: "Descomissionado",
        className: "bg-gray-100 text-gray-800",
      },
    };
    var config = statusMap[status];
    return <badge_1.Badge className={config.className}>{config.label}</badge_1.Badge>;
  };
  var getCriticalityBadge = function (level) {
    var criticalityMap = {
      critical: { label: "Crítico", className: "bg-red-100 text-red-800" },
      high: { label: "Alto", className: "bg-orange-100 text-orange-800" },
      medium: { label: "Médio", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Baixo", className: "bg-green-100 text-green-800" },
    };
    var config = criticalityMap[level];
    return <badge_1.Badge className={config.className}>{config.label}</badge_1.Badge>;
  };
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input_1.Input
            placeholder="Buscar equipamentos..."
            value={searchTerm}
            onChange={function (e) {
              return setSearchTerm(e.target.value);
            }}
            className="pl-8"
          />
        </div>
        <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
          <select_1.SelectTrigger className="w-full sm:w-[180px]">
            <select_1.SelectValue placeholder="Status" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="">Todos os status</select_1.SelectItem>
            <select_1.SelectItem value="active">Ativo</select_1.SelectItem>
            <select_1.SelectItem value="maintenance">Manutenção</select_1.SelectItem>
            <select_1.SelectItem value="out_of_service">Fora de Serviço</select_1.SelectItem>
            <select_1.SelectItem value="decommissioned">Descomissionado</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
        <button_1.Button>
          <lucide_react_1.Plus className="mr-2 h-4 w-4" />
          Novo Equipamento
        </button_1.Button>
      </div>

      {/* Equipment Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? __spreadArray([], Array(6), true).map(function (_, i) {
              return (
                <card_1.Card key={i} className="animate-pulse">
                  <card_1.CardHeader>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })
          : equipment.length === 0
            ? <div className="col-span-full text-center py-8">
                <lucide_react_1.Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhum equipamento encontrado
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter
                    ? "Tente ajustar os filtros."
                    : "Comece adicionando um novo equipamento."}
                </p>
              </div>
            : equipment.map(function (item) {
                return (
                  <card_1.Card key={item.id} className="hover:shadow-md transition-shadow">
                    <card_1.CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <card_1.CardTitle className="text-base">{item.name}</card_1.CardTitle>
                          <card_1.CardDescription className="text-sm">
                            {item.model} • {item.serial_number}
                          </card_1.CardDescription>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    </card_1.CardHeader>
                    <card_1.CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <lucide_react_1.Activity className="mr-2 h-4 w-4" />
                          {item.department} • {item.location}
                        </div>
                        <div className="flex items-center justify-between">
                          {getCriticalityBadge(item.criticality_level)}
                          <div className="flex space-x-1">
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Calendar className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Wrench className="h-4 w-4" />
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Settings className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                );
              })}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total} equipamentos
          </p>
          <div className="flex space-x-2">
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={function () {
                return setPage(function (p) {
                  return Math.max(1, p - 1);
                });
              }}
              disabled={page === 1}
            >
              Anterior
            </button_1.Button>
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={function () {
                return setPage(function (p) {
                  return p + 1;
                });
              }}
              disabled={page * 20 >= total}
            >
              Próxima
            </button_1.Button>
          </div>
        </div>
      )}
    </div>
  );
};
var AlertsList = function (_a) {
  var clinicId = _a.clinicId;
  var _b = (0, react_1.useState)([]),
    alerts = _b[0],
    setAlerts = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var fetchAlerts = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [
              4 /*yield*/,
              fetch("/api/maintenance/alerts/active?clinic_id=".concat(clinicId)),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch alerts");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setAlerts(data);
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Error fetching alerts:", error_2);
            (0, use_toast_1.toast)({
              title: "Erro",
              description: "Falha ao carregar alertas",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  (0, react_1.useEffect)(
    function () {
      fetchAlerts();
    },
    [clinicId],
  );
  var getSeverityIcon = function (severity) {
    switch (severity) {
      case "critical":
        return <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <lucide_react_1.AlertCircle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <lucide_react_1.Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <lucide_react_1.Bell className="h-4 w-4 text-gray-600" />;
    }
  };
  var getSeverityBadge = function (severity) {
    var severityMap = {
      critical: { label: "Crítico", className: "bg-red-100 text-red-800" },
      high: { label: "Alto", className: "bg-orange-100 text-orange-800" },
      medium: { label: "Médio", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Baixo", className: "bg-blue-100 text-blue-800" },
      info: { label: "Info", className: "bg-gray-100 text-gray-800" },
    };
    var config = severityMap[severity] || severityMap.info;
    return <badge_1.Badge className={config.className}>{config.label}</badge_1.Badge>;
  };
  var handleAcknowledge = function (alertId) {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/maintenance/alerts?alert_id=".concat(alertId, "&action=acknowledge"), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  acknowledged_by: "current_user", // TODO: Get from auth context
                  notes: "Alerta reconhecido via dashboard",
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to acknowledge alert");
            (0, use_toast_1.toast)({
              title: "Sucesso",
              description: "Alerta reconhecido com sucesso",
            });
            fetchAlerts(); // Refresh alerts
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error acknowledging alert:", error_3);
            (0, use_toast_1.toast)({
              title: "Erro",
              description: "Falha ao reconhecer alerta",
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return (
    <div className="space-y-4">
      {loading
        ? __spreadArray([], Array(3), true).map(function (_, i) {
            return (
              <card_1.Card key={i} className="animate-pulse">
                <card_1.CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-gray-300 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            );
          })
        : alerts.length === 0
          ? <card_1.Card>
              <card_1.CardContent className="p-8 text-center">
                <lucide_react_1.CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum alerta ativo</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Todos os equipamentos estão funcionando normalmente.
                </p>
              </card_1.CardContent>
            </card_1.Card>
          : alerts.map(function (alert) {
              return (
                <card_1.Card key={alert.id} className="border-l-4 border-l-red-500">
                  <card_1.CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <lucide_react_1.Calendar className="mr-1 h-3 w-3" />
                            {new Date(alert.created_at).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(alert.severity)}
                        {!alert.is_acknowledged && (
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={function () {
                              return handleAcknowledge(alert.id);
                            }}
                          >
                            Reconhecer
                          </button_1.Button>
                        )}
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
    </div>
  );
};
var MaintenanceDashboard = function (_a) {
  var clinicId = _a.clinicId;
  var _b = (0, react_1.useState)(null),
    summary = _b[0],
    setSummary = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var fetchSummary = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, data, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/maintenance/summary?clinic_id=".concat(clinicId))];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to fetch summary");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setSummary(data);
            return [3 /*break*/, 5];
          case 3:
            error_4 = _a.sent();
            console.error("Error fetching summary:", error_4);
            (0, use_toast_1.toast)({
              title: "Erro",
              description: "Falha ao carregar resumo de manutenção",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  (0, react_1.useEffect)(
    function () {
      fetchSummary();
    },
    [clinicId],
  );
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manutenção de Equipamentos</h1>
          <p className="text-gray-600">
            Gerencie cronogramas de manutenção e monitore alertas de equipamentos
          </p>
        </div>
        <div className="flex space-x-2">
          <button_1.Button variant="outline">
            <lucide_react_1.Filter className="mr-2 h-4 w-4" />
            Filtros
          </button_1.Button>
          <button_1.Button>
            <lucide_react_1.Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </button_1.Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="equipment" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="equipment">
            <lucide_react_1.Settings className="mr-2 h-4 w-4" />
            Equipamentos
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="schedules">
            <lucide_react_1.Calendar className="mr-2 h-4 w-4" />
            Cronogramas
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">
            <lucide_react_1.AlertTriangle className="mr-2 h-4 w-4" />
            Alertas
            {summary && summary.activeAlerts > 0 && (
              <badge_1.Badge className="ml-2 bg-red-100 text-red-800">
                {summary.activeAlerts}
              </badge_1.Badge>
            )}
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">
            <lucide_react_1.TrendingUp className="mr-2 h-4 w-4" />
            Análises
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="equipment">
          <EquipmentList clinicId={clinicId} />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="schedules">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Cronogramas de Manutenção</card_1.CardTitle>
              <card_1.CardDescription>
                Gerencie cronogramas preventivos e preditivos
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8">
                <lucide_react_1.Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Em desenvolvimento</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Interface de cronogramas será implementada em breve.
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="alerts">
          <AlertsList clinicId={clinicId} />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Análises e Relatórios</card_1.CardTitle>
              <card_1.CardDescription>
                Métricas de performance e custos de manutenção
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8">
                <lucide_react_1.TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Em desenvolvimento</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Dashboard de análises será implementado em breve.
                </p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
};
exports.default = MaintenanceDashboard;
