"use strict";
/**
 * Vision Performance API Tests
 *
 * Test suite for the vision analysis performance monitoring API endpoints.
 * Tests GET and POST operations for performance metrics and monitoring.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_mocks_http_1 = require("node-mocks-http");
var route_1 = require("@/app/api/vision/performance/route");
var server_1 = require("@/lib/supabase/server");
// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/monitoring/error-tracking');
var mockSupabase = {
    auth: {
        getUser: jest.fn()
    },
    from: jest.fn(function () { return ({
        select: jest.fn(),
        insert: jest.fn(),
        eq: jest.fn(),
        gte: jest.fn(),
        lte: jest.fn(),
        order: jest.fn()
    }); }),
    rpc: jest.fn()
};
server_1.createClient.mockReturnValue(mockSupabase);
describe('/api/vision/performance', function () {
    beforeEach(function () {
        jest.clearAllMocks();
        // Default successful auth
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null
        });
    });
    describe('GET /api/vision/performance', function () {
        it('should retrieve aggregated performance metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics, _a, req, res, response, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockMetrics = {
                            totalAnalyses: 150,
                            averageAccuracy: 0.94,
                            averageProcessingTime: 18500,
                            averageConfidence: 0.91,
                            accuracyTargetCompliance: 0.87,
                            processingTimeTargetCompliance: 0.92
                        };
                        mockSupabase.rpc.mockResolvedValue({ data: [mockMetrics], error: null });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            query: {
                                timeRange: '30d',
                                groupBy: 'day'
                            }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.GET(req)];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        expect(response.status).toBe(200);
                        expect(data.metrics).toBeDefined();
                        expect(data.metrics.totalAnalyses).toBe(150);
                        expect(data.metrics.averageAccuracy).toBe(0.94);
                        expect(mockSupabase.rpc).toHaveBeenCalledWith('get_vision_performance_metrics', expect.objectContaining({
                            user_id: 'test-user-id',
                            time_range: '30d',
                            group_by: 'day'
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle time series data request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTimeSeriesData, _a, req, res, response, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockTimeSeriesData = [
                            {
                                date: '2024-01-01',
                                totalAnalyses: 10,
                                averageAccuracy: 0.95,
                                averageProcessingTime: 15000
                            },
                            {
                                date: '2024-01-02',
                                totalAnalyses: 12,
                                averageAccuracy: 0.93,
                                averageProcessingTime: 17000
                            }
                        ];
                        mockSupabase.rpc.mockResolvedValue({ data: mockTimeSeriesData, error: null });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            query: {
                                timeRange: '7d',
                                groupBy: 'day',
                                includeTimeSeries: 'true'
                            }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.GET(req)];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        expect(response.status).toBe(200);
                        expect(data.timeSeries).toBeDefined();
                        expect(data.timeSeries).toHaveLength(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate time range parameter', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, req, res, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            query: {
                                timeRange: 'invalid-range'
                            }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.GET(req)];
                    case 1:
                        response = _b.sent();
                        expect(response.status).toBe(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle authentication errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, req, res, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: null },
                            error: new Error('Unauthorized')
                        });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            query: { timeRange: '7d' }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.GET(req)];
                    case 1:
                        response = _b.sent();
                        expect(response.status).toBe(401);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle database errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, req, res, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockSupabase.rpc.mockResolvedValue({
                            data: null,
                            error: new Error('Database error')
                        });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            query: { timeRange: '7d' }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.GET(req)];
                    case 1:
                        response = _b.sent();
                        expect(response.status).toBe(500);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should apply default parameters when not provided', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, req, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockSupabase.rpc.mockResolvedValue({ data: [], error: null });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            query: {} // No parameters
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.GET(req)];
                    case 1:
                        _b.sent();
                        expect(mockSupabase.rpc).toHaveBeenCalledWith('get_vision_performance_metrics', expect.objectContaining({
                            time_range: '7d', // Default
                            group_by: 'day' // Default
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /api/vision/performance', function () {
        it('should record performance metrics successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var performanceData, _a, req, res, response, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        performanceData = {
                            analysisId: 'analysis-123',
                            processingTime: 15000,
                            accuracyScore: 0.96,
                            confidenceScore: 0.94,
                            memoryUsage: 512,
                            errorCount: 0,
                            metadata: {
                                modelVersion: '2.1.0',
                                imageSize: '1024x768',
                                processingSteps: 5
                            }
                        };
                        mockSupabase.from().insert.mockResolvedValue({
                            data: [__assign({ id: 'perf-123' }, performanceData)],
                            error: null
                        });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: performanceData
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.POST(req)];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        expect(response.status).toBe(201);
                        expect(data.success).toBe(true);
                        expect(mockSupabase.from).toHaveBeenCalledWith('vision_performance_metrics');
                        expect(mockSupabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
                            analysis_id: 'analysis-123',
                            processing_time: 15000,
                            accuracy_score: 0.96,
                            confidence_score: 0.94,
                            memory_usage: 512,
                            error_count: 0,
                            user_id: 'test-user-id'
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate required fields', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, req, res, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: {
                                analysisId: 'analysis-123'
                                // Missing required fields
                            }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.POST(req)];
                    case 1:
                        response = _b.sent();
                        expect(response.status).toBe(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate numeric ranges', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, req, res, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: {
                                analysisId: 'analysis-123',
                                processingTime: 15000,
                                accuracyScore: 1.5, // Invalid: > 1.0
                                confidenceScore: 0.94
                            }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.POST(req)];
                    case 1:
                        response = _b.sent();
                        expect(response.status).toBe(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle database insertion errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, req, res, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockSupabase.from().insert.mockResolvedValue({
                            data: null,
                            error: new Error('Insertion failed')
                        });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: {
                                analysisId: 'analysis-123',
                                processingTime: 15000,
                                accuracyScore: 0.96,
                                confidenceScore: 0.94
                            }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.POST(req)];
                    case 1:
                        response = _b.sent();
                        expect(response.status).toBe(500);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should include performance thresholds in response', function () { return __awaiter(void 0, void 0, void 0, function () {
            var performanceData, _a, req, res, response, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        performanceData = {
                            analysisId: 'analysis-123',
                            processingTime: 15000,
                            accuracyScore: 0.96,
                            confidenceScore: 0.94
                        };
                        mockSupabase.from().insert.mockResolvedValue({
                            data: [__assign({ id: 'perf-123' }, performanceData)],
                            error: null
                        });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: performanceData
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.POST(req)];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        expect(data.meetsAccuracyTarget).toBe(true); // 0.96 > 0.85
                        expect(data.meetsProcessingTimeTarget).toBe(true); // 15000 < 30000
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle optional metadata', function () { return __awaiter(void 0, void 0, void 0, function () {
            var performanceData, _a, req, res, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        performanceData = {
                            analysisId: 'analysis-123',
                            processingTime: 15000,
                            accuracyScore: 0.96,
                            confidenceScore: 0.94,
                            metadata: {
                                customField: 'customValue',
                                nestedObject: {
                                    key: 'value'
                                }
                            }
                        };
                        mockSupabase.from().insert.mockResolvedValue({
                            data: [__assign({ id: 'perf-123' }, performanceData)],
                            error: null
                        });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: performanceData
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.POST(req)];
                    case 1:
                        response = _b.sent();
                        expect(response.status).toBe(201);
                        expect(mockSupabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
                            metadata: performanceData.metadata
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Performance Thresholds', function () {
        it('should correctly identify when targets are met', function () { return __awaiter(void 0, void 0, void 0, function () {
            var testCases, _i, testCases_1, testCase, _a, req, res, response, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        testCases = [
                            {
                                accuracy: 0.90,
                                time: 20000,
                                expectedAccuracy: true,
                                expectedTime: true
                            },
                            {
                                accuracy: 0.80,
                                time: 35000,
                                expectedAccuracy: false,
                                expectedTime: false
                            },
                            {
                                accuracy: 0.95,
                                time: 35000,
                                expectedAccuracy: true,
                                expectedTime: false
                            }
                        ];
                        _i = 0, testCases_1 = testCases;
                        _b.label = 1;
                    case 1:
                        if (!(_i < testCases_1.length)) return [3 /*break*/, 5];
                        testCase = testCases_1[_i];
                        mockSupabase.from().insert.mockResolvedValue({
                            data: [{ id: 'perf-test' }],
                            error: null
                        });
                        _a = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: {
                                analysisId: 'analysis-test',
                                processingTime: testCase.time,
                                accuracyScore: testCase.accuracy,
                                confidenceScore: 0.90
                            }
                        }), req = _a.req, res = _a.res;
                        return [4 /*yield*/, route_1.default.POST(req)];
                    case 2:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _b.sent();
                        expect(data.meetsAccuracyTarget).toBe(testCase.expectedAccuracy);
                        expect(data.meetsProcessingTimeTarget).toBe(testCase.expectedTime);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    });
});
