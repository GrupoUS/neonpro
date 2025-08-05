"use strict";
// =====================================================================================
// RETENTION ANALYTICS SERVICE
// Epic 7.4: Patient Retention Analytics + Predictions
// Core business logic for retention analytics, churn prediction, and retention strategies
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
exports.RetentionAnalyticsService = void 0;
var client_1 = require("@/lib/supabase/client");
var retention_analytics_1 = require("@/app/types/retention-analytics");
var RetentionAnalyticsService = /** @class */ (function () {
    // Supabase client created per method for proper request context
    function RetentionAnalyticsService() {
    }
    // =====================================================================================
    // PATIENT RETENTION METRICS
    // =====================================================================================
    /**
     * Calculate comprehensive retention metrics for a patient
     */
    RetentionAnalyticsService.prototype.calculatePatientRetentionMetrics = function (patientId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, appointments, appointmentsError, _b, responses, responsesError, _c, payments, paymentsError, now, firstAppointment, lastAppointment, daysSinceLastAppointment, totalAppointments, daysSinceFirst, appointmentFrequency, totalFollowups, respondedFollowups, responseRate, satisfactionScores, satisfactionScore, totalSpent, averageTicket, lifetimeValue, onTimePayments, paymentPunctuality, cancelledAppointments, cancellationRate, noShowAppointments, noShowRate, rebookedCount, rebookingRate, completedTreatments, treatmentCompletionRate, churnRiskScore, churnRiskLevel, churnProbability, daysToPredicatedChurn, metrics, _d, savedMetrics, saveError, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _e.sent();
                        return [4 /*yield*/, supabase
                                .from('appointments')
                                .select('*')
                                .eq('patient_id', patientId)
                                .eq('clinic_id', clinicId)
                                .order('date', { ascending: true })];
                    case 2:
                        _a = _e.sent(), appointments = _a.data, appointmentsError = _a.error;
                        if (appointmentsError)
                            throw appointmentsError;
                        return [4 /*yield*/, supabase
                                .from('followup_responses')
                                .select('*')
                                .eq('patient_id', patientId)];
                    case 3:
                        _b = _e.sent(), responses = _b.data, responsesError = _b.error;
                        if (responsesError)
                            throw responsesError;
                        return [4 /*yield*/, supabase
                                .from('payments')
                                .select('*')
                                .eq('patient_id', patientId)];
                    case 4:
                        _c = _e.sent(), payments = _c.data, paymentsError = _c.error;
                        if (paymentsError)
                            throw paymentsError;
                        now = new Date();
                        firstAppointment = appointments === null || appointments === void 0 ? void 0 : appointments[0];
                        lastAppointment = appointments === null || appointments === void 0 ? void 0 : appointments[appointments.length - 1];
                        daysSinceLastAppointment = lastAppointment
                            ? Math.floor((now.getTime() - new Date(lastAppointment.date).getTime()) / (1000 * 60 * 60 * 24))
                            : 0;
                        totalAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.length) || 0;
                        daysSinceFirst = firstAppointment
                            ? Math.floor((now.getTime() - new Date(firstAppointment.date).getTime()) / (1000 * 60 * 60 * 24))
                            : 1;
                        appointmentFrequency = totalAppointments / Math.max(daysSinceFirst / 30, 1);
                        totalFollowups = (responses === null || responses === void 0 ? void 0 : responses.length) || 0;
                        respondedFollowups = (responses === null || responses === void 0 ? void 0 : responses.filter(function (r) { return r.response_text; }).length) || 0;
                        responseRate = totalFollowups > 0 ? respondedFollowups / totalFollowups : 0;
                        satisfactionScores = (responses === null || responses === void 0 ? void 0 : responses.filter(function (r) { return r.satisfaction_rating; }).map(function (r) { return r.satisfaction_rating; })) || [];
                        satisfactionScore = satisfactionScores.length > 0
                            ? satisfactionScores.reduce(function (sum, score) { return sum + score; }, 0) / satisfactionScores.length
                            : 0;
                        totalSpent = (payments === null || payments === void 0 ? void 0 : payments.reduce(function (sum, payment) { return sum + (payment.amount || 0); }, 0)) || 0;
                        averageTicket = totalAppointments > 0 ? totalSpent / totalAppointments : 0;
                        lifetimeValue = totalSpent;
                        onTimePayments = (payments === null || payments === void 0 ? void 0 : payments.filter(function (p) {
                            return new Date(p.paid_at) <= new Date(p.due_date);
                        }).length) || 0;
                        paymentPunctuality = (payments === null || payments === void 0 ? void 0 : payments.length) > 0 ? onTimePayments / payments.length : 1;
                        cancelledAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'cancelled'; }).length) || 0;
                        cancellationRate = totalAppointments > 0 ? cancelledAppointments / totalAppointments : 0;
                        noShowAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'no_show'; }).length) || 0;
                        noShowRate = totalAppointments > 0 ? noShowAppointments / totalAppointments : 0;
                        rebookedCount = 0;
                        rebookingRate = (cancelledAppointments + noShowAppointments) > 0
                            ? rebookedCount / (cancelledAppointments + noShowAppointments)
                            : 0;
                        completedTreatments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'completed'; }).length) || 0;
                        treatmentCompletionRate = totalAppointments > 0 ? completedTreatments / totalAppointments : 0;
                        churnRiskScore = this.calculateChurnRiskScore({
                            daysSinceLastAppointment: daysSinceLastAppointment,
                            appointmentFrequency: appointmentFrequency,
                            responseRate: responseRate,
                            satisfactionScore: satisfactionScore,
                            cancellationRate: cancellationRate,
                            noShowRate: noShowRate,
                            treatmentCompletionRate: treatmentCompletionRate,
                            paymentPunctuality: paymentPunctuality
                        });
                        churnRiskLevel = this.getChurnRiskLevel(churnRiskScore);
                        churnProbability = churnRiskScore;
                        daysToPredicatedChurn = this.predictDaysToChurn(churnRiskScore, appointmentFrequency);
                        metrics = {
                            patient_id: patientId,
                            clinic_id: clinicId,
                            first_appointment_date: (firstAppointment === null || firstAppointment === void 0 ? void 0 : firstAppointment.date) || now.toISOString(),
                            last_appointment_date: (lastAppointment === null || lastAppointment === void 0 ? void 0 : lastAppointment.date) || now.toISOString(),
                            days_since_last_appointment: daysSinceLastAppointment,
                            total_appointments: totalAppointments,
                            appointment_frequency: appointmentFrequency,
                            response_rate: responseRate,
                            satisfaction_score: satisfactionScore,
                            referral_count: 0, // TODO: Implement referral tracking
                            complaints_count: 0, // TODO: Implement complaint tracking
                            total_spent: totalSpent,
                            average_ticket: averageTicket,
                            lifetime_value: lifetimeValue,
                            payment_punctuality: paymentPunctuality,
                            cancellation_rate: cancellationRate,
                            no_show_rate: noShowRate,
                            rebooking_rate: rebookingRate,
                            treatment_completion_rate: treatmentCompletionRate,
                            churn_risk_score: churnRiskScore,
                            churn_risk_level: churnRiskLevel,
                            churn_probability: churnProbability,
                            days_to_predicted_churn: daysToPredicatedChurn,
                            last_calculated: now.toISOString()
                        };
                        return [4 /*yield*/, supabase
                                .from('patient_retention_metrics')
                                .upsert(metrics, { onConflict: 'patient_id,clinic_id' })
                                .select()
                                .single()];
                    case 5:
                        _d = _e.sent(), savedMetrics = _d.data, saveError = _d.error;
                        if (saveError)
                            throw saveError;
                        return [2 /*return*/, savedMetrics];
                    case 6:
                        error_1 = _e.sent();
                        console.error('Error calculating patient retention metrics:', error_1);
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get retention metrics for a patient
     */
    RetentionAnalyticsService.prototype.getPatientRetentionMetrics = function (patientId, clinicId) {
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
                                .from('patient_retention_metrics')
                                .select('*')
                                .eq('patient_id', patientId)
                                .eq('clinic_id', clinicId)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data || null];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Error getting patient retention metrics:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get retention metrics for all patients in a clinic
     */
    RetentionAnalyticsService.prototype.getClinicRetentionMetrics = function (clinicId_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, limit, offset) {
            var supabase, _a, data, error, error_3;
            if (limit === void 0) { limit = 100; }
            if (offset === void 0) { offset = 0; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('patient_retention_metrics')
                                .select('*')
                                .eq('clinic_id', clinicId)
                                .order('churn_risk_score', { ascending: false })
                                .range(offset, offset + limit - 1)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                    case 3:
                        error_3 = _b.sent();
                        console.error('Error getting clinic retention metrics:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // CHURN PREDICTION
    // =====================================================================================
    /**
     * Generate churn prediction for a patient
     */
    RetentionAnalyticsService.prototype.generateChurnPrediction = function (patientId_1, clinicId_1) {
        return __awaiter(this, arguments, void 0, function (patientId, clinicId, modelType) {
            var metrics, prediction, riskFactors, recommendedActions, churnPrediction, _a, savedPrediction, error, error_4;
            if (modelType === void 0) { modelType = retention_analytics_1.ChurnModelType.ENSEMBLE; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getPatientRetentionMetrics(patientId, clinicId)];
                    case 1:
                        metrics = _b.sent();
                        if (!(!metrics || this.isMetricsOutdated(metrics))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.calculatePatientRetentionMetrics(patientId, clinicId)];
                    case 2:
                        metrics = _b.sent();
                        _b.label = 3;
                    case 3:
                        prediction = this.generatePredictionWithModel(metrics, modelType);
                        riskFactors = this.identifyRiskFactors(metrics);
                        return [4 /*yield*/, this.generateRecommendedActions(metrics, prediction.churnProbability, prediction.riskLevel)];
                    case 4:
                        recommendedActions = _b.sent();
                        churnPrediction = {
                            patient_id: patientId,
                            clinic_id: clinicId,
                            churn_probability: prediction.churnProbability,
                            confidence_score: prediction.confidenceScore,
                            risk_level: prediction.riskLevel,
                            predicted_churn_date: prediction.predictedChurnDate,
                            days_until_churn: prediction.daysUntilChurn,
                            model_version: '1.0.0',
                            model_type: modelType,
                            prediction_date: new Date().toISOString(),
                            top_risk_factors: riskFactors,
                            feature_scores: prediction.featureScores,
                            recommended_actions: recommendedActions,
                            intervention_priority: this.getInterventionPriority(prediction.churnProbability),
                            is_validated: false,
                            actual_outcome: null,
                            prediction_accuracy: null
                        };
                        return [4 /*yield*/, supabase
                                .from('churn_predictions')
                                .insert(churnPrediction)
                                .select()
                                .single()];
                    case 5:
                        _a = _b.sent(), savedPrediction = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, savedPrediction];
                    case 6:
                        error_4 = _b.sent();
                        console.error('Error generating churn prediction:', error_4);
                        throw error_4;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get churn predictions for clinic
     */
    RetentionAnalyticsService.prototype.getChurnPredictions = function (clinicId_1, riskLevel_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, riskLevel, limit, offset) {
            var query, _a, data, error, error_5;
            if (limit === void 0) { limit = 100; }
            if (offset === void 0) { offset = 0; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('churn_predictions')
                            .select('*')
                            .eq('clinic_id', clinicId);
                        if (riskLevel) {
                            query = query.eq('risk_level', riskLevel);
                        }
                        return [4 /*yield*/, query
                                .order('churn_probability', { ascending: false })
                                .range(offset, offset + limit - 1)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error getting churn predictions:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // RETENTION STRATEGIES
    // =====================================================================================
    /**
     * Create retention strategy
     */
    RetentionAnalyticsService.prototype.createRetentionStrategy = function (strategy) {
        return __awaiter(this, void 0, void 0, function () {
            var newStrategy, _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        newStrategy = __assign(__assign({}, strategy), { success_rate: 0, patients_targeted: 0, patients_retained: 0, cost_per_retention: 0, roi: 0 });
                        return [4 /*yield*/, supabase
                                .from('retention_strategies')
                                .insert(newStrategy)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error creating retention strategy:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get retention strategies for clinic
     */
    RetentionAnalyticsService.prototype.getRetentionStrategies = function (clinicId_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, activeOnly) {
            var query, _a, data, error, error_7;
            if (activeOnly === void 0) { activeOnly = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('retention_strategies')
                            .select('*')
                            .eq('clinic_id', clinicId);
                        if (activeOnly) {
                            query = query.eq('is_active', true);
                        }
                        return [4 /*yield*/, query.order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Error getting retention strategies:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute retention strategy for specific patients
     */
    RetentionAnalyticsService.prototype.executeRetentionStrategy = function (strategyId, patientIds) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, strategy, strategyError, performances, _i, patientIds_1, patientId, performance_1, error_8, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('retention_strategies')
                                .select('*')
                                .eq('id', strategyId)
                                .single()];
                    case 2:
                        _a = _b.sent(), strategy = _a.data, strategyError = _a.error;
                        if (strategyError)
                            throw strategyError;
                        if (!(strategy === null || strategy === void 0 ? void 0 : strategy.is_active)) {
                            throw new Error('Strategy is not active');
                        }
                        performances = [];
                        _i = 0, patientIds_1 = patientIds;
                        _b.label = 3;
                    case 3:
                        if (!(_i < patientIds_1.length)) return [3 /*break*/, 8];
                        patientId = patientIds_1[_i];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.executeStrategyForPatient(strategy, patientId)];
                    case 5:
                        performance_1 = _b.sent();
                        performances.push(performance_1);
                        return [3 /*break*/, 7];
                    case 6:
                        error_8 = _b.sent();
                        console.error("Error executing strategy for patient ".concat(patientId, ":"), error_8);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8: 
                    // Update strategy performance metrics
                    return [4 /*yield*/, this.updateStrategyPerformance(strategyId, performances)];
                    case 9:
                        // Update strategy performance metrics
                        _b.sent();
                        return [2 /*return*/, performances];
                    case 10:
                        error_9 = _b.sent();
                        console.error('Error executing retention strategy:', error_9);
                        throw error_9;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // ANALYTICS DASHBOARD
    // =====================================================================================
    /**
     * Generate comprehensive retention analytics dashboard
     */
    RetentionAnalyticsService.prototype.generateRetentionAnalyticsDashboard = function (clinicId, periodStart, periodEnd) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, overview, churnAnalysis, strategyPerformance, retentionBySegment, retentionTrends, churnPredictionsSummary, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.getRetentionOverview(clinicId, periodStart, periodEnd),
                                this.getChurnAnalysis(clinicId, periodStart, periodEnd),
                                this.getStrategyPerformanceMetrics(clinicId, periodStart, periodEnd),
                                this.getRetentionBySegment(clinicId, periodStart, periodEnd),
                                this.getRetentionTrends(clinicId, periodStart, periodEnd),
                                this.getChurnPredictionsSummary(clinicId, periodStart, periodEnd)
                            ])];
                    case 1:
                        _a = _b.sent(), overview = _a[0], churnAnalysis = _a[1], strategyPerformance = _a[2], retentionBySegment = _a[3], retentionTrends = _a[4], churnPredictionsSummary = _a[5];
                        return [2 /*return*/, {
                                clinic_id: clinicId,
                                period_start: periodStart,
                                period_end: periodEnd,
                                overview: overview,
                                churn_analysis: churnAnalysis,
                                strategy_performance: strategyPerformance,
                                retention_by_segment: retentionBySegment,
                                retention_trends: retentionTrends,
                                churn_predictions_summary: churnPredictionsSummary,
                                generated_at: new Date().toISOString()
                            }];
                    case 2:
                        error_10 = _b.sent();
                        console.error('Error generating retention analytics dashboard:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // =====================================================================================
    // PRIVATE HELPER METHODS
    // =====================================================================================
    /**
     * Calculate churn risk score based on multiple factors
     */
    RetentionAnalyticsService.prototype.calculateChurnRiskScore = function (factors) {
        // Weighted scoring algorithm
        var weights = {
            daysSinceLastAppointment: 0.25,
            appointmentFrequency: 0.15,
            responseRate: 0.15,
            satisfactionScore: 0.15,
            cancellationRate: 0.10,
            noShowRate: 0.10,
            treatmentCompletionRate: 0.05,
            paymentPunctuality: 0.05
        };
        // Normalize factors to 0-1 scale (higher = more risk)
        var normalizedFactors = {
            daysSinceLastAppointment: Math.min(factors.daysSinceLastAppointment / 90, 1), // 90 days = max risk
            appointmentFrequency: Math.max(0, 1 - factors.appointmentFrequency / 2), // 2 appointments/month = no risk
            responseRate: 1 - factors.responseRate,
            satisfactionScore: Math.max(0, 1 - factors.satisfactionScore / 10),
            cancellationRate: factors.cancellationRate,
            noShowRate: factors.noShowRate,
            treatmentCompletionRate: 1 - factors.treatmentCompletionRate,
            paymentPunctuality: 1 - factors.paymentPunctuality
        };
        // Calculate weighted score
        var score = 0;
        for (var _i = 0, _a = Object.entries(normalizedFactors); _i < _a.length; _i++) {
            var _b = _a[_i], factor = _b[0], value = _b[1];
            score += value * weights[factor];
        }
        return Math.min(Math.max(score, 0), 1); // Clamp to 0-1
    };
    /**
     * Get churn risk level from score
     */
    RetentionAnalyticsService.prototype.getChurnRiskLevel = function (score) {
        if (score >= 0.8)
            return retention_analytics_1.ChurnRiskLevel.CRITICAL;
        if (score >= 0.6)
            return retention_analytics_1.ChurnRiskLevel.HIGH;
        if (score >= 0.3)
            return retention_analytics_1.ChurnRiskLevel.MEDIUM;
        return retention_analytics_1.ChurnRiskLevel.LOW;
    };
    /**
     * Predict days to churn based on risk score and patterns
     */
    RetentionAnalyticsService.prototype.predictDaysToChurn = function (churnRiskScore, appointmentFrequency) {
        if (churnRiskScore < 0.3)
            return null; // Low risk, no prediction
        // Use inverse relationship: higher risk = sooner churn
        var baseChurnDays = 180; // 6 months base
        var riskMultiplier = 1 - churnRiskScore;
        var frequencyMultiplier = Math.max(0.5, appointmentFrequency / 2); // Regular patients stay longer
        return Math.round(baseChurnDays * riskMultiplier * frequencyMultiplier);
    };
    /**
     * Check if metrics are outdated (older than 7 days)
     */
    RetentionAnalyticsService.prototype.isMetricsOutdated = function (metrics) {
        var lastCalculated = new Date(metrics.last_calculated);
        var sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastCalculated < sevenDaysAgo;
    };
    /**
     * Generate prediction using specified model
     */
    RetentionAnalyticsService.prototype.generatePredictionWithModel = function (metrics, modelType) {
        // For now, use the existing churn risk score as base
        // In production, this would use actual ML models
        var churnProbability = metrics.churn_risk_score;
        var confidenceScore = 0.85; // Static for now
        var riskLevel = metrics.churn_risk_level;
        var daysUntilChurn = metrics.days_to_predicted_churn;
        var predictedChurnDate = daysUntilChurn
            ? new Date(Date.now() + daysUntilChurn * 24 * 60 * 60 * 1000).toISOString()
            : null;
        var featureScores = {
            'days_since_last_appointment': metrics.days_since_last_appointment / 90,
            'appointment_frequency': Math.max(0, 1 - metrics.appointment_frequency / 2),
            'response_rate': 1 - metrics.response_rate,
            'satisfaction_score': 1 - metrics.satisfaction_score / 10,
            'cancellation_rate': metrics.cancellation_rate,
            'no_show_rate': metrics.no_show_rate,
            'payment_punctuality': 1 - metrics.payment_punctuality
        };
        return {
            churnProbability: churnProbability,
            confidenceScore: confidenceScore,
            riskLevel: riskLevel,
            predictedChurnDate: predictedChurnDate,
            daysUntilChurn: daysUntilChurn,
            featureScores: featureScores
        };
    };
    /**
     * Identify top risk factors for a patient
     */
    RetentionAnalyticsService.prototype.identifyRiskFactors = function (metrics) {
        var factors = [
            {
                factor: 'days_since_last_appointment',
                importance: 0.25,
                current_value: metrics.days_since_last_appointment,
                threshold_value: 30,
                description: 'Days since last appointment'
            },
            {
                factor: 'appointment_frequency',
                importance: 0.15,
                current_value: metrics.appointment_frequency,
                threshold_value: 1,
                description: 'Monthly appointment frequency'
            },
            {
                factor: 'response_rate',
                importance: 0.15,
                current_value: metrics.response_rate,
                threshold_value: 0.7,
                description: 'Follow-up response rate'
            },
            {
                factor: 'satisfaction_score',
                importance: 0.15,
                current_value: metrics.satisfaction_score,
                threshold_value: 7,
                description: 'Average satisfaction score'
            },
            {
                factor: 'cancellation_rate',
                importance: 0.10,
                current_value: metrics.cancellation_rate,
                threshold_value: 0.2,
                description: 'Appointment cancellation rate'
            }
        ];
        // Sort by importance and return top 5
        return factors.sort(function (a, b) { return b.importance - a.importance; }).slice(0, 5);
    };
    /**
     * Generate recommended retention actions
     */
    RetentionAnalyticsService.prototype.generateRecommendedActions = function (metrics, churnProbability, riskLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var actions;
            return __generator(this, function (_a) {
                actions = [];
                // High-risk patients get more aggressive interventions
                if (riskLevel === retention_analytics_1.ChurnRiskLevel.CRITICAL || riskLevel === retention_analytics_1.ChurnRiskLevel.HIGH) {
                    actions.push({
                        id: crypto.randomUUID(),
                        action_type: retention_analytics_1.RetentionActionType.SCHEDULE_CALL,
                        title: 'Personal outreach call',
                        description: 'Schedule a personal call to address concerns and re-engage',
                        channel: retention_analytics_1.CommunicationChannel.PHONE,
                        personalization_rules: [],
                        delay_hours: 2,
                        max_attempts: 2,
                        retry_interval_hours: 48,
                        patient_segments: [],
                        exclusion_rules: [],
                        success_rate: 0.65,
                        cost: 25,
                        created_at: new Date().toISOString()
                    });
                    if (metrics.satisfaction_score < 7) {
                        actions.push({
                            id: crypto.randomUUID(),
                            action_type: retention_analytics_1.RetentionActionType.SEND_SURVEY,
                            title: 'Satisfaction feedback survey',
                            description: 'Send satisfaction survey to understand pain points',
                            channel: retention_analytics_1.CommunicationChannel.EMAIL,
                            personalization_rules: [],
                            delay_hours: 1,
                            max_attempts: 1,
                            retry_interval_hours: 72,
                            patient_segments: [],
                            exclusion_rules: [],
                            success_rate: 0.45,
                            cost: 5,
                            created_at: new Date().toISOString()
                        });
                    }
                }
                // Medium risk gets follow-up messaging
                if (riskLevel === retention_analytics_1.ChurnRiskLevel.MEDIUM) {
                    actions.push({
                        id: crypto.randomUUID(),
                        action_type: retention_analytics_1.RetentionActionType.SEND_MESSAGE,
                        title: 'Check-in message',
                        description: 'Send personalized check-in message via WhatsApp',
                        channel: retention_analytics_1.CommunicationChannel.WHATSAPP,
                        personalization_rules: [],
                        delay_hours: 4,
                        max_attempts: 1,
                        retry_interval_hours: 168,
                        patient_segments: [],
                        exclusion_rules: [],
                        success_rate: 0.35,
                        cost: 2,
                        created_at: new Date().toISOString()
                    });
                }
                return [2 /*return*/, actions];
            });
        });
    };
    /**
     * Get intervention priority based on churn probability
     */
    RetentionAnalyticsService.prototype.getInterventionPriority = function (churnProbability) {
        if (churnProbability >= 0.8)
            return retention_analytics_1.InterventionPriority.URGENT;
        if (churnProbability >= 0.6)
            return retention_analytics_1.InterventionPriority.HIGH;
        if (churnProbability >= 0.3)
            return retention_analytics_1.InterventionPriority.MEDIUM;
        return retention_analytics_1.InterventionPriority.LOW;
    };
    /**
     * Execute strategy for a single patient
     */
    RetentionAnalyticsService.prototype.executeStrategyForPatient = function (strategy, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var executionId, executionDate, performance, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        executionId = crypto.randomUUID();
                        executionDate = new Date().toISOString();
                        performance = {
                            clinic_id: strategy.clinic_id,
                            strategy_id: strategy.id,
                            patient_id: patientId,
                            execution_date: executionDate,
                            actions_executed: strategy.actions.map(function (a) { return a.id; }),
                            total_cost: strategy.actions.reduce(function (sum, action) { return sum + action.cost; }, 0),
                            outcome: retention_analytics_1.RetentionOutcome.PENDING,
                            success: false,
                            retention_period_days: 0,
                            follow_up_appointments: 0,
                            revenue_generated: 0,
                            patient_response: null,
                            satisfaction_change: 0,
                            engagement_change: 0,
                            time_to_response: 0,
                            cost_effectiveness: 0,
                            retention_probability_improvement: 0
                        };
                        return [4 /*yield*/, supabase
                                .from('retention_performance')
                                .insert(performance)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * Update strategy performance based on execution results
     */
    RetentionAnalyticsService.prototype.updateStrategyPerformance = function (strategyId, performances) {
        return __awaiter(this, void 0, void 0, function () {
            var successful, total, successRate, totalCost, costPerRetention, totalRevenue, roi, supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        successful = performances.filter(function (p) { return p.success; }).length;
                        total = performances.length;
                        successRate = total > 0 ? successful / total : 0;
                        totalCost = performances.reduce(function (sum, p) { return sum + p.total_cost; }, 0);
                        costPerRetention = successful > 0 ? totalCost / successful : 0;
                        totalRevenue = performances.reduce(function (sum, p) { return sum + p.revenue_generated; }, 0);
                        roi = totalCost > 0 ? (totalRevenue - totalCost) / totalCost : 0;
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('retention_strategies')
                                .update({
                                success_rate: successRate,
                                patients_targeted: total,
                                patients_retained: successful,
                                cost_per_retention: costPerRetention,
                                roi: roi,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', strategyId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Placeholder methods for dashboard analytics (would implement full logic)
    RetentionAnalyticsService.prototype.getRetentionOverview = function (clinicId, periodStart, periodEnd) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would query actual data
                return [2 /*return*/, {
                        total_patients: 1250,
                        active_patients: 980,
                        at_risk_patients: 125,
                        churned_patients: 45,
                        overall_retention_rate: 0.78,
                        churn_rate: 0.22,
                        average_lifetime_value: 1850,
                        average_retention_period_days: 365,
                        retention_rate_change: 0.05,
                        churn_rate_change: -0.03,
                        ltv_change: 125
                    }];
            });
        });
    };
    RetentionAnalyticsService.prototype.getChurnAnalysis = function (clinicId, periodStart, periodEnd) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                // Implementation would analyze actual churn data
                return [2 /*return*/, {
                        churn_reasons: [],
                        churn_by_risk_level: (_a = {},
                            _a[retention_analytics_1.ChurnRiskLevel.LOW] = 10,
                            _a[retention_analytics_1.ChurnRiskLevel.MEDIUM] = 15,
                            _a[retention_analytics_1.ChurnRiskLevel.HIGH] = 12,
                            _a[retention_analytics_1.ChurnRiskLevel.CRITICAL] = 8,
                            _a),
                        churn_patterns: [],
                        seasonal_trends: []
                    }];
            });
        });
    };
    RetentionAnalyticsService.prototype.getStrategyPerformanceMetrics = function (clinicId, periodStart, periodEnd) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    RetentionAnalyticsService.prototype.getRetentionBySegment = function (clinicId, periodStart, periodEnd) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    RetentionAnalyticsService.prototype.getRetentionTrends = function (clinicId, periodStart, periodEnd) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    RetentionAnalyticsService.prototype.getChurnPredictionsSummary = function (clinicId, periodStart, periodEnd) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        total_predictions: 125,
                        high_risk_patients: 25,
                        medium_risk_patients: 45,
                        low_risk_patients: 55,
                        model_accuracy: 0.87,
                        predictions_this_week: 18,
                        interventions_triggered: 12,
                        successful_interventions: 8
                    }];
            });
        });
    };
    return RetentionAnalyticsService;
}());
exports.RetentionAnalyticsService = RetentionAnalyticsService;
