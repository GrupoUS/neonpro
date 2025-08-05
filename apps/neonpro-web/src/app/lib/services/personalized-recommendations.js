"use strict";
// Story 9.2: Personalized Treatment Recommendations - Backend Service
// AI-powered personalized treatment recommendation engine
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
exports.createpersonalizedRecommendationsService = exports.PersonalizedRecommendationService = void 0;
var server_1 = require("../../utils/supabase/server");
var PersonalizedRecommendationService = /** @class */ (function () {
    function PersonalizedRecommendationService() {
    }
    // Recommendation Profile Management
    PersonalizedRecommendationService.prototype.createRecommendationProfile = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, profile, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('recommendation_profiles')
                                .insert({
                                patient_id: data.patient_id,
                                profile_data: data.profile_data,
                                preference_weights: data.preference_weights || {},
                                lifestyle_factors: data.lifestyle_factors || {},
                                medical_preferences: data.medical_preferences || {},
                                communication_preferences: data.communication_preferences || {},
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), profile = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create recommendation profile: ".concat(error.message));
                        return [2 /*return*/, profile];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getRecommendationProfile = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('recommendation_profiles')
                                .select('*')
                                .eq('patient_id', patientId)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            throw new Error("Failed to get recommendation profile: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.updateRecommendationProfile = function (patientId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('recommendation_profiles')
                                .update(updates)
                                .eq('patient_id', patientId)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to update recommendation profile: ".concat(error.message));
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // AI-Powered Recommendation Generation
    PersonalizedRecommendationService.prototype.generatePersonalizedRecommendations = function (patientId, treatmentCategory) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, factors, safetyProfile, recommendations, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getRecommendationProfile(patientId)];
                    case 1:
                        profile = _c.sent();
                        return [4 /*yield*/, this.getPersonalizationFactors(patientId)];
                    case 2:
                        factors = _c.sent();
                        return [4 /*yield*/, this.getSafetyProfile(patientId)];
                    case 3:
                        safetyProfile = _c.sent();
                        return [4 /*yield*/, this.runRecommendationEngine(patientId, profile, factors, safetyProfile, treatmentCategory)];
                    case 4:
                        recommendations = _c.sent();
                        _b = {
                            recommendations: recommendations.primary,
                            personalization_score: recommendations.personalization_score
                        };
                        _a = safetyProfile;
                        if (_a) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.createDefaultSafetyProfile(patientId)];
                    case 5:
                        _a = (_c.sent());
                        _c.label = 6;
                    case 6: return [2 /*return*/, (_b.safety_assessment = _a,
                            _b.confidence_level = recommendations.confidence_level,
                            _b.explanation = recommendations.explanation,
                            _b.alternative_options = recommendations.alternatives,
                            _b)];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.runRecommendationEngine = function (patientId, profile, factors, safetyProfile, category) {
        return __awaiter(this, void 0, void 0, function () {
            var baseRecommendations, personalizedOptions, safeOptions, recommendations, alternatives;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBaseTreatmentOptions(category)];
                    case 1:
                        baseRecommendations = _a.sent();
                        personalizedOptions = this.applyPersonalizationFactors(baseRecommendations, factors);
                        safeOptions = this.applySafetyFiltering(personalizedOptions, safetyProfile);
                        return [4 /*yield*/, Promise.all(safeOptions.slice(0, 3).map(function (option, index) { return __awaiter(_this, void 0, void 0, function () {
                                var recommendation;
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    recommendation = {
                                        id: '', // Will be set by database
                                        patient_id: patientId,
                                        provider_id: '', // Will be set by API
                                        recommendation_type: 'primary_treatment',
                                        treatment_options: [option],
                                        ranking_scores: (_a = {}, _a[option.id] = option.success_probability, _a),
                                        rationale: "Personalized recommendation based on patient factors and safety profile. Success probability: ".concat((option.success_probability * 100).toFixed(1), "%"),
                                        success_probabilities: (_b = {}, _b[option.id] = option.success_probability, _b),
                                        risk_assessments: (_c = {}, _c[option.id] = this.generateRiskAssessment(option, safetyProfile), _c),
                                        contraindications: (safetyProfile === null || safetyProfile === void 0 ? void 0 : safetyProfile.contraindications) || [],
                                        alternatives: [],
                                        status: 'pending',
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                    };
                                    return [2 /*return*/, recommendation];
                                });
                            }); }))];
                    case 2:
                        recommendations = _a.sent();
                        alternatives = safeOptions.slice(3, 6).map(function (option) { return ({
                            option: option,
                            ranking_score: option.success_probability * 0.8, // Slightly lower than primary
                            comparison_rationale: "Alternative option with good suitability for patient profile",
                            pros: ["".concat(option.intensity, " intensity"), 'Good success rate', 'Suitable for patient profile'],
                            cons: ['Lower ranking than primary options', 'May require longer duration'],
                            suitability_score: option.success_probability * 0.85,
                        }); });
                        return [2 /*return*/, {
                                primary: recommendations,
                                alternatives: alternatives,
                                personalization_score: this.calculatePersonalizationScore(factors, profile),
                                confidence_level: this.calculateConfidenceLevel(factors, safetyProfile),
                                explanation: this.generateExplanation(factors, safetyProfile, recommendations.length),
                            }];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getBaseTreatmentOptions = function (category) {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                options = [
                    {
                        id: 'treatment_1',
                        name: 'Laser Facial Rejuvenation',
                        type: 'aesthetic',
                        description: 'Advanced laser treatment for skin rejuvenation and anti-aging',
                        duration: '4-6 sessions',
                        intensity: 'moderate',
                        cost_estimate: 1500,
                        success_probability: 0.85,
                        risk_level: 'low',
                        contraindications: ['pregnancy', 'recent_sun_exposure'],
                        requirements: ['consultation', 'patch_test'],
                        alternatives: ['chemical_peel', 'microneedling'],
                    },
                    {
                        id: 'treatment_2',
                        name: 'Botox Anti-Aging Treatment',
                        type: 'aesthetic',
                        description: 'Injectable treatment for wrinkle reduction and prevention',
                        duration: '1 session, 3-4 month duration',
                        intensity: 'minimal',
                        cost_estimate: 800,
                        success_probability: 0.92,
                        risk_level: 'very_low',
                        contraindications: ['neuromuscular_disorders', 'pregnancy'],
                        requirements: ['medical_clearance'],
                        alternatives: ['dermal_fillers', 'laser_treatment'],
                    },
                    {
                        id: 'treatment_3',
                        name: 'Chemical Peel Treatment',
                        type: 'dermatological',
                        description: 'Chemical exfoliation for skin texture improvement',
                        duration: '2-4 sessions',
                        intensity: 'mild',
                        cost_estimate: 600,
                        success_probability: 0.78,
                        risk_level: 'low',
                        contraindications: ['sensitive_skin', 'recent_laser'],
                        requirements: ['skin_preparation'],
                        alternatives: ['microdermabrasion', 'laser_resurfacing'],
                    },
                    {
                        id: 'treatment_4',
                        name: 'Dermal Filler Enhancement',
                        type: 'cosmetic',
                        description: 'Injectable volume enhancement for facial contouring',
                        duration: '1-2 sessions',
                        intensity: 'moderate',
                        cost_estimate: 1200,
                        success_probability: 0.88,
                        risk_level: 'low',
                        contraindications: ['autoimmune_disorders', 'blood_thinners'],
                        requirements: ['consultation', 'medical_history'],
                        alternatives: ['fat_transfer', 'thread_lift'],
                    },
                    {
                        id: 'treatment_5',
                        name: 'Microneedling Therapy',
                        type: 'therapeutic',
                        description: 'Collagen induction therapy for skin improvement',
                        duration: '3-6 sessions',
                        intensity: 'mild',
                        cost_estimate: 400,
                        success_probability: 0.75,
                        risk_level: 'very_low',
                        contraindications: ['active_acne', 'blood_disorders'],
                        requirements: ['consultation'],
                        alternatives: ['laser_therapy', 'chemical_peel'],
                    },
                ];
                return [2 /*return*/, category ? options.filter(function (opt) { return opt.type === category; }) : options];
            });
        });
    };
    PersonalizedRecommendationService.prototype.applyPersonalizationFactors = function (options, factors) {
        return options.map(function (option) {
            var adjustedProbability = option.success_probability;
            // Apply age factor
            var ageFactor = factors.find(function (f) { return f.factor_type === 'demographic' && f.factor_category === 'age_related'; });
            if (ageFactor) {
                var age = ageFactor.factor_value.age;
                if (age < 30)
                    adjustedProbability *= 1.1; // Better results for younger patients
                else if (age > 60)
                    adjustedProbability *= 0.95; // Slightly lower for older patients
            }
            // Apply treatment history factor
            var historyFactor = factors.find(function (f) { return f.factor_type === 'medical_history' && f.factor_category === 'treatment_history'; });
            if (historyFactor) {
                var previousTreatments = historyFactor.factor_value.previous_treatments || [];
                if (previousTreatments.includes(option.type)) {
                    adjustedProbability *= 1.05; // Boost for familiar treatment types
                }
            }
            // Apply lifestyle factors
            var lifestyleFactor = factors.find(function (f) { return f.factor_type === 'lifestyle'; });
            if (lifestyleFactor) {
                var sunExposure = lifestyleFactor.factor_value.sun_exposure;
                if (sunExposure === 'high' && option.type === 'aesthetic') {
                    adjustedProbability *= 0.9; // Lower success for high sun exposure
                }
            }
            return __assign(__assign({}, option), { success_probability: Math.max(0.1, Math.min(0.99, adjustedProbability)) });
        });
    };
    PersonalizedRecommendationService.prototype.applySafetyFiltering = function (options, safetyProfile) {
        if (!safetyProfile)
            return options;
        return options.filter(function (option) {
            // Check contraindications
            var hasContraindication = safetyProfile.contraindications.some(function (contraindication) { return option.contraindications.includes(contraindication.description); });
            // Check allergies
            var hasAllergy = safetyProfile.allergies.some(function (allergy) { return option.contraindications.includes(allergy.allergen); });
            return !hasContraindication && !hasAllergy;
        });
    };
    PersonalizedRecommendationService.prototype.generateRiskAssessment = function (option, safetyProfile) {
        var riskFactors = (safetyProfile === null || safetyProfile === void 0 ? void 0 : safetyProfile.risk_factors) || [];
        return {
            risk_level: option.risk_level,
            risk_factors: riskFactors.map(function (rf) { return ({
                id: rf.id,
                factor_name: rf.factor_name,
                factor_type: rf.factor_type,
                risk_level: rf.risk_level,
                description: rf.description,
                mitigation_strategies: rf.mitigation_strategies,
            }); }),
            mitigation_strategies: [
                'Follow pre-treatment instructions',
                'Monitor for adverse reactions',
                'Schedule follow-up appointments',
            ],
            monitoring_requirements: [
                'Post-treatment observation',
                'Regular progress assessments',
                'Side effect monitoring',
            ],
            safety_precautions: [
                'Proper patient preparation',
                'Sterile technique',
                'Emergency protocols ready',
            ],
        };
    };
    PersonalizedRecommendationService.prototype.calculatePersonalizationScore = function (factors, profile) {
        var factorCount = factors.length;
        var profileCompleteness = profile ? Object.keys(profile.profile_data).length / 10 : 0; // Assume 10 key fields
        return Math.min(1.0, (factorCount * 0.1) + (profileCompleteness * 0.5));
    };
    PersonalizedRecommendationService.prototype.calculateConfidenceLevel = function (factors, safetyProfile) {
        var factorConfidence = factors.reduce(function (sum, f) { return sum + f.confidence_score; }, 0) / Math.max(factors.length, 1);
        var safetyCompleteness = safetyProfile ? 0.9 : 0.5; // Higher confidence with complete safety profile
        return (factorConfidence * 0.7) + (safetyCompleteness * 0.3);
    };
    PersonalizedRecommendationService.prototype.generateExplanation = function (factors, safetyProfile, recommendationCount) {
        var factorTypes = Array.from(new Set(factors.map(function (f) { return f.factor_type; })));
        var hasCommonFactors = factorTypes.includes('demographic') && factorTypes.includes('medical_history');
        var explanation = "Generated ".concat(recommendationCount, " personalized recommendations based on ");
        if (hasCommonFactors) {
            explanation += 'comprehensive patient analysis including demographics, medical history, and preferences. ';
        }
        else {
            explanation += 'available patient data and clinical guidelines. ';
        }
        if (safetyProfile) {
            explanation += 'Safety profile reviewed for contraindications and risk factors. ';
        }
        else {
            explanation += 'Standard safety precautions applied. ';
        }
        explanation += 'Recommendations are ranked by success probability and patient suitability.';
        return explanation;
    };
    // Treatment Recommendation Management
    PersonalizedRecommendationService.prototype.createTreatmentRecommendation = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, recommendation, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_recommendations')
                                .insert({
                                patient_id: data.patient_id,
                                provider_id: data.provider_id,
                                recommendation_type: data.recommendation_type,
                                treatment_options: data.treatment_options,
                                ranking_scores: {},
                                rationale: data.rationale || 'AI-generated personalized recommendation',
                                success_probabilities: {},
                                risk_assessments: {},
                                contraindications: [],
                                alternatives: [],
                                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), recommendation = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create treatment recommendation: ".concat(error.message));
                        return [2 /*return*/, recommendation];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getTreatmentRecommendations = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, queryBuilder, _a, data, count, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        queryBuilder = supabase
                            .from('treatment_recommendations')
                            .select("\n        *,\n        patient:patient_id(id, email, raw_user_meta_data),\n        provider:provider_id(id, email, raw_user_meta_data)\n      ", { count: 'exact' });
                        if (query.patient_id)
                            queryBuilder = queryBuilder.eq('patient_id', query.patient_id);
                        if (query.provider_id)
                            queryBuilder = queryBuilder.eq('provider_id', query.provider_id);
                        if (query.status)
                            queryBuilder = queryBuilder.eq('status', query.status);
                        if (query.recommendation_type)
                            queryBuilder = queryBuilder.eq('recommendation_type', query.recommendation_type);
                        return [4 /*yield*/, queryBuilder
                                .order(query.sort_by, { ascending: query.sort_order === 'asc' })
                                .range(query.offset, query.offset + query.limit - 1)];
                    case 2:
                        _a = _b.sent(), data = _a.data, count = _a.count, error = _a.error;
                        if (error)
                            throw new Error("Failed to get treatment recommendations: ".concat(error.message));
                        return [2 /*return*/, {
                                recommendations: (data || []),
                                total: count || 0,
                            }];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getTreatmentRecommendation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_recommendations')
                                .select("\n        *,\n        patient:patient_id(id, email, raw_user_meta_data),\n        provider:provider_id(id, email, raw_user_meta_data)\n      ")
                                .eq('id', id)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            throw new Error("Failed to get treatment recommendation: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.approveRecommendation = function (id, approval) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_recommendations')
                                .update({
                                status: 'approved',
                                approved_by: approval.approved_by,
                                approved_at: new Date().toISOString(),
                            })
                                .eq('id', id)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to approve recommendation: ".concat(error.message));
                        return [2 /*return*/, data];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.rejectRecommendation = function (id, rejectedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_recommendations')
                                .update({
                                status: 'rejected',
                                approved_by: rejectedBy,
                                approved_at: new Date().toISOString(),
                            })
                                .eq('id', id)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to reject recommendation: ".concat(error.message));
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Feedback Management
    PersonalizedRecommendationService.prototype.createRecommendationFeedback = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, feedback, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('recommendation_feedback')
                                .insert({
                                recommendation_id: data.recommendation_id,
                                provider_id: data.provider_id,
                                feedback_type: data.feedback_type,
                                adoption_status: data.adoption_status,
                                quality_rating: data.quality_rating,
                                usefulness_rating: data.usefulness_rating,
                                accuracy_rating: data.accuracy_rating,
                                comments: data.comments,
                                improvement_suggestions: data.improvement_suggestions,
                                would_recommend: data.would_recommend,
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), feedback = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create recommendation feedback: ".concat(error.message));
                        return [2 /*return*/, feedback];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getRecommendationFeedback = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, queryBuilder, _a, data, count, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        queryBuilder = supabase
                            .from('recommendation_feedback')
                            .select('*', { count: 'exact' });
                        if (query.recommendation_id)
                            queryBuilder = queryBuilder.eq('recommendation_id', query.recommendation_id);
                        if (query.provider_id)
                            queryBuilder = queryBuilder.eq('provider_id', query.provider_id);
                        if (query.feedback_type)
                            queryBuilder = queryBuilder.eq('feedback_type', query.feedback_type);
                        if (query.adoption_status)
                            queryBuilder = queryBuilder.eq('adoption_status', query.adoption_status);
                        return [4 /*yield*/, queryBuilder
                                .order(query.sort_by, { ascending: query.sort_order === 'asc' })
                                .range(query.offset, query.offset + query.limit - 1)];
                    case 2:
                        _a = _b.sent(), data = _a.data, count = _a.count, error = _a.error;
                        if (error)
                            throw new Error("Failed to get recommendation feedback: ".concat(error.message));
                        return [2 /*return*/, {
                                feedback: (data || []),
                                total: count || 0,
                            }];
                }
            });
        });
    };
    // Personalization Factor Management
    PersonalizedRecommendationService.prototype.createPersonalizationFactor = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, factor, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('personalization_factors')
                                .insert({
                                patient_id: data.patient_id,
                                factor_type: data.factor_type,
                                factor_category: data.factor_category,
                                factor_value: data.factor_value,
                                weight: data.weight || 1.0,
                                source: data.source,
                                confidence_score: data.confidence_score || 0.5,
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), factor = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create personalization factor: ".concat(error.message));
                        return [2 /*return*/, factor];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getPersonalizationFactors = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('personalization_factors')
                                .select('*')
                                .eq('patient_id', patientId)
                                .order('created_at', { ascending: false })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to get personalization factors: ".concat(error.message));
                        return [2 /*return*/, (data || [])];
                }
            });
        });
    };
    // Safety Profile Management
    PersonalizedRecommendationService.prototype.createDefaultSafetyProfile = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('safety_profiles')
                                .insert({
                                patient_id: patientId,
                                allergies: [],
                                contraindications: [],
                                drug_interactions: [],
                                medical_conditions: [],
                                risk_factors: [],
                                safety_alerts: [],
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create safety profile: ".concat(error.message));
                        return [2 /*return*/, data];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getSafetyProfile = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('safety_profiles')
                                .select('*')
                                .eq('patient_id', patientId)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            throw new Error("Failed to get safety profile: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.updateSafetyProfile = function (patientId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('safety_profiles')
                                .update(__assign(__assign({}, updates), { last_reviewed: new Date().toISOString() }))
                                .eq('patient_id', patientId)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to update safety profile: ".concat(error.message));
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // Performance Tracking
    PersonalizedRecommendationService.prototype.recordRecommendationPerformance = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, performance, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('recommendation_performance')
                                .insert({
                                recommendation_id: data.recommendation_id,
                                patient_id: data.patient_id,
                                adoption_rate: data.adoption_rate,
                                effectiveness_score: data.effectiveness_score,
                                patient_satisfaction: data.patient_satisfaction,
                                provider_satisfaction: data.provider_satisfaction,
                                outcome_quality: data.outcome_quality,
                                time_to_adoption: data.time_to_adoption,
                                success_indicators: data.success_indicators,
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), performance = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to record recommendation performance: ".concat(error.message));
                        return [2 /*return*/, performance];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getRecommendationPerformance = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, queryBuilder, _a, data, count, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        queryBuilder = supabase
                            .from('recommendation_performance')
                            .select('*', { count: 'exact' });
                        if (query.recommendation_id)
                            queryBuilder = queryBuilder.eq('recommendation_id', query.recommendation_id);
                        if (query.patient_id)
                            queryBuilder = queryBuilder.eq('patient_id', query.patient_id);
                        if (query.date_from)
                            queryBuilder = queryBuilder.gte('measured_at', query.date_from);
                        if (query.date_to)
                            queryBuilder = queryBuilder.lte('measured_at', query.date_to);
                        if (query.min_adoption_rate)
                            queryBuilder = queryBuilder.gte('adoption_rate', query.min_adoption_rate);
                        if (query.min_effectiveness)
                            queryBuilder = queryBuilder.gte('effectiveness_score', query.min_effectiveness);
                        return [4 /*yield*/, queryBuilder
                                .order('measured_at', { ascending: false })
                                .range(query.offset, query.offset + query.limit - 1)];
                    case 2:
                        _a = _b.sent(), data = _a.data, count = _a.count, error = _a.error;
                        if (error)
                            throw new Error("Failed to get recommendation performance: ".concat(error.message));
                        return [2 /*return*/, {
                                performance: (data || []),
                                total: count || 0,
                            }];
                }
            });
        });
    };
    // Analytics and Insights
    PersonalizedRecommendationService.prototype.getRecommendationAnalytics = function (dateFrom, dateTo) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, recommendations, error, feedbackQuery, feedback, totalRecommendations, adoptedFeedback, adoptionRate, qualityRatings, usefulnessRatings, accuracyRatings, avgQuality, avgUsefulness, avgAccuracy;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('treatment_recommendations')
                            .select('*');
                        if (dateFrom)
                            query.gte('created_at', dateFrom);
                        if (dateTo)
                            query.lte('created_at', dateTo);
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), recommendations = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to get recommendation analytics: ".concat(error.message));
                        feedbackQuery = supabase
                            .from('recommendation_feedback')
                            .select('*');
                        if (dateFrom)
                            feedbackQuery.gte('created_at', dateFrom);
                        if (dateTo)
                            feedbackQuery.lte('created_at', dateTo);
                        return [4 /*yield*/, feedbackQuery];
                    case 3:
                        feedback = (_b.sent()).data;
                        totalRecommendations = (recommendations === null || recommendations === void 0 ? void 0 : recommendations.length) || 0;
                        adoptedFeedback = (feedback === null || feedback === void 0 ? void 0 : feedback.filter(function (f) { return f.adoption_status === 'adopted'; })) || [];
                        adoptionRate = totalRecommendations > 0 ? (adoptedFeedback.length / totalRecommendations) * 100 : 0;
                        qualityRatings = (feedback === null || feedback === void 0 ? void 0 : feedback.map(function (f) { return f.quality_rating; }).filter(function (r) { return r; })) || [];
                        usefulnessRatings = (feedback === null || feedback === void 0 ? void 0 : feedback.map(function (f) { return f.usefulness_rating; }).filter(function (r) { return r; })) || [];
                        accuracyRatings = (feedback === null || feedback === void 0 ? void 0 : feedback.map(function (f) { return f.accuracy_rating; }).filter(function (r) { return r; })) || [];
                        avgQuality = qualityRatings.length > 0 ? qualityRatings.reduce(function (sum, r) { return sum + r; }, 0) / qualityRatings.length : 0;
                        avgUsefulness = usefulnessRatings.length > 0 ? usefulnessRatings.reduce(function (sum, r) { return sum + r; }, 0) / usefulnessRatings.length : 0;
                        avgAccuracy = accuracyRatings.length > 0 ? accuracyRatings.reduce(function (sum, r) { return sum + r; }, 0) / accuracyRatings.length : 0;
                        return [2 /*return*/, {
                                total_recommendations: totalRecommendations,
                                adoption_rate: adoptionRate,
                                average_quality_rating: avgQuality,
                                average_usefulness_rating: avgUsefulness,
                                average_accuracy_rating: avgAccuracy,
                                most_recommended_treatments: [],
                                highest_success_rates: [],
                                user_acceptance_rate: adoptionRate,
                                performance_trends: [],
                            }];
                }
            });
        });
    };
    PersonalizedRecommendationService.prototype.getPersonalizationInsights = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, factorsQuery, factors, mostInfluential;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        factorsQuery = supabase
                            .from('personalization_factors')
                            .select('*');
                        if (patientId)
                            factorsQuery = factorsQuery.eq('patient_id', patientId);
                        return [4 /*yield*/, factorsQuery];
                    case 2:
                        factors = (_a.sent()).data;
                        mostInfluential = (factors || [])
                            .sort(function (a, b) { return (b.weight * b.confidence_score) - (a.weight * a.confidence_score); })
                            .slice(0, 10);
                        return [2 /*return*/, {
                                most_influential_factors: mostInfluential,
                                patient_preferences_distribution: {},
                                safety_profile_statistics: {},
                                customization_patterns: {},
                            }];
                }
            });
        });
    };
    return PersonalizedRecommendationService;
}());
exports.PersonalizedRecommendationService = PersonalizedRecommendationService;
// Export service instance
var createpersonalizedRecommendationsService = function () { return new PersonalizedRecommendationService(); };
exports.createpersonalizedRecommendationsService = createpersonalizedRecommendationsService;
