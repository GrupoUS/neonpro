"use strict";
/**
 * LGPD Compliance Monitoring System
 * Implements real-time compliance monitoring and violation detection
 *
 * Features:
 * - Real-time compliance monitoring across all system operations
 * - Automated violation detection and alerting
 * - Compliance scoring and reporting
 * - Regulatory requirement tracking
 * - Compliance risk assessment
 * - Continuous improvement recommendations
 * - Compliance dashboard metrics
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
exports.complianceMonitor =
  exports.ComplianceMonitor =
  exports.ComplianceStatus =
  exports.ViolationSeverity =
  exports.LGPDArticle =
  exports.ComplianceCategory =
    void 0;
var events_1 = require("events");
// ============================================================================
// COMPLIANCE MONITORING TYPES & INTERFACES
// ============================================================================
/**
 * LGPD Compliance Categories
 */
var ComplianceCategory;
(function (ComplianceCategory) {
  ComplianceCategory["CONSENT"] = "consent";
  ComplianceCategory["DATA_SUBJECT_RIGHTS"] = "data_subject_rights";
  ComplianceCategory["DATA_SECURITY"] = "data_security";
  ComplianceCategory["DATA_MINIMIZATION"] = "data_minimization";
  ComplianceCategory["PURPOSE_LIMITATION"] = "purpose_limitation";
  ComplianceCategory["STORAGE_LIMITATION"] = "storage_limitation";
  ComplianceCategory["ACCURACY"] = "accuracy";
  ComplianceCategory["TRANSPARENCY"] = "transparency";
  ComplianceCategory["LAWFUL_BASIS"] = "lawful_basis";
  ComplianceCategory["ACCOUNTABILITY"] = "accountability";
  ComplianceCategory["CHILDREN_DATA"] = "children_data";
  ComplianceCategory["SENSITIVE_DATA"] = "sensitive_data";
  ComplianceCategory["INTERNATIONAL_TRANSFERS"] = "international_transfers";
  ComplianceCategory["DATA_BREACH"] = "data_breach";
  ComplianceCategory["RECORDS_OF_PROCESSING"] = "records_of_processing";
})(ComplianceCategory || (exports.ComplianceCategory = ComplianceCategory = {}));
/**
 * LGPD Article References
 */
var LGPDArticle;
(function (LGPDArticle) {
  LGPDArticle["ART_5"] = "art_5";
  LGPDArticle["ART_6"] = "art_6";
  LGPDArticle["ART_7"] = "art_7";
  LGPDArticle["ART_8"] = "art_8";
  LGPDArticle["ART_9"] = "art_9";
  LGPDArticle["ART_10"] = "art_10";
  LGPDArticle["ART_11"] = "art_11";
  LGPDArticle["ART_12"] = "art_12";
  LGPDArticle["ART_14"] = "art_14";
  LGPDArticle["ART_18"] = "art_18";
  LGPDArticle["ART_19"] = "art_19";
  LGPDArticle["ART_20"] = "art_20";
  LGPDArticle["ART_42"] = "art_42";
  LGPDArticle["ART_46"] = "art_46";
  LGPDArticle["ART_48"] = "art_48";
  LGPDArticle["ART_50"] = "art_50"; // Good practices
})(LGPDArticle || (exports.LGPDArticle = LGPDArticle = {}));
/**
 * Violation Severity Levels
 */
var ViolationSeverity;
(function (ViolationSeverity) {
  ViolationSeverity["INFO"] = "info";
  ViolationSeverity["LOW"] = "low";
  ViolationSeverity["MEDIUM"] = "medium";
  ViolationSeverity["HIGH"] = "high";
  ViolationSeverity["CRITICAL"] = "critical";
})(ViolationSeverity || (exports.ViolationSeverity = ViolationSeverity = {}));
/**
 * Compliance Status Types
 */
var ComplianceStatus;
(function (ComplianceStatus) {
  ComplianceStatus["COMPLIANT"] = "compliant";
  ComplianceStatus["PARTIALLY_COMPLIANT"] = "partially_compliant";
  ComplianceStatus["NON_COMPLIANT"] = "non_compliant";
  ComplianceStatus["UNDER_REVIEW"] = "under_review";
  ComplianceStatus["EXEMPTED"] = "exempted";
})(ComplianceStatus || (exports.ComplianceStatus = ComplianceStatus = {}));
// ============================================================================
// COMPLIANCE MONITORING SYSTEM
// ============================================================================
/**
 * LGPD Compliance Monitoring System
 *
 * Provides real-time monitoring of LGPD compliance including:
 * - Automated violation detection and alerting
 * - Compliance scoring and reporting
 * - Regulatory requirement tracking
 * - Continuous improvement recommendations
 */
