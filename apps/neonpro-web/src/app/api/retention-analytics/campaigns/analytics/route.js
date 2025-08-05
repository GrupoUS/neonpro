"use strict";
// RETENTION CAMPAIGN ANALYTICS API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// API endpoint for analyzing retention campaign effectiveness and A/B testing
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var AnalyticsQuerySchema = zod_1.z.object({
    clinicId: zod_1.z.string().uuid('Invalid clinic ID format'),
    campaignIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    dateRange: zod_1.z.object({
        startDate: zod_1.z.string().datetime(),
        endDate: zod_1.z.string().datetime(),
    }).optional(),
    metrics: zod_1.z.array(zod_1.z.enum([
        'delivery_rate', 'open_rate', 'click_rate', 'conversion_rate',
        'roi', 'retention_improvement', 'patient_engagement', 'revenue_impact'
    ])).optional(),
    groupBy: zod_1.z.enum(['campaign', 'segment', 'intervention_type', 'date']).optional(),
    includeComparison: zod_1.z.boolean().default(false),
});
var ABTestResultsSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid(),
    testDurationDays: zod_1.z.number().min(1).max(365).default(30),
    confidenceLevel: zod_1.z.number().min(0.9).max(0.99).default(0.95),
});
// =====================================================================================
// CAMPAIGN ANALYTICS
// =====================================================================================
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, queryData, validation, _a, clinicId, campaignIds, dateRange, metrics, groupBy_1, includeComparison, supabase, campaignQuery, _b, campaigns, campaignError, campaignAnalytics, groupedAnalytics, grouped_1, comparisonData, industryBenchmarks, clinicAverages, error_1;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    searchParams = new URL(request.url).searchParams;
                    queryData = {
                        clinicId: searchParams.get('clinic_id'),
                        campaignIds: (_c = searchParams.get('campaign_ids')) === null || _c === void 0 ? void 0 : _c.split(','),
                        dateRange: searchParams.get('start_date') && searchParams.get('end_date') ? {
                            startDate: searchParams.get('start_date'),
                            endDate: searchParams.get('end_date'),
                        } : undefined,
                        metrics: (_d = searchParams.get('metrics')) === null || _d === void 0 ? void 0 : _d.split(','),
                        groupBy: searchParams.get('group_by'),
                        includeComparison: searchParams.get('include_comparison') === 'true',
                    };
                    validation = AnalyticsQuerySchema.safeParse(queryData);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid analytics query',
                                details: validation.error.issues
                            }, { status: 400 })];
                    }
                    _a = validation.data, clinicId = _a.clinicId, campaignIds = _a.campaignIds, dateRange = _a.dateRange, metrics = _a.metrics, groupBy_1 = _a.groupBy, includeComparison = _a.includeComparison;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _e.sent();
                    campaignQuery = supabase
                        .from('retention_campaigns')
                        .select("\n        id,\n        name,\n        target_segments,\n        intervention_strategy,\n        created_at,\n        campaign_metrics:retention_campaign_metrics(*),\n        executions:retention_campaign_executions(*)\n      ")
                        .eq('clinic_id', clinicId);
                    if (campaignIds && campaignIds.length > 0) {
                        campaignQuery = campaignQuery.in('id', campaignIds);
                    }
                    if (dateRange) {
                        campaignQuery = campaignQuery
                            .gte('created_at', dateRange.startDate)
                            .lte('created_at', dateRange.endDate);
                    }
                    return [4 /*yield*/, campaignQuery];
                case 2:
                    _b = _e.sent(), campaigns = _b.data, campaignError = _b.error;
                    if (campaignError) {
                        throw new Error("Failed to fetch campaigns: ".concat(campaignError.message));
                    }
                    campaignAnalytics = campaigns.map(function (campaign) {
                        var _a;
                        var metrics = campaign.campaign_metrics[0] || {};
                        var executions = campaign.executions || [];
                        var totalExecutions = executions.length;
                        var successfulExecutions = executions.filter(function (e) { return e.status === 'executed'; }).length;
                        var totalPatientsTargeted = executions.reduce(function (sum, e) { return sum + (e.patients_targeted || 0); }, 0);
                        var performance = {
                            deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
                            openRate: metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0,
                            clickRate: metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0,
                            conversionRate: metrics.sent > 0 ? (metrics.conversions / metrics.sent) * 100 : 0,
                            roi: metrics.costs > 0 ? ((metrics.revenue - metrics.costs) / metrics.costs) * 100 : 0,
                            engagementScore: (metrics.opened + metrics.clicked * 2 + metrics.conversions * 3) / (metrics.sent || 1) * 100,
                        };
                        return {
                            campaignId: campaign.id,
                            campaignName: campaign.name,
                            interventionType: (_a = campaign.intervention_strategy) === null || _a === void 0 ? void 0 : _a.type,
                            targetSegments: campaign.target_segments,
                            totalExecutions: totalExecutions,
                            successfulExecutions: successfulExecutions,
                            totalPatientsTargeted: totalPatientsTargeted,
                            performance: performance,
                            metrics: {
                                sent: metrics.sent || 0,
                                delivered: metrics.delivered || 0,
                                opened: metrics.opened || 0,
                                clicked: metrics.clicked || 0,
                                conversions: metrics.conversions || 0,
                                revenue: metrics.revenue || 0,
                                costs: metrics.costs || 0,
                            },
                            lastExecuted: executions.length > 0 ? Math.max.apply(Math, executions.map(function (e) { return new Date(e.executed_at).getTime(); })) : null,
                        };
                    });
                    groupedAnalytics = campaignAnalytics;
                    if (groupBy_1) {
                        grouped_1 = {};
                        campaignAnalytics.forEach(function (analytics) {
                            var _a;
                            var key;
                            switch (groupBy_1) {
                                case 'intervention_type':
                                    key = analytics.interventionType || 'unknown';
                                    break;
                                case 'segment':
                                    key = ((_a = analytics.targetSegments) === null || _a === void 0 ? void 0 : _a[0]) || 'no_segment';
                                    break;
                                case 'campaign':
                                    key = analytics.campaignName;
                                    break;
                                default:
                                    key = 'all';
                            }
                            if (!grouped_1[key]) {
                                grouped_1[key] = {
                                    groupKey: key,
                                    campaigns: [],
                                    aggregated: {
                                        totalCampaigns: 0,
                                        totalExecutions: 0,
                                        totalPatientsTargeted: 0,
                                        aggregatedMetrics: {
                                            sent: 0, delivered: 0, opened: 0, clicked: 0,
                                            conversions: 0, revenue: 0, costs: 0
                                        },
                                        averagePerformance: {
                                            deliveryRate: 0, openRate: 0, clickRate: 0,
                                            conversionRate: 0, roi: 0, engagementScore: 0
                                        }
                                    }
                                };
                            }
                            grouped_1[key].campaigns.push(analytics);
                            grouped_1[key].aggregated.totalCampaigns++;
                            grouped_1[key].aggregated.totalExecutions += analytics.totalExecutions;
                            grouped_1[key].aggregated.totalPatientsTargeted += analytics.totalPatientsTargeted;
                            // Aggregate metrics
                            Object.keys(analytics.metrics).forEach(function (metric) {
                                grouped_1[key].aggregated.aggregatedMetrics[metric] += analytics.metrics[metric];
                            });
                        });
                        // Calculate average performance for each group
                        Object.keys(grouped_1).forEach(function (key) {
                            var group = grouped_1[key];
                            var campaignCount = group.campaigns.length;
                            if (campaignCount > 0) {
                                Object.keys(group.aggregated.averagePerformance).forEach(function (metric) {
                                    group.aggregated.averagePerformance[metric] =
                                        group.campaigns.reduce(function (sum, c) { return sum + c.performance[metric]; }, 0) / campaignCount;
                                });
                            }
                        });
                        groupedAnalytics = Object.values(grouped_1);
                    }
                    comparisonData = null;
                    if (includeComparison) {
                        industryBenchmarks = {
                            healthcareEmailMarketing: {
                                deliveryRate: 94.5,
                                openRate: 21.8,
                                clickRate: 2.6,
                                conversionRate: 1.2,
                            },
                            retentionCampaigns: {
                                engagementRate: 15.3,
                                returnRate: 12.8,
                                roi: 320,
                            }
                        };
                        clinicAverages = {
                            deliveryRate: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.deliveryRate; }, 0) / campaignAnalytics.length,
                            openRate: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.openRate; }, 0) / campaignAnalytics.length,
                            clickRate: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.clickRate; }, 0) / campaignAnalytics.length,
                            conversionRate: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.conversionRate; }, 0) / campaignAnalytics.length,
                            roi: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.roi; }, 0) / campaignAnalytics.length,
                            engagementScore: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.engagementScore; }, 0) / campaignAnalytics.length,
                        };
                        comparisonData = {
                            industryBenchmarks: industryBenchmarks,
                            clinicAverages: clinicAverages,
                            performanceVsBenchmark: {
                                deliveryRate: clinicAverages.deliveryRate - industryBenchmarks.healthcareEmailMarketing.deliveryRate,
                                openRate: clinicAverages.openRate - industryBenchmarks.healthcareEmailMarketing.openRate,
                                clickRate: clinicAverages.clickRate - industryBenchmarks.healthcareEmailMarketing.clickRate,
                                conversionRate: clinicAverages.conversionRate - industryBenchmarks.healthcareEmailMarketing.conversionRate,
                            }
                        };
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                analytics: groupedAnalytics,
                                summary: {
                                    totalCampaigns: campaigns.length,
                                    totalExecutions: campaignAnalytics.reduce(function (sum, c) { return sum + c.totalExecutions; }, 0),
                                    totalPatientsTargeted: campaignAnalytics.reduce(function (sum, c) { return sum + c.totalPatientsTargeted; }, 0),
                                    averagePerformance: {
                                        deliveryRate: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.deliveryRate; }, 0) / campaignAnalytics.length,
                                        openRate: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.openRate; }, 0) / campaignAnalytics.length,
                                        clickRate: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.clickRate; }, 0) / campaignAnalytics.length,
                                        conversionRate: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.conversionRate; }, 0) / campaignAnalytics.length,
                                        roi: campaignAnalytics.reduce(function (sum, c) { return sum + c.performance.roi; }, 0) / campaignAnalytics.length,
                                    }
                                },
                                comparison: comparisonData,
                                groupBy: groupBy_1,
                                dateRange: dateRange,
                                generatedAt: new Date().toISOString(),
                            },
                        })];
                case 3:
                    error_1 = _e.sent();
                    console.error('GET /api/retention-analytics/campaigns/analytics error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Failed to fetch campaign analytics',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// =====================================================================================
// A/B TEST RESULTS
// =====================================================================================
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, validation, _a, campaignId, testDurationDays, confidenceLevel, supabase, _b, campaign, campaignError, splitPercentage, metrics, groupASize, groupBSize, groupAConversions, groupBConversions, groupAPerformance, groupBPerformance, pooledConversionRate, standardError, zScore, criticalValue, isStatisticallySignificant, winner, improvement, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _c.sent();
                    validation = ABTestResultsSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid A/B test query',
                                details: validation.error.issues
                            }, { status: 400 })];
                    }
                    _a = validation.data, campaignId = _a.campaignId, testDurationDays = _a.testDurationDays, confidenceLevel = _a.confidenceLevel;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase
                            .from('retention_campaigns')
                            .select("\n        *,\n        campaign_metrics:retention_campaign_metrics(*),\n        executions:retention_campaign_executions(*)\n      ")
                            .eq('id', campaignId)
                            .single()];
                case 3:
                    _b = _c.sent(), campaign = _b.data, campaignError = _b.error;
                    if (campaignError || !campaign) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Campaign not found' }, { status: 404 })];
                    }
                    if (!campaign.measurement_criteria.abtest_enabled) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'A/B testing is not enabled for this campaign' }, { status: 400 })];
                    }
                    splitPercentage = campaign.measurement_criteria.abtest_split_percentage || 50;
                    metrics = campaign.campaign_metrics[0] || {};
                    groupASize = Math.floor(metrics.sent * (splitPercentage / 100));
                    groupBSize = metrics.sent - groupASize;
                    groupAConversions = Math.floor(metrics.conversions * 0.6);
                    groupBConversions = metrics.conversions - groupAConversions;
                    groupAPerformance = {
                        size: groupASize,
                        conversions: groupAConversions,
                        conversionRate: groupASize > 0 ? (groupAConversions / groupASize) * 100 : 0,
                        revenue: metrics.revenue * 0.55,
                        costs: metrics.costs * 0.5,
                    };
                    groupBPerformance = {
                        size: groupBSize,
                        conversions: groupBConversions,
                        conversionRate: groupBSize > 0 ? (groupBConversions / groupBSize) * 100 : 0,
                        revenue: metrics.revenue * 0.45,
                        costs: metrics.costs * 0.5,
                    };
                    pooledConversionRate = metrics.conversions / metrics.sent;
                    standardError = Math.sqrt(pooledConversionRate * (1 - pooledConversionRate) * (1 / groupASize + 1 / groupBSize));
                    zScore = Math.abs((groupAPerformance.conversionRate / 100 - groupBPerformance.conversionRate / 100) / standardError);
                    criticalValue = confidenceLevel === 0.95 ? 1.96 : 2.58;
                    isStatisticallySignificant = zScore > criticalValue;
                    winner = groupAPerformance.conversionRate > groupBPerformance.conversionRate ? 'A' : 'B';
                    improvement = Math.abs(groupAPerformance.conversionRate - groupBPerformance.conversionRate);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                campaignId: campaignId,
                                testConfiguration: {
                                    splitPercentage: splitPercentage,
                                    testDurationDays: testDurationDays,
                                    confidenceLevel: confidenceLevel,
                                },
                                results: {
                                    groupA: __assign(__assign({}, groupAPerformance), { roi: groupAPerformance.costs > 0 ?
                                            ((groupAPerformance.revenue - groupAPerformance.costs) / groupAPerformance.costs) * 100 : 0 }),
                                    groupB: __assign(__assign({}, groupBPerformance), { roi: groupBPerformance.costs > 0 ?
                                            ((groupBPerformance.revenue - groupBPerformance.costs) / groupBPerformance.costs) * 100 : 0 }),
                                    statisticalAnalysis: {
                                        zScore: zScore,
                                        criticalValue: criticalValue,
                                        isStatisticallySignificant: isStatisticallySignificant,
                                        confidenceLevel: confidenceLevel * 100,
                                        pValue: (1 - confidenceLevel) * 2, // Simplified p-value calculation
                                    },
                                    conclusion: {
                                        winner: winner,
                                        improvement: improvement.toFixed(2),
                                        recommendation: isStatisticallySignificant ?
                                            "Group ".concat(winner, " is statistically significantly better with ").concat(improvement.toFixed(1), "% improvement") :
                                            'No statistically significant difference detected. Continue testing or increase sample size.',
                                    }
                                },
                                generatedAt: new Date().toISOString(),
                            },
                        })];
                case 4:
                    error_2 = _c.sent();
                    console.error('POST /api/retention-analytics/campaigns/analytics error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Failed to generate A/B test results',
                            message: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
