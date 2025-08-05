'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalMemoryMonitor = exports.MemoryMonitor = void 0;
exports.useMemoryMonitor = useMemoryMonitor;
exports.useMemoryAlert = useMemoryAlert;
exports.formatBytes = formatBytes;
exports.createMemoryProfiler = createMemoryProfiler;
var react_1 = require("react");
// =====================================================================================
// MEMORY MONITOR CLASS
// =====================================================================================
var MemoryMonitor = /** @class */ (function () {
    function MemoryMonitor(config) {
        if (config === void 0) { config = {}; }
        this.intervalId = null;
        this.isMonitoring = false;
        this.componentRegistry = new Map();
        this.listenerRegistry = new WeakMap();
        this.cleanupTasks = new Set();
        this.config = __assign({ samplingInterval: 5000, alertThreshold: 80, leakDetectionWindow: 60000, maxSnapshots: 100, enableAutoCleanup: true, enableDetailedTracking: true }, config);
        this.snapshots = [];
        this.alerts = [];
        this.observers = new Set();
        this.alertObservers = new Set();
        this.setupMemoryTracking();
    }
    MemoryMonitor.prototype.setupMemoryTracking = function () {
        var _this = this;
        if (typeof window === 'undefined')
            return;
        // Track component mounts/unmounts
        if (this.config.enableDetailedTracking) {
            this.setupComponentTracking();
            this.setupEventListenerTracking();
            this.setupDOMNodeTracking();
        }
        // Setup cleanup on page unload
        window.addEventListener('beforeunload', function () {
            _this.cleanup();
        });
    };
    MemoryMonitor.prototype.setupComponentTracking = function () {
        var _this = this;
        // Monkey patch React DevTools if available
        if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            var hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            var originalOnCommitFiberRoot_1 = hook.onCommitFiberRoot;
            hook.onCommitFiberRoot = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.trackComponentMount();
                return originalOnCommitFiberRoot_1 === null || originalOnCommitFiberRoot_1 === void 0 ? void 0 : originalOnCommitFiberRoot_1.apply(void 0, args);
            };
        }
    };
    MemoryMonitor.prototype.setupEventListenerTracking = function () {
        var originalAddEventListener = EventTarget.prototype.addEventListener;
        var originalRemoveEventListener = EventTarget.prototype.removeEventListener;
        EventTarget.prototype.addEventListener = function (type, listener, options) {
            if (!this.listenerRegistry.has(this)) {
                this.listenerRegistry.set(this, new Set());
            }
            this.listenerRegistry.get(this).add(type);
            return originalAddEventListener.call(this, type, listener, options);
        }.bind(this);
        EventTarget.prototype.removeEventListener = function (type, listener, options) {
            var listeners = this.listenerRegistry.get(this);
            if (listeners) {
                listeners.delete(type);
                if (listeners.size === 0) {
                    this.listenerRegistry.delete(this);
                }
            }
            return originalRemoveEventListener.call(this, type, listener, options);
        }.bind(this);
    };
    MemoryMonitor.prototype.setupDOMNodeTracking = function () {
        var _this = this;
        // Track DOM mutations
        if ('MutationObserver' in window) {
            var observer_1 = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === 'childList') {
                        // Track added/removed nodes
                        _this.trackDOMChanges(mutation.addedNodes.length, mutation.removedNodes.length);
                    }
                });
            });
            observer_1.observe(document.body, {
                childList: true,
                subtree: true
            });
            this.cleanupTasks.add(function () { return observer_1.disconnect(); });
        }
    };
    MemoryMonitor.prototype.trackComponentMount = function () {
        var count = this.componentRegistry.get('total') || 0;
        this.componentRegistry.set('total', count + 1);
    };
    MemoryMonitor.prototype.trackDOMChanges = function (added, removed) {
        var current = this.componentRegistry.get('domNodes') || 0;
        this.componentRegistry.set('domNodes', current + added - removed);
    };
    MemoryMonitor.prototype.getCurrentMemoryMetrics = function () {
        if (typeof window === 'undefined' || !performance.memory) {
            return null;
        }
        var memory = performance.memory;
        var usedJSHeapSize = memory.usedJSHeapSize;
        var totalJSHeapSize = memory.totalJSHeapSize;
        var jsHeapSizeLimit = memory.jsHeapSizeLimit;
        var memoryUsagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
        var trend = this.calculateTrend(usedJSHeapSize);
        var leakSuspected = this.detectMemoryLeak(usedJSHeapSize);
        return {
            usedJSHeapSize: usedJSHeapSize,
            totalJSHeapSize: totalJSHeapSize,
            jsHeapSizeLimit: jsHeapSizeLimit,
            memoryUsagePercent: memoryUsagePercent,
            trend: trend,
            leakSuspected: leakSuspected,
            timestamp: Date.now()
        };
    };
    MemoryMonitor.prototype.calculateTrend = function (currentUsage) {
        if (this.snapshots.length < 3)
            return 'stable';
        var recent = this.snapshots.slice(-3).map(function (s) { return s.metrics.usedJSHeapSize; });
        var avgRecent = recent.reduce(function (sum, val) { return sum + val; }, 0) / recent.length;
        var threshold = currentUsage * 0.05; // 5% threshold
        if (currentUsage > avgRecent + threshold)
            return 'increasing';
        if (currentUsage < avgRecent - threshold)
            return 'decreasing';
        return 'stable';
    };
    MemoryMonitor.prototype.detectMemoryLeak = function (currentUsage) {
        if (this.snapshots.length < 5)
            return false;
        var windowStart = Date.now() - this.config.leakDetectionWindow;
        var recentSnapshots = this.snapshots.filter(function (s) { return s.timestamp > windowStart; });
        if (recentSnapshots.length < 3)
            return false;
        // Check for consistent memory growth
        var usages = recentSnapshots.map(function (s) { return s.metrics.usedJSHeapSize; });
        var growthRate = (usages[usages.length - 1] - usages[0]) / usages[0];
        // Leak suspected if memory grew by more than 50% in the detection window
        return growthRate > 0.5;
    };
    MemoryMonitor.prototype.createSnapshot = function (context) {
        if (context === void 0) { context = 'automatic'; }
        var metrics = this.getCurrentMemoryMetrics();
        if (!metrics)
            return null;
        var snapshot = {
            timestamp: Date.now(),
            metrics: metrics,
            activeComponents: this.componentRegistry.get('total') || 0,
            eventListeners: this.getTotalEventListeners(),
            domNodes: document.querySelectorAll('*').length,
            context: context
        };
        this.snapshots.push(snapshot);
        // Limit snapshots to prevent memory issues
        if (this.snapshots.length > this.config.maxSnapshots) {
            this.snapshots.shift();
        }
        return snapshot;
    };
    MemoryMonitor.prototype.getTotalEventListeners = function () {
        var total = 0;
        // This is an approximation since we can't accurately count all listeners
        return total;
    };
    MemoryMonitor.prototype.checkForAlerts = function (metrics) {
        var _this = this;
        var alerts = [];
        // High memory usage alert
        if (metrics.memoryUsagePercent > this.config.alertThreshold) {
            alerts.push({
                id: "high-memory-".concat(Date.now()),
                type: metrics.memoryUsagePercent > 95 ? 'critical' : 'warning',
                message: "High memory usage: ".concat(metrics.memoryUsagePercent.toFixed(1), "%"),
                timestamp: Date.now(),
                metrics: metrics,
                suggestions: [
                    'Consider implementing component cleanup',
                    'Check for memory leaks in event listeners',
                    'Optimize large data structures',
                    'Implement virtual scrolling for large lists'
                ]
            });
        }
        // Memory leak alert
        if (metrics.leakSuspected) {
            alerts.push({
                id: "memory-leak-".concat(Date.now()),
                type: 'leak',
                message: 'Potential memory leak detected',
                timestamp: Date.now(),
                metrics: metrics,
                suggestions: [
                    'Check for uncleaned event listeners',
                    'Verify component cleanup in useEffect',
                    'Look for circular references',
                    'Check for retained DOM references'
                ]
            });
        }
        // Rapid growth alert
        if (metrics.trend === 'increasing' && this.snapshots.length > 1) {
            var lastSnapshot = this.snapshots[this.snapshots.length - 1];
            var growthRate = (metrics.usedJSHeapSize - lastSnapshot.metrics.usedJSHeapSize) / lastSnapshot.metrics.usedJSHeapSize;
            if (growthRate > 0.1) { // 10% growth
                alerts.push({
                    id: "rapid-growth-".concat(Date.now()),
                    type: 'warning',
                    message: "Rapid memory growth detected: ".concat((growthRate * 100).toFixed(1), "%"),
                    timestamp: Date.now(),
                    metrics: metrics,
                    suggestions: [
                        'Check recent component changes',
                        'Look for new data loading patterns',
                        'Verify cleanup in recent code changes'
                    ]
                });
            }
        }
        alerts.forEach(function (alert) {
            _this.alerts.push(alert);
            _this.alertObservers.forEach(function (observer) { return observer(alert); });
        });
        // Limit alerts to prevent memory issues
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(-25);
        }
    };
    // =====================================================================================
    // PUBLIC API
    // =====================================================================================
    MemoryMonitor.prototype.startMonitoring = function () {
        var _this = this;
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        this.intervalId = window.setInterval(function () {
            var snapshot = _this.createSnapshot();
            if (snapshot) {
                _this.checkForAlerts(snapshot.metrics);
                _this.observers.forEach(function (observer) { return observer(snapshot.metrics); });
                if (_this.config.enableAutoCleanup) {
                    _this.performAutoCleanup(snapshot.metrics);
                }
            }
        }, this.config.samplingInterval);
    };
    MemoryMonitor.prototype.stopMonitoring = function () {
        if (!this.isMonitoring)
            return;
        this.isMonitoring = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    };
    MemoryMonitor.prototype.takeSnapshot = function (context) {
        return this.createSnapshot(context);
    };
    MemoryMonitor.prototype.getSnapshots = function () {
        return __spreadArray([], this.snapshots, true);
    };
    MemoryMonitor.prototype.getAlerts = function () {
        return __spreadArray([], this.alerts, true);
    };
    MemoryMonitor.prototype.getCurrentMetrics = function () {
        return this.getCurrentMemoryMetrics();
    };
    MemoryMonitor.prototype.subscribe = function (observer) {
        var _this = this;
        this.observers.add(observer);
        return function () { return _this.observers.delete(observer); };
    };
    MemoryMonitor.prototype.subscribeToAlerts = function (observer) {
        var _this = this;
        this.alertObservers.add(observer);
        return function () { return _this.alertObservers.delete(observer); };
    };
    MemoryMonitor.prototype.forceGarbageCollection = function () {
        if (window.gc) {
            window.gc();
        }
        else {
            console.warn('Garbage collection not available. Run Chrome with --js-flags="--expose-gc"');
        }
    };
    MemoryMonitor.prototype.generateReport = function () {
        var currentMetrics = this.getCurrentMemoryMetrics();
        var recentSnapshots = this.snapshots.slice(-10);
        var recentAlerts = this.alerts.slice(-5);
        return {
            timestamp: Date.now(),
            current: currentMetrics,
            history: recentSnapshots,
            alerts: recentAlerts,
            analysis: this.analyzeMemoryPatterns(),
            recommendations: this.generateRecommendations()
        };
    };
    MemoryMonitor.prototype.performAutoCleanup = function (metrics) {
        if (metrics.memoryUsagePercent > 90) {
            // Trigger cleanup for high memory usage
            this.cleanupUnusedReferences();
            // Force garbage collection if available
            this.forceGarbageCollection();
        }
    };
    MemoryMonitor.prototype.cleanupUnusedReferences = function () {
        // Clear old snapshots more aggressively
        if (this.snapshots.length > this.config.maxSnapshots / 2) {
            this.snapshots = this.snapshots.slice(-Math.floor(this.config.maxSnapshots / 2));
        }
        // Clear old alerts
        if (this.alerts.length > 25) {
            this.alerts = this.alerts.slice(-10);
        }
    };
    MemoryMonitor.prototype.analyzeMemoryPatterns = function () {
        if (this.snapshots.length < 3) {
            return {
                trend: 'insufficient_data',
                averageUsage: 0,
                peakUsage: 0,
                growthRate: 0,
                stability: 'unknown'
            };
        }
        var usages = this.snapshots.map(function (s) { return s.metrics.usedJSHeapSize; });
        var averageUsage = usages.reduce(function (sum, val) { return sum + val; }, 0) / usages.length;
        var peakUsage = Math.max.apply(Math, usages);
        var growthRate = (usages[usages.length - 1] - usages[0]) / usages[0];
        // Calculate stability (coefficient of variation)
        var variance = usages.reduce(function (sum, val) { return sum + Math.pow(val - averageUsage, 2); }, 0) / usages.length;
        var standardDeviation = Math.sqrt(variance);
        var coefficientOfVariation = standardDeviation / averageUsage;
        var stability;
        if (coefficientOfVariation < 0.1)
            stability = 'stable';
        else if (coefficientOfVariation < 0.3)
            stability = 'moderate';
        else
            stability = 'unstable';
        return {
            trend: growthRate > 0.1 ? 'increasing' : growthRate < -0.1 ? 'decreasing' : 'stable',
            averageUsage: averageUsage,
            peakUsage: peakUsage,
            growthRate: growthRate,
            stability: stability
        };
    };
    MemoryMonitor.prototype.generateRecommendations = function () {
        var recommendations = [];
        var analysis = this.analyzeMemoryPatterns();
        var currentMetrics = this.getCurrentMemoryMetrics();
        if (!currentMetrics)
            return recommendations;
        if (currentMetrics.memoryUsagePercent > 80) {
            recommendations.push('Memory usage is high. Consider implementing cleanup strategies.');
        }
        if (analysis.trend === 'increasing') {
            recommendations.push('Memory usage is consistently increasing. Check for memory leaks.');
        }
        if (analysis.stability === 'unstable') {
            recommendations.push('Memory usage is unstable. Review component lifecycle management.');
        }
        if (currentMetrics.leakSuspected) {
            recommendations.push('Potential memory leak detected. Review event listeners and component cleanup.');
        }
        if (this.alerts.filter(function (a) { return a.type === 'critical'; }).length > 0) {
            recommendations.push('Critical memory alerts detected. Immediate action required.');
        }
        return recommendations;
    };
    MemoryMonitor.prototype.cleanup = function () {
        this.stopMonitoring();
        this.cleanupTasks.forEach(function (task) { return task(); });
        this.cleanupTasks.clear();
        this.observers.clear();
        this.alertObservers.clear();
        this.snapshots.length = 0;
        this.alerts.length = 0;
    };
    return MemoryMonitor;
}());
exports.MemoryMonitor = MemoryMonitor;
// =====================================================================================
// REACT HOOKS
// =====================================================================================
function useMemoryMonitor(config) {
    var monitor = (0, react_1.useState)(function () { return new MemoryMonitor(config); })[0];
    var _a = (0, react_1.useState)(null), metrics = _a[0], setMetrics = _a[1];
    var _b = (0, react_1.useState)([]), alerts = _b[0], setAlerts = _b[1];
    var _c = (0, react_1.useState)(false), isMonitoring = _c[0], setIsMonitoring = _c[1];
    (0, react_1.useEffect)(function () {
        var unsubscribeMetrics = monitor.subscribe(setMetrics);
        var unsubscribeAlerts = monitor.subscribeToAlerts(function (alert) {
            setAlerts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [alert], false).slice(-10); }); // Keep last 10 alerts
        });
        return function () {
            unsubscribeMetrics();
            unsubscribeAlerts();
            monitor.cleanup();
        };
    }, [monitor]);
    var startMonitoring = (0, react_1.useCallback)(function () {
        monitor.startMonitoring();
        setIsMonitoring(true);
    }, [monitor]);
    var stopMonitoring = (0, react_1.useCallback)(function () {
        monitor.stopMonitoring();
        setIsMonitoring(false);
    }, [monitor]);
    var takeSnapshot = (0, react_1.useCallback)(function (context) {
        return monitor.takeSnapshot(context);
    }, [monitor]);
    var generateReport = (0, react_1.useCallback)(function () {
        return monitor.generateReport();
    }, [monitor]);
    var forceGC = (0, react_1.useCallback)(function () {
        monitor.forceGarbageCollection();
    }, [monitor]);
    return {
        metrics: metrics,
        alerts: alerts,
        isMonitoring: isMonitoring,
        startMonitoring: startMonitoring,
        stopMonitoring: stopMonitoring,
        takeSnapshot: takeSnapshot,
        generateReport: generateReport,
        forceGC: forceGC,
        snapshots: monitor.getSnapshots()
    };
}
function useMemoryAlert(threshold) {
    if (threshold === void 0) { threshold = 80; }
    var _a = (0, react_1.useState)(null), alert = _a[0], setAlert = _a[1];
    var monitor = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        monitor.current = new MemoryMonitor({ alertThreshold: threshold });
        var unsubscribe = monitor.current.subscribeToAlerts(setAlert);
        monitor.current.startMonitoring();
        return function () {
            var _a;
            unsubscribe();
            (_a = monitor.current) === null || _a === void 0 ? void 0 : _a.cleanup();
        };
    }, [threshold]);
    return alert;
}
// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return "".concat(parseFloat((bytes / Math.pow(k, i)).toFixed(1)), " ").concat(sizes[i]);
}
function createMemoryProfiler() {
    var profiles = [];
    return {
        start: function (name) {
            var memory = performance.memory;
            profiles.push({
                name: name,
                start: performance.now(),
                memory: memory ? __assign({}, memory) : null
            });
        },
        end: function (name) {
            var profile = profiles.find(function (p) { return p.name === name && !p.end; });
            if (profile) {
                profile.end = performance.now();
                var currentMemory = performance.memory;
                if (profile.memory && currentMemory) {
                    var memoryDelta = currentMemory.usedJSHeapSize - profile.memory.usedJSHeapSize;
                    console.log("Memory Profile [".concat(name, "]:"), {
                        duration: "".concat((profile.end - profile.start).toFixed(2), "ms"),
                        memoryDelta: formatBytes(memoryDelta),
                        finalMemory: formatBytes(currentMemory.usedJSHeapSize)
                    });
                }
            }
        },
        getProfiles: function () { return __spreadArray([], profiles, true); }
    };
}
// Global instance
exports.globalMemoryMonitor = new MemoryMonitor();
exports.default = MemoryMonitor;
