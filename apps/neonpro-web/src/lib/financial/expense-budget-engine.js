"use strict";
// Expense & Budget Management Engine
// Epic 5, Story 5.1, Task 5: Expense & Budget Management
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
exports.ExpenseBudgetEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var ExpenseBudgetEngine = /** @class */ (function () {
  function ExpenseBudgetEngine() {
    this.supabase = (0, client_1.createClient)();
  }
  // =====================================================================================
  // AUTOMATED EXPENSE CATEGORIZATION
  // =====================================================================================
  /**
   * Automatically categorize expenses using ML-based classification
   */
  ExpenseBudgetEngine.prototype.categorizeExpenses = function (clinicId, expenseIds) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, categorizationResult, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("auto_categorize_expenses", {
                p_clinic_id: clinicId,
                p_expense_ids: expenseIds || null,
              }),
            ];
          case 1:
            (_a = _b.sent()), (categorizationResult = _a.data), (error = _a.error);
            if (error) throw new Error("Expense categorization failed: ".concat(error.message));
            return [
              2 /*return*/,
              {
                categorized: categorizationResult.categorized_count,
                failed: categorizationResult.failed_count,
                suggestions: categorizationResult.suggestions || [],
              },
            ];
        }
      });
    });
  };
  /**
   * Get expense categories with current spending and budget status
   */
  ExpenseBudgetEngine.prototype.getExpenseCategories = function (clinicId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, categoryData, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("get_expense_categories_with_budget", {
                p_clinic_id: clinicId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            (_a = _b.sent()), (categoryData = _a.data), (error = _a.error);
            if (error)
              throw new Error("Failed to fetch expense categories: ".concat(error.message));
            return [
              2 /*return*/,
              categoryData.map(function (category) {
                return {
                  categoryId: category.category_id,
                  categoryName: category.category_name,
                  parentCategoryId: category.parent_category_id,
                  budgetAllocation: parseFloat(category.budget_allocation),
                  actualSpending: parseFloat(category.actual_spending),
                  variance: parseFloat(category.variance),
                  variancePercent: parseFloat(category.variance_percent),
                  alertThreshold: parseFloat(category.alert_threshold),
                  isOverBudget: category.is_over_budget,
                };
              }),
            ];
        }
      });
    });
  };
  // =====================================================================================
  // BUDGET VARIANCE REPORTING
  // =====================================================================================
  /**
   * Generate comprehensive budget variance report
   */
  ExpenseBudgetEngine.prototype.generateBudgetVarianceReport = function (clinicId_1, period_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, period, includeForecasting) {
      var dateRange,
        _a,
        categories,
        alerts,
        totalBudget,
        totalActual,
        totalVariance,
        variancePercent;
      if (includeForecasting === void 0) {
        includeForecasting = true;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            dateRange = this.parsePeriodToDates(period);
            return [
              4 /*yield*/,
              Promise.all([
                this.getExpenseCategories(clinicId, dateRange),
                this.getBudgetAlerts(clinicId, dateRange),
              ]),
            ];
          case 1:
            (_a = _b.sent()), (categories = _a[0]), (alerts = _a[1]);
            totalBudget = categories.reduce(function (sum, cat) {
              return sum + cat.budgetAllocation;
            }, 0);
            totalActual = categories.reduce(function (sum, cat) {
              return sum + cat.actualSpending;
            }, 0);
            totalVariance = totalActual - totalBudget;
            variancePercent = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;
            return [
              2 /*return*/,
              {
                period: period,
                categories: categories,
                totalBudget: totalBudget,
                totalActual: totalActual,
                totalVariance: totalVariance,
                variancePercent: variancePercent,
                alerts: alerts,
              },
            ];
        }
      });
    });
  };
  /**
   * Get budget alerts and threshold monitoring
   */
  ExpenseBudgetEngine.prototype.getBudgetAlerts = function (clinicId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, alertData, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("budget_alerts")
                .select("*")
                .eq("clinic_id", clinicId)
                .gte("created_at", dateRange.start.toISOString())
                .lte("created_at", dateRange.end.toISOString())
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (alertData = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to fetch budget alerts: ".concat(error.message));
            return [
              2 /*return*/,
              alertData.map(function (alert) {
                return {
                  alertId: alert.id,
                  categoryId: alert.category_id,
                  categoryName: alert.category_name,
                  alertType: alert.alert_type,
                  threshold: parseFloat(alert.threshold),
                  currentAmount: parseFloat(alert.current_amount),
                  message: alert.message,
                  createdAt: new Date(alert.created_at),
                  isResolved: alert.is_resolved,
                };
              }),
            ];
        }
      });
    });
  };
  /**
   * Create budget alert when thresholds are exceeded
   */
  ExpenseBudgetEngine.prototype.createBudgetAlert = function (
    clinicId,
    categoryId,
    alertType,
    currentAmount,
    threshold,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var alertMessage, _a, alertData, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            alertMessage = this.generateAlertMessage(alertType, currentAmount, threshold);
            return [
              4 /*yield*/,
              this.supabase
                .from("budget_alerts")
                .insert({
                  clinic_id: clinicId,
                  category_id: categoryId,
                  alert_type: alertType,
                  threshold: threshold,
                  current_amount: currentAmount,
                  message: alertMessage,
                  is_resolved: false,
                })
                .select("id")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (alertData = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create budget alert: ".concat(error.message));
            return [2 /*return*/, alertData.id];
        }
      });
    });
  };
  // =====================================================================================
  // EXPENSE TREND ANALYSIS & OPTIMIZATION
  // =====================================================================================
  /**
   * Analyze expense trends and identify cost optimization opportunities
   */
  ExpenseBudgetEngine.prototype.analyzeExpenseTrends = function (clinicId_1, dateRange_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, dateRange, granularity) {
      var _a, trendData, error;
      if (granularity === void 0) {
        granularity = "monthly";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("analyze_expense_trends", {
                p_clinic_id: clinicId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
                p_granularity: granularity,
              }),
            ];
          case 1:
            (_a = _b.sent()), (trendData = _a.data), (error = _a.error);
            if (error) throw new Error("Expense trend analysis failed: ".concat(error.message));
            return [
              2 /*return*/,
              trendData.map(function (trend) {
                return {
                  period: trend.period,
                  totalExpenses: parseFloat(trend.total_expenses),
                  growthRate: parseFloat(trend.growth_rate),
                  volatility: parseFloat(trend.volatility),
                  optimization_opportunities: trend.optimization_opportunities || [],
                  costSavingPotential: parseFloat(trend.cost_saving_potential || 0),
                };
              }),
            ];
        }
      });
    });
  };
  /**
   * Identify cost optimization insights and recommendations
   */
  ExpenseBudgetEngine.prototype.generateCostOptimizationInsights = function (clinicId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, insights, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("generate_cost_optimization_insights", {
                p_clinic_id: clinicId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            (_a = _b.sent()), (insights = _a.data), (error = _a.error);
            if (error) throw new Error("Cost optimization analysis failed: ".concat(error.message));
            return [
              2 /*return*/,
              insights.map(function (insight) {
                return {
                  category: insight.category,
                  currentSpending: parseFloat(insight.current_spending),
                  benchmarkSpending: parseFloat(insight.benchmark_spending),
                  savingsPotential: parseFloat(insight.savings_potential),
                  recommendations: insight.recommendations || [],
                  priority: insight.priority,
                  implementationEffort: insight.implementation_effort,
                };
              }),
            ];
        }
      });
    });
  };
  // =====================================================================================
  // VENDOR & SUPPLIER EXPENSE TRACKING
  // =====================================================================================
  /**
   * Analyze vendor and supplier expenses with performance metrics
   */
  ExpenseBudgetEngine.prototype.analyzeVendorExpenses = function (clinicId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, vendorData, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("analyze_vendor_expenses", {
                p_clinic_id: clinicId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            (_a = _b.sent()), (vendorData = _a.data), (error = _a.error);
            if (error) throw new Error("Vendor expense analysis failed: ".concat(error.message));
            return [
              2 /*return*/,
              vendorData.map(function (vendor) {
                return {
                  vendorId: vendor.vendor_id,
                  vendorName: vendor.vendor_name,
                  category: vendor.category,
                  totalSpent: parseFloat(vendor.total_spent),
                  transactionCount: parseInt(vendor.transaction_count),
                  averageAmount: parseFloat(vendor.average_amount),
                  paymentTerms: vendor.payment_terms,
                  lastPayment: new Date(vendor.last_payment),
                  outstandingAmount: parseFloat(vendor.outstanding_amount),
                  performanceScore: parseFloat(vendor.performance_score),
                };
              }),
            ];
        }
      });
    });
  };
  // =====================================================================================
  // COST CENTER ALLOCATION & DEPARTMENTAL REPORTING
  // =====================================================================================
  /**
   * Allocate costs to departments and cost centers
   */
  ExpenseBudgetEngine.prototype.allocateCostsByCenter = function (clinicId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, allocationData, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("allocate_costs_by_center", {
                p_clinic_id: clinicId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            (_a = _b.sent()), (allocationData = _a.data), (error = _a.error);
            if (error) throw new Error("Cost center allocation failed: ".concat(error.message));
            return [
              2 /*return*/,
              allocationData.map(function (center) {
                return {
                  costCenterId: center.cost_center_id,
                  costCenterName: center.cost_center_name,
                  department: center.department,
                  allocatedBudget: parseFloat(center.allocated_budget),
                  actualExpenses: parseFloat(center.actual_expenses),
                  utilizationRate: parseFloat(center.utilization_rate),
                  efficiency: parseFloat(center.efficiency),
                  profitContribution: parseFloat(center.profit_contribution),
                };
              }),
            ];
        }
      });
    });
  };
  // =====================================================================================
  // EXPENSE FORECASTING & BUDGET PLANNING
  // =====================================================================================
  /**
   * Generate expense forecasting for budget planning
   */
  ExpenseBudgetEngine.prototype.generateExpenseForecast = function (clinicId_1, categoryIds_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, categoryIds, forecastPeriods) {
      var _a, forecastData, error;
      if (forecastPeriods === void 0) {
        forecastPeriods = 12;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("generate_expense_forecast", {
                p_clinic_id: clinicId,
                p_category_ids: categoryIds,
                p_forecast_periods: forecastPeriods,
              }),
            ];
          case 1:
            (_a = _b.sent()), (forecastData = _a.data), (error = _a.error);
            if (error) throw new Error("Expense forecasting failed: ".concat(error.message));
            return [
              2 /*return*/,
              forecastData.map(function (forecast) {
                return {
                  period: forecast.period,
                  forecastedAmount: parseFloat(forecast.forecasted_amount),
                  confidenceInterval: {
                    lower: parseFloat(forecast.confidence_lower),
                    upper: parseFloat(forecast.confidence_upper),
                  },
                  trend: forecast.trend,
                  seasonalFactor: parseFloat(forecast.seasonal_factor),
                  riskFactors: forecast.risk_factors || [],
                };
              }),
            ];
        }
      });
    });
  };
  /**
   * Create budget plan based on historical data and forecasting
   */
  ExpenseBudgetEngine.prototype.createBudgetPlan = function (clinicId_1, planYear_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, planYear, baselineType) {
      var _a, budgetPlan, error;
      if (baselineType === void 0) {
        baselineType = "growth_adjusted";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("create_budget_plan", {
                p_clinic_id: clinicId,
                p_plan_year: planYear,
                p_baseline_type: baselineType,
              }),
            ];
          case 1:
            (_a = _b.sent()), (budgetPlan = _a.data), (error = _a.error);
            if (error) throw new Error("Budget plan creation failed: ".concat(error.message));
            return [2 /*return*/, budgetPlan];
        }
      });
    });
  };
  // =====================================================================================
  // UTILITY METHODS
  // =====================================================================================
  /**
   * Parse period string to date range
   */
  ExpenseBudgetEngine.prototype.parsePeriodToDates = function (period) {
    var now = new Date();
    switch (period) {
      case "current_month":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      case "current_quarter":
        var quarterStart = Math.floor(now.getMonth() / 3) * 3;
        return {
          start: new Date(now.getFullYear(), quarterStart, 1),
          end: new Date(now.getFullYear(), quarterStart + 3, 0),
        };
      case "current_year":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31),
        };
      default:
        // Default to current month
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
    }
  };
  /**
   * Generate alert message based on alert type and amounts
   */
  ExpenseBudgetEngine.prototype.generateAlertMessage = function (
    alertType,
    currentAmount,
    threshold,
  ) {
    var percentage = ((currentAmount / threshold) * 100).toFixed(1);
    switch (alertType) {
      case "warning":
        return "Budget utilization at ".concat(percentage, "% of allocated threshold");
      case "critical":
        return "CRITICAL: Budget utilization at ".concat(
          percentage,
          "% - immediate attention required",
        );
      case "exceeded":
        return "EXCEEDED: Budget overrun by "
          .concat((currentAmount - threshold).toFixed(2), " (")
          .concat(percentage, "% of threshold)");
      default:
        return "Budget alert: Current spending "
          .concat(currentAmount, " vs threshold ")
          .concat(threshold);
    }
  };
  return ExpenseBudgetEngine;
})();
exports.ExpenseBudgetEngine = ExpenseBudgetEngine;
