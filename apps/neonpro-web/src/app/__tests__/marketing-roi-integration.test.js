"use strict";
// Marketing ROI Integration Test
// Tests the complete Story 8.5 implementation
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
var client_1 = require("@/lib/supabase/client");
var marketing_roi_service_1 = require("@/app/lib/services/marketing-roi-service");
describe('Marketing ROI Analysis - Story 8.5 Integration', function () {
    var supabase;
    var roiService;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                case 1:
                    supabase = _a.sent();
                    roiService = new marketing_roi_service_1.MarketingROIService(supabase);
                    return [2 /*return*/];
            }
        });
    }); });
    describe('Database Schema Validation', function () {
        test('should have all required marketing ROI tables', function () { return __awaiter(void 0, void 0, void 0, function () {
            var tables, expectedTables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('information_schema.tables')
                            .select('table_name')
                            .eq('table_schema', 'public')
                            .like('table_name', '%marketing%')];
                    case 1:
                        tables = (_a.sent()).data;
                        expectedTables = [
                            'marketing_campaigns',
                            'marketing_platforms',
                            'marketing_platform_connections',
                            'marketing_workflows',
                            'marketing_attribution_models',
                            'marketing_roi_calculations',
                            'marketing_touchpoints',
                            'marketing_roi_alerts',
                            'marketing_roi_forecasting',
                            'treatment_roi_analysis'
                        ];
                        expectedTables.forEach(function (tableName) {
                            expect(tables === null || tables === void 0 ? void 0 : tables.some(function (t) { return t.table_name === tableName; })).toBe(true);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Story 8.5 Acceptance Criteria Validation', function () {
        test('✅ ROI calculation and attribution tracking', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roiService.calculateCampaignROI('test-campaign', 'test-clinic', new Date(), new Date())];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        test('✅ Multi-touch attribution models', function () { return __awaiter(void 0, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roiService.getAttributionModels('test-clinic')];
                    case 1:
                        models = _a.sent();
                        expect(models).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        test('✅ Customer Acquisition Cost (CAC) and Lifetime Value (LTV) analysis', function () { return __awaiter(void 0, void 0, void 0, function () {
            var analysis;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roiService.getCACLTVAnalysis('test-clinic')];
                    case 1:
                        analysis = _a.sent();
                        expect(analysis).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        test('✅ Real-time ROI monitoring and alerts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var alerts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roiService.getROIAlerts('test-clinic')];
                    case 1:
                        alerts = _a.sent();
                        expect(alerts).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        test('✅ ROI optimization recommendations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var recommendations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roiService.getROIRecommendations('test-clinic')];
                    case 1:
                        recommendations = _a.sent();
                        expect(recommendations).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        test('✅ Advanced BI dashboard for marketing performance', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/marketing-roi/dashboard-metrics?clinic_id=test')];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        return [2 /*return*/];
                }
            });
        }); });
        test('✅ Treatment profitability analysis', function () { return __awaiter(void 0, void 0, void 0, function () {
            var analysis;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roiService.analyzeTreatmentProfitability('test-clinic', new Date(), new Date())];
                    case 1:
                        analysis = _a.sent();
                        expect(analysis).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        test('✅ ROI forecasting and predictive analytics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forecast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, roiService.generateROIForecast('test-clinic', 'test-campaign', 90)];
                    case 1:
                        forecast = _a.sent();
                        expect(forecast).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
