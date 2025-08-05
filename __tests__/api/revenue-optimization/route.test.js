// 🧪 **Revenue Optimization API Route Tests**
// Comprehensive test suite for revenue optimization endpoints
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
// Mock Supabase FIRST
globals_1.jest.mock("@/app/utils/supabase/server", () => ({
  createClient: globals_1.jest.fn(),
}));
// Mock revenue optimization engine with proper ES module pattern
globals_1.jest.mock("@/lib/financial/revenue-optimization-engine", () => ({
  RevenueOptimizationEngine: globals_1.jest.fn().mockImplementation(() => ({
    optimizePricing: globals_1.jest.fn(),
    optimizeServiceMix: globals_1.jest.fn(),
    enhanceCLV: globals_1.jest.fn(),
    generateAutomatedRecommendations: globals_1.jest.fn(),
    performCompetitiveAnalysis: globals_1.jest.fn(),
    trackROI: globals_1.jest.fn(),
  })),
  revenueOptimizationEngine: {
    optimizePricing: globals_1.jest.fn(),
    optimizeServiceMix: globals_1.jest.fn(),
    enhanceCLV: globals_1.jest.fn(),
    generateAutomatedRecommendations: globals_1.jest.fn(),
    performCompetitiveAnalysis: globals_1.jest.fn(),
    trackROI: globals_1.jest.fn(),
  },
}));
// Import AFTER mocks are defined
var route_1 = require("@/app/api/revenue-optimization/route");
var server_2 = require("@/app/utils/supabase/server");
(0, globals_1.describe)("Revenue Optimization API", () => {
  var mockSupabaseClient;
  var validUserId = "550e8400-e29b-41d4-a716-446655440001";
  var validClinicId = "550e8400-e29b-41d4-a716-446655440002";
  var validOptId = "550e8400-e29b-41d4-a716-446655440003";
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
    // Import mocked engine using require pattern
    var revenueOptimizationEngine =
      require("@/lib/financial/revenue-optimization-engine").revenueOptimizationEngine;
    // Setup Supabase client mock
    mockSupabaseClient = {
      auth: {
        getUser: globals_1.jest.fn().mockResolvedValue({
          data: { user: { id: validUserId, email: "test@test.com" } },
          error: null,
        }),
      },
      from: globals_1.jest.fn().mockReturnValue({
        select: globals_1.jest.fn(() => ({
          eq: globals_1.jest.fn(() => ({
            eq: globals_1.jest.fn(() => ({
              eq: globals_1.jest.fn(() => ({
                single: globals_1.jest.fn(() =>
                  Promise.resolve({
                    data: { clinic_id: validClinicId },
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
        insert: globals_1.jest.fn(() => ({
          select: globals_1.jest.fn(() => ({
            single: globals_1.jest.fn(() =>
              Promise.resolve({
                data: { id: validOptId, title: "Test Optimization" },
                error: null,
              }),
            ),
          })),
        })),
        update: globals_1.jest.fn(() => ({
          eq: globals_1.jest.fn(() => ({
            eq: globals_1.jest.fn(() => ({
              select: globals_1.jest.fn(() => ({
                single: globals_1.jest.fn(() =>
                  Promise.resolve({
                    data: { id: validOptId, title: "Updated Title" },
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
        delete: globals_1.jest.fn(() => ({
          eq: globals_1.jest.fn(() => ({
            eq: globals_1.jest.fn(() =>
              Promise.resolve({
                error: null,
              }),
            ),
          })),
        })),
        order: globals_1.jest.fn(() => ({
          limit: globals_1.jest.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            }),
          ),
        })),
      }),
    };
    // createClient returns a Promise that resolves to the client
    server_2.createClient.mockResolvedValue(mockSupabaseClient);
    // Setup engine mocks using require pattern
    revenueOptimizationEngine.optimizePricing.mockResolvedValue({
      recommendations: ["Increase premium service prices by 10%"],
      projectedIncrease: 15,
      implementationPlan: ["Update pricing", "Train staff"],
      metrics: { currentRevenue: 10000, projectedRevenue: 11500 },
    });
    revenueOptimizationEngine.optimizeServiceMix.mockResolvedValue({
      recommendations: ["Focus on high-margin procedures"],
      profitabilityGain: 20,
      implementationPlan: ["Staff training", "Marketing"],
      analysis: { highMarginServices: ["Botox", "Fillers"] },
    });
    revenueOptimizationEngine.enhanceCLV.mockResolvedValue({
      recommendations: ["Implement loyalty program"],
      projectedIncrease: 25,
      implementationPlan: ["Program design", "Launch"],
      insights: { avgCLV: 5000, targetCLV: 6250 },
    });
    revenueOptimizationEngine.generateAutomatedRecommendations.mockResolvedValue({
      recommendations: ["Optimize scheduling"],
      confidence: 0.85,
      implementationPlan: ["System update"],
      insights: { efficiency: 90 },
    });
    revenueOptimizationEngine.performCompetitiveAnalysis.mockResolvedValue({
      recommendations: ["Price adjustments"],
      marketPosition: "competitive",
      implementationPlan: ["Research", "Adjust"],
      analysis: { competitors: 5, avgPrice: 100 },
    });
    revenueOptimizationEngine.trackROI.mockResolvedValue({
      recommendations: ["Monitor metrics"],
      currentROI: 15,
      implementationPlan: ["Setup tracking"],
      metrics: { investment: 1000, returns: 1150 },
    });
  });
  (0, globals_1.describe)("🔥 GET /api/revenue-optimization", () => {
    (0, globals_1.test)("should return comprehensive revenue optimization overview", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response, errorData, data, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?clinicId=".concat(validClinicId),
              );
              _a.label = 1;
            case 1:
              _a.trys.push([1, 6, undefined, 7]);
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 2:
              response = _a.sent();
              if (!(response.status !== 200)) return [3 /*break*/, 4];
              return [4 /*yield*/, response.json()];
            case 3:
              errorData = _a.sent();
              throw new Error(
                "API returned ".concat(response.status, ": ").concat(JSON.stringify(errorData)),
              );
            case 4:
              (0, globals_1.expect)(response.status).toBe(200);
              return [4 /*yield*/, response.json()];
            case 5:
              data = _a.sent();
              (0, globals_1.expect)(data).toHaveProperty("pricingOptimization");
              (0, globals_1.expect)(data).toHaveProperty("serviceMixOptimization");
              (0, globals_1.expect)(data).toHaveProperty("clvEnhancement");
              (0, globals_1.expect)(data).toHaveProperty("automatedRecommendations");
              (0, globals_1.expect)(data).toHaveProperty("competitiveAnalysis");
              (0, globals_1.expect)(data).toHaveProperty("roiTracking");
              return [3 /*break*/, 7];
            case 6:
              error_1 = _a.sent();
              throw new Error("Test failed with error: ".concat(error_1.message));
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should validate clinic access", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.from.mockReturnValueOnce({
                select: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() => ({
                      eq: globals_1.jest.fn(() => ({
                        single: globals_1.jest.fn(() =>
                          Promise.resolve({ data: null, error: null }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?clinicId=".concat(validClinicId),
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(403);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should require clinic ID", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization");
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle authentication errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
                data: { user: null },
                error: { message: "Not authenticated" },
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?clinicId=".concat(validClinicId),
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(401);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should call all optimization engines", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var revenueOptimizationEngine, request;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              revenueOptimizationEngine =
                require("@/lib/financial/revenue-optimization-engine").revenueOptimizationEngine;
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?clinicId=".concat(validClinicId),
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              _a.sent();
              (0, globals_1.expect)(revenueOptimizationEngine.optimizePricing).toHaveBeenCalledWith(
                validClinicId,
                undefined,
              );
              (0, globals_1.expect)(
                revenueOptimizationEngine.optimizeServiceMix,
              ).toHaveBeenCalledWith(validClinicId);
              (0, globals_1.expect)(revenueOptimizationEngine.enhanceCLV).toHaveBeenCalledWith(
                validClinicId,
                undefined,
              );
              (0, globals_1.expect)(
                revenueOptimizationEngine.generateAutomatedRecommendations,
              ).toHaveBeenCalledWith(validClinicId);
              (0, globals_1.expect)(
                revenueOptimizationEngine.performCompetitiveAnalysis,
              ).toHaveBeenCalledWith(validClinicId);
              (0, globals_1.expect)(revenueOptimizationEngine.trackROI).toHaveBeenCalledWith(
                validClinicId,
                undefined,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle engine errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var revenueOptimizationEngine, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              revenueOptimizationEngine =
                require("@/lib/financial/revenue-optimization-engine").revenueOptimizationEngine;
              revenueOptimizationEngine.optimizePricing.mockRejectedValueOnce(
                new Error("Engine error"),
              );
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?clinicId=".concat(validClinicId),
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(500);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("🔥 POST /api/revenue-optimization", () => {
    (0, globals_1.test)("should create pricing optimization", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                optimizationType: "pricing",
                clinicId: validClinicId,
                title: "Pricing Optimization Test",
                serviceId: "service-123",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(mockOptimizePricing).toHaveBeenCalledWith(
                validClinicId,
                "service-123",
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should create service mix optimization", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                optimizationType: "service_mix",
                clinicId: validClinicId,
                title: "Service Mix Test",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(mockOptimizeServiceMix).toHaveBeenCalledWith(validClinicId);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should create CLV optimization", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                optimizationType: "clv",
                clinicId: validClinicId,
                title: "CLV Test",
                patientId: "patient-123",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(mockEnhanceCLV).toHaveBeenCalledWith(
                validClinicId,
                "patient-123",
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should create automated recommendations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                optimizationType: "automated_recommendations",
                clinicId: validClinicId,
                title: "Automated Test",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(mockGenerateAutomatedRecommendations).toHaveBeenCalledWith(
                validClinicId,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should create competitive analysis", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                optimizationType: "competitive_analysis",
                clinicId: validClinicId,
                title: "Competitive Test",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(mockPerformCompetitiveAnalysis).toHaveBeenCalledWith(
                validClinicId,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should create ROI tracking", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                optimizationType: "roi_tracking",
                clinicId: validClinicId,
                title: "ROI Test",
                optimizationId: "opt-789",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              (0, globals_1.expect)(mockTrackROI).toHaveBeenCalledWith(validClinicId, "opt-789");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should validate required fields", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                optimizationType: "pricing",
                // Missing clinicId
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should reject invalid optimization type", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                optimizationType: "invalid_type",
                clinicId: validClinicId,
                title: "Invalid Test",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle Supabase insert errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock professional verification (success)
              mockSupabaseClient.from.mockReturnValueOnce({
                select: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() => ({
                      eq: globals_1.jest.fn(() => ({
                        single: globals_1.jest.fn(() =>
                          Promise.resolve({
                            data: { clinic_id: validClinicId },
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              // Mock optimization insert (error)
              mockSupabaseClient.from.mockReturnValueOnce({
                insert: globals_1.jest.fn(() => ({
                  select: globals_1.jest.fn(() => ({
                    single: globals_1.jest.fn(() =>
                      Promise.resolve({
                        data: null,
                        error: { message: "Insert failed", code: "INSERT_ERROR" },
                      }),
                    ),
                  })),
                })),
              });
              requestBody = {
                optimizationType: "pricing",
                clinicId: validClinicId,
                title: "Test Optimization",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(500);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("🔥 PUT /api/revenue-optimization", () => {
    (0, globals_1.test)("should update optimization successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                id: validOptId,
                clinicId: validClinicId,
                title: "Updated Title",
                status: "completed",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "PUT",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.PUT)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should validate required fields for update", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              requestBody = {
                clinicId: validClinicId,
                title: "Updated Title",
                // Missing id
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "PUT",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.PUT)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle update errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requestBody, request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock professional verification (success)
              mockSupabaseClient.from.mockReturnValueOnce({
                select: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() => ({
                      eq: globals_1.jest.fn(() => ({
                        single: globals_1.jest.fn(() =>
                          Promise.resolve({
                            data: { clinic_id: validClinicId },
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              // Mock optimization update (error)
              mockSupabaseClient.from.mockReturnValueOnce({
                update: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() => ({
                      select: globals_1.jest.fn(() => ({
                        single: globals_1.jest.fn(() =>
                          Promise.resolve({
                            data: null,
                            error: { message: "Update failed", code: "UPDATE_ERROR" },
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              requestBody = {
                id: validOptId,
                clinicId: validClinicId,
                title: "Updated Title",
              };
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "PUT",
                body: JSON.stringify(requestBody),
              });
              return [4 /*yield*/, (0, route_1.PUT)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(500);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("🔥 DELETE /api/revenue-optimization", () => {
    (0, globals_1.test)("should delete optimization successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?id=opt-1&clinicId=clinic-123",
                {
                  method: "DELETE",
                },
              );
              return [4 /*yield*/, (0, route_1.DELETE)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(200);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should validate required parameters for delete", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?id=opt-1",
                {
                  method: "DELETE",
                  // Missing clinicId
                },
              );
              return [4 /*yield*/, (0, route_1.DELETE)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(400);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle delete errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock professional verification (success)
              mockSupabaseClient.from.mockReturnValueOnce({
                select: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() => ({
                      eq: globals_1.jest.fn(() => ({
                        single: globals_1.jest.fn(() =>
                          Promise.resolve({
                            data: { clinic_id: validClinicId },
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              // Mock optimization delete (error)
              mockSupabaseClient.from.mockReturnValueOnce({
                delete: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() =>
                      Promise.resolve({
                        error: { message: "Delete failed", code: "DELETE_ERROR" },
                      }),
                    ),
                  })),
                })),
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?id=opt-1&clinicId=clinic-123",
                {
                  method: "DELETE",
                },
              );
              return [4 /*yield*/, (0, route_1.DELETE)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(500);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("🔥 Authorization and Security", () => {
    (0, globals_1.test)("should require authentication for all endpoints", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var getRequest, postRequest, getResponse, postResponse;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Not authenticated" },
              });
              getRequest = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?clinicId=clinic-123",
              );
              postRequest = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization",
                {
                  method: "POST",
                  body: JSON.stringify({ optimizationType: "pricing", clinicId: validClinicId }),
                },
              );
              return [4 /*yield*/, (0, route_1.GET)(getRequest)];
            case 1:
              getResponse = _a.sent();
              return [4 /*yield*/, (0, route_1.POST)(postRequest)];
            case 2:
              postResponse = _a.sent();
              (0, globals_1.expect)(getResponse.status).toBe(401);
              (0, globals_1.expect)(postResponse.status).toBe(401);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should verify clinic access for all endpoints", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock authenticated user but without access to the specific clinic
              mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
                data: { user: { id: validUserId, email: "test@test.com" } },
                error: null,
              });
              // Mock professional verification (no access - returns null)
              mockSupabaseClient.from.mockReturnValueOnce({
                select: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() => ({
                      eq: globals_1.jest.fn(() => ({
                        single: globals_1.jest.fn(() =>
                          Promise.resolve({ data: null, error: null }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?clinicId=unauthorized-clinic",
              );
              return [4 /*yield*/, (0, route_1.GET)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(403);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("🔥 Performance and Error Handling", () => {
    (0, globals_1.test)("should handle concurrent optimization requests", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var requests, responses;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock authenticated user for concurrent requests
              mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: { user: { id: validUserId, email: "test@test.com" } },
                error: null,
              });
              // Mock professional verification (success for all)
              mockSupabaseClient.from.mockReturnValue({
                select: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() => ({
                      eq: globals_1.jest.fn(() => ({
                        single: globals_1.jest.fn(() =>
                          Promise.resolve({
                            data: { clinic_id: validClinicId },
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              requests = Array.from(
                { length: 5 },
                (_, _i) =>
                  new server_1.NextRequest(
                    "http://localhost:3000/api/revenue-optimization?clinicId=".concat(
                      validClinicId,
                    ),
                  ),
              );
              return [4 /*yield*/, Promise.all(requests.map((req) => (0, route_1.GET)(req)))];
            case 1:
              responses = _a.sent();
              responses.forEach((response) => {
                (0, globals_1.expect)(response.status).toBe(200);
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should handle malformed JSON in POST requests", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock authenticated user
              mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
                data: { user: { id: validUserId, email: "test@test.com" } },
                error: null,
              });
              request = new server_1.NextRequest("http://localhost:3000/api/revenue-optimization", {
                method: "POST",
                body: "invalid json",
              });
              return [4 /*yield*/, (0, route_1.POST)(request)];
            case 1:
              response = _a.sent();
              (0, globals_1.expect)(response.status).toBe(500);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.test)("should timeout gracefully on slow operations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request, timeoutPromise, error_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock authenticated user
              mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
                data: { user: { id: validUserId, email: "test@test.com" } },
                error: null,
              });
              // Mock professional verification (success)
              mockSupabaseClient.from.mockReturnValueOnce({
                select: globals_1.jest.fn(() => ({
                  eq: globals_1.jest.fn(() => ({
                    eq: globals_1.jest.fn(() => ({
                      eq: globals_1.jest.fn(() => ({
                        single: globals_1.jest.fn(() =>
                          Promise.resolve({
                            data: { clinic_id: validClinicId },
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              request = new server_1.NextRequest(
                "http://localhost:3000/api/revenue-optimization?clinicId=".concat(validClinicId),
              );
              timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Test timeout")), 1000),
              );
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, undefined, 4]);
              return [4 /*yield*/, Promise.race([(0, route_1.GET)(request), timeoutPromise])];
            case 2:
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              error_2 = _a.sent();
              (0, globals_1.expect)(error_2).toEqual(new Error("Test timeout"));
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
