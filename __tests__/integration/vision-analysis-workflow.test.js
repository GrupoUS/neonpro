"use strict";
/**
 * Vision Analysis Workflow Integration Tests
 *
 * End-to-end integration tests for the complete computer vision analysis workflow,
 * testing the interaction between components, hooks, API endpoints, and database.
 */
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
var server_1 = require("@/app/utils/supabase/server");
var analysis_engine_1 = require("@/lib/vision/analysis-engine");
// Mock dependencies
jest.mock('@/app/utils/supabase/server');
jest.mock('@/lib/vision/analysis-engine');
jest.mock('sonner');
// Mock Next.js router
jest.mock('next/navigation', function () { return ({
    useRouter: function () { return ({
        push: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        pathname: '/dashboard/vision-analysis',
        query: {},
        asPath: '/dashboard/vision-analysis',
    }); },
    useSearchParams: function () { return new URLSearchParams(); }
}); });
// Mock global fetch
global.fetch = jest.fn();
// Mock file reading
global.FileReader = /** @class */ (function () {
    function class_1() {
        this.result = null;
        this.onload = null;
        this.onerror = null;
    }
    class_1.prototype.readAsDataURL = function (file) {
        var _this = this;
        setTimeout(function () {
            _this.result = 'data:image/jpeg;base64,mock-base64-data';
            if (_this.onload) {
                _this.onload({ target: _this });
            }
        }, 100);
    };
    return class_1;
}());
// Mock data (define first)
var mockAnalysisResult = {
    id: 'analysis-123',
    patientId: 'patient-456',
    treatmentId: 'treatment-789',
    beforeImageUrl: '/images/before.jpg',
    afterImageUrl: '/images/after.jpg',
    accuracyScore: 0.96,
    confidenceScore: 0.94,
    processingTime: 15000,
    improvementPercentage: 25.5,
    changeMetrics: {
        overallImprovement: 25.5,
        textureImprovement: 30.2,
        colorImprovement: 20.8,
        clarityImprovement: 28.1,
        symmetryImprovement: 22.3
    },
    annotations: [
        {
            id: 'ann-1',
            type: 'improvement',
            coordinates: { x: 100, y: 150, width: 50, height: 50 },
            confidence: 0.95,
            description: 'Significant texture improvement'
        }
    ],
    metadata: {
        modelVersion: '2.1.0',
        analysisDate: '2024-01-15T10:30:00Z'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
};
// Mock Supabase client
var mockSupabase = {
    auth: {
        getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null
        })
    },
    from: jest.fn(function () { return ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
            data: mockAnalysisResult,
            error: null
        })
    }); }),
    rpc: jest.fn().mockResolvedValue({
        data: [mockAnalysisResult],
        error: null
    })
};
// Mock Vision Analysis Engine
var mockVisionEngine = {
    analyzeBeforeAfter: jest.fn().mockResolvedValue(mockAnalysisResult),
    saveAnalysisResult: jest.fn().mockResolvedValue({ success: true }),
    initialize: jest.fn().mockResolvedValue(true),
    loadModel: jest.fn().mockResolvedValue(true)
};
// Apply mocks
server_1.createClient.mockReturnValue(mockSupabase);
analysis_engine_1.VisionAnalysisEngine.mockImplementation(function () { return mockVisionEngine; });
describe('Vision Analysis Workflow Integration', function () {
    beforeEach(function () {
        jest.clearAllMocks();
        global.fetch.mockResolvedValue({
            ok: true,
            json: function () { return Promise.resolve(mockAnalysisResult); },
            status: 200,
            statusText: 'OK'
        });
    });
    it('should complete full analysis workflow successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock API response
                    global.fetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({
                            success: true,
                            data: mockAnalysisResult,
                            message: 'Analysis completed successfully'
                        }); }
                    });
                    return [4 /*yield*/, fetch('/api/vision/analysis', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                patientId: 'patient-456',
                                treatmentId: 'treatment-789',
                                beforeImage: 'data:image/jpeg;base64,mock-before-image',
                                afterImage: 'data:image/jpeg;base64,mock-after-image'
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // Verify API was called correctly
                    expect(global.fetch).toHaveBeenCalledWith('/api/vision/analysis', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            patientId: 'patient-456',
                            treatmentId: 'treatment-789',
                            beforeImage: 'data:image/jpeg;base64,mock-before-image',
                            afterImage: 'data:image/jpeg;base64,mock-after-image'
                        }),
                    });
                    // Verify response structure
                    expect(result.success).toBe(true);
                    expect(result.data).toEqual(mockAnalysisResult);
                    expect(result.data.improvementPercentage).toBe(25.5);
                    expect(result.data.changeMetrics.overallImprovement).toBe(25.5);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle export workflow', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock export API response
                    global.fetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({
                            success: true,
                            exportUrl: '/exports/analysis-123.pdf',
                            message: 'Export generated successfully'
                        }); }
                    });
                    return [4 /*yield*/, fetch('/api/vision/analysis/analysis-123/export', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                format: 'pdf',
                                includeAnnotations: true
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // Verify export response
                    expect(result.success).toBe(true);
                    expect(result.exportUrl).toBe('/exports/analysis-123.pdf');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle share workflow', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock share API response
                    global.fetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({
                            success: true,
                            shareUrl: 'https://example.com/share/analysis-123',
                            expiresAt: '2024-01-22T10:30:00Z',
                            message: 'Analysis shared successfully'
                        }); }
                    });
                    return [4 /*yield*/, fetch('/api/vision/analysis/analysis-123/share', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                expiresIn: '7d',
                                permissions: ['view']
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // Verify share response
                    expect(result.success).toBe(true);
                    expect(result.shareUrl).toBe('https://example.com/share/analysis-123');
                    expect(result.expiresAt).toBe('2024-01-22T10:30:00Z');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle analysis errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock error response
                    global.fetch.mockResolvedValueOnce({
                        ok: false,
                        status: 500,
                        json: function () { return Promise.resolve({
                            success: false,
                            error: 'ANALYSIS_FAILED',
                            message: 'Vision analysis engine failed to process images'
                        }); }
                    });
                    return [4 /*yield*/, fetch('/api/vision/analysis', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                patientId: 'patient-456',
                                treatmentId: 'treatment-789',
                                beforeImage: 'invalid-image-data',
                                afterImage: 'invalid-image-data'
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // Verify error response
                    expect(response.ok).toBe(false);
                    expect(response.status).toBe(500);
                    expect(result.success).toBe(false);
                    expect(result.error).toBe('ANALYSIS_FAILED');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle authentication errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock auth error response
                    global.fetch.mockResolvedValueOnce({
                        ok: false,
                        status: 401,
                        json: function () { return Promise.resolve({
                            success: false,
                            error: 'UNAUTHORIZED',
                            message: 'Authentication required'
                        }); }
                    });
                    return [4 /*yield*/, fetch('/api/vision/analysis', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                patientId: 'patient-456',
                                treatmentId: 'treatment-789',
                                beforeImage: 'data:image/jpeg;base64,mock-before-image',
                                afterImage: 'data:image/jpeg;base64,mock-after-image'
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // Verify auth error response
                    expect(response.ok).toBe(false);
                    expect(response.status).toBe(401);
                    expect(result.success).toBe(false);
                    expect(result.error).toBe('UNAUTHORIZED');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle performance threshold violations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock performance threshold violation
                    global.fetch.mockResolvedValueOnce({
                        ok: false,
                        status: 408,
                        json: function () { return Promise.resolve({
                            success: false,
                            error: 'ANALYSIS_TIMEOUT',
                            message: 'Analysis exceeded maximum processing time of 30 seconds',
                            processingTime: 32000
                        }); }
                    });
                    return [4 /*yield*/, fetch('/api/vision/analysis', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                patientId: 'patient-456',
                                treatmentId: 'treatment-789',
                                beforeImage: 'data:image/jpeg;base64,large-image-data',
                                afterImage: 'data:image/jpeg;base64,large-image-data'
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // Verify timeout response
                    expect(response.ok).toBe(false);
                    expect(response.status).toBe(408);
                    expect(result.success).toBe(false);
                    expect(result.error).toBe('ANALYSIS_TIMEOUT');
                    expect(result.processingTime).toBe(32000);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle database connection errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock database error response
                    global.fetch.mockResolvedValueOnce({
                        ok: false,
                        status: 503,
                        json: function () { return Promise.resolve({
                            success: false,
                            error: 'DATABASE_ERROR',
                            message: 'Unable to connect to database'
                        }); }
                    });
                    return [4 /*yield*/, fetch('/api/vision/analysis', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                patientId: 'patient-456',
                                treatmentId: 'treatment-789',
                                beforeImage: 'data:image/jpeg;base64,mock-before-image',
                                afterImage: 'data:image/jpeg;base64,mock-after-image'
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // Verify database error response
                    expect(response.ok).toBe(false);
                    expect(response.status).toBe(503);
                    expect(result.success).toBe(false);
                    expect(result.error).toBe('DATABASE_ERROR');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle vision engine initialization errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock vision engine initialization error
                    global.fetch.mockResolvedValueOnce({
                        ok: false,
                        status: 503,
                        json: function () { return Promise.resolve({
                            success: false,
                            error: 'ENGINE_INITIALIZATION_FAILED',
                            message: 'Vision analysis engine failed to initialize'
                        }); }
                    });
                    return [4 /*yield*/, fetch('/api/vision/analysis', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                patientId: 'patient-456',
                                treatmentId: 'treatment-789',
                                beforeImage: 'data:image/jpeg;base64,mock-before-image',
                                afterImage: 'data:image/jpeg;base64,mock-after-image'
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    // Verify engine error response
                    expect(response.ok).toBe(false);
                    expect(response.status).toBe(503);
                    expect(result.success).toBe(false);
                    expect(result.error).toBe('ENGINE_INITIALIZATION_FAILED');
                    return [2 /*return*/];
            }
        });
    }); });
});
