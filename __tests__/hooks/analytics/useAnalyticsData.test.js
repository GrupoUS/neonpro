"use strict";
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
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
var useAnalyticsData_1 = require("@/hooks/analytics/useAnalyticsData");
var mockData_1 = require("@/../../__tests__/utils/mockData");
// Mock Supabase client
jest.mock('@/utils/supabase/client', function () { return ({
    createSupabaseClient: function () { return ({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
    }); },
}); });
var createWrapper = function () {
    var queryClient = new react_query_1.QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return function (_a) {
        var children = _a.children;
        return react_1.default.createElement(react_query_1.QueryClientProvider, { client: queryClient }, children);
    };
};
describe('useAnalyticsData', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('should return analytics data successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSupabase = require('@/utils/supabase/client').createSupabaseClient();
                    mockSupabase.select.mockResolvedValueOnce({
                        data: mockData_1.mockAnalyticsData,
                        error: null,
                    });
                    result = (0, react_2.renderHook)(function () { return (0, useAnalyticsData_1.useAnalyticsData)({
                        dateRange: { start: '2024-01-01', end: '2024-01-31' },
                        treatments: ['facial'],
                    }); }, { wrapper: createWrapper() }).result;
                    // Initially loading
                    expect(result.current.isLoading).toBe(true);
                    expect(result.current.data).toBeUndefined();
                    expect(result.current.error).toBeNull();
                    // Wait for data to load
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(result.current.isLoading).toBe(false);
                        })
                        // Verify successful data load
                    ];
                case 1:
                    // Wait for data to load
                    _a.sent();
                    // Verify successful data load
                    expect(result.current.data).toEqual(mockData_1.mockAnalyticsData);
                    expect(result.current.error).toBeNull();
                    expect(result.current.isSuccess).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle API errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSupabase = require('@/utils/supabase/client').createSupabaseClient();
                    mockSupabase.select.mockResolvedValueOnce(mockData_1.mockErrorResponse);
                    result = (0, react_2.renderHook)(function () { return (0, useAnalyticsData_1.useAnalyticsData)({
                        dateRange: { start: '2024-01-01', end: '2024-01-31' },
                    }); }, { wrapper: createWrapper() }).result;
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(result.current.isLoading).toBe(false);
                        })
                        // Verify error handling
                    ];
                case 1:
                    _a.sent();
                    // Verify error handling
                    expect(result.current.error).toBeTruthy();
                    expect(result.current.data).toBeUndefined();
                    expect(result.current.isError).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should refetch data when filters change', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, _a, result, rerender;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockSupabase = require('@/utils/supabase/client').createSupabaseClient();
                    mockSupabase.select.mockResolvedValue({
                        data: mockData_1.mockAnalyticsData,
                        error: null,
                    });
                    _a = (0, react_2.renderHook)(function (_a) {
                        var filters = _a.filters;
                        return (0, useAnalyticsData_1.useAnalyticsData)(filters);
                    }, {
                        wrapper: createWrapper(),
                        initialProps: {
                            filters: { dateRange: { start: '2024-01-01', end: '2024-01-31' } },
                        },
                    }), result = _a.result, rerender = _a.rerender;
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(result.current.isSuccess).toBe(true);
                        })
                        // Change filters
                    ];
                case 1:
                    _b.sent();
                    // Change filters
                    rerender({
                        filters: { dateRange: { start: '2024-02-01', end: '2024-02-28' } },
                    });
                    // Should trigger refetch
                    expect(result.current.isLoading).toBe(true);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(result.current.isSuccess).toBe(true);
                        })
                        // Verify Supabase was called twice (initial load + refetch)
                    ];
                case 2:
                    _b.sent();
                    // Verify Supabase was called twice (initial load + refetch)
                    expect(mockSupabase.select).toHaveBeenCalledTimes(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should cache data properly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, filters, result1, result2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockSupabase = require('@/utils/supabase/client').createSupabaseClient();
                    mockSupabase.select.mockResolvedValue({
                        data: mockData_1.mockAnalyticsData,
                        error: null,
                    });
                    filters = { dateRange: { start: '2024-01-01', end: '2024-01-31' } };
                    result1 = (0, react_2.renderHook)(function () { return (0, useAnalyticsData_1.useAnalyticsData)(filters); }, { wrapper: createWrapper() }).result;
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(result1.current.isSuccess).toBe(true);
                        })
                        // Second hook instance with same filters
                    ];
                case 1:
                    _a.sent();
                    result2 = (0, react_2.renderHook)(function () { return (0, useAnalyticsData_1.useAnalyticsData)(filters); }, { wrapper: createWrapper() }).result;
                    // Should use cached data
                    expect(result2.current.data).toEqual(mockData_1.mockAnalyticsData);
                    expect(result2.current.isLoading).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
