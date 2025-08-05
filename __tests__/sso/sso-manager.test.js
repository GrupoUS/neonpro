"use strict";
// SSO Manager Tests
// Story 1.3: SSO Integration - Core Manager Testing
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
var sso_manager_1 = require("@/lib/auth/sso/sso-manager");
var supabase_js_1 = require("@supabase/supabase-js");
// Mock Supabase
jest.mock('@supabase/supabase-js', function () { return ({
    createClient: jest.fn(),
}); });
// Mock logger
jest.mock('@/lib/logger', function () { return ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}); });
describe('SSOManager', function () {
    var ssoManager;
    var mockSupabase;
    beforeEach(function () {
        // Reset all mocks
        jest.clearAllMocks();
        // Mock Supabase client
        mockSupabase = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            upsert: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
            data: null,
            error: null,
        };
        supabase_js_1.createClient.mockReturnValue(mockSupabase);
        // Mock environment variables
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
        // Create SSO manager instance
        ssoManager = new sso_manager_1.SSOManager('https://test.supabase.co', 'test-key');
    });
    describe('initialization', function () {
        it('should initialize with default providers', function () {
            var providers = ssoManager.getAvailableProviders();
            expect(providers.length).toBeGreaterThan(0);
            // Check if Google provider exists
            var googleProvider = providers.find(function (p) { return p.id === 'google'; });
            expect(googleProvider).toBeDefined();
            expect(googleProvider === null || googleProvider === void 0 ? void 0 : googleProvider.enabled).toBe(true);
        });
        it('should get configuration', function () {
            var config = ssoManager.getConfiguration();
            expect(config).toBeDefined();
            expect(config.providers).toBeDefined();
            expect(config.globalSettings).toBeDefined();
        });
    });
    describe('generateAuthUrl', function () {
        it('should generate auth URL for valid provider', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock fetch for storing auth request
                        global.fetch = jest.fn();
                        return [4 /*yield*/, ssoManager.generateAuthUrl('google', {
                                redirectUri: 'http://localhost:3000/auth/callback',
                                scopes: ['openid', 'email', 'profile'],
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result).toContain('https://accounts.google.com/o/oauth2/v2/auth');
                        expect(result).toContain('client_id=');
                        expect(result).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback');
                        expect(result).toContain('scope=openid+email+profile');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw error for invalid provider', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(ssoManager.generateAuthUrl('invalid-provider', {})).rejects.toMatchObject({
                            code: 'PROVIDER_NOT_FOUND',
                            message: 'Provider invalid-provider not found'
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getDomainProvider', function () {
        it('should return null for unknown domain', function () {
            var provider = ssoManager.getDomainProvider('user@unknown.com');
            expect(provider).toBeNull();
        });
        it('should handle invalid email', function () {
            var provider = ssoManager.getDomainProvider('invalid-email');
            expect(provider).toBeNull();
        });
    });
    describe('validateSession', function () {
        it('should return null for non-existent session', function () { return __awaiter(void 0, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Not found') });
                        return [4 /*yield*/, ssoManager.validateSession('non-existent-session')];
                    case 1:
                        session = _a.sent();
                        expect(session).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should update last used timestamp for valid session', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockSession, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSession = {
                            id: 'session_123',
                            userId: 'user_123',
                            providerId: 'google',
                            expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                        };
                        // Configure mocks for the complete chain
                        mockSupabase.single.mockResolvedValue({ data: mockSession, error: null });
                        return [4 /*yield*/, ssoManager.validateSession('session_123')];
                    case 1:
                        session = _a.sent();
                        expect(session).toEqual(mockSession);
                        expect(mockSupabase.update).toHaveBeenCalledWith({ lastUsedAt: expect.any(Date) });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('logout', function () {
        it('should delete session successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSession = {
                            id: 'session_123',
                            userId: 'user_123',
                            providerId: 'google',
                        };
                        // Configure mocks for the complete chain
                        mockSupabase.single.mockResolvedValue({ data: mockSession, error: null });
                        mockSupabase.insert.mockResolvedValue({ data: null, error: null }); // For audit log
                        return [4 /*yield*/, ssoManager.logout('session_123')];
                    case 1:
                        _a.sent();
                        expect(mockSupabase.delete).toHaveBeenCalled();
                        expect(mockSupabase.insert).toHaveBeenCalled(); // Audit log
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle non-existent session gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Not found') });
                        return [4 /*yield*/, expect(ssoManager.logout('non-existent-session')).resolves.toBeUndefined()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateConfiguration', function () {
        it('should update configuration successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newConfig, config;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mockSupabase.insert.mockResolvedValue({ data: null, error: null }); // For audit log
                        newConfig = {
                            globalSettings: {
                                enabled: false,
                                allowLocalFallback: false,
                            },
                        };
                        return [4 /*yield*/, ssoManager.updateConfiguration(newConfig)];
                    case 1:
                        _c.sent();
                        config = ssoManager.getConfiguration();
                        expect((_a = config.globalSettings) === null || _a === void 0 ? void 0 : _a.enabled).toBe(false);
                        expect((_b = config.globalSettings) === null || _b === void 0 ? void 0 : _b.allowLocalFallback).toBe(false);
                        expect(mockSupabase.insert).toHaveBeenCalled(); // Audit log
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
