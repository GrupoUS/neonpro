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
exports.generateVapidKeys = generateVapidKeys;
var web_push_1 = require("web-push");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
// FIXED: Removed direct import of 'next/headers' to avoid client-side errors
// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    web_push_1.default.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@neonpro.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}
else {
    console.warn('VAPID keys not configured for push notifications');
}
var PushNotificationService = /** @class */ (function () {
    function PushNotificationService() {
        this.supabase = null;
    }
    // Initialize Supabase client with dynamic cookies import
    PushNotificationService.prototype.getSupabaseClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cookies, error_1, createClient, createClient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.supabase) {
                            return [2 /*return*/, this.supabase];
                        }
                        if (!(typeof window === 'undefined')) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('next/headers'); })];
                    case 2:
                        cookies = (_a.sent()).cookies;
                        this.supabase = (0, auth_helpers_nextjs_1.createServerComponentClient)({ cookies: cookies });
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error importing next/headers:', error_1);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@supabase/supabase-js'); })];
                    case 4:
                        createClient = (_a.sent()).createClient;
                        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, Promise.resolve().then(function () { return require('@supabase/supabase-js'); })];
                    case 7:
                        createClient = (_a.sent()).createClient;
                        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
                        _a.label = 8;
                    case 8: return [2 /*return*/, this.supabase];
                }
            });
        });
    };
    // Save push subscription for a user
    PushNotificationService.prototype.saveSubscription = function (userId, subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('push_subscriptions')
                                .upsert({
                                user_id: userId,
                                endpoint: subscription.endpoint,
                                p256dh_key: subscription.keys.p256dh,
                                auth_key: subscription.keys.auth,
                                is_active: true,
                                updated_at: new Date().toISOString()
                            })];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Error saving push subscription:', error);
                            return [2 /*return*/, { success: false, error: error.message }];
                        }
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error in saveSubscription:', error_2);
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Remove push subscription for a user
    PushNotificationService.prototype.removeSubscription = function (userId, endpoint) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('push_subscriptions')
                                .update({ is_active: false })
                                .eq('user_id', userId)
                                .eq('endpoint', endpoint)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Error removing push subscription:', error);
                            return [2 /*return*/, { success: false, error: error.message }];
                        }
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error in removeSubscription:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get all active subscriptions for a user
    PushNotificationService.prototype.getUserSubscriptions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('push_subscriptions')
                                .select('endpoint, p256dh_key, auth_key')
                                .eq('user_id', userId)
                                .eq('is_active', true)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching user subscriptions:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, data.map(function (sub) { return ({
                                endpoint: sub.endpoint,
                                keys: {
                                    p256dh: sub.p256dh_key,
                                    auth: sub.auth_key
                                }
                            }); })];
                    case 3:
                        error_4 = _b.sent();
                        console.error('Error in getUserSubscriptions:', error_4);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Send push notification to a specific user
    PushNotificationService.prototype.sendToUser = function (userId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptions_1, results, sent_1, failed_1, errors_1, error_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUserSubscriptions(userId)];
                    case 1:
                        subscriptions_1 = _a.sent();
                        if (subscriptions_1.length === 0) {
                            return [2 /*return*/, { success: false, sent: 0, failed: 0, errors: ['No active subscriptions found'] }];
                        }
                        return [4 /*yield*/, Promise.allSettled(subscriptions_1.map(function (subscription) {
                                return web_push_1.default.sendNotification(subscription, JSON.stringify(payload));
                            }))];
                    case 2:
                        results = _a.sent();
                        sent_1 = 0;
                        failed_1 = 0;
                        errors_1 = [];
                        results.forEach(function (result, index) {
                            var _a, _b;
                            if (result.status === 'fulfilled') {
                                sent_1++;
                            }
                            else {
                                failed_1++;
                                var subscription = subscriptions_1[index];
                                errors_1.push("Failed to send to ".concat(subscription.endpoint, ": ").concat((_a = result.reason) === null || _a === void 0 ? void 0 : _a.message));
                                // If subscription is invalid, mark as inactive
                                if (((_b = result.reason) === null || _b === void 0 ? void 0 : _b.statusCode) === 410) {
                                    _this.removeSubscription(userId, subscription.endpoint);
                                }
                            }
                        });
                        return [2 /*return*/, {
                                success: sent_1 > 0,
                                sent: sent_1,
                                failed: failed_1,
                                errors: errors_1
                            }];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error sending push notification to user:', error_5);
                        return [2 /*return*/, {
                                success: false,
                                sent: 0,
                                failed: 1,
                                errors: [error_5 instanceof Error ? error_5.message : 'Unknown error']
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Send push notification to multiple users
    PushNotificationService.prototype.sendToUsers = function (userIds, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var results, totalSent_1, totalFailed_1, processedResults_1, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.allSettled(userIds.map(function (userId) { return _this.sendToUser(userId, payload); }))];
                    case 1:
                        results = _a.sent();
                        totalSent_1 = 0;
                        totalFailed_1 = 0;
                        processedResults_1 = [];
                        results.forEach(function (result, index) {
                            var _a;
                            var userId = userIds[index];
                            if (result.status === 'fulfilled') {
                                var _b = result.value, sent = _b.sent, failed = _b.failed, errors = _b.errors;
                                totalSent_1 += sent;
                                totalFailed_1 += failed;
                                processedResults_1.push({ userId: userId, sent: sent, failed: failed, errors: errors });
                            }
                            else {
                                totalFailed_1++;
                                processedResults_1.push({
                                    userId: userId,
                                    sent: 0,
                                    failed: 1,
                                    errors: [((_a = result.reason) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to process user']
                                });
                            }
                        });
                        return [2 /*return*/, {
                                success: totalSent_1 > 0,
                                totalSent: totalSent_1,
                                totalFailed: totalFailed_1,
                                results: processedResults_1
                            }];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error sending bulk push notifications:', error_6);
                        return [2 /*return*/, {
                                success: false,
                                totalSent: 0,
                                totalFailed: userIds.length,
                                results: userIds.map(function (userId) { return ({
                                    userId: userId,
                                    sent: 0,
                                    failed: 1,
                                    errors: [error_6 instanceof Error ? error_6.message : 'Unknown error']
                                }); })
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Helper methods for common notification types
    PushNotificationService.prototype.sendAppointmentReminder = function (userId, appointmentData) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = {
                    title: '🔔 Lembrete de Consulta',
                    body: "Ol\u00E1 ".concat(appointmentData.patientName, "! Voc\u00EA tem consulta de ").concat(appointmentData.serviceName, " amanh\u00E3 \u00E0s ").concat(appointmentData.appointmentTime, " com ").concat(appointmentData.professionalName, "."),
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    tag: "appointment_reminder_".concat(appointmentData.appointmentId),
                    url: "/dashboard/appointments/".concat(appointmentData.appointmentId),
                    type: 'appointment_reminder',
                    data: {
                        appointmentId: appointmentData.appointmentId,
                        type: 'appointment_reminder'
                    },
                    actions: [
                        {
                            action: 'view',
                            title: 'Ver Detalhes',
                            icon: '/icons/view-action.png'
                        },
                        {
                            action: 'close',
                            title: 'Fechar'
                        }
                    ],
                    requireInteraction: true,
                    vibrate: [200, 100, 200]
                };
                return [2 /*return*/, this.sendToUser(userId, payload)];
            });
        });
    };
    PushNotificationService.prototype.sendAppointmentConfirmation = function (userId, appointmentData) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = {
                    title: '✅ Consulta Confirmada',
                    body: "Sua consulta de ".concat(appointmentData.serviceName, " foi confirmada para ").concat(appointmentData.appointmentDate, " \u00E0s ").concat(appointmentData.appointmentTime, "."),
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    tag: "appointment_confirmation_".concat(appointmentData.appointmentId),
                    url: "/dashboard/appointments/".concat(appointmentData.appointmentId),
                    type: 'appointment_confirmation',
                    data: {
                        appointmentId: appointmentData.appointmentId,
                        type: 'appointment_confirmation'
                    },
                    actions: [
                        {
                            action: 'view',
                            title: 'Ver Detalhes'
                        }
                    ],
                    vibrate: [100, 50, 100]
                };
                return [2 /*return*/, this.sendToUser(userId, payload)];
            });
        });
    };
    PushNotificationService.prototype.sendPaymentReminder = function (userId, paymentData) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = {
                    title: '💰 Lembrete de Pagamento',
                    body: "Ol\u00E1 ".concat(paymentData.patientName, "! Voc\u00EA tem um pagamento de R$ ").concat(paymentData.amount.toFixed(2), " vencendo em ").concat(paymentData.dueDate, "."),
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    tag: "payment_reminder_".concat(paymentData.invoiceId),
                    url: "/dashboard/billing/".concat(paymentData.invoiceId),
                    type: 'payment_due',
                    data: {
                        invoiceId: paymentData.invoiceId,
                        type: 'payment_due'
                    },
                    actions: [
                        {
                            action: 'pay',
                            title: 'Pagar Agora',
                            icon: '/icons/pay-action.png'
                        },
                        {
                            action: 'view',
                            title: 'Ver Detalhes'
                        }
                    ],
                    requireInteraction: true,
                    vibrate: [200, 100, 200, 100, 200]
                };
                return [2 /*return*/, this.sendToUser(userId, payload)];
            });
        });
    };
    // Test notification for checking push setup
    PushNotificationService.prototype.sendTestNotification = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = {
                    title: '🧪 Notificação de Teste',
                    body: 'Se você está vendo isso, as notificações push estão funcionando perfeitamente!',
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    tag: 'test_notification',
                    url: '/dashboard/notifications',
                    type: 'system_notification',
                    data: {
                        type: 'test'
                    },
                    actions: [
                        {
                            action: 'close',
                            title: 'OK'
                        }
                    ],
                    vibrate: [100]
                };
                return [2 /*return*/, this.sendToUser(userId, payload)];
            });
        });
    };
    // Get VAPID public key for client-side subscription
    PushNotificationService.prototype.getVapidPublicKey = function () {
        return process.env.VAPID_PUBLIC_KEY || null;
    };
    // Validate push subscription
    PushNotificationService.prototype.validateSubscription = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var testPayload, error_7;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        if (!subscription.endpoint || !((_a = subscription.keys) === null || _a === void 0 ? void 0 : _a.p256dh) || !((_b = subscription.keys) === null || _b === void 0 ? void 0 : _b.auth)) {
                            return [2 /*return*/, false];
                        }
                        testPayload = {
                            title: 'Test',
                            body: 'Validation test',
                            silent: true
                        };
                        return [4 /*yield*/, web_push_1.default.sendNotification(subscription, JSON.stringify(testPayload))];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_7 = _c.sent();
                        console.error('Subscription validation failed:', error_7);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PushNotificationService;
}());
// Singleton instance
var pushNotificationService = new PushNotificationService();
exports.default = pushNotificationService;
// Utility functions
function generateVapidKeys() {
    return web_push_1.default.generateVAPIDKeys();
}
