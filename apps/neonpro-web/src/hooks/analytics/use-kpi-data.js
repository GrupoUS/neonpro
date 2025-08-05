// Hook para gerenciar dados KPI com cache e refresh automático
// Integra com o KPI Engine para dados reais do Supabase
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKPIData = useKPIData;
exports.useDrillDownData = useDrillDownData;
exports.useProfessionalMetrics = useProfessionalMetrics;
var react_1 = require("react");
function useKPIData(options) {
  var _a = (0, react_1.useState)({
      kpis: [],
      loading: true,
      error: null,
      lastUpdated: null,
    }),
    state = _a[0],
    setState = _a[1];
  var dateRange = options.dateRange,
    _b = options.autoRefresh,
    autoRefresh = _b === void 0 ? true : _b,
    _c = options.refreshInterval,
    refreshInterval = _c === void 0 ? 30000 : _c,
    filters = options.filters;
  var calculateDateRange = (0, react_1.useCallback)((range) => {
    var end = new Date();
    var start = new Date();
    switch (range) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "12m":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "ytd":
        start.setMonth(0, 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }
    return {
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    };
  }, []);
  var fetchKPIData = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var timePeriod, request, response, data, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setState((prev) => __assign(__assign({}, prev), { loading: true, error: null }));
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              timePeriod = calculateDateRange(dateRange);
              request = {
                time_period: timePeriod,
                force_recalculation: false,
                filters: filters,
              };
              return [
                4 /*yield*/,
                fetch("/api/analytics/kpis", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(request),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("HTTP error! status: ".concat(response.status));
              }
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              setState({
                kpis: data.results || [],
                loading: false,
                error: null,
                lastUpdated: new Date(),
              });
              return [3 /*break*/, 5];
            case 4:
              error_1 = _a.sent();
              console.error("Error fetching KPI data:", error_1);
              setState((prev) =>
                __assign(__assign({}, prev), {
                  loading: false,
                  error: error_1 instanceof Error ? error_1.message : "Erro ao carregar dados KPI",
                }),
              );
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [dateRange, filters, calculateDateRange],
  );
  // Refresh manual
  var refresh = (0, react_1.useCallback)(() => {
    fetchKPIData();
  }, [fetchKPIData]);
  // Fetch inicial e quando dependências mudam
  (0, react_1.useEffect)(() => {
    fetchKPIData();
  }, [fetchKPIData]);
  // Auto-refresh
  (0, react_1.useEffect)(() => {
    if (!autoRefresh) return;
    var interval = setInterval(() => {
      fetchKPIData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchKPIData]);
  return __assign(__assign({}, state), { refresh: refresh });
}
// Hook para dados de drill-down
function useDrillDownData() {
  var _a = (0, react_1.useState)(false),
    loading = _a[0],
    setLoading = _a[1];
  var _b = (0, react_1.useState)(null),
    error = _b[0],
    setError = _b[1];
  var getDrillDownData = (0, react_1.useCallback)(
    (request) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/analytics/drill-down", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(request),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("HTTP error! status: ".concat(response.status));
              }
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              setLoading(false);
              return [2 /*return*/, data];
            case 4:
              error_2 = _a.sent();
              console.error("Error fetching drill-down data:", error_2);
              setError(
                error_2 instanceof Error ? error_2.message : "Erro ao carregar análise detalhada",
              );
              setLoading(false);
              return [2 /*return*/, null];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  return {
    getDrillDownData: getDrillDownData,
    loading: loading,
    error: error,
  };
}
// Hook para métricas profissionais
function useProfessionalMetrics(dateRange) {
  var _a = (0, react_1.useState)([]),
    metrics = _a[0],
    setMetrics = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchProfessionalMetrics = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var timePeriod, response, data, error_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              timePeriod = calculateDateRange(dateRange);
              return [
                4 /*yield*/,
                fetch("/api/analytics/professional-metrics", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ time_period: timePeriod }),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("HTTP error! status: ".concat(response.status));
              }
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              setMetrics(data.metrics || []);
              setLoading(false);
              return [3 /*break*/, 5];
            case 4:
              error_3 = _a.sent();
              console.error("Error fetching professional metrics:", error_3);
              setError(
                error_3 instanceof Error
                  ? error_3.message
                  : "Erro ao carregar métricas profissionais",
              );
              setLoading(false);
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [dateRange],
  );
  (0, react_1.useEffect)(() => {
    fetchProfessionalMetrics();
  }, [fetchProfessionalMetrics]);
  var calculateDateRange = (0, react_1.useCallback)((range) => {
    var end = new Date();
    var start = new Date();
    switch (range) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "12m":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "ytd":
        start.setMonth(0, 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }
    return {
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    };
  }, []);
  return {
    metrics: metrics,
    loading: loading,
    error: error,
    refresh: fetchProfessionalMetrics,
  };
}
