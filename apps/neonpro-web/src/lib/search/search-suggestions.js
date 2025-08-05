/**
 * Search Suggestions Engine
 * Story 3.4: Smart Search + NLP Integration - Task 4
 * Intelligent autocomplete and query suggestions with learning capabilities
 */
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.createsearchSuggestions = exports.SearchSuggestions = void 0;
var client_1 = require("@/lib/supabase/client");
var nlp_engine_1 = require("./nlp-engine");
var search_indexer_1 = require("./search-indexer");
/**
 * Search Suggestions Engine
 * Provides intelligent autocomplete and query suggestions
 */
var SearchSuggestions = /** @class */ (() => {
  function SearchSuggestions() {
    this.supabase = (0, client_1.createClient)();
    this.suggestionCache = new Map();
    this.completionCache = new Map();
    this.popularQueries = new Map();
    this.entitySuggestions = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.lastCacheUpdate = 0;
    this.initializeCache();
  }
  /**
   * Initialize suggestion cache
   */
  SearchSuggestions.prototype.initializeCache = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              Promise.all([
                this.loadPopularQueries(),
                this.loadEntitySuggestions(),
                this.loadCommonFilters(),
              ]),
            ];
          case 1:
            _a.sent();
            this.lastCacheUpdate = Date.now();
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Error initializing suggestion cache:", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get search suggestions for a query
   */
  SearchSuggestions.prototype.getSuggestions = function (query_1, context_1) {
    return __awaiter(this, arguments, void 0, function (query, context, options) {
      var cacheKey,
        suggestions_1,
        _a,
        completions,
        historical,
        popular,
        contextual,
        personalized,
        semantic,
        filteredSuggestions,
        finalSuggestions,
        error_2;
      if (options === void 0) {
        options = {
          maxSuggestions: 10,
          includeHistory: true,
          includePopular: true,
          includePersonalized: true,
          includeContextual: true,
          minConfidence: 0.3,
        };
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            cacheKey = this.generateCacheKey(query, context, options);
            if (this.suggestionCache.has(cacheKey)) {
              return [2 /*return*/, this.suggestionCache.get(cacheKey)];
            }
            if (!(Date.now() - this.lastCacheUpdate > this.cacheExpiry)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initializeCache()];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            suggestions_1 = [];
            return [
              4 /*yield*/,
              Promise.all([
                this.getQueryCompletions(query, context),
                options.includeHistory ? this.getHistoricalSuggestions(query, context) : [],
                options.includePopular ? this.getPopularSuggestions(query, context) : [],
                options.includeContextual ? this.getContextualSuggestions(query, context) : [],
                options.includePersonalized ? this.getPersonalizedSuggestions(query, context) : [],
                this.getSemanticSuggestions(query, context),
              ]),
            ];
          case 3:
            (_a = _b.sent()),
              (completions = _a[0]),
              (historical = _a[1]),
              (popular = _a[2]),
              (contextual = _a[3]),
              (personalized = _a[4]),
              (semantic = _a[5]);
            // Convert completions to suggestions
            completions.forEach((completion) => {
              suggestions_1.push({
                id: "completion_".concat(Date.now(), "_").concat(Math.random()),
                text: completion.completion,
                type: "query_completion",
                category: "completion",
                confidence: completion.confidence,
                frequency: 0,
                lastUsed: new Date(),
                metadata: { completionType: completion.type, context: completion.context },
              });
            });
            // Add other suggestion types
            suggestions_1.push.apply(
              suggestions_1,
              __spreadArray(
                __spreadArray(
                  __spreadArray(
                    __spreadArray(__spreadArray([], historical, false), popular, false),
                    contextual,
                    false,
                  ),
                  personalized,
                  false,
                ),
                semantic,
                false,
              ),
            );
            filteredSuggestions = suggestions_1.filter(
              (s) =>
                s.confidence >= options.minConfidence &&
                (!options.categories || options.categories.includes(s.category)),
            );
            // Rank and deduplicate suggestions
            filteredSuggestions = this.rankSuggestions(filteredSuggestions, query, context);
            filteredSuggestions = this.deduplicateSuggestions(filteredSuggestions);
            // Apply highlighting
            filteredSuggestions = this.highlightSuggestions(filteredSuggestions, query);
            finalSuggestions = filteredSuggestions.slice(0, options.maxSuggestions);
            // Cache results
            this.suggestionCache.set(cacheKey, finalSuggestions);
            return [2 /*return*/, finalSuggestions];
          case 4:
            error_2 = _b.sent();
            console.error("Error getting suggestions:", error_2);
            return [2 /*return*/, []];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get query completions
   */
  SearchSuggestions.prototype.getQueryCompletions = function (query, context) {
    return __awaiter(this, void 0, void 0, function () {
      var completions,
        prefixMatches,
        entityCompletions,
        templateCompletions,
        semanticCompletions,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (query.length < 2) return [2 /*return*/, []];
            completions = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            prefixMatches = this.getPrefixCompletions(query);
            completions.push.apply(completions, prefixMatches);
            return [4 /*yield*/, this.getEntityCompletions(query, context)];
          case 2:
            entityCompletions = _a.sent();
            completions.push.apply(completions, entityCompletions);
            templateCompletions = this.getTemplateCompletions(query, context);
            completions.push.apply(completions, templateCompletions);
            return [4 /*yield*/, this.getSemanticCompletions(query, context)];
          case 3:
            semanticCompletions = _a.sent();
            completions.push.apply(completions, semanticCompletions);
            // Sort by confidence
            return [
              2 /*return*/,
              completions.sort((a, b) => b.confidence - a.confidence).slice(0, 5),
            ];
          case 4:
            error_3 = _a.sent();
            console.error("Error getting query completions:", error_3);
            return [2 /*return*/, []];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get prefix completions from popular queries
   */
  SearchSuggestions.prototype.getPrefixCompletions = function (query) {
    var completions = [];
    var lowerQuery = query.toLowerCase();
    for (var _i = 0, _a = this.popularQueries.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        popularQuery = _b[0],
        frequency = _b[1];
      if (popularQuery.toLowerCase().startsWith(lowerQuery) && popularQuery !== query) {
        completions.push({
          completion: popularQuery,
          confidence: Math.min(0.9, frequency / 100),
          type: "prefix_match",
          context: "popular_queries",
        });
      }
    }
    return completions.slice(0, 3);
  };
  /**
   * Get entity completions
   */
  SearchSuggestions.prototype.getEntityCompletions = function (query, context) {
    return __awaiter(this, void 0, void 0, function () {
      var completions, patients, providers, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            completions = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select("name, cpf")
                .or("name.ilike.%".concat(query, "%,cpf.ilike.%").concat(query, "%"))
                .eq("clinic_id", context.clinicId)
                .limit(3),
            ];
          case 2:
            patients = _a.sent().data;
            if (patients) {
              patients.forEach((patient) => {
                if (patient.name.toLowerCase().includes(query.toLowerCase())) {
                  completions.push({
                    completion: patient.name,
                    confidence: 0.8,
                    type: "entity_completion",
                    context: "patient_name",
                  });
                }
                if (patient.cpf && patient.cpf.includes(query)) {
                  completions.push({
                    completion: patient.cpf,
                    confidence: 0.9,
                    type: "entity_completion",
                    context: "patient_cpf",
                  });
                }
              });
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("healthcare_providers")
                .select("name, specialty")
                .or("name.ilike.%".concat(query, "%,specialty.ilike.%").concat(query, "%"))
                .eq("clinic_id", context.clinicId)
                .limit(3),
            ];
          case 3:
            providers = _a.sent().data;
            if (providers) {
              providers.forEach((provider) => {
                if (provider.name.toLowerCase().includes(query.toLowerCase())) {
                  completions.push({
                    completion: provider.name,
                    confidence: 0.7,
                    type: "entity_completion",
                    context: "provider_name",
                  });
                }
              });
            }
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            console.error("Error getting entity completions:", error_4);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/, completions];
        }
      });
    });
  };
  /**
   * Get template completions
   */
  SearchSuggestions.prototype.getTemplateCompletions = (query, context) => {
    var templates = [
      "pacientes com diabetes",
      "consultas de hoje",
      "pacientes sem retorno",
      "exames pendentes",
      "receitas vencidas",
      "pacientes aniversariantes",
      "consultas canceladas",
      "tratamentos em andamento",
    ];
    var completions = [];
    var lowerQuery = query.toLowerCase();
    templates.forEach((template) => {
      if (template.includes(lowerQuery) && template !== query) {
        var confidence = lowerQuery.length / template.length;
        completions.push({
          completion: template,
          confidence: Math.min(0.8, confidence),
          type: "template_completion",
          context: "common_searches",
        });
      }
    });
    return completions;
  };
  /**
   * Get semantic completions using NLP
   */
  SearchSuggestions.prototype.getSemanticCompletions = function (query, context) {
    return __awaiter(this, void 0, void 0, function () {
      var nlpResult, completions_1, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              nlp_engine_1.nlpEngine.processQuery(query, context.language || "pt"),
            ];
          case 1:
            nlpResult = _a.sent();
            completions_1 = [];
            // Generate completions based on detected entities and intents
            if (nlpResult.entities.length > 0) {
              nlpResult.entities.forEach((entity) => {
                if (entity.type === "CONDITION" && entity.confidence > 0.7) {
                  completions_1.push({
                    completion: "pacientes com ".concat(entity.value),
                    confidence: entity.confidence * 0.8,
                    type: "semantic_completion",
                    context: "medical_condition",
                  });
                }
                if (entity.type === "MEDICATION" && entity.confidence > 0.7) {
                  completions_1.push({
                    completion: "prescri\u00E7\u00F5es de ".concat(entity.value),
                    confidence: entity.confidence * 0.8,
                    type: "semantic_completion",
                    context: "medication",
                  });
                }
              });
            }
            // Generate completions based on intent
            if (nlpResult.intent.name === "find_patient" && nlpResult.intent.confidence > 0.6) {
              completions_1.push({
                completion: "".concat(query, " - buscar paciente"),
                confidence: nlpResult.intent.confidence * 0.7,
                type: "semantic_completion",
                context: "patient_search",
              });
            }
            return [2 /*return*/, completions_1];
          case 2:
            error_5 = _a.sent();
            console.error("Error getting semantic completions:", error_5);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get historical suggestions
   */
  SearchSuggestions.prototype.getHistoricalSuggestions = function (query, context) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, history_1, error_6;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            suggestions = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("search_analytics")
                .select("query, frequency, last_used")
                .eq("user_id", context.userId)
                .eq("clinic_id", context.clinicId)
                .ilike("query", "%".concat(query, "%"))
                .order("frequency", { ascending: false })
                .limit(5),
            ];
          case 2:
            history_1 = _a.sent().data;
            if (history_1) {
              history_1.forEach((item) => {
                var similarity = _this.calculateSimilarity(query, item.query);
                if (similarity > 0.3) {
                  suggestions.push({
                    id: "historical_".concat(item.query),
                    text: item.query,
                    type: "historical",
                    category: "history",
                    confidence: similarity * 0.8,
                    frequency: item.frequency,
                    lastUsed: new Date(item.last_used),
                    metadata: { source: "user_history" },
                  });
                }
              });
            }
            return [3 /*break*/, 4];
          case 3:
            error_6 = _a.sent();
            console.error("Error getting historical suggestions:", error_6);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/, suggestions];
        }
      });
    });
  };
  /**
   * Get popular suggestions
   */
  SearchSuggestions.prototype.getPopularSuggestions = function (query, context) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, popular, error_7;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            suggestions = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("search_analytics")
                .select("query, frequency, last_used")
                .eq("clinic_id", context.clinicId)
                .ilike("query", "%".concat(query, "%"))
                .order("frequency", { ascending: false })
                .limit(5),
            ];
          case 2:
            popular = _a.sent().data;
            if (popular) {
              popular.forEach((item) => {
                var similarity = _this.calculateSimilarity(query, item.query);
                if (similarity > 0.4) {
                  suggestions.push({
                    id: "popular_".concat(item.query),
                    text: item.query,
                    type: "popular",
                    category: "trending",
                    confidence: similarity * 0.7,
                    frequency: item.frequency,
                    lastUsed: new Date(item.last_used),
                    metadata: { source: "clinic_popular" },
                  });
                }
              });
            }
            return [3 /*break*/, 4];
          case 3:
            error_7 = _a.sent();
            console.error("Error getting popular suggestions:", error_7);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/, suggestions];
        }
      });
    });
  };
  /**
   * Get contextual suggestions
   */
  SearchSuggestions.prototype.getContextualSuggestions = function (query, context) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, contextualQueries;
      return __generator(this, function (_a) {
        suggestions = [];
        try {
          contextualQueries = this.getContextualQueries(context.sessionContext.currentPage);
          contextualQueries.forEach((contextQuery) => {
            if (contextQuery.toLowerCase().includes(query.toLowerCase())) {
              suggestions.push({
                id: "contextual_".concat(contextQuery),
                text: contextQuery,
                type: "contextual",
                category: "context",
                confidence: 0.6,
                frequency: 0,
                lastUsed: new Date(),
                metadata: { source: "page_context", page: context.sessionContext.currentPage },
              });
            }
          });
          // Suggestions based on recent searches in session
          context.sessionContext.previousSearches.forEach((prevSearch) => {
            if (prevSearch.toLowerCase().includes(query.toLowerCase()) && prevSearch !== query) {
              suggestions.push({
                id: "session_".concat(prevSearch),
                text: prevSearch,
                type: "contextual",
                category: "session",
                confidence: 0.5,
                frequency: 0,
                lastUsed: new Date(),
                metadata: { source: "session_history" },
              });
            }
          });
        } catch (error) {
          console.error("Error getting contextual suggestions:", error);
        }
        return [2 /*return*/, suggestions];
      });
    });
  };
  /**
   * Get personalized suggestions
   */
  SearchSuggestions.prototype.getPersonalizedSuggestions = function (query, context) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions;
      return __generator(this, (_a) => {
        suggestions = [];
        if (!context.userPreferences.personalizedSuggestions) {
          return [2 /*return*/, suggestions];
        }
        try {
          // Suggestions based on user's preferred data types
          context.userPreferences.preferredDataTypes.forEach((dataType) => {
            var typeQueries = this.getDataTypeQueries(dataType, query);
            typeQueries.forEach((typeQuery) => {
              suggestions.push({
                id: "personalized_".concat(dataType, "_").concat(typeQuery),
                text: typeQuery,
                type: "personalized",
                category: "preferences",
                confidence: 0.7,
                frequency: 0,
                lastUsed: new Date(),
                metadata: { source: "user_preferences", dataType: dataType },
              });
            });
          });
          // Suggestions based on search patterns
          context.userPreferences.searchPatterns.forEach((pattern) => {
            if (pattern.toLowerCase().includes(query.toLowerCase())) {
              suggestions.push({
                id: "pattern_".concat(pattern),
                text: pattern,
                type: "personalized",
                category: "patterns",
                confidence: 0.6,
                frequency: 0,
                lastUsed: new Date(),
                metadata: { source: "search_patterns" },
              });
            }
          });
        } catch (error) {
          console.error("Error getting personalized suggestions:", error);
        }
        return [2 /*return*/, suggestions];
      });
    });
  };
  /**
   * Get semantic suggestions
   */
  SearchSuggestions.prototype.getSemanticSuggestions = function (query, context) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, similarContent, error_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            suggestions = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              search_indexer_1.searchIndexer.getSuggestions(query, {
                maxSuggestions: 5,
                minScore: 0.5,
              }),
            ];
          case 2:
            similarContent = _a.sent();
            similarContent.forEach((content) => {
              suggestions.push({
                id: "semantic_".concat(content),
                text: content,
                type: "semantic",
                category: "similar",
                confidence: 0.6,
                frequency: 0,
                lastUsed: new Date(),
                metadata: { source: "semantic_search" },
              });
            });
            return [3 /*break*/, 4];
          case 3:
            error_8 = _a.sent();
            console.error("Error getting semantic suggestions:", error_8);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/, suggestions];
        }
      });
    });
  };
  /**
   * Rank suggestions by relevance
   */
  SearchSuggestions.prototype.rankSuggestions = function (suggestions, query, context) {
    return suggestions.sort((a, b) => {
      // Calculate ranking score
      var scoreA = this.calculateRankingScore(a, query, context);
      var scoreB = this.calculateRankingScore(b, query, context);
      return scoreB - scoreA;
    });
  };
  /**
   * Calculate ranking score for a suggestion
   */
  SearchSuggestions.prototype.calculateRankingScore = function (suggestion, query, context) {
    var score = suggestion.confidence;
    // Boost based on type priority
    var typePriority = {
      query_completion: 1.0,
      entity_suggestion: 0.9,
      historical: 0.8,
      personalized: 0.7,
      popular: 0.6,
      contextual: 0.5,
      semantic: 0.4,
      filter_suggestion: 0.3,
    };
    score *= typePriority[suggestion.type] || 0.5;
    // Boost based on frequency
    score += Math.min(0.2, suggestion.frequency / 100);
    // Boost based on recency
    var daysSinceLastUsed = (Date.now() - suggestion.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 0.1 - daysSinceLastUsed * 0.01);
    // Boost based on text similarity
    var similarity = this.calculateSimilarity(query, suggestion.text);
    score += similarity * 0.3;
    return score;
  };
  /**
   * Remove duplicate suggestions
   */
  SearchSuggestions.prototype.deduplicateSuggestions = (suggestions) => {
    var seen = new Set();
    return suggestions.filter((suggestion) => {
      var key = suggestion.text.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };
  /**
   * Highlight matching text in suggestions
   */
  SearchSuggestions.prototype.highlightSuggestions = (suggestions, query) => {
    var queryLower = query.toLowerCase();
    return suggestions.map((suggestion) => {
      var text = suggestion.text;
      var textLower = text.toLowerCase();
      var index = textLower.indexOf(queryLower);
      if (index !== -1) {
        var before = text.substring(0, index);
        var match = text.substring(index, index + query.length);
        var after = text.substring(index + query.length);
        suggestion.highlighted = "".concat(before, "<mark>").concat(match, "</mark>").concat(after);
      } else {
        suggestion.highlighted = text;
      }
      return suggestion;
    });
  };
  /**
   * Learn from user interactions
   */
  SearchSuggestions.prototype.learnFromInteraction = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            // Update search analytics
            return [
              4 /*yield*/,
              this.supabase.from("search_analytics").upsert(
                {
                  query: data.query,
                  frequency: 1,
                  last_used: new Date().toISOString(),
                  success_rate: data.success ? 1 : 0,
                  avg_time_to_result: data.timeToSelect,
                },
                {
                  onConflict: "query",
                  ignoreDuplicates: false,
                },
              ),
            ];
          case 1:
            // Update search analytics
            _a.sent();
            if (!data.selectedSuggestion) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.updateSuggestionPerformance(data.selectedSuggestion, data.success),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            if (!data.success) return [3 /*break*/, 5];
            return [4 /*yield*/, this.updateUserPreferences(data)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            // Invalidate relevant caches
            this.invalidateCache(data.query);
            return [3 /*break*/, 7];
          case 6:
            error_9 = _a.sent();
            console.error("Error learning from interaction:", error_9);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update suggestion performance metrics
   */
  SearchSuggestions.prototype.updateSuggestionPerformance = function (suggestion, success) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("suggestion_performance").upsert(
                {
                  suggestion_text: suggestion,
                  usage_count: 1,
                  success_count: success ? 1 : 0,
                  last_used: new Date().toISOString(),
                },
                {
                  onConflict: "suggestion_text",
                  ignoreDuplicates: false,
                },
              ),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Error updating suggestion performance:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update user preferences based on successful searches
   */
  SearchSuggestions.prototype.updateUserPreferences = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  /**
   * Helper methods
   */
  SearchSuggestions.prototype.generateCacheKey = (query, context, options) =>
    "".concat(query, "_").concat(context.userId, "_").concat(JSON.stringify(options));
  SearchSuggestions.prototype.calculateSimilarity = function (str1, str2) {
    var longer = str1.length > str2.length ? str1 : str2;
    var shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    var editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };
  SearchSuggestions.prototype.levenshteinDistance = (str1, str2) => {
    var matrix = [];
    for (var i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (var j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (var i = 1; i <= str2.length; i++) {
      for (var j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };
  SearchSuggestions.prototype.loadPopularQueries = function () {
    return __awaiter(this, void 0, void 0, function () {
      var data, error_11;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("search_analytics")
                .select("query, frequency")
                .order("frequency", { ascending: false })
                .limit(100),
            ];
          case 1:
            data = _a.sent().data;
            if (data) {
              this.popularQueries.clear();
              data.forEach((item) => {
                _this.popularQueries.set(item.query, item.frequency);
              });
            }
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Error loading popular queries:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SearchSuggestions.prototype.loadEntitySuggestions = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  SearchSuggestions.prototype.loadCommonFilters = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  SearchSuggestions.prototype.getContextualQueries = (currentPage) => {
    var contextMap = {
      patients: ["buscar paciente", "pacientes ativos", "novos pacientes"],
      appointments: ["consultas hoje", "próximas consultas", "consultas canceladas"],
      treatments: ["tratamentos ativos", "planos de tratamento", "tratamentos concluídos"],
      reports: ["relatórios mensais", "estatísticas", "análise de dados"],
    };
    return contextMap[currentPage] || [];
  };
  SearchSuggestions.prototype.getDataTypeQueries = (dataType, query) => {
    var typeMap = {
      patient: ["pacientes ".concat(query), "buscar paciente ".concat(query)],
      appointment: ["consultas ".concat(query), "agendamentos ".concat(query)],
      treatment: ["tratamentos ".concat(query), "procedimentos ".concat(query)],
      note: ["anota\u00E7\u00F5es ".concat(query), "observa\u00E7\u00F5es ".concat(query)],
    };
    return typeMap[dataType] || [];
  };
  SearchSuggestions.prototype.invalidateCache = function (query) {
    // Remove cache entries that might be affected by the query
    for (var _i = 0, _a = this.suggestionCache.keys(); _i < _a.length; _i++) {
      var key = _a[_i];
      if (key.includes(query)) {
        this.suggestionCache.delete(key);
      }
    }
    for (var _b = 0, _c = this.completionCache.keys(); _b < _c.length; _b++) {
      var key = _c[_b];
      if (key.includes(query)) {
        this.completionCache.delete(key);
      }
    }
  };
  return SearchSuggestions;
})();
exports.SearchSuggestions = SearchSuggestions;
// Export singleton instance
var createsearchSuggestions = () => new SearchSuggestions();
exports.createsearchSuggestions = createsearchSuggestions;
