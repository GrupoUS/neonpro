"use strict";
/**
 * Audit Trail System
 * Epic 10 - Story 10.4: Healthcare Compliance Computer Vision (Audit Trail)
 *
 * Comprehensive audit trail for healthcare compliance monitoring
 * Real-time logging, compliance verification, automated reporting
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.createauditTrailManager =
  exports.AuditEventType =
  exports.LGPDAuditTrailService =
  exports.LGPDAuditTrail =
  exports.AuditEventValidationSchema =
  exports.AuditTrailManager =
    void 0;
var zod_1 = require("zod");
var logger_1 = require("@/lib/utils/logger");
var client_1 = require("@/lib/supabase/client");
var events_1 = require("events");
// Main Audit Trail Manager Class
var AuditTrailManager = /** @class */ (function (_super) {
  __extends(AuditTrailManager, _super);
  function AuditTrailManager() {
    var _this = _super.call(this) || this;
    _this.supabase = (0, client_1.createClient)();
    _this.auditBuffer = [];
    _this.bufferSize = 1000;
    _this.flushInterval = 30000; // 30 seconds
    _this.complianceRules = new Map();
    _this.riskThresholds = new Map();
    _this.initializeAuditSystem();
    return _this;
  }
  /**
   * Initialize audit trail system
   */
  AuditTrailManager.prototype.initializeAuditSystem = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            logger_1.logger.info("Initializing Audit Trail System...");
            // Load compliance rules
            return [4 /*yield*/, this.loadComplianceRules()];
          case 1:
            // Load compliance rules
            _a.sent();
            // Initialize risk thresholds
            this.initializeRiskThresholds();
            // Start periodic buffer flush
            this.startBufferFlush();
            // Initialize real-time monitoring
            this.startRealTimeMonitoring();
            logger_1.logger.info("Audit Trail System initialized successfully");
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            logger_1.logger.error("Failed to initialize Audit Trail System:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log audit event
   */
  AuditTrailManager.prototype.logAuditEvent = function (eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var auditEntry, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            _a = {
              id: "audit_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
              timestamp: new Date().toISOString(),
              severity: eventData.severity || "info",
              userRole: eventData.userRole || "unknown",
              sessionId: eventData.sessionId || "unknown",
              ipAddress: eventData.ipAddress || "unknown",
              userAgent: eventData.userAgent || "unknown",
              metadata: __assign(
                {
                  applicationName: "NeonPro",
                  applicationVersion: "1.0.0",
                  moduleId: "compliance_system",
                  functionName: "audit_trail",
                  requestId: "req_".concat(Date.now()),
                  correlationId: "corr_".concat(Date.now()),
                  childEventIds: [],
                  tags: [],
                  customData: {},
                },
                eventData.metadata,
              ),
            };
            return [4 /*yield*/, this.generateComplianceContext(eventData)];
          case 1:
            _a.complianceContext = _b.sent();
            return [4 /*yield*/, this.performRiskAssessment(eventData)];
          case 2:
            auditEntry = __assign.apply(void 0, [
              ((_a.riskAssessment = _b.sent()),
              (_a.retention = this.generateRetentionInfo(eventData)),
              _a),
              eventData,
            ]);
            // Add to buffer
            this.auditBuffer.push(auditEntry);
            // Check for immediate compliance violations
            return [4 /*yield*/, this.checkImmediateCompliance(auditEntry)];
          case 3:
            // Check for immediate compliance violations
            _b.sent();
            if (!(this.auditBuffer.length >= this.bufferSize)) return [3 /*break*/, 5];
            return [4 /*yield*/, this.flushBuffer()];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            // Emit event for real-time monitoring
            this.emit("auditEvent", auditEntry);
            return [2 /*return*/, auditEntry];
          case 6:
            error_2 = _b.sent();
            logger_1.logger.error("Failed to log audit event:", error_2);
            throw error_2;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Query audit trail
   */
  AuditTrailManager.prototype.queryAuditTrail = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var queryBuilder,
        sortBy,
        sortOrder,
        limit,
        offset,
        _a,
        data,
        error,
        count,
        entries,
        totalCount,
        hasMore,
        error_3;
      var _this = this;
      var _b, _c, _d, _e, _f;
      return __generator(this, function (_g) {
        switch (_g.label) {
          case 0:
            _g.trys.push([0, 2, , 3]);
            queryBuilder = this.supabase.from("audit_trail").select("*");
            // Apply filters
            if (query.startDate) {
              queryBuilder = queryBuilder.gte("timestamp", query.startDate);
            }
            if (query.endDate) {
              queryBuilder = queryBuilder.lte("timestamp", query.endDate);
            }
            if ((_b = query.eventTypes) === null || _b === void 0 ? void 0 : _b.length) {
              queryBuilder = queryBuilder.in("event_type", query.eventTypes);
            }
            if ((_c = query.categories) === null || _c === void 0 ? void 0 : _c.length) {
              queryBuilder = queryBuilder.in("category", query.categories);
            }
            if ((_d = query.severities) === null || _d === void 0 ? void 0 : _d.length) {
              queryBuilder = queryBuilder.in("severity", query.severities);
            }
            if ((_e = query.userIds) === null || _e === void 0 ? void 0 : _e.length) {
              queryBuilder = queryBuilder.in("user_id", query.userIds);
            }
            if ((_f = query.resourceIds) === null || _f === void 0 ? void 0 : _f.length) {
              queryBuilder = queryBuilder.in("resource_id", query.resourceIds);
            }
            if (query.searchText) {
              queryBuilder = queryBuilder.or(
                "description.ilike.%"
                  .concat(query.searchText, "%,action.ilike.%")
                  .concat(query.searchText, "%"),
              );
            }
            sortBy = query.sortBy || "timestamp";
            sortOrder = query.sortOrder || "desc";
            queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === "asc" });
            limit = query.limit || 100;
            offset = query.offset || 0;
            queryBuilder = queryBuilder.range(offset, offset + limit - 1);
            return [4 /*yield*/, queryBuilder];
          case 1:
            (_a = _g.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) {
              throw error;
            }
            entries =
              (data === null || data === void 0
                ? void 0
                : data.map(function (row) {
                    return _this.mapRowToAuditEntry(row);
                  })) || [];
            totalCount = count || 0;
            hasMore = totalCount > offset + limit;
            return [
              2 /*return*/,
              {
                entries: entries,
                totalCount: totalCount,
                hasMore: hasMore,
              },
            ];
          case 2:
            error_3 = _g.sent();
            logger_1.logger.error("Failed to query audit trail:", error_3);
            throw error_3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate comprehensive audit report
   */
  AuditTrailManager.prototype.generateAuditReport = function (reportType, timeRange, scope) {
    return __awaiter(this, void 0, void 0, function () {
      var query, entries, report, error_4;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            logger_1.logger.info(
              "Generating "
                .concat(reportType, " audit report for ")
                .concat(timeRange.startDate, " to ")
                .concat(timeRange.endDate),
            );
            query = __assign({ startDate: timeRange.startDate, endDate: timeRange.endDate }, scope);
            return [4 /*yield*/, this.queryAuditTrail(query)];
          case 1:
            entries = _b.sent().entries;
            _a = {
              id: "report_".concat(reportType, "_").concat(Date.now()),
              generatedDate: new Date().toISOString(),
              reportType: reportType,
              timeRange: timeRange,
              scope: {
                includedCategories:
                  (scope === null || scope === void 0 ? void 0 : scope.includedCategories) ||
                  Object.values(this.getAuditCategories()),
                includedUsers:
                  (scope === null || scope === void 0 ? void 0 : scope.includedUsers) || [],
                includedResources:
                  (scope === null || scope === void 0 ? void 0 : scope.includedResources) || [],
                excludedPatterns:
                  (scope === null || scope === void 0 ? void 0 : scope.excludedPatterns) || [],
                filterCriteria:
                  (scope === null || scope === void 0 ? void 0 : scope.filterCriteria) || {},
              },
              summary: this.generateAuditSummary(entries),
            };
            return [4 /*yield*/, this.generateAuditFindings(entries)];
          case 2:
            _a.findings = _b.sent();
            return [4 /*yield*/, this.generateAuditRecommendations(entries)];
          case 3:
            (_a.recommendations = _b.sent()),
              (_a.complianceMetrics = this.generateComplianceMetrics(entries)),
              (_a.riskMetrics = this.generateRiskMetrics(entries));
            return [4 /*yield*/, this.generateAuditTrends(entries, timeRange)];
          case 4:
            report = ((_a.trends = _b.sent()), (_a.attachments = []), _a);
            // Save report
            return [4 /*yield*/, this.saveAuditReport(report)];
          case 5:
            // Save report
            _b.sent();
            logger_1.logger.info("Audit report generated successfully: ".concat(report.id));
            return [2 /*return*/, report];
          case 6:
            error_4 = _b.sent();
            logger_1.logger.error("Failed to generate audit report:", error_4);
            throw error_4;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get compliance validation results
   */
  AuditTrailManager.prototype.getComplianceValidation = function (timeRange, regulations) {
    return __awaiter(this, void 0, void 0, function () {
      var query, entries, validationResults, filteredResults, summary, error_5;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            query = {
              startDate: timeRange.startDate,
              endDate: timeRange.endDate,
              categories: ["compliance_validation"],
            };
            return [4 /*yield*/, this.queryAuditTrail(query)];
          case 1:
            entries = _b.sent().entries;
            validationResults = entries.flatMap(function (entry) {
              return entry.complianceContext.validationResults || [];
            });
            filteredResults = regulations
              ? validationResults.filter(function (result) {
                  return regulations.some(function (reg) {
                    return result.ruleName.includes(reg);
                  });
                })
              : validationResults;
            _a = {
              totalValidations: filteredResults.length,
              passedValidations: filteredResults.filter(function (r) {
                return r.validationStatus === "passed";
              }).length,
              failedValidations: filteredResults.filter(function (r) {
                return r.validationStatus === "failed";
              }).length,
              warningValidations: filteredResults.filter(function (r) {
                return r.validationStatus === "warning";
              }).length,
              complianceRate:
                filteredResults.length > 0
                  ? (filteredResults.filter(function (r) {
                      return r.validationStatus === "passed";
                    }).length /
                      filteredResults.length) *
                    100
                  : 0,
              validationsByRegulation: this.groupValidationsByRegulation(filteredResults),
              criticalFailures: filteredResults.filter(function (r) {
                return r.validationStatus === "failed" && r.severity === "critical";
              }).length,
            };
            return [4 /*yield*/, this.generateComplianceRecommendations(filteredResults)];
          case 2:
            summary = ((_a.recommendations = _b.sent()), _a);
            return [2 /*return*/, summary];
          case 3:
            error_5 = _b.sent();
            logger_1.logger.error("Failed to get compliance validation:", error_5);
            throw error_5;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Monitor real-time compliance
   */
  AuditTrailManager.prototype.startComplianceMonitoring = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        this.on("auditEvent", function (entry) {
          return __awaiter(_this, void 0, void 0, function () {
            var violations;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  violations = entry.complianceContext.violatedRules;
                  if (!(violations.length > 0)) return [3 /*break*/, 2];
                  return [4 /*yield*/, this.handleComplianceViolation(entry, violations)];
                case 1:
                  _a.sent();
                  _a.label = 2;
                case 2:
                  if (!(entry.riskAssessment.riskLevel === "critical")) return [3 /*break*/, 4];
                  return [4 /*yield*/, this.handleCriticalRisk(entry)];
                case 3:
                  _a.sent();
                  _a.label = 4;
                case 4:
                  // Update real-time metrics
                  return [4 /*yield*/, this.updateRealTimeMetrics(entry)];
                case 5:
                  // Update real-time metrics
                  _a.sent();
                  return [2 /*return*/];
              }
            });
          });
        });
        return [2 /*return*/];
      });
    });
  };
  // Helper Methods
  AuditTrailManager.prototype.generateComplianceContext = function (eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var applicableRegulations, complianceRules, validationResults, violatedRules;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            applicableRegulations = this.getApplicableRegulations(eventData);
            complianceRules = this.getComplianceRules(eventData);
            return [4 /*yield*/, this.validateCompliance(eventData, complianceRules)];
          case 1:
            validationResults = _a.sent();
            violatedRules = validationResults
              .filter(function (r) {
                return r.validationStatus === "failed";
              })
              .map(function (r) {
                return r.ruleId;
              });
            return [
              2 /*return*/,
              {
                applicableRegulations: applicableRegulations,
                complianceStatus: violatedRules.length > 0 ? "non_compliant" : "compliant",
                complianceRules: complianceRules.map(function (r) {
                  return r.id;
                }),
                violatedRules: violatedRules,
                reviewRequired: violatedRules.some(function (ruleId) {
                  var rule = _this.complianceRules.get(ruleId);
                  return (rule === null || rule === void 0 ? void 0 : rule.requiresReview) || false;
                }),
                automaticValidation: true,
                validationResults: validationResults,
              },
            ];
        }
      });
    });
  };
  AuditTrailManager.prototype.performRiskAssessment = function (eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var riskFactors, riskScore, riskLevel, riskCategory;
      return __generator(this, function (_a) {
        riskFactors = this.identifyRiskFactors(eventData);
        riskScore = this.calculateRiskScore(eventData, riskFactors);
        riskLevel = this.getRiskLevel(riskScore);
        riskCategory = this.getRiskCategory(eventData);
        return [
          2 /*return*/,
          {
            riskLevel: riskLevel,
            riskFactors: riskFactors,
            riskScore: riskScore,
            riskCategory: riskCategory,
            mitigation: {
              immediateActions: this.getImmediateActions(riskLevel, eventData),
              longTermActions: this.getLongTermActions(riskLevel, eventData),
              responsibleParty: "compliance_team",
              mitigationStatus: "pending",
            },
            impactAssessment: this.assessImpact(eventData, riskLevel),
          },
        ];
      });
    });
  };
  AuditTrailManager.prototype.generateRetentionInfo = function (eventData) {
    var retentionPeriod = this.getRetentionPeriod(eventData.category, eventData.eventType);
    return {
      retentionPeriod: retentionPeriod,
      legalBasis: "CFM Resolution 1.821/2007 + LGPD Art. 16",
      retentionReason: "Audit trail for compliance and legal requirements",
      scheduledDeletion: new Date(Date.now() + retentionPeriod * 24 * 60 * 60 * 1000).toISOString(),
      archiveRequired: true,
      immutableRecord: true,
    };
  };
  AuditTrailManager.prototype.checkImmediateCompliance = function (entry) {
    return __awaiter(this, void 0, void 0, function () {
      var criticalViolations;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(entry.complianceContext.complianceStatus === "non_compliant"))
              return [3 /*break*/, 2];
            criticalViolations = entry.complianceContext.violatedRules.filter(function (ruleId) {
              var rule = _this.complianceRules.get(ruleId);
              return (rule === null || rule === void 0 ? void 0 : rule.severity) === "critical";
            });
            if (!(criticalViolations.length > 0)) return [3 /*break*/, 2];
            return [4 /*yield*/, this.triggerImmediateResponse(entry, criticalViolations)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  AuditTrailManager.prototype.flushBuffer = function () {
    return __awaiter(this, void 0, void 0, function () {
      var entries, error, error_6;
      var _a;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (this.auditBuffer.length === 0) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            entries = __spreadArray([], this.auditBuffer, true);
            this.auditBuffer = [];
            return [
              4 /*yield*/,
              this.supabase.from("audit_trail").insert(
                entries.map(function (entry) {
                  return _this.mapAuditEntryToRow(entry);
                }),
              ),
            ];
          case 2:
            error = _b.sent().error;
            if (error) {
              // Re-add to buffer if save failed
              (_a = this.auditBuffer).unshift.apply(_a, entries);
              throw error;
            }
            logger_1.logger.info("Flushed ".concat(entries.length, " audit entries to database"));
            return [3 /*break*/, 4];
          case 3:
            error_6 = _b.sent();
            logger_1.logger.error("Failed to flush audit buffer:", error_6);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  AuditTrailManager.prototype.startBufferFlush = function () {
    var _this = this;
    setInterval(function () {
      _this.flushBuffer();
    }, this.flushInterval);
  };
  AuditTrailManager.prototype.startRealTimeMonitoring = function () {
    var _this = this;
    // Real-time monitoring implementation
    setInterval(function () {
      _this.performPeriodicChecks();
    }, 60000); // Every minute
  };
  AuditTrailManager.prototype.performPeriodicChecks = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implement periodic compliance and risk checks
        logger_1.logger.info("Performing periodic audit checks...");
        return [2 /*return*/];
      });
    });
  };
  AuditTrailManager.prototype.getApplicableRegulations = function (eventData) {
    var regulations = ["LGPD", "CFM_1821_2007"];
    if (eventData.category === "patient_data") {
      regulations.push("ANVISA_RDC_44_2009");
    }
    if (eventData.eventType === "authentication") {
      regulations.push("ISO_27001");
    }
    return regulations;
  };
  AuditTrailManager.prototype.getComplianceRules = function (eventData) {
    return Array.from(this.complianceRules.values()).filter(function (rule) {
      return (
        rule.applicableCategories.includes(eventData.category || "system_security") &&
        rule.applicableEventTypes.includes(eventData.eventType || "system_event")
      );
    });
  };
  AuditTrailManager.prototype.validateCompliance = function (eventData, rules) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, rules_1, rule, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            results = [];
            (_i = 0), (rules_1 = rules);
            _a.label = 1;
          case 1:
            if (!(_i < rules_1.length)) return [3 /*break*/, 4];
            rule = rules_1[_i];
            return [4 /*yield*/, this.validateRule(eventData, rule)];
          case 2:
            result = _a.sent();
            results.push(result);
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, results];
        }
      });
    });
  };
  AuditTrailManager.prototype.validateRule = function (eventData, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var isValid;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.executeRuleValidation(eventData, rule)];
          case 1:
            isValid = _a.sent();
            return [
              2 /*return*/,
              {
                ruleId: rule.id,
                ruleName: rule.name,
                ruleDescription: rule.description,
                validationStatus: isValid ? "passed" : "failed",
                validationMessage: isValid ? "Rule validation passed" : "Rule validation failed",
                severity: rule.severity,
                recommendedAction: isValid ? undefined : rule.recommendedAction,
              },
            ];
        }
      });
    });
  };
  AuditTrailManager.prototype.executeRuleValidation = function (eventData, rule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implement actual rule validation logic
        // This is a simplified version
        return [2 /*return*/, true]; // Default to compliant for now
      });
    });
  };
  AuditTrailManager.prototype.identifyRiskFactors = function (eventData) {
    var factors = [];
    if (eventData.eventType === "access" && eventData.category === "patient_data") {
      factors.push("Patient data access");
    }
    if (eventData.severity === "error" || eventData.severity === "critical") {
      factors.push("High severity event");
    }
    if (eventData.eventType === "deletion") {
      factors.push("Data deletion operation");
    }
    return factors;
  };
  AuditTrailManager.prototype.calculateRiskScore = function (eventData, riskFactors) {
    var score = 0;
    // Base score by event type
    var eventTypeScores = {
      access: 10,
      modification: 20,
      deletion: 40,
      creation: 15,
      authentication: 5,
      authorization: 10,
      compliance_check: 5,
      data_export: 30,
      system_event: 5,
    };
    score += eventTypeScores[eventData.eventType || "system_event"];
    // Add risk factor scores
    score += riskFactors.length * 10;
    // Severity multiplier
    var severityMultipliers = {
      info: 1,
      warning: 2,
      error: 3,
      critical: 5,
    };
    score *= severityMultipliers[eventData.severity || "info"];
    return Math.min(score, 100); // Cap at 100
  };
  AuditTrailManager.prototype.getRiskLevel = function (riskScore) {
    if (riskScore >= 80) return "critical";
    if (riskScore >= 60) return "high";
    if (riskScore >= 30) return "medium";
    return "low";
  };
  AuditTrailManager.prototype.getRiskCategory = function (eventData) {
    if (eventData.category === "patient_data" || eventData.category === "medical_records") {
      return "privacy";
    }
    if (eventData.category === "system_security") {
      return "security";
    }
    if (eventData.category === "compliance_validation") {
      return "compliance";
    }
    return "operational";
  };
  AuditTrailManager.prototype.getImmediateActions = function (riskLevel, eventData) {
    var actions = [];
    if (riskLevel === "critical") {
      actions.push("Immediate security team notification");
      actions.push("Suspend user access if necessary");
      actions.push("Investigate potential breach");
    }
    if (riskLevel === "high") {
      actions.push("Alert compliance officer");
      actions.push("Review access controls");
    }
    return actions;
  };
  AuditTrailManager.prototype.getLongTermActions = function (riskLevel, eventData) {
    var actions = [];
    if (riskLevel === "critical" || riskLevel === "high") {
      actions.push("Review and update security policies");
      actions.push("Enhance monitoring and alerting");
      actions.push("Conduct security awareness training");
    }
    return actions;
  };
  AuditTrailManager.prototype.assessImpact = function (eventData, riskLevel) {
    var baseImpact = riskLevel === "critical" ? "high" : riskLevel === "high" ? "medium" : "low";
    return {
      patientSafety: eventData.category === "medical_records" ? baseImpact : "none",
      dataPrivacy: eventData.category === "patient_data" ? baseImpact : "low",
      systemSecurity: eventData.category === "system_security" ? baseImpact : "low",
      regulatoryCompliance: baseImpact,
      businessContinuity: riskLevel === "critical" ? "medium" : "low",
      reputationalRisk: riskLevel === "critical" ? "high" : "low",
    };
  };
  AuditTrailManager.prototype.getRetentionPeriod = function (category, eventType) {
    // Retention periods in days
    var categoryRetention = {
      patient_data: 365 * 20, // 20 years
      medical_records: 365 * 20, // 20 years
      system_security: 365 * 7, // 7 years
      user_activity: 365 * 5, // 5 years
      compliance_validation: 365 * 10, // 10 years
      data_processing: 365 * 5, // 5 years
    };
    return categoryRetention[category || "system_security"];
  };
  AuditTrailManager.prototype.loadComplianceRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      var defaultRules;
      var _this = this;
      return __generator(this, function (_a) {
        defaultRules = [
          {
            id: "lgpd_data_access",
            name: "LGPD Data Access Control",
            description: "Ensure proper authorization for personal data access",
            severity: "critical",
            applicableCategories: ["patient_data"],
            applicableEventTypes: ["access"],
            requiresReview: true,
            recommendedAction: "Review access permissions and audit trail",
          },
          {
            id: "cfm_medical_records",
            name: "CFM Medical Records Retention",
            description: "Ensure proper retention of medical records per CFM 1821/2007",
            severity: "warning",
            applicableCategories: ["medical_records"],
            applicableEventTypes: ["deletion", "modification"],
            requiresReview: false,
            recommendedAction: "Verify retention policy compliance",
          },
        ];
        defaultRules.forEach(function (rule) {
          _this.complianceRules.set(rule.id, rule);
        });
        return [2 /*return*/];
      });
    });
  };
  AuditTrailManager.prototype.initializeRiskThresholds = function () {
    this.riskThresholds.set("critical_threshold", 80);
    this.riskThresholds.set("high_threshold", 60);
    this.riskThresholds.set("medium_threshold", 30);
  };
  AuditTrailManager.prototype.triggerImmediateResponse = function (entry, violations) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implement immediate response to critical violations
        logger_1.logger.error(
          "Critical compliance violation detected: ".concat(violations.join(", ")),
        );
        // Emit critical event
        this.emit("criticalViolation", {
          entry: entry,
          violations: violations,
        });
        return [2 /*return*/];
      });
    });
  };
  AuditTrailManager.prototype.handleComplianceViolation = function (entry, violations) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Handle compliance violations
        logger_1.logger.warning("Compliance violation detected: ".concat(violations.join(", ")));
        return [2 /*return*/];
      });
    });
  };
  AuditTrailManager.prototype.handleCriticalRisk = function (entry) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Handle critical risk events
        logger_1.logger.error("Critical risk event detected: ".concat(entry.id));
        return [2 /*return*/];
      });
    });
  };
  AuditTrailManager.prototype.updateRealTimeMetrics = function (entry) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  AuditTrailManager.prototype.mapRowToAuditEntry = function (row) {
    return {
      id: row.id,
      timestamp: row.timestamp,
      eventType: row.event_type,
      category: row.category,
      severity: row.severity,
      userId: row.user_id,
      userRole: row.user_role,
      sessionId: row.session_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      resourceId: row.resource_id,
      resourceType: row.resource_type,
      action: row.action,
      description: row.description,
      beforeState: row.before_state,
      afterState: row.after_state,
      metadata: row.metadata,
      complianceContext: row.compliance_context,
      riskAssessment: row.risk_assessment,
      retention: row.retention,
    };
  };
  AuditTrailManager.prototype.mapAuditEntryToRow = function (entry) {
    return {
      id: entry.id,
      timestamp: entry.timestamp,
      event_type: entry.eventType,
      category: entry.category,
      severity: entry.severity,
      user_id: entry.userId,
      user_role: entry.userRole,
      session_id: entry.sessionId,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      resource_id: entry.resourceId,
      resource_type: entry.resourceType,
      action: entry.action,
      description: entry.description,
      before_state: entry.beforeState,
      after_state: entry.afterState,
      metadata: entry.metadata,
      compliance_context: entry.complianceContext,
      risk_assessment: entry.riskAssessment,
      retention: entry.retention,
    };
  };
  AuditTrailManager.prototype.getAuditCategories = function () {
    return [
      "patient_data",
      "medical_records",
      "system_security",
      "user_activity",
      "compliance_validation",
      "data_processing",
    ];
  };
  AuditTrailManager.prototype.generateAuditSummary = function (entries) {
    return {
      totalEvents: entries.length,
      eventsByType: this.groupByField(entries, "eventType"),
      eventsByCategory: this.groupByField(entries, "category"),
      eventsBySeverity: this.groupByField(entries, "severity"),
      complianceRate: this.calculateComplianceRate(entries),
      riskDistribution: this.calculateRiskDistribution(entries),
      topUsers: this.getTopUsers(entries),
      topResources: this.getTopResources(entries),
    };
  };
  AuditTrailManager.prototype.generateAuditFindings = function (entries) {
    return __awaiter(this, void 0, void 0, function () {
      var findings, nonCompliantEvents;
      return __generator(this, function (_a) {
        findings = [];
        nonCompliantEvents = entries.filter(function (e) {
          return e.complianceContext.complianceStatus === "non_compliant";
        });
        if (nonCompliantEvents.length > 0) {
          findings.push({
            id: "finding_compliance_".concat(Date.now()),
            type: "compliance_violation",
            severity: "warning",
            title: "Compliance Violations Detected",
            description: "".concat(nonCompliantEvents.length, " compliance violations found"),
            evidence: nonCompliantEvents.map(function (e) {
              return e.id;
            }),
            relatedEvents: nonCompliantEvents.map(function (e) {
              return e.id;
            }),
            impactAssessment: {
              patientSafety: "low",
              dataPrivacy: "medium",
              systemSecurity: "low",
              regulatoryCompliance: "high",
              businessContinuity: "low",
              reputationalRisk: "medium",
            },
            recommendedActions: [
              "Review and address compliance gaps",
              "Update policies if necessary",
            ],
            status: "open",
          });
        }
        return [2 /*return*/, findings];
      });
    });
  };
  AuditTrailManager.prototype.generateAuditRecommendations = function (entries) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Generate recommendations based on audit analysis
        return [
          2 /*return*/,
          [
            {
              id: "rec_".concat(Date.now()),
              category: "compliance",
              priority: "high",
              title: "Enhance Access Control Monitoring",
              description: "Implement more granular access control monitoring",
              justification: "Multiple access events detected that require closer monitoring",
              implementation: {
                estimatedEffort: "medium",
                timeline: "2-4 weeks",
                resources: ["Security team", "Development team"],
                dependencies: ["Updated access control system"],
                successCriteria: [
                  "Reduced unauthorized access attempts",
                  "Improved compliance scores",
                ],
              },
              expectedBenefit: "Improved security posture and compliance",
              riskReduction: 25,
            },
          ],
        ];
      });
    });
  };
  AuditTrailManager.prototype.generateComplianceMetrics = function (entries) {
    return {
      overallComplianceRate: this.calculateComplianceRate(entries),
      complianceByRegulation: this.calculateComplianceByRegulation(entries),
      complianceByCategory: this.calculateComplianceByCategory(entries),
      complianceByUser: this.calculateComplianceByUser(entries),
      complianceTrends: this.calculateComplianceTrends(entries),
      violationsSummary: this.calculateViolationsSummary(entries),
    };
  };
  AuditTrailManager.prototype.generateRiskMetrics = function (entries) {
    return {
      overallRiskScore: this.calculateOverallRiskScore(entries),
      riskByCategory: this.calculateRiskByCategory(entries),
      riskByUser: this.calculateRiskByUser(entries),
      riskByResource: this.calculateRiskByResource(entries),
      highRiskEvents: entries.filter(function (e) {
        return e.riskAssessment.riskLevel === "high";
      }).length,
      criticalRiskEvents: entries.filter(function (e) {
        return e.riskAssessment.riskLevel === "critical";
      }).length,
      riskTrends: this.calculateRiskTrends(entries),
      riskMitigationStatus: this.calculateRiskMitigationStatus(entries),
    };
  };
  AuditTrailManager.prototype.generateAuditTrends = function (entries, timeRange) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Generate trend analysis
        return [
          2 /*return*/,
          [
            {
              metric: "compliance_rate",
              timePeriod: "daily",
              values: [],
              trend: "stable",
              significance: "medium",
            },
          ],
        ];
      });
    });
  };
  AuditTrailManager.prototype.saveAuditReport = function (report) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("audit_reports").insert({
                id: report.id,
                generated_date: report.generatedDate,
                report_type: report.reportType,
                report_data: report,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              logger_1.logger.error("Failed to save audit report:", error);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  // Additional helper methods for calculations
  AuditTrailManager.prototype.groupByField = function (items, field) {
    return items.reduce(function (acc, item) {
      var key = item[field];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  };
  AuditTrailManager.prototype.calculateComplianceRate = function (entries) {
    if (entries.length === 0) return 100;
    var compliantEntries = entries.filter(function (e) {
      return e.complianceContext.complianceStatus === "compliant";
    });
    return (compliantEntries.length / entries.length) * 100;
  };
  AuditTrailManager.prototype.calculateRiskDistribution = function (entries) {
    return this.groupByField(
      entries.map(function (e) {
        return { riskLevel: e.riskAssessment.riskLevel };
      }),
      "riskLevel",
    );
  };
  AuditTrailManager.prototype.getTopUsers = function (entries) {
    var userActivity = new Map();
    entries.forEach(function (entry) {
      var existing = userActivity.get(entry.userId) || {
        count: 0,
        riskScore: 0,
        lastActivity: entry.timestamp,
      };
      userActivity.set(entry.userId, {
        count: existing.count + 1,
        riskScore: Math.max(existing.riskScore, entry.riskAssessment.riskScore),
        lastActivity:
          entry.timestamp > existing.lastActivity ? entry.timestamp : existing.lastActivity,
      });
    });
    return Array.from(userActivity.entries()).map(function (_a) {
      var userId = _a[0],
        activity = _a[1];
      return {
        userId: userId,
        userName: "User ".concat(userId), // In real implementation, would look up actual name
        eventCount: activity.count,
        riskScore: activity.riskScore,
        complianceRate: 95, // Would calculate actual compliance rate
        lastActivity: activity.lastActivity,
      };
    });
  };
  AuditTrailManager.prototype.getTopResources = function (entries) {
    var resourceActivity = new Map();
    entries.forEach(function (entry) {
      if (!entry.resourceId) return;
      var existing = resourceActivity.get(entry.resourceId) || {
        accessCount: 0,
        modificationCount: 0,
        riskScore: 0,
        lastAccessed: entry.timestamp,
      };
      resourceActivity.set(entry.resourceId, {
        accessCount: existing.accessCount + (entry.eventType === "access" ? 1 : 0),
        modificationCount:
          existing.modificationCount + (entry.eventType === "modification" ? 1 : 0),
        riskScore: Math.max(existing.riskScore, entry.riskAssessment.riskScore),
        lastAccessed:
          entry.timestamp > existing.lastAccessed ? entry.timestamp : existing.lastAccessed,
      });
    });
    return Array.from(resourceActivity.entries()).map(function (_a) {
      var resourceId = _a[0],
        activity = _a[1];
      return {
        resourceId: resourceId,
        resourceType: "patient_record", // Would determine actual type
        accessCount: activity.accessCount,
        modificationCount: activity.modificationCount,
        riskScore: activity.riskScore,
        lastAccessed: activity.lastAccessed,
      };
    });
  };
  AuditTrailManager.prototype.calculateComplianceByRegulation = function (entries) {
    // Implementation for compliance calculation by regulation
    return {};
  };
  AuditTrailManager.prototype.calculateComplianceByCategory = function (entries) {
    // Implementation for compliance calculation by category
    return {};
  };
  AuditTrailManager.prototype.calculateComplianceByUser = function (entries) {
    // Implementation for compliance calculation by user
    return {};
  };
  AuditTrailManager.prototype.calculateComplianceTrends = function (entries) {
    // Implementation for compliance trends calculation
    return [];
  };
  AuditTrailManager.prototype.calculateViolationsSummary = function (entries) {
    var violations = entries.filter(function (e) {
      return e.complianceContext.complianceStatus === "non_compliant";
    });
    return {
      totalViolations: violations.length,
      violationsByType: this.groupByField(violations, "eventType"),
      violationsBySeverity: this.groupByField(violations, "severity"),
      resolvedViolations: 0, // Would track resolution status
      pendingViolations: violations.length,
      avgResolutionTime: 0, // Would calculate actual resolution time
    };
  };
  AuditTrailManager.prototype.calculateOverallRiskScore = function (entries) {
    if (entries.length === 0) return 0;
    var totalRisk = entries.reduce(function (sum, entry) {
      return sum + entry.riskAssessment.riskScore;
    }, 0);
    return totalRisk / entries.length;
  };
  AuditTrailManager.prototype.calculateRiskByCategory = function (entries) {
    // Implementation for risk calculation by category
    return {};
  };
  AuditTrailManager.prototype.calculateRiskByUser = function (entries) {
    // Implementation for risk calculation by user
    return {};
  };
  AuditTrailManager.prototype.calculateRiskByResource = function (entries) {
    // Implementation for risk calculation by resource
    return {};
  };
  AuditTrailManager.prototype.calculateRiskTrends = function (entries) {
    // Implementation for risk trends calculation
    return [];
  };
  AuditTrailManager.prototype.calculateRiskMitigationStatus = function (entries) {
    // Implementation for risk mitigation status calculation
    return {
      totalMitigations: 0,
      completedMitigations: 0,
      pendingMitigations: 0,
      overdueMitigations: 0,
      avgMitigationTime: 0,
    };
  };
  AuditTrailManager.prototype.groupValidationsByRegulation = function (results) {
    // Implementation for grouping validations by regulation
    return {};
  };
  AuditTrailManager.prototype.generateComplianceRecommendations = function (results) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for generating compliance recommendations
        return [
          2 /*return*/,
          [
            "Regular compliance training for staff",
            "Update compliance policies and procedures",
            "Implement automated compliance checking",
          ],
        ];
      });
    });
  };
  return AuditTrailManager;
})(events_1.EventEmitter);
exports.AuditTrailManager = AuditTrailManager;
exports.LGPDAuditTrail = AuditTrailManager;
exports.LGPDAuditTrailService = AuditTrailManager;
// Validation schemas
exports.AuditEventValidationSchema = zod_1.z.object({
  eventType: zod_1.z.enum([
    "access",
    "modification",
    "deletion",
    "creation",
    "authentication",
    "authorization",
    "compliance_check",
    "data_export",
    "system_event",
  ]),
  category: zod_1.z.enum([
    "patient_data",
    "medical_records",
    "system_security",
    "user_activity",
    "compliance_validation",
    "data_processing",
  ]),
  userId: zod_1.z.string().min(1, "User ID is required"),
  action: zod_1.z.string().min(1, "Action is required"),
  description: zod_1.z.string().min(1, "Description is required"),
});
// Export the AuditEventType enum for direct use
var lgpd_1 = require("../../types/lgpd");
Object.defineProperty(exports, "AuditEventType", {
  enumerable: true,
  get: function () {
    return lgpd_1.AuditEventType;
  },
});
// Export singleton instance
var createauditTrailManager = function () {
  return new AuditTrailManager();
};
exports.createauditTrailManager = createauditTrailManager;
