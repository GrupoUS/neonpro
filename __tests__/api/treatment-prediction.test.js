/**
 * Treatment Prediction API Tests
 * Story 9.1: AI-powered treatment success prediction
 *
 * Tests all API endpoints for treatment prediction including:
 * - Prediction generation with ≥85% accuracy
 * - Model management and training
 * - Batch predictions and analytics
 * - Performance monitoring and feedback
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
var globals_1 = require("@jest/globals");
var server_1 = require("next/server");
// Mock the Supabase client
var mockSupabaseClient = {
  from: globals_1.jest.fn().mockReturnThis(),
  select: globals_1.jest.fn().mockReturnThis(),
  insert: globals_1.jest.fn().mockReturnThis(),
  update: globals_1.jest.fn().mockReturnThis(),
  upsert: globals_1.jest.fn().mockReturnThis(),
  eq: globals_1.jest.fn().mockReturnThis(),
  gte: globals_1.jest.fn().mockReturnThis(),
  lte: globals_1.jest.fn().mockReturnThis(),
  order: globals_1.jest.fn().mockReturnThis(),
  single: globals_1.jest.fn().mockReturnThis(),
  auth: {
    getUser: globals_1.jest.fn().mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    }),
  },
};
globals_1.jest.mock("@/app/utils/supabase/server", () => ({
  createClient: globals_1.jest.fn().mockResolvedValue(mockSupabaseClient),
}));
// Mock the service
globals_1.jest.mock("@/app/lib/services/treatment-prediction", () => ({
  TreatmentPredictionService: globals_1.jest.fn().mockImplementation(() => ({
    generatePrediction: globals_1.jest.fn(),
    createPrediction: globals_1.jest.fn(),
    getPredictions: globals_1.jest.fn(),
    getModels: globals_1.jest.fn(),
    createModel: globals_1.jest.fn(),
    updateModel: globals_1.jest.fn(),
    getBatchPredictions: globals_1.jest.fn(),
    getAnalytics: globals_1.jest.fn(),
    createFeedback: globals_1.jest.fn(),
    getModelPerformance: globals_1.jest.fn(),
  })),
}));
(0, globals_1.describe)("Treatment Prediction API Endpoints", () => {
  beforeEach(() => {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("POST /api/treatment-prediction/predictions", () => {
    (0, globals_1.test)("generates prediction with high accuracy", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, mockPredictionRequest, mockPredictionResponse, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/predictions/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              mockPredictionRequest = {
                patient_id: "patient-123",
                treatment_type: "laser_resurfacing",
                patient_factors: {
                  age: 28,
                  gender: "female",
                  skin_type: "Type II",
                  medical_history: {
                    conditions: [],
                    medications: [],
                    allergies: [],
                  },
                },
              };
              mockPredictionResponse = {
                id: "pred-456",
                patient_id: "patient-123",
                treatment_type: "laser_resurfacing",
                prediction_score: 0.91, // 91% - exceeds 85% requirement
                confidence_interval: { lower: 0.87, upper: 0.95, confidence_level: 0.95 },
                risk_assessment: "low",
                predicted_outcome: "success",
                explainability_data: {
                  feature_importance: {
                    age: 0.2,
                    skin_type: 0.25,
                    medical_history: 0.15,
                  },
                  top_positive_factors: ["Optimal age", "Compatible skin type"],
                  confidence_reasoning: "High probability based on favorable factors",
                },
                created_at: new Date().toISOString(),
              };
              mockSupabaseClient.insert.mockResolvedValue({
                data: mockPredictionResponse,
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/predictions",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(mockPredictionRequest),
                },
              );
              return [4 /*yield*/, POST(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(201);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.data.prediction_score).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(data.data.explainability_data).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("validates required fields", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, invalidRequest, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/predictions/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              invalidRequest = {
                // Missing patient_id and treatment_type
                patient_factors: {},
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/predictions",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(invalidRequest),
                },
              );
              return [4 /*yield*/, POST(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              (0, globals_1.expect)(data.success).toBe(false);
              (0, globals_1.expect)(data.error).toContain("validation");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("handles authentication", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/predictions/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              // Mock authentication failure
              mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Invalid token" },
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/predictions",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ patient_id: "test" }),
                },
              );
              return [4 /*yield*/, POST(request)];
            case 2:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(401);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("GET /api/treatment-prediction/predictions", () => {
    (0, globals_1.test)("retrieves predictions with filtering", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var GET, mockPredictions, url, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/predictions/route"),
                ),
              ];
            case 1:
              GET = _a.sent().GET;
              mockPredictions = [
                {
                  id: "pred-1",
                  patient_id: "patient-123",
                  prediction_score: 0.89,
                  risk_assessment: "low",
                  created_at: new Date().toISOString(),
                },
                {
                  id: "pred-2",
                  patient_id: "patient-456",
                  prediction_score: 0.92,
                  risk_assessment: "low",
                  created_at: new Date().toISOString(),
                },
              ];
              mockSupabaseClient.from.mockResolvedValue({
                data: mockPredictions,
                error: null,
              });
              url = new URL(
                "http://localhost:3000/api/treatment-prediction/predictions?patient_id=patient-123&prediction_score_min=0.85",
              );
              request = new server_1.NextRequest(url);
              return [4 /*yield*/, GET(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.data).toHaveLength(2);
              (0, globals_1.expect)(data.data.every((p) => p.prediction_score >= 0.85)).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("POST /api/treatment-prediction/batch", () => {
    (0, globals_1.test)("processes batch predictions efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, mockBatchRequest, mockBatchResponse, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() => require("@/app/api/treatment-prediction/batch/route")),
              ];
            case 1:
              POST = _a.sent().POST;
              mockBatchRequest = {
                predictions: [
                  {
                    patient_id: "patient-1",
                    treatment_type: "chemical_peel",
                    patient_factors: { age: 25, skin_type: "Type I" },
                  },
                  {
                    patient_id: "patient-2",
                    treatment_type: "laser_treatment",
                    patient_factors: { age: 35, skin_type: "Type III" },
                  },
                ],
                include_summary: true,
              };
              mockBatchResponse = {
                predictions: [
                  {
                    patient_id: "patient-1",
                    prediction_score: 0.88,
                    risk_assessment: "low",
                  },
                  {
                    patient_id: "patient-2",
                    prediction_score: 0.85,
                    risk_assessment: "medium",
                  },
                ],
                summary: {
                  total_predictions: 2,
                  high_success_probability: 2,
                  average_confidence: 0.865,
                  processing_time: 450,
                },
              };
              mockSupabaseClient.insert.mockResolvedValue({
                data: mockBatchResponse,
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/batch",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(mockBatchRequest),
                },
              );
              return [4 /*yield*/, POST(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.data.predictions).toHaveLength(2);
              (0, globals_1.expect)(data.data.summary.average_confidence).toBeGreaterThanOrEqual(
                0.85,
              );
              (0, globals_1.expect)(data.data.summary.processing_time).toBeLessThan(1000);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("POST /api/treatment-prediction/models", () => {
    (0, globals_1.test)("creates new prediction model with accuracy validation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, mockModelRequest, mockModelResponse, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/models/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              mockModelRequest = {
                name: "Advanced Ensemble Model",
                version: "3.0.0",
                algorithm_type: "ensemble",
                accuracy: 0.93, // 93% - well above 85% requirement
                confidence_threshold: 0.85,
                training_data_size: 25000,
                feature_count: 52,
                performance_metrics: {
                  precision: 0.94,
                  recall: 0.92,
                  f1_score: 0.93,
                  auc_roc: 0.97,
                },
              };
              mockModelResponse = __assign(__assign({}, mockModelRequest), {
                id: "model-789",
                status: "training",
                created_at: new Date().toISOString(),
              });
              mockSupabaseClient.insert.mockResolvedValue({
                data: mockModelResponse,
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/models",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(mockModelRequest),
                },
              );
              return [4 /*yield*/, POST(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(201);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.data.accuracy).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(data.data.performance_metrics.f1_score).toBeGreaterThanOrEqual(
                0.85,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("rejects models below accuracy threshold", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, lowAccuracyModel, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/models/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              lowAccuracyModel = {
                name: "Low Accuracy Model",
                version: "1.0.0",
                algorithm_type: "neural_network",
                accuracy: 0.78, // 78% - below 85% threshold
                confidence_threshold: 0.85,
              };
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/models",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(lowAccuracyModel),
                },
              );
              return [4 /*yield*/, POST(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              (0, globals_1.expect)(data.success).toBe(false);
              (0, globals_1.expect)(data.error).toContain("accuracy");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("GET /api/treatment-prediction/analytics", () => {
    (0, globals_1.test)("provides comprehensive analytics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var GET, mockAnalytics, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/analytics/route"),
                ),
              ];
            case 1:
              GET = _a.sent().GET;
              mockAnalytics = {
                overall_metrics: {
                  total_predictions: 5420,
                  successful_predictions: 4876,
                  overall_accuracy: 0.899, // 89.9% - above target
                  average_confidence: 0.87,
                },
                model_performance: [
                  {
                    model_id: "model-1",
                    name: "Ensemble V2",
                    accuracy: 0.91,
                    predictions_count: 2100,
                  },
                  {
                    model_id: "model-2",
                    name: "Neural Network V1",
                    accuracy: 0.88,
                    predictions_count: 1800,
                  },
                ],
                treatment_success_rates: {
                  laser_resurfacing: 0.92,
                  chemical_peel: 0.86,
                  microneedling: 0.89,
                },
                risk_distribution: {
                  low: 0.65,
                  medium: 0.28,
                  high: 0.07,
                },
                monthly_trends: [
                  { month: "2024-01", accuracy: 0.87, predictions: 450 },
                  { month: "2024-02", accuracy: 0.89, predictions: 520 },
                  { month: "2024-03", accuracy: 0.91, predictions: 580 },
                ],
              };
              mockSupabaseClient.from.mockResolvedValue({
                data: mockAnalytics,
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/analytics",
              );
              return [4 /*yield*/, GET(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(
                data.data.overall_metrics.overall_accuracy,
              ).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(
                data.data.model_performance.every((m) => m.accuracy >= 0.85),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("POST /api/treatment-prediction/feedback", () => {
    (0, globals_1.test)("processes medical professional feedback", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, mockFeedbackRequest, mockFeedbackResponse, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/feedback/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              mockFeedbackRequest = {
                prediction_id: "pred-789",
                feedback_type: "validation",
                original_prediction: 0.85,
                adjusted_prediction: 0.9,
                reasoning:
                  "Patient showed excellent healing characteristics not captured in original factors",
                confidence_level: 4,
                medical_factors: {
                  healing_response: "excellent",
                  patient_compliance: "high",
                  unexpected_factors: ["faster_recovery_than_typical"],
                },
              };
              mockFeedbackResponse = __assign(__assign({}, mockFeedbackRequest), {
                id: "feedback-123",
                provider_id: "user-123",
                created_at: new Date().toISOString(),
              });
              mockSupabaseClient.insert.mockResolvedValue({
                data: mockFeedbackResponse,
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/feedback",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(mockFeedbackRequest),
                },
              );
              return [4 /*yield*/, POST(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(201);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.data.reasoning).toBeTruthy();
              (0, globals_1.expect)(data.data.confidence_level).toBeGreaterThanOrEqual(1);
              (0, globals_1.expect)(data.data.confidence_level).toBeLessThanOrEqual(5);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("GET /api/treatment-prediction/performance", () => {
    (0, globals_1.test)("monitors real-time performance metrics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var GET, mockPerformanceMetrics, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/performance/route"),
                ),
              ];
            case 1:
              GET = _a.sent().GET;
              mockPerformanceMetrics = {
                current_accuracy: 0.892, // 89.2% - above target
                predictions_today: 45,
                average_response_time: 185, // milliseconds
                success_rate_trends: {
                  last_7_days: 0.89,
                  last_30_days: 0.88,
                  last_90_days: 0.87,
                },
                model_health: {
                  active_models: 3,
                  models_above_threshold: 3,
                  average_model_accuracy: 0.895,
                },
                system_performance: {
                  api_response_time: 165,
                  database_query_time: 45,
                  ml_processing_time: 120,
                },
                error_rates: {
                  prediction_errors: 0.002,
                  validation_errors: 0.001,
                  system_errors: 0.0005,
                },
              };
              mockSupabaseClient.from.mockResolvedValue({
                data: mockPerformanceMetrics,
                error: null,
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/performance",
              );
              return [4 /*yield*/, GET(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(data.success).toBe(true);
              (0, globals_1.expect)(data.data.current_accuracy).toBeGreaterThanOrEqual(0.85);
              (0, globals_1.expect)(data.data.average_response_time).toBeLessThan(500);
              (0, globals_1.expect)(data.data.model_health.models_above_threshold).toBeGreaterThan(
                0,
              );
              (0, globals_1.expect)(data.data.error_rates.prediction_errors).toBeLessThan(0.01);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Error Handling", () => {
    (0, globals_1.test)("handles invalid JSON requests", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/predictions/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/predictions",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: "invalid json",
                },
              );
              return [4 /*yield*/, POST(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              (0, globals_1.expect)(data.success).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("handles database errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var GET, request, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/predictions/route"),
                ),
              ];
            case 1:
              GET = _a.sent().GET;
              mockSupabaseClient.from.mockResolvedValue({
                data: null,
                error: { message: "Database connection failed" },
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/predictions",
              );
              return [4 /*yield*/, GET(request)];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              (0, globals_1.expect)(response.status).toBe(500);
              (0, globals_1.expect)(data.success).toBe(false);
              (0, globals_1.expect)(data.error).toContain("Database");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("handles rate limiting", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, promises, responses, successfulRequests;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/predictions/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              promises = Array(100)
                .fill(null)
                .map(() => {
                  var request = new server_1.NextRequest(
                    "http://localhost:3000/api/treatment-prediction/predictions",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ patient_id: "test-patient" }),
                    },
                  );
                  return POST(request);
                });
              return [4 /*yield*/, Promise.all(promises)];
            case 2:
              responses = _a.sent();
              successfulRequests = responses.filter((r) => r.status < 400);
              (0, globals_1.expect)(successfulRequests.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Performance Requirements", () => {
    (0, globals_1.test)("meets response time requirements", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var POST, request, startTime, endTime, responseTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.resolve().then(() =>
                  require("@/app/api/treatment-prediction/predictions/route"),
                ),
              ];
            case 1:
              POST = _a.sent().POST;
              request = new server_1.NextRequest(
                "http://localhost:3000/api/treatment-prediction/predictions",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    patient_id: "patient-perf-test",
                    treatment_type: "laser_treatment",
                  }),
                },
              );
              startTime = performance.now();
              mockSupabaseClient.insert.mockResolvedValue({
                data: { prediction_score: 0.89 },
                error: null,
              });
              return [4 /*yield*/, POST(request)];
            case 2:
              _a.sent();
              endTime = performance.now();
              responseTime = endTime - startTime;
              // API should respond quickly (real-time requirement)
              (0, globals_1.expect)(responseTime).toBeLessThan(1000); // Less than 1 second
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
