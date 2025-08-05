"use strict";
/**
 * Session Preservation System
 * Story 1.4 - Task 7: Preserve session data during interruptions
 *
 * Features:
 * - Automatic session state backup
 * - Recovery from interruptions
 * - Data persistence strategies
 * - Progressive data saving
 * - Recovery validation
 * - Cleanup of expired backups
 */
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
exports.SessionPreservation = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var security_audit_logger_1 = require("./security-audit-logger");
var DEFAULT_CONFIG = {
  enabled: true,
  autoBackupInterval: 300, // 5 minutes
  maxBackupsPerSession: 10,
  backupRetentionDays: 7,
  compressionEnabled: true,
  encryptionEnabled: true,
  emergencyBackupTriggers: ["error", "logout", "shutdown", "network_loss"],
  preservationPriority: {
    formData: "high",
    unsavedChanges: "high",
    userPreferences: "medium",
    applicationState: "low",
  },
  recoveryValidation: {
    checksumValidation: true,
    dataIntegrityCheck: true,
    securityValidation: true,
    timeoutThreshold: 30,
  },
  cleanupSchedule: {
    enabled: true,
    frequency: 24, // daily
    maxAge: 7, // 7 days
  },
};
var SessionPreservation = /** @class */ (function () {
  function SessionPreservation(supabaseUrl, supabaseKey, customConfig) {
    this.activeBackups = new Map();
    this.isBackupInProgress = false;
    this.recoveryCache = new Map();
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = new security_audit_logger_1.SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.config = __assign(__assign({}, DEFAULT_CONFIG), customConfig);
    if (this.config.enabled) {
      this.initialize();
    }
  }
  /**
   * Initialize session preservation system
   */
  SessionPreservation.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Load existing backups
            return [4 /*yield*/, this.loadActiveBackups()];
          case 1:
            // Load existing backups
            _a.sent();
            // Start backup interval
            this.startBackupInterval();
            // Start cleanup interval
            if (this.config.cleanupSchedule.enabled) {
              this.startCleanupInterval();
            }
            // Set up event listeners
            this.setupEventListeners();
            console.log("Session preservation system initialized");
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Failed to initialize session preservation:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update current session state
   */
  SessionPreservation.prototype.updateSessionState = function (sessionId, stateUpdates) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            if (!(!this.currentSessionState || this.currentSessionState.sessionId !== sessionId))
              return [3 /*break*/, 2];
            // Load or create session state
            _a = this;
            return [4 /*yield*/, this.getOrCreateSessionState(sessionId)];
          case 1:
            // Load or create session state
            _a.currentSessionState = _b.sent();
            _b.label = 2;
          case 2:
            // Update application state
            this.currentSessionState.applicationState = __assign(
              __assign({}, this.currentSessionState.applicationState),
              stateUpdates,
            );
            // Update metadata
            this.currentSessionState.metadata.lastUpdatedAt = new Date();
            this.currentSessionState.metadata.version++;
            this.currentSessionState.metadata.checksum = this.calculateChecksum(
              this.currentSessionState,
            );
            if (!this.shouldTriggerBackup(stateUpdates)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.createBackup(sessionId, "automatic", "activity")];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_2 = _b.sent();
            console.error("Failed to update session state:", error_2);
            throw error_2;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create session backup
   */
  SessionPreservation.prototype.createBackup = function (sessionId_1) {
    return __awaiter(this, arguments, void 0, function (sessionId, backupType, trigger) {
      var sessionState, _a, backup, backupData, sessionBackups, oldestBackup, error_3;
      if (backupType === void 0) {
        backupType = "automatic";
      }
      if (trigger === void 0) {
        trigger = "interval";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 11, 12, 13]);
            if (this.isBackupInProgress) {
              console.log("Backup already in progress, skipping");
              return [2 /*return*/, null];
            }
            this.isBackupInProgress = true;
            _a = this.currentSessionState;
            if (_a) return [3 /*break*/, 2];
            return [4 /*yield*/, this.getOrCreateSessionState(sessionId)];
          case 1:
            _a = _b.sent();
            _b.label = 2;
          case 2:
            sessionState = _a;
            backup = {
              backupId: "backup_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              sessionId: sessionId,
              userId: sessionState.userId,
              backupType: backupType,
              backupTrigger: trigger,
              sessionState: __assign({}, sessionState),
              createdAt: new Date(),
              expiresAt: new Date(
                Date.now() + this.config.backupRetentionDays * 24 * 60 * 60 * 1000,
              ),
              isCompressed: this.config.compressionEnabled,
              isEncrypted: this.config.encryptionEnabled,
              size: 0,
              checksum: "",
              recoveryPriority: this.determineRecoveryPriority(sessionState),
              metadata: {
                trigger: trigger,
                backupType: backupType,
                createdBy: "session_preservation_system",
              },
            };
            backupData = JSON.stringify(backup.sessionState);
            if (!backup.isCompressed) return [3 /*break*/, 4];
            return [4 /*yield*/, this.compressData(backupData)];
          case 3:
            backupData = _b.sent();
            _b.label = 4;
          case 4:
            if (!backup.isEncrypted) return [3 /*break*/, 6];
            return [4 /*yield*/, this.encryptData(backupData)];
          case 5:
            backupData = _b.sent();
            _b.label = 6;
          case 6:
            backup.size = backupData.length;
            backup.checksum = this.calculateChecksum(backup.sessionState);
            // Store backup
            return [4 /*yield*/, this.storeBackup(backup, backupData)];
          case 7:
            // Store backup
            _b.sent();
            sessionBackups = this.activeBackups.get(sessionId) || [];
            sessionBackups.push(backup);
            if (!(sessionBackups.length > this.config.maxBackupsPerSession))
              return [3 /*break*/, 9];
            oldestBackup = sessionBackups.shift();
            if (!oldestBackup) return [3 /*break*/, 9];
            return [4 /*yield*/, this.deleteBackup(oldestBackup.backupId)];
          case 8:
            _b.sent();
            _b.label = 9;
          case 9:
            this.activeBackups.set(sessionId, sessionBackups);
            // Log backup creation
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "session_backup_created",
                userId: sessionState.userId,
                metadata: {
                  sessionId: sessionId,
                  backupId: backup.backupId,
                  backupType: backupType,
                  trigger: trigger,
                  size: backup.size,
                },
              }),
            ];
          case 10:
            // Log backup creation
            _b.sent();
            return [2 /*return*/, backup];
          case 11:
            error_3 = _b.sent();
            console.error("Failed to create backup:", error_3);
            throw error_3;
          case 12:
            this.isBackupInProgress = false;
            return [7 /*endfinally*/];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Recover session from backup
   */
  SessionPreservation.prototype.recoverSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        cachedResult,
        backups,
        sortedBackups,
        recoveryResult,
        errors,
        warnings,
        _i,
        sortedBackups_1,
        backup,
        result,
        error_4,
        error_5;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 11, , 12]);
            startTime = Date.now();
            cachedResult = this.recoveryCache.get(sessionId);
            if (cachedResult && Date.now() - cachedResult.recoveryTime.getTime() < 60000) {
              return [2 /*return*/, cachedResult];
            }
            return [4 /*yield*/, this.getSessionBackups(sessionId)];
          case 1:
            backups = _c.sent();
            if (backups.length === 0) {
              return [
                2 /*return*/,
                {
                  success: false,
                  recoveredData: {
                    formData: {},
                    unsavedChanges: {},
                    userPreferences: {},
                    applicationState: {},
                  },
                  recoverySource: "memory",
                  recoveryTime: new Date(),
                  dataIntegrity: {
                    checksumValid: false,
                    dataComplete: false,
                    corruptedFields: [],
                    recoveredFields: [],
                  },
                  warnings: ["No backups found for session"],
                  errors: [],
                },
              ];
            }
            sortedBackups = this.sortBackupsByPriority(backups);
            recoveryResult = null;
            errors = [];
            warnings = [];
            (_i = 0), (sortedBackups_1 = sortedBackups);
            _c.label = 2;
          case 2:
            if (!(_i < sortedBackups_1.length)) return [3 /*break*/, 7];
            backup = sortedBackups_1[_i];
            _c.label = 3;
          case 3:
            _c.trys.push([3, 5, , 6]);
            return [4 /*yield*/, this.recoverFromBackup(backup)];
          case 4:
            result = _c.sent();
            if (result.success) {
              recoveryResult = result;
              return [3 /*break*/, 7];
            } else {
              warnings.push(
                "Failed to recover from backup "
                  .concat(backup.backupId, ": ")
                  .concat(result.errors.join(", ")),
              );
            }
            return [3 /*break*/, 6];
          case 5:
            error_4 = _c.sent();
            errors.push(
              "Error recovering from backup ".concat(backup.backupId, ": ").concat(error_4.message),
            );
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 2];
          case 7:
            if (!!recoveryResult) return [3 /*break*/, 9];
            return [4 /*yield*/, this.recoverFromAlternativeSources(sessionId)];
          case 8:
            recoveryResult = _c.sent();
            warnings.push("Primary backup recovery failed, using alternative sources");
            _c.label = 9;
          case 9:
            // Add any accumulated warnings and errors
            (_a = recoveryResult.warnings).push.apply(_a, warnings);
            (_b = recoveryResult.errors).push.apply(_b, errors);
            // Cache result
            this.recoveryCache.set(sessionId, recoveryResult);
            // Log recovery attempt
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "session_recovery_attempted",
                metadata: {
                  sessionId: sessionId,
                  success: recoveryResult.success,
                  recoverySource: recoveryResult.recoverySource,
                  recoveryTime: Date.now() - startTime,
                  backupsAttempted: sortedBackups.length,
                },
              }),
            ];
          case 10:
            // Log recovery attempt
            _c.sent();
            return [2 /*return*/, recoveryResult];
          case 11:
            error_5 = _c.sent();
            console.error("Failed to recover session:", error_5);
            return [
              2 /*return*/,
              {
                success: false,
                recoveredData: {
                  formData: {},
                  unsavedChanges: {},
                  userPreferences: {},
                  applicationState: {},
                },
                recoverySource: "memory",
                recoveryTime: new Date(),
                dataIntegrity: {
                  checksumValid: false,
                  dataComplete: false,
                  corruptedFields: [],
                  recoveredFields: [],
                },
                warnings: [],
                errors: [error_5.message],
              },
            ];
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create emergency backup
   */
  SessionPreservation.prototype.createEmergencyBackup = function (sessionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var backup, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.createBackup(sessionId, "emergency", "error")];
          case 1:
            backup = _a.sent();
            // Mark as high priority
            backup.recoveryPriority = "critical";
            backup.metadata.emergencyReason = reason;
            backup.metadata.emergencyTimestamp = new Date().toISOString();
            // Update stored backup
            return [4 /*yield*/, this.updateBackupMetadata(backup.backupId, backup.metadata)];
          case 2:
            // Update stored backup
            _a.sent();
            console.log(
              "Emergency backup created for session ".concat(sessionId, ": ").concat(reason),
            );
            return [2 /*return*/, backup];
          case 3:
            error_6 = _a.sent();
            console.error("Failed to create emergency backup:", error_6);
            throw error_6;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session backups
   */
  SessionPreservation.prototype.getSessionBackups = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_backups")
                .select("*")
                .eq("session_id", sessionId)
                .gte("expires_at", new Date().toISOString())
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get session backups: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToBackup)];
          case 2:
            error_7 = _b.sent();
            console.error("Failed to get session backups:", error_7);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete session backup
   */
  SessionPreservation.prototype.deleteBackup = function (backupId) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, sessionId, backups, filteredBackups, error_8;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            // Delete from database
            return [
              4 /*yield*/,
              this.supabase.from("session_backups").delete().eq("backup_id", backupId),
            ];
          case 1:
            // Delete from database
            _c.sent();
            // Remove from active backups
            for (_i = 0, _a = this.activeBackups; _i < _a.length; _i++) {
              (_b = _a[_i]), (sessionId = _b[0]), (backups = _b[1]);
              filteredBackups = backups.filter(function (b) {
                return b.backupId !== backupId;
              });
              if (filteredBackups.length !== backups.length) {
                this.activeBackups.set(sessionId, filteredBackups);
                break;
              }
            }
            return [3 /*break*/, 3];
          case 2:
            error_8 = _c.sent();
            console.error("Failed to delete backup:", error_8);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up expired backups
   */
  SessionPreservation.prototype.cleanupExpiredBackups = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _a, expiredBackups, error, deletedCount, _i, _b, backup, error_9;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 7]);
            now = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("session_backups")
                .select("backup_id")
                .lt("expires_at", now.toISOString()),
            ];
          case 1:
            (_a = _c.sent()), (expiredBackups = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get expired backups:", error);
              return [2 /*return*/, 0];
            }
            deletedCount = 0;
            (_i = 0), (_b = expiredBackups || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 5];
            backup = _b[_i];
            return [4 /*yield*/, this.deleteBackup(backup.backup_id)];
          case 3:
            _c.sent();
            deletedCount++;
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            console.log("Cleaned up ".concat(deletedCount, " expired backups"));
            return [2 /*return*/, deletedCount];
          case 6:
            error_9 = _c.sent();
            console.error("Failed to cleanup expired backups:", error_9);
            return [2 /*return*/, 0];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update preservation configuration
   */
  SessionPreservation.prototype.updateConfig = function (newConfig) {
    this.config = __assign(__assign({}, this.config), newConfig);
    // Restart intervals if needed
    if (this.config.enabled && !this.backupInterval) {
      this.startBackupInterval();
    } else if (!this.config.enabled && this.backupInterval) {
      this.stopPreservation();
    }
  };
  /**
   * Stop session preservation
   */
  SessionPreservation.prototype.stopPreservation = function () {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = undefined;
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    console.log("Session preservation stopped");
  };
  // Private methods
  SessionPreservation.prototype.loadActiveBackups = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, _i, _b, backupData, backup, sessionBackups, error_10;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_backups")
                .select("*")
                .gte("expires_at", new Date().toISOString())
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to load active backups:", error);
              return [2 /*return*/];
            }
            // Group backups by session
            for (_i = 0, _b = data || []; _i < _b.length; _i++) {
              backupData = _b[_i];
              backup = this.mapDatabaseToBackup(backupData);
              sessionBackups = this.activeBackups.get(backup.sessionId) || [];
              sessionBackups.push(backup);
              this.activeBackups.set(backup.sessionId, sessionBackups);
            }
            return [3 /*break*/, 3];
          case 2:
            error_10 = _c.sent();
            console.error("Failed to load active backups:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservation.prototype.startBackupInterval = function () {
    var _this = this;
    this.backupInterval = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_11;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              if (!(this.currentSessionState && !this.isBackupInProgress)) return [3 /*break*/, 2];
              return [
                4 /*yield*/,
                this.createBackup(this.currentSessionState.sessionId, "automatic", "interval"),
              ];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              return [3 /*break*/, 4];
            case 3:
              error_11 = _a.sent();
              console.error("Backup interval processing failed:", error_11);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    }, this.config.autoBackupInterval * 1000);
  };
  SessionPreservation.prototype.startCleanupInterval = function () {
    var _this = this;
    this.cleanupInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          var error_12;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.cleanupExpiredBackups()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_12 = _a.sent();
                console.error("Cleanup interval processing failed:", error_12);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      },
      this.config.cleanupSchedule.frequency * 60 * 60 * 1000,
    ); // Convert hours to milliseconds
  };
  SessionPreservation.prototype.setupEventListeners = function () {
    var _this = this;
    // Listen for page unload events
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (!this.currentSessionState) return [3 /*break*/, 2];
                return [
                  4 /*yield*/,
                  this.createEmergencyBackup(this.currentSessionState.sessionId, "page_unload"),
                ];
              case 1:
                _a.sent();
                _a.label = 2;
              case 2:
                return [2 /*return*/];
            }
          });
        });
      });
      // Listen for network status changes
      window.addEventListener("offline", function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (!this.currentSessionState) return [3 /*break*/, 2];
                return [
                  4 /*yield*/,
                  this.createEmergencyBackup(this.currentSessionState.sessionId, "network_loss"),
                ];
              case 1:
                _a.sent();
                _a.label = 2;
              case 2:
                return [2 /*return*/];
            }
          });
        });
      });
    }
  };
  SessionPreservation.prototype.getOrCreateSessionState = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, newSessionState, error_13;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("session_states").select("*").eq("session_id", sessionId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (data && !error) {
              return [2 /*return*/, this.mapDatabaseToSessionState(data)];
            }
            newSessionState = {
              sessionId: sessionId,
              userId: "", // Will be set when user logs in
              userRole: "patient",
              deviceId: "",
              applicationState: {
                currentRoute: "/",
                formData: {},
                unsavedChanges: {},
                temporaryData: {},
                userPreferences: {},
                uiState: {},
              },
              authenticationState: {
                accessToken: "",
                refreshToken: "",
                tokenExpiresAt: new Date(),
                permissions: [],
                lastAuthAt: new Date(),
              },
              securityContext: {
                ipAddress: "",
                userAgent: "",
                deviceFingerprint: "",
                securityLevel: "medium",
                riskScore: 0,
                lastSecurityCheck: new Date(),
              },
              metadata: {
                createdAt: new Date(),
                lastUpdatedAt: new Date(),
                version: 1,
                checksum: "",
                compressionEnabled: this.config.compressionEnabled,
                encryptionEnabled: this.config.encryptionEnabled,
                backupCount: 0,
              },
            };
            newSessionState.metadata.checksum = this.calculateChecksum(newSessionState);
            return [2 /*return*/, newSessionState];
          case 2:
            error_13 = _b.sent();
            console.error("Failed to get or create session state:", error_13);
            throw error_13;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservation.prototype.shouldTriggerBackup = function (stateUpdates) {
    // Check if updates contain high-priority data
    var highPriorityFields = ["formData", "unsavedChanges"];
    for (
      var _i = 0, highPriorityFields_1 = highPriorityFields;
      _i < highPriorityFields_1.length;
      _i++
    ) {
      var field = highPriorityFields_1[_i];
      if (stateUpdates[field] && Object.keys(stateUpdates[field]).length > 0) {
        return true;
      }
    }
    return false;
  };
  SessionPreservation.prototype.determineRecoveryPriority = function (sessionState) {
    // Determine priority based on data content
    var hasFormData = Object.keys(sessionState.applicationState.formData || {}).length > 0;
    var hasUnsavedChanges =
      Object.keys(sessionState.applicationState.unsavedChanges || {}).length > 0;
    if (hasFormData || hasUnsavedChanges) {
      return "high";
    }
    var hasUserPreferences =
      Object.keys(sessionState.applicationState.userPreferences || {}).length > 0;
    if (hasUserPreferences) {
      return "medium";
    }
    return "low";
  };
  SessionPreservation.prototype.compressData = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simple compression simulation (in production, use proper compression)
        return [2 /*return*/, Buffer.from(data).toString("base64")];
      });
    });
  };
  SessionPreservation.prototype.encryptData = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simple encryption simulation (in production, use proper encryption)
        return [2 /*return*/, Buffer.from(data).toString("base64")];
      });
    });
  };
  SessionPreservation.prototype.storeBackup = function (backup, backupData) {
    return __awaiter(this, void 0, void 0, function () {
      var error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("session_backups").insert({
                backup_id: backup.backupId,
                session_id: backup.sessionId,
                user_id: backup.userId,
                backup_type: backup.backupType,
                backup_trigger: backup.backupTrigger,
                backup_data: backupData,
                created_at: backup.createdAt.toISOString(),
                expires_at: backup.expiresAt.toISOString(),
                is_compressed: backup.isCompressed,
                is_encrypted: backup.isEncrypted,
                size: backup.size,
                checksum: backup.checksum,
                recovery_priority: backup.recoveryPriority,
                metadata: backup.metadata,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_14 = _a.sent();
            console.error("Failed to store backup:", error_14);
            throw error_14;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservation.prototype.updateBackupMetadata = function (backupId, metadata) {
    return __awaiter(this, void 0, void 0, function () {
      var error_15;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_backups")
                .update({ metadata: metadata })
                .eq("backup_id", backupId),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_15 = _a.sent();
            console.error("Failed to update backup metadata:", error_15);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservation.prototype.sortBackupsByPriority = function (backups) {
    var priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return backups.sort(function (a, b) {
      // First sort by priority
      var priorityDiff = priorityOrder[b.recoveryPriority] - priorityOrder[a.recoveryPriority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      // Then by creation time (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };
  SessionPreservation.prototype.recoverFromBackup = function (backup) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, backupData, error, sessionData, sessionState, dataIntegrity, recoveredData, error_16;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_backups")
                .select("backup_data")
                .eq("backup_id", backup.backupId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (backupData = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get backup data: ".concat(error.message));
            }
            sessionData = backupData.backup_data;
            if (!backup.isEncrypted) return [3 /*break*/, 3];
            return [4 /*yield*/, this.decryptData(sessionData)];
          case 2:
            sessionData = _b.sent();
            _b.label = 3;
          case 3:
            if (!backup.isCompressed) return [3 /*break*/, 5];
            return [4 /*yield*/, this.decompressData(sessionData)];
          case 4:
            sessionData = _b.sent();
            _b.label = 5;
          case 5:
            sessionState = JSON.parse(sessionData);
            return [4 /*yield*/, this.validateDataIntegrity(sessionState, backup.checksum)];
          case 6:
            dataIntegrity = _b.sent();
            if (!dataIntegrity.checksumValid && this.config.recoveryValidation.checksumValidation) {
              throw new Error("Checksum validation failed");
            }
            recoveredData = {
              formData: sessionState.applicationState.formData || {},
              unsavedChanges: sessionState.applicationState.unsavedChanges || {},
              userPreferences: sessionState.applicationState.userPreferences || {},
              applicationState: sessionState.applicationState || {},
            };
            return [
              2 /*return*/,
              {
                success: true,
                sessionState: sessionState,
                recoveredData: recoveredData,
                recoverySource: "latest_backup",
                recoveryTime: new Date(),
                dataIntegrity: dataIntegrity,
                warnings: [],
                errors: [],
              },
            ];
          case 7:
            error_16 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                recoveredData: {
                  formData: {},
                  unsavedChanges: {},
                  userPreferences: {},
                  applicationState: {},
                },
                recoverySource: "latest_backup",
                recoveryTime: new Date(),
                dataIntegrity: {
                  checksumValid: false,
                  dataComplete: false,
                  corruptedFields: [],
                  recoveredFields: [],
                },
                warnings: [],
                errors: [error_16.message],
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionPreservation.prototype.recoverFromAlternativeSources = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var recoveredData, localData, parsedData;
      return __generator(this, function (_a) {
        recoveredData = {
          formData: {},
          unsavedChanges: {},
          userPreferences: {},
          applicationState: {},
        };
        // Try local storage
        if (typeof window !== "undefined" && window.localStorage) {
          try {
            localData = localStorage.getItem("session_".concat(sessionId));
            if (localData) {
              parsedData = JSON.parse(localData);
              Object.assign(recoveredData, parsedData);
            }
          } catch (error) {
            console.error("Failed to recover from local storage:", error);
          }
        }
        return [
          2 /*return*/,
          {
            success:
              Object.keys(recoveredData.formData).length > 0 ||
              Object.keys(recoveredData.unsavedChanges).length > 0,
            recoveredData: recoveredData,
            recoverySource: "local_storage",
            recoveryTime: new Date(),
            dataIntegrity: {
              checksumValid: false,
              dataComplete: false,
              corruptedFields: [],
              recoveredFields: Object.keys(recoveredData),
            },
            warnings: ["Recovered from alternative sources, data may be incomplete"],
            errors: [],
          },
        ];
      });
    });
  };
  SessionPreservation.prototype.decryptData = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simple decryption simulation (in production, use proper decryption)
        return [2 /*return*/, Buffer.from(data, "base64").toString()];
      });
    });
  };
  SessionPreservation.prototype.decompressData = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simple decompression simulation (in production, use proper decompression)
        return [2 /*return*/, Buffer.from(data, "base64").toString()];
      });
    });
  };
  SessionPreservation.prototype.validateDataIntegrity = function (sessionState, expectedChecksum) {
    return __awaiter(this, void 0, void 0, function () {
      var actualChecksum,
        checksumValid,
        requiredFields,
        corruptedFields,
        recoveredFields,
        _i,
        requiredFields_1,
        field;
      return __generator(this, function (_a) {
        actualChecksum = this.calculateChecksum(sessionState);
        checksumValid = actualChecksum === expectedChecksum;
        requiredFields = ["sessionId", "userId", "applicationState", "authenticationState"];
        corruptedFields = [];
        recoveredFields = [];
        for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
          field = requiredFields_1[_i];
          if (sessionState[field] === undefined || sessionState[field] === null) {
            corruptedFields.push(field);
          } else {
            recoveredFields.push(field);
          }
        }
        return [
          2 /*return*/,
          {
            checksumValid: checksumValid,
            dataComplete: corruptedFields.length === 0,
            corruptedFields: corruptedFields,
            recoveredFields: recoveredFields,
          },
        ];
      });
    });
  };
  SessionPreservation.prototype.calculateChecksum = function (data) {
    // Simple checksum calculation (in production, use a proper hash function)
    var dataString = JSON.stringify(data);
    var hash = 0;
    for (var i = 0; i < dataString.length; i++) {
      var char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };
  SessionPreservation.prototype.mapDatabaseToBackup = function (data) {
    return {
      backupId: data.backup_id,
      sessionId: data.session_id,
      userId: data.user_id,
      backupType: data.backup_type,
      backupTrigger: data.backup_trigger,
      sessionState: null, // Will be loaded separately when needed
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
      isCompressed: data.is_compressed,
      isEncrypted: data.is_encrypted,
      size: data.size,
      checksum: data.checksum,
      recoveryPriority: data.recovery_priority,
      metadata: data.metadata || {},
    };
  };
  SessionPreservation.prototype.mapDatabaseToSessionState = function (data) {
    return {
      sessionId: data.session_id,
      userId: data.user_id,
      userRole: data.user_role,
      deviceId: data.device_id,
      applicationState: data.application_state,
      authenticationState: data.authentication_state,
      securityContext: data.security_context,
      metadata: {
        createdAt: new Date(data.created_at),
        lastUpdatedAt: new Date(data.last_updated_at),
        version: data.version,
        checksum: data.checksum,
        compressionEnabled: data.compression_enabled,
        encryptionEnabled: data.encryption_enabled,
        backupCount: data.backup_count,
      },
    };
  };
  return SessionPreservation;
})();
exports.SessionPreservation = SessionPreservation;
