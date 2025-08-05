"use strict";
// API Routes for Reorder Alert Management
// Story 6.2: Automated Reorder Alerts + Threshold Management
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
var intelligent_threshold_service_1 = require("@/app/lib/services/intelligent-threshold-service");
var server_1 = require("next/server");
var zod_1 = require("zod");
var thresholdService = new intelligent_threshold_service_1.IntelligentThresholdService();
var queryParamsSchema = zod_1.z.object({
    clinic_id: zod_1.z.string(),
    start_date: zod_1.z.string().optional(),
    end_date: zod_1.z.string().optional(),
});
var alertStatsSchema = zod_1.z.object({
    clinic_id: zod_1.z.string(),
    start_date: zod_1.z.string().optional().transform(function (str) { return str ? new Date(str) : undefined; }),
    end_date: zod_1.z.string().optional().transform(function (str) { return str ? new Date(str) : undefined; }),
});
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var url, params, _a, clinic_id, start_date, end_date, dateRange, stats, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    url = new URL(request.url);
                    params = Object.fromEntries(url.searchParams.entries());
                    _a = alertStatsSchema.parse(params), clinic_id = _a.clinic_id, start_date = _a.start_date, end_date = _a.end_date;
                    dateRange = (start_date && end_date) ? { start: start_date, end: end_date } : undefined;
                    return [4 /*yield*/, thresholdService.getAlertStats(clinic_id, dateRange)];
                case 1:
                    stats = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: stats,
                            message: 'Alert statistics retrieved successfully',
                        })];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error fetching alert stats:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Invalid parameters',
                                details: error_1.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Failed to fetch alert statistics',
                            details: error_1.message
                        }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
