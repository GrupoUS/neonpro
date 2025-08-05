"use strict";
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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var marketing_roi_service_1 = require("@/app/lib/services/marketing-roi-service");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, forecastType, period, campaignIds, treatmentIds, requestData, forecast, response, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_d.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = request.nextUrl.searchParams;
                    forecastType = searchParams.get('type') || 'roi';
                    period = searchParams.get('period') || '90d';
                    campaignIds = (_a = searchParams.get('campaignIds')) === null || _a === void 0 ? void 0 : _a.split(',').filter(Boolean);
                    treatmentIds = (_b = searchParams.get('treatmentIds')) === null || _b === void 0 ? void 0 : _b.split(',').filter(Boolean);
                    requestData = {
                        type: forecastType,
                        period: period,
                        campaignIds: campaignIds,
                        treatmentIds: treatmentIds,
                        includeConfidenceInterval: searchParams.get('includeConfidenceInterval') === 'true',
                        includeScenarios: searchParams.get('includeScenarios') === 'true'
                    };
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().generateMarketingForecast(requestData)];
                case 3:
                    forecast = _d.sent();
                    response = {
                        forecast: forecast,
                        metadata: {
                            forecastType: forecastType,
                            period: period,
                            generatedAt: new Date().toISOString(),
                            dataPointsUsed: ((_c = forecast.historicalData) === null || _c === void 0 ? void 0 : _c.length) || 0,
                            confidenceLevel: forecast.confidenceLevel || 0.95
                        }
                    };
                    return [2 /*return*/, server_1.NextResponse.json(response)];
                case 4:
                    error_1 = _d.sent();
                    console.error('Marketing forecast error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to generate marketing forecast' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, requestData, forecast, insights, response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()
                        // Validate request data
                    ];
                case 3:
                    requestData = _b.sent();
                    // Validate request data
                    if (!requestData.type || !requestData.period) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Forecast type and period are required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().generateMarketingForecast(requestData)
                        // Generate additional insights for POST requests
                    ];
                case 4:
                    forecast = _b.sent();
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().generateForecastInsights({
                            forecast: forecast,
                            includeRecommendations: true,
                            includeRiskAssessment: true
                        })];
                case 5:
                    insights = _b.sent();
                    response = {
                        forecast: forecast,
                        insights: insights,
                        metadata: {
                            forecastType: requestData.type,
                            period: requestData.period,
                            generatedAt: new Date().toISOString(),
                            dataPointsUsed: ((_a = forecast.historicalData) === null || _a === void 0 ? void 0 : _a.length) || 0,
                            confidenceLevel: forecast.confidenceLevel || 0.95,
                            accuracy: forecast.accuracy
                        }
                    };
                    return [2 /*return*/, server_1.NextResponse.json(response)];
                case 6:
                    error_2 = _b.sent();
                    console.error('Marketing forecast generation error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to generate detailed marketing forecast' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, _a, forecastId, actualResults, feedback, updatedForecast, recalibrationResult, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    _a = _b.sent(), forecastId = _a.forecastId, actualResults = _a.actualResults, feedback = _a.feedback;
                    if (!forecastId || !actualResults) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Forecast ID and actual results are required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().updateForecastAccuracy(forecastId, actualResults, feedback)
                        // Recalibrate forecasting model if needed
                    ];
                case 4:
                    updatedForecast = _b.sent();
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().recalibrateForecastModel(forecastId, actualResults)];
                case 5:
                    recalibrationResult = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            updatedForecast: updatedForecast,
                            recalibrationResult: recalibrationResult
                        })];
                case 6:
                    error_3 = _b.sent();
                    console.error('Marketing forecast update error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update marketing forecast' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
