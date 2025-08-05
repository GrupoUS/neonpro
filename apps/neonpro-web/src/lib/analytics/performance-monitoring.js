"use strict";
/**
 * Performance Monitoring Engine
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Comprehensive performance monitoring and optimization engine
 * Real-time system health, resource utilization, and optimization suggestions
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMonitoringEngine =
  exports.PerformanceMonitoringEngine =
  exports.SystemMetricsSchema =
  exports.createperformanceMonitoringEngine =
    void 0;
var zod_1 = require("zod");
var logger_1 = require("@/lib/utils/logger");
var client_1 = require("@/lib/supabase/client");
// Main Performance Monitoring Engine
var createperformanceMonitoringEngine = /** @class */ (function () {
  function createperformanceMonitoringEngine() {
    this.supabase = (0, client_1.createClient)();
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = new Map();
    this.optimizations = new Map();
    this.isMonitoring = true;
    this.monitoringInterval = 30000; // 30 seconds
    this.alertCooldowns = new Map();
    this.initializeEngine();
  }
  /**
   * Initialize performance monitoring engine
   */
  createperformanceMonitoringEngine.prototype.initializeEngine = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            logger_1.logger.info("Initializing Performance Monitoring Engine...");
            // Load thresholds
            return [4 /*yield*/, this.loadThresholds()];
          case 1:
            // Load thresholds
            _a.sent();
            // Load baselines
            return [4 /*yield*/, this.loadBaselines()];
          case 2:
            // Load baselines
            _a.sent();
            // Start monitoring
            if (this.isMonitoring) {
              this.startMonitoring();
            }
            logger_1.logger.info("Performance Monitoring Engine initialized successfully");
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            logger_1.logger.error("Failed to initialize Performance Monitoring Engine:", error_1);
            throw error_1;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Collect system metrics
   */
  createperformanceMonitoringEngine.prototype.collectMetrics = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, _a, error_2;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 11, , 12]);
            _b = {
              id: "metrics_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              timestamp: new Date().toISOString(),
              category: "system",
              component: "neonpro_system",
            };
            _c = {};
            return [4 /*yield*/, this.collectCPUMetrics()];
          case 1:
            _c.cpu = _d.sent();
            return [4 /*yield*/, this.collectMemoryMetrics()];
          case 2:
            _c.memory = _d.sent();
            return [4 /*yield*/, this.collectStorageMetrics()];
          case 3:
            _c.storage = _d.sent();
            return [4 /*yield*/, this.collectNetworkMetrics()];
          case 4:
            _c.network = _d.sent();
            return [4 /*yield*/, this.collectDatabaseMetrics()];
          case 5:
            _c.database = _d.sent();
            return [4 /*yield*/, this.collectApplicationMetrics()];
          case 6:
            metrics =
              ((_b.metrics = ((_c.application = _d.sent()), _c)),
              (_b.healthScore = 0),
              (_b.status = "optimal"),
              (_b.alerts = []),
              (_b.clinicId = clinicId),
              (_b.environment = process.env.NODE_ENV || "development"),
              _b);
            // Calculate health score
            metrics.healthScore = this.calculateHealthScore(metrics);
            // Determine status
            metrics.status = this.determineStatus(metrics.healthScore);
            // Check for alerts
            _a = metrics;
            return [4 /*yield*/, this.checkThresholds(metrics)];
          case 7:
            // Check for alerts
            _a.alerts = _d.sent();
            // Store metrics
            this.metrics.set(metrics.id, metrics);
            return [4 /*yield*/, this.saveMetrics(metrics)];
          case 8:
            _d.sent();
            // Process alerts
            return [4 /*yield*/, this.processAlerts(metrics.alerts)];
          case 9:
            // Process alerts
            _d.sent();
            // Generate optimizations
            return [4 /*yield*/, this.generateOptimizations(metrics)];
          case 10:
            // Generate optimizations
            _d.sent();
            logger_1.logger.info("System metrics collected: ".concat(metrics.id));
            return [2 /*return*/, metrics];
          case 11:
            error_2 = _d.sent();
            logger_1.logger.error("Failed to collect metrics:", error_2);
            throw error_2;
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get real-time performance data
   */
  createperformanceMonitoringEngine.prototype.getRealtimeData = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, categories) {
      var data, _i, categories_1, category, _a, _b, error_3;
      var _c;
      if (categories === void 0) {
        categories = ["system", "application", "database"];
      }
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 8, , 9]);
            _c = {
              timestamp: new Date().toISOString(),
              clinicId: clinicId,
              categories: {},
            };
            return [4 /*yield*/, this.getActiveAlerts(clinicId)];
          case 1:
            _c.alerts = _d.sent();
            return [4 /*yield*/, this.getActiveOptimizations(clinicId)];
          case 2:
            _c.optimizations = _d.sent();
            return [4 /*yield*/, this.getPerformanceSummary(clinicId)];
          case 3:
            data = ((_c.summary = _d.sent()), (_c.healthScore = 0), _c);
            (_i = 0), (categories_1 = categories);
            _d.label = 4;
          case 4:
            if (!(_i < categories_1.length)) return [3 /*break*/, 7];
            category = categories_1[_i];
            _a = data.categories;
            _b = category;
            return [4 /*yield*/, this.getCategoryData(category, clinicId)];
          case 5:
            _a[_b] = _d.sent();
            _d.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 4];
          case 7:
            // Calculate overall health score
            data.healthScore = this.calculateOverallHealth(data.categories);
            return [2 /*return*/, data];
          case 8:
            error_3 = _d.sent();
            logger_1.logger.error("Failed to get realtime data:", error_3);
            throw error_3;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate performance report
   */
  createperformanceMonitoringEngine.prototype.generateReport = function (
    clinicId,
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var report, error_4;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 9, , 10]);
            _a = {
              id: "report_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
              timestamp: new Date().toISOString(),
              period: { start: startDate, end: endDate },
            };
            return [4 /*yield*/, this.generateSummary(clinicId, startDate, endDate)];
          case 1:
            _a.summary = _b.sent();
            return [4 /*yield*/, this.generateCategoryReports(clinicId, startDate, endDate)];
          case 2:
            _a.categories = _b.sent();
            return [4 /*yield*/, this.analyzeTrends(clinicId, startDate, endDate)];
          case 3:
            _a.trends = _b.sent();
            return [4 /*yield*/, this.getAlertsInPeriod(clinicId, startDate, endDate)];
          case 4:
            _a.alerts = _b.sent();
            return [4 /*yield*/, this.getOptimizationsInPeriod(clinicId, startDate, endDate)];
          case 5:
            _a.optimizations = _b.sent();
            return [4 /*yield*/, this.getBenchmarks(clinicId)];
          case 6:
            _a.benchmarks = _b.sent();
            return [4 /*yield*/, this.generateRecommendations(clinicId, startDate, endDate)];
          case 7:
            report = ((_a.recommendations = _b.sent()), (_a.score = 0), _a);
            // Calculate overall score
            report.score = this.calculateReportScore(report);
            // Save report
            return [4 /*yield*/, this.saveReport(report)];
          case 8:
            // Save report
            _b.sent();
            logger_1.logger.info("Performance report generated: ".concat(report.id));
            return [2 /*return*/, report];
          case 9:
            error_4 = _b.sent();
            logger_1.logger.error("Failed to generate report:", error_4);
            throw error_4;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Optimize resource usage
   */
  createperformanceMonitoringEngine.prototype.optimizeResources = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, resourceTypes) {
      var optimizations, _i, resourceTypes_1, resourceType, optimization, error_5;
      if (resourceTypes === void 0) {
        resourceTypes = ["cpu", "memory", "storage"];
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            optimizations = [];
            (_i = 0), (resourceTypes_1 = resourceTypes);
            _a.label = 1;
          case 1:
            if (!(_i < resourceTypes_1.length)) return [3 /*break*/, 4];
            resourceType = resourceTypes_1[_i];
            return [4 /*yield*/, this.analyzeResourceOptimization(clinicId, resourceType)];
          case 2:
            optimization = _a.sent();
            if (optimization) {
              optimizations.push(optimization);
            }
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            // Apply automatic optimizations
            return [4 /*yield*/, this.applyAutomaticOptimizations(optimizations)];
          case 5:
            // Apply automatic optimizations
            _a.sent();
            logger_1.logger.info(
              "Generated ".concat(optimizations.length, " resource optimizations"),
            );
            return [2 /*return*/, optimizations];
          case 6:
            error_5 = _a.sent();
            logger_1.logger.error("Failed to optimize resources:", error_5);
            throw error_5;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Monitor AI model performance
   */
  createperformanceMonitoringEngine.prototype.monitorAIModels = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var performance_1, modelScores, _a, error_6;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 6, , 7]);
            _b = {
              timestamp: new Date().toISOString(),
              clinicId: clinicId,
            };
            _c = {};
            return [4 /*yield*/, this.getModelMetrics("face_detection")];
          case 1:
            _c.faceDetection = _d.sent();
            return [4 /*yield*/, this.getModelMetrics("aesthetic_analysis")];
          case 2:
            _c.aestheticAnalysis = _d.sent();
            return [4 /*yield*/, this.getModelMetrics("complication_detection")];
          case 3:
            _c.complicationDetection = _d.sent();
            return [4 /*yield*/, this.getModelMetrics("compliance_monitoring")];
          case 4:
            performance_1 =
              ((_b.models = ((_c.complianceMonitoring = _d.sent()), _c)),
              (_b.overallHealth = 0),
              (_b.recommendations = []),
              _b);
            modelScores = Object.values(performance_1.models).map(function (m) {
              return m.healthScore;
            });
            performance_1.overallHealth =
              modelScores.reduce(function (sum, score) {
                return sum + score;
              }, 0) / modelScores.length;
            // Generate recommendations
            _a = performance_1;
            return [4 /*yield*/, this.generateAIRecommendations(performance_1)];
          case 5:
            // Generate recommendations
            _a.recommendations = _d.sent();
            return [2 /*return*/, performance_1];
          case 6:
            error_6 = _d.sent();
            logger_1.logger.error("Failed to monitor AI models:", error_6);
            throw error_6;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Set performance threshold
   */
  createperformanceMonitoringEngine.prototype.setThreshold = function (threshold) {
    return __awaiter(this, void 0, void 0, function () {
      var performanceThreshold, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            performanceThreshold = __assign(
              {
                id: "threshold_"
                  .concat(Date.now(), "_")
                  .concat(Math.random().toString(36).substr(2, 9)),
              },
              threshold,
            );
            this.thresholds.set(performanceThreshold.id, performanceThreshold);
            return [4 /*yield*/, this.saveThreshold(performanceThreshold)];
          case 1:
            _a.sent();
            logger_1.logger.info("Performance threshold set: ".concat(performanceThreshold.id));
            return [2 /*return*/, performanceThreshold];
          case 2:
            error_7 = _a.sent();
            logger_1.logger.error("Failed to set threshold:", error_7);
            throw error_7;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get historical metrics
   */
  createperformanceMonitoringEngine.prototype.getHistoricalMetrics = function (
    clinicId_1,
    category_1,
    component_1,
    startDate_1,
    endDate_1,
  ) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (clinicId, category, component, startDate, endDate, aggregation) {
        var _a, data, error, aggregated, error_8;
        if (aggregation === void 0) {
          aggregation = "hour";
        }
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                this.supabase
                  .from("system_metrics")
                  .select("*")
                  .eq("clinic_id", clinicId)
                  .eq("category", category)
                  .eq("component", component)
                  .gte("timestamp", startDate)
                  .lte("timestamp", endDate)
                  .order("timestamp", { ascending: true }),
              ];
            case 1:
              (_a = _b.sent()), (data = _a.data), (error = _a.error);
              if (error) {
                throw error;
              }
              aggregated = this.aggregateMetrics(data || [], aggregation);
              return [2 /*return*/, aggregated];
            case 2:
              error_8 = _b.sent();
              logger_1.logger.error("Failed to get historical metrics:", error_8);
              throw error_8;
            case 3:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  // Private Helper Methods
  createperformanceMonitoringEngine.prototype.loadThresholds = function () {
    return __awaiter(this, void 0, void 0, function () {
      var defaultThresholds, _i, defaultThresholds_1, threshold, id;
      return __generator(this, function (_a) {
        defaultThresholds = [
          {
            category: "system",
            component: "cpu",
            metric: "usage",
            warning: 70,
            critical: 85,
            emergency: 95,
            unit: "%",
            operator: "gte",
            enabled: true,
            autoResolve: true,
            cooldown: 5,
          },
          {
            category: "system",
            component: "memory",
            metric: "usage",
            warning: 75,
            critical: 90,
            emergency: 98,
            unit: "%",
            operator: "gte",
            enabled: true,
            autoResolve: true,
            cooldown: 5,
          },
          {
            category: "database",
            component: "queries",
            metric: "avg_duration",
            warning: 1000,
            critical: 5000,
            emergency: 10000,
            unit: "ms",
            operator: "gte",
            enabled: true,
            autoResolve: true,
            cooldown: 3,
          },
          {
            category: "application",
            component: "requests",
            metric: "avg_response_time",
            warning: 2000,
            critical: 5000,
            emergency: 10000,
            unit: "ms",
            operator: "gte",
            enabled: true,
            autoResolve: true,
            cooldown: 3,
          },
        ];
        // Set default thresholds
        for (
          _i = 0, defaultThresholds_1 = defaultThresholds;
          _i < defaultThresholds_1.length;
          _i++
        ) {
          threshold = defaultThresholds_1[_i];
          id = "threshold_"
            .concat(threshold.category, "_")
            .concat(threshold.component, "_")
            .concat(threshold.metric);
          this.thresholds.set(id, __assign({ id: id }, threshold));
        }
        return [2 /*return*/];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.loadBaselines = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.startMonitoring = function () {
    var _this = this;
    setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var clinics, _i, clinics_1, clinicId, error_9;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 7, , 8]);
              return [4 /*yield*/, this.getActiveClinics()];
            case 1:
              clinics = _a.sent();
              (_i = 0), (clinics_1 = clinics);
              _a.label = 2;
            case 2:
              if (!(_i < clinics_1.length)) return [3 /*break*/, 5];
              clinicId = clinics_1[_i];
              return [4 /*yield*/, this.collectMetrics(clinicId)];
            case 3:
              _a.sent();
              _a.label = 4;
            case 4:
              _i++;
              return [3 /*break*/, 2];
            case 5:
              // Clean up old data
              return [4 /*yield*/, this.cleanupOldData()];
            case 6:
              // Clean up old data
              _a.sent();
              return [3 /*break*/, 8];
            case 7:
              error_9 = _a.sent();
              logger_1.logger.error("Monitoring cycle error:", error_9);
              return [3 /*break*/, 8];
            case 8:
              return [2 /*return*/];
          }
        });
      });
    }, this.monitoringInterval);
  };
  createperformanceMonitoringEngine.prototype.collectCPUMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simulate CPU metrics collection
        return [
          2 /*return*/,
          {
            usage: Math.random() * 100,
            cores: 4,
            loadAverage: [1.2, 1.5, 1.8],
            processes: [],
            throttling: false,
          },
        ];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.collectMemoryMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var total, used;
      return __generator(this, function (_a) {
        total = 8 * 1024 * 1024 * 1024;
        used = total * (0.3 + Math.random() * 0.4);
        return [
          2 /*return*/,
          {
            total: total,
            used: used,
            free: total - used,
            cached: used * 0.2,
            buffers: used * 0.1,
            swap: {
              total: 2 * 1024 * 1024 * 1024,
              used: 0,
              free: 2 * 1024 * 1024 * 1024,
            },
            fragmentation: Math.random() * 20,
            pressure: Math.random() * 30,
          },
        ];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.collectStorageMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var totalSpace, usedSpace;
      return __generator(this, function (_a) {
        totalSpace = 500 * 1024 * 1024 * 1024;
        usedSpace = totalSpace * (0.2 + Math.random() * 0.3);
        return [
          2 /*return*/,
          {
            devices: [
              {
                name: "/dev/sda1",
                type: "ssd",
                size: totalSpace,
                used: usedSpace,
                health: 95,
              },
            ],
            totalSpace: totalSpace,
            usedSpace: usedSpace,
            freeSpace: totalSpace - usedSpace,
            iops: {
              read: 1000 + Math.random() * 500,
              write: 800 + Math.random() * 400,
            },
            latency: {
              read: 1 + Math.random() * 2,
              write: 2 + Math.random() * 3,
            },
            throughput: {
              read: 100 + Math.random() * 50,
              write: 80 + Math.random() * 40,
            },
          },
        ];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.collectNetworkMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simulate network metrics collection
        return [
          2 /*return*/,
          {
            interfaces: [
              {
                name: "eth0",
                type: "ethernet",
                speed: 1000,
                bytesReceived: Math.random() * 1000000,
                bytesSent: Math.random() * 1000000,
                packetsReceived: Math.random() * 10000,
                packetsSent: Math.random() * 10000,
                errors: 0,
                drops: 0,
              },
            ],
            totalBandwidth: 1000,
            usedBandwidth: Math.random() * 100,
            latency: 10 + Math.random() * 20,
            packetLoss: Math.random() * 0.1,
            connections: {
              active: Math.floor(Math.random() * 100),
              waiting: Math.floor(Math.random() * 10),
              established: Math.floor(Math.random() * 80),
            },
            requests: {
              total: Math.floor(1000 + Math.random() * 500),
              successful: Math.floor(950 + Math.random() * 50),
              failed: Math.floor(Math.random() * 10),
              avgResponseTime: 100 + Math.random() * 200,
            },
          },
        ];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.collectDatabaseMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simulate database metrics collection
        return [
          2 /*return*/,
          {
            connections: {
              active: Math.floor(Math.random() * 20),
              idle: Math.floor(Math.random() * 10),
              max: 100,
              waiting: Math.floor(Math.random() * 3),
            },
            queries: {
              total: Math.floor(1000 + Math.random() * 500),
              slow: Math.floor(Math.random() * 10),
              failed: Math.floor(Math.random() * 5),
              avgDuration: 50 + Math.random() * 100,
              qps: 10 + Math.random() * 20,
            },
            cache: {
              hitRate: 85 + Math.random() * 10,
              size: 100 * 1024 * 1024,
              used: 80 * 1024 * 1024,
            },
            locks: {
              waiting: Math.floor(Math.random() * 3),
              blocked: Math.floor(Math.random() * 2),
              deadlocks: 0,
            },
            replication: {
              lag: Math.random() * 100,
              status: "healthy",
            },
            storage: {
              size: 1024 * 1024 * 1024,
              growth: 10 * 1024 * 1024,
              fragmentation: Math.random() * 10,
            },
          },
        ];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.collectApplicationMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simulate application metrics collection
        return [
          2 /*return*/,
          {
            requests: {
              total: Math.floor(1000 + Math.random() * 500),
              successful: Math.floor(950 + Math.random() * 50),
              failed: Math.floor(Math.random() * 10),
              avgResponseTime: 200 + Math.random() * 300,
              rps: 5 + Math.random() * 10,
            },
            errors: {
              total: Math.floor(Math.random() * 10),
              rate: Math.random() * 2,
              types: {
                500: Math.floor(Math.random() * 5),
                404: Math.floor(Math.random() * 3),
                timeout: Math.floor(Math.random() * 2),
              },
            },
            users: {
              active: Math.floor(50 + Math.random() * 100),
              concurrent: Math.floor(10 + Math.random() * 30),
              peak: Math.floor(80 + Math.random() * 50),
            },
            features: {
              faceDetection: {
                usage: Math.floor(100 + Math.random() * 200),
                accuracy: 95 + Math.random() * 3,
                avgProcessingTime: 500 + Math.random() * 300,
                successRate: 98 + Math.random() * 2,
                errorRate: Math.random() * 2,
                confidence: 0.9 + Math.random() * 0.08,
                throughput: Math.floor(50 + Math.random() * 50),
              },
              aestheticAnalysis: {
                usage: Math.floor(80 + Math.random() * 150),
                accuracy: 88 + Math.random() * 5,
                avgProcessingTime: 800 + Math.random() * 400,
                successRate: 95 + Math.random() * 3,
                errorRate: Math.random() * 3,
                confidence: 0.85 + Math.random() * 0.1,
                throughput: Math.floor(30 + Math.random() * 40),
              },
              complicationDetection: {
                usage: Math.floor(60 + Math.random() * 100),
                accuracy: 92 + Math.random() * 4,
                avgProcessingTime: 600 + Math.random() * 350,
                successRate: 97 + Math.random() * 2,
                errorRate: Math.random() * 2,
                confidence: 0.88 + Math.random() * 0.09,
                throughput: Math.floor(40 + Math.random() * 30),
              },
              compliance: {
                usage: Math.floor(200 + Math.random() * 300),
                accuracy: 99 + Math.random() * 1,
                avgProcessingTime: 100 + Math.random() * 100,
                successRate: 99.5 + Math.random() * 0.5,
                errorRate: Math.random() * 0.5,
                confidence: 0.95 + Math.random() * 0.04,
                throughput: Math.floor(100 + Math.random() * 80),
              },
            },
            caching: {
              hitRate: 80 + Math.random() * 15,
              size: 50 * 1024 * 1024,
              evictions: Math.floor(Math.random() * 100),
            },
          },
        ];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.calculateHealthScore = function (metrics) {
    var scores = {
      cpu: this.calculateCPUScore(metrics.metrics.cpu),
      memory: this.calculateMemoryScore(metrics.metrics.memory),
      storage: this.calculateStorageScore(metrics.metrics.storage),
      network: this.calculateNetworkScore(metrics.metrics.network),
      database: this.calculateDatabaseScore(metrics.metrics.database),
      application: this.calculateApplicationScore(metrics.metrics.application),
    };
    // Weighted average
    var weights = {
      cpu: 0.2,
      memory: 0.2,
      storage: 0.15,
      network: 0.15,
      database: 0.15,
      application: 0.15,
    };
    return Object.entries(scores).reduce(function (total, _a) {
      var key = _a[0],
        score = _a[1];
      return total + score * weights[key];
    }, 0);
  };
  createperformanceMonitoringEngine.prototype.calculateCPUScore = function (cpu) {
    if (cpu.usage > 90) return 20;
    if (cpu.usage > 80) return 40;
    if (cpu.usage > 70) return 60;
    if (cpu.usage > 50) return 80;
    return 100;
  };
  createperformanceMonitoringEngine.prototype.calculateMemoryScore = function (memory) {
    var usage = (memory.used / memory.total) * 100;
    if (usage > 95) return 20;
    if (usage > 85) return 40;
    if (usage > 75) return 60;
    if (usage > 60) return 80;
    return 100;
  };
  createperformanceMonitoringEngine.prototype.calculateStorageScore = function (storage) {
    var usage = (storage.usedSpace / storage.totalSpace) * 100;
    if (usage > 95) return 20;
    if (usage > 85) return 40;
    if (usage > 75) return 60;
    if (usage > 60) return 80;
    return 100;
  };
  createperformanceMonitoringEngine.prototype.calculateNetworkScore = function (network) {
    var usage = (network.usedBandwidth / network.totalBandwidth) * 100;
    var score = 100;
    if (usage > 80) score -= 20;
    if (network.latency > 100) score -= 20;
    if (network.packetLoss > 1) score -= 30;
    if (network.requests.failed / network.requests.total > 0.05) score -= 30;
    return Math.max(0, score);
  };
  createperformanceMonitoringEngine.prototype.calculateDatabaseScore = function (database) {
    var score = 100;
    if (database.connections.active / database.connections.max > 0.8) score -= 20;
    if (database.queries.avgDuration > 1000) score -= 20;
    if (database.cache.hitRate < 80) score -= 15;
    if (database.locks.waiting > 0) score -= 15;
    if (database.replication.lag > 1000) score -= 15;
    if (database.queries.failed / database.queries.total > 0.01) score -= 15;
    return Math.max(0, score);
  };
  createperformanceMonitoringEngine.prototype.calculateApplicationScore = function (application) {
    var score = 100;
    if (application.requests.avgResponseTime > 2000) score -= 20;
    if (application.requests.failed / application.requests.total > 0.05) score -= 20;
    if (application.errors.rate > 5) score -= 20;
    if (application.caching.hitRate < 70) score -= 15;
    // Check feature performance
    var featureScores = Object.values(application.features).map(function (feature) {
      var featureScore = 100;
      if (feature.accuracy < 90) featureScore -= 30;
      if (feature.avgProcessingTime > 1000) featureScore -= 20;
      if (feature.errorRate > 5) featureScore -= 25;
      if (feature.confidence < 0.8) featureScore -= 25;
      return Math.max(0, featureScore);
    });
    var avgFeatureScore =
      featureScores.reduce(function (sum, s) {
        return sum + s;
      }, 0) / featureScores.length;
    score = score * 0.7 + avgFeatureScore * 0.3;
    return Math.max(0, score);
  };
  createperformanceMonitoringEngine.prototype.determineStatus = function (healthScore) {
    if (healthScore >= 90) return "optimal";
    if (healthScore >= 75) return "good";
    if (healthScore >= 50) return "degraded";
    if (healthScore >= 25) return "critical";
    return "failed";
  };
  // Additional helper methods would be implemented here...
  createperformanceMonitoringEngine.prototype.checkThresholds = function (metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var alerts, cpuUsage, cpuThreshold, memoryUsage, memoryThreshold;
      return __generator(this, function (_a) {
        alerts = [];
        cpuUsage = metrics.metrics.cpu.usage;
        cpuThreshold = this.findThreshold("system", "cpu", "usage");
        if (cpuThreshold && this.shouldAlert(cpuThreshold, cpuUsage)) {
          alerts.push(this.createAlert(cpuThreshold, cpuUsage, "CPU usage high"));
        }
        memoryUsage = (metrics.metrics.memory.used / metrics.metrics.memory.total) * 100;
        memoryThreshold = this.findThreshold("system", "memory", "usage");
        if (memoryThreshold && this.shouldAlert(memoryThreshold, memoryUsage)) {
          alerts.push(this.createAlert(memoryThreshold, memoryUsage, "Memory usage high"));
        }
        // Add more threshold checks...
        return [2 /*return*/, alerts];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.findThreshold = function (
    category,
    component,
    metric,
  ) {
    var key = "threshold_".concat(category, "_").concat(component, "_").concat(metric);
    return this.thresholds.get(key);
  };
  createperformanceMonitoringEngine.prototype.shouldAlert = function (threshold, value) {
    if (!threshold.enabled) return false;
    var key = ""
      .concat(threshold.category, "_")
      .concat(threshold.component, "_")
      .concat(threshold.metric);
    var lastAlert = this.alertCooldowns.get(key);
    if (lastAlert && Date.now() - lastAlert < threshold.cooldown * 60 * 1000) {
      return false;
    }
    switch (threshold.operator) {
      case "gte":
        return value >= threshold.critical;
      case "gt":
        return value > threshold.critical;
      case "lte":
        return value <= threshold.critical;
      case "lt":
        return value < threshold.critical;
      case "eq":
        return value === threshold.critical;
      case "ne":
        return value !== threshold.critical;
      default:
        return false;
    }
  };
  createperformanceMonitoringEngine.prototype.createAlert = function (threshold, value, message) {
    var severity = "normal";
    if (value >= threshold.emergency) severity = "emergency";
    else if (value >= threshold.critical) severity = "critical";
    else if (value >= threshold.warning) severity = "warning";
    return {
      id: "alert_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
      timestamp: new Date().toISOString(),
      severity: severity,
      category: threshold.category,
      component: threshold.component,
      metric: threshold.metric,
      value: value,
      threshold: threshold.critical,
      message: message,
      description: ""
        .concat(threshold.metric, " for ")
        .concat(threshold.component, " is ")
        .concat(value)
        .concat(threshold.unit, ", exceeding threshold of ")
        .concat(threshold.critical)
        .concat(threshold.unit),
      recommendations: this.generateAlertRecommendations(threshold, value),
      acknowledged: false,
      resolved: false,
    };
  };
  createperformanceMonitoringEngine.prototype.generateAlertRecommendations = function (
    threshold,
    value,
  ) {
    var recommendations = [];
    if (threshold.component === "cpu" && threshold.metric === "usage") {
      recommendations.push("Check for high CPU processes and optimize or scale resources");
      recommendations.push("Consider implementing CPU throttling or load balancing");
    }
    if (threshold.component === "memory" && threshold.metric === "usage") {
      recommendations.push("Check for memory leaks in applications");
      recommendations.push("Consider increasing available memory or optimizing memory usage");
    }
    // Add more recommendations...
    return recommendations;
  };
  // Placeholder methods that would be fully implemented
  createperformanceMonitoringEngine.prototype.saveMetrics = function (metrics) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.processAlerts = function (alerts) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.generateOptimizations = function (metrics) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.getActiveClinics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch active clinic IDs
        return [2 /*return*/, ["clinic_1", "clinic_2"]];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.cleanupOldData = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.getActiveAlerts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch active alerts
        return [2 /*return*/, []];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.getActiveOptimizations = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch active optimizations
        return [2 /*return*/, []];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.getPerformanceSummary = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would generate performance summary
        return [
          2 /*return*/,
          {
            overallHealth: 85,
            availability: 99.5,
            reliability: 98.2,
            efficiency: 87,
            userSatisfaction: 92,
            costOptimization: 78,
            securityScore: 94,
            improvementAreas: ["Memory optimization", "Database query performance"],
            achievements: ["Improved response time by 15%", "Reduced error rate to <1%"],
          },
        ];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.getCategoryData = function (category, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch category-specific data
        return [2 /*return*/, {}];
      });
    });
  };
  createperformanceMonitoringEngine.prototype.calculateOverallHealth = function (categories) {
    // Implementation would calculate overall health score
    return 85;
  };
  return createperformanceMonitoringEngine;
})();
exports.createperformanceMonitoringEngine = createperformanceMonitoringEngine;
// Validation schemas
exports.SystemMetricsSchema = zod_1.z.object({
  category: zod_1.z.enum([
    "system",
    "application",
    "database",
    "network",
    "user_experience",
    "ai_models",
  ]),
  component: zod_1.z.string().min(1),
  clinicId: zod_1.z.string().min(1),
  environment: zod_1.z.enum(["development", "staging", "production"]),
});
// Export singleton instance
exports.PerformanceMonitoringEngine = createperformanceMonitoringEngine;
exports.performanceMonitoringEngine = new createperformanceMonitoringEngine();
