/**
 * Advanced Cohort Analysis Engine for NeonPro
 *
 * This module provides comprehensive cohort analysis capabilities including:
 * - User cohort definition and segmentation
 * - Retention rate calculations
 * - Revenue cohort analysis
 * - Churn prediction within cohorts
 * - Statistical significance testing
 *
 * Based on Google Analytics cohort analysis patterns with
 * enhancements for SaaS subscription metrics.
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
exports.cohortUtils = exports.CohortAnalyzer = void 0;
exports.createCohortAnalyzer = createCohortAnalyzer;
var server_1 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Validation schemas
var cohortConfigSchema = zod_1.z.object({
  cohortType: zod_1.z.enum(["subscription", "trial", "revenue", "custom"]),
  granularity: zod_1.z.enum(["daily", "weekly", "monthly"]),
  periods: zod_1.z.number().min(1).max(24),
  startDate: zod_1.z.string(),
  endDate: zod_1.z.string(),
  includeRevenue: zod_1.z.boolean().default(true),
  includeChurn: zod_1.z.boolean().default(true),
});
var CohortAnalyzer = /** @class */ (() => {
  function CohortAnalyzer() {
    this.supabase = (0, server_1.createClient)();
  }
  /**
   * Generate cohort definitions based on subscription start dates
   * Similar to Google Analytics cohort specification
   */
  CohortAnalyzer.prototype.generateCohorts = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var validConfig,
        dimension,
        tableName,
        cohortRanges,
        cohorts,
        _i,
        cohortRanges_1,
        range,
        userCount;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            validConfig = cohortConfigSchema.parse(config);
            dimension = "subscription_start";
            tableName = "subscription_metrics";
            if (validConfig.cohortType === "trial") {
              dimension = "trial_start";
              tableName = "trial_analytics";
            }
            cohortRanges = this.generateCohortRanges(
              validConfig.startDate,
              validConfig.endDate,
              validConfig.granularity,
            );
            cohorts = [];
            (_i = 0), (cohortRanges_1 = cohortRanges);
            _a.label = 1;
          case 1:
            if (!(_i < cohortRanges_1.length)) return [3 /*break*/, 4];
            range = cohortRanges_1[_i];
            return [
              4 /*yield*/,
              this.supabase.rpc("get_cohort_user_count", {
                p_start_date: range.start,
                p_end_date: range.end,
                p_dimension: dimension,
              }),
            ];
          case 2:
            userCount = _a.sent().data;
            if (userCount && userCount > 0) {
              cohorts.push({
                id: "cohort_".concat(range.start.replace(/-/g, "")),
                name: "Cohort ".concat(this.formatCohortName(range.start, validConfig.granularity)),
                startDate: range.start,
                endDate: range.end,
                userCount: userCount,
                dimension: dimension,
              });
            }
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, cohorts];
        }
      });
    });
  };
  /**
   * Calculate retention metrics for cohorts over time periods
   * Based on Google Analytics cohortRetentionFraction pattern
   */
  CohortAnalyzer.prototype.calculateCohortRetention = function (cohorts, config) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics,
        _i,
        cohorts_1,
        cohort,
        period,
        periodDate,
        periodMetrics,
        retentionRate,
        churnRate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            metrics = [];
            (_i = 0), (cohorts_1 = cohorts);
            _a.label = 1;
          case 1:
            if (!(_i < cohorts_1.length)) return [3 /*break*/, 6];
            cohort = cohorts_1[_i];
            period = 0;
            _a.label = 2;
          case 2:
            if (!(period <= config.periods)) return [3 /*break*/, 5];
            periodDate = this.calculatePeriodDate(cohort.startDate, period, config.granularity);
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_cohort_period_metrics", {
                p_cohort_start: cohort.startDate,
                p_cohort_end: cohort.endDate,
                p_period_date: periodDate,
                p_dimension: cohort.dimension,
                p_include_revenue: config.includeRevenue,
              }),
            ];
          case 3:
            periodMetrics = _a.sent().data;
            if (periodMetrics) {
              retentionRate =
                cohort.userCount > 0 ? (periodMetrics.active_users / cohort.userCount) * 100 : 0;
              churnRate =
                cohort.userCount > 0 ? (periodMetrics.churned_users / cohort.userCount) * 100 : 0;
              metrics.push({
                cohortId: cohort.id,
                period: period,
                activeUsers: periodMetrics.active_users || 0,
                totalUsers: cohort.userCount,
                retentionRate: Math.round(retentionRate * 100) / 100,
                revenue: periodMetrics.revenue || 0,
                averageRevenuePerUser:
                  periodMetrics.active_users > 0
                    ? Math.round((periodMetrics.revenue / periodMetrics.active_users) * 100) / 100
                    : 0,
                churnedUsers: periodMetrics.churned_users || 0,
                churnRate: Math.round(churnRate * 100) / 100,
              });
            }
            _a.label = 4;
          case 4:
            period++;
            return [3 /*break*/, 2];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, metrics];
        }
      });
    });
  };
  /**
   * Generate revenue cohort analysis
   * Analyzes lifetime value progression for customer cohorts
   */
  CohortAnalyzer.prototype.calculateRevenueCohorts = function (cohorts, config) {
    return __awaiter(this, void 0, void 0, function () {
      var revenueCohorts, _i, cohorts_2, cohort, revenueData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            revenueCohorts = [];
            (_i = 0), (cohorts_2 = cohorts);
            _a.label = 1;
          case 1:
            if (!(_i < cohorts_2.length)) return [3 /*break*/, 4];
            cohort = cohorts_2[_i];
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_cohort_revenue_progression", {
                p_cohort_start: cohort.startDate,
                p_cohort_end: cohort.endDate,
                p_periods: config.periods,
                p_granularity: config.granularity,
              }),
            ];
          case 2:
            revenueData = _a.sent().data;
            if (revenueData) {
              revenueCohorts.push({
                cohortId: cohort.id,
                cohortName: cohort.name,
                userCount: cohort.userCount,
                revenueProgression: revenueData,
                cumulativeRevenue: this.calculateCumulativeRevenue(revenueData),
                lifetimeValue: this.calculateLifetimeValue(revenueData, cohort.userCount),
              });
            }
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, revenueCohorts];
        }
      });
    });
  };
  /**
   * Statistical analysis of cohort performance
   * Includes significance testing and trend analysis
   */
  CohortAnalyzer.prototype.analyzeCohortStatistics = function (metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var periodGroups, statistics;
      return __generator(this, function (_a) {
        periodGroups = this.groupMetricsByPeriod(metrics);
        statistics = {
          retentionTrends: this.calculateRetentionTrends(periodGroups),
          cohortComparison: this.compareCohortPerformance(metrics),
          seasonalityAnalysis: this.analyzeSeasonality(metrics),
          significanceTests: this.performSignificanceTests(periodGroups),
          predictiveInsights: this.generatePredictiveInsights(metrics),
        };
        return [2 /*return*/, statistics];
      });
    });
  };
  // Private helper methods
  CohortAnalyzer.prototype.generateCohortRanges = (startDate, endDate, granularity) => {
    var ranges = [];
    var start = new Date(startDate);
    var end = new Date(endDate);
    var current = new Date(start);
    while (current <= end) {
      var rangeEnd = new Date(current);
      if (granularity === "daily") {
        rangeEnd.setDate(rangeEnd.getDate() + 1);
      } else if (granularity === "weekly") {
        rangeEnd.setDate(rangeEnd.getDate() + 7);
      } else if (granularity === "monthly") {
        rangeEnd.setMonth(rangeEnd.getMonth() + 1);
      }
      ranges.push({
        start: current.toISOString().split("T")[0],
        end: rangeEnd.toISOString().split("T")[0],
      });
      current = new Date(rangeEnd);
    }
    return ranges;
  };
  CohortAnalyzer.prototype.formatCohortName = (dateStr, granularity) => {
    var date = new Date(dateStr);
    if (granularity === "daily") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else if (granularity === "weekly") {
      return "Week of ".concat(
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      );
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  };
  CohortAnalyzer.prototype.calculatePeriodDate = (startDate, period, granularity) => {
    var date = new Date(startDate);
    if (granularity === "daily") {
      date.setDate(date.getDate() + period);
    } else if (granularity === "weekly") {
      date.setDate(date.getDate() + period * 7);
    } else if (granularity === "monthly") {
      date.setMonth(date.getMonth() + period);
    }
    return date.toISOString().split("T")[0];
  };
  CohortAnalyzer.prototype.calculateCumulativeRevenue = (revenueData) =>
    revenueData.reduce((sum, period) => sum + (period.revenue || 0), 0);
  CohortAnalyzer.prototype.calculateLifetimeValue = function (revenueData, userCount) {
    var totalRevenue = this.calculateCumulativeRevenue(revenueData);
    return userCount > 0 ? Math.round((totalRevenue / userCount) * 100) / 100 : 0;
  };
  CohortAnalyzer.prototype.groupMetricsByPeriod = (metrics) =>
    metrics.reduce((groups, metric) => {
      if (!groups[metric.period]) {
        groups[metric.period] = [];
      }
      groups[metric.period].push(metric);
      return groups;
    }, {});
  CohortAnalyzer.prototype.calculateRetentionTrends = (periodGroups) => {
    var trends = [];
    for (var _i = 0, _a = Object.entries(periodGroups); _i < _a.length; _i++) {
      var _b = _a[_i],
        period = _b[0],
        metrics = _b[1];
      var avgRetention = metrics.reduce((sum, m) => sum + m.retentionRate, 0) / metrics.length;
      var avgRevenue =
        metrics.reduce((sum, m) => sum + m.averageRevenuePerUser, 0) / metrics.length;
      trends.push({
        period: parseInt(period),
        averageRetention: Math.round(avgRetention * 100) / 100,
        averageRevenuePerUser: Math.round(avgRevenue * 100) / 100,
        cohortCount: metrics.length,
      });
    }
    return trends.sort((a, b) => a.period - b.period);
  };
  CohortAnalyzer.prototype.compareCohortPerformance = function (metrics) {
    var cohortGroups = metrics.reduce((groups, metric) => {
      if (!groups[metric.cohortId]) {
        groups[metric.cohortId] = [];
      }
      groups[metric.cohortId].push(metric);
      return groups;
    }, {});
    var comparison = [];
    for (var _i = 0, _a = Object.entries(cohortGroups); _i < _a.length; _i++) {
      var _b = _a[_i],
        cohortId = _b[0],
        cohortMetrics = _b[1];
      var avgRetention =
        cohortMetrics.reduce((sum, m) => sum + m.retentionRate, 0) / cohortMetrics.length;
      var totalRevenue = cohortMetrics.reduce((sum, m) => sum + m.revenue, 0);
      var lifetimeValue = cohortMetrics.length > 0 ? totalRevenue / cohortMetrics[0].totalUsers : 0;
      comparison.push({
        cohortId: cohortId,
        averageRetention: Math.round(avgRetention * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        lifetimeValue: Math.round(lifetimeValue * 100) / 100,
        performanceScore: this.calculatePerformanceScore(avgRetention, lifetimeValue),
      });
    }
    return comparison.sort((a, b) => b.performanceScore - a.performanceScore);
  };
  CohortAnalyzer.prototype.analyzeSeasonality = (metrics) => {
    // Basic seasonality analysis - can be enhanced with more sophisticated algorithms
    var monthlyPerformance = {};
    metrics.forEach((metric) => {
      // This would need cohort creation month data
      // Simplified implementation for demonstration
      var month = new Date().getMonth(); // Placeholder
      var monthKey = month.toString();
      if (!monthlyPerformance[monthKey]) {
        monthlyPerformance[monthKey] = { retention: [], revenue: [] };
      }
      monthlyPerformance[monthKey].retention.push(metric.retentionRate);
      monthlyPerformance[monthKey].revenue.push(metric.averageRevenuePerUser);
    });
    return monthlyPerformance;
  };
  CohortAnalyzer.prototype.performSignificanceTests = (periodGroups) => {
    // Simplified statistical significance testing
    // In production, would use proper statistical tests
    var tests = [];
    var periods = Object.keys(periodGroups)
      .map(Number)
      .sort((a, b) => a - b);
    for (var i = 0; i < periods.length - 1; i++) {
      var currentPeriod = periodGroups[periods[i]];
      var nextPeriod = periodGroups[periods[i + 1]];
      var currentAvgRetention =
        currentPeriod.reduce((sum, m) => sum + m.retentionRate, 0) / currentPeriod.length;
      var nextAvgRetention =
        nextPeriod.reduce((sum, m) => sum + m.retentionRate, 0) / nextPeriod.length;
      var retentionChange = nextAvgRetention - currentAvgRetention;
      var isSignificant = Math.abs(retentionChange) > 5; // 5% threshold
      tests.push({
        fromPeriod: periods[i],
        toPeriod: periods[i + 1],
        retentionChange: Math.round(retentionChange * 100) / 100,
        isSignificant: isSignificant,
        significance: isSignificant ? (retentionChange > 0 ? "improvement" : "decline") : "stable",
      });
    }
    return tests;
  };
  CohortAnalyzer.prototype.generatePredictiveInsights = function (metrics) {
    // Generate predictive insights based on cohort trends
    var insights = [];
    // Analyze retention trends
    var retentionTrend = this.calculateTrendDirection(
      metrics.map((m) => ({ period: m.period, value: m.retentionRate })),
    );
    if (retentionTrend.direction === "increasing") {
      insights.push({
        type: "positive",
        category: "retention",
        message: "Retention rates are improving with a ".concat(
          retentionTrend.rate,
          "% increase trend",
        ),
        confidence: retentionTrend.confidence,
      });
    } else if (retentionTrend.direction === "decreasing") {
      insights.push({
        type: "warning",
        category: "retention",
        message: "Retention rates are declining with a ".concat(
          Math.abs(retentionTrend.rate),
          "% decrease trend",
        ),
        confidence: retentionTrend.confidence,
      });
    }
    // Analyze revenue trends
    var revenueTrend = this.calculateTrendDirection(
      metrics.map((m) => ({ period: m.period, value: m.averageRevenuePerUser })),
    );
    if (revenueTrend.direction === "increasing") {
      insights.push({
        type: "positive",
        category: "revenue",
        message: "Revenue per user is growing with a ".concat(
          revenueTrend.rate,
          "% increase trend",
        ),
        confidence: revenueTrend.confidence,
      });
    }
    return insights;
  };
  CohortAnalyzer.prototype.calculatePerformanceScore = (retention, lifetimeValue) => {
    // Weighted performance score (retention: 60%, LTV: 40%)
    return Math.round((retention * 0.6 + (lifetimeValue / 100) * 0.4) * 100) / 100;
  };
  CohortAnalyzer.prototype.calculateTrendDirection = (data) => {
    if (data.length < 2) return { direction: "stable", rate: 0, confidence: 0 };
    var sortedData = data.sort((a, b) => a.period - b.period);
    var firstValue = sortedData[0].value;
    var lastValue = sortedData[sortedData.length - 1].value;
    var changeRate = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    var confidence = Math.min(Math.abs(changeRate) * 10, 100); // Simplified confidence calculation
    return {
      direction: changeRate > 1 ? "increasing" : changeRate < -1 ? "decreasing" : "stable",
      rate: Math.round(Math.abs(changeRate) * 100) / 100,
      confidence: Math.round(confidence),
    };
  };
  return CohortAnalyzer;
})();
exports.CohortAnalyzer = CohortAnalyzer;
// Factory function for creating cohort analyzer instances
function createCohortAnalyzer() {
  return new CohortAnalyzer();
}
// Utility functions for cohort analysis
exports.cohortUtils = {
  /**
   * Format cohort data for visualization components
   */
  formatForHeatmap: (metrics) => {
    var heatmapData = [];
    var cohorts = __spreadArray([], new Set(metrics.map((m) => m.cohortId)), true);
    var periods = __spreadArray([], new Set(metrics.map((m) => m.period)), true).sort(
      (a, b) => a - b,
    );
    var _loop_1 = (cohort) => {
      var cohortData = { cohort: cohort };
      var _loop_2 = (period) => {
        var metric = metrics.find((m) => m.cohortId === cohort && m.period === period);
        cohortData["period_".concat(period)] = metric ? metric.retentionRate : 0;
      };
      for (var _a = 0, periods_1 = periods; _a < periods_1.length; _a++) {
        var period = periods_1[_a];
        _loop_2(period);
      }
      heatmapData.push(cohortData);
    };
    for (var _i = 0, cohorts_3 = cohorts; _i < cohorts_3.length; _i++) {
      var cohort = cohorts_3[_i];
      _loop_1(cohort);
    }
    return heatmapData;
  },
  /**
   * Calculate cohort size distribution
   */
  calculateCohortSizes: (cohorts) => {
    var sizes = cohorts.map((c) => c.userCount);
    return {
      total: sizes.reduce((sum, size) => sum + size, 0),
      average: Math.round(sizes.reduce((sum, size) => sum + size, 0) / sizes.length),
      median: sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)],
      largest: Math.max.apply(Math, sizes),
      smallest: Math.min.apply(Math, sizes),
    };
  },
  /**
   * Generate cohort comparison data
   */
  generateComparisonData: (metrics) => {
    var comparison = [];
    var cohorts = __spreadArray([], new Set(metrics.map((m) => m.cohortId)), true);
    var _loop_3 = (cohort) => {
      var cohortMetrics = metrics.filter((m) => m.cohortId === cohort);
      var avgRetention =
        cohortMetrics.reduce((sum, m) => sum + m.retentionRate, 0) / cohortMetrics.length;
      var totalRevenue = cohortMetrics.reduce((sum, m) => sum + m.revenue, 0);
      comparison.push({
        cohort: cohort,
        averageRetention: Math.round(avgRetention * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        periods: cohortMetrics.length,
      });
    };
    for (var _i = 0, cohorts_4 = cohorts; _i < cohorts_4.length; _i++) {
      var cohort = cohorts_4[_i];
      _loop_3(cohort);
    }
    return comparison.sort((a, b) => b.averageRetention - a.averageRetention);
  },
};
