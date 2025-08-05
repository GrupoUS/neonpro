"use strict";
// =====================================================================================
// Financial Reporting API - Advanced Analytics Endpoint
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var reporting_engine_1 = require("@/lib/financial/reporting-engine");
var analytics_core_1 = require("@/lib/financial/analytics-core");
var financial_reporting_1 = require("@/lib/validations/financial-reporting");
var financial_reporting_2 = require("@/lib/types/financial-reporting");
// Initialize services
var reportingEngine = new reporting_engine_1.FinancialReportingEngine();
var analyticsCore = new analytics_core_1.FinancialAnalyticsCore();
// =====================================================================================
// GET: Fetch Financial Reports and Analytics
// =====================================================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, searchParams, clinicId, reportType, action, _a, user, authError, _b, error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 15, , 16]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          reportType = searchParams.get("report_type");
          action = searchParams.get("action") || "dashboard";
          if (!clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 }),
            ];
          }
          _b = action;
          switch (_b) {
            case "dashboard":
              return [3 /*break*/, 3];
            case "kpis":
              return [3 /*break*/, 5];
            case "reports":
              return [3 /*break*/, 7];
            case "generate-report":
              return [3 /*break*/, 9];
            case "performance":
              return [3 /*break*/, 11];
          }
          return [3 /*break*/, 13];
        case 3:
          return [4 /*yield*/, handleDashboardRequest(clinicId)];
        case 4:
          return [2 /*return*/, _c.sent()];
        case 5:
          return [4 /*yield*/, handleKPIRequest(clinicId, searchParams)];
        case 6:
          return [2 /*return*/, _c.sent()];
        case 7:
          return [4 /*yield*/, handleReportsListRequest(clinicId, searchParams)];
        case 8:
          return [2 /*return*/, _c.sent()];
        case 9:
          return [4 /*yield*/, handleReportGenerationRequest(clinicId, reportType, searchParams)];
        case 10:
          return [2 /*return*/, _c.sent()];
        case 11:
          return [4 /*yield*/, handlePerformanceRequest(clinicId, searchParams)];
        case 12:
          return [2 /*return*/, _c.sent()];
        case 13:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "A\u00E7\u00E3o '".concat(action, "' n\u00E3o reconhecida") },
              { status: 400 },
            ),
          ];
        case 14:
          return [3 /*break*/, 16];
        case 15:
          error_1 = _c.sent();
          console.error("GET /api/financial/reporting error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// POST: Generate Reports and Analytics
// =====================================================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, body, action, clinic_id, parameters, options, _a, user, authError, _b, error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 16, , 17]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, request.json()];
        case 2:
          body = _c.sent();
          (action = body.action),
            (clinic_id = body.clinic_id),
            (parameters = body.parameters),
            (options = body.options);
          if (!clinic_id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "clinic_id é obrigatório" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 }),
            ];
          }
          _b = action;
          switch (_b) {
            case "generate-profit-loss":
              return [3 /*break*/, 4];
            case "generate-balance-sheet":
              return [3 /*break*/, 6];
            case "generate-cash-flow":
              return [3 /*break*/, 8];
            case "export-report":
              return [3 /*break*/, 10];
            case "schedule-report":
              return [3 /*break*/, 12];
          }
          return [3 /*break*/, 14];
        case 4:
          return [4 /*yield*/, handleProfitLossGeneration(clinic_id, parameters)];
        case 5:
          return [2 /*return*/, _c.sent()];
        case 6:
          return [4 /*yield*/, handleBalanceSheetGeneration(clinic_id, parameters)];
        case 7:
          return [2 /*return*/, _c.sent()];
        case 8:
          return [4 /*yield*/, handleCashFlowGeneration(clinic_id, parameters)];
        case 9:
          return [2 /*return*/, _c.sent()];
        case 10:
          return [4 /*yield*/, handleReportExport(clinic_id, parameters, options)];
        case 11:
          return [2 /*return*/, _c.sent()];
        case 12:
          return [4 /*yield*/, handleReportScheduling(clinic_id, parameters, options)];
        case 13:
          return [2 /*return*/, _c.sent()];
        case 14:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "A\u00E7\u00E3o '".concat(action, "' n\u00E3o reconhecida") },
              { status: 400 },
            ),
          ];
        case 15:
          return [3 /*break*/, 17];
        case 16:
          error_2 = _c.sent();
          console.error("POST /api/financial/reporting error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }),
          ];
        case 17:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================================================
// REQUEST HANDLERS
// =====================================================================================
/**
 * Handle dashboard data request
 */
function handleDashboardRequest(clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var dashboardData, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, analyticsCore.generateDashboardData(clinicId)];
        case 1:
          dashboardData = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: dashboardData,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 2:
          error_3 = _a.sent();
          console.error("Dashboard request error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Erro ao gerar dados do dashboard" },
              { status: 500 },
            ),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle KPI calculation request
 */
