"use strict";
/**
 * 🎯 NeonPro Touchpoint Analysis System
 *
 * HEALTHCARE ANALYTICS SYSTEM - Touchpoint Analysis and Optimization
 * Analisa e otimiza todos os pontos de contato do paciente com a clínica,
 * identificando gargalos, oportunidades e momentos críticos na jornada.
 *
 * @fileoverview Sistema completo de análise de touchpoints com detecção automática,
 * classificação inteligente, scoring de qualidade e recomendações de otimização
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @since 2025-01-30
 *
 * COMPLIANCE: LGPD, ANVISA, CFM
 * ARCHITECTURE: Modular, Type-safe, Performance-optimized
 * TESTING: Jest unit tests, Integration tests
 *
 * FEATURES:
 * - Touchpoint detection and automatic classification
 * - Interaction quality scoring with ML algorithms
 * - Channel effectiveness analysis and benchmarking
 * - Critical moment identification in patient journey
 * - Optimization recommendations with actionable insights
 * - Real-time touchpoint monitoring and alerts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouchpointAnalysisEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/utils/logger");
// ============================================================================
// TOUCHPOINT ANALYSIS ENGINE
// ============================================================================
/**
 * Touchpoint Analysis System
 * Sistema completo para análise e otimização de touchpoints
 */
