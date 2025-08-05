"use strict";
// Trial-Analytics Integration Layer - STORY-SUB-002 Task 3
// Connects trial management system with analytics for comprehensive tracking
// Created: 2025-01-22
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialAnalyticsIntegration = void 0;
var analytics_1 = require("../analytics");
var index_1 = require("./index");
var TrialAnalyticsIntegration = /** @class */ (function () {
  function TrialAnalyticsIntegration() {
    this.trialManager = index_1.TrialManager;
    this.analytics = new analytics_1.AnalyticsService();
  }
  /**
   * Track trial conversion events in analytics
   */
  TrialAnalyticsIntegration.prototype.trackTrialConversion = function (trial, conversionData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.analytics.trackConversion({
                userId: trial.userId,
                trialId: trial.id,
                conversionType: "trial_to_paid",
                value: conversionData.amount || 0,
                metadata: {
                  trialStage: trial.stage,
                  daysInTrial: this.calculateTrialDays(trial),
                  source: conversionData.source,
                  campaign: conversionData.campaign,
                  feature: conversionData.feature,
                  conversionScore: trial.metadata.conversionScore,
                },
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Sync trial journey events with analytics
   */
  TrialAnalyticsIntegration.prototype.syncJourneyEvents = function (journey) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, event_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_i = 0), (_a = journey.events);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            event_1 = _a[_i];
            return [
              4 /*yield*/,
              this.analytics.trackEvent({
                userId: journey.userId,
                eventType: "trial_".concat(event_1.type),
                timestamp: event_1.timestamp,
                properties: __assign(
                  { trialId: journey.trialId, stage: event_1.stage },
                  event_1.data,
                ),
              }),
            ];
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
  }; /**
   * Generate comprehensive trial metrics for dashboard
   */
  TrialAnalyticsIntegration.prototype.generateTrialMetrics = function (timeRange) {
    return __awaiter(this, void 0, void 0, function () {
      var trialMetrics;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.analytics.getTrialMetrics(timeRange)];
          case 1:
            trialMetrics = _a.sent();
            return [
              2 /*return*/,
              {
                totalTrials: trialMetrics.total_trials,
                activeTrials: trialMetrics.active_trials,
                conversionRate: trialMetrics.conversion_rate,
                averageTrialDuration: trialMetrics.avg_trial_duration,
                topConversionSources: trialMetrics.top_sources,
                stageDistribution: {
                  onboarding: trialMetrics.stage_onboarding,
                  exploring: trialMetrics.stage_exploring,
                  engaged: trialMetrics.stage_engaged,
                  converting: trialMetrics.stage_converting,
                  churning: trialMetrics.stage_churning,
                },
                aiPredictions: {
                  predictedConversions: trialMetrics.predicted_conversions,
                  highRiskTrials: trialMetrics.high_risk_trials,
                  recommendedInterventions: trialMetrics.recommended_interventions,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Track campaign performance with trial outcomes
   */
  TrialAnalyticsIntegration.prototype.trackCampaignOutcome = function (campaignId, outcome) {
    return __awaiter(this, void 0, void 0, function () {
      var trial;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.analytics.trackEvent({
                eventType: "campaign_outcome",
                properties: {
                  campaignId: campaignId,
                  trialId: outcome.trialId,
                  action: outcome.action,
                  value: outcome.value || 0,
                  timestamp: new Date(),
                },
              }),
              // Update campaign metrics
            ];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.trialManager.getUserTrial(outcome.trialId)];
          case 2:
            trial = _a.sent();
            if (!trial) return [3 /*break*/, 4];
            return [4 /*yield*/, this.updateCampaignMetrics(campaignId, trial, outcome.action)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get AI-powered insights for trial optimization
   */
  TrialAnalyticsIntegration.prototype.getTrialOptimizationInsights = function (trialId) {
    return __awaiter(this, void 0, void 0, function () {
      var prediction, journey, analyticsData;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.trialManager.predictConversion(trialId)];
          case 1:
            prediction = _b.sent();
            return [4 /*yield*/, this.trialManager.getUserJourney(trialId)];
          case 2:
            journey = _b.sent();
            return [4 /*yield*/, this.analytics.getUserAnalytics(journey.userId)];
          case 3:
            analyticsData = _b.sent();
            _a = {
              conversionProbability: prediction.probability,
              riskFactors: prediction.factors.filter(function (f) {
                return f.impact < 0;
              }),
              opportunities: prediction.factors.filter(function (f) {
                return f.impact > 0;
              }),
              recommendedActions: prediction.recommendations,
              journeyInsights: this.analyzeJourneyPatterns(journey),
            };
            return [4 /*yield*/, this.compareWithBenchmarks(trialId)];
          case 4:
            return [2 /*return*/, ((_a.benchmarkComparison = _b.sent()), _a)];
        }
      });
    });
  };
  /**
   * Update real-time trial dashboard data
   */
  TrialAnalyticsIntegration.prototype.updateTrialDashboard = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, last24h, last7d, _a, daily, weekly;
      var _b, _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            now = new Date();
            last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              Promise.all([
                this.generateTrialMetrics({ start: last24h, end: now }),
                this.generateTrialMetrics({ start: last7d, end: now }),
              ]),
            ];
          case 1:
            (_a = _e.sent()), (daily = _a[0]), (weekly = _a[1]);
            _b = {};
            _c = {
              activeTrials: daily.activeTrials,
              todayConversions: daily.totalTrials * daily.conversionRate,
            };
            return [4 /*yield*/, this.calculateAverageEngagement(last24h)];
          case 2:
            _b.realTime = ((_c.averageEngagement = _e.sent()), _c);
            _d = {
              conversionTrend: this.calculateTrend(daily.conversionRate, weekly.conversionRate),
              trialVolumeTrend: this.calculateTrend(daily.totalTrials, weekly.totalTrials),
            };
            return [4 /*yield*/, this.calculateEngagementTrend(last7d)];
          case 3:
            return [
              2 /*return*/,
              ((_b.trends = ((_d.engagementTrend = _e.sent()), _d)),
              (_b.predictions = weekly.aiPredictions),
              _b),
            ];
        }
      });
    });
  };
  // Helper methods
  TrialAnalyticsIntegration.prototype.calculateTrialDays = function (trial) {
    return Math.floor((Date.now() - trial.startDate.getTime()) / (1000 * 60 * 60 * 24));
  };
  TrialAnalyticsIntegration.prototype.updateCampaignMetrics = function (campaignId, trial, action) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  TrialAnalyticsIntegration.prototype.analyzeJourneyPatterns = function (journey) {
    return {
      engagementScore: this.calculateEngagementScore(journey.events),
      criticalEvents: journey.events.filter(function (e) {
        return e.type === "feature_discovered" || e.type === "milestone_reached";
      }),
      timeToValue: this.calculateTimeToValue(journey),
      dropOffPoints: this.identifyDropOffPoints(journey),
    };
  };
  TrialAnalyticsIntegration.prototype.compareWithBenchmarks = function (trialId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would compare trial performance with industry benchmarks
        return [
          2 /*return*/,
          {
            conversionRateVsBenchmark: 0.15, // 15% above benchmark
            engagementVsBenchmark: 0.08, // 8% above benchmark
            timeToConvertVsBenchmark: -0.12, // 12% faster than benchmark
          },
        ];
      });
    });
  };
  TrialAnalyticsIntegration.prototype.calculateEngagementScore = function (events) {
    var weights = {
      login: 1,
      feature_used: 3,
      feature_discovered: 2,
      milestone_reached: 5,
      support_contacted: -1,
      error_encountered: -2,
    };
    return events.reduce(function (score, event) {
      return score + (weights[event.type] || 0);
    }, 0);
  };
  TrialAnalyticsIntegration.prototype.calculateTimeToValue = function (journey) {
    var firstValueEvent = journey.events.find(function (e) {
      return e.type === "feature_used" || e.type === "milestone_reached";
    });
    if (!firstValueEvent) return -1;
    return firstValueEvent.timestamp.getTime() - journey.startDate.getTime();
  };
  TrialAnalyticsIntegration.prototype.identifyDropOffPoints = function (journey) {
    var dropOffs = [];
    var events = journey.events.sort(function (a, b) {
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
    for (var i = 1; i < events.length; i++) {
      var timeDiff = events[i].timestamp.getTime() - events[i - 1].timestamp.getTime();
      if (timeDiff > 24 * 60 * 60 * 1000) {
        // More than 24 hours gap
        dropOffs.push(events[i - 1].stage);
      }
    }
    return dropOffs;
  };
  TrialAnalyticsIntegration.prototype.calculateTrend = function (current, previous) {
    if (previous === 0) return 0;
    return (current - previous) / previous;
  };
  TrialAnalyticsIntegration.prototype.calculateAverageEngagement = function (since) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would calculate average engagement score
        return [2 /*return*/, 0.75]; // Placeholder
      });
    });
  };
  TrialAnalyticsIntegration.prototype.calculateEngagementTrend = function (since) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would calculate engagement trend
        return [2 /*return*/, 0.05]; // Placeholder - 5% increase
      });
    });
  };
  return TrialAnalyticsIntegration;
})();
exports.TrialAnalyticsIntegration = TrialAnalyticsIntegration;
exports.default = TrialAnalyticsIntegration;
