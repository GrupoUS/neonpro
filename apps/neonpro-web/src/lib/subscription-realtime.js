"use strict";
/**
 * Real-time Subscription Status Validation System
 *
 * This module provides WebSocket integration for real-time subscription status
 * updates, enabling instant UI synchronization without page refreshes.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
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
exports.subscriptionRealtimeManager = exports.SubscriptionRealtimeManager = void 0;
exports.subscribeToUserUpdates = subscribeToUserUpdates;
exports.broadcastSubscriptionEvent = broadcastSubscriptionEvent;
exports.getRealtimeMetrics = getRealtimeMetrics;
exports.isRealtimeConnected = isRealtimeConnected;
var client_1 = require("../app/utils/supabase/client");
var SubscriptionRealtimeManager = /** @class */ (function () {
  function SubscriptionRealtimeManager(config) {
    if (config === void 0) {
      config = {};
    }
    var _a;
    this.supabase = (0, client_1.createClient)();
    this.channel = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.metrics = {
      connectionsActive: 0,
      messagesReceived: 0,
      messagesSent: 0,
      reconnectAttempts: 0,
      lastConnected: "",
      uptime: 0,
      latency: 0,
    };
    this.connectionStartTime = 0;
    this.lastHeartbeat = 0;
    this.config = {
      channel: config.channel || "subscription_updates",
      heartbeatInterval: config.heartbeatInterval || 30000, // 30 seconds
      reconnectInterval: config.reconnectInterval || 5000, // 5 seconds
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      enableLogging: (_a = config.enableLogging) !== null && _a !== void 0 ? _a : true,
    };
    // Auto-connect on instantiation
    this.connect();
  }
  /**
   * Establish real-time connection to subscription updates
   */
  SubscriptionRealtimeManager.prototype.connect = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _this = this;
      return __generator(this, function (_a) {
        try {
          if (this.isConnected) {
            this.log("Already connected to real-time subscription updates");
            return [2 /*return*/, true];
          }
          this.connectionStartTime = Date.now();
          this.log("Connecting to real-time subscription updates...");
          // Create channel for subscription updates
          this.channel = this.supabase.channel(this.config.channel, {
            config: {
              broadcast: { self: false },
              presence: { key: "subscription_status" },
            },
          });
          // Listen to subscription table changes
          this.channel
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "subscriptions",
              },
              function (payload) {
                return _this.handleSubscriptionChange(payload);
              },
            )
            .on("broadcast", { event: "subscription_event" }, function (payload) {
              return _this.handleBroadcastEvent(payload);
            })
            .on("presence", { event: "sync" }, function () {
              return _this.handlePresenceSync();
            })
            .subscribe(function (status, err) {
              if (status === "SUBSCRIBED") {
                _this.isConnected = true;
                _this.reconnectAttempts = 0;
                _this.metrics.connectionsActive = 1;
                _this.metrics.lastConnected = new Date().toISOString();
                _this.log("Successfully connected to real-time updates");
                _this.startHeartbeat();
              } else if (status === "CLOSED") {
                _this.handleDisconnection();
              } else if (err) {
                _this.log("Connection error: ".concat(err.message), "error");
                _this.scheduleReconnect();
              }
            });
          return [2 /*return*/, true];
        } catch (error) {
          this.log(
            "Failed to connect: ".concat(error instanceof Error ? error.message : "Unknown error"),
            "error",
          );
          this.scheduleReconnect();
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Disconnect from real-time updates
   */
  SubscriptionRealtimeManager.prototype.disconnect = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.channel) return [3 /*break*/, 2];
            return [4 /*yield*/, this.channel.unsubscribe()];
          case 1:
            _a.sent();
            this.channel = null;
            _a.label = 2;
          case 2:
            this.isConnected = false;
            this.metrics.connectionsActive = 0;
            this.stopHeartbeat();
            this.log("Disconnected from real-time updates");
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Subscribe to subscription status updates for a specific user
   */
  SubscriptionRealtimeManager.prototype.subscribe = function (userId, callback) {
    var _this = this;
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    this.listeners.get(userId).push(callback);
    this.log("Subscribed user ".concat(userId, " to real-time updates"));
    // Return unsubscribe function
    return function () {
      var userListeners = _this.listeners.get(userId);
      if (userListeners) {
        var index = userListeners.indexOf(callback);
        if (index > -1) {
          userListeners.splice(index, 1);
          if (userListeners.length === 0) {
            _this.listeners.delete(userId);
          }
        }
      }
      _this.log("Unsubscribed user ".concat(userId, " from real-time updates"));
    };
  };
  /**
   * Broadcast a subscription event to all connected clients
   */
  SubscriptionRealtimeManager.prototype.broadcast = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!this.channel || !this.isConnected) {
              this.log("Cannot broadcast: not connected to real-time channel", "warning");
              return [2 /*return*/, false];
            }
            return [
              4 /*yield*/,
              this.channel.send({
                type: "broadcast",
                event: "subscription_event",
                payload: event,
              }),
            ];
          case 1:
            _a.sent();
            this.metrics.messagesSent++;
            this.log("Broadcasted event: ".concat(event.event, " for user ").concat(event.userId));
            return [2 /*return*/, true];
          case 2:
            error_1 = _a.sent();
            this.log(
              "Failed to broadcast event: ".concat(
                error_1 instanceof Error ? error_1.message : "Unknown error",
              ),
              "error",
            );
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Force refresh subscription status for a user
   */
  SubscriptionRealtimeManager.prototype.forceRefresh = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, subscription, error, update, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("subscriptions").select("*").eq("user_id", userId).single(),
            ];
          case 1:
            (_a = _b.sent()), (subscription = _a.data), (error = _a.error);
            if (error) {
              this.log(
                "Failed to refresh subscription for user "
                  .concat(userId, ": ")
                  .concat(error.message),
                "error",
              );
              return [2 /*return*/];
            }
            if (subscription) {
              update = {
                event: "subscription_renewed",
                userId: userId,
                subscriptionId: subscription.id,
                status: subscription.status,
                timestamp: new Date().toISOString(),
                metadata: {
                  tier: subscription.tier,
                  gracePeriodEnd: subscription.current_period_end,
                  nextBilling: subscription.current_period_end,
                },
              };
              this.notifyListeners(update);
              this.log("Force refreshed subscription status for user ".concat(userId));
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _b.sent();
            this.log(
              "Failed to force refresh: ".concat(
                error_2 instanceof Error ? error_2.message : "Unknown error",
              ),
              "error",
            );
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get current real-time connection metrics
   */
  SubscriptionRealtimeManager.prototype.getMetrics = function () {
    if (this.connectionStartTime > 0) {
      this.metrics.uptime = Date.now() - this.connectionStartTime;
    }
    return __assign({}, this.metrics);
  };
  /**
   * Get connection status
   */
  SubscriptionRealtimeManager.prototype.isConnectedToRealtime = function () {
    return this.isConnected;
  };
  /**
   * Handle postgres subscription table changes
   */
  SubscriptionRealtimeManager.prototype.handleSubscriptionChange = function (payload) {
    try {
      this.metrics.messagesReceived++;
      var eventType = payload.eventType,
        newRecord = payload.new,
        oldRecord = payload.old;
      var event_1 = "subscription_renewed";
      var status_1 =
        (newRecord === null || newRecord === void 0 ? void 0 : newRecord.status) ||
        (oldRecord === null || oldRecord === void 0 ? void 0 : oldRecord.status);
      // Map postgres events to subscription events
      switch (eventType) {
        case "INSERT":
          event_1 = "subscription_activated";
          break;
        case "UPDATE":
          if (
            (oldRecord === null || oldRecord === void 0 ? void 0 : oldRecord.status) !==
            (newRecord === null || newRecord === void 0 ? void 0 : newRecord.status)
          ) {
            switch (newRecord.status) {
              case "active":
                event_1 = "subscription_activated";
                break;
              case "cancelled":
                event_1 = "subscription_cancelled";
                break;
              case "expired":
                event_1 = "subscription_expired";
                break;
              case "trialing":
                event_1 = "subscription_trial_ended";
                break;
            }
          } else if (
            (oldRecord === null || oldRecord === void 0 ? void 0 : oldRecord.tier) !==
            (newRecord === null || newRecord === void 0 ? void 0 : newRecord.tier)
          ) {
            event_1 =
              newRecord.tier > oldRecord.tier ? "subscription_upgraded" : "subscription_downgraded";
          }
          break;
        case "DELETE":
          event_1 = "subscription_cancelled";
          status_1 = "cancelled";
          break;
      }
      var record = newRecord || oldRecord;
      if (record) {
        var update = {
          event: event_1,
          userId: record.user_id,
          subscriptionId: record.id,
          status: status_1,
          previousStatus: oldRecord === null || oldRecord === void 0 ? void 0 : oldRecord.status,
          timestamp: new Date().toISOString(),
          metadata: {
            tier: record.tier,
            gracePeriodEnd: record.current_period_end,
            nextBilling: record.current_period_end,
          },
        };
        this.notifyListeners(update);
        this.log(
          "Processed subscription change: ".concat(event_1, " for user ").concat(record.user_id),
        );
      }
    } catch (error) {
      this.log(
        "Failed to handle subscription change: ".concat(
          error instanceof Error ? error.message : "Unknown error",
        ),
        "error",
      );
    }
  };
  /**
   * Handle broadcast events from other clients
   */
  SubscriptionRealtimeManager.prototype.handleBroadcastEvent = function (payload) {
    try {
      this.metrics.messagesReceived++;
      var update = payload.payload;
      this.notifyListeners(update);
      this.log(
        "Received broadcast event: ".concat(update.event, " for user ").concat(update.userId),
      );
    } catch (error) {
      this.log(
        "Failed to handle broadcast event: ".concat(
          error instanceof Error ? error.message : "Unknown error",
        ),
        "error",
      );
    }
  };
  /**
   * Handle presence sync events
   */
  SubscriptionRealtimeManager.prototype.handlePresenceSync = function () {
    if (this.channel) {
      var presenceState = this.channel.presenceState();
      var activeClients = Object.keys(presenceState).length;
      this.log("Presence sync: ".concat(activeClients, " active clients"));
    }
  };
  /**
   * Notify registered listeners of subscription updates
   */
  SubscriptionRealtimeManager.prototype.notifyListeners = function (update) {
    var _this = this;
    var listeners = this.listeners.get(update.userId);
    if (listeners) {
      listeners.forEach(function (callback) {
        try {
          callback(update);
        } catch (error) {
          _this.log(
            "Listener error for user "
              .concat(update.userId, ": ")
              .concat(error instanceof Error ? error.message : "Unknown error"),
            "error",
          );
        }
      });
    }
  };
  /**
   * Handle connection loss and attempt reconnection
   */
  SubscriptionRealtimeManager.prototype.handleDisconnection = function () {
    this.isConnected = false;
    this.metrics.connectionsActive = 0;
    this.stopHeartbeat();
    this.log("Connection lost, scheduling reconnect...");
    this.scheduleReconnect();
  };
  /**
   * Schedule reconnection attempt
   */
  SubscriptionRealtimeManager.prototype.scheduleReconnect = function () {
    var _this = this;
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log(
        "Max reconnection attempts (".concat(this.config.maxReconnectAttempts, ") reached"),
        "error",
      );
      return;
    }
    this.reconnectAttempts++;
    this.metrics.reconnectAttempts++;
    setTimeout(function () {
      _this.log(
        "Reconnection attempt "
          .concat(_this.reconnectAttempts, "/")
          .concat(_this.config.maxReconnectAttempts),
      );
      _this.connect();
    }, this.config.reconnectInterval * this.reconnectAttempts); // Exponential backoff
  };
  /**
   * Start heartbeat monitoring
   */
  SubscriptionRealtimeManager.prototype.startHeartbeat = function () {
    var _this = this;
    this.lastHeartbeat = Date.now();
    var heartbeatCheck = function () {
      if (_this.isConnected) {
        var now = Date.now();
        _this.metrics.latency = now - _this.lastHeartbeat;
        _this.lastHeartbeat = now;
        // Send heartbeat
        if (_this.channel) {
          _this.channel.send({
            type: "broadcast",
            event: "heartbeat",
            payload: { timestamp: now },
          });
        }
        setTimeout(heartbeatCheck, _this.config.heartbeatInterval);
      }
    };
    setTimeout(heartbeatCheck, this.config.heartbeatInterval);
  };
  /**
   * Stop heartbeat monitoring
   */
  SubscriptionRealtimeManager.prototype.stopHeartbeat = function () {
    this.lastHeartbeat = 0;
  };
  /**
   * Internal logging utility
   */
  SubscriptionRealtimeManager.prototype.log = function (message, level) {
    if (level === void 0) {
      level = "info";
    }
    if (this.config.enableLogging) {
      var timestamp = new Date().toISOString();
      var prefix = "[SubscriptionRealtime:".concat(level.toUpperCase(), "]");
      switch (level) {
        case "error":
          console.error("".concat(prefix, " ").concat(timestamp, " - ").concat(message));
          break;
        case "warning":
          console.warn("".concat(prefix, " ").concat(timestamp, " - ").concat(message));
          break;
        default:
          console.log("".concat(prefix, " ").concat(timestamp, " - ").concat(message));
      }
    }
  };
  return SubscriptionRealtimeManager;
})();
exports.SubscriptionRealtimeManager = SubscriptionRealtimeManager;
// Singleton instance for application-wide use
exports.subscriptionRealtimeManager = new SubscriptionRealtimeManager({
  enableLogging: process.env.NODE_ENV === "development",
});
// Helper functions for common operations
function subscribeToUserUpdates(userId, callback) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2 /*return*/, exports.subscriptionRealtimeManager.subscribe(userId, callback)];
    });
  });
}
function broadcastSubscriptionEvent(event) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2 /*return*/, exports.subscriptionRealtimeManager.broadcast(event)];
    });
  });
}
function getRealtimeMetrics() {
  return exports.subscriptionRealtimeManager.getMetrics();
}
function isRealtimeConnected() {
  return exports.subscriptionRealtimeManager.isConnectedToRealtime();
}
