"use strict";
/**
 * Story 11.2: Patient Risk Scoring System
 * Advanced risk assessment algorithms for no-show prediction and patient management
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
exports.riskScoringEngine = exports.RiskScoringEngine = void 0;
exports.formatRiskScore = formatRiskScore;
exports.getRiskLevelColor = getRiskLevelColor;
exports.getRiskTrendIcon = getRiskTrendIcon;
exports.calculateRiskReduction = calculateRiskReduction;
// Main risk scoring engine class
var RiskScoringEngine = /** @class */ (function () {
    function RiskScoringEngine() {
        var _a;
        this.supabase = createClient(ComponentClient());
        this.config = {
            weights: (_a = {},
                _a[RiskFactorCategory.PATIENT_HISTORY] = 0.30,
                _a[RiskFactorCategory.APPOINTMENT_CHARACTERISTICS] = 0.20,
                _a[RiskFactorCategory.DEMOGRAPHICS] = 0.20,
                _a[RiskFactorCategory.EXTERNAL_FACTORS] = 0.15,
                _a[RiskFactorCategory.COMMUNICATION_PATTERNS] = 0.15,
                _a),
            thresholds: {
                low: 25,
                medium: 50,
                high: 75,
                critical: 90
            },
            decayFactors: {
                timeDecay: 0.95, // 5% decay per month
                seasonalDecay: 0.90, // 10% decay per year
                behaviorDecay: 0.98 // 2% decay per month
            },
            minimumDataPoints: 3
        };
    }
    /**
     * Generate comprehensive risk profile for a patient
     */
    RiskScoringEngine.prototype.generateRiskProfile = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, appointmentHistory, demographicData, communicationHistory, interventionHistory, historicalRisk, behavioralRisk, demographicRisk, communicationRisk, contextualRisk, overallRiskScore, _b, riskTrend, trendConfidence, monthlyHistory, topRiskFactors, protectiveFactors, interventionEffectiveness, recommendedInterventions, appointmentRecommendations, confidence, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 13, , 14]);
                        return [4 /*yield*/, Promise.all([
                                this.getPatientAppointmentHistory(patientId),
                                this.getPatientDemographics(patientId),
                                this.getCommunicationHistory(patientId),
                                this.getInterventionHistory(patientId)
                            ])];
                    case 1:
                        _a = _d.sent(), appointmentHistory = _a[0], demographicData = _a[1], communicationHistory = _a[2], interventionHistory = _a[3];
                        return [4 /*yield*/, this.calculateHistoricalRisk(appointmentHistory)];
                    case 2:
                        historicalRisk = _d.sent();
                        return [4 /*yield*/, this.calculateBehavioralRisk(appointmentHistory)];
                    case 3:
                        behavioralRisk = _d.sent();
                        return [4 /*yield*/, this.calculateDemographicRisk(demographicData)];
                    case 4:
                        demographicRisk = _d.sent();
                        return [4 /*yield*/, this.calculateCommunicationRisk(communicationHistory)];
                    case 5:
                        communicationRisk = _d.sent();
                        return [4 /*yield*/, this.calculateContextualRisk(patientId)];
                    case 6:
                        contextualRisk = _d.sent();
                        overallRiskScore = this.calculateOverallRiskScore({
                            historicalRisk: historicalRisk,
                            behavioralRisk: behavioralRisk,
                            demographicRisk: demographicRisk,
                            communicationRisk: communicationRisk,
                            contextualRisk: contextualRisk
                        });
                        return [4 /*yield*/, this.analyzeRiskTrends(appointmentHistory)];
                    case 7:
                        _b = _d.sent(), riskTrend = _b.riskTrend, trendConfidence = _b.trendConfidence, monthlyHistory = _b.monthlyHistory;
                        return [4 /*yield*/, this.identifyTopRiskFactors(patientId)];
                    case 8:
                        topRiskFactors = _d.sent();
                        return [4 /*yield*/, this.identifyProtectiveFactors(patientId)];
                    case 9:
                        protectiveFactors = _d.sent();
                        interventionEffectiveness = this.analyzeInterventionEffectiveness(interventionHistory);
                        return [4 /*yield*/, this.generateInterventionRecommendations(overallRiskScore, topRiskFactors)];
                    case 10:
                        recommendedInterventions = _d.sent();
                        return [4 /*yield*/, this.generateAppointmentRecommendations(patientId, appointmentHistory)];
                    case 11:
                        appointmentRecommendations = _d.sent();
                        confidence = this.calculateConfidenceScore(appointmentHistory.length);
                        _c = {
                            patientId: patientId,
                            overallRiskScore: overallRiskScore,
                            riskLevel: this.getRiskLevel(overallRiskScore),
                            confidence: confidence,
                            lastUpdated: new Date(),
                            historicalRisk: historicalRisk,
                            behavioralRisk: behavioralRisk,
                            demographicRisk: demographicRisk,
                            communicationRisk: communicationRisk,
                            contextualRisk: contextualRisk,
                            riskTrend: riskTrend,
                            trendConfidence: trendConfidence,
                            monthlyRiskHistory: monthlyHistory,
                            interventionHistory: interventionHistory,
                            interventionEffectiveness: interventionEffectiveness,
                            topRiskFactors: topRiskFactors,
                            protectiveFactors: protectiveFactors
                        };
                        return [4 /*yield*/, this.calculateSeasonalPatterns(appointmentHistory)];
                    case 12: return [2 /*return*/, (_c.seasonalPatterns = _d.sent(),
                            _c.recommendedInterventions = recommendedInterventions,
                            _c.appointmentRecommendations = appointmentRecommendations,
                            _c)];
                    case 13:
                        error_1 = _d.sent();
                        console.error('Error generating risk profile:', error_1);
                        throw new Error('Failed to generate patient risk profile');
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate historical risk based on appointment history
     */
    RiskScoringEngine.prototype.calculateHistoricalRisk = function (appointmentHistory) {
        return __awaiter(this, void 0, void 0, function () {
            var noShows, cancellations, lateArrival, noShowRate, cancellationRate, lateRate, weightedNoShowRate, weightedCancellationRate, riskScore, patternPenalty;
            return __generator(this, function (_a) {
                if (appointmentHistory.length < this.config.minimumDataPoints) {
                    return [2 /*return*/, 50]; // Default medium risk for insufficient data
                }
                noShows = appointmentHistory.filter(function (apt) { return apt.status === 'NO_SHOW'; });
                cancellations = appointmentHistory.filter(function (apt) { return apt.status === 'CANCELLED'; });
                lateArrival = appointmentHistory.filter(function (apt) { return apt.late_arrival === true; });
                noShowRate = noShows.length / appointmentHistory.length;
                cancellationRate = cancellations.length / appointmentHistory.length;
                lateRate = lateArrival.length / appointmentHistory.length;
                weightedNoShowRate = this.applyTimeDecay(noShows, appointmentHistory);
                weightedCancellationRate = this.applyTimeDecay(cancellations, appointmentHistory);
                riskScore = 0;
                riskScore += weightedNoShowRate * 60; // No-shows are highest risk
                riskScore += weightedCancellationRate * 20; // Cancellations are moderate risk
                riskScore += lateRate * 15; // Late arrivals are low risk
                patternPenalty = this.analyzePatterns(appointmentHistory);
                riskScore += patternPenalty;
                return [2 /*return*/, Math.min(Math.max(riskScore, 0), 100)];
            });
        });
    };
    /**
     * Calculate behavioral risk based on appointment patterns
     */
    RiskScoringEngine.prototype.calculateBehavioralRisk = function (appointmentHistory) {
        return __awaiter(this, void 0, void 0, function () {
            var riskScore, bookingPatterns, reschedulingRate, communicationScore, frequencyScore;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (appointmentHistory.length === 0)
                            return [2 /*return*/, 50];
                        riskScore = 0;
                        bookingPatterns = this.analyzeBookingPatterns(appointmentHistory);
                        riskScore += bookingPatterns.lastMinuteBookings * 20;
                        riskScore += bookingPatterns.inconsistentTiming * 15;
                        reschedulingRate = appointmentHistory.filter(function (apt) {
                            return apt.reschedule_count && apt.reschedule_count > 0;
                        }).length / appointmentHistory.length;
                        riskScore += reschedulingRate * 25;
                        return [4 /*yield*/, this.getCommunicationScore((_a = appointmentHistory[0]) === null || _a === void 0 ? void 0 : _a.patient_id)];
                    case 1:
                        communicationScore = _b.sent();
                        riskScore += (1 - communicationScore) * 20;
                        frequencyScore = this.analyzeAppointmentFrequency(appointmentHistory);
                        riskScore += frequencyScore * 10;
                        return [2 /*return*/, Math.min(Math.max(riskScore, 0), 100)];
                }
            });
        });
    };
    /**
     * Calculate demographic risk factors
     */
    RiskScoringEngine.prototype.calculateDemographicRisk = function (demographicData) {
        return __awaiter(this, void 0, void 0, function () {
            var riskScore, ageRisk, distanceRisk, transportRisk, supportRisk;
            return __generator(this, function (_a) {
                riskScore = 0;
                ageRisk = this.getAgeGroupRisk(demographicData.ageGroup);
                riskScore += ageRisk * 15;
                distanceRisk = Math.min(demographicData.distanceFromClinic / 50, 1) * 20;
                riskScore += distanceRisk;
                transportRisk = {
                    'EXCELLENT': 0,
                    'GOOD': 5,
                    'LIMITED': 15,
                    'POOR': 25
                }[demographicData.transportationAccess] || 10;
                riskScore += transportRisk;
                // Language barriers
                if (demographicData.languageBarriers) {
                    riskScore += 10;
                }
                supportRisk = {
                    'HIGH': 0,
                    'MEDIUM': 5,
                    'LOW': 15,
                    'UNKNOWN': 8
                }[demographicData.familySupport] || 8;
                riskScore += supportRisk;
                // Employment and insurance factors
                if (demographicData.employmentStatus === 'UNEMPLOYED') {
                    riskScore += 10;
                }
                if (demographicData.insuranceType === 'NONE') {
                    riskScore += 15;
                }
                return [2 /*return*/, Math.min(Math.max(riskScore, 0), 100)];
            });
        });
    };
    /**
     * Calculate communication risk based on response patterns
     */
    RiskScoringEngine.prototype.calculateCommunicationRisk = function (communicationHistory) {
        return __awaiter(this, void 0, void 0, function () {
            var responses, responseRate, responseTimes, avgResponseTime, riskScore, channelEffectiveness;
            return __generator(this, function (_a) {
                if (communicationHistory.length === 0)
                    return [2 /*return*/, 30]; // Default low-medium risk
                responses = communicationHistory.filter(function (comm) { return comm.response_received; });
                responseRate = responses.length / communicationHistory.length;
                responseTimes = responses
                    .filter(function (r) { return r.response_time_minutes; })
                    .map(function (r) { return r.response_time_minutes; });
                avgResponseTime = responseTimes.length > 0
                    ? responseTimes.reduce(function (sum, time) { return sum + time; }, 0) / responseTimes.length
                    : 1440;
                riskScore = 0;
                riskScore += (1 - responseRate) * 50; // Poor response rate increases risk
                riskScore += Math.min(avgResponseTime / 60, 48) * 0.5; // Slow response increases risk
                channelEffectiveness = this.analyzeChannelEffectiveness(communicationHistory);
                riskScore += (1 - channelEffectiveness) * 20;
                return [2 /*return*/, Math.min(Math.max(riskScore, 0), 100)];
            });
        });
    };
    /**
     * Calculate contextual risk based on current circumstances
     */
    RiskScoringEngine.prototype.calculateContextualRisk = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with current patient status, health conditions, etc.
                // For now, returning a base contextual risk
                return [2 /*return*/, 25]; // Base contextual risk
            });
        });
    };
    /**
     * Calculate overall risk score from component scores
     */
    RiskScoringEngine.prototype.calculateOverallRiskScore = function (components) {
        var weightedScore = components.historicalRisk * this.config.weights[RiskFactorCategory.PATIENT_HISTORY] +
            components.behavioralRisk * this.config.weights[RiskFactorCategory.APPOINTMENT_CHARACTERISTICS] +
            components.demographicRisk * this.config.weights[RiskFactorCategory.DEMOGRAPHICS] +
            components.communicationRisk * this.config.weights[RiskFactorCategory.COMMUNICATION_PATTERNS] +
            components.contextualRisk * this.config.weights[RiskFactorCategory.EXTERNAL_FACTORS];
        return Math.round(weightedScore);
    };
    /**
     * Analyze risk trends over time
     */
    RiskScoringEngine.prototype.analyzeRiskTrends = function (appointmentHistory) {
        return __awaiter(this, void 0, void 0, function () {
            var monthlyGroups, monthlyHistory, recentMonths, firstHalf, secondHalf, firstAvg, secondAvg, trendDifference, trendConfidence, riskTrend;
            var _this = this;
            return __generator(this, function (_a) {
                if (appointmentHistory.length < 6) {
                    return [2 /*return*/, {
                            riskTrend: 'STABLE',
                            trendConfidence: 0.5,
                            monthlyHistory: []
                        }];
                }
                monthlyGroups = appointmentHistory.reduce(function (groups, apt) {
                    var month = new Date(apt.scheduled_date).toISOString().substring(0, 7);
                    if (!groups[month])
                        groups[month] = [];
                    groups[month].push(apt);
                    return groups;
                }, {});
                monthlyHistory = Object.entries(monthlyGroups)
                    .map(function (_a) {
                    var month = _a[0], appointments = _a[1];
                    return ({
                        month: month,
                        riskScore: _this.calculateMonthlyRiskScore(appointments),
                        appointmentCount: appointments.length
                    });
                })
                    .sort(function (a, b) { return a.month.localeCompare(b.month); });
                recentMonths = monthlyHistory.slice(-6);
                if (recentMonths.length < 3) {
                    return [2 /*return*/, {
                            riskTrend: 'STABLE',
                            trendConfidence: 0.6,
                            monthlyHistory: monthlyHistory
                        }];
                }
                firstHalf = recentMonths.slice(0, 3);
                secondHalf = recentMonths.slice(-3);
                firstAvg = firstHalf.reduce(function (sum, m) { return sum + m.riskScore; }, 0) / firstHalf.length;
                secondAvg = secondHalf.reduce(function (sum, m) { return sum + m.riskScore; }, 0) / secondHalf.length;
                trendDifference = secondAvg - firstAvg;
                trendConfidence = Math.min(recentMonths.length / 6, 1);
                if (trendDifference > 10) {
                    riskTrend = 'DETERIORATING';
                }
                else if (trendDifference < -10) {
                    riskTrend = 'IMPROVING';
                }
                else {
                    riskTrend = 'STABLE';
                }
                return [2 /*return*/, {
                        riskTrend: riskTrend,
                        trendConfidence: trendConfidence,
                        monthlyHistory: monthlyHistory
                    }];
            });
        });
    };
    /**
     * Identify top risk factors for the patient
     */
    RiskScoringEngine.prototype.identifyTopRiskFactors = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would analyze all factors and return the most significant ones
                // Placeholder implementation
                return [2 /*return*/, [
                        {
                            category: RiskFactorCategory.PATIENT_HISTORY,
                            factorName: 'High No-Show Rate',
                            value: 0.35,
                            weight: 0.25,
                            contribution: 35,
                            description: 'Patient has 35% historical no-show rate'
                        }
                    ]];
            });
        });
    };
    /**
     * Identify protective factors that reduce risk
     */
    RiskScoringEngine.prototype.identifyProtectiveFactors = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would identify factors that positively influence attendance
                // Placeholder implementation
                return [2 /*return*/, [
                        {
                            category: RiskFactorCategory.COMMUNICATION_PATTERNS,
                            factorName: 'High Response Rate',
                            value: 0.90,
                            weight: 0.15,
                            contribution: -10,
                            description: 'Patient consistently responds to communications'
                        }
                    ]];
            });
        });
    };
    /**
     * Generate intervention recommendations based on risk profile
     */
    RiskScoringEngine.prototype.generateInterventionRecommendations = function (riskScore, riskFactors) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations;
            return __generator(this, function (_a) {
                recommendations = [];
                if (riskScore >= 75) {
                    recommendations.push('Personal phone call 48 hours before appointment');
                    recommendations.push('Offer flexible rescheduling options');
                    recommendations.push('Consider incentive program enrollment');
                }
                else if (riskScore >= 50) {
                    recommendations.push('Enhanced reminder sequence (multiple channels)');
                    recommendations.push('Confirmation request 24 hours prior');
                    recommendations.push('Transportation assistance information');
                }
                else if (riskScore >= 25) {
                    recommendations.push('Standard reminder via preferred channel');
                    recommendations.push('Optional confirmation request');
                }
                return [2 /*return*/, recommendations];
            });
        });
    };
    /**
     * Generate appointment recommendations
     */
    RiskScoringEngine.prototype.generateAppointmentRecommendations = function (patientId, appointmentHistory) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, timePreferences, optimalAdvanceTime;
            return __generator(this, function (_a) {
                recommendations = [];
                timePreferences = this.analyzeTimePreferences(appointmentHistory);
                if (timePreferences.confidence > 0.7) {
                    recommendations.push({
                        type: 'TIME_SLOT',
                        recommendation: "Schedule appointments around ".concat(timePreferences.preferredTime),
                        expectedImpact: 15,
                        confidence: timePreferences.confidence,
                        reasoning: 'Based on historical attendance patterns'
                    });
                }
                optimalAdvanceTime = this.calculateOptimalAdvanceTime(appointmentHistory);
                recommendations.push({
                    type: 'ADVANCE_BOOKING',
                    recommendation: "Book appointments ".concat(optimalAdvanceTime, " days in advance"),
                    expectedImpact: 10,
                    confidence: 0.8,
                    reasoning: 'Optimal balance between planning and commitment'
                });
                return [2 /*return*/, recommendations];
            });
        });
    };
    // Helper methods
    RiskScoringEngine.prototype.applyTimeDecay = function (events, allEvents) {
        var _this = this;
        if (events.length === 0)
            return 0;
        var now = new Date();
        var weightedSum = 0;
        var totalWeight = 0;
        events.forEach(function (event) {
            var eventDate = new Date(event.scheduled_date);
            var monthsAgo = Math.max(0, (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            var weight = Math.pow(_this.config.decayFactors.timeDecay, monthsAgo);
            weightedSum += weight;
            totalWeight += weight;
        });
        var totalEvents = allEvents.length;
        var totalEventWeight = allEvents.reduce(function (sum, event) {
            var eventDate = new Date(event.scheduled_date);
            var monthsAgo = Math.max(0, (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            return sum + Math.pow(_this.config.decayFactors.timeDecay, monthsAgo);
        }, 0);
        return totalEventWeight > 0 ? weightedSum / totalEventWeight : 0;
    };
    RiskScoringEngine.prototype.analyzePatterns = function (appointmentHistory) {
        // Look for concerning patterns
        var patternPenalty = 0;
        // Consecutive no-shows
        var consecutiveNoShows = 0;
        var maxConsecutive = 0;
        appointmentHistory
            .sort(function (a, b) { return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime(); })
            .forEach(function (apt) {
            if (apt.status === 'NO_SHOW') {
                consecutiveNoShows++;
                maxConsecutive = Math.max(maxConsecutive, consecutiveNoShows);
            }
            else {
                consecutiveNoShows = 0;
            }
        });
        patternPenalty += maxConsecutive * 5; // 5 points per consecutive no-show
        return Math.min(patternPenalty, 25); // Cap at 25 points
    };
    RiskScoringEngine.prototype.analyzeBookingPatterns = function (appointmentHistory) {
        var bookings = appointmentHistory
            .filter(function (apt) { return apt.created_at && apt.scheduled_date; })
            .map(function (apt) {
            var booking = new Date(apt.created_at);
            var appointment = new Date(apt.scheduled_date);
            return (appointment.getTime() - booking.getTime()) / (1000 * 60 * 60 * 24);
        });
        var lastMinuteBookings = bookings.filter(function (days) { return days < 1; }).length / bookings.length;
        // Calculate timing consistency
        var avgBookingTime = bookings.reduce(function (sum, days) { return sum + days; }, 0) / bookings.length;
        var variance = bookings.reduce(function (sum, days) { return sum + Math.pow(days - avgBookingTime, 2); }, 0) / bookings.length;
        var inconsistentTiming = Math.min(variance / 100, 1); // Normalize variance
        return {
            lastMinuteBookings: lastMinuteBookings,
            inconsistentTiming: inconsistentTiming
        };
    };
    RiskScoringEngine.prototype.analyzeAppointmentFrequency = function (appointmentHistory) {
        // Analyze gaps between appointments
        var dates = appointmentHistory
            .map(function (apt) { return new Date(apt.scheduled_date); })
            .sort(function (a, b) { return a.getTime() - b.getTime(); });
        if (dates.length < 2)
            return 0;
        var gaps = [];
        for (var i = 1; i < dates.length; i++) {
            var gap = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
            gaps.push(gap);
        }
        var avgGap = gaps.reduce(function (sum, gap) { return sum + gap; }, 0) / gaps.length;
        var variance = gaps.reduce(function (sum, gap) { return sum + Math.pow(gap - avgGap, 2); }, 0) / gaps.length;
        // Higher variance indicates inconsistent scheduling patterns
        return Math.min(Math.sqrt(variance) / 30, 1); // Normalize
    };
    RiskScoringEngine.prototype.getAgeGroupRisk = function (ageGroup) {
        var riskMap = {
            '18-25': 0.8,
            '26-35': 0.6,
            '36-45': 0.4,
            '46-55': 0.3,
            '56-65': 0.2,
            '65+': 0.1
        };
        return riskMap[ageGroup] || 0.5;
    };
    RiskScoringEngine.prototype.analyzeChannelEffectiveness = function (communicationHistory) {
        if (communicationHistory.length === 0)
            return 0.5;
        var channels = communicationHistory.reduce(function (acc, comm) {
            if (!acc[comm.channel]) {
                acc[comm.channel] = { sent: 0, responded: 0 };
            }
            acc[comm.channel].sent++;
            if (comm.response_received) {
                acc[comm.channel].responded++;
            }
            return acc;
        }, {});
        var channelRates = Object.values(channels).map(function (ch) { return ch.responded / ch.sent; });
        return channelRates.length > 0 ? Math.max.apply(Math, channelRates) : 0.5;
    };
    RiskScoringEngine.prototype.calculateMonthlyRiskScore = function (appointments) {
        var noShows = appointments.filter(function (apt) { return apt.status === 'NO_SHOW'; }).length;
        var total = appointments.length;
        return total > 0 ? (noShows / total) * 100 : 0;
    };
    RiskScoringEngine.prototype.analyzeInterventionEffectiveness = function (interventionHistory) {
        var effectiveness = {};
        interventionHistory.forEach(function (intervention) {
            if (!effectiveness[intervention.type]) {
                effectiveness[intervention.type] = 0;
            }
            effectiveness[intervention.type] += intervention.effectivenessScore;
        });
        // Average the effectiveness scores
        Object.keys(effectiveness).forEach(function (type) {
            var count = interventionHistory.filter(function (i) { return i.type === type; }).length;
            effectiveness[type] = effectiveness[type] / count;
        });
        return effectiveness;
    };
    RiskScoringEngine.prototype.analyzeTimePreferences = function (appointmentHistory) {
        var timeSlots = appointmentHistory
            .filter(function (apt) { return apt.status === 'ATTENDED'; })
            .map(function (apt) { return new Date(apt.scheduled_date).getHours(); });
        if (timeSlots.length === 0) {
            return { preferredTime: '10:00', confidence: 0 };
        }
        var timeCounts = timeSlots.reduce(function (acc, hour) {
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});
        var _a = Object.entries(timeCounts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })[0], mostFrequentHour = _a[0], count = _a[1];
        var confidence = count / timeSlots.length;
        var preferredTime = "".concat(mostFrequentHour, ":00");
        return { preferredTime: preferredTime, confidence: confidence };
    };
    RiskScoringEngine.prototype.calculateOptimalAdvanceTime = function (appointmentHistory) {
        var advanceTimes = appointmentHistory
            .filter(function (apt) { return apt.created_at && apt.scheduled_date && apt.status === 'ATTENDED'; })
            .map(function (apt) {
            var booking = new Date(apt.created_at);
            var appointment = new Date(apt.scheduled_date);
            return Math.round((appointment.getTime() - booking.getTime()) / (1000 * 60 * 60 * 24));
        });
        if (advanceTimes.length === 0)
            return 7; // Default to 1 week
        // Find the most common advance time for attended appointments
        var timeFrequency = advanceTimes.reduce(function (acc, time) {
            acc[time] = (acc[time] || 0) + 1;
            return acc;
        }, {});
        var optimalTime = Object.entries(timeFrequency)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })[0][0];
        return parseInt(optimalTime);
    };
    RiskScoringEngine.prototype.getCommunicationScore = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder for communication score calculation
                return [2 /*return*/, 0.75];
            });
        });
    };
    RiskScoringEngine.prototype.calculateConfidenceScore = function (appointmentCount) {
        if (appointmentCount < this.config.minimumDataPoints) {
            return 0.5;
        }
        // Confidence increases with more data points, plateaus at 20 appointments
        var maxConfidence = 0.95;
        var minConfidence = 0.6;
        var optimalDataPoints = 20;
        var confidenceIncrease = Math.min(appointmentCount / optimalDataPoints, 1);
        return minConfidence + (maxConfidence - minConfidence) * confidenceIncrease;
    };
    RiskScoringEngine.prototype.getRiskLevel = function (riskScore) {
        if (riskScore >= this.config.thresholds.critical)
            return 'CRITICAL';
        if (riskScore >= this.config.thresholds.high)
            return 'HIGH';
        if (riskScore >= this.config.thresholds.medium)
            return 'MEDIUM';
        return 'LOW';
    };
    RiskScoringEngine.prototype.getPatientAppointmentHistory = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('appointments')
                            .select('*')
                            .eq('patient_id', patientId)
                            .order('scheduled_date', { ascending: false })];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    RiskScoringEngine.prototype.getPatientDemographics = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder implementation
                return [2 /*return*/, {
                        ageGroup: '26-35',
                        distanceFromClinic: 15,
                        socioeconomicIndicators: {},
                        transportationAccess: 'GOOD',
                        languageBarriers: false,
                        familySupport: 'MEDIUM',
                        employmentStatus: 'EMPLOYED',
                        insuranceType: 'PRIVATE'
                    }];
            });
        });
    };
    RiskScoringEngine.prototype.getCommunicationHistory = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder implementation
                return [2 /*return*/, []];
            });
        });
    };
    RiskScoringEngine.prototype.getInterventionHistory = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder implementation
                return [2 /*return*/, []];
            });
        });
    };
    RiskScoringEngine.prototype.calculateSeasonalPatterns = function (appointmentHistory) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder implementation
                return [2 /*return*/, {
                        'spring': 0.15,
                        'summer': 0.25,
                        'autumn': 0.20,
                        'winter': 0.30
                    }];
            });
        });
    };
    /**
     * Update risk profile with new appointment outcome
     */
    RiskScoringEngine.prototype.updateRiskProfile = function (patientId, appointmentOutcome) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for updating risk profile based on new data
                console.log("Updating risk profile for patient ".concat(patientId, " with outcome: ").concat(appointmentOutcome));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get risk scoring configuration
     */
    RiskScoringEngine.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * Update risk scoring configuration
     */
    RiskScoringEngine.prototype.updateConfig = function (newConfig) {
        this.config = __assign(__assign({}, this.config), newConfig);
    };
    return RiskScoringEngine;
}());
exports.RiskScoringEngine = RiskScoringEngine;
// Export default instance
exports.riskScoringEngine = new RiskScoringEngine();
// Export utility functions
function formatRiskScore(score) {
    return "".concat(Math.round(score), "%");
}
function getRiskLevelColor(level) {
    var colors = {
        LOW: 'text-green-600',
        MEDIUM: 'text-yellow-600',
        HIGH: 'text-orange-600',
        CRITICAL: 'text-red-600'
    };
    return colors[level] || 'text-gray-600';
}
function getRiskTrendIcon(trend) {
    var icons = {
        IMPROVING: '↗️',
        STABLE: '→',
        DETERIORATING: '↘️'
    };
    return icons[trend] || '→';
}
function calculateRiskReduction(baseRisk, interventionEffectiveness) {
    return Math.round(baseRisk * (1 - interventionEffectiveness));
}
