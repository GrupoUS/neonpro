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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEALTHCARE_DATA_CATEGORIES = exports.HEALTHCARE_CONSENT_PURPOSES = exports.ConsentManager = exports.consentRecordSchema = exports.LegalBasis = exports.ConsentStatus = exports.ConsentType = void 0;
var zod_1 = require("zod");
/**
 * LGPD Consent Management System
 * Implements consent collection, storage, and management according to Brazilian LGPD requirements
 */
// Types of consent required for healthcare operations
var ConsentType;
(function (ConsentType) {
    ConsentType["DATA_PROCESSING"] = "data_processing";
    ConsentType["SENSITIVE_DATA"] = "sensitive_data";
    ConsentType["MARKETING"] = "marketing";
    ConsentType["DATA_SHARING"] = "data_sharing";
    ConsentType["PHOTO_VIDEO"] = "photo_video";
    ConsentType["RESEARCH"] = "research";
    ConsentType["COOKIES"] = "cookies";
    ConsentType["BIOMETRIC"] = "biometric"; // Biometric data collection
})(ConsentType || (exports.ConsentType = ConsentType = {}));
// Consent status enum
var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus["GRANTED"] = "granted";
    ConsentStatus["DENIED"] = "denied";
    ConsentStatus["REVOKED"] = "revoked";
    ConsentStatus["EXPIRED"] = "expired";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
// Legal basis for data processing under LGPD
var LegalBasis;
(function (LegalBasis) {
    LegalBasis["CONSENT"] = "consent";
    LegalBasis["CONTRACT"] = "contract";
    LegalBasis["LEGAL_OBLIGATION"] = "legal_obligation";
    LegalBasis["VITAL_INTERESTS"] = "vital_interests";
    LegalBasis["PUBLIC_INTEREST"] = "public_interest";
    LegalBasis["LEGITIMATE_INTERESTS"] = "legitimate_interests"; // Article 7, IX
})(LegalBasis || (exports.LegalBasis = LegalBasis = {}));
// Consent record schema
exports.consentRecordSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    userId: zod_1.z.string().uuid(),
    consentType: zod_1.z.nativeEnum(ConsentType),
    status: zod_1.z.nativeEnum(ConsentStatus),
    legalBasis: zod_1.z.nativeEnum(LegalBasis),
    // Consent metadata
    grantedAt: zod_1.z.date().optional(),
    revokedAt: zod_1.z.date().optional(),
    expiresAt: zod_1.z.date().optional(),
    // Collection context
    ipAddress: zod_1.z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP inválido'),
    userAgent: zod_1.z.string(),
    source: zod_1.z.enum(['web', 'mobile', 'clinic', 'phone', 'email']),
    // Purpose specification (LGPD requirement)
    purpose: zod_1.z.string().min(10, 'Finalidade deve ser específica e clara'),
    dataCategories: zod_1.z.array(zod_1.z.string()).min(1, 'Categorias de dados são obrigatórias'),
    // Data subject information
    language: zod_1.z.enum(['pt-BR', 'en-US']).default('pt-BR'),
    version: zod_1.z.string().default('1.0'), // Consent form version
    // Third party sharing details (if applicable)
    thirdParties: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        purpose: zod_1.z.string(),
        country: zod_1.z.string().default('Brasil'),
        adequacyDecision: zod_1.z.boolean().default(false) // For international transfers
    })).optional(),
    createdAt: zod_1.z.date().default(function () { return new Date(); }),
    updatedAt: zod_1.z.date().default(function () { return new Date(); })
});
var ConsentManager = /** @class */ (function () {
    function ConsentManager() {
    }
    /**
     * Collect consent from data subject
     */
    ConsentManager.collectConsent = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var now, expiresAt, consentRecord, validated;
            var _a;
            return __generator(this, function (_b) {
                now = new Date();
                expiresAt = params.expiresInDays
                    ? new Date(now.getTime() + params.expiresInDays * 24 * 60 * 60 * 1000)
                    : undefined;
                consentRecord = {
                    id: crypto.randomUUID(),
                    userId: params.userId,
                    consentType: params.consentType,
                    status: params.granted ? ConsentStatus.GRANTED : ConsentStatus.DENIED,
                    legalBasis: params.legalBasis || LegalBasis.CONSENT,
                    grantedAt: params.granted ? now : undefined,
                    expiresAt: expiresAt,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                    source: params.source,
                    purpose: params.purpose,
                    dataCategories: params.dataCategories,
                    language: 'pt-BR',
                    version: '1.0',
                    thirdParties: (_a = params.thirdParties) === null || _a === void 0 ? void 0 : _a.map(function (tp) { return ({
                        name: tp.name,
                        purpose: tp.purpose,
                        country: tp.country || 'Brasil',
                        adequacyDecision: tp.adequacyDecision || false
                    }); }),
                    createdAt: now,
                    updatedAt: now
                };
                validated = exports.consentRecordSchema.parse(consentRecord);
                // TODO: Store in database
                console.log('Consent collected:', validated);
                return [2 /*return*/, validated];
            });
        });
    };
    /**
     * Check if user has valid consent for specific data processing
     */
    ConsentManager.hasValidConsent = function (userId, consentType) {
        return __awaiter(this, void 0, void 0, function () {
            var consentRecord;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getLatestConsent(userId, consentType)];
                    case 1:
                        consentRecord = _a.sent();
                        if (!consentRecord)
                            return [2 /*return*/, false
                                // Check if consent is granted and not expired
                            ];
                        // Check if consent is granted and not expired
                        if (consentRecord.status !== ConsentStatus.GRANTED)
                            return [2 /*return*/, false];
                        if (!(consentRecord.expiresAt && consentRecord.expiresAt < new Date())) return [3 /*break*/, 3];
                        // Mark as expired
                        return [4 /*yield*/, this.expireConsent(consentRecord.id)];
                    case 2:
                        // Mark as expired
                        _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Revoke consent (user right under LGPD)
     */
    ConsentManager.revokeConsent = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var existingConsent, updatedConsent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getLatestConsent(params.userId, params.consentType)];
                    case 1:
                        existingConsent = _a.sent();
                        if (!existingConsent) {
                            throw new Error('No consent found to revoke');
                        }
                        updatedConsent = __assign(__assign({}, existingConsent), { status: ConsentStatus.REVOKED, revokedAt: new Date(), updatedAt: new Date() });
                        // TODO: Update in database
                        console.log('Consent revoked:', updatedConsent);
                        // Audit log for revocation
                        return [4 /*yield*/, this.logConsentEvent({
                                userId: params.userId,
                                action: 'revoke',
                                consentType: params.consentType,
                                details: { reason: params.reason },
                                ipAddress: params.ipAddress,
                                userAgent: params.userAgent
                            })];
                    case 2:
                        // Audit log for revocation
                        _a.sent();
                        return [2 /*return*/, updatedConsent];
                }
            });
        });
    };
    /**
     * Get consent history for a user (right to access under LGPD)
     */
    ConsentManager.getConsentHistory = function (userId, consentType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Query database for all consent records
                // Placeholder implementation
                return [2 /*return*/, []];
            });
        });
    };
    /**
     * Generate consent report for data subject access request
     */
    ConsentManager.generateConsentReport = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var consents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConsentHistory(userId)];
                    case 1:
                        consents = _a.sent();
                        return [2 /*return*/, {
                                userId: userId,
                                generatedAt: new Date(),
                                consents: consents.map(function (c) { return ({
                                    type: c.consentType,
                                    status: c.status,
                                    grantedAt: c.grantedAt,
                                    revokedAt: c.revokedAt,
                                    expiresAt: c.expiresAt,
                                    purpose: c.purpose,
                                    dataCategories: c.dataCategories,
                                    legalBasis: c.legalBasis
                                }); }),
                                dataProcessingActivities: [
                                    'Agendamento de consultas',
                                    'Histórico médico',
                                    'Comunicações de marketing (se consentido)',
                                    'Análise de qualidade do serviço'
                                ],
                                thirdPartySharing: consents
                                    .filter(function (c) { return c.thirdParties && c.thirdParties.length > 0; })
                                    .flatMap(function (c) { return c.thirdParties.map(function (tp) { return ({
                                    partner: tp.name,
                                    purpose: tp.purpose,
                                    dataShared: c.dataCategories,
                                    consentStatus: c.status
                                }); }); })
                            }];
                }
            });
        });
    };
    /**
     * Check if consent is about to expire and send renewal notification
     */
    ConsentManager.checkExpiringConsents = function () {
        return __awaiter(this, arguments, void 0, function (daysBeforeExpiry) {
            if (daysBeforeExpiry === void 0) { daysBeforeExpiry = 30; }
            return __generator(this, function (_a) {
                // TODO: Query database for consents expiring soon
                // Placeholder implementation
                return [2 /*return*/, []];
            });
        });
    };
    // Private helper methods
    ConsentManager.getLatestConsent = function (userId, consentType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Query database for latest consent record
                // Placeholder implementation
                return [2 /*return*/, null];
            });
        });
    };
    ConsentManager.expireConsent = function (consentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Update consent status to expired in database
                console.log('Consent expired:', consentId);
                return [2 /*return*/];
            });
        });
    };
    ConsentManager.logConsentEvent = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Log to audit trail
                console.log('Consent event logged:', params);
                return [2 /*return*/];
            });
        });
    };
    return ConsentManager;
}());
exports.ConsentManager = ConsentManager;
/**
 * Standard consent purposes for healthcare clinics
 */
