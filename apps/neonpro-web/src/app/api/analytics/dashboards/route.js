"use strict";
// Dashboard Builder API
// Description: API endpoints for dashboard creation and management
// Author: Dev Agent
// Date: 2025-01-26
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
var dashboard_builder_1 = require("@/lib/analytics/dashboard-builder");
var kpi_validations_1 = require("@/lib/validations/kpi-validations");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var createDashboardSchema = zod_1.z.object({
    dashboard_name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    layout: kpi_validations_1.dashboardLayoutSchema,
    widgets: zod_1.z.array(kpi_validations_1.dashboardWidgetSchema),
    filters: zod_1.z.object({
        time_period: zod_1.z.object({
            start_date: zod_1.z.string(),
            end_date: zod_1.z.string(),
            preset: zod_1.z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
        }),
        service_types: zod_1.z.array(zod_1.z.string()).optional(),
        doctor_ids: zod_1.z.array(zod_1.z.string()).optional(),
        location_ids: zod_1.z.array(zod_1.z.string()).optional(),
        payment_methods: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    is_default: zod_1.z.boolean().default(false),
    is_public: zod_1.z.boolean().default(false),
});
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, userError, searchParams, includePublic, isDefault, query, _b, dashboards, error, formattedDashboards, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
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
                    includePublic = searchParams.get('include_public') === 'true';
                    isDefault = searchParams.get('is_default') === 'true';
                    query = supabase
                        .from('dashboard_layouts')
                        .select("\n        *,\n        dashboard_widgets(*)\n      ")
                        .order('updated_at', { ascending: false });
                    if (includePublic) {
                        query = query.or("created_by.eq.".concat(user.id, ",is_public.eq.true"));
                    }
                    else {
                        query = query.eq('created_by', user.id);
                    }
                    if (isDefault) {
                        query = query.eq('is_default', true);
                    }
                    return [4 /*yield*/, query];
                case 3:
                    _b = _c.sent(), dashboards = _b.data, error = _b.error;
                    if (error) {
                        throw new Error("Database error: ".concat(error.message));
                    }
                    formattedDashboards = (dashboards === null || dashboards === void 0 ? void 0 : dashboards.map(function (dashboard) { return ({
                        id: dashboard.id,
                        dashboard_name: dashboard.dashboard_name,
                        description: dashboard.description,
                        layout: dashboard.layout,
                        filters: dashboard.filters,
                        is_default: dashboard.is_default,
                        is_public: dashboard.is_public,
                        created_by: dashboard.created_by,
                        created_at: dashboard.created_at,
                        updated_at: dashboard.updated_at,
                        widgets: dashboard.dashboard_widgets || [],
                    }); })) || [];
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: formattedDashboards,
                            metadata: {
                                total_dashboards: formattedDashboards.length,
                                include_public: includePublic,
                                user_id: user.id,
                            },
                        })];
                case 4:
                    error_1 = _c.sent();
                    console.error('Error retrieving dashboards:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Internal server error',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown error',
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, userError, body, validatedData, dashboardBuilder_1, result_1, _b, completeDashboard, fetchError, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
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
                    validatedData = createDashboardSchema.parse(body);
                    dashboardBuilder_1 = new dashboard_builder_1.DashboardBuilder();
                    return [4 /*yield*/, dashboardBuilder_1.createDashboard({
                            dashboard_name: validatedData.dashboard_name,
                            description: validatedData.description,
                            layout: validatedData.layout,
                            filters: validatedData.filters,
                            is_default: validatedData.is_default,
                            is_public: validatedData.is_public,
                            created_by: user.id,
                        })];
                case 4:
                    result_1 = _c.sent();
                    if (!(validatedData.widgets.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, Promise.all(validatedData.widgets.map(function (widget) {
                            return dashboardBuilder_1.addWidget(result_1.id, __assign(__assign({}, widget), { position: widget.position || { x: 0, y: 0, w: 4, h: 4 } }));
                        }))];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6: return [4 /*yield*/, supabase
                        .from('dashboard_layouts')
                        .select("\n        *,\n        dashboard_widgets(*)\n      ")
                        .eq('id', result_1.id)
                        .single()];
                case 7:
                    _b = _c.sent(), completeDashboard = _b.data, fetchError = _b.error;
                    if (fetchError) {
                        throw new Error("Database error: ".concat(fetchError.message));
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                id: completeDashboard.id,
                                dashboard_name: completeDashboard.dashboard_name,
                                description: completeDashboard.description,
                                layout: completeDashboard.layout,
                                filters: completeDashboard.filters,
                                is_default: completeDashboard.is_default,
                                is_public: completeDashboard.is_public,
                                created_by: completeDashboard.created_by,
                                created_at: completeDashboard.created_at,
                                updated_at: completeDashboard.updated_at,
                                widgets: completeDashboard.dashboard_widgets || [],
                            },
                            message: 'Dashboard created successfully',
                        })];
                case 8:
                    error_2 = _c.sent();
                    console.error('Error creating dashboard:', error_2);
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
                case 9: return [2 /*return*/];
            }
        });
    });
}
