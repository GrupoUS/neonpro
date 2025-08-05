// Suspicious Activity Detection System
// Advanced behavioral analysis and anomaly detection for session security
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
exports.SuspiciousActivityDetector = void 0;
exports.getSuspiciousActivityDetector = getSuspiciousActivityDetector;
var session_config_1 = require("@/lib/auth/config/session-config");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var SuspiciousActivityDetector = /** @class */ (() => {
  function SuspiciousActivityDetector() {
    this.behaviorBaselines = new Map();
    this.activePatterns = new Map();
    this.anomalyAlerts = new Map();
    this.detectionRules = new Map();
    this.learningMode = true;
    this.analysisInterval = null;
    this.config = session_config_1.SessionConfig.getInstance();
    this.utils = new session_utils_1.SessionUtils();
    this.initializeDetectionRules();
    this.startContinuousAnalysis();
  }
  /**
   * Initialize default detection rules
   */
  SuspiciousActivityDetector.prototype.initializeDetectionRules = function () {
    var rules = [
      {
        id: "typing_speed_anomaly",
        name: "Unusual Typing Speed",
        description: "Detects significant deviations in typing speed patterns",
        patternTypes: ["typing_speed"],
        thresholds: { deviation: 50, confidence: 80 },
        severity: "medium",
        enabled: true,
        falsePositiveRate: 0.05,
        lastUpdated: Date.now(),
      },
      {
        id: "mouse_behavior_anomaly",
        name: "Abnormal Mouse Behavior",
        description: "Detects bot-like or unusual mouse movement patterns",
        patternTypes: ["mouse_movement"],
        thresholds: { deviation: 60, confidence: 85 },
        severity: "high",
        enabled: true,
        falsePositiveRate: 0.03,
        lastUpdated: Date.now(),
      },
      {
        id: "off_hours_access",
        name: "Off-Hours Access",
        description: "Detects access during unusual hours for the user",
        patternTypes: ["time_pattern"],
        thresholds: { deviation: 70, confidence: 90 },
        severity: "medium",
        enabled: true,
        falsePositiveRate: 0.08,
        lastUpdated: Date.now(),
      },
      {
        id: "location_anomaly",
        name: "Suspicious Location",
        description: "Detects access from unusual geographic locations",
        patternTypes: ["location_pattern"],
        thresholds: { deviation: 80, confidence: 95 },
        severity: "high",
        enabled: true,
        falsePositiveRate: 0.02,
        lastUpdated: Date.now(),
      },
      {
        id: "rapid_actions",
        name: "Rapid Action Sequence",
        description: "Detects unusually fast sequences of actions",
        patternTypes: ["interaction_frequency"],
        thresholds: { deviation: 75, confidence: 85 },
        severity: "high",
        enabled: true,
        falsePositiveRate: 0.04,
        lastUpdated: Date.now(),
      },
      {
        id: "privilege_escalation",
        name: "Privilege Escalation Attempt",
        description: "Detects attempts to access unauthorized resources",
        patternTypes: ["api_usage", "navigation_pattern"],
        thresholds: { deviation: 90, confidence: 95 },
        severity: "critical",
        enabled: true,
        falsePositiveRate: 0.01,
        lastUpdated: Date.now(),
      },
    ];
    rules.forEach((rule) => {
      this.detectionRules.set(rule.id, rule);
    });
  };
  /**
   * Start continuous behavioral analysis
   */
  SuspiciousActivityDetector.prototype.startContinuousAnalysis = function () {
    this.analysisInterval = setInterval(() => {
      this.performBehaviorAnalysis();
    }, 30000); // Analyze every 30 seconds
  };
  /**
   * Record user behavior data
   */
  SuspiciousActivityDetector.prototype.recordBehavior = function (
    userId,
    sessionId,
    behaviorType,
    metrics,
  ) {
    try {
      var pattern = {
        userId: userId,
        sessionId: sessionId,
        patternType: behaviorType,
        baseline: this.getBehaviorBaseline(userId),
        currentMetrics: this.mergeBehaviorMetrics(userId, metrics),
        anomalyScore: 0,
        confidence: 0,
        timestamp: Date.now(),
      };
      // Calculate anomaly score
      pattern.anomalyScore = this.calculateAnomalyScore(pattern);
      pattern.confidence = this.calculateConfidence(pattern);
      // Store pattern
      var userPatterns = this.activePatterns.get(userId) || [];
      userPatterns.push(pattern);
      // Keep only last 100 patterns per user
      if (userPatterns.length > 100) {
        userPatterns.shift();
      }
      this.activePatterns.set(userId, userPatterns);
      // Check for anomalies
      this.checkForAnomalies(pattern);
      // Update baseline if in learning mode
      if (this.learningMode && pattern.anomalyScore < 30) {
        this.updateBehaviorBaseline(userId, pattern);
      }
    } catch (error) {
      console.error("Error recording behavior:", error);
    }
  };
  /**
   * Record typing behavior
   */
  SuspiciousActivityDetector.prototype.recordTypingBehavior = function (
    userId,
    sessionId,
    typingSpeed,
    keyPressIntervals,
  ) {
    this.recordBehavior(userId, sessionId, "typing_speed", {
      currentTypingSpeed: typingSpeed,
    });
  };
  /**
   * Record mouse behavior
   */
  SuspiciousActivityDetector.prototype.recordMouseBehavior = function (
    userId,
    sessionId,
    mouseSpeed,
    clickPatterns,
  ) {
    this.recordBehavior(userId, sessionId, "mouse_movement", {
      currentMouseSpeed: mouseSpeed,
    });
  };
  /**
   * Record navigation behavior
   */
  SuspiciousActivityDetector.prototype.recordNavigationBehavior = function (
    userId,
    sessionId,
    navigationPath,
  ) {
    this.recordBehavior(userId, sessionId, "navigation_pattern", {
      navigationPath: navigationPath,
    });
  };
  /**
   * Record API usage behavior
   */
  SuspiciousActivityDetector.prototype.recordApiUsage = function (
    userId,
    sessionId,
    endpoint,
    frequency,
  ) {
    var userPatterns = this.activePatterns.get(userId) || [];
    var recentApiPatterns = userPatterns
      .filter((p) => p.patternType === "api_usage" && Date.now() - p.timestamp < 300000)
      .flatMap((p) => p.currentMetrics.apiEndpoints || []);
    recentApiPatterns.push(endpoint);
    this.recordBehavior(userId, sessionId, "api_usage", {
      apiEndpoints: recentApiPatterns,
      interactionFrequency: frequency,
    });
  };
  /**
   * Perform comprehensive behavior analysis
   */
  SuspiciousActivityDetector.prototype.performBehaviorAnalysis = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i,
        _a,
        _b,
        userId,
        patterns,
        recentPatterns,
        anomalies,
        _c,
        anomalies_1,
        anomaly,
        error_1;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 10, , 11]);
            (_i = 0), (_a = this.activePatterns.entries());
            _d.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 9];
            (_b = _a[_i]), (userId = _b[0]), (patterns = _b[1]);
            recentPatterns = patterns.filter(
              (p) => Date.now() - p.timestamp < 300000, // Last 5 minutes
            );
            if (recentPatterns.length === 0) return [3 /*break*/, 8];
            return [4 /*yield*/, this.detectAnomalies(userId, recentPatterns)];
          case 2:
            anomalies = _d.sent();
            (_c = 0), (anomalies_1 = anomalies);
            _d.label = 3;
          case 3:
            if (!(_c < anomalies_1.length)) return [3 /*break*/, 6];
            anomaly = anomalies_1[_c];
            return [4 /*yield*/, this.processAnomaly(anomaly)];
          case 4:
            _d.sent();
            _d.label = 5;
          case 5:
            _c++;
            return [3 /*break*/, 3];
          case 6:
            // Update risk scores
            return [4 /*yield*/, this.updateUserRiskScore(userId, recentPatterns)];
          case 7:
            // Update risk scores
            _d.sent();
            _d.label = 8;
          case 8:
            _i++;
            return [3 /*break*/, 1];
          case 9:
            return [3 /*break*/, 11];
          case 10:
            error_1 = _d.sent();
            console.error("Error in behavior analysis:", error_1);
            return [3 /*break*/, 11];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Detect anomalies in behavior patterns
   */
  SuspiciousActivityDetector.prototype.detectAnomalies = function (userId, patterns) {
    return __awaiter(this, void 0, void 0, function () {
      var anomalies, _loop_1, this_1, _i, _a, rule;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            anomalies = [];
            _loop_1 = function (rule) {
              var relevantPatterns, anomaly;
              return __generator(this, (_c) => {
                switch (_c.label) {
                  case 0:
                    if (!rule.enabled) return [2 /*return*/, "continue"];
                    relevantPatterns = patterns.filter((p) =>
                      rule.patternTypes.includes(p.patternType),
                    );
                    if (relevantPatterns.length === 0) return [2 /*return*/, "continue"];
                    return [4 /*yield*/, this_1.applyDetectionRule(userId, rule, relevantPatterns)];
                  case 1:
                    anomaly = _c.sent();
                    if (anomaly) {
                      anomalies.push(anomaly);
                    }
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (_a = this.detectionRules.values());
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            rule = _a[_i];
            return [5 /*yield**/, _loop_1(rule)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, anomalies];
        }
      });
    });
  };
  /**
   * Apply detection rule to patterns
   */
  SuspiciousActivityDetector.prototype.applyDetectionRule = function (userId, rule, patterns) {
    return __awaiter(this, void 0, void 0, function () {
      var avgAnomalyScore, avgConfidence, alertId, sessionId, anomaly;
      return __generator(this, function (_a) {
        try {
          avgAnomalyScore = patterns.reduce((sum, p) => sum + p.anomalyScore, 0) / patterns.length;
          avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
          if (
            avgAnomalyScore >= rule.thresholds.deviation &&
            avgConfidence >= rule.thresholds.confidence
          ) {
            alertId = this.utils.generateSessionToken();
            sessionId = patterns[0].sessionId;
            anomaly = {
              id: alertId,
              userId: userId,
              sessionId: sessionId,
              alertType: this.mapRuleToAnomalyType(rule.id),
              severity: rule.severity,
              description: ""
                .concat(rule.description, " (Score: ")
                .concat(avgAnomalyScore.toFixed(1), ")"),
              evidence: {
                patternDeviations: this.calculatePatternDeviations(patterns),
                statisticalSignificance: avgConfidence,
                comparisonData: this.getComparisonData(userId, patterns),
                contextualFactors: this.getContextualFactors(patterns),
                relatedEvents: [],
              },
              riskScore: this.calculateRiskScore(avgAnomalyScore, rule.severity),
              timestamp: Date.now(),
              resolved: false,
              falsePositive: false,
            };
            return [2 /*return*/, anomaly];
          }
          return [2 /*return*/, null];
        } catch (error) {
          console.error("Error applying detection rule:", error);
          return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Process detected anomaly
   */
  SuspiciousActivityDetector.prototype.processAnomaly = function (anomaly) {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Store anomaly
            this.anomalyAlerts.set(anomaly.id, anomaly);
            // Create security event
            return [4 /*yield*/, this.createSecurityEvent(anomaly)];
          case 1:
            // Create security event
            _a.sent();
            // Take automated actions based on severity
            return [4 /*yield*/, this.takeAutomatedAction(anomaly)];
          case 2:
            // Take automated actions based on severity
            _a.sent();
            // Send notifications
            return [4 /*yield*/, this.sendAnomalyNotification(anomaly)];
          case 3:
            // Send notifications
            _a.sent();
            console.log(
              "Anomaly detected: "
                .concat(anomaly.alertType, " for user ")
                .concat(anomaly.userId, " (Risk: ")
                .concat(anomaly.riskScore, ")"),
            );
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Error processing anomaly:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Take automated action based on anomaly severity
   */
  SuspiciousActivityDetector.prototype.takeAutomatedAction = function (anomaly) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = anomaly.severity;
            switch (_a) {
              case "critical":
                return [3 /*break*/, 1];
              case "high":
                return [3 /*break*/, 3];
              case "medium":
                return [3 /*break*/, 5];
              case "low":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            // Immediately suspend session
            return [
              4 /*yield*/,
              this.suspendSession(anomaly.sessionId, "Critical security anomaly detected"),
            ];
          case 2:
            // Immediately suspend session
            _b.sent();
            return [3 /*break*/, 9];
          case 3:
            // Require re-authentication
            return [4 /*yield*/, this.requireReAuthentication(anomaly.sessionId)];
          case 4:
            // Require re-authentication
            _b.sent();
            return [3 /*break*/, 9];
          case 5:
            // Increase monitoring
            return [4 /*yield*/, this.increaseMonitoring(anomaly.userId)];
          case 6:
            // Increase monitoring
            _b.sent();
            return [3 /*break*/, 9];
          case 7:
            // Log for review
            return [4 /*yield*/, this.logForReview(anomaly)];
          case 8:
            // Log for review
            _b.sent();
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate anomaly score for behavior pattern
   */
  SuspiciousActivityDetector.prototype.calculateAnomalyScore = (pattern) => {
    var baseline = pattern.baseline;
    var current = pattern.currentMetrics;
    var score = 0;
    switch (pattern.patternType) {
      case "typing_speed":
        if (baseline.avgTypingSpeed > 0) {
          var deviation =
            Math.abs(current.currentTypingSpeed - baseline.avgTypingSpeed) /
            baseline.avgTypingSpeed;
          score = Math.min(100, deviation * 100);
        }
        break;
      case "mouse_movement":
        if (baseline.avgMouseSpeed > 0) {
          var deviation =
            Math.abs(current.currentMouseSpeed - baseline.avgMouseSpeed) / baseline.avgMouseSpeed;
          score = Math.min(100, deviation * 100);
        }
        break;
      case "time_pattern": {
        var currentHour_1 = new Date().getHours();
        var isUsualTime = baseline.usualLoginTimes.some(
          (hour) => Math.abs(hour - currentHour_1) <= 2,
        );
        score = isUsualTime ? 0 : 80;
        break;
      }
      case "location_pattern": {
        var isKnownLocation = baseline.frequentLocations.includes(current.location);
        score = isKnownLocation ? 0 : 90;
        break;
      }
      case "interaction_frequency":
        if (baseline.interactionFrequency > 0) {
          var deviation =
            Math.abs(current.interactionFrequency - baseline.interactionFrequency) /
            baseline.interactionFrequency;
          score = Math.min(100, deviation * 150); // Higher weight for interaction frequency
        }
        break;
      default:
        score = 0;
    }
    return Math.round(score);
  };
  /**
   * Calculate confidence score
   */
  SuspiciousActivityDetector.prototype.calculateConfidence = (pattern) => {
    var baseline = pattern.baseline;
    var confidence = 50; // Base confidence
    // Increase confidence based on baseline data quality
    if (baseline.avgTypingSpeed > 0) confidence += 10;
    if (baseline.commonNavigationPaths.length > 5) confidence += 10;
    if (baseline.usualLoginTimes.length > 3) confidence += 10;
    if (baseline.frequentLocations.length > 2) confidence += 10;
    if (baseline.avgSessionDuration > 0) confidence += 10;
    return Math.min(100, confidence);
  };
  /**
   * Check for immediate anomalies
   */
  SuspiciousActivityDetector.prototype.checkForAnomalies = function (pattern) {
    var _a;
    if (pattern.anomalyScore >= 80 && pattern.confidence >= 80) {
      // High-confidence anomaly detected
      this.processAnomaly({
        id: this.utils.generateSessionToken(),
        userId: pattern.userId,
        sessionId: pattern.sessionId,
        alertType: this.mapPatternToAnomalyType(pattern.patternType),
        severity: pattern.anomalyScore >= 90 ? "critical" : "high",
        description: "High anomaly score detected in ".concat(pattern.patternType),
        evidence: {
          patternDeviations: ((_a = {}), (_a[pattern.patternType] = pattern.anomalyScore), _a),
          statisticalSignificance: pattern.confidence,
          comparisonData: {},
          contextualFactors: [],
          relatedEvents: [],
        },
        riskScore: pattern.anomalyScore,
        timestamp: Date.now(),
        resolved: false,
        falsePositive: false,
      });
    }
  };
  /**
   * Utility functions
   */
  SuspiciousActivityDetector.prototype.getBehaviorBaseline = function (userId) {
    return (
      this.behaviorBaselines.get(userId) || {
        avgTypingSpeed: 0,
        avgMouseSpeed: 0,
        commonNavigationPaths: [],
        typicalApiEndpoints: [],
        usualLoginTimes: [],
        frequentLocations: [],
        preferredDevices: [],
        avgSessionDuration: 0,
        interactionFrequency: 0,
      }
    );
  };
  SuspiciousActivityDetector.prototype.mergeBehaviorMetrics = function (userId, metrics) {
    var baseline = this.getBehaviorBaseline(userId);
    return {
      currentTypingSpeed: metrics.currentTypingSpeed || baseline.avgTypingSpeed,
      currentMouseSpeed: metrics.currentMouseSpeed || baseline.avgMouseSpeed,
      navigationPath: metrics.navigationPath || [],
      apiEndpoints: metrics.apiEndpoints || [],
      loginTime: metrics.loginTime || Date.now(),
      location: metrics.location || "unknown",
      deviceType: metrics.deviceType || "unknown",
      sessionDuration: metrics.sessionDuration || 0,
      interactionFrequency: metrics.interactionFrequency || 0,
    };
  };
  SuspiciousActivityDetector.prototype.updateBehaviorBaseline = function (userId, pattern) {
    var baseline = this.getBehaviorBaseline(userId);
    var current = pattern.currentMetrics;
    // Update baseline with exponential moving average
    var alpha = 0.1; // Learning rate
    switch (pattern.patternType) {
      case "typing_speed":
        baseline.avgTypingSpeed =
          baseline.avgTypingSpeed * (1 - alpha) + current.currentTypingSpeed * alpha;
        break;
      case "mouse_movement":
        baseline.avgMouseSpeed =
          baseline.avgMouseSpeed * (1 - alpha) + current.currentMouseSpeed * alpha;
        break;
      case "time_pattern": {
        var hour = new Date().getHours();
        if (!baseline.usualLoginTimes.includes(hour)) {
          baseline.usualLoginTimes.push(hour);
        }
        break;
      }
      case "location_pattern":
        if (!baseline.frequentLocations.includes(current.location)) {
          baseline.frequentLocations.push(current.location);
        }
        break;
    }
    this.behaviorBaselines.set(userId, baseline);
  };
  SuspiciousActivityDetector.prototype.mapRuleToAnomalyType = (ruleId) => {
    var mapping = {
      typing_speed_anomaly: "unusual_typing_pattern",
      mouse_behavior_anomaly: "abnormal_mouse_behavior",
      off_hours_access: "off_hours_access",
      location_anomaly: "location_anomaly",
      rapid_actions: "rapid_actions",
      privilege_escalation: "privilege_escalation",
    };
    return mapping[ruleId] || "bot_like_behavior";
  };
  SuspiciousActivityDetector.prototype.mapPatternToAnomalyType = (patternType) => {
    var mapping = {
      typing_speed: "unusual_typing_pattern",
      mouse_movement: "abnormal_mouse_behavior",
      navigation_pattern: "suspicious_navigation",
      api_usage: "unusual_api_usage",
      time_pattern: "off_hours_access",
      location_pattern: "location_anomaly",
      device_pattern: "device_anomaly",
      interaction_frequency: "rapid_actions",
    };
    return mapping[patternType];
  };
  SuspiciousActivityDetector.prototype.calculatePatternDeviations = (patterns) => {
    var deviations = {};
    patterns.forEach((pattern) => {
      deviations[pattern.patternType] = pattern.anomalyScore;
    });
    return deviations;
  };
  SuspiciousActivityDetector.prototype.getComparisonData = function (userId, patterns) {
    var baseline = this.getBehaviorBaseline(userId);
    return {
      baseline: baseline,
      currentPatterns: patterns.map((p) => p.currentMetrics),
    };
  };
  SuspiciousActivityDetector.prototype.getContextualFactors = (patterns) => {
    var factors = [];
    var now = new Date();
    var hour = now.getHours();
    if (hour < 6 || hour > 22) factors.push("off_hours");
    if (patterns.length > 10) factors.push("high_activity");
    if (patterns.some((p) => p.anomalyScore > 70)) factors.push("multiple_anomalies");
    return factors;
  };
  SuspiciousActivityDetector.prototype.calculateRiskScore = (anomalyScore, severity) => {
    var severityMultiplier = {
      low: 0.5,
      medium: 0.7,
      high: 0.9,
      critical: 1.0,
    };
    return Math.round(anomalyScore * severityMultiplier[severity]);
  };
  SuspiciousActivityDetector.prototype.createSecurityEvent = function (anomaly) {
    return __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/security/events", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "suspicious_activity",
                  severity: anomaly.severity,
                  userId: anomaly.userId,
                  sessionId: anomaly.sessionId,
                  description: anomaly.description,
                  metadata: {
                    anomalyId: anomaly.id,
                    alertType: anomaly.alertType,
                    riskScore: anomaly.riskScore,
                    evidence: anomaly.evidence,
                  },
                }),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error creating security event:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SuspiciousActivityDetector.prototype.suspendSession = function (sessionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/suspend", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
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
  SuspiciousActivityDetector.prototype.requireReAuthentication = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/require-auth", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
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
  SuspiciousActivityDetector.prototype.increaseMonitoring = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Increase monitoring frequency for this user
        console.log("Increasing monitoring for user ".concat(userId));
        return [2 /*return*/];
      });
    });
  };
  SuspiciousActivityDetector.prototype.logForReview = function (anomaly) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        console.log("Anomaly logged for review:", anomaly);
        return [2 /*return*/];
      });
    });
  };
  SuspiciousActivityDetector.prototype.sendAnomalyNotification = function (anomaly) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Send notification to security team
        console.log("Security notification sent for anomaly ".concat(anomaly.id));
        return [2 /*return*/];
      });
    });
  };
  SuspiciousActivityDetector.prototype.updateUserRiskScore = function (userId, patterns) {
    return __awaiter(this, void 0, void 0, function () {
      var avgRiskScore;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            avgRiskScore = patterns.reduce((sum, p) => sum + p.anomalyScore, 0) / patterns.length;
            return [
              4 /*yield*/,
              fetch("/api/users/risk-score", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: userId,
                  riskScore: avgRiskScore,
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
  /**
   * Public methods for external use
   */
  SuspiciousActivityDetector.prototype.getAnomalyAlerts = function (userId) {
    return Array.from(this.anomalyAlerts.values()).filter(
      (alert) => alert.userId === userId && !alert.resolved,
    );
  };
  SuspiciousActivityDetector.prototype.resolveAnomaly = function (anomalyId, falsePositive) {
    if (falsePositive === void 0) {
      falsePositive = false;
    }
    var anomaly = this.anomalyAlerts.get(anomalyId);
    if (anomaly) {
      anomaly.resolved = true;
      anomaly.falsePositive = falsePositive;
      return true;
    }
    return false;
  };
  SuspiciousActivityDetector.prototype.getUserRiskProfile = function (userId) {
    var patterns = this.activePatterns.get(userId) || [];
    var recentPatterns = patterns.filter((p) => Date.now() - p.timestamp < 86400000); // Last 24 hours
    var avgRiskScore =
      recentPatterns.length > 0
        ? recentPatterns.reduce((sum, p) => sum + p.anomalyScore, 0) / recentPatterns.length
        : 0;
    var recentAnomalies = Array.from(this.anomalyAlerts.values()).filter(
      (a) => a.userId === userId && Date.now() - a.timestamp < 86400000,
    ).length;
    return {
      riskScore: Math.round(avgRiskScore),
      recentAnomalies: recentAnomalies,
      behaviorBaseline: this.getBehaviorBaseline(userId),
      lastAnalysis:
        recentPatterns.length > 0
          ? Math.max.apply(
              Math,
              recentPatterns.map((p) => p.timestamp),
            )
          : 0,
    };
  };
  SuspiciousActivityDetector.prototype.setLearningMode = function (enabled) {
    this.learningMode = enabled;
  };
  SuspiciousActivityDetector.prototype.cleanup = function () {
    var now = Date.now();
    var maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    // Clean up old patterns
    for (var _i = 0, _a = this.activePatterns.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        userId = _b[0],
        patterns = _b[1];
      var recentPatterns = patterns.filter((p) => now - p.timestamp < maxAge);
      this.activePatterns.set(userId, recentPatterns);
    }
    // Clean up old anomalies
    for (var _c = 0, _d = this.anomalyAlerts.entries(); _c < _d.length; _c++) {
      var _e = _d[_c],
        id = _e[0],
        anomaly = _e[1];
      if (now - anomaly.timestamp > maxAge) {
        this.anomalyAlerts.delete(id);
      }
    }
  };
  SuspiciousActivityDetector.prototype.destroy = function () {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  };
  return SuspiciousActivityDetector;
})();
exports.SuspiciousActivityDetector = SuspiciousActivityDetector;
// Singleton instance
var suspiciousActivityDetector = null;
function getSuspiciousActivityDetector() {
  if (!suspiciousActivityDetector) {
    suspiciousActivityDetector = new SuspiciousActivityDetector();
  }
  return suspiciousActivityDetector;
}
exports.default = SuspiciousActivityDetector;
