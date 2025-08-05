/**
 * Stress Testing Suite - VIBECODE V1.0 Resilience Testing
 * Chaos engineering and stress testing for subscription middleware
 */
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
exports.StressTester = void 0;
var load_tester_1 = require("./load-tester");
var monitor_1 = require("./monitor");
var StressTester = /** @class */ (() => {
  function StressTester() {
    this.activeTests = new Map();
    this.reports = [];
    this.loadTester = new load_tester_1.LoadTester();
  } /**
   * Execute stress test scenario
   */
  StressTester.prototype.executeStressTest = function (scenario, testFn) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        baselineMetrics,
        loadResult,
        recoveryStartTime,
        recoveryTime,
        endTime,
        postTestMetrics,
        report;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("\uD83D\uDD25 Starting stress test: ".concat(scenario.name));
            startTime = Date.now();
            baselineMetrics = monitor_1.performanceMonitor.generateReport();
            // Schedule chaos actions
            if (scenario.chaosActions) {
              scenario.chaosActions.forEach((action) => {
                _this.scheduleChaosAction(action, scenario.name);
              });
            }
            return [4 /*yield*/, this.loadTester.executeLoadTest(testFn, scenario.config)];
          case 1:
            loadResult = _a.sent();
            recoveryStartTime = Date.now();
            return [4 /*yield*/, this.waitForSystemRecovery(testFn)];
          case 2:
            _a.sent();
            recoveryTime = Date.now() - recoveryStartTime;
            // Clean up chaos actions
            this.cleanupChaosActions(scenario.name);
            endTime = Date.now();
            postTestMetrics = monitor_1.performanceMonitor.generateReport();
            report = {
              scenario: scenario.name,
              startTime: startTime,
              endTime: endTime,
              totalDuration: endTime - startTime,
              systemStability: this.calculateStabilityScore(loadResult),
              recoveryTime: recoveryTime,
              criticalFailures: loadResult.failedRequests,
              performanceDegradation: this.calculatePerformanceDegradation(
                baselineMetrics,
                postTestMetrics,
              ),
            };
            this.reports.push(report);
            console.log("\u2705 Stress test completed: ".concat(scenario.name));
            console.log("\uD83D\uDCCA System stability: ".concat(report.systemStability, "%"));
            console.log("\u23F1\uFE0F Recovery time: ".concat(report.recoveryTime, "ms"));
            return [2 /*return*/, report];
        }
      });
    });
  }; /**
   * Schedule chaos action
   */
  StressTester.prototype.scheduleChaosAction = function (action, testId) {
    var timeoutId = setTimeout(() => {
      this.executeChaosAction(action);
      // Schedule cleanup
      setTimeout(() => {
        this.cleanupChaosAction(action);
      }, action.duration);
    }, action.delay);
    this.activeTests.set("".concat(testId, "-").concat(action.type), timeoutId);
  };
  /**
   * Execute specific chaos action
   */
  StressTester.prototype.executeChaosAction = function (action) {
    console.log(
      "\uD83D\uDCA5 Executing chaos action: "
        .concat(action.type, " (intensity: ")
        .concat(action.intensity, ")"),
    );
    switch (action.type) {
      case "network_delay":
        this.simulateNetworkDelay(action.intensity * 100);
        break;
      case "memory_pressure":
        this.simulateMemoryPressure(action.intensity);
        break;
      case "cpu_spike":
        this.simulateCpuSpike(action.intensity);
        break;
      case "connection_drop":
        this.simulateConnectionDrop(action.intensity);
        break;
    }
  }; /**
   * Simulate network delay
   */
  StressTester.prototype.simulateNetworkDelay = (delayMs) => {
    // Implementation would depend on testing environment
    console.log("\uD83C\uDF10 Simulating ".concat(delayMs, "ms network delay"));
  };
  /**
   * Simulate memory pressure
   */
  StressTester.prototype.simulateMemoryPressure = (intensity) => {
    // Create memory pressure by allocating large arrays
    var arrays = [];
    var arrayCount = intensity * 10;
    for (var i = 0; i < arrayCount; i++) {
      arrays.push(new Array(100000).fill(Math.random()));
    }
    console.log("\uD83E\uDDE0 Created memory pressure with ".concat(arrayCount, " large arrays"));
    // Keep reference to prevent GC
    setTimeout(() => {
      arrays.length = 0; // Release memory
    }, 5000);
  };
  /**
   * Simulate CPU spike
   */
  StressTester.prototype.simulateCpuSpike = (intensity) => {
    var duration = intensity * 1000; // ms
    var startTime = Date.now();
    console.log("\u26A1 Simulating CPU spike for ".concat(duration, "ms"));
    var cpuBurn = () => {
      var elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        // Perform CPU-intensive operation
        Math.sqrt(Math.random() * 1000000);
        setImmediate(cpuBurn);
      }
    };
    cpuBurn();
  };
  /**
   * Simulate connection drop
   */
  StressTester.prototype.simulateConnectionDrop = (intensity) => {
    console.log("\uD83D\uDD0C Simulating connection drops (intensity: ".concat(intensity, ")"));
    // Implementation would mock network failures
  };
  /**
   * Cleanup chaos action
   */
  StressTester.prototype.cleanupChaosAction = (action) => {
    console.log("\uD83E\uDDF9 Cleaning up chaos action: ".concat(action.type));
    // Cleanup implementation would depend on action type
  };
  /**
   * Wait for system recovery
   */
  StressTester.prototype.waitForSystemRecovery = function (testFn) {
    return __awaiter(this, void 0, void 0, function () {
      var maxWaitTime, checkInterval, startTime, isHealthy, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            maxWaitTime = 30000;
            checkInterval = 1000;
            startTime = Date.now();
            _a.label = 1;
          case 1:
            if (!(Date.now() - startTime < maxWaitTime)) return [3 /*break*/, 7];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, testFn()];
          case 3:
            isHealthy = _a.sent();
            if (isHealthy) {
              console.log("✅ System recovered");
              return [2 /*return*/];
            }
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            return [3 /*break*/, 5];
          case 5:
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, checkInterval))];
          case 6:
            _a.sent();
            return [3 /*break*/, 1];
          case 7:
            console.warn("⚠️ System recovery timeout");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup chaos actions for a test
   */
  StressTester.prototype.cleanupChaosActions = function (testId) {
    for (var _i = 0, _a = this.activeTests.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        timeoutId = _b[1];
      if (key.startsWith(testId)) {
        clearTimeout(timeoutId);
        this.activeTests.delete(key);
      }
    }
  };
  /**
   * Calculate system stability score
   */
  StressTester.prototype.calculateStabilityScore = (loadResult) => {
    if (!loadResult.totalRequests) return 0;
    var successRate =
      (loadResult.totalRequests - loadResult.failedRequests) / loadResult.totalRequests;
    var responseTimeScore = Math.max(0, 100 - loadResult.averageResponseTime / 10);
    return Math.round(successRate * 70 + responseTimeScore * 0.3);
  };
  /**
   * Calculate performance degradation
   */
  StressTester.prototype.calculatePerformanceDegradation = (baseline, current) => {
    if (!baseline || !current) return 0;
    var baselineScore = baseline.overallScore || 100;
    var currentScore = current.overallScore || 100;
    return Math.max(0, Math.round(((baselineScore - currentScore) / baselineScore) * 100));
  };
  /**
   * Get all stress test reports
   */
  StressTester.prototype.getReports = function () {
    return __spreadArray([], this.reports, true);
  };
  /**
   * Clear all reports
   */
  StressTester.prototype.clearReports = function () {
    this.reports = [];
  };
  /**
   * Generate comprehensive stress test report
   */
  StressTester.prototype.generateComprehensiveReport = function () {
    if (this.reports.length === 0) {
      return {
        summary: "No stress tests executed",
        totalTests: 0,
        averageStability: 0,
        averageRecoveryTime: 0,
      };
    }
    var totalTests = this.reports.length;
    var averageStability =
      this.reports.reduce((sum, report) => sum + report.systemStability, 0) / totalTests;
    var averageRecoveryTime =
      this.reports.reduce((sum, report) => sum + report.recoveryTime, 0) / totalTests;
    var totalFailures = this.reports.reduce((sum, report) => sum + report.criticalFailures, 0);
    return {
      summary: "Executed ".concat(totalTests, " stress tests"),
      totalTests: totalTests,
      averageStability: Math.round(averageStability),
      averageRecoveryTime: Math.round(averageRecoveryTime),
      totalFailures: totalFailures,
      reports: this.reports,
    };
  };
  return StressTester;
})();
exports.StressTester = StressTester;
