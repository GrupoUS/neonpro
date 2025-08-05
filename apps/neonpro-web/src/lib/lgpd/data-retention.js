/**
 * LGPD Data Retention Policy System
 * Implements automated data retention and deletion policies
 *
 * Features:
 * - Automated data retention policy management
 * - Scheduled data deletion based on retention periods
 * - Legal hold management for litigation or investigations
 * - Data archival and backup before deletion
 * - Retention policy compliance monitoring
 * - Audit trail for all retention activities
 * - Exception handling for special data categories
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
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
exports.dataRetentionManager =
  exports.DataRetentionManager =
  exports.LegalHoldStatus =
  exports.DeletionMethod =
  exports.RetentionTrigger =
  exports.RetentionUnit =
  exports.DataCategory =
    void 0;
var events_1 = require("events");
// ============================================================================
// DATA RETENTION TYPES & INTERFACES
// ============================================================================
/**
 * Data Categories for Retention
 */
var DataCategory;
((DataCategory) => {
  DataCategory["USER_PROFILE"] = "user_profile";
  DataCategory["AUTHENTICATION"] = "authentication";
  DataCategory["SESSION_DATA"] = "session_data";
  DataCategory["AUDIT_LOGS"] = "audit_logs";
  DataCategory["CONSENT_RECORDS"] = "consent_records";
  DataCategory["COMMUNICATION"] = "communication";
  DataCategory["TRANSACTION_DATA"] = "transaction_data";
  DataCategory["ANALYTICS"] = "analytics";
  DataCategory["SUPPORT_TICKETS"] = "support_tickets";
  DataCategory["LEGAL_DOCUMENTS"] = "legal_documents";
  DataCategory["BACKUP_DATA"] = "backup_data";
  DataCategory["TEMPORARY_FILES"] = "temporary_files";
  DataCategory["CACHE_DATA"] = "cache_data";
  DataCategory["SENSITIVE_DATA"] = "sensitive_data";
  DataCategory["CHILDREN_DATA"] = "children_data";
})(DataCategory || (exports.DataCategory = DataCategory = {}));
/**
 * Retention Period Units
 */
var RetentionUnit;
((RetentionUnit) => {
  RetentionUnit["DAYS"] = "days";
  RetentionUnit["WEEKS"] = "weeks";
  RetentionUnit["MONTHS"] = "months";
  RetentionUnit["YEARS"] = "years";
})(RetentionUnit || (exports.RetentionUnit = RetentionUnit = {}));
/**
 * Retention Trigger Types
 */
var RetentionTrigger;
((RetentionTrigger) => {
  RetentionTrigger["CREATION_DATE"] = "creation_date";
  RetentionTrigger["LAST_ACCESS"] = "last_access";
  RetentionTrigger["LAST_UPDATE"] = "last_update";
  RetentionTrigger["USER_DELETION"] = "user_deletion";
  RetentionTrigger["CONSENT_WITHDRAWAL"] = "consent_withdrawal";
  RetentionTrigger["ACCOUNT_CLOSURE"] = "account_closure";
  RetentionTrigger["CONTRACT_END"] = "contract_end";
  RetentionTrigger["LEGAL_REQUIREMENT"] = "legal_requirement";
})(RetentionTrigger || (exports.RetentionTrigger = RetentionTrigger = {}));
/**
 * Deletion Method Types
 */
var DeletionMethod;
((DeletionMethod) => {
  DeletionMethod["SOFT_DELETE"] = "soft_delete";
  DeletionMethod["HARD_DELETE"] = "hard_delete";
  DeletionMethod["ANONYMIZATION"] = "anonymization";
  DeletionMethod["PSEUDONYMIZATION"] = "pseudonymization";
  DeletionMethod["ARCHIVAL"] = "archival";
})(DeletionMethod || (exports.DeletionMethod = DeletionMethod = {}));
/**
 * Legal Hold Status
 */
var LegalHoldStatus;
((LegalHoldStatus) => {
  LegalHoldStatus["ACTIVE"] = "active";
  LegalHoldStatus["PENDING"] = "pending";
  LegalHoldStatus["RELEASED"] = "released";
  LegalHoldStatus["EXPIRED"] = "expired";
})(LegalHoldStatus || (exports.LegalHoldStatus = LegalHoldStatus = {}));
// ============================================================================
// DATA RETENTION MANAGEMENT SYSTEM
// ============================================================================
/**
 * Data Retention Management System
 *
 * Provides comprehensive data retention policy management including:
 * - Automated policy enforcement
 * - Scheduled data deletion
 * - Legal hold management
 * - Compliance monitoring and reporting
 */
