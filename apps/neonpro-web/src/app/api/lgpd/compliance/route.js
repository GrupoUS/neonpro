"use strict";
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
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var compliance_manager_1 = require("@/lib/lgpd/compliance-manager");
// Validation schemas
var complianceQuerySchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    includeMetrics: zod_1.z.boolean().default(true),
    includeAssessments: zod_1.z.boolean().default(false)
});
var assessmentCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    areasToAssess: zod_1.z.array(zod_1.z.string()).min(1),
    scheduledAt: zod_1.z.string().datetime().optional()
});
// GET /api/lgpd/compliance - Get compliance overview
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, profile, url, queryParams, validatedQuery, complianceManager, overview, metrics, assessments, metricsData, assessmentsData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single()];
                case 3:
                    profile = (_b.sent()).data;
                    if ((profile === null || profile === void 0 ? void 0 : profile.role) !== 'admin') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })];
                    }
                    url = new URL(request.url);
                    queryParams = Object.fromEntries(url.searchParams.entries());
                    validatedQuery = complianceQuerySchema.parse(__assign(__assign({}, queryParams), { includeMetrics: queryParams.includeMetrics !== 'false', includeAssessments: queryParams.includeAssessments === 'true' }));
                    complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
                    return [4 /*yield*/, complianceManager.getComplianceOverview({
                            userId: validatedQuery.userId,
                            startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
                            endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined
                        })];
                case 4:
                    overview = _b.sent();
                    metrics = null;
                    assessments = null;
                    if (!validatedQuery.includeMetrics) return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase
                            .from('lgpd_dashboard_metrics')
                            .select('*')
                            .single()];
                case 5:
                    metricsData = (_b.sent()).data;
                    metrics = metricsData;
                    _b.label = 6;
                case 6:
                    if (!validatedQuery.includeAssessments) return [3 /*break*/, 8];
                    return [4 /*yield*/, supabase
                            .from('lgpd_compliance_assessments')
                            .select("\n          id,\n          name,\n          status,\n          score,\n          compliance_percentage,\n          completed_at,\n          next_assessment_due\n        ")
                            .order('completed_at', { ascending: false })
                            .limit(5)];
                case 7:
                    assessmentsData = (_b.sent()).data;
                    assessments = assessmentsData;
                    _b.label = 8;
                case 8: 
                // Log access
                return [4 /*yield*/, complianceManager.logAuditEvent({
                        eventType: 'system_access',
                        userId: user.id,
                        description: 'Compliance overview accessed',
                        details: 'Admin accessed LGPD compliance dashboard',
                        metadata: {
                            query_params: validatedQuery,
                            access_time: new Date().toISOString()
                        }
                    })];
                case 9:
                    // Log access
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                overview: overview,
                                metrics: metrics,
                                assessments: assessments
                            }
                        })];
                case 10:
                    error_1 = _b.sent();
                    console.error('LGPD Compliance API Error:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid query parameters', details: error_1.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// POST /api/lgpd/compliance - Create compliance assessment
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, profile, body, validatedData, complianceManager, assessment, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single()];
                case 3:
                    profile = (_b.sent()).data;
                    if ((profile === null || profile === void 0 ? void 0 : profile.role) !== 'admin') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 4:
                    body = _b.sent();
                    validatedData = assessmentCreateSchema.parse(body);
                    complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
                    return [4 /*yield*/, complianceManager.createComplianceAssessment({
                            name: validatedData.name,
                            description: validatedData.description,
                            areasAssessed: validatedData.areasToAssess,
                            assessorId: user.id,
                            scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : undefined
                        })
                        // Log assessment creation
                    ];
                case 5:
                    assessment = _b.sent();
                    // Log assessment creation
                    return [4 /*yield*/, complianceManager.logAuditEvent({
                            eventType: 'admin_action',
                            userId: user.id,
                            description: 'Compliance assessment created',
                            details: "Assessment \"".concat(validatedData.name, "\" created"),
                            metadata: {
                                assessment_id: assessment.id,
                                areas_assessed: validatedData.areasToAssess
                            }
                        })];
                case 6:
                    // Log assessment creation
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: assessment
                        }, { status: 201 })];
                case 7:
                    error_2 = _b.sent();
                    console.error('LGPD Assessment Creation Error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid request data', details: error_2.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// PUT /api/lgpd/compliance - Run automated assessment
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, profile, _b, assessmentId, assessmentError, assessment, complianceManager, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single()];
                case 3:
                    profile = (_c.sent()).data;
                    if ((profile === null || profile === void 0 ? void 0 : profile.role) !== 'admin') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })];
                    }
                    return [4 /*yield*/, supabase
                            .rpc('generate_compliance_assessment')];
                case 4:
                    _b = _c.sent(), assessmentId = _b.data, assessmentError = _b.error;
                    if (assessmentError) {
                        throw new Error("Assessment generation failed: ".concat(assessmentError.message));
                    }
                    return [4 /*yield*/, supabase
                            .from('lgpd_compliance_assessments')
                            .select("\n        id,\n        name,\n        status,\n        score,\n        compliance_percentage,\n        findings,\n        recommendations,\n        completed_at\n      ")
                            .eq('id', assessmentId)
                            .single()];
                case 5:
                    assessment = (_c.sent()).data;
                    complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
                    // Log automated assessment
                    return [4 /*yield*/, complianceManager.logAuditEvent({
                            eventType: 'admin_action',
                            userId: user.id,
                            description: 'Automated compliance assessment executed',
                            details: "Assessment completed with score: ".concat(assessment === null || assessment === void 0 ? void 0 : assessment.score, "/100"),
                            metadata: {
                                assessment_id: assessmentId,
                                score: assessment === null || assessment === void 0 ? void 0 : assessment.score,
                                compliance_percentage: assessment === null || assessment === void 0 ? void 0 : assessment.compliance_percentage
                            }
                        })];
                case 6:
                    // Log automated assessment
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: assessment
                        })];
                case 7:
                    error_3 = _c.sent();
                    console.error('Automated Assessment Error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to run automated assessment' }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
