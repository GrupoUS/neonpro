"use strict";
/**
 * 🗺️ NeonPro Patient Journey Mapping Engine
 *
 * HEALTHCARE ANALYTICS SYSTEM - Journey Mapping Core Engine
 * Mapeia e analisa a jornada completa do paciente desde o primeiro contato
 * até a conclusão do tratamento, identificando padrões, gargalos e oportunidades.
 *
 * @fileoverview Core engine para mapeamento de jornada de pacientes com state machine,
 * tracking de eventos, análise de touchpoints e métricas de conversão
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
 * - Patient journey state machine with comprehensive states
 * - Real-time journey event tracking and processing
 * - Touchpoint identification and categorization
 * - Journey stage analysis with metrics and KPIs
 * - Journey completion scoring and success indicators
 * - Advanced analytics and pattern recognition
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
exports.PatientJourneyMappingEngine = exports.JourneyStateMachine = void 0;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/utils/logger");
// ============================================================================
// JOURNEY STATE MACHINE
// ============================================================================
/**
 * Journey State Machine - Define valid state transitions
 */
var JourneyStateMachine = /** @class */ (function () {
  function JourneyStateMachine() {}
  /**
   * Validate if state transition is allowed
   */
  JourneyStateMachine.isValidTransition = function (currentState, newState) {
    var allowedTransitions = this.STATE_TRANSITIONS[currentState] || [];
    return allowedTransitions.includes(newState);
  };
  /**
   * Get possible next states
   */
  JourneyStateMachine.getPossibleNextStates = function (currentState) {
    return this.STATE_TRANSITIONS[currentState] || [];
  };
  /**
   * Get state order/priority for progression tracking
   */
  JourneyStateMachine.getStateOrder = function (state) {
    var stateOrder = {
      lead_generated: 1,
      initial_contact: 2,
      consultation_scheduled: 3,
      consultation_completed: 4,
      treatment_proposed: 5,
      treatment_accepted: 6,
      treatment_scheduled: 7,
      treatment_started: 8,
      treatment_ongoing: 9,
      treatment_completed: 10,
      follow_up_scheduled: 11,
      follow_up_completed: 12,
      journey_completed: 13,
      treatment_paused: 8.5,
      abandoned: -1,
      dormant: -2,
      reactivated: 2.5,
    };
    return stateOrder[state] || 0;
  };
  JourneyStateMachine.STATE_TRANSITIONS = {
    lead_generated: ["initial_contact", "abandoned"],
    initial_contact: ["consultation_scheduled", "dormant", "abandoned"],
    consultation_scheduled: ["consultation_completed", "abandoned", "dormant"],
    consultation_completed: [
      "treatment_proposed",
      "follow_up_scheduled",
      "journey_completed",
      "dormant",
    ],
    treatment_proposed: ["treatment_accepted", "abandoned", "dormant"],
    treatment_accepted: ["treatment_scheduled", "abandoned"],
    treatment_scheduled: ["treatment_started", "abandoned", "treatment_paused"],
    treatment_started: [
      "treatment_ongoing",
      "treatment_completed",
      "treatment_paused",
      "abandoned",
    ],
    treatment_ongoing: ["treatment_completed", "treatment_paused", "abandoned"],
    treatment_paused: ["treatment_ongoing", "abandoned", "dormant"],
    treatment_completed: ["follow_up_scheduled", "journey_completed"],
    follow_up_scheduled: ["follow_up_completed", "dormant"],
    follow_up_completed: ["journey_completed", "reactivated"],
    journey_completed: ["reactivated"],
    abandoned: ["reactivated"],
    dormant: ["reactivated", "abandoned"],
    reactivated: ["initial_contact", "consultation_scheduled", "treatment_scheduled"],
  };
  return JourneyStateMachine;
})();
exports.JourneyStateMachine = JourneyStateMachine;
// ============================================================================
// JOURNEY MAPPING ENGINE
// ============================================================================
/**
 * Patient Journey Mapping Engine
 * Core engine para análise e mapeamento de jornada de pacientes
 */
