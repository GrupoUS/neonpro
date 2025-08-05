"use strict";
/**
 * Analytics Export API Route for NeonPro
 *
 * Handles export requests for all analytics data in multiple formats:
 * - CSV exports for raw data analysis
 * - Excel exports with formatted sheets and charts
 * - PDF reports with visualizations and insights
 * - JSON exports for API integration
 *
 * Supports cohort analysis, forecasting, statistical insights, and dashboard data.
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
exports.POST = POST;
var server_1 = require("@/lib/supabase/server");
var jspdf_1 = require("jspdf");
require("jspdf-autotable");
var server_2 = require("next/server");
var XLSX = require("xlsx");
var zod_1 = require("zod");
// Export request validation schema
var ExportRequestSchema = zod_1.z.object({
  type: zod_1.z.enum(["cohort", "forecast", "insights", "dashboard", "realtime"]),
  format: zod_1.z.enum(["csv", "excel", "pdf", "json"]),
  data: zod_1.z.any(),
  options: zod_1.z
    .object({
      includeCharts: zod_1.z.boolean().optional(),
      includeMetadata: zod_1.z.boolean().optional(),
      dateRange: zod_1.z
        .object({
          start: zod_1.z.string(),
          end: zod_1.z.string(),
        })
        .optional(),
      filename: zod_1.z.string().optional(),
      template: zod_1.z.enum(["standard", "executive", "technical"]).optional(),
    })
    .optional(),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedRequest,
      type,
      format,
      data,
      _b,
      options,
      exportData,
      contentType,
      filename,
      _c,
      response,
      error_1;
    var _d, _e, _f, _g;
    return __generator(this, function (_h) {
      switch (_h.label) {
        case 0:
          _h.trys.push([0, 15, , 16]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _h.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _h.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _h.sent();
          validatedRequest = ExportRequestSchema.parse(body);
          (type = validatedRequest.type),
            (format = validatedRequest.format),
            (data = validatedRequest.data),
            (_b = validatedRequest.options),
            (options = _b === void 0 ? {} : _b);
          exportData = void 0;
          contentType = void 0;
          filename = void 0;
          _c = format;
          switch (_c) {
            case "csv":
              return [3 /*break*/, 4];
            case "excel":
              return [3 /*break*/, 6];
            case "pdf":
              return [3 /*break*/, 8];
            case "json":
              return [3 /*break*/, 10];
          }
          return [3 /*break*/, 12];
        case 4:
          return [4 /*yield*/, generateCSVExport(type, data, options)];
        case 5:
          (_d = _h.sent()),
            (exportData = _d.data),
            (contentType = _d.contentType),
            (filename = _d.filename);
          return [3 /*break*/, 13];
        case 6:
          return [4 /*yield*/, generateExcelExport(type, data, options)];
        case 7:
          (_e = _h.sent()),
            (exportData = _e.data),
            (contentType = _e.contentType),
            (filename = _e.filename);
          return [3 /*break*/, 13];
        case 8:
          return [4 /*yield*/, generatePDFExport(type, data, options)];
        case 9:
          (_f = _h.sent()),
            (exportData = _f.data),
            (contentType = _f.contentType),
            (filename = _f.filename);
          return [3 /*break*/, 13];
        case 10:
          return [4 /*yield*/, generateJSONExport(type, data, options)];
        case 11:
          (_g = _h.sent()),
            (exportData = _g.data),
            (contentType = _g.contentType),
            (filename = _g.filename);
          return [3 /*break*/, 13];
        case 12:
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Unsupported export format" }, { status: 400 }),
          ];
        case 13:
          // Log export activity
          return [
            4 /*yield*/,
            supabase
              .from("user_activity_log")
              .insert({
                user_id: user.id,
                action: "export",
                details: {
                  type: type,
                  format: format,
                  timestamp: new Date().toISOString(),
                  filename: filename,
                },
              }),
            // Return file
          ];
        case 14:
          // Log export activity
          _h.sent();
          response = new server_2.NextResponse(exportData);
          response.headers.set("Content-Type", contentType);
          response.headers.set(
            "Content-Disposition",
            'attachment; filename="'.concat(filename, '"'),
          );
          response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
          return [2 /*return*/, response];
        case 15:
          error_1 = _h.sent();
          console.error("Export error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid request format", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Export generation failed" }, { status: 500 }),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Generate CSV export
 */
function generateCSVExport(type, data, options) {
  return __awaiter(this, void 0, void 0, function () {
    var csvData, filename;
    return __generator(this, function (_a) {
      csvData = "";
      filename = "".concat(type, "-export-").concat(new Date().toISOString().split("T")[0], ".csv");
      switch (type) {
        case "cohort":
          csvData = generateCohortCSV(data);
          filename =
            options.filename ||
            "cohort-analysis-".concat(new Date().toISOString().split("T")[0], ".csv");
          break;
        case "forecast":
          csvData = generateForecastCSV(data);
          filename =
            options.filename ||
            "forecast-data-".concat(new Date().toISOString().split("T")[0], ".csv");
          break;
        case "insights":
          csvData = generateInsightsCSV(data);
          filename =
            options.filename ||
            "statistical-insights-".concat(new Date().toISOString().split("T")[0], ".csv");
          break;
        case "dashboard":
          csvData = generateDashboardCSV(data);
          filename =
            options.filename ||
            "dashboard-metrics-".concat(new Date().toISOString().split("T")[0], ".csv");
          break;
        case "realtime":
          csvData = generateRealtimeCSV(data);
          filename =
            options.filename ||
            "realtime-metrics-".concat(new Date().toISOString().split("T")[0], ".csv");
          break;
        default:
          throw new Error("Unsupported CSV export type: ".concat(type));
      }
      return [
        2 /*return*/,
        {
          data: csvData,
          contentType: "text/csv",
          filename: filename,
        },
      ];
    });
  });
}
/**
 * Generate Excel export
 */
function generateExcelExport(type, data, options) {
  return __awaiter(this, void 0, void 0, function () {
    var workbook, filename, excelBuffer;
    return __generator(this, function (_a) {
      workbook = XLSX.utils.book_new();
      filename = ""
        .concat(type, "-export-")
        .concat(new Date().toISOString().split("T")[0], ".xlsx");
      switch (type) {
        case "cohort":
          addCohortSheetsToWorkbook(workbook, data, options);
          filename =
            options.filename ||
            "cohort-analysis-".concat(new Date().toISOString().split("T")[0], ".xlsx");
          break;
        case "forecast":
          addForecastSheetsToWorkbook(workbook, data, options);
          filename =
            options.filename ||
            "forecast-report-".concat(new Date().toISOString().split("T")[0], ".xlsx");
          break;
        case "insights":
          addInsightsSheetsToWorkbook(workbook, data, options);
          filename =
            options.filename ||
            "statistical-insights-".concat(new Date().toISOString().split("T")[0], ".xlsx");
          break;
        case "dashboard":
          addDashboardSheetsToWorkbook(workbook, data, options);
          filename =
            options.filename ||
            "analytics-dashboard-".concat(new Date().toISOString().split("T")[0], ".xlsx");
          break;
        default:
          throw new Error("Unsupported Excel export type: ".concat(type));
      }
      excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      return [
        2 /*return*/,
        {
          data: excelBuffer,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          filename: filename,
        },
      ];
    });
  });
}
/**
 * Generate PDF export
 */
function generatePDFExport(type, data, options) {
  return __awaiter(this, void 0, void 0, function () {
    var pdf, template, filename, pdfBuffer;
    return __generator(this, function (_a) {
      pdf = new jspdf_1.default("p", "mm", "a4");
      template = options.template || "standard";
      filename = "".concat(type, "-report-").concat(new Date().toISOString().split("T")[0], ".pdf");
      // Add header
      addPDFHeader(pdf, type, template);
      switch (type) {
        case "cohort":
          addCohortContentToPDF(pdf, data, options);
          filename =
            options.filename ||
            "cohort-analysis-".concat(new Date().toISOString().split("T")[0], ".pdf");
          break;
        case "forecast":
          addForecastContentToPDF(pdf, data, options);
          filename =
            options.filename ||
            "forecast-report-".concat(new Date().toISOString().split("T")[0], ".pdf");
          break;
        case "insights":
          addInsightsContentToPDF(pdf, data, options);
          filename =
            options.filename ||
            "insights-report-".concat(new Date().toISOString().split("T")[0], ".pdf");
          break;
        case "dashboard":
          addDashboardContentToPDF(pdf, data, options);
          filename =
            options.filename ||
            "dashboard-report-".concat(new Date().toISOString().split("T")[0], ".pdf");
          break;
        default:
          throw new Error("Unsupported PDF export type: ".concat(type));
      }
      // Add footer
      addPDFFooter(pdf);
      pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
      return [
        2 /*return*/,
        {
          data: pdfBuffer,
          contentType: "application/pdf",
          filename: filename,
        },
      ];
    });
  });
}
/**
 * Generate JSON export
 */
function generateJSONExport(type, data, options) {
  return __awaiter(this, void 0, void 0, function () {
    var exportData, filename;
    return __generator(this, function (_a) {
      exportData = data;
      filename = ""
        .concat(type, "-export-")
        .concat(new Date().toISOString().split("T")[0], ".json");
      // Add metadata if requested
      if (options.includeMetadata) {
        exportData = {
          metadata: {
            exportType: type,
            exportDate: new Date().toISOString(),
            dateRange: options.dateRange,
            generatedBy: "NeonPro Analytics System",
          },
          data: exportData,
        };
      }
      return [
        2 /*return*/,
        {
          data: JSON.stringify(exportData, null, 2),
          contentType: "application/json",
          filename: options.filename || filename,
        },
      ];
    });
  });
}
// CSV Generation Functions
function generateCohortCSV(data) {
  if (!data.cohorts || !data.metrics) {
    throw new Error("Invalid cohort data structure");
  }
  var headers = ["Cohort", "Period", "Users", "Retention Rate", "Revenue", "Churn Rate"];
  var csv = headers.join(",") + "\n";
  data.metrics.forEach(function (metric) {
    var row = [
      metric.cohortId,
      metric.period,
      metric.totalUsers,
      "".concat(metric.retentionRate, "%"),
      "$".concat(metric.revenue),
      "".concat(metric.churnRate, "%"),
    ];
    csv += row.join(",") + "\n";
  });
  return csv;
}
function generateForecastCSV(data) {
  if (!data.predictions) {
    throw new Error("Invalid forecast data structure");
  }
  var headers = ["Date", "Prediction", "Lower Bound", "Upper Bound", "Confidence"];
  var csv = headers.join(",") + "\n";
  data.predictions.forEach(function (prediction) {
    var row = [
      prediction.date,
      prediction.value,
      prediction.lowerBound || "",
      prediction.upperBound || "",
      prediction.confidence || "",
    ];
    csv += row.join(",") + "\n";
  });
  return csv;
}
