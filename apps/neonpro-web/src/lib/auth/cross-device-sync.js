"use strict";
/**
 * Cross-Device Session Synchronization
 * Story 1.4 - Task 6: Real-time synchronization between devices
 *
 * Features:
 * - Real-time session state synchronization
 * - Cross-device notifications
 * - Conflict resolution
 * - Offline support with sync queue
 * - Device preference management
 * - Session handoff capabilities
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
exports.CrossDeviceSync = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var security_audit_logger_1 = require("./security-audit-logger");
var DEFAULT_CONFIG = {
  enabled: true,
  syncInterval: 30,
  maxRetries: 3,
  retryDelay: 5,
  conflictResolution: "latest_wins",
  offlineSupport: true,
  maxOfflineEvents: 1000,
  compressionEnabled: true,
  encryptionEnabled: true,
  batchSize: 50,
  heartbeatInterval: 60,
  timeoutThreshold: 300,
};
var CrossDeviceSync = /** @class */ (function () {
  function CrossDeviceSync(supabaseUrl, supabaseKey, customConfig) {
    this.activeSessions = new Map();
    this.syncQueue = new Map();
    this.conflictQueue = new Map();
    this.isOnline = true;
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = new security_audit_logger_1.SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.config = __assign(__assign({}, DEFAULT_CONFIG), customConfig);
    this.syncStatistics = {
      totalSessions: 0,
      activeSessions: 0,
      devicesOnline: 0,
      syncEventsProcessed: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      averageSyncLatency: 0,
      dataTransferred: 0,
      lastSyncAt: new Date(),
      syncHealth: "excellent",
    };
    if (this.config.enabled) {
      this.initialize();
    }
  }
  /**
   * Initialize cross-device synchronization
   */
  CrossDeviceSync.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Load existing sessions
            return [4 /*yield*/, this.loadActiveSessions()];
          case 1:
            // Load existing sessions
            _a.sent();
            // Set up real-time subscriptions
            return [4 /*yield*/, this.setupRealtimeSubscriptions()];
          case 2:
            // Set up real-time subscriptions
            _a.sent();
            // Start sync intervals
            this.startSyncInterval();
            this.startHeartbeatInterval();
            // Process any pending sync events
            return [4 /*yield*/, this.processPendingSyncEvents()];
          case 3:
            // Process any pending sync events
            _a.sent();
            console.log("Cross-device synchronization initialized");
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to initialize cross-device sync:", error_1);
            throw error_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Register a new device session
   */
  CrossDeviceSync.prototype.registerDeviceSession = function (
    sessionId,
    userId,
    deviceInfo,
    preferences,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var deviceId, session, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            deviceId = this.generateDeviceId(deviceInfo);
            _a = {
              sessionId: sessionId,
              userId: userId,
              deviceId: deviceId,
              deviceInfo: deviceInfo,
              isActive: true,
            };
            return [4 /*yield*/, this.shouldBePrimaryDevice(userId, deviceId)];
          case 1:
            session =
              ((_a.isPrimary = _b.sent()),
              (_a.lastActivity = new Date()),
              (_a.createdAt = new Date()),
              (_a.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)),
              (_a.syncState = {
                lastSyncAt: new Date(),
                pendingChanges: 0,
                conflictCount: 0,
                isOnline: true,
              }),
              (_a.preferences = __assign(
                {
                  notifications: true,
                  autoSync: true,
                  syncFrequency: this.config.syncInterval,
                  conflictResolution: this.config.conflictResolution,
                },
                preferences,
              )),
              (_a.metadata = {}),
              _a);
            // Store session
            return [4 /*yield*/, this.storeDeviceSession(session)];
          case 2:
            // Store session
            _b.sent();
            // Add to active sessions
            this.activeSessions.set(sessionId, session);
            // Create sync event
            return [
              4 /*yield*/,
              this.createSyncEvent({
                sessionId: sessionId,
                userId: userId,
                deviceId: deviceId,
                eventType: "session_created",
                data: { session: session },
              }),
            ];
          case 3:
            // Create sync event
            _b.sent();
            // Update statistics
            this.updateStatistics();
            return [2 /*return*/, session];
          case 4:
            error_2 = _b.sent();
            console.error("Failed to register device session:", error_2);
            throw error_2;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update device session
   */
  CrossDeviceSync.prototype.updateDeviceSession = function (sessionId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var existingSession, updatedSession, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            existingSession = this.activeSessions.get(sessionId);
            if (!existingSession) {
              throw new Error("Session not found");
            }
            updatedSession = __assign(__assign(__assign({}, existingSession), updates), {
              lastActivity: new Date(),
              syncState: __assign(__assign({}, existingSession.syncState), {
                pendingChanges: existingSession.syncState.pendingChanges + 1,
              }),
            });
            // Store updated session
            return [4 /*yield*/, this.storeDeviceSession(updatedSession)];
          case 1:
            // Store updated session
            _a.sent();
            // Update active sessions
            this.activeSessions.set(sessionId, updatedSession);
            // Create sync event
            return [
              4 /*yield*/,
              this.createSyncEvent({
                sessionId: sessionId,
                userId: updatedSession.userId,
                deviceId: updatedSession.deviceId,
                eventType: "session_updated",
                data: { updates: updates },
              }),
            ];
          case 2:
            // Create sync event
            _a.sent();
            return [2 /*return*/, updatedSession];
          case 3:
            error_3 = _a.sent();
            console.error("Failed to update device session:", error_3);
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate device session
   */
  CrossDeviceSync.prototype.terminateDeviceSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var session, terminatedSession, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            session = this.activeSessions.get(sessionId);
            if (!session) {
              return [2 /*return*/];
            }
            terminatedSession = __assign(__assign({}, session), {
              isActive: false,
              lastActivity: new Date(),
            });
            // Store terminated session
            return [4 /*yield*/, this.storeDeviceSession(terminatedSession)];
          case 1:
            // Store terminated session
            _a.sent();
            // Remove from active sessions
            this.activeSessions.delete(sessionId);
            // Create sync event
            return [
              4 /*yield*/,
              this.createSyncEvent({
                sessionId: sessionId,
                userId: session.userId,
                deviceId: session.deviceId,
                eventType: "session_terminated",
                data: { terminatedAt: new Date() },
              }),
            ];
          case 2:
            // Create sync event
            _a.sent();
            // Update statistics
            this.updateStatistics();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            console.error("Failed to terminate device session:", error_4);
            throw error_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Sync session data across devices
   */
  CrossDeviceSync.prototype.syncSessionData = function (sessionId, data) {
    return __awaiter(this, void 0, void 0, function () {
      var session, syncEvent, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            session = this.activeSessions.get(sessionId);
            if (!session) {
              throw new Error("Session not found");
            }
            return [
              4 /*yield*/,
              this.createSyncEvent({
                sessionId: sessionId,
                userId: session.userId,
                deviceId: session.deviceId,
                eventType: "data_changed",
                data: data,
              }),
            ];
          case 1:
            syncEvent = _a.sent();
            if (!this.isOnline) return [3 /*break*/, 3];
            return [4 /*yield*/, this.processSyncEvent(syncEvent)];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            // Queue for later processing
            this.queueSyncEvent(sessionId, syncEvent);
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_5 = _a.sent();
            console.error("Failed to sync session data:", error_5);
            throw error_5;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get user sessions across all devices
   */
  CrossDeviceSync.prototype.getUserSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_sessions")
                .select("*")
                .eq("user_id", userId)
                .eq("is_active", true)
                .order("last_activity", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get user sessions: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToSession)];
          case 2:
            error_6 = _b.sent();
            console.error("Failed to get user sessions:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Set primary device for user
   */
  CrossDeviceSync.prototype.setPrimaryDevice = function (userId, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, sessionId, session, error_7;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 4, , 5]);
            // Remove primary flag from all user devices
            return [
              4 /*yield*/,
              this.supabase
                .from("device_sessions")
                .update({ is_primary: false })
                .eq("user_id", userId),
            ];
          case 1:
            // Remove primary flag from all user devices
            _c.sent();
            // Set new primary device
            return [
              4 /*yield*/,
              this.supabase
                .from("device_sessions")
                .update({ is_primary: true })
                .eq("user_id", userId)
                .eq("device_id", deviceId),
            ];
          case 2:
            // Set new primary device
            _c.sent();
            // Update active sessions
            for (_i = 0, _a = this.activeSessions; _i < _a.length; _i++) {
              (_b = _a[_i]), (sessionId = _b[0]), (session = _b[1]);
              if (session.userId === userId) {
                session.isPrimary = session.deviceId === deviceId;
                this.activeSessions.set(sessionId, session);
              }
            }
            // Log the change
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "primary_device_changed",
                userId: userId,
                metadata: {
                  newPrimaryDevice: deviceId,
                },
              }),
            ];
          case 3:
            // Log the change
            _c.sent();
            return [3 /*break*/, 5];
          case 4:
            error_7 = _c.sent();
            console.error("Failed to set primary device:", error_7);
            throw error_7;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle session handoff between devices
   */
  CrossDeviceSync.prototype.handoffSession = function (fromSessionId_1, toDeviceId_1) {
    return __awaiter(this, arguments, void 0, function (fromSessionId, toDeviceId, preserveState) {
      var fromSession, newSessionId, handoffSession, error_8;
      if (preserveState === void 0) {
        preserveState = true;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            fromSession = this.activeSessions.get(fromSessionId);
            if (!fromSession) {
              throw new Error("Source session not found");
            }
            newSessionId = "session_"
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9));
            handoffSession = __assign(__assign({}, fromSession), {
              sessionId: newSessionId,
              deviceId: toDeviceId,
              createdAt: new Date(),
              lastActivity: new Date(),
              syncState: {
                lastSyncAt: new Date(),
                pendingChanges: 0,
                conflictCount: 0,
                isOnline: true,
              },
              metadata: __assign(__assign({}, fromSession.metadata), {
                handoffFrom: fromSessionId,
                handoffAt: new Date().toISOString(),
                statePreserved: preserveState,
              }),
            });
            // Store new session
            return [4 /*yield*/, this.storeDeviceSession(handoffSession)];
          case 1:
            // Store new session
            _a.sent();
            // Add to active sessions
            this.activeSessions.set(newSessionId, handoffSession);
            if (!!preserveState) return [3 /*break*/, 3];
            return [4 /*yield*/, this.terminateDeviceSession(fromSessionId)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Create sync event
            return [
              4 /*yield*/,
              this.createSyncEvent({
                sessionId: newSessionId,
                userId: fromSession.userId,
                deviceId: toDeviceId,
                eventType: "session_created",
                data: {
                  handoffFrom: fromSessionId,
                  preserveState: preserveState,
                },
              }),
            ];
          case 4:
            // Create sync event
            _a.sent();
            return [2 /*return*/, newSessionId];
          case 5:
            error_8 = _a.sent();
            console.error("Failed to handoff session:", error_8);
            throw error_8;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Resolve sync conflict
   */
  CrossDeviceSync.prototype.resolveSyncConflict = function (conflictId, resolution, resolvedData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, conflictData, error, conflict, finalData, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("sync_conflicts")
                .select("*")
                .eq("conflict_id", conflictId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (conflictData = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get conflict: ".concat(error.message));
            }
            conflict = this.mapDatabaseToConflict(conflictData);
            finalData = void 0;
            switch (resolution) {
              case "use_local":
                finalData = conflict.localData;
                break;
              case "use_remote":
                finalData = conflict.remoteData;
                break;
              case "merge":
                finalData = __assign(__assign({}, conflict.remoteData), conflict.localData);
                break;
              case "manual":
                if (!resolvedData) {
                  throw new Error("Resolved data required for manual resolution");
                }
                finalData = resolvedData;
                break;
              default:
                throw new Error("Invalid resolution type");
            }
            // Update conflict as resolved
            return [
              4 /*yield*/,
              this.supabase
                .from("sync_conflicts")
                .update({
                  is_resolved: true,
                  resolved_at: new Date().toISOString(),
                  resolution: "manual",
                  resolution_strategy: resolution,
                  resolved_data: finalData,
                })
                .eq("conflict_id", conflictId),
            ];
          case 2:
            // Update conflict as resolved
            _b.sent();
            // Apply resolved data
            return [4 /*yield*/, this.syncSessionData(conflict.sessionId, finalData)];
          case 3:
            // Apply resolved data
            _b.sent();
            // Update statistics
            this.syncStatistics.conflictsResolved++;
            return [3 /*break*/, 5];
          case 4:
            error_9 = _b.sent();
            console.error("Failed to resolve sync conflict:", error_9);
            throw error_9;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get sync conflicts for user
   */
  CrossDeviceSync.prototype.getSyncConflicts = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("sync_conflicts")
                .select("*")
                .eq("user_id", userId)
                .eq("is_resolved", false)
                .order("detected_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get sync conflicts: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToConflict)];
          case 2:
            error_10 = _b.sent();
            console.error("Failed to get sync conflicts:", error_10);
            throw error_10;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get synchronization statistics
   */
  CrossDeviceSync.prototype.getSyncStatistics = function () {
    return __assign({}, this.syncStatistics);
  };
  /**
   * Update sync configuration
   */
  CrossDeviceSync.prototype.updateConfig = function (newConfig) {
    this.config = __assign(__assign({}, this.config), newConfig);
    // Restart intervals if needed
    if (this.config.enabled && !this.syncInterval) {
      this.startSyncInterval();
      this.startHeartbeatInterval();
    } else if (!this.config.enabled && this.syncInterval) {
      this.stopSync();
    }
  };
  /**
   * Stop synchronization
   */
  CrossDeviceSync.prototype.stopSync = function () {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
    if (this.websocketConnection) {
      this.websocketConnection.close();
      this.websocketConnection = undefined;
    }
    console.log("Cross-device synchronization stopped");
  };
  // Private methods
  CrossDeviceSync.prototype.loadActiveSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, _i, _b, sessionData, session, error_11;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("device_sessions").select("*").eq("is_active", true),
            ];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to load active sessions:", error);
              return [2 /*return*/];
            }
            for (_i = 0, _b = data || []; _i < _b.length; _i++) {
              sessionData = _b[_i];
              session = this.mapDatabaseToSession(sessionData);
              this.activeSessions.set(session.sessionId, session);
            }
            this.updateStatistics();
            return [3 /*break*/, 3];
          case 2:
            error_11 = _c.sent();
            console.error("Failed to load active sessions:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.setupRealtimeSubscriptions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        try {
          // Subscribe to sync events
          this.supabase
            .channel("sync_events")
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "sync_events",
              },
              function (payload) {
                _this.handleRealtimeSyncEvent(payload.new);
              },
            )
            .subscribe();
          // Subscribe to session changes
          this.supabase
            .channel("device_sessions")
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "device_sessions",
              },
              function (payload) {
                _this.handleRealtimeSessionChange(payload);
              },
            )
            .subscribe();
        } catch (error) {
          console.error("Failed to setup realtime subscriptions:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  CrossDeviceSync.prototype.startSyncInterval = function () {
    var _this = this;
    this.syncInterval = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_12;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [4 /*yield*/, this.processPendingSyncEvents()];
            case 1:
              _a.sent();
              return [4 /*yield*/, this.detectAndResolveConflicts()];
            case 2:
              _a.sent();
              this.updateStatistics();
              return [3 /*break*/, 4];
            case 3:
              error_12 = _a.sent();
              console.error("Sync interval processing failed:", error_12);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    }, this.config.syncInterval * 1000);
  };
  CrossDeviceSync.prototype.startHeartbeatInterval = function () {
    var _this = this;
    this.heartbeatInterval = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_13;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [4 /*yield*/, this.sendHeartbeat()];
            case 1:
              _a.sent();
              return [4 /*yield*/, this.checkSessionTimeouts()];
            case 2:
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              error_13 = _a.sent();
              console.error("Heartbeat processing failed:", error_13);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    }, this.config.heartbeatInterval * 1000);
  };
  CrossDeviceSync.prototype.processPendingSyncEvents = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, pendingEvents, error, _i, _b, eventData, syncEvent, error_14;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              this.supabase
                .from("sync_events")
                .select("*")
                .eq("is_processed", false)
                .order("timestamp", { ascending: true })
                .limit(this.config.batchSize),
            ];
          case 1:
            (_a = _c.sent()), (pendingEvents = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get pending sync events:", error);
              return [2 /*return*/];
            }
            (_i = 0), (_b = pendingEvents || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 5];
            eventData = _b[_i];
            syncEvent = this.mapDatabaseToSyncEvent(eventData);
            return [4 /*yield*/, this.processSyncEvent(syncEvent)];
          case 3:
            _c.sent();
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_14 = _c.sent();
            console.error("Failed to process pending sync events:", error_14);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.processSyncEvent = function (syncEvent) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, _a, processingTime, error_15;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 11, , 13]);
            startTime = Date.now();
            _a = syncEvent.eventType;
            switch (_a) {
              case "session_created":
                return [3 /*break*/, 1];
              case "session_updated":
                return [3 /*break*/, 1];
              case "session_terminated":
                return [3 /*break*/, 3];
              case "data_changed":
                return [3 /*break*/, 5];
              case "activity_recorded":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            return [4 /*yield*/, this.syncSessionUpdate(syncEvent)];
          case 2:
            _b.sent();
            return [3 /*break*/, 9];
          case 3:
            return [4 /*yield*/, this.syncSessionTermination(syncEvent)];
          case 4:
            _b.sent();
            return [3 /*break*/, 9];
          case 5:
            return [4 /*yield*/, this.syncDataChange(syncEvent)];
          case 6:
            _b.sent();
            return [3 /*break*/, 9];
          case 7:
            return [4 /*yield*/, this.syncActivityRecord(syncEvent)];
          case 8:
            _b.sent();
            return [3 /*break*/, 9];
          case 9:
            // Mark as processed
            return [
              4 /*yield*/,
              this.supabase
                .from("sync_events")
                .update({ is_processed: true })
                .eq("event_id", syncEvent.eventId),
            ];
          case 10:
            // Mark as processed
            _b.sent();
            processingTime = Date.now() - startTime;
            this.updateSyncLatency(processingTime);
            this.syncStatistics.syncEventsProcessed++;
            return [3 /*break*/, 13];
          case 11:
            error_15 = _b.sent();
            console.error("Failed to process sync event:", error_15);
            // Mark as failed
            return [
              4 /*yield*/,
              this.supabase
                .from("sync_events")
                .update({
                  processing_errors: [error_15.message],
                })
                .eq("event_id", syncEvent.eventId),
            ];
          case 12:
            // Mark as failed
            _b.sent();
            return [3 /*break*/, 13];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.syncSessionUpdate = function (syncEvent) {
    return __awaiter(this, void 0, void 0, function () {
      var session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            session = this.activeSessions.get(syncEvent.sessionId);
            if (!session) return [3 /*break*/, 2];
            // Broadcast update to other devices
            return [
              4 /*yield*/,
              this.broadcastToUserDevices(syncEvent.userId, {
                type: "session_update",
                sessionId: syncEvent.sessionId,
                data: syncEvent.data,
              }),
            ];
          case 1:
            // Broadcast update to other devices
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.syncSessionTermination = function (syncEvent) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Remove session from active sessions
            this.activeSessions.delete(syncEvent.sessionId);
            // Broadcast termination to other devices
            return [
              4 /*yield*/,
              this.broadcastToUserDevices(syncEvent.userId, {
                type: "session_terminated",
                sessionId: syncEvent.sessionId,
                data: syncEvent.data,
              }),
            ];
          case 1:
            // Broadcast termination to other devices
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.syncDataChange = function (syncEvent) {
    return __awaiter(this, void 0, void 0, function () {
      var conflict;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.detectDataConflict(syncEvent)];
          case 1:
            conflict = _a.sent();
            if (!conflict) return [3 /*break*/, 3];
            return [4 /*yield*/, this.handleSyncConflict(conflict)];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            // Broadcast data change to other devices
            return [
              4 /*yield*/,
              this.broadcastToUserDevices(syncEvent.userId, {
                type: "data_change",
                sessionId: syncEvent.sessionId,
                data: syncEvent.data,
              }),
            ];
          case 4:
            // Broadcast data change to other devices
            _a.sent();
            _a.label = 5;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.syncActivityRecord = function (syncEvent) {
    return __awaiter(this, void 0, void 0, function () {
      var session;
      return __generator(this, function (_a) {
        session = this.activeSessions.get(syncEvent.sessionId);
        if (session) {
          session.lastActivity = new Date();
          this.activeSessions.set(syncEvent.sessionId, session);
        }
        return [2 /*return*/];
      });
    });
  };
  CrossDeviceSync.prototype.detectDataConflict = function (syncEvent) {
    return __awaiter(this, void 0, void 0, function () {
      var session, recentEvents, conflictingEvents;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            session = this.activeSessions.get(syncEvent.sessionId);
            if (!session) {
              return [2 /*return*/, null];
            }
            return [4 /*yield*/, this.getRecentSyncEvents(syncEvent.sessionId, 60)];
          case 1:
            recentEvents = _a.sent();
            conflictingEvents = recentEvents.filter(
              function (event) {
                return (
                  event.eventId !== syncEvent.eventId &&
                  event.eventType === "data_changed" &&
                  Math.abs(event.timestamp.getTime() - syncEvent.timestamp.getTime()) < 5000
                );
              }, // 5 seconds
            );
            if (conflictingEvents.length > 0) {
              return [
                2 /*return*/,
                {
                  conflictId: "conflict_"
                    .concat(Date.now(), "_")
                    .concat(Math.random().toString(36).substr(2, 9)),
                  sessionId: syncEvent.sessionId,
                  userId: syncEvent.userId,
                  conflictType: "data_conflict",
                  description: "Concurrent data modifications detected",
                  detectedAt: new Date(),
                  localData: syncEvent.data,
                  remoteData: conflictingEvents[0].data,
                  isResolved: false,
                },
              ];
            }
            return [2 /*return*/, null];
        }
      });
    });
  };
  CrossDeviceSync.prototype.handleSyncConflict = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var userConflicts, error_16;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            // Store conflict
            return [
              4 /*yield*/,
              this.supabase.from("sync_conflicts").insert({
                conflict_id: conflict.conflictId,
                session_id: conflict.sessionId,
                user_id: conflict.userId,
                conflict_type: conflict.conflictType,
                description: conflict.description,
                detected_at: conflict.detectedAt.toISOString(),
                local_data: conflict.localData,
                remote_data: conflict.remoteData,
                is_resolved: false,
              }),
            ];
          case 1:
            // Store conflict
            _a.sent();
            userConflicts = this.conflictQueue.get(conflict.userId) || [];
            userConflicts.push(conflict);
            this.conflictQueue.set(conflict.userId, userConflicts);
            // Update statistics
            this.syncStatistics.conflictsDetected++;
            if (!(this.config.conflictResolution !== "manual")) return [3 /*break*/, 3];
            return [4 /*yield*/, this.attemptAutomaticResolution(conflict)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_16 = _a.sent();
            console.error("Failed to handle sync conflict:", error_16);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.attemptAutomaticResolution = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var resolution, session, error_17;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            resolution = void 0;
            switch (this.config.conflictResolution) {
              case "latest_wins":
                // Use the data from the most recent event
                resolution = "use_local"; // Assuming local is more recent
                break;
              case "primary_wins":
                session = this.activeSessions.get(conflict.sessionId);
                resolution = (session === null || session === void 0 ? void 0 : session.isPrimary)
                  ? "use_local"
                  : "use_remote";
                break;
              default:
                return [2 /*return*/]; // Manual resolution required
            }
            return [4 /*yield*/, this.resolveSyncConflict(conflict.conflictId, resolution)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_17 = _a.sent();
            console.error("Failed to automatically resolve conflict:", error_17);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.detectAndResolveConflicts = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  CrossDeviceSync.prototype.sendHeartbeat = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, sessionId, session, error_18;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, , 6]);
            (_i = 0), (_a = this.activeSessions);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (sessionId = _b[0]), (session = _b[1]);
            return [
              4 /*yield*/,
              this.createSyncEvent({
                sessionId: sessionId,
                userId: session.userId,
                deviceId: session.deviceId,
                eventType: "activity_recorded",
                data: { heartbeat: true },
              }),
            ];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_18 = _c.sent();
            console.error("Failed to send heartbeat:", error_18);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.checkSessionTimeouts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, timeoutThreshold, _i, _a, _b, sessionId, session, timeSinceActivity, error_19;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, , 6]);
            now = new Date();
            timeoutThreshold = this.config.timeoutThreshold * 1000;
            (_i = 0), (_a = this.activeSessions);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (sessionId = _b[0]), (session = _b[1]);
            timeSinceActivity = now.getTime() - session.lastActivity.getTime();
            if (!(timeSinceActivity > timeoutThreshold)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.terminateDeviceSession(sessionId)];
          case 2:
            _c.sent();
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_19 = _c.sent();
            console.error("Failed to check session timeouts:", error_19);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.broadcastToUserDevices = function (userId, message) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would broadcast messages to all user devices via WebSocket
        // For now, it's a placeholder
        console.log("Broadcasting to user ".concat(userId, ":"), message);
        return [2 /*return*/];
      });
    });
  };
  CrossDeviceSync.prototype.getRecentSyncEvents = function (sessionId, seconds) {
    return __awaiter(this, void 0, void 0, function () {
      var since, _a, data, error, error_20;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            since = new Date(Date.now() - seconds * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("sync_events")
                .select("*")
                .eq("session_id", sessionId)
                .gte("timestamp", since.toISOString())
                .order("timestamp", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get recent sync events:", error);
              return [2 /*return*/, []];
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToSyncEvent)];
          case 2:
            error_20 = _b.sent();
            console.error("Failed to get recent sync events:", error_20);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.generateDeviceId = function (deviceInfo) {
    // Generate a consistent device ID based on device characteristics
    var deviceString = ""
      .concat(deviceInfo.type, "_")
      .concat(deviceInfo.os, "_")
      .concat(deviceInfo.browser, "_")
      .concat(deviceInfo.userAgent);
    return "device_".concat(this.hashString(deviceString));
  };
  CrossDeviceSync.prototype.hashString = function (str) {
    // Simple hash function (in production, use a proper hash function)
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };
  CrossDeviceSync.prototype.shouldBePrimaryDevice = function (userId, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, count, error, error_21;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_sessions")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("is_active", true),
            ];
          case 1:
            (_a = _b.sent()), (count = _a.count), (error = _a.error);
            if (error) {
              console.error("Failed to check existing devices:", error);
              return [2 /*return*/, true]; // Default to primary if check fails
            }
            // First device becomes primary
            return [2 /*return*/, (count || 0) === 0];
          case 2:
            error_21 = _b.sent();
            console.error("Failed to determine primary device:", error_21);
            return [2 /*return*/, true];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.createSyncEvent = function (eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var syncEvent, error_22;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            syncEvent = __assign(__assign({}, eventData), {
              eventId: "event_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              timestamp: new Date(),
              version: 1,
              checksum: this.calculateChecksum(eventData.data),
              isProcessed: false,
            });
            // Store sync event
            return [
              4 /*yield*/,
              this.supabase.from("sync_events").insert({
                event_id: syncEvent.eventId,
                session_id: syncEvent.sessionId,
                user_id: syncEvent.userId,
                device_id: syncEvent.deviceId,
                event_type: syncEvent.eventType,
                timestamp: syncEvent.timestamp.toISOString(),
                data: syncEvent.data,
                version: syncEvent.version,
                checksum: syncEvent.checksum,
                is_processed: syncEvent.isProcessed,
              }),
            ];
          case 1:
            // Store sync event
            _a.sent();
            return [2 /*return*/, syncEvent];
          case 2:
            error_22 = _a.sent();
            console.error("Failed to create sync event:", error_22);
            throw error_22;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.queueSyncEvent = function (sessionId, syncEvent) {
    var queue = this.syncQueue.get(sessionId) || [];
    queue.push(syncEvent);
    // Limit queue size
    if (queue.length > this.config.maxOfflineEvents) {
      queue.splice(0, queue.length - this.config.maxOfflineEvents);
    }
    this.syncQueue.set(sessionId, queue);
  };
  CrossDeviceSync.prototype.calculateChecksum = function (data) {
    // Simple checksum calculation (in production, use a proper hash function)
    var dataString = JSON.stringify(data);
    return this.hashString(dataString);
  };
  CrossDeviceSync.prototype.updateStatistics = function () {
    this.syncStatistics.totalSessions = this.activeSessions.size;
    this.syncStatistics.activeSessions = Array.from(this.activeSessions.values()).filter(
      function (s) {
        return s.isActive;
      },
    ).length;
    this.syncStatistics.devicesOnline = Array.from(this.activeSessions.values()).filter(
      function (s) {
        return s.syncState.isOnline;
      },
    ).length;
    this.syncStatistics.lastSyncAt = new Date();
    // Calculate sync health
    var conflictRate =
      this.syncStatistics.conflictsDetected / Math.max(this.syncStatistics.syncEventsProcessed, 1);
    if (conflictRate < 0.01) {
      this.syncStatistics.syncHealth = "excellent";
    } else if (conflictRate < 0.05) {
      this.syncStatistics.syncHealth = "good";
    } else if (conflictRate < 0.1) {
      this.syncStatistics.syncHealth = "fair";
    } else {
      this.syncStatistics.syncHealth = "poor";
    }
  };
  CrossDeviceSync.prototype.updateSyncLatency = function (latency) {
    var currentAverage = this.syncStatistics.averageSyncLatency;
    var eventCount = this.syncStatistics.syncEventsProcessed;
    // Calculate rolling average
    this.syncStatistics.averageSyncLatency =
      (currentAverage * eventCount + latency) / (eventCount + 1);
  };
  CrossDeviceSync.prototype.storeDeviceSession = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var error_23;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("device_sessions").upsert({
                session_id: session.sessionId,
                user_id: session.userId,
                device_id: session.deviceId,
                device_info: session.deviceInfo,
                is_active: session.isActive,
                is_primary: session.isPrimary,
                last_activity: session.lastActivity.toISOString(),
                created_at: session.createdAt.toISOString(),
                expires_at: session.expiresAt.toISOString(),
                sync_state: session.syncState,
                preferences: session.preferences,
                metadata: session.metadata,
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_23 = _a.sent();
            console.error("Failed to store device session:", error_23);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  CrossDeviceSync.prototype.handleRealtimeSyncEvent = function (eventData) {
    // Handle real-time sync events from Supabase
    var syncEvent = this.mapDatabaseToSyncEvent(eventData);
    this.processSyncEvent(syncEvent);
  };
  CrossDeviceSync.prototype.handleRealtimeSessionChange = function (payload) {
    // Handle real-time session changes from Supabase
    var sessionData = payload.new || payload.old;
    var session = this.mapDatabaseToSession(sessionData);
    if (payload.eventType === "DELETE" || !session.isActive) {
      this.activeSessions.delete(session.sessionId);
    } else {
      this.activeSessions.set(session.sessionId, session);
    }
    this.updateStatistics();
  };
  CrossDeviceSync.prototype.mapDatabaseToSession = function (data) {
    return {
      sessionId: data.session_id,
      userId: data.user_id,
      deviceId: data.device_id,
      deviceInfo: data.device_info,
      isActive: data.is_active,
      isPrimary: data.is_primary,
      lastActivity: new Date(data.last_activity),
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
      syncState: data.sync_state,
      preferences: data.preferences,
      metadata: data.metadata || {},
    };
  };
  CrossDeviceSync.prototype.mapDatabaseToSyncEvent = function (data) {
    return {
      eventId: data.event_id,
      sessionId: data.session_id,
      userId: data.user_id,
      deviceId: data.device_id,
      eventType: data.event_type,
      timestamp: new Date(data.timestamp),
      data: data.data,
      version: data.version,
      checksum: data.checksum,
      isProcessed: data.is_processed,
      processingErrors: data.processing_errors,
    };
  };
  CrossDeviceSync.prototype.mapDatabaseToConflict = function (data) {
    return {
      conflictId: data.conflict_id,
      sessionId: data.session_id,
      userId: data.user_id,
      conflictType: data.conflict_type,
      description: data.description,
      detectedAt: new Date(data.detected_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      resolution: data.resolution,
      resolutionStrategy: data.resolution_strategy,
      localData: data.local_data,
      remoteData: data.remote_data,
      resolvedData: data.resolved_data,
      isResolved: data.is_resolved,
    };
  };
  return CrossDeviceSync;
})();
exports.CrossDeviceSync = CrossDeviceSync;
