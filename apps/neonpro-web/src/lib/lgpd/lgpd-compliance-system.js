/**
 * LGPD Compliance System - Main Integration Module
 * Story 1.5: LGPD Compliance Automation
 *
 * This module provides a unified interface for all LGPD compliance functionality,
 * integrating consent management, audit trails, and data retention policies.
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
exports.DataSubjectRequestStatus =
  exports.DataSubjectRequestType =
  exports.LGPDAuditSeverity =
  exports.LGPDAuditEventType =
  exports.LGPDPurpose =
  exports.LGPDDataType =
  exports.lgpdComplianceSystem =
  exports.defaultLGPDConfig =
  exports.LGPDComplianceSystem =
    void 0;
exports.createLGPDComplianceSystem = createLGPDComplianceSystem;
var consent_automation_manager_1 = require("./consent-automation-manager");
Object.defineProperty(exports, "LGPDDataType", {
  enumerable: true,
  get: () => consent_automation_manager_1.LGPDDataType,
});
Object.defineProperty(exports, "LGPDPurpose", {
  enumerable: true,
  get: () => consent_automation_manager_1.LGPDPurpose,
});
var audit_trail_manager_1 = require("./audit-trail-manager");
Object.defineProperty(exports, "LGPDAuditEventType", {
  enumerable: true,
  get: () => audit_trail_manager_1.LGPDAuditEventType,
});
Object.defineProperty(exports, "LGPDAuditSeverity", {
  enumerable: true,
  get: () => audit_trail_manager_1.LGPDAuditSeverity,
});
Object.defineProperty(exports, "DataSubjectRequestType", {
  enumerable: true,
  get: () => audit_trail_manager_1.DataSubjectRequestType,
});
Object.defineProperty(exports, "DataSubjectRequestStatus", {
  enumerable: true,
  get: () => audit_trail_manager_1.DataSubjectRequestStatus,
});
var data_retention_manager_1 = require("./data-retention-manager");
/**
 * Main LGPD Compliance System Class
 */
