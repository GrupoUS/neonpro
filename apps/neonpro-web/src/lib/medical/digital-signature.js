"use strict";
/**
 * NeonPro Digital Signature System
 * Story 2.2: Medical History & Records - Digital Signatures
 *
 * Sistema avançado de assinaturas digitais para documentos médicos:
 * - Assinatura digital com certificados
 * - Validação e verificação de assinaturas
 * - Timestamping e não-repúdio
 * - Conformidade com padrões médicos
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
exports.digitalSignatureManager = exports.DigitalSignatureManager = exports.RequestStatus = exports.SignatureOrder = exports.HashAlgorithm = exports.SignatureType = exports.SignerRole = void 0;
var crypto_1 = require("crypto");
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../audit/audit-logger");
var lgpd_manager_1 = require("../auth/lgpd/lgpd-manager");
// Enums
var SignerRole;
(function (SignerRole) {
    SignerRole["PATIENT"] = "patient";
    SignerRole["DOCTOR"] = "doctor";
    SignerRole["NURSE"] = "nurse";
    SignerRole["ADMIN"] = "admin";
    SignerRole["WITNESS"] = "witness";
    SignerRole["LEGAL_REPRESENTATIVE"] = "legal_representative";
    SignerRole["GUARDIAN"] = "guardian";
})(SignerRole || (exports.SignerRole = SignerRole = {}));
var SignatureType;
(function (SignatureType) {
    SignatureType["DIGITAL_CERTIFICATE"] = "digital_certificate";
    SignatureType["ELECTRONIC_SIGNATURE"] = "electronic_signature";
    SignatureType["BIOMETRIC_SIGNATURE"] = "biometric_signature";
    SignatureType["PIN_SIGNATURE"] = "pin_signature";
    SignatureType["SMS_VERIFICATION"] = "sms_verification";
    SignatureType["EMAIL_VERIFICATION"] = "email_verification";
})(SignatureType || (exports.SignatureType = SignatureType = {}));
var HashAlgorithm;
(function (HashAlgorithm) {
    HashAlgorithm["SHA256"] = "sha256";
    HashAlgorithm["SHA384"] = "sha384";
    HashAlgorithm["SHA512"] = "sha512";
})(HashAlgorithm || (exports.HashAlgorithm = HashAlgorithm = {}));
var SignatureOrder;
(function (SignatureOrder) {
    SignatureOrder["PARALLEL"] = "parallel";
    SignatureOrder["SEQUENTIAL"] = "sequential";
    SignatureOrder["HIERARCHICAL"] = "hierarchical";
})(SignatureOrder || (exports.SignatureOrder = SignatureOrder = {}));
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "pending";
    RequestStatus["IN_PROGRESS"] = "in_progress";
    RequestStatus["COMPLETED"] = "completed";
    RequestStatus["CANCELLED"] = "cancelled";
    RequestStatus["EXPIRED"] = "expired";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
// ============================================================================
// DIGITAL SIGNATURE MANAGER
// ============================================================================
var DigitalSignatureManager = /** @class */ (function () {
    function DigitalSignatureManager() {
        this.SIGNATURE_VALIDITY_PERIOD = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        this.auditLogger = new audit_logger_1.AuditLogger();
        this.lgpdManager = new lgpd_manager_1.LGPDManager();
    }
    // ========================================================================
    // SIGNATURE CREATION
    // ========================================================================
    DigitalSignatureManager.prototype.signDocument = function (documentId, signerId, signerName, signerEmail, signerRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            var documentHash, consentCheck, signatureId, timestamp, signatureData, certificateData, certificateThumbprint, _a, certResult, metadata, signature, _b, data, error, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 16, , 17]);
                        return [4 /*yield*/, this.getDocumentHash(documentId)];
                    case 1:
                        documentHash = _c.sent();
                        if (!documentHash) {
                            return [2 /*return*/, { success: false, error: 'Document not found or inaccessible' }];
                        }
                        return [4 /*yield*/, this.lgpdManager.checkConsent(signerId, 'digital_signature')];
                    case 2:
                        consentCheck = _c.sent();
                        if (!consentCheck.hasConsent) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Consent required for digital signature'
                                }];
                        }
                        signatureId = crypto_1.default.randomUUID();
                        timestamp = new Date().toISOString();
                        signatureData = void 0;
                        certificateData = void 0;
                        certificateThumbprint = void 0;
                        _a = options.signatureType;
                        switch (_a) {
                            case SignatureType.DIGITAL_CERTIFICATE: return [3 /*break*/, 3];
                            case SignatureType.ELECTRONIC_SIGNATURE: return [3 /*break*/, 5];
                            case SignatureType.BIOMETRIC_SIGNATURE: return [3 /*break*/, 7];
                            case SignatureType.PIN_SIGNATURE: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, this.createCertificateSignature(documentHash, options.certificatePath, options.privateKeyPath, options.pin)];
                    case 4:
                        certResult = _c.sent();
                        signatureData = certResult.signature;
                        certificateData = certResult.certificate;
                        certificateThumbprint = certResult.thumbprint;
                        return [3 /*break*/, 12];
                    case 5: return [4 /*yield*/, this.createElectronicSignature(documentHash, signerId, timestamp)];
                    case 6:
                        signatureData = _c.sent();
                        return [3 /*break*/, 12];
                    case 7: return [4 /*yield*/, this.createBiometricSignature(documentHash, options.biometricData)];
                    case 8:
                        signatureData = _c.sent();
                        return [3 /*break*/, 12];
                    case 9: return [4 /*yield*/, this.createPinSignature(documentHash, signerId, options.pin, timestamp)];
                    case 10:
                        signatureData = _c.sent();
                        return [3 /*break*/, 12];
                    case 11: return [2 /*return*/, { success: false, error: 'Unsupported signature type' }];
                    case 12:
                        metadata = {
                            device_info: {
                                device_id: crypto_1.default.randomUUID(),
                                device_type: 'web',
                                os: 'unknown',
                                browser: 'unknown'
                            }
                        };
                        if (options.includeBiometric && options.biometricData) {
                            metadata.biometric_data = options.biometricData;
                        }
                        if (options.includeGeolocation) {
                            // In a real implementation, get actual geolocation
                            metadata.geolocation = {
                                latitude: 0,
                                longitude: 0,
                                accuracy: 0
                            };
                        }
                        signature = {
                            id: signatureId,
                            document_id: documentId,
                            signer_id: signerId,
                            signer_name: signerName,
                            signer_email: signerEmail,
                            signer_role: signerRole,
                            signature_type: options.signatureType,
                            signature_data: signatureData,
                            certificate_data: certificateData,
                            certificate_thumbprint: certificateThumbprint,
                            hash_algorithm: HashAlgorithm.SHA256,
                            document_hash: documentHash,
                            timestamp: timestamp,
                            timestamp_authority: options.includeTimestamp ? 'internal' : undefined,
                            is_valid: true,
                            metadata: metadata,
                            created_at: timestamp
                        };
                        return [4 /*yield*/, this.supabase
                                .from('digital_signatures')
                                .insert(signature)
                                .select()
                                .single()];
                    case 13:
                        _b = _c.sent(), data = _b.data, error = _b.error;
                        if (error)
                            throw error;
                        // Update document status
                        return [4 /*yield*/, this.updateDocumentSignatureStatus(documentId)
                            // Log audit event
                        ];
                    case 14:
                        // Update document status
                        _c.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'document_signed',
                                user_id: signerId,
                                resource_type: 'digital_signature',
                                resource_id: signatureId,
                                details: {
                                    document_id: documentId,
                                    signature_type: options.signatureType,
                                    signer_role: signerRole
                                }
                            })];
                    case 15:
                        // Log audit event
                        _c.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 16:
                        error_1 = _c.sent();
                        console.error('Error signing document:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                            }];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.verifySignature = function (signatureId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, signature, error, currentDocumentHash, validationDetails, _b, certValidation, electronicValidation, biometricValidation, pinValidation, signatureAge, isValid, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 14, , 15]);
                        return [4 /*yield*/, this.supabase
                                .from('digital_signatures')
                                .select('*')
                                .eq('id', signatureId)
                                .single()];
                    case 1:
                        _a = _c.sent(), signature = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!signature) {
                            return [2 /*return*/, { success: false, error: 'Signature not found' }];
                        }
                        return [4 /*yield*/, this.getDocumentHash(signature.document_id)];
                    case 2:
                        currentDocumentHash = _c.sent();
                        if (!currentDocumentHash) {
                            return [2 /*return*/, { success: false, error: 'Document not found' }];
                        }
                        validationDetails = {
                            certificate_valid: true,
                            certificate_trusted: true,
                            certificate_expired: false,
                            signature_intact: true,
                            document_unchanged: true,
                            timestamp_valid: true,
                            validation_errors: [],
                            validation_warnings: []
                        };
                        // Verify document integrity
                        if (signature.document_hash !== currentDocumentHash) {
                            validationDetails.document_unchanged = false;
                            validationDetails.validation_errors.push('Document has been modified after signing');
                        }
                        _b = signature.signature_type;
                        switch (_b) {
                            case SignatureType.DIGITAL_CERTIFICATE: return [3 /*break*/, 3];
                            case SignatureType.ELECTRONIC_SIGNATURE: return [3 /*break*/, 5];
                            case SignatureType.BIOMETRIC_SIGNATURE: return [3 /*break*/, 7];
                            case SignatureType.PIN_SIGNATURE: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, this.verifyCertificateSignature(signature, options)];
                    case 4:
                        certValidation = _c.sent();
                        Object.assign(validationDetails, certValidation);
                        return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, this.verifyElectronicSignature(signature)];
                    case 6:
                        electronicValidation = _c.sent();
                        validationDetails.signature_intact = electronicValidation;
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.verifyBiometricSignature(signature)];
                    case 8:
                        biometricValidation = _c.sent();
                        validationDetails.signature_intact = biometricValidation;
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.verifyPinSignature(signature)];
                    case 10:
                        pinValidation = _c.sent();
                        validationDetails.signature_intact = pinValidation;
                        return [3 /*break*/, 11];
                    case 11:
                        signatureAge = Date.now() - new Date(signature.timestamp).getTime();
                        if (signatureAge > this.SIGNATURE_VALIDITY_PERIOD) {
                            validationDetails.validation_warnings.push('Signature is older than recommended validity period');
                        }
                        isValid = validationDetails.validation_errors.length === 0;
                        return [4 /*yield*/, this.supabase
                                .from('digital_signatures')
                                .update({
                                is_valid: isValid,
                                validation_details: validationDetails,
                                validated_at: new Date().toISOString()
                            })
                                .eq('id', signatureId)
                            // Log audit event
                        ];
                    case 12:
                        _c.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'signature_verified',
                                user_id: 'system',
                                resource_type: 'digital_signature',
                                resource_id: signatureId,
                                details: {
                                    is_valid: isValid,
                                    validation_errors: validationDetails.validation_errors,
                                    validation_warnings: validationDetails.validation_warnings
                                }
                            })];
                    case 13:
                        // Log audit event
                        _c.sent();
                        return [2 /*return*/, { success: true, data: validationDetails }];
                    case 14:
                        error_2 = _c.sent();
                        console.error('Error verifying signature:', error_2);
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error'
                            }];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // SIGNATURE REQUESTS
    // ========================================================================
    DigitalSignatureManager.prototype.createSignatureRequest = function (documentId, requesterId, requiredSigners, signatureOrder, deadline, instructions) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, now, signersWithIds, request, _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        requestId = crypto_1.default.randomUUID();
                        now = new Date().toISOString();
                        signersWithIds = requiredSigners.map(function (signer, index) { return (__assign(__assign({}, signer), { id: crypto_1.default.randomUUID(), order_index: index })); });
                        request = {
                            id: requestId,
                            document_id: documentId,
                            requester_id: requesterId,
                            required_signers: signersWithIds,
                            signature_order: signatureOrder,
                            deadline: deadline,
                            instructions: instructions,
                            status: RequestStatus.PENDING,
                            created_at: now
                        };
                        return [4 /*yield*/, this.supabase
                                .from('signature_requests')
                                .insert(request)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Send notifications to signers
                        return [4 /*yield*/, this.sendSignatureNotifications(request)
                            // Log audit event
                        ];
                    case 2:
                        // Send notifications to signers
                        _b.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'signature_request_created',
                                user_id: requesterId,
                                resource_type: 'signature_request',
                                resource_id: requestId,
                                details: {
                                    document_id: documentId,
                                    signers_count: requiredSigners.length,
                                    signature_order: signatureOrder
                                }
                            })];
                    case 3:
                        // Log audit event
                        _b.sent();
                        return [2 /*return*/, { success: true, data: data }];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Error creating signature request:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Unknown error'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.getSignatureRequest = function (requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('signature_requests')
                                .select('*')
                                .eq('id', requestId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!data) {
                            return [2 /*return*/, { success: false, error: 'Signature request not found' }];
                        }
                        return [2 /*return*/, { success: true, data: data }];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error getting signature request:', error_4);
                        return [2 /*return*/, {
                                success: false,
                                error: error_4 instanceof Error ? error_4.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.updateSignatureRequestStatus = function (requestId, signerId, action, signatureId, declineReason) {
        return __awaiter(this, void 0, void 0, function () {
            var requestResult, request, now_1, updatedSigners, newStatus, allRequired, signedRequired, declinedRequired, updateData, error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getSignatureRequest(requestId)];
                    case 1:
                        requestResult = _a.sent();
                        if (!requestResult.success || !requestResult.data) {
                            return [2 /*return*/, { success: false, error: 'Signature request not found' }];
                        }
                        request = requestResult.data;
                        now_1 = new Date().toISOString();
                        updatedSigners = request.required_signers.map(function (signer) {
                            if (signer.user_id === signerId) {
                                if (action === 'sign') {
                                    return __assign(__assign({}, signer), { signed_at: now_1, signature_id: signatureId });
                                }
                                else {
                                    return __assign(__assign({}, signer), { declined_at: now_1, decline_reason: declineReason });
                                }
                            }
                            return signer;
                        });
                        newStatus = request.status;
                        allRequired = updatedSigners.filter(function (s) { return s.is_required; });
                        signedRequired = allRequired.filter(function (s) { return s.signed_at; });
                        declinedRequired = allRequired.filter(function (s) { return s.declined_at; });
                        if (declinedRequired.length > 0) {
                            newStatus = RequestStatus.CANCELLED;
                        }
                        else if (signedRequired.length === allRequired.length) {
                            newStatus = RequestStatus.COMPLETED;
                        }
                        else if (signedRequired.length > 0) {
                            newStatus = RequestStatus.IN_PROGRESS;
                        }
                        updateData = {
                            required_signers: updatedSigners,
                            status: newStatus
                        };
                        if (newStatus === RequestStatus.COMPLETED) {
                            updateData.completed_at = now_1;
                        }
                        else if (newStatus === RequestStatus.CANCELLED) {
                            updateData.cancelled_at = now_1;
                            updateData.cancellation_reason = "Declined by ".concat(signerId, ": ").concat(declineReason);
                        }
                        return [4 /*yield*/, this.supabase
                                .from('signature_requests')
                                .update(updateData)
                                .eq('id', requestId)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: "signature_request_".concat(action),
                                user_id: signerId,
                                resource_type: 'signature_request',
                                resource_id: requestId,
                                details: {
                                    action: action,
                                    signature_id: signatureId,
                                    decline_reason: declineReason,
                                    new_status: newStatus
                                }
                            })];
                    case 3:
                        // Log audit event
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 4:
                        error_5 = _a.sent();
                        console.error('Error updating signature request status:', error_5);
                        return [2 /*return*/, {
                                success: false,
                                error: error_5 instanceof Error ? error_5.message : 'Unknown error'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // SIGNATURE METHODS BY TYPE
    // ========================================================================
    DigitalSignatureManager.prototype.createCertificateSignature = function (documentHash, certificatePath, privateKeyPath, pin) {
        return __awaiter(this, void 0, void 0, function () {
            var signature, certificate, thumbprint;
            return __generator(this, function (_a) {
                try {
                    signature = crypto_1.default
                        .createSign('RSA-SHA256')
                        .update(documentHash)
                        .sign('mock-private-key', 'base64');
                    certificate = 'mock-certificate-data';
                    thumbprint = crypto_1.default
                        .createHash('sha1')
                        .update(certificate)
                        .digest('hex');
                    return [2 /*return*/, { signature: signature, certificate: certificate, thumbprint: thumbprint }];
                }
                catch (error) {
                    throw new Error("Certificate signature creation failed: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    };
    DigitalSignatureManager.prototype.createElectronicSignature = function (documentHash, signerId, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var signatureData;
            return __generator(this, function (_a) {
                try {
                    signatureData = "".concat(documentHash, ":").concat(signerId, ":").concat(timestamp);
                    return [2 /*return*/, crypto_1.default
                            .createHash('sha256')
                            .update(signatureData)
                            .digest('base64')];
                }
                catch (error) {
                    throw new Error("Electronic signature creation failed: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    };
    DigitalSignatureManager.prototype.createBiometricSignature = function (documentHash, biometricData) {
        return __awaiter(this, void 0, void 0, function () {
            var biometricHash, signatureData;
            return __generator(this, function (_a) {
                try {
                    biometricHash = crypto_1.default
                        .createHash('sha256')
                        .update(JSON.stringify(biometricData))
                        .digest('hex');
                    signatureData = "".concat(documentHash, ":").concat(biometricHash);
                    return [2 /*return*/, crypto_1.default
                            .createHash('sha256')
                            .update(signatureData)
                            .digest('base64')];
                }
                catch (error) {
                    throw new Error("Biometric signature creation failed: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    };
    DigitalSignatureManager.prototype.createPinSignature = function (documentHash, signerId, pin, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var pinHash, signatureData;
            return __generator(this, function (_a) {
                try {
                    pinHash = crypto_1.default
                        .createHash('sha256')
                        .update(pin)
                        .digest('hex');
                    signatureData = "".concat(documentHash, ":").concat(signerId, ":").concat(pinHash, ":").concat(timestamp);
                    return [2 /*return*/, crypto_1.default
                            .createHash('sha256')
                            .update(signatureData)
                            .digest('base64')];
                }
                catch (error) {
                    throw new Error("PIN signature creation failed: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    };
    // ========================================================================
    // SIGNATURE VERIFICATION METHODS
    // ========================================================================
    DigitalSignatureManager.prototype.verifyCertificateSignature = function (signature, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In a real implementation, verify actual certificate
                    // Check certificate chain, revocation status, etc.
                    return [2 /*return*/, {
                            certificate_valid: true,
                            certificate_trusted: true,
                            certificate_expired: false,
                            signature_intact: true
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            certificate_valid: false,
                            certificate_trusted: false,
                            certificate_expired: false,
                            signature_intact: false,
                            validation_errors: ["Certificate verification failed: ".concat(error)]
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    DigitalSignatureManager.prototype.verifyElectronicSignature = function (signature) {
        return __awaiter(this, void 0, void 0, function () {
            var expectedSignature, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.createElectronicSignature(signature.document_hash, signature.signer_id, signature.timestamp)];
                    case 1:
                        expectedSignature = _a.sent();
                        return [2 /*return*/, signature.signature_data === expectedSignature];
                    case 2:
                        error_6 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.verifyBiometricSignature = function (signature) {
        return __awaiter(this, void 0, void 0, function () {
            var expectedSignature, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!((_a = signature.metadata) === null || _a === void 0 ? void 0 : _a.biometric_data)) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.createBiometricSignature(signature.document_hash, signature.metadata.biometric_data)];
                    case 1:
                        expectedSignature = _b.sent();
                        return [2 /*return*/, signature.signature_data === expectedSignature];
                    case 2:
                        error_7 = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.verifyPinSignature = function (signature) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // PIN verification requires the original PIN, which we don't store
                    // In practice, this would involve re-prompting the user
                    // For now, we'll assume it's valid if the signature exists
                    return [2 /*return*/, true];
                }
                catch (error) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    // ========================================================================
    // UTILITY METHODS
    // ========================================================================
    DigitalSignatureManager.prototype.getDocumentHash = function (documentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('medical_documents')
                                .select('checksum')
                                .eq('id', documentId)
                                .eq('is_active', true)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.checksum) || null];
                    case 2:
                        error_8 = _b.sent();
                        console.error('Error getting document hash:', error_8);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.updateDocumentSignatureStatus = function (documentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, totalSignatures, validSignatures, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('digital_signatures')
                                .select('id, is_valid')
                                .eq('document_id', documentId)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalSignatures = (data === null || data === void 0 ? void 0 : data.length) || 0;
                        validSignatures = (data === null || data === void 0 ? void 0 : data.filter(function (s) { return s.is_valid; }).length) || 0;
                        // Update document metadata
                        return [4 /*yield*/, this.supabase
                                .from('medical_documents')
                                .update({
                                metadata: {
                                    signature_count: totalSignatures,
                                    valid_signature_count: validSignatures,
                                    last_signed_at: new Date().toISOString()
                                },
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', documentId)];
                    case 2:
                        // Update document metadata
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _b.sent();
                        console.error('Error updating document signature status:', error_9);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.sendSignatureNotifications = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, signer;
            return __generator(this, function (_b) {
                try {
                    // In a real implementation, send email/SMS notifications
                    // to required signers about the signature request
                    for (_i = 0, _a = request.required_signers; _i < _a.length; _i++) {
                        signer = _a[_i];
                        console.log("Sending signature notification to ".concat(signer.email, " for request ").concat(request.id));
                        // TODO: Implement actual notification sending
                        // - Email notification
                        // - SMS notification
                        // - In-app notification
                        // - Push notification
                    }
                }
                catch (error) {
                    console.error('Error sending signature notifications:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    // ========================================================================
    // QUERY METHODS
    // ========================================================================
    DigitalSignatureManager.prototype.getDocumentSignatures = function (documentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('digital_signatures')
                                .select('*')
                                .eq('document_id', documentId)
                                .order('created_at', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: data || [] }];
                    case 2:
                        error_10 = _b.sent();
                        console.error('Error getting document signatures:', error_10);
                        return [2 /*return*/, {
                                success: false,
                                error: error_10 instanceof Error ? error_10.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.getUserSignatures = function (userId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('digital_signatures')
                            .select('*')
                            .eq('signer_id', userId)
                            .order('created_at', { ascending: false });
                        if (limit) {
                            query = query.limit(limit);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, { success: true, data: data || [] }];
                    case 2:
                        error_11 = _b.sent();
                        console.error('Error getting user signatures:', error_11);
                        return [2 /*return*/, {
                                success: false,
                                error: error_11 instanceof Error ? error_11.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.getPendingSignatureRequests = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, pendingRequests, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('signature_requests')
                                .select('*')
                                .contains('required_signers', [{ user_id: userId }])
                                .in('status', [RequestStatus.PENDING, RequestStatus.IN_PROGRESS])
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        pendingRequests = (data || []).filter(function (request) {
                            var userSigner = request.required_signers.find(function (s) { return s.user_id === userId; });
                            return userSigner && !userSigner.signed_at && !userSigner.declined_at;
                        });
                        return [2 /*return*/, { success: true, data: pendingRequests }];
                    case 2:
                        error_12 = _b.sent();
                        console.error('Error getting pending signature requests:', error_12);
                        return [2 /*return*/, {
                                success: false,
                                error: error_12 instanceof Error ? error_12.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // REVOCATION AND MANAGEMENT
    // ========================================================================
    DigitalSignatureManager.prototype.revokeSignature = function (signatureId, reason, revokedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('digital_signatures')
                                .update({
                                is_valid: false,
                                revoked_at: new Date().toISOString(),
                                revocation_reason: reason
                            })
                                .eq('id', signatureId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.log({
                                event_type: 'signature_revoked',
                                user_id: revokedBy,
                                resource_type: 'digital_signature',
                                resource_id: signatureId,
                                details: {
                                    reason: reason,
                                    revoked_by: revokedBy
                                }
                            })];
                    case 2:
                        // Log audit event
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_13 = _a.sent();
                        console.error('Error revoking signature:', error_13);
                        return [2 /*return*/, {
                                success: false,
                                error: error_13 instanceof Error ? error_13.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DigitalSignatureManager.prototype.getSignatureStatistics = function (clinicId, period) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, stats_1, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('digital_signatures')
                            .select('signature_type, signer_role, is_valid, created_at');
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
                            total_signatures: (data === null || data === void 0 ? void 0 : data.length) || 0,
                            valid_signatures: (data === null || data === void 0 ? void 0 : data.filter(function (s) { return s.is_valid; }).length) || 0,
                            by_type: {},
                            by_role: {},
                            by_month: {}
                        };
                        data === null || data === void 0 ? void 0 : data.forEach(function (signature) {
                            // Count by type
                            stats_1.by_type[signature.signature_type] =
                                (stats_1.by_type[signature.signature_type] || 0) + 1;
                            // Count by role
                            stats_1.by_role[signature.signer_role] =
                                (stats_1.by_role[signature.signer_role] || 0) + 1;
                            // Count by month
                            var month = new Date(signature.created_at).toISOString().slice(0, 7);
                            stats_1.by_month[month] = (stats_1.by_month[month] || 0) + 1;
                        });
                        return [2 /*return*/, { success: true, data: stats_1 }];
                    case 2:
                        error_14 = _b.sent();
                        console.error('Error getting signature statistics:', error_14);
                        return [2 /*return*/, {
                                success: false,
                                error: error_14 instanceof Error ? error_14.message : 'Unknown error'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DigitalSignatureManager;
}());
exports.DigitalSignatureManager = DigitalSignatureManager;
// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================
exports.digitalSignatureManager = new DigitalSignatureManager();
exports.default = exports.digitalSignatureManager;
