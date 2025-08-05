"use strict";
/**
 * NeonPro - Third-party Integrations Framework
 * Core framework implementation
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.IntegrationFrameworkError = exports.NeonProIntegrationFramework = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
/**
 * Main Integration Framework Class
 * Manages all third-party integrations
 */
var NeonProIntegrationFramework = /** @class */ (function () {
    function NeonProIntegrationFramework(supabaseUrl, supabaseKey, rateLimiter, webhookManager, cache, queue) {
        this.connectors = new Map();
        this.integrations = new Map();
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.rateLimiter = rateLimiter;
        this.webhookManager = webhookManager;
        this.cache = cache;
        this.queue = queue;
    }
    /**
     * Register a new integration connector
     */
    NeonProIntegrationFramework.prototype.registerConnector = function (connector) {
        this.connectors.set(connector.id, connector);
        console.log("Registered connector: ".concat(connector.name, " (").concat(connector.type, ")"));
    };
    /**
     * Create a new integration
     */
    NeonProIntegrationFramework.prototype.createIntegration = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var connector, isValid, authResult, _a, data, error, _b, _c, error_1;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, , 8]);
                        connector = this.connectors.get(config.type);
                        if (!connector) {
                            throw new IntegrationFrameworkError("Connector not found for type: ".concat(config.type), 'CONNECTOR_NOT_FOUND', config.id);
                        }
                        return [4 /*yield*/, connector.validateConfig(config)];
                    case 1:
                        isValid = _e.sent();
                        if (!isValid) {
                            throw new IntegrationFrameworkError('Invalid integration configuration', 'INVALID_CONFIG', config.id);
                        }
                        return [4 /*yield*/, connector.authenticate(config.credentials)];
                    case 2:
                        authResult = _e.sent();
                        if (!authResult) {
                            throw new IntegrationFrameworkError('Authentication failed', 'AUTH_FAILED', config.id);
                        }
                        _c = (_b = this.supabase
                            .from('integrations'))
                            .insert;
                        _d = {
                            id: config.id,
                            name: config.name,
                            type: config.type,
                            version: config.version,
                            enabled: config.enabled,
                            settings: config.settings
                        };
                        return [4 /*yield*/, this.encryptCredentials(config.credentials)];
                    case 3: return [4 /*yield*/, _c.apply(_b, [(_d.credentials = _e.sent(),
                                _d.endpoints = config.endpoints,
                                _d.webhooks = config.webhooks,
                                _d.rate_limits = config.rateLimits,
                                _d.retry_policy = config.retryPolicy,
                                _d.monitoring = config.monitoring,
                                _d.created_at = new Date(),
                                _d.updated_at = new Date(),
                                _d)])
                            .select()
                            .single()];
                    case 4:
                        _a = _e.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new IntegrationFrameworkError("Failed to save integration: ".concat(error.message), 'DATABASE_ERROR', config.id);
                        }
                        // Cache the integration
                        this.integrations.set(config.id, config);
                        return [4 /*yield*/, this.cache.set("integration:".concat(config.id), config, 3600)];
                    case 5:
                        _e.sent();
                        // Log creation
                        return [4 /*yield*/, this.logEvent({
                                id: crypto.randomUUID(),
                                integrationId: config.id,
                                type: 'integration_created',
                                data: { name: config.name, type: config.type },
                                source: 'internal',
                                timestamp: new Date(),
                                processed: true,
                                retryCount: 0,
                                clinicId: config.settings.clinicId || 'system'
                            })];
                    case 6:
                        // Log creation
                        _e.sent();
                        return [2 /*return*/, config.id];
                    case 7:
                        error_1 = _e.sent();
                        console.error('Failed to create integration:', error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update an existing integration
     */
    NeonProIntegrationFramework.prototype.updateIntegration = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated, connector, isValid, error, _a, _b, _c, error_2;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, this.getIntegration(id)];
                    case 1:
                        existing = _e.sent();
                        if (!existing) {
                            throw new IntegrationFrameworkError("Integration not found: ".concat(id), 'INTEGRATION_NOT_FOUND', id);
                        }
                        updated = __assign(__assign(__assign({}, existing), updates), { updatedAt: new Date() });
                        if (!(updates.type && updates.type !== existing.type)) return [3 /*break*/, 3];
                        connector = this.connectors.get(updates.type);
                        if (!connector) {
                            throw new IntegrationFrameworkError("Connector not found for type: ".concat(updates.type), 'CONNECTOR_NOT_FOUND', id);
                        }
                        return [4 /*yield*/, connector.validateConfig(updated)];
                    case 2:
                        isValid = _e.sent();
                        if (!isValid) {
                            throw new IntegrationFrameworkError('Invalid integration configuration', 'INVALID_CONFIG', id);
                        }
                        _e.label = 3;
                    case 3:
                        _b = (_a = this.supabase
                            .from('integrations'))
                            .update;
                        _d = {
                            name: updated.name,
                            type: updated.type,
                            version: updated.version,
                            enabled: updated.enabled,
                            settings: updated.settings
                        };
                        if (!updates.credentials) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.encryptCredentials(updates.credentials)];
                    case 4:
                        _c = _e.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _c = undefined;
                        _e.label = 6;
                    case 6: return [4 /*yield*/, _b.apply(_a, [(_d.credentials = _c,
                                _d.endpoints = updated.endpoints,
                                _d.webhooks = updated.webhooks,
                                _d.rate_limits = updated.rateLimits,
                                _d.retry_policy = updated.retryPolicy,
                                _d.monitoring = updated.monitoring,
                                _d.updated_at = new Date(),
                                _d)])
                            .eq('id', id)];
                    case 7:
                        error = (_e.sent()).error;
                        if (error) {
                            throw new IntegrationFrameworkError("Failed to update integration: ".concat(error.message), 'DATABASE_ERROR', id);
                        }
                        // Update cache
                        this.integrations.set(id, updated);
                        return [4 /*yield*/, this.cache.set("integration:".concat(id), updated, 3600)];
                    case 8:
                        _e.sent();
                        // Log update
                        return [4 /*yield*/, this.logEvent({
                                id: crypto.randomUUID(),
                                integrationId: id,
                                type: 'integration_updated',
                                data: updates,
                                source: 'internal',
                                timestamp: new Date(),
                                processed: true,
                                retryCount: 0,
                                clinicId: updated.settings.clinicId || 'system'
                            })];
                    case 9:
                        // Log update
                        _e.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        error_2 = _e.sent();
                        console.error('Failed to update integration:', error_2);
                        throw error_2;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete an integration
     */
    NeonProIntegrationFramework.prototype.deleteIntegration = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var integration, error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getIntegration(id)];
                    case 1:
                        integration = _a.sent();
                        if (!integration) {
                            throw new IntegrationFrameworkError("Integration not found: ".concat(id), 'INTEGRATION_NOT_FOUND', id);
                        }
                        return [4 /*yield*/, this.supabase
                                .from('integrations')
                                .delete()
                                .eq('id', id)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new IntegrationFrameworkError("Failed to delete integration: ".concat(error.message), 'DATABASE_ERROR', id);
                        }
                        // Remove from cache and memory
                        this.integrations.delete(id);
                        return [4 /*yield*/, this.cache.delete("integration:".concat(id))];
                    case 3:
                        _a.sent();
                        // Log deletion
                        return [4 /*yield*/, this.logEvent({
                                id: crypto.randomUUID(),
                                integrationId: id,
                                type: 'integration_deleted',
                                data: { name: integration.name, type: integration.type },
                                source: 'internal',
                                timestamp: new Date(),
                                processed: true,
                                retryCount: 0,
                                clinicId: integration.settings.clinicId || 'system'
                            })];
                    case 4:
                        // Log deletion
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.error('Failed to delete integration:', error_3);
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get an integration by ID
     */
    NeonProIntegrationFramework.prototype.getIntegration = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, _a, data, error, integration, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.cache.get("integration:".concat(id))];
                    case 1:
                        cached = _c.sent();
                        if (cached) {
                            return [2 /*return*/, cached];
                        }
                        // Check memory
                        if (this.integrations.has(id)) {
                            return [2 /*return*/, this.integrations.get(id)];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('integrations')
                                .select('*')
                                .eq('id', id)
                                .single()];
                    case 2:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            return [2 /*return*/, null];
                        }
                        _b = {
                            id: data.id,
                            name: data.name,
                            type: data.type,
                            version: data.version,
                            enabled: data.enabled,
                            settings: data.settings
                        };
                        return [4 /*yield*/, this.decryptCredentials(data.credentials)];
                    case 3:
                        integration = (_b.credentials = _c.sent(),
                            _b.endpoints = data.endpoints,
                            _b.webhooks = data.webhooks,
                            _b.rateLimits = data.rate_limits,
                            _b.retryPolicy = data.retry_policy,
                            _b.monitoring = data.monitoring,
                            _b.createdAt = new Date(data.created_at),
                            _b.updatedAt = new Date(data.updated_at),
                            _b);
                        // Cache and store in memory
                        this.integrations.set(id, integration);
                        return [4 /*yield*/, this.cache.set("integration:".concat(id), integration, 3600)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, integration];
                    case 5:
                        error_4 = _c.sent();
                        console.error('Failed to get integration:', error_4);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * List all integrations for a clinic
     */
    NeonProIntegrationFramework.prototype.listIntegrations = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, integrations, _i, _b, item, integration, error_5;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.supabase
                                .from('integrations')
                                .select('*')
                                .eq('settings->>clinicId', clinicId)
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _d.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new IntegrationFrameworkError("Failed to list integrations: ".concat(error.message), 'DATABASE_ERROR', 'list');
                        }
                        integrations = [];
                        _i = 0, _b = data || [];
                        _d.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        item = _b[_i];
                        _c = {
                            id: item.id,
                            name: item.name,
                            type: item.type,
                            version: item.version,
                            enabled: item.enabled,
                            settings: item.settings
                        };
                        return [4 /*yield*/, this.decryptCredentials(item.credentials)];
                    case 3:
                        integration = (_c.credentials = _d.sent(),
                            _c.endpoints = item.endpoints,
                            _c.webhooks = item.webhooks,
                            _c.rateLimits = item.rate_limits,
                            _c.retryPolicy = item.retry_policy,
                            _c.monitoring = item.monitoring,
                            _c.createdAt = new Date(item.created_at),
                            _c.updatedAt = new Date(item.updated_at),
                            _c);
                        integrations.push(integration);
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, integrations];
                    case 6:
                        error_5 = _d.sent();
                        console.error('Failed to list integrations:', error_5);
                        throw error_5;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test connection for an integration
     */
    NeonProIntegrationFramework.prototype.testConnection = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var integration, connector, health, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getIntegration(id)];
                    case 1:
                        integration = _a.sent();
                        if (!integration) {
                            throw new IntegrationFrameworkError("Integration not found: ".concat(id), 'INTEGRATION_NOT_FOUND', id);
                        }
                        connector = this.connectors.get(integration.type);
                        if (!connector) {
                            throw new IntegrationFrameworkError("Connector not found for type: ".concat(integration.type), 'CONNECTOR_NOT_FOUND', id);
                        }
                        return [4 /*yield*/, connector.getHealthStatus()];
                    case 2:
                        health = _a.sent();
                        // Log health check
                        return [4 /*yield*/, this.logEvent({
                                id: crypto.randomUUID(),
                                integrationId: id,
                                type: 'health_check',
                                data: health,
                                source: 'internal',
                                timestamp: new Date(),
                                processed: true,
                                retryCount: 0,
                                clinicId: integration.settings.clinicId || 'system'
                            })];
                    case 3:
                        // Log health check
                        _a.sent();
                        return [2 /*return*/, health];
                    case 4:
                        error_6 = _a.sent();
                        console.error('Failed to test connection:', error_6);
                        throw error_6;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a request through an integration
     */
    NeonProIntegrationFramework.prototype.executeRequest = function (id, endpoint, data) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, requestId, integration, connector, endpointConfig, canProceed, request, response, error_7, duration, errorResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        requestId = crypto.randomUUID();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 10]);
                        return [4 /*yield*/, this.getIntegration(id)];
                    case 2:
                        integration = _a.sent();
                        if (!integration) {
                            throw new IntegrationFrameworkError("Integration not found: ".concat(id), 'INTEGRATION_NOT_FOUND', id);
                        }
                        if (!integration.enabled) {
                            throw new IntegrationFrameworkError("Integration is disabled: ".concat(id), 'INTEGRATION_DISABLED', id);
                        }
                        connector = this.connectors.get(integration.type);
                        if (!connector) {
                            throw new IntegrationFrameworkError("Connector not found for type: ".concat(integration.type), 'CONNECTOR_NOT_FOUND', id);
                        }
                        endpointConfig = integration.endpoints.find(function (ep) { return ep.name === endpoint; });
                        if (!endpointConfig) {
                            throw new IntegrationFrameworkError("Endpoint not found: ".concat(endpoint), 'ENDPOINT_NOT_FOUND', id);
                        }
                        return [4 /*yield*/, this.rateLimiter.checkLimit(id, endpoint)];
                    case 3:
                        canProceed = _a.sent();
                        if (!canProceed) {
                            throw new IntegrationFrameworkError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', id);
                        }
                        request = {
                            id: requestId,
                            integrationId: id,
                            endpoint: endpoint,
                            method: endpointConfig.method,
                            headers: endpointConfig.headers || {},
                            body: data,
                            timestamp: new Date(),
                            clinicId: integration.settings.clinicId || 'system'
                        };
                        return [4 /*yield*/, this.logRequest(request)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, connector.request(endpointConfig, data)];
                    case 5:
                        response = _a.sent();
                        response.requestId = requestId;
                        response.duration = Date.now() - startTime;
                        // Increment rate limit counter
                        return [4 /*yield*/, this.rateLimiter.incrementCounter(id, endpoint)];
                    case 6:
                        // Increment rate limit counter
                        _a.sent();
                        // Log response
                        return [4 /*yield*/, this.logResponse(response)];
                    case 7:
                        // Log response
                        _a.sent();
                        return [2 /*return*/, response];
                    case 8:
                        error_7 = _a.sent();
                        duration = Date.now() - startTime;
                        errorResponse = {
                            id: crypto.randomUUID(),
                            requestId: requestId,
                            status: 'error',
                            statusCode: error_7 instanceof IntegrationFrameworkError ? 400 : 500,
                            headers: {},
                            error: error_7.message,
                            duration: duration,
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, this.logResponse(errorResponse)];
                    case 9:
                        _a.sent();
                        throw error_7;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming webhook
     */
    NeonProIntegrationFramework.prototype.handleWebhook = function (id, payload, headers) {
        return __awaiter(this, void 0, void 0, function () {
            var integration, connector, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getIntegration(id)];
                    case 1:
                        integration = _a.sent();
                        if (!integration) {
                            throw new IntegrationFrameworkError("Integration not found: ".concat(id), 'INTEGRATION_NOT_FOUND', id);
                        }
                        connector = this.connectors.get(integration.type);
                        if (!connector) {
                            throw new IntegrationFrameworkError("Connector not found for type: ".concat(integration.type), 'CONNECTOR_NOT_FOUND', id);
                        }
                        return [4 /*yield*/, connector.handleWebhook(payload, headers)];
                    case 2:
                        _a.sent();
                        // Log webhook
                        return [4 /*yield*/, this.logEvent({
                                id: crypto.randomUUID(),
                                integrationId: id,
                                type: 'webhook_received',
                                data: { payload: payload, headers: headers },
                                source: 'external',
                                timestamp: new Date(),
                                processed: true,
                                retryCount: 0,
                                clinicId: integration.settings.clinicId || 'system'
                            })];
                    case 3:
                        // Log webhook
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        console.error('Failed to handle webhook:', error_8);
                        throw error_8;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start a sync operation
     */
    NeonProIntegrationFramework.prototype.startSync = function (id, operation) {
        return __awaiter(this, void 0, void 0, function () {
            var integration, connector, syncOperation, error, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getIntegration(id)];
                    case 1:
                        integration = _a.sent();
                        if (!integration) {
                            throw new IntegrationFrameworkError("Integration not found: ".concat(id), 'INTEGRATION_NOT_FOUND', id);
                        }
                        connector = this.connectors.get(integration.type);
                        if (!connector) {
                            throw new IntegrationFrameworkError("Connector not found for type: ".concat(integration.type), 'CONNECTOR_NOT_FOUND', id);
                        }
                        syncOperation = {
                            id: crypto.randomUUID(),
                            integrationId: id,
                            type: operation.type || 'sync',
                            entity: operation.entity || 'unknown',
                            status: 'pending',
                            progress: 0,
                            totalRecords: operation.totalRecords || 0,
                            processedRecords: 0,
                            errorRecords: 0,
                            startedAt: new Date(),
                            metadata: operation.metadata,
                            clinicId: integration.settings.clinicId || 'system'
                        };
                        return [4 /*yield*/, this.supabase
                                .from('integration_sync_operations')
                                .insert(syncOperation)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new IntegrationFrameworkError("Failed to save sync operation: ".concat(error.message), 'DATABASE_ERROR', id);
                        }
                        // Queue sync job
                        return [4 /*yield*/, this.queue.enqueue({
                                id: crypto.randomUUID(),
                                type: 'sync',
                                integrationId: id,
                                payload: syncOperation,
                                priority: 1,
                                attempts: 0,
                                maxAttempts: 3,
                                delay: 0,
                                status: 'pending',
                                createdAt: new Date()
                            })];
                    case 3:
                        // Queue sync job
                        _a.sent();
                        return [2 /*return*/, syncOperation.id];
                    case 4:
                        error_9 = _a.sent();
                        console.error('Failed to start sync:', error_9);
                        throw error_9;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get metrics for an integration
     */
    NeonProIntegrationFramework.prototype.getMetrics = function (id, period) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                try {
                    metrics = {
                        integrationId: id,
                        totalRequests: 0,
                        successfulRequests: 0,
                        failedRequests: 0,
                        averageResponseTime: 0,
                        errorRate: 0,
                        uptime: 100,
                        period: period,
                        timestamp: new Date()
                    };
                    return [2 /*return*/, metrics];
                }
                catch (error) {
                    console.error('Failed to get metrics:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get logs for an integration
     */
    NeonProIntegrationFramework.prototype.getLogs = function (id, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('integration_logs')
                                .select('*')
                                .eq('integration_id', id)
                                .order('timestamp', { ascending: false })
                                .limit((filters === null || filters === void 0 ? void 0 : filters.limit) || 100)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new IntegrationFrameworkError("Failed to get logs: ".concat(error.message), 'DATABASE_ERROR', id);
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_10 = _b.sent();
                        console.error('Failed to get logs:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Private helper methods
    NeonProIntegrationFramework.prototype.encryptCredentials = function (credentials) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would use proper encryption
                return [2 /*return*/, JSON.stringify(credentials)];
            });
        });
    };
    NeonProIntegrationFramework.prototype.decryptCredentials = function (encrypted) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would use proper decryption
                return [2 /*return*/, JSON.parse(encrypted)];
            });
        });
    };
    NeonProIntegrationFramework.prototype.logRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('integration_requests')
                            .insert(request)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeonProIntegrationFramework.prototype.logResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('integration_responses')
                            .insert(response)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NeonProIntegrationFramework.prototype.logEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('integration_events')
                            .insert(event)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return NeonProIntegrationFramework;
}());
exports.NeonProIntegrationFramework = NeonProIntegrationFramework;
/**
 * Custom error class for integration framework
 */
var IntegrationFrameworkError = /** @class */ (function (_super) {
    __extends(IntegrationFrameworkError, _super);
    function IntegrationFrameworkError(message, code, integrationId, endpoint, statusCode, retryable, metadata) {
        if (retryable === void 0) { retryable = false; }
        var _this = _super.call(this, message) || this;
        _this.name = 'IntegrationFrameworkError';
        _this.code = code;
        _this.integrationId = integrationId;
        _this.endpoint = endpoint;
        _this.statusCode = statusCode;
        _this.retryable = retryable;
        _this.metadata = metadata;
        return _this;
    }
    return IntegrationFrameworkError;
}(Error));
exports.IntegrationFrameworkError = IntegrationFrameworkError;
