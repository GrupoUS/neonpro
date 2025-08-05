"use strict";
/**
 * AI-Driven Patient Segmentation System
 * Story 3.4: Smart Search + NLP Integration - Task 3
 * Intelligent patient segmentation with natural language criteria
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
exports.patientSegmentation = exports.PatientSegmentation = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var nlp_engine_1 = require("./nlp-engine");
/**
 * AI-Driven Patient Segmentation System
 * Creates and manages intelligent patient segments
 */
var PatientSegmentation = /** @class */ (function () {
    function PatientSegmentation(supabaseUrl, supabaseKey) {
        this.segmentCache = new Map();
        this.cacheExpiry = new Map();
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
        if (supabaseUrl && supabaseKey) {
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        }
    }
    /**
     * Create a new patient segment from natural language criteria
     */
    PatientSegmentation.prototype.createSegment = function (name_1, naturalLanguageQuery_1) {
        return __awaiter(this, arguments, void 0, function (name, naturalLanguageQuery, language, createdBy, description) {
            var nlpResult, structuredCriteria, criteria, _a, savedCriteria, criteriaError, segment, error_1;
            if (language === void 0) { language = 'pt'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, nlp_engine_1.nlpEngine.processQuery(naturalLanguageQuery, language)];
                    case 1:
                        nlpResult = _b.sent();
                        return [4 /*yield*/, this.convertNLPToStructuredCriteria(nlpResult, language)];
                    case 2:
                        structuredCriteria = _b.sent();
                        criteria = {
                            name: name,
                            description: description || "Segmento criado a partir da consulta: \"".concat(naturalLanguageQuery, "\""),
                            naturalLanguageQuery: naturalLanguageQuery,
                            structuredCriteria: structuredCriteria,
                            language: language,
                            createdBy: createdBy,
                            isActive: true,
                            tags: this.extractTagsFromNLP(nlpResult)
                        };
                        return [4 /*yield*/, this.supabase
                                .from('patient_segments')
                                .insert({
                                segment_name: criteria.name,
                                description: criteria.description,
                                natural_language_query: criteria.naturalLanguageQuery,
                                criteria_json: criteria.structuredCriteria,
                                language: criteria.language,
                                created_by: criteria.createdBy,
                                is_active: criteria.isActive,
                                tags: criteria.tags
                            })
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), savedCriteria = _a.data, criteriaError = _a.error;
                        if (criteriaError) {
                            throw new Error("Failed to save segment criteria: ".concat(criteriaError.message));
                        }
                        criteria.id = savedCriteria.id;
                        return [4 /*yield*/, this.generateSegment(criteria)];
                    case 4:
                        segment = _b.sent();
                        // Cache the segment
                        this.cacheSegment(segment);
                        return [2 /*return*/, segment];
                    case 5:
                        error_1 = _b.sent();
                        console.error('Error creating segment:', error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Convert NLP result to structured criteria
     */
    PatientSegmentation.prototype.convertNLPToStructuredCriteria = function (nlpResult, language) {
        return __awaiter(this, void 0, void 0, function () {
            var criteria;
            return __generator(this, function (_a) {
                criteria = {};
                // Extract demographic criteria
                criteria.demographics = this.extractDemographicCriteria(nlpResult);
                // Extract medical criteria
                criteria.medical = this.extractMedicalCriteria(nlpResult);
                // Extract behavioral criteria
                criteria.behavioral = this.extractBehavioralCriteria(nlpResult);
                // Extract financial criteria
                criteria.financial = this.extractFinancialCriteria(nlpResult);
                // Extract custom criteria
                criteria.custom = this.extractCustomCriteria(nlpResult);
                return [2 /*return*/, criteria];
            });
        });
    };
    /**
     * Extract demographic criteria from NLP result
     */
    PatientSegmentation.prototype.extractDemographicCriteria = function (nlpResult) {
        var demographics = {};
        // Age range extraction
        var ageEntities = nlpResult.entities.filter(function (e) { return e.type === 'age' || e.type === 'number'; });
        if (ageEntities.length > 0) {
            var ages = ageEntities.map(function (e) { return parseInt(e.value); }).filter(function (age) { return !isNaN(age); });
            if (ages.length === 1) {
                demographics.ageRange = { min: ages[0] - 5, max: ages[0] + 5 };
            }
            else if (ages.length >= 2) {
                demographics.ageRange = { min: Math.min.apply(Math, ages), max: Math.max.apply(Math, ages) };
            }
        }
        // Gender extraction
        var genderKeywords = {
            pt: {
                male: ['homem', 'homens', 'masculino', 'macho'],
                female: ['mulher', 'mulheres', 'feminino', 'fêmea']
            },
            en: {
                male: ['man', 'men', 'male'],
                female: ['woman', 'women', 'female']
            },
            es: {
                male: ['hombre', 'hombres', 'masculino', 'macho'],
                female: ['mujer', 'mujeres', 'femenino', 'hembra']
            }
        };
        var queryLower = nlpResult.normalized.toLowerCase();
        var genderWords = genderKeywords[nlpResult.language] || genderKeywords.pt;
        if (genderWords.male.some(function (word) { return queryLower.includes(word); })) {
            demographics.gender = ['M'];
        }
        else if (genderWords.female.some(function (word) { return queryLower.includes(word); })) {
            demographics.gender = ['F'];
        }
        // Location extraction
        var locationEntities = nlpResult.entities.filter(function (e) { return e.type === 'location'; });
        if (locationEntities.length > 0) {
            demographics.location = locationEntities.map(function (e) { return e.value; });
        }
        return Object.keys(demographics).length > 0 ? demographics : undefined;
    };
    /**
     * Extract medical criteria from NLP result
     */
    PatientSegmentation.prototype.extractMedicalCriteria = function (nlpResult) {
        var _a, _b;
        var medical = {};
        // Medical condition keywords
        var conditionKeywords = {
            pt: ['diabetes', 'hipertensão', 'asma', 'depressão', 'ansiedade', 'artrite', 'câncer', 'obesidade'],
            en: ['diabetes', 'hypertension', 'asthma', 'depression', 'anxiety', 'arthritis', 'cancer', 'obesity'],
            es: ['diabetes', 'hipertensión', 'asma', 'depresión', 'ansiedad', 'artritis', 'cáncer', 'obesidad']
        };
        // Treatment keywords
        var treatmentKeywords = {
            pt: ['fisioterapia', 'cirurgia', 'quimioterapia', 'radioterapia', 'terapia'],
            en: ['physiotherapy', 'surgery', 'chemotherapy', 'radiotherapy', 'therapy'],
            es: ['fisioterapia', 'cirugía', 'quimioterapia', 'radioterapia', 'terapia']
        };
        var queryLower = nlpResult.normalized.toLowerCase();
        var lang = nlpResult.language;
        // Extract conditions
        var conditions = ((_a = conditionKeywords[lang]) === null || _a === void 0 ? void 0 : _a.filter(function (condition) {
            return queryLower.includes(condition.toLowerCase());
        })) || [];
        if (conditions.length > 0) {
            medical.conditions = conditions;
        }
        // Extract treatments
        var treatments = ((_b = treatmentKeywords[lang]) === null || _b === void 0 ? void 0 : _b.filter(function (treatment) {
            return queryLower.includes(treatment.toLowerCase());
        })) || [];
        if (treatments.length > 0) {
            medical.treatments = treatments;
        }
        // Extract medication entities
        var medicationEntities = nlpResult.entities.filter(function (e) { return e.type === 'medication'; });
        if (medicationEntities.length > 0) {
            medical.medications = medicationEntities.map(function (e) { return e.value; });
        }
        return Object.keys(medical).length > 0 ? medical : undefined;
    };
    /**
     * Extract behavioral criteria from NLP result
     */
    PatientSegmentation.prototype.extractBehavioralCriteria = function (nlpResult) {
        var behavioral = {};
        // Visit frequency keywords
        var frequencyKeywords = {
            pt: {
                frequent: ['frequente', 'regular', 'sempre', 'muito'],
                rare: ['raro', 'pouco', 'nunca', 'raramente'],
                monthly: ['mensal', 'mês', 'meses'],
                yearly: ['anual', 'ano', 'anos']
            },
            en: {
                frequent: ['frequent', 'regular', 'always', 'often'],
                rare: ['rare', 'seldom', 'never', 'rarely'],
                monthly: ['monthly', 'month', 'months'],
                yearly: ['yearly', 'year', 'years']
            },
            es: {
                frequent: ['frecuente', 'regular', 'siempre', 'mucho'],
                rare: ['raro', 'poco', 'nunca', 'raramente'],
                monthly: ['mensual', 'mes', 'meses'],
                yearly: ['anual', 'año', 'años']
            }
        };
        var queryLower = nlpResult.normalized.toLowerCase();
        var lang = nlpResult.language;
        var keywords = frequencyKeywords[lang] || frequencyKeywords.pt;
        // Determine visit frequency
        if (keywords.frequent.some(function (word) { return queryLower.includes(word); })) {
            behavioral.visitFrequency = { min: 4, period: 'year' };
        }
        else if (keywords.rare.some(function (word) { return queryLower.includes(word); })) {
            behavioral.visitFrequency = { max: 1, period: 'year' };
        }
        // Extract date entities for last visit
        var dateEntities = nlpResult.entities.filter(function (e) { return e.type === 'date'; });
        if (dateEntities.length > 0) {
            var date = dateEntities[0].value;
            if (queryLower.includes('antes') || queryLower.includes('before') || queryLower.includes('anterior')) {
                behavioral.lastVisit = { before: date };
            }
            else if (queryLower.includes('depois') || queryLower.includes('after') || queryLower.includes('posterior')) {
                behavioral.lastVisit = { after: date };
            }
        }
        return Object.keys(behavioral).length > 0 ? behavioral : undefined;
    };
    /**
     * Extract financial criteria from NLP result
     */
    PatientSegmentation.prototype.extractFinancialCriteria = function (nlpResult) {
        var _a;
        var financial = {};
        // Insurance keywords
        var insuranceKeywords = {
            pt: ['plano', 'convênio', 'seguro', 'sus', 'particular'],
            en: ['insurance', 'plan', 'coverage', 'private', 'public'],
            es: ['seguro', 'plan', 'cobertura', 'privado', 'público']
        };
        var queryLower = nlpResult.normalized.toLowerCase();
        var lang = nlpResult.language;
        // Extract insurance types
        var insuranceTypes = ((_a = insuranceKeywords[lang]) === null || _a === void 0 ? void 0 : _a.filter(function (type) {
            return queryLower.includes(type.toLowerCase());
        })) || [];
        if (insuranceTypes.length > 0) {
            financial.insuranceTypes = insuranceTypes;
        }
        // Extract payment method entities
        var paymentEntities = nlpResult.entities.filter(function (e) { return e.type === 'payment'; });
        if (paymentEntities.length > 0) {
            financial.paymentMethods = paymentEntities.map(function (e) { return e.value; });
        }
        return Object.keys(financial).length > 0 ? financial : undefined;
    };
    /**
     * Extract custom criteria from NLP result
     */
    PatientSegmentation.prototype.extractCustomCriteria = function (nlpResult) {
        var custom = {};
        // Extract any remaining entities that don't fit standard categories
        nlpResult.entities.forEach(function (entity) {
            if (!['age', 'number', 'location', 'medication', 'date', 'payment'].includes(entity.type)) {
                if (!custom[entity.type]) {
                    custom[entity.type] = [];
                }
                custom[entity.type].push(entity.value);
            }
        });
        return Object.keys(custom).length > 0 ? custom : {};
    };
    /**
     * Extract tags from NLP result
     */
    PatientSegmentation.prototype.extractTagsFromNLP = function (nlpResult) {
        var tags = [];
        // Add intent as tag
        if (nlpResult.intent) {
            tags.push(nlpResult.intent);
        }
        // Add entity types as tags
        var entityTypes = __spreadArray([], new Set(nlpResult.entities.map(function (e) { return e.type; })), true);
        tags.push.apply(tags, entityTypes);
        // Add language as tag
        tags.push(nlpResult.language);
        return tags;
    };
    /**
     * Generate patient segment based on criteria
     */
    PatientSegmentation.prototype.generateSegment = function (criteria_1) {
        return __awaiter(this, arguments, void 0, function (criteria, options) {
            var _a, includeInactive, _b, maxPatients, _c, minMatchScore, _d, sortBy, _e, sortOrder, _f, refreshData, cached, query, _g, patients, error, segmentMembers, sortedMembers, insights, performance_1, segment, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 6, , 7]);
                        _a = options.includeInactive, includeInactive = _a === void 0 ? false : _a, _b = options.maxPatients, maxPatients = _b === void 0 ? 1000 : _b, _c = options.minMatchScore, minMatchScore = _c === void 0 ? 0.5 : _c, _d = options.sortBy, sortBy = _d === void 0 ? 'matchScore' : _d, _e = options.sortOrder, sortOrder = _e === void 0 ? 'desc' : _e, _f = options.refreshData, refreshData = _f === void 0 ? false : _f;
                        // Check cache first
                        if (!refreshData && criteria.id) {
                            cached = this.getCachedSegment(criteria.id);
                            if (cached) {
                                return [2 /*return*/, cached];
                            }
                        }
                        query = this.buildSegmentQuery(criteria, includeInactive);
                        return [4 /*yield*/, this.supabase.rpc('search_patients_by_criteria', {
                                criteria_json: criteria.structuredCriteria,
                                include_inactive: includeInactive,
                                max_results: maxPatients
                            })];
                    case 1:
                        _g = _h.sent(), patients = _g.data, error = _g.error;
                        if (error) {
                            throw new Error("Failed to generate segment: ".concat(error.message));
                        }
                        return [4 /*yield*/, this.calculateMatchScores(patients || [], criteria, minMatchScore)];
                    case 2:
                        segmentMembers = _h.sent();
                        sortedMembers = this.sortSegmentMembers(segmentMembers, sortBy, sortOrder);
                        return [4 /*yield*/, this.generateSegmentInsights(sortedMembers, criteria)];
                    case 3:
                        insights = _h.sent();
                        performance_1 = this.calculateSegmentPerformance(sortedMembers, criteria);
                        segment = {
                            id: criteria.id || "temp_".concat(Date.now()),
                            criteria: criteria,
                            patientCount: sortedMembers.length,
                            patients: sortedMembers,
                            lastUpdated: new Date().toISOString(),
                            performance: performance_1,
                            insights: insights
                        };
                        if (!criteria.id) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.supabase
                                .from('patient_segments')
                                .update({ patient_count: segment.patientCount, last_updated: segment.lastUpdated })
                                .eq('id', criteria.id)];
                    case 4:
                        _h.sent();
                        _h.label = 5;
                    case 5:
                        // Cache the segment
                        this.cacheSegment(segment);
                        return [2 /*return*/, segment];
                    case 6:
                        error_2 = _h.sent();
                        console.error('Error generating segment:', error_2);
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Build SQL query for segment criteria
     */
    PatientSegmentation.prototype.buildSegmentQuery = function (criteria, includeInactive) {
        var conditions = [];
        var structuredCriteria = criteria.structuredCriteria;
        // Demographics conditions
        if (structuredCriteria.demographics) {
            var demo = structuredCriteria.demographics;
            if (demo.ageRange) {
                if (demo.ageRange.min !== undefined) {
                    conditions.push("EXTRACT(YEAR FROM AGE(birth_date)) >= ".concat(demo.ageRange.min));
                }
                if (demo.ageRange.max !== undefined) {
                    conditions.push("EXTRACT(YEAR FROM AGE(birth_date)) <= ".concat(demo.ageRange.max));
                }
            }
            if (demo.gender && demo.gender.length > 0) {
                var genderList = demo.gender.map(function (g) { return "'".concat(g, "'"); }).join(',');
                conditions.push("gender IN (".concat(genderList, ")"));
            }
            if (demo.location && demo.location.length > 0) {
                var locationConditions = demo.location.map(function (loc) {
                    return "(address ILIKE '%".concat(loc, "%' OR city ILIKE '%").concat(loc, "%' OR state ILIKE '%").concat(loc, "%')");
                });
                conditions.push("(".concat(locationConditions.join(' OR '), ")"));
            }
        }
        // Add active/inactive filter
        if (!includeInactive) {
            conditions.push('active = true');
        }
        return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    };
    /**
     * Calculate match scores for patients
     */
    PatientSegmentation.prototype.calculateMatchScores = function (patients, criteria, minMatchScore) {
        return __awaiter(this, void 0, void 0, function () {
            var members, _i, patients_1, patient, matchResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        members = [];
                        _i = 0, patients_1 = patients;
                        _a.label = 1;
                    case 1:
                        if (!(_i < patients_1.length)) return [3 /*break*/, 4];
                        patient = patients_1[_i];
                        return [4 /*yield*/, this.calculatePatientMatchScore(patient, criteria)];
                    case 2:
                        matchResult = _a.sent();
                        if (matchResult.score >= minMatchScore) {
                            members.push({
                                patientId: patient.id,
                                patientName: patient.name,
                                matchScore: matchResult.score,
                                matchedCriteria: matchResult.matchedCriteria,
                                demographics: {
                                    age: this.calculateAge(patient.birth_date),
                                    gender: patient.gender,
                                    location: patient.city || patient.state || 'N/A'
                                },
                                medicalSummary: {
                                    primaryConditions: patient.conditions || [],
                                    currentTreatments: patient.treatments || [],
                                    lastVisit: patient.last_visit || 'N/A'
                                },
                                behavioralMetrics: {
                                    visitFrequency: patient.visit_frequency || 0,
                                    appointmentTypes: patient.appointment_types || [],
                                    adherenceScore: patient.adherence_score || 0
                                }
                            });
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, members];
                }
            });
        });
    };
    /**
     * Calculate individual patient match score
     */
    PatientSegmentation.prototype.calculatePatientMatchScore = function (patient, criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var totalScore, maxPossibleScore, matchedCriteria, structuredCriteria, demoScore, medicalScore, behavioralScore, financialScore, finalScore;
            return __generator(this, function (_a) {
                totalScore = 0;
                maxPossibleScore = 0;
                matchedCriteria = [];
                structuredCriteria = criteria.structuredCriteria;
                // Demographics scoring
                if (structuredCriteria.demographics) {
                    demoScore = this.scoreDemographics(patient, structuredCriteria.demographics);
                    totalScore += demoScore.score;
                    maxPossibleScore += demoScore.maxScore;
                    matchedCriteria.push.apply(matchedCriteria, demoScore.matched);
                }
                // Medical scoring
                if (structuredCriteria.medical) {
                    medicalScore = this.scoreMedical(patient, structuredCriteria.medical);
                    totalScore += medicalScore.score;
                    maxPossibleScore += medicalScore.maxScore;
                    matchedCriteria.push.apply(matchedCriteria, medicalScore.matched);
                }
                // Behavioral scoring
                if (structuredCriteria.behavioral) {
                    behavioralScore = this.scoreBehavioral(patient, structuredCriteria.behavioral);
                    totalScore += behavioralScore.score;
                    maxPossibleScore += behavioralScore.maxScore;
                    matchedCriteria.push.apply(matchedCriteria, behavioralScore.matched);
                }
                // Financial scoring
                if (structuredCriteria.financial) {
                    financialScore = this.scoreFinancial(patient, structuredCriteria.financial);
                    totalScore += financialScore.score;
                    maxPossibleScore += financialScore.maxScore;
                    matchedCriteria.push.apply(matchedCriteria, financialScore.matched);
                }
                finalScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
                return [2 /*return*/, {
                        score: Math.round(finalScore * 100) / 100,
                        matchedCriteria: __spreadArray([], new Set(matchedCriteria), true)
                    }];
            });
        });
    };
    /**
     * Score demographics criteria
     */
    PatientSegmentation.prototype.scoreDemographics = function (patient, demographics) {
        var score = 0;
        var maxScore = 0;
        var matched = [];
        // Age scoring
        if (demographics.ageRange) {
            maxScore += 10;
            var patientAge = this.calculateAge(patient.birth_date);
            if ((!demographics.ageRange.min || patientAge >= demographics.ageRange.min) &&
                (!demographics.ageRange.max || patientAge <= demographics.ageRange.max)) {
                score += 10;
                matched.push('age_range');
            }
        }
        // Gender scoring
        if (demographics.gender && demographics.gender.length > 0) {
            maxScore += 10;
            if (demographics.gender.includes(patient.gender)) {
                score += 10;
                matched.push('gender');
            }
        }
        // Location scoring
        if (demographics.location && demographics.location.length > 0) {
            maxScore += 10;
            var patientLocation_1 = "".concat(patient.address || '', " ").concat(patient.city || '', " ").concat(patient.state || '').toLowerCase();
            if (demographics.location.some(function (loc) { return patientLocation_1.includes(loc.toLowerCase()); })) {
                score += 10;
                matched.push('location');
            }
        }
        return { score: score, maxScore: maxScore, matched: matched };
    };
    /**
     * Score medical criteria
     */
    PatientSegmentation.prototype.scoreMedical = function (patient, medical) {
        var score = 0;
        var maxScore = 0;
        var matched = [];
        // Conditions scoring
        if (medical.conditions && medical.conditions.length > 0) {
            maxScore += 15;
            var patientConditions_1 = (patient.conditions || []).map(function (c) { return c.toLowerCase(); });
            var matchedConditions = medical.conditions.filter(function (condition) {
                return patientConditions_1.some(function (pc) { return pc.includes(condition.toLowerCase()); });
            });
            if (matchedConditions.length > 0) {
                score += Math.min(15, (matchedConditions.length / medical.conditions.length) * 15);
                matched.push('conditions');
            }
        }
        // Treatments scoring
        if (medical.treatments && medical.treatments.length > 0) {
            maxScore += 10;
            var patientTreatments_1 = (patient.treatments || []).map(function (t) { return t.toLowerCase(); });
            var matchedTreatments = medical.treatments.filter(function (treatment) {
                return patientTreatments_1.some(function (pt) { return pt.includes(treatment.toLowerCase()); });
            });
            if (matchedTreatments.length > 0) {
                score += Math.min(10, (matchedTreatments.length / medical.treatments.length) * 10);
                matched.push('treatments');
            }
        }
        // Medications scoring
        if (medical.medications && medical.medications.length > 0) {
            maxScore += 10;
            var patientMedications_1 = (patient.medications || []).map(function (m) { return m.toLowerCase(); });
            var matchedMedications = medical.medications.filter(function (medication) {
                return patientMedications_1.some(function (pm) { return pm.includes(medication.toLowerCase()); });
            });
            if (matchedMedications.length > 0) {
                score += Math.min(10, (matchedMedications.length / medical.medications.length) * 10);
                matched.push('medications');
            }
        }
        return { score: score, maxScore: maxScore, matched: matched };
    };
    /**
     * Score behavioral criteria
     */
    PatientSegmentation.prototype.scoreBehavioral = function (patient, behavioral) {
        var score = 0;
        var maxScore = 0;
        var matched = [];
        // Visit frequency scoring
        if (behavioral.visitFrequency) {
            maxScore += 15;
            var patientFrequency = patient.visit_frequency || 0;
            if ((!behavioral.visitFrequency.min || patientFrequency >= behavioral.visitFrequency.min) &&
                (!behavioral.visitFrequency.max || patientFrequency <= behavioral.visitFrequency.max)) {
                score += 15;
                matched.push('visit_frequency');
            }
        }
        // Last visit scoring
        if (behavioral.lastVisit) {
            maxScore += 10;
            var lastVisitDate = new Date(patient.last_visit || '1900-01-01');
            var matches = true;
            if (behavioral.lastVisit.before) {
                matches = matches && lastVisitDate < new Date(behavioral.lastVisit.before);
            }
            if (behavioral.lastVisit.after) {
                matches = matches && lastVisitDate > new Date(behavioral.lastVisit.after);
            }
            if (matches) {
                score += 10;
                matched.push('last_visit');
            }
        }
        return { score: score, maxScore: maxScore, matched: matched };
    };
    /**
     * Score financial criteria
     */
    PatientSegmentation.prototype.scoreFinancial = function (patient, financial) {
        var score = 0;
        var maxScore = 0;
        var matched = [];
        // Insurance types scoring
        if (financial.insuranceTypes && financial.insuranceTypes.length > 0) {
            maxScore += 10;
            var patientInsurance_1 = (patient.insurance_type || '').toLowerCase();
            if (financial.insuranceTypes.some(function (type) { return patientInsurance_1.includes(type.toLowerCase()); })) {
                score += 10;
                matched.push('insurance_type');
            }
        }
        // Outstanding balance scoring
        if (financial.outstandingBalance) {
            maxScore += 10;
            var patientBalance = patient.outstanding_balance || 0;
            if ((!financial.outstandingBalance.min || patientBalance >= financial.outstandingBalance.min) &&
                (!financial.outstandingBalance.max || patientBalance <= financial.outstandingBalance.max)) {
                score += 10;
                matched.push('outstanding_balance');
            }
        }
        return { score: score, maxScore: maxScore, matched: matched };
    };
    /**
     * Calculate age from birth date
     */
    PatientSegmentation.prototype.calculateAge = function (birthDate) {
        if (!birthDate)
            return 0;
        var birth = new Date(birthDate);
        var today = new Date();
        var age = today.getFullYear() - birth.getFullYear();
        var monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    /**
     * Sort segment members
     */
    PatientSegmentation.prototype.sortSegmentMembers = function (members, sortBy, sortOrder) {
        return members.sort(function (a, b) {
            var comparison = 0;
            switch (sortBy) {
                case 'matchScore':
                    comparison = b.matchScore - a.matchScore;
                    break;
                case 'lastVisit':
                    comparison = new Date(b.medicalSummary.lastVisit).getTime() - new Date(a.medicalSummary.lastVisit).getTime();
                    break;
                case 'name':
                    comparison = a.patientName.localeCompare(b.patientName);
                    break;
            }
            return sortOrder === 'desc' ? comparison : -comparison;
        });
    };
    /**
     * Generate segment insights
     */
    PatientSegmentation.prototype.generateSegmentInsights = function (members, criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var insights, ageGroups, genderDistribution, conditionFrequency;
            var _a;
            return __generator(this, function (_b) {
                insights = {
                    commonCharacteristics: [],
                    trends: [],
                    recommendations: []
                };
                if (members.length === 0) {
                    return [2 /*return*/, insights];
                }
                ageGroups = this.analyzeAgeDistribution(members);
                genderDistribution = this.analyzeGenderDistribution(members);
                conditionFrequency = this.analyzeConditionFrequency(members);
                insights.commonCharacteristics = [
                    "Faixa et\u00E1ria predominante: ".concat(((_a = ageGroups[0]) === null || _a === void 0 ? void 0 : _a.range) || 'N/A'),
                    "Distribui\u00E7\u00E3o por g\u00EAnero: ".concat(genderDistribution),
                    "Condi\u00E7\u00F5es mais comuns: ".concat(conditionFrequency.slice(0, 3).join(', '))
                ];
                // Analyze trends
                insights.trends = [
                    "Segmento com ".concat(members.length, " pacientes"),
                    "Score m\u00E9dio de correspond\u00EAncia: ".concat(this.calculateAverageMatchScore(members).toFixed(2)),
                    "Frequ\u00EAncia m\u00E9dia de visitas: ".concat(this.calculateAverageVisitFrequency(members).toFixed(1))
                ];
                // Generate recommendations
                insights.recommendations = this.generateRecommendations(members, criteria);
                return [2 /*return*/, insights];
            });
        });
    };
    /**
     * Analyze age distribution
     */
    PatientSegmentation.prototype.analyzeAgeDistribution = function (members) {
        var ageGroups = {
            '0-18': 0,
            '19-30': 0,
            '31-45': 0,
            '46-60': 0,
            '61+': 0
        };
        members.forEach(function (member) {
            var age = member.demographics.age;
            if (age <= 18)
                ageGroups['0-18']++;
            else if (age <= 30)
                ageGroups['19-30']++;
            else if (age <= 45)
                ageGroups['31-45']++;
            else if (age <= 60)
                ageGroups['46-60']++;
            else
                ageGroups['61+']++;
        });
        return Object.entries(ageGroups)
            .map(function (_a) {
            var range = _a[0], count = _a[1];
            return ({ range: range, count: count });
        })
            .sort(function (a, b) { return b.count - a.count; });
    };
    /**
     * Analyze gender distribution
     */
    PatientSegmentation.prototype.analyzeGenderDistribution = function (members) {
        var genderCounts = {};
        members.forEach(function (member) {
            var gender = member.demographics.gender;
            genderCounts[gender] = (genderCounts[gender] || 0) + 1;
        });
        return Object.entries(genderCounts)
            .map(function (_a) {
            var gender = _a[0], count = _a[1];
            return "".concat(gender, ": ").concat(count);
        })
            .join(', ');
    };
    /**
     * Analyze condition frequency
     */
    PatientSegmentation.prototype.analyzeConditionFrequency = function (members) {
        var conditionCounts = {};
        members.forEach(function (member) {
            member.medicalSummary.primaryConditions.forEach(function (condition) {
                conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
            });
        });
        return Object.entries(conditionCounts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })
            .map(function (_a) {
            var condition = _a[0];
            return condition;
        });
    };
    /**
     * Calculate average match score
     */
    PatientSegmentation.prototype.calculateAverageMatchScore = function (members) {
        if (members.length === 0)
            return 0;
        var totalScore = members.reduce(function (sum, member) { return sum + member.matchScore; }, 0);
        return totalScore / members.length;
    };
    /**
     * Calculate average visit frequency
     */
    PatientSegmentation.prototype.calculateAverageVisitFrequency = function (members) {
        if (members.length === 0)
            return 0;
        var totalFrequency = members.reduce(function (sum, member) { return sum + member.behavioralMetrics.visitFrequency; }, 0);
        return totalFrequency / members.length;
    };
    /**
     * Generate recommendations
     */
    PatientSegmentation.prototype.generateRecommendations = function (members, criteria) {
        var recommendations = [];
        // Size-based recommendations
        if (members.length < 10) {
            recommendations.push('Segmento pequeno - considere expandir os critérios para incluir mais pacientes');
        }
        else if (members.length > 500) {
            recommendations.push('Segmento muito grande - considere refinar os critérios para melhor direcionamento');
        }
        // Match score recommendations
        var avgMatchScore = this.calculateAverageMatchScore(members);
        if (avgMatchScore < 0.7) {
            recommendations.push('Score de correspondência baixo - revise os critérios para melhor precisão');
        }
        // Behavioral recommendations
        var avgVisitFreq = this.calculateAverageVisitFrequency(members);
        if (avgVisitFreq < 2) {
            recommendations.push('Pacientes com baixa frequência de visitas - considere campanhas de engajamento');
        }
        else if (avgVisitFreq > 6) {
            recommendations.push('Pacientes frequentes - oportunidade para programas de fidelidade');
        }
        return recommendations;
    };
    /**
     * Calculate segment performance
     */
    PatientSegmentation.prototype.calculateSegmentPerformance = function (members, criteria) {
        var avgMatchScore = this.calculateAverageMatchScore(members);
        return {
            accuracy: Math.round(avgMatchScore * 100) / 100,
            precision: Math.round((members.filter(function (m) { return m.matchScore >= 0.8; }).length / members.length) * 100) / 100,
            recall: Math.round((members.length / (members.length + 10)) * 100) / 100 // Simplified calculation
        };
    };
    /**
     * Cache segment
     */
    PatientSegmentation.prototype.cacheSegment = function (segment) {
        this.segmentCache.set(segment.id, segment);
        this.cacheExpiry.set(segment.id, Date.now() + this.CACHE_DURATION);
    };
    /**
     * Get cached segment
     */
    PatientSegmentation.prototype.getCachedSegment = function (segmentId) {
        var expiry = this.cacheExpiry.get(segmentId);
        if (!expiry || Date.now() > expiry) {
            this.segmentCache.delete(segmentId);
            this.cacheExpiry.delete(segmentId);
            return null;
        }
        return this.segmentCache.get(segmentId) || null;
    };
    /**
     * Get all segments
     */
    PatientSegmentation.prototype.getAllSegments = function () {
        return __awaiter(this, arguments, void 0, function (includeInactive) {
            var _a, data, error, segments, _i, _b, segmentData, criteria, segment, error_3;
            if (includeInactive === void 0) { includeInactive = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.supabase
                                .from('patient_segments')
                                .select('*')
                                .eq('is_active', includeInactive ? undefined : true)
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to get segments: ".concat(error.message));
                        }
                        segments = [];
                        _i = 0, _b = data || [];
                        _c.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        segmentData = _b[_i];
                        criteria = {
                            id: segmentData.id,
                            name: segmentData.segment_name,
                            description: segmentData.description,
                            naturalLanguageQuery: segmentData.natural_language_query,
                            structuredCriteria: segmentData.criteria_json,
                            language: segmentData.language,
                            createdBy: segmentData.created_by,
                            isActive: segmentData.is_active,
                            tags: segmentData.tags
                        };
                        return [4 /*yield*/, this.generateSegment(criteria, { refreshData: false })];
                    case 3:
                        segment = _c.sent();
                        segments.push(segment);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, segments];
                    case 6:
                        error_3 = _c.sent();
                        console.error('Error getting all segments:', error_3);
                        throw error_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update segment
     */
    PatientSegmentation.prototype.updateSegment = function (segmentId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, criteria, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('patient_segments')
                                .update({
                                segment_name: updates.name,
                                description: updates.description,
                                natural_language_query: updates.naturalLanguageQuery,
                                criteria_json: updates.structuredCriteria,
                                language: updates.language,
                                is_active: updates.isActive,
                                tags: updates.tags
                            })
                                .eq('id', segmentId)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to update segment: ".concat(error.message));
                        }
                        criteria = {
                            id: data.id,
                            name: data.segment_name,
                            description: data.description,
                            naturalLanguageQuery: data.natural_language_query,
                            structuredCriteria: data.criteria_json,
                            language: data.language,
                            createdBy: data.created_by,
                            isActive: data.is_active,
                            tags: data.tags
                        };
                        // Clear cache and regenerate
                        this.segmentCache.delete(segmentId);
                        this.cacheExpiry.delete(segmentId);
                        return [4 /*yield*/, this.generateSegment(criteria, { refreshData: true })];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_4 = _b.sent();
                        console.error('Error updating segment:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete segment
     */
    PatientSegmentation.prototype.deleteSegment = function (segmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('patient_segments')
                                .delete()
                                .eq('id', segmentId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to delete segment: ".concat(error.message));
                        }
                        // Clear cache
                        this.segmentCache.delete(segmentId);
                        this.cacheExpiry.delete(segmentId);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error deleting segment:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get segmentation analytics
     */
    PatientSegmentation.prototype.getAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var segments, totalSegments, totalPatients, averageSegmentSize_1, criteriaFrequency_1, mostCommonCriteria, segmentPerformance, trends, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getAllSegments()];
                    case 1:
                        segments = _a.sent();
                        totalSegments = segments.length;
                        totalPatients = segments.reduce(function (sum, segment) { return sum + segment.patientCount; }, 0);
                        averageSegmentSize_1 = totalSegments > 0 ? totalPatients / totalSegments : 0;
                        criteriaFrequency_1 = {};
                        segments.forEach(function (segment) {
                            var _a;
                            (_a = segment.criteria.tags) === null || _a === void 0 ? void 0 : _a.forEach(function (tag) {
                                criteriaFrequency_1[tag] = (criteriaFrequency_1[tag] || 0) + 1;
                            });
                        });
                        mostCommonCriteria = Object.entries(criteriaFrequency_1)
                            .sort(function (_a, _b) {
                            var a = _a[1];
                            var b = _b[1];
                            return b - a;
                        })
                            .slice(0, 5)
                            .map(function (_a) {
                            var criteria = _a[0];
                            return criteria;
                        });
                        segmentPerformance = {
                            highPerforming: segments.filter(function (s) { return s.performance.accuracy >= 0.8; }).length,
                            mediumPerforming: segments.filter(function (s) { return s.performance.accuracy >= 0.6 && s.performance.accuracy < 0.8; }).length,
                            lowPerforming: segments.filter(function (s) { return s.performance.accuracy < 0.6; }).length
                        };
                        trends = {
                            growingSegments: segments.filter(function (s) { return s.patientCount > averageSegmentSize_1; }).map(function (s) { return s.criteria.name; }),
                            shrinkingSegments: segments.filter(function (s) { return s.patientCount < averageSegmentSize_1 * 0.5; }).map(function (s) { return s.criteria.name; }),
                            stableSegments: segments.filter(function (s) {
                                return s.patientCount >= averageSegmentSize_1 * 0.5 && s.patientCount <= averageSegmentSize_1;
                            }).map(function (s) { return s.criteria.name; })
                        };
                        return [2 /*return*/, {
                                totalSegments: totalSegments,
                                totalPatients: totalPatients,
                                averageSegmentSize: Math.round(averageSegmentSize_1),
                                mostCommonCriteria: mostCommonCriteria,
                                segmentPerformance: segmentPerformance,
                                trends: trends
                            }];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error getting analytics:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PatientSegmentation;
}());
exports.PatientSegmentation = PatientSegmentation;
// Export singleton instance
exports.patientSegmentation = new PatientSegmentation(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
