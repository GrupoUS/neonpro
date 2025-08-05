/**
 * Enhanced Subscription Hook v2 - Performance Optimized
 *
 * High-performance React hook for subscription status management:
 * - Intelligent caching with automatic invalidation
 * - Real-time updates with optimized WebSocket connections
 * - Background synchronization and prefetching
 * - Error handling with exponential backoff
 * - Memory-efficient state management
 * - Performance monitoring and metrics
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Performance Optimized
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.useSubscription = useSubscription;
exports.useSubscriptionStatus = useSubscriptionStatus;
exports.useSubscriptionAccess = useSubscriptionAccess;
exports.useSubscriptionLimits = useSubscriptionLimits;
var client_1 = require("@/lib/supabase/client");
var subscription_cache_enhanced_1 = require("@/lib/subscription-cache-enhanced");
var subscription_performance_monitor_1 = require("@/lib/subscription-performance-monitor");
var subscription_query_optimizer_1 = require("@/lib/subscription-query-optimizer");
var react_1 = require("react");
// Global state for cross-hook coordination
var globalHookState = new Map();
// Default configuration
var defaultConfig = {
  enableRealtime: true,
  enableCaching: true,
  enablePrefetching: true,
  enableBackgroundSync: true,
  cacheStrategy: "adaptive",
  refetchInterval: 5 * 60 * 1000, // 5 minutes
  staleTime: 2 * 60 * 1000, // 2 minutes
  retryAttempts: 3,
  retryDelay: 1000,
  onError: () => {},
  onStatusChange: () => {},
};
/**
 * Enhanced subscription hook with performance optimizations
 */
