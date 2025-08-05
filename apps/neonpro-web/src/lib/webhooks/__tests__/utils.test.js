"use strict";
/**
 * Webhook Utilities Tests
 * Story 7.3: Webhook & Event System Implementation
 *
 * Comprehensive test suite for webhook utility functions:
 * - Event validation and transformation
 * - Webhook signature generation and validation
 * - Rate limiting utilities
 * - Retry logic helpers
 * - Payload formatting and sanitization
 * - Security and validation helpers
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
var vitest_1 = require("vitest");
var utils_1 = require("../utils");
// Mock crypto for consistent results
vitest_1.vi.mock('crypto', function () { return ({
    createHash: vitest_1.vi.fn(function () { return ({
        update: vitest_1.vi.fn().mockReturnThis(),
        digest: vitest_1.vi.fn(function () { return 'test-hash-123'; })
    }); }),
    createHmac: vitest_1.vi.fn(function () { return ({
        update: vitest_1.vi.fn().mockReturnThis(),
        digest: vitest_1.vi.fn(function () { return 'test-signature'; })
    }); }),
    timingSafeEqual: vitest_1.vi.fn(function () { return true; })
}); });
(0, vitest_1.describe)('EventUtils', function () {
    (0, vitest_1.describe)('validateEvent', function () {
        (0, vitest_1.it)('should validate a complete valid event', function () {
            var validEvent = {
                type: 'patient.created',
                source: 'patient-service',
                data: { patientId: '123', name: 'John Doe' },
                metadata: { clinicId: 'clinic-123' },
                priority: 'normal',
                version: '1.0.0'
            };
            var result = utils_1.EventUtils.validateEvent(validEvent);
            (0, vitest_1.expect)(result.isValid).toBe(true);
            (0, vitest_1.expect)(result.errors).toHaveLength(0);
        });
        (0, vitest_1.it)('should reject event without required fields', function () {
            var invalidEvent = {
                type: undefined,
                source: '',
                data: null,
                metadata: {}
            };
            var result = utils_1.EventUtils.validateEvent(invalidEvent);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Event type is required');
            (0, vitest_1.expect)(result.errors).toContain('Event source is required');
            (0, vitest_1.expect)(result.errors).toContain('Event data is required');
            (0, vitest_1.expect)(result.errors).toContain('Clinic ID is required in metadata');
        });
        (0, vitest_1.it)('should reject invalid event type', function () {
            var invalidEvent = {
                type: 'invalid.type',
                source: 'test-service',
                data: { test: 'data' },
                metadata: { clinicId: 'clinic-123' }
            };
            var result = utils_1.EventUtils.validateEvent(invalidEvent);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Invalid event type: invalid.type');
        });
        (0, vitest_1.it)('should reject invalid priority', function () {
            var invalidEvent = {
                type: 'patient.created',
                source: 'test-service',
                data: { test: 'data' },
                metadata: { clinicId: 'clinic-123' },
                priority: 'invalid'
            };
            var result = utils_1.EventUtils.validateEvent(invalidEvent);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Invalid event priority: invalid');
        });
        (0, vitest_1.it)('should reject invalid version format', function () {
            var invalidEvent = {
                type: 'patient.created',
                source: 'test-service',
                data: { test: 'data' },
                metadata: { clinicId: 'clinic-123' },
                version: 'invalid-version'
            };
            var result = utils_1.EventUtils.validateEvent(invalidEvent);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Event version must follow semantic versioning (e.g., 1.0.0)');
        });
    });
    (0, vitest_1.describe)('sanitizeEventForWebhook', function () {
        (0, vitest_1.it)('should sanitize event data for webhook delivery', function () {
            var event = {
                id: 'event-123',
                type: 'patient.created',
                source: 'patient-service',
                data: {
                    patientId: '123',
                    name: 'John Doe',
                    password: 'secret123',
                    creditCard: '1234-5678-9012-3456'
                },
                metadata: {
                    clinicId: 'clinic-123',
                    internalId: 'internal-123',
                    debugInfo: 'debug-data'
                },
                priority: 'normal',
                version: '1.0.0',
                timestamp: new Date('2024-01-01T00:00:00Z'),
                fingerprint: 'fp-123',
                context: { userId: 'user-123' }
            };
            var webhook = {
                id: 'webhook-123',
                name: 'Test Webhook',
                url: 'https://api.example.com/webhook',
                clinicId: 'clinic-123',
                eventTypes: ['patient.created'],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            var sanitized = utils_1.EventUtils.sanitizeEventForWebhook(event, webhook);
            (0, vitest_1.expect)(sanitized.data.password).toBe('[REDACTED]');
            (0, vitest_1.expect)(sanitized.data.creditCard).toBe('[REDACTED]');
            (0, vitest_1.expect)(sanitized.data.name).toBe('John Doe');
            (0, vitest_1.expect)(sanitized.metadata.internalId).toBeUndefined();
            (0, vitest_1.expect)(sanitized.metadata.debugInfo).toBeUndefined();
            (0, vitest_1.expect)(sanitized.metadata.clinicId).toBe('clinic-123');
            (0, vitest_1.expect)(sanitized.timestamp).toBe('2024-01-01T00:00:00.000Z');
        });
    });
    (0, vitest_1.describe)('generateEventFingerprint', function () {
        (0, vitest_1.it)('should generate consistent fingerprints for same event data', function () {
            var eventData = {
                type: 'patient.created',
                source: 'patient-service',
                data: { patientId: '123' },
                metadata: { clinicId: 'clinic-123' },
                priority: 'normal',
                version: '1.0.0',
                context: {}
            };
            var fingerprint1 = utils_1.EventUtils.generateEventFingerprint(eventData);
            var fingerprint2 = utils_1.EventUtils.generateEventFingerprint(eventData);
            (0, vitest_1.expect)(fingerprint1).toBe(fingerprint2);
            (0, vitest_1.expect)(fingerprint1).toBe('test-hash-123');
        });
        (0, vitest_1.it)('should generate different fingerprints for different event data', function () {
            var eventData1 = {
                type: 'patient.created',
                source: 'patient-service',
                data: { patientId: '123' },
                metadata: { clinicId: 'clinic-123' },
                priority: 'normal',
                version: '1.0.0',
                context: {}
            };
            var eventData2 = {
                type: 'patient.created',
                source: 'patient-service',
                data: { patientId: '456' },
                metadata: { clinicId: 'clinic-123' },
                priority: 'normal',
                version: '1.0.0',
                context: {}
            };
            // Mock different hash for different data
            var mockCreateHash = vitest_1.vi.mocked(require('crypto').createHash);
            mockCreateHash.mockReturnValueOnce({
                update: vitest_1.vi.fn().mockReturnThis(),
                digest: vitest_1.vi.fn(function () { return 'hash-1'; })
            }).mockReturnValueOnce({
                update: vitest_1.vi.fn().mockReturnThis(),
                digest: vitest_1.vi.fn(function () { return 'hash-2'; })
            });
            var fingerprint1 = utils_1.EventUtils.generateEventFingerprint(eventData1);
            var fingerprint2 = utils_1.EventUtils.generateEventFingerprint(eventData2);
            (0, vitest_1.expect)(fingerprint1).not.toBe(fingerprint2);
        });
    });
});
(0, vitest_1.describe)('WebhookUtils', function () {
    (0, vitest_1.describe)('generateSignature', function () {
        (0, vitest_1.it)('should generate webhook signature', function () {
            var payload = JSON.stringify({ test: 'data' });
            var secret = 'webhook-secret';
            var signature = utils_1.WebhookUtils.generateSignature(payload, secret);
            (0, vitest_1.expect)(signature).toBe('test-signature');
        });
        (0, vitest_1.it)('should generate different signatures for different payloads', function () {
            var payload1 = JSON.stringify({ test: 'data1' });
            var payload2 = JSON.stringify({ test: 'data2' });
            var secret = 'webhook-secret';
            // Mock different signatures
            var mockCreateHmac = vitest_1.vi.mocked(require('crypto').createHmac);
            mockCreateHmac.mockReturnValueOnce({
                update: vitest_1.vi.fn().mockReturnThis(),
                digest: vitest_1.vi.fn(function () { return 'signature-1'; })
            }).mockReturnValueOnce({
                update: vitest_1.vi.fn().mockReturnThis(),
                digest: vitest_1.vi.fn(function () { return 'signature-2'; })
            });
            var signature1 = utils_1.WebhookUtils.generateSignature(payload1, secret);
            var signature2 = utils_1.WebhookUtils.generateSignature(payload2, secret);
            (0, vitest_1.expect)(signature1).not.toBe(signature2);
        });
    });
    (0, vitest_1.describe)('verifySignature', function () {
        (0, vitest_1.it)('should verify valid signature', function () {
            var payload = JSON.stringify({ test: 'data' });
            var secret = 'webhook-secret';
            var signature = 'test-signature';
            var isValid = utils_1.WebhookUtils.verifySignature(payload, signature, secret);
            (0, vitest_1.expect)(isValid).toBe(true);
        });
        (0, vitest_1.it)('should reject invalid signature', function () {
            var payload = JSON.stringify({ test: 'data' });
            var secret = 'webhook-secret';
            var signature = 'invalid-signature';
            // Mock timingSafeEqual to return false
            var mockTimingSafeEqual = vitest_1.vi.mocked(require('crypto').timingSafeEqual);
            mockTimingSafeEqual.mockReturnValueOnce(false);
            var isValid = utils_1.WebhookUtils.verifySignature(payload, signature, secret);
            (0, vitest_1.expect)(isValid).toBe(false);
        });
        (0, vitest_1.it)('should handle signature verification errors', function () {
            var payload = JSON.stringify({ test: 'data' });
            var secret = 'webhook-secret';
            var signature = 'malformed-signature';
            // Mock error in verification
            var mockTimingSafeEqual = vitest_1.vi.mocked(require('crypto').timingSafeEqual);
            mockTimingSafeEqual.mockImplementationOnce(function () {
                throw new Error('Invalid signature format');
            });
            var isValid = utils_1.WebhookUtils.verifySignature(payload, signature, secret);
            (0, vitest_1.expect)(isValid).toBe(false);
        });
    });
    (0, vitest_1.describe)('validateWebhookUrl', function () {
        (0, vitest_1.it)('should validate HTTPS URLs in production', function () {
            var originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            var result = utils_1.WebhookUtils.validateWebhookUrl('https://api.example.com/webhook');
            (0, vitest_1.expect)(result.isValid).toBe(true);
            (0, vitest_1.expect)(result.errors).toHaveLength(0);
            process.env.NODE_ENV = originalEnv;
        });
        (0, vitest_1.it)('should reject HTTP URLs in production', function () {
            var originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            var result = utils_1.WebhookUtils.validateWebhookUrl('http://api.example.com/webhook');
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Webhook URL must use HTTPS in production');
            process.env.NODE_ENV = originalEnv;
        });
        (0, vitest_1.it)('should reject localhost URLs in production', function () {
            var originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            var result = utils_1.WebhookUtils.validateWebhookUrl('https://localhost:3000/webhook');
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Webhook URL cannot point to private/local addresses in production');
            process.env.NODE_ENV = originalEnv;
        });
        (0, vitest_1.it)('should reject private IP addresses in production', function () {
            var originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            var privateIPs = [
                'https://192.168.1.1/webhook',
                'https://10.0.0.1/webhook',
                'https://172.16.0.1/webhook'
            ];
            privateIPs.forEach(function (url) {
                var result = utils_1.WebhookUtils.validateWebhookUrl(url);
                (0, vitest_1.expect)(result.isValid).toBe(false);
                (0, vitest_1.expect)(result.errors).toContain('Webhook URL cannot point to private/local addresses in production');
            });
            process.env.NODE_ENV = originalEnv;
        });
        (0, vitest_1.it)('should reject invalid URL format', function () {
            var result = utils_1.WebhookUtils.validateWebhookUrl('not-a-valid-url');
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Invalid URL format');
        });
        (0, vitest_1.it)('should allow HTTP URLs in development', function () {
            var originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';
            var result = utils_1.WebhookUtils.validateWebhookUrl('http://localhost:3000/webhook');
            (0, vitest_1.expect)(result.isValid).toBe(true);
            (0, vitest_1.expect)(result.errors).toHaveLength(0);
            process.env.NODE_ENV = originalEnv;
        });
    });
    (0, vitest_1.describe)('generateWebhookHeaders', function () {
        (0, vitest_1.it)('should generate proper webhook headers', function () {
            var event = {
                id: 'event-123',
                type: 'patient.created',
                source: 'patient-service',
                data: { patientId: '123' },
                metadata: { clinicId: 'clinic-123' },
                priority: 'normal',
                version: '1.0.0',
                timestamp: new Date('2024-01-01T00:00:00Z'),
                fingerprint: 'fp-123',
                context: {}
            };
            var webhook = {
                id: 'webhook-123',
                name: 'Test Webhook',
                url: 'https://api.example.com/webhook',
                clinicId: 'clinic-123',
                eventTypes: ['patient.created'],
                isActive: true,
                secret: 'webhook-secret',
                headers: { 'Custom-Header': 'custom-value' },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            var payload = JSON.stringify({ test: 'data' });
            var headers = utils_1.WebhookUtils.generateWebhookHeaders(event, webhook, payload);
            (0, vitest_1.expect)(headers).toMatchObject({
                'Content-Type': 'application/json',
                'User-Agent': 'NeonPro-Webhook/1.0',
                'X-Event-Type': 'patient.created',
                'X-Event-ID': 'event-123',
                'X-Event-Timestamp': '2024-01-01T00:00:00.000Z',
                'X-Webhook-ID': 'webhook-123',
                'X-Webhook-Name': 'Test Webhook',
                'X-Delivery-Attempt': '1',
                'Custom-Header': 'custom-value',
                'X-Webhook-Signature': 'sha256=test-signature'
            });
        });
        (0, vitest_1.it)('should not include signature when disabled', function () {
            var event = {
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
            var webhook = {
                id: 'webhook-123',
                name: 'Test Webhook',
                url: 'https://api.example.com/webhook',
                clinicId: 'clinic-123',
                eventTypes: ['patient.created'],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            var payload = JSON.stringify({ test: 'data' });
            var headers = utils_1.WebhookUtils.generateWebhookHeaders(event, webhook, payload, false);
            (0, vitest_1.expect)(headers['X-Webhook-Signature']).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('parseSignatureHeader', function () {
        (0, vitest_1.it)('should parse valid signature header', function () {
            var signatureHeader = 'sha256=abc123def456';
            var result = utils_1.WebhookUtils.parseSignatureHeader(signatureHeader);
            (0, vitest_1.expect)(result).toEqual({
                algorithm: 'sha256',
                signature: 'abc123def456'
            });
        });
        (0, vitest_1.it)('should return null for invalid signature header', function () {
            var invalidHeaders = [
                'invalid-format',
                'sha256',
                'sha256=',
                '=signature-only'
            ];
            invalidHeaders.forEach(function (header) {
                var result = utils_1.WebhookUtils.parseSignatureHeader(header);
                (0, vitest_1.expect)(result).toBeNull();
            });
        });
    });
});
(0, vitest_1.describe)('RateLimitUtils', function () {
    (0, vitest_1.beforeEach)(function () {
        // Clear rate limiters before each test
        utils_1.RateLimitUtils.resetRateLimit('test-identifier');
    });
    (0, vitest_1.describe)('checkRateLimit', function () {
        (0, vitest_1.it)('should allow requests within rate limit', function () {
            var result = utils_1.RateLimitUtils.checkRateLimit('test-id', 10, 60000); // 10 requests per minute
            (0, vitest_1.expect)(result.allowed).toBe(true);
            (0, vitest_1.expect)(result.remaining).toBe(9);
            (0, vitest_1.expect)(result.resetTime).toBeGreaterThan(Date.now());
        });
        (0, vitest_1.it)('should deny requests exceeding rate limit', function () {
            var identifier = 'test-id-2';
            var maxRequests = 2;
            var windowMs = 60000;
            // Make requests up to the limit
            for (var i = 0; i < maxRequests; i++) {
                var result_1 = utils_1.RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs);
                (0, vitest_1.expect)(result_1.allowed).toBe(true);
            }
            // Next request should be denied
            var result = utils_1.RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs);
            (0, vitest_1.expect)(result.allowed).toBe(false);
            (0, vitest_1.expect)(result.remaining).toBe(0);
        });
        (0, vitest_1.it)('should reset rate limit after time window', function () {
            var identifier = 'test-id-3';
            var maxRequests = 1;
            var windowMs = 100; // Short window for testing
            // Use up the rate limit
            var result1 = utils_1.RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs);
            (0, vitest_1.expect)(result1.allowed).toBe(true);
            var result2 = utils_1.RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs);
            (0, vitest_1.expect)(result2.allowed).toBe(false);
            // Wait for window to reset
            return new Promise(function (resolve) {
                setTimeout(function () {
                    var result3 = utils_1.RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs);
                    (0, vitest_1.expect)(result3.allowed).toBe(true);
                    resolve(undefined);
                }, windowMs + 10);
            });
        });
        (0, vitest_1.it)('should handle burst limits', function () {
            var identifier = 'test-id-4';
            var maxRequests = 10;
            var windowMs = 60000;
            var burstLimit = 5;
            // Should allow up to burst limit initially
            for (var i = 0; i < burstLimit; i++) {
                var result_2 = utils_1.RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs, burstLimit);
                (0, vitest_1.expect)(result_2.allowed).toBe(true);
            }
            // Next request should be denied (burst limit exceeded)
            var result = utils_1.RateLimitUtils.checkRateLimit(identifier, maxRequests, windowMs, burstLimit);
            (0, vitest_1.expect)(result.allowed).toBe(false);
        });
    });
    (0, vitest_1.describe)('getRateLimitStatus', function () {
        (0, vitest_1.it)('should return rate limit status for existing identifier', function () {
            var identifier = 'test-id-5';
            // Make a request to initialize rate limiter
            utils_1.RateLimitUtils.checkRateLimit(identifier, 10, 60000);
            var status = utils_1.RateLimitUtils.getRateLimitStatus(identifier);
            (0, vitest_1.expect)(status).toMatchObject({
                requests: 1,
                remaining: 9,
                resetTime: vitest_1.expect.any(Number)
            });
        });
        (0, vitest_1.it)('should return null for non-existent identifier', function () {
            var status = utils_1.RateLimitUtils.getRateLimitStatus('non-existent');
            (0, vitest_1.expect)(status).toBeNull();
        });
    });
});
(0, vitest_1.describe)('RetryUtils', function () {
    (0, vitest_1.describe)('calculateRetryDelay', function () {
        (0, vitest_1.it)('should calculate exponential backoff delay', function () {
            var strategy = {
                strategy: 'exponential',
                maxAttempts: 3,
                delayMs: 1000
            };
            var delay1 = utils_1.RetryUtils.calculateRetryDelay(1, strategy);
            var delay2 = utils_1.RetryUtils.calculateRetryDelay(2, strategy);
            var delay3 = utils_1.RetryUtils.calculateRetryDelay(3, strategy);
            (0, vitest_1.expect)(delay1).toBeGreaterThanOrEqual(1000); // Base delay + jitter
            (0, vitest_1.expect)(delay2).toBeGreaterThanOrEqual(2000); // 2x base delay + jitter
            (0, vitest_1.expect)(delay3).toBeGreaterThanOrEqual(4000); // 4x base delay + jitter
        });
        (0, vitest_1.it)('should calculate linear backoff delay', function () {
            var strategy = {
                strategy: 'linear',
                maxAttempts: 3,
                delayMs: 1000
            };
            var delay1 = utils_1.RetryUtils.calculateRetryDelay(1, strategy);
            var delay2 = utils_1.RetryUtils.calculateRetryDelay(2, strategy);
            var delay3 = utils_1.RetryUtils.calculateRetryDelay(3, strategy);
            (0, vitest_1.expect)(delay1).toBeGreaterThanOrEqual(1000); // 1x base delay + jitter
            (0, vitest_1.expect)(delay2).toBeGreaterThanOrEqual(2000); // 2x base delay + jitter
            (0, vitest_1.expect)(delay3).toBeGreaterThanOrEqual(3000); // 3x base delay + jitter
        });
        (0, vitest_1.it)('should calculate fixed delay', function () {
            var strategy = {
                strategy: 'fixed',
                maxAttempts: 3,
                delayMs: 1000
            };
            var delay1 = utils_1.RetryUtils.calculateRetryDelay(1, strategy);
            var delay2 = utils_1.RetryUtils.calculateRetryDelay(2, strategy);
            var delay3 = utils_1.RetryUtils.calculateRetryDelay(3, strategy);
            // All delays should be around the base delay (with jitter)
            (0, vitest_1.expect)(delay1).toBeGreaterThanOrEqual(1000);
            (0, vitest_1.expect)(delay1).toBeLessThan(1200); // Base + 10% jitter
            (0, vitest_1.expect)(delay2).toBeGreaterThanOrEqual(1000);
            (0, vitest_1.expect)(delay2).toBeLessThan(1200);
            (0, vitest_1.expect)(delay3).toBeGreaterThanOrEqual(1000);
            (0, vitest_1.expect)(delay3).toBeLessThan(1200);
        });
        (0, vitest_1.it)('should respect maximum delay limit', function () {
            var strategy = {
                strategy: 'exponential',
                maxAttempts: 10,
                delayMs: 60000 // 1 minute
            };
            var delay = utils_1.RetryUtils.calculateRetryDelay(10, strategy);
            // Should not exceed 5 minutes (300000ms)
            (0, vitest_1.expect)(delay).toBeLessThanOrEqual(300000);
        });
    });
    (0, vitest_1.describe)('isRetryableError', function () {
        (0, vitest_1.it)('should identify retryable network errors', function () {
            var networkErrors = [
                { code: 'ECONNRESET' },
                { code: 'ENOTFOUND' },
                { code: 'ETIMEDOUT' }
            ];
            networkErrors.forEach(function (error) {
                (0, vitest_1.expect)(utils_1.RetryUtils.isRetryableError(error)).toBe(true);
            });
        });
        (0, vitest_1.it)('should identify retryable HTTP status codes', function () {
            var retryableStatuses = [408, 429, 500, 502, 503, 504];
            retryableStatuses.forEach(function (status) {
                (0, vitest_1.expect)(utils_1.RetryUtils.isRetryableError({}, status)).toBe(true);
            });
        });
        (0, vitest_1.it)('should identify non-retryable HTTP status codes', function () {
            var nonRetryableStatuses = [400, 401, 403, 404, 422];
            nonRetryableStatuses.forEach(function (status) {
                (0, vitest_1.expect)(utils_1.RetryUtils.isRetryableError({}, status)).toBe(false);
            });
        });
        (0, vitest_1.it)('should identify timeout errors', function () {
            var timeoutErrors = [
                { name: 'AbortError' },
                { message: 'Request timeout occurred' },
                { message: 'Connection timeout' }
            ];
            timeoutErrors.forEach(function (error) {
                (0, vitest_1.expect)(utils_1.RetryUtils.isRetryableError(error)).toBe(true);
            });
        });
        (0, vitest_1.it)('should not retry non-retryable errors', function () {
            var nonRetryableErrors = [
                { code: 'EACCES' },
                { name: 'ValidationError' },
                { message: 'Invalid input' }
            ];
            nonRetryableErrors.forEach(function (error) {
                (0, vitest_1.expect)(utils_1.RetryUtils.isRetryableError(error)).toBe(false);
            });
        });
    });
    (0, vitest_1.describe)('executeWithRetry', function () {
        (0, vitest_1.it)('should succeed on first attempt', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFn, strategy, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFn = vitest_1.vi.fn().mockResolvedValue('success');
                        strategy = {
                            strategy: 'fixed',
                            maxAttempts: 3,
                            delayMs: 100
                        };
                        return [4 /*yield*/, utils_1.RetryUtils.executeWithRetry(mockFn, 3, strategy)];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result).toBe('success');
                        (0, vitest_1.expect)(mockFn).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should retry on retryable errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFn, strategy, onRetry, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFn = vitest_1.vi.fn()
                            .mockRejectedValueOnce(new Error('ECONNRESET'))
                            .mockRejectedValueOnce(new Error('ETIMEDOUT'))
                            .mockResolvedValueOnce('success');
                        strategy = {
                            strategy: 'fixed',
                            maxAttempts: 3,
                            delayMs: 10 // Short delay for testing
                        };
                        onRetry = vitest_1.vi.fn();
                        return [4 /*yield*/, utils_1.RetryUtils.executeWithRetry(mockFn, 3, strategy, onRetry)];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result).toBe('success');
                        (0, vitest_1.expect)(mockFn).toHaveBeenCalledTimes(3);
                        (0, vitest_1.expect)(onRetry).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should fail after max attempts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFn, strategy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFn = vitest_1.vi.fn().mockRejectedValue(new Error('ECONNRESET'));
                        strategy = {
                            strategy: 'fixed',
                            maxAttempts: 2,
                            delayMs: 10
                        };
                        return [4 /*yield*/, (0, vitest_1.expect)(utils_1.RetryUtils.executeWithRetry(mockFn, 2, strategy))
                                .rejects.toThrow('ECONNRESET')];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockFn).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should not retry non-retryable errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFn, strategy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFn = vitest_1.vi.fn().mockRejectedValue(new Error('ValidationError'));
                        strategy = {
                            strategy: 'fixed',
                            maxAttempts: 3,
                            delayMs: 10
                        };
                        return [4 /*yield*/, (0, vitest_1.expect)(utils_1.RetryUtils.executeWithRetry(mockFn, 3, strategy))
                                .rejects.toThrow('ValidationError')];
                    case 1:
                        _a.sent();
                        (0, vitest_1.expect)(mockFn).toHaveBeenCalledTimes(1); // No retries
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
(0, vitest_1.describe)('ValidationUtils', function () {
    (0, vitest_1.describe)('validateJsonPayload', function () {
        (0, vitest_1.it)('should validate valid JSON', function () {
            var validJson = JSON.stringify({ test: 'data', number: 123 });
            var result = utils_1.ValidationUtils.validateJsonPayload(validJson);
            (0, vitest_1.expect)(result.isValid).toBe(true);
            (0, vitest_1.expect)(result.data).toEqual({ test: 'data', number: 123 });
            (0, vitest_1.expect)(result.error).toBeUndefined();
        });
        (0, vitest_1.it)('should reject invalid JSON', function () {
            var invalidJson = '{ invalid json }';
            var result = utils_1.ValidationUtils.validateJsonPayload(invalidJson);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.data).toBeUndefined();
            (0, vitest_1.expect)(result.error).toContain('Invalid JSON');
        });
    });
    (0, vitest_1.describe)('validateWebhookConfig', function () {
        (0, vitest_1.it)('should validate complete webhook configuration', function () {
            var validConfig = {
                name: 'Test Webhook',
                url: 'https://api.example.com/webhook',
                clinicId: 'clinic-123',
                eventTypes: ['patient.created'],
                timeoutMs: 15000,
                retryStrategy: {
                    strategy: 'exponential',
                    maxAttempts: 3,
                    delayMs: 1000
                },
                rateLimit: {
                    requestsPerMinute: 60
                }
            };
            var result = utils_1.ValidationUtils.validateWebhookConfig(validConfig);
            (0, vitest_1.expect)(result.isValid).toBe(true);
            (0, vitest_1.expect)(result.errors).toHaveLength(0);
        });
        (0, vitest_1.it)('should reject webhook with missing required fields', function () {
            var invalidConfig = {
                name: '',
                url: '',
                clinicId: '',
                eventTypes: []
            };
            var result = utils_1.ValidationUtils.validateWebhookConfig(invalidConfig);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Webhook name is required');
            (0, vitest_1.expect)(result.errors).toContain('Webhook URL is required');
            (0, vitest_1.expect)(result.errors).toContain('Clinic ID is required');
            (0, vitest_1.expect)(result.errors).toContain('At least one event type must be specified');
        });
        (0, vitest_1.it)('should validate timeout constraints', function () {
            var configWithInvalidTimeout = {
                name: 'Test Webhook',
                url: 'https://api.example.com/webhook',
                clinicId: 'clinic-123',
                eventTypes: ['patient.created'],
                timeoutMs: 500 // Too low
            };
            var result = utils_1.ValidationUtils.validateWebhookConfig(configWithInvalidTimeout);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Timeout must be between 1000ms and 30000ms');
        });
        (0, vitest_1.it)('should validate retry strategy constraints', function () {
            var configWithInvalidRetry = {
                name: 'Test Webhook',
                url: 'https://api.example.com/webhook',
                clinicId: 'clinic-123',
                eventTypes: ['patient.created'],
                retryStrategy: {
                    strategy: 'exponential',
                    maxAttempts: 15, // Too high
                    delayMs: 500000 // Too high
                }
            };
            var result = utils_1.ValidationUtils.validateWebhookConfig(configWithInvalidRetry);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Max retry attempts must be between 1 and 10');
            (0, vitest_1.expect)(result.errors).toContain('Retry delay must be between 1000ms and 300000ms');
        });
        (0, vitest_1.it)('should validate rate limit constraints', function () {
            var configWithInvalidRateLimit = {
                name: 'Test Webhook',
                url: 'https://api.example.com/webhook',
                clinicId: 'clinic-123',
                eventTypes: ['patient.created'],
                rateLimit: {
                    requestsPerMinute: 2000 // Too high
                }
            };
            var result = utils_1.ValidationUtils.validateWebhookConfig(configWithInvalidRateLimit);
            (0, vitest_1.expect)(result.isValid).toBe(false);
            (0, vitest_1.expect)(result.errors).toContain('Rate limit must be between 1 and 1000 requests per minute');
        });
    });
    (0, vitest_1.describe)('sanitizeWebhookName', function () {
        (0, vitest_1.it)('should sanitize webhook name', function () {
            var dirtyName = '  Test@Webhook#Name!  ';
            var sanitized = utils_1.ValidationUtils.sanitizeWebhookName(dirtyName);
            (0, vitest_1.expect)(sanitized).toBe('TestWebhookName');
        });
        (0, vitest_1.it)('should limit name length', function () {
            var longName = 'A'.repeat(150);
            var sanitized = utils_1.ValidationUtils.sanitizeWebhookName(longName);
            (0, vitest_1.expect)(sanitized.length).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('should normalize whitespace', function () {
            var nameWithSpaces = 'Test   Webhook    Name';
            var sanitized = utils_1.ValidationUtils.sanitizeWebhookName(nameWithSpaces);
            (0, vitest_1.expect)(sanitized).toBe('Test Webhook Name');
        });
    });
});
(0, vitest_1.describe)('MonitoringUtils', function () {
    (0, vitest_1.describe)('calculateSuccessRate', function () {
        (0, vitest_1.it)('should calculate success rate correctly', function () {
            (0, vitest_1.expect)(utils_1.MonitoringUtils.calculateSuccessRate(80, 100)).toBe(80);
            (0, vitest_1.expect)(utils_1.MonitoringUtils.calculateSuccessRate(0, 100)).toBe(0);
            (0, vitest_1.expect)(utils_1.MonitoringUtils.calculateSuccessRate(100, 100)).toBe(100);
        });
        (0, vitest_1.it)('should handle zero total deliveries', function () {
            (0, vitest_1.expect)(utils_1.MonitoringUtils.calculateSuccessRate(0, 0)).toBe(0);
        });
        (0, vitest_1.it)('should round to 2 decimal places', function () {
            (0, vitest_1.expect)(utils_1.MonitoringUtils.calculateSuccessRate(33, 100)).toBe(33);
            (0, vitest_1.expect)(utils_1.MonitoringUtils.calculateSuccessRate(1, 3)).toBe(33.33);
        });
    });
    (0, vitest_1.describe)('calculateAverageResponseTime', function () {
        (0, vitest_1.it)('should calculate average response time', function () {
            var responseTimes = [100, 200, 300, 400, 500];
            var average = utils_1.MonitoringUtils.calculateAverageResponseTime(responseTimes);
            (0, vitest_1.expect)(average).toBe(300);
        });
        (0, vitest_1.it)('should handle empty array', function () {
            var average = utils_1.MonitoringUtils.calculateAverageResponseTime([]);
            (0, vitest_1.expect)(average).toBe(0);
        });
        (0, vitest_1.it)('should round to nearest integer', function () {
            var responseTimes = [100, 150, 200];
            var average = utils_1.MonitoringUtils.calculateAverageResponseTime(responseTimes);
            (0, vitest_1.expect)(average).toBe(150);
        });
    });
    (0, vitest_1.describe)('calculatePercentileResponseTime', function () {
        (0, vitest_1.it)('should calculate 95th percentile', function () {
            var responseTimes = Array.from({ length: 100 }, function (_, i) { return i + 1; }); // 1-100
            var p95 = utils_1.MonitoringUtils.calculatePercentileResponseTime(responseTimes, 95);
            (0, vitest_1.expect)(p95).toBe(95);
        });
        (0, vitest_1.it)('should calculate 99th percentile', function () {
            var responseTimes = Array.from({ length: 100 }, function (_, i) { return i + 1; }); // 1-100
            var p99 = utils_1.MonitoringUtils.calculatePercentileResponseTime(responseTimes, 99);
            (0, vitest_1.expect)(p99).toBe(99);
        });
        (0, vitest_1.it)('should handle empty array', function () {
            var percentile = utils_1.MonitoringUtils.calculatePercentileResponseTime([], 95);
            (0, vitest_1.expect)(percentile).toBe(0);
        });
        (0, vitest_1.it)('should handle single value', function () {
            var percentile = utils_1.MonitoringUtils.calculatePercentileResponseTime([100], 95);
            (0, vitest_1.expect)(percentile).toBe(100);
        });
    });
    (0, vitest_1.describe)('generatePerformanceMetrics', function () {
        (0, vitest_1.it)('should generate comprehensive performance metrics', function () {
            var deliveries = [
                { status: 'delivered', responseTimeMs: 100, createdAt: new Date() },
                { status: 'delivered', responseTimeMs: 200, createdAt: new Date() },
                { status: 'delivered', responseTimeMs: 300, createdAt: new Date() },
                { status: 'failed', responseTimeMs: undefined, createdAt: new Date() },
                { status: 'delivered', responseTimeMs: 400, createdAt: new Date() }
            ];
            var metrics = utils_1.MonitoringUtils.generatePerformanceMetrics(deliveries);
            (0, vitest_1.expect)(metrics).toEqual({
                totalDeliveries: 5,
                successfulDeliveries: 4,
                failedDeliveries: 1,
                successRate: 80,
                averageResponseTime: 250, // (100+200+300+400)/4
                p95ResponseTime: 400,
                p99ResponseTime: 400
            });
        });
        (0, vitest_1.it)('should handle empty deliveries array', function () {
            var metrics = utils_1.MonitoringUtils.generatePerformanceMetrics([]);
            (0, vitest_1.expect)(metrics).toEqual({
                totalDeliveries: 0,
                successfulDeliveries: 0,
                failedDeliveries: 0,
                successRate: 0,
                averageResponseTime: 0,
                p95ResponseTime: 0,
                p99ResponseTime: 0
            });
        });
        (0, vitest_1.it)('should handle deliveries without response times', function () {
            var deliveries = [
                { status: 'delivered', createdAt: new Date() },
                { status: 'failed', createdAt: new Date() }
            ];
            var metrics = utils_1.MonitoringUtils.generatePerformanceMetrics(deliveries);
            (0, vitest_1.expect)(metrics.totalDeliveries).toBe(2);
            (0, vitest_1.expect)(metrics.successfulDeliveries).toBe(1);
            (0, vitest_1.expect)(metrics.failedDeliveries).toBe(1);
            (0, vitest_1.expect)(metrics.averageResponseTime).toBe(0);
        });
    });
});
