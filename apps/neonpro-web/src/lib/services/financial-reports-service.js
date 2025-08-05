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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createfinancialReportsService = exports.FinancialReportsService = void 0;
var client_1 = require("@/lib/supabase/client");
var FinancialReportsService = /** @class */ (function () {
  function FinancialReportsService() {
    // Usar createClient de forma assíncrona quando necessário
  }
  FinancialReportsService.prototype.getSupabaseClient = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!!this.supabase) return [3 /*break*/, 2];
            _a = this;
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            _a.supabase = _b.sent();
            _b.label = 2;
          case 2:
            return [2 /*return*/, this.supabase];
        }
      });
    });
  };
  // Relatório de Aging de Contas a Pagar
  FinancialReportsService.prototype.getAgingReport = function (clinicId, asOfDate) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, reportDate, mockAgingData, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getSupabaseClient()];
          case 1:
            supabase = _a.sent();
            reportDate = asOfDate ? new Date(asOfDate) : new Date();
            mockAgingData = [
              {
                vendor_id: "1",
                vendor_name: "Fornecedor Alpha",
                vendor_document: "12.345.678/0001-90",
                total_amount: 45000,
                current: 15000,
                days_31_60: 12000,
                days_61_90: 8000,
                days_over_90: 10000,
                overdue_count: 3,
                oldest_invoice_date: "2025-04-15",
              },
              {
                vendor_id: "2",
                vendor_name: "Fornecedor Beta",
                vendor_document: "98.765.432/0001-10",
                total_amount: 28500,
                current: 28500,
                days_31_60: 0,
                days_61_90: 0,
                days_over_90: 0,
                overdue_count: 0,
                oldest_invoice_date: "2025-07-01",
              },
              {
                vendor_id: "3",
                vendor_name: "Fornecedor Gamma",
                vendor_document: "11.222.333/0001-44",
                total_amount: 18200,
                current: 3200,
                days_31_60: 5000,
                days_61_90: 10000,
                days_over_90: 0,
                overdue_count: 2,
                oldest_invoice_date: "2025-05-20",
              },
            ];
            return [
              2 /*return*/,
              mockAgingData.sort(function (a, b) {
                return b.total_amount - a.total_amount;
              }),
            ];
          case 2:
            error_1 = _a.sent();
            console.error("Error generating aging report:", error_1);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Análise de Performance de Fornecedores
  FinancialReportsService.prototype.getVendorPerformanceReport = function (
    clinicId,
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, mockPerformanceData, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getSupabaseClient()];
          case 1:
            supabase = _a.sent();
            mockPerformanceData = [
              {
                vendor_id: "1",
                vendor_name: "Fornecedor Alpha",
                total_invoices: 24,
                total_amount: 150000,
                avg_payment_time: 32.5,
                on_time_payments: 18,
                late_payments: 6,
                on_time_percentage: 75,
                total_discounts_taken: 2500,
                payment_methods_used: ["bank_transfer", "pix"],
                last_payment_date: "2025-07-18",
                risk_score: 6,
              },
              {
                vendor_id: "2",
                vendor_name: "Fornecedor Beta",
                total_invoices: 12,
                total_amount: 68500,
                avg_payment_time: 25.8,
                on_time_payments: 11,
                late_payments: 1,
                on_time_percentage: 91.7,
                total_discounts_taken: 850,
                payment_methods_used: ["pix", "cash"],
                last_payment_date: "2025-07-20",
                risk_score: 3,
              },
              {
                vendor_id: "3",
                vendor_name: "Fornecedor Gamma",
                total_invoices: 8,
                total_amount: 25600,
                avg_payment_time: 45.2,
                on_time_payments: 5,
                late_payments: 3,
                on_time_percentage: 62.5,
                total_discounts_taken: 0,
                payment_methods_used: ["bank_transfer"],
                last_payment_date: "2025-06-30",
                risk_score: 7,
              },
            ];
            return [
              2 /*return*/,
              mockPerformanceData.sort(function (a, b) {
                return a.risk_score - b.risk_score;
              }),
            ];
          case 2:
            error_2 = _a.sent();
            console.error("Error generating vendor performance report:", error_2);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Relatório de Despesas por Categoria
  FinancialReportsService.prototype.getCategoryExpenseReport = function (clinicId, year, month) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, mockCategoryData, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getSupabaseClient()];
          case 1:
            supabase = _a.sent();
            mockCategoryData = [
              {
                category_id: "1",
                category_name: "Equipamentos Médicos",
                current_month: 45000,
                previous_month: 38000,
                year_to_date: 280000,
                budget_allocated: 300000,
                budget_used_percentage: 93.3,
                variance_amount: -20000,
                variance_percentage: -6.7,
                invoice_count: 12,
                avg_invoice_amount: 3750,
                trend: "up",
              },
              {
                category_id: "2",
                category_name: "Material de Consumo",
                current_month: 18500,
                previous_month: 22000,
                year_to_date: 145000,
                budget_allocated: 180000,
                budget_used_percentage: 80.6,
                variance_amount: 35000,
                variance_percentage: 19.4,
                invoice_count: 28,
                avg_invoice_amount: 661,
                trend: "down",
              },
              {
                category_id: "3",
                category_name: "Serviços Terceirizados",
                current_month: 12000,
                previous_month: 12000,
                year_to_date: 84000,
                budget_allocated: 120000,
                budget_used_percentage: 70.0,
                variance_amount: 36000,
                variance_percentage: 30.0,
                invoice_count: 7,
                avg_invoice_amount: 1714,
                trend: "stable",
              },
              {
                category_id: "4",
                category_name: "Software e Licenças",
                current_month: 8500,
                previous_month: 8500,
                year_to_date: 59500,
                budget_allocated: 72000,
                budget_used_percentage: 82.6,
                variance_amount: 12500,
                variance_percentage: 17.4,
                invoice_count: 5,
                avg_invoice_amount: 1700,
                trend: "stable",
              },
            ];
            return [
              2 /*return*/,
              mockCategoryData.sort(function (a, b) {
                return b.current_month - a.current_month;
              }),
            ];
          case 2:
            error_3 = _a.sent();
            console.error("Error generating category expense report:", error_3);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Acompanhamento de Orçamento
  FinancialReportsService.prototype.getBudgetTrackingReport = function (clinicId, period) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, mockBudgetReport, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getSupabaseClient()];
          case 1:
            supabase = _a.sent();
            mockBudgetReport = {
              period: period,
              total_budget: 600000,
              total_spent: 465000,
              total_committed: 85000,
              remaining_budget: 50000,
              budget_utilization_percentage: 91.7,
              categories: [
                {
                  category_name: "Equipamentos Médicos",
                  budgeted: 300000,
                  spent: 280000,
                  committed: 15000,
                  remaining: 5000,
                  variance: -295000,
                  utilization_percentage: 98.3,
                },
                {
                  category_name: "Material de Consumo",
                  budgeted: 180000,
                  spent: 145000,
                  committed: 25000,
                  remaining: 10000,
                  variance: -170000,
                  utilization_percentage: 94.4,
                },
                {
                  category_name: "Serviços Terceirizados",
                  budgeted: 120000,
                  spent: 84000,
                  committed: 15000,
                  remaining: 21000,
                  variance: -99000,
                  utilization_percentage: 82.5,
                },
              ],
              alerts: [
                {
                  type: "near_limit",
                  category: "Equipamentos Médicos",
                  message: "Categoria próxima do limite orçamentário (98.3% utilizado)",
                  amount: 295000,
                },
                {
                  type: "over_budget",
                  category: "Material de Consumo",
                  message: "Gastos aprovados excedem orçamento em R$ 5.000",
                  amount: 5000,
                },
              ],
            };
            return [2 /*return*/, mockBudgetReport];
          case 2:
            error_4 = _a.sent();
            console.error("Error generating budget tracking report:", error_4);
            throw error_4;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Projeção de Fluxo de Caixa
  FinancialReportsService.prototype.getCashFlowProjection = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, periods, periodType) {
      var supabase,
        projections,
        currentDate,
        runningBalance,
        i,
        projectedOutflows,
        projectedInflows,
        netFlow,
        apDue,
        error_5;
      if (periods === void 0) {
        periods = 12;
      }
      if (periodType === void 0) {
        periodType = "monthly";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getSupabaseClient()];
          case 1:
            supabase = _a.sent();
            projections = [];
            currentDate = new Date();
            runningBalance = 250000;
            for (i = 0; i < periods; i++) {
              projectedOutflows = 45000 + (Math.random() * 20000 - 10000);
              projectedInflows = 65000 + (Math.random() * 15000 - 7500);
              netFlow = projectedInflows - projectedOutflows;
              apDue = 35000 + Math.random() * 15000;
              projections.push({
                date: currentDate.toISOString().split("T")[0],
                period_type: periodType,
                opening_balance: runningBalance,
                projected_inflows: projectedInflows,
                projected_outflows: projectedOutflows,
                net_cash_flow: netFlow,
                closing_balance: runningBalance + netFlow,
                accounts_payable_due: apDue,
                confidence_level: i < 3 ? "high" : i < 6 ? "medium" : "low",
                scenarios: {
                  optimistic: runningBalance + netFlow + 15000,
                  realistic: runningBalance + netFlow,
                  pessimistic: runningBalance + netFlow - 12000,
                },
              });
              runningBalance += netFlow;
              // Avançar período
              if (periodType === "monthly") {
                currentDate.setMonth(currentDate.getMonth() + 1);
              } else {
                currentDate.setDate(currentDate.getDate() + 7);
              }
            }
            return [2 /*return*/, projections];
          case 2:
            error_5 = _a.sent();
            console.error("Error generating cash flow projection:", error_5);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métricas Resumidas do Sistema Financeiro
  FinancialReportsService.prototype.getFinancialSummary = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, summary, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getSupabaseClient()];
          case 1:
            supabase = _a.sent();
            summary = {
              total_payables: 485000,
              total_overdue: 45000,
              total_current: 440000,
              avg_payment_period: 28.5,
              vendor_count: 45,
              active_vendors: 32,
              payment_velocity: 12.3,
              discount_opportunities: 8500,
              cost_savings_ytd: 24500,
              top_vendor_concentration: 31.2,
            };
            return [2 /*return*/, summary];
          case 2:
            error_6 = _a.sent();
            console.error("Error generating financial summary:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Utilitários para formatação
  FinancialReportsService.prototype.formatCurrency = function (amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };
  FinancialReportsService.prototype.formatPercentage = function (value, decimals) {
    if (decimals === void 0) {
      decimals = 1;
    }
    return "".concat(value.toFixed(decimals), "%");
  };
  FinancialReportsService.prototype.calculateGrowthRate = function (current, previous) {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  FinancialReportsService.prototype.getTrendIcon = function (trend) {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "➡️";
      default:
        return "➡️";
    }
  };
  FinancialReportsService.prototype.getRiskColor = function (riskScore) {
    if (riskScore <= 3) return "secondary";
    if (riskScore <= 6) return "default";
    return "destructive";
  };
  FinancialReportsService.prototype.getBudgetHealthColor = function (utilizationPercentage) {
    if (utilizationPercentage <= 80) return "secondary";
    if (utilizationPercentage <= 95) return "default";
    return "destructive";
  };
  return FinancialReportsService;
})();
exports.FinancialReportsService = FinancialReportsService;
var createfinancialReportsService = function () {
  return new FinancialReportsService();
};
exports.createfinancialReportsService = createfinancialReportsService;
