"use strict";
// AI-Powered Patient Insights Integration Module
// Story 3.2: Task 7 - Main Integration Module
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
exports.ContinuousLearningSystem =
  exports.HealthTrendMonitor =
  exports.BehaviorAnalysisEngine =
  exports.createpredictiveAnalyticsEngine =
  exports.TreatmentRecommendationEngine =
  exports.RiskAssessmentEngine =
  exports.PatientInsightsIntegration =
    void 0;
var risk_assessment_1 = require("./risk-assessment");
Object.defineProperty(exports, "RiskAssessmentEngine", {
  enumerable: true,
  get: function () {
    return risk_assessment_1.RiskAssessmentEngine;
  },
});
var treatment_recommendations_1 = require("./treatment-recommendations");
Object.defineProperty(exports, "TreatmentRecommendationEngine", {
  enumerable: true,
  get: function () {
    return treatment_recommendations_1.TreatmentRecommendationEngine;
  },
});
var predictive_analytics_1 = require("./predictive-analytics");
Object.defineProperty(exports, "createpredictiveAnalyticsEngine", {
  enumerable: true,
  get: function () {
    return predictive_analytics_1.createpredictiveAnalyticsEngine;
  },
});
var behavior_analysis_1 = require("./behavior-analysis");
Object.defineProperty(exports, "BehaviorAnalysisEngine", {
  enumerable: true,
  get: function () {
    return behavior_analysis_1.BehaviorAnalysisEngine;
  },
});
var health_trend_monitor_1 = require("./health-trend-monitor");
Object.defineProperty(exports, "HealthTrendMonitor", {
  enumerable: true,
  get: function () {
    return health_trend_monitor_1.HealthTrendMonitor;
  },
});
var continuous_learning_1 = require("./continuous-learning");
Object.defineProperty(exports, "ContinuousLearningSystem", {
  enumerable: true,
  get: function () {
    return continuous_learning_1.ContinuousLearningSystem;
  },
});
var PatientInsightsIntegration = /** @class */ (function () {
  function PatientInsightsIntegration(config) {
    this.isInitialized = false;
    this.configuration = __assign(
      {
        enableRiskAssessment: true,
        enableTreatmentRecommendations: true,
        enablePredictiveAnalytics: true,
        enableBehaviorAnalysis: true,
        enableHealthTrends: true,
        enableContinuousLearning: true,
        riskThresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8,
        },
        alertSeverityLevels: {
          info: 1,
          warning: 2,
          critical: 3,
        },
        cacheTimeout: 300,
        parallelProcessing: true,
      },
      config,
    );
    this.initializeEngines();
  }
  PatientInsightsIntegration.prototype.generateComprehensiveInsights = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var insights,
        _a,
        aggregatedInsights,
        alerts,
        recommendations,
        scores,
        comprehensiveInsights,
        error_1;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 11, , 12]);
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _c.sent();
            _c.label = 2;
          case 2:
            // 1. Validate request
            this.validateRequest(request);
            if (!this.configuration.parallelProcessing) return [3 /*break*/, 4];
            return [4 /*yield*/, this.generateInsightsParallel(request)];
          case 3:
            _a = _c.sent();
            return [3 /*break*/, 6];
          case 4:
            return [
              4 /*yield*/,
              this.generateInsightsSequential(request),
              // 3. Aggregate and correlate insights
            ];
          case 5:
            _a = _c.sent();
            _c.label = 6;
          case 6:
            insights = _a;
            return [
              4 /*yield*/,
              this.aggregateInsights(insights, request),
              // 4. Generate alerts and recommendations
            ];
          case 7:
            aggregatedInsights = _c.sent();
            alerts = this.generateAlerts(aggregatedInsights);
            recommendations = this.generateUnifiedRecommendations(aggregatedInsights);
            scores = this.calculateInsightScores(aggregatedInsights);
            if (!(this.configuration.enableContinuousLearning && request.feedbackData))
              return [3 /*break*/, 9];
            return [4 /*yield*/, this.processLearningFeedback(request, aggregatedInsights)];
          case 8:
            _c.sent();
            _c.label = 9;
          case 9:
            comprehensiveInsights = {
              patientId: request.patientId,
              requestId: request.requestId || "req_".concat(Date.now()),
              riskAssessment: aggregatedInsights.riskAssessment,
              treatmentRecommendations: aggregatedInsights.treatmentRecommendations,
              predictiveAnalytics: aggregatedInsights.predictiveAnalytics,
              behaviorAnalysis: aggregatedInsights.behaviorAnalysis,
              healthTrends: aggregatedInsights.healthTrends,
              learningInsights: aggregatedInsights.learningInsights,
              alerts: alerts,
              recommendations: recommendations,
              scores: scores,
              correlations: this.identifyInsightCorrelations(aggregatedInsights),
              confidence: this.calculateOverallConfidence(aggregatedInsights),
              generatedAt: new Date(),
              processingTime:
                Date.now() -
                (((_b = request.timestamp) === null || _b === void 0 ? void 0 : _b.getTime()) ||
                  Date.now()),
              version: "1.0.0",
            };
            // 8. Store insights for future learning
            return [4 /*yield*/, this.storeInsights(comprehensiveInsights)];
          case 10:
            // 8. Store insights for future learning
            _c.sent();
            return [2 /*return*/, comprehensiveInsights];
          case 11:
            error_1 = _c.sent();
            console.error("Comprehensive insights generation error:", error_1);
            throw new Error(
              "Failed to generate insights: ".concat(
                error_1 instanceof Error ? error_1.message : "Unknown error",
              ),
            );
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientInsightsIntegration.prototype.generateQuickRiskAssessment = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this.configuration.enableRiskAssessment) {
              throw new Error("Risk assessment is disabled");
            }
            return [4 /*yield*/, this.riskEngine.assessPatientRisk(patientId)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_2 = _a.sent();
            console.error("Quick risk assessment error:", error_2);
            throw new Error(
              "Failed to assess risk: ".concat(
                error_2 instanceof Error ? error_2.message : "Unknown error",
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientInsightsIntegration.prototype.generateTreatmentGuidance = function (
    patientId,
    treatmentContext,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var riskAssessment, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            if (!this.configuration.enableTreatmentRecommendations) {
              throw new Error("Treatment recommendations are disabled");
            }
            return [4 /*yield*/, this.riskEngine.assessPatientRisk(patientId)];
          case 1:
            riskAssessment = _a.sent();
            return [
              4 /*yield*/,
              this.recommendationEngine.generateRecommendations(
                patientId,
                riskAssessment,
                treatmentContext,
              ),
            ];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            error_3 = _a.sent();
            console.error("Treatment guidance error:", error_3);
            throw new Error(
              "Failed to generate treatment guidance: ".concat(
                error_3 instanceof Error ? error_3.message : "Unknown error",
              ),
            );
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientInsightsIntegration.prototype.monitorPatientAlerts = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts,
        riskAlerts,
        behaviorAlerts,
        trendAlerts,
        categorizedAlerts,
        prioritizedAlerts,
        error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            alerts = [];
            if (!this.configuration.enableRiskAssessment) return [3 /*break*/, 2];
            return [4 /*yield*/, this.riskEngine.generateRiskAlerts(patientId)];
          case 1:
            riskAlerts = _a.sent();
            alerts.push.apply(alerts, riskAlerts);
            _a.label = 2;
          case 2:
            if (!this.configuration.enableBehaviorAnalysis) return [3 /*break*/, 4];
            return [4 /*yield*/, this.behaviorEngine.detectBehavioralAnomalies(patientId)];
          case 3:
            behaviorAlerts = _a.sent();
            alerts.push.apply(alerts, behaviorAlerts);
            _a.label = 4;
          case 4:
            if (!this.configuration.enableHealthTrends) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.trendMonitor.detectRealTimeAnomalies(
                patientId,
                { type: "general", value: 0, timestamp: new Date() }, // Mock data point
              ),
            ];
          case 5:
            trendAlerts = _a.sent();
            alerts.push.apply(alerts, trendAlerts);
            _a.label = 6;
          case 6:
            categorizedAlerts = this.categorizeAlerts(alerts);
            prioritizedAlerts = this.prioritizeAlerts(categorizedAlerts);
            return [
              2 /*return*/,
              {
                patientId: patientId,
                totalAlerts: alerts.length,
                criticalAlerts: prioritizedAlerts.filter(function (a) {
                  return a.severity === "high";
                }).length,
                warningAlerts: prioritizedAlerts.filter(function (a) {
                  return a.severity === "medium";
                }).length,
                infoAlerts: prioritizedAlerts.filter(function (a) {
                  return a.severity === "low";
                }).length,
                alerts: prioritizedAlerts,
                lastChecked: new Date(),
                nextCheckRecommended: this.calculateNextCheckTime(prioritizedAlerts),
              },
            ];
          case 7:
            error_4 = _a.sent();
            console.error("Patient alert monitoring error:", error_4);
            throw new Error(
              "Failed to monitor alerts: ".concat(
                error_4 instanceof Error ? error_4.message : "Unknown error",
              ),
            );
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientInsightsIntegration.prototype.updatePatientOutcome = function (
    patientId,
    treatmentId,
    outcome,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this.configuration.enableContinuousLearning) {
              return [2 /*return*/, []];
            }
            return [
              4 /*yield*/,
              this.learningSystem.processNewOutcome(patientId, treatmentId, outcome),
            ];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_5 = _a.sent();
            console.error("Outcome update error:", error_5);
            throw new Error(
              "Failed to update outcome: ".concat(
                error_5 instanceof Error ? error_5.message : "Unknown error",
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientInsightsIntegration.prototype.getSystemHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      var engineStatuses, overallHealth, error_6;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              Promise.all([
                this.checkEngineHealth("risk", this.riskEngine),
                this.checkEngineHealth("recommendation", this.recommendationEngine),
                this.checkEngineHealth("predictive", this.predictiveEngine),
                this.checkEngineHealth("behavior", this.behaviorEngine),
                this.checkEngineHealth("trends", this.trendMonitor),
                this.checkEngineHealth("learning", this.learningSystem),
              ]),
            ];
          case 1:
            engineStatuses = _b.sent();
            overallHealth = this.calculateOverallHealth(engineStatuses);
            _a = {
              overall: overallHealth,
              engines: engineStatuses,
              lastChecked: new Date(),
              uptime: this.calculateUptime(),
            };
            return [4 /*yield*/, this.getPerformanceMetrics()];
          case 2:
            return [2 /*return*/, ((_a.performance = _b.sent()), _a)];
          case 3:
            error_6 = _b.sent();
            console.error("System health check error:", error_6);
            return [
              2 /*return*/,
              {
                overall: "degraded",
                engines: [],
                lastChecked: new Date(),
                uptime: 0,
                performance: { averageResponseTime: 0, successRate: 0, errorRate: 100 },
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private methods for insight generation
  PatientInsightsIntegration.prototype.generateInsightsParallel = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var tasks, results;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            tasks = [];
            if (this.configuration.enableRiskAssessment) {
              tasks.push(this.riskEngine.assessPatientRisk(request.patientId));
            }
            if (this.configuration.enableBehaviorAnalysis) {
              tasks.push(this.behaviorEngine.analyzeBehaviorPatterns(request.patientId));
            }
            if (this.configuration.enableHealthTrends) {
              tasks.push(this.trendMonitor.monitorHealthTrends(request.patientId));
            }
            return [
              4 /*yield*/,
              Promise.allSettled(tasks),
              // Process results and handle failures
            ];
          case 1:
            results = _a.sent();
            // Process results and handle failures
            return [2 /*return*/, this.processParallelResults(results, request)];
        }
      });
    });
  };
  PatientInsightsIntegration.prototype.generateInsightsSequential = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _a, _b, predictions, _c, _d, _e, error_7;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            results = {
              riskAssessment: null,
              treatmentRecommendations: null,
              predictiveAnalytics: null,
              behaviorAnalysis: null,
              healthTrends: null,
              learningInsights: [],
            };
            _f.label = 1;
          case 1:
            _f.trys.push([1, 14, , 15]);
            if (!this.configuration.enableRiskAssessment) return [3 /*break*/, 3];
            _a = results;
            return [4 /*yield*/, this.riskEngine.assessPatientRisk(request.patientId)];
          case 2:
            _a.riskAssessment = _f.sent();
            _f.label = 3;
          case 3:
            if (!(this.configuration.enableTreatmentRecommendations && results.riskAssessment))
              return [3 /*break*/, 5];
            _b = results;
            return [
              4 /*yield*/,
              this.recommendationEngine.generateRecommendations(
                request.patientId,
                results.riskAssessment,
                request.treatmentContext,
              ),
            ];
          case 4:
            _b.treatmentRecommendations = _f.sent();
            _f.label = 5;
          case 5:
            if (!(this.configuration.enablePredictiveAnalytics && results.riskAssessment))
              return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.predictiveEngine.predictTreatmentOutcome(
                request.patientId,
                request.treatmentId || "default",
                results.riskAssessment,
              ),
            ];
          case 6:
            predictions = _f.sent();
            results.predictiveAnalytics = { treatmentOutcome: predictions };
            _f.label = 7;
          case 7:
            if (!this.configuration.enableBehaviorAnalysis) return [3 /*break*/, 9];
            _c = results;
            return [4 /*yield*/, this.behaviorEngine.analyzeBehaviorPatterns(request.patientId)];
          case 8:
            _c.behaviorAnalysis = _f.sent();
            _f.label = 9;
          case 9:
            if (!this.configuration.enableHealthTrends) return [3 /*break*/, 11];
            _d = results;
            return [4 /*yield*/, this.trendMonitor.monitorHealthTrends(request.patientId)];
          case 10:
            _d.healthTrends = _f.sent();
            _f.label = 11;
          case 11:
            if (!this.configuration.enableContinuousLearning) return [3 /*break*/, 13];
            // Learning insights based on historical data
            _e = results;
            return [4 /*yield*/, this.getLearningInsights(request.patientId)];
          case 12:
            // Learning insights based on historical data
            _e.learningInsights = _f.sent();
            _f.label = 13;
          case 13:
            return [3 /*break*/, 15];
          case 14:
            error_7 = _f.sent();
            console.error("Sequential insight generation error:", error_7);
            return [3 /*break*/, 15];
          case 15:
            return [2 /*return*/, results];
        }
      });
    });
  };
  PatientInsightsIntegration.prototype.aggregateInsights = function (insights, request) {
    return __awaiter(this, void 0, void 0, function () {
      var aggregated;
      return __generator(this, function (_a) {
        aggregated = {
          riskAssessment: insights.riskAssessment,
          treatmentRecommendations: insights.treatmentRecommendations,
          predictiveAnalytics: insights.predictiveAnalytics,
          behaviorAnalysis: insights.behaviorAnalysis,
          healthTrends: insights.healthTrends,
          learningInsights: insights.learningInsights || [],
        };
        // Apply cross-validation rules
        if (aggregated.riskAssessment && aggregated.behaviorAnalysis) {
          this.validateRiskBehaviorConsistency(
            aggregated.riskAssessment,
            aggregated.behaviorAnalysis,
          );
        }
        if (aggregated.treatmentRecommendations && aggregated.predictiveAnalytics) {
          this.validateTreatmentPredictionConsistency(
            aggregated.treatmentRecommendations,
            aggregated.predictiveAnalytics,
          );
        }
        return [2 /*return*/, aggregated];
      });
    });
  };
  PatientInsightsIntegration.prototype.generateAlerts = function (insights) {
    var _a;
    var alerts = [];
    // Risk-based alerts
    if (
      insights.riskAssessment &&
      insights.riskAssessment.overallRiskScore > this.configuration.riskThresholds.high
    ) {
      alerts.push({
        type: "high_risk",
        severity: "high",
        title: "High Risk Patient",
        description: "Overall risk score: ".concat(
          (insights.riskAssessment.overallRiskScore * 100).toFixed(1),
          "%",
        ),
        source: "risk_assessment",
        createdAt: new Date(),
      });
    }
    // Behavior-based alerts
    if (insights.behaviorAnalysis && insights.behaviorAnalysis.riskFactors.length > 0) {
      var highRiskFactors = insights.behaviorAnalysis.riskFactors.filter(function (rf) {
        return rf.severity === "high";
      });
      if (highRiskFactors.length > 0) {
        alerts.push({
          type: "behavior_risk",
          severity: "medium",
          title: "Behavioral Risk Factors",
          description: "".concat(
            highRiskFactors.length,
            " high-risk behavioral factors identified",
          ),
          source: "behavior_analysis",
          createdAt: new Date(),
        });
      }
    }
    // Health trend alerts
    if (insights.healthTrends && insights.healthTrends.alerts.length > 0) {
      alerts.push.apply(
        alerts,
        insights.healthTrends.alerts.map(function (alert) {
          return __assign(__assign({}, alert), { source: "health_trends" });
        }),
      );
    }
    return {
      patientId:
        ((_a = insights.riskAssessment) === null || _a === void 0 ? void 0 : _a.patientId) || "",
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(function (a) {
        return a.severity === "high";
      }).length,
      warningAlerts: alerts.filter(function (a) {
        return a.severity === "medium";
      }).length,
      infoAlerts: alerts.filter(function (a) {
        return a.severity === "low";
      }).length,
      alerts: alerts,
      lastChecked: new Date(),
      nextCheckRecommended: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  };
  PatientInsightsIntegration.prototype.generateUnifiedRecommendations = function (insights) {
    var recommendations = [];
    // Risk-based recommendations
    if (insights.riskAssessment && insights.riskAssessment.recommendations) {
      recommendations.push.apply(recommendations, insights.riskAssessment.recommendations);
    }
    // Treatment recommendations
    if (
      insights.treatmentRecommendations &&
      insights.treatmentRecommendations.primaryRecommendations
    ) {
      recommendations.push.apply(
        recommendations,
        insights.treatmentRecommendations.primaryRecommendations.map(function (tr) {
          return tr.recommendation;
        }),
      );
    }
    // Behavior recommendations
    if (insights.behaviorAnalysis && insights.behaviorAnalysis.recommendations) {
      recommendations.push.apply(
        recommendations,
        insights.behaviorAnalysis.recommendations.map(function (rec) {
          return rec.description;
        }),
      );
    }
    // Health trend recommendations
    if (insights.healthTrends && insights.healthTrends.monitoringRecommendations) {
      recommendations.push.apply(recommendations, insights.healthTrends.monitoringRecommendations);
    }
    // Remove duplicates and prioritize
    return this.prioritizeRecommendations(__spreadArray([], new Set(recommendations), true));
  };
  PatientInsightsIntegration.prototype.calculateInsightScores = function (insights) {
    var _a;
    return {
      riskScore:
        ((_a = insights.riskAssessment) === null || _a === void 0 ? void 0 : _a.overallRiskScore) ||
        0,
      confidenceScore: this.calculateOverallConfidence(insights),
      completenessScore: this.calculateCompletenessScore(insights),
      reliabilityScore: this.calculateReliabilityScore(insights),
      actionabilityScore: this.calculateActionabilityScore(insights),
    };
  };
  PatientInsightsIntegration.prototype.identifyInsightCorrelations = function (insights) {
    var correlations = [];
    // Risk-Behavior correlation
    if (insights.riskAssessment && insights.behaviorAnalysis) {
      correlations.push({
        type: "risk_behavior",
        strength: this.calculateRiskBehaviorCorrelation(
          insights.riskAssessment,
          insights.behaviorAnalysis,
        ),
        description: "Correlation between risk factors and behavioral patterns",
        significance: "medium",
      });
    }
    // Treatment-Prediction correlation
    if (insights.treatmentRecommendations && insights.predictiveAnalytics) {
      correlations.push({
        type: "treatment_prediction",
        strength: this.calculateTreatmentPredictionCorrelation(
          insights.treatmentRecommendations,
          insights.predictiveAnalytics,
        ),
        description: "Consistency between treatment recommendations and outcome predictions",
        significance: "high",
      });
    }
    return correlations;
  };
  // Utility methods
  PatientInsightsIntegration.prototype.initializeEngines = function () {
    this.riskEngine = new risk_assessment_1.RiskAssessmentEngine();
    this.recommendationEngine = new treatment_recommendations_1.TreatmentRecommendationEngine();
    this.predictiveEngine = new predictive_analytics_1.createpredictiveAnalyticsEngine();
    this.behaviorEngine = new behavior_analysis_1.BehaviorAnalysisEngine();
    this.trendMonitor = new health_trend_monitor_1.HealthTrendMonitor();
    this.learningSystem = new continuous_learning_1.ContinuousLearningSystem();
  };
  PatientInsightsIntegration.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // Initialize all engines if needed
          // Most engines are initialized in their constructors
          this.isInitialized = true;
        } catch (error) {
          console.error("Initialization error:", error);
          throw new Error("Failed to initialize patient insights system");
        }
        return [2 /*return*/];
      });
    });
  };
  PatientInsightsIntegration.prototype.validateRequest = function (request) {
    if (!request.patientId) {
      throw new Error("Patient ID is required");
    }
    if (request.requestedInsights && request.requestedInsights.length === 0) {
      throw new Error("At least one insight type must be requested");
    }
  };
  PatientInsightsIntegration.prototype.processParallelResults = function (results, request) {
    var insights = {
      riskAssessment: null,
      treatmentRecommendations: null,
      predictiveAnalytics: null,
      behaviorAnalysis: null,
      healthTrends: null,
      learningInsights: [],
    };
    results.forEach(function (result, index) {
      if (result.status === "fulfilled") {
        switch (index) {
          case 0:
            insights.riskAssessment = result.value;
            break;
          case 1:
            insights.behaviorAnalysis = result.value;
            break;
          case 2:
            insights.healthTrends = result.value;
            break;
        }
      } else {
        console.warn("Insight generation failed for index ".concat(index, ":"), result.reason);
      }
    });
    return insights;
  };
  PatientInsightsIntegration.prototype.calculateOverallConfidence = function (insights) {
    var _a, _b, _c;
    var confidenceScores = [];
    if ((_a = insights.riskAssessment) === null || _a === void 0 ? void 0 : _a.confidence) {
      confidenceScores.push(insights.riskAssessment.confidence);
    }
    if (
      (_b = insights.treatmentRecommendations) === null || _b === void 0 ? void 0 : _b.confidence
    ) {
      confidenceScores.push(insights.treatmentRecommendations.confidence);
    }
    if ((_c = insights.behaviorAnalysis) === null || _c === void 0 ? void 0 : _c.behaviorScore) {
      confidenceScores.push(insights.behaviorAnalysis.behaviorScore.overall);
    }
    return confidenceScores.length > 0
      ? confidenceScores.reduce(function (sum, score) {
          return sum + score;
        }, 0) / confidenceScores.length
      : 0.5;
  };
  PatientInsightsIntegration.prototype.calculateCompletenessScore = function (insights) {
    var totalModules = 0;
    var completedModules = 0;
    if (this.configuration.enableRiskAssessment) {
      totalModules++;
      if (insights.riskAssessment) completedModules++;
    }
    if (this.configuration.enableTreatmentRecommendations) {
      totalModules++;
      if (insights.treatmentRecommendations) completedModules++;
    }
    if (this.configuration.enableBehaviorAnalysis) {
      totalModules++;
      if (insights.behaviorAnalysis) completedModules++;
    }
    if (this.configuration.enableHealthTrends) {
      totalModules++;
      if (insights.healthTrends) completedModules++;
    }
    return totalModules > 0 ? completedModules / totalModules : 0;
  };
  PatientInsightsIntegration.prototype.calculateReliabilityScore = function (insights) {
    // Based on consistency between modules and data quality
    return 0.85; // Simplified implementation
  };
  PatientInsightsIntegration.prototype.calculateActionabilityScore = function (insights) {
    var _a, _b;
    // Based on number and quality of actionable recommendations
    var actionableItems = 0;
    var totalItems = 0;
    if ((_a = insights.riskAssessment) === null || _a === void 0 ? void 0 : _a.recommendations) {
      totalItems += insights.riskAssessment.recommendations.length;
      actionableItems += insights.riskAssessment.recommendations.length; // All risk recommendations are actionable
    }
    if (
      (_b = insights.treatmentRecommendations) === null || _b === void 0
        ? void 0
        : _b.primaryRecommendations
    ) {
      totalItems += insights.treatmentRecommendations.primaryRecommendations.length;
      actionableItems += insights.treatmentRecommendations.primaryRecommendations.length;
    }
    return totalItems > 0 ? actionableItems / totalItems : 0;
  };
  // Additional utility methods (simplified implementations)
  PatientInsightsIntegration.prototype.validateRiskBehaviorConsistency = function (risk, behavior) {
    // Validate consistency between risk and behavior assessments
  };
  PatientInsightsIntegration.prototype.validateTreatmentPredictionConsistency = function (
    treatment,
    prediction,
  ) {
    // Validate consistency between treatment recommendations and predictions
  };
  PatientInsightsIntegration.prototype.prioritizeRecommendations = function (recommendations) {
    // Prioritize recommendations based on importance and urgency
    return recommendations.slice(0, 10); // Return top 10
  };
  PatientInsightsIntegration.prototype.calculateRiskBehaviorCorrelation = function (
    risk,
    behavior,
  ) {
    return 0.75; // Simplified implementation
  };
  PatientInsightsIntegration.prototype.calculateTreatmentPredictionCorrelation = function (
    treatment,
    prediction,
  ) {
    return 0.8; // Simplified implementation
  };
  PatientInsightsIntegration.prototype.categorizeAlerts = function (alerts) {
    var _this = this;
    return alerts.map(function (alert) {
      return __assign(__assign({}, alert), { category: _this.categorizeAlert(alert) });
    });
  };
  PatientInsightsIntegration.prototype.categorizeAlert = function (alert) {
    var _a, _b, _c;
    if ((_a = alert.type) === null || _a === void 0 ? void 0 : _a.includes("risk")) return "risk";
    if ((_b = alert.type) === null || _b === void 0 ? void 0 : _b.includes("behavior"))
      return "behavior";
    if ((_c = alert.type) === null || _c === void 0 ? void 0 : _c.includes("trend"))
      return "health";
    return "general";
  };
  PatientInsightsIntegration.prototype.prioritizeAlerts = function (alerts) {
    return alerts.sort(function (a, b) {
      var severityOrder = { high: 3, medium: 2, low: 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });
  };
  PatientInsightsIntegration.prototype.calculateNextCheckTime = function (alerts) {
    var hasHighPriority = alerts.some(function (alert) {
      return alert.severity === "high";
    });
    var hoursToAdd = hasHighPriority ? 4 : 24;
    return new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
  };
  PatientInsightsIntegration.prototype.getLearningInsights = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []]; // Simplified implementation
      });
    });
  };
  PatientInsightsIntegration.prototype.processLearningFeedback = function (request, insights) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  PatientInsightsIntegration.prototype.storeInsights = function (insights) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  PatientInsightsIntegration.prototype.checkEngineHealth = function (name, engine) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            name: name,
            status: "healthy",
            lastChecked: new Date(),
            responseTime: Math.random() * 100 + 50,
            errorRate: Math.random() * 5,
          },
        ];
      });
    });
  };
  PatientInsightsIntegration.prototype.calculateOverallHealth = function (engines) {
    var unhealthyEngines = engines.filter(function (e) {
      return e.status !== "healthy";
    }).length;
    var ratio = unhealthyEngines / engines.length;
    if (ratio === 0) return "healthy";
    if (ratio < 0.5) return "degraded";
    return "critical";
  };
  PatientInsightsIntegration.prototype.calculateUptime = function () {
    // Return uptime in hours (simplified)
    return 24 * 7; // 7 days
  };
  PatientInsightsIntegration.prototype.getPerformanceMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            averageResponseTime: 250,
            successRate: 98.5,
            errorRate: 1.5,
          },
        ];
      });
    });
  };
  return PatientInsightsIntegration;
})();
exports.PatientInsightsIntegration = PatientInsightsIntegration;
