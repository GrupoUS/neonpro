"use strict";
/**
 * Executive Dashboard Service Tests
 * Story 7.1: Executive Dashboard Implementation
 *
 * Tests for the backend service layer of the executive dashboard
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
var test_helpers_1 = require("../../utils/test-helpers");
var executive_dashboard_1 = require("../../lib/services/executive-dashboard");
// Mock the Supabase client
jest.mock('../../app/utils/supabase/server', function () { return ({
    createClient: jest.fn()
}); });
var mockSupabase = (0, test_helpers_1.createMockSupabaseClient)();
describe('ExecutiveDashboardService', function () {
    var service;
    beforeEach(function () {
        service = new executive_dashboard_1.ExecutiveDashboardService();
        jest.clearAllMocks();
        require('../../app/utils/supabase/server').createClient.mockResolvedValue(mockSupabase);
    });
    describe('getKPIs', function () {
        it('should fetch KPIs for a clinic and period', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockKPIs, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockKPIs = [
                            {
                                id: '1',
                                clinic_id: 'clinic-1',
                                kpi_name: 'total_revenue',
                                kpi_value: 85000,
                                unit: 'BRL',
                                period_type: 'monthly',
                                period_start: '2024-01-01',
                                period_end: '2024-01-31',
                                created_at: '2024-01-01T00:00:00Z',
                                updated_at: '2024-01-01T00:00:00Z'
                            }
                        ];
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    eq: jest.fn().mockReturnValue({
                                        gte: jest.fn().mockReturnValue({
                                            lte: jest.fn().mockReturnValue({
                                                order: jest.fn().mockResolvedValue({
                                                    data: mockKPIs,
                                                    error: null
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, service.getKPIs('clinic-1', 'monthly', '2024-01-01', '2024-01-31')];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(true);
                        expect(result.data).toEqual(mockKPIs);
                        expect(mockSupabase.from).toHaveBeenCalledWith('executive_kpi_values');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle database errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    eq: jest.fn().mockReturnValue({
                                        gte: jest.fn().mockReturnValue({
                                            lte: jest.fn().mockReturnValue({
                                                order: jest.fn().mockResolvedValue({
                                                    data: null,
                                                    error: { message: 'Database error' }
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, service.getKPIs('clinic-1', 'monthly', '2024-01-01', '2024-01-31')];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(false);
                        expect(result.error).toBe('Database error');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getAlerts', function () {
        it('should fetch active alerts for a clinic', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockAlerts, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockAlerts = [
                            {
                                id: '1',
                                clinic_id: 'clinic-1',
                                alert_type: 'revenue_drop',
                                severity: 'high',
                                title: 'Revenue Alert',
                                message: 'Revenue is below threshold',
                                is_active: true,
                                created_at: '2024-01-01T00:00:00Z'
                            }
                        ];
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    eq: jest.fn().mockReturnValue({
                                        order: jest.fn().mockResolvedValue({
                                            data: mockAlerts,
                                            error: null
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, service.getAlerts('clinic-1')];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(true);
                        expect(result.data).toEqual(mockAlerts);
                        expect(mockSupabase.from).toHaveBeenCalledWith('executive_dashboard_alerts');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getWidgetConfiguration', function () {
        it('should fetch widget configuration for a user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWidgets, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWidgets = [
                            {
                                id: '1',
                                clinic_id: 'clinic-1',
                                user_id: 'user-1',
                                widget_type: 'revenue_chart',
                                position_x: 0,
                                position_y: 0,
                                width: 6,
                                height: 4,
                                configuration: { chart_type: 'line' }
                            }
                        ];
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    eq: jest.fn().mockReturnValue({
                                        order: jest.fn().mockResolvedValue({
                                            data: mockWidgets,
                                            error: null
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, service.getWidgetConfiguration('clinic-1', 'user-1')];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(true);
                        expect(result.data).toEqual(mockWidgets);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('saveWidgetConfiguration', function () {
        it('should save widget configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var widgetData, result;
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
                        mockSupabase.from.mockReturnValue({
                            upsert: jest.fn().mockReturnValue({
                                select: jest.fn().mockResolvedValue({
                                    data: [__assign(__assign({}, widgetData), { id: '1' })],
                                    error: null
                                })
                            })
                        });
                        return [4 /*yield*/, service.saveWidgetConfiguration(widgetData)];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(true);
                        expect(mockSupabase.from).toHaveBeenCalledWith('executive_dashboard_widgets');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getReports', function () {
        it('should fetch reports for a clinic', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockReports, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockReports = [
                            {
                                id: '1',
                                clinic_id: 'clinic-1',
                                report_name: 'Executive Summary',
                                report_type: 'executive_summary',
                                status: 'completed',
                                created_at: '2024-01-01T00:00:00Z'
                            }
                        ];
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    order: jest.fn().mockResolvedValue({
                                        data: mockReports,
                                        error: null
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, service.getReports('clinic-1')];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(true);
                        expect(result.data).toEqual(mockReports);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('generateReport', function () {
        it('should create a new report request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportData, result;
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
                        mockSupabase.from.mockReturnValue({
                            insert: jest.fn().mockReturnValue({
                                select: jest.fn().mockResolvedValue({
                                    data: [__assign(__assign({}, reportData), { id: '1', status: 'generating' })],
                                    error: null
                                })
                            })
                        });
                        return [4 /*yield*/, service.generateReport(reportData)];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(true);
                        expect(mockSupabase.from).toHaveBeenCalledWith('executive_dashboard_reports');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('comparePerformance', function () {
        it('should calculate performance comparison between periods', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentPeriodKPIs, previousPeriodKPIs, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        currentPeriodKPIs = [
                            { kpi_name: 'total_revenue', kpi_value: 100000 },
                            { kpi_name: 'total_appointments', kpi_value: 350 }
                        ];
                        previousPeriodKPIs = [
                            { kpi_name: 'total_revenue', kpi_value: 85000 },
                            { kpi_name: 'total_appointments', kpi_value: 300 }
                        ];
                        // Mock two separate calls for current and previous periods
                        mockSupabase.from
                            .mockReturnValueOnce({
                            select: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    eq: jest.fn().mockReturnValue({
                                        gte: jest.fn().mockReturnValue({
                                            lte: jest.fn().mockReturnValue({
                                                order: jest.fn().mockResolvedValue({
                                                    data: currentPeriodKPIs,
                                                    error: null
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                            .mockReturnValueOnce({
                            select: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    eq: jest.fn().mockReturnValue({
                                        gte: jest.fn().mockReturnValue({
                                            lte: jest.fn().mockReturnValue({
                                                order: jest.fn().mockResolvedValue({
                                                    data: previousPeriodKPIs,
                                                    error: null
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        });
                        return [4 /*yield*/, service.comparePerformance('clinic-1', 'monthly', '2024-02-01', '2024-02-29', '2024-01-01', '2024-01-31')];
                    case 1:
                        result = _b.sent();
                        expect(result.success).toBe(true);
                        expect(result.data).toHaveProperty('total_revenue');
                        expect((_a = result.data) === null || _a === void 0 ? void 0 : _a.total_revenue).toEqual({
                            current: 100000,
                            previous: 85000,
                            change: 15000,
                            changePercent: 17.65
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
