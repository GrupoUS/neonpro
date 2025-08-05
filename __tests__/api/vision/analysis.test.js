/**
 * Vision Analysis API Tests
 *
 * Comprehensive test suite for the vision analysis API endpoints.
 * Tests POST, GET, PUT, and DELETE operations with various scenarios.
 */
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
var route_1 = require("@/app/api/vision/analysis/route");
var server_1 = require("@/lib/supabase/server");
var analysis_engine_1 = require("@/lib/vision/analysis-engine");
// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/vision/analysis-engine");
jest.mock("@/lib/monitoring/error-tracking");
var mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};
var mockVisionEngine = {
  analyzeBeforeAfter: jest.fn(),
  saveAnalysisResult: jest.fn(),
};
server_1.createClient.mockReturnValue(mockSupabase);
analysis_engine_1.VisionAnalysisEngine.mockImplementation(() => mockVisionEngine);
describe("/api/vision/analysis", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    });
  });
  describe("POST /api/vision/analysis", () => {
    it("should create new analysis successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAnalysisResult, _a, req, _res;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockAnalysisResult = {
                id: "analysis-123",
                patientId: "patient-456",
                treatmentId: "treatment-789",
                accuracyScore: 0.96,
                processingTime: 15000,
                improvementPercentage: 25.5,
                changeMetrics: {
                  overallImprovement: 25.5,
                  textureImprovement: 30.2,
                  colorImprovement: 20.8,
                  clarityImprovement: 28.1,
                  symmetryImprovement: 22.3,
                },
                annotations: [],
              };
              mockVisionEngine.analyzeBeforeAfter.mockResolvedValue(mockAnalysisResult);
              mockSupabase
                .from()
                .insert.mockResolvedValue({ data: mockAnalysisResult, error: null });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: {
                  patientId: "patient-456",
                  treatmentId: "treatment-789",
                  beforeImage: "base64-image-data",
                  afterImage: "base64-image-data",
                },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.POST(req)];
            case 1:
              _b.sent();
              expect(mockVisionEngine.analyzeBeforeAfter).toHaveBeenCalled();
              expect(mockSupabase.from).toHaveBeenCalledWith("vision_analyses");
              return [2 /*return*/];
          }
        });
      }));
    it("should validate required fields", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, _res, response, data;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: {
                  patientId: "patient-456",
                  // Missing required fields
                },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.POST(req)];
            case 1:
              response = _b.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _b.sent();
              expect(response.status).toBe(400);
              expect(data.error).toContain("required");
              return [2 /*return*/];
          }
        });
      }));
    it("should handle authentication errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, _res, response;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: new Error("Unauthorized"),
              });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: {
                  patientId: "patient-456",
                  treatmentId: "treatment-789",
                  beforeImage: "base64-image-data",
                  afterImage: "base64-image-data",
                },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.POST(req)];
            case 1:
              response = _b.sent();
              expect(response.status).toBe(401);
              return [2 /*return*/];
          }
        });
      }));
    it("should handle analysis engine errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, _res, response;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockVisionEngine.analyzeBeforeAfter.mockRejectedValue(new Error("Analysis failed"));
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: {
                  patientId: "patient-456",
                  treatmentId: "treatment-789",
                  beforeImage: "base64-image-data",
                  afterImage: "base64-image-data",
                },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.POST(req)];
            case 1:
              response = _b.sent();
              expect(response.status).toBe(500);
              return [2 /*return*/];
          }
        });
      }));
    it("should check accuracy and time requirements", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAnalysisResult, _a, req, _res, response, data;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockAnalysisResult = {
                id: "analysis-123",
                patientId: "patient-456",
                treatmentId: "treatment-789",
                accuracyScore: 0.96, // Above 0.85 threshold
                processingTime: 15000, // Below 30000ms threshold
                improvementPercentage: 25.5,
                changeMetrics: {},
                annotations: [],
              };
              mockVisionEngine.analyzeBeforeAfter.mockResolvedValue(mockAnalysisResult);
              mockSupabase
                .from()
                .insert.mockResolvedValue({ data: mockAnalysisResult, error: null });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: {
                  patientId: "patient-456",
                  treatmentId: "treatment-789",
                  beforeImage: "base64-image-data",
                  afterImage: "base64-image-data",
                },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.POST(req)];
            case 1:
              response = _b.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _b.sent();
              expect(data.meetsAccuracyTarget).toBe(true);
              expect(data.meetsProcessingTimeTarget).toBe(true);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("GET /api/vision/analysis", () => {
    it("should retrieve analysis history for patient", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAnalyses, _a, req, _res, response, data;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockAnalyses = [
                {
                  id: "analysis-1",
                  patient_id: "patient-456",
                  accuracy_score: 0.95,
                  processing_time: 12000,
                  created_at: "2024-01-01T00:00:00Z",
                },
                {
                  id: "analysis-2",
                  patient_id: "patient-456",
                  accuracy_score: 0.92,
                  processing_time: 18000,
                  created_at: "2024-01-02T00:00:00Z",
                },
              ];
              mockSupabase.from().select.mockResolvedValue({ data: mockAnalyses, error: null });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                query: { patientId: "patient-456" },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.GET(req)];
            case 1:
              response = _b.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _b.sent();
              expect(response.status).toBe(200);
              expect(data.analyses).toHaveLength(2);
              expect(mockSupabase.from).toHaveBeenCalledWith("vision_analyses");
              return [2 /*return*/];
          }
        });
      }));
    it("should handle pagination", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, _res;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "GET",
                query: {
                  patientId: "patient-456",
                  page: "2",
                  limit: "10",
                },
              })),
                (req = _a.req),
                (_res = _a.res);
              mockSupabase.from().select.mockReturnValue({
                range: jest.fn().mockResolvedValue({ data: [], error: null }),
              });
              return [4 /*yield*/, route_1.default.GET(req)];
            case 1:
              _b.sent();
              expect(mockSupabase.from().select().range).toHaveBeenCalledWith(10, 19);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("PUT /api/vision/analysis", () => {
    it("should update analysis record", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var updateData, _a, req, _res, response;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              updateData = {
                notes: "Updated analysis notes",
                qualityRating: 5,
                reviewStatus: "approved",
              };
              mockSupabase.from().update.mockResolvedValue({ data: updateData, error: null });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "PUT",
                query: { id: "analysis-123" },
                body: updateData,
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.PUT(req)];
            case 1:
              response = _b.sent();
              expect(response.status).toBe(200);
              expect(mockSupabase.from().update).toHaveBeenCalledWith(updateData);
              return [2 /*return*/];
          }
        });
      }));
    it("should validate analysis ID", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, _res, response;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "PUT",
                query: {}, // Missing ID
                body: { notes: "Test notes" },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.PUT(req)];
            case 1:
              response = _b.sent();
              expect(response.status).toBe(400);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("DELETE /api/vision/analysis", () => {
    it("should soft delete analysis record", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, _res, response;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockSupabase.from().update.mockResolvedValue({ data: null, error: null });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "DELETE",
                query: { id: "analysis-123" },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.DELETE(req)];
            case 1:
              response = _b.sent();
              expect(response.status).toBe(200);
              expect(mockSupabase.from().update).toHaveBeenCalledWith({
                deleted_at: expect.any(String),
                is_active: false,
              });
              return [2 /*return*/];
          }
        });
      }));
    it("should validate analysis ID for deletion", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var _a, req, _res, response;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "DELETE",
                query: {}, // Missing ID
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.DELETE(req)];
            case 1:
              response = _b.sent();
              expect(response.status).toBe(400);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Performance Requirements", () => {
    it("should log performance metrics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAnalysisResult, _a, req, _res, response, data;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockAnalysisResult = {
                id: "analysis-123",
                patientId: "patient-456",
                treatmentId: "treatment-789",
                accuracyScore: 0.96,
                processingTime: 15000,
                improvementPercentage: 25.5,
                changeMetrics: {},
                annotations: [],
              };
              mockVisionEngine.analyzeBeforeAfter.mockResolvedValue(mockAnalysisResult);
              mockSupabase
                .from()
                .insert.mockResolvedValue({ data: mockAnalysisResult, error: null });
              (_a = (0, node_mocks_http_1.createMocks)({
                method: "POST",
                body: {
                  patientId: "patient-456",
                  treatmentId: "treatment-789",
                  beforeImage: "base64-image-data",
                  afterImage: "base64-image-data",
                },
              })),
                (req = _a.req),
                (_res = _a.res);
              return [4 /*yield*/, route_1.default.POST(req)];
            case 1:
              response = _b.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _b.sent();
              // Verify performance metrics are included
              expect(data.performance).toBeDefined();
              expect(data.performance.accuracyScore).toBe(0.96);
              expect(data.performance.processingTime).toBe(15000);
              return [2 /*return*/];
          }
        });
      }));
  });
});
