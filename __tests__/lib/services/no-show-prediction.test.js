"use strict";
// Story 11.2: No-Show Prediction Engine Tests
// Comprehensive test suite for no-show prediction service
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
var no_show_prediction_1 = require("@/app/lib/services/no-show-prediction");
var server_1 = require("@/app/utils/supabase/server");
// Mock Supabase client
jest.mock("@/app/utils/supabase/server", function () {
  return {
    createClient: jest.fn(),
  };
});
// Mock data
var mockPatient = {
  id: "patient-123",
  name: "João Silva",
  email: "joao@example.com",
  phone: "+5511999999999",
  date_of_birth: "1985-05-15",
  created_at: "2024-01-01T00:00:00Z",
};
var mockAppointment = {
  id: "appointment-123",
  patient_id: "patient-123",
  clinic_id: "clinic-123",
  scheduled_at: "2024-02-15T14:00:00Z",
  status: "scheduled",
  service_type: "consultation",
  estimated_duration: 60,
  created_at: "2024-02-01T00:00:00Z",
};
var mockHistoricalData = [
  {
    patient_id: "patient-123",
    scheduled_at: "2024-01-15T14:00:00Z",
    status: "no_show",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    patient_id: "patient-123",
    scheduled_at: "2024-01-20T10:00:00Z",
    status: "completed",
    created_at: "2024-01-05T00:00:00Z",
  },
];
describe("NoShowPredictionEngine", function () {
  var mockSupabase;
  beforeEach(function () {
    jest.clearAllMocks();
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    };
    server_1.createClient.mockResolvedValue(mockSupabase);
  });
  describe("generatePrediction", function () {
    it("should generate prediction for valid appointment", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock database responses
              mockSupabase.single.mockResolvedValueOnce({
                data: mockAppointment,
                error: null,
              });
              mockSupabase.select.mockResolvedValueOnce({
                data: mockHistoricalData,
                error: null,
              });
              mockSupabase.insert.mockResolvedValueOnce({
                data: {
                  id: "prediction-123",
                  appointment_id: "appointment-123",
                  patient_id: "patient-123",
                  risk_score: 0.65,
                  confidence_score: 0.85,
                  prediction_date: expect.any(String),
                  model_version: "1.0",
                },
                error: null,
              });
              return [
                4 /*yield*/,
                no_show_prediction_1.noShowPredictionEngine.generatePrediction("appointment-123"),
              ];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.risk_score).toBeGreaterThan(0);
              expect(result.risk_score).toBeLessThanOrEqual(1);
              expect(result.confidence_score).toBeGreaterThan(0);
              expect(result.confidence_score).toBeLessThanOrEqual(1);
              expect(mockSupabase.insert).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle missing appointment", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase.single.mockResolvedValueOnce({
                data: null,
                error: { message: "Appointment not found" },
              });
              return [
                4 /*yield*/,
                expect(
                  no_show_prediction_1.noShowPredictionEngine.generatePrediction(
                    "invalid-appointment",
                  ),
                ).rejects.toThrow("Appointment not found"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("analyzeRiskFactors", function () {
    it("should analyze patient risk factors correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var riskFactors;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase.select.mockResolvedValueOnce({
                data: mockHistoricalData,
                error: null,
              });
              return [
                4 /*yield*/,
                no_show_prediction_1.noShowPredictionEngine.analyzeRiskFactors(
                  "patient-123",
                  mockAppointment,
                ),
              ];
            case 1:
              riskFactors = _a.sent();
              expect(riskFactors).toBeDefined();
              expect(Array.isArray(riskFactors)).toBe(true);
              expect(riskFactors.length).toBeGreaterThan(0);
              // Verify risk factor structure
              riskFactors.forEach(function (factor) {
                expect(factor).toHaveProperty("factor_type");
                expect(factor).toHaveProperty("factor_value");
                expect(factor).toHaveProperty("impact_weight");
                expect(factor.impact_weight).toBeGreaterThanOrEqual(0);
                expect(factor.impact_weight).toBeLessThanOrEqual(1);
              });
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle patient with no history", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var riskFactors;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase.select.mockResolvedValueOnce({
                data: [],
                error: null,
              });
              return [
                4 /*yield*/,
                no_show_prediction_1.noShowPredictionEngine.analyzeRiskFactors(
                  "new-patient",
                  mockAppointment,
                ),
              ];
            case 1:
              riskFactors = _a.sent();
              expect(riskFactors).toBeDefined();
              expect(Array.isArray(riskFactors)).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("updatePredictionOutcome", function () {
    it("should update prediction with actual outcome", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase.single.mockResolvedValueOnce({
                data: { id: "prediction-123" },
                error: null,
              });
              mockSupabase.update.mockResolvedValueOnce({
                data: { id: "prediction-123", actual_outcome: true },
                error: null,
              });
              return [
                4 /*yield*/,
                no_show_prediction_1.noShowPredictionEngine.updatePredictionOutcome(
                  "prediction-123",
                  true,
                ),
              ];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(mockSupabase.update).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("calculateAccuracyMetrics", function () {
    it("should calculate accuracy metrics correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockPredictions, metrics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockPredictions = [
                { risk_score: 0.8, actual_outcome: true }, // True positive
                { risk_score: 0.3, actual_outcome: false }, // True negative
                { risk_score: 0.7, actual_outcome: false }, // False positive
                { risk_score: 0.2, actual_outcome: true }, // False negative
              ];
              mockSupabase.select.mockResolvedValueOnce({
                data: mockPredictions,
                error: null,
              });
              return [
                4 /*yield*/,
                no_show_prediction_1.noShowPredictionEngine.calculateAccuracyMetrics(
                  "clinic-123",
                  "2024-01-01",
                  "2024-01-31",
                ),
              ];
            case 1:
              metrics = _a.sent();
              expect(metrics).toBeDefined();
              expect(metrics.accuracy).toBe(0.5); // 2 correct out of 4
              expect(metrics.precision).toBeGreaterThanOrEqual(0);
              expect(metrics.recall).toBeGreaterThanOrEqual(0);
              expect(metrics.f1_score).toBeGreaterThanOrEqual(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("getHighRiskPatients", function () {
    it("should return high-risk patients for given date range", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockHighRiskPredictions, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockHighRiskPredictions = [
                {
                  id: "prediction-1",
                  patient_id: "patient-1",
                  risk_score: 0.85,
                  appointment: { scheduled_at: "2024-02-15T14:00:00Z" },
                  patient: { name: "João Silva", email: "joao@example.com" },
                },
                {
                  id: "prediction-2",
                  patient_id: "patient-2",
                  risk_score: 0.92,
                  appointment: { scheduled_at: "2024-02-16T10:00:00Z" },
                  patient: { name: "Maria Santos", email: "maria@example.com" },
                },
              ];
              mockSupabase.select.mockResolvedValueOnce({
                data: mockHighRiskPredictions,
                error: null,
              });
              return [
                4 /*yield*/,
                no_show_prediction_1.noShowPredictionEngine.getHighRiskPatients(
                  "clinic-123",
                  "2024-02-15",
                  "2024-02-16",
                ),
              ];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(Array.isArray(result)).toBe(true);
              expect(result.length).toBe(2);
              expect(result[0].risk_score).toBeGreaterThanOrEqual(0.8);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("generateInterventionRecommendations", function () {
    it("should recommend appropriate interventions based on risk score", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var highRiskPrediction, recommendations;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              highRiskPrediction = {
                id: "prediction-123",
                risk_score: 0.9,
                patient_id: "patient-123",
                appointment_id: "appointment-123",
              };
              return [
                4 /*yield*/,
                no_show_prediction_1.noShowPredictionEngine.generateInterventionRecommendations(
                  highRiskPrediction,
                ),
              ];
            case 1:
              recommendations = _a.sent();
              expect(recommendations).toBeDefined();
              expect(Array.isArray(recommendations)).toBe(true);
              expect(recommendations.length).toBeGreaterThan(0);
              // High risk should recommend multiple interventions
              expect(recommendations).toContain("phone_call");
              expect(recommendations).toContain("sms_reminder");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should recommend fewer interventions for medium risk", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mediumRiskPrediction, recommendations;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mediumRiskPrediction = {
                id: "prediction-124",
                risk_score: 0.6,
                patient_id: "patient-124",
                appointment_id: "appointment-124",
              };
              return [
                4 /*yield*/,
                no_show_prediction_1.noShowPredictionEngine.generateInterventionRecommendations(
                  mediumRiskPrediction,
                ),
              ];
            case 1:
              recommendations = _a.sent();
              expect(recommendations).toBeDefined();
              expect(Array.isArray(recommendations)).toBe(true);
              expect(recommendations.length).toBeLessThan(3);
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
