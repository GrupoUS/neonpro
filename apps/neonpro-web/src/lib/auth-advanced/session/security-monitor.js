/**
 * Security Monitor - Advanced Security Monitoring
 *
 * Provides real-time security monitoring, threat detection, and anomaly analysis
 * for session management with intelligent risk assessment and automated responses.
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.SecurityMonitor = void 0;
var events_1 = require("events");
var SecurityMonitor = /** @class */ ((_super) => {
  __extends(SecurityMonitor, _super);
  function SecurityMonitor(config, supabase) {
    var _this = _super.call(this) || this;
    _this.threatIntelCache = new Map();
    _this.userBehaviorProfiles = new Map();
    _this.suspiciousIPs = new Set();
    _this.blockedIPs = new Set();
    _this.config = config;
    _this.supabase = supabase;
    _this.initializeSecurityData();
    return _this;
  }
  // ============================================================================
  // SESSION SECURITY VALIDATION
  // ============================================================================
  /**
   * Validate session creation security
   */
  SecurityMonitor.prototype.validateSessionCreation = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var reasons,
        events,
        securityScore,
        ipReputation,
        geoRisk,
        deviceRisk,
        behaviorRisk,
        rateLimitViolation,
        concurrentViolation,
        allowed,
        event_1,
        _a,
        _b,
        error_1;
      var _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 13, , 14]);
            reasons = [];
            events = [];
            securityScore = 100;
            return [4 /*yield*/, this.checkIPReputation(params.ipAddress)];
          case 1:
            ipReputation = _e.sent();
            if (ipReputation.isMalicious) {
              reasons.push("Malicious IP detected");
              securityScore -= 50;
            }
            if (ipReputation.isProxy || ipReputation.isVPN) {
              reasons.push("Proxy/VPN detected");
              securityScore -= 20;
            }
            if (ipReputation.isTor) {
              reasons.push("Tor network detected");
              securityScore -= 30;
            }
            if (!params.location) return [3 /*break*/, 3];
            return [4 /*yield*/, this.assessGeographicRisk(params.location, params.userId)];
          case 2:
            geoRisk = _e.sent();
            if (geoRisk.isHighRisk) {
              reasons.push("High-risk location: ".concat(geoRisk.reasons.join(", ")));
              securityScore -= geoRisk.riskScore;
            }
            _e.label = 3;
          case 3:
            return [4 /*yield*/, this.analyzeDeviceRisk(params.deviceFingerprint, params.userId)];
          case 4:
            deviceRisk = _e.sent();
            if (deviceRisk.isCompromised) {
              reasons.push("Device risk detected: ".concat(deviceRisk.indicators.join(", ")));
              securityScore -= deviceRisk.riskScore;
            }
            return [
              4 /*yield*/,
              this.analyzeBehaviorRisk(params.userId, {
                ipAddress: params.ipAddress,
                location: params.location,
                deviceFingerprint: params.deviceFingerprint,
              }),
            ];
          case 5:
            behaviorRisk = _e.sent();
            if (behaviorRisk.isAnomalous) {
              reasons.push("Behavioral anomaly: ".concat(behaviorRisk.patterns.join(", ")));
              securityScore -= behaviorRisk.riskScore;
            }
            return [4 /*yield*/, this.checkRateLimit(params.userId, params.ipAddress)];
          case 6:
            rateLimitViolation = _e.sent();
            if (rateLimitViolation) {
              reasons.push("Rate limit exceeded");
              securityScore -= 25;
            }
            return [4 /*yield*/, this.checkConcurrentSessions(params.userId)];
          case 7:
            concurrentViolation = _e.sent();
            if (concurrentViolation) {
              reasons.push("Concurrent session limit exceeded");
              securityScore -= 15;
            }
            allowed =
              securityScore >= this.config.suspiciousActivityThreshold &&
              !this.blockedIPs.has(params.ipAddress);
            if (!(!allowed || reasons.length > 0)) return [3 /*break*/, 12];
            _a = this.createSecurityEvent;
            _c = {
              userId: params.userId,
              eventType: "suspicious_login",
              severity: this.calculateSeverity(securityScore),
              description: "Session creation security validation: Score ".concat(securityScore),
            };
            _d = {
              reasons: reasons,
              securityScore: securityScore,
              ipReputation: ipReputation,
            };
            if (!params.location) return [3 /*break*/, 9];
            return [4 /*yield*/, this.assessGeographicRisk(params.location, params.userId)];
          case 8:
            _b = _e.sent();
            return [3 /*break*/, 10];
          case 9:
            _b = null;
            _e.label = 10;
          case 10:
            return [
              4 /*yield*/,
              _a.apply(this, [
                ((_c.details =
                  ((_d.geoRisk = _b),
                  (_d.deviceRisk = deviceRisk),
                  (_d.behaviorRisk = behaviorRisk),
                  _d)),
                (_c.ipAddress = params.ipAddress),
                (_c.location = params.location),
                _c),
              ]),
            ];
          case 11:
            event_1 = _e.sent();
            events.push(event_1);
            _e.label = 12;
          case 12:
            return [
              2 /*return*/,
              {
                allowed: allowed,
                securityScore: Math.max(0, securityScore),
                reasons: reasons,
                events: events,
              },
            ];
          case 13:
            error_1 = _e.sent();
            console.error("Security validation failed:", error_1);
            return [
              2 /*return*/,
              {
                allowed: false,
                securityScore: 0,
                reasons: ["Security validation error"],
                events: [],
              },
            ];
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate ongoing session activity
   */
  SecurityMonitor.prototype.validateSessionActivity = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var reasons,
        events,
        hijackingRisk,
        event_2,
        activityAnomaly,
        event_3,
        privilegeEscalation,
        event_4,
        allowed,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, , 11]);
            reasons = [];
            events = [];
            return [4 /*yield*/, this.detectSessionHijacking(session)];
          case 1:
            hijackingRisk = _a.sent();
            if (!hijackingRisk.detected) return [3 /*break*/, 3];
            reasons.push(
              "Session hijacking detected: ".concat(hijackingRisk.indicators.join(", ")),
            );
            return [
              4 /*yield*/,
              this.createSecurityEvent({
                sessionId: session.id,
                userId: session.userId,
                eventType: "session_hijack_attempt",
                severity: "critical",
                description: "Potential session hijacking detected",
                details: hijackingRisk,
                ipAddress: session.ipAddress,
                location: session.location,
              }),
            ];
          case 2:
            event_2 = _a.sent();
            events.push(event_2);
            _a.label = 3;
          case 3:
            return [4 /*yield*/, this.detectActivityAnomalies(session)];
          case 4:
            activityAnomaly = _a.sent();
            if (!activityAnomaly.detected) return [3 /*break*/, 6];
            reasons.push("Activity anomaly: ".concat(activityAnomaly.patterns.join(", ")));
            return [
              4 /*yield*/,
              this.createSecurityEvent({
                sessionId: session.id,
                userId: session.userId,
                eventType: "data_access_anomaly",
                severity: "medium",
                description: "Unusual activity pattern detected",
                details: activityAnomaly,
                ipAddress: session.ipAddress,
                location: session.location,
              }),
            ];
          case 5:
            event_3 = _a.sent();
            events.push(event_3);
            _a.label = 6;
          case 6:
            return [4 /*yield*/, this.detectPrivilegeEscalation(session)];
          case 7:
            privilegeEscalation = _a.sent();
            if (!privilegeEscalation.detected) return [3 /*break*/, 9];
            reasons.push(
              "Privilege escalation attempt: ".concat(privilegeEscalation.attempts.join(", ")),
            );
            return [
              4 /*yield*/,
              this.createSecurityEvent({
                sessionId: session.id,
                userId: session.userId,
                eventType: "privilege_escalation",
                severity: "high",
                description: "Privilege escalation attempt detected",
                details: privilegeEscalation,
                ipAddress: session.ipAddress,
                location: session.location,
              }),
            ];
          case 8:
            event_4 = _a.sent();
            events.push(event_4);
            _a.label = 9;
          case 9:
            allowed = reasons.length === 0;
            return [
              2 /*return*/,
              {
                allowed: allowed,
                reasons: reasons,
                events: events,
              },
            ];
          case 10:
            error_2 = _a.sent();
            console.error("Session activity validation failed:", error_2);
            return [
              2 /*return*/,
              {
                allowed: false,
                reasons: ["Activity validation error"],
                events: [],
              },
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // THREAT INTELLIGENCE
  // ============================================================================
  /**
   * Check IP reputation using multiple sources
   */
  SecurityMonitor.prototype.checkIPReputation = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var cached, maliciousIP, reputation, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            cached = this.threatIntelCache.get(ipAddress);
            if (cached && Date.now() - cached.timestamp < 3600000) {
              // 1 hour cache
              return [2 /*return*/, cached.ipReputation];
            }
            // Check internal blacklist
            if (this.blockedIPs.has(ipAddress)) {
              return [
                2 /*return*/,
                {
                  isMalicious: true,
                  isProxy: false,
                  isVPN: false,
                  isTor: false,
                  riskScore: 100,
                  sources: ["internal_blacklist"],
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase.from("malicious_ips").select("*").eq("ip_address", ipAddress).single(),
            ];
          case 1:
            maliciousIP = _a.sent().data;
            if (maliciousIP) {
              return [
                2 /*return*/,
                {
                  isMalicious: true,
                  isProxy: maliciousIP.is_proxy || false,
                  isVPN: maliciousIP.is_vpn || false,
                  isTor: maliciousIP.is_tor || false,
                  riskScore: maliciousIP.risk_score || 100,
                  sources: ["database"],
                },
              ];
            }
            return [4 /*yield*/, this.queryExternalThreatIntel(ipAddress)];
          case 2:
            reputation = _a.sent();
            // Cache result
            this.threatIntelCache.set(ipAddress, {
              ipReputation: reputation,
              timestamp: Date.now(),
            });
            return [2 /*return*/, reputation];
          case 3:
            error_3 = _a.sent();
            console.error("IP reputation check failed:", error_3);
            return [
              2 /*return*/,
              {
                isMalicious: false,
                isProxy: false,
                isVPN: false,
                isTor: false,
                riskScore: 0,
                sources: [],
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Assess geographic risk based on location and user history
   */
  SecurityMonitor.prototype.assessGeographicRisk = function (location, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var reasons,
        riskScore,
        highRiskCountries,
        userLocations,
        typicalCountries,
        lastLocation,
        error_4;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            reasons = [];
            riskScore = 0;
            highRiskCountries = ["CN", "RU", "KP", "IR"];
            if (highRiskCountries.includes(location.country)) {
              reasons.push("High-risk country");
              riskScore += 30;
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("location")
                .eq("user_id", userId)
                .not("location", "is", null)
                .order("created_at", { ascending: false })
                .limit(10),
            ];
          case 1:
            userLocations = _b.sent().data;
            if (userLocations && userLocations.length > 0) {
              typicalCountries = new Set(
                userLocations
                  .map((s) => {
                    var _a;
                    return (_a = s.location) === null || _a === void 0 ? void 0 : _a.country;
                  })
                  .filter(Boolean),
              );
              if (!typicalCountries.has(location.country)) {
                reasons.push("Unusual country for user");
                riskScore += 20;
              }
              lastLocation =
                (_a = userLocations[0]) === null || _a === void 0 ? void 0 : _a.location;
              if (lastLocation && this.isImpossibleTravel(lastLocation, location)) {
                reasons.push("Impossible travel detected");
                riskScore += 40;
              }
            }
            return [
              2 /*return*/,
              {
                isHighRisk: riskScore > 25,
                riskScore: riskScore,
                reasons: reasons,
              },
            ];
          case 2:
            error_4 = _b.sent();
            console.error("Geographic risk assessment failed:", error_4);
            return [
              2 /*return*/,
              {
                isHighRisk: false,
                riskScore: 0,
                reasons: [],
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Analyze device risk based on fingerprint and history
   */
  SecurityMonitor.prototype.analyzeDeviceRisk = function (fingerprint, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var indicators, riskScore, userDevices, isKnownDevice, error_5;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            indicators = [];
            riskScore = 0;
            // Check for suspicious user agent patterns
            if (this.isSuspiciousUserAgent(fingerprint.userAgent)) {
              indicators.push("Suspicious user agent");
              riskScore += 15;
            }
            // Check for automation indicators
            if (this.hasAutomationIndicators(fingerprint)) {
              indicators.push("Automation detected");
              riskScore += 25;
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("*")
                .eq("user_id", userId)
                .eq("is_trusted", true),
            ];
          case 1:
            userDevices = _a.sent().data;
            if (userDevices && userDevices.length > 0) {
              isKnownDevice = userDevices.some((device) =>
                _this.compareDeviceFingerprints(device.device_fingerprint, fingerprint),
              );
              if (!isKnownDevice) {
                indicators.push("Unknown device");
                riskScore += 10;
              }
            }
            return [
              2 /*return*/,
              {
                isCompromised: riskScore > 20,
                riskScore: riskScore,
                indicators: indicators,
              },
            ];
          case 2:
            error_5 = _a.sent();
            console.error("Device risk analysis failed:", error_5);
            return [
              2 /*return*/,
              {
                isCompromised: false,
                riskScore: 0,
                indicators: [],
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Analyze user behavior for anomalies
   */
  SecurityMonitor.prototype.analyzeBehaviorRisk = function (userId, currentContext) {
    return __awaiter(this, void 0, void 0, function () {
      var patterns, riskScore, profile, currentHour, recentAttempts, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            patterns = [];
            riskScore = 0;
            profile = this.userBehaviorProfiles.get(userId);
            if (profile) return [3 /*break*/, 2];
            return [4 /*yield*/, this.buildUserBehaviorProfile(userId)];
          case 1:
            profile = _a.sent();
            this.userBehaviorProfiles.set(userId, profile);
            _a.label = 2;
          case 2:
            currentHour = new Date().getHours();
            if (!profile.typicalLoginHours.includes(currentHour)) {
              patterns.push("Unusual login time");
              riskScore += 10;
            }
            // Check IP address patterns
            if (!profile.knownIPs.has(currentContext.ipAddress)) {
              patterns.push("New IP address");
              riskScore += 15;
            }
            // Check location patterns
            if (
              currentContext.location &&
              !this.isTypicalLocation(profile, currentContext.location)
            ) {
              patterns.push("Unusual location");
              riskScore += 20;
            }
            return [4 /*yield*/, this.getRecentLoginAttempts(userId)];
          case 3:
            recentAttempts = _a.sent();
            if (recentAttempts > 5) {
              patterns.push("Rapid login attempts");
              riskScore += 25;
            }
            return [
              2 /*return*/,
              {
                isAnomalous: riskScore > 15,
                riskScore: riskScore,
                patterns: patterns,
              },
            ];
          case 4:
            error_6 = _a.sent();
            console.error("Behavior risk analysis failed:", error_6);
            return [
              2 /*return*/,
              {
                isAnomalous: false,
                riskScore: 0,
                patterns: [],
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // ANOMALY DETECTION
  // ============================================================================
  /**
   * Detect potential session hijacking
   */
  SecurityMonitor.prototype.detectSessionHijacking = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var indicators,
        confidence,
        sessionHistory,
        uniqueIPs,
        userAgentHistory,
        uniqueUserAgents,
        activityPattern,
        error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            indicators = [];
            confidence = 0;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_activities")
                .select("ip_address, timestamp")
                .eq("session_id", session.id)
                .order("timestamp", { ascending: false })
                .limit(10),
            ];
          case 2:
            sessionHistory = _a.sent().data;
            if (sessionHistory && sessionHistory.length > 1) {
              uniqueIPs = new Set(sessionHistory.map((h) => h.ip_address));
              if (uniqueIPs.size > 1) {
                indicators.push("IP address changed during session");
                confidence += 40;
              }
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("session_activities")
                .select("user_agent, timestamp")
                .eq("session_id", session.id)
                .order("timestamp", { ascending: false })
                .limit(5),
            ];
          case 3:
            userAgentHistory = _a.sent().data;
            if (userAgentHistory && userAgentHistory.length > 1) {
              uniqueUserAgents = new Set(userAgentHistory.map((h) => h.user_agent));
              if (uniqueUserAgents.size > 1) {
                indicators.push("User agent changed during session");
                confidence += 30;
              }
            }
            return [4 /*yield*/, this.analyzeActivityPattern(session.id)];
          case 4:
            activityPattern = _a.sent();
            if (activityPattern.isImpossible) {
              indicators.push("Impossible activity pattern");
              confidence += 50;
            }
            return [
              2 /*return*/,
              {
                detected: confidence > 50,
                indicators: indicators,
                confidence: confidence,
              },
            ];
          case 5:
            error_7 = _a.sent();
            console.error("Session hijacking detection failed:", error_7);
            return [
              2 /*return*/,
              {
                detected: false,
                indicators: [],
                confidence: 0,
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Detect activity anomalies
   */
  SecurityMonitor.prototype.detectActivityAnomalies = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var patterns, severity, recentActivity, dataAccessPattern, privilegeAttempts, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            patterns = [];
            severity = "low";
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_activities")
                .select("timestamp, action")
                .eq("session_id", session.id)
                .gte("timestamp", new Date(Date.now() - 60000).toISOString()) // Last minute
                .order("timestamp", { ascending: false }),
            ];
          case 2:
            recentActivity = _a.sent().data;
            if (recentActivity && recentActivity.length > 100) {
              patterns.push("Excessive request rate");
              severity = "high";
            }
            return [4 /*yield*/, this.analyzeDataAccessPattern(session.userId)];
          case 3:
            dataAccessPattern = _a.sent();
            if (dataAccessPattern.isUnusual) {
              patterns.push("Unusual data access pattern");
              severity = "medium";
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("session_activities")
                .select("action, success")
                .eq("session_id", session.id)
                .like("action", "%admin%")
                .eq("success", false),
            ];
          case 4:
            privilegeAttempts = _a.sent().data;
            if (privilegeAttempts && privilegeAttempts.length > 3) {
              patterns.push("Multiple privilege escalation attempts");
              severity = "high";
            }
            return [
              2 /*return*/,
              {
                detected: patterns.length > 0,
                patterns: patterns,
                severity: severity,
              },
            ];
          case 5:
            error_8 = _a.sent();
            console.error("Activity anomaly detection failed:", error_8);
            return [
              2 /*return*/,
              {
                detected: false,
                patterns: [],
                severity: "low",
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Detect privilege escalation attempts
   */
  SecurityMonitor.prototype.detectPrivilegeEscalation = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var attempts,
        riskLevel,
        adminAttempts,
        failedAttempts,
        roleAttempts,
        permissionAttempts,
        error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            attempts = [];
            riskLevel = 0;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_activities")
                .select("action, resource, success, timestamp")
                .eq("session_id", session.id)
                .or("action.like.%admin%,resource.like.%admin%")
                .order("timestamp", { ascending: false })
                .limit(10),
            ];
          case 2:
            adminAttempts = _a.sent().data;
            if (adminAttempts && adminAttempts.length > 0) {
              failedAttempts = adminAttempts.filter((a) => !a.success);
              if (failedAttempts.length > 2) {
                attempts.push("Multiple failed admin access attempts");
                riskLevel += 30;
              }
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("session_activities")
                .select("action, details")
                .eq("session_id", session.id)
                .like("action", "%role%")
                .order("timestamp", { ascending: false }),
            ];
          case 3:
            roleAttempts = _a.sent().data;
            if (roleAttempts && roleAttempts.length > 0) {
              attempts.push("Role manipulation attempts");
              riskLevel += 25;
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("session_activities")
                .select("action, success")
                .eq("session_id", session.id)
                .eq("success", false)
                .like("action", "%unauthorized%"),
            ];
          case 4:
            permissionAttempts = _a.sent().data;
            if (permissionAttempts && permissionAttempts.length > 5) {
              attempts.push("Multiple unauthorized access attempts");
              riskLevel += 20;
            }
            return [
              2 /*return*/,
              {
                detected: riskLevel > 25,
                attempts: attempts,
                riskLevel: riskLevel,
              },
            ];
          case 5:
            error_9 = _a.sent();
            console.error("Privilege escalation detection failed:", error_9);
            return [
              2 /*return*/,
              {
                detected: false,
                attempts: [],
                riskLevel: 0,
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  SecurityMonitor.prototype.checkRateLimit = function (userId, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var fiveMinutesAgo, recentAttempts, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .select("id")
                .eq("user_id", userId)
                .eq("ip_address", ipAddress)
                .eq("action", "session_created")
                .gte("timestamp", fiveMinutesAgo.toISOString()),
            ];
          case 1:
            recentAttempts = _a.sent().data;
            return [
              2 /*return*/,
              ((recentAttempts === null || recentAttempts === void 0
                ? void 0
                : recentAttempts.length) || 0) > 10,
            ];
          case 2:
            error_10 = _a.sent();
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.checkConcurrentSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var activeSessions, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("id")
                .eq("user_id", userId)
                .eq("is_active", true)
                .gte("expires_at", new Date().toISOString()),
            ];
          case 1:
            activeSessions = _a.sent().data;
            return [
              2 /*return*/,
              ((activeSessions === null || activeSessions === void 0
                ? void 0
                : activeSessions.length) || 0) >= this.config.maxConcurrentSessions,
            ];
          case 2:
            error_11 = _a.sent();
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.calculateSeverity = (securityScore) => {
    if (securityScore < 25) return "critical";
    if (securityScore < 50) return "high";
    if (securityScore < 75) return "medium";
    return "low";
  };
  SecurityMonitor.prototype.createSecurityEvent = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var event;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            event = {
              id: "sec_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
              sessionId: params.sessionId || "",
              userId: params.userId,
              clinicId: "", // Will be filled from user data
              eventType: params.eventType,
              severity: params.severity,
              description: params.description,
              details: params.details,
              ipAddress: params.ipAddress,
              userAgent: "",
              location: params.location,
              timestamp: new Date(),
              resolved: false,
              actions: this.determineSecurityActions(params.severity),
            };
            // Store in database
            return [
              4 /*yield*/,
              this.supabase.from("session_security_events").insert({
                id: event.id,
                session_id: event.sessionId,
                user_id: event.userId,
                event_type: event.eventType,
                severity: event.severity,
                description: event.description,
                details: event.details,
                ip_address: event.ipAddress,
                location: event.location,
                timestamp: event.timestamp.toISOString(),
                resolved: event.resolved,
                actions: event.actions,
              }),
            ];
          case 1:
            // Store in database
            _a.sent();
            this.emit("security_event", event);
            return [2 /*return*/, event];
        }
      });
    });
  };
  SecurityMonitor.prototype.determineSecurityActions = (severity) => {
    switch (severity) {
      case "critical":
        return ["terminate_session", "block_device", "notify_admin", "escalate_incident"];
      case "high":
        return ["require_mfa", "send_alert", "notify_admin"];
      case "medium":
        return ["send_alert", "log_event"];
      case "low":
      default:
        return ["log_event"];
    }
  };
  SecurityMonitor.prototype.queryExternalThreatIntel = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Placeholder for external threat intelligence integration
        // In a real implementation, this would query services like:
        // - VirusTotal
        // - AbuseIPDB
        // - Shodan
        // - Custom threat feeds
        return [
          2 /*return*/,
          {
            isMalicious: false,
            isProxy: false,
            isVPN: false,
            isTor: false,
            riskScore: 0,
            sources: ["external_api"],
          },
        ];
      });
    });
  };
  SecurityMonitor.prototype.isImpossibleTravel = function (lastLocation, currentLocation) {
    if (
      !lastLocation.latitude ||
      !lastLocation.longitude ||
      !currentLocation.latitude ||
      !currentLocation.longitude
    ) {
      return false;
    }
    // Calculate distance between locations
    var distance = this.calculateDistance(
      lastLocation.latitude,
      lastLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude,
    );
    // Assume maximum travel speed of 1000 km/h (commercial flight)
    var maxSpeed = 1000; // km/h
    var timeDiff = 1; // hours (simplified for this example)
    var maxDistance = maxSpeed * timeDiff;
    return distance > maxDistance;
  };
  SecurityMonitor.prototype.calculateDistance = function (lat1, lon1, lat2, lon2) {
    var R = 6371; // Earth's radius in kilometers
    var dLat = this.toRadians(lat2 - lat1);
    var dLon = this.toRadians(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  SecurityMonitor.prototype.toRadians = (degrees) => degrees * (Math.PI / 180);
  SecurityMonitor.prototype.isSuspiciousUserAgent = (userAgent) => {
    var suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];
    return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
  };
  SecurityMonitor.prototype.hasAutomationIndicators = (fingerprint) => {
    // Check for automation indicators
    return (
      fingerprint.hardwareConcurrency > 16 || // Unusual CPU count
      fingerprint.maxTouchPoints === 0 || // No touch support (headless)
      !fingerprint.cookieEnabled || // Cookies disabled
      fingerprint.doNotTrack === true // DNT enabled (common in automation)
    );
  };
  SecurityMonitor.prototype.compareDeviceFingerprints = (stored, current) => {
    // Simplified fingerprint comparison
    return (
      stored.userAgent === current.userAgent &&
      stored.screenResolution === current.screenResolution &&
      stored.timezone === current.timezone &&
      stored.language === current.language
    );
  };
  SecurityMonitor.prototype.buildUserBehaviorProfile = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var sessions, profile_1, loginHours, locations, durations, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(50),
            ];
          case 1:
            sessions = _a.sent().data;
            profile_1 = {
              userId: userId,
              typicalLoginHours: [],
              knownIPs: new Set(),
              typicalLocations: [],
              averageSessionDuration: 0,
              lastUpdated: new Date(),
            };
            if (sessions && sessions.length > 0) {
              loginHours = sessions.map((s) => new Date(s.created_at).getHours());
              profile_1.typicalLoginHours = __spreadArray([], new Set(loginHours), true);
              // Extract known IPs
              sessions.forEach((s) => profile_1.knownIPs.add(s.ip_address));
              locations = sessions
                .map((s) => s.location)
                .filter(Boolean)
                .map((l) => "".concat(l.country, "-").concat(l.region));
              profile_1.typicalLocations = __spreadArray([], new Set(locations), true);
              durations = sessions
                .filter((s) => s.terminated_at)
                .map((s) => new Date(s.terminated_at).getTime() - new Date(s.created_at).getTime());
              profile_1.averageSessionDuration =
                durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
            }
            return [2 /*return*/, profile_1];
          case 2:
            error_12 = _a.sent();
            console.error("Failed to build user behavior profile:", error_12);
            return [
              2 /*return*/,
              {
                userId: userId,
                typicalLoginHours: [],
                knownIPs: new Set(),
                typicalLocations: [],
                averageSessionDuration: 0,
                lastUpdated: new Date(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.isTypicalLocation = (profile, location) => {
    var locationKey = "".concat(location.country, "-").concat(location.region);
    return profile.typicalLocations.includes(locationKey);
  };
  SecurityMonitor.prototype.getRecentLoginAttempts = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var fiveMinutesAgo, attempts, error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .select("id")
                .eq("user_id", userId)
                .eq("action", "session_created")
                .gte("timestamp", fiveMinutesAgo.toISOString()),
            ];
          case 1:
            attempts = _a.sent().data;
            return [
              2 /*return*/,
              (attempts === null || attempts === void 0 ? void 0 : attempts.length) || 0,
            ];
          case 2:
            error_13 = _a.sent();
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SecurityMonitor.prototype.analyzeActivityPattern = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Placeholder for activity pattern analysis
        return [
          2 /*return*/,
          {
            isImpossible: false,
            reasons: [],
          },
        ];
      });
    });
  };
  SecurityMonitor.prototype.analyzeDataAccessPattern = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Placeholder for data access pattern analysis
        return [
          2 /*return*/,
          {
            isUnusual: false,
            patterns: [],
          },
        ];
      });
    });
  };
  SecurityMonitor.prototype.initializeSecurityData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var blockedIPs, suspiciousIPs, error_14;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.supabase.from("blocked_ips").select("ip_address")];
          case 1:
            blockedIPs = _a.sent().data;
            if (blockedIPs) {
              blockedIPs.forEach((ip) => _this.blockedIPs.add(ip.ip_address));
            }
            return [4 /*yield*/, this.supabase.from("suspicious_ips").select("ip_address")];
          case 2:
            suspiciousIPs = _a.sent().data;
            if (suspiciousIPs) {
              suspiciousIPs.forEach((ip) => _this.suspiciousIPs.add(ip.ip_address));
            }
            return [3 /*break*/, 4];
          case 3:
            error_14 = _a.sent();
            console.error("Failed to initialize security data:", error_14);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Add IP to block list
   */
  SecurityMonitor.prototype.blockIP = function (ipAddress, reason) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.blockedIPs.add(ipAddress);
            return [
              4 /*yield*/,
              this.supabase.from("blocked_ips").upsert({
                ip_address: ipAddress,
                reason: reason,
                blocked_at: new Date().toISOString(),
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
   * Remove IP from block list
   */
  SecurityMonitor.prototype.unblockIP = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.blockedIPs.delete(ipAddress);
            return [
              4 /*yield*/,
              this.supabase.from("blocked_ips").delete().eq("ip_address", ipAddress),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  return SecurityMonitor;
})(events_1.EventEmitter);
exports.SecurityMonitor = SecurityMonitor;
