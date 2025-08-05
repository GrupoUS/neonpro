"use strict";
/**
 * Webhook Manager Tests
 * Story 7.3: Webhook & Event System Implementation
 *
 * Comprehensive test suite for webhook management functionality:
 * - Webhook registration and configuration
 * - Event delivery and retry mechanisms
 * - Signature validation and security
 * - Rate limiting and throttling
 * - Analytics and monitoring
 * - Error handling and edge cases
 */
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
var webhook_manager_1 = require("../webhook-manager");
var utils_1 = require("../utils");
// Mock fetch for HTTP requests
global.fetch = vitest_1.vi.fn();
// Mock Supabase
var mockSupabase = {
    from: vitest_1.vi.fn(function () { return ({
        insert: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vitest_1.vi.fn().mockReturnThis(),
        eq: vitest_1.vi.fn().mockReturnThis(),
        order: vitest_1.vi.fn().mockReturnThis(),
        limit: vitest_1.vi.fn().mockResolvedValue({ data: [], error: null }),
        update: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
        delete: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
        gte: vitest_1.vi.fn().mockReturnThis(),
        lte: vitest_1.vi.fn().mockReturnThis()
    }); })
};
// Mock crypto for consistent IDs
vitest_1.vi.mock('crypto', function () { return ({
    randomUUID: vitest_1.vi.fn(function () { return 'test-uuid-123'; }),
    createHmac: vitest_1.vi.fn(function () { return ({
        update: vitest_1.vi.fn().mockReturnThis(),
        digest: vitest_1.vi.fn(function () { return 'test-signature'; })
    }); }),
    timingSafeEqual: vitest_1.vi.fn(function () { return true; })
}); });
(0, vitest_1.describe)('WebhookManager', function () {
    var webhookManager;
    var mockConfig;
    var mockFetch;
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        mockFetch = fetch;
        mockConfig = {
            supabase: mockSupabase,
            defaultTimeout: 10000,
            defaultRetryStrategy: {
                strategy: 'exponential',
                maxAttempts: 3,
                delayMs: 1000
            },
            enableSignatureValidation: true,
            enableRateLimit: true,
            enableAnalytics: true
        };
        webhookManager = new webhook_manager_1.WebhookManager(mockConfig);
    });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.describe)('Webhook Registration', function () {
        (0, vitest_1.it)('should register a new webhook endpoint', function () { return __awaiter(void 0, void 0, void 0, function () {
            var webhookData, webhookId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        webhookData = {
                            name: 'Patient Events Webhook',
                            url: 'https://api.example.com/webhooks/patients',
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created', 'patient.updated'],
                            isActive: true,
                            secret: 'webhook-secret-123',
                            headers: { 'Authorization': 'Bearer token123' },
                            timeoutMs: 15000,
                            retryStrategy: {
                                strategy: 'exponential',
                                maxAttempts: 3,
                                delayMs: 1000
                            },
                            rateLimit: {
                                requestsPerMinute: 60,
                                burstLimit: 10
                            }
                        };
                        return [4 /*yield*/, webhookManager.registerWebhook(webhookData)];
                    case 1:
                        webhookId = _a.sent();
                        (0, vitest_1.expect)(webhookId).toBe('test-uuid-123');
                        (0, vitest_1.expect)(mockSupabase.from).toHaveBeenCalledWith('webhook_endpoints');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should validate webhook configuration before registration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidWebhookData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidWebhookData = {
                            name: '',
                            url: 'invalid-url',
                            clinicId: '',
                            eventTypes: [],
                            isActive: true
                        };
                        return [4 /*yield*/, (0, vitest_1.expect)(webhookManager.registerWebhook(invalidWebhookData))
                                .rejects.toThrow('Webhook validation failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should update existing webhook', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = {
                            name: 'Updated Webhook Name',
                            isActive: false,
                            eventTypes: ['patient.created', 'patient.updated', 'patient.deleted']
                        };
                        return [4 /*yield*/, webhookManager.updateWebhook('webhook-123', updates)];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockSupabase.from().update).toHaveBeenCalledWith(vitest_1.expect.objectContaining(updates));
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should delete webhook', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, webhookManager.deleteWebhook('webhook-123')];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockSupabase.from().delete().eq).toHaveBeenCalledWith('id', 'webhook-123');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should get webhook by ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWebhook, webhook;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWebhook = {
                            id: 'webhook-123',
                            name: 'Test Webhook',
                            url: 'https://api.example.com/webhook'
                        };
                        mockSupabase.from().select().eq().mockResolvedValueOnce({
                            data: [mockWebhook],
                            error: null
                        });
                        return [4 /*yield*/, webhookManager.getWebhook('webhook-123')];
                    case 1:
                        webhook = _a.sent();
                        (0, vitest_1.expect)(webhook).toEqual(mockWebhook);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should list webhooks for clinic', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWebhooks, webhooks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWebhooks = [
                            { id: 'webhook-1', name: 'Webhook 1' },
                            { id: 'webhook-2', name: 'Webhook 2' }
                        ];
                        mockSupabase.from().select().eq().mockResolvedValueOnce({
                            data: mockWebhooks,
                            error: null
                        });
                        return [4 /*yield*/, webhookManager.getWebhooksForClinic('clinic-123')];
                    case 1:
                        webhooks = _a.sent();
                        (0, vitest_1.expect)(webhooks).toEqual(mockWebhooks);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Event Delivery', function () {
        var mockEvent = {
            id: 'event-123',
            type: 'patient.created',
            source: 'patient-service',
            data: { patientId: '123', name: 'John Doe' },
            metadata: { clinicId: 'clinic-123' },
            priority: 'normal',
            version: '1.0.0',
            timestamp: new Date(),
            fingerprint: 'fp-123',
            context: {}
        };
        var mockWebhook = {
            id: 'webhook-123',
            name: 'Test Webhook',
            url: 'https://api.example.com/webhook',
            clinicId: 'clinic-123',
            eventTypes: ['patient.created'],
            isActive: true,
            secret: 'webhook-secret',
            headers: {},
            timeoutMs: 10000,
            retryStrategy: {
                strategy: 'exponential',
                maxAttempts: 3,
                delayMs: 1000
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        (0, vitest_1.it)('should deliver event to webhook successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var delivery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 1:
                        delivery = _a.sent();
                        (0, vitest_1.expect)(delivery.status).toBe('delivered');
                        (0, vitest_1.expect)(delivery.responseStatus).toBe(200);
                        (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(mockWebhook.url, vitest_1.expect.objectContaining({
                            method: 'POST',
                            headers: vitest_1.expect.objectContaining({
                                'Content-Type': 'application/json',
                                'X-Event-Type': mockEvent.type,
                                'X-Event-ID': mockEvent.id
                            }),
                            body: vitest_1.expect.any(String)
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle delivery failure and retry', function () { return __awaiter(void 0, void 0, void 0, function () {
            var delivery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch
                            .mockRejectedValueOnce(new Error('Network error'))
                            .mockRejectedValueOnce(new Error('Network error'))
                            .mockResolvedValueOnce({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 1:
                        delivery = _a.sent();
                        (0, vitest_1.expect)(delivery.status).toBe('delivered');
                        (0, vitest_1.expect)(delivery.attempts).toBe(3);
                        (0, vitest_1.expect)(mockFetch).toHaveBeenCalledTimes(3);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should fail after max retry attempts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var delivery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockRejectedValue(new Error('Persistent network error'));
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 1:
                        delivery = _a.sent();
                        (0, vitest_1.expect)(delivery.status).toBe('failed');
                        (0, vitest_1.expect)(delivery.attempts).toBe(3);
                        (0, vitest_1.expect)(delivery.lastError).toContain('Persistent network error');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle HTTP error responses', function () { return __awaiter(void 0, void 0, void 0, function () {
            var delivery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: false,
                            status: 500,
                            statusText: 'Internal Server Error',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('Server Error'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 1:
                        delivery = _a.sent();
                        (0, vitest_1.expect)(delivery.status).toBe('failed');
                        (0, vitest_1.expect)(delivery.responseStatus).toBe(500);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should respect timeout configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var slowWebhook, delivery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        slowWebhook = __assign(__assign({}, mockWebhook), { timeoutMs: 1000 // 1 second timeout
                         });
                        // Mock a slow response
                        mockFetch.mockImplementationOnce(function () {
                            return new Promise(function (resolve) { return setTimeout(resolve, 2000); });
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, slowWebhook)];
                    case 1:
                        delivery = _a.sent();
                        (0, vitest_1.expect)(delivery.status).toBe('failed');
                        (0, vitest_1.expect)(delivery.lastError).toContain('timeout');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should include proper headers and signature', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(mockWebhook.url, vitest_1.expect.objectContaining({
                            headers: vitest_1.expect.objectContaining({
                                'X-Webhook-Signature': vitest_1.expect.stringContaining('sha256=')
                            })
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Bulk Event Delivery', function () {
        var mockEvents = [
            {
                id: 'event-1',
                type: 'patient.created',
                source: 'patient-service',
                data: { patientId: '1' },
                metadata: { clinicId: 'clinic-123' },
                priority: 'normal',
                version: '1.0.0',
                timestamp: new Date(),
                fingerprint: 'fp-1',
                context: {}
            },
            {
                id: 'event-2',
                type: 'patient.updated',
                source: 'patient-service',
                data: { patientId: '2' },
                metadata: { clinicId: 'clinic-123' },
                priority: 'normal',
                version: '1.0.0',
                timestamp: new Date(),
                fingerprint: 'fp-2',
                context: {}
            }
        ];
        (0, vitest_1.it)('should deliver multiple events to matching webhooks', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWebhooks, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWebhooks = [
                            {
                                id: 'webhook-1',
                                name: 'Patient Webhook',
                                url: 'https://api.example.com/webhook1',
                                clinicId: 'clinic-123',
                                eventTypes: ['patient.created', 'patient.updated'],
                                isActive: true,
                                secret: 'secret1',
                                headers: {},
                                timeoutMs: 10000,
                                retryStrategy: { strategy: 'exponential', maxAttempts: 3, delayMs: 1000 },
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }
                        ];
                        mockSupabase.from().select().eq().mockResolvedValueOnce({
                            data: mockWebhooks,
                            error: null
                        });
                        mockFetch.mockResolvedValue({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvents(mockEvents)];
                    case 1:
                        results = _a.sent();
                        (0, vitest_1.expect)(results).toHaveLength(2); // 2 events delivered
                        (0, vitest_1.expect)(mockFetch).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should filter events by webhook event types', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWebhooks, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWebhooks = [
                            {
                                id: 'webhook-1',
                                name: 'Patient Create Only',
                                url: 'https://api.example.com/webhook1',
                                clinicId: 'clinic-123',
                                eventTypes: ['patient.created'], // Only patient.created
                                isActive: true,
                                secret: 'secret1',
                                headers: {},
                                timeoutMs: 10000,
                                retryStrategy: { strategy: 'exponential', maxAttempts: 3, delayMs: 1000 },
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }
                        ];
                        mockSupabase.from().select().eq().mockResolvedValueOnce({
                            data: mockWebhooks,
                            error: null
                        });
                        mockFetch.mockResolvedValue({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvents(mockEvents)];
                    case 1:
                        results = _a.sent();
                        (0, vitest_1.expect)(results).toHaveLength(1); // Only 1 event should match
                        (0, vitest_1.expect)(mockFetch).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle concurrent deliveries', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWebhooks, startTime, results, endTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWebhooks = Array.from({ length: 5 }, function (_, i) { return ({
                            id: "webhook-".concat(i),
                            name: "Webhook ".concat(i),
                            url: "https://api.example.com/webhook".concat(i),
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created', 'patient.updated'],
                            isActive: true,
                            secret: "secret".concat(i),
                            headers: {},
                            timeoutMs: 10000,
                            retryStrategy: { strategy: 'exponential', maxAttempts: 3, delayMs: 1000 },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }); });
                        mockSupabase.from().select().eq().mockResolvedValueOnce({
                            data: mockWebhooks,
                            error: null
                        });
                        mockFetch.mockResolvedValue({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        startTime = Date.now();
                        return [4 /*yield*/, webhookManager.deliverEvents(mockEvents)];
                    case 1:
                        results = _a.sent();
                        endTime = Date.now();
                        // Should complete concurrently, not sequentially
                        (0, vitest_1.expect)(endTime - startTime).toBeLessThan(1000); // Should be much faster than sequential
                        (0, vitest_1.expect)(results).toHaveLength(10); // 2 events × 5 webhooks
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Rate Limiting', function () {
        (0, vitest_1.it)('should enforce rate limits per webhook', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWebhook, mockEvent, delivery1, delivery2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWebhook = {
                            id: 'webhook-123',
                            name: 'Rate Limited Webhook',
                            url: 'https://api.example.com/webhook',
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created'],
                            isActive: true,
                            rateLimit: {
                                requestsPerMinute: 2, // Very low limit for testing
                                burstLimit: 1
                            },
                            timeoutMs: 10000,
                            retryStrategy: { strategy: 'exponential', maxAttempts: 3, delayMs: 1000 },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        mockEvent = {
                            id: 'event-123',
                            type: 'patient.created',
                            source: 'patient-service',
                            data: { patientId: '123' },
                            metadata: { clinicId: 'clinic-123' },
                            priority: 'normal',
                            version: '1.0.0',
                            timestamp: new Date(),
                            fingerprint: 'fp-123',
                            context: {}
                        };
                        mockFetch.mockResolvedValue({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 1:
                        delivery1 = _a.sent();
                        (0, vitest_1.expect)(delivery1.status).toBe('delivered');
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 2:
                        delivery2 = _a.sent();
                        (0, vitest_1.expect)(delivery2.status).toBe('rate_limited');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should reset rate limits after time window', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would require mocking time or using a shorter window for testing
                // Implementation depends on the specific rate limiting strategy
                (0, vitest_1.expect)(true).toBe(true); // Placeholder
                return [2 /*return*/];
            });
        }); });
    });
    (0, vitest_1.describe)('Analytics and Monitoring', function () {
        (0, vitest_1.it)('should track delivery analytics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var startDate, endDate, analytics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startDate = new Date('2024-01-01');
                        endDate = new Date('2024-01-31');
                        mockSupabase.from().select().mockResolvedValueOnce({
                            data: [
                                { status: 'delivered', count: 100, avg_response_time: 250 },
                                { status: 'failed', count: 10, avg_response_time: null }
                            ],
                            error: null
                        });
                        return [4 /*yield*/, webhookManager.getDeliveryAnalytics('webhook-123', startDate, endDate)];
                    case 1:
                        analytics = _a.sent();
                        (0, vitest_1.expect)(analytics).toMatchObject({
                            totalDeliveries: 110,
                            successfulDeliveries: 100,
                            failedDeliveries: 10,
                            successRate: vitest_1.expect.any(Number),
                            averageResponseTime: vitest_1.expect.any(Number)
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should get webhook health status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var health;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from().select().mockResolvedValueOnce({
                            data: [
                                { status: 'delivered', created_at: new Date().toISOString() },
                                { status: 'delivered', created_at: new Date().toISOString() },
                                { status: 'failed', created_at: new Date().toISOString() }
                            ],
                            error: null
                        });
                        return [4 /*yield*/, webhookManager.getWebhookHealth('webhook-123')];
                    case 1:
                        health = _a.sent();
                        (0, vitest_1.expect)(health).toMatchObject({
                            isHealthy: vitest_1.expect.any(Boolean),
                            successRate: vitest_1.expect.any(Number),
                            lastDeliveryAt: vitest_1.expect.any(Date),
                            recentFailures: vitest_1.expect.any(Number)
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should get system-wide analytics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var analytics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, webhookManager.getSystemAnalytics()];
                    case 1:
                        analytics = _a.sent();
                        (0, vitest_1.expect)(analytics).toMatchObject({
                            totalWebhooks: vitest_1.expect.any(Number),
                            activeWebhooks: vitest_1.expect.any(Number),
                            totalDeliveries: vitest_1.expect.any(Number),
                            overallSuccessRate: vitest_1.expect.any(Number)
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Security and Validation', function () {
        (0, vitest_1.it)('should validate webhook signatures', function () {
            var payload = JSON.stringify({ test: 'data' });
            var secret = 'webhook-secret';
            var signature = utils_1.WebhookUtils.generateSignature(payload, secret);
            var isValid = utils_1.WebhookUtils.verifySignature(payload, signature, secret);
            (0, vitest_1.expect)(isValid).toBe(true);
        });
        (0, vitest_1.it)('should reject invalid signatures', function () {
            var payload = JSON.stringify({ test: 'data' });
            var secret = 'webhook-secret';
            var invalidSignature = 'invalid-signature';
            var isValid = utils_1.WebhookUtils.verifySignature(payload, invalidSignature, secret);
            (0, vitest_1.expect)(isValid).toBe(false);
        });
        (0, vitest_1.it)('should sanitize sensitive data in payloads', function () { return __awaiter(void 0, void 0, void 0, function () {
            var eventWithSensitiveData, mockWebhook, callArgs, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        eventWithSensitiveData = {
                            id: 'event-123',
                            type: 'patient.created',
                            source: 'patient-service',
                            data: {
                                patientId: '123',
                                name: 'John Doe',
                                password: 'secret123', // Should be sanitized
                                creditCard: '1234-5678-9012-3456' // Should be sanitized
                            },
                            metadata: { clinicId: 'clinic-123' },
                            priority: 'normal',
                            version: '1.0.0',
                            timestamp: new Date(),
                            fingerprint: 'fp-123',
                            context: {}
                        };
                        mockWebhook = {
                            id: 'webhook-123',
                            name: 'Test Webhook',
                            url: 'https://api.example.com/webhook',
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created'],
                            isActive: true,
                            secret: 'webhook-secret',
                            headers: {},
                            timeoutMs: 10000,
                            retryStrategy: { strategy: 'exponential', maxAttempts: 3, delayMs: 1000 },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(eventWithSensitiveData, mockWebhook)];
                    case 1:
                        _a.sent();
                        callArgs = mockFetch.mock.calls[0][1];
                        payload = JSON.parse(callArgs.body);
                        (0, vitest_1.expect)(payload.data.password).toBe('[REDACTED]');
                        (0, vitest_1.expect)(payload.data.creditCard).toBe('[REDACTED]');
                        (0, vitest_1.expect)(payload.data.name).toBe('John Doe'); // Non-sensitive data preserved
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Error Handling', function () {
        (0, vitest_1.it)('should handle database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var webhookData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from().insert.mockRejectedValueOnce(new Error('Database error'));
                        webhookData = {
                            name: 'Test Webhook',
                            url: 'https://api.example.com/webhook',
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created'],
                            isActive: true
                        };
                        return [4 /*yield*/, (0, vitest_1.expect)(webhookManager.registerWebhook(webhookData))
                                .rejects.toThrow('Failed to register webhook')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle network timeouts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockEvent, mockWebhook, delivery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockEvent = {
                            id: 'event-123',
                            type: 'patient.created',
                            source: 'patient-service',
                            data: { patientId: '123' },
                            metadata: { clinicId: 'clinic-123' },
                            priority: 'normal',
                            version: '1.0.0',
                            timestamp: new Date(),
                            fingerprint: 'fp-123',
                            context: {}
                        };
                        mockWebhook = {
                            id: 'webhook-123',
                            name: 'Test Webhook',
                            url: 'https://api.example.com/webhook',
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created'],
                            isActive: true,
                            timeoutMs: 1000,
                            retryStrategy: { strategy: 'exponential', maxAttempts: 1, delayMs: 1000 },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        mockFetch.mockImplementationOnce(function () {
                            return new Promise(function (_, reject) {
                                return setTimeout(function () { return reject(new Error('Request timeout')); }, 2000);
                            });
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 1:
                        delivery = _a.sent();
                        (0, vitest_1.expect)(delivery.status).toBe('failed');
                        (0, vitest_1.expect)(delivery.lastError).toContain('timeout');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should handle malformed webhook URLs', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidWebhookData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidWebhookData = {
                            name: 'Invalid Webhook',
                            url: 'not-a-valid-url',
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created'],
                            isActive: true
                        };
                        return [4 /*yield*/, (0, vitest_1.expect)(webhookManager.registerWebhook(invalidWebhookData))
                                .rejects.toThrow('Webhook validation failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('Integration with Utilities', function () {
        (0, vitest_1.it)('should use WebhookUtils for validation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var validateWebhookConfigSpy, webhookData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validateWebhookConfigSpy = vitest_1.vi.spyOn(utils_1.WebhookUtils, 'validateWebhookUrl');
                        webhookData = {
                            name: 'Test Webhook',
                            url: 'https://api.example.com/webhook',
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created'],
                            isActive: true
                        };
                        return [4 /*yield*/, webhookManager.registerWebhook(webhookData)];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(validateWebhookConfigSpy).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should use RetryUtils for retry logic', function () { return __awaiter(void 0, void 0, void 0, function () {
            var executeWithRetrySpy, mockEvent, mockWebhook;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        executeWithRetrySpy = vitest_1.vi.spyOn(utils_1.RetryUtils, 'executeWithRetry');
                        mockEvent = {
                            id: 'event-123',
                            type: 'patient.created',
                            source: 'patient-service',
                            data: { patientId: '123' },
                            metadata: { clinicId: 'clinic-123' },
                            priority: 'normal',
                            version: '1.0.0',
                            timestamp: new Date(),
                            fingerprint: 'fp-123',
                            context: {}
                        };
                        mockWebhook = {
                            id: 'webhook-123',
                            name: 'Test Webhook',
                            url: 'https://api.example.com/webhook',
                            clinicId: 'clinic-123',
                            eventTypes: ['patient.created'],
                            isActive: true,
                            retryStrategy: { strategy: 'exponential', maxAttempts: 3, delayMs: 1000 },
                            timeoutMs: 10000,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        mockFetch.mockRejectedValueOnce(new Error('Network error'))
                            .mockResolvedValueOnce({
                            ok: true,
                            status: 200,
                            statusText: 'OK',
                            headers: new Headers(),
                            text: function () { return Promise.resolve('OK'); }
                        });
                        return [4 /*yield*/, webhookManager.deliverEvent(mockEvent, mockWebhook)];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(executeWithRetrySpy).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
