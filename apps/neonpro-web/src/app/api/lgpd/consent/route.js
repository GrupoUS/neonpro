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
var zod_1 = require("zod");
var compliance_manager_1 = require("@/lib/lgpd/compliance-manager");
// Validation schemas
var consentCreateSchema = zod_1.z.object({
    purposes: zod_1.z.array(zod_1.z.string()).min(1),
    consentType: zod_1.z.enum(['explicit', 'implicit']).default('explicit'),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
var consentUpdateSchema = zod_1.z.object({
    purposes: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['granted', 'withdrawn', 'expired']).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
var consentQuerySchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().optional(),
    purpose: zod_1.z.string().optional(),
    status: zod_1.z.enum(['granted', 'withdrawn', 'expired']).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20)
});
// GET /api/lgpd/consent - Get user consents or admin view
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, url, queryParams, validatedQuery, profile, isAdmin, targetUserId, complianceManager, filters, _b, consents, consentsError, totalCount, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    url = new URL(request.url);
                    queryParams = Object.fromEntries(url.searchParams.entries());
                    validatedQuery = consentQuerySchema.parse(queryParams);
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single()];
                case 3:
                    profile = (_c.sent()).data;
                    isAdmin = (profile === null || profile === void 0 ? void 0 : profile.role) === 'admin';
                    targetUserId = isAdmin && validatedQuery.userId ? validatedQuery.userId : user.id;
                    complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
                    filters = {
                        userId: targetUserId
                    };
                    if (validatedQuery.purpose) {
                        filters.purpose = validatedQuery.purpose;
                    }
                    if (validatedQuery.status) {
                        filters.status = validatedQuery.status;
                    }
                    if (validatedQuery.startDate) {
                        filters.startDate = new Date(validatedQuery.startDate);
                    }
                    if (validatedQuery.endDate) {
                        filters.endDate = new Date(validatedQuery.endDate);
                    }
                    return [4 /*yield*/, supabase
                            .from('lgpd_consents')
                            .select("\n        id,\n        user_id,\n        purposes,\n        status,\n        consent_type,\n        granted_at,\n        withdrawn_at,\n        expires_at,\n        metadata,\n        created_at,\n        updated_at\n      ")
                            .eq('user_id', targetUserId)
                            .order('created_at', { ascending: false })
                            .range((validatedQuery.page - 1) * validatedQuery.limit, validatedQuery.page * validatedQuery.limit - 1)];
                case 4:
                    _b = _c.sent(), consents = _b.data, consentsError = _b.error;
                    if (consentsError) {
                        throw new Error("Failed to fetch consents: ".concat(consentsError.message));
                    }
                    return [4 /*yield*/, supabase
                            .from('lgpd_consents')
                            .select('*', { count: 'exact', head: true })
                            .eq('user_id', targetUserId)
                        // Log access if admin viewing other user's data
                    ];
                case 5:
                    totalCount = (_c.sent()).count;
                    if (!(isAdmin && validatedQuery.userId && validatedQuery.userId !== user.id)) return [3 /*break*/, 7];
                    return [4 /*yield*/, complianceManager.logAuditEvent({
                            eventType: 'admin_action',
                            userId: user.id,
                            description: 'Admin accessed user consents',
                            details: "Admin viewed consents for user ".concat(validatedQuery.userId),
                            metadata: {
                                target_user_id: validatedQuery.userId,
                                query_params: validatedQuery
                            }
                        })];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        data: {
                            consents: consents,
                            pagination: {
                                page: validatedQuery.page,
                                limit: validatedQuery.limit,
                                total: totalCount || 0,
                                totalPages: Math.ceil((totalCount || 0) / validatedQuery.limit)
                            }
                        }
                    })];
                case 8:
                    error_1 = _c.sent();
                    console.error('LGPD Consent GET Error:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid query parameters', details: error_1.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// POST /api/lgpd/consent - Create or update consent
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, body, validatedData, complianceManager, consent, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _b.sent();
                    validatedData = consentCreateSchema.parse(body);
                    complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
                    return [4 /*yield*/, complianceManager.grantConsent(user.id, validatedData.purposes, {
                            consentType: validatedData.consentType,
                            metadata: validatedData.metadata
                        })];
                case 4:
                    consent = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: consent
                        }, { status: 201 })];
                case 5:
                    error_2 = _b.sent();
                    console.error('LGPD Consent POST Error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid request data', details: error_2.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// PUT /api/lgpd/consent - Update existing consent
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, body, validatedData, url, consentId, profile, isAdmin, existingConsent, complianceManager, withdrawnConsent, updateData, _b, updatedConsent, updateError, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _c.sent();
                    validatedData = consentUpdateSchema.parse(body);
                    url = new URL(request.url);
                    consentId = url.searchParams.get('id');
                    if (!consentId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Consent ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single()];
                case 4:
                    profile = (_c.sent()).data;
                    isAdmin = (profile === null || profile === void 0 ? void 0 : profile.role) === 'admin';
                    return [4 /*yield*/, supabase
                            .from('lgpd_consents')
                            .select('user_id')
                            .eq('id', consentId)
                            .single()];
                case 5:
                    existingConsent = (_c.sent()).data;
                    if (!existingConsent) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Consent not found' }, { status: 404 })];
                    }
                    if (!isAdmin && existingConsent.user_id !== user.id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Forbidden - Can only modify own consents' }, { status: 403 })];
                    }
                    complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
                    if (!(validatedData.status === 'withdrawn')) return [3 /*break*/, 7];
                    return [4 /*yield*/, complianceManager.withdrawConsent(existingConsent.user_id, validatedData.purposes || [])];
                case 6:
                    withdrawnConsent = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: withdrawnConsent
                        })];
                case 7:
                    updateData = {
                        updated_at: new Date().toISOString()
                    };
                    if (validatedData.purposes) {
                        updateData.purposes = validatedData.purposes;
                    }
                    if (validatedData.status) {
                        updateData.status = validatedData.status;
                    }
                    if (validatedData.metadata) {
                        updateData.metadata = validatedData.metadata;
                    }
                    return [4 /*yield*/, supabase
                            .from('lgpd_consents')
                            .update(updateData)
                            .eq('id', consentId)
                            .select()
                            .single()];
                case 8:
                    _b = _c.sent(), updatedConsent = _b.data, updateError = _b.error;
                    if (updateError) {
                        throw new Error("Failed to update consent: ".concat(updateError.message));
                    }
                    // Log the update
                    return [4 /*yield*/, complianceManager.logAuditEvent({
                            eventType: 'consent_change',
                            userId: isAdmin ? user.id : existingConsent.user_id,
                            description: 'Consent updated',
                            details: "Consent ".concat(consentId, " updated"),
                            metadata: {
                                consent_id: consentId,
                                updated_by: user.id,
                                is_admin_action: isAdmin,
                                changes: validatedData
                            }
                        })];
                case 9:
                    // Log the update
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: updatedConsent
                        })];
                case 10:
                    error_3 = _c.sent();
                    console.error('LGPD Consent PUT Error:', error_3);
                    if (error_3 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid request data', details: error_3.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// DELETE /api/lgpd/consent - Withdraw consent
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, url, purposes, complianceManager, result, error_4;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    url = new URL(request.url);
                    purposes = ((_b = url.searchParams.get('purposes')) === null || _b === void 0 ? void 0 : _b.split(',')) || [];
                    if (purposes.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'At least one purpose must be specified' }, { status: 400 })];
                    }
                    complianceManager = new compliance_manager_1.LGPDComplianceManager(supabase);
                    return [4 /*yield*/, complianceManager.withdrawConsent(user.id, purposes)];
                case 3:
                    result = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: result
                        })];
                case 4:
                    error_4 = _c.sent();
                    console.error('LGPD Consent DELETE Error:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
