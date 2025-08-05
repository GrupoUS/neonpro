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
exports.POST = POST;
var server_1 = require("next/server");
var supabase_js_1 = require("@supabase/supabase-js");
var zod_1 = require("zod");
var XLSX = require("xlsx");
// Initialize Supabase client
var supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// Validation schemas
var exportRequestSchema = zod_1.z.object({
    type: zod_1.z.enum(['analytics', 'trials', 'subscriptions', 'users', 'campaigns']),
    format: zod_1.z.enum(['csv', 'xlsx', 'json']).default('csv'),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    columns: zod_1.z.array(zod_1.z.string()).optional()
});
/**
 * POST /api/export - Export data in various formats
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userRole, subscriptionStatus, body, validatedRequest_1, data, filename, _a, fileBuffer, contentType, fileExtension, csvContent, jsonContent, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 15, , 16]);
                    userId = request.headers.get('x-user-id');
                    userRole = request.headers.get('x-user-role');
                    subscriptionStatus = request.headers.get('x-user-subscription');
                    if (!userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    // Check subscription permissions for export functionality
                    if (subscriptionStatus === 'free') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Export functionality requires a paid subscription' }, { status: 403 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    validatedRequest_1 = exportRequestSchema.parse(body);
                    data = void 0;
                    filename = void 0;
                    _a = validatedRequest_1.type;
                    switch (_a) {
                        case 'analytics': return [3 /*break*/, 2];
                        case 'trials': return [3 /*break*/, 4];
                        case 'subscriptions': return [3 /*break*/, 6];
                        case 'users': return [3 /*break*/, 8];
                        case 'campaigns': return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 12];
                case 2: return [4 /*yield*/, getAnalyticsData(validatedRequest_1, userId, userRole)];
                case 3:
                    data = _b.sent();
                    filename = "analytics_export_".concat(new Date().toISOString().split('T')[0]);
                    return [3 /*break*/, 13];
                case 4: return [4 /*yield*/, getTrialsData(validatedRequest_1, userId, userRole)];
                case 5:
                    data = _b.sent();
                    filename = "trials_export_".concat(new Date().toISOString().split('T')[0]);
                    return [3 /*break*/, 13];
                case 6: return [4 /*yield*/, getSubscriptionsData(validatedRequest_1, userId, userRole)];
                case 7:
                    data = _b.sent();
                    filename = "subscriptions_export_".concat(new Date().toISOString().split('T')[0]);
                    return [3 /*break*/, 13];
                case 8:
                    if (userRole !== 'admin') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Admin access required for user data export' }, { status: 403 })];
                    }
                    return [4 /*yield*/, getUsersData(validatedRequest_1)];
                case 9:
                    data = _b.sent();
                    filename = "users_export_".concat(new Date().toISOString().split('T')[0]);
                    return [3 /*break*/, 13];
                case 10:
                    if (userRole !== 'admin') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Admin access required for campaign data export' }, { status: 403 })];
                    }
                    return [4 /*yield*/, getCampaignsData(validatedRequest_1)];
                case 11:
                    data = _b.sent();
                    filename = "campaigns_export_".concat(new Date().toISOString().split('T')[0]);
                    return [3 /*break*/, 13];
                case 12: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid export type' }, { status: 400 })];
                case 13:
                    if (!data || data.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'No data found for export' }, { status: 404 })];
                    }
                    // Filter columns if specified
                    if (validatedRequest_1.columns && validatedRequest_1.columns.length > 0) {
                        data = data.map(function (row) {
                            var filteredRow = {};
                            validatedRequest_1.columns.forEach(function (col) {
                                if (row.hasOwnProperty(col)) {
                                    filteredRow[col] = row[col];
                                }
                            });
                            return filteredRow;
                        });
                    }
                    fileBuffer = void 0;
                    contentType = void 0;
                    fileExtension = void 0;
                    switch (validatedRequest_1.format) {
                        case 'csv':
                            csvContent = convertToCSV(data);
                            fileBuffer = Buffer.from(csvContent, 'utf-8');
                            contentType = 'text/csv';
                            fileExtension = 'csv';
                            break;
                        case 'xlsx':
                            fileBuffer = convertToXLSX(data);
                            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                            fileExtension = 'xlsx';
                            break;
                        case 'json':
                            jsonContent = JSON.stringify(data, null, 2);
                            fileBuffer = Buffer.from(jsonContent, 'utf-8');
                            contentType = 'application/json';
                            fileExtension = 'json';
                            break;
                        default:
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })];
                    }
                    // Log export activity
                    return [4 /*yield*/, supabase
                            .from('analytics_events')
                            .insert({
                            event_type: 'data_exported',
                            user_id: userId,
                            properties: {
                                export_type: validatedRequest_1.type,
                                format: validatedRequest_1.format,
                                record_count: data.length,
                                filename: "".concat(filename, ".").concat(fileExtension)
                            }
                        })
                        // Return file as download
                    ];
                case 14:
                    // Log export activity
                    _b.sent();
                    // Return file as download
                    return [2 /*return*/, new server_1.NextResponse(fileBuffer, {
                            status: 200,
                            headers: {
                                'Content-Type': contentType,
                                'Content-Disposition': "attachment; filename=\"".concat(filename, ".").concat(fileExtension, "\""),
                                'Content-Length': fileBuffer.length.toString()
                            }
                        })];
                case 15:
                    error_1 = _b.sent();
                    console.error('Export API error:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid export request',
                                details: error_1.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 16: return [2 /*return*/];
            }
        });
    });
}
// Helper functions for data retrieval
function getAnalyticsData(request, userId, userRole) {
    return __awaiter(this, void 0, void 0, function () {
        var startDate, endDate, filters, query, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startDate = request.startDate, endDate = request.endDate, filters = request.filters;
                    query = supabase
                        .from('analytics_events')
                        .select('*');
                    // Apply user filtering for non-admin users
                    if (userRole !== 'admin') {
                        query = query.eq('user_id', userId);
                    }
                    // Apply date filters
                    if (startDate) {
                        query = query.gte('timestamp', startDate);
                    }
                    if (endDate) {
                        query = query.lte('timestamp', endDate);
                    }
                    // Apply additional filters
                    if (filters) {
                        Object.entries(filters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            query = query.eq(key, value);
                        });
                    }
                    return [4 /*yield*/, query.order('timestamp', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data || []];
            }
        });
    });
}
function getTrialsData(request, userId, userRole) {
    return __awaiter(this, void 0, void 0, function () {
        var startDate, endDate, filters, query, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startDate = request.startDate, endDate = request.endDate, filters = request.filters;
                    query = supabase
                        .from('trials')
                        .select("\n      *,\n      campaigns(name, description),\n      users(email, created_at)\n    ");
                    // Apply user filtering for non-admin users
                    if (userRole !== 'admin') {
                        query = query.eq('user_id', userId);
                    }
                    // Apply date filters
                    if (startDate) {
                        query = query.gte('created_at', startDate);
                    }
                    if (endDate) {
                        query = query.lte('created_at', endDate);
                    }
                    // Apply additional filters
                    if (filters) {
                        Object.entries(filters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            query = query.eq(key, value);
                        });
                    }
                    return [4 /*yield*/, query.order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data || []];
            }
        });
    });
}
function getSubscriptionsData(request, userId, userRole) {
    return __awaiter(this, void 0, void 0, function () {
        var startDate, endDate, filters, query, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startDate = request.startDate, endDate = request.endDate, filters = request.filters;
                    query = supabase
                        .from('subscriptions')
                        .select("\n      *,\n      users(email, created_at)\n    ");
                    // Apply user filtering for non-admin users
                    if (userRole !== 'admin') {
                        query = query.eq('user_id', userId);
                    }
                    // Apply date filters
                    if (startDate) {
                        query = query.gte('created_at', startDate);
                    }
                    if (endDate) {
                        query = query.lte('created_at', endDate);
                    }
                    // Apply additional filters
                    if (filters) {
                        Object.entries(filters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            query = query.eq(key, value);
                        });
                    }
                    return [4 /*yield*/, query.order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data || []];
            }
        });
    });
}
function getUsersData(request) {
    return __awaiter(this, void 0, void 0, function () {
        var startDate, endDate, filters, query, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startDate = request.startDate, endDate = request.endDate, filters = request.filters;
                    query = supabase
                        .from('users')
                        .select("\n      id,\n      email,\n      role,\n      subscription_status,\n      created_at,\n      updated_at,\n      last_login_at\n    ");
                    // Apply date filters
                    if (startDate) {
                        query = query.gte('created_at', startDate);
                    }
                    if (endDate) {
                        query = query.lte('created_at', endDate);
                    }
                    // Apply additional filters
                    if (filters) {
                        Object.entries(filters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            query = query.eq(key, value);
                        });
                    }
                    return [4 /*yield*/, query.order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data || []];
            }
        });
    });
}
function getCampaignsData(request) {
    return __awaiter(this, void 0, void 0, function () {
        var startDate, endDate, filters, query, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startDate = request.startDate, endDate = request.endDate, filters = request.filters;
                    query = supabase
                        .from('campaigns')
                        .select("\n      *,\n      trials(count)\n    ");
                    // Apply date filters
                    if (startDate) {
                        query = query.gte('created_at', startDate);
                    }
                    if (endDate) {
                        query = query.lte('created_at', endDate);
                    }
                    // Apply additional filters
                    if (filters) {
                        Object.entries(filters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            query = query.eq(key, value);
                        });
                    }
                    return [4 /*yield*/, query.order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data || []];
            }
        });
    });
}
// Helper functions for file conversion
function convertToCSV(data) {
    if (data.length === 0)
        return '';
    var headers = Object.keys(data[0]);
    var csvRows = [];
    // Add headers
    csvRows.push(headers.join(','));
    var _loop_1 = function (row) {
        var values = headers.map(function (header) {
            var value = row[header];
            // Handle nested objects and arrays
            if (typeof value === 'object' && value !== null) {
                return "\"".concat(JSON.stringify(value).replace(/"/g, '""'), "\"");
            }
            // Escape commas and quotes in strings
            if (typeof value === 'string') {
                return "\"".concat(value.replace(/"/g, '""'), "\"");
            }
            return value;
        });
        csvRows.push(values.join(','));
    };
    // Add data rows
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var row = data_1[_i];
        _loop_1(row);
    }
    return csvRows.join('\n');
}
function convertToXLSX(data) {
    var worksheet = XLSX.utils.json_to_sheet(data);
    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
    // Generate buffer
    var buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
}