var ComplianceMonitor = /** @class */ (function (_super) {
  __extends(ComplianceMonitor, _super);
  function ComplianceMonitor(config) {
    if (config === void 0) {
      config = {
        monitoringIntervalMinutes: 15,
        scoreUpdateIntervalHours: 6,
        alertThreshold: 70,
        requirementUpdateIntervalDays: 30,
        auditFrequencyMonths: 3,
        criticalCategories: [
          ComplianceCategory.CONSENT,
          ComplianceCategory.DATA_SUBJECT_RIGHTS,
          ComplianceCategory.DATA_SECURITY,
          ComplianceCategory.SENSITIVE_DATA,
          ComplianceCategory.DATA_BREACH,
        ],
        notificationEnabled: true,
      };
    }
    var _this = _super.call(this) || this;
    _this.config = config;
    _this.requirements = new Map();
    _this.violations = new Map();
    _this.audits = new Map();
    _this.complianceScore = null;
    _this.isInitialized = false;
    _this.monitoringInterval = null;
    _this.scoreUpdateInterval = null;
    _this.setMaxListeners(100);
    return _this;
  }
  /**
   * Initialize the compliance monitoring system
   */
  ComplianceMonitor.prototype.initialize = function () {
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
            _a.trys.push([1, 6, , 7]);
            // Load compliance requirements
            return [4 /*yield*/, this.loadRequirements()];
          case 2:
            // Load compliance requirements
            _a.sent();
            // Load historical violations
            return [4 /*yield*/, this.loadViolations()];
          case 3:
            // Load historical violations
            _a.sent();
            // Load audit history
            return [4 /*yield*/, this.loadAudits()];
          case 4:
            // Load audit history
            _a.sent();
            // Calculate initial compliance score
            return [4 /*yield*/, this.calculateComplianceScore()];
          case 5:
            // Calculate initial compliance score
            _a.sent();
            // Start monitoring intervals
            this.startMonitoringInterval();
            this.startScoreUpdateInterval();
            this.isInitialized = true;
            this.logActivity("system", "compliance_monitor_initialized", {
              timestamp: new Date(),
              requirementsLoaded: this.requirements.size,
              violationsLoaded: this.violations.size,
            });
            return [3 /*break*/, 7];
          case 6:
            error_1 = _a.sent();
            throw new Error("Failed to initialize compliance monitor: ".concat(error_1));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check operation compliance
   */
  ComplianceMonitor.prototype.checkOperationCompliance = function (operation, context) {
    return __awaiter(this, void 0, void 0, function () {
      var violations, rules, _i, rules_1, rule, result, violation, criticalViolations, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            violations = [];
            _a.label = 3;
          case 3:
            _a.trys.push([3, 9, , 10]);
            rules = this.getComplianceRules(context.category);
            (_i = 0), (rules_1 = rules);
            _a.label = 4;
          case 4:
            if (!(_i < rules_1.length)) return [3 /*break*/, 8];
            rule = rules_1[_i];
            return [4 /*yield*/, this.evaluateRule(rule, operation, context)];
          case 5:
            result = _a.sent();
            if (!!result.compliant) return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.createViolation({
                category: context.category,
                article: rule.article,
                severity: this.determineSeverity(context.category, rule),
                description: result.reason || "Compliance violation detected",
                context: {
                  userId: context.userId,
                  operation: operation,
                  data: context.data,
                  location: context.location,
                },
              }),
            ];
          case 6:
            violation = _a.sent();
            violations.push(violation);
            _a.label = 7;
          case 7:
            _i++;
            return [3 /*break*/, 4];
          case 8:
            criticalViolations = violations.filter(function (v) {
              return v.severity === ViolationSeverity.CRITICAL;
            });
            if (criticalViolations.length > 0 && this.config.notificationEnabled) {
              this.emit("compliance:critical_alert", {
                alert: "".concat(
                  criticalViolations.length,
                  " critical compliance violations detected",
                ),
                details: {
                  operation: operation,
                  violations: criticalViolations.map(function (v) {
                    return v.id;
                  }),
                  timestamp: new Date(),
                },
              });
            }
            return [
              2 /*return*/,
              {
                compliant: violations.length === 0,
                violations: violations,
              },
            ];
          case 9:
            error_2 = _a.sent();
            this.logActivity("system", "compliance_check_error", {
              error: String(error_2),
              operation: operation,
              category: context.category,
            });
            return [
              2 /*return*/,
              {
                compliant: false,
                violations: [],
              },
            ];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Record compliance violation
   */
  ComplianceMonitor.prototype.recordViolation = function (
    category,
    article,
    severity,
    description,
    context,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.createViolation({
            category: category,
            article: article,
            severity: severity,
            description: description,
            context: context,
          }),
        ];
      });
    });
  };
  /**
   * Resolve compliance violation
   */
  ComplianceMonitor.prototype.resolveViolation = function (violationId, resolution) {
    return __awaiter(this, void 0, void 0, function () {
      var violation;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            violation = this.violations.get(violationId);
            if (!violation) {
              throw new Error("Violation not found");
            }
            violation.status = "resolved";
            violation.resolution = {
              resolvedAt: new Date(),
              resolvedBy: resolution.resolvedBy,
              resolution: resolution.resolution,
              preventiveMeasures: resolution.preventiveMeasures,
            };
            violation.metadata.resolutionTime =
              violation.resolution.resolvedAt.getTime() - violation.timestamp.getTime();
            return [4 /*yield*/, this.saveViolation(violation)];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.calculateComplianceScore()];
          case 2:
            _a.sent();
            this.logActivity("user", "violation_resolved", {
              violationId: violationId,
              resolvedBy: resolution.resolvedBy,
              resolutionTime: violation.metadata.resolutionTime,
            });
            return [2 /*return*/, violation];
        }
      });
    });
  };
  /**
   * Mark violation as false positive
   */
  ComplianceMonitor.prototype.markAsFalsePositive = function (violationId, reviewer, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var violation;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            violation = this.violations.get(violationId);
            if (!violation) {
              throw new Error("Violation not found");
            }
            violation.status = "false_positive";
            violation.metadata.falsePositiveReason = reason;
            violation.metadata.reviewedBy = reviewer;
            violation.metadata.reviewedAt = new Date();
            return [4 /*yield*/, this.saveViolation(violation)];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.calculateComplianceScore()];
          case 2:
            _a.sent();
            this.logActivity("user", "violation_false_positive", {
              violationId: violationId,
              reviewer: reviewer,
              reason: reason,
            });
            return [2 /*return*/, violation];
        }
      });
    });
  };
  /**
   * Get active violations
   */
  ComplianceMonitor.prototype.getActiveViolations = function () {
    return Array.from(this.violations.values())
      .filter(function (v) {
        return v.status === "detected" || v.status === "investigating";
      })
      .sort(function (a, b) {
        var _a;
        // Sort by severity first, then by timestamp
        var severityOrder =
          ((_a = {}),
          (_a[ViolationSeverity.CRITICAL] = 0),
          (_a[ViolationSeverity.HIGH] = 1),
          (_a[ViolationSeverity.MEDIUM] = 2),
          (_a[ViolationSeverity.LOW] = 3),
          (_a[ViolationSeverity.INFO] = 4),
          _a);
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  };
  /**
   * Get violations by category
   */
  ComplianceMonitor.prototype.getViolationsByCategory = function (category) {
    return Array.from(this.violations.values())
      .filter(function (v) {
        return v.category === category;
      })
      .sort(function (a, b) {
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  };
  /**
   * Get compliance requirements
   */
  ComplianceMonitor.prototype.getComplianceRequirements = function () {
    return Array.from(this.requirements.values());
  };
  /**
   * Get compliance requirement by ID
   */
  ComplianceMonitor.prototype.getRequirement = function (id) {
    return this.requirements.get(id);
  };
  /**
   * Update compliance requirement
   */
  ComplianceMonitor.prototype.updateRequirement = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var requirement;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            requirement = this.requirements.get(id);
            if (!requirement) {
              throw new Error("Requirement not found");
            }
            // Apply updates
            Object.assign(requirement, updates);
            requirement.updatedAt = new Date();
            return [4 /*yield*/, this.saveRequirement(requirement)];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.calculateComplianceScore()];
          case 2:
            _a.sent();
            this.emit("compliance:requirement_updated", { requirement: requirement });
            return [2 /*return*/, requirement];
        }
      });
    });
  };
  /**
   * Get compliance score
   */
  ComplianceMonitor.prototype.getComplianceScore = function () {
    return this.complianceScore;
  };
  /**
   * Create compliance audit
   */
  ComplianceMonitor.prototype.createAudit = function (scope, auditor) {
    return __awaiter(this, void 0, void 0, function () {
      var audit;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            audit = {
              id: this.generateId("audit"),
              startDate: new Date(),
              endDate: new Date(), // Will be updated when completed
              scope: scope,
              auditor: auditor,
              status: "in_progress",
              findings: {
                compliant: [],
                nonCompliant: [],
                recommendations: [],
              },
              overallScore: 0, // Will be calculated when completed
            };
            this.audits.set(audit.id, audit);
            return [4 /*yield*/, this.saveAudit(audit)];
          case 1:
            _a.sent();
            this.logActivity("user", "audit_created", {
              auditId: audit.id,
              auditor: auditor,
              scope: scope,
            });
            return [2 /*return*/, audit];
        }
      });
    });
  };
  /**
   * Complete compliance audit
   */
  ComplianceMonitor.prototype.completeAudit = function (auditId, findings, report) {
    return __awaiter(this, void 0, void 0, function () {
      var audit, totalCategories, compliantCount, nextAuditDate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            audit = this.audits.get(auditId);
            if (!audit) {
              throw new Error("Audit not found");
            }
            if (audit.status !== "in_progress") {
              throw new Error("Audit is not in progress");
            }
            // Update audit
            audit.status = "completed";
            audit.endDate = new Date();
            audit.findings = findings;
            audit.report = report;
            totalCategories = audit.scope.length;
            compliantCount = findings.compliant.length;
            audit.overallScore = (compliantCount / totalCategories) * 100;
            nextAuditDate = new Date();
            nextAuditDate.setMonth(nextAuditDate.getMonth() + this.config.auditFrequencyMonths);
            audit.nextAuditDate = nextAuditDate;
            return [4 /*yield*/, this.saveAudit(audit)];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.calculateComplianceScore()];
          case 2:
            _a.sent();
            this.emit("compliance:audit_completed", { audit: audit });
            return [2 /*return*/, audit];
        }
      });
    });
  };
  /**
   * Get latest audit
   */
  ComplianceMonitor.prototype.getLatestAudit = function () {
    return Array.from(this.audits.values())
      .filter(function (a) {
        return a.status === "completed";
      })
      .sort(function (a, b) {
        return b.endDate.getTime() - a.endDate.getTime();
      })[0];
  };
  /**
   * Get compliance dashboard data
   */
  ComplianceMonitor.prototype.getComplianceDashboard = function () {
    var _a;
    var activeViolations = this.getActiveViolations();
    var requirements = this.getComplianceRequirements();
    var latestAudit = this.getLatestAudit();
    // Count violations by severity and category
    var bySeverity = activeViolations.reduce(function (acc, v) {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {});
    var byCategory = activeViolations.reduce(function (acc, v) {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {});
    // Count requirements by status and risk
    var byStatus = requirements.reduce(function (acc, r) {
      acc[r.implementationStatus] = (acc[r.implementationStatus] || 0) + 1;
      return acc;
    }, {});
    var byRisk = requirements.reduce(function (acc, r) {
      acc[r.riskLevel] = (acc[r.riskLevel] || 0) + 1;
      return acc;
    }, {});
    return {
      score: this.complianceScore,
      activeViolations: {
        total: activeViolations.length,
        bySeverity: bySeverity,
        byCategory: byCategory,
      },
      requirements: {
        total: requirements.length,
        byStatus: byStatus,
        byRisk: byRisk,
      },
      latestAudit: latestAudit
        ? {
            date: latestAudit.endDate,
            score: latestAudit.overallScore,
            nonCompliantCount: latestAudit.findings.nonCompliant.length,
          }
        : undefined,
      trends: {
        violationTrend: this.calculateViolationTrend(),
        scoreTrend:
          ((_a = this.complianceScore) === null || _a === void 0 ? void 0 : _a.trend.weekly) || {},
      },
    };
  };
  /**
   * Calculate compliance score
   */
  ComplianceMonitor.prototype.calculateComplianceScore = function () {
    return __awaiter(this, void 0, void 0, function () {
      var requirements,
        violations,
        activeViolations,
        totalRequirements,
        compliantRequirements,
        partiallyCompliantRequirements,
        weightedScore,
        violationPenalty,
        _i,
        activeViolations_1,
        violation,
        overallScore,
        byCategory,
        _loop_1,
        _a,
        _b,
        category,
        riskAreas;
      var _this = this;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            requirements = Array.from(this.requirements.values());
            violations = Array.from(this.violations.values());
            activeViolations = violations.filter(function (v) {
              return v.status === "detected" || v.status === "investigating";
            });
            totalRequirements = requirements.length;
            compliantRequirements = requirements.filter(function (r) {
              return r.implementationStatus === ComplianceStatus.COMPLIANT;
            }).length;
            partiallyCompliantRequirements = requirements.filter(function (r) {
              return r.implementationStatus === ComplianceStatus.PARTIALLY_COMPLIANT;
            }).length;
            weightedScore =
              (compliantRequirements + partiallyCompliantRequirements * 0.5) / totalRequirements;
            violationPenalty = 0;
            for (
              _i = 0, activeViolations_1 = activeViolations;
              _i < activeViolations_1.length;
              _i++
            ) {
              violation = activeViolations_1[_i];
              switch (violation.severity) {
                case ViolationSeverity.CRITICAL:
                  violationPenalty += 0.2;
                  break;
                case ViolationSeverity.HIGH:
                  violationPenalty += 0.1;
                  break;
                case ViolationSeverity.MEDIUM:
                  violationPenalty += 0.05;
                  break;
                case ViolationSeverity.LOW:
                  violationPenalty += 0.02;
                  break;
                case ViolationSeverity.INFO:
                  violationPenalty += 0.01;
                  break;
              }
            }
            // Cap penalty at 0.5 (50%)
            violationPenalty = Math.min(violationPenalty, 0.5);
            overallScore = Math.max(0, Math.min(100, weightedScore * 100 * (1 - violationPenalty)));
            byCategory = {};
            _loop_1 = function (category) {
              var categoryRequirements = requirements.filter(function (r) {
                return r.category === category;
              });
              if (categoryRequirements.length === 0) {
                byCategory[category] = 100; // Default if no requirements
                return "continue";
              }
              var compliant = categoryRequirements.filter(function (r) {
                return r.implementationStatus === ComplianceStatus.COMPLIANT;
              }).length;
              var partiallyCompliant = categoryRequirements.filter(function (r) {
                return r.implementationStatus === ComplianceStatus.PARTIALLY_COMPLIANT;
              }).length;
              var categoryWeightedScore =
                (compliant + partiallyCompliant * 0.5) / categoryRequirements.length;
              // Adjust for violations in this category
              var categoryViolations = activeViolations.filter(function (v) {
                return v.category === category;
              });
              var categoryPenalty = 0;
              for (
                var _d = 0, categoryViolations_1 = categoryViolations;
                _d < categoryViolations_1.length;
                _d++
              ) {
                var violation = categoryViolations_1[_d];
                switch (violation.severity) {
                  case ViolationSeverity.CRITICAL:
                    categoryPenalty += 0.25;
                    break;
                  case ViolationSeverity.HIGH:
                    categoryPenalty += 0.15;
                    break;
                  case ViolationSeverity.MEDIUM:
                    categoryPenalty += 0.1;
                    break;
                  case ViolationSeverity.LOW:
                    categoryPenalty += 0.05;
                    break;
                  case ViolationSeverity.INFO:
                    categoryPenalty += 0.02;
                    break;
                }
              }
              // Cap category penalty at 0.75 (75%)
              categoryPenalty = Math.min(categoryPenalty, 0.75);
              byCategory[category] = Math.max(
                0,
                Math.min(100, categoryWeightedScore * 100 * (1 - categoryPenalty)),
              );
            };
            for (_a = 0, _b = Object.values(ComplianceCategory); _a < _b.length; _a++) {
              category = _b[_a];
              _loop_1(category);
            }
            riskAreas = Object.entries(byCategory)
              .filter(function (_a) {
                var _ = _a[0],
                  score = _a[1];
                return score < 80;
              })
              .map(function (_a) {
                var category = _a[0],
                  score = _a[1];
                return {
                  category: category,
                  score: score,
                  trend: _this.calculateCategoryTrend(category),
                  recommendations: _this.generateRecommendations(category),
                };
              })
              .sort(function (a, b) {
                return a.score - b.score;
              });
            // Create score object
            this.complianceScore = {
              overall: Math.round(overallScore),
              byCategory: byCategory,
              trend: {
                daily: this.calculateScoreTrend("daily"),
                weekly: this.calculateScoreTrend("weekly"),
                monthly: this.calculateScoreTrend("monthly"),
              },
              riskAreas: riskAreas,
              lastUpdated: new Date(),
            };
            // Save score history
            return [4 /*yield*/, this.saveScoreHistory(this.complianceScore)];
          case 1:
            // Save score history
            _c.sent();
            // Emit score updated event
            this.emit("compliance:score_updated", { score: this.complianceScore });
            // Check if score is below alert threshold
            if (overallScore < this.config.alertThreshold && this.config.notificationEnabled) {
              this.emit("compliance:critical_alert", {
                alert: "Compliance score ("
                  .concat(Math.round(overallScore), ") is below threshold (")
                  .concat(this.config.alertThreshold, ")"),
                details: {
                  score: Math.round(overallScore),
                  threshold: this.config.alertThreshold,
                  riskAreas: riskAreas.map(function (r) {
                    return r.category;
                  }),
                  timestamp: new Date(),
                },
              });
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create compliance violation
   */
  ComplianceMonitor.prototype.createViolation = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var violation;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            violation = {
              id: this.generateId("violation"),
              timestamp: new Date(),
              category: data.category,
              article: data.article,
              severity: data.severity,
              description: data.description,
              context: data.context,
              status: "detected",
              metadata: {
                detectionSource: "automated_monitoring",
                relatedRequirements: this.findRelatedRequirements(data.category, data.article).map(
                  function (r) {
                    return r.id;
                  },
                ),
              },
            };
            this.violations.set(violation.id, violation);
            return [4 /*yield*/, this.saveViolation(violation)];
          case 1:
            _a.sent();
            this.emit("compliance:violation", { violation: violation });
            return [2 /*return*/, violation];
        }
      });
    });
  };
  /**
   * Start monitoring interval
   */
  ComplianceMonitor.prototype.startMonitoringInterval = function () {
    var _this = this;
    this.monitoringInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.performSystemCheck()];
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
   * Start score update interval
   */
  ComplianceMonitor.prototype.startScoreUpdateInterval = function () {
    var _this = this;
    this.scoreUpdateInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.calculateComplianceScore()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        });
      },
      this.config.scoreUpdateIntervalHours * 60 * 60 * 1000,
    );
  };
  /**
   * Perform system compliance check
   */
  ComplianceMonitor.prototype.performSystemCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var outdatedRequirements, longStandingViolations, latestAudit, daysUntilAudit;
      var _this = this;
      return __generator(this, function (_a) {
        try {
          outdatedRequirements = Array.from(this.requirements.values()).filter(function (r) {
            if (!r.lastVerified) return true;
            var lastVerified = new Date(r.lastVerified);
            var updateThreshold = new Date();
            updateThreshold.setDate(
              updateThreshold.getDate() - _this.config.requirementUpdateIntervalDays,
            );
            return lastVerified < updateThreshold;
          });
          if (outdatedRequirements.length > 0) {
            this.logActivity("system", "outdated_requirements_detected", {
              count: outdatedRequirements.length,
              requirements: outdatedRequirements.map(function (r) {
                return r.id;
              }),
            });
          }
          longStandingViolations = Array.from(this.violations.values()).filter(function (v) {
            if (v.status !== "detected" && v.status !== "investigating") return false;
            var violationAge = Date.now() - v.timestamp.getTime();
            var ageInDays = violationAge / (1000 * 60 * 60 * 24);
            return (
              (v.severity === ViolationSeverity.CRITICAL && ageInDays > 1) ||
              (v.severity === ViolationSeverity.HIGH && ageInDays > 3) ||
              (v.severity === ViolationSeverity.MEDIUM && ageInDays > 7) ||
              (v.severity === ViolationSeverity.LOW && ageInDays > 14)
            );
          });
          if (longStandingViolations.length > 0 && this.config.notificationEnabled) {
            this.emit("compliance:critical_alert", {
              alert: "".concat(
                longStandingViolations.length,
                " long-standing compliance violations require attention",
              ),
              details: {
                violations: longStandingViolations.map(function (v) {
                  return {
                    id: v.id,
                    category: v.category,
                    severity: v.severity,
                    age: Math.floor((Date.now() - v.timestamp.getTime()) / (1000 * 60 * 60 * 24)),
                  };
                }),
                timestamp: new Date(),
              },
            });
          }
          latestAudit = this.getLatestAudit();
          if (latestAudit === null || latestAudit === void 0 ? void 0 : latestAudit.nextAuditDate) {
            daysUntilAudit = Math.floor(
              (latestAudit.nextAuditDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            );
            if (daysUntilAudit <= 30 && daysUntilAudit > 0 && this.config.notificationEnabled) {
              this.logActivity("system", "upcoming_audit_reminder", {
                daysUntilAudit: daysUntilAudit,
                scheduledDate: latestAudit.nextAuditDate,
                previousAuditId: latestAudit.id,
              });
            }
          }
        } catch (error) {
          this.logActivity("system", "system_check_error", {
            error: String(error),
            timestamp: new Date(),
          });
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get compliance rules for category
   */
  ComplianceMonitor.prototype.getComplianceRules = function (category) {
    var _this = this;
    // In a real implementation, this would return actual rules
    // For now, we'll return placeholder rules
    return [
      {
        id: "rule_1",
        category: category,
        article: this.getCategoryArticle(category),
        check: function () {
          return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              return [2 /*return*/, { compliant: true }];
            });
          });
        },
      },
    ];
  };
  /**
   * Evaluate compliance rule
   */
  ComplianceMonitor.prototype.evaluateRule = function (rule, operation, context) {
    return __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, rule.check(operation, context)];
          case 1:
            // In a real implementation, this would evaluate the rule
            // For now, we'll return a placeholder result
            return [2 /*return*/, _a.sent()];
          case 2:
            error_3 = _a.sent();
            return [
              2 /*return*/,
              {
                compliant: false,
                reason: "Rule evaluation error: ".concat(error_3),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Determine violation severity
   */
  ComplianceMonitor.prototype.determineSeverity = function (category, rule) {
    // Critical categories always get high or critical severity
    if (this.config.criticalCategories.includes(category)) {
      return ViolationSeverity.HIGH;
    }
    // Default to medium
    return ViolationSeverity.MEDIUM;
  };
  /**
   * Find related requirements
   */
  ComplianceMonitor.prototype.findRelatedRequirements = function (category, article) {
    return Array.from(this.requirements.values()).filter(function (r) {
      return r.category === category && r.article === article;
    });
  };
  /**
   * Get category article
   */
  ComplianceMonitor.prototype.getCategoryArticle = function (category) {
    var _a;
    var articleMap =
      ((_a = {}),
      (_a[ComplianceCategory.CONSENT] = LGPDArticle.ART_7),
      (_a[ComplianceCategory.DATA_SUBJECT_RIGHTS] = LGPDArticle.ART_18),
      (_a[ComplianceCategory.DATA_SECURITY] = LGPDArticle.ART_46),
      (_a[ComplianceCategory.DATA_MINIMIZATION] = LGPDArticle.ART_6),
      (_a[ComplianceCategory.PURPOSE_LIMITATION] = LGPDArticle.ART_6),
      (_a[ComplianceCategory.STORAGE_LIMITATION] = LGPDArticle.ART_10),
      (_a[ComplianceCategory.ACCURACY] = LGPDArticle.ART_10),
      (_a[ComplianceCategory.TRANSPARENCY] = LGPDArticle.ART_9),
      (_a[ComplianceCategory.LAWFUL_BASIS] = LGPDArticle.ART_7),
      (_a[ComplianceCategory.ACCOUNTABILITY] = LGPDArticle.ART_50),
      (_a[ComplianceCategory.CHILDREN_DATA] = LGPDArticle.ART_8),
      (_a[ComplianceCategory.SENSITIVE_DATA] = LGPDArticle.ART_11),
      (_a[ComplianceCategory.INTERNATIONAL_TRANSFERS] = LGPDArticle.ART_5),
      (_a[ComplianceCategory.DATA_BREACH] = LGPDArticle.ART_48),
      (_a[ComplianceCategory.RECORDS_OF_PROCESSING] = LGPDArticle.ART_50),
      _a);
    return articleMap[category] || LGPDArticle.ART_6;
  };
  /**
   * Calculate score trend
   */
  ComplianceMonitor.prototype.calculateScoreTrend = function (period) {
    // In a real implementation, this would calculate from historical data
    // For now, we'll return placeholder data
    var result = {};
    var now = new Date();
    var days = 7;
    if (period === "weekly") days = 8;
    if (period === "monthly") days = 30;
    for (var i = 0; i < days; i++) {
      var date = new Date(now);
      date.setDate(date.getDate() - i);
      var dateStr = date.toISOString().split("T")[0];
      // Generate a random score between 70 and 95
      result[dateStr] = Math.floor(Math.random() * 25) + 70;
    }
    return result;
  };
  /**
   * Calculate category trend
   */
  ComplianceMonitor.prototype.calculateCategoryTrend = function (category) {
    // In a real implementation, this would calculate from historical data
    // For now, we'll return a random trend
    var trends = ["improving", "stable", "declining"];
    return trends[Math.floor(Math.random() * trends.length)];
  };
  /**
   * Calculate violation trend
   */
  ComplianceMonitor.prototype.calculateViolationTrend = function () {
    // In a real implementation, this would calculate from historical data
    // For now, we'll return placeholder data
    var result = {};
    var now = new Date();
    for (var i = 0; i < 7; i++) {
      var date = new Date(now);
      date.setDate(date.getDate() - i);
      var dateStr = date.toISOString().split("T")[0];
      // Generate a random count between 0 and 5
      result[dateStr] = Math.floor(Math.random() * 6);
    }
    return result;
  };
  /**
   * Generate recommendations
   */
  ComplianceMonitor.prototype.generateRecommendations = function (category) {
    var _a;
    // In a real implementation, this would generate specific recommendations
    // For now, we'll return placeholder recommendations
    var recommendations =
      ((_a = {}),
      (_a[ComplianceCategory.CONSENT] = [
        "Implement granular consent options",
        "Add consent versioning",
        "Improve consent withdrawal process",
      ]),
      (_a[ComplianceCategory.DATA_SUBJECT_RIGHTS] = [
        "Streamline rights request process",
        "Improve response time for rights requests",
        "Enhance data portability exports",
      ]),
      (_a[ComplianceCategory.DATA_SECURITY] = [
        "Implement additional encryption",
        "Enhance access controls",
        "Conduct security assessment",
      ]),
      (_a[ComplianceCategory.DATA_MINIMIZATION] = [
        "Review data collection practices",
        "Implement data minimization strategy",
        "Reduce unnecessary data fields",
      ]),
      (_a[ComplianceCategory.SENSITIVE_DATA] = [
        "Review sensitive data handling",
        "Enhance protection for sensitive data",
        "Implement additional safeguards",
      ]),
      _a);
    return (
      recommendations[category] || [
        "Review compliance requirements",
        "Implement additional controls",
        "Conduct compliance assessment",
      ]
    );
  };
  /**
   * Load compliance requirements
   */
  ComplianceMonitor.prototype.loadRequirements = function () {
    return __awaiter(this, void 0, void 0, function () {
      var sampleRequirements, _i, sampleRequirements_1, requirement;
      return __generator(this, function (_a) {
        sampleRequirements = [
          {
            id: "req_consent_1",
            category: ComplianceCategory.CONSENT,
            article: LGPDArticle.ART_7,
            description: {
              pt: "Obter consentimento específico, informado e inequívoco",
              en: "Obtain specific, informed, and unambiguous consent",
            },
            implementationStatus: ComplianceStatus.COMPLIANT,
            verificationMethod: "Consent records audit",
            lastVerified: new Date(),
            riskLevel: "high",
            responsibleParty: "Data Protection Officer",
            evidenceRequired: true,
            evidence: ["Consent management system", "Consent records"],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "req_rights_1",
            category: ComplianceCategory.DATA_SUBJECT_RIGHTS,
            article: LGPDArticle.ART_18,
            description: {
              pt: "Implementar processo para atender solicitações de direitos dos titulares",
              en: "Implement process to handle data subject rights requests",
            },
            implementationStatus: ComplianceStatus.PARTIALLY_COMPLIANT,
            verificationMethod: "Rights request process audit",
            lastVerified: new Date(),
            riskLevel: "medium",
            responsibleParty: "Data Protection Officer",
            evidenceRequired: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "req_security_1",
            category: ComplianceCategory.DATA_SECURITY,
            article: LGPDArticle.ART_46,
            description: {
              pt: "Implementar medidas técnicas e organizacionais de segurança",
              en: "Implement technical and organizational security measures",
            },
            implementationStatus: ComplianceStatus.COMPLIANT,
            verificationMethod: "Security assessment",
            lastVerified: new Date(),
            riskLevel: "high",
            responsibleParty: "Security Officer",
            evidenceRequired: true,
            evidence: ["Security policy", "Security assessment report"],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        for (
          _i = 0, sampleRequirements_1 = sampleRequirements;
          _i < sampleRequirements_1.length;
          _i++
        ) {
          requirement = sampleRequirements_1[_i];
          this.requirements.set(requirement.id, requirement);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load violations
   */
  ComplianceMonitor.prototype.loadViolations = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load audits
   */
  ComplianceMonitor.prototype.loadAudits = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save violation
   */
  ComplianceMonitor.prototype.saveViolation = function (violation) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        // For now, we'll just keep in memory
        this.violations.set(violation.id, violation);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save requirement
   */
  ComplianceMonitor.prototype.saveRequirement = function (requirement) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        // For now, we'll just keep in memory
        this.requirements.set(requirement.id, requirement);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save audit
   */
  ComplianceMonitor.prototype.saveAudit = function (audit) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        // For now, we'll just keep in memory
        this.audits.set(audit.id, audit);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save score history
   */
  ComplianceMonitor.prototype.saveScoreHistory = function (score) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Log activity
   */
  ComplianceMonitor.prototype.logActivity = function (actor, action, details) {
    // In a real implementation, this would log to audit trail
    // For now, we'll just log to console
    console.log("[Compliance] ".concat(actor, " - ").concat(action, ":"), details);
  };
  /**
   * Generate ID
   */
  ComplianceMonitor.prototype.generateId = function (prefix) {
    return ""
      .concat(prefix, "_")
      .concat(Date.now(), "_")
      .concat(Math.random().toString(36).substr(2, 9));
  };
  /**
   * Shutdown the compliance monitor
   */
  ComplianceMonitor.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.monitoringInterval) {
          clearInterval(this.monitoringInterval);
          this.monitoringInterval = null;
        }
        if (this.scoreUpdateInterval) {
          clearInterval(this.scoreUpdateInterval);
          this.scoreUpdateInterval = null;
        }
        this.removeAllListeners();
        this.isInitialized = false;
        this.logActivity("system", "compliance_monitor_shutdown", {
          timestamp: new Date(),
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Health check
   */
  ComplianceMonitor.prototype.getHealthStatus = function () {
    var _a, _b;
    var issues = [];
    if (!this.isInitialized) {
      issues.push("Compliance monitor not initialized");
    }
    if (!this.monitoringInterval) {
      issues.push("Monitoring interval not running");
    }
    if (!this.scoreUpdateInterval) {
      issues.push("Score update interval not running");
    }
    if (!this.complianceScore) {
      issues.push("Compliance score not calculated");
    }
    var criticalViolations = Array.from(this.violations.values()).filter(function (v) {
      return (
        v.severity === ViolationSeverity.CRITICAL &&
        (v.status === "detected" || v.status === "investigating")
      );
    }).length;
    if (criticalViolations > 0) {
      issues.push("".concat(criticalViolations, " critical violations active"));
    }
    var status = issues.length === 0 ? "healthy" : issues.length <= 2 ? "degraded" : "unhealthy";
    return {
      status: status,
      details: {
        initialized: this.isInitialized,
        requirementsCount: this.requirements.size,
        violationsCount: this.violations.size,
        activeViolations: this.getActiveViolations().length,
        complianceScore:
          (_a = this.complianceScore) === null || _a === void 0 ? void 0 : _a.overall,
        lastUpdated:
          (_b = this.complianceScore) === null || _b === void 0 ? void 0 : _b.lastUpdated,
        issues: issues,
      },
    };
  };
  return ComplianceMonitor;
})(events_1.EventEmitter);
exports.ComplianceMonitor = ComplianceMonitor;
/**
 * Default compliance monitor instance
 */
exports.complianceMonitor = new ComplianceMonitor();
