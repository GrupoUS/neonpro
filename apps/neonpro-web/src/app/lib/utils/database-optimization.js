"use strict";
// Database Optimization Utilities
// Story 11.4: Alertas e Relatórios de Estoque
// Database query optimization and performance monitoring
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
exports.DB_CONFIG =
  exports.queryMonitor =
  exports.dbHealthMonitor =
  exports.optimizedQueries =
  exports.DatabaseHealthMonitor =
  exports.StockAlertQueries =
  exports.OptimizedQueryBuilder =
    void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var cache_1 = require("./cache");
// =====================================================
// CONFIGURATION
// =====================================================
var DB_CONFIG = {
  // Connection pooling
  maxConnections: 20,
  idleTimeout: 60000, // 1 minute
  // Query timeouts
  queryTimeout: 30000, // 30 seconds
  transactionTimeout: 60000, // 1 minute
  // Batch processing
  maxBatchSize: 1000,
  defaultBatchSize: 100,
  // Performance monitoring
  slowQueryThreshold: 1000, // 1 second
  enableQueryLogging: process.env.NODE_ENV === "development",
};
exports.DB_CONFIG = DB_CONFIG;
var QueryPerformanceMonitor = /** @class */ (function () {
  function QueryPerformanceMonitor() {
    this.metrics = [];
    this.maxMetrics = 1000;
  }
  QueryPerformanceMonitor.prototype.logQuery = function (metrics) {
    this.metrics.push(metrics);
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    // Log slow queries
    if (metrics.duration > DB_CONFIG.slowQueryThreshold) {
      console.warn("Slow query detected:", {
        query: metrics.query.substring(0, 100),
        duration: "".concat(metrics.duration, "ms"),
        rows: metrics.rows,
      });
    }
    // Log all queries in development
    if (DB_CONFIG.enableQueryLogging) {
      console.log("Query executed:", {
        query: metrics.query.substring(0, 100),
        duration: "".concat(metrics.duration, "ms"),
        rows: metrics.rows,
        cached: metrics.cached,
      });
    }
  };
  QueryPerformanceMonitor.prototype.getSlowQueries = function (threshold) {
    var limit = threshold || DB_CONFIG.slowQueryThreshold;
    return this.metrics.filter(function (m) {
      return m.duration > limit;
    });
  };
  QueryPerformanceMonitor.prototype.getAverageQueryTime = function () {
    if (this.metrics.length === 0) return 0;
    var total = this.metrics.reduce(function (sum, m) {
      return sum + m.duration;
    }, 0);
    return total / this.metrics.length;
  };
  QueryPerformanceMonitor.prototype.getCacheHitRate = function () {
    if (this.metrics.length === 0) return 0;
    var cached = this.metrics.filter(function (m) {
      return m.cached;
    }).length;
    return cached / this.metrics.length;
  };
  return QueryPerformanceMonitor;
})();
var queryMonitor = new QueryPerformanceMonitor();
exports.queryMonitor = queryMonitor;
// =====================================================
// OPTIMIZED QUERY BUILDER
// =====================================================
var OptimizedQueryBuilder = /** @class */ (function () {
  function OptimizedQueryBuilder(supabase, tableName) {
    this.supabase = supabase;
    this.tableName = tableName;
  }
  /**
   * Optimized select with automatic caching
   */
  OptimizedQueryBuilder.prototype.cachedSelect = function (cacheKey_1, selectQuery_1) {
    return __awaiter(this, arguments, void 0, function (cacheKey, selectQuery, filters, cacheTtl) {
      var startTime, cached, query, _i, _a, _b, key, value, _c, data, error, duration;
      if (filters === void 0) {
        filters = {};
      }
      if (cacheTtl === void 0) {
        cacheTtl = 300;
      }
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            startTime = Date.now();
            return [4 /*yield*/, cache_1.stockAlertCache.cache.get(cacheKey)];
          case 1:
            cached = _d.sent();
            if (!cached) return [3 /*break*/, 3];
            return [4 /*yield*/, cache_1.cacheMetrics.recordHit(cacheKey)];
          case 2:
            _d.sent();
            queryMonitor.logQuery({
              query: "SELECT ".concat(selectQuery, " FROM ").concat(this.tableName, " (cached)"),
              duration: Date.now() - startTime,
              rows: cached.length,
              cached: true,
              timestamp: new Date(),
            });
            return [2 /*return*/, { data: cached, fromCache: true }];
          case 3:
            return [4 /*yield*/, cache_1.cacheMetrics.recordMiss(cacheKey)];
          case 4:
            _d.sent();
            query = this.supabase.from(this.tableName).select(selectQuery);
            // Apply filters
            for (_i = 0, _a = Object.entries(filters); _i < _a.length; _i++) {
              (_b = _a[_i]), (key = _b[0]), (value = _b[1]);
              if (Array.isArray(value)) {
                query = query.in(key, value);
              } else if (value !== null && value !== undefined) {
                query = query.eq(key, value);
              }
            }
            return [4 /*yield*/, query];
          case 5:
            (_c = _d.sent()), (data = _c.data), (error = _c.error);
            if (error) {
              throw new Error("Query failed: ".concat(error.message));
            }
            duration = Date.now() - startTime;
            queryMonitor.logQuery({
              query: "SELECT ".concat(selectQuery, " FROM ").concat(this.tableName),
              duration: duration,
              rows: (data === null || data === void 0 ? void 0 : data.length) || 0,
              cached: false,
              timestamp: new Date(),
            });
            if (!data) return [3 /*break*/, 7];
            return [4 /*yield*/, cache_1.stockAlertCache.cache.set(cacheKey, data, cacheTtl)];
          case 6:
            _d.sent();
            _d.label = 7;
          case 7:
            return [2 /*return*/, { data: data, fromCache: false }];
        }
      });
    });
  };
  /**
   * Batch insert with automatic batching
   */
  OptimizedQueryBuilder.prototype.batchInsert = function (records_1) {
    return __awaiter(this, arguments, void 0, function (records, batchSize) {
      var startTime, results, errors, i, batch, _a, data, error, error_1;
      if (batchSize === void 0) {
        batchSize = DB_CONFIG.defaultBatchSize;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            results = [];
            errors = [];
            i = 0;
            _b.label = 1;
          case 1:
            if (!(i < records.length)) return [3 /*break*/, 6];
            batch = records.slice(i, i + batchSize);
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.supabase.from(this.tableName).insert(batch).select()];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              errors.push({ batch: i / batchSize, error: error });
            } else if (data) {
              results.push.apply(results, data);
            }
            return [3 /*break*/, 5];
          case 4:
            error_1 = _b.sent();
            errors.push({ batch: i / batchSize, error: error_1 });
            return [3 /*break*/, 5];
          case 5:
            i += batchSize;
            return [3 /*break*/, 1];
          case 6:
            queryMonitor.logQuery({
              query: "INSERT INTO ".concat(this.tableName, " (batch)"),
              duration: Date.now() - startTime,
              rows: results.length,
              cached: false,
              timestamp: new Date(),
            });
            return [2 /*return*/, { data: results, errors: errors }];
        }
      });
    });
  };
  /**
   * Optimized aggregation query
   */
  OptimizedQueryBuilder.prototype.aggregate = function (cacheKey_1, aggregations_1) {
    return __awaiter(this, arguments, void 0, function (cacheKey, aggregations, filters, cacheTtl) {
      var startTime, cached, results, query, _i, _a, _b, key, value, count;
      if (filters === void 0) {
        filters = {};
      }
      if (cacheTtl === void 0) {
        cacheTtl = 600;
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            startTime = Date.now();
            return [4 /*yield*/, cache_1.stockAlertCache.cache.get(cacheKey)];
          case 1:
            cached = _c.sent();
            if (cached) {
              return [2 /*return*/, cached];
            }
            results = {};
            if (!aggregations.count) return [3 /*break*/, 3];
            query = this.supabase.from(this.tableName).select("*", { count: "exact", head: true });
            for (_i = 0, _a = Object.entries(filters); _i < _a.length; _i++) {
              (_b = _a[_i]), (key = _b[0]), (value = _b[1]);
              query = query.eq(key, value);
            }
            return [4 /*yield*/, query];
          case 2:
            count = _c.sent().count;
            results.count = count;
            _c.label = 3;
          case 3:
            // For other aggregations, we'd need to use RPC functions or raw SQL
            // This is a simplified implementation
            queryMonitor.logQuery({
              query: "AGGREGATE FROM ".concat(this.tableName),
              duration: Date.now() - startTime,
              rows: 1,
              cached: false,
              timestamp: new Date(),
            });
            // Cache the result
            return [4 /*yield*/, cache_1.stockAlertCache.cache.set(cacheKey, results, cacheTtl)];
          case 4:
            // Cache the result
            _c.sent();
            return [2 /*return*/, results];
        }
      });
    });
  };
  return OptimizedQueryBuilder;
})();
exports.OptimizedQueryBuilder = OptimizedQueryBuilder;
// =====================================================
// OPTIMIZED STOCK ALERT QUERIES
// =====================================================
var StockAlertQueries = /** @class */ (function () {
  function StockAlertQueries(supabaseClient) {
    this.supabase =
      supabaseClient ||
      (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  }
  /**
   * Get alert configurations with optimized joins
   */
  StockAlertQueries.prototype.getAlertConfigs = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, builder, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cacheKey = "alert-configs:".concat(clinicId);
            builder = new OptimizedQueryBuilder(this.supabase, "stock_alert_configs");
            return [
              4 /*yield*/,
              builder.cachedSelect(
                cacheKey,
                "\n        *,\n        product:products (\n          id,\n          name,\n          sku,\n          current_stock,\n          min_stock,\n          max_stock,\n          expiration_date\n        ),\n        category:product_categories (\n          id,\n          name\n        )\n      ",
                { clinic_id: clinicId, is_active: true },
                900, // 15 minutes cache
              ),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Get active alerts with optimized filtering
   */
  StockAlertQueries.prototype.getActiveAlerts = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, limit) {
      var cacheKey, startTime, cached, _a, data, error;
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "active-alerts:".concat(clinicId, ":").concat(limit);
            startTime = Date.now();
            return [4 /*yield*/, cache_1.stockAlertCache.getActiveAlerts(clinicId)];
          case 1:
            cached = _b.sent();
            if (cached) {
              return [2 /*return*/, cached.slice(0, limit)];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("stock_alerts")
                .select(
                  "\n        *,\n        product:products (\n          id,\n          name,\n          sku\n        ),\n        config:stock_alert_configs (\n          alert_type,\n          severity_level\n        )\n      ",
                )
                .eq("clinic_id", clinicId)
                .eq("status", "active")
                .order("triggered_at", { ascending: false })
                .limit(limit),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch active alerts: ".concat(error.message));
            }
            queryMonitor.logQuery({
              query: "SELECT active alerts with joins",
              duration: Date.now() - startTime,
              rows: (data === null || data === void 0 ? void 0 : data.length) || 0,
              cached: false,
              timestamp: new Date(),
            });
            if (!data) return [3 /*break*/, 4];
            return [4 /*yield*/, cache_1.stockAlertCache.setActiveAlerts(clinicId, data)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Get dashboard data with optimized aggregations
   */
  StockAlertQueries.prototype.getDashboardData = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, days) {
      var cacheKey,
        cached,
        startTime,
        endDate,
        startDate,
        _a,
        productsResult,
        alertsResult,
        metricsResult,
        dashboardData;
      if (days === void 0) {
        days = 30;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "dashboard:".concat(clinicId, ":").concat(days, "d");
            return [
              4 /*yield*/,
              cache_1.stockAlertCache.getDashboardData(clinicId, "".concat(days, "d")),
            ];
          case 1:
            cached = _b.sent();
            if (cached) {
              return [2 /*return*/, cached];
            }
            startTime = Date.now();
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(endDate.getDate() - days);
            return [
              4 /*yield*/,
              Promise.all([
                this.supabase
                  .from("products")
                  .select(
                    "\n          id,\n          name,\n          current_stock,\n          min_stock,\n          max_stock,\n          unit_cost,\n          expiration_date,\n          category:product_categories (\n            id,\n            name\n          )\n        ",
                  )
                  .eq("clinic_id", clinicId)
                  .is("deleted_at", null),
                this.supabase
                  .from("stock_alerts")
                  .select("*")
                  .eq("clinic_id", clinicId)
                  .gte("triggered_at", startDate.toISOString())
                  .order("triggered_at", { ascending: false }),
                this.supabase
                  .from("stock_performance_metrics")
                  .select("*")
                  .eq("clinic_id", clinicId)
                  .gte("metric_date", startDate.toISOString().split("T")[0])
                  .order("metric_date", { ascending: false }),
              ]),
            ];
          case 2:
            (_a = _b.sent()),
              (productsResult = _a[0]),
              (alertsResult = _a[1]),
              (metricsResult = _a[2]);
            dashboardData = {
              products: productsResult.data || [],
              alerts: alertsResult.data || [],
              metrics: metricsResult.data || [],
              lastUpdated: new Date(),
              period: { start: startDate, end: endDate, days: days },
            };
            queryMonitor.logQuery({
              query: "Dashboard data aggregation",
              duration: Date.now() - startTime,
              rows:
                dashboardData.products.length +
                dashboardData.alerts.length +
                dashboardData.metrics.length,
              cached: false,
              timestamp: new Date(),
            });
            // Cache the result
            return [
              4 /*yield*/,
              cache_1.stockAlertCache.setDashboardData(
                clinicId,
                "".concat(days, "d"),
                dashboardData,
              ),
            ];
          case 3:
            // Cache the result
            _b.sent();
            return [2 /*return*/, dashboardData];
        }
      });
    });
  };
  /**
   * Optimized product stock lookup
   */
  StockAlertQueries.prototype.getProductStock = function (productIds) {
    return __awaiter(this, void 0, void 0, function () {
      var result, uncachedIds, _i, productIds_1, productId, cached, data, _a, data_1, product;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            result = new Map();
            uncachedIds = [];
            (_i = 0), (productIds_1 = productIds);
            _b.label = 1;
          case 1:
            if (!(_i < productIds_1.length)) return [3 /*break*/, 4];
            productId = productIds_1[_i];
            return [4 /*yield*/, cache_1.stockAlertCache.getProductStock(productId)];
          case 2:
            cached = _b.sent();
            if (cached) {
              result.set(productId, cached);
            } else {
              uncachedIds.push(productId);
            }
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            if (!(uncachedIds.length > 0)) return [3 /*break*/, 9];
            return [
              4 /*yield*/,
              this.supabase
                .from("products")
                .select("id, current_stock, min_stock, max_stock, expiration_date")
                .in("id", uncachedIds),
            ];
          case 5:
            data = _b.sent().data;
            if (!data) return [3 /*break*/, 9];
            (_a = 0), (data_1 = data);
            _b.label = 6;
          case 6:
            if (!(_a < data_1.length)) return [3 /*break*/, 9];
            product = data_1[_a];
            result.set(product.id, product);
            // Cache individual products
            return [4 /*yield*/, cache_1.stockAlertCache.setProductStock(product.id, product)];
          case 7:
            // Cache individual products
            _b.sent();
            _b.label = 8;
          case 8:
            _a++;
            return [3 /*break*/, 6];
          case 9:
            return [2 /*return*/, result];
        }
      });
    });
  };
  /**
   * Bulk alert evaluation with optimization
   */
  StockAlertQueries.prototype.bulkEvaluateAlerts = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, batchSize) {
      var startTime, configs, results, i, batch, batchResults;
      if (batchSize === void 0) {
        batchSize = 100;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            return [4 /*yield*/, this.getAlertConfigs(clinicId)];
          case 1:
            configs = _a.sent();
            if (configs.length === 0) {
              return [2 /*return*/, []];
            }
            results = [];
            i = 0;
            _a.label = 2;
          case 2:
            if (!(i < configs.length)) return [3 /*break*/, 5];
            batch = configs.slice(i, i + batchSize);
            return [4 /*yield*/, this.evaluateConfigBatch(batch)];
          case 3:
            batchResults = _a.sent();
            results.push.apply(results, batchResults);
            _a.label = 4;
          case 4:
            i += batchSize;
            return [3 /*break*/, 2];
          case 5:
            queryMonitor.logQuery({
              query: "Bulk alert evaluation (".concat(configs.length, " configs)"),
              duration: Date.now() - startTime,
              rows: results.length,
              cached: false,
              timestamp: new Date(),
            });
            return [2 /*return*/, results];
        }
      });
    });
  };
  StockAlertQueries.prototype.evaluateConfigBatch = function (configs) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, _i, configs_1, config, alert_1, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alerts = [];
            (_i = 0), (configs_1 = configs);
            _a.label = 1;
          case 1:
            if (!(_i < configs_1.length)) return [3 /*break*/, 6];
            config = configs_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.evaluateConfig(config)];
          case 3:
            alert_1 = _a.sent();
            if (alert_1) {
              alerts.push(alert_1);
            }
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Failed to evaluate config ".concat(config.id, ":"), error_2);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, alerts];
        }
      });
    });
  };
  StockAlertQueries.prototype.evaluateConfig = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var product, shouldAlert, currentValue, message, daysUntilExpiration, existingAlert;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            product = config.product;
            if (!product) return [2 /*return*/, null];
            shouldAlert = false;
            currentValue = 0;
            message = "";
            switch (config.alert_type) {
              case "low_stock":
                currentValue = product.current_stock || 0;
                shouldAlert = currentValue <= config.threshold_value;
                message = "Estoque baixo para "
                  .concat(product.name, ": ")
                  .concat(currentValue, " unidades");
                break;
              case "expiring":
                if (product.expiration_date) {
                  daysUntilExpiration = Math.ceil(
                    (new Date(product.expiration_date).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24),
                  );
                  currentValue = daysUntilExpiration;
                  shouldAlert =
                    daysUntilExpiration <= config.threshold_value && daysUntilExpiration > 0;
                  message = "Produto "
                    .concat(product.name, " vence em ")
                    .concat(daysUntilExpiration, " dias");
                }
                break;
              default:
                return [2 /*return*/, null];
            }
            if (!shouldAlert) return [2 /*return*/, null];
            return [
              4 /*yield*/,
              this.supabase
                .from("stock_alerts")
                .select("id")
                .eq("alert_config_id", config.id)
                .eq("product_id", product.id)
                .is("acknowledged_at", null)
                .single(),
            ];
          case 1:
            existingAlert = _a.sent().data;
            if (existingAlert) return [2 /*return*/, null];
            return [
              2 /*return*/,
              {
                clinic_id: config.clinic_id,
                alert_config_id: config.id,
                product_id: product.id,
                alert_type: config.alert_type,
                severity_level: config.severity_level,
                current_value: currentValue,
                threshold_value: config.threshold_value,
                message: message,
                status: "active",
                metadata: {
                  productName: product.name,
                  evaluatedAt: new Date().toISOString(),
                },
              },
            ];
        }
      });
    });
  };
  return StockAlertQueries;
})();
exports.StockAlertQueries = StockAlertQueries;
// =====================================================
// DATABASE HEALTH MONITORING
// =====================================================
var DatabaseHealthMonitor = /** @class */ (function () {
  function DatabaseHealthMonitor() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
  }
  DatabaseHealthMonitor.prototype.checkHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        connectionStart,
        connectionTime,
        queryStart,
        queryTime,
        metrics,
        status_1,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            connectionStart = Date.now();
            return [4 /*yield*/, this.supabase.from("health_check").select("1").limit(1)];
          case 2:
            _a.sent();
            connectionTime = Date.now() - connectionStart;
            queryStart = Date.now();
            return [4 /*yield*/, this.supabase.from("stock_alert_configs").select("id").limit(10)];
          case 3:
            _a.sent();
            queryTime = Date.now() - queryStart;
            metrics = {
              connectionTime: connectionTime,
              queryTime: queryTime,
              cacheHitRate: queryMonitor.getCacheHitRate(),
              averageQueryTime: queryMonitor.getAverageQueryTime(),
            };
            status_1 = "healthy";
            if (connectionTime > 1000 || queryTime > 2000) {
              status_1 = "degraded";
            }
            if (connectionTime > 5000 || queryTime > 10000) {
              status_1 = "unhealthy";
            }
            return [2 /*return*/, { status: status_1, metrics: metrics }];
          case 4:
            error_3 = _a.sent();
            return [
              2 /*return*/,
              {
                status: "unhealthy",
                metrics: {
                  connectionTime: Date.now() - startTime,
                  queryTime: 0,
                  cacheHitRate: 0,
                  averageQueryTime: 0,
                },
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  return DatabaseHealthMonitor;
})();
exports.DatabaseHealthMonitor = DatabaseHealthMonitor;
// =====================================================
// EXPORTS
// =====================================================
exports.optimizedQueries = new StockAlertQueries();
exports.dbHealthMonitor = new DatabaseHealthMonitor();
