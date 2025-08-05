"use strict";
/**
 * LGPD Compliance Framework - Consent Management API
 * API para gerenciamento de consentimentos LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7�, 8�, 9�
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
exports.GET = GET;
exports.POST = POST;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var client_1 = require("@/lib/supabase/client");
var zod_1 = require("zod");
var lgpd_core_1 = require("@/lib/compliance/lgpd-core");
var lgpd_1 = require("@/types/lgpd");
var rate_limit_1 = require("@/lib/security/rate-limit");
var audit_logger_1 = require("@/lib/audit/audit-logger");
var csrf_1 = require("@/lib/security/csrf");
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
var GrantConsentSchema = zod_1.z.object({
    consentType: zod_1.z.nativeEnum(lgpd_1.ConsentType),
    purpose: zod_1.z.string().min(10).max(500),
    description: zod_1.z.string().min(10).max(1000),
    legalBasis: zod_1.z.nativeEnum(lgpd_1.LegalBasis),
    expiresAt: zod_1.z.string().datetime().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
var WithdrawConsentSchema = zod_1.z.object({
    consentId: zod_1.z.string().uuid(),
    reason: zod_1.z.string().min(5).max(500).optional()
});
var ConsentQuerySchema = zod_1.z.object({
    clinicId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid().optional(),
    consentType: zod_1.z.nativeEnum(lgpd_1.ConsentType).optional(),
    status: zod_1.z.nativeEnum(lgpd_1.ConsentStatus).optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20)
});
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getClientInfo(request) {
    var forwarded = request.headers.get('x-forwarded-for');
    var realIp = request.headers.get('x-real-ip');
    var ipAddress = (forwarded === null || forwarded === void 0 ? void 0 : forwarded.split(',')[0]) || realIp || 'unknown';
    var userAgent = request.headers.get('user-agent') || 'unknown';
    return { ipAddress: ipAddress, userAgent: userAgent };
}
function validateUserAccess(supabase, userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
        var userClinic;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('user_clinics')
                        .select('id')
                        .eq('user_id', userId)
                        .eq('clinic_id', clinicId)
                        .single()];
                case 1:
                    userClinic = (_a.sent()).data;
                    return [2 /*return*/, !!userClinic];
            }
        });
    });
}
// ============================================================================
// GET - List Consents
// ============================================================================
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var rateLimitResult, url, queryParams, validatedQuery, clinicId, userId, consentType, status_1, page, limit, supabase, _a, user, authError, hasAccess, lgpdCore, filters, offset, _b, consents, error, count, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, rate_limit_1.withRateLimit)(request, {
                            windowMs: 15 * 60 * 1000, // 15 minutes
                            max: 100 // requests per window
                        })];
                case 1:
                    rateLimitResult = _c.sent();
                    if (!rateLimitResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })];
                    }
                    url = new URL(request.url);
                    queryParams = Object.fromEntries(url.searchParams);
                    validatedQuery = ConsentQuerySchema.parse(queryParams);
                    clinicId = validatedQuery.clinicId, userId = validatedQuery.userId, consentType = validatedQuery.consentType, status_1 = validatedQuery.status, page = validatedQuery.page, limit = validatedQuery.limit;
                    return [4 /*yield*/, (0, client_1.createClient)()];
                case 2:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, validateUserAccess(supabase, user.id, clinicId)];
                case 4:
                    hasAccess = _c.sent();
                    if (!hasAccess) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied to clinic' }, { status: 403 })];
                    }
                    lgpdCore = new lgpd_core_1.LGPDCore(supabase);
                    filters = { clinicId: clinicId };
                    if (userId)
                        filters.userId = userId;
                    if (consentType)
                        filters.consentType = consentType;
                    if (status_1)
                        filters.status = status_1;
                    offset = (page - 1) * limit;
                    return [4 /*yield*/, supabase
                            .from('lgpd_consents')
                            .select("\n        *,\n        user:users(id, email, full_name)\n      ")
                            .match(filters)
                            .order('created_at', { ascending: false })
                            .range(offset, offset + limit - 1)];
                case 5:
                    _b = _c.sent(), consents = _b.data, error = _b.error;
                    if (error) {
                        throw new Error("Failed to fetch consents: ".concat(error.message));
                    }
                    return [4 /*yield*/, supabase
                            .from('lgpd_consents')
                            .select('*', { count: 'exact', head: true })
                            .match(filters)];
                case 6:
                    count = (_c.sent()).count;
                    // Audit log
                    return [4 /*yield*/, (0, audit_logger_1.auditLog)({
                            action: 'CONSENT_LIST',
                            userId: user.id,
                            clinicId: clinicId,
                            details: {
                                filters: filters,
                                resultCount: (consents === null || consents === void 0 ? void 0 : consents.length) || 0
                            },
                            ipAddress: getClientInfo(request).ipAddress
                        })];
                case 7:
                    // Audit log
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                consents: consents || [],
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: count || 0,
                                    totalPages: Math.ceil((count || 0) / limit)
                                }
                            }
                        })];
                case 8:
                    error_1 = _c.sent();
                    console.error('GET /api/compliance/consent error:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid query parameters',
                                details: error_1.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// POST - Grant Consent
// ============================================================================
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var rateLimitResult, csrfValid, body, validatedData, consentType, purpose, description, legalBasis, expiresAt, metadata, supabase, _a, user, authError, clinicId, hasAccess, lgpdCore, clientInfo, consent, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, (0, rate_limit_1.withRateLimit)(request, {
                            windowMs: 15 * 60 * 1000, // 15 minutes
                            max: 50 // requests per window
                        })];
                case 1:
                    rateLimitResult = _b.sent();
                    if (!rateLimitResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })];
                    }
                    return [4 /*yield*/, (0, csrf_1.validateCSRF)(request)];
                case 2:
                    csrfValid = _b.sent();
                    if (!csrfValid) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _b.sent();
                    validatedData = GrantConsentSchema.parse(body);
                    consentType = validatedData.consentType, purpose = validatedData.purpose, description = validatedData.description, legalBasis = validatedData.legalBasis, expiresAt = validatedData.expiresAt, metadata = validatedData.metadata;
                    return [4 /*yield*/, (0, client_1.createClient)()];
                case 4:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 5:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    clinicId = body.clinicId;
                    if (!clinicId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Clinic ID required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, validateUserAccess(supabase, user.id, clinicId)];
                case 6:
                    hasAccess = _b.sent();
                    if (!hasAccess) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied to clinic' }, { status: 403 })];
                    }
                    lgpdCore = new lgpd_core_1.LGPDCore(supabase);
                    clientInfo = getClientInfo(request);
                    return [4 /*yield*/, lgpdCore.grantConsent({
                            userId: user.id,
                            clinicId: clinicId,
                            consentType: consentType,
                            purpose: purpose,
                            description: description,
                            legalBasis: legalBasis,
                            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                            ipAddress: clientInfo.ipAddress,
                            userAgent: clientInfo.userAgent,
                            metadata: metadata
                        })];
                case 7:
                    consent = _b.sent();
                    // Audit log
                    return [4 /*yield*/, (0, audit_logger_1.auditLog)({
                            action: 'CONSENT_GRANTED',
                            userId: user.id,
                            clinicId: clinicId,
                            details: {
                                consentId: consent.id,
                                consentType: consentType,
                                purpose: purpose,
                                legalBasis: legalBasis
                            },
                            ipAddress: clientInfo.ipAddress
                        })];
                case 8:
                    // Audit log
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: { consent: consent }
                        })];
                case 9:
                    error_2 = _b.sent();
                    console.error('POST /api/compliance/consent error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid request data',
                                details: error_2.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// DELETE - Withdraw Consent
// ============================================================================
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var rateLimitResult, csrfValid, body, validatedData, consentId, reason, supabase, _a, user, authError, _b, consent, consentError, lgpdCore, clientInfo, withdrawnConsent, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, (0, rate_limit_1.withRateLimit)(request, {
                            windowMs: 15 * 60 * 1000, // 15 minutes
                            max: 30 // requests per window
                        })];
                case 1:
                    rateLimitResult = _c.sent();
                    if (!rateLimitResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })];
                    }
                    return [4 /*yield*/, (0, csrf_1.validateCSRF)(request)];
                case 2:
                    csrfValid = _c.sent();
                    if (!csrfValid) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _c.sent();
                    validatedData = WithdrawConsentSchema.parse(body);
                    consentId = validatedData.consentId, reason = validatedData.reason;
                    return [4 /*yield*/, (0, client_1.createClient)()];
                case 4:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 5:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('lgpd_consents')
                            .select('*')
                            .eq('id', consentId)
                            .eq('user_id', user.id)
                            .single()];
                case 6:
                    _b = _c.sent(), consent = _b.data, consentError = _b.error;
                    if (consentError || !consent) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Consent not found or access denied' }, { status: 404 })];
                    }
                    lgpdCore = new lgpd_core_1.LGPDCore(supabase);
                    clientInfo = getClientInfo(request);
                    return [4 /*yield*/, lgpdCore.withdrawConsent(consentId, {
                            reason: reason,
                            ipAddress: clientInfo.ipAddress,
                            userAgent: clientInfo.userAgent
                        })];
                case 7:
                    withdrawnConsent = _c.sent();
                    // Audit log
                    return [4 /*yield*/, (0, audit_logger_1.auditLog)({
                            action: 'CONSENT_WITHDRAWN',
                            userId: user.id,
                            clinicId: consent.clinic_id,
                            details: {
                                consentId: consentId,
                                consentType: consent.consent_type,
                                reason: reason
                            },
                            ipAddress: clientInfo.ipAddress
                        })];
                case 8:
                    // Audit log
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: { consent: withdrawnConsent }
                        })];
                case 9:
                    error_3 = _c.sent();
                    console.error('DELETE /api/compliance/consent error:', error_3);
                    if (error_3 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid request data',
                                details: error_3.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