var LGPDComplianceSystem = /** @class */ (() => {
  function LGPDComplianceSystem(config) {
    this.alerts = [];
    this.config = config;
  }
  /**
   * Get comprehensive compliance status
   */
  LGPDComplianceSystem.prototype.getComplianceStatus = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        consentAnalytics,
        auditAnalytics,
        retentionAnalytics,
        totalConsents,
        activeConsents,
        consentComplianceRate,
        consentScore,
        auditComplianceRate,
        auditScore,
        retentionComplianceRate,
        retentionScore,
        overallScore,
        riskLevel,
        recommendations,
        alerts,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              Promise.all([
                consent_automation_manager_1.consentAutomationManager.getConsentAnalytics(
                  this.config.clinicId,
                  startDate,
                  endDate,
                ),
                audit_trail_manager_1.auditTrailManager.getAuditAnalytics(
                  this.config.clinicId,
                  startDate,
                  endDate,
                ),
                data_retention_manager_1.dataRetentionManager.getRetentionAnalytics(
                  this.config.clinicId,
                  startDate,
                  endDate,
                ),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (consentAnalytics = _a[0]),
              (auditAnalytics = _a[1]),
              (retentionAnalytics = _a[2]);
            totalConsents = consentAnalytics.totalConsents;
            activeConsents = consentAnalytics.activeConsents;
            consentComplianceRate =
              totalConsents > 0 ? (activeConsents / totalConsents) * 100 : 100;
            consentScore = Math.min(100, consentComplianceRate * 1.2);
            auditComplianceRate = auditAnalytics.complianceRate;
            auditScore = Math.max(
              0,
              auditComplianceRate - auditAnalytics.recentViolations.length * 10,
            );
            retentionComplianceRate = retentionAnalytics.retentionCompliance;
            retentionScore = Math.max(
              0,
              retentionComplianceRate - retentionAnalytics.expiredRecords * 5,
            );
            overallScore = Math.round(consentScore * 0.4 + auditScore * 0.4 + retentionScore * 0.2);
            riskLevel = this.calculateRiskLevel(overallScore, auditAnalytics.riskScore);
            recommendations = this.generateRecommendations(
              consentAnalytics,
              auditAnalytics,
              retentionAnalytics,
            );
            return [4 /*yield*/, this.getActiveAlerts()];
          case 2:
            alerts = _b.sent();
            return [
              2 /*return*/,
              {
                overallScore: overallScore,
                riskLevel: riskLevel,
                consentCompliance: {
                  score: Math.round(consentScore),
                  activeConsents: consentAnalytics.activeConsents,
                  expiredConsents: consentAnalytics.expiredConsents,
                  withdrawnConsents: consentAnalytics.withdrawnConsents,
                  complianceRate: Math.round(consentComplianceRate),
                },
                auditCompliance: {
                  score: Math.round(auditScore),
                  recentViolations: auditAnalytics.recentViolations.length,
                  averageResponseTime: auditAnalytics.dataSubjectRequests.averageResponseTime,
                  complianceRate: Math.round(auditComplianceRate),
                },
                retentionCompliance: {
                  score: Math.round(retentionScore),
                  expiredRecords: retentionAnalytics.expiredRecords,
                  expiringSoonRecords: retentionAnalytics.expiringSoonRecords,
                  complianceRate: Math.round(retentionComplianceRate),
                },
                recommendations: recommendations,
                alerts: alerts,
              },
            ];
          case 3:
            error_1 = _b.sent();
            console.error("Error getting compliance status:", error_1);
            throw new Error("Failed to get compliance status");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process data subject rights request
   */
  LGPDComplianceSystem.prototype.processDataSubjectRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var requestId, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            // Log the request in audit trail
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.logAuditEvent({
                clinicId: this.config.clinicId,
                eventType: audit_trail_manager_1.LGPDAuditEventType.DATA_SUBJECT_REQUEST,
                severity:
                  request.urgency === "HIGH"
                    ? audit_trail_manager_1.LGPDAuditSeverity.WARNING
                    : audit_trail_manager_1.LGPDAuditSeverity.INFO,
                dataType:
                  request.dataTypes[0] || consent_automation_manager_1.LGPDDataType.PERSONAL_DATA,
                description: "Data subject request: "
                  .concat(request.type, " - ")
                  .concat(request.description),
                userId: request.subjectId,
                metadata: {
                  requestType: request.type,
                  dataTypes: request.dataTypes,
                  urgency: request.urgency,
                  legalBasis: request.legalBasis,
                },
              }),
            ];
          case 1:
            // Log the request in audit trail
            _a.sent();
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.createDataSubjectRequest({
                clinicId: this.config.clinicId,
                subjectId: request.subjectId,
                requestType: request.type,
                description: request.description,
                urgency: request.urgency,
                metadata: request.metadata,
              }),
            ];
          case 2:
            requestId = _a.sent();
            if (!(request.urgency === "HIGH")) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.createAlert({
                type: "REQUEST_OVERDUE",
                severity: "WARNING",
                title: "Solicitação de Alta Urgência",
                description: "Nova solicita\u00E7\u00E3o de ".concat(
                  request.type,
                  " com alta urg\u00EAncia requer aten\u00E7\u00E3o imediata",
                ),
                actionRequired: true,
                metadata: { requestId: requestId, subjectId: request.subjectId },
              }),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/, requestId];
          case 5:
            error_2 = _a.sent();
            console.error("Error processing data subject request:", error_2);
            throw new Error("Failed to process data subject request");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Collect consent with full LGPD compliance
   */
  LGPDComplianceSystem.prototype.collectConsent = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var consentId, _i, _a, dataType, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              consent_automation_manager_1.consentAutomationManager.collectConsent(request),
            ];
          case 1:
            consentId = _b.sent();
            // Log in audit trail
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.logAuditEvent({
                clinicId: this.config.clinicId,
                eventType: audit_trail_manager_1.LGPDAuditEventType.CONSENT_COLLECTED,
                severity: audit_trail_manager_1.LGPDAuditSeverity.INFO,
                dataType: request.dataTypes[0],
                description: "Consent collected for ".concat(request.dataTypes.join(", ")),
                userId: request.userId,
                metadata: {
                  consentId: consentId,
                  dataTypes: request.dataTypes,
                  purposes: request.purposes,
                  version: request.version,
                },
              }),
            ];
          case 2:
            // Log in audit trail
            _b.sent();
            (_i = 0), (_a = request.dataTypes);
            _b.label = 3;
          case 3:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            dataType = _a[_i];
            return [
              4 /*yield*/,
              data_retention_manager_1.dataRetentionManager.registerDataForTracking({
                clinicId: this.config.clinicId,
                dataType: dataType,
                dataId: request.userId,
                collectedAt: new Date(),
                metadata: {
                  consentId: consentId,
                  source: "consent_collection",
                },
              }),
            ];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [2 /*return*/, consentId];
          case 7:
            error_3 = _b.sent();
            console.error("Error collecting consent:", error_3);
            throw new Error("Failed to collect consent");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Withdraw consent with full compliance
   */
  LGPDComplianceSystem.prototype.withdrawConsent = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            // Withdraw the consent
            return [
              4 /*yield*/,
              consent_automation_manager_1.consentAutomationManager.withdrawConsent(request),
            ];
          case 1:
            // Withdraw the consent
            _a.sent();
            // Log in audit trail
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.logAuditEvent({
                clinicId: this.config.clinicId,
                eventType: audit_trail_manager_1.LGPDAuditEventType.CONSENT_WITHDRAWN,
                severity: audit_trail_manager_1.LGPDAuditSeverity.WARNING,
                dataType: consent_automation_manager_1.LGPDDataType.PERSONAL_DATA,
                description: "Consent withdrawn: ".concat(request.reason || "No reason provided"),
                userId: request.userId,
                metadata: {
                  consentId: request.consentId,
                  reason: request.reason,
                  withdrawnAt: new Date(),
                },
              }),
            ];
          case 2:
            // Log in audit trail
            _a.sent();
            if (!request.deleteData) return [3 /*break*/, 4];
            return [4 /*yield*/, this.processDataDeletion(request.userId, request.dataTypes || [])];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_4 = _a.sent();
            console.error("Error withdrawing consent:", error_4);
            throw new Error("Failed to withdraw consent");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Run automated compliance checks
   */
  LGPDComplianceSystem.prototype.runComplianceChecks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var alerts,
        expiringConsents,
        retentionAnalytics,
        auditAnalytics,
        overdueRequests,
        _i,
        alerts_1,
        alert_1,
        error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            alerts = [];
            return [
              4 /*yield*/,
              consent_automation_manager_1.consentAutomationManager.getExpiringConsents(
                this.config.clinicId,
                30, // 30 days warning
              ),
            ];
          case 1:
            expiringConsents = _a.sent();
            if (expiringConsents.length > 0) {
              alerts.push({
                id: "consent-expiring-".concat(Date.now()),
                type: "CONSENT_EXPIRING",
                severity: "WARNING",
                title: "Consentimentos Expirando",
                description: "".concat(
                  expiringConsents.length,
                  " consentimento(s) expirando nos pr\u00F3ximos 30 dias",
                ),
                actionRequired: true,
                createdAt: new Date(),
                metadata: { count: expiringConsents.length },
              });
            }
            return [
              4 /*yield*/,
              data_retention_manager_1.dataRetentionManager.getRetentionAnalytics(
                this.config.clinicId,
              ),
            ];
          case 2:
            retentionAnalytics = _a.sent();
            if (retentionAnalytics.expiredRecords > 0) {
              alerts.push({
                id: "retention-expired-".concat(Date.now()),
                type: "RETENTION_EXPIRED",
                severity: "ERROR",
                title: "Dados com Retenção Expirada",
                description: "".concat(
                  retentionAnalytics.expiredRecords,
                  " registro(s) com per\u00EDodo de reten\u00E7\u00E3o expirado",
                ),
                actionRequired: true,
                createdAt: new Date(),
                metadata: { count: retentionAnalytics.expiredRecords },
              });
            }
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.getAuditAnalytics(this.config.clinicId),
            ];
          case 3:
            auditAnalytics = _a.sent();
            if (auditAnalytics.recentViolations.length > 0) {
              alerts.push({
                id: "violations-detected-".concat(Date.now()),
                type: "COMPLIANCE_VIOLATION",
                severity: "CRITICAL",
                title: "Violações de Conformidade Detectadas",
                description: "".concat(
                  auditAnalytics.recentViolations.length,
                  " viola\u00E7\u00E3o(\u00F5es) de conformidade detectada(s)",
                ),
                actionRequired: true,
                createdAt: new Date(),
                metadata: { violations: auditAnalytics.recentViolations },
              });
            }
            overdueRequests = auditAnalytics.dataSubjectRequests.pending;
            if (overdueRequests > 5) {
              // Threshold for overdue requests
              alerts.push({
                id: "requests-overdue-".concat(Date.now()),
                type: "REQUEST_OVERDUE",
                severity: "WARNING",
                title: "Solicitações em Atraso",
                description: "".concat(
                  overdueRequests,
                  " solicita\u00E7\u00E3o(\u00F5es) de titular pendente(s)",
                ),
                actionRequired: true,
                createdAt: new Date(),
                metadata: { count: overdueRequests },
              });
            }
            (_i = 0), (alerts_1 = alerts);
            _a.label = 4;
          case 4:
            if (!(_i < alerts_1.length)) return [3 /*break*/, 7];
            alert_1 = alerts_1[_i];
            return [4 /*yield*/, this.createAlert(alert_1)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 4];
          case 7:
            return [2 /*return*/, alerts];
          case 8:
            error_5 = _a.sent();
            console.error("Error running compliance checks:", error_5);
            throw new Error("Failed to run compliance checks");
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate comprehensive compliance report
   */
  LGPDComplianceSystem.prototype.generateComplianceReport = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var reportId,
        _a,
        complianceStatus,
        consentAnalytics,
        auditAnalytics,
        retentionAnalytics,
        violations,
        executiveSummary,
        error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            reportId = "lgpd-report-".concat(Date.now());
            return [
              4 /*yield*/,
              Promise.all([
                this.getComplianceStatus(startDate, endDate),
                consent_automation_manager_1.consentAutomationManager.getConsentAnalytics(
                  this.config.clinicId,
                  startDate,
                  endDate,
                ),
                audit_trail_manager_1.auditTrailManager.getAuditAnalytics(
                  this.config.clinicId,
                  startDate,
                  endDate,
                ),
                data_retention_manager_1.dataRetentionManager.getRetentionAnalytics(
                  this.config.clinicId,
                  startDate,
                  endDate,
                ),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (complianceStatus = _a[0]),
              (consentAnalytics = _a[1]),
              (auditAnalytics = _a[2]),
              (retentionAnalytics = _a[3]);
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.getAuditTrail(
                this.config.clinicId,
                {
                  severity: audit_trail_manager_1.LGPDAuditSeverity.ERROR,
                  startDate: startDate,
                  endDate: endDate,
                },
                100,
              ),
            ];
          case 2:
            violations = _b.sent();
            executiveSummary = this.generateExecutiveSummary(
              complianceStatus,
              consentAnalytics,
              auditAnalytics,
              retentionAnalytics,
            );
            return [
              2 /*return*/,
              {
                reportId: reportId,
                clinicId: this.config.clinicId,
                generatedAt: new Date(),
                period: { startDate: startDate, endDate: endDate },
                complianceStatus: complianceStatus,
                consentAnalytics: consentAnalytics,
                auditAnalytics: auditAnalytics,
                retentionAnalytics: retentionAnalytics,
                violations: violations,
                recommendations: complianceStatus.recommendations,
                executiveSummary: executiveSummary,
              },
            ];
          case 3:
            error_6 = _b.sent();
            console.error("Error generating compliance report:", error_6);
            throw new Error("Failed to generate compliance report");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automated cleanup of expired data
   */
  LGPDComplianceSystem.prototype.runAutomatedCleanup = function () {
    return __awaiter(this, void 0, void 0, function () {
      var result, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!this.config.enableAutomaticCleanup) {
              throw new Error("Automated cleanup is disabled");
            }
            return [
              4 /*yield*/,
              data_retention_manager_1.dataRetentionManager.processExpiredData(
                this.config.clinicId,
              ),
            ];
          case 1:
            result = _a.sent();
            // Clean up expired consents
            return [
              4 /*yield*/,
              consent_automation_manager_1.consentAutomationManager.cleanupExpiredConsents(
                this.config.clinicId,
              ),
            ];
          case 2:
            // Clean up expired consents
            _a.sent();
            // Log cleanup activity
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.logAuditEvent({
                clinicId: this.config.clinicId,
                eventType: audit_trail_manager_1.LGPDAuditEventType.DATA_DELETION,
                severity: audit_trail_manager_1.LGPDAuditSeverity.INFO,
                dataType: consent_automation_manager_1.LGPDDataType.PERSONAL_DATA,
                description: "Automated cleanup completed: "
                  .concat(result.processed, " processed, ")
                  .concat(result.deleted, " deleted, ")
                  .concat(result.anonymized, " anonymized"),
                metadata: result,
              }),
            ];
          case 3:
            // Log cleanup activity
            _a.sent();
            return [2 /*return*/, result];
          case 4:
            error_7 = _a.sent();
            console.error("Error running automated cleanup:", error_7);
            throw new Error("Failed to run automated cleanup");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Private helper methods
   */
  LGPDComplianceSystem.prototype.calculateRiskLevel = (overallScore, auditRiskScore) => {
    var combinedRisk = 100 - overallScore + auditRiskScore;
    if (combinedRisk <= 20) return "LOW";
    if (combinedRisk <= 50) return "MEDIUM";
    if (combinedRisk <= 80) return "HIGH";
    return "CRITICAL";
  };
  LGPDComplianceSystem.prototype.generateRecommendations = (
    consentAnalytics,
    auditAnalytics,
    retentionAnalytics,
  ) => {
    var recommendations = [];
    // Consent recommendations
    if (consentAnalytics.expiredConsents > consentAnalytics.activeConsents * 0.1) {
      recommendations.push("Renovar consentimentos expirados para manter conformidade");
    }
    if (consentAnalytics.withdrawnConsents > consentAnalytics.totalConsents * 0.2) {
      recommendations.push("Revisar processos de coleta de consentimento para reduzir retiradas");
    }
    // Audit recommendations
    if (auditAnalytics.recentViolations.length > 0) {
      recommendations.push("Investigar e corrigir violações de conformidade identificadas");
    }
    if (auditAnalytics.dataSubjectRequests.averageResponseTime > 15) {
      recommendations.push(
        "Otimizar processo de resposta a solicitações de titulares (meta: 15 dias)",
      );
    }
    // Retention recommendations
    if (retentionAnalytics.expiredRecords > 0) {
      recommendations.push("Processar dados com período de retenção expirado");
    }
    if (retentionAnalytics.expiringSoonRecords > retentionAnalytics.activeRecords * 0.1) {
      recommendations.push("Preparar para expiração de dados nos próximos 30 dias");
    }
    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push("Manter monitoramento contínuo da conformidade LGPD");
    }
    return recommendations;
  };
  LGPDComplianceSystem.prototype.generateExecutiveSummary = (
    complianceStatus,
    consentAnalytics,
    auditAnalytics,
    retentionAnalytics,
  ) => {
    var riskText = {
      LOW: "baixo",
      MEDIUM: "médio",
      HIGH: "alto",
      CRITICAL: "crítico",
    }[complianceStatus.riskLevel];
    return "\nResumo Executivo - Conformidade LGPD\n\nA cl\u00EDnica apresenta um score geral de conformidade de "
      .concat(complianceStatus.overallScore, "% com n\u00EDvel de risco ")
      .concat(riskText, ".\n\nConsentimentos: ")
      .concat(consentAnalytics.activeConsents, " ativos de ")
      .concat(consentAnalytics.totalConsents, " total (")
      .concat(
        Math.round((consentAnalytics.activeConsents / consentAnalytics.totalConsents) * 100),
        "% de conformidade).\n\nAuditoria: ",
      )
      .concat(
        auditAnalytics.recentViolations.length,
        " viola\u00E7\u00E3o(\u00F5es) recente(s) identificada(s), com tempo m\u00E9dio de resposta de ",
      )
      .concat(
        Math.round(auditAnalytics.dataSubjectRequests.averageResponseTime),
        " dias para solicita\u00E7\u00F5es.\n\nReten\u00E7\u00E3o: ",
      )
      .concat(retentionAnalytics.expiredRecords, " registro(s) com per\u00EDodo expirado, ")
      .concat(
        retentionAnalytics.expiringSoonRecords,
        " expirando em breve.\n\nRecomenda\u00E7\u00F5es principais: ",
      )
      .concat(complianceStatus.recommendations.slice(0, 3).join("; "), ".\n    ")
      .trim();
  };
  LGPDComplianceSystem.prototype.createAlert = function (alertData) {
    return __awaiter(this, void 0, void 0, function () {
      var alert;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alert = __assign(
              {
                id: "alert-"
                  .concat(Date.now(), "-")
                  .concat(Math.random().toString(36).substr(2, 9)),
                createdAt: new Date(),
              },
              alertData,
            );
            this.alerts.push(alert);
            // Log alert in audit trail
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.logAuditEvent({
                clinicId: this.config.clinicId,
                eventType: audit_trail_manager_1.LGPDAuditEventType.DATA_BREACH,
                severity: alert.severity,
                dataType: consent_automation_manager_1.LGPDDataType.PERSONAL_DATA,
                description: "LGPD Alert: ".concat(alert.title, " - ").concat(alert.description),
                metadata: {
                  alertId: alert.id,
                  alertType: alert.type,
                  actionRequired: alert.actionRequired,
                },
              }),
            ];
          case 1:
            // Log alert in audit trail
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceSystem.prototype.getActiveAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.alerts.filter((alert) => !alert.resolvedAt)];
      });
    });
  };
  LGPDComplianceSystem.prototype.processDataDeletion = function (userId, dataTypes) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Log data deletion
            return [
              4 /*yield*/,
              audit_trail_manager_1.auditTrailManager.logAuditEvent({
                clinicId: this.config.clinicId,
                eventType: audit_trail_manager_1.LGPDAuditEventType.DATA_DELETION,
                severity: audit_trail_manager_1.LGPDAuditSeverity.WARNING,
                dataType: dataTypes[0] || consent_automation_manager_1.LGPDDataType.PERSONAL_DATA,
                description: "Data deletion requested for user ".concat(userId),
                userId: userId,
                metadata: {
                  dataTypes: dataTypes,
                  reason: "consent_withdrawal",
                  deletedAt: new Date(),
                },
              }),
            ];
          case 1:
            // Log data deletion
            _a.sent();
            // Here you would implement actual data deletion logic
            // This is a placeholder for the actual implementation
            console.log(
              "Processing data deletion for user "
                .concat(userId, ", data types: ")
                .concat(dataTypes.join(", ")),
            );
            return [2 /*return*/];
        }
      });
    });
  };
  return LGPDComplianceSystem;
})();
exports.LGPDComplianceSystem = LGPDComplianceSystem;
/**
 * Default LGPD Compliance Configuration
 */
exports.defaultLGPDConfig = {
  enableAutomaticCleanup: true,
  consentExpirationDays: 365,
  auditRetentionDays: 2555, // 7 years
  dataRetentionDays: 1825, // 5 years
  notificationSettings: {
    emailEnabled: true,
    smsEnabled: false,
  },
  complianceThresholds: {
    minimumConsentRate: 80,
    maximumRiskScore: 30,
    auditComplianceRate: 95,
  },
};
/**
 * Create LGPD Compliance System instance
 */
function createLGPDComplianceSystem(clinicId, config) {
  var fullConfig = __assign(__assign({ clinicId: clinicId }, exports.defaultLGPDConfig), config);
  return new LGPDComplianceSystem(fullConfig);
}
/**
 * Export singleton instance for default clinic
 */
exports.lgpdComplianceSystem = createLGPDComplianceSystem("default-clinic");
