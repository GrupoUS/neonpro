"use strict";
/**
 * Performance Optimization Hooks for React Components
 *
 * Advanced React 19 and Next.js 15 performance optimization utilities
 * Based on 2025 performance best practices
 */
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
exports.useOptimizedCallback = useOptimizedCallback;
exports.useOptimizedMemo = useOptimizedMemo;
exports.useRenderPerformance = useRenderPerformance;
exports.useDebouncedState = useDebouncedState;
exports.useVirtualScrolling = useVirtualScrolling;
exports.useIntersectionObserver = useIntersectionObserver;
exports.useMemoryMonitor = useMemoryMonitor;
exports.useOptimizedChartData = useOptimizedChartData;
exports.usePreloadResources = usePreloadResources;
exports.usePerformanceProfiler = usePerformanceProfiler;
var react_1 = require("react");
// Performance thresholds for monitoring
var PERFORMANCE_THRESHOLDS = {
    RENDER_TIME_WARNING: 16, // 60fps = 16.67ms per frame
    RENDER_TIME_ERROR: 33, // 30fps = 33.33ms per frame
    MEMORY_USAGE_WARNING: 50 * 1024 * 1024, // 50MB
    INTERACTION_TIME_WARNING: 100, // 100ms for good UX
};
// Enhanced useCallback with performance monitoring
function useOptimizedCallback(callback, deps, debugName) {
    var performanceRef = (0, react_1.useRef)({
        callCount: 0,
        totalTime: 0,
        lastCall: 0
    });
    return (0, react_1.useCallback)(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var start = performance.now();
        try {
            var result = callback.apply(void 0, args);
            // Track performance metrics
            var duration = performance.now() - start;
            performanceRef.current.callCount++;
            performanceRef.current.totalTime += duration;
            performanceRef.current.lastCall = duration;
            // Warn about slow callbacks in development
            if (process.env.NODE_ENV === 'development' && duration > PERFORMANCE_THRESHOLDS.INTERACTION_TIME_WARNING) {
                console.warn("\uD83D\uDC0C Slow callback ".concat(debugName || 'unknown', ": ").concat(duration.toFixed(2), "ms"));
            }
            return result;
        }
        catch (error) {
            console.error("\u274C Callback error in ".concat(debugName || 'unknown', ":"), error);
            throw error;
        }
    }, deps);
}
// Enhanced useMemo with performance monitoring
function useOptimizedMemo(factory, deps, debugName) {
    var performanceRef = (0, react_1.useRef)({
        computeCount: 0,
        totalTime: 0,
        lastCompute: 0
    });
    return (0, react_1.useMemo)(function () {
        var start = performance.now();
        try {
            var result = factory();
            // Track performance metrics
            var duration = performance.now() - start;
            performanceRef.current.computeCount++;
            performanceRef.current.totalTime += duration;
            performanceRef.current.lastCompute = duration;
            // Warn about expensive computations in development
            if (process.env.NODE_ENV === 'development' && duration > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
                console.warn("\uD83E\uDDEE Expensive computation ".concat(debugName || 'unknown', ": ").concat(duration.toFixed(2), "ms"));
            }
            return result;
        }
        catch (error) {
            console.error("\u274C Memo computation error in ".concat(debugName || 'unknown', ":"), error);
            throw error;
        }
    }, deps);
}
// Component render performance monitor
function useRenderPerformance(componentName) {
    var renderStartRef = (0, react_1.useRef)(0);
    var renderCountRef = (0, react_1.useRef)(0);
    var totalRenderTimeRef = (0, react_1.useRef)(0);
    // Mark render start
    renderStartRef.current = performance.now();
    renderCountRef.current++;
    (0, react_1.useEffect)(function () {
        // Mark render end
        var renderTime = performance.now() - renderStartRef.current;
        totalRenderTimeRef.current += renderTime;
        // Log performance in development
        if (process.env.NODE_ENV === 'development') {
            var avgRenderTime = totalRenderTimeRef.current / renderCountRef.current;
            if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_ERROR) {
                console.error("\uD83D\uDEA8 Slow render ".concat(componentName, ": ").concat(renderTime.toFixed(2), "ms (avg: ").concat(avgRenderTime.toFixed(2), "ms)"));
            }
            else if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
                console.warn("\u26A0\uFE0F Render warning ".concat(componentName, ": ").concat(renderTime.toFixed(2), "ms (avg: ").concat(avgRenderTime.toFixed(2), "ms)"));
            }
        }
    });
    return {
        renderCount: renderCountRef.current,
        averageRenderTime: totalRenderTimeRef.current / renderCountRef.current
    };
}
// Debounced state with startTransition for better UX
function useDebouncedState(initialValue, delay) {
    if (delay === void 0) { delay = 300; }
    var _a = (0, react_1.useState)(initialValue), immediateValue = _a[0], setImmediateValue = _a[1];
    var _b = (0, react_1.useState)(initialValue), debouncedValue = _b[0], setDebouncedValue = _b[1];
    var timeoutRef = (0, react_1.useRef)();
    var setValue = (0, react_1.useCallback)(function (value) {
        // Update immediate value for UI responsiveness
        setImmediateValue(value);
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Set debounced value with transition
        timeoutRef.current = setTimeout(function () {
            (0, react_1.startTransition)(function () {
                setDebouncedValue(value);
            });
        }, delay);
    }, [delay]);
    (0, react_1.useEffect)(function () {
        return function () {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return [immediateValue, debouncedValue, setValue];
}
// Virtual scrolling hook for large lists
function useVirtualScrolling(items, itemHeight, containerHeight) {
    var _a = (0, react_1.useState)(0), scrollTop = _a[0], setScrollTop = _a[1];
    var visibleRange = (0, react_1.useMemo)(function () {
        var start = Math.floor(scrollTop / itemHeight);
        var visibleCount = Math.ceil(containerHeight / itemHeight);
        var end = Math.min(start + visibleCount + 1, items.length);
        return { start: Math.max(0, start - 1), end: end };
    }, [scrollTop, itemHeight, containerHeight, items.length]);
    var visibleItems = (0, react_1.useMemo)(function () {
        return items.slice(visibleRange.start, visibleRange.end).map(function (item, index) { return ({
            item: item,
            index: visibleRange.start + index,
            style: {
                position: 'absolute',
                top: (visibleRange.start + index) * itemHeight,
                height: itemHeight,
                width: '100%'
            }
        }); });
    }, [items, visibleRange, itemHeight]);
    var totalHeight = items.length * itemHeight;
    var handleScroll = useOptimizedCallback(function (event) {
        setScrollTop(event.currentTarget.scrollTop);
    }, [], 'virtualScrolling');
    return {
        visibleItems: visibleItems,
        totalHeight: totalHeight,
        handleScroll: handleScroll,
        visibleRange: visibleRange
    };
}
// Intersection observer hook for lazy loading
function useIntersectionObserver(options) {
    if (options === void 0) { options = {}; }
    var _a = (0, react_1.useState)(false), isIntersecting = _a[0], setIsIntersecting = _a[1];
    var _b = (0, react_1.useState)(false), hasIntersected = _b[0], setHasIntersected = _b[1];
    var ref = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var element = ref.current;
        if (!element)
            return;
        var observer = new IntersectionObserver(function (_a) {
            var entry = _a[0];
            var intersecting = entry.isIntersecting;
            setIsIntersecting(intersecting);
            if (intersecting && !hasIntersected) {
                setHasIntersected(true);
            }
        }, options);
        observer.observe(element);
        return function () {
            observer.unobserve(element);
        };
    }, [options, hasIntersected]);
    return { ref: ref, isIntersecting: isIntersecting, hasIntersected: hasIntersected };
}
// Memory usage monitor hook
function useMemoryMonitor(componentName) {
    (0, react_1.useEffect)(function () {
        if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
            var checkMemory = function () {
                var memory = performance.memory;
                var used = memory.usedJSHeapSize;
                var total = memory.totalJSHeapSize;
                if (used > PERFORMANCE_THRESHOLDS.MEMORY_USAGE_WARNING) {
                    console.warn("\uD83E\uDDE0 High memory usage in ".concat(componentName, ": ").concat((used / 1024 / 1024).toFixed(2), "MB"));
                }
                return { used: used, total: total, percentage: (used / total) * 100 };
            };
            var interval_1 = setInterval(checkMemory, 5000); // Check every 5 seconds
            return function () { return clearInterval(interval_1); };
        }
    }, [componentName]);
}
// Optimized chart data processor for analytics
function useOptimizedChartData(rawData, processor, deps) {
    return useOptimizedMemo(function () {
        if (!rawData || rawData.length === 0)
            return [];
        // Batch process large datasets
        if (rawData.length > 1000) {
            var batchSize = 100;
            var batches = [];
            for (var i = 0; i < rawData.length; i += batchSize) {
                batches.push(rawData.slice(i, i + batchSize));
            }
            return batches.reduce(function (acc, batch) {
                return __spreadArray(__spreadArray([], acc, true), processor(batch), true);
            }, []);
        }
        return processor(rawData);
    }, __spreadArray([rawData], deps, true), 'chartDataProcessor');
}
// Preload resources hook
function usePreloadResources(resources) {
    (0, react_1.useEffect)(function () {
        var links = [];
        resources.forEach(function (resource) {
            var link = document.createElement('link');
            link.rel = 'preload';
            // Determine resource type
            if (resource.endsWith('.js')) {
                link.as = 'script';
            }
            else if (resource.endsWith('.css')) {
                link.as = 'style';
            }
            else if (resource.match(/\.(woff|woff2|ttf|otf)$/)) {
                link.as = 'font';
                link.crossOrigin = 'anonymous';
            }
            else if (resource.match(/\.(jpg|jpeg|png|webp|avif|svg)$/)) {
                link.as = 'image';
            }
            link.href = resource;
            document.head.appendChild(link);
            links.push(link);
        });
        return function () {
            links.forEach(function (link) {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            });
        };
    }, [resources]);
}
// Performance profiler hook for development
function usePerformanceProfiler(name, enabled) {
    if (enabled === void 0) { enabled = process.env.NODE_ENV === 'development'; }
    var marksRef = (0, react_1.useRef)({});
    var mark = (0, react_1.useCallback)(function (markName) {
        if (!enabled)
            return;
        var fullName = "".concat(name, "-").concat(markName);
        performance.mark(fullName);
        marksRef.current[markName] = performance.now();
    }, [name, enabled]);
    var measure = (0, react_1.useCallback)(function (startMark, endMark) {
        if (!enabled)
            return;
        var startName = "".concat(name, "-").concat(startMark);
        var endName = "".concat(name, "-").concat(endMark);
        try {
            performance.measure("".concat(name, "-").concat(startMark, "-to-").concat(endMark), startName, endName);
            var duration = marksRef.current[endMark] - marksRef.current[startMark];
            console.log("\u23F1\uFE0F ".concat(name, ": ").concat(startMark, " \u2192 ").concat(endMark, " took ").concat(duration.toFixed(2), "ms"));
            return duration;
        }
        catch (error) {
            console.warn("Failed to measure ".concat(name, ":"), error);
        }
    }, [name, enabled]);
    return { mark: mark, measure: measure };
}
