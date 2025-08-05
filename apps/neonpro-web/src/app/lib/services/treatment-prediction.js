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
exports.TreatmentPredictionService = void 0;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("@/lib/supabase/server");
var TreatmentPredictionService = /** @class */ (function () {
    // Supabase client created per method for proper request context
    function TreatmentPredictionService() {
        supabase = (0, server_2.createServerClient)();
    }
    // ==================== PREDICTION MODELS ====================
    TreatmentPredictionService.prototype.getModels = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('prediction_models')
                            .select('*')
                            .order('accuracy', { ascending: false });
                        if (filters) {
                            if (filters.status) {
                                query = query.eq('status', filters.status);
                            }
                            if (filters.algorithm_type) {
                                query = query.eq('algorithm_type', filters.algorithm_type);
                            }
                            if (filters.accuracy_min) {
                                query = query.gte('accuracy', filters.accuracy_min);
                            }
                            if (filters.version) {
                                query = query.eq('version', filters.version);
                            }
                            if (filters.created_from) {
                                query = query.gte('created_at', filters.created_from);
                            }
                            if (filters.created_to) {
                                query = query.lte('created_at', filters.created_to);
                            }
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.getActiveModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('prediction_models')
                                .select('*')
                                .eq('status', 'active')
                                .order('accuracy', { ascending: false })
                                .limit(1)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data || null];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.createModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('prediction_models')
                                .insert(model)
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
    TreatmentPredictionService.prototype.updateModel = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('prediction_models')
                                .update(updates)
                                .eq('id', id)
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
    // ==================== TREATMENT PREDICTIONS ====================
    TreatmentPredictionService.prototype.createPrediction = function (predictionData) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_predictions')
                                .insert(predictionData)
                                .select('*, prediction_models(name, version, accuracy)')
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
    TreatmentPredictionService.prototype.getPredictions = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('treatment_predictions')
                            .select("\n        *,\n        prediction_models(name, version, accuracy, algorithm_type),\n        patients(name, email)\n      ")
                            .order('prediction_date', { ascending: false });
                        if (filters) {
                            if (filters.patient_id) {
                                query = query.eq('patient_id', filters.patient_id);
                            }
                            if (filters.treatment_type) {
                                query = query.eq('treatment_type', filters.treatment_type);
                            }
                            if (filters.prediction_score_min) {
                                query = query.gte('prediction_score', filters.prediction_score_min);
                            }
                            if (filters.prediction_score_max) {
                                query = query.lte('prediction_score', filters.prediction_score_max);
                            }
                            if (filters.risk_assessment) {
                                query = query.eq('risk_assessment', filters.risk_assessment);
                            }
                            if (filters.date_from) {
                                query = query.gte('prediction_date', filters.date_from);
                            }
                            if (filters.date_to) {
                                query = query.lte('prediction_date', filters.date_to);
                            }
                            if (filters.model_id) {
                                query = query.eq('model_id', filters.model_id);
                            }
                            if (filters.outcome) {
                                query = query.eq('actual_outcome', filters.outcome);
                            }
                            if (filters.accuracy_validated !== undefined) {
                                query = query.eq('accuracy_validated', filters.accuracy_validated);
                            }
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.updatePredictionOutcome = function (id, outcome, outcomeDate) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_predictions')
                                .update({
                                actual_outcome: outcome,
                                outcome_date: outcomeDate,
                                accuracy_validated: true,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', id)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Update model performance after outcome validation
                        return [4 /*yield*/, this.updateModelPerformance(data.model_id)];
                    case 3:
                        // Update model performance after outcome validation
                        _b.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // ==================== PATIENT FACTORS ====================
    TreatmentPredictionService.prototype.getPatientFactors = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('patient_factors')
                                .select('*')
                                .eq('patient_id', patientId)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data || null];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.upsertPatientFactors = function (factors) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('patient_factors')
                                .upsert(factors, { onConflict: 'patient_id' })
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
    // ==================== TREATMENT CHARACTERISTICS ====================
    TreatmentPredictionService.prototype.getTreatmentCharacteristics = function (treatmentType) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('treatment_characteristics')
                            .select('*')
                            .order('treatment_type');
                        if (treatmentType) {
                            query = query.eq('treatment_type', treatmentType);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.createTreatmentCharacteristics = function (characteristics) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_characteristics')
                                .insert(characteristics)
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
    // ==================== PREDICTION ENGINE ====================
    TreatmentPredictionService.prototype.generatePrediction = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var model, patientFactors, treatmentChars, treatmentChar, features, predictionResult, prediction, recommendations, alternatives, _a, riskFactors;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getActiveModel()];
                    case 1:
                        model = _b.sent();
                        if (!model) {
                            throw new Error('No active prediction model available');
                        }
                        return [4 /*yield*/, this.getPatientFactors(request.patient_id)];
                    case 2:
                        patientFactors = _b.sent();
                        if (!patientFactors) {
                            throw new Error('Patient factors not found. Please complete patient assessment first.');
                        }
                        return [4 /*yield*/, this.getTreatmentCharacteristics(request.treatment_type)];
                    case 3:
                        treatmentChars = _b.sent();
                        treatmentChar = treatmentChars.find(function (t) { return t.treatment_type === request.treatment_type; });
                        if (!treatmentChar) {
                            throw new Error('Treatment characteristics not found for this treatment type');
                        }
                        return [4 /*yield*/, this.buildFeatureVector(patientFactors, treatmentChar)];
                    case 4:
                        features = _b.sent();
                        return [4 /*yield*/, this.runPredictionModel(model, features)];
                    case 5:
                        predictionResult = _b.sent();
                        return [4 /*yield*/, this.createPrediction({
                                patient_id: request.patient_id,
                                treatment_type: request.treatment_type,
                                prediction_score: predictionResult.score,
                                confidence_interval: predictionResult.confidence_interval,
                                risk_assessment: predictionResult.risk_assessment,
                                predicted_outcome: predictionResult.predicted_outcome,
                                model_id: model.id,
                                features_used: features,
                                explainability_data: predictionResult.explainability_data,
                                prediction_date: new Date().toISOString()
                            })];
                    case 6:
                        prediction = _b.sent();
                        return [4 /*yield*/, this.generateRecommendations(prediction, patientFactors, treatmentChar)];
                    case 7:
                        recommendations = _b.sent();
                        if (!request.include_alternatives) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.generateAlternativeTreatments(request.patient_id, request.treatment_type, features)];
                    case 8:
                        _a = _b.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        _a = [];
                        _b.label = 10;
                    case 10:
                        alternatives = _a;
                        return [4 /*yield*/, this.generateRiskFactors(features, predictionResult.explainability_data)];
                    case 11:
                        riskFactors = _b.sent();
                        return [2 /*return*/, {
                                prediction: prediction,
                                recommendations: recommendations,
                                alternative_treatments: alternatives,
                                risk_factors: riskFactors
                            }];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.generateBatchPredictions = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, predictions, _i, _a, predictionRequest, prediction, error_1, processingTime, summary;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        predictions = [];
                        _i = 0, _a = request.predictions;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        predictionRequest = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.generatePrediction(predictionRequest)];
                    case 3:
                        prediction = _b.sent();
                        predictions.push(prediction);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Error generating prediction for patient ".concat(predictionRequest.patient_id, ":"), error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        processingTime = Date.now() - startTime;
                        summary = request.include_summary ? this.generatePredictionSummary(predictions) : {
                            total_predictions: predictions.length,
                            high_success_probability: 0,
                            medium_success_probability: 0,
                            low_success_probability: 0,
                            average_confidence: 0,
                            recommendations_generated: 0
                        };
                        return [2 /*return*/, {
                                predictions: predictions,
                                summary: summary,
                                processing_time: processingTime
                            }];
                }
            });
        });
    };
    // ==================== ML MODEL OPERATIONS ====================
    TreatmentPredictionService.prototype.buildFeatureVector = function (patientFactors, treatmentChar) {
        return __awaiter(this, void 0, void 0, function () {
            var features;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return __generator(this, function (_o) {
                features = {
                    // Patient demographics
                    age: patientFactors.age,
                    gender: patientFactors.gender,
                    bmi: patientFactors.bmi || 25, // Default BMI if not provided
                    // Medical history factors
                    previous_treatments: ((_a = patientFactors.treatment_history) === null || _a === void 0 ? void 0 : _a.total_treatments) || 0,
                    success_rate_history: ((_b = patientFactors.treatment_history) === null || _b === void 0 ? void 0 : _b.success_rate) || 0.5,
                    medical_conditions: ((_c = patientFactors.medical_history) === null || _c === void 0 ? void 0 : _c.conditions) || [],
                    medications: ((_d = patientFactors.medical_history) === null || _d === void 0 ? void 0 : _d.medications) || [],
                    allergies: ((_e = patientFactors.medical_history) === null || _e === void 0 ? void 0 : _e.allergies) || [],
                    // Lifestyle factors
                    smoking_status: ((_f = patientFactors.lifestyle_factors) === null || _f === void 0 ? void 0 : _f.smoking) || 'never',
                    alcohol_consumption: ((_g = patientFactors.lifestyle_factors) === null || _g === void 0 ? void 0 : _g.alcohol) || 'none',
                    exercise_frequency: ((_h = patientFactors.lifestyle_factors) === null || _h === void 0 ? void 0 : _h.exercise) || 'none',
                    // Treatment-specific factors
                    treatment_complexity: treatmentChar.complexity_level,
                    provider_experience: 4, // Default provider experience level
                    clinic_success_rate: treatmentChar.success_rate_baseline || 0.85,
                    // Skin-specific factors
                    skin_type: patientFactors.skin_type,
                    skin_condition: patientFactors.skin_condition,
                    photosensitivity: false, // Default value
                    // Psychological factors
                    treatment_expectations: ((_j = patientFactors.psychological_factors) === null || _j === void 0 ? void 0 : _j.treatment_expectations) || 'realistic',
                    anxiety_level: ((_k = patientFactors.psychological_factors) === null || _k === void 0 ? void 0 : _k.anxiety_level) || 3,
                    compliance_history: patientFactors.compliance_score || 0.8,
                    // External factors
                    seasonal_factors: 'normal',
                    geographic_location: (_l = patientFactors.geographic_factors) === null || _l === void 0 ? void 0 : _l.location,
                    support_system: ((_m = patientFactors.social_factors) === null || _m === void 0 ? void 0 : _m.support_system) || 'moderate'
                };
                return [2 /*return*/, features];
            });
        });
    };
    TreatmentPredictionService.prototype.runPredictionModel = function (model, features) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, baseScore, confidence_interval, risk_assessment, predicted_outcome, explainability_data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        baseScore = model.accuracy;
                        // Adjust score based on features
                        // Age factor (optimal age range for most aesthetic treatments: 25-45)
                        if (features.age >= 25 && features.age <= 45) {
                            baseScore += 0.05;
                        }
                        else if (features.age > 60) {
                            baseScore -= 0.1;
                        }
                        // BMI factor
                        if (features.bmi && features.bmi >= 18.5 && features.bmi <= 25) {
                            baseScore += 0.03;
                        }
                        else if (features.bmi && features.bmi > 30) {
                            baseScore -= 0.08;
                        }
                        // Previous treatment success rate
                        baseScore += (features.success_rate_history - 0.5) * 0.2;
                        // Lifestyle factors
                        if (features.smoking_status === 'never') {
                            baseScore += 0.05;
                        }
                        else if (features.smoking_status === 'current') {
                            baseScore -= 0.15;
                        }
                        if (features.exercise_frequency === 'regular') {
                            baseScore += 0.03;
                        }
                        // Compliance history
                        baseScore += (features.compliance_history - 0.5) * 0.1;
                        // Treatment expectations
                        if (features.treatment_expectations === 'realistic') {
                            baseScore += 0.05;
                        }
                        else if (features.treatment_expectations === 'unrealistic') {
                            baseScore -= 0.1;
                        }
                        // Anxiety level (lower anxiety = better outcomes)
                        baseScore += (3 - features.anxiety_level) * 0.02;
                        // Support system
                        if (features.support_system === 'strong') {
                            baseScore += 0.03;
                        }
                        else if (features.support_system === 'weak') {
                            baseScore -= 0.05;
                        }
                        // Ensure score stays within bounds
                        baseScore = Math.max(0, Math.min(1, baseScore));
                        confidence_interval = {
                            lower: Math.max(0, baseScore - 0.1),
                            upper: Math.min(1, baseScore + 0.1),
                            confidence_level: 0.95
                        };
                        if (baseScore >= 0.8) {
                            risk_assessment = 'low';
                        }
                        else if (baseScore >= 0.6) {
                            risk_assessment = 'medium';
                        }
                        else {
                            risk_assessment = 'high';
                        }
                        if (baseScore >= 0.75) {
                            predicted_outcome = 'success';
                        }
                        else if (baseScore >= 0.5) {
                            predicted_outcome = 'partial_success';
                        }
                        else {
                            predicted_outcome = 'failure';
                        }
                        explainability_data = {
                            feature_importance: {
                                'age': features.age >= 25 && features.age <= 45 ? 0.1 : -0.05,
                                'bmi': features.bmi && features.bmi >= 18.5 && features.bmi <= 25 ? 0.08 : -0.05,
                                'smoking_status': features.smoking_status === 'never' ? 0.12 : -0.1,
                                'success_rate_history': features.success_rate_history * 0.15,
                                'compliance_history': features.compliance_history * 0.1,
                                'treatment_expectations': features.treatment_expectations === 'realistic' ? 0.08 : -0.05,
                                'support_system': features.support_system === 'strong' ? 0.06 : -0.03
                            },
                            top_positive_factors: [
                                'Non-smoker status',
                                'Realistic treatment expectations',
                                'Good compliance history',
                                'Strong support system'
                            ].filter(Boolean),
                            top_negative_factors: [
                                features.smoking_status === 'current' ? 'Current smoking' : null,
                                features.treatment_expectations === 'unrealistic' ? 'Unrealistic expectations' : null,
                                features.anxiety_level > 4 ? 'High anxiety level' : null,
                                features.support_system === 'weak' ? 'Weak support system' : null
                            ].filter(Boolean),
                            similar_cases: [], // Would be populated from database of similar cases
                            confidence_reasoning: "Prediction based on ".concat(Object.keys(features).length, " patient factors with ").concat((model.accuracy * 100).toFixed(1), "% model accuracy.")
                        };
                        return [2 /*return*/, {
                                score: baseScore,
                                confidence_interval: confidence_interval,
                                risk_assessment: risk_assessment,
                                predicted_outcome: predicted_outcome,
                                explainability_data: explainability_data
                            }];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.generateRecommendations = function (prediction, patientFactors, treatmentChar) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                recommendations = [];
                // Risk-based recommendations
                if (prediction.risk_assessment === 'high') {
                    recommendations.push({
                        type: 'preparation',
                        description: 'Comprehensive pre-treatment consultation and risk assessment recommended',
                        importance: 'critical',
                        evidence_level: 'clinical_trials'
                    });
                }
                // Smoking-related recommendations
                if (((_a = patientFactors.lifestyle_factors) === null || _a === void 0 ? void 0 : _a.smoking) === 'current') {
                    recommendations.push({
                        type: 'preparation',
                        description: 'Smoking cessation recommended 2-4 weeks before treatment for optimal outcomes',
                        importance: 'high',
                        evidence_level: 'clinical_trials'
                    });
                }
                // BMI-related recommendations
                if (patientFactors.bmi && patientFactors.bmi > 30) {
                    recommendations.push({
                        type: 'preparation',
                        description: 'Weight management consultation may improve treatment outcomes',
                        importance: 'medium',
                        evidence_level: 'case_studies'
                    });
                }
                // Anxiety management
                if (((_b = patientFactors.psychological_factors) === null || _b === void 0 ? void 0 : _b.anxiety_level) && patientFactors.psychological_factors.anxiety_level > 4) {
                    recommendations.push({
                        type: 'preparation',
                        description: 'Anxiety management techniques and relaxation therapy recommended',
                        importance: 'medium',
                        evidence_level: 'expert_opinion'
                    });
                }
                // Follow-up recommendations
                if (prediction.prediction_score < 0.7) {
                    recommendations.push({
                        type: 'monitoring',
                        description: 'Enhanced follow-up schedule recommended for optimal outcome monitoring',
                        importance: 'high',
                        evidence_level: 'clinical_trials'
                    });
                }
                // Expectation management
                if (((_c = patientFactors.psychological_factors) === null || _c === void 0 ? void 0 : _c.treatment_expectations) === 'unrealistic') {
                    recommendations.push({
                        type: 'preparation',
                        description: 'Detailed expectation management and realistic outcome discussion',
                        importance: 'high',
                        evidence_level: 'expert_opinion'
                    });
                }
                return [2 /*return*/, recommendations];
            });
        });
    };
    TreatmentPredictionService.prototype.generateAlternativeTreatments = function (patientId, currentTreatment, features) {
        return __awaiter(this, void 0, void 0, function () {
            var allTreatments, alternatives, alternativeTreatments, _i, _a, treatment, altRequest, altPrediction, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getTreatmentCharacteristics()];
                    case 1:
                        allTreatments = _b.sent();
                        alternatives = allTreatments.filter(function (t) { return t.treatment_type !== currentTreatment; });
                        alternativeTreatments = [];
                        _i = 0, _a = alternatives.slice(0, 3);
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        treatment = _a[_i];
                        altRequest = {
                            patient_id: patientId,
                            treatment_type: treatment.treatment_type
                        };
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.generatePrediction(altRequest)];
                    case 4:
                        altPrediction = _b.sent();
                        alternativeTreatments.push({
                            treatment_type: treatment.treatment_type,
                            prediction_score: altPrediction.prediction.prediction_score,
                            advantages: this.getTreatmentAdvantages(treatment),
                            disadvantages: this.getTreatmentDisadvantages(treatment),
                            suitability_score: altPrediction.prediction.prediction_score
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _b.sent();
                        console.error("Error generating alternative prediction for ".concat(treatment.treatment_type, ":"), error_2);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, alternativeTreatments.sort(function (a, b) { return b.prediction_score - a.prediction_score; })];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.getTreatmentAdvantages = function (treatment) {
        var advantages = [];
        if (treatment.invasiveness_level <= 2) {
            advantages.push('Non-invasive procedure');
        }
        if (treatment.recovery_time_days && treatment.recovery_time_days <= 3) {
            advantages.push('Minimal downtime');
        }
        if (treatment.success_rate_baseline && treatment.success_rate_baseline >= 0.9) {
            advantages.push('High success rate');
        }
        if (treatment.complexity_level <= 2) {
            advantages.push('Simple procedure');
        }
        return advantages;
    };
    TreatmentPredictionService.prototype.getTreatmentDisadvantages = function (treatment) {
        var disadvantages = [];
        if (treatment.invasiveness_level >= 4) {
            disadvantages.push('Invasive procedure');
        }
        if (treatment.recovery_time_days && treatment.recovery_time_days > 7) {
            disadvantages.push('Extended recovery time');
        }
        if (treatment.session_count && treatment.session_count > 6) {
            disadvantages.push('Multiple sessions required');
        }
        if (treatment.complexity_level >= 4) {
            disadvantages.push('Complex procedure');
        }
        return disadvantages;
    };
    TreatmentPredictionService.prototype.generateRiskFactors = function (features, explainability) {
        return __awaiter(this, void 0, void 0, function () {
            var riskFactors, _i, _a, _b, factor, impact;
            return __generator(this, function (_c) {
                riskFactors = [];
                // Add risk factors based on feature importance
                for (_i = 0, _a = Object.entries(explainability.feature_importance); _i < _a.length; _i++) {
                    _b = _a[_i], factor = _b[0], impact = _b[1];
                    if (Math.abs(impact) > 0.05) { // Only significant factors
                        riskFactors.push({
                            factor: this.humanReadableFactor(factor),
                            impact: impact,
                            modifiable: this.isModifiableFactor(factor),
                            recommendation: this.getFactorRecommendation(factor, impact)
                        });
                    }
                }
                return [2 /*return*/, riskFactors.sort(function (a, b) { return Math.abs(b.impact) - Math.abs(a.impact); })];
            });
        });
    };
    TreatmentPredictionService.prototype.humanReadableFactor = function (factor) {
        var factorMap = {
            'age': 'Patient Age',
            'bmi': 'Body Mass Index',
            'smoking_status': 'Smoking Status',
            'success_rate_history': 'Previous Treatment Success Rate',
            'compliance_history': 'Treatment Compliance History',
            'treatment_expectations': 'Treatment Expectations',
            'support_system': 'Social Support System',
            'anxiety_level': 'Anxiety Level',
            'exercise_frequency': 'Exercise Frequency'
        };
        return factorMap[factor] || factor;
    };
    TreatmentPredictionService.prototype.isModifiableFactor = function (factor) {
        var modifiableFactors = [
            'smoking_status', 'bmi', 'exercise_frequency', 'anxiety_level',
            'treatment_expectations', 'compliance_history'
        ];
        return modifiableFactors.includes(factor);
    };
    TreatmentPredictionService.prototype.getFactorRecommendation = function (factor, impact) {
        if (!this.isModifiableFactor(factor))
            return undefined;
        var recommendations = {
            'smoking_status': 'Consider smoking cessation program before treatment',
            'bmi': 'Maintain healthy weight through diet and exercise',
            'exercise_frequency': 'Increase physical activity for better outcomes',
            'anxiety_level': 'Consider stress management techniques or counseling',
            'treatment_expectations': 'Discuss realistic treatment outcomes with provider',
            'compliance_history': 'Follow all pre and post-treatment instructions carefully'
        };
        return impact < 0 ? recommendations[factor] : undefined;
    };
    TreatmentPredictionService.prototype.generatePredictionSummary = function (predictions) {
        var total = predictions.length;
        var highSuccess = predictions.filter(function (p) { return p.prediction.prediction_score >= 0.8; }).length;
        var mediumSuccess = predictions.filter(function (p) { return p.prediction.prediction_score >= 0.6 && p.prediction.prediction_score < 0.8; }).length;
        var lowSuccess = predictions.filter(function (p) { return p.prediction.prediction_score < 0.6; }).length;
        var avgConfidence = predictions.reduce(function (sum, p) { return sum + p.prediction.prediction_score; }, 0) / total;
        var totalRecommendations = predictions.reduce(function (sum, p) { return sum + p.recommendations.length; }, 0);
        return {
            total_predictions: total,
            high_success_probability: highSuccess,
            medium_success_probability: mediumSuccess,
            low_success_probability: lowSuccess,
            average_confidence: avgConfidence,
            recommendations_generated: totalRecommendations
        };
    };
    // ==================== MODEL PERFORMANCE ====================
    TreatmentPredictionService.prototype.getModelPerformance = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('model_performance')
                            .select('*, prediction_models(name, version)')
                            .order('evaluation_date', { ascending: false });
                        if (filters) {
                            if (filters.model_id) {
                                query = query.eq('model_id', filters.model_id);
                            }
                            if (filters.accuracy_min) {
                                query = query.gte('accuracy', filters.accuracy_min);
                            }
                            if (filters.evaluation_date_from) {
                                query = query.gte('evaluation_date', filters.evaluation_date_from);
                            }
                            if (filters.evaluation_date_to) {
                                query = query.lte('evaluation_date', filters.evaluation_date_to);
                            }
                            if (filters.improvement_percentage_min) {
                                query = query.gte('improvement_percentage', filters.improvement_percentage_min);
                            }
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.updateModelPerformance = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, predictions, error, correctPredictions, accuracy, _b, performanceData, perfError;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _c.sent();
                        return [4 /*yield*/, supabase
                                .from('treatment_predictions')
                                .select('prediction_score, predicted_outcome, actual_outcome')
                                .eq('model_id', modelId)
                                .eq('accuracy_validated', true)];
                    case 2:
                        _a = _c.sent(), predictions = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!(predictions && predictions.length > 0)) return [3 /*break*/, 4];
                        correctPredictions = predictions.filter(function (p) {
                            // Define success threshold for predictions
                            var successThreshold = 0.7;
                            var predictedSuccess = p.prediction_score >= successThreshold;
                            var actualSuccess = p.actual_outcome === 'success';
                            return predictedSuccess === actualSuccess;
                        }).length;
                        accuracy = correctPredictions / predictions.length;
                        return [4 /*yield*/, supabase
                                .from('model_performance')
                                .insert({
                                model_id: modelId,
                                accuracy: accuracy,
                                predictions_count: predictions.length,
                                correct_predictions: correctPredictions,
                                evaluation_date: new Date().toISOString()
                            })
                                .select()
                                .single()];
                    case 3:
                        _b = _c.sent(), performanceData = _b.data, perfError = _b.error;
                        if (perfError)
                            throw perfError;
                        return [2 /*return*/, performanceData];
                    case 4: return [2 /*return*/, null];
                }
            });
        });
    };
    // ==================== PREDICTION FEEDBACK ====================
    TreatmentPredictionService.prototype.createFeedback = function (feedback) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('prediction_feedback')
                                .insert(feedback)
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
    TreatmentPredictionService.prototype.getFeedback = function (predictionId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('prediction_feedback')
                            .select('*, treatment_predictions(treatment_type, prediction_score)')
                            .order('created_at', { ascending: false });
                        if (predictionId) {
                            query = query.eq('prediction_id', predictionId);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    // ==================== MODEL TRAINING ====================
    TreatmentPredictionService.prototype.startModelTraining = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var newModel;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.createModel({
                            name: request.model_name,
                            version: '1.0',
                            algorithm_type: request.algorithm_type,
                            accuracy: 0, // Will be updated after training
                            status: 'training',
                            training_data_size: 0,
                            feature_count: ((_a = request.feature_selection) === null || _a === void 0 ? void 0 : _a.length) || 0
                        })];
                    case 1:
                        newModel = _b.sent();
                        // In production, this would trigger actual ML training
                        // For now, simulate training completion
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.updateModel(newModel.id, {
                                                status: 'active',
                                                accuracy: 0.87, // Simulated training result
                                                training_data_size: 5000,
                                                performance_metrics: {
                                                    precision: 0.89,
                                                    recall: 0.85,
                                                    f1_score: 0.87,
                                                    auc_roc: 0.92,
                                                    training_accuracy: 0.91,
                                                    validation_accuracy: 0.87,
                                                    cross_validation_mean: 0.86,
                                                    cross_validation_std: 0.02
                                                }
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_3 = _a.sent();
                                        console.error('Error updating model after training:', error_3);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, 60000); // Simulate 1 minute training time
                        return [2 /*return*/, {
                                model_id: newModel.id,
                                training_status: 'started',
                                estimated_completion: new Date(Date.now() + 60000).toISOString(),
                                progress_percentage: 0
                            }];
                }
            });
        });
    };
    // ==================== ANALYTICS & REPORTING ====================
    TreatmentPredictionService.prototype.getPredictionAnalytics = function (dateFrom, dateTo) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, query, _a, data, error, analytics;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        query = supabase
                            .from('treatment_predictions')
                            .select("\n        prediction_score,\n        risk_assessment,\n        predicted_outcome,\n        actual_outcome,\n        treatment_type,\n        prediction_date,\n        accuracy_validated\n      ");
                        if (dateFrom) {
                            query = query.gte('prediction_date', dateFrom);
                        }
                        if (dateTo) {
                            query = query.lte('prediction_date', dateTo);
                        }
                        return [4 /*yield*/, query];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        analytics = {
                            total_predictions: data.length,
                            validated_predictions: data.filter(function (p) { return p.accuracy_validated; }).length,
                            average_prediction_score: data.reduce(function (sum, p) { return sum + p.prediction_score; }, 0) / data.length,
                            risk_distribution: {
                                low: data.filter(function (p) { return p.risk_assessment === 'low'; }).length,
                                medium: data.filter(function (p) { return p.risk_assessment === 'medium'; }).length,
                                high: data.filter(function (p) { return p.risk_assessment === 'high'; }).length
                            },
                            outcome_distribution: {
                                success: data.filter(function (p) { return p.predicted_outcome === 'success'; }).length,
                                partial_success: data.filter(function (p) { return p.predicted_outcome === 'partial_success'; }).length,
                                failure: data.filter(function (p) { return p.predicted_outcome === 'failure'; }).length
                            },
                            treatment_type_distribution: data.reduce(function (acc, p) {
                                acc[p.treatment_type] = (acc[p.treatment_type] || 0) + 1;
                                return acc;
                            }, {}),
                            model_accuracy: this.calculateOverallAccuracy(data.filter(function (p) { return p.accuracy_validated; }))
                        };
                        return [2 /*return*/, analytics];
                }
            });
        });
    };
    TreatmentPredictionService.prototype.calculateOverallAccuracy = function (validatedPredictions) {
        if (validatedPredictions.length === 0)
            return 0;
        var correctPredictions = validatedPredictions.filter(function (p) {
            var successThreshold = 0.7;
            var predictedSuccess = p.prediction_score >= successThreshold;
            var actualSuccess = p.actual_outcome === 'success';
            return predictedSuccess === actualSuccess;
        }).length;
        return correctPredictions / validatedPredictions.length;
    };
    return TreatmentPredictionService;
}());
exports.TreatmentPredictionService = TreatmentPredictionService;
