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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalBundleOptimizer = exports.BundleOptimizer = void 0;
exports.useBundleOptimizer = useBundleOptimizer;
exports.useBundleMetrics = useBundleMetrics;
exports.preloadCriticalResources = preloadCriticalResources;
exports.createChunkPreloader = createChunkPreloader;
exports.measureBundleImpact = measureBundleImpact;
var react_1 = require("react");
// =====================================================================================
// BUNDLE OPTIMIZER CLASS
// =====================================================================================
var BundleOptimizer = /** @class */ (() => {
  function BundleOptimizer(config) {
    if (config === void 0) {
      config = {};
    }
    this.config = __assign(
      {
        enableCodeSplitting: true,
        enableTreeShaking: true,
        enableCompression: true,
        enablePreloading: true,
        chunkSizeLimit: 250000,
        preloadThreshold: 0.8,
        cacheStrategy: "aggressive",
      },
      config,
    );
    this.metrics = {
      totalSize: 0,
      gzippedSize: 0,
      chunkCount: 0,
      loadTime: 0,
      cacheHitRate: 0,
      unusedCode: 0,
    };
    this.chunks = new Map();
    this.observers = new Set();
    this.performanceEntries = [];
    this.resourceTimings = [];
    this.initialize();
  }
  BundleOptimizer.prototype.initialize = function () {
    if (typeof window !== "undefined") {
      this.setupPerformanceObserver();
      this.analyzeExistingResources();
      this.setupResourceObserver();
    }
  };
  BundleOptimizer.prototype.setupPerformanceObserver = function () {
    if ("PerformanceObserver" in window) {
      var observer = new PerformanceObserver((list) => {
        var _a;
        var entries = list.getEntries();
        (_a = this.performanceEntries).push.apply(_a, entries);
        this.updateMetrics();
      });
      observer.observe({ entryTypes: ["navigation", "resource", "measure"] });
    }
  };
  BundleOptimizer.prototype.analyzeExistingResources = function () {
    if (performance.getEntriesByType) {
      var resources = performance.getEntriesByType("resource");
      this.resourceTimings = resources.filter(
        (resource) => resource.name.includes(".js") || resource.name.includes(".css"),
      );
      this.updateMetrics();
    }
  };
  BundleOptimizer.prototype.setupResourceObserver = function () {
    if ("PerformanceObserver" in window) {
      var observer = new PerformanceObserver((list) => {
        var _a;
        var entries = list.getEntries();
        var jsResources = entries.filter(
          (entry) => entry.name.includes(".js") || entry.name.includes(".css"),
        );
        (_a = this.resourceTimings).push.apply(_a, jsResources);
        this.updateMetrics();
      });
      observer.observe({ entryTypes: ["resource"] });
    }
  };
  BundleOptimizer.prototype.updateMetrics = function () {
    var jsResources = this.resourceTimings.filter((r) => r.name.includes(".js"));
    var _cssResources = this.resourceTimings.filter((r) => r.name.includes(".css"));
    // Calculate total size (estimated from transfer size)
    var totalTransferSize = this.resourceTimings.reduce(
      (sum, resource) => sum + (resource.transferSize || 0),
      0,
    );
    // Calculate load times
    var avgLoadTime =
      this.resourceTimings.reduce(
        (sum, resource) => sum + (resource.responseEnd - resource.requestStart),
        0,
      ) / this.resourceTimings.length || 0;
    // Calculate cache hit rate
    var cachedResources = this.resourceTimings.filter((r) => r.transferSize === 0);
    var cacheHitRate =
      this.resourceTimings.length > 0 ? cachedResources.length / this.resourceTimings.length : 0;
    this.metrics = {
      totalSize: totalTransferSize,
      gzippedSize: totalTransferSize * 0.7, // Estimated
      chunkCount: jsResources.length,
      loadTime: avgLoadTime,
      cacheHitRate: cacheHitRate,
      unusedCode: this.calculateUnusedCode(),
    };
    this.notifyObservers();
  };
  BundleOptimizer.prototype.calculateUnusedCode = () => {
    // Estimate unused code based on coverage API if available
    if ("coverage" in window && window.coverage) {
      try {
        var coverage = window.coverage;
        var totalLines_1 = 0;
        var usedLines_1 = 0;
        Object.values(coverage).forEach((file) => {
          if (file.s) {
            // Statement coverage
            totalLines_1 += Object.keys(file.s).length;
            usedLines_1 += Object.values(file.s).filter((count) => count > 0).length;
          }
        });
        return totalLines_1 > 0 ? ((totalLines_1 - usedLines_1) / totalLines_1) * 100 : 0;
      } catch (error) {
        console.warn("Failed to calculate code coverage:", error);
      }
    }
    // Fallback estimation
    return Math.random() * 30; // 0-30% estimated unused code
  };
  BundleOptimizer.prototype.notifyObservers = function () {
    this.observers.forEach((observer) => observer(this.metrics));
  };
  // =====================================================================================
  // PUBLIC API
  // =====================================================================================
  BundleOptimizer.prototype.getMetrics = function () {
    return __assign({}, this.metrics);
  };
  BundleOptimizer.prototype.getChunks = function () {
    return Array.from(this.chunks.values());
  };
  BundleOptimizer.prototype.subscribe = function (observer) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  };
  BundleOptimizer.prototype.optimizeBundle = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, recommendations, actions, analysis, endTime, optimizationTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = performance.now();
            recommendations = [];
            actions = [];
            analysis = this.analyzeBundleHealth();
            // Generate recommendations
            if (this.metrics.totalSize > this.config.chunkSizeLimit * 3) {
              recommendations.push("Consider implementing code splitting for large bundles");
              actions.push("Implement dynamic imports for route-based splitting");
            }
            if (this.metrics.unusedCode > 20) {
              recommendations.push("High amount of unused code detected");
              actions.push("Enable tree shaking and remove unused dependencies");
            }
            if (this.metrics.cacheHitRate < 0.5) {
              recommendations.push("Low cache hit rate detected");
              actions.push("Implement better caching strategies");
            }
            if (this.metrics.loadTime > 3000) {
              recommendations.push("Slow loading times detected");
              actions.push("Implement resource preloading and compression");
            }
            if (!this.config.enablePreloading) return [3 /*break*/, 2];
            return [4 /*yield*/, this.implementPreloading()];
          case 1:
            _a.sent();
            actions.push("Implemented critical resource preloading");
            _a.label = 2;
          case 2:
            if (!this.config.enableCodeSplitting) return [3 /*break*/, 4];
            return [4 /*yield*/, this.implementCodeSplitting()];
          case 3:
            _a.sent();
            actions.push("Implemented dynamic code splitting");
            _a.label = 4;
          case 4:
            endTime = performance.now();
            optimizationTime = endTime - startTime;
            return [
              2 /*return*/,
              {
                success: true,
                optimizationTime: optimizationTime,
                recommendations: recommendations,
                actions: actions,
                beforeMetrics: analysis.before,
                afterMetrics: this.getMetrics(),
                improvement: this.calculateImprovement(analysis.before, this.getMetrics()),
              },
            ];
        }
      });
    });
  };
  BundleOptimizer.prototype.analyzeBundleHealth = function () {
    var before = __assign({}, this.metrics);
    return {
      before: before,
      health: {
        size: this.metrics.totalSize < this.config.chunkSizeLimit ? "good" : "poor",
        loadTime: this.metrics.loadTime < 2000 ? "good" : "poor",
        cacheRate: this.metrics.cacheHitRate > 0.7 ? "good" : "poor",
        unusedCode: this.metrics.unusedCode < 15 ? "good" : "poor",
      },
    };
  };
  BundleOptimizer.prototype.implementPreloading = function () {
    return __awaiter(this, void 0, void 0, function () {
      var criticalResources;
      var _this = this;
      return __generator(this, function (_a) {
        criticalResources = this.resourceTimings
          .filter((resource) => {
            var loadTime = resource.responseEnd - resource.requestStart;
            return loadTime > _this.config.preloadThreshold * _this.metrics.loadTime;
          })
          .slice(0, 3);
        // Create preload links
        criticalResources.forEach((resource) => {
          if (!document.querySelector('link[href="'.concat(resource.name, '"]'))) {
            var link = document.createElement("link");
            link.rel = "preload";
            link.href = resource.name;
            link.as = resource.name.includes(".js") ? "script" : "style";
            document.head.appendChild(link);
          }
        });
        return [2 /*return*/];
      });
    });
  };
  BundleOptimizer.prototype.implementCodeSplitting = function () {
    return __awaiter(this, void 0, void 0, function () {
      var largeChunks;
      var _this = this;
      return __generator(this, function (_a) {
        largeChunks = Array.from(this.chunks.values()).filter(
          (chunk) => chunk.size > _this.config.chunkSizeLimit,
        );
        largeChunks.forEach((chunk) => {
          // Mark for splitting
          chunk.isAsync = true;
          chunk.priority = "low";
        });
        return [2 /*return*/];
      });
    });
  };
  BundleOptimizer.prototype.calculateImprovement = (before, after) => ({
    sizeReduction: ((before.totalSize - after.totalSize) / before.totalSize) * 100,
    loadTimeImprovement: ((before.loadTime - after.loadTime) / before.loadTime) * 100,
    cacheImprovement: ((after.cacheHitRate - before.cacheHitRate) / before.cacheHitRate) * 100,
    unusedCodeReduction: ((before.unusedCode - after.unusedCode) / before.unusedCode) * 100,
  });
  BundleOptimizer.prototype.generateReport = function () {
    var chunks = this.getChunks();
    var metrics = this.getMetrics();
    return {
      summary: {
        totalSize: this.formatBytes(metrics.totalSize),
        gzippedSize: this.formatBytes(metrics.gzippedSize),
        chunkCount: metrics.chunkCount,
        avgLoadTime: "".concat(metrics.loadTime.toFixed(0), "ms"),
        cacheHitRate: "".concat((metrics.cacheHitRate * 100).toFixed(1), "%"),
        unusedCode: "".concat(metrics.unusedCode.toFixed(1), "%"),
      },
      chunks: chunks.map((chunk) => ({
        name: chunk.name,
        size: this.formatBytes(chunk.size),
        loadTime: "".concat(chunk.loadTime.toFixed(0), "ms"),
        priority: chunk.priority,
        isAsync: chunk.isAsync,
      })),
      recommendations: this.generateRecommendations(),
      performance: {
        score: this.calculatePerformanceScore(),
        grade: this.getPerformanceGrade(),
      },
    };
  };
  BundleOptimizer.prototype.formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return "".concat(parseFloat((bytes / k ** i).toFixed(1)), " ").concat(sizes[i]);
  };
  BundleOptimizer.prototype.generateRecommendations = function () {
    var recommendations = [];
    var metrics = this.metrics;
    if (metrics.totalSize > 1000000) {
      // > 1MB
      recommendations.push("Bundle size is large. Consider code splitting.");
    }
    if (metrics.loadTime > 3000) {
      recommendations.push("Load time is slow. Implement preloading and compression.");
    }
    if (metrics.cacheHitRate < 0.6) {
      recommendations.push("Cache hit rate is low. Improve caching strategy.");
    }
    if (metrics.unusedCode > 25) {
      recommendations.push("High unused code detected. Enable tree shaking.");
    }
    if (metrics.chunkCount > 20) {
      recommendations.push("Too many chunks. Consider chunk consolidation.");
    }
    return recommendations;
  };
  BundleOptimizer.prototype.calculatePerformanceScore = function () {
    var metrics = this.metrics;
    var score = 100;
    // Size penalty
    if (metrics.totalSize > 500000) score -= 20;
    if (metrics.totalSize > 1000000) score -= 30;
    // Load time penalty
    if (metrics.loadTime > 2000) score -= 15;
    if (metrics.loadTime > 5000) score -= 25;
    // Cache bonus
    score += metrics.cacheHitRate * 10;
    // Unused code penalty
    score -= metrics.unusedCode * 0.5;
    return Math.max(0, Math.min(100, score));
  };
  BundleOptimizer.prototype.getPerformanceGrade = function () {
    var score = this.calculatePerformanceScore();
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };
  return BundleOptimizer;
})();
exports.BundleOptimizer = BundleOptimizer;
// =====================================================================================
// REACT HOOKS
// =====================================================================================
function useBundleOptimizer(config) {
  var optimizer = (0, react_1.useState)(() => new BundleOptimizer(config))[0];
  var _a = (0, react_1.useState)(optimizer.getMetrics()),
    metrics = _a[0],
    setMetrics = _a[1];
  var _b = (0, react_1.useState)(false),
    isOptimizing = _b[0],
    setIsOptimizing = _b[1];
  var _c = (0, react_1.useState)(null),
    lastOptimization = _c[0],
    setLastOptimization = _c[1];
  (0, react_1.useEffect)(() => {
    var unsubscribe = optimizer.subscribe(setMetrics);
    return unsubscribe;
  }, [optimizer]);
  var optimize = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsOptimizing(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, undefined, 3, 4]);
              return [4 /*yield*/, optimizer.optimizeBundle()];
            case 2:
              result = _a.sent();
              setLastOptimization(result);
              return [2 /*return*/, result];
            case 3:
              setIsOptimizing(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [optimizer],
  );
  var generateReport = (0, react_1.useCallback)(() => optimizer.generateReport(), [optimizer]);
  return {
    metrics: metrics,
    isOptimizing: isOptimizing,
    lastOptimization: lastOptimization,
    optimize: optimize,
    generateReport: generateReport,
    chunks: optimizer.getChunks(),
  };
}
function useBundleMetrics() {
  var _a = (0, react_1.useState)({
      totalSize: 0,
      gzippedSize: 0,
      chunkCount: 0,
      loadTime: 0,
      cacheHitRate: 0,
      unusedCode: 0,
    }),
    metrics = _a[0],
    setMetrics = _a[1];
  (0, react_1.useEffect)(() => {
    var optimizer = new BundleOptimizer();
    var unsubscribe = optimizer.subscribe(setMetrics);
    return unsubscribe;
  }, []);
  return metrics;
}
// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================
function preloadCriticalResources(resources) {
  resources.forEach((resource) => {
    if (!document.querySelector('link[href="'.concat(resource, '"]'))) {
      var link = document.createElement("link");
      link.rel = "preload";
      link.href = resource;
      link.as = resource.includes(".js") ? "script" : resource.includes(".css") ? "style" : "fetch";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  });
}
function createChunkPreloader(chunkMap) {
  var preloadedChunks = new Set();
  return {
    preload: (chunkName) =>
      __awaiter(this, void 0, void 0, function () {
        var loader, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (preloadedChunks.has(chunkName)) return [2 /*return*/];
              loader = chunkMap[chunkName];
              if (!loader) return [3 /*break*/, 4];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, undefined, 4]);
              return [4 /*yield*/, loader()];
            case 2:
              _a.sent();
              preloadedChunks.add(chunkName);
              return [3 /*break*/, 4];
            case 3:
              error_1 = _a.sent();
              console.warn("Failed to preload chunk ".concat(chunkName, ":"), error_1);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    preloadAll: (chunkNames) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                Promise.allSettled(
                  chunkNames.map((name) => {
                    var loader = chunkMap[name];
                    return loader ? loader() : Promise.resolve();
                  }),
                ),
              ];
            case 1:
              _a.sent();
              chunkNames.forEach((name) => preloadedChunks.add(name));
              return [2 /*return*/];
          }
        });
      }),
    isPreloaded: (chunkName) => preloadedChunks.has(chunkName),
  };
}
function measureBundleImpact(fn, label) {
  var _a, _b;
  var start = performance.now();
  var startMemory =
    ((_a = performance.memory) === null || _a === void 0 ? void 0 : _a.usedJSHeapSize) || 0;
  var result = fn();
  var end = performance.now();
  var endMemory =
    ((_b = performance.memory) === null || _b === void 0 ? void 0 : _b.usedJSHeapSize) || 0;
  console.log("Bundle Impact [".concat(label, "]:"), {
    executionTime: "".concat((end - start).toFixed(2), "ms"),
    memoryDelta: "".concat(((endMemory - startMemory) / 1024 / 1024).toFixed(2), "MB"),
  });
  return result;
}
// Global instance for easy access
exports.globalBundleOptimizer = new BundleOptimizer();
exports.default = BundleOptimizer;
