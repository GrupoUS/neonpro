"use strict";
/**
 * Session Manager - Core Session Management System
 * Handles intelligent session timeout, concurrent sessions, device tracking, and security monitoring
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.SuspiciousActivityDetector = exports.DeviceTracker = exports.SecurityMonitor = exports.SessionManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var ioredis_1 = require("ioredis");
var events_1 = require("events");
var session_1 = require("@/types/session");
var crypto_1 = require("crypto");
var ua_parser_js_1 = require("ua-parser-js");
var SessionManager = /** @class */ (function (_super) {
    __extends(SessionManager, _super);
    function SessionManager(config) {
        var _this = _super.call(this) || this;
        _this.cleanupInterval = null;
        _this.emergencyControls = null;
        _this.config = config;
        _this.supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        _this.redis = new ioredis_1.default(config.redis.url);
        _this.securityMonitor = new SecurityMonitor(_this.supabase, _this.redis);
        _this.deviceTracker = new DeviceTracker(_this.supabase, _this.redis);
        _this.suspiciousActivityDetector = new SuspiciousActivityDetector(_this.supabase, _this.redis);
        _this.initializeCleanupInterval();
        _this.setupEventHandlers();
        return _this;
    }
    /**
     * Create a new session with comprehensive security checks
     */
    SessionManager.prototype.createSession = function (userId, deviceFingerprint, ipAddress, userAgent, additionalData) {
        return __awaiter(this, void 0, void 0, function () {
            var userRole, policy, deviceInfo, suspiciousActivity, sessionId, now, expiresAt, session, error_1;
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 12, , 14]);
                        // Check emergency controls
                        if ((_b = this.emergencyControls) === null || _b === void 0 ? void 0 : _b.global_kill_switch) {
                            throw new Error('System is in emergency lockdown mode');
                        }
                        return [4 /*yield*/, this.getUserRole(userId)];
                    case 1:
                        userRole = _c.sent();
                        return [4 /*yield*/, this.getSessionPolicy(userRole.id)];
                    case 2:
                        policy = _c.sent();
                        // Check concurrent session limits
                        return [4 /*yield*/, this.enforceConcurrentSessionLimits(userId, policy)];
                    case 3:
                        // Check concurrent session limits
                        _c.sent();
                        return [4 /*yield*/, this.deviceTracker.validateDevice(userId, deviceFingerprint, userAgent)];
                    case 4:
                        deviceInfo = _c.sent();
                        return [4 /*yield*/, this.suspiciousActivityDetector.analyzeLoginAttempt(userId, ipAddress, deviceFingerprint, userAgent)];
                    case 5:
                        suspiciousActivity = _c.sent();
                        if (!(suspiciousActivity.risk_score > 80)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.logSecurityEvent({
                                session_id: '',
                                user_id: userId,
                                event_type: session_1.SecurityEventType.SUSPICIOUS_ACTIVITY,
                                severity: session_1.SecuritySeverity.HIGH,
                                details: suspiciousActivity,
                                ip_address: ipAddress,
                                user_agent: userAgent
                            })];
                    case 6:
                        _c.sent();
                        throw new Error('Login blocked due to suspicious activity');
                    case 7:
                        sessionId = this.generateSessionId();
                        now = new Date();
                        expiresAt = new Date(now.getTime() + (policy.session_timeout_minutes * 60 * 1000));
                        _a = {
                            id: sessionId,
                            user_id: userId,
                            device_fingerprint: deviceFingerprint,
                            device_name: deviceInfo.device_name,
                            ip_address: ipAddress,
                            user_agent: userAgent
                        };
                        return [4 /*yield*/, this.getLocationFromIP(ipAddress)];
                    case 8:
                        session = (_a.location = _c.sent(),
                            _a.created_at = now,
                            _a.last_activity = now,
                            _a.expires_at = expiresAt,
                            _a.is_active = true,
                            _a.security_score = Math.max(0, 100 - suspiciousActivity.risk_score),
                            _a.session_data = additionalData || {},
                            _a);
                        // Store in database and Redis
                        return [4 /*yield*/, this.storeSession(session)];
                    case 9:
                        // Store in database and Redis
                        _c.sent();
                        return [4 /*yield*/, this.cacheSession(session)];
                    case 10:
                        _c.sent();
                        // Log session creation
                        return [4 /*yield*/, this.logAuditEvent({
                                session_id: sessionId,
                                user_id: userId,
                                action: session_1.SessionAction.CREATE,
                                details: { device_fingerprint: deviceFingerprint, security_score: session.security_score },
                                ip_address: ipAddress,
                                user_agent: userAgent,
                                success: true
                            })];
                    case 11:
                        // Log session creation
                        _c.sent();
                        // Emit session created event
                        this.emit('sessionCreated', session);
                        return [2 /*return*/, session];
                    case 12:
                        error_1 = _c.sent();
                        return [4 /*yield*/, this.logAuditEvent({
                                session_id: '',
                                user_id: userId,
                                action: session_1.SessionAction.CREATE,
                                details: { error: error_1.message },
                                ip_address: ipAddress,
                                user_agent: userAgent,
                                success: false,
                                error_message: error_1.message
                            })];
                    case 13:
                        _c.sent();
                        throw error_1;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate session with security checks
     */
    SessionManager.prototype.validateSession = function (sessionId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            var session, securityChecks, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        // Check emergency controls
                        if ((_a = this.emergencyControls) === null || _a === void 0 ? void 0 : _a.global_kill_switch) {
                            return [2 /*return*/, {
                                    valid: false,
                                    errors: ['System is in emergency lockdown mode'],
                                    security_score: 0
                                }];
                        }
                        return [4 /*yield*/, this.getCachedSession(sessionId)];
                    case 1:
                        session = _b.sent();
                        if (!!session) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getSessionFromDatabase(sessionId)];
                    case 2:
                        session = _b.sent();
                        if (!session) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.cacheSession(session)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        if (!session || !session.is_active) {
                            return [2 /*return*/, {
                                    valid: false,
                                    errors: ['Session not found or inactive'],
                                    security_score: 0
                                }];
                        }
                        if (!(new Date() > session.expires_at)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.expireSession(sessionId)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, {
                                valid: false,
                                errors: ['Session expired'],
                                security_score: 0
                            }];
                    case 6: return [4 /*yield*/, this.performSecurityChecks(session, ipAddress, userAgent)];
                    case 7:
                        securityChecks = _b.sent();
                        if (!!securityChecks.passed) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.logSecurityEvent({
                                session_id: sessionId,
                                user_id: session.user_id,
                                event_type: session_1.SecurityEventType.SESSION_HIJACK_ATTEMPT,
                                severity: session_1.SecuritySeverity.HIGH,
                                details: securityChecks.violations,
                                ip_address: ipAddress || '',
                                user_agent: userAgent || ''
                            })];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, {
                                valid: false,
                                errors: securityChecks.violations,
                                security_score: securityChecks.security_score,
                                warnings: ['Security violations detected']
                            }];
                    case 9: 
                    // Update last activity
                    return [4 /*yield*/, this.updateSessionActivity(sessionId)];
                    case 10:
                        // Update last activity
                        _b.sent();
                        return [2 /*return*/, {
                                valid: true,
                                session: session,
                                security_score: securityChecks.security_score
                            }];
                    case 11:
                        error_2 = _b.sent();
                        return [2 /*return*/, {
                                valid: false,
                                errors: [error_2.message],
                                security_score: 0
                            }];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Extend session with activity-based logic
     */
    SessionManager.prototype.extendSession = function (sessionId, additionalMinutes) {
        return __awaiter(this, void 0, void 0, function () {
            var session, userRole, policy, extensionMinutes, newExpiresAt, updatedSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSession(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            throw new Error('Session not found');
                        }
                        return [4 /*yield*/, this.getUserRole(session.user_id)];
                    case 2:
                        userRole = _a.sent();
                        return [4 /*yield*/, this.getSessionPolicy(userRole.id)];
                    case 3:
                        policy = _a.sent();
                        extensionMinutes = additionalMinutes || policy.session_timeout_minutes;
                        newExpiresAt = new Date(Date.now() + (extensionMinutes * 60 * 1000));
                        updatedSession = __assign(__assign({}, session), { expires_at: newExpiresAt, last_activity: new Date() });
                        return [4 /*yield*/, this.updateSession(updatedSession)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.cacheSession(updatedSession)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.logAuditEvent({
                                session_id: sessionId,
                                user_id: session.user_id,
                                action: session_1.SessionAction.EXTEND,
                                details: { extension_minutes: extensionMinutes },
                                ip_address: session.ip_address,
                                user_agent: session.user_agent,
                                success: true
                            })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, updatedSession];
                }
            });
        });
    };
    /**
     * Terminate session
     */
    SessionManager.prototype.terminateSession = function (sessionId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSession(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            return [2 /*return*/];
                        }
                        // Mark as inactive
                        return [4 /*yield*/, this.updateSession(__assign(__assign({}, session), { is_active: false }))];
                    case 2:
                        // Mark as inactive
                        _a.sent();
                        return [4 /*yield*/, this.removeCachedSession(sessionId)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.logAuditEvent({
                                session_id: sessionId,
                                user_id: session.user_id,
                                action: session_1.SessionAction.TERMINATE,
                                details: { reason: reason || 'Manual termination' },
                                ip_address: session.ip_address,
                                user_agent: session.user_agent,
                                success: true
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.logSecurityEvent({
                                session_id: sessionId,
                                user_id: session.user_id,
                                event_type: session_1.SecurityEventType.SESSION_TERMINATED,
                                severity: session_1.SecuritySeverity.LOW,
                                details: { reason: reason },
                                ip_address: session.ip_address,
                                user_agent: session.user_agent
                            })];
                    case 5:
                        _a.sent();
                        this.emit('sessionTerminated', session);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get active sessions for user
     */
    SessionManager.prototype.getUserActiveSessions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('user_sessions')
                            .select('*')
                            .eq('user_id', userId)
                            .eq('is_active', true)
                            .order('last_activity', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data.map(this.mapDatabaseRowToSession)];
                }
            });
        });
    };
    /**
     * Emergency session controls
     */
    SessionManager.prototype.activateEmergencyControls = function (controls, initiatedBy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.emergencyControls = __assign(__assign({ global_kill_switch: false, lockdown_mode: false, emergency_access_enabled: false, incident_response_active: false }, controls), { initiated_by: initiatedBy, initiated_at: new Date() });
                        if (!controls.global_kill_switch) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.terminateAllSessions('Emergency kill switch activated')];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Store emergency controls in Redis
                    return [4 /*yield*/, this.redis.set("".concat(this.config.redis.prefix, "emergency_controls"), JSON.stringify(this.emergencyControls), 'EX', 3600 // 1 hour expiry
                        )];
                    case 3:
                        // Store emergency controls in Redis
                        _a.sent();
                        this.emit('emergencyControlsActivated', this.emergencyControls);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cross-device session synchronization
     */
    SessionManager.prototype.syncCrossDeviceSessions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var activeSessions, devices, userPrefs, syncData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserActiveSessions(userId)];
                    case 1:
                        activeSessions = _a.sent();
                        return [4 /*yield*/, this.deviceTracker.getUserDevices(userId)];
                    case 2:
                        devices = _a.sent();
                        return [4 /*yield*/, this.supabase
                                .from('user_preferences')
                                .select('*')
                                .eq('user_id', userId)
                                .single()];
                    case 3:
                        userPrefs = (_a.sent()).data;
                        syncData = {
                            user_id: userId,
                            sync_data: {
                                preferences: (userPrefs === null || userPrefs === void 0 ? void 0 : userPrefs.preferences) || {},
                                ui_state: (userPrefs === null || userPrefs === void 0 ? void 0 : userPrefs.ui_state) || {},
                                notifications: [], // TODO: Implement notifications
                                last_sync: new Date()
                            },
                            devices: devices.map(function (device) { return ({
                                device_fingerprint: device.device_fingerprint,
                                last_sync: device.last_used,
                                sync_status: 'synced'
                            }); })
                        };
                        // Cache sync data
                        return [4 /*yield*/, this.redis.set("".concat(this.config.redis.prefix, "sync:").concat(userId), JSON.stringify(syncData), 'EX', 300 // 5 minutes
                            )];
                    case 4:
                        // Cache sync data
                        _a.sent();
                        return [2 /*return*/, syncData];
                }
            });
        });
    };
    // Private helper methods
    SessionManager.prototype.generateSessionId = function () {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    };
    SessionManager.prototype.getUserRole = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('user_roles')
                            .select('role_id, roles(id, name)')
                            .eq('user_id', userId)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data.roles];
                }
            });
        });
    };
    SessionManager.prototype.getSessionPolicy = function (roleId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('session_policies')
                            .select('*')
                            .eq('role_id', roleId)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            // Return default policy
                            return [2 /*return*/, {
                                    id: 'default',
                                    role_id: roleId,
                                    role_name: 'default',
                                    max_concurrent_sessions: 3,
                                    session_timeout_minutes: 30,
                                    idle_timeout_minutes: 15,
                                    require_device_registration: false,
                                    allow_concurrent_devices: true,
                                    security_level: session_1.SecurityLevel.STANDARD,
                                    ip_restriction_enabled: false,
                                    geo_restriction_enabled: false,
                                    created_at: new Date(),
                                    updated_at: new Date()
                                }];
                        }
                        return [2 /*return*/, this.mapDatabaseRowToSessionPolicy(data)];
                }
            });
        });
    };
    SessionManager.prototype.enforceConcurrentSessionLimits = function (userId, policy) {
        return __awaiter(this, void 0, void 0, function () {
            var activeSessions, oldestSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserActiveSessions(userId)];
                    case 1:
                        activeSessions = _a.sent();
                        if (!(activeSessions.length >= policy.max_concurrent_sessions)) return [3 /*break*/, 4];
                        oldestSession = activeSessions[activeSessions.length - 1];
                        return [4 /*yield*/, this.terminateSession(oldestSession.id, 'Concurrent session limit exceeded')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.logSecurityEvent({
                                session_id: oldestSession.id,
                                user_id: userId,
                                event_type: session_1.SecurityEventType.CONCURRENT_LIMIT_EXCEEDED,
                                severity: session_1.SecuritySeverity.MEDIUM,
                                details: { limit: policy.max_concurrent_sessions, terminated_session: oldestSession.id },
                                ip_address: oldestSession.ip_address,
                                user_agent: oldestSession.user_agent
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.getLocationFromIP = function (ipAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement IP geolocation
                return [2 /*return*/, null];
            });
        });
    };
    SessionManager.prototype.storeSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('user_sessions')
                            .insert(this.mapSessionToDatabaseRow(session))];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.cacheSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.set("".concat(this.config.redis.prefix, "session:").concat(session.id), JSON.stringify(session), 'EX', Math.floor((session.expires_at.getTime() - Date.now()) / 1000))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.getCachedSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var cached;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.get("".concat(this.config.redis.prefix, "session:").concat(sessionId))];
                    case 1:
                        cached = _a.sent();
                        return [2 /*return*/, cached ? JSON.parse(cached) : null];
                }
            });
        });
    };
    SessionManager.prototype.getSessionFromDatabase = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('user_sessions')
                            .select('*')
                            .eq('id', sessionId)
                            .eq('is_active', true)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.mapDatabaseRowToSession(data)];
                }
            });
        });
    };
    SessionManager.prototype.getSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCachedSession(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!!session) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getSessionFromDatabase(sessionId)];
                    case 2:
                        session = _a.sent();
                        if (!session) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.cacheSession(session)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, session];
                }
            });
        });
    };
    SessionManager.prototype.updateSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('user_sessions')
                            .update(this.mapSessionToDatabaseRow(session))
                            .eq('id', session.id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.updateSessionActivity = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, cached;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        // Update in database
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .update({ last_activity: now.toISOString() })
                                .eq('id', sessionId)];
                    case 1:
                        // Update in database
                        _a.sent();
                        return [4 /*yield*/, this.getCachedSession(sessionId)];
                    case 2:
                        cached = _a.sent();
                        if (!cached) return [3 /*break*/, 4];
                        cached.last_activity = now;
                        return [4 /*yield*/, this.cacheSession(cached)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.removeCachedSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.del("".concat(this.config.redis.prefix, "session:").concat(sessionId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.expireSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSession(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!session) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.updateSession(__assign(__assign({}, session), { is_active: false }))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.removeCachedSession(sessionId)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.logAuditEvent({
                                session_id: sessionId,
                                user_id: session.user_id,
                                action: session_1.SessionAction.EXPIRE,
                                details: { expired_at: new Date() },
                                ip_address: session.ip_address,
                                user_agent: session.user_agent,
                                success: true
                            })];
                    case 4:
                        _a.sent();
                        this.emit('sessionExpired', session);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.performSecurityChecks = function (session, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            var violations, securityScore, suspiciousActivity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        violations = [];
                        securityScore = session.security_score;
                        // IP address validation
                        if (ipAddress && ipAddress !== session.ip_address) {
                            violations.push('IP address mismatch');
                            securityScore -= 20;
                        }
                        // User agent validation
                        if (userAgent && userAgent !== session.user_agent) {
                            violations.push('User agent mismatch');
                            securityScore -= 15;
                        }
                        if (!ipAddress) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.suspiciousActivityDetector.analyzeSessionActivity(session.user_id, session.id, ipAddress, userAgent || '')];
                    case 1:
                        suspiciousActivity = _a.sent();
                        if (suspiciousActivity.risk_score > 50) {
                            violations.push('Suspicious activity detected');
                            securityScore -= suspiciousActivity.risk_score;
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, {
                            passed: violations.length === 0 && securityScore > 30,
                            violations: violations,
                            security_score: Math.max(0, securityScore)
                        }];
                }
            });
        });
    };
    SessionManager.prototype.logSecurityEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var securityEvent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        securityEvent = __assign({ id: (0, crypto_1.randomBytes)(16).toString('hex'), timestamp: new Date(), resolved: false }, event);
                        return [4 /*yield*/, this.supabase
                                .from('session_security_events')
                                .insert(this.mapSecurityEventToDatabaseRow(securityEvent))];
                    case 1:
                        _a.sent();
                        this.emit('securityEvent', securityEvent);
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.logAuditEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var auditEvent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auditEvent = __assign({ id: (0, crypto_1.randomBytes)(16).toString('hex'), timestamp: new Date() }, event);
                        return [4 /*yield*/, this.supabase
                                .from('session_audit_logs')
                                .insert(this.mapAuditEventToDatabaseRow(auditEvent))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.terminateAllSessions = function (reason) {
        return __awaiter(this, void 0, void 0, function () {
            var sessions, _i, sessions_1, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('user_sessions')
                            .select('*')
                            .eq('is_active', true)];
                    case 1:
                        sessions = (_a.sent()).data;
                        if (!sessions) return [3 /*break*/, 5];
                        _i = 0, sessions_1 = sessions;
                        _a.label = 2;
                    case 2:
                        if (!(_i < sessions_1.length)) return [3 /*break*/, 5];
                        session = sessions_1[_i];
                        return [4 /*yield*/, this.terminateSession(session.id, reason)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.initializeCleanupInterval = function () {
        var _this = this;
        this.cleanupInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cleanupExpiredSessions()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, this.config.policies.cleanup_interval_minutes * 60 * 1000);
    };
    SessionManager.prototype.cleanupExpiredSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var expiredSessions, _i, expiredSessions_1, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('user_sessions')
                            .select('*')
                            .eq('is_active', true)
                            .lt('expires_at', new Date().toISOString())];
                    case 1:
                        expiredSessions = (_a.sent()).data;
                        if (!expiredSessions) return [3 /*break*/, 6];
                        _i = 0, expiredSessions_1 = expiredSessions;
                        _a.label = 2;
                    case 2:
                        if (!(_i < expiredSessions_1.length)) return [3 /*break*/, 5];
                        session = expiredSessions_1[_i];
                        return [4 /*yield*/, this.expireSession(session.id)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.emit('sessionCleanup', expiredSessions.map(this.mapDatabaseRowToSession));
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.setupEventHandlers = function () {
        this.on('sessionCreated', function (session) {
            console.log("Session created for user ".concat(session.user_id, ": ").concat(session.id));
        });
        this.on('sessionExpired', function (session) {
            console.log("Session expired for user ".concat(session.user_id, ": ").concat(session.id));
        });
        this.on('securityEvent', function (event) {
            console.log("Security event: ".concat(event.event_type, " - ").concat(event.severity));
        });
    };
    // Mapping functions
    SessionManager.prototype.mapSessionToDatabaseRow = function (session) {
        return {
            id: session.id,
            user_id: session.user_id,
            device_fingerprint: session.device_fingerprint,
            device_name: session.device_name,
            ip_address: session.ip_address,
            user_agent: session.user_agent,
            location_data: session.location,
            created_at: session.created_at.toISOString(),
            last_activity: session.last_activity.toISOString(),
            expires_at: session.expires_at.toISOString(),
            is_active: session.is_active,
            security_score: session.security_score,
            session_data: session.session_data
        };
    };
    SessionManager.prototype.mapDatabaseRowToSession = function (row) {
        return {
            id: row.id,
            user_id: row.user_id,
            device_fingerprint: row.device_fingerprint,
            device_name: row.device_name,
            ip_address: row.ip_address,
            user_agent: row.user_agent,
            location: row.location_data,
            created_at: new Date(row.created_at),
            last_activity: new Date(row.last_activity),
            expires_at: new Date(row.expires_at),
            is_active: row.is_active,
            security_score: row.security_score,
            session_data: row.session_data
        };
    };
    SessionManager.prototype.mapDatabaseRowToSessionPolicy = function (row) {
        return {
            id: row.id,
            role_id: row.role_id,
            role_name: row.role_name,
            max_concurrent_sessions: row.max_concurrent_sessions,
            session_timeout_minutes: row.session_timeout_minutes,
            idle_timeout_minutes: row.idle_timeout_minutes,
            require_device_registration: row.require_device_registration,
            allow_concurrent_devices: row.allow_concurrent_devices,
            security_level: row.security_level,
            ip_restriction_enabled: row.ip_restriction_enabled,
            allowed_ip_ranges: row.allowed_ip_ranges,
            geo_restriction_enabled: row.geo_restriction_enabled,
            allowed_countries: row.allowed_countries,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    };
    SessionManager.prototype.mapSecurityEventToDatabaseRow = function (event) {
        return {
            id: event.id,
            session_id: event.session_id,
            user_id: event.user_id,
            event_type: event.event_type,
            severity: event.severity,
            details: event.details,
            ip_address: event.ip_address,
            user_agent: event.user_agent,
            timestamp: event.timestamp.toISOString(),
            resolved: event.resolved,
            resolution_notes: event.resolution_notes
        };
    };
    SessionManager.prototype.mapAuditEventToDatabaseRow = function (event) {
        return {
            id: event.id,
            session_id: event.session_id,
            user_id: event.user_id,
            action: event.action,
            details: event.details,
            ip_address: event.ip_address,
            user_agent: event.user_agent,
            timestamp: event.timestamp.toISOString(),
            success: event.success,
            error_message: event.error_message
        };
    };
    // Cleanup
    SessionManager.prototype.destroy = function () {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.redis.disconnect();
        this.removeAllListeners();
    };
    return SessionManager;
}(events_1.EventEmitter));
exports.SessionManager = SessionManager;
// Helper classes (to be implemented in separate files)
var SecurityMonitor = /** @class */ (function () {
    function SecurityMonitor(supabase, redis) {
        this.supabase = supabase;
        this.redis = redis;
    }
    SecurityMonitor.prototype.monitorSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return SecurityMonitor;
}());
exports.SecurityMonitor = SecurityMonitor;
var DeviceTracker = /** @class */ (function () {
    function DeviceTracker(supabase, redis) {
        this.supabase = supabase;
        this.redis = redis;
    }
    DeviceTracker.prototype.validateDevice = function (userId, deviceFingerprint, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            var parser, result;
            return __generator(this, function (_a) {
                parser = new ua_parser_js_1.UAParser(userAgent);
                result = parser.getResult();
                return [2 /*return*/, {
                        device_name: "".concat(result.browser.name, " on ").concat(result.os.name),
                        device_type: this.getDeviceType(result),
                        trusted: false // TODO: Implement device trust logic
                    }];
            });
        });
    };
    DeviceTracker.prototype.getUserDevices = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('device_registrations')
                            .select('*')
                            .eq('user_id', userId)
                            .eq('is_active', true)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    DeviceTracker.prototype.getDeviceType = function (result) {
        if (result.device.type === 'mobile')
            return session_1.DeviceType.MOBILE;
        if (result.device.type === 'tablet')
            return session_1.DeviceType.TABLET;
        return session_1.DeviceType.DESKTOP;
    };
    return DeviceTracker;
}());
exports.DeviceTracker = DeviceTracker;
var SuspiciousActivityDetector = /** @class */ (function () {
    function SuspiciousActivityDetector(supabase, redis) {
        this.supabase = supabase;
        this.redis = redis;
    }
    SuspiciousActivityDetector.prototype.analyzeLoginAttempt = function (userId, ipAddress, deviceFingerprint, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement sophisticated suspicious activity detection
                return [2 /*return*/, {
                        id: (0, crypto_1.randomBytes)(16).toString('hex'),
                        user_id: userId,
                        activity_type: session_1.SuspiciousActivityType.NEW_DEVICE_LOGIN,
                        risk_score: 25, // Low risk by default
                        details: {
                            ip_address: ipAddress,
                            device_fingerprint: deviceFingerprint,
                            user_agent: userAgent
                        },
                        detected_at: new Date(),
                        auto_resolved: false,
                        manual_review_required: false,
                        status: 'pending'
                    }];
            });
        });
    };
    SuspiciousActivityDetector.prototype.analyzeSessionActivity = function (userId, sessionId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement session activity analysis
                return [2 /*return*/, {
                        id: (0, crypto_1.randomBytes)(16).toString('hex'),
                        user_id: userId,
                        session_id: sessionId,
                        activity_type: session_1.SuspiciousActivityType.BEHAVIORAL_ANOMALY,
                        risk_score: 10, // Very low risk by default
                        details: {
                            ip_address: ipAddress,
                            user_agent: userAgent
                        },
                        detected_at: new Date(),
                        auto_resolved: true,
                        manual_review_required: false,
                        status: 'resolved'
                    }];
            });
        });
    };
    return SuspiciousActivityDetector;
}());
exports.SuspiciousActivityDetector = SuspiciousActivityDetector;
