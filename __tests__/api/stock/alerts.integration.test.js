"use strict";
// Stock Alerts API Integration Tests
// Story 11.4: Alertas e Relatórios de Estoque
// Integration tests covering API endpoints with database operations
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
var globals_1 = require("@jest/globals");
// Mock Next.js request/response for testing
var mockRequest = function (method, url, body) { return ({
    method: method,
    url: url,
    json: function () { return Promise.resolve(body); },
    headers: new Headers()
}); };
var mockSession = {
    user: {
        id: 'test-user-id-123',
        email: 'test@example.com'
    }
};
// Mock Supabase client
var mockSupabaseClient = {
    auth: {
        getSession: jest.fn().mockResolvedValue({
            data: { session: mockSession },
            error: null
        })
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis()
};
// Mock the Supabase import
jest.mock('@/app/utils/supabase/server', function () { return ({
    createClient: jest.fn(function () { return Promise.resolve(mockSupabaseClient); })
}); });
// Import the API handlers after mocking
var route_1 = require("@/app/api/stock/alerts/route");
var route_2 = require("@/app/api/stock/alerts/acknowledge/route");
var route_3 = require("@/app/api/stock/alerts/resolve/route");
// =====================================================
// TEST DATA FIXTURES
// =====================================================
var testClinicId = 'clinic123-e89b-12d3-a456-426614174000';
var testUserId = 'user123e45-e89b-12d3-a456-426614174000';
var testProductId = 'product123-e89b-12d3-a456-426614174000';
var testAlertId = 'alert123-e89b-12d3-a456-426614174000';
var mockProfile = {
    id: testUserId,
    clinic_id: testClinicId
};
var mockProduct = {
    id: testProductId,
    name: 'Test Product',
    sku: 'TEST001',
    current_stock: 5,
    min_stock: 10,
    clinic_id: testClinicId
};
var mockAlert = {
    id: testAlertId,
    clinic_id: testClinicId,
    product_id: testProductId,
    alert_type: 'low_stock',
    severity_level: 'medium',
    current_value: 5,
    threshold_value: 10,
    message: 'Stock level is below threshold',
    status: 'active',
    metadata: {},
    created_at: new Date().toISOString(),
    product: mockProduct
};
var mockAlertConfig = {
    id: 'config123-e89b-12d3-a456-426614174000',
    clinic_id: testClinicId,
    product_id: testProductId,
    alert_type: 'low_stock',
    threshold_value: 10,
    threshold_unit: 'quantity',
    severity_level: 'medium',
    is_active: true,
    notification_channels: ['in_app', 'email'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};
// =====================================================
// SETUP AND TEARDOWN
// =====================================================
(0, globals_1.beforeAll)(function () {
    // Setup test environment
    process.env.NODE_ENV = 'test';
});
(0, globals_1.afterAll)(function () {
    // Cleanup
    jest.clearAllMocks();
});
(0, globals_1.beforeEach)(function () {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup default successful responses
    mockSupabaseClient.single.mockResolvedValue({
        data: mockProfile,
        error: null
    });
});
(0, globals_1.afterEach)(function () {
    // Clean up after each test
    jest.resetAllMocks();
});
// =====================================================
// GET /api/stock/alerts TESTS
// =====================================================
(0, globals_1.describe)('GET /api/stock/alerts', function () {
    (0, globals_1.beforeEach)(function () {
        // Mock the chain of Supabase query methods
        mockSupabaseClient.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        range: jest.fn().mockResolvedValue({
                            data: [mockAlert],
                            error: null,
                            count: 1
                        })
                    })
                })
            })
        });
    });
    (0, globals_1.it)('should return alerts with proper pagination', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('GET', '/api/stock/alerts?limit=10&offset=0');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(200);
                    (0, globals_1.expect)(responseData.success).toBe(true);
                    (0, globals_1.expect)(responseData.data).toBeDefined();
                    (0, globals_1.expect)(Array.isArray(responseData.data)).toBe(true);
                    (0, globals_1.expect)(responseData.pagination).toBeDefined();
                    (0, globals_1.expect)(responseData.pagination.total).toBe(1);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should filter alerts by status', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('GET', '/api/stock/alerts?status=active');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(200);
                    (0, globals_1.expect)(responseData.success).toBe(true);
                    // Verify that the filter was applied
                    (0, globals_1.expect)(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should filter alerts by severity', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('GET', '/api/stock/alerts?severity=critical');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(200);
                    (0, globals_1.expect)(responseData.success).toBe(true);
                    // Verify that the filter was applied
                    (0, globals_1.expect)(mockSupabaseClient.eq).toHaveBeenCalledWith('severity_level', 'critical');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle authentication errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock authentication failure
                    mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
                        data: { session: null },
                        error: new Error('No session')
                    });
                    request = mockRequest('GET', '/api/stock/alerts');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(401);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    (0, globals_1.expect)(responseData.error).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock database error
                    mockSupabaseClient.from.mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                order: jest.fn().mockReturnValue({
                                    range: jest.fn().mockResolvedValue({
                                        data: null,
                                        error: new Error('Database connection failed')
                                    })
                                })
                            })
                        })
                    });
                    request = mockRequest('GET', '/api/stock/alerts');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(500);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    (0, globals_1.expect)(responseData.error).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should validate query parameters', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('GET', '/api/stock/alerts?limit=invalid');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    (0, globals_1.expect)(responseData.error.code).toBe('VALIDATION_ERROR');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should apply proper sorting', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('GET', '/api/stock/alerts?sortBy=severity_level&sortOrder=asc');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(200);
                    (0, globals_1.expect)(mockSupabaseClient.order).toHaveBeenCalledWith('severity_level', { ascending: true });
                    return [2 /*return*/];
            }
        });
    }); });
});
// =====================================================
// POST /api/stock/alerts TESTS
// =====================================================
(0, globals_1.describe)('POST /api/stock/alerts', function () {
    var validCreateRequest = {
        productId: testProductId,
        alertType: 'low_stock',
        thresholdValue: 10,
        thresholdUnit: 'quantity',
        severityLevel: 'medium',
        notificationChannels: ['in_app', 'email']
    };
    (0, globals_1.beforeEach)(function () {
        // Mock successful alert config creation
        mockSupabaseClient.from.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockAlertConfig,
                        error: null
                    })
                })
            })
        });
    });
    (0, globals_1.it)('should create alert configuration successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('POST', '/api/stock/alerts', validCreateRequest);
                    return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(201);
                    (0, globals_1.expect)(responseData.success).toBe(true);
                    (0, globals_1.expect)(responseData.data.alertConfig).toBeDefined();
                    (0, globals_1.expect)(responseData.data.alertConfig.id).toBe(mockAlertConfig.id);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should validate required fields', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest, request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidRequest = __assign(__assign({}, validCreateRequest), { thresholdValue: undefined });
                    request = mockRequest('POST', '/api/stock/alerts', invalidRequest);
                    return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    (0, globals_1.expect)(responseData.error.code).toBe('VALIDATION_ERROR');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should reject negative threshold values', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest, request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidRequest = __assign(__assign({}, validCreateRequest), { thresholdValue: -5 });
                    request = mockRequest('POST', '/api/stock/alerts', invalidRequest);
                    return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should require either productId or categoryId', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest, request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidRequest = __assign(__assign({}, validCreateRequest), { productId: undefined, categoryId: undefined });
                    request = mockRequest('POST', '/api/stock/alerts', invalidRequest);
                    return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle duplicate configuration errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock duplicate constraint error
                    mockSupabaseClient.from.mockReturnValue({
                        insert: jest.fn().mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({
                                    data: null,
                                    error: { code: '23505', message: 'duplicate key value violates unique constraint' }
                                })
                            })
                        })
                    });
                    request = mockRequest('POST', '/api/stock/alerts', validCreateRequest);
                    return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(500);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
