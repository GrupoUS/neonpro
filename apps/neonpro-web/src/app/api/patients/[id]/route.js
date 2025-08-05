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
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var server_1 = require("next/server");
/**
 * Get Patient Profile
 * Retrieves comprehensive patient profile data
 */
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, patientId, _c, session, sessionError, userRole, _d, profile, profileError, error_1;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 5, , 6]);
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, params];
                case 1:
                    patientId = (_e.sent()).id;
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    _c = _e.sent(), session = _c.data.session, sessionError = _c.error;
                    if (sessionError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_roles')
                            .select('role')
                            .eq('user_id', session.user.id)
                            .single()];
                case 3:
                    userRole = (_e.sent()).data;
                    if (!userRole || !['admin', 'doctor', 'nurse'].includes(userRole.role)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('patient_profiles_extended')
                            .select("\n        *,\n        patient_documents(*),\n        emergency_contacts(*),\n        patient_care_team(*)\n      ")
                            .eq('patient_id', patientId)
                            .single()];
                case 4:
                    _d = _e.sent(), profile = _d.data, profileError = _d.error;
                    if (profileError) {
                        console.error('Error fetching patient profile:', profileError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch patient profile' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            profile: profile,
                            message: 'Patient profile retrieved successfully'
                        })];
                case 5:
                    error_1 = _e.sent();
                    console.error('Error in GET /api/patients/[id]/profile:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update Patient Profile
 * Updates patient profile data
 */
function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, patientId_1, body, _c, session, sessionError, userRole, demographics, medical_history, chronic_conditions, medications, allergies, bmi, blood_type, emergency_contacts, care_preferences, _d, updatedProfile, updateError, contactsError, error_2;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 9, , 10]);
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, params];
                case 1:
                    patientId_1 = (_e.sent()).id;
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _e.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    _c = _e.sent(), session = _c.data.session, sessionError = _c.error;
                    if (sessionError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_roles')
                            .select('role')
                            .eq('user_id', session.user.id)
                            .single()];
                case 4:
                    userRole = (_e.sent()).data;
                    if (!userRole || !['admin', 'doctor', 'nurse'].includes(userRole.role)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })];
                    }
                    demographics = body.demographics, medical_history = body.medical_history, chronic_conditions = body.chronic_conditions, medications = body.medications, allergies = body.allergies, bmi = body.bmi, blood_type = body.blood_type, emergency_contacts = body.emergency_contacts, care_preferences = body.care_preferences;
                    return [4 /*yield*/, supabase
                            .from('patient_profiles_extended')
                            .update({
                            demographics: demographics || {},
                            medical_history: medical_history || [],
                            chronic_conditions: chronic_conditions || [],
                            current_medications: medications || [],
                            allergies: allergies || [],
                            bmi: bmi,
                            blood_type: blood_type,
                            care_preferences: care_preferences || {},
                            updated_at: new Date().toISOString()
                        })
                            .eq('patient_id', patientId_1)
                            .select()
                            .single()];
                case 5:
                    _d = _e.sent(), updatedProfile = _d.data, updateError = _d.error;
                    if (updateError) {
                        console.error('Error updating patient profile:', updateError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update patient profile' }, { status: 500 })];
                    }
                    if (!(emergency_contacts && emergency_contacts.length > 0)) return [3 /*break*/, 8];
                    // Delete existing contacts
                    return [4 /*yield*/, supabase
                            .from('emergency_contacts')
                            .delete()
                            .eq('patient_id', patientId_1)];
                case 6:
                    // Delete existing contacts
                    _e.sent();
                    return [4 /*yield*/, supabase
                            .from('emergency_contacts')
                            .insert(emergency_contacts.map(function (contact) { return (__assign({ patient_id: patientId_1 }, contact)); }))];
                case 7:
                    contactsError = (_e.sent()).error;
                    if (contactsError) {
                        console.error('Error updating emergency contacts:', contactsError);
                    }
                    _e.label = 8;
                case 8: return [2 /*return*/, server_1.NextResponse.json({
                        profile: updatedProfile,
                        message: 'Patient profile updated successfully'
                    })];
                case 9:
                    error_2 = _e.sent();
                    console.error('Error in PUT /api/patients/[id]/profile:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
