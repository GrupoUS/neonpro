"use strict";
// Story 11.2: No-Show Prediction Effectiveness API
// Track and analyze prediction accuracy and intervention effectiveness
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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var EffectivenessQuerySchema = zod_1.z.object({
    clinic_id: zod_1.z.string().uuid().optional(),
    intervention_type: zod_1.z.string().optional(),
    date_from: zod_1.z.string().optional(),
    date_to: zod_1.z.string().optional(),
    min_accuracy: zod_1.z.coerce.number().min(0).max(1).optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20)
});
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, queryParams, parsedQuery, effectivenessQuery, offset, _a, predictions, predictionsError, totalPredictions, correctPredictions, overallAccuracy, interventionEffectiveness, modelPerformance, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    queryParams = Object.fromEntries(searchParams.entries());
                    parsedQuery = EffectivenessQuerySchema.parse(queryParams);
                    effectivenessQuery = supabase
                        .from('no_show_predictions')
                        .select("\n        id,\n        appointment_id,\n        patient_id,\n        risk_score,\n        prediction_date,\n        actual_outcome,\n        confidence_score,\n        model_version,\n        appointments!inner(\n          id,\n          clinic_id,\n          scheduled_at,\n          status\n        ),\n        no_show_interventions(\n          id,\n          intervention_type,\n          status,\n          outcome,\n          effectiveness_score\n        )\n      ")
                        .not('actual_outcome', 'is', null);
                    // Apply filters
                    if (parsedQuery.clinic_id) {
                        effectivenessQuery = effectivenessQuery.eq('appointments.clinic_id', parsedQuery.clinic_id);
                    }
                    if (parsedQuery.date_from) {
                        effectivenessQuery = effectivenessQuery.gte('prediction_date', parsedQuery.date_from);
                    }
                    if (parsedQuery.date_to) {
                        effectivenessQuery = effectivenessQuery.lte('prediction_date', parsedQuery.date_to);
                    }
                    offset = (parsedQuery.page - 1) * parsedQuery.limit;
                    effectivenessQuery = effectivenessQuery
                        .order('prediction_date', { ascending: false })
                        .range(offset, offset + parsedQuery.limit - 1);
                    return [4 /*yield*/, effectivenessQuery];
                case 3:
                    _a = _b.sent(), predictions = _a.data, predictionsError = _a.error;
                    if (predictionsError) {
                        console.error('Database error:', predictionsError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch effectiveness data' }, { status: 500 })];
                    }
                    totalPredictions = (predictions === null || predictions === void 0 ? void 0 : predictions.length) || 0;
                    correctPredictions = (predictions === null || predictions === void 0 ? void 0 : predictions.filter(function (p) {
                        return (p.risk_score > 0.5 && p.actual_outcome === true) ||
                            (p.risk_score <= 0.5 && p.actual_outcome === false);
                    }).length) || 0;
                    overallAccuracy = totalPredictions > 0 ? correctPredictions / totalPredictions : 0;
                    interventionEffectiveness = (predictions === null || predictions === void 0 ? void 0 : predictions.reduce(function (acc, prediction) {
                        var _a;
                        (_a = prediction.no_show_interventions) === null || _a === void 0 ? void 0 : _a.forEach(function (intervention) {
                            var type = intervention.intervention_type;
                            if (!acc[type]) {
                                acc[type] = {
                                    total: 0,
                                    successful: 0,
                                    effectiveness_rate: 0,
                                    average_score: 0,
                                    total_score: 0
                                };
                            }
                            acc[type].total += 1;
                            if (intervention.outcome === 'successful') {
                                acc[type].successful += 1;
                            }
                            acc[type].total_score += intervention.effectiveness_score || 0;
                            acc[type].effectiveness_rate = acc[type].successful / acc[type].total;
                            acc[type].average_score = acc[type].total_score / acc[type].total;
                        });
                        return acc;
                    }, {})) || {};
                    modelPerformance = (predictions === null || predictions === void 0 ? void 0 : predictions.reduce(function (acc, prediction) {
                        var version = prediction.model_version;
                        if (!acc[version]) {
                            acc[version] = {
                                total: 0,
                                correct: 0,
                                accuracy: 0,
                                average_confidence: 0,
                                total_confidence: 0
                            };
                        }
                        acc[version].total += 1;
                        acc[version].total_confidence += prediction.confidence_score;
                        if ((prediction.risk_score > 0.5 && prediction.actual_outcome === true) ||
                            (prediction.risk_score <= 0.5 && prediction.actual_outcome === false)) {
                            acc[version].correct += 1;
                        }
                        acc[version].accuracy = acc[version].correct / acc[version].total;
                        acc[version].average_confidence = acc[version].total_confidence / acc[version].total;
                        return acc;
                    }, {})) || {};
                    return [2 /*return*/, server_1.NextResponse.json({
                            predictions: predictions || [],
                            effectiveness_metrics: {
                                overall_accuracy: overallAccuracy,
                                total_predictions: totalPredictions,
                                correct_predictions: correctPredictions,
                                intervention_effectiveness: interventionEffectiveness,
                                model_performance: modelPerformance
                            },
                            pagination: {
                                page: parsedQuery.page,
                                limit: parsedQuery.limit,
                                total: totalPredictions
                            }
                        })];
                case 4:
                    error_1 = _b.sent();
                    console.error('API error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
