"use strict";
// KPI Alerts Management API
// Description: API endpoints for KPI alert management and acknowledgment
// Author: Dev Agent
// Date: 2025-01-26
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
var alertFiltersSchema = zod_1.z.object({
    alert_type: zod_1.z.enum(['critical', 'warning', 'info']).optional(),
    is_acknowledged: zod_1.z.boolean().optional(),
    kpi_category: zod_1.z.string().optional(),
    created_after: zod_1.z.string().optional(),
    created_before: zod_1.z.string().optional(),
    limit: zod_1.z.number().int().min(1).max(1000).default(50),
    offset: zod_1.z.number().int().min(0).default(0),
});
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, userError, searchParams, filters, validatedFilters, query, _b, alerts, alertsError, countQuery, count, formattedAlerts, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _c.sent(), user = _a.data.user, userError = _a.error;
                    if (userError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    filters = {
                        alert_type: searchParams.get('alert_type'),
                        is_acknowledged: searchParams.get('is_acknowledged') === 'true' ? true :
                            searchParams.get('is_acknowledged') === 'false' ? false : undefined,
                        kpi_category: searchParams.get('kpi_category'),
                        created_after: searchParams.get('created_after'),
                        created_before: searchParams.get('created_before'),
                        limit: parseInt(searchParams.get('limit') || '50'),
                        offset: parseInt(searchParams.get('offset') || '0'),
                    };
                    validatedFilters = alertFiltersSchema.parse(filters);
                    query = supabase
                        .from('kpi_alerts')
                        .select("\n        *,\n        financial_kpis(kpi_name, kpi_category)\n      ")
                        .order('created_at', { ascending: false })
                        .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1);
                    // Apply filters
                    if (validatedFilters.alert_type) {
                        query = query.eq('alert_type', validatedFilters.alert_type);
                    }
                    if (validatedFilters.is_acknowledged !== undefined) {
                        query = query.eq('is_acknowledged', validatedFilters.is_acknowledged);
                    }
                    if (validatedFilters.kpi_category) {
                        query = query.eq('financial_kpis.kpi_category', validatedFilters.kpi_category);
                    }
                    if (validatedFilters.created_after) {
                        query = query.gte('created_at', validatedFilters.created_after);
                    }
                    if (validatedFilters.created_before) {
                        query = query.lte('created_at', validatedFilters.created_before);
                    }
                    return [4 /*yield*/, query];
                case 3:
                    _b = _c.sent(), alerts = _b.data, alertsError = _b.error;
                    if (alertsError) {
                        throw new Error("Database error: ".concat(alertsError.message));
                    }
                    countQuery = supabase
                        .from('kpi_alerts')
                        .select('*', { count: 'exact', head: true });
                    // Apply same filters to count query
                    if (validatedFilters.alert_type) {
                        countQuery = countQuery.eq('alert_type', validatedFilters.alert_type);
                    }
                    if (validatedFilters.is_acknowledged !== undefined) {
                        countQuery = countQuery.eq('is_acknowledged', validatedFilters.is_acknowledged);
                    }
                    if (validatedFilters.created_after) {
                        countQuery = countQuery.gte('created_at', validatedFilters.created_after);
                    }
                    if (validatedFilters.created_before) {
                        countQuery = countQuery.lte('created_at', validatedFilters.created_before);
                    }
                    return [4 /*yield*/, countQuery];
                case 4:
                    count = (_c.sent()).count;
                    formattedAlerts = (alerts === null || alerts === void 0 ? void 0 : alerts.map(function (alert) {
                        var _a, _b;
                        return ({
                            id: alert.id,
                            kpi_id: alert.kpi_id,
                            kpi_name: (_a = alert.financial_kpis) === null || _a === void 0 ? void 0 : _a.kpi_name,
                            kpi_category: (_b = alert.financial_kpis) === null || _b === void 0 ? void 0 : _b.kpi_category,
                            alert_type: alert.alert_type,
                            alert_message: alert.alert_message,
                            threshold_value: alert.threshold_value,
                            current_value: alert.current_value,
                            variance_percent: alert.variance_percent,
                            is_acknowledged: alert.is_acknowledged,
                            acknowledged_at: alert.acknowledged_at,
                            acknowledged_by: alert.acknowledged_by,
                            created_at: alert.created_at,
                            metadata: alert.metadata,
                        });
                    })) || [];
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: formattedAlerts,
                            pagination: {
                                total: count || 0,
                                limit: validatedFilters.limit,
                                offset: validatedFilters.offset,
                                has_more: (count || 0) > (validatedFilters.offset + validatedFilters.limit),
                            },
                            filters: validatedFilters,
                        })];
                case 5:
                    error_1 = _c.sent();
                    console.error('Error retrieving alerts:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Invalid request parameters',
                                details: error_1.errors,
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Internal server error',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown error',
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, userError, body, alertSchema, validatedData, _b, newAlert, createError, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _c.sent(), user = _a.data.user, userError = _a.error;
                    if (userError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _c.sent();
                    alertSchema = zod_1.z.object({
                        kpi_id: zod_1.z.string(),
                        alert_type: zod_1.z.enum(['critical', 'warning', 'info']),
                        alert_message: zod_1.z.string(),
                        threshold_value: zod_1.z.number().optional(),
                        current_value: zod_1.z.number(),
                        variance_percent: zod_1.z.number().optional(),
                        metadata: zod_1.z.record(zod_1.z.any()).optional(),
                    });
                    validatedData = alertSchema.parse(body);
                    return [4 /*yield*/, supabase
                            .from('kpi_alerts')
                            .insert([{
                                kpi_id: validatedData.kpi_id,
                                alert_type: validatedData.alert_type,
                                alert_message: validatedData.alert_message,
                                threshold_value: validatedData.threshold_value,
                                current_value: validatedData.current_value,
                                variance_percent: validatedData.variance_percent,
                                is_acknowledged: false,
                                metadata: validatedData.metadata,
                            }])
                            .select()
                            .single()];
                case 4:
                    _b = _c.sent(), newAlert = _b.data, createError = _b.error;
                    if (createError) {
                        throw new Error("Database error: ".concat(createError.message));
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: newAlert,
                            message: 'Alert created successfully',
                        })];
                case 5:
                    error_2 = _c.sent();
                    console.error('Error creating alert:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Invalid request data',
                                details: error_2.errors,
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Internal server error',
                            message: error_2 instanceof Error ? error_2.message : 'Unknown error',
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
