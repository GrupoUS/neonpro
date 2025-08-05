"use strict";
// Advanced Authentication System - NeonPro
// Unified integration of all advanced authentication components
// Complete session management with security, monitoring, and compliance
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
exports.AdvancedAuthSystem = void 0;
exports.getAdvancedAuthSystem = getAdvancedAuthSystem;
exports.resetAdvancedAuthSystem = resetAdvancedAuthSystem;
var session_config_1 = require("./config/session-config");
var session_utils_1 = require("./utils/session-utils");
var intelligent_timeout_1 = require("./timeout/intelligent-timeout");
var concurrent_session_manager_1 = require("./concurrent/concurrent-session-manager");
var suspicious_activity_detector_1 = require("./suspicious/suspicious-activity-detector");
var security_monitor_1 = require("./monitoring/security-monitor");
var session_sync_1 = require("./sync/session-sync");
var session_preservation_1 = require("./preservation/session-preservation");
var emergency_shutdown_1 = require("./emergency/emergency-shutdown");
var audit_trail_1 = require("./audit/audit-trail");
var data_cleanup_1 = require("./cleanup/data-cleanup");
var AdvancedAuthSystem = /** @class */ (function () {
  function AdvancedAuthSystem(config) {
    if (config === void 0) {
      config = {};
    }
    // System state
    this.isInitialized = false;
    this.componentStatuses = new Map();
    this.systemAlerts = [];
    this.eventListeners = new Map();
    // Initialize configuration with defaults
    this.config = __assign(
      {
        sessionTimeout: 30 * 60 * 1000,
        maxConcurrentSessions: 5,
        enableSuspiciousDetection: true,
        enableSecurityMonitoring: true,
        enableSessionSync: true,
        enableSessionPreservation: true,
        enableEmergencyShutdown: true,
        enableAuditTrail: true,
        enableDataCleanup: true,
        securityLevel: "high",
        anomalyThreshold: 0.7,
        threatResponseLevel: "active",
        complianceFrameworks: ["LGPD", "GDPR"],
        dataRetentionPeriod: 365 * 24 * 60 * 60 * 1000,
        auditLevel: "detailed",
        batchSize: 100,
        cleanupInterval: 60 * 60 * 1000,
        monitoringInterval: 5 * 60 * 1000,
      },
      config,
    );
    // Initialize core dependencies
    this.sessionConfig = session_config_1.SessionConfig.getInstance();
    this.utils = new session_utils_1.SessionUtils();
    // Initialize system metrics
    this.systemMetrics = {
      activeSessions: 0,
      totalSessions: 0,
      suspiciousActivities: 0,
      securityThreats: 0,
      cleanupOperations: 0,
      auditEvents: 0,
      performance: {
        averageResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
        throughput: 0,
      },
    };
    // Initialize components
    this.initializeComponents();
  }
  /**
   * Initialize all components
   */
  AdvancedAuthSystem.prototype.initializeComponents = function () {
    try {
      // Core session management
      this.timeoutManager = new intelligent_timeout_1.IntelligentTimeoutManager();
      this.concurrentManager = new concurrent_session_manager_1.ConcurrentSessionManager();
      // Security components
      if (this.config.enableSuspiciousDetection) {
        this.suspiciousDetector = new suspicious_activity_detector_1.SuspiciousActivityDetector();
      }
      if (this.config.enableSecurityMonitoring) {
        this.securityMonitor = new security_monitor_1.SecurityMonitor();
      }
      // Sync and preservation
      if (this.config.enableSessionSync) {
        this.syncManager = new session_sync_1.SessionSyncManager();
      }
      if (this.config.enableSessionPreservation) {
        this.preservationManager = new session_preservation_1.SessionPreservationManager();
      }
      // Emergency and compliance
      if (this.config.enableEmergencyShutdown) {
        this.emergencyManager = new emergency_shutdown_1.EmergencyShutdownManager();
      }
      if (this.config.enableAuditTrail) {
        this.auditManager = new audit_trail_1.AuditTrailManager();
      }
      if (this.config.enableDataCleanup) {
        this.cleanupManager = new data_cleanup_1.DataCleanupManager();
      }
      console.log("Advanced auth system components initialized");
    } catch (error) {
      console.error("Error initializing auth system components:", error);
      throw error;
    }
  };
  /**
   * Initialize the complete authentication system
   */
  AdvancedAuthSystem.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) {
              console.warn("Advanced auth system already initialized");
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 9, , 12]);
            console.log("Initializing advanced authentication system...");
            // Initialize core components in order
            return [4 /*yield*/, this.initializeCore()];
          case 2:
            // Initialize core components in order
            _a.sent();
            return [4 /*yield*/, this.initializeSecurity()];
          case 3:
            _a.sent();
            return [4 /*yield*/, this.initializeSync()];
          case 4:
            _a.sent();
            return [4 /*yield*/, this.initializeCompliance()];
          case 5:
            _a.sent();
            // Setup component integration
            return [4 /*yield*/, this.setupComponentIntegration()];
          case 6:
            // Setup component integration
            _a.sent();
            // Start monitoring
            this.startSystemMonitoring();
            this.isInitialized = true;
            if (!this.auditManager) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              this.auditManager.logSystemEvent({
                action: "system_initialized",
                description: "Advanced authentication system initialized successfully",
                severity: "info",
                metadata: {
                  config: this.config,
                  components: Array.from(this.componentStatuses.keys()),
                },
              }),
            ];
          case 7:
            _a.sent();
            _a.label = 8;
          case 8:
            this.emit("system_initialized", { config: this.config });
            console.log("Advanced authentication system initialized successfully");
            return [3 /*break*/, 12];
          case 9:
            error_1 = _a.sent();
            console.error("Error initializing advanced auth system:", error_1);
            if (!this.auditManager) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              this.auditManager.logSystemEvent({
                action: "system_initialization_failed",
                description: "System initialization failed: ".concat(error_1.message),
                severity: "critical",
                metadata: { error: error_1.message, stack: error_1.stack },
              }),
            ];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            throw error_1;
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Initialize core components
   */
  AdvancedAuthSystem.prototype.initializeCore = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("Initializing core components...");
            // Initialize timeout manager
            return [4 /*yield*/, this.timeoutManager.initialize()];
          case 1:
            // Initialize timeout manager
            _a.sent();
            this.updateComponentStatus("timeout_manager", "healthy", "Timeout manager initialized");
            // Initialize concurrent session manager
            return [4 /*yield*/, this.concurrentManager.initialize()];
          case 2:
            // Initialize concurrent session manager
            _a.sent();
            this.updateComponentStatus(
              "concurrent_manager",
              "healthy",
              "Concurrent session manager initialized",
            );
            console.log("Core components initialized");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Initialize security components
   */
  AdvancedAuthSystem.prototype.initializeSecurity = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("Initializing security components...");
            if (!this.suspiciousDetector) return [3 /*break*/, 2];
            return [4 /*yield*/, this.suspiciousDetector.initialize()];
          case 1:
            _a.sent();
            this.updateComponentStatus(
              "suspicious_detector",
              "healthy",
              "Suspicious activity detector initialized",
            );
            _a.label = 2;
          case 2:
            if (!this.securityMonitor) return [3 /*break*/, 4];
            return [4 /*yield*/, this.securityMonitor.initialize()];
          case 3:
            _a.sent();
            this.updateComponentStatus(
              "security_monitor",
              "healthy",
              "Security monitor initialized",
            );
            _a.label = 4;
          case 4:
            console.log("Security components initialized");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Initialize sync components
   */
  AdvancedAuthSystem.prototype.initializeSync = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("Initializing sync components...");
            if (!this.syncManager) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.syncManager.initialize({
                websocketUrl: this.config.websocketUrl || "ws://localhost:8080/sync",
              }),
            ];
          case 1:
            _a.sent();
            this.updateComponentStatus(
              "sync_manager",
              "healthy",
              "Session sync manager initialized",
            );
            _a.label = 2;
          case 2:
            if (!this.preservationManager) return [3 /*break*/, 4];
            return [4 /*yield*/, this.preservationManager.initialize()];
          case 3:
            _a.sent();
            this.updateComponentStatus(
              "preservation_manager",
              "healthy",
              "Session preservation manager initialized",
            );
            _a.label = 4;
          case 4:
            console.log("Sync components initialized");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Initialize compliance components
   */
  AdvancedAuthSystem.prototype.initializeCompliance = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("Initializing compliance components...");
            if (!this.emergencyManager) return [3 /*break*/, 2];
            return [4 /*yield*/, this.emergencyManager.initialize()];
          case 1:
            _a.sent();
            this.updateComponentStatus(
              "emergency_manager",
              "healthy",
              "Emergency shutdown manager initialized",
            );
            _a.label = 2;
          case 2:
            if (!this.auditManager) return [3 /*break*/, 4];
            return [4 /*yield*/, this.auditManager.initialize()];
          case 3:
            _a.sent();
            this.updateComponentStatus(
              "audit_manager",
              "healthy",
              "Audit trail manager initialized",
            );
            _a.label = 4;
          case 4:
            if (!this.cleanupManager) return [3 /*break*/, 6];
            return [4 /*yield*/, this.cleanupManager.initialize()];
          case 5:
            _a.sent();
            this.updateComponentStatus(
              "cleanup_manager",
              "healthy",
              "Data cleanup manager initialized",
            );
            _a.label = 6;
          case 6:
            console.log("Compliance components initialized");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Setup component integration
   */
  AdvancedAuthSystem.prototype.setupComponentIntegration = function () {
    return __awaiter(this, void 0, void 0, function () {
      var components;
      var _this = this;
      return __generator(this, function (_a) {
        console.log("Setting up component integration...");
        // Integrate suspicious activity detector with security monitor
        if (this.suspiciousDetector && this.securityMonitor) {
          this.suspiciousDetector.on("anomaly_detected", function (event) {
            return __awaiter(_this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, this.securityMonitor.processAnomaly(event)];
                  case 1:
                    _a.sent();
                    return [2 /*return*/];
                }
              });
            });
          });
        }
        // Integrate security monitor with emergency manager
        if (this.securityMonitor && this.emergencyManager) {
          this.securityMonitor.on("critical_threat", function (threat) {
            return __awaiter(_this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    if (!(threat.severity === "critical")) return [3 /*break*/, 2];
                    return [
                      4 /*yield*/,
                      this.emergencyManager.triggerEmergency({
                        type: "security_threat",
                        severity: "critical",
                        trigger: "automated_security_monitor",
                        reason: threat.description,
                        affectedSessions: threat.affectedSessions,
                        actions: ["terminate_sessions", "block_ips", "notify_admins"],
                        metadata: threat,
                      }),
                    ];
                  case 1:
                    _a.sent();
                    _a.label = 2;
                  case 2:
                    return [2 /*return*/];
                }
              });
            });
          });
        }
        // Integrate timeout manager with preservation
        if (this.timeoutManager && this.preservationManager) {
          this.timeoutManager.on("session_warning", function (event) {
            return __awaiter(_this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [
                      4 /*yield*/,
                      this.preservationManager.createSnapshot(event.sessionId, {
                        reason: "timeout_warning",
                        preserveFormData: true,
                        preserveNavigationState: true,
                      }),
                    ];
                  case 1:
                    _a.sent();
                    return [2 /*return*/];
                }
              });
            });
          });
        }
        // Integrate all components with audit manager
        if (this.auditManager) {
          components = [
            this.timeoutManager,
            this.concurrentManager,
            this.suspiciousDetector,
            this.securityMonitor,
            this.syncManager,
            this.preservationManager,
            this.emergencyManager,
            this.cleanupManager,
          ].filter(Boolean);
          components.forEach(function (component) {
            if (component && typeof component.on === "function") {
              component.on("*", function (event) {
                return __awaiter(_this, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          this.auditManager.logEvent({
                            type: "component_event",
                            category: "system",
                            severity: event.severity || "info",
                            action: event.action || "unknown",
                            description: event.description || "Component event",
                            actor: { type: "system", id: event.source || "unknown" },
                            target: event.target || { type: "system", id: "auth_system" },
                            context: event.context || {},
                            metadata: event.metadata || {},
                          }),
                        ];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                });
              });
            }
          });
        }
        console.log("Component integration setup completed");
        return [2 /*return*/];
      });
    });
  };
  /**
   * Start system monitoring
   */
  AdvancedAuthSystem.prototype.startSystemMonitoring = function () {
    var _this = this;
    // Health check interval
    this.healthCheckInterval = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, this.performHealthCheck()];
            case 1:
              _a.sent();
              return [3 /*break*/, 3];
            case 2:
              error_2 = _a.sent();
              console.error("Error during health check:", error_2);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    }, this.config.monitoringInterval);
    // Metrics collection interval
    this.metricsInterval = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, this.collectMetrics()];
            case 1:
              _a.sent();
              return [3 /*break*/, 3];
            case 2:
              error_3 = _a.sent();
              console.error("Error collecting metrics:", error_3);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    }, this.config.monitoringInterval / 2);
    console.log("System monitoring started");
  };
  /**
   * Perform health check
   */
  AdvancedAuthSystem.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var components, _i, components_1, _a, name_1, instance, health, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            components = [
              { name: "timeout_manager", instance: this.timeoutManager },
              { name: "concurrent_manager", instance: this.concurrentManager },
              { name: "suspicious_detector", instance: this.suspiciousDetector },
              { name: "security_monitor", instance: this.securityMonitor },
              { name: "sync_manager", instance: this.syncManager },
              { name: "preservation_manager", instance: this.preservationManager },
              { name: "emergency_manager", instance: this.emergencyManager },
              { name: "audit_manager", instance: this.auditManager },
              { name: "cleanup_manager", instance: this.cleanupManager },
            ];
            (_i = 0), (components_1 = components);
            _b.label = 1;
          case 1:
            if (!(_i < components_1.length)) return [3 /*break*/, 6];
            (_a = components_1[_i]), (name_1 = _a.name), (instance = _a.instance);
            if (!(instance && typeof instance.healthCheck === "function")) return [3 /*break*/, 5];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [4 /*yield*/, instance.healthCheck()];
          case 3:
            health = _b.sent();
            this.updateComponentStatus(
              name_1,
              health.status === "healthy" ? "healthy" : "warning",
              health.details || "Health check completed",
            );
            return [3 /*break*/, 5];
          case 4:
            error_4 = _b.sent();
            this.updateComponentStatus(
              name_1,
              "error",
              "Health check failed: ".concat(error_4.message),
            );
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Collect system metrics
   */
  AdvancedAuthSystem.prototype.collectMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var metrics,
        concurrentMetrics,
        suspiciousMetrics,
        securityMetrics,
        cleanupMetrics,
        auditMetrics,
        error_5;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 11, , 12]);
            metrics = {
              activeSessions: 0,
              totalSessions: 0,
              suspiciousActivities: 0,
              securityThreats: 0,
              cleanupOperations: 0,
              auditEvents: 0,
              performance: {
                averageResponseTime: 0,
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
                cpuUsage: 0,
                errorRate: 0,
                throughput: 0,
              },
            };
            if (!this.concurrentManager) return [3 /*break*/, 2];
            return [4 /*yield*/, this.concurrentManager.getMetrics()];
          case 1:
            concurrentMetrics = _c.sent();
            metrics.activeSessions = concurrentMetrics.activeSessions || 0;
            metrics.totalSessions = concurrentMetrics.totalSessions || 0;
            _c.label = 2;
          case 2:
            if (!this.suspiciousDetector) return [3 /*break*/, 4];
            return [4 /*yield*/, this.suspiciousDetector.getMetrics()];
          case 3:
            suspiciousMetrics = _c.sent();
            metrics.suspiciousActivities = suspiciousMetrics.anomaliesDetected || 0;
            _c.label = 4;
          case 4:
            if (!this.securityMonitor) return [3 /*break*/, 6];
            return [4 /*yield*/, this.securityMonitor.getMetrics()];
          case 5:
            securityMetrics = _c.sent();
            metrics.securityThreats = securityMetrics.activeThreats || 0;
            _c.label = 6;
          case 6:
            if (!this.cleanupManager) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              (_b = (_a = this.cleanupManager).getMetrics) === null || _b === void 0
                ? void 0
                : _b.call(_a),
            ];
          case 7:
            cleanupMetrics = _c.sent() || {};
            metrics.cleanupOperations = cleanupMetrics.totalOperations || 0;
            _c.label = 8;
          case 8:
            if (!this.auditManager) return [3 /*break*/, 10];
            return [4 /*yield*/, this.auditManager.getMetrics()];
          case 9:
            auditMetrics = _c.sent();
            metrics.auditEvents = auditMetrics.totalEvents || 0;
            _c.label = 10;
          case 10:
            this.systemMetrics = metrics;
            // Emit metrics update
            this.emit("metrics_updated", metrics);
            return [3 /*break*/, 12];
          case 11:
            error_5 = _c.sent();
            console.error("Error collecting metrics:", error_5);
            return [3 /*break*/, 12];
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update component status
   */
  AdvancedAuthSystem.prototype.updateComponentStatus = function (name, status, details) {
    this.componentStatuses.set(name, {
      name: name,
      status: status,
      lastCheck: Date.now(),
      details: details,
    });
  };
  /**
   * Session management methods
   */
  AdvancedAuthSystem.prototype.createSession = function (userId, deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      var canCreate, session, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 14, , 17]);
            if (!this.concurrentManager) return [3 /*break*/, 2];
            return [4 /*yield*/, this.concurrentManager.canCreateSession(userId, deviceInfo)];
          case 1:
            canCreate = _a.sent();
            if (!canCreate.allowed) {
              throw new Error("Session creation denied: ".concat(canCreate.reason));
            }
            _a.label = 2;
          case 2:
            return [4 /*yield*/, this.sessionConfig.createSession(userId, deviceInfo)];
          case 3:
            session = _a.sent();
            if (!this.timeoutManager) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.timeoutManager.initializeSession(session.id, {
                userId: session.userId,
                role: session.role,
                timeout: this.config.sessionTimeout,
              }),
            ];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            if (!this.concurrentManager) return [3 /*break*/, 7];
            return [4 /*yield*/, this.concurrentManager.registerSession(session)];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            if (!this.suspiciousDetector) return [3 /*break*/, 9];
            return [4 /*yield*/, this.suspiciousDetector.startMonitoring(session.id, userId)];
          case 8:
            _a.sent();
            _a.label = 9;
          case 9:
            if (!this.preservationManager) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              this.preservationManager.createSnapshot(session.id, {
                reason: "session_created",
                preserveAuthState: true,
              }),
            ];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            if (!this.auditManager) return [3 /*break*/, 13];
            return [
              4 /*yield*/,
              this.auditManager.logAuthenticationEvent({
                action: "session_created",
                userId: userId,
                sessionId: session.id,
                deviceInfo: deviceInfo,
                success: true,
              }),
            ];
          case 12:
            _a.sent();
            _a.label = 13;
          case 13:
            this.emit("session_created", {
              session: session,
              userId: userId,
              deviceInfo: deviceInfo,
            });
            return [2 /*return*/, session];
          case 14:
            error_6 = _a.sent();
            if (!this.auditManager) return [3 /*break*/, 16];
            return [
              4 /*yield*/,
              this.auditManager.logAuthenticationEvent({
                action: "session_creation_failed",
                userId: userId,
                deviceInfo: deviceInfo,
                success: false,
                error: error_6.message,
              }),
            ];
          case 15:
            _a.sent();
            _a.label = 16;
          case 16:
            throw error_6;
          case 17:
            return [2 /*return*/];
        }
      });
    });
  };
  AdvancedAuthSystem.prototype.validateSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var session, isValid, isValid, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 12, , 13]);
            return [4 /*yield*/, this.sessionConfig.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/, null];
            }
            if (!this.timeoutManager) return [3 /*break*/, 4];
            return [4 /*yield*/, this.timeoutManager.checkSession(sessionId)];
          case 2:
            isValid = _a.sent();
            if (!!isValid) return [3 /*break*/, 4];
            return [4 /*yield*/, this.terminateSession(sessionId, "timeout")];
          case 3:
            _a.sent();
            return [2 /*return*/, null];
          case 4:
            if (!this.concurrentManager) return [3 /*break*/, 7];
            return [4 /*yield*/, this.concurrentManager.validateSession(sessionId)];
          case 5:
            isValid = _a.sent();
            if (!!isValid) return [3 /*break*/, 7];
            return [4 /*yield*/, this.terminateSession(sessionId, "concurrent_violation")];
          case 6:
            _a.sent();
            return [2 /*return*/, null];
          case 7:
            if (!this.timeoutManager) return [3 /*break*/, 9];
            return [4 /*yield*/, this.timeoutManager.updateActivity(sessionId)];
          case 8:
            _a.sent();
            _a.label = 9;
          case 9:
            if (!this.suspiciousDetector) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              this.suspiciousDetector.recordActivity(sessionId, {
                type: "session_validation",
                timestamp: Date.now(),
              }),
            ];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            return [2 /*return*/, session];
          case 12:
            error_7 = _a.sent();
            console.error("Error validating session:", error_7);
            return [2 /*return*/, null];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  AdvancedAuthSystem.prototype.terminateSession = function (sessionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var session, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 13, , 14]);
            return [4 /*yield*/, this.sessionConfig.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!(this.preservationManager && session)) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.preservationManager.createSnapshot(sessionId, {
                reason: "session_terminated_".concat(reason),
                preserveAll: true,
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            if (!this.suspiciousDetector) return [3 /*break*/, 5];
            return [4 /*yield*/, this.suspiciousDetector.stopMonitoring(sessionId)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            if (!this.timeoutManager) return [3 /*break*/, 7];
            return [4 /*yield*/, this.timeoutManager.removeSession(sessionId)];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            if (!this.concurrentManager) return [3 /*break*/, 9];
            return [4 /*yield*/, this.concurrentManager.removeSession(sessionId)];
          case 8:
            _a.sent();
            _a.label = 9;
          case 9:
            // Terminate session
            return [4 /*yield*/, this.sessionConfig.terminateSession(sessionId)];
          case 10:
            // Terminate session
            _a.sent();
            if (!(this.auditManager && session)) return [3 /*break*/, 12];
            return [
              4 /*yield*/,
              this.auditManager.logSessionEvent({
                action: "session_terminated",
                sessionId: sessionId,
                userId: session.userId,
                reason: reason,
                duration: Date.now() - session.createdAt,
              }),
            ];
          case 11:
            _a.sent();
            _a.label = 12;
          case 12:
            this.emit("session_terminated", { sessionId: sessionId, reason: reason });
            return [3 /*break*/, 14];
          case 13:
            error_8 = _a.sent();
            console.error("Error terminating session:", error_8);
            throw error_8;
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Security methods
   */
  AdvancedAuthSystem.prototype.reportSuspiciousActivity = function (sessionId, activity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.suspiciousDetector) return [3 /*break*/, 2];
            return [4 /*yield*/, this.suspiciousDetector.recordActivity(sessionId, activity)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  AdvancedAuthSystem.prototype.triggerEmergencyShutdown = function (reason_1) {
    return __awaiter(this, arguments, void 0, function (reason, scope) {
      if (scope === void 0) {
        scope = "system";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.emergencyManager) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.emergencyManager.triggerEmergency({
                type: "manual_trigger",
                severity: "critical",
                trigger: "admin_request",
                reason: reason,
                actions: ["terminate_sessions", "notify_admins", "log_incident"],
                metadata: { scope: scope, timestamp: Date.now() },
              }),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * System status and monitoring
   */
  AdvancedAuthSystem.prototype.getSystemStatus = function () {
    var components = Array.from(this.componentStatuses.values());
    var healthIssues = [];
    // Analyze component health
    components.forEach(function (component) {
      if (component.status === "error") {
        healthIssues.push({
          component: component.name,
          severity: "high",
          description: "Component ".concat(component.name, " is in error state"),
          impact: "Reduced functionality",
          resolution: "Check component logs and restart if necessary",
        });
      } else if (component.status === "warning") {
        healthIssues.push({
          component: component.name,
          severity: "medium",
          description: "Component ".concat(component.name, " has warnings"),
          impact: "Potential performance degradation",
          resolution: "Monitor component and investigate warnings",
        });
      }
    });
    // Calculate overall health
    var healthyComponents = components.filter(function (c) {
      return c.status === "healthy";
    }).length;
    var totalComponents = components.length;
    var healthScore = totalComponents > 0 ? (healthyComponents / totalComponents) * 100 : 0;
    var overallHealth;
    if (healthScore >= 90) {
      overallHealth = "healthy";
    } else if (healthScore >= 70) {
      overallHealth = "degraded";
    } else {
      overallHealth = "critical";
    }
    return {
      initialized: this.isInitialized,
      components: components,
      metrics: this.systemMetrics,
      health: {
        overall: overallHealth,
        score: healthScore,
        issues: healthIssues,
        recommendations: this.generateRecommendations(healthIssues),
      },
      alerts: this.systemAlerts.filter(function (alert) {
        return !alert.acknowledged;
      }),
    };
  };
  AdvancedAuthSystem.prototype.generateRecommendations = function (issues) {
    var recommendations = [];
    if (
      issues.some(function (i) {
        return i.severity === "critical";
      })
    ) {
      recommendations.push("Immediate attention required for critical issues");
    }
    if (issues.length > 3) {
      recommendations.push("Consider system maintenance to address multiple issues");
    }
    if (this.systemMetrics.performance.errorRate > 0.05) {
      recommendations.push("High error rate detected, investigate system stability");
    }
    if (this.systemMetrics.performance.memoryUsage > 500) {
      recommendations.push("High memory usage detected, consider optimization");
    }
    return recommendations;
  };
  AdvancedAuthSystem.prototype.getMetrics = function () {
    return __assign({}, this.systemMetrics);
  };
  AdvancedAuthSystem.prototype.getAlerts = function () {
    return __spreadArray([], this.systemAlerts, true);
  };
  AdvancedAuthSystem.prototype.acknowledgeAlert = function (alertId) {
    var alert = this.systemAlerts.find(function (a) {
      return a.id === alertId;
    });
    if (alert) {
      alert.acknowledged = true;
    }
  };
  /**
   * Configuration management
   */
  AdvancedAuthSystem.prototype.updateConfig = function (updates) {
    this.config = __assign(__assign({}, this.config), updates);
    this.emit("config_updated", { config: this.config, updates: updates });
  };
  AdvancedAuthSystem.prototype.getConfig = function () {
    return __assign({}, this.config);
  };
  /**
   * Event system
   */
  AdvancedAuthSystem.prototype.on = function (event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  };
  AdvancedAuthSystem.prototype.off = function (event, callback) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      var index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
  AdvancedAuthSystem.prototype.emit = function (event, data) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(function (callback) {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in event listener for ".concat(event, ":"), error);
        }
      });
    }
  };
  /**
   * Shutdown system
   */
  AdvancedAuthSystem.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      var shutdownPromises, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            console.log("Shutting down advanced authentication system...");
            // Stop monitoring
            if (this.healthCheckInterval) {
              clearInterval(this.healthCheckInterval);
            }
            if (this.metricsInterval) {
              clearInterval(this.metricsInterval);
            }
            shutdownPromises = [];
            if (this.cleanupManager) {
              shutdownPromises.push(this.cleanupManager.shutdown());
            }
            if (this.auditManager) {
              shutdownPromises.push(this.auditManager.shutdown());
            }
            if (this.emergencyManager) {
              shutdownPromises.push(this.emergencyManager.shutdown());
            }
            if (this.preservationManager) {
              shutdownPromises.push(this.preservationManager.shutdown());
            }
            if (this.syncManager) {
              shutdownPromises.push(this.syncManager.shutdown());
            }
            if (this.securityMonitor) {
              shutdownPromises.push(this.securityMonitor.shutdown());
            }
            if (this.suspiciousDetector) {
              shutdownPromises.push(this.suspiciousDetector.shutdown());
            }
            if (this.concurrentManager) {
              shutdownPromises.push(this.concurrentManager.shutdown());
            }
            if (this.timeoutManager) {
              shutdownPromises.push(this.timeoutManager.shutdown());
            }
            return [4 /*yield*/, Promise.allSettled(shutdownPromises)];
          case 1:
            _a.sent();
            // Clear state
            this.componentStatuses.clear();
            this.systemAlerts = [];
            this.eventListeners.clear();
            this.isInitialized = false;
            console.log("Advanced authentication system shutdown completed");
            return [3 /*break*/, 3];
          case 2:
            error_9 = _a.sent();
            console.error("Error during system shutdown:", error_9);
            throw error_9;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return AdvancedAuthSystem;
})();
exports.AdvancedAuthSystem = AdvancedAuthSystem;
// Export singleton instance
var authSystemInstance = null;
function getAdvancedAuthSystem(config) {
  if (!authSystemInstance) {
    authSystemInstance = new AdvancedAuthSystem(config);
  }
  return authSystemInstance;
}
function resetAdvancedAuthSystem() {
  if (authSystemInstance) {
    authSystemInstance.shutdown().catch(console.error);
    authSystemInstance = null;
  }
}
exports.default = AdvancedAuthSystem;
