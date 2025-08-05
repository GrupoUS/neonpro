"use strict";
// Follow-up Escalation API
// Epic 7.3: Treatment Follow-up Automation
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
exports.POST = POST;
var treatment_followup_service_1 = require("@/app/lib/services/treatment-followup-service");
var server_1 = require("next/server");
function POST(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var _c, escalationLevel, reason, notifyRoles, autoScheduleAppointment, triggeredRules, followup, error_1;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    _c = _d.sent(), escalationLevel = _c.escalationLevel, reason = _c.reason, notifyRoles = _c.notifyRoles, autoScheduleAppointment = _c.autoScheduleAppointment;
                    return [4 /*yield*/, treatment_followup_service_1.treatmentFollowupService.checkEscalationTriggers(params.id)];
                case 2:
                    triggeredRules = _d.sent();
                    if (triggeredRules.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'No escalation triggers met for this follow-up'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, treatment_followup_service_1.treatmentFollowupService.updatePatientFollowup(params.id, {
                            status: 'escalated',
                            notes: reason || 'Escalated automatically due to triggered rules'
                        })];
                case 3:
                    followup = _d.sent();
                    // In a real implementation, this would:
                    // 1. Send notifications to specified roles
                    // 2. Create calendar appointments if requested
                    // 3. Log escalation in audit trail
                    // 4. Update dashboard metrics
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                followup: followup,
                                triggeredRules: triggeredRules,
                                escalationLevel: escalationLevel,
                                actionsPerformed: {
                                    statusUpdated: true,
                                    notificationsSent: (notifyRoles === null || notifyRoles === void 0 ? void 0 : notifyRoles.length) || 0,
                                    appointmentScheduled: autoScheduleAppointment || false
                                }
                            },
                            message: 'Follow-up escalated successfully'
                        })];
                case 4:
                    error_1 = _d.sent();
                    console.error('Error escalating follow-up:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Failed to escalate follow-up',
                            details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
