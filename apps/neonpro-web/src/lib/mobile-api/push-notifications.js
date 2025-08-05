"use strict";
/**
 * Push Notifications System for Mobile API
 * Handles push notification delivery, device management, and notification analytics
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNotificationTemplates = exports.PushNotificationsManager = void 0;
exports.createPushNotificationsManager = createPushNotificationsManager;
var supabase_js_1 = require("@supabase/supabase-js");
var types_1 = require("./types");
/**
 * Push Notifications Manager
 * Comprehensive push notification system for mobile devices
 */
var PushNotificationsManager = /** @class */ (function () {
    function PushNotificationsManager(config) {
        this.deviceRegistry = new Map();
        this.notificationQueue = [];
        this.isInitialized = false;
        this.config = config;
        this.supabase = (0, supabase_js_1.createClient)(config.supabaseUrl, config.supabaseKey);
        this.fcmServerKey = config.fcmServerKey;
        this.apnsConfig = config.apnsConfig;
        this.analytics = {
            totalSent: 0,
            totalDelivered: 0,
            totalFailed: 0,
            deliveryRate: 0,
            averageDeliveryTime: 0,
            deviceMetrics: new Map(),
            categoryMetrics: new Map(),
            hourlyMetrics: []
        };
    }
    /**
     * Initialize push notification system
     */
    PushNotificationsManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // Load device registrations
                        return [4 /*yield*/, this.loadDeviceRegistrations()];
                    case 1:
                        // Load device registrations
                        _a.sent();
                        // Initialize notification templates
                        return [4 /*yield*/, this.loadNotificationTemplates()];
                    case 2:
                        // Initialize notification templates
                        _a.sent();
                        // Setup analytics
                        return [4 /*yield*/, this.initializeAnalytics()];
                    case 3:
                        // Setup analytics
                        _a.sent();
                        // Start background processes
                        this.startNotificationProcessor();
                        this.startAnalyticsCollector();
                        this.isInitialized = true;
                        console.log('Push notifications system initialized successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Failed to initialize push notifications:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register device for push notifications
     */
    PushNotificationsManager.prototype.registerDevice = function (registration) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Validate device token
                        if (!this.validateDeviceToken(registration.deviceToken, registration.platform)) {
                            throw new Error('Invalid device token format');
                        }
                        return [4 /*yield*/, this.supabase
                                .from('device_registrations')
                                .upsert({
                                device_id: registration.deviceId,
                                user_id: registration.userId,
                                device_token: registration.deviceToken,
                                platform: registration.platform,
                                app_version: registration.appVersion,
                                os_version: registration.osVersion,
                                preferences: registration.preferences,
                                timezone: registration.timezone,
                                language: registration.language,
                                is_active: true,
                                registered_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Update local registry
                        this.deviceRegistry.set(registration.deviceId, registration);
                        console.log("Device registered: ".concat(registration.deviceId));
                        return [2 /*return*/, true];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Device registration failed:', error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send push notification to single device
     */
    PushNotificationsManager.prototype.sendNotification = function (deviceId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var device, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        device = this.deviceRegistry.get(deviceId);
                        if (!device) {
                            throw new Error("Device not found: ".concat(deviceId));
                        }
                        // Check device preferences
                        if (!this.shouldSendNotification(device, payload)) {
                            return [2 /*return*/, {
                                    success: false,
                                    messageId: '',
                                    error: 'Notification blocked by user preferences',
                                    deliveredAt: new Date()
                                }];
                        }
                        result = void 0;
                        if (!(device.platform === 'ios')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendAPNSNotification(device, payload)];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.sendFCMNotification(device, payload)];
                    case 3:
                        result = _a.sent();
                        _a.label = 4;
                    case 4: 
                    // Store notification record
                    return [4 /*yield*/, this.storeNotificationRecord(deviceId, payload, result)];
                    case 5:
                        // Store notification record
                        _a.sent();
                        // Update analytics
                        this.updateAnalytics(result, payload.category);
                        return [2 /*return*/, result];
                    case 6:
                        error_3 = _a.sent();
                        console.error('Send notification failed:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                messageId: '',
                                error: error_3.message,
                                deliveredAt: new Date()
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send batch notifications
     */
    PushNotificationsManager.prototype.sendBatchNotifications = function (batch) {
        return __awaiter(this, void 0, void 0, function () {
            var results, batchSize, i, chunk, chunkPromises, chunkResults, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        batchSize = this.config.batchSize || 100;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < batch.deviceIds.length)) return [3 /*break*/, 6];
                        chunk = batch.deviceIds.slice(i, i + batchSize);
                        chunkPromises = chunk.map(function (deviceId) {
                            return _this.sendNotification(deviceId, batch.payload);
                        });
                        return [4 /*yield*/, Promise.allSettled(chunkPromises)];
                    case 3:
                        chunkResults = _a.sent();
                        chunkResults.forEach(function (result) {
                            if (result.status === 'fulfilled') {
                                results.push(result.value);
                            }
                            else {
                                results.push({
                                    success: false,
                                    messageId: '',
                                    error: result.reason.message,
                                    deliveredAt: new Date()
                                });
                            }
                        });
                        if (!(i + batchSize < batch.deviceIds.length)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.delay(this.config.rateLimitDelay || 100)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i += batchSize;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/, results];
                    case 7:
                        error_4 = _a.sent();
                        console.error('Batch notification failed:', error_4);
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Schedule notification for later delivery
     */
    PushNotificationsManager.prototype.scheduleNotification = function (schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var scheduleId, error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        scheduleId = "schedule_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                        return [4 /*yield*/, this.supabase
                                .from('notification_schedules')
                                .insert({
                                schedule_id: scheduleId,
                                device_ids: schedule.deviceIds,
                                payload: schedule.payload,
                                scheduled_for: schedule.scheduledFor.toISOString(),
                                timezone: schedule.timezone,
                                repeat_pattern: schedule.repeatPattern,
                                is_active: true,
                                created_at: new Date().toISOString()
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        console.log("Notification scheduled: ".concat(scheduleId));
                        return [2 /*return*/, scheduleId];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Schedule notification failed:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update device preferences
     */
    PushNotificationsManager.prototype.updateDevicePreferences = function (deviceId, preferences) {
        return __awaiter(this, void 0, void 0, function () {
            var error, device, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('device_registrations')
                                .update({
                                preferences: preferences,
                                updated_at: new Date().toISOString()
                            })
                                .eq('device_id', deviceId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        device = this.deviceRegistry.get(deviceId);
                        if (device) {
                            device.preferences = preferences;
                            this.deviceRegistry.set(deviceId, device);
                        }
                        return [2 /*return*/, true];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Update preferences failed:', error_6);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get notification analytics
     */
    PushNotificationsManager.prototype.getAnalytics = function () {
        return __assign({}, this.analytics);
    };
    /**
     * Get device metrics
     */
    PushNotificationsManager.prototype.getDeviceMetrics = function (deviceId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_analytics')
                                .select('*')
                                .eq('device_id', deviceId)
                                .order('created_at', { ascending: false })
                                .limit(1)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Get device metrics failed:', error_7);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send FCM notification
     */
    PushNotificationsManager.prototype.sendFCMNotification = function (device, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var fcmPayload, response, result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        fcmPayload = {
                            to: device.deviceToken,
                            notification: {
                                title: payload.title,
                                body: payload.body,
                                icon: payload.icon,
                                sound: payload.sound || 'default'
                            },
                            data: __assign(__assign({}, payload.data), { category: payload.category, priority: payload.priority.toString() }),
                            priority: payload.priority === types_1.NotificationPriority.HIGH ? 'high' : 'normal',
                            time_to_live: payload.ttl || 3600
                        };
                        return [4 /*yield*/, fetch('https://fcm.googleapis.com/fcm/send', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "key=".concat(this.fcmServerKey),
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(fcmPayload)
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (result.success === 1) {
                            return [2 /*return*/, {
                                    success: true,
                                    messageId: result.results[0].message_id,
                                    deliveredAt: new Date()
                                }];
                        }
                        else {
                            throw new Error(result.results[0].error || 'FCM delivery failed');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        throw new Error("FCM notification failed: ".concat(error_8.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send APNS notification
     */
    PushNotificationsManager.prototype.sendAPNSNotification = function (device, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var apnsPayload, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        apnsPayload = {
                            aps: {
                                alert: {
                                    title: payload.title,
                                    body: payload.body
                                },
                                sound: payload.sound || 'default',
                                badge: payload.badge,
                                'content-available': 1
                            },
                            data: payload.data,
                            category: payload.category
                        };
                        // Simulate APNS call
                        return [4 /*yield*/, this.delay(100)];
                    case 1:
                        // Simulate APNS call
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                messageId: "apns_".concat(Date.now()),
                                deliveredAt: new Date()
                            }];
                    case 2:
                        error_9 = _a.sent();
                        throw new Error("APNS notification failed: ".concat(error_9.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate device token format
     */
    PushNotificationsManager.prototype.validateDeviceToken = function (token, platform) {
        if (platform === 'ios') {
            // APNS token validation (64 hex characters)
            return /^[a-fA-F0-9]{64}$/.test(token);
        }
        else {
            // FCM token validation (basic length check)
            return token.length > 100 && token.length < 200;
        }
    };
    /**
     * Check if notification should be sent based on preferences
     */
    PushNotificationsManager.prototype.shouldSendNotification = function (device, payload) {
        var prefs = device.preferences;
        // Check if notifications are enabled
        if (!prefs.notificationsEnabled)
            return false;
        // Check category preferences
        if (prefs.categoryPreferences) {
            var categoryEnabled = prefs.categoryPreferences[payload.category];
            if (categoryEnabled === false)
                return false;
        }
        // Check quiet hours
        if (prefs.quietHours) {
            var now = new Date();
            var currentHour = now.getHours();
            if (currentHour >= prefs.quietHours.start || currentHour < prefs.quietHours.end) {
                // Allow high priority notifications during quiet hours
                return payload.priority === types_1.NotificationPriority.HIGH;
            }
        }
        return true;
    };
    /**
     * Load device registrations from database
     */
    PushNotificationsManager.prototype.loadDeviceRegistrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_10;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('device_registrations')
                                .select('*')
                                .eq('is_active', true)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        data === null || data === void 0 ? void 0 : data.forEach(function (device) {
                            _this.deviceRegistry.set(device.device_id, {
                                deviceId: device.device_id,
                                userId: device.user_id,
                                deviceToken: device.device_token,
                                platform: device.platform,
                                appVersion: device.app_version,
                                osVersion: device.os_version,
                                preferences: device.preferences,
                                timezone: device.timezone,
                                language: device.language,
                                registeredAt: new Date(device.registered_at)
                            });
                        });
                        console.log("Loaded ".concat(this.deviceRegistry.size, " device registrations"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _b.sent();
                        console.error('Failed to load device registrations:', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load notification templates
     */
    PushNotificationsManager.prototype.loadNotificationTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_templates')
                                .select('*')
                                .eq('is_active', true)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        console.log("Loaded ".concat((data === null || data === void 0 ? void 0 : data.length) || 0, " notification templates"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _b.sent();
                        console.error('Failed to load notification templates:', error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize analytics system
     */
    PushNotificationsManager.prototype.initializeAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_analytics')
                                .select('*')
                                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Process analytics data
                        if (data) {
                            this.processAnalyticsData(data);
                        }
                        console.log('Analytics system initialized');
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _b.sent();
                        console.error('Failed to initialize analytics:', error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process analytics data
     */
    PushNotificationsManager.prototype.processAnalyticsData = function (data) {
        var totalSent = 0;
        var totalDelivered = 0;
        var totalFailed = 0;
        var totalDeliveryTime = 0;
        var deliveryCount = 0;
        data.forEach(function (record) {
            totalSent += record.sent_count || 0;
            totalDelivered += record.delivered_count || 0;
            totalFailed += record.failed_count || 0;
            if (record.average_delivery_time) {
                totalDeliveryTime += record.average_delivery_time;
                deliveryCount++;
            }
        });
        this.analytics.totalSent = totalSent;
        this.analytics.totalDelivered = totalDelivered;
        this.analytics.totalFailed = totalFailed;
        this.analytics.deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
        this.analytics.averageDeliveryTime = deliveryCount > 0 ? totalDeliveryTime / deliveryCount : 0;
    };
    /**
     * Store notification record
     */
    PushNotificationsManager.prototype.storeNotificationRecord = function (deviceId, payload, result) {
        return __awaiter(this, void 0, void 0, function () {
            var error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('notification_logs')
                                .insert({
                                device_id: deviceId,
                                title: payload.title,
                                body: payload.body,
                                category: payload.category,
                                priority: payload.priority,
                                success: result.success,
                                message_id: result.messageId,
                                error_message: result.error,
                                delivered_at: result.deliveredAt.toISOString(),
                                created_at: new Date().toISOString()
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        console.error('Failed to store notification record:', error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update analytics
     */
    PushNotificationsManager.prototype.updateAnalytics = function (result, category) {
        this.analytics.totalSent++;
        if (result.success) {
            this.analytics.totalDelivered++;
        }
        else {
            this.analytics.totalFailed++;
        }
        this.analytics.deliveryRate = (this.analytics.totalDelivered / this.analytics.totalSent) * 100;
        // Update category metrics
        var categoryStats = this.analytics.categoryMetrics.get(category) || { sent: 0, delivered: 0, failed: 0 };
        categoryStats.sent++;
        if (result.success) {
            categoryStats.delivered++;
        }
        else {
            categoryStats.failed++;
        }
        this.analytics.categoryMetrics.set(category, categoryStats);
    };
    /**
     * Start notification processor
     */
    PushNotificationsManager.prototype.startNotificationProcessor = function () {
        var _this = this;
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var batch, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.notificationQueue.length > 0)) return [3 /*break*/, 4];
                        batch = this.notificationQueue.shift();
                        if (!batch) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.sendBatchNotifications(batch)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_14 = _a.sent();
                        console.error('Batch processing failed:', error_14);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }, this.config.processingInterval || 5000);
    };
    /**
     * Start analytics collector
     */
    PushNotificationsManager.prototype.startAnalyticsCollector = function () {
        var _this = this;
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.collectAndStoreAnalytics()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_15 = _a.sent();
                        console.error('Analytics collection failed:', error_15);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, this.config.analyticsInterval || 60000);
    };
    /**
     * Collect and store analytics
     */
    PushNotificationsManager.prototype.collectAndStoreAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var analytics, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        analytics = this.getAnalytics();
                        return [4 /*yield*/, this.supabase
                                .from('notification_analytics')
                                .insert({
                                total_sent: analytics.totalSent,
                                total_delivered: analytics.totalDelivered,
                                total_failed: analytics.totalFailed,
                                delivery_rate: analytics.deliveryRate,
                                average_delivery_time: analytics.averageDeliveryTime,
                                device_count: this.deviceRegistry.size,
                                created_at: new Date().toISOString()
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _a.sent();
                        console.error('Failed to store analytics:', error_16);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Utility delay function
     */
    PushNotificationsManager.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return PushNotificationsManager;
}());
exports.PushNotificationsManager = PushNotificationsManager;
/**
 * Create push notifications manager instance
 */
function createPushNotificationsManager(config) {
    return new PushNotificationsManager(config);
}
/**
 * Default notification templates
 */
exports.defaultNotificationTemplates = (_a = {},
    _a[types_1.NotificationCategory.APPOINTMENT] = {
        id: 'appointment_reminder',
        category: types_1.NotificationCategory.APPOINTMENT,
        title: 'Lembrete de Consulta',
        body: 'Você tem uma consulta agendada para {{time}} com {{doctor}}',
        icon: 'appointment',
        sound: 'default',
        priority: types_1.NotificationPriority.HIGH,
        data: {
            type: 'appointment_reminder',
            action: 'view_appointment'
        }
    },
    _a[types_1.NotificationCategory.MEDICATION] = {
        id: 'medication_reminder',
        category: types_1.NotificationCategory.MEDICATION,
        title: 'Hora do Medicamento',
        body: 'Está na hora de tomar {{medication}}',
        icon: 'medication',
        sound: 'medication',
        priority: types_1.NotificationPriority.HIGH,
        data: {
            type: 'medication_reminder',
            action: 'mark_taken'
        }
    },
    _a[types_1.NotificationCategory.RESULTS] = {
        id: 'results_available',
        category: types_1.NotificationCategory.RESULTS,
        title: 'Resultados Disponíveis',
        body: 'Seus resultados de exame estão prontos',
        icon: 'results',
        sound: 'default',
        priority: types_1.NotificationPriority.MEDIUM,
        data: {
            type: 'results_available',
            action: 'view_results'
        }
    },
    _a[types_1.NotificationCategory.SYSTEM] = {
        id: 'system_update',
        category: types_1.NotificationCategory.SYSTEM,
        title: 'Atualização do Sistema',
        body: '{{message}}',
        icon: 'system',
        sound: 'default',
        priority: types_1.NotificationPriority.LOW,
        data: {
            type: 'system_update',
            action: 'update_app'
        }
    },
    _a);
exports.default = PushNotificationsManager;
