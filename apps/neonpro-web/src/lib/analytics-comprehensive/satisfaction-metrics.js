"use strict";
/**
 * 📊 NeonPro Patient Satisfaction Metrics Engine
 *
 * HEALTHCARE ANALYTICS SYSTEM - Satisfaction Metrics & Analysis
 * Sistema completo para coleta, processamento e análise de métricas de satisfação
 * de pacientes em tempo real, com benchmarking e análise preditiva.
 *
 * @fileoverview Engine de métricas de satisfação multi-dimensional com coleta automatizada,
 * análise de tendências, benchmarking e integração com feedback de pacientes
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
 * - Multi-dimensional satisfaction scoring system
 * - Real-time satisfaction data collection and processing
 * - Satisfaction trend analysis with predictive modeling
 * - Patient feedback integration and sentiment analysis
 * - Satisfaction benchmarking against industry standards
 * - Automated satisfaction surveys and collection
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
exports.PatientSatisfactionMetricsEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/utils/logger");
// ============================================================================
// SATISFACTION METRICS ENGINE
// ============================================================================
/**
 * Patient Satisfaction Metrics Engine
 * Sistema completo para análise de satisfação de pacientes
 */
var PatientSatisfactionMetricsEngine = /** @class */ (function () {
  function PatientSatisfactionMetricsEngine() {
    this.supabase = (0, client_1.createClient)();
    this.config = new Map();
    this.industryBenchmarks = {
      overall: 4.2,
      service_quality: 4.3,
      facility_environment: 4.1,
      staff_professionalism: 4.4,
      treatment_effectiveness: 4.0,
      communication: 4.2,
      scheduling_convenience: 3.9,
      waiting_time: 3.7,
      value_for_money: 3.8,
      recommendation_likelihood: 7.5,
      loyalty_intention: 4.1,
      complaint_resolution: 3.9,
    };
    this.initializeDefaultConfig();
  }
  /**
   * Initialize satisfaction tracking for a patient
   */
  PatientSatisfactionMetricsEngine.prototype.initializeSatisfactionTracking = function (
    patientId,
    config,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var satisfactionConfig;
      return __generator(this, function (_a) {
        try {
          satisfactionConfig = __assign(
            {
              auto_surveys_enabled: true,
              preferred_collection_methods: ["email_survey", "whatsapp_survey"],
              survey_frequency: {
                post_consultation: true,
                post_treatment: true,
                periodic_days: 90,
                nps_frequency_days: 180,
              },
              trigger_rules: [
                {
                  event_type: "consultation_completed",
                  delay_hours: 2,
                  survey_type: "post_consultation",
                  collection_method: "email_survey",
                },
                {
                  event_type: "treatment_completed",
                  delay_hours: 24,
                  survey_type: "post_treatment",
                  collection_method: "whatsapp_survey",
                },
                {
                  event_type: "complaint_registered",
                  delay_hours: 168, // 7 days
                  survey_type: "complaint_follow_up",
                  collection_method: "phone_interview",
                },
              ],
              reminder_schedule: {
                enabled: true,
                reminder_intervals_hours: [24, 72, 168], // 1 day, 3 days, 1 week
                max_reminders: 3,
              },
              response_incentives: {
                enabled: true,
                incentive_type: "discount",
                incentive_value: 5, // 5% discount
              },
              benchmarking: {
                enabled: true,
                industry_category: "aesthetic_clinics",
                compare_to_competitors: true,
                internal_goals: {
                  overall: 4.5,
                  service_quality: 4.6,
                  facility_environment: 4.4,
                  staff_professionalism: 4.7,
                  treatment_effectiveness: 4.3,
                  communication: 4.5,
                  scheduling_convenience: 4.2,
                  waiting_time: 4.0,
                  value_for_money: 4.1,
                  recommendation_likelihood: 8.0,
                  loyalty_intention: 4.4,
                  complaint_resolution: 4.2,
                },
              },
            },
            config,
          );
          this.config.set(patientId, satisfactionConfig);
          logger_1.logger.info("Satisfaction tracking initialized for patient ".concat(patientId), {
            auto_surveys: satisfactionConfig.auto_surveys_enabled,
            methods: satisfactionConfig.preferred_collection_methods,
          });
          return [2 /*return*/, { success: true }];
        } catch (error) {
          logger_1.logger.error("Failed to initialize satisfaction tracking:", error);
          return [
            2 /*return*/,
            {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Create and send satisfaction survey
   */
  PatientSatisfactionMetricsEngine.prototype.createSatisfactionSurvey = function (
    patientId,
    surveyType,
    collectionMethod,
    triggerEvent,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var config, _a, survey, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            config = this.config.get(patientId);
            if (config && !config.auto_surveys_enabled) {
              return [2 /*return*/, { success: true, survey_id: "surveys_disabled" }];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("satisfaction_surveys")
                .insert({
                  patient_id: patientId,
                  survey_type: surveyType,
                  collection_method: collectionMethod,
                  trigger_event: triggerEvent,
                  sent_at: new Date().toISOString(),
                  status: "pending",
                  overall_score: 0,
                  service_score: 0,
                  facility_score: 0,
                  staff_score: 0,
                  communication_score: 0,
                  waiting_time_score: 0,
                  value_score: 0,
                  recommendation_score: 0,
                  effort_score: 0,
                  satisfaction_scores: {},
                  metadata: {
                    survey_version: "1.0",
                    collection_initiated: new Date().toISOString(),
                    auto_generated: true,
                  },
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (survey = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Failed to create satisfaction survey:", error);
              return [2 /*return*/, { success: false, error: error.message }];
            }
            // Send survey based on collection method
            return [
              4 /*yield*/,
              this.sendSurvey(survey, collectionMethod),
              // Schedule reminders if enabled
            ];
          case 2:
            // Send survey based on collection method
            _b.sent();
            if (!(config === null || config === void 0 ? void 0 : config.reminder_schedule.enabled))
              return [3 /*break*/, 4];
            return [4 /*yield*/, this.scheduleReminders(survey.id, config.reminder_schedule)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            logger_1.logger.info("Satisfaction survey created and sent", {
              survey_id: survey.id,
              patient_id: patientId,
              type: surveyType,
              method: collectionMethod,
            });
            return [
              2 /*return*/,
              {
                success: true,
                survey_id: survey.id,
              },
            ];
          case 5:
            error_1 = _b.sent();
            logger_1.logger.error("Failed to create satisfaction survey:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process completed satisfaction survey
   */
  PatientSatisfactionMetricsEngine.prototype.processSurveyResponse = function (
    surveyId,
    responses,
    feedbackText,
    additionalData,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var survey,
        processedScores,
        feedbackSentiment,
        responseTimeMinutes,
        updateError,
        metrics,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            return [
              4 /*yield*/,
              this.supabase.from("satisfaction_surveys").select("*").eq("id", surveyId).single(),
            ];
          case 1:
            survey = _a.sent().data;
            if (!survey) {
              return [2 /*return*/, { success: false, error: "Survey not found" }];
            }
            processedScores = this.processResponses(responses);
            feedbackSentiment = void 0;
            if (!feedbackText) return [3 /*break*/, 3];
            return [4 /*yield*/, this.analyzeFeedbackSentiment(feedbackText)];
          case 2:
            feedbackSentiment = _a.sent();
            _a.label = 3;
          case 3:
            responseTimeMinutes = Math.round(
              (new Date().getTime() - new Date(survey.sent_at).getTime()) / (1000 * 60),
            );
            return [
              4 /*yield*/,
              this.supabase
                .from("satisfaction_surveys")
                .update({
                  completed_at: new Date().toISOString(),
                  status: "completed",
                  overall_score: processedScores.overall,
                  service_score: processedScores.service_quality,
                  facility_score: processedScores.facility_environment,
                  staff_score: processedScores.staff_professionalism,
                  communication_score: processedScores.communication,
                  waiting_time_score: processedScores.waiting_time,
                  value_score: processedScores.value_for_money,
                  recommendation_score: processedScores.recommendation_likelihood,
                  effort_score: responses.loyalty_intention || 3,
                  satisfaction_scores: processedScores,
                  feedback_text: feedbackText,
                  feedback_sentiment: feedbackSentiment,
                  response_time_minutes: responseTimeMinutes,
                  metadata: __assign(
                    __assign(__assign({}, survey.metadata), {
                      processed_at: new Date().toISOString(),
                      completion_rate: this.calculateCompletionRate(responses),
                    }),
                    additionalData,
                  ),
                })
                .eq("id", surveyId),
            ];
          case 4:
            updateError = _a.sent().error;
            if (updateError) {
              logger_1.logger.error("Failed to update survey with responses:", updateError);
              return [2 /*return*/, { success: false, error: updateError.message }];
            }
            return [
              4 /*yield*/,
              this.calculateSatisfactionMetrics(survey.patient_id),
              // Check for immediate actions needed
            ];
          case 5:
            metrics = _a.sent();
            // Check for immediate actions needed
            return [
              4 /*yield*/,
              this.checkForImmediateActions(survey.patient_id, processedScores, feedbackSentiment),
              // Update patient satisfaction profile
            ];
          case 6:
            // Check for immediate actions needed
            _a.sent();
            // Update patient satisfaction profile
            return [4 /*yield*/, this.updatePatientSatisfactionProfile(survey.patient_id, metrics)];
          case 7:
            // Update patient satisfaction profile
            _a.sent();
            logger_1.logger.info("Survey response processed successfully", {
              survey_id: surveyId,
              patient_id: survey.patient_id,
              overall_score: processedScores.overall,
              sentiment: feedbackSentiment,
            });
            return [
              2 /*return*/,
              {
                success: true,
                metrics: metrics,
              },
            ];
          case 8:
            error_2 = _a.sent();
            logger_1.logger.error("Failed to process survey response:", error_2);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
            ];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate comprehensive satisfaction metrics for a patient
   */
  PatientSatisfactionMetricsEngine.prototype.calculateSatisfactionMetrics = function (patientId_1) {
    return __awaiter(this, arguments, void 0, function (patientId, periodDays) {
      var periodStart,
        surveys,
        averageScores,
        scoreTrends,
        npsScore,
        npsCategory,
        cesScore,
        csatScore,
        benchmarkComparison,
        satisfactionPercentile,
        improvementOpportunities,
        predictedTrends,
        allSurveys,
        totalSurveys,
        responseRate,
        metrics,
        error_3;
      if (periodDays === void 0) {
        periodDays = 365;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            periodStart = new Date();
            periodStart.setDate(periodStart.getDate() - periodDays);
            return [
              4 /*yield*/,
              this.supabase
                .from("satisfaction_surveys")
                .select("*")
                .eq("patient_id", patientId)
                .eq("status", "completed")
                .gte("completed_at", periodStart.toISOString())
                .order("completed_at", { ascending: true }),
            ];
          case 1:
            surveys = _a.sent().data;
            if (!surveys || surveys.length === 0) {
              return [2 /*return*/, null];
            }
            averageScores = this.calculateAverageScores(surveys);
            scoreTrends = this.calculateScoreTrends(surveys);
            npsScore = this.calculateNPS(surveys);
            npsCategory = this.getNPSCategory(npsScore);
            cesScore = this.calculateCES(surveys);
            csatScore = this.calculateCSAT(surveys);
            benchmarkComparison = this.calculateBenchmarkComparison(averageScores);
            satisfactionPercentile = this.calculateSatisfactionPercentile(averageScores.overall);
            improvementOpportunities = this.identifyImprovementOpportunities(
              averageScores,
              benchmarkComparison,
            );
            predictedTrends = this.generatePredictedTrends(scoreTrends);
            return [
              4 /*yield*/,
              this.supabase
                .from("satisfaction_surveys")
                .select("id")
                .eq("patient_id", patientId)
                .gte("sent_at", periodStart.toISOString()),
            ];
          case 2:
            allSurveys = _a.sent().data;
            totalSurveys =
              (allSurveys === null || allSurveys === void 0 ? void 0 : allSurveys.length) || 0;
            responseRate = totalSurveys > 0 ? surveys.length / totalSurveys : 0;
            metrics = {
              patient_id: patientId,
              calculation_date: new Date(),
              period_start: periodStart,
              period_end: new Date(),
              total_surveys: totalSurveys,
              completed_surveys: surveys.length,
              response_rate: Math.round(responseRate * 100) / 100,
              average_scores: averageScores,
              score_trends: scoreTrends,
              nps_score: npsScore,
              nps_category: npsCategory,
              ces_score: cesScore,
              csat_score: csatScore,
              satisfaction_percentile: satisfactionPercentile,
              benchmark_comparison: benchmarkComparison,
              improvement_opportunities: improvementOpportunities,
              predicted_trends: predictedTrends,
            };
            return [2 /*return*/, metrics];
          case 3:
            error_3 = _a.sent();
            logger_1.logger.error("Failed to calculate satisfaction metrics:", error_3);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Analyze satisfaction trends for a patient
   */
  PatientSatisfactionMetricsEngine.prototype.analyzeSatisfactionTrends = function (patientId_1) {
    return __awaiter(this, arguments, void 0, function (patientId, periodDays) {
      var periodStart,
        surveys,
        trendData,
        predictiveInsights,
        benchmarkingInsights,
        analysis,
        error_4;
      if (periodDays === void 0) {
        periodDays = 365;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            periodStart = new Date();
            periodStart.setDate(periodStart.getDate() - periodDays);
            return [
              4 /*yield*/,
              this.supabase
                .from("satisfaction_surveys")
                .select("*")
                .eq("patient_id", patientId)
                .eq("status", "completed")
                .gte("completed_at", periodStart.toISOString())
                .order("completed_at", { ascending: true }),
            ];
          case 1:
            surveys = _a.sent().data;
            if (!surveys || surveys.length < 2) {
              return [2 /*return*/, null];
            }
            trendData = this.analyzeTrendData(surveys);
            predictiveInsights = this.generatePredictiveInsights(surveys, trendData);
            benchmarkingInsights = this.calculateBenchmarkingInsights(surveys);
            analysis = {
              patient_id: patientId,
              analysis_period_days: periodDays,
              trend_data: trendData,
              predictive_insights: predictiveInsights,
              benchmarking_insights: benchmarkingInsights,
            };
            return [2 /*return*/, analysis];
          case 2:
            error_4 = _a.sent();
            logger_1.logger.error("Failed to analyze satisfaction trends:", error_4);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  PatientSatisfactionMetricsEngine.prototype.initializeDefaultConfig = function () {
    // Initialize with default industry benchmarks for aesthetic clinics
    // These would typically come from industry research or competitive analysis
  };
  PatientSatisfactionMetricsEngine.prototype.sendSurvey = function (survey, method) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            // Implementation would depend on the collection method
            logger_1.logger.info("Sending survey via ".concat(method), { survey_id: survey.id });
            _a = method;
            switch (_a) {
              case "email_survey":
                return [3 /*break*/, 1];
              case "whatsapp_survey":
                return [3 /*break*/, 3];
              case "sms_survey":
                return [3 /*break*/, 5];
            }
            return [3 /*break*/, 7];
          case 1:
            return [4 /*yield*/, this.sendEmailSurvey(survey)];
          case 2:
            _b.sent();
            return [3 /*break*/, 8];
          case 3:
            return [4 /*yield*/, this.sendWhatsAppSurvey(survey)];
          case 4:
            _b.sent();
            return [3 /*break*/, 8];
          case 5:
            return [4 /*yield*/, this.sendSMSSurvey(survey)];
          case 6:
            _b.sent();
            return [3 /*break*/, 8];
          case 7:
            logger_1.logger.debug(
              "Survey method ".concat(method, " scheduled for manual handling"),
            );
            _b.label = 8;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.sendEmailSurvey = function (survey) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Email survey implementation
        logger_1.logger.debug("Email survey sent", { survey_id: survey.id });
        return [2 /*return*/];
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.sendWhatsAppSurvey = function (survey) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // WhatsApp survey implementation
        logger_1.logger.debug("WhatsApp survey sent", { survey_id: survey.id });
        return [2 /*return*/];
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.sendSMSSurvey = function (survey) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // SMS survey implementation
        logger_1.logger.debug("SMS survey sent", { survey_id: survey.id });
        return [2 /*return*/];
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.scheduleReminders = function (
    surveyId,
    reminderConfig,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Schedule reminder notifications
        logger_1.logger.debug("Reminders scheduled", { survey_id: surveyId });
        return [2 /*return*/];
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.processResponses = function (responses) {
    var processedScores = {
      overall: 0,
      service_quality: 0,
      facility_environment: 0,
      staff_professionalism: 0,
      treatment_effectiveness: 0,
      communication: 0,
      scheduling_convenience: 0,
      waiting_time: 0,
      value_for_money: 0,
      recommendation_likelihood: 0,
      loyalty_intention: 0,
      complaint_resolution: 0,
    };
    // Process provided responses
    Object.keys(responses).forEach(function (key) {
      var dimension = key;
      if (responses[dimension] !== undefined) {
        processedScores[dimension] = responses[dimension];
      }
    });
    // Calculate overall score if not provided
    if (!responses.overall) {
      var relevantScores = [
        processedScores.service_quality,
        processedScores.facility_environment,
        processedScores.staff_professionalism,
        processedScores.treatment_effectiveness,
        processedScores.communication,
      ].filter(function (score) {
        return score > 0;
      });
      if (relevantScores.length > 0) {
        processedScores.overall =
          relevantScores.reduce(function (sum, score) {
            return sum + score;
          }, 0) / relevantScores.length;
      }
    }
    return processedScores;
  };
  PatientSatisfactionMetricsEngine.prototype.analyzeFeedbackSentiment = function (feedbackText) {
    return __awaiter(this, void 0, void 0, function () {
      var positiveKeywords, negativeKeywords, text, sentiment;
      return __generator(this, function (_a) {
        positiveKeywords = [
          "excellent",
          "great",
          "amazing",
          "fantastic",
          "perfect",
          "love",
          "recommend",
        ];
        negativeKeywords = [
          "terrible",
          "awful",
          "horrible",
          "hate",
          "worst",
          "disappointed",
          "unsatisfied",
        ];
        text = feedbackText.toLowerCase();
        sentiment = 0;
        positiveKeywords.forEach(function (keyword) {
          if (text.includes(keyword)) sentiment += 0.2;
        });
        negativeKeywords.forEach(function (keyword) {
          if (text.includes(keyword)) sentiment -= 0.2;
        });
        return [2 /*return*/, Math.max(-1, Math.min(1, sentiment))];
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.calculateCompletionRate = function (responses) {
    var totalQuestions = Object.keys(this.industryBenchmarks).length;
    var answeredQuestions = Object.values(responses).filter(function (value) {
      return value !== undefined && value > 0;
    }).length;
    return answeredQuestions / totalQuestions;
  };
  PatientSatisfactionMetricsEngine.prototype.checkForImmediateActions = function (
    patientId,
    scores,
    sentiment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var criticalThreshold, criticalDimensions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            criticalThreshold = 2.0;
            criticalDimensions = Object.keys(scores).filter(function (key) {
              return scores[key] < criticalThreshold;
            });
            if (!(criticalDimensions.length > 0 || (sentiment && sentiment < -0.5)))
              return [3 /*break*/, 2];
            logger_1.logger.warn("Critical satisfaction issue detected", {
              patient_id: patientId,
              critical_dimensions: criticalDimensions,
              sentiment_score: sentiment,
            });
            // Trigger immediate action workflow
            return [
              4 /*yield*/,
              this.triggerImmediateAction(patientId, criticalDimensions, sentiment),
            ];
          case 1:
            // Trigger immediate action workflow
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.triggerImmediateAction = function (
    patientId,
    criticalDimensions,
    sentiment,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would trigger alerts, create tasks, etc.
        logger_1.logger.info("Immediate action triggered for satisfaction issue", {
          patient_id: patientId,
          critical_areas: criticalDimensions,
        });
        return [2 /*return*/];
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.updatePatientSatisfactionProfile = function (
    patientId,
    metrics,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Update patient profile with latest satisfaction metrics
        logger_1.logger.debug("Patient satisfaction profile updated", {
          patient_id: patientId,
          overall_score: metrics.average_scores.overall,
        });
        return [2 /*return*/];
      });
    });
  };
  PatientSatisfactionMetricsEngine.prototype.calculateAverageScores = function (surveys) {
    var averages = {
      overall: 0,
      service_quality: 0,
      facility_environment: 0,
      staff_professionalism: 0,
      treatment_effectiveness: 0,
      communication: 0,
      scheduling_convenience: 0,
      waiting_time: 0,
      value_for_money: 0,
      recommendation_likelihood: 0,
      loyalty_intention: 0,
      complaint_resolution: 0,
    };
    if (surveys.length === 0) return averages;
    surveys.forEach(function (survey) {
      averages.overall += survey.overall_score;
      averages.service_quality += survey.service_score;
      averages.facility_environment += survey.facility_score;
      averages.staff_professionalism += survey.staff_score;
      averages.communication += survey.communication_score;
      averages.waiting_time += survey.waiting_time_score;
      averages.value_for_money += survey.value_score;
      averages.recommendation_likelihood += survey.recommendation_score;
      // Handle satisfaction_scores JSON field
      if (survey.satisfaction_scores) {
        Object.keys(survey.satisfaction_scores).forEach(function (key) {
          var dimension = key;
          if (averages[dimension] !== undefined) {
            averages[dimension] += survey.satisfaction_scores[key] || 0;
          }
        });
      }
    });
    // Calculate averages
    Object.keys(averages).forEach(function (key) {
      var dimension = key;
      averages[dimension] = Math.round((averages[dimension] / surveys.length) * 100) / 100;
    });
    return averages;
  };
  PatientSatisfactionMetricsEngine.prototype.calculateScoreTrends = function (surveys) {
    // Calculate trends over time for each dimension
    var trends = {
      overall: [],
      service_quality: [],
      facility_environment: [],
      staff_professionalism: [],
      treatment_effectiveness: [],
      communication: [],
      scheduling_convenience: [],
      waiting_time: [],
      value_for_money: [],
      recommendation_likelihood: [],
      loyalty_intention: [],
      complaint_resolution: [],
    };
    surveys.forEach(function (survey) {
      trends.overall.push(survey.overall_score);
      trends.service_quality.push(survey.service_score);
      trends.facility_environment.push(survey.facility_score);
      trends.staff_professionalism.push(survey.staff_score);
      trends.communication.push(survey.communication_score);
      trends.waiting_time.push(survey.waiting_time_score);
      trends.value_for_money.push(survey.value_score);
      trends.recommendation_likelihood.push(survey.recommendation_score);
    });
    return trends;
  };
  PatientSatisfactionMetricsEngine.prototype.calculateNPS = function (surveys) {
    var npsScores = surveys
      .map(function (s) {
        return s.recommendation_score;
      })
      .filter(function (score) {
        return score >= 0 && score <= 10;
      });
    if (npsScores.length === 0) return 0;
    var promoters = npsScores.filter(function (score) {
      return score >= 9;
    }).length;
    var detractors = npsScores.filter(function (score) {
      return score <= 6;
    }).length;
    return Math.round(((promoters - detractors) / npsScores.length) * 100);
  };
  PatientSatisfactionMetricsEngine.prototype.getNPSCategory = function (npsScore) {
    if (npsScore <= 6) return "detractor";
    if (npsScore <= 8) return "passive";
    return "promoter";
  };
  PatientSatisfactionMetricsEngine.prototype.calculateCES = function (surveys) {
    var cesScores = surveys
      .map(function (s) {
        return s.effort_score;
      })
      .filter(function (score) {
        return score > 0;
      });
    return cesScores.length > 0
      ? Math.round(
          (cesScores.reduce(function (sum, score) {
            return sum + score;
          }, 0) /
            cesScores.length) *
            100,
        ) / 100
      : 0;
  };
  PatientSatisfactionMetricsEngine.prototype.calculateCSAT = function (surveys) {
    var csatScores = surveys
      .map(function (s) {
        return s.overall_score;
      })
      .filter(function (score) {
        return score > 0;
      });
    return csatScores.length > 0
      ? Math.round(
          (csatScores.reduce(function (sum, score) {
            return sum + score;
          }, 0) /
            csatScores.length) *
            100,
        ) / 100
      : 0;
  };
  PatientSatisfactionMetricsEngine.prototype.calculateBenchmarkComparison = function (
    averageScores,
  ) {
    var _this = this;
    var variance = {};
    Object.keys(averageScores).forEach(function (key) {
      var dimension = key;
      var industryAvg = _this.industryBenchmarks[dimension] || 3.0;
      var patientScore = averageScores[dimension];
      variance[dimension] = Math.round((patientScore - industryAvg) * 100) / 100;
    });
    return {
      industry_average: this.industryBenchmarks,
      clinic_performance: averageScores,
      variance_from_benchmark: variance,
      ranking_position: this.calculateRankingPosition(averageScores.overall),
    };
  };
  PatientSatisfactionMetricsEngine.prototype.calculateSatisfactionPercentile = function (
    overallScore,
  ) {
    // Simplified percentile calculation - would use actual distribution data in production
    var maxScore = 5.0;
    return Math.round((overallScore / maxScore) * 100);
  };
  PatientSatisfactionMetricsEngine.prototype.calculateRankingPosition = function (overallScore) {
    // Simplified ranking - would use actual market data in production
    if (overallScore >= 4.5) return 1; // Top 10%
    if (overallScore >= 4.0) return 2; // Top 25%
    if (overallScore >= 3.5) return 3; // Top 50%
    if (overallScore >= 3.0) return 4; // Top 75%
    return 5; // Bottom 25%
  };
  PatientSatisfactionMetricsEngine.prototype.identifyImprovementOpportunities = function (
    averageScores,
    benchmarkComparison,
  ) {
    var _this = this;
    var opportunities = [];
    Object.keys(averageScores).forEach(function (key) {
      var dimension = key;
      var currentScore = averageScores[dimension];
      var benchmarkScore = _this.industryBenchmarks[dimension] || 3.0;
      var variance = benchmarkComparison.variance_from_benchmark[dimension];
      if (variance < -0.5) {
        // Significantly below benchmark
        opportunities.push({
          dimension: dimension,
          current_score: currentScore,
          target_score: benchmarkScore + 0.2, // Aim slightly above benchmark
          improvement_potential: Math.abs(variance),
          priority_level: _this.getPriorityLevel(variance, currentScore),
          recommended_actions: _this.getRecommendedActions(dimension, currentScore),
        });
      }
    });
    return opportunities.sort(function (a, b) {
      return b.improvement_potential - a.improvement_potential;
    });
  };
  PatientSatisfactionMetricsEngine.prototype.getPriorityLevel = function (variance, currentScore) {
    if (currentScore < 2.0 || variance < -1.0) return "critical";
    if (currentScore < 3.0 || variance < -0.7) return "high";
    if (variance < -0.5) return "medium";
    return "low";
  };
  PatientSatisfactionMetricsEngine.prototype.getRecommendedActions = function (
    dimension,
    currentScore,
  ) {
    var actions = {
      overall: [
        "Implementar programa de melhoria contínua",
        "Realizar pesquisa detalhada de causas",
      ],
      service_quality: [
        "Treinamento de atendimento ao cliente",
        "Padronização de protocolos de atendimento",
      ],
      facility_environment: ["Renovação de ambiente", "Melhoria de conforto e limpeza"],
      staff_professionalism: ["Treinamento de equipe", "Programa de desenvolvimento profissional"],
      treatment_effectiveness: [
        "Revisão de protocolos de tratamento",
        "Investimento em novas tecnologias",
      ],
      communication: ["Melhoria nos canais de comunicação", "Treinamento de comunicação"],
      scheduling_convenience: ["Otimização do sistema de agendamento", "Flexibilidade de horários"],
      waiting_time: ["Otimização de fluxo de atendimento", "Sistema de gerenciamento de filas"],
      value_for_money: ["Revisão de preços", "Programa de benefícios adicionais"],
      recommendation_likelihood: ["Programa de indicações", "Melhoria da experiência geral"],
      loyalty_intention: ["Programa de fidelidade", "Benefícios para clientes recorrentes"],
      complaint_resolution: [
        "Melhoria do processo de SAC",
        "Treinamento para resolução de conflitos",
      ],
    };
    return actions[dimension] || ["Análise específica necessária"];
  };
  PatientSatisfactionMetricsEngine.prototype.generatePredictedTrends = function (scoreTrends) {
    var predictions = {
      next_month_prediction: {},
      confidence_interval: {},
      trend_direction: {},
    };
    Object.keys(scoreTrends).forEach(function (key) {
      var dimension = key;
      var trend = scoreTrends[dimension];
      if (trend.length >= 2) {
        var lastScore = trend[trend.length - 1];
        var secondLastScore = trend[trend.length - 2];
        var trendDirection =
          lastScore > secondLastScore
            ? "improving"
            : lastScore < secondLastScore
              ? "declining"
              : "stable";
        // Simple linear prediction
        var change = lastScore - secondLastScore;
        var prediction = Math.max(0, Math.min(5, lastScore + change));
        predictions.next_month_prediction[dimension] = Math.round(prediction * 100) / 100;
        predictions.confidence_interval[dimension] = [
          Math.max(0, prediction - 0.3),
          Math.min(5, prediction + 0.3),
        ];
        predictions.trend_direction[dimension] = trendDirection;
      }
    });
    return predictions;
  };
  PatientSatisfactionMetricsEngine.prototype.analyzeTrendData = function (surveys) {
    // Analyze trend patterns, correlations, etc.
    var scores = surveys.map(function (s) {
      return s.overall_score;
    });
    var firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    var secondHalf = scores.slice(Math.floor(scores.length / 2));
    var firstAvg =
      firstHalf.reduce(function (sum, score) {
        return sum + score;
      }, 0) / firstHalf.length;
    var secondAvg =
      secondHalf.reduce(function (sum, score) {
        return sum + score;
      }, 0) / secondHalf.length;
    var overallTrend = "stable";
    var trendStrength = 0;
    if (secondAvg > firstAvg + 0.2) {
      overallTrend = "improving";
      trendStrength = Math.min(1, (secondAvg - firstAvg) / 2);
    } else if (secondAvg < firstAvg - 0.2) {
      overallTrend = "declining";
      trendStrength = Math.min(1, (firstAvg - secondAvg) / 2);
    }
    return {
      overall_trend: overallTrend,
      trend_strength: Math.round(trendStrength * 100) / 100,
      seasonal_patterns: [], // Would analyze seasonal patterns with more data
      correlations: [], // Would calculate correlations between dimensions
    };
  };
  PatientSatisfactionMetricsEngine.prototype.generatePredictiveInsights = function (
    surveys,
    trendData,
  ) {
    var latestSurvey = surveys[surveys.length - 1];
    var churnRiskIndicator = this.calculateChurnRisk(surveys);
    var loyaltyScore =
      (latestSurvey === null || latestSurvey === void 0 ? void 0 : latestSurvey.overall_score) || 0;
    return {
      churn_risk_indicator: Math.round(churnRiskIndicator * 100) / 100,
      loyalty_score: Math.round(loyaltyScore * 100) / 100,
      next_survey_optimal_timing: this.calculateOptimalSurveyTiming(surveys),
      intervention_recommendations: this.generateInterventionRecommendations(
        churnRiskIndicator,
        loyaltyScore,
      ),
    };
  };
  PatientSatisfactionMetricsEngine.prototype.calculateBenchmarkingInsights = function (surveys) {
    var _this = this;
    var latestSurvey = surveys[surveys.length - 1];
    var performanceVsIndustry = {};
    Object.keys(this.industryBenchmarks).forEach(function (key) {
      var _a;
      var dimension = key;
      var patientScore =
        ((_a =
          latestSurvey === null || latestSurvey === void 0
            ? void 0
            : latestSurvey.satisfaction_scores) === null || _a === void 0
          ? void 0
          : _a[dimension]) || 0;
      var industryScore = _this.industryBenchmarks[dimension];
      if (patientScore > industryScore + 0.2) {
        performanceVsIndustry[dimension] = "above";
      } else if (patientScore < industryScore - 0.2) {
        performanceVsIndustry[dimension] = "below";
      } else {
        performanceVsIndustry[dimension] = "at";
      }
    });
    // Priority ranking based on impact and improvement potential
    var improvementPriorityRanking = Object.keys(performanceVsIndustry)
      .filter(function (key) {
        return performanceVsIndustry[key] === "below";
      })
      .sort(function (a, b) {
        var _a, _b;
        var scoreA =
          ((_a =
            latestSurvey === null || latestSurvey === void 0
              ? void 0
              : latestSurvey.satisfaction_scores) === null || _a === void 0
            ? void 0
            : _a[a]) || 0;
        var scoreB =
          ((_b =
            latestSurvey === null || latestSurvey === void 0
              ? void 0
              : latestSurvey.satisfaction_scores) === null || _b === void 0
            ? void 0
            : _b[b]) || 0;
        return scoreA - scoreB; // Lower scores first (more urgent)
      });
    return {
      performance_vs_industry: performanceVsIndustry,
      improvement_priority_ranking: improvementPriorityRanking,
      competitive_positioning: this.getCompetitivePositioning(
        (latestSurvey === null || latestSurvey === void 0 ? void 0 : latestSurvey.overall_score) ||
          0,
      ),
    };
  };
  PatientSatisfactionMetricsEngine.prototype.calculateChurnRisk = function (surveys) {
    if (surveys.length === 0) return 0.5;
    var latestSurvey = surveys[surveys.length - 1];
    var riskScore = 0;
    // Low overall satisfaction
    if (latestSurvey.overall_score < 3.0) riskScore += 0.3;
    // Low NPS
    if (latestSurvey.recommendation_score < 7) riskScore += 0.2;
    // Declining trend
    if (surveys.length > 1) {
      var previousSurvey = surveys[surveys.length - 2];
      if (latestSurvey.overall_score < previousSurvey.overall_score) riskScore += 0.2;
    }
    // Negative sentiment
    if (latestSurvey.feedback_sentiment && latestSurvey.feedback_sentiment < -0.3) {
      riskScore += 0.3;
    }
    return Math.min(1.0, riskScore);
  };
  PatientSatisfactionMetricsEngine.prototype.calculateOptimalSurveyTiming = function (surveys) {
    // Calculate optimal timing for next survey based on response patterns
    var avgResponseInterval = 90; // Default 90 days
    var nextSurveyDate = new Date();
    nextSurveyDate.setDate(nextSurveyDate.getDate() + avgResponseInterval);
    return nextSurveyDate;
  };
  PatientSatisfactionMetricsEngine.prototype.generateInterventionRecommendations = function (
    churnRisk,
    loyaltyScore,
  ) {
    var recommendations = [];
    if (churnRisk > 0.7) {
      recommendations.push("Contato imediato do customer success");
      recommendations.push("Oferta de compensação ou melhoria de serviço");
    } else if (churnRisk > 0.4) {
      recommendations.push("Agendamento de follow-up personalizado");
      recommendations.push("Pesquisa detalhada de satisfação");
    }
    if (loyaltyScore > 4.0) {
      recommendations.push("Programa de indicações");
      recommendations.push("Oferta de benefícios VIP");
    }
    return recommendations;
  };
  PatientSatisfactionMetricsEngine.prototype.getCompetitivePositioning = function (overallScore) {
    if (overallScore >= 4.5) return "Líder de mercado";
    if (overallScore >= 4.0) return "Acima da média";
    if (overallScore >= 3.5) return "Na média do mercado";
    if (overallScore >= 3.0) return "Abaixo da média";
    return "Necessita melhoria urgente";
  };
  return PatientSatisfactionMetricsEngine;
})();
exports.PatientSatisfactionMetricsEngine = PatientSatisfactionMetricsEngine;
