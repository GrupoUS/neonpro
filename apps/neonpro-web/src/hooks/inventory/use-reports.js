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
exports.useReports = useReports;
var react_1 = require("react");
var react_hot_toast_1 = require("react-hot-toast");
function useReports() {
  var _a = (0, react_1.useState)(false),
    isGenerating = _a[0],
    setIsGenerating = _a[1];
  var _b = (0, react_1.useState)(false),
    isExporting = _b[0],
    setIsExporting = _b[1];
  var generateAnalytics = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(this, __spreadArray([], args_1, true), void 0, function (filters) {
      var mockData, error_1;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsGenerating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // Simulate API call with realistic data generation
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1500))];
          case 2:
            // Simulate API call with realistic data generation
            _a.sent();
            mockData = {
              stockTurnover: [
                { product: "Produto A", turnoverRate: 12.5, daysInStock: 29, value: 85000 },
                { product: "Produto B", turnoverRate: 8.2, daysInStock: 44, value: 62000 },
                { product: "Produto C", turnoverRate: 15.8, daysInStock: 23, value: 78000 },
                { product: "Produto D", turnoverRate: 6.1, daysInStock: 60, value: 45000 },
                { product: "Produto E", turnoverRate: 11.3, daysInStock: 32, value: 69000 },
              ],
              categoryPerformance: [
                {
                  category: "Medicamentos",
                  revenue: 450000,
                  volume: 2800,
                  margin: 32,
                  growth: 15.8,
                },
                { category: "Materiais", revenue: 280000, volume: 1900, margin: 28, growth: 8.2 },
                {
                  category: "Equipamentos",
                  revenue: 150000,
                  volume: 680,
                  margin: 45,
                  growth: -2.1,
                },
                {
                  category: "Consumíveis",
                  revenue: 120000,
                  volume: 1200,
                  margin: 18,
                  growth: 12.4,
                },
              ],
              movementAnalysis: [
                { date: "2025-01-01", stockIn: 850, stockOut: 720, netMovement: 130 },
                { date: "2025-01-02", stockIn: 920, stockOut: 890, netMovement: 30 },
                { date: "2025-01-03", stockIn: 780, stockOut: 950, netMovement: -170 },
                { date: "2025-01-04", stockIn: 1100, stockOut: 820, netMovement: 280 },
                { date: "2025-01-05", stockIn: 890, stockOut: 1050, netMovement: -160 },
              ],
              abcAnalysis: [
                { category: "A", products: 15, revenue: 75, percentage: 75 },
                { category: "B", products: 35, revenue: 20, percentage: 20 },
                { category: "C", products: 50, revenue: 5, percentage: 5 },
              ],
              supplierMetrics: [
                {
                  supplier: "Fornecedor Alpha",
                  deliveryTime: 12,
                  qualityScore: 92,
                  costEfficiency: 78,
                  reliability: 90,
                },
                {
                  supplier: "Fornecedor Beta",
                  deliveryTime: 8,
                  qualityScore: 88,
                  costEfficiency: 85,
                  reliability: 85,
                },
                {
                  supplier: "Fornecedor Gamma",
                  deliveryTime: 15,
                  qualityScore: 78,
                  costEfficiency: 92,
                  reliability: 80,
                },
              ],
              kpiSummary: {
                turnoverRate: 11.2,
                stockAccuracy: 98.7,
                carryingCost: 485200,
                stockoutRate: 2.3,
                fillRate: 97.8,
                avgLeadTime: 12.5,
              },
              insights: [
                {
                  type: "warning",
                  title: "Produto A com risco de ruptura",
                  description:
                    "Estoque atual permite apenas 7 dias de operação baseado na demanda média.",
                  impact: "high",
                  action: "Aumentar pedido de compra em 150%",
                },
                {
                  type: "opportunity",
                  title: "Oportunidade de otimização",
                  description: "Categoria C tem baixa rotação e alto custo de carregamento.",
                  impact: "medium",
                  action: "Revisar política de estoque mínimo",
                },
                {
                  type: "success",
                  title: "Performance excepcional",
                  description: "Fornecedor Beta mantém 98% de pontualidade nas entregas.",
                  impact: "low",
                  action: "Considerar ampliar parceria",
                },
              ],
            };
            react_hot_toast_1.toast.success("Analytics gerados com sucesso!");
            return [2 /*return*/, mockData];
          case 3:
            error_1 = _a.sent();
            console.error("Erro ao gerar analytics:", error_1);
            react_hot_toast_1.toast.error("Erro ao gerar relatório de analytics");
            return [2 /*return*/, null];
          case 4:
            setIsGenerating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var generateMetrics = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(this, __spreadArray([], args_1, true), void 0, function (filters) {
      var mockMetrics, error_2;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsGenerating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 2:
            _a.sent();
            mockMetrics = {
              totalValue: 1250000,
              totalItems: 3456,
              avgTurnover: 10.8,
              topPerformers: [
                { product: "Produto C", performance: 95.8 },
                { product: "Produto A", performance: 89.2 },
                { product: "Produto E", performance: 82.1 },
              ],
              bottomPerformers: [
                { product: "Produto D", performance: 42.8 },
                { product: "Material X", performance: 38.5 },
                { product: "Equipamento Y", performance: 35.2 },
              ],
              seasonalTrends: [
                { month: "Jan", demand: 85, supply: 90 },
                { month: "Fev", demand: 92, supply: 88 },
                { month: "Mar", demand: 78, supply: 95 },
                { month: "Abr", demand: 105, supply: 82 },
                { month: "Mai", demand: 98, supply: 105 },
                { month: "Jun", demand: 112, supply: 98 },
              ],
              alertsCount: {
                critical: 3,
                warning: 8,
                info: 12,
              },
            };
            return [2 /*return*/, mockMetrics];
          case 3:
            error_2 = _a.sent();
            console.error("Erro ao gerar métricas:", error_2);
            react_hot_toast_1.toast.error("Erro ao gerar métricas");
            return [2 /*return*/, null];
          case 4:
            setIsGenerating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var exportReport = (0, react_1.useCallback)(
    (options) =>
      __awaiter(this, void 0, void 0, function () {
        var type, _a, filters, _b, templateType, timestamp, filename, blob, url, link, error_3;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              setIsExporting(true);
              _c.label = 1;
            case 1:
              _c.trys.push([1, 3, 4, 5]);
              (type = options.type),
                (_a = options.filters),
                (filters = _a === void 0 ? {} : _a),
                (_b = options.templateType),
                (templateType = _b === void 0 ? "detailed" : _b);
              // Simulate report generation and download
              return [
                4 /*yield*/,
                new Promise((resolve) => setTimeout(resolve, 2000)),
                // Generate filename with timestamp
              ];
            case 2:
              // Simulate report generation and download
              _c.sent();
              timestamp = new Date().toISOString().slice(0, 10);
              filename = "inventory-analytics-"
                .concat(templateType, "-")
                .concat(timestamp, ".")
                .concat(type);
              blob = new Blob(["Mock report content"], {
                type:
                  type === "pdf"
                    ? "application/pdf"
                    : type === "excel"
                      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      : "text/csv",
              });
              url = URL.createObjectURL(blob);
              link = document.createElement("a");
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              react_hot_toast_1.toast.success(
                "Relat\u00F3rio ".concat(type.toUpperCase(), " exportado com sucesso!"),
              );
              return [3 /*break*/, 5];
            case 3:
              error_3 = _c.sent();
              console.error("Erro ao exportar relatório:", error_3);
              react_hot_toast_1.toast.error("Erro ao exportar relatório");
              return [3 /*break*/, 5];
            case 4:
              setIsExporting(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var generatePredictiveAnalysis = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(this, __spreadArray([], args_1, true), void 0, function (filters) {
      var predictiveData, error_4;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsGenerating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 2500))];
          case 2:
            _a.sent();
            predictiveData = {
              demandForecast: [
                { period: "Próxima semana", demand: 1250, confidence: 92 },
                { period: "Próximo mês", demand: 5200, confidence: 87 },
                { period: "Próximo trimestre", demand: 18500, confidence: 73 },
              ],
              stockRecommendations: [
                {
                  product: "Produto A",
                  currentStock: 150,
                  recommendedStock: 280,
                  reason: "Aumento de demanda esperado",
                },
                {
                  product: "Produto B",
                  currentStock: 320,
                  recommendedStock: 180,
                  reason: "Sazonalidade baixa",
                },
              ],
              riskAnalysis: [
                {
                  type: "Ruptura de estoque",
                  probability: 15,
                  impact: "Alto",
                  products: ["Produto A", "Material X"],
                },
                {
                  type: "Excesso de estoque",
                  probability: 8,
                  impact: "Médio",
                  products: ["Produto D"],
                },
              ],
            };
            react_hot_toast_1.toast.success("Análise preditiva gerada!");
            return [2 /*return*/, predictiveData];
          case 3:
            error_4 = _a.sent();
            console.error("Erro na análise preditiva:", error_4);
            react_hot_toast_1.toast.error("Erro ao gerar análise preditiva");
            return [2 /*return*/, null];
          case 4:
            setIsGenerating(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var generateCustomReport = (0, react_1.useCallback)(
    (config) =>
      __awaiter(this, void 0, void 0, function () {
        var customData, error_5;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsGenerating(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              return [
                4 /*yield*/,
                new Promise((resolve) => setTimeout(resolve, 1800)),
                // Custom report generation logic would go here
              ];
            case 2:
              _a.sent();
              customData = {
                title: "Relatório Personalizado de Estoque",
                sections: config.sections,
                data: {}, // Populated based on selected sections
                generatedAt: new Date().toISOString(),
                filters: config,
              };
              react_hot_toast_1.toast.success("Relatório personalizado gerado!");
              return [2 /*return*/, customData];
            case 3:
              error_5 = _a.sent();
              console.error("Erro ao gerar relatório personalizado:", error_5);
              react_hot_toast_1.toast.error("Erro ao gerar relatório personalizado");
              return [2 /*return*/, null];
            case 4:
              setIsGenerating(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  return {
    // Generation functions
    generateAnalytics: generateAnalytics,
    generateMetrics: generateMetrics,
    generatePredictiveAnalysis: generatePredictiveAnalysis,
    generateCustomReport: generateCustomReport,
    // Export functions
    exportReport: exportReport,
    // State
    isGenerating: isGenerating,
    isExporting: isExporting,
  };
}