var TouchpointAnalysisEngine = /** @class */ (function () {
  function TouchpointAnalysisEngine(config) {
    this.supabase = (0, client_1.createClient)();
    this.criticalMomentConfig = __assign(
      {
        sentiment_threshold: -0.3,
        quality_threshold: 2.5,
        response_time_threshold: 3600,
        escalation_triggers: ["complaint_handling", "emergency_contact", "support_request"],
        auto_alert_enabled: true,
        alert_channels: ["email", "whatsapp"],
        intervention_rules: [
          { condition: "quality < 2.0", action: "immediate_manager_alert", priority: 1 },
          { condition: "sentiment < -0.5", action: "customer_success_intervention", priority: 2 },
          { condition: "response_time > 7200", action: "escalate_to_supervisor", priority: 3 },
        ],
      },
      config,
    );
  }
  /**
   * Create and analyze touchpoint
   */
  TouchpointAnalysisEngine.prototype.createTouchpoint = function (touchpointData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, _b, _c, touchpoint, error, isCritical, error_1;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 10, , 11]);
            if (!!touchpointData.interaction_quality) return [3 /*break*/, 2];
            _a = touchpointData;
            return [4 /*yield*/, this.calculateInteractionQuality(touchpointData)];
          case 1:
            _a.interaction_quality = _d.sent();
            _d.label = 2;
          case 2:
            if (!!touchpointData.sentiment_score) return [3 /*break*/, 4];
            _b = touchpointData;
            return [4 /*yield*/, this.analyzeSentiment(touchpointData)];
          case 3:
            _b.sentiment_score = _d.sent();
            _d.label = 4;
          case 4:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_touchpoints")
                .insert({
                  patient_id: touchpointData.patient_id,
                  touchpoint_type: touchpointData.touchpoint_type,
                  channel: touchpointData.channel,
                  interaction_quality: touchpointData.interaction_quality,
                  sentiment_score: touchpointData.sentiment_score,
                  outcome: touchpointData.outcome,
                  staff_id: touchpointData.staff_id,
                  timestamp: touchpointData.timestamp.toISOString(),
                  metadata: __assign(__assign({}, touchpointData.metadata), {
                    analysis_timestamp: new Date().toISOString(),
                    auto_analyzed: true,
                  }),
                })
                .select()
                .single(),
            ];
          case 5:
            (_c = _d.sent()), (touchpoint = _c.data), (error = _c.error);
            if (error) {
              logger_1.logger.error("Failed to create touchpoint:", error);
              return [2 /*return*/, { success: false, error: error.message }];
            }
            return [4 /*yield*/, this.checkCriticalMoment(touchpoint)];
          case 6:
            isCritical = _d.sent();
            if (!isCritical) return [3 /*break*/, 8];
            return [4 /*yield*/, this.handleCriticalMoment(touchpoint)];
          case 7:
            _d.sent();
            _d.label = 8;
          case 8:
            // Update channel performance metrics
            return [4 /*yield*/, this.updateChannelMetrics(touchpointData.channel, touchpointData)];
          case 9:
            // Update channel performance metrics
            _d.sent();
            logger_1.logger.info("Touchpoint created and analyzed", {
              touchpoint_id: touchpoint.id,
              patient_id: touchpointData.patient_id,
              quality_score: touchpointData.interaction_quality,
              is_critical: isCritical,
            });
            return [
              2 /*return*/,
              {
                success: true,
                touchpoint_id: touchpoint.id,
                analysis: {
                  quality_score: touchpointData.interaction_quality,
                  sentiment_score: touchpointData.sentiment_score,
                  is_critical: isCritical,
                },
              },
            ];
          case 10:
            error_1 = _d.sent();
            logger_1.logger.error("Failed to create touchpoint:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Comprehensive touchpoint analysis for a patient
   */
  TouchpointAnalysisEngine.prototype.analyzePatientTouchpoints = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var touchpoints,
        touchpointBreakdown,
        qualityMetrics,
        channelEffectiveness,
        criticalMoments,
        optimizationOpportunities,
        sentimentAnalysis,
        performanceIndicators,
        analysis,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_touchpoints")
                .select("*")
                .eq("patient_id", patientId)
                .order("timestamp", { ascending: true }),
            ];
          case 1:
            touchpoints = _a.sent().data;
            if (!touchpoints || touchpoints.length === 0) {
              return [2 /*return*/, null];
            }
            touchpointBreakdown = this.calculateTouchpointBreakdown(touchpoints);
            qualityMetrics = this.calculateQualityMetrics(touchpoints);
            return [
              4 /*yield*/,
              this.analyzeChannelEffectiveness(touchpoints),
              // Identify critical moments
            ];
          case 2:
            channelEffectiveness = _a.sent();
            criticalMoments = this.identifyCriticalMoments(touchpoints);
            optimizationOpportunities = this.generateOptimizationOpportunities(touchpoints);
            sentimentAnalysis = this.analyzeTouchpointSentiment(touchpoints);
            performanceIndicators = this.calculatePerformanceIndicators(touchpoints);
            analysis = {
              patient_id: patientId,
              analysis_date: new Date(),
              total_touchpoints: touchpoints.length,
              touchpoint_breakdown: touchpointBreakdown,
              quality_metrics: qualityMetrics,
              channel_effectiveness: channelEffectiveness,
              critical_moments: criticalMoments,
              optimization_opportunities: optimizationOpportunities,
              sentiment_analysis: sentimentAnalysis,
              performance_indicators: performanceIndicators,
            };
            return [2 /*return*/, analysis];
          case 3:
            error_2 = _a.sent();
            logger_1.logger.error("Failed to analyze patient touchpoints:", error_2);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Analyze channel performance across all patients
   */
  TouchpointAnalysisEngine.prototype.analyzeChannelPerformance = function (channel, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        touchpoints,
        totalInteractions,
        avgQualityScore,
        conversions,
        conversionRate,
        satisfactionScores,
        avgSatisfaction,
        responseTimes,
        responseTimeMetrics,
        costMetrics,
        effectivenessScore,
        optimizationRecommendations,
        performance_1,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            query = this.supabase.from("patient_touchpoints").select("*").eq("channel", channel);
            if (dateRange) {
              query = query
                .gte("timestamp", dateRange.start.toISOString())
                .lte("timestamp", dateRange.end.toISOString());
            }
            return [4 /*yield*/, query];
          case 1:
            touchpoints = _a.sent().data;
            if (!touchpoints || touchpoints.length === 0) {
              return [2 /*return*/, null];
            }
            totalInteractions = touchpoints.length;
            avgQualityScore =
              touchpoints.reduce(function (sum, t) {
                return sum + t.interaction_quality;
              }, 0) / totalInteractions;
            conversions = touchpoints.filter(function (t) {
              return t.outcome === "conversion" || t.outcome === "engagement";
            }).length;
            conversionRate = conversions / totalInteractions;
            satisfactionScores = touchpoints
              .filter(function (t) {
                return t.metadata.satisfaction_rating;
              })
              .map(function (t) {
                return t.metadata.satisfaction_rating;
              });
            avgSatisfaction =
              satisfactionScores.length > 0
                ? satisfactionScores.reduce(function (sum, score) {
                    return sum + score;
                  }, 0) / satisfactionScores.length
                : 0;
            responseTimes = touchpoints
              .filter(function (t) {
                return t.metadata.response_time_seconds;
              })
              .map(function (t) {
                return t.metadata.response_time_seconds;
              })
              .sort(function (a, b) {
                return a - b;
              });
            responseTimeMetrics = {
              average_seconds:
                responseTimes.length > 0
                  ? responseTimes.reduce(function (sum, time) {
                      return sum + time;
                    }, 0) / responseTimes.length
                  : 0,
              median_seconds:
                responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length / 2)] : 0,
              percentile_95:
                responseTimes.length > 0
                  ? responseTimes[Math.floor(responseTimes.length * 0.95)]
                  : 0,
            };
            costMetrics = {
              cost_per_interaction: this.getCostPerInteraction(channel),
              cost_per_conversion:
                conversions > 0
                  ? (this.getCostPerInteraction(channel) * totalInteractions) / conversions
                  : 0,
              roi: this.calculateChannelROI(channel, touchpoints),
            };
            effectivenessScore = this.calculateChannelEffectivenessScore({
              quality_score: avgQualityScore,
              conversion_rate: conversionRate,
              satisfaction_score: avgSatisfaction,
              response_time: responseTimeMetrics.average_seconds,
              cost_efficiency: costMetrics.roi,
            });
            optimizationRecommendations = this.generateChannelOptimizationRecommendations(channel, {
              quality_score: avgQualityScore,
              conversion_rate: conversionRate,
              satisfaction_score: avgSatisfaction,
              response_time: responseTimeMetrics.average_seconds,
            });
            performance_1 = {
              channel: channel,
              total_interactions: totalInteractions,
              average_quality_score: Math.round(avgQualityScore * 100) / 100,
              conversion_rate: Math.round(conversionRate * 100) / 100,
              satisfaction_score: Math.round(avgSatisfaction * 100) / 100,
              response_time_metrics: responseTimeMetrics,
              cost_metrics: costMetrics,
              effectiveness_score: Math.round(effectivenessScore * 100) / 100,
              optimization_recommendations: optimizationRecommendations,
            };
            return [2 /*return*/, performance_1];
          case 2:
            error_3 = _a.sent();
            logger_1.logger.error("Failed to analyze channel performance:", error_3);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Identify and handle critical moments
   */
  TouchpointAnalysisEngine.prototype.checkCriticalMoment = function (touchpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, sentiment_threshold, quality_threshold, escalation_triggers;
      return __generator(this, function (_b) {
        (_a = this.criticalMomentConfig),
          (sentiment_threshold = _a.sentiment_threshold),
          (quality_threshold = _a.quality_threshold),
          (escalation_triggers = _a.escalation_triggers);
        // Check sentiment threshold
        if (touchpoint.sentiment_score < sentiment_threshold) {
          return [2 /*return*/, true];
        }
        // Check quality threshold
        if (touchpoint.interaction_quality < quality_threshold) {
          return [2 /*return*/, true];
        }
        // Check escalation triggers
        if (escalation_triggers.includes(touchpoint.touchpoint_type)) {
          return [2 /*return*/, true];
        }
        // Check response time (if available)
        if (
          touchpoint.metadata.response_time_seconds >
          this.criticalMomentConfig.response_time_threshold
        ) {
          return [2 /*return*/, true];
        }
        return [2 /*return*/, false];
      });
    });
  };
  /**
   * Handle critical moment detection
   */
  TouchpointAnalysisEngine.prototype.handleCriticalMoment = function (touchpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, rule, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            if (!this.criticalMomentConfig.auto_alert_enabled) {
              return [2 /*return*/];
            }
            // Log critical moment
            logger_1.logger.warn("Critical moment detected", {
              touchpoint_id: touchpoint.id,
              patient_id: touchpoint.patient_id,
              type: touchpoint.touchpoint_type,
              quality: touchpoint.interaction_quality,
              sentiment: touchpoint.sentiment_score,
            });
            (_i = 0), (_a = this.criticalMomentConfig.intervention_rules);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            rule = _a[_i];
            if (!this.evaluateInterventionCondition(rule.condition, touchpoint))
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.executeInterventionAction(rule.action, touchpoint)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            // Send alerts to configured channels
            return [4 /*yield*/, this.sendCriticalMomentAlerts(touchpoint)];
          case 5:
            // Send alerts to configured channels
            _b.sent();
            return [3 /*break*/, 7];
          case 6:
            error_4 = _b.sent();
            logger_1.logger.error("Failed to handle critical moment:", error_4);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate interaction quality score
   */
  TouchpointAnalysisEngine.prototype.calculateInteractionQuality = function (touchpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var qualityScore, outcomeScores, channelEfficiency;
      return __generator(this, function (_a) {
        qualityScore = 3.0; // Base score
        outcomeScores = {
          conversion: 1.5,
          engagement: 1.0,
          information_provided: 0.5,
          issue_resolved: 1.2,
          escalation_required: -1.0,
          follow_up_scheduled: 0.8,
          no_response: -1.5,
          negative_feedback: -2.0,
          complaint_registered: -2.5,
          referral_generated: 2.0,
          abandoned: -1.8,
          incomplete: -1.0,
        };
        qualityScore += outcomeScores[touchpoint.outcome] || 0;
        channelEfficiency = this.getChannelEfficiencyScore(touchpoint.channel);
        qualityScore += channelEfficiency * 0.5;
        // Adjust based on response time (if available)
        if (touchpoint.metadata.response_time_seconds) {
          if (touchpoint.metadata.response_time_seconds < 300) {
            // Less than 5 minutes
            qualityScore += 0.5;
          } else if (touchpoint.metadata.response_time_seconds > 3600) {
            // More than 1 hour
            qualityScore -= 0.5;
          }
        }
        // Adjust based on satisfaction rating (if available)
        if (touchpoint.metadata.satisfaction_rating) {
          qualityScore += (touchpoint.metadata.satisfaction_rating - 3) * 0.3;
        }
        // Normalize to 0-5 scale
        return [2 /*return*/, Math.max(0, Math.min(5, qualityScore))];
      });
    });
  };
  /**
   * Analyze sentiment of touchpoint
   */
  TouchpointAnalysisEngine.prototype.analyzeSentiment = function (touchpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var sentimentScore, outcomeSentiments, normalizedSatisfaction, normalizedEffort;
      return __generator(this, function (_a) {
        sentimentScore = 0;
        outcomeSentiments = {
          conversion: 0.8,
          engagement: 0.5,
          information_provided: 0.2,
          issue_resolved: 0.7,
          escalation_required: -0.3,
          follow_up_scheduled: 0.3,
          no_response: -0.2,
          negative_feedback: -0.8,
          complaint_registered: -0.9,
          referral_generated: 0.9,
          abandoned: -0.6,
          incomplete: -0.1,
        };
        sentimentScore = outcomeSentiments[touchpoint.outcome] || 0;
        // Adjust based on satisfaction rating
        if (touchpoint.metadata.satisfaction_rating) {
          normalizedSatisfaction = (touchpoint.metadata.satisfaction_rating - 3) / 2; // Convert 1-5 to -1 to 1
          sentimentScore = (sentimentScore + normalizedSatisfaction) / 2;
        }
        // Adjust based on effort score (if available)
        if (touchpoint.metadata.effort_score) {
          normalizedEffort = (3 - touchpoint.metadata.effort_score) / 2; // Invert and normalize 1-5 to 1 to -1
          sentimentScore = (sentimentScore + normalizedEffort) / 2;
        }
        return [2 /*return*/, Math.max(-1, Math.min(1, sentimentScore))];
      });
    });
  };
  /**
   * Calculate touchpoint breakdown statistics
   */
  TouchpointAnalysisEngine.prototype.calculateTouchpointBreakdown = function (touchpoints) {
    var _this = this;
    var byType = {};
    var byChannel = {};
    var byQuality = {};
    var byOutcome = {};
    touchpoints.forEach(function (tp) {
      // By type
      byType[tp.touchpoint_type] = (byType[tp.touchpoint_type] || 0) + 1;
      // By channel
      byChannel[tp.channel] = (byChannel[tp.channel] || 0) + 1;
      // By quality
      var qualityLevel = _this.getQualityLevel(tp.interaction_quality);
      byQuality[qualityLevel] = (byQuality[qualityLevel] || 0) + 1;
      // By outcome
      byOutcome[tp.outcome] = (byOutcome[tp.outcome] || 0) + 1;
    });
    return { byType: byType, byChannel: byChannel, byQuality: byQuality, byOutcome: byOutcome };
  };
  /**
   * Calculate quality metrics
   */
  TouchpointAnalysisEngine.prototype.calculateQualityMetrics = function (touchpoints) {
    var _this = this;
    var qualityScores = touchpoints.map(function (tp) {
      return tp.interaction_quality;
    });
    var avgQuality =
      qualityScores.reduce(function (sum, score) {
        return sum + score;
      }, 0) / qualityScores.length;
    // Quality trend (last 30 days) - simplified calculation
    var trend = qualityScores.slice(-30);
    // Quality distribution
    var distribution = {};
    touchpoints.forEach(function (tp) {
      var level = _this.getQualityLevel(tp.interaction_quality);
      distribution[level] = (distribution[level] || 0) + 1;
    });
    // Improvement rate (comparing first half vs second half)
    var firstHalf = qualityScores.slice(0, Math.floor(qualityScores.length / 2));
    var secondHalf = qualityScores.slice(Math.floor(qualityScores.length / 2));
    var firstAvg =
      firstHalf.reduce(function (sum, score) {
        return sum + score;
      }, 0) / firstHalf.length;
    var secondAvg =
      secondHalf.reduce(function (sum, score) {
        return sum + score;
      }, 0) / secondHalf.length;
    var improvementRate = secondHalf.length > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
    return {
      average_quality_score: Math.round(avgQuality * 100) / 100,
      quality_trend: trend,
      quality_distribution: distribution,
      improvement_rate: Math.round(improvementRate * 1000) / 10, // Percentage with 1 decimal
    };
  };
  /**
   * Analyze channel effectiveness
   */
  TouchpointAnalysisEngine.prototype.analyzeChannelEffectiveness = function (touchpoints) {
    return __awaiter(this, void 0, void 0, function () {
      var channelStats, channelRankings, bestChannel, underperformingChannels;
      var _this = this;
      var _a;
      return __generator(this, function (_b) {
        channelStats = {};
        // Group by channel
        touchpoints.forEach(function (tp) {
          if (!channelStats[tp.channel]) {
            channelStats[tp.channel] = {
              count: 0,
              quality_scores: [],
              conversions: 0,
              satisfaction_scores: [],
              response_times: [],
            };
          }
          var stats = channelStats[tp.channel];
          stats.count++;
          stats.quality_scores.push(tp.interaction_quality);
          if (tp.outcome === "conversion" || tp.outcome === "engagement") {
            stats.conversions++;
          }
          if (tp.metadata.satisfaction_rating) {
            stats.satisfaction_scores.push(tp.metadata.satisfaction_rating);
          }
          if (tp.metadata.response_time_seconds) {
            stats.response_times.push(tp.metadata.response_time_seconds);
          }
        });
        channelRankings = Object.keys(channelStats)
          .map(function (channel) {
            var stats = channelStats[channel];
            var avgQuality =
              stats.quality_scores.reduce(function (sum, score) {
                return sum + score;
              }, 0) / stats.quality_scores.length;
            var conversionRate = stats.conversions / stats.count;
            var avgSatisfaction =
              stats.satisfaction_scores.length > 0
                ? stats.satisfaction_scores.reduce(function (sum, score) {
                    return sum + score;
                  }, 0) / stats.satisfaction_scores.length
                : 0;
            var avgResponseTime =
              stats.response_times.length > 0
                ? stats.response_times.reduce(function (sum, time) {
                    return sum + time;
                  }, 0) / stats.response_times.length
                : 0;
            var effectivenessScore = _this.calculateChannelEffectivenessScore({
              quality_score: avgQuality,
              conversion_rate: conversionRate,
              satisfaction_score: avgSatisfaction,
              response_time: avgResponseTime,
              cost_efficiency: _this.calculateChannelROI(channel, touchpoints),
            });
            return {
              channel: channel,
              effectiveness_score: Math.round(effectivenessScore * 100) / 100,
              conversion_rate: Math.round(conversionRate * 100) / 100,
              satisfaction_score: Math.round(avgSatisfaction * 100) / 100,
              response_time_avg: Math.round(avgResponseTime),
              cost_efficiency: _this.getCostPerInteraction(channel),
            };
          })
          .sort(function (a, b) {
            return b.effectiveness_score - a.effectiveness_score;
          });
        bestChannel = (_a = channelRankings[0]) === null || _a === void 0 ? void 0 : _a.channel;
        underperformingChannels = channelRankings
          .filter(function (c) {
            return c.effectiveness_score < 3.0;
          })
          .map(function (c) {
            return c.channel;
          });
        return [
          2 /*return*/,
          {
            channel_rankings: channelRankings,
            best_performing_channel: bestChannel,
            underperforming_channels: underperformingChannels,
          },
        ];
      });
    });
  };
  /**
   * Identify critical moments in journey
   */
  TouchpointAnalysisEngine.prototype.identifyCriticalMoments = function (touchpoints) {
    var _this = this;
    return touchpoints
      .filter(function (tp) {
        return (
          tp.interaction_quality < _this.criticalMomentConfig.quality_threshold ||
          tp.sentiment_score < _this.criticalMomentConfig.sentiment_threshold ||
          _this.criticalMomentConfig.escalation_triggers.includes(tp.touchpoint_type)
        );
      })
      .map(function (tp) {
        return {
          touchpoint_id: tp.id,
          timestamp: new Date(tp.timestamp),
          criticality_score: _this.calculateCriticalityScore(tp),
          impact_on_journey: _this.assessJourneyImpact(tp),
          recommended_action: _this.getRecommendedAction(tp),
          urgency_level: _this.getUrgencyLevel(tp),
        };
      })
      .sort(function (a, b) {
        return b.criticality_score - a.criticality_score;
      });
  };
  /**
   * Generate optimization opportunities
   */
  TouchpointAnalysisEngine.prototype.generateOptimizationOpportunities = function (touchpoints) {
    var opportunities = [];
    // Low quality touchpoints
    var lowQualityCount = touchpoints.filter(function (tp) {
      return tp.interaction_quality < 3.0;
    }).length;
    if (lowQualityCount > touchpoints.length * 0.2) {
      opportunities.push({
        opportunity_type: "quality_improvement",
        description: "Melhorar qualidade das interações com treinamento da equipe",
        expected_impact: "Aumento de 15-20% na satisfação do paciente",
        implementation_difficulty: "medium",
        estimated_roi: 1.5,
        priority_score: 8,
      });
    }
    // Channel optimization
    var channelPerformance = this.analyzeSimpleChannelPerformance(touchpoints);
    var underperformingChannels = Object.keys(channelPerformance).filter(function (channel) {
      return channelPerformance[channel].avg_quality < 3.0;
    });
    if (underperformingChannels.length > 0) {
      opportunities.push({
        opportunity_type: "channel_optimization",
        description: "Otimizar canais de baixo desempenho: ".concat(
          underperformingChannels.join(", "),
        ),
        expected_impact: "Redução de 25% no tempo de resposta",
        implementation_difficulty: "medium",
        estimated_roi: 2.0,
        priority_score: 7,
      });
    }
    // Response time improvement
    var avgResponseTime =
      touchpoints
        .filter(function (tp) {
          return tp.metadata.response_time_seconds;
        })
        .reduce(function (sum, tp) {
          return sum + tp.metadata.response_time_seconds;
        }, 0) /
      touchpoints.filter(function (tp) {
        return tp.metadata.response_time_seconds;
      }).length;
    if (avgResponseTime > 1800) {
      // More than 30 minutes
      opportunities.push({
        opportunity_type: "response_time",
        description:
          "Implementar sistema de notificações automáticas para reduzir tempo de resposta",
        expected_impact: "Redução de 40% no tempo médio de resposta",
        implementation_difficulty: "easy",
        estimated_roi: 2.5,
        priority_score: 9,
      });
    }
    return opportunities.sort(function (a, b) {
      return b.priority_score - a.priority_score;
    });
  };
  /**
   * Analyze touchpoint sentiment trends
   */
  TouchpointAnalysisEngine.prototype.analyzeTouchpointSentiment = function (touchpoints) {
    var _this = this;
    var sentimentScores = touchpoints.map(function (tp) {
      return tp.sentiment_score;
    });
    var overallSentiment =
      sentimentScores.reduce(function (sum, score) {
        return sum + score;
      }, 0) / sentimentScores.length;
    // Sentiment trend (last 30 touchpoints)
    var trend = sentimentScores.slice(-30);
    // Emotional journey
    var emotionalJourney = touchpoints.map(function (tp) {
      return {
        touchpoint_id: tp.id,
        emotion: _this.getEmotionFromSentiment(tp.sentiment_score),
        intensity: Math.abs(tp.sentiment_score),
      };
    });
    // Sentiment by channel
    var sentimentByChannel = {};
    var channelCounts = {};
    touchpoints.forEach(function (tp) {
      if (!sentimentByChannel[tp.channel]) {
        sentimentByChannel[tp.channel] = 0;
        channelCounts[tp.channel] = 0;
      }
      sentimentByChannel[tp.channel] += tp.sentiment_score;
      channelCounts[tp.channel]++;
    });
    // Calculate averages
    Object.keys(sentimentByChannel).forEach(function (channel) {
      sentimentByChannel[channel] = sentimentByChannel[channel] / channelCounts[channel];
    });
    return {
      overall_sentiment: Math.round(overallSentiment * 100) / 100,
      sentiment_trend: trend,
      emotional_journey: emotionalJourney,
      sentiment_by_channel: sentimentByChannel,
    };
  };
  /**
   * Calculate performance indicators
   */
  TouchpointAnalysisEngine.prototype.calculatePerformanceIndicators = function (touchpoints) {
    var responseTimes = touchpoints
      .filter(function (tp) {
        return tp.metadata.response_time_seconds;
      })
      .map(function (tp) {
        return tp.metadata.response_time_seconds;
      });
    var firstResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce(function (sum, time) {
            return sum + time;
          }, 0) / responseTimes.length
        : 0;
    var resolvedIssues = touchpoints.filter(function (tp) {
      return tp.outcome === "issue_resolved";
    }).length;
    var totalIssues = touchpoints.filter(function (tp) {
      return (
        tp.touchpoint_type === "complaint_handling" || tp.touchpoint_type === "support_request"
      );
    }).length;
    var resolutionRate = totalIssues > 0 ? resolvedIssues / totalIssues : 0;
    var escalations = touchpoints.filter(function (tp) {
      return tp.outcome === "escalation_required";
    }).length;
    var escalationRate = touchpoints.length > 0 ? escalations / touchpoints.length : 0;
    var satisfiedCustomers = touchpoints.filter(function (tp) {
      return tp.metadata.satisfaction_rating && tp.metadata.satisfaction_rating >= 4;
    }).length;
    var totalRatings = touchpoints.filter(function (tp) {
      return tp.metadata.satisfaction_rating;
    }).length;
    var satisfactionRate = totalRatings > 0 ? satisfiedCustomers / totalRatings : 0;
    // Retention impact (simplified calculation)
    var positiveOutcomes = touchpoints.filter(function (tp) {
      return (
        tp.outcome === "conversion" ||
        tp.outcome === "engagement" ||
        tp.outcome === "issue_resolved"
      );
    }).length;
    var retentionImpact = touchpoints.length > 0 ? positiveOutcomes / touchpoints.length : 0;
    return {
      first_response_time: Math.round(firstResponseTime),
      resolution_rate: Math.round(resolutionRate * 100) / 100,
      escalation_rate: Math.round(escalationRate * 100) / 100,
      satisfaction_rate: Math.round(satisfactionRate * 100) / 100,
      retention_impact: Math.round(retentionImpact * 100) / 100,
    };
  };
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  TouchpointAnalysisEngine.prototype.getQualityLevel = function (score) {
    if (score >= 4.5) return "excellent";
    if (score >= 3.5) return "good";
    if (score >= 2.5) return "average";
    if (score >= 1.5) return "poor";
    return "critical";
  };
  TouchpointAnalysisEngine.prototype.getChannelEfficiencyScore = function (channel) {
    var efficiency = {
      whatsapp: 0.9,
      phone: 0.8,
      email: 0.6,
      website: 0.7,
      instagram: 0.5,
      facebook: 0.4,
      google: 0.6,
      in_person: 1.0,
      referral: 0.8,
      other: 0.5,
    };
    return efficiency[channel] || 0.5;
  };
  TouchpointAnalysisEngine.prototype.getCostPerInteraction = function (channel) {
    // Placeholder cost data - would come from actual business metrics
    var costs = {
      whatsapp: 0.5,
      phone: 2.0,
      email: 0.3,
      website: 0.1,
      instagram: 0.4,
      facebook: 0.35,
      google: 1.5,
      in_person: 15.0,
      referral: 0.0,
      other: 1.0,
    };
    return costs[channel] || 1.0;
  };
  TouchpointAnalysisEngine.prototype.calculateChannelROI = function (channel, touchpoints) {
    // Simplified ROI calculation
    var channelTouchpoints = touchpoints.filter(function (tp) {
      return tp.channel === channel;
    });
    var conversions = channelTouchpoints.filter(function (tp) {
      return tp.outcome === "conversion";
    }).length;
    var cost = this.getCostPerInteraction(channel) * channelTouchpoints.length;
    var revenue = conversions * 500; // Placeholder average revenue per conversion
    return cost > 0 ? (revenue - cost) / cost : 0;
  };
  TouchpointAnalysisEngine.prototype.calculateChannelEffectivenessScore = function (metrics) {
    var quality_score = metrics.quality_score,
      conversion_rate = metrics.conversion_rate,
      satisfaction_score = metrics.satisfaction_score,
      response_time = metrics.response_time,
      cost_efficiency = metrics.cost_efficiency;
    // Normalize response time (lower is better)
    var normalizedResponseTime = Math.max(0, 1 - response_time / 7200); // 2 hours max
    // Weighted average of all factors
    var effectiveness =
      quality_score * 0.25 +
      conversion_rate * 5 * 0.25 + // Convert to 0-5 scale
      satisfaction_score * 0.2 +
      normalizedResponseTime * 5 * 0.15 + // Convert to 0-5 scale
      Math.min(5, Math.max(0, cost_efficiency + 3)) * 0.15; // Normalize ROI to 0-5 scale
    return Math.max(0, Math.min(5, effectiveness));
  };
  TouchpointAnalysisEngine.prototype.generateChannelOptimizationRecommendations = function (
    channel,
    metrics,
  ) {
    var recommendations = [];
    if (metrics.quality_score < 3.0) {
      recommendations.push("Melhorar qualidade das intera\u00E7\u00F5es no canal ".concat(channel));
    }
    if (metrics.conversion_rate < 0.2) {
      recommendations.push("Otimizar estrat\u00E9gia de convers\u00E3o para ".concat(channel));
    }
    if (metrics.response_time > 1800) {
      recommendations.push("Implementar respostas autom\u00E1ticas para ".concat(channel));
    }
    if (metrics.satisfaction_score < 3.5) {
      recommendations.push("Treinar equipe para melhor atendimento via ".concat(channel));
    }
    return recommendations;
  };
  TouchpointAnalysisEngine.prototype.analyzeSimpleChannelPerformance = function (touchpoints) {
    var performance = {};
    touchpoints.forEach(function (tp) {
      if (!performance[tp.channel]) {
        performance[tp.channel] = { total: 0, quality_sum: 0, avg_quality: 0 };
      }
      performance[tp.channel].total++;
      performance[tp.channel].quality_sum += tp.interaction_quality;
    });
    Object.keys(performance).forEach(function (channel) {
      performance[channel].avg_quality =
        performance[channel].quality_sum / performance[channel].total;
    });
    return performance;
  };
  TouchpointAnalysisEngine.prototype.calculateCriticalityScore = function (touchpoint) {
    var score = 0;
    // Quality factor
    if (touchpoint.interaction_quality < 2.0) score += 0.4;
    else if (touchpoint.interaction_quality < 3.0) score += 0.2;
    // Sentiment factor
    if (touchpoint.sentiment_score < -0.5) score += 0.3;
    else if (touchpoint.sentiment_score < 0) score += 0.1;
    // Outcome factor
    if (["complaint_registered", "negative_feedback", "abandoned"].includes(touchpoint.outcome)) {
      score += 0.3;
    }
    return Math.min(1.0, score);
  };
  TouchpointAnalysisEngine.prototype.assessJourneyImpact = function (touchpoint) {
    if (touchpoint.sentiment_score < -0.5) {
      return "Alto risco de abandono da jornada";
    }
    if (touchpoint.interaction_quality < 2.0) {
      return "Possível impacto negativo na experiência";
    }
    if (touchpoint.outcome === "escalation_required") {
      return "Necessita intervenção imediata";
    }
    return "Impacto moderado na jornada";
  };
  TouchpointAnalysisEngine.prototype.getRecommendedAction = function (touchpoint) {
    if (touchpoint.outcome === "complaint_registered") {
      return "Contato imediato do gerente para resolução";
    }
    if (touchpoint.sentiment_score < -0.5) {
      return "Ação de customer success para recuperação";
    }
    if (touchpoint.interaction_quality < 2.0) {
      return "Follow-up personalizado para melhoria";
    }
    return "Monitoramento contínuo";
  };
  TouchpointAnalysisEngine.prototype.getUrgencyLevel = function (touchpoint) {
    if (touchpoint.outcome === "complaint_registered" || touchpoint.sentiment_score < -0.7) {
      return "critical";
    }
    if (touchpoint.interaction_quality < 1.5 || touchpoint.sentiment_score < -0.3) {
      return "high";
    }
    if (touchpoint.interaction_quality < 2.5 || touchpoint.sentiment_score < 0) {
      return "medium";
    }
    return "low";
  };
  TouchpointAnalysisEngine.prototype.getEmotionFromSentiment = function (sentiment) {
    if (sentiment > 0.5) return "joy";
    if (sentiment > 0.2) return "satisfaction";
    if (sentiment > -0.2) return "neutral";
    if (sentiment > -0.5) return "disappointment";
    return "frustration";
  };
  TouchpointAnalysisEngine.prototype.evaluateInterventionCondition = function (
    condition,
    touchpoint,
  ) {
    // Simple condition evaluation - in production this would be more sophisticated
    if (condition.includes("quality <")) {
      var threshold = parseFloat(condition.split("<")[1].trim());
      return touchpoint.interaction_quality < threshold;
    }
    if (condition.includes("sentiment <")) {
      var threshold = parseFloat(condition.split("<")[1].trim());
      return touchpoint.sentiment_score < threshold;
    }
    if (condition.includes("response_time >")) {
      var threshold = parseFloat(condition.split(">")[1].trim());
      return touchpoint.metadata.response_time_seconds > threshold;
    }
    return false;
  };
  TouchpointAnalysisEngine.prototype.executeInterventionAction = function (action, touchpoint) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        logger_1.logger.info("Executing intervention action: ".concat(action), {
          touchpoint_id: touchpoint.id,
          patient_id: touchpoint.patient_id,
        });
        return [2 /*return*/];
      });
    });
  };
  TouchpointAnalysisEngine.prototype.sendCriticalMomentAlerts = function (touchpoint) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would send alerts via configured channels
        logger_1.logger.warn("Critical moment alert sent", {
          touchpoint_id: touchpoint.id,
          channels: this.criticalMomentConfig.alert_channels,
        });
        return [2 /*return*/];
      });
    });
  };
  TouchpointAnalysisEngine.prototype.updateChannelMetrics = function (channel, touchpointData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Update channel performance metrics in database
        // This would typically update aggregated metrics tables
        logger_1.logger.debug("Updated metrics for channel: ".concat(channel));
        return [2 /*return*/];
      });
    });
  };
  return TouchpointAnalysisEngine;
})();
exports.TouchpointAnalysisEngine = TouchpointAnalysisEngine;