function handleKPIRequest(clinicId, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var periodStart, periodEnd, now, parameters_1, kpis_1, parameters, validation, kpis, error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          periodStart = searchParams.get("period_start");
          periodEnd = searchParams.get("period_end");
          if (!(!periodStart || !periodEnd)) return [3 /*break*/, 2];
          now = new Date();
          parameters_1 = {
            period_start: new Date(now.getFullYear(), now.getMonth(), 1)
              .toISOString()
              .split("T")[0],
            period_end: now.toISOString().split("T")[0],
          };
          return [4 /*yield*/, analyticsCore.calculateFinancialKPIs(clinicId, parameters_1)];
        case 1:
          kpis_1 = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: kpis_1,
              parameters: parameters_1,
            }),
          ];
        case 2:
          parameters = { period_start: periodStart, period_end: periodEnd };
          validation = financial_reporting_1.reportParametersSchema.safeParse(parameters);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Parâmetros inválidos", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, analyticsCore.calculateFinancialKPIs(clinicId, parameters)];
        case 3:
          kpis = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: kpis,
              parameters: parameters,
            }),
          ];
        case 4:
          error_4 = _a.sent();
          console.error("KPI request error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro ao calcular KPIs" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle reports list request
 */
function handleReportsListRequest(clinicId, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var reportType, status_1, page, limit, filters, reports, error_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          reportType = searchParams.get("report_type");
          status_1 = searchParams.get("status");
          page = parseInt(searchParams.get("page") || "1");
          limit = parseInt(searchParams.get("limit") || "20");
          filters = {
            report_type: reportType || undefined,
            status: status_1 || undefined,
            page: page,
            limit: limit,
          };
          return [4 /*yield*/, reportingEngine.getFinancialReports(clinicId, filters)];
        case 1:
          reports = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: reports.reports,
              pagination: {
                page: page,
                limit: limit,
                total: reports.total,
                pages: Math.ceil(reports.total / limit),
              },
            }),
          ];
        case 2:
          error_5 = _a.sent();
          console.error("Reports list request error:", error_5);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro ao buscar relatórios" }, { status: 500 }),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle report generation request
 */
function handleReportGenerationRequest(clinicId, reportType, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var periodStart, periodEnd, parameters, validation, reportData, _a, savedReport, error_6;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 10, , 11]);
          if (
            !reportType ||
            !Object.values(financial_reporting_2.REPORT_TYPES).includes(reportType)
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 }),
            ];
          }
          periodStart = searchParams.get("period_start");
          periodEnd = searchParams.get("period_end");
          if (!periodStart || !periodEnd) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "period_start e period_end são obrigatórios" },
                { status: 400 },
              ),
            ];
          }
          parameters = { period_start: periodStart, period_end: periodEnd };
          validation = financial_reporting_1.reportParametersSchema.safeParse(parameters);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Parâmetros inválidos", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          reportData = void 0;
          _a = reportType;
          switch (_a) {
            case financial_reporting_2.REPORT_TYPES.PROFIT_LOSS:
              return [3 /*break*/, 1];
            case financial_reporting_2.REPORT_TYPES.BALANCE_SHEET:
              return [3 /*break*/, 3];
            case financial_reporting_2.REPORT_TYPES.CASH_FLOW:
              return [3 /*break*/, 5];
          }
          return [3 /*break*/, 7];
        case 1:
          return [4 /*yield*/, reportingEngine.generateProfitLossStatement(clinicId, parameters)];
        case 2:
          reportData = _b.sent();
          return [3 /*break*/, 8];
        case 3:
          return [4 /*yield*/, reportingEngine.generateBalanceSheet(clinicId, periodEnd)];
        case 4:
          reportData = _b.sent();
          return [3 /*break*/, 8];
        case 5:
          return [4 /*yield*/, reportingEngine.generateCashFlowStatement(clinicId, parameters)];
        case 6:
          reportData = _b.sent();
          return [3 /*break*/, 8];
        case 7:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Tipo de relatório não implementado" },
              { status: 400 },
            ),
          ];
        case 8:
          return [
            4 /*yield*/,
            reportingEngine.saveFinancialReport(
              {
                clinic_id: clinicId,
                report_type: reportType,
                period_start: periodStart,
                period_end: periodEnd,
                generated_by: "system", // TODO: Get user ID
              },
              reportData,
            ),
          ];
        case 9:
          savedReport = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                report: savedReport,
                content: reportData,
              },
            }),
          ];
        case 10:
          error_6 = _b.sent();
          console.error("Report generation error:", error_6);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle performance metrics request
 */
