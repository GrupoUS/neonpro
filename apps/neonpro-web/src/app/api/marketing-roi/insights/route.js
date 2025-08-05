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
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var marketing_roi_service_1 = require("@/app/lib/services/marketing-roi-service");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, insightType, category, campaignIds, treatmentIds, timeframe, requestData, insights, response, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_c.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = request.nextUrl.searchParams;
                    insightType = searchParams.get('type');
                    category = searchParams.get('category');
                    campaignIds = (_a = searchParams.get('campaignIds')) === null || _a === void 0 ? void 0 : _a.split(',').filter(Boolean);
                    treatmentIds = (_b = searchParams.get('treatmentIds')) === null || _b === void 0 ? void 0 : _b.split(',').filter(Boolean);
                    timeframe = searchParams.get('timeframe') || '30d';
                    requestData = {
                        type: insightType,
                        category: category,
                        campaignIds: campaignIds,
                        treatmentIds: treatmentIds,
                        timeframe: timeframe,
                        includeRecommendations: searchParams.get('includeRecommendations') === 'true',
                        includeMetrics: searchParams.get('includeMetrics') === 'true'
                    };
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().generateMarketingInsights(requestData)];
                case 3:
                    insights = _c.sent();
                    response = {
                        insights: insights,
                        metadata: {
                            insightType: insightType,
                            category: category,
                            timeframe: timeframe,
                            generatedAt: new Date().toISOString(),
                            totalInsights: insights.length,
                            confidenceScore: insights.reduce(function (sum, i) { return sum + (i.confidence || 0); }, 0) / insights.length
                        }
                    };
                    return [2 /*return*/, server_1.NextResponse.json(response)];
                case 4:
                    error_1 = _c.sent();
                    console.error('Marketing insights error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to generate marketing insights' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, requestData, insights, analytics, recommendations, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()
                        // Validate request data
                    ];
                case 3:
                    requestData = _a.sent();
                    // Validate request data
                    if (!requestData.timeframe) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Timeframe is required for detailed insights generation' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().generateMarketingInsights(requestData)
                        // Generate deep analytics for POST requests
                    ];
                case 4:
                    insights = _a.sent();
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().generateDeepAnalytics({
                            insights: insights,
                            includeCorrelations: true,
                            includeTrends: true,
                            includeAnomalies: true,
                            includeSegmentation: true
                        })
                        // Generate actionable recommendations
                    ];
                case 5:
                    analytics = _a.sent();
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().generateActionableRecommendations({
                            insights: insights,
                            analytics: analytics,
                            priority: 'high'
                        })];
                case 6:
                    recommendations = _a.sent();
                    response = {
                        insights: insights,
                        analytics: analytics,
                        recommendations: recommendations,
                        metadata: {
                            insightType: requestData.type,
                            category: requestData.category,
                            timeframe: requestData.timeframe,
                            generatedAt: new Date().toISOString(),
                            totalInsights: insights.length,
                            confidenceScore: insights.reduce(function (sum, i) { return sum + (i.confidence || 0); }, 0) / insights.length,
                            analyticsDepth: 'comprehensive',
                            recommendationsCount: (recommendations === null || recommendations === void 0 ? void 0 : recommendations.length) || 0
                        }
                    };
                    return [2 /*return*/, server_1.NextResponse.json(response)];
                case 7:
                    error_2 = _a.sent();
                    console.error('Marketing insights generation error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to generate comprehensive marketing insights' }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, _a, insightId, feedback, rating, implemented, updatedInsight, learningResult, error_3;
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
                    _a = _b.sent(), insightId = _a.insightId, feedback = _a.feedback, rating = _a.rating, implemented = _a.implemented;
                    if (!insightId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Insight ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().updateInsightFeedback(insightId, {
                            feedback: feedback,
                            rating: rating,
                            implemented: implemented,
                            updatedAt: new Date().toISOString()
                        })
                        // Learn from feedback to improve future insights
                    ];
                case 4:
                    updatedInsight = _b.sent();
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().improveInsightAccuracy(insightId, { feedback: feedback, rating: rating, implemented: implemented })];
                case 5:
                    learningResult = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            updatedInsight: updatedInsight,
                            learningResult: learningResult
                        })];
                case 6:
                    error_3 = _b.sent();
                    console.error('Marketing insight update error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update marketing insight' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, insightId, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = request.nextUrl.searchParams;
                    insightId = searchParams.get('insightId');
                    if (!insightId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Insight ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().deleteInsight(insightId)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            deletedInsightId: insightId,
                            result: result
                        })];
                case 4:
                    error_4 = _a.sent();
                    console.error('Marketing insight deletion error:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to delete marketing insight' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