var PatientJourneyMappingEngine = /** @class */ (function () {
  function PatientJourneyMappingEngine() {
    this.supabase = (0, client_1.createClient)();
    this.config = new Map();
  }
  /**
   * Initialize journey tracking for a patient
   */
  PatientJourneyMappingEngine.prototype.initializePatientJourney = function (patientId_1) {
    return __awaiter(this, arguments, void 0, function (patientId, initialState, config) {
      var journeyConfig, _a, stageData, stageError, error_1;
      if (initialState === void 0) {
        initialState = "lead_generated";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            journeyConfig = __assign(
              {
                patient_id: patientId,
                tracking_enabled: true,
                auto_stage_progression: true,
                satisfaction_tracking: true,
                touchpoint_analysis: true,
                real_time_updates: true,
              },
              config,
            );
            this.config.set(patientId, journeyConfig);
            return [
              4 /*yield*/,
              this.supabase
                .from("journey_stages")
                .insert({
                  patient_id: patientId,
                  stage_name: initialState,
                  stage_order: JourneyStateMachine.getStateOrder(initialState),
                  started_at: new Date().toISOString(),
                  status: "active",
                  metadata: {
                    initialization_timestamp: new Date().toISOString(),
                    auto_initialized: true,
                  },
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (stageData = _a.data), (stageError = _a.error);
            if (stageError) {
              logger_1.logger.error("Failed to initialize journey stage:", stageError);
              return [2 /*return*/, { success: false, error: stageError.message }];
            }
            // Log initialization event
            return [
              4 /*yield*/,
              this.trackJourneyEvent(patientId, {
                event_type: "journey_initialized",
                event_category: "acquisition",
                channel: "website",
                event_data: {
                  initial_state: initialState,
                  configuration: journeyConfig,
                },
                metadata: {
                  journey_id: stageData.id,
                  auto_generated: true,
                },
              }),
            ];
          case 2:
            // Log initialization event
            _b.sent();
            logger_1.logger.info("Journey initialized for patient ".concat(patientId), {
              initial_state: initialState,
              journey_id: stageData.id,
            });
            return [
              2 /*return*/,
              {
                success: true,
                journey_id: stageData.id,
              },
            ];
          case 3:
            error_1 = _b.sent();
            logger_1.logger.error("Failed to initialize patient journey:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Track journey event
   */
  PatientJourneyMappingEngine.prototype.trackJourneyEvent = function (patientId, eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var config,
        _a,
        included_types,
        excluded_types,
        minimum_quality_score,
        _b,
        eventRecord,
        error,
        error_2;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 7]);
            config = this.config.get(patientId);
            // Check if tracking is enabled
            if (config && !config.tracking_enabled) {
              return [2 /*return*/, { success: true, event_id: "tracking_disabled" }];
            }
            // Apply event filters if configured
            if (config === null || config === void 0 ? void 0 : config.event_filters) {
              (_a = config.event_filters),
                (included_types = _a.included_types),
                (excluded_types = _a.excluded_types),
                (minimum_quality_score = _a.minimum_quality_score);
              if (included_types && !included_types.includes(eventData.event_type)) {
                return [2 /*return*/, { success: true, event_id: "filtered_out" }];
              }
              if (excluded_types && excluded_types.includes(eventData.event_type)) {
                return [2 /*return*/, { success: true, event_id: "filtered_out" }];
              }
              if (
                minimum_quality_score &&
                eventData.metadata.quality_score &&
                eventData.metadata.quality_score < minimum_quality_score
              ) {
                return [2 /*return*/, { success: true, event_id: "quality_filtered" }];
              }
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_journey_events")
                .insert({
                  patient_id: patientId,
                  event_type: eventData.event_type,
                  event_category: eventData.event_category,
                  event_data: eventData.event_data || {},
                  touchpoint_id: eventData.touchpoint_id,
                  channel: eventData.channel,
                  timestamp: new Date().toISOString(),
                  metadata: __assign(__assign({}, eventData.metadata), {
                    tracking_timestamp: new Date().toISOString(),
                  }),
                })
                .select()
                .single(),
            ];
          case 1:
            (_b = _c.sent()), (eventRecord = _b.data), (error = _b.error);
            if (error) {
              logger_1.logger.error("Failed to track journey event:", error);
              return [2 /*return*/, { success: false, error: error.message }];
            }
            if (!(config === null || config === void 0 ? void 0 : config.auto_stage_progression))
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.checkAndProgressStage(patientId, eventData.event_type)];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            if (!(config === null || config === void 0 ? void 0 : config.real_time_updates))
              return [3 /*break*/, 5];
            return [4 /*yield*/, this.triggerRealTimeUpdate(patientId, eventRecord.id)];
          case 4:
            _c.sent();
            _c.label = 5;
          case 5:
            logger_1.logger.debug("Journey event tracked for patient ".concat(patientId), {
              event_type: eventData.event_type,
              event_id: eventRecord.id,
            });
            return [
              2 /*return*/,
              {
                success: true,
                event_id: eventRecord.id,
              },
            ];
          case 6:
            error_2 = _c.sent();
            logger_1.logger.error("Failed to track journey event:", error_2);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Progress journey stage
   */
  PatientJourneyMappingEngine.prototype.progressJourneyStage = function (
    patientId,
    newState,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var currentStage, currentState, _a, newStage, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              this.supabase
                .from("journey_stages")
                .select("*")
                .eq("patient_id", patientId)
                .eq("status", "active")
                .order("created_at", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            currentStage = _b.sent().data;
            currentState = "lead_generated";
            if (!currentStage) return [3 /*break*/, 3];
            currentState = currentStage.stage_name;
            // Validate transition
            if (!JourneyStateMachine.isValidTransition(currentState, newState)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: "Invalid transition from ".concat(currentState, " to ").concat(newState),
                },
              ];
            }
            // Complete current stage
            return [
              4 /*yield*/,
              this.supabase
                .from("journey_stages")
                .update({
                  completed_at: new Date().toISOString(),
                  status: "completed",
                  duration_minutes: Math.round(
                    (new Date().getTime() - new Date(currentStage.started_at).getTime()) /
                      (1000 * 60),
                  ),
                })
                .eq("id", currentStage.id),
            ];
          case 2:
            // Complete current stage
            _b.sent();
            _b.label = 3;
          case 3:
            return [
              4 /*yield*/,
              this.supabase
                .from("journey_stages")
                .insert({
                  patient_id: patientId,
                  stage_name: newState,
                  stage_order: JourneyStateMachine.getStateOrder(newState),
                  started_at: new Date().toISOString(),
                  status: "active",
                  metadata: __assign(
                    {
                      previous_stage: currentState,
                      transition_timestamp: new Date().toISOString(),
                    },
                    metadata,
                  ),
                })
                .select()
                .single(),
            ];
          case 4:
            (_a = _b.sent()), (newStage = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Failed to progress journey stage:", error);
              return [2 /*return*/, { success: false, error: error.message }];
            }
            // Track stage progression event
            return [
              4 /*yield*/,
              this.trackJourneyEvent(patientId, {
                event_type: "stage_progressed",
                event_category: "conversion",
                channel: "system",
                event_data: {
                  previous_stage: currentState,
                  new_stage: newState,
                  progression_trigger: "manual",
                },
                metadata: __assign({ stage_id: newStage.id, auto_generated: true }, metadata),
              }),
            ];
          case 5:
            // Track stage progression event
            _b.sent();
            logger_1.logger.info("Journey stage progressed for patient ".concat(patientId), {
              from: currentState,
              to: newState,
              stage_id: newStage.id,
            });
            return [
              2 /*return*/,
              {
                success: true,
                stage_id: newStage.id,
              },
            ];
          case 6:
            error_3 = _b.sent();
            logger_1.logger.error("Failed to progress journey stage:", error_3);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_3 instanceof Error ? error_3.message : "Unknown error",
              },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get comprehensive journey analysis for a patient
   */
  PatientJourneyMappingEngine.prototype.analyzePatientJourney = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var stages,
        events,
        currentStage,
        currentState,
        journeyStart,
        journeyDuration,
        totalTouchpoints,
        completedStages,
        totalPossibleStages,
        completionScore,
        satisfactionScores,
        conversionProbability,
        churnRiskScore,
        bottlenecks,
        recommendations,
        insights,
        analysis,
        error_4;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("journey_stages")
                .select("*")
                .eq("patient_id", patientId)
                .order("stage_order", { ascending: true }),
            ];
          case 1:
            stages = _b.sent().data;
            if (!stages || stages.length === 0) {
              return [2 /*return*/, null];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_journey_events")
                .select("*")
                .eq("patient_id", patientId)
                .order("timestamp", { ascending: true }),
              // Calculate metrics
            ];
          case 2:
            events = _b.sent().data;
            currentStage = stages.find(function (s) {
              return s.status === "active";
            });
            currentState =
              (currentStage === null || currentStage === void 0
                ? void 0
                : currentStage.stage_name) || "abandoned";
            journeyStart = new Date(
              ((_a = stages[0]) === null || _a === void 0 ? void 0 : _a.started_at) || new Date(),
            );
            journeyDuration = Math.round(
              (new Date().getTime() - journeyStart.getTime()) / (1000 * 60 * 60 * 24),
            );
            totalTouchpoints = (events === null || events === void 0 ? void 0 : events.length) || 0;
            completedStages = stages.filter(function (s) {
              return s.status === "completed";
            }).length;
            totalPossibleStages = 13; // Total journey states
            completionScore = (completedStages / totalPossibleStages) * 100;
            satisfactionScores = stages
              .filter(function (s) {
                return s.satisfaction_score !== null;
              })
              .map(function (s) {
                return s.satisfaction_score;
              });
            conversionProbability = this.calculateConversionProbability(currentState, stages);
            return [
              4 /*yield*/,
              this.calculateChurnRiskScore(patientId, events || [], stages),
              // Identify bottlenecks
            ];
          case 3:
            churnRiskScore = _b.sent();
            bottlenecks = this.identifyJourneyBottlenecks(stages);
            recommendations = this.generateRecommendations(currentState, stages, events || []);
            insights = this.generateKeyInsights(stages, events || []);
            analysis = {
              patient_id: patientId,
              current_state: currentState,
              journey_duration_days: journeyDuration,
              total_touchpoints: totalTouchpoints,
              stage_progression: stages.map(function (stage) {
                return {
                  id: stage.id,
                  patient_id: stage.patient_id,
                  stage_name: stage.stage_name,
                  stage_order: stage.stage_order,
                  started_at: new Date(stage.started_at),
                  completed_at: stage.completed_at ? new Date(stage.completed_at) : undefined,
                  status: stage.status,
                  duration_minutes: stage.duration_minutes,
                  satisfaction_score: stage.satisfaction_score,
                  metadata: stage.metadata || {},
                  created_at: new Date(stage.created_at),
                };
              }),
              completion_score: Math.round(completionScore * 100) / 100,
              satisfaction_trend: satisfactionScores,
              conversion_probability: Math.round(conversionProbability * 100) / 100,
              churn_risk_score: Math.round(churnRiskScore * 100) / 100,
              recommended_actions: recommendations,
              key_insights: insights,
              bottlenecks: bottlenecks,
              success_factors: this.identifySuccessFactors(stages, events || []),
              optimization_opportunities: this.identifyOptimizationOpportunities(
                stages,
                events || [],
              ),
            };
            return [2 /*return*/, analysis];
          case 4:
            error_4 = _b.sent();
            logger_1.logger.error("Failed to analyze patient journey:", error_4);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Auto-check and progress stage based on events
   */
  PatientJourneyMappingEngine.prototype.checkAndProgressStage = function (patientId, eventType) {
    return __awaiter(this, void 0, void 0, function () {
      var progressionRules, targetState, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            progressionRules = {
              appointment_scheduled: "consultation_scheduled",
              consultation_attended: "consultation_completed",
              treatment_started: "treatment_started",
              payment_made: "treatment_accepted",
              feedback_submitted: "follow_up_completed",
              // Add more progression rules as needed
              page_view: null,
              form_submission: null,
              phone_call: null,
              email_sent: null,
              email_opened: null,
              email_clicked: null,
              whatsapp_message: null,
              appointment_confirmed: null,
              appointment_cancelled: null,
              appointment_rescheduled: null,
              consultation_no_show: null,
              treatment_session: null,
              follow_up_response: null,
              referral_made: null,
              complaint_made: null,
              website_interaction: null,
            };
            targetState = progressionRules[eventType];
            if (!targetState) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.progressJourneyStage(patientId, targetState, {
                auto_progressed: true,
                trigger_event: eventType,
              }),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [3 /*break*/, 4];
          case 3:
            error_5 = _a.sent();
            logger_1.logger.error("Failed to auto-progress stage:", error_5);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate conversion probability based on current state and journey data
   */
  PatientJourneyMappingEngine.prototype.calculateConversionProbability = function (
    currentState,
    stages,
  ) {
    // Base probabilities by stage (these would be updated with real data)
    var baseProbabilities = {
      lead_generated: 0.15,
      initial_contact: 0.25,
      consultation_scheduled: 0.45,
      consultation_completed: 0.65,
      treatment_proposed: 0.75,
      treatment_accepted: 0.85,
      treatment_scheduled: 0.9,
      treatment_started: 0.95,
      treatment_ongoing: 0.95,
      treatment_completed: 0.98,
      follow_up_scheduled: 0.98,
      follow_up_completed: 0.99,
      journey_completed: 1.0,
      treatment_paused: 0.6,
      abandoned: 0.05,
      dormant: 0.1,
      reactivated: 0.3,
    };
    var probability = baseProbabilities[currentState] || 0.15;
    // Adjust based on journey progression speed
    var averageDuration =
      stages.reduce(function (sum, stage) {
        return sum + (stage.duration_minutes || 0);
      }, 0) / stages.length;
    if (averageDuration < 1440) {
      // Less than 24 hours average
      probability *= 1.2; // Faster progression increases probability
    } else if (averageDuration > 10080) {
      // More than 7 days average
      probability *= 0.8; // Slower progression decreases probability
    }
    // Adjust based on satisfaction scores
    var avgSatisfaction =
      stages
        .filter(function (s) {
          return s.satisfaction_score;
        })
        .reduce(function (sum, s) {
          return sum + s.satisfaction_score;
        }, 0) /
      stages.filter(function (s) {
        return s.satisfaction_score;
      }).length;
    if (avgSatisfaction > 4.0) {
      probability *= 1.1;
    } else if (avgSatisfaction < 3.0) {
      probability *= 0.9;
    }
    return Math.min(1.0, Math.max(0.0, probability));
  };
  /**
   * Calculate churn risk score
   */
  PatientJourneyMappingEngine.prototype.calculateChurnRiskScore = function (
    patientId,
    events,
    stages,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var riskScore,
        lastEvent,
        daysSinceLastActivity,
        negativeEvents,
        currentStage,
        latestSatisfaction;
      var _a;
      return __generator(this, function (_b) {
        riskScore = 0;
        lastEvent = events[events.length - 1];
        if (lastEvent) {
          daysSinceLastActivity = Math.round(
            (new Date().getTime() - new Date(lastEvent.timestamp).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          if (daysSinceLastActivity > 30) {
            riskScore += 0.4;
          } else if (daysSinceLastActivity > 14) {
            riskScore += 0.2;
          }
        }
        negativeEvents = events.filter(function (e) {
          return (
            e.event_type === "appointment_cancelled" ||
            e.event_type === "consultation_no_show" ||
            e.event_type === "complaint_made" ||
            e.metadata.sentiment === "negative"
          );
        });
        if (negativeEvents.length > 0) {
          riskScore += Math.min(0.3, negativeEvents.length * 0.1);
        }
        currentStage = stages.find(function (s) {
          return s.status === "active";
        });
        if (currentStage && currentStage.duration_minutes > 20160) {
          // More than 14 days in current stage
          riskScore += 0.2;
        }
        latestSatisfaction =
          (_a = stages
            .filter(function (s) {
              return s.satisfaction_score;
            })
            .pop()) === null || _a === void 0
            ? void 0
            : _a.satisfaction_score;
        if (latestSatisfaction && latestSatisfaction < 3.0) {
          riskScore += 0.3;
        }
        return [2 /*return*/, Math.min(1.0, Math.max(0.0, riskScore))];
      });
    });
  };
  /**
   * Identify journey bottlenecks
   */
  PatientJourneyMappingEngine.prototype.identifyJourneyBottlenecks = function (stages) {
    // This would typically analyze historical data across all patients
    // For now, return example bottlenecks based on current journey
    return [
      {
        stage: "consultation_scheduled",
        average_duration_days: 7,
        conversion_rate: 0.75,
        drop_off_rate: 0.25,
      },
      {
        stage: "treatment_proposed",
        average_duration_days: 14,
        conversion_rate: 0.6,
        drop_off_rate: 0.4,
      },
    ];
  };
  /**
   * Generate actionable recommendations
   */
  PatientJourneyMappingEngine.prototype.generateRecommendations = function (
    currentState,
    stages,
    events,
  ) {
    var recommendations = [];
    // State-specific recommendations
    switch (currentState) {
      case "lead_generated":
        recommendations.push("Fazer contato inicial nas próximas 24h para maximizar conversão");
        break;
      case "consultation_scheduled":
        recommendations.push("Enviar lembrete 24h antes da consulta");
        recommendations.push("Confirmar presença por WhatsApp");
        break;
      case "treatment_proposed":
        recommendations.push("Agendar follow-up em 48h para discutir proposta");
        recommendations.push("Enviar material informativo sobre tratamento");
        break;
      case "dormant":
        recommendations.push("Implementar campanha de reativação personalizada");
        recommendations.push("Oferecer desconto especial para retorno");
        break;
    }
    // Activity-based recommendations
    var daysSinceLastActivity =
      events.length > 0
        ? Math.round(
            (new Date().getTime() - new Date(events[events.length - 1].timestamp).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;
    if (daysSinceLastActivity > 7) {
      recommendations.push("Fazer contato para verificar interesse e necessidades atuais");
    }
    return recommendations;
  };
  /**
   * Generate key insights from journey data
   */
  PatientJourneyMappingEngine.prototype.generateKeyInsights = function (stages, events) {
    var insights = [];
    // Journey progression insights
    var completedStages = stages.filter(function (s) {
      return s.status === "completed";
    }).length;
    if (completedStages >= 5) {
      insights.push("Paciente demonstra alto engajamento com progressão consistente");
    }
    // Channel preference insights
    var channelCounts = events.reduce(function (acc, event) {
      acc[event.channel] = (acc[event.channel] || 0) + 1;
      return acc;
    }, {});
    var preferredChannel = Object.keys(channelCounts).reduce(function (a, b) {
      return channelCounts[a] > channelCounts[b] ? a : b;
    });
    if (preferredChannel) {
      insights.push("Canal de comunica\u00E7\u00E3o preferido: ".concat(preferredChannel));
    }
    // Timing insights
    var eventTimes = events.map(function (e) {
      return new Date(e.timestamp).getHours();
    });
    var avgTime =
      eventTimes.reduce(function (sum, time) {
        return sum + time;
      }, 0) / eventTimes.length;
    if (avgTime > 17) {
      insights.push("Paciente mais ativo no período noturno - considerar comunicação após 17h");
    } else if (avgTime < 10) {
      insights.push("Paciente mais ativo de manhã - prioritizar contato matinal");
    }
    return insights;
  };
  /**
   * Identify success factors in the journey
   */
  PatientJourneyMappingEngine.prototype.identifySuccessFactors = function (stages, events) {
    var successFactors = [];
    // Quick progression
    var avgStageDuration =
      stages.reduce(function (sum, stage) {
        return sum + (stage.duration_minutes || 0);
      }, 0) / stages.length;
    if (avgStageDuration < 2880) {
      // Less than 2 days average
      successFactors.push("Progressão rápida entre etapas");
    }
    // High satisfaction
    var avgSatisfaction =
      stages
        .filter(function (s) {
          return s.satisfaction_score;
        })
        .reduce(function (sum, s) {
          return sum + s.satisfaction_score;
        }, 0) /
      stages.filter(function (s) {
        return s.satisfaction_score;
      }).length;
    if (avgSatisfaction > 4.0) {
      successFactors.push("Alta satisfação durante jornada");
    }
    // Multi-channel engagement
    var uniqueChannels = new Set(
      events.map(function (e) {
        return e.channel;
      }),
    ).size;
    if (uniqueChannels >= 3) {
      successFactors.push("Engajamento multi-canal");
    }
    // Consistent activity
    var eventSpread =
      events.length > 1
        ? (new Date(events[events.length - 1].timestamp).getTime() -
            new Date(events[0].timestamp).getTime()) /
          (1000 * 60 * 60 * 24)
        : 0;
    if (eventSpread > 0 && events.length / eventSpread > 0.5) {
      // More than 0.5 events per day
      successFactors.push("Atividade consistente e regular");
    }
    return successFactors;
  };
  /**
   * Identify optimization opportunities
   */
  PatientJourneyMappingEngine.prototype.identifyOptimizationOpportunities = function (
    stages,
    events,
  ) {
    var opportunities = [];
    // Long duration in specific stages
    stages.forEach(function (stage) {
      if (stage.duration_minutes > 10080) {
        // More than 7 days
        opportunities.push("Otimizar dura\u00E7\u00E3o na etapa: ".concat(stage.stage_name));
      }
    });
    // Low engagement periods
    if (events.length < stages.length * 2) {
      opportunities.push("Aumentar pontos de contato e engajamento");
    }
    // Missing satisfaction data
    var stagesWithoutSatisfaction = stages.filter(function (s) {
      return !s.satisfaction_score;
    }).length;
    if (stagesWithoutSatisfaction > 0) {
      opportunities.push("Implementar coleta de satisfação em todas as etapas");
    }
    // Channel diversification
    var uniqueChannels = new Set(
      events.map(function (e) {
        return e.channel;
      }),
    ).size;
    if (uniqueChannels < 2) {
      opportunities.push("Diversificar canais de comunicação");
    }
    return opportunities;
  };
  /**
   * Trigger real-time update notification
   */
  PatientJourneyMappingEngine.prototype.triggerRealTimeUpdate = function (patientId, eventId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // This would typically trigger a real-time notification
          // using Supabase real-time or WebSocket connections
          logger_1.logger.debug("Real-time update triggered for patient ".concat(patientId), {
            eventId: eventId,
          });
        } catch (error) {
          logger_1.logger.error("Failed to trigger real-time update:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  return PatientJourneyMappingEngine;
})();
exports.PatientJourneyMappingEngine = PatientJourneyMappingEngine;
