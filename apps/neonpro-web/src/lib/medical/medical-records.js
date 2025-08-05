"use strict";
/**
 * NeonPro Medical Records System
 * Story 2.2: Medical History & Records Implementation
 *
 * Sistema completo de prontuário eletrônico com:
 * - Histórico médico estruturado
 * - Gestão de documentos médicos
 * - Versionamento de registros
 * - Integração com LGPD
 * - Assinatura digital
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
exports.medicalRecordsManager = exports.MedicalRecordsManager = exports.AttachmentCategory = exports.RecordStatus = exports.MedicalRecordType = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var zod_1 = require("zod");
var crypto_1 = require("crypto");
var lgpd_manager_1 = require("../auth/lgpd/lgpd-manager");
var audit_logger_1 = require("../audit/audit-logger");
// Enums
var MedicalRecordType;
(function (MedicalRecordType) {
    MedicalRecordType["CONSULTATION"] = "consultation";
    MedicalRecordType["PROCEDURE"] = "procedure";
    MedicalRecordType["TREATMENT"] = "treatment";
    MedicalRecordType["FOLLOW_UP"] = "follow_up";
    MedicalRecordType["EMERGENCY"] = "emergency";
    MedicalRecordType["PREVENTIVE"] = "preventive";
    MedicalRecordType["AESTHETIC"] = "aesthetic";
})(MedicalRecordType || (exports.MedicalRecordType = MedicalRecordType = {}));
var RecordStatus;
(function (RecordStatus) {
    RecordStatus["DRAFT"] = "draft";
    RecordStatus["ACTIVE"] = "active";
    RecordStatus["ARCHIVED"] = "archived";
    RecordStatus["DELETED"] = "deleted";
})(RecordStatus || (exports.RecordStatus = RecordStatus = {}));
var AttachmentCategory;
(function (AttachmentCategory) {
    AttachmentCategory["PHOTO_BEFORE"] = "photo_before";
    AttachmentCategory["PHOTO_AFTER"] = "photo_after";
    AttachmentCategory["DOCUMENT"] = "document";
    AttachmentCategory["LAB_RESULT"] = "lab_result";
    AttachmentCategory["IMAGING"] = "imaging";
    AttachmentCategory["CONSENT_FORM"] = "consent_form";
    AttachmentCategory["PRESCRIPTION"] = "prescription";
})(AttachmentCategory || (exports.AttachmentCategory = AttachmentCategory = {}));
// Validation schemas
var MedicalRecordSchema = zod_1.z.object({
    patient_id: zod_1.z.string().uuid(),
    clinic_id: zod_1.z.string().uuid(),
    record_type: zod_1.z.nativeEnum(MedicalRecordType),
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().min(1),
    diagnosis: zod_1.z.string().optional(),
    treatment_plan: zod_1.z.string().optional(),
    medications: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        dosage: zod_1.z.string(),
        frequency: zod_1.z.string(),
        start_date: zod_1.z.string(),
        end_date: zod_1.z.string().optional(),
        prescriber: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    })).optional(),
    allergies: zod_1.z.array(zod_1.z.object({
        allergen: zod_1.z.string(),
        reaction: zod_1.z.string(),
        severity: zod_1.z.enum(['mild', 'moderate', 'severe']),
        onset_date: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional()
    })).optional(),
    vital_signs: zod_1.z.object({
        blood_pressure_systolic: zod_1.z.number().optional(),
        blood_pressure_diastolic: zod_1.z.number().optional(),
        heart_rate: zod_1.z.number().optional(),
        temperature: zod_1.z.number().optional(),
        weight: zod_1.z.number().optional(),
        height: zod_1.z.number().optional(),
        bmi: zod_1.z.number().optional(),
        recorded_at: zod_1.z.string(),
        recorded_by: zod_1.z.string()
    }).optional()
});
// ============================================================================
// MEDICAL RECORDS MANAGER
// ============================================================================
var MedicalRecordsManager = /** @class */ (function () {
    function MedicalRecordsManager() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        this.lgpdManager = new lgpd_manager_1.LGPDManager();
        this.auditLogger = new audit_logger_1.AuditLogger();
    }
    // ========================================================================
    // MEDICAL RECORDS CRUD
    // ========================================================================
    MedicalRecordsManager.prototype.createMedicalRecord = function (recordData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, consentCheck, recordId, now, newRecord, _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        validation = MedicalRecordSchema.parse(recordData);
                        return [4 /*yield*/, this.lgpdManager.checkConsent(recordData.patient_id, 'medical_data')];
                    case 1:
                        consentCheck = _b.sent();
                        if (!consentCheck.hasConsent) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Patient consent required for medical data processing'
                                }];
                        }
                        recordId = crypto_1.default.randomUUID();
                        now = new Date().toISOString();
                        newRecord = __assign(__assign({}, recordData), { id: recordId, created_at: now, updated_at: now, version: 1, status: RecordStatus.ACTIVE, created_by: userId });
                        return [4 /*yield*/, this.supabase
                                .from('medical_records')
                                .insert(newRecord)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_record_created',
                                user_id: userId,
                                resource_type: 'medical_record',
                                resource_id: recordId,
                                details: {
                                    patient_id: recordData.patient_id,
                                    record_type: recordData.record_type,
                                    title: recordData.title
                                }
                            })];
                    case 3:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Error creating medical record:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.getMedicalRecord = function (recordId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('medical_records')
                                .select("\n          *,\n          attachments:medical_attachments(*),\n          digital_signatures(*)\n        ")
                                .eq('id', recordId)
                                .eq('status', RecordStatus.ACTIVE)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!data) {
                            return [2 /*return*/, { success: false, error: 'Medical record not found' }];
                        }
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_record_accessed',
                                user_id: userId,
                                resource_type: 'medical_record',
                                resource_id: recordId,
                                details: {
                                    patient_id: data.patient_id
                                }
                            })];
                    case 2:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Error getting medical record:', error_2);
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.updateMedicalRecord = function (recordId, updates, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var currentRecord, now, updatedRecord, _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getMedicalRecord(recordId, userId)];
                    case 1:
                        currentRecord = _b.sent();
                        if (!currentRecord.success || !currentRecord.data) {
                            return [2 /*return*/, { success: false, error: 'Record not found' }];
                        }
                        now = new Date().toISOString();
                        updatedRecord = __assign(__assign({}, updates), { updated_at: now, version: currentRecord.data.version + 1 });
                        return [4 /*yield*/, this.supabase
                                .from('medical_records')
                                .update(updatedRecord)
                                .eq('id', recordId)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Create version history
                        return [4 /*yield*/, this.createRecordVersion(currentRecord.data, userId)
                            // Log audit event
                        ];
                    case 3:
                        // Create version history
                        _b.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_record_updated',
                                user_id: userId,
                                resource_type: 'medical_record',
                                resource_id: recordId,
                                details: {
                                    patient_id: data.patient_id,
                                    changes: Object.keys(updates),
                                    version: data.version
                                }
                            })];
                    case 4:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 5:
                        error_3 = _b.sent();
                        console.error('Error updating medical record:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Unknown error'
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.getPatientMedicalRecords = function (patientId, userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var query, sortBy, sortOrder, _a, data, error, count, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        query = this.supabase
                            .from('medical_records')
                            .select('*, attachments:medical_attachments(*)', { count: 'exact' })
                            .eq('patient_id', patientId)
                            .eq('status', RecordStatus.ACTIVE);
                        if (options === null || options === void 0 ? void 0 : options.recordType) {
                            query = query.eq('record_type', options.recordType);
                        }
                        if (options === null || options === void 0 ? void 0 : options.limit) {
                            query = query.limit(options.limit);
                        }
                        if (options === null || options === void 0 ? void 0 : options.offset) {
                            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
                        }
                        sortBy = (options === null || options === void 0 ? void 0 : options.sortBy) || 'created_at';
                        sortOrder = (options === null || options === void 0 ? void 0 : options.sortOrder) || 'desc';
                        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'patient_records_accessed',
                                user_id: userId,
                                resource_type: 'medical_record',
                                resource_id: patientId,
                                details: {
                                    record_count: (data === null || data === void 0 ? void 0 : data.length) || 0,
                                    filters: options
                                }
                            })];
                    case 2:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data || [], total: count || 0 }];
                    case 3:
                        error_4 = _b.sent();
                        console.error('Error getting patient medical records:', error_4);
                        return [2 /*return*/, {
                                success: false,
                                error: error_4 instanceof Error ? error_4.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // MEDICAL HISTORY MANAGEMENT
    // ========================================================================
    MedicalRecordsManager.prototype.createMedicalHistory = function (historyData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var consentCheck, historyId, now, newHistory, _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.lgpdManager.checkConsent(historyData.patient_id, 'medical_data')];
                    case 1:
                        consentCheck = _b.sent();
                        if (!consentCheck.hasConsent) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Patient consent required for medical history processing'
                                }];
                        }
                        historyId = crypto_1.default.randomUUID();
                        now = new Date().toISOString();
                        newHistory = __assign(__assign({}, historyData), { id: historyId, created_at: now, updated_at: now });
                        return [4 /*yield*/, this.supabase
                                .from('medical_histories')
                                .insert(newHistory)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_history_created',
                                user_id: userId,
                                resource_type: 'medical_history',
                                resource_id: historyId,
                                details: {
                                    patient_id: historyData.patient_id
                                }
                            })];
                    case 3:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 4:
                        error_5 = _b.sent();
                        console.error('Error creating medical history:', error_5);
                        return [2 /*return*/, {
                                success: false,
                                error: error_5 instanceof Error ? error_5.message : 'Unknown error'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.getPatientMedicalHistory = function (patientId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('medical_histories')
                                .select('*')
                                .eq('patient_id', patientId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_history_accessed',
                                user_id: userId,
                                resource_type: 'medical_history',
                                resource_id: patientId,
                                details: {
                                    patient_id: patientId
                                }
                            })];
                    case 2:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data || undefined }];
                    case 3:
                        error_6 = _b.sent();
                        console.error('Error getting medical history:', error_6);
                        return [2 /*return*/, {
                                success: false,
                                error: error_6 instanceof Error ? error_6.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.updateMedicalHistory = function (patientId, updates, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, updatedHistory, _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        now = new Date().toISOString();
                        updatedHistory = __assign(__assign({}, updates), { updated_at: now, last_reviewed_at: now, reviewed_by: userId });
                        return [4 /*yield*/, this.supabase
                                .from('medical_histories')
                                .update(updatedHistory)
                                .eq('patient_id', patientId)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_history_updated',
                                user_id: userId,
                                resource_type: 'medical_history',
                                resource_id: patientId,
                                details: {
                                    patient_id: patientId,
                                    changes: Object.keys(updates)
                                }
                            })];
                    case 2:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 3:
                        error_7 = _b.sent();
                        console.error('Error updating medical history:', error_7);
                        return [2 /*return*/, {
                                success: false,
                                error: error_7 instanceof Error ? error_7.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // ATTACHMENT MANAGEMENT
    // ========================================================================
    MedicalRecordsManager.prototype.uploadMedicalAttachment = function (file, recordId, category, userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var attachmentId, fileName, filePath, _a, uploadData, uploadError, urlData, thumbnailUrl, attachment, _b, data, error, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        attachmentId = crypto_1.default.randomUUID();
                        fileName = "".concat(attachmentId, "-").concat(file.name);
                        filePath = "medical-attachments/".concat(recordId, "/").concat(fileName);
                        return [4 /*yield*/, this.supabase.storage
                                .from('medical-files')
                                .upload(filePath, file)];
                    case 1:
                        _a = _c.sent(), uploadData = _a.data, uploadError = _a.error;
                        if (uploadError)
                            throw uploadError;
                        urlData = this.supabase.storage
                            .from('medical-files')
                            .getPublicUrl(filePath).data;
                        thumbnailUrl = void 0;
                        if (!file.type.startsWith('image/')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generateThumbnail(filePath, file)];
                    case 2:
                        thumbnailUrl = _c.sent();
                        _c.label = 3;
                    case 3:
                        attachment = {
                            id: attachmentId,
                            record_id: recordId,
                            file_name: file.name,
                            file_type: file.type,
                            file_size: file.size,
                            file_url: urlData.publicUrl,
                            thumbnail_url: thumbnailUrl,
                            category: category,
                            description: options === null || options === void 0 ? void 0 : options.description,
                            upload_date: new Date().toISOString(),
                            uploaded_by: userId,
                            version: 1,
                            is_before_after: (options === null || options === void 0 ? void 0 : options.isBeforeAfter) || false,
                            before_after_pair_id: options === null || options === void 0 ? void 0 : options.beforeAfterPairId
                        };
                        return [4 /*yield*/, this.supabase
                                .from('medical_attachments')
                                .insert(attachment)
                                .select()
                                .single()];
                    case 4:
                        _b = _c.sent(), data = _b.data, error = _b.error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_attachment_uploaded',
                                user_id: userId,
                                resource_type: 'medical_attachment',
                                resource_id: attachmentId,
                                details: {
                                    record_id: recordId,
                                    file_name: file.name,
                                    file_size: file.size,
                                    category: category
                                }
                            })];
                    case 5:
                        // Log audit event
                        _c.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 6:
                        error_8 = _c.sent();
                        console.error('Error uploading medical attachment:', error_8);
                        return [2 /*return*/, {
                                success: false,
                                error: error_8 instanceof Error ? error_8.message : 'Unknown error'
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.getRecordAttachments = function (recordId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('medical_attachments')
                                .select('*')
                                .eq('record_id', recordId)
                                .order('upload_date', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: data || [] }];
                    case 2:
                        error_9 = _b.sent();
                        console.error('Error getting record attachments:', error_9);
                        return [2 /*return*/, {
                                success: false,
                                error: error_9 instanceof Error ? error_9.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.deleteAttachment = function (attachmentId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, attachment, getError, filePath, error, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.supabase
                                .from('medical_attachments')
                                .select('*')
                                .eq('id', attachmentId)
                                .single()];
                    case 1:
                        _a = _b.sent(), attachment = _a.data, getError = _a.error;
                        if (getError)
                            throw getError;
                        filePath = attachment.file_url.split('/').slice(-3).join('/');
                        return [4 /*yield*/, this.supabase.storage
                                .from('medical-files')
                                .remove([filePath])
                            // Delete from database
                        ];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.supabase
                                .from('medical_attachments')
                                .delete()
                                .eq('id', attachmentId)];
                    case 3:
                        error = (_b.sent()).error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_attachment_deleted',
                                user_id: userId,
                                resource_type: 'medical_attachment',
                                resource_id: attachmentId,
                                details: {
                                    record_id: attachment.record_id,
                                    file_name: attachment.file_name
                                }
                            })];
                    case 4:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true }];
                    case 5:
                        error_10 = _b.sent();
                        console.error('Error deleting attachment:', error_10);
                        return [2 /*return*/, {
                                success: false,
                                error: error_10 instanceof Error ? error_10.message : 'Unknown error'
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // DIGITAL SIGNATURE
    // ========================================================================
    MedicalRecordsManager.prototype.signMedicalRecord = function (recordId, signerId, signerName, signerRole) {
        return __awaiter(this, void 0, void 0, function () {
            var recordResult, recordContent, signatureHash, signature, _a, data, error, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getMedicalRecord(recordId, signerId)];
                    case 1:
                        recordResult = _b.sent();
                        if (!recordResult.success || !recordResult.data) {
                            return [2 /*return*/, { success: false, error: 'Record not found' }];
                        }
                        recordContent = JSON.stringify(recordResult.data);
                        signatureHash = crypto_1.default
                            .createHash('sha256')
                            .update(recordContent + signerId + new Date().toISOString())
                            .digest('hex');
                        signature = {
                            id: crypto_1.default.randomUUID(),
                            record_id: recordId,
                            signer_id: signerId,
                            signer_name: signerName,
                            signer_role: signerRole,
                            signature_hash: signatureHash,
                            signature_timestamp: new Date().toISOString(),
                            verification_status: 'valid'
                        };
                        return [4 /*yield*/, this.supabase
                                .from('digital_signatures')
                                .insert(signature)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Update record with signature
                        return [4 /*yield*/, this.supabase
                                .from('medical_records')
                                .update({ digital_signature: signature })
                                .eq('id', recordId)
                            // Log audit event
                        ];
                    case 3:
                        // Update record with signature
                        _b.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_record_signed',
                                user_id: signerId,
                                resource_type: 'medical_record',
                                resource_id: recordId,
                                details: {
                                    signer_name: signerName,
                                    signer_role: signerRole,
                                    signature_hash: signatureHash
                                }
                            })];
                    case 4:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 5:
                        error_11 = _b.sent();
                        console.error('Error signing medical record:', error_11);
                        return [2 /*return*/, {
                                success: false,
                                error: error_11 instanceof Error ? error_11.message : 'Unknown error'
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.verifySignature = function (signatureId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, signature, error, recordResult, isValid, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('digital_signatures')
                                .select('*')
                                .eq('id', signatureId)
                                .single()];
                    case 1:
                        _a = _b.sent(), signature = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.getMedicalRecord(signature.record_id, signature.signer_id)];
                    case 2:
                        recordResult = _b.sent();
                        if (!recordResult.success || !recordResult.data) {
                            return [2 /*return*/, { success: false, error: 'Record not found for verification' }];
                        }
                        isValid = signature.verification_status === 'valid';
                        return [2 /*return*/, { success: true, isValid: isValid }];
                    case 3:
                        error_12 = _b.sent();
                        console.error('Error verifying signature:', error_12);
                        return [2 /*return*/, {
                                success: false,
                                error: error_12 instanceof Error ? error_12.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // UTILITY METHODS
    // ========================================================================
    MedicalRecordsManager.prototype.createRecordVersion = function (record, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var versionData, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        versionData = __assign(__assign({}, record), { id: crypto_1.default.randomUUID(), original_record_id: record.id, version_created_at: new Date().toISOString(), version_created_by: userId });
                        return [4 /*yield*/, this.supabase
                                .from('medical_record_versions')
                                .insert(versionData)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        console.error('Error creating record version:', error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.generateThumbnail = function (filePath, file) {
        return __awaiter(this, void 0, void 0, function () {
            var thumbnailPath, data;
            return __generator(this, function (_a) {
                try {
                    thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg');
                    data = this.supabase.storage
                        .from('medical-files')
                        .getPublicUrl(thumbnailPath).data;
                    return [2 /*return*/, data.publicUrl];
                }
                catch (error) {
                    console.error('Error generating thumbnail:', error);
                    return [2 /*return*/, undefined];
                }
                return [2 /*return*/];
            });
        });
    };
    // ========================================================================
    // SEARCH AND ANALYTICS
    // ========================================================================
    MedicalRecordsManager.prototype.searchMedicalRecords = function (query, clinicId, userId, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var dbQuery, _a, data, error, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        dbQuery = this.supabase
                            .from('medical_records')
                            .select('*')
                            .eq('clinic_id', clinicId)
                            .eq('status', RecordStatus.ACTIVE)
                            .or("title.ilike.%".concat(query, "%,description.ilike.%").concat(query, "%,diagnosis.ilike.%").concat(query, "%"));
                        if (filters === null || filters === void 0 ? void 0 : filters.patientId) {
                            dbQuery = dbQuery.eq('patient_id', filters.patientId);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.recordType) {
                            dbQuery = dbQuery.eq('record_type', filters.recordType);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.dateFrom) {
                            dbQuery = dbQuery.gte('created_at', filters.dateFrom);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.dateTo) {
                            dbQuery = dbQuery.lte('created_at', filters.dateTo);
                        }
                        return [4 /*yield*/, dbQuery
                                .order('created_at', { ascending: false })
                                .limit(50)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'medical_records_searched',
                                user_id: userId,
                                resource_type: 'medical_record',
                                resource_id: clinicId,
                                details: {
                                    query: query,
                                    filters: filters,
                                    results_count: (data === null || data === void 0 ? void 0 : data.length) || 0
                                }
                            })];
                    case 2:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data || [] }];
                    case 3:
                        error_14 = _b.sent();
                        console.error('Error searching medical records:', error_14);
                        return [2 /*return*/, {
                                success: false,
                                error: error_14 instanceof Error ? error_14.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MedicalRecordsManager.prototype.getRecordStatistics = function (clinicId, userId, period) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, stats_1, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('medical_records')
                            .select('record_type, created_at')
                            .eq('clinic_id', clinicId)
                            .eq('status', RecordStatus.ACTIVE);
                        if (period) {
                            query = query
                                .gte('created_at', period.from)
                                .lte('created_at', period.to);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        stats_1 = {
                            total_records: (data === null || data === void 0 ? void 0 : data.length) || 0,
                            by_type: {},
                            by_month: {}
                        };
                        data === null || data === void 0 ? void 0 : data.forEach(function (record) {
                            // Count by type
                            stats_1.by_type[record.record_type] =
                                (stats_1.by_type[record.record_type] || 0) + 1;
                            // Count by month
                            var month = new Date(record.created_at).toISOString().slice(0, 7);
                            stats_1.by_month[month] = (stats_1.by_month[month] || 0) + 1;
                        });
                        return [2 /*return*/, { success: true, data: stats_1 }];
                    case 2:
                        error_15 = _b.sent();
                        console.error('Error getting record statistics:', error_15);
                        return [2 /*return*/, {
                                success: false,
                                error: error_15 instanceof Error ? error_15.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return MedicalRecordsManager;
}());
exports.MedicalRecordsManager = MedicalRecordsManager;
// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================
exports.medicalRecordsManager = new MedicalRecordsManager();
exports.default = exports.medicalRecordsManager;
