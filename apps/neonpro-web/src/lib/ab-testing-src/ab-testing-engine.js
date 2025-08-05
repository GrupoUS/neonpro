"use strict";
/**
 * A/B Testing Engine
 * NeonPro - Sistema Completo de Testes A/B para Comunicação
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
exports.abTestingEngine = exports.ABTestingEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var ABTestingEngine = /** @class */ (function () {
    function ABTestingEngine() {
        this.cache = new Map();
        this.eventBuffer = [];
        this.batchSize = 100;
        this.flushInterval = 10000; // 10 seconds
        this.supabase = (0, client_1.createClient)();
        this.initializeEventProcessor();
    }
    /**
     * ====================================================================
     * TEST MANAGEMENT
     * ====================================================================
     */
    /**
     * Criar um novo teste A/B
     */
    ABTestingEngine.prototype.createTest = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var calculatedSampleSize, testConfig, _a, data, error, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        // Validar configuração
                        this.validateTestConfig(config);
                        calculatedSampleSize = this.calculateSampleSize(config.confidenceLevel || 95, config.powerAnalysis || 80, config.minimumDetectableEffect || 5);
                        testConfig = {
                            id: this.generateId(),
                            clinicId: config.clinicId,
                            name: config.name,
                            description: config.description,
                            type: config.type,
                            status: 'draft',
                            startDate: config.startDate || new Date(),
                            endDate: config.endDate,
                            duration: config.duration,
                            audienceFilter: config.audienceFilter,
                            trafficAllocation: config.trafficAllocation || 100,
                            confidenceLevel: config.confidenceLevel || 95,
                            minimumDetectableEffect: config.minimumDetectableEffect || 5,
                            powerAnalysis: config.powerAnalysis || 80,
                            primaryGoal: config.primaryGoal,
                            secondaryGoals: config.secondaryGoals || [],
                            createdBy: config.createdBy,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            sampleSize: calculatedSampleSize,
                            currentSampleSize: 0,
                            variations: config.variations || []
                        };
                        return [4 /*yield*/, this.supabase
                                .from('ab_tests')
                                .insert({
                                id: testConfig.id,
                                clinic_id: testConfig.clinicId,
                                name: testConfig.name,
                                description: testConfig.description,
                                type: testConfig.type,
                                status: testConfig.status,
                                start_date: testConfig.startDate.toISOString(),
                                end_date: (_b = testConfig.endDate) === null || _b === void 0 ? void 0 : _b.toISOString(),
                                duration: testConfig.duration,
                                audience_filter: testConfig.audienceFilter,
                                traffic_allocation: testConfig.trafficAllocation,
                                confidence_level: testConfig.confidenceLevel,
                                minimum_detectable_effect: testConfig.minimumDetectableEffect,
                                power_analysis: testConfig.powerAnalysis,
                                primary_goal: testConfig.primaryGoal,
                                secondary_goals: testConfig.secondaryGoals,
                                created_by: testConfig.createdBy,
                                created_at: testConfig.createdAt.toISOString(),
                                updated_at: testConfig.updatedAt.toISOString(),
                                sample_size: testConfig.sampleSize,
                                current_sample_size: testConfig.currentSampleSize
                            })
                                .select()
                                .single()];
                    case 1:
                        _a = _d.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!((_c = config.variations) === null || _c === void 0 ? void 0 : _c.length)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createVariations(testConfig.id, config.variations)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [4 /*yield*/, this.invalidateCache("test_".concat(testConfig.id))];
                    case 4:
                        _d.sent();
                        return [2 /*return*/, testConfig];
                    case 5:
                        error_1 = _d.sent();
                        console.error('Error creating A/B test:', error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Atualizar configuração de teste
     */
    ABTestingEngine.prototype.updateTest = function (testId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('ab_tests')
                                .update({
                                name: updates.name,
                                description: updates.description,
                                status: updates.status,
                                end_date: (_b = updates.endDate) === null || _b === void 0 ? void 0 : _b.toISOString(),
                                traffic_allocation: updates.trafficAllocation,
                                audience_filter: updates.audienceFilter,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', testId)
                                .select()
                                .single()];
                    case 1:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.invalidateCache("test_".concat(testId))];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, this.mapTestFromDB(data)];
                    case 3:
                        error_2 = _c.sent();
                        console.error('Error updating A/B test:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Buscar teste por ID
     */
    ABTestingEngine.prototype.getTest = function (testId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, _a, data, error, test, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        cacheKey = "test_".concat(testId);
                        cached = this.getFromCache(cacheKey);
                        if (cached)
                            return [2 /*return*/, cached];
                        return [4 /*yield*/, this.supabase
                                .from('ab_tests')
                                .select("\n          *,\n          variations:ab_test_variations(*)\n        ")
                                .eq('id', testId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            if (error.code === 'PGRST116')
                                return [2 /*return*/, null];
                            throw error;
                        }
                        test = this.mapTestFromDB(data);
                        this.setCache(cacheKey, test);
                        return [2 /*return*/, test];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Error fetching A/B test:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Buscar testes com filtros
     */
    ABTestingEngine.prototype.getTests = function () {
        return __awaiter(this, arguments, void 0, function (filter) {
            var query, page, limit, offset, sortBy, sortOrder, _a, data, error, count, tests, aggregations, error_4;
            var _b, _c, _d;
            if (filter === void 0) { filter = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        query = this.supabase
                            .from('ab_tests')
                            .select("\n          *,\n          variations:ab_test_variations(*)\n        ", { count: 'exact' });
                        // Aplicar filtros
                        if (filter.clinicId) {
                            query = query.eq('clinic_id', filter.clinicId);
                        }
                        if ((_b = filter.status) === null || _b === void 0 ? void 0 : _b.length) {
                            query = query.in('status', filter.status);
                        }
                        if ((_c = filter.type) === null || _c === void 0 ? void 0 : _c.length) {
                            query = query.in('type', filter.type);
                        }
                        if (filter.dateRange) {
                            query = query
                                .gte('created_at', filter.dateRange.start.toISOString())
                                .lte('created_at', filter.dateRange.end.toISOString());
                        }
                        if ((_d = filter.createdBy) === null || _d === void 0 ? void 0 : _d.length) {
                            query = query.in('created_by', filter.createdBy);
                        }
                        if (filter.searchTerm) {
                            query = query.or("name.ilike.%".concat(filter.searchTerm, "%,description.ilike.%").concat(filter.searchTerm, "%"));
                        }
                        page = filter.page || 1;
                        limit = filter.limit || 20;
                        offset = (page - 1) * limit;
                        query = query.range(offset, offset + limit - 1);
                        sortBy = filter.sortBy || 'created_at';
                        sortOrder = filter.sortOrder || 'desc';
                        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _e.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        tests = (data || []).map(this.mapTestFromDB);
                        return [4 /*yield*/, this.calculateAggregations(filter.clinicId)];
                    case 2:
                        aggregations = _e.sent();
                        return [2 /*return*/, {
                                tests: tests,
                                totalCount: count || 0,
                                hasMore: (page * limit) < (count || 0),
                                aggregations: aggregations
                            }];
                    case 3:
                        error_4 = _e.sent();
                        console.error('Error querying A/B tests:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ====================================================================
     * VARIATION MANAGEMENT
     * ====================================================================
     */
    /**
     * Criar variações para um teste
     */
    ABTestingEngine.prototype.createVariations = function (testId, variations) {
        return __awaiter(this, void 0, void 0, function () {
            var variationsToInsert, _a, data, error, error_5;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        variationsToInsert = variations.map(function (variation) { return ({
                            id: variation.id || _this.generateId(),
                            test_id: testId,
                            name: variation.name,
                            description: variation.description,
                            status: variation.status || 'active',
                            traffic_percentage: variation.trafficPercentage,
                            content: variation.content,
                            impressions: 0,
                            conversions: 0,
                            conversion_rate: 0,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }); });
                        return [4 /*yield*/, this.supabase
                                .from('ab_test_variations')
                                .insert(variationsToInsert)
                                .select()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.invalidateCache("test_".concat(testId))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, (data || []).map(this.mapVariationFromDB)];
                    case 3:
                        error_5 = _b.sent();
                        console.error('Error creating variations:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Atualizar variação
     */
    ABTestingEngine.prototype.updateVariation = function (variationId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, variation, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('ab_test_variations')
                                .update({
                                name: updates.name,
                                description: updates.description,
                                status: updates.status,
                                traffic_percentage: updates.trafficPercentage,
                                content: updates.content,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', variationId)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        variation = this.mapVariationFromDB(data);
                        return [4 /*yield*/, this.invalidateCache("test_".concat(variation.testId))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, variation];
                    case 3:
                        error_6 = _b.sent();
                        console.error('Error updating variation:', error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ====================================================================
     * TEST EXECUTION
     * ====================================================================
     */
    /**
     * Iniciar um teste
     */
    ABTestingEngine.prototype.startTest = function (testId) {
        return __awaiter(this, void 0, void 0, function () {
            var test, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getTest(testId)];
                    case 1:
                        test = _a.sent();
                        if (!test)
                            throw new Error('Test not found');
                        if (test.status !== 'draft') {
                            throw new Error('Only draft tests can be started');
                        }
                        // Validar configuração antes de iniciar
                        this.validateTestForStart(test);
                        return [4 /*yield*/, this.updateTest(testId, {
                                status: 'active',
                                startDate: new Date()
                            })];
                    case 2:
                        _a.sent();
                        // Criar eventos de audit
                        return [4 /*yield*/, this.logTestEvent(testId, 'test_started', { startedBy: test.createdBy })];
                    case 3:
                        // Criar eventos de audit
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _a.sent();
                        console.error('Error starting test:', error_7);
                        throw error_7;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pausar um teste
     */
    ABTestingEngine.prototype.pauseTest = function (testId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.updateTest(testId, { status: 'paused' })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.logTestEvent(testId, 'test_paused', { reason: reason })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        console.error('Error pausing test:', error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Finalizar um teste
     */
    ABTestingEngine.prototype.completeTest = function (testId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var test, results, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getTest(testId)];
                    case 1:
                        test = _a.sent();
                        if (!test)
                            throw new Error('Test not found');
                        return [4 /*yield*/, this.calculateTestResults(testId)];
                    case 2:
                        results = _a.sent();
                        // Atualizar status
                        return [4 /*yield*/, this.updateTest(testId, {
                                status: 'completed',
                                endDate: new Date(),
                                results: results
                            })];
                    case 3:
                        // Atualizar status
                        _a.sent();
                        return [4 /*yield*/, this.logTestEvent(testId, 'test_completed', { reason: reason, results: results })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, results];
                    case 5:
                        error_9 = _a.sent();
                        console.error('Error completing test:', error_9);
                        throw error_9;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Atribuir variação para um paciente
     */
    ABTestingEngine.prototype.assignVariation = function (testId, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var test, isInAudience, random, variation, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getTest(testId)];
                    case 1:
                        test = _a.sent();
                        if (!test || test.status !== 'active')
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.isPatientInAudience(patientId, test.audienceFilter)];
                    case 2:
                        isInAudience = _a.sent();
                        if (!isInAudience)
                            return [2 /*return*/, null];
                        random = Math.random() * 100;
                        if (random > test.trafficAllocation)
                            return [2 /*return*/, null];
                        variation = this.selectVariationByWeight(test.variations);
                        if (!variation)
                            return [2 /*return*/, null];
                        // Registrar impression
                        return [4 /*yield*/, this.recordEvent({
                                id: this.generateId(),
                                testId: testId,
                                variationId: variation.id,
                                patientId: patientId,
                                type: 'impression',
                                timestamp: new Date()
                            })];
                    case 3:
                        // Registrar impression
                        _a.sent();
                        return [2 /*return*/, variation];
                    case 4:
                        error_10 = _a.sent();
                        console.error('Error assigning variation:', error_10);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ====================================================================
     * EVENT TRACKING
     * ====================================================================
     */
    /**
     * Registrar evento de conversão
     */
    ABTestingEngine.prototype.recordConversion = function (testId, variationId, patientId, goalId, monetaryValue) {
        return __awaiter(this, void 0, void 0, function () {
            var error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.recordEvent({
                                id: this.generateId(),
                                testId: testId,
                                variationId: variationId,
                                patientId: patientId,
                                type: 'conversion',
                                goalId: goalId,
                                monetaryValue: monetaryValue,
                                timestamp: new Date()
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        console.error('Error recording conversion:', error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Registrar evento genérico
     */
    ABTestingEngine.prototype.recordEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Adicionar ao buffer para processamento em lote
                        this.eventBuffer.push(event);
                        if (!(this.eventBuffer.length >= this.batchSize)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.flushEventBuffer()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        error_12 = _a.sent();
                        console.error('Error recording event:', error_12);
                        throw error_12;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ====================================================================
     * STATISTICAL ANALYSIS
     * ====================================================================
     */
    /**
     * Calcular resultados de um teste
     */
    ABTestingEngine.prototype.calculateTestResults = function (testId) {
        return __awaiter(this, void 0, void 0, function () {
            var test, events, eventsByVariation_1, variationResults, statisticalAnalysis, winnerAnalysis, insights, results, error_13;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.getTest(testId)];
                    case 1:
                        test = _b.sent();
                        if (!test)
                            throw new Error('Test not found');
                        return [4 /*yield*/, this.supabase
                                .from('ab_test_events')
                                .select('*')
                                .eq('test_id', testId)];
                    case 2:
                        events = (_b.sent()).data;
                        if (!(events === null || events === void 0 ? void 0 : events.length)) {
                            return [2 /*return*/, this.createEmptyResults(testId)];
                        }
                        eventsByVariation_1 = this.groupEventsByVariation(events);
                        return [4 /*yield*/, Promise.all(test.variations.map(function (variation) {
                                return _this.calculateVariationResults(variation, eventsByVariation_1[variation.id] || []);
                            }))];
                    case 3:
                        variationResults = _b.sent();
                        statisticalAnalysis = this.performStatisticalAnalysis(variationResults);
                        winnerAnalysis = this.determineWinner(variationResults, test.confidenceLevel);
                        return [4 /*yield*/, this.generateTestInsights(test, variationResults, events)];
                    case 4:
                        insights = _b.sent();
                        _a = {
                            testId: testId,
                            status: test.status === 'completed' ? 'completed' : 'ongoing',
                            totalImpressions: events.filter(function (e) { return e.type === 'impression'; }).length,
                            totalConversions: events.filter(function (e) { return e.type === 'conversion'; }).length,
                            overallConversionRate: this.calculateOverallConversionRate(events),
                            statisticalSignificance: statisticalAnalysis.significance,
                            confidenceLevel: test.confidenceLevel,
                            pValue: statisticalAnalysis.pValue,
                            powerAchieved: statisticalAnalysis.powerAchieved,
                            winningVariation: winnerAnalysis.winnerId,
                            liftPercentage: winnerAnalysis.lift,
                            confidenceInterval: winnerAnalysis.confidenceInterval,
                            variationResults: variationResults
                        };
                        return [4 /*yield*/, this.calculateDailyResults(testId, events)];
                    case 5:
                        _a.dailyResults = _b.sent(),
                            _a.insights = insights;
                        return [4 /*yield*/, this.generateRecommendations(test, variationResults, insights)];
                    case 6:
                        results = (_a.recommendations = _b.sent(),
                            _a.calculatedAt = new Date(),
                            _a);
                        // Salvar resultados
                        return [4 /*yield*/, this.saveTestResults(testId, results)];
                    case 7:
                        // Salvar resultados
                        _b.sent();
                        return [2 /*return*/, results];
                    case 8:
                        error_13 = _b.sent();
                        console.error('Error calculating test results:', error_13);
                        throw error_13;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verificar significância estatística
     */
    ABTestingEngine.prototype.performStatisticalAnalysis = function (variationResults) {
        if (variationResults.length < 2) {
            return {
                significance: 'not_significant',
                pValue: 1,
                powerAchieved: 0
            };
        }
        // Encontrar controle (primeira variação)
        var control = variationResults[0];
        var variants = variationResults.slice(1);
        var minPValue = 1;
        var maxPower = 0;
        for (var _i = 0, variants_1 = variants; _i < variants_1.length; _i++) {
            var variant = variants_1[_i];
            var _a = this.performTTest(control, variant), pValue = _a.pValue, power = _a.power;
            minPValue = Math.min(minPValue, pValue);
            maxPower = Math.max(maxPower, power);
        }
        var significance = 'not_significant';
        if (minPValue < 0.001)
            significance = 'highly_significant';
        else if (minPValue < 0.01)
            significance = 'significant';
        else if (minPValue < 0.05)
            significance = 'marginally_significant';
        return {
            significance: significance,
            pValue: minPValue,
            powerAchieved: maxPower
        };
    };
    /**
     * Realizar teste t entre duas variações
     */
    ABTestingEngine.prototype.performTTest = function (control, variant) {
        var n1 = control.impressions;
        var n2 = variant.impressions;
        var p1 = control.conversionRate / 100;
        var p2 = variant.conversionRate / 100;
        if (n1 === 0 || n2 === 0) {
            return { pValue: 1, power: 0 };
        }
        // Pooled proportion
        var pooled = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
        // Standard error
        var se = Math.sqrt(pooled * (1 - pooled) * ((1 / n1) + (1 / n2)));
        if (se === 0) {
            return { pValue: 1, power: 0 };
        }
        // Z-score
        var z = Math.abs(p2 - p1) / se;
        // P-value (two-tailed)
        var pValue = 2 * (1 - this.normalCDF(z));
        // Power calculation (simplified)
        var effect = Math.abs(p2 - p1);
        var power = Math.min(1, effect * Math.sqrt(Math.min(n1, n2)) * 2);
        return { pValue: Math.max(0.001, pValue), power: Math.max(0.05, power) };
    };
    /**
     * Função de distribuição cumulativa normal
     */
    ABTestingEngine.prototype.normalCDF = function (x) {
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    };
    /**
     * Função de erro
     */
    ABTestingEngine.prototype.erf = function (x) {
        // Aproximação para função de erro
        var a1 = 0.254829592;
        var a2 = -0.284496736;
        var a3 = 1.421413741;
        var a4 = -1.453152027;
        var a5 = 1.061405429;
        var p = 0.3275911;
        var sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        var t = 1.0 / (1.0 + p * x);
        var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return sign * y;
    };
    /**
     * ====================================================================
     * HELPER METHODS
     * ====================================================================
     */
    /**
     * Validar configuração de teste
     */
    ABTestingEngine.prototype.validateTestConfig = function (config) {
        if (!config.clinicId)
            throw new Error('Clinic ID is required');
        if (!config.name)
            throw new Error('Test name is required');
        if (!config.type)
            throw new Error('Test type is required');
        if (!config.audienceFilter)
            throw new Error('Audience filter is required');
        if (!config.primaryGoal)
            throw new Error('Primary goal is required');
        if (!config.createdBy)
            throw new Error('Created by is required');
        if (config.trafficAllocation && (config.trafficAllocation < 1 || config.trafficAllocation > 100)) {
            throw new Error('Traffic allocation must be between 1 and 100');
        }
        if (config.confidenceLevel && ![90, 95, 99].includes(config.confidenceLevel)) {
            throw new Error('Confidence level must be 90, 95, or 99');
        }
    };
    /**
     * Validar teste antes de iniciar
     */
    ABTestingEngine.prototype.validateTestForStart = function (test) {
        if (test.variations.length < 2) {
            throw new Error('Test must have at least 2 variations');
        }
        var totalTraffic = test.variations.reduce(function (sum, v) { return sum + v.trafficPercentage; }, 0);
        if (Math.abs(totalTraffic - 100) > 0.01) {
            throw new Error('Variation traffic percentages must sum to 100');
        }
    };
    /**
     * Calcular tamanho da amostra necessário
     */
    ABTestingEngine.prototype.calculateSampleSize = function (confidence, power, effect) {
        // Simplified sample size calculation for proportions
        var alpha = (100 - confidence) / 100;
        var beta = (100 - power) / 100;
        var zAlpha = this.getZScore(1 - alpha / 2);
        var zBeta = this.getZScore(1 - beta);
        var p1 = 0.1; // Assumed baseline conversion rate
        var p2 = p1 * (1 + effect / 100);
        var pooled = (p1 + p2) / 2;
        var numerator = Math.pow(zAlpha * Math.sqrt(2 * pooled * (1 - pooled)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
        var denominator = Math.pow(p2 - p1, 2);
        return Math.ceil(numerator / denominator);
    };
    /**
     * Obter Z-score para confiança
     */
    ABTestingEngine.prototype.getZScore = function (confidence) {
        if (confidence >= 0.995)
            return 2.576;
        if (confidence >= 0.975)
            return 1.96;
        if (confidence >= 0.95)
            return 1.645;
        return 1.282;
    };
    /**
     * Verificar se paciente está na audiência
     */
    ABTestingEngine.prototype.isPatientInAudience = function (patientId, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var patient, age, error_14;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        // Se há lista específica de inclusão
                        if ((_a = filter.includePatients) === null || _a === void 0 ? void 0 : _a.length) {
                            return [2 /*return*/, filter.includePatients.includes(patientId)];
                        }
                        // Se há lista específica de exclusão
                        if ((_b = filter.excludePatients) === null || _b === void 0 ? void 0 : _b.length) {
                            if (filter.excludePatients.includes(patientId))
                                return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .select('*')
                                .eq('id', patientId)
                                .single()];
                    case 1:
                        patient = (_c.sent()).data;
                        if (!patient)
                            return [2 /*return*/, false];
                        // Aplicar filtros demográficos
                        if (filter.ageRange) {
                            age = this.calculateAge(new Date(patient.birth_date));
                            if (age < filter.ageRange.min || age > filter.ageRange.max)
                                return [2 /*return*/, false];
                        }
                        if (filter.gender && filter.gender !== 'all' && patient.gender !== filter.gender) {
                            return [2 /*return*/, false];
                        }
                        // Outros filtros podem ser implementados conforme necessário
                        return [2 /*return*/, true];
                    case 2:
                        error_14 = _c.sent();
                        console.error('Error checking patient audience:', error_14);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Selecionar variação baseada no peso
     */
    ABTestingEngine.prototype.selectVariationByWeight = function (variations) {
        var activeVariations = variations.filter(function (v) { return v.status === 'active'; });
        if (!activeVariations.length)
            return null;
        var random = Math.random() * 100;
        var cumulative = 0;
        for (var _i = 0, activeVariations_1 = activeVariations; _i < activeVariations_1.length; _i++) {
            var variation = activeVariations_1[_i];
            cumulative += variation.trafficPercentage;
            if (random <= cumulative) {
                return variation;
            }
        }
        return activeVariations[activeVariations.length - 1];
    };
    /**
     * Processar buffer de eventos
     */
    ABTestingEngine.prototype.flushEventBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var events, eventsToInsert, error_15;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.eventBuffer.length)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        events = __spreadArray([], this.eventBuffer, true);
                        this.eventBuffer = [];
                        eventsToInsert = events.map(function (event) { return ({
                            id: event.id,
                            test_id: event.testId,
                            variation_id: event.variationId,
                            patient_id: event.patientId,
                            type: event.type,
                            goal_id: event.goalId,
                            timestamp: event.timestamp.toISOString(),
                            session_id: event.sessionId,
                            device_info: event.deviceInfo,
                            event_data: event.eventData,
                            monetary_value: event.monetaryValue,
                            ip_address: event.ipAddress,
                            user_agent: event.userAgent,
                            referrer: event.referrer
                        }); });
                        return [4 /*yield*/, this.supabase
                                .from('ab_test_events')
                                .insert(eventsToInsert)];
                    case 2:
                        _b.sent();
                        // Atualizar métricas das variações
                        return [4 /*yield*/, this.updateVariationMetrics(events)];
                    case 3:
                        // Atualizar métricas das variações
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_15 = _b.sent();
                        console.error('Error flushing event buffer:', error_15);
                        // Recolocar eventos no buffer para tentar novamente
                        (_a = this.eventBuffer).unshift.apply(_a, events);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Atualizar métricas das variações
     */
    ABTestingEngine.prototype.updateVariationMetrics = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var metricsByVariation, _i, _a, _b, variationId, metrics;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        metricsByVariation = events.reduce(function (acc, event) {
                            if (!acc[event.variationId]) {
                                acc[event.variationId] = { impressions: 0, conversions: 0 };
                            }
                            if (event.type === 'impression') {
                                acc[event.variationId].impressions++;
                            }
                            else if (event.type === 'conversion') {
                                acc[event.variationId].conversions++;
                            }
                            return acc;
                        }, {});
                        _i = 0, _a = Object.entries(metricsByVariation);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], variationId = _b[0], metrics = _b[1];
                        return [4 /*yield*/, this.supabase
                                .from('ab_test_variations')
                                .update({
                                impressions: metrics.impressions,
                                conversions: metrics.conversions,
                                conversion_rate: metrics.impressions > 0 ? (metrics.conversions / metrics.impressions) * 100 : 0,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', variationId)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Inicializar processador de eventos
     */
    ABTestingEngine.prototype.initializeEventProcessor = function () {
        var _this = this;
        // Processar buffer periodicamente
        setInterval(function () {
            _this.flushEventBuffer();
        }, this.flushInterval);
        // Processar ao fechar/sair
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', function () {
                _this.flushEventBuffer();
            });
        }
    };
    /**
     * Mapear teste do banco de dados
     */
    ABTestingEngine.prototype.mapTestFromDB = function (data) {
        return {
            id: data.id,
            clinicId: data.clinic_id,
            name: data.name,
            description: data.description,
            type: data.type,
            status: data.status,
            startDate: new Date(data.start_date),
            endDate: data.end_date ? new Date(data.end_date) : undefined,
            duration: data.duration,
            audienceFilter: data.audience_filter,
            trafficAllocation: data.traffic_allocation,
            confidenceLevel: data.confidence_level,
            minimumDetectableEffect: data.minimum_detectable_effect,
            powerAnalysis: data.power_analysis,
            primaryGoal: data.primary_goal,
            secondaryGoals: data.secondary_goals || [],
            createdBy: data.created_by,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            sampleSize: data.sample_size,
            currentSampleSize: data.current_sample_size,
            variations: (data.variations || []).map(this.mapVariationFromDB),
            results: data.results
        };
    };
    /**
     * Mapear variação do banco de dados
     */
    ABTestingEngine.prototype.mapVariationFromDB = function (data) {
        return {
            id: data.id,
            testId: data.test_id,
            name: data.name,
            description: data.description,
            status: data.status,
            trafficPercentage: data.traffic_percentage,
            content: data.content,
            impressions: data.impressions || 0,
            conversions: data.conversions || 0,
            conversionRate: data.conversion_rate || 0,
            confidence: data.confidence,
            significance: data.significance,
            pValue: data.p_value,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        };
    };
    /**
     * Gerar ID único
     */
    ABTestingEngine.prototype.generateId = function () {
        return "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    };
    /**
     * Calcular idade
     */
    ABTestingEngine.prototype.calculateAge = function (birthDate) {
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    /**
     * Cache helpers
     */
    ABTestingEngine.prototype.getFromCache = function (key) {
        var item = this.cache.get(key);
        if (!item)
            return null;
        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    };
    ABTestingEngine.prototype.setCache = function (key, data, ttl) {
        if (ttl === void 0) { ttl = 300000; }
        this.cache.set(key, {
            data: data,
            expiry: Date.now() + ttl
        });
    };
    ABTestingEngine.prototype.invalidateCache = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.cache.delete(key);
                return [2 /*return*/];
            });
        });
    };
    // Placeholder methods for completion
    ABTestingEngine.prototype.calculateAggregations = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {}];
            });
        });
    };
    ABTestingEngine.prototype.groupEventsByVariation = function (events) {
        return events.reduce(function (acc, event) {
            if (!acc[event.variation_id])
                acc[event.variation_id] = [];
            acc[event.variation_id].push(event);
            return acc;
        }, {});
    };
    ABTestingEngine.prototype.calculateVariationResults = function (variation, events) {
        return __awaiter(this, void 0, void 0, function () {
            var impressions, conversions;
            return __generator(this, function (_a) {
                impressions = events.filter(function (e) { return e.type === 'impression'; }).length;
                conversions = events.filter(function (e) { return e.type === 'conversion'; }).length;
                return [2 /*return*/, {
                        variationId: variation.id,
                        variationName: variation.name,
                        impressions: impressions,
                        conversions: conversions,
                        conversionRate: impressions > 0 ? (conversions / impressions) * 100 : 0,
                        significance: 'not_significant',
                        pValue: 1,
                        confidenceInterval: { lower: 0, upper: 0 },
                        liftPercentage: 0,
                        isWinner: false,
                        goalResults: [],
                        segmentResults: []
                    }];
            });
        });
    };
    ABTestingEngine.prototype.createEmptyResults = function (testId) {
        return {
            testId: testId,
            status: 'ongoing',
            totalImpressions: 0,
            totalConversions: 0,
            overallConversionRate: 0,
            statisticalSignificance: 'not_significant',
            confidenceLevel: 95,
            pValue: 1,
            powerAchieved: 0,
            variationResults: [],
            insights: [],
            recommendations: [],
            calculatedAt: new Date()
        };
    };
    ABTestingEngine.prototype.calculateOverallConversionRate = function (events) {
        var impressions = events.filter(function (e) { return e.type === 'impression'; }).length;
        var conversions = events.filter(function (e) { return e.type === 'conversion'; }).length;
        return impressions > 0 ? (conversions / impressions) * 100 : 0;
    };
    ABTestingEngine.prototype.determineWinner = function (variations, confidenceLevel) {
        if (variations.length < 2)
            return {};
        var bestVariation = variations.reduce(function (best, current) {
            return current.conversionRate > best.conversionRate ? current : best;
        });
        var control = variations[0];
        var lift = control.conversionRate > 0 ?
            ((bestVariation.conversionRate - control.conversionRate) / control.conversionRate) * 100 : 0;
        return {
            winnerId: bestVariation.variationId,
            lift: lift,
            confidenceInterval: { lower: lift - 5, upper: lift + 5 }
        };
    };
    ABTestingEngine.prototype.calculateDailyResults = function (testId, events) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    ABTestingEngine.prototype.generateTestInsights = function (test, variations, events) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    ABTestingEngine.prototype.generateRecommendations = function (test, variations, insights) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ['Continue test to reach statistical significance']];
            });
        });
    };
    ABTestingEngine.prototype.saveTestResults = function (testId, results) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('ab_tests')
                            .update({ results: results })
                            .eq('id', testId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ABTestingEngine.prototype.logTestEvent = function (testId, eventType, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('ab_test_audit_log')
                            .insert({
                            test_id: testId,
                            event_type: eventType,
                            event_data: data,
                            timestamp: new Date().toISOString()
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ABTestingEngine;
}());
exports.ABTestingEngine = ABTestingEngine;
// Export singleton instance
exports.abTestingEngine = new ABTestingEngine();
