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
exports.securityAuditFramework = void 0;
var client_1 = require("@/lib/supabase/client");
var server_1 = require("@/lib/supabase/server");
var performance_tracker_1 = require("./performance-tracker");
var SecurityAuditFramework = /** @class */ (() => {
  function SecurityAuditFramework() {
    this.config = {
      enableRealTimeAlerts: true,
      alertThresholds: {
        failedLoginAttempts: 5,
        suspiciousIPActivity: 10,
        dataAccessVolume: 100,
      },
      retentionPeriodDays: 2555, // 7 years for LGPD compliance
      complianceReportingEnabled: true,
      anonymizePII: true,
    };
  }
  SecurityAuditFramework.getInstance = () => {
    if (!SecurityAuditFramework.instance) {
      SecurityAuditFramework.instance = new SecurityAuditFramework();
    }
    return SecurityAuditFramework.instance;
  };
  /**
   * Log security event with automatic threat detection
   */
  SecurityAuditFramework.prototype.logSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, supabase, securityEvent, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 2:
            supabase = _a.sent();
            securityEvent = __assign(__assign({}, event), {
              id: crypto.randomUUID(),
              timestamp: new Date(),
            });
            return [
              4 /*yield*/,
              supabase.from("security_audit_log").insert({
                event_id: securityEvent.id,
                event_type: securityEvent.eventType,
                severity: securityEvent.severity,
                user_id: securityEvent.userId,
                session_id: securityEvent.sessionId,
                resource: securityEvent.resource,
                action: securityEvent.action,
                outcome: securityEvent.outcome,
                metadata: securityEvent.metadata,
                timestamp: securityEvent.timestamp.toISOString(),
                ip_address: securityEvent.ipAddress,
                user_agent: securityEvent.userAgent,
              }),
            ];
          case 3:
            error = _a.sent().error;
            if (error) {
              console.error("Security event logging error:", error);
              return [2 /*return*/];
            }
            // Real-time threat detection
            return [4 /*yield*/, this.detectThreats(securityEvent)];
          case 4:
            // Real-time threat detection
            _a.sent();
            if (!this.config.complianceReportingEnabled) return [3 /*break*/, 6];
            return [4 /*yield*/, this.checkComplianceViolations(securityEvent)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            performance_tracker_1.performanceTracker.recordMetric(
              "security_event_logging",
              Date.now() - startTime,
            );
            return [3 /*break*/, 8];
          case 7:
            error_1 = _a.sent();
            console.error("Security audit framework error:", error_1);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Detect threats and trigger alerts
   */
  SecurityAuditFramework.prototype.detectThreats = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.config.enableRealTimeAlerts) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 10, , 11]);
            if (!(event.eventType === "authentication" && event.outcome === "failure"))
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.checkFailedLoginThreshold(event.ipAddress, event.userId)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            if (!(event.severity === "high" || event.severity === "critical"))
              return [3 /*break*/, 5];
            return [4 /*yield*/, this.checkSuspiciousIPActivity(event.ipAddress)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            if (!(event.eventType === "data_access")) return [3 /*break*/, 7];
            return [4 /*yield*/, this.checkDataAccessPatterns(event.userId, event.ipAddress)];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            if (!(event.eventType === "configuration")) return [3 /*break*/, 9];
            return [4 /*yield*/, this.alertConfigurationChange(event)];
          case 8:
            _a.sent();
            _a.label = 9;
          case 9:
            return [3 /*break*/, 11];
          case 10:
            error_2 = _a.sent();
            console.error("Threat detection error:", error_2);
            return [3 /*break*/, 11];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check failed login attempts threshold
   */
  SecurityAuditFramework.prototype.checkFailedLoginThreshold = function (ipAddress, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, oneHourAgo, _a, data, error, failedAttempts, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return [
              4 /*yield*/,
              supabase
                .from("security_audit_log")
                .select("count", { count: "exact" })
                .eq("event_type", "authentication")
                .eq("outcome", "failure")
                .eq("ip_address", ipAddress)
                .gte("timestamp", oneHourAgo.toISOString()),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            failedAttempts = (data === null || data === void 0 ? void 0 : data.length) || 0;
            if (!(failedAttempts >= this.config.alertThresholds.failedLoginAttempts))
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.triggerSecurityAlert({
                type: "failed_login_threshold",
                severity: "high",
                message: ""
                  .concat(failedAttempts, " failed login attempts from IP ")
                  .concat(ipAddress),
                metadata: { ipAddress: ipAddress, userId: userId, failedAttempts: failedAttempts },
              }),
            ];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_3 = _b.sent();
            console.error("Failed login threshold check error:", error_3);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check for suspicious IP activity
   */
  SecurityAuditFramework.prototype.checkSuspiciousIPActivity = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, twentyFourHoursAgo, _a, data, error, suspiciousEvents, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              supabase
                .from("security_audit_log")
                .select("count", { count: "exact" })
                .eq("ip_address", ipAddress)
                .in("severity", ["high", "critical"])
                .gte("timestamp", twentyFourHoursAgo.toISOString()),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            suspiciousEvents = (data === null || data === void 0 ? void 0 : data.length) || 0;
            if (!(suspiciousEvents >= this.config.alertThresholds.suspiciousIPActivity))
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.triggerSecurityAlert({
                type: "suspicious_ip_activity",
                severity: "critical",
                message: ""
                  .concat(suspiciousEvents, " suspicious activities from IP ")
                  .concat(ipAddress),
                metadata: { ipAddress: ipAddress, suspiciousEvents: suspiciousEvents },
              }),
            ];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_4 = _b.sent();
            console.error("Suspicious IP activity check error:", error_4);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check data access patterns for anomalies
   */
  SecurityAuditFramework.prototype.checkDataAccessPatterns = function (userId, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, oneHourAgo, _a, data, error, dataAccessCount, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!userId) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 6, , 7]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 2:
            supabase = _b.sent();
            oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return [
              4 /*yield*/,
              supabase
                .from("security_audit_log")
                .select("count", { count: "exact" })
                .eq("event_type", "data_access")
                .eq("user_id", userId)
                .gte("timestamp", oneHourAgo.toISOString()),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            dataAccessCount = (data === null || data === void 0 ? void 0 : data.length) || 0;
            if (!(dataAccessCount >= this.config.alertThresholds.dataAccessVolume))
              return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.triggerSecurityAlert({
                type: "unusual_data_access",
                severity: "medium",
                message: "User "
                  .concat(userId, " accessed ")
                  .concat(dataAccessCount, " data records in the last hour"),
                metadata: {
                  userId: userId,
                  ipAddress: ipAddress,
                  dataAccessCount: dataAccessCount,
                },
              }),
            ];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_5 = _b.sent();
            console.error("Data access pattern check error:", error_5);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Alert on configuration changes
   */
  SecurityAuditFramework.prototype.alertConfigurationChange = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.triggerSecurityAlert({
                type: "configuration_change",
                severity: "medium",
                message: "Configuration change: "
                  .concat(event.action, " on ")
                  .concat(event.resource),
                metadata: {
                  userId: event.userId,
                  resource: event.resource,
                  action: event.action,
                  metadata: event.metadata,
                },
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
   * Trigger security alert
   */
  SecurityAuditFramework.prototype.triggerSecurityAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            // Store alert
            return [
              4 /*yield*/,
              supabase.from("security_alerts").insert({
                alert_id: crypto.randomUUID(),
                alert_type: alert.type,
                severity: alert.severity,
                message: alert.message,
                metadata: alert.metadata,
                timestamp: new Date().toISOString(),
                status: "open",
              }),
            ];
          case 2:
            // Store alert
            _a.sent();
            // Send real-time notification (placeholder for integration with notification system)
            console.warn(
              "SECURITY ALERT [".concat(alert.severity.toUpperCase(), "]: ").concat(alert.message),
            );
            return [3 /*break*/, 4];
          case 3:
            error_6 = _a.sent();
            console.error("Security alert trigger error:", error_6);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check for LGPD compliance violations
   */
  SecurityAuditFramework.prototype.checkComplianceViolations = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            if (!(event.eventType === "data_access" && event.outcome === "failure"))
              return [3 /*break*/, 2];
            if (!(event.resource.includes("patient") || event.resource.includes("personal")))
              return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.logComplianceViolation({
                type: "unauthorized_personal_data_access",
                event: event,
                description: "Attempted unauthorized access to personal data",
              }),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            if (!(event.action === "export" && !event.metadata.consentVerified))
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.logComplianceViolation({
                type: "data_export_without_consent",
                event: event,
                description: "Data export attempted without verified consent",
              }),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            if (
              !(
                event.action === "access" &&
                event.metadata.dataAge > this.config.retentionPeriodDays
              )
            )
              return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.logComplianceViolation({
                type: "data_retention_violation",
                event: event,
                description: "Access to data beyond retention period",
              }),
            ];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            return [3 /*break*/, 8];
          case 7:
            error_7 = _a.sent();
            console.error("Compliance violation check error:", error_7);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log compliance violation
   */
  SecurityAuditFramework.prototype.logComplianceViolation = function (violation) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.from("compliance_violations").insert({
                violation_id: crypto.randomUUID(),
                violation_type: violation.type,
                description: violation.description,
                related_event_id: violation.event.id,
                user_id: violation.event.userId,
                timestamp: new Date().toISOString(),
                status: "reported",
                severity: "high",
              }),
            ];
          case 2:
            _a.sent();
            // Trigger immediate alert for compliance violations
            return [
              4 /*yield*/,
              this.triggerSecurityAlert({
                type: "compliance_violation",
                severity: "critical",
                message: "LGPD Compliance Violation: ".concat(violation.description),
                metadata: {
                  violationType: violation.type,
                  eventId: violation.event.id,
                  userId: violation.event.userId,
                },
              }),
            ];
          case 3:
            // Trigger immediate alert for compliance violations
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            console.error("Compliance violation logging error:", error_8);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate compliance report
   */
  SecurityAuditFramework.prototype.generateComplianceReport = function (period) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        lgpdMetrics,
        securityMetrics,
        _a,
        highRiskEvents,
        error,
        overallRiskScore,
        recommendations,
        error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [4 /*yield*/, this.getLGPDMetrics(period)];
          case 2:
            lgpdMetrics = _b.sent();
            return [4 /*yield*/, this.getSecurityMetrics(period)];
          case 3:
            securityMetrics = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("security_audit_log")
                .select("*")
                .in("severity", ["high", "critical"])
                .gte("timestamp", period.start.toISOString())
                .lte("timestamp", period.end.toISOString())
                .order("timestamp", { ascending: false }),
            ];
          case 4:
            (_a = _b.sent()), (highRiskEvents = _a.data), (error = _a.error);
            if (error) throw error;
            overallRiskScore = this.calculateRiskScore(securityMetrics, highRiskEvents || []);
            recommendations = this.generateRecommendations(securityMetrics, highRiskEvents || []);
            return [
              2 /*return*/,
              {
                period: period,
                lgpdCompliance: lgpdMetrics,
                securityMetrics: securityMetrics,
                riskAssessment: {
                  overallRiskScore: overallRiskScore,
                  highRiskEvents: (highRiskEvents || []).map(this.mapDatabaseEventToSecurityEvent),
                  recommendations: recommendations,
                },
              },
            ];
          case 5:
            error_9 = _b.sent();
            console.error("Compliance report generation error:", error_9);
            throw error_9;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get LGPD compliance metrics
   */
  SecurityAuditFramework.prototype.getLGPDMetrics = function (period) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, events, error_10;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("security_audit_log")
                .select("action, metadata")
                .gte("timestamp", period.start.toISOString())
                .lte("timestamp", period.end.toISOString()),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            events = data || [];
            return [
              2 /*return*/,
              {
                dataAccessRequests: events.filter((e) => e.action === "data_access_request").length,
                dataExportRequests: events.filter((e) => e.action === "data_export").length,
                dataDeletionRequests: events.filter((e) => e.action === "data_deletion").length,
                consentUpdates: events.filter((e) => e.action === "consent_update").length,
                breachNotifications: events.filter((e) => e.action === "breach_notification")
                  .length,
              },
            ];
          case 3:
            error_10 = _b.sent();
            console.error("LGPD metrics error:", error_10);
            return [
              2 /*return*/,
              {
                dataAccessRequests: 0,
                dataExportRequests: 0,
                dataDeletionRequests: 0,
                consentUpdates: 0,
                breachNotifications: 0,
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get security metrics
   */
  SecurityAuditFramework.prototype.getSecurityMetrics = function (period) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, events, error_11;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("security_audit_log")
                .select("event_type, outcome, severity")
                .gte("timestamp", period.start.toISOString())
                .lte("timestamp", period.end.toISOString()),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            events = data || [];
            return [
              2 /*return*/,
              {
                failedLoginAttempts: events.filter(
                  (e) => e.event_type === "authentication" && e.outcome === "failure",
                ).length,
                suspiciousActivities: events.filter(
                  (e) => e.severity === "high" || e.severity === "critical",
                ).length,
                blockedRequests: events.filter((e) => e.outcome === "blocked").length,
                vulnerabilityScans: events.filter((e) => e.event_type === "security_scan").length,
              },
            ];
          case 3:
            error_11 = _b.sent();
            console.error("Security metrics error:", error_11);
            return [
              2 /*return*/,
              {
                failedLoginAttempts: 0,
                suspiciousActivities: 0,
                blockedRequests: 0,
                vulnerabilityScans: 0,
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate overall risk score
   */
  SecurityAuditFramework.prototype.calculateRiskScore = (securityMetrics, highRiskEvents) => {
    var score = 0;
    // Weight different factors
    score += securityMetrics.failedLoginAttempts * 0.1;
    score += securityMetrics.suspiciousActivities * 0.3;
    score += securityMetrics.blockedRequests * 0.05;
    score += highRiskEvents.length * 0.5;
    // Normalize to 0-100 scale
    return Math.min(100, Math.round(score));
  };
  /**
   * Generate security recommendations
   */
  SecurityAuditFramework.prototype.generateRecommendations = (securityMetrics, highRiskEvents) => {
    var recommendations = [];
    if (securityMetrics.failedLoginAttempts > 50) {
      recommendations.push("Consider implementing stronger brute force protection");
    }
    if (securityMetrics.suspiciousActivities > 20) {
      recommendations.push("Review and strengthen access controls");
    }
    if (highRiskEvents.length > 10) {
      recommendations.push("Conduct security audit and penetration testing");
    }
    if (securityMetrics.vulnerabilityScans === 0) {
      recommendations.push("Implement regular vulnerability scanning");
    }
    return recommendations;
  };
  /**
   * Map database event to SecurityEvent
   */
  SecurityAuditFramework.prototype.mapDatabaseEventToSecurityEvent = (dbEvent) => ({
    id: dbEvent.event_id,
    eventType: dbEvent.event_type,
    severity: dbEvent.severity,
    userId: dbEvent.user_id,
    sessionId: dbEvent.session_id,
    resource: dbEvent.resource,
    action: dbEvent.action,
    outcome: dbEvent.outcome,
    metadata: dbEvent.metadata,
    timestamp: new Date(dbEvent.timestamp),
    ipAddress: dbEvent.ip_address,
    userAgent: dbEvent.user_agent,
  });
  return SecurityAuditFramework;
})();
exports.securityAuditFramework = SecurityAuditFramework.getInstance();
