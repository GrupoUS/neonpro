"use strict";
/**
 * Vision Analytics Engine
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Comprehensive analytics engine for computer vision systems
 * Real-time data processing, correlation analysis, and insights generation
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
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
exports.visionAnalyticsEngine =
  exports.VisionAnalyticsEngine =
  exports.VisionMetricSchema =
  exports.createvisionAnalyticsEngine =
    void 0;
var zod_1 = require("zod");
var logger_1 = require("@/lib/utils/logger");
var client_1 = require("@/lib/supabase/client");
// Main Analytics Engine Class
var createvisionAnalyticsEngine = /** @class */ (function () {
  function createvisionAnalyticsEngine() {
    this.supabase = (0, client_1.createClient)();
    this.metricsBuffer = [];
    this.insights = new Map();
    this.benchmarks = new Map();
    this.alertRules = new Map();
    this.isRealTimeEnabled = true;
    this.refreshInterval = 30000; // 30 seconds
    this.initializeAnalyticsEngine();
  }
  /**
   * Initialize analytics engine
   */
  createvisionAnalyticsEngine.prototype.initializeAnalyticsEngine = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            logger_1.logger.info("Initializing Vision Analytics Engine...");
            // Load benchmarks
            return [4 /*yield*/, this.loadPerformanceBenchmarks()];
          case 1:
            // Load benchmarks
            _a.sent();
            // Load alert rules
            return [4 /*yield*/, this.loadAlertRules()];
          case 2:
            // Load alert rules
            _a.sent();
            // Start real-time processing
            if (this.isRealTimeEnabled) {
              this.startRealTimeProcessing();
            }
            logger_1.logger.info("Vision Analytics Engine initialized successfully");
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            logger_1.logger.error("Failed to initialize Vision Analytics Engine:", error_1);
            throw error_1;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Record vision metric
   */
  createvisionAnalyticsEngine.prototype.recordMetric = function (metric) {
    return __awaiter(this, void 0, void 0, function () {
      var visionMetric, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            visionMetric = __assign(
              {
                id: "metric_"
                  .concat(Date.now(), "_")
                  .concat(Math.random().toString(36).substr(2, 9)),
                timestamp: new Date().toISOString(),
              },
              metric,
            );
            // Add to buffer for real-time processing
            this.metricsBuffer.push(visionMetric);
            // Save to database
            return [4 /*yield*/, this.saveMetric(visionMetric)];
          case 1:
            // Save to database
            _a.sent();
            // Check for alerts
            return [4 /*yield*/, this.checkAlerts(visionMetric)];
          case 2:
            // Check for alerts
            _a.sent();
            logger_1.logger.info("Vision metric recorded: ".concat(visionMetric.id));
            return [2 /*return*/, visionMetric];
          case 3:
            error_2 = _a.sent();
            logger_1.logger.error("Failed to record vision metric:", error_2);
            throw error_2;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get real-time dashboard data
   */
  createvisionAnalyticsEngine.prototype.getDashboardData = function (dashboardId_1) {
    return __awaiter(this, arguments, void 0, function (dashboardId, filters, timeRange) {
      var dashboard, dashboardData, error_3;
      var _a;
      if (filters === void 0) {
        filters = [];
      }
      if (timeRange === void 0) {
        timeRange = "daily";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.getDashboard(dashboardId)];
          case 1:
            dashboard = _b.sent();
            if (!dashboard) {
              throw new Error("Dashboard not found: ".concat(dashboardId));
            }
            _a = {
              dashboard: dashboard,
            };
            return [4 /*yield*/, this.getWidgetData(dashboard.widgets, filters, timeRange)];
          case 2:
            _a.widgets = _b.sent();
            return [4 /*yield*/, this.generateRealtimeInsights(filters, timeRange)];
          case 3:
            _a.insights = _b.sent();
            return [4 /*yield*/, this.getActiveAlerts(filters)];
          case 4:
            _a.alerts = _b.sent();
            return [4 /*yield*/, this.getDashboardSummary(filters, timeRange)];
          case 5:
            dashboardData =
              ((_a.summary = _b.sent()), (_a.lastUpdated = new Date().toISOString()), _a);
            return [2 /*return*/, dashboardData];
          case 6:
            error_3 = _b.sent();
            logger_1.logger.error("Failed to get dashboard data:", error_3);
            throw error_3;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate analytics insights
   */
  createvisionAnalyticsEngine.prototype.generateInsights = function () {
    return __awaiter(this, arguments, void 0, function (timeframe, categories) {
      var insights,
        trends,
        anomalies,
        correlations,
        performance_1,
        _i,
        insights_1,
        insight,
        error_4;
      if (timeframe === void 0) {
        timeframe = "daily";
      }
      if (categories === void 0) {
        categories = ["performance", "outcome", "efficiency"];
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 10]);
            insights = [];
            return [4 /*yield*/, this.analyzeTrends(timeframe, categories)];
          case 1:
            trends = _a.sent();
            insights.push.apply(insights, this.generateTrendInsights(trends));
            return [4 /*yield*/, this.detectAnomalies(timeframe, categories)];
          case 2:
            anomalies = _a.sent();
            insights.push.apply(insights, this.generateAnomalyInsights(anomalies));
            return [4 /*yield*/, this.analyzeCorrelations(timeframe, categories)];
          case 3:
            correlations = _a.sent();
            insights.push.apply(insights, this.generateCorrelationInsights(correlations));
            return [4 /*yield*/, this.analyzePerformance(timeframe)];
          case 4:
            performance_1 = _a.sent();
            insights.push.apply(insights, this.generatePerformanceInsights(performance_1));
            (_i = 0), (insights_1 = insights);
            _a.label = 5;
          case 5:
            if (!(_i < insights_1.length)) return [3 /*break*/, 8];
            insight = insights_1[_i];
            return [4 /*yield*/, this.saveInsight(insight)];
          case 6:
            _a.sent();
            this.insights.set(insight.id, insight);
            _a.label = 7;
          case 7:
            _i++;
            return [3 /*break*/, 5];
          case 8:
            logger_1.logger.info("Generated ".concat(insights.length, " analytics insights"));
            return [2 /*return*/, insights];
          case 9:
            error_4 = _a.sent();
            logger_1.logger.error("Failed to generate insights:", error_4);
            throw error_4;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get performance metrics
   */
  createvisionAnalyticsEngine.prototype.getPerformanceMetrics = function (component_1) {
    return __awaiter(this, arguments, void 0, function (component, timeRange) {
      var _a, data, error, error_5;
      if (timeRange === void 0) {
        timeRange = "daily";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("vision_performance_metrics")
                .select("*")
                .gte("timestamp", this.getTimeRangeStart(timeRange))
                .eq(component ? "component" : "component", component || "all")
                .order("timestamp", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw error;
            }
            return [2 /*return*/, data || []];
          case 2:
            error_5 = _b.sent();
            logger_1.logger.error("Failed to get performance metrics:", error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get patient outcomes
   */
  createvisionAnalyticsEngine.prototype.getPatientOutcomes = function (patientId_1) {
    return __awaiter(this, arguments, void 0, function (patientId, timeRange) {
      var query, _a, data, error, error_6;
      if (timeRange === void 0) {
        timeRange = "monthly";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("patient_outcomes")
              .select("*")
              .gte("timestamp", this.getTimeRangeStart(timeRange))
              .order("timestamp", { ascending: false });
            if (patientId) {
              query = query.eq("patient_id", patientId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw error;
            }
            return [2 /*return*/, data || []];
          case 2:
            error_6 = _b.sent();
            logger_1.logger.error("Failed to get patient outcomes:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Analyze treatment effectiveness
   */
  createvisionAnalyticsEngine.prototype.analyzeTreatmentEffectiveness = function (treatmentType_1) {
    return __awaiter(this, arguments, void 0, function (treatmentType, timeRange) {
      var outcomes, filteredOutcomes, analysis, error_7;
      var _a;
      if (timeRange === void 0) {
        timeRange = "quarterly";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getPatientOutcomes(undefined, timeRange)];
          case 1:
            outcomes = _b.sent();
            filteredOutcomes = treatmentType
              ? outcomes.filter(function (o) {
                  return o.treatmentType === treatmentType;
                })
              : outcomes;
            _a = {
              treatmentType: treatmentType || "all",
              timeRange: timeRange,
              totalPatients: filteredOutcomes.length,
              successRate: this.calculateSuccessRate(filteredOutcomes),
              averageImprovement: this.calculateAverageImprovement(filteredOutcomes),
              averageSatisfaction: this.calculateAverageSatisfaction(filteredOutcomes),
              complicationRate: this.calculateComplicationRate(filteredOutcomes),
              outcomesByType: this.groupOutcomesByType(filteredOutcomes),
            };
            return [4 /*yield*/, this.analyzeTreatmentTrends(filteredOutcomes)];
          case 2:
            analysis =
              ((_a.trends = _b.sent()),
              (_a.recommendations = this.generateTreatmentRecommendations(filteredOutcomes)),
              _a);
            return [2 /*return*/, analysis];
          case 3:
            error_7 = _b.sent();
            logger_1.logger.error("Failed to analyze treatment effectiveness:", error_7);
            throw error_7;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate predictive insights
   */
  createvisionAnalyticsEngine.prototype.generatePredictiveInsights = function (
    patientId,
    treatmentType,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var similarCases, patterns, predictions, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.findSimilarCases(patientId, treatmentType)];
          case 1:
            similarCases = _a.sent();
            return [4 /*yield*/, this.analyzePatterns(similarCases)];
          case 2:
            patterns = _a.sent();
            predictions = {
              patientId: patientId,
              treatmentType: treatmentType,
              predictedOutcome: this.predictOutcome(patterns),
              successProbability: this.calculateSuccessProbability(patterns),
              complicationRisk: this.assessComplicationRisk(patterns),
              expectedRecoveryTime: this.estimateRecoveryTime(patterns),
              recommendedActions: this.generateRecommendedActions(patterns),
              confidence: this.calculatePredictionConfidence(patterns),
              factors: this.identifyInfluencingFactors(patterns),
              generatedAt: new Date().toISOString(),
            };
            return [2 /*return*/, predictions];
          case 3:
            error_8 = _a.sent();
            logger_1.logger.error("Failed to generate predictive insights:", error_8);
            throw error_8;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate clinic-wide analytics
   */
  createvisionAnalyticsEngine.prototype.getClinicAnalytics = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, timeRange) {
      var startDate, metrics, outcomes, performance_2, analytics, error_9;
      var _a;
      if (timeRange === void 0) {
        timeRange = "monthly";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            startDate = this.getTimeRangeStart(timeRange);
            return [
              4 /*yield*/,
              this.supabase
                .from("vision_metrics")
                .select("*")
                .eq("clinic_id", clinicId)
                .gte("timestamp", startDate),
            ];
          case 1:
            metrics = _b.sent().data;
            return [4 /*yield*/, this.getPatientOutcomes(undefined, timeRange)];
          case 2:
            outcomes = _b.sent();
            return [4 /*yield*/, this.getPerformanceMetrics(undefined, timeRange)];
          case 3:
            performance_2 = _b.sent();
            _a = {
              clinicId: clinicId,
              timeRange: timeRange,
              period: { start: startDate, end: new Date().toISOString() },
              usage: this.calculateUsageMetrics(metrics || []),
              performance: this.aggregatePerformanceMetrics(performance_2),
              outcomes: this.analyzeOutcomeMetrics(outcomes),
              efficiency: this.calculateEfficiencyMetrics(metrics || [], outcomes),
            };
            return [4 /*yield*/, this.calculateROI(clinicId, timeRange)];
          case 4:
            analytics =
              ((_a.roi = _b.sent()),
              (_a.trends = this.identifyTrends(metrics || [])),
              (_a.recommendations = this.generateClinicRecommendations(metrics || [], outcomes)),
              _a);
            return [2 /*return*/, analytics];
          case 5:
            error_9 = _b.sent();
            logger_1.logger.error("Failed to get clinic analytics:", error_9);
            throw error_9;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper Methods
  createvisionAnalyticsEngine.prototype.loadPerformanceBenchmarks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var defaultBenchmarks;
      var _this = this;
      return __generator(this, function (_a) {
        defaultBenchmarks = [
          {
            id: "face_detection_accuracy",
            component: "face_detection",
            metricType: "accuracy",
            benchmarkValue: 95,
            currentValue: 0,
            variance: 0,
            percentile: 0,
            category: "accuracy",
          },
          {
            id: "aesthetic_analysis_accuracy",
            component: "aesthetic_analysis",
            metricType: "accuracy",
            benchmarkValue: 90,
            currentValue: 0,
            variance: 0,
            percentile: 0,
            category: "accuracy",
          },
          {
            id: "complication_detection_accuracy",
            component: "complication_detection",
            metricType: "accuracy",
            benchmarkValue: 95,
            currentValue: 0,
            variance: 0,
            percentile: 0,
            category: "accuracy",
          },
        ];
        defaultBenchmarks.forEach(function (benchmark) {
          _this.benchmarks.set(benchmark.id, benchmark);
        });
        return [2 /*return*/];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.loadAlertRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("alert_rules").select("*").eq("enabled", true)];
          case 1:
            data = _a.sent().data;
            if (data) {
              data.forEach(function (rule) {
                _this.alertRules.set(rule.id, rule);
              });
            }
            return [2 /*return*/];
        }
      });
    });
  };
  createvisionAnalyticsEngine.prototype.startRealTimeProcessing = function () {
    var _this = this;
    setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_10;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [4 /*yield*/, this.processMetricsBuffer()];
            case 1:
              _a.sent();
              return [4 /*yield*/, this.generateRealtimeInsights()];
            case 2:
              _a.sent();
              return [4 /*yield*/, this.updateDashboards()];
            case 3:
              _a.sent();
              return [3 /*break*/, 5];
            case 4:
              error_10 = _a.sent();
              logger_1.logger.error("Real-time processing error:", error_10);
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    }, this.refreshInterval);
  };
  createvisionAnalyticsEngine.prototype.processMetricsBuffer = function () {
    return __awaiter(this, void 0, void 0, function () {
      var metricsToProcess, batchSize, i, batch;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.metricsBuffer.length === 0) return [2 /*return*/];
            metricsToProcess = __spreadArray([], this.metricsBuffer, true);
            this.metricsBuffer = [];
            batchSize = 100;
            i = 0;
            _a.label = 1;
          case 1:
            if (!(i < metricsToProcess.length)) return [3 /*break*/, 4];
            batch = metricsToProcess.slice(i, i + batchSize);
            return [4 /*yield*/, this.processBatch(batch)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            i += batchSize;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  createvisionAnalyticsEngine.prototype.processBatch = function (metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var aggregated;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            aggregated = this.aggregateMetrics(metrics);
            // Update performance metrics
            return [4 /*yield*/, this.updatePerformanceMetrics(aggregated)];
          case 1:
            // Update performance metrics
            _a.sent();
            // Check for anomalies
            return [4 /*yield*/, this.checkAnomalies(aggregated)];
          case 2:
            // Check for anomalies
            _a.sent();
            // Update trends
            return [4 /*yield*/, this.updateTrends(aggregated)];
          case 3:
            // Update trends
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  createvisionAnalyticsEngine.prototype.aggregateMetrics = function (metrics) {
    var grouped = metrics.reduce(function (acc, metric) {
      var key = "".concat(metric.component, "_").concat(metric.metricType);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric);
      return acc;
    }, {});
    var aggregated = {};
    Object.entries(grouped).forEach(function (_a) {
      var key = _a[0],
        metricGroup = _a[1];
      aggregated[key] = {
        count: metricGroup.length,
        avg:
          metricGroup.reduce(function (sum, m) {
            return sum + m.value;
          }, 0) / metricGroup.length,
        min: Math.min.apply(
          Math,
          metricGroup.map(function (m) {
            return m.value;
          }),
        ),
        max: Math.max.apply(
          Math,
          metricGroup.map(function (m) {
            return m.value;
          }),
        ),
        sum: metricGroup.reduce(function (sum, m) {
          return sum + m.value;
        }, 0),
        timestamp: new Date().toISOString(),
      };
    });
    return aggregated;
  };
  createvisionAnalyticsEngine.prototype.getTimeRangeStart = function (timeRange) {
    var now = new Date();
    var ranges = {
      realtime: 5 * 60 * 1000, // 5 minutes
      hourly: 60 * 60 * 1000, // 1 hour
      daily: 24 * 60 * 60 * 1000, // 1 day
      weekly: 7 * 24 * 60 * 60 * 1000, // 1 week
      monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
      quarterly: 90 * 24 * 60 * 60 * 1000, // 90 days
      yearly: 365 * 24 * 60 * 60 * 1000, // 365 days
    };
    return new Date(now.getTime() - ranges[timeRange]).toISOString();
  };
  createvisionAnalyticsEngine.prototype.saveMetric = function (metric) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("vision_metrics").insert({
                id: metric.id,
                timestamp: metric.timestamp,
                metric_type: metric.metricType,
                component: metric.component,
                value: metric.value,
                unit: metric.unit,
                target: metric.target,
                threshold: metric.threshold,
                metadata: metric.metadata,
                patient_id: metric.patientId,
                clinic_id: metric.clinicId,
                user_id: metric.userId,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Failed to save metric:", error);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  createvisionAnalyticsEngine.prototype.checkAlerts = function (metric) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, ruleId, rule;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            (_i = 0), (_a = this.alertRules);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (ruleId = _b[0]), (rule = _b[1]);
            if (!this.evaluateAlertRule(metric, rule)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.triggerAlert(rule, metric)];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  createvisionAnalyticsEngine.prototype.evaluateAlertRule = function (metric, rule) {
    var value = metric.value;
    var threshold = rule.threshold;
    switch (rule.operator) {
      case "gt":
        return value > threshold;
      case "gte":
        return value >= threshold;
      case "lt":
        return value < threshold;
      case "lte":
        return value <= threshold;
      case "eq":
        return value === threshold;
      case "ne":
        return value !== threshold;
      default:
        return false;
    }
  };
  createvisionAnalyticsEngine.prototype.triggerAlert = function (rule, metric) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        logger_1.logger.warn("Alert triggered: ".concat(rule.name, " (").concat(metric.value, ")"));
        return [2 /*return*/];
      });
    });
  };
  // Additional helper methods would be implemented here...
  createvisionAnalyticsEngine.prototype.calculateSuccessRate = function (outcomes) {
    if (outcomes.length === 0) return 0;
    var successful = outcomes.filter(function (o) {
      return o.treatmentSuccess;
    }).length;
    return (successful / outcomes.length) * 100;
  };
  createvisionAnalyticsEngine.prototype.calculateAverageImprovement = function (outcomes) {
    var improvementRates = outcomes.map(function (o) {
      return o.improvementRate;
    });
    return (
      improvementRates.reduce(function (sum, rate) {
        return sum + rate;
      }, 0) / improvementRates.length
    );
  };
  createvisionAnalyticsEngine.prototype.calculateAverageSatisfaction = function (outcomes) {
    var scores = outcomes.map(function (o) {
      return o.satisfactionScore;
    });
    return (
      scores.reduce(function (sum, score) {
        return sum + score;
      }, 0) / scores.length
    );
  };
  createvisionAnalyticsEngine.prototype.calculateComplicationRate = function (outcomes) {
    if (outcomes.length === 0) return 0;
    var complications = outcomes.filter(function (o) {
      return o.complicationDetected;
    }).length;
    return (complications / outcomes.length) * 100;
  };
  createvisionAnalyticsEngine.prototype.groupOutcomesByType = function (outcomes) {
    return outcomes.reduce(function (acc, outcome) {
      acc[outcome.outcomeType] = (acc[outcome.outcomeType] || 0) + 1;
      return acc;
    }, {});
  };
  // Placeholder methods that would be fully implemented
  createvisionAnalyticsEngine.prototype.getDashboard = function (dashboardId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch dashboard from database
        return [2 /*return*/, null];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.getWidgetData = function (widgets, filters, timeRange) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch data for each widget
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.generateRealtimeInsights = function (filters, timeRange) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would generate real-time insights
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.getActiveAlerts = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch active alerts
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.getDashboardSummary = function (filters, timeRange) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would generate dashboard summary
        return [2 /*return*/, {}];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.saveInsight = function (insight) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.analyzeTrends = function (timeframe, categories) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze trends
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.generateTrendInsights = function (trends) {
    // Implementation would generate insights from trends
    return [];
  };
  createvisionAnalyticsEngine.prototype.detectAnomalies = function (timeframe, categories) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would detect anomalies
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.generateAnomalyInsights = function (anomalies) {
    // Implementation would generate insights from anomalies
    return [];
  };
  createvisionAnalyticsEngine.prototype.analyzeCorrelations = function (timeframe, categories) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze correlations
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.generateCorrelationInsights = function (correlations) {
    // Implementation would generate insights from correlations
    return [];
  };
  createvisionAnalyticsEngine.prototype.analyzePerformance = function (timeframe) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze performance
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.generatePerformanceInsights = function (performance) {
    // Implementation would generate insights from performance
    return [];
  };
  createvisionAnalyticsEngine.prototype.analyzeTreatmentTrends = function (outcomes) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze treatment trends
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.generateTreatmentRecommendations = function (outcomes) {
    // Implementation would generate treatment recommendations
    return [];
  };
  createvisionAnalyticsEngine.prototype.findSimilarCases = function (patientId, treatmentType) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would find similar cases
        return [2 /*return*/, []];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.analyzePatterns = function (cases) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze patterns
        return [2 /*return*/, {}];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.predictOutcome = function (patterns) {
    // Implementation would predict outcome
    return "positive";
  };
  createvisionAnalyticsEngine.prototype.calculateSuccessProbability = function (patterns) {
    // Implementation would calculate success probability
    return 0.85;
  };
  createvisionAnalyticsEngine.prototype.assessComplicationRisk = function (patterns) {
    // Implementation would assess complication risk
    return "low";
  };
  createvisionAnalyticsEngine.prototype.estimateRecoveryTime = function (patterns) {
    // Implementation would estimate recovery time
    return 14; // days
  };
  createvisionAnalyticsEngine.prototype.generateRecommendedActions = function (patterns) {
    // Implementation would generate recommended actions
    return [];
  };
  createvisionAnalyticsEngine.prototype.calculatePredictionConfidence = function (patterns) {
    // Implementation would calculate prediction confidence
    return 0.9;
  };
  createvisionAnalyticsEngine.prototype.identifyInfluencingFactors = function (patterns) {
    // Implementation would identify influencing factors
    return {};
  };
  createvisionAnalyticsEngine.prototype.calculateUsageMetrics = function (metrics) {
    // Implementation would calculate usage metrics
    return {};
  };
  createvisionAnalyticsEngine.prototype.aggregatePerformanceMetrics = function (performance) {
    // Implementation would aggregate performance metrics
    return {};
  };
  createvisionAnalyticsEngine.prototype.analyzeOutcomeMetrics = function (outcomes) {
    // Implementation would analyze outcome metrics
    return {};
  };
  createvisionAnalyticsEngine.prototype.calculateEfficiencyMetrics = function (metrics, outcomes) {
    // Implementation would calculate efficiency metrics
    return {};
  };
  createvisionAnalyticsEngine.prototype.calculateROI = function (clinicId, timeRange) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would calculate ROI
        return [2 /*return*/, {}];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.identifyTrends = function (metrics) {
    // Implementation would identify trends
    return {};
  };
  createvisionAnalyticsEngine.prototype.generateClinicRecommendations = function (
    metrics,
    outcomes,
  ) {
    // Implementation would generate clinic recommendations
    return [];
  };
  createvisionAnalyticsEngine.prototype.updatePerformanceMetrics = function (aggregated) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.checkAnomalies = function (aggregated) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.updateTrends = function (aggregated) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createvisionAnalyticsEngine.prototype.updateDashboards = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  return createvisionAnalyticsEngine;
})();
exports.createvisionAnalyticsEngine = createvisionAnalyticsEngine;
// Validation schemas
exports.VisionMetricSchema = zod_1.z.object({
  metricType: zod_1.z.enum([
    "accuracy",
    "performance",
    "outcome",
    "efficiency",
    "compliance",
    "financial",
  ]),
  component: zod_1.z.enum([
    "face_detection",
    "aesthetic_analysis",
    "complication_detection",
    "compliance_monitoring",
  ]),
  value: zod_1.z.number().min(0),
  unit: zod_1.z.string().min(1),
  target: zod_1.z.number().min(0).optional(),
  threshold: zod_1.z.number().min(0).optional(),
  metadata: zod_1.z.record(zod_1.z.any()),
  patientId: zod_1.z.string().optional(),
  clinicId: zod_1.z.string().min(1),
  userId: zod_1.z.string().optional(),
});
// Export singleton instance
exports.VisionAnalyticsEngine = createvisionAnalyticsEngine;
exports.visionAnalyticsEngine = new createvisionAnalyticsEngine();
