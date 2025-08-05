"use strict";
// =====================================================================================
// TREATMENT FOLLOW-UP SERVICE
// Epic 7.3: Comprehensive service layer for follow-up automation
// =====================================================================================
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
exports.createtreatmentFollowupService = exports.treatmentFollowupService = void 0;
var client_1 = require("@/lib/supabase/client");
var TreatmentFollowupService = /** @class */ (function () {
    function TreatmentFollowupService() {
    }
    // Supabase client created per method for proper request context
    // =====================================================================================
    // FOLLOW-UP MANAGEMENT
    // =====================================================================================
    /**
     * Get follow-ups with filtering and pagination
     */
    TreatmentFollowupService.prototype.getFollowups = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, _a, data, error, error_1;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('treatment_followups')
                            .select("\n          *,\n          template:followup_templates(*),\n          patient:patients(id, name, phone, email, whatsapp),\n          responses:followup_responses(*),\n          attachments:followup_attachments(*)\n        ");
                        // Apply filters
                        if (filters.status) {
                            query = query.in('status', filters.status);
                        }
                        if (filters.followup_type) {
                            query = query.in('followup_type', filters.followup_type);
                        }
                        if (filters.communication_method) {
                            query = query.in('communication_method', filters.communication_method);
                        }
                        if (filters.priority) {
                            query = query.in('priority', filters.priority);
                        }
                        if (filters.clinic_id) {
                            query = query.eq('clinic_id', filters.clinic_id);
                        }
                        if (filters.patient_id) {
                            query = query.eq('patient_id', filters.patient_id);
                        }
                        if (filters.assigned_to) {
                            query = query.eq('assigned_to', filters.assigned_to);
                        }
                        if (filters.date_from) {
                            query = query.gte('scheduled_date', filters.date_from);
                        }
                        if (filters.date_to) {
                            query = query.lte('scheduled_date', filters.date_to);
                        }
                        if (filters.automated !== undefined) {
                            query = query.eq('automated', filters.automated);
                        }
                        // Apply pagination
                        if (filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters.offset) {
                            query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
                        }
                        // Order by scheduled date
                        query = query.order('scheduled_date', { ascending: true });
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching follow-ups:', error);
                            throw new Error("Failed to fetch follow-ups: ".concat(error.message));
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Service error in getFollowups:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get single follow-up by ID
     */
    TreatmentFollowupService.prototype.getFollowupById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .select("\n          *,\n          template:followup_templates(*),\n          patient:patients(id, name, phone, email, whatsapp),\n          responses:followup_responses(*),\n          attachments:followup_attachments(*)\n        ")
                                .eq('id', id)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching follow-up:', error);
                            throw new Error("Failed to fetch follow-up: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Service error in getFollowupById:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create new follow-up
     */
    TreatmentFollowupService.prototype.createFollowup = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var followupData, _a, newFollowup, error, error_3;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        followupData = __assign(__assign({}, data), { scheduled_date: data.scheduled_date.toISOString(), status: 'pending', automated: (_b = data.automated) !== null && _b !== void 0 ? _b : true, priority: (_c = data.priority) !== null && _c !== void 0 ? _c : 'normal' });
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .insert(followupData)
                                .select("\n          *,\n          template:followup_templates(*),\n          patient:patients(id, name, phone, email, whatsapp)\n        ")
                                .single()];
                    case 1:
                        _a = _d.sent(), newFollowup = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error creating follow-up:', error);
                            throw new Error("Failed to create follow-up: ".concat(error.message));
                        }
                        return [2 /*return*/, newFollowup];
                    case 2:
                        error_3 = _d.sent();
                        console.error('Service error in createFollowup:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update follow-up
     */
    TreatmentFollowupService.prototype.updateFollowup = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .update(updates)
                                .eq('id', id)
                                .select("\n          *,\n          template:followup_templates(*),\n          patient:patients(id, name, phone, email, whatsapp)\n        ")
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error updating follow-up:', error);
                            throw new Error("Failed to update follow-up: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                    case 3:
                        error_4 = _b.sent();
                        console.error('Service error in updateFollowup:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete follow-up
     */
    TreatmentFollowupService.prototype.deleteFollowup = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .delete()
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Error deleting follow-up:', error);
                            throw new Error("Failed to delete follow-up: ".concat(error.message));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Service error in deleteFollowup:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mark follow-up as completed
     */
    TreatmentFollowupService.prototype.completeFollowup = function (id, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var updates, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        updates = __assign({ status: 'completed', completed_date: new Date().toISOString() }, (notes && { notes: notes }));
                        return [4 /*yield*/, this.updateFollowup(id, updates)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Service error in completeFollowup:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // TEMPLATE MANAGEMENT
    // =====================================================================================
    /**
     * Get follow-up templates
     */
    TreatmentFollowupService.prototype.getTemplates = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, _a, data, error, error_7;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('followup_templates')
                            .select('*');
                        // Apply filters
                        if (filters.treatment_type) {
                            query = query.in('treatment_type', filters.treatment_type);
                        }
                        if (filters.followup_type) {
                            query = query.in('followup_type', filters.followup_type);
                        }
                        if (filters.communication_method) {
                            query = query.in('communication_method', filters.communication_method);
                        }
                        if (filters.active !== undefined) {
                            query = query.eq('active', filters.active);
                        }
                        if (filters.clinic_id) {
                            query = query.eq('clinic_id', filters.clinic_id);
                        }
                        if (filters.created_by) {
                            query = query.eq('created_by', filters.created_by);
                        }
                        // Apply pagination
                        if (filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters.offset) {
                            query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
                        }
                        query = query.order('created_at', { ascending: false });
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching templates:', error);
                            throw new Error("Failed to fetch templates: ".concat(error.message));
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Service error in getTemplates:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create follow-up template
     */
    TreatmentFollowupService.prototype.createTemplate = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var templateData, _a, newTemplate, error, error_8;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        templateData = __assign(__assign({}, data), { timing_hours: (_b = data.timing_hours) !== null && _b !== void 0 ? _b : 0, requires_response: (_c = data.requires_response) !== null && _c !== void 0 ? _c : false, active: (_d = data.active) !== null && _d !== void 0 ? _d : true });
                        return [4 /*yield*/, supabase
                                .from('followup_templates')
                                .insert(templateData)
                                .select('*')
                                .single()];
                    case 1:
                        _a = _e.sent(), newTemplate = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error creating template:', error);
                            throw new Error("Failed to create template: ".concat(error.message));
                        }
                        return [2 /*return*/, newTemplate];
                    case 2:
                        error_8 = _e.sent();
                        console.error('Service error in createTemplate:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update template
     */
    TreatmentFollowupService.prototype.updateTemplate = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('followup_templates')
                                .update(updates)
                                .eq('id', id)
                                .select('*')
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error updating template:', error);
                            throw new Error("Failed to update template: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                    case 3:
                        error_9 = _b.sent();
                        console.error('Service error in updateTemplate:', error_9);
                        throw error_9;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // PROTOCOL MANAGEMENT
    // =====================================================================================
    /**
     * Get treatment protocols
     */
    TreatmentFollowupService.prototype.getProtocols = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, _a, data, error, error_10;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('treatment_protocols')
                            .select('*');
                        // Apply filters
                        if (filters.treatment_type) {
                            query = query.in('treatment_type', filters.treatment_type);
                        }
                        if (filters.active !== undefined) {
                            query = query.eq('active', filters.active);
                        }
                        if (filters.clinic_id) {
                            query = query.eq('clinic_id', filters.clinic_id);
                        }
                        if (filters.created_by) {
                            query = query.eq('created_by', filters.created_by);
                        }
                        // Apply pagination
                        if (filters.limit) {
                            query = query.limit(filters.limit);
                        }
                        if (filters.offset) {
                            query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
                        }
                        query = query.order('created_at', { ascending: false });
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching protocols:', error);
                            throw new Error("Failed to fetch protocols: ".concat(error.message));
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_10 = _b.sent();
                        console.error('Service error in getProtocols:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create treatment protocol
     */
    TreatmentFollowupService.prototype.createProtocol = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolData, _a, newProtocol, error, error_11;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        protocolData = __assign(__assign({}, data), { next_appointment_suggestion: (_b = data.next_appointment_suggestion) !== null && _b !== void 0 ? _b : 30, active: (_c = data.active) !== null && _c !== void 0 ? _c : true });
                        return [4 /*yield*/, supabase
                                .from('treatment_protocols')
                                .insert(protocolData)
                                .select('*')
                                .single()];
                    case 1:
                        _a = _d.sent(), newProtocol = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error creating protocol:', error);
                            throw new Error("Failed to create protocol: ".concat(error.message));
                        }
                        return [2 /*return*/, newProtocol];
                    case 2:
                        error_11 = _d.sent();
                        console.error('Service error in createProtocol:', error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // ANALYTICS AND REPORTING
    // =====================================================================================
    /**
     * Get follow-up analytics
     */
    TreatmentFollowupService.prototype.getAnalytics = function (clinicId, dateFrom, dateTo) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, followups, error, total_followups, completed_followups, pending_followups, followupsWithResponses, response_rate, satisfactionResponses, satisfaction_average, communication_method_stats, followup_type_stats, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .select('*, responses:followup_responses(*)')
                                .eq('clinic_id', clinicId)
                                .gte('created_at', dateFrom || '2024-01-01')
                                .lte('created_at', dateTo || new Date().toISOString())];
                    case 2:
                        _a = _b.sent(), followups = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to fetch analytics: ".concat(error.message));
                        }
                        total_followups = followups.length;
                        completed_followups = followups.filter(function (f) { return f.status === 'completed'; }).length;
                        pending_followups = followups.filter(function (f) { return f.status === 'pending'; }).length;
                        followupsWithResponses = followups.filter(function (f) { return f.responses && f.responses.length > 0; }).length;
                        response_rate = total_followups > 0 ? (followupsWithResponses / total_followups) * 100 : 0;
                        satisfactionResponses = followups
                            .flatMap(function (f) { return f.responses || []; })
                            .filter(function (r) { return r.satisfaction_score !== null && r.satisfaction_score !== undefined; });
                        satisfaction_average = satisfactionResponses.length > 0
                            ? satisfactionResponses.reduce(function (sum, r) { return sum + (r.satisfaction_score || 0); }, 0) / satisfactionResponses.length
                            : 0;
                        communication_method_stats = followups.reduce(function (stats, f) {
                            stats[f.communication_method] = (stats[f.communication_method] || 0) + 1;
                            return stats;
                        }, {});
                        followup_type_stats = followups.reduce(function (stats, f) {
                            stats[f.followup_type] = (stats[f.followup_type] || 0) + 1;
                            return stats;
                        }, {});
                        return [2 /*return*/, {
                                total_followups: total_followups,
                                completed_followups: completed_followups,
                                pending_followups: pending_followups,
                                response_rate: response_rate,
                                satisfaction_average: satisfaction_average,
                                communication_method_stats: communication_method_stats,
                                followup_type_stats: followup_type_stats,
                                monthly_trends: [] // TODO: Implement monthly trends calculation
                            }];
                    case 3:
                        error_12 = _b.sent();
                        console.error('Service error in getAnalytics:', error_12);
                        throw error_12;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get dashboard summary
     */
    TreatmentFollowupService.prototype.getDashboardSummary = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var today, todayStart, todayEnd, weekEnd, supabase, todayFollowups, pendingResponses, overdueFollowups, upcomingWeek, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        today = new Date();
                        todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
                        todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
                        weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .gte('scheduled_date', todayStart)
                                .lt('scheduled_date', todayEnd)];
                    case 2:
                        todayFollowups = (_a.sent()).data;
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .eq('status', 'sent')
                                .is('completed_date', null)];
                    case 3:
                        pendingResponses = (_a.sent()).data;
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .eq('status', 'pending')
                                .lt('scheduled_date', todayStart)];
                    case 4:
                        overdueFollowups = (_a.sent()).data;
                        return [4 /*yield*/, supabase
                                .from('treatment_followups')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .gte('scheduled_date', todayEnd)
                                .lt('scheduled_date', weekEnd)];
                    case 5:
                        upcomingWeek = (_a.sent()).data;
                        return [2 /*return*/, {
                                today_followups: (todayFollowups === null || todayFollowups === void 0 ? void 0 : todayFollowups.length) || 0,
                                pending_responses: (pendingResponses === null || pendingResponses === void 0 ? void 0 : pendingResponses.length) || 0,
                                overdue_followups: (overdueFollowups === null || overdueFollowups === void 0 ? void 0 : overdueFollowups.length) || 0,
                                satisfaction_average: 0, // TODO: Calculate from recent responses
                                upcoming_this_week: (upcomingWeek === null || upcomingWeek === void 0 ? void 0 : upcomingWeek.length) || 0,
                                automation_success_rate: 0, // TODO: Calculate automation success rate
                                recent_activities: [] // TODO: Implement recent activities
                            }];
                    case 6:
                        error_13 = _a.sent();
                        console.error('Service error in getDashboardSummary:', error_13);
                        throw error_13;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return TreatmentFollowupService;
}());
// Export singleton instance
exports.treatmentFollowupService = new TreatmentFollowupService();
var createtreatmentFollowupService = function () { return new TreatmentFollowupService(); };
exports.createtreatmentFollowupService = createtreatmentFollowupService;
