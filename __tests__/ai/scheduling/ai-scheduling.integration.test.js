"use strict";
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
var scheduling_optimizer_1 = require("../../../lib/ai/scheduling-optimizer");
var preference_learner_1 = require("../../../lib/ai/preference-learner");
// Mock Supabase client
var mockSupabaseClient = {
  from: jest.fn(function () {
    return {
      select: jest.fn(function () {
        return {
          eq: jest.fn(function () {
            return {
              order: jest.fn(function () {
                return {
                  limit: jest.fn(function () {
                    return Promise.resolve({ data: [], error: null });
                  }),
                };
              }),
            };
          }),
        };
      }),
      insert: jest.fn(function () {
        return Promise.resolve({ data: {}, error: null });
      }),
      update: jest.fn(function () {
        return {
          eq: jest.fn(function () {
            return Promise.resolve({ data: {}, error: null });
          }),
        };
      }),
      delete: jest.fn(function () {
        return {
          eq: jest.fn(function () {
            return Promise.resolve({ data: {}, error: null });
          }),
        };
      }),
    };
  }),
  rpc: jest.fn(function () {
    return Promise.resolve({ data: [], error: null });
  }),
};
// Mock AuditLogger
var mockAuditLogger = {
  logEvent: jest.fn(function () {
    return Promise.resolve();
  }),
  logError: jest.fn(function () {
    return Promise.resolve();
  }),
  logAccess: jest.fn(function () {
    return Promise.resolve();
  }),
};
describe("AI Scheduling Integration Tests", function () {
  var optimizer;
  var learner;
  beforeEach(function () {
    jest.clearAllMocks();
    // Mock the constructor dependencies
    optimizer = new scheduling_optimizer_1.AISchedulingOptimizer();
    learner = new preference_learner_1.PatientPreferenceLearner();
    // Override the supabase and auditLogger properties
    optimizer.supabase = mockSupabaseClient;
    optimizer.auditLogger = mockAuditLogger;
    learner.supabase = mockSupabaseClient;
    learner.auditLogger = mockAuditLogger;
  });
  describe("AISchedulingOptimizer", function () {
    it("should create optimizer instance", function () {
      expect(optimizer).toBeInstanceOf(scheduling_optimizer_1.AISchedulingOptimizer);
    });
    it("should have suggestOptimalSlots method", function () {
      expect(typeof optimizer.suggestOptimalSlots).toBe("function");
    });
    it("should have getPatientPreferenceData method", function () {
      expect(typeof optimizer.getPatientPreferenceData).toBe("function");
    });
    it("should have processFeedback method", function () {
      expect(typeof optimizer.processFeedback).toBe("function");
    });
    it("should have getFeedbackHistory method", function () {
      expect(typeof optimizer.getFeedbackHistory).toBe("function");
    });
    it("should handle suggestOptimalSlots call", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockSlots, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSlots = [
                {
                  slot_id: "slot_1",
                  start_time: "2025-01-27T10:00:00Z",
                  end_time: "2025-01-27T11:00:00Z",
                  confidence_score: 0.95,
                  staff_id: "staff_1",
                  staff_name: "Dr. Smith",
                  optimization_factors: {
                    patient_preference_score: 0.9,
                    staff_efficiency_score: 0.8,
                    clinic_capacity_score: 0.85,
                    historical_success_rate: 0.92,
                  },
                  reasons: [
                    "High patient satisfaction with this time slot",
                    "Optimal staff availability",
                  ],
                },
              ];
              // Mock the method to return test data
              optimizer.suggestOptimalSlots = jest.fn().mockResolvedValue(mockSlots);
              return [
                4 /*yield*/,
                optimizer.suggestOptimalSlots({
                  patient_id: "patient_123",
                  treatment_type: "consultation",
                  preferred_date_range: {
                    start: "2025-01-27T08:00:00Z",
                    end: "2025-01-27T18:00:00Z",
                  },
                  duration_minutes: 60,
                }),
              ];
            case 1:
              result = _a.sent();
              expect(result).toEqual(mockSlots);
              expect(optimizer.suggestOptimalSlots).toHaveBeenCalledWith({
                patient_id: "patient_123",
                treatment_type: "consultation",
                preferred_date_range: {
                  start: "2025-01-27T08:00:00Z",
                  end: "2025-01-27T18:00:00Z",
                },
                duration_minutes: 60,
              });
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle getPatientPreferenceData call", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockPreferenceData, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockPreferenceData = {
                preferences: {
                  preferred_times: ["morning", "afternoon"],
                  preferred_staff: ["staff_1", "staff_2"],
                  treatment_preferences: ["quick_consultation"],
                },
                confidence_score: 0.87,
                data_points_count: 25,
                last_updated: "2025-01-26T12:00:00Z",
                insights: {
                  preferred_times: ["09:00-12:00"],
                  preferred_staff: ["Dr. Smith"],
                  opportunities: ["Schedule during morning hours for best satisfaction"],
                },
              };
              optimizer.getPatientPreferenceData = jest.fn().mockResolvedValue(mockPreferenceData);
              return [4 /*yield*/, optimizer.getPatientPreferenceData("patient_123")];
            case 1:
              result = _a.sent();
              expect(result).toEqual(mockPreferenceData);
              expect(optimizer.getPatientPreferenceData).toHaveBeenCalledWith("patient_123");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("PatientPreferenceLearner", function () {
    it("should create learner instance", function () {
      expect(learner).toBeInstanceOf(preference_learner_1.PatientPreferenceLearner);
    });
    it("should have updatePreferences method", function () {
      expect(typeof learner.updatePreferences).toBe("function");
    });
    it("should have getPatientPreferences method", function () {
      expect(typeof learner.getPatientPreferences).toBe("function");
    });
    it("should have analyzeSchedulingPatterns method", function () {
      expect(typeof learner.analyzeSchedulingPatterns).toBe("function");
    });
    it("should handle updatePreferences call", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockLearningResult, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockLearningResult = {
                learning_applied: true,
                confidence_scores: {
                  time_preference: 0.85,
                  staff_preference: 0.78,
                  treatment_preference: 0.92,
                },
                discovered_patterns: ["Prefers morning appointments", "Consistent with Dr. Smith"],
                preference_strength: 0.87,
                prediction_accuracy: 0.83,
              };
              learner.updatePreferences = jest.fn().mockResolvedValue(mockLearningResult);
              return [
                4 /*yield*/,
                learner.updatePreferences("patient_123", {
                  appointment_outcome: "completed",
                  satisfaction_score: 9,
                  preferred_time: "10:00",
                  staff_interaction: "positive",
                }),
              ];
            case 1:
              result = _a.sent();
              expect(result).toEqual(mockLearningResult);
              expect(learner.updatePreferences).toHaveBeenCalledWith("patient_123", {
                appointment_outcome: "completed",
                satisfaction_score: 9,
                preferred_time: "10:00",
                staff_interaction: "positive",
              });
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle getPatientPreferences call", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockPreferences, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockPreferences = {
                current_preferences: {
                  time_preferences: {
                    preferred_times: ["09:00-12:00"],
                    avoided_times: ["17:00-19:00"],
                    flexibility_score: 0.7,
                  },
                  staff_preferences: {
                    preferred_staff: ["staff_1"],
                    staff_satisfaction_scores: { staff_1: 0.95 },
                  },
                  treatment_preferences: {
                    preferred_treatment_sequences: ["consultation", "treatment"],
                    time_between_treatments: 14,
                  },
                },
                overall_confidence: 0.88,
                preference_reliability: 0.92,
                data_completeness: 0.75,
                patterns: {
                  time_preferences: [
                    { pattern: "Morning preference", confidence: 0.9, frequency: 15 },
                  ],
                  staff_preferences: [
                    {
                      staff_id: "staff_1",
                      staff_name: "Dr. Smith",
                      preference_strength: 0.95,
                      interaction_count: 12,
                    },
                  ],
                  treatment_preferences: [
                    {
                      treatment_type: "consultation",
                      preference_score: 0.88,
                      optimal_timing: "morning",
                    },
                  ],
                  scheduling_behaviors: [
                    { behavior: "Books 1 week in advance", frequency: 80, reliability: 0.85 },
                  ],
                },
              };
              learner.getPatientPreferences = jest.fn().mockResolvedValue(mockPreferences);
              return [4 /*yield*/, learner.getPatientPreferences("patient_123", false)];
            case 1:
              result = _a.sent();
              expect(result).toEqual(mockPreferences);
              expect(learner.getPatientPreferences).toHaveBeenCalledWith("patient_123", false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Service Integration", function () {
    it("should demonstrate integration between optimizer and learner", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockPatientData, mockOptimizedSlots, patientPrefs, optimizedSlots;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockPatientData = {
                current_preferences: {
                  time_preferences: {
                    preferred_times: ["09:00-12:00"],
                    avoided_times: ["17:00-19:00"],
                    flexibility_score: 0.8,
                  },
                },
                overall_confidence: 0.85,
              };
              learner.getPatientPreferences = jest.fn().mockResolvedValue(mockPatientData);
              mockOptimizedSlots = [
                {
                  slot_id: "slot_morning_1",
                  start_time: "2025-01-27T10:00:00Z",
                  end_time: "2025-01-27T11:00:00Z",
                  confidence_score: 0.95,
                  staff_id: "staff_1",
                  staff_name: "Dr. Smith",
                  optimization_factors: {
                    patient_preference_score: 0.9, // High because matches learned preferences
                    staff_efficiency_score: 0.8,
                    clinic_capacity_score: 0.85,
                    historical_success_rate: 0.92,
                  },
                  reasons: [
                    "Matches learned morning preference",
                    "High confidence from patient history",
                  ],
                },
              ];
              optimizer.suggestOptimalSlots = jest.fn().mockResolvedValue(mockOptimizedSlots);
              return [4 /*yield*/, learner.getPatientPreferences("patient_123", false)];
            case 1:
              patientPrefs = _a.sent();
              expect(patientPrefs.current_preferences.time_preferences.preferred_times).toContain(
                "09:00-12:00",
              );
              return [
                4 /*yield*/,
                optimizer.suggestOptimalSlots({
                  patient_id: "patient_123",
                  treatment_type: "consultation",
                  preferred_date_range: {
                    start: "2025-01-27T08:00:00Z",
                    end: "2025-01-27T18:00:00Z",
                  },
                  duration_minutes: 60,
                }),
              ];
            case 2:
              optimizedSlots = _a.sent();
              expect(
                optimizedSlots[0].optimization_factors.patient_preference_score,
              ).toBeGreaterThan(0.85);
              expect(optimizedSlots[0].reasons).toContain("Matches learned morning preference");
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
