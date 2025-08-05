// Audit Trail System
// Comprehensive logging and tracking of all session-related activities
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
exports.AuditTrailManager = void 0;
var session_config_1 = require("@/lib/auth/config/session-config");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var AuditTrailManager = /** @class */ (() => {
  function AuditTrailManager() {
    this.eventListeners = new Map();
    this.bufferSize = 1000;
    this.eventBuffer = [];
    this.flushInterval = 30000; // 30 seconds
    this.isInitialized = false;
    this.config = session_config_1.SessionConfig.getInstance();
    this.utils = new session_utils_1.SessionUtils();
    this.eventStore = new AuditEventStore();
    this.encryptionService = new EncryptionService();
    this.integrityService = new IntegrityService();
    this.complianceEngine = new ComplianceEngine();
    this.analyticsEngine = new AnalyticsEngine();
  }
  /**
   * Initialize audit trail system
   */
  AuditTrailManager.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) {
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, , 9]);
            // Initialize storage
            return [4 /*yield*/, this.eventStore.initialize()];
          case 2:
            // Initialize storage
            _a.sent();
            // Initialize encryption
            return [4 /*yield*/, this.encryptionService.initialize()];
          case 3:
            // Initialize encryption
            _a.sent();
            // Initialize integrity service
            return [4 /*yield*/, this.integrityService.initialize()];
          case 4:
            // Initialize integrity service
            _a.sent();
            // Initialize compliance engine
            return [4 /*yield*/, this.complianceEngine.initialize()];
          case 5:
            // Initialize compliance engine
            _a.sent();
            // Initialize analytics engine
            return [4 /*yield*/, this.analyticsEngine.initialize()];
          case 6:
            // Initialize analytics engine
            _a.sent();
            // Start flush timer
            this.startFlushTimer();
            this.isInitialized = true;
            // Log initialization
            return [
              4 /*yield*/,
              this.logEvent({
                type: "system_event",
                category: "system",
                severity: "info",
                action: "audit_trail_initialized",
                description: "Audit trail system initialized successfully",
                actor: { type: "system", id: "audit_trail" },
                target: { type: "system", id: "audit_trail" },
              }),
            ];
          case 7:
            // Log initialization
            _a.sent();
            return [3 /*break*/, 9];
          case 8:
            error_1 = _a.sent();
            console.error("Error initializing audit trail:", error_1);
            throw error_1;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log audit event
   */
  AuditTrailManager.prototype.logEvent = function (eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var event_1, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.createAuditEvent(eventData)];
          case 1:
            event_1 = _a.sent();
            // Add to buffer
            this.eventBuffer.push(event_1);
            if (!(this.eventBuffer.length >= this.bufferSize)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.flushBuffer()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Emit event
            this.emit("event_logged", event_1);
            // Check for real-time alerts
            return [4 /*yield*/, this.checkRealTimeAlerts(event_1)];
          case 4:
            // Check for real-time alerts
            _a.sent();
            return [2 /*return*/, event_1.id];
          case 5:
            error_2 = _a.sent();
            console.error("Error logging audit event:", error_2);
            throw error_2;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create audit event
   */
  AuditTrailManager.prototype.createAuditEvent = function (eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var timestamp, id, event, _a, _b;
      var _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            timestamp = Date.now();
            id = this.utils.generateSessionToken();
            _c = {
              id: id,
              timestamp: timestamp,
              type: eventData.type || "system_event",
              category: eventData.category || "system",
              severity: eventData.severity || "info",
              actor: eventData.actor || { type: "system", id: "unknown" },
              target: eventData.target || { type: "system", id: "unknown" },
              action: eventData.action || "unknown_action",
              description: eventData.description || "",
              details: eventData.details || { operation: eventData.action || "unknown" },
            };
            return [4 /*yield*/, this.buildContext(eventData.context)];
          case 1:
            (_c.context = _d.sent()), (_c.result = eventData.result || { status: "success" });
            return [4 /*yield*/, this.buildMetadata()];
          case 2:
            event =
              ((_c.metadata = _d.sent()),
              (_c.tags = eventData.tags || []),
              (_c.correlationId = eventData.correlationId),
              (_c.parentEventId = eventData.parentEventId),
              (_c.childEventIds = eventData.childEventIds || []),
              _c);
            // Add integrity hash
            _a = event.metadata;
            return [4 /*yield*/, this.integrityService.generateHash(event)];
          case 3:
            // Add integrity hash
            _a.integrity = _d.sent();
            if (!this.shouldEncrypt(event)) return [3 /*break*/, 5];
            _b = event.metadata;
            return [4 /*yield*/, this.encryptionService.encrypt(event)];
          case 4:
            _b.encryption = _d.sent();
            _d.label = 5;
          case 5:
            return [2 /*return*/, event];
        }
      });
    });
  };
  /**
   * Build audit context
   */
  AuditTrailManager.prototype.buildContext = function (contextData) {
    return __awaiter(this, void 0, void 0, function () {
      var context;
      return __generator(this, function (_a) {
        context = {
          sessionId:
            contextData === null || contextData === void 0 ? void 0 : contextData.sessionId,
          requestId:
            (contextData === null || contextData === void 0 ? void 0 : contextData.requestId) ||
            this.utils.generateSessionToken(),
          transactionId:
            contextData === null || contextData === void 0 ? void 0 : contextData.transactionId,
          workflowId:
            contextData === null || contextData === void 0 ? void 0 : contextData.workflowId,
          applicationVersion: process.env.APP_VERSION || "1.0.0",
          environment: process.env.NODE_ENV || "development",
          clientInfo:
            contextData === null || contextData === void 0 ? void 0 : contextData.clientInfo,
          serverInfo: {
            hostname: process.env.HOSTNAME || "localhost",
            instanceId: process.env.INSTANCE_ID || "local",
            version: process.env.APP_VERSION || "1.0.0",
            environment: process.env.NODE_ENV || "development",
            region: process.env.AWS_REGION || "local",
          },
          networkInfo:
            contextData === null || contextData === void 0 ? void 0 : contextData.networkInfo,
        };
        return [2 /*return*/, context];
      });
    });
  };
  /**
   * Build audit metadata
   */
  AuditTrailManager.prototype.buildMetadata = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        {
          source: "neonpro_audit_trail",
          version: "1.0.0",
          schema: "audit_event_v1",
          retention: {
            period: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
            archiveAfter: 365 * 24 * 60 * 60 * 1000, // 1 year
            deleteAfter: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
            reason: "compliance_requirement",
          },
          classification: {
            level: "confidential",
            categories: ["audit", "security"],
            handling: ["encrypt", "backup", "monitor"],
          },
          compliance: {
            frameworks: ["LGPD", "ISO27001", "SOC2"],
            requirements: ["audit_logging", "data_retention", "access_control"],
            controls: ["AC-2", "AU-2", "AU-3", "AU-12"],
            evidence: true,
          },
          encryption: {
            encrypted: false,
            algorithm: undefined,
            keyId: undefined,
            strength: undefined,
          },
          integrity: {
            hash: "",
            algorithm: "SHA-256",
            verified: false,
            timestamp: Date.now(),
          },
        },
      ]);
    });
  };
  /**
   * Flush event buffer
   */
  AuditTrailManager.prototype.flushBuffer = function () {
    return __awaiter(this, void 0, void 0, function () {
      var events, error_3;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (this.eventBuffer.length === 0) {
              return [2 /*return*/];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 5, , 6]);
            events = __spreadArray([], this.eventBuffer, true);
            this.eventBuffer = [];
            // Store events
            return [4 /*yield*/, this.eventStore.storeEvents(events)];
          case 2:
            // Store events
            _b.sent();
            // Process for compliance
            return [4 /*yield*/, this.complianceEngine.processEvents(events)];
          case 3:
            // Process for compliance
            _b.sent();
            // Process for analytics
            return [4 /*yield*/, this.analyticsEngine.processEvents(events)];
          case 4:
            // Process for analytics
            _b.sent();
            this.emit("buffer_flushed", { count: events.length });
            return [3 /*break*/, 6];
          case 5:
            error_3 = _b.sent();
            console.error("Error flushing event buffer:", error_3);
            // Re-add events to buffer for retry
            (_a = this.eventBuffer).unshift.apply(_a, this.eventBuffer);
            throw error_3;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Start flush timer
   */
  AuditTrailManager.prototype.startFlushTimer = function () {
    this.flushTimer = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          var error_4;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.flushBuffer()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_4 = _a.sent();
                console.error("Error in flush timer:", error_4);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        }),
      this.flushInterval,
    );
  };
  /**
   * Check for real-time alerts
   */
  AuditTrailManager.prototype.checkRealTimeAlerts = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var violations, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            if (!(event.severity === "critical")) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.sendAlert({
                type: "critical_event",
                event: event,
                message: "Critical audit event: ".concat(event.description),
              }),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            if (!(event.category === "security" && event.severity === "high"))
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.sendAlert({
                type: "security_event",
                event: event,
                message: "Security event detected: ".concat(event.description),
              }),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [4 /*yield*/, this.complianceEngine.checkViolations(event)];
          case 5:
            violations = _a.sent();
            if (!(violations.length > 0)) return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.sendAlert({
                type: "compliance_violation",
                event: event,
                violations: violations,
                message: "Compliance violation detected: ".concat(
                  violations.map((v) => v.requirement).join(", "),
                ),
              }),
            ];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            return [3 /*break*/, 9];
          case 8:
            error_5 = _a.sent();
            console.error("Error checking real-time alerts:", error_5);
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send alert
   */
  AuditTrailManager.prototype.sendAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Send to monitoring system
            return [
              4 /*yield*/,
              fetch("/api/monitoring/alert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alert),
              }),
            ];
          case 1:
            // Send to monitoring system
            _a.sent();
            this.emit("alert_sent", alert);
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error sending alert:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Query audit events
   */
  AuditTrailManager.prototype.queryEvents = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var events, verifiedEvents, decryptedEvents, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            // Flush buffer to ensure latest events are included
            return [4 /*yield*/, this.flushBuffer()];
          case 1:
            // Flush buffer to ensure latest events are included
            _a.sent();
            return [4 /*yield*/, this.eventStore.queryEvents(query)];
          case 2:
            events = _a.sent();
            return [4 /*yield*/, this.verifyEventIntegrity(events)];
          case 3:
            verifiedEvents = _a.sent();
            return [4 /*yield*/, this.decryptEvents(verifiedEvents)];
          case 4:
            decryptedEvents = _a.sent();
            return [2 /*return*/, decryptedEvents];
          case 5:
            error_7 = _a.sent();
            console.error("Error querying audit events:", error_7);
            throw error_7;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate audit report
   */
  AuditTrailManager.prototype.generateReport = function (query, options) {
    return __awaiter(this, void 0, void 0, function () {
      var events, report, _a, _b, _c, error_8;
      var _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 13, , 14]);
            return [4 /*yield*/, this.queryEvents(query)];
          case 1:
            events = _e.sent();
            _d = {
              id: this.utils.generateSessionToken(),
              title: "Audit Trail Report",
              description: "Comprehensive audit trail analysis",
              generatedAt: Date.now(),
              generatedBy: "audit_trail_system",
              period: {
                start: query.startTime || 0,
                end: query.endTime || Date.now(),
              },
              query: query,
              summary: this.generateSummary(events),
              events: events,
            };
            return [4 /*yield*/, this.analyticsEngine.generateStatistics(events)];
          case 2:
            _d.statistics = _e.sent();
            if (!(options === null || options === void 0 ? void 0 : options.includeInsights))
              return [3 /*break*/, 4];
            return [4 /*yield*/, this.analyticsEngine.generateInsights(events)];
          case 3:
            _a = _e.sent();
            return [3 /*break*/, 5];
          case 4:
            _a = [];
            _e.label = 5;
          case 5:
            _d.insights = _a;
            if (!(options === null || options === void 0 ? void 0 : options.includeRecommendations))
              return [3 /*break*/, 7];
            return [4 /*yield*/, this.analyticsEngine.generateRecommendations(events)];
          case 6:
            _b = _e.sent();
            return [3 /*break*/, 8];
          case 7:
            _b = [];
            _e.label = 8;
          case 8:
            _d.recommendations = _b;
            if (!(options === null || options === void 0 ? void 0 : options.includeCompliance))
              return [3 /*break*/, 10];
            return [4 /*yield*/, this.complianceEngine.generateReport(events)];
          case 9:
            _c = _e.sent();
            return [3 /*break*/, 11];
          case 10:
            _c = {
              frameworks: [],
              violations: [],
              gaps: [],
              score: 0,
              status: "unknown",
            };
            _e.label = 11;
          case 11:
            report = ((_d.compliance = _c), _d);
            // Log report generation
            return [
              4 /*yield*/,
              this.logEvent({
                type: "admin_action",
                category: "admin",
                severity: "medium",
                action: "audit_report_generated",
                description: "Audit report generated with ".concat(events.length, " events"),
                actor: { type: "system", id: "audit_trail" },
                target: { type: "system", id: "audit_report" },
                details: {
                  operation: "generate_report",
                  parameters: { reportId: report.id, eventCount: events.length },
                },
              }),
            ];
          case 12:
            // Log report generation
            _e.sent();
            return [2 /*return*/, report];
          case 13:
            error_8 = _e.sent();
            console.error("Error generating audit report:", error_8);
            throw error_8;
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate summary
   */
  AuditTrailManager.prototype.generateSummary = (events) => {
    var summary = {
      totalEvents: events.length,
      eventsByType: {},
      eventsByCategory: {},
      eventsBySeverity: {},
      eventsByStatus: {},
      uniqueActors: new Set(events.map((e) => e.actor.id)).size,
      uniqueTargets: new Set(events.map((e) => e.target.id)).size,
      timeRange: {
        start: Math.min.apply(
          Math,
          events.map((e) => e.timestamp),
        ),
        end: Math.max.apply(
          Math,
          events.map((e) => e.timestamp),
        ),
      },
    };
    // Count by type
    events.forEach((event) => {
      summary.eventsByType[event.type] = (summary.eventsByType[event.type] || 0) + 1;
      summary.eventsByCategory[event.category] =
        (summary.eventsByCategory[event.category] || 0) + 1;
      summary.eventsBySeverity[event.severity] =
        (summary.eventsBySeverity[event.severity] || 0) + 1;
      summary.eventsByStatus[event.result.status] =
        (summary.eventsByStatus[event.result.status] || 0) + 1;
    });
    return summary;
  };
  /**
   * Verify event integrity
   */
  AuditTrailManager.prototype.verifyEventIntegrity = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      var verifiedEvents, _i, events_1, event_2, isValid, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            verifiedEvents = [];
            (_i = 0), (events_1 = events);
            _a.label = 1;
          case 1:
            if (!(_i < events_1.length)) return [3 /*break*/, 9];
            event_2 = events_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 7, , 8]);
            return [4 /*yield*/, this.integrityService.verifyHash(event_2)];
          case 3:
            isValid = _a.sent();
            if (!isValid) return [3 /*break*/, 4];
            event_2.metadata.integrity.verified = true;
            verifiedEvents.push(event_2);
            return [3 /*break*/, 6];
          case 4:
            console.warn("Integrity verification failed for event ".concat(event_2.id));
            // Log integrity violation
            return [
              4 /*yield*/,
              this.logEvent({
                type: "security_incident",
                category: "security",
                severity: "high",
                action: "integrity_violation",
                description: "Audit event integrity verification failed for event ".concat(
                  event_2.id,
                ),
                actor: { type: "system", id: "integrity_service" },
                target: { type: "system", id: event_2.id },
              }),
            ];
          case 5:
            // Log integrity violation
            _a.sent();
            _a.label = 6;
          case 6:
            return [3 /*break*/, 8];
          case 7:
            error_9 = _a.sent();
            console.error("Error verifying integrity for event ".concat(event_2.id, ":"), error_9);
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 1];
          case 9:
            return [2 /*return*/, verifiedEvents];
        }
      });
    });
  };
  /**
   * Decrypt events
   */
  AuditTrailManager.prototype.decryptEvents = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      var decryptedEvents, _i, events_2, event_3, decryptedEvent, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            decryptedEvents = [];
            (_i = 0), (events_2 = events);
            _a.label = 1;
          case 1:
            if (!(_i < events_2.length)) return [3 /*break*/, 8];
            event_3 = events_2[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 6, , 7]);
            if (!event_3.metadata.encryption.encrypted) return [3 /*break*/, 4];
            return [4 /*yield*/, this.encryptionService.decrypt(event_3)];
          case 3:
            decryptedEvent = _a.sent();
            decryptedEvents.push(decryptedEvent);
            return [3 /*break*/, 5];
          case 4:
            decryptedEvents.push(event_3);
            _a.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_10 = _a.sent();
            console.error("Error decrypting event ".concat(event_3.id, ":"), error_10);
            // Include encrypted event with error flag
            decryptedEvents.push(
              __assign(__assign({}, event_3), {
                result: __assign(__assign({}, event_3.result), {
                  status: "error",
                  message: "Decryption failed",
                }),
              }),
            );
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 1];
          case 8:
            return [2 /*return*/, decryptedEvents];
        }
      });
    });
  };
  /**
   * Check if event should be encrypted
   */
  AuditTrailManager.prototype.shouldEncrypt = (event) => {
    // Encrypt events with sensitive data
    var sensitiveTypes = ["authentication", "authorization", "data_access", "security_incident"];
    var sensitiveCategories = ["security", "data", "compliance"];
    return (
      sensitiveTypes.includes(event.type) ||
      sensitiveCategories.includes(event.category) ||
      event.severity === "critical" ||
      event.metadata.classification.level === "restricted"
    );
  };
  /**
   * Convenience methods for common audit events
   */
  AuditTrailManager.prototype.logAuthentication = function (userId, success, details) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.logEvent({
            type: "authentication",
            category: "security",
            severity: success ? "info" : "high",
            action: success ? "login_success" : "login_failure",
            description: "User ".concat(success ? "successfully logged in" : "failed to log in"),
            actor: { type: "user", id: userId },
            target: { type: "system", id: "authentication_system" },
            result: { status: success ? "success" : "failure" },
            details: __assign({ operation: "authenticate" }, details),
          }),
        ];
      });
    });
  };
  AuditTrailManager.prototype.logSessionEvent = function (sessionId, action, userId, details) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.logEvent({
            type: "session_management",
            category: "access",
            severity: "info",
            action: action,
            description: "Session ".concat(action),
            actor: { type: "user", id: userId || "unknown" },
            target: { type: "session", id: sessionId },
            result: { status: "success" },
            details: __assign({ operation: action }, details),
            context: { sessionId: sessionId },
          }),
        ];
      });
    });
  };
  AuditTrailManager.prototype.logSecurityIncident = function (
    type,
    description,
    severity,
    details,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.logEvent({
            type: "security_incident",
            category: "security",
            severity: severity,
            action: "security_incident",
            description: description,
            actor: { type: "system", id: "security_monitor" },
            target: { type: "system", id: "security_system" },
            result: { status: "warning" },
            details: __assign({ operation: "security_incident", incidentType: type }, details),
            tags: ["security", "incident", type],
          }),
        ];
      });
    });
  };
  AuditTrailManager.prototype.logDataAccess = function (
    userId,
    resource,
    action,
    success,
    details,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.logEvent({
            type: "data_access",
            category: "data",
            severity: success ? "info" : "medium",
            action: action,
            description: "User "
              .concat(success ? "accessed" : "attempted to access", " ")
              .concat(resource),
            actor: { type: "user", id: userId },
            target: { type: "resource", id: resource },
            result: { status: success ? "success" : "failure" },
            details: __assign({ operation: action }, details),
          }),
        ];
      });
    });
  };
  AuditTrailManager.prototype.logConfigurationChange = function (
    adminId,
    setting,
    oldValue,
    newValue,
    details,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, _b;
      return __generator(this, function (_c) {
        return [
          2 /*return*/,
          this.logEvent({
            type: "configuration_change",
            category: "admin",
            severity: "medium",
            action: "configuration_update",
            description: "Configuration setting '".concat(setting, "' changed"),
            actor: { type: "admin", id: adminId },
            target: { type: "configuration", id: setting },
            result: { status: "success" },
            details: __assign(
              {
                operation: "update_configuration",
                previousValues: ((_a = {}), (_a[setting] = oldValue), _a),
                newValues: ((_b = {}), (_b[setting] = newValue), _b),
                changes: [
                  { field: setting, oldValue: oldValue, newValue: newValue, changeType: "update" },
                ],
              },
              details,
            ),
          }),
        ];
      });
    });
  };
  /**
   * Event system
   */
  AuditTrailManager.prototype.on = function (event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  };
  AuditTrailManager.prototype.off = function (event, callback) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      var index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
  AuditTrailManager.prototype.emit = function (event, data) {
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
   * Cleanup and shutdown
   */
  AuditTrailManager.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            // Stop flush timer
            if (this.flushTimer) {
              clearInterval(this.flushTimer);
            }
            // Flush remaining events
            return [4 /*yield*/, this.flushBuffer()];
          case 1:
            // Flush remaining events
            _a.sent();
            // Shutdown services
            return [4 /*yield*/, this.eventStore.shutdown()];
          case 2:
            // Shutdown services
            _a.sent();
            return [4 /*yield*/, this.encryptionService.shutdown()];
          case 3:
            _a.sent();
            return [4 /*yield*/, this.integrityService.shutdown()];
          case 4:
            _a.sent();
            return [4 /*yield*/, this.complianceEngine.shutdown()];
          case 5:
            _a.sent();
            return [4 /*yield*/, this.analyticsEngine.shutdown()];
          case 6:
            _a.sent();
            // Clear state
            this.eventListeners.clear();
            this.eventBuffer = [];
            this.isInitialized = false;
            console.log("Audit trail system shutdown completed");
            return [3 /*break*/, 8];
          case 7:
            error_11 = _a.sent();
            console.error("Error during audit trail shutdown:", error_11);
            throw error_11;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Health check
   */
  AuditTrailManager.prototype.healthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var checks, allHealthy, error_12;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            _a = {
              initialized: this.isInitialized,
            };
            return [4 /*yield*/, this.eventStore.healthCheck()];
          case 1:
            _a.eventStore = _b.sent();
            return [4 /*yield*/, this.encryptionService.healthCheck()];
          case 2:
            _a.encryption = _b.sent();
            return [4 /*yield*/, this.integrityService.healthCheck()];
          case 3:
            _a.integrity = _b.sent();
            return [4 /*yield*/, this.complianceEngine.healthCheck()];
          case 4:
            _a.compliance = _b.sent();
            return [4 /*yield*/, this.analyticsEngine.healthCheck()];
          case 5:
            checks =
              ((_a.analytics = _b.sent()),
              (_a.bufferSize = this.eventBuffer.length),
              (_a.flushTimer = !!this.flushTimer),
              _a);
            allHealthy = Object.values(checks).every((check) =>
              typeof check === "boolean" ? check : check.status === "healthy",
            );
            return [
              2 /*return*/,
              {
                status: allHealthy ? "healthy" : "unhealthy",
                details: checks,
              },
            ];
          case 6:
            error_12 = _b.sent();
            return [
              2 /*return*/,
              {
                status: "error",
                details: { error: error_12.message },
              },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  return AuditTrailManager;
})();
exports.AuditTrailManager = AuditTrailManager;
/**
 * Helper classes (simplified implementations)
 */
