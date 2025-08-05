"use strict";
/**
 * Medical Timeline API Route
 * Handles medical history timeline operations
 */
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
var server_1 = require("@/lib/supabase/server");
var medical_timeline_1 = require("@/lib/patients/medical-timeline");
var server_2 = require("next/server");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, patientId, action, _a, eventTypes, categories, startDate, endDate, professionals, severity, filter, timeline, milestones, period, summary, error_1;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _f.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_f.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    patientId = searchParams.get('patientId');
                    action = searchParams.get('action');
                    if (!patientId) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })];
                    }
                    _a = action;
                    switch (_a) {
                        case 'timeline': return [3 /*break*/, 3];
                        case 'milestones': return [3 /*break*/, 5];
                        case 'summary': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 3:
                    eventTypes = (_b = searchParams.get('eventTypes')) === null || _b === void 0 ? void 0 : _b.split(',');
                    categories = (_c = searchParams.get('categories')) === null || _c === void 0 ? void 0 : _c.split(',');
                    startDate = searchParams.get('startDate');
                    endDate = searchParams.get('endDate');
                    professionals = (_d = searchParams.get('professionals')) === null || _d === void 0 ? void 0 : _d.split(',');
                    severity = (_e = searchParams.get('severity')) === null || _e === void 0 ? void 0 : _e.split(',');
                    filter = __assign(__assign(__assign(__assign(__assign(__assign({}, (eventTypes && { eventTypes: eventTypes })), (categories && { categories: categories })), (startDate && endDate && {
                        dateRange: {
                            start: new Date(startDate),
                            end: new Date(endDate)
                        }
                    })), (professionals && { professionals: professionals })), (severity && { severity: severity })), { includePhotos: searchParams.get('includePhotos') === 'true', includeAttachments: searchParams.get('includeAttachments') === 'true' });
                    return [4 /*yield*/, (0, medical_timeline_1.createmedicalTimelineService)().getPatientTimeline(patientId, filter)];
                case 4:
                    timeline = _f.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ timeline: timeline }, { status: 200 })];
                case 5: return [4 /*yield*/, (0, medical_timeline_1.createmedicalTimelineService)().getTreatmentMilestones(patientId)];
                case 6:
                    milestones = _f.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ milestones: milestones }, { status: 200 })];
                case 7:
                    period = searchParams.get('period') || 'month';
                    return [4 /*yield*/, (0, medical_timeline_1.createmedicalTimelineService)().getTimelineSummary(patientId, period)];
                case 8:
                    summary = _f.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ summary: summary }, { status: 200 })];
                case 9: return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_1 = _f.sent();
                    console.error('Error in medical timeline API:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, action, data, _a, patientId, eventType, title, description, date, category, severity, professionalId, metadata, newEvent, eventId, note, author, type, visibility, progressNote, photoEventId, comparisonType, notes, quality, beforeAfterPhotos, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _b.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    _a = action;
                    switch (_a) {
                        case 'addEvent': return [3 /*break*/, 4];
                        case 'addNote': return [3 /*break*/, 6];
                        case 'addPhotos': return [3 /*break*/, 8];
                    }
                    return [3 /*break*/, 10];
                case 4:
                    patientId = data.patientId, eventType = data.eventType, title = data.title, description = data.description, date = data.date, category = data.category, severity = data.severity, professionalId = data.professionalId, metadata = data.metadata;
                    if (!patientId || !eventType || !title || !date) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Missing required fields' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, medical_timeline_1.createmedicalTimelineService)().addTimelineEvent({
                            patientId: patientId,
                            eventType: eventType,
                            title: title,
                            description: description,
                            date: new Date(date),
                            category: category || 'medical',
                            severity: severity,
                            professionalId: professionalId,
                            metadata: metadata
                        })];
                case 5:
                    newEvent = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ event: newEvent }, { status: 201 })];
                case 6:
                    eventId = data.eventId, note = data.note, author = data.author, type = data.type, visibility = data.visibility;
                    if (!eventId || !note || !author) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Missing required fields' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, medical_timeline_1.createmedicalTimelineService)().addProgressNote(eventId, {
                            note: note,
                            date: new Date(),
                            author: author,
                            type: type || 'observation',
                            visibility: visibility || 'professional'
                        })];
                case 7:
                    progressNote = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ note: progressNote }, { status: 201 })];
                case 8:
                    photoEventId = data.eventId, comparisonType = data.comparisonType, notes = data.notes, quality = data.quality;
                    if (!photoEventId || !comparisonType) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Missing required fields' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, medical_timeline_1.createmedicalTimelineService)().addBeforeAfterPhotos(photoEventId, {
                            comparisonType: comparisonType,
                            notes: notes,
                            quality: quality || 100
                        })];
                case 9:
                    beforeAfterPhotos = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ photos: beforeAfterPhotos }, { status: 201 })];
                case 10: return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_2 = _b.sent();
                    console.error('Error in medical timeline POST API:', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, body, action, data, _a, eventId, updates, updatedEvent, milestoneId, progress, notes, updatedMilestone, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_b.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _b.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    _a = action;
                    switch (_a) {
                        case 'updateEvent': return [3 /*break*/, 4];
                        case 'updateMilestone': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 4:
                    eventId = data.eventId, updates = data.updates;
                    if (!eventId) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Event ID is required' }, { status: 400 })];
                    }
                    // Convert date string to Date object if present
                    if (updates.date) {
                        updates.date = new Date(updates.date);
                    }
                    return [4 /*yield*/, (0, medical_timeline_1.createmedicalTimelineService)().updateTimelineEvent(eventId, updates)];
                case 5:
                    updatedEvent = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ event: updatedEvent }, { status: 200 })];
                case 6:
                    milestoneId = data.milestoneId, progress = data.progress, notes = data.notes;
                    if (!milestoneId || progress === undefined) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Milestone ID and progress are required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, medical_timeline_1.createmedicalTimelineService)().updateMilestoneProgress(milestoneId, progress, notes)];
                case 7:
                    updatedMilestone = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({ milestone: updatedMilestone }, { status: 200 })];
                case 8: return [2 /*return*/, server_2.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_3 = _b.sent();
                    console.error('Error in medical timeline PUT API:', error_3);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
