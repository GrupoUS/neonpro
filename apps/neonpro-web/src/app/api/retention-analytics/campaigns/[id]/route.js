"use strict";
// RETENTION CAMPAIGN EXECUTION API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// API endpoint for executing individual retention campaigns
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
exports.PATCH = PATCH;
exports.POST = POST;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var ExecuteCampaignSchema = zod_1.z.object({
    patientIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    dryRun: zod_1.z.boolean().default(false),
    scheduledAt: zod_1.z.string().datetime().optional(),
    overrideConditions: zod_1.z.boolean().default(false),
});
var UpdateCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    targetSegments: zod_1.z.array(zod_1.z.string()).optional(),
    triggerConditions: zod_1.z.object({
        churnProbabilityThreshold: zod_1.z.number().min(0).max(1),
        daysSinceLastVisit: zod_1.z.number().min(1),
        minimumLTV: zod_1.z.number().min(0).optional(),
        riskLevel: zod_1.z.enum(['low', 'medium', 'high']),
    }).optional(),
    interventionStrategy: zod_1.z.object({
        type: zod_1.z.enum(['email', 'sms', 'phone_call', 'in_app', 'multi_channel']),
        template: zod_1.z.string().min(1),
        scheduling: zod_1.z.object({
            immediate: zod_1.z.boolean().default(false),
            delayHours: zod_1.z.number().min(0).optional(),
            maxRetries: zod_1.z.number().min(1).max(5).default(3),
            retryIntervalHours: zod_1.z.number().min(1).default(24),
        }),
        personalization: zod_1.z.object({
            includeName: zod_1.z.boolean().default(true),
            includeLastService: zod_1.z.boolean().default(true),
            includeSpecialOffer: zod_1.z.boolean().default(false),
            customVariables: zod_1.z.record(zod_1.z.string()).optional(),
        }),
    }).optional(),
    measurementCriteria: zod_1.z.object({
        successMetrics: zod_1.z.array(zod_1.z.enum(['return_visit', 'booking_scheduled', 'payment_made', 'engagement_rate'])),
        trackingPeriodDays: zod_1.z.number().min(1).max(365).default(30),
        abtestEnabled: zod_1.z.boolean().default(false),
        abtestSplitPercentage: zod_1.z.number().min(10).max(90).optional(),
    }).optional(),
    isActive: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(['draft', 'active', 'paused', 'completed', 'archived']).optional(),
});
// =====================================================================================
// GET CAMPAIGN DETAILS
// =====================================================================================
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var campaignId, supabase, _c, campaign, error, metrics, performance_1, eligiblePatients, error_1;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    campaignId = params.id;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase
                            .from('retention_campaigns')
                            .select("\n        *,\n        campaign_metrics:retention_campaign_metrics(*),\n        recent_executions:retention_campaign_executions(\n          id,\n          executed_at,\n          patients_targeted,\n          success_count,\n          status,\n          execution_summary\n        )\n      ")
                            .eq('id', campaignId)
                            .single()];
                case 2:
                    _c = _d.sent(), campaign = _c.data, error = _c.error;
                    if (error) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Campaign not found' }, { status: 404 })];
                    }
                    metrics = campaign.campaign_metrics[0] || {};
                    performance_1 = {
                        deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
                        openRate: metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0,
                        clickRate: metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0,
                        conversionRate: metrics.sent > 0 ? (metrics.conversions / metrics.sent) * 100 : 0,
                        roi: metrics.costs > 0 ? ((metrics.revenue - metrics.costs) / metrics.costs) * 100 : 0,
                    };
                    return [4 /*yield*/, supabase
                            .from('retention_analytics')
                            .select('*', { count: 'exact', head: true })
                            .eq('clinic_id', campaign.clinic_id)
                            .gte('churn_probability', campaign.trigger_conditions.churnProbabilityThreshold)
                            .eq('risk_level', campaign.trigger_conditions.riskLevel)];
                case 3:
                    eligiblePatients = (_d.sent()).count;
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: __assign(__assign({}, campaign), { performance: performance_1, eligiblePatientsCount: eligiblePatients || 0 }),
                        })];
                case 4:
                    error_1 = _d.sent();
                    console.error('GET /api/retention-analytics/campaigns/[id] error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Failed to fetch campaign details',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// =====================================================================================
// UPDATE CAMPAIGN
// =====================================================================================
function PATCH(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var campaignId, body, validation, updates, supabase, _c, campaign, error, error_2;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    campaignId = params.id;
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _d.sent();
                    validation = UpdateCampaignSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid campaign data',
                                details: validation.error.issues
                            }, { status: 400 })];
                    }
                    updates = validation.data;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase
                            .from('retention_campaigns')
                            .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                            .eq('id', campaignId)
                            .select()
                            .single()];
                case 3:
                    _c = _d.sent(), campaign = _c.data, error = _c.error;
                    if (error) {
                        throw new Error("Failed to update campaign: ".concat(error.message));
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: campaign,
                            message: 'Campaign updated successfully',
                        })];
                case 4:
                    error_2 = _d.sent();
                    console.error('PATCH /api/retention-analytics/campaigns/[id] error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Failed to update campaign',
                            message: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// =====================================================================================
// EXECUTE CAMPAIGN
// =====================================================================================
function POST(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var campaignId, body, validation, _c, patientIds, dryRun, scheduledAt, overrideConditions, supabase, _d, campaign, campaignError, targetPatients, _e, patients, patientsError, _f, patients, patientsError, _g, execution, executionError, metricsError, error_3;
        var params = _b.params;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 12, , 13]);
                    campaignId = params.id;
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _h.sent();
                    validation = ExecuteCampaignSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid execution data',
                                details: validation.error.issues
                            }, { status: 400 })];
                    }
                    _c = validation.data, patientIds = _c.patientIds, dryRun = _c.dryRun, scheduledAt = _c.scheduledAt, overrideConditions = _c.overrideConditions;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _h.sent();
                    return [4 /*yield*/, supabase
                            .from('retention_campaigns')
                            .select('*')
                            .eq('id', campaignId)
                            .single()];
                case 3:
                    _d = _h.sent(), campaign = _d.data, campaignError = _d.error;
                    if (campaignError || !campaign) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Campaign not found' }, { status: 404 })];
                    }
                    if (!campaign.is_active && !overrideConditions) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Campaign is not active' }, { status: 400 })];
                    }
                    targetPatients = void 0;
                    if (!(patientIds && patientIds.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, supabase
                            .from('patients')
                            .select('id, name, email, phone, clinic_id')
                            .eq('clinic_id', campaign.clinic_id)
                            .in('id', patientIds)];
                case 4:
                    _e = _h.sent(), patients = _e.data, patientsError = _e.error;
                    if (patientsError) {
                        throw new Error("Failed to fetch target patients: ".concat(patientsError.message));
                    }
                    targetPatients = patients;
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, supabase
                        .from('retention_analytics')
                        .select("\n          patient_id,\n          churn_probability,\n          risk_level,\n          predicted_churn_date,\n          patients!inner(id, name, email, phone, clinic_id)\n        ")
                        .eq('clinic_id', campaign.clinic_id)
                        .gte('churn_probability', campaign.trigger_conditions.churnProbabilityThreshold)
                        .eq('risk_level', campaign.trigger_conditions.riskLevel)];
                case 6:
                    _f = _h.sent(), patients = _f.data, patientsError = _f.error;
                    if (patientsError) {
                        throw new Error("Failed to fetch eligible patients: ".concat(patientsError.message));
                    }
                    targetPatients = patients.map(function (p) { return p.patients; });
                    _h.label = 7;
                case 7:
                    if (targetPatients.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: true,
                                data: {
                                    executionId: null,
                                    patientsTargeted: 0,
                                    message: 'No eligible patients found for this campaign',
                                },
                            })];
                    }
                    return [4 /*yield*/, supabase
                            .from('retention_campaign_executions')
                            .insert({
                            campaign_id: campaignId,
                            clinic_id: campaign.clinic_id,
                            executed_at: scheduledAt || new Date().toISOString(),
                            patients_targeted: targetPatients.length,
                            status: dryRun ? 'dry_run' : 'executed',
                            execution_summary: {
                                dryRun: dryRun,
                                targetConditions: campaign.trigger_conditions,
                                interventionType: campaign.intervention_strategy.type,
                                patientsTargeted: targetPatients.map(function (p) { return ({
                                    id: p.id,
                                    name: p.name,
                                    email: p.email,
                                }); }),
                            },
                            success_count: dryRun ? 0 : targetPatients.length,
                        })
                            .select()
                            .single()];
                case 8:
                    _g = _h.sent(), execution = _g.data, executionError = _g.error;
                    if (executionError) {
                        throw new Error("Failed to create execution record: ".concat(executionError.message));
                    }
                    if (!!dryRun) return [3 /*break*/, 11];
                    return [4 /*yield*/, supabase
                            .from('retention_campaign_metrics')
                            .update({
                            sent: targetPatients.length,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('campaign_id', campaignId)];
                case 9:
                    metricsError = (_h.sent()).error;
                    if (metricsError) {
                        console.error('Failed to update campaign metrics:', metricsError);
                    }
                    // Update campaign status
                    return [4 /*yield*/, supabase
                            .from('retention_campaigns')
                            .update({
                            status: 'active',
                            last_executed_at: new Date().toISOString(),
                        })
                            .eq('id', campaignId)];
                case 10:
                    // Update campaign status
                    _h.sent();
                    _h.label = 11;
                case 11: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        data: {
                            executionId: execution.id,
                            patientsTargeted: targetPatients.length,
                            dryRun: dryRun,
                            scheduledAt: execution.executed_at,
                            interventionType: campaign.intervention_strategy.type,
                            message: dryRun
                                ? 'Dry run completed successfully'
                                : 'Campaign executed successfully',
                        },
                    })];
                case 12:
                    error_3 = _h.sent();
                    console.error('POST /api/retention-analytics/campaigns/[id] error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Failed to execute campaign',
                            message: error_3 instanceof Error ? error_3.message : 'Unknown error'
                        }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// =====================================================================================
// DELETE CAMPAIGN
// =====================================================================================
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var campaignId, supabase, _c, activeExecutions, executionsError, error, error_4;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    campaignId = params.id;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase
                            .from('retention_campaign_executions')
                            .select('id')
                            .eq('campaign_id', campaignId)
                            .eq('status', 'executed')
                            .limit(1)];
                case 2:
                    _c = _d.sent(), activeExecutions = _c.data, executionsError = _c.error;
                    if (executionsError) {
                        throw new Error("Failed to check active executions: ".concat(executionsError.message));
                    }
                    if (activeExecutions && activeExecutions.length > 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Cannot delete campaign with active executions. Archive it instead.' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('retention_campaigns')
                            .delete()
                            .eq('id', campaignId)];
                case 3:
                    error = (_d.sent()).error;
                    if (error) {
                        throw new Error("Failed to delete campaign: ".concat(error.message));
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Campaign deleted successfully',
                        })];
                case 4:
                    error_4 = _d.sent();
                    console.error('DELETE /api/retention-analytics/campaigns/[id] error:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Failed to delete campaign',
                            message: error_4 instanceof Error ? error_4.message : 'Unknown error'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
