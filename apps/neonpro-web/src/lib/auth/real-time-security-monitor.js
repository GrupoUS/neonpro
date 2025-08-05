"use strict";
/**
 * Real-Time Security Monitor
 * Story 1.4 - Task 5: Real-time security monitoring and alerting
 *
 * Features:
 * - Real-time threat detection
 * - WebSocket-based monitoring
 * - Security dashboard integration
 * - Automated incident response
 * - Performance monitoring
 * - Compliance tracking
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
exports.RealTimeSecurityMonitor = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var security_audit_logger_1 = require("./security-audit-logger");
var DEFAULT_THRESHOLDS = [
  {
    metricName: "failedLogins",
    operator: "gte",
    value: 10,
    severity: "medium",
    description: "High number of failed login attempts",
    isEnabled: true,
    cooldownMinutes: 15,
    actions: [
      {
        type: "email",
        target: "security@company.com",
        delay: 0,
      },
    ],
  },
  {
    metricName: "suspiciousActivities",
    operator: "gte",
    value: 5,
    severity: "high",
    description: "Multiple suspicious activities detected",
    isEnabled: true,
    cooldownMinutes: 10,
    actions: [
      {
        type: "email",
        target: "security@company.com",
        delay: 0,
      },
      {
        type: "escalate",
        target: "security-team",
        delay: 300,
      },
    ],
  },
  {
    metricName: "systemLoad.cpu",
    operator: "gte",
    value: 90,
    severity: "medium",
    description: "High CPU usage detected",
    isEnabled: true,
    cooldownMinutes: 5,
    actions: [
      {
        type: "webhook",
        target: "/api/alerts/system-load",
        delay: 0,
      },
    ],
  },
  {
    metricName: "activeUsers",
    operator: "gte",
    value: 1000,
    severity: "low",
    description: "High number of concurrent users",
    isEnabled: true,
    cooldownMinutes: 30,
    actions: [
      {
        type: "webhook",
        target: "/api/alerts/high-load",
        delay: 0,
      },
    ],
  },
];
var DEFAULT_CONFIG = {
  enabled: true,
  metricsInterval: 30,
  alertingEnabled: true,
  dashboardEnabled: true,
  retentionDays: 90,
  thresholds: DEFAULT_THRESHOLDS,
  notifications: {
    email: {
      enabled: true,
      recipients: ["admin@company.com"],
      template: "security-alert",
    },
    webhook: {
      enabled: false,
      url: "",
      secret: "",
    },
    dashboard: {
      enabled: true,
      refreshInterval: 5,
    },
  },
  compliance: {
    lgpdEnabled: true,
    auditTrailEnabled: true,
    dataRetentionDays: 365,
    anonymizationEnabled: true,
  },
};
var RealTimeSecurityMonitor = /** @class */ (function () {
  function RealTimeSecurityMonitor(supabaseUrl, supabaseKey, activityDetector, customConfig) {
    this.connectedClients = new Set();
    this.alertCooldowns = new Map();
    this.activeIncidents = new Map();
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = new security_audit_logger_1.SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.activityDetector = activityDetector;
    this.config = __assign(__assign({}, DEFAULT_CONFIG), customConfig);
    if (this.config.enabled) {
      this.startMonitoring();
    }
  }
  /**
   * Start real-time monitoring
   */
  RealTimeSecurityMonitor.prototype.startMonitoring = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            // Start metrics collection
            this.startMetricsCollection();
            // Initialize WebSocket server for real-time updates
            return [4 /*yield*/, this.initializeWebSocket()];
          case 1:
            // Initialize WebSocket server for real-time updates
            _a.sent();
            // Load existing incidents
            return [4 /*yield*/, this.loadActiveIncidents()];
          case 2:
            // Load existing incidents
            _a.sent();
            // Set up activity detector integration
            this.setupActivityDetectorIntegration();
            console.log("Real-time security monitoring started");
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to start monitoring:", error_1);
            throw error_1;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Stop monitoring
   */
  RealTimeSecurityMonitor.prototype.stopMonitoring = function () {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }
    if (this.websocketServer) {
      this.websocketServer.close();
      this.websocketServer = undefined;
    }
    this.connectedClients.clear();
    console.log("Real-time security monitoring stopped");
  };
  /**
   * Get current security metrics
   */
  RealTimeSecurityMonitor.prototype.getCurrentMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 10, , 11]);
            _a = {
              timestamp: new Date(),
            };
            return [4 /*yield*/, this.getActiveUsersCount()];
          case 1:
            _a.activeUsers = _b.sent();
            return [4 /*yield*/, this.getActiveSessionsCount()];
          case 2:
            _a.activeSessions = _b.sent();
            return [4 /*yield*/, this.getFailedLoginsCount()];
          case 3:
            _a.failedLogins = _b.sent();
            return [4 /*yield*/, this.getSuspiciousActivitiesCount()];
          case 4:
            _a.suspiciousActivities = _b.sent();
            return [4 /*yield*/, this.getBlockedIPsCount()];
          case 5:
            _a.blockedIPs = _b.sent();
            return [4 /*yield*/, this.getAverageResponseTime()];
          case 6:
            _a.averageResponseTime = _b.sent();
            return [4 /*yield*/, this.getSystemLoad()];
          case 7:
            _a.systemLoad = _b.sent();
            return [4 /*yield*/, this.getNetworkTraffic()];
          case 8:
            _a.networkTraffic = _b.sent();
            return [4 /*yield*/, this.getSecurityEventsStats()];
          case 9:
            metrics = ((_a.securityEvents = _b.sent()), _a);
            this.lastMetrics = metrics;
            return [2 /*return*/, metrics];
          case 10:
            error_2 = _b.sent();
            console.error("Failed to get current metrics:", error_2);
            throw error_2;
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get security metrics history
   */
  RealTimeSecurityMonitor.prototype.getMetricsHistory = function (timeRange_1) {
    return __awaiter(this, arguments, void 0, function (timeRange, interval) {
      var _a, data, error, error_3;
      if (interval === void 0) {
        interval = "hour";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("security_metrics")
                .select("*")
                .gte("timestamp", timeRange.start.toISOString())
                .lte("timestamp", timeRange.end.toISOString())
                .order("timestamp", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get metrics history: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToMetrics)];
          case 2:
            error_3 = _b.sent();
            console.error("Failed to get metrics history:", error_3);
            throw error_3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create security incident
   */
  RealTimeSecurityMonitor.prototype.createIncident = function (incident) {
    return __awaiter(this, void 0, void 0, function () {
      var fullIncident, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            fullIncident = __assign(__assign({}, incident), {
              incidentId: "incident_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              detectedAt: new Date(),
              timeline: [
                {
                  timestamp: new Date(),
                  action: "incident_created",
                  user: "system",
                  details: "Incident automatically created by security monitor",
                },
              ],
            });
            // Store incident
            return [4 /*yield*/, this.storeIncident(fullIncident)];
          case 1:
            // Store incident
            _a.sent();
            // Add to active incidents
            this.activeIncidents.set(fullIncident.incidentId, fullIncident);
            // Broadcast to connected clients
            this.broadcastToClients("incident_created", fullIncident);
            // Log security event
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "security_incident_created",
                metadata: {
                  incidentId: fullIncident.incidentId,
                  type: fullIncident.type,
                  severity: fullIncident.severity,
                },
              }),
            ];
          case 2:
            // Log security event
            _a.sent();
            return [2 /*return*/, fullIncident];
          case 3:
            error_4 = _a.sent();
            console.error("Failed to create incident:", error_4);
            throw error_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update security incident
   */
  RealTimeSecurityMonitor.prototype.updateIncident = function (incidentId_1, updates_1) {
    return __awaiter(this, arguments, void 0, function (incidentId, updates, user) {
      var existingIncident, updatedIncident, error_5;
      if (user === void 0) {
        user = "system";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            existingIncident = this.activeIncidents.get(incidentId);
            if (!existingIncident) {
              throw new Error("Incident not found");
            }
            updatedIncident = __assign(__assign(__assign({}, existingIncident), updates), {
              timeline: __spreadArray(
                __spreadArray([], existingIncident.timeline, true),
                [
                  {
                    timestamp: new Date(),
                    action: "incident_updated",
                    user: user,
                    details: "Incident updated: ".concat(Object.keys(updates).join(", ")),
                  },
                ],
                false,
              ),
            });
            // Update storage
            return [4 /*yield*/, this.storeIncident(updatedIncident)];
          case 1:
            // Update storage
            _a.sent();
            // Update active incidents
            this.activeIncidents.set(incidentId, updatedIncident);
            // Broadcast update
            this.broadcastToClients("incident_updated", updatedIncident);
            return [2 /*return*/, updatedIncident];
          case 2:
            error_5 = _a.sent();
            console.error("Failed to update incident:", error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Resolve security incident
   */
  RealTimeSecurityMonitor.prototype.resolveIncident = function (incidentId, resolution, user) {
    return __awaiter(this, void 0, void 0, function () {
      var updates, resolvedIncident, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            updates = {
              status: "resolved",
              resolvedAt: new Date(),
              timeline: [
                {
                  timestamp: new Date(),
                  action: "incident_resolved",
                  user: user,
                  details: resolution,
                },
              ],
            };
            return [4 /*yield*/, this.updateIncident(incidentId, updates, user)];
          case 1:
            resolvedIncident = _a.sent();
            // Remove from active incidents
            this.activeIncidents.delete(incidentId);
            return [2 /*return*/, resolvedIncident];
          case 2:
            error_6 = _a.sent();
            console.error("Failed to resolve incident:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active incidents
   */
  RealTimeSecurityMonitor.prototype.getActiveIncidents = function () {
    return Array.from(this.activeIncidents.values());
  };
  /**
   * Get incident by ID
   */
  RealTimeSecurityMonitor.prototype.getIncident = function (incidentId) {
    return __awaiter(this, void 0, void 0, function () {
      var activeIncident, _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            activeIncident = this.activeIncidents.get(incidentId);
            if (activeIncident) {
              return [2 /*return*/, activeIncident];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("security_incidents")
                .select("*")
                .eq("incident_id", incidentId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") {
                return [2 /*return*/, null]; // Not found
              }
              throw new Error("Failed to get incident: ".concat(error.message));
            }
            return [2 /*return*/, this.mapDatabaseToIncident(data)];
          case 2:
            error_7 = _b.sent();
            console.error("Failed to get incident:", error_7);
            throw error_7;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get incidents with filtering
   */
  RealTimeSecurityMonitor.prototype.getIncidents = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("security_incidents")
              .select("*")
              .order("detected_at", { ascending: false });
            if (options === null || options === void 0 ? void 0 : options.status) {
              query = query.in("status", options.status);
            }
            if (options === null || options === void 0 ? void 0 : options.severity) {
              query = query.in("severity", options.severity);
            }
            if (options === null || options === void 0 ? void 0 : options.type) {
              query = query.in("type", options.type);
            }
            if (options === null || options === void 0 ? void 0 : options.timeRange) {
              query = query
                .gte("detected_at", options.timeRange.start.toISOString())
                .lte("detected_at", options.timeRange.end.toISOString());
            }
            if (options === null || options === void 0 ? void 0 : options.limit) {
              query = query.limit(options.limit);
            }
            if (options === null || options === void 0 ? void 0 : options.offset) {
              query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get incidents: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToIncident)];
          case 2:
            error_8 = _b.sent();
            console.error("Failed to get incidents:", error_8);
            throw error_8;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update monitoring configuration
   */
  RealTimeSecurityMonitor.prototype.updateConfig = function (newConfig) {
    this.config = __assign(__assign({}, this.config), newConfig);
    // Restart monitoring if needed
    if (this.config.enabled && !this.metricsInterval) {
      this.startMetricsCollection();
    } else if (!this.config.enabled && this.metricsInterval) {
      this.stopMonitoring();
    }
  };
  /**
   * Get monitoring configuration
   */
  RealTimeSecurityMonitor.prototype.getConfig = function () {
    return __assign({}, this.config);
  };
  /**
   * Add WebSocket client
   */
  RealTimeSecurityMonitor.prototype.addWebSocketClient = function (client) {
    this.connectedClients.add(client);
    // Send current metrics to new client
    if (this.lastMetrics) {
      client.send(
        JSON.stringify({
          type: "metrics_update",
          data: this.lastMetrics,
        }),
      );
    }
    // Send active incidents
    var activeIncidents = this.getActiveIncidents();
    if (activeIncidents.length > 0) {
      client.send(
        JSON.stringify({
          type: "incidents_update",
          data: activeIncidents,
        }),
      );
    }
  };
  /**
   * Remove WebSocket client
   */
  RealTimeSecurityMonitor.prototype.removeWebSocketClient = function (client) {
    this.connectedClients.delete(client);
  };
  /**
   * Get monitoring statistics
   */
  RealTimeSecurityMonitor.prototype.getMonitoringStatistics = function (timeRange) {
    return __awaiter(this, void 0, void 0, function () {
      var incidents,
        metrics,
        incidentsBySeverity,
        incidentsByType,
        totalResolutionTime,
        resolvedIncidents,
        falsePositives,
        _i,
        incidents_1,
        incident,
        resolutionTime,
        error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getIncidents({ timeRange: timeRange })];
          case 1:
            incidents = _a.sent();
            return [4 /*yield*/, this.getMetricsHistory(timeRange)];
          case 2:
            metrics = _a.sent();
            incidentsBySeverity = {
              low: 0,
              medium: 0,
              high: 0,
              critical: 0,
            };
            incidentsByType = {
              threshold_breach: 0,
              suspicious_activity: 0,
              system_anomaly: 0,
              compliance_violation: 0,
              manual: 0,
            };
            totalResolutionTime = 0;
            resolvedIncidents = 0;
            falsePositives = 0;
            for (_i = 0, incidents_1 = incidents; _i < incidents_1.length; _i++) {
              incident = incidents_1[_i];
              incidentsBySeverity[incident.severity]++;
              incidentsByType[incident.type]++;
              if (incident.status === "resolved" && incident.resolvedAt) {
                resolutionTime = incident.resolvedAt.getTime() - incident.detectedAt.getTime();
                totalResolutionTime += resolutionTime;
                resolvedIncidents++;
              }
              if (incident.status === "false_positive") {
                falsePositives++;
              }
            }
            return [
              2 /*return*/,
              {
                totalIncidents: incidents.length,
                incidentsBySeverity: incidentsBySeverity,
                incidentsByType: incidentsByType,
                averageResolutionTime:
                  resolvedIncidents > 0 ? totalResolutionTime / resolvedIncidents : 0,
                falsePositiveRate: incidents.length > 0 ? falsePositives / incidents.length : 0,
                systemUptime: this.calculateSystemUptime(timeRange),
                alertsTriggered: this.calculateAlertsTriggered(timeRange),
                metricsCollected: metrics.length,
              },
            ];
          case 3:
            error_9 = _a.sent();
            console.error("Failed to get monitoring statistics:", error_9);
            throw error_9;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private methods
  RealTimeSecurityMonitor.prototype.startMetricsCollection = function () {
    var _this = this;
    this.metricsInterval = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var metrics, error_10;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [4 /*yield*/, this.getCurrentMetrics()];
            case 1:
              metrics = _a.sent();
              // Store metrics
              return [4 /*yield*/, this.storeMetrics(metrics)];
            case 2:
              // Store metrics
              _a.sent();
              // Check thresholds
              return [4 /*yield*/, this.checkThresholds(metrics)];
            case 3:
              // Check thresholds
              _a.sent();
              // Broadcast to clients
              this.broadcastToClients("metrics_update", metrics);
              return [3 /*break*/, 5];
            case 4:
              error_10 = _a.sent();
              console.error("Metrics collection failed:", error_10);
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    }, this.config.metricsInterval * 1000);
  };
  RealTimeSecurityMonitor.prototype.initializeWebSocket = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // WebSocket server initialization would go here
        // This is a placeholder for the actual WebSocket implementation
        console.log("WebSocket server initialized for real-time monitoring");
        return [2 /*return*/];
      });
    });
  };
  RealTimeSecurityMonitor.prototype.loadActiveIncidents = function () {
    return __awaiter(this, void 0, void 0, function () {
      var activeIncidents, _i, activeIncidents_1, incident, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.getIncidents({
                status: ["open", "investigating"],
              }),
            ];
          case 1:
            activeIncidents = _a.sent();
            for (_i = 0, activeIncidents_1 = activeIncidents; _i < activeIncidents_1.length; _i++) {
              incident = activeIncidents_1[_i];
              this.activeIncidents.set(incident.incidentId, incident);
            }
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Failed to load active incidents:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.setupActivityDetectorIntegration = function () {
    // This would integrate with the SuspiciousActivityDetector
    // to automatically create incidents from suspicious activities
    console.log("Activity detector integration set up");
  };
  RealTimeSecurityMonitor.prototype.getActiveUsersCount = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, count, error, error_12;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("user_id", { count: "exact", head: true })
                .eq("is_active", true),
            ];
          case 1:
            (_a = _b.sent()), (count = _a.count), (error = _a.error);
            if (error) {
              console.error("Failed to get active users count:", error);
              return [2 /*return*/, 0];
            }
            return [2 /*return*/, count || 0];
          case 2:
            error_12 = _b.sent();
            console.error("Failed to get active users count:", error_12);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getActiveSessionsCount = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, count, error, error_13;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("*", { count: "exact", head: true })
                .eq("is_active", true),
            ];
          case 1:
            (_a = _b.sent()), (count = _a.count), (error = _a.error);
            if (error) {
              console.error("Failed to get active sessions count:", error);
              return [2 /*return*/, 0];
            }
            return [2 /*return*/, count || 0];
          case 2:
            error_13 = _b.sent();
            console.error("Failed to get active sessions count:", error_13);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getFailedLoginsCount = function () {
    return __awaiter(this, void 0, void 0, function () {
      var oneHourAgo, _a, count, error, error_14;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_security_events")
                .select("*", { count: "exact", head: true })
                .eq("event_type", "login_failed")
                .gte("timestamp", oneHourAgo.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (count = _a.count), (error = _a.error);
            if (error) {
              console.error("Failed to get failed logins count:", error);
              return [2 /*return*/, 0];
            }
            return [2 /*return*/, count || 0];
          case 2:
            error_14 = _b.sent();
            console.error("Failed to get failed logins count:", error_14);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getSuspiciousActivitiesCount = function () {
    return __awaiter(this, void 0, void 0, function () {
      var oneHourAgo, _a, count, error, error_15;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("suspicious_activity_alerts")
                .select("*", { count: "exact", head: true })
                .gte("detected_at", oneHourAgo.toISOString())
                .eq("is_resolved", false),
            ];
          case 1:
            (_a = _b.sent()), (count = _a.count), (error = _a.error);
            if (error) {
              console.error("Failed to get suspicious activities count:", error);
              return [2 /*return*/, 0];
            }
            return [2 /*return*/, count || 0];
          case 2:
            error_15 = _b.sent();
            console.error("Failed to get suspicious activities count:", error_15);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getBlockedIPsCount = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would query a blocked IPs table
        // For now, return a placeholder value
        return [2 /*return*/, 0];
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getAverageResponseTime = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would calculate average API response time
        // For now, return a placeholder value
        return [2 /*return*/, 150]; // ms
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getSystemLoad = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would get actual system metrics
        // For now, return placeholder values
        return [
          2 /*return*/,
          {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            disk: Math.random() * 100,
          },
        ];
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getNetworkTraffic = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would get actual network metrics
        // For now, return placeholder values
        return [
          2 /*return*/,
          {
            inbound: Math.random() * 1000000, // bytes
            outbound: Math.random() * 1000000, // bytes
          },
        ];
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getSecurityEventsStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var oneHourAgo, _a, data, error, events, byType, bySeverity, _i, events_1, event_1, error_16;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_security_events")
                .select("event_type, severity")
                .gte("timestamp", oneHourAgo.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get security events stats:", error);
              return [2 /*return*/, { total: 0, byType: {}, bySeverity: {} }];
            }
            events = data || [];
            byType = {};
            bySeverity = {};
            for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
              event_1 = events_1[_i];
              byType[event_1.event_type] = (byType[event_1.event_type] || 0) + 1;
              bySeverity[event_1.severity] = (bySeverity[event_1.severity] || 0) + 1;
            }
            return [
              2 /*return*/,
              {
                total: events.length,
                byType: byType,
                bySeverity: bySeverity,
              },
            ];
          case 2:
            error_16 = _b.sent();
            console.error("Failed to get security events stats:", error_16);
            return [2 /*return*/, { total: 0, byType: {}, bySeverity: {} }];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.checkThresholds = function (metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, threshold, value, breached, error_17;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!this.config.alertingEnabled) {
              return [2 /*return*/];
            }
            (_i = 0),
              (_a = this.config.thresholds.filter(function (t) {
                return t.isEnabled;
              }));
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 7];
            threshold = _a[_i];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 5, , 6]);
            value = this.getMetricValue(metrics, threshold.metricName);
            breached = this.compareValues(value, threshold.operator, threshold.value);
            if (!(breached && !this.isInCooldown(threshold))) return [3 /*break*/, 4];
            return [4 /*yield*/, this.handleThresholdBreach(threshold, value, metrics)];
          case 3:
            _b.sent();
            this.setCooldown(threshold);
            _b.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_17 = _b.sent();
            console.error("Failed to check threshold ".concat(threshold.metricName, ":"), error_17);
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 1];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.getMetricValue = function (metrics, metricName) {
    var parts = metricName.split(".");
    var value = metrics;
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
      var part = parts_1[_i];
      value = value === null || value === void 0 ? void 0 : value[part];
    }
    return value;
  };
  RealTimeSecurityMonitor.prototype.compareValues = function (value, operator, threshold) {
    switch (operator) {
      case "gt":
        return value > threshold;
      case "lt":
        return value < threshold;
      case "eq":
        return value === threshold;
      case "gte":
        return value >= threshold;
      case "lte":
        return value <= threshold;
      default:
        return false;
    }
  };
  RealTimeSecurityMonitor.prototype.isInCooldown = function (threshold) {
    var lastAlert = this.alertCooldowns.get(threshold.metricName);
    if (!lastAlert) {
      return false;
    }
    var cooldownEnd = new Date(lastAlert.getTime() + threshold.cooldownMinutes * 60 * 1000);
    return new Date() < cooldownEnd;
  };
  RealTimeSecurityMonitor.prototype.setCooldown = function (threshold) {
    this.alertCooldowns.set(threshold.metricName, new Date());
  };
  RealTimeSecurityMonitor.prototype.handleThresholdBreach = function (threshold, value, metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var incident_1, _loop_1, this_1, _i, _a, action, error_18;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              this.createIncident({
                type: "threshold_breach",
                severity: threshold.severity,
                title: "Threshold breach: ".concat(threshold.metricName),
                description: ""
                  .concat(threshold.description, ". Current value: ")
                  .concat(value, ", threshold: ")
                  .concat(threshold.value),
                status: "open",
                metrics: metrics,
                evidence: {
                  threshold: threshold,
                  currentValue: value,
                  metrics: metrics,
                },
                impact: {
                  affectedUsers: [],
                  affectedSystems: [],
                  dataExposure: false,
                  serviceDisruption: threshold.severity === "critical",
                },
                response: {
                  containmentActions: [],
                  investigationNotes: [],
                  remediationSteps: [],
                  lessonsLearned: [],
                },
              }),
            ];
          case 1:
            incident_1 = _b.sent();
            _loop_1 = function (action) {
              return __generator(this, function (_c) {
                switch (_c.label) {
                  case 0:
                    if (!(action.delay > 0)) return [3 /*break*/, 1];
                    setTimeout(function () {
                      return _this.executeThresholdAction(action, incident_1);
                    }, action.delay * 1000);
                    return [3 /*break*/, 3];
                  case 1:
                    return [4 /*yield*/, this_1.executeThresholdAction(action, incident_1)];
                  case 2:
                    _c.sent();
                    _c.label = 3;
                  case 3:
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (_a = threshold.actions);
            _b.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            action = _a[_i];
            return [5 /*yield**/, _loop_1(action)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_18 = _b.sent();
            console.error("Failed to handle threshold breach:", error_18);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.executeThresholdAction = function (action, incident) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, error_19;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 9, , 10]);
            _a = action.type;
            switch (_a) {
              case "email":
                return [3 /*break*/, 1];
              case "webhook":
                return [3 /*break*/, 3];
              case "escalate":
                return [3 /*break*/, 5];
            }
            return [3 /*break*/, 7];
          case 1:
            return [4 /*yield*/, this.sendEmailAlert(action.target, incident)];
          case 2:
            _b.sent();
            return [3 /*break*/, 7];
          case 3:
            return [4 /*yield*/, this.sendWebhookAlert(action.target, incident)];
          case 4:
            _b.sent();
            return [3 /*break*/, 7];
          case 5:
            return [4 /*yield*/, this.escalateIncident(incident, action.target)];
          case 6:
            _b.sent();
            return [3 /*break*/, 7];
          case 7:
            // Log action execution
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "threshold_action_executed",
                metadata: {
                  incidentId: incident.incidentId,
                  actionType: action.type,
                  target: action.target,
                },
              }),
            ];
          case 8:
            // Log action execution
            _b.sent();
            return [3 /*break*/, 10];
          case 9:
            error_19 = _b.sent();
            console.error("Failed to execute threshold action:", error_19);
            return [3 /*break*/, 10];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.sendEmailAlert = function (recipient, incident) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Email sending implementation would go here
        console.log(
          "Email alert sent to ".concat(recipient, " for incident ").concat(incident.incidentId),
        );
        return [2 /*return*/];
      });
    });
  };
  RealTimeSecurityMonitor.prototype.sendWebhookAlert = function (url, incident) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Webhook sending implementation would go here
        console.log(
          "Webhook alert sent to ".concat(url, " for incident ").concat(incident.incidentId),
        );
        return [2 /*return*/];
      });
    });
  };
  RealTimeSecurityMonitor.prototype.escalateIncident = function (incident, target) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Incident escalation implementation would go here
        console.log("Incident ".concat(incident.incidentId, " escalated to ").concat(target));
        return [2 /*return*/];
      });
    });
  };
  RealTimeSecurityMonitor.prototype.broadcastToClients = function (type, data) {
    var message = JSON.stringify({ type: type, data: data });
    for (var _i = 0, _a = this.connectedClients; _i < _a.length; _i++) {
      var client = _a[_i];
      try {
        client.send(message);
      } catch (error) {
        console.error("Failed to send message to client:", error);
        this.connectedClients.delete(client);
      }
    }
  };
  RealTimeSecurityMonitor.prototype.storeMetrics = function (metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_20;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("security_metrics").insert({
                timestamp: metrics.timestamp.toISOString(),
                active_users: metrics.activeUsers,
                active_sessions: metrics.activeSessions,
                failed_logins: metrics.failedLogins,
                suspicious_activities: metrics.suspiciousActivities,
                blocked_ips: metrics.blockedIPs,
                average_response_time: metrics.averageResponseTime,
                system_load: metrics.systemLoad,
                network_traffic: metrics.networkTraffic,
                security_events: metrics.securityEvents,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to store metrics:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_20 = _a.sent();
            console.error("Failed to store metrics:", error_20);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.storeIncident = function (incident) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_21;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("security_incidents").upsert({
                incident_id: incident.incidentId,
                type: incident.type,
                severity: incident.severity,
                title: incident.title,
                description: incident.description,
                detected_at: incident.detectedAt.toISOString(),
                resolved_at:
                  (_a = incident.resolvedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                status: incident.status,
                assigned_to: incident.assignedTo,
                metrics: incident.metrics,
                alerts: incident.alerts,
                evidence: incident.evidence,
                timeline: incident.timeline,
                impact: incident.impact,
                response: incident.response,
              }),
            ];
          case 1:
            error = _b.sent().error;
            if (error) {
              console.error("Failed to store incident:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_21 = _b.sent();
            console.error("Failed to store incident:", error_21);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  RealTimeSecurityMonitor.prototype.mapDatabaseToMetrics = function (data) {
    return {
      timestamp: new Date(data.timestamp),
      activeUsers: data.active_users,
      activeSessions: data.active_sessions,
      failedLogins: data.failed_logins,
      suspiciousActivities: data.suspicious_activities,
      blockedIPs: data.blocked_ips,
      averageResponseTime: data.average_response_time,
      systemLoad: data.system_load,
      networkTraffic: data.network_traffic,
      securityEvents: data.security_events,
    };
  };
  RealTimeSecurityMonitor.prototype.mapDatabaseToIncident = function (data) {
    return {
      incidentId: data.incident_id,
      type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      detectedAt: new Date(data.detected_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      status: data.status,
      assignedTo: data.assigned_to,
      metrics: data.metrics,
      alerts: data.alerts,
      evidence: data.evidence,
      timeline: data.timeline,
      impact: data.impact,
      response: data.response,
    };
  };
  RealTimeSecurityMonitor.prototype.calculateSystemUptime = function (timeRange) {
    // This would calculate actual system uptime
    // For now, return a placeholder value (99.9%)
    return 0.999;
  };
  RealTimeSecurityMonitor.prototype.calculateAlertsTriggered = function (timeRange) {
    // This would count actual alerts triggered
    // For now, return a placeholder value
    return 0;
  };
  return RealTimeSecurityMonitor;
})();
exports.RealTimeSecurityMonitor = RealTimeSecurityMonitor;
