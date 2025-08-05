"use client";
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
exports.useSessionAnalytics = useSessionAnalytics;
var react_1 = require("react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var TIMEFRAMES = [
  { label: "Last 24 hours", value: "1d", days: 1 },
  { label: "Last 7 days", value: "7d", days: 7 },
  { label: "Last 30 days", value: "30d", days: 30 },
  { label: "Last 90 days", value: "90d", days: 90 },
];
function useSessionAnalytics(initialTimeframe) {
  var _a, _b;
  if (initialTimeframe === void 0) {
    initialTimeframe = "7d";
  }
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var _c = (0, react_1.useState)(initialTimeframe),
    timeframe = _c[0],
    setTimeframe = _c[1];
  var _d = (0, react_1.useState)({
      metrics: null,
      deviceAnalytics: [],
      securityAnalytics: [],
      trends: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    }),
    state = _d[0],
    setState = _d[1];
  // Load analytics data
  var loadAnalytics = (0, react_1.useCallback)(
    (selectedTimeframe) =>
      __awaiter(this, void 0, void 0, function () {
        var user,
          currentTimeframe,
          response,
          data,
          processedMetrics_1,
          processedDeviceAnalytics_1,
          processedSecurityAnalytics_1,
          processedTrends_1,
          error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setState((prev) => __assign(__assign({}, prev), { isLoading: true, error: null }));
              _a.label = 1;
            case 1:
              _a.trys.push([1, 5, 6, 7]);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 2:
              user = _a.sent().data.user;
              if (!user) {
                throw new Error("User not authenticated");
              }
              currentTimeframe = selectedTimeframe || timeframe;
              return [
                4 /*yield*/,
                fetch(
                  "/api/auth/session/analytics?timeframe=".concat(
                    currentTimeframe,
                    "&includeDevices=true&includeSecurity=true",
                  ),
                  {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  },
                ),
              ];
            case 3:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to load analytics");
              }
              return [4 /*yield*/, response.json()];
            case 4:
              data = _a.sent();
              processedMetrics_1 = processMetrics(data.analytics);
              processedDeviceAnalytics_1 = processDeviceAnalytics(
                data.analytics.deviceBreakdown || [],
              );
              processedSecurityAnalytics_1 = processSecurityAnalytics(
                data.analytics.securityEvents || [],
              );
              processedTrends_1 = processTrends(data.analytics.trends || [], currentTimeframe);
              setState((prev) =>
                __assign(__assign({}, prev), {
                  metrics: processedMetrics_1,
                  deviceAnalytics: processedDeviceAnalytics_1,
                  securityAnalytics: processedSecurityAnalytics_1,
                  trends: processedTrends_1,
                  lastUpdated: new Date(),
                }),
              );
              return [3 /*break*/, 7];
            case 5:
              error_1 = _a.sent();
              setState((prev) =>
                __assign(__assign({}, prev), {
                  error: error_1 instanceof Error ? error_1.message : "Failed to load analytics",
                }),
              );
              return [3 /*break*/, 7];
            case 6:
              setState((prev) => __assign(__assign({}, prev), { isLoading: false }));
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, timeframe],
  );
  // Process main metrics
  var processMetrics = (analytics) => ({
    totalSessions: analytics.totalSessions || 0,
    activeSessions: analytics.activeSessions || 0,
    averageDuration: analytics.averageDuration || 0,
    totalDuration: analytics.totalDuration || 0,
    uniqueDevices: analytics.uniqueDevices || 0,
    securityEvents: analytics.securityEventsCount || 0,
    healthScore: analytics.healthScore || 0,
  });
  // Process device analytics
  var processDeviceAnalytics = (deviceData) =>
    deviceData.map((device) => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName || "Unknown Device",
      deviceType: device.deviceType || "unknown",
      sessionCount: device.sessionCount || 0,
      totalDuration: device.totalDuration || 0,
      averageDuration: device.averageDuration || 0,
      lastUsed: new Date(device.lastUsed || Date.now()),
      isTrusted: device.isTrusted || false,
      securityEvents: device.securityEvents || 0,
    }));
  // Process security analytics
  var processSecurityAnalytics = (securityData) => {
    var eventGroups = securityData.reduce((acc, event) => {
      var key = event.eventType;
      if (!acc[key]) {
        acc[key] = {
          eventType: key,
          count: 0,
          severity: event.severity,
          lastOccurrence: new Date(event.createdAt),
          events: [],
        };
      }
      acc[key].count++;
      acc[key].events.push(event);
      var eventDate = new Date(event.createdAt);
      if (eventDate > acc[key].lastOccurrence) {
        acc[key].lastOccurrence = eventDate;
        acc[key].severity = event.severity;
      }
      return acc;
    }, {});
    return Object.values(eventGroups).map((group) => ({
      eventType: group.eventType,
      count: group.count,
      severity: group.severity,
      lastOccurrence: group.lastOccurrence,
      trend: calculateTrend(group.events),
    }));
  };
  // Calculate trend for security events
  var calculateTrend = (events) => {
    var _a;
    if (events.length < 2) return "stable";
    var now = Date.now();
    var halfPeriod =
      ((((_a = TIMEFRAMES.find((tf) => tf.value === timeframe)) === null || _a === void 0
        ? void 0
        : _a.days) || 7) *
        24 *
        60 *
        60 *
        1000) /
      2;
    var recentEvents = events.filter(
      (event) => now - new Date(event.createdAt).getTime() < halfPeriod,
    ).length;
    var olderEvents = events.length - recentEvents;
    if (recentEvents > olderEvents * 1.2) return "increasing";
    if (recentEvents < olderEvents * 0.8) return "decreasing";
    return "stable";
  };
  // Process trends data
  var processTrends = (trendsData, currentTimeframe) => {
    var _a;
    var days =
      ((_a = TIMEFRAMES.find((tf) => tf.value === currentTimeframe)) === null || _a === void 0
        ? void 0
        : _a.days) || 7;
    var trends = [];
    var _loop_1 = (i) => {
      var date = new Date();
      date.setDate(date.getDate() - i);
      var dateStr = date.toISOString().split("T")[0];
      var dayData = trendsData.find((trend) => trend.date === dateStr) || {
        sessions: 0,
        duration: 0,
        devices: 0,
        securityEvents: 0,
      };
      trends.push({
        date: dateStr,
        sessions: dayData.sessions || 0,
        duration: dayData.duration || 0,
        devices: dayData.devices || 0,
        securityEvents: dayData.securityEvents || 0,
      });
    };
    for (var i = days - 1; i >= 0; i--) {
      _loop_1(i);
    }
    return trends;
  };
  // Get session status in real-time
  var getSessionStatus = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var user, response, data, error_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 1:
              user = _a.sent().data.user;
              if (!user) return [2 /*return*/, null];
              return [
                4 /*yield*/,
                fetch("/api/auth/session/analytics", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: user.id }),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 4];
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              return [2 /*return*/, data.status];
            case 4:
              return [2 /*return*/, null];
            case 5:
              error_2 = _a.sent();
              console.error("Failed to get session status:", error_2);
              return [2 /*return*/, null];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  // Export analytics data
  var exportAnalytics = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(this, __spreadArray([], args_1, true), void 0, function (format) {
      var exportData, blob, url, a, csvData, blob, url, a;
      if (format === void 0) {
        format = "json";
      }
      return __generator(this, (_a) => {
        try {
          exportData = {
            timeframe: timeframe,
            generatedAt: new Date().toISOString(),
            metrics: state.metrics,
            deviceAnalytics: state.deviceAnalytics,
            securityAnalytics: state.securityAnalytics,
            trends: state.trends,
          };
          if (format === "json") {
            blob = new Blob([JSON.stringify(exportData, null, 2)], {
              type: "application/json",
            });
            url = URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = "session-analytics-".concat(timeframe, "-").concat(Date.now(), ".json");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } else if (format === "csv") {
            csvData = convertToCSV(exportData);
            blob = new Blob([csvData], { type: "text/csv" });
            url = URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = "session-analytics-".concat(timeframe, "-").concat(Date.now(), ".csv");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          return [2 /*return*/, true];
        } catch (error) {
          console.error("Failed to export analytics:", error);
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  }, [timeframe, state]);
  // Convert analytics data to CSV
  var convertToCSV = (data) => {
    var lines = [];
    // Add metrics section
    lines.push("METRICS");
    lines.push("Metric,Value");
    if (data.metrics) {
      Object.entries(data.metrics).forEach((_a) => {
        var key = _a[0],
          value = _a[1];
        lines.push("".concat(key, ",").concat(value));
      });
    }
    lines.push("");
    // Add device analytics section
    lines.push("DEVICE ANALYTICS");
    lines.push(
      "Device ID,Device Name,Device Type,Session Count,Total Duration,Average Duration,Last Used,Is Trusted,Security Events",
    );
    data.deviceAnalytics.forEach((device) => {
      lines.push(
        ""
          .concat(device.deviceId, ",")
          .concat(device.deviceName, ",")
          .concat(device.deviceType, ",")
          .concat(device.sessionCount, ",")
          .concat(device.totalDuration, ",")
          .concat(device.averageDuration, ",")
          .concat(device.lastUsed.toISOString(), ",")
          .concat(device.isTrusted, ",")
          .concat(device.securityEvents),
      );
    });
    lines.push("");
    // Add security analytics section
    lines.push("SECURITY ANALYTICS");
    lines.push("Event Type,Count,Severity,Last Occurrence,Trend");
    data.securityAnalytics.forEach((security) => {
      lines.push(
        ""
          .concat(security.eventType, ",")
          .concat(security.count, ",")
          .concat(security.severity, ",")
          .concat(security.lastOccurrence.toISOString(), ",")
          .concat(security.trend),
      );
    });
    lines.push("");
    // Add trends section
    lines.push("TRENDS");
    lines.push("Date,Sessions,Duration,Devices,Security Events");
    data.trends.forEach((trend) => {
      lines.push(
        ""
          .concat(trend.date, ",")
          .concat(trend.sessions, ",")
          .concat(trend.duration, ",")
          .concat(trend.devices, ",")
          .concat(trend.securityEvents),
      );
    });
    return lines.join("\n");
  };
  // Change timeframe and reload data
  var changeTimeframe = (0, react_1.useCallback)(
    (newTimeframe) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setTimeframe(newTimeframe);
              return [4 /*yield*/, loadAnalytics(newTimeframe)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [loadAnalytics],
  );
  // Refresh analytics data
  var refreshAnalytics = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, loadAnalytics()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [loadAnalytics],
  );
  // Get analytics summary
  var getAnalyticsSummary = (0, react_1.useCallback)(() => {
    if (!state.metrics) return null;
    var summary = {
      healthStatus:
        state.metrics.healthScore >= 80
          ? "good"
          : state.metrics.healthScore >= 60
            ? "warning"
            : "critical",
      mostUsedDevice: state.deviceAnalytics.reduce(
        (prev, current) => (prev.sessionCount > current.sessionCount ? prev : current),
        state.deviceAnalytics[0],
      ),
      topSecurityConcern: state.securityAnalytics.reduce(
        (prev, current) => (prev.count > current.count ? prev : current),
        state.securityAnalytics[0],
      ),
      averageSessionsPerDay:
        state.trends.length > 0
          ? state.trends.reduce((sum, trend) => sum + trend.sessions, 0) / state.trends.length
          : 0,
      securityTrend:
        state.securityAnalytics.filter((sa) => sa.trend === "increasing").length > 0
          ? "increasing"
          : "stable",
    };
    return summary;
  }, [state.metrics, state.deviceAnalytics, state.securityAnalytics, state.trends]);
  // Initialize analytics on mount
  (0, react_1.useEffect)(() => {
    loadAnalytics();
  }, [loadAnalytics]);
  return __assign(__assign({}, state), {
    timeframe: timeframe,
    timeframes: TIMEFRAMES,
    // Actions
    loadAnalytics: loadAnalytics,
    changeTimeframe: changeTimeframe,
    refreshAnalytics: refreshAnalytics,
    getSessionStatus: getSessionStatus,
    exportAnalytics: exportAnalytics,
    // Computed
    summary: getAnalyticsSummary(),
    hasData: state.metrics !== null,
    isEmpty: ((_a = state.metrics) === null || _a === void 0 ? void 0 : _a.totalSessions) === 0,
    isHealthy:
      (((_b = state.metrics) === null || _b === void 0 ? void 0 : _b.healthScore) || 0) >= 80,
  });
}
