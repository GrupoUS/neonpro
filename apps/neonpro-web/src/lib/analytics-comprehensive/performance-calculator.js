"use strict";
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
exports.PerformanceCalculator = void 0;
var client_1 = require("@/lib/supabase/client");
/**
 * Advanced Performance Calculator
 * Calculates comprehensive performance metrics, benchmarks, and optimization recommendations
 */
var PerformanceCalculator = /** @class */ (function () {
    function PerformanceCalculator() {
        this.CACHE_TTL = 10 * 60 * 1000; // 10 minutes
        // Industry benchmarks (these would typically come from external data sources)
        this.INDUSTRY_BENCHMARKS = {
            appointmentCompletionRate: 92,
            patientSatisfactionScore: 4.2,
            staffUtilizationRate: 75,
            revenuePerHour: 180,
            waitTimeMinutes: 15,
            noShowRate: 8,
            cancellationRate: 12
        };
        this.supabase = (0, client_1.createClient)();
        this.cache = new Map();
    }
    /**
     * Calculate comprehensive performance metrics
     */
    PerformanceCalculator.prototype.calculatePerformanceMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, _a, efficiency, productivity, quality, utilization, satisfaction, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cacheKey = "performance_".concat(JSON.stringify(filter));
                        cached = this.getCachedData(cacheKey);
                        if (cached)
                            return [2 /*return*/, cached];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                this.calculateEfficiencyMetrics(filter),
                                this.calculateProductivityMetrics(filter),
                                this.calculateQualityMetrics(filter),
                                this.calculateUtilizationMetrics(filter),
                                this.calculateSatisfactionMetrics(filter)
                            ])];
                    case 2:
                        _a = _b.sent(), efficiency = _a[0], productivity = _a[1], quality = _a[2], utilization = _a[3], satisfaction = _a[4];
                        result = {
                            efficiency: efficiency,
                            productivity: productivity,
                            quality: quality,
                            utilization: utilization,
                            satisfaction: satisfaction
                        };
                        this.setCachedData(cacheKey, result);
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Error calculating performance metrics:', error_1);
                        throw new Error('Failed to calculate performance metrics');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate efficiency metrics
     */
    PerformanceCalculator.prototype.calculateEfficiencyMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, appointments, error, totalAppointments, completedAppointments, appointmentCompletionRate, totalDuration, averageAppointmentDuration, durationAccuracy, scheduledVsActualDuration, scheduledTime, actualTime, timeUtilizationRate, onTimeCompletions, taskCompletionEfficiency, resourceEfficiencyScore;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('appointments')
                            .select("\n        *,\n        services(duration, price),\n        staff(id, name)\n      ")
                            .gte('scheduled_at', filter.startDate.toISOString())
                            .lte('scheduled_at', filter.endDate.toISOString())];
                    case 1:
                        _a = _b.sent(), appointments = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.length) || 0;
                        completedAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'completed'; }).length) || 0;
                        appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
                        totalDuration = (appointments === null || appointments === void 0 ? void 0 : appointments.reduce(function (sum, a) { return sum + (a.actual_duration || a.scheduled_duration || 0); }, 0)) || 0;
                        averageAppointmentDuration = totalAppointments > 0 ? totalDuration / totalAppointments : 0;
                        durationAccuracy = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.actual_duration && a.scheduled_duration; }).map(function (a) {
                            var variance = Math.abs(a.actual_duration - a.scheduled_duration) / a.scheduled_duration;
                            return Math.max(0, 1 - variance) * 100;
                        })) || [];
                        scheduledVsActualDuration = durationAccuracy.length > 0 ?
                            durationAccuracy.reduce(function (sum, acc) { return sum + acc; }, 0) / durationAccuracy.length : 0;
                        scheduledTime = (appointments === null || appointments === void 0 ? void 0 : appointments.reduce(function (sum, a) { return sum + (a.scheduled_duration || 0); }, 0)) || 0;
                        actualTime = (appointments === null || appointments === void 0 ? void 0 : appointments.reduce(function (sum, a) { return sum + (a.actual_duration || a.scheduled_duration || 0); }, 0)) || 0;
                        timeUtilizationRate = scheduledTime > 0 ? (actualTime / scheduledTime) * 100 : 0;
                        onTimeCompletions = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) {
                            if (!a.actual_duration || !a.scheduled_duration)
                                return false;
                            return a.actual_duration <= a.scheduled_duration * 1.1; // 10% tolerance
                        }).length) || 0;
                        taskCompletionEfficiency = completedAppointments > 0 ? (onTimeCompletions / completedAppointments) * 100 : 0;
                        resourceEfficiencyScore = (appointmentCompletionRate * 0.3 +
                            scheduledVsActualDuration * 0.25 +
                            timeUtilizationRate * 0.25 +
                            taskCompletionEfficiency * 0.2);
                        return [2 /*return*/, {
                                appointmentCompletionRate: appointmentCompletionRate,
                                averageAppointmentDuration: averageAppointmentDuration,
                                scheduledVsActualDuration: scheduledVsActualDuration,
                                timeUtilizationRate: timeUtilizationRate,
                                taskCompletionEfficiency: taskCompletionEfficiency,
                                resourceEfficiencyScore: resourceEfficiencyScore
                            }];
                }
            });
        });
    };
    /**
     * Calculate productivity metrics
     */
    PerformanceCalculator.prototype.calculateProductivityMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, appointments, error, totalAppointments, totalRevenue, diffTime, totalHours, totalDays, workingHours, appointmentsPerHour, appointmentsPerDay, revenuePerHour, revenuePerAppointment, uniquePatients, patientThroughput, productivityTrend;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('appointments')
                            .select("\n        *,\n        services(price),\n        staff(id)\n      ")
                            .gte('scheduled_at', filter.startDate.toISOString())
                            .lte('scheduled_at', filter.endDate.toISOString())
                            .eq('status', 'completed')];
                    case 1:
                        _a = _b.sent(), appointments = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.length) || 0;
                        totalRevenue = (appointments === null || appointments === void 0 ? void 0 : appointments.reduce(function (sum, a) { var _a; return sum + (((_a = a.services) === null || _a === void 0 ? void 0 : _a.price) || 0); }, 0)) || 0;
                        diffTime = filter.endDate.getTime() - filter.startDate.getTime();
                        totalHours = diffTime / (1000 * 60 * 60);
                        totalDays = diffTime / (1000 * 60 * 60 * 24);
                        workingHours = totalDays * 8 // Assuming 8-hour workdays
                        ;
                        appointmentsPerHour = workingHours > 0 ? totalAppointments / workingHours : 0;
                        appointmentsPerDay = totalDays > 0 ? totalAppointments / totalDays : 0;
                        revenuePerHour = workingHours > 0 ? totalRevenue / workingHours : 0;
                        revenuePerAppointment = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;
                        uniquePatients = new Set(appointments === null || appointments === void 0 ? void 0 : appointments.map(function (a) { return a.patient_id; })).size;
                        patientThroughput = totalDays > 0 ? uniquePatients / totalDays : 0;
                        return [4 /*yield*/, this.calculateProductivityTrend(filter)];
                    case 2:
                        productivityTrend = _b.sent();
                        return [2 /*return*/, {
                                appointmentsPerHour: appointmentsPerHour,
                                appointmentsPerDay: appointmentsPerDay,
                                revenuePerHour: revenuePerHour,
                                revenuePerAppointment: revenuePerAppointment,
                                patientThroughput: patientThroughput,
                                productivityTrend: productivityTrend
                            }];
                }
            });
        });
    };
    /**
     * Calculate quality metrics
     */
    PerformanceCalculator.prototype.calculateQualityMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, feedback, feedbackError, ratings, patientSatisfactionScore, _b, treatments, treatmentError, treatmentsWithOutcomes, successfulTreatments, treatmentSuccessRate, complicatedTreatments, complicationRate, _c, followUps, followUpError, totalFollowUps, completedFollowUps, followUpComplianceRate, scoreRanges, qualityScoreDistribution, qualityTrend;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patient_feedback')
                            .select("\n        *,\n        appointments(scheduled_at, status)\n      ")
                            .gte('appointments.scheduled_at', filter.startDate.toISOString())
                            .lte('appointments.scheduled_at', filter.endDate.toISOString())];
                    case 1:
                        _a = _d.sent(), feedback = _a.data, feedbackError = _a.error;
                        if (feedbackError)
                            throw feedbackError;
                        ratings = (feedback === null || feedback === void 0 ? void 0 : feedback.map(function (f) { return f.rating; }).filter(function (r) { return r !== null; })) || [];
                        patientSatisfactionScore = ratings.length > 0 ?
                            ratings.reduce(function (sum, r) { return sum + r; }, 0) / ratings.length : 0;
                        return [4 /*yield*/, this.supabase
                                .from('appointments')
                                .select("\n        *,\n        treatment_outcomes(success, complications)\n      ")
                                .gte('scheduled_at', filter.startDate.toISOString())
                                .lte('scheduled_at', filter.endDate.toISOString())
                                .eq('status', 'completed')];
                    case 2:
                        _b = _d.sent(), treatments = _b.data, treatmentError = _b.error;
                        if (treatmentError)
                            throw treatmentError;
                        treatmentsWithOutcomes = (treatments === null || treatments === void 0 ? void 0 : treatments.filter(function (t) { return t.treatment_outcomes; })) || [];
                        successfulTreatments = treatmentsWithOutcomes.filter(function (t) { var _a; return (_a = t.treatment_outcomes) === null || _a === void 0 ? void 0 : _a.success; }) || [];
                        treatmentSuccessRate = treatmentsWithOutcomes.length > 0 ?
                            (successfulTreatments.length / treatmentsWithOutcomes.length) * 100 : 0;
                        complicatedTreatments = treatmentsWithOutcomes.filter(function (t) { var _a; return (_a = t.treatment_outcomes) === null || _a === void 0 ? void 0 : _a.complications; }) || [];
                        complicationRate = treatmentsWithOutcomes.length > 0 ?
                            (complicatedTreatments.length / treatmentsWithOutcomes.length) * 100 : 0;
                        return [4 /*yield*/, this.supabase
                                .from('follow_up_appointments')
                                .select('*')
                                .gte('scheduled_date', filter.startDate.toISOString())
                                .lte('scheduled_date', filter.endDate.toISOString())];
                    case 3:
                        _c = _d.sent(), followUps = _c.data, followUpError = _c.error;
                        if (followUpError)
                            throw followUpError;
                        totalFollowUps = (followUps === null || followUps === void 0 ? void 0 : followUps.length) || 0;
                        completedFollowUps = (followUps === null || followUps === void 0 ? void 0 : followUps.filter(function (f) { return f.status === 'completed'; }).length) || 0;
                        followUpComplianceRate = totalFollowUps > 0 ? (completedFollowUps / totalFollowUps) * 100 : 0;
                        scoreRanges = [1, 2, 3, 4, 5];
                        qualityScoreDistribution = scoreRanges.map(function (score) { return ({
                            score: score,
                            count: ratings.filter(function (r) { return Math.floor(r) === score; }).length
                        }); });
                        return [4 /*yield*/, this.calculateQualityTrend(filter)];
                    case 4:
                        qualityTrend = _d.sent();
                        return [2 /*return*/, {
                                patientSatisfactionScore: patientSatisfactionScore,
                                treatmentSuccessRate: treatmentSuccessRate,
                                complicationRate: complicationRate,
                                followUpComplianceRate: followUpComplianceRate,
                                qualityScoreDistribution: qualityScoreDistribution,
                                qualityTrend: qualityTrend
                            }];
                }
            });
        });
    };
    /**
     * Calculate utilization metrics
     */
    PerformanceCalculator.prototype.calculateUtilizationMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, staffSchedules, staffError, totalScheduledHours, totalWorkedHours, staffUtilizationRate, equipmentUtilizationRate, _b, roomBookings, roomError, roomUsageHours, uniqueRooms, diffDays, totalRoomHours, roomUtilizationRate, capacityUtilizationRate, peakUtilizationHours, utilizationTrend;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('staff_schedules')
                            .select("\n        *,\n        staff(id, name),\n        appointments(id, actual_duration, scheduled_duration)\n      ")
                            .gte('date', filter.startDate.toISOString().split('T')[0])
                            .lte('date', filter.endDate.toISOString().split('T')[0])];
                    case 1:
                        _a = _c.sent(), staffSchedules = _a.data, staffError = _a.error;
                        if (staffError)
                            throw staffError;
                        totalScheduledHours = (staffSchedules === null || staffSchedules === void 0 ? void 0 : staffSchedules.reduce(function (sum, s) {
                            var start = new Date("".concat(s.date, "T").concat(s.start_time));
                            var end = new Date("".concat(s.date, "T").concat(s.end_time));
                            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        }, 0)) || 0;
                        totalWorkedHours = (staffSchedules === null || staffSchedules === void 0 ? void 0 : staffSchedules.reduce(function (sum, s) {
                            var _a;
                            return sum + (((_a = s.appointments) === null || _a === void 0 ? void 0 : _a.reduce(function (appointmentSum, a) {
                                return appointmentSum + ((a.actual_duration || a.scheduled_duration || 0) / 60);
                            }, 0)) || 0);
                        }, 0)) || 0;
                        staffUtilizationRate = totalScheduledHours > 0 ? (totalWorkedHours / totalScheduledHours) * 100 : 0;
                        equipmentUtilizationRate = 75 // Placeholder
                        ;
                        return [4 /*yield*/, this.supabase
                                .from('appointments')
                                .select('room_id, scheduled_duration, actual_duration')
                                .gte('scheduled_at', filter.startDate.toISOString())
                                .lte('scheduled_at', filter.endDate.toISOString())
                                .not('room_id', 'is', null)];
                    case 2:
                        _b = _c.sent(), roomBookings = _b.data, roomError = _b.error;
                        if (roomError)
                            throw roomError;
                        roomUsageHours = (roomBookings === null || roomBookings === void 0 ? void 0 : roomBookings.reduce(function (sum, booking) {
                            return sum + ((booking.actual_duration || booking.scheduled_duration || 0) / 60);
                        }, 0)) || 0;
                        uniqueRooms = new Set(roomBookings === null || roomBookings === void 0 ? void 0 : roomBookings.map(function (b) { return b.room_id; })).size;
                        diffDays = (filter.endDate.getTime() - filter.startDate.getTime()) / (1000 * 60 * 60 * 24);
                        totalRoomHours = uniqueRooms * diffDays * 8;
                        roomUtilizationRate = totalRoomHours > 0 ? (roomUsageHours / totalRoomHours) * 100 : 0;
                        capacityUtilizationRate = (staffUtilizationRate + equipmentUtilizationRate + roomUtilizationRate) / 3;
                        return [4 /*yield*/, this.identifyPeakUtilizationHours(filter)
                            // Utilization trend
                        ];
                    case 3:
                        peakUtilizationHours = _c.sent();
                        return [4 /*yield*/, this.calculateUtilizationTrend(filter)];
                    case 4:
                        utilizationTrend = _c.sent();
                        return [2 /*return*/, {
                                staffUtilizationRate: staffUtilizationRate,
                                equipmentUtilizationRate: equipmentUtilizationRate,
                                roomUtilizationRate: roomUtilizationRate,
                                capacityUtilizationRate: capacityUtilizationRate,
                                peakUtilizationHours: peakUtilizationHours,
                                utilizationTrend: utilizationTrend
                            }];
                }
            });
        });
    };
    /**
     * Calculate satisfaction metrics
     */
    PerformanceCalculator.prototype.calculateSatisfactionMetrics = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, feedback, error, feedbackData, overallRatings, overallSatisfactionScore, serviceRatings, serviceQualityScore, waitTimeRatings, waitTimeScore, staffRatings, staffInteractionScore, facilityRatings, facilityScore, recommendations, recommendationRate, satisfactionTrend;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('patient_feedback')
                            .select("\n        *,\n        appointments(scheduled_at)\n      ")
                            .gte('appointments.scheduled_at', filter.startDate.toISOString())
                            .lte('appointments.scheduled_at', filter.endDate.toISOString())];
                    case 1:
                        _a = _b.sent(), feedback = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        feedbackData = feedback || [];
                        overallRatings = feedbackData.map(function (f) { return f.overall_rating; }).filter(function (r) { return r !== null; });
                        overallSatisfactionScore = overallRatings.length > 0 ?
                            overallRatings.reduce(function (sum, r) { return sum + r; }, 0) / overallRatings.length : 0;
                        serviceRatings = feedbackData.map(function (f) { return f.service_quality_rating; }).filter(function (r) { return r !== null; });
                        serviceQualityScore = serviceRatings.length > 0 ?
                            serviceRatings.reduce(function (sum, r) { return sum + r; }, 0) / serviceRatings.length : 0;
                        waitTimeRatings = feedbackData.map(function (f) { return f.wait_time_rating; }).filter(function (r) { return r !== null; });
                        waitTimeScore = waitTimeRatings.length > 0 ?
                            waitTimeRatings.reduce(function (sum, r) { return sum + r; }, 0) / waitTimeRatings.length : 0;
                        staffRatings = feedbackData.map(function (f) { return f.staff_interaction_rating; }).filter(function (r) { return r !== null; });
                        staffInteractionScore = staffRatings.length > 0 ?
                            staffRatings.reduce(function (sum, r) { return sum + r; }, 0) / staffRatings.length : 0;
                        facilityRatings = feedbackData.map(function (f) { return f.facility_rating; }).filter(function (r) { return r !== null; });
                        facilityScore = facilityRatings.length > 0 ?
                            facilityRatings.reduce(function (sum, r) { return sum + r; }, 0) / facilityRatings.length : 0;
                        recommendations = feedbackData.filter(function (f) { return f.would_recommend === true; }).length;
                        recommendationRate = feedbackData.length > 0 ? (recommendations / feedbackData.length) * 100 : 0;
                        return [4 /*yield*/, this.calculateSatisfactionTrend(filter)];
                    case 2:
                        satisfactionTrend = _b.sent();
                        return [2 /*return*/, {
                                overallSatisfactionScore: overallSatisfactionScore,
                                serviceQualityScore: serviceQualityScore,
                                waitTimeScore: waitTimeScore,
                                staffInteractionScore: staffInteractionScore,
                                facilityScore: facilityScore,
                                recommendationRate: recommendationRate,
                                satisfactionTrend: satisfactionTrend
                            }];
                }
            });
        });
    };
    /**
     * Generate benchmark comparisons
     */
    PerformanceCalculator.prototype.generateBenchmarkComparisons = function (metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var comparisons;
            return __generator(this, function (_a) {
                comparisons = [
                    {
                        metric: 'Appointment Completion Rate',
                        currentValue: metrics.efficiency.appointmentCompletionRate,
                        industryBenchmark: this.INDUSTRY_BENCHMARKS.appointmentCompletionRate,
                        percentileRank: this.calculatePercentileRank(metrics.efficiency.appointmentCompletionRate, this.INDUSTRY_BENCHMARKS.appointmentCompletionRate),
                        performanceGap: metrics.efficiency.appointmentCompletionRate - this.INDUSTRY_BENCHMARKS.appointmentCompletionRate,
                        improvementTarget: Math.max(this.INDUSTRY_BENCHMARKS.appointmentCompletionRate, metrics.efficiency.appointmentCompletionRate * 1.05),
                        achievabilityScore: this.calculateAchievabilityScore(metrics.efficiency.appointmentCompletionRate, this.INDUSTRY_BENCHMARKS.appointmentCompletionRate)
                    },
                    {
                        metric: 'Patient Satisfaction Score',
                        currentValue: metrics.satisfaction.overallSatisfactionScore,
                        industryBenchmark: this.INDUSTRY_BENCHMARKS.patientSatisfactionScore,
                        percentileRank: this.calculatePercentileRank(metrics.satisfaction.overallSatisfactionScore, this.INDUSTRY_BENCHMARKS.patientSatisfactionScore),
                        performanceGap: metrics.satisfaction.overallSatisfactionScore - this.INDUSTRY_BENCHMARKS.patientSatisfactionScore,
                        improvementTarget: Math.max(this.INDUSTRY_BENCHMARKS.patientSatisfactionScore, metrics.satisfaction.overallSatisfactionScore * 1.1),
                        achievabilityScore: this.calculateAchievabilityScore(metrics.satisfaction.overallSatisfactionScore, this.INDUSTRY_BENCHMARKS.patientSatisfactionScore)
                    },
                    {
                        metric: 'Staff Utilization Rate',
                        currentValue: metrics.utilization.staffUtilizationRate,
                        industryBenchmark: this.INDUSTRY_BENCHMARKS.staffUtilizationRate,
                        percentileRank: this.calculatePercentileRank(metrics.utilization.staffUtilizationRate, this.INDUSTRY_BENCHMARKS.staffUtilizationRate),
                        performanceGap: metrics.utilization.staffUtilizationRate - this.INDUSTRY_BENCHMARKS.staffUtilizationRate,
                        improvementTarget: Math.max(this.INDUSTRY_BENCHMARKS.staffUtilizationRate, metrics.utilization.staffUtilizationRate * 1.05),
                        achievabilityScore: this.calculateAchievabilityScore(metrics.utilization.staffUtilizationRate, this.INDUSTRY_BENCHMARKS.staffUtilizationRate)
                    },
                    {
                        metric: 'Revenue Per Hour',
                        currentValue: metrics.productivity.revenuePerHour,
                        industryBenchmark: this.INDUSTRY_BENCHMARKS.revenuePerHour,
                        percentileRank: this.calculatePercentileRank(metrics.productivity.revenuePerHour, this.INDUSTRY_BENCHMARKS.revenuePerHour),
                        performanceGap: metrics.productivity.revenuePerHour - this.INDUSTRY_BENCHMARKS.revenuePerHour,
                        improvementTarget: Math.max(this.INDUSTRY_BENCHMARKS.revenuePerHour, metrics.productivity.revenuePerHour * 1.1),
                        achievabilityScore: this.calculateAchievabilityScore(metrics.productivity.revenuePerHour, this.INDUSTRY_BENCHMARKS.revenuePerHour)
                    }
                ];
                return [2 /*return*/, comparisons];
            });
        });
    };
    // Helper methods
    PerformanceCalculator.prototype.getCachedData = function (key) {
        var cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        return null;
    };
    PerformanceCalculator.prototype.setCachedData = function (key, data) {
        this.cache.set(key, { data: data, timestamp: Date.now() });
    };
    PerformanceCalculator.prototype.calculatePercentileRank = function (currentValue, benchmark) {
        // Simplified percentile calculation
        if (currentValue >= benchmark) {
            return Math.min(95, 50 + (currentValue - benchmark) / benchmark * 45);
        }
        else {
            return Math.max(5, 50 - (benchmark - currentValue) / benchmark * 45);
        }
    };
    PerformanceCalculator.prototype.calculateAchievabilityScore = function (currentValue, benchmark) {
        var gap = Math.abs(currentValue - benchmark);
        var relativeGap = gap / benchmark;
        if (relativeGap <= 0.05)
            return 95; // Very achievable
        if (relativeGap <= 0.1)
            return 85; // Achievable
        if (relativeGap <= 0.2)
            return 70; // Moderately achievable
        if (relativeGap <= 0.3)
            return 50; // Challenging
        return 30; // Very challenging
    };
    // Placeholder methods for trend calculations
    PerformanceCalculator.prototype.calculateProductivityTrend = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would compare current period with previous period
                return [2 /*return*/, 0]; // Placeholder
            });
        });
    };
    PerformanceCalculator.prototype.calculateQualityTrend = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would compare current period with previous period
                return [2 /*return*/, 0]; // Placeholder
            });
        });
    };
    PerformanceCalculator.prototype.calculateUtilizationTrend = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would compare current period with previous period
                return [2 /*return*/, 0]; // Placeholder
            });
        });
    };
    PerformanceCalculator.prototype.calculateSatisfactionTrend = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would compare current period with previous period
                return [2 /*return*/, 0]; // Placeholder
            });
        });
    };
    PerformanceCalculator.prototype.identifyPeakUtilizationHours = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation would analyze hourly utilization patterns
                return [2 /*return*/, []]; // Placeholder
            });
        });
    };
    return PerformanceCalculator;
}());
exports.PerformanceCalculator = PerformanceCalculator;
exports.default = PerformanceCalculator;
