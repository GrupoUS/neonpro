"use strict";
/**
 * Subscription Database Query Optimizer
 *
 * Advanced database query optimization for subscription operations:
 * - Query result caching with intelligent invalidation
 * - Connection pooling and management
 * - Query batching and aggregation
 * - Performance monitoring and optimization recommendations
 * - Automatic index usage optimization
 *
 * @author NeonPro Development Team
 * @version 1.0.0 - Performance Optimized
 */
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
exports.createsubscriptionQueryOptimizer = exports.SubscriptionQueryOptimizer = void 0;
var server_1 = require("@/lib/supabase/server");
var subscription_cache_enhanced_1 = require("./subscription-cache-enhanced");
var subscription_performance_monitor_1 = require("./subscription-performance-monitor");
var SubscriptionQueryOptimizer = /** @class */ (function () {
  function SubscriptionQueryOptimizer() {
    this.pendingBatches = new Map();
    this.queryStats = new Map();
    this.connectionPool = null;
    this.batchTimeout = null;
    this.BATCH_DELAY = 50; // ms
    this.MAX_BATCH_SIZE = 50;
    this.initializeConnectionPool();
    this.startBatchProcessor();
  }
  /**
   * Optimized subscription status query with caching and batching
   */
  SubscriptionQueryOptimizer.prototype.getSubscriptionStatus = function (userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, options) {
      var startTime, queryId, cacheKey, cached, result, validationResult, cacheKey, error_1;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = performance.now();
            queryId = "subscription_status_".concat(userId);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            if (!(options.useCache !== false)) return [3 /*break*/, 3];
            cacheKey = "subscription_status_".concat(userId);
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.get(cacheKey),
            ];
          case 2:
            cached = _a.sent();
            if (cached && !options.forceRefresh) {
              this.recordQueryStats(queryId, performance.now() - startTime, 1, true);
              return [2 /*return*/, cached];
            }
            _a.label = 3;
          case 3:
            return [
              4 /*yield*/,
              this.executeOptimizedQuery(this.buildSubscriptionStatusQuery(), [userId], options),
              // Process and cache result
            ];
          case 4:
            result = _a.sent();
            validationResult = this.processSubscriptionResult(result[0]);
            if (!(options.useCache !== false)) return [3 /*break*/, 6];
            cacheKey = "subscription_status_".concat(userId);
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.set(
                cacheKey,
                validationResult,
                options.cacheTTL,
              ),
            ];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            this.recordQueryStats(queryId, performance.now() - startTime, result.length, false);
            return [2 /*return*/, validationResult];
          case 7:
            error_1 = _a.sent();
            this.handleQueryError(error_1, queryId, startTime);
            throw error_1;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Batch subscription status queries for multiple users
   */
  SubscriptionQueryOptimizer.prototype.getBatchSubscriptionStatus = function (userIds_1) {
    return __awaiter(this, arguments, void 0, function (userIds, options) {
      var startTime,
        queryId,
        results,
        uncachedUserIds,
        _i,
        userIds_2,
        userId,
        cacheKey,
        cached,
        batchResults,
        i,
        userId,
        validationResult,
        cacheKey,
        error_2;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = performance.now();
            queryId = "batch_subscription_status_".concat(userIds.length);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 13, , 14]);
            results = new Map();
            uncachedUserIds = [];
            if (!(options.useCache !== false && !options.forceRefresh)) return [3 /*break*/, 6];
            (_i = 0), (userIds_2 = userIds);
            _a.label = 2;
          case 2:
            if (!(_i < userIds_2.length)) return [3 /*break*/, 5];
            userId = userIds_2[_i];
            cacheKey = "subscription_status_".concat(userId);
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.get(cacheKey),
            ];
          case 3:
            cached = _a.sent();
            if (cached) {
              results.set(userId, cached);
            } else {
              uncachedUserIds.push(userId);
            }
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 7];
          case 6:
            uncachedUserIds.push.apply(uncachedUserIds, userIds);
            _a.label = 7;
          case 7:
            if (!(uncachedUserIds.length > 0)) return [3 /*break*/, 12];
            return [
              4 /*yield*/,
              this.executeBatchQuery(
                this.buildBatchSubscriptionStatusQuery(uncachedUserIds.length),
                uncachedUserIds,
                options,
              ),
              // Process and cache results
            ];
          case 8:
            batchResults = _a.sent();
            i = 0;
            _a.label = 9;
          case 9:
            if (!(i < uncachedUserIds.length)) return [3 /*break*/, 12];
            userId = uncachedUserIds[i];
            validationResult = this.processSubscriptionResult(batchResults[i]);
            results.set(userId, validationResult);
            if (!(options.useCache !== false)) return [3 /*break*/, 11];
            cacheKey = "subscription_status_".concat(userId);
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.set(
                cacheKey,
                validationResult,
                options.cacheTTL,
              ),
            ];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            i++;
            return [3 /*break*/, 9];
          case 12:
            this.recordQueryStats(queryId, performance.now() - startTime, results.size, false);
            return [2 /*return*/, results];
          case 13:
            error_2 = _a.sent();
            this.handleQueryError(error_2, queryId, startTime);
            throw error_2;
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Optimized user plans query with advanced caching
   */
  SubscriptionQueryOptimizer.prototype.getUserPlans = function () {
    return __awaiter(this, arguments, void 0, function (filters, options) {
      var startTime, cacheKey, queryId, cached, query, result, cacheData, error_3;
      if (filters === void 0) {
        filters = {};
      }
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = performance.now();
            cacheKey = "user_plans_".concat(JSON.stringify(filters));
            queryId = "user_plans_".concat(Object.keys(filters).join("_"));
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            if (!(options.useCache !== false && !options.forceRefresh)) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.get(cacheKey),
            ];
          case 2:
            cached = _a.sent();
            if (cached && Array.isArray(cached.data)) {
              this.recordQueryStats(
                queryId,
                performance.now() - startTime,
                cached.data.length,
                true,
              );
              return [2 /*return*/, cached.data];
            }
            _a.label = 3;
          case 3:
            query = this.buildUserPlansQuery(filters);
            return [
              4 /*yield*/,
              this.executeOptimizedQuery(query.sql, query.params, options),
              // Cache result with proper structure
            ];
          case 4:
            result = _a.sent();
            if (!(options.useCache !== false)) return [3 /*break*/, 6];
            cacheData = {
              hasAccess: true,
              status: "active",
              subscription: null,
              message: "Plans data cached",
              performance: {
                validationTime: performance.now() - startTime,
                cacheHit: false,
                source: "database",
              },
              data: result, // Store actual data in a data property
            };
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.set(
                cacheKey,
                cacheData,
                options.cacheTTL || 300000,
              ),
            ]; // 5 min default
          case 5:
            _a.sent(); // 5 min default
            _a.label = 6;
          case 6:
            this.recordQueryStats(queryId, performance.now() - startTime, result.length, false);
            return [2 /*return*/, result];
          case 7:
            error_3 = _a.sent();
            this.handleQueryError(error_3, queryId, startTime);
            throw error_3;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Advanced subscription analytics query with aggregation
   */
  SubscriptionQueryOptimizer.prototype.getSubscriptionAnalytics = function (dateRange_1) {
    return __awaiter(this, arguments, void 0, function (dateRange, aggregation, options) {
      var startTime, cacheKey, queryId, cached, query, result, cacheData, error_4;
      if (aggregation === void 0) {
        aggregation = "daily";
      }
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = performance.now();
            cacheKey = "analytics_"
              .concat(dateRange.start.toISOString(), "_")
              .concat(dateRange.end.toISOString(), "_")
              .concat(aggregation);
            queryId = "subscription_analytics_".concat(aggregation);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            if (!(options.useCache !== false && !options.forceRefresh)) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.get(cacheKey),
            ];
          case 2:
            cached = _a.sent();
            if (cached && Array.isArray(cached.data)) {
              this.recordQueryStats(
                queryId,
                performance.now() - startTime,
                cached.data.length,
                true,
              );
              return [2 /*return*/, cached.data];
            }
            _a.label = 3;
          case 3:
            query = this.buildAnalyticsQuery(dateRange, aggregation);
            return [
              4 /*yield*/,
              this.executeOptimizedQuery(query.sql, query.params, options),
              // Cache with longer TTL for analytics with proper structure
            ];
          case 4:
            result = _a.sent();
            if (!(options.useCache !== false)) return [3 /*break*/, 6];
            cacheData = {
              hasAccess: true,
              status: "active",
              subscription: null,
              message: "Analytics data cached",
              performance: {
                validationTime: performance.now() - startTime,
                cacheHit: false,
                source: "database",
              },
              data: result, // Store actual data in a data property
            };
            return [
              4 /*yield*/,
              subscription_cache_enhanced_1.enhancedSubscriptionCache.set(
                cacheKey,
                cacheData,
                options.cacheTTL || 1800000,
              ),
            ]; // 30 min default
          case 5:
            _a.sent(); // 30 min default
            _a.label = 6;
          case 6:
            this.recordQueryStats(queryId, performance.now() - startTime, result.length, false);
            return [2 /*return*/, result];
          case 7:
            error_4 = _a.sent();
            this.handleQueryError(error_4, queryId, startTime);
            throw error_4;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute optimized query with connection management
   */
  SubscriptionQueryOptimizer.prototype.executeOptimizedQuery = function (sql_1) {
    return __awaiter(this, arguments, void 0, function (sql, params, options) {
      var startTime,
        supabase,
        controller,
        timerId,
        result,
        _a,
        data,
        error,
        _b,
        data,
        error,
        duration,
        error_5;
      if (params === void 0) {
        params = [];
      }
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            startTime = performance.now();
            return [
              4 /*yield*/,
              (0, server_1.createClient)(),
              // Add timeout if specified
            ];
          case 1:
            supabase = _c.sent();
            controller = new AbortController();
            if (options.timeout) {
              setTimeout(function () {
                return controller.abort();
              }, options.timeout);
            }
            _c.label = 2;
          case 2:
            _c.trys.push([2, 7, , 8]);
            timerId = subscription_performance_monitor_1.subscriptionPerformanceMonitor.startTimer(
              "query_".concat(sql.substring(0, 20)),
            );
            result = void 0;
            if (!sql.includes("SELECT")) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              supabase.rpc("execute_optimized_query", {
                query: sql,
                parameters: params,
              }),
            ];
          case 3:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            result = data;
            return [3 /*break*/, 6];
          case 4:
            return [
              4 /*yield*/,
              supabase
                .from("user_subscriptions")
                .select(
                  "\n            *,\n            subscription_plans (\n              id,\n              name,\n              description,\n              price_cents,\n              stripe_price_id,\n              features,\n              max_patients,\n              max_clinics\n            )\n          ",
                )
                .eq("user_id", params[0])
                .single(),
            ];
          case 5:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error && error.code !== "PGRST116") {
              // Ignore "not found" errors
              throw error;
            }
            result = data ? [data] : [];
            _c.label = 6;
          case 6:
            duration = subscription_performance_monitor_1.subscriptionPerformanceMonitor.endTimer(
              timerId,
              true,
            );
            subscription_performance_monitor_1.subscriptionPerformanceMonitor.recordDatabaseOperation(
              duration,
            );
            return [2 /*return*/, result || []];
          case 7:
            error_5 = _c.sent();
            subscription_performance_monitor_1.subscriptionPerformanceMonitor.recordDatabaseOperation(
              performance.now() - startTime,
            );
            throw error_5;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute batch query with optimization
   */
  SubscriptionQueryOptimizer.prototype.executeBatchQuery = function (sql_1, params_1) {
    return __awaiter(this, arguments, void 0, function (sql, params, options) {
      var startTime, supabase, _a, data, error, resultMap_1, error_6;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = performance.now();
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              (0, server_1.createClient)(),
              // For batch operations, we'll query all at once
            ];
          case 2:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("user_subscriptions")
                .select(
                  "\n          *,\n          subscription_plans (\n            id,\n            name,\n            description,\n            price_cents,\n            stripe_price_id,\n            features,\n            max_patients,\n            max_clinics\n          )\n        ",
                )
                .in("user_id", params),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            resultMap_1 = new Map();
            data === null || data === void 0
              ? void 0
              : data.forEach(function (item) {
                  resultMap_1.set(item.user_id, item);
                });
            // Return results in the same order as requested
            return [
              2 /*return*/,
              params.map(function (userId) {
                return resultMap_1.get(userId) || null;
              }),
            ];
          case 4:
            error_6 = _b.sent();
            subscription_performance_monitor_1.subscriptionPerformanceMonitor.recordDatabaseOperation(
              performance.now() - startTime,
            );
            throw error_6;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Build optimized subscription status query
   */
  SubscriptionQueryOptimizer.prototype.buildSubscriptionStatusQuery = function () {
    return "\n      SELECT \n        us.*,\n        sp.id as plan_id,\n        sp.name as plan_name,\n        sp.description as plan_description,\n        sp.price_cents,\n        sp.stripe_price_id,\n        sp.features,\n        sp.max_patients,\n        sp.max_clinics\n      FROM user_subscriptions us\n      JOIN subscription_plans sp ON us.plan_id = sp.id\n      WHERE us.user_id = $1\n      AND us.status IN ('active', 'trialing', 'past_due')\n      ORDER BY us.current_period_end DESC NULLS LAST\n      LIMIT 1\n    ";
  };
  /**
   * Build batch subscription status query
   */
  SubscriptionQueryOptimizer.prototype.buildBatchSubscriptionStatusQuery = function (count) {
    var placeholders = Array.from({ length: count }, function (_, i) {
      return "$".concat(i + 1);
    }).join(", ");
    return "\n      SELECT \n        us.*,\n        sp.id as plan_id,\n        sp.name as plan_name,\n        sp.description as plan_description,\n        sp.price_cents,\n        sp.stripe_price_id,\n        sp.features,\n        sp.max_patients,\n        sp.max_clinics\n      FROM user_subscriptions us\n      JOIN subscription_plans sp ON us.plan_id = sp.id\n      WHERE us.user_id IN (".concat(
      placeholders,
      ")\n      AND us.status IN ('active', 'trialing', 'past_due')\n      ORDER BY us.user_id, us.current_period_end DESC NULLS LAST\n    ",
    );
  };
  /**
   * Build user plans query with filters
   */
  SubscriptionQueryOptimizer.prototype.buildUserPlansQuery = function (filters) {
    var sql =
      "\n      SELECT \n        sp.*,\n        COUNT(us.id) as subscriber_count,\n        COUNT(us.id) FILTER (WHERE us.status = 'active') as active_subscribers\n      FROM subscription_plans sp\n      LEFT JOIN user_subscriptions us ON sp.id = us.plan_id\n    ";
    var conditions = [];
    var params = [];
    if (filters.active !== undefined) {
      conditions.push("sp.active = $".concat(params.length + 1));
      params.push(filters.active);
    }
    if (filters.tier && filters.tier.length > 0) {
      conditions.push("sp.tier = ANY($".concat(params.length + 1, ")"));
      params.push(filters.tier);
    }
    if (conditions.length > 0) {
      sql += " WHERE ".concat(conditions.join(" AND "));
    }
    sql += " GROUP BY sp.id ORDER BY sp.price_cents ASC";
    return { sql: sql, params: params };
  };
  /**
   * Build analytics query with time aggregation
   */
  SubscriptionQueryOptimizer.prototype.buildAnalyticsQuery = function (dateRange, aggregation) {
    var timeFormat = {
      daily: "date_trunc('day', created_at)",
      weekly: "date_trunc('week', created_at)",
      monthly: "date_trunc('month', created_at)",
    }[aggregation];
    var sql = "\n      SELECT \n        ".concat(
      timeFormat,
      " as period,\n        COUNT(*) as total_subscriptions,\n        COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,\n        COUNT(*) FILTER (WHERE status = 'trialing') as trial_subscriptions,\n        COUNT(*) FILTER (WHERE status = 'canceled') as canceled_subscriptions,\n        SUM(sp.price_cents) FILTER (WHERE status = 'active') as revenue_cents,\n        COUNT(DISTINCT user_id) as unique_subscribers\n      FROM user_subscriptions us\n      JOIN subscription_plans sp ON us.plan_id = sp.id\n      WHERE us.created_at >= $1 AND us.created_at <= $2\n      GROUP BY period\n      ORDER BY period DESC\n    ",
    );
    return {
      sql: sql,
      params: [dateRange.start.toISOString(), dateRange.end.toISOString()],
    };
  };
  /**
   * Process subscription result into validation format
   */
  SubscriptionQueryOptimizer.prototype.processSubscriptionResult = function (data) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var startTime = performance.now();
    if (!data) {
      return {
        hasAccess: false,
        status: null,
        subscription: null,
        message: "No subscription found",
        performance: {
          validationTime: performance.now() - startTime,
          cacheHit: false,
          source: "database",
        },
      };
    }
    var subscription = {
      id: data.id,
      user_id: data.user_id,
      stripe_customer_id: data.stripe_customer_id,
      stripe_subscription_id: data.stripe_subscription_id,
      plan_id: data.plan_id,
      status: data.status,
      current_period_start: data.current_period_start,
      current_period_end: data.current_period_end,
      trial_start: data.trial_start,
      trial_end: data.trial_end,
      canceled_at: data.canceled_at,
      cancel_at_period_end: data.cancel_at_period_end,
      plan: {
        id:
          data.plan_id ||
          ((_a = data.subscription_plans) === null || _a === void 0 ? void 0 : _a.id),
        name:
          data.plan_name ||
          ((_b = data.subscription_plans) === null || _b === void 0 ? void 0 : _b.name),
        description:
          data.plan_description ||
          ((_c = data.subscription_plans) === null || _c === void 0 ? void 0 : _c.description),
        price_cents:
          data.price_cents ||
          ((_d = data.subscription_plans) === null || _d === void 0 ? void 0 : _d.price_cents),
        stripe_price_id:
          data.stripe_price_id ||
          ((_e = data.subscription_plans) === null || _e === void 0 ? void 0 : _e.stripe_price_id),
        features:
          data.features ||
          ((_f = data.subscription_plans) === null || _f === void 0 ? void 0 : _f.features) ||
          [],
        max_patients:
          data.max_patients ||
          ((_g = data.subscription_plans) === null || _g === void 0 ? void 0 : _g.max_patients),
        max_clinics:
          data.max_clinics ||
          ((_h = data.subscription_plans) === null || _h === void 0 ? void 0 : _h.max_clinics),
      },
    };
    var now = new Date();
    var hasAccess = this.determineAccess(subscription, now);
    var gracePeriod = this.isInGracePeriod(subscription, now);
    return {
      hasAccess: hasAccess || gracePeriod,
      status: subscription.status,
      subscription: subscription,
      message: this.getAccessMessage(subscription, hasAccess, gracePeriod),
      gracePeriod: gracePeriod,
      performance: {
        validationTime: performance.now() - startTime,
        cacheHit: false,
        source: "database",
      },
    };
  };
  /**
   * Determine if user has access
   */
  SubscriptionQueryOptimizer.prototype.determineAccess = function (subscription, now) {
    if (!subscription) return false;
    var activeStatuses = ["active", "trialing"];
    if (!activeStatuses.includes(subscription.status)) return false;
    // Check if trial hasn't expired
    if (subscription.status === "trialing" && subscription.trial_end) {
      return new Date(subscription.trial_end) > now;
    }
    // Check if subscription hasn't expired
    if (subscription.current_period_end) {
      return new Date(subscription.current_period_end) > now;
    }
    return true;
  };
  /**
   * Check if subscription is in grace period
   */
  SubscriptionQueryOptimizer.prototype.isInGracePeriod = function (subscription, now) {
    if (!subscription || subscription.status !== "past_due") return false;
    if (subscription.current_period_end) {
      var gracePeriodEnd = new Date(subscription.current_period_end);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3-day grace period
      return now <= gracePeriodEnd;
    }
    return false;
  };
  /**
   * Get access message
   */
  SubscriptionQueryOptimizer.prototype.getAccessMessage = function (
    subscription,
    hasAccess,
    gracePeriod,
  ) {
    if (!subscription) return "No subscription found";
    if (gracePeriod) return "Subscription past due - grace period active";
    if (hasAccess) return "Subscription active";
    switch (subscription.status) {
      case "canceled":
        return "Subscription has been canceled";
      case "expired":
        return "Subscription has expired";
      case "past_due":
        return "Payment is past due";
      default:
        return "Subscription not active";
    }
  };
  /**
   * Record query statistics
   */
  SubscriptionQueryOptimizer.prototype.recordQueryStats = function (
    queryType,
    executionTime,
    resultCount,
    fromCache,
  ) {
    var stats = this.queryStats.get(queryType);
    if (!stats) {
      stats = [];
      this.queryStats.set(queryType, stats);
    }
    stats.push({
      queryType: queryType,
      executionTime: executionTime,
      resultCount: resultCount,
      fromCache: fromCache,
      indexesUsed: [], // Would be populated from query plan
    });
    // Keep only recent stats
    if (stats.length > 1000) {
      stats.splice(0, stats.length - 500);
    }
  };
  /**
   * Handle query errors
   */
  SubscriptionQueryOptimizer.prototype.handleQueryError = function (error, queryId, startTime) {
    var duration = performance.now() - startTime;
    console.error("Query error for ".concat(queryId, ":"), error);
    subscription_performance_monitor_1.subscriptionPerformanceMonitor.recordDatabaseOperation(
      duration,
    );
  };
  /**
   * Get query performance statistics
   */
  SubscriptionQueryOptimizer.prototype.getQueryStats = function (queryType) {
    if (queryType) {
      return this.queryStats.get(queryType) || [];
    }
    var allStats = [];
    for (var _i = 0, _a = this.queryStats.values(); _i < _a.length; _i++) {
      var stats = _a[_i];
      allStats.push.apply(allStats, stats);
    }
    return allStats;
  };
  /**
   * Initialize connection pool (placeholder)
   */
  SubscriptionQueryOptimizer.prototype.initializeConnectionPool = function () {
    // Supabase handles connection pooling automatically
    // This is where you'd configure additional pooling if needed
  };
  /**
   * Start batch processor for query batching
   */
  SubscriptionQueryOptimizer.prototype.startBatchProcessor = function () {
    var _this = this;
    // Implement batch processing for similar queries
    setInterval(function () {
      _this.processPendingBatches();
    }, this.BATCH_DELAY);
  };
  /**
   * Process pending batch queries
   */
  SubscriptionQueryOptimizer.prototype.processPendingBatches = function () {
    // Process batched queries to reduce database load
    for (var _i = 0, _a = this.pendingBatches; _i < _a.length; _i++) {
      var _b = _a[_i],
        batchType = _b[0],
        queries = _b[1];
      if (queries.length >= this.MAX_BATCH_SIZE || queries.length > 0) {
        this.executePendingBatch(batchType, queries);
        this.pendingBatches.delete(batchType);
      }
    }
  };
  /**
   * Execute pending batch
   */
  SubscriptionQueryOptimizer.prototype.executePendingBatch = function (batchType, queries) {
    return __awaiter(this, void 0, void 0, function () {
      var results_1, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.executeBatchOptimization(queries),
              // Call callbacks with results
            ];
          case 1:
            results_1 = _a.sent();
            // Call callbacks with results
            queries.forEach(function (query, index) {
              if (query.callback) {
                query.callback(results_1[index]);
              }
            });
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            console.error("Batch execution error for ".concat(batchType, ":"), error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute batch optimization
   */
  SubscriptionQueryOptimizer.prototype.executeBatchOptimization = function (queries) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, queries_1, query, result, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            results = [];
            (_i = 0), (queries_1 = queries);
            _a.label = 1;
          case 1:
            if (!(_i < queries_1.length)) return [3 /*break*/, 6];
            query = queries_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.executeOptimizedQuery(query.query, query.params, query.options),
            ];
          case 3:
            result = _a.sent();
            results.push(result);
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            results.push({ error: error_8 });
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Clean up resources
   */
  SubscriptionQueryOptimizer.prototype.cleanup = function () {
    this.queryStats.clear();
    this.pendingBatches.clear();
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  };
  return SubscriptionQueryOptimizer;
})();
exports.SubscriptionQueryOptimizer = SubscriptionQueryOptimizer;
// Global query optimizer instance
var createsubscriptionQueryOptimizer = function () {
  return new SubscriptionQueryOptimizer();
};
exports.createsubscriptionQueryOptimizer = createsubscriptionQueryOptimizer;
