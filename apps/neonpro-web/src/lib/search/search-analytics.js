"use strict";
/**
 * Search Analytics System
 * Story 3.4: Smart Search + NLP Integration - Task 6
 * Performance monitoring and analytics for search operations
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createsearchAnalytics = exports.SearchAnalytics = void 0;
var client_1 = require("@/lib/supabase/client");
/**
 * Search Analytics Class
 * Comprehensive analytics and performance monitoring for search operations
 */
var SearchAnalytics = /** @class */ (function () {
  function SearchAnalytics() {
    this.supabase = (0, client_1.createClient)();
    this.performanceThresholds = {
      responseTime: 2000, // 2 seconds
      successRate: 0.95, // 95%
      errorRate: 0.05, // 5%
      clickThroughRate: 0.3, // 30%
    };
    this.alertCallbacks = [];
    this.metricsCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  /**
   * Track a search event
   */
  SearchAnalytics.prototype.trackSearchEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var searchEvent, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            searchEvent = __assign(__assign({}, event), { timestamp: Date.now() });
            return [
              4 /*yield*/,
              this.supabase.from("search_analytics").insert({
                user_id: searchEvent.userId,
                session_id: searchEvent.sessionId,
                query: searchEvent.query,
                search_type: searchEvent.searchType,
                nlp_results: searchEvent.nlpResults,
                filters: searchEvent.filters,
                result_count: searchEvent.resultCount,
                response_time: searchEvent.responseTime,
                performance_breakdown: searchEvent.performanceBreakdown,
                success: searchEvent.success,
                error_message: searchEvent.errorMessage,
                clicked_results: searchEvent.clickedResults,
                refined_query: searchEvent.refinedQuery,
                user_agent: searchEvent.userAgent,
                ip_address: searchEvent.ipAddress,
                created_at: new Date(searchEvent.timestamp).toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to track search event:", error);
              return [2 /*return*/];
            }
            // Check for performance alerts
            return [4 /*yield*/, this.checkPerformanceAlerts(searchEvent)];
          case 2:
            // Check for performance alerts
            _a.sent();
            // Update real-time metrics
            this.updateRealTimeMetrics(searchEvent);
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Error tracking search event:", error_1);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Track user interaction with search results
   */
  SearchAnalytics.prototype.trackResultInteraction = function (
    sessionId,
    query,
    resultId,
    action,
    position,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("search_result_interactions").insert({
                session_id: sessionId,
                query: query,
                result_id: resultId,
                action: action,
                position: position,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to track result interaction:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error tracking result interaction:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get comprehensive search metrics
   */
  SearchAnalytics.prototype.getSearchMetrics = function () {
    return __awaiter(this, arguments, void 0, function (options) {
      var cacheKey, cached, timeRange, query, _a, searchEvents, error, metrics, error_3;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "metrics_".concat(JSON.stringify(options));
            cached = this.metricsCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
              return [2 /*return*/, cached.data];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            timeRange = options.timeRange || {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              end: new Date(),
            };
            query = this.supabase
              .from("search_analytics")
              .select("*")
              .gte("created_at", timeRange.start.toISOString())
              .lte("created_at", timeRange.end.toISOString());
            if (options.userId) {
              query = query.eq("user_id", options.userId);
            }
            if (options.searchType) {
              query = query.eq("search_type", options.searchType);
            }
            if (!options.includeAnonymous) {
              query = query.not("user_id", "is", null);
            }
            return [4 /*yield*/, query];
          case 2:
            (_a = _b.sent()), (searchEvents = _a.data), (error = _a.error);
            if (error) {
              throw error;
            }
            metrics = this.calculateMetrics(searchEvents || []);
            // Cache results
            this.metricsCache.set(cacheKey, {
              data: metrics,
              timestamp: Date.now(),
            });
            return [2 /*return*/, metrics];
          case 3:
            error_3 = _b.sent();
            console.error("Error getting search metrics:", error_3);
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get user search behavior analysis
   */
  SearchAnalytics.prototype.getUserSearchBehavior = function (userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, days) {
      var startDate, _a, searchEvents, error, _b, interactions, interactionError, error_4;
      if (days === void 0) {
        days = 30;
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, , 4]);
            startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("search_analytics")
                .select("*")
                .eq("user_id", userId)
                .gte("created_at", startDate.toISOString())
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _c.sent()), (searchEvents = _a.data), (error = _a.error);
            if (error) {
              throw error;
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("search_result_interactions")
                .select("*")
                .in(
                  "session_id",
                  (searchEvents === null || searchEvents === void 0
                    ? void 0
                    : searchEvents.map(function (e) {
                        return e.session_id;
                      })) || [],
                )
                .gte("created_at", startDate.toISOString()),
            ];
          case 2:
            (_b = _c.sent()), (interactions = _b.data), (interactionError = _b.error);
            if (interactionError) {
              throw interactionError;
            }
            return [2 /*return*/, this.analyzeBehavior(searchEvents || [], interactions || [])];
          case 3:
            error_4 = _c.sent();
            console.error("Error getting user search behavior:", error_4);
            throw error_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get performance alerts
   */
  SearchAnalytics.prototype.getPerformanceAlerts = function () {
    return __awaiter(this, arguments, void 0, function (resolved) {
      var _a, data, error, error_5;
      if (resolved === void 0) {
        resolved = false;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("performance_alerts")
                .select("*")
                .eq("resolved", resolved)
                .order("timestamp", { ascending: false })
                .limit(100),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw error;
            }
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map(function (alert) {
                    return {
                      id: alert.id,
                      type: alert.type,
                      severity: alert.severity,
                      message: alert.message,
                      metrics: alert.metrics,
                      threshold: alert.threshold,
                      currentValue: alert.current_value,
                      timestamp: new Date(alert.created_at).getTime(),
                      resolved: alert.resolved,
                      resolvedAt: alert.resolved_at
                        ? new Date(alert.resolved_at).getTime()
                        : undefined,
                    };
                  })) || [],
            ];
          case 2:
            error_5 = _b.sent();
            console.error("Error getting performance alerts:", error_5);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get search optimization suggestions
   */
  SearchAnalytics.prototype.getOptimizationSuggestions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, slowQueries, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("search_analytics")
                .select("query, response_time, performance_breakdown")
                .gt("response_time", this.performanceThresholds.responseTime)
                .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .order("response_time", { ascending: false })
                .limit(100),
            ];
          case 1:
            (_a = _b.sent()), (slowQueries = _a.data), (error = _a.error);
            if (error) {
              throw error;
            }
            return [2 /*return*/, this.generateOptimizations(slowQueries || [])];
          case 2:
            error_6 = _b.sent();
            console.error("Error getting optimization suggestions:", error_6);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate performance report
   */
  SearchAnalytics.prototype.generatePerformanceReport = function () {
    return __awaiter(this, arguments, void 0, function (options) {
      var _a, summary, alerts, optimizations, trends, recommendations, error_7;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              Promise.all([
                this.getSearchMetrics(options),
                this.getPerformanceAlerts(false),
                this.getOptimizationSuggestions(),
              ]),
            ];
          case 1:
            (_a = _b.sent()), (summary = _a[0]), (alerts = _a[1]), (optimizations = _a[2]);
            return [4 /*yield*/, this.generateTrends(options)];
          case 2:
            trends = _b.sent();
            recommendations = this.generateRecommendations(summary, alerts, optimizations);
            return [
              2 /*return*/,
              {
                summary: summary,
                trends: trends,
                alerts: alerts,
                optimizations: optimizations,
                recommendations: recommendations,
              },
            ];
          case 3:
            error_7 = _b.sent();
            console.error("Error generating performance report:", error_7);
            throw error_7;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Subscribe to performance alerts
   */
  SearchAnalytics.prototype.onPerformanceAlert = function (callback) {
    var _this = this;
    this.alertCallbacks.push(callback);
    return function () {
      var index = _this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        _this.alertCallbacks.splice(index, 1);
      }
    };
  };
  /**
   * Clear analytics cache
   */
  SearchAnalytics.prototype.clearCache = function () {
    this.metricsCache.clear();
  };
  // Private methods
  SearchAnalytics.prototype.calculateMetrics = function (searchEvents) {
    if (searchEvents.length === 0) {
      return {
        totalSearches: 0,
        averageResponseTime: 0,
        successRate: 0,
        popularQueries: [],
        searchTypes: [],
        userEngagement: {
          clickThroughRate: 0,
          averageResultsViewed: 0,
          refinementRate: 0,
        },
        performanceBreakdown: {
          nlpProcessing: 0,
          databaseQuery: 0,
          resultProcessing: 0,
          total: 0,
        },
      };
    }
    var totalSearches = searchEvents.length;
    var successfulSearches = searchEvents.filter(function (e) {
      return e.success;
    }).length;
    var averageResponseTime =
      searchEvents.reduce(function (sum, e) {
        return sum + e.response_time;
      }, 0) / totalSearches;
    var successRate = successfulSearches / totalSearches;
    // Popular queries
    var queryCount = new Map();
    searchEvents.forEach(function (event) {
      var existing = queryCount.get(event.query) || { count: 0, totalTime: 0, successes: 0 };
      queryCount.set(event.query, {
        count: existing.count + 1,
        totalTime: existing.totalTime + event.response_time,
        successes: existing.successes + (event.success ? 1 : 0),
      });
    });
    var popularQueries = Array.from(queryCount.entries())
      .map(function (_a) {
        var query = _a[0],
          stats = _a[1];
        return {
          query: query,
          count: stats.count,
          avgResponseTime: stats.totalTime / stats.count,
          successRate: stats.successes / stats.count,
        };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      })
      .slice(0, 10);
    // Search types
    var typeCount = new Map();
    searchEvents.forEach(function (event) {
      var existing = typeCount.get(event.search_type) || { count: 0, totalTime: 0 };
      typeCount.set(event.search_type, {
        count: existing.count + 1,
        totalTime: existing.totalTime + event.response_time,
      });
    });
    var searchTypes = Array.from(typeCount.entries()).map(function (_a) {
      var type = _a[0],
        stats = _a[1];
      return {
        type: type,
        count: stats.count,
        avgResponseTime: stats.totalTime / stats.count,
      };
    });
    // Performance breakdown
    var performanceBreakdown = searchEvents.reduce(
      function (acc, event) {
        var breakdown = event.performance_breakdown || {};
        return {
          nlpProcessing: acc.nlpProcessing + (breakdown.nlpProcessing || 0),
          databaseQuery: acc.databaseQuery + (breakdown.databaseQuery || 0),
          resultProcessing: acc.resultProcessing + (breakdown.resultProcessing || 0),
          total: acc.total + event.response_time,
        };
      },
      { nlpProcessing: 0, databaseQuery: 0, resultProcessing: 0, total: 0 },
    );
    // Average the breakdown
    Object.keys(performanceBreakdown).forEach(function (key) {
      performanceBreakdown[key] /= totalSearches;
    });
    return {
      totalSearches: totalSearches,
      averageResponseTime: averageResponseTime,
      successRate: successRate,
      popularQueries: popularQueries,
      searchTypes: searchTypes,
      userEngagement: {
        clickThroughRate: 0.3, // TODO: Calculate from interactions
        averageResultsViewed: 5.2, // TODO: Calculate from interactions
        refinementRate: 0.15, // TODO: Calculate from refined queries
      },
      performanceBreakdown: performanceBreakdown,
    };
  };
  SearchAnalytics.prototype.analyzeBehavior = function (searchEvents, interactions) {
    var _a;
    var totalSearches = searchEvents.length;
    if (totalSearches === 0) {
      return {
        userId: "",
        totalSearches: 0,
        averageSessionDuration: 0,
        preferredSearchTypes: [],
        commonQueries: [],
        clickThroughRate: 0,
        refinementPatterns: [],
        performancePreferences: {
          prefersVoice: false,
          prefersFilters: false,
          averageResultsViewed: 0,
        },
      };
    }
    // Calculate session durations
    var sessions = new Map();
    searchEvents.forEach(function (event) {
      var timestamp = new Date(event.created_at).getTime();
      var existing = sessions.get(event.session_id);
      if (!existing) {
        sessions.set(event.session_id, { start: timestamp, end: timestamp });
      } else {
        sessions.set(event.session_id, {
          start: Math.min(existing.start, timestamp),
          end: Math.max(existing.end, timestamp),
        });
      }
    });
    var averageSessionDuration =
      Array.from(sessions.values()).reduce(function (sum, session) {
        return sum + (session.end - session.start);
      }, 0) / sessions.size;
    // Preferred search types
    var typeCount = new Map();
    searchEvents.forEach(function (event) {
      typeCount.set(event.search_type, (typeCount.get(event.search_type) || 0) + 1);
    });
    var preferredSearchTypes = Array.from(typeCount.entries())
      .sort(function (a, b) {
        return b[1] - a[1];
      })
      .map(function (_a) {
        var type = _a[0];
        return type;
      });
    // Common queries
    var queryCount = new Map();
    searchEvents.forEach(function (event) {
      queryCount.set(event.query, (queryCount.get(event.query) || 0) + 1);
    });
    var commonQueries = Array.from(queryCount.entries())
      .sort(function (a, b) {
        return b[1] - a[1];
      })
      .slice(0, 10)
      .map(function (_a) {
        var query = _a[0];
        return query;
      });
    // Click-through rate
    var clickedSessions = new Set(
      interactions
        .filter(function (i) {
          return i.action === "click";
        })
        .map(function (i) {
          return i.session_id;
        }),
    );
    var clickThroughRate = clickedSessions.size / sessions.size;
    return {
      userId: ((_a = searchEvents[0]) === null || _a === void 0 ? void 0 : _a.user_id) || "",
      totalSearches: totalSearches,
      averageSessionDuration: averageSessionDuration,
      preferredSearchTypes: preferredSearchTypes,
      commonQueries: commonQueries,
      clickThroughRate: clickThroughRate,
      refinementPatterns: [], // TODO: Implement refinement pattern analysis
      performancePreferences: {
        prefersVoice: preferredSearchTypes[0] === "voice",
        prefersFilters: searchEvents.some(function (e) {
          return e.filters && Object.keys(e.filters).length > 0;
        }),
        averageResultsViewed:
          interactions.filter(function (i) {
            return i.action === "view";
          }).length / totalSearches,
      },
    };
  };
  SearchAnalytics.prototype.checkPerformanceAlerts = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _loop_1, this_1, _i, alerts_1, alert_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alerts = [];
            // Check response time
            if (event.responseTime > this.performanceThresholds.responseTime) {
              alerts.push({
                id: "slow_response_".concat(Date.now()),
                type: "slow_response",
                severity:
                  event.responseTime > this.performanceThresholds.responseTime * 2
                    ? "high"
                    : "medium",
                message: "Slow search response: "
                  .concat(event.responseTime, 'ms for query "')
                  .concat(event.query, '"'),
                metrics: { responseTime: event.responseTime },
                threshold: this.performanceThresholds.responseTime,
                currentValue: event.responseTime,
                timestamp: Date.now(),
                resolved: false,
              });
            }
            // Check for errors
            if (!event.success) {
              alerts.push({
                id: "search_error_".concat(Date.now()),
                type: "high_error_rate",
                severity: "medium",
                message: 'Search failed for query "'
                  .concat(event.query, '": ')
                  .concat(event.errorMessage),
                metrics: { success: 0 },
                threshold: this.performanceThresholds.successRate,
                currentValue: 0,
                timestamp: Date.now(),
                resolved: false,
              });
            }
            _loop_1 = function (alert_1) {
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    return [4 /*yield*/, this_1.storeAlert(alert_1)];
                  case 1:
                    _b.sent();
                    this_1.alertCallbacks.forEach(function (callback) {
                      return callback(alert_1);
                    });
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (alerts_1 = alerts);
            _a.label = 1;
          case 1:
            if (!(_i < alerts_1.length)) return [3 /*break*/, 4];
            alert_1 = alerts_1[_i];
            return [5 /*yield**/, _loop_1(alert_1)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  SearchAnalytics.prototype.storeAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("performance_alerts").insert({
                type: alert.type,
                severity: alert.severity,
                message: alert.message,
                metrics: alert.metrics,
                threshold: alert.threshold,
                current_value: alert.currentValue,
                resolved: alert.resolved,
                created_at: new Date(alert.timestamp).toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to store performance alert:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            console.error("Error storing performance alert:", error_8);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SearchAnalytics.prototype.updateRealTimeMetrics = function (event) {
    // Update real-time metrics cache
    var key = "realtime_metrics";
    var cached = this.metricsCache.get(key);
    if (cached) {
      // Update existing metrics
      cached.data.totalSearches += 1;
      cached.data.averageResponseTime =
        (cached.data.averageResponseTime * (cached.data.totalSearches - 1) + event.responseTime) /
        cached.data.totalSearches;
      if (event.success) {
        cached.data.successRate =
          (cached.data.successRate * (cached.data.totalSearches - 1) + 1) /
          cached.data.totalSearches;
      } else {
        cached.data.successRate =
          (cached.data.successRate * (cached.data.totalSearches - 1)) / cached.data.totalSearches;
      }
    }
  };
  SearchAnalytics.prototype.generateOptimizations = function (slowQueries) {
    var optimizations = [];
    // Analyze query patterns
    var queryPatterns = new Map();
    slowQueries.forEach(function (query) {
      // Simple pattern detection (could be enhanced with ML)
      var pattern = query.query
        .toLowerCase()
        .replace(/\d+/g, "N")
        .replace(/[^a-z\s]/g, "");
      queryPatterns.set(pattern, (queryPatterns.get(pattern) || 0) + 1);
    });
    // Generate optimizations for common patterns
    queryPatterns.forEach(function (count, pattern) {
      if (count >= 5) {
        // Pattern appears in at least 5 slow queries
        optimizations.push({
          queryPattern: pattern,
          optimization: {
            type: "index",
            description: "Create specialized index for pattern: ".concat(pattern),
            expectedImprovement: 0.4, // 40% improvement
            implementation: "CREATE INDEX idx_search_".concat(
              pattern.replace(/\s+/g, "_"),
              " ON relevant_table (...)",
            ),
          },
          impact: {
            affectedQueries: count,
            potentialSpeedup: 0.4,
            confidenceScore: Math.min(count / 10, 1), // Higher confidence with more occurrences
          },
        });
      }
    });
    return optimizations;
  };
  SearchAnalytics.prototype.generateTrends = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var trends, days, i, date, dayStart, dayEnd, dayMetrics;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            trends = [];
            days = 7;
            i = days - 1;
            _a.label = 1;
          case 1:
            if (!(i >= 0)) return [3 /*break*/, 4];
            date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.getSearchMetrics(
                __assign(__assign({}, options), { timeRange: { start: dayStart, end: dayEnd } }),
              ),
            ];
          case 2:
            dayMetrics = _a.sent();
            trends.push({
              date: date.toISOString().split("T")[0],
              metrics: {
                totalSearches: dayMetrics.totalSearches,
                averageResponseTime: dayMetrics.averageResponseTime,
                successRate: dayMetrics.successRate,
              },
            });
            _a.label = 3;
          case 3:
            i--;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, trends];
        }
      });
    });
  };
  SearchAnalytics.prototype.generateRecommendations = function (metrics, alerts, optimizations) {
    var recommendations = [];
    // Performance recommendations
    if (metrics.averageResponseTime > this.performanceThresholds.responseTime) {
      recommendations.push(
        "Tempo de resposta m\u00E9dio (".concat(
          Math.round(metrics.averageResponseTime),
          "ms) est\u00E1 acima do limite recomendado. Considere implementar cache ou otimizar consultas.",
        ),
      );
    }
    if (metrics.successRate < this.performanceThresholds.successRate) {
      recommendations.push(
        "Taxa de sucesso (".concat(
          Math.round(metrics.successRate * 100),
          "%) est\u00E1 abaixo do esperado. Revise o tratamento de erros e valida\u00E7\u00E3o de consultas.",
        ),
      );
    }
    // Alert-based recommendations
    var criticalAlerts = alerts.filter(function (a) {
      return a.severity === "critical";
    }).length;
    if (criticalAlerts > 0) {
      recommendations.push(
        "".concat(
          criticalAlerts,
          " alertas cr\u00EDticos detectados. A\u00E7\u00E3o imediata necess\u00E1ria para manter a qualidade do servi\u00E7o.",
        ),
      );
    }
    // Optimization recommendations
    if (optimizations.length > 0) {
      var highImpactOptimizations = optimizations.filter(function (o) {
        return o.impact.potentialSpeedup > 0.3;
      }).length;
      if (highImpactOptimizations > 0) {
        recommendations.push(
          "".concat(
            highImpactOptimizations,
            " otimiza\u00E7\u00F5es de alto impacto identificadas. Implementa\u00E7\u00E3o pode melhorar performance significativamente.",
          ),
        );
      }
    }
    // Usage pattern recommendations
    if (metrics.userEngagement.clickThroughRate < this.performanceThresholds.clickThroughRate) {
      recommendations.push(
        "Taxa de cliques baixa (".concat(
          Math.round(metrics.userEngagement.clickThroughRate * 100),
          "%). Considere melhorar relev\u00E2ncia dos resultados ou interface de usu\u00E1rio.",
        ),
      );
    }
    return recommendations;
  };
  return SearchAnalytics;
})();
exports.SearchAnalytics = SearchAnalytics;
// Export singleton instance
var createsearchAnalytics = function () {
  return new SearchAnalytics();
};
exports.createsearchAnalytics = createsearchAnalytics;
