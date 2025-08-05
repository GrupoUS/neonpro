"use strict";
/**
 * Treatment Integration System
 * Integrates patient profiles with treatment and medical history
 * Part of Story 3.1 - Task 6: System Integration & Search
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
exports.PatientTreatmentIntegration = void 0;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var PatientTreatmentIntegration = /** @class */ (function () {
    function PatientTreatmentIntegration() {
    }
    /**
     * Get comprehensive treatment history for a patient
     */
    PatientTreatmentIntegration.getPatientTreatmentHistory = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, treatments, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_treatments')
                                .select("\n          *,\n          services(name),\n          staff(name),\n          treatment_sessions(count)\n        ")
                                .eq('patient_id', patientId)
                                .order('start_date', { ascending: false })];
                    case 1:
                        _a = _b.sent(), treatments = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, (treatments === null || treatments === void 0 ? void 0 : treatments.map(function (treatment) {
                                var _a, _b;
                                return ({
                                    id: treatment.id,
                                    patient_id: treatment.patient_id,
                                    treatment_type: treatment.treatment_type,
                                    service_name: ((_a = treatment.services) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Service',
                                    provider_name: ((_b = treatment.staff) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown Provider',
                                    start_date: treatment.start_date,
                                    end_date: treatment.end_date,
                                    status: treatment.status,
                                    progress_percentage: treatment.progress_percentage || 0,
                                    total_sessions: treatment.total_sessions || 0,
                                    completed_sessions: treatment.completed_sessions || 0,
                                    next_session_date: treatment.next_session_date,
                                    notes: treatment.notes || '',
                                    cost_total: treatment.cost_total || 0,
                                    cost_paid: treatment.cost_paid || 0,
                                    insurance_covered: treatment.insurance_covered || 0,
                                    satisfaction_score: treatment.satisfaction_score,
                                    outcome_rating: treatment.outcome_rating,
                                    side_effects: treatment.side_effects || [],
                                    medications: treatment.medications || []
                                });
                            })) || []];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('Error fetching patient treatment history:', error_1);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate comprehensive treatment insights
     */
    PatientTreatmentIntegration.generateTreatmentInsights = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var treatments, activeTreatments, completedTreatments, avgSatisfaction, avgOutcome, totalInvestment, providerCounts, serviceCounts, adherenceScore, riskFactors, recommendations, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getPatientTreatmentHistory(patientId)];
                    case 1:
                        treatments = _b.sent();
                        activeTreatments = treatments.filter(function (t) { return t.status === 'active'; });
                        completedTreatments = treatments.filter(function (t) { return t.status === 'completed'; });
                        avgSatisfaction = this.calculateAverage(treatments.filter(function (t) { return t.satisfaction_score; }).map(function (t) { return t.satisfaction_score; }));
                        avgOutcome = this.calculateAverage(treatments.filter(function (t) { return t.outcome_rating; }).map(function (t) { return t.outcome_rating; }));
                        totalInvestment = treatments.reduce(function (sum, t) { return sum + t.cost_total; }, 0);
                        providerCounts = this.countOccurrences(treatments.map(function (t) { return t.provider_name; }));
                        serviceCounts = this.countOccurrences(treatments.map(function (t) { return t.service_name; }));
                        adherenceScore = this.calculateAdherenceScore(treatments);
                        riskFactors = this.identifyRiskFactors(treatments);
                        recommendations = this.generateRecommendations(treatments, riskFactors);
                        _a = {
                            patient_id: patientId,
                            total_treatments: treatments.length,
                            active_treatments: activeTreatments.length,
                            completed_treatments: completedTreatments.length,
                            avg_satisfaction: avgSatisfaction,
                            avg_outcome_rating: avgOutcome,
                            total_investment: totalInvestment,
                            preferred_providers: Object.keys(providerCounts).slice(0, 3),
                            preferred_services: Object.keys(serviceCounts).slice(0, 3),
                            treatment_frequency: this.calculateTreatmentFrequency(treatments),
                            adherence_score: adherenceScore,
                            risk_factors: riskFactors,
                            recommendations: recommendations
                        };
                        return [4 /*yield*/, this.getRecommendedTreatments(patientId, treatments)];
                    case 2: return [2 /*return*/, (_a.next_recommended_treatments = _b.sent(),
                            _a)];
                    case 3:
                        error_2 = _b.sent();
                        logger_1.logger.error('Error generating treatment insights:', error_2);
                        throw new Error('Failed to generate treatment insights');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get patient medical records
     */
    PatientTreatmentIntegration.getPatientMedicalRecords = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, records, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_medical_records')
                                .select('*')
                                .eq('patient_id', patientId)
                                .order('date_recorded', { ascending: false })];
                    case 1:
                        _a = _b.sent(), records = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, records || []];
                    case 2:
                        error_3 = _b.sent();
                        logger_1.logger.error('Error fetching medical records:', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Link patient to treatment plan
     */
    PatientTreatmentIntegration.linkPatientToTreatment = function (patientId, treatmentData) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, treatment, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_treatments')
                                .insert(__assign(__assign({ patient_id: patientId }, treatmentData), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                                .select('id')
                                .single()];
                    case 1:
                        _a = _b.sent(), treatment = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        logger_1.logger.info("Linked patient ".concat(patientId, " to treatment ").concat(treatment.id));
                        return [2 /*return*/, treatment.id];
                    case 2:
                        error_4 = _b.sent();
                        logger_1.logger.error('Error linking patient to treatment:', error_4);
                        throw new Error('Failed to link patient to treatment');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update treatment progress
     */
    PatientTreatmentIntegration.updateTreatmentProgress = function (treatmentId, progressData) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_treatments')
                                .update(__assign(__assign({}, progressData), { updated_at: new Date().toISOString() }))
                                .eq('id', treatmentId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        logger_1.logger.info("Updated treatment progress for ".concat(treatmentId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        logger_1.logger.error('Error updating treatment progress:', error_5);
                        throw new Error('Failed to update treatment progress');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate average from array of numbers
     */
    PatientTreatmentIntegration.calculateAverage = function (numbers) {
        if (numbers.length === 0)
            return 0;
        return numbers.reduce(function (sum, num) { return sum + num; }, 0) / numbers.length;
    };
    /**
     * Count occurrences of items in array
     */
    PatientTreatmentIntegration.countOccurrences = function (items) {
        return items.reduce(function (counts, item) {
            counts[item] = (counts[item] || 0) + 1;
            return counts;
        }, {});
    };
    /**
     * Calculate treatment adherence score
     */
    PatientTreatmentIntegration.calculateAdherenceScore = function (treatments) {
        if (treatments.length === 0)
            return 0;
        var adherenceScores = treatments.map(function (treatment) {
            if (treatment.total_sessions === 0)
                return 1;
            return treatment.completed_sessions / treatment.total_sessions;
        });
        return this.calculateAverage(adherenceScores) * 100;
    };
    /**
     * Calculate treatment frequency patterns
     */
    PatientTreatmentIntegration.calculateTreatmentFrequency = function (treatments) {
        var now = new Date();
        var oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        var oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        var threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return {
            weekly: treatments.filter(function (t) { return new Date(t.start_date) >= oneWeekAgo; }).length,
            monthly: treatments.filter(function (t) { return new Date(t.start_date) >= oneMonthAgo; }).length,
            quarterly: treatments.filter(function (t) { return new Date(t.start_date) >= threeMonthsAgo; }).length
        };
    };
    /**
     * Identify risk factors based on treatment history
     */
    PatientTreatmentIntegration.identifyRiskFactors = function (treatments) {
        var riskFactors = [];
        // Low adherence
        var adherenceScore = this.calculateAdherenceScore(treatments);
        if (adherenceScore < 70) {
            riskFactors.push('Low treatment adherence');
        }
        // Multiple cancelled treatments
        var cancelledCount = treatments.filter(function (t) { return t.status === 'cancelled'; }).length;
        if (cancelledCount > 2) {
            riskFactors.push('High treatment cancellation rate');
        }
        // Low satisfaction scores
        var satisfactionScores = treatments.filter(function (t) { return t.satisfaction_score; }).map(function (t) { return t.satisfaction_score; });
        var avgSatisfaction = this.calculateAverage(satisfactionScores);
        if (avgSatisfaction < 3) {
            riskFactors.push('Low treatment satisfaction');
        }
        // Side effects reported
        var hasSideEffects = treatments.some(function (t) { return t.side_effects && t.side_effects.length > 0; });
        if (hasSideEffects) {
            riskFactors.push('Reported side effects');
        }
        // High cost burden
        var totalCost = treatments.reduce(function (sum, t) { return sum + t.cost_total; }, 0);
        var totalPaid = treatments.reduce(function (sum, t) { return sum + t.cost_paid; }, 0);
        if (totalCost > 0 && (totalPaid / totalCost) < 0.5) {
            riskFactors.push('High unpaid treatment costs');
        }
        return riskFactors;
    };
    /**
     * Generate personalized recommendations
     */
    PatientTreatmentIntegration.generateRecommendations = function (treatments, riskFactors) {
        var recommendations = [];
        // Adherence recommendations
        if (riskFactors.includes('Low treatment adherence')) {
            recommendations.push('Schedule regular follow-up appointments');
            recommendations.push('Consider reminder system for appointments');
            recommendations.push('Discuss treatment barriers with patient');
        }
        // Satisfaction recommendations
        if (riskFactors.includes('Low treatment satisfaction')) {
            recommendations.push('Review treatment approach with patient');
            recommendations.push('Consider alternative treatment options');
            recommendations.push('Gather detailed feedback on treatment experience');
        }
        // Cost recommendations
        if (riskFactors.includes('High unpaid treatment costs')) {
            recommendations.push('Discuss payment plan options');
            recommendations.push('Review insurance coverage options');
            recommendations.push('Consider cost-effective treatment alternatives');
        }
        // Side effects recommendations
        if (riskFactors.includes('Reported side effects')) {
            recommendations.push('Monitor side effects closely');
            recommendations.push('Consider dosage adjustments');
            recommendations.push('Evaluate alternative treatment methods');
        }
        // General recommendations
        var completedTreatments = treatments.filter(function (t) { return t.status === 'completed'; });
        if (completedTreatments.length > 0) {
            recommendations.push('Schedule preventive care appointments');
            recommendations.push('Consider maintenance treatments');
        }
        return recommendations;
    };
    /**
     * Get AI-recommended treatments based on history
     */
    PatientTreatmentIntegration.getRecommendedTreatments = function (patientId, treatments) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, recommendations_1, successfulTreatments, preferredServices, riskScore, age, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select("\n          *,\n          patient_profiles_extended(*)\n        ")
                                .eq('id', patientId)
                                .single()];
                    case 1:
                        patient = (_b.sent()).data;
                        if (!patient)
                            return [2 /*return*/, []];
                        recommendations_1 = [];
                        successfulTreatments = treatments.filter(function (t) { return t.status === 'completed' && (t.satisfaction_score || 0) >= 4; });
                        if (successfulTreatments.length > 0) {
                            preferredServices = this.countOccurrences(successfulTreatments.map(function (t) { return t.service_name; }));
                            Object.keys(preferredServices)
                                .slice(0, 2)
                                .forEach(function (service) {
                                recommendations_1.push("Follow-up ".concat(service, " treatment"));
                            });
                        }
                        riskScore = ((_a = patient.patient_profiles_extended) === null || _a === void 0 ? void 0 : _a.risk_score) || 0;
                        if (riskScore > 7) {
                            recommendations_1.push('Preventive health screening');
                            recommendations_1.push('Stress management therapy');
                        }
                        age = this.calculateAge(patient.date_of_birth);
                        if (age > 50) {
                            recommendations_1.push('Annual health check-up');
                            recommendations_1.push('Cardiovascular screening');
                        }
                        return [2 /*return*/, recommendations_1.slice(0, 5)]; // Limit to top 5 recommendations
                    case 2:
                        error_6 = _b.sent();
                        logger_1.logger.error('Error getting recommended treatments:', error_6);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate age from date of birth
     */
    PatientTreatmentIntegration.calculateAge = function (dateOfBirth) {
        var today = new Date();
        var birthDate = new Date(dateOfBirth);
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    /**
     * Get treatment analytics for dashboard
     */
    PatientTreatmentIntegration.getTreatmentAnalytics = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var treatments, insights, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getPatientTreatmentHistory(patientId)];
                    case 1:
                        treatments = _a.sent();
                        return [4 /*yield*/, this.generateTreatmentInsights(patientId)];
                    case 2:
                        insights = _a.sent();
                        return [2 /*return*/, {
                                summary: {
                                    total_treatments: treatments.length,
                                    active_treatments: insights.active_treatments,
                                    completion_rate: treatments.length > 0 ?
                                        (insights.completed_treatments / treatments.length) * 100 : 0,
                                    avg_satisfaction: insights.avg_satisfaction,
                                    total_investment: insights.total_investment
                                },
                                trends: {
                                    monthly_treatments: this.getMonthlyTreatmentTrend(treatments),
                                    satisfaction_trend: this.getSatisfactionTrend(treatments),
                                    cost_trend: this.getCostTrend(treatments)
                                },
                                insights: insights,
                                recent_treatments: treatments.slice(0, 5)
                            }];
                    case 3:
                        error_7 = _a.sent();
                        logger_1.logger.error('Error getting treatment analytics:', error_7);
                        throw new Error('Failed to get treatment analytics');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get monthly treatment trend
     */
    PatientTreatmentIntegration.getMonthlyTreatmentTrend = function (treatments) {
        var monthlyData = {};
        treatments.forEach(function (treatment) {
            var month = new Date(treatment.start_date).toISOString().slice(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + 1;
        });
        return Object.entries(monthlyData)
            .sort(function (_a, _b) {
            var a = _a[0];
            var b = _b[0];
            return a.localeCompare(b);
        })
            .slice(-12); // Last 12 months
    };
    /**
     * Get satisfaction trend
     */
    PatientTreatmentIntegration.getSatisfactionTrend = function (treatments) {
        return treatments
            .filter(function (t) { return t.satisfaction_score; })
            .map(function (t) { return ({
            date: t.start_date,
            score: t.satisfaction_score,
            treatment: t.service_name
        }); })
            .sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); })
            .slice(-10); // Last 10 treatments with scores
    };
    /**
     * Get cost trend
     */
    PatientTreatmentIntegration.getCostTrend = function (treatments) {
        var monthlyData = {};
        treatments.forEach(function (treatment) {
            var month = new Date(treatment.start_date).toISOString().slice(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { total: 0, paid: 0 };
            }
            monthlyData[month].total += treatment.cost_total;
            monthlyData[month].paid += treatment.cost_paid;
        });
        return Object.entries(monthlyData)
            .sort(function (_a, _b) {
            var a = _a[0];
            var b = _b[0];
            return a.localeCompare(b);
        })
            .slice(-12) // Last 12 months
            .map(function (_a) {
            var month = _a[0], data = _a[1];
            return ({
                month: month,
                total_cost: data.total,
                paid_amount: data.paid,
                outstanding: data.total - data.paid
            });
        });
    };
    return PatientTreatmentIntegration;
}());
exports.PatientTreatmentIntegration = PatientTreatmentIntegration;
exports.default = PatientTreatmentIntegration;
