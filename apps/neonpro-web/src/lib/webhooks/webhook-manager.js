"use strict";
/**
 * Webhook Manager
 * Story 7.3: Webhook & Event System Implementation
 *
 * This module provides webhook management functionality:
 * - Webhook endpoint registration and management
 * - Event delivery to webhooks
 * - Retry mechanisms and failure handling
 * - Webhook validation and security
 * - Delivery tracking and analytics
 * - Rate limiting and throttling
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
exports.WebhookManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var crypto_1 = require("crypto");
var WebhookManager = /** @class */ (function () {
    function WebhookManager(config) {
        this.webhookEndpoints = new Map();
        this.deliveryQueue = [];
        this.activeDeliveries = new Set();
        this.rateLimiters = new Map();
        this.config = config;
        this.supabase = (0, supabase_js_1.createClient)(config.supabaseUrl, config.supabaseKey);
    }
    /**
     * Initialize the webhook manager
     */
    WebhookManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Initializing Webhook Manager...');
                        // Load existing webhook endpoints
                        return [4 /*yield*/, this.loadWebhookEndpoints()
                            // Start delivery processing
                        ];
                    case 1:
                        // Load existing webhook endpoints
                        _a.sent();
                        // Start delivery processing
                        this.startDeliveryProcessing();
                        console.log('✅ Webhook Manager initialized successfully');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ Failed to initialize webhook manager:', error_1);
                        throw new Error('Webhook manager initialization failed');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register a new webhook endpoint
     */
    WebhookManager.prototype.registerWebhook = function (webhookData) {
        return __awaiter(this, void 0, void 0, function () {
            var webhook, validation, testResult, error, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        webhook = __assign({ id: this.generateWebhookId(), createdAt: new Date(), updatedAt: new Date() }, webhookData);
                        console.log("Registering webhook: ".concat(webhook.name, " (").concat(webhook.url, ")"));
                        return [4 /*yield*/, this.validateWebhook(webhook)];
                    case 1:
                        validation = _a.sent();
                        if (!validation.isValid) {
                            throw new Error("Webhook validation failed: ".concat(validation.errors.join(', ')));
                        }
                        if (!webhook.testOnRegistration) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.testWebhookEndpoint(webhook)];
                    case 2:
                        testResult = _a.sent();
                        if (!testResult.success) {
                            throw new Error("Webhook test failed: ".concat(testResult.error));
                        }
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.supabase
                            .from('webhook_endpoints')
                            .insert({
                            id: webhook.id,
                            name: webhook.name,
                            url: webhook.url,
                            clinic_id: webhook.clinicId,
                            event_types: webhook.eventTypes,
                            is_active: webhook.isActive,
                            secret: webhook.secret,
                            headers: webhook.headers,
                            timeout_ms: webhook.timeoutMs,
                            retry_strategy: webhook.retryStrategy,
                            rate_limit: webhook.rateLimit,
                            filters: webhook.filters,
                            test_on_registration: webhook.testOnRegistration,
                            created_at: webhook.createdAt.toISOString(),
                            updated_at: webhook.updatedAt.toISOString()
                        })];
                    case 4:
                        error = (_a.sent()).error;
                        if (error) {
                            throw error;
                        }
                        // Add to local cache
                        this.webhookEndpoints.set(webhook.id, webhook);
                        console.log("\u2705 Webhook ".concat(webhook.id, " registered successfully"));
                        return [2 /*return*/, webhook.id];
                    case 5:
                        error_2 = _a.sent();
                        console.error('❌ Failed to register webhook:', error_2);
                        throw new Error("Webhook registration failed: ".concat(error_2.message));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing webhook endpoint
     */
    WebhookManager.prototype.updateWebhook = function (webhookId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existingWebhook, updatedWebhook, validation, error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        existingWebhook = this.webhookEndpoints.get(webhookId);
                        if (!existingWebhook) {
                            throw new Error("Webhook ".concat(webhookId, " not found"));
                        }
                        updatedWebhook = __assign(__assign(__assign({}, existingWebhook), updates), { id: webhookId, updatedAt: new Date() });
                        console.log("Updating webhook: ".concat(webhookId));
                        return [4 /*yield*/, this.validateWebhook(updatedWebhook)];
                    case 1:
                        validation = _a.sent();
                        if (!validation.isValid) {
                            throw new Error("Webhook validation failed: ".concat(validation.errors.join(', ')));
                        }
                        return [4 /*yield*/, this.supabase
                                .from('webhook_endpoints')
                                .update({
                                name: updatedWebhook.name,
                                url: updatedWebhook.url,
                                event_types: updatedWebhook.eventTypes,
                                is_active: updatedWebhook.isActive,
                                secret: updatedWebhook.secret,
                                headers: updatedWebhook.headers,
                                timeout_ms: updatedWebhook.timeoutMs,
                                retry_strategy: updatedWebhook.retryStrategy,
                                rate_limit: updatedWebhook.rateLimit,
                                filters: updatedWebhook.filters,
                                test_on_registration: updatedWebhook.testOnRegistration,
                                updated_at: updatedWebhook.updatedAt.toISOString()
                            })
                                .eq('id', webhookId)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            throw error;
                        }
                        // Update local cache
                        this.webhookEndpoints.set(webhookId, updatedWebhook);
                        console.log("\u2705 Webhook ".concat(webhookId, " updated successfully"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error('❌ Failed to update webhook:', error_3);
                        throw new Error("Webhook update failed: ".concat(error_3.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a webhook endpoint
     */
    WebhookManager.prototype.deleteWebhook = function (webhookId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Deleting webhook: ".concat(webhookId));
                        return [4 /*yield*/, this.supabase
                                .from('webhook_endpoints')
                                .delete()
                                .eq('id', webhookId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw error;
                        }
                        // Remove from local cache
                        this.webhookEndpoints.delete(webhookId);
                        console.log("\u2705 Webhook ".concat(webhookId, " deleted successfully"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('❌ Failed to delete webhook:', error_4);
                        throw new Error("Webhook deletion failed: ".concat(error_4.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get webhook endpoint by ID
     */
    WebhookManager.prototype.getWebhook = function (webhookId) {
        return this.webhookEndpoints.get(webhookId) || null;
    };
    /**
     * Get all webhook endpoints for a clinic
     */
    WebhookManager.prototype.getWebhooksByClinic = function (clinicId) {
        return Array.from(this.webhookEndpoints.values())
            .filter(function (webhook) { return webhook.clinicId === clinicId; });
    };
    /**
     * Get active webhooks for specific event types
     */
    WebhookManager.prototype.getActiveWebhooksForEvent = function (eventType, clinicId) {
        return Array.from(this.webhookEndpoints.values())
            .filter(function (webhook) {
            return webhook.isActive &&
                webhook.clinicId === clinicId &&
                webhook.eventTypes.includes(eventType);
        });
    };
    /**
     * Deliver event to webhooks
     */
    WebhookManager.prototype.deliverEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var clinicId, matchingWebhooks, deliveryIds, _i, matchingWebhooks_1, webhook, delivery, error_5;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        console.log("Delivering event ".concat(event.id, " (").concat(event.type, ")"));
                        clinicId = (_a = event.metadata) === null || _a === void 0 ? void 0 : _a.clinicId;
                        if (!clinicId) {
                            throw new Error('Event must have clinicId in metadata');
                        }
                        matchingWebhooks = this.getActiveWebhooksForEvent(event.type, clinicId);
                        if (matchingWebhooks.length === 0) {
                            console.log("No active webhooks found for event ".concat(event.type, " in clinic ").concat(clinicId));
                            return [2 /*return*/, []];
                        }
                        deliveryIds = [];
                        _i = 0, matchingWebhooks_1 = matchingWebhooks;
                        _c.label = 1;
                    case 1:
                        if (!(_i < matchingWebhooks_1.length)) return [3 /*break*/, 4];
                        webhook = matchingWebhooks_1[_i];
                        // Apply webhook filters
                        if (!this.eventMatchesWebhookFilters(event, webhook)) {
                            console.log("Event ".concat(event.id, " filtered out for webhook ").concat(webhook.id));
                            return [3 /*break*/, 3];
                        }
                        // Check rate limiting
                        if (!this.checkRateLimit(webhook)) {
                            console.log("Rate limit exceeded for webhook ".concat(webhook.id));
                            return [3 /*break*/, 3];
                        }
                        delivery = {
                            id: this.generateDeliveryId(),
                            eventId: event.id,
                            webhookId: webhook.id,
                            url: webhook.url,
                            payload: this.preparePayload(event, webhook),
                            headers: this.prepareHeaders(event, webhook),
                            status: 'pending',
                            attempts: 0,
                            maxAttempts: ((_b = webhook.retryStrategy) === null || _b === void 0 ? void 0 : _b.maxAttempts) || this.config.maxRetries,
                            scheduledAt: new Date(),
                            createdAt: new Date()
                        };
                        // Add to delivery queue
                        this.deliveryQueue.push(delivery);
                        deliveryIds.push(delivery.id);
                        // Store delivery record
                        return [4 /*yield*/, this.storeDeliveryRecord(delivery)];
                    case 2:
                        // Store delivery record
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log("\u2705 Created ".concat(deliveryIds.length, " delivery records for event ").concat(event.id));
                        return [2 /*return*/, deliveryIds];
                    case 5:
                        error_5 = _c.sent();
                        console.error('❌ Failed to deliver event:', error_5);
                        throw new Error("Event delivery failed: ".concat(error_5.message));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test a webhook endpoint
     */
    WebhookManager.prototype.testWebhookEndpoint = function (webhook) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, testPayload, headers, response, responseTime, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startTime = Date.now();
                        testPayload = {
                            type: 'webhook.test',
                            timestamp: new Date().toISOString(),
                            data: {
                                message: 'This is a test webhook delivery',
                                webhookId: webhook.id,
                                clinicId: webhook.clinicId
                            }
                        };
                        headers = __assign({ 'Content-Type': 'application/json', 'User-Agent': 'NeonPro-Webhook/1.0' }, webhook.headers);
                        if (this.config.enableSignatureValidation && webhook.secret) {
                            headers['X-Webhook-Signature'] = this.generateSignature(JSON.stringify(testPayload), webhook.secret);
                        }
                        return [4 /*yield*/, fetch(webhook.url, {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify(testPayload),
                                signal: AbortSignal.timeout(webhook.timeoutMs || this.config.defaultTimeout)
                            })];
                    case 1:
                        response = _a.sent();
                        responseTime = Date.now() - startTime;
                        if (!response.ok) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: "HTTP ".concat(response.status, ": ").concat(response.statusText),
                                    responseTime: responseTime
                                }];
                        }
                        return [2 /*return*/, {
                                success: true,
                                responseTime: responseTime
                            }];
                    case 2:
                        error_6 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_6.message
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get delivery history for a webhook
     */
    WebhookManager.prototype.getDeliveryHistory = function (webhookId_1) {
        return __awaiter(this, arguments, void 0, function (webhookId, limit) {
            var deliveries, error_7;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('event_deliveries')
                                .select('*')
                                .eq('webhook_id', webhookId)
                                .order('created_at', { ascending: false })
                                .limit(limit)];
                    case 1:
                        deliveries = (_a.sent()).data;
                        return [2 /*return*/, (deliveries === null || deliveries === void 0 ? void 0 : deliveries.map(this.convertDbRecordToDelivery)) || []];
                    case 2:
                        error_7 = _a.sent();
                        console.error('❌ Failed to get delivery history:', error_7);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get delivery statistics for a webhook
     */
    WebhookManager.prototype.getDeliveryStats = function (webhookId_1) {
        return __awaiter(this, arguments, void 0, function (webhookId, days) {
            var startDate, deliveries, totalDeliveries, successfulDeliveries, failedDeliveries, responseTimes, averageResponseTime, successRate, error_8;
            if (days === void 0) { days = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.supabase
                                .from('event_deliveries')
                                .select('status, response_time_ms')
                                .eq('webhook_id', webhookId)
                                .gte('created_at', startDate.toISOString())];
                    case 1:
                        deliveries = (_a.sent()).data;
                        if (!deliveries || deliveries.length === 0) {
                            return [2 /*return*/, {
                                    totalDeliveries: 0,
                                    successfulDeliveries: 0,
                                    failedDeliveries: 0,
                                    averageResponseTime: 0,
                                    successRate: 0
                                }];
                        }
                        totalDeliveries = deliveries.length;
                        successfulDeliveries = deliveries.filter(function (d) { return d.status === 'delivered'; }).length;
                        failedDeliveries = deliveries.filter(function (d) { return d.status === 'failed'; }).length;
                        responseTimes = deliveries
                            .filter(function (d) { return d.response_time_ms; })
                            .map(function (d) { return d.response_time_ms; });
                        averageResponseTime = responseTimes.length > 0
                            ? responseTimes.reduce(function (sum, time) { return sum + time; }, 0) / responseTimes.length
                            : 0;
                        successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
                        return [2 /*return*/, {
                                totalDeliveries: totalDeliveries,
                                successfulDeliveries: successfulDeliveries,
                                failedDeliveries: failedDeliveries,
                                averageResponseTime: averageResponseTime,
                                successRate: successRate
                            }];
                    case 2:
                        error_8 = _a.sent();
                        console.error('❌ Failed to get delivery stats:', error_8);
                        return [2 /*return*/, {
                                totalDeliveries: 0,
                                successfulDeliveries: 0,
                                failedDeliveries: 0,
                                averageResponseTime: 0,
                                successRate: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the webhook manager
     */
    WebhookManager.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log('Stopping Webhook Manager...');
                        // Stop delivery processing
                        if (this.processingInterval) {
                            clearInterval(this.processingInterval);
                            this.processingInterval = undefined;
                        }
                        _a.label = 1;
                    case 1:
                        if (!(this.activeDeliveries.size > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        console.log('✅ Webhook Manager stopped successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        console.error('❌ Failed to stop webhook manager:', error_9);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Private Methods
    WebhookManager.prototype.generateWebhookId = function () {
        return "wh_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    WebhookManager.prototype.generateDeliveryId = function () {
        return "del_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    WebhookManager.prototype.validateWebhook = function (webhook) {
        return __awaiter(this, void 0, void 0, function () {
            var errors;
            return __generator(this, function (_a) {
                errors = [];
                // Validate URL
                try {
                    new URL(webhook.url);
                }
                catch (_b) {
                    errors.push('Invalid webhook URL');
                }
                // Validate event types
                if (!webhook.eventTypes || webhook.eventTypes.length === 0) {
                    errors.push('At least one event type must be specified');
                }
                // Validate clinic ID
                if (!webhook.clinicId) {
                    errors.push('Clinic ID is required');
                }
                // Validate timeout
                if (webhook.timeoutMs && (webhook.timeoutMs < 1000 || webhook.timeoutMs > 30000)) {
                    errors.push('Timeout must be between 1000ms and 30000ms');
                }
                // Validate retry strategy
                if (webhook.retryStrategy) {
                    if (webhook.retryStrategy.maxAttempts < 1 || webhook.retryStrategy.maxAttempts > 10) {
                        errors.push('Max retry attempts must be between 1 and 10');
                    }
                    if (webhook.retryStrategy.delayMs < 1000 || webhook.retryStrategy.delayMs > 300000) {
                        errors.push('Retry delay must be between 1000ms and 300000ms');
                    }
                }
                return [2 /*return*/, {
                        isValid: errors.length === 0,
                        errors: errors
                    }];
            });
        });
    };
    WebhookManager.prototype.loadWebhookEndpoints = function () {
        return __awaiter(this, void 0, void 0, function () {
            var webhooks, error_10;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('webhook_endpoints')
                                .select('*')
                                .eq('is_active', true)];
                    case 1:
                        webhooks = (_a.sent()).data;
                        if (webhooks) {
                            webhooks.forEach(function (webhook) {
                                _this.webhookEndpoints.set(webhook.id, _this.convertDbRecordToWebhook(webhook));
                            });
                            console.log("\u2705 Loaded ".concat(webhooks.length, " webhook endpoints"));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('❌ Failed to load webhook endpoints:', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WebhookManager.prototype.eventMatchesWebhookFilters = function (event, webhook) {
        var _this = this;
        if (!webhook.filters || webhook.filters.length === 0) {
            return true;
        }
        // Apply webhook-specific filters
        // This is a simplified implementation - could be expanded
        return webhook.filters.every(function (filter) {
            var fieldValue = _this.getEventFieldValue(event, filter.field);
            return _this.evaluateFilterCondition(fieldValue, filter.operator, filter.value);
        });
    };
    WebhookManager.prototype.getEventFieldValue = function (event, field) {
        var parts = field.split('.');
        var value = event;
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            value = value === null || value === void 0 ? void 0 : value[part];
            if (value === undefined)
                break;
        }
        return value;
    };
    WebhookManager.prototype.evaluateFilterCondition = function (fieldValue, operator, expectedValue) {
        switch (operator) {
            case 'equals':
                return fieldValue === expectedValue;
            case 'not_equals':
                return fieldValue !== expectedValue;
            case 'contains':
                return String(fieldValue).includes(String(expectedValue));
            case 'not_contains':
                return !String(fieldValue).includes(String(expectedValue));
            case 'greater_than':
                return Number(fieldValue) > Number(expectedValue);
            case 'less_than':
                return Number(fieldValue) < Number(expectedValue);
            case 'in':
                return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
            case 'not_in':
                return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
            default:
                return true;
        }
    };
    WebhookManager.prototype.checkRateLimit = function (webhook) {
        if (!this.config.rateLimiting.enabled || !webhook.rateLimit) {
            return true;
        }
        var now = Date.now();
        var rateLimiter = this.rateLimiters.get(webhook.id);
        if (!rateLimiter || now > rateLimiter.resetTime) {
            // Reset rate limiter
            this.rateLimiters.set(webhook.id, {
                requests: 1,
                resetTime: now + 60000 // 1 minute
            });
            return true;
        }
        if (rateLimiter.requests >= webhook.rateLimit.requestsPerMinute) {
            return false;
        }
        rateLimiter.requests++;
        return true;
    };
    WebhookManager.prototype.preparePayload = function (event, webhook) {
        return {
            id: event.id,
            type: event.type,
            timestamp: event.timestamp.toISOString(),
            data: event.data,
            metadata: event.metadata,
            webhook: {
                id: webhook.id,
                name: webhook.name
            }
        };
    };
    WebhookManager.prototype.prepareHeaders = function (event, webhook) {
        var headers = __assign({ 'Content-Type': 'application/json', 'User-Agent': 'NeonPro-Webhook/1.0', 'X-Event-Type': event.type, 'X-Event-ID': event.id, 'X-Webhook-ID': webhook.id }, webhook.headers);
        if (this.config.enableSignatureValidation && webhook.secret) {
            var payload = this.preparePayload(event, webhook);
            headers['X-Webhook-Signature'] = this.generateSignature(JSON.stringify(payload), webhook.secret);
        }
        return headers;
    };
    WebhookManager.prototype.generateSignature = function (payload, secret) {
        return crypto_1.default
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    };
    WebhookManager.prototype.storeDeliveryRecord = function (delivery) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('event_deliveries')
                                .insert({
                                id: delivery.id,
                                event_id: delivery.eventId,
                                webhook_id: delivery.webhookId,
                                url: delivery.url,
                                payload: delivery.payload,
                                headers: delivery.headers,
                                status: delivery.status,
                                attempts: delivery.attempts,
                                max_attempts: delivery.maxAttempts,
                                scheduled_at: delivery.scheduledAt.toISOString(),
                                created_at: delivery.createdAt.toISOString()
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw error;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        console.error('❌ Failed to store delivery record:', error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WebhookManager.prototype.startDeliveryProcessing = function () {
        var _this = this;
        this.processingInterval = setInterval(function () { return _this.processDeliveryQueue(); }, 1000 // Process every second
        );
    };
    WebhookManager.prototype.processDeliveryQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var availableSlots, readyDeliveries;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.deliveryQueue.length === 0) {
                            return [2 /*return*/];
                        }
                        availableSlots = this.config.maxConcurrentDeliveries - this.activeDeliveries.size;
                        if (availableSlots <= 0) {
                            return [2 /*return*/];
                        }
                        readyDeliveries = this.deliveryQueue
                            .filter(function (delivery) {
                            return delivery.status === 'pending' &&
                                delivery.scheduledAt <= new Date() &&
                                !_this.activeDeliveries.has(delivery.id);
                        })
                            .slice(0, availableSlots);
                        // Process deliveries
                        return [4 /*yield*/, Promise.all(readyDeliveries.map(function (delivery) { return _this.processDelivery(delivery); }))];
                    case 1:
                        // Process deliveries
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WebhookManager.prototype.processDelivery = function (delivery) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response, responseTime, _a, error_12;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.activeDeliveries.add(delivery.id);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 7, 9, 11]);
                        delivery.status = 'delivering';
                        delivery.attempts++;
                        delivery.lastAttemptAt = new Date();
                        startTime = Date.now();
                        return [4 /*yield*/, fetch(delivery.url, {
                                method: 'POST',
                                headers: delivery.headers,
                                body: JSON.stringify(delivery.payload),
                                signal: AbortSignal.timeout(this.config.defaultTimeout)
                            })];
                    case 2:
                        response = _c.sent();
                        responseTime = Date.now() - startTime;
                        delivery.responseTimeMs = responseTime;
                        if (!response.ok) return [3 /*break*/, 3];
                        delivery.status = 'delivered';
                        delivery.deliveredAt = new Date();
                        delivery.httpStatus = response.status;
                        // Remove from queue
                        this.removeFromQueue(delivery.id);
                        console.log("\u2705 Delivery ".concat(delivery.id, " successful (").concat(responseTime, "ms)"));
                        return [3 /*break*/, 6];
                    case 3:
                        delivery.httpStatus = response.status;
                        _a = delivery;
                        _b = {
                            message: "HTTP ".concat(response.status, ": ").concat(response.statusText)
                        };
                        return [4 /*yield*/, response.text().catch(function () { return 'No response body'; })];
                    case 4:
                        _a.error = (_b.details = _c.sent(),
                            _b);
                        return [4 /*yield*/, this.handleDeliveryFailure(delivery)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [3 /*break*/, 11];
                    case 7:
                        error_12 = _c.sent();
                        delivery.error = {
                            message: error_12.message,
                            details: error_12
                        };
                        return [4 /*yield*/, this.handleDeliveryFailure(delivery)];
                    case 8:
                        _c.sent();
                        return [3 /*break*/, 11];
                    case 9: 
                    // Update delivery record
                    return [4 /*yield*/, this.updateDeliveryRecord(delivery)];
                    case 10:
                        // Update delivery record
                        _c.sent();
                        this.activeDeliveries.delete(delivery.id);
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    WebhookManager.prototype.handleDeliveryFailure = function (delivery) {
        return __awaiter(this, void 0, void 0, function () {
            var webhook, retryStrategy, delayMs;
            return __generator(this, function (_a) {
                if (delivery.attempts >= delivery.maxAttempts) {
                    delivery.status = 'failed';
                    delivery.failedAt = new Date();
                    // Remove from queue
                    this.removeFromQueue(delivery.id);
                    console.error("\u274C Delivery ".concat(delivery.id, " failed permanently after ").concat(delivery.attempts, " attempts"));
                }
                else {
                    delivery.status = 'pending';
                    webhook = this.webhookEndpoints.get(delivery.webhookId);
                    retryStrategy = webhook === null || webhook === void 0 ? void 0 : webhook.retryStrategy;
                    delayMs = this.config.retryDelayMs;
                    if (retryStrategy) {
                        switch (retryStrategy.strategy) {
                            case 'exponential':
                                delayMs = retryStrategy.delayMs * Math.pow(2, delivery.attempts - 1);
                                break;
                            case 'linear':
                                delayMs = retryStrategy.delayMs * delivery.attempts;
                                break;
                            case 'fixed':
                            default:
                                delayMs = retryStrategy.delayMs;
                                break;
                        }
                    }
                    delivery.scheduledAt = new Date(Date.now() + delayMs);
                    console.log("\u23F3 Delivery ".concat(delivery.id, " scheduled for retry in ").concat(delayMs, "ms (attempt ").concat(delivery.attempts, "/").concat(delivery.maxAttempts, ")"));
                }
                return [2 /*return*/];
            });
        });
    };
    WebhookManager.prototype.removeFromQueue = function (deliveryId) {
        var index = this.deliveryQueue.findIndex(function (d) { return d.id === deliveryId; });
        if (index !== -1) {
            this.deliveryQueue.splice(index, 1);
        }
    };
    WebhookManager.prototype.updateDeliveryRecord = function (delivery) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_13;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('event_deliveries')
                                .update({
                                status: delivery.status,
                                attempts: delivery.attempts,
                                last_attempt_at: (_a = delivery.lastAttemptAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                                delivered_at: (_b = delivery.deliveredAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
                                failed_at: (_c = delivery.failedAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
                                http_status: delivery.httpStatus,
                                response_time_ms: delivery.responseTimeMs,
                                error: delivery.error,
                                scheduled_at: delivery.scheduledAt.toISOString()
                            })
                                .eq('id', delivery.id)];
                    case 1:
                        error = (_d.sent()).error;
                        if (error) {
                            throw error;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _d.sent();
                        console.error('❌ Failed to update delivery record:', error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WebhookManager.prototype.convertDbRecordToWebhook = function (record) {
        return {
            id: record.id,
            name: record.name,
            url: record.url,
            clinicId: record.clinic_id,
            eventTypes: record.event_types,
            isActive: record.is_active,
            secret: record.secret,
            headers: record.headers || {},
            timeoutMs: record.timeout_ms,
            retryStrategy: record.retry_strategy,
            rateLimit: record.rate_limit,
            filters: record.filters || [],
            testOnRegistration: record.test_on_registration,
            createdAt: new Date(record.created_at),
            updatedAt: new Date(record.updated_at)
        };
    };
    WebhookManager.prototype.convertDbRecordToDelivery = function (record) {
        return {
            id: record.id,
            eventId: record.event_id,
            webhookId: record.webhook_id,
            url: record.url,
            payload: record.payload,
            headers: record.headers,
            status: record.status,
            attempts: record.attempts,
            maxAttempts: record.max_attempts,
            scheduledAt: new Date(record.scheduled_at),
            lastAttemptAt: record.last_attempt_at ? new Date(record.last_attempt_at) : undefined,
            deliveredAt: record.delivered_at ? new Date(record.delivered_at) : undefined,
            failedAt: record.failed_at ? new Date(record.failed_at) : undefined,
            httpStatus: record.http_status,
            responseTimeMs: record.response_time_ms,
            error: record.error,
            createdAt: new Date(record.created_at)
        };
    };
    return WebhookManager;
}());
exports.WebhookManager = WebhookManager;
exports.default = WebhookManager;
