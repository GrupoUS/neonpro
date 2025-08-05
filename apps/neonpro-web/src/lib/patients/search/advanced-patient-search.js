"use strict";
/**
 * Advanced Patient Search System with AI
 * Implements intelligent search, filtering, and segmentation
 * Part of Story 3.1 - Task 6: System Integration & Search
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
exports.AdvancedPatientSearch = void 0;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var AdvancedPatientSearch = /** @class */ (function () {
    function AdvancedPatientSearch() {
    }
    /**
     * Perform intelligent patient search with AI suggestions
     */
    AdvancedPatientSearch.searchPatients = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, filters, page, perPage) {
            var startTime, searchQuery, searchTerms, offset, _a, patients, error, count, suggestions, searchTime, error_1;
            if (filters === void 0) { filters = {}; }
            if (page === void 0) { page = 1; }
            if (perPage === void 0) { perPage = 20; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        searchQuery = client_1.supabase
                            .from('patients')
                            .select("\n          *,\n          patient_profiles_extended(*),\n          patient_photos(count),\n          appointments(count)\n        ", { count: 'exact' });
                        // Apply text search with AI-powered fuzzy matching
                        if (query.trim()) {
                            searchTerms = this.processSearchQuery(query);
                            searchQuery = this.applyTextSearch(searchQuery, searchTerms);
                        }
                        // Apply filters
                        searchQuery = this.applyFilters(searchQuery, filters);
                        offset = (page - 1) * perPage;
                        searchQuery = searchQuery
                            .range(offset, offset + perPage - 1)
                            .order('updated_at', { ascending: false });
                        return [4 /*yield*/, searchQuery];
                    case 2:
                        _a = _b.sent(), patients = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.generateSearchSuggestions(query, filters)];
                    case 3:
                        suggestions = _b.sent();
                        searchTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                patients: patients || [],
                                total_count: count || 0,
                                page: page,
                                per_page: perPage,
                                total_pages: Math.ceil((count || 0) / perPage),
                                search_time_ms: searchTime,
                                suggestions: suggestions,
                                applied_filters: filters
                            }];
                    case 4:
                        error_1 = _b.sent();
                        logger_1.logger.error('Error in patient search:', error_1);
                        throw new Error('Failed to search patients');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get quick access patient lookup for staff
     */
    AdvancedPatientSearch.quickPatientLookup = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, patients, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!query || query.length < 2)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select("\n          id, name, email, phone, date_of_birth,\n          patient_profiles_extended(risk_score)\n        ")
                                .or("\n          name.ilike.%".concat(query, "%,\n          email.ilike.%").concat(query, "%,\n          phone.ilike.%").concat(query, "%\n        "))
                                .limit(10)
                                .order('updated_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), patients = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, patients || []];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('Error in quick patient lookup:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create and manage patient segments
     */
    AdvancedPatientSearch.createPatientSegment = function (name, description, criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var searchResult, stats, segment, error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.searchPatients('', criteria, 1, 1)];
                    case 1:
                        searchResult = _a.sent();
                        return [4 /*yield*/, this.calculateSegmentStats(criteria)];
                    case 2:
                        stats = _a.sent();
                        segment = {
                            id: "segment_".concat(Date.now()),
                            name: name,
                            description: description,
                            criteria: criteria,
                            patient_count: searchResult.total_count,
                            avg_satisfaction: stats.avg_satisfaction,
                            avg_risk_score: stats.avg_risk_score,
                            last_updated: new Date().toISOString()
                        };
                        return [4 /*yield*/, client_1.supabase
                                .from('patient_segments')
                                .insert(segment)];
                    case 3:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        logger_1.logger.info("Created patient segment: ".concat(name, " with ").concat(segment.patient_count, " patients"));
                        return [2 /*return*/, segment];
                    case 4:
                        error_3 = _a.sent();
                        logger_1.logger.error('Error creating patient segment:', error_3);
                        throw new Error('Failed to create patient segment');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get predefined patient segments
     */
    AdvancedPatientSearch.getPredefinedSegments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var segments, _i, segments_1, segment, result, stats, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        segments = [
                            {
                                id: 'high_risk',
                                name: 'High Risk Patients',
                                description: 'Patients with high health risk scores requiring special attention',
                                criteria: { risk_level: 'high' },
                                patient_count: 0,
                                avg_satisfaction: 0,
                                avg_risk_score: 0,
                                last_updated: new Date().toISOString()
                            },
                            {
                                id: 'new_patients',
                                name: 'New Patients (Last 30 Days)',
                                description: 'Recently registered patients requiring onboarding',
                                criteria: {
                                    registration_date_range: {
                                        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                                        end: new Date().toISOString()
                                    }
                                },
                                patient_count: 0,
                                avg_satisfaction: 0,
                                avg_risk_score: 0,
                                last_updated: new Date().toISOString()
                            },
                            {
                                id: 'inactive_patients',
                                name: 'Inactive Patients',
                                description: 'Patients with no appointments in the last 6 months',
                                criteria: {
                                    last_appointment_range: {
                                        start: '2020-01-01',
                                        end: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
                                    }
                                },
                                patient_count: 0,
                                avg_satisfaction: 0,
                                avg_risk_score: 0,
                                last_updated: new Date().toISOString()
                            }
                        ];
                        _i = 0, segments_1 = segments;
                        _a.label = 1;
                    case 1:
                        if (!(_i < segments_1.length)) return [3 /*break*/, 7];
                        segment = segments_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.searchPatients('', segment.criteria, 1, 1)];
                    case 3:
                        result = _a.sent();
                        segment.patient_count = result.total_count;
                        return [4 /*yield*/, this.calculateSegmentStats(segment.criteria)];
                    case 4:
                        stats = _a.sent();
                        segment.avg_satisfaction = stats.avg_satisfaction;
                        segment.avg_risk_score = stats.avg_risk_score;
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        logger_1.logger.error("Error updating segment ".concat(segment.id, ":"), error_4);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, segments];
                }
            });
        });
    };
    /**
     * Process search query for AI-powered matching
     */
    AdvancedPatientSearch.processSearchQuery = function (query) {
        // Remove special characters and split into terms
        var cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ');
        var terms = cleanQuery.toLowerCase().split(/\s+/).filter(function (term) { return term.length > 1; });
        // Add fuzzy matching variations
        var expandedTerms = [];
        terms.forEach(function (term) {
            expandedTerms.push(term);
            // Add partial matches for names
            if (term.length > 3) {
                expandedTerms.push("".concat(term, "%"));
                expandedTerms.push("%".concat(term));
            }
        });
        return expandedTerms;
    };
    /**
     * Apply text search to query
     */
    AdvancedPatientSearch.applyTextSearch = function (query, searchTerms) {
        if (searchTerms.length === 0)
            return query;
        var searchConditions = searchTerms.map(function (term) {
            return "name.ilike.%".concat(term, "%,email.ilike.%").concat(term, "%,phone.ilike.%").concat(term, "%");
        }).join(',');
        return query.or(searchConditions);
    };
    /**
     * Apply filters to search query
     */
    AdvancedPatientSearch.applyFilters = function (query, filters) {
        if (filters.name) {
            query = query.ilike('name', "%".concat(filters.name, "%"));
        }
        if (filters.email) {
            query = query.ilike('email', "%".concat(filters.email, "%"));
        }
        if (filters.phone) {
            query = query.ilike('phone', "%".concat(filters.phone, "%"));
        }
        if (filters.gender) {
            query = query.eq('gender', filters.gender);
        }
        if (filters.city) {
            query = query.ilike('city', "%".concat(filters.city, "%"));
        }
        if (filters.age_range) {
            var currentYear = new Date().getFullYear();
            var maxBirthYear = currentYear - filters.age_range.min;
            var minBirthYear = currentYear - filters.age_range.max;
            query = query
                .gte('date_of_birth', "".concat(minBirthYear, "-01-01"))
                .lte('date_of_birth', "".concat(maxBirthYear, "-12-31"));
        }
        if (filters.registration_date_range) {
            query = query
                .gte('created_at', filters.registration_date_range.start)
                .lte('created_at', filters.registration_date_range.end);
        }
        if (filters.has_photo !== undefined) {
            if (filters.has_photo) {
                query = query.not('patient_photos', 'is', null);
            }
            else {
                query = query.is('patient_photos', null);
            }
        }
        return query;
    };
    /**
     * Generate AI-powered search suggestions
     */
    AdvancedPatientSearch.generateSearchSuggestions = function (query, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions, popularNames, services, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        suggestions = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, client_1.supabase
                                .from('patients')
                                .select('name')
                                .ilike('name', "%".concat(query, "%"))
                                .limit(5)];
                    case 2:
                        popularNames = (_a.sent()).data;
                        popularNames === null || popularNames === void 0 ? void 0 : popularNames.forEach(function (patient) {
                            suggestions.push({
                                type: 'patient',
                                value: patient.name,
                                label: "Patient: ".concat(patient.name),
                                count: 1,
                                relevance_score: 0.9
                            });
                        });
                        return [4 /*yield*/, client_1.supabase
                                .from('services')
                                .select('name, id')
                                .ilike('name', "%".concat(query, "%"))
                                .limit(3)];
                    case 3:
                        services = (_a.sent()).data;
                        services === null || services === void 0 ? void 0 : services.forEach(function (service) {
                            suggestions.push({
                                type: 'service',
                                value: service.id,
                                label: "Service: ".concat(service.name),
                                count: 1,
                                relevance_score: 0.7
                            });
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        logger_1.logger.error('Error generating search suggestions:', error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, suggestions.sort(function (a, b) { return b.relevance_score - a.relevance_score; })];
                }
            });
        });
    };
    /**
     * Calculate statistics for a patient segment
     */
    AdvancedPatientSearch.calculateSegmentStats = function (criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, client_1.supabase
                                .rpc('calculate_segment_stats', { filter_criteria: criteria })];
                    case 1:
                        stats = (_a.sent()).data;
                        return [2 /*return*/, {
                                avg_satisfaction: (stats === null || stats === void 0 ? void 0 : stats.avg_satisfaction) || 0,
                                avg_risk_score: (stats === null || stats === void 0 ? void 0 : stats.avg_risk_score) || 0
                            }];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('Error calculating segment stats:', error_6);
                        return [2 /*return*/, {
                                avg_satisfaction: 0,
                                avg_risk_score: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AdvancedPatientSearch;
}());
exports.AdvancedPatientSearch = AdvancedPatientSearch;
exports.default = AdvancedPatientSearch;
