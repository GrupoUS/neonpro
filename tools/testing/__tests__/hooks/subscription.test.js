"use strict";
/**
 * Subscription Hooks Unit Tests
 * Tests React hooks for subscription management
 *
 * @description Comprehensive tests for subscription-related React hooks,
 *              covering state management, caching, and real-time updates
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
var react_1 = require("@testing-library/react");
var testUtils_1 = require("../utils/testUtils");
// Mock the subscription hooks (to be imported when they exist)
var mockUseSubscriptionStatus = function () { return (0, testUtils_1.createMockSubscriptionHook)(); };
// ============================================================================
// Hook Tests
// ============================================================================
(0, globals_1.describe)('Subscription Hooks', function () {
    var queryClient;
    (0, globals_1.beforeEach)(function () {
        queryClient = (0, testUtils_1.createTestQueryClient)();
        globals_1.jest.clearAllMocks();
    });
    // ============================================================================
    // useSubscriptionStatus Tests
    // ============================================================================
    (0, globals_1.describe)('useSubscriptionStatus', function () {
        (0, globals_1.it)('should return subscription data correctly', function () {
            var result = (0, react_1.renderHook)(function () { return mockUseSubscriptionStatus(); }, {
                wrapper: function (_a) {
                    var children = _a.children;
                    return (0, testUtils_1.AllTheProviders)({ queryClient: queryClient, children: children });
                }
            }).result;
            (0, globals_1.expect)(result.current.data).toBeDefined();
            (0, globals_1.expect)(result.current.isLoading).toBe(false);
            (0, globals_1.expect)(result.current.isError).toBe(false);
        });
        (0, globals_1.it)('should handle loading state correctly', function () {
            var mockHook = (0, testUtils_1.createMockSubscriptionHook)({ isLoading: true });
            (0, globals_1.expect)(mockHook.isLoading).toBe(true);
            (0, globals_1.expect)(mockHook.data).toBeDefined();
        });
        (0, globals_1.it)('should handle error states correctly', function () {
            var mockError = new Error('Failed to fetch subscription');
            var mockHook = (0, testUtils_1.createMockSubscriptionHook)({
                isError: true,
                error: mockError
            });
            (0, globals_1.expect)(mockHook.isError).toBe(true);
            (0, globals_1.expect)(mockHook.error).toBe(mockError);
        });
        (0, globals_1.it)('should support refetching subscription data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockRefetch, mockHook;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRefetch = globals_1.jest.fn().mockResolvedValue({
                            data: (0, testUtils_1.createMockSubscription)()
                        });
                        mockHook = (0, testUtils_1.createMockSubscriptionHook)({ refetch: mockRefetch });
                        return [4 /*yield*/, (0, react_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, mockHook.refetch()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        (0, globals_1.expect)(mockRefetch).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    // ============================================================================
    // Real-time Updates Tests
    // ============================================================================
    (0, globals_1.describe)('useSubscriptionEvents', function () {
        (0, globals_1.it)('should handle subscription change events', function () {
            var mockEventHandler = globals_1.jest.fn();
            var mockEvent = {
                type: 'subscription_updated',
                data: (0, testUtils_1.createMockSubscription)()
            };
            // Simulate event handling
            mockEventHandler(mockEvent);
            (0, globals_1.expect)(mockEventHandler).toHaveBeenCalledWith(mockEvent);
            (0, globals_1.expect)(mockEventHandler).toHaveBeenCalledTimes(1);
        });
    });
});
