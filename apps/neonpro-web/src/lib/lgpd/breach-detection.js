"use strict";
/**
 * LGPD Data Breach Detection System
 * Implements real-time monitoring and detection of data breaches
 *
 * Features:
 * - Real-time breach detection and monitoring
 * - Automated incident response workflows
 * - Risk assessment and severity classification
 * - Notification and reporting automation
 * - Forensic data collection and preservation
 * - Compliance timeline tracking
 * - Integration with security monitoring systems
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */
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
exports.breachDetectionSystem =
  exports.BreachDetectionSystem =
  exports.DetectionSource =
  exports.AffectedDataCategory =
  exports.BreachStatus =
  exports.BreachSeverity =
  exports.BreachType =
    void 0;
var events_1 = require("events");
// ============================================================================
// BREACH DETECTION TYPES & INTERFACES
// ============================================================================
/**
 * Breach Types
 */
var BreachType;
(function (BreachType) {
  BreachType["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
  BreachType["DATA_EXFILTRATION"] = "data_exfiltration";
  BreachType["SYSTEM_COMPROMISE"] = "system_compromise";
  BreachType["INSIDER_THREAT"] = "insider_threat";
  BreachType["ACCIDENTAL_DISCLOSURE"] = "accidental_disclosure";
  BreachType["MALWARE_INFECTION"] = "malware_infection";
  BreachType["PHISHING_ATTACK"] = "phishing_attack";
  BreachType["SQL_INJECTION"] = "sql_injection";
  BreachType["PRIVILEGE_ESCALATION"] = "privilege_escalation";
  BreachType["DATA_CORRUPTION"] = "data_corruption";
  BreachType["SERVICE_DISRUPTION"] = "service_disruption";
  BreachType["CONFIGURATION_ERROR"] = "configuration_error";
})(BreachType || (exports.BreachType = BreachType = {}));
/**
 * Breach Severity Levels
 */
var BreachSeverity;
(function (BreachSeverity) {
  BreachSeverity["CRITICAL"] = "critical";
  BreachSeverity["HIGH"] = "high";
  BreachSeverity["MEDIUM"] = "medium";
  BreachSeverity["LOW"] = "low";
  BreachSeverity["INFORMATIONAL"] = "informational"; // Log for analysis
})(BreachSeverity || (exports.BreachSeverity = BreachSeverity = {}));
/**
 * Breach Status
 */
var BreachStatus;
(function (BreachStatus) {
  BreachStatus["DETECTED"] = "detected";
  BreachStatus["INVESTIGATING"] = "investigating";
  BreachStatus["CONFIRMED"] = "confirmed";
  BreachStatus["CONTAINED"] = "contained";
  BreachStatus["MITIGATED"] = "mitigated";
  BreachStatus["RESOLVED"] = "resolved";
  BreachStatus["FALSE_POSITIVE"] = "false_positive";
})(BreachStatus || (exports.BreachStatus = BreachStatus = {}));
/**
 * Data Categories Affected
 */
var AffectedDataCategory;
(function (AffectedDataCategory) {
  AffectedDataCategory["PERSONAL_IDENTIFIERS"] = "personal_identifiers";
  AffectedDataCategory["SENSITIVE_PERSONAL"] = "sensitive_personal";
  AffectedDataCategory["FINANCIAL_DATA"] = "financial_data";
  AffectedDataCategory["HEALTH_DATA"] = "health_data";
  AffectedDataCategory["BIOMETRIC_DATA"] = "biometric_data";
  AffectedDataCategory["LOCATION_DATA"] = "location_data";
  AffectedDataCategory["COMMUNICATION_DATA"] = "communication_data";
  AffectedDataCategory["BEHAVIORAL_DATA"] = "behavioral_data";
  AffectedDataCategory["AUTHENTICATION_DATA"] = "authentication_data";
  AffectedDataCategory["CHILDREN_DATA"] = "children_data";
})(AffectedDataCategory || (exports.AffectedDataCategory = AffectedDataCategory = {}));
/**
 * Detection Source Types
 */
var DetectionSource;
(function (DetectionSource) {
  DetectionSource["SECURITY_MONITORING"] = "security_monitoring";
  DetectionSource["USER_REPORT"] = "user_report";
  DetectionSource["AUTOMATED_SCAN"] = "automated_scan";
  DetectionSource["THIRD_PARTY_ALERT"] = "third_party_alert";
  DetectionSource["INTERNAL_AUDIT"] = "internal_audit";
  DetectionSource["EXTERNAL_NOTIFICATION"] = "external_notification";
  DetectionSource["SYSTEM_LOG"] = "system_log";
  DetectionSource["ANOMALY_DETECTION"] = "anomaly_detection";
})(DetectionSource || (exports.DetectionSource = DetectionSource = {}));
// ============================================================================
// BREACH DETECTION SYSTEM
// ============================================================================
/**
 * Data Breach Detection and Response System
 *
 * Provides comprehensive breach detection including:
 * - Real-time monitoring and alerting
 * - Automated incident response
 * - Compliance timeline tracking
 * - Forensic evidence collection
 */
var BreachDetectionSystem = /** @class */ (function (_super) {
  __extends(BreachDetectionSystem, _super);
  function BreachDetectionSystem(config) {
    if (config === void 0) {
      config = {
        monitoringIntervalMinutes: 5,
        complianceCheckIntervalHours: 1,
        autoEscalationEnabled: true,
        autoNotificationEnabled: true,
        forensicCollectionEnabled: true,
        realTimeMonitoring: true,
        alertThresholds: {
          critical: 1,
          high: 3,
          medium: 10,
        },
      };
    }
    var _this = _super.call(this) || this;
    _this.config = config;
    _this.incidents = new Map();
    _this.alerts = new Map();
    _this.rules = new Map();
    _this.isInitialized = false;
    _this.monitoringInterval = null;
    _this.complianceCheckInterval = null;
    _this.setMaxListeners(100);
    return _this;
  }
  /**
   * Initialize the breach detection system
   */
  BreachDetectionSystem.prototype.initialize = function () {
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
            _a.trys.push([1, 5, , 6]);
            // Load detection rules
            return [4 /*yield*/, this.loadDetectionRules()];
          case 2:
            // Load detection rules
            _a.sent();
            // Load existing incidents and alerts
            return [4 /*yield*/, this.loadIncidents()];
          case 3:
            // Load existing incidents and alerts
            _a.sent();
            return [4 /*yield*/, this.loadAlerts()];
          case 4:
            _a.sent();
            // Start monitoring intervals
            if (this.config.realTimeMonitoring) {
              this.startMonitoringInterval();
            }
            this.startComplianceCheckInterval();
            this.isInitialized = true;
            this.logActivity("system", "breach_detection_initialized", {
              timestamp: new Date(),
              rulesLoaded: this.rules.size,
              incidentsLoaded: this.incidents.size,
              alertsLoaded: this.alerts.size,
            });
            return [3 /*break*/, 6];
          case 5:
            error_1 = _a.sent();
            throw new Error("Failed to initialize breach detection system: ".concat(error_1));
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create new breach incident
   */
  BreachDetectionSystem.prototype.createIncident = function (incidentData) {
    return __awaiter(this, void 0, void 0, function () {
      var incident;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            incident = __assign(__assign({}, incidentData), {
              id: this.generateId("incident"),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Validate incident data
            this.validateIncident(incident);
            // Auto-assign severity if not provided
            if (!incident.severity) {
              incident.severity = this.calculateSeverity(incident);
            }
            // Set initial compliance deadlines
            this.setComplianceDeadlines(incident);
            if (!this.config.forensicCollectionEnabled) return [3 /*break*/, 4];
            return [4 /*yield*/, this.startForensicCollection(incident)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            this.incidents.set(incident.id, incident);
            return [4 /*yield*/, this.saveIncident(incident)];
          case 5:
            _a.sent();
            // Trigger immediate response actions
            return [4 /*yield*/, this.triggerImmediateResponse(incident)];
          case 6:
            // Trigger immediate response actions
            _a.sent();
            this.emit("breach:detected", { incident: incident });
            this.logActivity("user", "incident_created", {
              incidentId: incident.id,
              type: incident.type,
              severity: incident.severity,
              affectedRecords: incident.affectedData.estimatedRecords,
              createdBy: incident.createdBy,
            });
            return [2 /*return*/, incident];
        }
      });
    });
  };
  /**
   * Update incident status
   */
  BreachDetectionSystem.prototype.updateIncidentStatus = function (
    incidentId,
    status,
    updatedBy,
    notes,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var incident, previousStatus;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            incident = this.incidents.get(incidentId);
            if (!incident) {
              throw new Error("Incident not found");
            }
            previousStatus = incident.status;
            incident.status = status;
            incident.updatedAt = new Date();
            // Set status-specific timestamps
            switch (status) {
              case BreachStatus.CONFIRMED:
                incident.confirmedAt = new Date();
                break;
              case BreachStatus.CONTAINED:
                incident.containedAt = new Date();
                break;
              case BreachStatus.RESOLVED:
                incident.resolvedAt = new Date();
                break;
            }
            // Add timeline entry
            incident.investigation.timeline.push({
              timestamp: new Date(),
              event: "Status changed from ".concat(previousStatus, " to ").concat(status),
              source: updatedBy,
            });
            if (notes) {
              incident.investigation.timeline.push({
                timestamp: new Date(),
                event: "Notes: ".concat(notes),
                source: updatedBy,
              });
            }
            return [4 /*yield*/, this.saveIncident(incident)];
          case 1:
            _a.sent();
            // Emit appropriate events
            switch (status) {
              case BreachStatus.CONFIRMED:
                this.emit("breach:confirmed", { incident: incident });
                break;
              case BreachStatus.CONTAINED:
                this.emit("breach:contained", { incident: incident });
                break;
              case BreachStatus.RESOLVED:
                this.emit("breach:resolved", { incident: incident });
                break;
            }
            this.logActivity("user", "incident_status_updated", {
              incidentId: incidentId,
              previousStatus: previousStatus,
              newStatus: status,
              updatedBy: updatedBy,
            });
            return [2 /*return*/, incident];
        }
      });
    });
  };
  /**
   * Create monitoring alert
   */
  BreachDetectionSystem.prototype.createAlert = function (ruleId, alertData) {
    return __awaiter(this, void 0, void 0, function () {
      var rule, alert;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            rule = this.rules.get(ruleId);
            if (!rule) {
              throw new Error("Detection rule not found");
            }
            alert = __assign(__assign({}, alertData), {
              id: this.generateId("alert"),
              ruleId: ruleId,
              ruleName: rule.name,
              responseActions: [],
              relatedIncidents: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            this.alerts.set(alert.id, alert);
            return [4 /*yield*/, this.saveAlert(alert)];
          case 3:
            _a.sent();
            // Update rule statistics
            rule.lastTriggered = new Date();
            rule.triggerCount++;
            return [4 /*yield*/, this.saveRule(rule)];
          case 4:
            _a.sent();
            if (!this.config.autoEscalationEnabled) return [3 /*break*/, 6];
            return [4 /*yield*/, this.checkAutoEscalation(alert)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            this.emit("alert:triggered", { alert: alert });
            this.logActivity("system", "alert_created", {
              alertId: alert.id,
              ruleId: ruleId,
              severity: alert.severity,
              sourceSystem: alert.context.sourceSystem,
            });
            return [2 /*return*/, alert];
        }
      });
    });
  };
  /**
   * Process security event for breach detection
   */
  BreachDetectionSystem.prototype.processSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var triggeredAlerts, _i, _a, rule, matches, alert_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _b.sent();
            _b.label = 2;
          case 2:
            triggeredAlerts = [];
            (_i = 0), (_a = this.rules.values());
            _b.label = 3;
          case 3:
            if (!(_i < _a.length)) return [3 /*break*/, 7];
            rule = _a[_i];
            if (!rule.enabled) return [3 /*break*/, 6];
            return [4 /*yield*/, this.evaluateRule(rule, event)];
          case 4:
            matches = _b.sent();
            if (!matches) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.createAlert(rule.id, {
                severity: rule.severity,
                status: "open",
                title: "".concat(rule.name, " triggered"),
                description: "Security event matched detection rule: ".concat(rule.description),
                detectedAt: event.timestamp,
                context: {
                  sourceSystem: event.source,
                  affectedAssets: [event.source],
                  indicators: event.data,
                  metadata: {
                    eventType: event.type,
                    originalSeverity: event.severity,
                  },
                },
              }),
            ];
          case 5:
            alert_1 = _b.sent();
            triggeredAlerts.push(alert_1);
            _b.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 3];
          case 7:
            return [2 /*return*/, triggeredAlerts];
        }
      });
    });
  };
  /**
   * Get incidents with filtering
   */
  BreachDetectionSystem.prototype.getIncidents = function (filters) {
    var incidents = Array.from(this.incidents.values());
    if (filters) {
      if (filters.status) {
        incidents = incidents.filter(function (i) {
          return i.status === filters.status;
        });
      }
      if (filters.severity) {
        incidents = incidents.filter(function (i) {
          return i.severity === filters.severity;
        });
      }
      if (filters.type) {
        incidents = incidents.filter(function (i) {
          return i.type === filters.type;
        });
      }
      if (filters.dateRange) {
        incidents = incidents.filter(function (i) {
          return i.detectedAt >= filters.dateRange.start && i.detectedAt <= filters.dateRange.end;
        });
      }
    }
    return incidents.sort(function (a, b) {
      return b.detectedAt.getTime() - a.detectedAt.getTime();
    });
  };
  /**
   * Get alerts with filtering
   */
  BreachDetectionSystem.prototype.getAlerts = function (filters) {
    var alerts = Array.from(this.alerts.values());
    if (filters) {
      if (filters.status) {
        alerts = alerts.filter(function (a) {
          return a.status === filters.status;
        });
      }
      if (filters.severity) {
        alerts = alerts.filter(function (a) {
          return a.severity === filters.severity;
        });
      }
      if (filters.ruleId) {
        alerts = alerts.filter(function (a) {
          return a.ruleId === filters.ruleId;
        });
      }
    }
    return alerts.sort(function (a, b) {
      return b.detectedAt.getTime() - a.detectedAt.getTime();
    });
  };
  /**
   * Generate breach report
   */
  BreachDetectionSystem.prototype.generateBreachReport = function (incidentId, reportType) {
    return __awaiter(this, void 0, void 0, function () {
      var incident, reportId, content, report;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            incident = this.incidents.get(incidentId);
            if (!incident) {
              throw new Error("Incident not found");
            }
            reportId = this.generateId("report");
            switch (reportType) {
              case "anpd":
                content = this.generateANPDReport(incident);
                break;
              case "internal":
                content = this.generateInternalReport(incident);
                break;
              case "data_subject":
                content = this.generateDataSubjectReport(incident);
                break;
              case "forensic":
                content = this.generateForensicReport(incident);
                break;
              default:
                throw new Error("Invalid report type");
            }
            report = {
              reportId: reportId,
              content: content,
              generatedAt: new Date(),
            };
            return [4 /*yield*/, this.saveReport(report)];
          case 1:
            _a.sent();
            this.logActivity("user", "breach_report_generated", {
              incidentId: incidentId,
              reportType: reportType,
              reportId: reportId,
            });
            return [2 /*return*/, report];
        }
      });
    });
  };
  /**
   * Calculate incident severity
   */
  BreachDetectionSystem.prototype.calculateSeverity = function (incident) {
    var score = 0;
    // Data sensitivity scoring
    if (incident.affectedData.categories.includes(AffectedDataCategory.SENSITIVE_PERSONAL))
      score += 30;
    if (incident.affectedData.categories.includes(AffectedDataCategory.FINANCIAL_DATA)) score += 25;
    if (incident.affectedData.categories.includes(AffectedDataCategory.HEALTH_DATA)) score += 25;
    if (incident.affectedData.categories.includes(AffectedDataCategory.BIOMETRIC_DATA)) score += 20;
    if (incident.affectedData.categories.includes(AffectedDataCategory.CHILDREN_DATA)) score += 20;
    // Volume scoring
    if (incident.affectedData.estimatedRecords > 100000) score += 20;
    else if (incident.affectedData.estimatedRecords > 10000) score += 15;
    else if (incident.affectedData.estimatedRecords > 1000) score += 10;
    else if (incident.affectedData.estimatedRecords > 100) score += 5;
    // Breach type scoring
    switch (incident.type) {
      case BreachType.DATA_EXFILTRATION:
      case BreachType.SYSTEM_COMPROMISE:
        score += 20;
        break;
      case BreachType.UNAUTHORIZED_ACCESS:
      case BreachType.INSIDER_THREAT:
        score += 15;
        break;
      case BreachType.ACCIDENTAL_DISCLOSURE:
        score += 10;
        break;
      default:
        score += 5;
    }
    // Determine severity based on score
    if (score >= 70) return BreachSeverity.CRITICAL;
    if (score >= 50) return BreachSeverity.HIGH;
    if (score >= 30) return BreachSeverity.MEDIUM;
    if (score >= 10) return BreachSeverity.LOW;
    return BreachSeverity.INFORMATIONAL;
  };
  /**
   * Set compliance deadlines
   */
  BreachDetectionSystem.prototype.setComplianceDeadlines = function (incident) {
    var now = new Date();
    // ANPD notification deadline (72 hours for high-risk breaches)
    if (
      incident.severity === BreachSeverity.CRITICAL ||
      incident.severity === BreachSeverity.HIGH
    ) {
      var anpdDeadline = new Date(now.getTime() + 72 * 60 * 60 * 1000);
      incident.compliance.notificationDeadlines.push({
        authority: "ANPD",
        deadline: anpdDeadline,
        completed: false,
      });
    }
    // Data subject notification deadline (varies based on risk)
    var dataSubjectDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default
    incident.compliance.notificationDeadlines.push({
      authority: "Data Subjects",
      deadline: dataSubjectDeadline,
      completed: false,
    });
  };
  /**
   * Start forensic collection
   */
  BreachDetectionSystem.prototype.startForensicCollection = function (incident) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Collect system logs
        incident.investigation.forensicEvidence.push({
          type: "system_logs",
          location: "/var/log/security",
          collectedAt: new Date(),
        });
        // Collect network traffic
        incident.investigation.forensicEvidence.push({
          type: "network_traffic",
          location: "/var/log/network",
          collectedAt: new Date(),
        });
        // Collect application logs
        incident.investigation.forensicEvidence.push({
          type: "application_logs",
          location: "/var/log/application",
          collectedAt: new Date(),
        });
        this.logActivity("system", "forensic_collection_started", {
          incidentId: incident.id,
          evidenceCount: incident.investigation.forensicEvidence.length,
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Trigger immediate response
   */
  BreachDetectionSystem.prototype.triggerImmediateResponse = function (incident) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Add immediate containment actions based on incident type
        switch (incident.type) {
          case BreachType.UNAUTHORIZED_ACCESS:
            incident.response.immediateActions.push({
              action: "Disable compromised user accounts",
              assignedTo: "security_team",
              status: "pending",
            });
            break;
          case BreachType.SYSTEM_COMPROMISE:
            incident.response.immediateActions.push({
              action: "Isolate affected systems",
              assignedTo: "security_team",
              status: "pending",
            });
            break;
          case BreachType.DATA_EXFILTRATION:
            incident.response.immediateActions.push({
              action: "Block suspicious network traffic",
              assignedTo: "network_team",
              status: "pending",
            });
            break;
        }
        // Auto-notification if enabled
        if (
          this.config.autoNotificationEnabled &&
          (incident.severity === BreachSeverity.CRITICAL ||
            incident.severity === BreachSeverity.HIGH)
        ) {
          this.emit("notification:required", {
            incident: incident,
            type: "immediate",
            deadline: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          });
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Evaluate detection rule against event
   */
  BreachDetectionSystem.prototype.evaluateRule = function (rule, event) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, condition, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            (_i = 0), (_a = rule.conditions);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 7];
            condition = _a[_i];
            _b = condition.type;
            switch (_b) {
              case "threshold":
                return [3 /*break*/, 2];
              case "pattern":
                return [3 /*break*/, 3];
              case "anomaly":
                return [3 /*break*/, 4];
            }
            return [3 /*break*/, 6];
          case 2:
            if (this.evaluateThresholdCondition(condition, event)) {
              return [2 /*return*/, true];
            }
            return [3 /*break*/, 6];
          case 3:
            if (this.evaluatePatternCondition(condition, event)) {
              return [2 /*return*/, true];
            }
            return [3 /*break*/, 6];
          case 4:
            return [4 /*yield*/, this.evaluateAnomalyCondition(condition, event)];
          case 5:
            if (_c.sent()) {
              return [2 /*return*/, true];
            }
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 1];
          case 7:
            return [2 /*return*/, false];
        }
      });
    });
  };
  /**
   * Evaluate threshold condition
   */
  BreachDetectionSystem.prototype.evaluateThresholdCondition = function (condition, event) {
    var field = condition.parameters.field;
    var threshold = condition.parameters.threshold;
    var operator = condition.parameters.operator || ">=";
    var value = this.getNestedValue(event.data, field);
    if (value === undefined) return false;
    switch (operator) {
      case ">=":
        return value >= threshold;
      case ">":
        return value > threshold;
      case "<=":
        return value <= threshold;
      case "<":
        return value < threshold;
      case "==":
        return value === threshold;
      default:
        return false;
    }
  };
  /**
   * Evaluate pattern condition
   */
  BreachDetectionSystem.prototype.evaluatePatternCondition = function (condition, event) {
    var field = condition.parameters.field;
    var pattern = new RegExp(condition.parameters.pattern, condition.parameters.flags || "i");
    var value = this.getNestedValue(event.data, field);
    if (typeof value !== "string") return false;
    return pattern.test(value);
  };
  /**
   * Evaluate anomaly condition
   */
  BreachDetectionSystem.prototype.evaluateAnomalyCondition = function (condition, event) {
    return __awaiter(this, void 0, void 0, function () {
      var field, threshold, value;
      return __generator(this, function (_a) {
        field = condition.parameters.field;
        threshold = condition.parameters.threshold || 2;
        value = this.getNestedValue(event.data, field);
        if (typeof value !== "number") return [2 /*return*/, false];
        // For demo purposes, consider values > 1000 as anomalous
        return [2 /*return*/, value > 1000];
      });
    });
  };
  /**
   * Check for auto-escalation
   */
  BreachDetectionSystem.prototype.checkAutoEscalation = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var threshold;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            threshold = this.config.alertThresholds[alert.severity];
            if (!(threshold && this.shouldEscalate(alert, threshold))) return [3 /*break*/, 2];
            alert.escalatedAt = new Date();
            alert.escalatedTo = "security_manager";
            return [4 /*yield*/, this.saveAlert(alert)];
          case 1:
            _a.sent();
            this.emit("alert:escalated", { alert: alert });
            this.logActivity("system", "alert_escalated", {
              alertId: alert.id,
              severity: alert.severity,
              escalatedTo: alert.escalatedTo,
            });
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if alert should be escalated
   */
  BreachDetectionSystem.prototype.shouldEscalate = function (alert, threshold) {
    // Count similar alerts in the last hour
    var oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    var similarAlerts = Array.from(this.alerts.values()).filter(function (a) {
      return a.ruleId === alert.ruleId && a.detectedAt >= oneHourAgo && a.status === "open";
    });
    return similarAlerts.length >= threshold;
  };
  /**
   * Generate ANPD report
   */
  BreachDetectionSystem.prototype.generateANPDReport = function (incident) {
    return {
      incidentId: incident.id,
      organizationInfo: {
        name: "NeonPro",
        cnpj: "00.000.000/0001-00",
        dpo: "dpo@neonpro.com",
      },
      incidentDetails: {
        type: incident.type,
        detectedAt: incident.detectedAt,
        description: incident.description,
        affectedDataCategories: incident.affectedData.categories,
        estimatedAffectedRecords: incident.affectedData.estimatedRecords,
      },
      riskAssessment: {
        severity: incident.severity,
        businessImpact: incident.impact.businessImpact,
        dataSubjectsAffected: incident.impact.dataSubjectsAffected,
      },
      responseActions: {
        containmentMeasures: incident.response.containmentMeasures,
        mitigationSteps: incident.response.mitigationSteps,
      },
      timeline: incident.investigation.timeline,
    };
  };
  /**
   * Generate internal report
   */
  BreachDetectionSystem.prototype.generateInternalReport = function (incident) {
    return {
      executiveSummary: {
        incidentId: incident.id,
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        detectedAt: incident.detectedAt,
        affectedRecords: incident.affectedData.estimatedRecords,
      },
      technicalDetails: incident.technicalDetails,
      impactAssessment: incident.impact,
      responseActions: incident.response,
      investigation: incident.investigation,
      lessonsLearned: [],
      recommendations: [],
    };
  };
  /**
   * Generate data subject report
   */
  BreachDetectionSystem.prototype.generateDataSubjectReport = function (incident) {
    return {
      incidentSummary: {
        what: "A security incident occurred that may have affected your personal data",
        when: incident.detectedAt,
        dataTypes: incident.affectedData.dataTypes,
      },
      riskToIndividuals: {
        likelihood: this.assessRiskToIndividuals(incident),
        potentialConsequences: this.getPotentialConsequences(incident),
      },
      actionsTaken: {
        containment: incident.response.containmentMeasures,
        mitigation: incident.response.mitigationSteps,
      },
      recommendedActions: this.getRecommendedActionsForDataSubjects(incident),
      contactInformation: {
        dpo: "dpo@neonpro.com",
        supportTeam: "security@neonpro.com",
      },
    };
  };
  /**
   * Generate forensic report
   */
  BreachDetectionSystem.prototype.generateForensicReport = function (incident) {
    return {
      incidentOverview: {
        id: incident.id,
        type: incident.type,
        detectedAt: incident.detectedAt,
        investigator: incident.investigation.leadInvestigator,
      },
      technicalAnalysis: incident.technicalDetails,
      evidenceCollection: incident.investigation.forensicEvidence,
      timeline: incident.investigation.timeline,
      findings: incident.investigation.findings,
      rootCause: incident.investigation.rootCause,
      recommendations: [],
    };
  };
  /**
   * Assess risk to individuals
   */
  BreachDetectionSystem.prototype.assessRiskToIndividuals = function (incident) {
    if (
      incident.affectedData.categories.includes(AffectedDataCategory.SENSITIVE_PERSONAL) ||
      incident.affectedData.categories.includes(AffectedDataCategory.FINANCIAL_DATA)
    ) {
      return "high";
    }
    if (incident.affectedData.categories.includes(AffectedDataCategory.PERSONAL_IDENTIFIERS)) {
      return "medium";
    }
    return "low";
  };
  /**
   * Get potential consequences
   */
  BreachDetectionSystem.prototype.getPotentialConsequences = function (incident) {
    var consequences = [];
    if (incident.affectedData.categories.includes(AffectedDataCategory.FINANCIAL_DATA)) {
      consequences.push("Financial fraud or identity theft");
    }
    if (incident.affectedData.categories.includes(AffectedDataCategory.SENSITIVE_PERSONAL)) {
      consequences.push("Discrimination or reputational damage");
    }
    if (incident.affectedData.categories.includes(AffectedDataCategory.AUTHENTICATION_DATA)) {
      consequences.push("Unauthorized account access");
    }
    return consequences;
  };
  /**
   * Get recommended actions for data subjects
   */
  BreachDetectionSystem.prototype.getRecommendedActionsForDataSubjects = function (incident) {
    var actions = [];
    if (incident.affectedData.categories.includes(AffectedDataCategory.AUTHENTICATION_DATA)) {
      actions.push("Change your password immediately");
      actions.push("Enable two-factor authentication");
    }
    if (incident.affectedData.categories.includes(AffectedDataCategory.FINANCIAL_DATA)) {
      actions.push("Monitor your financial accounts for suspicious activity");
      actions.push("Consider placing a fraud alert on your credit report");
    }
    actions.push("Monitor your account for unusual activity");
    actions.push("Contact us if you notice any suspicious activity");
    return actions;
  };
  /**
   * Start monitoring interval
   */
  BreachDetectionSystem.prototype.startMonitoringInterval = function () {
    var _this = this;
    this.monitoringInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.performMonitoringCheck()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        });
      },
      this.config.monitoringIntervalMinutes * 60 * 1000,
    );
  };
  /**
   * Start compliance check interval
   */
  BreachDetectionSystem.prototype.startComplianceCheckInterval = function () {
    var _this = this;
    this.complianceCheckInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.performComplianceCheck()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        });
      },
      this.config.complianceCheckIntervalHours * 60 * 60 * 1000,
    );
  };
  /**
   * Perform monitoring check
   */
  BreachDetectionSystem.prototype.performMonitoringCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var openAlerts, staleIncidents;
      return __generator(this, function (_a) {
        try {
          openAlerts = Array.from(this.alerts.values()).filter(function (a) {
            return a.status === "open";
          });
          if (openAlerts.length > 100) {
            this.logActivity("system", "high_alert_volume", {
              openAlerts: openAlerts.length,
              timestamp: new Date(),
            });
          }
          staleIncidents = Array.from(this.incidents.values()).filter(function (i) {
            var daysSinceUpdate = (Date.now() - i.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
            return i.status === BreachStatus.INVESTIGATING && daysSinceUpdate > 7;
          });
          if (staleIncidents.length > 0) {
            this.logActivity("system", "stale_incidents_detected", {
              staleIncidents: staleIncidents.length,
              incidents: staleIncidents.map(function (i) {
                return i.id;
              }),
            });
          }
        } catch (error) {
          this.logActivity("system", "monitoring_check_error", {
            error: String(error),
          });
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Perform compliance check
   */
  BreachDetectionSystem.prototype.performComplianceCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, twentyFourHours, _i, _a, incident, _b, _c, deadline, timeRemaining, hoursRemaining;
      return __generator(this, function (_d) {
        try {
          now = new Date();
          twentyFourHours = 24 * 60 * 60 * 1000;
          // Check for approaching deadlines
          for (_i = 0, _a = this.incidents.values(); _i < _a.length; _i++) {
            incident = _a[_i];
            for (_b = 0, _c = incident.compliance.notificationDeadlines; _b < _c.length; _b++) {
              deadline = _c[_b];
              if (!deadline.completed) {
                timeRemaining = deadline.deadline.getTime() - now.getTime();
                hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
                if (timeRemaining <= twentyFourHours && timeRemaining > 0) {
                  this.emit("compliance:deadline_approaching", {
                    incident: incident,
                    deadline: deadline.deadline,
                    hoursRemaining: hoursRemaining,
                  });
                }
              }
            }
          }
        } catch (error) {
          this.logActivity("system", "compliance_check_error", {
            error: String(error),
          });
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Validate incident data
   */
  BreachDetectionSystem.prototype.validateIncident = function (incident) {
    if (!incident.title || incident.title.trim().length === 0) {
      throw new Error("Incident title is required");
    }
    if (!incident.description || incident.description.trim().length === 0) {
      throw new Error("Incident description is required");
    }
    if (incident.affectedData.estimatedRecords < 0) {
      throw new Error("Affected records count cannot be negative");
    }
  };
  /**
   * Get nested value from object
   */
  BreachDetectionSystem.prototype.getNestedValue = function (obj, path) {
    return path.split(".").reduce(function (current, key) {
      return current === null || current === void 0 ? void 0 : current[key];
    }, obj);
  };
  /**
   * Load detection rules
   */
  BreachDetectionSystem.prototype.loadDetectionRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var sampleRules, _i, sampleRules_1, rule;
      return __generator(this, function (_a) {
        sampleRules = [
          {
            id: "rule_failed_logins",
            name: "Multiple Failed Login Attempts",
            description: "Detects multiple failed login attempts from same IP",
            category: "authentication",
            severity: BreachSeverity.MEDIUM,
            enabled: true,
            conditions: [
              {
                type: "threshold",
                parameters: {
                  field: "failed_attempts",
                  threshold: 5,
                  operator: ">=",
                },
                timeWindow: { value: 15, unit: "minutes" },
              },
            ],
            dataSources: [
              {
                type: "auth_logs",
                location: "/var/log/auth.log",
                fields: ["ip_address", "failed_attempts", "timestamp"],
              },
            ],
            actions: [
              {
                type: "alert",
                parameters: { priority: "high" },
              },
            ],
            createdBy: "system",
            triggerCount: 0,
            falsePositiveRate: 0.1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        for (_i = 0, sampleRules_1 = sampleRules; _i < sampleRules_1.length; _i++) {
          rule = sampleRules_1[_i];
          this.rules.set(rule.id, rule);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load incidents
   */
  BreachDetectionSystem.prototype.loadIncidents = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load alerts
   */
  BreachDetectionSystem.prototype.loadAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save incident
   */
  BreachDetectionSystem.prototype.saveIncident = function (incident) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        this.incidents.set(incident.id, incident);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save alert
   */
  BreachDetectionSystem.prototype.saveAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        this.alerts.set(alert.id, alert);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save rule
   */
  BreachDetectionSystem.prototype.saveRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        this.rules.set(rule.id, rule);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save report
   */
  BreachDetectionSystem.prototype.saveReport = function (report) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Log activity
   */
  BreachDetectionSystem.prototype.logActivity = function (actor, action, details) {
    // In a real implementation, this would log to audit trail
    console.log("[BreachDetection] ".concat(actor, " - ").concat(action, ":"), details);
  };
  /**
   * Generate ID
   */
  BreachDetectionSystem.prototype.generateId = function (prefix) {
    return ""
      .concat(prefix, "_")
      .concat(Date.now(), "_")
      .concat(Math.random().toString(36).substr(2, 9));
  };
  /**
   * Shutdown the breach detection system
   */
  BreachDetectionSystem.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.monitoringInterval) {
          clearInterval(this.monitoringInterval);
          this.monitoringInterval = null;
        }
        if (this.complianceCheckInterval) {
          clearInterval(this.complianceCheckInterval);
          this.complianceCheckInterval = null;
        }
        this.removeAllListeners();
        this.isInitialized = false;
        this.logActivity("system", "breach_detection_shutdown", {
          timestamp: new Date(),
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Health check
   */
  BreachDetectionSystem.prototype.getHealthStatus = function () {
    var issues = [];
    if (!this.isInitialized) {
      issues.push("Breach detection system not initialized");
    }
    if (this.config.realTimeMonitoring && !this.monitoringInterval) {
      issues.push("Real-time monitoring not running");
    }
    if (!this.complianceCheckInterval) {
      issues.push("Compliance checking not running");
    }
    var enabledRules = Array.from(this.rules.values()).filter(function (r) {
      return r.enabled;
    });
    if (enabledRules.length === 0) {
      issues.push("No enabled detection rules");
    }
    var openIncidents = Array.from(this.incidents.values()).filter(function (i) {
      return i.status !== BreachStatus.RESOLVED && i.status !== BreachStatus.FALSE_POSITIVE;
    });
    if (openIncidents.length > 50) {
      issues.push("High number of open incidents: ".concat(openIncidents.length));
    }
    var status = issues.length === 0 ? "healthy" : issues.length <= 2 ? "degraded" : "unhealthy";
    return {
      status: status,
      details: {
        initialized: this.isInitialized,
        rulesCount: this.rules.size,
        enabledRules: enabledRules.length,
        incidentsCount: this.incidents.size,
        openIncidents: openIncidents.length,
        alertsCount: this.alerts.size,
        realTimeMonitoring: this.config.realTimeMonitoring,
        issues: issues,
      },
    };
  };
  return BreachDetectionSystem;
})(events_1.EventEmitter);
exports.BreachDetectionSystem = BreachDetectionSystem;
/**
 * Default breach detection system instance
 */
exports.breachDetectionSystem = new BreachDetectionSystem();
