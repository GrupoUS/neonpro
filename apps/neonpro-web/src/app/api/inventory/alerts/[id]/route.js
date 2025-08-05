"use strict";
// =====================================================================================
// NeonPro Individual Alert Actions API
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================
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
exports.PATCH = PATCH;
exports.DELETE = DELETE;
var server_1 = require("@/app/utils/supabase/server");
var server_2 = require("next/server");
// =====================================================================================
// MARK ALERT AS READ
// =====================================================================================
function PATCH(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, user, alertId, _c, alert_1, error, error_1;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_d.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    alertId = params.id;
                    return [4 /*yield*/, supabase
                            .from('inventory_alerts')
                            .update({
                            is_read: true,
                            read_at: new Date().toISOString(),
                            read_by: user.id
                        })
                            .eq('id', alertId)
                            .select()
                            .single()];
                case 3:
                    _c = _d.sent(), alert_1 = _c.data, error = _c.error;
                    if (error) {
                        console.error('Error marking alert as read:', error);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to mark alert as read' }, { status: 500 })];
                    }
                    if (!alert_1) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Alert not found' }, { status: 404 })];
                    }
                    return [2 /*return*/, server_2.NextResponse.json({
                            message: 'Alert marked as read',
                            alert: {
                                id: alert_1.id,
                                is_read: alert_1.is_read,
                                read_at: alert_1.read_at
                            }
                        })];
                case 4:
                    error_1 = _d.sent();
                    console.error('Error in alert PATCH API:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// =====================================================================================
// DELETE ALERT
// =====================================================================================
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, user, alertId, error, error_2;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_c.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    alertId = params.id;
                    return [4 /*yield*/, supabase
                            .from('inventory_alerts')
                            .delete()
                            .eq('id', alertId)];
                case 3:
                    error = (_c.sent()).error;
                    if (error) {
                        console.error('Error deleting alert:', error);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_2.NextResponse.json({
                            message: 'Alert deleted successfully'
                        })];
                case 4:
                    error_2 = _c.sent();
                    console.error('Error in alert DELETE API:', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
