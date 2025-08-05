"use strict";
/**
 * Memory Optimizer - VIBECODE V1.0 Memory Management
 * Advanced memory optimization for subscription middleware
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryOptimizer = void 0;
var MemoryOptimizer = /** @class */ (function () {
    function MemoryOptimizer() {
        this.snapshots = [];
        this.gcCallbacks = [];
    }
    /**
     * Start memory monitoring
     */
    MemoryOptimizer.prototype.startMonitoring = function (intervalMs) {
        var _this = this;
        if (intervalMs === void 0) { intervalMs = 5000; }
        this.stopMonitoring();
        this.monitoringInterval = setInterval(function () {
            _this.takeSnapshot();
            _this.detectLeaks();
        }, intervalMs);
        console.log('🧠 Memory monitoring started');
    }; /**
     * Stop memory monitoring
     */
    MemoryOptimizer.prototype.stopMonitoring = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
            console.log('🧠 Memory monitoring stopped');
        }
    };
    /**
     * Take memory snapshot
     */
    MemoryOptimizer.prototype.takeSnapshot = function () {
        var snapshot;
        if (typeof process !== 'undefined' && process.memoryUsage) {
            // Node.js environment
            var usage = process.memoryUsage();
            snapshot = {
                timestamp: Date.now(),
                heapUsed: usage.heapUsed / (1024 * 1024),
                heapTotal: usage.heapTotal / (1024 * 1024),
                external: usage.external / (1024 * 1024),
                arrayBuffers: usage.arrayBuffers / (1024 * 1024),
                rss: usage.rss / (1024 * 1024)
            };
        }
        else if (typeof window !== 'undefined' && 'memory' in performance) {
            // Browser environment
            var memory = performance.memory;
            snapshot = {
                timestamp: Date.now(),
                heapUsed: memory.usedJSHeapSize / (1024 * 1024),
                heapTotal: memory.totalJSHeapSize / (1024 * 1024),
                external: 0,
                arrayBuffers: 0
            };
        }
        else {
            // Fallback
            snapshot = {
                timestamp: Date.now(),
                heapUsed: 0,
                heapTotal: 0,
                external: 0,
                arrayBuffers: 0
            };
        }
        this.snapshots.push(snapshot);
        this.cleanOldSnapshots();
        return snapshot;
    };
    /**
     * Detect memory leaks
     */
    MemoryOptimizer.prototype.detectLeaks = function () {
        var leaks = [];
        if (this.snapshots.length < 5)
            return leaks;
        var recent = this.snapshots.slice(-5);
        var growthRate = this.calculateGrowthRate(recent);
        if (growthRate > 10) { // 10MB/minute growth
            leaks.push({
                type: 'growing_heap',
                severity: growthRate > 50 ? 'critical' : growthRate > 25 ? 'high' : 'medium',
                description: "Heap growing at ".concat(growthRate.toFixed(2), "MB/min"),
                recommendations: [
                    'Check for memory leaks in event listeners',
                    'Review object retention patterns',
                    'Consider implementing object pooling'
                ]
            });
        }
        return leaks;
    };
    /**
     * Generate optimization report
     */
    MemoryOptimizer.prototype.generateReport = function () {
        if (this.snapshots.length === 0) {
            this.takeSnapshot();
        }
        var baseline = this.snapshots[0];
        var peak = this.snapshots.reduce(function (max, snap) {
            return snap.heapUsed > max.heapUsed ? snap : max;
        });
        var current = this.snapshots[this.snapshots.length - 1];
        return {
            baseline: baseline,
            peak: peak,
            current: current,
            leaks: this.detectLeaks(),
            optimizationOpportunities: this.getOptimizationOpportunities(),
            memoryEfficiency: this.calculateEfficiency()
        };
    };
    /**
     * Force garbage collection (if available)
     */
    MemoryOptimizer.prototype.forceGC = function () {
        if (typeof global !== 'undefined' && global.gc) {
            global.gc();
            console.log('🗑️ Forced garbage collection');
        }
        else {
            console.warn('⚠️ Garbage collection not available');
        }
    };
    /**
     * Clean old snapshots (keep last 100)
     */
    MemoryOptimizer.prototype.cleanOldSnapshots = function () {
        if (this.snapshots.length > 100) {
            this.snapshots = this.snapshots.slice(-100);
        }
    };
    /**
     * Calculate memory growth rate
     */
    MemoryOptimizer.prototype.calculateGrowthRate = function (snapshots) {
        if (snapshots.length < 2)
            return 0;
        var first = snapshots[0];
        var last = snapshots[snapshots.length - 1];
        var timeDiff = (last.timestamp - first.timestamp) / (1000 * 60); // minutes
        var memoryDiff = last.heapUsed - first.heapUsed;
        return timeDiff > 0 ? memoryDiff / timeDiff : 0;
    };
    /**
     * Get optimization opportunities
     */
    MemoryOptimizer.prototype.getOptimizationOpportunities = function () {
        var opportunities = [];
        if (this.snapshots.length > 0) {
            var current = this.snapshots[this.snapshots.length - 1];
            if (current.heapUsed > 100) {
                opportunities.push('Consider implementing object pooling for large objects');
            }
            if (current.external > 50) {
                opportunities.push('Review external memory usage (buffers, etc.)');
            }
        }
        return opportunities;
    };
    /**
     * Calculate memory efficiency score
     */
    MemoryOptimizer.prototype.calculateEfficiency = function () {
        if (this.snapshots.length === 0)
            return 100;
        var current = this.snapshots[this.snapshots.length - 1];
        var growthRate = this.calculateGrowthRate(this.snapshots.slice(-10));
        // Base score on memory usage and growth rate
        var score = 100;
        if (current.heapUsed > 200)
            score -= 20;
        if (current.heapUsed > 500)
            score -= 30;
        if (growthRate > 10)
            score -= 25;
        if (growthRate > 25)
            score -= 25;
        return Math.max(0, score);
    };
    return MemoryOptimizer;
}());
exports.MemoryOptimizer = MemoryOptimizer;
