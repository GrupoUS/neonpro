/**
 * Cash Flow Monitoring Engine - Real-time Financial Analytics
 * Story 4.2: Financial Analytics & Business Intelligence
 * Phase 1: Real-time Cash Flow Dashboard
 *
 * This module provides real-time cash flow calculation and monitoring:
 * - Real-time cash flow calculation engine
 * - Multi-account cash flow aggregation
 * - Live financial position tracking
 * - Daily/weekly/monthly cash flow views
 * - Integration with banking APIs for real-time updates
 * - Cash flow trend analysis and indicators
 */
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
exports.CashFlowEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var CashFlowEngine = /** @class */ (() => {
  function CashFlowEngine() {
    this.supabase = (0, client_1.createClient)();
  }
  /**
   * Calculate real-time cash flow for a clinic
   */
  CashFlowEngine.prototype.calculateRealTimeCashFlow = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var today,
        previousDay,
        openingBalance,
        _a,
        inflows,
        outflows,
        netCashFlow,
        closingBalance,
        cashFlowData,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            today = new Date().toISOString().split("T")[0];
            return [
              4 /*yield*/,
              this.supabase
                .from("cash_flow_daily")
                .select("closing_balance")
                .eq("clinic_id", clinicId)
                .lt("date", today)
                .order("date", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            previousDay = _b.sent().data;
            openingBalance =
              (previousDay === null || previousDay === void 0
                ? void 0
                : previousDay.closing_balance) || 0;
            return [
              4 /*yield*/,
              Promise.all([
                this.calculateDailyInflows(clinicId, today),
                this.calculateDailyOutflows(clinicId, today),
              ]),
            ];
          case 2:
            (_a = _b.sent()), (inflows = _a[0]), (outflows = _a[1]);
            netCashFlow = inflows.total - outflows.total;
            closingBalance = openingBalance + netCashFlow;
            cashFlowData = {
              id: "".concat(clinicId, "-").concat(today),
              clinic_id: clinicId,
              date: today,
              opening_balance: openingBalance,
              closing_balance: closingBalance,
              total_inflows: inflows.total,
              total_outflows: outflows.total,
              net_cash_flow: netCashFlow,
              operating_cash_flow: inflows.operating - outflows.operating,
              investing_cash_flow: inflows.investing - outflows.investing,
              financing_cash_flow: inflows.financing - outflows.financing,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            // Upsert cash flow data
            return [4 /*yield*/, this.supabase.from("cash_flow_daily").upsert(cashFlowData)];
          case 3:
            // Upsert cash flow data
            _b.sent();
            return [2 /*return*/, cashFlowData];
          case 4:
            error_1 = _b.sent();
            console.error("Error calculating real-time cash flow:", error_1);
            throw new Error("Failed to calculate real-time cash flow");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get cash flow summary with trends and projections
   */
  CashFlowEngine.prototype.getCashFlowSummary = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var today,
        yesterday_1,
        weekAgo_1,
        monthAgo,
        currentCashFlow,
        currentBalance,
        historicalData,
        yesterdayData,
        weekAgoData,
        monthAgoData,
        dailyChange,
        weeklyChange,
        monthlyChange,
        recentTrend,
        trendDirection,
        trendPercentage,
        avgDailyOutflow,
        runwayDays,
        projectedBalance7d,
        projectedBalance30d,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            today = new Date();
            yesterday_1 = new Date(today);
            yesterday_1.setDate(yesterday_1.getDate() - 1);
            weekAgo_1 = new Date(today);
            weekAgo_1.setDate(weekAgo_1.getDate() - 7);
            monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return [4 /*yield*/, this.calculateRealTimeCashFlow(clinicId)];
          case 1:
            currentCashFlow = _a.sent();
            currentBalance = currentCashFlow.closing_balance;
            return [
              4 /*yield*/,
              this.supabase
                .from("cash_flow_daily")
                .select("date, closing_balance, net_cash_flow")
                .eq("clinic_id", clinicId)
                .gte("date", monthAgo.toISOString().split("T")[0])
                .order("date", { ascending: true }),
            ];
          case 2:
            historicalData = _a.sent().data;
            if (!historicalData || historicalData.length === 0) {
              throw new Error("No historical cash flow data found");
            }
            yesterdayData = historicalData.find(
              (d) => d.date === yesterday_1.toISOString().split("T")[0],
            );
            weekAgoData = historicalData.find(
              (d) => d.date === weekAgo_1.toISOString().split("T")[0],
            );
            monthAgoData = historicalData[0];
            dailyChange = yesterdayData ? currentBalance - yesterdayData.closing_balance : 0;
            weeklyChange = weekAgoData ? currentBalance - weekAgoData.closing_balance : 0;
            monthlyChange = monthAgoData ? currentBalance - monthAgoData.closing_balance : 0;
            recentTrend = this.calculateTrend(historicalData.slice(-7));
            trendDirection = recentTrend > 0.05 ? "up" : recentTrend < -0.05 ? "down" : "stable";
            trendPercentage = Math.abs(recentTrend) * 100;
            avgDailyOutflow =
              historicalData.reduce((sum, d) => sum + Math.abs(Math.min(d.net_cash_flow, 0)), 0) /
              historicalData.length;
            runwayDays =
              avgDailyOutflow > 0 ? Math.floor(currentBalance / avgDailyOutflow) : Infinity;
            return [4 /*yield*/, this.projectCashFlow(clinicId, 7)];
          case 3:
            projectedBalance7d = _a.sent();
            return [4 /*yield*/, this.projectCashFlow(clinicId, 30)];
          case 4:
            projectedBalance30d = _a.sent();
            return [
              2 /*return*/,
              {
                current_balance: currentBalance,
                daily_change: dailyChange,
                weekly_change: weeklyChange,
                monthly_change: monthlyChange,
                trend_direction: trendDirection,
                trend_percentage: trendPercentage,
                projected_balance_7d: projectedBalance7d,
                projected_balance_30d: projectedBalance30d,
                cash_burn_rate: avgDailyOutflow,
                runway_days: runwayDays,
              },
            ];
          case 5:
            error_2 = _a.sent();
            console.error("Error getting cash flow summary:", error_2);
            throw new Error("Failed to get cash flow summary");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate cash flow alerts based on thresholds and trends
   */
  CashFlowEngine.prototype.generateCashFlowAlerts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var summary, alerts, settings, thresholds, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getCashFlowSummary(clinicId)];
          case 1:
            summary = _a.sent();
            alerts = [];
            return [
              4 /*yield*/,
              this.supabase
                .from("clinic_financial_settings")
                .select("cash_flow_alerts")
                .eq("clinic_id", clinicId)
                .single(),
            ];
          case 2:
            settings = _a.sent().data;
            thresholds = (settings === null || settings === void 0
              ? void 0
              : settings.cash_flow_alerts) || {
              low_balance: 10000,
              negative_trend_days: 3,
              high_burn_rate: 5000,
              runway_warning_days: 30,
            };
            // Low balance alert
            if (summary.current_balance < thresholds.low_balance) {
              alerts.push({
                id: "low_balance_".concat(Date.now()),
                type: "low_balance",
                severity:
                  summary.current_balance < thresholds.low_balance * 0.5 ? "critical" : "warning",
                message: "Cash balance is below threshold: R$ ".concat(
                  summary.current_balance.toLocaleString("pt-BR"),
                ),
                threshold_value: thresholds.low_balance,
                current_value: summary.current_balance,
                triggered_at: new Date().toISOString(),
                acknowledged: false,
              });
            }
            // Negative trend alert
            if (summary.trend_direction === "down" && summary.trend_percentage > 10) {
              alerts.push({
                id: "negative_trend_".concat(Date.now()),
                type: "negative_trend",
                severity: summary.trend_percentage > 20 ? "critical" : "warning",
                message: "Negative cash flow trend detected: ".concat(
                  summary.trend_percentage.toFixed(1),
                  "% decline",
                ),
                current_value: summary.trend_percentage,
                triggered_at: new Date().toISOString(),
                acknowledged: false,
              });
            }
            // High burn rate alert
            if (summary.cash_burn_rate > thresholds.high_burn_rate) {
              alerts.push({
                id: "high_burn_rate_".concat(Date.now()),
                type: "high_burn_rate",
                severity: "warning",
                message: "High cash burn rate: R$ ".concat(
                  summary.cash_burn_rate.toLocaleString("pt-BR"),
                  "/day",
                ),
                threshold_value: thresholds.high_burn_rate,
                current_value: summary.cash_burn_rate,
                triggered_at: new Date().toISOString(),
                acknowledged: false,
              });
            }
            // Runway warning alert
            if (
              summary.runway_days < thresholds.runway_warning_days &&
              summary.runway_days !== Infinity
            ) {
              alerts.push({
                id: "runway_warning_".concat(Date.now()),
                type: "threshold_breach",
                severity: summary.runway_days < 7 ? "emergency" : "critical",
                message: "Cash runway warning: ".concat(summary.runway_days, " days remaining"),
                threshold_value: thresholds.runway_warning_days,
                current_value: summary.runway_days,
                triggered_at: new Date().toISOString(),
                acknowledged: false,
              });
            }
            return [2 /*return*/, alerts];
          case 3:
            error_3 = _a.sent();
            console.error("Error generating cash flow alerts:", error_3);
            throw new Error("Failed to generate cash flow alerts");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate daily inflows by category
   */
  CashFlowEngine.prototype.calculateDailyInflows = function (clinicId, date) {
    return __awaiter(this, void 0, void 0, function () {
      var payments, total, operating, investing, financing;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("payments")
                .select("amount, payment_type, category")
                .eq("clinic_id", clinicId)
                .gte("created_at", "".concat(date, "T00:00:00"))
                .lt("created_at", "".concat(date, "T23:59:59"))
                .eq("status", "completed"),
            ];
          case 1:
            payments = _a.sent().data;
            total =
              (payments === null || payments === void 0
                ? void 0
                : payments.reduce((sum, p) => sum + p.amount, 0)) || 0;
            operating =
              (payments === null || payments === void 0
                ? void 0
                : payments
                    .filter((p) => p.category === "treatment" || p.category === "product")
                    .reduce((sum, p) => sum + p.amount, 0)) || 0;
            investing =
              (payments === null || payments === void 0
                ? void 0
                : payments
                    .filter((p) => p.category === "investment")
                    .reduce((sum, p) => sum + p.amount, 0)) || 0;
            financing =
              (payments === null || payments === void 0
                ? void 0
                : payments
                    .filter((p) => p.category === "loan" || p.category === "equity")
                    .reduce((sum, p) => sum + p.amount, 0)) || 0;
            return [
              2 /*return*/,
              { total: total, operating: operating, investing: investing, financing: financing },
            ];
        }
      });
    });
  };
  /**
   * Calculate daily outflows by category
   */
  CashFlowEngine.prototype.calculateDailyOutflows = function (clinicId, date) {
    return __awaiter(this, void 0, void 0, function () {
      var expenses, total, operating, investing, financing;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("expenses")
                .select("amount, expense_type, category")
                .eq("clinic_id", clinicId)
                .gte("created_at", "".concat(date, "T00:00:00"))
                .lt("created_at", "".concat(date, "T23:59:59"))
                .eq("status", "paid"),
            ];
          case 1:
            expenses = _a.sent().data;
            total =
              (expenses === null || expenses === void 0
                ? void 0
                : expenses.reduce((sum, e) => sum + e.amount, 0)) || 0;
            operating =
              (expenses === null || expenses === void 0
                ? void 0
                : expenses
                    .filter((e) => e.category === "operational" || e.category === "staff")
                    .reduce((sum, e) => sum + e.amount, 0)) || 0;
            investing =
              (expenses === null || expenses === void 0
                ? void 0
                : expenses
                    .filter((e) => e.category === "equipment" || e.category === "technology")
                    .reduce((sum, e) => sum + e.amount, 0)) || 0;
            financing =
              (expenses === null || expenses === void 0
                ? void 0
                : expenses
                    .filter((e) => e.category === "loan_payment" || e.category === "interest")
                    .reduce((sum, e) => sum + e.amount, 0)) || 0;
            return [
              2 /*return*/,
              { total: total, operating: operating, investing: investing, financing: financing },
            ];
        }
      });
    });
  };
  /**
   * Calculate trend from historical data
   */
  CashFlowEngine.prototype.calculateTrend = (data) => {
    if (data.length < 2) return 0;
    var first = data[0].closing_balance;
    var last = data[data.length - 1].closing_balance;
    return first > 0 ? (last - first) / first : 0;
  };
  /**
   * Project cash flow for future days
   */
  CashFlowEngine.prototype.projectCashFlow = function (clinicId, days) {
    return __awaiter(this, void 0, void 0, function () {
      var historicalData, avgDailyCashFlow, currentBalance, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("cash_flow_daily")
                .select("net_cash_flow")
                .eq("clinic_id", clinicId)
                .order("date", { ascending: false })
                .limit(30),
            ];
          case 1:
            historicalData = _a.sent().data;
            if (!historicalData || historicalData.length === 0) {
              return [2 /*return*/, 0];
            }
            avgDailyCashFlow =
              historicalData.reduce((sum, d) => sum + d.net_cash_flow, 0) / historicalData.length;
            return [4 /*yield*/, this.calculateRealTimeCashFlow(clinicId)];
          case 2:
            currentBalance = _a.sent();
            return [2 /*return*/, currentBalance.closing_balance + avgDailyCashFlow * days];
          case 3:
            error_4 = _a.sent();
            console.error("Error projecting cash flow:", error_4);
            return [2 /*return*/, 0];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get cash flow metrics for analysis
   */
  CashFlowEngine.prototype.getCashFlowMetrics = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, days) {
      var endDate,
        startDate,
        cashFlowData,
        dailyInflows,
        dailyOutflows,
        balances_1,
        dailyAverageInflow,
        dailyAverageOutflow,
        dailyChanges,
        avgDailyChange_1,
        variance,
        weeklyVolatility,
        firstBalance,
        lastBalance,
        monthlyGrowthRate,
        financialPosition,
        currentAssets,
        currentLiabilities,
        quickAssets,
        workingCapital,
        currentRatio,
        quickRatio,
        error_5;
      if (days === void 0) {
        days = 30;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            endDate = new Date();
            startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - days);
            return [
              4 /*yield*/,
              this.supabase
                .from("cash_flow_daily")
                .select("*")
                .eq("clinic_id", clinicId)
                .gte("date", startDate.toISOString().split("T")[0])
                .order("date", { ascending: true }),
            ];
          case 1:
            cashFlowData = _a.sent().data;
            if (!cashFlowData || cashFlowData.length === 0) {
              throw new Error("No cash flow data found for metrics calculation");
            }
            dailyInflows = cashFlowData.map((d) => d.total_inflows);
            dailyOutflows = cashFlowData.map((d) => d.total_outflows);
            balances_1 = cashFlowData.map((d) => d.closing_balance);
            dailyAverageInflow =
              dailyInflows.reduce((sum, val) => sum + val, 0) / dailyInflows.length;
            dailyAverageOutflow =
              dailyOutflows.reduce((sum, val) => sum + val, 0) / dailyOutflows.length;
            dailyChanges = balances_1.slice(1).map((balance, i) => balance - balances_1[i]);
            avgDailyChange_1 =
              dailyChanges.reduce((sum, val) => sum + val, 0) / dailyChanges.length;
            variance =
              dailyChanges.reduce((sum, val) => sum + (val - avgDailyChange_1) ** 2, 0) /
              dailyChanges.length;
            weeklyVolatility = Math.sqrt(variance) * Math.sqrt(7); // Annualized to weekly
            firstBalance = balances_1[0];
            lastBalance = balances_1[balances_1.length - 1];
            monthlyGrowthRate =
              firstBalance > 0 ? ((lastBalance - firstBalance) / firstBalance) * 100 : 0;
            return [
              4 /*yield*/,
              this.supabase
                .from("financial_position")
                .select("current_assets, current_liabilities, quick_assets")
                .eq("clinic_id", clinicId)
                .order("date", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 2:
            financialPosition = _a.sent().data;
            currentAssets =
              (financialPosition === null || financialPosition === void 0
                ? void 0
                : financialPosition.current_assets) || 0;
            currentLiabilities =
              (financialPosition === null || financialPosition === void 0
                ? void 0
                : financialPosition.current_liabilities) || 0;
            quickAssets =
              (financialPosition === null || financialPosition === void 0
                ? void 0
                : financialPosition.quick_assets) || 0;
            workingCapital = currentAssets - currentLiabilities;
            currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
            quickRatio = currentLiabilities > 0 ? quickAssets / currentLiabilities : 0;
            return [
              2 /*return*/,
              {
                daily_average_inflow: dailyAverageInflow,
                daily_average_outflow: dailyAverageOutflow,
                weekly_volatility: weeklyVolatility,
                monthly_growth_rate: monthlyGrowthRate,
                cash_conversion_cycle: 0, // TODO: Implement based on receivables and payables
                working_capital: workingCapital,
                quick_ratio: quickRatio,
                current_ratio: currentRatio,
              },
            ];
          case 3:
            error_5 = _a.sent();
            console.error("Error calculating cash flow metrics:", error_5);
            throw new Error("Failed to calculate cash flow metrics");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return CashFlowEngine;
})();
exports.CashFlowEngine = CashFlowEngine;
exports.default = CashFlowEngine;
