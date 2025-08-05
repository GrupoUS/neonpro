"use strict";
/**
 * NeonPro Consent Forms System
 * Story 2.2: Medical History & Records - Consent Form Integration
 *
 * Sistema avançado de formulários de consentimento:
 * - Formulários dinâmicos e personalizáveis
 * - Integração com LGPD e privacidade
 * - Assinatura digital integrada
 * - Versionamento de formulários
 * - Auditoria completa
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
exports.consentFormsManager = exports.ConsentFormsManager = exports.LogicAction = exports.LogicCondition = exports.ValidationType = exports.LegalBasisType = exports.DataCategory = exports.FieldType = exports.ConsentMethod = exports.ConsentFormType = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var crypto_1 = require("crypto");
var audit_logger_1 = require("../audit/audit-logger");
var lgpd_manager_1 = require("../auth/lgpd/lgpd-manager");
var digital_signature_1 = require("./digital-signature");
// Enums
var ConsentFormType;
(function (ConsentFormType) {
    ConsentFormType["TREATMENT_CONSENT"] = "treatment_consent";
    ConsentFormType["DATA_PROCESSING"] = "data_processing";
    ConsentFormType["PHOTOGRAPHY"] = "photography";
    ConsentFormType["RESEARCH_PARTICIPATION"] = "research_participation";
    ConsentFormType["MARKETING_COMMUNICATION"] = "marketing_communication";
    ConsentFormType["THIRD_PARTY_SHARING"] = "third_party_sharing";
    ConsentFormType["TELEMEDICINE"] = "telemedicine";
    ConsentFormType["EMERGENCY_CONTACT"] = "emergency_contact";
    ConsentFormType["MINOR_CONSENT"] = "minor_consent";
    ConsentFormType["CUSTOM"] = "custom";
})(ConsentFormType || (exports.ConsentFormType = ConsentFormType = {}));
var ConsentMethod;
(function (ConsentMethod) {
    ConsentMethod["DIGITAL_SIGNATURE"] = "digital_signature";
    ConsentMethod["ELECTRONIC_CONSENT"] = "electronic_consent";
    ConsentMethod["VERBAL_RECORDED"] = "verbal_recorded";
    ConsentMethod["WRITTEN_PHYSICAL"] = "written_physical";
    ConsentMethod["BIOMETRIC"] = "biometric";
    ConsentMethod["WITNESSED"] = "witnessed";
})(ConsentMethod || (exports.ConsentMethod = ConsentMethod = {}));
var FieldType;
(function (FieldType) {
    FieldType["TEXT"] = "text";
    FieldType["TEXTAREA"] = "textarea";
    FieldType["EMAIL"] = "email";
    FieldType["PHONE"] = "phone";
    FieldType["NUMBER"] = "number";
    FieldType["DATE"] = "date";
    FieldType["DATETIME"] = "datetime";
    FieldType["CHECKBOX"] = "checkbox";
    FieldType["RADIO"] = "radio";
    FieldType["SELECT"] = "select";
    FieldType["MULTISELECT"] = "multiselect";
    FieldType["FILE_UPLOAD"] = "file_upload";
    FieldType["SIGNATURE"] = "signature";
    FieldType["CONSENT_CHECKBOX"] = "consent_checkbox";
})(FieldType || (exports.FieldType = FieldType = {}));
var DataCategory;
(function (DataCategory) {
    DataCategory["PERSONAL_DATA"] = "personal_data";
    DataCategory["SENSITIVE_DATA"] = "sensitive_data";
    DataCategory["HEALTH_DATA"] = "health_data";
    DataCategory["BIOMETRIC_DATA"] = "biometric_data";
    DataCategory["CONTACT_DATA"] = "contact_data";
    DataCategory["DEMOGRAPHIC_DATA"] = "demographic_data";
    DataCategory["BEHAVIORAL_DATA"] = "behavioral_data";
    DataCategory["TECHNICAL_DATA"] = "technical_data";
})(DataCategory || (exports.DataCategory = DataCategory = {}));
var LegalBasisType;
(function (LegalBasisType) {
    LegalBasisType["CONSENT"] = "consent";
    LegalBasisType["CONTRACT"] = "contract";
    LegalBasisType["LEGAL_OBLIGATION"] = "legal_obligation";
    LegalBasisType["VITAL_INTERESTS"] = "vital_interests";
    LegalBasisType["PUBLIC_TASK"] = "public_task";
    LegalBasisType["LEGITIMATE_INTERESTS"] = "legitimate_interests";
})(LegalBasisType || (exports.LegalBasisType = LegalBasisType = {}));
var ValidationType;
(function (ValidationType) {
    ValidationType["REQUIRED"] = "required";
    ValidationType["MIN_LENGTH"] = "min_length";
    ValidationType["MAX_LENGTH"] = "max_length";
    ValidationType["PATTERN"] = "pattern";
    ValidationType["EMAIL"] = "email";
    ValidationType["PHONE"] = "phone";
    ValidationType["DATE_RANGE"] = "date_range";
    ValidationType["NUMERIC_RANGE"] = "numeric_range";
    ValidationType["CUSTOM"] = "custom";
})(ValidationType || (exports.ValidationType = ValidationType = {}));
var LogicCondition;
(function (LogicCondition) {
    LogicCondition["EQUALS"] = "equals";
    LogicCondition["NOT_EQUALS"] = "not_equals";
    LogicCondition["CONTAINS"] = "contains";
    LogicCondition["GREATER_THAN"] = "greater_than";
    LogicCondition["LESS_THAN"] = "less_than";
    LogicCondition["IS_EMPTY"] = "is_empty";
    LogicCondition["IS_NOT_EMPTY"] = "is_not_empty";
})(LogicCondition || (exports.LogicCondition = LogicCondition = {}));
var LogicAction;
(function (LogicAction) {
    LogicAction["SHOW"] = "show";
    LogicAction["HIDE"] = "hide";
    LogicAction["REQUIRE"] = "require";
    LogicAction["DISABLE"] = "disable";
    LogicAction["SET_VALUE"] = "set_value";
})(LogicAction || (exports.LogicAction = LogicAction = {}));
// ============================================================================
// CONSENT FORMS MANAGER
// ============================================================================
var ConsentFormsManager = /** @class */ (function () {
    function ConsentFormsManager() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        this.auditLogger = new audit_logger_1.AuditLogger();
        this.lgpdManager = new lgpd_manager_1.LGPDManager();
        this.signatureManager = new digital_signature_1.DigitalSignatureManager();
    }
    // ========================================================================
    // FORM MANAGEMENT
    // ========================================================================
    ConsentFormsManager.prototype.createConsentForm = function (clinicId, formData, createdBy) {
        return __awaiter(this, void 0, void 0, function () {
            var formId, now, form, validation, _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        formId = crypto_1.default.randomUUID();
                        now = new Date().toISOString();
                        form = __assign(__assign({}, formData), { id: formId, clinic_id: clinicId, created_at: now, updated_at: now });
                        return [4 /*yield*/, this.validateFormStructure(form)];
                    case 1:
                        validation = _b.sent();
                        if (!validation.isValid) {
                            return [2 /*return*/, { success: false, error: validation.error }];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('consent_forms')
                                .insert(form)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'consent_form_created',
                                user_id: createdBy,
                                resource_type: 'consent_form',
                                resource_id: formId,
                                details: {
                                    clinic_id: clinicId,
                                    form_type: formData.form_type,
                                    version: formData.version,
                                    fields_count: formData.fields.length
                                }
                            })];
                    case 3:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Error creating consent form:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ConsentFormsManager.prototype.getConsentForm = function (formId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('consent_forms')
                                .select('*')
                                .eq('id', formId)
                                .eq('is_active', true)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!data) {
                            return [2 /*return*/, { success: false, error: 'Consent form not found' }];
                        }
                        return [2 /*return*/, { success: true, data: data }];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error getting consent form:', error_2);
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConsentFormsManager.prototype.getClinicConsentForms = function (clinicId_1, formType_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, formType, activeOnly) {
            var query, _a, data, error, error_3;
            if (activeOnly === void 0) { activeOnly = true; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('consent_forms')
                            .select('*')
                            .eq('clinic_id', clinicId);
                        if (activeOnly) {
                            query = query.eq('is_active', true);
                        }
                        if (formType) {
                            query = query.eq('form_type', formType);
                        }
                        return [4 /*yield*/, query
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: data || [] }];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error getting clinic consent forms:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConsentFormsManager.prototype.updateConsentForm = function (formId, updates, updatedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var currentForm, updatedData, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getConsentForm(formId)];
                    case 1:
                        currentForm = _b.sent();
                        if (!currentForm.success || !currentForm.data) {
                            return [2 /*return*/, { success: false, error: 'Consent form not found' }];
                        }
                        updatedData = __assign(__assign({}, updates), { updated_at: new Date().toISOString() });
                        if (!(updates.content || updates.fields)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createFormVersion(formId, currentForm.data, updatedBy)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this.supabase
                            .from('consent_forms')
                            .update(updatedData)
                            .eq('id', formId)
                            .select()
                            .single()];
                    case 4:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'consent_form_updated',
                                user_id: updatedBy,
                                resource_type: 'consent_form',
                                resource_id: formId,
                                details: {
                                    changes: Object.keys(updates),
                                    version: data.version
                                }
                            })];
                    case 5:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 6:
                        error_4 = _b.sent();
                        console.error('Error updating consent form:', error_4);
                        return [2 /*return*/, {
                                success: false,
                                error: error_4 instanceof Error ? error_4.message : 'Unknown error'
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // CONSENT RESPONSE MANAGEMENT
    // ========================================================================
    ConsentFormsManager.prototype.submitConsentResponse = function (formId, patientId, responses, consentMethod, options) {
        return __awaiter(this, void 0, void 0, function () {
            var formResult, form, responseId, now, validation, consentGiven, expiresAt, consentResponse, _a, data, error, signatureResult, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, this.getConsentForm(formId)];
                    case 1:
                        formResult = _b.sent();
                        if (!formResult.success || !formResult.data) {
                            return [2 /*return*/, { success: false, error: 'Consent form not found' }];
                        }
                        form = formResult.data;
                        responseId = crypto_1.default.randomUUID();
                        now = new Date().toISOString();
                        return [4 /*yield*/, this.validateResponses(form, responses)];
                    case 2:
                        validation = _b.sent();
                        if (!validation.isValid) {
                            return [2 /*return*/, { success: false, error: validation.error }];
                        }
                        consentGiven = this.checkConsentGiven(form, responses);
                        expiresAt = form.retention_period > 0 ?
                            new Date(Date.now() + form.retention_period * 24 * 60 * 60 * 1000).toISOString() :
                            undefined;
                        consentResponse = {
                            id: responseId,
                            form_id: formId,
                            patient_id: patientId,
                            clinic_id: form.clinic_id,
                            responses: responses,
                            consent_given: consentGiven,
                            consent_date: now,
                            consent_method: consentMethod,
                            ip_address: options === null || options === void 0 ? void 0 : options.ipAddress,
                            user_agent: options === null || options === void 0 ? void 0 : options.userAgent,
                            geolocation: options === null || options === void 0 ? void 0 : options.geolocation,
                            witness_id: options === null || options === void 0 ? void 0 : options.witnessId,
                            witness_name: options === null || options === void 0 ? void 0 : options.witnessName,
                            is_valid: true,
                            expires_at: expiresAt,
                            created_at: now,
                            updated_at: now
                        };
                        return [4 /*yield*/, this.supabase
                                .from('consent_responses')
                                .insert(consentResponse)
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!((options === null || options === void 0 ? void 0 : options.requireSignature) && consentGiven)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.signatureManager.signDocument(responseId, // Use response ID as document ID
                            patientId, "Patient Consent - ".concat(form.title), '', // Email would be retrieved from patient data
                            digital_signature_1.SignerRole.PATIENT, {
                                signatureType: digital_signature_1.SignatureType.ELECTRONIC_SIGNATURE,
                                includeTimestamp: true,
                                includeGeolocation: !!(options === null || options === void 0 ? void 0 : options.geolocation)
                            })];
                    case 4:
                        signatureResult = _b.sent();
                        if (!(signatureResult.success && signatureResult.data)) return [3 /*break*/, 6];
                        // Update response with signature ID
                        return [4 /*yield*/, this.supabase
                                .from('consent_responses')
                                .update({ signature_id: signatureResult.data.id })
                                .eq('id', responseId)];
                    case 5:
                        // Update response with signature ID
                        _b.sent();
                        consentResponse.signature_id = signatureResult.data.id;
                        _b.label = 6;
                    case 6: 
                    // Update LGPD consent records
                    return [4 /*yield*/, this.updateLGPDConsent(patientId, form, responses, consentGiven)
                        // Log audit event
                    ];
                    case 7:
                        // Update LGPD consent records
                        _b.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'consent_response_submitted',
                                user_id: patientId,
                                resource_type: 'consent_response',
                                resource_id: responseId,
                                details: {
                                    form_id: formId,
                                    form_type: form.form_type,
                                    consent_given: consentGiven,
                                    consent_method: consentMethod,
                                    has_signature: !!consentResponse.signature_id
                                }
                            })];
                    case 8:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: consentResponse }];
                    case 9:
                        error_5 = _b.sent();
                        console.error('Error submitting consent response:', error_5);
                        return [2 /*return*/, {
                                success: false,
                                error: error_5 instanceof Error ? error_5.message : 'Unknown error'
                            }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    ConsentFormsManager.prototype.getPatientConsentResponses = function (patientId_1, formType_1) {
        return __awaiter(this, arguments, void 0, function (patientId, formType, activeOnly) {
            var query, _a, data, error, error_6;
            if (activeOnly === void 0) { activeOnly = true; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('consent_responses')
                            .select("\n          *,\n          consent_form:consent_forms(*)\n        ")
                            .eq('patient_id', patientId);
                        if (activeOnly) {
                            query = query.is('withdrawn_at', null);
                        }
                        if (formType) {
                            query = query.eq('consent_forms.form_type', formType);
                        }
                        return [4 /*yield*/, query
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: data || [] }];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error getting patient consent responses:', error_6);
                        return [2 /*return*/, {
                                success: false,
                                error: error_6 instanceof Error ? error_6.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConsentFormsManager.prototype.withdrawConsent = function (responseId, patientId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var now, error, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        now = new Date().toISOString();
                        return [4 /*yield*/, this.supabase
                                .from('consent_responses')
                                .update({
                                withdrawn_at: now,
                                withdrawal_reason: reason,
                                is_valid: false,
                                updated_at: now
                            })
                                .eq('id', responseId)
                                .eq('patient_id', patientId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Update LGPD records
                        return [4 /*yield*/, this.lgpdManager.withdrawConsent(patientId, 'medical_data', reason)
                            // Log audit event
                        ];
                    case 2:
                        // Update LGPD records
                        _a.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'consent_withdrawn',
                                user_id: patientId,
                                resource_type: 'consent_response',
                                resource_id: responseId,
                                details: {
                                    reason: reason,
                                    withdrawn_at: now
                                }
                            })];
                    case 3:
                        // Log audit event
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_7 = _a.sent();
                        console.error('Error withdrawing consent:', error_7);
                        return [2 /*return*/, {
                                success: false,
                                error: error_7 instanceof Error ? error_7.message : 'Unknown error'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // FORM TEMPLATES
    // ========================================================================
    ConsentFormsManager.prototype.createFormTemplate = function (templateType_1) {
        return __awaiter(this, arguments, void 0, function (templateType, language) {
            var template;
            if (language === void 0) { language = 'pt-BR'; }
            return __generator(this, function (_a) {
                try {
                    template = this.getFormTemplate(templateType, language);
                    return [2 /*return*/, { success: true, data: template }];
                }
                catch (error) {
                    console.error('Error creating form template:', error);
                    return [2 /*return*/, {
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    ConsentFormsManager.prototype.getFormTemplate = function (templateType, language) {
        var baseTemplate = {
            form_type: templateType,
            language: language,
            version: '1.0',
            is_active: true,
            is_required: true,
            retention_period: 3650 // 10 years default
        };
        switch (templateType) {
            case ConsentFormType.TREATMENT_CONSENT:
                return __assign(__assign({}, baseTemplate), { title: 'Termo de Consentimento para Tratamento', description: 'Consentimento informado para procedimentos médicos', content: this.getTreatmentConsentContent(), fields: this.getTreatmentConsentFields(), legal_basis: [
                        {
                            type: LegalBasisType.CONSENT,
                            description: 'Consentimento do titular para tratamento de dados de saúde',
                            article_reference: 'Art. 7º, I e Art. 11º, I da LGPD',
                            purpose: 'Prestação de cuidados médicos',
                            data_categories: [DataCategory.HEALTH_DATA, DataCategory.PERSONAL_DATA]
                        }
                    ] });
            case ConsentFormType.DATA_PROCESSING:
                return __assign(__assign({}, baseTemplate), { title: 'Consentimento para Tratamento de Dados Pessoais', description: 'Autorização para coleta e processamento de dados pessoais', content: this.getDataProcessingContent(), fields: this.getDataProcessingFields(), legal_basis: [
                        {
                            type: LegalBasisType.CONSENT,
                            description: 'Consentimento livre, informado e inequívoco',
                            article_reference: 'Art. 7º, I da LGPD',
                            purpose: 'Prestação de serviços médicos e administrativos',
                            data_categories: [DataCategory.PERSONAL_DATA, DataCategory.CONTACT_DATA]
                        }
                    ] });
            case ConsentFormType.PHOTOGRAPHY:
                return __assign(__assign({}, baseTemplate), { title: 'Autorização para Uso de Imagem', description: 'Consentimento para captura e uso de fotografias médicas', content: this.getPhotographyContent(), fields: this.getPhotographyFields(), legal_basis: [
                        {
                            type: LegalBasisType.CONSENT,
                            description: 'Consentimento específico para uso de imagem',
                            article_reference: 'Art. 7º, I da LGPD e Art. 20 do CC',
                            purpose: 'Documentação médica e acompanhamento de tratamento',
                            data_categories: [DataCategory.BIOMETRIC_DATA, DataCategory.HEALTH_DATA]
                        }
                    ] });
            default:
                return __assign(__assign({}, baseTemplate), { title: 'Formulário de Consentimento', description: 'Formulário personalizado de consentimento', content: this.getGenericContent(), fields: this.getGenericFields(), legal_basis: [
                        {
                            type: LegalBasisType.CONSENT,
                            description: 'Consentimento do titular',
                            purpose: 'Conforme especificado no formulário',
                            data_categories: [DataCategory.PERSONAL_DATA]
                        }
                    ] });
        }
    };
    // ========================================================================
    // TEMPLATE CONTENT GENERATORS
    // ========================================================================
    ConsentFormsManager.prototype.getTreatmentConsentContent = function () {
        return {
            introduction: 'Este documento tem por objetivo obter seu consentimento livre e esclarecido para a realização do tratamento médico proposto.',
            sections: [
                {
                    id: 'treatment-info',
                    title: 'Informações sobre o Tratamento',
                    content: 'Descrição detalhada do procedimento, riscos, benefícios e alternativas.',
                    order: 1,
                    is_required: true
                },
                {
                    id: 'risks-benefits',
                    title: 'Riscos e Benefícios',
                    content: 'Explicação dos possíveis riscos e benefícios do tratamento.',
                    order: 2,
                    is_required: true
                },
                {
                    id: 'alternatives',
                    title: 'Alternativas de Tratamento',
                    content: 'Outras opções de tratamento disponíveis.',
                    order: 3,
                    is_required: true
                }
            ],
            conclusion: 'Declaro que recebi todas as informações necessárias e concordo com o tratamento proposto.',
            legal_notice: 'Este consentimento está em conformidade com a LGPD e regulamentações médicas.',
            contact_info: {
                clinic_name: 'Clínica NeonPro',
                address: 'Endereço da clínica',
                phone: '(11) 9999-9999',
                email: 'contato@neonpro.com.br',
                dpo_contact: 'dpo@neonpro.com.br'
            }
        };
    };
    ConsentFormsManager.prototype.getTreatmentConsentFields = function () {
        return [
            {
                id: 'patient-name',
                name: 'patient_name',
                label: 'Nome Completo do Paciente',
                type: FieldType.TEXT,
                validation: { required: true, min_length: 2 },
                is_required: true,
                order: 1,
                data_category: DataCategory.PERSONAL_DATA
            },
            {
                id: 'treatment-understanding',
                name: 'treatment_understanding',
                label: 'Declaro que compreendi as informações sobre o tratamento',
                type: FieldType.CONSENT_CHECKBOX,
                validation: { required: true },
                is_required: true,
                order: 2,
                data_category: DataCategory.HEALTH_DATA
            },
            {
                id: 'risks-understanding',
                name: 'risks_understanding',
                label: 'Declaro que compreendi os riscos e benefícios',
                type: FieldType.CONSENT_CHECKBOX,
                validation: { required: true },
                is_required: true,
                order: 3,
                data_category: DataCategory.HEALTH_DATA
            },
            {
                id: 'consent-signature',
                name: 'consent_signature',
                label: 'Assinatura Digital',
                type: FieldType.SIGNATURE,
                validation: { required: true },
                is_required: true,
                order: 4,
                data_category: DataCategory.BIOMETRIC_DATA
            }
        ];
    };
    ConsentFormsManager.prototype.getDataProcessingContent = function () {
        return {
            introduction: 'Solicitamos seu consentimento para o tratamento de seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).',
            sections: [
                {
                    id: 'data-collection',
                    title: 'Coleta de Dados',
                    content: 'Informações sobre quais dados são coletados e como.',
                    order: 1,
                    is_required: true
                },
                {
                    id: 'data-usage',
                    title: 'Uso dos Dados',
                    content: 'Como seus dados serão utilizados pela clínica.',
                    order: 2,
                    is_required: true
                },
                {
                    id: 'data-sharing',
                    title: 'Compartilhamento',
                    content: 'Com quem seus dados podem ser compartilhados.',
                    order: 3,
                    is_required: true
                },
                {
                    id: 'data-rights',
                    title: 'Seus Direitos',
                    content: 'Direitos do titular dos dados conforme a LGPD.',
                    order: 4,
                    is_required: true
                }
            ],
            conclusion: 'Ao concordar, você autoriza o tratamento de seus dados pessoais conforme descrito.',
            legal_notice: 'Este consentimento está em conformidade com a LGPD (Lei 13.709/2018).',
            privacy_policy_link: 'https://neonpro.com.br/privacidade',
            contact_info: {
                clinic_name: 'Clínica NeonPro',
                address: 'Endereço da clínica',
                phone: '(11) 9999-9999',
                email: 'contato@neonpro.com.br',
                dpo_contact: 'dpo@neonpro.com.br'
            }
        };
    };
    ConsentFormsManager.prototype.getDataProcessingFields = function () {
        return [
            {
                id: 'data-collection-consent',
                name: 'data_collection_consent',
                label: 'Autorizo a coleta de meus dados pessoais',
                type: FieldType.CONSENT_CHECKBOX,
                validation: { required: true },
                is_required: true,
                order: 1,
                data_category: DataCategory.PERSONAL_DATA
            },
            {
                id: 'data-processing-consent',
                name: 'data_processing_consent',
                label: 'Autorizo o processamento de meus dados para prestação de serviços',
                type: FieldType.CONSENT_CHECKBOX,
                validation: { required: true },
                is_required: true,
                order: 2,
                data_category: DataCategory.PERSONAL_DATA
            },
            {
                id: 'marketing-consent',
                name: 'marketing_consent',
                label: 'Autorizo o envio de comunicações de marketing (opcional)',
                type: FieldType.CHECKBOX,
                validation: { required: false },
                is_required: false,
                order: 3,
                data_category: DataCategory.CONTACT_DATA
            }
        ];
    };
    ConsentFormsManager.prototype.getPhotographyContent = function () {
        return {
            introduction: 'Solicitamos sua autorização para captura e uso de fotografias para fins médicos.',
            sections: [
                {
                    id: 'photo-purpose',
                    title: 'Finalidade das Fotografias',
                    content: 'As fotografias serão utilizadas para documentação médica e acompanhamento do tratamento.',
                    order: 1,
                    is_required: true
                },
                {
                    id: 'photo-storage',
                    title: 'Armazenamento e Segurança',
                    content: 'Como as imagens serão armazenadas e protegidas.',
                    order: 2,
                    is_required: true
                }
            ],
            conclusion: 'Autorizo a captura e uso das fotografias conforme descrito.',
            legal_notice: 'Esta autorização respeita seus direitos de imagem e privacidade.',
            contact_info: {
                clinic_name: 'Clínica NeonPro',
                address: 'Endereço da clínica',
                phone: '(11) 9999-9999',
                email: 'contato@neonpro.com.br'
            }
        };
    };
    ConsentFormsManager.prototype.getPhotographyFields = function () {
        return [
            {
                id: 'photo-consent',
                name: 'photo_consent',
                label: 'Autorizo a captura de fotografias médicas',
                type: FieldType.CONSENT_CHECKBOX,
                validation: { required: true },
                is_required: true,
                order: 1,
                data_category: DataCategory.BIOMETRIC_DATA
            },
            {
                id: 'photo-usage',
                name: 'photo_usage',
                label: 'Autorizo o uso das fotografias para documentação médica',
                type: FieldType.CONSENT_CHECKBOX,
                validation: { required: true },
                is_required: true,
                order: 2,
                data_category: DataCategory.BIOMETRIC_DATA
            }
        ];
    };
    ConsentFormsManager.prototype.getGenericContent = function () {
        return {
            introduction: 'Formulário de consentimento personalizado.',
            sections: [],
            conclusion: 'Declaro meu consentimento conforme especificado.',
            legal_notice: 'Este formulário está em conformidade com a legislação aplicável.',
            contact_info: {
                clinic_name: 'Clínica NeonPro',
                address: 'Endereço da clínica',
                phone: '(11) 9999-9999',
                email: 'contato@neonpro.com.br'
            }
        };
    };
    ConsentFormsManager.prototype.getGenericFields = function () {
        return [
            {
                id: 'generic-consent',
                name: 'generic_consent',
                label: 'Declaro meu consentimento',
                type: FieldType.CONSENT_CHECKBOX,
                validation: { required: true },
                is_required: true,
                order: 1,
                data_category: DataCategory.PERSONAL_DATA
            }
        ];
    };
    // ========================================================================
    // VALIDATION METHODS
    // ========================================================================
    ConsentFormsManager.prototype.validateFormStructure = function (form) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, field;
            return __generator(this, function (_b) {
                try {
                    // Check required fields
                    if (!form.title || !form.content || !form.fields) {
                        return [2 /*return*/, { isValid: false, error: 'Missing required form fields' }];
                    }
                    // Validate fields structure
                    for (_i = 0, _a = form.fields; _i < _a.length; _i++) {
                        field = _a[_i];
                        if (!field.name || !field.label || !field.type) {
                            return [2 /*return*/, { isValid: false, error: "Invalid field structure: ".concat(field.id) }];
                        }
                    }
                    // Validate legal basis
                    if (!form.legal_basis || form.legal_basis.length === 0) {
                        return [2 /*return*/, { isValid: false, error: 'At least one legal basis is required' }];
                    }
                    return [2 /*return*/, { isValid: true }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            isValid: false,
                            error: error instanceof Error ? error.message : 'Validation error'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    ConsentFormsManager.prototype.validateResponses = function (form, responses) {
        return __awaiter(this, void 0, void 0, function () {
            var requiredFields, _loop_1, this_1, _i, requiredFields_1, field, state_1;
            return __generator(this, function (_a) {
                try {
                    requiredFields = form.fields.filter(function (f) { return f.is_required; });
                    _loop_1 = function (field) {
                        var response = responses.find(function (r) { return r.field_id === field.id; });
                        if (!response || !response.value) {
                            return { value: { isValid: false, error: "Required field missing: ".concat(field.label) } };
                        }
                        // Validate field-specific rules
                        var validation = this_1.validateFieldResponse(field, response.value);
                        if (!validation.isValid) {
                            return { value: { isValid: false, error: validation.error } };
                        }
                    };
                    this_1 = this;
                    for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
                        field = requiredFields_1[_i];
                        state_1 = _loop_1(field);
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                    }
                    return [2 /*return*/, { isValid: true }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            isValid: false,
                            error: error instanceof Error ? error.message : 'Response validation error'
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    ConsentFormsManager.prototype.validateFieldResponse = function (field, value) {
        try {
            var validation = field.validation;
            // Required check
            if (validation.required && (!value || value === '')) {
                return { isValid: false, error: "".concat(field.label, " is required") };
            }
            // Type-specific validation
            switch (field.type) {
                case FieldType.EMAIL:
                    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (value && !emailRegex.test(value)) {
                        return { isValid: false, error: "".concat(field.label, " must be a valid email") };
                    }
                    break;
                case FieldType.PHONE:
                    var phoneRegex = /^\+?[1-9]\d{1,14}$/;
                    if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
                        return { isValid: false, error: "".concat(field.label, " must be a valid phone number") };
                    }
                    break;
                case FieldType.NUMBER:
                    if (value && isNaN(Number(value))) {
                        return { isValid: false, error: "".concat(field.label, " must be a number") };
                    }
                    if (validation.min_value !== undefined && Number(value) < validation.min_value) {
                        return { isValid: false, error: "".concat(field.label, " must be at least ").concat(validation.min_value) };
                    }
                    if (validation.max_value !== undefined && Number(value) > validation.max_value) {
                        return { isValid: false, error: "".concat(field.label, " must be at most ").concat(validation.max_value) };
                    }
                    break;
                case FieldType.TEXT:
                case FieldType.TEXTAREA:
                    if (validation.min_length && value.length < validation.min_length) {
                        return { isValid: false, error: "".concat(field.label, " must be at least ").concat(validation.min_length, " characters") };
                    }
                    if (validation.max_length && value.length > validation.max_length) {
                        return { isValid: false, error: "".concat(field.label, " must be at most ").concat(validation.max_length, " characters") };
                    }
                    if (validation.pattern) {
                        var regex = new RegExp(validation.pattern);
                        if (!regex.test(value)) {
                            return { isValid: false, error: "".concat(field.label, " format is invalid") };
                        }
                    }
                    break;
            }
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Field validation error'
            };
        }
    };
    ConsentFormsManager.prototype.checkConsentGiven = function (form, responses) {
        try {
            // Check if all required consent fields are true
            var consentFields = form.fields.filter(function (f) { return f.type === FieldType.CONSENT_CHECKBOX && f.is_required; });
            var _loop_2 = function (field) {
                var response = responses.find(function (r) { return r.field_id === field.id; });
                if (!response || !response.value || response.value !== true) {
                    return { value: false };
                }
            };
            for (var _i = 0, consentFields_1 = consentFields; _i < consentFields_1.length; _i++) {
                var field = consentFields_1[_i];
                var state_2 = _loop_2(field);
                if (typeof state_2 === "object")
                    return state_2.value;
            }
            return true;
        }
        catch (error) {
            console.error('Error checking consent:', error);
            return false;
        }
    };
    // ========================================================================
    // UTILITY METHODS
    // ========================================================================
    ConsentFormsManager.prototype.createFormVersion = function (formId, currentForm, updatedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var versionId, version, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        versionId = crypto_1.default.randomUUID();
                        version = {
                            id: versionId,
                            form_id: formId,
                            version_number: currentForm.version,
                            content: currentForm.content,
                            fields: currentForm.fields,
                            created_by: updatedBy,
                            created_at: new Date().toISOString()
                        };
                        return [4 /*yield*/, this.supabase
                                .from('consent_form_versions')
                                .insert(version)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Error creating form version:', error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConsentFormsManager.prototype.updateLGPDConsent = function (patientId, form, responses, consentGiven) {
        return __awaiter(this, void 0, void 0, function () {
            var dataCategories_2, _i, dataCategories_1, category, error_9;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        dataCategories_2 = new Set();
                        responses.forEach(function (response) {
                            if (response.consent_given) {
                                dataCategories_2.add(response.data_category);
                            }
                        });
                        _i = 0, dataCategories_1 = dataCategories_2;
                        _b.label = 1;
                    case 1:
                        if (!(_i < dataCategories_1.length)) return [3 /*break*/, 4];
                        category = dataCategories_1[_i];
                        if (!consentGiven) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.lgpdManager.recordConsent(patientId, category, ((_a = form.legal_basis[0]) === null || _a === void 0 ? void 0 : _a.purpose) || 'Medical services', form.retention_period)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_9 = _b.sent();
                        console.error('Error updating LGPD consent:', error_9);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // ANALYTICS AND REPORTING
    // ========================================================================
    ConsentFormsManager.prototype.getConsentStatistics = function (clinicId, period) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, stats_1, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('consent_responses')
                            .select('form_id, consent_given, consent_method, created_at')
                            .eq('clinic_id', clinicId);
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
                            total_responses: (data === null || data === void 0 ? void 0 : data.length) || 0,
                            consent_given: (data === null || data === void 0 ? void 0 : data.filter(function (r) { return r.consent_given; }).length) || 0,
                            consent_denied: (data === null || data === void 0 ? void 0 : data.filter(function (r) { return !r.consent_given; }).length) || 0,
                            by_method: {},
                            by_month: {}
                        };
                        data === null || data === void 0 ? void 0 : data.forEach(function (response) {
                            // Count by method
                            stats_1.by_method[response.consent_method] =
                                (stats_1.by_method[response.consent_method] || 0) + 1;
                            // Count by month
                            var month = new Date(response.created_at).toISOString().slice(0, 7);
                            stats_1.by_month[month] = (stats_1.by_month[month] || 0) + 1;
                        });
                        return [2 /*return*/, { success: true, data: stats_1 }];
                    case 2:
                        error_10 = _b.sent();
                        console.error('Error getting consent statistics:', error_10);
                        return [2 /*return*/, {
                                success: false,
                                error: error_10 instanceof Error ? error_10.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ConsentFormsManager;
}());
exports.ConsentFormsManager = ConsentFormsManager;
// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================
exports.consentFormsManager = new ConsentFormsManager();
exports.default = exports.consentFormsManager;
