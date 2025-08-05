"use strict";
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
/**
 * Marketing Platform Connections API Route
 *
 * Handles CRUD operations for marketing platform connections
 * Manages OAuth tokens, sync configurations, and connection health
 *
 * Research-backed implementation following:
 * - HubSpot OAuth 2.0 flow
 * - Mailchimp API key authentication
 * - RD Station webhook integration
 * - Secure credential storage patterns
 */
// Validation schemas
var createConnectionSchema = zod_1.z.object({
    platform_id: zod_1.z.string().uuid(),
    connection_name: zod_1.z.string().min(1).max(255),
    account_id: zod_1.z.string().max(255).optional(),
    api_key: zod_1.z.string().optional(), // Will be encrypted
    access_token: zod_1.z.string().optional(), // Will be encrypted
    refresh_token: zod_1.z.string().optional(), // Will be encrypted
    token_expires_at: zod_1.z.string().datetime().optional(),
    webhook_url: zod_1.z.string().url().optional(),
    webhook_secret: zod_1.z.string().optional(), // Will be encrypted
    sync_configuration: zod_1.z.record(zod_1.z.any()).default({}),
    data_flow_direction: zod_1.z.enum(['inbound', 'outbound', 'bidirectional']).default('bidirectional')
});
var updateConnectionSchema = zod_1.z.object({
    connection_name: zod_1.z.string().min(1).max(255).optional(),
    sync_configuration: zod_1.z.record(zod_1.z.any()).optional(),
    sync_status: zod_1.z.enum(['active', 'error', 'paused', 'disconnected']).optional(),
    data_flow_direction: zod_1.z.enum(['inbound', 'outbound', 'bidirectional']).optional()
});
/**
 * GET /api/marketing/connections
 *
 * Retrieves all marketing platform connections for the user's clinic
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, profile, searchParams, platformId, syncStatus, query, _a, connections, error, sanitizedConnections, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('clinic_id, role')
                            .eq('id', session.user.id)
                            .single()];
                case 3:
                    profile = (_b.sent()).data;
                    if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Clinic access required' }, { status: 403 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    platformId = searchParams.get('platform_id');
                    syncStatus = searchParams.get('sync_status');
                    query = supabase
                        .from('marketing_platform_connections')
                        .select("\n        id,\n        platform_id,\n        connection_name,\n        account_id,\n        webhook_url,\n        sync_configuration,\n        last_sync_at,\n        sync_status,\n        sync_error_message,\n        connection_health_score,\n        data_flow_direction,\n        created_at,\n        updated_at,\n        marketing_platforms!inner(\n          platform_name,\n          platform_type,\n          features_supported,\n          integration_complexity,\n          documentation_url\n        )\n      ")
                        .eq('clinic_id', profile.clinic_id);
                    // Apply filters
                    if (platformId) {
                        query = query.eq('platform_id', platformId);
                    }
                    if (syncStatus) {
                        query = query.eq('sync_status', syncStatus);
                    }
                    return [4 /*yield*/, query
                            .order('created_at', { ascending: false })];
                case 4:
                    _a = _b.sent(), connections = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching marketing connections:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })];
                    }
                    sanitizedConnections = connections === null || connections === void 0 ? void 0 : connections.map(function (connection) { return (__assign(__assign({}, connection), { has_api_key: !!connection.api_key, has_access_token: !!connection.access_token, has_refresh_token: !!connection.refresh_token, has_webhook_secret: !!connection.webhook_secret, token_valid: connection.token_expires_at ?
                            new Date(connection.token_expires_at) > new Date() : null, api_key: undefined, access_token: undefined, refresh_token: undefined, webhook_secret: undefined })); });
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: sanitizedConnections,
                            total: (connections === null || connections === void 0 ? void 0 : connections.length) || 0
                        })];
                case 5:
                    error_1 = _b.sent();
                    console.error('Marketing connections GET error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * POST /api/marketing/connections
 *
 * Creates a new marketing platform connection
 * Typically called after OAuth flow completion or API key setup
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, profile, body, validatedData, platform, existingConnection, connectionData, _a, newConnection, error, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('clinic_id, role')
                            .eq('id', session.user.id)
                            .single()];
                case 3:
                    profile = (_b.sent()).data;
                    if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Clinic access required' }, { status: 403 })];
                    }
                    // Check if user has permission to create connections
                    if (!['admin', 'owner', 'manager'].includes(profile.role)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 4:
                    body = _b.sent();
                    validatedData = createConnectionSchema.parse(body);
                    return [4 /*yield*/, supabase
                            .from('marketing_platforms')
                            .select('id, platform_name, status')
                            .eq('id', validatedData.platform_id)
                            .single()];
                case 5:
                    platform = (_b.sent()).data;
                    if (!platform || platform.status !== 'active') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid or inactive platform' }, { status: 400 })];
                    }
                    if (!validatedData.account_id) return [3 /*break*/, 7];
                    return [4 /*yield*/, supabase
                            .from('marketing_platform_connections')
                            .select('id')
                            .eq('clinic_id', profile.clinic_id)
                            .eq('platform_id', validatedData.platform_id)
                            .eq('account_id', validatedData.account_id)
                            .single()];
                case 6:
                    existingConnection = (_b.sent()).data;
                    if (existingConnection) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Connection already exists for this account' }, { status: 409 })];
                    }
                    _b.label = 7;
                case 7:
                    connectionData = __assign(__assign({}, validatedData), { clinic_id: profile.clinic_id });
                    return [4 /*yield*/, supabase
                            .from('marketing_platform_connections')
                            .insert([connectionData])
                            .select("\n        id,\n        platform_id,\n        connection_name,\n        account_id,\n        sync_configuration,\n        sync_status,\n        connection_health_score,\n        data_flow_direction,\n        created_at,\n        marketing_platforms!inner(\n          platform_name,\n          platform_type,\n          features_supported\n        )\n      ")
                            .single()];
                case 8:
                    _a = _b.sent(), newConnection = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error creating marketing connection:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to create connection' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: newConnection,
                            message: 'Marketing platform connected successfully'
                        }, { status: 201 })];
                case 9:
                    error_2 = _b.sent();
                    console.error('Marketing connections POST error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid request data', details: error_2.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
