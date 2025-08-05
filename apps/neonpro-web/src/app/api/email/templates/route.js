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
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var email_service_1 = require("@/app/lib/services/email-service");
var email_1 = require("@/app/types/email");
var zod_1 = require("zod");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, session, authError, profile, url, category, isActive, search, emailService, filters, templates, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    _a = _b.sent(), session = _a.data.session, authError = _a.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('clinic_id')
                            .eq('id', session.user.id)
                            .single()];
                case 3:
                    profile = (_b.sent()).data;
                    if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Clinic not found' }, { status: 404 })];
                    }
                    url = new URL(request.url);
                    category = url.searchParams.get('category');
                    isActive = url.searchParams.get('isActive');
                    search = url.searchParams.get('search');
                    emailService = new email_service_1.default(supabase, profile.clinic_id);
                    filters = {};
                    if (category)
                        filters.category = category;
                    if (isActive !== null)
                        filters.isActive = isActive === 'true';
                    if (search)
                        filters.search = search;
                    return [4 /*yield*/, emailService.getTemplates(filters)];
                case 4:
                    templates = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json(templates)];
                case 5:
                    error_1 = _b.sent();
                    console.error('Get email templates error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, session, authError, profile, body, emailService, template, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    _a = _b.sent(), session = _a.data.session, authError = _a.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('clinic_id')
                            .eq('id', session.user.id)
                            .single()];
                case 3:
                    profile = (_b.sent()).data;
                    if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Clinic not found' }, { status: 404 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 4:
                    body = _b.sent();
                    try {
                        email_1.EmailTemplateSchema.parse(body);
                    }
                    catch (validationError) {
                        if (validationError instanceof zod_1.z.ZodError) {
                            return [2 /*return*/, server_1.NextResponse.json({
                                    error: 'Validation failed',
                                    details: validationError.errors.map(function (err) { return ({
                                        field: err.path.join('.'),
                                        message: err.message,
                                    }); })
                                }, { status: 400 })];
                        }
                        throw validationError;
                    }
                    emailService = new email_service_1.default(supabase, profile.clinic_id);
                    return [4 /*yield*/, emailService.createTemplate(__assign(__assign({}, body), { clinicId: profile.clinic_id, createdBy: session.user.id }))];
                case 5:
                    template = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json(template, { status: 201 })];
                case 6:
                    error_2 = _b.sent();
                    console.error('Create email template error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
