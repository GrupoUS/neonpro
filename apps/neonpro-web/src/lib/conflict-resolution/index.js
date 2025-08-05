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
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
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
exports.ResourceOptimizer =
  exports.ResolutionEngine =
  exports.ConflictDetector =
  exports.IntelligentConflictResolutionSystem =
    void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var conflict_detector_1 = require("./conflict-detector");
var resolution_engine_1 = require("./resolution-engine");
var resource_optimizer_1 = require("./resource-optimizer");
var types_1 = require("./types");
/**
 * Unified Intelligent Conflict Resolution System
 *
 * This system provides comprehensive conflict detection, resolution, and resource optimization
 * for healthcare scheduling and resource management.
 */
var IntelligentConflictResolutionSystem = /** @class */ (function () {
  function IntelligentConflictResolutionSystem(
    supabaseUrl,
    supabaseKey,
    config,
    constraints,
    automationSettings,
  ) {
    this.analyticsCache = new Map();
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    // Default configuration
    this.config = __assign(
      {
        weights: {
          patientSatisfaction: 0.3,
          staffWorkload: 0.25,
          resourceUtilization: 0.2,
          operationalEfficiency: 0.15,
          financialImpact: 0.1,
        },
        thresholds: {
          conflictSeverity: 0.7,
          autoResolutionConfidence: 0.8,
          resourceUtilization: 0.85,
        },
      },
      config,
    );
    // Default constraints
    this.constraints = __assign(
      {
        maxStaffUtilization: 0.9,
        minStaffUtilization: 0.4,
        maxRoomUtilization: 0.95,
        minRoomUtilization: 0.3,
        maxEquipmentUtilization: 0.9,
        minEquipmentUtilization: 0.2,
        businessHours: {
          start: "08:00",
          end: "18:00",
        },
        maxOvertimeHours: 2,
        minBufferTime: 15,
        maxReschedulingWindow: 7,
      },
      constraints,
    );
    // Default automation settings
    this.automationSettings = __assign(
      {
        autoDetection: true,
        autoResolution: false,
        autoOptimization: false,
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: false,
          inAppNotifications: true,
        },
        escalationRules: {
          highSeverityThreshold: 0.8,
          escalationDelay: 30,
          maxAutoAttempts: 3,
        },
      },
      automationSettings,
    );
    // Initialize components
    this.conflictDetector = new conflict_detector_1.ConflictDetector(
      supabaseUrl,
      supabaseKey,
      this.config,
      this.constraints,
    );
    this.resolutionEngine = new resolution_engine_1.ResolutionEngine(
      supabaseUrl,
      supabaseKey,
      this.config,
      this.constraints,
    );
    this.resourceOptimizer = new resource_optimizer_1.ResourceOptimizer(
      supabaseUrl,
      supabaseKey,
      this.config,
      this.constraints,
    );
    // Initialize performance metrics
    this.performanceMetrics = {
      conflictsDetected: 0,
      conflictsResolved: 0,
      averageResolutionTime: 0,
      successRate: 0,
      optimizationsApplied: 0,
      systemUptime: Date.now(),
      lastUpdated: new Date(),
    };
    // Start automated processes if enabled
    if (this.automationSettings.autoDetection) {
      this.startAutomatedConflictDetection();
    }
  }
  /**
   * Comprehensive conflict detection and resolution workflow
   */
  IntelligentConflictResolutionSystem.prototype.detectAndResolveConflicts = function (
    startDate_1,
    endDate_1,
  ) {
    return __awaiter(this, arguments, void 0, function (startDate, endDate, autoResolve) {
      var start,
        end,
        conflicts,
        startTime,
        resolutions,
        appliedResolutions,
        _i,
        conflicts_1,
        conflict,
        conflictResolutions,
        bestResolution,
        result,
        error_1,
        optimizations,
        executionTime,
        error_2;
      if (autoResolve === void 0) {
        autoResolve = false;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            start = startDate || new Date();
            end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 11, , 12]);
            return [4 /*yield*/, this.conflictDetector.detectConflicts(start, end)];
          case 2:
            conflicts = _a.sent();
            if (conflicts.length === 0) {
              return [
                2 /*return*/,
                {
                  success: true,
                  conflictsDetected: 0,
                  conflictsResolved: 0,
                  conflicts: [],
                  resolutions: [],
                  optimizations: [],
                  executionTime: 0,
                  timestamp: new Date(),
                },
              ];
            }
            startTime = Date.now();
            resolutions = [];
            appliedResolutions = [];
            (_i = 0), (conflicts_1 = conflicts);
            _a.label = 3;
          case 3:
            if (!(_i < conflicts_1.length)) return [3 /*break*/, 9];
            conflict = conflicts_1[_i];
            return [4 /*yield*/, this.resolutionEngine.generateResolutions(conflict)];
          case 4:
            conflictResolutions = _a.sent();
            resolutions.push.apply(resolutions, conflictResolutions);
            if (!(autoResolve && this.shouldAutoResolve(conflictResolutions)))
              return [3 /*break*/, 8];
            bestResolution = conflictResolutions[0];
            _a.label = 5;
          case 5:
            _a.trys.push([5, 7, , 8]);
            return [4 /*yield*/, this.resolutionEngine.applyResolution(bestResolution.id)];
          case 6:
            result = _a.sent();
            appliedResolutions.push(result);
            this.performanceMetrics.conflictsResolved++;
            return [3 /*break*/, 8];
          case 7:
            error_1 = _a.sent();
            console.error("Failed to auto-resolve conflict ".concat(conflict.id, ":"), error_1);
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 3];
          case 9:
            return [4 /*yield*/, this.generateSystemOptimizations(start, end)];
          case 10:
            optimizations = _a.sent();
            // Update performance metrics
            this.performanceMetrics.conflictsDetected += conflicts.length;
            this.performanceMetrics.averageResolutionTime = this.calculateAverageResolutionTime();
            this.performanceMetrics.successRate = this.calculateSuccessRate();
            this.performanceMetrics.lastUpdated = new Date();
            executionTime = Date.now() - startTime;
            return [
              2 /*return*/,
              {
                success: true,
                conflictsDetected: conflicts.length,
                conflictsResolved: appliedResolutions.length,
                conflicts: conflicts,
                resolutions: resolutions,
                appliedResolutions: appliedResolutions,
                optimizations: optimizations,
                executionTime: executionTime,
                timestamp: new Date(),
              },
            ];
          case 11:
            error_2 = _a.sent();
            console.error("Error in conflict detection and resolution:", error_2);
            throw error_2;
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Detect conflicts only
   */
  IntelligentConflictResolutionSystem.prototype.detectConflicts = function (
    startDate,
    endDate,
    conflictTypes,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var start, end;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            start = startDate || new Date();
            end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            return [4 /*yield*/, this.conflictDetector.detectConflicts(start, end, conflictTypes)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Generate resolutions for a specific conflict
   */
  IntelligentConflictResolutionSystem.prototype.generateResolutions = function (
    conflictId,
    strategies,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var conflict;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getConflictById(conflictId)];
          case 1:
            conflict = _a.sent();
            if (!conflict) {
              throw new Error("Conflict ".concat(conflictId, " not found"));
            }
            return [4 /*yield*/, this.resolutionEngine.generateResolutions(conflict, strategies)];
          case 2:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Apply a specific resolution
   */
  IntelligentConflictResolutionSystem.prototype.applyResolution = function (resolutionId) {
    return __awaiter(this, void 0, void 0, function () {
      var result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.resolutionEngine.applyResolution(resolutionId)];
          case 1:
            result = _a.sent();
            this.performanceMetrics.conflictsResolved++;
            this.performanceMetrics.lastUpdated = new Date();
            return [2 /*return*/, result];
        }
      });
    });
  };
  /**
   * Optimize resources for a time period
   */
  IntelligentConflictResolutionSystem.prototype.optimizeResources = function (
    startDate_1,
    endDate_1,
  ) {
    return __awaiter(this, arguments, void 0, function (startDate, endDate, strategy) {
      if (strategy === void 0) {
        strategy = types_1.OptimizationStrategy.BALANCED;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.resourceOptimizer.optimizeResources(startDate, endDate, strategy),
            ];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Balance workload across staff
   */
  IntelligentConflictResolutionSystem.prototype.balanceWorkload = function (
    startDate_1,
    endDate_1,
  ) {
    return __awaiter(this, arguments, void 0, function (startDate, endDate, targetUtilization) {
      if (targetUtilization === void 0) {
        targetUtilization = 0.8;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.resourceOptimizer.balanceWorkload(startDate, endDate, targetUtilization),
            ];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Apply resource optimization
   */
  IntelligentConflictResolutionSystem.prototype.applyOptimization = function (optimizationId) {
    return __awaiter(this, void 0, void 0, function () {
      var result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.resourceOptimizer.applyOptimization(optimizationId)];
          case 1:
            result = _a.sent();
            this.performanceMetrics.optimizationsApplied++;
            this.performanceMetrics.lastUpdated = new Date();
            return [2 /*return*/, result];
        }
      });
    });
  };
  /**
   * Get comprehensive system analytics
   */
  IntelligentConflictResolutionSystem.prototype.getSystemAnalytics = function (
    startDate_1,
    endDate_1,
  ) {
    return __awaiter(this, arguments, void 0, function (startDate, endDate, includeForecasting) {
      var cacheKey,
        conflictAnalytics,
        resolutionAnalytics,
        optimizationAnalytics,
        resourceMetrics,
        forecasting,
        analytics,
        error_3;
      var _a;
      if (includeForecasting === void 0) {
        includeForecasting = true;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "analytics-"
              .concat(startDate.toISOString(), "-")
              .concat(endDate.toISOString(), "-")
              .concat(includeForecasting);
            if (this.analyticsCache.has(cacheKey)) {
              return [2 /*return*/, this.analyticsCache.get(cacheKey)];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 10, , 11]);
            return [4 /*yield*/, this.getConflictAnalytics(startDate, endDate)];
          case 2:
            conflictAnalytics = _b.sent();
            return [4 /*yield*/, this.getResolutionAnalytics(startDate, endDate)];
          case 3:
            resolutionAnalytics = _b.sent();
            return [4 /*yield*/, this.getOptimizationAnalytics(startDate, endDate)];
          case 4:
            optimizationAnalytics = _b.sent();
            return [
              4 /*yield*/,
              this.resourceOptimizer.calculateResourceMetrics(startDate, endDate),
            ];
          case 5:
            resourceMetrics = _b.sent();
            forecasting = null;
            if (!includeForecasting) return [3 /*break*/, 7];
            return [4 /*yield*/, this.generateForecasting(startDate, endDate)];
          case 6:
            forecasting = _b.sent();
            _b.label = 7;
          case 7:
            _a = {
              period: { start: startDate, end: endDate },
              conflictAnalytics: conflictAnalytics,
              resolutionAnalytics: resolutionAnalytics,
              optimizationAnalytics: optimizationAnalytics,
              resourceMetrics: resourceMetrics,
              performanceMetrics: this.performanceMetrics,
              forecasting: forecasting,
            };
            return [4 /*yield*/, this.calculateTrends(startDate, endDate)];
          case 8:
            _a.trends = _b.sent();
            return [4 /*yield*/, this.generateSystemRecommendations()];
          case 9:
            analytics = ((_a.recommendations = _b.sent()), (_a.generatedAt = new Date()), _a);
            this.analyticsCache.set(cacheKey, analytics);
            return [2 /*return*/, analytics];
          case 10:
            error_3 = _b.sent();
            console.error("Error generating system analytics:", error_3);
            throw error_3;
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get current performance metrics
   */
  IntelligentConflictResolutionSystem.prototype.getPerformanceMetrics = function () {
    return __assign(__assign({}, this.performanceMetrics), {
      systemUptime: Date.now() - this.performanceMetrics.systemUptime,
    });
  };
  /**
   * Update system configuration
   */
  IntelligentConflictResolutionSystem.prototype.updateConfiguration = function (
    config,
    constraints,
    automationSettings,
  ) {
    if (config) {
      this.config = __assign(__assign({}, this.config), config);
      this.conflictDetector.updateConfig(config);
      this.resolutionEngine.updateConfig(config);
      this.resourceOptimizer.updateConfig(config);
    }
    if (constraints) {
      this.constraints = __assign(__assign({}, this.constraints), constraints);
      this.conflictDetector.updateConstraints(constraints);
      this.resolutionEngine.updateConstraints(constraints);
      this.resourceOptimizer.updateConstraints(constraints);
    }
    if (automationSettings) {
      this.automationSettings = __assign(__assign({}, this.automationSettings), automationSettings);
      // Restart automation if settings changed
      if (automationSettings.autoDetection !== undefined) {
        if (automationSettings.autoDetection) {
          this.startAutomatedConflictDetection();
        } else {
          this.stopAutomatedConflictDetection();
        }
      }
    }
    // Clear caches
    this.clearAllCaches();
  };
  /**
   * Start automated conflict detection
   */
  IntelligentConflictResolutionSystem.prototype.startAutomatedConflictDetection = function () {
    var _this = this;
    // Run every 30 minutes
    setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          var error_4;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [
                  4 /*yield*/,
                  this.detectAndResolveConflicts(
                    new Date(),
                    new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
                    this.automationSettings.autoResolution,
                  ),
                ];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_4 = _a.sent();
                console.error("Error in automated conflict detection:", error_4);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      },
      30 * 60 * 1000,
    );
  };
  /**
   * Stop automated conflict detection
   */
  IntelligentConflictResolutionSystem.prototype.stopAutomatedConflictDetection = function () {
    // Implementation would clear the interval
    // This is a simplified version
  };
  /**
   * Generate system-wide optimizations
   */
  IntelligentConflictResolutionSystem.prototype.generateSystemOptimizations = function (
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var optimizations, resourceOpt, workloadBalance, workloadOpt;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            optimizations = [];
            return [
              4 /*yield*/,
              this.resourceOptimizer.optimizeResources(
                startDate,
                endDate,
                types_1.OptimizationStrategy.BALANCED,
              ),
            ];
          case 1:
            resourceOpt = _b.sent();
            optimizations.push(resourceOpt);
            return [4 /*yield*/, this.resourceOptimizer.balanceWorkload(startDate, endDate)];
          case 2:
            workloadBalance = _b.sent();
            if (!(workloadBalance.balancingActions.length > 0)) return [3 /*break*/, 5];
            _a = {
              id: workloadBalance.id,
              period: workloadBalance.period,
              strategy: types_1.OptimizationStrategy.BALANCED,
            };
            return [
              4 /*yield*/,
              this.resourceOptimizer.calculateResourceMetrics(startDate, endDate),
            ];
          case 3:
            (_a.currentMetrics = _b.sent()), (_a.recommendations = []);
            return [
              4 /*yield*/,
              this.resourceOptimizer.calculateResourceMetrics(startDate, endDate),
            ];
          case 4:
            workloadOpt =
              ((_a.expectedImprovements = _b.sent()),
              (_a.confidence = workloadBalance.confidence),
              (_a.estimatedImplementationTime = workloadBalance.estimatedTime),
              (_a.createdAt = workloadBalance.createdAt),
              (_a.status = "pending"),
              _a);
            optimizations.push(workloadOpt);
            _b.label = 5;
          case 5:
            return [2 /*return*/, optimizations];
        }
      });
    });
  };
  /**
   * Determine if a conflict should be auto-resolved
   */
  IntelligentConflictResolutionSystem.prototype.shouldAutoResolve = function (resolutions) {
    if (!this.automationSettings.autoResolution || resolutions.length === 0) {
      return false;
    }
    var bestResolution = resolutions[0];
    return (
      bestResolution.confidence >= this.config.thresholds.autoResolutionConfidence &&
      bestResolution.feasibility >= 0.8
    );
  };
  /**
   * Calculate average resolution time
   */
  IntelligentConflictResolutionSystem.prototype.calculateAverageResolutionTime = function () {
    // Simplified implementation
    return 15; // minutes
  };
  /**
   * Calculate success rate
   */
  IntelligentConflictResolutionSystem.prototype.calculateSuccessRate = function () {
    if (this.performanceMetrics.conflictsDetected === 0) return 1.0;
    return this.performanceMetrics.conflictsResolved / this.performanceMetrics.conflictsDetected;
  };
  /**
   * Get conflict analytics
   */
  IntelligentConflictResolutionSystem.prototype.getConflictAnalytics = function (
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze conflict patterns, types, frequencies, etc.
        return [
          2 /*return*/,
          {
            totalConflicts: 0,
            conflictsByType: {},
            conflictsBySeverity: {},
            averageResolutionTime: 0,
            mostCommonConflictType: null,
            peakConflictTimes: [],
          },
        ];
      });
    });
  };
  /**
   * Get resolution analytics
   */
  IntelligentConflictResolutionSystem.prototype.getResolutionAnalytics = function (
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze resolution effectiveness, strategies used, etc.
        return [
          2 /*return*/,
          {
            totalResolutions: 0,
            resolutionsByStrategy: {},
            averageConfidence: 0,
            successRate: 0,
            mostEffectiveStrategy: null,
            averageImplementationTime: 0,
          },
        ];
      });
    });
  };
  /**
   * Get optimization analytics
   */
  IntelligentConflictResolutionSystem.prototype.getOptimizationAnalytics = function (
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze optimization impact, ROI, etc.
        return [
          2 /*return*/,
          {
            totalOptimizations: 0,
            optimizationsByType: {},
            averageImpact: 0,
            roi: 0,
            mostImpactfulOptimization: null,
            cumulativeImprovements: {},
          },
        ];
      });
    });
  };
  /**
   * Generate forecasting
   */
  IntelligentConflictResolutionSystem.prototype.generateForecasting = function (
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would use historical data to predict future conflicts and resource needs
        return [
          2 /*return*/,
          {
            predictedConflicts: [],
            resourceDemandForecast: {},
            recommendedPreventiveMeasures: [],
            confidenceLevel: 0.75,
          },
        ];
      });
    });
  };
  /**
   * Calculate trends
   */
  IntelligentConflictResolutionSystem.prototype.calculateTrends = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze trends in conflicts, resolutions, and optimizations
        return [
          2 /*return*/,
          {
            conflictTrends: {},
            resolutionTrends: {},
            optimizationTrends: {},
            seasonalPatterns: {},
            emergingIssues: [],
          },
        ];
      });
    });
  };
  /**
   * Generate system recommendations
   */
  IntelligentConflictResolutionSystem.prototype.generateSystemRecommendations = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would analyze system performance and suggest improvements
        return [2 /*return*/, []];
      });
    });
  };
  /**
   * Get conflict by ID
   */
  IntelligentConflictResolutionSystem.prototype.getConflictById = function (conflictId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would fetch from database
        return [2 /*return*/, null];
      });
    });
  };
  /**
   * Clear all caches
   */
  IntelligentConflictResolutionSystem.prototype.clearAllCaches = function () {
    this.analyticsCache.clear();
    this.conflictDetector.clearCache();
    this.resolutionEngine.clearCache();
    this.resourceOptimizer.clearCache();
  };
  /**
   * Health check for the system
   */
  IntelligentConflictResolutionSystem.prototype.healthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var dbError, dbHealthy, components, allHealthy, mostlyHealthy, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("appointments").select("count").limit(1)];
          case 1:
            dbError = _a.sent().error;
            dbHealthy = !dbError;
            components = {
              database: dbHealthy,
              conflictDetector: true, // Would implement actual health checks
              resolutionEngine: true,
              resourceOptimizer: true,
              automation: this.automationSettings.autoDetection,
            };
            allHealthy = Object.values(components).every(Boolean);
            mostlyHealthy = Object.values(components).filter(Boolean).length >= 3;
            return [
              2 /*return*/,
              {
                status: allHealthy ? "healthy" : mostlyHealthy ? "degraded" : "unhealthy",
                components: components,
                lastCheck: new Date(),
              },
            ];
          case 2:
            error_5 = _a.sent();
            return [
              2 /*return*/,
              {
                status: "unhealthy",
                components: {
                  database: false,
                  conflictDetector: false,
                  resolutionEngine: false,
                  resourceOptimizer: false,
                  automation: false,
                },
                lastCheck: new Date(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return IntelligentConflictResolutionSystem;
})();
exports.IntelligentConflictResolutionSystem = IntelligentConflictResolutionSystem;
// Export all types and classes
__exportStar(require("./types"), exports);
var conflict_detector_2 = require("./conflict-detector");
Object.defineProperty(exports, "ConflictDetector", {
  enumerable: true,
  get: function () {
    return conflict_detector_2.ConflictDetector;
  },
});
var resolution_engine_2 = require("./resolution-engine");
Object.defineProperty(exports, "ResolutionEngine", {
  enumerable: true,
  get: function () {
    return resolution_engine_2.ResolutionEngine;
  },
});
var resource_optimizer_2 = require("./resource-optimizer");
Object.defineProperty(exports, "ResourceOptimizer", {
  enumerable: true,
  get: function () {
    return resource_optimizer_2.ResourceOptimizer;
  },
});
// Default export
exports.default = IntelligentConflictResolutionSystem;
