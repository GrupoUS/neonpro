/**
 * Tests for Treatment Success Service, Types, and Validations
 * Tests backend logic for Story 8.4 - Treatment Success Rate Tracking & Optimization
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
var treatment_success_1 = require("@/app/lib/services/treatment-success");
var treatment_success_2 = require("@/app/lib/validations/treatment-success");
// Mock Supabase client
var mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  gte: jest.fn(() => mockSupabaseClient),
  lte: jest.fn(() => mockSupabaseClient),
  not: jest.fn(() => mockSupabaseClient),
  is: jest.fn(() => mockSupabaseClient),
  range: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => mockSupabaseClient),
  upsert: jest.fn(() => mockSupabaseClient),
  limit: jest.fn(() => mockSupabaseClient),
};
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}));
// Mock data for testing
var mockTreatmentOutcome = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  patient_id: "550e8400-e29b-41d4-a716-446655440002",
  treatment_id: "treatment-001",
  provider_id: "550e8400-e29b-41d4-a716-446655440003",
  treatment_type: "Botox",
  treatment_date: "2025-01-15",
  outcome_date: "2025-01-22",
  success_score: 0.95,
  success_criteria: { wrinkle_reduction: 85, patient_satisfaction: 90 },
  actual_outcomes: { wrinkle_reduction: 90, patient_satisfaction: 92 },
  before_photos: ["https://example.com/before1.jpg"],
  after_photos: ["https://example.com/after1.jpg"],
  patient_satisfaction_score: 0.92,
  complications: null,
  follow_up_required: false,
  notes: "Excelente resultado, paciente muito satisfeita",
  status: "completed",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-22T15:30:00Z",
};
var mockSuccessMetrics = {
  id: "550e8400-e29b-41d4-a716-446655440004",
  treatment_type: "Botox",
  provider_id: "550e8400-e29b-41d4-a716-446655440003",
  time_period: "monthly",
  period_start: "2025-01-01",
  period_end: "2025-01-31",
  total_treatments: 45,
  successful_treatments: 42,
  success_rate: 0.93,
  average_satisfaction: 0.89,
  complication_rate: 0.02,
  benchmarks: { industry_standard: 0.85 },
  industry_comparison: { above_average: true },
  created_at: "2025-01-31T23:59:59Z",
  updated_at: "2025-01-31T23:59:59Z",
};
describe("Treatment Success Validation Schemas", () => {
  describe("createTreatmentOutcomeSchema", () => {
    it("should validate correct treatment outcome data", () => {
      var validData = {
        patient_id: "550e8400-e29b-41d4-a716-446655440002",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "2025-01-15",
        success_criteria: { wrinkle_reduction: 85 },
        notes: "Test treatment outcome",
      };
      var result = treatment_success_2.createTreatmentOutcomeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it("should reject invalid UUID for patient_id", () => {
      var invalidData = {
        patient_id: "invalid-uuid",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "2025-01-15",
        success_criteria: { wrinkle_reduction: 85 },
      };
      var result = treatment_success_2.createTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("UUID válido");
      }
    });
    it("should reject empty success_criteria", () => {
      var invalidData = {
        patient_id: "550e8400-e29b-41d4-a716-446655440002",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "2025-01-15",
        success_criteria: {},
      };
      var result = treatment_success_2.createTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Critérios de sucesso são obrigatórios");
      }
    });
    it("should reject invalid date format", () => {
      var invalidData = {
        patient_id: "550e8400-e29b-41d4-a716-446655440002",
        treatment_id: "treatment-001",
        provider_id: "550e8400-e29b-41d4-a716-446655440003",
        treatment_type: "Botox",
        treatment_date: "invalid-date",
        success_criteria: { wrinkle_reduction: 85 },
      };
      var result = treatment_success_2.createTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Data de tratamento inválida");
      }
    });
  });
  describe("updateTreatmentOutcomeSchema", () => {
    it("should validate success score range", () => {
      var validData = { success_score: 0.95 };
      var result = treatment_success_2.updateTreatmentOutcomeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      var invalidData = { success_score: 1.5 };
      var result2 = treatment_success_2.updateTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result2.success).toBe(false);
    });
    it("should validate patient satisfaction score range", () => {
      var validData = { patient_satisfaction_score: 0.89 };
      var result = treatment_success_2.updateTreatmentOutcomeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      var invalidData = { patient_satisfaction_score: -0.1 };
      var result2 = treatment_success_2.updateTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result2.success).toBe(false);
    });
    it("should validate photo URLs", () => {
      var validData = {
        before_photos: ["https://example.com/before.jpg"],
        after_photos: ["https://example.com/after.jpg"],
      };
      var result = treatment_success_2.updateTreatmentOutcomeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      var invalidData = { before_photos: ["not-a-url"] };
      var result2 = treatment_success_2.updateTreatmentOutcomeSchema.safeParse(invalidData);
      expect(result2.success).toBe(false);
    });
  });
  describe("createSuccessMetricsSchema", () => {
    it("should validate success metrics data", () => {
      var validData = {
        treatment_type: "Botox",
        time_period: "monthly",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        total_treatments: 45,
        successful_treatments: 42,
        success_rate: 0.93,
      };
      var result = treatment_success_2.createSuccessMetricsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it("should reject when successful_treatments > total_treatments", () => {
      var invalidData = {
        treatment_type: "Botox",
        time_period: "monthly",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        total_treatments: 40,
        successful_treatments: 45, // More than total
        success_rate: 0.93,
      };
      var result = treatment_success_2.createSuccessMetricsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("não pode ser maior que o total");
      }
    });
    it("should validate time period enum", () => {
      var invalidData = {
        treatment_type: "Botox",
        time_period: "invalid_period",
        period_start: "2025-01-01",
        period_end: "2025-01-31",
        total_treatments: 45,
        successful_treatments: 42,
        success_rate: 0.93,
      };
      var result = treatment_success_2.createSuccessMetricsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
  describe("createProtocolOptimizationSchema", () => {
    it("should validate protocol optimization data", () => {
      var validData = {
        treatment_type: "Botox",
        current_protocol: { units: "20-30", injection_points: 5 },
        recommended_changes: { units: "25-35", injection_points: 7 },
        implementation_priority: "high",
        success_rate_improvement: 0.08,
      };
      var result = treatment_success_2.createProtocolOptimizationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it("should reject empty protocols", () => {
      var invalidData = {
        treatment_type: "Botox",
        current_protocol: {},
        recommended_changes: { units: "25-35" },
        implementation_priority: "high",
      };
      var result = treatment_success_2.createProtocolOptimizationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Protocolo atual é obrigatório");
      }
    });
    it("should validate implementation priority enum", () => {
      var invalidData = {
        treatment_type: "Botox",
        current_protocol: { units: "20-30" },
        recommended_changes: { units: "25-35" },
        implementation_priority: "invalid_priority",
      };
      var result = treatment_success_2.createProtocolOptimizationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
  describe("createQualityBenchmarkSchema", () => {
    it("should validate quality benchmark data", () => {
      var validData = {
        treatment_type: "Botox",
        benchmark_type: "industry_standard",
        metric_name: "Success Rate",
        target_value: 0.9,
      };
      var result = treatment_success_2.createQualityBenchmarkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    it("should reject negative target values", () => {
      var invalidData = {
        treatment_type: "Botox",
        benchmark_type: "industry_standard",
        metric_name: "Success Rate",
        target_value: -0.1,
      };
      var result = treatment_success_2.createQualityBenchmarkSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
  describe("treatmentSuccessQuerySchema", () => {
    it("should parse and validate query parameters", () => {
      var queryParams = {
        page: "2",
        limit: "20",
        treatment_type: "Botox",
        success_rate_min: "0.8",
        date_from: "2025-01-01",
      };
      var result = treatment_success_2.treatmentSuccessQuerySchema.safeParse(queryParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
        expect(result.data.success_rate_min).toBe(0.8);
      }
    });
    it("should use default values for missing parameters", () => {
      var queryParams = {};
      var result = treatment_success_2.treatmentSuccessQuerySchema.safeParse(queryParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });
  });
});
describe("TreatmentSuccessService", () => {
  var service;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new treatment_success_1.TreatmentSuccessService();
  });
  describe("getTreatmentOutcomes", () => {
    it("should fetch treatment outcomes with filters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var filters, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  range: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      order: jest.fn().mockResolvedValue({
                        data: [mockTreatmentOutcome],
                        error: null,
                        count: 1,
                      }),
                    }),
                  ),
                }),
              );
              filters = {
                treatment_type: "Botox",
                provider_id: "550e8400-e29b-41d4-a716-446655440003",
                success_rate_min: 0.8,
              };
              return [4 /*yield*/, service.getTreatmentOutcomes(filters, 1, 10)];
            case 1:
              result = _a.sent();
              expect(result).toEqual({
                data: [mockTreatmentOutcome],
                total: 1,
                page: 1,
                limit: 10,
              });
              expect(mockSupabaseClient.eq).toHaveBeenCalledWith("treatment_type", "Botox");
              expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
                "provider_id",
                "550e8400-e29b-41d4-a716-446655440003",
              );
              expect(mockSupabaseClient.gte).toHaveBeenCalledWith("success_score", 0.8);
              return [2 /*return*/];
          }
        });
      }));
    it("should handle date range filters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var filters;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  range: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      order: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                        count: 0,
                      }),
                    }),
                  ),
                }),
              );
              filters = {
                date_from: "2025-01-01",
                date_to: "2025-01-31",
              };
              return [4 /*yield*/, service.getTreatmentOutcomes(filters)];
            case 1:
              _a.sent();
              expect(mockSupabaseClient.gte).toHaveBeenCalledWith("treatment_date", "2025-01-01");
              expect(mockSupabaseClient.lte).toHaveBeenCalledWith("treatment_date", "2025-01-31");
              return [2 /*return*/];
          }
        });
      }));
    it("should handle complications filter", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  range: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      order: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                        count: 0,
                      }),
                    }),
                  ),
                }),
              );
              return [4 /*yield*/, service.getTreatmentOutcomes({ has_complications: true })];
            case 1:
              _a.sent();
              expect(mockSupabaseClient.not).toHaveBeenCalledWith("complications", "is", null);
              return [4 /*yield*/, service.getTreatmentOutcomes({ has_complications: false })];
            case 2:
              _a.sent();
              expect(mockSupabaseClient.is).toHaveBeenCalledWith("complications", null);
              return [2 /*return*/];
          }
        });
      }));
    it("should handle database errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  range: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      order: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: "Database error" },
                        count: 0,
                      }),
                    }),
                  ),
                }),
              );
              return [
                4 /*yield*/,
                expect(service.getTreatmentOutcomes()).rejects.toThrow(
                  "Erro ao buscar resultados de tratamento",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("createTreatmentOutcome", () => {
    it("should create a new treatment outcome", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var outcomeData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.insert.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  select: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      single: jest.fn().mockResolvedValue({
                        data: mockTreatmentOutcome,
                        error: null,
                      }),
                    }),
                  ),
                }),
              );
              outcomeData = {
                patient_id: "550e8400-e29b-41d4-a716-446655440002",
                treatment_id: "treatment-001",
                provider_id: "550e8400-e29b-41d4-a716-446655440003",
                treatment_type: "Botox",
                treatment_date: "2025-01-15",
                success_criteria: { wrinkle_reduction: 85 },
                notes: "Test outcome",
              };
              return [4 /*yield*/, service.createTreatmentOutcome(outcomeData)];
            case 1:
              result = _a.sent();
              expect(result).toEqual(mockTreatmentOutcome);
              expect(mockSupabaseClient.insert).toHaveBeenCalledWith(outcomeData);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("generateSuccessMetrics", () => {
    it("should calculate and generate success metrics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockOutcomes, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockOutcomes = [
                { success_score: 0.9, patient_satisfaction_score: 0.85, complications: null },
                { success_score: 0.8, patient_satisfaction_score: 0.9, complications: null },
                {
                  success_score: 0.7,
                  patient_satisfaction_score: 0.8,
                  complications: { minor: true },
                },
              ];
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  eq: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      gte: jest.fn().mockReturnValue(
                        __assign(__assign({}, mockSupabaseClient), {
                          lte: jest.fn().mockResolvedValue({
                            data: mockOutcomes,
                            error: null,
                          }),
                        }),
                      ),
                    }),
                  ),
                }),
              );
              mockSupabaseClient.upsert.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  select: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      single: jest.fn().mockResolvedValue({
                        data: mockSuccessMetrics,
                        error: null,
                      }),
                    }),
                  ),
                }),
              );
              return [4 /*yield*/, service.generateSuccessMetrics("Botox", undefined, "monthly")];
            case 1:
              result = _a.sent();
              expect(result).toEqual(mockSuccessMetrics);
              expect(mockSupabaseClient.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                  treatment_type: "Botox",
                  time_period: "monthly",
                  total_treatments: 3,
                  successful_treatments: 2, // success_score >= 0.8
                }),
              );
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("createSuccessPrediction", () => {
    it("should create success prediction with calculated rate", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockHistoricalData, predictionData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockHistoricalData = [
                { success_score: 0.9 },
                { success_score: 0.8 },
                { success_score: 0.85 },
              ];
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  eq: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      not: jest.fn().mockResolvedValue({
                        data: mockHistoricalData,
                        error: null,
                      }),
                    }),
                  ),
                }),
              );
              mockSupabaseClient.insert.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  select: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      single: jest.fn().mockResolvedValue({
                        data: {
                          id: "prediction-1",
                          patient_id: "patient-1",
                          treatment_type: "Botox",
                          predicted_success_rate: 0.85, // Average of historical data
                          prediction_factors: { age: 35, skin_type: "normal" },
                          created_at: "2025-01-26T10:00:00Z",
                          updated_at: "2025-01-26T10:00:00Z",
                        },
                        error: null,
                      }),
                    }),
                  ),
                }),
              );
              predictionData = {
                patient_id: "patient-1",
                treatment_type: "Botox",
                prediction_factors: { age: 35, skin_type: "normal" },
              };
              return [4 /*yield*/, service.createSuccessPrediction(predictionData)];
            case 1:
              result = _a.sent();
              expect(result.predicted_success_rate).toBe(0.85);
              expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
                expect.objectContaining(
                  __assign(__assign({}, predictionData), { predicted_success_rate: 0.85 }),
                ),
              );
              return [2 /*return*/];
          }
        });
      }));
    it("should use default success rate when no historical data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var predictionData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  eq: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      not: jest.fn().mockResolvedValue({
                        data: [], // No historical data
                        error: null,
                      }),
                    }),
                  ),
                }),
              );
              mockSupabaseClient.insert.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  select: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      single: jest.fn().mockResolvedValue({
                        data: {
                          id: "prediction-1",
                          patient_id: "patient-1",
                          treatment_type: "NewTreatment",
                          predicted_success_rate: 0.5, // Default when no data
                          prediction_factors: { age: 35 },
                          created_at: "2025-01-26T10:00:00Z",
                          updated_at: "2025-01-26T10:00:00Z",
                        },
                        error: null,
                      }),
                    }),
                  ),
                }),
              );
              predictionData = {
                patient_id: "patient-1",
                treatment_type: "NewTreatment",
                prediction_factors: { age: 35 },
              };
              return [4 /*yield*/, service.createSuccessPrediction(predictionData)];
            case 1:
              result = _a.sent();
              expect(result.predicted_success_rate).toBe(0.5);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Dashboard Statistics", () => {
    it("should calculate success rate statistics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockMetricsData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockMetricsData = [
                { success_rate: 0.9, total_treatments: 100, average_satisfaction: 0.85 },
                { success_rate: 0.8, total_treatments: 50, average_satisfaction: 0.9 },
              ];
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  order: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      limit: jest.fn().mockResolvedValue({
                        data: mockMetricsData,
                        error: null,
                      }),
                    }),
                  ),
                }),
              );
              return [4 /*yield*/, service.getSuccessRateStats()];
            case 1:
              result = _a.sent();
              expect(result.total_treatments).toBe(150);
              expect(result.overall_success_rate).toBeCloseTo(0.87, 2); // Weighted average
              expect(result.average_satisfaction).toBeCloseTo(0.875, 3);
              return [2 /*return*/];
          }
        });
      }));
    it("should calculate provider statistics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockPerformanceData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockPerformanceData = [
                { provider_id: "provider-1", overall_success_rate: 0.95 },
                { provider_id: "provider-2", overall_success_rate: 0.85 },
                { provider_id: "provider-3", overall_success_rate: 0.75 }, // Below 0.8 threshold
              ];
              mockSupabaseClient.select.mockReturnValue(
                __assign(__assign({}, mockSupabaseClient), {
                  not: jest.fn().mockReturnValue(
                    __assign(__assign({}, mockSupabaseClient), {
                      order: jest.fn().mockResolvedValue({
                        data: mockPerformanceData,
                        error: null,
                      }),
                    }),
                  ),
                }),
              );
              return [4 /*yield*/, service.getProviderStats()];
            case 1:
              result = _a.sent();
              expect(result.total_providers).toBe(3);
              expect(result.top_performer.provider_id).toBe("provider-1");
              expect(result.top_performer.success_rate).toBe(0.95);
              expect(result.improvement_needed).toBe(1); // Providers with rate < 0.8
              return [2 /*return*/];
          }
        });
      }));
  });
});
