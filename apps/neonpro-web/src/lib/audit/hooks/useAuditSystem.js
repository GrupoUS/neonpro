/**
 * NeonPro Audit System React Hooks
 *
 * Hooks para integração do sistema de auditoria com React,
 * fornecendo funcionalidades para consulta de logs, geração
 * de relatórios, monitoramento de alertas e estatísticas.
 *
 * Features:
 * - useAuditLogs: Consulta e filtros de logs
 * - useAuditReports: Geração e gestão de relatórios
 * - useSecurityAlerts: Monitoramento de alertas
 * - useAuditStatistics: Estatísticas e métricas
 * - useAuditLogger: Logging de eventos
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuditLogs = useAuditLogs;
exports.useSecurityAlerts = useSecurityAlerts;
exports.useAuditReports = useAuditReports;
exports.useAuditStatistics = useAuditStatistics;
exports.useAuditLogger = useAuditLogger;
exports.useAudit = useAudit;
var react_1 = require("react");
var useUser_1 = require("@/hooks/useUser");
var audit_system_1 = require("../audit-system");
var client_1 = require("@/lib/supabase/client");
var useToast_1 = require("@/hooks/useToast");
// =====================================================
// HOOK: useAuditLogs
// =====================================================
/**
 * Hook para consulta e gestão de logs de auditoria
 */
