"use strict";
// Story 11.2: No-Show Prediction Interventions API
// Record and track intervention effectiveness
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
var no_show_prediction_1 = require("@/app/lib/validations/no-show-prediction");
var server_2 = require("@/lib/supabase/server");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, query, page, limit, offset, _a, interventions, error, error_1;
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
                    query = supabase
                        .from('no_show_interventions')
                        .select("\n        *,\n        patient:patients(id, name, email, phone)\n      ");
                    // Apply filters
                    if (searchParams.get('prediction_id')) {
                        query = query.eq('prediction_id', searchParams.get('prediction_id'));
                    }
                    if (searchParams.get('patient_id')) {
                        query = query.eq('patient_id', searchParams.get('patient_id'));
                    }
                    if (searchParams.get('type')) {
                        query = query.eq('intervention_type', searchParams.get('type'));
                    }
                    if (searchParams.get('status')) {
                        query = query.eq('status', searchParams.get('status'));
                    }
                    page = parseInt(searchParams.get('page') || '1');
                    limit = parseInt(searchParams.get('limit') || '20');
                    offset = (page - 1) * limit;
                    query = query
                        .order('created_at', { ascending: false })
                        .range(offset, offset + limit - 1);
                    return [4 /*yield*/, query];
                case 3:
                    _a = _b.sent(), interventions = _a.data, error = _a.error;
                    if (error) {
                        console.error('Database error:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch interventions' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            interventions: interventions || [],
                            pagination: {
                                page: page,
                                limit: limit,
                                total: (interventions === null || interventions === void 0 ? void 0 : interventions.length) || 0
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
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, validatedData, _a, intervention, error, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _b.sent();
                    validatedData = no_show_prediction_1.InterventionCreateSchema.parse(body);
                    return [4 /*yield*/, supabase
                            .from('no_show_interventions')
                            .insert(__assign(__assign({}, validatedData), { created_by: session.user.id, status: 'pending' }))
                            .select()
                            .single()];
                case 4:
                    _a = _b.sent(), intervention = _a.data, error = _a.error;
                    if (error) {
                        console.error('Database error:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to create intervention' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json(intervention, { status: 201 })];
                case 5:
                    error_2 = _b.sent();
                    console.error('API error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