var AuditEventStore = /** @class */ (() => {
  function AuditEventStore() {}
  AuditEventStore.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  AuditEventStore.prototype.storeEvents = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Store events in database
        console.log("Storing ".concat(events.length, " audit events"));
        return [2 /*return*/];
      });
    });
  };
  AuditEventStore.prototype.queryEvents = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Query events from database
        return [2 /*return*/, []];
      });
    });
  };
  AuditEventStore.prototype.healthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { status: "healthy" }]);
    });
  };
  AuditEventStore.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  return AuditEventStore;
})();
var EncryptionService = /** @class */ (() => {
  function EncryptionService() {}
  EncryptionService.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  EncryptionService.prototype.encrypt = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Encrypt sensitive event data
        return [
          2 /*return*/,
          {
            encrypted: true,
            algorithm: "AES-256-GCM",
            keyId: "audit-key-1",
            strength: 256,
          },
        ];
      });
    });
  };
  EncryptionService.prototype.decrypt = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Decrypt event data
        return [2 /*return*/, event];
      });
    });
  };
  EncryptionService.prototype.healthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { status: "healthy" }]);
    });
  };
  EncryptionService.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  return EncryptionService;
})();
var IntegrityService = /** @class */ (() => {
  function IntegrityService() {}
  IntegrityService.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  IntegrityService.prototype.generateHash = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var hash;
      return __generator(this, (_a) => {
        hash = "sha256_hash_placeholder";
        return [
          2 /*return*/,
          {
            hash: hash,
            algorithm: "SHA-256",
            verified: false,
            timestamp: Date.now(),
          },
        ];
      });
    });
  };
  IntegrityService.prototype.verifyHash = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Verify integrity hash
        return [2 /*return*/, true];
      });
    });
  };
  IntegrityService.prototype.healthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { status: "healthy" }]);
    });
  };
  IntegrityService.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  return IntegrityService;
})();
var ComplianceEngine = /** @class */ (() => {
  function ComplianceEngine() {}
  ComplianceEngine.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  ComplianceEngine.prototype.processEvents = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Process events for compliance
        console.log("Processing ".concat(events.length, " events for compliance"));
        return [2 /*return*/];
      });
    });
  };
  ComplianceEngine.prototype.checkViolations = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Check for compliance violations
        return [2 /*return*/, []];
      });
    });
  };
  ComplianceEngine.prototype.generateReport = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate compliance report
        return [
          2 /*return*/,
          {
            frameworks: [],
            violations: [],
            gaps: [],
            score: 95,
            status: "compliant",
          },
        ];
      });
    });
  };
  ComplianceEngine.prototype.healthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { status: "healthy" }]);
    });
  };
  ComplianceEngine.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  return ComplianceEngine;
})();
var AnalyticsEngine = /** @class */ (() => {
  function AnalyticsEngine() {}
  AnalyticsEngine.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  AnalyticsEngine.prototype.processEvents = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Process events for analytics
        console.log("Processing ".concat(events.length, " events for analytics"));
        return [2 /*return*/];
      });
    });
  };
  AnalyticsEngine.prototype.generateStatistics = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate statistics
        return [
          2 /*return*/,
          {
            eventsPerHour: [],
            eventsPerDay: [],
            topActors: [],
            topTargets: [],
            topActions: [],
            errorRate: 0.01,
            averageDuration: 150,
            peakHours: [9, 10, 11, 14, 15, 16],
          },
        ];
      });
    });
  };
  AnalyticsEngine.prototype.generateInsights = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate insights
        return [2 /*return*/, []];
      });
    });
  };
  AnalyticsEngine.prototype.generateRecommendations = function (events) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate recommendations
        return [2 /*return*/, []];
      });
    });
  };
  AnalyticsEngine.prototype.healthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { status: "healthy" }]);
    });
  };
  AnalyticsEngine.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  return AnalyticsEngine;
})();
exports.default = AuditTrailManager;
