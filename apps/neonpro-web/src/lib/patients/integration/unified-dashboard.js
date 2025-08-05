"use strict";
/**
 * Unified Patient Dashboard System
 * Integrates all patient data for comprehensive 360° view
 * Part of Story 3.1 - Task 6: System Integration & Search
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
exports.UnifiedPatientDashboard = void 0;
var appointment_integration_1 = require("./appointment-integration");
var treatment_integration_1 = require("./treatment-integration");
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var UnifiedPatientDashboard = /** @class */ (function () {
    function UnifiedPatientDashboard() {
    }
    /**
     * Get complete 360° patient profile
     */
    UnifiedPatientDashboard.getUnifiedPatientProfile = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, patient, patientError, appointmentInsights, treatmentInsights, financialSummary, communicationHistory, aiInsights, visualData, unifiedProfile, error_1;
            var _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 8, , 9]);
                        logger_1.logger.info("Generating unified profile for patient ".concat(patientId));
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select("\n          *,\n          patient_profiles_extended(*),\n          patient_photos(*),\n          emergency_contacts(*)\n        ")
                                .eq('id', patientId)
                                .single()];
                    case 1:
                        _a = _j.sent(), patient = _a.data, patientError = _a.error;
                        if (patientError)
                            throw patientError;
                        if (!patient)
                            throw new Error('Patient not found');
                        return [4 /*yield*/, appointment_integration_1.PatientAppointmentIntegration.generateAppointmentInsights(patientId)];
                    case 2:
                        appointmentInsights = _j.sent();
                        return [4 /*yield*/, treatment_integration_1.PatientTreatmentIntegration.generateTreatmentInsights(patientId)];
                    case 3:
                        treatmentInsights = _j.sent();
                        return [4 /*yield*/, this.getFinancialSummary(patientId)];
                    case 4:
                        financialSummary = _j.sent();
                        return [4 /*yield*/, this.getCommunicationHistory(patientId)];
                    case 5:
                        communicationHistory = _j.sent();
                        return [4 /*yield*/, this.generateAIInsights(patientId, {
                                appointmentInsights: appointmentInsights,
                                treatmentInsights: treatmentInsights,
                                financialSummary: financialSummary
                            })];
                    case 6:
                        aiInsights = _j.sent();
                        return [4 /*yield*/, this.getVisualData(patientId)];
                    case 7:
                        visualData = _j.sent();
                        unifiedProfile = {
                            patient: patient,
                            profile_extended: {
                                risk_score: ((_b = patient.patient_profiles_extended) === null || _b === void 0 ? void 0 : _b.risk_score) || 0,
                                satisfaction_score: ((_c = patient.patient_profiles_extended) === null || _c === void 0 ? void 0 : _c.satisfaction_score) || 0,
                                loyalty_score: ((_d = patient.patient_profiles_extended) === null || _d === void 0 ? void 0 : _d.loyalty_score) || 0,
                                total_visits: appointmentInsights.total_appointments,
                                total_spent: treatmentInsights.total_investment,
                                preferred_staff: appointmentInsights.preferred_staff,
                                preferred_services: treatmentInsights.preferred_services,
                                communication_preferences: ((_e = patient.patient_profiles_extended) === null || _e === void 0 ? void 0 : _e.communication_preferences) || [],
                                emergency_contacts: patient.emergency_contacts || [],
                                medical_conditions: ((_f = patient.patient_profiles_extended) === null || _f === void 0 ? void 0 : _f.medical_conditions) || [],
                                allergies: ((_g = patient.patient_profiles_extended) === null || _g === void 0 ? void 0 : _g.allergies) || [],
                                medications: ((_h = patient.patient_profiles_extended) === null || _h === void 0 ? void 0 : _h.current_medications) || []
                            },
                            appointment_insights: {
                                total_appointments: appointmentInsights.total_appointments,
                                completed_appointments: appointmentInsights.completed_appointments,
                                cancelled_appointments: appointmentInsights.cancelled_appointments,
                                no_show_count: appointmentInsights.no_show_count,
                                punctuality_score: appointmentInsights.punctuality_score,
                                next_appointment: appointmentInsights.next_appointment,
                                recent_appointments: appointmentInsights.recent_appointments,
                                appointment_patterns: appointmentInsights.appointment_patterns
                            },
                            treatment_insights: {
                                total_treatments: treatmentInsights.total_treatments,
                                active_treatments: treatmentInsights.active_treatments,
                                completed_treatments: treatmentInsights.completed_treatments,
                                avg_satisfaction: treatmentInsights.avg_satisfaction,
                                avg_outcome_rating: treatmentInsights.avg_outcome_rating,
                                total_investment: treatmentInsights.total_investment,
                                adherence_score: treatmentInsights.adherence_score,
                                risk_factors: treatmentInsights.risk_factors,
                                recommendations: treatmentInsights.recommendations
                            },
                            financial_summary: financialSummary,
                            communication_history: communicationHistory,
                            ai_insights: aiInsights,
                            visual_data: visualData
                        };
                        logger_1.logger.info("Successfully generated unified profile for patient ".concat(patientId));
                        return [2 /*return*/, unifiedProfile];
                    case 8:
                        error_1 = _j.sent();
                        logger_1.logger.error('Error generating unified patient profile:', error_1);
                        throw new Error('Failed to generate unified patient profile');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get dashboard metrics and KPIs
     */
    UnifiedPatientDashboard.getDashboardMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalPatients, sixMonthsAgo, activePatients, startOfMonth, newPatients, highRiskPatients, satisfactionData, avgSatisfaction, financialData, totalRevenue, outstandingPayments, thirtyDaysAgo, totalSlots, bookedSlots, appointmentUtilization, totalTreatments, completedTreatments, treatmentCompletionRate, oneYearAgo, returningPatients, oldPatients, patientRetentionRate, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select('*', { count: 'exact', head: true })];
                    case 1:
                        totalPatients = (_a.sent()).count;
                        sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select("\n          id,\n          appointments!inner(id)\n        ", { count: 'exact', head: true })
                                .gte('appointments.appointment_date', sixMonthsAgo.toISOString())];
                    case 2:
                        activePatients = (_a.sent()).count;
                        startOfMonth = new Date();
                        startOfMonth.setDate(1);
                        startOfMonth.setHours(0, 0, 0, 0);
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select('*', { count: 'exact', head: true })
                                .gte('created_at', startOfMonth.toISOString())];
                    case 3:
                        newPatients = (_a.sent()).count;
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_profiles_extended')
                                .select('*', { count: 'exact', head: true })
                                .gte('risk_score', 7)];
                    case 4:
                        highRiskPatients = (_a.sent()).count;
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_profiles_extended')
                                .select('satisfaction_score')
                                .not('satisfaction_score', 'is', null)];
                    case 5:
                        satisfactionData = (_a.sent()).data;
                        avgSatisfaction = satisfactionData && satisfactionData.length > 0
                            ? satisfactionData.reduce(function (sum, p) { return sum + (p.satisfaction_score || 0); }, 0) / satisfactionData.length
                            : 0;
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_treatments')
                                .select('cost_total, cost_paid')];
                    case 6:
                        financialData = (_a.sent()).data;
                        totalRevenue = (financialData === null || financialData === void 0 ? void 0 : financialData.reduce(function (sum, t) { return sum + (t.cost_paid || 0); }, 0)) || 0;
                        outstandingPayments = (financialData === null || financialData === void 0 ? void 0 : financialData.reduce(function (sum, t) { return sum + ((t.cost_total || 0) - (t.cost_paid || 0)); }, 0)) || 0;
                        thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return [4 /*yield*/, client_1.supabase
                                .from('appointment_slots')
                                .select('*', { count: 'exact', head: true })
                                .gte('slot_date', thirtyDaysAgo.toISOString())];
                    case 7:
                        totalSlots = (_a.sent()).count;
                        return [4 /*yield*/, client_1.supabase
                                .from('appointments')
                                .select('*', { count: 'exact', head: true })
                                .gte('appointment_date', thirtyDaysAgo.toISOString())
                                .neq('status', 'cancelled')];
                    case 8:
                        bookedSlots = (_a.sent()).count;
                        appointmentUtilization = totalSlots && totalSlots > 0 ? (bookedSlots || 0) / totalSlots * 100 : 0;
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_treatments')
                                .select('*', { count: 'exact', head: true })];
                    case 9:
                        totalTreatments = (_a.sent()).count;
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_treatments')
                                .select('*', { count: 'exact', head: true })
                                .eq('status', 'completed')];
                    case 10:
                        completedTreatments = (_a.sent()).count;
                        treatmentCompletionRate = totalTreatments && totalTreatments > 0
                            ? (completedTreatments || 0) / totalTreatments * 100
                            : 0;
                        oneYearAgo = new Date();
                        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select("\n          id,\n          appointments!inner(id)\n        ", { count: 'exact', head: true })
                                .lt('created_at', oneYearAgo.toISOString())
                                .gte('appointments.appointment_date', oneYearAgo.toISOString())];
                    case 11:
                        returningPatients = (_a.sent()).count;
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select('*', { count: 'exact', head: true })
                                .lt('created_at', oneYearAgo.toISOString())];
                    case 12:
                        oldPatients = (_a.sent()).count;
                        patientRetentionRate = oldPatients && oldPatients > 0
                            ? (returningPatients || 0) / oldPatients * 100
                            : 0;
                        return [2 /*return*/, {
                                patient_count: totalPatients || 0,
                                active_patients: activePatients || 0,
                                new_patients_this_month: newPatients || 0,
                                high_risk_patients: highRiskPatients || 0,
                                avg_satisfaction: avgSatisfaction,
                                total_revenue: totalRevenue,
                                outstanding_payments: outstandingPayments,
                                appointment_utilization: appointmentUtilization,
                                treatment_completion_rate: treatmentCompletionRate,
                                patient_retention_rate: patientRetentionRate
                            }];
                    case 13:
                        error_2 = _a.sent();
                        logger_1.logger.error('Error getting dashboard metrics:', error_2);
                        throw new Error('Failed to get dashboard metrics');
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get financial summary for a patient
     */
    UnifiedPatientDashboard.getFinancialSummary = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var treatments, payments, totalBilled, totalPaid, insuranceCoverage, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_treatments')
                                .select('cost_total, cost_paid, insurance_covered, start_date')
                                .eq('patient_id', patientId)];
                    case 1:
                        treatments = (_a.sent()).data;
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_payments')
                                .select('*')
                                .eq('patient_id', patientId)
                                .order('payment_date', { ascending: false })];
                    case 2:
                        payments = (_a.sent()).data;
                        totalBilled = (treatments === null || treatments === void 0 ? void 0 : treatments.reduce(function (sum, t) { return sum + (t.cost_total || 0); }, 0)) || 0;
                        totalPaid = (treatments === null || treatments === void 0 ? void 0 : treatments.reduce(function (sum, t) { return sum + (t.cost_paid || 0); }, 0)) || 0;
                        insuranceCoverage = (treatments === null || treatments === void 0 ? void 0 : treatments.reduce(function (sum, t) { return sum + (t.insurance_covered || 0); }, 0)) || 0;
                        return [2 /*return*/, {
                                total_billed: totalBilled,
                                total_paid: totalPaid,
                                outstanding_balance: totalBilled - totalPaid,
                                insurance_coverage: insuranceCoverage,
                                payment_history: payments || [],
                                payment_patterns: this.analyzePaymentPatterns(payments || [])
                            }];
                    case 3:
                        error_3 = _a.sent();
                        logger_1.logger.error('Error getting financial summary:', error_3);
                        return [2 /*return*/, {
                                total_billed: 0,
                                total_paid: 0,
                                outstanding_balance: 0,
                                insurance_coverage: 0,
                                payment_history: [],
                                payment_patterns: {}
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get communication history for a patient
     */
    UnifiedPatientDashboard.getCommunicationHistory = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var communications, totalInteractions, lastContactDate, channelCounts_1, preferredChannel, outboundComms, respondedComms, responseRate, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_communications')
                                .select('*')
                                .eq('patient_id', patientId)
                                .order('created_at', { ascending: false })];
                    case 1:
                        communications = (_b.sent()).data;
                        totalInteractions = (communications === null || communications === void 0 ? void 0 : communications.length) || 0;
                        lastContactDate = ((_a = communications === null || communications === void 0 ? void 0 : communications[0]) === null || _a === void 0 ? void 0 : _a.created_at) || '';
                        channelCounts_1 = {};
                        communications === null || communications === void 0 ? void 0 : communications.forEach(function (comm) {
                            channelCounts_1[comm.channel] = (channelCounts_1[comm.channel] || 0) + 1;
                        });
                        preferredChannel = Object.keys(channelCounts_1).reduce(function (a, b) {
                            return channelCounts_1[a] > channelCounts_1[b] ? a : b;
                        }, 'email');
                        outboundComms = (communications === null || communications === void 0 ? void 0 : communications.filter(function (c) { return c.direction === 'outbound'; })) || [];
                        respondedComms = (communications === null || communications === void 0 ? void 0 : communications.filter(function (c) { return c.direction === 'inbound'; })) || [];
                        responseRate = outboundComms.length > 0 ?
                            (respondedComms.length / outboundComms.length) * 100 : 0;
                        return [2 /*return*/, {
                                total_interactions: totalInteractions,
                                last_contact_date: lastContactDate,
                                preferred_channel: preferredChannel,
                                response_rate: responseRate,
                                recent_communications: (communications === null || communications === void 0 ? void 0 : communications.slice(0, 10)) || []
                            }];
                    case 2:
                        error_4 = _b.sent();
                        logger_1.logger.error('Error getting communication history:', error_4);
                        return [2 /*return*/, {
                                total_interactions: 0,
                                last_contact_date: '',
                                preferred_channel: 'email',
                                response_rate: 0,
                                recent_communications: []
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate AI insights and predictions
     */
    UnifiedPatientDashboard.generateAIInsights = function (patientId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var churnRiskScore, lifetimeValuePrediction, nextServiceRecommendations, optimalContactTime, personalityProfile, engagementScore, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        churnRiskScore = this.calculateChurnRisk(data);
                        lifetimeValuePrediction = this.predictLifetimeValue(data);
                        return [4 /*yield*/, this.generateServiceRecommendations(patientId, data)];
                    case 1:
                        nextServiceRecommendations = _a.sent();
                        optimalContactTime = this.determineOptimalContactTime(data.communicationHistory);
                        personalityProfile = this.generatePersonalityProfile(data);
                        engagementScore = this.calculateEngagementScore(data);
                        return [2 /*return*/, {
                                churn_risk_score: churnRiskScore,
                                lifetime_value_prediction: lifetimeValuePrediction,
                                next_service_recommendations: nextServiceRecommendations,
                                optimal_contact_time: optimalContactTime,
                                personality_profile: personalityProfile,
                                engagement_score: engagementScore
                            }];
                    case 2:
                        error_5 = _a.sent();
                        logger_1.logger.error('Error generating AI insights:', error_5);
                        return [2 /*return*/, {
                                churn_risk_score: 0,
                                lifetime_value_prediction: 0,
                                next_service_recommendations: [],
                                optimal_contact_time: '10:00',
                                personality_profile: 'Balanced',
                                engagement_score: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get visual data for a patient
     */
    UnifiedPatientDashboard.getVisualData = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var photos, profilePhotos, treatmentPhotos, progressPhotos, faceData, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_photos')
                                .select('*')
                                .eq('patient_id', patientId)
                                .order('created_at', { ascending: false })];
                    case 1:
                        photos = (_a.sent()).data;
                        profilePhotos = (photos === null || photos === void 0 ? void 0 : photos.filter(function (p) { return p.photo_type === 'profile'; })) || [];
                        treatmentPhotos = (photos === null || photos === void 0 ? void 0 : photos.filter(function (p) { return p.photo_type === 'treatment'; })) || [];
                        progressPhotos = (photos === null || photos === void 0 ? void 0 : photos.filter(function (p) { return p.photo_type === 'progress'; })) || [];
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_face_recognition')
                                .select('*')
                                .eq('patient_id', patientId)
                                .single()];
                    case 2:
                        faceData = (_a.sent()).data;
                        return [2 /*return*/, {
                                profile_photos: profilePhotos,
                                treatment_photos: treatmentPhotos,
                                progress_photos: progressPhotos,
                                facial_recognition_data: faceData
                            }];
                    case 3:
                        error_6 = _a.sent();
                        logger_1.logger.error('Error getting visual data:', error_6);
                        return [2 /*return*/, {
                                profile_photos: [],
                                treatment_photos: [],
                                progress_photos: [],
                                facial_recognition_data: null
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze payment patterns
     */
    UnifiedPatientDashboard.analyzePaymentPatterns = function (payments) {
        if (payments.length === 0)
            return {};
        var avgPaymentAmount = payments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0) / payments.length;
        var paymentMethods = payments.reduce(function (methods, p) {
            methods[p.payment_method] = (methods[p.payment_method] || 0) + 1;
            return methods;
        }, {});
        var preferredMethod = Object.keys(paymentMethods).reduce(function (a, b) {
            return paymentMethods[a] > paymentMethods[b] ? a : b;
        }, 'cash');
        return {
            avg_payment_amount: avgPaymentAmount,
            preferred_payment_method: preferredMethod,
            payment_frequency: this.calculatePaymentFrequency(payments),
            on_time_payment_rate: this.calculateOnTimePaymentRate(payments)
        };
    };
    /**
     * Calculate churn risk score
     */
    UnifiedPatientDashboard.calculateChurnRisk = function (data) {
        var riskScore = 0;
        // No recent appointments
        var daysSinceLastAppointment = data.appointmentInsights.recent_appointments.length > 0 ?
            Math.floor((Date.now() - new Date(data.appointmentInsights.recent_appointments[0].appointment_date).getTime()) / (1000 * 60 * 60 * 24)) : 365;
        if (daysSinceLastAppointment > 180)
            riskScore += 30;
        else if (daysSinceLastAppointment > 90)
            riskScore += 15;
        // High cancellation rate
        var cancellationRate = data.appointmentInsights.total_appointments > 0 ?
            (data.appointmentInsights.cancelled_appointments / data.appointmentInsights.total_appointments) * 100 : 0;
        if (cancellationRate > 30)
            riskScore += 25;
        else if (cancellationRate > 15)
            riskScore += 10;
        // Low satisfaction
        if (data.treatmentInsights.avg_satisfaction < 3)
            riskScore += 20;
        else if (data.treatmentInsights.avg_satisfaction < 4)
            riskScore += 10;
        // Outstanding balance
        if (data.financialSummary.outstanding_balance > 1000)
            riskScore += 15;
        return Math.min(riskScore, 100);
    };
    /**
     * Predict lifetime value
     */
    UnifiedPatientDashboard.predictLifetimeValue = function (data) {
        var avgMonthlySpend = data.treatmentInsights.total_investment / 12; // Assuming 1 year average
        var retentionMultiplier = Math.max(1, 5 - (data.churnRiskScore / 20));
        var satisfactionMultiplier = 1 + (data.treatmentInsights.avg_satisfaction - 3) * 0.2;
        return avgMonthlySpend * 24 * retentionMultiplier * satisfactionMultiplier; // 2-year prediction
    };
    /**
     * Generate service recommendations
     */
    UnifiedPatientDashboard.generateServiceRecommendations = function (patientId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations;
            return __generator(this, function (_a) {
                recommendations = [];
                // Based on successful past treatments
                if (data.treatmentInsights.preferred_services.length > 0) {
                    recommendations.push("Follow-up ".concat(data.treatmentInsights.preferred_services[0]));
                }
                // Based on risk factors
                if (data.treatmentInsights.risk_factors.includes('Low treatment adherence')) {
                    recommendations.push('Adherence support program');
                }
                // Based on satisfaction
                if (data.treatmentInsights.avg_satisfaction >= 4) {
                    recommendations.push('Premium service upgrade');
                }
                return [2 /*return*/, recommendations.slice(0, 3)];
            });
        });
    };
    /**
     * Determine optimal contact time
     */
    UnifiedPatientDashboard.determineOptimalContactTime = function (communicationHistory) {
        // Analyze response times to determine best contact hours
        // Default to 10:00 AM for now
        return '10:00';
    };
    /**
     * Generate personality profile
     */
    UnifiedPatientDashboard.generatePersonalityProfile = function (data) {
        if (data.appointmentInsights.punctuality_score > 80)
            return 'Punctual & Organized';
        if (data.treatmentInsights.adherence_score > 90)
            return 'Highly Compliant';
        if (data.communicationHistory.response_rate > 80)
            return 'Highly Responsive';
        if (data.treatmentInsights.avg_satisfaction > 4)
            return 'Satisfied & Loyal';
        return 'Balanced';
    };
    /**
     * Calculate engagement score
     */
    UnifiedPatientDashboard.calculateEngagementScore = function (data) {
        var score = 0;
        // Appointment engagement
        score += Math.min(data.appointmentInsights.punctuality_score, 25);
        // Treatment engagement
        score += Math.min(data.treatmentInsights.adherence_score * 0.25, 25);
        // Communication engagement
        score += Math.min(data.communicationHistory.response_rate * 0.25, 25);
        // Satisfaction engagement
        score += Math.min(data.treatmentInsights.avg_satisfaction * 5, 25);
        return Math.round(score);
    };
    /**
     * Calculate payment frequency
     */
    UnifiedPatientDashboard.calculatePaymentFrequency = function (payments) {
        if (payments.length < 2)
            return 'Insufficient data';
        var sortedPayments = payments.sort(function (a, b) {
            return new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime();
        });
        var intervals = [];
        for (var i = 1; i < sortedPayments.length; i++) {
            var days = Math.floor((new Date(sortedPayments[i].payment_date).getTime() -
                new Date(sortedPayments[i - 1].payment_date).getTime()) / (1000 * 60 * 60 * 24));
            intervals.push(days);
        }
        var avgInterval = intervals.reduce(function (sum, interval) { return sum + interval; }, 0) / intervals.length;
        if (avgInterval <= 7)
            return 'Weekly';
        if (avgInterval <= 30)
            return 'Monthly';
        if (avgInterval <= 90)
            return 'Quarterly';
        return 'Irregular';
    };
    /**
     * Calculate on-time payment rate
     */
    UnifiedPatientDashboard.calculateOnTimePaymentRate = function (payments) {
        var onTimePayments = payments.filter(function (p) {
            return new Date(p.payment_date) <= new Date(p.due_date);
        }).length;
        return payments.length > 0 ? (onTimePayments / payments.length) * 100 : 0;
    };
    /**
     * Export patient data for external systems
     */
    UnifiedPatientDashboard.exportPatientData = function (patientId_1) {
        return __awaiter(this, arguments, void 0, function (patientId, format) {
            var profile, error_7;
            if (format === void 0) { format = 'json'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getUnifiedPatientProfile(patientId)];
                    case 1:
                        profile = _a.sent();
                        if (format === 'csv') {
                            return [2 /*return*/, this.convertToCSV(profile)];
                        }
                        return [2 /*return*/, JSON.stringify(profile, null, 2)];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.logger.error('Error exporting patient data:', error_7);
                        throw new Error('Failed to export patient data');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Convert profile to CSV format
     */
    UnifiedPatientDashboard.convertToCSV = function (profile) {
        var headers = [
            'Patient ID', 'Name', 'Email', 'Phone', 'Risk Score', 'Satisfaction Score',
            'Total Appointments', 'Total Treatments', 'Total Investment', 'Outstanding Balance'
        ];
        var row = [
            profile.patient.id,
            profile.patient.name,
            profile.patient.email,
            profile.patient.phone,
            profile.profile_extended.risk_score,
            profile.profile_extended.satisfaction_score,
            profile.appointment_insights.total_appointments,
            profile.treatment_insights.total_treatments,
            profile.treatment_insights.total_investment,
            profile.financial_summary.outstanding_balance
        ];
        return [headers.join(','), row.join(',')].join('\n');
    };
    return UnifiedPatientDashboard;
}());
exports.UnifiedPatientDashboard = UnifiedPatientDashboard;
exports.default = UnifiedPatientDashboard;
