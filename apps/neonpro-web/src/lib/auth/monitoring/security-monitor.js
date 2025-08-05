// Real-time Security Monitoring System
// Advanced threat detection and automated response for session security
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMonitor = void 0;
exports.getSecurityMonitor = getSecurityMonitor;
var session_config_1 = require("@/lib/auth/config/session-config");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var suspicious_activity_detector_1 = require("@/lib/auth/suspicious/suspicious-activity-detector");
var SecurityMonitor = /** @class */ (() => {
  function SecurityMonitor() {
    this.suspiciousActivityDetector = (0,
    suspicious_activity_detector_1.getSuspiciousActivityDetector)();
    this.activeThreats = new Map();
    this.monitoringRules = new Map();
    this.alertQueue = [];
    this.monitoringInterval = null;
    this.isMonitoring = false;
    this.eventListeners = new Map();
    this.config = session_config_1.SessionConfig.getInstance();
    this.utils = new session_utils_1.SessionUtils();
    this.securityMetrics = this.initializeMetrics();
    this.initializeMonitoringRules();
  }
  /**
   * Initialize security metrics
   */
  SecurityMonitor.prototype.initializeMetrics = () => ({
    totalThreats: 0,
    activeThreats: 0,
    resolvedThreats: 0,
    falsePositives: 0,
    averageResponseTime: 0,
    threatsByType: {},
    threatsBySeverity: {},
    mitigationSuccess: 0,
    lastUpdated: Date.now(),
  });
  /**
   * Initialize default monitoring rules
   */
  SecurityMonitor.prototype.initializeMonitoringRules = function () {
    var rules = [
      {
        id: "brute_force_detection",
        name: "Brute Force Attack Detection",
        description: "Detects multiple failed login attempts from same IP",
        threatType: "brute_force_attack",
        conditions: [
          { field: "failed_attempts", operator: "greater_than", value: 5, weight: 0.8 },
          { field: "time_window", operator: "less_than", value: 300000, weight: 0.6 }, // 5 minutes
        ],
        actions: [
          { type: "block_ip", parameters: { duration: 3600000 }, delay: 0 }, // 1 hour
          { type: "alert_admin", parameters: { priority: "high" }, delay: 1000 },
        ],
        enabled: true,
        priority: 1,
        cooldown: 60000, // 1 minute
      },
      {
        id: "session_hijacking_detection",
        name: "Session Hijacking Detection",
        description: "Detects suspicious session usage patterns",
        threatType: "session_hijacking",
        conditions: [
          { field: "location_change", operator: "equals", value: true, weight: 0.7 },
          { field: "device_change", operator: "equals", value: true, weight: 0.6 },
          { field: "user_agent_change", operator: "equals", value: true, weight: 0.5 },
        ],
        actions: [
          { type: "suspend_session", parameters: {}, delay: 0 },
          { type: "require_mfa", parameters: {}, delay: 1000 },
        ],
        enabled: true,
        priority: 2,
        cooldown: 30000,
      },
      {
        id: "privilege_escalation_detection",
        name: "Privilege Escalation Detection",
        description: "Detects unauthorized access to privileged resources",
        threatType: "privilege_escalation",
        conditions: [
          { field: "unauthorized_endpoint", operator: "equals", value: true, weight: 0.9 },
          { field: "role_mismatch", operator: "equals", value: true, weight: 0.8 },
        ],
        actions: [
          { type: "suspend_session", parameters: {}, delay: 0 },
          { type: "alert_admin", parameters: { priority: "critical" }, delay: 500 },
          { type: "log_incident", parameters: { category: "security" }, delay: 1000 },
        ],
        enabled: true,
        priority: 3,
        cooldown: 0, // No cooldown for critical threats
      },
      {
        id: "automated_bot_detection",
        name: "Automated Bot Detection",
        description: "Detects bot-like behavior patterns",
        threatType: "malicious_automation",
        conditions: [
          { field: "request_frequency", operator: "greater_than", value: 100, weight: 0.7 },
          { field: "mouse_movement_pattern", operator: "equals", value: "bot_like", weight: 0.8 },
          { field: "typing_pattern", operator: "equals", value: "automated", weight: 0.6 },
        ],
        actions: [
          { type: "rate_limit", parameters: { limit: 10, window: 60000 }, delay: 0 },
          { type: "require_mfa", parameters: {}, delay: 2000 },
        ],
        enabled: true,
        priority: 4,
        cooldown: 120000, // 2 minutes
      },
      {
        id: "data_exfiltration_detection",
        name: "Data Exfiltration Detection",
        description: "Detects unusual data access patterns",
        threatType: "data_exfiltration",
        conditions: [
          { field: "data_volume", operator: "greater_than", value: 1000000, weight: 0.8 }, // 1MB
          { field: "access_frequency", operator: "greater_than", value: 50, weight: 0.6 },
          { field: "off_hours_access", operator: "equals", value: true, weight: 0.5 },
        ],
        actions: [
          { type: "quarantine_user", parameters: {}, delay: 0 },
          { type: "backup_data", parameters: {}, delay: 1000 },
          { type: "alert_admin", parameters: { priority: "critical" }, delay: 500 },
        ],
        enabled: true,
        priority: 5,
        cooldown: 0,
      },
    ];
    rules.forEach((rule) => {
      this.monitoringRules.set(rule.id, rule);
    });
  };
  /**
   * Start security monitoring
   */
  SecurityMonitor.prototype.startMonitoring = function () {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performSecurityScan();
    }, 10000); // Scan every 10 seconds
    console.log("Security monitoring started");
    this.emit("monitoring_started", { timestamp: Date.now() });
  };
  /**
   * Stop security monitoring
   */
  SecurityMonitor.prototype.stopMonitoring = function () {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log("Security monitoring stopped");
    this.emit("monitoring_stopped", { timestamp: Date.now() });
  };
  /**
   * Perform comprehensive security scan
   */
  SecurityMonitor.prototype.performSecurityScan = function () {
    return __awaiter(this, void 0, void 0, function () {
      var recentAnomalies, _i, recentAnomalies_1, anomaly, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 10]);
            return [4 /*yield*/, this.getRecentAnomalies()];
          case 1:
            recentAnomalies = _a.sent();
            (_i = 0), (recentAnomalies_1 = recentAnomalies);
            _a.label = 2;
          case 2:
            if (!(_i < recentAnomalies_1.length)) return [3 /*break*/, 5];
            anomaly = recentAnomalies_1[_i];
            return [4 /*yield*/, this.analyzeAnomalyForThreats(anomaly)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            // Check active sessions for threats
            return [4 /*yield*/, this.scanActiveSessions()];
          case 6:
            // Check active sessions for threats
            _a.sent();
            // Process threat queue
            return [4 /*yield*/, this.processThreatQueue()];
          case 7:
            // Process threat queue
            _a.sent();
            // Update security metrics
            this.updateSecurityMetrics();
            // Send pending alerts
            return [4 /*yield*/, this.processPendingAlerts()];
          case 8:
            // Send pending alerts
            _a.sent();
            return [3 /*break*/, 10];
          case 9:
            error_1 = _a.sent();
            console.error("Error in security scan:", error_1);
            return [3 /*break*/, 10];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get recent anomalies from suspicious activity detector
   */
  SecurityMonitor.prototype.getRecentAnomalies = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would typically fetch from database or cache
        // For now, we'll simulate with recent data
        return [2 /*return*/, []];
      });
    });
  };
  /**
   * Analyze anomaly for potential security threats
   */
  SecurityMonitor.prototype.analyzeAnomalyForThreats = function (anomaly) {
    return __awaiter(this, void 0, void 0, function () {
      var threatType, threat, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            threatType = this.mapAnomalyToThreatType(anomaly.alertType);
            return [4 /*yield*/, this.createThreatFromAnomaly(anomaly, threatType)];
          case 1:
            threat = _a.sent();
            if (!threat) return [3 /*break*/, 3];
            return [4 /*yield*/, this.processThreat(threat)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Error analyzing anomaly for threats:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create threat from anomaly
   */
  SecurityMonitor.prototype.createThreatFromAnomaly = function (anomaly, threatType) {
    return __awaiter(this, void 0, void 0, function () {
      var threat;
      return __generator(this, function (_a) {
        try {
          threat = {
            id: this.utils.generateSessionToken(),
            type: threatType,
            severity: anomaly.severity,
            source: this.determineThreatSource(anomaly),
            target: {
              type: "user",
              id: anomaly.userId,
              details: { sessionId: anomaly.sessionId },
            },
            description: "Security threat detected: ".concat(anomaly.description),
            indicators: this.extractThreatIndicators(anomaly),
            riskScore: anomaly.riskScore,
            confidence: anomaly.evidence.statisticalSignificance,
            status: "active",
            detectedAt: Date.now(),
            mitigationActions: [],
            falsePositive: false,
          };
          return [2 /*return*/, threat];
        } catch (error) {
          console.error("Error creating threat from anomaly:", error);
          return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Process detected threat
   */
  SecurityMonitor.prototype.processThreat = function (threat) {
    return __awaiter(this, void 0, void 0, function () {
      var applicableRules, _i, applicableRules_1, rule, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            // Store threat
            this.activeThreats.set(threat.id, threat);
            applicableRules = this.findApplicableRules(threat);
            (_i = 0), (applicableRules_1 = applicableRules);
            _a.label = 1;
          case 1:
            if (!(_i < applicableRules_1.length)) return [3 /*break*/, 4];
            rule = applicableRules_1[_i];
            if (!this.canTriggerRule(rule)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.executeRuleActions(rule, threat)];
          case 2:
            _a.sent();
            rule.lastTriggered = Date.now();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            // Create security alert
            return [4 /*yield*/, this.createSecurityAlert(threat)];
          case 5:
            // Create security alert
            _a.sent();
            // Log security event
            return [4 /*yield*/, this.logSecurityEvent(threat)];
          case 6:
            // Log security event
            _a.sent();
            // Emit threat detected event
            this.emit("threat_detected", threat);
            console.log(
              "Security threat detected: "
                .concat(threat.type, " (Risk: ")
                .concat(threat.riskScore, ")"),
            );
            return [3 /*break*/, 8];
          case 7:
            error_3 = _a.sent();
            console.error("Error processing threat:", error_3);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute rule actions for threat
   */
  SecurityMonitor.prototype.executeRuleActions = function (rule, threat) {
    return __awaiter(this, void 0, void 0, function () {
      var _loop_1, this_1, _i, _a, action;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _loop_1 = function (action) {
              var mitigationAction, error_4;
              return __generator(this, (_c) => {
                switch (_c.label) {
                  case 0:
                    _c.trys.push([0, 4, , 5]);
                    if (!(action.delay > 0)) return [3 /*break*/, 2];
                    return [
                      4 /*yield*/,
                      new Promise((resolve) => setTimeout(resolve, action.delay)),
                    ];
                  case 1:
                    _c.sent();
                    _c.label = 2;
                  case 2:
                    // Check condition if specified
                    if (action.condition && !this_1.evaluateCondition(action.condition, threat)) {
                      return [2 /*return*/, "continue"];
                    }
                    return [
                      4 /*yield*/,
                      this_1.executeMitigationAction(action.type, action.parameters, threat),
                    ];
                  case 3:
                    mitigationAction = _c.sent();
                    if (mitigationAction) {
                      threat.mitigationActions.push(mitigationAction);
                    }
                    return [3 /*break*/, 5];
                  case 4:
                    error_4 = _c.sent();
                    console.error("Error executing action ".concat(action.type, ":"), error_4);
                    return [3 /*break*/, 5];
                  case 5:
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (_a = rule.actions);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            action = _a[_i];
            return [5 /*yield**/, _loop_1(action)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute mitigation action
   */
  SecurityMonitor.prototype.executeMitigationAction = function (type, parameters, threat) {
    return __awaiter(this, void 0, void 0, function () {
      var action, _a, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 23, , 24]);
            action = {
              id: this.utils.generateSessionToken(),
              type: type,
              description: "Automated ".concat(type, " action for threat ").concat(threat.id),
              automated: true,
              executedAt: Date.now(),
              result: "pending",
              details: parameters,
            };
            _a = type;
            switch (_a) {
              case "block_ip":
                return [3 /*break*/, 1];
              case "suspend_session":
                return [3 /*break*/, 3];
              case "require_mfa":
                return [3 /*break*/, 5];
              case "rate_limit":
                return [3 /*break*/, 7];
              case "quarantine_user":
                return [3 /*break*/, 9];
              case "alert_admin":
                return [3 /*break*/, 11];
              case "log_incident":
                return [3 /*break*/, 13];
              case "backup_data":
                return [3 /*break*/, 15];
              case "isolate_system":
                return [3 /*break*/, 17];
              case "force_logout":
                return [3 /*break*/, 19];
            }
            return [3 /*break*/, 21];
          case 1:
            return [4 /*yield*/, this.blockIpAddress(threat, parameters)];
          case 2:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 3:
            return [
              4 /*yield*/,
              this.suspendSession(
                threat.target.details.sessionId,
                "Security threat: ".concat(threat.type),
              ),
            ];
          case 4:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 5:
            return [4 /*yield*/, this.requireMfa(threat.target.details.sessionId)];
          case 6:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 7:
            return [4 /*yield*/, this.applyRateLimit(threat, parameters)];
          case 8:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 9:
            return [4 /*yield*/, this.quarantineUser(threat.target.id)];
          case 10:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 11:
            return [4 /*yield*/, this.alertAdministrators(threat, parameters)];
          case 12:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 13:
            return [4 /*yield*/, this.logIncident(threat, parameters)];
          case 14:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 15:
            return [4 /*yield*/, this.backupUserData(threat.target.id)];
          case 16:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 17:
            return [4 /*yield*/, this.isolateSystem(threat)];
          case 18:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 19:
            return [4 /*yield*/, this.forceLogout(threat.target.id)];
          case 20:
            _b.sent();
            action.result = "success";
            return [3 /*break*/, 22];
          case 21:
            action.result = "failed";
            action.details.error = "Unknown mitigation type";
            _b.label = 22;
          case 22:
            return [2 /*return*/, action];
          case 23:
            error_5 = _b.sent();
            console.error("Error executing mitigation action ".concat(type, ":"), error_5);
            return [
              2 /*return*/,
              {
                id: this.utils.generateSessionToken(),
                type: type,
                description: "Failed ".concat(type, " action for threat ").concat(threat.id),
                automated: true,
                executedAt: Date.now(),
                result: "failed",
                details: __assign({ error: error_5.message }, parameters),
              },
            ];
          case 24:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Mitigation action implementations
   */
  SecurityMonitor.prototype.blockIpAddress = function (threat, parameters) {
    return __awaiter(this, void 0, void 0, function () {
      var ipIndicator;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            ipIndicator = threat.indicators.find((i) => i.type === "ip_address");
            if (!ipIndicator) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              fetch("/api/security/block-ip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ip: ipIndicator.value,
                  duration: parameters.duration || 3600000,
                  reason: "Security threat: ".concat(threat.type),
                }),
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
  SecurityMonitor.prototype.suspendSession = function (sessionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/suspend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: sessionId, reason: reason }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.requireMfa = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/require-mfa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: sessionId }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.applyRateLimit = function (threat, parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/security/rate-limit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: threat.target.id,
                  limit: parameters.limit || 10,
                  window: parameters.window || 60000,
                }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.quarantineUser = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/users/quarantine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userId }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.alertAdministrators = function (threat, parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/security/alert-admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  threatId: threat.id,
                  priority: parameters.priority || "medium",
                  message: threat.description,
                }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.logIncident = function (threat, parameters) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/security/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  threatId: threat.id,
                  category: parameters.category || "security",
                  severity: threat.severity,
                  details: threat,
                }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.backupUserData = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/users/backup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userId }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.isolateSystem = function (threat) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        console.log("System isolation triggered for threat ".concat(threat.id));
        return [2 /*return*/];
      });
    });
  };
  SecurityMonitor.prototype.forceLogout = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/users/force-logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userId }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Utility methods
   */
  SecurityMonitor.prototype.mapAnomalyToThreatType = (anomalyType) => {
    var mapping = {
      unusual_typing_pattern: "suspicious_behavior",
      abnormal_mouse_behavior: "malicious_automation",
      suspicious_navigation: "unauthorized_access",
      unusual_api_usage: "privilege_escalation",
      off_hours_access: "insider_threat",
      location_anomaly: "account_takeover",
      device_anomaly: "session_hijacking",
      rapid_actions: "malicious_automation",
      bot_like_behavior: "malicious_automation",
      credential_stuffing: "credential_stuffing",
      session_hijacking: "session_hijacking",
      privilege_escalation: "privilege_escalation",
    };
    return mapping[anomalyType] || "suspicious_behavior";
  };
  SecurityMonitor.prototype.determineThreatSource = (anomaly) => {
    if (anomaly.alertType.includes("location")) return "suspicious_location";
    if (anomaly.alertType.includes("device")) return "unknown_device";
    if (anomaly.alertType.includes("bot")) return "automated_bot";
    if (anomaly.alertType.includes("credential")) return "compromised_account";
    return "internal_user";
  };
  SecurityMonitor.prototype.extractThreatIndicators = function (anomaly) {
    var indicators = [];
    // Extract indicators from anomaly evidence
    if (anomaly.evidence.comparisonData) {
      Object.entries(anomaly.evidence.comparisonData).forEach((_a) => {
        var key = _a[0],
          value = _a[1];
        indicators.push({
          type: this.mapFieldToIndicatorType(key),
          value: String(value),
          confidence: anomaly.evidence.statisticalSignificance,
          source: "anomaly_detector",
          timestamp: anomaly.timestamp,
        });
      });
    }
    return indicators;
  };
  SecurityMonitor.prototype.mapFieldToIndicatorType = (field) => {
    var mapping = {
      ip: "ip_address",
      userAgent: "user_agent",
      sessionId: "session_id",
      userId: "user_id",
      endpoint: "endpoint",
      behavior: "behavior_pattern",
      time: "time_pattern",
      location: "location",
      device: "device_fingerprint",
    };
    return mapping[field] || "behavior_pattern";
  };
  SecurityMonitor.prototype.findApplicableRules = function (threat) {
    return Array.from(this.monitoringRules.values())
      .filter((rule) => rule.enabled && rule.threatType === threat.type)
      .sort((a, b) => a.priority - b.priority);
  };
  SecurityMonitor.prototype.canTriggerRule = (rule) => {
    if (!rule.lastTriggered) return true;
    return Date.now() - rule.lastTriggered >= rule.cooldown;
  };
  SecurityMonitor.prototype.evaluateCondition = (condition, threat) => {
    try {
      // Simple condition evaluation - in production, use a proper expression evaluator
      return eval(condition.replace(/threat\./g, "threat."));
    } catch (_a) {
      return false;
    }
  };
  SecurityMonitor.prototype.scanActiveSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  SecurityMonitor.prototype.processThreatQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  SecurityMonitor.prototype.updateSecurityMetrics = function () {
    var now = Date.now();
    var activeThreats = Array.from(this.activeThreats.values());
    this.securityMetrics = {
      totalThreats: activeThreats.length,
      activeThreats: activeThreats.filter((t) => t.status === "active").length,
      resolvedThreats: activeThreats.filter((t) => t.status === "resolved").length,
      falsePositives: activeThreats.filter((t) => t.falsePositive).length,
      averageResponseTime: this.calculateAverageResponseTime(activeThreats),
      threatsByType: this.groupThreatsByType(activeThreats),
      threatsBySeverity: this.groupThreatsBySeverity(activeThreats),
      mitigationSuccess: this.calculateMitigationSuccess(activeThreats),
      lastUpdated: now,
    };
  };
  SecurityMonitor.prototype.calculateAverageResponseTime = (threats) => {
    var resolvedThreats = threats.filter((t) => t.resolvedAt);
    if (resolvedThreats.length === 0) return 0;
    var totalTime = resolvedThreats.reduce((sum, t) => sum + (t.resolvedAt - t.detectedAt), 0);
    return totalTime / resolvedThreats.length;
  };
  SecurityMonitor.prototype.groupThreatsByType = (threats) => {
    var groups = {};
    threats.forEach((threat) => {
      groups[threat.type] = (groups[threat.type] || 0) + 1;
    });
    return groups;
  };
  SecurityMonitor.prototype.groupThreatsBySeverity = (threats) => {
    var groups = {};
    threats.forEach((threat) => {
      groups[threat.severity] = (groups[threat.severity] || 0) + 1;
    });
    return groups;
  };
  SecurityMonitor.prototype.calculateMitigationSuccess = (threats) => {
    var threatsWithActions = threats.filter((t) => t.mitigationActions.length > 0);
    if (threatsWithActions.length === 0) return 0;
    var successfulActions = threatsWithActions.reduce(
      (sum, t) => sum + t.mitigationActions.filter((a) => a.result === "success").length,
      0,
    );
    var totalActions = threatsWithActions.reduce((sum, t) => sum + t.mitigationActions.length, 0);
    return totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;
  };
  SecurityMonitor.prototype.createSecurityAlert = function (threat) {
    return __awaiter(this, void 0, void 0, function () {
      var alert;
      return __generator(this, function (_a) {
        alert = {
          id: this.utils.generateSessionToken(),
          threatId: threat.id,
          type: "threat_detected",
          severity: threat.severity,
          title: "Security Threat Detected: ".concat(threat.type),
          message: threat.description,
          recipients: ["security@company.com"], // Configure as needed
          channels: ["email", "dashboard"],
          sentAt: Date.now(),
          acknowledged: false,
        };
        this.alertQueue.push(alert);
        return [2 /*return*/];
      });
    });
  };
  SecurityMonitor.prototype.processPendingAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alert_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(this.alertQueue.length > 0)) return [3 /*break*/, 2];
            alert_1 = this.alertQueue.shift();
            return [4 /*yield*/, this.sendAlert(alert_1)];
          case 1:
            _a.sent();
            return [3 /*break*/, 0];
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.sendAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/security/alerts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alert),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error sending security alert:", error_6);
            // Re-queue alert for retry
            this.alertQueue.push(alert);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.logSecurityEvent = function (threat) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/security/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "threat_detected",
                  severity: threat.severity,
                  userId: threat.target.id,
                  sessionId: threat.target.details.sessionId,
                  description: threat.description,
                  metadata: {
                    threatId: threat.id,
                    threatType: threat.type,
                    riskScore: threat.riskScore,
                    indicators: threat.indicators,
                    mitigationActions: threat.mitigationActions,
                  },
                }),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            console.error("Error logging security event:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Event system
   */
  SecurityMonitor.prototype.on = function (event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  };
  SecurityMonitor.prototype.off = function (event, callback) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      var index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
  SecurityMonitor.prototype.emit = function (event, data) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in event listener for ".concat(event, ":"), error);
        }
      });
    }
  };
  /**
   * Public API methods
   */
  SecurityMonitor.prototype.getActiveThreats = function () {
    return Array.from(this.activeThreats.values()).filter((threat) => threat.status === "active");
  };
  SecurityMonitor.prototype.getThreatById = function (threatId) {
    return this.activeThreats.get(threatId);
  };
  SecurityMonitor.prototype.resolveThreat = function (threatId, falsePositive) {
    if (falsePositive === void 0) {
      falsePositive = false;
    }
    var threat = this.activeThreats.get(threatId);
    if (threat) {
      threat.status = "resolved";
      threat.resolvedAt = Date.now();
      threat.falsePositive = falsePositive;
      this.emit("threat_resolved", threat);
      return true;
    }
    return false;
  };
  SecurityMonitor.prototype.getSecurityMetrics = function () {
    return __assign({}, this.securityMetrics);
  };
  SecurityMonitor.prototype.addMonitoringRule = function (rule) {
    this.monitoringRules.set(rule.id, rule);
  };
  SecurityMonitor.prototype.removeMonitoringRule = function (ruleId) {
    return this.monitoringRules.delete(ruleId);
  };
  SecurityMonitor.prototype.getMonitoringRules = function () {
    return Array.from(this.monitoringRules.values());
  };
  SecurityMonitor.prototype.isMonitoringActive = function () {
    return this.isMonitoring;
  };
  SecurityMonitor.prototype.cleanup = function () {
    var now = Date.now();
    var maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    // Clean up old threats
    for (var _i = 0, _a = this.activeThreats.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        id = _b[0],
        threat = _b[1];
      if (threat.status === "resolved" && now - threat.detectedAt > maxAge) {
        this.activeThreats.delete(id);
      }
    }
  };
  SecurityMonitor.prototype.destroy = function () {
    this.stopMonitoring();
    this.activeThreats.clear();
    this.monitoringRules.clear();
    this.eventListeners.clear();
    this.alertQueue.length = 0;
  };
  return SecurityMonitor;
})();
exports.SecurityMonitor = SecurityMonitor;
// Singleton instance
var securityMonitor = null;
function getSecurityMonitor() {
  if (!securityMonitor) {
    securityMonitor = new SecurityMonitor();
  }
  return securityMonitor;
}
exports.default = SecurityMonitor;