exports.HEALTHCARE_CONSENT_PURPOSES = (_a = {},
    _a[ConsentType.DATA_PROCESSING] = 'Processamento de dados pessoais para prestação de serviços médicos e administrativos',
    _a[ConsentType.SENSITIVE_DATA] = 'Tratamento de dados sensíveis de saúde para diagnóstico, tratamento e acompanhamento médico',
    _a[ConsentType.MARKETING] = 'Envio de comunicações promocionais sobre tratamentos e serviços da clínica',
    _a[ConsentType.DATA_SHARING] = 'Compartilhamento de dados com laboratórios, outros profissionais de saúde e planos de saúde',
    _a[ConsentType.PHOTO_VIDEO] = 'Captação e uso de imagens fotográficas ou videogrficas para documentação de tratamentos',
    _a[ConsentType.RESEARCH] = 'Uso de dados anonimizados para pesquisas científicas e melhoria de tratamentos',
    _a[ConsentType.COOKIES] = 'Uso de cookies e tecnologias similares no website da clínica',
    _a[ConsentType.BIOMETRIC] = 'Coleta e processamento de dados biométricos para identificação e segurança',
    _a);
/**
 * Standard data categories for healthcare
 */
exports.HEALTHCARE_DATA_CATEGORIES = {
    IDENTIFICATION: 'Dados de identificação (nome, CPF, RG)',
    CONTACT: 'Dados de contato (telefone, email, endereço)',
    HEALTH: 'Dados de saúde (histórico médico, exames, tratamentos)',
    FINANCIAL: 'Dados financeiros (forma de pagamento, faturas)',
    BEHAVIORAL: 'Dados comportamentais (preferências, histórico de uso)',
    BIOMETRIC: 'Dados biométricos (impressões digitais, reconhecimento facial)',
    PHOTOGRAPHIC: 'Imagens fotográficas e videogrficas',
    LOCATION: 'Dados de localização'
};
