"use strict";
// Executive Dashboard API - Widgets Management
// Story 7.1: Executive Dashboard Implementation
// GET/PUT /api/executive-dashboard/widgets
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
var executive_dashboard_1 = require("@/lib/services/executive-dashboard");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, searchParams, clinicId, professional, widgets, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    clinicId = searchParams.get('clinic_id');
                    if (!clinicId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'clinic_id parameter is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('professionals')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('clinic_id', clinicId)
                            .single()];
                case 3:
                    professional = (_b.sent()).data;
                    if (!professional) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied to this clinic' }, { status: 403 })];
                    }
                    return [4 /*yield*/, executive_dashboard_1.executiveDashboardService.getDashboardWidgets(clinicId, user.id)];
                case 4:
                    widgets = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: widgets,
                            metadata: {
                                clinic_id: clinicId,
                                user_id: user.id,
                                count: widgets.length
                            }
                        })];
                case 5:
                    error_1 = _b.sent();
                    console.error('Widgets API error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to fetch widgets',
                            details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
