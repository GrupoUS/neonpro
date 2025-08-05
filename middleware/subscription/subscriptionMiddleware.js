"use strict";
/**
 * Subscription Validation Middleware
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * This middleware validates subscription status and feature access
 * for protected API endpoints based on the user's subscription tier.
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
exports.subscriptionMiddleware = subscriptionMiddleware;
exports.getSubscriptionContext = getSubscriptionContext;
var server_1 = require("next/server");
var ssr_1 = require("@supabase/ssr");
/**
 * Feature requirements mapping for different endpoints
 */
var ENDPOINT_FEATURE_MAP = {
    // BI Dashboard endpoints
    '/api/dashboard/bi': 'bi_dashboard',
    '/api/dashboard/analytics': 'advanced_reports',
    '/api/dashboard/custom': 'custom_dashboards',
    // Inventory Management
    '/api/inventory': 'inventory_management',
    '/api/stock': 'inventory_management',
    // Financial Management
    '/api/financial': 'financial_management',
    '/api/billing': 'financial_management',
    // Advanced Features
    '/api/templates/custom': 'custom_templates',
    '/api/webhooks': 'webhook_integration',
    '/api/sso': 'sso_integration',
    // Multi-location
    '/api/locations': 'multi_location',
    // API Access
    '/api/external': 'api_access',
};
/**
 * Usage limit endpoints that need validation
 */
var USAGE_LIMIT_MAP = {
    '/api/patients': 'max_patients',
    '/api/appointments': 'max_appointments_per_month',
    '/api/users': 'max_users',
    '/api/notifications/sms': 'sms_notifications',
    '/api/notifications/email': 'email_notifications',
    '/api/storage': 'storage_gb',
};
/**
 * Main subscription validation middleware
 */
function subscriptionMiddleware(request, context) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, session, sessionError, userClinic, _b, subscription, subscriptionError, now, trialEnd, endpoint, requiredFeature, hasAccess, usageLimitKey, usageCheck, response, error_1;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 6, , 7]);
                    supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
                        cookies: {
                            get: function (name) {
                                var _a;
                                return (_a = request.cookies.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                            },
                        },
                    });
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    _a = _f.sent(), session = _a.data.session, sessionError = _a.error;
                    if (sessionError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_clinics')
                            .select('clinic_id')
                            .eq('user_id', session.user.id)
                            .eq('is_active', true)
                            .single()];
                case 2:
                    userClinic = (_f.sent()).data;
                    if (!userClinic) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'No active clinic found' }, { status: 403 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .select("\n        *,\n        plan:subscription_plans(*)\n      ")
                            .eq('clinic_id', userClinic.clinic_id)
                            .in('status', ['trial', 'active'])
                            .single()];
                case 3:
                    _b = _f.sent(), subscription = _b.data, subscriptionError = _b.error;
                    if (subscriptionError || !subscription) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'No active subscription found',
                                code: 'SUBSCRIPTION_REQUIRED',
                                message: 'Esta funcionalidade requer uma assinatura ativa.'
                            }, { status: 402 } // Payment Required
                            )];
                    }
                    // Check if subscription is expired
                    if (subscription.status === 'trial' && subscription.trial_end) {
                        now = new Date();
                        trialEnd = new Date(subscription.trial_end);
                        if (now > trialEnd) {
                            return [2 /*return*/, server_1.NextResponse.json({
                                    error: 'Trial period expired',
                                    code: 'TRIAL_EXPIRED',
                                    message: 'Seu período de teste expirou. Faça upgrade para continuar usando.'
                                }, { status: 402 })];
                        }
                    }
                    endpoint = request.nextUrl.pathname;
                    requiredFeature = getRequiredFeature(endpoint);
                    if (requiredFeature) {
                        hasAccess = hasFeatureAccess(subscription.plan, requiredFeature);
                        if (!hasAccess) {
                            return [2 /*return*/, server_1.NextResponse.json({
                                    error: 'Feature not available in your plan',
                                    code: 'FEATURE_NOT_AVAILABLE',
                                    message: "Esta funcionalidade n\u00E3o est\u00E1 dispon\u00EDvel no seu plano ".concat((_c = subscription.plan) === null || _c === void 0 ? void 0 : _c.display_name, "."),
                                    required_feature: requiredFeature,
                                    current_plan: (_d = subscription.plan) === null || _d === void 0 ? void 0 : _d.name,
                                    upgrade_required: true
                                }, { status: 403 })];
                        }
                    }
                    usageLimitKey = USAGE_LIMIT_MAP[endpoint];
                    if (!usageLimitKey) return [3 /*break*/, 5];
                    return [4 /*yield*/, checkUsageLimit(supabase, subscription, usageLimitKey)];
                case 4:
                    usageCheck = _f.sent();
                    if (!usageCheck.allowed) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Usage limit exceeded',
                                code: 'USAGE_LIMIT_EXCEEDED',
                                message: "Voc\u00EA atingiu o limite de ".concat(usageLimitKey, " do seu plano."),
                                limit: usageCheck.limit,
                                current_usage: usageCheck.current,
                                upgrade_required: true
                            }, { status: 429 } // Too Many Requests
                            )];
                    }
                    _f.label = 5;
                case 5:
                    response = server_1.NextResponse.next();
                    response.headers.set('x-subscription-tier', ((_e = subscription.plan) === null || _e === void 0 ? void 0 : _e.name) || 'unknown');
                    response.headers.set('x-subscription-id', subscription.id);
                    response.headers.set('x-clinic-id', subscription.clinic_id);
                    return [2 /*return*/, response];
                case 6:
                    error_1 = _f.sent();
                    console.error('Subscription middleware error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Internal server error',
                            code: 'MIDDLEWARE_ERROR',
                            message: 'Erro interno do sistema. Tente novamente em alguns instantes.'
                        }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get required feature for a given endpoint
 */
