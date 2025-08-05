"use strict";
// Individual Campaign API Routes
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent
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
var marketing_campaign_service_1 = require("@/app/lib/services/marketing-campaign-service");
var campaigns_1 = require("@/app/lib/validations/campaigns");
var server_1 = require("@/app/utils/supabase/server");
var server_2 = require("next/server");
var campaignService = new marketing_campaign_service_1.MarketingCampaignService();
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, session, result, error_1;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_c.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, campaignService.getCampaignById(params.id)];
                case 3:
                    result = _c.sent();
                    if (!result.success) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: result.error }, { status: 404 })];
                    }
                    return [2 /*return*/, server_2.NextResponse.json({
                            campaign: result.data,
                            timestamp: new Date().toISOString()
                        })];
                case 4:
                    error_1 = _c.sent();
                    console.error('Error in campaign GET:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, session, body, validationResult, result, error_2;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
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
                    validationResult = campaigns_1.UpdateCampaignSchema.safeParse(body);
                    if (!validationResult.success) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: 'Validation failed',
                                details: validationResult.error.errors
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, campaignService.updateCampaign(params.id, validationResult.data)];
                case 4:
                    result = _c.sent();
                    if (!result.success) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: result.error }, { status: 500 })];
                    }
                    return [2 /*return*/, server_2.NextResponse.json({
                            message: 'Campaign updated successfully',
                            campaign: result.data,
                            timestamp: new Date().toISOString()
                        })];
                case 5:
                    error_2 = _c.sent();
                    console.error('Error in campaign PUT:', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, session, result, error_3;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_c.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, campaignService.deleteCampaign(params.id)];
                case 3:
                    result = _c.sent();
                    if (!result.success) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: result.error }, { status: 500 })];
                    }
                    return [2 /*return*/, server_2.NextResponse.json({
                            message: 'Campaign deleted successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 4:
                    error_3 = _c.sent();
                    console.error('Error in campaign DELETE:', error_3);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
