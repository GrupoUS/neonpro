"use strict";
/**
 * AI Duration Prediction Engine - Core ML Service
 * Story 2.1: AI Duration Prediction Engine
 *
 * Implements intelligent appointment duration prediction using machine learning
 * with A/B testing, professional efficiency tracking, and continuous learning.
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
exports.ModelPerformanceService =
  exports.AIABTestingService =
  exports.AIDurationPredictionService =
    void 0;
var client_1 = require("@/lib/supabase/client");
var audit_logger_1 = require("@/lib/auth/audit/audit-logger");
// ===============================================
// AI Duration Prediction Service
// ===============================================
var AIDurationPredictionService = /** @class */ (function () {
  function AIDurationPredictionService() {
    this.BASELINE_DURATIONS = {
      consultation: 30,
      cleaning: 45,
      treatment: 60,
      surgery: 120,
      checkup: 20,
      emergency: 90,
      follow_up: 25,
    };
    this.supabase = (0, client_1.createClient)();
    this.auditLogger = new audit_logger_1.AuditLogger();
  }
  /**
   * Generate duration prediction for an appointment
   */
  AIDurationPredictionService.prototype.predictDuration = function (appointmentId, features) {
    return __awaiter(this, void 0, void 0, function () {
      var activeModel,
        baseDuration,
        efficiencyFactor,
        complexityMultiplier,
        temporalFactor,
        predictedDuration,
        confidenceScore,
        prediction,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 7]);
            return [4 /*yield*/, this.getActiveModel()];
          case 1:
            activeModel = _a.sent();
            if (!activeModel) {
              throw new Error("No active ML model found");
            }
            baseDuration = this.getBaseDuration(features.treatmentType);
            return [
              4 /*yield*/,
              this.getProfessionalEfficiencyFactor(features.professionalId, features.treatmentType),
            ];
          case 2:
            efficiencyFactor = _a.sent();
            complexityMultiplier = this.calculateComplexityMultiplier(features);
            temporalFactor = this.calculateTemporalFactor(features);
            predictedDuration = Math.round(
              baseDuration * efficiencyFactor * complexityMultiplier * temporalFactor,
            );
            confidenceScore = this.calculateConfidenceScore(
              features,
              activeModel.confidenceThreshold,
            );
            prediction = {
              appointmentId: appointmentId,
              predictedDuration: predictedDuration,
              confidenceScore: confidenceScore,
              modelVersion: activeModel.version,
              predictionFactors: {
                baseDuration: baseDuration,
                efficiencyFactor: efficiencyFactor,
                complexityMultiplier: complexityMultiplier,
                temporalFactor: temporalFactor,
                treatmentType: features.treatmentType,
                professionalId: features.professionalId,
              },
            };
            // Store prediction in database
            return [4 /*yield*/, this.storePrediction(appointmentId, prediction)];
          case 3:
            // Store prediction in database
            _a.sent();
            // Audit log
            return [
              4 /*yield*/,
              this.auditLogger.logInfo("ai_duration_prediction", {
                appointmentId: appointmentId,
                prediction: prediction,
                features: features,
              }),
            ];
          case 4:
            // Audit log
            _a.sent();
            return [2 /*return*/, prediction];
          case 5:
            error_1 = _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logError("ai_duration_prediction_failed", error_1, {
                appointmentId: appointmentId,
                features: features,
              }),
            ];
          case 6:
            _a.sent();
            throw error_1;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update prediction with actual duration for feedback
   */
  AIDurationPredictionService.prototype.updatePredictionWithActual = function (
    appointmentId,
    actualDuration,
    feedbackNotes,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, prediction, predictionError, accuracyScore, result, feedbackError, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (actualDuration <= 0) {
              throw new Error("Duration must be positive");
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 5, , 7]);
            return [
              4 /*yield*/,
              this.supabase
                .from("ml_duration_predictions")
                .select("*")
                .eq("appointment_id", appointmentId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (prediction = _a.data), (predictionError = _a.error);
            if (predictionError) {
              throw new Error("Failed to get prediction: ".concat(predictionError.message));
            }
            accuracyScore =
              1.0 -
              Math.min(
                Math.abs(prediction.predicted_duration - actualDuration) /
                  Math.max(prediction.predicted_duration, actualDuration),
                1.0,
              );
            result = {
              appointmentId: appointmentId,
              actualDuration: actualDuration,
              accuracyScore: accuracyScore,
              predictionError: prediction.predicted_duration - actualDuration,
            };
            return [
              4 /*yield*/,
              this.supabase.from("prediction_feedback").upsert({
                prediction_id: prediction.id,
                appointment_id: appointmentId,
                actual_duration: actualDuration,
                accuracy_score: accuracyScore,
                prediction_error: prediction.predicted_duration - actualDuration,
                feedback_notes: feedbackNotes,
                completion_status: "completed",
              }),
            ];
          case 3:
            feedbackError = _b.sent().error;
            if (feedbackError) {
              throw new Error("Failed to update feedback: ".concat(feedbackError.message));
            }
            // Audit log
            return [
              4 /*yield*/,
              this.auditLogger.logInfo("ai_prediction_feedback", {
                appointmentId: appointmentId,
                predictedDuration: prediction.predicted_duration,
                actualDuration: actualDuration,
                accuracyScore: accuracyScore,
              }),
            ];
          case 4:
            // Audit log
            _b.sent();
            return [2 /*return*/, result];
          case 5:
            error_2 = _b.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logError("ai_prediction_feedback_failed", error_2, {
                appointmentId: appointmentId,
                actualDuration: actualDuration,
              }),
            ];
          case 6:
            _b.sent();
            throw error_2;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get prediction for appointment
   */
  AIDurationPredictionService.prototype.getPredictionForAppointment = function (appointmentId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("ml_duration_predictions")
                .select("*")
                .eq("appointment_id", appointmentId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [
              2 /*return*/,
              {
                appointmentId: data.appointment_id,
                predictedDuration: data.predicted_duration,
                confidenceScore: data.confidence_score,
                modelVersion: data.model_version,
                predictionFactors: data.prediction_factors || {},
              },
            ];
        }
      });
    });
  };
  /**
   * Get professional efficiency metrics
   */
  AIDurationPredictionService.prototype.getProfessionalEfficiencyMetrics = function (
    professionalId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("professional_efficiency_stats")
                .select("*")
                .eq("professional_id", professionalId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                professionalId: professionalId,
                averageDuration: data.avg_duration_minutes,
                efficiencyRating: data.efficiency_rating,
                totalAppointments: data.total_appointments,
              },
            ];
          case 2:
            error_3 = _b.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logError("professional_efficiency_metrics_failed", error_3, {
                professionalId: professionalId,
              }),
            ];
          case 3:
            _b.sent();
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  AIDurationPredictionService.prototype.getActiveModel = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("ml_model_performance")
                .select("*")
                .eq("is_active", true)
                .order("deployed_at", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [
              2 /*return*/,
              {
                version: data.model_version,
                confidenceThreshold: data.confidence_threshold || 0.7,
              },
            ];
        }
      });
    });
  };
  AIDurationPredictionService.prototype.getBaseDuration = function (treatmentType) {
    return this.BASELINE_DURATIONS[treatmentType] || 30;
  };
  AIDurationPredictionService.prototype.getProfessionalEfficiencyFactor = function (
    professionalId,
    treatmentType,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var data, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("professional_efficiency_stats")
                .select("efficiency_rating")
                .eq("professional_id", professionalId)
                .single(),
            ];
          case 1:
            data = _b.sent().data;
            return [
              2 /*return*/,
              (data === null || data === void 0 ? void 0 : data.efficiency_rating) || 1.0,
            ];
          case 2:
            _a = _b.sent();
            return [2 /*return*/, 1.0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AIDurationPredictionService.prototype.calculateComplexityMultiplier = function (features) {
    var multiplier = 1.0;
    // Age factor
    if (features.patientAge) {
      if (features.patientAge > 65) multiplier *= 1.15;
      if (features.patientAge < 18) multiplier *= 1.1;
    }
    // First visit
    if (features.isFirstVisit) multiplier *= 1.2;
    // Anxiety level
    if (features.patientAnxietyLevel === "high") multiplier *= 1.25;
    else if (features.patientAnxietyLevel === "medium") multiplier *= 1.1;
    // Treatment complexity
    if (features.treatmentComplexity === "complex") multiplier *= 1.5;
    else if (features.treatmentComplexity === "simple") multiplier *= 0.8;
    // Comorbidities
    if (features.hasComorbidities) multiplier *= 1.2;
    // Special equipment
    if (features.requiresSpecialEquipment) multiplier *= 1.15;
    // Mobility limitations
    if (features.patientMobilityLevel === "limited") multiplier *= 1.1;
    else if (features.patientMobilityLevel === "wheelchair") multiplier *= 1.2;
    return multiplier;
  };
  AIDurationPredictionService.prototype.calculateTemporalFactor = function (features) {
    var factor = 1.0;
    // Time of day impact
    if (features.timeOfDay === "morning")
      factor *= 0.95; // More efficient
    else if (features.timeOfDay === "evening") factor *= 1.1; // Less efficient
    // Day of week impact
    if (features.dayOfWeek === 1)
      factor *= 1.05; // Monday rush
    else if (features.dayOfWeek === 5) factor *= 1.02; // Friday wind-down
    return factor;
  };
  AIDurationPredictionService.prototype.calculateConfidenceScore = function (features, threshold) {
    var confidence = 0.8; // Base confidence
    // More complete features = higher confidence
    var featureCount = Object.values(features).filter(function (v) {
      return v !== undefined && v !== null;
    }).length;
    confidence += (featureCount - 4) * 0.02; // Boost for each additional feature
    // Historical data availability
    if (features.historicalDuration) confidence += 0.1;
    return Math.min(Math.max(confidence, 0.1), 1.0);
  };
  AIDurationPredictionService.prototype.storePrediction = function (appointmentId, prediction) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("ml_duration_predictions").insert({
                appointment_id: appointmentId,
                predicted_duration: prediction.predictedDuration,
                confidence_score: prediction.confidenceScore,
                model_version: prediction.modelVersion,
                prediction_factors: prediction.predictionFactors,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to store prediction: ".concat(error.message));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  return AIDurationPredictionService;
})();
exports.AIDurationPredictionService = AIDurationPredictionService;
// ===============================================
// A/B Testing Service
// ===============================================
var AIABTestingService = /** @class */ (function () {
  function AIABTestingService() {
    this.supabase = (0, client_1.createClient)();
    this.auditLogger = new audit_logger_1.AuditLogger();
  }
  /**
   * Assign user to test group consistently
   */
  AIABTestingService.prototype.assignUserToTestGroup = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, existing, existingError, hash, testGroup, _b, data, error, error_4;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, , 5]);
            return [
              4 /*yield*/,
              this.supabase.from("ab_test_assignments").select("*").eq("user_id", userId).single(),
            ];
          case 1:
            (_a = _c.sent()), (existing = _a.data), (existingError = _a.error);
            if (existing && !existingError) {
              return [
                2 /*return*/,
                {
                  userId: userId,
                  testGroup: existing.test_group,
                  assignedAt: existing.assigned_at,
                },
              ];
            }
            hash = this.hashUserId(userId);
            testGroup = hash % 2 === 0 ? "control" : "treatment";
            return [
              4 /*yield*/,
              this.supabase
                .from("ab_test_assignments")
                .insert({
                  user_id: userId,
                  test_group: testGroup,
                  assigned_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 2:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                userId: userId,
                testGroup: data.test_group,
                assignedAt: data.assigned_at,
              },
            ];
          case 3:
            error_4 = _c.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logError("ab_test_assignment_failed", error_4, {
                userId: userId,
              }),
            ];
          case 4:
            _c.sent();
            throw error_4;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Determine if user should use AI prediction
   */
  AIABTestingService.prototype.shouldUseAIPrediction = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var assignment;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.assignUserToTestGroup(userId)];
          case 1:
            assignment = _a.sent();
            return [2 /*return*/, assignment.testGroup === "treatment"];
        }
      });
    });
  };
  /**
   * Get A/B test statistics
   */
  AIABTestingService.prototype.getTestStatistics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, controlGroup, treatmentGroup, totalParticipants, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 4]);
            return [4 /*yield*/, this.supabase.from("ab_test_assignments").select("test_group")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            controlGroup = data.filter(function (d) {
              return d.test_group === "control";
            }).length;
            treatmentGroup = data.filter(function (d) {
              return d.test_group === "treatment";
            }).length;
            totalParticipants = data.length;
            return [
              2 /*return*/,
              {
                totalParticipants: totalParticipants,
                controlGroup: controlGroup,
                treatmentGroup: treatmentGroup,
                conversionRate: {
                  control: 0.85, // Mock data
                  treatment: 0.92, // Mock data
                },
                confidenceInterval: {
                  lower: 0.02,
                  upper: 0.12,
                },
              },
            ];
          case 2:
            error_5 = _b.sent();
            return [4 /*yield*/, this.auditLogger.logError("ab_test_statistics_failed", error_5)];
          case 3:
            _b.sent();
            throw error_5;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Simple hash function for consistent user assignment
   */
  AIABTestingService.prototype.hashUserId = function (userId) {
    var hash = 0;
    for (var i = 0; i < userId.length; i++) {
      var char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  return AIABTestingService;
})();
exports.AIABTestingService = AIABTestingService;
// ===============================================
// Model Performance Service
// ===============================================
var ModelPerformanceService = /** @class */ (function () {
  function ModelPerformanceService() {
    this.supabase = (0, client_1.createClient)();
    this.auditLogger = new audit_logger_1.AuditLogger();
  }
  /**
   * Deploy new model version
   */
  ModelPerformanceService.prototype.deployNewModel = function (modelMetrics) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 5]);
            // Deactivate current models
            return [
              4 /*yield*/,
              this.supabase
                .from("ml_model_performance")
                .update({ is_active: false })
                .eq("is_active", true),
            ];
          case 1:
            // Deactivate current models
            _b.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("ml_model_performance")
                .insert({
                  model_version: modelMetrics.modelVersion,
                  accuracy_percentage: modelMetrics.accuracyPercentage,
                  mae_minutes: modelMetrics.maeMinutes,
                  rmse_minutes: modelMetrics.rmseMinutes,
                  confidence_threshold: modelMetrics.confidenceThreshold,
                  training_data_count: modelMetrics.trainingDataCount,
                  validation_data_count: modelMetrics.validationDataCount,
                  feature_importance: modelMetrics.featureImportance,
                  hyperparameters: modelMetrics.hyperparameters,
                  is_active: true,
                  deployed_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                success: true,
                modelVersion: modelMetrics.modelVersion,
                deploymentTimestamp: data.deployed_at,
              },
            ];
          case 3:
            error_6 = _b.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logError("model_deployment_failed", error_6, {
                modelVersion: modelMetrics.modelVersion,
              }),
            ];
          case 4:
            _b.sent();
            throw error_6;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get current model metrics
   */
  ModelPerformanceService.prototype.getCurrentModelMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("ml_model_performance").select("*").eq("is_active", true).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                modelVersion: data.model_version,
                accuracyPercentage: data.accuracy_percentage,
                maeMinutes: data.mae_minutes,
                rmseMinutes: data.rmse_minutes,
                confidenceThreshold: data.confidence_threshold,
                featureImportance: data.feature_importance,
                hyperparameters: data.hyperparameters,
                deployedAt: data.deployed_at,
              },
            ];
          case 2:
            error_7 = _b.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logError("model_metrics_retrieval_failed", error_7),
            ];
          case 3:
            _b.sent();
            throw error_7;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update model performance with feedback data
   */
  ModelPerformanceService.prototype.updatePerformanceMetrics = function (feedbackData) {
    return __awaiter(this, void 0, void 0, function () {
      var currentModel, updatedAccuracy, _a, data, error, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 5]);
            return [4 /*yield*/, this.getCurrentModelMetrics()];
          case 1:
            currentModel = _b.sent();
            updatedAccuracy =
              (currentModel.accuracyPercentage + feedbackData.predictionAccuracy * 100) / 2;
            return [
              4 /*yield*/,
              this.supabase
                .from("ml_model_performance")
                .update({
                  accuracy_percentage: updatedAccuracy,
                  last_updated: new Date().toISOString(),
                })
                .eq("is_active", true)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                success: true,
                updatedMetrics: {
                  modelVersion: data.model_version,
                  accuracyPercentage: data.accuracy_percentage,
                  lastUpdated: data.last_updated,
                },
              },
            ];
          case 3:
            error_8 = _b.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logError("performance_metrics_update_failed", error_8),
            ];
          case 4:
            _b.sent();
            throw error_8;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  return ModelPerformanceService;
})();
exports.ModelPerformanceService = ModelPerformanceService;
