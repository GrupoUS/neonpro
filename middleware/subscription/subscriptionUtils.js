"use strict";
/**
 * Subscription Utilities and Helpers
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionContext = getSubscriptionContext;
exports.isSubscriptionActive = isSubscriptionActive;
exports.getSubscriptionTierInfo = getSubscriptionTierInfo;
exports.formatCurrency = formatCurrency;
exports.calculateDiscount = calculateDiscount;
var ssr_1 = require("@supabase/ssr");
/**
 * Get subscription context for API routes
 */
function getSubscriptionContext(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase_1, session, userClinic, subscription_1, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    supabase_1 = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
                        cookies: {
                            get: function (name) {
                                var _a;
                                return (_a = request.cookies.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                            },
                        },
                    });
                    return [4 /*yield*/, supabase_1.auth.getSession()];
                case 1:
                    session = (_a.sent()).data.session;
                    if (!session)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, supabase_1
                            .from('user_clinics')
                            .select('clinic_id')
                            .eq('user_id', session.user.id)
                            .eq('is_active', true)
                            .single()];
                case 2:
                    userClinic = (_a.sent()).data;
                    if (!userClinic)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, supabase_1
                            .from('user_subscriptions')
                            .select("\n        *,\n        plan:subscription_plans(*)\n      ")
                            .eq('clinic_id', userClinic.clinic_id)
                            .in('status', ['trial', 'active'])
                            .single()];
                case 3:
                    subscription_1 = (_a.sent()).data;
                    if (!subscription_1)
                        return [2 /*return*/, null];
                    return [2 /*return*/, {
                            subscription: subscription_1,
                            hasFeature: function (feature) {
                                var _a;
                                var features = ((_a = subscription_1.plan) === null || _a === void 0 ? void 0 : _a.features) || {};
                                return features[feature] === true;
                            },
                            checkUsageLimit: function (feature, currentUsage) { return __awaiter(_this, void 0, void 0, function () {
                                var limits, limit, usage;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            limits = ((_a = subscription_1.plan) === null || _a === void 0 ? void 0 : _a.limits) || {};
                                            limit = limits[feature];
                                            if (limit === -1 || limit === undefined) {
                                                return [2 /*return*/, { allowed: true }];
                                            }
                                            usage = currentUsage;
                                            if (!(usage === undefined)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, getCurrentUsage(supabase_1, subscription_1, feature)];
                                        case 1:
                                            usage = _b.sent();
                                            _b.label = 2;
                                        case 2: return [2 /*return*/, {
                                                allowed: usage < limit,
                                                limit: limit,
                                                current: usage,
                                                remaining: Math.max(0, limit - usage)
                                            }];
                                    }
                                });
                            }); },
                            incrementUsage: function (feature_1) {
                                var args_1 = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    args_1[_i - 1] = arguments[_i];
                                }
                                return __awaiter(_this, __spreadArray([feature_1], args_1, true), void 0, function (feature, amount) {
                                    if (amount === void 0) { amount = 1; }
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, incrementFeatureUsage(supabase_1, subscription_1, feature, amount)];
                                            case 1: return [2 /*return*/, _a.sent()];
                                        }
                                    });
                                });
                            }
                        }];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error getting subscription context:', error_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get current usage for a feature
 */
