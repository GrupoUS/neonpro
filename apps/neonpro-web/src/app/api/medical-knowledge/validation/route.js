"use strict";
// Evidence Validation API Endpoints
// Story 9.5: API endpoints for evidence validation and recommendation analysis
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
exports.PUT = PUT;
var medical_knowledge_base_1 = require("@/app/lib/services/medical-knowledge-base");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var service = new medical_knowledge_base_1.MedicalKnowledgeBaseService();
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, action, _a, recommendationId, _b, validations, error, _c, pending, pendingError, _d, stats, statsError, statistics, evidenceQuery, limit, _e, evidence, evidenceError, error_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 13, , 14]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _f.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_f.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    action = searchParams.get('action');
                    _a = action;
                    switch (_a) {
                        case 'validation-history': return [3 /*break*/, 3];
                        case 'pending-validations': return [3 /*break*/, 5];
                        case 'validation-stats': return [3 /*break*/, 7];
                        case 'evidence-sources': return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 11];
                case 3:
                    recommendationId = searchParams.get('recommendation_id');
                    if (!recommendationId) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: 'Recommendation ID required'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('validation_results')
                            .select('*')
                            .eq('recommendation_id', recommendationId)
                            .order('validation_date', { ascending: false })];
                case 4:
                    _b = _f.sent(), validations = _b.data, error = _b.error;
                    if (error) {
                        throw new Error("Failed to fetch validation history: ".concat(error.message));
                    }
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: validations })];
                case 5: return [4 /*yield*/, supabase
                        .from('validation_results')
                        .select('*')
                        .eq('validation_status', 'requires_review')
                        .order('validation_date', { ascending: true })];
                case 6:
                    _c = _f.sent(), pending = _c.data, pendingError = _c.error;
                    if (pendingError) {
                        throw new Error("Failed to fetch pending validations: ".concat(pendingError.message));
                    }
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: pending })];
                case 7: return [4 /*yield*/, supabase
                        .from('validation_results')
                        .select('validation_status, automated')
                        .order('validation_date', { ascending: false })
                        .limit(1000)];
                case 8:
                    _d = _f.sent(), stats = _d.data, statsError = _d.error;
                    if (statsError) {
                        throw new Error("Failed to fetch validation stats: ".concat(statsError.message));
                    }
                    statistics = {
                        total_validations: (stats === null || stats === void 0 ? void 0 : stats.length) || 0,
                        automated_validations: (stats === null || stats === void 0 ? void 0 : stats.filter(function (v) { return v.automated; }).length) || 0,
                        manual_validations: (stats === null || stats === void 0 ? void 0 : stats.filter(function (v) { return !v.automated; }).length) || 0,
                        validated: (stats === null || stats === void 0 ? void 0 : stats.filter(function (v) { return v.validation_status === 'validated'; }).length) || 0,
                        conflicted: (stats === null || stats === void 0 ? void 0 : stats.filter(function (v) { return v.validation_status === 'conflicted'; }).length) || 0,
                        unsupported: (stats === null || stats === void 0 ? void 0 : stats.filter(function (v) { return v.validation_status === 'unsupported'; }).length) || 0,
                        pending_review: (stats === null || stats === void 0 ? void 0 : stats.filter(function (v) { return v.validation_status === 'requires_review'; }).length) || 0,
                    };
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: statistics })];
                case 9:
                    evidenceQuery = searchParams.get('query') || '';
                    limit = parseInt(searchParams.get('limit') || '50');
                    return [4 /*yield*/, supabase
                            .from('medical_knowledge')
                            .select('id, title, evidence_level, source_id, knowledge_sources(source_name)')
                            .textSearch('title', evidenceQuery)
                            .limit(limit)];
                case 10:
                    _e = _f.sent(), evidence = _e.data, evidenceError = _e.error;
                    if (evidenceError) {
                        throw new Error("Failed to fetch evidence sources: ".concat(evidenceError.message));
                    }
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: evidence })];
                case 11: return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })];
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_1 = _f.sent();
                    console.error('Evidence Validation API Error:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error', details: error_1 instanceof Error ? error_1.message : 'Unknown error' }, { status: 500 })];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, action, data, _a, validationResult, recommendations, batchResults, validation_id, reviewer_decision, reviewer_notes, confidence_score, _b, updatedValidation, updateError, evidence_id, feedback_type, feedback_rating, feedback_notes, feedbackData, evidence_ids, synthesis_title, synthesis_summary, confidence_assessment, synthesisData, synthesis, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 15, , 16]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_c.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _c.sent();
                    action = body.action, data = body.data;
                    _a = action;
                    switch (_a) {
                        case 'validate-recommendation': return [3 /*break*/, 4];
                        case 'batch-validate': return [3 /*break*/, 6];
                        case 'manual-validation': return [3 /*break*/, 8];
                        case 'evidence-feedback': return [3 /*break*/, 10];
                        case 'create-evidence-synthesis': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 4: return [4 /*yield*/, service.validateRecommendation(data)];
                case 5:
                    validationResult = _c.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: validationResult })];
                case 6:
                    recommendations = data.recommendations;
                    if (!Array.isArray(recommendations)) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: 'Recommendations must be an array'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, Promise.all(recommendations.map(function (rec) { return service.validateRecommendation(rec); }))];
                case 7:
                    batchResults = _c.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: batchResults })];
                case 8:
                    validation_id = data.validation_id, reviewer_decision = data.reviewer_decision, reviewer_notes = data.reviewer_notes, confidence_score = data.confidence_score;
                    if (!validation_id || !reviewer_decision) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: 'Validation ID and reviewer decision required'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('validation_results')
                            .update({
                            validation_status: reviewer_decision,
                            validation_notes: reviewer_notes || '',
                            confidence_score: confidence_score || 0.8,
                            automated: false,
                            reviewer_id: session.user.id,
                        })
                            .eq('id', validation_id)
                            .select()
                            .single()];
                case 9:
                    _b = _c.sent(), updatedValidation = _b.data, updateError = _b.error;
                    if (updateError) {
                        throw new Error("Failed to update validation: ".concat(updateError.message));
                    }
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: updatedValidation })];
                case 10:
                    evidence_id = data.evidence_id, feedback_type = data.feedback_type, feedback_rating = data.feedback_rating, feedback_notes = data.feedback_notes;
                    if (!evidence_id || !feedback_type) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: 'Evidence ID and feedback type required'
                            }, { status: 400 })];
                    }
                    feedbackData = {
                        evidence_id: evidence_id,
                        feedback_type: feedback_type,
                        feedback_rating: feedback_rating || 0,
                        feedback_notes: feedback_notes || '',
                        user_id: session.user.id,
                        feedback_date: new Date().toISOString(),
                    };
                    // For now, just return success (in real implementation, store in feedback table)
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            message: 'Feedback recorded successfully',
                            data: feedbackData
                        })];
                case 11:
                    evidence_ids = data.evidence_ids, synthesis_title = data.synthesis_title, synthesis_summary = data.synthesis_summary, confidence_assessment = data.confidence_assessment;
                    if (!evidence_ids || !Array.isArray(evidence_ids) || evidence_ids.length === 0) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: 'Evidence IDs array required'
                            }, { status: 400 })];
                    }
                    synthesisData = {
                        title: synthesis_title || 'Evidence Synthesis',
                        knowledge_type: 'synthesis',
                        summary: synthesis_summary || '',
                        evidence_level: 'Expert Opinion',
                        confidence_score: confidence_assessment || 0.7,
                        source_references: evidence_ids,
                        created_by: session.user.id,
                    };
                    return [4 /*yield*/, service.createMedicalKnowledge(synthesisData)];
                case 12:
                    synthesis = _c.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: synthesis }, { status: 201 })];
                case 13: return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_2 = _c.sent();
                    console.error('Evidence Validation API Error:', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error', details: error_2 instanceof Error ? error_2.message : 'Unknown error' }, { status: 500 })];
                case 16: return [2 /*return*/];
            }
        });
    });
}
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, action, id, data, _a, status_1, notes, confidence_score, _b, updated, error, _c, approved, approveError, rejection_reason, _d, rejected, rejectError, error_3;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_e.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _e.sent();
                    action = body.action, id = body.id, data = body.data;
                    if (!id) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'ID required for update operations' }, { status: 400 })];
                    }
                    _a = action;
                    switch (_a) {
                        case 'update-validation-status': return [3 /*break*/, 4];
                        case 'approve-validation': return [3 /*break*/, 6];
                        case 'reject-validation': return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 10];
                case 4:
                    status_1 = data.status, notes = data.notes, confidence_score = data.confidence_score;
                    return [4 /*yield*/, supabase
                            .from('validation_results')
                            .update({
                            validation_status: status_1,
                            validation_notes: notes || '',
                            confidence_score: confidence_score || 0,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', id)
                            .select()
                            .single()];
                case 5:
                    _b = _e.sent(), updated = _b.data, error = _b.error;
                    if (error) {
                        throw new Error("Failed to update validation: ".concat(error.message));
                    }
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: updated })];
                case 6: return [4 /*yield*/, supabase
                        .from('validation_results')
                        .update({
                        validation_status: 'validated',
                        approved_by: session.user.id,
                        approved_at: new Date().toISOString(),
                    })
                        .eq('id', id)
                        .select()
                        .single()];
                case 7:
                    _c = _e.sent(), approved = _c.data, approveError = _c.error;
                    if (approveError) {
                        throw new Error("Failed to approve validation: ".concat(approveError.message));
                    }
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: approved })];
                case 8:
                    rejection_reason = data.rejection_reason;
                    return [4 /*yield*/, supabase
                            .from('validation_results')
                            .update({
                            validation_status: 'unsupported',
                            validation_notes: rejection_reason || 'Validation rejected',
                            rejected_by: session.user.id,
                            rejected_at: new Date().toISOString(),
                        })
                            .eq('id', id)
                            .select()
                            .single()];
                case 9:
                    _d = _e.sent(), rejected = _d.data, rejectError = _d.error;
                    if (rejectError) {
                        throw new Error("Failed to reject validation: ".concat(rejectError.message));
                    }
                    return [2 /*return*/, server_2.NextResponse.json({ success: true, data: rejected })];
                case 10: return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_3 = _e.sent();
                    console.error('Evidence Validation API Error:', error_3);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error', details: error_3 instanceof Error ? error_3.message : 'Unknown error' }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