var DataRetentionManager = /** @class */ ((_super) => {
  __extends(DataRetentionManager, _super);
  function DataRetentionManager(config) {
    if (config === void 0) {
      config = {
        processingIntervalHours: 24,
        reviewIntervalDays: 7,
        batchSize: 100,
        maxRetries: 3,
        archivalEnabled: true,
        notificationEnabled: true,
        dryRunMode: false,
        gracePeriodDays: 30,
      };
    }
    var _this = _super.call(this) || this;
    _this.config = config;
    _this.policies = new Map();
    _this.schedules = new Map();
    _this.legalHolds = new Map();
    _this.isInitialized = false;
    _this.processingInterval = null;
    _this.reviewInterval = null;
    _this.setMaxListeners(100);
    return _this;
  }
  /**
   * Initialize the data retention manager
   */
  DataRetentionManager.prototype.initialize = function () {
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
            // Load retention policies
            return [4 /*yield*/, this.loadPolicies()];
          case 2:
            // Load retention policies
            _a.sent();
            // Load retention schedules
            return [4 /*yield*/, this.loadSchedules()];
          case 3:
            // Load retention schedules
            _a.sent();
            // Load legal holds
            return [4 /*yield*/, this.loadLegalHolds()];
          case 4:
            // Load legal holds
            _a.sent();
            // Start processing intervals
            this.startProcessingInterval();
            this.startReviewInterval();
            this.isInitialized = true;
            this.logActivity("system", "retention_manager_initialized", {
              timestamp: new Date(),
              policiesLoaded: this.policies.size,
              schedulesLoaded: this.schedules.size,
              legalHoldsLoaded: this.legalHolds.size,
            });
            return [3 /*break*/, 6];
          case 5:
            error_1 = _a.sent();
            throw new Error("Failed to initialize retention manager: ".concat(error_1));
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create retention policy
   */
  DataRetentionManager.prototype.createPolicy = function (policyData) {
    return __awaiter(this, void 0, void 0, function () {
      var policy;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            policy = __assign(__assign({}, policyData), {
              id: this.generateId("policy"),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Validate policy
            this.validatePolicy(policy);
            this.policies.set(policy.id, policy);
            return [4 /*yield*/, this.savePolicy(policy)];
          case 3:
            _a.sent();
            // Create schedules for existing data
            return [4 /*yield*/, this.createSchedulesForPolicy(policy)];
          case 4:
            // Create schedules for existing data
            _a.sent();
            this.emit("retention:policy_created", { policy: policy });
            this.logActivity("user", "policy_created", {
              policyId: policy.id,
              category: policy.category,
              retentionPeriod: policy.retentionPeriod,
              createdBy: policy.createdBy,
            });
            return [2 /*return*/, policy];
        }
      });
    });
  };
  /**
   * Update retention policy
   */
  DataRetentionManager.prototype.updatePolicy = function (policyId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var policy;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            policy = this.policies.get(policyId);
            if (!policy) {
              throw new Error("Policy not found");
            }
            // Apply updates
            Object.assign(policy, updates);
            policy.updatedAt = new Date();
            // Validate updated policy
            this.validatePolicy(policy);
            return [4 /*yield*/, this.savePolicy(policy)];
          case 1:
            _a.sent();
            // Update affected schedules
            return [4 /*yield*/, this.updateSchedulesForPolicy(policy)];
          case 2:
            // Update affected schedules
            _a.sent();
            this.emit("retention:policy_updated", { policy: policy });
            this.logActivity("user", "policy_updated", {
              policyId: policyId,
              updates: Object.keys(updates),
              updatedBy: updates.createdBy || "system",
            });
            return [2 /*return*/, policy];
        }
      });
    });
  };
  /**
   * Delete retention policy
   */
  DataRetentionManager.prototype.deletePolicy = function (policyId) {
    return __awaiter(this, void 0, void 0, function () {
      var policy, activeSchedules;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            policy = this.policies.get(policyId);
            if (!policy) {
              throw new Error("Policy not found");
            }
            activeSchedules = Array.from(this.schedules.values()).filter(
              (s) =>
                s.policyId === policyId && s.status !== "completed" && s.status !== "cancelled",
            );
            if (activeSchedules.length > 0) {
              throw new Error(
                "Cannot delete policy with ".concat(activeSchedules.length, " active schedules"),
              );
            }
            this.policies.delete(policyId);
            return [4 /*yield*/, this.removePolicyFromStorage(policyId)];
          case 1:
            _a.sent();
            this.logActivity("user", "policy_deleted", {
              policyId: policyId,
              category: policy.category,
            });
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Schedule data for retention
   */
  DataRetentionManager.prototype.scheduleDataRetention = function (
    dataIdentifier,
    dataLocation,
    category,
    creationDate,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var policy, triggerDate, scheduledDeletionDate, schedule, applicableHold;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            policy = this.findApplicablePolicy(category);
            if (!policy) {
              throw new Error("No retention policy found for category: ".concat(category));
            }
            triggerDate = this.calculateTriggerDate(creationDate, policy.trigger);
            scheduledDeletionDate = this.calculateDeletionDate(triggerDate, policy.retentionPeriod);
            schedule = {
              id: this.generateId("schedule"),
              policyId: policy.id,
              dataIdentifier: dataIdentifier,
              dataLocation: dataLocation,
              category: category,
              creationDate: creationDate,
              triggerDate: triggerDate,
              scheduledDeletionDate: scheduledDeletionDate,
              status: "scheduled",
              metadata: metadata || {},
              executionLog: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            applicableHold = this.findApplicableLegalHold(dataIdentifier, category);
            if (applicableHold) {
              schedule.status = "on_hold";
              schedule.legalHoldId = applicableHold.id;
            }
            this.schedules.set(schedule.id, schedule);
            return [4 /*yield*/, this.saveSchedule(schedule)];
          case 3:
            _a.sent();
            this.emit("retention:schedule_created", { schedule: schedule });
            this.logActivity("system", "schedule_created", {
              scheduleId: schedule.id,
              dataIdentifier: dataIdentifier,
              category: category,
              scheduledDeletionDate: scheduledDeletionDate,
              status: schedule.status,
            });
            return [2 /*return*/, schedule];
        }
      });
    });
  };
  /**
   * Create legal hold
   */
  DataRetentionManager.prototype.createLegalHold = function (holdData) {
    return __awaiter(this, void 0, void 0, function () {
      var hold, affectedSchedules, _i, affectedSchedules_1, schedule;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            hold = __assign(__assign({}, holdData), {
              id: this.generateId("hold"),
              affectedSchedules: [],
              notifications: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            affectedSchedules = Array.from(this.schedules.values()).filter(
              (s) =>
                (hold.dataCategories.includes(s.category) ||
                  hold.dataIdentifiers.includes(s.dataIdentifier)) &&
                s.status === "scheduled",
            );
            (_i = 0), (affectedSchedules_1 = affectedSchedules);
            _a.label = 3;
          case 3:
            if (!(_i < affectedSchedules_1.length)) return [3 /*break*/, 6];
            schedule = affectedSchedules_1[_i];
            schedule.status = "on_hold";
            schedule.legalHoldId = hold.id;
            hold.affectedSchedules.push(schedule.id);
            return [4 /*yield*/, this.saveSchedule(schedule)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            this.legalHolds.set(hold.id, hold);
            return [4 /*yield*/, this.saveLegalHold(hold)];
          case 7:
            _a.sent();
            if (!this.config.notificationEnabled) return [3 /*break*/, 9];
            return [4 /*yield*/, this.sendLegalHoldNotifications(hold, "creation")];
          case 8:
            _a.sent();
            _a.label = 9;
          case 9:
            this.emit("retention:legal_hold_created", { hold: hold });
            this.logActivity("user", "legal_hold_created", {
              holdId: hold.id,
              reason: hold.reason,
              affectedSchedules: hold.affectedSchedules.length,
              createdBy: hold.createdBy,
            });
            return [2 /*return*/, hold];
        }
      });
    });
  };
  /**
   * Release legal hold
   */
  DataRetentionManager.prototype.releaseLegalHold = function (holdId, releaseReason, releasedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var hold, _i, _a, scheduleId, schedule;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            hold = this.legalHolds.get(holdId);
            if (!hold) {
              throw new Error("Legal hold not found");
            }
            if (hold.status !== LegalHoldStatus.ACTIVE) {
              throw new Error("Legal hold is not active");
            }
            // Update hold status
            hold.status = LegalHoldStatus.RELEASED;
            hold.endDate = new Date();
            hold.updatedAt = new Date();
            (_i = 0), (_a = hold.affectedSchedules);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            scheduleId = _a[_i];
            schedule = this.schedules.get(scheduleId);
            if (!(schedule && schedule.status === "on_hold")) return [3 /*break*/, 3];
            schedule.status = "scheduled";
            schedule.legalHoldId = undefined;
            return [4 /*yield*/, this.saveSchedule(schedule)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [4 /*yield*/, this.saveLegalHold(hold)];
          case 5:
            _b.sent();
            if (!this.config.notificationEnabled) return [3 /*break*/, 7];
            return [4 /*yield*/, this.sendLegalHoldNotifications(hold, "release")];
          case 6:
            _b.sent();
            _b.label = 7;
          case 7:
            this.emit("retention:legal_hold_released", { hold: hold });
            this.logActivity("user", "legal_hold_released", {
              holdId: holdId,
              releaseReason: releaseReason,
              releasedBy: releasedBy,
              affectedSchedules: hold.affectedSchedules.length,
            });
            return [2 /*return*/, hold];
        }
      });
    });
  };
  /**
   * Process scheduled deletions
   */
  DataRetentionManager.prototype.processScheduledDeletions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        gracePeriod,
        readySchedules,
        processed,
        successful,
        failed,
        skipped,
        _i,
        readySchedules_1,
        schedule,
        hold,
        result,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            now = new Date();
            gracePeriod = new Date(
              now.getTime() - this.config.gracePeriodDays * 24 * 60 * 60 * 1000,
            );
            readySchedules = Array.from(this.schedules.values())
              .filter((s) => s.status === "scheduled" && s.scheduledDeletionDate <= gracePeriod)
              .sort((a, b) => a.scheduledDeletionDate.getTime() - b.scheduledDeletionDate.getTime())
              .slice(0, this.config.batchSize);
            processed = 0;
            successful = 0;
            failed = 0;
            skipped = 0;
            (_i = 0), (readySchedules_1 = readySchedules);
            _a.label = 3;
          case 3:
            if (!(_i < readySchedules_1.length)) return [3 /*break*/, 12];
            schedule = readySchedules_1[_i];
            processed++;
            _a.label = 4;
          case 4:
            _a.trys.push([4, 9, , 11]);
            hold = this.findApplicableLegalHold(schedule.dataIdentifier, schedule.category);
            if (!hold) return [3 /*break*/, 6];
            schedule.status = "on_hold";
            schedule.legalHoldId = hold.id;
            return [4 /*yield*/, this.saveSchedule(schedule)];
          case 5:
            _a.sent();
            skipped++;
            return [3 /*break*/, 11];
          case 6:
            return [4 /*yield*/, this.executeDataDeletion(schedule)];
          case 7:
            result = _a.sent();
            if (result.success) {
              schedule.status = "completed";
              schedule.actualDeletionDate = new Date();
              successful++;
              this.emit("retention:deletion_completed", { schedule: schedule });
            } else {
              schedule.status = "failed";
              failed++;
              this.emit("retention:deletion_failed", {
                schedule: schedule,
                error: result.error || "Unknown error",
              });
            }
            // Add execution log entry
            schedule.executionLog.push({
              timestamp: new Date(),
              action: "deletion_attempt",
              result: result.success ? "success" : "failure",
              details: result.details || "",
              executedBy: "system",
            });
            schedule.updatedAt = new Date();
            return [4 /*yield*/, this.saveSchedule(schedule)];
          case 8:
            _a.sent();
            return [3 /*break*/, 11];
          case 9:
            error_2 = _a.sent();
            failed++;
            schedule.status = "failed";
            schedule.executionLog.push({
              timestamp: new Date(),
              action: "deletion_attempt",
              result: "failure",
              details: String(error_2),
              executedBy: "system",
            });
            return [4 /*yield*/, this.saveSchedule(schedule)];
          case 10:
            _a.sent();
            this.logActivity("system", "deletion_error", {
              scheduleId: schedule.id,
              error: String(error_2),
            });
            return [3 /*break*/, 11];
          case 11:
            _i++;
            return [3 /*break*/, 3];
          case 12:
            this.logActivity("system", "deletion_batch_processed", {
              processed: processed,
              successful: successful,
              failed: failed,
              skipped: skipped,
              timestamp: new Date(),
            });
            return [
              2 /*return*/,
              { processed: processed, successful: successful, failed: failed, skipped: skipped },
            ];
        }
      });
    });
  };
  /**
   * Get retention policies
   */
  DataRetentionManager.prototype.getRetentionPolicies = function () {
    return Array.from(this.policies.values()).sort((a, b) => b.priority - a.priority);
  };
  /**
   * Get retention schedules
   */
  DataRetentionManager.prototype.getRetentionSchedules = function (filters) {
    var schedules = Array.from(this.schedules.values());
    if (filters) {
      if (filters.status) {
        schedules = schedules.filter((s) => s.status === filters.status);
      }
      if (filters.category) {
        schedules = schedules.filter((s) => s.category === filters.category);
      }
      if (filters.policyId) {
        schedules = schedules.filter((s) => s.policyId === filters.policyId);
      }
    }
    return schedules.sort(
      (a, b) => a.scheduledDeletionDate.getTime() - b.scheduledDeletionDate.getTime(),
    );
  };
  /**
   * Get legal holds
   */
  DataRetentionManager.prototype.getLegalHolds = function () {
    return Array.from(this.legalHolds.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  };
  /**
   * Generate retention report
   */
  DataRetentionManager.prototype.generateRetentionReport = function (
    reportType,
    period,
    generatedBy,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var schedules,
        policies,
        holds,
        summary,
        policyCompliance,
        legalHoldStats,
        exceptions,
        recommendations,
        report;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            schedules = Array.from(this.schedules.values()).filter(
              (s) => s.createdAt >= period.startDate && s.createdAt <= period.endDate,
            );
            policies = Array.from(this.policies.values());
            holds = Array.from(this.legalHolds.values()).filter(
              (h) => h.createdAt >= period.startDate && h.createdAt <= period.endDate,
            );
            summary = {
              totalPolicies: policies.length,
              activePolicies: policies.filter((p) => p.isActive).length,
              scheduledDeletions: schedules.filter((s) => s.status === "scheduled").length,
              completedDeletions: schedules.filter((s) => s.status === "completed").length,
              failedDeletions: schedules.filter((s) => s.status === "failed").length,
              onHoldDeletions: schedules.filter((s) => s.status === "on_hold").length,
              dataVolume: {
                scheduled: schedules
                  .filter((s) => s.status === "scheduled")
                  .reduce((sum, s) => sum + (s.metadata.dataSize || 0), 0),
                deleted: schedules
                  .filter((s) => s.status === "completed")
                  .reduce((sum, s) => sum + (s.metadata.dataSize || 0), 0),
                archived: schedules
                  .filter((s) => s.status === "completed" && s.metadata.archived)
                  .reduce((sum, s) => sum + (s.metadata.dataSize || 0), 0),
              },
            };
            policyCompliance = policies.map((policy) => {
              var policySchedules = schedules.filter((s) => s.policyId === policy.id);
              var completed = policySchedules.filter((s) => s.status === "completed");
              var failed = policySchedules.filter((s) => s.status === "failed");
              var processingTimes = completed
                .filter((s) => s.actualDeletionDate)
                .map((s) => s.actualDeletionDate.getTime() - s.scheduledDeletionDate.getTime());
              var averageProcessingTime =
                processingTimes.length > 0
                  ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
                  : 0;
              return {
                policyId: policy.id,
                policyName: policy.name,
                complianceRate:
                  policySchedules.length > 0
                    ? (completed.length / policySchedules.length) * 100
                    : 100,
                scheduledCount: policySchedules.length,
                completedCount: completed.length,
                failedCount: failed.length,
                averageProcessingTime: Math.round(averageProcessingTime / (1000 * 60 * 60 * 24)), // Convert to days
              };
            });
            legalHoldStats = {
              active: holds.filter((h) => h.status === LegalHoldStatus.ACTIVE).length,
              released: holds.filter((h) => h.status === LegalHoldStatus.RELEASED).length,
              affectedData: holds.reduce((sum, h) => sum + h.affectedSchedules.length, 0),
            };
            exceptions = [
              {
                type: "Failed Deletions",
                count: summary.failedDeletions,
                details: schedules
                  .filter((s) => s.status === "failed")
                  .map((s) => {
                    var _a;
                    return ""
                      .concat(s.dataIdentifier, ": ")
                      .concat(
                        ((_a = s.executionLog[s.executionLog.length - 1]) === null || _a === void 0
                          ? void 0
                          : _a.details) || "Unknown error",
                      );
                  }),
              },
              {
                type: "Overdue Deletions",
                count: schedules.filter(
                  (s) =>
                    s.status === "scheduled" &&
                    s.scheduledDeletionDate <
                      new Date(Date.now() - _this.config.gracePeriodDays * 24 * 60 * 60 * 1000),
                ).length,
                details: schedules
                  .filter(
                    (s) =>
                      s.status === "scheduled" &&
                      s.scheduledDeletionDate <
                        new Date(Date.now() - _this.config.gracePeriodDays * 24 * 60 * 60 * 1000),
                  )
                  .map((s) =>
                    ""
                      .concat(s.dataIdentifier, ": ")
                      .concat(
                        Math.floor(
                          (Date.now() - s.scheduledDeletionDate.getTime()) / (1000 * 60 * 60 * 24),
                        ),
                        " days overdue",
                      ),
                  ),
              },
            ];
            recommendations = this.generateRetentionRecommendations(
              summary,
              policyCompliance,
              exceptions,
            );
            report = {
              id: this.generateId("report"),
              reportType: reportType,
              period: period,
              summary: summary,
              policyCompliance: policyCompliance,
              legalHolds: legalHoldStats,
              exceptions: exceptions,
              recommendations: recommendations,
              generatedAt: new Date(),
              generatedBy: generatedBy,
            };
            return [4 /*yield*/, this.saveReport(report)];
          case 1:
            _a.sent();
            return [2 /*return*/, report];
        }
      });
    });
  };
  /**
   * Find applicable policy for data category
   */
  DataRetentionManager.prototype.findApplicablePolicy = function (category) {
    return Array.from(this.policies.values())
      .filter((p) => p.category === category && p.isActive)
      .sort((a, b) => b.priority - a.priority)[0];
  };
  /**
   * Find applicable legal hold
   */
  DataRetentionManager.prototype.findApplicableLegalHold = function (dataIdentifier, category) {
    return Array.from(this.legalHolds.values()).find(
      (h) =>
        h.status === LegalHoldStatus.ACTIVE &&
        (h.dataCategories.includes(category) || h.dataIdentifiers.includes(dataIdentifier)),
    );
  };
  /**
   * Calculate trigger date
   */
  DataRetentionManager.prototype.calculateTriggerDate = (creationDate, trigger) => {
    // For most triggers, the trigger date is the creation date
    // In a real implementation, this would be more sophisticated
    return creationDate;
  };
  /**
   * Calculate deletion date
   */
  DataRetentionManager.prototype.calculateDeletionDate = (triggerDate, retentionPeriod) => {
    var deletionDate = new Date(triggerDate);
    switch (retentionPeriod.unit) {
      case RetentionUnit.DAYS:
        deletionDate.setDate(deletionDate.getDate() + retentionPeriod.value);
        break;
      case RetentionUnit.WEEKS:
        deletionDate.setDate(deletionDate.getDate() + retentionPeriod.value * 7);
        break;
      case RetentionUnit.MONTHS:
        deletionDate.setMonth(deletionDate.getMonth() + retentionPeriod.value);
        break;
      case RetentionUnit.YEARS:
        deletionDate.setFullYear(deletionDate.getFullYear() + retentionPeriod.value);
        break;
    }
    return deletionDate;
  };
  /**
   * Execute data deletion
   */
  DataRetentionManager.prototype.executeDataDeletion = function (schedule) {
    return __awaiter(this, void 0, void 0, function () {
      var policy, _a, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (this.config.dryRunMode) {
              return [
                2 /*return*/,
                {
                  success: true,
                  details: "Dry run mode - deletion simulated",
                },
              ];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 15, , 16]);
            policy = this.policies.get(schedule.policyId);
            if (!policy) {
              throw new Error("Policy not found");
            }
            if (!(policy.archivalRequired && this.config.archivalEnabled)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.archiveData(schedule, policy)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            _a = policy.deletionMethod;
            switch (_a) {
              case DeletionMethod.SOFT_DELETE:
                return [3 /*break*/, 4];
              case DeletionMethod.HARD_DELETE:
                return [3 /*break*/, 6];
              case DeletionMethod.ANONYMIZATION:
                return [3 /*break*/, 8];
              case DeletionMethod.PSEUDONYMIZATION:
                return [3 /*break*/, 10];
              case DeletionMethod.ARCHIVAL:
                return [3 /*break*/, 12];
            }
            return [3 /*break*/, 14];
          case 4:
            return [4 /*yield*/, this.softDeleteData(schedule)];
          case 5:
            _b.sent();
            return [3 /*break*/, 14];
          case 6:
            return [4 /*yield*/, this.hardDeleteData(schedule)];
          case 7:
            _b.sent();
            return [3 /*break*/, 14];
          case 8:
            return [4 /*yield*/, this.anonymizeData(schedule)];
          case 9:
            _b.sent();
            return [3 /*break*/, 14];
          case 10:
            return [4 /*yield*/, this.pseudonymizeData(schedule)];
          case 11:
            _b.sent();
            return [3 /*break*/, 14];
          case 12:
            return [4 /*yield*/, this.archiveData(schedule, policy)];
          case 13:
            _b.sent();
            return [3 /*break*/, 14];
          case 14:
            return [
              2 /*return*/,
              {
                success: true,
                details: "Data ".concat(policy.deletionMethod, " completed successfully"),
              },
            ];
          case 15:
            error_3 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: String(error_3),
                details: "Failed to execute ".concat(schedule.category, " deletion"),
              },
            ];
          case 16:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Archive data
   */
  DataRetentionManager.prototype.archiveData = function (schedule, policy) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // In a real implementation, this would archive the data
        // For now, we'll just mark it as archived
        schedule.metadata.archived = true;
        schedule.metadata.archiveLocation = policy.archivalLocation || "default_archive";
        schedule.metadata.archiveDate = new Date();
        return [2 /*return*/];
      });
    });
  };
  /**
   * Soft delete data
   */
  DataRetentionManager.prototype.softDeleteData = function (schedule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // In a real implementation, this would mark data as deleted
        // For now, we'll just simulate
        schedule.metadata.softDeleted = true;
        return [2 /*return*/];
      });
    });
  };
  /**
   * Hard delete data
   */
  DataRetentionManager.prototype.hardDeleteData = function (schedule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // In a real implementation, this would permanently delete data
        // For now, we'll just simulate
        schedule.metadata.hardDeleted = true;
        return [2 /*return*/];
      });
    });
  };
  /**
   * Anonymize data
   */
  DataRetentionManager.prototype.anonymizeData = function (schedule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // In a real implementation, this would anonymize the data
        // For now, we'll just simulate
        schedule.metadata.anonymized = true;
        return [2 /*return*/];
      });
    });
  };
  /**
   * Pseudonymize data
   */
  DataRetentionManager.prototype.pseudonymizeData = function (schedule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // In a real implementation, this would pseudonymize the data
        // For now, we'll just simulate
        schedule.metadata.pseudonymized = true;
        return [2 /*return*/];
      });
    });
  };
  /**
   * Validate policy
   */
  DataRetentionManager.prototype.validatePolicy = (policy) => {
    if (!policy.name || policy.name.trim().length === 0) {
      throw new Error("Policy name is required");
    }
    if (policy.retentionPeriod.value <= 0) {
      throw new Error("Retention period must be positive");
    }
    if (!policy.effectiveDate) {
      throw new Error("Effective date is required");
    }
    if (policy.expirationDate && policy.expirationDate <= policy.effectiveDate) {
      throw new Error("Expiration date must be after effective date");
    }
  };
  /**
   * Create schedules for policy
   */
  DataRetentionManager.prototype.createSchedulesForPolicy = function (policy) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would find existing data and create schedules
        // For now, we'll just log the action
        this.logActivity("system", "schedules_created_for_policy", {
          policyId: policy.id,
          category: policy.category,
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Update schedules for policy
   */
  DataRetentionManager.prototype.updateSchedulesForPolicy = function (policy) {
    return __awaiter(this, void 0, void 0, function () {
      var affectedSchedules, _i, affectedSchedules_2, schedule, newDeletionDate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            affectedSchedules = Array.from(this.schedules.values()).filter(
              (s) => s.policyId === policy.id && s.status === "scheduled",
            );
            (_i = 0), (affectedSchedules_2 = affectedSchedules);
            _a.label = 1;
          case 1:
            if (!(_i < affectedSchedules_2.length)) return [3 /*break*/, 4];
            schedule = affectedSchedules_2[_i];
            newDeletionDate = this.calculateDeletionDate(
              schedule.triggerDate,
              policy.retentionPeriod,
            );
            schedule.scheduledDeletionDate = newDeletionDate;
            schedule.updatedAt = new Date();
            return [4 /*yield*/, this.saveSchedule(schedule)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            this.logActivity("system", "schedules_updated_for_policy", {
              policyId: policy.id,
              affectedSchedules: affectedSchedules.length,
            });
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send legal hold notifications
   */
  DataRetentionManager.prototype.sendLegalHoldNotifications = function (hold, type) {
    return __awaiter(this, void 0, void 0, function () {
      var notification;
      return __generator(this, function (_a) {
        notification = {
          timestamp: new Date(),
          recipient: hold.custodian,
          type: type,
          status: "sent",
        };
        hold.notifications.push(notification);
        this.logActivity("system", "legal_hold_notification_sent", {
          holdId: hold.id,
          type: type,
          recipient: hold.custodian,
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Generate retention recommendations
   */
  DataRetentionManager.prototype.generateRetentionRecommendations = (
    summary,
    policyCompliance,
    exceptions,
  ) => {
    var recommendations = [];
    // Check for failed deletions
    if (summary.failedDeletions > 0) {
      recommendations.push(
        "Review and resolve ".concat(
          summary.failedDeletions,
          " failed deletion(s) to maintain compliance",
        ),
      );
    }
    // Check for low compliance rates
    var lowCompliancePolicies = policyCompliance.filter((p) => p.complianceRate < 90);
    if (lowCompliancePolicies.length > 0) {
      recommendations.push(
        "Investigate ".concat(
          lowCompliancePolicies.length,
          " policy(ies) with compliance rates below 90%",
        ),
      );
    }
    // Check for long processing times
    var slowPolicies = policyCompliance.filter((p) => p.averageProcessingTime > 7);
    if (slowPolicies.length > 0) {
      recommendations.push(
        "Optimize processing for ".concat(
          slowPolicies.length,
          " policy(ies) with average processing time > 7 days",
        ),
      );
    }
    // Check for overdue deletions
    var overdueException = exceptions.find((e) => e.type === "Overdue Deletions");
    if (overdueException && overdueException.count > 0) {
      recommendations.push(
        "Address ".concat(
          overdueException.count,
          " overdue deletion(s) to prevent compliance violations",
        ),
      );
    }
    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        "Retention policies are performing well. Continue monitoring for optimal compliance.",
      );
    }
    return recommendations;
  };
  /**
   * Start processing interval
   */
  DataRetentionManager.prototype.startProcessingInterval = function () {
    this.processingInterval = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.processScheduledDeletions()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
      this.config.processingIntervalHours * 60 * 60 * 1000,
    );
  };
  /**
   * Start review interval
   */
  DataRetentionManager.prototype.startReviewInterval = function () {
    this.reviewInterval = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.performPeriodicReview()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
      this.config.reviewIntervalDays * 24 * 60 * 60 * 1000,
    );
  };
  /**
   * Perform periodic review
   */
  DataRetentionManager.prototype.performPeriodicReview = function () {
    return __awaiter(this, void 0, void 0, function () {
      var activeHolds, _i, activeHolds_1, hold, outdatedPolicies, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            activeHolds = Array.from(this.legalHolds.values()).filter(
              (h) => h.status === LegalHoldStatus.ACTIVE,
            );
            (_i = 0), (activeHolds_1 = activeHolds);
            _a.label = 1;
          case 1:
            if (!(_i < activeHolds_1.length)) return [3 /*break*/, 6];
            hold = activeHolds_1[_i];
            if (!(hold.reviewDate <= new Date())) return [3 /*break*/, 5];
            if (!this.config.notificationEnabled) return [3 /*break*/, 3];
            return [4 /*yield*/, this.sendLegalHoldNotifications(hold, "reminder")];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Update next review date
            hold.reviewDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
            return [4 /*yield*/, this.saveLegalHold(hold)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            outdatedPolicies = Array.from(this.policies.values()).filter((p) => {
              var lastUpdate = p.updatedAt;
              var updateThreshold = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year
              return lastUpdate < updateThreshold;
            });
            if (outdatedPolicies.length > 0) {
              this.emit("retention:compliance_alert", {
                alert: "".concat(
                  outdatedPolicies.length,
                  " retention policies may need review (not updated in over 1 year)",
                ),
                details: {
                  policies: outdatedPolicies.map((p) => ({
                    id: p.id,
                    name: p.name,
                    lastUpdate: p.updatedAt,
                  })),
                  timestamp: new Date(),
                },
              });
            }
            this.logActivity("system", "periodic_review_completed", {
              activeHolds: activeHolds.length,
              outdatedPolicies: outdatedPolicies.length,
              timestamp: new Date(),
            });
            return [3 /*break*/, 8];
          case 7:
            error_4 = _a.sent();
            this.logActivity("system", "periodic_review_error", {
              error: String(error_4),
              timestamp: new Date(),
            });
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Load policies
   */
  DataRetentionManager.prototype.loadPolicies = function () {
    return __awaiter(this, void 0, void 0, function () {
      var samplePolicies, _i, samplePolicies_1, policy;
      return __generator(this, function (_a) {
        samplePolicies = [
          {
            id: "policy_user_profile",
            name: "User Profile Data Retention",
            description: {
              pt: "Política de retenção para dados de perfil de usuário",
              en: "Retention policy for user profile data",
            },
            category: DataCategory.USER_PROFILE,
            retentionPeriod: { value: 5, unit: RetentionUnit.YEARS },
            trigger: RetentionTrigger.ACCOUNT_CLOSURE,
            deletionMethod: DeletionMethod.ANONYMIZATION,
            isActive: true,
            priority: 100,
            exceptions: {
              legalBasis: ["legitimate_interest", "legal_obligation"],
              conditions: ["active_legal_proceedings", "regulatory_investigation"],
              extendedPeriod: { value: 7, unit: RetentionUnit.YEARS },
            },
            archivalRequired: true,
            archivalLocation: "secure_archive",
            notificationRequired: true,
            notificationRecipients: ["dpo@neonpro.com"],
            complianceNotes: "Complies with LGPD Article 16",
            createdBy: "system",
            approvedBy: "dpo@neonpro.com",
            createdAt: new Date(),
            updatedAt: new Date(),
            effectiveDate: new Date(),
          },
          {
            id: "policy_session_data",
            name: "Session Data Retention",
            description: {
              pt: "Política de retenção para dados de sessão",
              en: "Retention policy for session data",
            },
            category: DataCategory.SESSION_DATA,
            retentionPeriod: { value: 30, unit: RetentionUnit.DAYS },
            trigger: RetentionTrigger.LAST_ACCESS,
            deletionMethod: DeletionMethod.HARD_DELETE,
            isActive: true,
            priority: 50,
            exceptions: {
              legalBasis: [],
              conditions: [],
            },
            archivalRequired: false,
            notificationRequired: false,
            complianceNotes: "Short retention for security purposes",
            createdBy: "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            effectiveDate: new Date(),
          },
        ];
        for (_i = 0, samplePolicies_1 = samplePolicies; _i < samplePolicies_1.length; _i++) {
          policy = samplePolicies_1[_i];
          this.policies.set(policy.id, policy);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load schedules
   */
  DataRetentionManager.prototype.loadSchedules = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  /**
   * Load legal holds
   */
  DataRetentionManager.prototype.loadLegalHolds = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  /**
   * Save policy
   */
  DataRetentionManager.prototype.savePolicy = function (policy) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        this.policies.set(policy.id, policy);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save schedule
   */
  DataRetentionManager.prototype.saveSchedule = function (schedule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        this.schedules.set(schedule.id, schedule);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save legal hold
   */
  DataRetentionManager.prototype.saveLegalHold = function (hold) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would save to database
        this.legalHolds.set(hold.id, hold);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save report
   */
  DataRetentionManager.prototype.saveReport = function (report) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  /**
   * Remove policy from storage
   */
  DataRetentionManager.prototype.removePolicyFromStorage = function (policyId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  /**
   * Log activity
   */
  DataRetentionManager.prototype.logActivity = (actor, action, details) => {
    // In a real implementation, this would log to audit trail
    console.log("[Retention] ".concat(actor, " - ").concat(action, ":"), details);
  };
  /**
   * Generate ID
   */
  DataRetentionManager.prototype.generateId = (prefix) =>
    "".concat(prefix, "_").concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  /**
   * Shutdown the retention manager
   */
  DataRetentionManager.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.processingInterval) {
          clearInterval(this.processingInterval);
          this.processingInterval = null;
        }
        if (this.reviewInterval) {
          clearInterval(this.reviewInterval);
          this.reviewInterval = null;
        }
        this.removeAllListeners();
        this.isInitialized = false;
        this.logActivity("system", "retention_manager_shutdown", {
          timestamp: new Date(),
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Health check
   */
  DataRetentionManager.prototype.getHealthStatus = function () {
    var issues = [];
    if (!this.isInitialized) {
      issues.push("Retention manager not initialized");
    }
    if (!this.processingInterval) {
      issues.push("Processing interval not running");
    }
    if (!this.reviewInterval) {
      issues.push("Review interval not running");
    }
    var activePolicies = Array.from(this.policies.values()).filter((p) => p.isActive);
    if (activePolicies.length === 0) {
      issues.push("No active retention policies");
    }
    var failedSchedules = Array.from(this.schedules.values()).filter(
      (s) => s.status === "failed",
    ).length;
    if (failedSchedules > 10) {
      issues.push("High number of failed schedules: ".concat(failedSchedules));
    }
    var status = issues.length === 0 ? "healthy" : issues.length <= 2 ? "degraded" : "unhealthy";
    return {
      status: status,
      details: {
        initialized: this.isInitialized,
        policiesCount: this.policies.size,
        activePolicies: activePolicies.length,
        schedulesCount: this.schedules.size,
        failedSchedules: failedSchedules,
        legalHoldsCount: this.legalHolds.size,
        issues: issues,
      },
    };
  };
  return DataRetentionManager;
})(events_1.EventEmitter);
exports.DataRetentionManager = DataRetentionManager;
/**
 * Default data retention manager instance
 */
exports.dataRetentionManager = new DataRetentionManager();
