"use strict";
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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("@/app/utils/supabase/server");
var patient_insights_1 = require("@/lib/ai/patient-insights");
var profile_manager_1 = require("@/lib/patients/profile-manager");
var server_2 = require("next/server");
var zod_1 = require("zod");
// Initialize services
var profileManager = new profile_manager_1.ProfileManager();
var patientInsights = new patient_insights_1.PatientInsightsEngine();
// Validation schema for updates
var UpdateProfileSchema = zod_1.z.object({
    demographics: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        address: zod_1.z.string().optional()
    }).optional(),
    medical_history: zod_1.z.object({
        allergies: zod_1.z.array(zod_1.z.string()).optional(),
        conditions: zod_1.z.array(zod_1.z.string()).optional(),
        medications: zod_1.z.array(zod_1.z.string()).optional(),
        surgeries: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
    preferences: zod_1.z.object({
        language: zod_1.z.string().optional(),
        timezone: zod_1.z.string().optional(),
        communication_method: zod_1.z.enum(['email', 'sms', 'phone', 'in_app']).optional(),
        appointment_reminders: zod_1.z.boolean().optional()
    }).optional(),
    emergency_contact: zod_1.z.object({
        name: zod_1.z.string().optional(),
        relationship: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional()
    }).optional()
});
/**
 * GET /api/patients/profile/[id] - Get specific patient profile
 */
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, patientId, session, profile, riskAssessment, behaviorAnalysis, recommendations, profileWithInsights, insightsError_1, error_1;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, params];
                case 2:
                    patientId = (_c.sent()).id;
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    session = (_c.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, profileManager.getPatientProfile(patientId)];
                case 4:
                    profile = _c.sent();
                    if (!profile) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Patient not found' }, { status: 404 })];
                    }
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 9, , 10]);
                    return [4 /*yield*/, patientInsights.generateRiskAssessment(patientId)];
                case 6:
                    riskAssessment = _c.sent();
                    return [4 /*yield*/, patientInsights.analyzeBehaviorPatterns(patientId)];
                case 7:
                    behaviorAnalysis = _c.sent();
                    return [4 /*yield*/, patientInsights.generateTreatmentRecommendations(patientId)];
                case 8:
                    recommendations = _c.sent();
                    profileWithInsights = __assign(__assign({}, profile), { ai_insights: {
                            risk_assessment: riskAssessment,
                            behavior_analysis: behaviorAnalysis,
                            recommendations: recommendations.slice(0, 3) // Top 3 recommendations
                        } });
                    return [2 /*return*/, server_2.NextResponse.json(profileWithInsights)];
                case 9:
                    insightsError_1 = _c.sent();
                    console.error('Error generating AI insights:', insightsError_1);
                    // Return profile without insights if AI fails
                    return [2 /*return*/, server_2.NextResponse.json(profile)];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_1 = _c.sent();
                    console.error('Error fetching patient profile:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to fetch patient profile' }, { status: 500 })];
                case 12: return [2 /*return*/];
            }
        });
    });
}
/**
 * PUT /api/patients/profile/[id] - Update patient profile
 */
function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, patientId, session, body, validation, existingProfile, updatedProfile, riskAssessment, behaviorAnalysis, profileWithInsights, insightsError_2, error_2;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, params];
                case 2:
                    patientId = (_c.sent()).id;
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    session = (_c.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 4:
                    body = _c.sent();
                    validation = UpdateProfileSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid request data', details: validation.error.issues }, { status: 400 })];
                    }
                    return [4 /*yield*/, profileManager.getPatientProfile(patientId)];
                case 5:
                    existingProfile = _c.sent();
                    if (!existingProfile) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Patient not found' }, { status: 404 })];
                    }
                    return [4 /*yield*/, profileManager.updatePatientProfile(patientId, validation.data)];
                case 6:
                    updatedProfile = _c.sent();
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 10, , 11]);
                    return [4 /*yield*/, patientInsights.generateRiskAssessment(patientId)];
                case 8:
                    riskAssessment = _c.sent();
                    return [4 /*yield*/, patientInsights.analyzeBehaviorPatterns(patientId)];
                case 9:
                    behaviorAnalysis = _c.sent();
                    profileWithInsights = __assign(__assign({}, updatedProfile), { ai_insights: {
                            risk_assessment: riskAssessment,
                            behavior_analysis: behaviorAnalysis,
                            last_updated: new Date().toISOString()
                        } });
                    return [2 /*return*/, server_2.NextResponse.json(profileWithInsights)];
                case 10:
                    insightsError_2 = _c.sent();
                    console.error('Error generating updated AI insights:', insightsError_2);
                    // Return updated profile without insights if AI fails
                    return [2 /*return*/, server_2.NextResponse.json(updatedProfile)];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_2 = _c.sent();
                    console.error('Error updating patient profile:', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to update patient profile' }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * DELETE /api/patients/profile/[id] - Archive patient profile
 */
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, patientId, session, existingProfile, error_3;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, params];
                case 2:
                    patientId = (_c.sent()).id;
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    session = (_c.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, profileManager.getPatientProfile(patientId)];
                case 4:
                    existingProfile = _c.sent();
                    if (!existingProfile) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Patient not found' }, { status: 404 })];
                    }
                    // Archive patient (soft delete)
                    return [4 /*yield*/, profileManager.archivePatient(patientId)];
                case 5:
                    // Archive patient (soft delete)
                    _c.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            message: 'Patient profile archived successfully',
                            archived_at: new Date().toISOString()
                        })];
                case 6:
                    error_3 = _c.sent();
                    console.error('Error archiving patient profile:', error_3);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to archive patient profile' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
