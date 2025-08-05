"use strict";
/**
 * Executive Dashboard Simple Integration Test
 * Story 7.1: Executive Dashboard Implementation
 *
 * Simplified test to validate the basic functionality works
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
var executive_dashboard_1 = require("../../lib/services/executive-dashboard");
// Mock the Supabase client
jest.mock('../../app/utils/supabase/server', function () { return ({
    createClient: jest.fn(function () { return ({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue({
            data: [
                {
                    id: '1',
                    kpi_name: 'total_revenue',
                    kpi_value: 85000,
                    unit: 'BRL'
                }
            ],
            error: null
        })
    }); })
}); });
describe('ExecutiveDashboard Integration Test', function () {
    it('should create service instance', function () {
        var service = new executive_dashboard_1.ExecutiveDashboardService();
        expect(service).toBeDefined();
    });
    it('should have all required methods', function () {
        var service = new executive_dashboard_1.ExecutiveDashboardService();
        expect(typeof service.getKPIs).toBe('function');
        expect(typeof service.getAlerts).toBe('function');
        expect(typeof service.getWidgetConfiguration).toBe('function');
        expect(typeof service.saveWidgetConfiguration).toBe('function');
        expect(typeof service.getReports).toBe('function');
        expect(typeof service.generateReport).toBe('function');
        expect(typeof service.comparePerformance).toBe('function');
    });
    it('should fetch KPIs with mocked data', function () { return __awaiter(void 0, void 0, void 0, function () {
        var service, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = new executive_dashboard_1.ExecutiveDashboardService();
                    return [4 /*yield*/, service.getKPIs('clinic-1', 'monthly', '2024-01-01', '2024-01-31')];
                case 1:
                    result = _a.sent();
                    expect(result.success).toBe(true);
                    expect(result.data).toBeDefined();
                    expect(Array.isArray(result.data)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
});
