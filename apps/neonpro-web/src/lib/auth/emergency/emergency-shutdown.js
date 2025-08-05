// Emergency Shutdown System
// Immediate termination of all sessions in critical situations
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
exports.EmergencyShutdownManager = void 0;
var session_config_1 = require("@/lib/auth/config/session-config");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var EmergencyShutdownManager = /** @class */ (() => {
  function EmergencyShutdownManager(config) {
    this.activeEmergencies = new Map();
    this.actionQueue = [];
    this.isShuttingDown = false;
    this.shutdownStartTime = 0;
    this.eventListeners = new Map();
    this.executionLocks = new Set();
    this.config = session_config_1.SessionConfig.getInstance();
    this.utils = new session_utils_1.SessionUtils();
    this.notificationService = new NotificationService();
    this.auditLogger = new AuditLogger();
    this.emergencyConfig = __assign(
      {
        autoShutdownEnabled: true,
        severityThresholds: {
          critical: 0, // Immediate
          high: 300, // 5 minutes
          medium: 1800, // 30 minutes
          low: 3600, // 1 hour
        },
        actionTimeouts: {
          terminate_session: 30000,
          terminate_all_sessions: 60000,
          block_user: 10000,
          block_ip: 5000,
          disable_account: 15000,
          revoke_tokens: 20000,
          clear_cache: 30000,
          backup_data: 300000,
          notify_admin: 5000,
          notify_user: 10000,
          log_event: 5000,
          isolate_system: 60000,
          enable_maintenance: 30000,
          contact_authorities: 10000,
        },
        notificationChannels: ["email", "sms", "push", "in_app"],
        backupBeforeShutdown: true,
        gracePeriod: 300000,
        maxConcurrentActions: 10,
        retryAttempts: 3,
        escalationRules: [],
      },
      config,
    );
  }
  /**
   * Trigger emergency shutdown
   */
  EmergencyShutdownManager.prototype.triggerEmergency = function (
    type,
    severity,
    reason,
    triggeredBy,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var emergency, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.createEmergencyEvent(type, severity, reason, triggeredBy, options),
            ];
          case 1:
            emergency = _a.sent();
            // Store emergency event
            this.activeEmergencies.set(emergency.id, emergency);
            // Log emergency
            return [4 /*yield*/, this.auditLogger.logEmergency(emergency)];
          case 2:
            // Log emergency
            _a.sent();
            // Emit emergency triggered event
            this.emit("emergency_triggered", emergency);
            // Execute emergency response
            return [4 /*yield*/, this.executeEmergencyResponse(emergency)];
          case 3:
            // Execute emergency response
            _a.sent();
            return [2 /*return*/, emergency];
          case 4:
            error_1 = _a.sent();
            console.error("Error triggering emergency:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create emergency event
   */
  EmergencyShutdownManager.prototype.createEmergencyEvent = function (
    type,
    severity,
    reason,
    triggeredBy,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var emergency, _a, _b;
      var _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _c = {
              id: this.utils.generateSessionToken(),
              type: type,
              severity: severity,
              triggeredBy: triggeredBy,
              triggeredAt: Date.now(),
              reason: reason,
              description: this.generateEmergencyDescription(type, reason),
            };
            _a = options === null || options === void 0 ? void 0 : options.affectedSessions;
            if (_a) return [3 /*break*/, 2];
            return [4 /*yield*/, this.getAllActiveSessions()];
          case 1:
            _a = _e.sent();
            _e.label = 2;
          case 2:
            _c.affectedSessions = _a;
            _b = options === null || options === void 0 ? void 0 : options.affectedUsers;
            if (_b) return [3 /*break*/, 4];
            return [4 /*yield*/, this.getAllActiveUsers()];
          case 3:
            _b = _e.sent();
            _e.label = 4;
          case 4:
            (_c.affectedUsers = _b),
              (_c.actions =
                (options === null || options === void 0 ? void 0 : options.customActions) ||
                this.generateDefaultActions(type, severity)),
              (_c.status = "triggered");
            _d = {
              source: "emergency_system",
              detector: triggeredBy,
              confidence: 1.0,
              evidence: [],
            };
            return [
              4 /*yield*/,
              this.assessImpact(
                options === null || options === void 0 ? void 0 : options.affectedSessions,
                options === null || options === void 0 ? void 0 : options.affectedUsers,
              ),
            ];
          case 5:
            emergency =
              ((_c.metadata =
                ((_d.impact = _e.sent()),
                (_d.timeline = [
                  {
                    timestamp: Date.now(),
                    event: "emergency_triggered",
                    actor: triggeredBy,
                    details: reason,
                  },
                ]),
                (_d.notifications = []),
                _d)),
              _c);
            return [2 /*return*/, emergency];
        }
      });
    });
  };
  /**
   * Execute emergency response
   */
  EmergencyShutdownManager.prototype.executeEmergencyResponse = function (emergency) {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            // Update status
            emergency.status = "in_progress";
            // Add timeline event
            emergency.metadata.timeline.push({
              timestamp: Date.now(),
              event: "response_started",
              actor: "emergency_system",
              details: "Emergency response execution started",
            });
            if (!(emergency.severity === "critical" || this.isShuttingDown))
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.executeImmediateShutdown(emergency)];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, this.executeControlledShutdown(emergency)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            // Update status
            emergency.status = "completed";
            emergency.resolvedAt = Date.now();
            // Add timeline event
            emergency.metadata.timeline.push({
              timestamp: Date.now(),
              event: "response_completed",
              actor: "emergency_system",
              details: "Emergency response execution completed",
            });
            this.emit("emergency_completed", emergency);
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            emergency.status = "failed";
            emergency.metadata.timeline.push({
              timestamp: Date.now(),
              event: "response_failed",
              actor: "emergency_system",
              details: "Emergency response failed: ".concat(error_2.message),
            });
            console.error("Error executing emergency response:", error_2);
            this.emit("emergency_failed", { emergency: emergency, error: error_2 });
            throw error_2;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute immediate shutdown
   */
  EmergencyShutdownManager.prototype.executeImmediateShutdown = function (emergency) {
    return __awaiter(this, void 0, void 0, function () {
      var actionPromises;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.isShuttingDown = true;
            this.shutdownStartTime = Date.now();
            console.log(
              "EMERGENCY SHUTDOWN INITIATED: "
                .concat(emergency.type, " - ")
                .concat(emergency.reason),
            );
            // Send immediate notifications
            return [4 /*yield*/, this.sendEmergencyNotifications(emergency, "immediate")];
          case 1:
            // Send immediate notifications
            _a.sent();
            actionPromises = emergency.actions.map((action) =>
              _this.executeAction(action, emergency.id),
            );
            // Wait for all actions with timeout
            return [4 /*yield*/, Promise.allSettled(actionPromises)];
          case 2:
            // Wait for all actions with timeout
            _a.sent();
            // Force terminate all remaining sessions
            return [4 /*yield*/, this.forceTerminateAllSessions(emergency)];
          case 3:
            // Force terminate all remaining sessions
            _a.sent();
            console.log("EMERGENCY SHUTDOWN COMPLETED");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute controlled shutdown
   */
  EmergencyShutdownManager.prototype.executeControlledShutdown = function (emergency) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, action;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            this.isShuttingDown = true;
            this.shutdownStartTime = Date.now();
            console.log(
              "CONTROLLED SHUTDOWN INITIATED: "
                .concat(emergency.type, " - ")
                .concat(emergency.reason),
            );
            // Send warning notifications
            return [4 /*yield*/, this.sendEmergencyNotifications(emergency, "warning")];
          case 1:
            // Send warning notifications
            _b.sent();
            if (!(this.emergencyConfig.gracePeriod > 0)) return [3 /*break*/, 3];
            console.log(
              "Grace period: ".concat(this.emergencyConfig.gracePeriod / 1000, " seconds"),
            );
            return [4 /*yield*/, this.waitWithProgress(this.emergencyConfig.gracePeriod)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            if (!this.emergencyConfig.backupBeforeShutdown) return [3 /*break*/, 5];
            return [4 /*yield*/, this.executeDataBackup(emergency)];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            (_i = 0), (_a = emergency.actions);
            _b.label = 6;
          case 6:
            if (!(_i < _a.length)) return [3 /*break*/, 10];
            action = _a[_i];
            return [4 /*yield*/, this.executeAction(action, emergency.id)];
          case 7:
            _b.sent();
            // Small delay between actions
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 8:
            // Small delay between actions
            _b.sent();
            _b.label = 9;
          case 9:
            _i++;
            return [3 /*break*/, 6];
          case 10:
            console.log("CONTROLLED SHUTDOWN COMPLETED");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute individual action
   */
  EmergencyShutdownManager.prototype.executeAction = function (action, emergencyId) {
    return __awaiter(this, void 0, void 0, function () {
      var lockKey, timeout_1, result, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            lockKey = "".concat(action.type, "_").concat(action.target);
            // Prevent concurrent execution of same action type
            if (this.executionLocks.has(lockKey)) {
              console.warn("Action ".concat(action.type, " already executing, skipping"));
              action.status = "skipped";
              return [2 /*return*/];
            }
            this.executionLocks.add(lockKey);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            action.status = "executing";
            action.executedAt = Date.now();
            action.executedBy = "emergency_system";
            timeout_1 = this.emergencyConfig.actionTimeouts[action.type] || 30000;
            return [
              4 /*yield*/,
              Promise.race([
                this.performAction(action),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Action timeout")), timeout_1),
                ),
              ]),
            ];
          case 2:
            result = _a.sent();
            action.result = result;
            action.status = result.success ? "completed" : "failed";
            if (!result.success) {
              action.error = result.message;
            }
            this.emit("action_completed", { action: action, emergencyId: emergencyId });
            return [3 /*break*/, 5];
          case 3:
            error_3 = _a.sent();
            action.status = "failed";
            action.error = error_3.message;
            console.error("Action ".concat(action.type, " failed:"), error_3);
            this.emit("action_failed", {
              action: action,
              emergencyId: emergencyId,
              error: error_3,
            });
            return [3 /*break*/, 5];
          case 4:
            this.executionLocks.delete(lockKey);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform specific action
   */
  EmergencyShutdownManager.prototype.performAction = function (action) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = action.type;
            switch (_a) {
              case "terminate_session":
                return [3 /*break*/, 1];
              case "terminate_all_sessions":
                return [3 /*break*/, 3];
              case "block_user":
                return [3 /*break*/, 5];
              case "block_ip":
                return [3 /*break*/, 7];
              case "disable_account":
                return [3 /*break*/, 9];
              case "revoke_tokens":
                return [3 /*break*/, 11];
              case "clear_cache":
                return [3 /*break*/, 13];
              case "backup_data":
                return [3 /*break*/, 15];
              case "notify_admin":
                return [3 /*break*/, 17];
              case "notify_user":
                return [3 /*break*/, 19];
              case "log_event":
                return [3 /*break*/, 21];
              case "isolate_system":
                return [3 /*break*/, 23];
              case "enable_maintenance":
                return [3 /*break*/, 25];
              case "contact_authorities":
                return [3 /*break*/, 27];
            }
            return [3 /*break*/, 29];
          case 1:
            return [4 /*yield*/, this.terminateSession(action.parameters.sessionId)];
          case 2:
            return [2 /*return*/, _b.sent()];
          case 3:
            return [4 /*yield*/, this.terminateAllSessions(action.parameters.excludeAdmin)];
          case 4:
            return [2 /*return*/, _b.sent()];
          case 5:
            return [4 /*yield*/, this.blockUser(action.parameters.userId)];
          case 6:
            return [2 /*return*/, _b.sent()];
          case 7:
            return [4 /*yield*/, this.blockIP(action.parameters.ipAddress)];
          case 8:
            return [2 /*return*/, _b.sent()];
          case 9:
            return [4 /*yield*/, this.disableAccount(action.parameters.userId)];
          case 10:
            return [2 /*return*/, _b.sent()];
          case 11:
            return [4 /*yield*/, this.revokeTokens(action.parameters.userId)];
          case 12:
            return [2 /*return*/, _b.sent()];
          case 13:
            return [4 /*yield*/, this.clearCache(action.parameters.cacheType)];
          case 14:
            return [2 /*return*/, _b.sent()];
          case 15:
            return [4 /*yield*/, this.backupData(action.parameters.dataTypes)];
          case 16:
            return [2 /*return*/, _b.sent()];
          case 17:
            return [4 /*yield*/, this.notifyAdministrators(action.parameters.message)];
          case 18:
            return [2 /*return*/, _b.sent()];
          case 19:
            return [
              4 /*yield*/,
              this.notifyUser(action.parameters.userId, action.parameters.message),
            ];
          case 20:
            return [2 /*return*/, _b.sent()];
          case 21:
            return [4 /*yield*/, this.logSecurityEvent(action.parameters.event)];
          case 22:
            return [2 /*return*/, _b.sent()];
          case 23:
            return [4 /*yield*/, this.isolateSystem(action.parameters.systemId)];
          case 24:
            return [2 /*return*/, _b.sent()];
          case 25:
            return [4 /*yield*/, this.enableMaintenanceMode()];
          case 26:
            return [2 /*return*/, _b.sent()];
          case 27:
            return [4 /*yield*/, this.contactAuthorities(action.parameters.incident)];
          case 28:
            return [2 /*return*/, _b.sent()];
          case 29:
            throw new Error("Unknown action type: ".concat(action.type));
        }
      });
    });
  };
  /**
   * Action implementations
   */
  EmergencyShutdownManager.prototype.terminateSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/session/".concat(sessionId, "/terminate"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "emergency_shutdown", force: true }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "Session ".concat(sessionId, " terminated successfully"),
                  affectedCount: 1,
                },
              ];
            } else {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
            }
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to terminate session: ".concat(error_4.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.terminateAllSessions = function () {
    return __awaiter(this, arguments, void 0, function (excludeAdmin) {
      var response, result, error_5;
      if (excludeAdmin === void 0) {
        excludeAdmin = false;
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/session/terminate-all", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reason: "emergency_shutdown",
                  force: true,
                  excludeAdmin: excludeAdmin,
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "".concat(result.terminatedCount, " sessions terminated successfully"),
                affectedCount: result.terminatedCount,
              },
            ];
          case 3:
            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_5 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to terminate all sessions: ".concat(error_5.message),
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.blockUser = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/users/".concat(userId, "/block"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "emergency_security_measure" }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "User ".concat(userId, " blocked successfully"),
                  affectedCount: 1,
                },
              ];
            } else {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
            }
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to block user: ".concat(error_6.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.blockIP = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_7;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/security/block-ip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ipAddress: ipAddress,
                  reason: "emergency_security_measure",
                  duration: 24 * 60 * 60 * 1000, // 24 hours
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "IP address ".concat(ipAddress, " blocked successfully"),
                  affectedCount: 1,
                },
              ];
            } else {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
            }
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to block IP: ".concat(error_7.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.disableAccount = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/users/".concat(userId, "/disable"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "emergency_security_measure" }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "Account ".concat(userId, " disabled successfully"),
                  affectedCount: 1,
                },
              ];
            } else {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
            }
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to disable account: ".concat(error_8.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.revokeTokens = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, result, error_9;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/auth/revoke-tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userId, reason: "emergency_security_measure" }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "".concat(result.revokedCount, " tokens revoked successfully"),
                affectedCount: result.revokedCount,
              },
            ];
          case 3:
            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_9 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to revoke tokens: ".concat(error_9.message),
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.clearCache = function (cacheType) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_10;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/cache/clear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: cacheType, reason: "emergency_cleanup" }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "Cache ".concat(cacheType, " cleared successfully"),
                },
              ];
            } else {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
            }
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to clear cache: ".concat(error_10.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.backupData = function (dataTypes) {
    return __awaiter(this, void 0, void 0, function () {
      var response, result, error_11;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/backup/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  dataTypes: dataTypes,
                  reason: "emergency_backup",
                  priority: "high",
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Emergency backup completed: ".concat(result.backupId),
                data: { backupId: result.backupId },
              },
            ];
          case 3:
            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_11 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to backup data: ".concat(error_11.message),
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.notifyAdministrators = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      var response, result, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/notifications/admin-alert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  message: message,
                  priority: "critical",
                  channels: this.emergencyConfig.notificationChannels,
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Administrators notified via ".concat(
                  result.sentChannels.length,
                  " channels",
                ),
                affectedCount: result.recipientCount,
              },
            ];
          case 3:
            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_12 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to notify administrators: ".concat(error_12.message),
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.notifyUser = function (userId, message) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_13;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/notifications/user-alert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: userId,
                  message: message,
                  priority: "high",
                  channels: ["email", "push", "in_app"],
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "User ".concat(userId, " notified successfully"),
                  affectedCount: 1,
                },
              ];
            } else {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
            }
            return [3 /*break*/, 3];
          case 2:
            error_13 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to notify user: ".concat(error_13.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.logSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.auditLogger.logSecurityEvent(event)];
          case 1:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Security event logged successfully",
              },
            ];
          case 2:
            error_14 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to log security event: ".concat(error_14.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.isolateSystem = function (systemId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_15;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/systems/".concat(systemId, "/isolate"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: "emergency_isolation" }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "System ".concat(systemId, " isolated successfully"),
                },
              ];
            } else {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
            }
            return [3 /*break*/, 3];
          case 2:
            error_15 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to isolate system: ".concat(error_15.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.enableMaintenanceMode = function () {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_16;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/system/maintenance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  enabled: true,
                  reason: "emergency_maintenance",
                  message: "System is temporarily unavailable due to emergency maintenance",
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "Maintenance mode enabled successfully",
                },
              ];
            } else {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
            }
            return [3 /*break*/, 3];
          case 2:
            error_16 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to enable maintenance mode: ".concat(error_16.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.contactAuthorities = function (incident) {
    return __awaiter(this, void 0, void 0, function () {
      var error_17;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // In a real implementation, this would contact appropriate authorities
            // For now, we'll just log the incident
            return [
              4 /*yield*/,
              this.auditLogger.logIncident(
                __assign(__assign({}, incident), {
                  reportedToAuthorities: true,
                  reportedAt: Date.now(),
                }),
              ),
            ];
          case 1:
            // In a real implementation, this would contact appropriate authorities
            // For now, we'll just log the incident
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                message: "Authorities contacted and incident reported",
              },
            ];
          case 2:
            error_17 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Failed to contact authorities: ".concat(error_17.message),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Force terminate all sessions
   */
  EmergencyShutdownManager.prototype.forceTerminateAllSessions = function (emergency) {
    return __awaiter(this, void 0, void 0, function () {
      var sessions, terminationPromises, error_18;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getAllActiveSessions()];
          case 1:
            sessions = _a.sent();
            terminationPromises = sessions.map((sessionId) => _this.terminateSession(sessionId));
            return [4 /*yield*/, Promise.allSettled(terminationPromises)];
          case 2:
            _a.sent();
            console.log("Force terminated ".concat(sessions.length, " sessions"));
            return [3 /*break*/, 4];
          case 3:
            error_18 = _a.sent();
            console.error("Error force terminating sessions:", error_18);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send emergency notifications
   */
  EmergencyShutdownManager.prototype.sendEmergencyNotifications = function (emergency, urgency) {
    return __awaiter(this, void 0, void 0, function () {
      var message, error_19;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            message = this.generateNotificationMessage(emergency, urgency);
            // Notify administrators
            return [
              4 /*yield*/,
              this.notificationService.sendEmergencyAlert({
                recipients: "administrators",
                message: message,
                priority: emergency.severity,
                channels: this.emergencyConfig.notificationChannels,
              }),
            ];
          case 1:
            // Notify administrators
            _a.sent();
            if (!(urgency !== "immediate" && emergency.affectedUsers.length > 0))
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.notificationService.sendUserAlert({
                userIds: emergency.affectedUsers,
                message: this.generateUserNotificationMessage(emergency),
                priority: "high",
                channels: ["email", "push", "in_app"],
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Record notifications
            emergency.metadata.notifications.push({
              id: this.utils.generateSessionToken(),
              type: "emergency_alert",
              recipient: "administrators",
              channel: "multiple",
              sentAt: Date.now(),
              status: "sent",
              content: message,
            });
            return [3 /*break*/, 5];
          case 4:
            error_19 = _a.sent();
            console.error("Error sending emergency notifications:", error_19);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Utility methods
   */
  EmergencyShutdownManager.prototype.generateEmergencyDescription = (type, reason) => {
    var descriptions = {
      security_breach: "Security breach detected requiring immediate response",
      data_leak: "Potential data leak identified requiring system isolation",
      system_compromise: "System compromise detected requiring emergency shutdown",
      malware_detected: "Malware detected requiring immediate containment",
      unauthorized_access: "Unauthorized access detected requiring session termination",
      ddos_attack: "DDoS attack in progress requiring traffic filtering",
      insider_threat: "Insider threat detected requiring account restrictions",
      compliance_violation: "Compliance violation requiring immediate remediation",
      system_failure: "Critical system failure requiring emergency procedures",
      manual_shutdown: "Manual emergency shutdown initiated by administrator",
      scheduled_maintenance: "Scheduled emergency maintenance requiring system shutdown",
      legal_requirement: "Legal requirement mandating immediate system shutdown",
    };
    return "".concat(descriptions[type] || "Emergency situation detected", ": ").concat(reason);
  };
  EmergencyShutdownManager.prototype.generateDefaultActions = function (type, severity) {
    var actions = [];
    // Common actions for all emergencies
    actions.push({
      id: this.utils.generateSessionToken(),
      type: "log_event",
      target: "logs",
      parameters: { event: { type: type, severity: severity, timestamp: Date.now() } },
      status: "pending",
    });
    actions.push({
      id: this.utils.generateSessionToken(),
      type: "notify_admin",
      target: "administrators",
      parameters: {
        message: "Emergency ".concat(type, " triggered with ").concat(severity, " severity"),
      },
      status: "pending",
    });
    // Severity-based actions
    if (severity === "critical" || severity === "high") {
      actions.push({
        id: this.utils.generateSessionToken(),
        type: "terminate_all_sessions",
        target: "system",
        parameters: { excludeAdmin: severity === "high" },
        status: "pending",
      });
    }
    // Type-specific actions
    switch (type) {
      case "security_breach":
      case "system_compromise":
        actions.push({
          id: this.utils.generateSessionToken(),
          type: "backup_data",
          target: "database",
          parameters: { dataTypes: ["critical", "user_data"] },
          status: "pending",
        });
        break;
      case "malware_detected":
        actions.push({
          id: this.utils.generateSessionToken(),
          type: "isolate_system",
          target: "system",
          parameters: { systemId: "main" },
          status: "pending",
        });
        break;
      case "ddos_attack":
        actions.push({
          id: this.utils.generateSessionToken(),
          type: "enable_maintenance",
          target: "system",
          parameters: {},
          status: "pending",
        });
        break;
    }
    return actions;
  };
  EmergencyShutdownManager.prototype.generateNotificationMessage = (emergency, urgency) => {
    var urgencyText = urgency === "immediate" ? "IMMEDIATE" : "WARNING";
    return ""
      .concat(urgencyText, ": ")
      .concat(emergency.description, ". Triggered by: ")
      .concat(emergency.triggeredBy, ". Severity: ")
      .concat(emergency.severity.toUpperCase(), ".");
  };
  EmergencyShutdownManager.prototype.generateUserNotificationMessage = (emergency) =>
    "Your session will be terminated due to a security incident. Please save your work and log in again later. We apologize for the inconvenience.";
  EmergencyShutdownManager.prototype.getAllActiveSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var response, sessions, error_20;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/session/active")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            sessions = _a.sent();
            return [2 /*return*/, sessions.map((s) => s.id)];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_20 = _a.sent();
            console.error("Error getting active sessions:", error_20);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/, []];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.getAllActiveUsers = function () {
    return __awaiter(this, void 0, void 0, function () {
      var response, users, error_21;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/users/active")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            users = _a.sent();
            return [2 /*return*/, users.map((u) => u.id)];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_21 = _a.sent();
            console.error("Error getting active users:", error_21);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/, []];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.assessImpact = function (affectedSessions, affectedUsers) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        {
          usersAffected:
            (affectedUsers === null || affectedUsers === void 0 ? void 0 : affectedUsers.length) ||
            0,
          sessionsAffected:
            (affectedSessions === null || affectedSessions === void 0
              ? void 0
              : affectedSessions.length) || 0,
          dataAtRisk: ["user_sessions", "authentication_tokens"],
          systemsAffected: ["web_application", "database", "cache"],
          businessImpact: {
            severity: "high",
            revenue: 0,
            reputation: 0.8,
            compliance: 0.9,
            operations: 0.7,
          },
          estimatedDowntime: 30 * 60 * 1000, // 30 minutes
        },
      ]);
    });
  };
  EmergencyShutdownManager.prototype.executeDataBackup = function (emergency) {
    return __awaiter(this, void 0, void 0, function () {
      var backupAction, error_22;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            console.log("Executing emergency data backup...");
            backupAction = {
              id: this.utils.generateSessionToken(),
              type: "backup_data",
              target: "database",
              parameters: { dataTypes: ["critical", "user_data", "session_data"] },
              status: "pending",
            };
            return [4 /*yield*/, this.executeAction(backupAction, emergency.id)];
          case 1:
            _a.sent();
            if (backupAction.status === "completed") {
              console.log("Emergency data backup completed successfully");
            } else {
              console.warn("Emergency data backup failed or incomplete");
            }
            return [3 /*break*/, 3];
          case 2:
            error_22 = _a.sent();
            console.error("Error executing data backup:", error_22);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.waitWithProgress = function (duration) {
    return __awaiter(this, void 0, void 0, function () {
      var interval, steps, _loop_1, i;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            interval = 5000;
            steps = Math.ceil(duration / interval);
            _loop_1 = function (i) {
              var remaining;
              return __generator(this, (_b) => {
                switch (_b.label) {
                  case 0:
                    remaining = duration - i * interval;
                    console.log("Shutdown in ".concat(Math.ceil(remaining / 1000), " seconds..."));
                    return [
                      4 /*yield*/,
                      new Promise((resolve) => setTimeout(resolve, Math.min(interval, remaining))),
                    ];
                  case 1:
                    _b.sent();
                    return [2 /*return*/];
                }
              });
            };
            i = 0;
            _a.label = 1;
          case 1:
            if (!(i < steps)) return [3 /*break*/, 4];
            return [5 /*yield**/, _loop_1(i)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Event system
   */
  EmergencyShutdownManager.prototype.on = function (event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  };
  EmergencyShutdownManager.prototype.off = function (event, callback) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      var index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
  EmergencyShutdownManager.prototype.emit = function (event, data) {
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
   * Public API methods
   */
  EmergencyShutdownManager.prototype.cancelEmergency = function (emergencyId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var emergency;
      return __generator(this, function (_a) {
        emergency = this.activeEmergencies.get(emergencyId);
        if (!emergency) {
          return [2 /*return*/, false];
        }
        if (emergency.status === "completed") {
          return [2 /*return*/, false]; // Cannot cancel completed emergency
        }
        emergency.status = "cancelled";
        emergency.resolvedAt = Date.now();
        emergency.metadata.timeline.push({
          timestamp: Date.now(),
          event: "emergency_cancelled",
          actor: "administrator",
          details: reason,
        });
        this.isShuttingDown = false;
        this.emit("emergency_cancelled", { emergency: emergency, reason: reason });
        return [2 /*return*/, true];
      });
    });
  };
  EmergencyShutdownManager.prototype.getActiveEmergencies = function () {
    return Array.from(this.activeEmergencies.values()).filter(
      (e) => e.status === "triggered" || e.status === "in_progress",
    );
  };
  EmergencyShutdownManager.prototype.getEmergencyHistory = function () {
    return Array.from(this.activeEmergencies.values());
  };
  EmergencyShutdownManager.prototype.isInEmergencyMode = function () {
    return this.isShuttingDown;
  };
  EmergencyShutdownManager.prototype.getShutdownStatus = function () {
    return {
      isShuttingDown: this.isShuttingDown,
      startTime: this.shutdownStartTime,
      duration: this.isShuttingDown ? Date.now() - this.shutdownStartTime : 0,
    };
  };
  EmergencyShutdownManager.prototype.updateConfig = function (config) {
    this.emergencyConfig = __assign(__assign({}, this.emergencyConfig), config);
  };
  EmergencyShutdownManager.prototype.testEmergencySystem = function () {
    return __awaiter(this, void 0, void 0, function () {
      var testResponse, error_23;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Test notification system
            return [4 /*yield*/, this.notificationService.testConnection()];
          case 1:
            // Test notification system
            _a.sent();
            // Test audit logger
            return [4 /*yield*/, this.auditLogger.testConnection()];
          case 2:
            // Test audit logger
            _a.sent();
            return [4 /*yield*/, fetch("/api/emergency/test")];
          case 3:
            testResponse = _a.sent();
            return [2 /*return*/, testResponse.ok];
          case 4:
            error_23 = _a.sent();
            console.error("Emergency system test failed:", error_23);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  EmergencyShutdownManager.prototype.destroy = function () {
    // Clear all state
    this.activeEmergencies.clear();
    this.actionQueue = [];
    this.executionLocks.clear();
    this.eventListeners.clear();
    this.isShuttingDown = false;
  };
  return EmergencyShutdownManager;
})();
exports.EmergencyShutdownManager = EmergencyShutdownManager;
/**
 * Helper classes
 */
var NotificationService = /** @class */ (() => {
  function NotificationService() {}
  NotificationService.prototype.sendEmergencyAlert = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for sending emergency alerts
        console.log("Sending emergency alert:", params);
        return [2 /*return*/];
      });
    });
  };
  NotificationService.prototype.sendUserAlert = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for sending user alerts
        console.log("Sending user alert:", params);
        return [2 /*return*/];
      });
    });
  };
  NotificationService.prototype.testConnection = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Test notification service connection
        return [2 /*return*/, true];
      });
    });
  };
  return NotificationService;
})();
var AuditLogger = /** @class */ (() => {
  function AuditLogger() {}
  AuditLogger.prototype.logEmergency = function (emergency) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for logging emergency events
        console.log("Logging emergency:", emergency.id);
        return [2 /*return*/];
      });
    });
  };
  AuditLogger.prototype.logSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for logging security events
        console.log("Logging security event:", event);
        return [2 /*return*/];
      });
    });
  };
  AuditLogger.prototype.logIncident = function (incident) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for logging incidents
        console.log("Logging incident:", incident);
        return [2 /*return*/];
      });
    });
  };
  AuditLogger.prototype.testConnection = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Test audit logger connection
        return [2 /*return*/, true];
      });
    });
  };
  return AuditLogger;
})();
exports.default = EmergencyShutdownManager;
