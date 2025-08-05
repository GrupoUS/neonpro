"use strict";
/**
 * AI Prediction Feedback API Route
 * POST /api/ai/feedback
 *
 * Handles feedback submission for AI predictions to improve model accuracy
 */
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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var duration_prediction_1 = require("@/lib/ai/duration-prediction");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, supabase, _a, user, authError, _b, userRole, roleError, aiService, performanceService, prediction, predictionError, accuracyScore, updateError, performanceError_1, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _c.sent();
                    // Validate required fields
                    if (!body.appointmentId || body.actualDuration === undefined || !body.completionStatus) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Missing required fields: appointmentId, actualDuration, completionStatus'
                            }, { status: 400 })];
                    }
                    // Validate actualDuration is positive
                    if (body.actualDuration <= 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'actualDuration must be a positive number'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_roles')
                            .select('role')
                            .eq('user_id', user.id)
                            .in('role', ['admin', 'manager', 'scheduler', 'professional'])
                            .single()];
                case 4:
                    _b = _c.sent(), userRole = _b.data, roleError = _b.error;
                    if (roleError || !userRole) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })];
                    }
                    aiService = new duration_prediction_1.AIDurationPredictionService();
                    performanceService = new duration_prediction_1.ModelPerformanceService();
                    return [4 /*yield*/, aiService.getPredictionForAppointment(body.appointmentId)];
                case 5:
                    prediction = _c.sent();
                    if (!prediction) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'No AI prediction found for this appointment'
                            }, { status: 404 })];
                    }
                    // Update prediction with actual duration
                    return [4 /*yield*/, aiService.updatePredictionWithActual(body.appointmentId, body.actualDuration, body.feedbackNotes)];
                case 6:
                    // Update prediction with actual duration
                    _c.sent();
                    predictionError = prediction.predictedDuration - body.actualDuration;
                    accuracyScore = 1.0 - Math.min(Math.abs(predictionError) / Math.max(prediction.predictedDuration, body.actualDuration), 1.0);
                    if (!(body.manualOverride || body.overrideReason)) return [3 /*break*/, 8];
                    return [4 /*yield*/, supabase
                            .from('prediction_feedback')
                            .update({
                            manual_override: body.manualOverride || false,
                            override_reason: body.overrideReason,
                            completion_status: body.completionStatus,
                            updated_at: new Date().toISOString()
                        })
                            .eq('appointment_id', body.appointmentId)];
                case 7:
                    updateError = (_c.sent()).error;
                    if (updateError) {
                        console.error('Failed to update additional feedback:', updateError);
                        // Don't fail the request for this non-critical update
                    }
                    _c.label = 8;
                case 8:
                    _c.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, performanceService.updateModelPerformance(prediction.modelVersion)];
                case 9:
                    _c.sent();
                    return [3 /*break*/, 11];
                case 10:
                    performanceError_1 = _c.sent();
                    console.error('Failed to update model performance:', performanceError_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        feedback: {
                            accuracyScore: Math.round(accuracyScore * 10000) / 10000, // Round to 4 decimal places
                            predictionError: predictionError,
                            modelVersion: prediction.modelVersion
                        }
                    })];
                case 12:
                    error_1 = _c.sent();
                    console.error('AI Feedback API Error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Internal server error occurred while processing feedback'
                        }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Get feedback for appointment
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, appointmentId, supabase, _a, user, authError, _b, userRole, roleError, _c, data, error, error_2;
        var _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 5, , 6]);
                    searchParams = new URL(request.url).searchParams;
                    appointmentId = searchParams.get('appointmentId');
                    if (!appointmentId) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'appointmentId parameter is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _g.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _g.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_roles')
                            .select('role')
                            .eq('user_id', user.id)
                            .in('role', ['admin', 'manager', 'scheduler', 'professional'])
                            .single()];
                case 3:
                    _b = _g.sent(), userRole = _b.data, roleError = _b.error;
                    if (roleError || !userRole) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('prediction_feedback')
                            .select("\n        id,\n        actual_duration,\n        accuracy_score,\n        prediction_error,\n        feedback_notes,\n        manual_override,\n        override_reason,\n        completion_status,\n        created_at,\n        updated_at,\n        ml_duration_predictions (\n          predicted_duration,\n          confidence_score,\n          model_version\n        )\n      ")
                            .eq('appointment_id', appointmentId)
                            .single()];
                case 4:
                    _c = _g.sent(), data = _c.data, error = _c.error;
                    if (error) {
                        if (error.code === 'PGRST116') {
                            return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'No feedback found for this appointment' }, { status: 404 })];
                        }
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            feedback: {
                                id: data.id,
                                appointmentId: appointmentId,
                                actualDuration: data.actual_duration,
                                predictedDuration: (_d = data.ml_duration_predictions) === null || _d === void 0 ? void 0 : _d.predicted_duration,
                                accuracyScore: data.accuracy_score,
                                predictionError: data.prediction_error,
                                confidenceScore: (_e = data.ml_duration_predictions) === null || _e === void 0 ? void 0 : _e.confidence_score,
                                modelVersion: (_f = data.ml_duration_predictions) === null || _f === void 0 ? void 0 : _f.model_version,
                                feedbackNotes: data.feedback_notes,
                                manualOverride: data.manual_override,
                                overrideReason: data.override_reason,
                                completionStatus: data.completion_status,
                                createdAt: data.created_at,
                                updatedAt: data.updated_at
                            }
                        })];
                case 5:
                    error_2 = _g.sent();
                    console.error('AI Feedback GET API Error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Internal server error occurred while retrieving feedback'
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Handle unsupported HTTP methods
function PUT() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Method not allowed. Use POST to submit feedback or GET to retrieve.' }, { status: 405 })];
        });
    });
}
function DELETE() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Method not allowed. Use POST to submit feedback or GET to retrieve.' }, { status: 405 })];
        });
    });
}
