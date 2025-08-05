"use strict";
/**
 * LGPD Compliance Framework - Data Subject Rights API
 * API para direitos do titular dos dados (LGPD Art. 18)
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 18 (Direitos do Titular)
 */
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
var client_1 = require("@/lib/supabase/client");
var zod_1 = require("zod");
var lgpd_core_1 = require("@/lib/compliance/lgpd-core");
var rate_limit_1 = require("@/lib/security/rate-limit");
var audit_logger_1 = require("@/lib/audit/audit-logger");
var csrf_1 = require("@/lib/security/csrf");
var data_export_1 = require("@/lib/compliance/data-export");
var data_deletion_1 = require("@/lib/compliance/data-deletion");
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
var DataSubjectRequestSchema = zod_1.z.object({
    requestType: zod_1.z.nativeEnum(lgpd_core_1.DataSubjectRequestType),
    description: zod_1.z.string().min(10).max(1000),
    specificData: zod_1.z.array(zod_1.z.string()).optional(),
    reason: zod_1.z.string().min(5).max(500).optional(),
    urgency: zod_1.z.enum(['low', 'medium', 'high']).default('medium'),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
var DataCorrectionSchema = zod_1.z.object({
    field: zod_1.z.string().min(1),
    currentValue: zod_1.z.string(),
    newValue: zod_1.z.string(),
    justification: zod_1.z.string().min(10).max(500)
});
var RequestQuerySchema = zod_1.z.object({
    clinicId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid().optional(),
    requestType: zod_1.z.nativeEnum(lgpd_core_1.DataSubjectRequestType).optional(),
    status: zod_1.z.nativeEnum(lgpd_core_1.DataSubjectRequestStatus).optional(),
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
function validateDataOwnership(supabase, userId, dataField) {
    return __awaiter(this, void 0, void 0, function () {
        var allowedFields;
        return __generator(this, function (_a) {
            allowedFields = [
                'full_name', 'email', 'phone', 'address', 'birth_date',
                'cpf', 'rg', 'medical_history', 'allergies', 'medications'
            ];
            return [2 /*return*/, allowedFields.includes(dataField)];
        });
    });
}
// ============================================================================
// GET - List Data Subject Requests
// ============================================================================
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var rateLimitResult, url, queryParams, validatedQuery, clinicId, userId, requestType, status_1, page, limit, supabase, _a, user, authError, hasAccess, filters, offset, _b, requests, error, count, error_1;
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
                    validatedQuery = RequestQuerySchema.parse(queryParams);
                    clinicId = validatedQuery.clinicId, userId = validatedQuery.userId, requestType = validatedQuery.requestType, status_1 = validatedQuery.status, page = validatedQuery.page, limit = validatedQuery.limit;
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
                    filters = { clinicId: clinicId };
                    if (userId)
                        filters.userId = userId;
                    if (requestType)
                        filters.requestType = requestType;
                    if (status_1)
                        filters.status = status_1;
                    offset = (page - 1) * limit;
                    return [4 /*yield*/, supabase
                            .from('lgpd_data_subject_requests')
                            .select("\n        *,\n        user:users(id, email, full_name)\n      ")
                            .match(filters)
                            .order('created_at', { ascending: false })
                            .range(offset, offset + limit - 1)];
                case 5:
                    _b = _c.sent(), requests = _b.data, error = _b.error;
                    if (error) {
                        throw new Error("Failed to fetch requests: ".concat(error.message));
                    }
                    return [4 /*yield*/, supabase
                            .from('lgpd_data_subject_requests')
                            .select('*', { count: 'exact', head: true })
                            .match(filters)];
                case 6:
                    count = (_c.sent()).count;
                    // Audit log
                    return [4 /*yield*/, (0, audit_logger_1.auditLog)({
                            action: 'DATA_SUBJECT_REQUESTS_LIST',
                            userId: user.id,
                            clinicId: clinicId,
                            details: {
                                filters: filters,
                                resultCount: (requests === null || requests === void 0 ? void 0 : requests.length) || 0
                            },
                            ipAddress: getClientInfo(request).ipAddress
                        })];
                case 7:
                    // Audit log
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                requests: requests || [],
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
                    console.error('GET /api/compliance/data-subject error:', error_1);
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
// POST - Create Data Subject Request
// ============================================================================
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var rateLimitResult, csrfValid, body, validatedData, requestType, description, specificData, reason, urgency, metadata, supabase, _a, user, authError, clinicId, hasAccess, _i, specificData_1, field, isValid, lgpdCore, clientInfo, dsRequest, additionalData, _b, exportData, portableData, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 20, , 21]);
                    return [4 /*yield*/, (0, rate_limit_1.withRateLimit)(request, {
                            windowMs: 15 * 60 * 1000, // 15 minutes
                            max: 20 // requests per window (more restrictive)
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
                    validatedData = DataSubjectRequestSchema.parse(body);
                    requestType = validatedData.requestType, description = validatedData.description, specificData = validatedData.specificData, reason = validatedData.reason, urgency = validatedData.urgency, metadata = validatedData.metadata;
                    return [4 /*yield*/, (0, client_1.createClient)()];
                case 4:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 5:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    clinicId = body.clinicId;
                    if (!clinicId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Clinic ID required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, validateUserAccess(supabase, user.id, clinicId)];
                case 6:
                    hasAccess = _c.sent();
                    if (!hasAccess) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied to clinic' }, { status: 403 })];
                    }
                    if (!specificData) return [3 /*break*/, 10];
                    _i = 0, specificData_1 = specificData;
                    _c.label = 7;
                case 7:
                    if (!(_i < specificData_1.length)) return [3 /*break*/, 10];
                    field = specificData_1[_i];
                    return [4 /*yield*/, validateDataOwnership(supabase, user.id, field)];
                case 8:
                    isValid = _c.sent();
                    if (!isValid) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Invalid data field: ".concat(field) }, { status: 400 })];
                    }
                    _c.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10:
                    lgpdCore = new lgpd_core_1.LGPDCore(supabase);
                    clientInfo = getClientInfo(request);
                    return [4 /*yield*/, lgpdCore.createDataSubjectRequest({
                            userId: user.id,
                            clinicId: clinicId,
                            requestType: requestType,
                            description: description,
                            specificData: specificData,
                            reason: reason,
                            urgency: urgency,
                            ipAddress: clientInfo.ipAddress,
                            userAgent: clientInfo.userAgent,
                            metadata: metadata
                        })];
                case 11:
                    dsRequest = _c.sent();
                    additionalData = {};
                    _b = requestType;
                    switch (_b) {
                        case lgpd_core_1.DataSubjectRequestType.ACCESS: return [3 /*break*/, 12];
                        case lgpd_core_1.DataSubjectRequestType.DELETION: return [3 /*break*/, 14];
                        case lgpd_core_1.DataSubjectRequestType.PORTABILITY: return [3 /*break*/, 16];
                    }
                    return [3 /*break*/, 18];
                case 12: return [4 /*yield*/, (0, data_export_1.generateDataExport)(supabase, user.id, clinicId, specificData)];
                case 13:
                    exportData = _c.sent();
                    additionalData = { exportData: exportData };
                    return [3 /*break*/, 18];
                case 14: 
                // Schedule data deletion (with grace period)
                return [4 /*yield*/, (0, data_deletion_1.scheduleDataDeletion)(supabase, user.id, clinicId, {
                        gracePeriodDays: 30,
                        requestId: dsRequest.id
                    })];
                case 15:
                    // Schedule data deletion (with grace period)
                    _c.sent();
                    return [3 /*break*/, 18];
                case 16: return [4 /*yield*/, (0, data_export_1.generateDataExport)(supabase, user.id, clinicId, specificData, {
                        format: 'json',
                        structured: true
                    })];
                case 17:
                    portableData = _c.sent();
                    additionalData = { portableData: portableData };
                    return [3 /*break*/, 18];
                case 18: 
                // Audit log
                return [4 /*yield*/, (0, audit_logger_1.auditLog)({
                        action: 'DATA_SUBJECT_REQUEST_CREATED',
                        userId: user.id,
                        clinicId: clinicId,
                        details: {
                            requestId: dsRequest.id,
                            requestType: requestType,
                            urgency: urgency,
                            specificData: specificData
                        },
                        ipAddress: clientInfo.ipAddress
                    })];
                case 19:
                    // Audit log
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: __assign({ request: dsRequest }, additionalData)
                        })];
                case 20:
                    error_2 = _c.sent();
                    console.error('POST /api/compliance/data-subject error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid request data',
                                details: error_2.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 21: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// PUT - Update Data (Correction)
// ============================================================================
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var rateLimitResult, csrfValid, body, corrections, clinicId, supabase, _a, user, authError, hasAccess, _i, corrections_1, correction, isValid, lgpdCore, clientInfo, results, _b, corrections_2, correction, result, error_3, error_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 18, , 19]);
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
                    corrections = zod_1.z.array(DataCorrectionSchema).parse(body.corrections);
                    clinicId = body.clinicId;
                    if (!clinicId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Clinic ID required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, client_1.createClient)()];
                case 4:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 5:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, validateUserAccess(supabase, user.id, clinicId)];
                case 6:
                    hasAccess = _c.sent();
                    if (!hasAccess) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied to clinic' }, { status: 403 })];
                    }
                    _i = 0, corrections_1 = corrections;
                    _c.label = 7;
                case 7:
                    if (!(_i < corrections_1.length)) return [3 /*break*/, 10];
                    correction = corrections_1[_i];
                    return [4 /*yield*/, validateDataOwnership(supabase, user.id, correction.field)];
                case 8:
                    isValid = _c.sent();
                    if (!isValid) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Invalid data field: ".concat(correction.field) }, { status: 400 })];
                    }
                    _c.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10:
                    lgpdCore = new lgpd_core_1.LGPDCore(supabase);
                    clientInfo = getClientInfo(request);
                    results = [];
                    _b = 0, corrections_2 = corrections;
                    _c.label = 11;
                case 11:
                    if (!(_b < corrections_2.length)) return [3 /*break*/, 16];
                    correction = corrections_2[_b];
                    _c.label = 12;
                case 12:
                    _c.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, lgpdCore.correctUserData({
                            userId: user.id,
                            clinicId: clinicId,
                            field: correction.field,
                            currentValue: correction.currentValue,
                            newValue: correction.newValue,
                            justification: correction.justification,
                            ipAddress: clientInfo.ipAddress,
                            userAgent: clientInfo.userAgent
                        })];
                case 13:
                    result = _c.sent();
                    results.push({
                        field: correction.field,
                        success: true,
                        result: result
                    });
                    return [3 /*break*/, 15];
                case 14:
                    error_3 = _c.sent();
                    results.push({
                        field: correction.field,
                        success: false,
                        error: error_3 instanceof Error ? error_3.message : 'Unknown error'
                    });
                    return [3 /*break*/, 15];
                case 15:
                    _b++;
                    return [3 /*break*/, 11];
                case 16: 
                // Audit log
                return [4 /*yield*/, (0, audit_logger_1.auditLog)({
                        action: 'DATA_CORRECTION',
                        userId: user.id,
                        clinicId: clinicId,
                        details: {
                            corrections: corrections.map(function (c) { return ({
                                field: c.field,
                                justification: c.justification
                            }); }),
                            results: results
                        },
                        ipAddress: clientInfo.ipAddress
                    })];
                case 17:
                    // Audit log
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: { results: results }
                        })];
                case 18:
                    error_4 = _c.sent();
                    console.error('PUT /api/compliance/data-subject error:', error_4);
                    if (error_4 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid correction data',
                                details: error_4.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 19: return [2 /*return*/];
            }
        });
    });
}
