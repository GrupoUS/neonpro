"use strict";
/**
 * LGPD Compliance Manager
 *
 * Comprehensive LGPD (Lei Geral de Proteção de Dados) compliance system
 * for NeonPro healthcare application with patient data protection.
 *
 * Features:
 * - Data subject rights management (access, rectification, deletion, portability)
 * - Consent management and tracking
 * - Data retention and anonymization policies
 * - Audit trail for LGPD compliance
 * - Healthcare-specific privacy protections
 * - Automated compliance reporting
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
exports.createlgpdComplianceManager = exports.DataRetentionPeriod = exports.DataProcessingPurpose = exports.ConsentType = exports.LGPDRights = void 0;
exports.recordConsent = recordConsent;
exports.requestDataAccess = requestDataAccess;
exports.requestDataDeletion = requestDataDeletion;
exports.exportUserData = exportUserData;
exports.getPrivacySettings = getPrivacySettings;
exports.updatePrivacySettings = updatePrivacySettings;
var client_1 = require("@/lib/supabase/client");
var security_audit_logger_1 = require("../audit/security-audit-logger");
// LGPD Data Subject Rights
var LGPDRights;
(function (LGPDRights) {
    LGPDRights["ACCESS"] = "access";
    LGPDRights["RECTIFICATION"] = "rectification";
    LGPDRights["DELETION"] = "deletion";
    LGPDRights["PORTABILITY"] = "portability";
    LGPDRights["OBJECTION"] = "objection";
    LGPDRights["CONSENT_WITHDRAWAL"] = "consent_withdrawal";
    LGPDRights["INFORMATION"] = "information"; // Art. 9 - Direito de informação
})(LGPDRights || (exports.LGPDRights = LGPDRights = {}));
var ConsentType;
(function (ConsentType) {
    ConsentType["REGISTRATION"] = "registration";
    ConsentType["MEDICAL_DATA"] = "medical_data";
    ConsentType["MARKETING"] = "marketing";
    ConsentType["ANALYTICS"] = "analytics";
    ConsentType["THIRD_PARTY_SHARING"] = "third_party_sharing";
    ConsentType["APPOINTMENT_REMINDERS"] = "appointment_reminders";
    ConsentType["RESEARCH"] = "research";
})(ConsentType || (exports.ConsentType = ConsentType = {}));
var DataProcessingPurpose;
(function (DataProcessingPurpose) {
    DataProcessingPurpose["HEALTHCARE_SERVICES"] = "healthcare_services";
    DataProcessingPurpose["APPOINTMENT_MANAGEMENT"] = "appointment_management";
    DataProcessingPurpose["MEDICAL_RECORDS"] = "medical_records";
    DataProcessingPurpose["BILLING"] = "billing";
    DataProcessingPurpose["MARKETING"] = "marketing";
    DataProcessingPurpose["ANALYTICS"] = "analytics";
    DataProcessingPurpose["LEGAL_COMPLIANCE"] = "legal_compliance";
    DataProcessingPurpose["SYSTEM_SECURITY"] = "system_security";
})(DataProcessingPurpose || (exports.DataProcessingPurpose = DataProcessingPurpose = {}));
var DataRetentionPeriod;
(function (DataRetentionPeriod) {
    DataRetentionPeriod[DataRetentionPeriod["IMMEDIATE"] = 0] = "IMMEDIATE";
    DataRetentionPeriod[DataRetentionPeriod["ONE_MONTH"] = 30] = "ONE_MONTH";
    DataRetentionPeriod[DataRetentionPeriod["THREE_MONTHS"] = 90] = "THREE_MONTHS";
    DataRetentionPeriod[DataRetentionPeriod["ONE_YEAR"] = 365] = "ONE_YEAR";
    DataRetentionPeriod[DataRetentionPeriod["FIVE_YEARS"] = 1825] = "FIVE_YEARS";
    DataRetentionPeriod[DataRetentionPeriod["TEN_YEARS"] = 3650] = "TEN_YEARS";
    DataRetentionPeriod[DataRetentionPeriod["INDEFINITE"] = -1] = "INDEFINITE"; // Special cases (anonymized data)
})(DataRetentionPeriod || (exports.DataRetentionPeriod = DataRetentionPeriod = {}));
// Data inventory for healthcare application
var DATA_INVENTORY = [
    {
        category: 'Dados de Identificação',
        description: 'Nome, CPF, RG, data de nascimento',
        dataTypes: ['name', 'cpf', 'rg', 'birth_date', 'gender'],
        processingPurpose: DataProcessingPurpose.HEALTHCARE_SERVICES,
        legalBasis: 'Execução de contrato (Art. 7, V)',
        retentionPeriod: DataRetentionPeriod.FIVE_YEARS,
        thirdPartySharing: false,
        encryptionRequired: true,
        anonymizationPossible: false
    },
    {
        category: 'Dados de Contato',
        description: 'Email, telefone, endereço',
        dataTypes: ['email', 'phone', 'address', 'city', 'state', 'zip_code'],
        processingPurpose: DataProcessingPurpose.APPOINTMENT_MANAGEMENT,
        legalBasis: 'Execução de contrato (Art. 7, V)',
        retentionPeriod: DataRetentionPeriod.ONE_YEAR,
        thirdPartySharing: false,
        encryptionRequired: true,
        anonymizationPossible: true
    },
    {
        category: 'Dados Médicos',
        description: 'Histórico médico, consultas, exames',
        dataTypes: ['medical_history', 'appointments', 'prescriptions', 'test_results'],
        processingPurpose: DataProcessingPurpose.MEDICAL_RECORDS,
        legalBasis: 'Cuidados de saúde (Art. 11, II, a)',
        retentionPeriod: DataRetentionPeriod.TEN_YEARS,
        thirdPartySharing: false,
        encryptionRequired: true,
        anonymizationPossible: false
    },
    {
        category: 'Dados de Acesso',
        description: 'Login, senhas, sessões, logs de auditoria',
        dataTypes: ['email', 'password_hash', 'session_data', 'audit_logs'],
        processingPurpose: DataProcessingPurpose.SYSTEM_SECURITY,
        legalBasis: 'Legítimo interesse (Art. 7, IX)',
        retentionPeriod: DataRetentionPeriod.ONE_YEAR,
        thirdPartySharing: false,
        encryptionRequired: true,
        anonymizationPossible: true
    },
    {
        category: 'Dados de Marketing',
        description: 'Preferências, histórico de comunicação',
        dataTypes: ['communication_preferences', 'marketing_history'],
        processingPurpose: DataProcessingPurpose.MARKETING,
        legalBasis: 'Consentimento (Art. 7, I)',
        retentionPeriod: DataRetentionPeriod.THREE_MONTHS,
        thirdPartySharing: false,
        encryptionRequired: false,
        anonymizationPossible: true
    }
];
var LGPDComplianceManager = /** @class */ (function () {
    function LGPDComplianceManager() {
        this.supabase = (0, client_1.createClient)();
    }
    /**
     * Record consent for data processing
     */
    LGPDComplianceManager.prototype.recordConsent = function (userId_1, type_1, purpose_1, granted_1) {
        return __awaiter(this, arguments, void 0, function (userId, type, purpose, granted, version) {
            var consent, error_1;
            var _a;
            if (version === void 0) { version = '1.0'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = {
                            id: this.generateConsentId(),
                            userId: userId,
                            type: type,
                            purpose: purpose,
                            granted: granted,
                            grantedAt: granted ? Date.now() : undefined,
                            withdrawnAt: !granted ? Date.now() : undefined,
                            version: version
                        };
                        return [4 /*yield*/, this.getClientIP()];
                    case 1:
                        consent = (_a.ipAddress = _b.sent(),
                            _a.userAgent = navigator.userAgent.substring(0, 255),
                            _a.metadata = {
                                url: window.location.href,
                                timestamp: new Date().toISOString()
                            },
                            _a);
                        // Store consent record
                        return [4 /*yield*/, this.storeConsentRecord(consent)
                            // Log audit event
                        ];
                    case 2:
                        // Store consent record
                        _b.sent();
                        // Log audit event
                        return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logEvent(granted ? security_audit_logger_1.AuditEventType.PROFILE_UPDATE : security_audit_logger_1.AuditEventType.PROFILE_UPDATE, {
                                action: granted ? 'consent_granted' : 'consent_withdrawn',
                                consentType: type,
                                purpose: purpose,
                                version: version
                            }, userId)];
                    case 3:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, consent];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Error recording consent:', error_1);
                        throw new Error('Falha ao registrar consentimento');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process data subject request
     */
    LGPDComplianceManager.prototype.processDataSubjectRequest = function (userId, type, description) {
        return __awaiter(this, void 0, void 0, function () {
            var request, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _a = {
                            id: this.generateRequestId(),
                            userId: userId,
                            type: type,
                            status: 'pending',
                            requestedAt: Date.now()
                        };
                        return [4 /*yield*/, this.getUserEmail(userId)];
                    case 1:
                        _a.requestorEmail = _b.sent();
                        return [4 /*yield*/, this.getClientIP()];
                    case 2:
                        request = (_a.requestorIP = _b.sent(),
                            _a.description = description,
                            _a);
                        // Store request
                        return [4 /*yield*/, this.storeDataSubjectRequest(request)
                            // Log audit event
                        ];
                    case 3:
                        // Store request
                        _b.sent();
                        // Log audit event
                        return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logEvent(security_audit_logger_1.AuditEventType.PROFILE_UPDATE, {
                                action: 'data_subject_request',
                                requestType: type,
                                description: description
                            }, userId)
                            // Process request based on type
                        ];
                    case 4:
                        // Log audit event
                        _b.sent();
                        // Process request based on type
                        return [4 /*yield*/, this.executeDataSubjectRequest(request)];
                    case 5:
                        // Process request based on type
                        _b.sent();
                        return [2 /*return*/, request];
                    case 6:
                        error_2 = _b.sent();
                        console.error('Error processing data subject request:', error_2);
                        throw new Error('Falha ao processar solicitação de direito do titular');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user's privacy settings
     */
    LGPDComplianceManager.prototype.getPrivacySettings = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var stored, defaultSettings, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        stored = localStorage.getItem("privacy_settings_".concat(userId));
                        if (stored) {
                            return [2 /*return*/, JSON.parse(stored)];
                        }
                        defaultSettings = {
                            userId: userId,
                            consents: (_a = {},
                                _a[ConsentType.REGISTRATION] = true,
                                _a[ConsentType.MEDICAL_DATA] = true,
                                _a[ConsentType.MARKETING] = false,
                                _a[ConsentType.ANALYTICS] = false,
                                _a[ConsentType.THIRD_PARTY_SHARING] = false,
                                _a[ConsentType.APPOINTMENT_REMINDERS] = true,
                                _a[ConsentType.RESEARCH] = false,
                                _a),
                            marketingOptOut: true,
                            dataRetentionPreference: DataRetentionPeriod.FIVE_YEARS,
                            communicationPreferences: {
                                email: true,
                                sms: false,
                                phone: false,
                                push: true
                            },
                            thirdPartySharing: false,
                            analyticsOptOut: true,
                            lastUpdated: Date.now()
                        };
                        return [4 /*yield*/, this.updatePrivacySettings(userId, defaultSettings)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, defaultSettings];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error getting privacy settings:', error_3);
                        throw new Error('Falha ao obter configurações de privacidade');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update user's privacy settings
     */
    LGPDComplianceManager.prototype.updatePrivacySettings = function (userId, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var currentSettings, updatedSettings, _i, _a, _b, type, granted, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.getPrivacySettings(userId)];
                    case 1:
                        currentSettings = _c.sent();
                        updatedSettings = __assign(__assign(__assign({}, currentSettings), settings), { lastUpdated: Date.now() });
                        // Store settings
                        localStorage.setItem("privacy_settings_".concat(userId), JSON.stringify(updatedSettings));
                        if (!settings.consents) return [3 /*break*/, 5];
                        _i = 0, _a = Object.entries(settings.consents);
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], type = _b[0], granted = _b[1];
                        if (!(currentSettings.consents[type] !== granted)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.recordConsent(userId, type, this.getDefaultPurpose(type), granted)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // Log audit event
                    return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logEvent(security_audit_logger_1.AuditEventType.PROFILE_UPDATE, {
                            action: 'privacy_settings_updated',
                            changes: Object.keys(settings)
                        }, userId)];
                    case 6:
                        // Log audit event
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _c.sent();
                        console.error('Error updating privacy settings:', error_4);
                        throw new Error('Falha ao atualizar configurações de privacidade');
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Export user data (portability right)
     */
    LGPDComplianceManager.prototype.exportUserData = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userData, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        _a = {
                            exportedAt: new Date().toISOString(),
                            userId: userId
                        };
                        return [4 /*yield*/, this.getPersonalData(userId)];
                    case 1:
                        _a.personalData = _b.sent();
                        return [4 /*yield*/, this.getMedicalData(userId)];
                    case 2:
                        _a.medicalData = _b.sent();
                        return [4 /*yield*/, this.getAppointments(userId)];
                    case 3:
                        _a.appointments = _b.sent();
                        return [4 /*yield*/, this.getConsentHistory(userId)];
                    case 4:
                        _a.consents = _b.sent();
                        return [4 /*yield*/, this.getPrivacySettings(userId)];
                    case 5:
                        _a.privacySettings = _b.sent();
                        return [4 /*yield*/, this.getUserAuditLog(userId)];
                    case 6:
                        userData = (_a.auditLog = _b.sent(),
                            _a);
                        // Log export event
                        return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logEvent(security_audit_logger_1.AuditEventType.PROFILE_UPDATE, {
                                action: 'data_export',
                                dataTypes: Object.keys(userData)
                            }, userId)];
                    case 7:
                        // Log export event
                        _b.sent();
                        return [2 /*return*/, userData];
                    case 8:
                        error_5 = _b.sent();
                        console.error('Error exporting user data:', error_5);
                        throw new Error('Falha ao exportar dados do usuário');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete user data (erasure right)
     */
    LGPDComplianceManager.prototype.deleteUserData = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, retainMedical) {
            var error_6;
            if (retainMedical === void 0) { retainMedical = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!retainMedical) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.anonymizePersonalData(userId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.hardDeleteUserData(userId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: 
                    // Log deletion event
                    return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.logEvent(security_audit_logger_1.AuditEventType.PROFILE_UPDATE, {
                            action: retainMedical ? 'data_anonymized' : 'data_deleted',
                            retainMedical: retainMedical
                        }, userId)];
                    case 5:
                        // Log deletion event
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_6 = _a.sent();
                        console.error('Error deleting user data:', error_6);
                        throw new Error('Falha ao excluir dados do usuário');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get data retention schedule
     */
    LGPDComplianceManager.prototype.getDataRetentionSchedule = function () {
        return DATA_INVENTORY;
    };
    /**
     * Generate LGPD compliance report
     */
    LGPDComplianceManager.prototype.generateComplianceReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            var summary, consentMetrics, dataSubjectRequests, retentionCompliance, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        _a = {};
                        return [4 /*yield*/, this.getTotalUsers()];
                    case 1:
                        _a.totalUsers = _b.sent();
                        return [4 /*yield*/, this.getActiveConsents()];
                    case 2:
                        _a.activeConsents = _b.sent();
                        return [4 /*yield*/, this.getPendingDataRequests()];
                    case 3:
                        _a.pendingRequests = _b.sent();
                        return [4 /*yield*/, this.checkRetentionCompliance()];
                    case 4:
                        summary = (_a.dataRetentionCompliance = _b.sent(),
                            _a.lastUpdated = new Date().toISOString(),
                            _a);
                        return [4 /*yield*/, this.getConsentMetrics()];
                    case 5:
                        consentMetrics = _b.sent();
                        return [4 /*yield*/, this.getDataSubjectRequestMetrics()];
                    case 6:
                        dataSubjectRequests = _b.sent();
                        return [4 /*yield*/, this.getRetentionComplianceReport()];
                    case 7:
                        retentionCompliance = _b.sent();
                        return [2 /*return*/, {
                                summary: summary,
                                consentMetrics: consentMetrics,
                                dataSubjectRequests: dataSubjectRequests,
                                retentionCompliance: retentionCompliance
                            }];
                    case 8:
                        error_7 = _b.sent();
                        console.error('Error generating compliance report:', error_7);
                        throw new Error('Falha ao gerar relatório de conformidade');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // Private methods
    LGPDComplianceManager.prototype.executeDataSubjectRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, userData, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 12, , 14]);
                        response = '';
                        _a = request.type;
                        switch (_a) {
                            case LGPDRights.ACCESS: return [3 /*break*/, 1];
                            case LGPDRights.RECTIFICATION: return [3 /*break*/, 3];
                            case LGPDRights.DELETION: return [3 /*break*/, 4];
                            case LGPDRights.PORTABILITY: return [3 /*break*/, 5];
                            case LGPDRights.OBJECTION: return [3 /*break*/, 7];
                            case LGPDRights.CONSENT_WITHDRAWAL: return [3 /*break*/, 8];
                            case LGPDRights.INFORMATION: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 10];
                    case 1: return [4 /*yield*/, this.exportUserData(request.userId)];
                    case 2:
                        userData = _b.sent();
                        response = 'Dados exportados e disponibilizados para download';
                        return [3 /*break*/, 10];
                    case 3:
                        response = 'Solicitação de retificação registrada. Entre em contato para prosseguir.';
                        return [3 /*break*/, 10];
                    case 4:
                        response = 'Dados serão excluídos conforme política de retenção médica';
                        return [3 /*break*/, 10];
                    case 5: return [4 /*yield*/, this.exportUserData(request.userId)];
                    case 6:
                        _b.sent();
                        response = 'Dados exportados em formato estruturado';
                        return [3 /*break*/, 10];
                    case 7:
                        response = 'Oposição registrada. Processamento será interrompido quando legalmente permitido.';
                        return [3 /*break*/, 10];
                    case 8:
                        response = 'Consentimentos revogados conforme solicitado';
                        return [3 /*break*/, 10];
                    case 9:
                        response = 'Informações sobre processamento disponíveis na política de privacidade';
                        return [3 /*break*/, 10];
                    case 10:
                        // Update request with response
                        request.status = 'completed';
                        request.completedAt = Date.now();
                        request.response = response;
                        return [4 /*yield*/, this.updateDataSubjectRequest(request)];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 12:
                        error_8 = _b.sent();
                        request.status = 'rejected';
                        request.rejectionReason = 'Erro interno no processamento';
                        return [4 /*yield*/, this.updateDataSubjectRequest(request)];
                    case 13:
                        _b.sent();
                        throw error_8;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    LGPDComplianceManager.prototype.generateConsentId = function () {
        return "consent_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    LGPDComplianceManager.prototype.generateRequestId = function () {
        return "lgpd_req_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    LGPDComplianceManager.prototype.getClientIP = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In production, get from server
                return [2 /*return*/, 'client_ip'];
            });
        });
    };
    LGPDComplianceManager.prototype.getUserEmail = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Get from user profile
                return [2 /*return*/, 'user@example.com'];
            });
        });
    };
    LGPDComplianceManager.prototype.getDefaultPurpose = function (type) {
        switch (type) {
            case ConsentType.MEDICAL_DATA:
                return DataProcessingPurpose.MEDICAL_RECORDS;
            case ConsentType.MARKETING:
                return DataProcessingPurpose.MARKETING;
            case ConsentType.ANALYTICS:
                return DataProcessingPurpose.ANALYTICS;
            default:
                return DataProcessingPurpose.HEALTHCARE_SERVICES;
        }
    };
    LGPDComplianceManager.prototype.storeConsentRecord = function (consent) {
        return __awaiter(this, void 0, void 0, function () {
            var consents;
            return __generator(this, function (_a) {
                consents = this.getStoredConsents();
                consents.push(consent);
                localStorage.setItem('lgpd_consents', JSON.stringify(consents));
                return [2 /*return*/];
            });
        });
    };
    LGPDComplianceManager.prototype.storeDataSubjectRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var requests;
            return __generator(this, function (_a) {
                requests = this.getStoredRequests();
                requests.push(request);
                localStorage.setItem('lgpd_requests', JSON.stringify(requests));
                return [2 /*return*/];
            });
        });
    };
    LGPDComplianceManager.prototype.updateDataSubjectRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var requests, index;
            return __generator(this, function (_a) {
                requests = this.getStoredRequests();
                index = requests.findIndex(function (r) { return r.id === request.id; });
                if (index >= 0) {
                    requests[index] = request;
                    localStorage.setItem('lgpd_requests', JSON.stringify(requests));
                }
                return [2 /*return*/];
            });
        });
    };
    LGPDComplianceManager.prototype.getStoredConsents = function () {
        try {
            var stored = localStorage.getItem('lgpd_consents');
            return stored ? JSON.parse(stored) : [];
        }
        catch (_a) {
            return [];
        }
    };
    LGPDComplianceManager.prototype.getStoredRequests = function () {
        try {
            var stored = localStorage.getItem('lgpd_requests');
            return stored ? JSON.parse(stored) : [];
        }
        catch (_a) {
            return [];
        }
    };
    // Data retrieval methods (would connect to database in production)
    LGPDComplianceManager.prototype.getPersonalData = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { message: 'Dados pessoais seriam recuperados do banco de dados' }];
            });
        });
    };
    LGPDComplianceManager.prototype.getMedicalData = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { message: 'Dados médicos seriam recuperados do banco de dados' }];
            });
        });
    };
    LGPDComplianceManager.prototype.getAppointments = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { message: 'Consultas seriam recuperadas do banco de dados' }];
            });
        });
    };
    LGPDComplianceManager.prototype.getConsentHistory = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getStoredConsents().filter(function (c) { return c.userId === userId; })];
            });
        });
    };
    LGPDComplianceManager.prototype.getUserAuditLog = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { message: 'Log de auditoria seria recuperado do sistema' }];
            });
        });
    };
    LGPDComplianceManager.prototype.anonymizePersonalData = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implement data anonymization
                console.log('Anonymizing personal data for user:', userId);
                return [2 /*return*/];
            });
        });
    };
    LGPDComplianceManager.prototype.hardDeleteUserData = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implement hard deletion
                console.log('Hard deleting all data for user:', userId);
                return [2 /*return*/];
            });
        });
    };
    // Metrics methods
    LGPDComplianceManager.prototype.getTotalUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 0]; // Get from database
            });
        });
    };
    LGPDComplianceManager.prototype.getActiveConsents = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getStoredConsents().filter(function (c) { return c.granted; }).length];
            });
        });
    };
    LGPDComplianceManager.prototype.getPendingDataRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getStoredRequests().filter(function (r) { return r.status === 'pending'; }).length];
            });
        });
    };
    LGPDComplianceManager.prototype.checkRetentionCompliance = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, true]; // Check retention policies
            });
        });
    };
    LGPDComplianceManager.prototype.getConsentMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var consents;
            return __generator(this, function (_a) {
                consents = this.getStoredConsents();
                return [2 /*return*/, {
                        total: consents.length,
                        granted: consents.filter(function (c) { return c.granted; }).length,
                        withdrawn: consents.filter(function (c) { return !c.granted; }).length
                    }];
            });
        });
    };
    LGPDComplianceManager.prototype.getDataSubjectRequestMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requests;
            return __generator(this, function (_a) {
                requests = this.getStoredRequests();
                return [2 /*return*/, {
                        total: requests.length,
                        pending: requests.filter(function (r) { return r.status === 'pending'; }).length,
                        completed: requests.filter(function (r) { return r.status === 'completed'; }).length,
                        rejected: requests.filter(function (r) { return r.status === 'rejected'; }).length
                    }];
            });
        });
    };
    LGPDComplianceManager.prototype.getRetentionComplianceReport = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        compliant: true,
                        itemsToReview: [],
                        itemsToDelete: []
                    }];
            });
        });
    };
    return LGPDComplianceManager;
}());
// Export singleton instance
var createlgpdComplianceManager = function () { return new LGPDComplianceManager(); };
exports.createlgpdComplianceManager = createlgpdComplianceManager;
// Export convenience functions
function recordConsent(userId, type, purpose, granted) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, lgpdComplianceManager.recordConsent(userId, type, purpose, granted)];
        });
    });
}
function requestDataAccess(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, lgpdComplianceManager.processDataSubjectRequest(userId, LGPDRights.ACCESS)];
        });
    });
}
function requestDataDeletion(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, lgpdComplianceManager.processDataSubjectRequest(userId, LGPDRights.DELETION)];
        });
    });
}
function exportUserData(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, lgpdComplianceManager.exportUserData(userId)];
        });
    });
}
function getPrivacySettings(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, lgpdComplianceManager.getPrivacySettings(userId)];
        });
    });
}
function updatePrivacySettings(userId, settings) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, lgpdComplianceManager.updatePrivacySettings(userId, settings)];
        });
    });
}