function getCurrentUsage(supabase, subscription, feature) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, patientCount, startOfMonth, appointmentCount, userCount, usage, apiUsage, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 14, , 15]);
                    _a = feature;
                    switch (_a) {
                        case 'max_patients': return [3 /*break*/, 1];
                        case 'max_appointments_per_month': return [3 /*break*/, 3];
                        case 'max_users': return [3 /*break*/, 5];
                        case 'sms_notifications': return [3 /*break*/, 7];
                        case 'email_notifications': return [3 /*break*/, 7];
                        case 'storage_gb': return [3 /*break*/, 9];
                        case 'api_requests_per_month': return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 12];
                case 1: return [4 /*yield*/, supabase
                        .from('patients')
                        .select('*', { count: 'exact', head: true })
                        .eq('clinic_id', subscription.clinic_id)
                        .eq('is_active', true)];
                case 2:
                    patientCount = (_b.sent()).count;
                    return [2 /*return*/, patientCount || 0];
                case 3:
                    startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, supabase
                            .from('appointments')
                            .select('*', { count: 'exact', head: true })
                            .eq('clinic_id', subscription.clinic_id)
                            .gte('appointment_date', startOfMonth.toISOString())];
                case 4:
                    appointmentCount = (_b.sent()).count;
                    return [2 /*return*/, appointmentCount || 0];
                case 5: return [4 /*yield*/, supabase
                        .from('user_clinics')
                        .select('*', { count: 'exact', head: true })
                        .eq('clinic_id', subscription.clinic_id)
                        .eq('is_active', true)];
                case 6:
                    userCount = (_b.sent()).count;
                    return [2 /*return*/, userCount || 0];
                case 7: return [4 /*yield*/, supabase
                        .from('subscription_usage')
                        .select('usage_count')
                        .eq('subscription_id', subscription.id)
                        .eq('feature_name', feature)
                        .gte('usage_period_start', getUsagePeriodStart('monthly'))
                        .single()];
                case 8:
                    usage = (_b.sent()).data;
                    return [2 /*return*/, (usage === null || usage === void 0 ? void 0 : usage.usage_count) || 0];
                case 9: 
                // Calculate storage usage (placeholder - implement based on actual storage calculation)
                return [2 /*return*/, 0];
                case 10: return [4 /*yield*/, supabase
                        .from('subscription_usage')
                        .select('usage_count')
                        .eq('subscription_id', subscription.id)
                        .eq('feature_name', feature)
                        .gte('usage_period_start', getUsagePeriodStart('monthly'))
                        .single()];
                case 11:
                    apiUsage = (_b.sent()).data;
                    return [2 /*return*/, (apiUsage === null || apiUsage === void 0 ? void 0 : apiUsage.usage_count) || 0];
                case 12: return [2 /*return*/, 0];
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_2 = _b.sent();
                    console.error("Error getting current usage for ".concat(feature, ":"), error_2);
                    return [2 /*return*/, 0];
                case 15: return [2 /*return*/];
            }
        });
    });
}
/**
 * Increment usage for a specific feature
 */
function incrementFeatureUsage(supabase, subscription, feature, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var periodStart, error, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    periodStart = getUsagePeriodStart('monthly');
                    return [4 /*yield*/, supabase
                            .from('subscription_usage')
                            .upsert({
                            subscription_id: subscription.id,
                            feature_name: feature,
                            usage_period_start: periodStart,
                            usage_count: amount
                        }, {
                            onConflict: 'subscription_id,feature_name,usage_period_start',
                            ignoreDuplicates: false
                        })];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Error incrementing usage:', error);
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error incrementing feature usage:', error_3);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get usage period start based on reset frequency
 */
function getUsagePeriodStart(frequency) {
    var now = new Date();
    switch (frequency) {
        case 'daily':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        case 'weekly':
            var weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return weekStart.toISOString();
        case 'monthly':
            return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        case 'yearly':
            return new Date(now.getFullYear(), 0, 1).toISOString();
        default:
            return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
}
/**
 * Check if a subscription is active and not expired
 */
function isSubscriptionActive(subscription) {
    if (!subscription)
        return false;
    var now = new Date();
    // Check trial expiration
    if (subscription.status === 'trial' && subscription.trial_end) {
        return now <= new Date(subscription.trial_end);
    }
    // Check active status
    return subscription.status === 'active';
}
/**
 * Get subscription tier display information
 */
function getSubscriptionTierInfo(plan) {
    var tierInfo = {
        basic: {
            color: 'blue',
            icon: '⭐',
            priority: 1
        },
        professional: {
            color: 'purple',
            icon: '🚀',
            priority: 2
        },
        enterprise: {
            color: 'gold',
            icon: '👑',
            priority: 3
        }
    };
    return tierInfo[plan.name] || {
        color: 'gray',
        icon: '📦',
        priority: 0
    };
}
/**
 * Format currency for display
 */
function formatCurrency(amount, currency) {
    if (currency === void 0) { currency = 'BRL'; }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}
/**
 * Calculate discount percentage
 */
function calculateDiscount(monthly, yearly) {
    var monthlyTotal = monthly * 12;
    var discount = ((monthlyTotal - yearly) / monthlyTotal) * 100;
    return Math.round(discount);
}
