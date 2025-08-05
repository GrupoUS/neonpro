"use strict";
/**
 * Patient Identity Verification API
 * Handles facial recognition verification for patient identity
 *
 * @route POST /api/patients/photos/verify
 * @author APEX Master Developer
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var supabase_js_1 = require("@supabase/supabase-js");
var photo_recognition_manager_1 = require("../../../../../lib/patients/photo-recognition/photo-recognition-manager");
var audit_logger_1 = require("../../../../../lib/audit/audit-logger");
var lgpd_manager_1 = require("../../../../../lib/security/lgpd-manager");
var supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
var auditLogger = new audit_logger_1.AuditLogger(supabase);
var lgpdManager = new lgpd_manager_1.LGPDManager(supabase, auditLogger);
var photoManager = new photo_recognition_manager_1.PhotoRecognitionManager(supabase, auditLogger, lgpdManager, photo_recognition_manager_1.defaultPhotoRecognitionConfig);
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, _a, user, authError, formData, photoFile, patientId, verificationContext, allowedTypes, _b, patient, patientError, verificationResult, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authorization required' }, { status: 401 })];
                    }
                    token = authHeader.replace('Bearer ', '');
                    return [4 /*yield*/, supabase.auth.getUser(token)];
                case 1:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.formData()];
                case 2:
                    formData = _c.sent();
                    photoFile = formData.get('photo');
                    patientId = formData.get('patientId');
                    verificationContext = formData.get('context') || 'identity_check';
                    if (!photoFile || !patientId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Photo file and patient ID are required' }, { status: 400 })];
                    }
                    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    if (!allowedTypes.includes(photoFile.type)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }, { status: 400 })];
                    }
                    // Validate file size (5MB max for verification)
                    if (photoFile.size > 5 * 1024 * 1024) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'File too large. Maximum size is 5MB for verification' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('patients')
                            .select('id, name')
                            .eq('id', patientId)
                            .single()];
                case 3:
                    _b = _c.sent(), patient = _b.data, patientError = _b.error;
                    if (patientError || !patient) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Patient not found' }, { status: 404 })];
                    }
                    return [4 /*yield*/, photoManager.verifyPatientIdentity(patientId, photoFile, user.id, verificationContext)];
                case 4:
                    verificationResult = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                verified: verificationResult.verified,
                                confidence: verificationResult.confidence,
                                matchedPhotos: verificationResult.matchedPhotos.map(function (photo) { return ({
                                    id: photo.id,
                                    type: photo.type,
                                    confidence: photo.confidence,
                                    uploadedAt: photo.uploadedAt
                                }); }),
                                verificationId: verificationResult.verificationId,
                                timestamp: verificationResult.timestamp,
                                recommendations: verificationResult.recommendations
                            }
                        })];
                case 5:
                    error_1 = _c.sent();
                    console.error('Identity verification error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Verification failed',
                            details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// GET endpoint for verification history
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, _a, user, authError, searchParams, patientId, limit, offset, _b, verifications, verificationError, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authorization required' }, { status: 401 })];
                    }
                    token = authHeader.replace('Bearer ', '');
                    return [4 /*yield*/, supabase.auth.getUser(token)];
                case 1:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    patientId = searchParams.get('patientId');
                    limit = parseInt(searchParams.get('limit') || '10');
                    offset = parseInt(searchParams.get('offset') || '0');
                    if (!patientId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('patient_photo_verifications')
                            .select("\n        id,\n        verified,\n        confidence,\n        context,\n        created_at,\n        verified_by\n      ")
                            .eq('patient_id', patientId)
                            .order('created_at', { ascending: false })
                            .range(offset, offset + limit - 1)];
                case 2:
                    _b = _c.sent(), verifications = _b.data, verificationError = _b.error;
                    if (verificationError) {
                        throw verificationError;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: verifications || [],
                            pagination: {
                                limit: limit,
                                offset: offset,
                                hasMore: ((verifications === null || verifications === void 0 ? void 0 : verifications.length) || 0) === limit
                            }
                        })];
                case 3:
                    error_2 = _c.sent();
                    console.error('Get verification history error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to get verification history',
                            details: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
