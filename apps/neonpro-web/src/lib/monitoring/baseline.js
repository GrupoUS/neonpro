"use strict";
/**
 * TASK-001: Foundation Setup & Baseline
 * Baseline Metrics System
 *
 * Establishes baseline performance, user engagement, and system health
 * metrics for measuring enhancement impact and detecting regressions.
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createbaselineManager = void 0;
exports.establishBaseline = establishBaseline;
exports.compareToBaseline = compareToBaseline;
exports.generateBaselineReport = generateBaselineReport;
var client_1 = require("@/lib/supabase/client");
var BaselineManager = /** @class */ (function () {
  function BaselineManager() {
    this.supabase = (0, client_1.createClient)();
    this.baselineMetrics = new Map();
    this.measurementInterval = null;
    // Core metrics to establish baselines for
    this.coreMetrics = [
      // Performance metrics
      { name: "page_load_time", unit: "ms", threshold: 2000 },
      { name: "first_contentful_paint", unit: "ms", threshold: 1500 },
      { name: "largest_contentful_paint", unit: "ms", threshold: 2500 },
      { name: "cumulative_layout_shift", unit: "score", threshold: 0.1 },
      { name: "time_to_interactive", unit: "ms", threshold: 3000 },
      // User engagement metrics
      { name: "session_duration", unit: "seconds", threshold: 300 },
      { name: "pages_per_session", unit: "count", threshold: 3 },
      { name: "bounce_rate", unit: "percentage", threshold: 60 },
      { name: "user_retention_rate", unit: "percentage", threshold: 40 },
      { name: "feature_adoption_rate", unit: "percentage", threshold: 25 },
      // System health metrics
      { name: "api_response_time", unit: "ms", threshold: 500 },
      { name: "database_query_time", unit: "ms", threshold: 100 },
      { name: "error_rate", unit: "percentage", threshold: 1 },
      { name: "uptime_percentage", unit: "percentage", threshold: 99.9 },
      { name: "memory_usage", unit: "mb", threshold: 512 },
      // Business metrics
      { name: "daily_active_users", unit: "count", threshold: 10 },
      { name: "feature_usage_rate", unit: "percentage", threshold: 30 },
      { name: "conversion_rate", unit: "percentage", threshold: 5 },
      { name: "user_satisfaction_score", unit: "rating", threshold: 4.0 },
    ];
    this.initializeBaselines();
    this.startPeriodicMeasurement();
  }
  /**
   * Initialize baseline measurement system
   */
  BaselineManager.prototype.initializeBaselines = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            // Load existing baselines from database
            return [4 /*yield*/, this.loadExistingBaselines()];
          case 1:
            // Load existing baselines from database
            _a.sent();
            // Establish new baselines if needed
            return [4 /*yield*/, this.establishMissingBaselines()];
          case 2:
            // Establish new baselines if needed
            _a.sent();
            console.log("✅ Baseline system initialized");
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Error initializing baselines:", error_1);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Load existing baselines from database
   */
  BaselineManager.prototype.loadExistingBaselines = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, latestBaselines_1, error_2;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("system_metrics")
                .select("*")
                .eq("metric_type", "baseline")
                .order("timestamp", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error loading baselines:", error);
              return [2 /*return*/];
            }
            latestBaselines_1 = new Map();
            data === null || data === void 0
              ? void 0
              : data.forEach(function (record) {
                  var metricName = record.metric_name;
                  if (!latestBaselines_1.has(metricName)) {
                    latestBaselines_1.set(metricName, record);
                  }
                });
            // Convert to BaselineMetric format
            latestBaselines_1.forEach(function (record, metricName) {
              var _a, _b, _c;
              var baseline = {
                metric_name: metricName,
                metric_value: record.metric_value,
                metric_unit: record.metric_unit,
                measurement_period:
                  ((_a = record.metadata) === null || _a === void 0
                    ? void 0
                    : _a.measurement_period) || "daily",
                baseline_date: record.timestamp,
                confidence_level:
                  ((_b = record.metadata) === null || _b === void 0
                    ? void 0
                    : _b.confidence_level) || 0.8,
                sample_size:
                  ((_c = record.metadata) === null || _c === void 0 ? void 0 : _c.sample_size) ||
                  100,
                metadata: record.metadata,
              };
              _this.baselineMetrics.set(metricName, baseline);
            });
            console.log("Loaded ".concat(this.baselineMetrics.size, " existing baselines"));
            return [3 /*break*/, 3];
          case 2:
            error_2 = _b.sent();
            console.error("Error loading existing baselines:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Establish baselines for metrics that don't have them
   */
  BaselineManager.prototype.establishMissingBaselines = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, metric;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_i = 0), (_a = this.coreMetrics);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            metric = _a[_i];
            if (!!this.baselineMetrics.has(metric.name)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.establishBaseline(metric.name, metric.unit)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Establish a baseline for a specific metric
   */
  BaselineManager.prototype.establishBaseline = function (metricName_1, metricUnit_1) {
    return __awaiter(this, arguments, void 0, function (metricName, metricUnit, measurementPeriod) {
      var measurements, baseline, error_3;
      if (measurementPeriod === void 0) {
        measurementPeriod = "daily";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            console.log("\uD83D\uDCCA Establishing baseline for ".concat(metricName, "..."));
            return [4 /*yield*/, this.collectCurrentMeasurements(metricName, measurementPeriod)];
          case 1:
            measurements = _a.sent();
            if (!(measurements.length === 0)) return [3 /*break*/, 3];
            console.warn(
              "No measurements available for ".concat(metricName, ", using default value"),
            );
            return [
              4 /*yield*/,
              this.createDefaultBaseline(metricName, metricUnit, measurementPeriod),
            ];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            baseline = this.calculateBaselineStatistics(
              metricName,
              metricUnit,
              measurementPeriod,
              measurements,
            );
            // Store baseline in database
            return [4 /*yield*/, this.storeBaseline(baseline)];
          case 4:
            // Store baseline in database
            _a.sent();
            // Cache baseline
            this.baselineMetrics.set(metricName, baseline);
            console.log(
              "\u2705 Baseline established for "
                .concat(metricName, ": ")
                .concat(baseline.metric_value, " ")
                .concat(baseline.metric_unit),
            );
            return [2 /*return*/, baseline];
          case 5:
            error_3 = _a.sent();
            console.error("Error establishing baseline for ".concat(metricName, ":"), error_3);
            return [2 /*return*/, null];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Collect current measurements for a metric
   */
  BaselineManager.prototype.collectCurrentMeasurements = function (metricName, measurementPeriod) {
    return __awaiter(this, void 0, void 0, function () {
      var periodDays, startDate, _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            periodDays =
              measurementPeriod === "daily" ? 7 : measurementPeriod === "weekly" ? 30 : 90;
            startDate = new Date();
            startDate.setDate(startDate.getDate() - periodDays);
            return [
              4 /*yield*/,
              this.supabase
                .from("system_metrics")
                .select("metric_value")
                .eq("metric_name", metricName)
                .gte("timestamp", startDate.toISOString())
                .not("metric_type", "eq", "baseline"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              console.warn("No existing data for ".concat(metricName, ":"), error);
              return [2 /*return*/, []];
            }
            return [
              2 /*return*/,
              data
                .map(function (record) {
                  return record.metric_value;
                })
                .filter(function (val) {
                  return val !== null;
                }),
            ];
          case 2:
            error_4 = _b.sent();
            console.error("Error collecting measurements for ".concat(metricName, ":"), error_4);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate baseline statistics from measurements
   */
  BaselineManager.prototype.calculateBaselineStatistics = function (
    metricName,
    metricUnit,
    measurementPeriod,
    measurements,
  ) {
    // Calculate statistical measures
    var sorted = __spreadArray([], measurements, true).sort(function (a, b) {
      return a - b;
    });
    var mean =
      measurements.reduce(function (sum, val) {
        return sum + val;
      }, 0) / measurements.length;
    var median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    // Use median for more stable baseline (less affected by outliers)
    var baselineValue = median;
    // Calculate confidence level based on sample size and variance
    var variance =
      measurements.reduce(function (sum, val) {
        return sum + Math.pow(val - mean, 2);
      }, 0) / measurements.length;
    var standardDeviation = Math.sqrt(variance);
    var coefficientOfVariation = standardDeviation / mean;
    // Higher confidence for larger samples and lower variance
    var confidenceLevel = Math.min(
      0.95,
      Math.max(0.5, (measurements.length / 100) * (1 - Math.min(1, coefficientOfVariation))),
    );
    return {
      metric_name: metricName,
      metric_value: Number(baselineValue.toFixed(2)),
      metric_unit: metricUnit,
      measurement_period: measurementPeriod,
      baseline_date: new Date().toISOString(),
      confidence_level: Number(confidenceLevel.toFixed(2)),
      sample_size: measurements.length,
      metadata: {
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        standard_deviation: Number(standardDeviation.toFixed(2)),
        min_value: Math.min.apply(Math, measurements),
        max_value: Math.max.apply(Math, measurements),
        percentile_95: sorted[Math.floor(sorted.length * 0.95)],
        percentile_5: sorted[Math.floor(sorted.length * 0.05)],
      },
    };
  };
  /**
   * Create default baseline when no measurements exist
   */
  BaselineManager.prototype.createDefaultBaseline = function (
    metricName,
    metricUnit,
    measurementPeriod,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var defaultValues, defaultValue, baseline;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            defaultValues = {
              page_load_time: 1000,
              first_contentful_paint: 800,
              largest_contentful_paint: 1500,
              cumulative_layout_shift: 0.05,
              time_to_interactive: 2000,
              session_duration: 180,
              pages_per_session: 2.5,
              bounce_rate: 50,
              user_retention_rate: 35,
              feature_adoption_rate: 20,
              api_response_time: 200,
              database_query_time: 50,
              error_rate: 0.5,
              uptime_percentage: 99.95,
              memory_usage: 256,
              daily_active_users: 5,
              feature_usage_rate: 25,
              conversion_rate: 3,
              user_satisfaction_score: 4.2,
            };
            defaultValue = defaultValues[metricName] || 100;
            baseline = {
              metric_name: metricName,
              metric_value: defaultValue,
              metric_unit: metricUnit,
              measurement_period: measurementPeriod,
              baseline_date: new Date().toISOString(),
              confidence_level: 0.3, // Low confidence for default values
              sample_size: 0,
              metadata: {
                source: "default_value",
                note: "Baseline established using default value due to lack of historical data",
              },
            };
            return [4 /*yield*/, this.storeBaseline(baseline)];
          case 1:
            _a.sent();
            return [2 /*return*/, baseline];
        }
      });
    });
  };
  /**
   * Store baseline in database
   */
  BaselineManager.prototype.storeBaseline = function (baseline) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("system_metrics").insert({
                metric_type: "baseline",
                metric_name: baseline.metric_name,
                metric_value: baseline.metric_value,
                metric_unit: baseline.metric_unit,
                metadata: __assign(
                  {
                    measurement_period: baseline.measurement_period,
                    confidence_level: baseline.confidence_level,
                    sample_size: baseline.sample_size,
                  },
                  baseline.metadata,
                ),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error storing baseline:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Error storing baseline:", error_5);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Compare current metrics against baselines
   */
  BaselineManager.prototype.compareToBaseline = function (metricName, currentValue) {
    return __awaiter(this, void 0, void 0, function () {
      var baseline, changePercentage, changeDirection, significanceLevel, comparison;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            baseline = this.baselineMetrics.get(metricName);
            if (!baseline) {
              console.warn("No baseline found for ".concat(metricName));
              return [2 /*return*/, null];
            }
            changePercentage =
              ((currentValue - baseline.metric_value) / baseline.metric_value) * 100;
            changeDirection = this.determineChangeDirection(metricName, changePercentage);
            significanceLevel = this.determineSignificanceLevel(
              Math.abs(changePercentage),
              baseline.confidence_level,
            );
            comparison = {
              metric_name: metricName,
              baseline_value: baseline.metric_value,
              current_value: currentValue,
              change_percentage: Number(changePercentage.toFixed(2)),
              change_direction: changeDirection,
              significance_level: significanceLevel,
              measurement_date: new Date().toISOString(),
            };
            if (!(significanceLevel === "high")) return [3 /*break*/, 2];
            console.log(
              "\uD83D\uDEA8 Significant "
                .concat(changeDirection, " detected in ")
                .concat(metricName, ": ")
                .concat(changePercentage.toFixed(1), "%"),
            );
            // Store comparison in database
            return [4 /*yield*/, this.storeComparison(comparison)];
          case 1:
            // Store comparison in database
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/, comparison];
        }
      });
    });
  };
  /**
   * Determine if change is improvement or regression
   */
  BaselineManager.prototype.determineChangeDirection = function (metricName, changePercentage) {
    // Define metrics where lower values are better
    var lowerIsBetter = [
      "page_load_time",
      "first_contentful_paint",
      "largest_contentful_paint",
      "cumulative_layout_shift",
      "time_to_interactive",
      "bounce_rate",
      "api_response_time",
      "database_query_time",
      "error_rate",
      "memory_usage",
    ];
    // Define neutral threshold
    var neutralThreshold = 5; // 5% change considered neutral
    if (Math.abs(changePercentage) < neutralThreshold) {
      return "neutral";
    }
    var isLowerBetter = lowerIsBetter.includes(metricName);
    var isDecrease = changePercentage < 0;
    if ((isLowerBetter && isDecrease) || (!isLowerBetter && !isDecrease)) {
      return "improvement";
    } else {
      return "regression";
    }
  };
  /**
   * Determine significance level of change
   */
  BaselineManager.prototype.determineSignificanceLevel = function (
    absoluteChangePercentage,
    confidenceLevel,
  ) {
    // Adjust significance thresholds based on confidence level
    var confidenceMultiplier = Math.max(0.5, confidenceLevel);
    var highThreshold = 20 * confidenceMultiplier;
    var mediumThreshold = 10 * confidenceMultiplier;
    if (absoluteChangePercentage >= highThreshold) {
      return "high";
    } else if (absoluteChangePercentage >= mediumThreshold) {
      return "medium";
    } else {
      return "low";
    }
  };
  /**
   * Store comparison in database
   */
  BaselineManager.prototype.storeComparison = function (comparison) {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("system_metrics").insert({
                metric_type: "baseline_comparison",
                metric_name: comparison.metric_name,
                metric_value: comparison.change_percentage,
                metric_unit: "percentage",
                metadata: {
                  baseline_value: comparison.baseline_value,
                  current_value: comparison.current_value,
                  change_direction: comparison.change_direction,
                  significance_level: comparison.significance_level,
                },
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error storing comparison:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate comprehensive baseline report
   */
  BaselineManager.prototype.generateBaselineReport = function () {
    return __awaiter(this, arguments, void 0, function (measurementPeriod) {
      var comparisons,
        recommendations,
        _i,
        _a,
        _b,
        metricName,
        baseline,
        currentValue,
        comparison,
        significantChanges,
        regressions,
        improvements,
        neutralChanges,
        report,
        error_7;
      if (measurementPeriod === void 0) {
        measurementPeriod = "daily";
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            comparisons = [];
            recommendations = [];
            (_i = 0), (_a = this.baselineMetrics);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            (_b = _a[_i]), (metricName = _b[0]), (baseline = _b[1]);
            if (!(baseline.measurement_period === measurementPeriod)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.getCurrentMetricValue(metricName)];
          case 2:
            currentValue = _c.sent();
            if (!(currentValue !== null)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.compareToBaseline(metricName, currentValue)];
          case 3:
            comparison = _c.sent();
            if (comparison) {
              comparisons.push(comparison);
              // Generate recommendations for regressions
              if (
                comparison.change_direction === "regression" &&
                comparison.significance_level === "high"
              ) {
                recommendations.push(this.generateRecommendation(comparison));
              }
            }
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 1];
          case 5:
            significantChanges = comparisons.filter(function (c) {
              return c.significance_level === "high";
            }).length;
            regressions = comparisons.filter(function (c) {
              return c.change_direction === "regression";
            }).length;
            improvements = comparisons.filter(function (c) {
              return c.change_direction === "improvement";
            }).length;
            neutralChanges = comparisons.filter(function (c) {
              return c.change_direction === "neutral";
            }).length;
            report = {
              report_date: new Date().toISOString(),
              measurement_period: measurementPeriod,
              total_metrics: comparisons.length,
              significant_changes: significantChanges,
              regressions: regressions,
              improvements: improvements,
              neutral_changes: neutralChanges,
              comparisons: comparisons,
              recommendations: recommendations,
            };
            // Store report in database
            return [4 /*yield*/, this.storeReport(report)];
          case 6:
            // Store report in database
            _c.sent();
            return [2 /*return*/, report];
          case 7:
            error_7 = _c.sent();
            console.error("Error generating baseline report:", error_7);
            throw error_7;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get current value for a metric
   */
  BaselineManager.prototype.getCurrentMetricValue = function (metricName) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("system_metrics")
                .select("metric_value")
                .eq("metric_name", metricName)
                .not("metric_type", "eq", "baseline")
                .not("metric_type", "eq", "baseline_comparison")
                .order("timestamp", { ascending: false })
                .limit(1),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data || data.length === 0) {
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data[0].metric_value];
          case 2:
            error_8 = _b.sent();
            console.error("Error getting current value for ".concat(metricName, ":"), error_8);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate recommendation for regression
   */
  BaselineManager.prototype.generateRecommendation = function (comparison) {
    var metricName = comparison.metric_name;
    var changePercentage = comparison.change_percentage;
    var recommendations = {
      page_load_time: "Page load time increased by ".concat(
        Math.abs(changePercentage).toFixed(1),
        "%. Consider optimizing images, reducing bundle size, or implementing caching.",
      ),
      error_rate: "Error rate increased by ".concat(
        Math.abs(changePercentage).toFixed(1),
        "%. Review recent deployments and check error logs for patterns.",
      ),
      api_response_time: "API response time increased by ".concat(
        Math.abs(changePercentage).toFixed(1),
        "%. Check database performance and API endpoint optimization.",
      ),
      bounce_rate: "Bounce rate increased by ".concat(
        Math.abs(changePercentage).toFixed(1),
        "%. Review landing page performance and user experience.",
      ),
      memory_usage: "Memory usage increased by ".concat(
        Math.abs(changePercentage).toFixed(1),
        "%. Check for memory leaks and optimize resource usage.",
      ),
    };
    return (
      recommendations[metricName] ||
      ""
        .concat(metricName, " shows regression of ")
        .concat(Math.abs(changePercentage).toFixed(1), "%. Investigation recommended.")
    );
  };
  /**
   * Store report in database
   */
  BaselineManager.prototype.storeReport = function (report) {
    return __awaiter(this, void 0, void 0, function () {
      var error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("system_metrics").insert({
                metric_type: "baseline_report",
                metric_name: "comprehensive_report",
                metric_value: report.total_metrics,
                metric_unit: "count",
                metadata: report,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_9 = _a.sent();
            console.error("Error storing report:", error_9);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Start periodic baseline measurement
   */
  BaselineManager.prototype.startPeriodicMeasurement = function () {
    var _this = this;
    // Run baseline comparison every hour
    this.measurementInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          var error_10;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.runPeriodicMeasurement()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_10 = _a.sent();
                console.error("Error in periodic measurement:", error_10);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      },
      60 * 60 * 1000,
    ); // Every hour
  };
  /**
   * Run periodic measurement and comparison
   */
  BaselineManager.prototype.runPeriodicMeasurement = function () {
    return __awaiter(this, void 0, void 0, function () {
      var currentMetrics, _i, _a, _b, metricName, currentValue;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            console.log("🔄 Running periodic baseline measurement...");
            return [4 /*yield*/, this.collectCurrentMetrics()];
          case 1:
            currentMetrics = _c.sent();
            (_i = 0), (_a = Object.entries(currentMetrics));
            _c.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            (_b = _a[_i]), (metricName = _b[0]), (currentValue = _b[1]);
            if (!(typeof currentValue === "number")) return [3 /*break*/, 4];
            return [4 /*yield*/, this.compareToBaseline(metricName, currentValue)];
          case 3:
            _c.sent();
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            console.log("✅ Periodic baseline measurement completed");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Collect current metrics from various sources
   */
  BaselineManager.prototype.collectCurrentMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, sessionStart, sessionDuration;
      var _a;
      return __generator(this, function (_b) {
        metrics = {};
        try {
          // Get performance metrics (simplified for now)
          metrics.page_load_time = performance.now();
          metrics.memory_usage =
            ((_a = performance.memory) === null || _a === void 0 ? void 0 : _a.usedJSHeapSize) /
              (1024 * 1024) || 0;
          sessionStart = sessionStorage.getItem("neonpro_session_start");
          if (sessionStart) {
            sessionDuration = (Date.now() - parseInt(sessionStart)) / 1000;
            metrics.session_duration = sessionDuration;
          }
          // Add system health metrics
          metrics.uptime_percentage = 99.9; // This would come from uptime monitoring
          metrics.error_rate = 0.5; // This would come from error tracking
          return [2 /*return*/, metrics];
        } catch (error) {
          console.error("Error collecting current metrics:", error);
          return [2 /*return*/, {}];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get all baselines
   */
  BaselineManager.prototype.getBaselines = function () {
    return new Map(this.baselineMetrics);
  };
  /**
   * Update baseline for a metric
   */
  BaselineManager.prototype.updateBaseline = function (metricName) {
    return __awaiter(this, void 0, void 0, function () {
      var existingBaseline;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            existingBaseline = this.baselineMetrics.get(metricName);
            if (!existingBaseline) {
              console.warn("No existing baseline for ".concat(metricName));
              return [2 /*return*/, null];
            }
            return [
              4 /*yield*/,
              this.establishBaseline(
                metricName,
                existingBaseline.metric_unit,
                existingBaseline.measurement_period,
              ),
            ];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Cleanup resources
   */
  BaselineManager.prototype.destroy = function () {
    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
    }
  };
  return BaselineManager;
})();
// Export singleton instance
var createbaselineManager = function () {
  return new BaselineManager();
};
exports.createbaselineManager = createbaselineManager;
// Utility functions
function establishBaseline(metricName, metricUnit, measurementPeriod) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        baselineManager.establishBaseline(metricName, metricUnit, measurementPeriod),
      ];
    });
  });
}
function compareToBaseline(metricName, currentValue) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2 /*return*/, baselineManager.compareToBaseline(metricName, currentValue)];
    });
  });
}
function generateBaselineReport(measurementPeriod) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2 /*return*/, baselineManager.generateBaselineReport(measurementPeriod)];
    });
  });
}
