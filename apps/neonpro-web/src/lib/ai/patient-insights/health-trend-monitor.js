"use strict";
// AI-Powered Health Trend Monitoring Engine
// Story 3.2: Task 5 - Health Trend Monitoring Engine
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
exports.HealthTrendMonitor = void 0;
var client_1 = require("@/lib/supabase/client");
var HealthTrendMonitor = /** @class */ (function () {
    function HealthTrendMonitor() {
        this.supabase = (0, client_1.createClient)();
        this.trendCache = new Map();
        this.alertThresholds = this.initializeAlertThresholds();
    }
    HealthTrendMonitor.prototype.monitorHealthTrends = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var healthData, _a, vitalSignsTrends, symptomTrends, treatmentResponseTrends, recoveryTrends, satisfactionTrends, behavioralHealthTrends, trendAnomalies, alerts, healthTrajectoryScore, insights, futureTrends, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getPatientHealthData(patientId)
                            // 2. Analyze different health dimensions
                        ];
                    case 1:
                        healthData = _b.sent();
                        return [4 /*yield*/, Promise.all([
                                this.analyzeVitalSignsTrends(healthData),
                                this.analyzeSymptomTrends(healthData),
                                this.analyzeTreatmentResponseTrends(healthData),
                                this.analyzeRecoveryTrends(healthData),
                                this.analyzeSatisfactionTrends(healthData),
                                this.analyzeBehavioralHealthTrends(healthData)
                            ])
                            // 3. Identify trend anomalies and patterns
                        ];
                    case 2:
                        _a = _b.sent(), vitalSignsTrends = _a[0], symptomTrends = _a[1], treatmentResponseTrends = _a[2], recoveryTrends = _a[3], satisfactionTrends = _a[4], behavioralHealthTrends = _a[5];
                        trendAnomalies = this.identifyTrendAnomalies(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], vitalSignsTrends, true), symptomTrends, true), treatmentResponseTrends, true), recoveryTrends, true));
                        alerts = this.generateTrendAlerts(trendAnomalies, patientId);
                        healthTrajectoryScore = this.calculateHealthTrajectoryScore(vitalSignsTrends, symptomTrends, treatmentResponseTrends, recoveryTrends);
                        insights = this.generateTrendInsights(vitalSignsTrends, symptomTrends, treatmentResponseTrends, recoveryTrends, satisfactionTrends, behavioralHealthTrends);
                        return [4 /*yield*/, this.predictFutureTrends(healthData, __spreadArray(__spreadArray(__spreadArray(__spreadArray([], vitalSignsTrends, true), symptomTrends, true), treatmentResponseTrends, true), recoveryTrends, true))];
                    case 3:
                        futureTrends = _b.sent();
                        return [2 /*return*/, {
                                patientId: patientId,
                                vitalSignsTrends: vitalSignsTrends,
                                symptomTrends: symptomTrends,
                                treatmentResponseTrends: treatmentResponseTrends,
                                recoveryTrends: recoveryTrends,
                                satisfactionTrends: satisfactionTrends,
                                behavioralHealthTrends: behavioralHealthTrends,
                                trendAnomalies: trendAnomalies,
                                alerts: alerts,
                                healthTrajectoryScore: healthTrajectoryScore,
                                insights: insights,
                                futureTrends: futureTrends,
                                monitoringRecommendations: this.generateMonitoringRecommendations(alerts, insights),
                                lastAnalysisDate: new Date(),
                                analysisVersion: '1.0.0'
                            }];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Health trend monitoring error:', error_1);
                        throw new Error("Failed to monitor health trends: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    HealthTrendMonitor.prototype.detectRealTimeAnomalies = function (patientId, newHealthData) {
        return __awaiter(this, void 0, void 0, function () {
            var recentTrends, anomalies, alerts, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getRecentTrends(patientId, 30)
                            // Analyze new data point against trends
                        ]; // Last 30 days
                    case 1:
                        recentTrends = _a.sent() // Last 30 days
                        ;
                        anomalies = this.analyzeDataPointAnomalies(newHealthData, recentTrends);
                        alerts = anomalies
                            .filter(function (anomaly) { return anomaly.severity >= _this.alertThresholds.minimumSeverity; })
                            .map(function (anomaly) { return _this.createTrendAlert(patientId, anomaly, newHealthData); });
                        // Update trend cache
                        this.updateTrendCache(patientId, newHealthData);
                        return [2 /*return*/, alerts];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Real-time anomaly detection error:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HealthTrendMonitor.prototype.generateHealthReport = function (patientId, timeframe) {
        return __awaiter(this, void 0, void 0, function () {
            var healthData, trends, report, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getPatientHealthData(patientId, timeframe)];
                    case 1:
                        healthData = _a.sent();
                        return [4 /*yield*/, this.monitorHealthTrends(patientId)
                            // Generate comprehensive health report
                        ];
                    case 2:
                        trends = _a.sent();
                        report = {
                            patientId: patientId,
                            timeframe: timeframe,
                            reportPeriod: this.calculateReportPeriod(timeframe),
                            executiveSummary: this.generateExecutiveSummary(trends),
                            keyMetrics: this.calculateKeyMetrics(trends),
                            trendAnalysis: {
                                improving: trends.vitalSignsTrends.filter(function (t) { return t.direction === 'improving'; }),
                                stable: trends.vitalSignsTrends.filter(function (t) { return t.direction === 'stable'; }),
                                concerning: trends.vitalSignsTrends.filter(function (t) { return t.direction === 'deteriorating'; })
                            },
                            riskAssessment: this.assessTrendBasedRisks(trends),
                            recommendations: trends.insights.map(function (insight) { return insight.recommendation; }),
                            nextReviewDate: this.calculateNextReviewDate(trends.healthTrajectoryScore),
                            reportGeneratedDate: new Date()
                        };
                        return [2 /*return*/, report];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Health report generation error:', error_3);
                        throw new Error("Failed to generate health report: ".concat(error_3 instanceof Error ? error_3.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    HealthTrendMonitor.prototype.predictHealthOutcomes = function (patientId_1, treatmentPlanId_1) {
        return __awaiter(this, arguments, void 0, function (patientId, treatmentPlanId, timeHorizon // days
        ) {
            var _a, healthData, treatmentPlan, currentTrends, predictions, confidenceIntervals, influencingFactors, scenarios, error_4;
            if (timeHorizon === void 0) { timeHorizon = 90; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                this.getPatientHealthData(patientId),
                                this.getTreatmentPlan(treatmentPlanId),
                                this.monitorHealthTrends(patientId)
                            ])
                            // Predict health outcomes based on current trends and treatment plan
                        ];
                    case 1:
                        _a = _b.sent(), healthData = _a[0], treatmentPlan = _a[1], currentTrends = _a[2];
                        return [4 /*yield*/, this.runHealthPredictionModels(healthData, treatmentPlan, currentTrends, timeHorizon)
                            // Calculate confidence intervals
                        ];
                    case 2:
                        predictions = _b.sent();
                        confidenceIntervals = this.calculateConfidenceIntervals(predictions);
                        influencingFactors = this.identifyInfluencingFactors(currentTrends, treatmentPlan);
                        scenarios = this.generateScenarioAnalysis(predictions, influencingFactors);
                        return [2 /*return*/, {
                                patientId: patientId,
                                treatmentPlanId: treatmentPlanId,
                                timeHorizon: timeHorizon,
                                predictions: predictions,
                                confidenceIntervals: confidenceIntervals,
                                influencingFactors: influencingFactors,
                                scenarios: scenarios,
                                recommendedInterventions: this.identifyRecommendedInterventions(predictions),
                                monitoringPriorities: this.identifyMonitoringPriorities(predictions),
                                predictionDate: new Date()
                            }];
                    case 3:
                        error_4 = _b.sent();
                        console.error('Health outcome prediction error:', error_4);
                        throw new Error("Failed to predict health outcomes: ".concat(error_4 instanceof Error ? error_4.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Data retrieval methods
    HealthTrendMonitor.prototype.getPatientHealthData = function (patientId, timeframe) {
        return __awaiter(this, void 0, void 0, function () {
            var timeWindow, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeWindow = this.calculateTimeWindow(timeframe);
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .select("\n        *,\n        vital_signs!inner(\n          *,\n          created_at >= '".concat(timeWindow.start.toISOString(), "'\n        ),\n        symptoms!inner(\n          *,\n          created_at >= '").concat(timeWindow.start.toISOString(), "'\n        ),\n        treatment_sessions!inner(\n          *,\n          created_at >= '").concat(timeWindow.start.toISOString(), "'\n        ),\n        satisfaction_scores!inner(\n          *,\n          created_at >= '").concat(timeWindow.start.toISOString(), "'\n        ),\n        health_assessments!inner(\n          *,\n          created_at >= '").concat(timeWindow.start.toISOString(), "'\n        )\n      "))
                                .eq('id', patientId)
                                .single()];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    HealthTrendMonitor.prototype.getRecentTrends = function (patientId, days) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, cutoffDate_1, healthData, trends;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cached = this.trendCache.get(patientId);
                        if (cached) {
                            cutoffDate_1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                            return [2 /*return*/, cached.filter(function (trend) { return new Date(trend.lastUpdated) >= cutoffDate_1; })];
                        }
                        return [4 /*yield*/, this.getPatientHealthData(patientId)];
                    case 1:
                        healthData = _a.sent();
                        return [4 /*yield*/, this.analyzeVitalSignsTrends(healthData)];
                    case 2:
                        trends = _a.sent();
                        return [2 /*return*/, trends];
                }
            });
        });
    };
    HealthTrendMonitor.prototype.getTreatmentPlan = function (treatmentPlanId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('treatment_plans')
                            .select("\n        *,\n        treatment_plan_items (*)\n      ")
                            .eq('id', treatmentPlanId)
                            .single()];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Trend analysis methods
    HealthTrendMonitor.prototype.analyzeVitalSignsTrends = function (healthData) {
        return __awaiter(this, void 0, void 0, function () {
            var vitalSigns, trends, bpTrend, hrTrend, weightTrend, bmiTrend;
            return __generator(this, function (_a) {
                vitalSigns = healthData.vital_signs || [];
                trends = [];
                bpTrend = this.analyzeBPTrend(vitalSigns);
                if (bpTrend)
                    trends.push(bpTrend);
                hrTrend = this.analyzeHRTrend(vitalSigns);
                if (hrTrend)
                    trends.push(hrTrend);
                weightTrend = this.analyzeWeightTrend(vitalSigns);
                if (weightTrend)
                    trends.push(weightTrend);
                bmiTrend = this.analyzeBMITrend(vitalSigns);
                if (bmiTrend)
                    trends.push(bmiTrend);
                return [2 /*return*/, trends];
            });
        });
    };
    HealthTrendMonitor.prototype.analyzeSymptomTrends = function (healthData) {
        return __awaiter(this, void 0, void 0, function () {
            var symptoms, trends, symptomGroups;
            var _this = this;
            return __generator(this, function (_a) {
                symptoms = healthData.symptoms || [];
                trends = [];
                symptomGroups = this.groupSymptomsByType(symptoms);
                // Analyze each symptom type for trends
                Object.entries(symptomGroups).forEach(function (_a) {
                    var symptomType = _a[0], symptomData = _a[1];
                    var trend = _this.analyzeSymptomTypeTrend(symptomType, symptomData);
                    if (trend)
                        trends.push(trend);
                });
                return [2 /*return*/, trends];
            });
        });
    };
    HealthTrendMonitor.prototype.analyzeTreatmentResponseTrends = function (healthData) {
        return __awaiter(this, void 0, void 0, function () {
            var treatmentSessions, trends, effectivenessTrend, sideEffectsTrend, recoveryTrend;
            return __generator(this, function (_a) {
                treatmentSessions = healthData.treatment_sessions || [];
                trends = [];
                effectivenessTrend = this.analyzeTreatmentEffectiveness(treatmentSessions);
                if (effectivenessTrend)
                    trends.push(effectivenessTrend);
                sideEffectsTrend = this.analyzeSideEffectsTrend(treatmentSessions);
                if (sideEffectsTrend)
                    trends.push(sideEffectsTrend);
                recoveryTrend = this.analyzeRecoveryTimeTrend(treatmentSessions);
                if (recoveryTrend)
                    trends.push(recoveryTrend);
                return [2 /*return*/, trends];
            });
        });
    };
    HealthTrendMonitor.prototype.analyzeRecoveryTrends = function (healthData) {
        return __awaiter(this, void 0, void 0, function () {
            var treatmentSessions, healthAssessments, trends, overallRecoveryTrend, healingRateTrend;
            return __generator(this, function (_a) {
                treatmentSessions = healthData.treatment_sessions || [];
                healthAssessments = healthData.health_assessments || [];
                trends = [];
                overallRecoveryTrend = this.analyzeOverallRecovery(treatmentSessions, healthAssessments);
                if (overallRecoveryTrend)
                    trends.push(overallRecoveryTrend);
                healingRateTrend = this.analyzeHealingRate(treatmentSessions);
                if (healingRateTrend)
                    trends.push(healingRateTrend);
                return [2 /*return*/, trends];
            });
        });
    };
    HealthTrendMonitor.prototype.analyzeSatisfactionTrends = function (healthData) {
        return __awaiter(this, void 0, void 0, function () {
            var satisfactionScores, trends, overallSatisfactionTrend, dimensionTrends;
            return __generator(this, function (_a) {
                satisfactionScores = healthData.satisfaction_scores || [];
                trends = [];
                overallSatisfactionTrend = this.analyzeOverallSatisfactionTrend(satisfactionScores);
                if (overallSatisfactionTrend)
                    trends.push(overallSatisfactionTrend);
                dimensionTrends = this.analyzeSatisfactionDimensionTrends(satisfactionScores);
                trends.push.apply(trends, dimensionTrends);
                return [2 /*return*/, trends];
            });
        });
    };
    HealthTrendMonitor.prototype.analyzeBehavioralHealthTrends = function (healthData) {
        return __awaiter(this, void 0, void 0, function () {
            var trends, complianceTrend, lifestyleTrend;
            return __generator(this, function (_a) {
                trends = [];
                complianceTrend = this.analyzeComplianceTrend(healthData);
                if (complianceTrend)
                    trends.push(complianceTrend);
                lifestyleTrend = this.analyzeLifestyleTrend(healthData);
                if (lifestyleTrend)
                    trends.push(lifestyleTrend);
                return [2 /*return*/, trends];
            });
        });
    };
    // Specific trend analysis methods
    HealthTrendMonitor.prototype.analyzeBPTrend = function (vitalSigns) {
        var bpReadings = vitalSigns
            .filter(function (vs) { return vs.systolic && vs.diastolic; })
            .map(function (vs) { return ({
            date: new Date(vs.created_at),
            systolic: vs.systolic,
            diastolic: vs.diastolic
        }); })
            .sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
        if (bpReadings.length < 3)
            return null;
        var systolicTrend = this.calculateLinearTrend(bpReadings.map(function (r) { return r.systolic; }));
        var diastolicTrend = this.calculateLinearTrend(bpReadings.map(function (r) { return r.diastolic; }));
        var direction = this.determineTrendDirection(systolicTrend.slope, diastolicTrend.slope);
        var significance = this.calculateTrendSignificance(systolicTrend.rSquared, diastolicTrend.rSquared);
        return {
            type: 'vital_signs',
            subtype: 'blood_pressure',
            patientId: '', // Will be set by caller
            direction: direction,
            magnitude: Math.abs(systolicTrend.slope) + Math.abs(diastolicTrend.slope),
            significance: significance,
            timeframe: this.calculateTimeframe(bpReadings[0].date, bpReadings[bpReadings.length - 1].date),
            dataPoints: bpReadings.length,
            description: this.generateBPTrendDescription(direction, systolicTrend, diastolicTrend),
            alertLevel: this.calculateBPAlertLevel(direction, systolicTrend, diastolicTrend),
            lastUpdated: new Date()
        };
    };
    HealthTrendMonitor.prototype.analyzeHRTrend = function (vitalSigns) {
        var hrReadings = vitalSigns
            .filter(function (vs) { return vs.heart_rate; })
            .map(function (vs) { return ({
            date: new Date(vs.created_at),
            heartRate: vs.heart_rate
        }); })
            .sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
        if (hrReadings.length < 3)
            return null;
        var trend = this.calculateLinearTrend(hrReadings.map(function (r) { return r.heartRate; }));
        var direction = this.determineTrendDirection(trend.slope);
        var significance = this.calculateTrendSignificance(trend.rSquared);
        return {
            type: 'vital_signs',
            subtype: 'heart_rate',
            patientId: '',
            direction: direction,
            magnitude: Math.abs(trend.slope),
            significance: significance,
            timeframe: this.calculateTimeframe(hrReadings[0].date, hrReadings[hrReadings.length - 1].date),
            dataPoints: hrReadings.length,
            description: this.generateHRTrendDescription(direction, trend),
            alertLevel: this.calculateHRAlertLevel(direction, trend),
            lastUpdated: new Date()
        };
    };
    HealthTrendMonitor.prototype.analyzeWeightTrend = function (vitalSigns) {
        var weightReadings = vitalSigns
            .filter(function (vs) { return vs.weight; })
            .map(function (vs) { return ({
            date: new Date(vs.created_at),
            weight: vs.weight
        }); })
            .sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
        if (weightReadings.length < 3)
            return null;
        var trend = this.calculateLinearTrend(weightReadings.map(function (r) { return r.weight; }));
        var direction = this.determineTrendDirection(trend.slope);
        var significance = this.calculateTrendSignificance(trend.rSquared);
        return {
            type: 'vital_signs',
            subtype: 'weight',
            patientId: '',
            direction: direction,
            magnitude: Math.abs(trend.slope),
            significance: significance,
            timeframe: this.calculateTimeframe(weightReadings[0].date, weightReadings[weightReadings.length - 1].date),
            dataPoints: weightReadings.length,
            description: this.generateWeightTrendDescription(direction, trend),
            alertLevel: this.calculateWeightAlertLevel(direction, trend),
            lastUpdated: new Date()
        };
    };
    HealthTrendMonitor.prototype.analyzeBMITrend = function (vitalSigns) {
        var bmiReadings = vitalSigns
            .filter(function (vs) { return vs.weight && vs.height; })
            .map(function (vs) { return ({
            date: new Date(vs.created_at),
            bmi: vs.weight / Math.pow(vs.height / 100, 2)
        }); })
            .sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
        if (bmiReadings.length < 3)
            return null;
        var trend = this.calculateLinearTrend(bmiReadings.map(function (r) { return r.bmi; }));
        var direction = this.determineTrendDirection(trend.slope);
        var significance = this.calculateTrendSignificance(trend.rSquared);
        return {
            type: 'vital_signs',
            subtype: 'bmi',
            patientId: '',
            direction: direction,
            magnitude: Math.abs(trend.slope),
            significance: significance,
            timeframe: this.calculateTimeframe(bmiReadings[0].date, bmiReadings[bmiReadings.length - 1].date),
            dataPoints: bmiReadings.length,
            description: this.generateBMITrendDescription(direction, trend),
            alertLevel: this.calculateBMIAlertLevel(direction, trend),
            lastUpdated: new Date()
        };
    };
    // Utility methods
    HealthTrendMonitor.prototype.calculateLinearTrend = function (values) {
        var n = values.length;
        var x = Array.from({ length: n }, function (_, i) { return i; });
        var sumX = x.reduce(function (sum, val) { return sum + val; }, 0);
        var sumY = values.reduce(function (sum, val) { return sum + val; }, 0);
        var sumXY = x.reduce(function (sum, val, i) { return sum + val * values[i]; }, 0);
        var sumXX = x.reduce(function (sum, val) { return sum + val * val; }, 0);
        var sumYY = values.reduce(function (sum, val) { return sum + val * val; }, 0);
        var slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        var intercept = (sumY - slope * sumX) / n;
        // Calculate R-squared
        var meanY = sumY / n;
        var ssTotal = values.reduce(function (sum, val) { return sum + Math.pow(val - meanY, 2); }, 0);
        var ssResidual = values.reduce(function (sum, val, i) {
            var predicted = slope * i + intercept;
            return sum + Math.pow(val - predicted, 2);
        }, 0);
        var rSquared = 1 - (ssResidual / ssTotal);
        return { slope: slope, intercept: intercept, rSquared: rSquared };
    };
    HealthTrendMonitor.prototype.determineTrendDirection = function (slope, slope2) {
        var avgSlope = slope2 !== undefined ? (slope + slope2) / 2 : slope;
        if (Math.abs(avgSlope) < 0.01)
            return 'stable';
        return avgSlope > 0 ? 'improving' : 'deteriorating';
    };
    HealthTrendMonitor.prototype.calculateTrendSignificance = function (rSquared, rSquared2) {
        var avgRSquared = rSquared2 !== undefined ? (rSquared + rSquared2) / 2 : rSquared;
        if (avgRSquared > 0.7)
            return 'high';
        if (avgRSquared > 0.4)
            return 'medium';
        return 'low';
    };
    HealthTrendMonitor.prototype.calculateTimeframe = function (startDate, endDate) {
        return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    };
    HealthTrendMonitor.prototype.generateBPTrendDescription = function (direction, systolicTrend, diastolicTrend) {
        if (direction === 'stable') {
            return 'Blood pressure readings remain stable within normal range';
        }
        var systolicChange = Math.abs(systolicTrend.slope * 30); // 30-day projection
        var diastolicChange = Math.abs(diastolicTrend.slope * 30);
        return "Blood pressure ".concat(direction === 'improving' ? 'improving' : 'increasing', " trend detected. ") +
            "Projected 30-day change: ".concat(systolicChange.toFixed(1), "/").concat(diastolicChange.toFixed(1), " mmHg");
    };
    HealthTrendMonitor.prototype.calculateBPAlertLevel = function (direction, systolicTrend, diastolicTrend) {
        if (direction === 'stable')
            return 'none';
        var maxSlope = Math.max(Math.abs(systolicTrend.slope), Math.abs(diastolicTrend.slope));
        var significance = this.calculateTrendSignificance(systolicTrend.rSquared, diastolicTrend.rSquared);
        if (significance === 'high' && maxSlope > 1)
            return 'high';
        if (significance === 'medium' && maxSlope > 0.5)
            return 'medium';
        if (maxSlope > 0.1)
            return 'low';
        return 'none';
    };
    // Additional helper methods (simplified implementations)
    HealthTrendMonitor.prototype.generateHRTrendDescription = function (direction, trend) {
        return "Heart rate showing ".concat(direction, " trend"); // Simplified
    };
    HealthTrendMonitor.prototype.calculateHRAlertLevel = function (direction, trend) {
        return 'none'; // Simplified
    };
    HealthTrendMonitor.prototype.generateWeightTrendDescription = function (direction, trend) {
        return "Weight showing ".concat(direction, " trend"); // Simplified
    };
    HealthTrendMonitor.prototype.calculateWeightAlertLevel = function (direction, trend) {
        return 'none'; // Simplified
    };
    HealthTrendMonitor.prototype.generateBMITrendDescription = function (direction, trend) {
        return "BMI showing ".concat(direction, " trend"); // Simplified
    };
    HealthTrendMonitor.prototype.calculateBMIAlertLevel = function (direction, trend) {
        return 'none'; // Simplified
    };
    HealthTrendMonitor.prototype.groupSymptomsByType = function (symptoms) {
        return symptoms.reduce(function (groups, symptom) {
            var type = symptom.type || 'general';
            if (!groups[type])
                groups[type] = [];
            groups[type].push(symptom);
            return groups;
        }, {});
    };
    HealthTrendMonitor.prototype.analyzeSymptomTypeTrend = function (symptomType, symptoms) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeTreatmentEffectiveness = function (treatmentSessions) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeSideEffectsTrend = function (treatmentSessions) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeRecoveryTimeTrend = function (treatmentSessions) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeOverallRecovery = function (treatmentSessions, healthAssessments) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeHealingRate = function (treatmentSessions) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeOverallSatisfactionTrend = function (satisfactionScores) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeSatisfactionDimensionTrends = function (satisfactionScores) {
        return []; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeComplianceTrend = function (healthData) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.analyzeLifestyleTrend = function (healthData) {
        return null; // Simplified implementation
    };
    HealthTrendMonitor.prototype.identifyTrendAnomalies = function (trends) {
        return []; // Simplified implementation
    };
    HealthTrendMonitor.prototype.generateTrendAlerts = function (anomalies, patientId) {
        return []; // Simplified implementation
    };
    HealthTrendMonitor.prototype.calculateHealthTrajectoryScore = function (vitalSignsTrends, symptomTrends, treatmentResponseTrends, recoveryTrends) {
        return 7.5; // Simplified implementation
    };
    HealthTrendMonitor.prototype.generateTrendInsights = function (vitalSignsTrends, symptomTrends, treatmentResponseTrends, recoveryTrends, satisfactionTrends, behavioralHealthTrends) {
        return []; // Simplified implementation
    };
    HealthTrendMonitor.prototype.predictFutureTrends = function (healthData, currentTrends) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []]; // Simplified implementation
            });
        });
    };
    HealthTrendMonitor.prototype.generateMonitoringRecommendations = function (alerts, insights) {
        return ['Continue regular monitoring']; // Simplified implementation
    };
    HealthTrendMonitor.prototype.calculateTimeWindow = function (timeframe) {
        var end = new Date();
        var start = new Date();
        switch (timeframe) {
            case 'week':
                start.setDate(end.getDate() - 7);
                break;
            case 'month':
                start.setMonth(end.getMonth() - 1);
                break;
            case 'quarter':
                start.setMonth(end.getMonth() - 3);
                break;
            case 'year':
                start.setFullYear(end.getFullYear() - 1);
                break;
            default:
                start.setMonth(end.getMonth() - 3); // Default to 3 months
        }
        return { start: start, end: end };
    };
    HealthTrendMonitor.prototype.updateTrendCache = function (patientId, newData) {
        // Update cache with new data point
        var trends = this.trendCache.get(patientId) || [];
        // Add logic to update trends with new data
        this.trendCache.set(patientId, trends);
    };
    HealthTrendMonitor.prototype.analyzeDataPointAnomalies = function (newData, recentTrends) {
        return []; // Simplified implementation
    };
    HealthTrendMonitor.prototype.createTrendAlert = function (patientId, anomaly, data) {
        return {
            id: "alert_".concat(Date.now()),
            patientId: patientId,
            type: 'trend_anomaly',
            severity: anomaly.severity,
            title: "Health trend anomaly detected",
            description: anomaly.description,
            dataPoint: data,
            createdAt: new Date(),
            acknowledged: false
        };
    };
    HealthTrendMonitor.prototype.initializeAlertThresholds = function () {
        return {
            minimumSeverity: 0.7,
            vitalSigns: {
                bloodPressure: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
                heartRate: { min: 60, max: 100 },
                weight: { changeThreshold: 5 }, // kg per month
                bmi: { changeThreshold: 1 } // units per month
            },
            symptoms: {
                severityThreshold: 7, // 1-10 scale
                frequencyThreshold: 3 // occurrences per week
            },
            treatment: {
                effectivenessThreshold: 0.7,
                sideEffectThreshold: 0.3
            }
        };
    };
    // Additional methods for report generation and predictions (simplified)
    HealthTrendMonitor.prototype.calculateReportPeriod = function (timeframe) {
        return this.calculateTimeWindow(timeframe);
    };
    HealthTrendMonitor.prototype.generateExecutiveSummary = function (trends) {
        return 'Overall health trends are stable with some areas for improvement.'; // Simplified
    };
    HealthTrendMonitor.prototype.calculateKeyMetrics = function (trends) {
        return {
            overallScore: trends.healthTrajectoryScore,
            improvingTrends: trends.vitalSignsTrends.filter(function (t) { return t.direction === 'improving'; }).length,
            concerningTrends: trends.vitalSignsTrends.filter(function (t) { return t.direction === 'deteriorating'; }).length
        };
    };
    HealthTrendMonitor.prototype.assessTrendBasedRisks = function (trends) {
        return ['Monitor blood pressure trends']; // Simplified
    };
    HealthTrendMonitor.prototype.calculateNextReviewDate = function (healthScore) {
        var reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() + (healthScore > 8 ? 30 : 14));
        return reviewDate;
    };
    HealthTrendMonitor.prototype.runHealthPredictionModels = function (healthData, treatmentPlan, trends, timeHorizon) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []]; // Simplified implementation
            });
        });
    };
    HealthTrendMonitor.prototype.calculateConfidenceIntervals = function (predictions) {
        return []; // Simplified implementation
    };
    HealthTrendMonitor.prototype.identifyInfluencingFactors = function (trends, treatmentPlan) {
        return []; // Simplified implementation
    };
    HealthTrendMonitor.prototype.generateScenarioAnalysis = function (predictions, factors) {
        return []; // Simplified implementation
    };
    HealthTrendMonitor.prototype.identifyRecommendedInterventions = function (predictions) {
        return ['Continue current treatment plan']; // Simplified implementation
    };
    HealthTrendMonitor.prototype.identifyMonitoringPriorities = function (predictions) {
        return ['Vital signs', 'Symptom tracking']; // Simplified implementation
    };
    return HealthTrendMonitor;
}());
exports.HealthTrendMonitor = HealthTrendMonitor;
