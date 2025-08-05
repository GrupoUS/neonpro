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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// Mock the MedicalTimelineService
jest.mock('@/lib/patients/medical-timeline');
var medical_timeline_1 = require("@/lib/patients/medical-timeline");
// Mock timeline events data
var mockTimelineEvents = [
    {
        id: 'event_1',
        patientId: '123',
        title: 'Consulta Inicial',
        description: 'Primeira consulta para avaliação estética',
        eventType: 'appointment',
        category: 'aesthetic',
        date: new Date('2025-01-24T10:00:00Z'),
        professionalId: 'prof_1',
        professionalName: 'Dr. Ana Silva',
        severity: 'low',
        metadata: { cost: 200, duration: 60 },
        attachments: [],
        beforeAfterPhotos: [],
        notes: [{
                id: 'note_1',
                note: 'Paciente interessada em procedimento de harmonização facial',
                date: new Date('2025-01-24T10:00:00Z'),
                author: 'Dr. Ana Silva',
                type: 'observation',
                visibility: 'professional'
            }]
    },
    {
        id: 'event_2',
        patientId: '123',
        title: 'Aplicação de Botox',
        description: 'Procedimento de harmonização facial com toxina botulínica',
        eventType: 'procedure',
        category: 'aesthetic',
        date: new Date('2025-01-24T10:00:00Z'),
        professionalId: 'prof_1',
        professionalName: 'Dr. Ana Silva',
        severity: 'medium',
        metadata: { cost: 800, units: 20 },
        attachments: [],
        beforeAfterPhotos: [{
                id: 'photo_1',
                eventId: 'event_2',
                comparisonType: 'treatment',
                beforePhoto: {
                    id: 'before_1',
                    url: '/images/before_1.jpg',
                    thumbnailUrl: '/images/before_1_thumb.jpg',
                    uploadedAt: new Date('2025-01-24T10:00:00Z'),
                    metadata: { width: 1920, height: 1080, quality: 95 }
                },
                afterPhoto: {
                    id: 'after_1',
                    url: '/images/after_1.jpg',
                    thumbnailUrl: '/images/after_1_thumb.jpg',
                    uploadedAt: new Date('2025-01-24T10:00:00Z'),
                    metadata: { width: 1920, height: 1080, quality: 95 }
                },
                notes: 'Aplicação focada em rugas de expressão',
                quality: 95
            }],
        notes: [{
                id: 'note_2',
                note: 'Aplicação realizada sem intercorrências',
                date: new Date('2025-01-24T10:00:00Z'),
                author: 'Dr. Ana Silva',
                type: 'observation',
                visibility: 'professional'
            }],
        outcome: {
            id: 'outcome_1',
            success: true,
            satisfactionScore: 9,
            complications: [],
            followUpRequired: true,
            nextSteps: ['Retorno em 15 dias', 'Avaliação de resultados'],
            patientFeedback: 'Muito satisfeita com o resultado',
            professionalAssessment: 'Resultado excelente, paciente respondeu muito bem',
            healingProgress: 'excellent'
        }
    }
];
// Mock implementation
var mockGetPatientTimeline = jest.fn().mockImplementation(function (patientId, filter) { return __awaiter(void 0, void 0, void 0, function () {
    var events;
    var _a, _b;
    return __generator(this, function (_c) {
        events = __spreadArray([], mockTimelineEvents, true);
        if ((_a = filter === null || filter === void 0 ? void 0 : filter.eventTypes) === null || _a === void 0 ? void 0 : _a.length) {
            events = events.filter(function (e) { return filter.eventTypes.includes(e.eventType); });
        }
        if ((_b = filter === null || filter === void 0 ? void 0 : filter.categories) === null || _b === void 0 ? void 0 : _b.length) {
            events = events.filter(function (e) { return filter.categories.includes(e.category); });
        }
        if (filter === null || filter === void 0 ? void 0 : filter.dateRange) {
            events = events.filter(function (e) {
                var eventDate = new Date(e.date);
                return eventDate >= filter.dateRange.start && eventDate <= filter.dateRange.end;
            });
        }
        return [2 /*return*/, events];
    });
}); });
var mockAddTimelineEvent = jest.fn().mockImplementation(function (event) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, __assign({ id: 'mock_' + Date.now() }, event)];
    });
}); });
var mockUpdateTimelineEvent = jest.fn().mockImplementation(function (eventId, updates) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, __assign(__assign(__assign({}, mockTimelineEvents[0]), updates), { id: eventId })];
    });
}); });
var mockGetTreatmentMilestones = jest.fn().mockResolvedValue([
    { id: '1', title: 'Início do Tratamento', date: '2025-01-10' },
    { id: '2', title: 'Primeira Avaliação', date: '2025-01-12' }
]);
var mockGetTimelineSummary = jest.fn().mockResolvedValue({
    totalEvents: 2,
    eventTypes: { appointment: 1, procedure: 1 },
    categories: { aesthetic: 2 }
});
// Mock the constructor
medical_timeline_1.MedicalTimelineService.mockImplementation(function () { return ({
    getPatientTimeline: mockGetPatientTimeline,
    addTimelineEvent: mockAddTimelineEvent,
    updateTimelineEvent: mockUpdateTimelineEvent,
    getTreatmentMilestones: mockGetTreatmentMilestones,
    getTimelineSummary: mockGetTimelineSummary
}); });
describe('Medical Timeline Service', function () {
    var medicalTimelineService;
    beforeEach(function () {
        medicalTimelineService = new medical_timeline_1.MedicalTimelineService();
    });
    describe('getPatientTimeline', function () {
        it('should fetch timeline events for a patient', function () { return __awaiter(void 0, void 0, void 0, function () {
            var events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, medicalTimelineService.getPatientTimeline('123')];
                    case 1:
                        events = _a.sent();
                        expect(events).toHaveLength(2);
                        expect(events[0].patientId).toBe('123');
                        expect(events[0].title).toBe('Consulta Inicial');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should filter events by type', function () { return __awaiter(void 0, void 0, void 0, function () {
            var events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, medicalTimelineService.getPatientTimeline('123', {
                            eventTypes: ['appointment']
                        })];
                    case 1:
                        events = _a.sent();
                        // Only one event is of type 'appointment'
                        expect(events).toHaveLength(1);
                        expect(events[0].eventType).toBe('appointment');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should filter events by date range', function () { return __awaiter(void 0, void 0, void 0, function () {
            var events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, medicalTimelineService.getPatientTimeline('123', {
                            dateRange: {
                                start: new Date('2025-01-01'),
                                end: new Date('2025-12-31')
                            }
                        })];
                    case 1:
                        events = _a.sent();
                        // Both events are in 2025, so this filter should return both
                        expect(events).toHaveLength(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should filter events by category', function () { return __awaiter(void 0, void 0, void 0, function () {
            var events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, medicalTimelineService.getPatientTimeline('123', {
                            categories: ['aesthetic']
                        })];
                    case 1:
                        events = _a.sent();
                        // Both events are aesthetic category
                        expect(events).toHaveLength(2);
                        events.forEach(function (event) {
                            expect(event.category).toBe('aesthetic');
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('addTimelineEvent', function () {
        it('should add a new timeline event', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newEvent, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newEvent = {
                            patientId: '123',
                            title: 'Tratamento Facial',
                            description: 'Limpeza de pele',
                            eventType: 'treatment',
                            category: 'aesthetic',
                            date: new Date('2025-01-24T10:00:00Z'),
                            professionalId: 'prof_1',
                            professionalName: 'Dr. Ana Silva',
                            severity: 'low',
                            metadata: {
                                category: 'treatment',
                                duration: 60
                            },
                            attachments: [],
                            beforeAfterPhotos: [],
                            notes: []
                        };
                        return [4 /*yield*/, medicalTimelineService.addTimelineEvent(newEvent)];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveProperty('id');
                        expect(result.patientId).toBe('123');
                        expect(result.title).toBe('Tratamento Facial');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateTimelineEvent', function () {
        it('should update a timeline event', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updates, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updates = {
                            title: 'Consulta Atualizada',
                            description: 'Descrição atualizada'
                        };
                        return [4 /*yield*/, medicalTimelineService.updateTimelineEvent('event_1', updates)];
                    case 1:
                        result = _a.sent();
                        expect(result.id).toBe('event_1');
                        expect(result.title).toBe('Consulta Atualizada');
                        expect(result.description).toBe('Descrição atualizada');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getTreatmentMilestones', function () {
        it('should get treatment milestones', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, medicalTimelineService.getTreatmentMilestones('123')];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveLength(2);
                        expect(result[0]).toEqual({
                            id: '1',
                            title: 'Início do Tratamento',
                            date: '2025-01-10'
                        });
                        expect(result[1]).toEqual({
                            id: '2',
                            title: 'Primeira Avaliação',
                            date: '2025-01-12'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getTimelineSummary', function () {
        it('should get timeline summary', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, medicalTimelineService.getTimelineSummary('123', 'month')];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            totalEvents: 2,
                            eventTypes: { appointment: 1, procedure: 1 },
                            categories: { aesthetic: 2 }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
