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
exports.GET = GET;
var server_1 = require("next/server");
var scheduling_optimizer_1 = require("../../../../../lib/ai/scheduling-optimizer");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var requestData, patient_id, treatment_type, preferred_date_range, duration_minutes, startDate, endDate, optimizer, optimizedSlots, error_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    requestData = _e.sent();
                    patient_id = requestData.patient_id, treatment_type = requestData.treatment_type, preferred_date_range = requestData.preferred_date_range, duration_minutes = requestData.duration_minutes;
                    if (!patient_id || !treatment_type || !preferred_date_range || !duration_minutes) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Missing required fields: patient_id, treatment_type, preferred_date_range, duration_minutes' }, { status: 400 })];
                    }
                    startDate = new Date(preferred_date_range.start);
                    endDate = new Date(preferred_date_range.end);
                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid date format in preferred_date_range' }, { status: 400 })];
                    }
                    if (startDate >= endDate) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 })];
                    }
                    // Validate duration
                    if (duration_minutes < 15 || duration_minutes > 480) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Duration must be between 15 and 480 minutes' }, { status: 400 })];
                    }
                    optimizer = new scheduling_optimizer_1.AISchedulingOptimizer();
                    return [4 /*yield*/, optimizer.suggestOptimalSlots({
                            patient_id: patient_id,
                            treatment_type: treatment_type,
                            preferred_date_range: preferred_date_range,
                            staff_preference: requestData.staff_preference,
                            priority: requestData.priority || 'normal',
                            duration_minutes: duration_minutes
                        })];
                case 2:
                    optimizedSlots = _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                suggested_slots: optimizedSlots,
                                optimization_metadata: {
                                    total_slots_analyzed: optimizedSlots.length * 2, // Estimated
                                    ai_confidence_range: {
                                        min: Math.min.apply(Math, optimizedSlots.map(function (s) { return s.confidence_score; })),
                                        max: Math.max.apply(Math, optimizedSlots.map(function (s) { return s.confidence_score; })),
                                        average: optimizedSlots.reduce(function (sum, s) { return sum + s.confidence_score; }, 0) / optimizedSlots.length
                                    },
                                    patient_preference_influence: ((_b = (_a = optimizedSlots[0]) === null || _a === void 0 ? void 0 : _a.optimization_factors) === null || _b === void 0 ? void 0 : _b.patient_preference_score) || 0,
                                    staff_efficiency_influence: ((_d = (_c = optimizedSlots[0]) === null || _c === void 0 ? void 0 : _c.optimization_factors) === null || _d === void 0 ? void 0 : _d.staff_efficiency_score) || 0
                                },
                                recommendations: [
                                    'AI suggests booking the first suggested slot for optimal patient satisfaction',
                                    'Alternative slots provided maintain high confidence scores',
                                    'Scheduling during suggested times maximizes clinic efficiency'
                                ]
                            }
                        })];
                case 3:
                    error_1 = _e.sent();
                    console.error('AI scheduling optimization error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to generate optimal scheduling suggestions',
                            details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, patientId, optimizer, preferenceData, error_2;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    searchParams = new URL(request.url).searchParams;
                    patientId = searchParams.get('patient_id');
                    if (!patientId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'patient_id parameter is required' }, { status: 400 })];
                    }
                    optimizer = new scheduling_optimizer_1.AISchedulingOptimizer();
                    return [4 /*yield*/, optimizer.getPatientPreferenceData(patientId)];
                case 1:
                    preferenceData = _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                patient_preferences: preferenceData.preferences,
                                confidence_score: preferenceData.confidence_score,
                                data_points_used: preferenceData.data_points_count,
                                last_updated: preferenceData.last_updated,
                                ai_insights: {
                                    preferred_time_slots: ((_a = preferenceData.insights) === null || _a === void 0 ? void 0 : _a.preferred_times) || [],
                                    preferred_staff: ((_b = preferenceData.insights) === null || _b === void 0 ? void 0 : _b.preferred_staff) || [],
                                    optimization_opportunities: ((_c = preferenceData.insights) === null || _c === void 0 ? void 0 : _c.opportunities) || []
                                }
                            }
                        })];
                case 2:
                    error_2 = _d.sent();
                    console.error('Get patient preferences error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to retrieve patient scheduling preferences',
                            details: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
