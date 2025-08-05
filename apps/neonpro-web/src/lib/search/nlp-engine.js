"use strict";
/**
 * NLP Search Engine Core
 *
 * Provides natural language processing capabilities for conversational patient search.
 * Supports intent detection, entity extraction, and query normalization.
 *
 * @module nlp-engine
 * @version 1.0.0
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
exports.nlpSearchEngine = exports.NLPSearchEngine = void 0;
/**
 * Natural Language Processing Search Engine
 *
 * Converts natural language queries into structured search parameters
 * and provides intelligent suggestions and context-aware results.
 */
var NLPSearchEngine = /** @class */ (function () {
    function NLPSearchEngine() {
        this.intentPatterns = new Map();
        this.entityPatterns = new Map();
        this.synonyms = new Map();
        this.stopWords = new Set();
        this.initializePatterns();
        this.initializeEntityPatterns();
        this.initializeSynonyms();
        this.initializeStopWords();
    }
    /**
     * Process natural language query into structured search parameters
     */
    NLPSearchEngine.prototype.processQuery = function (query, context) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedQuery, intent, entities, filters, suggestions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        normalizedQuery = this.normalizeQuery(query);
                        intent = this.extractIntent(normalizedQuery);
                        entities = this.extractEntities(normalizedQuery);
                        filters = this.entitiesToFilters(entities, context);
                        return [4 /*yield*/, this.generateSuggestions(normalizedQuery, context)];
                    case 1:
                        suggestions = _a.sent();
                        return [2 /*return*/, {
                                originalQuery: query,
                                normalizedQuery: normalizedQuery,
                                intent: intent,
                                entities: entities,
                                filters: filters,
                                suggestions: suggestions
                            }];
                }
            });
        });
    };
    /**
     * Normalize query text for better processing
     */
    NLPSearchEngine.prototype.normalizeQuery = function (query) {
        return query
            .toLowerCase()
            .trim()
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Handle common contractions
            .replace(/can't/g, 'cannot')
            .replace(/won't/g, 'will not')
            .replace(/n't/g, ' not')
            // Remove punctuation except for important ones
            .replace(/[^\w\s\-\.]/g, ' ')
            .trim();
    };
    /**
     * Extract user intent from the query
     */
    NLPSearchEngine.prototype.extractIntent = function (query) {
        // Default intent
        var intent = {
            action: 'find',
            target: 'patient',
            confidence: 0.5,
            modifiers: []
        };
        // Action detection patterns
        var actionPatterns = {
            find: /\b(find|search|look|locate|get)\b/i,
            list: /\b(list|show all|display|enumerate)\b/i,
            show: /\b(show|display|view|open)\b/i,
            filter: /\b(filter|where|with|having)\b/i,
            count: /\b(count|how many|number of)\b/i
        };
        // Target detection patterns
        var targetPatterns = {
            patient: /\b(patient|person|people|individual|client)\b/i,
            appointment: /\b(appointment|booking|schedule|visit)\b/i,
            treatment: /\b(treatment|therapy|procedure|service)\b/i,
            procedure: /\b(procedure|operation|surgery|intervention)\b/i,
            record: /\b(record|history|file|document)\b/i
        };
        // Detect action
        for (var _i = 0, _a = Object.entries(actionPatterns); _i < _a.length; _i++) {
            var _b = _a[_i], action = _b[0], pattern = _b[1];
            if (pattern.test(query)) {
                intent.action = action;
                intent.confidence = Math.min(intent.confidence + 0.2, 0.9);
                break;
            }
        }
        // Detect target
        for (var _c = 0, _d = Object.entries(targetPatterns); _c < _d.length; _c++) {
            var _e = _d[_c], target = _e[0], pattern = _e[1];
            if (pattern.test(query)) {
                intent.target = target;
                intent.confidence = Math.min(intent.confidence + 0.2, 0.9);
                break;
            }
        }
        // Detect modifiers
        var modifierPatterns = {
            recent: /\b(recent|latest|new|current)\b/i,
            urgent: /\b(urgent|emergency|critical|priority)\b/i,
            completed: /\b(completed|finished|done)\b/i,
            pending: /\b(pending|waiting|scheduled)\b/i,
            cancelled: /\b(cancelled|canceled|aborted)\b/i
        };
        for (var _f = 0, _g = Object.entries(modifierPatterns); _f < _g.length; _f++) {
            var _h = _g[_f], modifier = _h[0], pattern = _h[1];
            if (pattern.test(query)) {
                intent.modifiers.push(modifier);
                intent.confidence = Math.min(intent.confidence + 0.1, 0.95);
            }
        }
        return intent;
    };
    /**
     * Extract entities (names, dates, conditions, etc.) from query
     */
    NLPSearchEngine.prototype.extractEntities = function (query) {
        var entities = [];
        // Name patterns (simple heuristic)
        var namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
        var nameMatch;
        while ((nameMatch = namePattern.exec(query)) !== null) {
            // Skip common words that might be capitalized
            if (!this.isCommonWord(nameMatch[1])) {
                entities.push({
                    type: 'person',
                    value: nameMatch[1],
                    confidence: 0.7,
                    startIndex: nameMatch.index,
                    endIndex: nameMatch.index + nameMatch[1].length
                });
            }
        }
        // Date patterns
        var datePatterns = [
            { pattern: /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g, confidence: 0.9 },
            { pattern: /\b(\d{4}-\d{1,2}-\d{1,2})\b/g, confidence: 0.9 },
            { pattern: /\b(today|yesterday|tomorrow)\b/g, confidence: 0.8 },
            { pattern: /\b(this week|last week|next week)\b/g, confidence: 0.7 },
            { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b/gi, confidence: 0.8 }
        ];
        for (var _i = 0, datePatterns_1 = datePatterns; _i < datePatterns_1.length; _i++) {
            var _a = datePatterns_1[_i], pattern = _a.pattern, confidence = _a.confidence;
            var dateMatch = void 0;
            while ((dateMatch = pattern.exec(query)) !== null) {
                entities.push({
                    type: 'date',
                    value: dateMatch[1],
                    confidence: confidence,
                    startIndex: dateMatch.index,
                    endIndex: dateMatch.index + dateMatch[1].length
                });
            }
        }
        // Age patterns
        var agePattern = /\b(\d{1,3})\s*(?:years?\s*old|yo|age)\b/gi;
        var ageMatch;
        while ((ageMatch = agePattern.exec(query)) !== null) {
            entities.push({
                type: 'age',
                value: ageMatch[1],
                confidence: 0.8,
                startIndex: ageMatch.index,
                endIndex: ageMatch.index + ageMatch[0].length
            });
        }
        // Medical condition patterns (basic set)
        var conditionKeywords = [
            'diabetes', 'hypertension', 'obesity', 'depression', 'anxiety',
            'arthritis', 'asthma', 'allergies', 'migraine', 'insomnia',
            'acne', 'eczema', 'psoriasis', 'dermatitis', 'rosacea'
        ];
        for (var _b = 0, conditionKeywords_1 = conditionKeywords; _b < conditionKeywords_1.length; _b++) {
            var condition = conditionKeywords_1[_b];
            var pattern = new RegExp("\\b".concat(condition, "\\b"), 'gi');
            var conditionMatch = void 0;
            while ((conditionMatch = pattern.exec(query)) !== null) {
                entities.push({
                    type: 'condition',
                    value: condition,
                    confidence: 0.8,
                    startIndex: conditionMatch.index,
                    endIndex: conditionMatch.index + condition.length
                });
            }
        }
        // Procedure patterns (aesthetic/beauty focused)
        var procedureKeywords = [
            'botox', 'fillers', 'laser', 'peeling', 'facial', 'massage',
            'microagulhamento', 'limpeza', 'hidratação', 'radiofrequência',
            'criolipólise', 'depilação', 'toxina', 'preenchimento'
        ];
        for (var _c = 0, procedureKeywords_1 = procedureKeywords; _c < procedureKeywords_1.length; _c++) {
            var procedure = procedureKeywords_1[_c];
            var pattern = new RegExp("\\b".concat(procedure, "\\b"), 'gi');
            var procedureMatch = void 0;
            while ((procedureMatch = pattern.exec(query)) !== null) {
                entities.push({
                    type: 'procedure',
                    value: procedure,
                    confidence: 0.8,
                    startIndex: procedureMatch.index,
                    endIndex: procedureMatch.index + procedure.length
                });
            }
        }
        // Remove overlapping entities (keep higher confidence)
        return this.removeOverlappingEntities(entities);
    };
    /**
     * Convert extracted entities to database filters
     */
    NLPSearchEngine.prototype.entitiesToFilters = function (entities, context) {
        var filters = {};
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var entity = entities_1[_i];
            switch (entity.type) {
                case 'person':
                    // Search in name fields
                    filters.name = {
                        contains: entity.value,
                        mode: 'insensitive'
                    };
                    break;
                case 'date':
                    // Parse and convert to date range
                    var date = this.parseDate(entity.value);
                    if (date) {
                        filters.createdAt = {
                            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                        };
                    }
                    break;
                case 'age':
                    var age = parseInt(entity.value);
                    filters.birthDate = {
                        gte: new Date(new Date().getFullYear() - age - 1, 0, 1),
                        lte: new Date(new Date().getFullYear() - age, 11, 31)
                    };
                    break;
                case 'condition':
                    filters.medicalHistory = {
                        some: {
                            condition: {
                                contains: entity.value,
                                mode: 'insensitive'
                            }
                        }
                    };
                    break;
                case 'procedure':
                    filters.treatments = {
                        some: {
                            procedureName: {
                                contains: entity.value,
                                mode: 'insensitive'
                            }
                        }
                    };
                    break;
                case 'specialty':
                    filters.preferredSpecialty = {
                        equals: entity.value
                    };
                    break;
            }
        }
        // Add contextual filters if available
        if (context === null || context === void 0 ? void 0 : context.contextualFilters) {
            Object.assign(filters, context.contextualFilters);
        }
        return filters;
    };
    /**
     * Generate search suggestions based on query and context
     */
    NLPSearchEngine.prototype.generateSuggestions = function (query, context) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions, relevantSearches, commonPatterns, relevantPatterns;
            return __generator(this, function (_a) {
                suggestions = [];
                // Add recent searches as suggestions
                if (context === null || context === void 0 ? void 0 : context.recentSearches) {
                    relevantSearches = context.recentSearches
                        .filter(function (search) { return search.toLowerCase().includes(query.toLowerCase()); })
                        .slice(0, 3);
                    suggestions.push.apply(suggestions, relevantSearches);
                }
                commonPatterns = [
                    'pacientes com diabetes',
                    'agendamentos hoje',
                    'tratamentos de botox',
                    'pacientes novos esta semana',
                    'procedimentos pendentes',
                    'histórico de alergias'
                ];
                relevantPatterns = commonPatterns
                    .filter(function (pattern) {
                    return pattern.toLowerCase().includes(query.toLowerCase()) ||
                        query.toLowerCase().includes(pattern.toLowerCase());
                })
                    .slice(0, 2);
                suggestions.push.apply(suggestions, relevantPatterns);
                // Remove duplicates and limit to 5 suggestions
                return [2 /*return*/, Array.from(new Set(suggestions)).slice(0, 5)];
            });
        });
    };
    /**
     * Parse natural language date to Date object
     */
    NLPSearchEngine.prototype.parseDate = function (dateString) {
        var today = new Date();
        // Handle relative dates
        switch (dateString.toLowerCase()) {
            case 'today':
                return today;
            case 'yesterday':
                return new Date(today.getTime() - 24 * 60 * 60 * 1000);
            case 'tomorrow':
                return new Date(today.getTime() + 24 * 60 * 60 * 1000);
            case 'this week':
                var startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                return startOfWeek;
            case 'last week':
                var lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7 - today.getDay());
                return lastWeek;
            case 'next week':
                var nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7 - today.getDay());
                return nextWeek;
        }
        // Try to parse standard date formats
        var date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };
    /**
     * Check if a word is a common word that shouldn't be treated as a name
     */
    NLPSearchEngine.prototype.isCommonWord = function (word) {
        var commonWords = new Set([
            'Today', 'Yesterday', 'Tomorrow', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday', 'Sunday', 'January', 'February',
            'March', 'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December', 'Patient', 'Doctor', 'Nurse',
            'Treatment', 'Procedure', 'Appointment', 'Schedule', 'History'
        ]);
        return commonWords.has(word) || this.stopWords.has(word.toLowerCase());
    };
    /**
     * Remove overlapping entities, keeping the one with higher confidence
     */
    NLPSearchEngine.prototype.removeOverlappingEntities = function (entities) {
        var sorted = entities.sort(function (a, b) { return b.confidence - a.confidence; });
        var result = [];
        var _loop_1 = function (entity) {
            var hasOverlap = result.some(function (existing) {
                return (entity.startIndex >= existing.startIndex && entity.startIndex < existing.endIndex) ||
                    (entity.endIndex > existing.startIndex && entity.endIndex <= existing.endIndex) ||
                    (entity.startIndex <= existing.startIndex && entity.endIndex >= existing.endIndex);
            });
            if (!hasOverlap) {
                result.push(entity);
            }
        };
        for (var _i = 0, sorted_1 = sorted; _i < sorted_1.length; _i++) {
            var entity = sorted_1[_i];
            _loop_1(entity);
        }
        return result.sort(function (a, b) { return a.startIndex - b.startIndex; });
    };
    /**
     * Initialize intent patterns
     */
    NLPSearchEngine.prototype.initializePatterns = function () {
        this.intentPatterns = new Map();
        // Patterns are defined in the extractIntent method for better readability
    };
    /**
     * Initialize entity recognition patterns
     */
    NLPSearchEngine.prototype.initializeEntityPatterns = function () {
        this.entityPatterns = new Map();
        // Patterns are defined in the extractEntities method for better readability
    };
    /**
     * Initialize synonym mapping
     */
    NLPSearchEngine.prototype.initializeSynonyms = function () {
        this.synonyms = new Map([
            ['paciente', ['cliente', 'pessoa', 'individual']],
            ['agendamento', ['consulta', 'visita', 'appointment']],
            ['tratamento', ['procedimento', 'terapia', 'serviço']],
            ['histórico', ['histórico médico', 'prontuário', 'ficha']],
            ['alergia', ['alergias', 'reação alérgica', 'sensibilidade']],
            ['medicamento', ['remédio', 'medicação', 'fármaco']]
        ]);
    };
    /**
     * Initialize stop words
     */
    NLPSearchEngine.prototype.initializeStopWords = function () {
        this.stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'were', 'will', 'with', 'o', 'a', 'os', 'as', 'um',
            'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos',
            'nas', 'por', 'para', 'com', 'sem', 'sob', 'sobre', 'ante', 'após'
        ]);
    };
    return NLPSearchEngine;
}());
exports.NLPSearchEngine = NLPSearchEngine;
// Export singleton instance
exports.nlpSearchEngine = new NLPSearchEngine();
