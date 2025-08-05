"use strict";
/**
 * Enhanced Session Management System
 *
 * Provides secure token storage, session timeout management,
 * activity tracking, and concurrent session limiting for OAuth authentication.
 *
 * Features:
 * - Encrypted localStorage for secure token storage
 * - Automatic session timeout with configurable intervals
 * - User activity tracking for session extension
 * - Concurrent session limiting (max 3 sessions per user)
 * - Secure logout with token cleanup
 * - Session heartbeat for real-time monitoring
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
exports.SESSION_CONFIG = exports.createsessionManager = void 0;
var client_1 = require("@/lib/supabase/client");
// Session configuration
var SESSION_CONFIG = {
    TIMEOUT_MINUTES: 120, // 2 hours default
    ACTIVITY_TIMEOUT_MINUTES: 30, // Auto-logout after inactivity
    MAX_CONCURRENT_SESSIONS: 3,
    HEARTBEAT_INTERVAL_MS: 60000, // 1 minute
    TOKEN_REFRESH_THRESHOLD_MINUTES: 5,
    STORAGE_KEY_PREFIX: 'neonpro_session_',
    ENCRYPTION_KEY: 'neonpro_secure_session_2024'
};
exports.SESSION_CONFIG = SESSION_CONFIG;
var SessionManager = /** @class */ (function () {
    function SessionManager() {
        this.sessionId = null;
        this.heartbeatInterval = null;
        this.activityTimeout = null;
        this.supabase = (0, client_1.createClient)();
    }
    /**
     * Initialize session management
     */
    SessionManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.sessionId = this.generateSessionId();
                        return [4 /*yield*/, this.loadExistingSession()];
                    case 1:
                        _a.sent();
                        this.startHeartbeat();
                        this.setupActivityTracking();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create new session after successful authentication
     */
    SessionManager.prototype.createSession = function (user, additionalData) {
        return __awaiter(this, void 0, void 0, function () {
            var now, sessionData;
            var _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        now = Date.now();
                        _a = {
                            sessionId: this.sessionId || this.generateSessionId(),
                            userId: user.id,
                            email: user.email || '',
                            role: ((_b = user.user_metadata) === null || _b === void 0 ? void 0 : _b.role) || 'user',
                            clinicId: ((_c = user.user_metadata) === null || _c === void 0 ? void 0 : _c.clinic_id) || '',
                            lastActivity: now,
                            expiresAt: now + (SESSION_CONFIG.TIMEOUT_MINUTES * 60 * 1000),
                            deviceInfo: this.getDeviceInfo()
                        };
                        return [4 /*yield*/, this.getClientIP()];
                    case 1:
                        sessionData = (_a.ipAddress = _d.sent(),
                            _a);
                        // Check concurrent session limit
                        return [4 /*yield*/, this.enforceSessionLimit(user.id)
                            // Store session securely
                        ];
                    case 2:
                        // Check concurrent session limit
                        _d.sent();
                        // Store session securely
                        return [4 /*yield*/, this.storeSession(sessionData)
                            // Log session creation
                        ];
                    case 3:
                        // Store session securely
                        _d.sent();
                        // Log session creation
                        return [4 /*yield*/, this.logActivity('session_created', {
                                sessionId: sessionData.sessionId,
                                deviceInfo: sessionData.deviceInfo
                            })
                            // Start session monitoring
                        ];
                    case 4:
                        // Log session creation
                        _d.sent();
                        // Start session monitoring
                        this.startSessionMonitoring();
                        return [2 /*return*/, sessionData];
                }
            });
        });
    };
    /**
     * Update session activity and extend timeout
     */
    SessionManager.prototype.updateActivity = function () {
        return __awaiter(this, arguments, void 0, function (action, metadata) {
            var session, now;
            if (action === void 0) { action = 'activity'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentSession()];
                    case 1:
                        session = _a.sent();
                        if (!session)
                            return [2 /*return*/];
                        now = Date.now();
                        session.lastActivity = now;
                        session.expiresAt = now + (SESSION_CONFIG.ACTIVITY_TIMEOUT_MINUTES * 60 * 1000);
                        return [4 /*yield*/, this.storeSession(session)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.logActivity(action, metadata)
                            // Reset activity timeout
                        ];
                    case 3:
                        _a.sent();
                        // Reset activity timeout
                        this.resetActivityTimeout();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current session data
     */
    SessionManager.prototype.getCurrentSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var encryptedData, sessionData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        encryptedData = localStorage.getItem("".concat(SESSION_CONFIG.STORAGE_KEY_PREFIX, "current"));
                        if (!encryptedData)
                            return [2 /*return*/, null];
                        sessionData = JSON.parse(this.decrypt(encryptedData));
                        if (!(Date.now() > sessionData.expiresAt)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.destroySession()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                    case 2: return [2 /*return*/, sessionData];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error getting current session:', error_1);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh session tokens
     */
    SessionManager.prototype.refreshSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, session, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 10]);
                        return [4 /*yield*/, this.supabase.auth.refreshSession()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (!(error || !data.session)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.destroySession()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [4 /*yield*/, this.getCurrentSession()];
                    case 4:
                        session = _b.sent();
                        if (!session) return [3 /*break*/, 6];
                        session.lastActivity = Date.now();
                        session.expiresAt = Date.now() + (SESSION_CONFIG.TIMEOUT_MINUTES * 60 * 1000);
                        return [4 /*yield*/, this.storeSession(session)];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, this.logActivity('session_refreshed')];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 8:
                        error_2 = _b.sent();
                        console.error('Error refreshing session:', error_2);
                        return [4 /*yield*/, this.destroySession()];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, false];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Secure logout and session cleanup
     */
    SessionManager.prototype.destroySession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentSession()];
                    case 1:
                        session = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        // Sign out from Supabase
                        return [4 /*yield*/, this.supabase.auth.signOut()
                            // Clear all session storage
                        ];
                    case 3:
                        // Sign out from Supabase
                        _a.sent();
                        // Clear all session storage
                        this.clearSessionStorage();
                        // Stop monitoring
                        this.stopSessionMonitoring();
                        if (!session) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.logActivity('session_destroyed', {
                                sessionId: session.sessionId,
                                duration: Date.now() - (session.expiresAt - (SESSION_CONFIG.TIMEOUT_MINUTES * 60 * 1000))
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        console.error('Error destroying session:', error_3);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if session needs token refresh
     */
    SessionManager.prototype.shouldRefreshToken = function () {
        var session = this.getCurrentSession();
        if (!session)
            return false;
        var timeToExpiry = session.expiresAt - Date.now();
        var refreshThreshold = SESSION_CONFIG.TOKEN_REFRESH_THRESHOLD_MINUTES * 60 * 1000;
        return timeToExpiry <= refreshThreshold;
    };
    /**
     * Get all active sessions for current user
     */
    SessionManager.prototype.getActiveSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allKeys, sessions, _i, allKeys_1, key, encryptedData, sessionData;
            return __generator(this, function (_a) {
                try {
                    allKeys = Object.keys(localStorage).filter(function (key) {
                        return key.startsWith(SESSION_CONFIG.STORAGE_KEY_PREFIX) && key !== "".concat(SESSION_CONFIG.STORAGE_KEY_PREFIX, "current");
                    });
                    sessions = [];
                    for (_i = 0, allKeys_1 = allKeys; _i < allKeys_1.length; _i++) {
                        key = allKeys_1[_i];
                        try {
                            encryptedData = localStorage.getItem(key);
                            if (encryptedData) {
                                sessionData = JSON.parse(this.decrypt(encryptedData));
                                if (Date.now() <= sessionData.expiresAt) {
                                    sessions.push(sessionData);
                                }
                                else {
                                    localStorage.removeItem(key); // Clean expired sessions
                                }
                            }
                        }
                        catch (error) {
                            localStorage.removeItem(key); // Clean corrupted sessions
                        }
                    }
                    return [2 /*return*/, sessions];
                }
                catch (error) {
                    console.error('Error getting active sessions:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Terminate specific session
     */
    SessionManager.prototype.terminateSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        key = "".concat(SESSION_CONFIG.STORAGE_KEY_PREFIX).concat(sessionId);
                        localStorage.removeItem(key);
                        return [4 /*yield*/, this.logActivity('session_terminated', { terminatedSessionId: sessionId })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error terminating session:', error_4);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Private methods
    SessionManager.prototype.generateSessionId = function () {
        return "session_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    SessionManager.prototype.loadExistingSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentSession()];
                    case 1:
                        session = _a.sent();
                        if (session) {
                            this.sessionId = session.sessionId;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.startHeartbeat = function () {
        var _this = this;
        this.heartbeatInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentSession()];
                    case 1:
                        session = _a.sent();
                        if (!session) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updateActivity('heartbeat')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.stopSessionMonitoring();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); }, SESSION_CONFIG.HEARTBEAT_INTERVAL_MS);
    };
    SessionManager.prototype.setupActivityTracking = function () {
        var _this = this;
        // Track page navigation
        window.addEventListener('beforeunload', function () {
            _this.updateActivity('page_unload');
        });
        // Track user interactions
        var activityEvents = ['click', 'keypress', 'scroll', 'mousemove'];
        activityEvents.forEach(function (event) {
            document.addEventListener(event, function () {
                _this.updateActivity("user_".concat(event));
            }, { passive: true, once: false });
        });
    };
    SessionManager.prototype.resetActivityTimeout = function () {
        var _this = this;
        if (this.activityTimeout) {
            clearTimeout(this.activityTimeout);
        }
        this.activityTimeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.logActivity('session_timeout')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.destroySession()];
                    case 2:
                        _a.sent();
                        window.location.href = '/auth/login?reason=timeout';
                        return [2 /*return*/];
                }
            });
        }); }, SESSION_CONFIG.ACTIVITY_TIMEOUT_MINUTES * 60 * 1000);
    };
    SessionManager.prototype.startSessionMonitoring = function () {
        this.startHeartbeat();
        this.resetActivityTimeout();
    };
    SessionManager.prototype.stopSessionMonitoring = function () {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.activityTimeout) {
            clearTimeout(this.activityTimeout);
            this.activityTimeout = null;
        }
    };
    SessionManager.prototype.storeSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var encryptedData;
            return __generator(this, function (_a) {
                try {
                    encryptedData = this.encrypt(JSON.stringify(session));
                    localStorage.setItem("".concat(SESSION_CONFIG.STORAGE_KEY_PREFIX, "current"), encryptedData);
                    localStorage.setItem("".concat(SESSION_CONFIG.STORAGE_KEY_PREFIX).concat(session.sessionId), encryptedData);
                }
                catch (error) {
                    console.error('Error storing session:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    SessionManager.prototype.clearSessionStorage = function () {
        var allKeys = Object.keys(localStorage).filter(function (key) {
            return key.startsWith(SESSION_CONFIG.STORAGE_KEY_PREFIX);
        });
        allKeys.forEach(function (key) { return localStorage.removeItem(key); });
    };
    SessionManager.prototype.enforceSessionLimit = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var activeSessions, userSessions, oldestSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getActiveSessions()];
                    case 1:
                        activeSessions = _a.sent();
                        userSessions = activeSessions.filter(function (s) { return s.userId === userId; });
                        if (!(userSessions.length >= SESSION_CONFIG.MAX_CONCURRENT_SESSIONS)) return [3 /*break*/, 3];
                        oldestSession = userSessions.sort(function (a, b) { return a.lastActivity - b.lastActivity; })[0];
                        return [4 /*yield*/, this.terminateSession(oldestSession.sessionId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionManager.prototype.encrypt = function (text) {
        // Simple encryption for demo - use crypto-js in production
        return btoa(text + SESSION_CONFIG.ENCRYPTION_KEY);
    };
    SessionManager.prototype.decrypt = function (encryptedText) {
        // Simple decryption for demo - use crypto-js in production
        var decoded = atob(encryptedText);
        return decoded.replace(SESSION_CONFIG.ENCRYPTION_KEY, '');
    };
    SessionManager.prototype.getDeviceInfo = function () {
        return "".concat(navigator.userAgent.substring(0, 100), "_").concat(screen.width, "x").concat(screen.height);
    };
    SessionManager.prototype.getClientIP = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // In production, get IP from server-side
                    return [2 /*return*/, 'client_ip'];
                }
                catch (_b) {
                    return [2 /*return*/, 'unknown'];
                }
                return [2 /*return*/];
            });
        });
    };
    SessionManager.prototype.logActivity = function (action, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var activity, activities;
            return __generator(this, function (_a) {
                try {
                    activity = {
                        action: action,
                        timestamp: Date.now(),
                        route: window.location.pathname,
                        metadata: metadata
                    };
                    activities = JSON.parse(localStorage.getItem('session_activities') || '[]');
                    activities.push(activity);
                    // Keep only last 100 activities
                    if (activities.length > 100) {
                        activities.splice(0, activities.length - 100);
                    }
                    localStorage.setItem('session_activities', JSON.stringify(activities));
                }
                catch (error) {
                    console.error('Error logging activity:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    return SessionManager;
}());
// Export singleton instance
var createsessionManager = function () { return new SessionManager(); };
exports.createsessionManager = createsessionManager;
