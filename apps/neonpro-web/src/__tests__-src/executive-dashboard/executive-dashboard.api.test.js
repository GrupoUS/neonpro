"use strict";
/**
 * Executive Dashboard API Integration Tests
 * Story 7.1: Executive Dashboard Implementation
 *
 * Tests for the API routes of the executive dashboard
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
var route_1 = require("../../../app/api/executive-dashboard/kpis/route");
var route_2 = require("../../../app/api/executive-dashboard/alerts/route");
var route_3 = require("../../../app/api/executive-dashboard/widgets/route");
var route_4 = require("../../../app/api/executive-dashboard/reports/route");
var route_5 = require("../../../app/api/executive-dashboard/comparison/route");
// Mock the services
jest.mock('../../../lib/services/executive-dashboard');
jest.mock('../../../app/utils/supabase/server');
var mockExecutiveDashboardService = {
    getKPIs: jest.fn(),
    getAlerts: jest.fn(),
    getWidgetConfiguration: jest.fn(),
    saveWidgetConfiguration: jest.fn(),
    getReports: jest.fn(),
    generateReport: jest.fn(),
    comparePerformance: jest.fn()
};
var mockAuth = {
    getUser: jest.fn(),
    getSession: jest.fn()
};
describe('Executive Dashboard API Routes', function () {
    beforeEach(function () {
        jest.clearAllMocks();
        // Mock successful authentication
        mockAuth.getUser.mockResolvedValue({
            data: { user: { id: 'user-1' } },
            error: null
        });
        mockAuth.getSession.mockResolvedValue({
            data: { session: { user: { id: 'user-1' } } },
            error: null
        });
        require('../../../app/utils/supabase/server').createClient.mockResolvedValue({
            auth: mockAuth
        });
        require('../../../lib/services/executive-dashboard').ExecutiveDashboardService.mockImplementation(function () { return mockExecutiveDashboardService; });
    });
    describe('/api/executive-dashboard/kpis', function () {
        it('should return KPIs for valid request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockKPIs, request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockKPIs = [
                            {
                                id: '1',
                                kpi_name: 'total_revenue',
                                kpi_value: 85000,
                                unit: 'BRL'
                            }
                        ];
                        mockExecutiveDashboardService.getKPIs.mockResolvedValue({
                            success: true,
                            data: mockKPIs
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/kpis?clinic_id=clinic-1&period_type=monthly&period_start=2024-01-01&period_end=2024-01-31');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(200);
                        expect(responseData.success).toBe(true);
                        expect(responseData.data).toEqual(mockKPIs);
                        expect(mockExecutiveDashboardService.getKPIs).toHaveBeenCalledWith('clinic-1', 'monthly', '2024-01-01', '2024-01-31');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 400 for missing parameters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/kpis');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(400);
                        expect(responseData.success).toBe(false);
                        expect(responseData.error).toContain('Missing required parameters');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 401 for unauthorized request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockAuth.getUser.mockResolvedValue({
                            data: { user: null },
                            error: null
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/kpis?clinic_id=clinic-1&period_type=monthly&period_start=2024-01-01&period_end=2024-01-31');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(401);
                        expect(responseData.success).toBe(false);
                        expect(responseData.error).toBe('Unauthorized');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('/api/executive-dashboard/alerts', function () {
        it('should return alerts for valid request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockAlerts, request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockAlerts = [
                            {
                                id: '1',
                                alert_type: 'revenue_drop',
                                severity: 'high',
                                title: 'Revenue Alert',
                                is_active: true
                            }
                        ];
                        mockExecutiveDashboardService.getAlerts.mockResolvedValue({
                            success: true,
                            data: mockAlerts
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/alerts?clinic_id=clinic-1');
                        return [4 /*yield*/, (0, route_2.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(200);
                        expect(responseData.success).toBe(true);
                        expect(responseData.data).toEqual(mockAlerts);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('/api/executive-dashboard/widgets', function () {
        it('should get widget configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWidgets, request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWidgets = [
                            {
                                id: '1',
                                widget_type: 'revenue_chart',
                                position_x: 0,
                                position_y: 0,
                                configuration: { chart_type: 'line' }
                            }
                        ];
                        mockExecutiveDashboardService.getWidgetConfiguration.mockResolvedValue({
                            success: true,
                            data: mockWidgets
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/widgets?clinic_id=clinic-1&user_id=user-1');
                        return [4 /*yield*/, (0, route_3.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(200);
                        expect(responseData.success).toBe(true);
                        expect(responseData.data).toEqual(mockWidgets);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should save widget configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var widgetData, request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        widgetData = {
                            clinic_id: 'clinic-1',
                            user_id: 'user-1',
                            widget_type: 'revenue_chart',
                            position_x: 0,
                            position_y: 0,
                            width: 6,
                            height: 4,
                            configuration: { chart_type: 'line' }
                        };
                        mockExecutiveDashboardService.saveWidgetConfiguration.mockResolvedValue({
                            success: true,
                            data: __assign(__assign({}, widgetData), { id: '1' })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/widgets', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(widgetData)
                        });
                        return [4 /*yield*/, (0, route_3.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(200);
                        expect(responseData.success).toBe(true);
                        expect(mockExecutiveDashboardService.saveWidgetConfiguration).toHaveBeenCalledWith(widgetData);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('/api/executive-dashboard/reports', function () {
        it('should get reports list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockReports, request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockReports = [
                            {
                                id: '1',
                                report_name: 'Executive Summary',
                                report_type: 'executive_summary',
                                status: 'completed',
                                created_at: '2024-01-01T00:00:00Z'
                            }
                        ];
                        mockExecutiveDashboardService.getReports.mockResolvedValue({
                            success: true,
                            data: mockReports
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/reports?clinic_id=clinic-1');
                        return [4 /*yield*/, (0, route_4.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(200);
                        expect(responseData.success).toBe(true);
                        expect(responseData.data).toEqual(mockReports);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should generate new report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportData, request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reportData = {
                            clinic_id: 'clinic-1',
                            report_name: 'Monthly Report',
                            report_type: 'executive_summary',
                            period_type: 'monthly',
                            period_start: '2024-01-01',
                            period_end: '2024-01-31',
                            format: 'pdf',
                            requested_by: 'user-1'
                        };
                        mockExecutiveDashboardService.generateReport.mockResolvedValue({
                            success: true,
                            data: __assign(__assign({}, reportData), { id: '1', status: 'generating' })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/reports', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(reportData)
                        });
                        return [4 /*yield*/, (0, route_4.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(200);
                        expect(responseData.success).toBe(true);
                        expect(mockExecutiveDashboardService.generateReport).toHaveBeenCalledWith(reportData);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('/api/executive-dashboard/comparison', function () {
        it('should return performance comparison', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockComparison, request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockComparison = {
                            total_revenue: {
                                current: 100000,
                                previous: 85000,
                                change: 15000,
                                changePercent: 17.65
                            }
                        };
                        mockExecutiveDashboardService.comparePerformance.mockResolvedValue({
                            success: true,
                            data: mockComparison
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/comparison?clinic_id=clinic-1&period_type=monthly&current_start=2024-02-01&current_end=2024-02-29&previous_start=2024-01-01&previous_end=2024-01-31');
                        return [4 /*yield*/, (0, route_5.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(200);
                        expect(responseData.success).toBe(true);
                        expect(responseData.data).toEqual(mockComparison);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 400 for missing comparison parameters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost:3000/api/executive-dashboard/comparison?clinic_id=clinic-1');
                        return [4 /*yield*/, (0, route_5.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseData = _a.sent();
                        expect(response.status).toBe(400);
                        expect(responseData.success).toBe(false);
                        expect(responseData.error).toContain('Missing required parameters');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
