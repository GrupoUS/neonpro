"use strict";
/**
 * Web Vitals Performance Monitoring
 *
 * Advanced Core Web Vitals tracking implementation for Next.js 15
 * Based on latest 2025 performance optimization patterns
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
exports.PerformanceUtils = exports.PERFORMANCE_THRESHOLDS = void 0;
exports.getPerformanceGrade = getPerformanceGrade;
exports.sendToAnalytics = sendToAnalytics;
exports.reportWebVitals = reportWebVitals;
exports.usePerformanceMonitoring = usePerformanceMonitoring;
var web_vitals_1 = require("web-vitals");
// Performance thresholds based on Core Web Vitals 2025 standards
exports.PERFORMANCE_THRESHOLDS = {
  // Largest Contentful Paint - measures loading performance
  LCP: {
    GOOD: 2500, // <= 2.5s
    NEEDS_IMPROVEMENT: 4000, // 2.5s - 4.0s
  },
  // First Input Delay - measures interactivity (being replaced by INP)
  FID: {
    GOOD: 100, // <= 100ms
    NEEDS_IMPROVEMENT: 300, // 100ms - 300ms
  },
  // Cumulative Layout Shift - measures visual stability
  CLS: {
    GOOD: 0.1, // <= 0.1
    NEEDS_IMPROVEMENT: 0.25, // 0.1 - 0.25
  },
  // First Contentful Paint - measures perceived loading
  FCP: {
    GOOD: 1800, // <= 1.8s
    NEEDS_IMPROVEMENT: 3000, // 1.8s - 3.0s
  },
  // Time to First Byte - measures server response time
  TTFB: {
    GOOD: 800, // <= 800ms
    NEEDS_IMPROVEMENT: 1800, // 800ms - 1.8s
  },
};
// Performance grade calculator
function getPerformanceGrade(metric, value) {
  var thresholds = exports.PERFORMANCE_THRESHOLDS[metric];
  if (!thresholds) return "poor";
  if (value <= thresholds.GOOD) return "good";
  if (value <= thresholds.NEEDS_IMPROVEMENT) return "needs-improvement";
  return "poor";
}
// Analytics endpoint for storing performance data
var ANALYTICS_ENDPOINT = "/api/analytics/performance";
// Send metric to analytics service
function sendToAnalytics(metric) {
  return __awaiter(this, void 0, void 0, function () {
    var body, blob;
    return __generator(this, function (_a) {
      try {
        body = {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
          entries: metric.entries,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          grade: getPerformanceGrade(metric.name, metric.value),
        };
        // Use sendBeacon for reliability, fallback to fetch
        if (navigator.sendBeacon) {
          blob = new Blob([JSON.stringify(body)], { type: "application/json" });
          navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
        } else {
          fetch(ANALYTICS_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            keepalive: true,
          }).catch(function () {
            // Silently fail - don't impact user experience
          });
        }
      } catch (error) {
        // Silently fail - don't impact user experience
        console.debug("Performance metric send failed:", error);
      }
      return [2 /*return*/];
    });
  });
}
// Enhanced metric reporting with additional context
function reportWebVitals() {
  try {
    // Core web vitals with enhanced reporting
    (0, web_vitals_1.getCLS)(sendToAnalytics);
    (0, web_vitals_1.getFID)(sendToAnalytics);
    (0, web_vitals_1.getFCP)(sendToAnalytics);
    (0, web_vitals_1.getLCP)(sendToAnalytics);
    (0, web_vitals_1.getTTFB)(sendToAnalytics);
    // Additional performance observations
    if ("PerformanceObserver" in window) {
      // Long Tasks API - detect blocking main thread
      var longTaskObserver = new PerformanceObserver(function (list) {
        for (var _i = 0, _a = list.getEntries(); _i < _a.length; _i++) {
          var entry = _a[_i];
          sendToAnalytics({
            name: "LONG_TASK",
            value: entry.duration,
            rating: entry.duration > 50 ? "poor" : "good",
            delta: 0,
            id: "long-task-".concat(Date.now()),
            navigationType: "navigate",
            entries: [entry],
          });
        }
      });
      try {
        longTaskObserver.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        // Long Tasks API not supported
      }
      // Navigation Timing API - detailed navigation metrics
      var navigationObserver = new PerformanceObserver(function (list) {
        for (var _i = 0, _a = list.getEntries(); _i < _a.length; _i++) {
          var entry = _a[_i];
          var navEntry = entry;
          // DNS lookup time
          var dnsTime = navEntry.domainLookupEnd - navEntry.domainLookupStart;
          if (dnsTime > 0) {
            sendToAnalytics({
              name: "DNS_TIME",
              value: dnsTime,
              rating: dnsTime > 100 ? "poor" : "good",
              delta: 0,
              id: "dns-".concat(Date.now()),
              navigationType: "navigate",
              entries: [entry],
            });
          }
          // Connection time
          var connectTime = navEntry.connectEnd - navEntry.connectStart;
          if (connectTime > 0) {
            sendToAnalytics({
              name: "CONNECT_TIME",
              value: connectTime,
              rating: connectTime > 100 ? "poor" : "good",
              delta: 0,
              id: "connect-".concat(Date.now()),
              navigationType: "navigate",
              entries: [entry],
            });
          }
        }
      });
      try {
        navigationObserver.observe({ entryTypes: ["navigation"] });
      } catch (e) {
        // Navigation Timing API not supported
      }
    }
  } catch (error) {
    console.debug("Web Vitals initialization failed:", error);
  }
}
// Performance monitoring hook for React components
function usePerformanceMonitoring() {
  var startTime = performance.now();
  return {
    // Mark component render time
    markRender: function (componentName) {
      var renderTime = performance.now() - startTime;
      sendToAnalytics({
        name: "COMPONENT_RENDER",
        value: renderTime,
        rating: renderTime > 16 ? "poor" : "good", // 60fps = 16.67ms per frame
        delta: 0,
        id: "".concat(componentName, "-").concat(Date.now()),
        navigationType: "navigate",
        entries: [],
      });
    },
    // Mark interaction response time
    markInteraction: function (interactionName, startTime) {
      var responseTime = performance.now() - startTime;
      sendToAnalytics({
        name: "INTERACTION_RESPONSE",
        value: responseTime,
        rating: responseTime > 200 ? "poor" : "good", // INP threshold
        delta: 0,
        id: "".concat(interactionName, "-").concat(Date.now()),
        navigationType: "navigate",
        entries: [],
      });
    },
  };
}
// Advanced performance utilities
exports.PerformanceUtils = {
  // Measure function execution time
  measureFunction: function (name, fn) {
    return __awaiter(void 0, void 0, void 0, function () {
      var start, result, duration;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            start = performance.now();
            return [4 /*yield*/, fn()];
          case 1:
            result = _a.sent();
            duration = performance.now() - start;
            sendToAnalytics({
              name: "FUNCTION_EXECUTION",
              value: duration,
              rating: duration > 100 ? "poor" : "good",
              delta: 0,
              id: "".concat(name, "-").concat(Date.now()),
              navigationType: "navigate",
              entries: [],
            });
            return [2 /*return*/, result];
        }
      });
    });
  },
  // Monitor resource loading performance
  observeResourceTiming: function () {
    if ("PerformanceObserver" in window) {
      var resourceObserver = new PerformanceObserver(function (list) {
        for (var _i = 0, _a = list.getEntries(); _i < _a.length; _i++) {
          var entry = _a[_i];
          var resource = entry;
          // Focus on large resources that might impact performance
          if (resource.transferSize > 100000) {
            // > 100kb
            sendToAnalytics({
              name: "LARGE_RESOURCE",
              value: resource.duration,
              rating: resource.duration > 1000 ? "poor" : "good",
              delta: 0,
              id: "resource-".concat(Date.now()),
              navigationType: "navigate",
              entries: [entry],
            });
          }
        }
      });
      try {
        resourceObserver.observe({ entryTypes: ["resource"] });
      } catch (e) {
        // Resource Timing API not supported
      }
    }
  },
};
// Initialize performance monitoring
if (typeof window !== "undefined") {
  // Start monitoring when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reportWebVitals);
  } else {
    reportWebVitals();
  }
}
