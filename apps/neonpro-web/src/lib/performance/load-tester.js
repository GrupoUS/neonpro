"use strict";
/**
 * Load Testing Suite - VIBECODE V1.0 Performance Testing
 * Enterprise-grade load testing for subscription middleware
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.loadTester = exports.LoadTester = void 0;
var monitor_1 = require("./monitor");
var LoadTester = /** @class */ (function () {
    function LoadTester() {
        this.results = [];
    }
    /**
     * Execute load test with specified configuration
     */
    LoadTester.prototype.executeLoadTest = function (testFn, config) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, results, memoryReadings, totalRequests, batchSize, batches, _loop_1, this_1, batch;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        results = [];
                        memoryReadings = [];
                        totalRequests = config.concurrent * config.duration;
                        batchSize = Math.max(1, Math.floor(config.concurrent / 10));
                        console.log("\uD83D\uDE80 Starting load test: ".concat(config.concurrent, " concurrent users for ").concat(config.duration, "s"));
                        batches = Math.ceil(config.concurrent / batchSize);
                        _loop_1 = function (batch) {
                            var batchPromises, rampDelay, i, requestPromise;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        batchPromises = [];
                                        rampDelay = (config.rampUpTime * 1000 * batch) / batches;
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, rampDelay); })];
                                    case 1:
                                        _b.sent();
                                        // Execute batch
                                        for (i = 0; i < batchSize && (batch * batchSize + i) < config.concurrent; i++) {
                                            requestPromise = this_1.executeRequest(testFn, config.operation);
                                            batchPromises.push(requestPromise.then(function (result) {
                                                results.push(result);
                                                memoryReadings.push(_this.getCurrentMemoryUsage());
                                            }));
                                        }
                                        return [4 /*yield*/, Promise.all(batchPromises)];
                                    case 2:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        batch = 0;
                        _a.label = 1;
                    case 1:
                        if (!(batch < batches)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(batch)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        batch++;
                        return [3 /*break*/, 1];
                    case 4: 
                    // Calculate final results
                    return [2 /*return*/, this.calculateResults(results, memoryReadings, startTime, config)];
                }
            });
        });
    }; /**
     * Execute individual request with performance monitoring
     */
    LoadTester.prototype.executeRequest = function (testFn, operation) {
        return __awaiter(this, void 0, void 0, function () {
            var measurementId, startTime, success, endTime, responseTime, error_1, endTime, responseTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        measurementId = monitor_1.performanceMonitor.startMeasurement(operation);
                        startTime = performance.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, testFn()];
                    case 2:
                        success = _a.sent();
                        endTime = performance.now();
                        responseTime = endTime - startTime;
                        monitor_1.performanceMonitor.endMeasurement(measurementId, success);
                        return [2 /*return*/, { success: success, responseTime: responseTime }];
                    case 3:
                        error_1 = _a.sent();
                        endTime = performance.now();
                        responseTime = endTime - startTime;
                        monitor_1.performanceMonitor.endMeasurement(measurementId, false);
                        return [2 /*return*/, { success: false, responseTime: responseTime }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current memory usage
     */
    LoadTester.prototype.getCurrentMemoryUsage = function () {
        if (typeof window !== 'undefined' && 'memory' in performance) {
            return performance.memory.usedJSHeapSize / (1024 * 1024);
        }
        if (typeof process !== 'undefined') {
            return process.memoryUsage().heapUsed / (1024 * 1024);
        }
        return 0;
    }; /**
     * Calculate final load test results
     */
    LoadTester.prototype.calculateResults = function (results, memoryReadings, startTime, config) {
        var totalRequests = results.length;
        var successfulRequests = results.filter(function (r) { return r.success; }).length;
        var failedRequests = totalRequests - successfulRequests;
        var responseTimes = results.map(function (r) { return r.responseTime; });
        var avgResponseTime = responseTimes.reduce(function (a, b) { return a + b; }, 0) / responseTimes.length;
        var maxResponseTime = Math.max.apply(Math, responseTimes);
        var minResponseTime = Math.min.apply(Math, responseTimes);
        var totalTime = (Date.now() - startTime) / 1000; // in seconds
        var throughput = totalRequests / totalTime;
        var errorRate = (failedRequests / totalRequests) * 100;
        var memoryPeak = Math.max.apply(Math, memoryReadings);
        var result = {
            totalRequests: totalRequests,
            successfulRequests: successfulRequests,
            failedRequests: failedRequests,
            avgResponseTime: avgResponseTime,
            maxResponseTime: maxResponseTime,
            minResponseTime: minResponseTime,
            throughput: throughput,
            errorRate: errorRate,
            memoryPeak: memoryPeak
        };
        this.results.push(result);
        return result;
    };
    /**
     * Get all load test results
     */
    LoadTester.prototype.getResults = function () {
        return __spreadArray([], this.results, true);
    };
    /**
     * Clear all results
     */
    LoadTester.prototype.clearResults = function () {
        this.results = [];
    };
    return LoadTester;
}());
exports.LoadTester = LoadTester;
exports.loadTester = new LoadTester();
