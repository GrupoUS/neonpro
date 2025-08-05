"use client";
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
exports.useVisionAnalysis = useVisionAnalysis;
exports.useAnalysisMonitoring = useAnalysisMonitoring;
exports.useAnalysisPerformance = useAnalysisPerformance;
var react_1 = require("react");
var sonner_1 = require("sonner");
var analysis_engine_1 = require("@/lib/vision/analysis-engine");
/**
 * Custom hook for managing computer vision analysis operations
 * Provides state management and actions for before/after image analysis
 */
function useVisionAnalysis() {
  var _a = (0, react_1.useState)({
      isAnalyzing: false,
      currentAnalysis: null,
      analysisHistory: [],
      error: null,
      progress: 0,
    }),
    state = _a[0],
    setState = _a[1];
  /**
   * Start computer vision analysis for before/after images
   * Target: ≥95% accuracy, <30s processing time
   */
  var startAnalysis = (0, react_1.useCallback)(
    (beforeImageUrl, afterImageUrl, patientId, treatmentType) =>
      __awaiter(this, void 0, void 0, function () {
        var progressInterval, startTime, result_1, error_1, errorMessage_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setState((prev) =>
                __assign(__assign({}, prev), { isAnalyzing: true, error: null, progress: 0 }),
              );
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              progressInterval = setInterval(() => {
                setState((prev) =>
                  __assign(__assign({}, prev), {
                    progress: Math.min(prev.progress + Math.random() * 15, 90),
                  }),
                );
              }, 1000);
              // Validate inputs
              if (!beforeImageUrl || !afterImageUrl) {
                throw new Error("URLs das imagens são obrigatórias");
              }
              if (!patientId) {
                throw new Error("ID do paciente é obrigatório");
              }
              if (!treatmentType) {
                throw new Error("Tipo de tratamento é obrigatório");
              }
              // Start analysis
              sonner_1.toast.info("Iniciando análise de visão computacional...");
              startTime = Date.now();
              return [
                4 /*yield*/,
                analysis_engine_1.visionAnalysisEngine.analyzeBeforeAfter(
                  beforeImageUrl,
                  afterImageUrl,
                  patientId,
                  treatmentType,
                ),
              ];
            case 2:
              result_1 = _a.sent();
              clearInterval(progressInterval);
              // Validate results meet requirements
              if (result_1.accuracyScore < 0.95) {
                sonner_1.toast.warning(
                  "Precis\u00E3o abaixo do esperado: ".concat(
                    (result_1.accuracyScore * 100).toFixed(1),
                    "%",
                  ),
                );
              }
              if (result_1.processingTime > 30000) {
                sonner_1.toast.warning(
                  "Tempo de processamento excedeu 30s: ".concat(
                    (result_1.processingTime / 1000).toFixed(1),
                    "s",
                  ),
                );
              }
              setState((prev) =>
                __assign(__assign({}, prev), {
                  isAnalyzing: false,
                  currentAnalysis: result_1,
                  progress: 100,
                  analysisHistory: __spreadArray([result_1], prev.analysisHistory, true),
                }),
              );
              sonner_1.toast.success(
                "An\u00E1lise conclu\u00EDda com "
                  .concat((result_1.accuracyScore * 100).toFixed(1), "% de precis\u00E3o em ")
                  .concat((result_1.processingTime / 1000).toFixed(1), "s"),
              );
              return [2 /*return*/, result_1];
            case 3:
              error_1 = _a.sent();
              errorMessage_1 =
                error_1 instanceof Error ? error_1.message : "Erro desconhecido na análise";
              setState((prev) =>
                __assign(__assign({}, prev), {
                  isAnalyzing: false,
                  error: errorMessage_1,
                  progress: 0,
                }),
              );
              sonner_1.toast.error("Falha na an\u00E1lise: ".concat(errorMessage_1));
              console.error("Vision analysis failed:", error_1);
              return [2 /*return*/, null];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  /**
   * Load analysis history for a patient
   */
  var loadAnalysisHistory = (0, react_1.useCallback)(
    (patientId) =>
      __awaiter(this, void 0, void 0, function () {
        var history_1, error_2, errorMessage_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              setState((prev) => __assign(__assign({}, prev), { error: null }));
              return [
                4 /*yield*/,
                analysis_engine_1.visionAnalysisEngine.getPatientAnalysisHistory(patientId),
              ];
            case 1:
              history_1 = _a.sent();
              setState((prev) => __assign(__assign({}, prev), { analysisHistory: history_1 }));
              sonner_1.toast.success("".concat(history_1.length, " an\u00E1lises carregadas"));
              return [3 /*break*/, 3];
            case 2:
              error_2 = _a.sent();
              errorMessage_2 =
                error_2 instanceof Error ? error_2.message : "Erro ao carregar histórico";
              setState((prev) => __assign(__assign({}, prev), { error: errorMessage_2 }));
              sonner_1.toast.error("Falha ao carregar hist\u00F3rico: ".concat(errorMessage_2));
              console.error("Failed to load analysis history:", error_2);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  /**
   * Clear current analysis
   */
  var clearCurrentAnalysis = (0, react_1.useCallback)(() => {
    setState((prev) => __assign(__assign({}, prev), { currentAnalysis: null, progress: 0 }));
  }, []);
  /**
   * Clear error state
   */
  var clearError = (0, react_1.useCallback)(() => {
    setState((prev) => __assign(__assign({}, prev), { error: null }));
  }, []);
  /**
   * Export analysis results to PDF/Excel
   */
  var exportAnalysis = (0, react_1.useCallback)((analysisId_1) => {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(
      this,
      __spreadArray([analysisId_1], args_1, true),
      void 0,
      function (analysisId, format, options) {
        var response, result, link, error_3, errorMessage;
        var _a, _b, _c;
        if (format === void 0) {
          format = "json";
        }
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              _d.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/vision/export", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    analysisId: analysisId,
                    format: format,
                    options: __assign(
                      {
                        includeImages:
                          (_a =
                            options === null || options === void 0
                              ? void 0
                              : options.includeImages) !== null && _a !== void 0
                            ? _a
                            : true,
                        includeAnnotations:
                          (_b =
                            options === null || options === void 0
                              ? void 0
                              : options.includeAnnotations) !== null && _b !== void 0
                            ? _b
                            : true,
                        includeMetrics:
                          (_c =
                            options === null || options === void 0
                              ? void 0
                              : options.includeMetrics) !== null && _c !== void 0
                            ? _c
                            : true,
                      },
                      options,
                    ),
                  }),
                }),
              ];
            case 1:
              response = _d.sent();
              if (!response.ok) {
                throw new Error("Export failed");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              result = _d.sent();
              // Download the file
              if (result.downloadUrl) {
                link = document.createElement("a");
                link.href = result.downloadUrl;
                link.download = result.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
              sonner_1.toast.success("Analysis exported as ".concat(format.toUpperCase()));
              return [3 /*break*/, 4];
            case 3:
              error_3 = _d.sent();
              errorMessage = error_3 instanceof Error ? error_3.message : "Erro na exportação";
              sonner_1.toast.error("Falha na exporta\u00E7\u00E3o: ".concat(errorMessage));
              console.error("Export failed:", error_3);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      },
    );
  }, []);
  /**
   * Share analysis results (generate shareable link)
   */
  var shareAnalysis = (0, react_1.useCallback)(
    (analysisId, options) =>
      __awaiter(this, void 0, void 0, function () {
        var response, result, error_4, errorMessage;
        var _a, _b, _c, _d, _e;
        return __generator(this, (_f) => {
          switch (_f.label) {
            case 0:
              _f.trys.push([0, 5, , 6]);
              return [
                4 /*yield*/,
                fetch("/api/vision/share", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    analysisId: analysisId,
                    shareType:
                      (_a = options === null || options === void 0 ? void 0 : options.shareType) !==
                        null && _a !== void 0
                        ? _a
                        : "private",
                    expiresAt:
                      (_b = options === null || options === void 0 ? void 0 : options.expiresAt) ===
                        null || _b === void 0
                        ? void 0
                        : _b.toISOString(),
                    password: options === null || options === void 0 ? void 0 : options.password,
                    allowedEmails:
                      options === null || options === void 0 ? void 0 : options.allowedEmails,
                    includeImages:
                      (_c =
                        options === null || options === void 0 ? void 0 : options.includeImages) !==
                        null && _c !== void 0
                        ? _c
                        : true,
                    includeAnnotations:
                      (_d =
                        options === null || options === void 0
                          ? void 0
                          : options.includeAnnotations) !== null && _d !== void 0
                        ? _d
                        : true,
                    includeMetrics:
                      (_e =
                        options === null || options === void 0
                          ? void 0
                          : options.includeMetrics) !== null && _e !== void 0
                        ? _e
                        : true,
                  }),
                }),
              ];
            case 1:
              response = _f.sent();
              if (!response.ok) {
                throw new Error("Share failed");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              result = _f.sent();
              if (!(result.shareUrl && navigator.clipboard)) return [3 /*break*/, 4];
              return [4 /*yield*/, navigator.clipboard.writeText(result.shareUrl)];
            case 3:
              _f.sent();
              sonner_1.toast.success("Share URL copied to clipboard");
              _f.label = 4;
            case 4:
              sonner_1.toast.success("Analysis shared successfully");
              return [2 /*return*/, result.shareUrl];
            case 5:
              error_4 = _f.sent();
              errorMessage =
                error_4 instanceof Error ? error_4.message : "Erro no compartilhamento";
              sonner_1.toast.error("Falha no compartilhamento: ".concat(errorMessage));
              console.error("Share failed:", error_4);
              throw error_4;
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  return {
    // State
    isAnalyzing: state.isAnalyzing,
    currentAnalysis: state.currentAnalysis,
    analysisHistory: state.analysisHistory,
    error: state.error,
    progress: state.progress,
    // Actions
    startAnalysis: startAnalysis,
    loadAnalysisHistory: loadAnalysisHistory,
    clearCurrentAnalysis: clearCurrentAnalysis,
    clearError: clearError,
    exportAnalysis: exportAnalysis,
    shareAnalysis: shareAnalysis,
  };
}
/**
 * Hook for real-time analysis monitoring
 * Provides live updates during analysis processing
 */
function useAnalysisMonitoring(analysisId) {
  var _a = (0, react_1.useState)(null),
    metrics = _a[0],
    setMetrics = _a[1];
  (0, react_1.useEffect)(() => {
    if (!analysisId) return;
    // Simulate real-time monitoring
    var interval = setInterval(() => {
      setMetrics({
        processingStage: "Análise de textura",
        estimatedTimeRemaining: Math.max(0, Math.random() * 25000),
        currentAccuracy: 0.95 + Math.random() * 0.04,
        memoryUsage: 0.3 + Math.random() * 0.2,
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [analysisId]);
  return metrics;
}
/**
 * Hook for analysis performance tracking
 * Tracks and reports performance metrics
 */
function useAnalysisPerformance() {
  var _a = (0, react_1.useState)({
      averageProcessingTime: 0,
      averageAccuracy: 0,
      successRate: 0,
      totalAnalyses: 0,
    }),
    performanceData = _a[0],
    setPerformanceData = _a[1];
  var updatePerformanceMetrics = (0, react_1.useCallback)((newAnalysis) => {
    setPerformanceData((prev) => {
      var newTotal = prev.totalAnalyses + 1;
      var newAvgTime =
        (prev.averageProcessingTime * prev.totalAnalyses + newAnalysis.processingTime) / newTotal;
      var newAvgAccuracy =
        (prev.averageAccuracy * prev.totalAnalyses + newAnalysis.accuracyScore) / newTotal;
      var newSuccessRate =
        newAnalysis.accuracyScore >= 0.95
          ? (prev.successRate * prev.totalAnalyses + 1) / newTotal
          : (prev.successRate * prev.totalAnalyses) / newTotal;
      return {
        averageProcessingTime: newAvgTime,
        averageAccuracy: newAvgAccuracy,
        successRate: newSuccessRate,
        totalAnalyses: newTotal,
      };
    });
  }, []);
  return {
    performanceData: performanceData,
    updatePerformanceMetrics: updatePerformanceMetrics,
  };
}
exports.default = useVisionAnalysis;
