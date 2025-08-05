"use strict";
/**
 * Analytics Export Utility Hook for NeonPro
 *
 * Specialized hook for handling analytics data export across different formats:
 * - CSV exports for raw data analysis
 * - Excel exports with formatted charts and tables
 * - PDF reports with visualizations and insights
 * - JSON exports for API integration
 *
 * Provides unified export interface for all analytics components.
 */
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
exports.useAnalyticsExport = useAnalyticsExport;
exports.useExportTemplates = useExportTemplates;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
/**
 * Main analytics export hook
 */
function useAnalyticsExport() {
  var _this = this;
  var _a = (0, react_1.useState)(0),
    progress = _a[0],
    setProgress = _a[1];
  var _b = (0, react_1.useState)(null),
    error = _b[0],
    setError = _b[1];
  var _c = (0, react_1.useState)(null),
    lastExport = _c[0],
    setLastExport = _c[1];
  // Single export mutation
  var exportMutation = (0, react_query_1.useMutation)({
    mutationFn: function (config) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, blob, filename, data, contentDisposition, url, a;
        var _a, _b, _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              setProgress(0);
              setError(null);
              return [
                4 /*yield*/,
                fetch("/api/analytics/export", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(config),
                }),
              ];
            case 1:
              response = _d.sent();
              if (!response.ok) {
                throw new Error("Export failed: ".concat(response.statusText));
              }
              setProgress(50);
              if (!(config.format === "json")) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              data = _d.sent();
              blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              filename =
                ((_a = config.options) === null || _a === void 0 ? void 0 : _a.filename) ||
                "".concat(config.type, "-export.json");
              return [3 /*break*/, 5];
            case 3:
              return [4 /*yield*/, response.blob()];
            case 4:
              blob = _d.sent();
              contentDisposition = response.headers.get("Content-Disposition");
              filename = contentDisposition
                ? (_b = contentDisposition.split("filename=")[1]) === null || _b === void 0
                  ? void 0
                  : _b.replace(/"/g, "")
                : ((_c = config.options) === null || _c === void 0 ? void 0 : _c.filename) ||
                  "".concat(config.type, "-export.").concat(config.format);
              _d.label = 5;
            case 5:
              setProgress(100);
              url = window.URL.createObjectURL(blob);
              a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              setLastExport(new Date());
              setProgress(0);
              return [2 /*return*/];
          }
        });
      });
    },
    onError: function (err) {
      setError(err instanceof Error ? err.message : "Export failed");
      setProgress(0);
    },
  });
  // Multiple export mutation
  var multipleExportMutation = (0, react_query_1.useMutation)({
    mutationFn: function (configs) {
      return __awaiter(_this, void 0, void 0, function () {
        var totalConfigs, results, i, config, response, blob, filename, err_1, failedCount;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              setProgress(0);
              setError(null);
              totalConfigs = configs.length;
              results = [];
              i = 0;
              _b.label = 1;
            case 1:
              if (!(i < totalConfigs)) return [3 /*break*/, 7];
              config = configs[i];
              setProgress((i / totalConfigs) * 100);
              _b.label = 2;
            case 2:
              _b.trys.push([2, 5, , 6]);
              return [
                4 /*yield*/,
                fetch("/api/analytics/export", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(config),
                }),
              ];
            case 3:
              response = _b.sent();
              if (!response.ok) {
                throw new Error("Export ".concat(i + 1, " failed: ").concat(response.statusText));
              }
              return [4 /*yield*/, response.blob()];
            case 4:
              blob = _b.sent();
              filename =
                ((_a = config.options) === null || _a === void 0 ? void 0 : _a.filename) ||
                ""
                  .concat(config.type, "-export-")
                  .concat(i + 1, ".")
                  .concat(config.format);
              results.push({ blob: blob, filename: filename, config: config });
              return [3 /*break*/, 6];
            case 5:
              err_1 = _b.sent();
              console.error("Export ".concat(i + 1, " failed:"), err_1);
              results.push({ error: err_1, config: config });
              return [3 /*break*/, 6];
            case 6:
              i++;
              return [3 /*break*/, 1];
            case 7:
              // Download all successful exports
              results.forEach(function (result) {
                if (result.blob) {
                  var url = window.URL.createObjectURL(result.blob);
                  var a = document.createElement("a");
                  a.href = url;
                  a.download = result.filename;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                }
              });
              failedCount = results.filter(function (r) {
                return r.error;
              }).length;
              if (failedCount > 0) {
                throw new Error(
                  "".concat(failedCount, " of ").concat(totalConfigs, " exports failed"),
                );
              }
              setProgress(100);
              setLastExport(new Date());
              setTimeout(function () {
                return setProgress(0);
              }, 1000);
              return [2 /*return*/];
          }
        });
      });
    },
    onError: function (err) {
      setError(err instanceof Error ? err.message : "Multiple export failed");
      setProgress(0);
    },
  });
  // Report generation mutation
  var reportMutation = (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, blob, filename, url, a;
        var type = _b.type,
          data = _b.data;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              setProgress(0);
              setError(null);
              return [
                4 /*yield*/,
                fetch("/api/analytics/generate-report", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    reportType: type,
                    data: data,
                    format: "pdf",
                    includeCharts: true,
                    includeInsights: true,
                    timestamp: new Date().toISOString(),
                  }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!response.ok) {
                throw new Error("Report generation failed: ".concat(response.statusText));
              }
              setProgress(75);
              return [4 /*yield*/, response.blob()];
            case 2:
              blob = _c.sent();
              filename = ""
                .concat(type, "-analytics-report-")
                .concat(new Date().toISOString().split("T")[0], ".pdf");
              setProgress(100);
              url = window.URL.createObjectURL(blob);
              a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              setLastExport(new Date());
              setTimeout(function () {
                return setProgress(0);
              }, 1000);
              return [2 /*return*/];
          }
        });
      });
    },
    onError: function (err) {
      setError(err instanceof Error ? err.message : "Report generation failed");
      setProgress(0);
    },
  });
  // Actions
  var exportData = (0, react_1.useCallback)(
    function (config) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, exportMutation.mutateAsync(config)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [exportMutation],
  );
  var exportMultiple = (0, react_1.useCallback)(
    function (configs) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, multipleExportMutation.mutateAsync(configs)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [multipleExportMutation],
  );
  var generateReport = (0, react_1.useCallback)(
    function (type, data) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, reportMutation.mutateAsync({ type: type, data: data })];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [reportMutation],
  );
  var clearError = (0, react_1.useCallback)(function () {
    setError(null);
  }, []);
  return {
    // State
    isExporting:
      exportMutation.isPending || multipleExportMutation.isPending || reportMutation.isPending,
    progress: progress,
    error: error,
    lastExport: lastExport,
    // Actions
    exportData: exportData,
    exportMultiple: exportMultiple,
    generateReport: generateReport,
    clearError: clearError,
  };
}
/**
 * Hook for predefined export templates
 */
