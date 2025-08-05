/**
 * Real-Time Analytics Dashboard Hook for NeonPro
 *
 * Custom hook providing real-time analytics capabilities including:
 * - Live subscription metrics and KPI tracking
 * - Real-time trial conversion monitoring
 * - Revenue streaming with performance alerts
 * - Event-driven updates with WebSocket integration
 * - Configurable refresh rates and data filters
 *
 * Integrates with Supabase real-time subscriptions and analytics API.
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
exports.useRealTimeAnalytics = useRealTimeAnalytics;
exports.usePerformanceMonitoring = usePerformanceMonitoring;
exports.useUserActivityMonitoring = useUserActivityMonitoring;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var client_1 = require("@/lib/supabase/client");
/**
 * Main real-time analytics dashboard hook
 */
function useRealTimeAnalytics(initialConfig) {
  var queryClient = (0, react_query_1.useQueryClient)();
  var supabase = yield (0, client_1.createClient)();
  var _a = (0, react_1.useState)(initialConfig),
    config = _a[0],
    setConfig = _a[1];
  var _b = (0, react_1.useState)({
      activeSubscriptions: 0,
      monthlyRecurringRevenue: 0,
      trialConversions: 0,
      churnRate: 0,
      newSignups: 0,
      lastUpdated: new Date(),
    }),
    metrics = _b[0],
    setMetrics = _b[1];
  var _c = (0, react_1.useState)({}),
    trends = _c[0],
    setTrends = _c[1];
  var _d = (0, react_1.useState)([]),
    alerts = _d[0],
    setAlerts = _d[1];
  var _e = (0, react_1.useState)(false),
    isConnected = _e[0],
    setIsConnected = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var subscriptionsRef = (0, react_1.useRef)({});
  var intervalRef = (0, react_1.useRef)(null);
  // Fetch initial metrics
  var _g = (0, react_query_1.useQuery)({
      queryKey: ["real-time-metrics", config.timeRange],
      queryFn: () =>
        __awaiter(this, void 0, void 0, function () {
          var response, data, err_1;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 3, , 4]);
                return [
                  4 /*yield*/,
                  fetch("/api/analytics/real-time", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      metrics: config.metrics,
                      timeRange: config.timeRange,
                      includeTrends: true,
                    }),
                  }),
                ];
              case 1:
                response = _a.sent();
                if (!response.ok) throw new Error("Failed to fetch metrics");
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                setMetrics(data.metrics);
                setTrends(data.trends || {});
                return [2 /*return*/, data];
              case 3:
                err_1 = _a.sent();
                setError(err_1 instanceof Error ? err_1.message : "Failed to fetch metrics");
                throw err_1;
              case 4:
                return [2 /*return*/];
            }
          });
        }),
      refetchInterval: config.refreshInterval * 1000,
      staleTime: 30 * 1000, // 30 seconds
    }),
    initialData = _g.data,
    refreshMetrics = _g.refetch;
  // Check for alerts based on thresholds
  var checkAlerts = (0, react_1.useCallback)(
    (newMetrics) => {
      if (!config.enableAlerts) return;
      var newAlerts = [];
      // Churn rate alert
      if (
        config.alertThresholds.churnRate &&
        newMetrics.churnRate > config.alertThresholds.churnRate
      ) {
        newAlerts.push({
          id: "churn-".concat(Date.now()),
          type: "critical",
          message: "Churn rate ("
            .concat(newMetrics.churnRate.toFixed(2), "%) exceeds threshold (")
            .concat(config.alertThresholds.churnRate, "%)"),
          timestamp: new Date(),
          metric: "churn",
        });
      }
      // Revenue growth alert (if we have previous data)
      if (config.alertThresholds.revenueGrowth && metrics.monthlyRecurringRevenue > 0) {
        var growth =
          ((newMetrics.monthlyRecurringRevenue - metrics.monthlyRecurringRevenue) /
            metrics.monthlyRecurringRevenue) *
          100;
        if (growth < config.alertThresholds.revenueGrowth) {
          newAlerts.push({
            id: "revenue-".concat(Date.now()),
            type: "warning",
            message: "Revenue growth ("
              .concat(growth.toFixed(2), "%) below threshold (")
              .concat(config.alertThresholds.revenueGrowth, "%)"),
            timestamp: new Date(),
            metric: "revenue",
          });
        }
      }
      if (newAlerts.length > 0) {
        setAlerts((prev) => __spreadArray(__spreadArray([], prev, true), newAlerts, true));
      }
    },
    [config, metrics],
  );
  // Start real-time monitoring
  var startMonitoring = (0, react_1.useCallback)(() => {
    if (isConnected) return;
    try {
      // Subscribe to subscription changes
      if (config.metrics.includes("subscriptions") || config.metrics.includes("revenue")) {
        subscriptionsRef.current.subscriptions = supabase
          .channel("subscriptions-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "subscriptions",
            },
            (payload) => {
              // Update metrics when subscriptions change
              setMetrics((prev) => {
                var updated = __assign(__assign({}, prev), { lastUpdated: new Date() });
                if (payload.eventType === "INSERT") {
                  updated.activeSubscriptions += 1;
                  updated.newSignups += 1;
                } else if (payload.eventType === "DELETE") {
                  updated.activeSubscriptions -= 1;
                } else if (payload.eventType === "UPDATE") {
                  // Handle status changes
                  var old = payload.old;
                  var newSub = payload.new;
                  if (
                    (old === null || old === void 0 ? void 0 : old.status) !==
                    (newSub === null || newSub === void 0 ? void 0 : newSub.status)
                  ) {
                    if (
                      (newSub === null || newSub === void 0 ? void 0 : newSub.status) ===
                        "active" &&
                      (old === null || old === void 0 ? void 0 : old.status) !== "active"
                    ) {
                      updated.activeSubscriptions += 1;
                      if ((old === null || old === void 0 ? void 0 : old.status) === "trialing") {
                        updated.trialConversions += 1;
                      }
                    } else if (
                      (old === null || old === void 0 ? void 0 : old.status) === "active" &&
                      (newSub === null || newSub === void 0 ? void 0 : newSub.status) !== "active"
                    ) {
                      updated.activeSubscriptions -= 1;
                    }
                  }
                }
                checkAlerts(updated);
                return updated;
              });
            },
          )
          .subscribe((status) => {
            setIsConnected(status === "SUBSCRIBED");
            if (status === "CHANNEL_ERROR") {
              setError("Failed to connect to subscription updates");
            }
          });
      }
      // Subscribe to trial changes
      if (config.metrics.includes("trials")) {
        subscriptionsRef.current.trials = supabase
          .channel("trial-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "subscription_trials",
            },
            (payload) => {
              var _a;
              if (
                payload.eventType === "UPDATE" &&
                ((_a = payload.new) === null || _a === void 0 ? void 0 : _a.converted_at)
              ) {
                setMetrics((prev) =>
                  __assign(__assign({}, prev), {
                    trialConversions: prev.trialConversions + 1,
                    lastUpdated: new Date(),
                  }),
                );
              }
            },
          )
          .subscribe();
      }
      // Subscribe to revenue changes
      if (config.metrics.includes("revenue")) {
        subscriptionsRef.current.revenue = supabase
          .channel("revenue-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "subscription_revenue",
            },
            (payload) => {
              // Recalculate MRR when revenue changes
              refreshMetrics();
            },
          )
          .subscribe();
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start monitoring");
    }
  }, [config, isConnected, supabase, checkAlerts, refreshMetrics]);
  // Stop monitoring
  var stopMonitoring = (0, react_1.useCallback)(() => {
    Object.values(subscriptionsRef.current).forEach((subscription) => {
      if (subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    });
    subscriptionsRef.current = {};
    setIsConnected(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  // Update configuration
  var updateConfig = (0, react_1.useCallback)(
    (newConfig) => {
      setConfig((prev) => __assign(__assign({}, prev), newConfig));
      // Restart monitoring if metrics changed
      if (newConfig.metrics && isConnected) {
        stopMonitoring();
        setTimeout(startMonitoring, 100);
      }
    },
    [isConnected, startMonitoring, stopMonitoring],
  );
  // Clear all alerts
  var clearAlerts = (0, react_1.useCallback)(() => {
    setAlerts([]);
  }, []);
  // Acknowledge specific alert
  var acknowledgeAlert = (0, react_1.useCallback)((alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);
  // Auto-start monitoring on mount
  (0, react_1.useEffect)(() => {
    startMonitoring();
    return () => {
      stopMonitoring();
    };
  }, []); // Empty dependency array for mount/unmount only
  // Update trends periodically
  (0, react_1.useEffect)(() => {
    if (!isConnected) return;
    intervalRef.current = setInterval(() => {
      setTrends((prev) => {
        var updated = __assign({}, prev);
        // Add current metrics to trends
        config.metrics.forEach((metric) => {
          if (!updated[metric]) updated[metric] = [];
          var value = 0;
          switch (metric) {
            case "subscriptions":
              value = metrics.activeSubscriptions;
              break;
            case "revenue":
              value = metrics.monthlyRecurringRevenue;
              break;
            case "trials":
              value = metrics.trialConversions;
              break;
            case "churn":
              value = metrics.churnRate;
              break;
            case "signups":
              value = metrics.newSignups;
              break;
          }
          updated[metric].push(value);
          // Keep only last 100 data points
          if (updated[metric].length > 100) {
            updated[metric] = updated[metric].slice(-100);
          }
        });
        return updated;
      });
    }, 60000); // Update trends every minute
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected, config.metrics, metrics]);
  return {
    // State
    metrics: metrics,
    trends: trends,
    alerts: alerts,
    isConnected: isConnected,
    lastUpdate: metrics.lastUpdated,
    error: error,
    // Actions
    startMonitoring: startMonitoring,
    stopMonitoring: stopMonitoring,
    refreshMetrics: () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, refreshMetrics()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    updateConfig: updateConfig,
    clearAlerts: clearAlerts,
    acknowledgeAlert: acknowledgeAlert,
  };
}
/**
 * Hook for performance monitoring
 */
function usePerformanceMonitoring() {
  var _a = (0, react_1.useState)({
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
      uptime: 100,
    }),
    performance = _a[0],
    setPerformance = _a[1];
  (0, react_1.useEffect)(() => {
    var checkPerformance = () =>
      __awaiter(this, void 0, void 0, function () {
        var start, response, responseTime, data, err_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              start = Date.now();
              return [4 /*yield*/, fetch("/api/health")];
            case 1:
              response = _a.sent();
              responseTime = Date.now() - start;
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setPerformance({
                responseTime: responseTime,
                errorRate: data.errorRate || 0,
                throughput: data.throughput || 0,
                uptime: data.uptime || 100,
              });
              return [3 /*break*/, 4];
            case 3:
              err_2 = _a.sent();
              setPerformance((prev) =>
                __assign(__assign({}, prev), { errorRate: prev.errorRate + 1 }),
              );
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    var interval = setInterval(checkPerformance, 30000); // Every 30 seconds
    checkPerformance(); // Initial check
    return () => clearInterval(interval);
  }, []);
  return performance;
}
/**
 * Hook for user activity monitoring
 */
function useUserActivityMonitoring() {
  var _a = (0, react_1.useState)({
      activeUsers: 0,
      sessionsToday: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
    }),
    activity = _a[0],
    setActivity = _a[1];
  var supabase = yield (0, client_1.createClient)();
  (0, react_1.useEffect)(() => {
    // Subscribe to user activity events
    var subscription = supabase
      .channel("user-activity")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_sessions",
        },
        (payload) => {
          // Update activity metrics
          setActivity((prev) => {
            var _a;
            var updated = __assign({}, prev);
            if (payload.eventType === "INSERT") {
              updated.sessionsToday += 1;
              updated.activeUsers += 1;
            } else if (
              payload.eventType === "UPDATE" &&
              ((_a = payload.new) === null || _a === void 0 ? void 0 : _a.ended_at)
            ) {
              updated.activeUsers -= 1;
              // Calculate session duration
              var duration =
                new Date(payload.new.ended_at).getTime() -
                new Date(payload.new.started_at).getTime();
              updated.averageSessionDuration =
                (updated.averageSessionDuration + duration / 1000 / 60) / 2; // Average in minutes
            }
            return updated;
          });
        },
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  return activity;
}
