/**
 * LGPD Audit Trail Manager
 * Story 1.5: LGPD Compliance Automation
 *
 * This module provides comprehensive audit trail management for LGPD compliance
 * with automated logging, monitoring, and reporting capabilities.
 */
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
exports.createauditTrailManager =
  exports.AuditTrailManager =
  exports.LGPDAuditSeverity =
  exports.LGPDAuditEventType =
    void 0;
var client_1 = require("@/lib/supabase/client");
var security_audit_logger_1 = require("@/lib/auth/security-audit-logger");
var logger_1 = require("@/lib/logger");
var consent_automation_manager_1 = require("./consent-automation-manager");
/**
 * LGPD Audit Event Types
 */
var LGPDAuditEventType;
((LGPDAuditEventType) => {
  LGPDAuditEventType["DATA_ACCESS"] = "data_access";
  LGPDAuditEventType["DATA_MODIFICATION"] = "data_modification";
  LGPDAuditEventType["DATA_DELETION"] = "data_deletion";
  LGPDAuditEventType["DATA_EXPORT"] = "data_export";
  LGPDAuditEventType["DATA_SHARING"] = "data_sharing";
  LGPDAuditEventType["CONSENT_COLLECTED"] = "consent_collected";
  LGPDAuditEventType["CONSENT_WITHDRAWN"] = "consent_withdrawn";
  LGPDAuditEventType["CONSENT_EXPIRED"] = "consent_expired";
  LGPDAuditEventType["DATA_BREACH"] = "data_breach";
  LGPDAuditEventType["PRIVACY_VIOLATION"] = "privacy_violation";
  LGPDAuditEventType["DATA_RETENTION_APPLIED"] = "data_retention_applied";
  LGPDAuditEventType["DATA_ANONYMIZED"] = "data_anonymized";
  LGPDAuditEventType["THIRD_PARTY_SHARING"] = "third_party_sharing";
  LGPDAuditEventType["DATA_SUBJECT_REQUEST"] = "data_subject_request";
  LGPDAuditEventType["COMPLIANCE_CHECK"] = "compliance_check";
})(LGPDAuditEventType || (exports.LGPDAuditEventType = LGPDAuditEventType = {}));
/**
 * LGPD Audit Severity Levels
 */
var LGPDAuditSeverity;
((LGPDAuditSeverity) => {
  LGPDAuditSeverity["INFO"] = "info";
  LGPDAuditSeverity["WARNING"] = "warning";
  LGPDAuditSeverity["ERROR"] = "error";
  LGPDAuditSeverity["CRITICAL"] = "critical";
})(LGPDAuditSeverity || (exports.LGPDAuditSeverity = LGPDAuditSeverity = {}));
/**
 * LGPD Audit Trail Manager
 */
