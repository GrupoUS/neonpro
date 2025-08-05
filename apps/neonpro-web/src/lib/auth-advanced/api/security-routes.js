// Security API Routes
// Story 1.4: Session Management & Security Implementation
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
exports.SecurityRoutes = void 0;
exports.createSecurityRoutes = createSecurityRoutes;
var server_1 = require("next/server");
var utils_1 = require("../utils");
/**
 * Security API route handlers
 */
var SecurityRoutes = /** @class */ (() => {
  function SecurityRoutes(securityMonitor, sessionManager, deviceManager) {
    this.securityMonitor = securityMonitor;
    this.sessionManager = sessionManager;
    this.deviceManager = deviceManager;
  }
  /**
   * Get security events
   * GET /api/auth/security/events
   */
  SecurityRoutes.prototype.getSecurityEvents = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult,
        url,
        userId,
        severity,
        type,
        startDate,
        endDate,
        limit,
        offset,
        events,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            url = new URL(request.url);
            userId = url.searchParams.get("userId");
            severity = url.searchParams.get("severity");
            type = url.searchParams.get("type");
            startDate = url.searchParams.get("startDate");
            endDate = url.searchParams.get("endDate");
            limit = parseInt(url.searchParams.get("limit") || "50");
            offset = parseInt(url.searchParams.get("offset") || "0");
            return [
              4 /*yield*/,
              this.securityMonitor.getSecurityEvents({
                userId: userId || undefined,
                severity: severity,
                type: type || undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit: limit,
                offset: offset,
              }),
            ];
          case 2:
            events = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                events: events,
                pagination: {
                  limit: limit,
                  offset: offset,
                  total: events.length,
                },
              }),
            ];
          case 3:
            error_1 = _a.sent();
            console.error("Get security events error:", error_1);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to get security events" },
                { status: 500 },
              ),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get security alerts
   * GET /api/auth/security/alerts
   */
  SecurityRoutes.prototype.getSecurityAlerts = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, url, userId, severity, dismissed, limit, alerts, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            url = new URL(request.url);
            userId = url.searchParams.get("userId");
            severity = url.searchParams.get("severity");
            dismissed = url.searchParams.get("dismissed") === "true";
            limit = parseInt(url.searchParams.get("limit") || "20");
            return [
              4 /*yield*/,
              this.securityMonitor.getSecurityAlerts({
                userId: userId || undefined,
                severity: severity,
                dismissed: dismissed,
                limit: limit,
              }),
            ];
          case 2:
            alerts = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                alerts: alerts,
                count: alerts.length,
              }),
            ];
          case 3:
            error_2 = _a.sent();
            console.error("Get security alerts error:", error_2);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to get security alerts" },
                { status: 500 },
              ),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Dismiss security alert
   * PUT /api/auth/security/alerts/:alertId/dismiss
   */
  SecurityRoutes.prototype.dismissAlert = function (request, alertId) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, body, _a, reason, success, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _b.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, request.json().catch(() => ({}))];
          case 2:
            body = _b.sent();
            (_a = body.reason), (reason = _a === void 0 ? "admin_dismissed" : _a);
            return [4 /*yield*/, this.securityMonitor.dismissAlert(alertId, reason)];
          case 3:
            success = _b.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Failed to dismiss alert" }, { status: 400 }),
              ];
            }
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "alert_dismissed",
                severity: "info",
                details: {
                  alertId: alertId,
                  reason: reason,
                },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 4:
            // Log security event
            _b.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "Alert dismissed successfully",
              }),
            ];
          case 5:
            error_3 = _b.sent();
            console.error("Dismiss alert error:", error_3);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to dismiss alert" }, { status: 500 }),
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get security metrics
   * GET /api/auth/security/metrics
   */
  SecurityRoutes.prototype.getSecurityMetrics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, url, period, userId, metrics, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            url = new URL(request.url);
            period = url.searchParams.get("period") || "24h";
            userId = url.searchParams.get("userId");
            return [
              4 /*yield*/,
              this.securityMonitor.getSecurityMetrics({
                period: period,
                userId: userId || undefined,
              }),
            ];
          case 2:
            metrics = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                metrics: metrics,
                period: period,
              }),
            ];
          case 3:
            error_4 = _a.sent();
            console.error("Get security metrics error:", error_4);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to get security metrics" },
                { status: 500 },
              ),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Report suspicious activity
   * POST /api/auth/security/report
   */
  SecurityRoutes.prototype.reportSuspiciousActivity = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var body,
        type,
        details,
        _a,
        severity,
        clientIP,
        userAgent,
        authHeader,
        userId,
        sessionId,
        session,
        event_1,
        riskScore,
        error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _b.sent();
            (type = body.type),
              (details = body.details),
              (_a = body.severity),
              (severity = _a === void 0 ? "medium" : _a);
            if (!type || !details) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Missing required fields: type, details" },
                  { status: 400 },
                ),
              ];
            }
            clientIP = this.getClientIP(request);
            userAgent = request.headers.get("user-agent") || "unknown";
            authHeader = request.headers.get("authorization");
            userId = void 0;
            sessionId = void 0;
            if (!(authHeader && authHeader.startsWith("Bearer "))) return [3 /*break*/, 3];
            sessionId = authHeader.substring(7);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 2:
            session = _b.sent();
            if (session) {
              userId = session.userId;
            }
            _b.label = 3;
          case 3:
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "suspicious_".concat(type),
                userId: userId,
                sessionId: sessionId,
                severity: severity,
                details: details,
                timestamp: new Date(),
                ipAddress: clientIP,
                userAgent: userAgent,
              }),
            ];
          case 4:
            event_1 = _b.sent();
            return [
              4 /*yield*/,
              this.securityMonitor.calculateRiskScore({
                userId: userId,
                sessionId: sessionId,
                ipAddress: clientIP,
                userAgent: userAgent,
                activity: type,
                timestamp: new Date(),
              }),
            ];
          case 5:
            riskScore = _b.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                eventId: event_1.id,
                riskScore: riskScore,
                message: "Suspicious activity reported successfully",
              }),
            ];
          case 6:
            error_5 = _b.sent();
            console.error("Report suspicious activity error:", error_5);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to report suspicious activity" },
                { status: 500 },
              ),
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get risk assessment
   * POST /api/auth/security/risk-assessment
   */
  SecurityRoutes.prototype.getRiskAssessment = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var body,
        userId,
        sessionId,
        activity,
        clientIP,
        userAgent,
        riskScore,
        riskLevel,
        recommendations,
        error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            (userId = body.userId), (sessionId = body.sessionId), (activity = body.activity);
            clientIP = this.getClientIP(request);
            userAgent = request.headers.get("user-agent") || "unknown";
            return [
              4 /*yield*/,
              this.securityMonitor.calculateRiskScore({
                userId: userId,
                sessionId: sessionId,
                ipAddress: clientIP,
                userAgent: userAgent,
                activity: activity,
                timestamp: new Date(),
              }),
            ];
          case 2:
            riskScore = _a.sent();
            riskLevel = this.getRiskLevel(riskScore);
            recommendations = this.getSecurityRecommendations(riskScore, riskLevel);
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                riskScore: riskScore,
                riskLevel: riskLevel,
                recommendations: recommendations,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 3:
            error_6 = _a.sent();
            console.error("Get risk assessment error:", error_6);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to get risk assessment" },
                { status: 500 },
              ),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Block IP address
   * POST /api/auth/security/block-ip
   */
  SecurityRoutes.prototype.blockIP = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, body, ipAddress, reason, duration, success, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, request.json()];
          case 2:
            body = _a.sent();
            (ipAddress = body.ipAddress), (reason = body.reason), (duration = body.duration);
            if (!ipAddress || !reason) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Missing required fields: ipAddress, reason" },
                  { status: 400 },
                ),
              ];
            }
            // Validate IP address format
            if (!utils_1.ValidationUtils.isValidIP(ipAddress)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Invalid IP address format" }, { status: 400 }),
              ];
            }
            return [4 /*yield*/, this.securityMonitor.blockIP(ipAddress, reason, duration)];
          case 3:
            success = _a.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Failed to block IP address" },
                  { status: 400 },
                ),
              ];
            }
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "ip_blocked",
                severity: "warning",
                details: {
                  blockedIP: ipAddress,
                  reason: reason,
                  duration: duration,
                },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 4:
            // Log security event
            _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "IP address ".concat(ipAddress, " blocked successfully"),
              }),
            ];
          case 5:
            error_7 = _a.sent();
            console.error("Block IP error:", error_7);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to block IP address" }, { status: 500 }),
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Unblock IP address
   * DELETE /api/auth/security/block-ip/:ipAddress
   */
  SecurityRoutes.prototype.unblockIP = function (request, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, success, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, this.securityMonitor.unblockIP(ipAddress)];
          case 2:
            success = _a.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Failed to unblock IP address" },
                  { status: 400 },
                ),
              ];
            }
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "ip_unblocked",
                severity: "info",
                details: {
                  unblockedIP: ipAddress,
                },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 3:
            // Log security event
            _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "IP address ".concat(ipAddress, " unblocked successfully"),
              }),
            ];
          case 4:
            error_8 = _a.sent();
            console.error("Unblock IP error:", error_8);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to unblock IP address" },
                { status: 500 },
              ),
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get blocked IPs
   * GET /api/auth/security/blocked-ips
   */
  SecurityRoutes.prototype.getBlockedIPs = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, blockedIPs, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, this.securityMonitor.getBlockedIPs()];
          case 2:
            blockedIPs = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                blockedIPs: blockedIPs,
                count: blockedIPs.length,
              }),
            ];
          case 3:
            error_9 = _a.sent();
            console.error("Get blocked IPs error:", error_9);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to get blocked IPs" }, { status: 500 }),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Export security report
   * GET /api/auth/security/export
   */
  SecurityRoutes.prototype.exportSecurityReport = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult,
        url,
        format,
        startDate,
        endDate,
        includeEvents,
        includeAlerts,
        includeMetrics,
        report,
        headers,
        error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            url = new URL(request.url);
            format = url.searchParams.get("format") || "json";
            startDate = url.searchParams.get("startDate");
            endDate = url.searchParams.get("endDate");
            includeEvents = url.searchParams.get("includeEvents") === "true";
            includeAlerts = url.searchParams.get("includeAlerts") === "true";
            includeMetrics = url.searchParams.get("includeMetrics") === "true";
            return [
              4 /*yield*/,
              this.securityMonitor.exportSecurityReport({
                format: format,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                includeEvents: includeEvents,
                includeAlerts: includeAlerts,
                includeMetrics: includeMetrics,
              }),
            ];
          case 2:
            report = _a.sent();
            headers = new Headers();
            if (format === "csv") {
              headers.set("Content-Type", "text/csv");
              headers.set("Content-Disposition", 'attachment; filename="security-report.csv"');
            } else {
              headers.set("Content-Type", "application/json");
              headers.set("Content-Disposition", 'attachment; filename="security-report.json"');
            }
            return [2 /*return*/, new server_1.NextResponse(report, { headers: headers })];
          case 3:
            error_10 = _a.sent();
            console.error("Export security report error:", error_10);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to export security report" },
                { status: 500 },
              ),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper methods
  SecurityRoutes.prototype.getClientIP = (request) => {
    var forwarded = request.headers.get("x-forwarded-for");
    var realIP = request.headers.get("x-real-ip");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    return realIP || "unknown";
  };
  SecurityRoutes.prototype.verifyAdminAuthorization = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authHeader, sessionId, session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
              ];
            }
            sessionId = authHeader.substring(7);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session || !["owner", "manager"].includes(session.userRole)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Forbidden - Admin access required" },
                  { status: 403 },
                ),
              ];
            }
            return [2 /*return*/, null];
        }
      });
    });
  };
  SecurityRoutes.prototype.getRiskLevel = (riskScore) => {
    if (riskScore >= 80) return "critical";
    if (riskScore >= 60) return "high";
    if (riskScore >= 40) return "medium";
    if (riskScore >= 20) return "low";
    return "minimal";
  };
  SecurityRoutes.prototype.getSecurityRecommendations = (riskScore, riskLevel) => {
    var recommendations = [];
    if (riskLevel === "critical") {
      recommendations.push(
        "Immediately terminate all user sessions",
        "Block IP address temporarily",
        "Require MFA for next login",
        "Review and audit user account",
        "Consider account suspension",
      );
    } else if (riskLevel === "high") {
      recommendations.push(
        "Require MFA for sensitive operations",
        "Monitor user activity closely",
        "Consider device re-verification",
        "Review recent login patterns",
      );
    } else if (riskLevel === "medium") {
      recommendations.push(
        "Enable additional monitoring",
        "Consider MFA prompt",
        "Review device trust level",
      );
    } else if (riskLevel === "low") {
      recommendations.push("Continue normal monitoring", "No immediate action required");
    }
    return recommendations;
  };
  return SecurityRoutes;
})();
exports.SecurityRoutes = SecurityRoutes;
/**
 * Create security routes handler
 */
function createSecurityRoutes(securityMonitor, sessionManager, deviceManager) {
  return new SecurityRoutes(securityMonitor, sessionManager, deviceManager);
}
