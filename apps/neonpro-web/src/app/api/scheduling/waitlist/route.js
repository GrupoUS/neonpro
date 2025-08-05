"use strict";
/**
 * Waitlist Management API Route
 * Story 2.2: Intelligent conflict detection and resolution - Waitlist functionality
 *
 * POST /api/scheduling/waitlist
 * Manages patient waitlist for appointment availability
 */
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
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var conflict_resolution_1 = require("@/lib/scheduling/conflict-resolution");
var audit_logger_1 = require("@/lib/auth/audit/audit-logger");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var auditLogger, supabase, _a, session, sessionError, body, waitlistService, result, _b, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    auditLogger = new audit_logger_1.AuditLogger();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 16, , 18]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    _a = _c.sent(), session = _a.data.session, sessionError = _a.error;
                    if (sessionError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 4:
                    body = _c.sent();
                    // Validate required fields
                    if (!body.action || !body.patientId || !body.treatmentType) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Missing required fields: action, patientId, treatmentType' }, { status: 400 })];
                    }
                    waitlistService = new conflict_resolution_1.WaitlistService();
                    result = void 0;
                    _b = body.action;
                    switch (_b) {
                        case 'add': return [3 /*break*/, 5];
                        case 'process': return [3 /*break*/, 8];
                        case 'notify': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 14];
                case 5:
                    // Add patient to waitlist
                    if (!body.preferredDateRange) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'preferredDateRange is required for add action' }, { status: 400 })];
                    }
                    return [4 /*yield*/, waitlistService.addToWaitlist(body.patientId, body.treatmentType, {
                            start: new Date(body.preferredDateRange.start),
                            end: new Date(body.preferredDateRange.end)
                        }, body.preferredTimeSlots || [], body.urgencyLevel || 'normal', body.specialRequirements || {})];
                case 6:
                    result = _c.sent();
                    return [4 /*yield*/, auditLogger.logActivity('waitlist_added', "Patient ".concat(body.patientId, " added to waitlist"), {
                            userId: session.user.id,
                            waitlistEntryId: result.id,
                            treatmentType: body.treatmentType,
                            urgencyLevel: body.urgencyLevel
                        })];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 8:
                    // Process waitlist for available slot
                    if (!body.availableStart || !body.availableEnd || !body.professionalId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'availableStart, availableEnd, and professionalId are required for process action' }, { status: 400 })];
                    }
                    return [4 /*yield*/, waitlistService.processWaitlistForSlot(new Date(body.availableStart), new Date(body.availableEnd), body.professionalId, body.treatmentType)];
                case 9:
                    result = _c.sent();
                    return [4 /*yield*/, auditLogger.logActivity('waitlist_processed', "Waitlist processed for available slot", {
                            userId: session.user.id,
                            professionalId: body.professionalId,
                            treatmentType: body.treatmentType,
                            matchesFound: result.length
                        })];
                case 10:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 11:
                    // Send notifications to waitlist patients
                    if (!body.waitlistEntryId || !body.availableSlots) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'waitlistEntryId and availableSlots are required for notify action' }, { status: 400 })];
                    }
                    return [4 /*yield*/, waitlistService.sendWaitlistNotifications(body.waitlistEntryId, body.availableSlots)];
                case 12:
                    result = _c.sent();
                    return [4 /*yield*/, auditLogger.logActivity('waitlist_notification', "Notification sent to waitlist entry ".concat(body.waitlistEntryId), {
                            userId: session.user.id,
                            waitlistEntryId: body.waitlistEntryId,
                            availableSlots: body.availableSlots.length
                        })];
                case 13:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 14: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action. Must be add, process, or notify' }, { status: 400 })];
                case 15: 
                // Return results
                return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        action: body.action,
                        data: result,
                        metadata: {
                            timestamp: new Date().toISOString(),
                            apiVersion: '2.2.0'
                        }
                    })];
                case 16:
                    error_1 = _c.sent();
                    console.error('Waitlist management error:', error_1);
                    return [4 /*yield*/, auditLogger.logError('Waitlist management API failed', error_1)];
                case 17:
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Internal server error during waitlist management',
                            details: process.env.NODE_ENV === 'development' ? error_1 : undefined
                        }, { status: 500 })];
                case 18: return [2 /*return*/];
            }
        });
    });
}
// GET handler for retrieving waitlist entries
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var auditLogger, supabase, _a, session, sessionError, url, treatmentType, status_1, limit, query, _b, waitlistEntries, error, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    auditLogger = new audit_logger_1.AuditLogger();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 8]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    _a = _c.sent(), session = _a.data.session, sessionError = _a.error;
                    if (sessionError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    url = new URL(request.url);
                    treatmentType = url.searchParams.get('treatmentType');
                    status_1 = url.searchParams.get('status') || 'active';
                    limit = parseInt(url.searchParams.get('limit') || '50');
                    query = supabase
                        .from('waitlist_entries')
                        .select('*')
                        .eq('status', status_1)
                        .order('priority_score', { ascending: false })
                        .order('created_at', { ascending: true })
                        .limit(limit);
                    if (treatmentType) {
                        query = query.eq('treatment_type', treatmentType);
                    }
                    return [4 /*yield*/, query];
                case 4:
                    _b = _c.sent(), waitlistEntries = _b.data, error = _b.error;
                    if (error) {
                        throw error;
                    }
                    return [4 /*yield*/, auditLogger.logActivity('waitlist_retrieved', "Retrieved ".concat(waitlistEntries.length, " waitlist entries"), {
                            userId: session.user.id,
                            treatmentType: treatmentType,
                            status: status_1,
                            count: waitlistEntries.length
                        })];
                case 5:
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: waitlistEntries,
                            metadata: {
                                count: waitlistEntries.length,
                                timestamp: new Date().toISOString(),
                                apiVersion: '2.2.0'
                            }
                        })];
                case 6:
                    error_2 = _c.sent();
                    console.error('Waitlist retrieval error:', error_2);
                    return [4 /*yield*/, auditLogger.logError('Waitlist retrieval API failed', error_2)];
                case 7:
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Internal server error during waitlist retrieval',
                            details: process.env.NODE_ENV === 'development' ? error_2 : undefined
                        }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Options handler for CORS
function OPTIONS(request) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new server_1.NextResponse(null, {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                })];
        });
    });
}
