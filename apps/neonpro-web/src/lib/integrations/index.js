"use strict";
/**
 * NeonPro - Third-party Integrations Framework
 * Main export file for the integrations system
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
exports.IntegrationFrameworkFactory = exports.StripeUtils = exports.StripeConnector = exports.GoogleCalendarUtils = exports.GoogleCalendarConnector = exports.WhatsAppUtils = exports.WhatsAppConnector = exports.QueueFactory = exports.SupabaseIntegrationQueue = exports.MemoryIntegrationQueue = exports.CacheFactory = exports.SupabaseIntegrationCache = exports.RedisIntegrationCache = exports.MemoryIntegrationCache = exports.MemoryRateLimiter = exports.SupabaseRateLimiter = exports.WebhookSignatureUtils = exports.NeonProWebhookManager = exports.NeonProIntegrationFramework = void 0;
// Core Framework
var framework_1 = require("./framework");
Object.defineProperty(exports, "NeonProIntegrationFramework", { enumerable: true, get: function () { return framework_1.NeonProIntegrationFramework; } });
var webhook_manager_1 = require("./webhook-manager");
Object.defineProperty(exports, "NeonProWebhookManager", { enumerable: true, get: function () { return webhook_manager_1.NeonProWebhookManager; } });
Object.defineProperty(exports, "WebhookSignatureUtils", { enumerable: true, get: function () { return webhook_manager_1.WebhookSignatureUtils; } });
var rate_limiter_1 = require("./rate-limiter");
Object.defineProperty(exports, "SupabaseRateLimiter", { enumerable: true, get: function () { return rate_limiter_1.SupabaseRateLimiter; } });
Object.defineProperty(exports, "MemoryRateLimiter", { enumerable: true, get: function () { return rate_limiter_1.MemoryRateLimiter; } });
var cache_1 = require("./cache");
Object.defineProperty(exports, "MemoryIntegrationCache", { enumerable: true, get: function () { return cache_1.MemoryIntegrationCache; } });
Object.defineProperty(exports, "RedisIntegrationCache", { enumerable: true, get: function () { return cache_1.RedisIntegrationCache; } });
Object.defineProperty(exports, "SupabaseIntegrationCache", { enumerable: true, get: function () { return cache_1.SupabaseIntegrationCache; } });
Object.defineProperty(exports, "CacheFactory", { enumerable: true, get: function () { return cache_1.CacheFactory; } });
var queue_1 = require("./queue");
Object.defineProperty(exports, "MemoryIntegrationQueue", { enumerable: true, get: function () { return queue_1.MemoryIntegrationQueue; } });
Object.defineProperty(exports, "SupabaseIntegrationQueue", { enumerable: true, get: function () { return queue_1.SupabaseIntegrationQueue; } });
Object.defineProperty(exports, "QueueFactory", { enumerable: true, get: function () { return queue_1.QueueFactory; } });
// Connectors
var whatsapp_1 = require("./connectors/whatsapp");
Object.defineProperty(exports, "WhatsAppConnector", { enumerable: true, get: function () { return whatsapp_1.WhatsAppConnector; } });
Object.defineProperty(exports, "WhatsAppUtils", { enumerable: true, get: function () { return whatsapp_1.WhatsAppUtils; } });
var google_calendar_1 = require("./connectors/google-calendar");
Object.defineProperty(exports, "GoogleCalendarConnector", { enumerable: true, get: function () { return google_calendar_1.GoogleCalendarConnector; } });
Object.defineProperty(exports, "GoogleCalendarUtils", { enumerable: true, get: function () { return google_calendar_1.GoogleCalendarUtils; } });
var stripe_1 = require("./connectors/stripe");
Object.defineProperty(exports, "StripeConnector", { enumerable: true, get: function () { return stripe_1.StripeConnector; } });
Object.defineProperty(exports, "StripeUtils", { enumerable: true, get: function () { return stripe_1.StripeUtils; } });
// Types
__exportStar(require("./types"), exports);
/**
 * Integration Framework Factory
 * Provides easy setup for the complete integration system
 */
var IntegrationFrameworkFactory = /** @class */ (function () {
    function IntegrationFrameworkFactory() {
    }
    /**
     * Create a complete integration framework instance
     */
    IntegrationFrameworkFactory.create = function () {
        return __awaiter(this, arguments, void 0, function (config) {
            var _a, cacheType, _b, queueType, _c, rateLimiterType, cache, queue, rateLimiter, webhookManager;
            if (config === void 0) { config = {}; }
            return __generator(this, function (_d) {
                _a = config.cacheType, cacheType = _a === void 0 ? 'memory' : _a, _b = config.queueType, queueType = _b === void 0 ? 'memory' : _b, _c = config.rateLimiterType, rateLimiterType = _c === void 0 ? 'memory' : _c;
                cache = CacheFactory.create(cacheType, {
                    supabaseUrl: config.supabaseUrl,
                    supabaseKey: config.supabaseKey,
                    redisUrl: config.redisUrl
                });
                queue = QueueFactory.create(queueType, {
                    supabaseUrl: config.supabaseUrl,
                    supabaseKey: config.supabaseKey
                });
                if (rateLimiterType === 'supabase' && config.supabaseUrl && config.supabaseKey) {
                    rateLimiter = new SupabaseRateLimiter(config.supabaseUrl, config.supabaseKey);
                }
                else {
                    rateLimiter = new MemoryRateLimiter();
                }
                webhookManager = new NeonProWebhookManager({
                    queue: queue,
                    rateLimiter: rateLimiter
                });
                // Create and return framework instance
                return [2 /*return*/, new NeonProIntegrationFramework({
                        cache: cache,
                        queue: queue,
                        rateLimiter: rateLimiter,
                        webhookManager: webhookManager
                    })];
            });
        });
    };
    /**
     * Create WhatsApp connector with default configuration
     */
    IntegrationFrameworkFactory.createWhatsAppConnector = function (config) {
        return new WhatsAppConnector({
            id: 'whatsapp-business',
            name: 'WhatsApp Business',
            type: 'messaging',
            enabled: true,
            credentials: {
                accessToken: config.accessToken,
                phoneNumberId: config.phoneNumberId,
                businessAccountId: config.businessAccountId,
                webhookVerifyToken: config.webhookVerifyToken || ''
            },
            endpoints: {
                baseUrl: 'https://graph.facebook.com/v18.0',
                webhookUrl: config.webhookUrl
            },
            rateLimits: {
                requestsPerSecond: 10,
                requestsPerMinute: 600,
                requestsPerHour: 36000
            }
        });
    };
    /**
     * Create Google Calendar connector with default configuration
     */
    IntegrationFrameworkFactory.createGoogleCalendarConnector = function (config) {
        return new GoogleCalendarConnector({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            refreshToken: config.refreshToken,
            calendarId: config.calendarId,
            timeZone: config.timeZone || 'America/Sao_Paulo',
            webhookUrl: config.webhookUrl
        });
    };
    /**
     * Create Stripe connector with default configuration
     */
    IntegrationFrameworkFactory.createStripeConnector = function (config) {
        return new StripeConnector({
            secretKey: config.secretKey,
            publishableKey: config.publishableKey,
            webhookSecret: config.webhookSecret,
            currency: config.currency || 'BRL',
            country: config.country || 'BR',
            webhookUrl: config.webhookUrl
        });
    };
    return IntegrationFrameworkFactory;
}());
exports.IntegrationFrameworkFactory = IntegrationFrameworkFactory;
/**
 * Default export for easy framework access
 */
exports.default = NeonProIntegrationFramework;
