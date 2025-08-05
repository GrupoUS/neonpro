"use strict";
// Concurrent Session Management System
// Manages multiple active sessions per user with intelligent conflict resolution
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
exports.ConcurrentSessionManager = void 0;
exports.getConcurrentSessionManager = getConcurrentSessionManager;
var session_config_1 = require("@/lib/auth/config/session-config");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var ConcurrentSessionManager = /** @class */ (function () {
  function ConcurrentSessionManager() {
    this.activeConflicts = new Map();
    this.sessionTransfers = new Map();
    this.deviceSessions = new Map(); // deviceId -> sessionIds
    this.userSessions = new Map(); // userId -> sessionIds
    this.config = session_config_1.SessionConfig.getInstance();
    this.utils = new session_utils_1.SessionUtils();
  }
  /**
   * Check if a new session can be created for the user
   */
  ConcurrentSessionManager.prototype.canCreateSession = function (userId, deviceId, userRole) {
    return __awaiter(this, void 0, void 0, function () {
      var concurrentConfig,
        existingSessions,
        conflict,
        deviceSessions,
        conflict,
        suspiciousLogin,
        conflict,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 10]);
            concurrentConfig = this.getConcurrentConfig(userRole);
            return [4 /*yield*/, this.getUserActiveSessions(userId)];
          case 1:
            existingSessions = _a.sent();
            if (!(existingSessions.length >= concurrentConfig.maxConcurrentSessions))
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.createSessionConflict(userId, "max_sessions_exceeded", existingSessions, {
                userId: userId,
                deviceId: deviceId,
              }),
            ];
          case 2:
            conflict = _a.sent();
            return [
              2 /*return*/,
              {
                allowed: false,
                reason: "Maximum concurrent sessions (".concat(
                  concurrentConfig.maxConcurrentSessions,
                  ") exceeded",
                ),
                conflictId: conflict.id,
                existingSessions: existingSessions,
              },
            ];
          case 3:
            deviceSessions = existingSessions.filter(function (s) {
              return s.deviceId === deviceId;
            });
            if (!(deviceSessions.length > 0 && !concurrentConfig.allowMultipleDevices))
              return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.createSessionConflict(userId, "same_device_login", deviceSessions, {
                userId: userId,
                deviceId: deviceId,
              }),
            ];
          case 4:
            conflict = _a.sent();
            return [
              2 /*return*/,
              {
                allowed: false,
                reason: "Another session is already active on this device",
                conflictId: conflict.id,
                existingSessions: deviceSessions,
              },
            ];
          case 5:
            return [4 /*yield*/, this.detectSuspiciousLogin(userId, deviceId, existingSessions)];
          case 6:
            suspiciousLogin = _a.sent();
            if (!suspiciousLogin) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              this.createSessionConflict(userId, "suspicious_location", existingSessions, {
                userId: userId,
                deviceId: deviceId,
              }),
            ];
          case 7:
            conflict = _a.sent();
            return [
              2 /*return*/,
              {
                allowed: false,
                reason: "Suspicious login detected from new location/device",
                conflictId: conflict.id,
                existingSessions: existingSessions,
              },
            ];
          case 8:
            return [2 /*return*/, { allowed: true }];
          case 9:
            error_1 = _a.sent();
            console.error("Error checking session creation:", error_1);
            return [
              2 /*return*/,
              {
                allowed: false,
                reason: "Internal error checking session permissions",
              },
            ];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle session creation with conflict resolution
   */
  ConcurrentSessionManager.prototype.handleSessionCreation = function (
    userId,
    deviceId,
    userRole,
    conflictId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var canCreate, sessionId, conflict, concurrentConfig, existingSessions, resolution, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            return [4 /*yield*/, this.canCreateSession(userId, deviceId, userRole)];
          case 1:
            canCreate = _a.sent();
            if (!canCreate.allowed) return [3 /*break*/, 4];
            return [4 /*yield*/, this.createNewSession(userId, deviceId)];
          case 2:
            sessionId = _a.sent();
            return [4 /*yield*/, this.trackSessionCreation(userId, deviceId, sessionId)];
          case 3:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                sessionId: sessionId,
              },
            ];
          case 4:
            if (!conflictId) return [3 /*break*/, 6];
            conflict = this.activeConflicts.get(conflictId);
            if (!conflict) return [3 /*break*/, 6];
            return [4 /*yield*/, this.resolveSessionConflict(conflict)];
          case 5:
            return [2 /*return*/, _a.sent()];
          case 6:
            concurrentConfig = this.getConcurrentConfig(userRole);
            existingSessions = canCreate.existingSessions || [];
            return [
              4 /*yield*/,
              this.autoResolveConflict(concurrentConfig, existingSessions, {
                userId: userId,
                deviceId: deviceId,
              }),
            ];
          case 7:
            resolution = _a.sent();
            return [2 /*return*/, resolution];
          case 8:
            error_2 = _a.sent();
            console.error("Error handling session creation:", error_2);
            return [2 /*return*/, { success: false }];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Resolve session conflict based on configuration
   */
  ConcurrentSessionManager.prototype.resolveSessionConflict = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var resolution,
        terminatedSessions,
        newSessionId,
        transferId,
        _a,
        oldestSession,
        _i,
        _b,
        sessionId,
        error_3;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 20, , 21]);
            resolution = conflict.resolution;
            terminatedSessions = [];
            newSessionId = void 0;
            transferId = void 0;
            _a = resolution.action;
            switch (_a) {
              case "terminate_oldest":
                return [3 /*break*/, 1];
              case "terminate_newest":
                return [3 /*break*/, 6];
              case "terminate_specific":
                return [3 /*break*/, 7];
              case "allow_concurrent":
                return [3 /*break*/, 14];
              case "require_user_choice":
                return [3 /*break*/, 16];
            }
            return [3 /*break*/, 17];
          case 1:
            oldestSession = this.findOldestSession(conflict.existingSessions);
            if (!oldestSession) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.terminateSession(oldestSession.id, "Replaced by newer session"),
            ];
          case 2:
            _c.sent();
            terminatedSessions.push(oldestSession.id);
            return [
              4 /*yield*/,
              this.initiateSessionTransfer(
                oldestSession.id,
                conflict.newSession.userId,
                conflict.newSession.deviceId,
              ),
            ];
          case 3:
            // Transfer session data if needed
            transferId = _c.sent();
            _c.label = 4;
          case 4:
            return [
              4 /*yield*/,
              this.createNewSession(conflict.newSession.userId, conflict.newSession.deviceId),
            ];
          case 5:
            newSessionId = _c.sent();
            return [3 /*break*/, 17];
          case 6:
            // Don't create new session, keep existing ones
            return [3 /*break*/, 17];
          case 7:
            if (!resolution.targetSessionIds) return [3 /*break*/, 13];
            (_i = 0), (_b = resolution.targetSessionIds);
            _c.label = 8;
          case 8:
            if (!(_i < _b.length)) return [3 /*break*/, 11];
            sessionId = _b[_i];
            return [
              4 /*yield*/,
              this.terminateSession(sessionId, "Terminated due to conflict resolution"),
            ];
          case 9:
            _c.sent();
            terminatedSessions.push(sessionId);
            _c.label = 10;
          case 10:
            _i++;
            return [3 /*break*/, 8];
          case 11:
            return [
              4 /*yield*/,
              this.createNewSession(conflict.newSession.userId, conflict.newSession.deviceId),
            ];
          case 12:
            newSessionId = _c.sent();
            _c.label = 13;
          case 13:
            return [3 /*break*/, 17];
          case 14:
            return [
              4 /*yield*/,
              this.createNewSession(conflict.newSession.userId, conflict.newSession.deviceId),
            ];
          case 15:
            newSessionId = _c.sent();
            return [3 /*break*/, 17];
          case 16:
            // Return without resolution, requires user interaction
            return [
              2 /*return*/,
              {
                success: false,
              },
            ];
          case 17:
            // Mark conflict as resolved
            conflict.resolved = true;
            conflict.resolution.userNotified = true;
            if (!(terminatedSessions.length > 0)) return [3 /*break*/, 19];
            return [
              4 /*yield*/,
              this.notifySessionTerminations(conflict.userId, terminatedSessions),
            ];
          case 18:
            _c.sent();
            _c.label = 19;
          case 19:
            return [
              2 /*return*/,
              {
                success: true,
                sessionId: newSessionId,
                terminatedSessions: terminatedSessions,
                transferId: transferId,
              },
            ];
          case 20:
            error_3 = _c.sent();
            console.error("Error resolving session conflict:", error_3);
            return [2 /*return*/, { success: false }];
          case 21:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Auto-resolve conflict based on configuration
   */
  ConcurrentSessionManager.prototype.autoResolveConflict = function (
    config,
    existingSessions,
    newSession,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var terminatedSessions, sessionToTerminate, transferId, sessionId;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            terminatedSessions = [];
            sessionToTerminate = null;
            switch (config.conflictResolution) {
              case "newest_wins":
                sessionToTerminate = this.findOldestSession(existingSessions);
                break;
              case "oldest_wins":
                // Don't create new session
                return [2 /*return*/, { success: false }];
              case "device_priority":
                sessionToTerminate = this.findLowestPrioritySession(
                  existingSessions,
                  config.devicePriorityOrder,
                );
                break;
              default:
                sessionToTerminate = this.findOldestSession(existingSessions);
            }
            if (!sessionToTerminate) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.terminateSession(sessionToTerminate.id, "Replaced by auto-resolution"),
            ];
          case 1:
            _a.sent();
            terminatedSessions.push(sessionToTerminate.id);
            return [
              4 /*yield*/,
              this.initiateSessionTransfer(
                sessionToTerminate.id,
                newSession.userId,
                newSession.deviceId,
              ),
            ];
          case 2:
            transferId = _a.sent();
            return [4 /*yield*/, this.createNewSession(newSession.userId, newSession.deviceId)];
          case 3:
            sessionId = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                sessionId: sessionId,
                terminatedSessions: terminatedSessions,
                transferId: transferId,
              },
            ];
          case 4:
            return [2 /*return*/, { success: false }];
        }
      });
    });
  };
  /**
   * Initiate session data transfer
   */
  ConcurrentSessionManager.prototype.initiateSessionTransfer = function (
    fromSessionId,
    userId,
    deviceId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionData, transfer, transferId, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getSessionTransferData(fromSessionId)];
          case 1:
            sessionData = _a.sent();
            transfer = {
              fromSessionId: fromSessionId,
              toSessionId: "", // Will be set when new session is created
              transferData: sessionData,
              timestamp: Date.now(),
              completed: false,
            };
            transferId = this.utils.generateSessionToken();
            this.sessionTransfers.set(transferId, transfer);
            return [2 /*return*/, transferId];
          case 2:
            error_4 = _a.sent();
            console.error("Error initiating session transfer:", error_4);
            throw error_4;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Complete session transfer to new session
   */
  ConcurrentSessionManager.prototype.completeSessionTransfer = function (transferId, newSessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var transfer, error_5;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            transfer = this.sessionTransfers.get(transferId);
            if (!transfer) {
              return [2 /*return*/, false];
            }
            transfer.toSessionId = newSessionId;
            // Apply transferred data to new session
            return [4 /*yield*/, this.applyTransferData(newSessionId, transfer.transferData)];
          case 1:
            // Apply transferred data to new session
            _a.sent();
            transfer.completed = true;
            // Clean up transfer record after 24 hours
            setTimeout(
              function () {
                _this.sessionTransfers.delete(transferId);
              },
              24 * 60 * 60 * 1000,
            );
            return [2 /*return*/, true];
          case 2:
            error_5 = _a.sent();
            console.error("Error completing session transfer:", error_5);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get concurrent session configuration for user role
   */
  ConcurrentSessionManager.prototype.getConcurrentConfig = function (userRole) {
    var policy = this.config.getSessionPolicy(userRole);
    return {
      maxConcurrentSessions: policy.maxConcurrentSessions || 3,
      allowMultipleDevices: true,
      conflictResolution: "newest_wins",
      devicePriorityOrder: ["desktop", "tablet", "mobile"],
      gracePeriodMinutes: 5,
      notificationEnabled: true,
    };
  };
  /**
   * Create session conflict record
   */
  ConcurrentSessionManager.prototype.createSessionConflict = function (
    userId,
    conflictType,
    existingSessions,
    newSession,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var conflictId, conflict;
      var _this = this;
      return __generator(this, function (_a) {
        conflictId = this.utils.generateSessionToken();
        conflict = {
          id: conflictId,
          userId: userId,
          conflictType: conflictType,
          existingSessions: existingSessions,
          newSession: newSession,
          resolution: {
            action: "require_user_choice",
            reason: "Awaiting user decision",
            userNotified: false,
          },
          timestamp: Date.now(),
          resolved: false,
        };
        this.activeConflicts.set(conflictId, conflict);
        // Auto-expire conflict after 10 minutes
        setTimeout(
          function () {
            if (!conflict.resolved) {
              _this.activeConflicts.delete(conflictId);
            }
          },
          10 * 60 * 1000,
        );
        return [2 /*return*/, conflict];
      });
    });
  };
  /**
   * Detect suspicious login patterns
   */
  ConcurrentSessionManager.prototype.detectSuspiciousLogin = function (
    userId,
    deviceId,
    existingSessions,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var recentSessions, newDeviceInfo, _i, recentSessions_1, session, existingDeviceInfo, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            recentSessions = existingSessions.filter(
              function (s) {
                return Date.now() - new Date(s.lastActivity).getTime() < 30 * 60 * 1000;
              }, // Last 30 minutes
            );
            if (!(recentSessions.length > 0)) return [3 /*break*/, 5];
            return [4 /*yield*/, this.getDeviceInfo(deviceId)];
          case 1:
            newDeviceInfo = _a.sent();
            (_i = 0), (recentSessions_1 = recentSessions);
            _a.label = 2;
          case 2:
            if (!(_i < recentSessions_1.length)) return [3 /*break*/, 5];
            session = recentSessions_1[_i];
            return [4 /*yield*/, this.getDeviceInfo(session.deviceId)];
          case 3:
            existingDeviceInfo = _a.sent();
            // Check for different countries/regions
            if (newDeviceInfo.country !== existingDeviceInfo.country) {
              return [2 /*return*/, true];
            }
            // Check for different device types with same user agent patterns
            if (this.detectDeviceSpoofing(newDeviceInfo, existingDeviceInfo)) {
              return [2 /*return*/, true];
            }
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, false];
          case 6:
            error_6 = _a.sent();
            console.error("Error detecting suspicious login:", error_6);
            return [2 /*return*/, false];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Utility functions
   */
  ConcurrentSessionManager.prototype.findOldestSession = function (sessions) {
    if (sessions.length === 0) return null;
    return sessions.reduce(function (oldest, current) {
      return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
    });
  };
  ConcurrentSessionManager.prototype.findLowestPrioritySession = function (
    sessions,
    priorityOrder,
  ) {
    if (sessions.length === 0) return null;
    return sessions.reduce(function (lowest, current) {
      var currentPriority = priorityOrder.indexOf(current.deviceType) || 999;
      var lowestPriority = priorityOrder.indexOf(lowest.deviceType) || 999;
      return currentPriority > lowestPriority ? current : lowest;
    });
  };
  ConcurrentSessionManager.prototype.getUserActiveSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, data, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/session/user/".concat(userId, "/active"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            return [2 /*return*/, data.sessions || []];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            console.error("Error getting user sessions:", error_7);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/, []];
        }
      });
    });
  };
  ConcurrentSessionManager.prototype.createNewSession = function (userId, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: userId,
                  deviceId: deviceId,
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            return [2 /*return*/, data.sessionId];
          case 3:
            throw new Error("Failed to create session");
        }
      });
    });
  };
  ConcurrentSessionManager.prototype.terminateSession = function (sessionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              fetch("/api/session/terminate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  sessionId: sessionId,
                  reason: reason,
                }),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  ConcurrentSessionManager.prototype.trackSessionCreation = function (userId, deviceId, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var userSessions, deviceSessions;
      return __generator(this, function (_a) {
        userSessions = this.userSessions.get(userId) || new Set();
        userSessions.add(sessionId);
        this.userSessions.set(userId, userSessions);
        deviceSessions = this.deviceSessions.get(deviceId) || new Set();
        deviceSessions.add(sessionId);
        this.deviceSessions.set(deviceId, deviceSessions);
        return [2 /*return*/];
      });
    });
  };
  ConcurrentSessionManager.prototype.getSessionTransferData = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would typically fetch from session storage/database
        return [
          2 /*return*/,
          {
            state: {},
            preferences: {},
            temporaryData: {},
          },
        ];
      });
    });
  };
  ConcurrentSessionManager.prototype.applyTransferData = function (sessionId, transferData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  ConcurrentSessionManager.prototype.getDeviceInfo = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would typically fetch device information
        return [
          2 /*return*/,
          {
            country: "BR",
            deviceType: "desktop",
            userAgent: "",
          },
        ];
      });
    });
  };
  ConcurrentSessionManager.prototype.detectDeviceSpoofing = function (device1, device2) {
    // Implement device spoofing detection logic
    return false;
  };
  ConcurrentSessionManager.prototype.notifySessionTerminations = function (userId, sessionIds) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Send notifications about terminated sessions
        console.log("Notifying user ".concat(userId, " about terminated sessions:"), sessionIds);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get active conflicts for user
   */
  ConcurrentSessionManager.prototype.getActiveConflicts = function (userId) {
    return Array.from(this.activeConflicts.values()).filter(function (conflict) {
      return conflict.userId === userId && !conflict.resolved;
    });
  };
  /**
   * Resolve conflict with user choice
   */
  ConcurrentSessionManager.prototype.resolveConflictWithUserChoice = function (
    conflictId,
    action,
    targetSessionIds,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var conflict, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            conflict = this.activeConflicts.get(conflictId);
            if (!conflict) {
              return [2 /*return*/, false];
            }
            conflict.resolution = {
              action: action,
              targetSessionIds: targetSessionIds,
              reason: "User choice",
              userNotified: true,
            };
            return [4 /*yield*/, this.resolveSessionConflict(conflict)];
          case 1:
            result = _a.sent();
            return [2 /*return*/, result.success];
        }
      });
    });
  };
  /**
   * Clean up expired conflicts and transfers
   */
  ConcurrentSessionManager.prototype.cleanup = function () {
    var now = Date.now();
    var maxAge = 24 * 60 * 60 * 1000; // 24 hours
    // Clean up old conflicts
    for (var _i = 0, _a = this.activeConflicts.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        id = _b[0],
        conflict = _b[1];
      if (now - conflict.timestamp > maxAge) {
        this.activeConflicts.delete(id);
      }
    }
    // Clean up old transfers
    for (var _c = 0, _d = this.sessionTransfers.entries(); _c < _d.length; _c++) {
      var _e = _d[_c],
        id = _e[0],
        transfer = _e[1];
      if (now - transfer.timestamp > maxAge) {
        this.sessionTransfers.delete(id);
      }
    }
  };
  return ConcurrentSessionManager;
})();
exports.ConcurrentSessionManager = ConcurrentSessionManager;
// Singleton instance
var concurrentManager = null;
function getConcurrentSessionManager() {
  if (!concurrentManager) {
    concurrentManager = new ConcurrentSessionManager();
  }
  return concurrentManager;
}
exports.default = ConcurrentSessionManager;
