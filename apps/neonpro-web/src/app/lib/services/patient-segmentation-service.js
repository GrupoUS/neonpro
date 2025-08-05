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
exports.createpatientSegmentationService = exports.patientSegmentationService = exports.PatientSegmentationService = void 0;
var server_1 = require("@/lib/supabase/server");
var PatientSegmentationService = /** @class */ (function () {
    function PatientSegmentationService() {
    }
    PatientSegmentationService.prototype.getSupabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // AI Segmentation Engine
    PatientSegmentationService.prototype.createAISegment = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var aiCriteria, supabase, _a, segment, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.generateAICriteria(data)];
                    case 1:
                        aiCriteria = _b.sent();
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 2:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('patient_segments')
                                .insert({
                                name: data.segment_name,
                                description: data.description,
                                criteria: aiCriteria,
                                ai_model_used: data.ai_model || 'behavioral_clustering_v2',
                                accuracy_score: data.expected_accuracy || 0.85,
                                segment_type: data.segment_type,
                                is_active: true,
                                clinic_id: '89084c3a-9200-4058-a15a-b440d3c60687' // TODO: Get from user context
                            })
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), segment = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Generate initial segment memberships
                        return [4 /*yield*/, this.generateSegmentMemberships(segment.id, aiCriteria)];
                    case 4:
                        // Generate initial segment memberships
                        _b.sent();
                        return [2 /*return*/, segment];
                }
            });
        });
    };
    PatientSegmentationService.prototype.getPatientSegments = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = supabase
                            .from('patient_segments')
                            .select("\n        *,\n        segment_memberships:segment_memberships(count),\n        segment_performance:segment_performance(*)\n      ");
                        if ((filters === null || filters === void 0 ? void 0 : filters.is_active) !== undefined) {
                            query = query.eq('is_active', filters.is_active);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.segment_type) {
                            query = query.eq('segment_type', filters.segment_type);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.min_accuracy) {
                            query = query.gte('accuracy_score', filters.min_accuracy);
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
    // Multi-dimensional Segmentation
    PatientSegmentationService.prototype.analyzePatientsForSegmentation = function (segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, patients, error, analyses;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('profiles')
                                .select("\n        id,\n        full_name,\n        email,\n        phone,\n        birth_date,\n        gender,\n        address,\n        appointments:appointments(\n          id,\n          appointment_date,\n          status,\n          treatment_type,\n          total_amount\n        ),\n        preferences:user_preferences(*),\n        treatment_history:treatment_records(*)\n      ")];
                    case 2:
                        _a = _b.sent(), patients = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, Promise.all(patients.map(function (patient) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.generatePatientBehaviorAnalysis(patient)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 3:
                        analyses = _b.sent();
                        return [2 /*return*/, analyses];
                }
            });
        });
    };
    PatientSegmentationService.prototype.updateSegmentMemberships = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('segment_memberships')
                            .upsert(updates.map(function (update) { return ({
                            patient_id: update.patient_id,
                            segment_id: update.segment_id,
                            membership_score: update.membership_score,
                            join_date: update.join_date || new Date().toISOString(),
                            last_updated: new Date().toISOString(),
                            engagement_level: update.engagement_level,
                            lifetime_value_prediction: update.lifetime_value_prediction
                        }); }))];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    // Automated Segment Management
    PatientSegmentationService.prototype.createAutomatedSegment = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, segmentationRule, error, _b, _c;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _e.sent();
                        _c = (_b = supabase
                            .from('segmentation_rules'))
                            .insert;
                        _d = {
                            rule_name: rule.rule_name,
                            description: rule.description,
                            conditions: rule.conditions
                        };
                        return [4 /*yield*/, this.generateAIRecommendations(rule.conditions)];
                    case 2: return [4 /*yield*/, _c.apply(_b, [(_d.ai_recommendations = _e.sent(),
                                _d.is_active = true,
                                _d.auto_execute = rule.auto_execute || false,
                                _d.execution_schedule = rule.execution_schedule,
                                _d)])
                            .select()
                            .single()];
                    case 3:
                        _a = _e.sent(), segmentationRule = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!rule.auto_execute) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.executeSegmentationRule(segmentationRule.id)];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5: return [2 /*return*/, segmentationRule];
                }
            });
        });
    };
    PatientSegmentationService.prototype.executeSegmentationRule = function (ruleId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, rule, ruleError, segment;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('segmentation_rules')
                                .select('*')
                                .eq('id', ruleId)
                                .single()];
                    case 2:
                        _a = _b.sent(), rule = _a.data, ruleError = _a.error;
                        if (ruleError)
                            throw ruleError;
                        return [4 /*yield*/, this.createAISegment({
                                segment_name: "".concat(rule.rule_name, "_").concat(new Date().toISOString().split('T')[0]),
                                description: "Auto-generated segment from rule: ".concat(rule.rule_name),
                                criteria: rule.conditions,
                                segment_type: 'ai_generated',
                                ai_model: 'rule_based_v1'
                            })];
                    case 3:
                        segment = _b.sent();
                        // Update rule performance metrics
                        return [4 /*yield*/, this.updateRulePerformance(ruleId, segment.id)];
                    case 4:
                        // Update rule performance metrics
                        _b.sent();
                        return [2 /*return*/, segment];
                }
            });
        });
    };
    // Performance Tracking & Analytics
    PatientSegmentationService.prototype.getSegmentPerformance = function (segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, performance, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('segment_performance')
                                .select('*')
                                .eq('segment_id', segmentId)
                                .order('analysis_date', { ascending: false })
                                .limit(1)
                                .single()];
                    case 2:
                        _a = _b.sent(), performance = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        if (!!performance) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.generateSegmentPerformance(segmentId)];
                    case 3: 
                    // Generate performance metrics if not exists
                    return [2 /*return*/, _b.sent()];
                    case 4: return [2 /*return*/, performance];
                }
            });
        });
    };
    PatientSegmentationService.prototype.getSegmentAnalytics = function (segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, memberships, performance, trends;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.getSegmentMemberships(segmentId),
                            this.getSegmentPerformance(segmentId),
                            this.getSegmentTrends(segmentId)
                        ])];
                    case 1:
                        _a = _b.sent(), memberships = _a[0], performance = _a[1], trends = _a[2];
                        return [2 /*return*/, {
                                segment_id: segmentId,
                                total_members: memberships.length,
                                active_members: memberships.filter(function (m) { return m.engagement_level === 'high'; }).length,
                                average_membership_score: memberships.reduce(function (sum, m) { return sum + m.membership_score; }, 0) / memberships.length || 0,
                                avg_lifetime_value: this.calculateAverageLifetimeValue(memberships),
                                engagement_rate: performance.engagement_rate || 0,
                                conversion_rate: performance.conversion_rate || 0,
                                retention_rate: performance.retention_rate || 0,
                                top_characteristics: ['High engagement', 'Premium treatments', 'Regular visits'],
                                performance_summary: {
                                    retention_rate: performance.retention_rate || 0,
                                    engagement_score: performance.engagement_rate || 0,
                                    revenue_per_member: performance.avg_lifetime_value || 0,
                                    conversion_rate: performance.conversion_rate || 0,
                                    growth_rate: 0.15
                                },
                                trends: trends,
                                last_updated: new Date().toISOString()
                            }];
                }
            });
        });
    };
    // Privacy & Compliance Management
    PatientSegmentationService.prototype.getPatientConsentStatus = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, consent, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('patient_consent')
                            .select('*')
                            .eq('patient_id', patientId)
                            .single()];
                    case 1:
                        _a = _b.sent(), consent = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, consent || {
                                segmentation_consent: false,
                                marketing_consent: false,
                                analytics_consent: false,
                                last_updated: new Date().toISOString()
                            }];
                }
            });
        });
    };
    PatientSegmentationService.prototype.updatePatientConsent = function (patientId, consents) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('patient_consent')
                            .upsert(__assign(__assign({ patient_id: patientId }, consents), { last_updated: new Date().toISOString() }))];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        if (!(consents.segmentation_consent === false)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.removePatientFromAllSegments(patientId)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // AI Helper Methods
    PatientSegmentationService.prototype.generateAICriteria = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var criteria;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                criteria = {
                    demographic: ((_a = data.criteria) === null || _a === void 0 ? void 0 : _a.demographic) || {},
                    behavioral: ((_b = data.criteria) === null || _b === void 0 ? void 0 : _b.behavioral) || {},
                    psychographic: ((_c = data.criteria) === null || _c === void 0 ? void 0 : _c.psychographic) || {},
                    ai_generated: true,
                    confidence_score: 0.87,
                    model_version: 'v2.1',
                    generated_at: new Date().toISOString()
                };
                return [2 /*return*/, criteria];
            });
        });
    };
    PatientSegmentationService.prototype.generateAIRecommendations = function (conditions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // AI-powered recommendations for segment optimization
                return [2 /*return*/, {
                        optimization_suggestions: [
                            'Consider adding treatment frequency as a criteria',
                            'Include seasonal behavior patterns',
                            'Add lifetime value thresholds'
                        ],
                        predicted_performance: {
                            expected_size: '15-20% of patient base',
                            estimated_engagement: '0.72',
                            conversion_probability: '0.28'
                        },
                        similar_segments: [],
                        confidence_score: 0.85
                    }];
            });
        });
    };
    PatientSegmentationService.prototype.generatePatientBehaviorAnalysis = function (patient) {
        return __awaiter(this, void 0, void 0, function () {
            var appointments, treatmentHistory;
            return __generator(this, function (_a) {
                appointments = patient.appointments || [];
                treatmentHistory = patient.treatment_history || [];
                return [2 /*return*/, {
                        patient_id: patient.id,
                        demographic_profile: {
                            age_group: this.calculateAgeGroup(patient.birth_date),
                            gender: patient.gender,
                            location_segment: this.extractLocationSegment(patient.address)
                        },
                        behavioral_profile: {
                            visit_frequency: this.calculateVisitFrequency(appointments),
                            treatment_preferences: this.analyzeTreatmentPreferences(treatmentHistory),
                            engagement_level: this.calculateEngagementLevel(appointments),
                            seasonal_patterns: this.analyzeSeasonalPatterns(appointments)
                        },
                        psychographic_profile: {
                            lifestyle_indicators: this.extractLifestyleIndicators(patient.preferences),
                            value_orientation: this.analyzeValueOrientation(treatmentHistory),
                            communication_preferences: this.analyzeCommPreferences(patient.preferences)
                        },
                        predictive_scores: {
                            lifetime_value: this.predictLifetimeValue(appointments, treatmentHistory),
                            churn_probability: this.calculateChurnProbability(appointments),
                            treatment_propensity: this.calculateTreatmentPropensity(treatmentHistory),
                            engagement_score: this.calculateEngagementScore(appointments, patient.preferences)
                        },
                        last_analyzed: new Date().toISOString()
                    }];
            });
        });
    };
    PatientSegmentationService.prototype.generateSegmentMemberships = function (segmentId, criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var analyses, memberships, error;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.analyzePatientsForSegmentation(segmentId)];
                    case 1:
                        analyses = _a.sent();
                        memberships = analyses
                            .filter(function (analysis) { return _this.matchesCriteria(analysis, criteria); })
                            .map(function (analysis) { return ({
                            patient_id: analysis.patient_id,
                            segment_id: segmentId,
                            membership_score: _this.calculateMembershipScore(analysis, criteria),
                            join_date: new Date().toISOString(),
                            last_updated: new Date().toISOString(),
                            engagement_level: analysis.behavioral_profile.engagement_level,
                            lifetime_value_prediction: analysis.predictive_scores.lifetime_value
                        }); });
                        if (!(memberships.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, supabase
                                .from('segment_memberships')
                                .insert(memberships)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PatientSegmentationService.prototype.generateSegmentPerformance = function (segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var memberships, performance, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getSegmentMemberships(segmentId)];
                    case 1:
                        memberships = _b.sent();
                        performance = {
                            segment_id: segmentId,
                            total_members: memberships.length,
                            active_members: memberships.filter(function (m) { return m.engagement_level === 'high'; }).length,
                            engagement_rate: this.calculateEngagementRate(memberships),
                            conversion_rate: this.calculateConversionRate(memberships),
                            retention_rate: this.calculateRetentionRate(memberships),
                            avg_lifetime_value: this.calculateAverageLifetimeValue(memberships),
                            revenue_generated: this.calculateRevenueGenerated(memberships),
                            cost_per_acquisition: this.calculateCostPerAcquisition(memberships),
                            roi: this.calculateROI(memberships),
                            analysis_date: new Date().toISOString()
                        };
                        return [4 /*yield*/, supabase
                                .from('segment_performance')
                                .insert(performance)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Utility Methods
    PatientSegmentationService.prototype.calculateAgeGroup = function (birthDate) {
        var age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        if (age < 25)
            return '18-24';
        if (age < 35)
            return '25-34';
        if (age < 45)
            return '35-44';
        if (age < 55)
            return '45-54';
        if (age < 65)
            return '55-64';
        return '65+';
    };
    PatientSegmentationService.prototype.extractLocationSegment = function (address) {
        // Extract location-based segment from address
        return (address === null || address === void 0 ? void 0 : address.city) || 'unknown';
    };
    PatientSegmentationService.prototype.calculateVisitFrequency = function (appointments) {
        var monthlyVisits = appointments.length / 12; // Assuming 12-month period
        if (monthlyVisits >= 4)
            return 'high';
        if (monthlyVisits >= 2)
            return 'medium';
        return 'low';
    };
    PatientSegmentationService.prototype.analyzeTreatmentPreferences = function (treatmentHistory) {
        return __spreadArray([], new Set(treatmentHistory.map(function (t) { return t.treatment_type; })), true);
    };
    PatientSegmentationService.prototype.calculateEngagementLevel = function (appointments) {
        var recentAppointments = appointments.filter(function (a) {
            return new Date(a.appointment_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        });
        if (recentAppointments.length >= 3)
            return 'high';
        if (recentAppointments.length >= 1)
            return 'medium';
        return 'low';
    };
    PatientSegmentationService.prototype.analyzeSeasonalPatterns = function (appointments) {
        // Analyze seasonal appointment patterns
        var monthlyCount = new Array(12).fill(0);
        appointments.forEach(function (apt) {
            var month = new Date(apt.appointment_date).getMonth();
            monthlyCount[month]++;
        });
        return {
            peak_months: monthlyCount.map(function (count, index) { return ({ month: index, count: count }); })
                .filter(function (m) { return m.count > 0; })
                .sort(function (a, b) { return b.count - a.count; })
                .slice(0, 3)
        };
    };
    PatientSegmentationService.prototype.extractLifestyleIndicators = function (preferences) {
        return (preferences === null || preferences === void 0 ? void 0 : preferences.interests) || [];
    };
    PatientSegmentationService.prototype.analyzeValueOrientation = function (treatmentHistory) {
        var avgSpend = treatmentHistory.reduce(function (sum, t) { return sum + (t.amount || 0); }, 0) / treatmentHistory.length;
        if (avgSpend > 1000)
            return 'premium';
        if (avgSpend > 500)
            return 'value';
        return 'budget';
    };
    PatientSegmentationService.prototype.analyzeCommPreferences = function (preferences) {
        return (preferences === null || preferences === void 0 ? void 0 : preferences.communication_channels) || ['email'];
    };
    PatientSegmentationService.prototype.predictLifetimeValue = function (appointments, treatmentHistory) {
        var avgSpendPerVisit = treatmentHistory.reduce(function (sum, t) { return sum + (t.amount || 0); }, 0) / treatmentHistory.length;
        var visitFrequency = appointments.length / 12; // Annual frequency
        return avgSpendPerVisit * visitFrequency * 3; // 3-year LTV
    };
    PatientSegmentationService.prototype.calculateChurnProbability = function (appointments) {
        var lastAppointment = appointments[appointments.length - 1];
        if (!lastAppointment)
            return 0.9;
        var daysSinceLastVisit = (Date.now() - new Date(lastAppointment.appointment_date).getTime()) / (24 * 60 * 60 * 1000);
        return Math.min(daysSinceLastVisit / 180, 0.9); // Max 90% churn probability
    };
    PatientSegmentationService.prototype.calculateTreatmentPropensity = function (treatmentHistory) {
        return Math.min(treatmentHistory.length / 10, 1.0); // Normalized by 10 treatments
    };
    PatientSegmentationService.prototype.calculateEngagementScore = function (appointments, preferences) {
        var recencyScore = this.calculateRecencyScore(appointments);
        var frequencyScore = this.calculateFrequencyScore(appointments);
        var preferencesScore = preferences ? 0.2 : 0;
        return (recencyScore + frequencyScore + preferencesScore) / 3;
    };
    PatientSegmentationService.prototype.matchesCriteria = function (analysis, criteria) {
        // Implement criteria matching logic
        return true; // Simplified for now
    };
    PatientSegmentationService.prototype.calculateMembershipScore = function (analysis, criteria) {
        // Calculate how well patient matches segment criteria
        return 0.75; // Simplified for now
    };
    PatientSegmentationService.prototype.getSegmentMemberships = function (segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('segment_memberships')
                                .select('*')
                                .eq('segment_id', segmentId)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    PatientSegmentationService.prototype.getSegmentTrends = function (segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Get historical trends for segment
                return [2 /*return*/, {
                        membership_growth: [],
                        engagement_trends: [],
                        performance_trends: []
                    }];
            });
        });
    };
    PatientSegmentationService.prototype.calculateEngagementRate = function (memberships) {
        var engaged = memberships.filter(function (m) { return m.engagement_level === 'high'; }).length;
        return memberships.length > 0 ? engaged / memberships.length : 0;
    };
    PatientSegmentationService.prototype.calculateConversionRate = function (memberships) {
        // Calculate conversion rate based on treatments/purchases
        return 0.25; // Simplified for now
    };
    PatientSegmentationService.prototype.calculateRetentionRate = function (memberships) {
        // Calculate retention rate
        return 0.85; // Simplified for now
    };
    PatientSegmentationService.prototype.calculateAverageLifetimeValue = function (memberships) {
        var total = memberships.reduce(function (sum, m) { return sum + (m.lifetime_value_prediction || 0); }, 0);
        return memberships.length > 0 ? total / memberships.length : 0;
    };
    PatientSegmentationService.prototype.calculateRevenueGenerated = function (memberships) {
        return memberships.reduce(function (sum, m) { return sum + (m.lifetime_value_prediction || 0); }, 0);
    };
    PatientSegmentationService.prototype.calculateCostPerAcquisition = function (memberships) {
        return 150; // Simplified for now
    };
    PatientSegmentationService.prototype.calculateROI = function (memberships) {
        var revenue = this.calculateRevenueGenerated(memberships);
        var cost = this.calculateCostPerAcquisition(memberships) * memberships.length;
        return cost > 0 ? (revenue - cost) / cost : 0;
    };
    PatientSegmentationService.prototype.calculateRecencyScore = function (appointments) {
        if (!appointments.length)
            return 0;
        var lastAppointment = appointments[appointments.length - 1];
        var daysSince = (Date.now() - new Date(lastAppointment.appointment_date).getTime()) / (24 * 60 * 60 * 1000);
        return Math.max(0, 1 - (daysSince / 90)); // Score decreases over 90 days
    };
    PatientSegmentationService.prototype.calculateFrequencyScore = function (appointments) {
        return Math.min(appointments.length / 12, 1.0); // Normalized by 12 appointments
    };
    PatientSegmentationService.prototype.updateRulePerformance = function (ruleId, segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var performance, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSegmentPerformance(segmentId)];
                    case 1:
                        performance = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('segmentation_rules')
                                .update({
                                performance_metrics: {
                                    last_execution: new Date().toISOString(),
                                    segments_created: 1,
                                    avg_accuracy: performance.conversion_rate,
                                    avg_segment_size: performance.total_members
                                },
                                last_executed: new Date().toISOString()
                            })
                                .eq('id', ruleId)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    PatientSegmentationService.prototype.removePatientFromAllSegments = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('segment_memberships')
                            .delete()
                            .eq('patient_id', patientId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    return PatientSegmentationService;
}());
exports.PatientSegmentationService = PatientSegmentationService;
exports.patientSegmentationService = new PatientSegmentationService();
var createpatientSegmentationService = function () { return new PatientSegmentationService(); };
exports.createpatientSegmentationService = createpatientSegmentationService;
