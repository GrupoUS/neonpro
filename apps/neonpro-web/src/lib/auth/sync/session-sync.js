// Session Synchronization System
// Real-time session state synchronization across multiple devices
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSyncManager = void 0;
var session_config_1 = require("@/lib/auth/config/session-config");
var session_utils_1 = require("@/lib/auth/utils/session-utils");
var SessionSyncManager = /** @class */ (() => {
  function SessionSyncManager(deviceId) {
    this.syncStates = new Map();
    this.webSocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatInterval = null;
    this.syncInterval = null;
    this.eventListeners = new Map();
    this.isConnected = false;
    this.userId = null;
    this.config = session_config_1.SessionConfig.getInstance();
    this.utils = new session_utils_1.SessionUtils();
    this.deviceId = deviceId;
  }
  /**
   * Initialize sync manager for user
   */
  SessionSyncManager.prototype.initialize = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            this.userId = userId;
            // Initialize sync state
            return [4 /*yield*/, this.initializeSyncState(userId)];
          case 1:
            // Initialize sync state
            _a.sent();
            // Connect to sync server
            return [4 /*yield*/, this.connectToSyncServer()];
          case 2:
            // Connect to sync server
            _a.sent();
            // Start periodic sync
            this.startPeriodicSync();
            // Start heartbeat
            this.startHeartbeat();
            console.log("Session sync initialized for user ".concat(userId));
            this.emit("sync_initialized", { userId: userId, deviceId: this.deviceId });
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Error initializing session sync:", error_1);
            throw error_1;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Initialize sync state for user
   */
  SessionSyncManager.prototype.initializeSyncState = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var existingState, syncState;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            existingState = this.syncStates.get(userId);
            if (!existingState) {
              syncState = {
                userId: userId,
                lastSyncTimestamp: Date.now(),
                deviceStates: new Map(),
                pendingEvents: [],
                conflictQueue: [],
                syncVersion: 1,
                isOnline: false,
              };
              this.syncStates.set(userId, syncState);
            }
            // Load existing sync data from storage
            return [4 /*yield*/, this.loadSyncDataFromStorage(userId)];
          case 1:
            // Load existing sync data from storage
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Connect to WebSocket sync server
   */
  SessionSyncManager.prototype.connectToSyncServer = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        new Promise((resolve, reject) => {
          try {
            var wsUrl = this.config.getWebSocketUrl();
            this.webSocket = new WebSocket(wsUrl);
            this.webSocket.onopen = () => {
              console.log("Connected to sync server");
              this.isConnected = true;
              this.reconnectAttempts = 0;
              // Send authentication
              this.sendAuthMessage();
              // Update sync state
              var syncState = this.syncStates.get(this.userId);
              if (syncState) {
                syncState.isOnline = true;
              }
              this.emit("sync_connected", { deviceId: this.deviceId });
              resolve();
            };
            this.webSocket.onmessage = (event) => {
              this.handleSyncMessage(JSON.parse(event.data));
            };
            this.webSocket.onclose = () => {
              console.log("Disconnected from sync server");
              this.isConnected = false;
              // Update sync state
              var syncState = this.syncStates.get(this.userId);
              if (syncState) {
                syncState.isOnline = false;
              }
              this.emit("sync_disconnected", { deviceId: this.deviceId });
              // Attempt reconnection
              this.attemptReconnection();
            };
            this.webSocket.onerror = (error) => {
              console.error("WebSocket error:", error);
              this.emit("sync_error", { error: error, deviceId: this.deviceId });
              reject(error);
            };
          } catch (error) {
            reject(error);
          }
        }),
      ]);
    });
  };
  /**
   * Send authentication message
   */
  SessionSyncManager.prototype.sendAuthMessage = function () {
    if (this.webSocket && this.userId) {
      var authMessage = {
        type: "sync_request",
        payload: {
          action: "authenticate",
          userId: this.userId,
          deviceId: this.deviceId,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        messageId: this.utils.generateSessionToken(),
        senderId: this.deviceId,
      };
      this.webSocket.send(JSON.stringify(authMessage));
    }
  };
  /**
   * Handle incoming sync messages
   */
  SessionSyncManager.prototype.handleSyncMessage = function (message) {
    try {
      switch (message.type) {
        case "sync_event":
          this.handleSyncEvent(message.payload);
          break;
        case "sync_request":
          this.handleSyncRequest(message);
          break;
        case "sync_response":
          this.handleSyncResponse(message);
          break;
        case "heartbeat":
          this.handleHeartbeat(message);
          break;
        case "conflict_notification":
          this.handleConflictNotification(message.payload);
          break;
        case "resolution_request":
          this.handleResolutionRequest(message.payload);
          break;
        case "ack":
          this.handleAcknowledgment(message);
          break;
        case "nack":
          this.handleNegativeAcknowledgment(message);
          break;
        default:
          console.warn("Unknown sync message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling sync message:", error);
    }
  };
  /**
   * Handle sync event
   */
  SessionSyncManager.prototype.handleSyncEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var syncState, conflict;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.userId) return [2 /*return*/];
            syncState = this.syncStates.get(this.userId);
            if (!syncState) return [2 /*return*/];
            return [4 /*yield*/, this.detectConflict(event, syncState)];
          case 1:
            conflict = _a.sent();
            if (!conflict) return [3 /*break*/, 3];
            return [4 /*yield*/, this.handleConflict(conflict)];
          case 2:
            _a.sent();
            return [2 /*return*/];
          case 3:
            // Apply event
            return [4 /*yield*/, this.applySyncEvent(event)];
          case 4:
            // Apply event
            _a.sent();
            // Update sync state
            syncState.lastSyncTimestamp = Math.max(syncState.lastSyncTimestamp, event.timestamp);
            syncState.syncVersion++;
            // Send acknowledgment
            this.sendAcknowledgment(event.id);
            // Emit event
            this.emit("sync_event_applied", event);
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Detect sync conflicts
   */
  SessionSyncManager.prototype.detectConflict = function (event, syncState) {
    return __awaiter(this, void 0, void 0, function () {
      var deviceState, recentEvents;
      return __generator(this, function (_a) {
        deviceState = syncState.deviceStates.get(event.deviceId);
        if (deviceState && event.version <= deviceState.version) {
          return [
            2 /*return*/,
            {
              id: this.utils.generateSessionToken(),
              type: "version_mismatch",
              userId: event.userId,
              sessionId: event.sessionId,
              conflictingDevices: [event.deviceId, this.deviceId],
              localVersion: event,
              remoteVersions: [],
              resolutionStrategy: "last_write_wins",
            },
          ];
        }
        recentEvents = syncState.pendingEvents.filter(
          (e) => e.sessionId === event.sessionId && Math.abs(e.timestamp - event.timestamp) < 5000, // 5 seconds
        );
        if (recentEvents.length > 0) {
          return [
            2 /*return*/,
            {
              id: this.utils.generateSessionToken(),
              type: "concurrent_update",
              userId: event.userId,
              sessionId: event.sessionId,
              conflictingDevices: [event.deviceId, this.deviceId],
              localVersion: event,
              remoteVersions: recentEvents,
              resolutionStrategy: "merge_changes",
            },
          ];
        }
        return [2 /*return*/, null];
      });
    });
  };
  /**
   * Handle sync conflict
   */
  SessionSyncManager.prototype.handleConflict = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var syncState, resolution;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.userId) return [2 /*return*/];
            syncState = this.syncStates.get(this.userId);
            if (!syncState) return [2 /*return*/];
            // Add to conflict queue
            syncState.conflictQueue.push(conflict);
            return [4 /*yield*/, this.resolveConflict(conflict)];
          case 1:
            resolution = _a.sent();
            if (!resolution) return [3 /*break*/, 3];
            return [4 /*yield*/, this.applyConflictResolution(conflict, resolution)];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            // Notify about manual resolution needed
            this.emit("conflict_detected", conflict);
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Resolve sync conflict
   */
  SessionSyncManager.prototype.resolveConflict = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = conflict.resolutionStrategy;
            switch (_a) {
              case "last_write_wins":
                return [3 /*break*/, 1];
              case "first_write_wins":
                return [3 /*break*/, 2];
              case "merge_changes":
                return [3 /*break*/, 3];
              case "device_priority":
                return [3 /*break*/, 5];
              case "rollback_changes":
                return [3 /*break*/, 6];
            }
            return [3 /*break*/, 7];
          case 1:
            return [2 /*return*/, this.resolveLastWriteWins(conflict)];
          case 2:
            return [2 /*return*/, this.resolveFirstWriteWins(conflict)];
          case 3:
            return [4 /*yield*/, this.resolveMergeChanges(conflict)];
          case 4:
            return [2 /*return*/, _b.sent()];
          case 5:
            return [2 /*return*/, this.resolveDevicePriority(conflict)];
          case 6:
            return [2 /*return*/, this.resolveRollback(conflict)];
          case 7:
            return [2 /*return*/, null]; // Manual resolution required
        }
      });
    });
  };
  /**
   * Conflict resolution strategies
   */
  SessionSyncManager.prototype.resolveLastWriteWins = (conflict) => {
    var allEvents = __spreadArray([conflict.localVersion], conflict.remoteVersions, true);
    return allEvents.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest,
    );
  };
  SessionSyncManager.prototype.resolveFirstWriteWins = (conflict) => {
    var allEvents = __spreadArray([conflict.localVersion], conflict.remoteVersions, true);
    return allEvents.reduce((earliest, current) =>
      current.timestamp < earliest.timestamp ? current : earliest,
    );
  };
  SessionSyncManager.prototype.resolveMergeChanges = function (conflict) {
    return __awaiter(this, void 0, void 0, function () {
      var mergedData, mergedEvent;
      return __generator(this, function (_a) {
        try {
          mergedData = this.mergeEventData(
            conflict.localVersion.data,
            conflict.remoteVersions.map((e) => e.data),
          );
          mergedEvent = {
            id: this.utils.generateSessionToken(),
            type: conflict.localVersion.type,
            userId: conflict.userId,
            sessionId: conflict.sessionId,
            deviceId: this.deviceId,
            data: mergedData,
            timestamp: Date.now(),
            version:
              Math.max.apply(
                Math,
                __spreadArray(
                  [conflict.localVersion.version],
                  conflict.remoteVersions.map((e) => e.version),
                  false,
                ),
              ) + 1,
            checksum: this.calculateChecksum(mergedData),
          };
          return [2 /*return*/, mergedEvent];
        } catch (error) {
          console.error("Error merging changes:", error);
          return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  };
  SessionSyncManager.prototype.resolveDevicePriority = function (conflict) {
    // Use device priority order (could be configured)
    var devicePriority = this.getDevicePriority();
    var allEvents = __spreadArray([conflict.localVersion], conflict.remoteVersions, true);
    return allEvents.reduce((highest, current) => {
      var currentPriority = devicePriority[current.deviceId] || 0;
      var highestPriority = devicePriority[highest.deviceId] || 0;
      return currentPriority > highestPriority ? current : highest;
    });
  };
  SessionSyncManager.prototype.resolveRollback = function (conflict) {
    // Create rollback event
    return {
      id: this.utils.generateSessionToken(),
      type: "session_updated",
      userId: conflict.userId,
      sessionId: conflict.sessionId,
      deviceId: this.deviceId,
      data: { action: "rollback", conflictId: conflict.id },
      timestamp: Date.now(),
      version: conflict.localVersion.version + 1,
      checksum: "",
    };
  };
  /**
   * Apply sync event to local state
   */
  SessionSyncManager.prototype.applySyncEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 19, , 20]);
            _a = event.type;
            switch (_a) {
              case "session_created":
                return [3 /*break*/, 1];
              case "session_updated":
                return [3 /*break*/, 3];
              case "session_terminated":
                return [3 /*break*/, 5];
              case "device_registered":
                return [3 /*break*/, 7];
              case "device_updated":
                return [3 /*break*/, 9];
              case "device_removed":
                return [3 /*break*/, 11];
              case "preferences_updated":
                return [3 /*break*/, 13];
              case "security_event":
                return [3 /*break*/, 15];
            }
            return [3 /*break*/, 17];
          case 1:
            return [4 /*yield*/, this.applySessionCreated(event)];
          case 2:
            _b.sent();
            return [3 /*break*/, 18];
          case 3:
            return [4 /*yield*/, this.applySessionUpdated(event)];
          case 4:
            _b.sent();
            return [3 /*break*/, 18];
          case 5:
            return [4 /*yield*/, this.applySessionTerminated(event)];
          case 6:
            _b.sent();
            return [3 /*break*/, 18];
          case 7:
            return [4 /*yield*/, this.applyDeviceRegistered(event)];
          case 8:
            _b.sent();
            return [3 /*break*/, 18];
          case 9:
            return [4 /*yield*/, this.applyDeviceUpdated(event)];
          case 10:
            _b.sent();
            return [3 /*break*/, 18];
          case 11:
            return [4 /*yield*/, this.applyDeviceRemoved(event)];
          case 12:
            _b.sent();
            return [3 /*break*/, 18];
          case 13:
            return [4 /*yield*/, this.applyPreferencesUpdated(event)];
          case 14:
            _b.sent();
            return [3 /*break*/, 18];
          case 15:
            return [4 /*yield*/, this.applySecurityEvent(event)];
          case 16:
            _b.sent();
            return [3 /*break*/, 18];
          case 17:
            console.warn("Unknown sync event type:", event.type);
            _b.label = 18;
          case 18:
            return [3 /*break*/, 20];
          case 19:
            error_2 = _b.sent();
            console.error("Error applying sync event:", error_2);
            throw error_2;
          case 20:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Event application methods
   */
  SessionSyncManager.prototype.applySessionCreated = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Apply session creation to local state
            return [
              4 /*yield*/,
              fetch("/api/session/sync/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event.data),
              }),
            ];
          case 1:
            // Apply session creation to local state
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSyncManager.prototype.applySessionUpdated = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Apply session update to local state
            return [
              4 /*yield*/,
              fetch("/api/session/sync/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: event.sessionId,
                  updates: event.data,
                }),
              }),
            ];
          case 1:
            // Apply session update to local state
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSyncManager.prototype.applySessionTerminated = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Apply session termination to local state
            return [
              4 /*yield*/,
              fetch("/api/session/sync/terminate", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: event.sessionId,
                  reason: event.data.reason,
                }),
              }),
            ];
          case 1:
            // Apply session termination to local state
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSyncManager.prototype.applyDeviceRegistered = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Apply device registration to local state
            return [
              4 /*yield*/,
              fetch("/api/devices/sync/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event.data),
              }),
            ];
          case 1:
            // Apply device registration to local state
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSyncManager.prototype.applyDeviceUpdated = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Apply device update to local state
            return [
              4 /*yield*/,
              fetch("/api/devices/sync/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  deviceId: event.data.deviceId,
                  updates: event.data.updates,
                }),
              }),
            ];
          case 1:
            // Apply device update to local state
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSyncManager.prototype.applyDeviceRemoved = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Apply device removal to local state
            return [
              4 /*yield*/,
              fetch("/api/devices/sync/remove", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  deviceId: event.data.deviceId,
                }),
              }),
            ];
          case 1:
            // Apply device removal to local state
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSyncManager.prototype.applyPreferencesUpdated = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Apply preferences update to local state
            return [
              4 /*yield*/,
              fetch("/api/users/sync/preferences", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: event.userId,
                  preferences: event.data.preferences,
                }),
              }),
            ];
          case 1:
            // Apply preferences update to local state
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSyncManager.prototype.applySecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // Apply security event to local state
            return [
              4 /*yield*/,
              fetch("/api/security/sync/event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event.data),
              }),
            ];
          case 1:
            // Apply security event to local state
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Broadcast sync event to other devices
   */
  SessionSyncManager.prototype.broadcastSyncEvent = function (type, sessionId, data) {
    return __awaiter(this, void 0, void 0, function () {
      var syncState, event, message;
      return __generator(this, function (_a) {
        if (!this.userId || !this.isConnected) return [2 /*return*/];
        syncState = this.syncStates.get(this.userId);
        if (!syncState) return [2 /*return*/];
        event = {
          id: this.utils.generateSessionToken(),
          type: type,
          userId: this.userId,
          sessionId: sessionId,
          deviceId: this.deviceId,
          data: data,
          timestamp: Date.now(),
          version: syncState.syncVersion + 1,
          checksum: this.calculateChecksum(data),
        };
        // Add to pending events
        syncState.pendingEvents.push(event);
        // Send via WebSocket
        if (this.webSocket) {
          message = {
            type: "sync_event",
            payload: event,
            timestamp: Date.now(),
            messageId: this.utils.generateSessionToken(),
            senderId: this.deviceId,
          };
          this.webSocket.send(JSON.stringify(message));
        }
        // Update sync version
        syncState.syncVersion++;
        return [2 /*return*/];
      });
    });
  };
  /**
   * Request full sync from server
   */
  SessionSyncManager.prototype.requestFullSync = function () {
    return __awaiter(this, void 0, void 0, function () {
      var message;
      var _a;
      return __generator(this, function (_b) {
        if (!this.userId || !this.isConnected || !this.webSocket) return [2 /*return*/];
        message = {
          type: "sync_request",
          payload: {
            action: "full_sync",
            userId: this.userId,
            deviceId: this.deviceId,
            lastSyncTimestamp:
              ((_a = this.syncStates.get(this.userId)) === null || _a === void 0
                ? void 0
                : _a.lastSyncTimestamp) || 0,
          },
          timestamp: Date.now(),
          messageId: this.utils.generateSessionToken(),
          senderId: this.deviceId,
        };
        this.webSocket.send(JSON.stringify(message));
        return [2 /*return*/];
      });
    });
  };
  /**
   * Utility methods
   */
  SessionSyncManager.prototype.mergeEventData = (localData, remoteDataArray) => {
    // Simple merge strategy - in production, implement proper conflict resolution
    var merged = __assign({}, localData);
    remoteDataArray.forEach((remoteData) => {
      merged = __assign(__assign({}, merged), remoteData);
    });
    return merged;
  };
  SessionSyncManager.prototype.calculateChecksum = (data) => {
    // Simple checksum calculation
    var str = JSON.stringify(data);
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  };
  SessionSyncManager.prototype.getDevicePriority = () => {
    // Device priority configuration
    return {
      desktop: 3,
      laptop: 2,
      tablet: 1,
      mobile: 0,
    };
  };
  SessionSyncManager.prototype.loadSyncDataFromStorage = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/sync/state/".concat(userId))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Error loading sync data from storage:", error_3);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSyncManager.prototype.startPeriodicSync = function () {
    this.syncInterval = setInterval(() => {
      if (this.isConnected) {
        this.requestFullSync();
      }
    }, 30000); // Sync every 30 seconds
  };
  SessionSyncManager.prototype.startHeartbeat = function () {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.webSocket) {
        var heartbeat = {
          type: "heartbeat",
          payload: {
            deviceId: this.deviceId,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
          messageId: this.utils.generateSessionToken(),
          senderId: this.deviceId,
        };
        this.webSocket.send(JSON.stringify(heartbeat));
      }
    }, 15000); // Heartbeat every 15 seconds
  };
  SessionSyncManager.prototype.attemptReconnection = function () {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }
    this.reconnectAttempts++;
    var delay = 2 ** this.reconnectAttempts * 1000; // Exponential backoff
    setTimeout(() => {
      console.log(
        "Attempting reconnection "
          .concat(this.reconnectAttempts, "/")
          .concat(this.maxReconnectAttempts),
      );
      this.connectToSyncServer().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  };
  SessionSyncManager.prototype.handleSyncRequest = (message) => {
    // Handle sync requests from other devices
    console.log("Received sync request:", message);
  };
  SessionSyncManager.prototype.handleSyncResponse = (message) => {
    // Handle sync responses
    console.log("Received sync response:", message);
  };
  SessionSyncManager.prototype.handleHeartbeat = function (message) {
    // Update device state
    if (this.userId) {
      var syncState = this.syncStates.get(this.userId);
      if (syncState) {
        var deviceState = syncState.deviceStates.get(message.senderId);
        if (deviceState) {
          deviceState.lastSeen = Date.now();
          deviceState.isOnline = true;
        }
      }
    }
  };
  SessionSyncManager.prototype.handleConflictNotification = function (conflict) {
    this.emit("conflict_notification", conflict);
  };
  SessionSyncManager.prototype.handleResolutionRequest = function (request) {
    this.emit("resolution_request", request);
  };
  SessionSyncManager.prototype.handleAcknowledgment = function (message) {
    // Remove acknowledged event from pending
    if (this.userId) {
      var syncState = this.syncStates.get(this.userId);
      if (syncState) {
        syncState.pendingEvents = syncState.pendingEvents.filter(
          (e) => e.id !== message.payload.eventId,
        );
      }
    }
  };
  SessionSyncManager.prototype.handleNegativeAcknowledgment = (message) => {
    // Handle failed sync events
    console.error("Sync event failed:", message.payload);
  };
  SessionSyncManager.prototype.sendAcknowledgment = function (eventId) {
    if (this.webSocket) {
      var ack = {
        type: "ack",
        payload: { eventId: eventId },
        timestamp: Date.now(),
        messageId: this.utils.generateSessionToken(),
        senderId: this.deviceId,
      };
      this.webSocket.send(JSON.stringify(ack));
    }
  };
  SessionSyncManager.prototype.applyConflictResolution = function (conflict, resolution) {
    return __awaiter(this, void 0, void 0, function () {
      var syncState, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Apply resolution
            return [4 /*yield*/, this.applySyncEvent(resolution)];
          case 1:
            // Apply resolution
            _a.sent();
            // Mark conflict as resolved
            conflict.resolvedAt = Date.now();
            conflict.resolvedBy = this.deviceId;
            conflict.resolution = resolution;
            // Remove from conflict queue
            if (this.userId) {
              syncState = this.syncStates.get(this.userId);
              if (syncState) {
                syncState.conflictQueue = syncState.conflictQueue.filter(
                  (c) => c.id !== conflict.id,
                );
              }
            }
            this.emit("conflict_resolved", conflict);
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error applying conflict resolution:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Event system
   */
  SessionSyncManager.prototype.on = function (event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  };
  SessionSyncManager.prototype.off = function (event, callback) {
    var listeners = this.eventListeners.get(event);
    if (listeners) {
      var index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
  SessionSyncManager.prototype.emit = function (event, data) {
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
  SessionSyncManager.prototype.isConnectedToSync = function () {
    return this.isConnected;
  };
  SessionSyncManager.prototype.getSyncState = function (userId) {
    return this.syncStates.get(userId);
  };
  SessionSyncManager.prototype.getPendingConflicts = function (userId) {
    var syncState = this.syncStates.get(userId);
    return syncState ? syncState.conflictQueue : [];
  };
  SessionSyncManager.prototype.resolveConflictManually = function (conflictId, resolution) {
    return __awaiter(this, void 0, void 0, function () {
      var syncState, conflict;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.userId) return [2 /*return*/, false];
            syncState = this.syncStates.get(this.userId);
            if (!syncState) return [2 /*return*/, false];
            conflict = syncState.conflictQueue.find((c) => c.id === conflictId);
            if (!conflict) return [2 /*return*/, false];
            return [4 /*yield*/, this.applyConflictResolution(conflict, resolution)];
          case 1:
            _a.sent();
            return [2 /*return*/, true];
        }
      });
    });
  };
  SessionSyncManager.prototype.cleanup = function () {
    var now = Date.now();
    var maxAge = 24 * 60 * 60 * 1000; // 24 hours
    // Clean up old sync states
    for (var _i = 0, _a = this.syncStates.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        userId = _b[0],
        syncState = _b[1];
      // Clean up old pending events
      syncState.pendingEvents = syncState.pendingEvents.filter((e) => now - e.timestamp < maxAge);
      // Clean up resolved conflicts
      syncState.conflictQueue = syncState.conflictQueue.filter(
        (c) => !c.resolvedAt || now - c.resolvedAt < maxAge,
      );
    }
  };
  SessionSyncManager.prototype.destroy = function () {
    // Stop intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    // Close WebSocket
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    // Clear state
    this.syncStates.clear();
    this.eventListeners.clear();
    this.isConnected = false;
  };
  return SessionSyncManager;
})();
exports.SessionSyncManager = SessionSyncManager;
exports.default = SessionSyncManager;
