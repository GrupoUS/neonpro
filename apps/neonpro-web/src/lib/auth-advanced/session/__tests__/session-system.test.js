"use strict";
// ============================================================================
// Session Management System - Tests
// NeonPro - Session Management & Security
// ============================================================================
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
var vitest_1 = require("vitest");
var index_1 = require("../index");
var session_manager_1 = require("../session-manager");
var security_monitor_1 = require("../security-monitor");
var device_manager_1 = require("../device-manager");
var utils_1 = require("../utils");
// ============================================================================
// MOCKS
// ============================================================================
// Mock Supabase
var mockSupabase = {
    from: vitest_1.vi.fn(function () { return ({
        select: vitest_1.vi.fn().mockReturnThis(),
        insert: vitest_1.vi.fn().mockReturnThis(),
        update: vitest_1.vi.fn().mockReturnThis(),
        delete: vitest_1.vi.fn().mockReturnThis(),
        eq: vitest_1.vi.fn().mockReturnThis(),
        gte: vitest_1.vi.fn().mockReturnThis(),
        lte: vitest_1.vi.fn().mockReturnThis(),
        order: vitest_1.vi.fn().mockReturnThis(),
        limit: vitest_1.vi.fn().mockReturnThis(),
        single: vitest_1.vi.fn(),
        then: vitest_1.vi.fn(),
    }); }),
    rpc: vitest_1.vi.fn(),
};
// Mock Redis
var mockRedis = {
    get: vitest_1.vi.fn(),
    set: vitest_1.vi.fn(),
    del: vitest_1.vi.fn(),
    exists: vitest_1.vi.fn(),
    expire: vitest_1.vi.fn(),
    keys: vitest_1.vi.fn(),
    flushdb: vitest_1.vi.fn(),
};
// Mock EventEmitter
var mockEventEmitter = {
    emit: vitest_1.vi.fn(),
    on: vitest_1.vi.fn(),
    off: vitest_1.vi.fn(),
    removeAllListeners: vitest_1.vi.fn(),
};
// ============================================================================
// TEST DATA
// ============================================================================
var mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'user',
};
var mockClinic = {
    id: '987fcdeb-51a2-43d1-9f12-345678901234',
    name: 'Test Clinic',
};
var mockDeviceFingerprint = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    screen: { width: 1920, height: 1080 },
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    platform: 'Win32',
    plugins: ['Chrome PDF Plugin', 'Chrome PDF Viewer'],
    canvas: 'canvas_hash_123',
    webgl: 'webgl_hash_456',
};
var mockSessionConfig = {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    renewalThreshold: 0.25,
    maxConcurrentSessions: 3,
    requireDeviceVerification: false,
    enableLocationTracking: true,
    enableDeviceFingerprinting: true,
    tokenRotationInterval: 15 * 60 * 1000,
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
    maxSessionDuration: 8 * 60 * 60 * 1000,
    cleanupInterval: 60 * 60 * 1000,
    retainExpiredSessions: 24 * 60 * 60 * 1000,
    redis: {
        enabled: true,
        keyPrefix: 'test:session:',
        ttl: 1800,
    },
    lgpd: {
        enabled: true,
        consentRequired: true,
        dataRetentionDays: 365,
        anonymizeAfterDays: 1095,
    },
};
// ============================================================================
// SESSION MANAGER TESTS
// ============================================================================
(0, vitest_1.describe)('SessionManager', function () {
    var sessionManager;
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        sessionManager = new session_manager_1.SessionManager(mockSupabase, mockRedis, mockEventEmitter, mockSessionConfig);
    });
    (0, vitest_1.describe)('createSession', function () {
        (0, vitest_1.it)('should create a new session successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockSession, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockSession = {
                            id: (0, utils_1.generateSessionToken)(),
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            sessionToken: (0, utils_1.generateSessionToken)(),
                            refreshToken: (0, utils_1.generateSessionToken)(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            expiresAt: new Date(Date.now() + mockSessionConfig.sessionTimeout),
                            lastActivityAt: new Date(),
                            deviceFingerprint: mockDeviceFingerprint,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                            location: {
                                latitude: -23.5505,
                                longitude: -46.6333,
                                city: 'São Paulo',
                                country: 'Brazil',
                                timestamp: new Date(),
                            },
                            status: 'active',
                            isSupicious: false,
                            securityScore: 100,
                            consentVersion: '1.0',
                            dataProcessingPurposes: ['authentication', 'security'],
                        };
                        mockSupabase.from().insert().single.mockResolvedValue({
                            data: mockSession,
                            error: null,
                        });
                        return [4 /*yield*/, sessionManager.createSession({
                                userId: mockUser.id,
                                clinicId: mockClinic.id,
                                deviceFingerprint: mockDeviceFingerprint,
                                ipAddress: '192.168.1.100',
                                userAgent: mockDeviceFingerprint.userAgent,
                                location: {
                                    latitude: -23.5505,
                                    longitude: -46.6333,
                                    city: 'São Paulo',
                                    country: 'Brazil',
                                    timestamp: new Date(),
                                },
                            })];
                    case 1:
                        result = _b.sent();
                        (0, vitest_1.expect)(result.success).toBe(true);
                        (0, vitest_1.expect)(result.session).toBeDefined();
                        (0, vitest_1.expect)((_a = result.session) === null || _a === void 0 ? void 0 : _a.userId).toBe(mockUser.id);
                        (0, vitest_1.expect)(mockSupabase.from).toHaveBeenCalledWith('user_sessions');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle session creation errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from().insert().single.mockResolvedValue({
                            data: null,
                            error: { message: 'Database error' },
                        });
                        return [4 /*yield*/, sessionManager.createSession({
                                userId: mockUser.id,
                                clinicId: mockClinic.id,
                                deviceFingerprint: mockDeviceFingerprint,
                                ipAddress: '192.168.1.100',
                                userAgent: mockDeviceFingerprint.userAgent,
                            })];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.success).toBe(false);
                        (0, vitest_1.expect)(result.error).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('validateSession', function () {
        (0, vitest_1.it)('should validate an active session', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockSession, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSession = {
                            id: (0, utils_1.generateSessionToken)(),
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            sessionToken: (0, utils_1.generateSessionToken)(),
                            refreshToken: (0, utils_1.generateSessionToken)(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
                            lastActivityAt: new Date(),
                            deviceFingerprint: mockDeviceFingerprint,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                            status: 'active',
                            isSupicious: false,
                            securityScore: 100,
                        };
                        mockSupabase.from().select().eq().single.mockResolvedValue({
                            data: mockSession,
                            error: null,
                        });
                        return [4 /*yield*/, sessionManager.validateSession('valid_token')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.valid).toBe(true);
                        (0, vitest_1.expect)(result.session).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should reject expired sessions', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expiredSession, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expiredSession = {
                            id: (0, utils_1.generateSessionToken)(),
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            sessionToken: (0, utils_1.generateSessionToken)(),
                            refreshToken: (0, utils_1.generateSessionToken)(),
                            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                            updatedAt: new Date(),
                            expiresAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                            lastActivityAt: new Date(),
                            deviceFingerprint: mockDeviceFingerprint,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                            status: 'active',
                            isSupicious: false,
                            securityScore: 100,
                        };
                        mockSupabase.from().select().eq().single.mockResolvedValue({
                            data: expiredSession,
                            error: null,
                        });
                        return [4 /*yield*/, sessionManager.validateSession('expired_token')];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.valid).toBe(false);
                        (0, vitest_1.expect)(result.reason).toBe('expired');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('renewSession', function () {
        (0, vitest_1.it)('should renew a session that needs renewal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionNeedingRenewal, renewedSession, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sessionNeedingRenewal = {
                            id: (0, utils_1.generateSessionToken)(),
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            sessionToken: (0, utils_1.generateSessionToken)(),
                            refreshToken: (0, utils_1.generateSessionToken)(),
                            createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
                            updatedAt: new Date(),
                            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
                            lastActivityAt: new Date(),
                            deviceFingerprint: mockDeviceFingerprint,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                            status: 'active',
                            isSupicious: false,
                            securityScore: 100,
                        };
                        renewedSession = __assign(__assign({}, sessionNeedingRenewal), { sessionToken: (0, utils_1.generateSessionToken)(), expiresAt: new Date(Date.now() + mockSessionConfig.sessionTimeout), updatedAt: new Date() });
                        mockSupabase.from().select().eq().single.mockResolvedValue({
                            data: sessionNeedingRenewal,
                            error: null,
                        });
                        mockSupabase.from().update().eq().single.mockResolvedValue({
                            data: renewedSession,
                            error: null,
                        });
                        return [4 /*yield*/, sessionManager.renewSession('token_needing_renewal')];
                    case 1:
                        result = _b.sent();
                        (0, vitest_1.expect)(result.success).toBe(true);
                        (0, vitest_1.expect)((_a = result.session) === null || _a === void 0 ? void 0 : _a.sessionToken).not.toBe(sessionNeedingRenewal.sessionToken);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
// ============================================================================
// SECURITY MONITOR TESTS
// ============================================================================
(0, vitest_1.describe)('SecurityMonitor', function () {
    var securityMonitor;
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        securityMonitor = new security_monitor_1.SecurityMonitor(mockSupabase, mockEventEmitter);
    });
    (0, vitest_1.describe)('validateSessionSecurity', function () {
        (0, vitest_1.it)('should validate secure session creation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            deviceFingerprint: mockDeviceFingerprint,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                            location: {
                                latitude: -23.5505,
                                longitude: -46.6333,
                                city: 'São Paulo',
                                country: 'Brazil',
                                timestamp: new Date(),
                            },
                        };
                        // Mock no blacklisted IP
                        mockSupabase.from().select().eq().mockResolvedValue({
                            data: [],
                            error: null,
                        });
                        return [4 /*yield*/, securityMonitor.validateSessionSecurity(sessionData)];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.allowed).toBe(true);
                        (0, vitest_1.expect)(result.securityScore).toBeGreaterThan(50);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should block blacklisted IP addresses', function () { return __awaiter(void 0, void 0, void 0, function () {
            var sessionData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionData = {
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            deviceFingerprint: mockDeviceFingerprint,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                        };
                        // Mock blacklisted IP
                        mockSupabase.from().select().eq().mockResolvedValue({
                            data: [{ ip_address: '192.168.1.100', reason: 'Suspicious activity' }],
                            error: null,
                        });
                        return [4 /*yield*/, securityMonitor.validateSessionSecurity(sessionData)];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.allowed).toBe(false);
                        (0, vitest_1.expect)(result.reason).toContain('blacklisted');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('detectSuspiciousActivity', function () {
        (0, vitest_1.it)('should detect unusual location access', function () { return __awaiter(void 0, void 0, void 0, function () {
            var currentSession, recentSessions, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentSession = {
                            userId: mockUser.id,
                            ipAddress: '192.168.1.100',
                            location: {
                                latitude: 40.7128, // New York
                                longitude: -74.0060,
                                city: 'New York',
                                country: 'USA',
                                timestamp: new Date(),
                            },
                        };
                        recentSessions = [
                            {
                                userId: mockUser.id,
                                ipAddress: '192.168.1.101',
                                location: {
                                    latitude: -23.5505, // São Paulo
                                    longitude: -46.6333,
                                    city: 'São Paulo',
                                    country: 'Brazil',
                                    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                                },
                            },
                        ];
                        mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
                            data: recentSessions,
                            error: null,
                        });
                        return [4 /*yield*/, securityMonitor.detectSuspiciousActivity(currentSession)];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.suspicious).toBe(true);
                        (0, vitest_1.expect)(result.reasons).toContain('impossible_travel');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
// ============================================================================
// DEVICE MANAGER TESTS
// ============================================================================
(0, vitest_1.describe)('DeviceManager', function () {
    var deviceManager;
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        deviceManager = new device_manager_1.DeviceManager(mockSupabase, mockEventEmitter);
    });
    (0, vitest_1.describe)('registerDevice', function () {
        (0, vitest_1.it)('should register a new device', function () { return __awaiter(void 0, void 0, void 0, function () {
            var deviceData, mockDevice, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        deviceData = {
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            deviceFingerprint: mockDeviceFingerprint,
                            deviceName: 'Test Device',
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                        };
                        mockDevice = {
                            id: (0, utils_1.generateDeviceId)(),
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            deviceFingerprint: mockDeviceFingerprint,
                            deviceName: 'Test Device',
                            deviceType: 'desktop',
                            firstSeenAt: new Date(),
                            lastSeenAt: new Date(),
                            registrationIp: '192.168.1.100',
                            registrationUserAgent: mockDeviceFingerprint.userAgent,
                            isTrusted: false,
                            isBlocked: false,
                            trustLevel: 50,
                            sessionCount: 0,
                            securityEventsCount: 0,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        mockSupabase.from().insert().single.mockResolvedValue({
                            data: mockDevice,
                            error: null,
                        });
                        return [4 /*yield*/, deviceManager.registerDevice(deviceData)];
                    case 1:
                        result = _b.sent();
                        (0, vitest_1.expect)(result.success).toBe(true);
                        (0, vitest_1.expect)(result.device).toBeDefined();
                        (0, vitest_1.expect)((_a = result.device) === null || _a === void 0 ? void 0 : _a.deviceType).toBe('desktop');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('validateDevice', function () {
        (0, vitest_1.it)('should validate a trusted device', function () { return __awaiter(void 0, void 0, void 0, function () {
            var trustedDevice, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        trustedDevice = {
                            id: (0, utils_1.generateDeviceId)(),
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            deviceFingerprint: mockDeviceFingerprint,
                            deviceType: 'desktop',
                            firstSeenAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                            lastSeenAt: new Date(),
                            registrationIp: '192.168.1.100',
                            registrationUserAgent: mockDeviceFingerprint.userAgent,
                            isTrusted: true,
                            isBlocked: false,
                            trustLevel: 90,
                            sessionCount: 100,
                            securityEventsCount: 0,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        mockSupabase.from().select().eq().single.mockResolvedValue({
                            data: trustedDevice,
                            error: null,
                        });
                        return [4 /*yield*/, deviceManager.validateDevice(mockUser.id, mockDeviceFingerprint)];
                    case 1:
                        result = _b.sent();
                        (0, vitest_1.expect)(result.valid).toBe(true);
                        (0, vitest_1.expect)((_a = result.device) === null || _a === void 0 ? void 0 : _a.isTrusted).toBe(true);
                        (0, vitest_1.expect)(result.trustLevel).toBe(90);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should reject blocked devices', function () { return __awaiter(void 0, void 0, void 0, function () {
            var blockedDevice, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        blockedDevice = {
                            id: (0, utils_1.generateDeviceId)(),
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            deviceFingerprint: mockDeviceFingerprint,
                            deviceType: 'desktop',
                            firstSeenAt: new Date(),
                            lastSeenAt: new Date(),
                            registrationIp: '192.168.1.100',
                            registrationUserAgent: mockDeviceFingerprint.userAgent,
                            isTrusted: false,
                            isBlocked: true,
                            trustLevel: 0,
                            sessionCount: 1,
                            securityEventsCount: 5,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        mockSupabase.from().select().eq().single.mockResolvedValue({
                            data: blockedDevice,
                            error: null,
                        });
                        return [4 /*yield*/, deviceManager.validateDevice(mockUser.id, mockDeviceFingerprint)];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result.valid).toBe(false);
                        (0, vitest_1.expect)(result.reason).toBe('blocked');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
// ============================================================================
// UTILITY TESTS
// ============================================================================
(0, vitest_1.describe)('Session Utilities', function () {
    (0, vitest_1.describe)('generateSessionToken', function () {
        (0, vitest_1.it)('should generate valid session tokens', function () {
            var token1 = (0, utils_1.generateSessionToken)();
            var token2 = (0, utils_1.generateSessionToken)();
            (0, vitest_1.expect)(token1).toHaveLength(64);
            (0, vitest_1.expect)(token2).toHaveLength(64);
            (0, vitest_1.expect)(token1).not.toBe(token2);
            (0, vitest_1.expect)(/^[a-f0-9]{64}$/.test(token1)).toBe(true);
        });
    });
    (0, vitest_1.describe)('calculateSecurityScore', function () {
        (0, vitest_1.it)('should calculate security score correctly', function () {
            var highSecurityFactors = {
                deviceTrusted: true,
                locationSuspicious: false,
                ipSuspicious: false,
                recentSecurityEvents: 0,
                sessionAge: 30, // 30 minutes
                fingerprintMatch: 1.0,
            };
            var lowSecurityFactors = {
                deviceTrusted: false,
                locationSuspicious: true,
                ipSuspicious: true,
                recentSecurityEvents: 3,
                sessionAge: 600, // 10 hours
                fingerprintMatch: 0.3,
            };
            var highScore = (0, utils_1.calculateSecurityScore)(highSecurityFactors);
            var lowScore = (0, utils_1.calculateSecurityScore)(lowSecurityFactors);
            (0, vitest_1.expect)(highScore).toBeGreaterThan(80);
            (0, vitest_1.expect)(lowScore).toBeLessThan(30);
        });
    });
    (0, vitest_1.describe)('isSessionExpired', function () {
        (0, vitest_1.it)('should correctly identify expired sessions', function () {
            var activeSession = {
                id: 'test',
                userId: mockUser.id,
                clinicId: mockClinic.id,
                sessionToken: 'token',
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
                lastActivityAt: new Date(),
                deviceFingerprint: mockDeviceFingerprint,
                ipAddress: '192.168.1.100',
                userAgent: 'test',
                status: 'active',
                isSupicious: false,
                securityScore: 100,
            };
            var expiredSession = __assign(__assign({}, activeSession), { expiresAt: new Date(Date.now() - 30 * 60 * 1000) });
            (0, vitest_1.expect)((0, utils_1.isSessionExpired)(activeSession)).toBe(false);
            (0, vitest_1.expect)((0, utils_1.isSessionExpired)(expiredSession)).toBe(true);
        });
    });
    (0, vitest_1.describe)('needsRenewal', function () {
        (0, vitest_1.it)('should correctly identify sessions needing renewal', function () {
            var sessionNeedingRenewal = {
                id: 'test',
                userId: mockUser.id,
                clinicId: mockClinic.id,
                sessionToken: 'token',
                createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
                lastActivityAt: new Date(),
                deviceFingerprint: mockDeviceFingerprint,
                ipAddress: '192.168.1.100',
                userAgent: 'test',
                status: 'active',
                isSupicious: false,
                securityScore: 100,
            };
            var freshSession = __assign(__assign({}, sessionNeedingRenewal), { createdAt: new Date(Date.now() - 5 * 60 * 1000), expiresAt: new Date(Date.now() + 25 * 60 * 1000) });
            (0, vitest_1.expect)((0, utils_1.needsRenewal)(sessionNeedingRenewal, 0.25)).toBe(true);
            (0, vitest_1.expect)((0, utils_1.needsRenewal)(freshSession, 0.25)).toBe(false);
        });
    });
});
// ============================================================================
// INTEGRATION TESTS
// ============================================================================
(0, vitest_1.describe)('SessionSystem Integration', function () {
    var sessionSystem;
    (0, vitest_1.beforeEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.clearAllMocks();
                    sessionSystem = new index_1.SessionSystem();
                    // Initialize with test configuration
                    return [4 /*yield*/, sessionSystem.initialize({
                            supabase: mockSupabase,
                            redis: mockRedis,
                            config: mockSessionConfig,
                        })];
                case 1:
                    // Initialize with test configuration
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.afterEach)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sessionSystem.shutdown()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.describe)('Full Session Lifecycle', function () {
        (0, vitest_1.it)('should handle complete session lifecycle', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createResult, sessionToken, validateResult, activityResult, terminateResult, finalValidateResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sessionSystem.createSession({
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            deviceFingerprint: mockDeviceFingerprint,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                            location: {
                                latitude: -23.5505,
                                longitude: -46.6333,
                                city: 'São Paulo',
                                country: 'Brazil',
                                timestamp: new Date(),
                            },
                        })];
                    case 1:
                        createResult = _a.sent();
                        (0, vitest_1.expect)(createResult.success).toBe(true);
                        (0, vitest_1.expect)(createResult.session).toBeDefined();
                        sessionToken = createResult.session.sessionToken;
                        return [4 /*yield*/, sessionSystem.validateSession(sessionToken)];
                    case 2:
                        validateResult = _a.sent();
                        (0, vitest_1.expect)(validateResult.valid).toBe(true);
                        return [4 /*yield*/, sessionSystem.updateActivity(sessionToken, {
                                ipAddress: '192.168.1.100',
                                userAgent: mockDeviceFingerprint.userAgent,
                            })];
                    case 3:
                        activityResult = _a.sent();
                        (0, vitest_1.expect)(activityResult.success).toBe(true);
                        return [4 /*yield*/, sessionSystem.terminateSession(sessionToken, 'user_logout')];
                    case 4:
                        terminateResult = _a.sent();
                        (0, vitest_1.expect)(terminateResult.success).toBe(true);
                        return [4 /*yield*/, sessionSystem.validateSession(sessionToken)];
                    case 5:
                        finalValidateResult = _a.sent();
                        (0, vitest_1.expect)(finalValidateResult.valid).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Security Event Handling', function () {
        (0, vitest_1.it)('should handle security events properly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createResult, securityEvent, eventResult, validateResult;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, sessionSystem.createSession({
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            deviceFingerprint: mockDeviceFingerprint,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                        })];
                    case 1:
                        createResult = _b.sent();
                        (0, vitest_1.expect)(createResult.success).toBe(true);
                        securityEvent = {
                            id: 'event_123',
                            sessionId: createResult.session.id,
                            userId: mockUser.id,
                            clinicId: mockClinic.id,
                            eventType: 'suspicious_login',
                            threatLevel: 'medium',
                            description: 'Unusual login pattern detected',
                            details: {
                                reason: 'Multiple failed attempts',
                                attempts: 3,
                            },
                            riskScore: 75,
                            ipAddress: '192.168.1.100',
                            userAgent: mockDeviceFingerprint.userAgent,
                            detectedAt: new Date(),
                            createdAt: new Date(),
                        };
                        return [4 /*yield*/, sessionSystem.handleSecurityEvent(securityEvent)];
                    case 2:
                        eventResult = _b.sent();
                        (0, vitest_1.expect)(eventResult.success).toBe(true);
                        return [4 /*yield*/, sessionSystem.validateSession(createResult.session.sessionToken)];
                    case 3:
                        validateResult = _b.sent();
                        (0, vitest_1.expect)((_a = validateResult.session) === null || _a === void 0 ? void 0 : _a.securityScore).toBeLessThan(100);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
