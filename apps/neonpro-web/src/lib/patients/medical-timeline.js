"use strict";
/**
 * NeonPro Medical History Timeline Service
 * Manages patient medical history with visual timeline representation
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createmedicalTimelineService = void 0;
var server_1 = require("@/lib/supabase/server");
var createmedicalTimelineService = /** @class */ (function () {
    function createmedicalTimelineService() {
    }
    createmedicalTimelineService.prototype.getSupabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get complete medical timeline for patient
     */
    createmedicalTimelineService.prototype.getPatientTimeline = function (patientId, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error, error_1;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabase()];
                    case 1:
                        supabase = _f.sent();
                        query = supabase
                            .from('patient_timeline_events')
                            .select("\n          *,\n          professional:professionals(name),\n          attachments:timeline_attachments(*),\n          before_after_photos:before_after_photos(*),\n          outcome:treatment_outcomes(*),\n          notes:progress_notes(*)\n        ")
                            .eq('patient_id', patientId);
                        // Apply filters
                        if (filter) {
                            if ((_b = filter.eventTypes) === null || _b === void 0 ? void 0 : _b.length) {
                                query = query.in('event_type', filter.eventTypes);
                            }
                            if ((_c = filter.categories) === null || _c === void 0 ? void 0 : _c.length) {
                                query = query.in('category', filter.categories);
                            }
                            if (filter.dateRange) {
                                query = query
                                    .gte('date', filter.dateRange.start.toISOString())
                                    .lte('date', filter.dateRange.end.toISOString());
                            }
                            if ((_d = filter.professionals) === null || _d === void 0 ? void 0 : _d.length) {
                                query = query.in('professional_id', filter.professionals);
                            }
                            if ((_e = filter.severity) === null || _e === void 0 ? void 0 : _e.length) {
                                query = query.in('severity', filter.severity);
                            }
                        }
                        query = query.order('date', { ascending: false });
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _f.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching timeline:', error);
                            throw new Error('Failed to fetch patient timeline');
                        }
                        return [2 /*return*/, this.transformTimelineData(data || [])];
                    case 3:
                        error_1 = _f.sent();
                        console.error('Error in getPatientTimeline:', error_1);
                        // Return mock data for development
                        return [2 /*return*/, this.getMockTimelineData(patientId)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add new timeline event
     */
    createmedicalTimelineService.prototype.addTimelineEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabase()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('patient_timeline_events')
                                .insert({
                                patient_id: event.patientId,
                                event_type: event.eventType,
                                title: event.title,
                                description: event.description,
                                date: event.date.toISOString(),
                                category: event.category,
                                severity: event.severity,
                                professional_id: event.professionalId,
                                metadata: event.metadata
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error adding timeline event:', error);
                            throw new Error('Failed to add timeline event');
                        }
                        return [2 /*return*/, this.transformTimelineEvent(data)];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Error in addTimelineEvent:', error_2);
                        // Return mock event for development
                        return [2 /*return*/, __assign({ id: "mock_".concat(Date.now()) }, event)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update timeline event
     */
    createmedicalTimelineService.prototype.updateTimelineEvent = function (eventId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabase()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('patient_timeline_events')
                                .update(__assign(__assign(__assign(__assign(__assign(__assign({}, (updates.title && { title: updates.title })), (updates.description && { description: updates.description })), (updates.date && { date: updates.date.toISOString() })), (updates.category && { category: updates.category })), (updates.severity && { severity: updates.severity })), (updates.metadata && { metadata: updates.metadata })))
                                .eq('id', eventId)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error updating timeline event:', error);
                            throw new Error('Failed to update timeline event');
                        }
                        return [2 /*return*/, this.transformTimelineEvent(data)];
                    case 3:
                        error_3 = _b.sent();
                        console.error('Error in updateTimelineEvent:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add before/after photos to timeline event
     */
    createmedicalTimelineService.prototype.addBeforeAfterPhotos = function (eventId, photos) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabase()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('before_after_photos')
                                .insert({
                                event_id: eventId,
                                comparison_type: photos.comparisonType,
                                notes: photos.notes,
                                quality: photos.quality
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error adding before/after photos:', error);
                            throw new Error('Failed to add before/after photos');
                        }
                        return [2 /*return*/, __assign({ id: data.id, eventId: eventId }, photos)];
                    case 3:
                        error_4 = _b.sent();
                        console.error('Error in addBeforeAfterPhotos:', error_4);
                        // Return mock photo for development
                        return [2 /*return*/, __assign({ id: "photo_".concat(Date.now()), eventId: eventId }, photos)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add progress note to timeline event
     */
    createmedicalTimelineService.prototype.addProgressNote = function (eventId, note) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabase()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('progress_notes')
                                .insert({
                                event_id: eventId,
                                note: note.note,
                                date: note.date.toISOString(),
                                author: note.author,
                                type: note.type,
                                visibility: note.visibility
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error adding progress note:', error);
                            throw new Error('Failed to add progress note');
                        }
                        return [2 /*return*/, __assign({ id: data.id }, note)];
                    case 3:
                        error_5 = _b.sent();
                        console.error('Error in addProgressNote:', error_5);
                        // Return mock note for development
                        return [2 /*return*/, __assign({ id: "note_".concat(Date.now()) }, note)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get treatment milestones for patient
     */
    createmedicalTimelineService.prototype.getTreatmentMilestones = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabase()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('milestone_tracking')
                                .select("\n          *,\n          milestones:milestones(*)\n        ")
                                .eq('patient_id', patientId)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching milestones:', error);
                            throw new Error('Failed to fetch treatment milestones');
                        }
                        return [2 /*return*/, data || []];
                    case 3:
                        error_6 = _b.sent();
                        console.error('Error in getTreatmentMilestones:', error_6);
                        // Return mock milestones for development
                        return [2 /*return*/, this.getMockMilestones(patientId)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update milestone progress
     */
    createmedicalTimelineService.prototype.updateMilestoneProgress = function (milestoneId, progress, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, supabase, _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        updates = { progress: progress };
                        if (progress === 100) {
                            updates.status = 'completed';
                            updates.completed_date = new Date().toISOString();
                        }
                        if (notes) {
                            updates.notes = notes;
                        }
                        return [4 /*yield*/, this.getSupabase()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('milestones')
                                .update(updates)
                                .eq('id', milestoneId)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error updating milestone:', error);
                            throw new Error('Failed to update milestone progress');
                        }
                        return [2 /*return*/, this.transformMilestone(data)];
                    case 3:
                        error_7 = _b.sent();
                        console.error('Error in updateMilestoneProgress:', error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate timeline summary for period
     */
    createmedicalTimelineService.prototype.getTimelineSummary = function (patientId, period) {
        return __awaiter(this, void 0, void 0, function () {
            var endDate, startDate, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endDate = new Date();
                        startDate = new Date();
                        switch (period) {
                            case 'week':
                                startDate.setDate(endDate.getDate() - 7);
                                break;
                            case 'month':
                                startDate.setMonth(endDate.getMonth() - 1);
                                break;
                            case 'quarter':
                                startDate.setMonth(endDate.getMonth() - 3);
                                break;
                            case 'year':
                                startDate.setFullYear(endDate.getFullYear() - 1);
                                break;
                        }
                        return [4 /*yield*/, this.getPatientTimeline(patientId, {
                                dateRange: { start: startDate, end: endDate }
                            })];
                    case 1:
                        events = _a.sent();
                        return [2 /*return*/, {
                                totalEvents: events.length,
                                eventTypes: this.groupByEventType(events),
                                categories: this.groupByCategory(events),
                                timeline: events,
                                insights: this.generateTimelineInsights(events)
                            }];
                }
            });
        });
    };
    // Private helper methods
    createmedicalTimelineService.prototype.transformTimelineData = function (data) {
        var _this = this;
        return data.map(function (item) { return _this.transformTimelineEvent(item); });
    };
    createmedicalTimelineService.prototype.transformTimelineEvent = function (data) {
        var _a;
        return {
            id: data.id,
            patientId: data.patient_id,
            eventType: data.event_type,
            title: data.title,
            description: data.description,
            date: new Date(data.date),
            category: data.category,
            severity: data.severity,
            professionalId: data.professional_id,
            professionalName: (_a = data.professional) === null || _a === void 0 ? void 0 : _a.name,
            attachments: data.attachments || [],
            beforeAfterPhotos: data.before_after_photos || [],
            outcome: data.outcome,
            notes: data.notes || [],
            relatedEventIds: data.related_event_ids || [],
            metadata: data.metadata || {}
        };
    };
    createmedicalTimelineService.prototype.transformMilestone = function (data) {
        return {
            id: data.id,
            title: data.title,
            description: data.description,
            targetDate: new Date(data.target_date),
            completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
            status: data.status,
            criteria: data.criteria || [],
            completedCriteria: data.completed_criteria || [],
            progress: data.progress,
            notes: data.notes
        };
    };
    createmedicalTimelineService.prototype.groupByEventType = function (events) {
        return events.reduce(function (acc, event) {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1;
            return acc;
        }, {});
    };
    createmedicalTimelineService.prototype.groupByCategory = function (events) {
        return events.reduce(function (acc, event) {
            acc[event.category] = (acc[event.category] || 0) + 1;
            return acc;
        }, {});
    };
    createmedicalTimelineService.prototype.generateTimelineInsights = function (events) {
        return {
            mostActiveMonth: this.getMostActiveMonth(events),
            treatmentFrequency: this.calculateTreatmentFrequency(events),
            outcomePatterns: this.analyzeOutcomePatterns(events),
            professionalDistribution: this.getProfessionalDistribution(events)
        };
    };
    createmedicalTimelineService.prototype.getMostActiveMonth = function (events) {
        var _a;
        var monthCounts = events.reduce(function (acc, event) {
            var month = event.date.toISOString().substring(0, 7);
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
        return ((_a = Object.entries(monthCounts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })[0]) === null || _a === void 0 ? void 0 : _a[0]) || '';
    };
    createmedicalTimelineService.prototype.calculateTreatmentFrequency = function (events) {
        var treatmentEvents = events.filter(function (e) { return e.eventType === 'treatment' || e.eventType === 'procedure'; });
        if (treatmentEvents.length < 2)
            return 0;
        var dates = treatmentEvents.map(function (e) { return e.date.getTime(); }).sort();
        var intervals = [];
        for (var i = 1; i < dates.length; i++) {
            intervals.push(dates[i] - dates[i - 1]);
        }
        var avgInterval = intervals.reduce(function (sum, interval) { return sum + interval; }, 0) / intervals.length;
        return Math.round(avgInterval / (1000 * 60 * 60 * 24)); // Days
    };
    createmedicalTimelineService.prototype.analyzeOutcomePatterns = function (events) {
        var eventsWithOutcomes = events.filter(function (e) { return e.outcome; });
        var totalOutcomes = eventsWithOutcomes.length;
        if (totalOutcomes === 0)
            return { successRate: 0, avgSatisfaction: 0 };
        var successfulOutcomes = eventsWithOutcomes.filter(function (e) { var _a; return (_a = e.outcome) === null || _a === void 0 ? void 0 : _a.success; }).length;
        var avgSatisfaction = eventsWithOutcomes.reduce(function (sum, e) { var _a; return sum + (((_a = e.outcome) === null || _a === void 0 ? void 0 : _a.satisfactionScore) || 0); }, 0) / totalOutcomes;
        return {
            successRate: (successfulOutcomes / totalOutcomes) * 100,
            avgSatisfaction: Math.round(avgSatisfaction * 10) / 10
        };
    };
    createmedicalTimelineService.prototype.getProfessionalDistribution = function (events) {
        return events.reduce(function (acc, event) {
            if (event.professionalName) {
                acc[event.professionalName] = (acc[event.professionalName] || 0) + 1;
            }
            return acc;
        }, {});
    };
    // Mock data for development
    createmedicalTimelineService.prototype.getMockTimelineData = function (patientId) {
        return [
            {
                id: 'event_1',
                patientId: patientId,
                eventType: 'appointment',
                title: 'Consulta Inicial',
                description: 'Primeira consulta para avaliação estética',
                date: new Date('2024-12-15'),
                category: 'aesthetic',
                severity: 'low',
                professionalId: 'prof_1',
                professionalName: 'Dr. Ana Silva',
                attachments: [],
                beforeAfterPhotos: [],
                notes: [
                    {
                        id: 'note_1',
                        note: 'Paciente interessada em procedimento de harmonização facial',
                        date: new Date('2024-12-15'),
                        author: 'Dr. Ana Silva',
                        type: 'observation',
                        visibility: 'professional'
                    }
                ],
                metadata: { duration: 60, cost: 200 }
            },
            {
                id: 'event_2',
                patientId: patientId,
                eventType: 'procedure',
                title: 'Aplicação de Botox',
                description: 'Procedimento de harmonização facial com toxina botulínica',
                date: new Date('2025-01-05'),
                category: 'aesthetic',
                severity: 'medium',
                professionalId: 'prof_1',
                professionalName: 'Dr. Ana Silva',
                attachments: [],
                beforeAfterPhotos: [
                    {
                        id: 'photo_1',
                        eventId: 'event_2',
                        comparisonType: 'treatment',
                        notes: 'Aplicação focada em rugas de expressão',
                        quality: 95,
                        beforePhoto: {
                            id: 'before_1',
                            url: '/images/before_1.jpg',
                            thumbnailUrl: '/images/before_1_thumb.jpg',
                            uploadedAt: new Date('2025-01-05'),
                            metadata: { width: 1920, height: 1080, quality: 95 }
                        },
                        afterPhoto: {
                            id: 'after_1',
                            url: '/images/after_1.jpg',
                            thumbnailUrl: '/images/after_1_thumb.jpg',
                            uploadedAt: new Date('2025-01-26'),
                            metadata: { width: 1920, height: 1080, quality: 95 }
                        }
                    }
                ],
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
                },
                notes: [
                    {
                        id: 'note_2',
                        note: 'Aplicação realizada sem intercorrências',
                        date: new Date('2025-01-05'),
                        author: 'Dr. Ana Silva',
                        type: 'observation',
                        visibility: 'professional'
                    }
                ],
                metadata: { units: 20, cost: 800 }
            }
        ];
    };
    createmedicalTimelineService.prototype.getMockMilestones = function (patientId) {
        return [
            {
                id: 'milestone_tracking_1',
                patientId: patientId,
                treatmentPlan: 'Harmonização Facial Completa',
                overallProgress: 65,
                estimatedCompletion: new Date('2025-06-01'),
                milestones: [
                    {
                        id: 'milestone_1',
                        title: 'Consulta Inicial',
                        description: 'Avaliação e planejamento do tratamento',
                        targetDate: new Date('2024-12-15'),
                        completedDate: new Date('2024-12-15'),
                        status: 'completed',
                        criteria: ['Análise facial', 'Expectativas alinhadas', 'Plano definido'],
                        completedCriteria: ['Análise facial', 'Expectativas alinhadas', 'Plano definido'],
                        progress: 100,
                        notes: 'Consulta realizada com sucesso'
                    },
                    {
                        id: 'milestone_2',
                        title: 'Primeira Aplicação',
                        description: 'Aplicação inicial de toxina botulínica',
                        targetDate: new Date('2025-01-05'),
                        completedDate: new Date('2025-01-05'),
                        status: 'completed',
                        criteria: ['Aplicação segura', 'Resultado imediato', 'Sem complicações'],
                        completedCriteria: ['Aplicação segura', 'Resultado imediato', 'Sem complicações'],
                        progress: 100,
                        notes: 'Procedimento realizado conforme planejado'
                    },
                    {
                        id: 'milestone_3',
                        title: 'Avaliação de Resultados',
                        description: 'Avaliação dos resultados após 3 semanas',
                        targetDate: new Date('2025-01-26'),
                        status: 'in_progress',
                        criteria: ['Redução de rugas', 'Satisfação da paciente', 'Necessidade de retoques'],
                        completedCriteria: ['Redução de rugas', 'Satisfação da paciente'],
                        progress: 75,
                        notes: 'Resultados muito positivos, paciente satisfeita'
                    }
                ]
            }
        ];
    };
    return createmedicalTimelineService;
}());
exports.createmedicalTimelineService = createmedicalTimelineService;
// Export instance for use
