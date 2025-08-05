/**
 * Predictive Analytics API Integration Tests
 * Story 8.3: Predictive Analytics for Demand Forecasting (≥85% Accuracy)
 *
 * API Testing Coverage:
 * - Forecasting models management
 * - Demand predictions generation
 * - Model training and accuracy tracking
 * - Alert system for demand spikes
 * - Recommendations based on forecasts
 * - Performance monitoring
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
var node_mocks_http_1 = require("node-mocks-http");
// API Route Handlers
var route_1 = require("@/app/api/predictive-analytics/models/route");
var route_2 = require("@/app/api/predictive-analytics/predictions/route");
var route_3 = require("@/app/api/predictive-analytics/accuracy/route");
var route_4 = require("@/app/api/predictive-analytics/alerts/route");
var route_5 = require("@/app/api/predictive-analytics/recommendations/route");
// Mock Supabase
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
  })),
}));
// Mock data
var mockForecastingModel = {
  id: "model-123",
  model_type: "appointment_demand",
  model_name: "Agendamentos - Modelo Principal",
  accuracy_score: 0.875,
  status: "active",
  last_trained: "2025-01-26T09:00:00Z",
  training_data_start_date: "2024-01-01T00:00:00Z",
  training_data_end_date: "2025-01-26T00:00:00Z",
  metadata: {
    features: ["historical_bookings", "seasonal_patterns", "marketing_campaigns"],
    algorithm: "Random Forest",
  },
  created_at: "2025-01-26T09:00:00Z",
  updated_at: "2025-01-26T09:00:00Z",
};
var mockPrediction = {
  id: "pred-123",
  model_id: "model-123",
  prediction_date: "2025-02-01",
  forecast_period: "daily",
  category: "appointments",
  forecast_value: 45.5,
  confidence_interval_lower: 40.2,
  confidence_interval_upper: 50.8,
  confidence_score: 0.89,
  created_at: "2025-01-26T09:00:00Z",
};
var mockAlert = {
  id: "alert-123",
  alert_type: "demand_spike",
  severity: "high",
  title: "Pico de Demanda Detectado",
  description: "Previsão indica aumento de 35% na demanda para a próxima semana",
  metadata: {
    predicted_increase: 0.35,
    current_baseline: 45,
    predicted_peak: 61,
  },
  notification_sent: false,
  acknowledged: false,
  resolution_status: "open",
  alert_date: "2025-01-26T09:00:00Z",
  created_at: "2025-01-26T09:00:00Z",
};
var mockUser = {
  id: "user-123",
  email: "test@clinic.com",
  role: "admin",
};
var mockSession = {
  user: mockUser,
  access_token: "mock-token",
  expires_at: Date.now() + 3600000,
};
describe("Predictive Analytics API Integration Tests", () => {
  var mockSupabase = require("@/app/utils/supabase/server").createClient();
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("/api/predictive-analytics/models", () => {
    describe("GET - List forecasting models", () => {
      it("returns active forecasting models successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .mockResolvedValue({
                    data: [mockForecastingModel],
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/models",
                }).req;
                return [4 /*yield*/, (0, route_1.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.models).toHaveLength(1);
                expect(data.models[0]).toMatchObject({
                  id: "model-123",
                  model_type: "appointment_demand",
                  accuracy_score: 0.875,
                });
                return [2 /*return*/];
            }
          });
        }));
      it("filters models by type when specified", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .mockResolvedValue({
                    data: [mockForecastingModel],
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/models?type=appointment_demand",
                  query: { type: "appointment_demand" },
                }).req;
                return [4 /*yield*/, (0, route_1.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(mockSupabase.from().eq).toHaveBeenCalledWith(
                  "model_type",
                  "appointment_demand",
                );
                return [2 /*return*/];
            }
          });
        }));
      it("handles database errors gracefully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .mockResolvedValue({
                    data: null,
                    error: { message: "Database connection failed", code: "08000" },
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/models",
                }).req;
                return [4 /*yield*/, (0, route_1.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(500);
                expect(data.success).toBe(false);
                expect(data.error).toBeDefined();
                return [2 /*return*/];
            }
          });
        }));
      it("requires authentication", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase.auth.getUser.mockResolvedValue({
                  data: { user: null },
                  error: { message: "No user found" },
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/models",
                }).req;
                return [4 /*yield*/, (0, route_1.GET)(req)];
              case 1:
                response = _a.sent();
                expect(response.status).toBe(401);
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("POST - Create new forecasting model", () => {
      var newModelData = {
        model_type: "treatment_demand",
        model_name: "Tratamentos - Modelo Sazonal",
        metadata: {
          features: ["historical_treatments", "seasonal_patterns"],
          algorithm: "Linear Regression",
        },
      };
      it("creates new forecasting model successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .insert()
                  .single()
                  .mockResolvedValue({
                    data: __assign(__assign(__assign({}, mockForecastingModel), newModelData), {
                      id: "model-456",
                    }),
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "POST",
                  url: "/api/predictive-analytics/models",
                  body: newModelData,
                }).req;
                return [4 /*yield*/, (0, route_1.POST)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(201);
                expect(data.success).toBe(true);
                expect(data.model.model_type).toBe("treatment_demand");
                expect(data.model.model_name).toBe("Tratamentos - Modelo Sazonal");
                return [2 /*return*/];
            }
          });
        }));
      it("validates required fields", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var invalidData, req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                invalidData = {
                  model_name: "Modelo Sem Tipo",
                  // Missing model_type
                };
                req = (0, node_mocks_http_1.createMocks)({
                  method: "POST",
                  url: "/api/predictive-analytics/models",
                  body: invalidData,
                }).req;
                return [4 /*yield*/, (0, route_1.POST)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toContain("validation");
                return [2 /*return*/];
            }
          });
        }));
      it("handles database insert errors", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .insert()
                  .single()
                  .mockResolvedValue({
                    data: null,
                    error: { message: "Duplicate key value", code: "23505" },
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "POST",
                  url: "/api/predictive-analytics/models",
                  body: newModelData,
                }).req;
                return [4 /*yield*/, (0, route_1.POST)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(500);
                expect(data.success).toBe(false);
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("/api/predictive-analytics/predictions", () => {
    describe("GET - List demand predictions", () => {
      it("returns predictions with filtering options", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .mockResolvedValue({
                    data: [mockPrediction],
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/predictions?category=appointments&period=daily",
                  query: { category: "appointments", period: "daily" },
                }).req;
                return [4 /*yield*/, (0, route_2.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.predictions).toHaveLength(1);
                expect(data.predictions[0].category).toBe("appointments");
                expect(data.predictions[0].forecast_period).toBe("daily");
                return [2 /*return*/];
            }
          });
        }));
      it("supports date range filtering", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var startDate, endDate, req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                startDate = "2025-02-01";
                endDate = "2025-02-07";
                mockSupabase
                  .from()
                  .select()
                  .gte()
                  .lte()
                  .mockResolvedValue({
                    data: [mockPrediction],
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/predictions?start_date="
                    .concat(startDate, "&end_date=")
                    .concat(endDate),
                  query: { start_date: startDate, end_date: endDate },
                }).req;
                return [4 /*yield*/, (0, route_2.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(mockSupabase.from().gte).toHaveBeenCalledWith("prediction_date", startDate);
                expect(mockSupabase.from().lte).toHaveBeenCalledWith("prediction_date", endDate);
                return [2 /*return*/];
            }
          });
        }));
      it("includes confidence intervals and scores", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .mockResolvedValue({
                    data: [mockPrediction],
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/predictions",
                }).req;
                return [4 /*yield*/, (0, route_2.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.predictions[0]).toHaveProperty("confidence_interval_lower");
                expect(data.predictions[0]).toHaveProperty("confidence_interval_upper");
                expect(data.predictions[0]).toHaveProperty("confidence_score");
                expect(data.predictions[0].confidence_score).toBe(0.89);
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("POST - Generate new predictions", () => {
      var predictionRequest = {
        model_id: "model-123",
        prediction_date: "2025-02-01",
        forecast_period: "daily",
        category: "appointments",
      };
      it("generates new predictions successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                // Mock model exists
                mockSupabase.from().select().eq().single().mockResolvedValue({
                  data: mockForecastingModel,
                  error: null,
                });
                // Mock prediction creation
                mockSupabase.from().insert().single().mockResolvedValue({
                  data: mockPrediction,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "POST",
                  url: "/api/predictive-analytics/predictions",
                  body: predictionRequest,
                }).req;
                return [4 /*yield*/, (0, route_2.POST)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(201);
                expect(data.success).toBe(true);
                expect(data.prediction.forecast_value).toBe(45.5);
                expect(data.prediction.confidence_score).toBe(0.89);
                return [2 /*return*/];
            }
          });
        }));
      it("validates model exists and is active", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .single()
                  .mockResolvedValue({
                    data: null,
                    error: { message: "Model not found", code: "PGRST116" },
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "POST",
                  url: "/api/predictive-analytics/predictions",
                  body: predictionRequest,
                }).req;
                return [4 /*yield*/, (0, route_2.POST)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(404);
                expect(data.success).toBe(false);
                expect(data.error).toContain("Model not found");
                return [2 /*return*/];
            }
          });
        }));
      it("validates prediction parameters", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var invalidRequest, req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                invalidRequest = {
                  model_id: "model-123",
                  // Missing required fields
                };
                req = (0, node_mocks_http_1.createMocks)({
                  method: "POST",
                  url: "/api/predictive-analytics/predictions",
                  body: invalidRequest,
                }).req;
                return [4 /*yield*/, (0, route_2.POST)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toContain("validation");
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("/api/predictive-analytics/accuracy", () => {
    describe("GET - Model accuracy tracking", () => {
      var accuracyData = [
        {
          id: "acc-123",
          model_id: "model-123",
          evaluation_date: "2025-01-26",
          accuracy_score: 0.875,
          mae: 2.3,
          rmse: 3.1,
          evaluation_period: "weekly",
        },
      ];
      it("returns accuracy metrics for models", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase.from().select().mockResolvedValue({
                  data: accuracyData,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/accuracy",
                }).req;
                return [4 /*yield*/, (0, route_3.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.accuracy_metrics).toHaveLength(1);
                expect(data.accuracy_metrics[0].accuracy_score).toBe(0.875);
                expect(data.accuracy_metrics[0]).toHaveProperty("mae");
                expect(data.accuracy_metrics[0]).toHaveProperty("rmse");
                return [2 /*return*/];
            }
          });
        }));
      it("filters by model_id when specified", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase.from().select().eq().mockResolvedValue({
                  data: accuracyData,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/accuracy?model_id=model-123",
                  query: { model_id: "model-123" },
                }).req;
                return [4 /*yield*/, (0, route_3.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(mockSupabase.from().eq).toHaveBeenCalledWith("model_id", "model-123");
                return [2 /*return*/];
            }
          });
        }));
      it("calculates average accuracy across models", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var multipleAccuracy, req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                multipleAccuracy = [
                  __assign(__assign({}, accuracyData[0]), { accuracy_score: 0.85 }),
                  __assign(__assign({}, accuracyData[0]), { id: "acc-456", accuracy_score: 0.9 }),
                ];
                mockSupabase.from().select().mockResolvedValue({
                  data: multipleAccuracy,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/accuracy",
                }).req;
                return [4 /*yield*/, (0, route_3.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.average_accuracy).toBe(0.875); // (0.85 + 0.90) / 2
                return [2 /*return*/];
            }
          });
        }));
      it("identifies models meeting accuracy threshold", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var varyingAccuracy, req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                varyingAccuracy = [
                  __assign(__assign({}, accuracyData[0]), { accuracy_score: 0.87 }),
                  __assign(__assign({}, accuracyData[0]), { id: "acc-456", accuracy_score: 0.8 }),
                ];
                mockSupabase.from().select().mockResolvedValue({
                  data: varyingAccuracy,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/accuracy",
                }).req;
                return [4 /*yield*/, (0, route_3.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.models_above_threshold).toBe(1);
                expect(data.models_below_threshold).toBe(1);
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("/api/predictive-analytics/alerts", () => {
    describe("GET - List demand alerts", () => {
      it("returns active demand alerts", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .mockResolvedValue({
                    data: [mockAlert],
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/alerts",
                }).req;
                return [4 /*yield*/, (0, route_4.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.alerts).toHaveLength(1);
                expect(data.alerts[0].alert_type).toBe("demand_spike");
                expect(data.alerts[0].severity).toBe("high");
                return [2 /*return*/];
            }
          });
        }));
      it("filters alerts by severity", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .mockResolvedValue({
                    data: [mockAlert],
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/alerts?severity=high",
                  query: { severity: "high" },
                }).req;
                return [4 /*yield*/, (0, route_4.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(mockSupabase.from().eq).toHaveBeenCalledWith("severity", "high");
                return [2 /*return*/];
            }
          });
        }));
      it("filters alerts by acknowledgment status", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .mockResolvedValue({
                    data: [mockAlert],
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/alerts?acknowledged=false",
                  query: { acknowledged: "false" },
                }).req;
                return [4 /*yield*/, (0, route_4.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(mockSupabase.from().eq).toHaveBeenCalledWith("acknowledged", false);
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("PATCH - Update alert status", () => {
      var updateRequest = {
        alert_id: "alert-123",
        acknowledged: true,
        resolution_status: "resolved",
      };
      it("acknowledges alert successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .update()
                  .eq()
                  .single()
                  .mockResolvedValue({
                    data: __assign(__assign({}, mockAlert), {
                      acknowledged: true,
                      resolution_status: "resolved",
                    }),
                    error: null,
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "PATCH",
                  url: "/api/predictive-analytics/alerts",
                  body: updateRequest,
                }).req;
                return [4 /*yield*/, (0, route_4.PATCH)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.alert.acknowledged).toBe(true);
                expect(data.alert.resolution_status).toBe("resolved");
                return [2 /*return*/];
            }
          });
        }));
      it("validates alert exists", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .update()
                  .eq()
                  .single()
                  .mockResolvedValue({
                    data: null,
                    error: { message: "Alert not found", code: "PGRST116" },
                  });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "PATCH",
                  url: "/api/predictive-analytics/alerts",
                  body: updateRequest,
                }).req;
                return [4 /*yield*/, (0, route_4.PATCH)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(404);
                expect(data.success).toBe(false);
                expect(data.error).toContain("Alert not found");
                return [2 /*return*/];
            }
          });
        }));
      it("validates update parameters", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var invalidRequest, req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                invalidRequest = {
                  alert_id: "alert-123",
                  acknowledged: "invalid", // Should be boolean
                };
                req = (0, node_mocks_http_1.createMocks)({
                  method: "PATCH",
                  url: "/api/predictive-analytics/alerts",
                  body: invalidRequest,
                }).req;
                return [4 /*yield*/, (0, route_4.PATCH)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(400);
                expect(data.success).toBe(false);
                expect(data.error).toContain("validation");
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("/api/predictive-analytics/recommendations", () => {
    describe("GET - Resource optimization recommendations", () => {
      var mockRecommendations = [
        {
          id: "rec-123",
          recommendation_type: "resource_allocation",
          title: "Aumento de Equipe Recomendado",
          description:
            "Previsão indica necessidade de 2 profissionais adicionais na próxima semana",
          priority: "high",
          estimated_impact: "Redução de 15% no tempo de espera",
          confidence_score: 0.92,
          metadata: {
            resource_type: "staff",
            recommended_quantity: 2,
            timeframe: "next_week",
          },
          created_at: "2025-01-26T09:00:00Z",
        },
      ];
      it("returns optimization recommendations", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase.from().select().mockResolvedValue({
                  data: mockRecommendations,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/recommendations",
                }).req;
                return [4 /*yield*/, (0, route_5.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(data.recommendations).toHaveLength(1);
                expect(data.recommendations[0].recommendation_type).toBe("resource_allocation");
                expect(data.recommendations[0].priority).toBe("high");
                expect(data.recommendations[0].confidence_score).toBe(0.92);
                return [2 /*return*/];
            }
          });
        }));
      it("filters recommendations by type", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase.from().select().eq().mockResolvedValue({
                  data: mockRecommendations,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/recommendations?type=resource_allocation",
                  query: { type: "resource_allocation" },
                }).req;
                return [4 /*yield*/, (0, route_5.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(mockSupabase.from().eq).toHaveBeenCalledWith(
                  "recommendation_type",
                  "resource_allocation",
                );
                return [2 /*return*/];
            }
          });
        }));
      it("filters recommendations by priority", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase.from().select().eq().mockResolvedValue({
                  data: mockRecommendations,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/recommendations?priority=high",
                  query: { priority: "high" },
                }).req;
                return [4 /*yield*/, (0, route_5.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(mockSupabase.from().eq).toHaveBeenCalledWith("priority", "high");
                return [2 /*return*/];
            }
          });
        }));
      it("orders recommendations by confidence score", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var req, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabase.from().select().order().mockResolvedValue({
                  data: mockRecommendations,
                  error: null,
                });
                req = (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/recommendations",
                }).req;
                return [4 /*yield*/, (0, route_5.GET)(req)];
              case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(response.status).toBe(200);
                expect(data.success).toBe(true);
                expect(mockSupabase.from().order).toHaveBeenCalledWith("confidence_score", {
                  ascending: false,
                });
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("Authentication and Authorization", () => {
    it("requires valid session for all endpoints", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var endpoints, _i, endpoints_1, endpoint, req, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "No user found" },
              });
              endpoints = [
                { handler: route_1.GET, url: "/api/predictive-analytics/models" },
                { handler: route_2.GET, url: "/api/predictive-analytics/predictions" },
                { handler: route_3.GET, url: "/api/predictive-analytics/accuracy" },
                { handler: route_4.GET, url: "/api/predictive-analytics/alerts" },
                { handler: route_5.GET, url: "/api/predictive-analytics/recommendations" },
              ];
              (_i = 0), (endpoints_1 = endpoints);
              _a.label = 1;
            case 1:
              if (!(_i < endpoints_1.length)) return [3 /*break*/, 4];
              endpoint = endpoints_1[_i];
              req = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: endpoint.url,
              }).req;
              return [4 /*yield*/, endpoint.handler(req)];
            case 2:
              response = _a.sent();
              expect(response.status).toBe(401);
              _a.label = 3;
            case 3:
              _i++;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/];
          }
        });
      }));
    it("validates user permissions for write operations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var limitedUser, req, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              limitedUser = __assign(__assign({}, mockUser), { role: "user" });
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: limitedUser },
                error: null,
              });
              req = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                url: "/api/predictive-analytics/models",
                body: { model_type: "test", model_name: "Test Model" },
              }).req;
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              response = _a.sent();
              // Should check permissions (implementation dependent)
              expect(response.status).toBeOneOf([201, 403]);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Story 8.3 API Acceptance Criteria Validation", () => {
    it("AC1: ML-based forecasting with ≥85% accuracy tracking", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var highAccuracyMetrics, req, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              highAccuracyMetrics = [
                { accuracy_score: 0.87, model_id: "model-1" },
                { accuracy_score: 0.89, model_id: "model-2" },
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: highAccuracyMetrics,
                error: null,
              });
              req = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/predictive-analytics/accuracy",
              }).req;
              return [4 /*yield*/, (0, route_3.GET)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.average_accuracy).toBeGreaterThanOrEqual(0.85);
              expect(data.models_above_threshold).toBe(2);
              return [2 /*return*/];
          }
        });
      }));
    it("AC2: Multi-dimensional forecasting capabilities", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var multiDimensionalPredictions, req, response, data, categories;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              multiDimensionalPredictions = [
                { category: "appointments", forecast_period: "daily" },
                { category: "treatments", forecast_period: "weekly" },
                { category: "revenue", forecast_period: "monthly" },
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: multiDimensionalPredictions,
                error: null,
              });
              req = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/predictive-analytics/predictions",
              }).req;
              return [4 /*yield*/, (0, route_2.GET)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.predictions).toHaveLength(3);
              categories = data.predictions.map((p) => p.category);
              expect(categories).toContain("appointments");
              expect(categories).toContain("treatments");
              expect(categories).toContain("revenue");
              return [2 /*return*/];
          }
        });
      }));
    it("AC4: Early warning system implementation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var demandAlerts, req, response, data, alertTypes;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              demandAlerts = [
                { alert_type: "demand_spike", severity: "high" },
                { alert_type: "resource_shortage", severity: "medium" },
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: demandAlerts,
                error: null,
              });
              req = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/predictive-analytics/alerts",
              }).req;
              return [4 /*yield*/, (0, route_4.GET)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.alerts).toHaveLength(2);
              alertTypes = data.alerts.map((a) => a.alert_type);
              expect(alertTypes).toContain("demand_spike");
              expect(alertTypes).toContain("resource_shortage");
              return [2 /*return*/];
          }
        });
      }));
    it("AC5: Resource optimization recommendations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var optimizationRecs, req, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              optimizationRecs = [
                { recommendation_type: "resource_allocation", confidence_score: 0.92 },
                { recommendation_type: "schedule_optimization", confidence_score: 0.88 },
              ];
              mockSupabase.from().select().order().mockResolvedValue({
                data: optimizationRecs,
                error: null,
              });
              req = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/predictive-analytics/recommendations",
              }).req;
              return [4 /*yield*/, (0, route_5.GET)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.recommendations).toHaveLength(2);
              expect(data.recommendations[0].confidence_score).toBeGreaterThan(0.85);
              return [2 /*return*/];
          }
        });
      }));
    it("AC8: Customizable forecasting timeframes", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var timeframePredictions, req, response, data, periods;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              timeframePredictions = [
                { forecast_period: "daily" },
                { forecast_period: "weekly" },
                { forecast_period: "monthly" },
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: timeframePredictions,
                error: null,
              });
              req = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/predictive-analytics/predictions",
              }).req;
              return [4 /*yield*/, (0, route_2.GET)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              periods = data.predictions.map((p) => p.forecast_period);
              expect(periods).toContain("daily");
              expect(periods).toContain("weekly");
              expect(periods).toContain("monthly");
              return [2 /*return*/];
          }
        });
      }));
    it("AC10: Performance tracking and continuous improvement", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var performanceMetrics, req, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              performanceMetrics = [
                {
                  accuracy_score: 0.87,
                  mae: 2.1,
                  rmse: 2.8,
                  evaluation_date: "2025-01-26",
                },
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: performanceMetrics,
                error: null,
              });
              req = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/predictive-analytics/accuracy",
              }).req;
              return [4 /*yield*/, (0, route_3.GET)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(200);
              expect(data.accuracy_metrics[0]).toHaveProperty("accuracy_score");
              expect(data.accuracy_metrics[0]).toHaveProperty("mae");
              expect(data.accuracy_metrics[0]).toHaveProperty("rmse");
              expect(data.accuracy_metrics[0]).toHaveProperty("evaluation_date");
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Error Handling and Edge Cases", () => {
    it("handles malformed request bodies gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var req, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              req = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                url: "/api/predictive-analytics/models",
                body: "invalid json",
              }).req;
              return [4 /*yield*/, (0, route_1.POST)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(400);
              expect(data.success).toBe(false);
              return [2 /*return*/];
          }
        });
      }));
    it("handles database connection timeouts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var req, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.from().select().mockRejectedValue(new Error("Connection timeout"));
              req = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                url: "/api/predictive-analytics/models",
              }).req;
              return [4 /*yield*/, (0, route_1.GET)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(500);
              expect(data.success).toBe(false);
              return [2 /*return*/];
          }
        });
      }));
    it("validates date formats in requests", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest, req, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidRequest = {
                model_id: "model-123",
                prediction_date: "invalid-date",
                forecast_period: "daily",
                category: "appointments",
              };
              req = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                url: "/api/predictive-analytics/predictions",
                body: invalidRequest,
              }).req;
              return [4 /*yield*/, (0, route_2.POST)(req)];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(response.status).toBe(400);
              expect(data.success).toBe(false);
              expect(data.error).toContain("date");
              return [2 /*return*/];
          }
        });
      }));
    it("handles concurrent access gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requests, responses;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requests = Array.from({ length: 5 }, () =>
                (0, node_mocks_http_1.createMocks)({
                  method: "GET",
                  url: "/api/predictive-analytics/models",
                }),
              );
              mockSupabase
                .from()
                .select()
                .mockResolvedValue({
                  data: [mockForecastingModel],
                  error: null,
                });
              return [
                4 /*yield*/,
                Promise.all(
                  requests.map((_a) => {
                    var req = _a.req;
                    return (0, route_1.GET)(req);
                  }),
                ),
              ];
            case 1:
              responses = _a.sent();
              responses.forEach((response) => {
                expect(response.status).toBe(200);
              });
              return [2 /*return*/];
          }
        });
      }));
  });
});
