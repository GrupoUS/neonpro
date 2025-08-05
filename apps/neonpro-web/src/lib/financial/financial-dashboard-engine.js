"use strict";
/**
 * Financial Dashboard Engine - Real-time Analytics Hub
 * Story 4.2: Financial Analytics & Business Intelligence
 * Phase 1: Real-time Cash Flow Dashboard
 *
 * This module orchestrates all financial analytics components:
 * - Real-time financial metrics aggregation
 * - Dashboard data preparation and caching
 * - Performance optimization for live updates
 * - Multi-dimensional financial analysis
 * - Integration with all financial engines
 * - Real-time notifications and alerts
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
exports.FinancialDashboardEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var cash_flow_engine_1 = require("./cash-flow-engine");
var automated_alerts_engine_1 = require("./automated-alerts-engine");
var predictive_analytics_engine_1 = require("./predictive-analytics-engine");
var FinancialDashboardEngine = /** @class */ (function () {
  function FinancialDashboardEngine() {
    this.supabase = (0, client_1.createClient)();
    this.cashFlowEngine = new cash_flow_engine_1.CashFlowEngine();
    this.alertsEngine = new automated_alerts_engine_1.AutomatedAlertsEngine();
    this.predictiveEngine = new predictive_analytics_engine_1.createpredictiveAnalyticsEngine();
    this.cache = new Map();
  }
  /**
   * Get comprehensive dashboard data for a clinic
   */
  FinancialDashboardEngine.prototype.getDashboardData = function (clinicId, config) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        _a,
        cashFlow,
        metrics,
        alerts,
        forecasts,
        riskAssessment,
        performanceIndicators,
        trends,
        comparisons,
        recommendations,
        dashboardData,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            cacheKey = "dashboard_".concat(clinicId);
            cached = this.getFromCache(cacheKey);
            if (cached) {
              return [2 /*return*/, cached];
            }
            return [
              4 /*yield*/,
              Promise.all([
                this.cashFlowEngine.getCashFlowSummary(clinicId),
                this.calculateFinancialMetrics(clinicId),
                this.alertsEngine.processFinancialAlerts(clinicId),
                this.generateDashboardForecasts(clinicId),
                this.predictiveEngine.performRiskAssessment(clinicId),
              ]),
              // Calculate performance indicators
            ];
          case 1:
            (_a = _b.sent()),
              (cashFlow = _a[0]),
              (metrics = _a[1]),
              (alerts = _a[2]),
              (forecasts = _a[3]),
              (riskAssessment = _a[4]);
            return [
              4 /*yield*/,
              this.calculatePerformanceIndicators(clinicId, metrics),
              // Analyze trends
            ];
          case 2:
            performanceIndicators = _b.sent();
            return [
              4 /*yield*/,
              this.analyzeTrends(clinicId),
              // Generate comparisons
            ];
          case 3:
            trends = _b.sent();
            return [
              4 /*yield*/,
              this.generateComparisons(clinicId, metrics),
              // Generate recommendations
            ];
          case 4:
            comparisons = _b.sent();
            return [
              4 /*yield*/,
              this.generateRecommendations(clinicId, {
                metrics: metrics,
                alerts: alerts,
                riskAssessment: riskAssessment,
                trends: trends,
              }),
            ];
          case 5:
            recommendations = _b.sent();
            dashboardData = {
              clinic_id: clinicId,
              timestamp: new Date().toISOString(),
              cash_flow: cashFlow,
              metrics: metrics,
              alerts: alerts.filter(function (alert) {
                return !alert.acknowledged_at;
              }), // Only unacknowledged alerts
              forecasts: forecasts,
              risk_assessment: riskAssessment,
              performance_indicators: performanceIndicators,
              trends: trends,
              comparisons: comparisons,
              recommendations: recommendations,
            };
            // Cache the result
            this.setCache(
              cacheKey,
              dashboardData,
              (config === null || config === void 0 ? void 0 : config.cache_duration) || 300,
            ); // 5 minutes default
            return [2 /*return*/, dashboardData];
          case 6:
            error_1 = _b.sent();
            console.error("Error getting dashboard data:", error_1);
            throw new Error("Failed to get dashboard data");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate comprehensive financial metrics
   */
  FinancialDashboardEngine.prototype.calculateFinancialMetrics = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var cashFlowMetrics,
        revenueData,
        expenseData,
        profitabilityMetrics,
        efficiencyMetrics,
        activityMetrics,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              this.cashFlowEngine.getCashFlowMetrics(clinicId),
              // Get revenue data
            ];
          case 1:
            cashFlowMetrics = _a.sent();
            return [
              4 /*yield*/,
              this.getRevenueMetrics(clinicId),
              // Get expense data
            ];
          case 2:
            revenueData = _a.sent();
            return [
              4 /*yield*/,
              this.getExpenseMetrics(clinicId),
              // Calculate profitability metrics
            ];
          case 3:
            expenseData = _a.sent();
            profitabilityMetrics = this.calculateProfitabilityMetrics(revenueData, expenseData);
            return [
              4 /*yield*/,
              this.calculateEfficiencyMetrics(clinicId, revenueData),
              // Calculate activity metrics
            ];
          case 4:
            efficiencyMetrics = _a.sent();
            return [4 /*yield*/, this.calculateActivityMetrics(clinicId)];
          case 5:
            activityMetrics = _a.sent();
            return [
              2 /*return*/,
              {
                // Revenue Metrics
                total_revenue: revenueData.total_revenue,
                revenue_growth: revenueData.growth_rates,
                revenue_per_patient: revenueData.revenue_per_patient,
                revenue_by_service: revenueData.by_service,
                // Expense Metrics
                total_expenses: expenseData.total_expenses,
                expense_growth: expenseData.growth_rates,
                expense_by_category: expenseData.by_category,
                expense_ratio: expenseData.total_expenses / revenueData.total_revenue,
                // Profitability Metrics
                gross_profit: profitabilityMetrics.gross_profit,
                gross_margin: profitabilityMetrics.gross_margin,
                net_profit: profitabilityMetrics.net_profit,
                net_margin: profitabilityMetrics.net_margin,
                ebitda: profitabilityMetrics.ebitda,
                ebitda_margin: profitabilityMetrics.ebitda_margin,
                // Efficiency Metrics
                revenue_per_employee: efficiencyMetrics.revenue_per_employee,
                patient_acquisition_cost: efficiencyMetrics.patient_acquisition_cost,
                patient_lifetime_value: efficiencyMetrics.patient_lifetime_value,
                collection_efficiency: efficiencyMetrics.collection_efficiency,
                // Liquidity Metrics
                current_ratio: cashFlowMetrics.current_ratio,
                quick_ratio: cashFlowMetrics.quick_ratio,
                cash_ratio: 0, // TODO: Calculate from balance sheet
                working_capital: cashFlowMetrics.working_capital,
                // Activity Metrics
                receivables_turnover: activityMetrics.receivables_turnover,
                inventory_turnover: activityMetrics.inventory_turnover,
                asset_turnover: activityMetrics.asset_turnover,
                days_sales_outstanding: activityMetrics.days_sales_outstanding,
              },
            ];
          case 6:
            error_2 = _a.sent();
            console.error("Error calculating financial metrics:", error_2);
            throw new Error("Failed to calculate financial metrics");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate dashboard-specific forecasts
   */
  FinancialDashboardEngine.prototype.generateDashboardForecasts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var forecasts,
        revenueForecast,
        cashFlowForecast,
        currentRevenue,
        currentCashFlow,
        revenue30d,
        cashFlow30d,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            forecasts = [];
            return [
              4 /*yield*/,
              this.predictiveEngine.generateFinancialForecast(
                clinicId,
                "revenue_forecast",
                3, // 3 months
              ),
              // Generate cash flow forecast
            ];
          case 1:
            revenueForecast = _a.sent();
            return [
              4 /*yield*/,
              this.predictiveEngine.generateFinancialForecast(
                clinicId,
                "cash_flow_prediction",
                3, // 3 months
              ),
              // Convert to dashboard format
            ];
          case 2:
            cashFlowForecast = _a.sent();
            return [4 /*yield*/, this.getCurrentRevenue(clinicId)];
          case 3:
            currentRevenue = _a.sent();
            return [
              4 /*yield*/,
              this.getCurrentCashFlow(clinicId),
              // 30-day revenue forecast
            ];
          case 4:
            currentCashFlow = _a.sent();
            revenue30d = revenueForecast.predictions.slice(0, 30).reduce(function (sum, p) {
              return sum + p.predicted_value;
            }, 0);
            forecasts.push({
              type: "revenue",
              period: "30d",
              current_value: currentRevenue,
              predicted_value: revenue30d,
              confidence: revenueForecast.accuracy_estimate,
              trend:
                revenue30d > currentRevenue
                  ? "up"
                  : revenue30d < currentRevenue
                    ? "down"
                    : "stable",
              change_percentage: ((revenue30d - currentRevenue) / currentRevenue) * 100,
            });
            cashFlow30d = cashFlowForecast.predictions.slice(0, 30).reduce(function (sum, p) {
              return sum + p.predicted_value;
            }, 0);
            forecasts.push({
              type: "cash_flow",
              period: "30d",
              current_value: currentCashFlow,
              predicted_value: cashFlow30d,
              confidence: cashFlowForecast.accuracy_estimate,
              trend:
                cashFlow30d > currentCashFlow
                  ? "up"
                  : cashFlow30d < currentCashFlow
                    ? "down"
                    : "stable",
              change_percentage: ((cashFlow30d - currentCashFlow) / currentCashFlow) * 100,
            });
            return [2 /*return*/, forecasts];
          case 5:
            error_3 = _a.sent();
            console.error("Error generating dashboard forecasts:", error_3);
            return [2 /*return*/, []];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate performance indicators and scores
   */
  FinancialDashboardEngine.prototype.calculatePerformanceIndicators = function (clinicId, metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var financialHealthScore,
        growthScore,
        efficiencyScore,
        riskScore,
        overallScore,
        benchmarks,
        analysis,
        error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            financialHealthScore = this.calculateFinancialHealthScore(metrics);
            growthScore = this.calculateGrowthScore(metrics);
            efficiencyScore = this.calculateEfficiencyScore(metrics);
            return [
              4 /*yield*/,
              this.calculateRiskScore(clinicId),
              // Calculate overall score (weighted average)
            ];
          case 1:
            riskScore = _a.sent();
            overallScore =
              financialHealthScore * 0.3 +
              growthScore * 0.25 +
              efficiencyScore * 0.25 +
              (100 - riskScore) * 0.2; // Lower risk = higher score
            return [
              4 /*yield*/,
              this.getIndustryBenchmarks(clinicId),
              // Identify strengths and improvement areas
            ];
          case 2:
            benchmarks = _a.sent();
            analysis = this.analyzePerformance(
              {
                financialHealthScore: financialHealthScore,
                growthScore: growthScore,
                efficiencyScore: efficiencyScore,
                riskScore: riskScore,
              },
              metrics,
            );
            return [
              2 /*return*/,
              {
                financial_health_score: financialHealthScore,
                growth_score: growthScore,
                efficiency_score: efficiencyScore,
                risk_score: riskScore,
                overall_score: overallScore,
                benchmarks: benchmarks,
                key_strengths: analysis.strengths,
                improvement_areas: analysis.improvements,
              },
            ];
          case 3:
            error_4 = _a.sent();
            console.error("Error calculating performance indicators:", error_4);
            throw new Error("Failed to calculate performance indicators");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Analyze trends across different financial metrics
   */
  FinancialDashboardEngine.prototype.analyzeTrends = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var historicalData,
        revenueTrend,
        expenseTrend,
        profitTrend,
        cashFlowTrend,
        patientVolumeTrend,
        error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("cash_flow_daily")
                .select("*")
                .eq("clinic_id", clinicId)
                .gte(
                  "date",
                  new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                )
                .order("date", { ascending: true }),
            ];
          case 1:
            historicalData = _a.sent().data;
            if (!historicalData || historicalData.length < 30) {
              throw new Error("Insufficient data for trend analysis");
            }
            revenueTrend = this.analyzeTrendComponent(historicalData, "total_inflows");
            expenseTrend = this.analyzeTrendComponent(historicalData, "total_outflows");
            profitTrend = this.analyzeTrendComponent(historicalData, "net_cash_flow");
            cashFlowTrend = this.analyzeTrendComponent(historicalData, "closing_balance");
            return [4 /*yield*/, this.analyzePatientVolumeTrend(clinicId)];
          case 2:
            patientVolumeTrend = _a.sent();
            return [
              2 /*return*/,
              {
                revenue_trend: revenueTrend,
                expense_trend: expenseTrend,
                profit_trend: profitTrend,
                cash_flow_trend: cashFlowTrend,
                patient_volume_trend: patientVolumeTrend,
              },
            ];
          case 3:
            error_5 = _a.sent();
            console.error("Error analyzing trends:", error_5);
            throw new Error("Failed to analyze trends");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate comprehensive recommendations
   */
  FinancialDashboardEngine.prototype.generateRecommendations = function (clinicId, analysisData) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations, _i, _a, riskFactor;
      return __generator(this, function (_b) {
        recommendations = [];
        try {
          // Revenue optimization recommendations
          if (analysisData.metrics.revenue_growth.monthly < 0.05) {
            recommendations.push({
              id: "rev_opt_".concat(Date.now()),
              category: "revenue",
              priority: "high",
              title: "Optimize Revenue Growth",
              description:
                "Monthly revenue growth is below target. Consider implementing revenue optimization strategies.",
              expected_impact: {
                financial_impact: analysisData.metrics.total_revenue * 0.15,
                timeframe: "3 months",
                confidence: 0.8,
              },
              action_steps: [
                "Analyze service pricing strategy",
                "Implement upselling programs",
                "Review patient retention strategies",
                "Explore new service offerings",
              ],
              resources_needed: ["Marketing budget", "Staff training", "System updates"],
              success_metrics: ["Monthly revenue growth > 5%", "Patient retention rate > 85%"],
              deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            });
          }
          // Cash flow recommendations
          if (analysisData.trends.cash_flow_trend.direction === "down") {
            recommendations.push({
              id: "cash_flow_".concat(Date.now()),
              category: "cash_flow",
              priority: "critical",
              title: "Improve Cash Flow Management",
              description:
                "Cash flow trend is declining. Immediate action required to stabilize financial position.",
              expected_impact: {
                financial_impact: analysisData.metrics.working_capital * 0.2,
                timeframe: "1 month",
                confidence: 0.9,
              },
              action_steps: [
                "Accelerate receivables collection",
                "Negotiate extended payment terms with suppliers",
                "Review and optimize expense timing",
                "Consider short-term financing options",
              ],
              resources_needed: ["Collection team", "Supplier negotiations", "Financial advisor"],
              success_metrics: ["Positive cash flow within 30 days", "DSO < 30 days"],
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            });
          }
          // Efficiency recommendations
          if (analysisData.metrics.collection_efficiency < 0.9) {
            recommendations.push({
              id: "efficiency_".concat(Date.now()),
              category: "efficiency",
              priority: "medium",
              title: "Improve Collection Efficiency",
              description:
                "Collection efficiency is below optimal levels. Implement better collection processes.",
              expected_impact: {
                financial_impact: analysisData.metrics.total_revenue * 0.1,
                timeframe: "2 months",
                confidence: 0.85,
              },
              action_steps: [
                "Implement automated payment reminders",
                "Offer multiple payment options",
                "Train staff on collection best practices",
                "Review and update payment policies",
              ],
              resources_needed: ["Payment system upgrades", "Staff training", "Policy updates"],
              success_metrics: ["Collection efficiency > 95%", "Reduced payment delays"],
              deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            });
          }
          // Risk-based recommendations
          for (_i = 0, _a = analysisData.riskAssessment.risk_factors; _i < _a.length; _i++) {
            riskFactor = _a[_i];
            if (riskFactor.risk_level === "high" || riskFactor.risk_level === "critical") {
              recommendations.push({
                id: "risk_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
                category: "risk",
                priority: riskFactor.risk_level === "critical" ? "critical" : "high",
                title: "Mitigate ".concat(riskFactor.factor),
                description: riskFactor.description,
                expected_impact: {
                  financial_impact: riskFactor.impact_score * 1000, // Simplified calculation
                  timeframe: "1-3 months",
                  confidence: 0.7,
                },
                action_steps: riskFactor.mitigation_strategies,
                resources_needed: ["Risk management team", "Monitoring systems"],
                success_metrics: ["Reduce ".concat(riskFactor.factor, " risk score by 50%")],
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
              });
            }
          }
          return [2 /*return*/, recommendations.slice(0, 10)]; // Limit to top 10 recommendations
        } catch (error) {
          console.error("Error generating recommendations:", error);
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Cache management methods
   */
  FinancialDashboardEngine.prototype.getFromCache = function (key) {
    var cached = this.cache.get(key);
    if (cached && Date.now() < cached.timestamp + cached.ttl * 1000) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  };
  FinancialDashboardEngine.prototype.setCache = function (key, data, ttlSeconds) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    });
  };
  /**
   * Helper methods for calculations (simplified implementations)
   */
  FinancialDashboardEngine.prototype.getRevenueMetrics = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified implementation
        return [
          2 /*return*/,
          {
            total_revenue: 100000,
            growth_rates: { daily: 0.02, weekly: 0.05, monthly: 0.1, yearly: 0.15 },
            revenue_per_patient: 500,
            by_service: [],
          },
        ];
      });
    });
  };
  FinancialDashboardEngine.prototype.getExpenseMetrics = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified implementation
        return [
          2 /*return*/,
          {
            total_expenses: 80000,
            growth_rates: { daily: 0.01, weekly: 0.03, monthly: 0.08, yearly: 0.12 },
            by_category: [],
          },
        ];
      });
    });
  };
  FinancialDashboardEngine.prototype.calculateProfitabilityMetrics = function (
    revenueData,
    expenseData,
  ) {
    var grossProfit = revenueData.total_revenue - expenseData.total_expenses;
    return {
      gross_profit: grossProfit,
      gross_margin: grossProfit / revenueData.total_revenue,
      net_profit: grossProfit * 0.8, // Simplified
      net_margin: (grossProfit * 0.8) / revenueData.total_revenue,
      ebitda: grossProfit * 0.9, // Simplified
      ebitda_margin: (grossProfit * 0.9) / revenueData.total_revenue,
    };
  };
  FinancialDashboardEngine.prototype.calculateEfficiencyMetrics = function (clinicId, revenueData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified implementation
        return [
          2 /*return*/,
          {
            revenue_per_employee: 50000,
            patient_acquisition_cost: 100,
            patient_lifetime_value: 2000,
            collection_efficiency: 0.95,
          },
        ];
      });
    });
  };
  FinancialDashboardEngine.prototype.calculateActivityMetrics = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified implementation
        return [
          2 /*return*/,
          {
            receivables_turnover: 12,
            inventory_turnover: 6,
            asset_turnover: 2,
            days_sales_outstanding: 30,
          },
        ];
      });
    });
  };
  FinancialDashboardEngine.prototype.calculateFinancialHealthScore = function (metrics) {
    // Simplified scoring algorithm
    var score = 50; // Base score
    // Positive factors
    if (metrics.current_ratio > 1.5) score += 15;
    if (metrics.net_margin > 0.1) score += 15;
    if (metrics.revenue_growth.monthly > 0.05) score += 10;
    if (metrics.collection_efficiency > 0.9) score += 10;
    return Math.min(100, Math.max(0, score));
  };
  FinancialDashboardEngine.prototype.calculateGrowthScore = function (metrics) {
    // Simplified growth scoring
    var score = 50;
    if (metrics.revenue_growth.monthly > 0.1) score += 25;
    if (metrics.revenue_growth.yearly > 0.15) score += 25;
    return Math.min(100, Math.max(0, score));
  };
  FinancialDashboardEngine.prototype.calculateEfficiencyScore = function (metrics) {
    // Simplified efficiency scoring
    var score = 50;
    if (metrics.collection_efficiency > 0.95) score += 20;
    if (metrics.expense_ratio < 0.8) score += 15;
    if (metrics.days_sales_outstanding < 30) score += 15;
    return Math.min(100, Math.max(0, score));
  };
  FinancialDashboardEngine.prototype.calculateRiskScore = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var riskAssessment, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.predictiveEngine.performRiskAssessment(clinicId)];
          case 1:
            riskAssessment = _b.sent();
            return [2 /*return*/, riskAssessment.overall_risk_score];
          case 2:
            _a = _b.sent();
            return [2 /*return*/, 50]; // Default moderate risk
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  FinancialDashboardEngine.prototype.getIndustryBenchmarks = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified benchmarks
        return [
          2 /*return*/,
          {
            industry_average: 75,
            top_quartile: 85,
            clinic_ranking: 65,
          },
        ];
      });
    });
  };
  FinancialDashboardEngine.prototype.analyzePerformance = function (scores, metrics) {
    var strengths = [];
    var improvements = [];
    if (scores.financialHealthScore > 80) strengths.push("Strong financial health");
    else if (scores.financialHealthScore < 60) improvements.push("Improve financial stability");
    if (scores.growthScore > 80) strengths.push("Excellent growth trajectory");
    else if (scores.growthScore < 60) improvements.push("Focus on growth strategies");
    return { strengths: strengths, improvements: improvements };
  };
  FinancialDashboardEngine.prototype.analyzeTrendComponent = function (data, field) {
    // Simplified trend analysis
    var values = data.map(function (d) {
      return d[field] || 0;
    });
    var recent = values.slice(-7);
    var older = values.slice(-14, -7);
    var recentAvg =
      recent.reduce(function (sum, val) {
        return sum + val;
      }, 0) / recent.length;
    var olderAvg =
      older.reduce(function (sum, val) {
        return sum + val;
      }, 0) / older.length;
    var direction = recentAvg > olderAvg ? "up" : recentAvg < olderAvg ? "down" : "stable";
    var strength = Math.abs(recentAvg - olderAvg) / olderAvg;
    return {
      direction: direction,
      strength: Math.min(1, strength),
      duration_days: 7,
      projected_continuation: 0.7,
      seasonal_factor: 0.1,
      anomalies: [],
    };
  };
  FinancialDashboardEngine.prototype.analyzePatientVolumeTrend = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified patient volume trend
        return [
          2 /*return*/,
          {
            direction: "up",
            strength: 0.3,
            duration_days: 14,
            projected_continuation: 0.8,
            seasonal_factor: 0.15,
            anomalies: [],
          },
        ];
      });
    });
  };
  FinancialDashboardEngine.prototype.generateComparisons = function (clinicId, metrics) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified comparison data
        return [
          2 /*return*/,
          {
            previous_period: {
              revenue_change: 0.05,
              expense_change: 0.03,
              profit_change: 0.08,
              cash_flow_change: 0.02,
              patient_volume_change: 0.04,
              key_drivers: ["Increased patient volume", "New service offerings"],
            },
            same_period_last_year: {
              revenue_change: 0.15,
              expense_change: 0.12,
              profit_change: 0.18,
              cash_flow_change: 0.1,
              patient_volume_change: 0.12,
              key_drivers: ["Market expansion", "Improved efficiency"],
            },
            budget_comparison: {
              revenue_vs_budget: 0.02,
              expense_vs_budget: -0.01,
              profit_vs_budget: 0.05,
              variance_analysis: [],
            },
            industry_benchmarks: {
              revenue_per_patient: {
                clinic_value: 500,
                industry_average: 450,
                percentile_ranking: 75,
              },
              profit_margin: {
                clinic_value: 0.2,
                industry_average: 0.18,
                percentile_ranking: 70,
              },
              collection_rate: {
                clinic_value: 0.95,
                industry_average: 0.92,
                percentile_ranking: 80,
              },
            },
          },
        ];
      });
    });
  };
  FinancialDashboardEngine.prototype.getCurrentRevenue = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var startOfMonth, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startOfMonth = new Date();
            startOfMonth.setDate(1);
            return [
              4 /*yield*/,
              this.supabase
                .from("cash_flow_daily")
                .select("total_inflows")
                .eq("clinic_id", clinicId)
                .gte("date", startOfMonth.toISOString().split("T")[0]),
            ];
          case 1:
            data = _a.sent().data;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.reduce(function (sum, d) {
                    return sum + d.total_inflows;
                  }, 0)) || 0,
            ];
        }
      });
    });
  };
  FinancialDashboardEngine.prototype.getCurrentCashFlow = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var cashFlowSummary;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.cashFlowEngine.getCashFlowSummary(clinicId)];
          case 1:
            cashFlowSummary = _a.sent();
            return [2 /*return*/, cashFlowSummary.current_balance];
        }
      });
    });
  };
  return FinancialDashboardEngine;
})();
exports.FinancialDashboardEngine = FinancialDashboardEngine;
exports.default = FinancialDashboardEngine;
