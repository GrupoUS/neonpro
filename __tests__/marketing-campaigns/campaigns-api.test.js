"use strict";
// =====================================================================================
// MARKETING CAMPAIGNS API TESTS - Story 7.2
// Integration tests for marketing campaigns API endpoints
// =====================================================================================
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
var server_1 = require("next/server");
var route_1 = require("@/app/api/campaigns/route");
// Mock Supabase client
var mockSupabaseClient = {
    from: jest.fn(function () { return ({
        select: jest.fn(function () { return ({
            eq: jest.fn(function () { return ({
                single: jest.fn(),
                data: null,
                error: null
            }); }),
            data: [],
            error: null
        }); }),
        insert: jest.fn(function () { return ({
            select: jest.fn(function () { return ({
                single: jest.fn(function () { return ({
                    data: null,
                    error: null
                }); })
            }); })
        }); }),
        update: jest.fn(function () { return ({
            eq: jest.fn(function () { return ({
                select: jest.fn(function () { return ({
                    single: jest.fn(function () { return ({
                        data: null,
                        error: null
                    }); })
                }); })
            }); })
        }); }),
        delete: jest.fn(function () { return ({
            eq: jest.fn(function () { return ({
                data: null,
                error: null
            }); })
        }); })
    }); }),
    auth: {
        getUser: jest.fn(function () { return ({
            data: { user: { id: 'test-user-id' } },
            error: null
        }); })
    }
};
jest.mock('@/app/utils/supabase/server', function () { return ({
    createClient: jest.fn(function () { return mockSupabaseClient; })
}); });
describe('/api/campaigns API Routes', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    describe('GET /api/campaigns', function () {
        it('should fetch all campaigns successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockCampaigns, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCampaigns = [
                            {
                                id: '1',
                                name: 'Welcome Series',
                                type: 'email',
                                status: 'active',
                                automation_rate: 0.92,
                                created_at: '2025-01-28T10:00:00Z'
                            },
                            {
                                id: '2',
                                name: 'Follow-up Campaign',
                                type: 'multi_channel',
                                status: 'active',
                                automation_rate: 0.87,
                                created_at: '2025-01-25T14:30:00Z'
                            }
                        ];
                        mockSupabaseClient.from().select().data = mockCampaigns;
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/campaigns'
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'GET'
                        });
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data.campaigns).toEqual(mockCampaigns);
                        expect(mockSupabaseClient.from).toHaveBeenCalledWith('marketing_campaigns');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.from().select().error = new Error('Database connection failed');
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/campaigns'
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'GET'
                        });
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(500);
                        expect(data.error).toBe('Failed to fetch campaigns');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should require authentication', function () { return __awaiter(void 0, void 0, void 0, function () {
            var req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
                            data: { user: null },
                            error: null
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/campaigns'
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'GET'
                        });
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(401);
                        expect(data.error).toBe('Unauthorized');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /api/campaigns', function () {
        var validCampaignData = {
            name: 'New Test Campaign',
            description: 'Test campaign description',
            type: 'email',
            target_segment: 'new_patients',
            automation_triggers: ['new_patient', 'appointment_booking'],
            personalization_enabled: true,
            ai_optimization: true,
            ab_testing_enabled: false,
            lgpd_compliance: true,
            schedule_type: 'trigger_based'
        };
        it('should create a new campaign successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockCreatedCampaign, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCreatedCampaign = __assign(__assign({ id: 'new-campaign-id' }, validCampaignData), { created_at: '2025-01-28T10:00:00Z', status: 'draft' });
                        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
                            data: mockCreatedCampaign,
                            error: null
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: validCampaignData
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(validCampaignData),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(201);
                        expect(data.campaign).toEqual(mockCreatedCampaign);
                        expect(mockSupabaseClient.from).toHaveBeenCalledWith('marketing_campaigns');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate required fields', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidData, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidData = {
                            description: 'Missing name field'
                        };
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: invalidData
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(invalidData),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(400);
                        expect(data.error).toContain('required');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate automation rate threshold', function () { return __awaiter(void 0, void 0, void 0, function () {
            var lowAutomationData, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lowAutomationData = __assign(__assign({}, validCampaignData), { personalization_enabled: false, ai_optimization: false, automation_triggers: [], schedule_type: 'immediate' });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: lowAutomationData
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(lowAutomationData),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(400);
                        expect(data.error).toContain('automation rate');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should enforce LGPD compliance', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonCompliantData, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonCompliantData = __assign(__assign({}, validCampaignData), { lgpd_compliance: false });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: nonCompliantData
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(nonCompliantData),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(400);
                        expect(data.error).toContain('LGPD compliance');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('PUT /api/campaigns', function () {
        var updateData = {
            id: 'existing-campaign-id',
            name: 'Updated Campaign Name',
            status: 'paused'
        };
        it('should update campaign successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockUpdatedCampaign, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUpdatedCampaign = __assign(__assign({}, updateData), { updated_at: '2025-01-28T10:00:00Z' });
                        mockSupabaseClient.from().update().eq().select().single.mockResolvedValueOnce({
                            data: mockUpdatedCampaign,
                            error: null
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'PUT',
                            url: '/api/campaigns',
                            body: updateData
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'PUT',
                            body: JSON.stringify(updateData),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.PUT)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data.campaign).toEqual(mockUpdatedCampaign);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should require campaign ID for updates', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidUpdateData, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidUpdateData = {
                            name: 'Updated Name'
                            // Missing ID
                        };
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'PUT',
                            url: '/api/campaigns',
                            body: invalidUpdateData
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'PUT',
                            body: JSON.stringify(invalidUpdateData),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.PUT)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(400);
                        expect(data.error).toContain('Campaign ID');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('DELETE /api/campaigns', function () {
        it('should delete campaign successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.from().delete().eq.mockResolvedValueOnce({
                            data: null,
                            error: null
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'DELETE',
                            url: '/api/campaigns?id=campaign-to-delete'
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'DELETE'
                        });
                        return [4 /*yield*/, (0, route_1.DELETE)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data.message).toBe('Campaign deleted successfully');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should require campaign ID for deletion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'DELETE',
                            url: '/api/campaigns'
                            // Missing ID parameter
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'DELETE'
                        });
                        return [4 /*yield*/, (0, route_1.DELETE)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(400);
                        expect(data.error).toContain('Campaign ID');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle non-existent campaign deletion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabaseClient.from().delete().eq.mockResolvedValueOnce({
                            data: null,
                            error: new Error('Campaign not found')
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'DELETE',
                            url: '/api/campaigns?id=non-existent-id'
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'DELETE'
                        });
                        return [4 /*yield*/, (0, route_1.DELETE)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(404);
                        expect(data.error).toContain('not found');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Campaign Automation Features', function () {
        it('should calculate automation rate correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var campaignWithHighAutomation, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        campaignWithHighAutomation = {
                            name: 'High Automation Campaign',
                            type: 'email',
                            target_segment: 'all_patients',
                            automation_triggers: ['new_patient', 'appointment_booking', 'treatment_completion'],
                            personalization_enabled: true,
                            ai_optimization: true,
                            ab_testing_enabled: true,
                            lgpd_compliance: true,
                            schedule_type: 'trigger_based'
                        };
                        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
                            data: __assign(__assign({}, campaignWithHighAutomation), { automation_rate: 0.95 }),
                            error: null
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: campaignWithHighAutomation
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(campaignWithHighAutomation),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(201);
                        expect(data.campaign.automation_rate).toBeGreaterThanOrEqual(0.8);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should support multi-channel campaigns', function () { return __awaiter(void 0, void 0, void 0, function () {
            var multiChannelCampaign, req, request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multiChannelCampaign = {
                            name: 'Multi-Channel Campaign',
                            type: 'multi_channel',
                            target_segment: 'active_patients',
                            automation_triggers: ['treatment_reminder'],
                            personalization_enabled: true,
                            ai_optimization: true,
                            lgpd_compliance: true,
                            schedule_type: 'trigger_based',
                            channels: ['email', 'whatsapp', 'sms']
                        };
                        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
                            data: multiChannelCampaign,
                            error: null
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: multiChannelCampaign
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(multiChannelCampaign),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(201);
                        expect(mockSupabaseClient.from).toHaveBeenCalledWith('marketing_campaigns');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('A/B Testing Integration', function () {
        it('should handle A/B testing enabled campaigns', function () { return __awaiter(void 0, void 0, void 0, function () {
            var abTestCampaign, req, request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abTestCampaign = {
                            name: 'A/B Test Campaign',
                            type: 'email',
                            target_segment: 'new_patients',
                            automation_triggers: ['new_patient'],
                            personalization_enabled: true,
                            ai_optimization: true,
                            ab_testing_enabled: true,
                            ab_test_variants: [
                                { name: 'Variant A', subject_line: 'Welcome to NeonPro' },
                                { name: 'Variant B', subject_line: 'Your Beauty Journey Starts Here' }
                            ],
                            lgpd_compliance: true,
                            schedule_type: 'trigger_based'
                        };
                        mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
                            data: abTestCampaign,
                            error: null
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: abTestCampaign
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(abTestCampaign),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(201);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Analytics and Metrics', function () {
        it('should track campaign performance metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var campaignWithMetrics, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        campaignWithMetrics = {
                            id: 'campaign-with-metrics',
                            name: 'Test Campaign',
                            metrics: {
                                sent: 1000,
                                delivered: 950,
                                opened: 665,
                                clicked: 133,
                                converted: 40,
                                revenue: 2400,
                                cost: 300
                            }
                        };
                        mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
                            data: campaignWithMetrics,
                            error: null
                        });
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'GET',
                            url: '/api/campaigns?id=campaign-with-metrics'
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'GET'
                        });
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data.campaign.metrics).toBeDefined();
                        expect(data.campaign.metrics.sent).toBe(1000);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Story 7.2 Acceptance Criteria Validation', function () {
        it('should enforce ≥80% automation rate requirement', function () { return __awaiter(void 0, void 0, void 0, function () {
            var lowAutomationCampaign, req, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lowAutomationCampaign = {
                            name: 'Low Automation Campaign',
                            type: 'email',
                            target_segment: 'all_patients',
                            automation_triggers: [],
                            personalization_enabled: false,
                            ai_optimization: false,
                            ab_testing_enabled: false,
                            lgpd_compliance: true,
                            schedule_type: 'immediate'
                        };
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: lowAutomationCampaign
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(lowAutomationCampaign),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(400);
                        expect(data.error).toContain('80%');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should require LGPD compliance for all campaigns', function () { return __awaiter(void 0, void 0, void 0, function () {
            var nonCompliantCampaign, req, request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nonCompliantCampaign = {
                            name: 'Non-Compliant Campaign',
                            type: 'email',
                            target_segment: 'all_patients',
                            automation_triggers: ['new_patient'],
                            personalization_enabled: true,
                            ai_optimization: true,
                            ab_testing_enabled: false,
                            lgpd_compliance: false,
                            schedule_type: 'trigger_based'
                        };
                        req = (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            url: '/api/campaigns',
                            body: nonCompliantCampaign
                        }).req;
                        request = new server_1.NextRequest(req.url, {
                            method: 'POST',
                            body: JSON.stringify(nonCompliantCampaign),
                            headers: { 'Content-Type': 'application/json' }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(400);
                        expect(data.error).toContain('LGPD');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
