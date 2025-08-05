"use strict";
/**
 * Session Manager - Core Session Management
 *
 * Handles session lifecycle, validation, and security for the NeonPro platform.
 * Provides intelligent session management with security monitoring and LGPD compliance.
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
exports.SessionManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var ioredis_1 = require("ioredis");
var events_1 = require("events");
var types_1 = require("./types");
var security_monitor_1 = require("./security-monitor");
var device_manager_1 = require("./device-manager");
var audit_logger_1 = require("./audit-logger");
var SessionManager = /** @class */ (function (_super) {
    __extends(SessionManager, _super);
    function SessionManager(config) {
        var _this = _super.call(this) || this;
        _this.config = config;
        _this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        _this.redis = new ioredis_1.default(config.redis.url, {
            keyPrefix: config.redis.prefix,
            maxRetriesPerRequest: config.redis.maxRetries,
            retryDelayOnFailover: config.redis.retryDelay
        });
        _this.securityMonitor = new security_monitor_1.SecurityMonitor(config.security, _this.supabase);
        _this.deviceManager = new device_manager_1.DeviceManager(_this.supabase);
        _this.auditLogger = new audit_logger_1.AuditLogger(_this.supabase);
        _this.setupEventHandlers();
        _this.startCleanupProcess();
        return _this;
    }
    // ============================================================================
    // SESSION LIFECYCLE MANAGEMENT
    // ============================================================================
    /**
     * Create a new user session with security validation
     */
    SessionManager.prototype.createSession = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var securityValidation, device, sessionId, now, expiresAt, session, dbError, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        // Validate user and clinic
                        return [4 /*yield*/, this.validateUserAccess(params.userId, params.clinicId)];
                    case 1:
                        // Validate user and clinic
                        _a.sent();
                        // Check concurrent session limits
                        return [4 /*yield*/, this.enforceSessionLimits(params.userId, params.clinicId)];
                    case 2:
                        // Check concurrent session limits
                        _a.sent();
                        return [4 /*yield*/, this.securityMonitor.validateSessionCreation({
                                userId: params.userId,
                                ipAddress: params.ipAddress,
                                deviceFingerprint: params.deviceFingerprint,
                                location: params.location
                            })];
                    case 3:
                        securityValidation = _a.sent();
                        if (!securityValidation.allowed) {
                            throw new types_1.SessionError('Session creation blocked by security policy', 'SECURITY_VIOLATION', { reasons: securityValidation.reasons });
                        }
                        return [4 /*yield*/, this.deviceManager.registerOrValidateDevice({
                                userId: params.userId,
                                clinicId: params.clinicId,
                                fingerprint: params.deviceFingerprint,
                                ipAddress: params.ipAddress,
                                userAgent: params.userAgent
                            })];
                    case 4:
                        device = _a.sent();
                        sessionId = this.generateSessionId();
                        now = new Date();
                        expiresAt = new Date(now.getTime() + (params.timeoutMinutes || 480) * 60 * 1000);
                        session = {
                            id: sessionId,
                            userId: params.userId,
                            clinicId: params.clinicId,
                            deviceFingerprint: device.deviceFingerprint,
                            deviceName: device.deviceName,
                            ipAddress: params.ipAddress,
                            userAgent: params.userAgent,
                            location: params.location,
                            createdAt: now,
                            lastActivity: now,
                            expiresAt: expiresAt,
                            isActive: true,
                            securityScore: securityValidation.securityScore,
                            sessionData: {},
                            metadata: params.metadata
                        };
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .insert({
                                id: session.id,
                                user_id: session.userId,
                                clinic_id: session.clinicId,
                                device_fingerprint: session.deviceFingerprint,
                                device_name: session.deviceName,
                                ip_address: session.ipAddress,
                                user_agent: session.userAgent,
                                location: session.location,
                                created_at: session.createdAt.toISOString(),
                                last_activity: session.lastActivity.toISOString(),
                                expires_at: session.expiresAt.toISOString(),
                                is_active: session.isActive,
                                security_score: session.securityScore,
                                session_data: session.sessionData,
                                metadata: session.metadata
                            })];
                    case 5:
                        dbError = (_a.sent()).error;
                        if (dbError) {
                            throw new types_1.SessionError('Failed to create session in database', 'SYSTEM_ERROR', { error: dbError });
                        }
                        // Store in Redis for fast access
                        return [4 /*yield*/, this.redis.setex("session:".concat(sessionId), Math.floor((expiresAt.getTime() - now.getTime()) / 1000), JSON.stringify(session))];
                    case 6:
                        // Store in Redis for fast access
                        _a.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.logSessionEvent({
                                sessionId: sessionId,
                                userId: params.userId,
                                clinicId: params.clinicId,
                                action: 'session_created',
                                details: {
                                    deviceFingerprint: device.deviceFingerprint,
                                    securityScore: securityValidation.securityScore
                                },
                                ipAddress: params.ipAddress,
                                userAgent: params.userAgent,
                                location: params.location
                            })];
                    case 7:
                        // Log audit event
                        _a.sent();
                        // Emit event
                        this.emit('session_created', { session: session, device: device });
                        return [2 /*return*/, session];
                    case 8:
                        error_1 = _a.sent();
                        if (error_1 instanceof types_1.SessionError) {
                            throw error_1;
                        }
                        throw new types_1.SessionError('Failed to create session', 'SYSTEM_ERROR', { error: error_1 });
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate an existing session
     */
    SessionManager.prototype.validateSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, securityValidation, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        return [4 /*yield*/, this.getSessionFromCache(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!!session) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getSessionFromDatabase(sessionId)];
                    case 2:
                        // Fallback to database
                        session = _a.sent();
                        if (!session) return [3 /*break*/, 4];
                        // Restore to cache
                        return [4 /*yield*/, this.cacheSession(session)];
                    case 3:
                        // Restore to cache
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!session) {
                            return [2 /*return*/, {
                                    isValid: false,
                                    reason: 'Session not found'
                                }];
                        }
                        if (!(session.expiresAt < new Date())) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.terminateSession(sessionId, 'expired')];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, {
                                isValid: false,
                                reason: 'Session expired'
                            }];
                    case 6:
                        // Check if session is active
                        if (!session.isActive) {
                            return [2 /*return*/, {
                                    isValid: false,
                                    reason: 'Session is inactive'
                                }];
                        }
                        return [4 /*yield*/, this.securityMonitor.validateSessionActivity(session)];
                    case 7:
                        securityValidation = _a.sent();
                        if (!!securityValidation.allowed) return [3 /*break*/, 9];
                        // Log security event
                        return [4 /*yield*/, this.logSecurityEvent({
                                sessionId: sessionId,
                                userId: session.userId,
                                clinicId: session.clinicId,
                                eventType: 'session_hijack_attempt',
                                severity: 'high',
                                description: 'Session validation failed security checks',
                                details: securityValidation.reasons,
                                ipAddress: session.ipAddress,
                                userAgent: session.userAgent,
                                location: session.location
                            })];
                    case 8:
                        // Log security event
                        _a.sent();
                        return [2 /*return*/, {
                                isValid: false,
                                reason: 'Security validation failed',
                                requiresAction: ['terminate_session', 'require_mfa']
                            }];
                    case 9: 
                    // Update last activity
                    return [4 /*yield*/, this.updateLastActivity(sessionId)];
                    case 10:
                        // Update last activity
                        _a.sent();
                        return [2 /*return*/, {
                                isValid: true,
                                session: session,
                                securityEvents: securityValidation.events
                            }];
                    case 11:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                isValid: false,
                                reason: 'Validation error',
                                requiresAction: ['log_event']
                            }];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Renew an existing session
     */
    SessionManager.prototype.renewSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, session, now, newExpiresAt, updatedSession, dbError, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.validateSession(sessionId)];
                    case 1:
                        validation = _a.sent();
                        if (!validation.isValid || !validation.session) {
                            throw new types_1.SessionError('Cannot renew invalid session', 'SESSION_INVALID');
                        }
                        session = validation.session;
                        now = new Date();
                        newExpiresAt = new Date(now.getTime() + this.config.security.tokenExpiry * 60 * 1000);
                        updatedSession = __assign(__assign({}, session), { lastActivity: now, expiresAt: newExpiresAt });
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .update({
                                last_activity: now.toISOString(),
                                expires_at: newExpiresAt.toISOString()
                            })
                                .eq('id', sessionId)];
                    case 2:
                        dbError = (_a.sent()).error;
                        if (dbError) {
                            throw new types_1.SessionError('Failed to renew session in database', 'SYSTEM_ERROR', { error: dbError });
                        }
                        // Update cache
                        return [4 /*yield*/, this.cacheSession(updatedSession)];
                    case 3:
                        // Update cache
                        _a.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.logSessionEvent({
                                sessionId: sessionId,
                                userId: session.userId,
                                clinicId: session.clinicId,
                                action: 'session_renewed',
                                details: { newExpiresAt: newExpiresAt },
                                ipAddress: session.ipAddress,
                                userAgent: session.userAgent,
                                location: session.location
                            })];
                    case 4:
                        // Log audit event
                        _a.sent();
                        // Emit event
                        this.emit('session_renewed', { session: updatedSession });
                        return [2 /*return*/, updatedSession];
                    case 5:
                        error_3 = _a.sent();
                        if (error_3 instanceof types_1.SessionError) {
                            throw error_3;
                        }
                        throw new types_1.SessionError('Failed to renew session', 'SYSTEM_ERROR', { error: error_3 });
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Terminate a session
     */
    SessionManager.prototype.terminateSession = function (sessionId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var session, _a, dbError, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.getSessionFromCache(sessionId)];
                    case 1:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getSessionFromDatabase(sessionId)];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        session = _a;
                        if (!session) {
                            return [2 /*return*/]; // Session doesn't exist, nothing to terminate
                        }
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .update({
                                is_active: false,
                                terminated_at: new Date().toISOString(),
                                termination_reason: reason || 'manual'
                            })
                                .eq('id', sessionId)];
                    case 4:
                        dbError = (_b.sent()).error;
                        if (dbError) {
                            throw new types_1.SessionError('Failed to terminate session in database', 'SYSTEM_ERROR', { error: dbError });
                        }
                        // Remove from cache
                        return [4 /*yield*/, this.redis.del("session:".concat(sessionId))];
                    case 5:
                        // Remove from cache
                        _b.sent();
                        // Log audit event
                        return [4 /*yield*/, this.auditLogger.logSessionEvent({
                                sessionId: sessionId,
                                userId: session.userId,
                                clinicId: session.clinicId,
                                action: 'session_terminated',
                                details: { reason: reason || 'manual' },
                                ipAddress: session.ipAddress,
                                userAgent: session.userAgent,
                                location: session.location
                            })];
                    case 6:
                        // Log audit event
                        _b.sent();
                        // Emit event
                        this.emit('session_terminated', { sessionId: sessionId, userId: session.userId, reason: reason });
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _b.sent();
                        if (error_4 instanceof types_1.SessionError) {
                            throw error_4;
                        }
                        throw new types_1.SessionError('Failed to terminate session', 'SYSTEM_ERROR', { error: error_4 });
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Terminate all sessions for a user
     */
    SessionManager.prototype.terminateAllSessions = function (userId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var sessions, error_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUserSessions(userId)];
                    case 1:
                        sessions = _a.sent();
                        return [4 /*yield*/, Promise.all(sessions.map(function (session) { return _this.terminateSession(session.id, reason); }))];
                    case 2:
                        _a.sent();
                        // Emit event
                        this.emit('all_sessions_terminated', { userId: userId, reason: reason, count: sessions.length });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        throw new types_1.SessionError('Failed to terminate all sessions', 'SYSTEM_ERROR', { error: error_5 });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // SESSION QUERIES
    // ============================================================================
    /**
     * Get all sessions for a user
     */
    SessionManager.prototype.getUserSessions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .select('*')
                                .eq('user_id', userId)
                                .eq('is_active', true)
                                .order('last_activity', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new types_1.SessionError('Failed to fetch user sessions', 'SYSTEM_ERROR', { error: error });
                        }
                        return [2 /*return*/, data.map(this.mapDatabaseToSession)];
                    case 2:
                        error_6 = _b.sent();
                        if (error_6 instanceof types_1.SessionError) {
                            throw error_6;
                        }
                        throw new types_1.SessionError('Failed to get user sessions', 'SYSTEM_ERROR', { error: error_6 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all active sessions for a clinic
     */
    SessionManager.prototype.getActiveSessions = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .eq('is_active', true)
                                .gte('expires_at', new Date().toISOString())
                                .order('last_activity', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new types_1.SessionError('Failed to fetch active sessions', 'SYSTEM_ERROR', { error: error });
                        }
                        return [2 /*return*/, data.map(this.mapDatabaseToSession)];
                    case 2:
                        error_7 = _b.sent();
                        if (error_7 instanceof types_1.SessionError) {
                            throw error_7;
                        }
                        throw new types_1.SessionError('Failed to get active sessions', 'SYSTEM_ERROR', { error: error_7 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search sessions with filters and pagination
     */
    SessionManager.prototype.searchSessions = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var query, filter, sortField, offset, _a, data, error, count, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('user_sessions')
                            .select('*', { count: 'exact' });
                        // Apply filters
                        if (params.filter) {
                            filter = params.filter;
                            if (filter.userId) {
                                query = query.eq('user_id', filter.userId);
                            }
                            if (filter.clinicId) {
                                query = query.eq('clinic_id', filter.clinicId);
                            }
                            if (filter.status === 'active') {
                                query = query.eq('is_active', true).gte('expires_at', new Date().toISOString());
                            }
                            else if (filter.status === 'expired') {
                                query = query.lt('expires_at', new Date().toISOString());
                            }
                            else if (filter.status === 'terminated') {
                                query = query.eq('is_active', false);
                            }
                            if (filter.ipAddress) {
                                query = query.eq('ip_address', filter.ipAddress);
                            }
                            if (filter.createdAfter) {
                                query = query.gte('created_at', filter.createdAfter.toISOString());
                            }
                            if (filter.createdBefore) {
                                query = query.lte('created_at', filter.createdBefore.toISOString());
                            }
                        }
                        // Apply sorting
                        if (params.sort) {
                            sortField = this.mapSortField(params.sort.field);
                            query = query.order(sortField, { ascending: params.sort.direction === 'asc' });
                        }
                        else {
                            query = query.order('last_activity', { ascending: false });
                        }
                        offset = (params.page - 1) * params.limit;
                        query = query.range(offset, offset + params.limit - 1);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error) {
                            throw new types_1.SessionError('Failed to search sessions', 'SYSTEM_ERROR', { error: error });
                        }
                        return [2 /*return*/, {
                                sessions: data.map(this.mapDatabaseToSession),
                                total: count || 0,
                                page: params.page,
                                limit: params.limit
                            }];
                    case 2:
                        error_8 = _b.sent();
                        if (error_8 instanceof types_1.SessionError) {
                            throw error_8;
                        }
                        throw new types_1.SessionError('Failed to search sessions', 'SYSTEM_ERROR', { error: error_8 });
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    /**
     * Clean up expired sessions
     */
    SessionManager.prototype.cleanupExpiredSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, _a, expiredSessions, fetchError, updateError, pipeline_1, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        now = new Date();
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .select('id, user_id')
                                .lt('expires_at', now.toISOString())
                                .eq('is_active', true)
                                .limit(this.config.cleanup.batchSize)];
                    case 1:
                        _a = _b.sent(), expiredSessions = _a.data, fetchError = _a.error;
                        if (fetchError) {
                            throw new types_1.SessionError('Failed to fetch expired sessions', 'SYSTEM_ERROR', { error: fetchError });
                        }
                        if (!expiredSessions || expiredSessions.length === 0) {
                            return [2 /*return*/, 0];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .update({
                                is_active: false,
                                terminated_at: now.toISOString(),
                                termination_reason: 'expired'
                            })
                                .in('id', expiredSessions.map(function (s) { return s.id; }))];
                    case 2:
                        updateError = (_b.sent()).error;
                        if (updateError) {
                            throw new types_1.SessionError('Failed to update expired sessions', 'SYSTEM_ERROR', { error: updateError });
                        }
                        pipeline_1 = this.redis.pipeline();
                        expiredSessions.forEach(function (session) {
                            pipeline_1.del("session:".concat(session.id));
                        });
                        return [4 /*yield*/, pipeline_1.exec()];
                    case 3:
                        _b.sent();
                        // Log cleanup event
                        return [4 /*yield*/, this.auditLogger.logSystemEvent({
                                action: 'sessions_cleanup',
                                details: {
                                    expiredCount: expiredSessions.length,
                                    cleanupTime: now
                                }
                            })];
                    case 4:
                        // Log cleanup event
                        _b.sent();
                        return [2 /*return*/, expiredSessions.length];
                    case 5:
                        error_9 = _b.sent();
                        if (error_9 instanceof types_1.SessionError) {
                            throw error_9;
                        }
                        throw new types_1.SessionError('Failed to cleanup expired sessions', 'SYSTEM_ERROR', { error: error_9 });
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Record session activity
     */
    SessionManager.prototype.recordActivity = function (sessionId, activity) {
        return __awaiter(this, void 0, void 0, function () {
            var session, activityRecord, error, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getSessionFromCache(sessionId)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            return [2 /*return*/]; // Session doesn't exist
                        }
                        activityRecord = __assign(__assign({}, activity), { sessionId: sessionId, timestamp: new Date() });
                        return [4 /*yield*/, this.supabase
                                .from('session_activities')
                                .insert({
                                session_id: activityRecord.sessionId,
                                user_id: activityRecord.userId,
                                action: activityRecord.action,
                                resource: activityRecord.resource,
                                timestamp: activityRecord.timestamp.toISOString(),
                                ip_address: activityRecord.ipAddress,
                                user_agent: activityRecord.userAgent,
                                success: activityRecord.success,
                                duration: activityRecord.duration,
                                metadata: activityRecord.metadata
                            })];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Failed to record session activity:', error);
                        }
                        // Update last activity
                        return [4 /*yield*/, this.updateLastActivity(sessionId)];
                    case 3:
                        // Update last activity
                        _a.sent();
                        // Emit event
                        this.emit('session_activity', activityRecord);
                        return [3 /*break*/, 5];
                    case 4:
                        error_10 = _a.sent();
                        console.error('Failed to record session activity:', error_10);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    SessionManager.prototype.generateSessionId = function () {
        return "sess_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    SessionManager.prototype.getSessionFromCache = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, session, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.redis.get("session:".concat(sessionId))];
                    case 1:
                        cached = _a.sent();
                        if (!cached)
                            return [2 /*return*/, null];
                        session = JSON.parse(cached);
                        return [2 /*return*/, __assign(__assign({}, session), { createdAt: new Date(session.createdAt), lastActivity: new Date(session.lastActivity), expiresAt: new Date(session.expiresAt) })];
                    case 2:
                        error_11 = _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.getSessionFromDatabase = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .select('*')
                                .eq('id', sessionId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.mapDatabaseToSession(data)];
                    case 2:
                        error_12 = _b.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.cacheSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var ttl, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
                        if (!(ttl > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redis.setex("session:".concat(session.id), ttl, JSON.stringify(session))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        error_13 = _a.sent();
                        console.error('Failed to cache session:', error_13);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.mapDatabaseToSession = function (data) {
        return {
            id: data.id,
            userId: data.user_id,
            clinicId: data.clinic_id,
            deviceFingerprint: data.device_fingerprint,
            deviceName: data.device_name,
            ipAddress: data.ip_address,
            userAgent: data.user_agent,
            location: data.location,
            createdAt: new Date(data.created_at),
            lastActivity: new Date(data.last_activity),
            expiresAt: new Date(data.expires_at),
            isActive: data.is_active,
            securityScore: data.security_score,
            sessionData: data.session_data || {},
            metadata: data.metadata
        };
    };
    SessionManager.prototype.mapSortField = function (field) {
        var fieldMap = {
            createdAt: 'created_at',
            lastActivity: 'last_activity',
            expiresAt: 'expires_at',
            userId: 'user_id',
            clinicId: 'clinic_id',
            ipAddress: 'ip_address',
            securityScore: 'security_score'
        };
        return fieldMap[field] || field;
    };
    SessionManager.prototype.validateUserAccess = function (userId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('users')
                            .select('id, clinic_id, is_active')
                            .eq('id', userId)
                            .eq('clinic_id', clinicId)
                            .eq('is_active', true)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            throw new types_1.SessionError('User access validation failed', 'AUTHORIZATION_FAILED');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.enforceSessionLimits = function (userId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var activeSessions, oldestSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserSessions(userId)];
                    case 1:
                        activeSessions = _a.sent();
                        if (!(activeSessions.length >= this.config.security.maxConcurrentSessions)) return [3 /*break*/, 3];
                        oldestSession = activeSessions[activeSessions.length - 1];
                        return [4 /*yield*/, this.terminateSession(oldestSession.id, 'session_limit_exceeded')];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.updateLastActivity = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        // Update database
                        return [4 /*yield*/, this.supabase
                                .from('user_sessions')
                                .update({ last_activity: now.toISOString() })
                                .eq('id', sessionId)];
                    case 1:
                        // Update database
                        _a.sent();
                        return [4 /*yield*/, this.getSessionFromCache(sessionId)];
                    case 2:
                        session = _a.sent();
                        if (!session) return [3 /*break*/, 4];
                        session.lastActivity = now;
                        return [4 /*yield*/, this.cacheSession(session)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
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
                        securityEvent = __assign(__assign({}, event), { id: "sec_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)), timestamp: new Date(), resolved: false, actions: ['log_event'] });
                        return [4 /*yield*/, this.supabase
                                .from('session_security_events')
                                .insert({
                                id: securityEvent.id,
                                session_id: securityEvent.sessionId,
                                user_id: securityEvent.userId,
                                clinic_id: securityEvent.clinicId,
                                event_type: securityEvent.eventType,
                                severity: securityEvent.severity,
                                description: securityEvent.description,
                                details: securityEvent.details,
                                ip_address: securityEvent.ipAddress,
                                user_agent: securityEvent.userAgent,
                                location: securityEvent.location,
                                timestamp: securityEvent.timestamp.toISOString(),
                                resolved: securityEvent.resolved,
                                actions: securityEvent.actions
                            })];
                    case 1:
                        _a.sent();
                        this.emit('security_event', securityEvent);
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.setupEventHandlers = function () {
        this.on('session_created', function (data) {
            console.log("Session created for user ".concat(data.session.userId));
        });
        this.on('session_terminated', function (data) {
            console.log("Session ".concat(data.sessionId, " terminated: ").concat(data.reason));
        });
        this.on('security_event', function (event) {
            console.warn("Security event: ".concat(event.eventType, " - ").concat(event.description));
        });
    };
    SessionManager.prototype.startCleanupProcess = function () {
        var _this = this;
        if (this.config.cleanup.enableAutoCleanup) {
            this.cleanupInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var cleaned, error_14;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.cleanupExpiredSessions()];
                        case 1:
                            cleaned = _a.sent();
                            if (cleaned > 0) {
                                console.log("Cleaned up ".concat(cleaned, " expired sessions"));
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_14 = _a.sent();
                            console.error('Session cleanup failed:', error_14);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); }, this.config.cleanup.interval);
        }
    };
    /**
     * Cleanup resources
     */
    SessionManager.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.cleanupInterval) {
                            clearInterval(this.cleanupInterval);
                        }
                        return [4 /*yield*/, this.redis.quit()];
                    case 1:
                        _a.sent();
                        this.removeAllListeners();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SessionManager;
}(events_1.EventEmitter));
exports.SessionManager = SessionManager;
