"use strict";
/**
 * NeonPro - Integration Rate Limiter
 * Rate limiting implementation for third-party integrations
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
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
exports.MemoryRateLimiter = exports.SupabaseRateLimiter = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
/**
 * Redis-like rate limiter implementation using Supabase
 */
var SupabaseRateLimiter = /** @class */ (function () {
  function SupabaseRateLimiter(supabaseUrl, supabaseKey) {
    var _this = this;
    this.cache = new Map();
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      function () {
        _this.cleanupExpiredEntries();
      },
      5 * 60 * 1000,
    );
  }
  /**
   * Check if request is within rate limits
   */
  SupabaseRateLimiter.prototype.checkLimit = function (integrationId, endpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var config,
        now,
        key,
        minuteKey,
        minuteCount,
        hourKey,
        hourCount,
        dayKey,
        dayCount,
        burstKey,
        burstEntry,
        timeDiff,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getRateLimitConfig(integrationId)];
          case 1:
            config = _a.sent();
            if (!config) {
              return [2 /*return*/, true]; // No limits configured
            }
            now = Date.now();
            key = "".concat(integrationId, ":").concat(endpoint);
            minuteKey = "".concat(key, ":minute:").concat(Math.floor(now / 60000));
            return [4 /*yield*/, this.getCount(minuteKey)];
          case 2:
            minuteCount = _a.sent();
            if (minuteCount >= config.requestsPerMinute) {
              return [2 /*return*/, false];
            }
            hourKey = "".concat(key, ":hour:").concat(Math.floor(now / 3600000));
            return [4 /*yield*/, this.getCount(hourKey)];
          case 3:
            hourCount = _a.sent();
            if (hourCount >= config.requestsPerHour) {
              return [2 /*return*/, false];
            }
            dayKey = "".concat(key, ":day:").concat(Math.floor(now / 86400000));
            return [4 /*yield*/, this.getCount(dayKey)];
          case 4:
            dayCount = _a.sent();
            if (dayCount >= config.requestsPerDay) {
              return [2 /*return*/, false];
            }
            burstKey = "".concat(key, ":burst");
            burstEntry = this.cache.get(burstKey);
            if (burstEntry) {
              timeDiff = now - burstEntry.timestamp;
              if (timeDiff < config.windowSize && burstEntry.count >= config.burstLimit) {
                return [2 /*return*/, false];
              }
            }
            return [2 /*return*/, true];
          case 5:
            error_1 = _a.sent();
            console.error("Rate limit check failed:", error_1);
            return [2 /*return*/, true]; // Fail open
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Increment request counter
   */
  SupabaseRateLimiter.prototype.incrementCounter = function (integrationId, endpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var config, now, key, minuteKey, hourKey, dayKey, burstKey, burstEntry, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getRateLimitConfig(integrationId)];
          case 1:
            config = _a.sent();
            if (!config) {
              return [2 /*return*/]; // No limits configured
            }
            now = Date.now();
            key = "".concat(integrationId, ":").concat(endpoint);
            minuteKey = "".concat(key, ":minute:").concat(Math.floor(now / 60000));
            return [4 /*yield*/, this.incrementCount(minuteKey, 60)];
          case 2:
            _a.sent();
            hourKey = "".concat(key, ":hour:").concat(Math.floor(now / 3600000));
            return [4 /*yield*/, this.incrementCount(hourKey, 3600)];
          case 3:
            _a.sent();
            dayKey = "".concat(key, ":day:").concat(Math.floor(now / 86400000));
            return [4 /*yield*/, this.incrementCount(dayKey, 86400)];
          case 4:
            _a.sent();
            burstKey = "".concat(key, ":burst");
            burstEntry = this.cache.get(burstKey);
            if (burstEntry && now - burstEntry.timestamp < config.windowSize) {
              burstEntry.count++;
            } else {
              this.cache.set(burstKey, {
                count: 1,
                timestamp: now,
                expiresAt: now + config.windowSize,
              });
            }
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            console.error("Failed to increment counter:", error_2);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get remaining requests for an integration/endpoint
   */
  SupabaseRateLimiter.prototype.getRemainingRequests = function (integrationId, endpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var config,
        now,
        key,
        minuteKey,
        minuteCount,
        minuteRemaining,
        hourKey,
        hourCount,
        hourRemaining,
        dayKey,
        dayCount,
        dayRemaining,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getRateLimitConfig(integrationId)];
          case 1:
            config = _a.sent();
            if (!config) {
              return [2 /*return*/, Infinity]; // No limits configured
            }
            now = Date.now();
            key = "".concat(integrationId, ":").concat(endpoint);
            minuteKey = "".concat(key, ":minute:").concat(Math.floor(now / 60000));
            return [4 /*yield*/, this.getCount(minuteKey)];
          case 2:
            minuteCount = _a.sent();
            minuteRemaining = Math.max(0, config.requestsPerMinute - minuteCount);
            hourKey = "".concat(key, ":hour:").concat(Math.floor(now / 3600000));
            return [4 /*yield*/, this.getCount(hourKey)];
          case 3:
            hourCount = _a.sent();
            hourRemaining = Math.max(0, config.requestsPerHour - hourCount);
            dayKey = "".concat(key, ":day:").concat(Math.floor(now / 86400000));
            return [4 /*yield*/, this.getCount(dayKey)];
          case 4:
            dayCount = _a.sent();
            dayRemaining = Math.max(0, config.requestsPerDay - dayCount);
            // Return the most restrictive limit
            return [2 /*return*/, Math.min(minuteRemaining, hourRemaining, dayRemaining)];
          case 5:
            error_3 = _a.sent();
            console.error("Failed to get remaining requests:", error_3);
            return [2 /*return*/, 0];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Reset all limits for an integration
   */
  SupabaseRateLimiter.prototype.resetLimits = function (integrationId) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, key, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            // Clear from database
            return [
              4 /*yield*/,
              this.supabase
                .from("rate_limit_counters")
                .delete()
                .like("key", "".concat(integrationId, ":%")),
            ];
          case 1:
            // Clear from database
            _b.sent();
            // Clear from cache
            for (_i = 0, _a = this.cache; _i < _a.length; _i++) {
              key = _a[_i][0];
              if (key.startsWith("".concat(integrationId, ":"))) {
                this.cache.delete(key);
              }
            }
            return [3 /*break*/, 3];
          case 2:
            error_4 = _b.sent();
            console.error("Failed to reset limits:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get usage statistics for an integration
   */
  SupabaseRateLimiter.prototype.getUsageStats = function (integrationId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, stats, _i, _b, item, parts, endpoint, period, statKey, error_5;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("rate_limit_counters")
                .select("key, count")
                .like("key", "".concat(integrationId, ":%")),
            ];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw error;
            }
            stats = {};
            for (_i = 0, _b = data || []; _i < _b.length; _i++) {
              item = _b[_i];
              parts = item.key.split(":");
              if (parts.length >= 3) {
                endpoint = parts[1];
                period = parts[2];
                statKey = "".concat(endpoint, "_").concat(period);
                stats[statKey] = item.count;
              }
            }
            return [2 /*return*/, stats];
          case 2:
            error_5 = _c.sent();
            console.error("Failed to get usage stats:", error_5);
            return [2 /*return*/, {}];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get rate limit configuration for an integration
   */
  SupabaseRateLimiter.prototype.getRateLimitConfig = function (integrationId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("integrations")
                .select("rate_limits")
                .eq("id", integrationId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data.rate_limits];
          case 2:
            error_6 = _b.sent();
            console.error("Failed to get rate limit config:", error_6);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get count from database or cache
   */
  SupabaseRateLimiter.prototype.getCount = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var cached, _a, data, error, expiresAt, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            cached = this.cache.get(key);
            if (cached && cached.expiresAt > Date.now()) {
              return [2 /*return*/, cached.count];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("rate_limit_counters")
                .select("count, expires_at")
                .eq("key", key)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, 0];
            }
            expiresAt = new Date(data.expires_at).getTime();
            if (!(expiresAt <= Date.now())) return [3 /*break*/, 3];
            // Expired, delete it
            return [4 /*yield*/, this.supabase.from("rate_limit_counters").delete().eq("key", key)];
          case 2:
            // Expired, delete it
            _b.sent();
            return [2 /*return*/, 0];
          case 3:
            // Cache the result
            this.cache.set(key, {
              count: data.count,
              timestamp: Date.now(),
              expiresAt: expiresAt,
            });
            return [2 /*return*/, data.count];
          case 4:
            error_7 = _b.sent();
            console.error("Failed to get count:", error_7);
            return [2 /*return*/, 0];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Increment count in database and cache
   */
  SupabaseRateLimiter.prototype.incrementCount = function (key, ttlSeconds) {
    return __awaiter(this, void 0, void 0, function () {
      var now, expiresAt, existing, cached, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            now = Date.now();
            expiresAt = new Date(now + ttlSeconds * 1000);
            return [
              4 /*yield*/,
              this.supabase.from("rate_limit_counters").select("count").eq("key", key).single(),
            ];
          case 1:
            existing = _a.sent().data;
            if (!existing) return [3 /*break*/, 3];
            // Update existing
            return [
              4 /*yield*/,
              this.supabase
                .from("rate_limit_counters")
                .update({
                  count: existing.count + 1,
                  updated_at: new Date(),
                })
                .eq("key", key),
            ];
          case 2:
            // Update existing
            _a.sent();
            cached = this.cache.get(key);
            if (cached) {
              cached.count++;
            }
            return [3 /*break*/, 5];
          case 3:
            // Create new
            return [
              4 /*yield*/,
              this.supabase.from("rate_limit_counters").insert({
                key: key,
                count: 1,
                expires_at: expiresAt,
                created_at: new Date(),
                updated_at: new Date(),
              }),
            ];
          case 4:
            // Create new
            _a.sent();
            // Add to cache
            this.cache.set(key, {
              count: 1,
              timestamp: now,
              expiresAt: expiresAt.getTime(),
            });
            _a.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_8 = _a.sent();
            console.error("Failed to increment count:", error_8);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up expired entries from cache
   */
  SupabaseRateLimiter.prototype.cleanupExpiredEntries = function () {
    var now = Date.now();
    for (var _i = 0, _a = this.cache; _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        entry = _b[1];
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  };
  /**
   * Cleanup resources
   */
  SupabaseRateLimiter.prototype.destroy = function () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  };
  return SupabaseRateLimiter;
})();
exports.SupabaseRateLimiter = SupabaseRateLimiter;
/**
 * In-memory rate limiter for development/testing
 */
var MemoryRateLimiter = /** @class */ (function () {
  function MemoryRateLimiter() {
    var _this = this;
    this.counters = new Map();
    this.configs = new Map();
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(function () {
      _this.cleanupExpiredEntries();
    }, 60 * 1000);
  }
  /**
   * Set rate limit configuration for an integration
   */
  MemoryRateLimiter.prototype.setConfig = function (integrationId, config) {
    this.configs.set(integrationId, config);
  };
  MemoryRateLimiter.prototype.checkLimit = function (integrationId, endpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var config, now, key, minuteKey, hourKey, dayKey, burstKey, burstEntry, timeDiff;
      return __generator(this, function (_a) {
        config = this.configs.get(integrationId);
        if (!config) {
          return [2 /*return*/, true];
        }
        now = Date.now();
        key = "".concat(integrationId, ":").concat(endpoint);
        minuteKey = "".concat(key, ":minute:").concat(Math.floor(now / 60000));
        if (this.getCount(minuteKey) >= config.requestsPerMinute) {
          return [2 /*return*/, false];
        }
        hourKey = "".concat(key, ":hour:").concat(Math.floor(now / 3600000));
        if (this.getCount(hourKey) >= config.requestsPerHour) {
          return [2 /*return*/, false];
        }
        dayKey = "".concat(key, ":day:").concat(Math.floor(now / 86400000));
        if (this.getCount(dayKey) >= config.requestsPerDay) {
          return [2 /*return*/, false];
        }
        burstKey = "".concat(key, ":burst");
        burstEntry = this.counters.get(burstKey);
        if (burstEntry) {
          timeDiff = now - burstEntry.timestamp;
          if (timeDiff < config.windowSize && burstEntry.count >= config.burstLimit) {
            return [2 /*return*/, false];
          }
        }
        return [2 /*return*/, true];
      });
    });
  };
  MemoryRateLimiter.prototype.incrementCounter = function (integrationId, endpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var config, now, key, minuteKey, hourKey, dayKey, burstKey, burstEntry;
      return __generator(this, function (_a) {
        config = this.configs.get(integrationId);
        if (!config) {
          return [2 /*return*/];
        }
        now = Date.now();
        key = "".concat(integrationId, ":").concat(endpoint);
        minuteKey = "".concat(key, ":minute:").concat(Math.floor(now / 60000));
        this.incrementCount(minuteKey, now + 60000);
        hourKey = "".concat(key, ":hour:").concat(Math.floor(now / 3600000));
        this.incrementCount(hourKey, now + 3600000);
        dayKey = "".concat(key, ":day:").concat(Math.floor(now / 86400000));
        this.incrementCount(dayKey, now + 86400000);
        burstKey = "".concat(key, ":burst");
        burstEntry = this.counters.get(burstKey);
        if (burstEntry && now - burstEntry.timestamp < config.windowSize) {
          burstEntry.count++;
        } else {
          this.counters.set(burstKey, {
            count: 1,
            timestamp: now,
            expiresAt: now + config.windowSize,
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MemoryRateLimiter.prototype.getRemainingRequests = function (integrationId, endpoint) {
    return __awaiter(this, void 0, void 0, function () {
      var config,
        now,
        key,
        minuteKey,
        minuteRemaining,
        hourKey,
        hourRemaining,
        dayKey,
        dayRemaining;
      return __generator(this, function (_a) {
        config = this.configs.get(integrationId);
        if (!config) {
          return [2 /*return*/, Infinity];
        }
        now = Date.now();
        key = "".concat(integrationId, ":").concat(endpoint);
        minuteKey = "".concat(key, ":minute:").concat(Math.floor(now / 60000));
        minuteRemaining = Math.max(0, config.requestsPerMinute - this.getCount(minuteKey));
        hourKey = "".concat(key, ":hour:").concat(Math.floor(now / 3600000));
        hourRemaining = Math.max(0, config.requestsPerHour - this.getCount(hourKey));
        dayKey = "".concat(key, ":day:").concat(Math.floor(now / 86400000));
        dayRemaining = Math.max(0, config.requestsPerDay - this.getCount(dayKey));
        return [2 /*return*/, Math.min(minuteRemaining, hourRemaining, dayRemaining)];
      });
    });
  };
  MemoryRateLimiter.prototype.resetLimits = function (integrationId) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, key;
      return __generator(this, function (_b) {
        for (_i = 0, _a = this.counters; _i < _a.length; _i++) {
          key = _a[_i][0];
          if (key.startsWith("".concat(integrationId, ":"))) {
            this.counters.delete(key);
          }
        }
        return [2 /*return*/];
      });
    });
  };
  MemoryRateLimiter.prototype.getUsageStats = function (integrationId) {
    return __awaiter(this, void 0, void 0, function () {
      var stats, _i, _a, _b, key, entry, parts, endpoint, period, statKey;
      return __generator(this, function (_c) {
        stats = {};
        for (_i = 0, _a = this.counters; _i < _a.length; _i++) {
          (_b = _a[_i]), (key = _b[0]), (entry = _b[1]);
          if (key.startsWith("".concat(integrationId, ":")) && entry.expiresAt > Date.now()) {
            parts = key.split(":");
            if (parts.length >= 3) {
              endpoint = parts[1];
              period = parts[2];
              statKey = "".concat(endpoint, "_").concat(period);
              stats[statKey] = entry.count;
            }
          }
        }
        return [2 /*return*/, stats];
      });
    });
  };
  MemoryRateLimiter.prototype.getCount = function (key) {
    var entry = this.counters.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      return 0;
    }
    return entry.count;
  };
  MemoryRateLimiter.prototype.incrementCount = function (key, expiresAt) {
    var existing = this.counters.get(key);
    if (existing && existing.expiresAt > Date.now()) {
      existing.count++;
    } else {
      this.counters.set(key, {
        count: 1,
        timestamp: Date.now(),
        expiresAt: expiresAt,
      });
    }
  };
  MemoryRateLimiter.prototype.cleanupExpiredEntries = function () {
    var now = Date.now();
    for (var _i = 0, _a = this.counters; _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        entry = _b[1];
      if (entry.expiresAt <= now) {
        this.counters.delete(key);
      }
    }
  };
  MemoryRateLimiter.prototype.destroy = function () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.counters.clear();
    this.configs.clear();
  };
  return MemoryRateLimiter;
})();
exports.MemoryRateLimiter = MemoryRateLimiter;
