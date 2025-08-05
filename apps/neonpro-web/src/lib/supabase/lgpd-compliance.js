"use strict";
// lib/supabase/lgpd-compliance.ts
// LGPD (Lei Geral de Proteção de Dados) Compliance Utilities for NeonPro
// Provides comprehensive audit logging, consent management, and data protection features
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
exports.lgpdUtils = exports.HealthcareLGPDHooks = exports.LGPDComplianceManager = void 0;
var client_1 = require("@/lib/supabase/client");
// LGPD Compliance Manager Class
var LGPDComplianceManager = /** @class */ (function () {
    function LGPDComplianceManager(serverSide) {
        if (serverSide === void 0) { serverSide = false; }
        this.isServerSide = serverSide;
        if (serverSide) {
            // Note: Server client needs to be created differently
            this.supabase = (0, client_1.createClient)();
        }
        else {
            this.supabase = (0, client_1.createClient)();
        }
    }
    /**
     * Create LGPD audit log entry
     * Complies with LGPD Article 37 - Data Processing Records
     */
    LGPDComplianceManager.prototype.createAuditLog = function (logEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var user, enhancedEntry, error, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase.auth.getUser()
                            // Enhance log entry with compliance metadata
                        ];
                    case 1:
                        user = (_b.sent()).data.user;
                        enhancedEntry = __assign(__assign({}, logEntry), { user_id: logEntry.user_id || (user === null || user === void 0 ? void 0 : user.id) || 'anonymous', created_at: new Date().toISOString(), encryption_status: true, metadata: __assign(__assign({}, logEntry.metadata), { compliance_version: '1.0', lgpd_article: this.getLGPDArticle(logEntry.event_type), timestamp_utc: new Date().toISOString(), user_role: ((_a = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _a === void 0 ? void 0 : _a.role) || 'unknown', application: 'NeonPro', environment: process.env.NODE_ENV || 'development' }) });
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_audit_logs')
                                .insert(enhancedEntry)];
                    case 2:
                        error = (_b.sent()).error;
                        if (error) {
                            console.error('LGPD Audit Log Error:', error);
                            return [2 /*return*/, { success: false, error: error.message }];
                        }
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_1 = _b.sent();
                        console.error('LGPD Audit Log Exception:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log patient data access for LGPD compliance
     * Critical for healthcare data protection
     */
    LGPDComplianceManager.prototype.logPatientDataAccess = function (patientId, clinicId, accessType, tableAccessed, recordId, purpose) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createAuditLog({
                            event_type: 'patient_record_access',
                            patient_id: patientId,
                            clinic_id: clinicId,
                            table_name: tableAccessed,
                            record_id: recordId,
                            action: accessType,
                            purpose: purpose || 'Medical care provision',
                            legal_basis: 'Article 11, II - Protection of life or physical safety',
                            retention_period: '20_years', // Medical records retention
                            data_subject_rights: 'access'
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log consent management actions
     * Ensures compliance with LGPD Article 8 - Consent requirements
     */
    LGPDComplianceManager.prototype.logConsentAction = function (patientId, clinicId, consentType, action, consentDetails) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createAuditLog({
                            event_type: action === 'granted' ? 'consent_granted' : 'consent_revoked',
                            patient_id: patientId,
                            clinic_id: clinicId,
                            table_name: 'patient_consents',
                            action: action,
                            consent_type: consentType,
                            new_values: consentDetails,
                            legal_basis: 'Article 8 - Consent',
                            purpose: 'Consent management and compliance',
                            retention_period: 'indefinite_or_until_withdrawal'
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log authentication events for security audit
     */
    LGPDComplianceManager.prototype.logAuthenticationEvent = function (userId, action, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createAuditLog({
                            event_type: 'user_authentication',
                            user_id: userId,
                            table_name: 'auth.users',
                            action: action,
                            purpose: 'Security and access control',
                            legal_basis: 'Legitimate interest - Security',
                            retention_period: '5_years',
                            metadata: __assign(__assign({}, metadata), { security_event: true })
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Log sensitive data access (financial, medical procedures)
     */
    LGPDComplianceManager.prototype.logSensitiveDataAccess = function (userId, patientId, clinicId, dataType, action, recordId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createAuditLog({
                            event_type: 'sensitive_data_access',
                            user_id: userId,
                            patient_id: patientId,
                            clinic_id: clinicId,
                            table_name: "sensitive_".concat(dataType),
                            record_id: recordId,
                            action: action,
                            purpose: 'Healthcare service provision',
                            legal_basis: 'Article 11, II - Protection of life or physical safety',
                            retention_period: '20_years',
                            metadata: {
                                sensitivity_level: 'high',
                                data_category: dataType
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle data subject rights requests
     * Implements LGPD Articles 17-22 (Data Subject Rights)
     */
    LGPDComplianceManager.prototype.processDataSubjectRequest = function (patientId, clinicId, requestType, requestDetails) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        // Log the data subject rights request
                        return [4 /*yield*/, this.createAuditLog({
                                event_type: 'data_access',
                                patient_id: patientId,
                                clinic_id: clinicId,
                                table_name: 'data_subject_requests',
                                action: "data_subject_".concat(requestType),
                                data_subject_rights: requestType,
                                purpose: 'Data subject rights fulfillment',
                                legal_basis: "Article ".concat(this.getDataSubjectRightsArticle(requestType)),
                                new_values: requestDetails
                            })];
                    case 1:
                        // Log the data subject rights request
                        _b.sent();
                        _a = requestType;
                        switch (_a) {
                            case 'access': return [3 /*break*/, 2];
                            case 'erasure': return [3 /*break*/, 4];
                            case 'portability': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2: return [4 /*yield*/, this.exportPatientData(patientId, clinicId)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.anonymizePatientData(patientId, clinicId)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.exportPatientDataPortable(patientId, clinicId)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [2 /*return*/, {
                            success: false,
                            error: "Data subject right ".concat(requestType, " not yet implemented")
                        }];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_2 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error'
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Export patient data for LGPD compliance (Data Portability)
     */
    LGPDComplianceManager.prototype.exportPatientData = function (patientId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, patientData, patientError, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .select('*')
                                .eq('id', patientId)
                                .eq('clinic_id', clinicId)
                                .single()];
                    case 1:
                        _a = _b.sent(), patientData = _a.data, patientError = _a.error;
                        if (patientError) {
                            return [2 /*return*/, { success: false, error: patientError.message }];
                        }
                        // Log data export for audit trail
                        return [4 /*yield*/, this.logSensitiveDataAccess(patientData.user_id || 'system', patientId, clinicId, 'medical_procedure', 'data_export')];
                    case 2:
                        // Log data export for audit trail
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    patient: patientData,
                                    exported_at: new Date().toISOString(),
                                    export_format: 'JSON',
                                    lgpd_compliance: true
                                }
                            }];
                    case 3:
                        error_3 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Export failed'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Anonymize patient data for erasure requests
     */
    LGPDComplianceManager.prototype.anonymizePatientData = function (patientId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .update({
                                name: 'ANONYMIZED',
                                email: null,
                                phone: null,
                                cpf: null,
                                address: null,
                                anonymized_at: new Date().toISOString(),
                                anonymization_reason: 'LGPD_ERASURE_REQUEST'
                            })
                                .eq('id', patientId)
                                .eq('clinic_id', clinicId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            return [2 /*return*/, { success: false, error: error.message }];
                        }
                        // Log anonymization action
                        return [4 /*yield*/, this.createAuditLog({
                                event_type: 'data_deletion',
                                patient_id: patientId,
                                clinic_id: clinicId,
                                table_name: 'patients',
                                action: 'anonymize',
                                data_subject_rights: 'erasure',
                                purpose: 'LGPD compliance - Right to erasure',
                                legal_basis: 'Article 18 - Right to erasure',
                                anonymization_status: true
                            })];
                    case 2:
                        // Log anonymization action
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_4 instanceof Error ? error_4.message : 'Anonymization failed'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Export patient data in portable format (JSON/CSV)
     */
    LGPDComplianceManager.prototype.exportPatientDataPortable = function (patientId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var exportResult, portableData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exportPatientData(patientId, clinicId)];
                    case 1:
                        exportResult = _a.sent();
                        if (exportResult.success && exportResult.data) {
                            portableData = __assign(__assign({}, exportResult.data), { format: 'portable_json', lgpd_article: 'Article 20 - Data Portability', structured_format: true, machine_readable: true });
                            return [2 /*return*/, { success: true, data: portableData }];
                        }
                        return [2 /*return*/, exportResult];
                }
            });
        });
    };
    /**
     * Get relevant LGPD article for audit event type
     */
    LGPDComplianceManager.prototype.getLGPDArticle = function (eventType) {
        var articleMap = {
            'data_access': 'Article 17 - Right of access',
            'data_modification': 'Article 18 - Right to rectification',
            'data_deletion': 'Article 18 - Right to erasure',
            'consent_granted': 'Article 8 - Consent',
            'consent_revoked': 'Article 8 - Consent withdrawal',
            'data_export': 'Article 20 - Data portability',
            'user_authentication': 'Article 37 - Data processing records',
            'sensitive_data_access': 'Article 11 - Sensitive data processing',
            'patient_record_access': 'Article 11 - Healthcare data',
            'medical_procedure_access': 'Article 11 - Healthcare data',
            'professional_access': 'Article 37 - Access control',
            'system_admin_access': 'Article 37 - System administration',
            'audit_log_access': 'Article 37 - Audit trail'
        };
        return articleMap[eventType] || 'General LGPD compliance';
    };
    /**
     * Get LGPD article for data subject rights
     */
    LGPDComplianceManager.prototype.getDataSubjectRightsArticle = function (right) {
        var rightsMap = {
            'access': '17 - Right of access',
            'rectification': '18 - Right to rectification',
            'erasure': '18 - Right to erasure',
            'portability': '20 - Data portability',
            'restriction': '18 - Restriction of processing',
            'objection': '21 - Right to object',
            'consent_withdrawal': '8 - Consent withdrawal'
        };
        return rightsMap[right] || '17-22 - Data subject rights';
    };
    return LGPDComplianceManager;
}());
exports.LGPDComplianceManager = LGPDComplianceManager;
// Healthcare-specific LGPD compliance hooks
var HealthcareLGPDHooks = /** @class */ (function () {
    function HealthcareLGPDHooks(serverSide) {
        if (serverSide === void 0) { serverSide = false; }
        this.compliance = new LGPDComplianceManager(serverSide);
    }
    /**
     * Hook for patient data access - must be called before accessing patient records
     */
    HealthcareLGPDHooks.prototype.beforePatientAccess = function (patientId, clinicId, action, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Log access attempt
                        return [4 /*yield*/, this.compliance.logPatientDataAccess(patientId, clinicId, action, context.tableAccessed || 'patients', context.recordId, context.purpose)
                            // Check if user has permission to access this patient's data
                            // This would integrate with your RLS policies
                        ];
                    case 1:
                        // Log access attempt
                        _a.sent();
                        // Check if user has permission to access this patient's data
                        // This would integrate with your RLS policies
                        return [2 /*return*/, { allowed: true }];
                    case 2:
                        error_5 = _a.sent();
                        console.error('LGPD Patient Access Hook Error:', error_5);
                        return [2 /*return*/, {
                                allowed: false,
                                reason: 'LGPD compliance check failed'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Hook for sensitive data access (medical procedures, financial data)
     */
    HealthcareLGPDHooks.prototype.beforeSensitiveDataAccess = function (patientId, clinicId, dataType, action, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Enhanced logging for sensitive data
                        return [4 /*yield*/, this.compliance.logSensitiveDataAccess(context.userId, patientId, clinicId, dataType, action, context.recordId)
                            // Additional validation for sensitive data access
                        ];
                    case 1:
                        // Enhanced logging for sensitive data
                        _a.sent();
                        // Additional validation for sensitive data access
                        if (dataType === 'financial' && !['admin', 'manager'].includes(context.userRole)) {
                            return [2 /*return*/, {
                                    allowed: false,
                                    reason: 'Insufficient permissions for financial data access'
                                }];
                        }
                        return [2 /*return*/, { allowed: true }];
                    case 2:
                        error_6 = _a.sent();
                        console.error('LGPD Sensitive Data Access Hook Error:', error_6);
                        return [2 /*return*/, {
                                allowed: false,
                                reason: 'LGPD compliance check failed for sensitive data'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Hook for consent validation before data processing
     */
    HealthcareLGPDHooks.prototype.validateConsent = function (patientId, clinicId, consentType, purpose) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Check if valid consent exists for this purpose
                        // This would query your consent management system
                        // For now, we'll log the consent check
                        return [4 /*yield*/, this.compliance.createAuditLog({
                                event_type: 'consent_granted',
                                patient_id: patientId,
                                clinic_id: clinicId,
                                table_name: 'patient_consents',
                                action: 'validate_consent',
                                consent_type: consentType,
                                purpose: purpose,
                                legal_basis: 'Article 8 - Consent validation'
                            })];
                    case 1:
                        // Check if valid consent exists for this purpose
                        // This would query your consent management system
                        // For now, we'll log the consent check
                        _a.sent();
                        return [2 /*return*/, { valid: true }];
                    case 2:
                        error_7 = _a.sent();
                        console.error('LGPD Consent Validation Error:', error_7);
                        return [2 /*return*/, {
                                valid: false,
                                reason: 'Consent validation failed'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return HealthcareLGPDHooks;
}());
exports.HealthcareLGPDHooks = HealthcareLGPDHooks;
// Utility functions for LGPD compliance
exports.lgpdUtils = {
    /**
     * Create LGPD-compliant audit logger
     */
    createAuditLogger: function (serverSide) {
        if (serverSide === void 0) { serverSide = false; }
        return new LGPDComplianceManager(serverSide);
    },
    /**
     * Create healthcare-specific LGPD hooks
     */
    createHealthcareHooks: function (serverSide) {
        if (serverSide === void 0) { serverSide = false; }
        return new HealthcareLGPDHooks(serverSide);
    },
    /**
     * Generate LGPD-compliant consent form data
     */
    generateConsentFormData: function (consentType, purpose, retentionPeriod) { return ({
        consent_type: consentType,
        purpose: purpose,
        retention_period: retentionPeriod || '20_years',
        legal_basis: 'Article 8 - Consent',
        consent_date: new Date().toISOString(),
        consent_version: '1.0',
        can_withdraw: true,
        withdrawal_method: 'Patient portal or written request',
        data_categories: ['personal', 'medical', 'contact'],
        processing_activities: [purpose],
        third_party_sharing: false,
        international_transfer: false
    }); },
    /**
     * Validate if data processing is LGPD compliant
     */
    validateDataProcessing: function (purpose, legalBasis, dataCategories) {
        var issues = [];
        // Basic validation rules
        if (!purpose || purpose.length < 10) {
            issues.push('Purpose must be clearly defined (minimum 10 characters)');
        }
        if (!legalBasis) {
            issues.push('Legal basis for processing must be specified');
        }
        if (dataCategories.includes('sensitive') && !legalBasis.includes('Article 11')) {
            issues.push('Sensitive data requires specific legal basis under Article 11');
        }
        return {
            compliant: issues.length === 0,
            issues: issues
        };
    }
};
// Default export
exports.default = LGPDComplianceManager;
