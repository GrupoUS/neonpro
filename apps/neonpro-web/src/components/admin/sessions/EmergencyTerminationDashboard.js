/**
 * Emergency Termination Dashboard Component
 * Story 1.4 - Task 8: Emergency termination capabilities
 *
 * Features:
 * - Real-time session monitoring
 * - Emergency termination controls
 * - Protocol management
 * - Audit log viewer
 * - Bulk termination operations
 * - Security incident response
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
exports.EmergencyTerminationDashboard = EmergencyTerminationDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var ui_1 = require("@/components/ui");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var SEVERITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};
var ROLE_COLORS = {
  owner: "bg-purple-100 text-purple-800",
  manager: "bg-blue-100 text-blue-800",
  employee: "bg-green-100 text-green-800",
  patient: "bg-gray-100 text-gray-800",
};
function EmergencyTerminationDashboard(_a) {
  var _this = this;
  var emergencyTermination = _a.emergencyTermination,
    currentUser = _a.currentUser;
  var _b = (0, react_1.useState)([]),
    activeSessions = _b[0],
    setActiveSessions = _b[1];
  var _c = (0, react_1.useState)([]),
    protocols = _c[0],
    setProtocols = _c[1];
  var _d = (0, react_1.useState)([]),
    auditLogs = _d[0],
    setAuditLogs = _d[1];
  var _e = (0, react_1.useState)(null),
    config = _e[0],
    setConfig = _e[1];
  var _f = (0, react_1.useState)(true),
    loading = _f[0],
    setLoading = _f[1];
  var _g = (0, react_1.useState)([]),
    selectedSessions = _g[0],
    setSelectedSessions = _g[1];
  var _h = (0, react_1.useState)(false),
    terminationInProgress = _h[0],
    setTerminationInProgress = _h[1];
  var _j = (0, react_1.useState)(false),
    showTerminationDialog = _j[0],
    setShowTerminationDialog = _j[1];
  var _k = (0, react_1.useState)(false),
    showProtocolDialog = _k[0],
    setShowProtocolDialog = _k[1];
  var _l = (0, react_1.useState)(""),
    terminationReason = _l[0],
    setTerminationReason = _l[1];
  var _m = (0, react_1.useState)("single"),
    terminationType = _m[0],
    setTerminationType = _m[1];
  var _o = (0, react_1.useState)(true),
    preserveData = _o[0],
    setPreserveData = _o[1];
  var _p = (0, react_1.useState)(true),
    notifyUsers = _p[0],
    setNotifyUsers = _p[1];
  var _q = (0, react_1.useState)(""),
    selectedProtocol = _q[0],
    setSelectedProtocol = _q[1];
  var _r = (0, react_1.useState)(null),
    refreshInterval = _r[0],
    setRefreshInterval = _r[1];
  var _s = (0, react_1.useState)({
      totalSessions: 0,
      highRiskSessions: 0,
      recentTerminations: 0,
      activeProtocols: 0,
    }),
    stats = _s[0],
    setStats = _s[1];
  // Load initial data
  (0, react_1.useEffect)(function () {
    loadDashboardData();
    // Set up auto-refresh
    var interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);
    return function () {
      if (interval) clearInterval(interval);
    };
  }, []);
  var loadDashboardData = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var mockSessions, protocolsList, logs, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, 3, 4]);
              setLoading(true);
              mockSessions = [
                {
                  sessionId: "sess_001",
                  userId: "user_001",
                  userEmail: "admin@clinic.com",
                  userName: "Dr. Silva",
                  userRole: "manager",
                  deviceId: "dev_001",
                  deviceName: "Desktop - Chrome",
                  ipAddress: "192.168.1.100",
                  location: "São Paulo, SP",
                  startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                  lastActivity: new Date(Date.now() - 5 * 60 * 1000),
                  isActive: true,
                  riskLevel: "low",
                },
                {
                  sessionId: "sess_002",
                  userId: "user_002",
                  userEmail: "nurse@clinic.com",
                  userName: "Enfermeira Ana",
                  userRole: "employee",
                  deviceId: "dev_002",
                  deviceName: "Mobile - Safari",
                  ipAddress: "192.168.1.101",
                  location: "Rio de Janeiro, RJ",
                  startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                  lastActivity: new Date(Date.now() - 1 * 60 * 1000),
                  isActive: true,
                  riskLevel: "medium",
                },
                {
                  sessionId: "sess_003",
                  userId: "user_003",
                  userEmail: "suspicious@external.com",
                  userName: "Unknown User",
                  userRole: "patient",
                  deviceId: "dev_003",
                  deviceName: "Unknown Device",
                  ipAddress: "203.0.113.1",
                  location: "Unknown Location",
                  startedAt: new Date(Date.now() - 30 * 60 * 1000),
                  lastActivity: new Date(Date.now() - 2 * 60 * 1000),
                  isActive: true,
                  riskLevel: "critical",
                },
              ];
              setActiveSessions(mockSessions);
              protocolsList = emergencyTermination.getProtocols();
              setProtocols(protocolsList);
              return [
                4 /*yield*/,
                emergencyTermination.getTerminationLogs({
                  limit: 50,
                }),
              ];
            case 1:
              logs = _a.sent();
              setAuditLogs(logs);
              // Calculate stats
              setStats({
                totalSessions: mockSessions.length,
                highRiskSessions: mockSessions.filter(function (s) {
                  return s.riskLevel === "high" || s.riskLevel === "critical";
                }).length,
                recentTerminations: logs.filter(function (log) {
                  return new Date(log.terminatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
                }).length,
                activeProtocols: protocolsList.filter(function (p) {
                  return p.isActive;
                }).length,
              });
              return [3 /*break*/, 4];
            case 2:
              error_1 = _a.sent();
              console.error("Failed to load dashboard data:", error_1);
              sonner_1.toast.error("Erro ao carregar dados do dashboard");
              return [3 /*break*/, 4];
            case 3:
              setLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [emergencyTermination],
  );
  var handleSessionSelection = function (sessionId, selected) {
    if (selected) {
      setSelectedSessions(function (prev) {
        return __spreadArray(__spreadArray([], prev, true), [sessionId], false);
      });
    } else {
      setSelectedSessions(function (prev) {
        return prev.filter(function (id) {
          return id !== sessionId;
        });
      });
    }
  };
  var handleSelectAll = function () {
    if (selectedSessions.length === activeSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(
        activeSessions.map(function (s) {
          return s.sessionId;
        }),
      );
    }
  };
  var handleTerminateSession = function (sessionId) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!terminationReason.trim()) {
              sonner_1.toast.error("Motivo da terminação é obrigatório");
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            setTerminationInProgress(true);
            return [
              4 /*yield*/,
              emergencyTermination.terminateSession(
                sessionId,
                currentUser.id,
                terminationReason,
                preserveData,
              ),
            ];
          case 2:
            result = _a.sent();
            if (!result.success) return [3 /*break*/, 4];
            sonner_1.toast.success("Sess\u00E3o terminada com sucesso");
            setSelectedSessions(function (prev) {
              return prev.filter(function (id) {
                return id !== sessionId;
              });
            });
            return [4 /*yield*/, loadDashboardData()];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            sonner_1.toast.error(
              "Falha ao terminar sess\u00E3o: ".concat(result.errors.join(", ")),
            );
            _a.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            error_2 = _a.sent();
            console.error("Failed to terminate session:", error_2);
            sonner_1.toast.error("Erro ao terminar sessão");
            return [3 /*break*/, 8];
          case 7:
            setTerminationInProgress(false);
            setShowTerminationDialog(false);
            setTerminationReason("");
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleBulkTermination = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var results, successful, failed, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!terminationReason.trim()) {
              sonner_1.toast.error("Motivo da terminação é obrigatório");
              return [2 /*return*/];
            }
            if (selectedSessions.length === 0) {
              sonner_1.toast.error("Selecione pelo menos uma sessão");
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            setTerminationInProgress(true);
            return [
              4 /*yield*/,
              Promise.all(
                selectedSessions.map(function (sessionId) {
                  return emergencyTermination.terminateSession(
                    sessionId,
                    currentUser.id,
                    terminationReason,
                    preserveData,
                  );
                }),
              ),
            ];
          case 2:
            results = _a.sent();
            successful = results.filter(function (r) {
              return r.success;
            }).length;
            failed = results.filter(function (r) {
              return !r.success;
            }).length;
            if (successful > 0) {
              sonner_1.toast.success("".concat(successful, " sess\u00F5es terminadas com sucesso"));
            }
            if (failed > 0) {
              sonner_1.toast.error("".concat(failed, " sess\u00F5es falharam ao terminar"));
            }
            setSelectedSessions([]);
            return [4 /*yield*/, loadDashboardData()];
          case 3:
            _a.sent();
            return [3 /*break*/, 6];
          case 4:
            error_3 = _a.sent();
            console.error("Failed to terminate sessions:", error_3);
            sonner_1.toast.error("Erro ao terminar sessões");
            return [3 /*break*/, 6];
          case 5:
            setTerminationInProgress(false);
            setShowTerminationDialog(false);
            setTerminationReason("");
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleTerminateAll = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var result, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!terminationReason.trim()) {
              sonner_1.toast.error("Motivo da terminação é obrigatório");
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            setTerminationInProgress(true);
            return [
              4 /*yield*/,
              emergencyTermination.terminateAllSessions(
                currentUser.id,
                terminationReason,
                preserveData,
              ),
            ];
          case 2:
            result = _a.sent();
            if (!result.success) return [3 /*break*/, 4];
            sonner_1.toast.success(
              "Todas as sess\u00F5es foram terminadas (".concat(
                result.totalSuccessful,
                " sess\u00F5es)",
              ),
            );
            setSelectedSessions([]);
            return [4 /*yield*/, loadDashboardData()];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            sonner_1.toast.error(
              "Falha ao terminar todas as sess\u00F5es: ".concat(result.errors.join(", ")),
            );
            _a.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            error_4 = _a.sent();
            console.error("Failed to terminate all sessions:", error_4);
            sonner_1.toast.error("Erro ao terminar todas as sessões");
            return [3 /*break*/, 8];
          case 7:
            setTerminationInProgress(false);
            setShowTerminationDialog(false);
            setTerminationReason("");
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleExecuteProtocol = function (protocolId) {
    return __awaiter(_this, void 0, void 0, function () {
      var result, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setTerminationInProgress(true);
            return [
              4 /*yield*/,
              emergencyTermination.executeProtocol(protocolId, currentUser.id, currentUser.role),
            ];
          case 1:
            result = _a.sent();
            if (!result.success) return [3 /*break*/, 3];
            sonner_1.toast.success(
              "Protocolo executado com sucesso (".concat(
                result.totalSuccessful,
                " sess\u00F5es terminadas)",
              ),
            );
            return [4 /*yield*/, loadDashboardData()];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            sonner_1.toast.error("Falha ao executar protocolo: ".concat(result.errors.join(", ")));
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_5 = _a.sent();
            console.error("Failed to execute protocol:", error_5);
            sonner_1.toast.error("Erro ao executar protocolo");
            return [3 /*break*/, 7];
          case 6:
            setTerminationInProgress(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var getRiskLevelIcon = function (riskLevel) {
    switch (riskLevel) {
      case "low":
        return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />;
      case "medium":
        return <lucide_react_1.AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "high":
        return <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "critical":
        return <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <lucide_react_1.Activity className="h-4 w-4 text-gray-600" />;
    }
  };
  var getSeverityIcon = function (severity) {
    switch (severity) {
      case "low":
        return <lucide_react_1.CheckCircle className="h-4 w-4" />;
      case "medium":
        return <lucide_react_1.AlertCircle className="h-4 w-4" />;
      case "high":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      case "critical":
        return <lucide_react_1.XCircle className="h-4 w-4" />;
      default:
        return <lucide_react_1.Activity className="h-4 w-4" />;
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Emergência</h1>
          <p className="text-muted-foreground">Monitoramento e controle de terminação de sessões</p>
        </div>
        <div className="flex items-center space-x-2">
          <ui_1.Button variant="outline" size="sm" onClick={loadDashboardData} disabled={loading}>
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(loading ? "animate-spin" : "")}
            />
            Atualizar
          </ui_1.Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Sessões Ativas</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">{selectedSessions.length} selecionadas</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Alto Risco</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRiskSessions}</div>
            <p className="text-xs text-muted-foreground">Requer atenção imediata</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Terminações (24h)</card_1.CardTitle>
            <lucide_react_1.Ban className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.recentTerminations}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Protocolos Ativos</card_1.CardTitle>
            <lucide_react_1.Shield className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{stats.activeProtocols}</div>
            <p className="text-xs text-muted-foreground">Prontos para execução</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Emergency Actions */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Zap className="h-5 w-5 mr-2 text-red-600" />
            Ações de Emergência
          </card_1.CardTitle>
          <card_1.CardDescription>Controles rápidos para situações críticas</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex flex-wrap gap-2">
            {protocols
              .filter(function (p) {
                return p.isActive;
              })
              .map(function (protocol) {
                return (
                  <ui_1.Button
                    key={protocol.protocolId}
                    variant={protocol.severity === "critical" ? "destructive" : "outline"}
                    size="sm"
                    onClick={function () {
                      return handleExecuteProtocol(protocol.protocolId);
                    }}
                    disabled={terminationInProgress}
                    className="flex items-center"
                  >
                    {getSeverityIcon(protocol.severity)}
                    <span className="ml-2">{protocol.name}</span>
                  </ui_1.Button>
                );
              })}

            <ui_1.Dialog open={showTerminationDialog} onOpenChange={setShowTerminationDialog}>
              <ui_1.DialogTrigger asChild>
                <ui_1.Button
                  variant="destructive"
                  size="sm"
                  disabled={terminationInProgress}
                  onClick={function () {
                    setTerminationType("all");
                    setShowTerminationDialog(true);
                  }}
                >
                  <lucide_react_1.Ban className="h-4 w-4 mr-2" />
                  Terminar Todas as Sessões
                </ui_1.Button>
              </ui_1.DialogTrigger>
            </ui_1.Dialog>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Main Content Tabs */}
      <ui_1.Tabs defaultValue="sessions" className="space-y-4">
        <ui_1.TabsList>
          <ui_1.TabsTrigger value="sessions">Sessões Ativas</ui_1.TabsTrigger>
          <ui_1.TabsTrigger value="protocols">Protocolos</ui_1.TabsTrigger>
          <ui_1.TabsTrigger value="audit">Log de Auditoria</ui_1.TabsTrigger>
          <ui_1.TabsTrigger value="settings">Configurações</ui_1.TabsTrigger>
        </ui_1.TabsList>

        {/* Active Sessions Tab */}
        <ui_1.TabsContent value="sessions" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle>Sessões Ativas</card_1.CardTitle>
                  <card_1.CardDescription>
                    {activeSessions.length} sessões ativas no sistema
                  </card_1.CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedSessions.length > 0 && (
                    <ui_1.Dialog
                      open={showTerminationDialog}
                      onOpenChange={setShowTerminationDialog}
                    >
                      <ui_1.DialogTrigger asChild>
                        <ui_1.Button
                          variant="destructive"
                          size="sm"
                          disabled={terminationInProgress}
                          onClick={function () {
                            setTerminationType("bulk");
                            setShowTerminationDialog(true);
                          }}
                        >
                          <lucide_react_1.Ban className="h-4 w-4 mr-2" />
                          Terminar Selecionadas ({selectedSessions.length})
                        </ui_1.Button>
                      </ui_1.DialogTrigger>
                    </ui_1.Dialog>
                  )}
                </div>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="rounded-md border">
                <ui_1.Table>
                  <ui_1.TableHeader>
                    <ui_1.TableRow>
                      <ui_1.TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedSessions.length === activeSessions.length &&
                            activeSessions.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </ui_1.TableHead>
                      <ui_1.TableHead>Usuário</ui_1.TableHead>
                      <ui_1.TableHead>Dispositivo</ui_1.TableHead>
                      <ui_1.TableHead>Localização</ui_1.TableHead>
                      <ui_1.TableHead>Atividade</ui_1.TableHead>
                      <ui_1.TableHead>Risco</ui_1.TableHead>
                      <ui_1.TableHead>Ações</ui_1.TableHead>
                    </ui_1.TableRow>
                  </ui_1.TableHeader>
                  <ui_1.TableBody>
                    {activeSessions.map(function (session) {
                      return (
                        <ui_1.TableRow key={session.sessionId}>
                          <ui_1.TableCell>
                            <input
                              type="checkbox"
                              checked={selectedSessions.includes(session.sessionId)}
                              onChange={function (e) {
                                return handleSessionSelection(session.sessionId, e.target.checked);
                              }}
                              className="rounded"
                            />
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{session.userName}</span>
                              <span className="text-sm text-muted-foreground">
                                {session.userEmail}
                              </span>
                              <ui_1.Badge
                                className={"w-fit mt-1 ".concat(ROLE_COLORS[session.userRole])}
                              >
                                {session.userRole}
                              </ui_1.Badge>
                            </div>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{session.deviceName}</span>
                              <span className="text-sm text-muted-foreground">
                                {session.ipAddress}
                              </span>
                            </div>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <span className="text-sm">{session.location}</span>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">
                                Iniciada{" "}
                                {(0, date_fns_1.formatDistanceToNow)(session.startedAt, {
                                  addSuffix: true,
                                  locale: locale_1.ptBR,
                                })}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Última atividade{" "}
                                {(0, date_fns_1.formatDistanceToNow)(session.lastActivity, {
                                  addSuffix: true,
                                  locale: locale_1.ptBR,
                                })}
                              </span>
                            </div>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <div className="flex items-center space-x-2">
                              {getRiskLevelIcon(session.riskLevel)}
                              <ui_1.Badge className={SEVERITY_COLORS[session.riskLevel]}>
                                {session.riskLevel}
                              </ui_1.Badge>
                            </div>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <div className="flex items-center space-x-2">
                              <ui_1.Button
                                variant="outline"
                                size="sm"
                                onClick={function () {
                                  // View session details
                                  sonner_1.toast.info("Funcionalidade em desenvolvimento");
                                }}
                              >
                                <lucide_react_1.Eye className="h-4 w-4" />
                              </ui_1.Button>
                              <ui_1.Dialog>
                                <ui_1.DialogTrigger asChild>
                                  <ui_1.Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={terminationInProgress}
                                  >
                                    <lucide_react_1.Ban className="h-4 w-4" />
                                  </ui_1.Button>
                                </ui_1.DialogTrigger>
                                <ui_1.DialogContent>
                                  <ui_1.DialogHeader>
                                    <ui_1.DialogTitle>Terminar Sessão</ui_1.DialogTitle>
                                    <ui_1.DialogDescription>
                                      Tem certeza que deseja terminar a sessão de {session.userName}
                                      ?
                                    </ui_1.DialogDescription>
                                  </ui_1.DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <ui_1.Label htmlFor="reason">Motivo da terminação</ui_1.Label>
                                      <ui_1.Textarea
                                        id="reason"
                                        placeholder="Descreva o motivo da terminação..."
                                        value={terminationReason}
                                        onChange={function (e) {
                                          return setTerminationReason(e.target.value);
                                        }}
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <ui_1.Switch
                                        id="preserve-data"
                                        checked={preserveData}
                                        onCheckedChange={setPreserveData}
                                      />
                                      <ui_1.Label htmlFor="preserve-data">
                                        Preservar dados da sessão
                                      </ui_1.Label>
                                    </div>
                                  </div>
                                  <ui_1.DialogFooter>
                                    <ui_1.Button
                                      variant="destructive"
                                      onClick={function () {
                                        return handleTerminateSession(session.sessionId);
                                      }}
                                      disabled={terminationInProgress || !terminationReason.trim()}
                                    >
                                      {terminationInProgress
                                        ? <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        : <lucide_react_1.Ban className="h-4 w-4 mr-2" />}
                                      Terminar Sessão
                                    </ui_1.Button>
                                  </ui_1.DialogFooter>
                                </ui_1.DialogContent>
                              </ui_1.Dialog>
                            </div>
                          </ui_1.TableCell>
                        </ui_1.TableRow>
                      );
                    })}
                  </ui_1.TableBody>
                </ui_1.Table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </ui_1.TabsContent>

        {/* Protocols Tab */}
        <ui_1.TabsContent value="protocols" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle>Protocolos de Emergência</card_1.CardTitle>
                  <card_1.CardDescription>
                    Protocolos automatizados para resposta a incidentes
                  </card_1.CardDescription>
                </div>
                <ui_1.Button
                  variant="outline"
                  size="sm"
                  onClick={function () {
                    return setShowProtocolDialog(true);
                  }}
                >
                  <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                  Novo Protocolo
                </ui_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {protocols.map(function (protocol) {
                  return (
                    <card_1.Card key={protocol.protocolId} className="border-l-4 border-l-blue-500">
                      <card_1.CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ui_1.Badge className={SEVERITY_COLORS[protocol.severity]}>
                              {protocol.severity}
                            </ui_1.Badge>
                            <h3 className="font-semibold">{protocol.name}</h3>
                            {protocol.automaticTrigger && (
                              <ui_1.Badge variant="outline">
                                <lucide_react_1.Zap className="h-3 w-3 mr-1" />
                                Auto
                              </ui_1.Badge>
                            )}
                            {!protocol.isActive && (
                              <ui_1.Badge variant="secondary">
                                <lucide_react_1.Pause className="h-3 w-3 mr-1" />
                                Inativo
                              </ui_1.Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <ui_1.Button
                              variant="outline"
                              size="sm"
                              onClick={function () {
                                return handleExecuteProtocol(protocol.protocolId);
                              }}
                              disabled={!protocol.isActive || terminationInProgress}
                            >
                              <lucide_react_1.Play className="h-4 w-4 mr-2" />
                              Executar
                            </ui_1.Button>
                          </div>
                        </div>
                      </card_1.CardHeader>
                      <card_1.CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{protocol.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Condições de Ativação:</strong>
                            <ul className="list-disc list-inside mt-1 text-muted-foreground">
                              {protocol.triggerConditions.map(function (condition, index) {
                                return <li key={index}>{condition}</li>;
                              })}
                            </ul>
                          </div>

                          <div>
                            <strong>Ações:</strong>
                            <ul className="list-disc list-inside mt-1 text-muted-foreground">
                              {protocol.actions.terminateAllSessions && (
                                <li>Terminar todas as sessões</li>
                              )}
                              {protocol.actions.lockAccounts && <li>Bloquear contas</li>}
                              {protocol.actions.disableNewLogins && (
                                <li>Desabilitar novos logins</li>
                              )}
                              {protocol.actions.notifyAdministrators && (
                                <li>Notificar administradores</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {protocol.lastTriggered && (
                          <div className="mt-4 pt-4 border-t">
                            <span className="text-sm text-muted-foreground">
                              Última execução:{" "}
                              {(0, date_fns_1.format)(protocol.lastTriggered, "dd/MM/yyyy HH:mm", {
                                locale: locale_1.ptBR,
                              })}
                            </span>
                          </div>
                        )}
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </ui_1.TabsContent>

        {/* Audit Log Tab */}
        <ui_1.TabsContent value="audit" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle>Log de Auditoria</card_1.CardTitle>
                  <card_1.CardDescription>
                    Histórico de terminações de sessão
                  </card_1.CardDescription>
                </div>
                <ui_1.Button
                  variant="outline"
                  size="sm"
                  onClick={function () {
                    // Export audit logs
                    sonner_1.toast.info("Funcionalidade de exportação em desenvolvimento");
                  }}
                >
                  <lucide_react_1.Download className="h-4 w-4 mr-2" />
                  Exportar
                </ui_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="rounded-md border">
                <ui_1.Table>
                  <ui_1.TableHeader>
                    <ui_1.TableRow>
                      <ui_1.TableHead>Data/Hora</ui_1.TableHead>
                      <ui_1.TableHead>Usuário</ui_1.TableHead>
                      <ui_1.TableHead>Iniciado Por</ui_1.TableHead>
                      <ui_1.TableHead>Tipo</ui_1.TableHead>
                      <ui_1.TableHead>Motivo</ui_1.TableHead>
                      <ui_1.TableHead>Status</ui_1.TableHead>
                    </ui_1.TableRow>
                  </ui_1.TableHeader>
                  <ui_1.TableBody>
                    {auditLogs.map(function (log) {
                      return (
                        <ui_1.TableRow key={log.logId}>
                          <ui_1.TableCell>
                            {(0, date_fns_1.format)(log.terminatedAt, "dd/MM/yyyy HH:mm", {
                              locale: locale_1.ptBR,
                            })}
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{log.userId}</span>
                              <span className="text-sm text-muted-foreground">{log.sessionId}</span>
                            </div>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{log.initiatedBy}</span>
                              <ui_1.Badge
                                className={"w-fit ".concat(ROLE_COLORS[log.initiatorRole])}
                              >
                                {log.initiatorRole}
                              </ui_1.Badge>
                            </div>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <ui_1.Badge variant="outline">{log.terminationType}</ui_1.Badge>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <span className="text-sm">{log.reason}</span>
                          </ui_1.TableCell>
                          <ui_1.TableCell>
                            <div className="flex items-center space-x-2">
                              {log.success
                                ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                                : <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />}
                              <span className={log.success ? "text-green-600" : "text-red-600"}>
                                {log.success ? "Sucesso" : "Falha"}
                              </span>
                            </div>
                          </ui_1.TableCell>
                        </ui_1.TableRow>
                      );
                    })}
                  </ui_1.TableBody>
                </ui_1.Table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </ui_1.TabsContent>

        {/* Settings Tab */}
        <ui_1.TabsContent value="settings" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Configurações de Emergência</card_1.CardTitle>
              <card_1.CardDescription>
                Configure as políticas de terminação de emergência
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-6">
                <ui_1.Alert>
                  <lucide_react_1.AlertTriangle className="h-4 w-4" />
                  <ui_1.AlertTitle>Configurações Avançadas</ui_1.AlertTitle>
                  <ui_1.AlertDescription>
                    As configurações de emergência devem ser ajustadas apenas por administradores
                    experientes. Mudanças inadequadas podem comprometer a segurança do sistema.
                  </ui_1.AlertDescription>
                </ui_1.Alert>

                <div className="text-center py-8">
                  <lucide_react_1.Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Configurações em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Interface de configuração será implementada na próxima versão
                  </p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </ui_1.TabsContent>
      </ui_1.Tabs>

      {/* Termination Dialog */}
      <ui_1.Dialog open={showTerminationDialog} onOpenChange={setShowTerminationDialog}>
        <ui_1.DialogContent className="max-w-md">
          <ui_1.DialogHeader>
            <ui_1.DialogTitle className="flex items-center">
              <lucide_react_1.AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              {terminationType === "all"
                ? "Terminar Todas as Sessões"
                : terminationType === "bulk"
                  ? "Terminar ".concat(selectedSessions.length, " Sess\u00F5es")
                  : "Terminar Sessão"}
            </ui_1.DialogTitle>
            <ui_1.DialogDescription>
              {terminationType === "all"
                ? "Esta ação irá terminar TODAS as sessões ativas no sistema. Esta ação não pode ser desfeita."
                : terminationType === "bulk"
                  ? "Esta a\u00E7\u00E3o ir\u00E1 terminar ".concat(
                      selectedSessions.length,
                      " sess\u00F5es selecionadas. Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita.",
                    )
                  : "Esta ação irá terminar a sessão selecionada. Esta ação não pode ser desfeita."}
            </ui_1.DialogDescription>
          </ui_1.DialogHeader>

          <div className="space-y-4">
            <div>
              <ui_1.Label htmlFor="termination-reason">Motivo da terminação *</ui_1.Label>
              <ui_1.Textarea
                id="termination-reason"
                placeholder="Descreva o motivo da terminação de emergência..."
                value={terminationReason}
                onChange={function (e) {
                  return setTerminationReason(e.target.value);
                }}
                className="mt-1"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <ui_1.Switch
                  id="preserve-session-data"
                  checked={preserveData}
                  onCheckedChange={setPreserveData}
                />
                <ui_1.Label htmlFor="preserve-session-data">Preservar dados das sessões</ui_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <ui_1.Switch
                  id="notify-affected-users"
                  checked={notifyUsers}
                  onCheckedChange={setNotifyUsers}
                />
                <ui_1.Label htmlFor="notify-affected-users">Notificar usuários afetados</ui_1.Label>
              </div>
            </div>
          </div>

          <ui_1.DialogFooter>
            <ui_1.Button
              variant="outline"
              onClick={function () {
                setShowTerminationDialog(false);
                setTerminationReason("");
              }}
              disabled={terminationInProgress}
            >
              Cancelar
            </ui_1.Button>
            <ui_1.Button
              variant="destructive"
              onClick={function () {
                if (terminationType === "all") {
                  handleTerminateAll();
                } else if (terminationType === "bulk") {
                  handleBulkTermination();
                }
              }}
              disabled={terminationInProgress || !terminationReason.trim()}
            >
              {terminationInProgress
                ? <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                : <lucide_react_1.Ban className="h-4 w-4 mr-2" />}
              {terminationType === "all"
                ? "Terminar Todas"
                : terminationType === "bulk"
                  ? "Terminar Selecionadas"
                  : "Terminar"}
            </ui_1.Button>
          </ui_1.DialogFooter>
        </ui_1.DialogContent>
      </ui_1.Dialog>
    </div>
  );
}
