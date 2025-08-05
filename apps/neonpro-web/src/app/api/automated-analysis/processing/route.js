"use strict";
// app/api/automated-analysis/processing/route.ts
// API endpoints for analysis processing and comparison operations
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
var automated_before_after_analysis_1 = require("@/app/lib/services/automated-before-after-analysis");
var automated_before_after_analysis_2 = require("@/app/lib/validations/automated-before-after-analysis");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
// POST /api/automated-analysis/processing - Start analysis processing
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, user, body, action, data, _a, validatedData, progress, validatedData, result, validatedData, results, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_b.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _b.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    _a = action;
                    switch (_a) {
                        case 'start_analysis': return [3 /*break*/, 4];
                        case 'comparison_analysis': return [3 /*break*/, 6];
                        case 'batch_analysis': return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 10];
                case 4:
                    validatedData = automated_before_after_analysis_2.validationSchemas.startAnalysis.parse(data);
                    return [4 /*yield*/, (0, automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().startAnalysis(validatedData)];
                case 5:
                    progress = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: progress,
                            message: 'Analysis started successfully',
                        })];
                case 6:
                    validatedData = automated_before_after_analysis_2.validationSchemas.comparisonAnalysis.parse(data);
                    return [4 /*yield*/, (0, automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().performComparisonAnalysis(validatedData)];
                case 7:
                    result = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: result,
                            message: 'Comparison analysis completed successfully',
                        })];
                case 8:
                    validatedData = automated_before_after_analysis_2.validationSchemas.batchAnalysis.parse(data);
                    return [4 /*yield*/, (0, automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().batchAnalysis(validatedData)];
                case 9:
                    results = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: results,
                            message: 'Batch analysis started successfully',
                        })];
                case 10: return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid action specified' }, { status: 400 })];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _b.sent();
                    console.error('Error processing analysis request:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to process analysis request', details: error_1 instanceof Error ? error_1.message : 'Unknown error' }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// GET /api/automated-analysis/processing - Get analysis progress
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, user, searchParams, sessionId, progress, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_a.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = request.nextUrl.searchParams;
                    sessionId = searchParams.get('session_id');
                    if (!sessionId) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Session ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, automated_before_after_analysis_1.createautomatedBeforeAfterAnalysisService)().getAnalysisProgress(sessionId)];
                case 3:
                    progress = _a.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: progress,
                        })];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error fetching analysis progress:', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to fetch analysis progress', details: error_2 instanceof Error ? error_2.message : 'Unknown error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
