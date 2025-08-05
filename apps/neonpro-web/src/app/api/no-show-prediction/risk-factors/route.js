"use strict";
// Story 11.2: No-Show Prediction Risk Factors API
// Analyze and manage patient risk factors
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
var RiskFactorQuerySchema = zod_1.z.object({
    patient_id: zod_1.z.string().uuid().optional(),
    factor_type: zod_1.z.string().optional(),
    min_impact: zod_1.z.coerce.number().min(0).max(1).optional(),
    date_from: zod_1.z.string().optional(),
    date_to: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20)
});
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, queryParams, parsedQuery, query, offset, _a, riskFactors, error, factorTypeSummary, error_1;
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
                    parsedQuery = RiskFactorQuerySchema.parse(queryParams);
                    query = supabase
                        .from('no_show_risk_factors')
                        .select("\n        *,\n        patient:patients(id, name, email, phone),\n        prediction:no_show_predictions(id, risk_score, prediction_date)\n      ");
                    // Apply filters
                    if (parsedQuery.patient_id) {
                        query = query.eq('patient_id', parsedQuery.patient_id);
                    }
                    if (parsedQuery.factor_type) {
                        query = query.eq('factor_type', parsedQuery.factor_type);
                    }
                    if (parsedQuery.min_impact !== undefined) {
                        query = query.gte('impact_weight', parsedQuery.min_impact);
                    }
                    if (parsedQuery.date_from) {
                        query = query.gte('created_at', parsedQuery.date_from);
                    }
                    if (parsedQuery.date_to) {
                        query = query.lte('created_at', parsedQuery.date_to);
                    }
                    offset = (parsedQuery.page - 1) * parsedQuery.limit;
                    query = query
                        .order('created_at', { ascending: false })
                        .range(offset, offset + parsedQuery.limit - 1);
                    return [4 /*yield*/, query];
                case 3:
                    _a = _b.sent(), riskFactors = _a.data, error = _a.error;
                    if (error) {
                        console.error('Database error:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch risk factors' }, { status: 500 })];
                    }
                    factorTypeSummary = (riskFactors === null || riskFactors === void 0 ? void 0 : riskFactors.reduce(function (acc, factor) {
                        var type = factor.factor_type;
                        if (!acc[type]) {
                            acc[type] = {
                                count: 0,
                                total_impact: 0,
                                average_impact: 0
                            };
                        }
                        acc[type].count += 1;
                        acc[type].total_impact += factor.impact_weight;
                        acc[type].average_impact = acc[type].total_impact / acc[type].count;
                        return acc;
                    }, {})) || {};
                    return [2 /*return*/, server_1.NextResponse.json({
                            risk_factors: riskFactors || [],
                            summary: factorTypeSummary,
                            pagination: {
                                page: parsedQuery.page,
                                limit: parsedQuery.limit,
                                total: (riskFactors === null || riskFactors === void 0 ? void 0 : riskFactors.length) || 0
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