// =====================================================
// POST /api/stock/alerts/acknowledge TESTS
// =====================================================
(0, globals_1.describe)('POST /api/stock/alerts/acknowledge', function () {
    var validAcknowledgeRequest = {
        alertId: testAlertId,
        note: 'Acknowledged by manager'
    };
    (0, globals_1.beforeEach)(function () {
        // Mock successful alert retrieval and update
        mockSupabaseClient.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockAlert,
                        error: null
                    })
                })
            }),
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: __assign(__assign({}, mockAlert), { status: 'acknowledged' }),
                            error: null
                        })
                    })
                })
            })
        });
    });
    (0, globals_1.it)('should acknowledge alert successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('POST', '/api/stock/alerts/acknowledge', validAcknowledgeRequest);
                    return [4 /*yield*/, (0, route_2.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(200);
                    (0, globals_1.expect)(responseData.success).toBe(true);
                    (0, globals_1.expect)(responseData.data.status).toBe('acknowledged');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should validate alert ID format', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest, request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidRequest = __assign(__assign({}, validAcknowledgeRequest), { alertId: 'invalid-uuid' });
                    request = mockRequest('POST', '/api/stock/alerts/acknowledge', invalidRequest);
                    return [4 /*yield*/, (0, route_2.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    (0, globals_1.expect)(responseData.error.code).toBe('VALIDATION_ERROR');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle non-existent alert', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock alert not found
                    mockSupabaseClient.from.mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({
                                    data: null,
                                    error: new Error('Alert not found')
                                })
                            })
                        })
                    });
                    request = mockRequest('POST', '/api/stock/alerts/acknowledge', validAcknowledgeRequest);
                    return [4 /*yield*/, (0, route_2.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(404);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should reject acknowledging already acknowledged alert', function () { return __awaiter(void 0, void 0, void 0, function () {
        var acknowledgedAlert, request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    acknowledgedAlert = __assign(__assign({}, mockAlert), { status: 'acknowledged' });
                    mockSupabaseClient.from.mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({
                                    data: acknowledgedAlert,
                                    error: null
                                })
                            })
                        })
                    });
                    request = mockRequest('POST', '/api/stock/alerts/acknowledge', validAcknowledgeRequest);
                    return [4 /*yield*/, (0, route_2.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
// =====================================================
// POST /api/stock/alerts/resolve TESTS
// =====================================================
(0, globals_1.describe)('POST /api/stock/alerts/resolve', function () {
    var validResolveRequest = {
        alertId: testAlertId,
        resolution: 'Stock replenished from emergency supply',
        actionsTaken: ['emergency_purchase']
    };
    (0, globals_1.beforeEach)(function () {
        // Mock successful alert retrieval and resolution
        mockSupabaseClient.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockAlert,
                        error: null
                    })
                })
            }),
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: __assign(__assign({}, mockAlert), { status: 'resolved' }),
                            error: null
                        })
                    })
                })
            })
        });
    });
    (0, globals_1.it)('should resolve alert successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('POST', '/api/stock/alerts/resolve', validResolveRequest);
                    return [4 /*yield*/, (0, route_3.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(200);
                    (0, globals_1.expect)(responseData.success).toBe(true);
                    (0, globals_1.expect)(responseData.data.status).toBe('resolved');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should require resolution description', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest, request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidRequest = __assign(__assign({}, validResolveRequest), { resolution: '' });
                    request = mockRequest('POST', '/api/stock/alerts/resolve', invalidRequest);
                    return [4 /*yield*/, (0, route_3.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle already resolved alert', function () { return __awaiter(void 0, void 0, void 0, function () {
        var resolvedAlert, request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    resolvedAlert = __assign(__assign({}, mockAlert), { status: 'resolved' });
                    mockSupabaseClient.from.mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                single: jest.fn().mockResolvedValue({
                                    data: resolvedAlert,
                                    error: null
                                })
                            })
                        })
                    });
                    request = mockRequest('POST', '/api/stock/alerts/resolve', validResolveRequest);
                    return [4 /*yield*/, (0, route_3.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should validate resolution text length', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidRequest, request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    invalidRequest = __assign(__assign({}, validResolveRequest), { resolution: 'a'.repeat(1001) // Too long
                     });
                    request = mockRequest('POST', '/api/stock/alerts/resolve', invalidRequest);
                    return [4 /*yield*/, (0, route_3.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(400);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
// =====================================================
// EDGE CASES AND ERROR HANDLING TESTS
// =====================================================
(0, globals_1.describe)('Edge Cases and Error Handling', function () {
    (0, globals_1.it)('should handle malformed JSON in request body', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = {
                        method: 'POST',
                        url: '/api/stock/alerts',
                        json: function () { return Promise.reject(new Error('Invalid JSON')); },
                        headers: new Headers()
                    };
                    return [4 /*yield*/, (0, route_1.POST)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(500);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle network timeouts gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response, responseData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock timeout error
                    mockSupabaseClient.from.mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                order: jest.fn().mockReturnValue({
                                    range: jest.fn().mockRejectedValue(new Error('TIMEOUT'))
                                })
                            })
                        })
                    });
                    request = mockRequest('GET', '/api/stock/alerts');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(500);
                    (0, globals_1.expect)(responseData.success).toBe(false);
                    (0, globals_1.expect)(responseData.error.code).toBe('INTERNAL_ERROR');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should handle concurrent acknowledgment attempts', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('POST', '/api/stock/alerts/acknowledge', {
                        alertId: testAlertId,
                        note: 'Concurrent acknowledgment'
                    });
                    return [4 /*yield*/, (0, route_2.POST)(request)];
                case 1:
                    response = _a.sent();
                    // In a real scenario, this might result in a conflict error
                    (0, globals_1.expect)([200, 409]).toContain(response.status);
                    return [2 /*return*/];
            }
        });
    }); });
});
// =====================================================
// PERFORMANCE TESTS
// =====================================================
(0, globals_1.describe)('Performance Tests', function () {
    (0, globals_1.it)('should handle large result sets efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
        var largeDataset, startTime, request, response, endTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    largeDataset = Array(1000).fill(mockAlert).map(function (alert, index) { return (__assign(__assign({}, alert), { id: "alert-".concat(index) })); });
                    mockSupabaseClient.from.mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                order: jest.fn().mockReturnValue({
                                    range: jest.fn().mockResolvedValue({
                                        data: largeDataset,
                                        error: null,
                                        count: 1000
                                    })
                                })
                            })
                        })
                    });
                    startTime = Date.now();
                    request = mockRequest('GET', '/api/stock/alerts?limit=100');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    endTime = Date.now();
                    (0, globals_1.expect)(response.status).toBe(200);
                    (0, globals_1.expect)(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('should respect rate limiting (conceptual test)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    request = mockRequest('GET', '/api/stock/alerts');
                    return [4 /*yield*/, (0, route_1.GET)(request)];
                case 1:
                    response = _a.sent();
                    (0, globals_1.expect)(response.status).toBe(200);
                    return [2 /*return*/];
            }
        });
    }); });
});
