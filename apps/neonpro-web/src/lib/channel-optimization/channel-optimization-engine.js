"use strict";
/**
 * Channel Optimization Engine
 * NeonPro - Sistema inteligente de otimização de canais de comunicação
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
exports.createchannelOptimizationEngine = exports.ChannelOptimizationEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var ChannelOptimizationEngine = /** @class */ (function () {
    function ChannelOptimizationEngine() {
        this.cache = new Map();
        this.profiles = new Map();
        this.config = null;
        this.learningData = new Map();
        this.supabase = (0, client_1.createClient)();
        this.initializeEngine();
    }
    /**
     * ====================================================================
     * INITIALIZATION & CONFIGURATION
     * ====================================================================
     */
    ChannelOptimizationEngine.prototype.initializeEngine = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.loadConfiguration()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.initializeDefaultProfiles()];
                    case 2:
                        _a.sent();
                        this.startPeriodicOptimization();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error initializing Channel Optimization Engine:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ChannelOptimizationEngine.prototype.loadConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.supabase
                                .from('channel_optimization_config')
                                .select('*')
                                .single()];
                    case 1:
                        data = (_a.sent()).data;
                        if (!data) return [3 /*break*/, 2];
                        this.config = this.mapConfigFromDB(data);
                        return [3 /*break*/, 4];
                    case 2:
                        this.config = this.getDefaultConfig();
                        return [4 /*yield*/, this.saveConfiguration()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        console.error('Error loading configuration:', error_2);
                        this.config = this.getDefaultConfig();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ChannelOptimizationEngine.prototype.getDefaultConfig = function () {
        return {
            clinicId: '',
            globalSettings: {
                enabled: true,
                defaultStrategy: 'effectiveness',
                learningEnabled: true,
                adaptationRate: 0.1,
                confidenceThreshold: 0.7,
                fallbackChannels: ['email', 'sms'],
                maxChannelsPerCommunication: 2,
                optimizationFrequency: 'realtime'
            },
            channelSettings: {
                email: {
                    enabled: true,
                    priority: 1,
                    costModel: {
                        type: 'per_message',
                        baseCost: 0.05,
                        volumeDiscounts: [
                            { threshold: 1000, discount: 10 },
                            { threshold: 5000, discount: 20 }
                        ],
                        additionalCosts: []
                    },
                    constraints: {
                        maxDaily: 3,
                        maxWeekly: 15,
                        maxMonthly: 50,
                        cooldownPeriod: 240,
                        blackoutPeriods: [],
                        requiresConsent: true
                    },
                    adaptations: [],
                    qualityThresholds: {
                        minEffectiveness: 15,
                        minSatisfaction: 7,
                        maxComplaints: 2,
                        minCompliance: 95
                    }
                },
                sms: {
                    enabled: true,
                    priority: 2,
                    costModel: {
                        type: 'per_message',
                        baseCost: 0.15,
                        volumeDiscounts: [
                            { threshold: 500, discount: 8 },
                            { threshold: 2000, discount: 15 }
                        ],
                        additionalCosts: []
                    },
                    constraints: {
                        maxDaily: 2,
                        maxWeekly: 8,
                        maxMonthly: 25,
                        cooldownPeriod: 480,
                        blackoutPeriods: [{
                                startHour: 22, startMinute: 0,
                                endHour: 8, endMinute: 0,
                                timezone: 'America/Sao_Paulo'
                            }],
                        requiresConsent: true
                    },
                    adaptations: [],
                    qualityThresholds: {
                        minEffectiveness: 25,
                        minSatisfaction: 7,
                        maxComplaints: 1,
                        minCompliance: 98
                    }
                },
                whatsapp: {
                    enabled: true,
                    priority: 3,
                    costModel: {
                        type: 'per_message',
                        baseCost: 0.08,
                        volumeDiscounts: [
                            { threshold: 1000, discount: 12 },
                            { threshold: 3000, discount: 22 }
                        ],
                        additionalCosts: []
                    },
                    constraints: {
                        maxDaily: 2,
                        maxWeekly: 10,
                        maxMonthly: 30,
                        cooldownPeriod: 360,
                        blackoutPeriods: [{
                                startHour: 21, startMinute: 0,
                                endHour: 9, endMinute: 0,
                                timezone: 'America/Sao_Paulo'
                            }],
                        requiresConsent: true
                    },
                    adaptations: [],
                    qualityThresholds: {
                        minEffectiveness: 30,
                        minSatisfaction: 8,
                        maxComplaints: 1,
                        minCompliance: 98
                    }
                },
                push: {
                    enabled: true,
                    priority: 4,
                    costModel: {
                        type: 'per_message',
                        baseCost: 0.02,
                        volumeDiscounts: [
                            { threshold: 2000, discount: 15 },
                            { threshold: 10000, discount: 30 }
                        ],
                        additionalCosts: []
                    },
                    constraints: {
                        maxDaily: 3,
                        maxWeekly: 12,
                        maxMonthly: 40,
                        cooldownPeriod: 120,
                        blackoutPeriods: [{
                                startHour: 23, startMinute: 0,
                                endHour: 7, endMinute: 0,
                                timezone: 'America/Sao_Paulo'
                            }],
                        requiresConsent: false
                    },
                    adaptations: [],
                    qualityThresholds: {
                        minEffectiveness: 10,
                        minSatisfaction: 6,
                        maxComplaints: 3,
                        minCompliance: 90
                    }
                },
                voice: {
                    enabled: false,
                    priority: 5,
                    costModel: {
                        type: 'per_minute',
                        baseCost: 0.30,
                        volumeDiscounts: [],
                        additionalCosts: []
                    },
                    constraints: {
                        maxDaily: 1,
                        maxWeekly: 3,
                        maxMonthly: 10,
                        cooldownPeriod: 1440,
                        blackoutPeriods: [{
                                startHour: 20, startMinute: 0,
                                endHour: 9, endMinute: 0,
                                timezone: 'America/Sao_Paulo'
                            }],
                        requiresConsent: true
                    },
                    adaptations: [],
                    qualityThresholds: {
                        minEffectiveness: 40,
                        minSatisfaction: 8,
                        maxComplaints: 0,
                        minCompliance: 100
                    }
                },
                video: {
                    enabled: false,
                    priority: 6,
                    costModel: {
                        type: 'per_minute',
                        baseCost: 0.50,
                        volumeDiscounts: [],
                        additionalCosts: []
                    },
                    constraints: {
                        maxDaily: 1,
                        maxWeekly: 2,
                        maxMonthly: 5,
                        cooldownPeriod: 2880,
                        blackoutPeriods: [{
                                startHour: 19, startMinute: 0,
                                endHour: 10, endMinute: 0,
                                timezone: 'America/Sao_Paulo'
                            }],
                        requiresConsent: true
                    },
                    adaptations: [],
                    qualityThresholds: {
                        minEffectiveness: 50,
                        minSatisfaction: 9,
                        maxComplaints: 0,
                        minCompliance: 100
                    }
                }
            },
            contentSettings: {
                personalizationLevel: 'moderate',
                adaptationEnabled: true,
                a11yRequired: true,
                languageAdaptation: true,
                toneAdaptation: true,
                lengthOptimization: true
            },
            complianceSettings: {
                strictMode: true,
                requiredConsents: ['treatment', 'communication'],
                auditingEnabled: true,
                dataRetention: {
                    defaultPeriod: 2555, // 7 years
                    byDataType: {
                        'analytics': 1095, // 3 years
                        'communications': 2555, // 7 years
                        'preferences': 1825 // 5 years
                    },
                    autoDelete: true,
                    archivingEnabled: true
                },
                privacySettings: {
                    anonymizeAnalytics: true,
                    encryptPersonalData: true,
                    minimizeDataCollection: true,
                    respectDoNotContact: true
                }
            }
        };
    };
    /**
     * ====================================================================
     * CHANNEL OPTIMIZATION
     * ====================================================================
     */
    /**
     * Principal método de otimização de canais
     */
    ChannelOptimizationEngine.prototype.optimizeChannels = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, patientProfile, context, recommendations, alternativeChannels, reasoning, estimatedEffectiveness, estimatedCost, complianceValidation, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        requestId = this.generateId();
                        return [4 /*yield*/, this.getOrCreatePatientProfile(request.patientId, request.clinicId)];
                    case 1:
                        patientProfile = _a.sent();
                        return [4 /*yield*/, this.analyzeContext(request, patientProfile)];
                    case 2:
                        context = _a.sent();
                        return [4 /*yield*/, this.generateChannelRecommendations(request, patientProfile, context)];
                    case 3:
                        recommendations = _a.sent();
                        return [4 /*yield*/, this.identifyAlternativeChannels(recommendations, request, patientProfile)];
                    case 4:
                        alternativeChannels = _a.sent();
                        reasoning = this.generateOptimizationReasoning(recommendations, context, patientProfile);
                        return [4 /*yield*/, this.estimateEffectiveness(recommendations, patientProfile, context)];
                    case 5:
                        estimatedEffectiveness = _a.sent();
                        estimatedCost = this.calculateCosts(recommendations, request);
                        return [4 /*yield*/, this.validateCompliance(recommendations, request, patientProfile)];
                    case 6:
                        complianceValidation = _a.sent();
                        result = {
                            requestId: requestId,
                            patientId: request.patientId,
                            recommendations: recommendations,
                            alternativeChannels: alternativeChannels,
                            reasoning: reasoning,
                            confidence: this.calculateOverallConfidence(recommendations),
                            estimatedEffectiveness: estimatedEffectiveness,
                            estimatedCost: estimatedCost,
                            complianceValidation: complianceValidation,
                            generatedAt: new Date()
                        };
                        // Salvar resultado para learning
                        return [4 /*yield*/, this.saveOptimizationResult(result)];
                    case 7:
                        // Salvar resultado para learning
                        _a.sent();
                        return [2 /*return*/, result];
                    case 8:
                        error_3 = _a.sent();
                        console.error('Error optimizing channels:', error_3);
                        throw error_3;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Carregar ou criar perfil de canal do paciente
     */
    ChannelOptimizationEngine.prototype.getOrCreatePatientProfile = function (patientId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, existingProfile, profile, error_4, newProfile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(clinicId, "-").concat(patientId);
                        if (this.profiles.has(cacheKey)) {
                            return [2 /*return*/, this.profiles.get(cacheKey)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('patient_channel_profiles')
                                .select("\n          *,\n          channel_preferences(*),\n          channel_behaviors(*),\n          device_profiles(*),\n          accessibility_needs(*)\n        ")
                                .eq('patient_id', patientId)
                                .eq('clinic_id', clinicId)
                                .single()];
                    case 2:
                        existingProfile = (_a.sent()).data;
                        if (existingProfile) {
                            profile = this.mapProfileFromDB(existingProfile);
                            this.profiles.set(cacheKey, profile);
                            return [2 /*return*/, profile];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error loading existing profile:', error_4);
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.createNewPatientProfile(patientId, clinicId)];
                    case 5:
                        newProfile = _a.sent();
                        this.profiles.set(cacheKey, newProfile);
                        return [2 /*return*/, newProfile];
                }
            });
        });
    };
    /**
     * Criar novo perfil de paciente
     */
    ChannelOptimizationEngine.prototype.createNewPatientProfile = function (patientId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, communications, behaviors, preferences, devices, accessibility, demographics, profile, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .select('*')
                                .eq('id', patientId)
                                .single()];
                    case 1:
                        patient = (_a.sent()).data;
                        if (!patient) {
                            throw new Error("Patient ".concat(patientId, " not found"));
                        }
                        return [4 /*yield*/, this.supabase
                                .from('communications_log')
                                .select("\n          *,\n          communication_events(*)\n        ")
                                .eq('patient_id', patientId)
                                .eq('clinic_id', clinicId)
                                .order('sent_at', { ascending: false })
                                .limit(100)];
                    case 2:
                        communications = (_a.sent()).data;
                        behaviors = this.analyzeCommunicationBehaviors(communications || []);
                        preferences = this.inferInitialPreferences(patient, behaviors);
                        devices = this.detectDevices(communications || []);
                        accessibility = this.assessAccessibilityNeeds(patient);
                        demographics = this.createDemographics(patient);
                        profile = {
                            patientId: patientId,
                            clinicId: clinicId,
                            preferences: preferences,
                            behaviors: behaviors,
                            demographics: demographics,
                            devices: devices,
                            accessibility: accessibility,
                            createdAt: new Date(),
                            lastUpdated: new Date()
                        };
                        // Salvar perfil no banco
                        return [4 /*yield*/, this.savePatientProfile(profile)];
                    case 3:
                        // Salvar perfil no banco
                        _a.sent();
                        return [2 /*return*/, profile];
                    case 4:
                        error_5 = _a.sent();
                        console.error('Error creating patient profile:', error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analisar contexto da comunicação
     */
    ChannelOptimizationEngine.prototype.analyzeContext = function (request, profile) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            purpose: request.purpose,
                            urgency: request.urgency,
                            contentComplexity: request.content.complexity,
                            timeConstraints: request.constraints.timeConstraints,
                            patientSegment: this.classifyPatientSegment(profile)
                        };
                        return [4 /*yield*/, this.getRecentEngagement(request.patientId)];
                    case 1:
                        _a.recentEngagement = _b.sent(),
                            _a.deviceContext = this.analyzeDeviceContext(profile.devices);
                        return [4 /*yield*/, this.getCommunicationHistory(request.patientId, request.purpose)];
                    case 2: return [2 /*return*/, (_a.communicationHistory = _b.sent(),
                            _a)];
                }
            });
        });
    };
    /**
     * Gerar recomendações de canal
     */
    ChannelOptimizationEngine.prototype.generateChannelRecommendations = function (request, profile, context) {
        return __awaiter(this, void 0, void 0, function () {
            var recommendations, _i, _a, channel, recommendation, maxChannels;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        recommendations = [];
                        _i = 0, _a = this.getAvailableChannels();
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        channel = _a[_i];
                        if (!((_c = (_b = this.config) === null || _b === void 0 ? void 0 : _b.channelSettings[channel]) === null || _c === void 0 ? void 0 : _c.enabled))
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.evaluateChannel(channel, request, profile, context)];
                    case 2:
                        recommendation = _e.sent();
                        if (recommendation) {
                            recommendations.push(recommendation);
                        }
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // Ordenar por prioridade
                        recommendations.sort(function (a, b) { return a.priority - b.priority; });
                        maxChannels = ((_d = this.config) === null || _d === void 0 ? void 0 : _d.globalSettings.maxChannelsPerCommunication) || 2;
                        return [2 /*return*/, recommendations.slice(0, maxChannels)];
                }
            });
        });
    };
    /**
     * Avaliar um canal específico
     */
    ChannelOptimizationEngine.prototype.evaluateChannel = function (channel, request, profile, context) {
        return __awaiter(this, void 0, void 0, function () {
            var preference, behavior, confidence, adaptations, timing, expectedOutcome, reasoning, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        preference = profile.preferences.find(function (p) { return p.channel === channel; });
                        if (preference && preference.preference < 0.2) {
                            return [2 /*return*/, null]; // Canal evitado pelo paciente
                        }
                        // Verificar constraints
                        if (!this.meetsConstraints(channel, request, profile)) {
                            return [2 /*return*/, null];
                        }
                        behavior = profile.behaviors.find(function (b) { return b.channel === channel; });
                        confidence = this.calculateChannelConfidence(channel, preference, behavior, context);
                        return [4 /*yield*/, this.determineContentAdaptations(channel, request, profile)];
                    case 1:
                        adaptations = _a.sent();
                        return [4 /*yield*/, this.calculateRecommendedTiming(channel, profile, request.urgency)];
                    case 2:
                        timing = _a.sent();
                        expectedOutcome = this.estimateChannelOutcome(channel, behavior, context);
                        reasoning = this.generateChannelReasoning(channel, preference, behavior, context, adaptations);
                        return [2 /*return*/, {
                                channel: channel,
                                priority: this.calculateChannelPriority(channel, confidence, preference),
                                confidence: confidence,
                                reasoning: reasoning,
                                adaptations: adaptations,
                                timing: timing,
                                expectedOutcome: expectedOutcome
                            }];
                    case 3:
                        error_6 = _a.sent();
                        console.error("Error evaluating channel ".concat(channel, ":"), error_6);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ====================================================================
     * LEARNING & ADAPTATION
     * ====================================================================
     */
    /**
     * Aprender com resultado real de comunicação
     */
    ChannelOptimizationEngine.prototype.learnFromOutcome = function (communicationId, prediction, actualOutcome) {
        return __awaiter(this, void 0, void 0, function () {
            var predictionAccuracy, factors, improvements, confidence, feedback, learningData, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        predictionAccuracy = this.calculatePredictionAccuracy(prediction.expectedOutcome, actualOutcome);
                        factors = this.analyzeFeedbackFactors(prediction, actualOutcome);
                        improvements = this.generateImprovements(factors, predictionAccuracy);
                        confidence = this.calculateFeedbackConfidence(actualOutcome);
                        feedback = {
                            predictionAccuracy: predictionAccuracy,
                            factors: factors,
                            improvements: improvements,
                            confidence: confidence
                        };
                        learningData = {
                            patientId: prediction.channel, // Temporário, deveria vir do contexto
                            communicationId: communicationId,
                            prediction: prediction,
                            actualOutcome: actualOutcome,
                            feedback: feedback,
                            confidence: confidence,
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, this.saveLearningData(learningData)];
                    case 1:
                        _a.sent();
                        if (!(predictionAccuracy > 0.7)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updatePredictionModels(learningData)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, feedback];
                    case 4:
                        error_7 = _a.sent();
                        console.error('Error learning from outcome:', error_7);
                        throw error_7;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Atualizar perfil do paciente baseado em novo comportamento
     */
    ChannelOptimizationEngine.prototype.updatePatientProfile = function (patientId, clinicId, newBehavior) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, existingBehaviorIndex, cacheKey, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getOrCreatePatientProfile(patientId, clinicId)];
                    case 1:
                        profile = _a.sent();
                        // Atualizar comportamentos
                        if (newBehavior.channel) {
                            existingBehaviorIndex = profile.behaviors.findIndex(function (b) { return b.channel === newBehavior.channel; });
                            if (existingBehaviorIndex >= 0) {
                                // Atualizar comportamento existente
                                profile.behaviors[existingBehaviorIndex] = __assign(__assign({}, profile.behaviors[existingBehaviorIndex]), newBehavior);
                            }
                            else {
                                // Adicionar novo comportamento
                                profile.behaviors.push(newBehavior);
                            }
                        }
                        // Recalcular preferências baseado nos novos comportamentos
                        profile.preferences = this.recalculatePreferences(profile.behaviors);
                        // Atualizar timestamp
                        profile.lastUpdated = new Date();
                        // Salvar perfil atualizado
                        return [4 /*yield*/, this.savePatientProfile(profile)];
                    case 2:
                        // Salvar perfil atualizado
                        _a.sent();
                        cacheKey = "".concat(clinicId, "-").concat(patientId);
                        this.profiles.set(cacheKey, profile);
                        return [2 /*return*/, profile];
                    case 3:
                        error_8 = _a.sent();
                        console.error('Error updating patient profile:', error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ====================================================================
     * ANALYTICS & REPORTING
     * ====================================================================
     */
    /**
     * Gerar analytics de canal para uma clínica
     */
    ChannelOptimizationEngine.prototype.generateChannelAnalytics = function (clinicId_1, period_1) {
        return __awaiter(this, arguments, void 0, function (clinicId, period, granularity) {
            var communications, channelMetrics, optimizationMetrics, insights, recommendations, error_9;
            if (granularity === void 0) { granularity = 'day'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('communications_log')
                                .select("\n          *,\n          communication_events(*),\n          send_time_optimization(*)\n        ")
                                .eq('clinic_id', clinicId)
                                .gte('sent_at', period.start.toISOString())
                                .lte('sent_at', period.end.toISOString())];
                    case 1:
                        communications = (_a.sent()).data;
                        if (!(communications === null || communications === void 0 ? void 0 : communications.length)) {
                            return [2 /*return*/, this.getEmptyAnalytics(period, granularity)];
                        }
                        channelMetrics = this.calculateChannelMetrics(communications);
                        optimizationMetrics = this.calculateOptimizationMetrics(communications);
                        insights = this.generateChannelInsights(channelMetrics, optimizationMetrics);
                        recommendations = this.generateAnalyticsRecommendations(channelMetrics, insights);
                        return [2 /*return*/, {
                                period: __assign(__assign({}, period), { granularity: granularity }),
                                metrics: channelMetrics,
                                optimization: optimizationMetrics,
                                insights: insights,
                                recommendations: recommendations
                            }];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Error generating channel analytics:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ====================================================================
     * HELPER METHODS
     * ====================================================================
     */
    /**
     * Obter canais disponíveis
     */
    ChannelOptimizationEngine.prototype.getAvailableChannels = function () {
        if (!this.config)
            return ['email', 'sms'];
        return Object.entries(this.config.channelSettings)
            .filter(function (_a) {
            var _ = _a[0], settings = _a[1];
            return settings.enabled;
        })
            .map(function (_a) {
            var channel = _a[0];
            return channel;
        });
    };
    /**
     * Verificar se canal atende constraints
     */
    ChannelOptimizationEngine.prototype.meetsConstraints = function (channel, request, profile) {
        var _a, _b;
        var channelSettings = (_a = this.config) === null || _a === void 0 ? void 0 : _a.channelSettings[channel];
        if (!channelSettings)
            return false;
        // Verificar exclusões específicas
        var excluded = (_b = request.constraints.exclusions) === null || _b === void 0 ? void 0 : _b.some(function (exc) { return exc.channel === channel && (!exc.until || exc.until > new Date()); });
        if (excluded)
            return false;
        // Verificar consent se necessário
        if (channelSettings.constraints.requiresConsent) {
            // Implementar verificação de consent
            // return this.hasValidConsent(profile.patientId, channel);
        }
        // Verificar necessidades de acessibilidade
        if (profile.accessibility.hasNeeds) {
            return this.isChannelAccessible(channel, profile.accessibility);
        }
        return true;
    };
    /**
     * Verificar se canal é acessível para o paciente
     */
    ChannelOptimizationEngine.prototype.isChannelAccessible = function (channel, needs) {
        // Implementar lógica de acessibilidade por canal
        if (needs.needs.some(function (need) { return need.type === 'visual_impairment' && need.severity === 'severe'; })) {
            // Para deficiência visual severa, preferir canais de áudio
            return ['voice', 'sms'].includes(channel);
        }
        if (needs.needs.some(function (need) { return need.type === 'hearing_impairment' && need.severity === 'severe'; })) {
            // Para deficiência auditiva severa, evitar canais de áudio
            return !['voice', 'video'].includes(channel);
        }
        return true;
    };
    /**
     * Calcular confidence de um canal
     */
    ChannelOptimizationEngine.prototype.calculateChannelConfidence = function (channel, preference, behavior, context) {
        var confidence = 0.5; // Base confidence
        // Aumentar baseado na preferência
        if (preference) {
            confidence += preference.preference * preference.confidence * 0.3;
        }
        // Aumentar baseado no histórico
        if (behavior === null || behavior === void 0 ? void 0 : behavior.engagement) {
            var engagementScore = behavior.engagement.engagementScore / 100;
            confidence += engagementScore * 0.4;
        }
        // Ajustar baseado no contexto
        if (context.urgency === 'high' || context.urgency === 'critical') {
            // Para urgência alta, preferir canais mais rápidos
            var fastChannels = ['sms', 'push', 'voice'];
            if (fastChannels.includes(channel)) {
                confidence += 0.2;
            }
        }
        return Math.min(0.95, Math.max(0.05, confidence));
    };
    /**
     * Calcular prioridade do canal
     */
    ChannelOptimizationEngine.prototype.calculateChannelPriority = function (channel, confidence, preference) {
        var _a;
        var channelSettings = (_a = this.config) === null || _a === void 0 ? void 0 : _a.channelSettings[channel];
        var priority = (channelSettings === null || channelSettings === void 0 ? void 0 : channelSettings.priority) || 10;
        // Ajustar baseado na confidence
        priority -= confidence * 2;
        // Ajustar baseado na preferência
        if (preference) {
            priority -= preference.preference * 3;
        }
        return Math.max(1, Math.round(priority));
    };
    /**
     * Gerar reasoning para canal
     */
    ChannelOptimizationEngine.prototype.generateChannelReasoning = function (channel, preference, behavior, context, adaptations) {
        var reasons = [];
        if (preference && preference.preference > 0.7) {
            reasons.push("Paciente demonstra alta prefer\u00EAncia por ".concat(channel, " (").concat(Math.round(preference.preference * 100), "%)"));
        }
        if ((behavior === null || behavior === void 0 ? void 0 : behavior.engagement.engagementScore) > 70) {
            reasons.push("Hist\u00F3rico de alto engajamento em ".concat(channel, " (").concat(behavior.engagement.engagementScore, "%)"));
        }
        if (context.urgency === 'high' && ['sms', 'push'].includes(channel)) {
            reasons.push("Canal apropriado para comunica\u00E7\u00F5es urgentes");
        }
        if (adaptations.length > 0) {
            reasons.push("Conte\u00FAdo ser\u00E1 adaptado para otimizar efetividade em ".concat(channel));
        }
        if (reasons.length === 0) {
            reasons.push("Canal padr\u00E3o baseado nas configura\u00E7\u00F5es da cl\u00EDnica");
        }
        return reasons;
    };
    // Métodos placeholder para implementação completa
    ChannelOptimizationEngine.prototype.analyzeCommunicationBehaviors = function (communications) {
        // Implementar análise de comportamentos históricos
        return [];
    };
    ChannelOptimizationEngine.prototype.inferInitialPreferences = function (patient, behaviors) {
        // Implementar inferência de preferências iniciais
        return [];
    };
    ChannelOptimizationEngine.prototype.detectDevices = function (communications) {
        // Implementar detecção de dispositivos
        return [];
    };
    ChannelOptimizationEngine.prototype.assessAccessibilityNeeds = function (patient) {
        // Implementar avaliação de necessidades de acessibilidade
        return {
            hasNeeds: false,
            needs: [],
            accommodations: [],
            supportContacts: []
        };
    };
    ChannelOptimizationEngine.prototype.createDemographics = function (patient) {
        var age = this.calculateAge(new Date(patient.birth_date));
        return {
            age: age,
            ageGroup: this.getAgeGroup(age),
            gender: patient.gender || 'prefer_not_to_say',
            location: {
                city: patient.city || '',
                state: patient.state || '',
                region: patient.region || '',
                timezone: patient.timezone || 'America/Sao_Paulo',
                connectivity: 'good'
            },
            digitalLiteracy: {
                level: 'medium',
                devices: [],
                features: [],
                supportNeeds: 'minimal'
            },
            communicationStyle: 'formal'
        };
    };
    ChannelOptimizationEngine.prototype.calculateAge = function (birthDate) {
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    ChannelOptimizationEngine.prototype.getAgeGroup = function (age) {
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
    ChannelOptimizationEngine.prototype.mapConfigFromDB = function (data) {
        // Implementar mapeamento do banco de dados
        return this.getDefaultConfig();
    };
    ChannelOptimizationEngine.prototype.mapProfileFromDB = function (data) {
        // Implementar mapeamento do banco de dados
        return {
            patientId: data.patient_id,
            clinicId: data.clinic_id,
            preferences: [],
            behaviors: [],
            demographics: {},
            devices: [],
            accessibility: {
                hasNeeds: false,
                needs: [],
                accommodations: [],
                supportContacts: []
            },
            createdAt: new Date(data.created_at),
            lastUpdated: new Date(data.last_updated)
        };
    };
    ChannelOptimizationEngine.prototype.saveConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ChannelOptimizationEngine.prototype.savePatientProfile = function (profile) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ChannelOptimizationEngine.prototype.saveOptimizationResult = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ChannelOptimizationEngine.prototype.saveLearningData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ChannelOptimizationEngine.prototype.classifyPatientSegment = function (profile) {
        // Implementar classificação de segmento
        return 'standard';
    };
    ChannelOptimizationEngine.prototype.getRecentEngagement = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar busca de engajamento recente
                return [2 /*return*/, {}];
            });
        });
    };
    ChannelOptimizationEngine.prototype.analyzeDeviceContext = function (devices) {
        // Implementar análise de contexto de dispositivo
        return {};
    };
    ChannelOptimizationEngine.prototype.getCommunicationHistory = function (patientId, purpose) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar busca do histórico
                return [2 /*return*/, []];
            });
        });
    };
    ChannelOptimizationEngine.prototype.identifyAlternativeChannels = function (recommendations, request, profile) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar identificação de canais alternativos
                return [2 /*return*/, []];
            });
        });
    };
    ChannelOptimizationEngine.prototype.generateOptimizationReasoning = function (recommendations, context, profile) {
        // Implementar geração de reasoning
        return {
            primaryFactors: [],
            considerations: [],
            tradeoffs: [],
            assumptions: []
        };
    };
    ChannelOptimizationEngine.prototype.estimateEffectiveness = function (recommendations, profile, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar estimativa de efetividade
                return [2 /*return*/, {
                        overall: 75,
                        byChannel: [],
                        byOutcome: [],
                        factors: []
                    }];
            });
        });
    };
    ChannelOptimizationEngine.prototype.calculateCosts = function (recommendations, request) {
        // Implementar cálculo de custos
        return {
            total: 0,
            currency: 'BRL',
            breakdown: [],
            comparison: {
                vsBaseline: 0,
                vsAlternatives: 0,
                roi: {
                    estimated: 0,
                    confidence: 0,
                    timeframe: '',
                    assumptions: []
                }
            }
        };
    };
    ChannelOptimizationEngine.prototype.validateCompliance = function (recommendations, request, profile) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar validação de compliance
                return [2 /*return*/, {
                        overall: true,
                        requirements: [],
                        risks: [],
                        recommendations: []
                    }];
            });
        });
    };
    ChannelOptimizationEngine.prototype.calculateOverallConfidence = function (recommendations) {
        if (recommendations.length === 0)
            return 0;
        var totalConfidence = recommendations.reduce(function (sum, rec) { return sum + rec.confidence; }, 0);
        return totalConfidence / recommendations.length;
    };
    ChannelOptimizationEngine.prototype.determineContentAdaptations = function (channel, request, profile) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar determinação de adaptações
                return [2 /*return*/, []];
            });
        });
    };
    ChannelOptimizationEngine.prototype.calculateRecommendedTiming = function (channel, profile, urgency) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar cálculo de timing
                return [2 /*return*/, {
                        preferredTime: new Date(),
                        timeWindow: {
                            startHour: 9,
                            startMinute: 0,
                            endHour: 17,
                            endMinute: 0,
                            timezone: 'America/Sao_Paulo'
                        },
                        avoidTimes: [],
                        factors: []
                    }];
            });
        });
    };
    ChannelOptimizationEngine.prototype.estimateChannelOutcome = function (channel, behavior, context) {
        // Implementar estimativa de outcome
        return {
            responseRate: 25,
            engagementRate: 15,
            satisfactionScore: 7,
            completionRate: 80,
            timeToResponse: 120
        };
    };
    ChannelOptimizationEngine.prototype.calculatePredictionAccuracy = function (expected, actual) {
        // Implementar cálculo de accuracy
        return 0.8;
    };
    ChannelOptimizationEngine.prototype.analyzeFeedbackFactors = function (prediction, outcome) {
        // Implementar análise de fatores
        return [];
    };
    ChannelOptimizationEngine.prototype.generateImprovements = function (factors, accuracy) {
        // Implementar geração de melhorias
        return [];
    };
    ChannelOptimizationEngine.prototype.calculateFeedbackConfidence = function (outcome) {
        // Implementar cálculo de confidence do feedback
        return 0.8;
    };
    ChannelOptimizationEngine.prototype.updatePredictionModels = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ChannelOptimizationEngine.prototype.recalculatePreferences = function (behaviors) {
        // Implementar recálculo de preferências
        return [];
    };
    ChannelOptimizationEngine.prototype.calculateChannelMetrics = function (communications) {
        // Implementar cálculo de métricas por canal
        return [];
    };
    ChannelOptimizationEngine.prototype.calculateOptimizationMetrics = function (communications) {
        // Implementar cálculo de métricas de otimização
        return {
            optimizationRate: 0,
            improvementRate: 0,
            adoptionRate: 0,
            successRate: 0
        };
    };
    ChannelOptimizationEngine.prototype.generateChannelInsights = function (channelMetrics, optimization) {
        // Implementar geração de insights
        return [];
    };
    ChannelOptimizationEngine.prototype.generateAnalyticsRecommendations = function (metrics, insights) {
        // Implementar geração de recomendações analíticas
        return [];
    };
    ChannelOptimizationEngine.prototype.getEmptyAnalytics = function (period, granularity) {
        return {
            period: __assign(__assign({}, period), { granularity: granularity }),
            metrics: [],
            optimization: {
                optimizationRate: 0,
                improvementRate: 0,
                adoptionRate: 0,
                successRate: 0
            },
            insights: [],
            recommendations: []
        };
    };
    ChannelOptimizationEngine.prototype.startPeriodicOptimization = function () {
        var _this = this;
        // Implementar otimização periódica
        setInterval(function () {
            _this.performPeriodicMaintenance();
        }, 3600000); // Cada hora
    };
    ChannelOptimizationEngine.prototype.performPeriodicMaintenance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Limpar cache antigo
                        this.cleanupCache();
                        // Atualizar modelos de ML
                        return [4 /*yield*/, this.updateMLModels()];
                    case 1:
                        // Atualizar modelos de ML
                        _a.sent();
                        // Processar learning data pendente
                        return [4 /*yield*/, this.processLearningQueue()];
                    case 2:
                        // Processar learning data pendente
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        console.error('Error in periodic maintenance:', error_10);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ChannelOptimizationEngine.prototype.cleanupCache = function () {
        // Implementar limpeza de cache
        if (this.cache.size > 1000) {
            this.cache.clear();
        }
    };
    ChannelOptimizationEngine.prototype.updateMLModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ChannelOptimizationEngine.prototype.processLearningQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ChannelOptimizationEngine.prototype.generateId = function () {
        return "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    };
    return ChannelOptimizationEngine;
}());
exports.ChannelOptimizationEngine = ChannelOptimizationEngine;
// Export singleton instance
var createchannelOptimizationEngine = function () { return new ChannelOptimizationEngine(); };
exports.createchannelOptimizationEngine = createchannelOptimizationEngine;
