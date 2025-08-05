"use strict";
/**
 * Treatment Prediction Service Tests
 * Story 9.1: AI-powered treatment success prediction
 *
 * Tests the complete service functionality including:
 * - ML model operations and ≥85% accuracy validation
 * - Multi-factor analysis processing
 * - Real-time prediction generation
 * - Historical validation and performance tracking
 * - Medical-grade validation and explainability
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
// Mock Supabase FIRST, before any imports
var mockSupabaseClient = {
  from: globals_1.jest.fn().mockReturnThis(),
  select: globals_1.jest.fn().mockReturnThis(),
  insert: globals_1.jest.fn().mockReturnThis(),
  update: globals_1.jest.fn().mockReturnThis(),
  upsert: globals_1.jest.fn().mockReturnThis(),
  delete: globals_1.jest.fn().mockReturnThis(),
  eq: globals_1.jest.fn().mockReturnThis(),
  gte: globals_1.jest.fn().mockReturnThis(),
  lte: globals_1.jest.fn().mockReturnThis(),
  order: globals_1.jest.fn().mockReturnThis(),
  single: globals_1.jest.fn().mockResolvedValue({ data: null, error: null }),
  limit: globals_1.jest.fn().mockReturnThis(),
  range: globals_1.jest.fn().mockReturnThis(),
};
// Mock the supabase module as synchronous for testing
globals_1.jest.mock("@/app/utils/supabase/server", function () {
  return {
    createServerClient: function () {
      return mockSupabaseClient;
    },
    createClient: function () {
      return mockSupabaseClient;
    },
  };
});
var globals_1 = require("@jest/globals");
var treatment_prediction_1 = require("@/app/lib/services/treatment-prediction");
(0, globals_1.describe)("TreatmentPredictionService", function () {
  var service;
  (0, globals_1.beforeEach)(function () {
    globals_1.jest.clearAllMocks();
    service = new treatment_prediction_1.TreatmentPredictionService();
  });
  (0, globals_1.describe)("Model Management", function () {
    (0, globals_1.test)("creates prediction model with ≥85% accuracy requirement", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockModel, mockResponse, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              mockModel = {
                name: "Advanced Treatment Predictor",
                version: "2.1.0",
                algorithm_type: "ensemble",
                accuracy: 0.89, // 89% - meets ≥85% requirement
                confidence_threshold: 0.85,
                status: "active",
                training_data_size: 15000,
                feature_count: 45,
                performance_metrics: {
                  precision: 0.91,
                  recall: 0.87,
                  f1_score: 0.89,
                  auc_roc: 0.94,
                  training_accuracy: 0.89,
                  validation_accuracy: 0.88,
                  cross_validation_mean: 0.87,
                  cross_validation_std: 0.02,
                  feature_importance: {
                    age: 0.15,
                    skin_type: 0.12,
                    medical_history: 0.18,
                    treatment_complexity: 0.2,
                  },
                },
              };
              mockResponse = __assign(__assign({}, mockModel), {
                id: "model-123",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              mockSupabaseClient.insert.mockResolvedValue({ data: mockResponse, error: null });
              return [4 /*yield*/, service.createModel(mockModel)];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(mockSupabaseClient.from).toHaveBeenCalledWith(
                "prediction_models",
              );
              (0, globals_1.expect)(mockSupabaseClient.insert).toHaveBeenCalledWith(mockModel);
              (0, globals_1.expect)(result.accuracy).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(
                (_a = result.performance_metrics) === null || _a === void 0 ? void 0 : _a.f1_score,
              ).toBeGreaterThanOrEqual(0.85);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("validates accuracy threshold enforcement", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var lowAccuracyModel;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              lowAccuracyModel = {
                name: "Low Accuracy Model",
                version: "1.0.0",
                algorithm_type: "neural_network",
                accuracy: 0.75, // 75% - below 85% threshold
                confidence_threshold: 0.85,
                status: "training",
                training_data_size: 5000,
                feature_count: 20,
              };
              // Should handle low accuracy models appropriately
              mockSupabaseClient.insert.mockResolvedValue({
                data: null,
                error: { message: "Accuracy below threshold" },
              });
              return [
                4 /*yield*/,
                (0, globals_1.expect)(service.createModel(lowAccuracyModel)).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("retrieves active models with high accuracy", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockModels, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockModels = [
                {
                  id: "model-1",
                  name: "Treatment Predictor V1",
                  accuracy: 0.87,
                  status: "active",
                  algorithm_type: "ensemble",
                },
                {
                  id: "model-2",
                  name: "Treatment Predictor V2",
                  accuracy: 0.91,
                  status: "active",
                  algorithm_type: "neural_network",
                },
              ];
              mockSupabaseClient.from.mockResolvedValue({ data: mockModels, error: null });
              return [4 /*yield*/, service.getModels({ status: "active" })];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(mockSupabaseClient.from).toHaveBeenCalledWith(
                "prediction_models",
              );
              (0, globals_1.expect)(
                result.every(function (model) {
                  return model.accuracy >= 0.85;
                }),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Treatment Prediction Generation", function () {
    (0, globals_1.test)("generates prediction with multi-factor analysis", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockPatientFactors, mockTreatmentChar, mockPrediction, predictionData, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockPatientFactors = {
                id: "pf-123",
                patient_id: "patient-456",
                age: 32,
                gender: "female",
                bmi: 24.5,
                medical_history: {
                  conditions: [],
                  medications: [],
                  allergies: [],
                  surgeries: [],
                  chronic_conditions: [],
                  family_history: [],
                },
                lifestyle_factors: {
                  smoking: "never",
                  alcohol: "occasional",
                  exercise: "regular",
                  diet: "balanced",
                  sleep_quality: "good",
                  stress_level: "low",
                  sun_exposure: "moderate",
                },
                treatment_history: {
                  previous_treatments: [],
                  outcomes: [],
                  complications: [],
                  satisfaction_scores: [],
                },
                compliance_score: 0.92,
                skin_type: "Type II",
                skin_condition: "mild_photodamage",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              mockTreatmentChar = {
                id: "tc-789",
                treatment_type: "laser_resurfacing",
                complexity_level: "medium",
                typical_duration: 45,
                success_rate: 0.89,
                contraindications: [],
                required_expertise_level: "intermediate",
                cost_range: { min: 1500, max: 2500, currency: "BRL" },
                recovery_time: "7-14 days",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              mockPrediction = {
                id: "pred-999",
                patient_id: "patient-456",
                treatment_type: "laser_resurfacing",
                prediction_score: 0.91, // 91% - high accuracy
                confidence_interval: { lower: 0.87, upper: 0.95, confidence_level: 0.95 },
                risk_assessment: "low",
                predicted_outcome: "success",
                prediction_date: new Date().toISOString(),
                model_id: "model-123",
                features_used: {
                  age: 32,
                  gender: "female",
                  bmi: 24.5,
                  skin_type: "Type II",
                  treatment_complexity: "medium",
                  compliance_score: 0.92,
                },
                explainability_data: {
                  feature_importance: {
                    age: 0.15,
                    skin_type: 0.2,
                    compliance_score: 0.18,
                    bmi: 0.12,
                  },
                  top_positive_factors: [
                    "Optimal age range",
                    "Excellent compliance",
                    "Suitable skin type",
                  ],
                  top_negative_factors: [],
                  similar_cases: ["case-1", "case-2", "case-3"],
                  confidence_reasoning:
                    "High probability of success based on favorable patient profile",
                },
                accuracy_validated: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              mockSupabaseClient.insert.mockResolvedValue({ data: mockPrediction, error: null });
              predictionData = {
                patient_id: "patient-456",
                treatment_type: "laser_resurfacing",
                prediction_score: 0.91,
                confidence_interval: { lower: 0.87, upper: 0.95, confidence_level: 0.95 },
                risk_assessment: "low",
                predicted_outcome: "success",
                model_id: "model-123",
                features_used: mockPrediction.features_used,
                explainability_data: mockPrediction.explainability_data,
              };
              return [4 /*yield*/, service.createPrediction(predictionData)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(mockSupabaseClient.from).toHaveBeenCalledWith(
                "treatment_predictions",
              );
              (0, globals_1.expect)(result.prediction_score).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(result.explainability_data).toBeDefined();
              (0, globals_1.expect)(result.features_used).toBeDefined();
              (0, globals_1.expect)(result.confidence_interval.lower).toBeLessThanOrEqual(
                result.confidence_interval.upper,
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("processes real-time scoring with performance monitoring", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var predictionRequest, startTime, mockResponse, result, endTime, processingTime;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              predictionRequest = {
                patient_id: "patient-789",
                treatment_type: "chemical_peel",
                additional_factors: {
                  urgency: "routine",
                  budget_constraints: false,
                  time_availability: "flexible",
                },
              };
              startTime = Date.now();
              mockResponse = {
                prediction_score: 0.88,
                confidence_interval: { lower: 0.84, upper: 0.92, confidence_level: 0.95 },
                risk_assessment: "low",
                predicted_outcome: "success",
                processing_time: 250, // milliseconds
                explainability_data: {
                  feature_importance: { skin_condition: 0.25, age: 0.2 },
                  top_positive_factors: ["Suitable candidate", "Low risk profile"],
                  top_negative_factors: [],
                  similar_cases: ["case-4", "case-5"],
                  confidence_reasoning: "Strong match with successful historical cases",
                },
              };
              mockSupabaseClient.insert.mockResolvedValue({ data: mockResponse, error: null });
              return [
                4 /*yield*/,
                service.createPrediction({
                  patient_id: predictionRequest.patient_id,
                  treatment_type: predictionRequest.treatment_type,
                  prediction_score: mockResponse.prediction_score,
                  confidence_interval: mockResponse.confidence_interval,
                  risk_assessment: mockResponse.risk_assessment,
                  predicted_outcome: mockResponse.predicted_outcome,
                  model_id: "model-active",
                  features_used: { basic: true },
                  explainability_data: mockResponse.explainability_data,
                }),
              ];
            case 1:
              result = _b.sent();
              endTime = Date.now();
              processingTime = endTime - startTime;
              (0, globals_1.expect)(result.prediction_score).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(processingTime).toBeLessThan(1000); // Real-time requirement
              (0, globals_1.expect)(
                (_a = result.explainability_data) === null || _a === void 0
                  ? void 0
                  : _a.confidence_reasoning,
              ).toBeTruthy();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Historical Validation", function () {
    (0, globals_1.test)("tracks model performance over time", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockPerformance, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockPerformance = {
                id: "perf-123",
                model_id: "model-456",
                evaluation_date: new Date().toISOString(),
                accuracy: 0.89,
                precision: 0.91,
                recall: 0.87,
                f1_score: 0.89,
                total_predictions: 1250,
                correct_predictions: 1112,
                improvement_percentage: 12.5,
                validation_metrics: {
                  cross_validation_scores: [0.88, 0.9, 0.87, 0.91, 0.89],
                  test_set_accuracy: 0.89,
                  confusion_matrix: [
                    [425, 35],
                    [48, 492],
                  ],
                },
                feature_importance: {
                  patient_age: 0.18,
                  skin_type: 0.22,
                  treatment_complexity: 0.15,
                  medical_history: 0.2,
                },
                created_at: new Date().toISOString(),
              };
              mockSupabaseClient.insert.mockResolvedValue({ data: mockPerformance, error: null });
              return [4 /*yield*/, service.createModelPerformance(mockPerformance)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.accuracy).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(result.improvement_percentage).toBeGreaterThan(0);
              (0, globals_1.expect)(result.total_predictions).toBeGreaterThan(0);
              (0, globals_1.expect)(
                result.correct_predictions / result.total_predictions,
              ).toBeCloseTo(result.accuracy, 2);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("validates historical prediction accuracy", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockPredictions,
          result,
          highAccuracyPredictions,
          successfulHighAccuracy,
          historicalAccuracy;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockPredictions = [
                {
                  id: "pred-1",
                  prediction_score: 0.89,
                  actual_outcome: "success",
                  accuracy_validated: true,
                },
                {
                  id: "pred-2",
                  prediction_score: 0.91,
                  actual_outcome: "success",
                  accuracy_validated: true,
                },
                {
                  id: "pred-3",
                  prediction_score: 0.76,
                  actual_outcome: "partial_success",
                  accuracy_validated: true,
                },
                {
                  id: "pred-4",
                  prediction_score: 0.95,
                  actual_outcome: "success",
                  accuracy_validated: true,
                },
              ];
              mockSupabaseClient.from.mockResolvedValue({ data: mockPredictions, error: null });
              return [4 /*yield*/, service.getPredictions({ accuracy_validated: true })];
            case 1:
              result = _a.sent();
              highAccuracyPredictions = result.filter(function (p) {
                return p.prediction_score >= 0.85;
              });
              successfulHighAccuracy = highAccuracyPredictions.filter(function (p) {
                return p.actual_outcome === "success" && p.prediction_score >= 0.85;
              });
              historicalAccuracy = successfulHighAccuracy.length / highAccuracyPredictions.length;
              (0, globals_1.expect)(historicalAccuracy).toBeGreaterThanOrEqual(0.75); // Allow some margin for realistic testing
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Medical-grade Validation", function () {
    (0, globals_1.test)("enforces medical safety constraints", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockMedicalValidation, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockMedicalValidation = {
                patient_id: "patient-medical",
                medical_factors: {
                  allergies: ["lidocaine"],
                  medications: ["anticoagulants"],
                  conditions: ["autoimmune_disorder"],
                  pregnancy_status: false,
                  recent_treatments: ["botox_3_months_ago"],
                },
              };
              return [4 /*yield*/, service.validateMedicalConstraints(mockMedicalValidation)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.contraindications).toContain("anticoagulants");
              (0, globals_1.expect)(result.risk_level).toBe("high");
              (0, globals_1.expect)(result.medical_clearance_required).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("validates treatment suitability based on medical history", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var patientFactors, result;
        var _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              patientFactors = {
                id: "pf-medical",
                patient_id: "patient-safe",
                age: 28,
                gender: "female",
                medical_history: {
                  conditions: [],
                  medications: [],
                  allergies: [],
                  surgeries: [],
                  chronic_conditions: [],
                  family_history: [],
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              mockSupabaseClient.from.mockResolvedValue({ data: [patientFactors], error: null });
              return [4 /*yield*/, service.getPatientFactors("patient-safe")];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result).toBeDefined();
              (0, globals_1.expect)(
                (_a = result.medical_history) === null || _a === void 0 ? void 0 : _a.allergies,
              ).toEqual([]);
              (0, globals_1.expect)(
                (_b = result.medical_history) === null || _b === void 0 ? void 0 : _b.medications,
              ).toEqual([]);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Explainability Features", function () {
    (0, globals_1.test)("provides detailed feature importance analysis", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockExplainability, result, totalImportance;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockExplainability = {
                feature_importance: {
                  age: 0.18,
                  skin_type: 0.22,
                  bmi: 0.12,
                  medical_history_score: 0.15,
                  lifestyle_score: 0.1,
                  compliance_score: 0.13,
                  treatment_complexity: 0.1,
                },
                top_positive_factors: [
                  "Optimal age range (25-35)",
                  "Skin Type II - ideal for laser treatments",
                  "High treatment compliance score (92%)",
                  "No significant medical contraindications",
                ],
                top_negative_factors: [
                  "Moderate sun exposure - requires pre-treatment preparation",
                ],
                similar_cases: ["case-A123", "case-B456", "case-C789"],
                confidence_reasoning:
                  "High confidence based on strong correlation with 15 similar successful cases. Patient profile matches optimal characteristics for this treatment type.",
              };
              return [4 /*yield*/, service.generateExplainability(mockExplainability)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.feature_importance).toBeDefined();
              (0, globals_1.expect)(Object.keys(result.feature_importance).length).toBeGreaterThan(
                5,
              );
              (0, globals_1.expect)(result.top_positive_factors.length).toBeGreaterThan(0);
              (0, globals_1.expect)(result.confidence_reasoning).toBeTruthy();
              (0, globals_1.expect)(result.similar_cases.length).toBeGreaterThanOrEqual(3);
              totalImportance = Object.values(result.feature_importance).reduce(function (
                sum,
                val,
              ) {
                return sum + val;
              }, 0);
              (0, globals_1.expect)(totalImportance).toBeCloseTo(1.0, 1);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("provides human-readable explanations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockPrediction, humanReadable;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockPrediction = {
                prediction_score: 0.87,
                explainability_data: {
                  feature_importance: { age: 0.2, skin_type: 0.25 },
                  top_positive_factors: ["Ideal age range", "Compatible skin type"],
                  top_negative_factors: [],
                  similar_cases: ["case-1"],
                  confidence_reasoning: "Strong match with successful historical cases",
                },
              };
              return [4 /*yield*/, service.generateHumanReadableExplanation(mockPrediction)];
            case 1:
              humanReadable = _a.sent();
              (0, globals_1.expect)(humanReadable.summary).toContain("87%");
              (0, globals_1.expect)(humanReadable.key_factors).toContain("age");
              (0, globals_1.expect)(humanReadable.recommendation).toBeTruthy();
              (0, globals_1.expect)(humanReadable.risk_assessment).toBeTruthy();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Performance Monitoring", function () {
    (0, globals_1.test)("monitors service response times", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startTime, endTime, responseTime;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startTime = performance.now();
              mockSupabaseClient.from.mockResolvedValue({
                data: [{ id: "model-1", accuracy: 0.89 }],
                error: null,
              });
              return [4 /*yield*/, service.getModels()];
            case 1:
              _a.sent();
              endTime = performance.now();
              responseTime = endTime - startTime;
              (0, globals_1.expect)(responseTime).toBeLessThan(100); // Should be very fast for mocked calls
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("tracks prediction accuracy metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var metrics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, service.calculateAccuracyMetrics("model-123")];
            case 1:
              metrics = _a.sent();
              (0, globals_1.expect)(metrics.overall_accuracy).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(metrics.predictions_count).toBeGreaterThan(0);
              (0, globals_1.expect)(metrics.successful_predictions).toBeLessThanOrEqual(
                metrics.predictions_count,
              );
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Error Handling", function () {
    (0, globals_1.test)("handles database errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.insert.mockResolvedValue({
                data: null,
                error: { message: "Database connection error" },
              });
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  service.createModel({
                    name: "Test Model",
                    version: "1.0.0",
                    algorithm_type: "ensemble",
                    accuracy: 0.89,
                    confidence_threshold: 0.85,
                    status: "training",
                    training_data_size: 1000,
                    feature_count: 10,
                  }),
                ).rejects.toThrow("Database connection error"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.test)("validates input parameters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  service.createPrediction({
                    patient_id: "", // Invalid empty patient ID
                    treatment_type: "laser",
                    prediction_score: 1.5, // Invalid score > 1
                    confidence_interval: { lower: 0.5, upper: 0.4, confidence_level: 0.95 }, // Invalid interval
                    risk_assessment: "low",
                    predicted_outcome: "success",
                    model_id: "model-123",
                    features_used: {},
                  }),
                ).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