function handlePerformanceRequest(clinicId, searchParams) {
  return __awaiter(this, void 0, void 0, function () {
    var periodStart, periodEnd, parameters, validation, performance_1, error_7;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          periodStart = searchParams.get("period_start");
          periodEnd = searchParams.get("period_end");
          if (!periodStart || !periodEnd) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "period_start e period_end são obrigatórios" },
                { status: 400 },
              ),
            ];
          }
          parameters = { period_start: periodStart, period_end: periodEnd };
          validation = financial_reporting_1.reportParametersSchema.safeParse(parameters);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Parâmetros inválidos", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, analyticsCore.calculatePerformanceMetrics(clinicId, parameters)];
        case 1:
          performance_1 = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: performance_1,
              parameters: parameters,
            }),
          ];
        case 2:
          error_7 = _a.sent();
          console.error("Performance request error:", error_7);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Erro ao calcular métricas de performance" },
              { status: 500 },
            ),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle Profit & Loss statement generation
 */
function handleProfitLossGeneration(clinicId, parameters) {
  return __awaiter(this, void 0, void 0, function () {
    var validation, profitLoss, savedReport, error_8;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          validation = financial_reporting_1.reportParametersSchema.safeParse(parameters);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Parâmetros inválidos", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            reportingEngine.generateProfitLossStatement(clinicId, validation.data),
          ];
        case 1:
          profitLoss = _a.sent();
          return [
            4 /*yield*/,
            reportingEngine.saveFinancialReport(
              {
                clinic_id: clinicId,
                report_type: financial_reporting_2.REPORT_TYPES.PROFIT_LOSS,
                period_start: parameters.period_start,
                period_end: parameters.period_end,
                generated_by: "system",
              },
              profitLoss,
            ),
          ];
        case 2:
          savedReport = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                report: savedReport,
                content: profitLoss,
              },
            }),
          ];
        case 3:
          error_8 = _a.sent();
          console.error("P&L generation error:", error_8);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro ao gerar DRE" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle Balance Sheet generation
 */
function handleBalanceSheetGeneration(clinicId, parameters) {
  return __awaiter(this, void 0, void 0, function () {
    var balanceSheet, savedReport, error_9;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          if (!parameters.as_of_date) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "as_of_date é obrigatório para balanço patrimonial" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            reportingEngine.generateBalanceSheet(clinicId, parameters.as_of_date),
          ];
        case 1:
          balanceSheet = _a.sent();
          return [
            4 /*yield*/,
            reportingEngine.saveFinancialReport(
              {
                clinic_id: clinicId,
                report_type: financial_reporting_2.REPORT_TYPES.BALANCE_SHEET,
                period_start: parameters.as_of_date,
                period_end: parameters.as_of_date,
                generated_by: "system",
              },
              balanceSheet,
            ),
          ];
        case 2:
          savedReport = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                report: savedReport,
                content: balanceSheet,
              },
            }),
          ];
        case 3:
          error_9 = _a.sent();
          console.error("Balance sheet generation error:", error_9);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Erro ao gerar balanço patrimonial" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle Cash Flow statement generation
 */
function handleCashFlowGeneration(clinicId, parameters) {
  return __awaiter(this, void 0, void 0, function () {
    var validation, cashFlow, savedReport, error_10;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          validation = financial_reporting_1.reportParametersSchema.safeParse(parameters);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Parâmetros inválidos", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            reportingEngine.generateCashFlowStatement(clinicId, validation.data),
          ];
        case 1:
          cashFlow = _a.sent();
          return [
            4 /*yield*/,
            reportingEngine.saveFinancialReport(
              {
                clinic_id: clinicId,
                report_type: financial_reporting_2.REPORT_TYPES.CASH_FLOW,
                period_start: parameters.period_start,
                period_end: parameters.period_end,
                generated_by: "system",
              },
              cashFlow,
            ),
          ];
        case 2:
          savedReport = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                report: savedReport,
                content: cashFlow,
              },
            }),
          ];
        case 3:
          error_10 = _a.sent();
          console.error("Cash flow generation error:", error_10);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Erro ao gerar fluxo de caixa" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle report export (placeholder)
 */
function handleReportExport(clinicId, parameters, options) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      try {
        // TODO: Implement report export functionality (PDF, Excel, CSV)
        return [
          2 /*return*/,
          server_1.NextResponse.json({
            success: true,
            message: "Exportação de relatórios será implementada em breve",
            data: {
              clinic_id: clinicId,
              parameters: parameters,
              options: options,
            },
          }),
        ];
      } catch (error) {
        console.error("Report export error:", error);
        return [
          2 /*return*/,
          server_1.NextResponse.json({ error: "Erro ao exportar relatório" }, { status: 500 }),
        ];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * Handle report scheduling (placeholder)
 */
function handleReportScheduling(clinicId, parameters, options) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      try {
        // TODO: Implement report scheduling functionality
        return [
          2 /*return*/,
          server_1.NextResponse.json({
            success: true,
            message: "Agendamento de relatórios será implementado em breve",
            data: {
              clinic_id: clinicId,
              parameters: parameters,
              options: options,
            },
          }),
        ];
      } catch (error) {
        console.error("Report scheduling error:", error);
        return [
          2 /*return*/,
          server_1.NextResponse.json({ error: "Erro ao agendar relatório" }, { status: 500 }),
        ];
      }
      return [2 /*return*/];
    });
  });
}
