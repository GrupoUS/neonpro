"use strict";
// app/api/profile/mapping/route.ts
// VIBECODE V1.0 - Professional Profile Email Mapping API
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-23
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
// Configuration for email domain to professional role mapping
var EMAIL_DOMAIN_MAPPINGS = [
    // Clinic domains - admin access
    { domain: 'neonpro.clinic', default_role: 'admin', auto_approve: true },
    { domain: 'clinica.com.br', default_role: 'admin', auto_approve: true },
    // Medical domains - doctor access
    { domain: 'crm.org.br', default_role: 'doctor', auto_approve: true },
    { domain: 'cfm.org.br', default_role: 'doctor', auto_approve: true },
    // Healthcare domains - staff access
    { domain: 'saude.gov.br', default_role: 'staff', department: 'Healthcare', auto_approve: true },
    { domain: 'sus.br', default_role: 'staff', department: 'Public Health', auto_approve: true },
    // Nursing domains
    { domain: 'coren.gov.br', default_role: 'nurse', auto_approve: true },
    // Default for other emails
    { domain: '*', default_role: 'professional', auto_approve: false }
];
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, body, email, force_mapping, _a, user, userError, emailDomain_1, mapping, _b, existingProfile, profileError, profileUpdate, profile, _c, updatedProfile, updateError, _d, newProfile, createError, error_1;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _f.sent();
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _f.sent();
                    email = body.email, force_mapping = body.force_mapping;
                    if (!email) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Email required', message: 'Email is required for mapping' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    _a = _f.sent(), user = _a.data.user, userError = _a.error;
                    if (userError || !user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized', message: 'User not authenticated' }, { status: 401 })];
                    }
                    emailDomain_1 = (_e = email.split('@')[1]) === null || _e === void 0 ? void 0 : _e.toLowerCase();
                    if (!emailDomain_1) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid email', message: 'Could not extract domain from email' }, { status: 400 })];
                    }
                    mapping = EMAIL_DOMAIN_MAPPINGS.find(function (m) { return m.domain === emailDomain_1; });
                    // Fallback to default mapping if no specific domain found
                    if (!mapping) {
                        mapping = EMAIL_DOMAIN_MAPPINGS.find(function (m) { return m.domain === '*'; });
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('*')
                            .eq('email', email)
                            .single()];
                case 4:
                    _b = _f.sent(), existingProfile = _b.data, profileError = _b.error;
                    if (profileError && profileError.code !== 'PGRST116') {
                        console.error('Profile lookup error:', profileError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Profile lookup failed', message: profileError.message }, { status: 500 })];
                    }
                    // If profile exists and force_mapping is not true, return existing mapping
                    if (existingProfile && !force_mapping) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                success: true,
                                message: 'Profile mapping already exists',
                                mapping: {
                                    email: existingProfile.email,
                                    role: existingProfile.role,
                                    department: existingProfile.department,
                                    professional_title: existingProfile.professional_title,
                                    mapping_source: 'existing'
                                },
                                auto_approved: true
                            })];
                    }
                    profileUpdate = {
                        role: mapping.default_role,
                        department: mapping.department || (existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.department),
                        profile_sync_status: mapping.auto_approve ? 'synced' : 'pending',
                        updated_at: new Date().toISOString()
                    };
                    profile = void 0;
                    if (!existingProfile) return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .update(profileUpdate)
                            .eq('id', user.id)
                            .select()
                            .single()];
                case 5:
                    _c = _f.sent(), updatedProfile = _c.data, updateError = _c.error;
                    if (updateError) {
                        console.error('Profile update error:', updateError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Mapping failed', message: updateError.message }, { status: 500 })];
                    }
                    profile = updatedProfile;
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, supabase
                        .from('profiles')
                        .insert(__assign(__assign({ id: user.id, email: email }, profileUpdate), { created_at: new Date().toISOString() }))
                        .select()
                        .single()];
                case 7:
                    _d = _f.sent(), newProfile = _d.data, createError = _d.error;
                    if (createError) {
                        console.error('Profile creation error:', createError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Mapping failed', message: createError.message }, { status: 500 })];
                    }
                    profile = newProfile;
                    _f.label = 8;
                case 8: 
                // Log mapping event for audit
                return [4 /*yield*/, supabase
                        .from('audit_logs')
                        .insert({
                        user_id: user.id,
                        event_type: 'profile_mapping',
                        event_data: {
                            email: email,
                            domain: emailDomain_1,
                            mapped_role: mapping.default_role,
                            mapping_source: 'email_domain',
                            auto_approved: mapping.auto_approve
                        },
                        created_at: new Date().toISOString()
                    })];
                case 9:
                    // Log mapping event for audit
                    _f.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            message: "Profile mapped to ".concat(mapping.default_role, " role").concat(mapping.auto_approve ? ' and auto-approved' : ', pending approval'),
                            mapping: {
                                email: email,
                                role: mapping.default_role,
                                department: mapping.department,
                                domain: emailDomain_1,
                                mapping_source: 'email_domain',
                                auto_approved: mapping.auto_approve
                            },
                            profile: profile
                        })];
                case 10:
                    error_1 = _f.sent();
                    console.error('Profile mapping API error:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error', message: 'Profile mapping failed' }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, searchParams, email, emailDomain_2, mapping, existingProfile, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _b.sent();
                    searchParams = new URL(request.url).searchParams;
                    email = searchParams.get('email');
                    if (!email) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Email required', message: 'Email parameter is required' }, { status: 400 })];
                    }
                    emailDomain_2 = (_a = email.split('@')[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    mapping = EMAIL_DOMAIN_MAPPINGS.find(function (m) { return m.domain === emailDomain_2; });
                    if (!mapping) {
                        mapping = EMAIL_DOMAIN_MAPPINGS.find(function (m) { return m.domain === '*'; });
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('email, role, department, professional_title, profile_sync_status')
                            .eq('email', email)
                            .single()];
                case 2:
                    existingProfile = (_b.sent()).data;
                    return [2 /*return*/, server_2.NextResponse.json({
                            email: email,
                            domain: emailDomain_2,
                            suggested_mapping: {
                                role: mapping.default_role,
                                department: mapping.department,
                                auto_approve: mapping.auto_approve
                            },
                            existing_profile: existingProfile || null,
                            available_roles: ['admin', 'doctor', 'nurse', 'staff', 'professional']
                        })];
                case 3:
                    error_2 = _b.sent();
                    console.error('Profile mapping GET error:', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error', message: 'Could not fetch mapping information' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
