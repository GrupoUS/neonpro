"use strict";
/**
 * Audit Logger - Session Activity Tracking & LGPD Compliance
 *
 * Comprehensive audit logging system for session management with LGPD compliance,
 * security monitoring, and detailed activity tracking for the NeonPro platform.
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
exports.AuditLogger = void 0;
var events_1 = require("events");
var types_1 = require("./types");
var AuditLogger = /** @class */ (function (_super) {
  __extends(AuditLogger, _super);
  function AuditLogger(supabase, options) {
    var _this = _super.call(this) || this;
    _this.logBuffer = [];
    _this.bufferSize = 100;
    _this.flushInterval = 5000; // 5 seconds
    _this.correlationMap = new Map();
    _this.supabase = supabase;
    _this.bufferSize =
      (options === null || options === void 0 ? void 0 : options.bufferSize) || 100;
    _this.flushInterval =
      (options === null || options === void 0 ? void 0 : options.flushInterval) || 5000;
    _this.startFlushTimer();
    return _this;
  }
  // ============================================================================
  // AUDIT LOGGING METHODS
  // ============================================================================
  /**
   * Log a session-related audit event
   */
  AuditLogger.prototype.logSessionEvent = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var eventId, logEntry;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            eventId = this.generateEventId();
            logEntry = {
              id: eventId,
              sessionId: params.sessionId,
              userId: params.userId,
              clinicId: params.clinicId,
              action: params.action,
              category: this.categorizeAction(params.action),
              severity: params.severity || this.determineSeverity(params.action),
              details: __assign(__assign({}, params.details), {
                eventId: eventId,
                source: "session_manager",
              }),
              ipAddress: params.ipAddress,
              userAgent: params.userAgent,
              deviceFingerprint: params.deviceFingerprint,
              location: params.location,
              timestamp: new Date(),
              correlationId: params.correlationId,
              parentEventId: params.parentEventId,
            };
            // Add LGPD data if applicable
            if (this.isLGPDRelevant(params.action)) {
              logEntry.lgpdData = this.generateLGPDData(logEntry);
            }
            // Buffer the log entry
            this.bufferLogEntry(logEntry);
            // Emit event for real-time monitoring
            this.emit("audit_event", logEntry);
            if (!(logEntry.severity === "critical")) return [3 /*break*/, 2];
            return [4 /*yield*/, this.flushBuffer()];
          case 1:
            _a.sent();
            this.emit("critical_event", logEntry);
            _a.label = 2;
          case 2:
            return [2 /*return*/, eventId];
        }
      });
    });
  };
  /**
   * Log a security event
   */
  AuditLogger.prototype.logSecurityEvent = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var eventId;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.logSessionEvent(
                __assign(__assign({}, params), {
                  severity: this.mapThreatToSeverity(params.threatLevel),
                  details: __assign(__assign({}, params.details), {
                    threatLevel: params.threatLevel,
                    securityEvent: true,
                  }),
                }),
              ),
            ];
          case 1:
            eventId = _a.sent();
            // Create security event record
            return [
              4 /*yield*/,
              this.createSecurityEventRecord({
                eventId: eventId,
                userId: params.userId,
                threatLevel: params.threatLevel,
                action: params.action,
                details: params.details,
                ipAddress: params.ipAddress,
                timestamp: new Date(),
              }),
            ];
          case 2:
            // Create security event record
            _a.sent();
            return [2 /*return*/, eventId];
        }
      });
    });
  };
  /**
   * Log LGPD compliance event
   */
  AuditLogger.prototype.logLGPDEvent = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var lgpdData, eventId;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            lgpdData = {
              dataProcessingPurpose: params.purpose,
              legalBasis: params.legalBasis,
              dataCategories: [params.dataType],
              retentionPeriod: this.getRetentionPeriod(params.dataType),
              consentStatus: "given", // Simplified for demo
              dataMinimization: true,
              encryptionStatus: "encrypted",
            };
            return [
              4 /*yield*/,
              this.logSessionEvent({
                userId: params.userId,
                clinicId: params.clinicId,
                action: params.action,
                severity: "medium",
                details: __assign(__assign({}, params.details), {
                  dataType: params.dataType,
                  legalBasis: params.legalBasis,
                  purpose: params.purpose,
                  lgpdCompliance: true,
                }),
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                correlationId: params.correlationId,
              }),
            ];
          case 1:
            eventId = _a.sent();
            // Store LGPD-specific data
            return [4 /*yield*/, this.storeLGPDData(eventId, lgpdData)];
          case 2:
            // Store LGPD-specific data
            _a.sent();
            return [2 /*return*/, eventId];
        }
      });
    });
  };
  /**
   * Create correlation between related events
   */
  AuditLogger.prototype.createCorrelation = function (eventIds, correlationType) {
    var _this = this;
    var correlationId = this.generateCorrelationId();
    eventIds.forEach(function (eventId) {
      _this.correlationMap.set(eventId, correlationId);
    });
    // Store correlation in database
    this.storeCorrelation(correlationId, eventIds, correlationType);
    return correlationId;
  };
  // ============================================================================
  // AUDIT SEARCH & RETRIEVAL
  // ============================================================================
  /**
   * Search audit logs with filters
   */
  AuditLogger.prototype.searchAuditLogs = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, limit, offset, _a, data, error, count, logs, total, hasMore, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            // Ensure buffer is flushed for real-time search
            return [4 /*yield*/, this.flushBuffer()];
          case 1:
            // Ensure buffer is flushed for real-time search
            _b.sent();
            query = this.supabase.from("session_audit_logs").select("*", { count: "exact" });
            // Apply filters
            if (filters.userId) {
              query = query.eq("user_id", filters.userId);
            }
            if (filters.clinicId) {
              query = query.eq("clinic_id", filters.clinicId);
            }
            if (filters.sessionId) {
              query = query.eq("session_id", filters.sessionId);
            }
            if (filters.action) {
              query = query.eq("action", filters.action);
            }
            if (filters.category) {
              query = query.eq("category", filters.category);
            }
            if (filters.severity) {
              query = query.eq("severity", filters.severity);
            }
            if (filters.ipAddress) {
              query = query.eq("ip_address", filters.ipAddress);
            }
            if (filters.deviceFingerprint) {
              query = query.eq("device_fingerprint", filters.deviceFingerprint);
            }
            if (filters.startDate) {
              query = query.gte("timestamp", filters.startDate.toISOString());
            }
            if (filters.endDate) {
              query = query.lte("timestamp", filters.endDate.toISOString());
            }
            if (filters.correlationId) {
              query = query.eq("correlation_id", filters.correlationId);
            }
            limit = filters.limit || 50;
            offset = filters.offset || 0;
            query = query
              .order("timestamp", { ascending: false })
              .range(offset, offset + limit - 1);
            return [4 /*yield*/, query];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) {
              throw new types_1.SessionError("Failed to search audit logs", "SYSTEM_ERROR", {
                error: error,
              });
            }
            logs = data.map(this.mapDatabaseToAuditLog);
            total = count || 0;
            hasMore = offset + limit < total;
            return [2 /*return*/, { logs: logs, total: total, hasMore: hasMore }];
          case 3:
            error_1 = _b.sent();
            if (error_1 instanceof types_1.SessionError) {
              throw error_1;
            }
            throw new types_1.SessionError("Failed to search audit logs", "SYSTEM_ERROR", {
              error: error_1,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get audit log by ID
   */
  AuditLogger.prototype.getAuditLog = function (eventId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("session_audit_logs").select("*").eq("id", eventId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            return [2 /*return*/, this.mapDatabaseToAuditLog(data)];
          case 2:
            error_2 = _b.sent();
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get correlated events
   */
  AuditLogger.prototype.getCorrelatedEvents = function (correlationId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .select("*")
                .eq("correlation_id", correlationId)
                .order("timestamp", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new types_1.SessionError("Failed to get correlated events", "SYSTEM_ERROR", {
                error: error,
              });
            }
            return [2 /*return*/, data.map(this.mapDatabaseToAuditLog)];
          case 2:
            error_3 = _b.sent();
            if (error_3 instanceof types_1.SessionError) {
              throw error_3;
            }
            throw new types_1.SessionError("Failed to get correlated events", "SYSTEM_ERROR", {
              error: error_3,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get user activity timeline
   */
  AuditLogger.prototype.getUserActivityTimeline = function (userId, options) {
    return __awaiter(this, void 0, void 0, function () {
      var filters, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            filters = {
              userId: userId,
              startDate: options === null || options === void 0 ? void 0 : options.startDate,
              endDate: options === null || options === void 0 ? void 0 : options.endDate,
              limit: (options === null || options === void 0 ? void 0 : options.limit) || 100,
            };
            return [4 /*yield*/, this.searchAuditLogs(filters)];
          case 1:
            result = _a.sent();
            return [2 /*return*/, result.logs];
        }
      });
    });
  };
  /**
   * Get security events for analysis
   */
  AuditLogger.prototype.getSecurityEvents = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var filters, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            filters = {
              category: "security",
              severity: options === null || options === void 0 ? void 0 : options.severity,
              startDate: options === null || options === void 0 ? void 0 : options.startDate,
              endDate: options === null || options === void 0 ? void 0 : options.endDate,
              limit: (options === null || options === void 0 ? void 0 : options.limit) || 100,
            };
            return [4 /*yield*/, this.searchAuditLogs(filters)];
          case 1:
            result = _a.sent();
            return [2 /*return*/, result.logs];
        }
      });
    });
  };
  // ============================================================================
  // AUDIT ANALYTICS & REPORTING
  // ============================================================================
  /**
   * Generate audit statistics
   */
  AuditLogger.prototype.generateAuditStatistics = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.flushBuffer()];
          case 1:
            _b.sent();
            query = this.supabase
              .from("session_audit_logs")
              .select("action, category, severity, user_id, ip_address, timestamp");
            if (options === null || options === void 0 ? void 0 : options.userId) {
              query = query.eq("user_id", options.userId);
            }
            if (options === null || options === void 0 ? void 0 : options.clinicId) {
              query = query.eq("clinic_id", options.clinicId);
            }
            if (options === null || options === void 0 ? void 0 : options.startDate) {
              query = query.gte("timestamp", options.startDate.toISOString());
            }
            if (options === null || options === void 0 ? void 0 : options.endDate) {
              query = query.lte("timestamp", options.endDate.toISOString());
            }
            return [4 /*yield*/, query];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new types_1.SessionError(
                "Failed to generate audit statistics",
                "SYSTEM_ERROR",
                { error: error },
              );
            }
            return [2 /*return*/, this.calculateStatistics(data)];
          case 3:
            error_4 = _b.sent();
            if (error_4 instanceof types_1.SessionError) {
              throw error_4;
            }
            throw new types_1.SessionError("Failed to generate audit statistics", "SYSTEM_ERROR", {
              error: error_4,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate LGPD compliance report
   */
  AuditLogger.prototype.generateLGPDReport = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var filters, result, events, report, totalRequiredEvents, violationPenalty, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            filters = {
              category: "lgpd",
              userId: options === null || options === void 0 ? void 0 : options.userId,
              clinicId: options === null || options === void 0 ? void 0 : options.clinicId,
              startDate: options === null || options === void 0 ? void 0 : options.startDate,
              endDate: options === null || options === void 0 ? void 0 : options.endDate,
              limit: 1000,
            };
            return [4 /*yield*/, this.searchAuditLogs(filters)];
          case 1:
            result = _a.sent();
            events = result.logs;
            report = {
              totalEvents: events.length,
              consentEvents: events.filter(function (e) {
                return e.action.includes("consent");
              }).length,
              dataAccessEvents: events.filter(function (e) {
                return e.action === "data_access";
              }).length,
              dataExportEvents: events.filter(function (e) {
                return e.action === "data_exported";
              }).length,
              dataDeletionEvents: events.filter(function (e) {
                return e.action === "data_deleted";
              }).length,
              complianceScore: 0,
              violations: events.filter(function (e) {
                return e.severity === "critical";
              }),
            };
            totalRequiredEvents = report.consentEvents + report.dataAccessEvents;
            violationPenalty = report.violations.length * 10;
            report.complianceScore = Math.max(
              0,
              Math.min(100, (totalRequiredEvents > 0 ? 80 : 60) - violationPenalty),
            );
            return [2 /*return*/, report];
          case 2:
            error_5 = _a.sent();
            throw new types_1.SessionError("Failed to generate LGPD report", "SYSTEM_ERROR", {
              error: error_5,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Export audit logs for compliance
   */
  AuditLogger.prototype.exportAuditLogs = function (filters_1) {
    return __awaiter(this, arguments, void 0, function (filters, format) {
      var result, logs, data, filename, mimeType, error_6;
      if (format === void 0) {
        format = "json";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.searchAuditLogs(__assign(__assign({}, filters), { limit: 10000 })),
            ];
          case 1:
            result = _a.sent();
            logs = result.logs;
            data = void 0;
            filename = void 0;
            mimeType = void 0;
            if (format === "csv") {
              data = this.convertToCSV(logs);
              filename = "audit_logs_".concat(Date.now(), ".csv");
              mimeType = "text/csv";
            } else {
              data = JSON.stringify(logs, null, 2);
              filename = "audit_logs_".concat(Date.now(), ".json");
              mimeType = "application/json";
            }
            // Log the export event
            return [
              4 /*yield*/,
              this.logSessionEvent({
                userId: filters.userId || "system",
                clinicId: filters.clinicId || "system",
                action: "data_exported",
                severity: "medium",
                details: {
                  exportFormat: format,
                  recordCount: logs.length,
                  filters: filters,
                },
                ipAddress: "127.0.0.1",
                userAgent: "audit_system",
              }),
            ];
          case 2:
            // Log the export event
            _a.sent();
            return [2 /*return*/, { data: data, filename: filename, mimeType: mimeType }];
          case 3:
            error_6 = _a.sent();
            throw new types_1.SessionError("Failed to export audit logs", "SYSTEM_ERROR", {
              error: error_6,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // AUDIT MAINTENANCE
  // ============================================================================
  /**
   * Archive old audit logs
   */
  AuditLogger.prototype.archiveOldLogs = function () {
    return __awaiter(this, arguments, void 0, function (retentionDays) {
      var cutoffDate, _a, oldLogs, fetchError, archiveError, deleteError, error_7;
      if (retentionDays === void 0) {
        retentionDays = 365;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .select("id")
                .lt("timestamp", cutoffDate.toISOString())
                .limit(1000),
            ];
          case 1:
            (_a = _b.sent()), (oldLogs = _a.data), (fetchError = _a.error);
            if (fetchError) {
              throw new types_1.SessionError("Failed to fetch old logs", "SYSTEM_ERROR", {
                error: fetchError,
              });
            }
            if (!oldLogs || oldLogs.length === 0) {
              return [2 /*return*/, { archivedCount: 0, deletedCount: 0 }];
            }
            return [
              4 /*yield*/,
              this.supabase.from("session_audit_logs_archive").insert(
                oldLogs.map(function (log) {
                  return __assign(__assign({}, log), { archived_at: new Date().toISOString() });
                }),
              ),
            ];
          case 2:
            archiveError = _b.sent().error;
            if (archiveError) {
              throw new types_1.SessionError("Failed to archive logs", "SYSTEM_ERROR", {
                error: archiveError,
              });
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .delete()
                .in(
                  "id",
                  oldLogs.map(function (log) {
                    return log.id;
                  }),
                ),
            ];
          case 3:
            deleteError = _b.sent().error;
            if (deleteError) {
              throw new types_1.SessionError("Failed to delete archived logs", "SYSTEM_ERROR", {
                error: deleteError,
              });
            }
            return [
              2 /*return*/,
              {
                archivedCount: oldLogs.length,
                deletedCount: oldLogs.length,
              },
            ];
          case 4:
            error_7 = _b.sent();
            if (error_7 instanceof types_1.SessionError) {
              throw error_7;
            }
            throw new types_1.SessionError("Failed to archive old logs", "SYSTEM_ERROR", {
              error: error_7,
            });
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup sensitive data from logs
   */
  AuditLogger.prototype.cleanupSensitiveData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var thirtyDaysAgo,
        _a,
        oldLogs,
        fetchError,
        cleanedCount,
        _i,
        oldLogs_1,
        log,
        cleanedDetails,
        error,
        error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .select("id, details")
                .lt("timestamp", thirtyDaysAgo.toISOString())
                .limit(100),
            ];
          case 1:
            (_a = _b.sent()), (oldLogs = _a.data), (fetchError = _a.error);
            if (fetchError || !oldLogs) {
              return [2 /*return*/, 0];
            }
            cleanedCount = 0;
            (_i = 0), (oldLogs_1 = oldLogs);
            _b.label = 2;
          case 2:
            if (!(_i < oldLogs_1.length)) return [3 /*break*/, 5];
            log = oldLogs_1[_i];
            cleanedDetails = this.anonymizeLogDetails(log.details);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .update({ details: cleanedDetails })
                .eq("id", log.id),
            ];
          case 3:
            error = _b.sent().error;
            if (!error) {
              cleanedCount++;
            }
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, cleanedCount];
          case 6:
            error_8 = _b.sent();
            console.error("Failed to cleanup sensitive data:", error_8);
            return [2 /*return*/, 0];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================
  AuditLogger.prototype.bufferLogEntry = function (entry) {
    this.logBuffer.push(entry);
    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  };
  AuditLogger.prototype.flushBuffer = function () {
    return __awaiter(this, void 0, void 0, function () {
      var entries, dbEntries, error, error_9;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            if (this.logBuffer.length === 0) {
              return [2 /*return*/];
            }
            entries = __spreadArray([], this.logBuffer, true);
            this.logBuffer = [];
            _c.label = 1;
          case 1:
            _c.trys.push([1, 3, , 4]);
            dbEntries = entries.map(function (entry) {
              return {
                id: entry.id,
                session_id: entry.sessionId,
                user_id: entry.userId,
                clinic_id: entry.clinicId,
                action: entry.action,
                category: entry.category,
                severity: entry.severity,
                details: entry.details,
                ip_address: entry.ipAddress,
                user_agent: entry.userAgent,
                device_fingerprint: entry.deviceFingerprint,
                location: entry.location,
                timestamp: entry.timestamp.toISOString(),
                lgpd_data: entry.lgpdData,
                correlation_id: entry.correlationId,
                parent_event_id: entry.parentEventId,
              };
            });
            return [4 /*yield*/, this.supabase.from("session_audit_logs").insert(dbEntries)];
          case 2:
            error = _c.sent().error;
            if (error) {
              console.error("Failed to flush audit log buffer:", error);
              // Re-add entries to buffer for retry
              (_a = this.logBuffer).unshift.apply(_a, entries);
            }
            return [3 /*break*/, 4];
          case 3:
            error_9 = _c.sent();
            console.error("Failed to flush audit log buffer:", error_9);
            // Re-add entries to buffer for retry
            (_b = this.logBuffer).unshift.apply(_b, entries);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  AuditLogger.prototype.startFlushTimer = function () {
    var _this = this;
    this.flushTimer = setInterval(function () {
      _this.flushBuffer();
    }, this.flushInterval);
  };
  AuditLogger.prototype.categorizeAction = function (action) {
    if (action.includes("session")) return "session";
    if (action.includes("login") || action.includes("logout") || action.includes("mfa"))
      return "authentication";
    if (action.includes("device")) return "device";
    if (action.includes("suspicious") || action.includes("security") || action.includes("blocked"))
      return "security";
    if (action.includes("consent") || action.includes("data_") || action.includes("privacy"))
      return "lgpd";
    if (
      action.includes("system") ||
      action.includes("configuration") ||
      action.includes("maintenance")
    )
      return "system";
    return "user_activity";
  };
  AuditLogger.prototype.determineSeverity = function (action) {
    var criticalActions = [
      "session_hijack_detected",
      "security_violation",
      "unauthorized_access",
      "privilege_escalation",
      "system_error",
    ];
    var highActions = [
      "login_failed",
      "device_blocked",
      "suspicious_activity",
      "ip_blocked",
      "rate_limit_exceeded",
      "consent_withdrawn",
    ];
    var mediumActions = [
      "session_terminated",
      "device_registered",
      "password_changed",
      "mfa_enabled",
      "data_exported",
      "data_deleted",
    ];
    if (criticalActions.includes(action)) return "critical";
    if (highActions.includes(action)) return "high";
    if (mediumActions.includes(action)) return "medium";
    return "low";
  };
  AuditLogger.prototype.isLGPDRelevant = function (action) {
    var lgpdActions = [
      "consent_given",
      "consent_withdrawn",
      "data_exported",
      "data_deleted",
      "privacy_policy_accepted",
      "data_processing_logged",
      "data_access",
    ];
    return lgpdActions.includes(action);
  };
  AuditLogger.prototype.generateLGPDData = function (entry) {
    return {
      dataProcessingPurpose: this.determinePurpose(entry.action),
      legalBasis: this.determineLegalBasis(entry.action),
      dataCategories: this.determineDataCategories(entry.action),
      retentionPeriod: this.getRetentionPeriod("audit_log"),
      consentStatus: "given",
      dataMinimization: true,
      encryptionStatus: "encrypted",
    };
  };
  AuditLogger.prototype.determinePurpose = function (action) {
    if (action.includes("session")) return "Session management and security";
    if (action.includes("login")) return "User authentication";
    if (action.includes("device")) return "Device security and management";
    if (action.includes("security")) return "Security monitoring and protection";
    return "System operation and compliance";
  };
  AuditLogger.prototype.determineLegalBasis = function (action) {
    if (action.includes("security") || action.includes("session")) return "Legitimate interest";
    if (action.includes("consent")) return "Consent";
    if (action.includes("data_")) return "Legal obligation";
    return "Legitimate interest";
  };
  AuditLogger.prototype.determineDataCategories = function (action) {
    var categories = ["audit_logs"];
    if (action.includes("session") || action.includes("login")) {
      categories.push("authentication_data");
    }
    if (action.includes("device")) {
      categories.push("device_information");
    }
    if (action.includes("location")) {
      categories.push("location_data");
    }
    return categories;
  };
  AuditLogger.prototype.getRetentionPeriod = function (dataType) {
    var retentionPeriods = {
      audit_log: "7 years",
      session_data: "1 year",
      device_data: "2 years",
      security_data: "5 years",
    };
    return retentionPeriods[dataType] || "1 year";
  };
  AuditLogger.prototype.mapThreatToSeverity = function (threatLevel) {
    switch (threatLevel) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "medium";
    }
  };
  AuditLogger.prototype.createSecurityEventRecord = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("security_events").insert({
                id: this.generateEventId(),
                audit_event_id: params.eventId,
                user_id: params.userId,
                threat_level: params.threatLevel,
                event_type: params.action,
                details: params.details,
                ip_address: params.ipAddress,
                timestamp: params.timestamp.toISOString(),
                resolved: false,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Failed to create security event record:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AuditLogger.prototype.storeLGPDData = function (eventId, lgpdData) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_audit_data").insert({
                audit_event_id: eventId,
                data_processing_purpose: lgpdData.dataProcessingPurpose,
                legal_basis: lgpdData.legalBasis,
                data_categories: lgpdData.dataCategories,
                retention_period: lgpdData.retentionPeriod,
                consent_status: lgpdData.consentStatus,
                data_minimization: lgpdData.dataMinimization,
                encryption_status: lgpdData.encryptionStatus,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Failed to store LGPD data:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AuditLogger.prototype.storeCorrelation = function (correlationId, eventIds, type) {
    return __awaiter(this, void 0, void 0, function () {
      var error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("audit_correlations").insert({
                correlation_id: correlationId,
                event_ids: eventIds,
                correlation_type: type,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_12 = _a.sent();
            console.error("Failed to store correlation:", error_12);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AuditLogger.prototype.calculateStatistics = function (data) {
    var stats = {
      totalEvents: data.length,
      eventsByCategory: {
        authentication: 0,
        session: 0,
        device: 0,
        security: 0,
        lgpd: 0,
        system: 0,
        user_activity: 0,
      },
      eventsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      topActions: [],
      topUsers: [],
      topIPs: [],
      securityEvents: 0,
      lgpdEvents: 0,
      recentTrends: [],
    };
    // Count by category and severity
    var actionCounts = {};
    var userCounts = {};
    var ipCounts = {};
    data.forEach(function (event) {
      stats.eventsByCategory[event.category]++;
      stats.eventsBySeverity[event.severity]++;
      if (event.category === "security") stats.securityEvents++;
      if (event.category === "lgpd") stats.lgpdEvents++;
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
      userCounts[event.user_id] = (userCounts[event.user_id] || 0) + 1;
      ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1;
    });
    // Top actions
    stats.topActions = Object.entries(actionCounts)
      .sort(function (_a, _b) {
        var a = _a[1];
        var b = _b[1];
        return b - a;
      })
      .slice(0, 10)
      .map(function (_a) {
        var action = _a[0],
          count = _a[1];
        return { action: action, count: count };
      });
    // Top users
    stats.topUsers = Object.entries(userCounts)
      .sort(function (_a, _b) {
        var a = _a[1];
        var b = _b[1];
        return b - a;
      })
      .slice(0, 10)
      .map(function (_a) {
        var userId = _a[0],
          count = _a[1];
        return { userId: userId, count: count };
      });
    // Top IPs
    stats.topIPs = Object.entries(ipCounts)
      .sort(function (_a, _b) {
        var a = _a[1];
        var b = _b[1];
        return b - a;
      })
      .slice(0, 10)
      .map(function (_a) {
        var ipAddress = _a[0],
          count = _a[1];
        return { ipAddress: ipAddress, count: count };
      });
    // Recent trends (simplified - last 7 days)
    var now = new Date();
    var _loop_1 = function (i) {
      var date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      var dateStr = date.toISOString().split("T")[0];
      var count = data.filter(function (event) {
        return event.timestamp.startsWith(dateStr);
      }).length;
      stats.recentTrends.push({ date: dateStr, count: count });
    };
    for (var i = 6; i >= 0; i--) {
      _loop_1(i);
    }
    return stats;
  };
  AuditLogger.prototype.convertToCSV = function (logs) {
    var headers = [
      "ID",
      "Session ID",
      "User ID",
      "Clinic ID",
      "Action",
      "Category",
      "Severity",
      "IP Address",
      "User Agent",
      "Timestamp",
      "Details",
    ];
    var rows = logs.map(function (log) {
      return [
        log.id,
        log.sessionId || "",
        log.userId,
        log.clinicId,
        log.action,
        log.category,
        log.severity,
        log.ipAddress,
        log.userAgent,
        log.timestamp.toISOString(),
        JSON.stringify(log.details),
      ];
    });
    return __spreadArray([headers], rows, true)
      .map(function (row) {
        return row
          .map(function (cell) {
            return '"'.concat(cell, '"');
          })
          .join(",");
      })
      .join("\n");
  };
  AuditLogger.prototype.anonymizeLogDetails = function (details) {
    var sensitiveFields = ["password", "token", "secret", "key", "email", "phone"];
    var anonymized = __assign({}, details);
    var anonymizeObject = function (obj) {
      if (typeof obj !== "object" || obj === null) {
        return obj;
      }
      var result = {};
      var _loop_2 = function (key, value) {
        if (
          sensitiveFields.some(function (field) {
            return key.toLowerCase().includes(field);
          })
        ) {
          result[key] = "[ANONYMIZED]";
        } else if (typeof value === "object") {
          result[key] = anonymizeObject(value);
        } else {
          result[key] = value;
        }
      };
      for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i],
          key = _b[0],
          value = _b[1];
        _loop_2(key, value);
      }
      return result;
    };
    return anonymizeObject(anonymized);
  };
  AuditLogger.prototype.mapDatabaseToAuditLog = function (data) {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      action: data.action,
      category: data.category,
      severity: data.severity,
      details: data.details,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      deviceFingerprint: data.device_fingerprint,
      location: data.location,
      timestamp: new Date(data.timestamp),
      lgpdData: data.lgpd_data,
      correlationId: data.correlation_id,
      parentEventId: data.parent_event_id,
    };
  };
  AuditLogger.prototype.generateEventId = function () {
    return "evt_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  };
  AuditLogger.prototype.generateCorrelationId = function () {
    return "corr_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  };
  /**
   * Cleanup resources
   */
  AuditLogger.prototype.destroy = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.flushTimer) {
              clearInterval(this.flushTimer);
            }
            return [4 /*yield*/, this.flushBuffer()];
          case 1:
            _a.sent();
            this.correlationMap.clear();
            this.removeAllListeners();
            return [2 /*return*/];
        }
      });
    });
  };
  return AuditLogger;
})(events_1.EventEmitter);
exports.AuditLogger = AuditLogger;