function useSubscription(userId, config) {
  var _a;
  if (config === void 0) {
    config = {};
  }
  var mergedConfig = (0, react_1.useMemo)(
    () => __assign(__assign({}, defaultConfig), config),
    [config],
  );
  var _b = (0, react_1.useState)({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      isFetching: false,
      isStale: false,
      lastUpdated: 0,
      cacheHit: false,
      performance: {
        lastFetchTime: 0,
        totalFetches: 0,
        cacheHitRate: 0,
        averageResponseTime: 0,
      },
    }),
    state = _b[0],
    setState = _b[1];
  // Refs for performance and cleanup
  var abortControllerRef = (0, react_1.useRef)(null);
  var retryTimeoutRef = (0, react_1.useRef)(null);
  var backgroundSyncRef = (0, react_1.useRef)(null);
  var performanceTimerRef = (0, react_1.useRef)(null);
  var subscriptionRef = (0, react_1.useRef)(null);
  // Get current user from Supabase auth
  var supabase = yield (0, client_1.createClient)();
  var _c = (0, react_1.useState)(userId || null),
    currentUserId = _c[0],
    setCurrentUserId = _c[1];
  // Get user ID if not provided
  (0, react_1.useEffect)(() => {
    if (!userId) {
      supabase.auth.getUser().then((_a) => {
        var user = _a.data.user;
        setCurrentUserId((user === null || user === void 0 ? void 0 : user.id) || null);
      });
    }
  }, [userId, supabase.auth]);
  // Memoized cache key
  var cacheKey = (0, react_1.useMemo)(
    () => (currentUserId ? "subscription_".concat(currentUserId) : null),
    [currentUserId],
  );
  // Memoized global state key
  var globalStateKey = (0, react_1.useMemo)(
    () => (currentUserId ? "hook_".concat(currentUserId) : null),
    [currentUserId],
  );
  /**
   * Fetch subscription data with performance optimizations
   */
  var fetchSubscription = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(
      this,
      __spreadArray([], args_1, true),
      void 0,
      function (force, backgroundUpdate) {
        var timerId,
          startTime,
          globalState,
          result_1,
          fromCache_1,
          isStale_1,
          endTime_1,
          duration_1,
          fetchPromise,
          globalState,
          globalState,
          endTime,
          duration_2,
          error_1,
          fetchError_1,
          globalState;
        if (force === void 0) {
          force = false;
        }
        if (backgroundUpdate === void 0) {
          backgroundUpdate = false;
        }
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!currentUserId) return [2 /*return*/, null];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 7, , 8]);
              // Set loading state (only if not background update)
              if (!backgroundUpdate) {
                setState((prev) => __assign(__assign({}, prev), { isFetching: true, error: null }));
              }
              timerId =
                subscription_performance_monitor_1.subscriptionPerformanceMonitor.startTimer(
                  "hook_fetch_".concat(currentUserId),
                );
              startTime = performance.now();
              if (!(!force && globalStateKey)) return [3 /*break*/, 3];
              globalState = globalHookState.get(globalStateKey);
              if (
                !(
                  (globalState === null || globalState === void 0 ? void 0 : globalState.promise) &&
                  !backgroundUpdate
                )
              )
                return [3 /*break*/, 3];
              return [4 /*yield*/, globalState.promise];
            case 2:
              return [2 /*return*/, _a.sent()];
            case 3:
              result_1 = null;
              fromCache_1 = false;
              if (!(mergedConfig.enableCaching && !force && cacheKey)) return [3 /*break*/, 5];
              return [
                4 /*yield*/,
                subscription_cache_enhanced_1.enhancedSubscriptionCache.get(cacheKey),
              ];
            case 4:
              result_1 = _a.sent();
              if (result_1) {
                fromCache_1 = true;
                isStale_1 =
                  result_1.performance &&
                  Date.now() - result_1.performance.validationTime > mergedConfig.staleTime;
                if (!isStale_1 || backgroundUpdate) {
                  endTime_1 = performance.now();
                  duration_1 = endTime_1 - startTime;
                  subscription_performance_monitor_1.subscriptionPerformanceMonitor.endTimer(
                    timerId,
                    true,
                  );
                  // Update state
                  setState((prev) =>
                    __assign(__assign({}, prev), {
                      data: result_1,
                      isLoading: false,
                      isFetching: false,
                      isError: false,
                      error: null,
                      lastUpdated: Date.now(),
                      cacheHit: true,
                      isStale: isStale_1 || false,
                      performance: __assign(__assign({}, prev.performance), {
                        lastFetchTime: duration_1,
                        cacheHitRate:
                          (prev.performance.cacheHitRate * prev.performance.totalFetches + 1) /
                          (prev.performance.totalFetches + 1),
                      }),
                    }),
                  );
                  return [2 /*return*/, result_1];
                }
              }
              _a.label = 5;
            case 5:
              // Create abort controller for request cancellation
              abortControllerRef.current = new AbortController();
              fetchPromise =
                subscription_query_optimizer_1.subscriptionQueryOptimizer.getSubscriptionStatus(
                  currentUserId,
                  {
                    useCache: mergedConfig.enableCaching,
                    forceRefresh: force,
                    cacheTTL: getCacheTTL(mergedConfig.cacheStrategy),
                    priority: "high",
                    timeout: 10000, // 10 second timeout
                  },
                );
              // Store promise in global state
              if (globalStateKey) {
                globalState = globalHookState.get(globalStateKey) || {
                  subscribers: new Set(),
                  lastFetch: 0,
                  data: null,
                  promise: null,
                };
                globalState.promise = fetchPromise;
                globalState.lastFetch = Date.now();
                globalHookState.set(globalStateKey, globalState);
              }
              return [
                4 /*yield*/,
                fetchPromise,
                // Clear promise from global state
              ];
            case 6:
              result_1 = _a.sent();
              // Clear promise from global state
              if (globalStateKey) {
                globalState = globalHookState.get(globalStateKey);
                if (globalState) {
                  globalState.promise = null;
                  globalState.data = result_1;
                }
              }
              endTime = performance.now();
              duration_2 = endTime - startTime;
              subscription_performance_monitor_1.subscriptionPerformanceMonitor.endTimer(
                timerId,
                true,
              );
              // Update state
              setState((prev) => {
                var newTotalFetches = prev.performance.totalFetches + 1;
                var newAverageResponseTime =
                  (prev.performance.averageResponseTime * prev.performance.totalFetches +
                    duration_2) /
                  newTotalFetches;
                return __assign(__assign({}, prev), {
                  data: result_1,
                  isLoading: false,
                  isFetching: false,
                  isError: false,
                  error: null,
                  lastUpdated: Date.now(),
                  cacheHit: fromCache_1,
                  isStale: false,
                  performance: {
                    lastFetchTime: duration_2,
                    totalFetches: newTotalFetches,
                    cacheHitRate: fromCache_1
                      ? (prev.performance.cacheHitRate * prev.performance.totalFetches + 1) /
                        newTotalFetches
                      : (prev.performance.cacheHitRate * prev.performance.totalFetches) /
                        newTotalFetches,
                    averageResponseTime: newAverageResponseTime,
                  },
                });
              });
              // Trigger status change callback
              if (
                (result_1 === null || result_1 === void 0 ? void 0 : result_1.status) &&
                mergedConfig.onStatusChange
              ) {
                mergedConfig.onStatusChange(result_1.status);
              }
              return [2 /*return*/, result_1];
            case 7:
              error_1 = _a.sent();
              fetchError_1 = error_1;
              if (performanceTimerRef.current) {
                subscription_performance_monitor_1.subscriptionPerformanceMonitor.endTimer(
                  performanceTimerRef.current,
                  false,
                );
              }
              // Don't update state if request was aborted
              if (fetchError_1.name === "AbortError") {
                return [2 /*return*/, null];
              }
              setState((prev) =>
                __assign(__assign({}, prev), {
                  isLoading: false,
                  isFetching: false,
                  isError: true,
                  error: fetchError_1,
                  lastUpdated: Date.now(),
                }),
              );
              mergedConfig.onError(fetchError_1);
              // Clear promise from global state
              if (globalStateKey) {
                globalState = globalHookState.get(globalStateKey);
                if (globalState) {
                  globalState.promise = null;
                }
              }
              throw fetchError_1;
            case 8:
              return [2 /*return*/];
          }
        });
      },
    );
  }, [
    currentUserId,
    cacheKey,
    globalStateKey,
    mergedConfig.enableCaching,
    mergedConfig.staleTime,
    mergedConfig.cacheStrategy,
    mergedConfig.onStatusChange,
    mergedConfig.onError,
  ]);
  /**
   * Fetch with retry logic
   */
  var fetchWithRetry = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(
      this,
      __spreadArray([], args_1, true),
      void 0,
      function (attempt, force, backgroundUpdate) {
        var error_2, delay;
        if (attempt === void 0) {
          attempt = 1;
        }
        if (force === void 0) {
          force = false;
        }
        if (backgroundUpdate === void 0) {
          backgroundUpdate = false;
        }
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, fetchSubscription(force, backgroundUpdate)];
            case 1:
              return [2 /*return*/, _a.sent()];
            case 2:
              error_2 = _a.sent();
              if (attempt < mergedConfig.retryAttempts) {
                delay = mergedConfig.retryDelay * 2 ** (attempt - 1); // Exponential backoff
                retryTimeoutRef.current = setTimeout(() => {
                  fetchWithRetry(attempt + 1, force, backgroundUpdate);
                }, delay);
                return [2 /*return*/, null];
              } else {
                throw error_2;
              }
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      },
    );
  }, [fetchSubscription, mergedConfig.retryAttempts, mergedConfig.retryDelay]);
  /**
   * Manual refetch function
   */
  var refetch = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => [2 /*return*/, fetchWithRetry(1, true, false)]);
      }),
    [fetchWithRetry],
  );
  /**
   * Invalidate cache
   */
  var invalidate = (0, react_1.useCallback)(() => {
    if (cacheKey) {
      subscription_cache_enhanced_1.enhancedSubscriptionCache.delete(cacheKey);
    }
    setState((prev) => __assign(__assign({}, prev), { isStale: true }));
  }, [cacheKey]);
  /**
   * Prefetch subscription data
   */
  var prefetch = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!mergedConfig.enablePrefetching || !currentUserId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, fetchSubscription(false, true)];
            case 2:
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              error_3 = _a.sent();
              console.warn("Prefetch failed:", error_3);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [fetchSubscription, mergedConfig.enablePrefetching, currentUserId],
  );
  /**
   * Get cache TTL based on strategy
   */
  var getCacheTTL = (0, react_1.useCallback)(
    (strategy) => {
      var _a;
      switch (strategy) {
        case "aggressive":
          return 10 * 60 * 1000; // 10 minutes
        case "conservative":
          return 2 * 60 * 1000; // 2 minutes
        case "adaptive":
          return ((_a = state.data) === null || _a === void 0 ? void 0 : _a.hasAccess)
            ? 5 * 60 * 1000
            : 1 * 60 * 1000; // 5 min if active, 1 min if not
        default:
          return 3 * 60 * 1000; // 3 minutes
      }
    },
    [(_a = state.data) === null || _a === void 0 ? void 0 : _a.hasAccess],
  );
  // Initial fetch
  (0, react_1.useEffect)(() => {
    if (currentUserId) {
      fetchWithRetry(1, false, false);
    }
  }, [currentUserId, fetchWithRetry]);
  // Setup real-time subscription
  (0, react_1.useEffect)(() => {
    if (!mergedConfig.enableRealtime || !currentUserId) return;
    var channel = supabase
      .channel("subscription_".concat(currentUserId))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_subscriptions",
          filter: "user_id=eq.".concat(currentUserId),
        },
        (payload) => {
          console.log("Real-time subscription update:", payload);
          // Invalidate cache and refetch
          invalidate();
          fetchWithRetry(1, true, true);
        },
      )
      .subscribe();
    subscriptionRef.current = channel;
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [mergedConfig.enableRealtime, currentUserId, supabase, invalidate, fetchWithRetry]);
  // Setup background sync
  (0, react_1.useEffect)(() => {
    if (!mergedConfig.enableBackgroundSync || mergedConfig.refetchInterval <= 0) return;
    backgroundSyncRef.current = setInterval(() => {
      if (currentUserId && !state.isFetching) {
        fetchWithRetry(1, false, true); // Background update
      }
    }, mergedConfig.refetchInterval);
    return () => {
      if (backgroundSyncRef.current) {
        clearInterval(backgroundSyncRef.current);
        backgroundSyncRef.current = null;
      }
    };
  }, [
    mergedConfig.enableBackgroundSync,
    mergedConfig.refetchInterval,
    currentUserId,
    state.isFetching,
    fetchWithRetry,
  ]);
  // Cleanup on unmount
  (0, react_1.useEffect)(
    () => () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (backgroundSyncRef.current) {
        clearInterval(backgroundSyncRef.current);
      }
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    },
    [supabase],
  );
  // Derived values with memoization
  var derivedValues = (0, react_1.useMemo)(() => {
    var data = state.data;
    var subscription = (data === null || data === void 0 ? void 0 : data.subscription) || null;
    var status = (data === null || data === void 0 ? void 0 : data.status) || null;
    var hasAccess = (data === null || data === void 0 ? void 0 : data.hasAccess) || false;
    var isActive = status === "active" || status === "trialing";
    var isExpired = status === "expired" || status === "canceled";
    var isInGracePeriod = (data === null || data === void 0 ? void 0 : data.gracePeriod) || false;
    // Calculate days until expiration
    var daysUntilExpiration = null;
    if (
      subscription === null || subscription === void 0 ? void 0 : subscription.current_period_end
    ) {
      var endDate = new Date(subscription.current_period_end);
      var now = new Date();
      var diffTime = endDate.getTime() - now.getTime();
      daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    // Feature access check
    var canAccessFeature = (feature) => {
      var _a;
      if (
        !hasAccess ||
        !((_a = subscription === null || subscription === void 0 ? void 0 : subscription.plan) ===
          null || _a === void 0
          ? void 0
          : _a.features)
      )
        return false;
      return subscription.plan.features.includes(feature);
    };
    // Usage limit check
    var getUsageLimit = (resource) => {
      if (!(subscription === null || subscription === void 0 ? void 0 : subscription.plan))
        return null;
      var limits = {
        patients: subscription.plan.max_patients,
        clinics: subscription.plan.max_clinics,
      };
      return limits[resource] || null;
    };
    return {
      subscription: subscription,
      status: status,
      hasAccess: hasAccess,
      isActive: isActive,
      isExpired: isExpired,
      isInGracePeriod: isInGracePeriod,
      daysUntilExpiration: daysUntilExpiration,
      canAccessFeature: canAccessFeature,
      getUsageLimit: getUsageLimit,
    };
  }, [state.data]);
  return __assign(__assign(__assign({}, state), derivedValues), {
    refetch: refetch,
    invalidate: invalidate,
    prefetch: prefetch,
  });
}
// Export hook variants for specific use cases
function useSubscriptionStatus(userId) {
  var _a = useSubscription(userId, {
      enableRealtime: false,
      enablePrefetching: false,
      cacheStrategy: "conservative",
    }),
    status = _a.status,
    isLoading = _a.isLoading,
    isActive = _a.isActive,
    refetch = _a.refetch;
  return { status: status, isLoading: isLoading, isActive: isActive, refetch: refetch };
}
function useSubscriptionAccess(userId) {
  var _a = useSubscription(userId, {
      enableBackgroundSync: true,
      cacheStrategy: "adaptive",
    }),
    hasAccess = _a.hasAccess,
    isLoading = _a.isLoading,
    canAccessFeature = _a.canAccessFeature,
    refetch = _a.refetch;
  return {
    hasAccess: hasAccess,
    isLoading: isLoading,
    canAccessFeature: canAccessFeature,
    refetch: refetch,
  };
}
function useSubscriptionLimits(userId) {
  var _a = useSubscription(userId, {
      enableRealtime: true,
      cacheStrategy: "aggressive",
    }),
    getUsageLimit = _a.getUsageLimit,
    subscription = _a.subscription,
    isLoading = _a.isLoading,
    refetch = _a.refetch;
  return {
    getUsageLimit: getUsageLimit,
    subscription: subscription,
    isLoading: isLoading,
    refetch: refetch,
  };
}