var AuditTrailManager = /** @class */ (() => {
  function AuditTrailManager() {
    this.supabase = (0, client_1.createClient)();
    this.auditLogger = new security_audit_logger_1.SecurityAuditLogger();
  }
  /**
   * Log LGPD audit event
   */
  AuditTrailManager.prototype.logAuditEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var auditRecord, _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            auditRecord = __assign(__assign({}, event), { timestamp: new Date() });
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_audit_trail").insert(auditRecord).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error logging LGPD audit event:", error);
              throw new Error("Failed to log audit event: ".concat(error.message));
            }
            if (
              !(
                event.severity === LGPDAuditSeverity.CRITICAL ||
                event.severity === LGPDAuditSeverity.ERROR
              )
            )
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: event.userId || "system",
                action: event.eventType,
                resource: "lgpd_compliance",
                details: event.details,
                ipAddress: event.ipAddress,
                userAgent: event.userAgent,
                severity: event.severity,
              }),
            ];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            logger_1.logger.info(
              "LGPD audit event logged: ".concat(event.eventType, " - ").concat(event.severity),
            );
            return [2 /*return*/, data];
          case 4:
            error_1 = _b.sent();
            logger_1.logger.error("Error in logAuditEvent:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log data access event
   */
  AuditTrailManager.prototype.logDataAccess = function (
    userId,
    clinicId,
    dataType,
    purpose,
    dataSubjectId,
    accessDetails,
    ipAddress,
    userAgent,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: LGPDAuditEventType.DATA_ACCESS,
                userId: userId,
                clinicId: clinicId,
                dataType: dataType,
                purpose: purpose,
                severity: LGPDAuditSeverity.INFO,
                description: "Data access: ".concat(dataType, " for ").concat(purpose),
                details: __assign(__assign({}, accessDetails), {
                  accessedFields: accessDetails.fields || [],
                  recordCount: accessDetails.recordCount || 1,
                }),
                ipAddress: ipAddress,
                userAgent: userAgent,
                legalBasis: this.getLegalBasisForPurpose(purpose),
                dataSubjectId: dataSubjectId,
                complianceStatus: "compliant",
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
   * Log data modification event
   */
  AuditTrailManager.prototype.logDataModification = function (
    userId,
    clinicId,
    dataType,
    purpose,
    dataSubjectId,
    modifications,
    ipAddress,
    userAgent,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: LGPDAuditEventType.DATA_MODIFICATION,
                userId: userId,
                clinicId: clinicId,
                dataType: dataType,
                purpose: purpose,
                severity: LGPDAuditSeverity.INFO,
                description: "Data modification: ".concat(dataType),
                details: {
                  modifiedFields: modifications.fields || [],
                  oldValues: modifications.oldValues || {},
                  newValues: modifications.newValues || {},
                  changeReason: modifications.reason,
                },
                ipAddress: ipAddress,
                userAgent: userAgent,
                legalBasis: this.getLegalBasisForPurpose(purpose),
                dataSubjectId: dataSubjectId,
                complianceStatus: "compliant",
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
   * Log data deletion event
   */
  AuditTrailManager.prototype.logDataDeletion = function (
    userId,
    clinicId,
    dataType,
    dataSubjectId,
    deletionReason,
    deletionDetails,
    ipAddress,
    userAgent,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: LGPDAuditEventType.DATA_DELETION,
                userId: userId,
                clinicId: clinicId,
                dataType: dataType,
                purpose: consent_automation_manager_1.LGPDPurpose.LEGAL_OBLIGATION,
                severity: LGPDAuditSeverity.WARNING,
                description: "Data deletion: ".concat(dataType, " - ").concat(deletionReason),
                details: {
                  deletionReason: deletionReason,
                  deletedRecords: deletionDetails.recordCount || 1,
                  deletionMethod: deletionDetails.method || "soft_delete",
                  retentionPeriodExpired: deletionDetails.retentionExpired || false,
                },
                ipAddress: ipAddress,
                userAgent: userAgent,
                legalBasis: "Art. 16 - Eliminação de dados",
                dataSubjectId: dataSubjectId,
                complianceStatus: "compliant",
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
   * Log data breach event
   */
  AuditTrailManager.prototype.logDataBreach = function (
    clinicId,
    dataType,
    breachDetails,
    ipAddress,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: LGPDAuditEventType.DATA_BREACH,
                clinicId: clinicId,
                dataType: dataType,
                purpose: consent_automation_manager_1.LGPDPurpose.LEGAL_OBLIGATION,
                severity: LGPDAuditSeverity.CRITICAL,
                description: "Data breach: "
                  .concat(breachDetails.breachType, " - ")
                  .concat(breachDetails.description),
                details: __assign(__assign({}, breachDetails), {
                  reportedToANPD: false,
                  dataSubjectsNotified: false,
                  mitigationActions: [],
                }),
                ipAddress: ipAddress,
                legalBasis: "Art. 48 - Comunicação de incidente",
                complianceStatus: "non_compliant",
              }),
            ];
          case 1:
            _a.sent();
            // Trigger immediate breach response
            return [4 /*yield*/, this.triggerBreachResponse(clinicId, breachDetails)];
          case 2:
            // Trigger immediate breach response
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create data subject request
   */
  AuditTrailManager.prototype.createDataSubjectRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var dataSubjectRequest, _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            dataSubjectRequest = __assign(__assign({}, request), {
              status: "pending",
              submittedAt: new Date(),
            });
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .insert(dataSubjectRequest)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error creating data subject request:", error);
              throw new Error("Failed to create data subject request: ".concat(error.message));
            }
            // Log the request creation
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: LGPDAuditEventType.DATA_SUBJECT_REQUEST,
                clinicId: request.clinicId,
                dataType: consent_automation_manager_1.LGPDDataType.PROFILE,
                purpose: consent_automation_manager_1.LGPDPurpose.LEGAL_OBLIGATION,
                severity: LGPDAuditSeverity.INFO,
                description: "Data subject request: ".concat(request.requestType),
                details: {
                  requestType: request.requestType,
                  requestId: data.id,
                  priority: request.priority,
                },
                legalBasis: "Art. 18 - Direitos do titular",
                dataSubjectId: request.dataSubjectId,
                complianceStatus: "pending_review",
              }),
            ];
          case 2:
            // Log the request creation
            _b.sent();
            logger_1.logger.info(
              "Data subject request created: ".concat(data.id, " - ").concat(request.requestType),
            );
            return [2 /*return*/, data];
          case 3:
            error_2 = _b.sent();
            logger_1.logger.error("Error in createDataSubjectRequest:", error_2);
            throw error_2;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update data subject request status
   */
  AuditTrailManager.prototype.updateDataSubjectRequestStatus = function (
    requestId,
    status,
    responseDetails,
    assignedTo,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            updateData = {
              status: status,
              responseDetails: responseDetails,
              assignedTo: assignedTo,
            };
            if (status === "completed") {
              updateData.completedAt = new Date();
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .update(updateData)
                .eq("id", requestId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error updating data subject request:", error);
              throw new Error("Failed to update data subject request: ".concat(error.message));
            }
            // Log the status update
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: LGPDAuditEventType.DATA_SUBJECT_REQUEST,
                clinicId: data.clinicId,
                dataType: consent_automation_manager_1.LGPDDataType.PROFILE,
                purpose: consent_automation_manager_1.LGPDPurpose.LEGAL_OBLIGATION,
                severity: LGPDAuditSeverity.INFO,
                description: "Data subject request updated: ".concat(status),
                details: {
                  requestId: requestId,
                  newStatus: status,
                  responseDetails: responseDetails,
                  assignedTo: assignedTo,
                },
                legalBasis: "Art. 18 - Direitos do titular",
                dataSubjectId: data.dataSubjectId,
                complianceStatus: status === "completed" ? "compliant" : "pending_review",
              }),
            ];
          case 2:
            // Log the status update
            _b.sent();
            return [2 /*return*/, true];
          case 3:
            error_3 = _b.sent();
            logger_1.logger.error("Error in updateDataSubjectRequestStatus:", error_3);
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get audit trail for specific criteria
   */
  AuditTrailManager.prototype.getAuditTrail = function (clinicId_1, filters_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, filters, limit, offset) {
      var query, _a, data, error, error_4;
      if (limit === void 0) {
        limit = 100;
      }
      if (offset === void 0) {
        offset = 0;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("lgpd_audit_trail").select("*").eq("clinicId", clinicId);
            if (filters) {
              if (filters.eventType) query = query.eq("eventType", filters.eventType);
              if (filters.dataType) query = query.eq("dataType", filters.dataType);
              if (filters.severity) query = query.eq("severity", filters.severity);
              if (filters.userId) query = query.eq("userId", filters.userId);
              if (filters.dataSubjectId) query = query.eq("dataSubjectId", filters.dataSubjectId);
              if (filters.complianceStatus)
                query = query.eq("complianceStatus", filters.complianceStatus);
              if (filters.startDate)
                query = query.gte("timestamp", filters.startDate.toISOString());
              if (filters.endDate) query = query.lte("timestamp", filters.endDate.toISOString());
            }
            return [
              4 /*yield*/,
              query.order("timestamp", { ascending: false }).range(offset, offset + limit - 1),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching audit trail:", error);
              throw new Error("Failed to fetch audit trail: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
          case 2:
            error_4 = _b.sent();
            logger_1.logger.error("Error in getAuditTrail:", error_4);
            throw error_4;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get audit trail analytics
   */
  AuditTrailManager.prototype.getAuditAnalytics = function (clinicId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var auditEvents,
        requestQuery,
        _a,
        requests,
        requestError,
        eventsByType_1,
        eventsBySeverity_1,
        dataTypeCounts_1,
        compliantEvents,
        complianceRate,
        recentViolations,
        completedRequests,
        averageResponseTime,
        riskScore,
        topDataTypes,
        error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.getAuditTrail(clinicId, { startDate: startDate, endDate: endDate }, 1000),
            ];
          case 1:
            auditEvents = _b.sent();
            requestQuery = this.supabase
              .from("lgpd_data_subject_requests")
              .select("*")
              .eq("clinicId", clinicId);
            if (startDate) {
              requestQuery = requestQuery.gte("submittedAt", startDate.toISOString());
            }
            if (endDate) {
              requestQuery = requestQuery.lte("submittedAt", endDate.toISOString());
            }
            return [4 /*yield*/, requestQuery];
          case 2:
            (_a = _b.sent()), (requests = _a.data), (requestError = _a.error);
            if (requestError) {
              logger_1.logger.error("Error fetching data subject requests:", requestError);
              throw new Error(
                "Failed to fetch data subject requests: ".concat(requestError.message),
              );
            }
            eventsByType_1 = {};
            eventsBySeverity_1 = {};
            dataTypeCounts_1 = {};
            // Initialize counters
            Object.values(LGPDAuditEventType).forEach((type) => (eventsByType_1[type] = 0));
            Object.values(LGPDAuditSeverity).forEach(
              (severity) => (eventsBySeverity_1[severity] = 0),
            );
            Object.values(consent_automation_manager_1.LGPDDataType).forEach(
              (type) => (dataTypeCounts_1[type] = 0),
            );
            // Count events
            auditEvents.forEach((event) => {
              eventsByType_1[event.eventType]++;
              eventsBySeverity_1[event.severity]++;
              dataTypeCounts_1[event.dataType]++;
            });
            compliantEvents = auditEvents.filter((e) => e.complianceStatus === "compliant").length;
            complianceRate =
              auditEvents.length > 0 ? (compliantEvents / auditEvents.length) * 100 : 100;
            recentViolations = auditEvents
              .filter((e) => e.complianceStatus === "non_compliant")
              .slice(0, 10);
            completedRequests =
              (requests === null || requests === void 0
                ? void 0
                : requests.filter((r) => r.status === "completed")) || [];
            averageResponseTime =
              completedRequests.length > 0
                ? completedRequests.reduce((sum, req) => {
                    if (req.completedAt && req.submittedAt) {
                      return (
                        sum +
                        (new Date(req.completedAt).getTime() - new Date(req.submittedAt).getTime())
                      );
                    }
                    return sum;
                  }, 0) /
                  completedRequests.length /
                  (1000 * 60 * 60 * 24) // Convert to days
                : 0;
            riskScore = this.calculateRiskScore(auditEvents, requests || []);
            topDataTypes = Object.entries(dataTypeCounts_1)
              .map((_a) => {
                var dataType = _a[0],
                  count = _a[1];
                return { dataType: dataType, count: count };
              })
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
            return [
              2 /*return*/,
              {
                totalEvents: auditEvents.length,
                eventsByType: eventsByType_1,
                eventsBySeverity: eventsBySeverity_1,
                complianceRate: complianceRate,
                recentViolations: recentViolations,
                dataSubjectRequests: {
                  total: (requests === null || requests === void 0 ? void 0 : requests.length) || 0,
                  pending:
                    (requests === null || requests === void 0
                      ? void 0
                      : requests.filter((r) => r.status === "pending").length) || 0,
                  completed: completedRequests.length,
                  averageResponseTime: averageResponseTime,
                },
                topDataTypes: topDataTypes,
                riskScore: riskScore,
              },
            ];
          case 3:
            error_5 = _b.sent();
            logger_1.logger.error("Error in getAuditAnalytics:", error_5);
            throw error_5;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate compliance report
   */
  AuditTrailManager.prototype.generateComplianceReport = function (clinicId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var analytics, recommendations, complianceScore, report, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getAuditAnalytics(clinicId, startDate, endDate)];
          case 1:
            analytics = _a.sent();
            recommendations = this.generateComplianceRecommendations(analytics);
            complianceScore = this.calculateComplianceScore(analytics);
            report = {
              reportId: "lgpd-report-".concat(clinicId, "-").concat(Date.now()),
              generatedAt: new Date(),
              period: { start: startDate, end: endDate },
              analytics: analytics,
              recommendations: recommendations,
              complianceScore: complianceScore,
            };
            // Log report generation
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: LGPDAuditEventType.COMPLIANCE_CHECK,
                clinicId: clinicId,
                dataType: consent_automation_manager_1.LGPDDataType.ANALYTICS,
                purpose: consent_automation_manager_1.LGPDPurpose.LEGAL_OBLIGATION,
                severity: LGPDAuditSeverity.INFO,
                description: "LGPD compliance report generated",
                details: {
                  reportId: report.reportId,
                  complianceScore: complianceScore,
                  period: { start: startDate, end: endDate },
                },
                legalBasis: "Art. 50 - Relatórios de impacto",
                complianceStatus: complianceScore >= 80 ? "compliant" : "pending_review",
              }),
            ];
          case 2:
            // Log report generation
            _a.sent();
            return [2 /*return*/, report];
          case 3:
            error_6 = _a.sent();
            logger_1.logger.error("Error in generateComplianceReport:", error_6);
            throw error_6;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get legal basis for processing purpose
   */
  AuditTrailManager.prototype.getLegalBasisForPurpose = (purpose) => {
    var _a;
    var legalBasisMap =
      ((_a = {}),
      (_a[consent_automation_manager_1.LGPDPurpose.SERVICE_PROVISION] =
        "Art. 7º, V - execução de contrato"),
      (_a[consent_automation_manager_1.LGPDPurpose.LEGAL_OBLIGATION] =
        "Art. 7º, II - cumprimento de obrigação legal"),
      (_a[consent_automation_manager_1.LGPDPurpose.LEGITIMATE_INTEREST] =
        "Art. 7º, IX - interesse legítimo"),
      (_a[consent_automation_manager_1.LGPDPurpose.CONSENT] = "Art. 7º, I - consentimento"),
      (_a[consent_automation_manager_1.LGPDPurpose.VITAL_INTEREST] =
        "Art. 7º, IV - proteção da vida"),
      (_a[consent_automation_manager_1.LGPDPurpose.PUBLIC_INTEREST] =
        "Art. 7º, III - interesse público"),
      (_a[consent_automation_manager_1.LGPDPurpose.CONTRACT_PERFORMANCE] =
        "Art. 7º, V - execução de contrato"),
      _a);
    return legalBasisMap[purpose] || "Art. 7º, I - consentimento";
  };
  /**
   * Calculate risk score based on audit events
   */
  AuditTrailManager.prototype.calculateRiskScore = (auditEvents, dataSubjectRequests) => {
    var riskScore = 0;
    // Base risk from non-compliant events
    var nonCompliantEvents = auditEvents.filter((e) => e.complianceStatus === "non_compliant");
    riskScore += nonCompliantEvents.length * 10;
    // Risk from critical/error events
    var criticalEvents = auditEvents.filter(
      (e) => e.severity === LGPDAuditSeverity.CRITICAL || e.severity === LGPDAuditSeverity.ERROR,
    );
    riskScore += criticalEvents.length * 5;
    // Risk from overdue data subject requests
    var overdueRequests = dataSubjectRequests.filter((r) => {
      if (r.status === "completed") return false;
      var daysSinceSubmission =
        (Date.now() - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSubmission > 15; // LGPD requires response within 15 days
    });
    riskScore += overdueRequests.length * 15;
    // Normalize to 0-100 scale
    return Math.min(100, riskScore);
  };
  /**
   * Calculate compliance score
   */
  AuditTrailManager.prototype.calculateComplianceScore = (analytics) => {
    var score = 100;
    // Deduct for non-compliance
    score -= 100 - analytics.complianceRate;
    // Deduct for high risk score
    score -= analytics.riskScore * 0.3;
    // Deduct for overdue requests
    var overdueRequestsPenalty = Math.max(0, analytics.dataSubjectRequests.pending - 5) * 2;
    score -= overdueRequestsPenalty;
    return Math.max(0, Math.round(score));
  };
  /**
   * Generate compliance recommendations
   */
  AuditTrailManager.prototype.generateComplianceRecommendations = (analytics) => {
    var recommendations = [];
    if (analytics.complianceRate < 95) {
      recommendations.push("Revisar processos de conformidade para reduzir eventos não conformes");
    }
    if (analytics.riskScore > 30) {
      recommendations.push("Implementar medidas adicionais de mitigação de riscos");
    }
    if (analytics.dataSubjectRequests.pending > 5) {
      recommendations.push("Acelerar processamento de solicitações de titulares de dados");
    }
    if (analytics.dataSubjectRequests.averageResponseTime > 10) {
      recommendations.push(
        "Otimizar tempo de resposta para solicitações de titulares (meta: <10 dias)",
      );
    }
    if (analytics.eventsBySeverity[LGPDAuditSeverity.CRITICAL] > 0) {
      recommendations.push("Investigar e resolver eventos críticos de segurança imediatamente");
    }
    if (recommendations.length === 0) {
      recommendations.push("Manter práticas atuais de conformidade LGPD");
    }
    return recommendations;
  };
  /**
   * Trigger breach response procedures
   */
  AuditTrailManager.prototype.triggerBreachResponse = function (clinicId, breachDetails) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // This would integrate with incident response systems
            logger_1.logger.warn(
              "Data breach response triggered for clinic ".concat(clinicId, ":"),
              breachDetails,
            );
            // Log the breach response initiation
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: "system",
                action: "breach_response_initiated",
                resource: "lgpd_compliance",
                details: {
                  clinicId: clinicId,
                  breachType: breachDetails.breachType,
                  affectedRecords: breachDetails.affectedRecords,
                  riskLevel: breachDetails.riskLevel,
                },
                severity: "critical",
              }),
            ];
          case 1:
            // Log the breach response initiation
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            logger_1.logger.error("Error triggering breach response:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return AuditTrailManager;
})();
exports.AuditTrailManager = AuditTrailManager;
// Export singleton instance
var createauditTrailManager = () => new AuditTrailManager();
exports.createauditTrailManager = createauditTrailManager;
