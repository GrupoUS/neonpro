"use strict";
// Security Monitor Service
// Story 1.4: Session Management & Security Implementation
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.SecurityMonitor = void 0;
var events_1 = require("events");
var config_1 = require("./config");
var SecurityMonitor = /** @class */ (function (_super) {
  __extends(SecurityMonitor, _super);
  function SecurityMonitor(supabase) {
    var _this = _super.call(this) || this;
    _this.activeMonitoring = new Map();
    _this.riskCache = new Map();
    _this.alertQueue = [];
    _this.supabase = supabase;
    _this.metrics = _this.initializeMetrics();
    _this.startMetricsCollection();
    return _this;
  }
  // Real-time Security Monitoring
  SecurityMonitor.prototype.startMonitoring = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var monitoringKey, interval;
      var _this = this;
      return __generator(this, function (_a) {
        monitoringKey = "".concat(session.user_id, "-").concat(session.id);
        // Stop existing monitoring for this session
        this.stopMonitoring(session.id);
        interval = setInterval(function () {
          return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  _a.trys.push([0, 2, , 3]);
                  return [4 /*yield*/, this.performSecurityCheck(session)];
                case 1:
                  _a.sent();
                  return [3 /*break*/, 3];
                case 2:
                  error_1 = _a.sent();
                  console.error("Error in security monitoring:", error_1);
                  return [3 /*break*/, 3];
                case 3:
                  return [2 /*return*/];
              }
            });
          });
        }, 30000);
        this.activeMonitoring.set(monitoringKey, interval);
        // Emit monitoring started event
        this.emit("monitoring_started", { sessionId: session.id, userId: session.user_id });
        return [2 /*return*/];
      });
    });
  };
  SecurityMonitor.prototype.stopMonitoring = function (sessionId) {
    // Find and clear monitoring for this session
    for (var _i = 0, _a = this.activeMonitoring.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        interval = _b[1];
      if (key.includes(sessionId)) {
        clearInterval(interval);
        this.activeMonitoring.delete(key);
        break;
      }
    }
    this.emit("monitoring_stopped", { sessionId: sessionId });
  };
  // Suspicious Activity Detection
  SecurityMonitor.prototype.detectSuspiciousActivity = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      var suspiciousEvents, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            suspiciousEvents = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            // Check for unusual login times
            if (this.isUnusualLoginTime(activity.timestamp)) {
              suspiciousEvents.push("unusual_activity");
            }
            return [4 /*yield*/, this.detectRapidRequests(session.user_id, activity.timestamp)];
          case 2:
            // Check for rapid successive requests
            if (_a.sent()) {
              suspiciousEvents.push("brute_force_attempt");
            }
            return [4 /*yield*/, this.detectImpossibleTravel(session, activity)];
          case 3:
            // Check for impossible travel
            if (_a.sent()) {
              suspiciousEvents.push("suspicious_location");
            }
            return [4 /*yield*/, this.detectDeviceAnomaly(session, activity)];
          case 4:
            // Check for device anomalies
            if (_a.sent()) {
              suspiciousEvents.push("suspicious_device");
            }
            // Check for privilege escalation
            if (this.detectPrivilegeEscalation(activity)) {
              suspiciousEvents.push("privilege_escalation_attempt");
            }
            return [4 /*yield*/, this.detectSessionHijacking(session, activity)];
          case 5:
            // Check for session hijacking indicators
            if (_a.sent()) {
              suspiciousEvents.push("session_hijack_attempt");
            }
            return [2 /*return*/, suspiciousEvents];
          case 6:
            error_2 = _a.sent();
            console.error("Error detecting suspicious activity:", error_2);
            return [2 /*return*/, []];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // Risk Score Calculation
  SecurityMonitor.prototype.calculateRiskScore = function (session_1, activity_1) {
    return __awaiter(this, arguments, void 0, function (session, activity, useCache) {
      var cacheKey, cached, riskScore, _a, _b, _c, finalScore, error_3;
      if (useCache === void 0) {
        useCache = true;
      }
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            cacheKey = "".concat(session.id, "-").concat(activity.type, "-").concat(Date.now());
            // Check cache first
            if (useCache) {
              cached = this.riskCache.get(cacheKey);
              if (cached && Date.now() - cached.timestamp.getTime() < 60000) {
                // 1 minute cache
                return [2 /*return*/, cached.score];
              }
            }
            riskScore = 0;
            _d.label = 1;
          case 1:
            _d.trys.push([1, 5, , 6]);
            // Base session risk
            riskScore += this.calculateSessionRisk(session);
            // Location risk
            _a = riskScore;
            return [4 /*yield*/, this.calculateLocationRisk(session.location)];
          case 2:
            // Location risk
            riskScore = _a + _d.sent();
            // Device risk
            _b = riskScore;
            return [4 /*yield*/, this.calculateDeviceRisk(session.device_fingerprint)];
          case 3:
            // Device risk
            riskScore = _b + _d.sent();
            // Activity pattern risk
            riskScore += this.calculateActivityRisk(activity);
            // Time-based risk
            riskScore += this.calculateTimeRisk(activity.timestamp);
            // Historical risk (user's past behavior)
            _c = riskScore;
            return [4 /*yield*/, this.calculateHistoricalRisk(session.user_id)];
          case 4:
            // Historical risk (user's past behavior)
            riskScore = _c + _d.sent();
            finalScore = Math.min(riskScore, 100);
            // Cache the result
            this.riskCache.set(cacheKey, {
              score: finalScore,
              timestamp: new Date(),
            });
            return [2 /*return*/, finalScore];
          case 5:
            error_3 = _d.sent();
            console.error("Error calculating risk score:", error_3);
            return [2 /*return*/, 50]; // Default medium risk
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Security Event Handling
  SecurityMonitor.prototype.handleSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_1, actions, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.createSecurityAlert(event)];
          case 1:
            alert_1 = _a.sent();
            // Add to alert queue
            this.alertQueue.push(alert_1);
            // Update metrics
            this.updateMetrics(event);
            actions = this.determineSecurityActions(alert_1);
            alert_1.actions = actions;
            // Execute immediate actions
            return [4 /*yield*/, this.executeSecurityActions(alert_1)];
          case 2:
            // Execute immediate actions
            _a.sent();
            // Emit security event
            this.emit("security_event", alert_1);
            // Store in database
            return [4 /*yield*/, this.storeSecurityEvent(event)];
          case 3:
            // Store in database
            _a.sent();
            return [2 /*return*/, alert_1];
          case 4:
            error_4 = _a.sent();
            console.error("Error handling security event:", error_4);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Security Metrics
  SecurityMonitor.prototype.getSecurityMetrics = function () {
    return __assign({}, this.metrics);
  };
  SecurityMonitor.prototype.getSecurityMetricsForPeriod = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var events, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_security_events")
                .select("*")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString()),
            ];
          case 1:
            events = _a.sent().data;
            return [2 /*return*/, this.calculateMetricsFromEvents(events || [])];
          case 2:
            error_5 = _a.sent();
            console.error("Error getting security metrics:", error_5);
            return [2 /*return*/, this.initializeMetrics()];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private Methods
  SecurityMonitor.prototype.performSecurityCheck = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var idleTime, idleTimeoutMs, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            // Check session validity
            if (!session.is_active || new Date() > session.expires_at) {
              this.stopMonitoring(session.id);
              return [2 /*return*/];
            }
            idleTime = Date.now() - new Date(session.last_activity).getTime();
            idleTimeoutMs = 30 * 60 * 1000;
            if (!(idleTime > idleTimeoutMs)) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.handleSecurityEvent({
                session_id: session.id,
                user_id: session.user_id,
                event_type: "session_timeout",
                event_category: "session",
                severity: "medium",
                description: "Session idle timeout detected",
                metadata: { idle_time: idleTime },
                ip_address: session.ip_address,
                device_fingerprint: session.device_fingerprint,
                risk_score: 30,
                is_blocked: false,
                resolution_status: "pending",
              }),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            // Check for concurrent session violations
            return [4 /*yield*/, this.checkConcurrentSessions(session)];
          case 3:
            // Check for concurrent session violations
            _a.sent();
            // Check for location anomalies
            return [4 /*yield*/, this.checkLocationAnomalies(session)];
          case 4:
            // Check for location anomalies
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_6 = _a.sent();
            console.error("Error in security check:", error_6);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.isUnusualLoginTime = function (timestamp) {
    var hour = timestamp.getHours();
    var business_hours = config_1.SUSPICIOUS_ACTIVITY_PATTERNS.UNUSUAL_HOURS.business_hours;
    return hour < business_hours.start || hour > business_hours.end;
  };
  SecurityMonitor.prototype.detectRapidRequests = function (userId, timestamp) {
    return __awaiter(this, void 0, void 0, function () {
      var max_requests_per_minute, oneMinuteAgo, recentEvents;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            max_requests_per_minute =
              config_1.SUSPICIOUS_ACTIVITY_PATTERNS.RAPID_REQUESTS.max_requests_per_minute;
            oneMinuteAgo = new Date(timestamp.getTime() - 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .select("id")
                .eq("user_id", userId)
                .gte("timestamp", oneMinuteAgo.toISOString())
                .lte("timestamp", timestamp.toISOString()),
            ];
          case 1:
            recentEvents = _a.sent().data;
            return [
              2 /*return*/,
              ((recentEvents === null || recentEvents === void 0 ? void 0 : recentEvents.length) ||
                0) > max_requests_per_minute,
            ];
        }
      });
    });
  };
  SecurityMonitor.prototype.detectImpossibleTravel = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      var lastSession, distance, timeDiff, timeDiffHours, maxSpeed;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!session.location || !activity.location) {
              return [2 /*return*/, false];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("location, last_activity")
                .eq("user_id", session.user_id)
                .neq("id", session.id)
                .order("last_activity", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            lastSession = _a.sent().data;
            if (!lastSession || !lastSession.location) {
              return [2 /*return*/, false];
            }
            distance = this.calculateDistance(lastSession.location, session.location);
            timeDiff =
              new Date(activity.timestamp).getTime() -
              new Date(lastSession.last_activity).getTime();
            timeDiffHours = timeDiff / (1000 * 60 * 60);
            maxSpeed = config_1.SUSPICIOUS_ACTIVITY_PATTERNS.IMPOSSIBLE_TRAVEL.max_speed_kmh;
            // Check if travel speed is humanly possible
            return [2 /*return*/, distance / timeDiffHours > maxSpeed];
        }
      });
    });
  };
  SecurityMonitor.prototype.detectDeviceAnomaly = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Check for device fingerprint changes
        if (
          activity.device_fingerprint &&
          activity.device_fingerprint !== session.device_fingerprint
        ) {
          return [2 /*return*/, true];
        }
        // Check for unusual user agent changes
        if (
          activity.user_agent &&
          !this.isUserAgentSimilar(
            activity.user_agent,
            "".concat(session.browser_name, " ").concat(session.browser_version),
          )
        ) {
          return [2 /*return*/, true];
        }
        return [2 /*return*/, false];
      });
    });
  };
  SecurityMonitor.prototype.detectPrivilegeEscalation = function (activity) {
    // Check for attempts to access higher privilege resources
    var privilegedActions = [
      "admin_access",
      "user_management",
      "system_configuration",
      "financial_data_access",
    ];
    return activity.action && privilegedActions.includes(activity.action);
  };
  SecurityMonitor.prototype.detectSessionHijacking = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Check for multiple IPs using the same session
        if (activity.ip_address && activity.ip_address !== session.ip_address) {
          return [2 /*return*/, true];
        }
        // Check for session token anomalies
        if (activity.session_token && activity.session_token !== session.session_token) {
          return [2 /*return*/, true];
        }
        return [2 /*return*/, false];
      });
    });
  };
  SecurityMonitor.prototype.calculateSessionRisk = function (session) {
    var risk = 0;
    if (!session.is_trusted) risk += 20;
    if (session.security_level === "high") risk += 15;
    if (session.security_level === "critical") risk += 30;
    return risk;
  };
  SecurityMonitor.prototype.calculateLocationRisk = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      var risk;
      return __generator(this, function (_a) {
        if (!location) return [2 /*return*/, 0];
        risk = 0;
        // Check high-risk countries
        if (config_1.LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(location.country)) {
          risk += 40;
        }
        // Check for VPN/Proxy usage
        if (location.isVPN || location.isProxy) {
          risk += 25;
        }
        return [2 /*return*/, risk];
      });
    });
  };
  SecurityMonitor.prototype.calculateDeviceRisk = function (deviceFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var device;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("trust_score, risk_indicators")
                .eq("device_fingerprint", deviceFingerprint)
                .single(),
            ];
          case 1:
            device = _b.sent().data;
            if (!device) {
              return [2 /*return*/, 30]; // Unknown device
            }
            return [
              2 /*return*/,
              Math.max(0, 100 - device.trust_score) +
                (((_a = device.risk_indicators) === null || _a === void 0 ? void 0 : _a.length) ||
                  0) *
                  5,
            ];
        }
      });
    });
  };
  SecurityMonitor.prototype.calculateActivityRisk = function (activity) {
    var risk = 0;
    // High-risk activities
    var highRiskActivities = [
      "password_change",
      "mfa_disable",
      "user_creation",
      "permission_change",
    ];
    if (highRiskActivities.includes(activity.type)) {
      risk += 20;
    }
    return risk;
  };
  SecurityMonitor.prototype.calculateTimeRisk = function (timestamp) {
    var hour = timestamp.getHours();
    // Higher risk during unusual hours
    if (hour >= 0 && hour <= 5) return 15; // Late night
    if (hour >= 22 && hour <= 23) return 10; // Late evening
    return 0;
  };
  SecurityMonitor.prototype.calculateHistoricalRisk = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var events, avgRiskScore, criticalEvents;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("session_security_events")
                .select("severity, risk_score")
                .eq("user_id", userId)
                .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
                .order("created_at", { ascending: false })
                .limit(10),
            ];
          case 1:
            events = _a.sent().data;
            if (!events || events.length === 0) {
              return [2 /*return*/, 0];
            }
            avgRiskScore =
              events.reduce(function (sum, event) {
                return sum + event.risk_score;
              }, 0) / events.length;
            criticalEvents = events.filter(function (event) {
              return event.severity === "critical";
            }).length;
            return [2 /*return*/, Math.min(avgRiskScore / 2 + criticalEvents * 10, 30)];
        }
      });
    });
  };
  SecurityMonitor.prototype.createSecurityAlert = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            id: "alert-".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2)),
            userId: event.user_id,
            sessionId: event.session_id,
            alertType: this.determineAlertType(event),
            severity: event.severity || "medium",
            title: this.generateAlertTitle(event),
            description: event.description || "Security event detected",
            riskScore: event.risk_score || 0,
            metadata: event.metadata || {},
            timestamp: new Date(),
            isResolved: false,
            autoResolve: event.severity === "low",
            actions: [],
          },
        ];
      });
    });
  };
  SecurityMonitor.prototype.determineAlertType = function (event) {
    if (event.severity === "critical" || event.severity === "high") {
      return "security_threat";
    }
    if (event.event_category === "authorization") {
      return "policy_violation";
    }
    return "suspicious_activity";
  };
  SecurityMonitor.prototype.generateAlertTitle = function (event) {
    var eventTitles = {
      login_failure: "Failed Login Attempt",
      brute_force_attempt: "Brute Force Attack Detected",
      suspicious_location: "Suspicious Location Access",
      suspicious_device: "Unrecognized Device Access",
      privilege_escalation_attempt: "Privilege Escalation Attempt",
      session_hijack_attempt: "Session Hijacking Attempt",
      unusual_activity: "Unusual Activity Detected",
    };
    return eventTitles[event.event_type] || "Security Event Detected";
  };
  SecurityMonitor.prototype.determineSecurityActions = function (alert) {
    var actions = [];
    // Always log the event
    actions.push({
      type: "log_event",
      parameters: { alert_id: alert.id },
      executed: false,
    });
    // Critical severity actions
    if (alert.severity === "critical") {
      actions.push({
        type: "terminate_session",
        parameters: { session_id: alert.sessionId },
        executed: false,
      });
      actions.push({
        type: "block_user",
        parameters: { user_id: alert.userId, duration: 30 },
        executed: false,
      });
      actions.push({
        type: "notify_admin",
        parameters: { alert_id: alert.id, priority: "high" },
        executed: false,
      });
    }
    // High severity actions
    if (alert.severity === "high") {
      actions.push({
        type: "require_mfa",
        parameters: { user_id: alert.userId },
        executed: false,
      });
      actions.push({
        type: "notify_admin",
        parameters: { alert_id: alert.id, priority: "medium" },
        executed: false,
      });
    }
    return actions;
  };
  SecurityMonitor.prototype.executeSecurityActions = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, action, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_i = 0), (_a = alert.actions);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            action = _a[_i];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.executeSecurityAction(action)];
          case 3:
            _b.sent();
            action.executed = true;
            action.executedAt = new Date();
            return [3 /*break*/, 5];
          case 4:
            error_7 = _b.sent();
            console.error("Error executing security action:", error_7);
            action.result = { error: error_7.message };
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
  SecurityMonitor.prototype.executeSecurityAction = function (action) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (action.type) {
          case "log_event":
            // Already logged
            break;
          case "terminate_session":
            // Would call session manager to terminate session
            this.emit("terminate_session", action.parameters);
            break;
          case "block_user":
            // Would add user to blocked list
            this.emit("block_user", action.parameters);
            break;
          case "require_mfa":
            // Would force MFA requirement
            this.emit("require_mfa", action.parameters);
            break;
          case "notify_admin":
            // Would send notification to administrators
            this.emit("notify_admin", action.parameters);
            break;
        }
        return [2 /*return*/];
      });
    });
  };
  SecurityMonitor.prototype.storeSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("session_security_events").insert(
                __assign(__assign({}, event), {
                  id: "event-"
                    .concat(Date.now(), "-")
                    .concat(Math.random().toString(36).substring(2)),
                  created_at: new Date(),
                }),
              ),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error storing security event:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            console.error("Error storing security event:", error_8);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.updateMetrics = function (event) {
    this.metrics.totalEvents++;
    if (event.severity === "critical") {
      this.metrics.criticalEvents++;
    }
    if (event.severity === "high" || event.severity === "critical") {
      this.metrics.highRiskEvents++;
    }
    if (event.is_blocked) {
      this.metrics.blockedAttempts++;
    }
    // Update event type counts
    if (event.event_type) {
      this.metrics.eventsByType[event.event_type] =
        (this.metrics.eventsByType[event.event_type] || 0) + 1;
    }
    // Update hourly distribution
    var hour = new Date().getHours();
    this.metrics.eventsByHour[hour] = (this.metrics.eventsByHour[hour] || 0) + 1;
  };
  SecurityMonitor.prototype.initializeMetrics = function () {
    return {
      totalEvents: 0,
      criticalEvents: 0,
      highRiskEvents: 0,
      blockedAttempts: 0,
      averageRiskScore: 0,
      topRiskFactors: [],
      eventsByType: {},
      eventsByHour: {},
      suspiciousLocations: [],
      suspiciousDevices: [],
    };
  };
  SecurityMonitor.prototype.calculateMetricsFromEvents = function (events) {
    var metrics = this.initializeMetrics();
    metrics.totalEvents = events.length;
    metrics.criticalEvents = events.filter(function (e) {
      return e.severity === "critical";
    }).length;
    metrics.highRiskEvents = events.filter(function (e) {
      return e.severity === "high" || e.severity === "critical";
    }).length;
    metrics.blockedAttempts = events.filter(function (e) {
      return e.is_blocked;
    }).length;
    if (events.length > 0) {
      metrics.averageRiskScore =
        events.reduce(function (sum, e) {
          return sum + e.risk_score;
        }, 0) / events.length;
    }
    return metrics;
  };
  SecurityMonitor.prototype.startMetricsCollection = function () {
    var _this = this;
    // Update metrics every 5 minutes
    setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          var last24Hours, _a, error_9;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                _b.trys.push([0, 2, , 3]);
                last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
                _a = this;
                return [4 /*yield*/, this.getSecurityMetricsForPeriod(last24Hours, new Date())];
              case 1:
                _a.metrics = _b.sent();
                return [3 /*break*/, 3];
              case 2:
                error_9 = _b.sent();
                console.error("Error updating metrics:", error_9);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      },
      5 * 60 * 1000,
    );
  };
  // Utility methods
  SecurityMonitor.prototype.calculateDistance = function (loc1, loc2) {
    // Simplified distance calculation (would use proper geolocation in production)
    // For now, return 0 to avoid complex calculations
    return 0;
  };
  SecurityMonitor.prototype.isUserAgentSimilar = function (ua1, ua2) {
    // Simple similarity check
    var normalize = function (ua) {
      return ua.toLowerCase().replace(/[^a-z0-9]/g, "");
    };
    var norm1 = normalize(ua1);
    var norm2 = normalize(ua2);
    // Check if they share at least 70% similarity
    var similarity = this.calculateStringSimilarity(norm1, norm2);
    return similarity > 0.7;
  };
  SecurityMonitor.prototype.calculateStringSimilarity = function (str1, str2) {
    var longer = str1.length > str2.length ? str1 : str2;
    var shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    var editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };
  SecurityMonitor.prototype.levenshteinDistance = function (str1, str2) {
    var matrix = [];
    for (var i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (var j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (var i = 1; i <= str2.length; i++) {
      for (var j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };
  SecurityMonitor.prototype.checkConcurrentSessions = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var activeSessions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("id, ip_address, device_fingerprint")
                .eq("user_id", session.user_id)
                .eq("is_active", true),
            ];
          case 1:
            activeSessions = _a.sent().data;
            if (!(activeSessions && activeSessions.length > 3)) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.handleSecurityEvent({
                session_id: session.id,
                user_id: session.user_id,
                event_type: "concurrent_session_limit",
                event_category: "session",
                severity: "medium",
                description: "Concurrent session limit exceeded",
                metadata: { active_sessions: activeSessions.length },
                ip_address: session.ip_address,
                device_fingerprint: session.device_fingerprint,
                risk_score: 40,
                is_blocked: false,
                resolution_status: "pending",
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.checkLocationAnomalies = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!session.location) return [2 /*return*/];
            if (
              !config_1.LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(session.location.country)
            )
              return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.handleSecurityEvent({
                session_id: session.id,
                user_id: session.user_id,
                event_type: "suspicious_location",
                event_category: "security",
                severity: "high",
                description: "Access from high-risk location: ".concat(session.location.country),
                metadata: { location: session.location },
                ip_address: session.ip_address,
                device_fingerprint: session.device_fingerprint,
                location: session.location,
                risk_score: 60,
                is_blocked: false,
                resolution_status: "pending",
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
  return SecurityMonitor;
})(events_1.EventEmitter);
exports.SecurityMonitor = SecurityMonitor;
