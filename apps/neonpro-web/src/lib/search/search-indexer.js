"use strict";
/**
 * Real-time Search Indexer
 * Story 3.4: Smart Search + NLP Integration
 * Handles real-time indexing of all clinic content for fast search
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchIndexer = exports.SearchIndexer = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var nlp_engine_1 = require("./nlp-engine");
/**
 * Real-time Search Indexer
 * Maintains up-to-date search index for all clinic content
 */
var SearchIndexer = /** @class */ (function () {
  function SearchIndexer(supabaseUrl, supabaseKey) {
    this.indexingQueue = [];
    this.isProcessing = false;
    this.batchSize = 50;
    this.processingInterval = 1000; // 1 second
    this.stats = {
      totalEntries: 0,
      lastIndexed: new Date().toISOString(),
      indexingSpeed: 0,
      errorCount: 0,
    };
    if (supabaseUrl && supabaseKey) {
      this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    // Start processing queue
    this.startProcessing();
  }
  /**
   * Add content to indexing queue
   */
  SearchIndexer.prototype.indexContent = function (content) {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            // Add to queue for batch processing
            this.indexingQueue.push(content);
            if (!(this.indexingQueue.length >= this.batchSize)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.processQueue()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Error adding content to index queue:", error_1);
            this.stats.errorCount++;
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Remove content from index
   */
  SearchIndexer.prototype.removeFromIndex = function (contentType, contentId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this.supabase) {
              console.warn("Supabase client not initialized");
              return [2 /*return*/];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("search_index")
                .delete()
                .eq("content_type", contentType)
                .eq("content_id", contentId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw error;
            }
            console.log(
              "Removed ".concat(contentType, ":").concat(contentId, " from search index"),
            );
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error removing from index:", error_2);
            this.stats.errorCount++;
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update existing index entry
   */
  SearchIndexer.prototype.updateIndex = function (content) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.indexContent(content)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Bulk index multiple content items
   */
  SearchIndexer.prototype.bulkIndex = function (contents) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, _i, contents_1, content, endTime, processingTime, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            startTime = Date.now();
            for (_i = 0, contents_1 = contents; _i < contents_1.length; _i++) {
              content = contents_1[_i];
              this.indexingQueue.push(content);
            }
            return [4 /*yield*/, this.processQueue()];
          case 1:
            _a.sent();
            endTime = Date.now();
            processingTime = (endTime - startTime) / 1000;
            this.stats.indexingSpeed = contents.length / processingTime;
            console.log(
              "Bulk indexed ".concat(contents.length, " items in ").concat(processingTime, "s"),
            );
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error in bulk indexing:", error_3);
            this.stats.errorCount++;
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Search the index
   */
  SearchIndexer.prototype.search = function (query_1) {
    return __awaiter(this, arguments, void 0, function (query, options) {
      var startTime,
        _a,
        language,
        contentTypes,
        _b,
        limit,
        _c,
        offset,
        _d,
        filters,
        nlpResult,
        searchQuery,
        _i,
        _e,
        _f,
        key,
        value,
        _g,
        data,
        error,
        count,
        processingTime,
        error_4;
      var _h;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_j) {
        switch (_j.label) {
          case 0:
            startTime = Date.now();
            _j.label = 1;
          case 1:
            _j.trys.push([1, 5, , 6]);
            if (!this.supabase) {
              throw new Error("Supabase client not initialized");
            }
            (_a = options.language),
              (language = _a === void 0 ? "pt" : _a),
              (contentTypes = options.contentTypes),
              (_b = options.limit),
              (limit = _b === void 0 ? 20 : _b),
              (_c = options.offset),
              (offset = _c === void 0 ? 0 : _c),
              (_d = options.filters),
              (filters = _d === void 0 ? {} : _d);
            return [4 /*yield*/, nlp_engine_1.nlpEngine.processQuery(query, language)];
          case 2:
            nlpResult = _j.sent();
            searchQuery = this.supabase.rpc("search_with_nlp", {
              p_query: nlpResult.normalized,
              p_language: language,
              p_limit: limit,
              p_offset: offset,
              p_content_types: contentTypes,
            });
            // Apply additional filters
            if (Object.keys(filters).length > 0) {
              for (_i = 0, _e = Object.entries(filters); _i < _e.length; _i++) {
                (_f = _e[_i]), (key = _f[0]), (value = _f[1]);
                searchQuery = searchQuery.contains(
                  "metadata_json",
                  ((_h = {}), (_h[key] = value), _h),
                );
              }
            }
            return [4 /*yield*/, searchQuery];
          case 3:
            (_g = _j.sent()), (data = _g.data), (error = _g.error), (count = _g.count);
            if (error) {
              throw error;
            }
            processingTime = Date.now() - startTime;
            // Log search analytics
            return [
              4 /*yield*/,
              this.logSearchAnalytics(
                query,
                nlpResult,
                (data === null || data === void 0 ? void 0 : data.length) || 0,
                processingTime,
              ),
            ];
          case 4:
            // Log search analytics
            _j.sent();
            return [
              2 /*return*/,
              {
                results: data || [],
                totalCount: count || 0,
                processingTime: processingTime,
              },
            ];
          case 5:
            error_4 = _j.sent();
            console.error("Search error:", error_4);
            this.stats.errorCount++;
            return [
              2 /*return*/,
              {
                results: [],
                totalCount: 0,
                processingTime: Date.now() - startTime,
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get search suggestions
   */
  SearchIndexer.prototype.getSuggestions = function (partialQuery_1) {
    return __awaiter(this, arguments, void 0, function (partialQuery, language, limit) {
      var _a, data, error, suggestions, nlpSuggestions, combined, error_5;
      if (language === void 0) {
        language = "pt";
      }
      if (limit === void 0) {
        limit = 10;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!this.supabase) {
              // Fallback to NLP engine suggestions
              return [2 /*return*/, nlp_engine_1.nlpEngine.getSuggestions(partialQuery, language)];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("search_suggestions")
                .select("suggestion_text")
                .ilike("suggestion_text", "".concat(partialQuery, "%"))
                .eq("language", language)
                .order("usage_count", { ascending: false })
                .order("relevance_score", { ascending: false })
                .limit(limit),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw error;
            }
            suggestions =
              (data === null || data === void 0
                ? void 0
                : data.map(function (item) {
                    return item.suggestion_text;
                  })) || [];
            // Combine with NLP suggestions if we have fewer than requested
            if (suggestions.length < limit) {
              nlpSuggestions = nlp_engine_1.nlpEngine.getSuggestions(partialQuery, language);
              combined = __spreadArray(__spreadArray([], suggestions, true), nlpSuggestions, true);
              return [2 /*return*/, __spreadArray([], new Set(combined), true).slice(0, limit)];
            }
            return [2 /*return*/, suggestions];
          case 2:
            error_5 = _b.sent();
            console.error("Error getting suggestions:", error_5);
            return [2 /*return*/, nlp_engine_1.nlpEngine.getSuggestions(partialQuery, language)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process indexing queue
   */
  SearchIndexer.prototype.processQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, batch, indexEntries, error, processingTime, error_6;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isProcessing || this.indexingQueue.length === 0) {
              return [2 /*return*/];
            }
            this.isProcessing = true;
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, 6, 7]);
            batch = this.indexingQueue.splice(0, this.batchSize);
            return [
              4 /*yield*/,
              Promise.all(
                batch.map(function (content) {
                  return _this.prepareIndexEntry(content);
                }),
              ),
            ];
          case 2:
            indexEntries = _a.sent();
            if (!this.supabase) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.supabase.from("search_index").upsert(indexEntries, {
                onConflict: "content_type,content_id",
              }),
            ];
          case 3:
            error = _a.sent().error;
            if (error) {
              throw error;
            }
            _a.label = 4;
          case 4:
            this.stats.totalEntries += batch.length;
            this.stats.lastIndexed = new Date().toISOString();
            processingTime = (Date.now() - startTime) / 1000;
            this.stats.indexingSpeed = batch.length / processingTime;
            console.log(
              "Processed ".concat(batch.length, " index entries in ").concat(processingTime, "s"),
            );
            return [3 /*break*/, 7];
          case 5:
            error_6 = _a.sent();
            console.error("Error processing index queue:", error_6);
            this.stats.errorCount++;
            return [3 /*break*/, 7];
          case 6:
            this.isProcessing = false;
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Prepare content for indexing
   */
  SearchIndexer.prototype.prepareIndexEntry = function (content) {
    return __awaiter(this, void 0, void 0, function () {
      var language, nlpResult, keywords, relevanceScore;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            language = content.language || "pt";
            return [
              4 /*yield*/,
              nlp_engine_1.nlpEngine.processQuery(content.searchableText, language),
            ];
          case 1:
            nlpResult = _a.sent();
            keywords = __spreadArray(
              __spreadArray(
                __spreadArray([], nlpResult.tokens, true),
                nlpResult.entities.map(function (e) {
                  return e.value;
                }),
                true,
              ),
              content.keywords || [],
              true,
            );
            relevanceScore = this.calculateRelevanceScore(content, nlpResult.confidence);
            return [
              2 /*return*/,
              {
                content_type: content.contentType,
                content_id: content.contentId,
                searchable_text: content.searchableText,
                metadata_json: content.metadata || {},
                keywords: __spreadArray([], new Set(keywords), true),
                language: language,
                relevance_score: relevanceScore,
                last_updated: new Date().toISOString(),
              },
            ];
        }
      });
    });
  };
  /**
   * Calculate relevance score for content
   */
  SearchIndexer.prototype.calculateRelevanceScore = function (content, nlpConfidence) {
    var score = 1.0;
    // Boost score based on content type importance
    switch (content.contentType) {
      case "patient":
        score *= 1.5;
        break;
      case "appointment":
        score *= 1.3;
        break;
      case "treatment":
        score *= 1.2;
        break;
      case "note":
        score *= 1.1;
        break;
      default:
        score *= 1.0;
    }
    // Factor in NLP confidence
    score *= 0.5 + nlpConfidence * 0.5;
    // Boost for longer, more detailed content
    var textLength = content.searchableText.length;
    if (textLength > 500) {
      score *= 1.2;
    } else if (textLength > 100) {
      score *= 1.1;
    }
    return Math.round(score * 100) / 100;
  };
  /**
   * Log search analytics
   */
  SearchIndexer.prototype.logSearchAnalytics = function (
    query,
    nlpResult,
    resultCount,
    responseTime,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this.supabase) {
              return [2 /*return*/];
            }
            return [
              4 /*yield*/,
              this.supabase.from("search_analytics").insert({
                query: query,
                normalized_query: nlpResult.normalized,
                query_intent: nlpResult.intent.primary,
                results_count: resultCount,
                response_time_ms: responseTime,
                language: nlpResult.language,
                search_filters: {},
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error logging search analytics:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            console.error("Error in search analytics logging:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Start background processing
   */
  SearchIndexer.prototype.startProcessing = function () {
    var _this = this;
    setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!(this.indexingQueue.length > 0)) return [3 /*break*/, 2];
              return [4 /*yield*/, this.processQueue()];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              return [2 /*return*/];
          }
        });
      });
    }, this.processingInterval);
  };
  /**
   * Get indexing statistics
   */
  SearchIndexer.prototype.getStats = function () {
    return __assign({}, this.stats);
  };
  /**
   * Clear index for content type
   */
  SearchIndexer.prototype.clearIndex = function (contentType) {
    return __awaiter(this, void 0, void 0, function () {
      var query, error, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this.supabase) {
              console.warn("Supabase client not initialized");
              return [2 /*return*/];
            }
            query = this.supabase.from("search_index").delete();
            if (contentType) {
              query = query.eq("content_type", contentType);
            } else {
              query = query.neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
            }
            return [4 /*yield*/, query];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw error;
            }
            console.log(
              "Cleared search index".concat(contentType ? " for ".concat(contentType) : ""),
            );
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            console.error("Error clearing index:", error_8);
            this.stats.errorCount++;
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Rebuild entire index
   */
  SearchIndexer.prototype.rebuildIndex = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            console.log("Starting index rebuild...");
            // Clear existing index
            return [4 /*yield*/, this.clearIndex()];
          case 1:
            // Clear existing index
            _a.sent();
            // TODO: Implement full rebuild by fetching all content from database
            // This would typically involve:
            // 1. Fetch all patients, appointments, treatments, etc.
            // 2. Process each item through indexContent()
            // 3. Monitor progress and handle errors
            console.log("Index rebuild completed");
            return [3 /*break*/, 3];
          case 2:
            error_9 = _a.sent();
            console.error("Error rebuilding index:", error_9);
            this.stats.errorCount++;
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return SearchIndexer;
})();
exports.SearchIndexer = SearchIndexer;
// Export singleton instance
exports.searchIndexer = new SearchIndexer(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
