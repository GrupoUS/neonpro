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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var inventory_reports_service_1 = require("@/app/lib/services/inventory-reports-service");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, validationResult, parameters, reportResult, csvData, error_1;
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
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _a.sent();
                    validationResult = validateGenerateReportRequest(body);
                    if (!validationResult.isValid) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid request parameters',
                                details: validationResult.errors
                            }, { status: 400 })];
                    }
                    parameters = {
                        type: body.type,
                        filters: body.filters || {},
                        format: body.format || 'json',
                    };
                    return [4 /*yield*/, (0, inventory_reports_service_1.createinventoryReportsService)().generateReport(parameters)];
                case 4:
                    reportResult = _a.sent();
                    // Handle different output formats
                    if (parameters.format === 'csv') {
                        csvData = convertToCSV(reportResult.data, parameters.type);
                        return [2 /*return*/, new server_1.NextResponse(csvData, {
                                headers: {
                                    'Content-Type': 'text/csv',
                                    'Content-Disposition': "attachment; filename=\"".concat(parameters.type, "_report_").concat(new Date().getTime(), ".csv\""),
                                },
                            })];
                    }
                    else if (parameters.format === 'excel') {
                        // Excel export would go here
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Excel format not yet implemented' }, { status: 501 })];
                    }
                    // Return JSON response
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            report: reportResult,
                        })];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error generating inventory report:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to generate report',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, reportType, filters, parameters, reportResult, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_a.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    reportType = searchParams.get('type');
                    if (!reportType) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Report type is required' }, { status: 400 })];
                    }
                    filters = {};
                    if (searchParams.get('start_date')) {
                        filters.start_date = searchParams.get('start_date');
                    }
                    if (searchParams.get('end_date')) {
                        filters.end_date = searchParams.get('end_date');
                    }
                    if (searchParams.get('clinic_id')) {
                        filters.clinic_id = searchParams.get('clinic_id');
                    }
                    if (searchParams.get('room_id')) {
                        filters.room_id = searchParams.get('room_id');
                    }
                    if (searchParams.get('category')) {
                        filters.category = searchParams.get('category');
                    }
                    if (searchParams.get('item_id')) {
                        filters.item_id = searchParams.get('item_id');
                    }
                    if (searchParams.get('movement_type')) {
                        filters.movement_type = searchParams.get('movement_type');
                    }
                    if (searchParams.get('include_zero_stock')) {
                        filters.include_zero_stock = searchParams.get('include_zero_stock') === 'true';
                    }
                    parameters = {
                        type: reportType,
                        filters: filters,
                        format: searchParams.get('format') || 'json',
                    };
                    return [4 /*yield*/, (0, inventory_reports_service_1.createinventoryReportsService)().generateReport(parameters)];
                case 3:
                    reportResult = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            report: reportResult,
                        })];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error fetching inventory report:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to fetch report',
                            message: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function validateGenerateReportRequest(body) {
    var _a, _b, _c, _d, _e;
    var errors = [];
    // Check required fields
    if (!body.type) {
        errors.push('Report type is required');
    }
    // Validate report type
    var validTypes = [
        'stock_movement',
        'stock_valuation',
        'low_stock',
        'expiring_items',
        'transfers',
        'location_performance'
    ];
    if (body.type && !validTypes.includes(body.type)) {
        errors.push("Invalid report type. Must be one of: ".concat(validTypes.join(', ')));
    }
    // Validate format if provided
    if (body.format) {
        var validFormats = ['json', 'csv', 'excel'];
        if (!validFormats.includes(body.format)) {
            errors.push("Invalid format. Must be one of: ".concat(validFormats.join(', ')));
        }
    }
    // Validate filters if provided
    if (body.filters && typeof body.filters !== 'object') {
        errors.push('Filters must be an object');
    }
    // Validate date formats in filters
    if (((_a = body.filters) === null || _a === void 0 ? void 0 : _a.start_date) && !isValidDate(body.filters.start_date)) {
        errors.push('Invalid start_date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)');
    }
    if (((_b = body.filters) === null || _b === void 0 ? void 0 : _b.end_date) && !isValidDate(body.filters.end_date)) {
        errors.push('Invalid end_date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)');
    }
    // Validate UUID formats for IDs
    if (((_c = body.filters) === null || _c === void 0 ? void 0 : _c.clinic_id) && !isValidUUID(body.filters.clinic_id)) {
        errors.push('Invalid clinic_id format. Must be a valid UUID');
    }
    if (((_d = body.filters) === null || _d === void 0 ? void 0 : _d.room_id) && !isValidUUID(body.filters.room_id)) {
        errors.push('Invalid room_id format. Must be a valid UUID');
    }
    if (((_e = body.filters) === null || _e === void 0 ? void 0 : _e.item_id) && !isValidUUID(body.filters.item_id)) {
        errors.push('Invalid item_id format. Must be a valid UUID');
    }
    return {
        isValid: errors.length === 0,
        errors: errors,
    };
}
function isValidDate(dateString) {
    var date = new Date(dateString);
    return !isNaN(date.getTime());
}
function isValidUUID(uuid) {
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
// =============================================================================
// CSV CONVERSION HELPERS
// =============================================================================
function convertToCSV(data, reportType) {
    if (!data || data.length === 0) {
        return 'No data available\n';
    }
    // Get headers from first object
    var headers = Object.keys(data[0]);
    // Create CSV content
    var csvContent = __spreadArray([
        // Header row
        headers.join(',')
    ], data.map(function (row) {
        return headers.map(function (header) {
            var value = row[header];
            // Handle values that might contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return "\"".concat(value.replace(/"/g, '""'), "\"");
            }
            return value !== null && value !== undefined ? value.toString() : '';
        }).join(',');
    }), true).join('\n');
    return csvContent;
}
