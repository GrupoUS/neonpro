"use client";
"use strict";
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
exports.usePerformanceMonitor = usePerformanceMonitor;
exports.useComponentPerformance = useComponentPerformance;
exports.usePerformanceMetric = usePerformanceMetric;
exports.measurePerformance = measurePerformance;
exports.measureAsyncPerformance = measureAsyncPerformance;
var react_1 = require("react");
// =====================================================================================
// PERFORMANCE MONITOR CLASS
// =====================================================================================
var PerformanceMonitor = /** @class */ (function () {
  function PerformanceMonitor() {
    this.metrics = new Map();
    this.alerts = [];
    this.components = new Map();
    this.observers = [];
    this.isMonitoring = false;
    this.initializeObservers();
  }
  PerformanceMonitor.prototype.initializeObservers = function () {
    var _this = this;
    if (typeof window === "undefined") return;
    try {
      // Memory usage observer
      if ("PerformanceObserver" in window) {
        this.memoryObserver = new PerformanceObserver(function (list) {
          for (var _i = 0, _a = list.getEntries(); _i < _a.length; _i++) {
            var entry = _a[_i];
            if (entry.entryType === "measure") {
              _this.addMetric("custom-measure", {
                name: entry.name,
                value: entry.duration,
                timestamp: Date.now(),
                unit: "ms",
              });
            }
          }
        });
        this.memoryObserver.observe({ entryTypes: ["measure"] });
        // Navigation timing observer
        this.navigationObserver = new PerformanceObserver(function (list) {
          for (var _i = 0, _a = list.getEntries(); _i < _a.length; _i++) {
            var entry = _a[_i];
            if (entry.entryType === "navigation") {
              var navEntry = entry;
              _this.addMetric("navigation", {
                name: "page-load-time",
                value: navEntry.loadEventEnd - navEntry.navigationStart,
                timestamp: Date.now(),
                threshold: 3000,
                unit: "ms",
              });
            }
          }
        });
        this.navigationObserver.observe({ entryTypes: ["navigation"] });
      }
    } catch (error) {
      console.warn("Performance observers not supported:", error);
    }
  };
  PerformanceMonitor.prototype.startMonitoring = function () {
    var _this = this;
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(function () {
      _this.collectMetrics();
      _this.analyzePerformance();
      _this.notifyObservers();
    }, 5000); // Check every 5 seconds
    console.log("🚀 Performance monitoring started");
  };
  PerformanceMonitor.prototype.stopMonitoring = function () {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.memoryObserver) {
      this.memoryObserver.disconnect();
    }
    if (this.navigationObserver) {
      this.navigationObserver.disconnect();
    }
    console.log("⏹️ Performance monitoring stopped");
  };
  PerformanceMonitor.prototype.collectMetrics = function () {
    if (typeof window === "undefined") return;
    var now = Date.now();
    // Memory usage
    if ("memory" in performance) {
      var memory = performance.memory;
      this.addMetric("memory", {
        name: "heap-used",
        value: memory.usedJSHeapSize / 1024 / 1024, // MB
        timestamp: now,
        threshold: 100, // 100MB
        unit: "MB",
      });
      this.addMetric("memory", {
        name: "heap-total",
        value: memory.totalJSHeapSize / 1024 / 1024, // MB
        timestamp: now,
        unit: "MB",
      });
    }
    // FPS (approximate)
    this.measureFPS();
    // DOM nodes count
    this.addMetric("dom", {
      name: "node-count",
      value: document.querySelectorAll("*").length,
      timestamp: now,
      threshold: 1500,
      unit: "nodes",
    });
    // Event listeners count (approximate)
    this.addMetric("events", {
      name: "listener-count",
      value: this.estimateEventListeners(),
      timestamp: now,
      threshold: 100,
      unit: "listeners",
    });
  };
  PerformanceMonitor.prototype.measureFPS = function () {
    var _this = this;
    var frames = 0;
    var lastTime = performance.now();
    var measureFrame = function (currentTime) {
      frames++;
      if (currentTime - lastTime >= 1000) {
        var fps = Math.round((frames * 1000) / (currentTime - lastTime));
        _this.addMetric("rendering", {
          name: "fps",
          value: fps,
          timestamp: Date.now(),
          threshold: 30,
          unit: "fps",
        });
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFrame);
    };
    requestAnimationFrame(measureFrame);
  };
  PerformanceMonitor.prototype.estimateEventListeners = function () {
    // This is an approximation - actual count is hard to get
    var elements = document.querySelectorAll("*");
    var count = 0;
    elements.forEach(function (el) {
      // Check for common event attributes
      var attributes = el.attributes;
      for (var i = 0; i < attributes.length; i++) {
        if (attributes[i].name.startsWith("on")) {
          count++;
        }
      }
    });
    return count;
  };
  PerformanceMonitor.prototype.addMetric = function (category, metric) {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, []);
    }
    var categoryMetrics = this.metrics.get(category);
    categoryMetrics.push(metric);
    // Keep only last 100 metrics per category
    if (categoryMetrics.length > 100) {
      categoryMetrics.shift();
    }
  };
  PerformanceMonitor.prototype.trackComponent = function (componentName, renderTime) {
    var existing = this.components.get(componentName);
    if (existing) {
      existing.renderCount++;
      existing.lastRender = Date.now();
      existing.averageRenderTime =
        (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) /
        existing.renderCount;
    } else {
      this.components.set(componentName, {
        componentName: componentName,
        renderTime: renderTime,
        renderCount: 1,
        lastRender: Date.now(),
        averageRenderTime: renderTime,
      });
    }
  };
  PerformanceMonitor.prototype.analyzePerformance = function () {
    var _this = this;
    this.alerts = []; // Clear previous alerts
    // Check all metrics against thresholds
    this.metrics.forEach(function (categoryMetrics, category) {
      categoryMetrics.forEach(function (metric) {
        if (metric.threshold && metric.value > metric.threshold) {
          _this.addAlert({
            type: metric.value > metric.threshold * 1.5 ? "critical" : "warning",
            metric: metric.name,
            message: ""
              .concat(metric.name, " is ")
              .concat(metric.value)
              .concat(metric.unit || "", " (threshold: ")
              .concat(metric.threshold)
              .concat(metric.unit || "", ")"),
            suggestion: _this.getSuggestion(metric.name, metric.value, metric.threshold),
          });
        }
      });
    });
    // Check component performance
    this.components.forEach(function (comp) {
      if (comp.averageRenderTime > 16) {
        // 60fps = 16ms per frame
        _this.addAlert({
          type: comp.averageRenderTime > 50 ? "critical" : "warning",
          metric: "component-render-time",
          message: "Component "
            .concat(comp.componentName, " average render time: ")
            .concat(comp.averageRenderTime.toFixed(2), "ms"),
          suggestion: "Consider memoization, virtualization, or code splitting for this component",
        });
      }
    });
  };
  PerformanceMonitor.prototype.getSuggestion = function (metricName, value, threshold) {
    var suggestions = {
      "heap-used":
        "Consider implementing memory cleanup, removing unused variables, or using WeakMap/WeakSet",
      "node-count":
        "Reduce DOM complexity, implement virtualization for large lists, or use fragments",
      "listener-count":
        "Remove unused event listeners, use event delegation, or implement cleanup in useEffect",
      fps: "Optimize animations, reduce DOM manipulations, or use CSS transforms instead of JS",
      "page-load-time": "Implement code splitting, optimize images, or use lazy loading",
    };
    return suggestions[metricName] || "Monitor this metric and consider optimization strategies";
  };
  PerformanceMonitor.prototype.addAlert = function (alert) {
    this.alerts.push(
      __assign(__assign({}, alert), {
        id: "alert-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
        timestamp: Date.now(),
      }),
    );
  };
  PerformanceMonitor.prototype.getReport = function () {
    var score = this.calculateOverallScore();
    var grade = this.getGrade(score);
    return {
      overall: { score: score, grade: grade },
      metrics: this.getAllMetrics(),
      alerts: __spreadArray([], this.alerts, true),
      components: Array.from(this.components.values()),
      recommendations: this.getRecommendations(),
    };
  };
  PerformanceMonitor.prototype.calculateOverallScore = function () {
    var score = 100;
    // Deduct points for alerts
    this.alerts.forEach(function (alert) {
      score -= alert.type === "critical" ? 15 : 5;
    });
    // Deduct points for slow components
    this.components.forEach(function (comp) {
      if (comp.averageRenderTime > 16) {
        score -= Math.min(10, comp.averageRenderTime / 5);
      }
    });
    return Math.max(0, Math.min(100, score));
  };
  PerformanceMonitor.prototype.getGrade = function (score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };
  PerformanceMonitor.prototype.getAllMetrics = function () {
    var allMetrics = [];
    this.metrics.forEach(function (categoryMetrics) {
      allMetrics.push.apply(allMetrics, categoryMetrics.slice(-10)); // Last 10 of each category
    });
    return allMetrics.sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });
  };
  PerformanceMonitor.prototype.getRecommendations = function () {
    var recommendations = [];
    if (
      this.alerts.some(function (a) {
        return a.metric === "heap-used";
      })
    ) {
      recommendations.push("Implement memory management best practices");
    }
    if (
      this.alerts.some(function (a) {
        return a.metric === "fps";
      })
    ) {
      recommendations.push("Optimize rendering performance and animations");
    }
    if (this.components.size > 20) {
      recommendations.push("Consider component lazy loading and code splitting");
    }
    if (
      this.alerts.some(function (a) {
        return a.metric === "node-count";
      })
    ) {
      recommendations.push("Implement virtual scrolling for large lists");
    }
    return recommendations;
  };
  PerformanceMonitor.prototype.subscribe = function (callback) {
    var _this = this;
    this.observers.push(callback);
    return function () {
      var index = _this.observers.indexOf(callback);
      if (index > -1) {
        _this.observers.splice(index, 1);
      }
    };
  };
  PerformanceMonitor.prototype.notifyObservers = function () {
    var report = this.getReport();
    this.observers.forEach(function (callback) {
      return callback(report);
    });
  };
  return PerformanceMonitor;
})();
// =====================================================================================
// SINGLETON INSTANCE
// =====================================================================================
var performanceMonitor = new PerformanceMonitor();
// =====================================================================================
// REACT HOOKS
// =====================================================================================
function usePerformanceMonitor() {
  var _a = (0, react_1.useState)(null),
    report = _a[0],
    setReport = _a[1];
  var _b = (0, react_1.useState)(false),
    isMonitoring = _b[0],
    setIsMonitoring = _b[1];
  (0, react_1.useEffect)(function () {
    var unsubscribe = performanceMonitor.subscribe(setReport);
    return unsubscribe;
  }, []);
  var startMonitoring = (0, react_1.useCallback)(function () {
    performanceMonitor.startMonitoring();
    setIsMonitoring(true);
  }, []);
  var stopMonitoring = (0, react_1.useCallback)(function () {
    performanceMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, []);
  var getReport = (0, react_1.useCallback)(function () {
    return performanceMonitor.getReport();
  }, []);
  return {
    report: report,
    isMonitoring: isMonitoring,
    startMonitoring: startMonitoring,
    stopMonitoring: stopMonitoring,
    getReport: getReport,
  };
}
function useComponentPerformance(componentName) {
  var renderStartRef = (0, react_1.useRef)();
  var renderCountRef = (0, react_1.useRef)(0);
  var startRender = (0, react_1.useCallback)(function () {
    renderStartRef.current = performance.now();
  }, []);
  var endRender = (0, react_1.useCallback)(
    function () {
      if (renderStartRef.current) {
        var renderTime = performance.now() - renderStartRef.current;
        renderCountRef.current++;
        performanceMonitor.trackComponent(componentName, renderTime);
      }
    },
    [componentName],
  );
  (0, react_1.useEffect)(function () {
    startRender();
    return function () {
      endRender();
    };
  });
  return {
    startRender: startRender,
    endRender: endRender,
    renderCount: renderCountRef.current,
  };
}
function usePerformanceMetric(name, category) {
  var _this = this;
  if (category === void 0) {
    category = "custom";
  }
  var addMetric = (0, react_1.useCallback)(
    function (value, threshold, unit) {
      performanceMonitor.addMetric(category, {
        name: name,
        value: value,
        timestamp: Date.now(),
        threshold: threshold,
        unit: unit,
      });
    },
    [name, category],
  );
  var measureAsync = (0, react_1.useCallback)(
    function (fn) {
      return __awaiter(_this, void 0, void 0, function () {
        var start, result, duration, error_1, duration;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              start = performance.now();
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, fn()];
            case 2:
              result = _a.sent();
              duration = performance.now() - start;
              addMetric(duration, undefined, "ms");
              return [2 /*return*/, result];
            case 3:
              error_1 = _a.sent();
              duration = performance.now() - start;
              addMetric(duration, undefined, "ms");
              throw error_1;
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [addMetric],
  );
  var measureSync = (0, react_1.useCallback)(
    function (fn) {
      var start = performance.now();
      try {
        var result = fn();
        var duration = performance.now() - start;
        addMetric(duration, undefined, "ms");
        return result;
      } catch (error) {
        var duration = performance.now() - start;
        addMetric(duration, undefined, "ms");
        throw error;
      }
    },
    [addMetric],
  );
  return {
    addMetric: addMetric,
    measureAsync: measureAsync,
    measureSync: measureSync,
  };
}
// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================
function measurePerformance(name, fn) {
  var start = performance.now();
  var result = fn();
  var duration = performance.now() - start;
  performanceMonitor.addMetric("custom", {
    name: name,
    value: duration,
    timestamp: Date.now(),
    unit: "ms",
  });
  return result;
}
function measureAsyncPerformance(name, fn) {
  return __awaiter(this, void 0, void 0, function () {
    var start, result, duration, error_2, duration;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          start = performance.now();
          _a.label = 1;
        case 1:
          _a.trys.push([1, 3, , 4]);
          return [4 /*yield*/, fn()];
        case 2:
          result = _a.sent();
          duration = performance.now() - start;
          performanceMonitor.addMetric("custom", {
            name: name,
            value: duration,
            timestamp: Date.now(),
            unit: "ms",
          });
          return [2 /*return*/, result];
        case 3:
          error_2 = _a.sent();
          duration = performance.now() - start;
          performanceMonitor.addMetric("custom", {
            name: "".concat(name, "-error"),
            value: duration,
            timestamp: Date.now(),
            unit: "ms",
          });
          throw error_2;
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
exports.default = performanceMonitor;
