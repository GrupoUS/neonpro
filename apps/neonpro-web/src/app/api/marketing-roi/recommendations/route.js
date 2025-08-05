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
        var supabase, session, searchParams, campaignIds, treatmentIds, priority, strategy, requestData, recommendations, response, error_1;
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
                    campaignIds = (_a = searchParams.get('campaignIds')) === null || _a === void 0 ? void 0 : _a.split(',').filter(Boolean);
                    treatmentIds = (_b = searchParams.get('treatmentIds')) === null || _b === void 0 ? void 0 : _b.split(',').filter(Boolean);
                    priority = searchParams.get('priority');
                    strategy = searchParams.get('strategy');
                    requestData = {
                        campaignIds: campaignIds,
                        treatmentIds: treatmentIds,
                        filters: {
                            priority: priority || undefined,
                            strategy: strategy || undefined,
                            minImpact: searchParams.get('minImpact') ? parseFloat(searchParams.get('minImpact')) : undefined,
                            maxImplementationCost: searchParams.get('maxImplementationCost') ? parseFloat(searchParams.get('maxImplementationCost')) : undefined
                        }
                    };
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().getOptimizationRecommendations(requestData)];
                case 3:
                    recommendations = _c.sent();
                    response = {
                        recommendations: recommendations,
                        metadata: {
                            totalRecommendations: recommendations.length,
                            highPriorityCount: recommendations.filter(function (r) { return r.priority === 'high'; }).length,
                            averageImpact: recommendations.reduce(function (sum, r) { return sum + r.expectedImpact; }, 0) / recommendations.length,
                            totalImplementationCost: recommendations.reduce(function (sum, r) { return sum + (r.implementationCost || 0); }, 0)
                        }
                    };
                    return [2 /*return*/, server_1.NextResponse.json(response)];
                case 4:
                    error_1 = _c.sent();
                    console.error('Marketing ROI recommendations error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch marketing ROI recommendations' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, requestData, recommendations, analysis, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
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
                    if (!requestData.campaignIds && !requestData.treatmentIds) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Either campaignIds or treatmentIds must be provided' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().getOptimizationRecommendations(requestData)
                        // Generate comprehensive analysis
                    ];
                case 4:
                    recommendations = _a.sent();
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().generateOptimizationInsights({
                            recommendations: recommendations,
                            timeframe: '90d',
                            includeMarketComparison: true
                        })];
                case 5:
                    analysis = _a.sent();
                    response = {
                        recommendations: recommendations,
                        analysis: analysis,
                        metadata: {
                            totalRecommendations: recommendations.length,
                            highPriorityCount: recommendations.filter(function (r) { return r.priority === 'high'; }).length,
                            averageImpact: recommendations.reduce(function (sum, r) { return sum + r.expectedImpact; }, 0) / recommendations.length,
                            totalImplementationCost: recommendations.reduce(function (sum, r) { return sum + (r.implementationCost || 0); }, 0),
                            estimatedTimeframe: Math.max.apply(Math, recommendations.map(function (r) { return r.timeframe || 30; }))
                        }
                    };
                    return [2 /*return*/, server_1.NextResponse.json(response)];
                case 6:
                    error_2 = _a.sent();
                    console.error('Marketing ROI recommendations generation error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to generate marketing ROI recommendations' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, _a, recommendationId, status_1, feedback, updatedRecommendation, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
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
                    _a = _b.sent(), recommendationId = _a.recommendationId, status_1 = _a.status, feedback = _a.feedback;
                    if (!recommendationId || !status_1) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Recommendation ID and status are required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, marketing_roi_service_1.createmarketingROIService)().updateRecommendationStatus(recommendationId, status_1, feedback)];
                case 4:
                    updatedRecommendation = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            recommendation: updatedRecommendation
                        })];
                case 5:
                    error_3 = _b.sent();
                    console.error('Marketing ROI recommendation update error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update marketing ROI recommendation' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
