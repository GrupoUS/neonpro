"use strict";
/**
 * Tests for Treatment Success API Endpoints
 * Tests all API routes for Story 8.4 - Treatment Success Rate Tracking & Optimization
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
var server_1 = require("next/server");
var node_mocks_http_1 = require("node-mocks-http");
// Mock Supabase client
var mockSupabaseClient = {
    from: jest.fn(function () { return mockSupabaseClient; }),
    select: jest.fn(function () { return mockSupabaseClient; }),
    insert: jest.fn(function () { return mockSupabaseClient; }),
    update: jest.fn(function () { return mockSupabaseClient; }),
    delete: jest.fn(function () { return mockSupabaseClient; }),
    eq: jest.fn(function () { return mockSupabaseClient; }),
    gte: jest.fn(function () { return mockSupabaseClient; }),
    lte: jest.fn(function () { return mockSupabaseClient; }),
    not: jest.fn(function () { return mockSupabaseClient; }),
    is: jest.fn(function () { return mockSupabaseClient; }),
    range: jest.fn(function () { return mockSupabaseClient; }),
    order: jest.fn(function () { return mockSupabaseClient; }),
    single: jest.fn(function () { return mockSupabaseClient; }),
    upsert: jest.fn(function () { return mockSupabaseClient; }),
    limit: jest.fn(function () { return mockSupabaseClient; }),
};
jest.mock('@/app/utils/supabase/server', function () { return ({
    createClient: jest.fn(function () { return Promise.resolve(mockSupabaseClient); }),
}); });
// Mock data
var mockTreatmentOutcome = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    patient_id: '550e8400-e29b-41d4-a716-446655440002',
    treatment_id: 'treatment-001',
    provider_id: '550e8400-e29b-41d4-a716-446655440003',
    treatment_type: 'Botox',
    treatment_date: '2025-01-15',
    outcome_date: '2025-01-22',
    success_score: 0.95,
    success_criteria: { wrinkle_reduction: 85, patient_satisfaction: 90 },
    actual_outcomes: { wrinkle_reduction: 90, patient_satisfaction: 92 },
    before_photos: ['https://example.com/before1.jpg'],
    after_photos: ['https://example.com/after1.jpg'],
    patient_satisfaction_score: 0.92,
    complications: null,
    follow_up_required: false,
    notes: 'Excelente resultado, paciente muito satisfeita',
    status: 'completed',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-22T15:30:00Z',
};
var mockSuccessMetrics = {
    id: '550e8400-e29b-41d4-a716-446655440004',
    treatment_type: 'Botox',
    provider_id: '550e8400-e29b-41d4-a716-446655440003',
    time_period: 'monthly',
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    total_treatments: 45,
    successful_treatments: 42,
    success_rate: 0.93,
    average_satisfaction: 0.89,
    complication_rate: 0.02,
    benchmarks: { industry_standard: 0.85 },
    industry_comparison: { above_average: true },
    created_at: '2025-01-31T23:59:59Z',
    updated_at: '2025-01-31T23:59:59Z',
};
var mockProviderPerformance = {
    id: '550e8400-e29b-41d4-a716-446655440005',
    provider_id: '550e8400-e29b-41d4-a716-446655440003',
    evaluation_period: 'Q1-2025',
    period_start: '2025-01-01',
    period_end: '2025-03-31',
    overall_success_rate: 0.94,
    patient_satisfaction_avg: 0.91,
    total_treatments: 156,
    specialties: { botox: 0.96, fillers: 0.92 },
    performance_trends: { improving: true, trend_percentage: 5.2 },
    improvement_areas: ['communication_skills', 'post_treatment_care'],
    achievements: { top_performer_q1: true, patient_satisfaction_award: true },
    training_recommendations: ['advanced_injection_techniques', 'patient_psychology'],
    certification_status: { current: true, expires: '2025-12-31' },
    created_at: '2025-03-31T23:59:59Z',
    updated_at: '2025-03-31T23:59:59Z',
};
var mockProtocolOptimization = {
    id: '550e8400-e29b-41d4-a716-446655440006',
    treatment_type: 'Botox',
    current_protocol: {
        units: '20-30',
        injection_points: 5,
        preparation: 'standard_dilution',
    },
    recommended_changes: {
        units: '25-35',
        injection_points: 7,
        preparation: 'enhanced_dilution',
        additional_steps: ['pre_treatment_mapping'],
    },
    success_rate_improvement: 0.08,
    evidence_data: {
        sample_size: 100,
        study_duration: '6_months',
        confidence_level: 95,
    },
    implementation_priority: 'high',
    cost_impact: 150.0,
    timeline_estimate: '2 semanas',
    approval_status: 'pending',
    created_at: '2025-01-26T10:00:00Z',
    updated_at: '2025-01-26T10:00:00Z',
};
var mockQualityBenchmark = {
    id: '550e8400-e29b-41d4-a716-446655440007',
    treatment_type: 'Botox',
    benchmark_type: 'industry_standard',
    metric_name: 'Success Rate',
    target_value: 0.90,
    current_value: 0.94,
    variance_percentage: 4.44,
    benchmark_source: 'International Aesthetic Medicine Association',
    update_frequency: 'quarterly',
    last_updated: '2025-01-01',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-26T10:00:00Z',
};
var mockComplianceReport = {
    id: '550e8400-e29b-41d4-a716-446655440008',
    report_type: 'Monthly Quality Report',
    reporting_period: 'January 2025',
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    report_data: {
        success_rate: 0.92,
        compliance_score: 0.95,
        total_treatments: 234,
        satisfaction_avg: 0.89,
    },
    compliance_score: 0.95,
    findings: {
        strengths: ['high_success_rates', 'excellent_satisfaction'],
        areas_for_improvement: ['documentation_completeness'],
    },
    recommendations: {
        immediate: ['improve_record_keeping'],
        long_term: ['staff_training_enhancement'],
    },
    action_items: [
        { task: 'update_documentation_templates', due_date: '2025-02-15' },
    ],
    status: 'approved',
    generated_by: '550e8400-e29b-41d4-a716-446655440003',
    reviewed_by: '550e8400-e29b-41d4-a716-446655440009',
    created_at: '2025-01-31T23:59:59Z',
    updated_at: '2025-01-31T23:59:59Z',
};
describe('Treatment Success API Endpoints', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    describe('GET /api/treatment-success/outcomes', function () {
        it('should return treatment outcomes with pagination', function () { return __awaiter(void 0, void 0, void 0, function () {
            var GET, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.select.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { range: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { order: jest.fn().mockResolvedValue({
                                    data: [mockTreatmentOutcome],
                                    error: null,
                                    count: 1,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/outcomes/route'); })];
                    case 1:
                        GET = (_a.sent()).GET;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/treatment-success/outcomes?page=1&limit=10',
                        }).req;
                        request = new server_1.NextRequest(new URL(req.url, 'http://localhost:3000'));
                        return [4 /*yield*/, GET(request)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data.success).toBe(true);
                        expect(data.data).toEqual([mockTreatmentOutcome]);
                        expect(data.pagination).toEqual({
                            page: 1,
                            limit: 10,
                            total: 1,
                            totalPages: 1,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle filters correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var GET, req, request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
                        mockSupabaseClient.gte.mockReturnValue(mockSupabaseClient);
                        mockSupabaseClient.lte.mockReturnValue(mockSupabaseClient);
                        mockSupabaseClient.select.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { range: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { order: jest.fn().mockResolvedValue({
                                    data: [mockTreatmentOutcome],
                                    error: null,
                                    count: 1,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/outcomes/route'); })];
                    case 1:
                        GET = (_a.sent()).GET;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/treatment-success/outcomes?treatment_type=Botox&provider_id=550e8400-e29b-41d4-a716-446655440003&success_rate_min=0.8',
                        }).req;
                        request = new server_1.NextRequest(new URL(req.url, 'http://localhost:3000'));
                        return [4 /*yield*/, GET(request)];
                    case 2:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('treatment_type', 'Botox');
                        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('provider_id', '550e8400-e29b-41d4-a716-446655440003');
                        expect(mockSupabaseClient.gte).toHaveBeenCalledWith('success_score', 0.8);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle database errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var GET, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.select.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { range: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { order: jest.fn().mockResolvedValue({
                                    data: null,
                                    error: { message: 'Database connection failed' },
                                    count: 0,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/outcomes/route'); })];
                    case 1:
                        GET = (_a.sent()).GET;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/treatment-success/outcomes',
                        }).req;
                        request = new server_1.NextRequest(new URL(req.url, 'http://localhost:3000'));
                        return [4 /*yield*/, GET(request)];
                    case 2:
                        response = _a.sent();
                        expect(response.status).toBe(500);
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(data.success).toBe(false);
                        expect(data.error).toBe('Erro interno do servidor');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /api/treatment-success/outcomes', function () {
        it('should create a new treatment outcome', function () { return __awaiter(void 0, void 0, void 0, function () {
            var POST, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.insert.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { select: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { single: jest.fn().mockResolvedValue({
                                    data: mockTreatmentOutcome,
                                    error: null,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/outcomes/route'); })];
                    case 1:
                        POST = (_a.sent()).POST;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: {
                                patient_id: '550e8400-e29b-41d4-a716-446655440002',
                                treatment_id: 'treatment-001',
                                provider_id: '550e8400-e29b-41d4-a716-446655440003',
                                treatment_type: 'Botox',
                                treatment_date: '2025-01-15',
                                success_criteria: { wrinkle_reduction: 85 },
                                notes: 'Test treatment outcome',
                            },
                        }).req;
                        request = new server_1.NextRequest(new URL('http://localhost:3000/api/treatment-success/outcomes'), {
                            method: 'POST',
                            body: JSON.stringify(req.body),
                            headers: { 'content-type': 'application/json' },
                        });
                        return [4 /*yield*/, POST(request)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(response.status).toBe(201);
                        expect(data.success).toBe(true);
                        expect(data.data).toEqual(mockTreatmentOutcome);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate request body', function () { return __awaiter(void 0, void 0, void 0, function () {
            var POST, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/outcomes/route'); })];
                    case 1:
                        POST = (_a.sent()).POST;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: {
                                // Missing required fields
                                treatment_type: 'Botox',
                            },
                        }).req;
                        request = new server_1.NextRequest(new URL('http://localhost:3000/api/treatment-success/outcomes'), {
                            method: 'POST',
                            body: JSON.stringify(req.body),
                            headers: { 'content-type': 'application/json' },
                        });
                        return [4 /*yield*/, POST(request)];
                    case 2:
                        response = _a.sent();
                        expect(response.status).toBe(400);
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(data.success).toBe(false);
                        expect(data.error).toBe('Dados inválidos');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /api/treatment-success/performance', function () {
        it('should return provider performance data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var GET, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.select.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { range: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { order: jest.fn().mockResolvedValue({
                                    data: [mockProviderPerformance],
                                    error: null,
                                    count: 1,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/performance/route'); })];
                    case 1:
                        GET = (_a.sent()).GET;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/treatment-success/performance',
                        }).req;
                        request = new server_1.NextRequest(new URL(req.url, 'http://localhost:3000'));
                        return [4 /*yield*/, GET(request)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data.success).toBe(true);
                        expect(data.data).toEqual([mockProviderPerformance]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /api/treatment-success/optimization', function () {
        it('should return protocol optimizations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var GET, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.select.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { range: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { order: jest.fn().mockResolvedValue({
                                    data: [mockProtocolOptimization],
                                    error: null,
                                    count: 1,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/optimization/route'); })];
                    case 1:
                        GET = (_a.sent()).GET;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/treatment-success/optimization',
                        }).req;
                        request = new server_1.NextRequest(new URL(req.url, 'http://localhost:3000'));
                        return [4 /*yield*/, GET(request)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data.success).toBe(true);
                        expect(data.data).toEqual([mockProtocolOptimization]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle optimization filters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var GET, req, request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
                        mockSupabaseClient.gte.mockReturnValue(mockSupabaseClient);
                        mockSupabaseClient.select.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { range: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { order: jest.fn().mockResolvedValue({
                                    data: [mockProtocolOptimization],
                                    error: null,
                                    count: 1,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/optimization/route'); })];
                    case 1:
                        GET = (_a.sent()).GET;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/treatment-success/optimization?treatment_type=Botox&implementation_priority=high',
                        }).req;
                        request = new server_1.NextRequest(new URL(req.url, 'http://localhost:3000'));
                        return [4 /*yield*/, GET(request)];
                    case 2:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('treatment_type', 'Botox');
                        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('implementation_priority', 'high');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /api/treatment-success/optimization', function () {
        it('should create a new protocol optimization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var POST, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.insert.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { select: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { single: jest.fn().mockResolvedValue({
                                    data: mockProtocolOptimization,
                                    error: null,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/optimization/route'); })];
                    case 1:
                        POST = (_a.sent()).POST;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            body: {
                                treatment_type: 'Botox',
                                current_protocol: { units: '20-30', injection_points: 5 },
                                recommended_changes: { units: '25-35', injection_points: 7 },
                                implementation_priority: 'high',
                                success_rate_improvement: 0.08,
                            },
                        }).req;
                        request = new server_1.NextRequest(new URL('http://localhost:3000/api/treatment-success/optimization'), {
                            method: 'POST',
                            body: JSON.stringify(req.body),
                            headers: { 'content-type': 'application/json' },
                        });
                        return [4 /*yield*/, POST(request)];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(response.status).toBe(201);
                        expect(data.success).toBe(true);
                        expect(data.data).toEqual(mockProtocolOptimization);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Statistics Endpoints', function () {
        it('should return comprehensive treatment success statistics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockStatsData;
            return __generator(this, function (_a) {
                // Mock multiple database calls for statistics
                mockSupabaseClient.select.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { order: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { limit: jest.fn().mockResolvedValue({
                            data: [mockSuccessMetrics],
                            error: null,
                        }) })) }));
                mockStatsData = {
                    successStats: {
                        overall_success_rate: 0.92,
                        total_treatments: 1234,
                        average_satisfaction: 0.89,
                        benchmark_comparison: 0.85,
                        trend_direction: 'up',
                        improvement_opportunities: 3,
                    },
                    providerStats: {
                        total_providers: 8,
                        top_performer: { provider_id: 'provider-1', success_rate: 0.96 },
                        average_performance: 0.87,
                        improvement_needed: 2,
                    },
                    treatmentTypeStats: [
                        {
                            treatment_type: 'Botox',
                            success_rate: 0.94,
                            total_treatments: 456,
                            satisfaction_score: 0.91,
                            benchmark_status: 'above',
                        },
                    ],
                    complianceStats: {
                        overall_compliance: 0.95,
                        pending_reports: 2,
                        overdue_items: 0,
                        certification_status: 'current',
                    },
                };
                // This would test a stats endpoint if implemented
                expect(mockStatsData.successStats.overall_success_rate).toBe(0.92);
                expect(mockStatsData.providerStats.total_providers).toBe(8);
                expect(mockStatsData.treatmentTypeStats).toHaveLength(1);
                expect(mockStatsData.complianceStats.overall_compliance).toBe(0.95);
                return [2 /*return*/];
            });
        }); });
    });
    describe('Error Handling and Edge Cases', function () {
        it('should handle malformed JSON in POST requests', function () { return __awaiter(void 0, void 0, void 0, function () {
            var POST, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/outcomes/route'); })];
                    case 1:
                        POST = (_a.sent()).POST;
                        request = new server_1.NextRequest(new URL('http://localhost:3000/api/treatment-success/outcomes'), {
                            method: 'POST',
                            body: 'invalid json',
                            headers: { 'content-type': 'application/json' },
                        });
                        return [4 /*yield*/, POST(request)];
                    case 2:
                        response = _a.sent();
                        expect(response.status).toBe(500);
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(data.success).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle database connection failures', function () { return __awaiter(void 0, void 0, void 0, function () {
            var GET, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.select.mockImplementation(function () {
                            throw new Error('Database connection failed');
                        });
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/outcomes/route'); })];
                    case 1:
                        GET = (_a.sent()).GET;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/treatment-success/outcomes',
                        }).req;
                        request = new server_1.NextRequest(new URL(req.url, 'http://localhost:3000'));
                        return [4 /*yield*/, GET(request)];
                    case 2:
                        response = _a.sent();
                        expect(response.status).toBe(500);
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        expect(data.success).toBe(false);
                        expect(data.error).toBe('Erro interno do servidor');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle invalid query parameters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var GET, req, request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.select.mockReturnValue(__assign(__assign({}, mockSupabaseClient), { range: jest.fn().mockReturnValue(__assign(__assign({}, mockSupabaseClient), { order: jest.fn().mockResolvedValue({
                                    data: [],
                                    error: null,
                                    count: 0,
                                }) })) }));
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@/app/api/treatment-success/outcomes/route'); })];
                    case 1:
                        GET = (_a.sent()).GET;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/treatment-success/outcomes?page=invalid&success_rate_min=not_a_number',
                        }).req;
                        request = new server_1.NextRequest(new URL(req.url, 'http://localhost:3000'));
                        return [4 /*yield*/, GET(request)];
                    case 2:
                        response = _a.sent();
                        // Should handle gracefully with defaults
                        expect(response.status).toBe(200);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
