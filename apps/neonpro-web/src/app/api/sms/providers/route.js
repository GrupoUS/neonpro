"use strict";
// SMS Providers API for NeonPro
// Manage SMS provider configurations
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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var zod_1 = require("zod");
var sms_service_1 = require("@/app/lib/services/sms-service");
var server_2 = require("@/lib/supabase/server");
// Schema for provider configuration
var ProviderConfigSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Provider name is required'),
    provider: zod_1.z.enum(['twilio', 'sms_dev', 'zenvia', 'movile', 'custom']),
    enabled: zod_1.z.boolean().default(false),
    config: zod_1.z.object({}).passthrough(), // Allow any config structure
    webhook_url: zod_1.z.string().url().optional()
});
/**
 * Get all SMS providers
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, activeOnly, providers, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: 'UNAUTHORIZED',
                                    message: 'Authentication required'
                                }
                            }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    activeOnly = searchParams.get('active') === 'true';
                    providers = void 0;
                    if (!activeOnly) return [3 /*break*/, 4];
                    return [4 /*yield*/, sms_service_1.smsService.getActiveProvider()];
                case 3:
                    providers = _a.sent();
                    providers = providers ? [providers] : [];
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, sms_service_1.smsService.getProviders()];
                case 5:
                    providers = _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        data: providers,
                        metadata: {
                            timestamp: new Date().toISOString(),
                            request_id: "providers_".concat(Date.now()),
                            count: Array.isArray(providers) ? providers.length : (providers ? 1 : 0)
                        }
                    }, { status: 200 })];
                case 7:
                    error_1 = _a.sent();
                    console.error('SMS providers fetch error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: {
                                code: 'INTERNAL_ERROR',
                                message: 'Failed to fetch SMS providers',
                                details: process.env.NODE_ENV === 'development' ? error_1 : undefined
                            }
                        }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create or update SMS provider
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, validatedData, provider, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: 'UNAUTHORIZED',
                                    message: 'Authentication required'
                                }
                            }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _a.sent();
                    validatedData = ProviderConfigSchema.parse(body);
                    return [4 /*yield*/, sms_service_1.smsService.upsertProvider(validatedData)];
                case 4:
                    provider = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: provider,
                            metadata: {
                                timestamp: new Date().toISOString(),
                                request_id: "provider_upsert_".concat(Date.now()),
                                user_id: session.user.id
                            }
                        }, { status: 200 })];
                case 5:
                    error_2 = _a.sent();
                    console.error('SMS provider upsert error:', error_2);
                    // Handle validation errors
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: 'VALIDATION_ERROR',
                                    message: 'Invalid provider configuration',
                                    details: error_2.errors
                                }
                            }, { status: 400 })];
                    }
                    // Handle SMS service errors
                    if (error_2 && typeof error_2 === 'object' && 'code' in error_2) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: error_2.code,
                                    message: error_2.message || 'Provider configuration error',
                                    details: process.env.NODE_ENV === 'development' ? error_2 : undefined
                                }
                            }, { status: 400 })];
                    }
                    // Handle unknown errors
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: {
                                code: 'INTERNAL_ERROR',
                                message: 'Internal server error',
                                details: process.env.NODE_ENV === 'development' ? error_2 : undefined
                            }
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Test SMS provider connection
 */
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, provider_id, test_phone, testResult, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: 'UNAUTHORIZED',
                                    message: 'Authentication required'
                                }
                            }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _a.sent();
                    provider_id = body.provider_id, test_phone = body.test_phone;
                    if (!provider_id || !test_phone) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: 'VALIDATION_ERROR',
                                    message: 'Provider ID and test phone number are required'
                                }
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, sms_service_1.smsService.testProvider(provider_id, test_phone)];
                case 4:
                    testResult = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                provider_id: provider_id,
                                test_phone: test_phone,
                                connection_successful: testResult,
                                test_timestamp: new Date().toISOString()
                            },
                            metadata: {
                                timestamp: new Date().toISOString(),
                                request_id: "provider_test_".concat(Date.now()),
                                user_id: session.user.id
                            }
                        }, { status: 200 })];
                case 5:
                    error_3 = _a.sent();
                    console.error('SMS provider test error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: {
                                code: 'TEST_ERROR',
                                message: 'Failed to test SMS provider connection',
                                details: process.env.NODE_ENV === 'development' ? error_3 : undefined
                            }
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Delete SMS provider
 */
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, providerId, activeMessages, error, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: 'UNAUTHORIZED',
                                    message: 'Authentication required'
                                }
                            }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    providerId = searchParams.get('id');
                    if (!providerId) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: 'VALIDATION_ERROR',
                                    message: 'Provider ID is required'
                                }
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('sms_messages')
                            .select('id')
                            .eq('provider_id', providerId)
                            .in('status', ['queued', 'sending'])
                            .limit(1)];
                case 3:
                    activeMessages = (_a.sent()).data;
                    if (activeMessages && activeMessages.length > 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: {
                                    code: 'PROVIDER_IN_USE',
                                    message: 'Cannot delete provider with active messages'
                                }
                            }, { status: 409 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('sms_providers')
                            .delete()
                            .eq('id', providerId)];
                case 4:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                provider_id: providerId,
                                deleted_at: new Date().toISOString()
                            },
                            metadata: {
                                timestamp: new Date().toISOString(),
                                request_id: "provider_delete_".concat(Date.now()),
                                user_id: session.user.id
                            }
                        }, { status: 200 })];
                case 5:
                    error_4 = _a.sent();
                    console.error('SMS provider delete error:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: {
                                code: 'DELETE_ERROR',
                                message: 'Failed to delete SMS provider',
                                details: process.env.NODE_ENV === 'development' ? error_4 : undefined
                            }
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