function getRequiredFeature(endpoint) {
    // Direct match
    if (ENDPOINT_FEATURE_MAP[endpoint]) {
        return ENDPOINT_FEATURE_MAP[endpoint];
    }
    // Pattern matching for dynamic routes
    for (var _i = 0, _a = Object.entries(ENDPOINT_FEATURE_MAP); _i < _a.length; _i++) {
        var _b = _a[_i], pattern = _b[0], feature = _b[1];
        if (endpoint.startsWith(pattern)) {
            return feature;
        }
    }
    return null;
}
/**
 * Check if subscription plan has access to a specific feature
 */
function hasFeatureAccess(plan, feature) {
    if (!plan.features || typeof plan.features !== 'object') {
        return false;
    }
    var features = plan.features;
    return features[feature] === true;
}
/**
 * Check usage limits for a subscription
 */
function checkUsageLimit(supabase, subscription, limitKey) {
    return __awaiter(this, void 0, void 0, function () {
        var limits, limit, currentUsage, _a, patientCount, startOfMonth, appointmentCount, userCount, usage, error_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    limits = ((_b = subscription.plan) === null || _b === void 0 ? void 0 : _b.limits) || {};
                    limit = limits[limitKey];
                    // -1 means unlimited
                    if (limit === -1 || limit === undefined) {
                        return [2 /*return*/, { allowed: true }];
                    }
                    currentUsage = 0;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 12, , 13]);
                    _a = limitKey;
                    switch (_a) {
                        case 'max_patients': return [3 /*break*/, 2];
                        case 'max_appointments_per_month': return [3 /*break*/, 4];
                        case 'max_users': return [3 /*break*/, 6];
                        case 'sms_notifications': return [3 /*break*/, 8];
                        case 'email_notifications': return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 10];
                case 2: return [4 /*yield*/, supabase
                        .from('patients')
                        .select('*', { count: 'exact', head: true })
                        .eq('clinic_id', subscription.clinic_id)
                        .eq('is_active', true)];
                case 3:
                    patientCount = (_c.sent()).count;
                    currentUsage = patientCount || 0;
                    return [3 /*break*/, 11];
                case 4:
                    startOfMonth = new Date();
                    startOfMonth.setDate(1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, supabase
                            .from('appointments')
                            .select('*', { count: 'exact', head: true })
                            .eq('clinic_id', subscription.clinic_id)
                            .gte('appointment_date', startOfMonth.toISOString())];
                case 5:
                    appointmentCount = (_c.sent()).count;
                    currentUsage = appointmentCount || 0;
                    return [3 /*break*/, 11];
                case 6: return [4 /*yield*/, supabase
                        .from('user_clinics')
                        .select('*', { count: 'exact', head: true })
                        .eq('clinic_id', subscription.clinic_id)
                        .eq('is_active', true)];
                case 7:
                    userCount = (_c.sent()).count;
                    currentUsage = userCount || 0;
                    return [3 /*break*/, 11];
                case 8: return [4 /*yield*/, supabase
                        .from('subscription_usage')
                        .select('usage_count')
                        .eq('subscription_id', subscription.id)
                        .eq('feature_name', limitKey)
                        .gte('usage_period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
                        .single()];
                case 9:
                    usage = (_c.sent()).data;
                    currentUsage = (usage === null || usage === void 0 ? void 0 : usage.usage_count) || 0;
                    return [3 /*break*/, 11];
                case 10: 
                // For unknown limits, allow by default
                return [2 /*return*/, { allowed: true }];
                case 11: return [2 /*return*/, {
                        allowed: currentUsage < limit,
                        limit: limit,
                        current: currentUsage
                    }];
                case 12:
                    error_2 = _c.sent();
                    console.error("Error checking usage limit for ".concat(limitKey, ":"), error_2);
                    // On error, allow the request to proceed
                    return [2 /*return*/, { allowed: true }];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Helper function to create subscription context for API routes
 */
function getSubscriptionContext(request) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // This will be used in API routes to get subscription context
            // Implementation similar to middleware but returns context object
            // instead of NextResponse
            return [2 /*return*/, null]; // Placeholder - will be implemented in next chunk
        });
    });
}
