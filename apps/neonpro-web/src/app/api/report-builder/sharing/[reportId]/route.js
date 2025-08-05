"use strict";
// Report Sharing API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)
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
var report_builder_1 = require("@/app/lib/services/report-builder");
var report_builder_2 = require("@/app/lib/validations/report-builder");
var server_1 = require("next/server");
var reportService = new report_builder_1.ReportBuilderService();
// GET /api/report-builder/sharing/[reportId] - Get sharing info for specific report
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var reportId, sharing, error_1;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    reportId = params.reportId;
                    if (!reportId) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Report ID is required'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, reportService.getReportSharing(reportId)];
                case 1:
                    sharing = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: sharing
                        })];
                case 2:
                    error_1 = _c.sent();
                    console.error('Error fetching report sharing:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : 'Failed to fetch report sharing'
                        }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// POST /api/report-builder/sharing/[reportId] - Create new sharing link for report
function POST(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var reportId, body, validationResult, sharing, error_2;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    reportId = params.reportId;
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _c.sent();
                    if (!reportId) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Report ID is required'
                            }, { status: 400 })];
                    }
                    validationResult = report_builder_2.CreateReportShareRequest.safeParse(body);
                    if (!validationResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Invalid request data',
                                details: validationResult.error.errors
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, reportService.createReportShare(reportId, validationResult.data)];
                case 2:
                    sharing = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: sharing
                        }, { status: 201 })];
                case 3:
                    error_2 = _c.sent();
                    console.error('Error creating report sharing:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: error_2 instanceof Error ? error_2.message : 'Failed to create report sharing'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
