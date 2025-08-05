"use strict";
// Story 10.2: Progress Tracking through Computer Vision Service
// Backend service for progress tracking system
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
exports.progressTrackingService = void 0;
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var ProgressTrackingService = /** @class */ (function () {
    function ProgressTrackingService() {
        this.supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
    }
    // Progress Tracking Management
    ProgressTrackingService.prototype.createProgressTracking = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var user, trackingData, _a, tracking, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        trackingData = __assign(__assign({}, data), { created_by: user.id, updated_by: user.id });
                        return [4 /*yield*/, supabase
                                .from('progress_tracking')
                                .insert(trackingData)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), tracking = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, tracking];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getProgressTrackings = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, page, limit, offset, _a, data, error, count;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('progress_tracking')
                            .select('*', { count: 'exact' });
                        // Apply filters
                        if (filters.patient_id) {
                            query = query.eq('patient_id', filters.patient_id);
                        }
                        if (filters.tracking_type) {
                            query = query.eq('tracking_type', filters.tracking_type);
                        }
                        if (filters.treatment_type) {
                            query = query.eq('treatment_type', filters.treatment_type);
                        }
                        if (filters.treatment_area) {
                            query = query.eq('treatment_area', filters.treatment_area);
                        }
                        if (filters.validation_status) {
                            query = query.eq('validation_status', filters.validation_status);
                        }
                        if (filters.date_from) {
                            query = query.gte('tracking_date', filters.date_from);
                        }
                        if (filters.date_to) {
                            query = query.lte('tracking_date', filters.date_to);
                        }
                        if (filters.min_progress_score !== undefined) {
                            query = query.gte('progress_score', filters.min_progress_score);
                        }
                        if (filters.max_progress_score !== undefined) {
                            query = query.lte('progress_score', filters.max_progress_score);
                        }
                        if (filters.min_confidence !== undefined) {
                            query = query.gte('confidence_score', filters.min_confidence);
                        }
                        page = filters.page || 1;
                        limit = filters.limit || 20;
                        offset = (page - 1) * limit;
                        query = query
                            .order('tracking_date', { ascending: false })
                            .range(offset, offset + limit - 1);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                data: data || [],
                                total: count || 0
                            }];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getProgressTrackingById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, createClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('progress_tracking')
                                .select('*')
                                .eq('id', id)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    ProgressTrackingService.prototype.updateProgressTracking = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var user, supabase, _a, tracking, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, createClient()];
                    case 2:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('progress_tracking')
                                .update(__assign(__assign({}, data), { updated_by: user.id }))
                                .eq('id', id)
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), tracking = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, tracking];
                }
            });
        });
    };
    ProgressTrackingService.prototype.deleteProgressTracking = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('progress_tracking')
                            .delete()
                            .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    // Progress Milestones Management
    ProgressTrackingService.prototype.createProgressMilestone = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var user, milestoneData, _a, milestone, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        milestoneData = __assign(__assign({}, data), { created_by: user.id, updated_by: user.id });
                        return [4 /*yield*/, supabase
                                .from('progress_milestones')
                                .insert(milestoneData)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), milestone = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, milestone];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getProgressMilestones = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, page, limit, offset, _a, data, error, count;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('progress_milestones')
                            .select('*', { count: 'exact' });
                        // Apply filters
                        if (filters.patient_id) {
                            query = query.eq('patient_id', filters.patient_id);
                        }
                        if (filters.milestone_type) {
                            query = query.eq('milestone_type', filters.milestone_type);
                        }
                        if (filters.validation_status) {
                            query = query.eq('validation_status', filters.validation_status);
                        }
                        if (filters.date_from) {
                            query = query.gte('achievement_date', filters.date_from);
                        }
                        if (filters.date_to) {
                            query = query.lte('achievement_date', filters.date_to);
                        }
                        if (filters.alert_sent !== undefined) {
                            query = query.eq('alert_sent', filters.alert_sent);
                        }
                        if (filters.min_achievement_score !== undefined) {
                            query = query.gte('achievement_score', filters.min_achievement_score);
                        }
                        page = filters.page || 1;
                        limit = filters.limit || 20;
                        offset = (page - 1) * limit;
                        query = query
                            .order('achievement_date', { ascending: false })
                            .range(offset, offset + limit - 1);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                data: data || [],
                                total: count || 0
                            }];
                }
            });
        });
    };
    ProgressTrackingService.prototype.validateMilestone = function (id, validationStatus, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var user, supabase, _a, milestone, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, createClient()];
                    case 2:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('progress_milestones')
                                .update({
                                validation_status: validationStatus,
                                validated_by: user.id,
                                validation_notes: notes,
                                updated_by: user.id
                            })
                                .eq('id', id)
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), milestone = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, milestone];
                }
            });
        });
    };
    // Progress Predictions Management
    ProgressTrackingService.prototype.createProgressPrediction = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var user, predictionData, _a, prediction, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        predictionData = __assign(__assign({}, data), { created_by: user.id, updated_by: user.id });
                        return [4 /*yield*/, supabase
                                .from('progress_predictions')
                                .insert(predictionData)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), prediction = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, prediction];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getProgressPredictions = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('progress_predictions')
                            .select('*')
                            .order('prediction_date', { ascending: false });
                        if (patientId) {
                            query = query.eq('patient_id', patientId);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    ProgressTrackingService.prototype.verifyPrediction = function (id, actualOutcome, accuracyScore) {
        return __awaiter(this, void 0, void 0, function () {
            var user, supabase, _a, prediction, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, createClient()];
                    case 2:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('progress_predictions')
                                .update({
                                actual_outcome: actualOutcome,
                                accuracy_score: accuracyScore,
                                verified_at: new Date().toISOString(),
                                verified_by: user.id,
                                updated_by: user.id
                            })
                                .eq('id', id)
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), prediction = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, prediction];
                }
            });
        });
    };
    // Multi-Session Analysis
    ProgressTrackingService.prototype.createMultiSessionAnalysis = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var user, trackingData, analysis, analysisData, _a, result, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, this.getTrackingDataForSessions(data.session_ids)];
                    case 2:
                        trackingData = _b.sent();
                        analysis = this.calculateProgressionAnalysis(trackingData);
                        analysisData = __assign(__assign({}, data), { progression_score: analysis.progressionScore, trend_direction: analysis.trendDirection, statistical_significance: analysis.statisticalSignificance, analysis_data: analysis.detailedData, created_by: user.id, updated_by: user.id });
                        return [4 /*yield*/, supabase
                                .from('multi_session_analysis')
                                .insert(analysisData)
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), result = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getMultiSessionAnalyses = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('multi_session_analysis')
                            .select('*')
                            .order('created_at', { ascending: false });
                        if (patientId) {
                            query = query.eq('patient_id', patientId);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // Progress Alerts Management
    ProgressTrackingService.prototype.createProgressAlert = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var user, alertData, _a, alert, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        alertData = __assign(__assign({}, data), { created_by: user.id, updated_by: user.id });
                        return [4 /*yield*/, supabase
                                .from('progress_alerts')
                                .insert(alertData)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), alert = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, alert];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getProgressAlerts = function () {
        return __awaiter(this, arguments, void 0, function (filters) {
            var query, page, limit, offset, _a, data, error, count;
            if (filters === void 0) { filters = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('progress_alerts')
                            .select('*', { count: 'exact' });
                        // Apply filters
                        if (filters.patient_id) {
                            query = query.eq('patient_id', filters.patient_id);
                        }
                        if (filters.alert_type) {
                            query = query.eq('alert_type', filters.alert_type);
                        }
                        if (filters.alert_priority) {
                            query = query.eq('alert_priority', filters.alert_priority);
                        }
                        if (filters.recipient_type) {
                            query = query.eq('recipient_type', filters.recipient_type);
                        }
                        if (filters.is_read !== undefined) {
                            query = query.eq('is_read', filters.is_read);
                        }
                        if (filters.action_required !== undefined) {
                            query = query.eq('action_required', filters.action_required);
                        }
                        if (filters.action_taken !== undefined) {
                            query = query.eq('action_taken', filters.action_taken);
                        }
                        if (filters.expires_before) {
                            query = query.lte('expires_at', filters.expires_before);
                        }
                        if (filters.expires_after) {
                            query = query.gte('expires_at', filters.expires_after);
                        }
                        page = filters.page || 1;
                        limit = filters.limit || 20;
                        offset = (page - 1) * limit;
                        query = query
                            .order('created_at', { ascending: false })
                            .range(offset, offset + limit - 1);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                data: data || [],
                                total: count || 0
                            }];
                }
            });
        });
    };
    ProgressTrackingService.prototype.markAlertRead = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user, supabase, _a, alert, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, createClient()];
                    case 2:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('progress_alerts')
                                .update({
                                is_read: true,
                                read_at: new Date().toISOString(),
                                read_by: user.id,
                                updated_by: user.id
                            })
                                .eq('id', id)
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), alert = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, alert];
                }
            });
        });
    };
    ProgressTrackingService.prototype.markAlertActionTaken = function (id, actionNotes) {
        return __awaiter(this, void 0, void 0, function () {
            var user, supabase, _a, alert, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, createClient()];
                    case 2:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('progress_alerts')
                                .update({
                                action_taken: true,
                                action_notes: actionNotes,
                                updated_by: user.id
                            })
                                .eq('id', id)
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), alert = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, alert];
                }
            });
        });
    };
    // Tracking Metrics Management
    ProgressTrackingService.prototype.createTrackingMetric = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var user, metricData, _a, metric, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentUser()];
                    case 1:
                        user = _b.sent();
                        metricData = __assign(__assign({}, data), { created_by: user.id, updated_by: user.id });
                        return [4 /*yield*/, supabase
                                .from('tracking_metrics')
                                .insert(metricData)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), metric = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, metric];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getTrackingMetrics = function (treatmentType) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('tracking_metrics')
                            .select('*')
                            .eq('is_active', true)
                            .order('display_order');
                        if (treatmentType) {
                            query = query.eq('treatment_type', treatmentType);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    // Analytics and Dashboard
    ProgressTrackingService.prototype.getProgressDashboardStats = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var baseQuery, _a, totalTrackings, activeData, milestoneData, alertData, predictionData, averageProgress, predictionsAccuracy;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        baseQuery = patientId
                            ? supabase.from('progress_tracking').select('*').eq('patient_id', patientId)
                            : supabase.from('progress_tracking').select('*');
                        return [4 /*yield*/, Promise.all([
                                baseQuery,
                                supabase.from('progress_tracking')
                                    .select('treatment_type')
                                    .eq(patientId ? 'patient_id' : 'validation_status', patientId || 'validated')
                                    .not('progress_score', 'eq', 100),
                                supabase.from('progress_milestones')
                                    .select('*')
                                    .eq(patientId ? 'patient_id' : 'validation_status', patientId || 'confirmed'),
                                supabase.from('progress_alerts')
                                    .select('alert_priority')
                                    .eq('is_read', false)
                                    .eq('alert_priority', 'urgent'),
                                supabase.from('progress_predictions')
                                    .select('accuracy_score')
                                    .not('accuracy_score', 'is', null)
                            ])];
                    case 1:
                        _a = _b.sent(), totalTrackings = _a[0].count, activeData = _a[1].data, milestoneData = _a[2].data, alertData = _a[3].data, predictionData = _a[4].data;
                        averageProgress = activeData && activeData.length > 0
                            ? activeData.reduce(function (sum, item) { return sum + item.progress_score; }, 0) / activeData.length
                            : 0;
                        predictionsAccuracy = predictionData && predictionData.length > 0
                            ? predictionData.reduce(function (sum, item) { return sum + item.accuracy_score; }, 0) / predictionData.length
                            : 0;
                        return [2 /*return*/, {
                                total_trackings: totalTrackings || 0,
                                active_treatments: new Set(activeData === null || activeData === void 0 ? void 0 : activeData.map(function (item) { return item.treatment_type; })).size,
                                average_progress: Math.round(averageProgress * 10) / 10,
                                milestone_achievements: (milestoneData === null || milestoneData === void 0 ? void 0 : milestoneData.length) || 0,
                                pending_validations: 0, // Would need separate query
                                urgent_alerts: (alertData === null || alertData === void 0 ? void 0 : alertData.length) || 0,
                                predictions_accuracy: Math.round(predictionsAccuracy * 10) / 10,
                                treatment_completion_rate: 0 // Would need separate calculation
                            }];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getProgressTrendData = function (patientId, treatmentType) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, groupedData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('progress_tracking')
                            .select('*')
                            .eq('patient_id', patientId)
                            .eq('validation_status', 'validated')
                            .order('tracking_date', { ascending: true });
                        if (treatmentType) {
                            query = query.eq('treatment_type', treatmentType);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        groupedData = (data || []).reduce(function (acc, tracking) {
                            var key = "".concat(tracking.treatment_type, "-").concat(tracking.treatment_area);
                            if (!acc[key]) {
                                acc[key] = {
                                    treatment_type: tracking.treatment_type,
                                    treatment_area: tracking.treatment_area,
                                    progress_points: [],
                                    trend_direction: 'stable'
                                };
                            }
                            acc[key].progress_points.push({
                                date: tracking.tracking_date,
                                score: tracking.progress_score,
                                confidence: tracking.confidence_score
                            });
                            return acc;
                        }, {});
                        // Calculate trend direction for each group
                        Object.values(groupedData).forEach(function (trendData) {
                            var data = trendData;
                            var points = data.progress_points;
                            if (points.length < 2) {
                                data.trend_direction = 'stable';
                                return;
                            }
                            var firstScore = points[0].score;
                            var lastScore = points[points.length - 1].score;
                            var difference = lastScore - firstScore;
                            if (difference > 10) {
                                data.trend_direction = 'improving';
                            }
                            else if (difference < -10) {
                                data.trend_direction = 'declining';
                            }
                            else {
                                data.trend_direction = 'stable';
                            }
                        });
                        return [2 /*return*/, Object.values(groupedData)];
                }
            });
        });
    };
    // Computer Vision Analysis
    ProgressTrackingService.prototype.processProgressAnalysis = function (imageData, analysisType, baselineId) {
        return __awaiter(this, void 0, void 0, function () {
            var simulatedAnalysis;
            return __generator(this, function (_a) {
                simulatedAnalysis = {
                    measurement_id: crypto.randomUUID(),
                    analysis_type: analysisType,
                    regions_of_interest: [
                        {
                            id: 'roi_1',
                            coordinates: { x: 100, y: 150, width: 200, height: 180 },
                            confidence: 92.5,
                            measurements: {
                                area: 150.2,
                                perimeter: 45.8,
                                improvement: baselineId ? 23.5 : 0
                            }
                        }
                    ],
                    overall_score: 85.2,
                    confidence_score: 89.1,
                    comparison_data: baselineId ? {
                        baseline_id: baselineId,
                        improvement_percentage: 23.5,
                        change_areas: ['primary_treatment_zone', 'surrounding_tissue']
                    } : undefined,
                    quality_indicators: {
                        image_quality: 88.5,
                        lighting_conditions: 91.2,
                        angle_consistency: 87.8,
                        focus_score: 93.1
                    },
                    annotations: [
                        {
                            type: 'measurement',
                            coordinates: { x: 200, y: 240 },
                            data: { measurement_type: 'area', value: 150.2, unit: 'mm²' }
                        }
                    ]
                };
                return [2 /*return*/, simulatedAnalysis];
            });
        });
    };
    // Private helper methods
    ProgressTrackingService.prototype.getCurrentUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, user, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, createClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase.auth.getUser()];
                    case 2:
                        _a = _b.sent(), user = _a.data.user, error = _a.error;
                        if (error || !user)
                            throw new Error('User not authenticated');
                        return [2 /*return*/, user];
                }
            });
        });
    };
    ProgressTrackingService.prototype.getTrackingDataForSessions = function (sessionIds) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, createClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('progress_tracking')
                                .select('*')
                                .in('session_id', sessionIds)
                                .order('tracking_date', { ascending: true })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    ProgressTrackingService.prototype.calculateProgressionAnalysis = function (trackingData) {
        if (trackingData.length < 2) {
            return {
                progressionScore: 0,
                trendDirection: 'stable',
                statisticalSignificance: 0,
                detailedData: {}
            };
        }
        var scores = trackingData.map(function (t) { return t.progress_score; });
        var firstScore = scores[0];
        var lastScore = scores[scores.length - 1];
        var progressionScore = lastScore - firstScore;
        var trendDirection;
        if (progressionScore > 10) {
            trendDirection = 'improving';
        }
        else if (progressionScore < -10) {
            trendDirection = 'declining';
        }
        else {
            trendDirection = 'stable';
        }
        // Calculate statistical significance (simplified)
        var variance = scores.reduce(function (sum, score) { return sum + Math.pow(score - (firstScore + lastScore) / 2, 2); }, 0) / scores.length;
        var statisticalSignificance = Math.min(100, Math.abs(progressionScore) * 10 / Math.sqrt(variance));
        return {
            progressionScore: Math.abs(progressionScore),
            trendDirection: trendDirection,
            statisticalSignificance: statisticalSignificance,
            detailedData: {
                score_progression: scores,
                variance: variance,
                improvement_rate: progressionScore / trackingData.length
            }
        };
    };
    return ProgressTrackingService;
}());
exports.progressTrackingService = new ProgressTrackingService();
