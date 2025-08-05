"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLGPDDashboard = useLGPDDashboard;
var react_1 = require("react");
var LGPDComplianceManager_1 = require("@/lib/lgpd/LGPDComplianceManager");
var use_toast_1 = require("@/hooks/use-toast");
function useLGPDDashboard() {
  var _a = (0, react_1.useState)(null),
    metrics = _a[0],
    setMetrics = _a[1];
  var _b = (0, react_1.useState)([]),
    recentConsents = _b[0],
    setRecentConsents = _b[1];
  var _c = (0, react_1.useState)([]),
    pendingRequests = _c[0],
    setPendingRequests = _c[1];
  var _d = (0, react_1.useState)([]),
    activeIncidents = _d[0],
    setActiveIncidents = _d[1];
  var _e = (0, react_1.useState)([]),
    recentAssessments = _e[0],
    setRecentAssessments = _e[1];
  var _f = (0, react_1.useState)(true),
    isLoading = _f[0],
    setIsLoading = _f[1];
  var _g = (0, react_1.useState)(false),
    isRefreshing = _g[0],
    setIsRefreshing = _g[1];
  var _h = (0, react_1.useState)(null),
    error = _h[0],
    setError = _h[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var complianceManager = new LGPDComplianceManager_1.LGPDComplianceManager();
  var loadDashboardData = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var metricsData,
          consentsData,
          requestsData,
          incidentsData,
          assessmentsData,
          err_1,
          errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 6, , 7]);
              setError(null);
              return [4 /*yield*/, complianceManager.getDashboardMetrics()];
            case 1:
              metricsData = _a.sent();
              setMetrics(metricsData);
              return [
                4 /*yield*/,
                complianceManager.getConsents({
                  limit: 10,
                  sortBy: "created_at",
                  sortOrder: "desc",
                }),
              ];
            case 2:
              consentsData = _a.sent();
              setRecentConsents(consentsData.data);
              return [
                4 /*yield*/,
                complianceManager.getDataSubjectRequests({
                  status: "pending",
                  limit: 10,
                  sortBy: "created_at",
                  sortOrder: "desc",
                }),
              ];
            case 3:
              requestsData = _a.sent();
              setPendingRequests(requestsData.data);
              return [
                4 /*yield*/,
                complianceManager.getBreachIncidents({
                  status: "active",
                  limit: 5,
                  sortBy: "created_at",
                  sortOrder: "desc",
                }),
              ];
            case 4:
              incidentsData = _a.sent();
              setActiveIncidents(incidentsData.data);
              return [
                4 /*yield*/,
                complianceManager.getComplianceAssessments({
                  limit: 5,
                  sortBy: "created_at",
                  sortOrder: "desc",
                }),
              ];
            case 5:
              assessmentsData = _a.sent();
              setRecentAssessments(assessmentsData.data);
              return [3 /*break*/, 7];
            case 6:
              err_1 = _a.sent();
              errorMessage =
                err_1 instanceof Error ? err_1.message : "Erro ao carregar dados do dashboard";
              setError(errorMessage);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 7];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [complianceManager, toast],
  );
  var refreshDashboard = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsRefreshing(true);
              return [4 /*yield*/, loadDashboardData()];
            case 1:
              _a.sent();
              setIsRefreshing(false);
              toast({
                title: "Dashboard atualizado",
                description: "Dados do dashboard LGPD foram atualizados com sucesso.",
              });
              return [2 /*return*/];
          }
        });
      }),
    [loadDashboardData, toast],
  );
  var exportMetrics = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var csvContent, blob, link, url, errorMessage;
        return __generator(this, (_a) => {
          try {
            if (!metrics) {
              toast({
                title: "Erro",
                description: "Nenhuma métrica disponível para exportação.",
                variant: "destructive",
              });
              return [2 /*return*/];
            }
            csvContent = [
              "Métrica,Valor,Data de Geração",
              "Conformidade Geral,"
                .concat(metrics.overallCompliance, "%,")
                .concat(new Date().toISOString()),
              "Consentimentos Ativos,"
                .concat(metrics.activeConsents, ",")
                .concat(new Date().toISOString()),
              "Solicita\u00E7\u00F5es Pendentes,"
                .concat(metrics.pendingRequests, ",")
                .concat(new Date().toISOString()),
              "Incidentes Ativos,"
                .concat(metrics.activeIncidents, ",")
                .concat(new Date().toISOString()),
              "Avalia\u00E7\u00F5es Conclu\u00EDdas,"
                .concat(metrics.completedAssessments, ",")
                .concat(new Date().toISOString()),
              "Pontua\u00E7\u00E3o M\u00E9dia,"
                .concat(metrics.averageScore, ",")
                .concat(new Date().toISOString()),
            ].join("\n");
            blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            link = document.createElement("a");
            url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
              "download",
              "lgpd-metrics-".concat(new Date().toISOString().split("T")[0], ".csv"),
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({
              title: "Exportação concluída",
              description: "Métricas LGPD exportadas com sucesso.",
            });
          } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Erro ao exportar métricas";
            toast({
              title: "Erro na exportação",
              description: errorMessage,
              variant: "destructive",
            });
          }
          return [2 /*return*/];
        });
      }),
    [metrics, toast],
  );
  // Initial load
  (0, react_1.useEffect)(() => {
    var initializeDashboard = () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              return [4 /*yield*/, loadDashboardData()];
            case 1:
              _a.sent();
              setIsLoading(false);
              return [2 /*return*/];
          }
        });
      });
    initializeDashboard();
  }, [loadDashboardData]);
  // Auto-refresh every 5 minutes
  (0, react_1.useEffect)(() => {
    var interval = setInterval(
      () => {
        if (!isRefreshing) {
          loadDashboardData();
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes
    return () => clearInterval(interval);
  }, [loadDashboardData, isRefreshing]);
  return {
    // Data
    metrics: metrics,
    recentConsents: recentConsents,
    pendingRequests: pendingRequests,
    activeIncidents: activeIncidents,
    recentAssessments: recentAssessments,
    // Loading states
    isLoading: isLoading,
    isRefreshing: isRefreshing,
    // Actions
    refreshDashboard: refreshDashboard,
    exportMetrics: exportMetrics,
    // Error handling
    error: error,
  };
}
