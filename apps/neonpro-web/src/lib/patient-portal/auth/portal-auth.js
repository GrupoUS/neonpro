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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalAuthManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var crypto_1 = require("crypto");
/**
 * Gerenciador de autenticação específico para o portal do paciente
 * Implementa autenticação segura, gestão de sessões e compliance LGPD
 */
var PortalAuthManager = /** @class */ (function () {
    function PortalAuthManager(supabaseUrl, supabaseKey, auditLogger, encryptionService, lgpdManager, config) {
        this.activeSessions = new Map();
        this.loginAttempts = new Map();
        this.blockedIps = new Set();
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.auditLogger = auditLogger;
        this.encryptionService = encryptionService;
        this.lgpdManager = lgpdManager;
        this.config = __assign({ sessionDuration: 480, maxConcurrentSessions: 3, requireTwoFactor: false, sessionInactivityTimeout: 30, passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true
            } }, config);
        // Inicializar limpeza automática de sessões
        this.startSessionCleanup();
    }
    /**
     * Autentica um paciente no portal
     */
    PortalAuthManager.prototype.authenticatePatient = function (email, password, ipAddress, userAgent, deviceFingerprint) {
        return __awaiter(this, void 0, void 0, function () {
            var recentAttempts, _a, patient, patientError, passwordValid, twoFactorToken, activeSessions, session, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 23, , 25]);
                        if (!this.blockedIps.has(ipAddress)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.logSecurityEvent({
                                type: 'login',
                                patientId: '',
                                ipAddress: ipAddress,
                                userAgent: userAgent,
                                details: { reason: 'blocked_ip', email: email },
                                severity: 'high',
                                timestamp: new Date()
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Acesso bloqueado por motivos de segurança'
                            }];
                    case 2:
                        recentAttempts = this.getRecentLoginAttempts(email, ipAddress);
                        if (!(recentAttempts.length >= 5)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.blockIpAddress(ipAddress, 'Muitas tentativas de login')];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
                            }];
                    case 4: return [4 /*yield*/, this.supabase
                            .from('patients')
                            .select("\n          id,\n          name,\n          email,\n          phone,\n          clinic_id,\n          password_hash,\n          two_factor_enabled,\n          two_factor_secret,\n          is_active,\n          last_login,\n          failed_login_attempts\n        ")
                            .eq('email', email.toLowerCase())
                            .eq('is_active', true)
                            .single()];
                    case 5:
                        _a = _b.sent(), patient = _a.data, patientError = _a.error;
                        if (!(patientError || !patient)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.recordLoginAttempt({
                                email: email,
                                ipAddress: ipAddress,
                                userAgent: userAgent,
                                success: false,
                                failureReason: 'patient_not_found',
                                timestamp: new Date()
                            })];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Credenciais inválidas'
                            }];
                    case 7: return [4 /*yield*/, this.verifyPassword(password, patient.password_hash)];
                    case 8:
                        passwordValid = _b.sent();
                        if (!!passwordValid) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.recordLoginAttempt({
                                patientId: patient.id,
                                email: email,
                                ipAddress: ipAddress,
                                userAgent: userAgent,
                                success: false,
                                failureReason: 'invalid_password',
                                timestamp: new Date()
                            })];
                    case 9:
                        _b.sent();
                        // Incrementar tentativas falhadas
                        return [4 /*yield*/, this.incrementFailedAttempts(patient.id)];
                    case 10:
                        // Incrementar tentativas falhadas
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Credenciais inválidas'
                            }];
                    case 11:
                        if (!(this.config.requireTwoFactor || patient.two_factor_enabled)) return [3 /*break*/, 13];
                        twoFactorToken = this.generateTwoFactorToken();
                        // Enviar código 2FA (implementar integração com SMS/Email)
                        return [4 /*yield*/, this.sendTwoFactorCode(patient, twoFactorToken)];
                    case 12:
                        // Enviar código 2FA (implementar integração com SMS/Email)
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                requiresTwoFactor: true,
                                twoFactorToken: twoFactorToken,
                                error: 'Código de verificação enviado'
                            }];
                    case 13: 
                    // Verificar sessões ativas
                    return [4 /*yield*/, this.cleanupExpiredSessions(patient.id)];
                    case 14:
                        // Verificar sessões ativas
                        _b.sent();
                        return [4 /*yield*/, this.getActiveSessionsCount(patient.id)];
                    case 15:
                        activeSessions = _b.sent();
                        if (!(activeSessions >= this.config.maxConcurrentSessions)) return [3 /*break*/, 17];
                        // Remover sessão mais antiga
                        return [4 /*yield*/, this.removeOldestSession(patient.id)];
                    case 16:
                        // Remover sessão mais antiga
                        _b.sent();
                        _b.label = 17;
                    case 17: return [4 /*yield*/, this.createSession({
                            patientId: patient.id,
                            ipAddress: ipAddress,
                            userAgent: userAgent,
                            deviceFingerprint: deviceFingerprint
                        })];
                    case 18:
                        session = _b.sent();
                        // Registrar login bem-sucedido
                        return [4 /*yield*/, this.recordLoginAttempt({
                                patientId: patient.id,
                                email: email,
                                ipAddress: ipAddress,
                                userAgent: userAgent,
                                success: true,
                                timestamp: new Date()
                            })];
                    case 19:
                        // Registrar login bem-sucedido
                        _b.sent();
                        // Atualizar último login
                        return [4 /*yield*/, this.updateLastLogin(patient.id)];
                    case 20:
                        // Atualizar último login
                        _b.sent();
                        // Log de auditoria
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'patient_portal_login',
                                userId: patient.id,
                                userType: 'patient',
                                resource: 'portal_session',
                                resourceId: session.id,
                                details: {
                                    ipAddress: ipAddress,
                                    userAgent: userAgent,
                                    deviceFingerprint: deviceFingerprint
                                },
                                clinicId: patient.clinic_id
                            })];
                    case 21:
                        // Log de auditoria
                        _b.sent();
                        // Log de segurança
                        return [4 /*yield*/, this.logSecurityEvent({
                                type: 'login',
                                patientId: patient.id,
                                sessionId: session.id,
                                ipAddress: ipAddress,
                                userAgent: userAgent,
                                details: { deviceFingerprint: deviceFingerprint },
                                severity: 'low',
                                timestamp: new Date()
                            })];
                    case 22:
                        // Log de segurança
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                session: session,
                                patient: {
                                    id: patient.id,
                                    name: patient.name,
                                    email: patient.email,
                                    phone: patient.phone,
                                    clinicId: patient.clinic_id
                                }
                            }];
                    case 23:
                        error_1 = _b.sent();
                        console.error('Erro na autenticação do portal:', error_1);
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'patient_portal_login_error',
                                userId: '',
                                userType: 'patient',
                                resource: 'portal_auth',
                                details: {
                                    error: error_1 instanceof Error ? error_1.message : 'Erro desconhecido',
                                    email: email,
                                    ipAddress: ipAddress,
                                    userAgent: userAgent
                                }
                            })];
                    case 24:
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Erro interno do servidor'
                            }];
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verifica código 2FA e completa autenticação
     */
    PortalAuthManager.prototype.verifyTwoFactor = function (email, twoFactorToken, code, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            var isValidToken, patient, session, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.verifyTwoFactorToken(twoFactorToken, code)];
                    case 1:
                        isValidToken = _a.sent();
                        if (!isValidToken) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Código de verificação inválido'
                                }];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .select('*')
                                .eq('email', email.toLowerCase())
                                .single()];
                    case 2:
                        patient = (_a.sent()).data;
                        if (!patient) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Paciente não encontrado'
                                }];
                        }
                        return [4 /*yield*/, this.createSession({
                                patientId: patient.id,
                                ipAddress: ipAddress,
                                userAgent: userAgent
                            })];
                    case 3:
                        session = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                session: session,
                                patient: {
                                    id: patient.id,
                                    name: patient.name,
                                    email: patient.email,
                                    phone: patient.phone,
                                    clinicId: patient.clinic_id
                                }
                            }];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Erro na verificação 2FA:', error_2);
                        return [2 /*return*/, {
                                success: false,
                                error: 'Erro na verificação'
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Valida uma sessão existente
     */
    PortalAuthManager.prototype.validateSession = function (sessionToken, ipAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sessionData, error, session, patient, lastActivity, inactivityLimit, portalSession, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, this.supabase
                                .from('patient_portal_sessions')
                                .select("\n          *,\n          patients (\n            id,\n            name,\n            email,\n            phone,\n            clinic_id,\n            is_active\n          )\n        ")
                                .eq('session_token', sessionToken)
                                .single()];
                    case 1:
                        _a = _b.sent(), sessionData = _a.data, error = _a.error;
                        if (error || !sessionData) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Sessão inválida'
                                }];
                        }
                        session = sessionData;
                        patient = sessionData.patients;
                        if (!(new Date() > new Date(session.expires_at))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.invalidateSession(sessionToken)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Sessão expirada'
                            }];
                    case 3:
                        lastActivity = new Date(session.last_activity);
                        inactivityLimit = new Date(Date.now() - (this.config.sessionInactivityTimeout * 60 * 1000));
                        if (!(lastActivity < inactivityLimit)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.invalidateSession(sessionToken)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Sessão expirada por inatividade'
                            }];
                    case 5:
                        if (!!patient.is_active) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.invalidateSession(sessionToken)];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: 'Conta desativada'
                            }];
                    case 7: 
                    // Atualizar última atividade
                    return [4 /*yield*/, this.updateSessionActivity(sessionToken)];
                    case 8:
                        // Atualizar última atividade
                        _b.sent();
                        portalSession = {
                            id: session.id,
                            patientId: session.patient_id,
                            sessionToken: session.session_token,
                            expiresAt: new Date(session.expires_at),
                            lastActivity: new Date(),
                            ipAddress: session.ip_address,
                            userAgent: session.user_agent,
                            isActive: true
                        };
                        return [2 /*return*/, {
                                success: true,
                                session: portalSession,
                                patient: {
                                    id: patient.id,
                                    name: patient.name,
                                    email: patient.email,
                                    phone: patient.phone,
                                    clinicId: patient.clinic_id
                                }
                            }];
                    case 9:
                        error_3 = _b.sent();
                        console.error('Erro na validação de sessão:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                error: 'Erro na validação'
                            }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Encerra uma sessão
     */
    PortalAuthManager.prototype.logout = function (sessionToken) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getSessionByToken(sessionToken)];
                    case 1:
                        session = _a.sent();
                        if (!session) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.logSecurityEvent({
                                type: 'logout',
                                patientId: session.patientId,
                                sessionId: session.id,
                                ipAddress: session.ipAddress,
                                userAgent: session.userAgent,
                                details: {},
                                severity: 'low',
                                timestamp: new Date()
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.invalidateSession(sessionToken)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5:
                        error_4 = _a.sent();
                        console.error('Erro no logout:', error_4);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Métodos privados de apoio
     */
    PortalAuthManager.prototype.createSession = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionToken, expiresAt, _a, data, error, session;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sessionToken = this.generateSessionToken();
                        expiresAt = new Date(Date.now() + (this.config.sessionDuration * 60 * 1000));
                        return [4 /*yield*/, this.supabase
                                .from('patient_portal_sessions')
                                .insert({
                                patient_id: params.patientId,
                                session_token: sessionToken,
                                expires_at: expiresAt.toISOString(),
                                ip_address: params.ipAddress,
                                user_agent: params.userAgent
                            })
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Erro ao criar sess\u00E3o: ".concat(error.message));
                        }
                        session = {
                            id: data.id,
                            patientId: params.patientId,
                            sessionToken: sessionToken,
                            expiresAt: expiresAt,
                            lastActivity: new Date(),
                            ipAddress: params.ipAddress,
                            userAgent: params.userAgent,
                            isActive: true,
                            deviceFingerprint: params.deviceFingerprint
                        };
                        this.activeSessions.set(sessionToken, session);
                        return [2 /*return*/, session];
                }
            });
        });
    };
    PortalAuthManager.prototype.generateSessionToken = function () {
        return crypto_1.default.randomBytes(32).toString('hex');
    };
    PortalAuthManager.prototype.generateTwoFactorToken = function () {
        return crypto_1.default.randomBytes(16).toString('hex');
    };
    PortalAuthManager.prototype.verifyPassword = function (password, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var bcrypt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bcrypt = require('bcrypt');
                        return [4 /*yield*/, bcrypt.compare(password, hash)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PortalAuthManager.prototype.verifyTwoFactorToken = function (token, code) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar verificação de código 2FA
                // Por enquanto, simulação simples
                return [2 /*return*/, code.length === 6 && /^\d{6}$/.test(code)];
            });
        });
    };
    PortalAuthManager.prototype.sendTwoFactorCode = function (patient, token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar envio de código 2FA via SMS/Email
                console.log("Enviando c\u00F3digo 2FA para ".concat(patient.email));
                return [2 /*return*/];
            });
        });
    };
    PortalAuthManager.prototype.getActiveSessionsCount = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patient_portal_sessions')
                            .select('*', { count: 'exact', head: true })
                            .eq('patient_id', patientId)
                            .gt('expires_at', new Date().toISOString())];
                    case 1:
                        count = (_a.sent()).count;
                        return [2 /*return*/, count || 0];
                }
            });
        });
    };
    PortalAuthManager.prototype.removeOldestSession = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patient_portal_sessions')
                            .select('session_token')
                            .eq('patient_id', patientId)
                            .order('created_at', { ascending: true })
                            .limit(1)
                            .single()];
                    case 1:
                        data = (_a.sent()).data;
                        if (!data) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.invalidateSession(data.session_token)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.invalidateSession = function (sessionToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patient_portal_sessions')
                            .delete()
                            .eq('session_token', sessionToken)];
                    case 1:
                        _a.sent();
                        this.activeSessions.delete(sessionToken);
                        return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.updateSessionActivity = function (sessionToken) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patient_portal_sessions')
                            .update({ last_activity: new Date().toISOString() })
                            .eq('session_token', sessionToken)];
                    case 1:
                        _a.sent();
                        session = this.activeSessions.get(sessionToken);
                        if (session) {
                            session.lastActivity = new Date();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.getSessionByToken = function (sessionToken) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cached = this.activeSessions.get(sessionToken);
                        if (cached)
                            return [2 /*return*/, cached];
                        return [4 /*yield*/, this.supabase
                                .from('patient_portal_sessions')
                                .select('*')
                                .eq('session_token', sessionToken)
                                .single()];
                    case 1:
                        data = (_a.sent()).data;
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                id: data.id,
                                patientId: data.patient_id,
                                sessionToken: data.session_token,
                                expiresAt: new Date(data.expires_at),
                                lastActivity: new Date(data.last_activity),
                                ipAddress: data.ip_address,
                                userAgent: data.user_agent,
                                isActive: true
                            }];
                }
            });
        });
    };
    PortalAuthManager.prototype.getRecentLoginAttempts = function (email, ipAddress) {
        var key = "".concat(email, ":").concat(ipAddress);
        var attempts = this.loginAttempts.get(key) || [];
        var fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        return attempts.filter(function (attempt) { return attempt.timestamp > fifteenMinutesAgo; });
    };
    PortalAuthManager.prototype.recordLoginAttempt = function (attempt) {
        return __awaiter(this, void 0, void 0, function () {
            var loginAttempt, key, attempts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginAttempt = __assign({ id: crypto_1.default.randomUUID(), blocked: false }, attempt);
                        key = "".concat(attempt.email, ":").concat(attempt.ipAddress);
                        attempts = this.loginAttempts.get(key) || [];
                        attempts.push(loginAttempt);
                        this.loginAttempts.set(key, attempts);
                        // Salvar no banco
                        return [4 /*yield*/, this.supabase
                                .from('patient_login_attempts')
                                .insert({
                                patient_id: attempt.patientId,
                                email: attempt.email,
                                ip_address: attempt.ipAddress,
                                user_agent: attempt.userAgent,
                                success: attempt.success,
                                failure_reason: attempt.failureReason,
                                timestamp: attempt.timestamp.toISOString()
                            })];
                    case 1:
                        // Salvar no banco
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.blockIpAddress = function (ipAddress, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.blockedIps.add(ipAddress);
                        // Remover bloqueio após 15 minutos
                        setTimeout(function () {
                            _this.blockedIps.delete(ipAddress);
                        }, 15 * 60 * 1000);
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'ip_blocked',
                                userId: '',
                                userType: 'system',
                                resource: 'security',
                                details: { ipAddress: ipAddress, reason: reason }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.incrementFailedAttempts = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patients')
                            .update({
                            failed_login_attempts: this.supabase.raw('failed_login_attempts + 1')
                        })
                            .eq('id', patientId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.updateLastLogin = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patients')
                            .update({
                            last_login: new Date().toISOString(),
                            failed_login_attempts: 0
                        })
                            .eq('id', patientId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.cleanupExpiredSessions = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = this.supabase
                            .from('patient_portal_sessions')
                            .delete()
                            .lt('expires_at', new Date().toISOString());
                        if (patientId) {
                            query = query.eq('patient_id', patientId);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.logSecurityEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patient_security_events')
                            .insert({
                            event_type: event.type,
                            patient_id: event.patientId,
                            session_id: event.sessionId,
                            ip_address: event.ipAddress,
                            user_agent: event.userAgent,
                            details: event.details,
                            severity: event.severity,
                            timestamp: event.timestamp.toISOString()
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.startSessionCleanup = function () {
        var _this = this;
        // Limpeza a cada 30 minutos
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cleanupExpiredSessions()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 30 * 60 * 1000);
    };
    /**
     * Métodos públicos adicionais
     */
    PortalAuthManager.prototype.changePassword = function (patientId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, isCurrentPasswordValid, passwordValidation, bcrypt, newPasswordHash, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .select('password_hash')
                                .eq('id', patientId)
                                .single()];
                    case 1:
                        patient = (_a.sent()).data;
                        if (!patient) {
                            return [2 /*return*/, { success: false, error: 'Paciente não encontrado' }];
                        }
                        return [4 /*yield*/, this.verifyPassword(currentPassword, patient.password_hash)];
                    case 2:
                        isCurrentPasswordValid = _a.sent();
                        if (!isCurrentPasswordValid) {
                            return [2 /*return*/, { success: false, error: 'Senha atual incorreta' }];
                        }
                        passwordValidation = this.validatePassword(newPassword);
                        if (!passwordValidation.valid) {
                            return [2 /*return*/, { success: false, error: passwordValidation.error }];
                        }
                        bcrypt = require('bcrypt');
                        return [4 /*yield*/, bcrypt.hash(newPassword, 12)];
                    case 3:
                        newPasswordHash = _a.sent();
                        // Atualizar senha
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .update({ password_hash: newPasswordHash })
                                .eq('id', patientId)];
                    case 4:
                        // Atualizar senha
                        _a.sent();
                        // Log de auditoria
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'password_changed',
                                userId: patientId,
                                userType: 'patient',
                                resource: 'patient_account',
                                resourceId: patientId
                            })];
                    case 5:
                        // Log de auditoria
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 6:
                        error_5 = _a.sent();
                        console.error('Erro ao alterar senha:', error_5);
                        return [2 /*return*/, { success: false, error: 'Erro interno do servidor' }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.validatePassword = function (password) {
        var policy = this.config.passwordPolicy;
        if (password.length < policy.minLength) {
            return { valid: false, error: "Senha deve ter pelo menos ".concat(policy.minLength, " caracteres") };
        }
        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            return { valid: false, error: 'Senha deve conter pelo menos uma letra maiúscula' };
        }
        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            return { valid: false, error: 'Senha deve conter pelo menos uma letra minúscula' };
        }
        if (policy.requireNumbers && !/\d/.test(password)) {
            return { valid: false, error: 'Senha deve conter pelo menos um número' };
        }
        if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { valid: false, error: 'Senha deve conter pelo menos um caractere especial' };
        }
        return { valid: true };
    };
    PortalAuthManager.prototype.getActiveSessions = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patient_portal_sessions')
                            .select('*')
                            .eq('patient_id', patientId)
                            .gt('expires_at', new Date().toISOString())
                            .order('last_activity', { ascending: false })];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, (data || []).map(function (session) { return ({
                                id: session.id,
                                patientId: session.patient_id,
                                sessionToken: session.session_token,
                                expiresAt: new Date(session.expires_at),
                                lastActivity: new Date(session.last_activity),
                                ipAddress: session.ip_address,
                                userAgent: session.user_agent,
                                isActive: true
                            }); })];
                }
            });
        });
    };
    PortalAuthManager.prototype.terminateSession = function (patientId, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('patient_portal_sessions')
                                .select('session_token')
                                .eq('id', sessionId)
                                .eq('patient_id', patientId)
                                .single()];
                    case 1:
                        data = (_a.sent()).data;
                        if (!data) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.invalidateSession(data.session_token)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3: return [2 /*return*/, false];
                    case 4:
                        error_6 = _a.sent();
                        console.error('Erro ao terminar sessão:', error_6);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PortalAuthManager.prototype.terminateAllSessions = function (patientId, exceptSessionToken) {
        return __awaiter(this, void 0, void 0, function () {
            var query, count, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('patient_portal_sessions')
                            .delete()
                            .eq('patient_id', patientId);
                        if (exceptSessionToken) {
                            query = query.neq('session_token', exceptSessionToken);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        count = (_a.sent()).count;
                        return [2 /*return*/, count || 0];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Erro ao terminar todas as sessões:', error_7);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PortalAuthManager;
}());
exports.PortalAuthManager = PortalAuthManager;
exports.default = PortalAuthManager;