function useExportTemplates() {
  var _a = useAnalyticsExport(),
    exportData = _a.exportData,
    generateReport = _a.generateReport;
  return {
    // Cohort analysis templates
    exportCohortCSV: (0, react_1.useCallback)(
      function (data) {
        return exportData({
          type: "cohort",
          format: "csv",
          data: data,
          options: {
            filename: "cohort-analysis-".concat(new Date().toISOString().split("T")[0], ".csv"),
            includeMetadata: true,
          },
        });
      },
      [exportData],
    ),
    exportCohortExcel: (0, react_1.useCallback)(
      function (data) {
        return exportData({
          type: "cohort",
          format: "excel",
          data: data,
          options: {
            filename: "cohort-analysis-".concat(new Date().toISOString().split("T")[0], ".xlsx"),
            includeCharts: true,
            includeMetadata: true,
          },
        });
      },
      [exportData],
    ),
    // Forecasting templates
    exportForecastPDF: (0, react_1.useCallback)(
      function (data) {
        return exportData({
          type: "forecast",
          format: "pdf",
          data: data,
          options: {
            filename: "forecast-report-".concat(new Date().toISOString().split("T")[0], ".pdf"),
            includeCharts: true,
            template: "technical",
          },
        });
      },
      [exportData],
    ),
    // Dashboard templates
    exportExecutiveDashboard: (0, react_1.useCallback)(
      function (data) {
        return generateReport("executive", data);
      },
      [generateReport],
    ),
    exportTechnicalDashboard: (0, react_1.useCallback)(
      function (data) {
        return generateReport("technical", data);
      },
      [generateReport],
    ),
    // Insights templates
    exportInsightsJSON: (0, react_1.useCallback)(
      function (data) {
        return exportData({
          type: "insights",
          format: "json",
          data: data,
          options: {
            filename: "statistical-insights-".concat(
              new Date().toISOString().split("T")[0],
              ".json",
            ),
            includeMetadata: true,
          },
        });
      },
      [exportData],
    ),
  };
}
