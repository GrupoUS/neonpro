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
exports.PATCH = PATCH;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var patient_profile_1 = require("@/lib/validations/patient-profile");
var zod_1 = require("zod");
// GET - Retrieve patient profile
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, id, _d, patient, error, error_1;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()
                        // Verify authentication
                    ];
                case 1:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _e.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    id = (_e.sent()).id;
                    return [4 /*yield*/, supabase
                            .from('patients')
                            .select("\n        *,\n        patient_profiles (*),\n        emergency_contacts (*),\n        lgpd_consents (*),\n        contact_preferences (*)\n      ")
                            .eq('id', id)
                            .single()];
                case 4:
                    _d = _e.sent(), patient = _d.data, error = _d.error;
                    if (error) {
                        console.error('Database error:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Patient not found' }, { status: 404 })];
                    }
                    // Log data access for LGPD audit
                    return [4 /*yield*/, supabase
                            .from('lgpd_audit_log')
                            .insert({
                            patient_id: id,
                            action: 'read',
                            data_fields: ['profile', 'emergency_contacts', 'preferences'],
                            legal_basis: 'Consentimento do titular (Art. 7°, I, LGPD)',
                            user_agent: request.headers.get('user-agent'),
                            ip_address: request.ip || 'unknown',
                            timestamp: new Date().toISOString()
                        })];
                case 5:
                    // Log data access for LGPD audit
                    _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ data: patient })];
                case 6:
                    error_1 = _e.sent();
                    console.error('Profile GET error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
} // PUT - Update patient profile
function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, body, validatedData, id, _d, updatedPatient, updateError, error_2;
        var _e, _f;
        var params = _b.params;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()
                        // Verify authentication
                    ];
                case 1:
                    supabase = _g.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _g.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()
                        // Validate LGPD consent
                    ];
                case 3:
                    body = _g.sent();
                    // Validate LGPD consent
                    if (!((_e = body.lgpdConsent) === null || _e === void 0 ? void 0 : _e.dataProcessingConsent) || !((_f = body.lgpdConsent) === null || _f === void 0 ? void 0 : _f.sensitiveDataConsent)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'LGPD consent required for processing health data' }, { status: 400 })];
                    }
                    validatedData = patient_profile_1.PatientProfileUpdateSchema.parse(body);
                    return [4 /*yield*/, params];
                case 4:
                    id = (_g.sent()).id;
                    return [4 /*yield*/, supabase.rpc('update_patient_profile_with_lgpd_audit', {
                            p_patient_id: id,
                            p_profile_data: validatedData,
                            p_user_agent: request.headers.get('user-agent') || 'unknown',
                            p_ip_address: request.ip || 'unknown'
                        })];
                case 5:
                    _d = _g.sent(), updatedPatient = _d.data, updateError = _d.error;
                    if (updateError) {
                        console.error('Update error:', updateError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update patient profile' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            message: 'Patient profile updated successfully',
                            data: updatedPatient
                        })];
                case 6:
                    error_2 = _g.sent();
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Validation error', details: error_2.errors }, { status: 400 })];
                    }
                    console.error('Profile PUT error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// PATCH - Partial update patient profile
function PATCH(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, body, id, _d, patient, fetchError, _e, updatedPatient, updateError, error_3;
        var params = _b.params;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, server_2.createClient)()
                        // Verify authentication
                    ];
                case 1:
                    supabase = _f.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _f.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _f.sent();
                    return [4 /*yield*/, params];
                case 4:
                    id = (_f.sent()).id;
                    return [4 /*yield*/, supabase
                            .from('patients')
                            .select('id, clinic_id')
                            .eq('id', id)
                            .single()];
                case 5:
                    _d = _f.sent(), patient = _d.data, fetchError = _d.error;
                    if (fetchError || !patient) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Patient not found' }, { status: 404 })];
                    }
                    // Log data modification for LGPD audit
                    return [4 /*yield*/, supabase
                            .from('lgpd_audit_log')
                            .insert({
                            patient_id: id,
                            action: 'update',
                            data_fields: Object.keys(body),
                            legal_basis: 'Legítimo interesse (Art. 7°, IX, LGPD)',
                            user_agent: request.headers.get('user-agent'),
                            ip_address: request.ip || 'unknown',
                            timestamp: new Date().toISOString()
                        })
                        // Perform partial update
                    ];
                case 6:
                    // Log data modification for LGPD audit
                    _f.sent();
                    return [4 /*yield*/, supabase
                            .from('patients')
                            .update(__assign(__assign({}, body), { updated_at: new Date().toISOString() }))
                            .eq('id', id)
                            .select()
                            .single()];
                case 7:
                    _e = _f.sent(), updatedPatient = _e.data, updateError = _e.error;
                    if (updateError) {
                        console.error('Update error:', updateError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update patient profile' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            message: 'Patient profile updated successfully',
                            data: updatedPatient
                        })];
                case 8:
                    error_3 = _f.sent();
                    console.error('Profile PATCH error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
