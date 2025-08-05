"use strict";
/**
 * Comprehensive Data Search System
 * Story 3.4: Smart Search + NLP Integration - Task 2
 * Unified search across all clinic data types
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
exports.comprehensiveSearch = exports.ComprehensiveSearch = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var search_indexer_1 = require("./search-indexer");
var nlp_engine_1 = require("./nlp-engine");
/**
 * Comprehensive Data Search System
 * Provides unified search across all clinic data
 */
var ComprehensiveSearch = /** @class */ (function () {
    function ComprehensiveSearch(supabaseUrl, supabaseKey) {
        this.searchableTypes = new Map();
        if (supabaseUrl && supabaseKey) {
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        }
        this.initializeSearchableTypes();
    }
    /**
     * Initialize searchable data types configuration
     */
    ComprehensiveSearch.prototype.initializeSearchableTypes = function () {
        // Patient data
        this.searchableTypes.set('patient', {
            type: 'patient',
            table: 'patients',
            searchFields: ['name', 'email', 'phone', 'cpf', 'address', 'notes'],
            displayFields: ['id', 'name', 'email', 'phone', 'birth_date', 'created_at'],
            weight: 1.5,
            filters: { active: true }
        });
        // Appointment data
        this.searchableTypes.set('appointment', {
            type: 'appointment',
            table: 'appointments',
            searchFields: ['notes', 'reason', 'diagnosis', 'treatment_plan'],
            displayFields: ['id', 'patient_id', 'provider_id', 'scheduled_at', 'status', 'reason'],
            joinTables: [
                {
                    table: 'patients',
                    on: 'appointments.patient_id = patients.id',
                    fields: ['name as patient_name']
                },
                {
                    table: 'providers',
                    on: 'appointments.provider_id = providers.id',
                    fields: ['name as provider_name']
                }
            ],
            weight: 1.3
        });
        // Treatment data
        this.searchableTypes.set('treatment', {
            type: 'treatment',
            table: 'treatments',
            searchFields: ['name', 'description', 'instructions', 'notes'],
            displayFields: ['id', 'name', 'description', 'duration', 'cost', 'created_at'],
            weight: 1.2
        });
        // Clinical notes
        this.searchableTypes.set('note', {
            type: 'note',
            table: 'clinical_notes',
            searchFields: ['content', 'title', 'tags'],
            displayFields: ['id', 'title', 'content', 'patient_id', 'provider_id', 'created_at'],
            joinTables: [
                {
                    table: 'patients',
                    on: 'clinical_notes.patient_id = patients.id',
                    fields: ['name as patient_name']
                }
            ],
            weight: 1.1
        });
        // File attachments
        this.searchableTypes.set('file', {
            type: 'file',
            table: 'file_attachments',
            searchFields: ['filename', 'description', 'tags', 'extracted_text'],
            displayFields: ['id', 'filename', 'file_type', 'file_size', 'uploaded_at'],
            weight: 1.0
        });
        // Healthcare providers
        this.searchableTypes.set('provider', {
            type: 'provider',
            table: 'providers',
            searchFields: ['name', 'specialization', 'bio', 'qualifications'],
            displayFields: ['id', 'name', 'specialization', 'email', 'phone'],
            weight: 1.1,
            filters: { active: true }
        });
        // Medications
        this.searchableTypes.set('medication', {
            type: 'medication',
            table: 'medications',
            searchFields: ['name', 'generic_name', 'description', 'indications', 'contraindications'],
            displayFields: ['id', 'name', 'generic_name', 'dosage', 'form', 'manufacturer'],
            weight: 1.0
        });
        // Diagnoses
        this.searchableTypes.set('diagnosis', {
            type: 'diagnosis',
            table: 'diagnoses',
            searchFields: ['name', 'description', 'icd_code', 'symptoms'],
            displayFields: ['id', 'name', 'icd_code', 'description', 'severity'],
            weight: 1.2
        });
    };
    /**
     * Perform comprehensive search across all data types
     */
    ComprehensiveSearch.prototype.search = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, query_1, _a, language, dataTypes, dateRange_1, _b, filters_1, _c, sortBy, _d, sortOrder, _e, limit_1, _f, offset, _g, includeArchived_1, _h, fuzzySearch_1, _j, exactMatch_1, nlpResult_1, typesToSearch_1, searchPromises, searchResults, allResults, rankedResults, paginatedResults, enhancedResults, stats, suggestions, relatedSearches, processingTime, error_1;
            var _this = this;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        startTime = Date.now();
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 7, , 8]);
                        query_1 = options.query, _a = options.language, language = _a === void 0 ? 'pt' : _a, dataTypes = options.dataTypes, dateRange_1 = options.dateRange, _b = options.filters, filters_1 = _b === void 0 ? {} : _b, _c = options.sortBy, sortBy = _c === void 0 ? 'relevance' : _c, _d = options.sortOrder, sortOrder = _d === void 0 ? 'desc' : _d, _e = options.limit, limit_1 = _e === void 0 ? 50 : _e, _f = options.offset, offset = _f === void 0 ? 0 : _f, _g = options.includeArchived, includeArchived_1 = _g === void 0 ? false : _g, _h = options.fuzzySearch, fuzzySearch_1 = _h === void 0 ? true : _h, _j = options.exactMatch, exactMatch_1 = _j === void 0 ? false : _j;
                        return [4 /*yield*/, nlp_engine_1.nlpEngine.processQuery(query_1, language)];
                    case 2:
                        nlpResult_1 = _k.sent();
                        typesToSearch_1 = dataTypes || Array.from(this.searchableTypes.keys());
                        searchPromises = typesToSearch_1.map(function (type) {
                            return _this.searchDataType(type, {
                                query: query_1,
                                nlpResult: nlpResult_1,
                                dateRange: dateRange_1,
                                filters: filters_1,
                                includeArchived: includeArchived_1,
                                fuzzySearch: fuzzySearch_1,
                                exactMatch: exactMatch_1,
                                limit: Math.ceil(limit_1 / typesToSearch_1.length)
                            });
                        });
                        return [4 /*yield*/, Promise.all(searchPromises)];
                    case 3:
                        searchResults = _k.sent();
                        allResults = searchResults.flat();
                        rankedResults = this.rankResults(allResults, nlpResult_1, sortBy, sortOrder);
                        paginatedResults = rankedResults.slice(offset, offset + limit_1);
                        return [4 /*yield*/, this.enhanceWithRelatedData(paginatedResults)];
                    case 4:
                        enhancedResults = _k.sent();
                        stats = this.calculateSearchStats(allResults, nlpResult_1);
                        return [4 /*yield*/, this.getSuggestions(query_1, nlpResult_1, language)];
                    case 5:
                        suggestions = _k.sent();
                        return [4 /*yield*/, this.getRelatedSearches(query_1, language)];
                    case 6:
                        relatedSearches = _k.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                results: enhancedResults,
                                totalCount: allResults.length,
                                processingTime: processingTime,
                                searchStats: stats,
                                suggestions: suggestions,
                                relatedSearches: relatedSearches
                            }];
                    case 7:
                        error_1 = _k.sent();
                        console.error('Comprehensive search error:', error_1);
                        return [2 /*return*/, {
                                results: [],
                                totalCount: 0,
                                processingTime: Date.now() - startTime,
                                searchStats: {
                                    byType: {},
                                    avgRelevance: 0,
                                    nlpConfidence: 0
                                }
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search specific data type
     */
    ComprehensiveSearch.prototype.searchDataType = function (dataType, options) {
        return __awaiter(this, void 0, void 0, function () {
            var config, query, searchConditions, _a, data, error, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        config = this.searchableTypes.get(dataType);
                        if (!config || !this.supabase) {
                            return [2 /*return*/, []];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        query = this.supabase.from(config.table).select(this.buildSelectClause(config));
                        searchConditions = this.buildSearchConditions(config, options.query, options.nlpResult, options.fuzzySearch, options.exactMatch);
                        if (searchConditions) {
                            query = query.or(searchConditions);
                        }
                        // Apply filters
                        query = this.applyFilters(query, config, options.filters, options.includeArchived);
                        // Apply date range
                        if (options.dateRange) {
                            query = this.applyDateRange(query, options.dateRange);
                        }
                        return [4 /*yield*/, query.limit(options.limit)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error("Search error for ".concat(dataType, ":"), error);
                            return [2 /*return*/, []];
                        }
                        // Transform results
                        return [2 /*return*/, (data || []).map(function (item) { return _this.transformResult(item, config, options.nlpResult); })];
                    case 3:
                        error_2 = _b.sent();
                        console.error("Error searching ".concat(dataType, ":"), error_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Build SELECT clause with joins
     */
    ComprehensiveSearch.prototype.buildSelectClause = function (config) {
        var selectFields = config.displayFields.map(function (field) {
            return field.includes(' as ') ? field : "".concat(config.table, ".").concat(field);
        });
        if (config.joinTables) {
            config.joinTables.forEach(function (join) {
                selectFields = selectFields.concat(join.fields);
            });
        }
        return selectFields.join(', ');
    };
    /**
     * Build search conditions
     */
    ComprehensiveSearch.prototype.buildSearchConditions = function (config, query, nlpResult, fuzzySearch, exactMatch) {
        var conditions = [];
        var searchTerms = exactMatch ? [query] : __spreadArray([query], nlpResult.tokens, true);
        config.searchFields.forEach(function (field) {
            searchTerms.forEach(function (term) {
                if (exactMatch) {
                    conditions.push("".concat(field, ".eq.\"").concat(term, "\""));
                }
                else if (fuzzySearch) {
                    conditions.push("".concat(field, ".ilike.\"%").concat(term, "%\""));
                }
                else {
                    conditions.push("".concat(field, ".like.\"%").concat(term, "%\""));
                }
            });
        });
        // Add entity-based searches
        nlpResult.entities.forEach(function (entity) {
            config.searchFields.forEach(function (field) {
                conditions.push("".concat(field, ".ilike.\"%").concat(entity.value, "%\""));
            });
        });
        return conditions.join(',');
    };
    /**
     * Apply filters to query
     */
    ComprehensiveSearch.prototype.applyFilters = function (query, config, filters, includeArchived) {
        // Apply default filters
        if (config.filters) {
            Object.entries(config.filters).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                query = query.eq(key, value);
            });
        }
        // Apply custom filters
        Object.entries(filters).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (Array.isArray(value)) {
                query = query.in(key, value);
            }
            else {
                query = query.eq(key, value);
            }
        });
        // Handle archived records
        if (!includeArchived && config.table !== 'file_attachments') {
            query = query.neq('archived', true);
        }
        return query;
    };
    /**
     * Apply date range filter
     */
    ComprehensiveSearch.prototype.applyDateRange = function (query, dateRange) {
        var dateField = dateRange.field || 'created_at';
        if (dateRange.start) {
            query = query.gte(dateField, dateRange.start);
        }
        if (dateRange.end) {
            query = query.lte(dateField, dateRange.end);
        }
        return query;
    };
    /**
     * Transform database result to SearchResult
     */
    ComprehensiveSearch.prototype.transformResult = function (item, config, nlpResult) {
        // Calculate relevance score
        var relevanceScore = this.calculateRelevanceScore(item, config, nlpResult);
        // Generate title and description
        var _a = this.generateTitleAndDescription(item, config), title = _a.title, description = _a.description;
        // Find matched fields
        var matchedFields = this.findMatchedFields(item, config, nlpResult);
        // Generate highlighted text
        var highlightedText = this.generateHighlightedText(item, config, nlpResult);
        return {
            id: item.id,
            type: config.type,
            title: title,
            description: description,
            relevanceScore: relevanceScore,
            matchedFields: matchedFields,
            highlightedText: highlightedText,
            metadata: __assign(__assign({}, item), { dataType: config.type, table: config.table }),
            lastModified: item.updated_at || item.created_at,
            url: this.generateResultUrl(config.type, item.id)
        };
    };
    /**
     * Calculate relevance score for result
     */
    ComprehensiveSearch.prototype.calculateRelevanceScore = function (item, config, nlpResult) {
        var score = config.weight;
        // Boost score based on NLP confidence
        score *= (0.5 + nlpResult.confidence * 0.5);
        // Boost for exact matches
        var searchText = config.searchFields
            .map(function (field) { return item[field] || ''; })
            .join(' ')
            .toLowerCase();
        if (searchText.includes(nlpResult.normalized.toLowerCase())) {
            score *= 1.5;
        }
        // Boost for entity matches
        nlpResult.entities.forEach(function (entity) {
            if (searchText.includes(entity.value.toLowerCase())) {
                score *= 1.2;
            }
        });
        // Boost for recent items
        var lastModified = new Date(item.updated_at || item.created_at);
        var daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceModified < 7) {
            score *= 1.3;
        }
        else if (daysSinceModified < 30) {
            score *= 1.1;
        }
        return Math.round(score * 100) / 100;
    };
    /**
     * Generate title and description for result
     */
    ComprehensiveSearch.prototype.generateTitleAndDescription = function (item, config) {
        var title = '';
        var description = '';
        switch (config.type) {
            case 'patient':
                title = item.name || 'Paciente';
                description = "".concat(item.email || '', " \u2022 ").concat(item.phone || '');
                break;
            case 'appointment':
                title = "Consulta - ".concat(item.patient_name || 'Paciente');
                description = "".concat(item.reason || '', " \u2022 ").concat(new Date(item.scheduled_at).toLocaleDateString());
                break;
            case 'treatment':
                title = item.name || 'Tratamento';
                description = item.description || '';
                break;
            case 'note':
                title = item.title || 'Anotação Clínica';
                description = (item.content || '').substring(0, 150) + '...';
                break;
            case 'file':
                title = item.filename || 'Arquivo';
                description = "".concat(item.file_type || '', " \u2022 ").concat(this.formatFileSize(item.file_size));
                break;
            case 'provider':
                title = item.name || 'Profissional';
                description = "".concat(item.specialization || '', " \u2022 ").concat(item.email || '');
                break;
            case 'medication':
                title = item.name || 'Medicamento';
                description = "".concat(item.generic_name || '', " \u2022 ").concat(item.dosage || '');
                break;
            case 'diagnosis':
                title = item.name || 'Diagnóstico';
                description = "".concat(item.icd_code || '', " \u2022 ").concat(item.description || '');
                break;
            default:
                title = item.name || item.title || "".concat(config.type, " #").concat(item.id);
                description = item.description || '';
        }
        return { title: title, description: description };
    };
    /**
     * Find matched fields in result
     */
    ComprehensiveSearch.prototype.findMatchedFields = function (item, config, nlpResult) {
        var matchedFields = [];
        var searchTerms = __spreadArray([nlpResult.normalized], nlpResult.tokens, true);
        config.searchFields.forEach(function (field) {
            var fieldValue = (item[field] || '').toLowerCase();
            searchTerms.forEach(function (term) {
                if (fieldValue.includes(term.toLowerCase())) {
                    matchedFields.push(field);
                }
            });
        });
        return __spreadArray([], new Set(matchedFields), true);
    };
    /**
     * Generate highlighted text
     */
    ComprehensiveSearch.prototype.generateHighlightedText = function (item, config, nlpResult) {
        var searchTerms = __spreadArray([nlpResult.normalized], nlpResult.tokens, true);
        var text = config.searchFields
            .map(function (field) { return item[field] || ''; })
            .join(' ')
            .substring(0, 200);
        // Highlight search terms
        searchTerms.forEach(function (term) {
            var regex = new RegExp("(".concat(term, ")"), 'gi');
            text = text.replace(regex, '<mark>$1</mark>');
        });
        return text;
    };
    /**
     * Generate URL for result
     */
    ComprehensiveSearch.prototype.generateResultUrl = function (type, id) {
        var baseUrls = {
            patient: '/patients',
            appointment: '/appointments',
            treatment: '/treatments',
            note: '/notes',
            file: '/files',
            provider: '/providers',
            medication: '/medications',
            diagnosis: '/diagnoses'
        };
        return "".concat(baseUrls[type] || '/', "/").concat(id);
    };
    /**
     * Format file size
     */
    ComprehensiveSearch.prototype.formatFileSize = function (bytes) {
        if (!bytes)
            return '0 B';
        var k = 1024;
        var sizes = ['B', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    /**
     * Rank search results
     */
    ComprehensiveSearch.prototype.rankResults = function (results, nlpResult, sortBy, sortOrder) {
        return results.sort(function (a, b) {
            var comparison = 0;
            switch (sortBy) {
                case 'relevance':
                    comparison = b.relevanceScore - a.relevanceScore;
                    break;
                case 'date':
                    comparison = new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
                    break;
                case 'alphabetical':
                    comparison = a.title.localeCompare(b.title);
                    break;
            }
            return sortOrder === 'desc' ? comparison : -comparison;
        });
    };
    /**
     * Enhance results with related data
     */
    ComprehensiveSearch.prototype.enhanceWithRelatedData = function (results) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement related data enhancement
                // This could include:
                // - Related patients for appointments
                // - Related appointments for patients
                // - Related files for notes
                // - etc.
                return [2 /*return*/, results];
            });
        });
    };
    /**
     * Calculate search statistics
     */
    ComprehensiveSearch.prototype.calculateSearchStats = function (results, nlpResult) {
        var byType = {};
        var totalRelevance = 0;
        results.forEach(function (result) {
            byType[result.type] = (byType[result.type] || 0) + 1;
            totalRelevance += result.relevanceScore;
        });
        return {
            byType: byType,
            avgRelevance: results.length > 0 ? totalRelevance / results.length : 0,
            nlpConfidence: nlpResult.confidence
        };
    };
    /**
     * Get search suggestions
     */
    ComprehensiveSearch.prototype.getSuggestions = function (query, nlpResult, language) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Use the search indexer for suggestions
                return [2 /*return*/, search_indexer_1.searchIndexer.getSuggestions(query, language, 5)];
            });
        });
    };
    /**
     * Get related searches
     */
    ComprehensiveSearch.prototype.getRelatedSearches = function (query, language) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.supabase) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('search_analytics')
                                .select('query')
                                .ilike('query', "%".concat(query, "%"))
                                .neq('query', query)
                                .order('created_at', { ascending: false })
                                .limit(5)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error getting related searches:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.map(function (item) { return item.query; })) || []];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error in getRelatedSearches:', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Index content for comprehensive search
     */
    ComprehensiveSearch.prototype.indexContent = function (type, contentId, searchableText, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, search_indexer_1.searchIndexer.indexContent({
                            contentType: type,
                            contentId: contentId,
                            searchableText: searchableText,
                            metadata: metadata,
                            language: 'pt'
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove content from index
     */
    ComprehensiveSearch.prototype.removeFromIndex = function (type, contentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, search_indexer_1.searchIndexer.removeFromIndex(type, contentId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get search statistics
     */
    ComprehensiveSearch.prototype.getSearchableTypes = function () {
        return Array.from(this.searchableTypes.keys());
    };
    return ComprehensiveSearch;
}());
exports.ComprehensiveSearch = ComprehensiveSearch;
// Export singleton instance
exports.comprehensiveSearch = new ComprehensiveSearch(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
