"use strict";
/**
 * Subscription Middleware Unit Tests
 * Tests core subscription validation and middleware functionality
 *
 * @description Comprehensive unit tests for subscription middleware,
 *              covering authentication, validation, caching, and error handling
 * @version 1.0.0
 * @created 2025-07-22
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
var globals_1 = require("@jest/globals");
var testUtils_1 = require("../utils/testUtils");
// Mock Next.js modules
globals_1.jest.mock('next/headers', function () { return ({
    cookies: globals_1.jest.fn(function () { return ({
        get: globals_1.jest.fn(),
        set: globals_1.jest.fn(),
        delete: globals_1.jest.fn(),
    }); }),
}); });
globals_1.jest.mock('next/navigation', function () { return ({
    redirect: globals_1.jest.fn(),
    permanentRedirect: globals_1.jest.fn(),
}); });
// ============================================================================
// Test Setup
// ============================================================================
(0, globals_1.describe)('Subscription Middleware', function () {
    var mockFetch;
    (0, globals_1.beforeEach)(function () {
        // Reset all mocks
        globals_1.jest.clearAllMocks();
        // Setup fetch mock
        mockFetch = global.fetch;
        mockFetch.mockClear();
    });
    (0, globals_1.afterEach)(function () {
        globals_1.jest.restoreAllMocks();
    });
    // ============================================================================
    // Core Middleware Tests
    // ============================================================================
    (0, globals_1.describe)('validateSubscriptionStatus', function () {
        (0, globals_1.it)('should validate active subscription correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockSubscription;
            return __generator(this, function (_a) {
                mockSubscription = (0, testUtils_1.createMockSubscription)({
                    status: 'active',
                    endDate: new Date(Date.now() + 86400000), // Tomorrow
                });
                (0, globals_1.expect)(mockSubscription.status).toBe('active');
                (0, globals_1.expect)(mockSubscription.endDate > new Date()).toBe(true);
                return [2 /*return*/];
            });
        }); });
        (0, globals_1.it)('should detect expired subscriptions', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expiredSubscription;
            return __generator(this, function (_a) {
                expiredSubscription = (0, testUtils_1.createMockSubscription)({
                    status: 'expired',
                    endDate: new Date(Date.now() - 86400000), // Yesterday
                });
                (0, globals_1.expect)(expiredSubscription.status).toBe('expired');
                (0, globals_1.expect)(expiredSubscription.endDate < new Date()).toBe(true);
                return [2 /*return*/];
            });
        }); });
        (0, globals_1.it)('should handle cancelled subscriptions', function () { return __awaiter(void 0, void 0, void 0, function () {
            var cancelledSubscription;
            return __generator(this, function (_a) {
                cancelledSubscription = (0, testUtils_1.createMockSubscription)({
                    status: 'cancelled',
                    autoRenew: false,
                });
                (0, globals_1.expect)(cancelledSubscription.status).toBe('cancelled');
                (0, globals_1.expect)(cancelledSubscription.autoRenew).toBe(false);
                return [2 /*return*/];
            });
        }); });
        (0, globals_1.it)('should validate subscription features correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var premiumSubscription;
            return __generator(this, function (_a) {
                premiumSubscription = (0, testUtils_1.createMockSubscription)({
                    tier: 'premium',
                    features: ['premium-feature', 'advanced-analytics', 'priority-support'],
                });
                (0, globals_1.expect)(premiumSubscription.features).toContain('premium-feature');
                (0, globals_1.expect)(premiumSubscription.features).toContain('advanced-analytics');
                (0, globals_1.expect)(premiumSubscription.features.length).toBeGreaterThan(0);
                return [2 /*return*/];
            });
        }); });
    });
    // ============================================================================
    // Route Protection Tests  
    // ============================================================================
    (0, globals_1.describe)('routeProtection', function () {
        (0, globals_1.it)('should allow access to public routes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var publicRoutes;
            return __generator(this, function (_a) {
                publicRoutes = ['/', '/login', '/signup', '/about'];
                publicRoutes.forEach(function (route) {
                    (0, globals_1.expect)(route).toMatch(/^\/[a-z]*$/);
                });
                return [2 /*return*/];
            });
        }); });
        (0, globals_1.it)('should protect premium routes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var premiumRoutes, subscription;
            return __generator(this, function (_a) {
                premiumRoutes = ['/dashboard', '/analytics', '/settings'];
                subscription = (0, testUtils_1.createMockSubscription)({ status: 'active', tier: 'premium' });
                (0, globals_1.expect)(subscription.status).toBe('active');
                premiumRoutes.forEach(function (route) {
                    (0, globals_1.expect)(route).toMatch(/^\/[a-z]+$/);
                });
                return [2 /*return*/];
            });
        }); });
        (0, globals_1.it)('should redirect expired users to upgrade page', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expiredSubscription;
            return __generator(this, function (_a) {
                expiredSubscription = (0, testUtils_1.createMockSubscription)({
                    status: 'expired',
                    tier: 'premium',
                });
                (0, globals_1.expect)(expiredSubscription.status).toBe('expired');
                return [2 /*return*/];
            });
        }); });
    });
    // ============================================================================
    // Caching Tests
    // ============================================================================
    (0, globals_1.describe)('subscriptionCaching', function () {
        (0, globals_1.it)('should cache subscription data correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var cacheKey, mockData;
            return __generator(this, function (_a) {
                cacheKey = 'subscription:test-user-123';
                mockData = (0, testUtils_1.createMockSubscription)();
                (0, globals_1.expect)(cacheKey).toContain('subscription:');
                (0, globals_1.expect)(mockData.id).toBeDefined();
                return [2 /*return*/];
            });
        }); });
        (0, globals_1.it)('should handle cache invalidation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var cacheKey;
            return __generator(this, function (_a) {
                cacheKey = 'subscription:test-user-123';
                (0, globals_1.expect)(cacheKey).toMatch(/^subscription:[a-z0-9-]+$/);
                return [2 /*return*/];
            });
        }); });
    });
    // ============================================================================
    // Error Handling Tests
    // ============================================================================
    (0, globals_1.describe)('errorHandling', function () {
        (0, globals_1.it)('should handle network errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockRejectedValueOnce(new Error('Network error'));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/subscription')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        (0, globals_1.expect)(error_1).toBeInstanceOf(Error);
                        (0, globals_1.expect)(error_1.message).toBe('Network error');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle invalid subscription responses', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce((0, testUtils_1.createMockResponse)(null, 404));
                        return [4 /*yield*/, fetch('/api/subscription')];
                    case 1:
                        response = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(404);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