function useAuditLogs(options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.autoRefresh,
    autoRefresh = _a === void 0 ? false : _a,
    _b = options.refreshInterval,
    refreshInterval = _b === void 0 ? 30000 : _b,
    _c = options.initialFilters,
    initialFilters = _c === void 0 ? {} : _c;
  var _d = (0, react_1.useState)([]),
    logs = _d[0],
    setLogs = _d[1];
  var _e = (0, react_1.useState)(false),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var _g = (0, react_1.useState)(initialFilters),
    filters = _g[0],
    setFilters = _g[1];
  var _h = (0, react_1.useState)(0),
    totalCount = _h[0],
    setTotalCount = _h[1];
  var toast = (0, useToast_1.useToast)().toast;
  var fetchLogs = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var events, err_1, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, 3, 4]);
              setLoading(true);
              setError(null);
              return [4 /*yield*/, createauditSystem().queryEvents(filters)];
            case 1:
              events = _a.sent();
              setLogs(events);
              setTotalCount(events.length);
              return [3 /*break*/, 4];
            case 2:
              err_1 = _a.sent();
              errorMessage = err_1 instanceof Error ? err_1.message : "Erro ao carregar logs";
              setError(errorMessage);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 3:
              setLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [filters, toast],
  );
  var exportLogs = (0, react_1.useCallback)(
    (format) =>
      __awaiter(this, void 0, void 0, function () {
        var events, dataStr, dataBlob, url, link, headers, csvContent, dataBlob, url, link, err_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, createauditSystem().queryEvents(filters)];
            case 1:
              events = _a.sent();
              if (format === "json") {
                dataStr = JSON.stringify(events, null, 2);
                dataBlob = new Blob([dataStr], { type: "application/json" });
                url = URL.createObjectURL(dataBlob);
                link = document.createElement("a");
                link.href = url;
                link.download = "audit-logs-".concat(
                  new Date().toISOString().split("T")[0],
                  ".json",
                );
                link.click();
                URL.revokeObjectURL(url);
              } else if (format === "csv") {
                headers = [
                  "Timestamp",
                  "Event Type",
                  "Severity",
                  "User ID",
                  "Description",
                  "IP Address",
                ];
                csvContent = __spreadArray(
                  [headers.join(",")],
                  events.map((event) =>
                    [
                      event.timestamp.toISOString(),
                      event.event_type,
                      event.severity,
                      event.user_id || "",
                      '"'.concat(event.description.replace(/"/g, '""'), '"'),
                      event.ip_address || "",
                    ].join(","),
                  ),
                  true,
                ).join("\n");
                dataBlob = new Blob([csvContent], { type: "text/csv" });
                url = URL.createObjectURL(dataBlob);
                link = document.createElement("a");
                link.href = url;
                link.download = "audit-logs-".concat(
                  new Date().toISOString().split("T")[0],
                  ".csv",
                );
                link.click();
                URL.revokeObjectURL(url);
              }
              toast({
                title: "Sucesso",
                description: "Logs exportados em formato ".concat(format.toUpperCase()),
              });
              return [3 /*break*/, 3];
            case 2:
              err_2 = _a.sent();
              toast({
                title: "Erro",
                description: "Erro ao exportar logs",
                variant: "destructive",
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [filters, toast],
  );
  // Auto refresh
  (0, react_1.useEffect)(() => {
    if (autoRefresh) {
      var interval_1 = setInterval(fetchLogs, refreshInterval);
      return () => clearInterval(interval_1);
    }
  }, [autoRefresh, refreshInterval, fetchLogs]);
  // Initial load
  (0, react_1.useEffect)(() => {
    fetchLogs();
  }, [fetchLogs]);
  return {
    logs: logs,
    loading: loading,
    error: error,
    filters: filters,
    setFilters: setFilters,
    refresh: fetchLogs,
    exportLogs: exportLogs,
    totalCount: totalCount,
  };
}
// =====================================================
// HOOK: useSecurityAlerts
// =====================================================
/**
 * Hook para monitoramento de alertas de segurança
 */
function useSecurityAlerts() {
  var _a = (0, react_1.useState)([]),
    alerts = _a[0],
    setAlerts = _a[1];
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var _d = (0, react_1.useState)(0),
    unreadCount = _d[0],
    setUnreadCount = _d[1];
  var supabase = yield (0, client_1.createClient)();
  var toast = (0, useToast_1.useToast)().toast;
  var fetchAlerts = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, data, fetchError, formattedAlerts, err_3, errorMessage;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, 3, 4]);
              setLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                supabase
                  .from("security_alerts")
                  .select("*")
                  .order("created_at", { ascending: false })
                  .limit(100),
              ];
            case 1:
              (_a = _b.sent()), (data = _a.data), (fetchError = _a.error);
              if (fetchError) throw fetchError;
              formattedAlerts =
                (data === null || data === void 0
                  ? void 0
                  : data.map((alert) =>
                      __assign(__assign({}, alert), {
                        created_at: new Date(alert.created_at),
                        resolved_at: alert.resolved_at ? new Date(alert.resolved_at) : undefined,
                      }),
                    )) || [];
              setAlerts(formattedAlerts);
              setUnreadCount(formattedAlerts.filter((alert) => alert.status === "open").length);
              return [3 /*break*/, 4];
            case 2:
              err_3 = _b.sent();
              errorMessage = err_3 instanceof Error ? err_3.message : "Erro ao carregar alertas";
              setError(errorMessage);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 3:
              setLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, toast],
  );
  var markAsRead = (0, react_1.useCallback)(
    (alertId) =>
      __awaiter(this, void 0, void 0, function () {
        var error_1, err_4;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                supabase
                  .from("security_alerts")
                  .update({ status: "investigating" })
                  .eq("id", alertId),
              ];
            case 1:
              error_1 = _a.sent().error;
              if (error_1) throw error_1;
              return [4 /*yield*/, fetchAlerts()];
            case 2:
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              err_4 = _a.sent();
              toast({
                title: "Erro",
                description: "Erro ao marcar alerta como lido",
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, fetchAlerts, toast],
  );
  var updateStatus = (0, react_1.useCallback)(
    (alertId, status) =>
      __awaiter(this, void 0, void 0, function () {
        var updateData, error_2, err_5;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              updateData = { status: status };
              if (status === "resolved") {
                updateData.resolved_at = new Date().toISOString();
              }
              return [
                4 /*yield*/,
                supabase.from("security_alerts").update(updateData).eq("id", alertId),
              ];
            case 1:
              error_2 = _a.sent().error;
              if (error_2) throw error_2;
              return [4 /*yield*/, fetchAlerts()];
            case 2:
              _a.sent();
              toast({
                title: "Sucesso",
                description: "Status do alerta atualizado",
              });
              return [3 /*break*/, 4];
            case 3:
              err_5 = _a.sent();
              toast({
                title: "Erro",
                description: "Erro ao atualizar status do alerta",
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, fetchAlerts, toast],
  );
  var assignAlert = (0, react_1.useCallback)(
    (alertId, userId) =>
      __awaiter(this, void 0, void 0, function () {
        var error_3, err_6;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                supabase.from("security_alerts").update({ assigned_to: userId }).eq("id", alertId),
              ];
            case 1:
              error_3 = _a.sent().error;
              if (error_3) throw error_3;
              return [4 /*yield*/, fetchAlerts()];
            case 2:
              _a.sent();
              toast({
                title: "Sucesso",
                description: "Alerta atribuído com sucesso",
              });
              return [3 /*break*/, 4];
            case 3:
              err_6 = _a.sent();
              toast({
                title: "Erro",
                description: "Erro ao atribuir alerta",
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, fetchAlerts, toast],
  );
  (0, react_1.useEffect)(() => {
    fetchAlerts();
    // Configura real-time subscription
    var subscription = supabase
      .channel("security_alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "security_alerts",
        },
        () => {
          fetchAlerts();
        },
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAlerts, supabase]);
  return {
    alerts: alerts,
    loading: loading,
    error: error,
    unreadCount: unreadCount,
    refresh: fetchAlerts,
    markAsRead: markAsRead,
    updateStatus: updateStatus,
    assignAlert: assignAlert,
  };
}
// =====================================================
// HOOK: useAuditReports
// =====================================================
/**
 * Hook para geração e gestão de relatórios de auditoria
 */
function useAuditReports() {
  var _a = (0, react_1.useState)([]),
    reports = _a[0],
    setReports = _a[1];
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var user = (0, useUser_1.useUser)().user;
  var supabase = yield (0, client_1.createClient)();
  var toast = (0, useToast_1.useToast)().toast;
  var fetchReports = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, data, fetchError, formattedReports, err_7, errorMessage;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, 3, 4]);
              setLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                supabase
                  .from("audit_reports")
                  .select("*")
                  .order("generated_at", { ascending: false }),
              ];
            case 1:
              (_a = _b.sent()), (data = _a.data), (fetchError = _a.error);
              if (fetchError) throw fetchError;
              formattedReports =
                (data === null || data === void 0
                  ? void 0
                  : data.map((report) =>
                      __assign(__assign({}, report), {
                        generated_at: new Date(report.generated_at),
                        events: [], // Events são carregados sob demanda
                      }),
                    )) || [];
              setReports(formattedReports);
              return [3 /*break*/, 4];
            case 2:
              err_7 = _b.sent();
              errorMessage = err_7 instanceof Error ? err_7.message : "Erro ao carregar relatórios";
              setError(errorMessage);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 3:
              setLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, toast],
  );
  var generateReport = (0, react_1.useCallback)(
    (title, description, filters) =>
      __awaiter(this, void 0, void 0, function () {
        var report, err_8;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!user) {
                toast({
                  title: "Erro",
                  description: "Usuário não autenticado",
                  variant: "destructive",
                });
                return [2 /*return*/, null];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              setLoading(true);
              return [
                4 /*yield*/,
                createauditSystem().generateReport(title, description, filters, user.id),
              ];
            case 2:
              report = _a.sent();
              return [4 /*yield*/, fetchReports()];
            case 3:
              _a.sent();
              toast({
                title: "Sucesso",
                description: "Relatório gerado com sucesso",
              });
              return [2 /*return*/, report];
            case 4:
              err_8 = _a.sent();
              toast({
                title: "Erro",
                description: "Erro ao gerar relatório",
                variant: "destructive",
              });
              return [2 /*return*/, null];
            case 5:
              setLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [user, audit_system_1.auditSystem, fetchReports, toast],
  );
  var deleteReport = (0, react_1.useCallback)(
    (reportId) =>
      __awaiter(this, void 0, void 0, function () {
        var error_4, err_9;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [4 /*yield*/, supabase.from("audit_reports").delete().eq("id", reportId)];
            case 1:
              error_4 = _a.sent().error;
              if (error_4) throw error_4;
              return [4 /*yield*/, fetchReports()];
            case 2:
              _a.sent();
              toast({
                title: "Sucesso",
                description: "Relatório excluído com sucesso",
              });
              return [3 /*break*/, 4];
            case 3:
              err_9 = _a.sent();
              toast({
                title: "Erro",
                description: "Erro ao excluir relatório",
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, fetchReports, toast],
  );
  var exportReport = (0, react_1.useCallback)(
    (reportId, format) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          try {
            // TODO: Implementar exportação de relatórios
            toast({
              title: "Info",
              description: "Funcionalidade de exportação em desenvolvimento",
            });
          } catch (err) {
            toast({
              title: "Erro",
              description: "Erro ao exportar relatório",
              variant: "destructive",
            });
          }
          return [2 /*return*/];
        });
      }),
    [toast],
  );
  (0, react_1.useEffect)(() => {
    fetchReports();
  }, [fetchReports]);
  return {
    reports: reports,
    loading: loading,
    error: error,
    generateReport: generateReport,
    deleteReport: deleteReport,
    exportReport: exportReport,
    refresh: fetchReports,
  };
}
// =====================================================
// HOOK: useAuditStatistics
// =====================================================
/**
 * Hook para estatísticas de auditoria
 */
function useAuditStatistics() {
  var _a = (0, react_1.useState)(null),
    statistics = _a[0],
    setStatistics = _a[1];
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var toast = (0, useToast_1.useToast)().toast;
  var generateStats = (0, react_1.useCallback)(
    (filters) =>
      __awaiter(this, void 0, void 0, function () {
        var stats, err_10, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, 3, 4]);
              setLoading(true);
              setError(null);
              return [4 /*yield*/, createauditSystem().getStatistics(filters)];
            case 1:
              stats = _a.sent();
              setStatistics(stats);
              return [3 /*break*/, 4];
            case 2:
              err_10 = _a.sent();
              errorMessage =
                err_10 instanceof Error ? err_10.message : "Erro ao gerar estatísticas";
              setError(errorMessage);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 3:
              setLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [audit_system_1.auditSystem, toast],
  );
  var refresh = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var defaultFilters;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              defaultFilters = {
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
                end_date: new Date(),
              };
              return [4 /*yield*/, generateStats(defaultFilters)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [generateStats],
  );
  (0, react_1.useEffect)(() => {
    refresh();
  }, [refresh]);
  return {
    statistics: statistics,
    loading: loading,
    error: error,
    refresh: refresh,
    generateStats: generateStats,
  };
}
// =====================================================
// HOOK: useAuditLogger
// =====================================================
/**
 * Hook para logging de eventos de auditoria
 */
function useAuditLogger() {
  var user = (0, useUser_1.useUser)().user;
  var toast = (0, useToast_1.useToast)().toast;
  var logEvent = (0, react_1.useCallback)(
    (event) =>
      __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, err_11;
        var _d;
        return __generator(this, (_e) => {
          switch (_e.label) {
            case 0:
              _e.trys.push([0, 4, , 5]);
              _a = audit_system_1.logAuditEvent;
              _b = [__assign({}, event)];
              _d = {
                user_id: event.user_id || (user === null || user === void 0 ? void 0 : user.id),
              };
              _c = event.ip_address;
              if (_c) return [3 /*break*/, 2];
              return [4 /*yield*/, getClientIP()];
            case 1:
              _c = _e.sent();
              _e.label = 2;
            case 2:
              return [
                4 /*yield*/,
                _a.apply(void 0, [
                  __assign.apply(
                    void 0,
                    _b.concat([
                      ((_d.ip_address = _c),
                      (_d.user_agent = event.user_agent || navigator.userAgent),
                      _d),
                    ]),
                  ),
                ]),
              ];
            case 3:
              _e.sent();
              return [3 /*break*/, 5];
            case 4:
              err_11 = _e.sent();
              console.error("Erro ao registrar evento de auditoria:", err_11);
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [user],
  );
  var logUserAction = (0, react_1.useCallback)(
    (action, resourceType, resourceId, metadata) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                logEvent({
                  event_type: "user.".concat(action),
                  severity: audit_system_1.AuditSeverity.LOW,
                  description: "Usu\u00E1rio executou a\u00E7\u00E3o: ".concat(action),
                  resource_type: resourceType,
                  resource_id: resourceId,
                  metadata: metadata,
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [logEvent],
  );
  var logSecurityEvent = (0, react_1.useCallback)(
    (eventType_1, description_1) => {
      var args_1 = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
      }
      return __awaiter(
        this,
        __spreadArray([eventType_1, description_1], args_1, true),
        void 0,
        function (eventType, description, severity) {
          if (severity === void 0) {
            severity = audit_system_1.AuditSeverity.MEDIUM;
          }
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                return [
                  4 /*yield*/,
                  logEvent({
                    event_type: eventType,
                    severity: severity,
                    description: description,
                  }),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        },
      );
    },
    [logEvent],
  );
  return {
    logEvent: logEvent,
    logUserAction: logUserAction,
    logSecurityEvent: logSecurityEvent,
  };
}
// =====================================================
// HELPER FUNCTIONS
// =====================================================
/**
 * Obtém o IP do cliente
 */
function getClientIP() {
  return __awaiter(this, void 0, void 0, function () {
    var response, data, _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, fetch("https://api.ipify.org?format=json")];
        case 1:
          response = _b.sent();
          return [4 /*yield*/, response.json()];
        case 2:
          data = _b.sent();
          return [2 /*return*/, data.ip];
        case 3:
          _a = _b.sent();
          return [2 /*return*/, "unknown"];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Hook combinado para uso geral do sistema de auditoria
 */
function useAudit() {
  var logs = useAuditLogs();
  var alerts = useSecurityAlerts();
  var reports = useAuditReports();
  var statistics = useAuditStatistics();
  var logger = useAuditLogger();
  return {
    logs: logs,
    alerts: alerts,
    reports: reports,
    statistics: statistics,
    logger: logger,
  };
}
